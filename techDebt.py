import os
import json
import subprocess
import tempfile
import shutil
from typing import Dict, Any, List, Tuple
from langgraph.graph import StateGraph, END
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
import re
import warnings
from typing import Optional
import logging
from dotenv import load_dotenv
load_dotenv()

# Suppress urllib3 warning for LibreSSL
warnings.filterwarnings("ignore", category=UserWarning, module="urllib3")

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Cache for recommendations
recommendation_cache = {}

# State to hold analysis data
class AnalysisState(BaseModel):
    repo_url: str = ""
    repo_path: str = ""
    github_token: str = ""
    tool_outputs: Dict[str, Any] = {}
    scores: Dict[str, float] = {}
    issues: List[Tuple[str, int]] = []
    recommendations: List[str] = []
    model_name: str = "gpt-3.5-turbo"
    use_cache: bool = True
    temp_dir: str = ""
    is_valid_repo: bool = False

# Helper function to get top issues
def get_top_issues(issues: List[Tuple[str, int]], n: int = 5) -> List[str]:
    sorted_issues = sorted(issues, key=lambda x: x[1], reverse=True)
    return [issue[0] for issue in sorted_issues[:n]]

# Helper function for caching
def get_cached_recommendations(issue_messages: List[str]) -> Optional[List[str]]:
    key = tuple(sorted(issue_messages))
    return recommendation_cache.get(key, None)

# Agent: Repository Fetcher
def fetch_repo(state: AnalysisState) -> AnalysisState:
    """Clones or validates the repo from GitHub or local path."""
    logger.info(f"Fetching repo: url={state.repo_url}, path={state.repo_path}")
    state.tool_outputs["repo_structure"] = {"files": [], "readme": False}
    if state.repo_url:
        if not re.match(r"https?://github\.com/[\w-]+/[\w-]+(\.git)?", state.repo_url):
            state.issues.append(("Invalid GitHub repository URL", 3))
            logger.error("Invalid GitHub URL")
            return state

        temp_dir = tempfile.mkdtemp(prefix="tech_debt_repo_")
        state.temp_dir = temp_dir
        state.repo_path = temp_dir

        github_token = state.github_token or os.getenv("GITHUB_TOKEN", "")
        if not github_token:
            state.issues.append(("GitHub token not provided", 3))
            logger.error("GitHub token missing")
            return state

        auth_url = state.repo_url.replace("https://", f"https://{github_token}@")
        try:
            subprocess.run(
                ["git", "clone", "--depth", "1", auth_url, temp_dir],
                check=True, capture_output=True, text=True
            )
            state.is_valid_repo = True
            logger.info("Repo cloned successfully")
        except subprocess.CalledProcessError as e:
            state.issues.append((f"Failed to clone repository: {e.stderr}", 3))
            logger.error(f"Clone failed: {e.stderr}")
            return state
    else:
        if not os.path.exists(state.repo_path):
            state.issues.append((f"Repository path {state.repo_path} does not exist", 3))
            logger.error("Local repo path invalid")
            return state
        state.is_valid_repo = True

    try:
        state.tool_outputs["repo_structure"] = {
            "files": [f for f in os.listdir(state.repo_path) if f.endswith(('.py', '.js', '.ts'))],
            "readme": os.path.exists(os.path.join(state.repo_path, "README.md"))
        }
        logger.info(f"Repo structure: {state.tool_outputs['repo_structure']}")
    except Exception as e:
        state.issues.append((f"Failed to analyze repo structure: {str(e)}", 3))
        state.is_valid_repo = False
        logger.error(f"Repo structure analysis failed: {str(e)}")
    return state

# Agent: Static Analysis (Code Quality with pylint)
def analyze_code_quality(state: AnalysisState) -> AnalysisState:
    """Runs pylint for code quality analysis."""
    logger.info("Running code quality analysis")
    if not state.is_valid_repo:
        state.scores["code_quality"] = 0
        state.issues.append(("Skipping code quality analysis due to invalid repo", 2))
        logger.warning("Skipping code quality due to invalid repo")
        return state
    try:
        result = subprocess.run(
            ["pylint", "--output-format=json", state.repo_path],
            capture_output=True, text=True
        )
        pylint_output = json.loads(result.stdout)
        pylint_severity_map = {"error": 3, "warning": 2, "refactor": 1, "convention": 0}
        issues = [(issue["message"], pylint_severity_map.get(issue["type"], 0)) for issue in pylint_output]
        state.tool_outputs["pylint"] = pylint_output
        state.scores["code_quality"] = max(0, 10 - len(issues) * 0.5)
        state.issues.extend(issues)
        logger.info(f"Code quality score: {state.scores['code_quality']}")
    except Exception as e:
        state.scores["code_quality"] = 0
        state.issues.append((f"Code quality analysis failed: {str(e)}", 3))
        logger.error(f"Code quality analysis failed: {str(e)}")
    return state

# Agent: Security Analysis (Bandit)
def analyze_security(state: AnalysisState) -> AnalysisState:
    """Runs bandit for security analysis."""
    logger.info("Running security analysis")
    if not state.is_valid_repo:
        state.scores["security"] = 0
        state.issues.append(("Skipping security analysis due to invalid repo", 2))
        logger.warning("Skipping security due to invalid repo")
        return state
    try:
        result = subprocess.run(
            ["bandit", "-r", state.repo_path, "--format=json"],
            capture_output=True, text=True
        )
        bandit_output = json.loads(result.stdout)
        bandit_severity_map = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
        issues = [(issue["issue_text"], bandit_severity_map.get(issue["issue_severity"], 0))
                  for issue in bandit_output.get("results", [])]
        state.tool_outputs["bandit"] = bandit_output
        state.scores["security"] = max(0, 10 - len(issues) * 1.0)
        state.issues.extend(issues)
        logger.info(f"Security score: {state.scores['security']}")
    except Exception as e:
        state.scores["security"] = 0
        state.issues.append((f"Security analysis failed: {str(e)}", 3))
        logger.error(f"Security analysis failed: {str(e)}")
    return state

# Agent: Documentation Analysis
def analyze_documentation(state: AnalysisState) -> AnalysisState:
    """Analyzes README and code comments."""
    logger.info("Running documentation analysis")
    if not state.is_valid_repo or "repo_structure" not in state.tool_outputs:
        state.scores["documentation"] = 0
        state.issues.append(("Skipping documentation analysis due to invalid repo", 2))
        logger.warning("Skipping documentation due to invalid repo")
        return state
    has_readme = state.tool_outputs["repo_structure"]["readme"]
    comment_count = 0
    for file in state.tool_outputs["repo_structure"]["files"]:
        try:
            with open(os.path.join(state.repo_path, file), "r", encoding="utf-8") as f:
                lines = f.readlines()
                comment_count += sum(1 for line in lines if line.strip().startswith("#"))
        except Exception as e:
            state.issues.append((f"Failed to read file {file}: {str(e)}", 1))
            logger.warning(f"Failed to read file {file}: {str(e)}")
    score = 8 if has_readme else 4
    score += min(comment_count * 0.1, 2)
    state.scores["documentation"] = score
    if not has_readme:
        state.issues.append(("Missing README.md", 2))
    if comment_count < 5:
        state.issues.append(("Low inline documentation", 1))
    logger.info(f"Documentation score: {state.scores['documentation']}")
    return state

# Agent: LLM Summarizer
def summarize_results(state: AnalysisState) -> AnalysisState:
    """Uses LLM to generate concise recommendations based on top issues."""
    logger.info("Running summarization")
    if state.use_cache:
        issue_messages = [issue[0] for issue in state.issues]
        cached_recs = get_cached_recommendations(issue_messages)
        if cached_recs:
            state.recommendations = cached_recs
            logger.info("Using cached recommendations")
            return state
    llm = ChatOpenAI(model=state.model_name, temperature=0)
    top_issues = get_top_issues(state.issues)
    prompt = ChatPromptTemplate.from_template("""
    You are a Tech Debt Analysis Agent. Given the following top issues, generate concise recommendations to improve the repository:

    Top Issues: {top_issues}

    Provide a list of short, actionable recommendations.
    """)
    chain = prompt | llm
    response = chain.invoke({"top_issues": top_issues})
    state.recommendations = response.content.split("\n")[:5]
    if state.use_cache:
        recommendation_cache[tuple(sorted(issue_messages))] = state.recommendations
    state.scores["overall"] = sum(state.scores.values()) / len(state.scores) if state.scores else 0
    logger.info(f"Overall score: {state.scores['overall']}")
    return state

# Agent: Cleanup
def cleanup_temp_dir(state: AnalysisState) -> AnalysisState:
    """Removes temporary directory if used."""
    logger.info("Cleaning up temporary directory")
    if state.temp_dir and os.path.exists(state.temp_dir):
        shutil.rmtree(state.temp_dir)
        state.temp_dir = ""
    return state

# Build LangGraph Workflow
workflow = StateGraph(AnalysisState)
workflow.add_node("fetch_repo", fetch_repo)
workflow.add_node("analyze_code_quality", analyze_code_quality)
workflow.add_node("analyze_security", analyze_security)
workflow.add_node("analyze_documentation", analyze_documentation)
workflow.add_node("summarize_results", summarize_results)
workflow.add_node("cleanup_temp_dir", cleanup_temp_dir)

# Define edges (serialized to avoid concurrent updates)
workflow.set_entry_point("fetch_repo")
workflow.add_conditional_edges(
    "fetch_repo",
    lambda state: "analyze_code_quality" if state.is_valid_repo else "cleanup_temp_dir"
)
workflow.add_edge("analyze_code_quality", "analyze_security")
workflow.add_edge("analyze_security", "analyze_documentation")
workflow.add_edge("analyze_documentation", "summarize_results")
workflow.add_edge("summarize_results", "cleanup_temp_dir")
workflow.add_edge("cleanup_temp_dir", END)

# Compile and run
app = workflow.compile()

def analyze_repo(repo_url: str = "", repo_path: str = "", github_token: str = "", optimization_level: str = "balanced") -> Dict[str, Any]:
    """Main function to analyze a repo with optimization options."""
    logger.info(f"Starting analysis: url={repo_url}, path={repo_path}, optimization={optimization_level}")
    if not (repo_url or repo_path):
        logger.error("No repo URL or path provided")
        raise ValueError("Either repo_url or repo_path must be provided")
    if optimization_level == "fast":
        model_name = "gpt-3.5-turbo"
        use_cache = True
    elif optimization_level == "detailed":
        model_name = "gpt-4o"
        use_cache = False
    else:
        model_name = "gpt-3.5-turbo"
        use_cache = True
    state = AnalysisState(
        repo_url=repo_url,
        repo_path=repo_path,
        github_token=github_token,
        model_name=model_name,
        use_cache=use_cache
    )
    result = app.invoke(state)
    logger.info("Analysis complete")
    return {
        "overall_score": result["scores"].get("overall", 0),
        "categories": result["scores"],
        "issues": [issue[0] for issue in result["issues"]],
        "recommendations": result["recommendations"]
    }

if __name__ == "__main__":
    # Example usage with a public repo
    optimization = os.getenv("OPTIMIZATION_LEVEL", "balanced")
    github_token = os.getenv("GITHUB_TOKEN", "")
    repo_url = "https://github.com/Sudarssan-N/Tamil-Character-Reocognition"  # Public repo for testing
    result = analyze_repo(repo_url=repo_url, github_token=github_token, optimization_level=optimization)
    print(json.dumps(result, indent=2))
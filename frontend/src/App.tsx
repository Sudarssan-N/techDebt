import React, { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  Shield, 
  Code, 
  AlertCircle, 
  Download, 
  MessageSquare,
  Filter,
  Search,
  CheckSquare,
  Square,
  Send,
  Clock,
  Github,
  ChevronDown,
  GitBranch,
  Star,
  Users
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Issue {
  id: string;
  issue: string;
  severity: 'High' | 'Medium' | 'Low';
  filePath: string;
  category: 'code-quality' | 'security' | 'documentation';
  selected: boolean;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  lastUpdated: string;
  branch: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository>({
    id: '1',
    name: 'banking-core-api',
    fullName: 'wellsfargo/banking-core-api',
    description: 'Core banking API services and authentication',
    language: 'TypeScript',
    stars: 234,
    forks: 45,
    lastUpdated: '2 hours ago',
    branch: 'main'
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your Tech Debt Assistant. I can help you understand your codebase issues, provide recommendations, and answer questions about your technical debt. How can I help you today?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const repositories: Repository[] = [
    {
      id: '1',
      name: 'banking-core-api',
      fullName: 'wellsfargo/banking-core-api',
      description: 'Core banking API services and authentication',
      language: 'TypeScript',
      stars: 234,
      forks: 45,
      lastUpdated: '2 hours ago',
      branch: 'main'
    },
    {
      id: '2',
      name: 'customer-portal',
      fullName: 'wellsfargo/customer-portal',
      description: 'Customer-facing web portal and dashboard',
      language: 'React',
      stars: 189,
      forks: 32,
      lastUpdated: '1 day ago',
      branch: 'develop'
    },
    {
      id: '3',
      name: 'payment-processing',
      fullName: 'wellsfargo/payment-processing',
      description: 'Payment processing and transaction handling',
      language: 'Java',
      stars: 156,
      forks: 28,
      lastUpdated: '3 days ago',
      branch: 'main'
    },
    {
      id: '4',
      name: 'mobile-app-backend',
      fullName: 'wellsfargo/mobile-app-backend',
      description: 'Backend services for mobile banking application',
      language: 'Node.js',
      stars: 98,
      forks: 19,
      lastUpdated: '5 days ago',
      branch: 'staging'
    }
  ];

  const techDebtScores = {
    codeQuality: 6.5,
    security: 7.2,
    documentation: 4.8,
    overall: 6.2
  };

  const codebaseSummary = {
    totalFiles: 1247,
    totalLines: 89432,
    totalComments: 12847,
    commentRatio: 14.4,
    readmePresent: true
  };

  const recommendations = [
    'Improve documentation coverage by adding missing README files and inline comments',
    'Address 23 high-severity security vulnerabilities in dependencies',
    'Refactor 15 large functions exceeding complexity thresholds',
    'Update deprecated API usage in authentication modules',
    'Implement automated code quality checks in CI/CD pipeline',
    'Add comprehensive unit tests for critical payment processing functions'
  ];

  const allIssues: Issue[] = [
    {
      id: '1',
      issue: 'Function complexity exceeds threshold (25)',
      severity: 'High',
      filePath: '/src/utils/dataProcessor.ts',
      category: 'code-quality',
      selected: false
    },
    {
      id: '2',
      issue: 'Missing input validation',
      severity: 'High',
      filePath: '/src/api/userController.ts',
      category: 'security',
      selected: false
    },
    {
      id: '3',
      issue: 'Missing JSDoc comments',
      severity: 'Medium',
      filePath: '/src/components/Dashboard.tsx',
      category: 'documentation',
      selected: false
    },
    {
      id: '4',
      issue: 'Unused import statements',
      severity: 'Low',
      filePath: '/src/hooks/useAuth.ts',
      category: 'code-quality',
      selected: false
    },
    {
      id: '5',
      issue: 'Potential SQL injection vulnerability',
      severity: 'High',
      filePath: '/src/database/queries.ts',
      category: 'security',
      selected: false
    },
    {
      id: '6',
      issue: 'Missing README in module',
      severity: 'Medium',
      filePath: '/src/modules/payments/',
      category: 'documentation',
      selected: false
    },
    {
      id: '7',
      issue: 'Hardcoded API endpoints',
      severity: 'Medium',
      filePath: '/src/config/endpoints.ts',
      category: 'code-quality',
      selected: false
    },
    {
      id: '8',
      issue: 'Weak password validation',
      severity: 'High',
      filePath: '/src/auth/validation.ts',
      category: 'security',
      selected: false
    },
    {
      id: '9',
      issue: 'Missing API documentation',
      severity: 'High',
      filePath: '/src/api/routes.ts',
      category: 'documentation',
      selected: false
    }
  ];

  const filteredIssues = allIssues.filter(issue => {
    const matchesSeverity = filterSeverity === 'all' || issue.severity.toLowerCase() === filterSeverity;
    const matchesSearch = issue.issue.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         issue.filePath.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const toggleIssueSelection = (issueId: string) => {
    setSelectedIssues(prev => 
      prev.includes(issueId) 
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const selectAllIssues = () => {
    setSelectedIssues(filteredIssues.map(issue => issue.id));
  };

  const deselectAllIssues = () => {
    setSelectedIssues([]);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `Based on your current tech debt score of **${techDebtScores.overall}/10** for **${selectedRepo.name}**, I recommend focusing on the **high-severity security issues** first. Here are the priority items:\n\n1. **SQL Injection Vulnerability** in \`/src/database/queries.ts\`\n2. **Missing Input Validation** in \`/src/api/userController.ts\`\n3. **Weak Password Validation** in \`/src/auth/validation.ts\`\n\nWould you like me to provide specific code fixes for these issues?`,
        `Your documentation score is currently **${techDebtScores.documentation}/10**. To improve this:\n\n\`\`\`typescript\n/**\n * Processes user authentication data\n * @param userData - User credentials object\n * @returns Promise<AuthResult>\n */\nfunction authenticateUser(userData: UserCredentials): Promise<AuthResult> {\n  // Implementation here\n}\n\`\`\`\n\nThis type of JSDoc commenting would significantly improve your documentation coverage for **${selectedRepo.name}**.`,
        `The complexity issue in \`dataProcessor.ts\` can be resolved by breaking down the large function:\n\n\`\`\`typescript\n// Before: Single complex function\nfunction processData(data: unknown[]): ProcessedData {\n  // 50+ lines of complex logic\n}\n\n// After: Broken into smaller functions\nfunction validateData(data: unknown[]): ValidatedData {\n  // validation logic\n}\n\nfunction transformData(data: ValidatedData): TransformedData {\n  // transformation logic\n}\n\`\`\`\n\nThis refactoring will improve the code quality score for **${selectedRepo.name}**.`
      ];

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const downloadPDFReport = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    pdf.setFillColor(211, 47, 47); // Wells Fargo red
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Wells Fargo', 20, 15);
    pdf.setFontSize(14);
    pdf.text('Tech Debt Management Report', 20, 25);

    // Repository info
    yPosition = 45;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Repository Information', 20, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Repository: ${selectedRepo.fullName}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Description: ${selectedRepo.description}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Language: ${selectedRepo.language}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Branch: ${selectedRepo.branch}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, yPosition);

    // Tech Debt Scores
    yPosition += 15;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Tech Debt Scores', 20, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Overall Score: ${techDebtScores.overall}/10`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Code Quality: ${techDebtScores.codeQuality}/10`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Security: ${techDebtScores.security}/10`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Documentation: ${techDebtScores.documentation}/10`, 20, yPosition);

    // Codebase Summary
    yPosition += 15;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Codebase Summary', 20, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Files: ${codebaseSummary.totalFiles.toLocaleString()}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Total Lines: ${codebaseSummary.totalLines.toLocaleString()}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Total Comments: ${codebaseSummary.totalComments.toLocaleString()}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Comment Ratio: ${codebaseSummary.commentRatio}%`, 20, yPosition);
    yPosition += 6;
    pdf.text(`README Present: ${codebaseSummary.readmePresent ? 'Yes' : 'No'}`, 20, yPosition);

    // Recommendations
    yPosition += 15;
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recommendations', 20, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    recommendations.forEach((rec, index) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      const lines = pdf.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
      pdf.text(lines, 20, yPosition);
      yPosition += lines.length * 6;
    });

    // Issues by Category
    const categories = [
      { name: 'High Priority Issues', issues: allIssues.filter(i => i.severity === 'High') },
      { name: 'Security Issues', issues: allIssues.filter(i => i.category === 'security') },
      { name: 'Code Quality Issues', issues: allIssues.filter(i => i.category === 'code-quality') },
      { name: 'Documentation Issues', issues: allIssues.filter(i => i.category === 'documentation') }
    ];

    categories.forEach(category => {
      if (category.issues.length === 0) return;
      
      yPosition += 15;
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(category.name, 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      category.issues.forEach((issue, index) => {
        if (yPosition > pageHeight - 15) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.text(`${index + 1}. ${issue.issue}`, 20, yPosition);
        yPosition += 5;
        pdf.text(`   Severity: ${issue.severity} | File: ${issue.filePath}`, 25, yPosition);
        yPosition += 8;
      });
    });

    // Save the PDF
    pdf.save(`tech-debt-report-${selectedRepo.name}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering for code blocks and bold text
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded mt-2 mb-2 overflow-x-auto"><code>$2</code></pre>')
      .split('\n')
      .map(line => line.trim() ? `<p>${line}</p>` : '<br>')
      .join('');
  };

  const renderIssueTable = (issues: Issue[], title: string) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button 
                  onClick={selectedIssues.length === issues.length ? deselectAllIssues : selectAllIssues}
                  className="flex items-center space-x-2"
                >
                  {selectedIssues.length === issues.length ? 
                    <CheckSquare className="w-4 h-4" /> : 
                    <Square className="w-4 h-4" />
                  }
                  <span>Select</span>
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Path</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {issues.map((issue) => (
              <tr key={issue.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleIssueSelection(issue.id)}
                    className="flex items-center"
                  >
                    {selectedIssues.includes(issue.id) ? 
                      <CheckSquare className="w-4 h-4 text-red-600" /> : 
                      <Square className="w-4 h-4 text-gray-400" />
                    }
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{issue.issue}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(issue.severity)}`}>
                    {issue.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{issue.filePath}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold">Wells Fargo</div>
              <div className="text-lg">Tech Debt Management</div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Repository Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowRepoDropdown(!showRepoDropdown)}
                  className="flex items-center space-x-2 bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span className="max-w-48 truncate">{selectedRepo.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showRepoDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-2">
                      {repositories.map((repo) => (
                        <button
                          key={repo.id}
                          onClick={() => {
                            setSelectedRepo(repo);
                            setShowRepoDropdown(false);
                          }}
                          className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                            selectedRepo.id === repo.id ? 'bg-red-50 border border-red-200' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{repo.name}</div>
                              <div className="text-sm text-gray-600 mt-1">{repo.description}</div>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                                  {repo.language}
                                </span>
                                <span className="flex items-center">
                                  <Star className="w-3 h-3 mr-1" />
                                  {repo.stars}
                                </span>
                                <span className="flex items-center">
                                  <GitBranch className="w-3 h-3 mr-1" />
                                  {repo.branch}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={downloadPDFReport}
                className="flex items-center space-x-2 bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Repository Info Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span className="flex items-center">
                <Github className="w-4 h-4 mr-2" />
                {selectedRepo.fullName}
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                {selectedRepo.language}
              </span>
              <span className="flex items-center">
                <Star className="w-4 h-4 mr-1" />
                {selectedRepo.stars}
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {selectedRepo.forks} forks
              </span>
              <span className="flex items-center">
                <GitBranch className="w-4 h-4 mr-1" />
                {selectedRepo.branch}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Updated {selectedRepo.lastUpdated}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview' 
                  ? 'border-red-500 text-red-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'issues' 
                  ? 'border-red-500 text-red-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Issues
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chat' 
                  ? 'border-red-500 text-red-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              AI Assistant
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Tech Debt Scores */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overall Score</p>
                    <p className={`text-3xl font-bold ${getScoreColor(techDebtScores.overall)}`}>
                      {techDebtScores.overall}/10
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreBarColor(techDebtScores.overall)}`}
                      style={{ width: `${techDebtScores.overall * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Code Quality</p>
                    <p className={`text-3xl font-bold ${getScoreColor(techDebtScores.codeQuality)}`}>
                      {techDebtScores.codeQuality}/10
                    </p>
                  </div>
                  <Code className="w-8 h-8 text-gray-400" />
                </div>
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreBarColor(techDebtScores.codeQuality)}`}
                      style={{ width: `${techDebtScores.codeQuality * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Security</p>
                    <p className={`text-3xl font-bold ${getScoreColor(techDebtScores.security)}`}>
                      {techDebtScores.security}/10
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-gray-400" />
                </div>
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreBarColor(techDebtScores.security)}`}
                      style={{ width: `${techDebtScores.security * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Documentation</p>
                    <p className={`text-3xl font-bold ${getScoreColor(techDebtScores.documentation)}`}>
                      {techDebtScores.documentation}/10
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreBarColor(techDebtScores.documentation)}`}
                      style={{ width: `${techDebtScores.documentation * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Codebase Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Codebase Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{codebaseSummary.totalFiles.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Files</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{codebaseSummary.totalLines.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Lines</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{codebaseSummary.totalComments.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Comments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{codebaseSummary.commentRatio}%</p>
                  <p className="text-sm text-gray-600">Comment Ratio</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{codebaseSummary.readmePresent ? 'Yes' : 'No'}</p>
                  <p className="text-sm text-gray-600">README Present</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>
              <ul className="space-y-3">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-red-600 text-sm font-medium">{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{rec}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                    >
                      <option value="all">All Severities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search issues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-64"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{selectedIssues.length} selected</span>
                  {selectedIssues.length > 0 && (
                    <button className="text-red-600 hover:text-red-700 font-medium">
                      Fix Selected Issues
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* All Issues Table */}
            {renderIssueTable(filteredIssues, 'All Issues')}

            {/* Category-specific tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {renderIssueTable(
                filteredIssues.filter(issue => issue.category === 'code-quality'),
                'Code Quality Issues'
              )}
              {renderIssueTable(
                filteredIssues.filter(issue => issue.category === 'security'),
                'Security Issues'
              )}
              {renderIssueTable(
                filteredIssues.filter(issue => issue.category === 'documentation'),
                'Documentation Issues'
              )}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-96 flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div 
                      className="text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: message.type === 'assistant' ? renderMarkdown(message.content) : message.content 
                      }}
                    />
                    <div className={`text-xs mt-1 flex items-center ${
                      message.type === 'user' ? 'text-red-100' : 'text-gray-500'
                    }`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleChatSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about your tech debt..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
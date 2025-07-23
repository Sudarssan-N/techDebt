import React, { useState } from 'react';
import { ArrowLeft, Building2, Users, GitBranch, FileText, Shield, Wrench, Code, Server, Zap } from 'lucide-react';

// Mock data for the dashboard
const mockData = {
  departments: [
    {
      id: 'small-business',
      name: 'Small Business Banking',
      icon: Building2,
      scores: { code: 3.2, documentation: 6.8, test: 4.1, architecture: 2.9, infrastructure: 5.3, devops: 7.2 },
      overall: 4.9,
      subGroups: [
        { id: 'lending', name: 'Commercial Lending', repos: 12 },
        { id: 'accounts', name: 'Business Accounts', repos: 8 },
        { id: 'payments', name: 'Payment Processing', repos: 15 }
      ]
    },
    {
      id: 'consumer-tech',
      name: 'Consumer Technology',
      icon: Users,
      scores: { code: 5.7, documentation: 4.2, test: 6.3, architecture: 5.1, infrastructure: 4.8, devops: 6.1 },
      overall: 5.4,
      subGroups: [
        { id: 'mobile', name: 'Mobile Banking', repos: 18 },
        { id: 'web', name: 'Web Platform', repos: 22 },
        { id: 'apis', name: 'Consumer APIs', repos: 16 }
      ]
    },
    {
      id: 'corporate-investment',
      name: 'Corporate & Investment',
      icon: GitBranch,
      scores: { code: 2.1, documentation: 3.4, test: 2.8, architecture: 1.9, infrastructure: 3.2, devops: 4.1 },
      overall: 2.9,
      subGroups: [
        { id: 'trading', name: 'Trading Systems', repos: 25 },
        { id: 'risk', name: 'Risk Management', repos: 19 },
        { id: 'compliance', name: 'Compliance Tools', repos: 14 }
      ]
    },
    {
      id: 'wealth-management',
      name: 'Wealth Management',
      icon: FileText,
      scores: { code: 6.2, documentation: 7.8, test: 5.9, architecture: 6.7, infrastructure: 7.1, devops: 8.3 },
      overall: 7.0,
      subGroups: [
        { id: 'advisory', name: 'Investment Advisory', repos: 10 },
        { id: 'portfolio', name: 'Portfolio Management', repos: 14 },
        { id: 'reporting', name: 'Client Reporting', repos: 9 }
      ]
    },
    {
      id: 'security',
      name: 'Cybersecurity',
      icon: Shield,
      scores: { code: 1.8, documentation: 2.3, test: 1.5, architecture: 1.2, infrastructure: 2.1, devops: 2.8 },
      overall: 2.0,
      subGroups: [
        { id: 'fraud', name: 'Fraud Detection', repos: 16 },
        { id: 'identity', name: 'Identity Management', repos: 12 },
        { id: 'monitoring', name: 'Security Monitoring', repos: 20 }
      ]
    },
    {
      id: 'infrastructure',
      name: 'Technology Infrastructure',
      icon: Server,
      scores: { code: 4.3, documentation: 5.6, test: 7.2, architecture: 4.8, infrastructure: 3.9, devops: 5.1 },
      overall: 5.2,
      subGroups: [
        { id: 'cloud', name: 'Cloud Platform', repos: 28 },
        { id: 'data', name: 'Data Engineering', repos: 21 },
        { id: 'devops', name: 'DevOps Tools', repos: 17 }
      ]
    }
  ]
};

const getScoreColor = (score: number) => {
  if (score <= 3) return 'bg-green-500';
  if (score <= 7) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getScoreTextColor = (score: number) => {
  if (score <= 3) return 'text-green-600';
  if (score <= 7) return 'text-yellow-600';
  return 'text-red-600';
};

const ScoreCard: React.FC<{ title: string; score: number; icon: React.ReactNode }> = ({ title, score, icon }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm border">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-600">{title}</span>
      {icon}
    </div>
    <div className="flex items-baseline">
      <span className={`text-2xl font-bold ${getScoreTextColor(score)}`}>
        {score.toFixed(1)}
      </span>
      <span className="text-gray-400 ml-1">/10</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
      <div 
        className={`h-2 rounded-full ${getScoreColor(score)}`}
        style={{ width: `${(score / 10) * 100}%` }}
      />
    </div>
  </div>
);

const DepartmentCard: React.FC<{
  department: any;
  onClick: () => void;
  isHovered: boolean;
  onHover: (hover: boolean) => void;
}> = ({ department, onClick, isHovered, onHover }) => {
  const IconComponent = department.icon;
  
  return (
    <div
      className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div className="flex items-center mb-4">
        <IconComponent className="h-8 w-8 text-red-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
      </div>
      
      <div className="mb-4">
        <div className="flex items-baseline">
          <span className={`text-3xl font-bold ${getScoreTextColor(department.overall)}`}>
            {department.overall.toFixed(1)}
          </span>
          <span className="text-gray-400 ml-1">/10</span>
          <span className="text-sm text-gray-500 ml-2">Overall Score</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
          <div 
            className={`h-3 rounded-full ${getScoreColor(department.overall)}`}
            style={{ width: `${(department.overall / 10) * 100}%` }}
          />
        </div>
      </div>

      {isHovered && (
        <div className="grid grid-cols-3 gap-2 mt-4 animate-in fade-in duration-200">
          <div className="text-center">
            <div className={`text-sm font-medium ${getScoreTextColor(department.scores.code)}`}>
              {department.scores.code.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Code</div>
          </div>
          <div className="text-center">
            <div className={`text-sm font-medium ${getScoreTextColor(department.scores.documentation)}`}>
              {department.scores.documentation.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Docs</div>
          </div>
          <div className="text-center">
            <div className={`text-sm font-medium ${getScoreTextColor(department.scores.test)}`}>
              {department.scores.test.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Test</div>
          </div>
          <div className="text-center">
            <div className={`text-sm font-medium ${getScoreTextColor(department.scores.architecture)}`}>
              {department.scores.architecture.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Arch</div>
          </div>
          <div className="text-center">
            <div className={`text-sm font-medium ${getScoreTextColor(department.scores.infrastructure)}`}>
              {department.scores.infrastructure.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Infra</div>
          </div>
          <div className="text-center">
            <div className={`text-sm font-medium ${getScoreTextColor(department.scores.devops)}`}>
              {department.scores.devops.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">DevOps</div>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500 mt-3">
        {department.subGroups.length} teams • {department.subGroups.reduce((acc: number, sg: any) => acc + sg.repos, 0)} repositories
      </div>
    </div>
  );
};

const SubGroupCard: React.FC<{ subGroup: any; onClick: () => void }> = ({ subGroup, onClick }) => (
  <div
    className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{subGroup.name}</h3>
      <div className="text-sm text-gray-500">{subGroup.repos} repos</div>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">6.2</div>
        <div className="text-xs text-gray-500">Overall Score</div>
      </div>
      <div className="text-center">
        <div className="text-sm text-green-600">12 Good</div>
        <div className="text-sm text-red-600">3 Critical</div>
      </div>
    </div>
  </div>
);

const RepositoryTable: React.FC = () => {
  const mockRepos = [
    { name: 'banking-core-api', codeDebt: 6.5, docDebt: 4.8, testDebt: 7.2, archDebt: 5.1, infraDebt: 6.8, devopsDebt: 5.9 },
    { name: 'mobile-banking-app', codeDebt: 3.2, docDebt: 8.1, testDebt: 4.5, archDebt: 3.8, infraDebt: 5.2, devopsDebt: 6.7 },
    { name: 'payment-gateway', codeDebt: 8.9, docDebt: 7.3, testDebt: 8.5, archDebt: 9.1, infraDebt: 7.8, devopsDebt: 8.2 },
    { name: 'fraud-detection', codeDebt: 2.1, docDebt: 1.9, testDebt: 2.8, archDebt: 1.5, infraDebt: 2.3, devopsDebt: 3.1 },
    { name: 'user-management', codeDebt: 5.7, docDebt: 6.2, testDebt: 5.9, archDebt: 6.1, infraDebt: 5.8, devopsDebt: 6.0 }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Repository Debt Analysis</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repository</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Code Debt</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Doc Debt</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Test Debt</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Arch Debt</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Infra Debt</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">DevOps Debt</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockRepos.map((repo, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{repo.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getScoreTextColor(repo.codeDebt)}`}>
                    {repo.codeDebt.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getScoreTextColor(repo.docDebt)}`}>
                    {repo.docDebt.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getScoreTextColor(repo.testDebt)}`}>
                    {repo.testDebt.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getScoreTextColor(repo.archDebt)}`}>
                    {repo.archDebt.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getScoreTextColor(repo.infraDebt)}`}>
                    {repo.infraDebt.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getScoreTextColor(repo.devopsDebt)}`}>
                    {repo.devopsDebt.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function App() {
  const [currentView, setCurrentView] = useState<'departments' | 'subgroups' | 'repositories'>('departments');
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedSubGroup, setSelectedSubGroup] = useState<any>(null);
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);

  const handleDepartmentClick = (department: any) => {
    setSelectedDepartment(department);
    setCurrentView('subgroups');
  };

  const handleSubGroupClick = (subGroup: any) => {
    setSelectedSubGroup(subGroup);
    setCurrentView('repositories');
  };

  const handleBack = () => {
    if (currentView === 'repositories') {
      setCurrentView('subgroups');
      setSelectedSubGroup(null);
    } else if (currentView === 'subgroups') {
      setCurrentView('departments');
      setSelectedDepartment(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Wells Fargo</h1>
            <span className="text-red-200">Tech Debt Management</span>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      {currentView !== 'departments' && (
        <div className="bg-white border-b px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 text-sm">
              <button
                onClick={handleBack}
                className="flex items-center space-x-1 text-red-600 hover:text-red-800"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">{selectedDepartment?.name}</span>
              {currentView === 'repositories' && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-600">{selectedSubGroup?.name}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'departments' && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Department Overview</h2>
              <p className="text-gray-600">Select a department to view detailed tech debt analysis</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockData.departments.map((department) => (
                <DepartmentCard
                  key={department.id}
                  department={department}
                  onClick={() => handleDepartmentClick(department)}
                  isHovered={hoveredDept === department.id}
                  onHover={(hover) => setHoveredDept(hover ? department.id : null)}
                />
              ))}
            </div>
          </>
        )}

        {currentView === 'subgroups' && selectedDepartment && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedDepartment.name}</h2>
              <p className="text-gray-600">Select a team to view repository-level analysis</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <ScoreCard title="Overall Score" score={selectedDepartment.overall} icon={<Wrench className="h-5 w-5 text-gray-400" />} />
              <ScoreCard title="Code Quality" score={selectedDepartment.scores.code} icon={<Code className="h-5 w-5 text-gray-400" />} />
              <ScoreCard title="Documentation" score={selectedDepartment.scores.documentation} icon={<FileText className="h-5 w-5 text-gray-400" />} />
              <ScoreCard title="Security" score={selectedDepartment.scores.architecture} icon={<Shield className="h-5 w-5 text-gray-400" />} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedDepartment.subGroups.map((subGroup: any) => (
                <SubGroupCard
                  key={subGroup.id}
                  subGroup={subGroup}
                  onClick={() => handleSubGroupClick(subGroup)}
                />
              ))}
            </div>
          </>
        )}

        {currentView === 'repositories' && selectedSubGroup && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedSubGroup.name}</h2>
              <p className="text-gray-600">Repository-level tech debt analysis and metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              <ScoreCard title="Code Debt" score={6.5} icon={<Code className="h-5 w-5 text-gray-400" />} />
              <ScoreCard title="Doc Debt" score={4.8} icon={<FileText className="h-5 w-5 text-gray-400" />} />
              <ScoreCard title="Test Debt" score={7.2} icon={<Zap className="h-5 w-5 text-gray-400" />} />
              <ScoreCard title="Arch Debt" score={5.1} icon={<Building2 className="h-5 w-5 text-gray-400" />} />
              <ScoreCard title="Infra Debt" score={6.8} icon={<Server className="h-5 w-5 text-gray-400" />} />
              <ScoreCard title="DevOps Debt" score={5.9} icon={<Wrench className="h-5 w-5 text-gray-400" />} />
            </div>

            <RepositoryTable />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
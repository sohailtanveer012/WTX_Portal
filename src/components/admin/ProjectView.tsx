import React, { useState } from 'react';
import { ArrowLeft, Users, DollarSign, TrendingUp, Droplets, ChevronRight, Building, Calendar, MapPin, BarChart3, PieChart, Activity, Calculator, Edit, CheckCircle, FileText, Download, Filter } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ProjectPayout } from './ProjectPayout';
import { ProjectFundingView } from './ProjectFundingView';

interface ProjectViewProps {
  projectId: string | any;
  onBack: () => void;
}

export function ProjectView({ projectId, onBack }: ProjectViewProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('6m');
  const [selectedMetric, setSelectedMetric] = useState('production');
  const [showPayout, setShowPayout] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedInvestorView, setSelectedInvestorView] = useState('list');
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [selectedReportMonth, setSelectedReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedGroup, setSelectedGroup] = useState('all');

  // Use passed project data if it's a full object, otherwise use mock data
  const project = typeof projectId === 'object' ? projectId : {
      id: projectId,
      name: '4 Horsemen Leasehold',
      location: 'Cottle County, TX',
      status: 'Active',
      investors: 42,
      totalInvestment: '$5M',
      monthlyRevenue: '$1.2M',
      completionDate: '2024-10-31',
      description: 'Strategic oil and gas development project focused on maximizing production efficiency while maintaining environmental compliance.',
      startDate: '2023-06-15',
      operatingCosts: '$280K',
      productionRate: '8,500 BBL/day',
      recoveryRate: '85%',
      wellCount: 12,
      hasInvestorGroups: true,
    };

  if (showPayout) {
    return (
      <ProjectPayout
        projectId={projectId}
        project={project}
        onBack={() => setShowPayout(false)}
      />
    );
  }

  // Show funding view if project is not fully funded
  if (project.status === 'Funding') {
    return (
      <ProjectFundingView
        projectId={project}
        onBack={onBack}
      />
    );
  }

  const stats = [
    {
      label: 'Total Investment Raised',
      value: project.totalInvestment,
      icon: DollarSign,
      color: 'blue',
    },
    {
      label: 'Latest Monthly Revenue',
      value: project.monthlyRevenue,
      change: '+18.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'green',
    },
    {
      label: 'Active Investors',
      value: project.investors.toString(),
      icon: Users,
      color: 'purple',
    },
    {
      label: 'Production Rate',
      value: '15,340 BBL/mo.',
      change: '+15.2%',
      trend: 'up',
      icon: Droplets,
      color: 'yellow',
    },
  ];

  const productionData = [
    { month: 'Jan', production: 7200, revenue: 980000 },
    { month: 'Feb', production: 7500, revenue: 1020000 },
    { month: 'Mar', production: 7800, revenue: 1080000 },
    { month: 'Apr', production: 8100, revenue: 1140000 },
    { month: 'May', production: 8300, revenue: 1180000 },
    { month: 'Jun', production: 8500, revenue: 1200000 },
  ];

  const investorDistribution = [
    { name: 'Institutional', value: 45, color: '#3B82F6' },
    { name: 'Private', value: 35, color: '#10B981' },
    { name: 'Corporate', value: 20, color: '#6366F1' },
  ];

  const wellPerformance = [
    { name: 'Well 1', performance: 92 },
    { name: 'Well 2', performance: 88 },
    { name: 'Well 3', performance: 95 },
    { name: 'Well 4', performance: 85 },
    { name: 'Well 5', performance: 90 },
    { name: 'Well 6', performance: 87 },
    { name: 'Well 7', performance: 93 },
    { name: 'Well 8', performance: 89 },
    { name: 'Well 9', performance: 91 },
    { name: 'Well 10', performance: 86 },
    { name: 'Well 11', performance: 88 },
    { name: 'Well 12', performance: 94 },
  ];

  const investorGroups = [
    { id: '1', name: 'Early Investors', color: 'blue' },
    { id: '2', name: 'Institutional', color: 'purple' },
    { id: '3', name: 'Strategic Partners', color: 'green' }
  ];

  const investors = [
    {
      id: '1',
      name: 'Sarah Johnson',
      type: 'Individual',
      group: 'Early Investors',
      units: 4,
      percentage: 8,
      investmentDate: '2023-06-15',
      totalInvested: '$400,000',
      monthlyIncome: '$24,000',
      status: 'Active',
      lastDistribution: '2024-03-01',
      email: 'sarah.j@example.com',
      phone: '+1 (555) 123-4567'
    },
    {
      id: '2',
      name: 'Blackrock Energy Fund',
      type: 'Institutional',
      group: 'Institutional',
      units: 10,
      percentage: 20,
      investmentDate: '2023-06-15',
      totalInvested: '$1,000,000',
      monthlyIncome: '$60,000',
      status: 'Active',
      lastDistribution: '2024-03-01',
      email: 'investments@blackrock.com',
      phone: '+1 (555) 234-5678'
    },
    {
      id: '3',
      name: 'Michael Chen',
      type: 'Individual',
      group: 'Early Investors',
      units: 2,
      percentage: 4,
      investmentDate: '2023-07-01',
      totalInvested: '$200,000',
      monthlyIncome: '$12,000',
      status: 'Active',
      lastDistribution: '2024-03-01',
      email: 'm.chen@example.com',
      phone: '+1 (555) 345-6789'
    },
    {
      id: '4',
      name: 'Energy Capital Partners',
      type: 'Corporate',
      group: 'Strategic Partners',
      units: 8,
      percentage: 16,
      investmentDate: '2023-06-15',
      totalInvested: '$800,000',
      monthlyIncome: '$48,000',
      status: 'Active',
      lastDistribution: '2024-03-01',
      email: 'investments@ecp.com',
      phone: '+1 (555) 456-7890'
    },
    {
      id: '5',
      name: 'Emma Davis',
      type: 'Individual',
      group: 'Early Investors',
      units: 1,
      percentage: 2,
      investmentDate: '2023-08-15',
      totalInvested: '$100,000',
      monthlyIncome: '$6,000',
      status: 'Active',
      lastDistribution: '2024-03-01',
      email: 'emma.d@example.com',
      phone: '+1 (555) 567-8901'
    }
  ];

  const reports = {
    monthly: [
      {
        id: '1',
        name: 'June 2024 Production Report',
        type: 'Production',
        date: '2024-06-01',
        size: '2.4 MB',
        status: 'New',
      },
      {
        id: '2',
        name: 'June 2024 Financial Statement',
        type: 'Financial',
        date: '2024-06-01',
        size: '3.1 MB',
        status: 'New',
      },
      {
        id: '3',
        name: 'May 2024 Production Report',
        type: 'Production',
        date: '2024-05-01',
        size: '2.3 MB',
        status: 'Available',
      },
      {
        id: '4',
        name: 'May 2024 Financial Statement',
        type: 'Financial',
        date: '2024-05-01',
        size: '2.9 MB',
        status: 'Available',
      },
    ],
    initial: [
      {
        id: '5',
        name: 'Initial Offering Memorandum',
        type: 'Legal',
        date: '2023-06-01',
        size: '4.8 MB',
        status: 'Available',
      },
      {
        id: '6',
        name: 'Investment Structure Overview',
        type: 'Legal',
        date: '2023-06-01',
        size: '2.1 MB',
        status: 'Available',
      },
      {
        id: '7',
        name: 'Initial Investor Allocation Report',
        type: 'Financial',
        date: '2023-06-15',
        size: '1.8 MB',
        status: 'Available',
      },
      {
        id: '8',
        name: 'Project Timeline & Milestones',
        type: 'Planning',
        date: '2023-06-01',
        size: '1.5 MB',
        status: 'Available',
      },
    ],
    compliance: [
      {
        id: '9',
        name: 'Environmental Impact Assessment',
        type: 'Compliance',
        date: '2023-05-15',
        size: '5.2 MB',
        status: 'Available',
      },
      {
        id: '10',
        name: 'Regulatory Compliance Report Q2 2024',
        type: 'Compliance',
        date: '2024-04-15',
        size: '3.4 MB',
        status: 'Available',
      },
      {
        id: '11',
        name: 'Safety Audit Report Q2 2024',
        type: 'Compliance',
        date: '2024-04-20',
        size: '2.8 MB',
        status: 'Available',
      }
    ]
  };

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-400">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {project.location}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Started {new Date(project.startDate).toLocaleDateString()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'Active'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {project.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPayout(true)}
              className="flex items-center px-4 py-2 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 hover:bg-green-500/20 transition-colors"
            >
              <Calculator className="h-5 w-5 mr-2" />
              Calculate Payout
            </button>
            <button
              onClick={() => {/* Handle edit */}}
              className="flex items-center px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
            >
              <Edit className="h-5 w-5 mr-2" />
              Edit Project
            </button>
            <button
              onClick={() => setShowCompleteModal(true)}
              className="flex items-center px-4 py-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Complete Project
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-${stat.color}-500/20`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/10`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
                {stat.change && (
                  <span className="text-sm font-medium text-green-400">{stat.change}</span>
                )}
              </div>
              <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* Production & Revenue Chart */}
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Production & Revenue</h2>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-400"
              >
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productionData}>
                  <defs>
                    <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="var(--text-muted)" />
                  <YAxis 
                    yAxisId="left"
                    stroke="var(--text-muted)"
                    tickFormatter={(value) => `${value} BBL`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="var(--text-muted)"
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-background)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="production"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorProduction)"
                    name="Production (BBL)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Well Performance */}
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Well Performance</h2>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-400"
              >
                <option value="production">Production Rate</option>
                <option value="efficiency">Efficiency</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wellPerformance}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-background)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Bar dataKey="performance" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Investors Section */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-blue-400" />
              <div>
                <h2 className="text-xl font-semibold text-white">Project Investors</h2>
                <p className="text-sm text-gray-400 mt-1">By Investment Groups</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-gray-400"
              >
                <option value="all">All Groups</option>
                {investorGroups.map(group => (
                  <option key={group.id} value={group.name}>{group.name}</option>
                ))}
              </select>
              <div className="flex rounded-xl overflow-hidden border border-[var(--border-color)]">
                <button
                  onClick={() => setSelectedInvestorView('list')}
                  className={`px-4 py-2 text-sm ${
                    selectedInvestorView === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'bg-card-gradient text-gray-400 hover:text-gray-300'
                  }`}
                >
                  List View
                </button>
                <button
                  onClick={() => setSelectedInvestorView('grid')}
                  className={`px-4 py-2 text-sm ${
                    selectedInvestorView === 'grid'
                      ? 'bg-blue-500 text-white'
                      : 'bg-card-gradient text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Grid View
                </button>
              </div>
            </div>
          </div>

          {selectedInvestorView === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Investor</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Group</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Units</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Investment</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Monthly Income</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Investment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {investors
                    .filter(investor => selectedGroup === 'all' || investor.group === selectedGroup)
                    .map((investor) => (
                    <tr key={investor.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <span className="text-blue-400 font-semibold text-sm">
                              {investor.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{investor.name}</div>
                            <div className="text-sm text-gray-400">{investor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          investor.type === 'Individual'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : investor.type === 'Institutional'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                          {investor.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {investor.group && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            investor.group === 'Early Investors'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : investor.group === 'Institutional'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-green-500/10 text-green-400 border border-green-500/20'
                          }`}>
                            {investor.group}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{investor.units} Units</div>
                        <div className="text-sm text-gray-400">{investor.percentage}%</div>
                      </td>
                      <td className="px-6 py-4 text-white">{investor.totalInvested}</td>
                      <td className="px-6 py-4 text-green-400">{investor.monthlyIncome}</td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(investor.investmentDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investors
                .filter(investor => selectedGroup === 'all' || investor.group === selectedGroup)
                .map((investor) => (
                <div
                  key={investor.id}
                  className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <span className="text-lg font-semibold text-blue-400">
                        {investor.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{investor.name}</h3>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        investor.type === 'Individual'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : investor.type === 'Institutional'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-green-500/10 text-green-400 border border-green-500/20'
                      }`}>
                        {investor.type}
                      </span>
                      {investor.group && (
                        <span className={`inline-block mt-1 ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                          investor.group === 'Early Investors'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : investor.group === 'Institutional'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                          {investor.group}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Units</p>
                        <p className="text-white">{investor.units} ({investor.percentage}%)</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Investment Date</p>
                        <p className="text-white">
                          {new Date(investor.investmentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Total Invested</p>
                        <p className="text-white">{investor.totalInvested}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Monthly Income</p>
                        <p className="text-green-400">{investor.monthlyIncome}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-sm text-gray-400">Last Distribution</p>
                      <p className="text-white">
                        {new Date(investor.lastDistribution).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reports Section */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Project Reports</h2>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-gray-400"
              >
                <option value="all">All Reports</option>
                <option value="monthly">Monthly Reports</option>
                <option value="initial">Initial Documents</option>
                <option value="compliance">Compliance Reports</option>
              </select>
              <input
                type="month"
                value={selectedReportMonth}
                onChange={(e) => setSelectedReportMonth(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(reports)
              .filter(([key]) => selectedReportType === 'all' || selectedReportType === key)
              .map(([category, categoryReports]) => (
                <div key={category}>
                  <h3 className="text-lg font-medium text-white capitalize mb-4">
                    {category === 'monthly' ? 'Monthly Reports' :
                     category === 'initial' ? 'Initial Documents' :
                     'Compliance Reports'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryReports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.type === 'Production'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : report.type === 'Financial'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : report.type === 'Legal'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : report.type === 'Planning'
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {report.type}
                          </span>
                          {report.status === 'New' && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                              New
                            </span>
                          )}
                        </div>
                        <h4 className="text-white font-medium mb-2">{report.name}</h4>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>{new Date(report.date).toLocaleDateString()}</span>
                          <span>{report.size}</span>
                        </div>
                        <button
                          className="mt-3 w-full flex items-center justify-center px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
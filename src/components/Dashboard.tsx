import React, { useState } from 'react';
import { BarChart3, Briefcase, TrendingUp, DollarSign, Bell, Droplets, ArrowUpRight, Target, TrendingDown, Home, PieChart, FileText, Settings } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ProjectAnalytics } from './ProjectAnalytics';
import DemoProject1 from '../assets/Demo-Project-1.jpg';
import DemoProject2 from '../assets/Demo-Project-2.jpg';
import DemoProject3 from '../assets/Demo-Project-3.jpg';

export function Dashboard({ userProfile }: { userProfile?: any }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('6m');
  const [selectedUserData, setSelectedUserData] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const portfolioDataMap = {
    '6m': [
      { month: 'Jan', value: 250000, distribution: 12500, barrels: 1250, barrelPrice: 75.20 },
      { month: 'Feb', value: 265000, distribution: 13250, barrels: 1325, barrelPrice: 77.40 },
      { month: 'Mar', value: 285000, distribution: 14250, barrels: 1425, barrelPrice: 79.80 },
      { month: 'Apr', value: 310000, distribution: 15500, barrels: 1550, barrelPrice: 82.30 },
      { month: 'May', value: 340000, distribution: 17000, barrels: 1700, barrelPrice: 84.50 },
      { month: 'Jun', value: 375000, distribution: 18750, barrels: 1875, barrelPrice: 86.70 },
    ],
    '1y': [
      { month: 'Jul', value: 200000, distribution: 10000, barrels: 1000, barrelPrice: 70.50 },
      { month: 'Aug', value: 215000, distribution: 10750, barrels: 1075, barrelPrice: 71.80 },
      { month: 'Sep', value: 230000, distribution: 11500, barrels: 1150, barrelPrice: 73.20 },
      { month: 'Oct', value: 240000, distribution: 12000, barrels: 1200, barrelPrice: 74.40 },
      { month: 'Nov', value: 245000, distribution: 12250, barrels: 1225, barrelPrice: 74.90 },
      { month: 'Dec', value: 250000, distribution: 12500, barrels: 1250, barrelPrice: 75.20 },
      { month: 'Jan', value: 265000, distribution: 13250, barrels: 1325, barrelPrice: 77.40 },
      { month: 'Feb', value: 285000, distribution: 14250, barrels: 1425, barrelPrice: 79.80 },
      { month: 'Mar', value: 310000, distribution: 15500, barrels: 1550, barrelPrice: 82.30 },
      { month: 'Apr', value: 340000, distribution: 17000, barrels: 1700, barrelPrice: 84.50 },
      { month: 'May', value: 355000, distribution: 17750, barrels: 1775, barrelPrice: 85.60 },
      { month: 'Jun', value: 375000, distribution: 18750, barrels: 1875, barrelPrice: 86.70 },
    ],
    'all': [
      { month: 'Jan 23', value: 150000, distribution: 7500, barrels: 750, barrelPrice: 65.80 },
      { month: 'Mar 23', value: 175000, distribution: 8750, barrels: 875, barrelPrice: 67.90 },
      { month: 'May 23', value: 200000, distribution: 10000, barrels: 1000, barrelPrice: 70.50 },
      { month: 'Jul 23', value: 225000, distribution: 11250, barrels: 1125, barrelPrice: 72.80 },
      { month: 'Sep 23', value: 250000, distribution: 12500, barrels: 1250, barrelPrice: 75.20 },
      { month: 'Nov 23', value: 275000, distribution: 13750, barrels: 1375, barrelPrice: 78.40 },
      { month: 'Jan 24', value: 300000, distribution: 15000, barrels: 1500, barrelPrice: 81.60 },
      { month: 'Mar 24', value: 335000, distribution: 16750, barrels: 1675, barrelPrice: 83.90 },
      { month: 'May 24', value: 355000, distribution: 17750, barrels: 1775, barrelPrice: 85.60 },
      { month: 'Jun 24', value: 375000, distribution: 18750, barrels: 1875, barrelPrice: 86.70 },
    ]
  };

  const stats = [
    {
      label: 'Total Portfolio Value',
      value: '$375,000',
      icon: DollarSign,
      color: 'blue',
    },
    {
      label: 'Monthly Distribution',
      value: '$18,750',
      icon: Briefcase,
      color: 'green',
    },
    {
      label: 'Active Projects',
      value: '3',
      icon: Droplets,
      color: 'purple',
    },
    {
      label: 'Annual Return',
      value: '+24.6%',
      icon: TrendingUp,
      color: 'yellow',
    },
  ];

  const investmentProgress = [
    {
      name: 'Permian Basin Well #247',
      invested: 125000,
      currentValue: 153750,
      targetReturn: 156250, // 25% return target
    },
    {
      name: 'Midland County Project',
      invested: 95000,
      currentValue: 89300,
      targetReturn: 118750,
    },
    {
      name: 'Delaware Basin Operations',
      invested: 155000,
      currentValue: 201500,
      targetReturn: 193750,
    },
  ];

  const investments = [
    {
      name: 'Permian Basin Well #247',
      return: '+22.5%',
      invested: '$125,000',
      monthlyDistribution: '$6,250',
      status: 'Producing',
      lastUpdate: '2 hours ago',
      image: DemoProject1,
    },
    {
      name: 'Midland County Project',
      return: '+18.3%',
      invested: '$95,000',
      monthlyDistribution: '$4,750',
      status: 'Producing',
      lastUpdate: '5 hours ago',
      image: DemoProject2,
    },
    {
      name: 'Delaware Basin Operations',
      return: '+19.7%',
      invested: '$155,000',
      monthlyDistribution: '$7,750',
      status: 'Producing',
      lastUpdate: '1 day ago',
      image: DemoProject3,
    },
  ];

  const notifications = [
    { title: 'June Distribution Payment Processed', time: '2 hours ago', type: 'success' },
    { title: 'Monthly Production Report Available', time: '5 hours ago', type: 'info' },
    { title: 'New Well Completion Update', time: '1 day ago', type: 'info' },
  ];

  if (selectedProject) {
    return (
      <ProjectAnalytics
        project={{
          ...selectedProject,
          startDate: '2023-06-15',
          location: selectedProject.name.includes('Permian') ? 'Texas' :
                   selectedProject.name.includes('Midland') ? 'Texas' :
                   'North Dakota',
          investors: Math.floor(Math.random() * 20) + 30,
          totalInvestment: selectedProject.invested,
          monthlyRevenue: selectedProject.monthlyDistribution
        }}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Get the data for the hovered point
    return (
      <div
        style={{
          backgroundColor: 'var(--card-background)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.5rem',
          padding: '10px',
          color: 'var(--text-primary)',
        }}
      >
        <p style={{ color: 'var(--text-primary)', marginBottom: '5px' }}>{label}</p>
        <p style={{ color: 'var(--text-primary)', margin: '2px 0' }}>
          Portfolio Value: ${data.value.toLocaleString()}
        </p>
        <p style={{ color: 'var(--text-primary)', margin: '2px 0' }}>
          {data.barrels.toLocaleString()} BBL @ ${data.barrelPrice.toFixed(2)}/BBL
        </p>
        <p style={{ color: 'var(--text-primary)', margin: '2px 0' }}>
          Distribution: ${data.distribution.toLocaleString()} Monthly
        </p>
      </div>
    );
  }
  return null;
};
  
  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Home className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back, {userProfile?.full_name?.split(' ')[0] || 'Investor'}</h1>
              <p className="text-[var(--text-muted)] mt-1">Here's an overview of your investment portfolio</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-${stat.color}-500/20`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/10`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
                {(stat.label === 'Total Portfolio Value' || 
                  stat.label === 'Monthly Distribution' || 
                  stat.label === 'Annual Return') && (
                  <span className="text-sm font-medium text-green-400">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--text-muted)] font-medium">{stat.label}</p>
              <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Investment Progress */}
        <div className="bg-card-gradient rounded-2xl p-6 mb-8 hover-neon-glow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Investment Progress</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400/20 rounded-full"></div>
                <span className="text-[var(--text-muted)]">Initial Investment</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400/50 rounded-full"></div>
                <span className="text-[var(--text-muted)]">Profit</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400/50 rounded-full"></div>
                <span className="text-[var(--text-muted)]">Loss</span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {investmentProgress.map((project, index) => {
              const isProfit = project.currentValue >= project.invested;
              const progressPercentage = (project.currentValue / project.targetReturn) * 100;
              const returnPercentage = ((project.currentValue - project.invested) / project.invested) * 100;
              const returnAmount = project.currentValue - project.invested;
              return (
                <div
                  key={index}
                  className="bg-[var(--card-background-hover)] rounded-xl p-4 space-y-4 cursor-pointer transition-shadow hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  tabIndex={0}
                  role="button"
                  aria-label={`View analytics for ${project.name}`}
                  onClick={() => setSelectedProject(project)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedProject(project); }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isProfit ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
                      }`}>
                        {isProfit ? (
                          <TrendingUp className={`h-5 w-5 ${isProfit ? 'text-green-400' : 'text-red-400'}`} />
                        ) : (
                          <TrendingDown className={`h-5 w-5 ${isProfit ? 'text-green-400' : 'text-red-400'}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--text-primary)]">{project.name}</h3>
                        <div className="flex items-center mt-1">
                          <span className={`text-sm font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>{returnPercentage > 0 ? '+' : ''}{returnPercentage.toFixed(1)}%</span>
                          <span className="mx-2 text-[var(--text-muted)]">•</span>
                          <span className={`text-sm font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>{returnAmount > 0 ? '+' : ''}{returnAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </div>
                    <Target className="h-5 w-5 text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <div className="flex h-3 overflow-hidden rounded-lg bg-[var(--card-background)]">
                      <div
                        style={{ width: `${project.invested / project.targetReturn * 100}%` }}
                        className="bg-gray-400/30"
                      />
                      <div
                        style={{ width: `${(project.currentValue - project.invested) / project.targetReturn * 100}%` }}
                        className={`${isProfit ? 'bg-green-500/50' : 'bg-red-500/50'} transition-all duration-500`}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <div>
                        <span className="text-[var(--text-muted)]">Initial:</span>
                        <span className="ml-1 font-medium text-[var(--text-primary)]">${project.invested.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">Current:</span>
                        <span className="ml-1 font-medium text-[var(--text-primary)]">${project.currentValue.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">Target:</span>
                        <span className="ml-1 font-medium text-[var(--text-primary)]">${project.targetReturn.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portfolio Chart */}
        <div className="bg-card-gradient rounded-2xl p-6 mb-8 hover-neon-glow border border-blue-500/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <PieChart className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Portfolio Performance</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Track your investment growth over time</p>
              </div>
            </div>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-[var(--text-muted)]"
            >
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioDataMap[selectedTimeRange as '6m' | '1y' | 'all']}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDistribution" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-muted)' }}
              />
              <YAxis
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-muted)' }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorValue)"
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="distribution"
                stroke="#22C55E"
                fillOpacity={1}
                fill="url(#colorDistribution)"
                stackId="2"
              />
            </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Investments */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-green-500/10">
                <Briefcase className="h-5 w-5 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Active Investments</h2>
            </div>
            {investments.map((investment, index) => (
              <div
                key={index}
                onClick={() => setSelectedProject(investment)}
                className="bg-card-gradient rounded-2xl overflow-hidden hover-neon-glow"
              >
                <div className="flex">
                  <div className="w-48">
                    <img
                      src={investment.image}
                      alt={investment.name}
                      className="w-full h-48 object-cover cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{investment.name}</h3>
                        <p className="text-sm text-[var(--text-muted)]">Last updated: {investment.lastUpdate}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        {investment.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-6 mt-4">
                      <div>
                        <p className="text-sm text-[var(--text-muted)] font-medium">Annual Return</p>
                        <p className="text-lg font-semibold text-green-400">{investment.return}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--text-muted)] font-medium">Invested Amount</p>
                        <p className="text-lg font-semibold text-[var(--text-primary)]">{investment.invested}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--text-muted)] font-medium">Monthly Distribution</p>
                        <p className="text-lg font-semibold text-green-400">{investment.monthlyDistribution}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notifications Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-purple-500/10">
                <Bell className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Recent Updates</h2>
            </div>
            <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 rounded-xl bg-[var(--card-background-hover)]"
                  >
                    <div className={`p-2 rounded-xl ${
                      notification.type === 'info'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : notification.type === 'success'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{notification.title}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
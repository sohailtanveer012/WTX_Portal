import React, { useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, BarChart as ChartBar, PieChart as PieChartIcon, Target, Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { ProjectAnalytics } from './ProjectAnalytics';
import DemoProject1 from '../assets/Demo-Project-1.jpg';
import DemoProject2 from '../assets/Demo-Project-2.jpg';
import DemoProject3 from '../assets/Demo-Project-3.jpg';

const CustomTooltip = ({ active, payload, label }) => {
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

export function Analytics() {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('1y');
  const [selectedTimeRange, setSelectedTimeRange] = useState('6m');

  const portfolioGrowthData = {
    '1m': [
      { month: 'Week 1', value: 340000, distribution: 17000, barrels: 1700, barrelPrice: 84.50 },
      { month: 'Week 2', value: 350000, distribution: 17500, barrels: 1750, barrelPrice: 85.10 },
      { month: 'Week 3', value: 365000, distribution: 18250, barrels: 1825, barrelPrice: 85.90 },
      { month: 'Week 4', value: 375000, distribution: 18750, barrels: 1875, barrelPrice: 86.70 },
    ],
    '3m': [
      { month: 'Apr', value: 310000, distribution: 15500, barrels: 1550, barrelPrice: 82.30 },
      { month: 'May', value: 340000, distribution: 17000, barrels: 1700, barrelPrice: 84.50 },
      { month: 'Jun', value: 375000, distribution: 18750, barrels: 1875, barrelPrice: 86.70 },
    ],
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
  };

  const projectPerformance = [
    { name: 'Permian Basin Well #247', value: 40, roi: 22.5, production: 8500, image: DemoProject1 },
    { name: 'Midland County Project', value: 35, roi: 18.3, production: 7200, image: DemoProject2 },
    { name: 'Delaware Basin Operations', value: 25, roi: 19.7, production: 5300, image: DemoProject3 }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#6366F1'];

  const stats = [
    {
      label: 'Portfolio Value',
      value: '$375,000',
      change: '+24.6%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      label: 'Total Returns YTD',
      value: '$91,250',
      change: '+18.3%',
      trend: 'up',
      icon: ChartBar,
    },
    {
      label: 'Return Rate',
      value: '22.5%',
      change: '+2.8%',
      trend: 'up',
      icon: Target,
    },
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
          totalInvestment: `$${(selectedProject.value * 100000).toLocaleString()}`,
          monthlyRevenue: `$${(selectedProject.production * 150).toLocaleString()}`
        }}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <PieChartIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics Overview</h1>
              <p className="text-[var(--text-muted)] mt-1">Track and analyze your investment performance</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="h-8 w-8 text-blue-400" />
                <span className={`flex items-center text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change}
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 ml-1" />
                  )}
                </span>
              </div>
              <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="mb-8">
          {/* Portfolio Growth */}
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Portfolio Growth</h2>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-gray-400"
              >
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioGrowthData[selectedTimeRange]}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDistribution" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
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
        </div>

        {/* Project Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Distribution */}
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow h-full">
            <h2 className="text-xl font-semibold text-white mb-6">Portfolio Distribution</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectPerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    onClick={(entry) => setSelectedProject(entry)}
                    style={{ cursor: 'pointer' }}
                  >
                    {projectPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: '#F3F4F6' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Project Details */}
          <div className="lg:col-span-2">
            <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
              <h2 className="text-xl font-semibold text-white mb-6">Project Performance</h2>
              <div className="space-y-6">
                {projectPerformance.map((project, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 rounded-xl bg-white/5">
                    <img
                      onClick={() => setSelectedProject(project)}
                      src={project.image}
                      alt={project.name}
                      className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <div className="flex-1">
                      <h3 
                        onClick={() => setSelectedProject(project)}
                        className="text-white font-medium cursor-pointer hover:text-blue-400 transition-colors"
                      >
                        {project.name}
                      </h3>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>
                          <p className="text-xs text-gray-400">Portfolio %</p>
                          <p className="text-sm font-medium text-white">{project.value}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">ROI</p>
                          <p className="text-sm font-medium text-green-400">+{project.roi}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Production</p>
                          <p className="text-sm font-medium text-white">{project.production} BBL</p>
                        </div>
                      </div>
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
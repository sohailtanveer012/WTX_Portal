import React, { useState } from 'react';
import { Users, FolderOpen, FileText, TrendingUp, BarChart3, AlertCircle, DollarSign, Activity, ChevronRight, Droplets, Sun } from 'lucide-react';
import { AreaChart, Area, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function AdminDashboard({ onViewProfile, userProfile }: { onViewProfile?: (user: any) => void, userProfile?: any }) {
  // Get current time to display appropriate greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const stats = [
    {
      label: 'Active Investors',
      value: '130',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Active Projects',
      value: '186',
      change: '+8.2%',
      trend: 'up',
      icon: FolderOpen,
      color: 'purple',
    },
    {
      label: 'Monthly Production',
      value: '125,480 BBL',
      change: '+15.3%',
      trend: 'up',
      icon: Droplets,
      color: 'green',
    },
    {
      label: 'Total Revenue',
      value: '$4.2M',
      change: '+18.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'yellow',
    }
  ];

  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedProductionView, setSelectedProductionView] = useState('total');
  const [selectedTimeframe, setSelectedTimeframe] = useState('6m');

  const upcomingBirthdays = [
    {
      name: 'Sarah Johnson',
      id: '1',
      email: 'sarah.j@example.com',
      birthday: '1975-03-25',
      totalInvested: '$250,000',
      activeProjects: 3,
      daysUntil: 2,
      status: 'Active',
      joinDate: '2024-01-15',
      phone: '+1 (555) 123-4567',
      role: 'investor',
      lastLogin: '2024-03-15 14:30'
    },
    {
      name: 'Michael Chen',
      id: '2',
      email: 'm.chen@example.com',
      birthday: '1982-03-28',
      totalInvested: '$180,000',
      activeProjects: 2,
      daysUntil: 5,
      status: 'Active',
      joinDate: '2024-02-01',
      phone: '+1 (555) 234-5678',
      role: 'investor',
      lastLogin: '2024-03-14 09:15'
    },
    {
      name: 'Emma Davis',
      id: '3',
      email: 'emma.d@example.com',
      birthday: '1978-04-01',
      totalInvested: '$320,000',
      activeProjects: 4,
      daysUntil: 9,
      status: 'Active',
      joinDate: '2024-01-05',
      phone: '+1 (555) 345-6789',
      role: 'investor',
      lastLogin: '2024-03-15 11:45'
    },
    {
      name: 'James Wilson',
      id: '4',
      email: 'j.wilson@example.com',
      birthday: '1980-04-05',
      totalInvested: '$150,000',
      activeProjects: 1,
      daysUntil: 13,
      status: 'Inactive',
      joinDate: '2024-02-10',
      phone: '+1 (555) 456-7890',
      role: 'investor',
      lastLogin: '2024-03-10 16:20'
    }
  ];

  const investorPerformance = [
    {
      name: 'Sarah Johnson',
      initialDate: '2023-06-15',
      invested: '$250,000',
      currentValue: '$312,500',
      return: '+25%',
      trend: 'up',
      monthlyIncome: '$8,750',
    },
    {
      name: 'Michael Chen',
      initialDate: '2023-08-01',
      invested: '$180,000',
      currentValue: '$207,000',
      return: '+15%',
      trend: 'up',
      monthlyIncome: '$5,400',
    },
    {
      name: 'James Wilson',
      initialDate: '2023-12-10',
      invested: '$150,000',
      currentValue: '$142,500',
      return: '-5%',
      trend: 'down',
      monthlyIncome: '$3,200',
    },
    {
      name: 'Emma Davis',
      initialDate: '2023-05-20',
      invested: '$320,000',
      currentValue: '$384,000',
      return: '+20%',
      trend: 'up',
      monthlyIncome: '$9,600',
    },
    {
      name: 'William Brown',
      initialDate: '2024-01-15',
      invested: '$200,000',
      currentValue: '$180,000',
      return: '-10%',
      trend: 'down',
      monthlyIncome: '$4,500',
    }
  ];

  const revenueData = [
    {
      month: 'Jan',
      revenue: 3200000,
      totalProduction: 98000,
      eagleFord: 42000,
      permian: 35000,
      bakken: 21000
    },
    {
      month: 'Feb',
      revenue: 3400000,
      totalProduction: 102000,
      eagleFord: 44000,
      permian: 36000,
      bakken: 22000
    },
    {
      month: 'Mar',
      revenue: 3800000,
      totalProduction: 108000,
      eagleFord: 46000,
      permian: 38000,
      bakken: 24000
    },
    {
      month: 'Apr',
      revenue: 3900000,
      totalProduction: 115000,
      eagleFord: 48000,
      permian: 42000,
      bakken: 25000
    },
    {
      month: 'May',
      revenue: 4100000,
      totalProduction: 120000,
      eagleFord: 50000,
      permian: 44000,
      bakken: 26000
    },
    {
      month: 'Jun',
      revenue: 4200000,
      totalProduction: 125480,
      eagleFord: 52000,
      permian: 46000,
      bakken: 27480
    }
  ];

  const projectPerformance = [
    { name: 'Permian', value: 450000 },
    { name: 'Eagle Ford', value: 380000 },
    { name: 'Bakken', value: 320000 },
    { name: 'Marcellus', value: 280000 },
  ];

  const recentUsers = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      joinDate: '2024-03-15',
      status: 'Active',
      investedAmount: '$250,000',
    },
    {
      name: 'Michael Chen',
      email: 'm.chen@example.com',
      joinDate: '2024-03-14',
      status: 'Pending',
      investedAmount: '$180,000',
    },
    {
      name: 'Emma Davis',
      email: 'emma.d@example.com',
      joinDate: '2024-03-13',
      status: 'Active',
      investedAmount: '$320,000',
    },
  ];

  const recentProjects = [
    {
      name: 'Eagle Ford Shale Development',
      location: 'Texas',
      status: 'Active',
      investors: 45,
      totalInvestment: '$2.8M',
    },
    {
      name: 'Permian Basin Expansion',
      location: 'Texas',
      status: 'Planning',
      investors: 32,
      totalInvestment: '$1.9M',
    },
    {
      name: 'Bakken Formation Wells',
      location: 'North Dakota',
      status: 'Active',
      investors: 28,
      totalInvestment: '$2.1M',
    },
  ];

  const alerts = [
    {
      title: 'New Investment Opportunity',
      description: 'Eagle Ford Shale project ready for investor onboarding',
      type: 'info',
      time: '2 hours ago',
    },
    {
      title: 'System Maintenance',
      description: 'Scheduled maintenance in 48 hours',
      type: 'warning',
      time: '5 hours ago',
    },
    {
      title: 'Monthly Reports Ready',
      description: 'March 2024 reports are ready for distribution',
      type: 'success',
      time: '1 day ago',
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Sun className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{greeting}, {userProfile?.contact_name || userProfile?.account_name || userProfile?.full_name?.split(' ')[0] || 'Admin'}</h1>
              <p className="text-[var(--text-muted)] mt-1">Here's what's happening with your projects today</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-${stat.color}-500/20 transform transition-all duration-200 hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
                <span className="text-sm font-medium text-green-400">{stat.change}</span>
              </div>
              <p className="text-[var(--text-muted)] text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold text-[var(--text-primary)]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              selectedTab === 'overview'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('performance')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              selectedTab === 'performance'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Investor Performance
          </button>
        </div>

        {selectedTab === 'performance' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Investors in Green */}
            <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Positive Returns</h2>
                <span className="px-2 py-1 rounded-full text-sm bg-green-500/10 text-green-400 border border-green-500/20">
                  {investorPerformance.filter(inv => inv.trend === 'up').length} Investors
                </span>
              </div>
              <div className="space-y-4">
                {investorPerformance
                  .filter(investor => investor.trend === 'up')
                  .map((investor, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white">{investor.name}</h3>
                        <span className="text-green-400 font-medium">{investor.return}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-2 text-sm mb-3">
                        <div>
                          <span className="text-gray-400">Invested</span>
                          <p className="text-white">{investor.invested}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Current Value</span>
                          <p className="text-green-400">{investor.currentValue}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm border-t border-white/10 pt-3">
                        <div>
                          <span className="text-gray-400">Time Invested</span>
                          <p className="text-white">
                            {Math.round((new Date().getTime() - new Date(investor.initialDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Monthly Income</span>
                          <p className="text-green-400">{investor.monthlyIncome}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Investors in Red */}
            <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Negative Returns</h2>
                <span className="px-2 py-1 rounded-full text-sm bg-red-500/10 text-red-400 border border-red-500/20">
                  {investorPerformance.filter(inv => inv.trend === 'down').length} Investors
                </span>
              </div>
              <div className="space-y-4">
                {investorPerformance
                  .filter(investor => investor.trend === 'down')
                  .map((investor, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white">{investor.name}</h3>
                        <span className="text-red-400 font-medium">{investor.return}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-2 text-sm mb-3">
                        <div>
                          <span className="text-gray-400">Invested</span>
                          <p className="text-white">{investor.invested}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Current Value</span>
                          <p className="text-red-400">{investor.currentValue}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm border-t border-white/10 pt-3">
                        <div>
                          <span className="text-gray-400">Time Invested</span>
                          <p className="text-white">
                            {Math.round((new Date().getTime() - new Date(investor.initialDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Monthly Income</span>
                          <p className="text-red-400">{investor.monthlyIncome}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <>
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Production by Project</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedProductionView}
                  onChange={(e) => setSelectedProductionView(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-[var(--text-muted)]"
                >
                  <option value="total">Total Production</option>
                  <option value="byProject">By Project</option>
                </select>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-[var(--text-muted)]"
                >
                  <option value="6m">Last 6 Months</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {selectedProductionView === 'total' ? (
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="var(--text-muted)" />
                    <YAxis
                      stroke="var(--text-muted)"
                      tickFormatter={(value) => `${value/1000}k BBL`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card-background)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.75rem',
                      }}
                      formatter={(value: any) => [`${value.toLocaleString()} BBL`, 'Production']}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalProduction"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorProduction)"
                      name="Total Production"
                    />
                  </AreaChart>
                ) : (
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorEagleFord" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPermian" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBakken" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="var(--text-muted)" />
                    <YAxis
                      stroke="var(--text-muted)"
                      tickFormatter={(value) => `${value/1000}k BBL`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card-background)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.75rem',
                      }}
                      formatter={(value: any) => [`${value.toLocaleString()} BBL`, '']}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="eagleFord"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorEagleFord)"
                      name="Eagle Ford"
                      stackId="1"
                    />
                    <Area
                      type="monotone"
                      dataKey="permian"
                      stroke="#10B981"
                      fillOpacity={1}
                      fill="url(#colorPermian)"
                      name="Permian"
                      stackId="1"
                    />
                    <Area
                      type="monotone"
                      dataKey="bakken"
                      stroke="#6366F1"
                      fillOpacity={1}
                      fill="url(#colorBakken)"
                      name="Bakken"
                      stackId="1"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Project Performance</h2>
              <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-[var(--text-muted)]">
                <option>Monthly Revenue</option>
                <option>Total Revenue</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={projectPerformance}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-background)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Upcoming Birthdays */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Upcoming Investor Birthdays</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingBirthdays.map((investor, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
                onClick={() => onViewProfile?.(investor)}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <span className="text-lg font-semibold text-purple-400">
                      {investor.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">{investor.name}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {new Date(investor.birthday).toLocaleDateString(undefined, { 
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Days Until</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {investor.daysUntil} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Invested</span>
                    <span className="text-[var(--text-primary)]">{investor.totalInvested}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Projects</span>
                    <span className="text-[var(--text-primary)]">{investor.activeProjects}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
        )}
      </div>
    </main>
  );
}
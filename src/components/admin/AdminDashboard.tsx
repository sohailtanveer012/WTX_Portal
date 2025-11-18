import React, { useEffect, useState } from 'react';
import { Users, FolderOpen, FileText, TrendingUp, BarChart3, AlertCircle, DollarSign, Activity, ChevronRight, Droplets, Sun } from 'lucide-react';
import { AreaChart, Area, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchProjectsWithInvestorCount, fetchTotalRevenueMonthly, fetchProjectRevenueByMonth, fetchTotalRevenueAllProjects, fetchInvestorReturnSummary } from '../../api/services';

export function AdminDashboard({ onViewProfile, userProfile }: { onViewProfile?: (user: any) => void, userProfile?: any }) {
  // Get current time to display appropriate greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const [projects, setProjects] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [totalRevenueAllMonths, setTotalRevenueAllMonths] = useState<number | null>(null);
  const [selectedPerfMetric, setSelectedPerfMetric] = useState<'monthly' | 'total'>('monthly');
  const [perfMonth, setPerfMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [perfData, setPerfData] = useState<Array<{ name: string; value: number }>>([]);
  const [loadingPerf, setLoadingPerf] = useState<boolean>(false);
  const [investorReturns, setInvestorReturns] = useState<any[]>([]);
  const [loadingInvestorReturns, setLoadingInvestorReturns] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingStats(true);
      try {
        const [data, monthlyTotals] = await Promise.all([
          fetchProjectsWithInvestorCount(),
          fetchTotalRevenueMonthly(),
        ]);
        if (!mounted) return;
        setProjects(Array.isArray(data) ? data : []);
        const summed = (monthlyTotals || []).reduce((sum: number, row: any) => sum + (Number(row.total_revenue) || 0), 0);
        setTotalRevenueAllMonths(summed);
      } catch (e) {
        console.error('AdminDashboard: failed to fetch projects', e);
        if (!mounted) return;
        setProjects([]);
      } finally {
        if (mounted) setLoadingStats(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const activeProjects = projects.filter(p => (p.status || '').toLowerCase() === 'active');
  const activeProjectsCount = activeProjects.length;
  const activeInvestors = activeProjects.reduce((sum, p) => sum + (Number(p.investor_count) || 0), 0);
  const totalRevenueFallback = projects.reduce((sum, p) => sum + (Number(p.monthly_revenue) || 0), 0);
  const totalRevenue = (totalRevenueAllMonths ?? totalRevenueFallback);

  const stats = [
    {
      label: 'Active Investors',
      value: loadingStats ? '...' : activeInvestors.toLocaleString(),
      change: '',
      trend: 'up',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Active Projects',
      value: loadingStats ? '...' : activeProjectsCount.toString(),
      change: '',
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
      value: loadingStats ? '...' : `$${(totalRevenue || 0).toLocaleString()}`,
      change: '',
      trend: 'up',
      icon: DollarSign,
      color: 'yellow',
    }
  ];

  // Load investor performance summary
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingInvestorReturns(true);
      try {
        const rows = await fetchInvestorReturnSummary();
        if (!mounted) return;
        setInvestorReturns(rows);
      } catch (e) {
        console.error('AdminDashboard: failed to fetch investor return summary', e);
        if (!mounted) return;
        setInvestorReturns([]);
      } finally {
        if (mounted) setLoadingInvestorReturns(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load Project Performance data based on selection
  useEffect(() => {
    const loadMonthlyRevenue = async () => {
      if (!projects || projects.length === 0) { setPerfData([]); return; }
      setLoadingPerf(true);
      try {
        const rows = await Promise.all(
          projects.map(async (p: any) => {
            const pid = p.project_id || p.id || p.ID || p.PROJECT_ID;
            const name = p.project_name || p.name || p.NAME || p.PROJECT_NAME || 'Project';
            if (!pid) return { name, value: 0 };
            const revenue = await fetchProjectRevenueByMonth(String(pid), perfMonth);
            return { name, value: Number(revenue || 0) };
          })
        );
        setPerfData(rows);
      } catch (e) {
        console.error('Failed loading monthly revenue per project:', e);
        setPerfData([]);
      } finally {
        setLoadingPerf(false);
      }
    };

    const loadTotalRevenue = async () => {
      setLoadingPerf(true);
      try {
        const totals = await fetchTotalRevenueAllProjects();
        const rows = (totals || []).map((row: any) => ({
          name: row.project_name || 'Project',
          value: Number(row.total_revenue || 0),
        }));
        setPerfData(rows);
      } catch (e) {
        console.error('Failed loading total revenue per project:', e);
        setPerfData([]);
      } finally {
        setLoadingPerf(false);
      }
    };

    if (selectedPerfMetric === 'monthly') loadMonthlyRevenue();
    else loadTotalRevenue();
  }, [selectedPerfMetric, perfMonth, projects]);

  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedProductionView, setSelectedProductionView] = useState('total');
  const [selectedTimeframe, setSelectedTimeframe] = useState('6m');

  

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
                  {investorReturns.filter(r => (r.return_status || '').toLowerCase().includes('positive')).length} Investors
                </span>
              </div>
              <div className="space-y-4">
                {loadingInvestorReturns ? (
                  <div className="text-gray-400">Loading...</div>
                ) : investorReturns
                    .filter((r: any) => (r.return_status || '').toLowerCase().includes('positive'))
                    .map((r: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-white">{r.investor_name}</h3>
                          {(() => {
                            const invested = Number(r.total_investment) || 0;
                            const payout = Number(r.total_payout) || 0;
                            const pct = invested > 0 ? ((payout - invested) / invested) * 100 : 0;
                            const label = pct >= 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
                            return (
                              <span className="text-green-400 font-medium">Positive {label}</span>
                            );
                          })()}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm mb-3">
                          <div>
                            <span className="text-gray-400">Invested</span>
                            <p className="text-white">${(Number(r.total_investment) || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Total Payout</span>
                            <p className="text-green-400">${(Number(r.total_payout) || 0).toLocaleString()}</p>
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
                  {investorReturns.filter(r => (r.return_status || '').toLowerCase().includes('negative')).length} Investors
                </span>
              </div>
              <div className="space-y-4">
                {loadingInvestorReturns ? (
                  <div className="text-gray-400">Loading...</div>
                ) : investorReturns
                    .filter((r: any) => (r.return_status || '').toLowerCase().includes('negative'))
                    .map((r: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-white">{r.investor_name}</h3>
                          {(() => {
                            const invested = Number(r.total_investment) || 0;
                            const payout = Number(r.total_payout) || 0;
                            const pct = invested > 0 ? ((payout - invested) / invested) * 100 : 0;
                            const label = pct >= 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
                            return (
                              <span className="text-red-400 font-medium">Negative {label}</span>
                            );
                          })()}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm mb-3">
                          <div>
                            <span className="text-gray-400">Invested</span>
                            <p className="text-white">${(Number(r.total_investment) || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Total Payout</span>
                            <p className="text-red-400">${(Number(r.total_payout) || 0).toLocaleString()}</p>
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
              <div className="flex items-center gap-2">
                {selectedPerfMetric === 'monthly' && (
                  <input
                    type="month"
                    value={perfMonth}
                    onChange={(e) => setPerfMonth(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-[var(--text-muted)]"
                    title="Select month to view monthly revenue by project"
                  />
                )}
                <select
                  value={selectedPerfMetric}
                  onChange={(e) => setSelectedPerfMetric(e.target.value as 'monthly' | 'total')}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-[var(--text-muted)]"
                >
                  <option value="monthly">Monthly Revenue</option>
                  <option value="total">Total Revenue</option>
                </select>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={perfData}>
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-muted)"
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    tick={{ fill: 'var(--text-muted)' }}
                    height={80}
                    tickMargin={10}
                  />
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

        
        </>
        )}
      </div>
    </main>
  );
}
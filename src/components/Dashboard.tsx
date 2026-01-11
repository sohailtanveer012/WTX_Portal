import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TrendingUp, DollarSign, Bell, Droplets, ArrowUpRight, Home, PieChart, Loader2, Briefcase, FileText, ExternalLink, Calendar, Percent } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, CartesianGrid, Cell } from 'recharts';
import { fetchInvestorPortfolioByEmail } from '../api/services';

type PortfolioRow = {
  investor_id?: number;
  investor_name: string;
  investor_email: string;
  investor_phone?: string;
  dob?: string;
  address?: string;
  company?: string;
  account_type?: string;
  ssn?: string;
  bank?: string;
  routing?: string;
  account?: string;
  project_id?: string;
  project_name: string;
  project_location?: string | null;
  project_status?: string;
  invested_amount: number;
  percentage_owned: number;
  payout_id?: string | number | null;
  payout_amount?: number | null;
  payout_month?: number | null;
  payout_year?: number | null;
  payout_created_at?: string | null;
  // Legacy fields for backward compatibility
  investment_amount?: number;
  ownership_percentage?: number;
  month?: string | number | null;
  year?: string | number | null;
  created_at?: string | null;
};

interface UserProfile {
  id?: string | number;
  full_name?: string;
  email?: string;
  [key: string]: unknown;
}

export function Dashboard({ userProfile, setActiveTab }: { userProfile?: UserProfile; setActiveTab?: (tab: string) => void }) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('6m');
  const [portfolio, setPortfolio] = useState<PortfolioRow[]>([]);
  const [loading, setLoading] = useState(true);
 

  // Fetch portfolio data when component mounts or userProfile changes
  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!userProfile?.email) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch portfolio using email address
        const portfolioData = await fetchInvestorPortfolioByEmail(userProfile.email);
        setPortfolio(portfolioData as PortfolioRow[]);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setPortfolio([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [userProfile?.email]);

  // Helper function to get month name
  const getMonthName = useCallback((monthNum: number): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNum - 1] || 'Unknown';
  }, []);

  // Helper function to get time ago
  const getTimeAgo = useCallback((date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 30) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }, []);

  // Group portfolio by project
  const groupedByProject = useMemo(() => {
    return portfolio.reduce<Record<string, PortfolioRow[]>>((acc, item) => {
      const key = item.project_name || 'Unknown Project';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [portfolio]);

  // Calculate stats from portfolio data
  const stats = useMemo(() => {
    // Sum unique investment amounts per project (avoid double counting)
    const projectInvestments = new Map<string, number>();
    portfolio.forEach(item => {
      const projectName = item.project_name || 'Unknown Project';
      if (!projectInvestments.has(projectName)) {
        // Support both new (invested_amount) and legacy (investment_amount) field names
        const amount = Number(item.invested_amount || item.investment_amount || 0);
        projectInvestments.set(projectName, amount);
      }
    });
    const totalInvestment = Array.from(projectInvestments.values()).reduce((sum, amount) => sum + amount, 0);

    // Calculate total return: sum of all payout amounts
    const payoutsWithAmounts = portfolio.filter(p => p.payout_amount && Number(p.payout_amount) > 0);
    const totalReturn = payoutsWithAmounts.reduce((sum, p) => sum + Number(p.payout_amount || 0), 0);

    // Calculate ROI %: (totalReturn / totalInvestment) * 100
    const roiPercentage = totalInvestment > 0 
      ? ((totalReturn / totalInvestment) * 100)
      : 0;

    const activeProjects = Object.keys(groupedByProject).length;

    return [
      {
        label: 'Total Invested Amount',
        value: `$${totalInvestment.toLocaleString()}`,
      icon: DollarSign,
      color: 'blue',
    },
    {
        label: 'Total Return',
        value: `$${totalReturn.toLocaleString()}`,
        icon: TrendingUp,
      color: 'green',
    },
    {
        label: 'ROI %',
        value: `${roiPercentage >= 0 ? '+' : ''}${roiPercentage.toFixed(1)}%`,
        icon: Percent,
      color: 'purple',
    },
    {
        label: 'Active Projects',
        value: activeProjects.toString(),
        icon: Droplets,
      color: 'yellow',
    },
  ];
  }, [portfolio, groupedByProject]);

  // Calculate YTD returns (from January 1st of current year to today)
  const ytdReturns = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const januaryFirst = new Date(currentYear, 0, 1);
    
    return portfolio
      .filter(p => {
        if (!p.payout_amount || !p.payout_year || !p.payout_month) return false;
        const payoutDate = new Date(Number(p.payout_year), Number(p.payout_month) - 1, 1);
        return payoutDate >= januaryFirst;
      })
      .reduce((sum, p) => sum + Number(p.payout_amount || 0), 0);
  }, [portfolio]);

  // Get monthly distribution statements available
  const monthlyStatements = useMemo(() => {
    const monthlyMap = new Map<string, { month: string; year: number; total: number }>();
    
    portfolio.forEach(item => {
      if (item.payout_amount && item.payout_month && item.payout_year) {
        const key = `${item.payout_year}-${String(item.payout_month).padStart(2, '0')}`;
        if (!monthlyMap.has(key)) {
          monthlyMap.set(key, {
            month: getMonthName(Number(item.payout_month)),
            year: Number(item.payout_year),
            total: 0
          });
        }
        const entry = monthlyMap.get(key)!;
        entry.total += Number(item.payout_amount || 0);
      }
    });

    return Array.from(monthlyMap.values())
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
      })
      .slice(0, 6); // Last 6 months
  }, [portfolio, getMonthName]);

  // Generate investment progress from portfolio data
  const investmentProgress = useMemo(() => {
    const TARGET_RETURN = 20000000; // $20 million - will be replaced with actual target from response later
    return Object.entries(groupedByProject).map(([projectName, projectData]) => {
      if (projectData.length === 0) return null;
      const first = projectData[0];
      const invested = Number(first.invested_amount || first.investment_amount || 0);
      const totalPayouts = projectData
        .filter(p => p.payout_amount)
        .reduce((sum, p) => sum + Number(p.payout_amount || 0), 0);

      return {
        name: projectName,
        invested,
        totalPayouts,
        targetReturn: TARGET_RETURN,
      };
    }).filter(Boolean) as Array<{ name: string; invested: number; totalPayouts: number; targetReturn: number }>;
  }, [groupedByProject]);


  // Generate portfolio growth chart data from monthly payouts
  const portfolioDataMap = useMemo(() => {
    // Group payouts by month/year
    const monthlyData: Record<string, { month: string; value: number; distribution: number }> = {};
    
    portfolio.forEach(item => {
      // Support both new (payout_month, payout_year) and legacy (month, year) field names
      const payoutMonth = item.payout_month || item.month;
      const payoutYear = item.payout_year || item.year;
      if (item.payout_amount && payoutMonth && payoutYear) {
        const key = `${payoutYear}-${String(payoutMonth).padStart(2, '0')}`;
        if (!monthlyData[key]) {
          monthlyData[key] = {
            month: getMonthName(Number(payoutMonth)),
            value: 0,
            distribution: 0,
          };
        }
        monthlyData[key].distribution += Number(item.payout_amount);
      }
    });

    // Calculate cumulative value (investment + cumulative payouts)
    // Sum unique investment amounts per project (avoid double counting)
    const projectInvestmentsMap = new Map<string, number>();
    portfolio.forEach(item => {
      const projectName = item.project_name || 'Unknown Project';
      if (!projectInvestmentsMap.has(projectName)) {
        projectInvestmentsMap.set(projectName, Number(item.invested_amount || item.investment_amount || 0));
      }
    });
    const totalInvestmentUnique = Array.from(projectInvestmentsMap.values()).reduce((sum, amount) => sum + amount, 0);
    let cumulativeValue = totalInvestmentUnique;
    
    const sortedMonths = Object.keys(monthlyData).sort();
    sortedMonths.forEach(key => {
      cumulativeValue += monthlyData[key].distribution;
      monthlyData[key].value = cumulativeValue;
    });

    const allData = sortedMonths.map(key => monthlyData[key]);
    
    // Get last 6 months
    const sixMonthsData = allData.slice(-6);
    // Get last 12 months
    const oneYearData = allData.slice(-12);

    return {
      '6m': sixMonthsData.length > 0 ? sixMonthsData : [
        { month: 'No Data', value: totalInvestmentUnique, distribution: 0 }
      ],
      '1y': oneYearData.length > 0 ? oneYearData : [
        { month: 'No Data', value: totalInvestmentUnique, distribution: 0 }
      ],
      'all': allData.length > 0 ? allData : [
        { month: 'No Data', value: totalInvestmentUnique, distribution: 0 }
      ],
    };
  }, [portfolio, getMonthName]);

  // Generate notifications from recent payouts
  const notifications = useMemo(() => {
    const recentPayouts = portfolio
      .filter(p => p.payout_amount && (p.payout_created_at || p.created_at))
      .sort((a, b) => {
        const dateA = a.payout_created_at ? new Date(a.payout_created_at).getTime() : (a.created_at ? new Date(a.created_at).getTime() : 0);
        const dateB = b.payout_created_at ? new Date(b.payout_created_at).getTime() : (b.created_at ? new Date(b.created_at).getTime() : 0);
        return dateB - dateA;
      })
      .slice(0, 3)
      .map(p => ({
        title: `${p.project_name || 'Project'} Distribution Payment Processed`,
        time: p.payout_created_at ? getTimeAgo(new Date(p.payout_created_at)) : (p.created_at ? getTimeAgo(new Date(p.created_at)) : 'Recently'),
        type: 'success' as const,
      }));

    return recentPayouts.length > 0 ? recentPayouts : [
      { title: 'Welcome to your dashboard', time: 'Just now', type: 'info' as const },
    ];
  }, [portfolio, getTimeAgo]);

interface TooltipPayload {
  payload: {
    value: number;
    distribution: number;
    barrels?: number;
    barrelPrice?: number;
  };
  }

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
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
        {data.barrels && data.barrelPrice && (
        <p style={{ color: 'var(--text-primary)', margin: '2px 0' }}>
          {data.barrels.toLocaleString()} BBL @ ${data.barrelPrice.toFixed(2)}/BBL
        </p>
        )}
        <p style={{ color: 'var(--text-primary)', margin: '2px 0' }}>
          Distribution: ${data.distribution.toLocaleString()} Monthly
        </p>
      </div>
    );
  }
  return null;
};
  
  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
            <p className="text-gray-400">Loading your portfolio...</p>
          </div>
        </div>
      </main>
    );
  }
  
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
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back, {portfolio.length > 0 ? portfolio[0].investor_name?.split(' ')[0] || 'Investor' : userProfile?.full_name?.split(' ')[0] || 'Investor'}</h1>
              <p className="text-[var(--text-muted)] mt-1">Here's an overview of your investment portfolio</p>
            </div>
          </div>
        </div>

        {/* Returns Summary & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Returns Summary */}
          <div className="lg:col-span-2 bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-green-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                Returns Summary
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-2">Total Returns</p>
                <p className="text-3xl font-bold text-green-400">
                  ${portfolio
                    .filter(p => p.payout_amount && Number(p.payout_amount) > 0)
                    .reduce((sum, p) => sum + Number(p.payout_amount || 0), 0)
                    .toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">All time cumulative returns</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-2">Year-to-Date (YTD)</p>
                <p className="text-3xl font-bold text-blue-400">
                  ${ytdReturns.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">Returns from Jan 1, {new Date().getFullYear()}</p>
              </div>
            </div>
          </div>

          {/* Quick Links to Statements */}
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                Quick Links
              </h2>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab?.('reports')}
                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <FileText className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">View All Reports</p>
                    <p className="text-xs text-gray-400">Statements & Performance</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </button>
              {monthlyStatements.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-gray-400 mb-2 px-2">Recent Statements</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {monthlyStatements.map((stmt, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTab?.('reports')}
                        className="w-full flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left group"
                      >
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-white">
                            {stmt.month} {stmt.year}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-blue-400 transition-colors">
                          ${stmt.total.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                  stat.label === 'ROI %' || 
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
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Investment Progress</h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">Track your investment performance across all projects</p>
            </div>
          </div>
          
          {investmentProgress.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No investment data available</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 mb-6">
              {investmentProgress.map((project, index) => {
                const returnPercentage = project.invested > 0 
                  ? ((project.totalPayouts / project.invested) * 100) 
                  : 0;
                const netReturn = project.totalPayouts - project.invested;
                const progressToTarget = project.targetReturn > 0 
                  ? Math.min((project.totalPayouts / project.targetReturn) * 100, 100)
                  : 0;
                const isPositive = netReturn >= 0;
                
                return (
                  <div key={index} className="bg-[var(--card-background-hover)] rounded-xl p-6 border border-white/10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">{project.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-[var(--text-muted)] text-xs block mb-1">ROI</span>
                            <span className={`font-semibold text-base ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                              {returnPercentage >= 0 ? '+' : ''}{returnPercentage.toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-[var(--text-muted)] text-xs block mb-1">Net Return</span>
                            <span className={`font-semibold text-base ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                              {netReturn >= 0 ? '+' : ''}${Math.abs(netReturn).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div>
                            <span className="text-[var(--text-muted)] text-xs block mb-1">Target Return</span>
                            <span className="font-semibold text-base text-[var(--text-primary)]">
                              ${project.targetReturn.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div>
                            <span className="text-[var(--text-muted)] text-xs block mb-1">Progress</span>
                            <span className="font-semibold text-base text-yellow-400">
                              {progressToTarget.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-[var(--text-primary)]">
                          ${project.totalPayouts.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">Total Returns</div>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="space-y-3">
                      <div className="relative h-12 bg-[var(--card-background)] rounded-lg overflow-hidden">
                        {/* Investment Base Layer */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-indigo-600/30 flex items-center px-4"
                          style={{ width: `${Math.min((project.invested / Math.max(project.targetReturn, project.invested * 2)) * 100, 100)}%` }}
                        >
                          <span className="text-xs font-medium text-white/90">Invested: ${project.invested.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                        
                        {/* Returns Layer */}
                        {project.totalPayouts > 0 && (
                          <div 
                            className={`absolute inset-0 flex items-center px-4 transition-all duration-500 ${
                              isPositive 
                                ? 'bg-gradient-to-r from-green-500/60 to-green-600/60' 
                                : 'bg-gradient-to-r from-red-500/60 to-red-600/60'
                            }`}
                            style={{ 
                              width: `${Math.min((project.totalPayouts / Math.max(project.targetReturn, project.invested * 2)) * 100, 100)}%`,
                              left: `${Math.min((project.invested / Math.max(project.targetReturn, project.invested * 2)) * 100, 100)}%`
                            }}
                          >
                            {project.totalPayouts > project.invested && (
                              <span className="text-xs font-medium text-white/90 ml-auto">
                                Returns: ${project.totalPayouts.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Target Indicator Line */}
                        {project.targetReturn > 0 && (
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-yellow-400/60 border-l-2 border-dashed border-yellow-400"
                            style={{ left: `${Math.min((project.targetReturn / Math.max(project.targetReturn, project.invested * 2)) * 100, 100)}%` }}
                          >
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                              <span className="text-xs font-medium text-yellow-400 bg-[var(--card-background)] px-2 py-1 rounded">Target</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Progress Percentage Display */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[var(--text-muted)]">Progress to Target Return</span>
                          <span className="text-lg font-bold text-yellow-400">{progressToTarget.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-[var(--card-background)] rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 rounded-full ${
                              progressToTarget >= 100 
                                ? 'bg-gradient-to-r from-green-500 to-green-600'
                                : progressToTarget >= 75
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                : progressToTarget >= 50
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                : 'bg-gradient-to-r from-orange-500 to-orange-600'
                            }`}
                            style={{ width: `${Math.min(progressToTarget, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
                          <span>${project.totalPayouts.toLocaleString('en-US', { maximumFractionDigits: 0 })} of ${project.targetReturn.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                          {progressToTarget >= 100 && (
                            <span className="text-green-400 font-medium">Target Achieved! 🎉</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Stats Row */}
                      <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                        <div className="bg-[var(--card-background)] rounded-lg p-3">
                          <div className="text-[var(--text-muted)] text-xs mb-1">Initial Investment</div>
                          <div className="text-[var(--text-primary)] font-semibold">
                            ${project.invested.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                        <div className="bg-[var(--card-background)] rounded-lg p-3">
                          <div className="text-[var(--text-muted)] text-xs mb-1">Total Returns</div>
                          <div className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            ${project.totalPayouts.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary Cards */}
          {investmentProgress.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {(() => {
                const totalInvested = investmentProgress.reduce((sum, p) => sum + p.invested, 0);
                const totalReturns = investmentProgress.reduce((sum, p) => sum + p.totalPayouts, 0);
                const totalNetReturn = totalReturns - totalInvested;
                const avgReturnPercentage = totalInvested > 0 ? ((totalReturns / totalInvested - 1) * 100) : 0;
                
                return (
                  <>
                    <div className="bg-[var(--card-background-hover)] rounded-xl p-4 border border-blue-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[var(--text-muted)]">Total Invested</span>
                        <DollarSign className="h-4 w-4 text-blue-400" />
                      </div>
                      <p className="text-2xl font-semibold text-[var(--text-primary)]">
                        ${totalInvested.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="bg-[var(--card-background-hover)] rounded-xl p-4 border border-green-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[var(--text-muted)]">Total Returns</span>
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      </div>
                      <p className="text-2xl font-semibold text-green-400">
                        ${totalReturns.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className={`bg-[var(--card-background-hover)] rounded-xl p-4 border ${totalNetReturn >= 0 ? 'border-green-500/20' : 'border-red-500/20'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[var(--text-muted)]">Net Return</span>
                        <ArrowUpRight className={`h-4 w-4 ${totalNetReturn >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                      </div>
                      <p className={`text-2xl font-semibold ${totalNetReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalNetReturn >= 0 ? '+' : ''}${totalNetReturn.toLocaleString('en-US', { maximumFractionDigits: 0 })} ({avgReturnPercentage >= 0 ? '+' : ''}{avgReturnPercentage.toFixed(1)}%)
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
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

          {/* Notifications Panel */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-purple-500/10">
                <Bell className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Recent Updates</h2>
            </div>
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
    </main>
  );
}
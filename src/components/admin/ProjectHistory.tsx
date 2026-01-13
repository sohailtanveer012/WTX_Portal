import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Calendar, DollarSign, Users, History as HistoryIcon, Calculator, UserPlus } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { fetchProjectInvestorsByMonth, fetchProjectRevenueByMonth, fetchInvestorsByProject } from '../../api/services';
import { ProjectPayout } from './ProjectPayout';
import { AddInvestorModal } from './AddInvestorModal';
import { supabase } from '../../supabaseClient';

type ProjectLike = Record<string, unknown> | string | number;

type InvestorLike = {
  investor_id?: number | string;
  investor_name?: string;
  investor_email?: string;
  percentage_owned?: number;
  payout_amount?: number;
  investment_amount?: number;
};

interface ProjectHistoryProps {
  projectId: ProjectLike;
  project: Record<string, unknown> | null;
  onBack: () => void;
}

type HistoryRow = {
  key: string;
  label: string;
  revenue: number;
  investors: InvestorLike[];
  investorCount: number;
  totalPayout: number;
};

// Fetch all months that have revenue data for a project
async function fetchAvailableMonths(projectId: string | number): Promise<Array<{ key: string; label: string }>> {
  try {
    // Try different possible table names
    const tableNames = ['monthly_revenue', 'revenue', 'project_revenue', 'revenues'];
    let data: any[] = [];
    let error: any = null;

    for (const tableName of tableNames) {
      const result = await supabase
        .from(tableName)
        .select('year, month')
        .eq('project_id', projectId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (!result.error && result.data && result.data.length > 0) {
        data = result.data;
        break;
      }
      if (result.error && !result.error.message.includes('relation') && !result.error.message.includes('does not exist')) {
        error = result.error;
      }
    }

    if (error) {
      console.error('Error fetching available months:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Convert to month keys and labels
    const months = data.map((row: any) => {
      const year = row.year;
      const month = String(row.month).padStart(2, '0');
      const key = `${year}-${month}`;
      const date = new Date(year, parseInt(month) - 1, 1);
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      return { key, label };
    });

    // Remove duplicates and sort (most recent first)
    const uniqueMonths = Array.from(
      new Map(months.map(m => [m.key, m])).values()
    ).sort((a, b) => b.key.localeCompare(a.key));

    return uniqueMonths;
  } catch (err) {
    console.error('Failed to fetch available months:', err);
    return [];
  }
}

export function ProjectHistory({ projectId, project, onBack }: ProjectHistoryProps) {
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [showPayout, setShowPayout] = useState(false);
  const [showAddInvestorModal, setShowAddInvestorModal] = useState(false);
  const [projectInvestors, setProjectInvestors] = useState<InvestorLike[]>([]);

  const actualProjectId =
    typeof projectId === 'object'
      ? (projectId as Record<string, unknown>).project_id ||
        (projectId as Record<string, unknown>).id ||
        (projectId as Record<string, unknown>).ID ||
        (projectId as Record<string, unknown>).PROJECT_ID
      : projectId;

  useEffect(() => {
    const load = async () => {
      if (!actualProjectId) return;
      setIsLoading(true);
      try {
        // Fetch only months that have revenue data
        const months = await fetchAvailableMonths(String(actualProjectId));
        
        if (months.length === 0) {
          setHistory([]);
          setIsLoading(false);
          return;
        }

        const rows = await Promise.all(
          months.map(async ({ key, label }) => {
            const [revenue, investors] = await Promise.all([
              fetchProjectRevenueByMonth(String(actualProjectId), key),
              fetchProjectInvestorsByMonth(String(actualProjectId), key),
            ]);
            const totalPayout = investors.reduce(
              (sum: number, inv: InvestorLike) => sum + Number(inv.payout_amount || 0),
              0
            );
            return {
              key,
              label,
              revenue: Number(revenue || 0),
              investors,
              investorCount: investors.length,
              totalPayout,
            };
          })
        );
        setHistory(rows);
      } catch (err) {
        console.error('Failed to load project history', err);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [actualProjectId]);

  // Get unique years from history
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    history.forEach((row) => {
      const year = row.key.split('-')[0];
      years.add(year);
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)); // Most recent first
  }, [history]);

  // Set default year to the most recent year with data
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const filteredHistory = useMemo(
    () => history.filter((row) => row.key.startsWith(selectedYear + '-')),
    [history, selectedYear]
  );

  const chartData = useMemo(() => {
    return history
      .slice(0, 12) // latest 12 months
      .reverse()
      .map((row) => ({
        month: new Date(row.key + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: row.revenue,
        payout: row.totalPayout,
      }));
  }, [history]);

  const totals = useMemo(() => {
    const totalRevenue = history.reduce((sum, row) => sum + row.revenue, 0);
    const totalPayout = history.reduce((sum, row) => sum + row.totalPayout, 0);
    const uniqueInvestors = new Set(history.flatMap((row) => row.investors.map((inv) => inv.investor_id))).size;
    return { totalRevenue, totalPayout, uniqueInvestors, monthsActive: history.length };
  }, [history]);

  const toggle = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const projectName = useMemo(() => {
    if (!project) return 'Project';
    const p = project as Record<string, unknown>;
    return (
      (p.name as string) ||
      (p.project_name as string) ||
      (p.PROJECT_NAME as string) ||
      (p.title as string) ||
      'Project'
    );
  }, [project]);

  // Fetch investors when payout modal is about to open
  useEffect(() => {
    if (showPayout && actualProjectId) {
      const loadInvestors = async () => {
        try {
          const investors = await fetchInvestorsByProject(String(actualProjectId));
          setProjectInvestors(investors);
        } catch (err) {
          console.error('Failed to load investors for payout', err);
          setProjectInvestors([]);
        }
      };
      loadInvestors();
    }
  }, [showPayout, actualProjectId]);

  // Show payout view if requested
  if (showPayout) {
    const projectIdString = String(actualProjectId);
    const projectData = project as Record<string, unknown> || {};
    return (
      <ProjectPayout
        projectId={projectIdString}
        project={{
          id: projectIdString,
          name: projectName,
          location: projectData.location as string,
          status: projectData.status as string,
          investors: projectData.investors as number,
          totalInvestment: projectData.totalInvestment as string,
          monthlyRevenue: projectData.monthlyRevenue as string,
          completionDate: projectData.completionDate as string,
          description: projectData.description as string,
          startDate: projectData.startDate as string,
          operatingCosts: projectData.operatingCosts as string,
          productionRate: projectData.productionRate as string,
          recoveryRate: projectData.recoveryRate as string,
          wellCount: projectData.wellCount as number,
          hasInvestorGroups: projectData.hasInvestorGroups as boolean,
        }}
        investors={projectInvestors.map(inv => ({
          investor_id: inv.investor_id,
          investor_name: inv.investor_name || '',
          investor_email: inv.investor_email || '',
          percentage_owned: inv.percentage_owned || 0,
          payout_amount: inv.payout_amount,
          investment_amount: inv.investment_amount,
        }))}
        onBack={() => setShowPayout(false)}
      />
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white">Full History ({projectName})</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-400">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Started {project?.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                </span>
                <span className="flex items-center">
                  <HistoryIcon className="h-4 w-4 mr-1" />
                  {totals.monthsActive} months tracked
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
              onClick={() => setShowAddInvestorModal(true)}
              className="flex items-center px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add New User
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-green-500/20">
            <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
            <p className="text-2xl font-semibold text-white mt-2">
              ${totals.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20">
            <p className="text-gray-400 text-sm font-medium">Total Payouts</p>
            <p className="text-2xl font-semibold text-white mt-2">
              ${totals.totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-purple-500/20">
            <p className="text-gray-400 text-sm font-medium">Unique Investors</p>
            <p className="text-2xl font-semibold text-white mt-2">{totals.uniqueInvestors}</p>
          </div>
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-yellow-500/20">
            <p className="text-gray-400 text-sm font-medium">Months Active</p>
            <p className="text-2xl font-semibold text-white mt-2">{totals.monthsActive}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Revenue Over Time</h2>
            </div>
            <div className="h-[280px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-gray-400">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="historyRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} tickMargin={8} />
                    <YAxis
                      stroke="var(--text-muted)"
                      width={90}
                      allowDecimals={false}
                      tick={{ fill: 'var(--text-muted)' }}
                      tickFormatter={(v) => `$${Number(v).toLocaleString('en-US')}`}
                    />
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card-background)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.75rem',
                      }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#historyRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Payouts Over Time</h2>
            </div>
            <div className="h-[280px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-gray-400">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} tickMargin={8} />
                    <YAxis
                      stroke="var(--text-muted)"
                      width={90}
                      allowDecimals={false}
                      tick={{ fill: 'var(--text-muted)' }}
                      tickFormatter={(v) => `$${Number(v).toLocaleString('en-US')}`}
                    />
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card-background)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.75rem',
                      }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Payout']}
                    />
                    <Bar dataKey="payout" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-white">Monthly Breakdown</h2>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-gray-400"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="text-center text-gray-400 py-8">Loading history...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No historical data available</div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((row, idx) => (
                <div
                  key={row.key}
                  className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <Calendar className="h-6 w-6 text-blue-400" />
                        </div>
                        {idx < filteredHistory.length - 1 && <div className="w-0.5 h-12 bg-blue-500/20 mt-2" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{row.label}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Revenue: ${row.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Payouts: ${row.totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            Investors: {row.investorCount}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggle(row.key)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:bg-white/10 transition-colors text-sm"
                    >
                      {expanded[row.key] ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>

                  {expanded[row.key] && row.investors.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Investor</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Percentage</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Investment</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Payout</th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.investors.map((inv, invIdx) => (
                              <tr key={inv.investor_id || invIdx} className="border-b border-white/10 hover:bg-white/5">
                                <td className="px-4 py-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                      <span className="text-blue-400 font-semibold text-sm">
                                        {inv.investor_name?.split(' ').map((n: string) => n[0]).join('')}
                                      </span>
                                    </div>
                                    <div className="font-medium text-white">{inv.investor_name}</div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-gray-300">{inv.investor_email}</td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    {(inv.percentage_owned || 0).toFixed(2)}%
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-white">
                                  {inv.investment_amount ? `$${inv.investment_amount.toLocaleString()}` : 'N/A'}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-medium text-green-400">
                                    ${(inv.payout_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddInvestorModal
        isOpen={showAddInvestorModal}
        onClose={() => setShowAddInvestorModal(false)}
        onSuccess={() => {
          // Refresh the history to reload investors list
          window.location.reload();
        }}
        preselectedProjectId={String(actualProjectId)}
        preselectedProjectName={projectName}
      />
    </main>
  );
}


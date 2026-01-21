import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, Edit2, DollarSign, Percent, X, Check, AlertCircle } from 'lucide-react';
import { fetchInvestorPortfolio, updateInvestment, fetchProjectsWithInvestorCount } from '../../api/services';
import { supabase } from '../../supabaseClient';

type PortfolioRow = {
  investor_name: string;
  investor_email: string;
  project_name: string;
  project_id?: string;
  investment_amount: number;
  ownership_percentage: number;
  payout_amount?: number | null;
  payout_id?: string | number | null;
  month?: string | null;
  year?: string | number | null;
  created_at?: string | null;
};

interface InvestorPortfolioProps {
  investorId: number;
  onBack: () => void;
}

export function InvestorPortfolio({ investorId, onBack }: InvestorPortfolioProps) {
  const [portfolio, setPortfolio] = useState<PortfolioRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [investorInfo, setInvestorInfo] = useState<{ name: string; email: string } | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ invested_amount: string; percentage_owned: string }>({ invested_amount: '', percentage_owned: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Array<{ id: string; project_name: string }>>([]);

  // Helper function to convert month number to month name
  const getMonthName = (monthNum: number | string | null | undefined): string => {
    if (!monthNum) return '-';
    const num = typeof monthNum === 'string' ? parseInt(monthNum, 10) : monthNum;
    if (isNaN(num) || num < 1 || num > 12) return String(monthNum);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[num - 1] || String(monthNum);
  };

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const rows: PortfolioRow[] = (await fetchInvestorPortfolio(investorId)) as unknown as PortfolioRow[];
      
      // If project_id is not in the response, fetch it by matching project names
      const rowsWithProjectId = await Promise.all(
        rows.map(async (row) => {
          if (row.project_id) {
            return row;
          }
          // Try to find project_id by matching project name
          try {
            const { data: projectData, error } = await supabase
              .from('Projects')
              .select('id, project_name')
              .ilike('project_name', row.project_name)
              .limit(1)
              .single();
            
            if (!error && projectData) {
              return { ...row, project_id: String(projectData.id || projectData.ID || '') };
            }
          } catch (e) {
            console.error('Error fetching project ID:', e);
          }
          return row;
        })
      );
      
      setPortfolio(rowsWithProjectId);

      if (rowsWithProjectId.length > 0) {
        setInvestorInfo({
          name: rowsWithProjectId[0].investor_name,
          email: rowsWithProjectId[0].investor_email,
        });
      } else {
        setInvestorInfo(null);
      }
    } catch (err) {
      console.error('Error fetching portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await fetchProjectsWithInvestorCount();
      const mapped = (data || []).map((p: any) => ({
        id: String(p.id || p.project_id || p.ID || p.PROJECT_ID),
        project_name: p.project_name || p.name || p.NAME || p.PROJECT_NAME || 'Unknown Project',
      }));
      setProjects(mapped);
    } catch (e) {
      console.error('Failed to load projects:', e);
      setProjects([]);
    }
  };

  // Group by project name
  const groupedByProject = useMemo(() => {
    return portfolio.reduce<Record<string, PortfolioRow[]>>((acc, item) => {
      const key = item.project_name || 'Unknown Project';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [portfolio]);

  const handleEditClick = (projectName: string) => {
    const projectData = groupedByProject[projectName] || [];
    if (projectData.length > 0) {
      const first = projectData[0];
      setEditFormData({
        invested_amount: String(first.investment_amount || 0),
        percentage_owned: String(first.ownership_percentage || 0),
      });
      setEditingProject(projectName);
      setUpdateError(null);
    }
  };

  const handleUpdateInvestment = async () => {
    if (!editingProject) return;
    
    const projectData = groupedByProject[editingProject] || [];
    if (projectData.length === 0) {
      setUpdateError('No project data found. Please refresh and try again.');
      return;
    }
    
    const first = projectData[0];
    const projectId = first.project_id;
    
    if (!projectId) {
      setUpdateError('Project ID not found. Please refresh and try again.');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const investedAmount = parseFloat(editFormData.invested_amount);
      const percentageOwned = parseFloat(editFormData.percentage_owned);

      if (isNaN(investedAmount) || investedAmount < 0) {
        throw new Error('Investment amount must be a valid number');
      }

      if (isNaN(percentageOwned) || percentageOwned < 0 || percentageOwned > 100) {
        throw new Error('Ownership percentage must be between 0 and 100');
      }

      console.log('Updating investment with:', {
        investor_id: investorId,
        project_id: projectId,
        invested_amount: investedAmount,
        percentage_owned: percentageOwned,
      });

      await updateInvestment({
        investor_id: investorId,
        project_id: projectId,
        invested_amount: investedAmount,
        percentage_owned: percentageOwned,
      });

      // Refresh portfolio data
      await fetchPortfolio();
      setEditingProject(null);
      setEditFormData({ invested_amount: '', percentage_owned: '' });
    } catch (err: any) {
      console.error('Error updating investment:', err);
      setUpdateError(err.message || 'Failed to update investment. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Auto-fetch when the view opens or investorId changes
  useEffect(() => {
    fetchPortfolio();
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investorId]);

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-gray-300 transition-colors border border-white/10"
              aria-label="Back"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Investor Portfolio</h1>
          </div>
        </div>

        {investorInfo && (
          <div className="mb-6 p-4 rounded-2xl bg-card-gradient border border-white/10 hover-neon-glow">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">{investorInfo.name}</h2>
            <p className="text-[var(--text-muted)]">{investorInfo.email}</p>
          </div>
        )}

        <div className="grid gap-6">
          {Object.keys(groupedByProject).map((projectName) => {
            const projectData = groupedByProject[projectName] || [];
            if (projectData.length === 0) return null;
            const first = projectData[0];
            const investmentAmount = Number(first.investment_amount || 0);
            const ownershipPct = Number(first.ownership_percentage || 0);
            const totalPayouts = projectData
              .filter((p) => p.payout_amount)
              .reduce((sum, p) => sum + Number(p.payout_amount || 0), 0);

            return (
              <div key={projectName} className="bg-card-gradient rounded-2xl p-4 sm:p-6 hover-neon-glow border border-white/10">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{projectName}</h3>
                  <button
                    onClick={() => handleEditClick(projectName)}
                    className="flex items-center px-4 py-2 rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-sm transition-colors"
                    title="Edit Investment Info"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Investment Info
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-[var(--text-muted)] text-sm">Investment</p>
                    <p className="font-medium text-[var(--text-primary)]">${investmentAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] text-sm">Ownership</p>
                    <p className="font-medium text-[var(--text-primary)]">{ownershipPct}%</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] text-sm">Total Payouts</p>
                    <p className="font-medium text-[var(--text-primary)]">${totalPayouts.toLocaleString()}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-white/10 rounded-xl overflow-hidden">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-3 text-[var(--text-muted)] font-medium">Month</th>
                        <th className="text-left p-3 text-[var(--text-muted)] font-medium">Year</th>
                        <th className="text-right p-3 text-[var(--text-muted)] font-medium">Payout Amount</th>
                        <th className="text-right p-3 text-[var(--text-muted)] font-medium">Date Recorded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectData.map((p) => (
                        <tr key={(p.payout_id || `${projectName}-${p.month}-${p.year}-${Math.random()}`) as React.Key} className="border-t border-white/10">
                          <td className="p-3 text-[var(--text-primary)]">{getMonthName(p.month)}</td>
                          <td className="p-3 text-[var(--text-primary)]">{p.year || '-'}</td>
                          <td className="p-3 text-right text-[var(--text-primary)]">
                            {p.payout_amount ? `$${Number(p.payout_amount).toLocaleString()}` : '-'}
                          </td>
                          <td className="p-3 text-right text-[var(--text-muted)]">
                            {p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {portfolio.length === 0 && !loading && (
            <div className="p-8 text-center text-[var(--text-muted)] border border-dashed border-white/10 rounded-2xl">
              No portfolio data.
            </div>
          )}
        </div>
      </div>

      {/* Edit Investment Info Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card-gradient rounded-2xl p-6 max-w-lg w-full border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Edit Investment Info</h3>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setUpdateError(null);
                  setEditFormData({ invested_amount: '', percentage_owned: '' });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-blue-400 text-sm font-medium mb-2">Project: <span className="text-white">{editingProject}</span></p>
              <p className="text-gray-400 text-xs mt-2">
                <AlertCircle className="inline h-3 w-3 mr-1" />
                Note: Changes will only affect future payouts. Previous payouts will remain unchanged.
              </p>
            </div>

            {updateError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{updateError}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Investment Amount <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter investment amount"
                  value={editFormData.invested_amount}
                  onChange={(e) => setEditFormData({ ...editFormData, invested_amount: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Current investment amount for this project</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <Percent className="inline h-4 w-4 mr-1" />
                  Percentage Ownership <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Enter ownership percentage (0-100)"
                  value={editFormData.percentage_owned}
                  onChange={(e) => setEditFormData({ ...editFormData, percentage_owned: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Ownership percentage (e.g., 5.25 for 5.25%)</p>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setUpdateError(null);
                    setEditFormData({ invested_amount: '', percentage_owned: '' });
                  }}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateInvestment}
                  className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Update
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}



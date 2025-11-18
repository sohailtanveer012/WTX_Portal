import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { fetchInvestorPortfolio } from '../../api/services';

type PortfolioRow = {
  investor_name: string;
  investor_email: string;
  project_name: string;
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

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const rows: PortfolioRow[] = (await fetchInvestorPortfolio(investorId)) as unknown as PortfolioRow[];
      setPortfolio(rows);

      if (rows.length > 0) {
        setInvestorInfo({
          name: rows[0].investor_name,
          email: rows[0].investor_email,
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

  // Auto-fetch when the view opens or investorId changes
  useEffect(() => {
    fetchPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investorId]);

  // Group by project name
  const groupedByProject = useMemo(() => {
    return portfolio.reduce<Record<string, PortfolioRow[]>>((acc, item) => {
      const key = item.project_name || 'Unknown Project';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [portfolio]);

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
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{projectName}</h3>
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
                          <td className="p-3 text-[var(--text-primary)]">{p.month || '-'}</td>
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
    </main>
  );
}



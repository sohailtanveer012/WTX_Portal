// AdminUsers.tsx
import React, { useEffect, useState } from 'react';
import { fetchInvestorsWithTotalProjectsAndInvestment } from '../../api/services';
import { DollarSign } from 'lucide-react';
import { InvestorPortfolio } from './InvestorPortfolio';
import { InvestorPersonalInfoModal } from './InvestorPersonalInfoModal';

// Narrow type for RPC result rows
type InvestorRow = {
  investor_id: number;
  investor_name: string;
  total_projects: number;
  total_payout_amount: number;
};

type AdminUsersProps = {
  initialSelectedUser?: unknown;
};

export function AdminUsers({ initialSelectedUser }: AdminUsersProps) {
  // initialSelectedUser is reserved for future use
  void initialSelectedUser;
  const [rows, setRows] = useState<InvestorRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [search, setSearch] = useState('');
  const [viewInvestorId, setViewInvestorId] = useState<number | null>(null);
  const [viewPersonalInfoId, setViewPersonalInfoId] = useState<number | null>(null);
  const [viewPersonalInfoName, setViewPersonalInfoName] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
    setIsLoading(true);
      const data = await fetchInvestorsWithTotalProjectsAndInvestment();
      if (mounted) {
        setRows((data ?? []) as InvestorRow[]);
        setPage(1);
      setIsLoading(false);
    }
    })();
    return () => { mounted = false; };
  }, []);

  const normalizedQuery = search.trim().toLowerCase();
  const filteredRows = normalizedQuery
    ? rows.filter(r =>
        (r.investor_name || '').toLowerCase().includes(normalizedQuery)
        || String(r.investor_id).includes(normalizedQuery)
        || String(r.total_payout_amount || 0).includes(normalizedQuery)
      )
    : rows;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + pageSize);

  // If viewing a specific investor portfolio
  if (viewInvestorId !== null) {
    return (
      <InvestorPortfolio
        investorId={viewInvestorId}
        onBack={() => setViewInvestorId(null)}
      />
    );
  }

  // Render the table of investors
  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Investor Management</h1>
          </div>
        </div>
        {/* Search */}
        <div className="mb-4">
            <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search investors"
            className="w-full bg-card-gradient border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
          />
        </div>
        <div className="bg-card-gradient rounded-2xl overflow-hidden hover-neon-glow">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading investors...</div>
          ) : (
          <div className="overflow-x-auto min-w-full">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">Investor</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">Total Projects</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">Total Payout Amount</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((r) => (
                    <tr key={r.investor_id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="px-4 sm:px-6 py-4 text-white">{r.investor_name}</td>
                      <td className="px-4 sm:px-6 py-4 text-white">{r.total_projects}</td>
                      <td className="px-4 sm:px-6 py-4 text-white">
                        <span className="font-medium text-green-400">
                          ${(r.total_payout_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-white">
                        <div className="flex items-center space-x-2">
                          <button
                            className="px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-sm"
                            title="View Portfolio"
                            onClick={() => setViewInvestorId(r.investor_id)}
                          >
                            View Portfolio
                          </button>
                          <button
                            className="px-3 py-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-sm"
                            title="View Personal Info"
                            onClick={() => {
                              setViewPersonalInfoId(r.investor_id);
                              setViewPersonalInfoName(r.investor_name);
                            }}
                          >
                            View Personal Info
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 sm:px-6 py-8 text-center text-gray-400">No investors found</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-white/10">
                <div className="text-sm text-gray-400">
                  Showing {filteredRows.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, filteredRows.length)} of {filteredRows.length}
                </div>
                <div className="flex items-center gap-2">
                        <button
                    className={`px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-sm ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5 text-white'}`}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                        >
                    Previous
                        </button>
                  <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
                        <button
                    className={`px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-sm ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5 text-white'}`}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                            </div>
                            </div>
                          </div>
          )}
        </div>
      </div>

      {/* Personal Info Modal */}
      {viewPersonalInfoId !== null && (
        <InvestorPersonalInfoModal
          investorId={viewPersonalInfoId}
          investorName={viewPersonalInfoName}
          isOpen={viewPersonalInfoId !== null}
          onClose={() => {
            setViewPersonalInfoId(null);
            setViewPersonalInfoName('');
          }}
        />
      )}
    </main>
  );
}
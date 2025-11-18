import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Download, Calendar, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { fetchInvestorPortfolioByEmail } from '../api/services';

type PortfolioRow = {
  investor_id?: number | string;
  investor_name?: string;
  investor_email?: string;
  project_name?: string;
  invested_amount?: number;
  investment_amount?: number;
  payout_amount?: number;
  payout_month?: number;
  payout_year?: number;
  payout_created_at?: string;
  created_at?: string;
  percentage_owned?: number;
  [key: string]: unknown;
};

interface UserProfile {
  id?: string | number;
  email?: string;
  full_name?: string;
  [key: string]: unknown;
}

export function Reports({ userProfile }: { userProfile?: UserProfile }) {
  const [portfolio, setPortfolio] = useState<PortfolioRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch portfolio data
  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile?.email) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const portfolioData = await fetchInvestorPortfolioByEmail(userProfile.email);
        setPortfolio(portfolioData as PortfolioRow[]);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setPortfolio([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile?.email]);

  // Helper function to get month name
  const getMonthName = (monthNum: number): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNum - 1] || 'Unknown';
  };

  // Group portfolio by project
  const groupedByProject = useMemo(() => {
    return portfolio.reduce<Record<string, PortfolioRow[]>>((acc, item) => {
      const key = item.project_name || 'Unknown Project';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [portfolio]);

  // Generate monthly distribution statements data
  const monthlyDistributions = useMemo(() => {
    const monthlyMap = new Map<string, { month: string; year: number; total: number; projects: Record<string, number> }>();
    
    portfolio.forEach(item => {
      if (item.payout_amount && item.payout_month && item.payout_year) {
        const key = `${item.payout_year}-${String(item.payout_month).padStart(2, '0')}`;
        const projectName = item.project_name || 'Unknown';
        
        if (!monthlyMap.has(key)) {
          monthlyMap.set(key, {
            month: getMonthName(Number(item.payout_month)),
            year: Number(item.payout_year),
            total: 0,
            projects: {}
          });
        }
        
        const entry = monthlyMap.get(key)!;
        entry.total += Number(item.payout_amount || 0);
        entry.projects[projectName] = (entry.projects[projectName] || 0) + Number(item.payout_amount || 0);
      }
    });

    return Array.from(monthlyMap.values())
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
      });
  }, [portfolio]);

  // Generate project performance breakdowns
  const projectPerformance = useMemo(() => {
    return Object.entries(groupedByProject).map(([projectName, projectData]) => {
      const invested = Number(projectData[0]?.invested_amount || projectData[0]?.investment_amount || 0);
      const totalPayouts = projectData
        .filter(p => p.payout_amount)
        .reduce((sum, p) => sum + Number(p.payout_amount || 0), 0);
      const returnPct = invested > 0 ? ((totalPayouts / invested) * 100) : 0;
      const percentageOwned = projectData[0]?.percentage_owned || 0;

      // Monthly payouts for this project
      const monthlyPayouts = projectData
        .filter(p => p.payout_amount && p.payout_month && p.payout_year)
        .map(p => ({
          month: getMonthName(Number(p.payout_month)),
          year: Number(p.payout_year),
          amount: Number(p.payout_amount || 0),
          sortKey: `${p.payout_year}-${String(p.payout_month).padStart(2, '0')}`
        }))
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .slice(-12); // Last 12 months

      return {
        name: projectName,
        invested,
        totalPayouts,
        returnPct,
        percentageOwned,
        monthlyPayouts
      };
    });
  }, [groupedByProject]);

  // Generate earnings timeline data
  const earningsTimeline = useMemo(() => {
    const timelineMap = new Map<string, number>();
    
    portfolio.forEach(item => {
      if (item.payout_amount && item.payout_month && item.payout_year) {
        const key = `${item.payout_year}-${String(item.payout_month).padStart(2, '0')}`;
        timelineMap.set(key, (timelineMap.get(key) || 0) + Number(item.payout_amount || 0));
      }
    });

    let cumulative = 0;
    return Array.from(timelineMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, amount]) => {
        cumulative += amount;
        const [year, month] = key.split('-');
        const monthName = getMonthName(Number(month));
        return {
          month: monthName,
          year: Number(year),
          earnings: amount,
          cumulative,
          label: `${monthName.substring(0, 3)} '${year.slice(-2)}`
        };
      })
      .slice(-24); // Last 24 months
  }, [portfolio]);

  // Generate PDF for monthly distribution statement
  const generateDistributionPDF = (month: string, year: number, total: number, projects: Record<string, number>) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const investorName = portfolio[0]?.investor_name || userProfile?.full_name || 'Investor';
    const investorEmail = portfolio[0]?.investor_email || userProfile?.email || '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Distribution Statement - ${month} ${year}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
            .header { margin-bottom: 30px; }
            .info { margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #0066cc; color: white; }
            .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; }
            .footer { margin-top: 40px; font-size: 0.9em; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Monthly Distribution Statement</h1>
            <div class="info"><strong>Period:</strong> ${month} ${year}</div>
            <div class="info"><strong>Investor:</strong> ${investorName}</div>
            <div class="info"><strong>Email:</strong> ${investorEmail}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Distribution Amount</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(projects).map(([project, amount]) => `
                <tr>
                  <td>${project}</td>
                  <td>$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">Total Distribution: $${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>This is an automated statement. Please contact support for any questions.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Reports & Documents</h1>
                <p className="text-gray-400 mt-1">Access your distribution statements, performance reports, and tax documents</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Distribution Statements */}
        <div className="bg-card-gradient rounded-2xl p-6 mb-8 hover-neon-glow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-400" />
              Monthly Distribution Statements
            </h2>
          </div>
          {monthlyDistributions.length > 0 ? (
          <div className="space-y-4">
              {monthlyDistributions.map((dist, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                  <div className="flex-1">
                    <h3 className="text-white font-medium">
                      {dist.month} {dist.year} Distribution Statement
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Total: ${dist.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Projects: {Object.keys(dist.projects).join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => generateDistributionPDF(dist.month, dist.year, dist.total, dist.projects)}
                    className="flex items-center px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No distribution statements available yet.</p>
          )}
        </div>

        {/* Project-Level Performance Breakdowns */}
        <div className="bg-card-gradient rounded-2xl p-6 mb-8 hover-neon-glow">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
            Project-Level Performance Breakdowns
          </h2>
          {projectPerformance.length > 0 ? (
            <div className="space-y-8">
              {projectPerformance.map((project, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-400">Invested Amount</p>
                        <p className="text-xl font-semibold text-white">
                          ${project.invested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Returns</p>
                        <p className="text-xl font-semibold text-green-400">
                          ${project.totalPayouts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                  </div>
                  <div>
                        <p className="text-sm text-gray-400">Return %</p>
                        <p className="text-xl font-semibold text-blue-400">
                          {project.returnPct.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  {project.monthlyPayouts.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-400 mb-4">Monthly Payouts (Last 12 Months)</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={project.monthlyPayouts}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} />
                          <YAxis stroke="#9CA3AF" fontSize={12} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                            labelStyle={{ color: '#F3F4F6' }}
                          />
                          <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                </div>
                  )}
              </div>
            ))}
          </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No project performance data available yet.</p>
          )}
        </div>

        {/* Individual Investor Earnings Timeline */}
        <div className="bg-card-gradient rounded-2xl p-6 mb-8 hover-neon-glow">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
            Earnings Timeline
          </h2>
          {earningsTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={earningsTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} />
                <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="earnings" fill="#3B82F6" name="Monthly Earnings" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#10B981" strokeWidth={2} name="Cumulative Earnings" dot={{ fill: '#10B981', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">No earnings data available yet.</p>
          )}
        </div>

      </div>
    </main>
  );
}

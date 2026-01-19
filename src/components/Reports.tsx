import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Download, Calendar, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { fetchInvestorPortfolioByEmail } from '../api/services';

type PortfolioRow = {
  investor_id?: number | string;
  investor_name?: string;
  investor_email?: string;
  project_name?: string;
  project_id?: string | number;
  invested_amount?: number;
  investment_amount?: number;
  payout_amount?: number;
  payout_month?: number;
  payout_year?: number;
  payout_created_at?: string;
  created_at?: string;
  percentage_owned?: number;
  total_barrels?: number;
  project_total_revenue?: number;
  project_expenses?: number;
  project_st?: number;
  project_production?: number;
  cost_per_bo?: number;
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

  // Generate monthly distribution statements data with detailed breakdown
  const monthlyDistributions = useMemo(() => {
    const monthlyMap = new Map<string, { 
      month: string; 
      year: number; 
      total: number; 
      projects: Record<string, {
        amount: number;
        total_barrels?: number;
        project_total_revenue?: number;
        project_expenses?: number;
        project_st?: number;
        project_production?: number;
        cost_per_bo?: number;
        percentage_owned?: number;
      }>
    }>();
    
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
        const payoutAmount = Number(item.payout_amount || 0);
        entry.total += payoutAmount;
        
        // Store detailed project data for this month
        if (!entry.projects[projectName]) {
          entry.projects[projectName] = {
            amount: 0,
            total_barrels: item.total_barrels ? Number(item.total_barrels) : undefined,
            project_total_revenue: item.project_total_revenue ? Number(item.project_total_revenue) : undefined,
            project_expenses: item.project_expenses ? Number(item.project_expenses) : undefined,
            project_st: item.project_st ? Number(item.project_st) : undefined,
            project_production: item.project_production ? Number(item.project_production) : undefined,
            cost_per_bo: item.cost_per_bo ? Number(item.cost_per_bo) : undefined,
            percentage_owned: item.percentage_owned ? Number(item.percentage_owned) : undefined,
          };
        }
        entry.projects[projectName].amount += payoutAmount;
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

  // Generate PDF for monthly distribution statement with detailed breakdown
  const generateDistributionPDF = (
    month: string, 
    year: number, 
    total: number, 
    projects: Record<string, {
      amount: number;
      total_barrels?: number;
      project_total_revenue?: number;
      project_expenses?: number;
      project_st?: number;
      project_production?: number;
      cost_per_bo?: number;
      percentage_owned?: number;
    }>
  ) => {
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
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            h1 { color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; margin-bottom: 20px; }
            h2 { color: #0066cc; margin-top: 30px; margin-bottom: 15px; font-size: 1.3em; border-bottom: 1px solid #0066cc; padding-bottom: 5px; }
            .header { margin-bottom: 30px; }
            .info { margin: 8px 0; }
            .section { margin: 25px 0; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #0066cc; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .calculation-row { background-color: #f0f8ff; }
            .calculation-label { font-weight: bold; color: #555; width: 60%; }
            .calculation-value { text-align: right; font-weight: bold; }
            .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; padding: 15px; background-color: #e8f4f8; border-radius: 5px; }
            .footer { margin-top: 40px; font-size: 0.9em; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
            .project-breakdown { margin-bottom: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 5px; border: 1px solid #ddd; }
            .project-title { color: #0066cc; margin-top: 0; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
            .formula { background-color: #fff9e6; padding: 10px; border-left: 4px solid #ffa500; margin: 10px 0; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Monthly Distribution Statement</h1>
            <div class="info"><strong>Period:</strong> ${month} ${year}</div>
            <div class="info"><strong>Investor:</strong> ${investorName}</div>
            <div class="info"><strong>Email:</strong> ${investorEmail}</div>
            <div class="info"><strong>Statement Date:</strong> ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="section">
            <h2>Distribution Summary</h2>
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th style="text-align: right;">Distribution Amount</th>
                </tr>
              </thead>
              <tbody>
                ${(() => {
                  const rows: string[] = [];
                  let recalculatedTotal = 0;
                  Object.entries(projects).forEach(([project, data]) => {
                    // Calculate from raw production data
                    const grossRevenue = data.cost_per_bo && data.project_production 
                      ? data.cost_per_bo * data.project_production 
                      : undefined;
                    const severanceTax = data.project_st ?? (grossRevenue ? grossRevenue * 0.046 : undefined);
                    const netRevenue = grossRevenue && severanceTax !== undefined
                      ? grossRevenue - severanceTax 
                      : undefined;
                    // Investor Payout Pool = 75% of Net Revenue
                    const investorPayoutPool = netRevenue !== undefined 
                      ? netRevenue * 0.75 
                      : undefined;
                    // Net Investor Payout = Investor Payout Pool - Expenses
                    const expensesAmt = data.project_expenses ?? 0;
                    const netInvestorPayout = investorPayoutPool !== undefined
                      ? investorPayoutPool - expensesAmt
                      : data.project_total_revenue;
                    // Distribution = Net Investor Payout × Ownership %
                    const distributionAmount = netInvestorPayout !== undefined && data.percentage_owned !== undefined
                      ? netInvestorPayout * (data.percentage_owned / 100)
                      : data.amount;
                    recalculatedTotal += distributionAmount;
                    rows.push(`
                      <tr>
                        <td><strong>${project}</strong></td>
                        <td style="text-align: right; font-weight: bold; color: #0066cc;">$${distributionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    `);
                  });
                  rows.push(`
                    <tr style="background-color: #e8f4f8; font-weight: bold;">
                      <td><strong>Total Distribution</strong></td>
                      <td style="text-align: right;">$${recalculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  `);
                  return rows.join('');
                })()}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Detailed Calculation Breakdown by Project</h2>
            ${Object.entries(projects).map(([projectName, projectData]) => {
              // Calculate derived values from raw production data
              const grossRevenue = projectData.cost_per_bo && projectData.project_production 
                ? projectData.cost_per_bo * projectData.project_production 
                : undefined;
              const severanceTax = projectData.project_st ?? (grossRevenue ? grossRevenue * 0.046 : undefined);
              const netRevenue = grossRevenue && severanceTax !== undefined
                ? grossRevenue - severanceTax 
                : undefined;
              // Investor Payout Pool = 75% of Net Revenue
              const investorPayoutPool = netRevenue !== undefined 
                ? netRevenue * 0.75 
                : undefined;
              // Net Investor Payout = Investor Payout Pool - Expenses
              const expensesAmount = projectData.project_expenses ?? 0;
              const netInvestorPayout = investorPayoutPool !== undefined
                ? investorPayoutPool - expensesAmount
                : projectData.project_total_revenue; // Fallback to API value if we can't calculate
              const sharePercentage = projectData.percentage_owned !== undefined
                ? projectData.percentage_owned
                : undefined;
              // Distribution = Net Investor Payout × Ownership %
              const distributionAmount = netInvestorPayout !== undefined && sharePercentage !== undefined
                ? netInvestorPayout * (sharePercentage / 100)
                : projectData.amount;

              return `
                <div class="project-breakdown">
                  <h3 class="project-title">${projectName}</h3>
                  
                  <div style="margin-top: 15px;">
                    <h4 style="color: #555; margin-bottom: 10px;">Project Revenue Calculation</h4>
                    <table style="width: 100%; margin: 10px 0;">
                      ${projectData.project_production !== undefined ? `
                      <tr class="calculation-row">
                        <td class="calculation-label">Total Barrels Produced:</td>
                        <td class="calculation-value">${projectData.project_production.toLocaleString('en-US', { maximumFractionDigits: 0 })} BBL</td>
                      </tr>
                      ` : ''}
                      ${projectData.cost_per_bo !== undefined ? `
                      <tr class="calculation-row">
                        <td class="calculation-label">Price per Barrel:</td>
                        <td class="calculation-value">$${projectData.cost_per_bo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                      ` : ''}
                      ${grossRevenue !== undefined ? `
                      <tr class="calculation-row">
                        <td class="calculation-label">Gross Revenue (Barrels × Price):</td>
                        <td class="calculation-value">$${grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                      ` : ''}
                      ${severanceTax !== undefined ? `
                      <tr class="calculation-row" style="background-color: #fff0f0;">
                        <td class="calculation-label">Severance Tax (4.6%):</td>
                        <td class="calculation-value" style="color: #dc3545;">-$${severanceTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                      ` : ''}
                      ${netRevenue !== undefined ? `
                      <tr class="calculation-row">
                        <td class="calculation-label">Net Revenue (Gross - Severance Tax):</td>
                        <td class="calculation-value">$${netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                      ` : ''}
                      ${investorPayoutPool !== undefined ? `
                      <tr class="calculation-row" style="background-color: #f0fff0;">
                        <td class="calculation-label">Investor Payout Pool (75% of Net Revenue):</td>
                        <td class="calculation-value" style="color: #28a745;">$${investorPayoutPool.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                      ` : ''}
                      ${expensesAmount > 0 ? `
                      <tr class="calculation-row" style="background-color: #fff0f0;">
                        <td class="calculation-label">Operating Expenses:</td>
                        <td class="calculation-value" style="color: #dc3545;">-$${expensesAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                      ` : ''}
                      ${netInvestorPayout !== undefined ? `
                      <tr class="calculation-row" style="background-color: #e8f4f8; font-weight: bold;">
                        <td class="calculation-label">Net Investor Payout (After Expenses):</td>
                        <td class="calculation-value" style="color: #0066cc; font-size: 1.1em;">$${netInvestorPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </div>
                  
                  <div style="margin-top: 20px;">
                    <h4 style="color: #555; margin-bottom: 10px;">Your Distribution Calculation</h4>
                    <table style="width: 100%; margin: 10px 0;">
                      ${projectData.percentage_owned !== undefined ? `
                      <tr>
                        <td class="calculation-label">Your Ownership Percentage:</td>
                        <td class="calculation-value">${projectData.percentage_owned.toFixed(2)}%</td>
                      </tr>
                      ` : ''}
                      ${projectData.total_barrels !== undefined ? `
                      <tr>
                        <td class="calculation-label">Your Total Barrels (Barrels Allocated to You):</td>
                        <td class="calculation-value">${projectData.total_barrels.toLocaleString('en-US', { maximumFractionDigits: 2 })} BBL</td>
                      </tr>
                      ` : ''}
                      ${sharePercentage !== undefined ? `
                      <tr>
                        <td class="calculation-label">Your Share Percentage:</td>
                        <td class="calculation-value">${sharePercentage.toFixed(2)}%</td>
                      </tr>
                      ` : ''}
                      <tr style="background-color: #e8f4f8; font-weight: bold;">
                        <td class="calculation-label">Your Distribution Amount:</td>
                        <td class="calculation-value" style="color: #0066cc; font-size: 1.2em;">$${distributionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                      ${netInvestorPayout !== undefined && sharePercentage !== undefined && investorPayoutPool !== undefined ? `
                      <tr style="font-style: italic; color: #666;">
                        <td colspan="2" style="padding-top: 10px; padding-left: 8px;">
                          <div class="formula">
                            <strong>Calculation Steps:</strong><br/>
                            1. Investor Payout Pool (75% of Net Revenue): $${investorPayoutPool.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br/>
                            ${expensesAmount > 0 ? `2. Less Expenses: -$${expensesAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br/>
                            3. Net Investor Payout: $${netInvestorPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br/>
                            4. Your Distribution: $${netInvestorPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × ${sharePercentage.toFixed(2)}% = <strong>$${distributionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>` : `2. Your Distribution: $${netInvestorPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × ${sharePercentage.toFixed(2)}% = <strong>$${distributionAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>`}
                          </div>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="total">
            <strong>Total Distribution for ${month} ${year}: $${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>

          <div class="footer">
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p><strong>Disclaimer:</strong> This is an automated statement generated from our records. The distribution amounts are calculated based on production data, ownership percentages, and the methodology outlined above. If you have any questions or notice any discrepancies, please contact our support team immediately.</p>
            <p style="margin-top: 15px;"><strong>Contact:</strong> For questions regarding this statement, please contact your account representative or support@wtxcrude.com</p>
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

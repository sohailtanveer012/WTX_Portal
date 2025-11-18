import { useState, useEffect } from 'react';
import { DollarSign, Droplets, Calculator, Mail, Users, ChevronLeft, Edit, CheckCircle2, Loader2, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface ProjectPayoutProps {
  projectId: string;
  onBack: () => void;
  project: {
    id: string;
    name: string;
    location?: string;
    status?: string;
    investors?: number;
    totalInvestment?: string;
    monthlyRevenue?: string;
    completionDate?: string;
    description?: string;
    startDate?: string;
    operatingCosts?: string;
    productionRate?: string;
    recoveryRate?: string;
    wellCount?: number;
    hasInvestorGroups?: boolean;
  };
  investors: Array<{
    investor_id?: number;
    investor_name: string;
    investor_email: string;
    percentage_owned: number;
    payout_amount?: number;
    investment_amount?: number;
  }>;
}

interface Investor {
  id: string; 
  name: string;
  ownership: number;
  email: string;
  invested: string;
  customBaseBarrels?: number;
}

interface InvestorDistribution {
  id: string;
  name: string;
  amount: number;
  email: string;
  baseBarrels: number;
  totalBarrels: number;
  share?: number; // Share percentage
}

export function ProjectPayout({ projectId, onBack, project, investors: projectInvestors }: ProjectPayoutProps) {
  const [totalBarrels, setTotalBarrels] = useState('');
  const [pricePerBarrel, setPricePerBarrel] = useState('');
  const [expenses, setExpenses] = useState('');
  const [sendEmails, setSendEmails] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const [showInvestorModal, setShowInvestorModal] = useState(false);
  const [customBaseBarrelsInput, setCustomBaseBarrelsInput] = useState<string>('');
  const [calculations, setCalculations] = useState({
    grossRevenue: 0,
    severanceTax: 0,
    netRevenue: 0,
    investorPayout: 0,
    expenses: 0,
    companyRevenue: 0,
    investorDistributions: [] as InvestorDistribution[]
  });
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [investors, setInvestors] = useState<Investor[]>([]);

  // Map real investors from parent into local investors model
  useEffect(() => {
    console.log('ProjectPayout - Received projectInvestors:', projectInvestors);
    console.log('ProjectPayout - Number of investors received:', projectInvestors?.length || 0);
    
    const mapped = (projectInvestors || []).map((inv, idx) => ({
      id: String(inv.investor_id ?? idx),
      name: inv.investor_name,
      ownership: (inv.percentage_owned || 0) / 100, // convert percent to fraction
      email: inv.investor_email,
      invested: inv.investment_amount ? `$${inv.investment_amount.toLocaleString()}` : 'N/A',
    }));
    
    console.log('ProjectPayout - Mapped investors:', mapped);
    console.log('ProjectPayout - Number of mapped investors:', mapped.length);
    
    setInvestors(mapped);
  }, [projectInvestors]);

  useEffect(() => {
    if (pricePerBarrel && totalBarrels) {
      const defaultBarrels = parseFloat(totalBarrels);
      const price = parseFloat(pricePerBarrel);
      const expensesAmount = parseFloat(expenses) || 0;
      if (isNaN(defaultBarrels) || isNaN(price)) return;

      // Step 1: Calculate gross revenue from total barrels
      const grossRevenue = defaultBarrels * price;
      const severanceTax = grossRevenue * 0.046;
      const netRevenue = grossRevenue - severanceTax;
      const investorPayout = netRevenue * 0.75;
      const companyRevenue = netRevenue * 0.25;
      
      // Subtract expenses from investor payout
      const netInvestorPayout = investorPayout - expensesAmount;

      // Step 2: Calculate each investor's base barrels and total barrels
      const investorBarrels = investors.map(investor => {
        const baseBarrels = investor.customBaseBarrels !== undefined 
          ? investor.customBaseBarrels 
          : defaultBarrels;
        const totalBarrelsForInvestor = baseBarrels * investor.ownership;
        return {
          id: investor.id,
          name: investor.name,
          email: investor.email,
          baseBarrels,
          totalBarrelsForInvestor,
        };
      });

      // Step 3: Calculate sum of all investors' total barrels
      const sumTotalBarrels = investorBarrels.reduce((sum, inv) => sum + inv.totalBarrelsForInvestor, 0);

      // Step 4: Calculate each investor's share and payout (based on share, which is affected by custom base barrels)
      const investorDistributions = investorBarrels.map(inv => {
        const share = sumTotalBarrels > 0 ? inv.totalBarrelsForInvestor / sumTotalBarrels : 0;
        // Calculate payout based on share (affected by custom base barrels), not ownership
        const amount = netInvestorPayout * share;
        return {
          id: inv.id,
          name: inv.name,
          email: inv.email,
          baseBarrels: inv.baseBarrels,
          totalBarrels: inv.totalBarrelsForInvestor,
          share: share * 100, // Convert to percentage for display only
          amount
        };
      });

      setCalculations({
        grossRevenue,
        severanceTax,
        netRevenue,
        investorPayout,
        companyRevenue,
        expenses: expensesAmount,
        investorDistributions
      });
    }
  }, [totalBarrels, pricePerBarrel, expenses, investors]);

  const handleInvestorEdit = (investor: Investor, customBaseBarrels: number | undefined) => {
    setInvestors(current => 
      current.map(inv => 
        inv.id === investor.id 
          ? { ...inv, customBaseBarrels } 
          : inv
      )
    );
  };

  const handleProcessPayout = () => {
    setShowPayoutModal(true);
    setIsProcessing(false);
    setIsSuccess(false);
    setErrorMessage('');
  };

  const handleConfirmPayout = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      // Extract month and year from selectedMonth (format: YYYY-MM)
      const [year, month] = selectedMonth.split('-');
      
      // Step 1: Call the Supabase RPC to insert/update revenue
      const expensesAmount = parseFloat(expenses) || 0;
      const revenueResult = await supabase
        .rpc('insert_or_update_revenue', {
          input_month: parseInt(month),
          input_project_id: projectId,
          input_total_revenue: calculations.investorPayout - expensesAmount, // Investor Payout minus expenses
          input_year: parseInt(year)
        });
      
      if (revenueResult.error) {
        console.error('Error saving revenue:', revenueResult.error);
        setErrorMessage(`Error saving revenue data: ${revenueResult.error.message}`);
        setIsProcessing(false);
        return;
      }
      
      console.log('Revenue saved successfully:', revenueResult.data);
      
      // Step 2: Call the payout calculation API
      const payoutResult = await supabase
        .rpc('calculate_payouts_test', {
          input_month: parseInt(month),
          input_project_id: projectId,
          input_year: parseInt(year)
        });
      
      if (payoutResult.error) {
        console.error('Error calculating payouts:', payoutResult.error);
        setErrorMessage(`Error calculating payouts: ${payoutResult.error.message}`);
        setIsProcessing(false);
        return;
      }
      
      console.log('Payouts calculated successfully:', payoutResult.data);
      
      // Step 3: Show success and redirect after a short delay
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        // Redirect to project view after showing success message
        setTimeout(() => {
          onBack();
        }, 2000);
      }, 1000);
      
    } catch (error) {
      console.error('Error in handleConfirmPayout:', error);
      setErrorMessage('Error processing payout. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Calculate Monthly Payout</h1>
              <p className="text-gray-400 mt-1">{project.name}</p>
            </div>
          </div>
        </div>

        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Total Barrels Produced
              </label>
              <div className="relative">
                <Droplets className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  required
                  value={totalBarrels}
                  onChange={(e) => setTotalBarrels(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter total barrels"
                  step="1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Price per Barrel
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  required
                  value={pricePerBarrel}
                  onChange={(e) => setPricePerBarrel(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter price per barrel"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Expenses
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter expenses (e.g., 800)"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {pricePerBarrel && totalBarrels && (
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <h2 className="text-lg font-semibold text-white mb-6">Payout Calculations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm text-gray-400">Gross Revenue</p>
                <p className="text-xl font-semibold text-white">
                  ${calculations.grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm text-gray-400">Severance Tax (4.6%)</p>
                <p className="text-xl font-semibold text-red-400">
                  -${calculations.severanceTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm text-gray-400">Net Revenue</p>
                <p className="text-xl font-semibold text-white">
                  ${calculations.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm text-gray-400">Investor Payout (75%)</p>
                <p className="text-xl font-semibold text-green-400">
                  ${calculations.investorPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm text-gray-400">Expenses</p>
                <p className="text-xl font-semibold text-red-400">
                  -${calculations.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm text-gray-400">Royalties (25%)</p>
                <p className="text-xl font-semibold text-blue-400">
                  ${calculations.companyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-gray-400">Total Distribution</p>
                <p className="text-xl font-semibold text-blue-400">
                  ${(calculations.investorPayout + calculations.companyRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        )}

        {pricePerBarrel && totalBarrels && (
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Investors</h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">{investors.length} Total</span>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendEmails}
                      onChange={() => setSendEmails(!sendEmails)}
                      className="sr-only peer"
                    />
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      sendEmails ? 'bg-blue-400' : 'bg-gray-600'
                    }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        sendEmails ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Investor</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Ownership</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Investment</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Base Barrels</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Total Barrels</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Distribution</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investors.map((investor) => {
                    const distribution = calculations.investorDistributions.find(d => d.id === investor.id);
                    const hasCustomBase = investor.customBaseBarrels !== undefined;

                    return (
                      <tr key={investor.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                              <span className="text-blue-400 font-semibold text-sm">
                                {investor.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="font-medium text-white">{investor.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{investor.email}</td>
                        <td className="px-6 py-4 text-gray-300">
                          {(investor.ownership * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 text-gray-300">{investor.invested}</td>
                        <td className="px-6 py-4 text-gray-300">
                          <span className={hasCustomBase ? 'text-yellow-400 font-medium' : ''}>
                            {distribution?.baseBarrels.toFixed(0)} BBL
                          </span>
                          {hasCustomBase && (
                            <span className="text-xs text-yellow-400 ml-1">(custom)</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-300">
                            {distribution?.totalBarrels.toFixed(0)} BBL
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {distribution && (
                            <span className="text-green-400">
                              +${distribution.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => {
                              setEditingInvestor(investor);
                              const defaultValue = investor.customBaseBarrels !== undefined 
                                ? investor.customBaseBarrels.toString() 
                                : totalBarrels;
                              setCustomBaseBarrelsInput(defaultValue);
                              setShowInvestorModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                            title="Set custom base barrels"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {pricePerBarrel && totalBarrels && (
          <div className="flex justify-end mt-8">
            <button
              onClick={handleProcessPayout}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-lg font-medium shadow-lg shadow-blue-500/20"
            >
              Process Payout
            </button>
          </div>
        )}

        {showPayoutModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-card-gradient rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Calculator className="h-6 w-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">
                    Process Payout
                  </h2>
                </div>
                <button
                  onClick={() => !isProcessing && setShowPayoutModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                  disabled={isProcessing}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-gray-400 mb-6">Review the payout summary and confirm to send distributions to all investors.</p>
                
                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
                )}

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-medium text-white mb-4">Payout Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-1">Total Barrels</p>
                      <p className="text-xl font-semibold text-blue-400">{parseFloat(totalBarrels).toLocaleString()} BBL</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-1">Total Investor Payout</p>
                      <p className="text-xl font-semibold text-green-400">${calculations.investorPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-1">Investors</p>
                      <p className="text-xl font-semibold text-purple-400">{calculations.investorDistributions.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-medium text-white mb-4">Investor Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Investor</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Total Barrels</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Distribution</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculations.investorDistributions.map((d) => (
                          <tr key={d.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                  <span className="text-blue-400 font-semibold text-sm">
                                    {d.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <span className="font-medium text-white">{d.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-blue-400">{d.totalBarrels.toLocaleString(undefined, { maximumFractionDigits: 0 })} BBL</td>
                            <td className="px-4 py-3 text-green-400 font-medium">${d.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => setShowPayoutModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPayout}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2"
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="animate-spin h-5 w-5" /> : <Calculator className="h-5 w-5" />}
                    <span>Confirm & Send Payout</span>
                  </button>
                </div>
              </div>

              {isSuccess && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 rounded-2xl animate-fade-in">
                  <CheckCircle2 className="h-16 w-16 text-green-400 mb-4 animate-bounce-in" />
                  <h3 className="text-xl font-semibold text-white mb-2">Payout Processed!</h3>
                  <p className="text-gray-400 mb-6 text-center">Revenue saved and investor payouts calculated successfully. Redirecting to project view...</p>
                  <button
                    onClick={() => setShowPayoutModal(false)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {showInvestorModal && editingInvestor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card-gradient rounded-2xl p-6 max-w-lg w-full">
              <h3 className="text-lg font-semibold text-white mb-6">
                Adjust Base Barrels for {editingInvestor.name}
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Base Barrels for Calculation
                  </label>
                  <div className="relative">
                    <Droplets className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={customBaseBarrelsInput}
                      onChange={(e) => setCustomBaseBarrelsInput(e.target.value)}
                      step="1"
                      min="0"
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter base barrels for calculation"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-400">
                    Default: {parseFloat(totalBarrels || '0').toFixed(0)} BBL (top-level barrels)
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    This value will be multiplied by the investor's ownership percentage to determine their total barrels.
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInvestorModal(false);
                      setEditingInvestor(null);
                      setCustomBaseBarrelsInput('');
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Clear custom base barrels (use default)
                      if (editingInvestor) {
                        handleInvestorEdit(editingInvestor, undefined);
                      }
                      setShowInvestorModal(false);
                      setEditingInvestor(null);
                      setCustomBaseBarrelsInput('');
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    Reset to Default
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const customBaseBarrels = parseFloat(customBaseBarrelsInput);
                      if (!isNaN(customBaseBarrels) && customBaseBarrels >= 0 && editingInvestor) {
                        handleInvestorEdit(editingInvestor, customBaseBarrels);
                        setShowInvestorModal(false);
                        setEditingInvestor(null);
                        setCustomBaseBarrelsInput('');
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Save Adjustment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
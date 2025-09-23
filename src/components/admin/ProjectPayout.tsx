import React, { useState, useEffect } from 'react';
import { DollarSign, Droplets, Calculator, PieChart, Mail, Users, Bell, ChevronLeft, FileText, Calendar, Download, Edit, Trash2, CheckCircle2, Loader2, X } from 'lucide-react';

interface ProjectPayoutProps {
  projectId: string;
  onBack: () => void;
  project: any;
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
}

export function ProjectPayout({ projectId, onBack, project }: ProjectPayoutProps) {
  const [totalBarrels, setTotalBarrels] = useState('');
  const [pricePerBarrel, setPricePerBarrel] = useState('');
  const [sendEmails, setSendEmails] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const [showInvestorModal, setShowInvestorModal] = useState(false);
  const [calculations, setCalculations] = useState({
    grossRevenue: 0,
    severanceTax: 0,
    netRevenue: 0,
    investorPayout: 0,
    companyRevenue: 0,
    investorDistributions: [] as InvestorDistribution[]
  });
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [investors, setInvestors] = useState<Investor[]>([
    { id: '1', name: 'Sarah Johnson', ownership: 0.15, email: 'sarah.j@example.com', invested: '$420,000' },
    { id: '2', name: 'Michael Chen', ownership: 0.20, email: 'm.chen@example.com', invested: '$560,000' },
    { id: '3', name: 'Emma Davis', ownership: 0.25, email: 'emma.d@example.com', invested: '$700,000' },
    { id: '4', name: 'James Wilson', ownership: 0.15, email: 'j.wilson@example.com', invested: '$420,000' },
    { id: '5', name: 'Lisa Anderson', ownership: 0.25, email: 'lisa.a@example.com', invested: '$700,000' }
  ]);

  useEffect(() => {
    if (pricePerBarrel && totalBarrels) {
      const barrels = parseFloat(totalBarrels);
      const price = parseFloat(pricePerBarrel);
      if (isNaN(barrels) || isNaN(price)) return;

      const grossRevenue = barrels * price;
      const severanceTax = grossRevenue * 0.046;
      const netRevenue = grossRevenue - severanceTax;
      const investorPayout = netRevenue * 0.75;
      const companyRevenue = netRevenue * 0.25;

      const investorBarrelsArr = investors.map(inv => {
        const baseBarrels = inv.customBaseBarrels ?? barrels;
        const totalBarrelsForInvestor = baseBarrels * inv.ownership;
        return { id: inv.id, baseBarrels, totalBarrels: totalBarrelsForInvestor };
      });
      const sumTotalBarrels = investorBarrelsArr.reduce((sum, inv) => sum + inv.totalBarrels, 0);

      const investorDistributions = investors.map(investor => {
        const baseBarrels = investor.customBaseBarrels ?? barrels;
        const totalBarrelsForInvestor = baseBarrels * investor.ownership;
        const share = sumTotalBarrels > 0 ? totalBarrelsForInvestor / sumTotalBarrels : 0;
        const investorAmount = investorPayout * share;
        return {
          id: investor.id,
          name: investor.name,
          email: investor.email,
          baseBarrels,
          totalBarrels: totalBarrelsForInvestor,
          amount: investorAmount
        };
      });

      setCalculations({
        grossRevenue,
        severanceTax,
        netRevenue,
        investorPayout,
        companyRevenue,
        investorDistributions
      });
    }
  }, [totalBarrels, pricePerBarrel, investors]);

  const handleInvestorEdit = (investor: Investor, customBaseBarrels: number) => {
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
  };

  const handleConfirmPayout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
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
                          {distribution?.baseBarrels.toFixed(0)} BBL
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className={`text-gray-300 ${hasCustomBase ? 'text-yellow-400' : ''}`}>
                              {distribution?.totalBarrels.toFixed(0)} BBL
                            </span>
                            {hasCustomBase && (
                              <span className="text-xs text-yellow-400">(custom base)</span>
                            )}
                          </div>
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
                              setShowInvestorModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-300"
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
                  <p className="text-gray-400 mb-6 text-center">All investor distributions have been processed and sent successfully.</p>
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const customBaseBarrels = parseFloat(formData.get('baseBarrels') as string);
                  if (!isNaN(customBaseBarrels)) {
                    handleInvestorEdit(editingInvestor, customBaseBarrels);
                  }
                  setShowInvestorModal(false);
                  setEditingInvestor(null);
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Base Barrels for Calculation
                  </label>
                  <div className="relative">
                    <Droplets className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="baseBarrels"
                      required
                      defaultValue={editingInvestor.customBaseBarrels ?? parseFloat(totalBarrels)}
                      step="1"
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter base barrels for calculation"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-400">
                    Default: {parseFloat(totalBarrels).toFixed(0)} BBL (top-level barrels)
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    This value will be multiplied by the investor's ownership percentage to determine their total barrels for payout calculation.
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInvestorModal(false);
                      setEditingInvestor(null);
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                  >
                    Save Adjustment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
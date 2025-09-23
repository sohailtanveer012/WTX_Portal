import React, { useState, useEffect } from 'react';
import { DollarSign, Droplets, Calculator, X, PieChart, Mail, Users, Bell } from 'lucide-react';

interface ProjectPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payoutData: any) => void;
  projectName: string;
}

export function ProjectPayoutModal({ isOpen, onClose, onSubmit, projectName }: ProjectPayoutModalProps) {
  const [barrels, setBarrels] = useState('');
  const [pricePerBarrel, setPricePerBarrel] = useState('');
  const [sendEmails, setSendEmails] = useState(true);
  const [sendSummaryReport, setSendSummaryReport] = useState(true);

  // Mock investors data - in a real app, this would come from the database
  const investors = [
    { id: '1', name: 'Sarah Johnson', ownership: 0.15, email: 'sarah.j@example.com' },
    { id: '2', name: 'Michael Chen', ownership: 0.20, email: 'm.chen@example.com' },
    { id: '3', name: 'Emma Davis', ownership: 0.25, email: 'emma.d@example.com' },
    { id: '4', name: 'James Wilson', ownership: 0.15, email: 'j.wilson@example.com' },
    { id: '5', name: 'Lisa Anderson', ownership: 0.25, email: 'lisa.a@example.com' },
  ];

  const [calculations, setCalculations] = useState({
    grossRevenue: 0,
    severanceTax: 0,
    netRevenue: 0,
    investorPayout: 0,
    companyRevenue: 0,
    investorDistributions: [] as { id: string; name: string; amount: number; email: string }[]
  });

  useEffect(() => {
    if (barrels && pricePerBarrel) {
      const numBarrels = parseFloat(barrels);
      const price = parseFloat(pricePerBarrel);
      
      const grossRevenue = numBarrels * price;
      const severanceTax = grossRevenue * 0.046; // 4.6% severance tax
      const netRevenue = grossRevenue - severanceTax;
      const investorPayout = netRevenue * 0.75; // 75% to investors
      const companyRevenue = netRevenue * 0.25; // 25% to company
      
      // Calculate individual investor distributions
      const investorDistributions = investors.map(investor => ({
        id: investor.id,
        name: investor.name,
        email: investor.email,
        amount: investorPayout * investor.ownership
      }));

      setCalculations({
        grossRevenue,
        severanceTax,
        netRevenue,
        investorPayout,
        companyRevenue,
        investorDistributions
      });
    }
  }, [barrels, pricePerBarrel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      barrels: parseFloat(barrels),
      pricePerBarrel: parseFloat(pricePerBarrel),
      sendEmails,
      sendSummaryReport,
      ...calculations
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-gradient rounded-2xl p-6 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Calculator className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Calculate Monthly Payout</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white">{projectName}</h3>
          <p className="text-sm text-gray-400">Enter production details to calculate payouts</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Barrels Extracted
              </label>
              <div className="relative">
                <Droplets className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  required
                  value={barrels}
                  onChange={(e) => setBarrels(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter number of barrels"
                  step="0.01"
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

          {(barrels && pricePerBarrel) && (
            <div className="bg-white/5 rounded-xl p-6 space-y-4">
              <h4 className="text-lg font-medium text-white mb-4">Payout Calculations</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-gray-400">Gross Revenue</p>
                  <p className="text-lg font-medium text-white">
                    ${calculations.grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-gray-400">Severance Tax (4.6%)</p>
                  <p className="text-lg font-medium text-red-400">
                    -${calculations.severanceTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-gray-400">Net Revenue</p>
                  <p className="text-lg font-medium text-white">
                    ${calculations.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-gray-400">Investor Payout (75%)</p>
                  <p className="text-lg font-medium text-green-400">
                    ${calculations.investorPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="md:col-span-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-gray-400">Company Revenue (25%)</p>
                  <p className="text-lg font-medium text-blue-400">
                    ${calculations.companyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Investor Distributions */}
          {(barrels && pricePerBarrel) && (
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-400" />
                  <h4 className="text-lg font-medium text-white">Investor Distributions</h4>
                </div>
                <span className="text-sm text-gray-400">{investors.length} Investors</span>
              </div>
              
              <div className="space-y-4">
                {calculations.investorDistributions.map((investor) => (
                  <div
                    key={investor.id}
                    className="p-4 rounded-xl bg-white/5 flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-medium text-white">{investor.name}</h5>
                      <p className="text-sm text-gray-400">{investor.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-green-400">
                        ${investor.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Notification Settings */}
          <div className="bg-white/5 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="h-5 w-5 text-yellow-400" />
              <h4 className="text-lg font-medium text-white">Notification Settings</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <h5 className="font-medium text-white">Send Email Notifications</h5>
                  <p className="text-sm text-gray-400">Notify investors about their distributions</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSendEmails(!sendEmails)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    sendEmails ? 'bg-blue-400' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      sendEmails ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <h5 className="font-medium text-white">Generate Summary Report</h5>
                  <p className="text-sm text-gray-400">Create and send detailed monthly report</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSendSummaryReport(!sendSummaryReport)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    sendSummaryReport ? 'bg-blue-400' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      sendSummaryReport ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Process Payout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { X, DollarSign, Calendar, Search } from 'lucide-react';

interface AddInvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (investorData: any) => void;
  project: any;
}

export function AddInvestorModal({ isOpen, onClose, onSubmit, project }: AddInvestorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [investmentType, setInvestmentType] = useState<'units' | 'amount'>('units');
  const [investment, setInvestment] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountMemo, setDiscountMemo] = useState('');
  const [hasDiscount, setHasDiscount] = useState(false);
  const [outstandingBalance, setOutstandingBalance] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [hasOutstandingBalance, setHasOutstandingBalance] = useState(false);

  // Mock available investors - in a real app, this would come from the database
  const availableInvestors = [
    { id: '1', name: 'Sarah Johnson', email: 'sarah.j@example.com', type: 'Individual' },
    { id: '2', name: 'Michael Chen', email: 'm.chen@example.com', type: 'Individual' },
    { id: '3', name: 'Emma Davis', email: 'emma.d@example.com', type: 'Individual' },
    { id: '4', name: 'James Wilson', email: 'j.wilson@example.com', type: 'Individual' },
    { id: '5', name: 'Lisa Anderson', email: 'lisa.a@example.com', type: 'Individual' },
    { id: '6', name: 'Robert Thompson', email: 'r.thompson@example.com', type: 'Individual' },
    { id: '7', name: 'Jennifer Martinez', email: 'j.martinez@example.com', type: 'Individual' },
    { id: '8', name: 'William Brown', email: 'w.brown@example.com', type: 'Individual' },
    { id: '9', name: 'Maria Garcia', email: 'm.garcia@example.com', type: 'Individual' },
    { id: '10', name: 'David Lee', email: 'd.lee@example.com', type: 'Individual' }
  ].filter(investor => 
    !project.investors?.some((i: any) => i.email === investor.email)
  );

  const filteredInvestors = availableInvestors.filter(investor =>
    investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateUnits = (value: string, type: 'units' | 'amount') => {
    if (!value) return 0;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 0;

    if (type === 'units') {
      return numValue;
    } else {
      const unitPrice = parseFloat(project.unitPrice.replace(/[^0-9.-]+/g, ''));
      return numValue / unitPrice;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestor || !investment) return;

    const units = calculateUnits(investment, investmentType);
    const investmentAmount = investmentType === 'units' 
      ? units * parseFloat(project.unitPrice.replace(/[^0-9.-]+/g, ''))
      : parseFloat(investment);

    onSubmit({
      name: selectedInvestor.name,
      email: selectedInvestor.email,
      type: 'Individual',
      units,
      investment: `$${investmentAmount.toLocaleString()}`,
      discount: hasDiscount ? discount : null,
      discountMemo: hasDiscount ? discountMemo : null,
      outstandingBalance: hasOutstandingBalance ? outstandingBalance : null,
      dueDate: hasOutstandingBalance ? dueDate : null,
      joinDate: new Date().toISOString().slice(0, 10)
    });

    // Reset form
    setSelectedInvestor(null);
    setInvestmentType('units');
    setInvestment('');
    setDiscount('');
    setDiscountMemo('');
    setHasDiscount(false);
    setOutstandingBalance('');
    setDueDate('');
    setHasOutstandingBalance(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-card-gradient rounded-2xl p-6 max-w-2xl w-full my-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Add New Investor</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Investor Selection */}
          {!selectedInvestor ? (
            <div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search investors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredInvestors.map((investor) => (
                  <div
                    key={investor.id}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => setSelectedInvestor(investor)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <span className="text-blue-400 font-semibold">
                          {investor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-white">{investor.name}</div>
                        <div className="text-sm text-gray-400">{investor.email}</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {investor.type}
                    </span>
                  </div>
                ))}
                {filteredInvestors.length === 0 && (
                  <div className="text-center py-4 text-gray-400">
                    No investors found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <span className="text-blue-400 font-semibold">
                    {selectedInvestor.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-white">{selectedInvestor.name}</div>
                  <div className="text-sm text-gray-400">{selectedInvestor.email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInvestor(null)}
                  className="ml-auto text-gray-400 hover:text-gray-300"
                >
                  Change
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Investment Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="units"
                        checked={investmentType === 'units'}
                        onChange={(e) => setInvestmentType(e.target.value as 'units')}
                        className="mr-2"
                      />
                      <span className="text-white">Units</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="amount"
                        checked={investmentType === 'amount'}
                        onChange={(e) => setInvestmentType(e.target.value as 'amount')}
                        className="mr-2"
                      />
                      <span className="text-white">Amount</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {investmentType === 'units' ? 'Number of Units' : 'Investment Amount'}
                  </label>
                  <div className="relative">
                    {investmentType === 'amount' && (
                      <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    )}
                    <input
                      type="text"
                      required
                      value={investment}
                      onChange={(e) => setInvestment(e.target.value)}
                      className={`w-full ${
                        investmentType === 'amount' ? 'pl-10' : 'px-4'
                      } py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder={investmentType === 'units' ? 'Enter number of units' : 'Enter amount'}
                    />
                  </div>
                  {investment && (
                    <div className="mt-2 text-sm text-gray-400">
                      {investmentType === 'units' ? (
                        <>Value: ${(calculateUnits(investment, 'units') * parseFloat(project.unitPrice.replace(/[^0-9.-]+/g, ''))).toLocaleString()}</>
                      ) : (
                        <>Units: {calculateUnits(investment, 'amount').toFixed(2)}</>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm text-gray-400 hover:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasOutstandingBalance}
                      onChange={(e) => setHasOutstandingBalance(e.target.checked)}
                      className="rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
                    />
                    <span>Has Outstanding Balance</span>
                  </label>

                  {hasOutstandingBalance && (
                    <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Outstanding Amount
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={outstandingBalance}
                            onChange={(e) => setOutstandingBalance(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter outstanding amount"
                            required={hasOutstandingBalance}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Due Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required={hasOutstandingBalance}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm text-gray-400 hover:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDiscount}
                      onChange={(e) => setHasDiscount(e.target.checked)}
                      className="rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
                    />
                    <span>Add Discount</span>
                  </label>

                  {hasDiscount && (
                    <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Discount Amount
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter discount amount"
                            required={hasDiscount}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Reason for Discount
                        </label>
                        <textarea
                          value={discountMemo}
                          onChange={(e) => setDiscountMemo(e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter reason for discount"
                          rows={2}
                          required={hasDiscount}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

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
              disabled={!selectedInvestor || !investment}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Investor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
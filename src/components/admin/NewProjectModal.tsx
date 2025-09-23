import React, { useState } from 'react';
import { MapPin, Calendar, DollarSign, Users, X, FileText, Drill, Percent, Plus, Trash2, Search, CheckCircle, Lock as LockIcon, Unlock as UnlockIcon } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: any) => void;
}

interface Investor {
  name: string;
  email: string;
  investmentType: 'units' | 'amount';
  investment: string;
  units: number;
  discount: string;
  discountMemo: string;
}

export function NewProjectModal({ isOpen, onClose, onSubmit }: NewProjectModalProps) {
  const [projectData, setProjectData] = useState({
    name: '',
    location: '',
    drillDate: '',
    targetInvestment: '',
    totalUnits: '50',
    isUnitsLocked: true,
    investors: [] as Investor[],
  });

  const unitValue = projectData.targetInvestment && projectData.totalUnits
    ? (parseFloat(projectData.targetInvestment) / parseFloat(projectData.totalUnits)).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      })
    : '$0';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Mock available investors - in a real app, this would come from the database
  const availableInvestors = [
    { id: '1', name: 'Sarah Johnson', email: 'sarah.j@example.com' },
    { id: '2', name: 'Michael Chen', email: 'm.chen@example.com' },
    { id: '3', name: 'Emma Davis', email: 'emma.d@example.com' },
    { id: '4', name: 'James Wilson', email: 'j.wilson@example.com' },
    { id: '5', name: 'Lisa Anderson', email: 'lisa.a@example.com' },
  ];

  const filteredInvestors = availableInvestors.filter(investor =>
    investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateUnits = (investment: string, type: 'units' | 'amount') => {
    const totalInvestment = parseFloat(projectData.targetInvestment.replace(/[^0-9.-]+/g, ''));
    if (isNaN(totalInvestment)) return 0;
    
    if (type === 'units') {
      return parseFloat(investment);
    } else {
      const investmentValue = parseFloat(investment);
      if (isNaN(investmentValue)) return 0;
      return (investmentValue / totalInvestment) * parseFloat(projectData.totalUnits);
    }
  };

  const handleInvestmentChange = (investorId: string, value: string, type: 'units' | 'amount') => {
    const investor = availableInvestors.find(inv => inv.id === investorId);
    if (!investor) return;

    const existingIndex = projectData.investors.findIndex(inv => inv.name === investor.name);
    const units = calculateUnits(value, type);

    if (existingIndex >= 0) {
      const updatedInvestors = [...projectData.investors];
      updatedInvestors[existingIndex] = {
        name: investor.name,
        email: investor.email,
        investmentType: type,
        investment: value,
        units,
        discount: updatedInvestors[existingIndex].discount || '',
        discountMemo: updatedInvestors[existingIndex].discountMemo || '',
      };
      setProjectData({ ...projectData, investors: updatedInvestors });
    } else if (value) {
      setProjectData({
        ...projectData,
        investors: [
          ...projectData.investors,
          {
            name: investor.name,
            email: investor.email,
            investmentType: type,
            investment: value,
            units,
            discount: '',
            discountMemo: '',
          },
        ],
      });
    }
  };

  const handleRemoveInvestor = (index: number) => {
    setProjectData({
      ...projectData,
      investors: projectData.investors.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    onSubmit(projectData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-card-gradient rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">
              {showConfirmation ? 'Confirm Project Details' : 'Add New Project'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {!showConfirmation ? (
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Project Name
              </label>
              <input
                type="text"
                required
                value={projectData.name}
                onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={projectData.location}
                  onChange={(e) => setProjectData({ ...projectData, location: e.target.value })}
                  className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
                <Drill className="h-4 w-4 mr-2" />
                Estimated Drill Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  required
                  value={projectData.drillDate}
                  onChange={(e) => setProjectData({ ...projectData, drillDate: e.target.value })}
                  className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Target Investment
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  required
                  value={projectData.targetInvestment}
                  onChange={(e) => setProjectData({ ...projectData, targetInvestment: e.target.value })}
                  className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter target amount"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
                <Percent className="h-4 w-4 mr-2" /> Unit Details
                <span className="ml-2 text-xs text-gray-500">(1 unit = {unitValue})</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={projectData.totalUnits}
                    onChange={(e) => {
                      if (!projectData.isUnitsLocked) {
                        setProjectData({ ...projectData, totalUnits: e.target.value });
                      }
                    }}
                    className={`px-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      projectData.isUnitsLocked ? 'opacity-50' : ''
                    }`}
                    placeholder="Total Units"
                    disabled={projectData.isUnitsLocked}
                  />
                  {projectData.isUnitsLocked && (
                    <div className="absolute inset-0 bg-black/20 rounded-xl pointer-events-none" />
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setProjectData(prev => ({ ...prev, isUnitsLocked: !prev.isUnitsLocked }))}
                    className={`px-4 py-2 w-full rounded-xl border ${
                      projectData.isUnitsLocked
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      {projectData.isUnitsLocked ? (
                        <>
                          <LockIcon className="h-4 w-4 mr-2" />
                          Locked
                        </>
                      ) : (
                        <>
                          <UnlockIcon className="h-4 w-4 mr-2" />
                          Unlocked
                        </>
                      )}
                    </div>
                  </button>
                </div>
                <div className="relative flex-1">
                  <div className="px-4 py-2 w-full bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 font-medium text-center">
                    Value per Unit: {unitValue}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Investors Section */}
          <div className="mt-8 border-t border-white/10 pt-8 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-white">Select Investors</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search investors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={(e) => {
                            setSelectAll(e.target.checked);
                            if (e.target.checked) {
                              const allInvestors = filteredInvestors.map(investor => ({
                                name: investor.name,
                                email: investor.email,
                                investmentType: 'units' as const,
                                investment: '',
                                units: 0,
                                discount: '',
                                discountMemo: '',
                              }));
                              setProjectData({ ...projectData, investors: allInvestors });
                            } else {
                              setProjectData({ ...projectData, investors: [] });
                            }
                          }}
                          className="rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
                        />
                        <span>Select All</span>
                      </label>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Investor</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Investment Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Investment</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredInvestors.map((investor) => {
                    const existingInvestment = projectData.investors.find(inv => inv.name === investor.name);
                    return (
                      <tr key={investor.id} className="border-b border-white/10">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={!!existingInvestment}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInvestmentChange(
                                  investor.id,
                                  '',
                                  'units'
                                );
                              } else {
                                setProjectData({
                                  ...projectData,
                                  investors: projectData.investors.filter(inv => inv.name !== investor.name)
                                });
                              }
                            }}
                            className="rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                              <span className="text-blue-400 font-semibold text-sm">
                                {investor.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-white">{investor.name}</div>
                              <div className="text-sm text-gray-400">{investor.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={existingInvestment?.investmentType || 'units'}
                            onChange={(e) => handleInvestmentChange(
                              investor.id,
                              existingInvestment?.investment || '',
                              e.target.value as 'units' | 'amount'
                            )}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="units">Units</option>
                            <option value="amount">Amount</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative w-40">
                            {existingInvestment?.investmentType === 'amount' && (
                              <DollarSign className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                            )}
                            <input
                              type="text"
                              value={existingInvestment?.investment || ''}
                              onChange={(e) => handleInvestmentChange(
                                investor.id,
                                e.target.value,
                                existingInvestment?.investmentType || 'units'
                              )}
                              className={`w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                existingInvestment?.investmentType === 'amount' ? 'pl-10' : ''
                              }`}
                              placeholder="Enter amount"
                              step="0.25"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-300">
                            {existingInvestment?.units || 0} Units ({((existingInvestment?.units || 0) / parseFloat(projectData.totalUnits) * 100).toFixed(2)}%)
                          </span>
                          {existingInvestment && existingInvestment.units > 0 && (
                            <div className="mt-2">
                              <label className="flex items-center space-x-2 text-sm text-gray-400 hover:text-gray-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!(existingInvestment?.discount || existingInvestment?.discountMemo)}
                                  onChange={(e) => {
                                    const newGroups = projectData.investors.map(inv =>
                                      inv.name === investor.name
                                        ? { ...inv, discount: e.target.checked ? '0' : '', discountMemo: e.target.checked ? '' : '' }
                                        : inv
                                    );
                                    setProjectData({ ...projectData, investors: newGroups });
                                  }}
                                  className="rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
                                />
                                <span>Add Discount</span>
                              </label>
                            </div>
                          )}
                          {existingInvestment && existingInvestment.units > 0 && !!(existingInvestment.discount || existingInvestment.discountMemo) && (
                            <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                              <div className="text-sm font-medium text-gray-400 mb-2">Discount Details</div>
                              <div className="space-y-3">
                                <div className="relative">
                                  <div className="flex items-center space-x-2">
                                    <DollarSign className="h-5 w-5 text-gray-400" />
                                    <input
                                      type="text"
                                      value={existingInvestment.discount || ''}
                                      onChange={(e) => {
                                        const newGroups = projectData.investors.map(inv =>
                                          inv.name === investor.name
                                            ? { ...inv, discount: e.target.value }
                                            : inv
                                        );
                                        setProjectData({ ...projectData, investors: newGroups });
                                      }}
                                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="Enter discount amount"
                                    />
                                  </div>
                                </div>
                                <textarea
                                  value={existingInvestment.discountMemo || ''}
                                  onChange={(e) => {
                                    const newGroups = projectData.investors.map(inv =>
                                      inv.name === investor.name
                                        ? { ...inv, discountMemo: e.target.value }
                                        : inv
                                    );
                                    setProjectData({ ...projectData, investors: newGroups });
                                  }}
                                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                  placeholder="Enter reason for discount..."
                                  rows={2}
                                />
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {projectData.investors.length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Total Units Allocated: {projectData.investors.reduce((sum, inv) => sum + inv.units, 0)} / {parseFloat(projectData.totalUnits)}
                  </div>
                  <div className="text-sm text-gray-400">
                    Remaining Units: {parseFloat(projectData.totalUnits) - projectData.investors.reduce((sum, inv) => sum + inv.units, 0)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setProjectData({
                  name: '',
                  location: '',
                  drillDate: '',
                  targetInvestment: '',
                  totalUnits: '50',
                  isUnitsLocked: true,
                  investors: [],
                });
                setShowConfirmation(false);
              }}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              Clear Form
            </button>
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
              disabled={projectData.investors.length === 0}
            >
              Create Project
            </button>
          </div>
          </form>
        ) : (
          <div className="space-y-6">
                {/* Project Details */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-lg font-medium text-white mb-4">Project Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Project Name</p>
                      <p className="text-white">{projectData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="text-white">{projectData.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Drill Date</p>
                      <p className="text-white">{new Date(projectData.drillDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Target Investment</p>
                      <p className="text-white">${parseFloat(projectData.targetInvestment).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Unit Information */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-lg font-medium text-white mb-4">Unit Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Total Units</p>
                      <p className="text-white">{projectData.totalUnits}</p>
                    </div>
                  </div>
                </div>

                {/* Investor Summary */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-lg font-medium text-white mb-4">Investor Summary</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-400 border-b border-white/10 pb-2">
                      <span>Total Investors</span>
                      <span>{projectData.investors.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400 border-b border-white/10 pb-2">
                      <span>Total Units Allocated</span>
                      <span>{projectData.investors.reduce((sum, inv) => sum + inv.units, 0)} / {parseFloat(projectData.totalUnits)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>Remaining Units</span>
                      <span>{parseFloat(projectData.totalUnits) - projectData.investors.reduce((sum, inv) => sum + inv.units, 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Investor List */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-lg font-medium text-white mb-4">Selected Investors</h4>
                  <div className="space-y-3">
                    {projectData.investors.map((investor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <span className="text-blue-400 font-semibold text-sm">
                              {investor.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{investor.name}</div>
                            <div className="text-sm text-gray-400">{investor.email}</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-400">
                            {investor.investmentType === 'amount' ? (
                              <span>${parseFloat(investor.investment).toLocaleString()}</span>
                            ) : (
                              <span>{investor.units} Units</span>
                            )}
                          </div>
                          {investor.discount && (
                            <div className="text-sm text-red-400">
                              Discount: ${parseFloat(investor.discount).toLocaleString()}
                              {investor.discountMemo && (
                                <p className="text-xs text-gray-400 mt-1">{investor.discountMemo}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {projectData.investors.some(inv => inv.discount) && (
                      <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-red-400 font-medium">Total Discounts</p>
                          <p className="text-xl font-semibold text-red-400">
                            -${projectData.investors.reduce((sum, inv) => sum + (parseFloat(inv.discount || '0') || 0), 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-3">
                          {projectData.investors
                            .filter(inv => inv.discount && inv.discountMemo)
                            .map((inv, idx) => (
                              <div key={idx} className="p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span className="text-white font-medium">{inv.name}</span>
                                  <span className="text-red-400">-${parseFloat(inv.discount).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-400">{inv.discountMemo}</p>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-4 py-2 text-gray-400 hover:text-gray-300"
                  >
                    Back to Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProjectData({
                        name: '',
                        location: '',
                        drillDate: '',
                        targetInvestment: '',
                        totalUnits: '50',
                        isUnitsLocked: true,
                        investors: [],
                      });
                      setShowConfirmation(false);
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-gray-300"
                  >
                    Clear & Start Over
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                  >
                    Confirm & Create Project
                  </button>
                </div>
              </div>
        )}
      </div>
    </div>
  );
}
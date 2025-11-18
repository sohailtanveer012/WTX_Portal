import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, DollarSign, Users, X, FileText, Drill, Percent, Plus, Trash2, Search, CheckCircle, Lock as LockIcon, Unlock as UnlockIcon, Loader2 } from 'lucide-react';
import { fetchInvestorsWithTotalProjectsAndInvestment } from '../../api/services';
import { supabase } from '../../supabaseClient';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: any) => void;
}

interface Investor {
  investor_id: string | number;
  name: string;
  email: string;
  investmentType: 'units' | 'amount';
  investment: string;
  units: number;
  percentage_owned: number;
  invested_amount: number;
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

  const [availableInvestors, setAvailableInvestors] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [loadingInvestors, setLoadingInvestors] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    (async () => {
      setLoadingInvestors(true);
      try {
        const rows = await fetchInvestorsWithTotalProjectsAndInvestment();
        if (!mounted) return;
        // Map to id/name/email. RPC may not return email; default to empty string.
        const mapped = (rows || []).map((r: any, idx: number) => ({
          id: String(r.investor_id ?? idx),
          name: r.investor_name || 'Investor',
          email: r.investor_email || ''
        }));
        // De-duplicate by id
        const unique = Array.from(new Map(mapped.map(m => [m.id, m])).values());
        setAvailableInvestors(unique);
      } catch (e) {
        console.error('Failed to load investors list', e);
        if (!mounted) return;
        setAvailableInvestors([]);
      } finally {
        if (mounted) setLoadingInvestors(false);
      }
    })();
    return () => { mounted = false; };
  }, [isOpen]);

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

  const calculateInvestedAmount = (units: number, type: 'units' | 'amount', investment: string) => {
    const totalInvestment = parseFloat(projectData.targetInvestment.replace(/[^0-9.-]+/g, ''));
    const totalUnits = parseFloat(projectData.totalUnits);
    
    if (isNaN(totalInvestment) || isNaN(totalUnits) || totalUnits === 0) return 0;
    
    if (type === 'amount') {
      return parseFloat(investment) || 0;
    } else {
      // Calculate from units
      return (units / totalUnits) * totalInvestment;
    }
  };

  const calculatePercentageOwned = (units: number) => {
    const totalUnits = parseFloat(projectData.totalUnits);
    if (isNaN(totalUnits) || totalUnits === 0) return 0;
    return (units / totalUnits) * 100;
  };

  const handleInvestmentChange = (investorId: string, value: string, type: 'units' | 'amount') => {
    const investor = availableInvestors.find(inv => inv.id === investorId);
    if (!investor) return;

    const existingIndex = projectData.investors.findIndex(inv => inv.investor_id === investor.id);
    const units = calculateUnits(value, type);
    const investedAmount = calculateInvestedAmount(units, type, value);
    const percentageOwned = calculatePercentageOwned(units);

    if (existingIndex >= 0) {
      const updatedInvestors = [...projectData.investors];
      updatedInvestors[existingIndex] = {
        investor_id: investor.id,
        name: investor.name,
        email: investor.email,
        investmentType: type,
        investment: value,
        units,
        invested_amount: investedAmount,
        percentage_owned: percentageOwned,
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
            investor_id: investor.id,
            name: investor.name,
            email: investor.email,
            investmentType: type,
            investment: value,
            units,
            invested_amount: investedAmount,
            percentage_owned: percentageOwned,
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare investors data for the RPC
      // Filter out investors with 0% ownership and validate investor_id exists
      const investorsWithOwnership = projectData.investors.filter(inv => 
        inv.percentage_owned > 0 && inv.investor_id
      );
      
      if (investorsWithOwnership.length === 0) {
        setSubmitError('Please assign ownership percentage to at least one investor.');
        setIsSubmitting(false);
        return;
      }

      // Format investors array - the RPC expects investor_id and percentage_owned
      const investors = investorsWithOwnership.map(inv => {
        // Convert investor_id to number if it's a string
        let investorId: number;
        if (typeof inv.investor_id === 'string') {
          investorId = parseInt(inv.investor_id, 10);
          if (isNaN(investorId)) {
            throw new Error(`Invalid investor ID for ${inv.name}: ${inv.investor_id}`);
          }
        } else {
          investorId = inv.investor_id as number;
        }

        return {
          investor_id: investorId,
          percentage_owned: inv.percentage_owned,
        };
      });

      console.log('Calling add_project_with_investors with data:', {
        investors,
        location: projectData.location,
        name: projectData.name,
        start_date: projectData.drillDate,
        target_raise: parseFloat(projectData.targetInvestment) || 0,
        units_total: parseFloat(projectData.totalUnits) || 50,
      });

      // Call the RPC function
      const { data, error } = await supabase.rpc('add_project_with_investors', {
        investors: investors,
        location: projectData.location,
        name: projectData.name,
        start_date: projectData.drillDate,
        target_raise: parseFloat(projectData.targetInvestment) || 0,
        units_total: parseFloat(projectData.totalUnits) || 50,
      });

      if (error) {
        console.error('Error adding project:', error);
        setSubmitError(error.message || 'Failed to create project. Please try again.');
        setIsSubmitting(false);
        return;
      }

      console.log('Project created successfully:', data);
      
      // Reset form
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
      
      // Call onSubmit with the RPC response or projectData
      onSubmit(data || projectData);
      
      // Show success message
      alert('Project created successfully!');
      
      // Close modal
      onClose();
    } catch (e) {
      console.error('Failed to create project:', e);
      setSubmitError(e instanceof Error ? e.message : 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
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
              <table className="w-full min-w-[1200px]">
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
                                investor_id: investor.id,
                                name: investor.name,
                                email: investor.email,
                                investmentType: 'units' as const,
                                investment: '',
                                units: 0,
                                invested_amount: 0,
                                percentage_owned: 0,
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
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Invested Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Percentage Owned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loadingInvestors ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-6 text-center text-gray-400">Loading investors...</td>
                    </tr>
                  ) : filteredInvestors.map((investor) => {
                    const existingInvestment = projectData.investors.find(inv => inv.investor_id === investor.id);
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
                            {existingInvestment?.units || 0} Units
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white font-medium">
                            ${(existingInvestment?.invested_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="relative w-32">
                              <Percent className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={existingInvestment?.percentage_owned || 0}
                                onChange={(e) => {
                                  const newPercentage = parseFloat(e.target.value) || 0;
                                  const totalInvestment = parseFloat(projectData.targetInvestment.replace(/[^0-9.-]+/g, ''));
                                  const totalUnits = parseFloat(projectData.totalUnits);
                                  
                                  // Calculate units from percentage
                                  const newUnits = (newPercentage / 100) * totalUnits;
                                  // Calculate invested amount from percentage
                                  const newInvestedAmount = (newPercentage / 100) * totalInvestment;
                                  
                                  const updatedInvestors = projectData.investors.map(inv =>
                                    inv.investor_id === investor.id
                                      ? {
                                          ...inv,
                                          percentage_owned: newPercentage,
                                          units: newUnits,
                                          invested_amount: newInvestedAmount,
                                          investment: inv.investmentType === 'amount' 
                                            ? newInvestedAmount.toString() 
                                            : newUnits.toString(),
                                        }
                                      : inv
                                  );
                                  setProjectData({ ...projectData, investors: updatedInvestors });
                                }}
                                className="w-full pl-10 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                              />
                            </div>
                            <span className="text-sm text-gray-400">%</span>
                          </div>
                          {existingInvestment && existingInvestment.units > 0 && (
                            <div className="mt-2">
                              <label className="flex items-center space-x-2 text-sm text-gray-400 hover:text-gray-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!(existingInvestment?.discount || existingInvestment?.discountMemo)}
                                  onChange={(e) => {
                                    const newGroups = projectData.investors.map(inv =>
                                      inv.investor_id === investor.id
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
                                          inv.investor_id === investor.id
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
                                      inv.investor_id === investor.id
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

                {submitError && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                    <p className="text-red-400 text-sm">{submitError}</p>
                  </div>
                )}
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => {
                      setShowConfirmation(false);
                      setSubmitError(null);
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                    disabled={isSubmitting}
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
                      setSubmitError(null);
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                    disabled={isSubmitting}
                  >
                    Clear & Start Over
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Confirm & Create Project'
                    )}
                  </button>
                </div>
              </div>
        )}
      </div>
    </div>
  );
}
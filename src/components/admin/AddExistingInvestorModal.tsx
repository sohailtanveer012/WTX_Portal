import React, { useState, useEffect } from 'react';
import { X, User, Search, DollarSign, Percent, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchInvestorsFromInvestorsTable, fetchProjectsWithInvestorCount, addExistingInvestorToProject, fetchInvestorsByProject, type Investor } from '../../api/services';

interface AddExistingInvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedProjectId?: string;
  preselectedProjectName?: string;
}

interface Project {
  id: string;
  project_name: string;
}

export function AddExistingInvestorModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  preselectedProjectId, 
  preselectedProjectName 
}: AddExistingInvestorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [existingInvestors, setExistingInvestors] = useState<number[]>([]); // IDs of investors already in the project
  const [loadingInvestors, setLoadingInvestors] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingExistingInvestors, setLoadingExistingInvestors] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);

  const [formData, setFormData] = useState({
    projectId: '',
    investmentAmount: '',
    ownershipPercentage: '',
  });

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens, pre-fill project if provided
      const projectId = preselectedProjectId || '';
      setFormData({
        projectId: projectId,
        investmentAmount: '',
        ownershipPercentage: '',
      });
      setError('');
      setSuccess(false);
      setSelectedInvestor(null);
      setSearchTerm('');
      setExistingInvestors([]);
      loadInvestors();
      if (!preselectedProjectId) {
        loadProjects();
      } else {
        // Load existing investors for the pre-selected project
        loadExistingInvestors(projectId);
      }
    }
  }, [isOpen, preselectedProjectId]);

  // Load existing investors when project changes
  useEffect(() => {
    if (formData.projectId && isOpen) {
      loadExistingInvestors(formData.projectId);
    } else {
      setExistingInvestors([]);
    }
  }, [formData.projectId, isOpen]);

  const loadInvestors = async () => {
    setLoadingInvestors(true);
    try {
      const data = await fetchInvestorsFromInvestorsTable();
      setInvestors(data);
    } catch (e) {
      console.error('Failed to load investors:', e);
      setInvestors([]);
    } finally {
      setLoadingInvestors(false);
    }
  };

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const data = await fetchProjectsWithInvestorCount();
      const mapped = (data || []).map((p: any) => ({
        id: String(p.id || p.project_id || p.ID || p.PROJECT_ID),
        project_name: p.project_name || p.name || p.NAME || p.PROJECT_NAME || 'Unknown Project',
      }));
      setProjects(mapped);
    } catch (e) {
      console.error('Failed to load projects:', e);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadExistingInvestors = async (projectId: string) => {
    if (!projectId) {
      setExistingInvestors([]);
      return;
    }
    
    setLoadingExistingInvestors(true);
    try {
      const data = await fetchInvestorsByProject(projectId);
      // Extract investor IDs from the project investors
      const investorIds = (data || []).map((inv: any) => 
        Number(inv.investor_id || inv.id || inv.INVESTOR_ID || 0)
      ).filter((id: number) => id > 0);
      setExistingInvestors(investorIds);
      console.log('Existing investors in project:', investorIds);
    } catch (e) {
      console.error('Failed to load existing investors:', e);
      setExistingInvestors([]);
    } finally {
      setLoadingExistingInvestors(false);
    }
  };

  // Filter investors based on search term and exclude those already in the project
  const filteredInvestors = investors.filter(investor => {
    // Exclude investors already in the project
    if (existingInvestors.includes(investor.investor_id)) {
      return false;
    }
    // Filter by search term
    const matchesSearch = 
      investor.investor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.investor_email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!selectedInvestor) {
        throw new Error('Please select an investor');
      }

      if (!formData.projectId || !formData.projectId.trim()) {
        throw new Error('Please select a project');
      }

      if (!formData.investmentAmount || !formData.investmentAmount.trim()) {
        throw new Error('Investment amount is required');
      }

      if (!formData.ownershipPercentage || !formData.ownershipPercentage.trim()) {
        throw new Error('Ownership percentage is required');
      }

      const investedAmount = parseFloat(formData.investmentAmount);
      const percentageOwned = parseFloat(formData.ownershipPercentage);

      if (isNaN(investedAmount) || investedAmount <= 0) {
        throw new Error('Investment amount must be a positive number');
      }

      if (isNaN(percentageOwned) || percentageOwned <= 0 || percentageOwned > 100) {
        throw new Error('Ownership percentage must be between 0 and 100');
      }

      // Add existing investor to project
      await addExistingInvestorToProject({
        investor_id: selectedInvestor.investor_id,
        project_id: formData.projectId.trim(),
        invested_amount: investedAmount,
        percentage_owned: percentageOwned,
      });

      console.log('Investor added to project successfully');
      setSuccess(true);

      // Call onSuccess callback after a short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error adding investor to project:', err);
      setError(err.message || 'Failed to add investor to project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-card-gradient rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">Add Existing Investor to Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Success!</h3>
            <p className="text-gray-400">
              {selectedInvestor?.investor_name} has been successfully added to the project.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Investor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Select Investor <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {loadingInvestors || loadingExistingInvestors ? (
                <div className="mt-3 text-center text-gray-400 py-4">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  {loadingExistingInvestors ? 'Loading project investors...' : 'Loading investors...'}
                </div>
              ) : (
                <div className="mt-3 max-h-48 overflow-y-auto border border-white/10 rounded-xl">
                  {filteredInvestors.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                      {searchTerm 
                        ? 'No investors found matching your search' 
                        : existingInvestors.length > 0
                          ? `All ${existingInvestors.length} investor(s) are already in this project`
                          : 'No investors available'}
                    </div>
                  ) : (
                    filteredInvestors.map((investor) => (
                      <button
                        key={investor.id}
                        type="button"
                        onClick={() => setSelectedInvestor(investor)}
                        className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/10 last:border-b-0 ${
                          selectedInvestor?.id === investor.id
                            ? 'bg-blue-500/10 border-blue-500/20'
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                              <User className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{investor.investor_name}</p>
                              <p className="text-gray-400 text-sm">{investor.investor_email}</p>
                            </div>
                          </div>
                          {selectedInvestor?.id === investor.id && (
                            <CheckCircle2 className="h-5 w-5 text-blue-400" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
              
              {selectedInvestor && (
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-sm text-gray-400">Selected Investor:</p>
                  <p className="text-white font-medium">{selectedInvestor.investor_name}</p>
                  <p className="text-gray-400 text-sm">{selectedInvestor.investor_email}</p>
                </div>
              )}
            </div>

            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Select Project <span className="text-red-400">*</span>
              </label>
              {preselectedProjectName ? (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-white font-medium">{preselectedProjectName}</p>
                  <p className="text-gray-400 text-sm mt-1">Pre-selected project</p>
                  {loadingExistingInvestors && (
                    <p className="text-gray-500 text-xs mt-2">Loading existing investors...</p>
                  )}
                  {!loadingExistingInvestors && existingInvestors.length > 0 && (
                    <p className="text-gray-500 text-xs mt-2">
                      {existingInvestors.length} investor(s) already in this project will be excluded
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {loadingProjects ? (
                    <div className="text-center text-gray-400 py-4">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                      Loading projects...
                    </div>
                  ) : (
                    <select
                      value={formData.projectId}
                      onChange={(e) => {
                        setFormData({ ...formData, projectId: e.target.value });
                        // Clear selected investor when project changes
                        setSelectedInvestor(null);
                      }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a project...</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.project_name}
                        </option>
                      ))}
                    </select>
                  )}
                  {formData.projectId && !loadingExistingInvestors && existingInvestors.length > 0 && (
                    <p className="text-gray-500 text-xs mt-2">
                      {existingInvestors.length} investor(s) already in this project will be excluded
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Investment Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Investment Amount <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter investment amount"
                value={formData.investmentAmount}
                onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Ownership Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                <Percent className="inline h-4 w-4 mr-1" />
                Ownership Percentage <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Enter ownership percentage (0-100)"
                value={formData.ownershipPercentage}
                onChange={(e) => setFormData({ ...formData, ownershipPercentage: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Enter percentage (e.g., 5.25 for 5.25%)</p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !selectedInvestor}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add to Project'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { X, User, Search, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { fetchInvestorsByProject, removeInvestorFromProject } from '../../api/services';
import { supabase } from '../../supabaseClient';

type ProjectInvestor = {
  investor_id?: number;
  investor_name: string;
  investor_email: string;
  percentage_owned: number;
  payout_amount?: number;
  investment_amount?: number;
  invested_amount?: number;
};

interface RemoveInvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectId: string;
  projectName?: string;
}

export function RemoveInvestorModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  projectId,
  projectName
}: RemoveInvestorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [investors, setInvestors] = useState<ProjectInvestor[]>([]);
  const [loadingInvestors, setLoadingInvestors] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvestor, setSelectedInvestor] = useState<ProjectInvestor | null>(null);
  const [removingInvestorId, setRemovingInvestorId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess(false);
      setSelectedInvestor(null);
      setSearchTerm('');
      loadInvestors();
    }
  }, [isOpen, projectId]);

  const loadInvestors = async () => {
    setLoadingInvestors(true);
    try {
      // Query Investments-Test directly to get the correct investor_id values for this project
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('Investments-Test')
        .select('investor_id, invested_amount, percentage_owned')
        .eq('project_id', projectId);
      
      console.log('RemoveInvestorModal - Direct Investments-Test query result:', investmentsData);
      console.log('RemoveInvestorModal - Investments-Test error:', investmentsError);
      
      if (investmentsError) {
        console.error('RemoveInvestorModal - Error querying Investments-Test:', investmentsError);
        throw investmentsError;
      }
      
      if (!investmentsData || investmentsData.length === 0) {
        setInvestors([]);
        return;
      }
      
      // Get unique investor IDs
      const investorIds = [...new Set(investmentsData.map((inv: any) => inv.investor_id))];
      console.log('RemoveInvestorModal - Unique investor IDs from Investments-Test:', investorIds);
      
      // Fetch investor details from Investors table
      const { data: investorsData, error: investorsError } = await supabase
        .from('Investors')
        .select('id, Investor_name, Investor_email')
        .in('id', investorIds);
      
      console.log('RemoveInvestorModal - Investors table data:', investorsData);
      
      if (investorsError) {
        console.error('RemoveInvestorModal - Error querying Investors:', investorsError);
      }
      
      // Create a map of investor info by investor_id
      const investorsMap = new Map();
      (investorsData || []).forEach((inv: any) => {
        investorsMap.set(Number(inv.id), {
          name: inv.Investor_name || inv.Investor_Name || 'Unknown',
          email: inv.Investor_email || inv.Investor_Email || '',
        });
      });
      
      // Map Investments-Test data with investor info
      const mappedInvestors = investmentsData.map((investment: any) => {
        const investorId = Number(investment.investor_id);
        const investorInfo = investorsMap.get(investorId) || { name: 'Unknown', email: '' };
        
        return {
          investor_id: investorId,
          investor_name: investorInfo.name,
          investor_email: investorInfo.email,
          percentage_owned: Number(investment.percentage_owned || 0),
          investment_amount: Number(investment.invested_amount || 0),
          invested_amount: Number(investment.invested_amount || 0),
          payout_amount: 0,
        };
      });
      
      console.log('RemoveInvestorModal - Final mapped investors:', mappedInvestors);
      console.log('RemoveInvestorModal - Investor IDs:', mappedInvestors.map(inv => inv.investor_id));
      
      setInvestors(mappedInvestors);
    } catch (e) {
      console.error('Failed to load investors:', e);
      setInvestors([]);
      setError('Failed to load investors for this project');
    } finally {
      setLoadingInvestors(false);
    }
  };

  const filteredInvestors = investors.filter(investor =>
    (investor.investor_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (investor.investor_email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemove = async (investor: ProjectInvestor) => {
    console.log('RemoveInvestorModal - Attempting to remove investor:', investor);
    
    if (!investor.investor_id) {
      console.error('RemoveInvestorModal - Missing investor_id:', investor);
      setError(`Invalid investor ID. Investor data: ${JSON.stringify(investor)}`);
      return;
    }

    if (!window.confirm(`Are you sure you want to remove ${investor.investor_name} from ${projectName || 'this project'}? This action cannot be undone.`)) {
      return;
    }

    setRemovingInvestorId(investor.investor_id);
    setError('');
    setIsSubmitting(true);

    try {
      console.log('RemoveInvestorModal - Calling removeInvestorFromProject with:', {
        investor_id: investor.investor_id,
        investor_id_type: typeof investor.investor_id,
        project_id: projectId,
        project_id_type: typeof projectId,
      });
      
      const result = await removeInvestorFromProject({
        investor_id: investor.investor_id,
        project_id: projectId,
      });
      
      console.log('RemoveInvestorModal - removeInvestorFromProject result:', result);

      if (result.success) {
        setSuccess(true);
        // Refresh investors list
        await loadInvestors();
        // Call onSuccess callback after a short delay
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
          handleClose();
        }, 1500);
      } else {
        setError(result.error || 'Failed to remove investor');
      }
    } catch (err) {
      console.error('Error removing investor:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
      setRemovingInvestorId(null);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess(false);
    setSelectedInvestor(null);
    setSearchTerm('');
    setRemovingInvestorId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-gradient rounded-2xl p-6 max-w-2xl w-full border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Remove Investor from Project</h2>
            {projectName && (
              <p className="text-sm text-gray-400 mt-1">Project: {projectName}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search investors by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-green-400 text-sm">Investor successfully removed from project!</p>
          </div>
        )}

        {/* Investors List */}
        {loadingInvestors ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
            <span className="ml-3 text-gray-400">Loading investors...</span>
          </div>
        ) : filteredInvestors.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchTerm ? 'No investors found matching your search' : 'No investors found for this project'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredInvestors.map((investor, index) => (
              <div
                key={investor.investor_id || `investor-${index}`}
                className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <span className="text-blue-400 font-semibold text-sm">
                        {(investor.investor_name || '').split(' ').map((n, idx) => (n && n[0]) || '').filter(Boolean).join('') || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{investor.investor_name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-400 truncate">{investor.investor_email || 'No email'}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{(investor.percentage_owned || 0).toFixed(2)}% owned</span>
                        <span>•</span>
                        <span>
                          ${((investor.invested_amount ?? investor.investment_amount) || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(investor)}
                    disabled={isSubmitting || removingInvestorId === investor.investor_id}
                    className="ml-4 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {removingInvestorId === investor.investor_id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Removing...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        <span>Remove</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
            disabled={isSubmitting}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


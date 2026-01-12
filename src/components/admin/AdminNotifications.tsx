import React, { useState, useEffect, useCallback } from 'react';
import { Bell, DollarSign, User, Mail, Phone, Building, Calendar, CheckCircle, XCircle, Clock, Search, ArrowRightLeft, Percent, X, MapPin, Building2, CreditCard, Banknote } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { 
  markInvestmentRequestsAsViewed, 
  markDistributionRequestsAsViewed,
  updateDistributionRequestStatus,
  fetchAllDistributionRequests,
  fetchAllProfileEditRequests,
  markProfileEditRequestsAsViewed,
  updateProfileEditRequestStatus,
  type DistributionRequest,
  type DistributionRecipient,
  type ProfileEditRequest
} from '../../api/services';

interface InvestmentRequest {
  id: string | number;
  investor_name: string;
  investor_email: string;
  investor_phone?: string;
  company?: string;
  project_name: string;
  units?: number;
  message?: string;
  preferred_contact?: string;
  time_to_liquidate: string; // Date when investor will have funds available (mandatory)
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
}

interface AdminNotificationsProps {
  onMarkAsViewed?: () => void;
}

type RequestType = 'investment' | 'distribution' | 'edit_request';

export function AdminNotifications({ onMarkAsViewed }: AdminNotificationsProps) {
  const [activeTab, setActiveTab] = useState<RequestType>('investment');
  
  // Investment requests state
  const [investmentRequests, setInvestmentRequests] = useState<InvestmentRequest[]>([]);
  const [selectedInvestmentRequest, setSelectedInvestmentRequest] = useState<InvestmentRequest | null>(null);
  
  // Distribution requests state
  const [distributionRequests, setDistributionRequests] = useState<DistributionRequest[]>([]);
  const [selectedDistributionRequest, setSelectedDistributionRequest] = useState<DistributionRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [editedRecipients, setEditedRecipients] = useState<DistributionRecipient[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<number, string[]>>({});
  
  // Profile edit requests state
  const [profileEditRequests, setProfileEditRequests] = useState<ProfileEditRequest[]>([]);
  const [selectedProfileEditRequest, setSelectedProfileEditRequest] = useState<ProfileEditRequest | null>(null);
  const [editRequestAdminNotes, setEditRequestAdminNotes] = useState('');
  
  // Common state
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Fetch investment requests
  const fetchInvestmentRequests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('investment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching investment requests:', error);
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn('Investment requests table does not exist.');
          setInvestmentRequests([]);
        } else {
          setInvestmentRequests([]);
        }
      } else {
        setInvestmentRequests(data || []);
      }
    } catch (err) {
      console.error('Error fetching investment requests:', err);
      setInvestmentRequests([]);
    }
  }, []);

  // Fetch distribution requests
  const fetchDistributionRequests = useCallback(async () => {
    try {
      const data = await fetchAllDistributionRequests();
      setDistributionRequests(data);
    } catch (err) {
      console.error('Error fetching distribution requests:', err);
      setDistributionRequests([]);
    }
  }, []);

  // Fetch profile edit requests
  const fetchProfileEditRequests = useCallback(async () => {
    try {
      const data = await fetchAllProfileEditRequests();
      setProfileEditRequests(data);
    } catch (err) {
      console.error('Error fetching profile edit requests:', err);
      setProfileEditRequests([]);
    }
  }, []);

  // Load data when tab changes
  useEffect(() => {
    setLoading(true);
    if (activeTab === 'investment') {
      fetchInvestmentRequests().finally(() => setLoading(false));
    } else if (activeTab === 'distribution') {
      fetchDistributionRequests().finally(() => setLoading(false));
    } else if (activeTab === 'edit_request') {
      fetchProfileEditRequests().finally(() => setLoading(false));
    }
  }, [activeTab, fetchInvestmentRequests, fetchDistributionRequests, fetchProfileEditRequests]);

  // Mark requests as viewed and set up real-time subscriptions
  useEffect(() => {
    if (activeTab === 'investment') {
    markInvestmentRequestsAsViewed().then(() => {
      if (onMarkAsViewed) {
        onMarkAsViewed();
      }
    });
    
    const subscription = supabase
      .channel('investment_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'investment_requests'
        },
          () => {
          fetchInvestmentRequests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
    } else if (activeTab === 'distribution') {
      markDistributionRequestsAsViewed().then(() => {
        if (onMarkAsViewed) {
          onMarkAsViewed();
        }
      });

      const subscription = supabase
        .channel('distribution_requests_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'percentage_distribution_requests'
          },
          () => {
            fetchDistributionRequests();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else if (activeTab === 'edit_request') {
      markProfileEditRequestsAsViewed().then(() => {
        if (onMarkAsViewed) {
          onMarkAsViewed();
        }
      });

      const subscription = supabase
        .channel('profile_edit_requests_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profile_edit_requests'
          },
          () => {
            fetchProfileEditRequests();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [activeTab, fetchInvestmentRequests, fetchDistributionRequests, fetchProfileEditRequests, onMarkAsViewed]);

  // Update investment request status
  const handleInvestmentStatusUpdate = async (requestId: string | number, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('investment_requests')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error updating investment request status:', error);
        alert('Failed to update request status');
      } else {
        setInvestmentRequests(investmentRequests.map(req =>
          req.id === requestId
            ? { ...req, status: newStatus, updated_at: new Date().toISOString() }
            : req
        ));
        setSelectedInvestmentRequest(null);
      }
    } catch (err) {
      console.error('Error updating investment request status:', err);
      alert('Failed to update request status');
    }
  };

  // Update distribution request status
  // Update edited recipient
  const updateEditedRecipient = (index: number, field: keyof DistributionRecipient, value: string | number) => {
    const updated = [...editedRecipients];
    updated[index] = { ...updated[index], [field]: value };
    setEditedRecipients(updated);
  };

  // Initialize edited recipients when modal opens
  useEffect(() => {
    if (selectedDistributionRequest) {
      const recipients = Array.isArray(selectedDistributionRequest.recipients)
        ? selectedDistributionRequest.recipients
        : typeof selectedDistributionRequest.recipients === 'string'
        ? JSON.parse(selectedDistributionRequest.recipients)
        : [];
      setEditedRecipients(recipients.map((r: DistributionRecipient) => ({ ...r })));
    }
  }, [selectedDistributionRequest]);

  const handleDistributionStatusUpdate = async (requestId: string | number, newStatus: 'approved' | 'rejected') => {
    try {
      // If approving, validate that all required fields are filled
      if (newStatus === 'approved') {
        const recipientsToValidate = editedRecipients.length > 0 
          ? editedRecipients 
          : (Array.isArray(selectedDistributionRequest?.recipients)
              ? selectedDistributionRequest.recipients
              : typeof selectedDistributionRequest?.recipients === 'string'
              ? JSON.parse(selectedDistributionRequest.recipients)
              : []);

        const errors: Record<number, string[]> = {};
        let hasErrors = false;

        recipientsToValidate.forEach((recipient: DistributionRecipient, index: number) => {
          const recipientErrors: string[] = [];

          // Validate Personal Details (mandatory fields)
          if (!recipient.dob || recipient.dob.trim() === '') {
            recipientErrors.push('Date of Birth');
          }
          if (!recipient.address || recipient.address.trim() === '') {
            recipientErrors.push('Street Address');
          }
          if (!recipient.city || recipient.city.trim() === '') {
            recipientErrors.push('City');
          }
          if (!recipient.state || recipient.state.trim() === '') {
            recipientErrors.push('State');
          }
          if (!recipient.zip || recipient.zip.trim() === '') {
            recipientErrors.push('ZIP Code');
          }
          if (!recipient.company || recipient.company.trim() === '') {
            recipientErrors.push('Company Name');
          }
          if (!recipient.ssn || recipient.ssn.trim() === '') {
            recipientErrors.push('SSN');
          }

          // Validate Banking Details (all mandatory)
          if (!recipient.bank || recipient.bank.trim() === '') {
            recipientErrors.push('Bank Name');
          }
          if (!recipient.routing || recipient.routing.trim() === '') {
            recipientErrors.push('Routing Number');
          }
          if (!recipient.account || recipient.account.trim() === '') {
            recipientErrors.push('Account Number');
          }
          if (!recipient.account_type || recipient.account_type.trim() === '') {
            recipientErrors.push('Account Type');
          }

          if (recipientErrors.length > 0) {
            errors[index] = recipientErrors;
            hasErrors = true;
          }
        });

        if (hasErrors) {
          setValidationErrors(errors);
          const errorMessages = Object.entries(errors).map(([idx, fields]) => {
            const recipientName = recipientsToValidate[parseInt(idx)]?.name || `Recipient ${parseInt(idx) + 1}`;
            return `${recipientName}: ${fields.join(', ')}`;
          }).join('\n');
          
          alert(`Please fill in all required fields before approving:\n\n${errorMessages}\n\nAll personal details (Date of Birth, Address, City, State, ZIP Code, Company Name, SSN) and banking details (Bank Name, Routing Number, Account Number, Account Type) are mandatory.`);
          return;
        }

        // Clear validation errors if validation passes
        setValidationErrors({});
      }

      // Use edited recipients if available and status is approved, otherwise use original
      const recipientsToUse = newStatus === 'approved' && editedRecipients.length > 0 
        ? editedRecipients 
        : (Array.isArray(selectedDistributionRequest?.recipients)
            ? selectedDistributionRequest.recipients
            : typeof selectedDistributionRequest?.recipients === 'string'
            ? JSON.parse(selectedDistributionRequest.recipients)
            : []);
      
      const result = await updateDistributionRequestStatus(
        requestId, 
        newStatus, 
        adminNotes.trim() || undefined,
        newStatus === 'approved' ? recipientsToUse : undefined
      );
      
      if (result.success) {
        // Refresh the requests list
        await fetchDistributionRequests();
        setSelectedDistributionRequest(null);
        setAdminNotes('');
        alert(`Request ${newStatus} successfully. Email notification will be sent.`);
      } else {
        alert(`Failed to update request status: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error updating distribution request status:', err);
      alert('Failed to update request status');
    }
  };

  // Filter investment requests
  const filteredInvestmentRequests = investmentRequests.filter(request => {
    const matchesSearch = 
      request.investor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.investor_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.company && request.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter distribution requests
  const filteredDistributionRequests = distributionRequests.filter(request => {
    const matchesSearch = 
      request.investor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.investor_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.project_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingInvestmentCount = investmentRequests.filter(r => r.status === 'pending').length;
  const pendingDistributionCount = distributionRequests.filter(r => r.status === 'pending').length;
  const pendingProfileEditCount = profileEditRequests.filter(r => r.status === 'pending').length;
  const totalPendingCount = pendingInvestmentCount + pendingDistributionCount + pendingProfileEditCount;

  // Filter profile edit requests
  const filteredProfileEditRequests = profileEditRequests.filter(request => {
    const matchesSearch = 
      request.investor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.investor_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.request_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle profile edit request status update
  const handleProfileEditRequestStatusUpdate = async (requestId: string | number, newStatus: 'approved' | 'rejected' | 'completed') => {
    try {
      const result = await updateProfileEditRequestStatus(
        requestId,
        newStatus,
        editRequestAdminNotes.trim() || undefined
      );
      
      if (result.success) {
        await fetchProfileEditRequests();
        setSelectedProfileEditRequest(null);
        setEditRequestAdminNotes('');
        alert(`Edit request ${newStatus} successfully.`);
      } else {
        alert(`Failed to update request status: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error updating profile edit request status:', err);
      alert('Failed to update request status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 flex items-center">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-lg">Loading notifications...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Bell className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Requests & Notifications</h1>
                <p className="text-gray-400 mt-1">
                  {totalPendingCount > 0 
                    ? `${totalPendingCount} pending request${totalPendingCount > 1 ? 's' : ''}`
                    : 'No pending requests'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 bg-card-gradient rounded-2xl p-2 border border-white/10">
          <button
            onClick={() => {
              setActiveTab('investment');
              setSelectedInvestmentRequest(null);
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className={`flex-1 px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'investment'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <DollarSign className="h-5 w-5" />
            <span>Investment Requests</span>
            {pendingInvestmentCount > 0 && (
              <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                {pendingInvestmentCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('distribution');
              setSelectedDistributionRequest(null);
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className={`flex-1 px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'distribution'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ArrowRightLeft className="h-5 w-5" />
            <span>Distribution Requests</span>
            {pendingDistributionCount > 0 && (
              <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                {pendingDistributionCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('edit_request');
              setSelectedProfileEditRequest(null);
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className={`flex-1 px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'edit_request'
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="h-5 w-5" />
            <span>Edit Requests</span>
            {pendingProfileEditCount > 0 && (
              <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                {pendingProfileEditCount}
              </span>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search by investor${activeTab === 'investment' ? ', project, or company' : activeTab === 'edit_request' ? ' or request type' : ' or project'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-card-gradient text-white rounded-xl border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2 bg-card-gradient text-white rounded-xl border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Investment Requests List */}
        {activeTab === 'investment' && (
          <>
            {filteredInvestmentRequests.length > 0 ? (
          <div className="space-y-4">
                {filteredInvestmentRequests.map((request) => (
              <div
                key={request.id}
                className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-[var(--border-color)] cursor-pointer"
                    onClick={() => setSelectedInvestmentRequest(request)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <DollarSign className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{request.project_name}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Request from {request.investor_name}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300">{request.investor_name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300">{request.investor_email}</span>
                      </div>
                      {request.investor_phone && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">{request.investor_phone}</span>
                        </div>
                      )}
                      {request.company && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">{request.company}</span>
                        </div>
                      )}
                    </div>

                    {request.units && (
                      <div className="mt-4">
                        <span className="text-sm text-gray-400">Requested Units: </span>
                        <span className="text-sm font-medium text-white">{request.units}</span>
                      </div>
                    )}

                    {request.message && (
                      <div className="mt-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-sm text-gray-300 line-clamp-2">{request.message}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 mt-4 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>Requested on {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card-gradient rounded-2xl p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {searchTerm || statusFilter !== 'all'
                    ? 'No investment requests match your filters'
                : 'No investment requests yet'
              }
            </p>
          </div>
        )}

            {/* Investment Request Detail Modal */}
            {selectedInvestmentRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card-gradient rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Investment Request Details</h2>
                <button
                      onClick={() => setSelectedInvestmentRequest(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                      <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                      <h3 className="text-lg font-semibold text-white mb-4">{selectedInvestmentRequest.project_name}</h3>
                      {getStatusBadge(selectedInvestmentRequest.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-400">Investor Name</label>
                        <p className="text-white font-medium mt-1">{selectedInvestmentRequest.investor_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                        <p className="text-white font-medium mt-1">{selectedInvestmentRequest.investor_email}</p>
                  </div>
                      {selectedInvestmentRequest.investor_phone && (
                    <div>
                      <label className="text-sm text-gray-400">Phone</label>
                          <p className="text-white font-medium mt-1">{selectedInvestmentRequest.investor_phone}</p>
                    </div>
                  )}
                      {selectedInvestmentRequest.company && (
                    <div>
                      <label className="text-sm text-gray-400">Company</label>
                          <p className="text-white font-medium mt-1">{selectedInvestmentRequest.company}</p>
                    </div>
                  )}
                      {selectedInvestmentRequest.units && (
                    <div>
                      <label className="text-sm text-gray-400">Requested Units</label>
                          <p className="text-white font-medium mt-1">{selectedInvestmentRequest.units}</p>
                    </div>
                  )}
                      {selectedInvestmentRequest.preferred_contact && (
                    <div>
                      <label className="text-sm text-gray-400">Preferred Contact Method</label>
                          <p className="text-white font-medium mt-1 capitalize">{selectedInvestmentRequest.preferred_contact}</p>
                    </div>
                  )}
                      <div>
                        <label className="text-sm text-gray-400 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Time to Liquidate
                        </label>
                        <p className="text-white font-medium mt-1">
                          {new Date(selectedInvestmentRequest.time_to_liquidate).toLocaleDateString()}
                        </p>
                      </div>
                  <div>
                    <label className="text-sm text-gray-400">Request Date</label>
                    <p className="text-white font-medium mt-1">
                          {new Date(selectedInvestmentRequest.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                    {selectedInvestmentRequest.message && (
                  <div>
                    <label className="text-sm text-gray-400">Message</label>
                    <div className="mt-2 p-4 bg-white/5 rounded-lg">
                          <p className="text-white">{selectedInvestmentRequest.message}</p>
                    </div>
                  </div>
                )}

                    {selectedInvestmentRequest.status === 'pending' && (
                  <div className="flex items-center space-x-4 pt-4 border-t border-[var(--border-color)]">
                    <button
                          onClick={() => handleInvestmentStatusUpdate(selectedInvestmentRequest.id, 'approved')}
                      className="flex-1 px-4 py-3 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 hover:bg-green-500/20 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>Approve Request</span>
                    </button>
                    <button
                          onClick={() => handleInvestmentStatusUpdate(selectedInvestmentRequest.id, 'rejected')}
                      className="flex-1 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center space-x-2"
                    >
                      <XCircle className="h-5 w-5" />
                      <span>Reject Request</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
            )}
          </>
        )}

        {/* Distribution Requests List */}
        {activeTab === 'distribution' && (
          <>
            {filteredDistributionRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredDistributionRequests.map((request) => {
                  const recipients = Array.isArray(request.recipients) 
                    ? request.recipients 
                    : typeof request.recipients === 'string'
                    ? JSON.parse(request.recipients)
                    : [];
                  
                  return (
                    <div
                      key={request.id}
                      className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-[var(--border-color)] cursor-pointer"
                      onClick={() => setSelectedDistributionRequest(request)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                              <ArrowRightLeft className="h-5 w-5 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white">{request.project_name}</h3>
                              <p className="text-sm text-gray-400 mt-1">
                                Distribution request from {request.investor_name}
                              </p>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                            <div className="flex items-center space-x-2 text-sm">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-300">{request.investor_name}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-300">{request.investor_email}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Percent className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-300">Total: {request.total_percentage.toFixed(2)}%</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-300">{recipients.length} recipient{recipients.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-white/5 rounded-lg">
                            <p className="text-sm text-gray-400 mb-2">Recipients:</p>
                            <div className="space-y-1">
                              {recipients.slice(0, 3).map((recipient: DistributionRecipient, idx: number) => (
                                <p key={idx} className="text-sm text-gray-300">
                                  {recipient.name} ({recipient.percentage}%) - Transfer: {new Date(recipient.transferDate).toLocaleDateString()}
                                </p>
                              ))}
                              {recipients.length > 3 && (
                                <p className="text-sm text-gray-400">+{recipients.length - 3} more recipient{recipients.length - 3 !== 1 ? 's' : ''}</p>
                              )}
                            </div>
                          </div>

                          {request.message && (
                            <div className="mt-4 p-3 bg-white/5 rounded-lg">
                              <p className="text-sm text-gray-300 line-clamp-2">{request.message}</p>
                            </div>
                          )}

                          <div className="flex items-center space-x-2 mt-4 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>Requested on {new Date(request.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-card-gradient rounded-2xl p-12 text-center">
                <ArrowRightLeft className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  {searchTerm || statusFilter !== 'all'
                    ? 'No distribution requests match your filters'
                    : 'No distribution requests yet'
                  }
                </p>
              </div>
            )}

            {/* Distribution Request Detail Modal */}
            {selectedDistributionRequest && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-card-gradient rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border-color)]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Distribution Request Details</h2>
                    <button
                      onClick={() => {
                        setSelectedDistributionRequest(null);
                        setAdminNotes('');
                        setEditedRecipients([]);
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">{selectedDistributionRequest.project_name}</h3>
                      {getStatusBadge(selectedDistributionRequest.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-gray-400">Investor Name</label>
                        <p className="text-white font-medium mt-1">{selectedDistributionRequest.investor_name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <p className="text-white font-medium mt-1">{selectedDistributionRequest.investor_email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Project</label>
                        <p className="text-white font-medium mt-1">{selectedDistributionRequest.project_name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Total Percentage</label>
                        <p className="text-white font-medium mt-1">{selectedDistributionRequest.total_percentage.toFixed(2)}%</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Request Date</label>
                        <p className="text-white font-medium mt-1">
                          {new Date(selectedDistributionRequest.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-3 block">
                        Recipients {selectedDistributionRequest.status === 'pending' && '(Fill in additional details before approval)'}
                      </label>
                      {selectedDistributionRequest.status === 'pending' && (
                        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <p className="text-sm text-yellow-400">
                            <strong>Note:</strong> All personal details (Date of Birth, Address, City, State, ZIP Code, Company Name, SSN) and banking details (Bank Name, Routing Number, Account Number, Account Type) are <strong>mandatory</strong> before approval.
                          </p>
                        </div>
                      )}
                      <div className="space-y-4">
                        {(selectedDistributionRequest.status === 'pending' ? editedRecipients : (
                          Array.isArray(selectedDistributionRequest.recipients) 
                            ? selectedDistributionRequest.recipients 
                            : typeof selectedDistributionRequest.recipients === 'string'
                            ? JSON.parse(selectedDistributionRequest.recipients)
                            : []
                        )).map((recipient: DistributionRecipient, idx: number) => (
                          <div key={idx} className="p-5 bg-white/5 rounded-xl border border-white/10 space-y-4">
                            <div className="flex items-center gap-2 mb-3">
                              <User className="h-4 w-4 text-blue-400" />
                              <h4 className="text-sm font-semibold text-white">Recipient {idx + 1}</h4>
                            </div>
                            
                            {/* Basic Info (Read-only) */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pb-4 border-b border-white/10">
                              <div>
                                <p className="text-gray-400 text-xs mb-1">Name</p>
                                <p className="text-white font-medium">{recipient.name}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs mb-1">Email</p>
                                <p className="text-white font-medium">{recipient.email}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs mb-1">Percentage</p>
                                <p className="text-white font-medium">{recipient.percentage}%</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs mb-1">Transfer Date</p>
                                <p className="text-white font-medium">{new Date(recipient.transferDate).toLocaleDateString()}</p>
                              </div>
                            </div>

                            {/* Additional Details - Editable if pending, read-only if approved/rejected */}
                            {selectedDistributionRequest.status === 'pending' ? (
                              <>
                                {/* Personal Details */}
                                <div className="space-y-3">
                                  <p className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Personal Details
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        Phone Number
                                      </label>
                                      <input
                                        type="tel"
                                        value={editedRecipients[idx]?.phone || ''}
                                        onChange={(e) => updateEditedRecipient(idx, 'phone', e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="(555) 123-4567"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Date of Birth <span className="text-red-400">*</span>
                                      </label>
                                      <input
                                        type="date"
                                        value={editedRecipients[idx]?.dob || ''}
                                        onChange={(e) => {
                                          updateEditedRecipient(idx, 'dob', e.target.value);
                                          if (validationErrors[idx]) {
                                            const newErrors = { ...validationErrors };
                                            newErrors[idx] = newErrors[idx].filter(f => f !== 'Date of Birth');
                                            if (newErrors[idx].length === 0) delete newErrors[idx];
                                            setValidationErrors(newErrors);
                                          }
                                        }}
                                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                                          validationErrors[idx]?.includes('Date of Birth') 
                                            ? 'border-red-500/50 focus:ring-red-500' 
                                            : 'border-white/10 focus:ring-blue-500'
                                        }`}
                                      />
                                    </div>
                                    <div className="md:col-span-2">
                                      <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        Street Address <span className="text-red-400">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={editedRecipients[idx]?.address || ''}
                                        onChange={(e) => {
                                          updateEditedRecipient(idx, 'address', e.target.value);
                                          if (validationErrors[idx]) {
                                            const newErrors = { ...validationErrors };
                                            newErrors[idx] = newErrors[idx].filter(f => f !== 'Street Address');
                                            if (newErrors[idx].length === 0) delete newErrors[idx];
                                            setValidationErrors(newErrors);
                                          }
                                        }}
                                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                                          validationErrors[idx]?.includes('Street Address') 
                                            ? 'border-red-500/50 focus:ring-red-500' 
                                            : 'border-white/10 focus:ring-blue-500'
                                        }`}
                                        placeholder="123 Main Street"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1">
                                        City <span className="text-red-400">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={editedRecipients[idx]?.city || ''}
                                        onChange={(e) => {
                                          updateEditedRecipient(idx, 'city', e.target.value);
                                          if (validationErrors[idx]) {
                                            const newErrors = { ...validationErrors };
                                            newErrors[idx] = newErrors[idx].filter(f => f !== 'City');
                                            if (newErrors[idx].length === 0) delete newErrors[idx];
                                            setValidationErrors(newErrors);
                                          }
                                        }}
                                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                                          validationErrors[idx]?.includes('City') 
                                            ? 'border-red-500/50 focus:ring-red-500' 
                                            : 'border-white/10 focus:ring-blue-500'
                                        }`}
                                        placeholder="City"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1">
                                        State <span className="text-red-400">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={editedRecipients[idx]?.state || ''}
                                        onChange={(e) => {
                                          updateEditedRecipient(idx, 'state', e.target.value);
                                          if (validationErrors[idx]) {
                                            const newErrors = { ...validationErrors };
                                            newErrors[idx] = newErrors[idx].filter(f => f !== 'State');
                                            if (newErrors[idx].length === 0) delete newErrors[idx];
                                            setValidationErrors(newErrors);
                                          }
                                        }}
                                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                                          validationErrors[idx]?.includes('State') 
                                            ? 'border-red-500/50 focus:ring-red-500' 
                                            : 'border-white/10 focus:ring-blue-500'
                                        }`}
                                        placeholder="State"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1">
                                        ZIP Code <span className="text-red-400">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={editedRecipients[idx]?.zip || ''}
                                        onChange={(e) => {
                                          updateEditedRecipient(idx, 'zip', e.target.value);
                                          if (validationErrors[idx]) {
                                            const newErrors = { ...validationErrors };
                                            newErrors[idx] = newErrors[idx].filter(f => f !== 'ZIP Code');
                                            if (newErrors[idx].length === 0) delete newErrors[idx];
                                            setValidationErrors(newErrors);
                                          }
                                        }}
                                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                                          validationErrors[idx]?.includes('ZIP Code') 
                                            ? 'border-red-500/50 focus:ring-red-500' 
                                            : 'border-white/10 focus:ring-blue-500'
                                        }`}
                                        placeholder="12345"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                                        <Building2 className="h-3 w-3" />
                                        Company Name <span className="text-red-400">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={editedRecipients[idx]?.company || ''}
                                        onChange={(e) => {
                                          updateEditedRecipient(idx, 'company', e.target.value);
                                          if (validationErrors[idx]) {
                                            const newErrors = { ...validationErrors };
                                            newErrors[idx] = newErrors[idx].filter(f => f !== 'Company Name');
                                            if (newErrors[idx].length === 0) delete newErrors[idx];
                                            setValidationErrors(newErrors);
                                          }
                                        }}
                                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                                          validationErrors[idx]?.includes('Company Name') 
                                            ? 'border-red-500/50 focus:ring-red-500' 
                                            : 'border-white/10 focus:ring-blue-500'
                                        }`}
                                        placeholder="Company name"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        SSN <span className="text-red-400">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={editedRecipients[idx]?.ssn || ''}
                                        onChange={(e) => {
                                          updateEditedRecipient(idx, 'ssn', e.target.value);
                                          if (validationErrors[idx]) {
                                            const newErrors = { ...validationErrors };
                                            newErrors[idx] = newErrors[idx].filter(f => f !== 'SSN');
                                            if (newErrors[idx].length === 0) delete newErrors[idx];
                                            setValidationErrors(newErrors);
                                          }
                                        }}
                                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                                          validationErrors[idx]?.includes('SSN') 
                                            ? 'border-red-500/50 focus:ring-red-500' 
                                            : 'border-white/10 focus:ring-blue-500'
                                        }`}
                                        placeholder="XXX-XX-XXXX"
                                        maxLength={11}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Banking Details */}
                                <div className="space-y-3 pt-3 border-t border-white/10">
                                  <p className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Banknote className="h-4 w-4" />
                                    Banking Details
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                                        <Banknote className="h-3 w-3" />
                                        Bank Name <span className="text-red-400">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={editedRecipients[idx]?.bank || ''}
                                        onChange={(e) => {
                                          updateEditedRecipient(idx, 'bank', e.target.value);
                                          if (validationErrors[idx]) {
                                            const newErrors = { ...validationErrors };
                                            newErrors[idx] = newErrors[idx].filter(f => f !== 'Bank Name');
                                            if (newErrors[idx].length === 0) delete newErrors[idx];
                                            setValidationErrors(newErrors);
                                          }
                                        }}
                                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                                          validationErrors[idx]?.includes('Bank Name') 
                                            ? 'border-red-500/50 focus:ring-red-500' 
                                            : 'border-white/10 focus:ring-blue-500'
                                        }`}
                                        placeholder="Bank name"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        Routing Number <span className="text-red-400">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={editedRecipients[idx]?.routing || ''}
                                        onChange={(e) => {
                                          updateEditedRecipient(idx, 'routing', e.target.value);
                                          if (validationErrors[idx]) {
                                            const newErrors = { ...validationErrors };
                                            newErrors[idx] = newErrors[idx].filter(f => f !== 'Routing Number');
                                            if (newErrors[idx].length === 0) delete newErrors[idx];
                                            setValidationErrors(newErrors);
                                          }
                                        }}
                                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                                          validationErrors[idx]?.includes('Routing Number') 
                                            ? 'border-red-500/50 focus:ring-red-500' 
                                            : 'border-white/10 focus:ring-blue-500'
                                        }`}
                                        placeholder="9-digit routing number"
                                        maxLength={9}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        Account Number <span className="text-red-400">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={editedRecipients[idx]?.account || ''}
                                        onChange={(e) => {
                                          updateEditedRecipient(idx, 'account', e.target.value);
                                          if (validationErrors[idx]) {
                                            const newErrors = { ...validationErrors };
                                            newErrors[idx] = newErrors[idx].filter(f => f !== 'Account Number');
                                            if (newErrors[idx].length === 0) delete newErrors[idx];
                                            setValidationErrors(newErrors);
                                          }
                                        }}
                                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 ${
                                          validationErrors[idx]?.includes('Account Number') 
                                            ? 'border-red-500/50 focus:ring-red-500' 
                                            : 'border-white/10 focus:ring-blue-500'
                                        }`}
                                        placeholder="Account number"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        Account Type <span className="text-red-400">*</span>
                                      </label>
                                      <select
                                        value={editedRecipients[idx]?.account_type || ''}
                                        onChange={(e) => {
                                          updateEditedRecipient(idx, 'account_type', e.target.value);
                                          if (validationErrors[idx]) {
                                            const newErrors = { ...validationErrors };
                                            newErrors[idx] = newErrors[idx].filter(f => f !== 'Account Type');
                                            if (newErrors[idx].length === 0) delete newErrors[idx];
                                            setValidationErrors(newErrors);
                                          }
                                        }}
                                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 appearance-none ${
                                          validationErrors[idx]?.includes('Account Type') 
                                            ? 'border-red-500/50 focus:ring-red-500' 
                                            : 'border-white/10 focus:ring-blue-500'
                                        }`}
                                      >
                                        <option value="">Select account type</option>
                                        <option value="checking">Checking</option>
                                        <option value="savings">Savings</option>
                                        <option value="business">Business</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              /* Read-only view for approved/rejected */
                              (recipient.phone || recipient.dob || recipient.address || recipient.city || recipient.state || recipient.zip || recipient.company || recipient.ssn || recipient.bank || recipient.routing || recipient.account || recipient.account_type) && (
                                <div className="pt-3 border-t border-white/10">
                                  <p className="text-sm font-medium text-gray-300 mb-3">Additional Details</p>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    {recipient.phone && (
                                      <div>
                                        <p className="text-gray-400 text-xs mb-1">Phone</p>
                                        <p className="text-white font-medium">{recipient.phone}</p>
                                      </div>
                                    )}
                                    {recipient.dob && (
                                      <div>
                                        <p className="text-gray-400 text-xs mb-1">Date of Birth</p>
                                        <p className="text-white font-medium">{new Date(recipient.dob).toLocaleDateString()}</p>
                                      </div>
                                    )}
                                    {recipient.company && (
                                      <div>
                                        <p className="text-gray-400 text-xs mb-1">Company</p>
                                        <p className="text-white font-medium">{recipient.company}</p>
                                      </div>
                                    )}
                                    {recipient.address && (
                                      <div className="md:col-span-3">
                                        <p className="text-gray-400 text-xs mb-1">Address</p>
                                        <p className="text-white font-medium">
                                          {recipient.address}
                                          {recipient.city && `, ${recipient.city}`}
                                          {recipient.state && `, ${recipient.state}`}
                                          {recipient.zip && ` ${recipient.zip}`}
                                        </p>
                                      </div>
                                    )}
                                    {recipient.ssn && (
                                      <div>
                                        <p className="text-gray-400 text-xs mb-1">SSN</p>
                                        <p className="text-white font-medium">{recipient.ssn}</p>
                                      </div>
                                    )}
                                    {recipient.bank && (
                                      <div>
                                        <p className="text-gray-400 text-xs mb-1">Bank</p>
                                        <p className="text-white font-medium">{recipient.bank}</p>
                                      </div>
                                    )}
                                    {recipient.routing && (
                                      <div>
                                        <p className="text-gray-400 text-xs mb-1">Routing Number</p>
                                        <p className="text-white font-medium">{recipient.routing}</p>
                                      </div>
                                    )}
                                    {recipient.account && (
                                      <div>
                                        <p className="text-gray-400 text-xs mb-1">Account Number</p>
                                        <p className="text-white font-medium">{recipient.account}</p>
                                      </div>
                                    )}
                                    {recipient.account_type && (
                                      <div>
                                        <p className="text-gray-400 text-xs mb-1">Account Type</p>
                                        <p className="text-white font-medium capitalize">{recipient.account_type}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedDistributionRequest.message && (
                      <div>
                        <label className="text-sm text-gray-400">Notes from Investor</label>
                        <div className="mt-2 p-4 bg-white/5 rounded-lg">
                          <p className="text-white">{selectedDistributionRequest.message}</p>
                        </div>
                      </div>
                    )}

                    {selectedDistributionRequest.status === 'pending' && (
                      <>
                        <div>
                          <label className="text-sm text-gray-400 mb-2 block">Admin Notes (Optional)</label>
                          <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={3}
                            placeholder="Add any notes about this request..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                        </div>
                        <div className="flex items-center space-x-4 pt-4 border-t border-[var(--border-color)]">
                          <button
                            onClick={() => handleDistributionStatusUpdate(selectedDistributionRequest.id, 'approved')}
                            className="flex-1 px-4 py-3 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 hover:bg-green-500/20 transition-colors flex items-center justify-center space-x-2"
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span>Approve Request</span>
                          </button>
                          <button
                            onClick={() => handleDistributionStatusUpdate(selectedDistributionRequest.id, 'rejected')}
                            className="flex-1 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center space-x-2"
                          >
                            <XCircle className="h-5 w-5" />
                            <span>Reject Request</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Profile Edit Requests List */}
        {activeTab === 'edit_request' && (
          <>
            {filteredProfileEditRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredProfileEditRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-[var(--border-color)] cursor-pointer"
                    onClick={() => setSelectedProfileEditRequest(request)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <User className="h-5 w-5 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">
                              {request.request_type === 'personal_info' ? 'Personal Information' : 'Banking Information'} Edit Request
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                              Request from {request.investor_name}
                            </p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                          <div className="flex items-center space-x-2 text-sm">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">{request.investor_name}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">{request.investor_email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300 capitalize">{request.request_type.replace('_', ' ')}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mt-4 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>Requested on {new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card-gradient rounded-2xl p-12 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  {searchTerm || statusFilter !== 'all'
                    ? 'No edit requests match your filters'
                    : 'No edit requests yet'
                  }
                </p>
              </div>
            )}

            {/* Profile Edit Request Detail Modal */}
            {selectedProfileEditRequest && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-card-gradient rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border-color)]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Profile Edit Request Details</h2>
                    <button
                      onClick={() => setSelectedProfileEditRequest(null)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">
                        {selectedProfileEditRequest.request_type === 'personal_info' ? 'Personal Information' : 'Banking Information'} Edit Request
                      </h3>
                      {getStatusBadge(selectedProfileEditRequest.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-gray-400">Investor Name</label>
                        <p className="text-white font-medium mt-1">{selectedProfileEditRequest.investor_name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <p className="text-white font-medium mt-1">{selectedProfileEditRequest.investor_email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Request Type</label>
                        <p className="text-white font-medium mt-1 capitalize">{selectedProfileEditRequest.request_type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Request Date</label>
                        <p className="text-white font-medium mt-1">
                          {new Date(selectedProfileEditRequest.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-3 block">Current Data</label>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        {selectedProfileEditRequest.current_data && Object.keys(selectedProfileEditRequest.current_data).length > 0 ? (
                          <div className="space-y-3">
                            {Object.entries(selectedProfileEditRequest.current_data).map(([key, value]) => (
                              value && (
                                <div key={key} className="flex justify-between items-start">
                                  <span className="text-sm text-gray-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                                  <span className="text-sm text-white font-medium ml-4 text-right">
                                    {key === 'ssn' || key === 'account' || key === 'routing' 
                                      ? '****' + String(value).slice(-4)
                                      : String(value)
                                    }
                                  </span>
                                </div>
                              )
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">No current data available</p>
                        )}
                      </div>
                    </div>

                    {selectedProfileEditRequest.admin_notes && (
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Admin Notes</label>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <p className="text-sm text-white">{selectedProfileEditRequest.admin_notes}</p>
                        </div>
                      </div>
                    )}

                    {selectedProfileEditRequest.status === 'pending' && (
                      <>
                        <div>
                          <label className="text-sm text-gray-400 mb-2 block">Admin Notes (Optional)</label>
                          <textarea
                            value={editRequestAdminNotes}
                            onChange={(e) => setEditRequestAdminNotes(e.target.value)}
                            placeholder="Add notes about this request..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                          />
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-white/10">
                          <button
                            onClick={() => handleProfileEditRequestStatusUpdate(selectedProfileEditRequest.id, 'approved')}
                            className="flex-1 px-4 py-3 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 hover:bg-green-500/20 transition-colors font-medium"
                          >
                            <CheckCircle className="h-5 w-5 inline mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleProfileEditRequestStatusUpdate(selectedProfileEditRequest.id, 'rejected')}
                            className="flex-1 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors font-medium"
                          >
                            <XCircle className="h-5 w-5 inline mr-2" />
                            Reject
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

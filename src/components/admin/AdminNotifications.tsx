import React, { useState, useEffect, useCallback } from 'react';
import { Bell, DollarSign, User, Mail, Phone, Building, Calendar, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { markInvestmentRequestsAsViewed } from '../../api/services';

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
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
}

interface AdminNotificationsProps {
  onMarkAsViewed?: () => void;
}

export function AdminNotifications({ onMarkAsViewed }: AdminNotificationsProps) {
  const [requests, setRequests] = useState<InvestmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<InvestmentRequest | null>(null);

  const fetchInvestmentRequests = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch investment requests from database
      // Assuming table name is 'investment_requests'
      const { data, error } = await supabase
        .from('investment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching investment requests:', error);
        // Check if table doesn't exist
        if (error.code === 'PGRST116' || error.message?.includes('404') || error.message?.includes('does not exist')) {
          console.warn('Investment requests table does not exist. Please create it in Supabase.');
          setRequests([]);
        } else {
          setRequests([]);
        }
      } else {
        setRequests(data || []);
      }
    } catch (err) {
      console.error('Error fetching investment requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestmentRequests();
    
    // Mark all pending requests as viewed when admin opens the notifications tab
    markInvestmentRequestsAsViewed().then(() => {
      // Refresh the count in parent component
      if (onMarkAsViewed) {
        onMarkAsViewed();
      }
    });
    
    // Set up real-time subscription to listen for new requests
    const subscription = supabase
      .channel('investment_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'investment_requests'
        },
        (payload) => {
          console.log('Investment request change detected:', payload);
          // Refresh requests when a change is detected
          fetchInvestmentRequests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchInvestmentRequests, onMarkAsViewed]);

  const handleStatusUpdate = async (requestId: string | number, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('investment_requests')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error updating request status:', error);
        alert('Failed to update request status');
      } else {
        // Update local state
        setRequests(requests.map(req =>
          req.id === requestId
            ? { ...req, status: newStatus, updated_at: new Date().toISOString() }
            : req
        ));
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error('Error updating request status:', err);
      alert('Failed to update request status');
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.investor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.investor_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.company && request.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

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
                <h1 className="text-2xl font-bold text-white">Investment Requests</h1>
                <p className="text-gray-400 mt-1">
                  {pendingCount > 0 
                    ? `${pendingCount} pending request${pendingCount > 1 ? 's' : ''}`
                    : 'No pending requests'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by investor, project, or company..."
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

        {/* Requests List */}
        {filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-[var(--border-color)] cursor-pointer"
                onClick={() => setSelectedRequest(request)}
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
                ? 'No requests match your filters'
                : 'No investment requests yet'
              }
            </p>
          </div>
        )}

        {/* Request Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card-gradient rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Investment Request Details</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">{selectedRequest.project_name}</h3>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-400">Investor Name</label>
                    <p className="text-white font-medium mt-1">{selectedRequest.investor_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white font-medium mt-1">{selectedRequest.investor_email}</p>
                  </div>
                  {selectedRequest.investor_phone && (
                    <div>
                      <label className="text-sm text-gray-400">Phone</label>
                      <p className="text-white font-medium mt-1">{selectedRequest.investor_phone}</p>
                    </div>
                  )}
                  {selectedRequest.company && (
                    <div>
                      <label className="text-sm text-gray-400">Company</label>
                      <p className="text-white font-medium mt-1">{selectedRequest.company}</p>
                    </div>
                  )}
                  {selectedRequest.units && (
                    <div>
                      <label className="text-sm text-gray-400">Requested Units</label>
                      <p className="text-white font-medium mt-1">{selectedRequest.units}</p>
                    </div>
                  )}
                  {selectedRequest.preferred_contact && (
                    <div>
                      <label className="text-sm text-gray-400">Preferred Contact Method</label>
                      <p className="text-white font-medium mt-1 capitalize">{selectedRequest.preferred_contact}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-400">Request Date</label>
                    <p className="text-white font-medium mt-1">
                      {new Date(selectedRequest.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedRequest.message && (
                  <div>
                    <label className="text-sm text-gray-400">Message</label>
                    <div className="mt-2 p-4 bg-white/5 rounded-lg">
                      <p className="text-white">{selectedRequest.message}</p>
                    </div>
                  </div>
                )}

                {selectedRequest.status === 'pending' && (
                  <div className="flex items-center space-x-4 pt-4 border-t border-[var(--border-color)]">
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                      className="flex-1 px-4 py-3 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 hover:bg-green-500/20 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>Approve Request</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
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
      </div>
    </main>
  );
}


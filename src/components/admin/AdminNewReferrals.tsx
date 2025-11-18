import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, User, Mail, Phone, Building, MapPin, DollarSign, MessageSquare, Calendar, CheckCircle, XCircle, Clock, Search, Filter, Eye, EyeOff } from 'lucide-react';
import { getReferralSubmissions, markReferralSubmissionViewed, ReferralSubmission } from '../../api/services';
import { supabase } from '../../supabaseClient';

interface AdminNewReferralsProps {
  onMarkAsViewed?: () => void;
}

export function AdminNewReferrals({ onMarkAsViewed }: AdminNewReferralsProps) {
  const [submissions, setSubmissions] = useState<ReferralSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'contacted' | 'approved' | 'rejected'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ReferralSubmission | null>(null);
  const [hasMarkedAsViewed, setHasMarkedAsViewed] = useState(false);

  const fetchReferralSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReferralSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('Error fetching referral submissions:', err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferralSubmissions();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('referral_submissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_submissions'
        },
        () => {
          fetchReferralSubmissions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchReferralSubmissions]);

  // Mark all unviewed submissions as viewed when admin opens the tab (only once)
  useEffect(() => {
    if (submissions.length > 0 && !hasMarkedAsViewed) {
      const markAllAsViewed = async () => {
        const unviewed = submissions.filter(s => !s.viewed);
        for (const submission of unviewed) {
          await markReferralSubmissionViewed(submission.id);
        }
        if (unviewed.length > 0) {
          fetchReferralSubmissions(); // Refresh to update viewed status
          if (onMarkAsViewed) {
            onMarkAsViewed();
          }
        }
        setHasMarkedAsViewed(true);
      };
      
      markAllAsViewed();
    }
  }, [submissions, hasMarkedAsViewed, fetchReferralSubmissions, onMarkAsViewed]);

  const handleViewSubmission = async (submission: ReferralSubmission) => {
    setSelectedSubmission(submission);
    
    // Mark as viewed if not already viewed
    if (!submission.viewed) {
      await markReferralSubmissionViewed(submission.id);
      setSubmissions(submissions.map(s =>
        s.id === submission.id
          ? { ...s, viewed: true, viewed_at: new Date().toISOString() }
          : s
      ));
      if (onMarkAsViewed) {
        onMarkAsViewed();
      }
    }
  };

  const handleStatusUpdate = async (submissionId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('referral_submissions')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (error) {
        console.error('Error updating submission status:', error);
        alert('Failed to update submission status');
      } else {
        setSubmissions(submissions.map(s =>
          s.id === submissionId
            ? { ...s, status: newStatus, updated_at: new Date().toISOString() }
            : s
        ));
        // Close modal after successful status update
        setSelectedSubmission(null);
      }
    } catch (err) {
      console.error('Error updating submission status:', err);
      alert('Failed to update submission status');
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.referrer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.referral_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' },
      reviewed: { label: 'Reviewed', className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
      contacted: { label: 'Contacted', className: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
      approved: { label: 'Approved', className: 'bg-green-500/10 text-green-400 border border-green-500/20' },
      rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border border-red-500/20' },
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading referral submissions...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <UserPlus className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">New Referrals</h1>
                <p className="text-[var(--text-muted)] mt-1">
                  Review and manage referral submissions from potential investors
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{submissions.length}</p>
              <p className="text-sm text-gray-400">Total Submissions</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card-gradient rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or referral code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="contacted">Contacted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-card-gradient rounded-2xl overflow-hidden">
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center">
              <UserPlus className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No referral submissions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Potential Investor</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Referrer</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Investment Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Submitted</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className={`border-b border-white/10 hover:bg-white/5 cursor-pointer ${
                        !submission.viewed ? 'bg-blue-500/5' : ''
                      }`}
                      onClick={() => handleViewSubmission(submission)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <span className="text-blue-400 font-semibold">
                              {submission.full_name[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{submission.full_name}</div>
                            <div className="text-sm text-gray-400">{submission.email}</div>
                          </div>
                          {!submission.viewed && (
                            <span className="h-2 w-2 bg-blue-400 rounded-full"></span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{submission.referrer_name}</div>
                          <div className="text-sm text-gray-400">{submission.referrer_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white">
                        {submission.investment_amount
                          ? `$${submission.investment_amount.toLocaleString()}`
                          : 'Not specified'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(submission.status)}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewSubmission(submission);
                          }}
                          className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card-gradient rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-blue-500/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Referral Submission Details</h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Referrer Information */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-400" />
                    Referrer Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Name</label>
                      <p className="text-white font-medium">{selectedSubmission.referrer_name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <p className="text-white font-medium">{selectedSubmission.referrer_email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Referral Code</label>
                      <p className="text-white font-medium font-mono">{selectedSubmission.referral_code}</p>
                    </div>
                  </div>
                </div>

                {/* Potential Investor Information */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-green-400" />
                    Potential Investor Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Full Name</label>
                      <p className="text-white font-medium">{selectedSubmission.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <p className="text-white font-medium">{selectedSubmission.email}</p>
                    </div>
                    {selectedSubmission.phone && (
                      <div>
                        <label className="text-sm text-gray-400">Phone</label>
                        <p className="text-white font-medium">{selectedSubmission.phone}</p>
                      </div>
                    )}
                    {selectedSubmission.company && (
                      <div>
                        <label className="text-sm text-gray-400">Company</label>
                        <p className="text-white font-medium">{selectedSubmission.company}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                {(selectedSubmission.address || selectedSubmission.city || selectedSubmission.state) && (
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-purple-400" />
                      Address
                    </h3>
                    <div className="space-y-2">
                      {selectedSubmission.address && (
                        <p className="text-white">{selectedSubmission.address}</p>
                      )}
                      <p className="text-white">
                        {[selectedSubmission.city, selectedSubmission.state, selectedSubmission.zip_code]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      {selectedSubmission.country && (
                        <p className="text-white">{selectedSubmission.country}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Investment Information */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-yellow-400" />
                    Investment Details
                  </h3>
                  <div className="space-y-3">
                    {selectedSubmission.investment_amount && (
                      <div>
                        <label className="text-sm text-gray-400">Investment Amount</label>
                        <p className="text-white font-medium text-lg">
                          ${selectedSubmission.investment_amount.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedSubmission.investment_interest && (
                      <div>
                        <label className="text-sm text-gray-400">Investment Interest</label>
                        <p className="text-white">{selectedSubmission.investment_interest}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-gray-400">Preferred Contact Method</label>
                      <p className="text-white capitalize">{selectedSubmission.preferred_contact_method}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedSubmission.message && (
                <div className="mt-6 bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
                    Additional Message
                  </h3>
                  <p className="text-white whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
              )}

              {/* Status Update */}
              <div className="mt-6 flex items-center justify-between pt-6 border-t border-white/10">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Update Status</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedSubmission.id, 'reviewed')}
                      className={`px-4 py-2 rounded-xl transition-all font-medium ${
                        selectedSubmission.status === 'reviewed'
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                          : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
                      }`}
                    >
                      Reviewed
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedSubmission.id, 'contacted')}
                      className={`px-4 py-2 rounded-xl transition-all font-medium ${
                        selectedSubmission.status === 'contacted'
                          ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                          : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30'
                      }`}
                    >
                      Contacted
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedSubmission.id, 'approved')}
                      className={`px-4 py-2 rounded-xl transition-all font-medium ${
                        selectedSubmission.status === 'approved'
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                      }`}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedSubmission.id, 'rejected')}
                      className={`px-4 py-2 rounded-xl transition-all font-medium ${
                        selectedSubmission.status === 'rejected'
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Submitted</p>
                  <p className="text-white font-medium">
                    {new Date(selectedSubmission.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


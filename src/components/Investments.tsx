import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { InvestmentContactModal } from './InvestmentContactModal';
import { fetchInvestorRequests, type InvestorRequest } from '../api/services';
import { supabase } from '../supabaseClient';

interface InvestmentsProps {
  userProfile?: any;
}

export function Investments({ userProfile }: InvestmentsProps) {
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [myRequests, setMyRequests] = useState<InvestorRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [activeView, setActiveView] = useState<'opportunities' | 'my-requests'>('opportunities');

  // Fetch investor's requests
  const fetchMyRequests = useCallback(async () => {
    if (!userProfile?.email) {
      setMyRequests([]);
      return;
    }

    setLoadingRequests(true);
    try {
      const requests = await fetchInvestorRequests(userProfile.email);
      setMyRequests(requests);
    } catch (error) {
      console.error('Error fetching my requests:', error);
      setMyRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }, [userProfile?.email]);

  useEffect(() => {
    if (userProfile?.email) {
      fetchMyRequests();

      // Set up real-time subscription for investor requests
      const subscription = supabase
        .channel(`my_investment_requests_${userProfile.email.replace(/[^a-zA-Z0-9]/g, '_')}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'investment_requests'
          },
          (payload) => {
            // Check if this change is relevant to this investor
            const newRecord = payload.new as any;
            const oldRecord = payload.old as any;
            
            if (newRecord?.investor_email === userProfile.email || oldRecord?.investor_email === userProfile.email) {
              fetchMyRequests();
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [fetchMyRequests, userProfile?.email]);

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

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Investment Opportunities</h1>
              <p className="text-[var(--text-muted)] mt-1">Discover and invest in new oil & gas projects</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveView('opportunities')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeView === 'opportunities'
                ? 'bg-blue-500 text-white'
                : 'bg-card-gradient text-[var(--text-muted)] hover:bg-[var(--card-background-hover)] border border-[var(--border-color)]'
            }`}
          >
            Available Investments
          </button>
          <button
            onClick={() => setActiveView('my-requests')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 relative ${
              activeView === 'my-requests'
                ? 'bg-blue-500 text-white'
                : 'bg-card-gradient text-[var(--text-muted)] hover:bg-[var(--card-background-hover)] border border-[var(--border-color)]'
            }`}
          >
            My Requests
            {myRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {myRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* My Requests View */}
        {activeView === 'my-requests' && (
          <div className="mb-8">
            {loadingRequests ? (
              <div className="bg-card-gradient rounded-2xl p-12 text-center">
                <div className="text-white text-lg">Loading your requests...</div>
              </div>
            ) : myRequests.length > 0 ? (
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-[var(--border-color)]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="h-5 w-5 text-blue-400" />
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{request.project_name}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                          {request.units && (
                            <div>
                              <p className="text-sm text-[var(--text-muted)]">Requested Units</p>
                              <p className="text-lg font-semibold text-[var(--text-primary)]">{request.units}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-[var(--text-muted)]">Request Date</p>
                            <p className="text-lg font-semibold text-[var(--text-primary)]">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {request.updated_at && (
                            <div>
                              <p className="text-sm text-[var(--text-muted)]">Last Updated</p>
                              <p className="text-lg font-semibold text-[var(--text-primary)]">
                                {new Date(request.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-[var(--text-muted)]">Contact Method</p>
                            <p className="text-lg font-semibold text-[var(--text-primary)] capitalize">
                              {request.preferred_contact || 'Email'}
                            </p>
                          </div>
                        </div>
                        {request.message && (
                          <div className="mt-4 p-3 bg-white/5 rounded-lg">
                            <p className="text-sm text-[var(--text-muted)] mb-1">Your Message:</p>
                            <p className="text-sm text-[var(--text-primary)]">{request.message}</p>
                          </div>
                        )}
                        {request.status === 'pending' && (
                          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-sm text-yellow-400">
                              Your request is being reviewed by our team. We'll contact you via {request.preferred_contact || 'email'} soon.
                            </p>
                          </div>
                        )}
                        {request.status === 'approved' && (
                          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-sm text-green-400">
                              Congratulations! Your investment request has been approved. Our team will contact you shortly with next steps.
                            </p>
                          </div>
                        )}
                        {request.status === 'rejected' && (
                          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-400">
                              Your investment request was not approved at this time. Please contact us if you have any questions.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card-gradient rounded-2xl p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">You haven't submitted any investment requests yet</p>
                <p className="text-gray-500 text-sm mt-2">Browse available investments and submit a request to get started</p>
                <button
                  onClick={() => setActiveView('opportunities')}
                  className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  View Available Investments
                </button>
              </div>
            )}
          </div>
        )}

        {/* Available Investments View */}
        {activeView === 'opportunities' && (
          <div className="bg-card-gradient rounded-2xl p-12 text-center">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Investment Opportunities</h2>
            <p className="text-gray-400 text-lg">New investment opportunities are yet to be added</p>
            <p className="text-gray-500 text-sm mt-2">Check back soon for exciting new projects to invest in</p>
          </div>
        )}

        {/* Investment Contact Modal */}
        <InvestmentContactModal
          isOpen={selectedInvestment !== null}
          onClose={() => setSelectedInvestment(null)}
          investment={selectedInvestment}
          userProfile={userProfile}
          onSuccess={() => {
            // Refresh requests after submitting
            fetchMyRequests();
            // Switch to "My Requests" tab to show the newly submitted request
            setTimeout(() => {
              setActiveView('my-requests');
            }, 500);
          }}
        />
      </div>
    </main>
  );
}
import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, MapPin, Calendar, Users, Droplets, ChevronRight, Building, Target, Filter, Search, ArrowUpRight, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { InvestmentContactModal } from './InvestmentContactModal';
import { fetchInvestorRequests, type InvestorRequest } from '../api/services';
import { supabase } from '../supabaseClient';
import DemoProject1 from '../assets/Demo-Project-1.jpg';
import DemoProject2 from '../assets/Demo-Project-2.jpg';
import DemoProject3 from '../assets/Demo-Project-3.jpg';

interface InvestmentsProps {
  userProfile?: any;
}

export function Investments({ userProfile }: InvestmentsProps) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [myRequests, setMyRequests] = useState<InvestorRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [activeView, setActiveView] = useState<'opportunities' | 'my-requests'>('opportunities');

  const availableInvestments = [
    {
      id: '1',
      name: 'Eagle Ford Shale Development',
      location: 'Texas',
      image: DemoProject1,
      targetRaise: '$5,000,000',
      minimumInvestment: '$50,000',
      projectedReturn: '22.5%',
      status: 'Open',
      progress: 65,
      remainingAmount: '$1,750,000',
      closingDate: '2024-04-30',
      projectType: 'Oil Development',
      estimatedProduction: '12,500 BBL/month',
      description: 'Strategic oil development project in the Eagle Ford Shale, focusing on proven reserves with existing infrastructure.',
      highlights: [
        'Proven reserves of 2.5M barrels',
        'Existing infrastructure reduces costs',
        'Monthly distributions',
        'Tax advantages available'
      ]
    },
    {
      id: '2',
      name: 'Permian Basin Expansion',
      location: 'Texas',
      image: DemoProject2,
      targetRaise: '$7,500,000',
      minimumInvestment: '$75,000',
      projectedReturn: '24.8%',
      status: 'Closing Soon',
      progress: 85,
      remainingAmount: '$1,125,000',
      closingDate: '2024-04-15',
      projectType: 'Oil & Gas Development',
      estimatedProduction: '18,000 BBL/month',
      description: 'Expansion project in the highly productive Permian Basin, targeting multiple oil-rich formations.',
      highlights: [
        'Multiple productive formations',
        'Advanced drilling technology',
        'Strong existing production',
        'Quarterly distributions'
      ]
    },
    {
      id: '3',
      name: 'Bakken Formation Wells',
      location: 'North Dakota',
      image: DemoProject3,
      targetRaise: '$4,200,000',
      minimumInvestment: '$25,000',
      projectedReturn: '20.3%',
      status: 'Coming Soon',
      progress: 0,
      remainingAmount: '$4,200,000',
      closingDate: '2024-05-15',
      projectType: 'Oil Development',
      estimatedProduction: '9,500 BBL/month',
      description: 'New development project in the prolific Bakken Formation, utilizing latest drilling technologies.',
      highlights: [
        'Latest drilling technology',
        'High-quality crude oil',
        'Monthly distributions',
        'Extensive geological data'
      ]
    }
  ];

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

  const filteredInvestments = availableInvestments.filter(investment => {
    const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || investment.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesLocation = selectedLocation === 'all' || investment.location === selectedLocation;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Helper function to check if investor has already requested a project
  const hasRequestedProject = (projectName: string): InvestorRequest | null => {
    return myRequests.find(req => req.project_name === projectName) || null;
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
          <>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-card-gradient text-[var(--text-primary)] rounded-xl border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-card-gradient text-[var(--text-primary)] rounded-xl border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closing soon">Closing Soon</option>
            <option value="coming soon">Coming Soon</option>
          </select>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 bg-card-gradient text-[var(--text-primary)] rounded-xl border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Locations</option>
            <option value="Texas">Texas</option>
            <option value="North Dakota">North Dakota</option>
          </select>
        </div>

        {/* Investment Cards */}
        <div className="grid grid-cols-1 gap-8">
          {filteredInvestments.map((investment) => (
            <div
              key={investment.id}
              className="bg-card-gradient rounded-2xl overflow-hidden hover-neon-glow"
            >
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-72 h-48 md:h-auto relative">
                  <img
                    src={investment.image}
                    alt={investment.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      investment.status === 'Open'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : investment.status === 'Closing Soon'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {investment.status}
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-[var(--text-primary)]">{investment.name}</h2>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <span className="text-sm text-[var(--text-muted)] flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {investment.location}
                        </span>
                        <span className="text-sm text-[var(--text-muted)] flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {investment.projectType}
                        </span>
                        <span className="text-sm text-[var(--text-muted)] flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Closes {new Date(investment.closingDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-[var(--text-muted)]">Projected Return:</span>
                        <span className="text-green-400 font-semibold flex items-center">
                          {investment.projectedReturn}
                          <ArrowUpRight className="h-4 w-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[var(--text-muted)] mb-6">
                    {investment.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Target Raise</p>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">{investment.targetRaise}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Minimum Investment</p>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">{investment.minimumInvestment}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Remaining Amount</p>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">{investment.remainingAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Est. Production</p>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">{investment.estimatedProduction}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-4 md:mb-0 flex-1 mr-8">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-[var(--text-muted)]">Funding Progress</span>
                        <span className="text-[var(--text-primary)]">{investment.progress}%</span>
                      </div>
                      <div className="h-2 bg-[var(--card-background)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${investment.progress}%` }}
                        />
                      </div>
                    </div>
                    {investment.status !== 'Coming Soon' && (() => {
                      const existingRequest = hasRequestedProject(investment.name);
                      if (existingRequest) {
                        return (
                          <div className="flex flex-col items-end space-y-2">
                            {getStatusBadge(existingRequest.status)}
                            <button
                              onClick={() => setActiveView('my-requests')}
                              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors flex items-center"
                            >
                              View Request
                              <ChevronRight className="h-5 w-5 ml-2" />
                            </button>
                          </div>
                        );
                      }
                      return (
                        <button
                          onClick={() => setSelectedInvestment(investment)}
                          className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center"
                        >
                          Invest Now
                          <ChevronRight className="h-5 w-5 ml-2" />
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

          </>
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
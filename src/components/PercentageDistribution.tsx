import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowRightLeft, Plus, X, Calendar, Percent, User, Mail, FileText, Clock, CheckCircle, XCircle, Send, Loader2, Phone, MapPin, Building2, CreditCard, Banknote } from 'lucide-react';
import { fetchInvestorPortfolioByEmail } from '../api/services';
import { supabase } from '../supabaseClient';

type PortfolioRow = {
  investor_id?: number;
  investor_name: string;
  investor_email: string;
  project_id?: string;
  project_name: string;
  project_location?: string | null;
  invested_amount: number;
  percentage_owned: number;
  investment_amount?: number;
  ownership_percentage?: number;
};

interface UserProfile {
  id?: string | number;
  email?: string;
  full_name?: string;
  contact_name?: string;
  account_name?: string;
  [key: string]: unknown;
}

interface DistributionRecipient {
  id: string;
  name: string;
  email: string;
  percentage: number;
  transferDate: string;
  // Additional investor details
  phone?: string;
  dob?: string; // Date of birth
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  company?: string;
  ssn?: string;
  bank?: string;
  routing?: string;
  account?: string;
  account_type?: string;
}

interface DistributionRequest {
  id: string | number;
  investor_name: string;
  investor_email: string;
  project_name: string;
  project_id?: string;
  total_percentage: number;
  recipients: DistributionRecipient[];
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
}

export function PercentageDistribution({ userProfile }: { userProfile?: UserProfile }) {
  const [portfolio, setPortfolio] = useState<PortfolioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [recipients, setRecipients] = useState<DistributionRecipient[]>([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<DistributionRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [activeView, setActiveView] = useState<'new-request' | 'my-requests'>('new-request');

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!userProfile?.email) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const portfolioData = await fetchInvestorPortfolioByEmail(userProfile.email);
        setPortfolio(portfolioData as PortfolioRow[]);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setPortfolio([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [userProfile?.email]);

  // Fetch distribution requests
  const fetchMyRequests = useCallback(async () => {
    if (!userProfile?.email) {
      setMyRequests([]);
      return;
    }

    setLoadingRequests(true);
    try {
      const { data, error } = await supabase
        .from('percentage_distribution_requests')
        .select('*')
        .eq('investor_email', userProfile.email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching distribution requests:', error);
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn('Percentage distribution requests table does not exist yet.');
        }
        setMyRequests([]);
      } else {
        // Parse recipients JSON if stored as JSON
        const parsed = (data || []).map((req: any) => ({
          ...req,
          recipients: typeof req.recipients === 'string' ? JSON.parse(req.recipients) : req.recipients,
        }));
        setMyRequests(parsed as DistributionRequest[]);
      }
    } catch (err) {
      console.error('Error fetching distribution requests:', err);
      setMyRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }, [userProfile?.email]);

  useEffect(() => {
    if (activeView === 'my-requests') {
      fetchMyRequests();
    }
  }, [activeView, fetchMyRequests]);

  // Group portfolio by project
  const groupedByProject = useMemo(() => {
    return portfolio.reduce<Record<string, PortfolioRow[]>>((acc, item) => {
      const key = item.project_name || 'Unknown Project';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [portfolio]);

  // Get available projects with their ownership percentages
  const availableProjects = useMemo(() => {
    return Object.entries(groupedByProject)
      .map(([projectName, projectData]) => {
        if (projectData.length === 0) return null;
        const first = projectData[0];
        // Support both new (percentage_owned) and legacy (ownership_percentage) field names
        const ownershipPct = Number(first.percentage_owned || first.ownership_percentage || 0);
        
        // Only include projects where investor has ownership > 0
        if (ownershipPct <= 0) return null;
        
        return {
          name: projectName,
          id: first.project_id,
          ownershipPercentage: ownershipPct,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        // Sort by project name alphabetically
        if (a && b) {
          return a.name.localeCompare(b.name);
        }
        return 0;
      }) as Array<{ name: string; id?: string; ownershipPercentage: number }>;
  }, [groupedByProject]);

  // Get selected project's ownership percentage
  const selectedProjectData = useMemo(() => {
    return availableProjects.find(p => p.name === selectedProject);
  }, [availableProjects, selectedProject]);

  // Calculate total percentage being distributed
  const totalPercentage = useMemo(() => {
    return recipients.reduce((sum, r) => sum + (parseFloat(r.percentage.toString()) || 0), 0);
  }, [recipients]);

  // Add new recipient - only basic info required
  const addRecipient = () => {
    setRecipients([
      ...recipients,
      {
        id: Date.now().toString(),
        name: '',
        email: '',
        percentage: 0,
        transferDate: new Date().toISOString().split('T')[0],
        phone: '',
        // Additional fields will be filled by admin during approval
        dob: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        company: '',
        ssn: '',
        bank: '',
        routing: '',
        account: '',
        account_type: '',
      },
    ]);
  };

  // Remove recipient
  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
  };

  // Update recipient
  const updateRecipient = (id: string, field: keyof DistributionRecipient, value: string | number) => {
    setRecipients(
      recipients.map(r => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) {
      alert('Please select a project');
      return;
    }

    if (recipients.length === 0) {
      alert('Please add at least one recipient');
      return;
    }

    // Validate recipients - only basic fields required
    for (const recipient of recipients) {
      if (!recipient.name.trim()) {
        alert('Please enter a name for all recipients');
        return;
      }
      if (!recipient.email.trim()) {
        alert('Please enter an email for all recipients');
        return;
      }
      if (!recipient.phone || !recipient.phone.trim()) {
        alert('Please enter a phone number for all recipients');
        return;
      }
      if (recipient.percentage <= 0) {
        alert('Please enter a valid percentage greater than 0 for all recipients');
        return;
      }
      if (!recipient.transferDate) {
        alert('Please enter a transfer date for all recipients');
        return;
      }
    }

    if (totalPercentage > (selectedProjectData?.ownershipPercentage || 0)) {
      alert(`Total percentage (${totalPercentage.toFixed(2)}%) exceeds your ownership (${selectedProjectData?.ownershipPercentage.toFixed(2)}%)`);
      return;
    }

    setSubmitting(true);
    try {
      const investorEmail = userProfile?.email;
      const investorName = userProfile?.full_name || userProfile?.contact_name || userProfile?.account_name || '';

      if (!investorEmail) {
        alert('Error: Email address is required. Please contact support if this issue persists.');
        setSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('percentage_distribution_requests')
        .insert([
          {
            investor_name: investorName,
            investor_email: investorEmail,
            project_name: selectedProject,
            project_id: selectedProjectData?.id || null,
            total_percentage: totalPercentage,
            recipients: recipients,
            message: message.trim() || null,
            status: 'pending',
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error('Error submitting distribution request:', error);
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          alert('Error: The percentage_distribution_requests table does not exist in the database. Please contact the administrator to set up the database table.');
        } else {
          alert(`Failed to submit distribution request: ${error.message || 'Please try again.'}`);
        }
        setSubmitting(false);
        return;
      }

      alert('Your percentage distribution request has been submitted successfully! Admins will review and process it.');
      
      // Reset form
      setSelectedProject('');
      setRecipients([]);
      setMessage('');
      
      // Switch to my requests view
      setActiveView('my-requests');
      fetchMyRequests();
    } catch (err) {
      console.error('Error submitting distribution request:', err);
      alert('Failed to submit distribution request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <ArrowRightLeft className="h-8 w-8 text-blue-400" />
            Percentage Distribution
          </h1>
          <p className="text-[var(--text-muted)]">
            Request to distribute your ownership percentage to others (e.g., family members, partners)
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveView('new-request')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeView === 'new-request'
                ? 'bg-blue-500 text-white'
                : 'bg-card-gradient text-[var(--text-muted)] hover:bg-[var(--card-background-hover)]'
            }`}
          >
            New Request
          </button>
          <button
            onClick={() => setActiveView('my-requests')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeView === 'my-requests'
                ? 'bg-blue-500 text-white'
                : 'bg-card-gradient text-[var(--text-muted)] hover:bg-[var(--card-background-hover)]'
            }`}
          >
            My Requests
          </button>
        </div>

        {activeView === 'new-request' ? (
          <div className="bg-card-gradient rounded-2xl p-6 border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Select Project *
                </label>
                {availableProjects.length > 0 ? (
                  <>
                    <select
                      value={selectedProject}
                      onChange={(e) => {
                        setSelectedProject(e.target.value);
                        setRecipients([]);
                      }}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">-- Select a project --</option>
                      {availableProjects.map((project) => (
                        <option key={project.name} value={project.name}>
                          {project.name} ({project.ownershipPercentage.toFixed(2)}% owned)
                        </option>
                      ))}
                    </select>
                    {selectedProjectData && (
                      <p className="mt-2 text-sm text-[var(--text-muted)]">
                        Your current ownership: {selectedProjectData.ownershipPercentage.toFixed(2)}%
                      </p>
                    )}
                  </>
                ) : (
                  <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[var(--text-muted)]">
                    <p>No projects available. You need to have ownership in at least one project to create a distribution request.</p>
                  </div>
                )}
              </div>

              {/* Recipients */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-[var(--text-primary)]">
                    Recipients *
                  </label>
                  <button
                    type="button"
                    onClick={addRecipient}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Recipient
                  </button>
                </div>

                <div className="space-y-6">
                  {recipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-400" />
                          Recipient {recipients.indexOf(recipient) + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeRecipient(recipient.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remove recipient"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Basic Information - Only essential fields */}
                      <div className="bg-white/5 rounded-xl p-4">
                        <h5 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-400" />
                          Recipient Information
                        </h5>
                        <p className="text-xs text-[var(--text-muted)] mb-4">
                          Provide basic information. Additional details will be collected by admin during approval.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              value={recipient.name}
                              onChange={(e) => updateRecipient(recipient.id, 'name', e.target.value)}
                              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all"
                              required
                              placeholder="Enter full name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2 flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              Email Address *
                            </label>
                            <input
                              type="email"
                              value={recipient.email}
                              onChange={(e) => updateRecipient(recipient.id, 'email', e.target.value)}
                              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all"
                              required
                              placeholder="email@example.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2 flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              value={recipient.phone || ''}
                              onChange={(e) => updateRecipient(recipient.id, 'phone', e.target.value)}
                              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all"
                              required
                              placeholder="(555) 123-4567"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2 flex items-center gap-1">
                              <Percent className="h-4 w-4" />
                              Percentage to Transfer *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              max={selectedProjectData?.ownershipPercentage || 100}
                              value={recipient.percentage}
                              onChange={(e) => updateRecipient(recipient.id, 'percentage', parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all"
                              required
                              placeholder="0.00"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2 flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Transfer Date *
                            </label>
                            <input
                              type="date"
                              value={recipient.transferDate}
                              onChange={(e) => updateRecipient(recipient.id, 'transferDate', e.target.value)}
                              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-all"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {recipients.length === 0 && (
                    <div className="text-center py-8 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-[var(--text-muted)]">No recipients added yet. Click "Add Recipient" to get started.</p>
                    </div>
                  )}
                </div>

                {recipients.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-muted)]">Total Percentage Being Distributed:</span>
                      <span className="text-lg font-semibold text-blue-400">
                        {totalPercentage.toFixed(2)}%
                      </span>
                    </div>
                    {selectedProjectData && totalPercentage > selectedProjectData.ownershipPercentage && (
                      <p className="mt-2 text-sm text-red-400">
                        Warning: Total exceeds your ownership ({selectedProjectData.ownershipPercentage.toFixed(2)}%)
                      </p>
                    )}
                    {selectedProjectData && totalPercentage <= selectedProjectData.ownershipPercentage && (
                      <p className="mt-2 text-sm text-green-400">
                        Remaining: {(selectedProjectData.ownershipPercentage - totalPercentage).toFixed(2)}%
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Any additional information you'd like to provide..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !selectedProject || recipients.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {loadingRequests ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              </div>
            ) : myRequests.length > 0 ? (
              myRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-card-gradient rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                        {request.project_name}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        Total: {request.total_percentage.toFixed(2)}% • Created: {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {request.status === 'pending' && (
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                      {request.status === 'approved' && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Approved
                        </span>
                      )}
                      {request.status === 'rejected' && (
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <h4 className="text-sm font-medium text-[var(--text-primary)]">Recipients:</h4>
                    {request.recipients.map((recipient, idx) => (
                      <div key={idx} className="bg-white/5 rounded-xl p-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-[var(--text-muted)]">Name</p>
                            <p className="text-[var(--text-primary)] font-medium">{recipient.name}</p>
                          </div>
                          <div>
                            <p className="text-[var(--text-muted)]">Email</p>
                            <p className="text-[var(--text-primary)]">{recipient.email}</p>
                          </div>
                          <div>
                            <p className="text-[var(--text-muted)]">Percentage</p>
                            <p className="text-[var(--text-primary)] font-medium">{recipient.percentage}%</p>
                          </div>
                          <div>
                            <p className="text-[var(--text-muted)]">Transfer Date</p>
                            <p className="text-[var(--text-primary)]">{new Date(recipient.transferDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {request.message && (
                    <div className="mt-4 p-3 bg-white/5 rounded-xl">
                      <p className="text-sm text-[var(--text-muted)] mb-1">Notes:</p>
                      <p className="text-sm text-[var(--text-primary)]">{request.message}</p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <p className="text-sm text-yellow-400">
                        Your request is being reviewed by our team. You will be notified once it's processed.
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-card-gradient rounded-2xl p-12 text-center border border-white/10">
                <ArrowRightLeft className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  No Distribution Requests
                </h3>
                <p className="text-[var(--text-muted)] mb-6">
                  You haven't submitted any percentage distribution requests yet.
                </p>
                <button
                  onClick={() => setActiveView('new-request')}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Create New Request
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}


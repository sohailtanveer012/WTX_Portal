import React, { useState, useEffect, useMemo } from 'react';
import { Users, DollarSign, Target, Copy, CheckCircle, Share2, Mail, Loader2, AlertCircle } from 'lucide-react';
import { getReferralCode, getReferralStats, getReferrals, ReferralStats, Referral } from '../api/services';
import { fetchInvestorPortfolioByEmail } from '../api/services';
import { ReferralEmailModal } from './ReferralEmailModal';

interface UserProfile {
  id?: string | number;
  email?: string;
  full_name?: string;
  contact_name?: string;
  account_name?: string;
  [key: string]: unknown;
}

export function Affiliates({ userProfile }: { userProfile?: UserProfile }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [investorId, setInvestorId] = useState<number | null>(null);

  // Fetch investor ID from portfolio
  useEffect(() => {
    const fetchInvestorId = async () => {
      if (!userProfile?.email) {
        setLoading(false);
        return;
      }

      try {
        const portfolio = await fetchInvestorPortfolioByEmail(userProfile.email);
        if (portfolio && portfolio.length > 0 && portfolio[0].investor_id) {
          const id = typeof portfolio[0].investor_id === 'number' 
            ? portfolio[0].investor_id 
            : parseInt(portfolio[0].investor_id as string);
          setInvestorId(id);
        } else {
          setError('Unable to find investor ID. Please contact support.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching investor ID:', err);
        setError('Failed to load affiliate data.');
        setLoading(false);
      }
    };

    fetchInvestorId();
  }, [userProfile?.email]);

  // Fetch referral data when investor ID is available
  useEffect(() => {
    const fetchReferralData = async () => {
      if (!investorId) return;

      setLoading(true);
      setError(null);

      try {
        const [code, stats, referralsList] = await Promise.all([
          getReferralCode(investorId),
          getReferralStats(investorId),
          getReferrals(investorId),
        ]);

        setReferralCode(code);
        setReferralStats(stats);
        setReferrals(referralsList);
      } catch (err) {
        console.error('Error fetching referral data:', err);
        setError('Failed to load referral data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [investorId]);

  const affiliateLink = referralCode 
    ? `${window.location.origin}?ref=${referralCode}`
    : '';

  const handleCopyCode = () => {
    if (affiliateLink) {
      navigator.clipboard.writeText(affiliateLink);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const referrerName = userProfile?.full_name || userProfile?.contact_name || userProfile?.account_name || 'A friend';

  const stats = useMemo(() => {
    if (!referralStats) return [];
    
    return [
      {
        label: 'Total Referrals',
        value: referralStats.total_referrals.toString(),
        icon: Users,
        color: 'blue',
      },
      {
        label: 'Active Investors',
        value: referralStats.active_investors.toString(),
        icon: Target,
        color: 'purple',
      },
      {
        label: 'Submitted',
        value: referralStats.submitted.toString(),
        icon: DollarSign,
        color: 'green',
      },
    ];
  }, [referralStats]);

  const getStatusBadge = (referral: Referral) => {
    // Use submission_status if available (from referral_submissions table), otherwise use referral status
    const displayStatus = referral.submission_status || referral.status;
    
    const statusMap: Record<string, { label: string; className: string }> = {
      // Referral statuses
      pending: {
        label: 'Pending',
        className: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      },
      clicked: {
        label: 'Clicked',
        className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      },
      submitted: {
        label: 'Submitted',
        className: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      },
      active_investor: {
        label: 'Active',
        className: 'bg-green-500/10 text-green-400 border border-green-500/20',
      },
      // Submission statuses (from referral_submissions)
      reviewed: {
        label: 'Reviewed',
        className: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      },
      contacted: {
        label: 'Contacted',
        className: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      },
      approved: {
        label: 'Approved',
        className: 'bg-green-500/10 text-green-400 border border-green-500/20',
      },
      rejected: {
        label: 'Rejected',
        className: 'bg-red-500/10 text-red-400 border border-red-500/20',
      },
    };

    const statusInfo = statusMap[displayStatus] || statusMap.pending;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-gray-400">Loading affiliate data...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !referralCode) {
    return (
      <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card-gradient rounded-2xl p-6 border border-red-500/20">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertCircle className="h-6 w-6" />
              <p>{error}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Affiliate Program</h1>
              <p className="text-[var(--text-muted)] mt-1">Track your referrals and their investments</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-card-gradient rounded-2xl p-4 border border-yellow-500/20">
            <div className="flex items-center space-x-3 text-yellow-400">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-${stat.color}-500/20`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/10`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
              </div>
              <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Affiliate Code Section */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <h2 className="text-xl font-semibold text-white mb-6">Your Affiliate Link</h2>
          {referralCode ? (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={affiliateLink}
                    readOnly
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
                  />
                  <button
                    onClick={handleCopyCode}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                  >
                    {copiedCode ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowEmailModal(true)}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                Send via Email
              </button>
            </div>
          ) : (
            <p className="text-gray-400">Generating your referral link...</p>
          )}
        </div>

        {/* Referrals Table */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <h2 className="text-xl font-semibold text-white mb-6">Your Referrals</h2>
          {referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Clicked At</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Submitted At</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-white/10">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <span className="text-blue-400 font-semibold text-sm">
                              {referral.referred_email ? referral.referred_email[0].toUpperCase() : '?'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {referral.referred_name || referral.referred_email || 'Unknown'}
                            </div>
                            {referral.referred_email && (
                              <div className="text-sm text-gray-400">{referral.referred_email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(referral)}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {referral.clicked_at 
                          ? new Date(referral.clicked_at).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {referral.submitted_at 
                          ? new Date(referral.submitted_at).toLocaleDateString()
                          : referral.submission_created_at
                          ? new Date(referral.submission_created_at).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No referrals yet. Share your link to get started!</p>
            </div>
          )}
        </div>
      </div>

      <ReferralEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        referralLink={affiliateLink}
        referrerName={referrerName}
      />
    </main>
  );
}

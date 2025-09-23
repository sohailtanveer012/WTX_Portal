import React, { useState } from 'react';
import { Users, DollarSign, Target, Copy, CheckCircle, Share2, Mail } from 'lucide-react';

export function Affiliates() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const affiliateCode = 'REF123456';
  const affiliateLink = `https://wtx.energy/join?ref=${affiliateCode}`;

  const stats = [
    {
      label: 'Total Referrals',
      value: '3',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Active Investors',
      value: '2',
      icon: Target,
      color: 'purple',
    },
    {
      label: 'Total Invested',
      value: '$750,000',
      icon: DollarSign,
      color: 'green',
    },
  ];

  const referrals = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      status: 'Active',
      joinDate: '2024-01-15',
      totalInvested: '$250,000',
      projects: 3,
      monthlyIncome: '$12,500',
      totalReturn: '+22.5%',
    },
    {
      name: 'Michael Chen',
      email: 'm.chen@example.com',
      status: 'Pending',
      joinDate: '2024-02-01',
      totalInvested: '$180,000',
      projects: 2,
      monthlyIncome: '$9,000',
      totalReturn: '+18.3%',
    },
    {
      name: 'Emma Davis',
      email: 'emma.d@example.com',
      status: 'Active',
      joinDate: '2024-02-15',
      totalInvested: '$320,000',
      projects: 4,
      monthlyIncome: '$16,000',
      totalReturn: '+24.6%',
    },
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

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
              onClick={() => setShowShareModal(true)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share Link
            </button>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <h2 className="text-xl font-semibold text-white mb-6">Your Referrals</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Investor</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Join Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Total Invested</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Total Return</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Projects</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Monthly Income</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral, index) => (
                  <tr key={index} className="border-b border-white/10">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <span className="text-blue-400 font-semibold">
                            {referral.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{referral.name}</div>
                          <div className="text-sm text-gray-400">{referral.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        referral.status === 'Active'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(referral.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{referral.totalInvested}</td>
                    <td className="px-6 py-4 text-green-400">{referral.totalReturn}</td>
                    <td className="px-6 py-4 text-gray-300">{referral.projects}</td>
                    <td className="px-6 py-4 text-green-400">{referral.monthlyIncome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
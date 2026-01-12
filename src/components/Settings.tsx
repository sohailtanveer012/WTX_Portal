import React, { useState, useEffect } from 'react';
import { User, Shield, Mail, Key, Download, HelpCircle, ChevronRight, Cog, Loader2 } from 'lucide-react';
import { fetchInvestorPortfolioByEmail } from '../api/services';
import { BankingDetails } from './BankingDetails';
import { PersonalInfo } from './PersonalInfo';
import { ChangePasswordModal } from './ChangePasswordModal';

type PortfolioRow = {
  investor_id?: number;
  investor_name: string;
  investor_email: string;
  investor_phone?: string;
  dob?: string;
  address?: string;
  company?: string;
  account_type?: string;
  ssn?: string;
  bank?: string;
  routing?: string;
  account?: string;
  project_id?: string;
  project_name: string;
  project_location?: string | null;
  project_status?: string;
  invested_amount: number;
  percentage_owned: number;
  payout_id?: string | number | null;
  payout_amount?: number | null;
  payout_month?: number | null;
  payout_year?: number | null;
  payout_created_at?: string | null;
  // Legacy fields for backward compatibility
  investment_amount?: number;
  ownership_percentage?: number;
  month?: string | number | null;
  year?: string | number | null;
  created_at?: string | null;
};

interface UserProfile {
  id?: string | number;
  full_name?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

export function Settings({ userProfile }: { userProfile?: UserProfile }) {
  const [portfolio, setPortfolio] = useState<PortfolioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Fetch portfolio data to get investor details
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

  // Get investor details from portfolio or userProfile
  const investorName = portfolio.length > 0 ? portfolio[0].investor_name : (userProfile?.full_name || '');
  const investorEmail = portfolio.length > 0 ? portfolio[0].investor_email : (userProfile?.email || '');
  const investorPhone = portfolio.length > 0 ? (portfolio[0].investor_phone || '') : (userProfile?.phone || '');
  const investorAddress = portfolio.length > 0 ? (portfolio[0].address || '') : '';
  const investorCompany = portfolio.length > 0 ? (portfolio[0].company || '') : '';
  const investorDOB = portfolio.length > 0 ? (portfolio[0].dob || '') : '';
  const investorSSN = portfolio.length > 0 ? (portfolio[0].ssn || '') : '';
  const investorBank = portfolio.length > 0 ? (portfolio[0].bank || '') : '';
  const investorRouting = portfolio.length > 0 ? (portfolio[0].routing || '') : '';
  const investorAccount = portfolio.length > 0 ? (portfolio[0].account || '') : '';

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
            <p className="text-gray-400">Loading your settings...</p>
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
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Cog className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">System Settings</h1>
              <p className="text-[var(--text-muted)] mt-1">Manage your account preferences and security</p>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <User className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
          </div>

          <div className="space-y-6">
            {/* Personal Information Component */}
            <PersonalInfo
              name={investorName}
              email={investorEmail}
              phone={investorPhone}
              dob={investorDOB}
              address={investorAddress}
              company={investorCompany}
              ssn={investorSSN}
            />

            {/* Banking Details Component */}
            <BankingDetails
              bank={investorBank}
              routing={investorRouting}
              account={investorAccount}
              email={investorEmail}
              name={investorName}
            />
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-card-gradient rounded-2xl p-6 mb-8 hover-neon-glow">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Security</h2>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="w-full p-4 rounded-xl bg-white/5 flex items-center justify-between hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Change Password</h3>
                  <p className="text-sm text-gray-400">Update your account password</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <div className="p-4 rounded-xl bg-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-400">Enhance your account security</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500/20">
                Enable
              </button>
            </div>
          </div>
        </div>

        {/* Support & Help */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <div className="flex items-center space-x-3 mb-6">
            <HelpCircle className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Support & Help</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-400" />
              <span className="text-white">Contact Support</span>
            </button>
            <button className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center space-x-3">
              <Download className="h-5 w-5 text-green-400" />
              <span className="text-white">Download User Guide</span>
            </button>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </main>
  );
}
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, CreditCard, Calendar, Building, MapPin, Loader2, Eye, EyeOff } from 'lucide-react';
import { getInvestorPersonalInfo, InvestorPersonalInfo } from '../../api/services';

interface InvestorPersonalInfoModalProps {
  investorId: number;
  investorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InvestorPersonalInfoModal({ investorId, investorName, isOpen, onClose }: InvestorPersonalInfoModalProps) {
  const [personalInfo, setPersonalInfo] = useState<InvestorPersonalInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSSN, setShowSSN] = useState(false);
  const [showBankAccount, setShowBankAccount] = useState(false);

  useEffect(() => {
    if (isOpen && investorId) {
      fetchPersonalInfo();
    } else {
      setPersonalInfo(null);
      setError(null);
      setShowSSN(false);
      setShowBankAccount(false);
    }
  }, [isOpen, investorId]);

  const fetchPersonalInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await getInvestorPersonalInfo(investorId);
      if (info) {
        setPersonalInfo(info);
      } else {
        setError('Personal information not found for this investor.');
      }
    } catch (err) {
      console.error('Error fetching personal info:', err);
      setError('Failed to load personal information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const maskSSN = (ssn: string | null) => {
    if (!ssn) return 'N/A';
    if (showSSN) return ssn;
    return ssn.replace(/\d(?=\d{4})/g, '*');
  };

  const maskAccount = (account: string | null) => {
    if (!account) return 'N/A';
    if (showBankAccount) return account;
    return '****' + account.slice(-4);
  };

  const maskRouting = (routing: string | null) => {
    if (!routing) return 'N/A';
    if (showBankAccount) return routing;
    return '****' + routing.slice(-4);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-gradient rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <User className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Personal Information</h2>
              <p className="text-sm text-gray-400">{investorName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Personal Info */}
        {personalInfo && !loading && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Full Name</p>
                  <p className="text-white font-medium">{personalInfo.investor_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </p>
                  <p className="text-white font-medium">{personalInfo.investor_email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    Phone
                  </p>
                  <p className="text-white font-medium">{personalInfo.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Birthday
                  </p>
                  <p className="text-white font-medium">
                    {personalInfo.birthday ? new Date(personalInfo.birthday).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center">
                    <Building className="h-3 w-3 mr-1" />
                    Company
                  </p>
                  <p className="text-white font-medium">{personalInfo.company || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">SSN</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-white font-medium">{maskSSN(personalInfo.ssn)}</p>
                    <button
                      onClick={() => setShowSSN(!showSSN)}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                      title={showSSN ? 'Hide SSN' : 'Show SSN'}
                    >
                      {showSSN ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Street Address</p>
                  <p className="text-white font-medium">{personalInfo.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">City</p>
                  <p className="text-white font-medium">{personalInfo.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">State</p>
                  <p className="text-white font-medium">{personalInfo.state || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">ZIP Code</p>
                  <p className="text-white font-medium">{personalInfo.zip || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Banking Information */}
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Banking Information
                <button
                  onClick={() => setShowBankAccount(!showBankAccount)}
                  className="ml-auto flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors"
                  title={showBankAccount ? 'Hide Banking Details' : 'Show Banking Details'}
                >
                  {showBankAccount ? (
                    <>
                      <EyeOff className="h-3 w-3" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                  <p className="text-white font-medium">{personalInfo.bank || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Routing Number</p>
                  <p className="text-white font-medium">{maskRouting(personalInfo.routing)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Account Number</p>
                  <p className="text-white font-medium">{maskAccount(personalInfo.account)}</p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


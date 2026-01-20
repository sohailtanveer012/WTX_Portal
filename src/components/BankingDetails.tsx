import React, { useState } from 'react';
import { CreditCard, Building2, Hash, Eye, EyeOff, Edit, Loader2, X } from 'lucide-react';
import { createProfileEditRequest } from '../api/services';

interface BankingDetailsProps {
  bank?: string;
  routing?: string;
  account?: string;
  email?: string;
  name?: string;
}

export function BankingDetails({ bank, routing, account, email, name }: BankingDetailsProps) {
  const [showAccount, setShowAccount] = React.useState(false);
  const [showRouting, setShowRouting] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    bank: bank || '',
    routing: routing || '',
    account: account || ''
  });

  // Mask sensitive information
  const maskAccount = (acc?: string) => {
    if (!acc) return 'Not provided';
    if (showAccount) return acc;
    return `•••• •••• •••• ${acc.slice(-4)}`;
  };

  const maskRouting = (rte?: string) => {
    if (!rte) return 'Not provided';
    if (showRouting) return rte;
    return `•••${rte.slice(-3)}`;
  };

  return (
    <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
      <div className="flex items-center space-x-3 mb-6">
        <CreditCard className="h-6 w-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">Banking Details</h2>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center space-x-3 mb-2">
            <Building2 className="h-5 w-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-400">Bank Name</label>
          </div>
          <p className="text-white text-lg font-medium ml-8">
            {bank || 'Not provided'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <Hash className="h-5 w-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-400">Routing Number</label>
            </div>
            {routing && (
              <button
                type="button"
                onClick={() => setShowRouting(!showRouting)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={showRouting ? "Hide routing number" : "Show routing number"}
              >
                {showRouting ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
          <p className="text-white text-lg font-medium ml-8">
            {maskRouting(routing)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-400">Account Number</label>
            </div>
            {account && (
              <button
                type="button"
                onClick={() => setShowAccount(!showAccount)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={showAccount ? "Hide account number" : "Show account number"}
              >
                {showAccount ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
          <p className="text-white text-lg font-medium ml-8">
            {maskAccount(account)}
          </p>
        </div>

        {(!bank && !routing && !account) && (
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-yellow-400 text-sm text-center">
              No banking details on file. Please contact support to update your banking information.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-colors font-medium"
        >
          <Edit className="h-5 w-5" />
          Request Edit
        </button>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-gradient rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Banking Details</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!email || !name) {
                  alert('Error: Email and name are required to submit an edit request.');
                  return;
                }

                setIsSubmitting(true);
                try {
                  const currentData = {
                    bank: bank || '',
                    routing: routing || '',
                    account: account || ''
                  };

                  const newData = {
                    bank: formData.bank,
                    routing: formData.routing,
                    account: formData.account
                  };

                  const result = await createProfileEditRequest(
                    email,
                    name,
                    'banking_info',
                    currentData,
                    newData
                  );

                  if (result.success) {
                    alert('Edit request submitted successfully! Our team will review and update your banking details shortly.');
                    setShowEditModal(false);
                  } else {
                    alert(`Failed to submit edit request: ${result.error || 'Please try again.'}`);
                  }
                } catch (err) {
                  console.error('Error submitting edit request:', err);
                  alert('Failed to submit edit request. Please try again.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Bank Name</label>
                <input
                  type="text"
                  value={formData.bank}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter bank name"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Routing Number</label>
                <input
                  type="text"
                  value={formData.routing}
                  onChange={(e) => setFormData({ ...formData, routing: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter routing number"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Account Number</label>
                <input
                  type="text"
                  value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter account number"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 text-white rounded-xl border border-white/10 hover:bg-white/10 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Edit className="h-5 w-5" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


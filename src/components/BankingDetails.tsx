import React from 'react';
import { CreditCard, Building2, Hash, Eye, EyeOff, Edit } from 'lucide-react';

interface BankingDetailsProps {
  bank?: string;
  routing?: string;
  account?: string;
}

export function BankingDetails({ bank, routing, account }: BankingDetailsProps) {
  const [showAccount, setShowAccount] = React.useState(false);
  const [showRouting, setShowRouting] = React.useState(false);

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
          onClick={() => {
            // Handle edit request - could show modal, contact support, etc.
            alert('Edit request submitted. Our team will contact you shortly to update your banking details.');
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-colors font-medium"
        >
          <Edit className="h-5 w-5" />
          Request Edit
        </button>
      </div>
    </div>
  );
}


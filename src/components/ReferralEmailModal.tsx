import React, { useState } from 'react';
import { X, Mail, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface ReferralEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralLink: string;
  referrerName?: string;
}

export function ReferralEmailModal({ isOpen, onClose, referralLink, referrerName = 'A friend' }: ReferralEmailModalProps) {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(`Join WTX Energy - Investment Opportunity`);
  const [message, setMessage] = useState(`Hi there,

I wanted to share an exciting investment opportunity with you through WTX Energy, a leading platform for crude oil investments.

I've been investing with them and thought you might be interested. You can learn more and get started using my referral link:

${referralLink}

This link will help you get started and I'll be able to track your progress. If you have any questions, feel free to reach out!

Best regards,
${referrerName}`);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSending(true);

    try {
      // Create mailto link with pre-filled email
      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Show success message
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEmail('');
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error opening email client:', err);
      setError('Failed to open email client. Please copy the link and send it manually.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleClose = () => {
    if (!isSending) {
      setEmail('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-gradient rounded-2xl p-6 max-w-2xl w-full border border-blue-500/20 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Send Referral Email</h2>
          <button
            onClick={handleClose}
            disabled={isSending}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {success && !isSending && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>Email client opened! Or link copied to clipboard.</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Recipient Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                disabled={isSending}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter recipient email address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending}
              rows={8}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
            >
              Copy Link Instead
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSending}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending || !email}
                className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Opening...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Open Email Client</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


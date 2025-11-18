import React, { useState } from 'react';
import { X, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Use Supabase's resetPasswordForEmail method
      // This will send a password reset email to the user
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message || 'Failed to send reset email. Please try again.');
        setIsLoading(false);
        return;
      }

      // Success - email sent
      setIsSubmitted(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error sending password reset email:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setIsSubmitted(false);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-gradient rounded-2xl p-6 max-w-md w-full border border-blue-500/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Reset Password</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-[var(--text-muted)] mb-4">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
              
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Instructions
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="bg-green-500/10 text-green-400 p-4 rounded-xl mb-4 flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Reset instructions sent successfully!</span>
            </div>
            <p className="text-[var(--text-muted)] mb-2">
              We've sent password reset instructions to:
            </p>
            <p className="text-white font-medium mb-4">{email}</p>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Please check your email and follow the instructions to reset your password. The link will expire in 1 hour.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Return to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
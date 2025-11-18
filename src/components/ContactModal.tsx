import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, Building, Send } from 'lucide-react';
import { updateReferralContact } from '../api/services';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Check for referral code in localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const storedCode = localStorage.getItem('referral_code');
      if (storedCode) {
        setReferralCode(storedCode);
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // If there's a referral code, update the referral record
      if (referralCode) {
        const result = await updateReferralContact(
          referralCode,
          formData.email,
          formData.name
        );
        
        if (result.success) {
          // Remove referral code from localStorage after successful update
          localStorage.removeItem('referral_code');
          console.log('Referral updated successfully:', result);
        } else {
          console.warn('Failed to update referral:', result.error);
          // Continue with form submission even if referral update fails
        }
      }
      
      // In a real application, this would send the data to an API
      console.log('Contact form submitted:', formData);
      onClose();
    } catch (err) {
      console.error('Error submitting contact form:', err);
      // Still close the modal even if there's an error
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-gradient rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Get Started</h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 h-5 w-5 text-[var(--text-muted)]" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Company Name
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-3.5 h-5 w-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your company name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Message
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Tell us about your investment goals"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-3 text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Send Message
            <Send className="h-5 w-5 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
}
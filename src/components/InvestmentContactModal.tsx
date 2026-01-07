import React, { useState, useEffect } from 'react';
import { X, Phone, Building, DollarSign, Send, Calendar } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface InvestmentContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: any;
  userProfile?: any;
  onSuccess?: () => void;
}

export function InvestmentContactModal({ isOpen, onClose, investment, userProfile, onSuccess }: InvestmentContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    units: '',
    message: '',
    preferredContact: 'email',
    hasComments: false,
    timeToLiquidate: ''
  });

  // Update form data when modal opens or userProfile changes
  useEffect(() => {
    if (isOpen && userProfile) {
      setFormData(prev => ({
        ...prev,
        name: userProfile?.full_name || userProfile?.contact_name || userProfile?.account_name || prev.name || '',
        email: userProfile?.email || prev.email || '',
        phone: userProfile?.phone || userProfile?.contact_phone || prev.phone || '',
        company: userProfile?.company || prev.company || '',
      }));
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        units: '',
        message: '',
        preferredContact: 'email',
        hasComments: false,
        timeToLiquidate: ''
      });
    }
  }, [isOpen, userProfile]);

  // Calculate price per unit
  const pricePerUnit = investment?.targetRaise && investment?.totalUnits
    ? parseFloat(investment.targetRaise.replace(/[^0-9.-]+/g, '')) / parseFloat(investment.totalUnits)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Always use email from userProfile if available, fallback to formData
      const investorEmail = userProfile?.email || formData.email;
      
      if (!investorEmail) {
        alert('Error: Email address is required. Please contact support if this issue persists.');
        return;
      }
      
      // Save investment request to database
      const { data, error } = await supabase
        .from('investment_requests')
        .insert([
          {
            investor_name: formData.name,
            investor_email: investorEmail, // Always use email from userProfile
            investor_phone: formData.phone || null,
            company: formData.company || null,
            project_name: investment.name,
            units: formData.units ? parseInt(formData.units) : null,
            message: formData.message || null,
            preferred_contact: formData.preferredContact,
            time_to_liquidate: formData.timeToLiquidate,
            status: 'pending',
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error('Error submitting investment request:', error);
        // More detailed error message
        if (error.code === 'PGRST116' || error.message?.includes('404') || error.message?.includes('does not exist')) {
          alert('Error: The investment_requests table does not exist in the database. Please contact the administrator to set up the database table.');
        } else {
          alert(`Failed to submit investment request: ${error.message || 'Please try again.'}`);
        }
        return;
      }

      console.log('Investment request submitted successfully:', data);
      
      // Show success message (custom alert will be added later)
      alert('Your investment request has been submitted successfully! Admins will be notified and will contact you soon.');
      
      // Call onSuccess callback to refresh requests list
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      console.error('Error submitting investment request:', err);
      alert('Failed to submit investment request. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-gradient rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-6 w-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Investment Interest</h2>
              <p className="text-sm text-[var(--text-muted)]">{investment.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[var(--text-muted)]">Target Raise</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">{investment.targetRaise}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Minimum Investment</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">{investment.minimumInvestment}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Projected Return</p>
              <p className="text-lg font-semibold text-green-400">{investment.projectedReturn}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Closing Date</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                {new Date(investment.closingDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Company Name (Optional)
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-3.5 h-5 w-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your company name"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Select Units
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select units to invest</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? 'Unit' : 'Units'} - ${((i + 1) * (parseFloat(investment.targetRaise.replace(/[^0-9.-]+/g, '')) / 50)).toLocaleString()}
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-sm text-[var(--text-muted)]">
                  Price per unit: ${(parseFloat(investment.targetRaise.replace(/[^0-9.-]+/g, '')) / 50).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Time to Liquidate *
              </label>
              <p className="text-xs text-[var(--text-muted)] mb-2">
                When will you have the investment funds available?
              </p>
              <input
                type="date"
                required
                value={formData.timeToLiquidate}
                onChange={(e) => setFormData({ ...formData, timeToLiquidate: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasComments}
                  onChange={(e) => setFormData({ ...formData, hasComments: e.target.checked })}
                  className="rounded border-[var(--border-color)] bg-[var(--input-background)] text-blue-500 focus:ring-blue-500"
                />
                <span className="text-[var(--text-primary)]">I have comments or questions about this investment</span>
              </label>
            </div>

            {formData.hasComments && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Additional Comments
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required={formData.hasComments}
                placeholder="Any questions or comments about the investment?"
              />
            </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Preferred Contact Method
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="email"
                    checked={formData.preferredContact === 'email'}
                    onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-[var(--text-primary)]">Email</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="phone"
                    checked={formData.preferredContact === 'phone'}
                    onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-[var(--text-primary)]">Phone</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center"
            >
              Submit Interest
              <Send className="h-5 w-5 ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
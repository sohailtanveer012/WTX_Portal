import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building, MapPin, DollarSign, MessageSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { submitReferralForm, trackReferralClick, ReferralSubmissionFormData } from '../api/services';

interface ReferralFormProps {
  referralCode: string;
  onSuccess: () => void;
  onClose?: () => void;
}

export function ReferralForm({ referralCode, onSuccess, onClose }: ReferralFormProps) {
  const [formData, setFormData] = useState<ReferralSubmissionFormData>({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    investment_amount: undefined,
    investment_interest: '',
    preferred_contact_method: 'email',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(true);

  // Validate referral code on mount
  useEffect(() => {
    const validateCode = async () => {
      setIsValidatingCode(true);
      const result = await trackReferralClick(referralCode);
      if (result.success) {
        setIsValidatingCode(false);
      } else {
        setError('Invalid referral link. Please contact the person who shared this link.');
        setIsValidatingCode(false);
      }
    };

    validateCode();
  }, [referralCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.full_name || !formData.email) {
      setError('Please fill in all required fields (Name and Email)');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitReferralForm(referralCode, formData);

      if (result.success) {
        setSuccess(true);
        // Clear form
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          company: '',
          address: '',
          city: '',
          state: '',
          zip_code: '',
          country: '',
          investment_amount: undefined,
          investment_interest: '',
          preferred_contact_method: 'email',
          message: ''
        });

        // Call success callback after 2 seconds
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError(result.error || 'Failed to submit form. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error submitting referral form:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ReferralSubmissionFormData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  if (isValidatingCode) {
    return (
      <div className="min-h-screen bg-apple-gradient flex items-center justify-center p-4">
        <div className="bg-card-gradient rounded-2xl p-8 max-w-md w-full border border-blue-500/20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Validating referral link...</p>
        </div>
      </div>
    );
  }

  if (error && !referralCode) {
    return (
      <div className="min-h-screen bg-apple-gradient flex items-center justify-center p-4">
        <div className="bg-card-gradient rounded-2xl p-8 max-w-md w-full border border-red-500/20">
          <div className="flex items-center space-x-3 text-red-400 mb-4">
            <AlertCircle className="h-6 w-6" />
            <p>{error}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-apple-gradient flex items-center justify-center p-4">
        <div className="bg-card-gradient rounded-2xl p-8 max-w-md w-full border border-green-500/20 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-gray-400 mb-6">
            Your referral submission has been received. Our team will contact you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-gradient py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card-gradient rounded-2xl p-8 border border-blue-500/20">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Investment Referral Form</h1>
            <p className="text-gray-400">
              You've been referred to WTX Energy. Please fill out the form below to get started.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Company</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your company name"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Street address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Zip Code</label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => handleChange('zip_code', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Zip Code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Country"
                />
              </div>
            </div>

            {/* Investment Information Section */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Investment Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Investment Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.investment_amount || ''}
                    onChange={(e) => handleChange('investment_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter investment amount"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Investment Interest</label>
                <textarea
                  value={formData.investment_interest}
                  onChange={(e) => handleChange('investment_interest', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Tell us about your investment interests and goals"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Contact Method</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="email"
                      checked={formData.preferred_contact_method === 'email'}
                      onChange={(e) => handleChange('preferred_contact_method', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-white">Email</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="phone"
                      checked={formData.preferred_contact_method === 'phone'}
                      onChange={(e) => handleChange('preferred_contact_method', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-white">Phone</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="both"
                      checked={formData.preferred_contact_method === 'both'}
                      onChange={(e) => handleChange('preferred_contact_method', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-white">Both</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Additional Message</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    rows={4}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Any additional information you'd like to share..."
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Referral'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, CreditCard, Calendar, Briefcase, DollarSign, Percent, Loader2, CheckCircle2, Building2, Banknote } from 'lucide-react';
import { fetchProjectsWithInvestorCount, addInvestor } from '../../api/services';

interface AddInvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedProjectId?: string;
  preselectedProjectName?: string;
}

interface Project {
  id: string;
  project_name: string;
}

export function AddInvestorModal({ isOpen, onClose, onSuccess, preselectedProjectId, preselectedProjectName }: AddInvestorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    ssn: '',
    dob: '',
    companyName: '',
    // Banking Details
    bank: '',
    routingNo: '',
    accountNo: '',
    accountType: '',
    // Professional Details
    projectId: '',
    investmentAmount: '',
    ownershipPercentage: '',
  });

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens, pre-fill project if provided
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        ssn: '',
        dob: '',
        companyName: '',
        bank: '',
        routingNo: '',
        accountNo: '',
        accountType: '',
        projectId: preselectedProjectId || '',
        investmentAmount: '',
        ownershipPercentage: '',
      });
      setError('');
      setSuccess(false);
      // Only load projects if no preselected project
      if (!preselectedProjectId) {
        loadProjects();
      }
    }
  }, [isOpen, preselectedProjectId]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const data = await fetchProjectsWithInvestorCount();
      const mapped = (data || []).map((p: any) => ({
        id: String(p.id || p.project_id || p.ID || p.PROJECT_ID),
        project_name: p.project_name || p.name || p.NAME || p.PROJECT_NAME || 'Unknown Project',
      }));
      setProjects(mapped);
    } catch (e) {
      console.error('Failed to load projects:', e);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate email is provided (required)
      if (!formData.email || !formData.email.trim()) {
        throw new Error('Email is required to create an investor account');
      }

      // Call Edge Function to add investor
      const params = {
        full_name: formData.name || undefined,
        email: formData.email.trim(),
        phone: formData.phone || undefined,
        dob: formData.dob || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zip: formData.zip || undefined,
        company: formData.companyName || undefined,
        ssn: formData.ssn || undefined,
        bank: formData.bank || undefined,
        routing: formData.routingNo || undefined,
        account: formData.accountNo || undefined,
        account_type: formData.accountType || undefined,
        project_id: formData.projectId || undefined,
        invested_amount: formData.investmentAmount ? parseFloat(formData.investmentAmount) : undefined,
        percentage_owned: formData.ownershipPercentage ? parseFloat(formData.ownershipPercentage) : undefined,
      };

      await addInvestor(params);
      console.log('Investor added successfully');

      setSuccess(true);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: unknown) {
      console.error('Error adding investor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add investor. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-card-gradient rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Add New Investor</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-16 w-16 text-green-400 mb-4 animate-bounce-in" />
            <h3 className="text-xl font-semibold text-white mb-2">Investor Added Successfully!</h3>
            <p className="text-gray-400 mb-6 text-center">
              The investor has been added to the database and an invite link has been generated.
            </p>
            <p className="text-sm text-gray-500 text-center">
              Closing automatically...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Personal Details Section */}
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-400" />
                Personal Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleChange('dob', e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter street address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter city"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    State
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter state"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Zip Code
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => handleChange('zip', e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter zip code"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    SSN
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.ssn}
                      onChange={(e) => handleChange('ssn', e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="XXX-XX-XXXX"
                      maxLength={11}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Banking Details Section */}
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <Banknote className="h-5 w-5 mr-2 text-yellow-400" />
                Banking Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Bank Name
                  </label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.bank}
                      onChange={(e) => handleChange('bank', e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter bank name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Routing Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.routingNo}
                      onChange={(e) => handleChange('routingNo', e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter routing number"
                      maxLength={9}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Account Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.accountNo}
                      onChange={(e) => handleChange('accountNo', e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter account number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Account Type
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                      value={formData.accountType}
                      onChange={(e) => handleChange('accountType', e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="">Select account type</option>
                      <option value="checking" className="bg-gray-800">Checking</option>
                      <option value="savings" className="bg-gray-800">Savings</option>
                      <option value="business" className="bg-gray-800">Business</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Details Section */}
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-green-400" />
                Investment Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Project
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    {preselectedProjectId && preselectedProjectName ? (
                      <div className="pl-10 pr-4 py-2 w-full bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 font-medium">
                        {preselectedProjectName}
                      </div>
                    ) : loadingProjects ? (
                      <div className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-gray-400">
                        Loading projects...
                      </div>
                    ) : (
                      <select
                        value={formData.projectId}
                        onChange={(e) => handleChange('projectId', e.target.value)}
                        className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select a project</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id} className="bg-gray-800">
                            {project.project_name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Investment Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.investmentAmount}
                      onChange={(e) => handleChange('investmentAmount', e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter investment amount"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Ownership Percentage
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.ownershipPercentage}
                      onChange={(e) => handleChange('ownershipPercentage', e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter ownership %"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Adding Investor...</span>
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5" />
                    <span>Add Investor & Send Invite</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

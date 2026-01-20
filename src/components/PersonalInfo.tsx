import React, { useState } from 'react';
import { User, Calendar, MapPin, Building, CreditCard, Eye, EyeOff, Mail, Phone, Edit, Loader2, X, Check, XCircle } from 'lucide-react';
import { createProfileEditRequest } from '../api/services';

interface PersonalInfoProps {
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  address?: string;
  company?: string;
  ssn?: string;
}

export function PersonalInfo({ name, email, phone, dob, address, company, ssn }: PersonalInfoProps) {
  const [showSSN, setShowSSN] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: name || '',
    phone: phone || '',
    dob: dob || '',
    address: address || '',
    company: company || '',
    ssn: ssn || ''
  });

  // Helper function to submit edit request
  const handleSubmitEditRequest = async () => {
    if (!email || !name) {
      alert('Error: Email and name are required to submit an edit request.');
      return;
    }

    setIsSubmitting(true);
    try {
      const currentData = {
        name: name || '',
        email: email || '',
        phone: phone || '',
        dob: dob || '',
        address: address || '',
        company: company || '',
        ssn: ssn || ''
      };

      const newData = {
        name: formData.name,
        phone: formData.phone,
        dob: formData.dob,
        address: formData.address,
        company: formData.company,
        ssn: formData.ssn
      };

      const result = await createProfileEditRequest(
        email,
        name,
        'personal_info',
        currentData,
        newData
      );

      if (result.success) {
        alert('Edit request submitted successfully! Our team will review and update your information shortly.');
        setEditingField(null);
      } else {
        alert(`Failed to submit edit request: ${result.error || 'Please try again.'}`);
      }
    } catch (err) {
      console.error('Error submitting edit request:', err);
      alert('Failed to submit edit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date of birth
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not provided';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  // Mask SSN
  const maskSSN = (ssnValue?: string) => {
    if (!ssnValue) return 'Not provided';
    if (showSSN) return ssnValue;
    // Format as XXX-XX-XXXX and mask
    const cleaned = ssnValue.replace(/\D/g, '');
    if (cleaned.length === 9) {
      return `XXX-XX-${cleaned.slice(-4)}`;
    }
    return 'XXX-XX-XXXX';
  };

  return (
    <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
      <div className="flex items-center space-x-3 mb-6">
        <User className="h-6 w-6 text-purple-400" />
        <h2 className="text-xl font-semibold text-white">Personal Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {name && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <label className="text-sm font-medium text-gray-400">Full Name</label>
              </div>
              {editingField !== 'name' ? (
                <button
                  type="button"
                  onClick={() => setEditingField('name')}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                  title="Edit name"
                >
                  <Edit className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleSubmitEditRequest}
                    disabled={isSubmitting}
                    className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                    title="Submit"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingField(null);
                      setFormData({ ...formData, name: name || '' });
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Cancel"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {editingField === 'name' ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full ml-8 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your full name"
                autoFocus
              />
            ) : (
              <p className="text-white text-lg font-medium ml-8">
                {name}
              </p>
            )}
          </div>
        )}

        {email && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center space-x-3 mb-2">
              <Mail className="h-5 w-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-400">Email Address</label>
            </div>
            <p className="text-white text-lg font-medium ml-8">
              {email}
            </p>
          </div>
        )}

        {phone && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <label className="text-sm font-medium text-gray-400">Phone Number</label>
              </div>
              {editingField !== 'phone' ? (
                <button
                  type="button"
                  onClick={() => setEditingField('phone')}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                  title="Edit phone"
                >
                  <Edit className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleSubmitEditRequest}
                    disabled={isSubmitting}
                    className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                    title="Submit"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingField(null);
                      setFormData({ ...formData, phone: phone || '' });
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Cancel"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {editingField === 'phone' ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full ml-8 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your phone number"
                autoFocus
              />
            ) : (
              <p className="text-white text-lg font-medium ml-8">
                {phone}
              </p>
            )}
          </div>
        )}

        {dob && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <label className="text-sm font-medium text-gray-400">Date of Birth</label>
              </div>
              {editingField !== 'dob' ? (
                <button
                  type="button"
                  onClick={() => setEditingField('dob')}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                  title="Edit date of birth"
                >
                  <Edit className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleSubmitEditRequest}
                    disabled={isSubmitting}
                    className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                    title="Submit"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingField(null);
                      setFormData({ ...formData, dob: dob || '' });
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Cancel"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {editingField === 'dob' ? (
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full ml-8 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
            ) : (
              <p className="text-white text-lg font-medium ml-8">
                {formatDate(dob)}
              </p>
            )}
          </div>
        )}

        {address && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <label className="text-sm font-medium text-gray-400">Address</label>
              </div>
              {editingField !== 'address' ? (
                <button
                  type="button"
                  onClick={() => setEditingField('address')}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                  title="Edit address"
                >
                  <Edit className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleSubmitEditRequest}
                    disabled={isSubmitting}
                    className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                    title="Submit"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingField(null);
                      setFormData({ ...formData, address: address || '' });
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Cancel"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {editingField === 'address' ? (
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full ml-8 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your address"
                rows={3}
                autoFocus
              />
            ) : (
              <p className="text-white text-lg font-medium ml-8">
                {address}
              </p>
            )}
          </div>
        )}

        {/* {company && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <label className="text-sm font-medium text-gray-400">Company</label>
              </div>
              {editingField !== 'company' ? (
                <button
                  type="button"
                  onClick={() => setEditingField('company')}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                  title="Edit company"
                >
                  <Edit className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleSubmitEditRequest}
                    disabled={isSubmitting}
                    className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                    title="Submit"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingField(null);
                      setFormData({ ...formData, company: company || '' });
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Cancel"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {editingField === 'company' ? (
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full ml-8 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your company name"
                autoFocus
              />
            ) : (
              <p className="text-white text-lg font-medium ml-8">
                {company}
              </p>
            )}
          </div>
        )} */}

        {ssn && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <label className="text-sm font-medium text-gray-400">Social Security Number</label>
              </div>
              <div className="flex items-center space-x-2">
                {editingField !== 'ssn' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowSSN(!showSSN)}
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label={showSSN ? "Hide SSN" : "Show SSN"}
                    >
                      {showSSN ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingField('ssn')}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                      title="Edit SSN"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!email || !name) {
                          alert('Error: Email and name are required to submit an edit request.');
                          return;
                        }

                        setIsSubmitting(true);
                        try {
                          const currentData = {
                            name: name || '',
                            email: email || '',
                            phone: phone || '',
                            dob: dob || '',
                            address: address || '',
                            company: company || '',
                            ssn: ssn || ''
                          };

                          const newData = {
                            name: formData.name,
                            phone: formData.phone,
                            dob: formData.dob,
                            address: formData.address,
                            company: formData.company,
                            ssn: formData.ssn
                          };

                          const result = await createProfileEditRequest(
                            email,
                            name,
                            'personal_info',
                            currentData,
                            newData
                          );

                          if (result.success) {
                            alert('Edit request submitted successfully! Our team will review and update your information shortly.');
                            setEditingField(null);
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
                      disabled={isSubmitting}
                      className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                      title="Submit"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingField(null);
                        setFormData({ ...formData, ssn: ssn || '' });
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Cancel"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {editingField === 'ssn' ? (
              <input
                type="text"
                value={formData.ssn}
                onChange={(e) => setFormData({ ...formData, ssn: e.target.value })}
                className="w-full ml-8 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="XXX-XX-XXXX"
                autoFocus
              />
            ) : (
              <p className="text-white text-lg font-medium ml-8">
                {maskSSN(ssn)}
              </p>
            )}
          </div>
        )}
      </div>

      {(!name && !email && !phone && !dob && !address && !company && !ssn) && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mt-4">
          <p className="text-yellow-400 text-sm text-center">
            No personal information on file. Please contact support to update your personal details.
          </p>
        </div>
      )}

    </div>
  );
}


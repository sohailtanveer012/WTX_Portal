import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, CreditCard, Calendar, Building, MapPin, Loader2, Eye, EyeOff, Edit2, Save, X as XIcon } from 'lucide-react';
import { getNewUserProfileByInvestorId, NewUserProfile, updateInvestorPersonalInfo } from '../../api/services';

interface InvestorPersonalInfoModalProps {
  investorId: number;
  investorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InvestorPersonalInfoModal({ investorId, investorName, isOpen, onClose }: InvestorPersonalInfoModalProps) {
  const [personalInfo, setPersonalInfo] = useState<NewUserProfile | null>(null);
  const [editableInfo, setEditableInfo] = useState<NewUserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSSN, setShowSSN] = useState(false);
  const [showBankAccount, setShowBankAccount] = useState(false);

  useEffect(() => {
    if (isOpen && investorId) {
      fetchPersonalInfo();
    } else {
      setPersonalInfo(null);
      setEditableInfo(null);
      setIsEditing(false);
      setError(null);
      setSuccess(null);
      setShowSSN(false);
      setShowBankAccount(false);
    }
  }, [isOpen, investorId]);

  const fetchPersonalInfo = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const info = await getNewUserProfileByInvestorId(investorId);
      if (info) {
        setPersonalInfo(info);
        setEditableInfo({ ...info });
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

  const handleEdit = () => {
    setIsEditing(true);
    setShowSSN(true); // Show SSN when editing
    setShowBankAccount(true); // Show bank details when editing
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditableInfo(personalInfo ? { ...personalInfo } : null);
    setShowSSN(false);
    setShowBankAccount(false);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!editableInfo) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateInvestorPersonalInfo(editableInfo.email, editableInfo);
      
      if (result.success) {
        setSuccess('Personal information updated successfully!');
        setIsEditing(false);
        // Refresh the data
        await fetchPersonalInfo();
      } else {
        setError(result.error || 'Failed to update personal information.');
      }
    } catch (err) {
      console.error('Error updating personal info:', err);
      setError('Failed to update personal information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof NewUserProfile, value: string | null) => {
    if (!editableInfo) return;
    setEditableInfo({
      ...editableInfo,
      [field]: value
    });
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
          <div className="flex items-center space-x-2">
            {!isEditing && personalInfo && (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
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

        {/* Success State */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-center">
            {success}
          </div>
        )}

        {/* Personal Info */}
        {editableInfo && !loading && (
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
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableInfo.full_name || ''}
                      onChange={(e) => handleFieldChange('full_name', e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-white font-medium">{editableInfo.full_name || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </p>
                  <p className="text-white font-medium">{editableInfo.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    Alternate Email
                  </p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editableInfo.alt_email || ''}
                      onChange={(e) => handleFieldChange('alt_email', e.target.value || null)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Optional"
                    />
                  ) : (
                    <p className="text-white font-medium">{editableInfo.alt_email || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    Phone
                  </p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editableInfo.phone_number || ''}
                      onChange={(e) => handleFieldChange('phone_number', e.target.value || null)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Optional"
                    />
                  ) : (
                    <p className="text-white font-medium">{editableInfo.phone_number || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    Alternate Phone
                  </p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editableInfo.alt_phone_number || ''}
                      onChange={(e) => handleFieldChange('alt_phone_number', e.target.value || null)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Optional"
                    />
                  ) : (
                    <p className="text-white font-medium">{editableInfo.alt_phone_number || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Date of Birth
                  </p>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editableInfo.dob ? editableInfo.dob.split('T')[0] : ''}
                      onChange={(e) => handleFieldChange('dob', e.target.value || null)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-white font-medium">
                      {editableInfo.dob ? new Date(editableInfo.dob).toLocaleDateString() : 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">SSN/EIN</p>
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editableInfo.ssn || ''}
                        onChange={(e) => handleFieldChange('ssn', e.target.value || null)}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="Optional"
                      />
                    ) : (
                      <>
                        <p className="text-white font-medium">{maskSSN(editableInfo.ssn)}</p>
                        <button
                          onClick={() => setShowSSN(!showSSN)}
                          className="p-1 rounded hover:bg-white/10 transition-colors"
                          title={showSSN ? 'Hide SSN/EIN' : 'Show SSN/EIN'}
                        >
                          {showSSN ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </>
                    )}
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
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableInfo.address || ''}
                      onChange={(e) => handleFieldChange('address', e.target.value || null)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Optional"
                    />
                  ) : (
                    <p className="text-white font-medium">{editableInfo.address || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">City</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableInfo.city || ''}
                      onChange={(e) => handleFieldChange('city', e.target.value || null)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Optional"
                    />
                  ) : (
                    <p className="text-white font-medium">{editableInfo.city || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">State</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableInfo.state || ''}
                      onChange={(e) => handleFieldChange('state', e.target.value || null)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Optional"
                    />
                  ) : (
                    <p className="text-white font-medium">{editableInfo.state || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">ZIP Code</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableInfo.zip || ''}
                      onChange={(e) => handleFieldChange('zip', e.target.value || null)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Optional"
                    />
                  ) : (
                    <p className="text-white font-medium">{editableInfo.zip || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Banking Information */}
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Banking Information
                {!isEditing && (
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
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableInfo.bank || ''}
                      onChange={(e) => handleFieldChange('bank', e.target.value || null)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Optional"
                    />
                  ) : (
                    <p className="text-white font-medium">{editableInfo.bank || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Account Type</p>
                  {isEditing ? (
                    <select
                      value={editableInfo.account_type || ''}
                      onChange={(e) => handleFieldChange('account_type', e.target.value || null)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select type</option>
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                    </select>
                  ) : (
                    <p className="text-white font-medium">{editableInfo.account_type || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Routing Number</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableInfo.routing || ''}
                      onChange={(e) => handleFieldChange('routing', e.target.value || null)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Optional"
                    />
                  ) : (
                    <p className="text-white font-medium">{maskRouting(editableInfo.routing)}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Account Number</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableInfo.account || ''}
                      onChange={(e) => handleFieldChange('account', e.target.value || null)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Optional"
                    />
                  ) : (
                    <p className="text-white font-medium">{maskAccount(editableInfo.account)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XIcon className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { X, Mail, Phone, Building, Shield, Calendar, AlertCircle, DollarSign } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSubmit: (userData: any) => void;
}

export function EditProfileModal({ isOpen, onClose, user, onSubmit }: EditProfileModalProps) {
  const [userData, setUserData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    birthday: user.birthday || '',
    hireDate: user.hireDate || '',
    role: user.role,
    accountType: user.accountType || 'standard',
    department: user.department || '',
    position: user.position || '',
    investmentGoals: user.investmentGoals || '',
    riskTolerance: user.riskTolerance || 'moderate',
    account_name: user.account_name || '',
    contact_name: user.contact_name || '',
    account_id: user.account_id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(userData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-gradient rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <span className="text-lg font-semibold text-blue-400">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Birthday
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={userData.birthday}
                  onChange={(e) => setUserData({ ...userData, birthday: e.target.value })}
                  className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {(userData.role === 'staff' || userData.role === 'admin') && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Hire Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={userData.hireDate}
                    onChange={(e) => setUserData({ ...userData, hireDate: e.target.value })}
                    className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
              <p className="text-sm text-gray-400">Update user information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    inputMode="tel"
                    pattern="[0-9\-\(\)\s]+"
                    required
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Role
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <select
                    value={userData.role}
                    onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                    className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="investor">Investor</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={userData.account_name}
                  onChange={(e) => setUserData({ ...userData, account_name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={userData.contact_name}
                  onChange={(e) => setUserData({ ...userData, contact_name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Account ID
                </label>
                <input
                  type="text"
                  value={userData.account_id}
                  onChange={(e) => setUserData({ ...userData, account_id: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Role-specific Information */}
          {userData.role === 'investor' ? (
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Investment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Account Type
                  </label>
                  <select
                    value={userData.accountType}
                    onChange={(e) => setUserData({ ...userData, accountType: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="institutional">Institutional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Risk Tolerance
                  </label>
                  <select
                    value={userData.riskTolerance}
                    onChange={(e) => setUserData({ ...userData, riskTolerance: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Investment Goals
                  </label>
                  <textarea
                    value={userData.investmentGoals}
                    onChange={(e) => setUserData({ ...userData, investmentGoals: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Staff Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={userData.department}
                      onChange={(e) => setUserData({ ...userData, department: e.target.value })}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    value={userData.position}
                    onChange={(e) => setUserData({ ...userData, position: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Warning for Admin Role */}
          {userData.role === 'admin' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Modifying Admin User</p>
              </div>
              <p className="text-sm text-red-400 mt-1">
                Changes to admin permissions should be made with caution. Ensure there is at least one other admin user.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-xl transition-colors ${
                userData.role === 'admin'
                  ? 'bg-red-500 hover:bg-red-600'
                  : userData.role === 'staff'
                  ? 'bg-purple-500 hover:bg-purple-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
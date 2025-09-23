import React, { useState } from 'react';
import { Mail, User, Phone, DollarSign, X, Shield, Building, MapPin, Briefcase, Calendar, AlertCircle } from 'lucide-react';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => void;
}

export function NewUserModal({ isOpen, onClose, onSubmit }: NewUserModalProps) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'investor',
    accountType: 'standard',
    company: '',
    position: '',
    department: '',
    initialInvestment: '',
    investmentGoals: '',
    riskTolerance: 'moderate',
    startDate: '',
    birthday: '',
    account_name: '',
    contact_name: '',
    account_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(userData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-card-gradient rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">Add New User</h2>
              <p className="text-sm text-gray-400 mt-1">Create a new user account</p>
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
          {/* Role Selection */}
          <div className="bg-white/5 rounded-xl p-3">
            <label className="block text-sm font-medium text-gray-400 mb-3">
              User Role
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setUserData({ ...userData, role: 'investor' })}
                className={`p-3 rounded-xl border ${
                  userData.role === 'investor'
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    : 'border-white/10 text-gray-400 hover:bg-white/5'
                }`}
              >
                <DollarSign className="h-5 w-5 mx-auto mb-1" />
                <p className="font-medium">Investor</p>
              </button>
              <button
                type="button"
                onClick={() => setUserData({ ...userData, role: 'staff' })}
                className={`p-3 rounded-xl border ${
                  userData.role === 'staff'
                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                    : 'border-white/10 text-gray-400 hover:bg-white/5'
                }`}
              >
                <Briefcase className="h-5 w-5 mx-auto mb-1" />
                <p className="font-medium">Staff</p>
              </button>
              <button
                type="button"
                onClick={() => setUserData({ ...userData, role: 'admin' })}
                className={`p-3 rounded-xl border ${
                  userData.role === 'admin'
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'border-white/10 text-gray-400 hover:bg-white/5'
                }`}
              >
                <Shield className="h-5 w-5 mx-auto mb-1" />
                <p className="font-medium">Admin</p>
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-medium text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Contact Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={userData.contact_name}
                    onChange={(e) => setUserData({ ...userData, contact_name: e.target.value })}
                    className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter contact person's name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Account Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={userData.account_name}
                    onChange={(e) => setUserData({ ...userData, account_name: e.target.value })}
                    className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter account (business) name"
                  />
                </div>
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
                    required
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    className="pl-4 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                  />
                </div>
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
                    placeholder="Birthday"
                  />
                </div>
              </div>
              {/* Only show these fields for investors */}
              {userData.role === 'investor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Company
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={userData.company}
                        onChange={(e) => setUserData({ ...userData, company: e.target.value })}
                        className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Company"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Investment Goals
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={userData.investmentGoals}
                        onChange={(e) => setUserData({ ...userData, investmentGoals: e.target.value })}
                        className="pl-4 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Investment goals"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Risk Tolerance
                    </label>
                    <select
                      value={userData.riskTolerance}
                      onChange={(e) => setUserData({ ...userData, riskTolerance: e.target.value })}
                      className="pl-4 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Account ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userData.account_id}
                    onChange={(e) => setUserData({ ...userData, account_id: e.target.value })}
                    className="pl-4 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter unique account ID (from admin)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Investor Specific Information */}
          {userData.role === 'investor' && (
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="text-lg font-medium text-white mb-4">Investment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Account Type
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                      value={userData.accountType}
                      onChange={(e) => setUserData({ ...userData, accountType: e.target.value })}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                      <option value="institutional">Institutional</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Initial Investment
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      required
                      value={userData.initialInvestment}
                      onChange={(e) => setUserData({ ...userData, initialInvestment: e.target.value })}
                      className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter initial investment amount"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Risk Tolerance
                  </label>
                  <select
                    value={userData.riskTolerance}
                    onChange={(e) => setUserData({ ...userData, riskTolerance: e.target.value })}
                    className="px-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Investment Goals
                  </label>
                  <input
                    type="text"
                    value={userData.investmentGoals}
                    onChange={(e) => setUserData({ ...userData, investmentGoals: e.target.value })}
                    className="px-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter investment goals"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Warning for Admin Creation */}
          {userData.role === 'admin' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Creating Admin User</p>
              </div>
              <p className="text-sm text-red-400 mt-1">
                Admin users have full access to all system features and settings. Please ensure this level of access is necessary.
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
              Create {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
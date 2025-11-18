import React, { useState } from 'react';
import { UserPlus, User, Key, Shield, Cog, ChevronRight } from 'lucide-react';
import { AddInvestorModal } from './AddInvestorModal';
import { AddStaffModal } from './AddStaffModal';
import { ChangePasswordModal } from '../ChangePasswordModal';

interface UserProfile {
  id?: string | number;
  full_name?: string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

export function AdminSettings({ userProfile }: { userProfile?: UserProfile }) {
  const [showAddInvestorModal, setShowAddInvestorModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleAddStaff = () => {
    setShowAddStaffModal(true);
  };

  const handleAddInvestor = () => {
    setShowAddInvestorModal(true);
  };

  const handleInvestorAdded = () => {
    // Refresh or update UI if needed
    console.log('Investor added successfully');
  };

  const handleStaffAdded = () => {
    // Refresh or update UI if needed
    console.log('Staff/Admin added successfully');
  };

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Cog className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Settings</h1>
              <p className="text-[var(--text-muted)] mt-1">Manage system settings and your profile</p>
            </div>
          </div>
        </div>

        {/* My Profile Section */}
        <div className="bg-card-gradient rounded-2xl p-6 mb-8 hover-neon-glow">
          <div className="flex items-center space-x-3 mb-6">
            <User className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">My Profile</h2>
          </div>

          <div className="space-y-4">
            {/* Profile Info */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                  <p className="text-white font-medium">
                    {userProfile?.full_name || userProfile?.contact_name || userProfile?.account_name || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <p className="text-white font-medium">
                    {userProfile?.email || 'Not provided'}
                  </p>
                </div>
                {userProfile?.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                    <p className="text-white font-medium">
                      {userProfile.phone}
                    </p>
                  </div>
                )}
                {userProfile?.role && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                    <p className="text-white font-medium capitalize">
                      {userProfile.role}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Change Password */}
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="w-full p-4 rounded-xl bg-white/5 flex items-center justify-between hover:bg-white/10 transition-colors border border-white/10"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Change Password</h3>
                  <p className="text-sm text-gray-400">Update your account password</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* System Management Section */}
        <div className="bg-card-gradient rounded-2xl p-6 mb-8 hover-neon-glow">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">System Management</h2>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleAddStaff}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2 font-medium"
            >
              <UserPlus className="h-5 w-5" />
              <span>Add staff / Admin</span>
            </button>
            <button
              onClick={handleAddInvestor}
              className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center space-x-2 font-medium"
            >
              <User className="h-5 w-5" />
              <span>Add Investor</span>
            </button>
          </div>
        </div>
      </div>

      <AddInvestorModal
        isOpen={showAddInvestorModal}
        onClose={() => setShowAddInvestorModal(false)}
        onSuccess={handleInvestorAdded}
      />

      <AddStaffModal
        isOpen={showAddStaffModal}
        onClose={() => setShowAddStaffModal(false)}
        onSuccess={handleStaffAdded}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </main>
  );
}
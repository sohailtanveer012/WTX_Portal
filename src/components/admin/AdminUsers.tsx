import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, MoreVertical, Mail, Phone, DollarSign, Calendar, Building, Users as UsersIcon, Plus, Upload } from 'lucide-react';
import { UserProfile } from './UserProfile';
import { NewUserModal } from './NewUserModal';
import { BulkImportModal } from './BulkImportModal';
import { supabase } from '../../supabaseClient';

export function AdminUsers({ initialSelectedUser = null }: { initialSelectedUser?: any }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUserData, setSelectedUserData] = useState<any>(initialSelectedUser);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [viewMode, setViewMode] = useState<'investors' | 'staff'>('investors');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: '', direction: 'asc' });

  useEffect(() => {
    fetchUsers();
  }, [viewMode]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', viewMode === 'investors' ? ['investor'] : ['admin', 'staff']);
      
      if (error) throw error;
      
      // Transform the data to match the expected format
      const transformedUsers = data.map(user => ({
        id: user.id,
        name: user.contact_name || user.account_name || user.full_name,
        email: user.email,
        phone: user.phone || 'Not set',
        status: user.status || 'Active',
        joinDate: user.created_at,
        totalInvested: user.total_invested ? `$${user.total_invested.toLocaleString()}` : '$0',
        activeProjects: user.active_projects || 0,
        lastLogin: user.last_sign_in_at || user.created_at,
        role: user.role,
        account_name: user.account_name || '',
        contact_name: user.contact_name || '',
        account_id: user.account_id || '',
      }));
      
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (userData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'create_user',
          data: {
            email: userData.email,
            password: userData.password,
            role: userData.role,
            account_name: userData.account_name,
            contact_name: userData.contact_name,
            account_id: userData.account_id,
            phone: userData.phone,
            company: userData.company,
            investment_goals: userData.investmentGoals,
            risk_tolerance: userData.riskTolerance,
          }
        }
      });

      if (error) throw error;
      
      // Refresh the users list
      fetchUsers();
      setShowNewUserModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const { error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'delete_user',
          data: { id: userId }
        }
      });

      if (error) throw error;
      
      // Refresh the users list
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      // You might want to show an error message to the user here
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || user.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a: any, b: any) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  if (selectedUserData) {
    return <UserProfile user={selectedUserData} onBack={() => setSelectedUserData(null)} />;
  }

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              {viewMode === 'investors' ? (
                <DollarSign className="h-6 w-6 text-blue-400" />
              ) : (
                <UsersIcon className="h-6 w-6 text-blue-400" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {viewMode === 'investors' ? 'Investor Management' : 'Staff Management'}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-400">
              {filteredUsers.length} users found
            </span>
            <div className="flex rounded-xl overflow-hidden border border-[var(--border-color)]">
              <button
                onClick={() => setViewMode('investors')}
                className={`px-4 py-2 text-sm ${
                  viewMode === 'investors'
                    ? 'bg-blue-500 text-white'
                    : 'bg-card-gradient text-gray-400 hover:text-gray-300'
                }`}
              >
                Investors
              </button>
              <button
                onClick={() => setViewMode('staff')}
                className={`px-4 py-2 text-sm ${
                  viewMode === 'staff'
                    ? 'bg-blue-500 text-white'
                    : 'bg-card-gradient text-gray-400 hover:text-gray-300'
                }`}
              >
                Staff & Admin
              </button>
            </div>
            <button
              onClick={() => setShowBulkImportModal(true)}
              className="hidden sm:flex px-4 py-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 hover:bg-purple-500/20 transition-colors items-center"
            >
              <Upload className="h-5 w-5 mr-2" />
              Bulk Import
            </button>
            <button
              onClick={() => setShowNewUserModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full bg-card-gradient text-[var(--text-primary)] rounded-xl border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 w-full bg-card-gradient text-[var(--text-primary)] rounded-xl border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            {viewMode === 'staff' && (
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 w-full bg-card-gradient text-[var(--text-primary)] rounded-xl border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Staff</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card-gradient rounded-2xl overflow-hidden hover-neon-glow">
          <div className="overflow-x-auto min-w-full">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center space-x-1 hover:text-gray-300"
                    >
                      <span>{viewMode === 'investors' ? 'Investor' : 'Staff Member'}</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  {viewMode === 'investors' && (
                    <>
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">Account Name</th>
                    </>
                  )}
                  {viewMode === 'investors' ? (
                    <>
                      <th className="hidden sm:table-cell px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">
                        <button
                          onClick={() => handleSort('totalInvested')}
                          className="flex items-center space-x-1 hover:text-gray-300"
                        >
                          <span>Investments</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="hidden md:table-cell px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">
                        <button
                          onClick={() => handleSort('activeProjects')}
                          className="flex items-center space-x-1 hover:text-gray-300"
                        >
                          <span>Active Projects</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="hidden sm:table-cell px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">
                        <button
                          onClick={() => handleSort('role')}
                          className="flex items-center space-x-1 hover:text-gray-300"
                        >
                          <span>Role</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </th>
                      <th className="hidden md:table-cell px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                    </>
                  )}
                  <th className="hidden lg:table-cell px-4 sm:px-6 py-4 text-left text-sm font-medium text-gray-400">
                    <button
                      onClick={() => handleSort('lastLogin')}
                      className="flex items-center space-x-1 hover:text-gray-300"
                    >
                      <span>Last Login</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-right text-sm font-medium text-gray-400"></th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => {
                      setSelectedUserData(user);
                    }}
                    className="border-b border-white/10 hover:bg-white/5 cursor-pointer"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <span className="text-lg font-semibold text-blue-400">
                            {user.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    {viewMode === 'investors' && (
                      <>
                        <td className="px-4 sm:px-6 py-4 text-white">{user.account_name}</td>
                      </>
                    )}
                    {viewMode === 'investors' ? (
                      <>
                        <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-white">
                              <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                              {user.totalInvested}
                            </div>
                            <div className="text-sm text-gray-400">
                              Total Investment
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-white">
                              {user.activeProjects}
                            </div>
                            <div className="text-sm text-gray-400">
                              Projects
                            </div>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'Active'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : user.status === 'Pending'
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="hidden lg:table-cell px-4 sm:px-6 py-4 text-sm text-gray-300">
                      {new Date(user.lastLogin).toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex justify-end space-x-3">
                        <button className="p-1 text-gray-400 hover:text-gray-300 transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* New User Modal */}
      <NewUserModal
        isOpen={showNewUserModal}
        onClose={() => setShowNewUserModal(false)}
        onSubmit={handleAddUser}
      />
      
      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
      />
    </main>
  );
}
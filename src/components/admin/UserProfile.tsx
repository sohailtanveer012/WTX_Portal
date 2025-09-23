import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, Building, Clock, Shield, ChevronRight, Download, FileText, Trash2, AlertCircle, Key, Lock, Settings, Activity, DollarSign, TrendingUp, Users, Wallet, PieChart, BarChart3, Target, ArrowUpRight, Droplets, User } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { EditProfileModal } from './EditProfileModal';
import { supabase } from '../../supabaseClient';

interface UserProfileProps {
  user: any;
  onBack: () => void;
}

export function UserProfile({ user, onBack }: UserProfileProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('6m');
  const [selectedMetric, setSelectedMetric] = useState('value'); 
  
  // Format dates for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const investmentHistory = [
    { month: 'Jan', amount: 250000 },
    { month: 'Feb', amount: 280000 },
    { month: 'Mar', amount: 310000 },
    { month: 'Apr', amount: 320000 },
    { month: 'May', amount: 350000 },
    { month: 'Jun', amount: 380000 },
  ];

  const activeInvestments = [
    {
      project: 'Eagle Ford Shale Development',
      amount: '$150,000',
      return: '+22.5%',
      status: 'Active',
      location: 'Texas',
      startDate: '2024-01-15',
    },
    {
      project: 'Permian Basin Expansion',
      amount: '$120,000',
      return: '+18.3%',
      status: 'Active',
      location: 'Texas',
      startDate: '2024-02-01',
    },
    {
      project: 'Bakken Formation Wells',
      amount: '$110,000',
      return: '+19.7%',
      status: 'Active',
      location: 'North Dakota',
      startDate: '2024-01-20',
    },
  ];

  const portfolioDistribution = [
    { name: 'Oil Wells', value: 45, color: '#3B82F6' },
    { name: 'Gas Projects', value: 30, color: '#10B981' },
    { name: 'Infrastructure', value: 25, color: '#6366F1' },
  ];

  const monthlyReturns = [
    { month: 'Jan', returns: 22500 },
    { month: 'Feb', returns: 24800 },
    { month: 'Mar', returns: 27500 },
    { month: 'Apr', returns: 28900 },
    { month: 'May', returns: 31200 },
    { month: 'Jun', returns: 33500 },
  ];

  const performanceMetrics = [
    {
      label: 'Total Value',
      value: '$432,500',
      change: '+24.6%',
      trend: 'up',
      icon: Wallet,
      color: 'blue',
    },
    {
      label: 'Monthly Returns',
      value: '$33,500',
      change: '+18.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'green',
    },
    {
      label: 'Active Projects',
      value: '8',
      change: '+2',
      trend: 'up',
      icon: Target,
      color: 'purple',
    },
    {
      label: 'Production',
      value: '12,450 BBL',
      change: '+15.2%',
      trend: 'up',
      icon: Droplets,
      color: 'yellow',
    },
  ];

  const handleDeleteConfirm = () => {
    // In a real application, this would make an API call to delete the user
    console.log('Deleting user:', user.id);
    onBack();
  };

  const handleEditSubmit = async (updatedData: any) => {
    try {
      // Convert empty string date fields to null
      const safeDate = (val: any) => val === '' ? null : val;
      
      const { error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'update_user',
          data: {
            id: user.id,
            updates: {
              email: updatedData.email,
              account_name: updatedData.account_name,
              phone: updatedData.phone,
              role: updatedData.role,
              birthday: safeDate(updatedData.birthday),
              join_date: safeDate(updatedData.join_date),
              last_login: safeDate(updatedData.last_login),
              hire_date: safeDate(updatedData.hireDate),
              company: updatedData.company,
              investment_goals: updatedData.investmentGoals,
              risk_tolerance: updatedData.riskTolerance,
              created_at: safeDate(updatedData.created_at),
              account_id: updatedData.account_id,
              contact_name: updatedData.contact_name,
            }
          }
        }
      });

      if (error) {
        alert('Failed to update user: ' + error.message);
        return;
      }

      setShowEditModal(false);
      // Optionally, refresh the page or user data here
      window.location.reload();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <span className="text-xl font-semibold text-blue-400">
                  {user.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-gray-400">{user.role.charAt(0).toUpperCase() + user.role.slice(1)} Profile</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={() => {
                // Placeholder: Replace with navigation logic to documents page
                window.location.href = `/admin/users/${user.id}/documents`;
              }}
              className="px-4 py-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
            >
              <FileText className="h-5 w-5 mr-2 inline" /> Docs
            </button>
          </div>
        </div>

        {user.role === 'investor' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Information */}
          <div className="bg-card-gradient rounded-2xl p-4 sm:p-6 hover-neon-glow md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {performanceMetrics.map((metric, index) => (
                <div
                  key={index}
                  className={`bg-${metric.color}-500/10 rounded-xl p-4 border border-${metric.color}-500/20`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className={`h-6 w-6 text-${metric.color}-400`} />
                    <span className="flex items-center text-sm font-medium text-green-400">
                      {metric.change}
                      <ArrowUpRight className="h-4 w-4 ml-1" />
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{metric.label}</p>
                  <p className="text-xl font-semibold text-white mt-1">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-6">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Account Type</p>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Premium Investor
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="text-white">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Member Since</p>
                  <p className="text-white">{new Date(user.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Birthday</p>
                  <p className="text-white">{user.birthday ? formatDate(user.birthday) : 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Last Login</p>
                  <p className="text-white">{new Date(user.lastLogin).toLocaleString()}</p>
                </div>
              </div>
              {user.role === 'staff' || user.role === 'admin' ? (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Hire Date</p>
                    <p className="text-white">{user.hireDate ? formatDate(user.hireDate) : 'Not set'}</p>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Account Name</p>
                  <p className="text-white">{user.account_name || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Contact Name</p>
                  <p className="text-white">{user.contact_name || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Key className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Account ID</p>
                  <p className="text-white">{user.account_id || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Distribution */}
          <div className="bg-card-gradient rounded-2xl p-4 sm:p-6 hover-neon-glow md:col-span-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Portfolio Distribution</h3>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-gray-400"
              >
                <option value="value">By Value</option>
                <option value="projects">By Projects</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={portfolioDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {portfolioDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-background)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Returns */}
          <div className="bg-card-gradient rounded-2xl p-4 sm:p-6 hover-neon-glow md:col-span-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Monthly Returns</h3>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-gray-400"
              >
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyReturns}>
                  <XAxis dataKey="month" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-background)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Bar dataKey="returns" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Investment Growth */}
          <div className="bg-card-gradient rounded-2xl p-4 sm:p-6 hover-neon-glow md:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Investment Growth</h3>
              <div className="hidden sm:flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400/20 rounded-full"></div>
                  <span className="text-sm text-gray-400">Portfolio Value</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400/20 rounded-full"></div>
                  <span className="text-sm text-gray-400">Returns</span>
                </div>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={investmentHistory}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-background)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                    stackId="1"
                  />
                  <Area
                    type="monotone"
                    dataKey="returns"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorReturns)"
                    stackId="2"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Investments */}
          <div className="md:col-span-2 w-full">
            <div className="bg-card-gradient rounded-2xl p-4 sm:p-6 hover-neon-glow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Active Investments</h3>
                <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              <div className="space-y-4">
                {activeInvestments.map((investment, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <div>
                        <h4 className="font-medium text-white">{investment.project}</h4>
                        <div className="flex flex-wrap items-center gap-4 mt-1">
                          <span className="text-sm text-gray-400">
                            <Building className="inline-block h-4 w-4 mr-1" />
                            {investment.location}
                          </span>
                          <span className="text-sm text-gray-400">
                            <Calendar className="inline-block h-4 w-4 mr-1" />
                            {new Date(investment.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          investment.status === 'Active'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {investment.status}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-400">Investment Amount</p>
                        <p className="text-lg font-semibold text-white">{investment.amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Current Return</p>
                        <p className="text-lg font-semibold text-green-400">{investment.return}</p>
                      </div>
                      <div className="text-right">
                        <button className="w-full sm:w-auto px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Information */}
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <h3 className="text-lg font-semibold text-white mb-6">User Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Role</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                    user.role === 'admin'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="text-white">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Member Since</p>
                  <p className="text-white">{new Date(user.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Birthday</p>
                  <p className="text-white">{user.birthday ? formatDate(user.birthday) : 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Last Login</p>
                  <p className="text-white">{new Date(user.lastLogin).toLocaleString()}</p>
                </div>
              </div>
              {user.role === 'staff' || user.role === 'admin' ? (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Hire Date</p>
                    <p className="text-white">{user.hireDate ? formatDate(user.hireDate) : 'Not set'}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Access & Permissions */}
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <h3 className="text-lg font-semibold text-white mb-6">Access & Permissions</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-blue-400" />
                    <h4 className="font-medium text-white">Access Level</h4>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}>
                    {user.role === 'admin' ? 'Full Access' : 'Limited Access'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {user.role === 'admin'
                    ? 'Can manage all aspects of the system including users, projects, and settings'
                    : 'Can view and manage assigned tasks and projects'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5">
                <div className="flex items-center space-x-3 mb-4">
                  <Lock className="h-5 w-5 text-purple-400" />
                  <h4 className="font-medium text-white">Permissions</h4>
                </div>
                <div className="space-y-3">
                  {user.role === 'admin' ? (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">User Management</span>
                        <span className="text-green-400">Full Access</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Project Management</span>
                        <span className="text-green-400">Full Access</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Financial Operations</span>
                        <span className="text-green-400">Full Access</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">System Settings</span>
                        <span className="text-green-400">Full Access</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">User Management</span>
                        <span className="text-yellow-400">View Only</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Project Management</span>
                        <span className="text-green-400">Limited Access</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Financial Operations</span>
                        <span className="text-red-400">No Access</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">System Settings</span>
                        <span className="text-red-400">No Access</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5">
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="h-5 w-5 text-yellow-400" />
                  <h4 className="font-medium text-white">Recent Actions</h4>
                </div>
                <div className="space-y-3">
                  <div
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-400">Last Password Change</span>
                    <span className="text-white">30 days ago</span>
                  </div>
                  <div
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-400">Failed Login Attempts</span>
                    <span className="text-white">None</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card-gradient rounded-2xl p-6 max-w-lg w-full">
            <div className="flex items-center space-x-3 text-yellow-400 mb-4">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-semibold text-white">Confirm Delete</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this user? This action cannot be undone and will remove all associated data.
            </p>
            {user.role === 'admin' && (
              <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 font-medium">Warning: Deleting an admin user</p>
                <p className="text-sm text-red-400 mt-1">Make sure there is at least one other admin user before proceeding.</p>
              
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </main>
  );
}
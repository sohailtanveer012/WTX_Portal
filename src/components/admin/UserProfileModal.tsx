import React from 'react';
import { X, Mail, Phone, DollarSign, Calendar, Building, MapPin, Clock, Shield, ChevronRight, User, Key } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
  if (!isOpen || !user) return null;

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
    },
    {
      project: 'Permian Basin Expansion',
      amount: '$120,000',
      return: '+18.3%',
      status: 'Active',
    },
    {
      project: 'Bakken Formation Wells',
      amount: '$110,000',
      return: '+19.7%',
      status: 'Active',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-gradient rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card-gradient border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <span className="text-xl font-semibold text-blue-400">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{user.name}</h2>
              <p className="text-sm text-gray-400">Investor Profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <DollarSign className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Invested</p>
                  <p className="text-lg font-semibold text-white">{user.totalInvested}</p>
                </div>
              </div>
              <div className="h-1 bg-white/5 rounded-full">
                <div className="h-1 bg-blue-500 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <Building className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Active Projects</p>
                  <p className="text-lg font-semibold text-white">{activeInvestments.length}</p>
                </div>
              </div>
              <div className="h-1 bg-white/5 rounded-full">
                <div className="h-1 bg-green-500 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Calendar className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Member Since</p>
                  <p className="text-lg font-semibold text-white">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="h-1 bg-white/5 rounded-full">
                <div className="h-1 bg-purple-500 rounded-full" style={{ width: '90%' }} />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
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

          {/* Investment History */}
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Investment History</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={investmentHistory}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
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
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Investments */}
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Active Investments</h3>
            <div className="space-y-4">
              {activeInvestments.map((investment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div>
                    <h4 className="font-medium text-white">{investment.project}</h4>
                    <p className="text-sm text-gray-400 mt-1">Invested: {investment.amount}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-green-400 font-medium">{investment.return}</span>
                    <span className="block text-sm text-gray-400 mt-1">{investment.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
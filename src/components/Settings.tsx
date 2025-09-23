import React, { useState } from 'react';
import { User, Bell, Shield, Moon, Mail, Phone, Globe, Key, Languages, CreditCard, Download, HelpCircle, ChevronRight, ToggleLeft as Toggle, Cog } from 'lucide-react';

export function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    monthlyStatement: true,
    taxDocuments: true,
    projectUpdates: true,
    marketingEmails: false,
  });

  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');

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
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">System Settings</h1>
              <p className="text-[var(--text-muted)] mt-1">Manage your account preferences and security</p>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-card-gradient rounded-2xl p-6 mb-8 hover-neon-glow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
            </div>
            <button className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
              Save Changes
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="Daniel Leal"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input
                type="email"
                defaultValue="daniel.leal@example.com"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Time Zone</label>
              <select
                defaultValue="America/New_York"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-card-gradient rounded-2xl p-6 mb-8 hover-neon-glow">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <h3 className="text-white font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {`Receive ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications`}
                  </p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-blue-400' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-card-gradient rounded-2xl p-6 mb-8 hover-neon-glow">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Security</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Change Password</h3>
                  <p className="text-sm text-gray-400">Last changed 3 months ago</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>

            <div className="p-4 rounded-xl bg-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-400">Enhance your account security</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500/20">
                Enable
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-card-gradient rounded-2xl p-6 mb-8 hover-neon-glow">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Preferences</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Support & Help */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <div className="flex items-center space-x-3 mb-6">
            <HelpCircle className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Support & Help</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-400" />
              <span className="text-white">Contact Support</span>
            </button>
            <button className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center space-x-3">
              <Download className="h-5 w-5 text-green-400" />
              <span className="text-white">Download User Guide</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
import React, { useState } from 'react';
import { Shield, Bell, Globe, Mail, Key, Users, Database, Cog, AlertCircle, Server, Lock } from 'lucide-react';

export function AdminSettings() {
  const [emailNotifications, setEmailNotifications] = useState({
    userRegistrations: true,
    projectUpdates: true,
    systemAlerts: true,
    securityAlerts: true,
    reportGeneration: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: true,
    twoFactorAuth: false,
  });

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">System Settings</h1>

        {/* System Configuration */}
        <div className="bg-card-gradient rounded-2xl p-6 mb-8 hover-neon-glow">
          <div className="flex items-center space-x-3 mb-6">
            <Server className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">System Configuration</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(systemSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <h3 className="text-white font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {`Configure system ${key.toLowerCase().replace(/([A-Z])/g, ' $1').trim()}`}
                  </p>
                </div>
                <button
                  onClick={() => setSystemSettings(prev => ({ ...prev, [key]: !prev[key] }))}
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
            <h2 className="text-xl font-semibold text-white">Security Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Password Policy</h3>
                    <p className="text-sm text-gray-400">Configure password requirements</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm text-gray-300">Require minimum 8 characters</span>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm text-gray-300">Require special characters</span>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm text-gray-300">Require numbers</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Session Management</h3>
                    <p className="text-sm text-gray-400">Configure session settings</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    defaultValue={30}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Max Login Attempts</label>
                  <input
                    type="number"
                    defaultValue={5}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-card-gradient rounded-2xl p-6 mb-8 hover-neon-glow">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(emailNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <h3 className="text-white font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {`Receive notifications for ${key.toLowerCase().replace(/([A-Z])/g, ' $1').trim()}`}
                  </p>
                </div>
                <button
                  onClick={() => setEmailNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
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

        {/* API Configuration */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">API Configuration</h2>
          </div>
          
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-white/5">
              <h3 className="text-white font-medium mb-4">API Keys</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Production API Key</label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value="••••••••••••••••"
                      readOnly
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500/20">
                      Regenerate
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Development API Key</label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value="••••••••••••••••"
                      readOnly
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500/20">
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5">
              <h3 className="text-white font-medium mb-4">Webhook Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Webhook URL</label>
                  <input
                    type="url"
                    placeholder="https://"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Secret Key</label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value="••••••••••••••••"
                      readOnly
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500/20">
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
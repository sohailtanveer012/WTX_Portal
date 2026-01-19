import React from 'react';
import { Home, PieChart, FileText, Settings, Users, FolderOpen, LogOut, User, DollarSign, Book, MessageSquare, Bell, UserPlus, ArrowRightLeft, Newspaper, Briefcase } from 'lucide-react';
import WTXLogo from '../assets/WTX-Logo.png';
import { supabase } from '../supabaseClient';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  setIsAuthenticated: (value: boolean) => void;
  userProfile?: any;
  unviewedNotificationsCount?: number;
}

export function Sidebar({ activeTab, setActiveTab, isAdmin, setIsAuthenticated, userProfile, unviewedNotificationsCount = 0 }: SidebarProps) {
  const userNavItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'My Projects', icon: FolderOpen },
    { name: 'New Investments', icon: DollarSign },
    { name: 'Affiliates', icon: Users },
    { name: 'Reports', icon: FileText },
    { name: 'Knowledge Base', icon: Book },
    { name: 'Settings', icon: Settings },
  ];

  const adminNavItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Projects', icon: FolderOpen },
    { name: 'Users', icon: Users },
    { name: 'Notifications', icon: Bell },
    { name: 'Forum', icon: MessageSquare },
    { name: 'Reports', icon: FileText },
    { name: 'Settings', icon: Settings },
  ];

  let navItems;
  if (isAdmin || userProfile?.role === 'admin') {
    navItems = [
      { name: 'Dashboard', icon: Home },
      { name: 'Projects', icon: FolderOpen },
      { name: 'Users', icon: Users },
      { name: 'Notifications', icon: Bell },
      { name: 'New Referrals', icon: UserPlus },
      { name: 'Investment Opportunities', icon: Briefcase },
      { name: 'Bulletin Board', icon: Newspaper },
      { name: 'Forum', icon: MessageSquare },
      { name: 'Reports', icon: FileText },
      { name: 'Settings', icon: Settings },
    ];
  } else if (userProfile?.role === 'staff') {
    navItems = [
      { name: 'Dashboard', icon: Home },
      { name: 'My Projects', icon: FolderOpen },
      { name: 'Forum', icon: MessageSquare },
      { name: 'New Investments', icon: DollarSign },
      { name: 'Percentage Distribution', icon: ArrowRightLeft },
      { name: 'Affiliates', icon: Users },
      { name: 'Reports', icon: FileText },
      { name: 'Knowledge Base', icon: Book },
      { name: 'Settings', icon: Settings },
    ];
  } else {
    navItems = [
      { name: 'Dashboard', icon: Home },
      { name: 'My Projects', icon: FolderOpen },
      { name: 'New Investments', icon: DollarSign },
      { name: 'Percentage Distribution', icon: ArrowRightLeft },
      { name: 'Bulletin Board', icon: Newspaper },
      { name: 'Affiliates', icon: Users },
      { name: 'Reports', icon: FileText },
      { name: 'Knowledge Base', icon: Book },
      { name: 'Settings', icon: Settings },
    ];
  }

  const handleLogout = async () => {
    localStorage.removeItem('hasSeenOnboarding');
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  return (
    <div className="hidden md:flex md:flex-col md:w-72 bg-card-gradient border-r border-[var(--border-color)]">
      <div className="flex items-center h-16 px-6 border-b border-[var(--border-color)]">
        <img src={WTXLogo} alt="WTX Logo" className="h-8 w-auto" />
        <span className="ml-2 text-xl font-semibold text-gradient">
          {isAdmin ? 'Admin Portal' : 'Investor Portal'}
        </span>
      </div>
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isNotifications = item.name.toLowerCase() === 'notifications';
            const hasUnviewed = isNotifications && unviewedNotificationsCount > 0;
            const displayName = hasUnviewed ? 'New Notifications' : item.name;
            
            return (
              <button
                key={item.name.toLowerCase()}
                onClick={() => setActiveTab(item.name.toLowerCase())}
                className={`w-full flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                  activeTab === item.name.toLowerCase()
                    ? 'bg-[var(--card-background-hover)] text-[var(--text-primary)] neon-glow'
                    : 'text-[var(--text-muted)] hover:bg-[var(--card-background-hover)]'
                }`}
              >
                <div className="relative mr-3">
                  <item.icon className={`h-5 w-5 ${
                    activeTab === item.name.toLowerCase() ? 'text-blue-400' : 'text-gray-400'
                  }`} />
                  {hasUnviewed && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-[var(--card-background)]">
                      {unviewedNotificationsCount > 9 ? '9+' : unviewedNotificationsCount}
                    </span>
                  )}
                </div>
                {displayName}
              </button>
            );
          })}
        </div>
      </nav>
      <div className="p-4 border-t border-[var(--border-color)]">
        <div className="flex items-center space-x-3 px-4 py-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-[var(--text-primary)] font-medium">
              {userProfile?.contact_name || userProfile?.account_name || userProfile?.full_name || (isAdmin ? 'Admin' : 'Investor')}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              {isAdmin ? 'Administrator' : 'Investor'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-sm text-red-400 hover:bg-[var(--card-background-hover)] rounded-xl transition-all duration-200"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
import React from 'react';
import { Menu, X, Bell, Home, PieChart, FileText, Settings, Users, FolderOpen } from 'lucide-react';

interface NavbarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
}

export function Navbar({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  activeTab, 
  setActiveTab,
  isAdmin
}: NavbarProps) {
  const userNavItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Analytics', icon: PieChart },
    { name: 'Reports', icon: FileText },
    { name: 'Settings', icon: Settings },
  ];

  const adminNavItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Projects', icon: FolderOpen },
    { name: 'Users', icon: Users },
    { name: 'Reports', icon: FileText },
    { name: 'Settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <>
      <header className="h-16 bg-card-gradient backdrop-blur-xl border-b border-white/[0.02] px-6">
        <div className="h-full flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-400 hover:bg-white/5"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <button className="p-2 rounded-xl text-gray-400 hover:bg-white/5">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card-gradient backdrop-blur-xl border-b border-white/[0.02]">
          <nav className="px-4 py-2">
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.name.toLowerCase()}
                  onClick={() => {
                    setActiveTab(item.name.toLowerCase());
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-gray-400 hover:bg-white/5 rounded-xl"
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { Reports } from './components/Reports';
import { KnowledgeBase } from './components/KnowledgeBase';
import { Investments } from './components/Investments';
import { Forum } from './components/Forum';
import { Affiliates } from './components/Affiliates';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProjects } from './components/admin/AdminProjects';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminReports } from './components/admin/AdminReports';
import { AdminSettings } from './components/admin/AdminSettings';
import { OnboardingModal } from './components/OnboardingModal';
import { supabase } from './supabaseClient';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if this is the first time logging in
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (isAuthenticated && !isAdmin && !hasSeenOnboarding) {
      setShowOnboarding(true);
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
  }, [isAuthenticated, isAdmin]);

  // Check for existing session on app load
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        // Fetch user profile from users table
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        console.log('Session Check - User Profile:', userProfile);
        console.log('Session Check - User Role:', userProfile?.role);
        console.log('Session Check - Is Admin:', userProfile?.role === 'admin');
        
        setIsAdmin(userProfile?.role === 'admin');
        setUserProfile(userProfile);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-apple-gradient"><div className="text-white text-lg">Loading...</div></div>;
  }

  console.log('App State - isAuthenticated:', isAuthenticated);
  console.log('App State - isAdmin:', isAdmin);
  console.log('App State - userProfile:', userProfile);

  if (!isAuthenticated) {
    return <Login setIsAuthenticated={setIsAuthenticated} setIsAdmin={setIsAdmin} setUserProfile={setUserProfile} />;
  }

  if (isAdmin) {
    return (
      <div className="flex h-screen bg-apple-gradient">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isAdmin={isAdmin}
          setIsAuthenticated={setIsAuthenticated}
          userProfile={userProfile}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdmin={isAdmin}
          />
          {activeTab === 'dashboard' ? (
            <AdminDashboard 
              onViewProfile={(user) => {
                setActiveTab('users');
                setSelectedUser(user);
              }}
              userProfile={userProfile}
            />
          ) : activeTab === 'projects' ? (
            <AdminProjects />
          ) : activeTab === 'users' ? (
            <AdminUsers initialSelectedUser={selectedUser} />
          ) : activeTab === 'reports' ? (
            <AdminReports />
          ) : activeTab === 'settings' ? (
            <AdminSettings />
          ) : activeTab === 'forum' ? (
            <Forum userProfile={userProfile} />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-apple-gradient">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        setIsAuthenticated={setIsAuthenticated}
        userProfile={userProfile}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdmin={isAdmin}
        />
        {activeTab === 'dashboard' ? (
          <Dashboard userProfile={userProfile} />
        ) : activeTab === 'analytics' ? (
          <Analytics />
        ) : activeTab === 'reports' ? (
          <Reports />
        ) : activeTab === 'affiliates' ? (
          <Affiliates />
        ) : activeTab === 'knowledge base' ? (
          <KnowledgeBase />
        ) : activeTab === 'new investments' ? (
          <Investments />
        ) : activeTab === 'settings' ? (
          <Settings />
        ) : null}
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
        />
      </div>
    </div>
  );
}

export default App
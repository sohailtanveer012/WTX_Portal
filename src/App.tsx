import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { MyProjects } from './components/MyProjects';
import { Reports } from './components/Reports';
import { KnowledgeBase } from './components/KnowledgeBase';
import { Investments } from './components/Investments';
import { PercentageDistribution } from './components/PercentageDistribution';
import { Forum } from './components/Forum';
import { Affiliates } from './components/Affiliates';
import { Settings } from './components/Settings';
import { BulletinBoard } from './components/BulletinBoard';
import { Login } from './components/Login';
import { ResetPassword } from './components/ResetPassword';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProjects } from './components/admin/AdminProjects';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminReports } from './components/admin/AdminReports';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminNotifications } from './components/admin/AdminNotifications';
import { AdminNewReferrals } from './components/admin/AdminNewReferrals';
import { AdminBulletinBoard } from './components/admin/AdminBulletinBoard';
import { AdminInvestmentOpportunities } from './components/admin/AdminInvestmentOpportunities';
import { ReferralForm } from './components/ReferralForm';
import { supabase } from './supabaseClient';
import { fetchUnviewedInvestmentRequestsCount, fetchUnviewedDistributionRequestsCount, fetchUnviewedProfileEditRequestsCount, trackReferralClick } from './api/services';

// Main app content (everything except reset-password route)
function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unviewedNotificationsCount, setUnviewedNotificationsCount] = useState<number>(0);
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);


  // Handle referral link clicks
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      // Store referral code and show form
      setReferralCode(refCode);
      setShowReferralForm(true);
      
      // Clean up URL (remove ref parameter)
      urlParams.delete('ref');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Check for existing session on app load
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        console.log('Session Check - Session:', session);
        console.log('Session Check - User ID:', session.user.id);
        // Fetch user profile from users table
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        console.log('Session Check - User Profile:', userProfile);
        console.log('Session Check - User Role:', userProfile?.role);
        console.log('Session Check - Is Admin:', userProfile?.role === 'admin');
        
        const isAdminUser = userProfile?.role === 'admin';
        setIsAdmin(isAdminUser);
        setUserProfile(userProfile);
        
        // Ensure dashboard tab is active when admin session is restored
        if (isAdminUser) {
          setActiveTab('dashboard');
          // Fetch unviewed notifications count for admin (both investment and distribution requests)
          Promise.all([
            fetchUnviewedInvestmentRequestsCount(),
            fetchUnviewedDistributionRequestsCount(),
            fetchUnviewedProfileEditRequestsCount()
          ]).then(([investmentCount, distributionCount, editRequestCount]) => {
            setUnviewedNotificationsCount(investmentCount + distributionCount + editRequestCount);
          });
        }
      }
      setLoading(false);
    });
  }, []);

  // Fetch and subscribe to unviewed notifications count for admins
  useEffect(() => {
    if (!isAdmin || !isAuthenticated) return;

    // Initial fetch (investment, distribution, and edit requests)
    const fetchAllCounts = () => {
      Promise.all([
        fetchUnviewedInvestmentRequestsCount(),
        fetchUnviewedDistributionRequestsCount(),
        fetchUnviewedProfileEditRequestsCount()
      ]).then(([investmentCount, distributionCount, editRequestCount]) => {
        setUnviewedNotificationsCount(investmentCount + distributionCount + editRequestCount);
      });
    };

    fetchAllCounts();

    // Set up real-time subscriptions for both request types
    const investmentSubscription = supabase
      .channel('investment_requests_count_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'investment_requests' },
        () => {
          fetchAllCounts();
        }
      )
      .subscribe();

    const distributionSubscription = supabase
      .channel('distribution_requests_count_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'percentage_distribution_requests' },
        () => {
          fetchAllCounts();
        }
      )
      .subscribe();

    const editRequestSubscription = supabase
      .channel('profile_edit_requests_count_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profile_edit_requests' },
        () => {
          fetchAllCounts();
        }
      )
      .subscribe();

    return () => {
      investmentSubscription.unsubscribe();
      distributionSubscription.unsubscribe();
      editRequestSubscription.unsubscribe();
    };
  }, [isAdmin, isAuthenticated]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-apple-gradient"><div className="text-white text-lg">Loading...</div></div>;
  }

  // Show referral form if referral link was clicked
  if (showReferralForm && referralCode) {
    return (
      <ReferralForm
        referralCode={referralCode}
        onSuccess={() => {
          setShowReferralForm(false);
          setReferralCode(null);
          // Optionally redirect to login or show success message
        }}
      />
    );
  }

  // console.log('App State - isAuthenticated:', isAuthenticated);
  // console.log('App State - isAdmin:', isAdmin);
  // console.log('App State - userProfile:', userProfile);

  if (!isAuthenticated) {
    return <Login setIsAuthenticated={setIsAuthenticated} setIsAdmin={setIsAdmin} setUserProfile={setUserProfile} setActiveTab={setActiveTab} />;
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
          unviewedNotificationsCount={unviewedNotificationsCount}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdmin={isAdmin}
          />
          {activeTab === 'dashboard' && (
            <AdminDashboard 
              key={userProfile?.id || 'dashboard'}
              onViewProfile={(user) => {
                setActiveTab('users');
                setSelectedUser(user);
              }}
              userProfile={userProfile}
            />
          )}
          {activeTab === 'projects' && (
            <AdminProjects />
          )}
          {activeTab === 'users' && (
            <AdminUsers initialSelectedUser={selectedUser} />
          )}
          {activeTab === 'reports' && (
            <AdminReports />
          )}
          {activeTab === 'settings' && (
            <AdminSettings userProfile={userProfile} />
          )}
          {activeTab === 'notifications' && (
            <AdminNotifications 
              onMarkAsViewed={() => {
                // Refresh unviewed count when requests are marked as viewed
                Promise.all([
                  fetchUnviewedInvestmentRequestsCount(),
                  fetchUnviewedDistributionRequestsCount(),
                  fetchUnviewedProfileEditRequestsCount()
                ]).then(([investmentCount, distributionCount, editRequestCount]) => {
                  setUnviewedNotificationsCount(investmentCount + distributionCount + editRequestCount);
                });
              }}
            />
          )}
          {activeTab === 'new referrals' && (
            <AdminNewReferrals 
              onMarkAsViewed={() => {
                // Refresh unviewed count when submissions are marked as viewed
                // You can add a similar count system for referrals if needed
              }}
            />
          )}
          {activeTab === 'bulletin board' && (
            <AdminBulletinBoard userProfile={userProfile} />
          )}
          {activeTab === 'investment opportunities' && (
            <AdminInvestmentOpportunities />
          )}
          {activeTab === 'forum' && (
            <Forum userProfile={userProfile} />
          )}
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
          <Dashboard userProfile={userProfile} setActiveTab={setActiveTab} />
        ) : activeTab === 'my projects' ? (
          <MyProjects userProfile={userProfile} />
        ) : activeTab === 'reports' ? (
          <Reports userProfile={userProfile} />
        ) : activeTab === 'affiliates' ? (
          <Affiliates userProfile={userProfile} />
        ) : activeTab === 'knowledge base' ? (
          <KnowledgeBase />
        ) : activeTab === 'new investments' ? (
          <Investments userProfile={userProfile} />
        ) : activeTab === 'percentage distribution' ? (
          <PercentageDistribution userProfile={userProfile} />
        ) : activeTab === 'bulletin board' ? (
          <BulletinBoard userProfile={userProfile} />
        ) : activeTab === 'settings' ? (
          <Settings userProfile={userProfile} />
        ) : null}
      </div>
    </div>
  );
}

// Root App component with routing
function App() {
  return (
    <Routes>
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<MainApp />} />
    </Routes>
  );
}

export default App
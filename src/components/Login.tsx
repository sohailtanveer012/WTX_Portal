import React, { useState } from 'react';
import { Mail, Lock, LogIn, Sun, Moon, ChevronRight, Shield, Globe, Eye, EyeOff } from 'lucide-react';
import WTXLogo from '../assets/WTX-Logo.png';
import DemoProject1 from '../assets/Demo-Project-1.jpg';
import { ContactModal } from './ContactModal';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { supabase } from '../supabaseClient';

interface LoginProps {
  setIsAuthenticated: (value: boolean) => void;
  setIsAdmin: (value: boolean) => void;
  setUserProfile: (profile: any) => void;
  setActiveTab?: (tab: string) => void;
}

export function Login({ setIsAuthenticated, setIsAdmin, setUserProfile, setActiveTab }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    // Fetch user profile from users table to get the role and name
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    setIsAuthenticated(true);
    const isAdminUser = userProfile?.role === 'admin';
    setIsAdmin(isAdminUser);
    setUserProfile(userProfile);
    
    // Ensure dashboard tab is active when admin logs in
    if (isAdminUser && setActiveTab) {
      setActiveTab('dashboard');
    }
    
    setSuccessMsg('Login successful! Redirecting...');
  };

  // Example logout function (can be used in your navbar/sidebar)
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <div className="min-h-screen bg-apple-gradient flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40 z-10" />
        <img
          src={DemoProject1}
          alt="Oil field"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="relative z-20 p-16 flex flex-col h-full justify-between">
          <div>
            <img src={WTXLogo} alt="WTX Logo" className="h-20 w-auto" />
            <h1 className="mt-12 text-4xl font-bold text-white leading-tight">
              Empowering the Crude Oil <br />Investment Industry
            </h1>
            <p className="mt-4 text-lg text-white max-w-md">
              Access your portfolio and track your investments all in one place.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Enterprise Security</h3>
                <p className="text-white text-sm mt-1">
                  Bank-grade encryption and security protocols to protect your investments
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Global Access</h3>
                <p className="text-white text-sm mt-1">
                  Manage your investments from anywhere in the world, 24/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
        <div className="lg:hidden mb-8">
          <img src={WTXLogo} alt="WTX Logo" className="h-20 w-auto mx-auto" />
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Welcome back</h2>
          <p className="text-[var(--text-muted)] mt-2">Access your investment portfolio</p>
        </div>

        {/* Success/Error Messages */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 text-center font-medium">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card-gradient rounded-2xl p-8 hover-neon-glow">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-[var(--text-muted)]" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[var(--text-muted)]" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3.5 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-[var(--border-color)] bg-[var(--input-background)] text-blue-500 focus:ring-blue-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--text-muted)]">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full flex items-center justify-center px-4 py-4 text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign in to your account
              <ChevronRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Contact us to get started
          </button>
        </p>

        <ContactModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
        />
        <ForgotPasswordModal
          isOpen={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
        />
      </div>
      </div>
    </div>
  );
}
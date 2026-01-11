import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

export function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);

  useEffect(() => {
    // Use window.location.hash because Supabase processes hash fragments from the URL
    const hash = window.location.hash;
    
    console.log('ResetPassword mounted, hash:', hash ? hash.substring(0, 50) + '...' : 'none');
    
    // If there's no hash with access_token, the link is invalid
    if (!hash || !hash.includes('access_token')) {
      setError('Invalid or expired reset link. Please request a new password reset.');
      setIsValidatingToken(false);
      return;
    }

    let sessionEstablished = false;
    let retryCount = 0;
    const maxRetries = 20; // Increase retries since Supabase needs time to process

    // Supabase automatically processes hash fragments when the page loads
    // Use onAuthStateChange to listen for session establishment
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Session was established from the hash token
        if (session && !sessionEstablished) {
          sessionEstablished = true;
          try {
            // Verify the user exists
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
              console.error('Error getting user:', userError);
              if (userError?.message?.includes('user_not_found') || userError?.message?.includes('User from sub claim')) {
                setError('User account not found. Please contact support or request a new invitation.');
              } else {
                setError('Unable to verify user account. Please try again.');
              }
              setIsValidatingToken(false);
              subscription.unsubscribe();
              return;
            }
            
            console.log('User verified:', user.email);
            setIsValidatingToken(false);
            subscription.unsubscribe();
            
            // Clear the hash from URL for security (after a short delay)
            setTimeout(() => {
              if (window.location.hash) {
                window.history.replaceState(null, '', window.location.pathname);
              }
            }, 500);
          } catch (err) {
            console.error('Error verifying user:', err);
            setError('Unable to verify user account. Please try again.');
            setIsValidatingToken(false);
            subscription.unsubscribe();
          }
        }
      }
    });

    // Also check periodically for existing session (in case it was already established)
    const checkExistingSession = async () => {
      if (sessionEstablished) return;
      
      retryCount++;
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log(`Session check attempt ${retryCount}:`, session ? 'Session exists' : 'No session', sessionError?.message);
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        if (retryCount >= maxRetries) {
          if (sessionError.message?.includes('user_not_found') || sessionError.message?.includes('User from sub claim')) {
            setError('User account not found. Please contact support or request a new invitation.');
          } else {
            setError('Invalid or expired reset link. Please request a new password reset.');
          }
          setIsValidatingToken(false);
          subscription.unsubscribe();
          return;
        }
        // Retry
        setTimeout(() => {
          checkExistingSession();
        }, 500);
        return;
      }

      if (session) {
        // Session already exists
        sessionEstablished = true;
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) {
            console.error('Error getting user:', userError);
            setIsValidatingToken(false);
            subscription.unsubscribe();
            return;
          }
          console.log('Session already exists for:', user.email);
          setIsValidatingToken(false);
          subscription.unsubscribe();
          
          // Clear the hash from URL for security
          setTimeout(() => {
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }, 500);
        } catch (err) {
          console.error('Error verifying user:', err);
          setIsValidatingToken(false);
          subscription.unsubscribe();
        }
      } else if (retryCount < maxRetries) {
        // No session yet - wait and retry
        setTimeout(() => {
          checkExistingSession();
        }, 500);
      } else {
        // Max retries reached
        setError('Unable to process reset link. Please request a new password reset.');
        setIsValidatingToken(false);
        subscription.unsubscribe();
      }
    };

    // Start checking for session after a short delay to let Supabase process the hash
    setTimeout(() => {
      checkExistingSession();
    }, 500);

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*[0-9])/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Get current session (should be set from the hash token that Supabase processed)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError('Session expired. Please request a new password reset link.');
        setIsLoading(false);
        return;
      }

      // Verify the user exists before updating password
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('User account not found. Please contact support.');
        setIsLoading(false);
        return;
      }

      // Update the password (we need the session to do this)
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        // Handle specific error cases
        if (updateError.message?.includes('user_not_found')) {
          setError('User account not found. Please contact support or request a new invitation.');
        } else {
          setError(updateError.message || 'Failed to update password. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // Success - sign out the user immediately so they can log in themselves
      // This prevents auto-login behavior
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error('Error signing out:', signOutError);
        // Still show success since password was updated
      }
      
      setSuccess(true);
      setIsLoading(false);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Error updating password:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-apple-gradient flex items-center justify-center p-4">
        <div className="bg-card-gradient rounded-2xl p-8 max-w-md w-full border border-blue-500/20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-apple-gradient flex items-center justify-center p-4">
        <div className="bg-card-gradient rounded-2xl p-8 max-w-md w-full border border-blue-500/20 text-center">
          <div className="bg-green-500/10 text-green-400 p-4 rounded-xl mb-6 flex items-center justify-center space-x-2">
            <CheckCircle className="h-6 w-6" />
            <span className="font-medium">Password updated successfully!</span>
          </div>
          <p className="text-[var(--text-muted)] mb-6">
            Your password has been set. You can now log in with your new password.
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-gradient flex items-center justify-center p-4">
      <div className="bg-card-gradient rounded-2xl p-8 max-w-md w-full border border-blue-500/20">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
            <Lock className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Set Your Password
          </h1>
          <p className="text-[var(--text-muted)]">
            Create a new password for your account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-[var(--text-muted)]" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                required
                className="w-full pl-12 pr-12 py-3 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Must be at least 8 characters with uppercase, lowercase, and a number
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-[var(--text-muted)]" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null);
                }}
                required
                className="w-full pl-12 pr-12 py-3 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Setting Password...
              </>
            ) : (
              'Set Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}


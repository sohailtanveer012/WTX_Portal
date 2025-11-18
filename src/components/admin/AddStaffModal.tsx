import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, Shield, Send } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddStaffModal({ isOpen, onClose, onSuccess }: AddStaffModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'staff' as 'staff' | 'admin',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Get the session token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error('Failed to get session: ' + sessionError.message);
      }

      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Prepare staff data
      const staffData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        role: formData.role,
      };

      console.log('Calling add-staff-admin Edge Function with data:', staffData);

      // Use direct fetch exactly as provided in user's example
      // Project ID from supabaseClient
      const projectId = 'xexwnpzgoovowmvdjzfg';
      const functionUrl = `https://${projectId}.supabase.co/functions/v1/add-staff-admin`;

      console.log('Calling Edge Function at:', functionUrl);
      console.log('Using token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

      let res;
      try {
        res = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(staffData),
        });
      } catch (fetchError: unknown) {
        console.error('Fetch error:', fetchError);
        const fetchErrorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
        
        if (fetchErrorMessage.includes('CORS') || fetchErrorMessage.includes('Failed to fetch')) {
          throw new Error(
            'CORS Error: The Edge Function "add-staff-admin" may not be deployed or properly configured. ' +
            'Please ensure:\n' +
            '1. The Edge Function is deployed in your Supabase project\n' +
            '2. The function name matches exactly: "add-staff-admin"\n' +
            '3. The function has CORS headers configured\n' +
            `4. Check the function URL: ${functionUrl}`
          );
        }
        throw fetchError;
      }

      // Get response text first (can only be read once)
      const responseText = await res.text();
      console.log('Response status:', res.status);
      console.log('Response text:', responseText);

      // Check if the response is OK (200-299 range)
      if (!res.ok) {
        let errorMessage = `Server error: ${res.status}`;
        
        try {
          if (responseText) {
            const errorJson = JSON.parse(responseText);
            errorMessage = errorJson.error || errorJson.message || errorMessage;
          } else {
            errorMessage = `HTTP ${res.status}: ${res.statusText}`;
          }
        } catch {
          // If parsing fails, use the response text or status
          errorMessage = responseText || errorMessage;
        }
        
        // Special handling for 404 (function not found)
        if (res.status === 404) {
          errorMessage = `Edge Function not found (404). Please ensure the function "add-staff-admin" is deployed in your Supabase project.`;
        }
        
        throw new Error(errorMessage);
      }

      // If response is OK (200-299), parse and handle the response
      let result: { error?: string; message?: string; success?: boolean; warning?: string; user?: unknown } | null = null;
      
      if (responseText) {
        try {
          result = JSON.parse(responseText) as { error?: string; message?: string; success?: boolean; warning?: string; user?: unknown };
          console.log('Success response (parsed):', result);
          
          // Check if the parsed response contains an error field
          if (result && typeof result === 'object' && 'error' in result && result.error) {
            // Even if status is OK, if response has error field, treat it as error
            throw new Error(result.error || 'Unknown error from server');
          }
          
          // Check for warning (user created but invite may have failed)
          if (result && typeof result === 'object' && 'warning' in result && result.warning) {
            console.warn('Warning from server:', result.warning);
            // Still treat as success but log the warning
          }
        } catch (parseError) {
          // If parsing fails but status is OK, it might be an empty response or plain text
          // This should not happen with the updated Edge Function, but handle gracefully
          if (parseError instanceof Error && parseError.message && !parseError.message.includes('JSON')) {
            // Re-throw if it's our custom error from above (not a JSON parse error)
            throw parseError;
          }
          console.error('Error parsing response as JSON:', parseError);
          // If status is OK but response is not valid JSON, something is wrong
          throw new Error('Invalid response format from server');
        }
      } else {
        // Empty response but status is OK - this shouldn't happen with the updated function
        console.warn('Empty response but status is OK - treating as success');
        result = { success: true };
      }

      // Success
      alert(`✅ ${formData.role === 'admin' ? 'Admin' : 'Staff'} added and invite sent successfully!`);
      
      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        role: 'staff',
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();
    } catch (err: unknown) {
      console.error('Error adding staff/admin:', err);
      // More detailed error handling
      const errorMessage = err instanceof Error ? err.message : 'Failed to add staff/admin. Please try again.';
      
      if (errorMessage.includes('fetch') || errorMessage.includes('NetworkError')) {
        setError('Network error: Could not reach the server. Please check your internet connection and ensure the Edge Function is deployed.');
      } else if (errorMessage.includes('CORS')) {
        setError('CORS error: The Edge Function may not be properly configured. Please contact the administrator.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      role: 'staff',
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-gradient rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <UserPlus className="h-6 w-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Add Staff / Admin</h2>
              <p className="text-sm text-[var(--text-muted)]">Create a new staff member or admin account</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400 whitespace-pre-line">{error}</p>
            {error.includes('CORS') && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs text-yellow-400">
                  <strong>Note:</strong> The Edge Function needs to have CORS headers configured. 
                  Make sure your function includes proper CORS middleware or headers in its code.
                </p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <UserPlus className="absolute left-4 top-3.5 h-5 w-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 h-5 w-5 text-[var(--text-muted)]" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Role <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-4 top-3.5 h-5 w-5 text-[var(--text-muted)]" />
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'staff' | 'admin' })}
                  className="w-full pl-12 pr-4 py-3 bg-[var(--input-background)] border border-[var(--input-border)] rounded-xl text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  Add {formData.role === 'admin' ? 'Admin' : 'Staff'}
                  <Send className="h-5 w-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


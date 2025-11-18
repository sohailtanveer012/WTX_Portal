import { supabase } from "../../supabaseClient"; // adjust path

// Fetch investors with their total projects
export async function fetchInvestorsWithTotalProjects() {
  const { data, error } = await supabase.rpc("get_investors_with_total_projects");

  if (error) {
    console.error("Error fetching investors:", error);
    return [];
  }

  return data ?? []; // [{ investor_id, investor_name, total_projects }, ...]
}

// Fetch Investors , their total projects, and their total investment
export async function fetchInvestorsWithTotalProjectsAndInvestment() {
  const { data, error } = await supabase.rpc('get_investor_payout_summary');
  if (error) {
    console.error('Error fetching investors:', error);
    return [];
  }
  return data ?? [];
}

export async function fetchProjectInvestors(projectId: string | number) {
  const { data, error } = await supabase
    .rpc('get_investor_payouts_by_project', { project_id_input: projectId });

  if (error) {
    console.error('Error fetching project investors:', error);
    return [];
  }
  
  console.log('fetchProjectInvestors - Raw data received:', data);
  console.log('fetchProjectInvestors - Data length:', data?.length);
  
  // Remove duplicates based on investor_id
  if (data && data.length > 0) {
    const uniqueData = data.filter((inv: Record<string, unknown>, idx: number, self: Record<string, unknown>[]) => 
      idx === self.findIndex((i: Record<string, unknown>) => i.investor_id === inv.investor_id)
    );
    
    console.log('fetchProjectInvestors - Unique data length:', uniqueData.length);
    
    if (data.length !== uniqueData.length) {
      console.warn(`Removed ${data.length - uniqueData.length} duplicate investor records`);
    }
    
    // Log unique investor IDs
    console.log('fetchProjectInvestors - Unique investor IDs:', uniqueData.map((inv: Record<string, unknown>) => inv.investor_id));
    
    return uniqueData;
  }
  
  return data ?? [];
}

export async function fetchInvestorsByProject(projectId: string | number) {
  const { data, error } = await supabase
    .rpc('get_investors_by_project', { project_id_input: projectId });

  if (error) {
    console.error('Error fetching investors by project:', error);
    return [];
  }
  
  console.log('fetchInvestorsByProject - Raw data received:', data);
  console.log('fetchInvestorsByProject - Data length:', data?.length);
  

  
  return data ?? [];
}

export async function fetchProjectInvestorsByMonth(projectId: string | number, month: string) {
  console.log('fetchProjectInvestorsByMonth called with projectId:', projectId, 'month:', month);
  
  if (!projectId) {
    console.error('Invalid project ID:', projectId);
    return [];
  }
  
  const [year, monthNum] = month.split('-');
  console.log('Calling RPC with:', { project_id_input: projectId, month_input: parseInt(monthNum), year_input: parseInt(year) });
  
  const { data, error } = await supabase
    .rpc('get_investor_payouts_by_project_month_year', {
      project_id_input: projectId,
      month_input: parseInt(monthNum),
      year_input: parseInt(year)
    });

  if (error) {
    console.error('Error fetching project investors by month:', error);
    return [];
  }
  console.log('Successfully fetched investors by month:', data);
  return data ?? [];
}

export async function fetchProjectsWithInvestorCount() {
  const { data, error } = await supabase
    .rpc('get_projects_with_investor_count');

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data ?? [];
}

// Fetch all investors (users with role 'investor') for selection UIs
export type SimpleInvestor = { id: string; name: string; email: string };
export async function fetchAllInvestors(): Promise<SimpleInvestor[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, contact_name, account_name, role')
    .eq('role', 'investor');
  if (error) {
    console.error('Error fetching investors list:', error);
    return [];
  }
  let mapped: SimpleInvestor[] = (data || []).map((u: Record<string, unknown>) => ({
    id: String(u.id),
    name: (u.full_name || u.contact_name || u.account_name || u.email || 'Investor') as string,
    email: (u.email || '') as string
  }));
  // Fallback: if users table returns no rows, try RPC summary
  if (!mapped.length) {
    try {
      const { data: summary, error: rpcError } = await supabase.rpc('get_investor_payout_summary');
      if (!rpcError && Array.isArray(summary)) {
        mapped = summary.map((row: Record<string, unknown>) => ({
          id: String(row.investor_id ?? row.id ?? row.INVESTOR_ID ?? `${Date.now()}`),
          name: row.investor_name || row.name || 'Investor',
          email: row.investor_email || ''
        }));
      }
    } catch (e) {
      console.error('Fallback fetchAllInvestors failed:', e);
    }
  }
  return mapped;
}

export async function fetchProjectRevenueByMonth(projectId: string | number, month: string) {
  console.log('fetchProjectRevenueByMonth called with projectId:', projectId, 'month:', month);
  
  if (!projectId) {
    console.error('Invalid project ID:', projectId);
    return null;
  }
  
  const [year, monthNum] = month.split('-');
  console.log('Calling RPC with:', { p_project_id: projectId, p_month: parseInt(monthNum), p_year: parseInt(year) });
  
  const { data, error } = await supabase
    .rpc('get_project_revenue_by_month', {
      p_project_id: projectId,
      p_month: parseInt(monthNum),
      p_year: parseInt(year)
    });

  if (error) {
    console.error('Error fetching project revenue by month:', error);
    return null;
  }
  
  console.log('Successfully fetched project revenue:', data);
  // Return the revenue value (assuming the API returns a single number or object with revenue)
  if (data && data.length > 0) {
    return data[0].total_revenue || data[0].revenue || data[0] || null;
  }
  return data || null;
}

// Sum of revenues across all projects and all months (expects an RPC on the DB)
export async function fetchTotalRevenueAllProjectsAllMonths(): Promise<number | null> {
  try {
    const { data, error } = await supabase.rpc('get_total_revenue_all_projects');
    if (error) {
      console.error('Error fetching total revenue (all projects, all months):', error);
      return null;
    }
    if (Array.isArray(data) && data.length > 0) {
      // handle possible shapes
      const row = data[0] as Record<string, unknown>;
      return (row.total_revenue || row.revenue || row.sum || row.total || data as unknown as number) ?? null;
    }
    if (typeof data === 'number') return data;
    return null;
  } catch (e) {
    console.error('fetchTotalRevenueAllProjectsAllMonths failed:', e);
    return null;
  }
}

// Fetch monthly total revenue rows from RPC and return as an array
export type TotalRevenueRow = {
  year: number;
  month: number;
  total_revenue: number;
};

export async function fetchTotalRevenueMonthly(): Promise<TotalRevenueRow[]> {
  const { data, error } = await supabase.rpc('get_total_revenue');
  if (error) {
    console.error('Error fetching total revenue monthly:', error);
    return [];
  }
  if (Array.isArray(data)) {
    return data as TotalRevenueRow[];
  }
  return [];
}

// Total revenue aggregated per project across all months
export type ProjectTotalRevenueRow = {
  project_id: string;
  project_name: string;
  total_revenue: number;
};

export async function fetchTotalRevenueAllProjects(): Promise<ProjectTotalRevenueRow[]> {
  const { data, error } = await supabase.rpc('get_total_revenues_all_projects');
  if (error) {
    console.error('Error fetching total revenue per project:', error);
    return [];
  }
  if (Array.isArray(data)) {
    return data as ProjectTotalRevenueRow[];
  }
  return [];
}

// Investor return summary for performance categorization
export type InvestorReturnRow = {
  investor_id: number;
  investor_name: string;
  total_investment: number;
  total_payout: number;
  return_status: string; // e.g., "Positive Returns" | "Negative Returns"
};

export async function fetchInvestorReturnSummary(): Promise<InvestorReturnRow[]> {
  const { data, error } = await supabase.rpc('get_investor_return_summary');
  if (error) {
    console.error('Error fetching investor return summary:', error);
    return [];
  }
  if (Array.isArray(data)) {
    return data as InvestorReturnRow[];
  }
  return [];
}

// Fetch an investor's portfolio details by investor ID
export async function fetchInvestorPortfolio(investorId: number) {
  const { data, error } = await supabase.rpc('get_investor_portfolio', {
    investor_id_input: investorId,
  });
  if (error) {
    console.error('Error fetching investor portfolio:', error);
    return [];
  }
  return data ?? [];
}

// Fetch an investor's portfolio details by email
export async function fetchInvestorPortfolioByEmail(investorEmail: string) {
  const { data, error } = await supabase.rpc('get_investor_portfolio_by_email', {
    investor_email_input: investorEmail,
  });
  if (error) {
    console.error('Error fetching investor portfolio by email:', error);
    return [];
  }
  return data ?? [];
}

// Add investor via Edge Function
export interface AddInvestorParams {
  full_name?: string;
  email: string;
  phone?: string;
  dob?: string;
  address?: string;
  company?: string;
  ssn?: string;
  bank?: string;
  routing?: string;
  account?: string;
  account_type?: string;
  project_id?: string;
  invested_amount?: number;
  percentage_owned?: number;
}

export async function addInvestor(params: AddInvestorParams) {
  const { data, error } = await supabase.functions.invoke('add-investor', {
    body: params,
  });

  if (error) {
    console.error('Error adding investor:', error);
    throw error;
  }

  return data;
}

// Add staff/admin
export interface AddStaffParams {
  full_name: string;
  email: string;
  phone?: string | null;
  role: 'staff' | 'admin';
}

export async function addStaff(params: AddStaffParams) {
  const { data, error } = await supabase.functions.invoke('add-staff-admin', {
    body: params,
  });

  if (error) {
    console.error('Error adding staff/admin:', error);
    throw error;
  }

  return data;
}

// Fetch investment requests for a specific investor by email
export interface InvestorRequest {
  id: string | number;
  investor_id?: number;
  investor_name: string;
  investor_email: string;
  investor_phone?: string;
  company?: string;
  project_name: string;
  units?: number;
  message?: string;
  preferred_contact?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
}

export async function fetchInvestorRequests(investorEmail: string): Promise<InvestorRequest[]> {
  try {
    const { data, error } = await supabase
      .from('investment_requests')
      .select('*')
      .eq('investor_email', investorEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching investor requests:', error);
      return [];
    }

    return (data || []) as InvestorRequest[];
  } catch (err) {
    console.error('Error fetching investor requests:', err);
    return [];
  }
}

// Fetch count of unviewed investment requests (pending requests that haven't been viewed)
export async function fetchUnviewedInvestmentRequestsCount(): Promise<number> {
  try {
    // First try with viewed column
    const { count, error } = await supabase
      .from('investment_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .or('viewed.is.null,viewed.eq.false');

    if (error) {
      // If viewed column doesn't exist, fallback to counting all pending requests
      if (error.message?.includes('column') && error.message?.includes('viewed')) {
        const { count: fallbackCount, error: fallbackError } = await supabase
          .from('investment_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        if (fallbackError) {
          console.error('Error fetching pending requests count:', fallbackError);
          return 0;
        }
        return fallbackCount || 0;
      }
      console.error('Error fetching unviewed investment requests count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Error fetching unviewed investment requests count:', err);
    return 0;
  }
}

// Mark investment requests as viewed
export async function markInvestmentRequestsAsViewed(requestIds?: (string | number)[]): Promise<void> {
  try {
    if (requestIds && requestIds.length > 0) {
      // Mark specific requests as viewed
      const { error } = await supabase
        .from('investment_requests')
        .update({ viewed: true, viewed_at: new Date().toISOString() })
        .in('id', requestIds);
      
      if (error) {
        console.error('Error marking requests as viewed:', error);
        // If viewed column doesn't exist, silently fail
        if (error.message?.includes('column') && error.message?.includes('viewed')) {
          console.warn('viewed column does not exist in investment_requests table');
        }
      }
    } else {
      // Mark all pending requests as viewed
      const { error } = await supabase
        .from('investment_requests')
        .update({ viewed: true, viewed_at: new Date().toISOString() })
        .eq('status', 'pending')
        .or('viewed.is.null,viewed.eq.false');
      
      if (error) {
        console.error('Error marking all pending requests as viewed:', error);
        // If viewed column doesn't exist, silently fail
        if (error.message?.includes('column') && error.message?.includes('viewed')) {
          console.warn('viewed column does not exist in investment_requests table');
        }
      }
    }
  } catch (err) {
    console.error('Error marking investment requests as viewed:', err);
  }
}

// Referral functions
export interface ReferralStats {
  total_referrals: number;
  pending: number;
  clicked: number;
  submitted: number;
  active_investors: number;
}

export async function getReferralCode(investorId: number): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('get_or_create_referral_code', {
      investor_id_input: investorId
    });

    if (error) {
      console.error('Error getting referral code:', error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error('Error getting referral code:', err);
    return null;
  }
}

export async function getReferralStats(investorId: number): Promise<ReferralStats | null> {
  try {
    const { data, error } = await supabase.rpc('get_referral_stats', {
      investor_id_input: investorId
    });

    if (error) {
      console.error('Error getting referral stats:', error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error('Error getting referral stats:', err);
    return null;
  }
}

export interface Referral {
  id: number;
  referrer_id: number;
  referral_code: string;
  referred_email: string | null;
  referred_name: string | null;
  status: string;
  clicked_at: string | null;
  signed_up_at: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  submission_status?: string | null; // Status from referral_submissions table
  submission_created_at?: string | null;
}

export async function getReferrals(investorId: number): Promise<Referral[]> {
  try {
    // Use RPC function to get referrals with submission status
    const { data, error } = await supabase.rpc('get_referrals_with_submission_status', {
      investor_id_input: investorId
    });

    if (error) {
      console.error('Error fetching referrals:', error);
      // Fallback to direct query if RPC doesn't exist
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', investorId)
        .order('created_at', { ascending: false });

      if (fallbackError) {
        console.error('Error fetching referrals (fallback):', fallbackError);
        return [];
      }

      return fallbackData || [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching referrals:', err);
    return [];
  }
}

export async function trackReferralClick(referralCode: string): Promise<{ success: boolean; referrer_id?: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('track_referral_click', {
      referral_code_input: referralCode
    });

    if (error) {
      console.error('Error tracking referral click:', error);
      return { success: false, error: error.message };
    }

    return data || { success: false, error: 'Unknown error' };
  } catch (err) {
    console.error('Error tracking referral click:', err);
    return { success: false, error: 'Failed to track referral click' };
  }
}

export async function updateReferralContact(
  referralCode: string,
  email: string,
  name: string
): Promise<{ success: boolean; referrer_id?: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('update_referral_contact', {
      referral_code_input: referralCode,
      referred_email_input: email,
      referred_name_input: name
    });

    if (error) {
      console.error('Error updating referral contact:', error);
      return { success: false, error: error.message };
    }

    return data || { success: false, error: 'Unknown error' };
  } catch (err) {
    console.error('Error updating referral contact:', err);
    return { success: false, error: 'Failed to update referral contact' };
  }
}

// Referral submission functions
export interface ReferralSubmissionFormData {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  investment_amount?: number;
  investment_interest?: string;
  preferred_contact_method?: string;
  message?: string;
}

export interface ReferralSubmission {
  id: number;
  referral_id: number;
  referral_code: string;
  referrer_id: number;
  referrer_name: string;
  referrer_email: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  investment_amount: number | null;
  investment_interest: string | null;
  preferred_contact_method: string;
  message: string | null;
  status: string;
  viewed: boolean;
  viewed_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function submitReferralForm(
  referralCode: string,
  formData: ReferralSubmissionFormData
): Promise<{ success: boolean; submission_id?: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('submit_referral_form', {
      referral_code_input: referralCode,
      full_name_input: formData.full_name,
      email_input: formData.email,
      phone_input: formData.phone || null,
      company_input: formData.company || null,
      address_input: formData.address || null,
      city_input: formData.city || null,
      state_input: formData.state || null,
      zip_code_input: formData.zip_code || null,
      country_input: formData.country || null,
      investment_amount_input: formData.investment_amount || null,
      investment_interest_input: formData.investment_interest || null,
      preferred_contact_method_input: formData.preferred_contact_method || 'email',
      message_input: formData.message || null
    });

    if (error) {
      console.error('Error submitting referral form:', error);
      return { success: false, error: error.message };
    }

    return data || { success: false, error: 'Unknown error' };
  } catch (err) {
    console.error('Error submitting referral form:', err);
    return { success: false, error: 'Failed to submit referral form' };
  }
}

export async function getReferralSubmissions(): Promise<ReferralSubmission[]> {
  try {
    const { data, error } = await supabase.rpc('get_referral_submissions', {
      limit_count: 100,
      offset_count: 0
    });

    if (error) {
      console.error('Error fetching referral submissions:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching referral submissions:', err);
    return [];
  }
}

export async function getUnviewedReferralSubmissionsCount(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_unviewed_referral_submissions_count');

    if (error) {
      console.error('Error fetching unviewed referral submissions count:', error);
      return 0;
    }

    return data || 0;
  } catch (err) {
    console.error('Error fetching unviewed referral submissions count:', err);
    return 0;
  }
}

export async function markReferralSubmissionViewed(submissionId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('mark_referral_submission_viewed', {
      submission_id_input: submissionId
    });

    if (error) {
      console.error('Error marking referral submission as viewed:', error);
      return { success: false, error: error.message };
    }

    return data || { success: false, error: 'Unknown error' };
  } catch (err) {
    console.error('Error marking referral submission as viewed:', err);
    return { success: false, error: 'Failed to mark submission as viewed' };
  }
}

// ============================================================
// TAX DOCUMENTS
// ============================================================

export interface TaxDocument {
  id: number;
  investor_id: number;
  document_type: string;
  year: string;
  file_name: string;
  file_path: string;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  description: string | null;
  uploaded_at: string;
  created_at: string;
}

export async function getTaxDocuments(investorId: number): Promise<TaxDocument[]> {
  try {
    const { data, error } = await supabase.rpc('get_tax_documents', {
      investor_id_input: investorId
    });

    if (error) {
      console.error('Error fetching tax documents:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching tax documents:', err);
    return [];
  }
}

export async function uploadTaxDocument(
  investorId: number,
  file: File,
  documentType: string,
  year: string,
  description?: string
): Promise<{ success: boolean; error?: string; document?: TaxDocument }> {
  try {
    // Upload file to Supabase Storage
    const filePath = `tax-documents/${investorId}/${year}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('investor-documents')
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      console.error('Error uploading tax document:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('investor-documents')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Insert metadata into tax_documents table
    const { data, error: insertError } = await supabase
      .from('tax_documents')
      .insert([
        {
          investor_id: investorId,
          document_type: documentType,
          year: year,
          file_name: file.name,
          file_path: filePath,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          description: description || null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting tax document metadata:', insertError);
      // Try to delete uploaded file
      await supabase.storage.from('investor-documents').remove([filePath]);
      return { success: false, error: insertError.message };
    }

    return { success: true, document: data };
  } catch (err: any) {
    console.error('Error uploading tax document:', err);
    return { success: false, error: err.message || 'Failed to upload tax document' };
  }
}

export async function deleteTaxDocument(documentId: number, filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('investor-documents')
      .remove([filePath]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('tax_documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      console.error('Error deleting tax document:', deleteError);
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error deleting tax document:', err);
    return { success: false, error: err.message || 'Failed to delete tax document' };
  }
}

// ============================================================
// INVESTOR PERSONAL INFO
// ============================================================

export interface InvestorPersonalInfo {
  investor_id: number;
  investor_name: string;
  investor_email: string;
  phone: string | null;
  ssn: string | null;
  bank: string | null;
  routing: string | null;
  account: string | null;
  birthday: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
}

export async function getInvestorPersonalInfo(investorId: number): Promise<InvestorPersonalInfo | null> {
  try {
    const { data, error } = await supabase.rpc('get_investor_personal_info', {
      investor_id_input: investorId
    });

    if (error) {
      console.error('Error fetching investor personal info:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0] as InvestorPersonalInfo;
  } catch (err) {
    console.error('Error fetching investor personal info:', err);
    return null;
  }
}

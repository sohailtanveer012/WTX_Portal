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

// Fetch total count of investors from Investors table
export async function fetchTotalInvestorsCount(): Promise<number> {
  const { data, error } = await supabase
    .rpc('get_total_investors_count');

  if (error) {
    console.error('Error fetching total investors count:', error);
    return 0;
  }
  return data ?? 0;
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

// Fetch all investors from Investors table (for adding to projects)
export interface Investor {
  id: number;
  investor_id: number;
  investor_name: string;
  investor_email: string;
  investor_phone?: string;
}

export async function fetchInvestorsFromInvestorsTable(): Promise<Investor[]> {
  const { data, error } = await supabase
    .from('Investors')
    .select('id, Investor_name, Investor_email, Investor_phone')
    .order('Investor_name', { ascending: true });

  if (error) {
    console.error('Error fetching investors from Investors table:', error);
    return [];
  }

  return (data || []).map((inv: any) => ({
    id: inv.id,
    investor_id: inv.id,
    investor_name: inv.Investor_name || '',
    investor_email: inv.Investor_email || '',
    investor_phone: inv.Investor_phone || null,
  }));
}

// Add an existing investor to a project
export interface AddExistingInvestorToProjectParams {
  investor_id: number;
  project_id: string;
  invested_amount: number;
  percentage_owned: number;
}

export async function addExistingInvestorToProject(params: AddExistingInvestorToProjectParams) {
  const { data, error } = await supabase
    .from('Investments-Test')
    .insert([
      {
        investor_id: params.investor_id,
        project_id: params.project_id,
        invested_amount: params.invested_amount,
        percentage_owned: params.percentage_owned,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding existing investor to project:', error);
    throw error;
  }

  return data;
}

// Update investment amount and percentage for an existing investor-project combination
export interface UpdateInvestmentParams {
  investor_id: number;
  project_id: string;
  invested_amount: number;
  percentage_owned: number;
}

export async function updateInvestment(params: UpdateInvestmentParams) {
  // First, check if the investment record exists
  const { data: existingData, error: checkError } = await supabase
    .from('Investments-Test')
    .select('investor_id, project_id')
    .eq('investor_id', params.investor_id)
    .eq('project_id', params.project_id)
    .maybeSingle();

  if (checkError) {
    console.error('Error checking investment existence:', checkError);
    throw new Error(`Failed to check investment: ${checkError.message}`);
  }

  if (!existingData) {
    throw new Error('Investment record not found. Please ensure the investor is associated with this project.');
  }

  // Now perform the update
  const { data, error } = await supabase
    .from('Investments-Test')
    .update({
      invested_amount: params.invested_amount,
      percentage_owned: params.percentage_owned,
    })
    .eq('investor_id', params.investor_id)
    .eq('project_id', params.project_id)
    .select();

  if (error) {
    console.error('Error updating investment:', error);
    throw new Error(`Failed to update investment: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('Investment was not updated. No rows were affected.');
  }

  return data[0];
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

export async function fetchProjectRevenueByMonthWithInfo(projectId: string | number, month: string) {
  console.log('fetchProjectRevenueByMonthWithInfo called with projectId:', projectId, 'month:', month);
  
  if (!projectId) {
    console.error('Invalid project ID:', projectId);
    return null;
  }
  
  const [year, monthNum] = month.split('-');
  console.log('Calling RPC with:', { p_project_id: projectId, p_month: parseInt(monthNum), p_year: parseInt(year) });
  
  // Use get_project_revenue_by_month which now returns st_percentage
  const { data, error } = await supabase
    .rpc('get_project_revenue_by_month', {
      p_project_id: projectId,
      p_month: parseInt(monthNum),
      p_year: parseInt(year)
    });

  if (error) {
    console.error('Error fetching project revenue with info by month:', error);
    return null;
  }
  
  console.log('Successfully fetched project revenue with info:', data);
  // Return the first row if data exists
  if (data && data.length > 0) {
    return {
      total_revenue: data[0].total_revenue || 0,
      cost_per_bo: data[0].cost_per_bo || 0,
      production: data[0].production || 0,
      st_percentage: data[0].st_percentage || 0,
    };
  }
  return null;
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
  time_to_liquidate: string; // Date when investor will have funds available (mandatory)
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
  } catch (err) {
    console.error('Error uploading tax document:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to upload tax document';
    return { success: false, error: errorMessage };
  }
}

// Percentage Distribution Requests
export interface DistributionRecipient {
  id: string;
  name: string;
  email: string;
  percentage: number;
  transferDate: string;
  investor_id?: number; // Added for RPC
  // Additional investor details
  phone?: string;
  dob?: string; // Date of birth
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  company?: string;
  ssn?: string;
  bank?: string;
  routing?: string;
  account?: string;
  account_type?: string;
}

export interface DistributionRequest {
  id: string | number;
  investor_id?: number;
  investor_name: string;
  investor_email: string;
  project_name: string;
  project_id?: string | null;
  total_percentage: number;
  recipients: DistributionRecipient[] | string; // Can be JSON string or array
  message?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
}

export async function fetchDistributionRequests(investorEmail: string): Promise<DistributionRequest[]> {
  try {
    const { data, error } = await supabase
      .from('percentage_distribution_requests')
      .select('*')
      .eq('investor_email', investorEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching distribution requests:', error);
      return [];
    }

    // Parse recipients JSON if stored as JSON
    return (data || []).map((req: any) => ({
      ...req,
      recipients: typeof req.recipients === 'string' ? JSON.parse(req.recipients) : req.recipients,
    })) as DistributionRequest[];
  } catch (err) {
    console.error('Error fetching distribution requests:', err);
    return [];
  }
}

export async function fetchAllDistributionRequests(): Promise<DistributionRequest[]> {
  try {
    const { data, error } = await supabase
      .from('percentage_distribution_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all distribution requests:', error);
      return [];
    }

    // Parse recipients JSON if stored as JSON
    return (data || []).map((req: any) => ({
      ...req,
      recipients: typeof req.recipients === 'string' ? JSON.parse(req.recipients) : req.recipients,
    })) as DistributionRequest[];
  } catch (err) {
    console.error('Error fetching all distribution requests:', err);
    return [];
  }
}

export async function fetchUnviewedDistributionRequestsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('percentage_distribution_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .or('viewed.is.null,viewed.eq.false');

    if (error) {
      console.error('Error fetching unviewed distribution requests count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Error fetching unviewed distribution requests count:', err);
    return 0;
  }
}

export async function markDistributionRequestsAsViewed(requestIds?: (string | number)[]): Promise<void> {
  try {
    if (requestIds && requestIds.length > 0) {
      // Mark specific requests as viewed
      const { error } = await supabase
        .from('percentage_distribution_requests')
        .update({ viewed: true, viewed_at: new Date().toISOString() })
        .in('id', requestIds);
      
      if (error) {
        console.error('Error marking distribution requests as viewed:', error);
        // If viewed column doesn't exist, silently fail
        if (error.message?.includes('column') && error.message?.includes('viewed')) {
          console.warn('viewed column does not exist in percentage_distribution_requests table');
        }
      }
    } else {
      // Mark all pending requests as viewed
      const { error } = await supabase
        .from('percentage_distribution_requests')
        .update({ viewed: true, viewed_at: new Date().toISOString() })
        .eq('status', 'pending')
        .or('viewed.is.null,viewed.eq.false');
      
      if (error) {
        console.error('Error marking all pending distribution requests as viewed:', error);
        // If viewed column doesn't exist, silently fail
        if (error.message?.includes('column') && error.message?.includes('viewed')) {
          console.warn('viewed column does not exist in percentage_distribution_requests table');
        }
      }
    }
  } catch (err) {
    console.error('Error marking distribution requests as viewed:', err);
  }
}

// Profile Edit Requests
export interface ProfileEditRequest {
  id: string | number;
  investor_id?: number;
  investor_email: string;
  investor_name: string;
  request_type: 'personal_info' | 'banking_info';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  current_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null; // New/updated information
  viewed: boolean;
  viewed_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}

export async function createProfileEditRequest(
  investorEmail: string,
  investorName: string,
  requestType: 'personal_info' | 'banking_info',
  currentData: Record<string, unknown>,
  newData: Record<string, unknown>
): Promise<{ success: boolean; data?: ProfileEditRequest; error?: string }> {
  try {
    // Insert without .select() first to avoid triggering SELECT policies
    // Similar to how percentage_distribution_requests handles it
    const { error: insertError } = await supabase
      .from('profile_edit_requests')
      .insert([{
        investor_email: investorEmail,
        investor_name: investorName,
        request_type: requestType,
        current_data: currentData,
        new_data: newData,
        status: 'pending',
        viewed: false
      }]);

    if (insertError) {
      console.error('Error creating profile edit request:', insertError);
      return { success: false, error: insertError.message };
    }

    // Return success without the inserted data to avoid SELECT policy issues
    // The data isn't needed immediately anyway
    return { success: true };
  } catch (err: any) {
    console.error('Error creating profile edit request:', err);
    return { success: false, error: err.message || 'Failed to create edit request' };
  }
}

export async function fetchAllProfileEditRequests(): Promise<ProfileEditRequest[]> {
  try {
    const { data, error } = await supabase
      .from('profile_edit_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profile edit requests:', error);
      return [];
    }

    return (data || []) as ProfileEditRequest[];
  } catch (err) {
    console.error('Error fetching profile edit requests:', err);
    return [];
  }
}

export async function fetchUnviewedProfileEditRequestsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('profile_edit_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .or('viewed.is.null,viewed.eq.false');

    if (error) {
      console.error('Error fetching unviewed profile edit requests count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Error fetching unviewed profile edit requests count:', err);
    return 0;
  }
}

export async function markProfileEditRequestsAsViewed(requestIds?: (string | number)[]): Promise<void> {
  try {
    if (requestIds && requestIds.length > 0) {
      // Mark specific requests as viewed
      const { error } = await supabase
        .from('profile_edit_requests')
        .update({ viewed: true, viewed_at: new Date().toISOString() })
        .in('id', requestIds);
      
      if (error) {
        console.error('Error marking profile edit requests as viewed:', error);
      }
    } else {
      // Mark all pending requests as viewed
      const { error } = await supabase
        .from('profile_edit_requests')
        .update({ viewed: true, viewed_at: new Date().toISOString() })
        .eq('status', 'pending')
        .or('viewed.is.null,viewed.eq.false');
      
      if (error) {
        console.error('Error marking all pending profile edit requests as viewed:', error);
      }
    }
  } catch (err) {
    console.error('Error marking profile edit requests as viewed:', err);
  }
}

// ==================== Bulletin Board / Newsletter ====================

export interface BulletinBoardPost {
  id: number;
  title: string;
  content: string;
  project_id: string | null;
  project_name: string | null;
  author_id: string;
  author_name: string;
  is_pinned: boolean;
  is_important: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBulletinPostData {
  title: string;
  content: string;
  project_id?: string | null;
  project_name?: string | null;
  is_pinned?: boolean;
  is_important?: boolean;
}

// Fetch all bulletin board posts (for investors and admins)
export async function fetchBulletinBoardPosts(projectId?: string | null): Promise<BulletinBoardPost[]> {
  try {
    let query = supabase
      .from('bulletin_board_posts')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    // Filter by project if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bulletin board posts:', error);
      return [];
    }

    return (data || []) as BulletinBoardPost[];
  } catch (err) {
    console.error('Error fetching bulletin board posts:', err);
    return [];
  }
}

// Create a new bulletin board post (admin only)
export async function createBulletinBoardPost(
  postData: CreateBulletinPostData,
  authorId: string,
  authorName: string
): Promise<{ success: boolean; data?: BulletinBoardPost; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('bulletin_board_posts')
      .insert({
        title: postData.title,
        content: postData.content,
        project_id: postData.project_id || null,
        project_name: postData.project_name || null,
        author_id: authorId,
        author_name: authorName,
        is_pinned: postData.is_pinned || false,
        is_important: postData.is_important || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating bulletin board post:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as BulletinBoardPost };
  } catch (err) {
    console.error('Error creating bulletin board post:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// Update a bulletin board post (admin only)
export async function updateBulletinBoardPost(
  postId: number,
  postData: Partial<CreateBulletinPostData>
): Promise<{ success: boolean; data?: BulletinBoardPost; error?: string }> {
  try {
    const updateData: any = {};
    if (postData.title !== undefined) updateData.title = postData.title;
    if (postData.content !== undefined) updateData.content = postData.content;
    if (postData.project_id !== undefined) updateData.project_id = postData.project_id || null;
    if (postData.project_name !== undefined) updateData.project_name = postData.project_name || null;
    if (postData.is_pinned !== undefined) updateData.is_pinned = postData.is_pinned;
    if (postData.is_important !== undefined) updateData.is_important = postData.is_important;

    const { data, error } = await supabase
      .from('bulletin_board_posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      console.error('Error updating bulletin board post:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as BulletinBoardPost };
  } catch (err) {
    console.error('Error updating bulletin board post:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// Delete a bulletin board post (admin only)
export async function deleteBulletinBoardPost(postId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('bulletin_board_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting bulletin board post:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error deleting bulletin board post:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateProfileEditRequestStatus(
  requestId: string | number,
  status: 'approved' | 'rejected' | 'completed',
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: { status: string; admin_notes?: string; updated_at: string } = {
      status,
      updated_at: new Date().toISOString()
    };

    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }

    const { error } = await supabase
      .from('profile_edit_requests')
      .update(updateData)
      .eq('id', requestId);

    if (error) {
      console.error('Error updating profile edit request status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error updating profile edit request status:', err);
    return { success: false, error: err.message || 'Failed to update request status' };
  }
}

export async function sendPasswordSetupEmailsToNewUsers(
  newUserEmails: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Call edge function to create auth users and send password setup emails
    // This edge function should:
    // 1. Create auth.users for each email (using admin API)
    // 2. Send password reset/setup emails to each new user
    const { error } = await supabase.functions.invoke('send-password-setup-emails', {
      body: {
        emails: newUserEmails,
      },
    });

    if (error) {
      console.warn('Password setup email edge function not available:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.warn('Error sending password setup emails (non-critical):', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to send password setup emails';
    return { success: false, error: errorMessage };
  }
}

export async function sendDistributionRequestEmailNotification(
  request: DistributionRequest,
  status: 'approved' | 'rejected',
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Try to call edge function for email notification
    // If the edge function doesn't exist yet, this will fail gracefully
    const { error } = await supabase.functions.invoke('send-distribution-notification', {
      body: {
        request_id: request.id,
        investor_email: request.investor_email,
        investor_name: request.investor_name,
        project_name: request.project_name,
        status: status,
        recipients: request.recipients,
        total_percentage: request.total_percentage,
        admin_notes: adminNotes,
        request_date: request.created_at,
      },
    });

    if (error) {
      // If edge function doesn't exist, log and continue
      console.warn('Email notification edge function not available:', error.message);
      // Don't fail the entire operation if email fails
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.warn('Error sending email notification (non-critical):', err);
    // Don't fail the entire operation if email fails
    return { success: false, error: err instanceof Error ? err.message : 'Email notification failed' };
  }
}

export async function updateDistributionRequestStatus(
  requestId: string | number,
  status: 'approved' | 'rejected',
  adminNotes?: string,
  updatedRecipients?: DistributionRecipient[]
): Promise<{ success: boolean; error?: string; data?: { success: boolean; created_investors?: unknown[]; message?: string } }> {
  try {
    // First, fetch the request to get full details for email
    const { data: requestData, error: fetchError } = await supabase
      .from('percentage_distribution_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError) {
      console.error('Error fetching distribution request:', fetchError);
      return { success: false, error: fetchError.message };
    }

    // If admin provided updated recipients, update the request first
    if (status === 'approved' && updatedRecipients && updatedRecipients.length > 0) {
      const { error: updateError } = await supabase
        .from('percentage_distribution_requests')
        .update({
          recipients: JSON.stringify(updatedRecipients),
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating recipients:', updateError);
        return { success: false, error: updateError.message };
      }
    }

    // If approving, call the RPC function that handles investor creation and distribution
    if (status === 'approved') {
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        'approve_percentage_distribution_with_investor_creation',
        {
          request_id_input: requestId,
          admin_notes_input: adminNotes || null,
        }
      );

      if (rpcError) {
        console.error('Error calling approve_percentage_distribution_with_investor_creation:', rpcError);
        return { success: false, error: rpcError.message };
      }

      // Extract newly created investor emails from RPC result
      const createdInvestors = rpcResult?.created_investors || [];
      const newUserEmails: string[] = [];
      
      if (Array.isArray(createdInvestors)) {
        createdInvestors.forEach((investor: { email?: string }) => {
          if (investor?.email) {
            newUserEmails.push(investor.email);
          }
        });
      }

      // Send password setup emails to newly created users (non-blocking)
      if (newUserEmails.length > 0) {
        sendPasswordSetupEmailsToNewUsers(newUserEmails).catch(err => {
          console.warn('Password setup emails failed (non-critical):', err);
        });
      }

      // Send notification emails to all parties (non-blocking)
      // Use updated recipients if available
      const finalRecipients = updatedRecipients || (
        typeof requestData.recipients === 'string' 
          ? JSON.parse(requestData.recipients) 
          : requestData.recipients
      );
      
      const parsedRequest: DistributionRequest = {
        ...requestData,
        recipients: finalRecipients,
        status: 'approved',
      };
      
      sendDistributionRequestEmailNotification(parsedRequest, 'approved', adminNotes).catch(err => {
        console.warn('Email notification failed (non-critical):', err);
      });

      return { success: true, data: rpcResult };
    }

    // For rejection, just update the status
    const updateData: {
      status: 'approved' | 'rejected';
      updated_at: string;
      admin_notes?: string;
    } = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    const { error } = await supabase
      .from('percentage_distribution_requests')
      .update(updateData)
      .eq('id', requestId);

    if (error) {
      console.error('Error updating distribution request status:', error);
      return { success: false, error: error.message };
    }

    // Send email notification for rejection
    if (requestData) {
      const parsedRequest: DistributionRequest = {
        ...requestData,
        recipients: typeof requestData.recipients === 'string' 
          ? JSON.parse(requestData.recipients) 
          : requestData.recipients,
      };
      
      sendDistributionRequestEmailNotification(parsedRequest, 'rejected', adminNotes).catch(err => {
        console.warn('Email notification failed (non-critical):', err);
      });
    }

    return { success: true };
  } catch (err) {
    console.error('Error updating distribution request status:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to update request status';
    return { success: false, error: errorMessage };
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
  } catch (err) {
    console.error('Error deleting tax document:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete tax document';
    return { success: false, error: errorMessage };
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

// Get investor email from investor_id using get_investor_portfolio
export async function getInvestorEmailById(investorId: number): Promise<string | null> {
  try {
    // Use get_investor_portfolio to get investor email
    const portfolio = await fetchInvestorPortfolio(investorId);
    
    if (portfolio && portfolio.length > 0 && portfolio[0].investor_email) {
      return portfolio[0].investor_email as string;
    }

    return null;
  } catch (err) {
    console.error('Error fetching investor email:', err);
    return null;
  }
}

// New user profile interface matching the RPC return
export interface NewUserProfile {
  user_id: string;
  full_name: string;
  email: string;
  alt_email: string | null;
  phone_number: string | null;
  alt_phone_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  bank: string | null;
  routing: string | null;
  account: string | null;
  account_type: string | null;
  ssn: string | null;
  dob: string | null;
}

// Get new user profile by email
export async function getNewUserProfile(email: string): Promise<NewUserProfile | null> {
  try {
    const { data, error } = await supabase.rpc('get_new_user_profile', {
      email_input: email
    });

    if (error) {
      console.error('Error fetching new user profile:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0] as NewUserProfile;
  } catch (err) {
    console.error('Error fetching new user profile:', err);
    return null;
  }
}

// Get new user profile by investor_id (fetches email first, then calls RPC)
export async function getNewUserProfileByInvestorId(investorId: number): Promise<NewUserProfile | null> {
  try {
    // First, get the investor's email
    const email = await getInvestorEmailById(investorId);
    
    if (!email) {
      console.error('Could not find email for investor ID:', investorId);
      return null;
    }

    // Then, call the RPC with the email
    return await getNewUserProfile(email);
  } catch (err) {
    console.error('Error fetching new user profile by investor ID:', err);
    return null;
  }
}

// Update investor personal info
export async function updateInvestorPersonalInfo(
  email: string,
  updatedInfo: Partial<NewUserProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('update_investor_profile', {
      email_input: email,
      new_account: updatedInfo.account || null,
      new_account_type: updatedInfo.account_type || null,
      new_address: updatedInfo.address || null,
      new_alt_email: updatedInfo.alt_email || null,
      new_alt_phone_number: updatedInfo.alt_phone_number || null,
      new_bank: updatedInfo.bank || null,
      new_city: updatedInfo.city || null,
      new_dob: updatedInfo.dob || null,
      new_full_name: updatedInfo.full_name || null,
      new_phone_number: updatedInfo.phone_number || null,
      new_routing: updatedInfo.routing || null,
      new_ssn: updatedInfo.ssn || null,
      new_state: updatedInfo.state || null,
      new_zip: updatedInfo.zip || null,
    });

    if (error) {
      console.error('Error updating investor personal info:', error);
      return { success: false, error: error.message };
    }

    console.log('Successfully updated investor profile:', data);
    return { success: true };
  } catch (err) {
    console.error('Error updating investor personal info:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to update personal information';
    return { success: false, error: errorMessage };
  }
}
// Update project name (Admin)
export async function adminUpdateProjectName(projectId: string | number, newName: string) {
  const { data, error } = await supabase.rpc('admin_update_project_name', {
    project_id_input: projectId,
    new_project_name_input: newName
  });

  if (error) {
    console.error('Error updating project namee:', error);
    throw error;
  }

  return data;
}

// Track invite sent to investor (update last_invite_sent_at in users table)
export async function updateInviteSentTimestamp(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ last_invite_sent_at: new Date().toISOString() })
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Error updating invite timestamp:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error updating invite timestamp:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to update invite timestamp';
    return { success: false, error: errorMessage };
  }
}

// Check if invite was sent to investor (by email)
export async function checkInviteSentStatus(email: string): Promise<{ sent: boolean; sentAt: string | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('last_invite_sent_at')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      console.error('Error checking invite status:', error);
      return { sent: false, sentAt: null };
    }

    return {
      sent: data?.last_invite_sent_at !== null,
      sentAt: data?.last_invite_sent_at || null,
    };
  } catch (err) {
    console.error('Error checking invite status:', err);
    return { sent: false, sentAt: null };
  }
}

// Check if invite was sent to investor (by investor_id)
export async function checkInviteSentStatusByInvestorId(investorId: number): Promise<{ sent: boolean; sentAt: string | null }> {
  try {
    // First get the email
    const email = await getInvestorEmailById(investorId);
    
    if (!email) {
      return { sent: false, sentAt: null };
    }

    // Then check invite status
    return await checkInviteSentStatus(email);
  } catch (err) {
    console.error('Error checking invite status by investor ID:', err);
    return { sent: false, sentAt: null };
  }
}

// Investment Opportunities API Functions

export interface InvestmentOpportunity {
  id: number;
  title: string;
  description: string;
  project_name?: string | null;
  target_investment_amount?: number | null;
  minimum_investment?: number | null;
  maximum_investment?: number | null;
  investment_type?: string | null;
  location?: string | null;
  expected_return_percentage?: number | null;
  expected_term_months?: number | null;
  risk_level?: string | null;
  status: 'active' | 'inactive' | 'closed' | 'draft';
  is_featured: boolean;
  application_deadline?: string | null;
  project_start_date?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInvestmentOpportunityParams {
  title: string;
  description: string;
  project_name?: string;
  target_investment_amount?: number;
  minimum_investment?: number;
  maximum_investment?: number;
  investment_type?: 'units' | 'amount' | 'percentage';
  location?: string;
  expected_return_percentage?: number;
  expected_term_months?: number;
  risk_level?: 'low' | 'medium' | 'high';
  status?: 'active' | 'inactive' | 'closed' | 'draft';
  is_featured?: boolean;
  application_deadline?: string;
  project_start_date?: string;
}

export interface UpdateInvestmentOpportunityParams extends Partial<CreateInvestmentOpportunityParams> {
  id: number;
}

// Create a new investment opportunity
export async function createInvestmentOpportunity(params: CreateInvestmentOpportunityParams): Promise<{ success: boolean; id?: number; message?: string; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('create_investment_opportunity', {
      p_title: params.title,
      p_description: params.description,
      p_project_name: params.project_name || null,
      p_target_investment_amount: params.target_investment_amount || null,
      p_minimum_investment: params.minimum_investment || null,
      p_maximum_investment: params.maximum_investment || null,
      p_investment_type: params.investment_type || null,
      p_location: params.location || null,
      p_expected_return_percentage: params.expected_return_percentage || null,
      p_expected_term_months: params.expected_term_months || null,
      p_risk_level: params.risk_level || null,
      p_status: params.status || 'active',
      p_is_featured: params.is_featured || false,
      p_application_deadline: params.application_deadline || null,
      p_project_start_date: params.project_start_date || null,
    });

    if (error) {
      console.error('Error creating investment opportunity:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id, message: data?.message || 'Investment opportunity created successfully' };
  } catch (err) {
    console.error('Error creating investment opportunity:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to create investment opportunity';
    return { success: false, error: errorMessage };
  }
}

// Update an investment opportunity
export async function updateInvestmentOpportunity(params: UpdateInvestmentOpportunityParams): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('update_investment_opportunity', {
      p_opportunity_id: params.id,
      p_title: params.title || null,
      p_description: params.description || null,
      p_project_name: params.project_name || null,
      p_target_investment_amount: params.target_investment_amount || null,
      p_minimum_investment: params.minimum_investment || null,
      p_maximum_investment: params.maximum_investment || null,
      p_investment_type: params.investment_type || null,
      p_location: params.location || null,
      p_expected_return_percentage: params.expected_return_percentage || null,
      p_expected_term_months: params.expected_term_months || null,
      p_risk_level: params.risk_level || null,
      p_status: params.status || null,
      p_is_featured: params.is_featured !== undefined ? params.is_featured : null,
      p_application_deadline: params.application_deadline || null,
      p_project_start_date: params.project_start_date || null,
    });

    if (error) {
      console.error('Error updating investment opportunity:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: data?.message || 'Investment opportunity updated successfully' };
  } catch (err) {
    console.error('Error updating investment opportunity:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to update investment opportunity';
    return { success: false, error: errorMessage };
  }
}

// Get all investment opportunities (admin only - includes drafts and inactive)
export async function getAllInvestmentOpportunities(): Promise<InvestmentOpportunity[]> {
  try {
    const { data, error } = await supabase.rpc('get_all_investment_opportunities');

    if (error) {
      console.error('Error fetching investment opportunities (RPC error):', error);
      console.error('Error details:', error.message, error.code, error.details);
      return [];
    }

    console.log('getAllInvestmentOpportunities - Raw RPC response:', data);
    console.log('getAllInvestmentOpportunities - Data length:', data?.length || 0);
    
    return (data || []) as InvestmentOpportunity[];
  } catch (err) {
    console.error('Error fetching investment opportunities (Exception):', err);
    return [];
  }
}

// Get active investment opportunities (for investors)
export async function getActiveInvestmentOpportunities(): Promise<InvestmentOpportunity[]> {
  console.log('getActiveInvestmentOpportunities - Function called');
  try {
    console.log('getActiveInvestmentOpportunities - Calling RPC...');
    const { data, error } = await supabase.rpc('get_active_investment_opportunities');
    
    console.log('getActiveInvestmentOpportunities - RPC call completed');
    console.log('getActiveInvestmentOpportunities - Error:', error);
    console.log('getActiveInvestmentOpportunities - Data:', data);

    if (error) {
      console.error('Error fetching active investment opportunities (RPC error):', error);
      console.error('Error details:', error.message, error.code, error.details, error.hint);
      return [];
    }

    console.log('getActiveInvestmentOpportunities - Raw RPC response:', data);
    console.log('getActiveInvestmentOpportunities - Data length:', data?.length || 0);
    
    return (data || []) as InvestmentOpportunity[];
  } catch (err) {
    console.error('Error fetching active investment opportunities (Exception):', err);
    console.error('Exception details:', err instanceof Error ? err.stack : err);
    return [];
  }
}

// Delete an investment opportunity
export async function deleteInvestmentOpportunity(opportunityId: number): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('delete_investment_opportunity', {
      p_opportunity_id: opportunityId,
    });

    if (error) {
      console.error('Error deleting investment opportunity:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: data?.message || 'Investment opportunity deleted successfully' };
  } catch (err) {
    console.error('Error deleting investment opportunity:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete investment opportunity';
    return { success: false, error: errorMessage };
  }
}

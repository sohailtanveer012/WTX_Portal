# Affiliates Program - Complete Walkthrough

This document provides a detailed step-by-step explanation of how the affiliates/referral program works.

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Step 1: Investor Accesses Affiliates Tab](#step-1-investor-accesses-affiliates-tab)
3. [Step 2: Referral Code Generation](#step-2-referral-code-generation)
4. [Step 3: Investor Shares Referral Link](#step-3-investor-shares-referral-link)
5. [Step 4: Potential Investor Clicks Link](#step-4-potential-investor-clicks-link)
6. [Step 5: Potential Investor Contacts](#step-5-potential-investor-contacts)
7. [Step 6: Tracking & Statistics](#step-6-tracking--statistics)
8. [Database Schema](#database-schema)
9. [Technical Flow Diagram](#technical-flow-diagram)

---

## Overview

The affiliates program allows existing investors to refer new potential investors. The system tracks:
- **Referral clicks** - When someone clicks a referral link
- **Contact submissions** - When someone contacts after clicking
- **Sign-ups** - When someone becomes an active investor (future enhancement)

---

## Step 1: Investor Accesses Affiliates Tab

### What Happens:
1. Investor logs into the portal and navigates to the **"Affiliates"** tab
2. The `Affiliates` component loads and receives the `userProfile` prop

### Code Location:
- **File**: `src/components/Affiliates.tsx`
- **Component**: `Affiliates({ userProfile })`

### Process:
```javascript
// 1. Component fetches investor ID from portfolio
useEffect(() => {
  const portfolio = await fetchInvestorPortfolioByEmail(userProfile.email);
  const investorId = portfolio[0].investor_id;
  setInvestorId(investorId);
}, [userProfile?.email]);
```

### What's Retrieved:
- **Investor ID** - Extracted from the portfolio data using the investor's email
- This ID is used to identify the referrer in all referral records

---

## Step 2: Referral Code Generation

### What Happens:
Once the investor ID is available, the system:
1. Checks if the investor already has a referral code
2. If not, generates a unique referral code
3. Creates a placeholder record in the database

### Code Location:
- **Database Function**: `get_or_create_referral_code()` in `create_referrals_table.sql`
- **API Function**: `getReferralCode()` in `src/api/services/index.ts`

### Process Flow:

#### A. Check for Existing Code
```sql
-- Database checks if investor already has a referral code
SELECT referral_code 
FROM referrals 
WHERE referrer_id = investor_id_input 
LIMIT 1;
```

#### B. Generate New Code (if needed)
```sql
-- Format: REF + 6-digit investor ID + 4-character hash
-- Example: REF000123ABCD
code := 'REF' || LPAD(investor_id::TEXT, 6, '0') || 
         UPPER(SUBSTRING(MD5(investor_id::TEXT || NOW()::TEXT) FROM 1 FOR 4));
```

#### C. Create Placeholder Record
```sql
-- Insert placeholder with status 'pending'
INSERT INTO referrals (referrer_id, referral_code, status)
VALUES (investor_id_input, new_code, 'pending');
```

### Result:
- **Referral Code**: `REF000123ABCD` (example)
- **Referral Link**: `https://yourdomain.com?ref=REF000123ABCD`
- **Status**: `pending` (no one has clicked yet)

---

## Step 3: Investor Shares Referral Link

### What Happens:
The investor can share their referral link in two ways:

### Option A: Copy Link
1. Investor clicks the **copy button** next to the referral link
2. Link is copied to clipboard: `https://yourdomain.com?ref=REF000123ABCD`
3. Investor can paste it anywhere (email, social media, text message, etc.)

### Code Location:
```javascript
// src/components/Affiliates.tsx
const handleCopyCode = () => {
  navigator.clipboard.writeText(affiliateLink);
  setCopiedCode(true); // Shows checkmark for 2 seconds
};
```

### Option B: Send via Email
1. Investor clicks **"Send via Email"** button
2. `ReferralEmailModal` opens
3. Investor enters recipient email address
4. Pre-filled email template opens in their email client

### Code Location:
- **File**: `src/components/ReferralEmailModal.tsx`
- **Email Template** includes:
  - Subject: "Join WTX Energy - Investment Opportunity"
  - Body: Personalized message with referral link
  - Referrer's name

### Email Template Example:
```
Hi there,

I wanted to share an exciting investment opportunity with you through 
WTX Energy, a leading platform for crude oil investments.

I've been investing with them and thought you might be interested. 
You can learn more and get started using my referral link:

https://yourdomain.com?ref=REF000123ABCD

This link will help you get started and I'll be able to track your 
progress. If you have any questions, feel free to reach out!

Best regards,
[Investor Name]
```

---

## Step 4: Potential Investor Clicks Link

### What Happens:
When someone clicks the referral link, multiple things happen automatically:

### A. URL Detection
```javascript
// src/App.tsx - Runs on app load
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref'); // Extracts: "REF000123ABCD"
  
  if (refCode) {
    // Process referral click...
  }
}, []);
```

### B. Track Click in Database
```javascript
// Calls database function to track the click
trackReferralClick(refCode).then((result) => {
  if (result.success) {
    // Click tracked successfully
  }
});
```

### Database Function: `track_referral_click()`
```sql
-- 1. Find referral record by code
SELECT * FROM referrals WHERE referral_code = 'REF000123ABCD';

-- 2. Update status and timestamp
UPDATE referrals
SET status = 'clicked',
    clicked_at = NOW(),
    updated_at = NOW()
WHERE referral_code = 'REF000123ABCD';
```

### C. Store in localStorage
```javascript
// Store referral code for later use (when they contact)
localStorage.setItem('referral_code', refCode);
```

**Why localStorage?**
- The referral code is removed from the URL (to keep it clean)
- User might not contact immediately
- We need to remember which referral they came from when they eventually contact

### D. Clean Up URL
```javascript
// Remove ?ref=CODE from URL
urlParams.delete('ref');
window.history.replaceState({}, '', newUrl);
// URL changes from: yourdomain.com?ref=REF000123ABCD
// To: yourdomain.com
```

### Database Record After Click:
```sql
id: 1
referrer_id: 123
referral_code: REF000123ABCD
referred_email: NULL (not yet provided)
referred_name: NULL (not yet provided)
status: 'clicked' (changed from 'pending')
clicked_at: '2024-01-15 10:30:00'
signed_up_at: NULL
created_at: '2024-01-15 09:00:00'
updated_at: '2024-01-15 10:30:00'
```

---

## Step 5: Potential Investor Contacts

### What Happens:
When the potential investor decides to contact (via "Contact us to get started" button):

### A. ContactModal Opens
```javascript
// src/components/ContactModal.tsx
useEffect(() => {
  if (isOpen) {
    // Check localStorage for referral code
    const storedCode = localStorage.getItem('referral_code');
    if (storedCode) {
      setReferralCode(storedCode); // Found: "REF000123ABCD"
    }
  }
}, [isOpen]);
```

### B. User Fills Contact Form
The form collects:
- Full Name
- Email Address
- Phone Number
- Company Name
- Message

### C. Form Submission
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // If referral code exists, update referral record
  if (referralCode) {
    await updateReferralContact(
      referralCode,        // "REF000123ABCD"
      formData.email,      // "john@example.com"
      formData.name        // "John Doe"
    );
    
    // Remove from localStorage after successful update
    localStorage.removeItem('referral_code');
  }
  
  // Continue with normal contact form submission...
};
```

### Database Function: `update_referral_contact()`
```sql
-- 1. Find referral by code
SELECT * FROM referrals WHERE referral_code = 'REF000123ABCD';

-- 2. Update with contact information
UPDATE referrals
SET referred_email = 'john@example.com',
    referred_name = 'John Doe',
    status = 'signed_up',        -- Changed from 'clicked'
    signed_up_at = NOW(),
    updated_at = NOW()
WHERE referral_code = 'REF000123ABCD';
```

### Database Record After Contact:
```sql
id: 1
referrer_id: 123
referral_code: REF000123ABCD
referred_email: 'john@example.com'  -- ✅ Now populated
referred_name: 'John Doe'            -- ✅ Now populated
status: 'signed_up'                  -- ✅ Changed from 'clicked'
clicked_at: '2024-01-15 10:30:00'
signed_up_at: '2024-01-15 14:45:00'  -- ✅ Now populated
created_at: '2024-01-15 09:00:00'
updated_at: '2024-01-15 14:45:00'
```

---

## Step 6: Tracking & Statistics

### What Happens:
The original investor can view their referral statistics and list of referrals.

### A. Statistics Display
```javascript
// src/components/Affiliates.tsx
const stats = await getReferralStats(investorId);
// Returns:
{
  total_referrals: 5,
  pending: 1,
  clicked: 2,
  signed_up: 1,
  active_investors: 1
}
```

### Database Function: `get_referral_stats()`
```sql
SELECT json_build_object(
  'total_referrals', COUNT(*),
  'pending', COUNT(*) FILTER (WHERE status = 'pending'),
  'clicked', COUNT(*) FILTER (WHERE status = 'clicked'),
  'signed_up', COUNT(*) FILTER (WHERE status = 'signed_up'),
  'active_investors', COUNT(*) FILTER (WHERE status = 'active_investor')
)
FROM referrals
WHERE referrer_id = 123;
```

### B. Referrals List
```javascript
// Fetch all referrals for this investor
const referrals = await getReferrals(investorId);
// Returns array of referral records
```

### Displayed Information:
- **Email** - The referred person's email (if provided)
- **Name** - The referred person's name (if provided)
- **Status** - Badge showing current status:
  - 🟡 `Pending` - Link created but not clicked
  - 🔵 `Clicked` - Link clicked but not contacted
  - 🟣 `Signed Up` - Contacted via form
  - 🟢 `Active` - Became an active investor (future)
- **Clicked At** - When they clicked the link
- **Signed Up At** - When they submitted contact form
- **Created** - When referral link was created

---

## Database Schema

### Table: `referrals`
```sql
CREATE TABLE referrals (
  id BIGSERIAL PRIMARY KEY,
  referrer_id BIGINT NOT NULL,              -- Investor who created the referral
  referral_code VARCHAR(50) UNIQUE NOT NULL, -- Unique code (e.g., REF000123ABCD)
  referred_email VARCHAR(255),              -- Email of person who clicked (filled when they contact)
  referred_name VARCHAR(255),               -- Name of person who clicked (filled when they contact)
  status VARCHAR(50) DEFAULT 'pending',     -- pending, clicked, signed_up, active_investor
  clicked_at TIMESTAMP WITH TIME ZONE,      -- When link was clicked
  signed_up_at TIMESTAMP WITH TIME ZONE,    -- When they contacted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Status Flow:
```
pending → clicked → signed_up → active_investor
  ↓         ↓          ↓              ↓
Created   Clicked   Contacted    Invested
```

---

## Technical Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. INVESTOR ACCESSES AFFILIATES TAB                         │
│    - Fetches investor_id from portfolio                     │
│    - Calls get_or_create_referral_code(investor_id)        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. REFERRAL CODE GENERATED                                   │
│    - Code: REF000123ABCD                                    │
│    - Link: yourdomain.com?ref=REF000123ABCD                 │
│    - Status: 'pending'                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. INVESTOR SHARES LINK                                     │
│    Option A: Copy link → Paste anywhere                    │
│    Option B: Send via email → Opens email client            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. POTENTIAL INVESTOR CLICKS LINK                           │
│    - URL: yourdomain.com?ref=REF000123ABCD                  │
│    - App.tsx detects ?ref parameter                        │
│    - Calls track_referral_click(code)                      │
│    - Updates: status='clicked', clicked_at=NOW()           │
│    - Stores code in localStorage                            │
│    - Removes ?ref from URL                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. POTENTIAL INVESTOR CONTACTS                              │
│    - Opens ContactModal                                     │
│    - Reads referral_code from localStorage                  │
│    - User fills form (name, email, etc.)                    │
│    - On submit: calls update_referral_contact()              │
│    - Updates: email, name, status='signed_up',             │
│               signed_up_at=NOW()                            │
│    - Removes code from localStorage                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. INVESTOR VIEWS STATISTICS                                │
│    - Calls get_referral_stats(investor_id)                  │
│    - Displays: Total, Pending, Clicked, Signed Up, Active   │
│    - Calls get_referrals(investor_id)                       │
│    - Shows table of all referrals with details             │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Functions Summary

### Database Functions (SQL):
1. **`generate_referral_code(investor_id)`** - Generates unique code
2. **`get_or_create_referral_code(investor_id)`** - Gets existing or creates new code
3. **`track_referral_click(code)`** - Updates status to 'clicked'
4. **`update_referral_contact(code, email, name)`** - Updates with contact info
5. **`get_referral_stats(investor_id)`** - Returns statistics

### API Functions (TypeScript):
1. **`getReferralCode(investorId)`** - Gets or creates referral code
2. **`getReferralStats(investorId)`** - Fetches statistics
3. **`getReferrals(investorId)`** - Fetches all referrals
4. **`trackReferralClick(code)`** - Tracks click
5. **`updateReferralContact(code, email, name)`** - Updates contact info

---

## Future Enhancements

1. **Active Investor Status** - Automatically update status to 'active_investor' when they make their first investment
2. **Referral Rewards** - Track commissions or rewards for successful referrals
3. **Email Integration** - Send emails directly via Supabase Edge Function instead of mailto
4. **Analytics Dashboard** - Charts showing referral performance over time
5. **Referral Expiration** - Set expiration dates for referral links

---

## Testing Checklist

- [ ] Investor can access Affiliates tab
- [ ] Referral code is generated correctly
- [ ] Link can be copied to clipboard
- [ ] Email modal opens with pre-filled template
- [ ] Clicking referral link tracks the click
- [ ] Referral code is stored in localStorage
- [ ] URL is cleaned (ref parameter removed)
- [ ] Contact form reads referral code from localStorage
- [ ] Contact submission updates referral record
- [ ] Statistics display correctly
- [ ] Referrals list shows all referrals with correct status

---

## Troubleshooting

### Issue: Referral code not generating
- **Check**: Investor ID exists in portfolio
- **Check**: Database function `get_or_create_referral_code` exists
- **Check**: Database connection

### Issue: Click not being tracked
- **Check**: URL parameter `?ref=CODE` is present
- **Check**: Database function `track_referral_click` exists
- **Check**: Browser console for errors

### Issue: Contact not updating referral
- **Check**: localStorage contains 'referral_code'
- **Check**: Database function `update_referral_contact` exists
- **Check**: Form submission is calling the update function

---

This completes the detailed walkthrough of the Affiliates Program! 🎉


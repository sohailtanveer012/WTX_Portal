-- ============================================================
-- 1. REFERRALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
  id BIGSERIAL PRIMARY KEY,
  referrer_id BIGINT NOT NULL REFERENCES "Investors"(id) ON DELETE CASCADE,
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  referred_email VARCHAR(255),
  referred_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, clicked, submitted, active_investor
  clicked_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. REFERRAL SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS referral_submissions (
  id BIGSERIAL PRIMARY KEY,
  referral_id BIGINT NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  referral_code VARCHAR(50) NOT NULL,
  referrer_id BIGINT NOT NULL REFERENCES "Investors"(id) ON DELETE CASCADE,

  -- Denormalized referrer info
  referrer_name VARCHAR(255),
  referrer_email VARCHAR(255),

  -- New potential investor details
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100),

  -- Investment details
  investment_amount DECIMAL(15, 2),
  investment_interest TEXT,
  preferred_contact_method VARCHAR(50),
  message TEXT,

  -- Admin review fields
  status VARCHAR(50) DEFAULT 'pending',
  viewed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_referral_submissions_referral_id ON referral_submissions(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_submissions_referral_code ON referral_submissions(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_submissions_referrer_id ON referral_submissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_submissions_status ON referral_submissions(status);
CREATE INDEX IF NOT EXISTS idx_referral_submissions_viewed ON referral_submissions(viewed);
CREATE INDEX IF NOT EXISTS idx_referral_submissions_created_at ON referral_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- ============================================================
-- 4. FUNCTION — Generate Referral Code
-- ============================================================
CREATE OR REPLACE FUNCTION generate_referral_code(investor_id BIGINT)
RETURNS VARCHAR(50) AS $$
DECLARE
  code VARCHAR(50);
  exists_check BOOLEAN;
BEGIN
  code := 'REF' || LPAD(investor_id::TEXT, 6, '0')
          || UPPER(SUBSTRING(MD5(investor_id::TEXT || NOW()::TEXT) FROM 1 FOR 4));

  SELECT EXISTS(SELECT 1 FROM referrals WHERE referral_code = code)
  INTO exists_check;

  IF exists_check THEN
    code := code || UPPER(SUBSTRING(MD5(NOW()::TEXT) FROM 1 FOR 4));
  END IF;

  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 5. FUNCTION — Get or Create Referral Code
-- ============================================================
CREATE OR REPLACE FUNCTION get_or_create_referral_code(investor_id_input BIGINT)
RETURNS VARCHAR(50) AS $$
DECLARE
  existing_code VARCHAR(50);
  new_code VARCHAR(50);
BEGIN
  SELECT referral_code INTO existing_code
  FROM referrals
  WHERE referrer_id = investor_id_input
  LIMIT 1;

  IF existing_code IS NOT NULL THEN
    RETURN existing_code;
  END IF;

  new_code := generate_referral_code(investor_id_input);

  INSERT INTO referrals (referrer_id, referral_code, status)
  VALUES (investor_id_input, new_code, 'pending')
  ON CONFLICT (referral_code) DO NOTHING;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 6. FUNCTION — Track Referral Click
-- ============================================================
CREATE OR REPLACE FUNCTION track_referral_click(referral_code_input VARCHAR(50))
RETURNS JSON AS $$
DECLARE
  referral_record RECORD;
BEGIN
  SELECT * INTO referral_record
  FROM referrals
  WHERE referral_code = referral_code_input;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid referral code');
  END IF;

  IF referral_record.clicked_at IS NULL THEN
    UPDATE referrals
    SET status = 'clicked',
        clicked_at = NOW(),
        updated_at = NOW()
    WHERE referral_code = referral_code_input;
  END IF;

  RETURN json_build_object(
    'success', true,
    'referrer_id', referral_record.referrer_id,
    'referral_code', referral_record.referral_code
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 7. FUNCTION — Referral Stats for an Investor
-- ============================================================
CREATE OR REPLACE FUNCTION get_referral_stats(investor_id_input BIGINT)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_referrals', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'clicked', COUNT(*) FILTER (WHERE status = 'clicked'),
    'submitted', COUNT(*) FILTER (WHERE status = 'submitted'),
    'active_investors', COUNT(*) FILTER (WHERE status = 'active_investor')
  ) INTO stats
  FROM referrals
  WHERE referrer_id = investor_id_input;

  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 8. FUNCTION — Update Referral Contact
-- ============================================================
CREATE OR REPLACE FUNCTION update_referral_contact(
  referral_code_input VARCHAR(50),
  referred_email_input VARCHAR(255),
  referred_name_input VARCHAR(255)
)
RETURNS JSON AS $$
DECLARE
  referral_record RECORD;
BEGIN
  SELECT * INTO referral_record
  FROM referrals
  WHERE referral_code = referral_code_input;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid referral code');
  END IF;

  UPDATE referrals
  SET referred_email = referred_email_input,
      referred_name = referred_name_input,
      status = 'signed_up',
      updated_at = NOW()
  WHERE referral_code = referral_code_input;

  RETURN json_build_object(
    'success', true,
    'referrer_id', referral_record.referrer_id,
    'referral_code', referral_code_input
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 9. FUNCTION — Submit Referral Form (Full Lead Info)
-- ============================================================
CREATE OR REPLACE FUNCTION submit_referral_form(
  referral_code_input VARCHAR(50),
  full_name_input VARCHAR(255),
  email_input VARCHAR(255),
  phone_input VARCHAR(50) DEFAULT NULL,
  company_input VARCHAR(255) DEFAULT NULL,
  address_input TEXT DEFAULT NULL,
  city_input VARCHAR(100) DEFAULT NULL,
  state_input VARCHAR(100) DEFAULT NULL,
  zip_code_input VARCHAR(20) DEFAULT NULL,
  country_input VARCHAR(100) DEFAULT NULL,
  investment_amount_input DECIMAL(15, 2) DEFAULT NULL,
  investment_interest_input TEXT DEFAULT NULL,
  preferred_contact_method_input VARCHAR(50) DEFAULT 'email',
  message_input TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  referral_record RECORD;
  referrer_info RECORD;
  submission_id BIGINT;
BEGIN
  SELECT * INTO referral_record
  FROM referrals
  WHERE referral_code = referral_code_input;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid referral code');
  END IF;

  SELECT "Investor_name", "Investor_email"
  INTO referrer_info
  FROM "Investors"
  WHERE id = referral_record.referrer_id;

  INSERT INTO referral_submissions (
    referral_id, referral_code, referrer_id,
    referrer_name, referrer_email,
    full_name, email, phone, company, address,
    city, state, zip_code, country,
    investment_amount, investment_interest,
    preferred_contact_method, message, status
  )
  VALUES (
    referral_record.id,
    referral_code_input,
    referral_record.referrer_id,
    referrer_info."Investor_name",
    referrer_info."Investor_email",
    full_name_input,
    email_input,
    phone_input,
    company_input,
    address_input,
    city_input,
    state_input,
    zip_code_input,
    country_input,
    investment_amount_input,
    investment_interest_input,
    preferred_contact_method_input,
    message_input,
    'pending'
  )
  RETURNING id INTO submission_id;

  UPDATE referrals
  SET referred_email = email_input,
      referred_name = full_name_input,
      status = 'submitted',
      submitted_at = NOW(),
      updated_at = NOW()
  WHERE referral_code = referral_code_input;

  RETURN json_build_object(
    'success', true,
    'submission_id', submission_id,
    'referrer_id', referral_record.referrer_id,
    'referral_code', referral_code_input
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 10. ADMIN — Get Referral Submissions (Paginated)
-- ============================================================
CREATE OR REPLACE FUNCTION get_referral_submissions(
  limit_count INTEGER DEFAULT 100,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  referral_id BIGINT,
  referral_code VARCHAR(50),
  referrer_id BIGINT,
  referrer_name VARCHAR(255),
  referrer_email VARCHAR(255),
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  investment_amount DECIMAL(15, 2),
  investment_interest TEXT,
  preferred_contact_method VARCHAR(50),
  message TEXT,
  status VARCHAR(50),
  viewed BOOLEAN,
  viewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rs.id, rs.referral_id, rs.referral_code, rs.referrer_id,
    rs.referrer_name, rs.referrer_email,
    rs.full_name, rs.email, rs.phone, rs.company, rs.address,
    rs.city, rs.state, rs.zip_code, rs.country,
    rs.investment_amount, rs.investment_interest,
    rs.preferred_contact_method, rs.message,
    rs.status, rs.viewed, rs.viewed_at, rs.admin_notes,
    rs.created_at, rs.updated_at
  FROM referral_submissions rs
  ORDER BY rs.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 11. ADMIN — Count Unviewed Submissions
-- ============================================================
CREATE OR REPLACE FUNCTION get_unviewed_referral_submissions_count()
RETURNS INTEGER AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_result
  FROM referral_submissions
  WHERE viewed = FALSE;

  RETURN count_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 12. ADMIN — Mark Submission as Viewed
-- ============================================================
CREATE OR REPLACE FUNCTION mark_referral_submission_viewed(submission_id_input BIGINT)
RETURNS JSON AS $$
BEGIN
  UPDATE referral_submissions
  SET viewed = TRUE,
      viewed_at = NOW(),
      updated_at = NOW()
  WHERE id = submission_id_input;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Submission not found');
  END IF;

  RETURN json_build_object('success', true, 'submission_id', submission_id_input);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 13. INVESTOR — Get Referrals with Submission Status
-- ============================================================
CREATE OR REPLACE FUNCTION get_referrals_with_submission_status(investor_id_input BIGINT)
RETURNS TABLE (
  id BIGINT,
  referrer_id BIGINT,
  referral_code VARCHAR(50),
  referred_email VARCHAR(255),
  referred_name VARCHAR(255),
  status VARCHAR(50),
  clicked_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  submission_status VARCHAR(50),
  submission_created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.referrer_id,
    r.referral_code,
    r.referred_email,
    r.referred_name,
    r.status,
    r.clicked_at,
    r.submitted_at,
    r.created_at,
    r.updated_at,
    COALESCE(rs.status, NULL) AS submission_status,
    rs.created_at AS submission_created_at
  FROM referrals r
  LEFT JOIN referral_submissions rs ON r.id = rs.referral_id
  WHERE r.referrer_id = investor_id_input
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql;

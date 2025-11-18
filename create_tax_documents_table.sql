-- ============================================================
-- TAX DOCUMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tax_documents (
  id BIGSERIAL PRIMARY KEY,
  investor_id BIGINT NOT NULL REFERENCES "Investors"(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- '1099', 'tax_example', 'other'
  year VARCHAR(4) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_size BIGINT,
  mime_type VARCHAR(100),
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tax_documents_investor ON tax_documents(investor_id);
CREATE INDEX IF NOT EXISTS idx_tax_documents_year ON tax_documents(year);
CREATE INDEX IF NOT EXISTS idx_tax_documents_type ON tax_documents(document_type);

-- ============================================================
-- FUNCTION — Get Tax Documents for Investor
-- ============================================================
CREATE OR REPLACE FUNCTION get_tax_documents(investor_id_input BIGINT)
RETURNS TABLE (
  id BIGINT,
  investor_id BIGINT,
  document_type VARCHAR(50),
  year VARCHAR(4),
  file_name VARCHAR(255),
  file_path TEXT,
  file_url TEXT,
  file_size BIGINT,
  mime_type VARCHAR(100),
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    td.id,
    td.investor_id,
    td.document_type,
    td.year,
    td.file_name,
    td.file_path,
    td.file_url,
    td.file_size,
    td.mime_type,
    td.description,
    td.uploaded_at,
    td.created_at
  FROM tax_documents td
  WHERE td.investor_id = investor_id_input
  ORDER BY td.year DESC, td.uploaded_at DESC;
END;
$$ LANGUAGE plpgsql;


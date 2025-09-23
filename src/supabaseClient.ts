import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xexwnpzgoovowmvdjzfg.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhleHducHpnb292b3dtdmRqemZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMjM5NTgsImV4cCI6MjA2Mzg5OTk1OH0.oBJxZC9r3Z2PM2IjZEDxvWBw7urzIn8VNa4gYVev9x0'; // Replace with your anon public key

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
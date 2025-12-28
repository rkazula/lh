import { vi } from 'vitest';

// Mock Environment
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'mock-anon';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service';
process.env.P24_MERCHANT_ID = '123';
process.env.P24_POS_ID = '123';
process.env.P24_CRC = 'mock';
process.env.P24_API_KEY = 'mock';

// Mock Supabase
vi.mock('../netlify/lib/supabase', () => ({
  getSupabaseAdmin: vi.fn(),
  getSupabaseAnon: vi.fn(),
}));
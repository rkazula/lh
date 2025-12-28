import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  P24_MERCHANT_ID: z.string().transform(Number),
  P24_POS_ID: z.string().transform(Number),
  P24_CRC: z.string().min(1),
  P24_API_KEY: z.string().min(1),
  P24_ENV: z.enum(['sandbox', 'production']).default('sandbox'),
  APP_ORIGIN: z.string().url().default('http://localhost:5173'),
});

/**
 * Parses and validates environment variables.
 * In a real app, this might cache the result.
 */
export function getEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}
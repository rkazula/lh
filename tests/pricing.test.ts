import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateOrderQuote } from '../netlify/lib/domain/pricing';
import * as supabaseLib from '../netlify/lib/supabase';

// Mock data
const MOCK_VARIANTS = [
  {
    id: 'var_1',
    sku: 'TSHIRT-S',
    price_delta_gross: 0,
    product: { id: 'prod_1', name: 'T-Shirt', price_gross: 10000 }, // 100 PLN
  },
  {
    id: 'var_2',
    sku: 'HOODIE-XL',
    price_delta_gross: 2000, // +20 PLN
    product: { id: 'prod_2', name: 'Hoodie', price_gross: 20000 }, // 200 PLN
  },
];

describe('calculateOrderQuote', () => {
  beforeEach(() => {
    // Mock Supabase Chain
    const mockSelect = vi.fn().mockResolvedValue({ data: MOCK_VARIANTS, error: null });
    const mockIn = vi.fn().mockReturnValue({ eq: mockSelect });
    const mockFrom = vi.fn().mockReturnValue({ select: mockIn });
    
    (supabaseLib.getSupabaseAdmin as any).mockReturnValue({
      from: mockFrom,
    });
  });

  it('calculates correct totals for simple items', async () => {
    const quote = await calculateOrderQuote([
      { variant_id: 'var_1', quantity: 2 }, // 2 * 100 = 200
    ]);

    expect(quote.subtotal_gross).toBe(20000);
    expect(quote.total_gross).toBe(20000 + 1500); // + shipping
    expect(quote.items).toHaveLength(1);
    expect(quote.items[0].unit_gross).toBe(10000);
  });

  it('applies percentage discount', async () => {
    const quote = await calculateOrderQuote(
      [{ variant_id: 'var_1', quantity: 1 }], 
      'HATERS10'
    );
    // 100 - 10% = 90. Shipping +15. Total 105.
    expect(quote.subtotal_gross).toBe(10000);
    expect(quote.discount_gross).toBe(1000);
    expect(quote.total_gross).toBe(10500);
  });

  it('calculates complex item with delta price', async () => {
    const quote = await calculateOrderQuote([
      { variant_id: 'var_2', quantity: 1 }, 
    ]);
    // Base 200 + Delta 20 = 220.
    expect(quote.items[0].unit_gross).toBe(22000);
    expect(quote.subtotal_gross).toBe(22000);
  });
  
  it('gives free shipping over 300 PLN', async () => {
     const quote = await calculateOrderQuote([
      { variant_id: 'var_2', quantity: 2 }, // 440 PLN
    ]);
    expect(quote.subtotal_gross).toBe(44000);
    expect(quote.shipping_gross).toBe(0);
    expect(quote.total_gross).toBe(44000);
  });
});
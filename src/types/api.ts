import { z } from 'zod';

export const VariantSchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  size: z.string(),
  color: z.string(),
  price_delta_gross: z.number(),
  active: z.boolean(),
});

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  price_gross: z.number(),
  active: z.boolean(),
  variant: z.array(VariantSchema).optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type Variant = z.infer<typeof VariantSchema>;

export const CartQuoteSchema = z.object({
  subtotal_gross: z.number(),
  discount_gross: z.number(),
  shipping_gross: z.number(),
  tax_gross: z.number(),
  total_gross: z.number(),
  currency: z.literal('PLN'),
  items: z.array(z.object({
    variant_id: z.string(),
    unit_gross: z.number(),
    total_gross: z.number(),
    quantity: z.number(),
  }))
});

export type CartQuote = z.infer<typeof CartQuoteSchema>;

export interface CheckoutResponse {
  orderId: string;
  paymentUrl: string;
}

// --- Pickup Point Types ---
export const PickupPointSchema = z.object({
  provider: z.enum(['INPOST', 'DPD']),
  id: z.string(),
  name: z.string().optional(),
  address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
  }),
  lat: z.number().optional(),
  lng: z.number().optional(),
  type: z.enum(['LOCKER', 'POINT']).optional(),
});

export type PickupPoint = z.infer<typeof PickupPointSchema>;
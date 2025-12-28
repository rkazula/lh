import { getSupabaseAdmin } from '../supabase';

export interface PricingItem {
  variant_id: string;
  quantity: number;
}

export interface CalculatedOrder {
  subtotal_gross: number;
  discount_gross: number;
  shipping_gross: number;
  tax_gross: number;
  total_gross: number;
  currency: 'PLN';
  items: Array<{
    variant_id: string;
    product_id: string;
    name: string;
    sku: string;
    unit_gross: number;
    total_gross: number;
    quantity: number;
  }>;
}

// Fixed shipping cost for MVP (15.00 PLN)
const FLAT_SHIPPING_COST = 1500;
const GLOBAL_VAT_RATE = 0.23;

export async function calculateOrderQuote(
  items: PricingItem[],
  discountCode?: string
): Promise<CalculatedOrder> {
  const supabase = getSupabaseAdmin();

  // 1. Fetch Variants and Products
  const variantIds = items.map((i) => i.variant_id);
  const { data: variants, error } = await supabase
    .from('variant')
    .select(`
      id, sku, price_delta_gross, product_id,
      product:product (id, name, price_gross)
    `)
    .in('id', variantIds)
    .eq('active', true);

  if (error || !variants) throw new Error('Failed to fetch product data');

  // 2. Map and Calculate Line Items
  const calculatedItems = items.map((item) => {
    const variant = variants.find((v: any) => v.id === item.variant_id);
    if (!variant) throw new Error(`Variant ${item.variant_id} not found or inactive`);

    const basePrice = variant.product.price_gross;
    const delta = variant.price_delta_gross || 0;
    const unitGross = basePrice + delta;

    return {
      variant_id: variant.id,
      product_id: variant.product.id,
      name: `${variant.product.name} (${variant.sku})`,
      sku: variant.sku,
      unit_gross: unitGross,
      quantity: item.quantity,
      total_gross: unitGross * item.quantity,
    };
  });

  // 3. Subtotal
  const subtotalGross = calculatedItems.reduce((acc, curr) => acc + curr.total_gross, 0);

  // 4. Discounts (Hardcoded for MVP/Seed)
  let discountGross = 0;
  if (discountCode) {
    if (discountCode.toUpperCase() === 'HATERS10') {
      discountGross = Math.round(subtotalGross * 0.10);
    } else if (discountCode.toUpperCase() === 'LOCAL25') {
      discountGross = 2500; // 25 PLN
    } else {
        // In real app: verify DB
    }
  }
  // Ensure we don't discount below 0
  discountGross = Math.min(discountGross, subtotalGross);

  // 5. Shipping
  const shippingGross = subtotalGross > 30000 ? 0 : FLAT_SHIPPING_COST; // Free shipping over 300 PLN

  // 6. Total
  const totalGross = subtotalGross - discountGross + shippingGross;

  // 7. Tax (Assumption: Prices include VAT)
  // Tax = Total / (1 + Rate) * Rate
  const taxGross = Math.round((totalGross * GLOBAL_VAT_RATE) / (1 + GLOBAL_VAT_RATE));

  return {
    subtotal_gross: subtotalGross,
    discount_gross: discountGross,
    shipping_gross: shippingGross,
    tax_gross: taxGross,
    total_gross: totalGross,
    currency: 'PLN',
    items: calculatedItems,
  };
}
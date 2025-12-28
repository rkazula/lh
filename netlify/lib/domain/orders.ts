import { getSupabaseAdmin } from '../supabase';
import { CalculatedOrder } from './pricing';
import { reserveStock } from './inventory';

interface CreateOrderParams {
  calculated: CalculatedOrder;
  email: string;
  phone: string;
  fullName: string;
  address: any;
  shippingMethod: string;
  pickupPoint?: any;
}

export async function createOrder(params: CreateOrderParams) {
  const supabase = getSupabaseAdmin();
  
  // 1. Create DB Entry
  const { data: order, error } = await supabase
    .from('order')
    .insert({
      email: params.email,
      phone: params.phone,
      customer_name: params.fullName,
      address: params.address,
      shipping_method: params.shippingMethod,
      pickup_point: params.pickupPoint,
      
      subtotal_gross: params.calculated.subtotal_gross,
      discount_gross: params.calculated.discount_gross,
      shipping_gross: params.calculated.shipping_gross,
      tax_gross: params.calculated.tax_gross,
      total_gross: params.calculated.total_gross,
      currency: params.calculated.currency,
      
      status: 'PENDING_PAYMENT',
      payment_provider: 'P24'
    })
    .select()
    .single();

  if (error || !order) throw new Error('Failed to create order record: ' + error?.message);

  // 2. Create Items
  const itemsPayload = params.calculated.items.map(item => ({
    order_id: order.id,
    variant_id: item.variant_id,
    name_snapshot: item.name,
    sku_snapshot: item.sku,
    qty: item.quantity,
    unit_gross: item.unit_gross,
    line_gross: item.total_gross
  }));

  const { error: itemsError } = await supabase.from('order_item').insert(itemsPayload);
  if (itemsError) throw new Error('Failed to create order items');

  // 3. Reserve Stock
  try {
    const stockReservationItems = params.calculated.items.map(i => ({
        variant_id: i.variant_id,
        quantity: i.quantity
    }));
    await reserveStock(stockReservationItems, order.id);
  } catch (e) {
    // Rollback order if stock fails
    await supabase.from('order').delete().eq('id', order.id);
    throw e;
  }

  return order;
}
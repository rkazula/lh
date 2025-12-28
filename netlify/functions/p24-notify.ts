import { Handler } from '@netlify/functions';
import { verifyNotification } from '../lib/integrations/p24';
import { captureStock } from '../lib/domain/inventory';
import { getSupabaseAdmin } from '../lib/supabase';
import { errorResponse } from '../lib/http';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const body = JSON.parse(event.body || '{}');
    
    // 1. Verify Signature
    const verification = await verifyNotification(body);
    
    if (!verification) {
      // It's crucial to return 200 to P24 even if logic fails, but for signature fail we might return 400
      console.error('Invalid P24 Signature');
      return { statusCode: 400, body: 'Invalid Signature' };
    }

    const { sessionId } = verification; // sessionId === order.id
    const supabase = getSupabaseAdmin();

    // 2. Get Order
    const { data: order } = await supabase
        .from('order')
        .select('*, order_item(*)')
        .eq('id', sessionId)
        .single();

    if (!order) return { statusCode: 404, body: 'Order not found' };
    if (order.status === 'PAID') return { statusCode: 200, body: 'OK' }; // Idempotency

    // 3. Mark as Paid
    await supabase
        .from('order')
        .update({ status: 'PAID', payment_ref: body.orderId }) // body.orderId is P24's ref
        .eq('id', sessionId);

    // 4. Capture Stock (Convert reservation to permanent deduction)
    const stockItems = order.order_item.map((item: any) => ({
        variant_id: item.variant_id,
        quantity: item.qty
    }));
    await captureStock(stockItems);

    return { statusCode: 200, body: 'OK' };

  } catch (error) {
    console.error('Webhook processing failed', error);
    // Return 500 so P24 retries later
    return errorResponse(error);
  }
};
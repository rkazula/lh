import { Handler } from '@netlify/functions';
import { getSupabaseAdmin } from '../lib/supabase';
import { requireAdmin } from '../lib/admin-auth';
import { jsonResponse, errorResponse } from '../lib/http';
import { z } from 'zod';

const adjustSchema = z.object({
  variantId: z.string().uuid(),
  delta: z.number(),
  reason: z.string().min(3)
});

export const handler: Handler = async (event) => {
  try {
    // 1. Auth Guard
    const adminUser = await requireAdmin(event.headers);
    const supabase = getSupabaseAdmin();

    // 2. GET: List Inventory
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('variant')
        .select(`
            id:id, sku, size, color, active,
            product:product (name),
            stock_item (on_hand, reserved, low_stock_threshold)
        `);
      
      if (error) throw error;

      // Flatten structure for easier frontend consumption
      const flat = data.map((v: any) => ({
          variant_id: v.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          active: v.active,
          product_name: v.product?.name,
          on_hand: v.stock_item?.[0]?.on_hand || 0,
          reserved: v.stock_item?.[0]?.reserved || 0,
          low_stock_threshold: v.stock_item?.[0]?.low_stock_threshold || 5
      }));

      return jsonResponse(200, flat);
    }

    // 3. POST: Adjust Stock
    if (event.httpMethod === 'POST') {
       const body = JSON.parse(event.body || '{}');
       const { variantId, delta, reason } = adjustSchema.parse(body);

       // Transactional Logic (using stock_item directly, RPC is better but we use strict update logic)
       // Get current
       const { data: currentStock } = await supabase.from('stock_item').select('on_hand').eq('variant_id', variantId).single();
       if (!currentStock) throw new Error('Stock item not found');

       const newOnHand = Math.max(0, currentStock.on_hand + delta);

       // Update
       const { error: updateError } = await supabase
         .from('stock_item')
         .update({ on_hand: newOnHand })
         .eq('variant_id', variantId);
       
       if (updateError) throw updateError;

       // Log Movement
       await supabase.from('stock_movements').insert({
           variant_id: variantId,
           quantity: delta,
           reason: `ADMIN_ADJUST: ${reason}`,
           meta: { admin_id: adminUser.id }
       });

       return jsonResponse(200, { success: true, new_on_hand: newOnHand });
    }

    return jsonResponse(405, { error: 'Method Not Allowed' });

  } catch (error: any) {
    if (error.message.includes('Forbidden')) return jsonResponse(403, { error: error.message });
    if (error.message.includes('Invalid Token')) return jsonResponse(401, { error: error.message });
    return errorResponse(error);
  }
};
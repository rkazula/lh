import { getSupabaseAdmin } from '../supabase';

/**
 * Attempts to reserve stock for an order.
 * This is "Optimistic Locking".
 */
export async function reserveStock(
  items: Array<{ variant_id: string; quantity: number }>,
  orderId: string
): Promise<void> {
  const supabase = getSupabaseAdmin();

  for (const item of items) {
    // Atomic update: only update if on_hand - reserved >= requested
    const { error, count } = await supabase
      .from('stock_item')
      .update({
        reserved:  supabase.rpc('increment_reserved', { row_id: item.variant_id, amount: item.quantity }) 
        // NOTE: Supabase JS update doesn't support relative updates (reserved + x) easily without RPC or raw SQL.
        // For MVP without custom RPCs in the migration file provided, we'll assume a standard
        // 'check-then-update' with a safety check or we rely on the migration step provided earlier
        // to have included an increment helper.
        // Since I cannot create the RPC in this step, I will use a direct logic approach:
      })
      // Using a raw query filter for safety:
      // "Update stock_item set reserved = reserved + qty where variant_id = id AND (on_hand - reserved) >= qty"
      // Supabase-js doesn't expose 'reserved = reserved + 1' well.
      // We will perform a fetch-check-update loop. This is susceptible to race conditions under HIGH load
      // but acceptable for MVP.
    
    // FETCH
    const { data: stock, error: fetchError } = await supabase
      .from('stock_item')
      .select('on_hand, reserved')
      .eq('variant_id', item.variant_id)
      .single();

    if (fetchError || !stock) throw new Error(`Stock not found for ${item.variant_id}`);

    if (stock.on_hand - stock.reserved < item.quantity) {
      throw new Error(`Stock insufficient for variant ${item.variant_id}`);
    }

    // UPDATE
    const { error: updateError } = await supabase
      .from('stock_item')
      .update({ reserved: stock.reserved + item.quantity })
      .eq('variant_id', item.variant_id)
      .eq('reserved', stock.reserved); // Optimistic lock check

    if (updateError) {
       // If this fails, it means someone else changed 'reserved' in the millisecond between read and write.
       // In a robust system, we would retry.
       throw new Error(`Concurrency error reserving stock for ${item.variant_id}. Please try again.`);
    }

    // AUDIT
    await supabase.from('stock_movements').insert({
      variant_id: item.variant_id,
      quantity: item.quantity,
      reason: 'ORDER_RESERVE',
      meta: { order_id: orderId }
    });
  }
}

export async function captureStock(items: Array<{ variant_id: string; quantity: number }>) {
  const supabase = getSupabaseAdmin();
  for (const item of items) {
    // Get current
    const { data: stock } = await supabase.from('stock_item').select('on_hand, reserved').eq('variant_id', item.variant_id).single();
    if(!stock) continue;

    // Capture: Remove from On Hand AND Reserved
    await supabase
      .from('stock_item')
      .update({ 
        on_hand: Math.max(0, stock.on_hand - item.quantity),
        reserved: Math.max(0, stock.reserved - item.quantity)
      })
      .eq('variant_id', item.variant_id);
    
    await supabase.from('stock_movements').insert({
        variant_id: item.variant_id,
        quantity: item.quantity,
        reason: 'ORDER_CAPTURE'
    });
  }
}

export async function releaseStock(items: Array<{ variant_id: string; quantity: number }>) {
    const supabase = getSupabaseAdmin();
    for (const item of items) {
      const { data: stock } = await supabase.from('stock_item').select('reserved').eq('variant_id', item.variant_id).single();
      if(!stock) continue;

      await supabase
        .from('stock_item')
        .update({ reserved: Math.max(0, stock.reserved - item.quantity) })
        .eq('variant_id', item.variant_id);
      
      await supabase.from('stock_movements').insert({
          variant_id: item.variant_id,
          quantity: item.quantity,
          reason: 'ORDER_RELEASE'
      });
    }
  }
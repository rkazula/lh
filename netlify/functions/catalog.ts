import { Handler } from '@netlify/functions';
import { getSupabaseAnon } from '../lib/supabase';
import { jsonResponse, errorResponse } from '../lib/http';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return jsonResponse(405, { error: 'Method Not Allowed' });

  try {
    const supabase = getSupabaseAnon();
    // Querying through the "public" view (RLS applied)
    const { data, error } = await supabase
      .from('product')
      .select(`
        *,
        variant (id, sku, size, color, price_delta_gross, active)
      `)
      .eq('active', true);

    if (error) throw error;

    return jsonResponse(200, data);
  } catch (error) {
    return errorResponse(error);
  }
};
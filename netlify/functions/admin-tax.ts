import { Handler } from '@netlify/functions';
import { getSupabaseAdmin } from '../lib/supabase';
import { requireAdmin } from '../lib/admin-auth';
import { jsonResponse, errorResponse } from '../lib/http';

export const handler: Handler = async (event) => {
  try {
    await requireAdmin(event.headers);
    const supabase = getSupabaseAdmin();

    // Assumption: tax_settings table has a single row with id=1 or just 1 row
    
    if (event.httpMethod === 'GET') {
        const { data } = await supabase.from('tax_settings').select('*').single();
        // If empty, return defaults
        return jsonResponse(200, data || { global_vat_rate: 0.23, prices_include_vat: true });
    }

    if (event.httpMethod === 'PUT') {
        const body = JSON.parse(event.body || '{}');
        const { global_vat_rate, prices_include_vat } = body;
        
        // Upsert logic (assuming id:1 is the singleton config)
        const { error } = await supabase.from('tax_settings').upsert({
            id: 1,
            global_vat_rate,
            prices_include_vat,
            updated_at: new Date().toISOString()
        });
        
        if (error) throw error;
        return jsonResponse(200, { success: true });
    }

    return jsonResponse(405, { error: 'Method Not Allowed' });
  } catch (error: any) {
      if (error.message.includes('Forbidden')) return jsonResponse(403, { error: error.message });
      return errorResponse(error);
  }
};
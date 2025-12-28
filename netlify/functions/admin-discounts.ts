import { Handler } from '@netlify/functions';
import { getSupabaseAdmin } from '../lib/supabase';
import { requireAdmin } from '../lib/admin-auth';
import { jsonResponse, errorResponse } from '../lib/http';
import { z } from 'zod';

const createSchema = z.object({
  code: z.string(),
  type: z.enum(['PERCENT', 'FIXED']),
  value: z.number(),
  min_order_amount: z.number(),
  active: z.boolean()
});

export const handler: Handler = async (event) => {
  try {
    await requireAdmin(event.headers);
    const supabase = getSupabaseAdmin();

    if (event.httpMethod === 'GET') {
        const { data } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
        return jsonResponse(200, data);
    }

    if (event.httpMethod === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const payload = createSchema.parse(body);
        
        const { error } = await supabase.from('discounts').insert(payload);
        if (error) throw error;
        
        return jsonResponse(201, { success: true });
    }

    if (event.httpMethod === 'DELETE') {
        const id = event.queryStringParameters?.id;
        if (!id) throw new Error('Missing ID');
        
        await supabase.from('discounts').delete().eq('id', id);
        return jsonResponse(200, { success: true });
    }

    return jsonResponse(405, { error: 'Method Not Allowed' });
  } catch (error: any) {
      if (error.message.includes('Forbidden')) return jsonResponse(403, { error: error.message });
      return errorResponse(error);
  }
};
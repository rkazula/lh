import { Handler } from '@netlify/functions';
import { z } from 'zod';
import { calculateOrderQuote } from '../lib/domain/pricing';
import { jsonResponse, errorResponse } from '../lib/http';

const quoteSchema = z.object({
  items: z.array(z.object({
    variant_id: z.string().uuid(),
    quantity: z.number().min(1),
  })),
  discountCode: z.string().optional(),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return jsonResponse(405, { error: 'Method Not Allowed' });

  try {
    const body = JSON.parse(event.body || '{}');
    const { items, discountCode } = quoteSchema.parse(body);

    const quote = await calculateOrderQuote(items, discountCode);

    return jsonResponse(200, quote);
  } catch (error) {
    return errorResponse(error);
  }
};
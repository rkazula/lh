import { Handler } from '@netlify/functions';
import { z } from 'zod';
import { calculateOrderQuote } from '../lib/domain/pricing';
import { createOrder } from '../lib/domain/orders';
import { registerTransaction } from '../lib/integrations/p24';
import { jsonResponse, errorResponse } from '../lib/http';
import { getEnv } from '../lib/env';

const checkoutSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  phone: z.string().min(9),
  address: z.object({
    street: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string().default('PL'),
  }),
  shippingMethod: z.enum(['INPOST_LOCKER', 'DPD_PICKUP', 'COURIER']), // Simplified
  pickupPoint: z.any().optional(),
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
    const input = checkoutSchema.parse(body);
    const { APP_ORIGIN } = getEnv();

    // 1. Calculate final price (Server authority)
    const quote = await calculateOrderQuote(input.items, input.discountCode);

    // 2. Create Order & Reserve Stock
    const order = await createOrder({
      calculated: quote,
      email: input.email,
      phone: input.phone,
      fullName: input.fullName,
      address: input.address,
      shippingMethod: input.shippingMethod,
      pickupPoint: input.pickupPoint
    });

    // 3. Register Payment
    const paymentLink = await registerTransaction({
      sessionId: order.id, // Using UUID as session ID
      amount: order.total_gross,
      email: order.email,
      description: `Order ${order.id} - Local Haters`,
      urlReturn: `${APP_ORIGIN}/success?order=${order.id}`,
      urlStatus: `${APP_ORIGIN}/api/p24/notify`,
    });

    return jsonResponse(201, {
      orderId: order.id,
      paymentUrl: paymentLink
    });

  } catch (error) {
    return errorResponse(error);
  }
};
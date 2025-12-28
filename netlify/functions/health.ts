import { Handler } from '@netlify/functions';
import { jsonResponse } from '../lib/http';

export const handler: Handler = async () => {
  return jsonResponse(200, { status: 'ok', time: new Date().toISOString() });
};
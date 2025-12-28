import { HandlerResponse } from '@netlify/functions';
import { ZodError } from 'zod';
import { getEnv } from './env';
import { createLogger } from './logger';

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function getCorsHeaders() {
  const { APP_ORIGIN } = getEnv();
  return {
    ...HEADERS,
    'Access-Control-Allow-Origin': APP_ORIGIN,
  };
}

export function jsonResponse(statusCode: number, body: unknown): HandlerResponse {
  return {
    statusCode,
    headers: getCorsHeaders(),
    body: JSON.stringify(body),
  };
}

export function errorResponse(error: unknown, logger?: ReturnType<typeof createLogger>): HandlerResponse {
  const headers = getCorsHeaders();
  const log = logger || createLogger(); 

  if (error instanceof ZodError) {
    log.warn('Validation Error', { details: (error as ZodError).errors });
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Validation Error',
        details: (error as ZodError).errors,
        requestId: log.getRequestId()
      }),
    };
  }

  if (error instanceof Error) {
    log.error('Server Error', error);
    
    // Domain Errors
    if (error.message.includes('Stock insufficient')) {
      return { statusCode: 409, headers, body: JSON.stringify({ error: error.message, requestId: log.getRequestId() }) };
    }
    if (error.message.includes('Not Found') || error.message.includes('not found')) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: error.message, requestId: log.getRequestId() }) };
    }
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Access Denied', requestId: log.getRequestId() }) };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', requestId: log.getRequestId() }),
    };
  }

  log.error('Unknown Server Error', { error });
  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({ error: 'Unknown Server Error', requestId: log.getRequestId() }),
  };
}
import { Handler } from '@netlify/functions';
import { jsonResponse } from '../lib/http';

// Mock Data Generator
const generateMockPoints = (lat: number, lng: number, count = 5) => {
    return Array.from({ length: count }).map((_, i) => ({
        provider: 'DPD',
        id: `DPD-WAW-${Math.floor(Math.random() * 1000)}`,
        name: `DPD Pickup Point #${i + 1}`,
        address: {
            line1: `Mock Street ${i + 1}`,
            line2: '00-001 Warsaw, PL',
        },
        lat: lat + (Math.random() - 0.5) * 0.05,
        lng: lng + (Math.random() - 0.5) * 0.05,
        type: Math.random() > 0.5 ? 'LOCKER' : 'POINT',
    }));
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };

  const query = event.queryStringParameters?.query || '';
  
  // In a real app, call DPD API here using process.env.DPD_API_KEY
  // For MVP demo, we return mock data centered roughly on Warsaw coordinates
  // unless query looks like coordinates.
  
  let lat = 52.2297;
  let lng = 21.0122;

  if (query.includes(',')) {
      const parts = query.split(',');
      if (parts.length === 2) {
          lat = parseFloat(parts[0]);
          lng = parseFloat(parts[1]);
      }
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const points = generateMockPoints(lat, lng);

  return jsonResponse(200, points);
};
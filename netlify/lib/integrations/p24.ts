import { P24, Currency, Country, Language, Encoding } from '@ingameltd/node-przelewy24';
import { getEnv } from '../env';

export interface P24OrderPayload {
  sessionId: string;
  amount: number; // in cents
  email: string;
  urlReturn: string;
  urlStatus: string;
  description: string;
}

let p24Instance: P24 | null = null;

function getP24() {
  if (!p24Instance) {
    const env = getEnv();
    p24Instance = new P24(
      env.P24_MERCHANT_ID,
      env.P24_POS_ID,
      env.P24_API_KEY,
      env.P24_CRC,
      {
        sandbox: env.P24_ENV === 'sandbox',
      }
    );
  }
  return p24Instance;
}

export async function registerTransaction(payload: P24OrderPayload): Promise<string> {
  const p24 = getP24();
  
  // P24 Library call
  const result = await p24.testConnection();
  if (!result) throw new Error('P24 Connection failed');

  const transaction = await p24.createTransaction({
    sessionId: payload.sessionId,
    amount: payload.amount,
    currency: Currency.PLN,
    description: payload.description,
    email: payload.email,
    country: Country.Poland,
    language: Language.PL,
    encoding: Encoding.UTF8,
    urlReturn: payload.urlReturn,
    urlStatus: payload.urlStatus,
    timeLimit: 15, // 15 mins to pay
    waitForResult: true,
  });

  return transaction.link;
}

export async function verifyNotification(body: any): Promise<{ sessionId: string, amount: number } | null> {
  const p24 = getP24();
  // The library handles parsing and CRC check internally from the body object
  try {
     const result = await p24.verifyTransaction(body);
     if (result) {
         return {
             sessionId: body.sessionId,
             amount: body.amount
         };
     }
     return null;
  } catch (e) {
      console.error('P24 Verification Failed', e);
      throw e;
  }
}
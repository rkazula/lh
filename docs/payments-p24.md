# Przelewy24

## Sandbox
1. Create account at sandbox.przelewy24.pl.
2. Get CRC and API Key.
3. Set `P24_ENV=sandbox`.

## Production
1. Verify business account.
2. Enable API Access in panel.
3. Set `P24_ENV=production`.

## Webhook
- Endpoint: `/api/p24/notify`.
- Logic: Verifies signature -> Checks Order status -> Captures Stock.

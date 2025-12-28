# Troubleshooting

## White Screen
- **Cause**: ImportMap in index.html interfering with Vite.
- **Fix**: Remove `<script type="importmap">`. Ensure `main.tsx` is loaded as module.

## 409 Conflict on Checkout
- **Cause**: Stock insufficient.
- **Fix**: Check `stock_item` table. Ensure `on_hand - reserved >= qty`.

## InPost Widget Missing
- **Cause**: CSP blocking script or invalid Token.
- **Fix**: Check `VITE_INPOST_GEOWIDGET_TOKEN` and console errors.

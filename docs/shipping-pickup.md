# Shipping & Pickup Point Integration

This project supports map-based selection for:
1. **InPost Paczkomaty** (via Official Geowidget)
2. **DPD Pickup Points** (via Leaflet + OpenStreetMap + Mock API)

## 1. InPost Configuration

The integration uses the V5/V4 InPost Geowidget.

### Environment Variables
You must set `VITE_INPOST_GEOWIDGET_TOKEN` in your `.env` file (or Netlify Environment variables).

```bash
VITE_INPOST_GEOWIDGET_TOKEN=your_token_here
```

To get a token:
1. Contact InPost integration team or use a sandbox token if available.
2. For testing, you can sometimes use demo tokens provided in public InPost docs, but they are rate-limited.

### Implementation Details
- **Script**: Loaded in `index.html`.
- **Component**: `src/components/features/shipping/InPostPicker.tsx`
- **Logic**: Uses a Custom Element `<inpost-geowidget>` and listens for a window-level callback `window.onInPostPointSelect`.

## 2. DPD Configuration

Since the official DPD map widget is often iframe-based or complex to integrate with custom styles, we implemented a **Custom Leaflet Map**.

### Data Source
- Frontend queries: `/api/shipping-dpd-points?query={city_or_lat,lng}`.
- Backend (`netlify/functions/shipping-dpd-points.ts`) currently mocks the response. In a production scenario, this function should call the DPD API (e.g., `findPoints`).

### Implementation Details
- **Library**: `react-leaflet` + `leaflet`.
- **Component**: `src/components/features/shipping/DpdMapPicker.tsx`.
- **Geolocation**: Supports browser geolocation API to center the map.

## 3. Testing Locally

1. `npm run dev`
2. Go to Checkout.
3. Fill in Contact details (required to unlock shipping steps in visual stepper, though form logic allows direct interaction).
4. Select **InPost**. Click "Open Map".
   - *Note*: If the InPost token is invalid, the widget might show an error or blank iframe.
5. Select **DPD**. Click "Open Map".
   - You should see markers around Warsaw (default) or your location.
   - Click a marker -> popup -> "Select Point".
6. The selected point appears in the main form.

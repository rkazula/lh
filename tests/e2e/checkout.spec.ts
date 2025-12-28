import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  // Mock backend to avoid P24/Supabase calls
  test.beforeEach(async ({ page }) => {
    // Catalog
    await page.route('/api/catalog', async route => {
      await route.fulfill({
        json: [{
          id: 'p1', name: 'Test Hoodie', price_gross: 10000, slug: 'test-hoodie', active: true,
          variant: [{ id: 'v1', sku: 'TH-L', size: 'L', color: 'Black', price_delta_gross: 0, active: true }]
        }]
      });
    });

    // Product
    await page.route('/api/product/*', async route => {
      await route.fulfill({
        json: {
          id: 'p1', name: 'Test Hoodie', description: 'Desc', price_gross: 10000, slug: 'test-hoodie', active: true,
          variant: [{ id: 'v1', sku: 'TH-L', size: 'L', color: 'Black', price_delta_gross: 0, active: true }]
        }
      });
    });

    // Quote
    await page.route('/api/cart/quote', async route => {
      await route.fulfill({
        json: {
          subtotal_gross: 10000, discount_gross: 0, shipping_gross: 1500, tax_gross: 2000, total_gross: 11500, currency: 'PLN',
          items: [{ variant_id: 'v1', name: 'Test Hoodie', quantity: 1, unit_gross: 10000, total_gross: 10000 }]
        }
      });
    });

    // Order Create
    await page.route('/api/checkout/create', async route => {
      await route.fulfill({
        status: 201,
        json: { orderId: 'ord-123', paymentUrl: 'http://localhost:5173/success?order=ord-123&mock=true' }
      });
    });
  });

  test('Complete purchase flow', async ({ page }) => {
    await page.goto('/');
    
    // Catalog
    await page.click('text=Shop Collection');
    await page.click('text=Test Hoodie');
    
    // Add to Cart
    await page.click('button:has-text("L")');
    await page.click('button:has-text("Black")');
    await page.click('button:has-text("Add to Cart")');
    
    // Checkout
    await page.click('text=Checkout');
    await page.waitForURL('**/checkout');
    
    // Form
    await page.fill('input[name="email"]', 'e2e@test.com');
    await page.fill('input[name="phone"]', '123456789');
    await page.fill('input[name="fullName"]', 'E2E User');
    await page.fill('input[name="address.street"]', 'Street 1');
    await page.fill('input[name="address.city"]', 'City');
    await page.fill('input[name="address.postalCode"]', '00-000');
    
    await page.click('text=Courier');
    
    // Submit
    await page.click('button:has-text("Pay with P24")');
    
    // Success
    await page.waitForURL('**/success?order=ord-123&mock=true');
    await expect(page.locator('h1')).toContainText('Order Confirmed');
  });
});
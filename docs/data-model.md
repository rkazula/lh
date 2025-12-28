# Data Model & Architecture

## Core Philosophy
The "Local Haters" architecture strictly separates the **Public Interface** (Frontend) from the **Secure Business Logic** (Netlify Functions). This prevents client-side manipulation of prices, stock, or order statuses.

## Entity Relationship Diagram (Conceptual)

- **Products** `1:N` **Variants**
- **Variants** `1:1` **Stock Items**
- **Variants** `1:N` **Stock Movements**
- **Orders** `1:N` **Order Items**
- **Auth.Users** `1:1` **User Roles**

## Entities

### 1. Catalog (Products & Variants)
- **Products**: Contains immutable descriptive data (Name, Description). `price_gross` is the base price in integer cents (Grosze).
- **Variants**: Represents the sellable SKU (Size/Color combinations). Can have a `price_delta_gross` to adjust the base price (e.g., XXL is more expensive).

### 2. Inventory (Stock)
- **Stock Items**: Tracks the current state.
    - `on_hand`: Physical stock available in warehouse.
    - `reserved`: Stock currently sitting in `PENDING_PAYMENT` orders.
    - **Available to Sell** = `on_hand` - `reserved`.
- **Stock Movements**: An append-only ledger of every change to stock.
    - Types: `RESTOCK` (New shipment), `ORDER_RESERVE` (Checkout started), `ORDER_CAPTURE` (Payment confirmed), `ORDER_RELEASE` (Order cancelled/timed out).

### 3. Orders
- **Order**: The source of truth for a transaction.
- **Order Items**: Snapshots of product data at the time of purchase. Even if the product name or price changes later, the order record remains historically accurate.
- **Address**: Stored as JSONB to allow flexibility for international address formats without schema migrations.

### 4. Financials
- **Tax Settings**: Singleton table defining the global VAT rate.
- **Discounts**: Controlled via code.
    - `PERCENT`: Percentage off the subtotal.
    - `FIXED`: Fixed amount deducted (in cents).

## Critical Flows

### A. The "Checkout" Flow (Security via Netlify Functions)

1.  **Frontend**: User clicks "Place Order".
2.  **Frontend**: Sends Payload (Cart Items + Address + Discount Code) to Netlify Function `/api/create-order`.
3.  **Function (Service Role)**:
    - Fetches fresh prices from DB (ignores prices sent by frontend).
    - Validates Discount Code.
    - Calculates Totals & Taxes.
    - Checks `stock_items` for availability (`on_hand - reserved >= requested_qty`).
    - **Transaction**:
        - Inserts `Order` (Status: `PENDING_PAYMENT`).
        - Inserts `Order Items`.
        - Updates `stock_items`: `reserved = reserved + qty`.
        - Inserts `stock_movements`: `ORDER_RESERVE`.
    - Returns `payment_link` (e.g., P24/Stripe) and `order_id` to Frontend.

### B. The "Payment Webhook" Flow

1.  **Payment Provider**: Calls Netlify Function `/api/webhooks/payment`.
2.  **Function (Service Role)**:
    - Verifies Webhook Signature.
    - Finds Order by `payment_ref`.
    - **Transaction**:
        - Updates Order Status -> `PAID`.
        - Updates `stock_items`: `on_hand = on_hand - qty`, `reserved = reserved - qty`.
        - Inserts `stock_movements`: `ORDER_CAPTURE`.

### C. The "Expiration" Flow (Cron Job)

1.  **Scheduled Function**: Runs every 10 mins.
2.  **Logic**: Finds Orders where `status = PENDING_PAYMENT` AND `created_at < NOW() - 30 MIN`.
3.  **Transaction**:
    - Updates Order Status -> `EXPIRED`.
    - Updates `stock_items`: `reserved = reserved - qty`.
    - Inserts `stock_movements`: `ORDER_RELEASE`.

## Security Rules (RLS)

- **Public**: Can READ active Products, Variants, and basic Stock info. Cannot WRITE anything directly to these tables.
- **Customer**: Can READ their own Orders.
- **Admin**: Full Access to all tables.
- **Service Role (Functions)**: Bypasses RLS to perform complex transactional logic (Stock Reservation, Price Calculation).

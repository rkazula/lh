# Admin Panel Setup

The admin panel is protected by Supabase Auth and a custom Role-Based Access Control (RBAC) system implemented in Netlify Functions.

## 1. Database Setup

To enable admin access, you must set up the `user_roles` table in Supabase.

```sql
-- Create Roles Table
create table user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  role text not null check (role in ('ADMIN', 'CUSTOMER')),
  created_at timestamptz default now(),
  unique(user_id, role)
);

-- Enable RLS
alter table user_roles enable row level security;

-- Policy: Only Service Role can manage roles (for now) or Admins can read
create policy "Admins can read roles" on user_roles
  for select to authenticated
  using (true); -- Simplified for now, in prod restrict this
```

## 2. Creating an Admin User

1.  Sign up a user normally via the App or Supabase Dashboard.
2.  Go to the Supabase SQL Editor.
3.  Run the following query with the User's UUID:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<USER_UUID_HERE>', 'ADMIN');
```

## 3. Architecture

-   **Frontend**: Checks for session existence. UX assumes admin if login successful on `/admin/login`.
-   **Backend**: Every request to `/api/admin/*` must include `Authorization: Bearer <TOKEN>`.
-   **Middleware**: `netlify/lib/admin-auth.ts` -> `requireAdmin()`.
    -   Calls `supabase.auth.getUser(token)` to validate signature.
    -   Queries `user_roles` to ensure `role = 'ADMIN'`.

## 4. Modules

-   **Inventory**: Manages `stock_item`. Adjustments log to `stock_movements`.
-   **Discounts**: CRUD for `discounts` table.
-   **Settings**: Manages `tax_settings` singleton.

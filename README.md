# Apex Vouchers — Full-Stack Upgrade, Admin Panel, User Account System & Complete Bug Fix

You are working on the existing **Apex Vouchers** repository:

**GitHub:** `https://github.com/Shar236/Apex`

Before making any changes, inspect the **entire repository**, understand the existing architecture and UI, and identify how the current frontend works.

The existing project is a React + Vite voucher-selling website. It already contains components such as the product catalog, product cards, checkout modal, dashboard, admin controls, voucher context, navigation, and other marketing sections.

## VERY IMPORTANT RULES

1. **Do NOT rebuild the project from scratch.**
2. **Do NOT unnecessarily redesign the existing website.**
3. Preserve the current Apex Vouchers branding, layout, components, typography, colors, animations, responsive behavior, and overall user experience unless a change is required to make functionality work.
4. Reuse existing components and logic wherever practical.
5. Do not remove existing working features.
6. Replace fake/local-only functionality with a proper production-ready backend where required.
7. Do not store real user passwords, voucher codes, payment secrets, or sensitive information in frontend code.
8. Never expose MongoDB credentials, JWT secrets, payment secrets, or admin secrets in the React client.
9. Do not hardcode production data that should come from the database.
10. Do not create duplicate components, duplicate routes, duplicate APIs, or multiple competing state-management systems unnecessarily.
11. Keep the application modular and maintainable.
12. After implementation, run a complete build/test check and fix all errors.
13. Check the entire project for broken imports, missing files, invalid paths, runtime crashes, console errors, dependency problems, and dead code.
14. Do not leave unfinished placeholders such as `TODO`, fake API responses, or mock production authentication.
15. Do not claim something works unless it has actually been implemented and verified.

---

# 1. FIRST: AUDIT THE EXISTING PROJECT

Before coding:

* Inspect every source directory.
* Inspect `package.json`.
* Inspect all React components.
* Inspect `App.jsx`.
* Inspect the current `VoucherContext`.
* Inspect the existing checkout flow.
* Inspect the existing dashboard/user UI.
* Inspect the existing admin controls.
* Inspect product/voucher data structures.
* Inspect routing.
* Inspect CSS and responsive behavior.
* Identify what is currently mocked/local-only.
* Identify all existing bugs and architectural problems.
* Identify any unused or conflicting code.
* Identify which existing components can be reused for the new backend system.

Create a clear implementation plan internally before modifying files.

---

# 2. ADD A REAL BACKEND

The current application needs a real backend.

Create a proper backend using:

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT authentication
* bcrypt/bcryptjs for password hashing
* environment variables using `.env`
* proper middleware
* centralized error handling
* input validation
* secure authentication/authorization

Use a clean structure such as:

```text
server/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  app.js
  server.js
```

The exact structure can be adapted to the current project, but keep frontend and backend responsibilities clearly separated.

---

# 3. MONGODB DATABASE

Create proper MongoDB models.

At minimum implement:

## User

Fields should include:

* name
* email
* passwordHash
* role
* phone if required
* createdAt
* updatedAt
* status

Roles:

```text
user
admin
```

Passwords must NEVER be stored in plaintext.

---

# 4. PRODUCT / VOUCHER MODEL

Create a database model for vouchers/products.

Support fields such as:

* product name
* exam/provider/brand
* category
* description
* original price
* selling price
* discount
* currency
* voucher availability/stock
* voucher inventory
* validity
* expiry date where applicable
* inclusions
* image
* active/inactive status
* featured status
* createdAt
* updatedAt

The admin must be able to create, edit, disable, enable, and delete products according to safe business rules.

Do not break existing product-card/catalog UI.

The frontend should retrieve product information from the backend instead of relying on hardcoded product data for production use.

---

# 5. ACTUAL VOUCHER INVENTORY

Do not generate fake voucher codes using random JavaScript strings.

The admin needs to be able to add actual voucher inventory.

Create a voucher inventory model/table/collection that can store:

* voucher code
* product ID
* status
* purchase/order ID
* assigned user
* assigned date
* expiry date
* redeemed/used status
* createdAt
* updatedAt

Voucher statuses should support something like:

```text
AVAILABLE
RESERVED
SOLD
ASSIGNED
USED
EXPIRED
CANCELLED
```

Voucher codes must only be shown to the customer after the associated order/payment has been successfully completed.

Protect voucher codes from being exposed publicly.

---

# 6. ADMIN LOGIN

Create a secure admin authentication system.

Admin should have:

```text
/admin/login
```

Admin login must be separate from normal customer login.

Requirements:

* secure email/password login
* hashed passwords
* JWT/session authentication
* protected admin routes
* role-based authorization
* unauthorized users must not access admin pages
* admin API endpoints must also be protected server-side
* never rely only on frontend route protection

Create a secure way to configure the initial administrator through environment variables or a controlled database seed process.

Do NOT hardcode an admin password into React.

---

# 7. ADMIN DASHBOARD

Create a complete admin dashboard while preserving the Apex visual identity.

Admin dashboard should provide:

## Overview

Show:

* total users
* total products
* total voucher inventory
* available vouchers
* sold vouchers
* total orders
* successful orders
* pending orders
* cancelled orders
* revenue
* active discounts/offers

Use useful cards/charts/tables where appropriate.

---

# 8. ADMIN PRODUCT MANAGEMENT

Admin can:

* add new voucher/product
* edit existing voucher/product
* enable/disable product
* update price
* update original price
* update discount
* change stock
* change description
* change category
* change exam/provider
* upload/change product image
* mark product as featured
* manage validity
* manage inventory

Every change must persist to MongoDB.

The public website should update from the database.

---

# 9. ADMIN VOUCHER INVENTORY MANAGEMENT

Create an admin section for managing individual voucher codes.

Admin can:

* add one voucher
* add multiple voucher codes
* view inventory
* search vouchers
* filter by product
* filter by status
* see which customer received a voucher
* see order information
* see expiry
* disable/cancel voucher where appropriate

Voucher codes must be encrypted/protected appropriately at rest where practical and must not appear in public API responses.

---

# 10. DISCOUNT & SPECIAL EVENT SYSTEM

Create a real discount/promotion system.

Admin should be able to create special offers for events such as:

* Independence Day
* Diwali
* Black Friday
* Christmas
* New Year
* IELTS/PTE special campaign
* limited-time sales
* custom promotional events

Each promotion should support:

* promotion name
* promo code
* description
* discount type:

  * percentage
  * fixed amount
* discount value
* minimum order amount
* maximum discount if percentage
* start date/time
* end date/time
* active/inactive
* usage limit
* per-user usage limit
* applicable products
* applicable categories
* first-order restriction if required

The backend must validate discounts.

Do NOT trust discount prices calculated only by the frontend.

The server must calculate the final order price.

Expired promotions must automatically stop applying.

---

# 11. CUSTOMER REGISTRATION & LOGIN

Create customer authentication.

Customer routes should include:

```text
/login
/register
/account
/account/orders
/account/vouchers
/account/profile
```

Users should be able to:

* register
* log in
* log out
* maintain their account
* update profile information
* view orders
* view purchased vouchers
* view voucher status
* view voucher expiry
* view transaction/order information

Protect customer data so one user cannot access another user's account.

---

# 12. USER ACCOUNT / DASHBOARD

Replace the current local/demo voucher ownership with real account-based data.

The customer dashboard should show:

## Overview

* total orders
* active vouchers
* used vouchers
* expiring vouchers
* total savings

## My Orders

Show:

* order ID
* date
* products
* quantity
* amount
* payment status
* order status

## My Vouchers

Show:

* voucher/product name
* voucher code
* purchase date
* expiry date
* status
* order ID
* redemption information

Voucher code visibility should be restricted to the authenticated owner.

---

# 13. CHECKOUT SYSTEM

Update the existing checkout flow instead of replacing the current UI unnecessarily.

The checkout process should become:

```text
Product
→ Cart / Buy Now
→ Customer login or account
→ Billing/contact details
→ Discount validation
→ Server-side price calculation
→ Payment
→ Payment verification
→ Order creation
→ Voucher allocation
→ Customer account update
→ Confirmation
```

Never mark an order as paid based only on a frontend success callback.

The backend must verify the payment.

---

# 14. PAYMENT INTEGRATION

Inspect the existing project and determine what payment provider is already intended.

If no provider exists yet, structure the backend so a real provider such as Razorpay/Stripe can be integrated without redesigning the checkout.

Payment flow must support:

* payment initiation
* payment verification
* successful payment
* failed payment
* cancelled payment
* duplicate-payment protection
* webhook/event verification where supported
* order status synchronization

IMPORTANT:

Never place payment secret keys in frontend code.

Use environment variables.

---

# 15. ORDER SYSTEM

Create an Order model.

Include:

* user
* products
* voucher/product references
* quantity
* subtotal
* discount
* tax if applicable
* total
* currency
* promotion used
* payment status
* order status
* payment reference
* payment provider
* billing details
* timestamps

Example statuses:

```text
PENDING
PAYMENT_PENDING
PAID
PROCESSING
FULFILLED
CANCELLED
REFUNDED
FAILED
```

Prevent duplicate voucher allocation.

Use transactions/atomic database operations where needed so the same voucher cannot be assigned to two customers.

---

# 16. AFTER PAYMENT — VOUCHER DELIVERY

After confirmed successful payment:

1. Verify payment server-side.
2. Create/update the order.
3. Find available voucher inventory.
4. Reserve/assign the required voucher(s).
5. Mark the voucher as sold/assigned.
6. Attach the voucher to the customer's order/account.
7. Make the voucher visible in `My Vouchers`.
8. Send a confirmation email if email service is configured.
9. Show a confirmation page.

If no available voucher exists, do not complete fulfillment incorrectly.

Handle stock/inventory race conditions safely.

---

# 17. EMAIL SYSTEM

Prepare a proper email service architecture.

Support transactional emails for:

* account registration
* order confirmation
* payment confirmation
* voucher delivery
* password reset
* refund/cancellation notification if needed

Use environment variables for email credentials.

Do not hardcode SMTP credentials.

---

# 18. PASSWORD RESET

Implement:

```text
Forgot Password
→ email reset request
→ secure temporary token
→ new password
```

Reset tokens must expire and should not be stored insecurely.

---

# 19. ADMIN ORDER MANAGEMENT

Admin must be able to:

* view all orders
* search by order ID
* search by customer email
* filter by status
* inspect order details
* see payment status
* see assigned vouchers
* process cancellations/refunds where applicable
* manually handle exceptional orders
* inspect customer information necessary for fulfillment

Do not expose customer passwords or sensitive authentication fields.

---

# 20. ADMIN USER MANAGEMENT

Admin should be able to:

* list customers
* search users
* view customer profile
* see order count
* see purchased vouchers
* disable/enable account
* inspect customer activity needed for order support

Do not allow dangerous actions without server-side authorization.

---

# 21. SECURITY REQUIREMENTS

Implement at minimum:

* bcrypt password hashing
* JWT authentication
* secure token handling
* role-based authorization
* protected API routes
* CORS configuration
* rate limiting for authentication endpoints
* input validation
* server-side authorization
* MongoDB injection protection
* XSS-safe handling
* secure HTTP headers where applicable
* environment variables for secrets
* no secret keys in frontend
* safe error messages
* logging for important server errors
* no sensitive data in client-side logs

Do not return passwords or password hashes through APIs.

---

# 22. API STRUCTURE

Create clean REST APIs.

Examples:

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/products
GET    /api/products/:id

GET    /api/account
GET    /api/account/orders
GET    /api/account/vouchers
PATCH  /api/account/profile

POST   /api/orders
GET    /api/orders/:id

POST   /api/payments/create
POST   /api/payments/verify
POST   /api/payments/webhook

GET    /api/admin/dashboard
GET    /api/admin/users
GET    /api/admin/orders
GET    /api/admin/products
POST   /api/admin/products
PATCH  /api/admin/products/:id
DELETE /api/admin/products/:id

GET    /api/admin/vouchers
POST   /api/admin/vouchers
POST   /api/admin/vouchers/bulk
PATCH  /api/admin/vouchers/:id

GET    /api/admin/promotions
POST   /api/admin/promotions
PATCH  /api/admin/promotions/:id
DELETE /api/admin/promotions/:id
```

Adjust the API structure to match the actual implementation.

---

# 23. FRONTEND INTEGRATION

Connect the existing React frontend to the backend.

Do not keep production state in:

```text
useState(...)
hardcoded arrays
local demo voucher data
random generated voucher codes
```

where that data should come from MongoDB.

The frontend should fetch:

* products
* promotions
* user
* orders
* vouchers
* admin dashboard statistics

from the backend.

Use a clean API client/service layer.

---

# 24. UPDATE EXISTING VOUCHER CONTEXT

The current `VoucherContext` uses local state and generated voucher codes.

Refactor it so:

* products come from the API
* authenticated user comes from the API
* orders come from the API
* purchased vouchers come from the API
* admin product changes come from the backend
* stock comes from the backend
* checkout communicates with the backend
* voucher allocation comes from the backend

Keep the Context only for frontend application state that actually belongs there.

Do not use Context as a fake database.

---

# 25. ROUTING

Implement proper route protection.

Examples:

```text
/
 /shop
 /product/:id
 /checkout
 /login
 /register
 /account
 /account/orders
 /account/vouchers
 /admin/login
 /admin
 /admin/products
 /admin/vouchers
 /admin/orders
 /admin/users
 /admin/promotions
```

Customer pages must require customer authentication where appropriate.

Admin pages must require admin authentication.

Users must never access admin APIs simply by manually typing an admin URL.

---

# 26. PRESERVE CURRENT UI

This is extremely important.

The current Apex Vouchers frontend contains many existing sections and components.

Do NOT unnecessarily delete or redesign:

* Hero
* Product Catalog
* Product Cards
* Product Detail
* Checkout styling
* Navigation
* Apex logo
* Exam categories
* Exam guides
* testimonials
* FAQ
* footer
* WhatsApp/support widgets
* animations
* theme support
* existing responsive layouts

Only modify them where required for the new functionality.

The final website should still look like the existing Apex Vouchers website, but now it must actually work with a real backend.

---

# 27. RESPONSIVE DESIGN

Verify:

* desktop
* laptop
* tablet
* mobile

Check:

* navbar
* login/register
* admin dashboard
* tables
* product cards
* checkout
* account dashboard
* voucher display
* modals
* forms
* navigation
* buttons

Fix horizontal overflow and layout crashes.

---

# 28. ERROR STATES

Implement proper UI for:

* API unavailable
* invalid login
* expired session
* product not found
* voucher unavailable
* payment failed
* payment pending
* invalid promo code
* expired promo code
* insufficient voucher inventory
* server error
* unauthorized access

Do not allow silent failures.

---

# 29. LOADING STATES

Add appropriate loading states for:

* authentication
* products
* checkout
* orders
* vouchers
* admin dashboard
* admin tables
* promotions
* user management

Avoid flashing broken/empty UI while data is loading.

---

# 30. DATABASE AND CONFIGURATION

Create appropriate environment configuration, for example:

```env
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=
CLIENT_URL=
PORT=

PAYMENT_KEY=
PAYMENT_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

Use the exact variables required by the chosen payment/email providers.

Create:

```text
.env.example
```

Do not commit `.env`.

Update `.gitignore` if necessary.

---

# 31. DATABASE SEEDING

Create a safe seed mechanism for:

* initial admin
* optional sample products
* optional development data

Do not force sample data into production.

Make it easy to create the first administrator securely.

---

# 32. VALIDATION

Use proper server-side validation for:

* email
* password
* prices
* quantities
* promotion dates
* discount values
* voucher codes
* object IDs
* required fields

Never trust frontend validation as the only validation.

---

# 33. DATA CONSISTENCY

Pay special attention to:

* duplicate orders
* duplicate payments
* duplicate voucher allocation
* inventory race conditions
* expired vouchers
* expired promotions
* disabled products
* cancelled orders
* failed payments
* partially fulfilled orders

The system must never accidentally give the same voucher code to multiple customers.

---

# 34. COMPLETE BUG AUDIT

After implementing the full-stack architecture, inspect the entire codebase for every existing problem.

Check:

* broken imports
* incorrect paths
* missing components
* missing files
* invalid React hooks
* state synchronization bugs
* stale state
* memory leaks
* event listener leaks
* modal bugs
* checkout bugs
* cart bugs
* responsive bugs
* console errors
* runtime crashes
* dependency mismatches
* build errors
* API errors
* authentication errors
* authorization errors
* database errors
* malformed environment configuration
* unused broken code
* inconsistent naming
* duplicate functionality

Fix the problems instead of merely documenting them.

---

# 35. DO NOT BREAK EXISTING FUNCTIONALITY

Before finalizing, verify:

* homepage works
* navigation works
* shop works
* product details work
* cart works
* checkout works
* login works
* registration works
* customer account works
* orders work
* voucher delivery works
* admin login works
* admin dashboard works
* product management works
* voucher management works
* promotion management works
* user management works
* responsive design works
* theme functionality works
* support widgets still work

---

# 36. TESTING

Add appropriate tests where practical.

At minimum verify:

### Authentication

* register
* login
* invalid credentials
* unauthorized access
* admin authorization
* password reset

### Products

* list products
* product details
* admin create
* admin update
* admin disable

### Promotions

* valid promotion
* expired promotion
* invalid code
* minimum order
* product restrictions

### Orders

* create order
* payment verification
* duplicate payment prevention
* order persistence
* voucher assignment

### Vouchers

* available voucher
* assignment
* already assigned voucher
* expired voucher
* multiple quantities

---

# 37. BUILD CHECK

Run:

```bash
npm install
npm run build
```

Also run the backend with the appropriate development command and verify startup.

Fix every compilation/build/runtime error.

Do not finish with an application that only works conceptually.

---

# 38. FINAL CODE QUALITY CHECK

Before finishing:

* remove unused imports
* remove unused variables
* remove mock production logic
* remove fake voucher generation
* remove duplicate implementations
* verify all API URLs
* verify environment variables
* verify CORS
* verify MongoDB connection
* verify authentication
* verify route protection
* verify admin permissions
* verify customer permissions
* verify voucher security
* verify payment verification
* verify build

---

# 39. DOCUMENTATION

Update the README with:

* project architecture
* frontend setup
* backend setup
* MongoDB setup
* environment variables
* admin creation
* development commands
* production build
* API overview
* payment configuration
* email configuration
* deployment notes

Create an `.env.example`.

---

# 40. FINAL REQUIREMENT

Do not just add an attractive admin interface on top of the existing frontend.

The goal is a **real working Apex Vouchers e-commerce platform**:

```text
CUSTOMER
Register/Login
      ↓
Browse vouchers
      ↓
Add to cart / Buy now
      ↓
Apply promotion
      ↓
Checkout
      ↓
Payment
      ↓
Backend verifies payment
      ↓
Order created
      ↓
Real voucher inventory assigned
      ↓
Voucher appears in customer's account
      ↓
Customer can view/use their voucher
```

And:

```text
ADMIN
Login
  ↓
Admin Dashboard
  ↓
Manage Products
Manage Voucher Inventory
Manage Customers
Manage Orders
Manage Promotions
Manage Discounts
Manage Stock
View Sales/Revenue
Control Website Data
```

## Most important instruction

**Inspect the existing Apex repository first and build on top of it. Do not replace the current frontend unnecessarily.**

Preserve the current Apex Vouchers design and functionality while converting the application from a frontend demo/local-state system into a secure, database-backed, production-ready voucher marketplace.

After all implementation is complete, perform a full repository audit and fix every problem you can find. The final result must compile successfully, start successfully, and have no known critical runtime errors.

---

# 41. PROJECT ARCHITECTURE & SYSTEM DOCUMENTATION

### Overview
Apex Vouchers is a production-ready, full-stack e-commerce marketplace for discounted educational and certification exam vouchers (PTE, GRE, TOEFL, Duolingo, IELTS).

### Tech Stack
- **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide Icons, React Router DOM v6, Theme Context (Light/Dark).
- **Backend**: Node.js, Express.js (ES Modules), MongoDB, Mongoose ORM, JSON Web Tokens (JWT), Bcrypt password hashing.
- **Middleware & Security**: Express Rate Limit, Helmet Security Headers, CORS, Express Validator, Centralized Error Handling.

### Project Architecture
```text
Apex/
├── .env                       # Environment variables
├── .env.example               # Example environment configuration
├── package.json               # Root workspace orchestrator package
├── backend/                   # Node.js Express backend
│   ├── config/                # Environment & Database connection (db.js, index.js)
│   ├── controllers/           # Auth, Product, Order, Account, Admin controllers
│   ├── middleware/            # JWT Auth, Admin protect, Error Handler
│   ├── models/                # User, Product, VoucherCode, Order, Promotion models
│   ├── routes/                # Auth, Product, Order, Account, Admin routes
│   ├── services/              # Email stub, Promotion validation
│   ├── utils/                 # Token generator & helper functions
│   ├── app.js                 # Express application setup
│   ├── package.json           # Backend package dependencies
│   └── server.js              # Server entry point
└── frontend/                  # React Vite frontend
    ├── public/                # Static assets
    ├── src/                   # React application components & logic
    │   ├── components/        # React UI components
    │   ├── context/           # AuthContext, VoucherContext, ThemeContext
    │   ├── lib/               # API client (api.js)
    │   ├── types/             # Fallback data definitions
    │   └── App.jsx            # Main router & layout structure
    ├── index.html             # HTML entry point
    ├── package.json           # Frontend package dependencies
    └── vite.config.js         # Vite configuration
```

### Quickstart & Setup Guide

1. **Install Dependencies**:
   ```bash
   npm run install:all
   ```

2. **Environment Configuration**:
   Create `.env` file in the root directory (or copy from `.env.example`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<db_username>:Fjq9DDde0TfrkZME@apexcluster.adxjwp2.mongodb.net/apex_vouchers?retryWrites=true&w=majority&appName=apexcluster
   JWT_SECRET=dev_apex_vouchers_jwt_secret_key_2025
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
      SERVER_URL=http://localhost:5000
   ADMIN_EMAIL=admin@apexvouchers.in
   ADMIN_PASSWORD=Admin@123
   ADMIN_NAME=System Admin
      SMTP_HOST=smtp.gmail.com
      SMTP_PORT=587
      SMTP_USER=your-verified-sender@example.com
      SMTP_PASSWORD=your-provider-app-password
      SMTP_FROM="Apex Vouchers" <your-verified-sender@example.com>
      SMTP_SECURE=false
   ```

3. **Start Development Backend & Frontend**:
   ```bash
   # Run both frontend & backend concurrently
   npm run dev

   # Or run individually:
   npm run dev:backend
   npm run dev:frontend
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

### Default Admin Credentials
Upon initial server startup, the backend automatically seeds the system administrator if not present:
- **Email**: `admin@apexvouchers.in`
- **Password**: `Admin@123`

### REST API Endpoints Overview
- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- **Products**: `/api/products`, `/api/products/:id`
- **Account**: `/api/account`, `/api/account/profile`, `/api/account/stats`, `/api/account/orders`, `/api/account/vouchers`, `/api/account/vouchers/:id/transfer`, `/api/account/vouchers/:id/used`
- **Orders**: `/api/orders`, `/api/orders/:id`, `/api/orders/:id/pay`
- **Admin**: `/api/admin/dashboard`, `/api/admin/users`, `/api/admin/products`, `/api/admin/vouchers`, `/api/admin/orders`, `/api/admin/promotions`

### Image storage (Cloudinary)

All website/content images (product photos & logos, blog featured + in-article
images, awards, SEO OG images) are stored on Cloudinary and delivered through its
CDN with `f_auto,q_auto` (automatic modern format + quality) plus responsive
widths. Small UI assets — the favicon, Lucide icons, inline SVGs — stay in the
repo.

**Config** (backend `.env`, never exposed to the frontend):

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**How uploads work** — the admin picks a file in the Blog / Product / Awards
editor; the backend (`services/cloudinaryService.js`) streams it to Cloudinary
and stores `{ url, publicId }` on the record. Replacing a product image deletes
the old Cloudinary asset when no other product references it. Cloudinary folders:
`apex_products/images`, `apex_products/logos`, `apex_blog/featured`,
`apex_blog/images`, `apex_blog/articles/<slug>`, `apex_awards/images`,
`apex_general`.

**Migrating existing images** — `backend/scripts/migrateImagesToCloudinary.js`:

```
cd backend
npm run migrate:images                        # dry run — report only, no changes
npm run migrate:images -- --upload            # upload local/legacy images to Cloudinary
npm run migrate:images -- --upload --commit   # + rewrite DB image fields
npm run migrate:images -- --upload --public-map  # + regenerate frontend/src/lib/imageMap.js
```

Idempotent and re-runnable (deterministic `public_id` per source); never deletes
local files. A per-viewer fallback keeps local images working until migrated:
`frontend/src/lib/imageUrl.js` resolves any `src` — legacy local paths route
through `imageMap.js`, Cloudinary URLs get the optimization transform, everything
else passes through untouched.

**Verifying an image comes from Cloudinary** — its `src` in the rendered page is
`https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,.../...`.


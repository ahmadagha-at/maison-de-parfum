# Maison de Parfum E-Commerce

Maison de Parfum is a full-stack e-commerce application for browsing and purchasing luxury fragrances. It combines a responsive React storefront with a secured Spring Boot REST API, PostgreSQL persistence, Stripe payment processing, and a role-based administration area.

Customers can create accounts, browse and filter products, manage a cart, complete a Stripe test payment, and review their orders. Administrators can manage products, analyse paid-order statistics, find customer orders by email, and remove cancelled or unpaid orders.

## Main Features

### Customer Experience

- Account registration, login, logout, and automatic session renewal
- Paginated product catalogue with brand filtering and product details
- Shopping cart with quantity and stock validation
- Stripe Elements checkout with server-side amount calculation
- Personal order history with status, items, totals, and shipping address
- Responsive English interface with contact information throughout the order flow

### Administration

- Role-protected dashboard and product management
- Create, update, and deactivate products
- Paid-order revenue, sales volume, monthly revenue, and top-product charts
- Customer order search by email with pagination
- Safe removal of cancelled or unpaid orders; paid orders remain in the history

## Project Architecture

### Frontend

The frontend uses React 18, Vite, React Router, Axios, Stripe Elements, Recharts, and Tailwind CSS. React Router separates public pages, authenticated customer pages, and administrator-only pages. Context providers manage authentication and cart state, while a shared Axios client attaches access tokens and renews sessions when required.

The frontend is organised into:

- `pages` for the storefront, authentication, checkout, order history, and administration
- `components` for reusable navigation, product, payment, footer, and route-protection elements
- `context` for authentication and cart state
- `api` for backend communication and authentication interceptors

### Backend

The backend uses Java 17 and Spring Boot 3 with a layered architecture:

- Controllers expose versioned REST endpoints under `/api/v1`.
- Services contain authentication, product, order, payment, and reporting logic.
- Spring Data JPA repositories manage PostgreSQL access.
- DTOs separate API contracts from persistence entities.
- A centralized exception handler returns consistent HTTP error responses.

PostgreSQL stores users, roles, products, refresh-token hashes, orders, and order items. Product deletion is implemented as a soft delete so existing order history remains valid.

## Authentication and Security

Spring Security protects the API with stateless JWT access tokens and role-based authorization. Passwords are hashed with BCrypt. Short-lived access tokens remain in browser memory, while rotating refresh tokens are delivered through `HttpOnly`, `SameSite` cookies. Only SHA-256 hashes of refresh tokens are stored in PostgreSQL.

Administrative operations require `ROLE_ADMIN` in both the frontend route guards and backend method security. CORS is restricted to the configured frontend origin, API validation limits pagination input, and secrets are loaded from environment variables rather than committed configuration values.

## Order and Payment Flow

Checkout is coordinated by `OrderService`:

1. The authenticated user and requested products are loaded.
2. Product rows are locked to prevent concurrent overselling.
3. Stock and request quantities are validated.
4. Prices and totals are calculated on the server.
5. A `PENDING` order and Stripe PaymentIntent are created.
6. Stripe Elements securely confirms the payment in the browser.
7. A signed Stripe webhook changes the order to `CONFIRMED` after successful payment.

The frontend also requests server-side reconciliation immediately after payment, while the signed webhook remains the authoritative fallback. Pending orders that exceed the configured timeout are cancelled automatically and their reserved stock is restored. Stripe cancellation events also restore stock exactly once.

## Dashboard and Reporting

The administration dashboard uses repository-level aggregate queries to calculate:

- revenue from confirmed, shipped, and delivered orders
- total order count
- quantity of paid products sold
- monthly paid revenue
- the three best-selling paid products

Recharts visualizes the results with bar and pie charts.

## Configuration Before Running

Prerequisites are Java 17, Maven, Node.js 20.19 or newer, npm, PostgreSQL, and a Stripe test account. Docker and the Stripe CLI are optional but recommended for local development.

Copy the root example configuration:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Complete the values in `.env`:

- `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`
- `JWT_SECRET` as a Base64-encoded secret of at least 256 bits
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CORS_ALLOWED_ORIGIN`

Create the frontend configuration separately:

```powershell
Copy-Item frontend/.env.example frontend/.env
```

Set `VITE_STRIPE_PUBLIC_KEY` in `frontend/.env`. The Stripe secret key must only be used by the backend; only the publishable key may be exposed to the frontend.

For local webhook testing with the Stripe CLI:

```bash
stripe listen --forward-to localhost:8080/api/v1/stripe/webhook
```

Copy the generated `whsec_...` value into `STRIPE_WEBHOOK_SECRET` in `.env`.

## Running the Application

run backend 
start the frontend from the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```

## Creating an Administrator

New accounts receive `ROLE_USER` automatically. For local development, register normally and find the account in PostgreSQL:

```sql
SELECT id, email
FROM users
WHERE email = 'your@email.com';
```

Assign the administrator role using the returned ID:

```sql
INSERT INTO user_roles (user_id, role)
VALUES (1, 'ROLE_ADMIN');
```

Log out and sign in again to receive a new access token containing `ROLE_ADMIN`.

## Testing and Continuous Integration

Run backend tests with:

```bash
cd backend
mvn test
```

Run the frontend production build and dependency audit with:

```bash
cd frontend
npm run build
npm audit
```

GitHub Actions executes the backend tests, frontend build, and frontend security audit for pushes and pull requests.

## Known Scope

Stripe is configured for test-mode development. Shipping-state management and refund processing are not part of the current user interface. Production deployment should additionally provide HTTPS, `AUTH_COOKIE_SECURE=true`, managed secrets, database migrations, monitoring, and a dedicated administrator-provisioning process.

## Technology Stack

- Java 17 and Spring Boot 3
- Spring Web, Spring Security, Spring Data JPA, and Bean Validation
- JWT access tokens and rotating refresh tokens
- PostgreSQL and Hibernate
- Stripe Java SDK, signed webhooks, and Stripe Elements
- React 18, React Router, Axios, and Vite
- Recharts and Tailwind CSS

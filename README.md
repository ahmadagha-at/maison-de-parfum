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

- Revenue from confirmed, shipped, and delivered orders
- Total order count
- Quantity of paid products sold
- Monthly paid revenue
- The three best-selling paid products

Recharts visualizes the results with bar and pie charts.

## Configuration Before Running

Prerequisites:

- Java 17
- Maven
- Node.js 20.19 or newer
- npm
- PostgreSQL
- Stripe test account
- Stripe CLI for optional local webhook testing

Copy the root example configuration:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Complete the following values in `.env`:

```env
DB_URL=jdbc:postgresql://localhost:5432/eShopDB
DB_USERNAME=postgres
DB_PASSWORD=your_database_password
JWT_SECRET=your_base64_encoded_jwt_secret
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CORS_ALLOWED_ORIGIN=http://localhost:5173
AUTH_COOKIE_SECURE=false
```

The JWT secret must be Base64-encoded and contain at least 256 bits of entropy.

Create the frontend configuration separately:

```powershell
Copy-Item frontend/.env.example frontend/.env
```

Set the Stripe publishable key in `frontend/.env`:

```env
VITE_STRIPE_PUBLIC_KEY=pk_test_your_publishable_key
```

The Stripe secret key and webhook signing secret belong only in the backend configuration. They must never be exposed to the frontend or committed to Git.

### Local Stripe Webhook

Start the Stripe CLI listener:

```bash
stripe listen --forward-to http://localhost:8080/api/v1/stripe/webhook
```

Stripe will display a signing secret beginning with `whsec_`. Copy it into `STRIPE_WEBHOOK_SECRET` in the root `.env` file and restart the backend.

Keep the Stripe CLI running while testing payments locally.

## Running the Application

### Backend

Start the Spring Boot backend from the `backend` directory:

```bash
cd backend
mvn spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

### Frontend

Open a second terminal and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## Creating an Administrator

Newly registered accounts automatically receive `ROLE_USER`.

For local development, register a normal account and find its ID in PostgreSQL:

```sql
SELECT id, email
FROM users
WHERE email = 'your@email.com';
```

Assign `ROLE_ADMIN` using the returned user ID:

```sql
INSERT INTO user_roles (user_id, role)
VALUES (1, 'ROLE_ADMIN');
```

Replace `1` with the actual user ID.

Log out and sign in again to receive a new access token containing the administrator role. The protected administration dashboard will then become available.

## Testing

Run the backend tests:

```bash
cd backend
mvn test
```

Run the frontend production build:

```bash
cd frontend
npm run build
```

Check frontend dependencies for known vulnerabilities:

```bash
npm audit
```

## Known Scope

Stripe is configured for test-mode development. Shipping-state management and refund processing are not part of the current user interface.

A production deployment should additionally provide:

- HTTPS
- `AUTH_COOKIE_SECURE=true`
- Managed secrets
- Database migrations
- Monitoring and logging
- Rate limiting
- A dedicated administrator-provisioning process

## Technology Stack

- Java 17 and Spring Boot 3
- Spring Web, Spring Security, Spring Data JPA, and Bean Validation
- JWT access tokens and rotating refresh tokens
- PostgreSQL and Hibernate
- Stripe Java SDK, signed webhooks, and Stripe Elements
- React 18, React Router, Axios, and Vite
- Recharts and Tailwind CSS

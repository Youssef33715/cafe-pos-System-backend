# Boda Cafe POS — Backend API

A RESTful backend for a cafe Point of Sale (POS) system. It provides the core API for managing staff access, menu categories and products, dine-in tables, orders, checkout, delivery orders, dashboard statistics, and sales reports.

Built with **Node.js, Express 5, MongoDB, and Mongoose**.

---

## Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Run the Server](#run-the-server)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Data Models](#data-models)
- [Images and Uploads](#images-and-uploads)
- [Error Handling](#error-handling)
- [Production Notes](#production-notes)

## Features

### Authentication & Access Control
- Staff signup and login.
- Password hashing with bcrypt.
- JWT-based authentication.
- Role-based authorization for `admin` and `cashier` users.
- Ability to deactivate accounts.

### Menu Management
- Create, read, update, and delete categories.
- Create, read, update, and delete products.
- Associate products with categories.
- Control product availability.
- Upload category and product images.

### Table Management
- Manage cafe tables.
- Track table availability (`available` / `occupied`).
- Automatically mark a dine-in table as occupied when an order is opened.
- Release the table after checkout or cancellation.

### Order Management
- Support for dine-in and delivery orders.
- Automatically generated sequential order numbers, starting at `1001`.
- Add products to an active order.
- Increase, update, or remove order items.
- Calculate order totals from item prices and quantities.
- Checkout using cash or card.
- Cancel active orders.
- Retrieve order details and receipt data.

### Delivery Management
- Create delivery orders with customer name, phone, and address.
- List and retrieve delivery orders.
- Track delivery status: `preparing`, `out_for_delivery`, and `delivered`.

### Dashboard & Reports
- Dashboard statistics for orders, tables, products, and categories.
- Total sales calculated from completed orders.
- Daily and monthly sales reports.
- Average order value.
- Top 10 best-selling products.

## Tech Stack

| Technology | Purpose |
| --- | --- |
| Node.js | JavaScript runtime |
| Express 5 | REST API framework |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| JWT (`jsonwebtoken`) | Authentication |
| bcryptjs | Password hashing |
| express-validator | Request validation |
| Multer | Image uploads |
| Helmet | HTTP security headers |
| HPP | HTTP parameter pollution protection |
| CORS | Cross-origin resource sharing |
| Morgan | HTTP request logging |
| Nodemailer | Email transport utility |

## Project Structure

```text
.
├── config/
│   └── database.js
├── middleware/
│   ├── errorMiddleware.js
│   ├── uploadimageMiddleware.js
│   └── validatorMiddleware.js
├── models/
│   ├── categoryModel.js
│   ├── orderItemModel.js
│   ├── orderModel.js
│   ├── productModel.js
│   ├── tableModel.js
│   └── userModel.js
├── routes/
│   ├── authRoute.js
│   ├── categoryRoute.js
│   ├── dashboardRoute.js
│   ├── index.js
│   ├── orderRoute.js
│   ├── productRoute.js
│   ├── reportRoute.js
│   └── tableRoute.js
├── services/
│   ├── authService.js
│   ├── categoryService.js
│   ├── dashboardService.js
│   ├── handlersFactory.js
│   ├── orderService.js
│   ├── productService.js
│   ├── reportService.js
│   └── tableService.js
├── utils/
│   ├── apiError.js
│   ├── apiFeatures.js
│   ├── createToken.js
│   ├── sendEmail.js
│   └── validators/
├── uploads/
├── server.js
├── config.env
└── package.json
```

The application separates route definitions, business logic, database models, middleware, and shared utilities to keep the codebase organized and maintainable.

## Getting Started

### Prerequisites

- Node.js (a current LTS release is recommended).
- npm.
- A MongoDB database, either local or hosted on MongoDB Atlas.

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <repository-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `config.env` file in the project root. Use the variables listed below.

### 4. Start the development server

```bash
npm run start:dev
```

The API runs on port `8000` by default, unless a different `PORT` is configured.

Check the root endpoint:

```http
GET /
```

A successful response confirms that the API server is running:

```json
{
  "message": "Pos System Cafe API is running"
}
```

## Environment Variables

Create `config.env` in the root directory:

```env
NODE_ENV=development
PORT=8000

DB_URL=mongodb://127.0.0.1:27017/boda-cafe-pos

JWT_SECRET_KEY=replace_with_a_long_random_secret
JWT_EXPIRE_TIME=90d
```

| Variable | Description |
| --- | --- |
| `NODE_ENV` | Application environment (`development` or `production`) |
| `PORT` | Port used by the Express server |
| `DB_URL` | MongoDB connection string |
| `JWT_SECRET_KEY` | Secret used to sign and verify JWTs |
| `JWT_EXPIRE_TIME` | JWT expiration duration, for example `90d` |

**Important:** Never commit `config.env`, database credentials, or JWT secrets to Git. Use your hosting provider's environment-variable settings in production.

## Run the Server

Development:

```bash
npm run start:dev
```

Production:

```bash
npm run start:prod
```

The production script sets `NODE_ENV=production` before starting the server.

## API Reference

All versioned endpoints use this base path:

```text
/api/v1
```

Protected endpoints require a valid JWT in the request header:

```http
Authorization: Bearer <your_token>
```

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/signup` | Public | Create a staff account |
| POST | `/auth/login` | Public | Login and receive a JWT |

Example login body:

```json
{
  "email": "staff@example.com",
  "password": "your-password"
}
```

### Categories

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/categories` | Public | Get all categories |
| GET | `/categories/:id` | Public | Get a category |
| POST | `/categories` | Admin | Create a category |
| PUT | `/categories/:id` | Admin | Update a category |
| DELETE | `/categories/:id` | Admin | Delete a category |

For category creation or update with an image, send `multipart/form-data` and use the field name `image`.

### Products

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/products` | Authenticated | Get products |
| GET | `/products/:id` | Authenticated | Get a product |
| POST | `/products` | Admin | Create a product |
| PUT | `/products/:id` | Admin | Update a product |
| DELETE | `/products/:id` | Admin | Delete a product |

For product creation or update with an image, send `multipart/form-data` and use the field name `image`.

### Tables

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/tables` | Authenticated | Get all tables |
| GET | `/tables/:id` | Authenticated | Get a table |
| POST | `/tables` | Admin | Create a table |
| PUT | `/tables/:id` | Admin | Update a table |
| DELETE | `/tables/:id` | Admin | Delete a table |

### Orders

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/orders` | Admin, Cashier | Get completed orders |
| POST | `/orders` | Admin, Cashier | Create a dine-in or delivery order |
| GET | `/orders/:id` | Admin, Cashier | Get order details |
| DELETE | `/orders/:id` | Admin, Cashier | Delete an order |
| GET | `/orders/table/:tableId` | Admin, Cashier | Get the active order for a table |
| POST | `/orders/:orderId/items` | Admin, Cashier | Add a product to an order |
| PUT | `/orders/items/:itemId` | Admin, Cashier | Update an order item's quantity |
| DELETE | `/orders/items/:itemId` | Admin, Cashier | Remove an order item |
| PUT | `/orders/:orderId/checkout` | Admin, Cashier | Complete checkout |
| PUT | `/orders/:orderId/cancel` | Admin, Cashier | Cancel an active order |
| GET | `/orders/:orderId/receipt` | Admin, Cashier | Get receipt information |
| GET | `/orders/delivery` | Admin, Cashier | List delivery orders |
| GET | `/orders/delivery/:id` | Admin, Cashier | Get delivery order details |
| PUT | `/orders/:id/delivery-status` | Admin, Cashier | Update delivery status |

Example dine-in order:

```json
{
  "table": "<table_id>",
  "orderType": "dineIn"
}
```

Example delivery order:

```json
{
  "orderType": "delivery",
  "customerName": "Customer Name",
  "customerPhone": "01000000000",
  "deliveryAddress": "Customer address"
}
```

Add a product to an order:

```json
{
  "product": "<product_id>",
  "quantity": 2
}
```

Checkout an order:

```json
{
  "paymentMethod": "cash"
}
```

Supported payment methods: `cash`, `card`.

Supported order types: `dineIn`, `delivery`.

Supported order statuses: `active`, `completed`, `cancelled`.

Supported delivery statuses: `preparing`, `out_for_delivery`, `delivered`.

### Dashboard

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/dashboard` | Admin | Get dashboard statistics |

### Reports

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/reports/daily` | Admin | Get today's sales report |
| GET | `/reports/monthly` | Admin | Get the current month's sales report |
| GET | `/reports/best-products` | Admin | Get the top 10 best-selling products |

## Authentication

After a successful login or signup, the API returns a JWT. Include it in the `Authorization` header when calling protected endpoints.

```http
Authorization: Bearer eyJhbGciOi...
```

The API supports two roles:

| Role | Permissions |
| --- | --- |
| `admin` | Full administrative access, including menu, table, dashboard, and report management |
| `cashier` | Access to operational POS workflows such as orders and checkout |

Access is enforced through authentication and role-authorization middleware.

## Data Models

The main MongoDB collections are:

- **User:** name, email, hashed password, role, and active status.
- **Category:** name, image, and active status.
- **Product:** name, description, price, image, category, and availability.
- **Table:** table number and availability status.
- **Order:** order number, table, cashier, items total, order type, payment method, status, and delivery/customer details.
- **OrderItem:** order, product, quantity, unit price, and calculated line total.

Mongoose timestamps are enabled on the models, so records include `createdAt` and `updatedAt`.

## Images and Uploads

Uploaded category and product images are stored locally under:

```text
uploads/
├── categories/
└── products/
```

The API serves these files from the `/uploads` path. The image field returned by the API contains a relative path, for example:

```text
/uploads/products/product-image.jpg
```

When deploying to a platform with an ephemeral filesystem, configure persistent storage or move uploads to an object-storage service. Otherwise, uploaded files may not survive redeployments.

## Error Handling

The API uses centralized error-handling middleware and a shared `ApiError` utility. Validation and operational errors are returned as JSON responses with appropriate HTTP status codes.

Common status codes include:

| Code | Meaning |
| --- | --- |
| `200` | Request completed successfully |
| `201` | Resource created |
| `204` | Resource deleted successfully |
| `400` | Invalid request or business-rule violation |
| `401` | Authentication required or token invalid |
| `403` | Authenticated user is not allowed to perform the action |
| `404` | Resource not found |
| `500` | Internal server error |

## Production Notes

Before deploying this project for real business use:

- Restrict public signup and prevent users from assigning themselves the `admin` role. Create the initial administrator through a controlled process.
- Configure a production MongoDB connection string and strong JWT secret.
- Configure CORS for the exact frontend origins that should access the API.
- Use persistent/object storage for uploaded images.
- Add request logging, monitoring, backups, and a documented recovery process.
- Review authorization rules and validate all incoming data before exposing the API publicly.

---

## License

No open-source license is currently specified in this repository. Add a `LICENSE` file if you intend to publish the project for reuse.

---

**Boda Cafe POS Backend** — powering cafe operations through a structured REST API.

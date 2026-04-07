# M1Cart - E-Commerce Application

A modern full-stack e-commerce application built with React and Node.js, featuring multi-vendor commerce, Stripe payments, approval workflows, account verification, and dedicated buyer, seller, and admin experiences.

## Features

- 🛒 Full shopping cart functionality with persistent storage
- 👥 Multi-role system (Buyer, Seller, Admin)
- 💳 Stripe payment integration
- 📦 Multi-vendor order splitting
- ⭐ Product ratings and reviews
- 🎨 Light/Dark theme support
- 📱 Responsive design
- 🔍 Advanced product search and filtering
- 📦 Category-based browsing
- 🖥️ Product detail pages with image zoom
- 📊 Admin dashboard with analytics
- 🏪 Seller dashboard for product management
- 📋 Order management for all roles
- ✉️ Email verification with OTP flows
- 🔐 Forgot password and secure password reset flows
- 🔄 Cart sync between local storage and authenticated accounts
- 💬 Live customer support integrations with Tidio and WhatsApp
- 🔎 Search suggestions with recent search history
- ⚡ Lazy-loaded routes, reusable UI patterns, and error boundaries

## Latest Features

- Account verification with OTP-based email confirmation
- Password update for logged-in users plus email-based password reset
- Search autocomplete with saved recent searches
- Synced carts for authenticated users to preserve backend cart state
- Seller workspace for product and order handling
- Admin workspace for analytics, user management, product moderation, and orders
- Payment verification and Stripe webhook handling
- Built-in notification system and support chat integrations

## Project Structure

```
M1Cart/                      # Frontend React application (Vite)
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── modals/          # Modal components (ProductModal)
│   │   ├── cart-item/       # Cart item sub-components
│   │   ├── patterns/        # Loading patterns/spinners
│   │   ├── AdminOrders.jsx  # Admin order management
│   │   ├── Analysis.jsx     # Sales analytics charts
│   │   ├── CartItem.jsx     # Cart item display
│   │   ├── CartSummary.jsx  # Cart total calculation
│   │   ├── ChatAssistantOverlay.jsx # AI chat assistant
│   │   ├── Comments.jsx     # Product reviews
│   │   ├── Footer.jsx       # Site footer
│   │   ├── ImageZoom.jsx    # Product image zoom
│   │   ├── ItemDescription.jsx # Product details page
│   │   ├── Navigation.jsx   # Main navigation
│   │   ├── NotificationDisplay.jsx # Toast notifications
│   │   ├── Pagination.jsx   # Pagination controls
│   │   ├── PasswordInput.jsx # Secure password input
│   │   ├── PatternShowcase.jsx # Design patterns demo
│   │   ├── PieChart.jsx     # Analytics pie chart
│   │   ├── ProductCard.jsx  # Product grid card
│   │   ├── Products.jsx     # Product listing page
│   │   ├── SellerOrders.jsx # Seller order management
│   │   ├── SellerProducts.jsx # Seller product management
│   │   ├── ThemeToggle.jsx  # Theme switcher
│   │   ├── TidioChat.jsx    # Tidio chatbot integration
│   │   ├── Users.jsx        # User management (admin)
│   │   └── WhatsAppWidget.jsx # WhatsApp contact widget
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Home/landing page
│   │   ├── Categories.jsx  # Category browsing
│   │   ├── Search.jsx       # Search results page
│   │   ├── Cart.jsx         # Shopping cart page
│   │   ├── Checkout.jsx     # Checkout/payment page
│   │   ├── Login.jsx        # Authentication page
│   │   ├── Reset.jsx        # Password reset page
│   │   ├── Dashboard.jsx    # User dashboard
│   │   ├── Orders.jsx       # Order history
│   │   ├── AdminDashboard.jsx # Admin analytics dashboard
│   │   └── SellerDashboard.jsx # Seller management dashboard
│   ├── context/             # React contexts
│   │   ├── AppProvider.jsx  # Main app provider
│   │   ├── CartContext.jsx  # Cart state management
│   │   ├── ThemeContext.jsx # Theme state (light/dark)
│   │   └── NotificationContext.jsx # Notifications
│   ├── hooks/               # Custom React hooks
│   │   ├── useCartEvents.js # Cart event handling
│   │   ├── useLocalStorage.js # Local storage hook
│   │   └── useWindowSize.js # Window resize hook
│   ├── services/            # API services
│   │   ├── api.js           # Axios API client
│   │   ├── auth/            # Authentication services
│   │   ├── cart/            # Cart services
│   │   ├── comments/        # Review services
│   │   ├── orders/          # Order services
│   │   ├── products/        # Product services
│   │   └── users/           # User services
│   ├── hocs/                # Higher-order components
│   │   ├── withCartActions.jsx # Cart actions wrapper
│   │   ├── withErrorBoundary.jsx # Error boundary
│   │   ├── withLoading.jsx  # Loading wrapper
│   │   └── withLogger.jsx   # Logging wrapper
│   ├── utils/               # Utility functions
│   │   └── eventBus.js      # Event bus for components
│   ├── config/
│   │   └── env.js           # Environment configuration
│   ├── styles/              # Global styles
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
│
ProductsAPI/                 # Backend Node.js/Express API
├── config/
│   ├── db.js                # MongoDB connection
│   └── index.js             # Configuration management
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── commentController.js # Reviews/ratings logic
│   ├── paymentController.js # Stripe payment logic
│   └── productController.js # Product CRUD logic
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── sellerAuth.js        # Seller role verification
├── models/
│   ├── User.js              # User model (buyer/seller/admin)
│   ├── Product.js           # Product model
│   ├── Order.js             # Order model with splitting
│   └── Comment.js           # Product review model
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── productRoutes.js     # Product routes
│   ├── paymentRoutes.js     # Payment/order routes
│   ├── commentRoutes.js     # Review routes
│   └── searchRoutes.js      # Search-related routes
├── services/
│   ├── emailTransport.js    # Email sending (Nodemailer)
│   ├── invoiceService.js    # Invoice generation
│   ├── orderUpdateService.js # Order notifications
│   ├── passwordResetService.js # Password reset
│   ├── productReviewService.js # Review management
│   ├── ratingSubmissionService.js # Rating handling
│   └── verificationService.js # Email verification
├── seed.js                  # Database seeding script
└── server.js                # Express server entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Stripe account (for payments)

### Installation

1. **Install Backend Dependencies**

   ```bash
   cd ProductsAPI
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd M1Cart
   npm install
   ```

### Configuration

1. **Backend Environment**
   Create `ProductsAPI/.env`:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/m1cart
   JWT_SECRET=your_jwt_secret_key
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```

2. **Frontend Environment**
   Create `M1Cart/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_STRIPE_PUBLIC_KEY=pk_test_...
   VITE_WHATSAPP_NUMBER=1234567890
   VITE_WHATSAPP_ACCOUNT_NAME=M1Cart Support
   ```

### Running the Application

1. **Start MongoDB**

   ```bash
   mongod
   ```

2. **Seed the Database**

   ```bash
   cd ProductsAPI
   npm run seed
   ```

3. **Start Backend Server**

   ```bash
   cd ProductsAPI
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

4. **Start Frontend Development Server**

   ```bash
   cd M1Cart
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## User Roles

| Role       | Description                                                                             |
| ---------- | --------------------------------------------------------------------------------------- |
| **Buyer**  | Browse products, add to cart, place orders, view order history                          |
| **Seller** | All buyer abilities + manage products, view seller orders, update order status          |
| **Admin**  | All abilities + user management, product approval, view all orders, analytics dashboard |

## API Endpoints

### Products API

| Method | Endpoint                           | Description                            | Auth     |
| ------ | ---------------------------------- | -------------------------------------- | -------- |
| GET    | `/products`                        | Get all products                       | Public   |
| GET    | `/products/categories`             | Get all categories                     | Public   |
| GET    | `/products/suggestions`            | Get search suggestions                 | Public   |
| GET    | `/products/latest-pid`             | Get latest product ID                  | Public   |
| GET    | `/products/:pid`                   | Get product by ID                      | Public   |
| POST   | `/products/createProduct`          | Create new product                     | Seller   |
| POST   | `/products/createMultipleProducts` | Create multiple products               | Seller   |
| PUT    | `/products/updateProduct/:pid`     | Update product                         | Public\* |
| PUT    | `/products/updateStatus/:pid`      | Update product status (approve/reject) | Admin    |
| POST   | `/products/approve-all-by-seller`  | Bulk approve one seller's products     | Admin    |
| DELETE | `/products/deleteProduct/:pid`     | Delete product                         | Public\* |
| GET    | `/products/my-products`            | Get seller's products                  | Seller   |
| GET    | `/products/all`                    | Get all products (all statuses)        | Admin    |

### Authentication API

| Method | Endpoint                         | Description             | Auth      |
| ------ | -------------------------------- | ----------------------- | --------- |
| POST   | `/auth/register`                 | Register new user       | Public    |
| POST   | `/auth/login`                    | User login              | Public    |
| POST   | `/auth/check-email`              | Check if email exists   | Public    |
| POST   | `/auth/forgot-password`          | Request password reset  | Public    |
| POST   | `/auth/reset-password`           | Reset password          | Public    |
| GET    | `/auth/profile`                  | Get user profile        | Protected |
| PUT    | `/auth/update-password`          | Update password         | Protected |
| POST   | `/auth/cart`                     | Save cart to profile    | Protected |
| GET    | `/auth/cart`                     | Load cart from profile  | Protected |
| POST   | `/auth/logout`                   | Logout user             | Protected |
| POST   | `/auth/send-verification-otp`    | Send verification email | Protected |
| POST   | `/auth/verify-otp`               | Verify email with OTP   | Protected |
| GET    | `/auth/all-users`                | Get all users           | Admin     |
| PUT    | `/auth/update-user/:id`          | Update user             | Admin     |
| PUT    | `/auth/change-user-password/:id` | Change user password    | Admin     |
| PUT    | `/auth/deactivate-user/:id`      | Deactivate user         | Admin     |

### Payment/Orders API

| Method | Endpoint                                 | Description                  | Auth      |
| ------ | ---------------------------------------- | ---------------------------- | --------- |
| POST   | `/payment/create-payment-intent`         | Create Stripe payment intent | Protected |
| POST   | `/payment/payment-success`               | Handle successful payment    | Protected |
| POST   | `/payment/webhook`                       | Stripe webhook handler       | Public    |
| GET    | `/payment/orders`                        | Get user's orders            | Protected |
| GET    | `/payment/order/:orderId`                | Get order status             | Protected |
| POST   | `/payment/verify-payment`                | Verify payment status        | Protected |
| GET    | `/payment/admin/orders`                  | Get all orders (admin)       | Admin     |
| PUT    | `/payment/admin/orders/:orderId/status`  | Update order status          | Admin     |
| GET    | `/payment/seller/orders`                 | Get seller's orders          | Seller    |
| PUT    | `/payment/seller/orders/:orderId/status` | Update seller's order status | Seller    |

### Comments/Reviews API

| Method | Endpoint                 | Description              | Auth      |
| ------ | ------------------------ | ------------------------ | --------- |
| GET    | `/comments/product/:pid` | Get comments for product | Public    |
| GET    | `/comments/stats/:pid`   | Get rating statistics    | Public    |
| POST   | `/comments`              | Add review/comment       | Protected |
| PUT    | `/comments/:id`          | Update comment           | Protected |
| DELETE | `/comments/:id`          | Delete comment           | Protected |

## Key Features Explained

### Multi-Vendor Order Splitting

When a buyer orders products from multiple sellers, the system automatically splits the order into separate orders for each seller. This allows:

- Each seller to manage their own orders independently
- Track order status per seller
- Individual shipping and fulfillment

### Product Approval Workflow

Products go through an approval workflow:

1. **Submitted** - Seller creates product (default)
2. **Approved** - Admin approves the product (visible to buyers)
3. **Rejected** - Admin rejects with reason

### Authentication & Security

- JWT-based authentication with cookies
- Password hashing with bcrypt
- Email verification with OTP
- Role-based access control
- Password reset by emailed token
- In-app password update with validation rules

### Cart Functionality

- Add/remove items
- Update quantities
- Persistent storage (localStorage + database)
- Cart synchronization when logged in
- Protection against anonymous cart overwrite after login

### Search & Discovery

- Category filtering, sorting, and paginated results
- Search suggestions in the main navigation
- Recent search history stored locally
- Product detail pages with ratings and zoom

### Theme System

- Light/Dark mode toggle
- Persisted theme preference in localStorage
- CSS custom properties for theming

## Technologies

### Frontend

| Technology   | Version | Purpose      |
| ------------ | ------- | ------------ |
| React        | 19.2.0  | UI Framework |
| React Router | 7.12.0  | Routing      |
| Vite         | 7.2.4   | Build tool   |
| Stripe React | 5.6.0   | Payment UI   |
| ESLint       | 9.39.1  | Linting      |

### Backend

| Technology     | Version | Purpose          |
| -------------- | ------- | ---------------- |
| Node.js        | 14+     | Runtime          |
| Express        | 5.2.1   | Web Framework    |
| MongoDB        | -       | Database         |
| Mongoose       | 9.1.4   | ODM              |
| Stripe         | 20.3.1  | Payments         |
| JSON Web Token | 9.0.3   | Auth             |
| Bcryptjs       | 3.0.3   | Password hashing |
| Nodemailer     | 8.0.1   | Email            |
| Cookie Parser  | 1.4.7   | Cookies          |

## Database Models

### User Schema

- email, password, name
- role (buyer/seller/admin)
- businessName (required for sellers)
- cart array
- products array (seller's products)
- isVerified, verificationOTP

### Product Schema

- pid (unique number)
- name, category, price, image
- description, rating
- inStock, status (Submitted/Approved/Rejected/Deleted)
- rejectionReason, user (seller reference)

### Order Schema

- userId, orderNumber
- paymentIntentId, amount, currency
- status (pending/completed/failed/cancelled/dispatched/delivered/returned/refunded)
- parentOrderId (for order splitting)
- sellerBusinessName, splitProcessed
- items array

### Comment Schema

- pid, userId
- rating, comment
- createdAt, updatedAt

## Environment Variables

### Backend (.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/m1cart
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

### Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_WHATSAPP_NUMBER=1234567890
VITE_WHATSAPP_ACCOUNT_NAME=M1Cart Support
```

## License

ISC

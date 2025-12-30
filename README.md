# Temple Coupon Booking System

A modern web application for booking temple prasad and food coupons online, built with Next.js 16, React 19, TypeScript, and Supabase.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 📋 Features

### User Features
- **Coupon Booking**: Browse and purchase temple food coupons by category
- **Prashad Ordering**: Order temple prashad with meal time filtering (breakfast, lunch, dinner)
- **Search & Filter**: Search prashad by name and filter by meal times
- **Shopping Cart**: Add multiple items with quantity management
- **User Authentication**: Secure login/signup with Supabase Auth
- **Payment Integration**: Razorpay payment gateway for secure transactions
- **Order Management**: View order history and status
- **Responsive Design**: Mobile-first responsive UI

### Admin Features
- **Admin Portal**: Separate admin interface for managing prashad
- **Prashad Management**: Add, edit, and manage prashad items
- **Order Tracking**: View and manage customer orders
- **QR Code Scanning**: Scan QR codes for order verification

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Razorpay
- **Email**: Resend
- **Icons**: Lucide React
- **Analytics**: Vercel Analytics

## 📁 Project Structure

```
CouponRepo-Web/
├── app/                    # Next.js App Router
│   ├── actions/           # Server actions
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── coupons/           # Coupon pages
│   └── prashad/           # Prashad pages
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── cart.tsx           # Shopping cart component
│   ├── coupon-list.tsx    # Main coupon listing
│   └── prashad-card.tsx   # Prashad item card
├── lib/                   # Utilities and configurations
│   ├── supabase/          # Supabase client setup
│   ├── types.ts           # TypeScript type definitions
│   └── utils.ts           # Utility functions
├── scripts/               # Database migration scripts
└── admin-portal-for-prashad/  # Separate admin portal
```

## 🗄️ Database Schema

### Core Tables
- **coupons**: Temple food coupons with categories and pricing
- **prashads**: Temple prashad items with meal times
- **orders**: Customer orders with payment details
- **order_items**: Individual items within orders
- **admin_users**: Admin user management

## 🔧 Environment Setup

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Resend (Email)
RESEND_API_KEY=your_resend_api_key
```

## 📦 Installation & Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CouponRepo-Web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase, Razorpay, and Resend credentials

4. **Run database migrations**
   ```bash
   # Execute SQL scripts in the scripts/ directory in order
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔐 Authentication Flow

1. Users can browse coupons and prashad without authentication
2. Authentication required for:
   - Adding items to cart
   - Placing orders
   - Viewing order history
3. Admin authentication separate from user authentication

## 💳 Payment Integration

- Integrated with Razorpay for secure payments
- Supports multiple payment methods
- Order confirmation via email
- Payment status tracking

## 📱 Responsive Design

- Mobile-first approach
- Optimized for tablets and desktops
- Touch-friendly interface
- Progressive Web App features

## 🧪 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support and questions, please contact the development team.
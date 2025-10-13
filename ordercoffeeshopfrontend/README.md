# ☕ Coffee Shop E-Commerce Frontend

A full-featured coffee shop e-commerce application with role-based access control for Customers, Baristas, and Admins.

## 🚀 Features

### Customer Features
- ✅ Browse coffee menu with categories
- ✅ Add items to cart with size selection
- ✅ View order summary with VAT & shipping
- ✅ Apply discount coupons
- ✅ Place orders
- ✅ View order history

### Barista Features
- ✅ Real-time order notifications (WebSocket simulation)
- ✅ View pending orders
- ✅ Update order status (Pending → Preparing → Ready → Completed)
- ✅ Order management dashboard

### Admin Features
- ✅ Menu management (CRUD operations)
- ✅ User management (roles, permissions)
- ✅ Revenue reports with charts
- ✅ Export data (Excel/PDF simulation)
- ✅ Access to all features

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Demo Accounts

### Customer Account
- **Email:** customer@coffeeshop.com
- **Password:** customer123
- **Access:** Browse menu, place orders, view order history

### Barista Account
- **Email:** barista@coffeeshop.com
- **Password:** barista123
- **Access:** Order management dashboard, update order status

### Admin Account
- **Email:** admin@test.com
- **Password:** 12345678
- **Access:** Full system access (menu, users, reports)

## 🎯 Usage Guide

### For Customers
1. **Browse Menu:** Visit homepage to see available coffee items
2. **Add to Cart:** Click "Add to Cart" on any item
3. **Checkout:** Click cart icon → Review order → Apply coupon (try: SAVE10, SAVE20, WELCOME)
4. **Place Order:** Complete checkout to place order
5. **View Orders:** Check "My Orders" to see order history

### For Baristas
1. **Login:** Use barista credentials
2. **Dashboard:** View all pending orders in real-time
3. **Process Orders:** 
   - Click "Start Preparing" for pending orders
   - Click "Mark Ready" when coffee is ready
   - Click "Complete" when customer picks up

### For Admins
1. **Menu Management:** Add/Edit/Delete coffee items
2. **User Management:** View users, change roles, manage accounts
3. **Reports:** View revenue charts, top products, export data
4. **Barista View:** Access barista dashboard for order management

## 🎨 Available Coupons

- **SAVE10** - 10% discount
- **SAVE20** - 20% discount
- **WELCOME** - 15% discount

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

## 🗂️ Project Structure

```
src/
├── components/          # Reusable components
│   ├── layout/         # Layout components (Navbar, Layout)
│   ├── ui/             # UI components (Grid, etc.)
│   ├── Cart.tsx        # Shopping cart
│   ├── CoffeeCard.tsx  # Product card
│   └── ProtectedRoute.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── hooks/              # Custom hooks
│   └── useMediaQuery.ts
├── pages/              # Page components
│   ├── Home.tsx        # Customer menu page
│   ├── Checkout.tsx    # Checkout page
│   ├── Orders.tsx      # Order history
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── BaristaDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── AdminMenu.tsx
│   ├── AdminUsers.tsx
│   └── AdminReports.tsx
├── services/           # API services
│   └── mockApi.ts      # Mock API (simulates backend)
├── types/              # TypeScript types
│   └── coffee.ts
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration
- `tailwind.config.cjs` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `tsconfig.json` - TypeScript configuration

## 🚧 Mock Backend

This project uses a mock API (`src/services/mockApi.ts`) to simulate backend functionality:
- Mock authentication with JWT tokens
- Mock database for products, orders, users
- Mock WebSocket for real-time notifications
- All data is stored in memory (resets on page refresh)

## 📝 Notes

- **Authentication:** Uses localStorage for token storage
- **State Management:** Uses React Context API
- **Real-time Updates:** Simulated with mock WebSocket
- **Data Persistence:** In-memory only (no actual database)

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)

## 📄 License

MIT License

---

**Made with ☕ and ❤️**

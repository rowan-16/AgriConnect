# AgriConnect (Version 1.0) 🌾
> **Direct Farmer-to-Consumer Digital Marketplace & AI Agronomic Advisory Platform**

AgriConnect is a comprehensive web platform that bridges small and marginal farmers directly with consumers, removing intermediary markups and providing data-driven tools for crop planning, market demand insights, real-time weather integration, and an interactive AI Chatbot assistant.

---

## 🚀 Key Modules Implemented (SRS v1.0 Scope)

1. **User Management Module (REQ-1.1 to REQ-1.6)**
   - Role-based registration & authentication for Farmer, Customer, and Admin.
   - Admin verification check before Farmers can publish listings.
   - JWT-style stateless session management & password reset mechanisms.

2. **Farmer Portal (REQ-2.1 to REQ-2.5)**
   - Create, edit, and manage crop listings with real-time stock auto-deduction.
   - Accept, reject, and fulfill incoming buyer procurement orders.
   - Aggregate sales and revenue analytics dashboard.

3. **Customer / Buyer Portal (REQ-3.1 to REQ-3.5)**
   - Search, filter, and browse fresh farm produce by category, region, price, and organic status.
   - Persistent shopping cart & multi-item checkout flow.
   - Live order tracking and post-delivery farmer ratings (1-5 stars) and reviews.

4. **Order and Payment Module (REQ-4.1 to REQ-4.5)**
   - Complete order lifecycle states (`placed` → `confirmed` → `processing` → `shipped` → `delivered`).
   - Integrated test/sandbox payment gateway simulator (Razorpay / Stripe).
   - Automated GST-compliant Tax Invoice Generator (`InvoiceModal`) downloadable as PDF/print.

5. **Admin Panel (REQ-5.1 to REQ-5.5)**
   - Pending Farmer verification queue with instant approval/rejection.
   - Master data management for crop categories and supported geographical regions.
   - Platform analytics, total sales monitoring, and flagged dispute resolution.

6. **AI Crop Recommendation Module (REQ-6.1 to REQ-6.5)**
   - Agronomic advisory model assessing Soil Type (Alluvial, Black, Red, Clayey), Season (Kharif, Rabi, Zaid), temperature, and rainfall.
   - Confidence scoring, yield estimates, and companion crop recommendations.

7. **Market Demand Insight Module (REQ-7.1 to REQ-7.5)**
   - Moving order volume and relative growth percentage analysis using internal platform transactions.
   - Scheduled batch calculations and clear warnings for crops with insufficient transaction volume.

8. **Weather Integration Module (REQ-8.1 to REQ-8.5)**
   - Live weather monitoring (temperature, humidity, precipitation, soil moisture) via OpenWeatherMap API with 30-minute caching and graceful fallback.

9. **AI Chatbot Module (REQ-9.1 to REQ-9.5)**
   - Interactive floating assistant (**AgriBot AI**) accessible across all portals.
   - Grounded context integration pulling from Crop Advisory, Weather Service, Market Trends, and Customer Order history.
   - Explicit fallback warnings when queries cannot be grounded in platform records.

10. **Notification Module (REQ-10.1 to REQ-10.4)**
    - Real-time in-app alerts and email dispatches for order status changes and account approval status.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, TypeScript, Vite
- **Styling & UI**: Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **State & Context**: React Context API (`AuthContext`, `CartContext`, `NotificationContext`, `ToastContext`)
- **Persistence**: LocalStorage persistence layer with pre-populated seed evaluation data
- **Build & Quality**: Oxlint, TypeScript Compiler

---

## 🍃 Online MongoDB (MongoDB Atlas) Integration

AgriConnect includes a complete Express + Mongoose REST API server designed for **MongoDB Atlas** (Cloud Database):

### Setting up MongoDB Atlas:
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Obtain your Connection String URI (e.g., `mongodb+srv://<username>:<password>@cluster0.mongodb.net/agriconnect?retryWrites=true&w=majority`).
3. Copy `server/.env.example` to `server/.env` and paste your `MONGODB_URI`.
4. Start the Express API server:
   ```bash
   npm run server
   ```

---

## 💻 Getting Started & Development

### 1. Installation
```bash
npm install
```

### 2. Run Development Frontend
```bash
npm run dev
```

### 3. Run Express + MongoDB Backend
```bash
npm run server
```

### 4. Build for Production Verification
```bash
npm run build
```

---

## 📄 Documentation References
- [`SRS.md`](SRS.md): Complete IEEE 830-1998 Software Requirements Specification for AgriConnect v1.0.

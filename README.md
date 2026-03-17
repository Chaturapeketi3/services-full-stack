# 🏠 HouseMate — Home Services Booking Platform

> A full-stack web application connecting customers with skilled home service professionals. Book plumbing, electrical, cleaning, and more — all in one place.

---

## 📋 Table of Contents

1. [Project Description](#project-description)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Architecture](#project-architecture)
5. [Installation](#installation)
6. [Environment Setup](#environment-setup)
7. [API Overview](#api-overview)
8. [User Workflows](#user-workflows)
9. [Key Modules](#key-modules)
10. [Currency](#currency)
11. [Screenshots](#screenshots)
12. [Future Improvements](#future-improvements)
13. [Author](#author)

---

## 📖 Project Description

**HouseMate** is a production-grade home services marketplace built with **Angular 17** (frontend) and **FastAPI** (backend). The platform supports two user roles:

- **Customers** who browse and book home services from verified professionals.
- **Experts** who receive job assignments, manage their schedule, and track earnings.

All transactions are recorded in **Indian Rupees (₹)**.

---

## ✨ Features

### 👤 Customer Features
- Register & login with role-based authentication
- Browse service categories and individual services
- Select an available expert and time slot (start + end time)
- Manage saved addresses from profile
- Complete secure payment (Card, UPI, Net Banking) in ₹
- View, modify, or cancel bookings
- Leave ratings for completed bookings
- View booking history with duration and amount details

### 🔧 Expert Features
- Register & login as a service professional
- Toggle online/offline availability to receive jobs
- View all assigned job requests with booking details
- Accept or reject incoming jobs
- Mark accepted jobs as completed
- View comprehensive earnings dashboard with:
  - Total earnings
  - Completed job count
  - Pending requests count
- View paginated earnings history (amount earned, platform fee, net payout)

---

## 🛠️ Tech Stack

| Layer       | Technology                     |
|-------------|-------------------------------|
| Frontend    | Angular 17 (Standalone Components, Reactive Forms) |
| Backend     | FastAPI (Python 3.11+)        |
| Database    | PostgreSQL                    |
| ORM         | SQLAlchemy 2.0 (async)        |
| Migrations  | Alembic                       |
| Auth        | JWT (Bearer Token)            |
| Validation  | Pydantic v2                   |
| HTTP Client | Angular HttpClient            |

---

## 🏗️ Project Architecture

```
chesuko/
├── frontend/                  # Angular SPA
│   └── src/app/
│       ├── app.routes.ts      # All application routes
│       ├── core/
│       │   ├── guards/        # Auth guards (authGuard)
│       │   └── interceptors/  # JWT auth interceptor
│       ├── features/
│       │   ├── auth/          # Login, Register, AuthService
│       │   ├── booking/       # Service list, Booking flow, Details
│       │   ├── customer/      # Customer dashboard, Bookings, Profile
│       │   ├── expert/        # Expert dashboard, Jobs, Earnings, Schedule
│       │   ├── payment/       # Payment modal
│       │   └── public/        # Landing page
│       └── shared/
│           └── models/        # Shared TypeScript interfaces
│
└── backend/                   # FastAPI Application
    └── app/
        ├── main.py            # FastAPI entry point, CORS config
        ├── api/               # Route handlers
        │   ├── auth.py
        │   ├── bookings.py
        │   ├── catalog.py
        │   ├── experts.py
        │   ├── payments.py
        │   └── ratings.py
        ├── services/          # Business logic layer
        │   ├── auth_service.py
        │   ├── booking_service.py
        │   ├── catalog_service.py
        │   ├── expert_service.py
        │   ├── payment_service.py
        │   └── rating_service.py
        ├── models/all.py      # SQLAlchemy ORM models
        ├── schemas/           # Pydantic schemas for validation
        ├── repositories/      # Data access layer (CRUD)
        └── core/              # Exceptions, JWT utilities
```

---

## ⚙️ Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run start
```

> The Angular app runs on `http://localhost:4200`  
> The FastAPI backend runs on `http://localhost:8000`

---

## 🌐 Environment Setup

### Backend `.env`

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/housemate
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Frontend `environment.ts`

Located at `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

---

## 📡 API Overview

### Authentication
| Method | Endpoint            | Description            |
|--------|---------------------|------------------------|
| POST   | `/auth/register`    | Register a new user    |
| POST   | `/auth/login`       | Login and get JWT      |
| POST   | `/auth/logout`      | Invalidate session     |

### Bookings
| Method | Endpoint                | Description              |
|--------|-------------------------|--------------------------|
| POST   | `/bookings`             | Create a booking         |
| GET    | `/bookings`             | List user's bookings     |
| GET    | `/bookings/{id}`        | Get booking details      |
| PUT    | `/bookings/{id}`        | Update booking / status  |
| DELETE | `/bookings/{id}`        | Cancel booking           |

### Expert
| Method | Endpoint                            | Description                    |
|--------|-------------------------------------|--------------------------------|
| GET    | `/experts/dashboard`                | Summary: earnings, job counts  |
| PUT    | `/experts/availability`             | Toggle online/offline          |
| GET    | `/experts/jobs`                     | List assigned jobs             |
| POST   | `/experts/jobs/{id}/accept`         | Accept a job                   |
| POST   | `/experts/jobs/{id}/reject`         | Reject a job                   |
| GET    | `/experts/earnings`                 | Paginated earnings history     |

### Catalog
| Method | Endpoint                  | Description               |
|--------|---------------------------|---------------------------|
| GET    | `/categories`             | List service categories   |
| GET    | `/services`               | List services by category |
| GET    | `/services/{id}`          | Get service details       |
| GET    | `/experts`                | List available experts    |

### Payments
| Method | Endpoint       | Description             |
|--------|----------------|-------------------------|
| POST   | `/payments`    | Process payment         |
| GET    | `/payments/{id}` | Get payment details   |

### Ratings
| Method | Endpoint   | Description                |
|--------|------------|----------------------------|
| POST   | `/ratings` | Submit rating for booking  |

---

## 🔄 User Workflows

### Customer Workflow
```
Register / Login
    ↓
Browse Service Categories
    ↓
Select a Service
    ↓
Booking Flow (Select Expert + Start/End Time + Address)
    ↓
Secure Payment (Card / UPI / Net Banking)
    ↓
Booking Confirmed → Visible in My Bookings
    ↓
Modify / Cancel (if CONFIRMED or ACCEPTED)
    ↓
Rate Expert (after COMPLETED)
```

### Expert Workflow
```
Register / Login
    ↓
Toggle Online Availability
    ↓
Receive Job Requests (CONFIRMED status)
    ↓
Accept or Reject Job
    ↓
Complete Job → Status: COMPLETED
    ↓
ExpertEarnings Record Created Automatically
    ↓
View Total Earnings on Dashboard
```

---

## 📦 Key Modules

| Module                          | Role                                                      |
|---------------------------------|-----------------------------------------------------------|
| `auth_service.py`               | JWT generation, password hashing, user registration       |
| `booking_service.py`            | Booking CRUD, duration calculation, earnings computation  |
| `payment_service.py`            | Idempotent payment processing, booking status update      |
| `expert_service.py`             | Dashboard summary, job accept/reject, earnings ledger     |
| `rating_service.py`             | Submit and link ratings to bookings                       |
| `expert_repo.py`                | Aggregated queries for earnings sum and history           |
| `auth.guard.ts`                 | Angular route guard checking token + role                 |
| `auth.interceptor.ts`           | Attaches Bearer JWT to all outgoing HTTP requests         |
| `booking-flow.component.ts`     | Multi-step booking form with time range and address       |
| `expert-earnings.component.ts`  | Earnings history table with totals and net payout         |

---

## 💰 Currency

All monetary values in this application use **Indian Rupees (₹ INR)**.

- Service base prices are stored and displayed in ₹
- Booking total amounts are in ₹
- Expert earnings are in ₹
- Payment screens display ₹ consistently

---

## 📸 Screenshots

> _(Placeholder — replace with actual screenshots after deployment)_

| Page                   | Screenshot |
|------------------------|------------|
| Landing Page           | `screenshots/landing.png` |
| Service List           | `screenshots/services.png` |
| Booking Flow           | `screenshots/booking.png` |
| Payment               | `screenshots/payment.png` |
| Customer Dashboard     | `screenshots/customer_dash.png` |
| Expert Dashboard       | `screenshots/expert_dash.png` |
| Expert Earnings        | `screenshots/earnings.png` |

---

## 🚀 Future Improvements

- [ ] Real payment gateway integration (Razorpay / Stripe)
- [ ] Push notifications for job updates (WebSockets)
- [ ] Expert profile verification workflow (KYC upload)
- [ ] Geo-location based expert matching
- [ ] Multi-language support (i18n)
- [ ] Mobile apps (React Native / Flutter)
- [ ] Coupon / discount code application at checkout
- [ ] Admin panel for platform management
- [ ] Rating aggregation on expert profiles
- [ ] Automated job reassignment on rejection
- [ ] SMS/Email booking confirmation
- [ ] Real-time chat between customer and expert

---

## 👨‍💻 Author

**HouseMate** — Built as a comprehensive full-stack assignment project demonstrating:
- Angular 17 standalone component architecture
- FastAPI async backend with PostgreSQL
- JWT-based role-based access control
- Domain-driven service layer design
- Clean separation of concerns (API → Service → Repository → Model)

---

> Built with ❤️ using Angular + FastAPI + PostgreSQL

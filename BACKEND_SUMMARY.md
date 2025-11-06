# EventFlex Backend - Project Summary & Architecture

## 📋 Project Overview

**EventFlex** is a comprehensive event management platform that connects three main user roles: **Hosts**, **Organizers**, and **Gig Workers**. The backend is built with **Node.js**, **Express.js**, and **MongoDB** using a modern, secure, and scalable architecture.

---

## 🏗️ Architecture Overview

### **Technology Stack**
- **Runtime**: Node.js (ES6 Modules)
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB (via Mongoose 8.18.1)
- **Authentication**: JWT (JSON Web Tokens) with refresh tokens
- **File Upload**: Multer + Cloudinary
- **Blockchain**: Ethers.js (for wallet generation)
- **Security**: bcrypt, CORS, cookie-parser

### **Project Structure**
```
src/
├── app.js                 # Main application setup
├── index.js               # Server entry point
├── constants.js           # Application constants
├── controllers/           # Business logic handlers
├── routes/                # API route definitions
├── models/                # MongoDB schemas
├── middlewares/           # Custom middleware functions
├── utils/                 # Utility functions
└── db/                    # Database connection
```

---

## 🔐 Authentication & Authorization

### **User Roles**
The system supports three primary user roles:
1. **Gig Worker** (`gig`) - Event workers who attend and perform at events
2. **Organizer** (`organizer`) - Manages events and pools of gig workers
3. **Host** (`host`) - Creates events and manages payments
4. **Admin** (`admin`) - Platform administrators

### **Authentication Flow**
1. **Registration**: Users register with email, phone, password, role, and avatar
2. **Login**: JWT-based authentication with access and refresh tokens
3. **Token Management**: 
   - Access tokens stored in cookies (HTTP-only)
   - Refresh token mechanism for token renewal
   - Role-based authorization middleware

### **Security Features**
- **Password Hashing**: bcrypt with salt rounds (10)
- **Input Sanitization**: Removes XSS vulnerabilities, HTML tags, JavaScript protocols
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable origin-based access control
- **Soft Delete**: Users can be soft-deleted (not permanently removed)

---

## 📊 Database Models

### **Core Models**

1. **User Model** (`User.model.js`)
   - Email, phone, password, role (gig/organizer/host)
   - Universal role ID (unique identifier)
   - Wallet integration (blockchain address)
   - KYC verification status (video, documents)
   - Wellness score & no-show risk tracking
   - Digital signature support
   - Avatar/profile image

2. **Event Model** (`Event.model.js`)
   - Host and Organizer references (dual ownership)
   - Event metadata (title, description, type, dates)
   - Geospatial location (2dsphere index for location queries)
   - Budget tracking
   - Status lifecycle: `published` → `in_progress` → `completed`
   - Assigned gig workers array

3. **Escrow Contract Model** (`EscrowContract.model.js`)
   - Tracks payment distribution between organizer and gigs
   - Status: `funded`, `in_progress`, `released`
   - Admin resolution support for disputes

4. **Pool Model** (`Pool.model.js`)
   - Organizer-managed groups of gig workers
   - Pool applications system
   - Status: `active`, `archived`

5. **User Wallet Model** (`UserWallet.model.js`)
   - INR balance tracking
   - UPI ID for withdrawals
   - Linked to User model

### **Additional Models**
- **BlockchainProfile**: Wallet addresses and verification
- **Payment**: Transaction history
- **Notification**: User notifications
- **Dispute**: Conflict resolution
- **RatingReview**: Feedback and ratings
- **Badge**: Gamification system
- **ReputationScore**: User reputation tracking
- **AuditLog**: Admin activity logging
- **KYCVerification**: Identity verification
- **Conversation/Message**: In-app messaging

---

## 🛣️ API Routes Structure

### **Base URL**: `/api/v1`

### **1. User Routes** (`/users`)
- `POST /register` - User registration with avatar upload

### **2. Authentication Routes** (`/auth/users`)
- `POST /login` - User login
- `POST /refresh-token` - Refresh access token
- `POST /logout` - User logout (protected)

### **3. Gig Worker Routes** (`/gigs`)
**Events & Attendance**:
- `GET /my-events` - Get assigned events
- `POST /check-in/:eventId` - Check-in to event
- `GET /attendance-history` - View attendance records
- `GET /nearby-events` - Find events by location
- `GET /recommended-events` - Personalized recommendations

**Pool Management**:
- `GET /organizer-pools` - Browse available pools
- `POST /join-pool/:poolId` - Apply to join a pool

**Wallet & Payments**:
- `GET /wallet` - View wallet balance
- `POST /withdraw` - Request withdrawal
- `GET /payment-history` - Transaction history
- `POST /wallet/create` - Create blockchain wallet
- `POST /simulate-payout/:escrowId` - Test payout (development)

**Wellness & Reminders**:
- `GET /wellness-score` - View wellness metrics
- `GET /reminders` - Get event reminders

**Profile & Gamification**:
- `GET /profile` - View profile
- `PUT /profile` - Update profile
- `PUT /profile-image` - Update avatar
- `GET /badges` - Earned badges
- `GET /leaderboard` - Ranking system

**Communication**:
- `GET /conversations` - Message threads
- `POST /message/:conversationId` - Send message

**KYC & Verification**:
- `POST /aadhaar/verify` - Aadhaar verification
- `POST /upload-documents` - Upload KYC documents
- `POST /kyc/video` - Upload verification video
- `GET /kyc-status` - Check verification status

### **4. Organizer Routes** (`/organizer`)
**Document Management**:
- `POST /upload-docs` - Upload documents
- `POST /e-signature` - Submit e-signature
- `POST /aadhaar/verify` - Identity verification

**Pool Management**:
- `POST /pools/create` - Create worker pool
- `PUT /pools/manage/:id` - Manage pool
- `GET /pools/:id` - Pool details
- `POST /pools/chat/:gigId` - Message gig worker

**Event Management**:
- `POST /events/create` - Create event
- `PUT /events/:id/edit` - Edit event
- `GET /events/:id` - Event details
- `GET /events/live/:id` - Live event tracking
- `POST /events/complete/:id` - Mark event complete

**Wallet & Payments**:
- `GET /wallet` - View balance
- `POST /withdraw` - Withdraw funds
- `GET /payment-history` - Payment history
- `POST /simulate-payout/:escrowId` - Test payout

**Analytics**:
- `GET /wellness-score` - Wellness metrics
- `GET /no-show-risk/:gigId` - Risk assessment

### **5. Host Routes** (`/host`)
**Documentation**:
- `POST /upload-docs` - Upload documents
- `POST /e-signature` - E-signature submission
- `POST /aadhaar/verify` - Identity verification

**Event Management**:
- `POST /events/create` - Create event
- `PUT /events/edit/:id` - Edit event
- `GET /events/:id` - Event details
- `GET /events` - List all events
- `PUT /events/complete/:id` - Complete event

**Organizer Management**:
- `POST /invite-organizer` - Invite organizer
- `POST /approve-organizer/:id` - Approve organizer
- `GET /organizers` - List assigned organizers
- `POST /chat` - Message organizer

**Payments & Escrow**:
- `POST /payment/deposit` - Deposit to escrow
- `GET /payment/status/:eventId` - Escrow status
- `POST /verify-attendance/:eventId` - Verify attendance
- `GET /wallet/balance` - Wallet balance

### **6. Admin Routes** (`/admin`)
**User Management**:
- `GET /roles` - Get all user roles
- `PUT /ban-user/:userid` - Ban user
- `PUT /unban-user/:userid` - Unban user
- `DELETE /soft-delete/:userId` - Soft delete user
- `PUT /restore/:userId` - Restore deleted user

**KYC & Verification**:
- `GET /kyc/pending` - Pending KYC requests
- `POST /kyc/approve/:userid` - Approve KYC
- `POST /kyc/reject/:userid` - Reject KYC
- `GET /documents/:userid` - View user documents
- `GET /e-signature/verify/:userid` - Verify e-signature

**Gamification**:
- `POST /badges/create` - Create new badge

**Dispute Resolution**:
- `GET /disputes` - List disputes
- `POST /disputes/resolve/:id` - Resolve dispute
- `GET /audit-logs` - View audit logs

**Notifications**:
- `POST /broadcast` - Broadcast message
- `POST /notify/:userid` - Notify specific user
- `GET /notifications` - View notifications

**Analytics**:
- `GET /analytics/users` - User analytics
- `GET /analytics/events` - Event analytics
- `GET /analytics/payments` - Payment analytics
- `GET /leaderboard` - Platform leaderboard

---

## 🔄 Key Workflows

### **1. Event Creation Flow**
1. Host creates event with budget, location, dates
2. Organizer can be assigned/invited
3. Organizer creates pools or assigns gig workers directly
4. Gig workers apply or are assigned to events
5. Escrow contract created upon event funding
6. Event status transitions automatically based on dates

### **2. Payment Flow**
1. Host deposits funds to escrow contract
2. Funds split between organizer and gig workers (percentage-based)
3. Escrow status: `funded` → `in_progress` → `released`
4. Payments released upon event completion/verification
5. Withdrawal requests processed to UPI accounts

### **3. KYC Verification Flow**
1. User uploads documents and/or verification video
2. Aadhaar verification (optional, sandbox mode)
3. Admin reviews and approves/rejects
4. User status updated to verified/unverified

### **4. Pool Management Flow**
1. Organizer creates a pool with name and description
2. Gig workers browse available pools
3. Gig workers apply to join with proposed rate
4. Organizer reviews applications and manages pool membership
5. Pool members can be assigned to events

---

## 🛡️ Security & Middleware

### **Security Middleware**
1. **Input Sanitization** (`sanitize.middleware.js`)
   - Removes HTML tags, JavaScript protocols
   - Limits input length
   - Sanitizes body, query, and params

2. **Rate Limiting** (`sanitize.middleware.js`)
   - 100 requests per 15 minutes per IP
   - In-memory tracking (Map-based)

3. **Authentication** (`auth.middleware.js`)
   - JWT token verification
   - Cookie and header-based token extraction
   - Role-based authorization

4. **Error Handling** (`errorHandler.middleware.js`)
   - Centralized error handling
   - Handles validation, cast, duplicate, and JWT errors
   - Development mode stack traces

### **Other Middleware**
- **Multer**: File upload handling
- **Cloudinary**: Cloud storage integration
- **Soft Delete**: Logical deletion (not physical)

---

## 💾 Database Features

### **Indexing Strategy**
- Compound indexes on common queries (role + isVerified, email + role)
- Geospatial index on Event location (2dsphere)
- Unique indexes on email, phone, universal_role_id

### **Data Validation**
- Mongoose schema validation
- Enum constraints for roles and statuses
- Decimal128 for precise financial calculations
- Required field validation

### **Pre-save Hooks**
- Password hashing before save
- Status transition validation
- Auto-status updates based on dates

---

## 🔗 Integration Points

1. **Cloudinary**: Image/video upload and storage
2. **Aadhaar Sandbox API**: Identity verification (sandbox mode)
3. **Ethers.js**: Blockchain wallet generation
4. **MongoDB Atlas/Server**: Database connection

---

## 🚀 Server Startup Flow

1. Load environment variables (`.env`)
2. Connect to MongoDB database (`connectedDB()`)
3. Initialize Express app with middleware
4. Register all route handlers
5. Set up error handling middleware
6. Start server on configured port

---

## 📝 Key Features

✅ **Multi-role System**: Host, Organizer, Gig Worker, Admin
✅ **Event Management**: Full lifecycle from creation to completion
✅ **Payment Escrow**: Secure fund management with percentage splits
✅ **Pool System**: Organizer-managed worker groups
✅ **Blockchain Integration**: Wallet generation using Ethers.js
✅ **KYC Verification**: Document and video verification
✅ **Geospatial Queries**: Location-based event discovery
✅ **Gamification**: Badges, leaderboards, reputation scores
✅ **Wellness Tracking**: Worker wellness and no-show risk assessment
✅ **Messaging System**: In-app communication
✅ **Dispute Resolution**: Admin-managed conflict resolution
✅ **Analytics**: User, event, and payment analytics
✅ **Soft Delete**: Logical deletion for data recovery

---

## 🔧 Development

- **Script**: `npm run dev` (uses nodemon for auto-reload)
- **Environment Variables**: Required for CORS, MongoDB URI, JWT secrets, Cloudinary, etc.
- **Database**: MongoDB connection string with database name "EventFlex"

---

## 📌 Summary

EventFlex is a **comprehensive event management platform** that facilitates:
- **Hosts** creating and funding events
- **Organizers** managing worker pools and coordinating events
- **Gig Workers** finding work, checking in, and receiving payments
- **Admins** overseeing the platform, verifying users, and resolving disputes

The backend is built with **security, scalability, and maintainability** in mind, featuring role-based access control, secure payment handling, blockchain integration, and comprehensive analytics.


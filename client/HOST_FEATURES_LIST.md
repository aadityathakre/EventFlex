# Host Features List - EventFlex

Based on the routes and controllers, here are all the features available for Host role:

## 📋 Complete Feature List

### 1. **Profile Management** ✅
- **Get Host Profile** - `GET /api/v1/host/profile`
  - View complete profile with documents and KYC status
  - Returns: merged profile, documents, KYC verification
  
- **Update Profile** - `PUT /api/v1/host/profile`
  - Update personal information (name, email, phone, bio, location, availability, bank details)
  
- **Update Profile Image** - `PUT /api/v1/host/profile/image`
  - Upload new profile/avatar image
  - Uses Cloudinary for image storage
  
- **Delete Profile Image** - `DELETE /api/v1/host/profile/image`
  - Remove profile image (resets to default)

---

### 2. **Authentication & Verification** 🔐
- **Upload Documents** - `POST /api/v1/host/upload-docs`
  - Upload verification documents (Aadhaar, PAN, selfie, signature)
  - File upload via Multer
  
- **Submit E-Signature** - `POST /api/v1/host/e-signature`
  - Upload digital signature document
  
- **Verify Aadhaar** - `POST /api/v1/host/aadhaar/verify`
  - Verify Aadhaar number (sandbox mode)

---

### 3. **Event Management** 📅
- **Create Event** - `POST /api/v1/host/events/create`
  - Create new event with:
    - Title, description, event_type
    - Start/end dates
    - Location (GeoJSON coordinates)
    - Budget
  - Status: "published" by default
  
- **Edit Event** - `PUT /api/v1/host/events/edit/:id`
  - Update event details
  - Can modify all event fields
  
- **Get Event Details** - `GET /api/v1/host/events/:id`
  - View specific event with all details
  - Includes organizer, status, dates, location
  
- **Get All Host Events** - `GET /api/v1/host/events`
  - List all events created by the host
  - Filtered by host ID
  
- **Complete Event** - `PUT /api/v1/host/events/complete/:id`
  - Mark event as completed
  - Triggers status change to "completed"

---

### 4. **Organizer Management** 🧑‍🤝‍🧑
- **Get All Organizers** - `GET /api/v1/host/organizers/all`
  - Browse available organizers
  - View organizer profiles and ratings
  
- **Invite Organizer** - `POST /api/v1/host/invite-organizer/:id`
  - Send invitation to organizer for an event
  - Creates event application
  
- **Approve Organizer** - `POST /api/v1/host/approve-organizer/:id`
  - Accept organizer's application
  - Assigns organizer to event
  
- **Create Organizer Pool** - `POST /api/v1/host/pools/create`
  - Create a pool for organizers to join
  - Define requirements, location, capacity
  
- **Get Assigned Organizer** - `GET /api/v1/host/organizer`
  - View currently assigned organizer for events
  - Get organizer details and contact info
  
- **Start Chat with Organizer** - `POST /api/v1/host/chat`
  - Initiate conversation with organizer
  - Creates conversation thread

---

### 5. **Payments & Escrow** 💰
- **Deposit to Escrow** - `POST /api/v1/host/payment/deposit`
  - Create escrow contract
  - Deposit funds for event
  - Set organizer and gig percentages
  - Payment methods: UPI or crypto
  
- **Get Escrow Status** - `GET /api/v1/host/payment/status/:eventId`
  - Check escrow contract status
  - View funded amount, percentages, release status
  
- **Verify Attendance** - `POST /api/v1/host/verify-attendance/:eventId`
  - Verify gig worker attendance
  - Approve check-in/check-out times
  - Required before payment release
  
- **Get Wallet Balance** - `GET /api/v1/host/wallet/balance`
  - View current wallet balance
  - Check available funds

---

### 6. **Dashboard & Analytics** 📊
- **Get Host Dashboard** - `GET /api/v1/host/dashboard`
  - Overview of all host activities
  - Returns: events, escrows, payments
  - Main landing page after login

- **Get Leaderboard** - `GET /api/v1/host/leaderboard`
  - View rankings and reputation scores
  - Compare with other hosts

---

### 7. **Reviews & Feedback** ⭐
- **Create Rating Review** - `POST /api/v1/host/reviews/rating`
  - Rate and review organizer
  - Review types: "host_to_organizer"
  - Rating (Decimal128) and review text
  
- **Create Feedback** - `POST /api/v1/host/reviews/feedback`
  - Provide feedback for gig workers
  - Rating (1-5) and comments

---

## 🎯 Feature Implementation Priority

### Phase 1: Core Features (Essential)
1. ✅ Dashboard (Overview)
2. Profile Management
3. Event Management (Create, View, Edit)
4. Organizer Management (Browse, Invite, Approve)

### Phase 2: Payment Features (Important)
5. Escrow Management
6. Payment Deposits
7. Wallet Balance
8. Attendance Verification

### Phase 3: Communication & Reviews (Enhancement)
9. Chat with Organizers
10. Reviews & Ratings
11. Leaderboard

### Phase 4: Verification (Compliance)
12. Document Upload
13. KYC Verification
14. E-Signature

---

## 📱 Frontend Routes Structure

```
/host/dashboard              - Main dashboard (✅ Created)
/host/profile                - Profile management
/host/profile/edit           - Edit profile
/host/events                 - All events list
/host/events/create          - Create new event
/host/events/:id             - Event details
/host/events/:id/edit        - Edit event
/host/organizers             - Browse organizers
/host/organizers/:id         - Organizer details
/host/payments               - Payment history
/host/payments/deposit       - Deposit to escrow
/host/escrow/:eventId        - Escrow status
/host/wallet                 - Wallet balance
/host/reviews                - Reviews & ratings
/host/leaderboard            - Leaderboard
/host/verification           - KYC & documents
/host/chat                   - Messages with organizers
```

---

## 🔐 Authentication Requirements

All routes require:
- Valid JWT access token (in cookies or Authorization header)
- User role must be "host"
- Token verification via `verifyToken` middleware
- Role authorization via `authorizeRoles("host")` middleware

---

## 📝 Notes

- All API calls should include `withCredentials: true` for cookie-based auth
- Tokens are stored in httpOnly cookies by backend
- Access tokens expire (check `ACCESS_TOKEN_EXPIRY` env var)
- Refresh tokens used for automatic token renewal
- Session persists until explicit logout

---

## 🚀 Next Steps

1. ✅ Authentication & Session Management Setup
2. ✅ Host Dashboard Structure
3. ⏳ Profile Management Page
4. ⏳ Event Management Pages
5. ⏳ Organizer Management Pages
6. ⏳ Payment & Escrow Pages
7. ⏳ Reviews & Ratings Pages
8. ⏳ Chat/Messaging Interface

---

**Status**: Foundation setup complete. Ready to build features one by one as instructed.

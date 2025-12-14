# EventFlex Project Overview

## Project Architecture

EventFlex is an event management platform that connects three main user roles:
- **Host**: Creates and manages events
- **Organizer**: Manages event execution and coordinates gig workers
- **Gig**: Workers who perform tasks at events

---

## Technology Stack

### Backend
- **Framework**: Express.js (ES6 modules)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (Access + Refresh tokens)
- **File Upload**: Multer + Cloudinary
- **Payment**: Razorpay
- **Email**: Nodemailer

### Frontend
- **Framework**: React 19 with Vite
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Authentication**: Firebase (Google OAuth)

---

## Project Flow

### 1. Authentication Flow

#### Registration
1. User selects role (gig/organizer/host)
2. Provides: email, phone, password, first_name, last_name
3. System validates:
   - Email format
   - Phone (Indian format: 10 digits starting with 6-9)
   - Password strength (min 5 chars, uppercase, lowercase, number, special char)
4. Creates user with `universal_role_id` (format: `{role}-{timestamp}`)
5. Password is hashed using bcrypt

#### Login
1. User provides email + password
2. System validates credentials
3. Generates access token + refresh token
4. Tokens stored in HTTP-only cookies
5. Returns user data (excluding password/refreshToken)

#### Password Reset
1. User requests OTP via email
2. OTP sent to email (6-digit, expires in 5 minutes)
3. User verifies OTP
4. User resets password

#### Google OAuth
1. User authenticates via Firebase Google Auth
2. Backend receives email
3. Finds existing user by email
4. Generates tokens and logs in

---

### 2. User Roles & Permissions

All users share the same `User` model but have different roles:
- **gig**: Event workers
- **organizer**: Event coordinators
- **host**: Event creators

Role-based access control via `authorizeRoles` middleware.

---

### 3. Event Lifecycle

#### Event Creation (Host)
1. Host creates event with:
   - Title, description, event_type
   - Start/end dates
   - Location (GeoJSON coordinates)
   - Budget
2. Event status: `published` → `in_progress` → `completed` (auto-transitions)

#### Organizer Assignment
1. Host can invite organizers
2. Organizer can request to organize an event
3. Host approves/rejects organizer
4. Organizer assigned to event

#### Organizer Pool Creation
1. Organizer creates a "pool" for an event
2. Pool defines:
   - Required skills
   - Pay range
   - Max capacity
   - Location
3. Status: `open` → `active` → `completed`

#### Gig Application
1. Gig workers browse nearby events or pools
2. Gig applies to pool with:
   - Cover message
   - Proposed rate
3. Application status: `pending` → `accepted`/`rejected`
4. Organizer reviews and accepts/rejects applications

#### Event Execution
1. Gig checks in at event start
2. Gig checks out at event end
3. System tracks hours worked
4. Host/organizer verifies attendance

#### Payment Flow
1. Host deposits funds to Escrow contract
2. Escrow splits: organizer percentage + gigs percentage
3. After event completion and verification:
   - Payments released to organizer
   - Payments released to gig workers
4. Payments tracked via `Payment` model

---

## Database Models

### Core User Models

#### 1. **User** (Main user model)
- `email`, `phone`, `password`
- `role`: enum["gig", "organizer", "host"]
- `first_name`, `last_name`
- `universal_role_id`: unique identifier
- `avatar`: profile image URL
- `isVerified`: email verification status
- `kycVideo`: video KYC data (url, status, wellnessScore, noShowRisk)
- `wallet`: blockchain wallet info (address, privateKey)
- `isBanned`: ban status
- `digital_signature`: e-signature
- `refreshToken`: JWT refresh token
- Password hashing, JWT token generation methods
- Soft delete enabled

#### 2. **Admin**
- `email`, `password`
- `is_active`: admin status
- `last_action_type`, `last_action_at`: audit trail
- `admin_notes`: internal notes
- `refreshToken`: JWT refresh token

#### 3. **UserProfile** (Extended profile data)
- `user`: reference to User
- `bio`: user biography
- `location`: JSON object
- `availability`: JSON object
- `bank_details`: JSON object
- `profile_image_url`: profile image

---

### Event Models

#### 4. **Event**
- `host`: reference to User (role=host)
- `organizer`: reference to User (role=organizer) - optional initially
- `title`, `description`
- `event_type`: enum[function, corporate, festival, exhibition, hackathon, workshop, webinar, networking, fundraiser, retreat]
- `start_date`, `end_date`
- `location`: GeoJSON Point (coordinates: [longitude, latitude])
- `budget`: Decimal128
- `status`: enum["published", "in_progress", "completed"]
- Auto-transitions status based on dates
- 2dsphere index for geospatial queries
- Soft delete enabled

#### 5. **EventApplication**
- `event`: reference to Event
- `applicant`: reference to User (organizer applying)
- `application_status`: enum["pending", "accepted", "rejected"]
- `cover_letter`: application message
- `proposed_rate`: Decimal128

#### 6. **EventAttendance**
- `event`: reference to Event
- `gig`: reference to User (role=gig)
- `check_in_time`: Date
- `check_out_time`: Date (optional)
- `status`: enum["checked_in", "no_show"]
- `hours_worked`: Decimal128
- `resolved_by_admin`: admin resolution
- `admin_resolution_notes`: resolution details

---

### Pool & Team Management

#### 7. **Pool**
- `organizer`: reference to User
- `event`: reference to Event
- `name`: pool name
- `description`: pool description
- `gigs`: array of User references (accepted gig workers)
- `status`: enum["active", "archived"]

#### 8. **OrganizerPool**
- `organizer`: reference to User
- `event`: reference to Event
- `pool_name`: string
- `location`: GeoJSON Point
- `max_capacity`: number
- `required_skills`: Mixed (JSON)
- `pay_range`: Mixed (JSON)
- `status`: enum["open", "active", "completed"]
- 2dsphere index for geospatial queries

#### 9. **PoolApplication**
- `pool`: reference to Pool
- `gig`: reference to User
- `application_status`: enum["pending", "accepted", "rejected"]
- `cover_message`: application message
- `proposed_rate`: Decimal128

---

### Payment & Escrow

#### 10. **EscrowContract**
- `event`: reference to Event
- `host`: reference to User
- `organizer`: reference to User
- `total_amount`: Decimal128
- `organizer_percentage`: Decimal128
- `gigs_percentage`: Decimal128
- `status`: enum["funded", "in_progress", "released"]
- `resolved_by_admin`: admin resolution
- `admin_resolution_notes`: resolution details

#### 11. **Payment**
- `escrow`: reference to EscrowContract
- `payer`: reference to User (host)
- `payee`: reference to User (gig/organizer)
- `amount`: Decimal128
- `payment_method`: enum["upi", "crypto"]
- `status`: enum["completed", "pending"]
- `upi_transaction_id`: string

#### 12. **UserWallet**
- `user`: reference to User
- `upi_id`: string
- `balance_inr`: Decimal128 (default: 1000.00)

---

### Skills & Reputation

#### 13. **Skill**
- `skill_name`: string
- `category`: enum["hospitality", "security", "creative"]

#### 14. **UserSkill**
- `user`: reference to User
- `skill`: reference to Skill
- `proficiency_level`: enum["beginner", "expert"]
- `is_verified`: boolean

#### 15. **Badge**
- `badge_name`: string
- `min_events`: number (minimum events to earn badge)

#### 16. **UserBadge**
- `user`: reference to User
- `badge`: reference to Badge

#### 17. **ReputationScore**
- `user`: reference to User
- `overall_rating`: Decimal128
- `trust_level`: enum["bronze", "silver", "gold", "elite"]

---

### Reviews & Feedback

#### 18. **RatingReview**
- `reviewer`: reference to User
- `reviewee`: reference to User
- `event`: reference to Event
- `rating`: Decimal128
- `review_text`: string
- `review_type`: enum["gig_to_organizer", "organizer_to_gig", "host_to_organizer"]
- `resolved_by_admin`: admin resolution
- `admin_resolution_notes`: resolution details

#### 19. **Feedback**
- `event`: reference to Event
- `gig`: reference to User
- `rating`: number (1-5)
- `comment`: string

---

### Communication

#### 20. **Conversation**
- `participants`: array of User references
- `pool`: reference to OrganizerPool
- `event`: reference to Event

#### 21. **Message**
- `conversation`: reference to Conversation
- `sender`: reference to User
- `message_text`: string (max 1000 chars)

#### 22. **Notification**
- `user`: reference to User
- `type`: enum["reminder", "payment", "event", "system"]
- `message`: string
- `read`: boolean

---

### Verification & Compliance

#### 23. **KYCVerification**
- `user`: reference to User
- `aadhaar_number`: string
- `aadhaar_verified`: boolean
- `video_kyc_url`: string
- `status`: enum["pending", "approved", "rejected"]
- `verified_at`: Date

#### 24. **UserDocument**
- `user`: reference to User
- `type`: enum["aadhaar", "pan", "selfie", "signature"]
- `fileUrl`: string
- `status`: enum["pending", "verified", "rejected"]
- `uploadedAt`: Date

---

### Contracts & Legal

#### 25. **Contract**
- `event`: reference to Event
- `host`: reference to User
- `organizer`: reference to User
- `contract_url`: string
- `digital_signatures`: Mixed (JSON object)
- `status`: enum["signed", "executed"]
- `resolved_by_admin`: admin resolution
- `admin_resolution_notes`: resolution details

---

### Disputes & Resolution

#### 26. **Dispute**
- `event`: reference to Event
- `gig`: reference to User
- `reason`: string
- `status`: enum["open", "resolved", "rejected"]
- `resolution_notes`: string

---

### Analytics & Recommendations

#### 27. **RecommendedEvents**
- `gig`: reference to User
- `event`: reference to Event
- `score`: Decimal128 (recommendation score)
- `reason`: string

#### 28. **BehavioralAnalytics**
- `user`: reference to User
- `no_show_risk_score`: Decimal128

---

### Audit & Logging

#### 29. **AuditLog**
- `actor`: reference to User
- `action`: string
- `target`: reference (polymorphic)
- `targetModel`: string
- `metadata`: Object

---

## API Routes Structure

### Authentication Routes (`/api/v1/auth/users`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh-token` - Refresh access token
- `POST /logout` - User logout
- `POST /send-otp` - Send password reset OTP
- `POST /verify-otp` - Verify OTP
- `POST /reset-password` - Reset password
- `POST /google-auth` - Google OAuth login

### Gig Routes (`/api/v1/gigs`)
- **Profile**: Get/Update profile, upload/delete profile image
- **KYC**: Verify Aadhaar, upload documents, upload KYC video, get KYC status
- **Events**: Get my events, check-in/check-out, attendance history, nearby events
- **Pools**: Get organizer pool, join pool
- **Wallet**: Get wallet, withdraw, payment history, create wallet, simulate payout
- **Badges**: Get badges, leaderboard
- **Messaging**: Get conversations, send message
- **Notifications**: Get notifications
- **Disputes**: Raise dispute
- **Feedback**: Submit feedback
- **Dashboard**: Get gig dashboard

### Organizer Routes (`/api/v1/organizer`)
- **Profile**: Get/Update profile, upload/delete profile image, upload docs, e-signature, verify Aadhaar
- **Events**: Get all events, request host for event, accept invitation, get event details, live event tracking
- **Pools**: Create pool, get pool details, chat with gig, get pool applications, review application
- **Wallet**: Get wallet, withdraw funds, payment history, simulate payout
- **Reputation**: Get leaderboard, get badges
- **Notifications**: Get notifications, mark as read
- **Disputes**: Raise dispute, get disputes
- **Analytics**: Get wellness score, get no-show risk

### Host Routes (`/api/v1/host`)
- **Profile**: Get/Update profile, upload/delete profile image, upload docs, e-signature, verify Aadhaar
- **Events**: Create event, edit event, get event details, get host events, complete event
- **Organizer Management**: Get all organizers, invite organizer, approve organizer, create organizer pool, get assigned organizer, start chat
- **Payments**: Deposit to escrow, get escrow status, verify attendance, get wallet balance
- **Dashboard**: Get host dashboard, leaderboard
- **Reviews**: Create rating review, create feedback

### Admin Routes (`/api/v1/admin`)
- **User Management**: Get all roles, ban/unban user, soft delete/restore user, debug gig data
- **Verification**: Get pending KYC, approve/reject KYC, get user documents, verify e-signature
- **Badges**: Create badge
- **Disputes**: Get disputes, resolve dispute
- **Audit**: Get audit logs
- **Notifications**: Broadcast message, notify user, get notifications
- **Analytics**: Get user analytics, event analytics, payment analytics, leaderboard

### Payment Routes (`/api/v1/payments`)
- `POST /create` - Create Razorpay payment
- `POST /verify` - Verify Razorpay payment

---

## Key Features

### 1. Role-Based Access Control
- Three user roles with different permissions
- JWT-based authentication with refresh tokens
- Middleware-based authorization

### 2. Event Management
- GeoJSON-based location tracking
- Automatic status transitions
- Event-organizer-gig workflow

### 3. Pool System
- Organizers create pools for events
- Gigs apply to pools
- Skill-based matching
- Pay range negotiation

### 4. Escrow & Payments
- Escrow contracts for secure payments
- Percentage-based splits (organizer vs gigs)
- UPI and crypto payment support
- Payment history tracking

### 5. KYC & Verification
- Aadhaar verification
- Video KYC
- Document upload (Aadhaar, PAN, selfie, signature)
- Admin approval workflow

### 6. Reputation System
- Rating and reviews between roles
- Badge system based on event count
- Trust levels (bronze, silver, gold, elite)
- Leaderboard

### 7. Communication
- Conversation system for pools
- Real-time messaging
- Notifications system

### 8. Analytics
- Behavioral analytics (no-show risk)
- Event recommendations
- Wellness scores
- Admin analytics dashboard

### 9. Dispute Resolution
- Dispute raising by gigs/organizers
- Admin resolution workflow
- Resolution notes tracking

### 10. Soft Delete
- Users can be soft-deleted
- Restore functionality
- Audit trail

---

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Access + Refresh token pattern
3. **HTTP-only Cookies**: Secure token storage
4. **Input Sanitization**: Middleware for XSS prevention
5. **Rate Limiting**: 100 requests per 15 minutes
6. **Role Authorization**: Middleware-based access control
7. **Soft Delete**: Data retention with soft deletion

---

## Frontend Structure

### Pages
- `Register.jsx` - User registration with role selection
- `login.jsx` - Login with Google OAuth and email/password
- `ForgotPaassword.jsx` - Password reset flow
- `razorpay.jsx` - Payment integration page

### Key Features
- React Router for navigation
- Axios for API calls
- Firebase for Google OAuth
- Tailwind CSS for styling
- Form validation
- Error handling

---

## Database Indexes

- **User**: email, first_name, last_name (indexed)
- **Event**: host, organizer, location (2dsphere)
- **OrganizerPool**: location (2dsphere)
- **Payment**: escrow, payer, payee (indexed)
- **RatingReview**: reviewer, reviewee, event (indexed)
- **Notification**: user (indexed)
- **Conversation**: event (indexed)
- **Message**: conversation, sender (indexed)
- **EventAttendance**: event, gig (indexed)
- **KYCVerification**: user (indexed)
- **UserProfile**: user (indexed)
- **UserSkill**: user, skill (indexed)
- **UserBadge**: user, badge (indexed)
- **ReputationScore**: user (indexed)
- **RecommendedEvents**: gig, event (indexed)
- **BehavioralAnalytics**: user (indexed)
- **UserWallet**: user (indexed)
- **Pool**: organizer, status (indexed)

---

## Environment Variables Required

### Backend
- `MONGODB_URI` - MongoDB connection string
- `ACCESS_TOKEN_SECRET` - JWT access token secret
- `REFRESH_TOKEN_SECRET` - JWT refresh token secret
- `ACCESS_TOKEN_EXPIRY` - Access token expiry
- `REFRESH_TOKEN_EXPIRY` - Refresh token expiry
- `CLIENT_HOST` - Frontend host
- `CLIENT_PORT` - Frontend port
- Cloudinary credentials
- Razorpay credentials
- Email service credentials

### Frontend
- `VITE_SERVER_URL` - Backend API URL
- `VITE_PORT` - Backend port
- Firebase configuration

---

## Middleware Stack

1. **CORS**: Cross-origin resource sharing
2. **Cookie Parser**: Parse cookies
3. **Body Parser**: JSON and URL-encoded bodies
4. **Sanitize Input**: XSS prevention
5. **Rate Limit**: Request throttling
6. **Auth Middleware**: JWT verification
7. **Role Authorization**: Role-based access
8. **Error Handler**: Global error handling
9. **Soft Delete**: Soft delete middleware
10. **File Upload**: Multer for file handling

---

## Project Flow Summary

1. **User Registration/Login** → JWT tokens generated
2. **KYC Verification** → Documents uploaded, admin approves
3. **Event Creation** (Host) → Event published
4. **Organizer Assignment** → Host invites/approves organizer
5. **Pool Creation** (Organizer) → Pool created with requirements
6. **Gig Application** → Gigs apply to pools
7. **Application Review** (Organizer) → Accept/reject applications
8. **Event Execution** → Gigs check-in/check-out
9. **Attendance Verification** (Host/Organizer) → Verify attendance
10. **Payment Release** → Escrow releases payments
11. **Rating & Feedback** → Users rate each other
12. **Reputation Update** → Badges and trust levels updated

---

## Notes

- Blockchain-related code is excluded from this overview
- All models use Mongoose with timestamps
- Decimal128 used for financial data (precision)
- GeoJSON used for location-based queries
- Soft delete pattern used for data retention
- Admin can resolve disputes, verify KYC, manage badges
- System supports both UPI and crypto payments (blockchain excluded from overview)

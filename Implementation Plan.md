BUILD FLEAXOVA MVP - FIREBASE/FIRESTORE VERSION

MISSION: Build a working MVP of FleaxovA platform using Firebase (NoSQL) for fast deployment.

===================================================================
TECH STACK FOR MVP
===================================================================

Frontend: React + Vite + Tailwind CSS
Backend: Firebase (Firestore + Firebase Auth + Cloud Functions)
Payment: Razorpay (test mode for now)
Deployment: Vercel (frontend) + Firebase (backend)

===================================================================
PHASE-BY-PHASE BUILD - DO ONE PHASE AT A TIME
===================================================================

PHASE 1: PROJECT SETUP & FIREBASE CONFIG (30 min)
--------------------------------------------------

1. Create React + Vite project structure:
   - /src/components
   - /src/pages
   - /src/context
   - /src/services
   - /src/firebase (Firebase config)

2. Initialize Firebase project
3. Setup Firestore database
4. Setup Firebase Authentication
5. Install dependencies:
   - firebase
   - react-router-dom
   - lucide-react (icons)
   - axios (for Razorpay)

Show me the complete folder structure when done.
WAIT FOR MY "CONTINUE TO PHASE 2" before proceeding.

===================================================================

PHASE 2: FIRESTORE DATABASE STRUCTURE (30 min)
------------------------------------------------

Create these Firestore collections with security rules:

COLLECTION: users
{
  uid: string (Firebase Auth UID),
  name: string,
  email: string,
  role: "student" | "client" | "admin",
  walletBalance: number (default 0),
  createdAt: timestamp,
  status: "active" | "suspended"
}

COLLECTION: profiles
{
  userId: string (reference to users),
  title: string,
  bio: string,
  skills: array,
  portfolio: object,
  socialLinks: object
}

COLLECTION: services
{
  freelancerId: string,
  title: string,
  description: string,
  category: string,
  price: number (minimum 100),
  deliveryTime: number,
  createdAt: timestamp
}

COLLECTION: jobs
{
  clientId: string,
  title: string,
  description: string,
  category: string,
  budget: number,
  deadline: timestamp,
  status: "open" | "assigned" | "completed",
  assignedFreelancerId: string | null
}

COLLECTION: applications
{
  jobId: string,
  freelancerId: string,
  coverLetter: string,
  bidAmount: number,
  status: "pending" | "accepted" | "rejected",
  createdAt: timestamp
}

COLLECTION: orders
{
  serviceId: string,
  clientId: string,
  freelancerId: string,
  price: number,
  status: "pending_payment" | "active" | "completed" | "cancelled",
  paymentId: string,
  createdAt: timestamp
}

COLLECTION: reviews
{
  serviceId: string,
  reviewerId: string,
  rating: number (1-5),
  comment: string,
  createdAt: timestamp
}

COLLECTION: messages
{
  senderId: string,
  receiverId: string,
  content: string,
  createdAt: timestamp,
  isRead: boolean
}

COLLECTION: notifications
{
  userId: string,
  type: string,
  content: string,
  link: string,
  isRead: boolean,
  createdAt: timestamp
}

COLLECTION: withdrawals
{
  userId: string,
  amount: number,
  status: "pending" | "approved" | "rejected",
  paymentMethod: string,
  paymentDetails: object,
  createdAt: timestamp
}

Setup Firestore Security Rules for each collection.

Show me all collection structures and security rules.
WAIT FOR MY "CONTINUE TO PHASE 3".

===================================================================

PHASE 3: FIREBASE AUTH SETUP (30 min)
---------------------------------------

1. Create AuthContext (src/context/AuthContext.jsx):
   - Register function (student or client role)
   - Login function
   - Logout function
   - Current user state
   - Store additional user data in Firestore users collection

2. Create Register page (src/pages/Register.jsx):
   - Role selection (Student or Client)
   - Name, Email, Password fields
   - Validation: Email format, password min 6 chars
   - On success: Create Firebase Auth user + Firestore user doc

3. Create Login page (src/pages/Login.jsx):
   - Email/Password login
   - Store user in context
   - Redirect to dashboard

4. Create ProtectedRoute component

Show me complete auth implementation.
WAIT FOR MY "CONTINUE TO PHASE 4".

===================================================================

PHASE 4: SERVICE MARKETPLACE (1.5 hours)
-----------------------------------------

Build these pages/components:

1. Services.jsx (Service Marketplace):
   - Fetch all services from Firestore
   - Display in grid layout
   - Show: title, price, delivery time, freelancer name
   - Search and filter by category
   - Click service → go to ServiceDetail page

2. ServiceDetail.jsx:
   - Show full service details
   - Show freelancer profile info
   - "Order Now" button → CreateOrder flow
   - Display reviews for this service

3. CreateService.jsx (Protected - Student only):
   - Form: title, description, category, price, delivery time
   - Validation: Price >= ₹100 (CRITICAL!)
   - Save to Firestore services collection
   - Include freelancerId from current user

4. MyServices.jsx:
   - Show logged-in student's services
   - Edit and delete options

Show me complete service marketplace implementation.
Test: Create service, view marketplace, view details.
WAIT FOR MY "CONTINUE TO PHASE 5".

===================================================================

PHASE 5: JOB BOARD (1.5 hours)
--------------------------------

Build these pages:

1. Jobs.jsx (Job Board):
   - Fetch all open jobs from Firestore
   - Display: title, budget, deadline, client name
   - Click job → JobDetail page

2. JobDetail.jsx:
   - Show full job details
   - "Apply Now" button (for students)
   - Show number of applications

3. CreateJob.jsx (Protected - Client only):
   - Form: title, description, category, budget, deadline
   - Save to Firestore jobs collection

4. ApplyToJob component:
   - Cover letter field
   - Bid amount field
   - Save to applications collection
   - Create notification for client

5. MyApplications.jsx (for students):
   - Show their applications and status

6. JobApplications.jsx (for clients):
   - View applications for their jobs
   - Accept/Reject buttons
   - On accept: update job status to "assigned"

Show me complete job board implementation.
WAIT FOR MY "CONTINUE TO PHASE 6".

===================================================================

PHASE 6: ORDER & PAYMENT FLOW (2 hours)
-----------------------------------------

CRITICAL FEATURE - Payment Integration

1. CreateOrder flow:
   - When user clicks "Order Now" on service
   - Create order doc in Firestore (status: pending_payment)
   - Initialize Razorpay checkout
   - Payment options: UPI, Cards, Net Banking

2. Razorpay Integration:
```javascript
   const options = {
     key: "rzp_test_YOUR_KEY",
     amount: price * 100, // paise
     currency: "INR",
     name: "FleaxovA",
     description: service.title,
     handler: function(response) {
       // Verify payment
       // Update order status to "active"
       // Calculate 10% commission
       // Add 90% to freelancer wallet
     }
   };
```

3. Order status flow:
   - pending_payment → active (after payment)
   - active → completed (after delivery + approval)

4. MyOrders.jsx:
   - Show orders where user is client or freelancer
   - Different views for each role
   - Delivery upload for freelancer
   - Approve/Request revision for client

Show me complete payment integration.
Test with Razorpay test cards.
WAIT FOR MY "CONTINUE TO PHASE 7".

===================================================================

PHASE 7: WALLET & WITHDRAWALS (1 hour)
----------------------------------------

1. Wallet.jsx:
   - Display current wallet balance
   - Show transaction history
   - "Request Withdrawal" button

2. RequestWithdrawal component:
   - Amount field (validate against balance)
   - Payment method (UPI, Bank Transfer)
   - Payment details (UPI ID or Bank details)
   - Create withdrawal request (status: pending)
   - Deduct from wallet immediately

3. WithdrawalRequests.jsx (Admin only):
   - List all pending withdrawals
   - Approve button → update status to "approved"
   - Reject button → return money to user wallet

Show me wallet system implementation.
WAIT FOR MY "CONTINUE TO PHASE 8".

===================================================================

PHASE 8: REVIEWS & RATINGS (45 min)
-------------------------------------

1. AddReview component:
   - Only after order completed
   - Star rating (1-5)
   - Comment field
   - Save to reviews collection
   - Update freelancer's average rating

2. ServiceReviews component:
   - Display all reviews for a service
   - Show reviewer name, rating, comment, date

3. Calculate and display average rating:
   - On service cards
   - On service detail page
   - On freelancer profile

Show me review system.
WAIT FOR MY "CONTINUE TO PHASE 9".

===================================================================

PHASE 9: MESSAGING SYSTEM (1 hour)
------------------------------------

1. Messages.jsx:
   - List of conversations
   - Chat interface
   - Send message function
   - Real-time updates (Firestore onSnapshot)

2. Contact Prevention Logic:
   - Scan message content for:
     * Email patterns (name@domain.com)
     * Phone numbers (10 digits)
     * Social media handles (@username)
   - Block message if detected
   - Show warning to user

3. Notifications when new message received

Show me messaging with contact prevention.
WAIT FOR MY "CONTINUE TO PHASE 10".

===================================================================

PHASE 10: ADMIN PANEL (1 hour)
--------------------------------

1. AdminDashboard.jsx (Protected - Admin only):
   - Total users count
   - Total services count
   - Total orders count
   - Total revenue
   - Pending withdrawals count

2. UserManagement.jsx:
   - List all users
   - Search by email/name
   - Suspend/Activate user
   - View user details

3. ServiceModeration.jsx:
   - List all services
   - Delete inappropriate services

4. WithdrawalApprovals.jsx:
   - Already created in Phase 7

Show me complete admin panel.
WAIT FOR MY "CONTINUE TO PHASE 11".

===================================================================

PHASE 11: PROFILE & DASHBOARD (1 hour)
----------------------------------------

1. Dashboard.jsx:
   - Different dashboard for student/client/admin
   - Student: My services, My orders (as freelancer), earnings
   - Client: My jobs, My orders (as client)
   - Quick stats and recent activity

2. Profile.jsx:
   - View own profile
   - Edit profile button

3. EditProfile.jsx:
   - Update: name, title, bio, skills, portfolio, social links
   - Update Firestore profile document

Show me profile system.
WAIT FOR MY "CONTINUE TO PHASE 12".

===================================================================

PHASE 12: NAVBAR & ROUTING (30 min)
-------------------------------------

1. Navbar.jsx:
   - Logo
   - Links: Home, Services, Jobs, Dashboard
   - If logged in: Profile, Wallet, Logout
   - If not logged in: Login, Register
   - Mobile responsive menu

2. Setup React Router with all routes:
   - / → Home
   - /login → Login
   - /register → Register
   - /services → Services
   - /services/:id → ServiceDetail
   - /services/create → CreateService
   - /jobs → Jobs
   - /jobs/:id → JobDetail
   - /jobs/create → CreateJob
   - /dashboard → Dashboard
   - /profile → Profile
   - /wallet → Wallet
   - /messages → Messages
   - /admin → AdminDashboard

Show me complete routing setup.
WAIT FOR MY "CONTINUE TO PHASE 13".

===================================================================

PHASE 13: UI/UX POLISH (1 hour)
---------------------------------

Apply design system from blueprint:

Colors:
- Primary: White (#FFFFFF)
- Secondary: Black (#000000)
- Accent: Gray (#F3F4F6, #E5E7EB, #9CA3AF)
- Success: #10B981
- Error: #EF4444

Typography:
- Font: Inter, sans-serif
- Headings: font-bold
- Body: font-normal

Components:
- Add loading states
- Add error messages
- Add empty states
- Add success notifications
- Responsive design for mobile

Polish all pages with consistent styling.
WAIT FOR MY "CONTINUE TO PHASE 14".

===================================================================

PHASE 14: TESTING & BUG FIXES (1 hour)
----------------------------------------

Test complete flows:

1. Student Registration → Create Service → Receive Order → Get Paid
2. Client Registration → Post Job → Review Applications → Hire
3. Order Flow → Payment → Delivery → Review
4. Wallet → Withdrawal Request → Admin Approval
5. Messaging with contact prevention

Fix any bugs found.

Show me test results.
WAIT FOR MY "CONTINUE TO PHASE 15".

===================================================================

PHASE 15: DEPLOYMENT (30 min)
-------------------------------

1. Deploy frontend to Vercel:
   - Build React app
   - Deploy to Vercel
   - Add environment variables

2. Firebase backend already deployed (automatic)

3. Update Firebase and Razorpay configs for production

4. Final smoke test on production

Show me deployment URLs.

===================================================================
CRITICAL RULES - FOLLOW STRICTLY
===================================================================

1. Build ONE PHASE AT A TIME
2. WAIT for my "CONTINUE" command before next phase
3. Show me complete code for each phase
4. Test each phase before moving forward
5. NEVER skip phases
6. Price validation: ALWAYS enforce ₹100 minimum
7. Commission: ALWAYS 10% (not 15%)
8. Roles: Only "student", "client", "admin"
9. Contact prevention: Block emails/phones in messages

===================================================================
START NOW WITH PHASE 1
===================================================================

Begin with Phase 1: Project Setup & Firebase Config

Show me the complete project structure when done.

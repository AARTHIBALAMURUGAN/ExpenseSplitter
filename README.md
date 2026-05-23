# 💸 Smart Expense Splitter

A full-stack web application where groups of friends can track shared expenses and automatically calculate who owes whom.

---

## 🚀 Live Demo

- **Frontend:** https://expense-splitter-s6n8.vercel.app/
- **Backend:** https://expensesplitter-yj5b.onrender.com

---

## 📁 Folder Structure

```
Expense-Splitter/
│
├── client/                        # Next.js Frontend
│   ├── app/
│   │   ├── 
│   │   │   ├── login/
│   │   │   │   └── page.js        # Login page
│   │   │   └── register/
│   │   │       └── page.js        # Register page
│   │   ├── dashboard/
│   │   │   └── page.js            # Dashboard — all groups
│   │   └── groups/
│   │       └── [id]/
│   │           └── page.js        # Group detail — expenses + settlements
│   ├── services/
│   │   └── api.js                 # Axios config + chaos simulator
│   ├── layout.js                  # Root layout with Tailwind CDN
│   └── globals.css
│
└── server/                        # Node.js + Express Backend
    ├── controllers/
    │   ├── userController.js      # Register, Login
    │   ├── groupController.js     # Create group, add member
    │   ├── expenseController.js   # Add, edit, delete, mark paid
    │   └── settlementController.js# Calculate who owes whom
    ├── models/
    │   ├── User.js                # User schema
    │   ├── Group.js               # Group schema
    │   └── ExpenseModels.js       # Expense schema
    ├── routes/
    │   ├── userRoutes.js
    │   ├── groupRoutes.js
    │   ├── expenseRoutes.js
    │   └── settlementRoutes.js
    ├── utils/
    │   └── settlement.js          # Min cash flow algorithm
    ├── middleware/
    │   └── authMiddleware.js      # JWT verification
    └── server.js                  # Entry point
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS (CDN) |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| HTTP Client | Axios |

---

## ✨ Features

### 🔐 Authentication
- Register with name, email, password, mobile number
- Login with JWT token
- Protected routes — redirects to login if not authenticated
- Form validation on both frontend and backend

### 👥 Group Management
- Create groups with a name
- Invite members by email
- View all members in a group
- Each user can be part of multiple groups

### 💰 Expense Management
- Add expenses with:
  - Title
  - Amount
  - Paid by (any group member)
  - Participants (select who splits)
  - Date
- Edit and delete expenses
- Real-time split preview (₹2500 ÷ 4 = ₹625 each)

### 🧮 Smart Settlement Logic
- Minimum cash flow algorithm
- Calculates exact who owes whom
- Shows each member's net balance
  - Green = gets money back
  - Orange = owes money
- Mark as paid functionality
- Settlement updates dynamically

### 🔍 Search + Filters
- Search expenses by title
- Filter expenses by member
- Sort by newest or oldest date
- Clear filters button

### 💥 Chaos Simulation (Tricky Requirement)
- 10% chance of slow API response (2.5 second delay)
- 8% chance of simulated failed request
- Duplicate expense detection (within 10 seconds)
- All errors handled gracefully — no broken screens
- Loading spinner on slow requests
- Error toast messages with auto-dismiss

### ⚡ UX Enhancements
- Optimistic UI updates — expenses appear instantly before API responds
- If API fails, expense is silently rolled back
- Toast notifications (success + error) auto-dismiss after 3 seconds
- Loading screen while data fetches
- Empty states on every screen with helpful messages
- Responsive design — works on mobile and desktop

---

## 🏗️ Architecture

```
Browser (Next.js)
      │
      │  HTTP requests via Axios
      │  (with chaos simulation interceptor)
      ▼
Express REST API
      │
      ├── /api/user      → Register, Login
      ├── /api/group     → Create, Get, Add Member
      ├── /api/expense   → CRUD, Mark Paid
      └── /api/settlement → Calculate balances
      │
      ▼
MongoDB (Mongoose)
  ├── users
  ├── groups
  └── expenses
```

### Settlement Algorithm

Uses **Minimum Cash Flow** greedy algorithm:

```
Example:
  Alex paid ₹2500 for dinner — split 4 ways (₹625 each)

  Balances:
    Alex:  +2500 - 625 = +1875  (gets back)
    John:  -625               (owes)
    Sam:   -625               (owes)
    David: -625               (owes)

  Settlements:
    John  → Alex: ₹625
    Sam   → Alex: ₹625
    David → Alex: ₹625
```

Steps:
1. Calculate net balance for each person
2. Find biggest debtor (most negative) and biggest creditor (most positive)
3. Settle between them with minimum amount
4. Repeat until all balances are near zero

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)

### 1. Clone the repository
```bash
git clone https://github.com/AARTHIBALAMURUGAN/ExpenseSplitter
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create `.env` file in server folder:
```
MONGO_URI=
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
SECRET_KEY=jwt_secret_key_expense_splitter_123
PORT=5000
```

Start backend:
```bash
npm start or npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
```

Start frontend:
```bash
npm run dev
```

### 4. Open in browser
```
http://localhost:3000
```

---

## 🌐 Deployment

### Backend → Render
1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. New Web Service → connect repo → select `server` folder
4. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
5. Deploy

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import project → select `client` folder
3. Deploy

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/user/register | Create account |
| POST | /api/user/login | Login |

### Groups
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/group/getgroup | Get all groups |
| POST | /api/group/creategroup | Create group |
| GET | /api/group/getgroupbyid/:id | Get single group |
| POST | /api/group/addmember | Add member by email |

### Expenses
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/expense/expensegroup/:groupId | Get group expenses |
| POST | /api/expense/addexpense | Add expense |
| PATCH | /api/expense/updateexpense/:id | Update expense |
| DELETE | /api/expense/deleteexpense/:id | Delete expense |
| PATCH | /api/expense/markpaid/:groupId | Mark as paid |

### Settlements
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/settlement/:groupId | Get settlements |

---

## 🎯 Assumptions

- Users must register before being added to a group
- Expenses are split equally among selected participants
- Mark as paid clears that user's debt across all expenses in the group
- Chaos simulation is only active — random failures test error handling

---

## 👨‍💻 Author

**Your Name**
- GitHub: https://github.com/AARTHIBALAMURUGAN
- Email: aarthib875@gmail.com


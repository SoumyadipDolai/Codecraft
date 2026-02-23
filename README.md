# 🏥 HealthVault

A comprehensive personal health management platform with unique Health ID, medical record storage, emergency access, AI insights, and more.

## 📁 Project Structure

```
healthvault/
├── backend/                 # Node.js Express API
│   ├── prisma/              # Database schema
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, upload, validation
│   │   ├── routes/          # API endpoints
│   │   ├── utils/           # Helpers (OTP, QR, HealthID)
│   │   └── config/          # Database config
│   └── package.json
│
└── mobile/                  # React Native Expo app
    ├── src/
    │   ├── screens/         # App screens
    │   │   ├── auth/        # Login, Register, VerifyOTP
    │   │   └── ...          # Dashboard, Records, Emergency, etc.
    │   ├── services/        # API layer
    │   └── context/         # Auth state management
    └── App.js               # Main entry point
```

## 🚀 Quick Start

### Backend Setup

```bash
cd healthvault/backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env
# Edit .env with your database and Firebase credentials

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Mobile App Setup

```bash
cd healthvault/mobile

# Install dependencies (already done)
npm install

# Start Expo development server
npx expo start
```

## 🔧 Environment Variables

Create a `.env` file in the backend folder:

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/healthvault"
JWT_SECRET=your-secret-key
FIREBASE_PROJECT_ID=your-project
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📱 Features

### ✅ Implemented (Phase 1 MVP)
- **Authentication**: Email/password login with OTP verification
- **Health ID**: Unique alphanumeric ID (HV-YYYY-XXXX-XXXX) with QR code
- **Medical Records**: Upload PDFs/images, categorized storage
- **Emergency Card**: Blood group, allergies, emergency contacts - shareable
- **Reminders**: Medicine/appointment reminders with scheduling

### 🔮 Coming Soon (Phase 2+)
- AI Health Insights
- Doctor Access Links
- Hospital Integration
- Family Management

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verify-otp` | OTP verification |
| GET | `/api/health-id/qr` | Get Health ID with QR |
| GET | `/api/records` | List medical records |
| POST | `/api/records` | Upload record |
| GET | `/api/emergency/card` | Get emergency card |
| PUT | `/api/emergency` | Update emergency info |
| GET | `/api/reminders` | List reminders |
| POST | `/api/reminders` | Create reminder |

## 🛠 Tech Stack

- **Mobile**: React Native (Expo)
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: JWT + OTP (Email)
- **Storage**: Firebase Storage (configurable)
- **QR Codes**: qrcode library

## 📄 License

MIT


flowchart TD
    %% Phases
    A[Requirements & Research] --> B[Conceptual Design]
    B --> C[Prototyping & Validation]
    C --> D[Implementation & Development]
    D --> E[Testing & Quality Assurance]
    E --> F[Deployment & Release]
    F --> G[Monitoring & Maintenance]

   %% Detailed steps
    subgraph Req[Requirements & Research]
        A1[Stakeholder Interviews]
        A2[Market & Feasibility Study]
        A3[User Stories & Use Cases]
        A4[Technical Feasibility & Risk Assessment]
    end
    A --> A1 --> A2 --> A3 --> A4 --> B

subgraph Design[Conceptual Design]
        B1[Architecture Blueprint]
        B2[Data & Process Modeling]
        B3[Technology Stack Selection]
        B4[Security & Compliance Planning]
    end
    B --> B1 --> B2 --> B3 --> B4 --> C

subgraph Proto[Prototyping & Validation]
        C1[Rapid UI/UX Mockups]
        C2[Proof‑of‑Concept (PoC) Development]
        C3[User Feedback Loops]
        C4[Iterative Refinement]
    end
    C --> C1 --> C2 --> C3 --> C4 --> D

subgraph Impl[Implementation & Development]
        D1[Codebase Setup & Repo Init]
        D2[Feature Development (Modules/Components)]
        D3[Integration with Services (APIs, DB, Cloud)]
        D4[Continuous Integration (CI) Pipelines]
    end
    D --> D1 --> D2 --> D3 --> D4 --> E

subgraph Test[Testing & QA]
        E1[Unit & Integration Tests]
        E2[Performance & Load Testing]
        E3[Security & Pen‑Testing]
        E4[User Acceptance Testing (UAT)]
    end
    E --> E1 --> E2 --> E3 --> E4 --> F

subgraph Deploy[Deployment & Release]
        F1[Staging Deployment]
        F2[Release Candidate Validation]
        F3[Production Roll‑out (Blue/Green, Canary)]
        F4[Documentation & Training]
    end
    F --> F1 --> F2 --> F3 --> F4 --> G

subgraph Ops[Monitoring & Maintenance]
        G1[Observability (Metrics, Logs, Traces)]
        G2[Incident Management & SLA Tracking]
        G3[Continuous Improvement & Feature Enhancements]
        G4[Technical Debt & Refactoring]
    end
    G --> G1 --> G2 --> G3 --> G4

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

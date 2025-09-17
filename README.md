# Cycle Chain Client

A Next.js application with authentication system.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the client directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/cycle-chain

# NextAuth.js
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Generate NEXTAUTH_SECRET

You can generate a secure secret using:

```bash
openssl rand -base64 32
```

### 4. Database Setup

Make sure you have MongoDB running locally or update the MONGODB_URI to point to your MongoDB instance.

### 5. Run the Application

```bash
npm run dev
```

## Features

- User registration and login
- JWT-based authentication with NextAuth.js
- Protected routes with middleware
- User dashboard
- Session management

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication
- `GET /api/auth/[...nextauth]` - NextAuth.js session management

## Authentication Flow

1. Users can register at `/register`
2. Users can login at `/login`
3. Authenticated users are redirected to `/dashboard`
4. Protected routes are automatically secured
5. Users can sign out from the dashboard

## File Structure

```
client/
├── app/
│   ├── api/auth/
│   │   ├── [...nextauth]/route.js
│   │   └── register/route.js
│   ├── (user_management)/
│   │   ├── login/page.js
│   │   └── register/page.js
│   └── dashboard/page.js
├── components/
│   └── Providers.js
├── lib/
│   └── db.js
├── models/
│   └── User.js
└── middleware.js
```

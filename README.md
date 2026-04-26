# Iso

**Iso** is a full-stack, portfolio-grade photography platform. Photographers can easily upload, manage, and share their work, while general users can explore an infinite-scroll gallery of high-resolution images. 

---

## High-Level Design (HLD) & Architecture

Iso is built on a clean client-server architecture utilizing **Next.js** for the frontend and **Node.js/Express** for the backend, backed by **PostgreSQL** and **ImageKit**.

### System Diagram & Flow

1. **Client (Next.js)** 
   - Provides a dynamic, SSR/CSR-hybrid frontend designed with TailwindCSS.
   - Maintains global state using `Zustand`.
   - Utilizes a centralized `Axios` instance (`frontend/lib/axios.ts`) that automatically handles authentication headers and token refreshes via interceptors.

2. **API & Server (Node.js/Express)**
   - Operates as a stateless backend out of a consolidated `index.ts` handler to ensure monolithic simplicity.
   - Handles all business logic, direct database requests, and photo proxy uploads.

3. **Database (PostgreSQL)**
   - No ORMs (like Prisma/TypeORM) are used. The platform queries Postgres using native raw SQL via the `pg` pool library for maximum performance and precise schema control.
   - **Auto-Migrations**: Upon execution (`npm run dev`), the backend automatically validates and configures the database schema against `backend/schema.sql`.

4. **Storage (ImageKit)**
   - The frontend never directly exposes API keys to cloud storage providers. 
   - Images are uploaded as `multipart/form-data` to the backend using `multer` in-memory. The backend securely pushes the buffer to **ImageKit**, retrieving optimized URLs to securely store in the database.

---

### Authentication Architecture (JWT & Secure Cookies)

Iso utilizes an industry-standard, deeply secure double-token system:

1. **Authentication Flow**:
    - Users sign up or log in with Email and Password using `bcrypt` hashing.
    - On success, the backend generates two JSON Web Tokens:
        - **Access Token** (15-minute expiry).
        - **Refresh Token** (7-day expiry).
    - The **Refresh Token** is delivered securely to the browser via an **HTTP-Only, Secure Cookie** (preventing XSS attacks).
    - The short-lived **Access Token** is returned payload data to be held in the browser's memory/localStorage and attached to Axios `Authorization: Bearer <token>` headers.

2. **The Interceptor (Silent Refresh)**:
    - If an Access Token expires, API calls return `401 Unauthorized`.
    - The custom frontend Axios Interceptor detects this and *pauses* the request.
    - It silently pings the backend `/u/auth/refresh` endpoint, validating the HTTP-Only cookie.
    - The backend returns a new Access Token, which the Interceptor dynamically caches before *resuming* the paused request. The user experiences zero interruption.

---

## Tech Stack Overview

### **Frontend**
- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Networking**: Axios

### **Backend**
- **Runtime**: Node.js + Express
- **Database Wrapper**: `pg` (Raw PostgreSQL Queries)
- **Authentication**: JWT + Cookie Parser + Bcrypt
- **File Handling**: Multer + ImageKit SDK

---

## Installation & Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/iso.git
cd iso

# 2. Install dependencies for both modules
cd backend && npm install
cd ../frontend && npm install
```

### Environment Variables

You need to create a `.env` file in **both** the `frontend/` and `backend/` directories.

**Backend (`backend/.env`)**
```env
# Server
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Database 
# Create an empty Postgres database named 'iso' prior to this
DATABASE_URL=postgres://username:password@localhost:5432/iso

# Auth Configuration
JWT_SECRET=your_super_secret_access_key
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key

# ImageKit Storage
IMAGEKIT_PUBLICKEY=your_public_key
IMAGEKIT_PRIVATEKEY=your_private_key
IMAGEKIT_URLENDPOINT=https://ik.imagekit.io/your_id
```

**Frontend (`frontend/.env.local`)**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Running the Application

Iso auto-migrates its Postgres database upon startup. Once your `.env` variables are in place:

```bash
# Run backend (From /backend)
npm run dev

# Optional: Seed the database with 100 dummy photos to test pagination
npm run seed

# Run frontend (From /frontend)
npm run dev
```

---

## License
MIT License – feel free to use and adapt.

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

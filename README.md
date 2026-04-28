# Iso - Professional Photography Platform

**Iso** is a full-stack, portfolio-grade photography platform. Photographers can easily upload, manage, and share their work, while general users can explore an Pinterest-like infinite-scroll gallery of high-resolution images.

![Iso Preview](./Branding.jpg)

---

## High-Level Architecture & Design

Iso is built using **Next.js** for the frontend and **Node.js/Express** for the backend, backed by **PostgreSQL**, **Redis**, and **ImageKit**. The entire application is containerized using **Docker** and managed via **Docker Compose**.

### System Diagram & Flow

1. **Client (Next.js)** 
   - Provides a dynamic, SSR/CSR-hybrid frontend designed with **TailwindCSS**.
   - Maintains global state using **Zustand**.
   - Utilizes a centralized `Axios` instance (`frontend/lib/api.ts`) that automatically handles authentication headers and token refreshes via interceptors.

2. **API & Server (Node.js/Express)**
   - All backend API endpoints are namespaced under `/api/` (e.g., `/api/auth/login`).
   - Handles authentication, direct database requests, and photo proxy uploads.

3. **Background Worker (BullMQ + Redis)**
   - **Asynchronous Processing**: Image uploads are offloaded to a background worker to ensure the main API remains fast and responsive. 
   - Powered by **BullMQ** and **Redis**, the worker handles batch image uploads to ImageKit.

4. **Database (PostgreSQL)**
   - No ORMs (like Prisma/TypeORM) are used. The platform queries Postgres using native raw SQL via the `pg` pool library for maximum performance and precise schema control.
   - **Auto-Migrations**: The backend automatically validates and configures the database schema on startup against `backend/schema.sql`.

5. **Storage (ImageKit)**
   - The frontend never directly exposes API keys to cloud storage providers. 
   - Images are uploaded as `multipart/form-data`. The background worker pushes the buffer to **ImageKit**, retrieving optimized URLs to securely store in the database.

---

## Security & Authentication (JWT)

Iso utilizes an industry-standard, deeply secure double-token system:

1. **Authentication Flow**:
    - Users sign up or log in using `bcrypt` hashing.
    - On success, the backend generates two JSON Web Tokens:
        - **Access Token** (15-minute expiry).
        - **Refresh Token** (7-day expiry).
    - The **Refresh Token** is delivered securely to the browser via an **HTTP-Only, Secure Cookie** (preventing XSS attacks).
    - The short-lived **Access Token** is returned payload data to be held in memory/localStorage and attached to Axios `Authorization: Bearer <token>` headers.

2. **The Interceptor (Silent Refresh)**:
    - If an Access Token expires, API calls return `401 Unauthorized`.
    - The custom frontend Axios Interceptor detects this and *pauses* the request.
    - It silently pings the backend `/api/auth/refresh` endpoint, validating the HTTP-Only cookie.
    - The backend returns a new Access Token, which the Interceptor dynamically caches before *resuming* the paused request. The user experiences zero interruption.

---

## Tech Stack

### **Frontend**
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Networking**: Axios

### **Backend**
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL (Raw SQL via `pg`)
- **Queue/Cache**: Redis + BullMQ
- **Authentication**: JWT + Cookie Parser + Bcrypt
- **Storage**: Multer + ImageKit SDK

### **DevOps & Deployment**
- **Containerization**: Docker & Docker Compose
- **CI/CD Pipeline**: GitHub Actions (Build, Push to GHCR, Auto-Deploy)
- **Web Server**: Nginx Reverse Proxy
- **Security**: Certbot (Let's Encrypt SSL/HTTPS)
- **Cloud Hosting**: AWS EC2

---

## Running Locally (Docker)

The easiest way to run the application locally is using Docker. You don't need Postgres or Redis installed on your machine!

### 1. Clone & Configure
```bash
git clone https://github.com/yourusername/iso.git
cd iso
```

Create a `.env` file in the `backend/` directory:
```env
# Database Credentials
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=iso

# Auth Configuration
JWT_SECRET=your_super_secret_access_key
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key

# ImageKit Storage
IMAGEKIT_PUBLICKEY=your_public_key
IMAGEKIT_PRIVATEKEY=your_private_key
IMAGEKIT_URLENDPOINT=https://ik.imagekit.io/your_id
```

*(Note: The `docker-compose.yml` automatically passes the correct `DATABASE_URL` and `REDIS_URL` to the containers).*

### 2. Start the Stack
From the root directory, run:
```bash
docker compose up --build
```
This will spin up 5 containers:
1. `db` (Postgres 15)
2. `redis`
3. `backend` (Express API on Port 8000)
4. `worker` (BullMQ Background Jobs)
5. `frontend` (Next.js on Port 3000)

### 3. Access the App
- Frontend: `http://localhost:3000`
- API Backend: `http://localhost:8000`

---

## Production Deployment (CI/CD)

This repository includes a fully automated GitHub Actions pipeline (`.github/workflows/ci-cd.yml`). 

Every push to the `master` branch triggers the following:
1. **CI**: Builds both frontend and backend to ensure no compilation errors.
2. **Build & Push**: Creates production-optimized Docker images and pushes them to GitHub Container Registry (GHCR).
3. **Deploy**: Connects via SSH to your AWS EC2 instance, pulls the latest images, and gracefully restarts the containers using `docker-compose`.

### Nginx Configuration
In production, Nginx is used as a reverse proxy to route traffic seamlessly on a single domain (e.g., `https://iso-app.duckdns.org`):

- Traffic to `location /api/` → Proxied to the Express backend (Port 8000).
- Traffic to `location /` → Proxied to the Next.js frontend (Port 3000).

---

## License
MIT License – feel free to use and adapt.

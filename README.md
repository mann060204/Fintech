# Trust-Verified Peer Payment Platform

A fintech platform featuring AI-driven context and trust engines, secure payments, and agreements.

## Project Structure
- **backend/**: Microservices (Agreement, Payment, User, Rewards, AI Engines) & API Gateway.
- **frontend/**: Expo (React Native) mobile application.
- **infrastructure/**: Docker orchestration and database initialization.

## Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.9+)
- [Docker & Docker Compose](https://www.docker.com/)
- [Expo Go](https://expo.dev/client) app on your phone (for mobile testing)

---

## 🚀 Quick Start (Recommended)

Run the entire backend system (Databases + Services) using Docker.

1. **Navigate to Infrastructure:**
   ```bash
   cd infrastructure
   ```

2. **Start Services:**
   ```bash
   docker-compose up --build
   ```
   *This will start Postgres, Mongo, Redis, and all backend services.*

3. **Start Frontend:**
   Open a new terminal.
   ```bash
   cd frontend
   npm install
   npm start
   ```
   *Scan the QR code with the Expo Go app.*

---

## 🛠 Manual Setup

If you prefer to run services individually without Docker Compose.

### Database Setup
Ensure you have **PostgreSQL**, **MongoDB**, and **Redis** running locally or update the `.env` files in each service to point to your DB instances.

### Backend Services

#### 1. API Gateway (Port 4000)
```bash
cd backend/api-gateway
npm install
npm start
```

#### 2. Agreement Service (Port 4001)
```bash
cd backend/services/agreement-service
npm install
npm run dev
```

#### 3. Payment Service (Port 4002)
```bash
cd backend/services/payment-service
npm install
npm run dev
```

#### 4. User Service (Port 4004)
```bash
cd backend/services/user-service
npm install
npm run dev
```

#### 5. Context AI Engine (Port 8002) - Python
```bash
cd backend/services/context-ai-engine
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## API Documentation
Once the backend is running, the API Gateway is accessible at:
`http://localhost:4000`

Service endpoints:
- Agreement Service: `http://localhost:4001/graphql`
- User Service: `http://localhost:4004/graphql`

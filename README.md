# Global Algo IT - Backend

A robust Node.js + TypeScript backend supporting the Lead Management System, featuring a modular WhatsApp bulk messaging engine.

## 🔗 Frontend Repository

This backend connects with: [Global-Algo-IMS Frontend](https://github.com/itz-himanshu128/Global-Algo-IMS)

## 📚 Documentation

**New to the project?** See **[DOCS_INDEX.md](DOCS_INDEX.md)** for complete documentation navigation.

**Quick Start:** See **[QUICK_START.md](QUICK_START.md)** or run `./setup-frontend.sh` to automatically set up everything.

## Directory Structure

*   **`src/server.ts`**: Entry point. Handles HTTP routes, Auth, and Audit logging.
*   **`src/whatsapp/`**: Dedicated module for WhatsApp logic.
    *   **`db.ts`**: MongoDB connection and collection initialization.
    *   **`adapter/`**: Third-party providers (Twilio) abstraction.
    *   **`api/`**: REST endpoints for Campaigns and Webhooks.
    *   **`workers/`**: Background worker for processing the message queue (Redis).
*   **`migrations/`**: MongoDB schema documentation and setup instructions.
*   **`data/`**: Runtime storage for Audit logs (ignored by git).

## Setup & Installation

1.  **Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Configuration**:
    Copy the example file and fill in your details.
    ```bash
    cp .env.example .env
    ```
    
    **Required Environment Variables:**
    *   **PORT**: Backend server port (default: `3001`)
    *   **FRONTEND_URL**: Frontend application URL for CORS (default: `http://localhost:5173`)
    *   **MongoDB**: Required for data persistence. Ensure MongoDB is running locally or provide a connection string.
    *   **Twilio**: Required for sending WhatsApp messages.
    *   **Redis**: Required for the message queue. Ensure Redis is running (`redis-server`).

3.  **Database Setup**:
    Follow the instructions in `migrations/001_whatsapp_mongodb.md` to set up MongoDB collections and indexes.

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    *   Runs on `http://localhost:3001`.
    *   Automatically connects to MongoDB and initializes collections.
    *   Starts the internal background worker (if `ENABLE_WORKER=true`).

## Connecting Frontend

The backend is configured to work with the frontend repository: [Global-Algo-IMS](https://github.com/itz-himanshu128/Global-Algo-IMS)

### Frontend Setup:

1.  **Clone and setup frontend**:
    ```bash
    git clone https://github.com/itz-himanshu128/Global-Algo-IMS.git
    cd Global-Algo-IMS
    npm install
    ```

2.  **Configure Frontend Environment**:
    Create a `.env` file in the frontend directory:
    ```env
    VITE_API_BASE_URL=http://localhost:3001/api
    VITE_API_TIMEOUT=10000
    ```

3.  **Start Frontend**:
    ```bash
    npm run dev
    ```
    *   Frontend runs on `http://localhost:5173` by default.

4.  **Access the Application**:
    *   Frontend: `http://localhost:5173`
    *   Backend API: `http://localhost:3001/api`
    *   Login with demo credentials (see frontend LoginPage)

## Production Build

1.  **Build**:
    ```bash
    npm run build
    ```
2.  **Start**:
    ```bash
    npm start
    ```
    *   Ensure MongoDB is accessible with the connection string specified in `.env`.

## WhatsApp Integration (Twilio Sandbox)

1.  **Configure Twilio**:
    *   Set `PUBLIC_URL` in `.env` to your public endpoint (e.g., using ngrok).
    *   In Twilio Console, set the WhatsApp Sandbox Webhook to: `${PUBLIC_URL}/api/whatsapp/webhook`.
2.  **Opt-In**:
    *   Users must join your sandbox (e.g., send `join <keyword>` to the sandbox number) before you can message them.
    *   The database migration seeds a test user. Update `data/whatsapp.db` -> `clients` table with your real sandbox number for testing.

## API Endpoints

*   **Auth**: `POST /api/auth/login`, `GET /api/auth/me`
*   **Campaigns**:
    *   `POST /api/campaigns` (Create draft)
    *   `POST /api/campaigns/:id/start` (Queue messages)
    *   `GET /api/campaigns/:id` (View stats)

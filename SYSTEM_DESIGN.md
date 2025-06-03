# System Design: SimpLX Application

## 1. Overview

SimpLX is a full-stack web application featuring a React-based frontend and a Node.js backend. It incorporates real-time communication using Socket.IO, data persistence with MongoDB, and media asset management via Cloudinary. The application is designed to be deployed as a single service on Render, where the backend serves the frontend and handles all API requests.

## 2. Core Components

### 2.1. Frontend

*   **Framework/Library**: React (built with Vite)
*   **Location**: `/frontend` directory
*   **Responsibilities**:
    *   Rendering the user interface (UI) and managing user interactions.
    *   Client-side routing.
    *   Making API requests to the backend for data.
    *   Establishing and managing real-time connections with the backend via Socket.IO.
*   **Build**: The frontend is built into a static `dist` directory (`/frontend/dist`), which is then served by the backend in production.

### 2.2. Backend

*   **Framework**: Node.js with Express.js
*   **Location**: `/backend` directory (main entry point: `backend/server.js`)
*   **Responsibilities**:
    *   Providing a RESTful API for the frontend (handling CRUD operations).
    *   User authentication and authorization.
    *   Business logic processing.
    *   Serving the static frontend assets (from `/frontend/dist`) in a production environment.
    *   Interacting with the MongoDB database.
    *   Managing real-time communication with clients using Socket.IO.
    *   Integrating with Cloudinary for media uploads and management.

### 2.3. Real-time Communication

*   **Technology**: Socket.IO
*   **Integration**:
    *   The Socket.IO server is integrated with the Express HTTP server on the backend.
    *   The frontend client connects to this Socket.IO server.
*   **Purpose**: Used for features requiring real-time updates, such as live notifications, chat, or collaborative features.

### 2.4. Database

*   **Type**: NoSQL Database
*   **Technology**: MongoDB
*   **Connection**: Managed by Mongoose ODM from the backend (`backend/db/connectMongoDB.js`).
*   **Purpose**: Storing application data, including user profiles, posts, notifications, etc.

### 2.5. Cloud Services

*   **Image and Media Management**:
    *   **Service**: Cloudinary
    *   **Integration**: The backend uses the Cloudinary SDK to handle image uploads, storage, and delivery. Credentials are managed via environment variables.

## 3. Project Structure

The project is organized with distinct frontend and backend concerns:

*   **`/` (Root Directory)**:
    *   `package.json`: Manages root-level dependencies (mostly backend) and defines scripts for building and starting the application (e.g., `npm run build`, `npm start`).
    *   `SYSTEM_DESIGN.md`: This document.
    *   `.gitignore`: Specifies intentionally untracked files.
    *   Other configuration files.
*   **`/frontend`**: Contains the React/Vite frontend application. It has its own `package.json` for frontend-specific dependencies and build scripts.
*   **`/backend`**: Contains the Node.js/Express backend application.
    *   `server.js`: Main entry point for the backend server.
    *   `routes/`: Defines API endpoints.
    *   `controllers/`: Handles business logic for requests.
    *   `models/`: Defines Mongoose schemas for database collections.
    *   `middleware/`: Custom middleware for Express.
    *   `db/`: Database connection logic.
    *   `socket/`: Socket.IO related logic.

## 4. Deployment (Render)

*   **Service Type**: Web Service on Render.
*   **Build Process**:
    1.  Root `npm install` (installs backend dependencies and devDependencies needed for build script).
    2.  `npm install --prefix frontend` (installs frontend dependencies).
    3.  `npm run build --prefix frontend` (builds the React app into `frontend/dist`).
    *   This is orchestrated by the root `package.json` script: `\"build\": \"npm install && npm install --prefix frontend && npm run build --prefix frontend\"`.
*   **Start Command**: `npm start` (which executes `cross-env NODE_ENV=production node backend/server.js`).
*   **Runtime Environment**: Node.js.
*   **Port Handling**: The backend server listens on the `PORT` environment variable provided by Render and binds to `0.0.0.0`.
*   **Single Service**: Both frontend and backend run on the same port. The Express server serves the static frontend files from `frontend/dist` and handles API requests.
*   **Environment Variables**: Critical configurations (database URI, Cloudinary keys, JWT secrets, `FRONTEND_URL` for Socket.IO CORS) are managed as environment variables in Render.

## 5. Key Features (Inferred)

Based on the project structure (e.g., route names), the application likely supports:

*   **User Authentication**: Sign-up, login, logout (e.g., `authRoutes`).
*   **User Profiles**: Managing user information (e.g., `userRoutes`).
*   **Posts/Content Management**: Creating, reading, updating, deleting posts (e.g., `postRoutes`).
*   **Notifications**: Real-time or polled notifications for users (e.g., `notificationRoutes`, Socket.IO integration).

## 6. Data Flow (Example: User creates a new post with an image)

1.  **Frontend**: User fills out a form in the React app and selects an image.
2.  **Frontend**: On submission, the frontend makes an API request (e.g., `POST /api/posts`) to the backend, sending post data and the image file.
3.  **Backend (Express API)**:
    *   The request hits the corresponding route in `postRoutes.js`.
    *   Middleware (e.g., for authentication, file handling) may process the request.
    *   The controller function is invoked.
4.  **Backend (Cloudinary)**: If an image is part of the request, the backend uploads the image to Cloudinary using the Cloudinary SDK. Cloudinary returns a URL for the stored image.
5.  **Backend (MongoDB)**: The controller saves the post data (including the Cloudinary image URL) to the MongoDB database via Mongoose models.
6.  **Backend (Response)**: The backend sends a response (e.g., success message, new post data) back to the frontend.
7.  **Frontend**: The React app updates the UI to reflect the new post.
8.  **Backend (Socket.IO - Optional)**: If creating a post should trigger real-time notifications to other users, the backend emits a Socket.IO event.
9.  **Frontend (Socket.IO - Optional)**: Other connected clients listening for that event update their UI accordingly (e.g., show a new post notification).

This system design provides a high-level overview. Specific details of each component and interaction can be further elaborated as needed. 
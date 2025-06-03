import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import { Server } from "socket.io";
import http from "http";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";

import connectMongoDB from "./db/connectMongoDB.js";
import { initializeSocketIO } from "./socket/socket.js";
// CORS for Express is not strictly needed if frontend is served from the same origin
// and all API calls are relative. If you need to allow other origins for API calls,
// you can re-enable it with appropriate configuration.
// import cors from "cors";

dotenv.config();

// For Render, set this environment variable in the Render dashboard
// to your service's URL, e.g., https://your-app-name.onrender.com
// It can be a comma-separated list if you need to allow multiple origins for Socket.IO.
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"; // Fallback for local dev

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: FRONTEND_URL.split(',').map(url => url.trim()), // Allow multiple origins, trim whitespace
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		credentials: true,
	},
});

initializeSocketIO(io);

const PORT = process.env.PORT || 5000;
// path.resolve() gives the project root if server.js is run from there (e.g. `node backend/server.js`)
const __dirname = path.resolve();


app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

connectMongoDB();

// Serve static files from frontend build
// NODE_ENV is set to "production" by Render automatically.
if (process.env.NODE_ENV === "production") {
    const frontendDistPath = path.join(__dirname, "frontend", "dist");
	app.use(express.static(frontendDistPath));

	// For any other route, serve index.html from the frontend build directory
	// This is crucial for client-side routing (e.g., React Router).
	app.get("*", (req, res) => {
		res.sendFile(path.join(frontendDistPath, "index.html"));
	});
}

// Start the server
httpServer.listen(PORT, "0.0.0.0", () => {
	console.log(`Server listening on port ${PORT}`);
	console.log(`Attempting to serve frontend from: ${path.join(__dirname, "frontend", "dist", "index.html")}`);
    console.log(`Socket.IO CORS configured for origins: ${FRONTEND_URL}`);
});

// The export default app; is removed as it's not needed when starting the server directly.
// Comments related to serverless (Netlify) can be removed if this project is solely targeting Render.

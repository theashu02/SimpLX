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
import cors from "cors";

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL;

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(
	cors({
	  origin: FRONTEND_URL, 
	  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	  credentials: true, // Important for cookies
	})
);
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: FRONTEND_URL,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		credentials: true, // Important for cookies
	},
});

initializeSocketIO(io);

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json({ limit: "5mb" })); // to parse req.body
// limit shouldn't be too high to prevent DOS
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

// Connect to MongoDB when the module is loaded if not in a serverless environment trigger
// For serverless, we will call connectMongoDB from the handler.
// However, it's better to ensure it's connected before handler exports.

// Let's try connecting immediately. If this causes issues with local dev, we can refine.
connectMongoDB(); 

// if (process.env.NODE_ENV === "production") { // This was for monolithic serving
// 	app.use(express.static(path.join(__dirname, "/frontend/dist")));

// 	app.get("*", (req, res) => {
// 		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
// 	});
// }

// Only listen if not in a serverless environment (Netlify defines LAMBDA_TASK_ROOT)
if (!process.env.LAMBDA_TASK_ROOT) {
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // connectMongoDB(); // Moved up to ensure connection for serverless too
  });
}

export default app; // Export app for serverless handler
// If socket.io needs the httpServer instance directly for serverless-http, we might need to export it too
// or handle socket.io initialization differently for serverless.
// For now, serverless-http usually works with the Express app instance for HTTP requests.
// Socket.IO might need a different setup for serverless if not using a managed service.

// Let's re-evaluate socket.io. Netlify functions are stateless. Long-lived socket connections will be an issue.
// You might need a managed WebSocket service or a different approach for real-time features on Netlify functions.
// For now, we focus on getting HTTP part working.

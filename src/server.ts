// =============================== ENTRY POINT SERVER + SOCKET
// src/server.ts
// ===============================
import app from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import http from "http";
import { initSocket } from "./socket/index.js";

// ===============================
dotenv.config();

// ===============================
const PORT = process.env.PORT || 5000;

// ================= CREATE HTTP SERVER
const server = http.createServer(app);

// ================= INIT SOCKET
initSocket(server);

// =============================== START SERVER
async function startServer() {
	try {
		// ================= CONNECT DATABASE
		await connectDB();

		// ================= START EXPRESS SERVER
		server.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
			console.log(`🧠 Environment: ${process.env.NODE_ENV || "development"}`);
		});
	} catch (error) {
		console.error("❌ Failed to start server:", error);
		process.exit(1);
	}
}

// ================= GRACEFUL SHUTDOWN
process.on("SIGTERM", () => {
	console.log("SIGTERM received. Shutting down gracefully...");
	process.exit(0);
});

startServer();

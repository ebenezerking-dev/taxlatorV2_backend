// =============================== SOCKET INDEX LIVE UPDATES
// src/socket/index.ts

import { Server } from "socket.io";

// ===============================
let io: Server;

// ===============================
export const initSocket = (server: any) => {
	io = new Server(server, {
		cors: {
			origin: process.env.CLIENT_URL,
			credentials: true,
		},
	});

	// =============================== CONNECTION
	io.on("connection", (socket) => {
		console.log("🟢 Connected:", socket.id);

		// =============================== USER ROOM JOIN
		socket.on("auth:join", (userId: string) => {
			socket.join(userId);

			console.log(`👤 User joined room: ${userId}`);
		});

		// =============================== DISCONNECT
		socket.on("disconnect", (reason) => {
			console.log("🔴 Disconnected:", socket.id, reason);
		});
	});
};

// ===============================
export const getIO = () => {
	if (!io) {
		throw new Error("Socket not initialized");
	}

	return io;
};

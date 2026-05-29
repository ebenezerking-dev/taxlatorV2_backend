// =============================== JWT UTILITIES
// src/utils/jwt.ts
// ===============================
import jwt from "jsonwebtoken";

// =============================== ACCESS TOKEN
export const generateAccessToken = (payload: {
	id: string;
	role: "USER" | "ADMIN";
	tokenVersion: number;
}) => {
	return jwt.sign(payload, process.env.JWT_SECRET!, {
		expiresIn: "15m",
	});
};

// =============================== REFRESH TOKEN
export const generateRefreshToken = (payload: {
	id: string;
	tokenVersion: number;
}) => {
	return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
		expiresIn: "7d",
	});
};

// =============================== VERIFY ACCESS TOKEN
export const verifyAccessToken = (token: string) => {
	return jwt.verify(token, process.env.JWT_SECRET!);
};

// =============================== VERIFY REFRESH TOKEN
export const verifyRefreshToken = (token: string) => {
	return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
};

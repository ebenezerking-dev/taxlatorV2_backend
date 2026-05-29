// ===================================== REFRESH TOKEN ROTATION SERVICE
// src/services/refresh.service.ts
// =====================================

import crypto from "crypto";
import User from "../models/User.js";

import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} from "../utils/jwt.js";

import { toId } from "../utils/id.js";

// ===================================== HASH HELPER
const hashToken = (token: string) =>
	crypto.createHash("sha256").update(token).digest("hex");

// ===================================== REFRESH ACCESS TOKEN (ROTATION SAFE)
export const refreshAccessToken = async (refreshToken: string) => {
	// =============================== VERIFY TOKEN
	const decoded = verifyRefreshToken(refreshToken) as {
		id: string;
		tokenVersion: number;
	};

	const user = await User.findById(decoded.id);

	if (!user) {
		const error = new Error("User not found");
		(error as any).statusCode = 404;
		throw error;
	}

	// =============================== CLEAN EXPIRED TOKENS (SAFE MUTATION)
	user.refreshTokens = user.refreshTokens.filter(
		(t) => t.expiresAt > new Date(),
	) as any;

	const hashedOldToken = hashToken(refreshToken);

	// =============================== VALIDATE TOKEN EXISTS
	const tokenExists = user.refreshTokens.some(
		(t) => t.token === hashedOldToken,
	);

	if (!tokenExists) {
		const error = new Error("Invalid refresh token");
		(error as any).statusCode = 401;
		throw error;
	}

	// =============================== TOKEN VERSION CHECK
	if (decoded.tokenVersion !== user.tokenVersion) {
		const error = new Error("Token revoked");
		(error as any).statusCode = 401;
		throw error;
	}

	// =============================== REMOVE OLD TOKEN (SAFE MONGOOSE MUTATION)
	for (let i = user.refreshTokens.length - 1; i >= 0; i--) {
		if (user.refreshTokens[i].token === hashedOldToken) {
			user.refreshTokens.splice(i, 1);
		}
	}

	// =============================== GENERATE NEW TOKENS
	const userId = toId(user._id);

	const accessToken = generateAccessToken({
		id: userId,
		role: user.role,
		tokenVersion: user.tokenVersion,
	});

	const newRefreshToken = generateRefreshToken({
		id: userId,
		tokenVersion: user.tokenVersion,
	});

	const hashedNewToken = hashToken(newRefreshToken);

	// =============================== STORE NEW TOKEN
	user.refreshTokens.push({
		token: hashedNewToken,
		expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
	} as any);

	// IMPORTANT for Mongoose arrays
	user.markModified("refreshTokens");

	await user.save();

	// =============================== RESPONSE
	return {
		accessToken,
		refreshToken: newRefreshToken,
	};
};

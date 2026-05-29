// =============================== REFRESH TOKEN ROTATION SERVICE
// src/services/refresh.service.ts
// ===============================
import crypto from "crypto";

import User from "../models/User.js";

import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} from "../utils/jwt.js";

import { toId } from "../utils/id.js";

// ===============================
const hashToken = (token: string) =>
	crypto.createHash("sha256").update(token).digest("hex");

// ===============================
export const refreshAccessToken = async (refreshToken: string) => {
	// =============================== VERIFY JWT
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

	// =============================== CLEAN EXPIRED TOKENS
	await User.findByIdAndUpdate(user._id, {
		$pull: {
			refreshTokens: {
				expiresAt: { $lt: new Date() },
			},
		},
	});

	const hashedOldToken = hashToken(refreshToken);

	// =============================== CHECK TOKEN EXISTS
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

	// =============================== REMOVE OLD TOKEN
	await User.findByIdAndUpdate(user._id, {
		$pull: {
			refreshTokens: {
				token: hashedOldToken,
			},
		},
	});

	// =============================== GENERATE NEW TOKENS
	const newAccessToken = generateAccessToken({
		id: toId(user._id),
		role: user.role,
		tokenVersion: user.tokenVersion,
	});

	const newRefreshToken = generateRefreshToken({
		id: toId(user._id),
		tokenVersion: user.tokenVersion,
	});

	const hashedNewToken = hashToken(newRefreshToken);

	// =============================== SAVE NEW TOKEN
	const updatedUser = await User.findById(user._id);

	if (!updatedUser) {
		const error = new Error("User lost during refresh");
		throw error;
	}

	updatedUser.refreshTokens.push({
		token: hashedNewToken,
		expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
	});

	await updatedUser.save();

	return {
		data: {
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
		},
	};
};

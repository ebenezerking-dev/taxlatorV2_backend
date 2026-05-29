// ===================================== REFRESH TOKEN ROTATION CONTROLLER 
// src/controllers/refresh.controller.ts
// =====================================

import { Request, Response } from "express";
import { refreshAccessToken } from "../services/refresh.service.js";

// =====================================
export const refreshController = async (req: Request, res: Response) => {
	try {
		// =============================== GET COOKIE TOKEN
		const refreshToken = req.cookies?.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({
				message: "Refresh token missing",
			});
		}

		// =============================== ROTATE TOKENS
		const result = await refreshAccessToken(refreshToken);

		// =============================== SET NEW COOKIE
		res.cookie("refreshToken", result.refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			path: "/api/auth/refresh",
		});

		// =============================== SEND ACCESS TOKEN ONLY
		return res.status(200).json({
			data: {
				accessToken: result.accessToken,
			},
		});
	} catch (err) {
		return res.status(401).json({
			message: "Invalid refresh token",
		});
	}
};

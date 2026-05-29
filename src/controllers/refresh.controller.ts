// =============================== REFRESH CONTROLLER
// src/controllers/refresh.controller.ts
// ===============================
import { Request, Response } from "express";

import { refreshAccessToken } from "../services/refresh.service.js";

// =============================== REFRESH CONTROLLER
export const refreshController = async (req: Request, res: Response) => {
	try {
		// =============================== GET COOKIE
		const refreshToken = req.cookies.refreshToken;

		// =============================== MISSING TOKEN
		if (!refreshToken) {
			return res.status(401).json({
				message: "Refresh token missing",
			});
		}

		// =============================== REFRESH ACCESS TOKEN
		const data = await refreshAccessToken(refreshToken);

		// =============================== RESPONSE
		return res.status(200).json(data);
	} catch (err) {
		return res.status(401).json({
			message: "Invalid refresh token",
		});
	}
};

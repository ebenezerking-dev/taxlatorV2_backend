// =============================== AUTH CONTROLLER
// src/controllers/auth.controller.ts
// ===============================
import type { Request, Response, NextFunction } from "express";
import {
	registerUser,
	loginUser,
	createResetToken,
	resetPassword,
	logoutUser,
} from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";
import { getIO } from "../socket/index.js";
import User from "../models/User.js";

// =============================== REGISTER
export const register = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { name, email, password } = req.body;

		const result = await registerUser(name, email, password);

		getIO().emit("user:activity", {
			type: "REGISTER",
			userId: result.data.user.id,
			email: result.data.user.email,
			timestamp: new Date(),
		});

		return res.status(201).json(result);
	} catch (err) {
		next(err);
	}
};

// =============================== LOGIN
export const login = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { email, password } = req.body;

		const result = await loginUser(email, password);

		// set refresh cookie (ROTATION BASED)
		res.cookie("refreshToken", result.data.refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			path: "/api/auth/refresh",
		});

		return res.json({
			data: {
				user: result.data.user,
				accessToken: result.data.accessToken,
			},
		});
	} catch (err) {
		next(err);
	}
};

// =============================== FORGOT PASSWORD
export const forgotPassword = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { email } = req.body;

		await createResetToken(email);

		return sendSuccess(res, null, "Reset email sent");
	} catch (err) {
		next(err);
	}
};

// =============================== RESET PASSWORD
export const resetPasswordController = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { token, newPassword } = req.body;

		await resetPassword(token, newPassword);

		return sendSuccess(res, null, "Password reset successful");
	} catch (err) {
		next(err);
	}
};

// =============================== LOGOUT
export const logout = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const userId = (req as any).user?.id;

		await logoutUser(userId);

		getIO().to(userId).emit("auth:logout");

		res.clearCookie("refreshToken", {
			path: "/api/auth/refresh",
		});

		return res.json({ success: true });
	} catch (err) {
		next(err);
	}
};

// =============================== CHECK EMAIL
export const checkEmail = async (req: Request, res: Response) => {
	const email = req.query.email as string;

	const user = await User.findOne({ email });

	return res.json({
		success: true,
		exists: !!user,
	});
};

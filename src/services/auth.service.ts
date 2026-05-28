// =============================== AUTH SERVICE = REGISTER, LOGIN, RESET PASSWORD
// src/services/auth.service.ts

// ===============================
import crypto from "crypto";
import User from "../models/User.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { toId } from "../utils/id.js";
import { sendEmail } from "../utils/mailer.js";
import { getIO } from "../socket/index.js";

// =============================== REGISTER
export const registerUser = async (
	name: string,
	email: string,
	password: string,
) => {
	const existingUser = await User.findOne({ email });

	if (existingUser) {
		const error = new Error("User already exists");
		(error as any).statusCode = 409;
		throw error;
	}

	const hashedPassword = await hashPassword(password);

	const user = await User.create({
		name,
		email,
		password: hashedPassword,
	});

	const userId = toId(user._id);

	const token = generateToken({
		id: userId,
		role: user.role,
		tokenVersion: user.tokenVersion,
	});

	return {
		user: {
			id: userId,
			name: user.name,
			email: user.email,
			role: user.role,
			image: user.image,
		},
		token,
	};
};

// =============================== LOGIN
export const loginUser = async (email: string, password: string) => {
	const user = await User.findOne({ email });

	// =============================== CHECK USER FIRST
	if (!user) {
		const error = new Error("Invalid credentials");
		(error as any).statusCode = 401;
		throw error;
	}

	const isMatch = await comparePassword(password, user.password);

	if (!isMatch) {
		const error = new Error("Invalid credentials");
		(error as any).statusCode = 401;
		throw error;
	}

	// =============================== SAFE USER ID AFTER VALIDATION
	const userId = toId(user._id);

	const token = generateToken({
		id: userId,
		role: user.role,
		tokenVersion: user.tokenVersion,
	});

	return {
		user: {
			id: userId,
			name: user.name,
			email: user.email,
			role: user.role,
			image: user.image,
		},
		token,
	};
};

// =============================== CREATE RESET TOKEN (RESEND VERSION)
export const createResetToken = async (email: string) => {
	const user = await User.findOne({ email });

	if (!user) {
		throw new Error("User not found");
	}

	const rawToken = crypto.randomBytes(32).toString("hex");

	const hashedToken = crypto
		.createHash("sha256")
		.update(rawToken)
		.digest("hex");

	const expiresAt = new Date(Date.now() + 20 * 60 * 1000);

	await PasswordResetToken.create({
		userId: user._id,
		token: hashedToken,
		expiresAt,
	});

	const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

	console.log("📨 Sending email to:", user.email);
	console.log("🔗 Reset link:", resetLink);

	await sendEmail(
		user.email,
		"Reset your Taxlator password",
		`
	<div style="font-family:sans-serif;max-width:800px;margin:auto;">
		<table style="width:100%;margin-bottom:16px;">
			<tr>
				<td style="vertical-align:middle;width:50px;">
					<img 
						src="https://taxlatorv2.vercel.app/taxlator.png" 
						alt="Taxlator Logo"
						style="width:40px;height:auto;display:block;"
					/>
				</td>
				<td style="vertical-align:middle;">
					<h2 style="margin:0;">Password Reset</h2>
				</td>
			</tr>
		</table>

		<p>You requested a password reset.</p>

		<a href="${resetLink}" 
		   style="display:inline-block;padding:12px 20px;background:#f4ab17;color:#000aff;text-decoration:none;border-radius:6px;">
			Reset Password
		</a>

		<p style="margin-top:20px;font-size:12px;color:#000;">
			This link expires in 20 minutes.
		</p>
	</div>
	`,
	);

	return true;
};

// =============================== RESET PASSWORD
export const resetPassword = async (token: string, newPassword: string) => {
	const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

	const resetRecord = await PasswordResetToken.findOne({
		token: hashedToken,
		used: false,
		expiresAt: { $gt: new Date() },
	});

	if (!resetRecord) {
		const error = new Error("Invalid or expired token");
		(error as any).statusCode = 400;
		throw error;
	}

	const user = await User.findById(resetRecord.userId);

	if (!user) {
		const error = new Error("User not found");
		(error as any).statusCode = 404;
		throw error;
	}

	user.password = await hashPassword(newPassword);
	await user.save();

	resetRecord.used = true;
	await resetRecord.save();

	return {
		sent: true,
		message: "Password reset successful",
	};
};

// =============================== LOGOUT (TOKEN VERSION SYSTEM)
export const logoutUser = async (userId: string) => {
	await User.findByIdAndUpdate(userId, {
		$inc: { tokenVersion: 1 },
	});

	// ================= LIVE FORCE LOGOUT
	getIO().to(userId).emit("auth:force-logout");

	return {
		success: true,
		message: "Logged out successfully",
	};
};

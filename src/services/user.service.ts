// =============================== USER SERVICE
// src/routes/user.service.ts
// ===============================
import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/hash.js";

// =============================== GET PROFILE
export const getUserProfile = async (userId: string) => {
	const user = await User.findById(userId).select("-password");

	if (!user) {
		const error = new Error("User not found");
		(error as any).statusCode = 404;
		throw error;
	}

	return user;
};

// =============================== UPDATE PROFILE
export const updateUserProfile = async (
	userId: string,
	data: { name?: string; email?: string; bio?: string; image?: string },
) => {
	return User.findByIdAndUpdate(userId, data, {
		new: true,
		runValidators: true,
	}).select("-password");
};

// =============================== CHANGE PASSWORD
export const changePassword = async (
	userId: string,
	oldPassword: string,
	newPassword: string,
) => {
	const user = await User.findById(userId);

	if (!user) {
		const error = new Error("User not found");
		(error as any).statusCode = 404;
		throw error;
	}

	const isMatch = await comparePassword(oldPassword, user.password);

	if (!isMatch) {
		const error = new Error("Old password is incorrect");
		(error as any).statusCode = 401;
		throw error;
	}

	const hashed = await hashPassword(newPassword);

	user.password = hashed;
	await user.save();

	return true;
};

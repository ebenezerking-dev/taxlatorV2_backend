// =============================== USER MODEL
// src/models/User.ts
// ===============================
import mongoose, { Schema, Document } from "mongoose";

// =============================== REFRESH TOKEN TYPE
export type RefreshToken = {
	token: string;
	expiresAt: Date;
};

// =============================== USER TYPE
export interface IUser extends Document {
	name: string;
	email: string;
	password: string;
	role: "USER" | "ADMIN";
	image: string;
	tokenVersion: number;
	refreshTokens: RefreshToken[];
}

// ===============================
const userSchema = new Schema<IUser>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },

		role: {
			type: String,
			enum: ["USER", "ADMIN"],
			default: "USER",
		},

		// =============================== CLOUDINARY
		image: {
			type: String,
			default: "",
		},

		// =============================== JWT TOKEN VERSION
		tokenVersion: {
			type: Number,
			default: 0,
		},

		// =============================== REFRESH TOKENS
		refreshTokens: [
			{
				token: { type: String, required: true },
				expiresAt: { type: Date, required: true },
			},
		],
	},
	{ timestamps: true },
);

// ===============================
export default mongoose.model<IUser>("User", userSchema);

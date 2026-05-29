// =============================== USER
// src/models/User.ts

// ===============================
import mongoose from "mongoose";

// ===============================
const userSchema = new mongoose.Schema(
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

		// =============================== JWT REFRESH TOKENS
		refreshTokens: [
			{
				token: { type: String, required: true },
				expiresAt: { type: Date, required: true },
			},
		],
	},
	{ timestamps: true },
);

export default mongoose.model("User", userSchema);

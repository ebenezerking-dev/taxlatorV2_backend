// =============================== .ENV CONFIG
// ===============================
import dotenv from "dotenv";

// ===============================
dotenv.config();

// ===============================
export const env = {
	EMAIL_USER: process.env.EMAIL_USER!,
	EMAIL_PASS: process.env.EMAIL_PASS!,

	MONGO_URI: process.env.MONGO_URI!,

	JWT_SECRET: process.env.JWT_SECRET!,
	JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,

	ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS!,
	FRONTEND_URL: process.env.FRONTEND_URL!,

	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,

	ADMIN_EMAIL: process.env.ADMIN_EMAIL!,
	ADMIN_PASSWORD: process.env.ADMIN_PASSWORD!,
	ADMIN_NAME: process.env.ADMIN_NAME!,
};

// ===============================
for (const [key, value] of Object.entries(env)) {
	if (!value) {
		throw new Error(`Missing env: ${key}`);
	}
}

// ===============================
// ADMIN SEED SCRIPT
// ===============================
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";

// ===============================
dotenv.config();

// ===============================
const seedAdmin = async () => {
	if (process.env.NODE_ENV === "production") {
		console.log("Seed blocked in production");
		process.exit(1);
	}

	try {
		await mongoose.connect(process.env.MONGO_URI!);

		const existing = await User.findOne({
			email: "ebenezerking.dev@gmail.com",
		});

		if (existing) {
			console.log("Admin already exists");
			await mongoose.disconnect();
			process.exit(0);
		}

		const password = process.env.ADMIN_PASSWORD || "king./.";

		const hashedPassword = await bcrypt.hash(password, 10);

		await User.create({
			name: "Admin User",
			email: "ebenezerking.dev@gmail.com",
			password: hashedPassword,
			role: "ADMIN",
		});

		console.log("Admin created successfully");

		await mongoose.disconnect();
		process.exit(0);
	} catch (err) {
		console.error(err);
		await mongoose.disconnect();
		process.exit(1);
	}
};

seedAdmin();

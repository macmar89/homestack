import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("🌱 Starting seeding process...");

    const user = {
        username: "admin",
        displayName: "Marián",
        email: "info@mkit.sk",
        password: "SuperTajneHeslo2026",
    }

    try {
        // Check if admin already exists
        const existingAdmin = await db.query.users.findFirst({
            where: eq(users.username, user.username)
        });

        if (existingAdmin) {
            console.log("ℹ️ Superadmin already exists. Skipping creation.");
            process.exit(0);
        }

        console.log("🔐 Hashing password...");
        const hashedPassword = await bcrypt.hash(user.password, 10);

        await db.transaction(async (tx) => {
            console.log("👤 Creating superadmin user...");
            await tx.insert(users).values({
                username: user.username,
                displayName: user.displayName,
                password: hashedPassword,
                email: user.email,
                isSuperadmin: true,
                needsPasswordChange: false
            }).onConflictDoNothing();
        });

        console.log("✅ Seeding completed successfully!");
    } catch (error) {
        console.error("❌ Seeding error:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

seed();
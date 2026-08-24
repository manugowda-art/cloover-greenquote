import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, Role } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });
const DEFAULT_ADMIN = "admin12345";
const TEST_USER = "password123";

async function main() {
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN, 12);
    const userPasswordHash = await bcrypt.hash(TEST_USER, 12);

    await prisma.user.upsert({
        where: { email: "admin@test.com" },
        update: {},
        create: {
            fullName: "Admin User",
            "email": "admin@test.com",
            passwordHash,
            role: Role.ADMIN,
        },
    });

    // E2E test user
    await prisma.user.upsert({
        where: { email: "user@test.com" },
        update: {
            passwordHash: userPasswordHash,
        },
        create: {
            fullName: "Test User",
            "email": "user@test.com",
            passwordHash: userPasswordHash,
            role: Role.USER,
        },
    });
}

main()
    .catch(e => console.error(`Failed to see database with admin user, error: ${(e as Error).message}`))
    .finally(async () => {
        await prisma.$disconnect();
    });
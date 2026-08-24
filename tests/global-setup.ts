import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export default function setup() {
  const tempDir = path.resolve(process.cwd(), ".tmp");
  const dbPath = path.join(tempDir, "test.db");

  fs.mkdirSync(tempDir, { recursive: true });

  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const databaseUrl = `file:${dbPath}`;

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  });
}
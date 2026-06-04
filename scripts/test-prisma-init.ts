import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  console.log("Using DATABASE_URL:", connectionString ? connectionString.replace(/:[^:]+@/, ":****@") : "undefined");
  
  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set.");
    return;
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const userCount = await prisma.user.count();
    console.log("✅ Database query successful! User count:", userCount);
  } catch (error: any) {
    console.error("❌ Failed to query database:", error.message || String(error));
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();

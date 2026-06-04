import "dotenv/config";

// Clear local URL variables so the database client falls back to the remote DATABASE_URL
delete process.env.POSTGRES_PRISMA_URL;
delete process.env.POSTGRES_URL_NON_POOLING;

import { getDb } from "../src/lib/db";

async function main() {
  console.log("Initializing database connection from src/lib/db.ts...");
  try {
    const prisma = await getDb();
    const count = await prisma.user.count();
    console.log("✅ Success! Database connected and queried successfully. User count:", count);
  } catch (error: any) {
    console.error("❌ Failed to initialize/query database:", error.message || String(error));
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

main();

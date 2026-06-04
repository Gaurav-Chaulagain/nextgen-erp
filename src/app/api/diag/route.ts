import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

function maskConnectionString(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/:[^:]+@/, ":****@");
}

export async function GET() {
  const envInfo = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    DATABASE_URL: maskConnectionString(process.env.DATABASE_URL),
    POSTGRES_PRISMA_URL: maskConnectionString(process.env.POSTGRES_PRISMA_URL),
    POSTGRES_URL_NON_POOLING: maskConnectionString(process.env.POSTGRES_URL_NON_POOLING),
    POSTGRES_URL: maskConnectionString(process.env.POSTGRES_URL),
  };

  try {
    const db = await getDb();
    
    // Count the users in the database
    const userCount = await db.user.count();
    
    // Fetch user emails to see if they match the seeded ones
    const users = await db.user.findMany({
      select: {
        email: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      envInfo,
      databaseUrlConfigured: !!(process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL),
      userCount,
      users,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      envInfo,
      error: error.message || String(error),
      stack: error.stack,
    });
  }
}

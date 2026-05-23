import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PrismaClient } from "../generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const getGlobalPrisma = (): PrismaClient | undefined => {
  return globalThis.prismaGlobal;
};

const setGlobalPrisma = (client: PrismaClient) => {
  if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = client;
  }
};

async function createPrismaClient(): Promise<PrismaClient> {
  const { PrismaClient } = await import("../generated/prisma/client");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter });
  setGlobalPrisma(client);
  return client;
}

export async function getDb(): Promise<PrismaClient> {
  const existing = getGlobalPrisma();
  if (existing) {
    return existing;
  }
  return createPrismaClient();
}

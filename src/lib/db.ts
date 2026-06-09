import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PrismaClient } from "../generated/prisma/client";
import dns from "dns";

// Helper to resolve host to IP address using dns.promises.resolve4 (async/non-blocking)
async function resolveDbUrlHost(url: string | undefined): Promise<string | undefined> {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    // Don't resolve localhost or numeric IPs
    if (hostname === "localhost" || hostname === "127.0.0.1" || /^[0-9.]+$/.test(hostname)) {
      return url;
    }
    
    const ips = await dns.promises.resolve4(hostname).catch(() => [] as string[]);
    if (ips && ips.length > 0) {
      // Pick a random IP to load balance slightly
      const ip = ips[Math.floor(Math.random() * ips.length)];
      parsed.hostname = ip;
      return parsed.toString();
    }
  } catch (err) {
    console.warn("Failed to resolve database host to IP, using original URL:", err);
  }
  return url;
}

// Helper to dynamically append sslmode=no-verify and sslaccept=accept_invalid_certs to connection strings in production
function appendSslMode(url: string | undefined): string | undefined {
  if (!url) return url;
  if (url.includes("localhost") || url.includes("127.0.0.1")) return url;
  
  let updatedUrl = url;
  if (!updatedUrl.includes("sslmode=")) {
    const separator = updatedUrl.includes("?") ? "&" : "?";
    updatedUrl = `${updatedUrl}${separator}sslmode=no-verify`;
  }
  if (!updatedUrl.includes("sslaccept=")) {
    const separator = updatedUrl.includes("?") ? "&" : "?";
    updatedUrl = `${updatedUrl}${separator}sslaccept=accept_invalid_certs`;
  }
  return updatedUrl;
}

// Intercept and mutate environment variables in memory before Prisma loads them
if (process.env.POSTGRES_PRISMA_URL) {
  process.env.POSTGRES_PRISMA_URL = appendSslMode(process.env.POSTGRES_PRISMA_URL);
}
if (process.env.POSTGRES_URL_NON_POOLING) {
  process.env.POSTGRES_URL_NON_POOLING = appendSslMode(process.env.POSTGRES_URL_NON_POOLING);
}
if (process.env.POSTGRES_URL) {
  process.env.POSTGRES_URL = appendSslMode(process.env.POSTGRES_URL);
}
if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = appendSslMode(process.env.DATABASE_URL);
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var prismaPromiseGlobal: Promise<PrismaClient> | undefined;
}

function cleanConnectionString(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.searchParams.delete("sslmode");
    u.searchParams.delete("sslaccept");
    return u.toString();
  } catch {
    return url;
  }
}

async function createPrismaClient(): Promise<PrismaClient> {
  const { PrismaClient } = await import("../generated/prisma/client");
  let rawConnectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
  
  // Pre-resolve database hostname to an IP address asynchronously to prevent getaddrinfo EAI_AGAIN errors
  rawConnectionString = await resolveDbUrlHost(rawConnectionString);
  
  const isLocalhost = rawConnectionString?.includes("localhost") || rawConnectionString?.includes("127.0.0.1");

  const connectionString = cleanConnectionString(rawConnectionString);

  const pool = new Pool({ 
    connectionString,
    max: 5, // Limit connection pool size per instance to prevent exhausting Postgres in dev mode
    idleTimeoutMillis: 15000, // Automatically close idle connections quickly
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  
  const client = new PrismaClient({ 
    adapter,
  });
  
  if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = client;
  }
  return client;
}

export async function getDb(): Promise<PrismaClient> {
  if (globalThis.prismaGlobal) {
    return globalThis.prismaGlobal;
  }
  if (globalThis.prismaPromiseGlobal) {
    return globalThis.prismaPromiseGlobal;
  }
  
  globalThis.prismaPromiseGlobal = createPrismaClient();
  return globalThis.prismaPromiseGlobal;
}

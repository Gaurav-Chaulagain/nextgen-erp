import { Pool } from "pg";
import { parse } from "pg-connection-string";

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

async function main() {
  const vUrl = "postgres://user:pass@host:6543/db?sslmode=require&pgbouncer=true&sslaccept=accept_invalid_certs";
  const cleaned = cleanConnectionString(vUrl);
  console.log("Cleaned URL:", cleaned);
  console.log("Parsed cleaned URL options:", parse(cleaned || ""));
}

main();

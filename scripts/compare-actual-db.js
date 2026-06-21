require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const dns = require('dns');

async function resolveDbUrlHost(url) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1" || /^[0-9.]+$/.test(hostname)) {
      return url;
    }
    const ips = await dns.promises.resolve4(hostname).catch(() => []);
    if (ips && ips.length > 0) {
      parsed.hostname = ips[0];
      return parsed.toString();
    }
  } catch (err) {
    // console.warn(err);
  }
  return url;
}

function cleanConnectionString(url) {
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
  delete process.env.POSTGRES_PRISMA_URL;
  delete process.env.POSTGRES_URL_NON_POOLING;

  let rawConnectionString = process.env.DATABASE_URL;
  rawConnectionString = await resolveDbUrlHost(rawConnectionString);
  const isLocalhost = rawConnectionString?.includes("localhost") || rawConnectionString?.includes("127.0.0.1");
  const connectionString = cleanConnectionString(rawConnectionString);

  const client = new Client({
    connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
  });
  
  await client.connect();

  const backupPath = '/home/rabin/Documents/NextGenERP/NextGenERP_FullBackup_2026-06-21.json';
  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const backupData = backup.data || {};

  console.log("Analyzing live database connection vs Backup JSON counts...");

  const tables = [
    { dbTable: "users", key: "users" },
    { dbTable: "warehouses", key: "warehouses" },
    { dbTable: "categories", key: "categories" },
    { dbTable: "brands", key: "brands" },
    { dbTable: "products", key: "products" },
    { dbTable: "product_variants", key: "variants" },
    { dbTable: "suppliers", key: "suppliers" },
    { dbTable: "customers", key: "customers" },
    { dbTable: "inventory_stock", key: "stock" },
    { dbTable: "stock_transactions", key: "transactions" },
    { dbTable: "purchase_orders", key: "purchaseOrders" },
    { dbTable: "purchase_order_items", key: "poItems" },
    { dbTable: "sales_invoices", key: "salesInvoices" },
    { dbTable: "sales_invoice_items", key: "invoiceItems" },
    { dbTable: "projects", key: "projects" },
    { dbTable: "project_billings", key: "projectBillings" },
    { dbTable: "payments", key: "payments" },
    { dbTable: "ledger_entries", key: "ledgerEntries" },
    { dbTable: "cash_book_entries", key: "cashBookEntries" },
    { dbTable: "fixed_assets", key: "fixedAssets" },
    { dbTable: "depreciation_entries", key: "depreciation" },
    { dbTable: "fiscal_years", key: "fiscalYears" },
    { dbTable: "expenses", key: "expenses" }
  ];

  let allMatch = true;

  for (const t of tables) {
    try {
      const res = await client.query(`SELECT COUNT(*) FROM "${t.dbTable}"`);
      const dbCount = parseInt(res.rows[0].count, 10);
      const backupCount = Array.isArray(backupData[t.key]) ? backupData[t.key].length : 0;
      
      if (dbCount === backupCount) {
        console.log(`  ✅ ${t.dbTable}: ${dbCount} (Matches)`);
      } else {
        console.log(`  ❌ ${t.dbTable}: DB=${dbCount}, Backup=${backupCount} (MISMATCH)`);
        allMatch = false;
      }
    } catch (e) {
      console.error(`  ❌ Error querying ${t.dbTable}:`, e.message || String(e));
      allMatch = false;
    }
  }

  await client.end();

  if (allMatch) {
    console.log("\n🎉 SUCCESS: All database tables are in perfect sync with the backup file!");
  } else {
    console.log("\n⚠️ WARNING: There are mismatches between the database and the backup file.");
  }
}

main().catch(async (e) => {
  console.error(e);
});

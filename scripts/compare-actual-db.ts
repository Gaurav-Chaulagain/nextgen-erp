import "dotenv/config";
import fs from "fs";

// Clear local URL variables so the database client falls back to the remote DATABASE_URL
delete process.env.POSTGRES_PRISMA_URL;
delete process.env.POSTGRES_URL_NON_POOLING;

import { getDb } from "../src/lib/db";

async function main() {
  const db = await getDb();
  
  // Read backup
  const backupPath = '/home/rabin/Documents/NextGenERP/NextGenERP_FullBackup_2026-06-21.json';
  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const backupData = backup.data || {};

  console.log("Analyzing local database configuration vs Backup JSON...");

  const tables = [
    { name: "user", key: "users" },
    { name: "warehouse", key: "warehouses" },
    { name: "category", key: "categories" },
    { name: "brand", key: "brands" },
    { name: "product", key: "products" },
    { name: "productVariant", key: "variants" },
    { name: "supplier", key: "suppliers" },
    { name: "customer", key: "customers" },
    { name: "inventoryStock", key: "stock" },
    { name: "stockTransaction", key: "transactions" },
    { name: "purchaseOrder", key: "purchaseOrders" },
    { name: "purchaseOrderItem", key: "poItems" },
    { name: "salesInvoice", key: "salesInvoices" },
    { name: "salesInvoiceItem", key: "invoiceItems" },
    { name: "project", key: "projects" },
    { name: "projectBilling", key: "projectBillings" },
    { name: "payment", key: "payments" },
    { name: "ledgerEntry", key: "ledgerEntries" },
    { name: "cashBookEntry", key: "cashBookEntries" },
    { name: "fixedAsset", key: "fixedAssets" },
    { name: "depreciationEntry", key: "depreciation" },
    { name: "fiscalYear", key: "fiscalYears" },
    { name: "expense", key: "expenses" }
  ];

  let allMatch = true;

  for (const t of tables) {
    try {
      const dbCount = await (db as any)[t.name].count();
      const backupCount = Array.isArray(backupData[t.key]) ? backupData[t.key].length : 0;
      
      if (dbCount === backupCount) {
        console.log(`  ✅ ${t.name}: ${dbCount} (Matches)`);
      } else {
        console.log(`  ❌ ${t.name}: DB=${dbCount}, Backup=${backupCount} (MISMATCH)`);
        allMatch = false;
      }
    } catch (e: any) {
      console.error(`  ❌ Error querying ${t.name}:`, e.message || String(e));
      allMatch = false;
    }
  }

  if (allMatch) {
    console.log("\n🎉 SUCCESS: All database tables are in perfect sync with the backup file!");
  } else {
    console.log("\n⚠️ WARNING: There are mismatches between the database and the backup file.");
  }
}

main().catch(console.error);

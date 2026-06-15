const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;
  console.log("Connecting to:", connectionString ? connectionString.replace(/:[^:@]+@/, ':***@') : 'undefined');

  const client = new Client({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to DB to restore missing expenses...");

    // Find all cash book entries of type EXPENSE
    const cashEntries = await client.query("SELECT * FROM cash_book_entries WHERE reference_type = 'EXPENSE'");
    console.log(`Found ${cashEntries.rows.length} cash book entries referencing expenses.`);

    for (const entry of cashEntries.rows) {
      const expenseId = entry.reference_id;
      
      // Check if this expense exists in the expenses table
      const expCheck = await client.query("SELECT * FROM expenses WHERE id = $1", [expenseId]);
      if (expCheck.rows.length > 0) {
        console.log(`Expense ${expenseId} already exists. Skipping.`);
        continue;
      }

      console.log(`Expense ${expenseId} is missing! Reconstructing...`);

      // Try to find the CREATE audit log for this expense
      const auditRes = await client.query(
        "SELECT * FROM audit_logs WHERE module = 'EXPENSE' AND record_id = $1 AND action = 'CREATE'",
        [expenseId]
      );

      let amount = entry.amount;
      let category = 'Miscellaneous';
      let expenseCode = 'EXP-000';
      let notes = '';

      if (auditRes.rows.length > 0) {
        const auditLog = auditRes.rows[0];
        const newValues = typeof auditLog.new_values === 'string' 
          ? JSON.parse(auditLog.new_values) 
          : auditLog.new_values;

        if (newValues) {
          amount = newValues.amount || amount;
          category = newValues.category || category;
          expenseCode = newValues.expenseCode || expenseCode;
        }
        console.log(`Found audit log for expense. Code: ${expenseCode}, Category: ${category}, Amount: ${amount}`);
      } else {
        // Fallback: Parse description
        // e.g. "Operating Expense: [Transport Cost] FOR PO NUM 2 AND 3"
        const desc = entry.description || '';
        const categoryMatch = desc.match(/\[(.*?)\]/);
        if (categoryMatch) {
          category = categoryMatch[1];
          notes = desc.replace(`Operating Expense: [${category}]`, '').trim();
        } else {
          notes = desc;
        }
        
        // Generate a temporary code if none exists
        expenseCode = 'EXP-RECON';
        console.log(`No audit log found. Reconstructed from description: Category: ${category}, Notes: ${notes}`);
      }

      // Notes fallback
      if (!notes && entry.description) {
        const desc = entry.description;
        const index = desc.indexOf(']');
        if (index !== -1) {
          notes = desc.substring(index + 1).trim();
        } else {
          notes = desc;
        }
      }

      // Insert into expenses
      const insertQuery = `
        INSERT INTO expenses (
          id, expense_code, category, amount, expense_date, payment_method, notes, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;

      await client.query(insertQuery, [
        expenseId,
        expenseCode,
        category,
        amount,
        entry.entry_date,
        entry.payment_method, // PaymentMode is identical
        notes || null,
        entry.created_by,
        entry.created_at,
        new Date() // updated_at
      ]);

      console.log(`Successfully restored expense record: ${expenseCode} (ID: ${expenseId})`);
    }

  } catch (err) {
    console.error("Error restoring expenses:", err);
  } finally {
    await client.end();
  }
}

main();

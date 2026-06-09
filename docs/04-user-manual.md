# NextGen ERP User Manual & Data Entry Testing Guide

Welcome to the operations guide and manual testing runbook for **NextGen Interior And Waterproofing**, Jhapa, Nepal. This document is split into two parts:
1. **System Operations Guide**: Explanation of how the modules work and basic navigation rules.
2. **Step-by-Step Data Entry Testing Sequence**: A structured testing path with mock data to manually test the entire application end-to-end.

---

# PART 1: SYSTEM OPERATIONS GUIDE

## 1. Core Modules Overview
- **Inventory & Stocks**: Catalog management with three distinct price tiers (Retail, Wholesale, Project). Stock adjustments (Stock In/Out) record audit logs for damage/shrinkage.
- **Purchases**: Logging suppliers with PAN (9-digit). Creating Draft and Ordered Purchase Orders (POs), inwarding shipments with 13% VAT, and logging supplier cash/bank settlements.
- **Sales & Billing**: Issuing invoices for three categories:
  - **RETAIL (Blue)**: Walk-in customers using retail pricing.
  - **WHOLESALE (Green)**: Bulk accounts using wholesale pricing (requires customer PAN).
  - **PROJECT (Purple)**: Linked to an active site contract using project-specific pricing.
- **Sales Returns**: Creates credit notes that increase inventory and dynamically update the original invoice table to show original, returned, and remaining totals.
- **Projects Directory**: Tracks material dispatches to site contracts, calculating project-billed revenues, material costs, and gross margins.
- **Accounting Journals**: Automated Cash Book (Cash/Bank vault balance tracker) and customer/supplier sub-ledgers.
- **Audit Reports**: Instant Profit & Loss, Balance Sheet, Trading Account, and Fiscal Year binders.

## 2. RBAC Staff Security Levels
- **SUPERADMIN / OWNER**: Full permissions. SuperAdmin can run full database resets (`Settings -> Danger Zone`).
- **MANAGER**: Full access to all business modules but cannot delete warehouse logs or modify business PAN settings.
- **SALES_STAFF**: Restricted strictly to invoicing, payments, and site dispatches. Cannot see purchase costs or net company profits.
- **PURCHASE_STAFF**: Restricted strictly to registry cataloging, POs, and inwarding stock. Cannot see client invoices or customer balances.

---

# PART 2: END-TO-END DATA ENTRY TESTING GUIDE

Follow this sequence step-by-step with the exact sample values below to verify the mathematical and operational correctness of all modules.

```
                  ┌────────────────────────┐
                  │  PHASE 1: Master Setup  │
                  └───────────┬────────────┘
                              ▼
                  ┌────────────────────────┐
                  │   PHASE 2: Stock In    │ (Purchase Order & Receipt)
                  └───────────┬────────────┘
                              ▼
                  ┌────────────────────────┐
                  │   PHASE 3: Sales Out   │ (Credit Invoicing & Cash)
                  └───────────┬────────────┘
                              ▼
                  ┌────────────────────────┐
                  │ PHASE 4: Project works │ (Site Supplies & Margins)
                  └───────────┬────────────┘
                              ▼
                  ┌────────────────────────┐
                  │ PHASE 5: Sales Return  │ (Credit Note Adjustment)
                  └───────────┬────────────┘
                              ▼
                  ┌────────────────────────┐
                  │    PHASE 6: Auditing   │ (P&L, BS, Binder Download)
                  └────────────────────────┘
```

---

## PHASE 1: Initialize System Master Data

### Step 1.1: Create a Nepalese Fiscal Period
1. Navigate to **Settings** -> **Fiscal Periods**.
2. Enter the following details:
   - **Period Name**: `2083-84`
   - **Start Date**: `2083-04-01` (Nepali Shrawan 1)
   - **End Date**: `2084-03-31` (Nepali Ashadh 31)
3. Click **Initialize Period**.
4. Once added, locate `2083-84` in the list and click **Set Current**.

### Step 1.2: Add a Target Depot/Warehouse
1. Navigate to **Settings** -> **Warehouses**.
2. Under "Registry Add Depot" enter:
   - **Depot Name**: `Jhapa Central Depot`
   - **Physical Location**: `Gauradaha-02, Jhapa`
   - **Operational Description**: `Primary aggregates and waterproofing stock`
3. Click **Register Warehouse**.

### Step 1.3: Create Category and Brand
1. Navigate to **Inventory** -> **Categories** -> click **New Category** -> name it `Chemical Compounds`.
2. Navigate to **Inventory** -> **Brands** -> click **New Brand** -> name it `NextGen Pro`.

### Step 1.4: Register the Product in the Catalog
1. Navigate to **Inventory** -> **Products** -> click **Add Product**.
2. **Step 1: Core Details**:
   - **Product Name**: `AquaShield Waterproofing Putty`
   - **Category**: `Chemical Compounds`
   - **Brand**: `NextGen Pro`
   - **Unit**: `BAG`
3. **Step 2: Stock Limits**:
   - **Min Stock Level**: `10`
   - **Reorder Level**: `25`
4. **Step 3: Supplier Pricing Matrix**:
   - Select default supplier (e.g. leave blank or select if any exist).
   - **Purchase Price (Cost)**: `1200`
   - **Retail Price**: `1800`
   - **Wholesale Price**: `1600`
   - **Project Price**: `1500`
5. Click **Save Product**. (Observe it generates a code like `ITM-0001` with `0` stock, colored in Red).

### Step 1.5: Register the Supplier
1. Navigate to **Purchase** -> **Suppliers** -> click **New Supplier**.
2. Enter details:
   - **Supplier Name**: `Himalayan Polymers Ltd`
   - **PAN Number**: `301982839` (standard 9-digit)
   - **Opening Balance**: `0.00`
   - **Contact**: `9801234567` | `supplies@himalayan.com`
3. Click **Save Supplier** (observe code `SUP-0001` generated).

### Step 1.6: Register the Customer
1. Navigate to **Sales** -> **Customers** -> click **New Customer**.
2. Enter details:
   - **Customer Name**: `Gauradaha Builders Pvt Ltd`
   - **PAN Number**: `501928374`
   - **Customer Type**: `WHOLESALE` (automatically unlocks wholesale rates)
   - **Opening Balance**: `0.00`
   - **Credit Limit**: `500000.00`
3. Click **Save Customer** (observe code `CUST-0001` generated).

---

## PHASE 2: Purchase Order & Stock Inwarding (Stock In)

### Step 2.1: Raise a Purchase Order (PO)
1. Navigate to **Purchase** -> **Purchase Orders** -> click **New PO**.
2. Select **Himalayan Polymers Ltd**.
3. Set Expected Delivery Date to a future date.
4. Under items, select `AquaShield Waterproofing Putty` -> enter **Quantity**: `100` -> verify unit cost defaults to `1200.00`.
5. Click **Create PO** (saves as Draft).
6. Click **Submit PO** (changes status to **ORDERED**).

### Step 2.2: Receive Goods at Warehouse (Taxable Entry)
1. Open the PO you just submitted.
2. Click **Receive Shipment**.
3. Select **Jhapa Central Depot**.
4. In the receiving table, verify quantity matches `100`.
5. **CRITICAL FOR TAX MATH**: Check the **Apply 13% VAT** checkbox.
6. Click **Confirm Goods Receipt**.
   - *Result*: Stock immediately updates to **100 BAG** (color turns green).
   - *Math*: Subtotal = `100 * 1200 = 1,20,000.00`. VAT (13%) = `15,600.00`. Total Credited to Supplier Ledger = `1,35,600.00`.

### Step 2.3: Record Outbound Supplier Payment
1. Navigate to **Purchase** -> **Record Payment**.
2. Select **Himalayan Polymers Ltd**.
3. Select the received PO in the dropdown.
4. Enter **Amount**: `80000.00` -> select Method: `BANK`.
5. Enter reference details: `"Nabil Bank Transfer Ref: 20293"`
6. Click **Save Payment**.
   - *Result*: Supplier sub-ledger outstanding balance decreases from `1,35,600.00` to `55,600.00`.
   - *Cash Book*: Logs a **PAID** transaction of `80,000.00` via Bank mode.

---

## PHASE 3: Sales Invoice & Customer Collection (Stock Out)

### Step 3.1: Issue a Credit Sales Invoice
1. Navigate to **Sales** -> **Invoices** -> click **Create Invoice**.
2. Select **Invoice Type**: `WHOLESALE`.
3. Select **Customer**: `Gauradaha Builders Pvt Ltd`.
4. Add Item: Select `AquaShield Waterproofing Putty`.
   - Verify unit price automatically pulls `1600.00` (Wholesale Price).
   - Enter **Quantity**: `30`.
5. **CRITICAL FOR TAX MATH**: Check the **Apply 13% VAT** checkbox.
6. Under payment, leave **Initial Payment Amount** as `0.00` (representing a full credit sale).
7. Click **Confirm Invoice**.
   - *Result*: Stock drops from `100` to `70`.
   - *Math*: Subtotal = `30 * 1600 = 48,000.00`. VAT (13%) = `6,240.00`. Total Invoice = `54,240.00`.
   - *Ledger*: Outstanding debit of `54,240.00` registered to Customer ledger account.

### Step 3.2: Collect Partial Cash Payment
1. Navigate to **Sales** -> **Customers** -> select **Gauradaha Builders Pvt Ltd**.
2. Click **Record Payment**.
3. Enter **Amount**: `30000.00` -> select Method: `CASH`.
4. Click **Save Payment**.
   - *Result*: Customer outstanding balance decreases to `24,240.00`.
   - *Cash Book*: Logs a **RECEIVED** cash entry of `30,000.00`.

---

## PHASE 4: Construction Site Supplies (Projects Costing)

### Step 4.1: Setup active Project
1. Navigate to **Projects** -> click **New Project**.
2. Fill details:
   - **Project Name**: `Gauradaha Ward 2 Commercial Site`
   - **Client**: `Gauradaha Builders Pvt Ltd`
   - **Contract Amount**: `150000` (Revenue bound)
   - **Budget Amount**: `100000`
   - Set status to `ACTIVE`.
3. Click **Save Project**.

### Step 4.2: Issue Materials to Project Site
1. Open the project card you just created.
2. Click **Issue Supply**.
3. Select Warehouse: `Jhapa Central Depot`.
4. Select Product: `AquaShield Waterproofing Putty`.
   - Verify unit price defaults to `1500.00` (Project Price variant).
   - Enter **Quantity**: `10`.
5. Do NOT apply VAT for internal issue dispatches if not billed as a standalone invoice.
6. Click **Confirm Site Supply**.
   - *Result*: Inventory stock drops from `70` to `60`.
   - *Costing Audit*: Billed Revenue = `10 * 1500 = 15,000.00`. Material cost = `10 * 1200 = 12,000.00`. Project profit margin = `NPR 3,000.00 (20% margin)`.

---

## PHASE 5: Operational Overheads (Expense)

### Step 5.1: Log operating expense
1. Navigate to **Expenses** -> click **Add Expense**.
2. Select **Category**: `Transport Cost`.
3. Enter details:
   - **Amount**: `2500`
   - **Payment Method**: `CASH`
   - **Notes**: `"Truck hire charges for putty dispatch to Ward 2 site"`
4. Click **Save Expense**.
   - *Result*: Cash Book records a **PAID** cash transaction of `2,500.00`, reducing physical cash-in-hand vault balance.

---

## PHASE 6: Dynamic Sales Return (Credit Note)

### Step 6.1: Return items from Customer Credit Invoice
1. Navigate to **Sales** -> **Invoices** -> click on the invoice created in Step 3.1.
2. Inside the invoice details, click the red **Create Return** button.
3. Fill return details:
   - **Return Reason**: `"Defective container caps returned by client"`
   - **Refund Method**: `CREDIT` (this credits their sub-ledger directly instead of paying out cash).
   - Add items to return: `AquaShield Waterproofing Putty` -> **Return Qty**: `2`.
4. Click **Confirm Return Note**.
   - *Result*: Warehouse stock increases from `60` to `62`.
   - *Math*: Return Value = `2 * 1600 = 3,200.00`. VAT Adjustment (13%) = `416.00`. Total Credit Note = `3,616.00`.
   - *Ledger*: Outstanding customer balance decreases from `24,240.00` to `20,624.00`.
   - *Invoice Check*: Re-open the sales invoice. Observe the items table now displays a split row showing: Ordered `30` | Returned `2` | Net `28` with recalculation of the invoice subtotal, VAT, and balance dues.

---

## PHASE 7: Audit & Reports Compilation

Navigate to **Reports** and verify:
- **Profit & Loss**: Run for the current month. Revenue shows `44,800.00` (Net Sales after returns: `28 * 1600 = 44,800.00` + Project `15,000.00`). Cost of Goods Sold shows `45,600.00` (Sold: `28 * 1200 = 33,600.00` + Project: `10 * 1200 = 12,000.00`). Total Gross Profit matches `14,200.00`. Subtracting operating expense `2,500.00` = Net Operating Profit of `11,700.00`.
- **Trading Account**: Opening Stock (`0.00`) + Purchases (`1,20,000.00`) + Gross Profit (`14,200.00`) equals Credits: Sales (`59,800.00`) + Closing Stock (`62 * 1200 = 74,400.00`). (Calculates GP perfectly: `1,34,200.00 = 1,34,200.00`).
- **Outstanding Dues (Aging)**: Gauradaha Builders Pvt Ltd displays outstanding debt of `20,624.00` in the `0-30 days` column.
- **Settings Fiscal Year PDF Binder**: Go to **Settings** -> **Database Backup** -> select `2083-84` -> click **Download Fiscal Year PDF Binder**. Verify the multi-page compiled audit binder.

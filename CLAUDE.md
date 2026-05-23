# NextGen Interior & Waterproofing — ERP SaaS Build Plan
## Development Approach + Multi-Stage AI IDE Prompts

> **Business:** NextGen Interior And WaterProofing | PAN: 122782202  
> **Owner:** Nischal Timsina | Gauradaha Nagarpalika-02, Jhapa  
> **Purpose:** Construction materials distributor ERP — Wholesale, Retail, Project-based sales

---

## PART 1: DEVELOPMENT APPROACH DECISION

### Recommended Stack: Next.js 15 Full-Stack (Monorepo)

After analyzing your mockups, business documents, and constraints (deployment undecided, AI IDE usage, Nepal context), here is the final recommendation and why.

**Chosen Stack:**
```
Next.js 15 (App Router) + TypeScript
Prisma ORM + PostgreSQL (Supabase managed)
Tailwind CSS + shadcn/ui
NextAuth.js v5 (Auth + RBAC)
Zod (validation)
React PDF + xlsx (reports/exports)
Uploadthing or Supabase Storage (bill uploads)
BullMQ + Redis (background jobs)
```

**Why NOT Django + Next.js for AI IDE development:**
- AI IDEs (Cursor, Windsurf) work dramatically better within a single-language codebase
- Context switching between Python backend and JS frontend causes token waste and coherence issues
- Prisma with TypeScript gives you nearly as much power as Django ORM for your use case
- You can still apply DDD principles in Next.js server actions + service layer
- The entire app can be in one repo, one language, one mental model

**Why NOT pure No-code / low-code:**
- Your accounting requirements (double-entry, depreciation, multi-channel ledgers) need real code
- The multi-vendor pricing and project job costing logic is too complex for no-code
- You want a SaaS product — needs full control

**Architecture Pattern: Modular Monolith (feature-based folders)**
```
/src
  /app           → Next.js pages & API routes
  /modules
    /inventory   → isolated domain logic
    /sales
    /purchase
    /projects
    /accounting
    /reports
    /auth
  /lib           → shared utilities, db client, validators
  /components    → shared UI components
```

---

## PART 2: PRE-DEVELOPMENT CHECKLIST

Before pasting any prompt into your AI IDE, do this first:

1. Create a GitHub repo: `nextgen-erp`
2. Initialize with: `npx create-next-app@latest nextgen-erp --typescript --tailwind --app --src-dir`
3. Set up `.env.local` with:
   ```
   DATABASE_URL=
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME="NextGen Interior And WaterProofing"
   NEXT_PUBLIC_PAN="122782202"
   NEXT_PUBLIC_PHONE="9843146474"
   NEXT_PUBLIC_ADDRESS="Gauradaha Nagarpalika-02, Jhapa"
   ```
4. Create Supabase project (free tier) for PostgreSQL
5. Install base deps:
   ```bash
   npm install prisma @prisma/client next-auth@beta zod
   npm install @tanstack/react-table react-hook-form
   npm install @react-pdf/renderer xlsx
   npm install lucide-react class-variance-authority clsx
   npx shadcn@latest init
   ```

---

## PART 3: MULTI-STAGE AI IDE PROMPTS

Each prompt below is self-contained. Paste them **in order**, one at a time, into your AI IDE (Cursor / Windsurf / Claude Code). Wait for each stage to complete and review before moving to the next.

---

### ═══ STAGE 1: DATABASE SCHEMA & PRISMA MODELS ═══

```
You are a Senior Full-Stack TypeScript Engineer building a production-grade ERP SaaS 
for a Nepali construction materials distributor business.

BUSINESS CONTEXT:
- Business: NextGen Interior And WaterProofing
- PAN: 122782202 | Owner: Nischal Timsina
- Address: Gauradaha Nagarpalika-02, Jhapa, Nepal
- Currency: NPR (Nepali Rupee)
- Sales channels: Retail, Wholesale, Project-based
- Products: Cement, PVC pipes, Electrical wire, Paint, Steel, Tiles, Waterproofing materials

TECH STACK:
- Next.js 15 App Router + TypeScript
- Prisma ORM + PostgreSQL
- shadcn/ui + Tailwind CSS

TASK: Create the complete Prisma schema for this ERP. The schema MUST include every 
model listed below. Do not simplify or skip any field.

REQUIRED MODELS (with all fields, relations, indexes):

1. User — id, name, email, passwordHash, role (SUPERADMIN|OWNER|MANAGER|SALES_STAFF|
   PURCHASE_STAFF|VIEWER), isActive, lastLogin, createdAt, updatedAt

2. Category — id, name, description, isActive, createdAt

3. Brand — id, name, description, isActive, createdAt

4. Product — id, code (unique, auto-gen: ITM-XXX), name, categoryId, brandId, 
   unit (BAG|PCS|METER|KG|LITRE|SQ_FT|ROLL|BOX), description, minStockLevel, 
   reorderLevel, isActive, images (String[]), createdAt, updatedAt
   Relations: category, brand, variants, stockEntries, stockTransactions

5. ProductVariant — id, productId, supplierId, purchasePrice, retailPrice, 
   wholesalePrice, projectPrice, effectiveDate, isActive, createdAt
   (REASON: same product can come from multiple vendors at different prices)

6. Supplier — id, code, name, contactPerson, phone, email, address, panNumber, 
   openingBalance, notes, isActive, createdAt, updatedAt

7. Customer — id, code, name, contactPerson, phone, email, address, panNumber, 
   customerType (RETAIL|WHOLESALE|PROJECT), creditLimit, openingBalance, 
   notes, isActive, createdAt, updatedAt

8. Warehouse — id, name, location, description, isActive, createdAt

9. InventoryStock — id, productId, warehouseId, quantity, reservedQty, 
   lastUpdated
   (Unique constraint on productId + warehouseId)

10. StockTransaction — id, type (PURCHASE_IN|SALE_OUT|PROJECT_ISSUE|
    ADJUSTMENT_IN|ADJUSTMENT_OUT|TRANSFER|RETURN_IN|RETURN_OUT), 
    productId, warehouseId, quantity, unitCost, referenceType, referenceId, 
    notes, userId, createdAt
    (IMMUTABLE — never updated after creation)

11. PurchaseOrder — id, poNumber (unique, auto: PO-XXXX), supplierId, 
    orderDate, expectedDate, status (DRAFT|ORDERED|PARTIAL|RECEIVED|CANCELLED), 
    subtotal, discountAmount, taxAmount, totalAmount, paidAmount, 
    notes, billImageUrl, createdBy, createdAt, updatedAt
    Relations: items, payments, stockTransactions

12. PurchaseOrderItem — id, purchaseOrderId, productId, orderedQty, 
    receivedQty, unitPrice, totalPrice, notes

13. SalesInvoice — id, invoiceNumber (unique, auto: INV-XXXX), 
    customerId, invoiceType (RETAIL|WHOLESALE|PROJECT), 
    projectId (optional), invoiceDate, dueDate, 
    status (DRAFT|SENT|PARTIAL|PAID|OVERDUE|CANCELLED),
    subtotal, discountPercent, discountAmount, vatPercent, vatAmount, 
    totalAmount, paidAmount, balanceAmount, 
    paymentMethod (CASH|BANK_TRANSFER|CREDIT|CHEQUE|ESEWA|KHALTI),
    notes, createdBy, createdAt, updatedAt

14. SalesInvoiceItem — id, invoiceId, productId, qty, unitPrice, 
    discountPercent, totalPrice, warehouseId, notes

15. Project — id, projectCode (unique, auto: PRJ-XXX), name, clientId 
    (→ Customer), description, startDate, endDate, 
    status (PLANNING|ACTIVE|ON_HOLD|COMPLETED|CANCELLED), 
    budgetAmount, contractAmount, notes, createdBy, createdAt, updatedAt

16. ProjectBilling — id, projectId, invoiceId, billingDate, amount, notes

17. Payment — id, referenceType (INVOICE|PURCHASE), referenceId, 
    partyType (CUSTOMER|SUPPLIER), partyId, amount, 
    paymentMethod (CASH|BANK|CHEQUE|ESEWA|KHALTI), 
    paymentDate, notes, createdBy, createdAt

18. LedgerEntry — id, entryDate, partyType (CUSTOMER|SUPPLIER), partyId, 
    entryType (DEBIT|CREDIT), amount, referenceType, referenceId, 
    description, runningBalance, channelType (RETAIL|WHOLESALE|PROJECT|GENERAL), 
    createdBy, createdAt
    (IMMUTABLE — never updated. Corrections via reversal entries only)

19. CashBookEntry — id, entryDate, type (RECEIVED|PAID), amount, 
    description, partyType, partyId, referenceType, referenceId, 
    paymentMethod, createdBy, createdAt

20. FixedAsset — id, name, category, purchaseDate, purchasePrice, 
    usefulLifeYears, depreciationMethod (STRAIGHT_LINE|DECLINING_BALANCE), 
    currentValue, isActive, createdAt, updatedAt

21. DepreciationEntry — id, assetId, fiscalYear, month, amount, 
    bookValueBefore, bookValueAfter, createdAt

22. FiscalYear — id, name (e.g. "2081-82"), startDate, endDate, 
    isCurrent, isClosed, createdAt

23. AuditLog — id, userId, action, module, recordId, oldValues (Json), 
    newValues (Json), ipAddress, createdAt

OUTPUT:
- Complete schema.prisma file with all models, all fields, all relations, all indexes
- Enums defined at top
- Every model has @@map for clean table names
- Include composite indexes for performance (e.g. invoices by customer+date, 
  stock by product+warehouse)
- Add @@index on all foreign keys
- Comments on non-obvious fields

RULES:
- All financial amounts stored as Decimal (not Float — to avoid precision errors)
- All timestamps in UTC
- Soft deletes via isActive (not hard delete) on master data
- Use cuid() for IDs
- Do not skip any model — all 23 are required
```

---

### ═══ STAGE 2: PROJECT STRUCTURE & BASE SETUP ═══

```
You are continuing work on the NextGen Interior And WaterProofing ERP SaaS.

PREVIOUS WORK: Prisma schema is complete (all 23 models defined).

TECH STACK:
- Next.js 15 App Router + TypeScript
- Prisma + PostgreSQL
- NextAuth.js v5
- Tailwind CSS + shadcn/ui
- Zod for validation

TASK: Set up the complete project foundation. Create all of these:

1. FOLDER STRUCTURE
   Create this exact folder layout (create placeholder index.ts files where needed):
   ```
   src/
     app/
       (auth)/login/page.tsx
       (dashboard)/layout.tsx
       (dashboard)/dashboard/page.tsx
       (dashboard)/inventory/page.tsx
       (dashboard)/purchase/page.tsx
       (dashboard)/sales/page.tsx
       (dashboard)/projects/page.tsx
       (dashboard)/ledger/page.tsx
       (dashboard)/cashbook/page.tsx
       (dashboard)/reports/page.tsx
       (dashboard)/users/page.tsx
       api/auth/[...nextauth]/route.ts
     modules/
       inventory/
         actions.ts    (server actions)
         queries.ts    (db queries)
         types.ts      (zod schemas + TS types)
         utils.ts
       sales/
         actions.ts
         queries.ts
         types.ts
       purchase/
         actions.ts
         queries.ts
         types.ts
       projects/
         actions.ts
         queries.ts
         types.ts
       accounting/
         ledger.ts
         cashbook.ts
         depreciation.ts
         reports.ts
       auth/
         session.ts
         permissions.ts
     lib/
       db.ts           (Prisma client singleton)
       utils.ts        (formatNPR, formatDate, generateCode helpers)
       constants.ts    (VAT rates, pagination defaults, etc.)
     components/
       layout/
         Sidebar.tsx
         Header.tsx
         PageHeader.tsx
       ui/              (shadcn components go here)
       shared/
         DataTable.tsx
         StatusBadge.tsx
         NPRAmount.tsx
         ConfirmDialog.tsx
         LoadingSpinner.tsx
   ```

2. LIB/DB.TS — Prisma singleton client (production-safe, handles hot reload)

3. LIB/UTILS.TS — Create these utility functions:
   - formatNPR(amount: Decimal | number): string  → "NPR 1,42,500"
   - formatNepaliNumber(n: number): string         → comma formatting for NPR (2,2,3 format)
   - generateInvoiceNumber(prefix, lastNumber): string
   - generatePONumber(lastNumber): string
   - cn(...classes): string  (tailwind class merge)
   - formatDate(date: Date): string  → "May 7, 2026"
   - getFinancialYear(): { start: Date; end: Date; label: string }
     (Nepal fiscal year: Shrawan to Ashadh, i.e. mid-July to mid-July)

4. LIB/CONSTANTS.TS:
   - VAT_RATE = 0.13 (Nepal standard)
   - CURRENCY = "NPR"
   - PAGINATION_SIZE = 20
   - INVOICE_COLORS = { RETAIL: "#2563eb", WHOLESALE: "#16a34a", PROJECT: "#9333ea" }
   - ROLES hierarchy and their permissions map

5. AUTH/PERMISSIONS.TS — Permission system:
   Define a PERMISSIONS object mapping each role to allowed modules + actions:
   ```typescript
   type Action = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve'
   type Module = 'dashboard' | 'inventory' | 'purchase' | 'sales' | 'projects' | 
                 'ledger' | 'cashbook' | 'reports' | 'users'
   
   // SUPERADMIN and OWNER: all modules, all actions
   // MANAGER: all modules, all actions except user management
   // SALES_STAFF: sales, cashbook (full), inventory + ledger (view only), reports (sales only)
   // PURCHASE_STAFF: purchase, inventory (full), ledger (view), reports (purchase only)
   // VIEWER: all modules, view only
   ```
   Export: hasPermission(role, module, action): boolean

6. NEXTAUTH SETUP (app/api/auth/[...nextauth]/route.ts):
   - Credentials provider (email + password)
   - Use bcryptjs for password hashing
   - JWT strategy
   - Session includes: id, name, email, role
   - Callbacks: jwt (add role to token), session (add role to session)
   - Custom login page at /login

7. MIDDLEWARE (middleware.ts at root):
   - Protect all routes under /(dashboard) — redirect to /login if unauthenticated
   - Public routes: /login only
   - After auth check, pass role in header for server components

8. DASHBOARD LAYOUT (app/(dashboard)/layout.tsx):
   - Server component that checks session
   - Renders Sidebar + Header + children
   - Pass user info to client components via props

9. SIDEBAR COMPONENT (components/layout/Sidebar.tsx):
   - Client component
   - Navigation items matching BizManager mockup exactly:
     Dashboard, Inventory, Purchase, Sales, Projects, Ledger, Cash Book, Reports, Users, Settings
   - Each item has icon (lucide-react) + label
   - Active state highlighting
   - Collapse/expand on mobile
   - Show/hide nav items based on user role using hasPermission()
   - At bottom: user name, role badge, logout button

10. HEADER COMPONENT (components/layout/Header.tsx):
    - Current date (Nepal format)
    - "NPR" currency indicator
    - Notification bell (low stock + pending payments count)
    - User avatar + dropdown (profile, logout)

11. SHARED DATA TABLE (components/shared/DataTable.tsx):
    - Built on @tanstack/react-table
    - Props: columns, data, isLoading, pagination, onPageChange
    - Built-in: search, sort, pagination controls
    - Export button (triggers parent callback)
    - Skeleton loading state

OUTPUT: All files above with complete, working code. No TODOs, no placeholders.
Use TypeScript strict mode throughout. Every component properly typed.
```

---

### ═══ STAGE 3: INVENTORY MODULE ═══

```
You are continuing the NextGen ERP. Foundation + auth are complete.

TASK: Build the complete Inventory module. This is the most critical module — 
construction materials with multi-vendor pricing.

BUSINESS RULES:
- Same product (e.g. "OPC Cement 43") can come from multiple vendors at different prices
- Each product has retail price, wholesale price, and project price
- Stock tracked per warehouse location
- Low stock alert when stock <= reorderLevel
- High stock alert when stock > (reorderLevel * 5) — configurable
- Stock is NEVER directly edited — only changed via transactions
- All stock movements create immutable StockTransaction records

BUILD THESE FILES:

1. modules/inventory/types.ts
   Zod schemas for:
   - CreateProductSchema (all validations)
   - UpdateProductSchema
   - CreateVariantSchema (for vendor pricing)
   - AdjustStockSchema (with reason)
   - CreateCategorySchema, CreateBrandSchema

2. modules/inventory/queries.ts
   Functions (all use Prisma, all typed):
   - getProducts(filters: { search?, categoryId?, brandId?, status?, lowStock?, page? })
     → paginated, includes stock totals across warehouses
   - getProductById(id: string) → full product with variants, stock, recent transactions
   - getCategories() → all active categories
   - getBrands() → all active brands
   - getInventoryStats() → { totalItems, totalValue, lowStockCount, categories }
   - getLowStockItems() → products where stock <= reorderLevel
   - getStockTransactionHistory(productId, { dateFrom?, dateTo?, type? })
   - getStockByWarehouse(warehouseId)

3. modules/inventory/actions.ts
   Server actions (use 'use server', validate with Zod, wrap in try/catch):
   - createProduct(data) → creates product, creates initial zero stock per warehouse
   - updateProduct(id, data)
   - createProductVariant(data) → add vendor pricing for a product
   - updateProductVariant(id, data)
   - adjustStock(data) → creates ADJUSTMENT_IN or ADJUSTMENT_OUT StockTransaction, 
     updates InventoryStock, logs to AuditLog
   - createCategory(data), updateCategory(id, data)
   - createBrand(data), updateBrand(id, data)
   All actions must: validate input, check auth, update stock atomically (Prisma $transaction), 
   create audit log entry

4. app/(dashboard)/inventory/page.tsx
   Main inventory page (Server Component):
   - Fetch stats + products server-side
   - Render InventoryStats cards + InventoryTable

5. components/inventory/InventoryStats.tsx
   4 stat cards matching mockup:
   - Total Items (count)
   - Total Value (NPR at cost price)
   - Low Stock (count, red if > 0)
   - Categories (count)

6. components/inventory/InventoryTable.tsx (Client Component)
   Columns: Item Code | Item Name | Category | Brand | Unit | In Stock | 
            Cost Price | Sell Price | Status | Actions
   Features:
   - Search by name/code
   - Filter by category, brand, status (All/Active/Low Stock/Out of Stock)
   - Color-coded status: Active (green), Low Stock (amber), Out of Stock (red)
   - Actions: View, Edit, Adjust Stock, View History
   - Pagination (20 per page)
   - Export to Excel button

7. components/inventory/AddProductModal.tsx (Client Component)
   Multi-step form:
   Step 1 — Basic Info: code (auto-gen, editable), name, category, brand, unit, 
            min stock, reorder level, description
   Step 2 — Vendor Pricing: add multiple vendor price rows 
            (vendor | purchase price | retail price | wholesale price | project price)
   Step 3 — Initial Stock: set opening stock per warehouse
   Uses react-hook-form + Zod. Calls createProduct server action.
   Show success toast on completion.

8. components/inventory/AdjustStockModal.tsx
   - Select product (search dropdown)
   - Select warehouse
   - Type: Stock In / Stock Out
   - Quantity + reason (required)
   - Shows current stock before adjustment
   - Preview: "New stock will be: X units"

9. components/inventory/StockHistoryModal.tsx
   - Transaction history table for a product
   - Columns: Date | Type | Qty Change | Reference | Warehouse | User | Notes
   - Color-code types (green for IN, red for OUT)
   - Date range filter

10. components/inventory/LowStockAlert.tsx
    - Used in Dashboard and Inventory page
    - Lists items below reorder level
    - Shows: Item | Current Stock | Reorder At | Last Supplier | Quick Reorder button

RULES:
- Use Prisma transactions for ALL stock operations (atomic)
- Never allow negative stock without explicit override permission (MANAGER+)
- All prices as Decimal, display with formatNPR()
- Debounce search inputs (300ms)
- Optimistic updates where appropriate
- Proper error messages (field-level from Zod, system-level in toast)
```

---

### ═══ STAGE 4: PURCHASE MODULE ═══

```
Continuing NextGen ERP. Inventory module is complete.

TASK: Build the complete Purchase module.

FLOW: New PO → Add Items → Submit → Receive Goods → Stock Updated → Bill Uploaded → Payment

BUSINESS RULES:
- One PO can be partially received (multiple goods receipts)
- When goods received: StockTransaction (PURCHASE_IN) + InventoryStock update (atomic)
- Bill upload (PDF/image) stored, linked to PO
- Partial payments tracked; pending = total - paid
- Vendor ledger auto-updated on purchase and payment
- PO status: DRAFT → ORDERED → PARTIAL (partly received) → RECEIVED → CANCELLED

BUILD THESE FILES:

1. modules/purchase/types.ts
   Zod schemas:
   - CreatePurchaseOrderSchema
   - AddPOItemSchema
   - ReceiveGoodsSchema (items with qty received)
   - RecordPurchasePaymentSchema
   - CreateSupplierSchema, UpdateSupplierSchema

2. modules/purchase/queries.ts
   - getPurchaseOrders(filters: { status?, supplierId?, dateFrom?, dateTo?, page? })
   - getPOById(id) → full PO with items, receipts, payments, supplier
   - getPurchaseStats() → { thisMonthTotal, pendingPayments, activeVendors }
   - getSuppliers(search?) → paginated
   - getSupplierById(id) → with full ledger
   - getPendingPayments() → POs with outstanding balance
   - getVendorLedger(supplierId, dateFrom?, dateTo?) → all transactions

3. modules/purchase/actions.ts
   Server actions:
   - createPurchaseOrder(data) → PO + items, status DRAFT
   - updatePurchaseOrder(id, data) → only if DRAFT
   - submitPurchaseOrder(id) → DRAFT → ORDERED
   - receiveGoods(poId, items) → 
       For each item: create StockTransaction(PURCHASE_IN), update InventoryStock
       Update PO received qtys, change status PARTIAL/RECEIVED
       Create LedgerEntry (CREDIT to supplier)
       All in one Prisma $transaction
   - recordPurchasePayment(data) →
       Create Payment record
       Create CashBookEntry (PAID)
       Create LedgerEntry (DEBIT to supplier)
       Update PO paidAmount
       All atomic
   - uploadBill(poId, fileUrl) → update PO billImageUrl
   - createSupplier(data), updateSupplier(id, data)
   - cancelPurchaseOrder(id) → only DRAFT/ORDERED

4. app/(dashboard)/purchase/page.tsx
   Server component — fetch stats + orders

5. components/purchase/PurchaseStats.tsx
   3 stat cards: This Month Purchases | Pending Payments | Active Vendors

6. components/purchase/PurchaseOrderTable.tsx
   Columns: PO# | Vendor | Order Date | Expected | Total | Paid | Balance | Status | Actions
   Status colors: DRAFT(gray) | ORDERED(blue) | PARTIAL(amber) | RECEIVED(green) | CANCELLED(red)
   Actions: View | Receive | Pay | Upload Bill | Cancel
   Filter by: status, vendor, date range

7. components/purchase/NewPurchaseOrderForm.tsx
   Form fields: Vendor (searchable dropdown), PO Date, Expected Delivery, 
                Payment Terms, Notes
   Dynamic line items: [Product search | Qty | Unit | Unit Price | Total]
   Add/remove line items
   Auto-calculate: subtotal, discount (optional), tax (optional), total
   Buttons: Save Draft / Submit Order

8. components/purchase/ReceiveGoodsModal.tsx
   Shows PO items with: Item | Ordered | Previously Received | Now Receiving (input) | Unit
   Validates: now receiving ≤ (ordered - previously received)
   Shows stock impact preview per item
   On submit: calls receiveGoods action

9. components/purchase/RecordPaymentModal.tsx
   Fields: Amount, Payment Method, Date, Reference/Cheque No, Notes
   Shows: Total | Previously Paid | Balance Due
   Validates: amount ≤ balance

10. components/purchase/SupplierLedgerModal.tsx
    Party: Supplier name, PAN, phone
    Ledger table: Date | Description | Debit | Credit | Balance
    Date filter, running balance
    Download as PDF / Excel buttons (trigger download actions)

11. components/purchase/BillUploadModal.tsx
    Drag & drop or click to upload (PDF or image)
    Preview uploaded bill
    Save to storage, update PO

IMPORTANT ACCOUNTING LOGIC (in actions.ts):
When goods are received from vendor:
  → LedgerEntry: { partyType: SUPPLIER, partyId: vendorId, type: CREDIT, amount: totalValue }
When payment is made to vendor:
  → LedgerEntry: { partyType: SUPPLIER, partyId: vendorId, type: DEBIT, amount: paidAmount }
Running balance = sum(CREDIT) - sum(DEBIT) for vendor = amount still owed
```

---

### ═══ STAGE 5: SALES MODULE + INVOICE SYSTEM ═══

```
Continuing NextGen ERP. Purchase module complete.

TASK: Build the complete Sales module with multi-channel invoicing.

CRITICAL BUSINESS RULE — THREE SALES CHANNELS:
1. RETAIL   → Uses retail price. Invoice background: Blue (#2563eb header). 
              For walk-in customers buying materials.
2. WHOLESALE → Uses wholesale price. Invoice background: Green (#16a34a header).
              For resellers buying in bulk.
3. PROJECT  → Uses project price. Invoice background: Purple (#9333ea header).
              Linked to a specific project. Materials issued to project site.

Each channel has its OWN ledger (channelType field in LedgerEntry).
Reports can be filtered per channel.

BUSINESS RULES:
- Invoice auto-numbers: INV-0001, INV-0002... (year-based reset optional)
- Stock deducted IMMEDIATELY on invoice creation (not on payment)
- Partial payments create ledger entries
- Credit sales tracked in Outstanding Dues
- Returns: create RETURN_IN stock transaction + reversal ledger entry
- VAT: Nepal 13% (configurable, can be 0% on some items)

BUILD THESE FILES:

1. modules/sales/types.ts
   Zod schemas:
   - CreateInvoiceSchema (with items array, channel type, project link)
   - CreateInvoiceItemSchema
   - RecordSalePaymentSchema
   - CreateReturnSchema
   - CreateCustomerSchema, UpdateCustomerSchema
   - QuickSaleSchema (simplified POS-style)

2. modules/sales/queries.ts
   - getSalesInvoices(filters: { channel?, customerId?, status?, dateFrom?, dateTo?, page? })
   - getInvoiceById(id) → full invoice with items, payments, customer
   - getSalesStats(dateRange) → { todaySales, monthlyRevenue, outstanding, returns }
   - getCustomers(search?, type?) → paginated
   - getCustomerById(id) → with ledger summary
   - getOutstandingDues() → customers with balance > 0
   - getRevenueByChannel(month, year) → { retail, wholesale, project } totals
   - getCustomerLedger(customerId, dateFrom?, dateTo?)

3. modules/sales/actions.ts
   Server actions:
   - createInvoice(data) →
       Validate all items in stock (throw if insufficient)
       Create SalesInvoice + SalesInvoiceItems
       For each item: StockTransaction(SALE_OUT) + update InventoryStock
       Create LedgerEntry(DEBIT to customer, channelType = invoice type)
       If payment provided: create Payment + CashBookEntry + LedgerEntry(CREDIT)
       All in ONE Prisma $transaction
   - recordSalePayment(data) →
       Create Payment, CashBookEntry, LedgerEntry(CREDIT to customer)
       Update invoice paidAmount, balanceAmount, status
   - createSalesReturn(invoiceId, items, reason) →
       Create return record
       For each returned item: StockTransaction(RETURN_IN) + InventoryStock++
       Create reversal LedgerEntry
   - createCustomer(data), updateCustomer(id, data)
   - cancelInvoice(id) → only DRAFT status, reverse stock

4. app/(dashboard)/sales/page.tsx
   Server component with tabs: Invoices | Customers | Outstanding | Returns

5. components/sales/SalesStats.tsx
   4 cards: Today's Sales | Monthly Revenue (+% vs last month) | Outstanding Credit | Returns

6. components/sales/InvoiceTable.tsx
   Columns: Invoice# | Customer | Channel Badge | Date | Items | Amount | Paid | Balance | Status
   Channel badges: RETAIL(blue) | WHOLESALE(green) | PROJECT(purple)
   Filter: channel, status, customer, date range
   Actions: View/Print | Record Payment | Create Return

7. components/sales/CreateInvoiceForm.tsx (MOST COMPLEX COMPONENT)
   Step 1 — Invoice Setup:
   - Invoice type selector (RETAIL / WHOLESALE / PROJECT) — visual toggle with colors
   - If PROJECT: project selector dropdown (active projects only)
   - Customer selector (searchable, show type, balance)
   - Invoice date, due date, payment method
   
   Step 2 — Add Items:
   - Product search (by name or code)
   - When product selected: auto-fill price based on invoice type
     (RETAIL → retailPrice, WHOLESALE → wholesalePrice, PROJECT → projectPrice)
   - Qty input with real-time stock validation (show available stock)
   - Discount per line (%)
   - Can override price (if MANAGER+ permission)
   - Running line total
   
   Step 3 — Totals & Payment:
   - Subtotal, Discount, VAT toggle (yes/no, auto-calculate at 13%), Total
   - Payment received now: amount, method
   - Balance (credit) = Total - Payment
   - Notes field
   
   Live preview panel on the right showing invoice as it's built.
   Calls createInvoice action on submit.

8. components/sales/InvoicePreviewModal.tsx
   Shows formatted invoice matching mockup with:
   - Header color based on channel type (blue/green/purple)
   - Firm details: NextGen Interior And WaterProofing, PAN: 122782202, Phone: 9843146474
   - Bill To: customer details
   - Items table
   - Totals with VAT
   - Footer: payment method, thank you message
   Buttons: Print | Download PDF | Send Email (placeholder)

9. components/sales/RecordPaymentModal.tsx
   Shows invoice summary (total, paid, balance)
   Payment amount (validate ≤ balance), method, date, notes

10. components/sales/CustomerLedgerModal.tsx
    Full transaction history from account opening
    Filter by channel (ALL | RETAIL | WHOLESALE | PROJECT)
    Columns: Date | Description | Channel | Debit | Credit | Running Balance
    Export: PDF + Excel

11. components/sales/OutstandingDuesTable.tsx
    Customers with unpaid balances
    Columns: Customer | Type | Total Billed | Total Paid | Balance | Last Invoice | Days Overdue
    Sort by: balance (desc), days overdue
    Quick action: Record Payment, View Ledger

INVOICE PDF GENERATION (lib/invoice-pdf.tsx):
Using @react-pdf/renderer, create InvoicePDF component:
- Dynamic header color based on invoiceType
- Firm letterhead with name, PAN, address, phone
- Customer details
- Items table with borders
- Totals section
- Footer with payment info
Export: generateInvoicePDF(invoice) → Blob for download
```

---

### ═══ STAGE 6: PROJECTS MODULE ═══

```
Continuing NextGen ERP. Sales module complete.

TASK: Build the Projects module for project-based construction work tracking.

BUSINESS CONTEXT:
Projects are construction contracts (road construction, hotel renovation, 
warehouse plumbing, office electrical, etc.). Materials are issued FROM inventory 
TO the project site. This creates a PROJECT type sale invoice. 
Job costing = materials cost vs contract price = project profit.

BUSINESS RULES:
- Project has a budget/contract amount agreed with client
- Materials issued to project: deduct from inventory, create project billing invoice
- Project billing links to SalesInvoice (type=PROJECT)
- Track: total billed vs total material cost vs contract = margin %
- Project status flow: PLANNING → ACTIVE → ON_HOLD → COMPLETED
- Multiple billing events per project (phased billing)

BUILD THESE FILES:

1. modules/projects/types.ts
   Zod schemas: CreateProjectSchema, UpdateProjectSchema, IssueSupplySchema

2. modules/projects/queries.ts
   - getProjects(filters: { status?, clientId?, page? })
   - getProjectById(id) → with client, billings, material usage, profit summary
   - getProjectStats() → { activeCount, totalRevenue, totalCost, totalProfit, avgMargin% }
   - getProjectProfitability(projectId) → detailed breakdown
   - getMaterialUsage(projectId) → items issued to project with quantities and costs
   - getProjectBillings(projectId) → all invoices raised for project

3. modules/projects/actions.ts
   Server actions:
   - createProject(data) → create project linked to customer
   - updateProject(id, data)
   - issueSupplyToProject(projectId, items) →
       Create SalesInvoice(type=PROJECT, projectId=projectId)
       Create SalesInvoiceItems
       For each item: StockTransaction(PROJECT_ISSUE) + InventoryStock--
       Create ProjectBilling record linking project to invoice
       Create LedgerEntry (channelType=PROJECT)
       All atomic
   - updateProjectStatus(id, status)
   - closeProject(id) → status=COMPLETED, finalize P&L

4. app/(dashboard)/projects/page.tsx
   Server component, tabs: Active Projects | All Projects | Project P&L

5. components/projects/ProjectStats.tsx
   4 cards: Active Projects | Total Project Revenue | Total Project Cost | Total Profit (Margin%)

6. components/projects/ProjectsTable.tsx
   Columns: Project# | Name | Client | Start | Deadline | Budget | Cost | Profit | Margin% | Status
   Margin% color: green if >20%, amber if 10-20%, red if <10%
   Actions: View Details | Issue Supply | Edit | Change Status

7. components/projects/CreateProjectModal.tsx
   Fields: Project name, Client (dropdown, or create new), Description,
           Start date, End date, Contract/Budget amount, Notes
   On create: generates PRJ-XXX code

8. components/projects/ProjectDetailPage.tsx (app/(dashboard)/projects/[id]/page.tsx)
   Full project view:
   Section 1 — Project Header: name, client, dates, status, contract amount
   Section 2 — Financial Summary:
     - Contract Amount vs Total Billed vs Balance to Bill
     - Total Material Cost vs Gross Profit vs Margin %
     - Progress bar: billed/contract
   Section 3 — Billing History table: Date | Invoice# | Items | Amount | Status
   Section 4 — Material Usage table: Item | Unit | Qty Used | Unit Cost | Total Cost
   Section 5 — Timeline/Notes

9. components/projects/IssueSupplyModal.tsx
   Like CreateInvoice but pre-selected:
   - Project: locked (pre-selected)
   - Channel: PROJECT (locked)
   - Customer: pre-filled from project client
   - Items: search + qty + auto-fill project price
   - Shows running project cost impact

10. components/projects/ProjectProfitabilityReport.tsx
    Table of all projects with:
    Contract | Billed | Material Cost | Labor (manual entry) | Gross Profit | Net Margin
    Downloadable as PDF/Excel
```

---

### ═══ STAGE 7: ACCOUNTING — LEDGER, CASHBOOK, DEPRECIATION ═══

```
Continuing NextGen ERP. Projects module complete.

TASK: Build the complete Accounting module (Ledger + Cash Book + Fixed Assets + Depreciation).

ACCOUNTING PRINCIPLES:
- Double-entry: every transaction has equal debit and credit
- Ledger entries are IMMUTABLE (never update, only reverse)
- Cash book: daily cash receipts and payments
- Fixed assets depreciate monthly (straight-line or declining balance)
- Nepal fiscal year: Shrawan to Ashadh (mid-July to mid-July)

BUILD THESE FILES:

1. modules/accounting/ledger.ts
   Functions:
   - createLedgerEntry(data) → immutable, calculates running balance
   - reverseLedgerEntry(originalId, reason, userId) → creates mirror entry
   - getPartyLedger(partyType, partyId, filters) → paginated entries + opening balance
   - getLedgerSummary() → { totalReceivable, totalPayable, netPosition }
   - getChannelLedger(channel, dateFrom, dateTo) → RETAIL | WHOLESALE | PROJECT
   - getTrialBalance(asOf: Date) → all accounts with debit/credit totals

2. modules/accounting/cashbook.ts
   Functions:
   - getCashBookEntries(dateFrom, dateTo) → with running balance
   - getCashBookSummary(date) → { opening, received, paid, closing }
   - addCashEntry(data) → creates CashBookEntry + LedgerEntry
   - getDailyCashFlow(month, year) → daily totals for chart

3. modules/accounting/depreciation.ts
   Functions:
   - calculateMonthlyDepreciation(assetId) → amount for current month
   - runMonthlyDepreciationForAll() → process all active assets, create DepreciationEntry records
   - getDepreciationSchedule(assetId) → full schedule from purchase to fully depreciated
   - getAssetRegister() → all assets with current book value

4. app/(dashboard)/ledger/page.tsx
   Tabs: All Parties | Customers | Vendors
   
5. components/accounting/LedgerPage.tsx
   Party summary table (reuse from existing data):
   Columns: Party Name | Type | Channel | Total Debit | Total Credit | Balance | Last Trans | Status
   Filter: type (customer/vendor), channel, balance status
   Click row → open LedgerDetailModal

6. components/accounting/LedgerDetailModal.tsx
   Header: Party info (name, phone, PAN, opening balance)
   Filter: date range, channel filter tabs (ALL | RETAIL | WHOLESALE | PROJECT)
   Table: Date | Ref# | Description | Channel | Debit | Credit | Running Balance
   Footer: Summary totals
   Export buttons: PDF + Excel

7. app/(dashboard)/cashbook/page.tsx
   Server component with today's summary

8. components/accounting/CashBookPage.tsx
   Summary cards: Opening Balance | Total Received | Total Paid | Closing Balance
   Date filter (default: today)
   Entries table: Date | Ref# | Description | Party | Type | Dr | Cr | Balance
   Type colors: Received (green), Paid (red)
   Actions: Add Cash Received | Add Cash Payment

9. components/accounting/AddCashEntryModal.tsx
   Type: RECEIVED or PAID
   Amount, Description, Party (optional, searchable), Payment method, Date, Reference, Notes
   On submit: creates CashBookEntry + LedgerEntry atomically

10. components/accounting/FixedAssetsPage.tsx (app/(dashboard)/assets/page.tsx)
    Asset list: Name | Category | Purchase Date | Cost | Useful Life | Method | Book Value | Status
    Monthly depreciation summary
    Run Depreciation button (MANAGER+ only) → runs for current month

11. components/accounting/DepreciationScheduleModal.tsx
    Year-by-year table: Year | Opening Value | Depreciation | Closing Value
    Visual: bar chart showing value over time

LEDGER DOWNLOAD IMPLEMENTATION:

lib/export/ledger-pdf.tsx:
Using @react-pdf/renderer:
- Header: NextGen Interior And WaterProofing letterhead
- Party: name, PAN, address, period
- Opening balance row
- Transactions table: Date | Description | Debit | Credit | Balance
- Closing balance row
- Firm signature section

lib/export/ledger-excel.ts:
Using xlsx library:
- Same data as PDF
- Proper column widths, bold headers
- Number formatting for amounts
- Summary row at bottom

Both export functions:
export async function downloadLedgerPDF(partyId, partyType, dateFrom, dateTo): Promise<Blob>
export async function downloadLedgerExcel(partyId, partyType, dateFrom, dateTo): Promise<Blob>
```

---

### ═══ STAGE 8: REPORTS MODULE ═══

```
Continuing NextGen ERP. Accounting module complete.

TASK: Build the complete Reports module. All reports must be downloadable as PDF and Excel.

REQUIRED REPORTS (matching the mockup exactly + extras):

FINANCIAL REPORTS:
1. Profit & Loss Statement (Monthly + Yearly)
   Sales Revenue (by channel) - Cost of Goods Sold = Gross Profit
   Gross Profit - Operating Expenses - Depreciation = Net Profit/Loss
   
2. Trading Account
   Opening Stock + Purchases - Closing Stock = Cost of Goods Sold
   Sales - COGS = Gross Profit
   
3. Balance Sheet (Monthly + Yearly snapshot)
   ASSETS: Current Assets (Cash, Receivables, Inventory) + Fixed Assets (net of depreciation)
   LIABILITIES: Payables + any loans
   EQUITY: Owner's capital + Retained earnings
   Assets = Liabilities + Equity
   
4. Trial Balance
   All accounts with total debit, total credit, balance as of any date

5. Cash Flow Statement
   Operating / Investing / Financing activities

SALES REPORTS:
6. Sales Summary (by day/week/month/year, by channel)
7. Customer-wise Sales (all invoices per customer, with balance)
8. Item-wise Sales (top selling items with qty and revenue)
9. Outstanding Dues (customers with pending balance, aging: 0-30/31-60/61-90/90+ days)
10. Channel-wise Revenue Comparison (Retail vs Wholesale vs Project)

PURCHASE REPORTS:
11. Purchase Summary (date range filter)
12. Vendor-wise Purchases
13. Pending Purchase Orders
14. Vendor Outstanding Payables

INVENTORY REPORTS:
15. Stock Summary (all items with current stock, value at cost)
16. Low Stock Report (items below reorder level)
17. Stock Movement (item inflow/outflow history)
18. Stock Valuation (FIFO or weighted average)
19. ABC Analysis (categorize items by sales volume/value: A=top 20%, B=next 30%, C=rest)
20. Slow-Moving Items (no sales in last 30/60/90 days)

PROJECT REPORTS:
21. Project Profitability (all projects: revenue vs cost vs margin)
22. Project-wise Billing (all invoices per project)
23. Material Usage by Project

BUILD THESE FILES:

1. modules/accounting/reports.ts
   All query functions — one per report. Each returns typed data.
   Use Prisma aggregations, groupBy. Cache expensive queries with React cache().
   
   Key functions:
   - getProfitLossData(month, year) → full P&L breakdown
   - getTradingAccountData(month, year) → trading account
   - getBalanceSheetData(asOf: Date) → B/S snapshot
   - getTrialBalanceData(asOf: Date)
   - getSalesSummary(dateFrom, dateTo, channel?) → by day
   - getItemWiseSales(dateFrom, dateTo) → top items
   - getAgingReport() → outstanding by aging bucket
   - getStockValuation() → FIFO-based valuation per item
   - getABCAnalysis(period) → ABC classification
   - getProjectProfitability() → all projects

2. app/(dashboard)/reports/page.tsx
   Reports menu page exactly matching mockup layout:
   Grid of report cards grouped by: Financial | Sales | Purchase | Inventory | Project
   Each card: icon + title + description + "View" button
   Clicking opens report with filters

3. components/reports/ReportViewer.tsx
   Wrapper that:
   - Shows report-specific filters (date range, customer, channel, etc.)
   - "Generate Report" button
   - Loading skeleton while data loads
   - Renders the specific report table
   - Download PDF + Excel buttons

4. components/reports/ProfitLossReport.tsx
   Formatted P&L with sections:
   - Revenue by channel (Retail / Wholesale / Project)
   - Total Revenue
   - COGS section
   - Gross Profit (with %)
   - Expenses (depreciation, etc.)
   - Net Profit/Loss (green if profit, red if loss)
   
5. components/reports/BalanceSheetReport.tsx
   Two-column layout: Assets | Liabilities + Equity
   Each section subtotaled, grand totals must balance

6. components/reports/TradingAccountReport.tsx
   Standard trading account format

7. components/reports/OutstandingAgingReport.tsx
   Aging table: Customer | 0-30 days | 31-60 | 61-90 | 90+ | Total
   Color code columns by severity

8. lib/export/reports-pdf.ts
   Functions to generate each financial report as PDF
   Professional layout with firm letterhead
   
9. lib/export/reports-excel.ts
   Functions to generate each report as Excel
   Multiple sheets for complex reports (e.g., Balance Sheet: Summary + Detail)

10. components/reports/DashboardCharts.tsx
    Chart components used on Dashboard:
    - RevenueByChannelChart: stacked bar (Retail/Wholesale/Project by month)
    - MonthlyProfitTrendChart: line chart, 12 months
    - TopSellingItemsChart: horizontal bar
    - CashFlowMiniChart: line chart for cash position
    Use recharts library.
```

---

### ═══ STAGE 9: DASHBOARD ═══

```
Continuing NextGen ERP. All modules and reports are complete.

TASK: Build the main Dashboard — the first page owners see daily.
This is the command center for the entire business.

DESIGN: Clean, data-dense, professional. Match the BizManager mockup exactly 
but enhance with charts. The dashboard should answer: 
"How is my business doing right now?"

DATA TO SHOW:

ROW 1 — KPI Cards (4):
- Total Revenue This Month: NPR X,XX,XXX | +/- % vs last month
- Total Expenses This Month: NPR X,XX,XXX | +/- % vs last month  
- Active Projects: N | pending approval count
- Low Stock Items: N | "Needs Reorder" — click to go to inventory

ROW 2 — Charts (2):
- Monthly Revenue by Channel (bar chart: last 6 months, 3 bars per month: Retail/Wholesale/Project)
- Cash Flow Trend (line chart: last 30 days, daily cash balance)

ROW 3 — Two columns:
Left — Recent Invoices table (last 5):
  Invoice# | Customer | Date | Amount | Status badge

Right — Cash Book Summary card:
  Opening Balance | Cash Received Today | Cash Paid Today | Closing Balance (LIVE)
  Mini sparkline for today's cash movements

ROW 4 — Two columns:
Left — Low Stock Alerts:
  Item | Stock | Reorder At | Quick Reorder button
  
Right — Pending Payments (vendors):
  Vendor | PO# | Amount Due | Due Date | Days Overdue

ROW 5 — Project Overview:
  Horizontal scrollable project cards
  Each card: Project name | Client | Progress bar (cost/budget) | Margin% | Status

BUILD THESE FILES:

1. app/(dashboard)/dashboard/page.tsx
   Server component:
   - Fetch all dashboard data (parallel with Promise.all)
   - Pass to client components

2. modules/dashboard/queries.ts
   - getDashboardKPIs(month, year) → revenue, expenses, project count, low stock count
   - getRecentInvoices(limit=5) → last invoices
   - getCashSummary(date) → today's cash
   - getLowStockAlerts(limit=5)
   - getPendingVendorPayments(limit=5)
   - getActiveProjectsSummary()
   - getMonthlyRevenueByChannel(months=6) → for chart

3. components/dashboard/KPICards.tsx
   4 stat cards with: value, label, trend %, trend icon (↑↓), click-to-navigate

4. components/dashboard/RevenueChart.tsx (Client, uses recharts)
   Grouped bar chart, channel colors: blue/green/purple
   Month labels, NPR formatting on Y axis

5. components/dashboard/CashFlowChart.tsx (Client, uses recharts)
   Line chart, fill below line, today highlighted

6. components/dashboard/RecentInvoicesTable.tsx
   Last 5 invoices, channel badge, status badge, amount
   "View All" link to sales module

7. components/dashboard/CashSummaryCard.tsx
   Live refresh every 60 seconds (useEffect + re-fetch)
   Shows opening, received, paid, closing with colored amounts

8. components/dashboard/LowStockWidget.tsx
   Top N low stock items
   Red border on critically low (< 50% of reorder level)
   Quick Reorder → opens purchase order form pre-filled

9. components/dashboard/PendingPaymentsWidget.tsx
   Vendor payments overdue
   Days overdue in red if > 30 days

10. components/dashboard/ProjectCards.tsx
    Horizontal scroll of project cards
    Progress bar color: green <50% of budget, amber 50-80%, red >80%
    Click → project detail page
```

---

### ═══ STAGE 10: USERS, SETTINGS & FINAL POLISH ═══

```
Continuing NextGen ERP. All core modules complete.

TASK: Build Users & Permissions management + Settings + final polish.

1. app/(dashboard)/users/page.tsx + components/users/UsersPage.tsx
   
   Two sections:
   Section A — User Accounts table:
   Name | Email | Role | Modules Access | Status | Last Login | Actions (Edit, Deactivate)
   
   Section B — Role Permissions Matrix:
   Exact match of BizManager mockup:
   Rows: Modules (Dashboard/Inventory/Purchase/Sales/Projects/Ledger/Cash Book/Reports/User Mgmt)
   Columns: Super Admin | Owner | Manager | Sales Staff | Purchase Staff | Viewer
   Cells: Full (green) | View (blue) | Limited (amber) | No Access (gray)

2. components/users/AddUserModal.tsx
   Fields: Name, Email, Password (with strength indicator), Role (dropdown), 
           Status (Active/Inactive)
   Only SUPERADMIN can create users.
   Sends welcome email placeholder.

3. components/users/EditUserModal.tsx
   Edit name, role, status. Cannot edit own role. Cannot deactivate own account.

4. app/(dashboard)/settings/page.tsx
   Tabs:
   - Business Info: firm name, PAN, address, phone, logo upload
   - Invoice Settings: default VAT rate, invoice prefix, terms & conditions text, 
                       color schemes per channel
   - Fiscal Year: current year, create new year, close year
   - Warehouses: add/edit warehouse locations
   - Backup: export all data as JSON (SUPERADMIN only)

5. AUDIT LOG VIEWER (for SUPERADMIN):
   components/users/AuditLogViewer.tsx
   Table: Time | User | Action | Module | Record ID | Changes (diff view)
   Filter: user, module, date range

6. SEED DATA (prisma/seed.ts):
   Create realistic seed data:
   - 1 SuperAdmin user (admin@nextgen.com / password: Admin@123)
   - Business: NextGen Interior And WaterProofing, PAN 122782202
   - 5 categories: Construction, Plumbing, Electrical, Finishing, Waterproofing
   - 5 brands: Himal, Shivam, Jagdamba, Asian Paints, Finolex
   - 10 products per category (50 total) with realistic NPR prices
   - 5 suppliers (local Nepali names + addresses)
   - 10 customers (mix of retail/wholesale/project type)
   - 3 warehouses: Main Warehouse, Yard B, Dispatch Bay
   - 20 purchase orders (various statuses)
   - 30 sales invoices (mix of retail/wholesale/project)
   - 3 active projects
   - 90 days of ledger entries
   - 90 days of cash book entries
   - Current fiscal year: 2081-82

7. GLOBAL POLISH:
   
   Loading States:
   - Skeleton screens for all tables (show 5 skeleton rows while loading)
   - Skeleton cards for KPI widgets
   
   Error Handling:
   - Global error boundary
   - Toast notifications for all actions (success/error/warning)
   - Form field errors shown inline below each field
   
   Empty States:
   - Each table shows helpful empty state with action button when no data
   - e.g. Inventory empty → "No products yet. Add your first product →"
   
   Responsive Design:
   - Sidebar collapses to icon-only on medium screens, hidden on mobile
   - Tables scroll horizontally on mobile
   - Cards stack vertically on mobile
   - Touch-friendly action buttons (min 44px tap target)
   
   Performance:
   - All list pages use cursor-based pagination
   - Search inputs debounced 300ms
   - React.cache() on expensive report queries
   - next/image for any images

   Number Formatting:
   - ALL amounts displayed with formatNPR() → "NPR 1,42,500"
   - Nepal number format: 1,42,500 (not 142,500) — lakhs format
   - Negative amounts in red
   - Positive amounts in black (or green where appropriate)

8. package.json scripts:
   "db:push": "prisma db push"
   "db:seed": "prisma db seed"
   "db:studio": "prisma studio"
   "db:generate": "prisma generate"
   "build": "prisma generate && next build"

FINAL CHECKLIST after all stages:
- [ ] All 9 sidebar modules working end-to-end
- [ ] Invoice PDF generation with channel colors
- [ ] Ledger downloadable as PDF + Excel
- [ ] P&L, Balance Sheet, Trading Account generating correctly
- [ ] Stock never goes below 0 without override
- [ ] All ledger entries immutable
- [ ] Role-based access enforced on every route + action
- [ ] Seed data loads cleanly
- [ ] Mobile responsive
- [ ] No TypeScript errors
```

---

## PART 4: TIPS FOR AI IDE USAGE

### Working with Cursor / Windsurf / Claude Code

1. **Context Rule**: At the start of each new stage prompt, add at the very top:
   ```
   [CODEBASE CONTEXT: This is a Next.js 15 + TypeScript + Prisma ERP for 
   NextGen Interior And WaterProofing, Nepal. Previous stages are complete.]
   ```

2. **One file at a time if errors occur**: If a stage generates too many files 
   with errors, break it down: ask for one component at a time.

3. **After each stage, run**:
   ```bash
   npx tsc --noEmit    # TypeScript check
   npx prisma validate  # Schema check (after Stage 1)
   npm run dev          # Runtime check
   ```

4. **Fixing errors**: Paste error messages back into the AI IDE:
   ```
   Fix this TypeScript error: [paste error]
   Do not change any business logic, only fix the type error.
   ```

5. **Staged Git commits**: After each working stage:
   ```bash
   git add . && git commit -m "feat: complete [module] module"
   ```

6. **If context gets too long**: Start a new AI IDE conversation, paste:
   ```
   I am building NextGen ERP. The database schema (Stage 1), project setup (Stage 2), 
   inventory (Stage 3), purchase (Stage 4), and sales (Stage 5) are complete.
   Now I need to build [current stage]. Here is the relevant existing code: [paste key files]
   ```

---

## PART 5: TOTAL SCOPE SUMMARY

| Module | Complexity | Est. AI Prompting Time |
|--------|-----------|----------------------|
| DB Schema + Setup | High | 2-3 hours |
| Inventory | High | 3-4 hours |
| Purchase | Medium-High | 2-3 hours |
| Sales + Invoice | Very High | 4-5 hours |
| Projects | Medium | 2-3 hours |
| Accounting | High | 3-4 hours |
| Reports | Very High | 4-5 hours |
| Dashboard | Medium | 2-3 hours |
| Users + Polish | Medium | 2-3 hours |
| **TOTAL** | | **~25-35 hours** |

This is a serious ERP. Even with AI IDEs, expect to spend time reviewing, 
fixing, and testing each module. The prompts above are designed to minimize 
back-and-forth but you will still need to guide the AI at each step.

---

*Build Plan Version 1.0 | NextGen Interior And WaterProofing ERP SaaS*  
*Currency: NPR | Nepal Fiscal Year | PAN: 122782202*
# Finance Coordinator — API Contract

> **Document type:** Backend API contract (analysis-only, reverse-engineered from the existing frontend)
> **Role:** FINANCE_COORDINATOR
> **Frontend module analyzed:** `frontend/src/pages/finance-repository/`
> **Status:** All proposed endpoints are 🔶 **INFERRED** — the frontend currently makes **zero** API calls (100% mock/in-memory data). Field names are copied **verbatim** from the TypeScript configs.
> **Confidence legend:** ✅ CONFIRMED FROM FRONTEND · 🔶 INFERRED (reasonable contract proposal) · ⚠️ REQUIRES BUSINESS CONFIRMATION

---

## 1. Purpose

This document defines the backend API contract required to make the existing **Finance Coordinator** frontend fully functional.

The Finance Coordinator maintains **institution-wide financial data** for accreditation (NBA / NAAC / NIRF): budget allocation, income & revenue, expenditure, research funding, scholarships, endowments & donations, audit reports, and financial assets — plus financial supporting documents and a dashboard of KPIs, financial health indicators, and recent activities.

The frontend is a **single self-contained page** (`FinanceRepositoryPage.tsx`) with an internal sidebar; all eight data tabs are **config-driven** from `finance-configs.ts` (`financeTabConfigs`) and rendered through one generic table component with client-side search, add/edit dialogs, and row delete. There is **no Redux store, no service layer, and no API call** in this module.

The frontend is the source of truth. Every field name below is copied from the actual frontend implementation. No frontend file was modified to produce this document.

---

## 2. Frontend Source of Truth

### Route & Layout

| Item | Value |
|------|-------|
| **Route** | `/app/finance-repository` (index route, no `?view=` param — view switching is internal `useState`) |
| **Route definition** | `frontend/src/App.tsx` |
| **Layout** | `frontend/src/layouts/FinanceCoordinatorLayout.tsx` — `ImpersonationBanner` + `Header`, no outer sidebar (page has its own internal sidebar) |
| **Page** | `frontend/src/pages/finance-repository/FinanceRepositoryPage.tsx` |
| **Allowed roles** | `UserRole.FINANCE_COORDINATOR` only (✅ `ProtectedRoute allowedRoles={[UserRole.FINANCE_COORDINATOR]}`) |

### Finance Coordinator Pages & Components (10 views)

| # | View | Nav ID | Component | Renders via |
|---|------|--------|-----------|-------------|
| 1 | Dashboard | `dashboard` | `components/FinanceDashboard.tsx` | — |
| 2 | Budget Allocation | `budget-allocation` | `FinanceRepositoryPage` (inline table) | config-driven table |
| 3 | Income & Revenue | `income-revenue` | `FinanceRepositoryPage` (inline table) | config-driven table |
| 4 | Expenditure | `expenditure` | `FinanceRepositoryPage` (inline table) | config-driven table |
| 5 | Research Funding | `research-funding` | `FinanceRepositoryPage` (inline table) | config-driven table |
| 6 | Scholarships | `scholarships` | `FinanceRepositoryPage` (inline table) | config-driven table |
| 7 | Endowments & Donations | `endowments-donations` | `FinanceRepositoryPage` (inline table) | config-driven table |
| 8 | Audit Reports | `audit-reports` | `FinanceRepositoryPage` (inline table) | config-driven table |
| 9 | Financial Assets | `financial-assets` | `FinanceRepositoryPage` (inline table) | config-driven table |
| 10 | Supporting Documents | `documents` | `components/FinanceDocumentsView.tsx` | — |

### Config / Type Files

| File | Role |
|------|------|
| `finance-repository/finance-configs.ts` | **Primary source of truth** — `FinanceFieldConfig`, `FinanceTabConfig`, `financeTabConfigs` (8 tabs with fields + sample data), `financeDocumentCategories` (12) |
| `components/shared/EvidenceUploadDialog.tsx` | Shared evidence upload dialog (accepted types, 10 MB limit) — reused by documents view |

---

## 3. Finance Coordinator Screen Inventory

| # | Screen | Internal View ID | Main Component | Purpose |
|---|--------|------------------|----------------|---------|
| 1 | Dashboard | `dashboard` | `FinanceDashboard` | 8 KPI cards, Financial Health Indicators, Recent Activities |
| 2 | Budget Allocation | `budget-allocation` | page inline table | Annual budget allocation across departments and heads (11 fields) |
| 3 | Income & Revenue | `income-revenue` | page inline table | All sources of institutional income (10 fields) |
| 4 | Expenditure | `expenditure` | page inline table | Detailed expenditure tracking (12 fields) |
| 5 | Research Funding | `research-funding` | page inline table | Grants, project funding, sponsored research (13 fields) |
| 6 | Scholarships | `scholarships` | page inline table | Schemes, disbursements, beneficiary tracking (12 fields) |
| 7 | Endowments & Donations | `endowments-donations` | page inline table | Endowment funds, donations, corpus (12 fields) |
| 8 | Audit Reports | `audit-reports` | page inline table | Internal/external audits, compliance, observations (13 fields) |
| 9 | Financial Assets | `financial-assets` | page inline table | FDs, investments, reserves, instruments (13 fields) |
| 10 | Supporting Documents | `documents` | `FinanceDocumentsView` | Category grid + per-category document list + search + upload |

**Navigation structure** (sidebar, `FinanceRepositoryPage.tsx`): Dashboard → Budget Allocation → Income & Revenue → Expenditure → Research Funding → Scholarships → Endowments & Donations → Audit Reports → Financial Assets → Supporting Documents.

---

## 4. Frontend Type Inventory

### 4.1 Finance types (`finance-configs.ts`)

| Type | Fields | Used By |
|------|--------|---------|
| `FinanceFieldConfig` | `key: string`; `label: string`; `type: 'text' \| 'number' \| 'date' \| 'select' \| 'currency' \| 'percentage'`; `required?: boolean`; `options?: string[]`; `placeholder?: string` | every data tab (table headers + edit form) |
| `FinanceTabConfig` | `id: string`; `label: string`; `icon: string`; `description: string`; `fields: FinanceFieldConfig[]`; `sampleData: Record<string, string \| number>[]` | `FinanceRepositoryPage` — table rendering, add/edit dialog, initial data |
| `financeTabConfigs` | `FinanceTabConfig[]` (8 tabs) | page |
| `financeDocumentCategories` | `{ id: string; label: string; count: number }[]` (12 categories) | `FinanceDocumentsView` |

### 4.2 Data row shape

All table rows are `Record<string, string | number>` keyed by the tab's `field.key` values. Currency/percentage values are stored as **numbers** in state and formatted on display:
- `currency` → `₹${Number(value).toLocaleString('en-IN')}` (✅ e.g. `₹1,500,000`)
- `percentage` → `${value}%` (✅ e.g. `75%`)

### 4.3 Field schemas per tab (all 8 tabs — exact `key`/`label`/`type`/`options` values)

**budget-allocation** — `financialYear`(text, req), `department`(text, req), `budgetHead`(select), `allocatedAmount`(currency, req), `revisedAmount`(currency), `utilizedAmount`(currency), `utilizationPercentage`(percentage), `approvalDate`(date), `approvedBy`(text), `status`(select), `remarks`(text)
**income-revenue** — `financialYear`(text, req), `revenueSource`(select, req), `category`(select), `amount`(currency, req), `receiptDate`(date), `sourceEntity`(text), `referenceNumber`(text), `recurring`(select), `verificationStatus`(select), `remarks`(text)
**expenditure** — `financialYear`(text, req), `expenditureHead`(select, req), `department`(text), `description`(text, req), `amount`(currency, req), `paymentDate`(date), `vendorPayee`(text), `invoiceNumber`(text), `paymentMode`(select), `budgetHead`(text), `approvedBy`(text), `status`(select)
**research-funding** — `projectTitle`(text, req), `principalInvestigator`(text, req), `department`(text, req), `fundingAgency`(select), `sanctionedAmount`(currency, req), `receivedAmount`(currency), `expendedAmount`(currency), `sanctionDate`(date), `startDate`(date), `endDate`(date), `projectStatus`(select), `utilizationCertificate`(select), `remarks`(text)
**scholarships** — `scholarshipName`(text, req), `category`(select, req), `fundingSource`(select), `academicYear`(text, req), `totalBeneficiaries`(number), `amountPerStudent`(currency), `totalDisbursed`(currency, req), `disbursementDate`(date), `eligibilityCriteria`(text), `selectionProcess`(text), `status`(select), `remarks`(text)
**endowments-donations** — `donorName`(text, req), `donationType`(select, req), `purpose`(text, req), `amount`(currency, req), `dateReceived`(date), `donorCategory`(select), `taxExemption`(select), `corpusValue`(currency), `annualInterest`(currency), `utilizationDetails`(text), `status`(select), `remarks`(text)
**audit-reports** — `auditType`(select, req), `financialYear`(text, req), `auditorName`(text, req), `auditPeriod`(text), `auditDate`(date), `reportDate`(date), `totalObservations`(number), `majorFindings`(number), `resolvedObservations`(number), `complianceScore`(percentage), `auditOpinion`(select), `status`(select), `remarks`(text)
**financial-assets** — `assetType`(select, req), `description`(text, req), `institution`(text, req), `accountNumber`(text), `investmentAmount`(currency, req), `currentValue`(currency), `interestRate`(percentage), `maturityDate`(date), `startDate`(date), `annualIncome`(currency), `purpose`(text), `status`(select), `remarks`(text)

### 4.4 Supporting document row (`FinanceDocumentsView.tsx`)

```ts
interface Document {
  id: string;
  name: string;
  type: string;              // 'PDF' | 'Excel' (display)
  uploadedBy: string;
  uploadDate: string;        // YYYY-MM-DD
  size: string;              // human-readable, e.g. '2.4 MB'
  status: 'Verified' | 'Pending' | 'Under Review';
}
```

---

## 5. Frontend Service Inventory

**Result: ZERO service/API files and ZERO existing API calls in the Finance Coordinator module.**

Verified via full-text search of `finance-repository/**` for `api.`, `axios`, `fetch(`, `useQuery`, `useMutation`, `from '@/services/` — **0 matches**. All data is in-memory component state initialized from `financeTabConfigs[].sampleData`.

| Service | File | Function | HTTP Method | Existing Endpoint | Used By |
|---------|------|----------|-------------|-------------------|---------|
| — | `finance-configs.ts` | static exports | — | — | all views (mock) |
| — | `FinanceRepositoryPage.tsx` | `useState` in-memory CRUD | — | — | 8 data tabs |
| — | `FinanceDashboard.tsx` | hardcoded arrays | — | — | dashboard |
| — | `FinanceDocumentsView.tsx` | `sampleDocuments` map | — | — | documents |

---

## 6. Global API Specifications

| Item | Value |
|------|-------|
| **Base Endpoint Path** | `/api/v1/finance-coordinator` (🔶 proposed — follows the role-based convention used by `/api/v1/head-of-department`, `/api/v1/principal`, `/api/v1/iqac`, `/api/v1/infrastructure-coordinator`) |
| **Swagger Tag** | `Finance Coordinator` |
| **Authentication** | Bearer JWT (`Authorization: Bearer <token>`) — same auth used by all AccreditPro modules |
| **Role Guard** | `FINANCE_COORDINATOR` (✅ exists in `auth.types.ts`; route is restricted to this role only) |
| **Content-Type** | `application/json`; `multipart/form-data` for CSV uploads and evidence uploads |
| **Currency format** | Backend returns **numeric INR amounts** (frontend renders `₹` + `toLocaleString('en-IN')` — ✅ confirmed). No currency code field exists; 🔶 use plain numbers (₹) |
| **Percentage format** | numeric 0–100 (frontend renders `${value}%`) |
| **Date format** | `YYYY-MM-DD` (all `type: 'date'` fields; sample data uses `'2024-04-01'` style) |
| **DateTime format** | `yyyy-MM-dd HH:mm` for `lastUpdated`-style fields if introduced 🔶 |
| **Success response** | `ApiResponse<T>` envelope matching the rest of the app: `{ "success": true, "message": "...", "data": T }` |
| **Error response** | `ApiResponse<T>` with `success: false`, `message`, optional `data` (existing AccreditPro convention) |
| **Pagination** | 🔶 Spring Page shape `{ content, page, size, totalElements, totalPages, number, ... }` where backend pagination is used (frontend tables are small in-memory arrays today — see §12) |

### Standard Query Parameters for GET (List) Endpoints

| Param | Type | Notes |
|-------|------|-------|
| `financialYear` | string | `'2024-25'` etc. — used by budget-allocation, income-revenue, expenditure, audit-reports tabs (🔶 optional filter; no financial-year selector exists in the UI today) |
| `academicYear` | string | `'2024-25'` — scholarships tab only |
| `search` | string | free-text search across all row values (✅ frontend `Object.values(row).some(...)`) |
| `page`, `size`, `sortBy`, `sortDirection` | — | Spring Page params 🔶 |

---

## 7. Authentication & Authorization

| Concern | Rule |
|---------|------|
| **Authentication** | JWT Bearer token, required on all endpoints |
| **Authorization** | Finance Coordinator role required (✅ route restricted to `FINANCE_COORDINATOR`). 🔶 INFERRED — no other role should access `/api/v1/finance-coordinator/**` |
| **Institution scope** | This role manages **institution-wide** financial data. `institutionId` must be **derived from the authenticated user context**, never trusted from request bodies/params |
| **Department scope** | No department restriction — records carry a `department` *field* (budget-allocation, expenditure, research-funding) but the coordinator sees all departments. 🔶 Note `department` is free text in the UI, not a validated master reference |
| **Write boundaries** | The coordinator **adds, edits, and deletes** records (✅ Add Record / Edit / Delete buttons) and **uploads documents** (✅ Upload button). The coordinator **cannot** verify documents — document `status` (`Verified` / `Under Review`) is advanced by another role (🔶 audit/verification workflow). Read-only gating via `useReadOnly()` exists on the data tabs but **not** on the documents view (see §22 gap #3) |
| **Impersonation** | Frontend disables data-tab write actions when `isImpersonating` (read-only preview). Backend re-validates role + institution server-side on each write API |

---

## 8. API Endpoint Summary

All paths under **`/api/v1/finance-coordinator`**. `{tabId}` ∈ the 8 tab ids: `budget-allocation, income-revenue, expenditure, research-funding, scholarships, endowments-donations, audit-reports, financial-assets`.

| # | Method | Endpoint | Screen | Action | Auth | Notes |
|---|--------|----------|--------|--------|------|-------|
| 1 | GET | `/dashboard` | dashboard | Load KPIs, financial health indicators, recent activities | FC | aggregation endpoint |
| 2 | GET | `/sections/{tabId}` | 8 data tabs | List records for a section | FC | `financialYear`/`academicYear`, `search`, pagination; field set from config |
| 3 | GET | `/sections/{tabId}/{id}` | data tabs | Single record detail | FC | 🔶 optional (no detail view today) |
| 4 | POST | `/sections/{tabId}` | data tabs | Create record (Add Record dialog) | FC | body per section schema |
| 5 | PUT | `/sections/{tabId}/{id}` | data tabs | Update record (Edit dialog) | FC | |
| 6 | DELETE | `/sections/{tabId}/{id}` | data tabs | Delete record (row delete) | FC | 🔶 soft delete |
| 7 | GET | `/sections/{tabId}/template` | data tabs | Download CSV import template | FC | 🔶 optional — the "CSV Upload" button is inert today (see §22 gap #1) |
| 8 | POST | `/sections/{tabId}/upload` | data tabs | CSV upload + validation | FC | 🔶 optional — no CSV upload flow implemented |
| 9 | GET | `/documents` | documents | List supporting documents | FC | `category`, `search` |
| 10 | POST | `/documents` | documents | Upload evidence document | FC | multipart; 10 MB; accepted types |
| 11 | GET | `/documents/{id}/download` | documents | Download document | FC | binary |
| 12 | DELETE | `/documents/{id}` | documents | Delete document | FC | 🔶 INFERRED — no delete button today |

**Endpoint count:** 12 endpoint templates — the 7 section endpoints (#2–#8) apply per-tab (7 × 8 = 56 tab-specific routes) + 5 shared routes (#1 dashboard, #9–#12 documents) = **61 concrete routes**.

---

## 9. Detailed API Contracts

### 9.1 GET /api/v1/finance-coordinator/dashboard

- **Purpose:** Load the Finance Dashboard (KPI cards, financial health indicators, recent activities).
- **Frontend Screen:** Dashboard (`FinanceDashboard.tsx`)
- **Frontend Data Sources:** hardcoded arrays — `kpiCards` (8), Financial Health Indicators (6), `recentActivities` (8)
- **Authentication:** Bearer JWT · **Authorization:** Finance Coordinator
- **Query Parameters:** `financialYear` (optional 🔶 — dashboard is currently not year-aware)
- **Response DTO (🔶 INFERRED):**

```json
{
  "success": true,
  "message": "Dashboard retrieved successfully",
  "data": {
    "kpis": [
      { "title": "Total Budget", "value": "₹18.5 Cr", "change": "+8.2% from last year", "changeType": "positive" },
      { "title": "Total Revenue", "value": "₹63.3 Cr", "change": "+12.5% YoY", "changeType": "positive" },
      { "title": "Total Expenditure", "value": "₹10.5 Cr", "change": "56.8% utilized", "changeType": "neutral" },
      { "title": "Research Funding", "value": "₹9.0 Cr", "change": "4 active projects", "changeType": "positive" },
      { "title": "Scholarships Disbursed", "value": "₹82.5 L", "change": "205 beneficiaries", "changeType": "positive" },
      { "title": "Endowments Value", "value": "₹19.9 Cr", "change": "4 active endowments", "changeType": "positive" },
      { "title": "Audit Compliance", "value": "92%", "change": "Last audit: Clean", "changeType": "positive" },
      { "title": "Financial Assets", "value": "₹55.0 Cr", "change": "₹4.08 Cr annual income", "changeType": "positive" }
    ],
    "financialHealth": [
      { "label": "Budget Utilization", "value": 70 },
      { "label": "Revenue Collection", "value": 85 },
      { "label": "Expenditure Control", "value": 78 },
      { "label": "Audit Compliance", "value": 92 },
      { "label": "Asset Growth", "value": 88 },
      { "label": "Scholarship Coverage", "value": 65 }
    ],
    "recentActivities": [
      { "id": "1", "action": "Budget Revised", "details": "Library budget increased by ₹1L for e-journal subscriptions", "timestamp": "2 hours ago", "type": "expense" }
    ]
  }
}
```

- **Notes:** All KPI/health/activity values are **hardcoded** in the frontend today (see §22 gap #2). ✅ `recentActivities.type` enum: `'income' | 'expense' | 'audit' | 'scholarship' | 'investment'`. KPI values are display strings (₹ + Cr/L abbreviations) — 🔶 backend may return numeric + formatting, but the frontend expects pre-formatted strings today.

### 9.2 GET /api/v1/finance-coordinator/sections/{tabId}

- **Purpose:** List records for one data tab (e.g. all budget allocations).
- **Frontend Screen:** 8 data tabs
- **Frontend Component:** `FinanceRepositoryPage` inline table (`currentData` memo)
- **Frontend Service:** none (in-memory `tableData` seeded from `tab.sampleData`)
- **Authentication / Authorization:** Bearer JWT · Finance Coordinator
- **Path Parameters:** `tabId` — one of the 8 tab ids
- **Query Parameters:** `financialYear` (budget-allocation, income-revenue, expenditure, audit-reports), `academicYear` (scholarships), `search`, `page`, `size`, `sortBy`, `sortDirection`
- **Response DTO (🔶 INFERRED):**

```json
{
  "success": true,
  "message": "Budget allocations retrieved successfully",
  "data": {
    "content": [
      { "id": 1, "financialYear": "2024-25", "department": "Computer Science", "budgetHead": "Equipment", "allocatedAmount": 1500000, "revisedAmount": 1600000, "utilizedAmount": 1200000, "utilizationPercentage": 75, "approvalDate": "2024-04-01", "approvedBy": "Finance Committee", "status": "Approved", "remarks": "Lab upgrades" }
    ],
    "page": 0, "size": 10, "totalElements": 4, "totalPages": 1, "number": 0
  }
}
```

- **Field set:** use the tab's `FinanceFieldConfig[]` from §4.3. `currency`/`percentage` → numbers. `date` → `YYYY-MM-DD`. `select` → one of `options` (§11).
- **Pagination:** 🔶 Spring Page shape (see §12). **Search:** free-text across all values (✅ frontend). **Sorting:** by any field `key`, 🔶 `ASC`/`DESC`.
- **Security / Scope:** institution-wide; no ownership filter.

### 9.3 GET /api/v1/finance-coordinator/sections/{tabId}/{id}

- **Purpose:** Fetch a single record. 🔶 INFERRED — the frontend edits in-place from the row object and has no detail view; include only if a detail API is desired.
- **Response:** `data` = single record object.

### 9.4 POST /api/v1/finance-coordinator/sections/{tabId}

- **Purpose:** Create a record via the "Add Record" dialog (`handleAddNew` → `handleSave`).
- **Request Body (🔶 INFERRED):** the tab's field set, e.g. for budget-allocation:

```json
{
  "financialYear": "2025-26",
  "department": "Computer Science",
  "budgetHead": "Equipment",
  "allocatedAmount": 1500000,
  "utilizedAmount": 1200000,
  "utilizationPercentage": 80,
  "approvalDate": "2025-04-01",
  "approvedBy": "Finance Committee",
  "status": "Approved",
  "remarks": ""
}
```

- **Response:** `201` → `ApiResponse<record>`.
- **Validation:** required fields (config `required: true`), numeric/currency positive values, percentage 0–100, date `YYYY-MM-DD`, select membership. **BACKEND VALIDATION REQUIRED** for computed fields (e.g. `utilizationPercentage` consistency with amounts) where the frontend only stores what the user types.

### 9.5 PUT /api/v1/finance-coordinator/sections/{tabId}/{id}

- **Purpose:** Update a record via the Edit dialog (`handleEdit` → `handleSave`).
- **Request Body:** full record 🔶 (partial update also acceptable).
- **Response:** `ApiResponse<record>`.

### 9.6 DELETE /api/v1/finance-coordinator/sections/{tabId}/{id}

- **Purpose:** Delete a record (`handleDelete`). 🔶 Soft delete recommended.
- **Response:** `ApiResponse<Void>` with success message.

### 9.7 GET /api/v1/finance-coordinator/sections/{tabId}/template

- **Purpose:** Download CSV import template. 🔶 **OPTIONAL** — the "CSV Upload" button in the page header has **no `onClick` handler** (inert; see §22 gap #1). Include only when CSV import is implemented.
- **Response:** `text/csv` attachment; header row = field `labels`.

### 9.8 POST /api/v1/finance-coordinator/sections/{tabId}/upload

- **Purpose:** CSV upload + validation. 🔶 **OPTIONAL** — same inert-button caveat as §9.7.
- **Request:** `multipart/form-data` — `file: File` (`.csv`).
- **Response DTO:** mirror the `ValidationResult` shape used elsewhere (`totalRows`, `validRows`, `invalidRows`, `warnings`, `errors[]` with `row/column/value/message/severity`).

### 9.9 GET /api/v1/finance-coordinator/documents

- **Purpose:** List supporting documents with category filter + search.
- **Frontend Screen:** Supporting Documents (`FinanceDocumentsView.tsx`)
- **Frontend Data:** `sampleDocuments` map (only 3 of the 12 categories have mock docs: `budget-approvals`, `audit-certificates`, `funding-sanctions`), categories from `financeDocumentCategories` (12)
- **Query Parameters:** `category` (category id, optional), `search` (by `name`, ✅ confirmed)
- **Response DTO (🔶 INFERRED):**

```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": {
    "content": [
      { "id": "1", "name": "Budget_Approval_2024-25.pdf", "category": "budget-approvals", "type": "PDF", "uploadedBy": "Priya Sharma", "uploadDate": "2024-04-15", "size": "2.4 MB", "status": "Verified" }
    ],
    "categories": [ { "id": "budget-approvals", "label": "Budget Approval Orders", "count": 8 } ],
    "page": 0, "size": 10, "totalElements": 8, "totalPages": 1, "number": 0
  }
}
```

- **Document status enum:** `'Verified' | 'Pending' | 'Under Review'` (✅ `getStatusColor` in `FinanceDocumentsView` — note capitalized, unlike other modules' lowercase statuses).
- **Notes:** Category `count` badges are hardcoded in config. The document `type` (`PDF`/`Excel`) is derived from the filename extension in mock data.

### 9.10 POST /api/v1/finance-coordinator/documents

- **Purpose:** Upload evidence documents (via `EvidenceUploadDialog`).
- **Request:** `multipart/form-data` — `files: File[]`; `category: string` (category id); optional `title`.
- **Accepted types:** `.pdf, .docx, .zip, .png, .jpg, .jpeg, .xlsx, .csv` (✅ `DEFAULT_ACCEPTED_TYPES`); **max 10 MB per file** (✅ `MAX_FILE_SIZE = 10MB`).
- **Response:** `201` → `ApiResponse<{ files: Record<string, UploadedFile[]> }>`.

### 9.11 GET /api/v1/finance-coordinator/documents/{id}/download

- **Purpose:** Download a supporting document (✅ eye/download buttons in document list).
- **Response:** binary stream with correct `Content-Type` + `Content-Disposition: attachment`.

### 9.12 DELETE /api/v1/finance-coordinator/documents/{id}

- **Purpose:** Delete a document. 🔶 INFERRED — no delete button exists in the documents view today; include only if deletion is a requirement.

---

## 10. DTO Definitions

> The per-tab field sets (§4.3) ARE the request/response DTOs for endpoints 2–8. Backend should generate one DTO per tab (e.g. `BudgetAllocationRequest`/`BudgetAllocationResponse`, `IncomeRevenueRequest`/`IncomeRevenueResponse`, … `FinancialAssetRequest`/`FinancialAssetResponse`).

### Generic section record envelope (all 8 tabs)

```json
{
  "id": "long (🔶; frontend mock rows have no id — indexed by position)",
  "<fieldKey>": "per §4.3",
  "financialYear": "2024-25 (tabs that carry it)",
  "status": "section status enum (§11)"
}
```

### Supporting document row (`Document`)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | |
| `name` | string | ✅ | file name |
| `category` | string | ✅ | category id (`budget-approvals`…) |
| `type` | string | 🔶 | display type (`PDF`/`Excel`) — can be derived from extension |
| `uploadedBy` | string | ✅ | |
| `uploadDate` | string | ✅ | `YYYY-MM-DD` |
| `size` | string | ✅ | human-readable, e.g. `2.4 MB` (🔶 backend may also return raw bytes) |
| `status` | enum | ✅ | `Verified` \| `Pending` \| `Under Review` |

---

## 11. Enum Definitions

### 11.1 Field input type (`FinanceFieldConfig.type`)
`text` · `number` · `date` · `select` · `currency` · `percentage` — drives form controls and display formatting (currency → `₹` + en-IN locale; percentage → `%`).

### 11.2 Budget Allocation status (`budget-allocation.status`)
`Proposed` · `Approved` · `Revised` · `Frozen` · `Closed`

### 11.3 Budget heads (`budget-allocation.budgetHead`)
`Salaries` · `Infrastructure` · `Equipment` · `Library` · `Research` · `Student Welfare` · `Maintenance` · `IT & Technology` · `Sports` · `Cultural Activities` · `Administrative` · `Contingency`

### 11.4 Revenue sources (`income-revenue.revenueSource`)
`Tuition Fees` · `Examination Fees` · `Hostel Fees` · `Transport Fees` · `Government Grants` · `UGC Grants` · `AICTE Grants` · `Consultancy Income` · `Research Grants` · `Rental Income` · `Interest Income` · `Donations` · `Sponsored Projects` · `Other Income`

### 11.5 Income categories (`income-revenue.category`)
`Academic` · `Non-Academic` · `Grants` · `Self-Generated` · `Endowment`

### 11.6 Income verification status (`income-revenue.verificationStatus`)
`Pending` · `Verified` · `Audited`

### 11.7 Recurring (`income-revenue.recurring`)
`Yes` · `No`

### 11.8 Expenditure heads (`expenditure.expenditureHead`)
`Salaries & Wages` · `Infrastructure Development` · `Equipment Purchase` · `Library Resources` · `Research & Development` · `Student Support` · `Maintenance & Repairs` · `Utilities` · `Travel & Conveyance` · `Printing & Stationery` · `Communication` · `Insurance` · `Depreciation` · `Miscellaneous`

### 11.9 Payment modes (`expenditure.paymentMode`)
`NEFT` · `RTGS` · `Cheque` · `Cash` · `DD` · `Online`

### 11.10 Expenditure status (`expenditure.status`)
`Pending` · `Processed` · `Paid` · `Rejected`

### 11.11 Funding agencies (`research-funding.fundingAgency`)
`DST` · `CSIR` · `UGC` · `AICTE` · `DBT` · `ICMR` · `DRDO` · `ISRO` · `Industry` · `International` · `State Government` · `Other`

### 11.12 Project status (`research-funding.projectStatus`)
`Submitted` · `Sanctioned` · `Ongoing` · `Completed` · `Extended` · `Terminated`

### 11.13 UC submitted (`research-funding.utilizationCertificate`)
`Yes` · `No` · `Pending` · `N/A`

### 11.14 Scholarship categories (`scholarships.category`)
`Merit-based` · `Need-based` · `SC/ST` · `OBC` · `Minority` · `Sports` · `Differently Abled` · `Girl Child` · `Research Fellowship` · `International` · `Alumni Funded` · `Corporate Sponsored`

### 11.15 Scholarship funding sources (`scholarships.fundingSource`)
`Government` · `Institution` · `Private Donor` · `Corporate` · `Alumni` · `Trust/Foundation` · `International Agency`

### 11.16 Scholarship status (`scholarships.status`)
`Open` · `Applications Closed` · `Under Review` · `Disbursed` · `Partially Disbursed` · `Cancelled`

### 11.17 Donation types (`endowments-donations.donationType`)
`Endowment` · `One-time Donation` · `Recurring Donation` · `In-kind` · `Corpus Fund` · `Chair Professorship` · `Building/Infrastructure` · `Equipment`

### 11.18 Donor categories (`endowments-donations.donorCategory`)
`Alumni` · `Corporate` · `Individual` · `Trust/Foundation` · `Government` · `International` · `Parent`

### 11.19 Tax exemption (`endowments-donations.taxExemption`)
`Yes` · `No` · `N/A`

### 11.20 Endowment status (`endowments-donations.status`)
`Active` · `Matured` · `Partially Utilized` · `Fully Utilized` · `Dormant`

### 11.21 Audit types (`audit-reports.auditType`)
`Internal Audit` · `Statutory Audit` · `CAG Audit` · `Tax Audit` · `Special Audit` · `System Audit` · `Academic Audit` · `ISO Audit`

### 11.22 Audit opinions (`audit-reports.auditOpinion`)
`Unqualified` · `Qualified` · `Adverse` · `Disclaimer` · `Pending`

### 11.23 Audit status (`audit-reports.status`)
`In Progress` · `Completed` · `Report Submitted` · `Action Taken` · `Closed`

### 11.24 Asset types (`financial-assets.assetType`)
`Fixed Deposit` · `Mutual Fund` · `Government Securities` · `Bonds` · `Savings Account` · `Current Account` · `PPF` · `NSC` · `Gold` · `Property` · `Equipment` · `Vehicles`

### 11.25 Asset status (`financial-assets.status`)
`Active` · `Matured` · `Redeemed` · `Renewed` · `Under Lien`

### 11.26 Document status (supporting documents)
`Verified` · `Pending` · `Under Review` (✅ capitalized in this module)

### 11.27 Recent-activity type (dashboard)
`income` · `expense` · `audit` · `scholarship` · `investment` (✅ `RecentActivity.type`)

### 11.28 Document category ids (`financeDocumentCategories`)
`budget-approvals` · `audit-certificates` · `funding-sanctions` · `scholarship-records` · `donation-receipts` · `asset-registers` · `bank-statements` · `tax-returns` · `utilization-certificates` · `financial-statements` · `compliance-reports` · `investment-documents`

---

## 12. Pagination

| Table | Frontend behavior today | Backend requirement |
|-------|-------------------------|---------------------|
| Section record tables (8 tabs) | Client-side render of full in-memory array, "N records" badge | 🔶 Backend pagination recommended (Spring Page `{ content, page, size, totalElements, totalPages, number }`) |
| Supporting documents | Client-side filter of small mock arrays | 🔶 pagination (small volume) |
| Dashboard | Aggregates | aggregation endpoint, no pagination |

Use the existing AccreditPro Spring Page shape: `{ content, page, size, totalElements, totalPages, number, ... }`.

---

## 13. Search

| Screen | Search field(s) | Query param | Behavior |
|--------|-----------------|-------------|----------|
| Data tab tables | Free-text across **all row values** (✅ `Object.values(row).some(val => String(val).toLowerCase().includes(...))`) | `search` | 🔶 backend: substring/contains across text fields, case-insensitive |
| Supporting documents | `name` (✅ `doc.name.toLowerCase().includes(...)`) | `search` | contains, case-insensitive |

---

## 14. Filters

| Screen | Filter | Param | Allowed values | Optional |
|--------|--------|-------|----------------|----------|
| Section lists | Financial Year | `financialYear` | `2024-25` etc. (tabs: budget-allocation, income-revenue, expenditure, audit-reports) | ✅ 🔶 no UI filter today |
| Section lists | Academic Year | `academicYear` | `2024-25` etc. (tab: scholarships) | ✅ 🔶 |
| Documents | Category | `category` | 12 category ids (§11.28) | ✅ |

No other frontend filters exist (no status/department filter dropdowns anywhere in this module).

---

## 15. Sorting

No sort UI exists in the Finance Coordinator frontend. 🔶 Backend default sort per section (e.g. by primary key, `ASC`), with `sortBy`/`sortDirection` query params supported for consistency with the other repository controllers (which use `sortBy`/`sortDirection`, default `ASC`).

---

## 16. Entity & Relationship Requirements

```
Institution
   └── FinanceCoordinator (User, role FINANCE_COORDINATOR)
         ├── BudgetAllocation          (financialYear + department + budgetHead)
         ├── IncomeRevenue             (financialYear + revenueSource)
         ├── Expenditure               (financialYear + expenditureHead + department)
         ├── ResearchFunding           (project + PI + fundingAgency)
         ├── Scholarship               (academicYear + category + fundingSource)
         ├── EndowmentDonation         (donor + donationType)
         ├── AuditReport               (financialYear + auditType)
         ├── FinancialAsset            (assetType + institution)
         └── FinanceDocument           (category) → evidence/audit trail
```

| Resource | Owner | Institution rel. | Department rel. | Parent | Child / referenced entities |
|----------|-------|------------------|-----------------|--------|-----------------------------|
| BudgetAllocation | Finance Coordinator (creates/edits) | ✅ `institutionId` (derived from auth) | 🔶 `department` is a **free-text field**, not a validated reference | Institution | financial year; budget head |
| IncomeRevenue | FC | ✅ | none | Institution | financial year |
| Expenditure | FC | ✅ | 🔶 free-text `department`; `budgetHead` free text (🔶 could reference budget head master) | Institution | financial year |
| ResearchFunding | FC | ✅ | 🔶 free-text `department` | Institution | PI (🔶 could reference Faculty entity) |
| Scholarship | FC | ✅ | none | Institution | academic year; funding source |
| EndowmentDonation | FC | ✅ | none | Institution | donor |
| AuditReport | FC | ✅ | none | Institution | financial year; auditor firm |
| FinancialAsset | FC | ✅ | none | Institution | bank/institution |
| FinanceDocument | FC (upload) | ✅ | none | Institution | category id |

**Cross-entity observations (✅ from UI):** `expenditure.budgetHead` text matches `budget-allocation.budgetHead` options (Salaries, Equipment, Library, Maintenance…) — 🔶 backend may validate consistency. No master-data dropdowns are used in this module (all `department`/`approvedBy`/`vendorPayee` values are free text).

---

## 17. Institution / Department Data Isolation

| Concern | Rule |
|---------|------|
| **Institution isolation** | All endpoints must scope queries by `institutionId` **derived from the authenticated user** — never from request body/params. The coordinator must never see another institution's financial data. |
| **Department isolation** | 🔶 This role is institution-wide. `department` is a record *field* (budget-allocation, expenditure, research-funding), not a scope dimension — the coordinator sees all departments. |
| **Cross-role access** | Route restricted to `FINANCE_COORDINATOR` only (✅). No other role is wired to this page. |

---

## 18. File Upload / Download APIs

| Concern | Value |
|---------|-------|
| **Evidence upload (documents)** | `POST /documents` — `multipart/form-data`; accepted `.pdf .docx .zip .png .jpg .jpeg .xlsx .csv`; **10 MB max** (✅ `EvidenceUploadDialog`) |
| **Evidence download** | `GET /documents/{id}/download` — binary |
| **Evidence preview** | Frontend previews via eye buttons; backend should return a URL or the file stream |
| **CSV template / CSV upload** | 🔶 Optional — page-header buttons ("Export", "CSV Upload") have **no `onClick` handlers** today (inert) |
| **File metadata** | `name`, `category`, `type`, `uploadedBy`, `uploadDate`, `size`, `status` |
| **Authorization** | All upload/download require FC role + institution scope; `Verified`/`Under Review` status set by external verification workflow, not the coordinator |

---

## 19. Dashboard APIs

| Displayed value | Frontend source today | Backend source (🔶) |
|-----------------|------------------------|---------------------|
| 8 KPI cards (Total Budget ₹18.5 Cr, Total Revenue ₹63.3 Cr, …) | hardcoded `kpiCards` array | aggregation across the 8 section tables + documents |
| Financial Health Indicators (6) | hardcoded array | computed ratios (budget utilization, revenue collection, expenditure control, audit compliance, asset growth, scholarship coverage) |
| Recent Activities (8) | hardcoded `recentActivities` | 🔶 audit log / recent add-edit-upload events, type `income` \| `expense` \| `audit` \| `scholarship` \| `investment` |

A single `GET /dashboard` aggregation endpoint is recommended (endpoint #1) — consistent with the other role contracts.

---

## 20. Reports / Export APIs

- The Finance Coordinator frontend has an **"Export" button** in each data-tab header, but it has **no `onClick` handler** (inert — see §22 gap #1).
- No PDF/Excel/CSV export, no report generation exists in this module.
- 🔶 If the Export button is meant to download the current table as CSV/Excel, a backend export endpoint (`GET /sections/{tabId}/export?format=csv|xlsx`) would be needed — **requires business confirmation**.

---

## 21. Mock Data Replacement Map

| # | Mock source | File | Used by | Fields | Intended backend source | Proposed API |
|---|-------------|------|---------|--------|-------------------------|--------------|
| 1 | `financeTabConfigs` (8 tabs: fields + sampleData) | `finance-configs.ts` | All data tabs | see §4.3 | per-tab DB tables | GET/POST/PUT/DELETE `/sections/{tabId}` |
| 2 | `financeDocumentCategories` (12) | `finance-configs.ts` | Documents view | id, label, count | documents grouped by category | GET `/documents` |
| 3 | `sampleDocuments` (3 categories) | `FinanceDocumentsView.tsx` | Documents list | id, name, type, uploadedBy, uploadDate, size, status | document store | GET `/documents`, POST `/documents`, GET `/documents/{id}/download` |
| 4 | `kpiCards` (8) | `FinanceDashboard.tsx` | Dashboard | title, value, change, changeType | computed financial aggregation | GET `/dashboard` |
| 5 | Financial Health Indicators (6) | `FinanceDashboard.tsx` | Dashboard | label, value | computed ratios | GET `/dashboard` |
| 6 | `recentActivities` (8) | `FinanceDashboard.tsx` | Dashboard | id, action, details, timestamp, type | activity/audit log | GET `/dashboard` |
| 7 | In-memory `tableData` (add/edit/delete) | `FinanceRepositoryPage.tsx` | 8 data tabs | per-tab rows | section DB tables | GET/POST/PUT/DELETE `/sections/{tabId}` |
| 8 | `EvidenceUploadDialog` uploads | shared component | Documents view | `UploadedFile` | document store | POST `/documents` |

---

## 22. Frontend Contract Gaps

1. **⚠️ Inert header buttons.** The "Export" and "CSV Upload" buttons in every data-tab header have **no `onClick` handlers** (`FinanceRepositoryPage.tsx`). There is no CSV import flow and no export flow today. Decide whether these are placeholders for future features (then contract §9.7/§9.8/§20) or should be removed.
2. **Dashboard is 100% hardcoded.** KPI cards, Financial Health Indicators, and Recent Activities are hardcoded arrays in `FinanceDashboard.tsx` with no backing mock object — backend must derive these and the frontend must be updated to consume them.
3. **Documents view ignores read-only mode.** The data tabs gate write actions via `useReadOnly()` (`isReadOnly`), but `FinanceDocumentsView` always shows the "Upload Document"/"Upload" buttons regardless of impersonation state — inconsistent behavior worth noting.
4. **No row IDs in mock data.** `sampleData` rows have no `id` field — the frontend indexes rows by array position for edit/delete. The `handleSave` edit logic uses an `Object.keys(r).every(...)` identity heuristic that only works for unchanged rows. Backend must assign stable IDs; frontend must switch to id-based updates when wired.
5. **Yes/No strings vs booleans.** `recurring`, `taxExemption`, `utilizationCertificate` use select options `['Yes','No',…]` (strings). Backend DTOs should mirror strings (or convert on wire) — do not silently switch to JSON booleans.
6. **Currency/percentage as strings vs numbers.** State stores numbers, but the edit form converts currency/percentage to `Number(...)` on change while text stays string — mixed typing in `Record<string, string | number>`. Backend returns numbers for currency/percentage fields.
7. **`department` is free text.** Used across three tabs without master-data validation — backend either treats it as free text or introduces a department reference (⚠️ decision).
8. **Document status casing is inconsistent with other modules.** This module uses `Verified | Pending | Under Review` (capitalized) while shared `EvidenceDocument` uses lowercase (`verified | pending | uploaded | rejected`). Align when wiring.
9. **No financial-year selector.** Unlike other modules, there is no global FY selector — `financialYear` is a per-record field (`'2024-25'` in samples). `financialYear` query filtering is 🔶 optional.
10. **Document category counts are hardcoded** (8/12/15/20/10/6/24/8/14/4/7/16) and only 3 of 12 categories have mock documents — the other 9 show "No documents found" when opened.

---

## 23. Business Rules Requiring Confirmation

1. **Export/CSV buttons** — are "Export" and "CSV Upload" intended features? If so, what formats (CSV/Excel) and what upload validation flow?
2. **Record workflow** — do financial records flow through an approval chain (e.g. Finance Committee / Registrar approve budgets & expenditures)? The UI has status fields (`Approved`/`Paid`/`Processed`) but no status-transition UI. Which statuses may the coordinator set directly?
3. **Document verification** — who advances document `status` from `Pending` to `Verified`/`Under Review`? (The coordinator uploads; verification appears external.)
4. **Soft vs hard delete** — for records and documents (existing department-coordinator controllers soft-delete).
5. **Computed-field validation** — should backend validate `utilizationPercentage` against `allocatedAmount`/`utilizedAmount` (e.g. percent = utilized/allocated × 100), `expenditure.amount` against budget allocation, `annualInterest` against `corpusValue`?
6. **Financial-year semantics** — is data yearly-snapshot (one row set per FY) or cumulative append?
7. **Currency precision** — amounts are INR integers in sample data (e.g. `1500000`); confirm integer-only vs decimal (paise) precision.
8. **Audit-report linkage** — should `audit-reports` rows link to uploaded audit documents (category `audit-certificates`), and `research-funding`/`scholarships` link to `funding-sanctions`/`scholarship-records` documents?
9. **Recent activities source** — is there an audit-log/activity feed in the backend, or should the dashboard derive activities from record timestamps (created/updated dates)? Sample data has no created/updated timestamps.
10. **KPI definitions** — exact formulas for the 8 KPI values and 6 financial-health indicators (Total Budget, Revenue, Expenditure, Research Funding, Scholarships, Endowments, Audit Compliance, Assets) need business sign-off.

---

## 24. Backend Implementation Checklist

### Controllers
- [ ] `FinanceCoordinatorController` — `@RequestMapping("/api/v1/finance-coordinator")`, `@Tag(name = "Finance Coordinator")`
- [ ] `GET /dashboard`, `GET /documents`, `POST /documents`, `GET /documents/{id}/download`, `DELETE /documents/{id}`
- [ ] Generic section controller: `GET/POST /sections/{tabId}`, `GET/PUT/DELETE /sections/{tabId}/{id}` (8 tab ids validated against an allowed set)
- [ ] Optional: `GET /sections/{tabId}/template`, `POST /sections/{tabId}/upload`, `GET /sections/{tabId}/export`

### DTOs
- [ ] 8 section request/response DTOs (or one generic `Map`-based DTO validated against tab config — prefer explicit DTOs for integrity)
- [ ] `DashboardResponse`, `DocumentResponse`, `DocumentUploadResponse`, `CsvValidationResponse`
- [ ] Field names exactly as §4.3 (camelCase); currency/percentage as numbers; Yes/No strings preserved

### Services
- [ ] `FinanceCoordinatorService` — section CRUD (institution-scoped), dashboard aggregation, document management
- [ ] Section metadata registry (field configs, select options, required fields) matching §4.3/§11
- [ ] Dashboard aggregation: KPI formulas, financial-health ratios, recent activities
- [ ] Optional CSV validator mirroring frontend rules (required, numeric, date, select membership)

### Repositories
- [ ] Per-section repositories (or a single generic `FinanceRecord` table keyed by `sectionType` 🔶)
- [ ] `FinanceDocumentRepository` (category, status, uploader, institution)
- [ ] Query scoping by `institutionId` on every repository

### Entities
- [ ] 8 section entities (or generic section entity + JSON/column fields 🔶)
- [ ] `FinanceDocument` entity; optional `FinanceActivity` (recent activities)
- [ ] Institution relationship column on every entity

### Enums
- [ ] `FinanceSectionType` (8 ids), `DocumentStatus` (`Verified|Pending|Under Review`)
- [ ] Section status enums from §11 (budget status, payment mode, project status, audit opinion, asset status, etc.)

### Database
- [ ] Schema for 8 section tables (or generic), documents table, optional activity table
- [ ] Institution-scoped indexes; `financialYear`/`academicYear` columns where applicable

### Flyway Migrations
- [ ] `V__finance_sections.sql` (or per-section tables)
- [ ] `V__finance_documents.sql`, optional `V__finance_activities.sql`

### Security
- [ ] Role guard `FINANCE_COORDINATOR`
- [ ] Institution scope derived from JWT context — never from request params
- [ ] Write-boundary: coordinator cannot set document `Verified`/`Under Review` if that state is audit-owned

### Tests
- [ ] Controller tests per endpoint group (dashboard, section CRUD, documents)
- [ ] Service tests: aggregation math, scope isolation, validation
- [ ] Security integration tests: cross-institution access denied, role guard
- [ ] Migration tests

---

## 25. Quality Check

- [x] Every Finance Coordinator screen identified (10 views)
- [x] Every route identified (`/app/finance-repository`)
- [x] Every major component traced (page, dashboard, documents view)
- [x] Every relevant type/config file identified (`finance-configs.ts`)
- [x] Every service file identified (none — verified 0 API calls)
- [x] Every mock data source identified (§21 — 8 entries)
- [x] Every user action mapped (load, search, add, edit, delete, upload, download)
- [x] Every required endpoint documented (12 templates / 8×8 section routes + shared)
- [x] Request DTOs documented (§4.3, §10)
- [x] Response DTOs documented (§9)
- [x] Every enum documented (§11 — 28 enums)
- [x] Search documented (§13)
- [x] Filters documented (§14)
- [x] Sorting documented (§15)
- [x] Pagination documented (§12)
- [x] File operations documented (§18)
- [x] Dashboard documented (§19)
- [x] Reports/exports documented (§20 — none required; buttons inert)
- [x] Institution isolation documented (§17)
- [x] Department isolation documented (§17)
- [x] Entity relationships documented (§16)
- [x] Authentication documented (§7)
- [x] Authorization documented (§7)
- [x] Frontend/backend gaps documented (§22 — 10 gaps)
- [x] Business-rule uncertainties documented (§23 — 10 items)
- [x] No frontend files modified

---

## Summary

- **Finance Coordinator screens found:** 10 (1 route `/app/finance-repository`, internal state switching)
- **Frontend type/config files found:** 1 primary (`finance-configs.ts`) + shared `EvidenceUploadDialog` types
- **Service/API files found:** 0 dedicated to this role
- **Existing API calls found:** 0 (100% mock / in-memory data)
- **Required endpoints:** 12 endpoint templates → **61 concrete routes** (7 section endpoints × 8 tabs + 5 shared routes)
- **Mock data sources:** 8 catalogued (§21)
- **Contract gaps:** 10 (§22)
- **Business rules requiring confirmation:** 10 (§23)

# Head of the Department — API Contract

> **Document type:** Backend API contract (analysis-only, reverse-engineered from the existing frontend)
> **Frontend source of truth:** `frontend/src/pages/hod-dashboard/**`, `frontend/src/layouts/HODLayout.tsx`, `frontend/src/App.tsx`
> **Status legend:** ✅ **CONFIRMED FROM FRONTEND** · 🔶 **INFERRED** · ⚠️ **REQUIRES BUSINESS CONFIRMATION**
> **Rule applied:** The frontend is READ-ONLY for this task. No frontend files were modified.

---

## 1. Purpose

This document defines the backend REST API contract required to make the existing **Head of the Department (HOD)** frontend fully functional.

The HOD frontend is currently **100 % mock-data driven** — every one of the 8 HOD views reads data from the static dataset in `frontend/src/pages/hod-dashboard/hod-configs.ts` (plus two Redux slices for cross-role state). There are **zero** HTTP/API calls inside the HOD pages today.

Because the frontend is the source of truth and it consumes mock data, this contract describes the API surface the frontend **implicitly requires**. Every proposed endpoint is therefore marked **🔶 INFERRED** (derived from what the screens actually read), with field names copied **verbatim** from the frontend TypeScript interfaces.

The backend developer should implement the endpoints below so that the mock consumers (`getHODYearData(year)` and the Redux slices) can be swapped for real API responses **without any frontend field renames**.

---

## 2. Frontend Source of Truth

Files analysed for this contract:

### Routes & Layout
| File | Role |
|------|------|
| `frontend/src/App.tsx` | Route registration: `/app/hod-dashboard`, guarded by `UserRole.HEAD_OF_DEPARTMENT` |
| `frontend/src/layouts/HODLayout.tsx` | HOD shell: sidebar navigation (8 views), academic-year badge, user card, theme/logout |

### HOD Pages & Components
| File | View |
|------|------|
| `frontend/src/pages/hod-dashboard/HODDashboardPage.tsx` | Single route component that switches on `?view=` query param |
| `frontend/src/pages/hod-dashboard/hod-configs.ts` | **All mock data + all HOD TypeScript interfaces** (types, year data builders) |
| `frontend/src/pages/hod-dashboard/components/HODDashboard.tsx` | View: Dashboard |
| `frontend/src/pages/hod-dashboard/components/EvidenceReview.tsx` | View: Evidence Review |
| `frontend/src/pages/hod-dashboard/components/ApprovalQueue.tsx` | View: Approval Queue |
| `frontend/src/pages/hod-dashboard/components/GapAnalysis.tsx` | View: Gap Analysis |
| `frontend/src/pages/hod-dashboard/components/RepositoryReadiness.tsx` | View: Repository Readiness |
| `frontend/src/pages/hod-dashboard/components/DepartmentAnalytics.tsx` | View: Department Analytics |
| `frontend/src/pages/hod-dashboard/components/ReportsModule.tsx` | View: Reports |
| `frontend/src/pages/hod-dashboard/components/ActivityTimeline.tsx` | View: Activity Timeline |
| `frontend/src/pages/hod-dashboard/components/AccreditationReadiness.tsx` | Dashboard sub-widget: NAAC/NBA/NIRF readiness |
| `frontend/src/pages/hod-dashboard/components/IQACObservationsWidget.tsx` | Dashboard sub-widget: department IQAC observations |
| `frontend/src/pages/hod-dashboard/components/evidence-utils.tsx` | Presentation helpers; mock preview/download generators (jsPDF/SVG) |

### Types, Store & Shared Hooks
| File | Role |
|------|------|
| `frontend/src/types/auth.types.ts` | `UserRole`, `User`, `ApiResponse<T>` envelope |
| `frontend/src/store/slices/evidenceReviewSlice.ts` | HOD review decisions (Redux + localStorage), key `year::repository::section::category` |
| `frontend/src/store/slices/iqacVerificationSlice.ts` | IQAC verification observations (seeded mock) consumed by `IQACObservationsWidget` |
| `frontend/src/store/slices/uiSlice.ts` | `selectedAcademicYear` (global AY selector) |
| `frontend/src/pages/iqac-dashboard/verification-data.ts` | `EvidenceObservation` interface (cross-module type consumed by HOD widget) |
| `frontend/src/pages/iqac-dashboard/types.ts` | `ObservationPriority`, `ObservationStatus` enums |
| `frontend/src/hooks/useAuth.ts` / `useReadOnly.ts` | Auth context; impersonation read-only flag |
| `frontend/src/components/shared/EvidencePreviewDialog.tsx` | Evidence preview dialog (used by Evidence Review / Approval Queue) |

---

## 3. HOD Screen Inventory

There is **one route** (`/app/hod-dashboard`) that renders **eight views** selected via `?view=` query parameter (`HODDashboardPage.tsx`). Default view: `dashboard`.

| # | Screen | Route | Main Component | Purpose |
|---|--------|-------|----------------|---------|
| 1 | HOD Dashboard | `/app/hod-dashboard?view=dashboard` | `HODDashboard.tsx` | Department overview: KPI cards, repository completion, accreditation readiness, IQAC observations, AI insights, recent activity |
| 2 | Evidence Review | `/app/hod-dashboard?view=evidence` | `EvidenceReview.tsx` | Review & decide on evidence documents (approve / reject / request changes), grouped by repository → section |
| 3 | Approval Queue | `/app/hod-dashboard?view=approvals` | `ApprovalQueue.tsx` | Pending approvals per section/category, incl. bulk "Approve all" per section |
| 4 | Gap Analysis | `/app/hod-dashboard?view=gaps` | `GapAnalysis.tsx` | Repository data gaps with NAAC/NBA/NIRF impact + recommendations |
| 5 | Repository Readiness | `/app/hod-dashboard?view=readiness` | `RepositoryReadiness.tsx` | Weighted readiness score, per-repository breakdown, 5-year trends |
| 6 | Department Analytics | `/app/hod-dashboard?view=analytics` | `DepartmentAnalytics.tsx` | KPIs (faculty, students, research, placements, pass %, publications, patents, projects), qualification/performance/research charts, 5-year growth |
| 7 | Reports | `/app/hod-dashboard?view=reports` | `ReportsModule.tsx` | Generate/download/print/email department reports; recent reports list |
| 8 | Activity Timeline | `/app/hod-dashboard?view=activity` | `ActivityTimeline.tsx` | Chronological activity feed with type/repository filters |

**Shared page-level UI (all views):**
- Global **Academic Year selector** (`Select`) — drives `?view=` content via `selectedAcademicYear` (Redux `uiSlice`). Options are the static `ACADEMIC_YEARS` list (7 years, `2025-26` … `2019-20`), with `2025-26` hardcoded as "(Current)".
- Sidebar badges in `HODLayout`: pending evidence count, gap count — computed client-side from `getHODYearData(...)`.

---

## 4. Frontend Type Inventory

All HOD-specific types live in **`frontend/src/pages/hod-dashboard/hod-configs.ts`**. Field names are **exact** — the backend DTOs must use these camelCase names.

| Type | File | Used By | Fields |
|------|------|---------|--------|
| `RepositoryStatus` | `hod-configs.ts` | Dashboard, Readiness | `id: string`, `name: string`, `owner: string`, `completion: number`, `evidence: number`, `verification: number`, `pendingTasks: number`, `status: 'on-track' \| 'at-risk' \| 'critical' \| 'completed'` |
| `EvidenceItem` | `hod-configs.ts` | Evidence Review, Approval Queue, Dashboard counts | `id: string`, `repository: string`, `section: string`, `uploadedBy: string`, `documentName: string`, `documentCategory: string`, `uploadDate: string` (`YYYY-MM-DD`), `status: 'pending' \| 'approved' \| 'rejected' \| 'changes-requested'`, `fileType: 'pdf' \| 'image' \| 'doc' \| 'excel'`, `fileSize: string`, `version: string` (e.g. `v1.0`), `reviewNote?: string`, `reviewedBy?: string`, `reviewDate?: string`, `history: EvidenceVersion[]` |
| `EvidenceVersion` | `hod-configs.ts` | Version-history dialog | `version: string`, `date: string`, `actor: string`, `note: string` |
| `AccreditationImpact` | `hod-configs.ts` | Gap Analysis | `criterion: string`, `impact: string` |
| `GapAccreditation` | `hod-configs.ts` | Gap Analysis | `naac: AccreditationImpact`, `nba: AccreditationImpact`, `nirf: AccreditationImpact` |
| `GapItem` | `hod-configs.ts` | Gap Analysis | `id: string`, `category: string`, `description: string`, `repository: string`, `section: string`, `severity: 'critical' \| 'high' \| 'medium' \| 'low'`, `impact: string`, `recommendation: string`, `accreditation: GapAccreditation` |
| `ActivityItem` | `hod-configs.ts` | Activity Timeline, Dashboard recent activity | `id: string`, `type: 'submitted' \| 'uploaded' \| 'approved' \| 'rejected' \| 'commented' \| 'returned' \| 'verified'`, `description: string`, `user: string`, `timestamp: string` (ISO 8601), `repository: string` |
| `ReadinessData` | `hod-configs.ts` | Readiness, Dashboard KPIs | `repository: string`, `weight: number`, `dataCompletion: number`, `evidenceCompletion: number`, `verification: number`, `approval: number` |
| `AnalyticsData` | `hod-configs.ts` | Department Analytics | `facultyCount: number`, `students: number`, `research: number`, `placements: number`, `passPercentage: number`, `publications: number`, `patents: number`, `projects: number` |
| `YearlyTrend` | `hod-configs.ts` | Readiness 5-year table, Analytics growth | `year: string`, `academic: number`, `faculty: number`, `student: number`, `research: number`, `alumni: number` |
| `AiInsight` | `hod-configs.ts` | Dashboard AI Insights panel | `id: string`, `title: string`, `description: string`, `type: 'warning' \| 'critical' \| 'success' \| 'info'` |
| `AccreditationCriterion` | `hod-configs.ts` | AccreditationReadiness | `name: string`, `weightage: number`, `completion: number`, `status: 'ready' \| 'in-progress' \| 'not-started'` |
| `AccreditationFrameworkData` | `hod-configs.ts` | AccreditationReadiness | `id: 'naac' \| 'nba' \| 'nirf'`, `name: string`, `readiness: number`, `status: 'ready' \| 'in-progress' \| 'not-started'`, `criteria: AccreditationCriterion[]` |
| `HODYearData` | `hod-configs.ts` | All views (via `getHODYearData`) | `repositoryOverview: RepositoryStatus[]`, `readiness: ReadinessData[]`, `evidence: EvidenceItem[]`, `gaps: GapItem[]`, `analytics: AnalyticsData`, `activities: ActivityItem[]`, `insights: AiInsight[]`, `health: number`, `accreditation: AccreditationFrameworkData[]` |
| `EvidenceReviewEntry` | `store/slices/evidenceReviewSlice.ts` | Evidence Review / Approval Queue decisions | `status: EvidenceReviewStatus`, `note?: string`, `reviewedBy?: string`, `reviewDate?: string` |
| `EvidenceObservation` | `pages/iqac-dashboard/verification-data.ts` | IQACObservationsWidget | `id`, `documentId`, `documentName`, `department` (code, e.g. `CSE`), `repository`, `folder`, `category`, `faculty?`, `student?`, `title`, `priority`, `description`, `recommendedCorrection`, `dueDate`, `status`, `raisedBy`, `raisedAt`, `response?`, `respondedAt?`, `verifiedAt?` |
| `User` | `types/auth.types.ts` | Layout, widget dept resolution | `id`, `email`, `firstName`, `lastName`, `role`, `avatar?`, `institutionId: number \| null`, `institutionName: string \| null`, `department: string \| null`, `departmentId: number \| null` |

**Component-local static arrays (not in types, but rendered):**
- `DepartmentAnalytics.tsx`: `facultyQualification` `[{qualification, count, percentage}]`, `studentPerformance` `[{category, percentage}]`, `researchMetrics` `[{metric, value, target}]`
- `ReportsModule.tsx`: `recentReports` `[{name, generatedOn, format, size}]`
- `RepositoryReadiness.tsx`: "YoY Improvement" card value `+12%` (hardcoded)
- `hod-configs.ts`: `reportTypes` `[{id, name, description, icon}]`

---

## 5. Frontend Service Inventory

| Service | File | Function | HTTP Method | Existing Endpoint | Used By |
|---------|------|----------|-------------|-------------------|---------|
| — *(none)* | `hod-dashboard/**` | — | — | — | **No service/API layer exists for any HOD view.** All data comes from `getHODYearData()` mock data, Redux slices, or localStorage |
| `auth.service.ts` | `frontend/src/services/auth.service.ts` | login / me | POST / GET | `/api/auth/login`, `/api/auth/me` | Indirect (app-wide `useAuth`; HOD pages only read `user`) |
| `impersonation.service.ts` | `frontend/src/services/impersonation.service.ts` | impersonation label map | — | — | Indirect (read-only banner) |

**Existing API calls:** `0` inside HOD pages. The only live calls in the HOD flow are the global auth calls (`/api/auth/login`, `/api/auth/me`) made by `useAuth`, plus impersonation APIs used by Super Admin.

---

## 6. Global API Specifications

**Base Endpoint Path:** `/api/v1/head-of-department` (consistent with the existing `/api/v1/examination-officer` convention; alternative nesting `/api/v1/departments/{departmentId}/hod/...` exists in the department-coordinator docs but is **not** used here to keep the HOD surface self-contained).

**Swagger Tag:** `HOD - Department Overview` (one tag; sub-resources documented under it)

**Authentication Header:** `Authorization: Bearer <jwt-token>`

**Role Guard:** `HEAD_OF_DEPARTMENT`

**Content-Type:** `application/json` for all JSON bodies/responses; `multipart/form-data` and `application/octet-stream` only where specified (report download).

### Standard Query Parameters for GET (List) Endpoints
| Parameter      | Type    | Required | Default    | Description |
|----------------|---------|----------|------------|-------------|
| `academicYear` | String  | Optional | `"2025-26"` | Filter by academic year (pattern `^\d{4}-\d{2}$`) |
| `page`         | Integer | Optional | `0`        | Zero-based page index |
| `size`         | Integer | Optional | `20`       | Records per page |
| `search`       | String  | Optional | —          | Client-side today; backend search recommended (see §13) |
| `status`       | String  | Optional | —          | Evidence status filter |
| `repository`   | String  | Optional | —          | Repository filter (short name, e.g. `Academic`) |

### Standard Response Structure (matches `ApiResponse<T>` in `types/auth.types.ts`)
**1. Single object / mutation:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { },
  "timestamp": "2026-08-01T12:00:00"
}
```

**2. Paginated list (`Page<T>` — Spring Page shape used by the Examination Officer contract):**
```json
{
  "success": true,
  "message": "Records retrieved successfully",
  "data": {
    "content": [ ],
    "totalPages": 1,
    "totalElements": 50,
    "number": 0,
    "size": 20
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

**3. Error:**
```json
{
  "success": false,
  "message": "Validation failed: 'note' is required for rejection",
  "data": null,
  "timestamp": "2026-08-01T12:00:00"
}
```

### Conventions
- **Date format:** `YYYY-MM-DD` (frontend uses e.g. `uploadDate: '2024-12-15'`, `dueDate`)
- **DateTime format:** ISO 8601 (`2024-12-15T10:30:00Z`) — `ActivityItem.timestamp`
- **IDs:** String UUIDs recommended; frontend mock ids are opaque strings (`2025-26-e1`, `2025-26-g1`, `2025-26-act1`)
- **Enums:** JSON strings using the **exact frontend values** (e.g. `"changes-requested"`, `"on-track"`)

---

## 7. Authentication & Authorization

| Aspect | Contract |
|--------|----------|
| Authentication | Bearer JWT via `Authorization` header (existing AccreditPro auth flow) |
| Authorization | **Role check:** `HEAD_OF_DEPARTMENT` on every endpoint |
| Institution scope | **Derived from authenticated user context** (`institutionId`) — never from query/body params |
| Department scope | **Derived from authenticated user context** (`departmentId` / `department`) — every list/detail endpoint must filter by the HOD's department |
| Cross-institution safety | Mandatory: HOD must never see another institution's data. Do not trust `institutionId`/`departmentId` sent by the client for authorization |
| Impersonation | Super Admin impersonation already exists in the app; backend should accept the same JWT (role of impersonated user). Read-only enforcement is client-side today (🔶 INFERRED: optional backend `readOnly` flag per request) |
| HOD identity for audit | Review actions must record the authenticated user as `reviewedBy` (frontend shows `HOD_NAME` mock `"Dr. Suresh Patil (HOD)"` — the real value should be the JWT user's full name) |

---

## 8. API Endpoint Summary

| # | Method | Endpoint | Screen | Action | Auth | Notes |
|---|--------|----------|--------|--------|------|-------|
| 1 | GET | `/api/v1/head-of-department/dashboard` | Dashboard | Load dashboard aggregate | HOD | 🔶 INFERRED — aggregates repository overview, readiness, health, insights, recent activities, accreditation, observations |
| 2 | GET | `/api/v1/head-of-department/evidence` | Evidence Review / Approval Queue | List evidence (filters + pagination) | HOD | 🔶 INFERRED — replaces `yearData.evidence` |
| 3 | GET | `/api/v1/head-of-department/evidence/{id}` | Evidence Review | Evidence detail incl. version history | HOD | 🔶 INFERRED (optional — list response already embeds history) |
| 4 | POST | `/api/v1/head-of-department/evidence/{id}/review` | Evidence Review / Approval Queue | Approve / reject / request changes | HOD | 🔶 INFERRED — maps to `setReview` + local state mutation |
| 5 | POST | `/api/v1/head-of-department/evidence/bulk-review` | Approval Queue | Bulk approve a section | HOD | 🔶 INFERRED — maps to `approveSection()` ("Approve all (n)") |
| 6 | GET | `/api/v1/head-of-department/evidence/{id}/download` | Evidence Review / Approval Queue | Download evidence file | HOD | 🔶 INFERRED — today `downloadItem()` generates a fake jsPDF/SVG file client-side |
| 7 | GET | `/api/v1/head-of-department/gaps` | Gap Analysis | List gaps (filters) | HOD | 🔶 INFERRED — replaces `yearData.gaps` |
| 8 | GET | `/api/v1/head-of-department/readiness` | Repository Readiness | Readiness rows + yearly trends | HOD | 🔶 INFERRED — replaces `yearData.readiness` + `yearlyTrends` |
| 9 | GET | `/api/v1/head-of-department/analytics` | Department Analytics | KPIs + analytics distributions + trends | HOD | 🔶 INFERRED — replaces `yearData.analytics` (+ component-local arrays) |
| 10 | GET | `/api/v1/head-of-department/activities` | Activity Timeline / Dashboard | Activity feed (filters + pagination) | HOD | 🔶 INFERRED — replaces `yearData.activities`; "Load More" is a pagination hint |
| 11 | GET | `/api/v1/head-of-department/reports` | Reports | Report type list + recent reports | HOD | 🔶 INFERRED — replaces `reportTypes` + `recentReports` |
| 12 | POST | `/api/v1/head-of-department/reports/generate` | Reports | Generate & download report | HOD | 🔶 INFERRED — "Generate & Download" button (no handler today) |
| 13 | POST | `/api/v1/head-of-department/reports/{reportId}/email` | Reports | Email a generated report | HOD | 🔶 INFERRED — "Email Report" button (no handler today) |

**Not required (frontend-only / static):**
- Academic-year selector values — static config (`ACADEMIC_YEARS`). No API needed (optional `GET /academic-years` if it must become dynamic — 🔶 INFERRED, not required).
- Theme toggle, sidebar collapse, view switching — `FRONTEND ONLY — NO API REQUIRED`.
- Evidence **preview** dialog content — client-rendered; backend only needs to serve the file URL (`documentName`/`fileUrl`).

---

## 9. Detailed API Contracts

---

### 9.1 GET /api/v1/head-of-department/dashboard

**Purpose:** Load the Department Overview screen (and the data it shares with other views).

**Frontend Screen:** HOD Dashboard (`?view=dashboard`)
**Frontend Component:** `HODDashboard.tsx` (+ `AccreditationReadiness.tsx`, `IQACObservationsWidget.tsx`)
**Frontend Service:** None today — replaces `getHODYearData(academicYear)` subset: `repositoryOverview`, `readiness`, `insights`, `activities`, `health`, `accreditation`; plus evidence-derived counts and observations.

**Authentication:** Bearer JWT
**Authorization:** `HEAD_OF_DEPARTMENT`; data scoped to the HOD's institution + department (derived from JWT)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `academicYear` | String | No | Default `"2025-26"` |

**Response DTO: `HodDashboardResponseDTO`** (✅ field names from `HODYearData` + derived metrics)
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "academicYear": "2025-26",
    "health": 87,
    "repositoryOverview": [
      {
        "id": "1",
        "name": "Academic Repository",
        "owner": "Dr. Priya Sharma",
        "completion": 92,
        "evidence": 88,
        "verification": 85,
        "pendingTasks": 4,
        "status": "on-track"
      }
    ],
    "readiness": [
      {
        "repository": "Academic",
        "weight": 15,
        "dataCompletion": 92,
        "evidenceCompletion": 88,
        "verification": 85,
        "approval": 80
      }
    ],
    "evidenceSummary": {
      "total": 171,
      "pending": 42,
      "approved": 120,
      "rejected": 8,
      "changes": 16
    },
    "insights": [
      { "id": "1", "title": "Missing Evidence Alert", "description": "...", "type": "warning" }
    ],
    "activities": [
      {
        "id": "1",
        "type": "submitted",
        "description": "Value Added Courses data submitted for review",
        "user": "Dr. Priya Sharma",
        "timestamp": "2024-12-15T10:30:00Z",
        "repository": "Academic"
      }
    ],
    "accreditation": [
      {
        "id": "naac",
        "name": "NAAC",
        "readiness": 84,
        "status": "in-progress",
        "criteria": [
          { "name": "Curricular Aspects", "weightage": 150, "completion": 88, "status": "ready" }
        ]
      }
    ],
    "observations": [
      {
        "id": "vobs-1",
        "documentId": "doc-1",
        "documentName": "academic-calendar-2025-26.pdf",
        "department": "CSE",
        "repository": "Academic",
        "folder": "Academic Calendar",
        "category": "Department Academic Calendar PDF",
        "title": "CSE — Academic Calendar evidence needs correction",
        "priority": "high",
        "description": "Calendar dated 2023",
        "recommendedCorrection": "Upload current-year calendar",
        "dueDate": "2026-02-15",
        "status": "open",
        "raisedBy": "IQAC",
        "raisedAt": "2026-01-20T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

> ⚠️ `evidenceSummary` **values are illustrative only** — the backend must compute real counts from the evidence store. The key name `changes` mirrors the frontend's internal count key (`counts = { total, pending, approved, rejected, changes }` in `EvidenceReview.tsx` / `ApprovalQueue.tsx`); `changes` counts items with `status === 'changes-requested'`.

**Client-side derived values the backend must make possible (not necessarily precomputed):**
- KPI cards:
  - `Department Readiness` = `round(Σ((dataCompletion+evidenceCompletion+verification+approval)/4 × weight/100))` over `readiness`
  - `Evidence Completion` = average of `readiness[].evidenceCompletion`
  - `Verification` = average of `readiness[].verification`
  - `Pending Review` = count of evidence with `status === 'pending'`
  - `Approved Documents` = count of evidence with `status === 'approved'`
  - `Department Health` = `health`
- `AccreditationReadiness` delta ("vs previous year") requires the **previous academic year** (`academicYear` minus one from `ACADEMIC_YEARS`) readiness per framework — backend should return `previousReadiness` per framework **or** accept the frontend requesting each year separately. 🔶 INFERRED — the frontend currently computes this client-side from adjacent years in mock data; simplest backend contract is to return `previousYearReadiness` inside each framework object.

**Security / Institution scope:** All lists filtered to the authenticated HOD's institution + department.

---

### 9.2 GET /api/v1/head-of-department/evidence

**Purpose:** List evidence documents for review (used by both Evidence Review and Approval Queue views).

**Frontend Screen:** Evidence Review / Approval Queue
**Frontend Component:** `EvidenceReview.tsx`, `ApprovalQueue.tsx`
**Frontend Service:** None today — replaces `yearData.evidence`

**Authentication:** Bearer JWT
**Authorization:** `HEAD_OF_DEPARTMENT`; department-scoped

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `academicYear` | String | No | Default `"2025-26"` |
| `status` | String | No | `pending` \| `approved` \| `rejected` \| `changes-requested` |
| `repository` | String | No | Short repo name (`Academic`, `Course`, `Faculty`, `Student`, `Research`, `Student Dev`, `Infrastructure`, `Alumni`) |
| `search` | String | No | Client-side today — matches `documentName`, `documentCategory`, `section`, `repository`, `uploadedBy` |
| `page` / `size` | Integer | No | Pagination (frontend currently renders all; see §12) |

**Response DTO: `EvidenceItemResponseDTO`** (paginated)
```json
{
  "success": true,
  "message": "Evidence documents retrieved successfully",
  "data": {
    "content": [
      {
        "id": "2025-26-e1",
        "repository": "Academic",
        "section": "Academic Calendar",
        "uploadedBy": "Dr. Anita Sharma",
        "documentName": "Academic_Calendar_2025.pdf",
        "documentCategory": "Department Academic Calendar PDF",
        "uploadDate": "2025-12-01",
        "status": "pending",
        "fileType": "pdf",
        "fileSize": "1.2 MB",
        "version": "v1.0",
        "reviewNote": null,
        "reviewedBy": null,
        "reviewDate": null,
        "fileUrl": "https://storage.accreditpro.in/evidence/2025-26-e1.pdf",
        "history": [
          { "version": "v1.0", "date": "2025-12-01", "actor": "Dr. Anita Sharma", "note": "Original upload by Department Coordinator" }
        ]
      }
    ],
    "totalPages": 9,
    "totalElements": 171,
    "number": 0,
    "size": 20
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

> **`fileUrl`** is a 🔶 INFERRED addition: the frontend today synthesises fake preview/download files (`evidence-utils.tsx` → `jsPDF`/SVG blob URLs). For the real backend, each item must expose a downloadable `fileUrl`.

**Grouping contract (client-side today, backend must preserve the data shape):** items are grouped by `repository` then `section` (see `buildRepoGroups()`), with repo order fixed: `Academic, Course, Faculty, Student, Research, Student Dev, Infrastructure, Alumni`. Sections are free-form strings (e.g. `"Academic Calendar"`, `"Faculty Journal Publications"`, `"NSS Activities"` — full list in §17 mock audit).

---

### 9.3 GET /api/v1/head-of-department/evidence/{id}

**Purpose:** Fetch a single evidence document (optional; the list response already embeds `history` and all fields the UI renders).

**Path Parameters:** `id` (String UUID)

**Response DTO:** Single `EvidenceItemResponseDTO` (same shape as list items). ✅ CONFIRMED FROM FRONTEND — all fields the UI reads are in §9.2.

---

### 9.4 POST /api/v1/head-of-department/evidence/{id}/review

**Purpose:** Record the HOD decision on an evidence document (approve / reject / request changes). Replaces the client-side mutation in `EvidenceReview.applyAction()` / `ApprovalQueue.commitDecision()` and the `setReview` Redux dispatch.

**Frontend Screen:** Evidence Review / Approval Queue
**Frontend Component:** action dialogs (approve/reject/request changes)
**Frontend Service:** None today (local state + Redux + localStorage)

**Authentication:** Bearer JWT
**Authorization:** `HEAD_OF_DEPARTMENT`; evidence must belong to the HOD's department

**Path Parameters:** `id` (evidence document UUID)

**Request Body — `EvidenceReviewRequestDTO`:**
```json
{
  "action": "approve",
  "note": "Document is valid evidence for AY 2025-26."
}
```
| Field | Type | Required | Validation | Source |
|-------|------|----------|------------|--------|
| `action` | String | Yes | Enum: `"approve"` \| `"reject"` \| `"changes"` | ✅ frontend `action.type` |
| `note` | String | Yes for `reject`/`changes` | Optional for `approve`. Frontend blocks submit with `toast.error('Please add a reason before submitting')` when `type !== 'approve' && !note.trim()` | ✅ frontend validation |

**Behavioral contract (✅ from frontend):**
- `approve` → status `approved`; `reject` → `rejected`; `changes` → `changes-requested`.
- `reviewedBy` = authenticated HOD name; `reviewDate` = today (`YYYY-MM-DD`).
- A `history` entry is appended: `{ version: nextVersion, date: today, actor: HOD name, note: "Approved by HOD" | "Rejected by HOD" | "Changes requested by HOD" [— note] }`.
- `version` is incremented client-side as `v<major>.<minor+1>` from regex `^v(\d+)\.(\d+)$` (🔶 INFERRED backend rule: increment minor version on each review; **⚠️ REQUIRES BUSINESS CONFIRMATION** whether re-upload by coordinator should bump minor or major).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Evidence document approved successfully",
  "data": {
    "id": "2025-26-e1",
    "status": "approved",
    "version": "v1.1",
    "reviewNote": "Document is valid evidence for AY 2025-26.",
    "reviewedBy": "Dr. Suresh Patil",
    "reviewDate": "2026-08-01",
    "history": [
      { "version": "v1.0", "date": "2025-12-01", "actor": "Dr. Anita Sharma", "note": "Original upload by Department Coordinator" },
      { "version": "v1.1", "date": "2026-08-01", "actor": "Dr. Suresh Patil", "note": "Approved by HOD — Document is valid evidence for AY 2025-26." }
    ]
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

**Error Responses:**
- `400` — `action` invalid, or `note` missing for `reject`/`changes`
- `403` — evidence belongs to another department
- `404` — evidence id not found

**⚠️ REQUIRES BUSINESS CONFIRMATION:** valid status transitions (e.g. can an already-`approved` doc be re-reviewed after a coordinator edit?), and whether approval should be restricted to `pending` only (frontend only disables the button matching the *current* status, so `approved → rejected` etc. are technically possible today).

---

### 9.5 POST /api/v1/head-of-department/evidence/bulk-review

**Purpose:** Approve all pending documents in one repository section ("Approve all (n)" button in Approval Queue).

**Request Body — `EvidenceBulkReviewRequestDTO`:**
```json
{
  "repository": "Academic",
  "section": "Academic Calendar",
  "action": "approve",
  "note": ""
}
```
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `repository` | String | Yes | Short repo name |
| `section` | String | Yes | Section within the repository |
| `action` | String | Yes | `"approve"` (only approve is offered by the UI today) |
| `note` | String | No | Applied to each item |

**Success Response (200):** `data` = list of updated `EvidenceItemResponseDTO` (or a summary `{ approvedCount: n, items: [...] }`). 🔶 INFERRED response shape.

---

### 9.6 GET /api/v1/head-of-department/evidence/{id}/download

**Purpose:** Download an evidence file. Today `downloadItem()` (in `evidence-utils.tsx`) generates a mock file client-side; a real backend must serve the stored file.

**Path Parameters:** `id`
**Response:** `application/octet-stream` (or correct MIME per `fileType`) with `Content-Disposition: attachment; filename="<documentName>"`.
**File types seen in mock data:** `pdf`, `image` (jpg/png), `doc` (docx), `excel` (xlsx). Max size not defined in the frontend → **BACKEND VALIDATION REQUIRED** (see §14).

---

### 9.7 GET /api/v1/head-of-department/gaps

**Purpose:** List repository data gaps with accreditation impact.

**Frontend Screen:** Gap Analysis
**Frontend Component:** `GapAnalysis.tsx`
**Frontend Service:** None today — replaces `yearData.gaps`

**Query Parameters:** `academicYear`, `search` (matches `category`, `description`, `repository`, `section`, accreditation text), `severity` (`critical|high|medium|low`), `repository`, `page`/`size`.

**Response DTO: `GapItemResponseDTO`** (paginated)
```json
{
  "success": true,
  "message": "Gaps retrieved successfully",
  "data": {
    "content": [
      {
        "id": "2025-26-g1",
        "category": "Curriculum Revision",
        "description": "BoS minutes for the 2025-26 curriculum revision not uploaded",
        "repository": "Academic",
        "section": "Academic Calendar",
        "severity": "medium",
        "impact": "Curriculum revision evidence incomplete for 2025",
        "recommendation": "Upload BoS meeting minutes and approval letters",
        "accreditation": {
          "naac": { "criterion": "NAAC Criterion 1.1 (Curriculum Design)", "impact": "..." },
          "nba": { "criterion": "NBA Criterion 2 (Program Curriculum)", "impact": "..." },
          "nirf": { "criterion": "NIRF TLR", "impact": "..." }
        }
      }
    ],
    "totalPages": 1,
    "totalElements": 18,
    "number": 0,
    "size": 20
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

> 🔶 INFERRED: mock gaps are *generated* one-per-repository per year (see `buildGaps()`). **⚠️ REQUIRES BUSINESS CONFIRMATION** whether gaps are (a) auto-derived from completion thresholds, (b) manually curated, or (c) AI-generated.

---

### 9.8 GET /api/v1/head-of-department/readiness

**Purpose:** Weighted readiness scores, per-repository breakdown, metrics summary, and five-year trends.

**Frontend Screen:** Repository Readiness
**Frontend Component:** `RepositoryReadiness.tsx`
**Frontend Service:** None today — replaces `yearData.readiness` + `yearlyTrends`

**Query Parameters:** `academicYear`

**Response DTO: `HodReadinessResponseDTO`**
```json
{
  "success": true,
  "message": "Readiness data retrieved successfully",
  "data": {
    "academicYear": "2025-26",
    "readiness": [
      {
        "repository": "Academic",
        "weight": 15,
        "dataCompletion": 92,
        "evidenceCompletion": 88,
        "verification": 85,
        "approval": 80
      }
    ],
    "yearlyTrends": [
      { "year": "2021-22", "academic": 65, "faculty": 60, "student": 70, "research": 45, "alumni": 30 }
    ],
    "yoYImprovement": 12
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

**Client-side derived values:**
- Overall readiness gauge = `Σ((dataCompletion+evidenceCompletion+verification+approval)/4 × weight/100)` (same formula as dashboard).
- Per-repo status labels from thresholds: `≥90 Excellent`, `≥75 Good`, `≥60 Needs Attention`, else `Critical`.
- "YoY Improvement" card currently shows a hardcoded `+12%` (🔶 INFERRED field `yoYImprovement`; **⚠️ REQUIRES BUSINESS CONFIRMATION** on its formula).

---

### 9.9 GET /api/v1/head-of-department/analytics

**Purpose:** Department performance KPIs, distributions, research output vs target, five-year growth.

**Frontend Screen:** Department Analytics
**Frontend Component:** `DepartmentAnalytics.tsx`
**Frontend Service:** None today — replaces `yearData.analytics` + `yearlyTrends` + three component-local arrays

**Query Parameters:** `academicYear`

**Response DTO: `HodAnalyticsResponseDTO`**
```json
{
  "success": true,
  "message": "Analytics retrieved successfully",
  "data": {
    "academicYear": "2025-26",
    "analytics": {
      "facultyCount": 45,
      "students": 720,
      "research": 38,
      "placements": 85,
      "passPercentage": 92.5,
      "publications": 127,
      "patents": 8,
      "projects": 15
    },
    "facultyQualification": [
      { "qualification": "Ph.D.", "count": 32, "percentage": 71 }
    ],
    "studentPerformance": [
      { "category": "First Class with Distinction", "percentage": 35 }
    ],
    "researchMetrics": [
      { "metric": "SCI/Scopus Papers", "value": 78, "target": 100 }
    ],
    "yearlyTrends": [
      { "year": "2021-22", "academic": 65, "faculty": 60, "student": 70, "research": 45, "alumni": 30 }
    ]
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

> `facultyQualification`, `studentPerformance`, `researchMetrics` are **component-local static arrays today** (not in any type file). 🔶 INFERRED they become backend-owned; the KPI card trend values (`+3`, `+45`, `+8`, `+5%`, `-1.2%`, `+22`, `+2`, `0`) are hardcoded in the component (✅ CONFIRMED FROM FRONTEND — backend may derive or they may stay client-side).

---

### 9.10 GET /api/v1/head-of-department/activities

**Purpose:** Activity feed for the timeline view and the dashboard "Recent Activity" list.

**Frontend Screen:** Activity Timeline (Dashboard uses `activities.slice(0, 6)`)
**Frontend Component:** `ActivityTimeline.tsx`
**Frontend Service:** None today — replaces `yearData.activities`

**Query Parameters:** `academicYear`, `search` (matches `description`, `user`), `type` (`submitted|uploaded|approved|rejected|commented|returned|verified`), `repository`, `page`/`size`.

**Response DTO: `ActivityItemResponseDTO`** (paginated `ActivityItem[]` — shape exactly as in §9.1).

> "Load More Activities" button currently has **no handler** (✅ CONFIRMED FROM FRONTEND) — it is a pagination affordance. **⚠️ REQUIRES BUSINESS CONFIRMATION:** page size default (🔶 INFERRED: `20`).

---

### 9.11 GET /api/v1/head-of-department/reports

**Purpose:** Available report types + recently generated reports.

**Frontend Screen:** Reports
**Frontend Component:** `ReportsModule.tsx`
**Frontend Service:** None today — replaces `reportTypes` + `recentReports`

**Response DTO: `HodReportsResponseDTO`**
```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": {
    "reportTypes": [
      { "id": "1", "name": "Department Repository Report", "description": "Complete overview of all repository data with completion metrics", "icon": "FileText" }
    ],
    "recentReports": [
      { "name": "Department Repository Report", "generatedOn": "2024-12-14", "format": "PDF", "size": "2.4 MB" }
    ]
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

**Report types (✅ from `reportTypes`):** `Department Repository Report`, `Evidence Report`, `Pending Tasks Report`, `Gap Analysis Report`, `Repository Health Report`, `Five Year Summary`.
**Formats (✅ from the format selector):** `pdf`, `excel`, `word`.

---

### 9.12 POST /api/v1/head-of-department/reports/generate

**Purpose:** Generate and download a report. Maps to the "Generate & Download" button (✅ present in UI, ❗ currently has **no onClick handler** — 🔶 INFERRED contract).

**Request Body — `ReportGenerateRequestDTO`:**
```json
{
  "reportType": "2",
  "academicYear": "2025-26",
  "format": "pdf"
}
```
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `reportType` | String | Yes | One of the 6 report ids (`"1"`–`"6"`) |
| `academicYear` | String | Yes | `^\d{4}-\d{2}$` |
| `format` | String | Yes | `pdf` \| `excel` \| `word` |

**Success Response:** `application/octet-stream` file download (or JSON with a download URL — 🔶 INFERRED; recommend direct binary stream matching the EO export convention `produces = text/csv`).

---

### 9.13 POST /api/v1/head-of-department/reports/{reportId}/email

**Purpose:** Email a report (maps to the "Email Report" button — 🔶 INFERRED, no handler today).

**Path Parameters:** `reportId` (String — recent report id / generated report id)

**Request Body:** `{ "reportType": "2", "academicYear": "2025-26", "format": "pdf", "recipient": "hod@college.edu" }` — `recipient` optional; **⚠️ REQUIRES BUSINESS CONFIRMATION** (default recipient, delivery channel).

---

## 10. DTO Definitions

| DTO (proposed) | Request/Response | Source |
|----------------|------------------|--------|
| `HodDashboardResponseDTO` | Response | `HODYearData` subset + `evidenceSummary` + `observations` |
| `EvidenceItemResponseDTO` | Response | `EvidenceItem` (+ `fileUrl`) |
| `EvidenceReviewRequestDTO` | Request | `{ action, note }` |
| `EvidenceBulkReviewRequestDTO` | Request | `{ repository, section, action, note }` |
| `GapItemResponseDTO` | Response | `GapItem` |
| `HodReadinessResponseDTO` | Response | `{ readiness, yearlyTrends, yoYImprovement }` |
| `HodAnalyticsResponseDTO` | Response | `{ analytics, facultyQualification, studentPerformance, researchMetrics, yearlyTrends }` |
| `ActivityItemResponseDTO` | Response | `ActivityItem` |
| `HodReportsResponseDTO` | Response | `{ reportTypes, recentReports }` |
| `ReportGenerateRequestDTO` | Request | `{ reportType, academicYear, format }` |
| `ApiResponse<T>` | Wrapper | Existing (`frontend/src/types/auth.types.ts`) — `{ success, message, data, timestamp }` |

All response DTOs must serialise with **camelCase** property names identical to the frontend interfaces in §4.

---

## 11. Enum Definitions

**All values are the exact frontend strings. Backend may store/emit them as-is (recommended: Java enum with `@JsonValue` returning these exact values).**

### 11.1 Evidence status (`EvidenceItem.status`)
| Frontend value | Displayed label | Backend enum constant (recommended) |
|----------------|-----------------|-------------------------------------|
| `"pending"` | Pending | `PENDING` |
| `"approved"` | Approved | `APPROVED` |
| `"rejected"` | Rejected | `REJECTED` |
| `"changes-requested"` | Changes Requested | `CHANGES_REQUESTED` |

### 11.2 Evidence file type (`EvidenceItem.fileType`)
`"pdf"` · `"image"` · `"doc"` · `"excel"`

### 11.3 Repository status (`RepositoryStatus.status`)
`"on-track"` · `"at-risk"` · `"critical"` · `"completed"`

### 11.4 Gap severity (`GapItem.severity`)
`"critical"` · `"high"` · `"medium"` · `"low"`

### 11.5 Activity type (`ActivityItem.type`)
`"submitted"` · `"uploaded"` · `"approved"` · `"rejected"` · `"commented"` · `"returned"` · `"verified"`

### 11.6 AI insight type (`AiInsight.type`)
`"warning"` · `"critical"` · `"success"` · `"info"`

### 11.7 Readiness / accreditation status
`"ready"` · `"in-progress"` · `"not-started"` (used by `AccreditationCriterion.status` and `AccreditationFrameworkData.status`)

### 11.8 Accreditation framework id
`"naac"` · `"nba"` · `"nirf"`

### 11.9 Review action (request)
`"approve"` · `"reject"` · `"changes"`

### 11.10 Report format
`"pdf"` · `"excel"` · `"word"`

### 11.11 IQAC observation status (`EvidenceObservation.status`)
`"open"` · `"in-progress"` · `"resolved"` · `"verified"`

### 11.12 IQAC observation priority (`ObservationPriority`)
`"low"` · `"medium"` · `"high"` · `"critical"`

### 11.13 Repositories (fixed order used for grouping)
`Academic` · `Course` · `Faculty` · `Student` · `Research` · `Student Dev` · `Infrastructure` · `Alumni`

### 11.14 User roles (`UserRole` — existing)
`HEAD_OF_DEPARTMENT` (guard), plus existing roles in `auth.types.ts`.

---

## 12. Pagination

| Screen | Today (✅) | Required backend behavior (🔶) |
|--------|-----------|-------------------------------|
| Evidence Review / Approval Queue | Renders **all** items; grouping + search + filters are client-side | Backend pagination recommended (`page`, `size`, `content`, `totalElements`, `totalPages`, `number`). Default size 🔶 `20`. Grouping stays client-side over the page |
| Gap Analysis | Renders all; client-side filters | Pagination optional 🔶 (18 mock gaps) |
| Activity Timeline | Renders all; **"Load More" button with no handler** | Backend pagination expected (page size 🔶 `20`); "Load More" → `page+1` |
| Dashboard recent activity | `activities.slice(0, 6)` | Top-6 server-side (🔶) |
| Reports | All rows rendered | Optional |

> **⚠️ REQUIRES BUSINESS CONFIRMATION:** because the frontend currently groups and filters entirely client-side, switching to backend pagination will change UX for large datasets. Recommend keeping `search`/`status`/`repository` as server-side query params from day one so the frontend can be wired without rework.

---

## 13. Search

Frontend search today is **client-side** (`filter()` in each component). The backend contract must support the same field sets so the UI can be migrated:

| Screen | Searchable fields (✅ from frontend) | API param |
|--------|--------------------------------------|-----------|
| Evidence Review | `documentName`, `documentCategory`, `section`, `repository`, `uploadedBy` | `search` (case-insensitive substring) |
| Approval Queue | `documentName`, `documentCategory`, `section`, `repository` | `search` |
| Gap Analysis | `category`, `description`, `repository`, `section`, accreditation criterion/impact text | `search` |
| Activity Timeline | `description`, `user` | `search` |
| Reports (recent) | (none today) | — |

---

## 14. Filters

| Screen | Filter (✅ from frontend) | Parameter | Values | Required |
|--------|---------------------------|-----------|--------|----------|
| Evidence Review / Approval Queue | Status | `status` | `all` or `pending` \| `approved` \| `rejected` \| `changes-requested` (UI default: `pending`) | No |
| Evidence Review / Approval Queue | Repository | `repository` | short repo names; UI default `all` | No |
| Gap Analysis | Severity | `severity` | `critical` \| `high` \| `medium` \| `low`; UI default `all` | No |
| Gap Analysis | Repository | `repository` | short repo names | No |
| Activity Timeline | Type | `type` | `submitted` \| `uploaded` \| `approved` \| `rejected` \| `commented` \| `returned` \| `verified` | No |
| Activity Timeline | Repository | `repository` | short repo names | No |
| All list views | Academic year | `academicYear` | `YYYY-YY` (e.g. `2025-26`); default current | No |

---

## 15. Sorting

- **Today:** No explicit sorting controls exist in any HOD view. Lists rely on mock-data ordering (repository → section; timeline by insertion order).
- **🔶 INFERRED backend behavior:** `sort` query param (e.g. `sort=uploadDate,desc`) optional; Activity Timeline should default to newest-first (`timestamp` desc) when paginating.
- **⚠️ REQUIRES BUSINESS CONFIRMATION** whether explicit sortable columns are desired.

---

## 16. Entity & Relationship Requirements

```
Institution
   └── Department  (HOD user's department: user.departmentId / user.department)
         ├── HOD (User, role HEAD_OF_DEPARTMENT)  ← authenticated principal
         ├── Repository (8: Academic, Course, Faculty, Student, Research,
         │                 Student Dev, Infrastructure, Alumni)
         │     └── Evidence Section  (e.g. "Academic Calendar")
         │           └── Evidence Document  (EvidenceItem)
         │                 └── EvidenceVersion (history) 
         │                 └── ReviewDecision (status, note, reviewedBy, reviewDate)
         ├── Gap (GapItem) → references Repository + Section + Accreditation criteria
         ├── ReadinessScore (per Repository per AY)
         ├── Activity / AuditLog (ActivityItem)
         └── IQAC Observation (EvidenceObservation) — owned by IQAC, read by HOD
```

| Resource | Owner | Institution rel. | Department rel. | Parents | Children | Referenced entities |
|----------|-------|------------------|-----------------|---------|----------|---------------------|
| `HodDashboard` (aggregate) | HOD role | derived from JWT | derived from JWT | — | overview, readiness, evidenceSummary, insights, activities, accreditation, observations | Repository, Evidence, Gap, Activity, IQAC Observation |
| `EvidenceDocument` | Department Coordinator (uploadedBy) | institution | department | Department, Repository, Section | EvidenceVersion[], ReviewDecision | User (uploadedBy/reviewedBy) |
| `GapItem` | HOD/backoffice | institution | department | Department | — | Repository, Section, NAAC/NBA/NIRF criteria |
| `ReadinessData` / `YearlyTrend` | Derived | institution | department | Repository | — | Repository, AcademicYear |
| `ActivityItem` | System/actors | institution | department | Department | — | Repository, User |
| `Report` / recent reports | HOD | institution | department | Department | generated file | Repository data |
| `EvidenceObservation` | IQAC | institution | department | Department, Document | — | Document, Faculty/Student |

**Important relationship notes:**
- The HOD is **one user** bound to **one department** (`user.department`, `user.departmentId`). All HOD endpoints are implicitly department-scoped — **no `departmentId` should be accepted as a client-supplied scoping parameter for authorization** (✅ `User` type carries `departmentId`; 🔶 derived-from-JWT enforcement).
- Evidence documents are **uploaded by coordinators** (mock `COORDINATOR_NAME = 'Dr. Anita Sharma'`) and **reviewed by the HOD** (mock `HOD_NAME = 'Dr. Suresh Patil (HOD)'`) — backend must record the real actor from the JWT, not a client-sent name.
- The evidence review decision is keyed client-side as `year::repository::section::category` (`evidenceReviewKey`). The backend equivalent is a per-document decision + version history; the `(year, repository, section, category)` composite is how the Department Coordinator view re-syncs status — keep these four attributes queryable on the evidence record.
- IQAC Observations reference a document (`documentId`), a department **code** (`CSE`, `ECE`, …), repository and folder; the HOD widget resolves the HOD's department name → code via a client heuristic (`resolveDepartmentCode`) — backend should return observations already filtered by the HOD's department code to remove the heuristic.

---

## 17. Institution / Department Data Isolation

- ✅ **CONFIRMED:** `User` carries `institutionId`, `institutionName`, `department`, `departmentId` — the platform is multi-institution and multi-department.
- 🔶 **Required for every HOD endpoint:** data filtered by `institutionId` **and** `departmentId` derived from the authenticated JWT.
- Specifically:
  - Evidence, gaps, readiness, analytics, activities, reports, observations — all department-scoped.
  - Dashboard aggregation — department-scoped (HOD sees *their* department, not the institution).
  - 🔶 INFERRED: repository owners shown in the dashboard (`owner` field) may be other users of the same department — display-only.
- **Never trust client-supplied `institutionId`/`departmentId` for authorization.** If the frontend later sends them as query params, the backend must validate they match the JWT context (✅ `User.departmentId` is in the auth types; 🔶 derive from context).

---

## 18. File Upload / Download APIs

| Aspect | Contract |
|--------|----------|
| Upload | **Not part of the HOD surface today.** Evidence is uploaded by coordinators (see `DEPARTMENT_COORDINATOR_API_DOCUMENTATION.md`: `POST /api/v1/departments/{departmentId}/evidence`). HOD is review-only. ✅ CONFIRMED — do **not** add HOD upload endpoints |
| Download | `GET /api/v1/head-of-department/evidence/{id}/download` (🔶 INFERRED). Today the frontend **generates fake files client-side** (`jsPDF`, SVG data-URLs) so preview/download "work" with mock data |
| Preview | `EvidencePreviewDialog` renders from a client-generated `dataUrl` — a real backend should provide `fileUrl` per evidence item so the dialog can be wired to the stored file (🔶 INFERRED) |
| File types | `pdf`, `image` (jpg/png), `doc` (docx), `excel` (xlsx) — ✅ from mock `fileType` values and `EVIDENCE_STRUCTURE` |
| Max file size | **Not defined in the frontend** → `BACKEND VALIDATION REQUIRED` (existing evidence upload contract uses 25 MB; recommend reusing that limit) |
| Download behavior | `Content-Disposition: attachment; filename="<documentName>"` |
| Authorization | HOD role + department scope; file must belong to the HOD's department |

---

## 19. Dashboard APIs

**Recommendation (✅ supported by the frontend): a single aggregation endpoint** — `GET /api/v1/head-of-department/dashboard` (see §9.1) — because `HODDashboard.tsx` mounts six KPI cards, repository completion, accreditation readiness, IQAC observations, AI insights and recent activity from one mock object (`getHODYearData(...)`).

Fields served:
| Displayed value | Source today (✅) | Backend response field | Calculation / note |
|-----------------|-------------------|------------------------|--------------------|
| Department Readiness % | computed from `readiness` | `readiness` | `Σ(avg(dataCompletion,evidenceCompletion,verification,approval) × weight)/100` |
| Evidence Completion % | `readiness[].evidenceCompletion` avg | `readiness` | average |
| Verification % | `readiness[].verification` avg | `readiness` | average |
| Pending Review count | evidence `status === 'pending'` | `evidenceSummary.pending` | 🔶 INFERRED precomputed or computed from evidence endpoint |
| Approved Documents count | evidence `status === 'approved'` | `evidenceSummary.approved` | 🔶 INFERRED |
| Department Health % | `health` (87) | `health` | ⚠️ formula requires confirmation |
| Repository Completion list | `repositoryOverview` | `repositoryOverview` | name/owner/completion/status |
| Accreditation readiness | `accreditation` | `accreditation` | incl. `previousReadiness` per framework (🔶) |
| AI Insights | `insights` | `insights` | ⚠️ AI generation server-side vs curated requires confirmation |
| Recent Activity (6) | `activities.slice(0,6)` | `activities` | top 6 newest |
| IQAC Observations widget | `iqacVerificationSlice` | `observations` | department-filtered; ⚠️ read-only for HOD requires confirmation |

---

## 20. Reports / Export APIs

| Action (✅ from `ReportsModule.tsx`) | Backend required? | Contract |
|--------------------------------------|-------------------|----------|
| Generate & Download | **Yes** 🔶 INFERRED | `POST /api/v1/head-of-department/reports/generate` → binary file (`pdf`/`excel`/`word`) |
| Print | No — browser `window.print()` (FRONTEND ONLY) | — |
| Email Report | **Yes** 🔶 INFERRED | `POST /api/v1/head-of-department/reports/{reportId}/email` |
| Recent reports list | Yes 🔶 INFERRED | `GET /api/v1/head-of-department/reports` |

> ⚠️ The Generate/Print/Email buttons currently have **no onClick handlers** — the endpoints are contracts for the future wiring, not live calls.

---

## 21. Mock Data Replacement Map

Every HOD mock/static dataset, its consumer, and the backend API that replaces it:

| # | File / Variable | Used By | Key fields | Intended backend source | Proposed API |
|---|-----------------|---------|------------|--------------------------|--------------|
| 1 | `hod-configs.ts` → `repositoryOverviewData` | Dashboard repository completion | `id,name,owner,completion,evidence,verification,pendingTasks,status` | Repository completion service | `GET /dashboard` (→ `repositoryOverview`) |
| 2 | `hod-configs.ts` → `readinessData` | Dashboard KPIs, Readiness view | `repository,weight,dataCompletion,evidenceCompletion,verification,approval` | Readiness computation | `GET /dashboard`, `GET /readiness` |
| 3 | `hod-configs.ts` → `evidenceData` (from `EVIDENCE_STRUCTURE` + `CURRENT_YEAR_STATUS`) | Evidence Review, Approval Queue | see `EvidenceItem` | Evidence document service | `GET /evidence` |
| 4 | `hod-configs.ts` → `gapAnalysisData` / `buildGaps` | Gap Analysis | `id,category,description,repository,section,severity,impact,recommendation,accreditation` | Gap service | `GET /gaps` |
| 5 | `hod-configs.ts` → `analyticsData` | Department Analytics KPIs | `facultyCount,students,research,placements,passPercentage,publications,patents,projects` | Analytics aggregation | `GET /analytics` |
| 6 | `hod-configs.ts` → `yearlyTrends` | Readiness 5-yr table, Analytics growth | `year,academic,faculty,student,research,alumni` | Trend aggregation | `GET /readiness`, `GET /analytics` |
| 7 | `hod-configs.ts` → `activityTimelineData` / `buildActivities` | Activity Timeline, Dashboard | `id,type,description,user,timestamp,repository` | Activity/audit log | `GET /activities`, `GET /dashboard` |
| 8 | `hod-configs.ts` → `aiInsights` / `buildInsights` | Dashboard AI Insights | `id,title,description,type` | AI/insights service | `GET /dashboard` (→ `insights`) |
| 9 | `hod-configs.ts` → `health` (87 per year) | Dashboard KPI | `health` | Health computation | `GET /dashboard` |
| 10 | `hod-configs.ts` → `buildAccreditation` (+ `ACCREDITATION_MATRIX`) | AccreditationReadiness | `id,name,readiness,status,criteria[]` | Accreditation mapping service | `GET /dashboard` (→ `accreditation`) |
| 11 | `hod-configs.ts` → `reportTypes` | Reports cards + selector | `id,name,description,icon` | Config (could remain static) | `GET /reports` |
| 12 | `ReportsModule.tsx` → `recentReports` | Recent reports table | `name,generatedOn,format,size` | Report generation service | `GET /reports` |
| 13 | `DepartmentAnalytics.tsx` → `facultyQualification`, `studentPerformance`, `researchMetrics` | Analytics charts | `qualification/count/percentage`, `category/percentage`, `metric/value/target` | Analytics aggregation | `GET /analytics` |
| 14 | `hod-configs.ts` → `REPO_OWNERS`, `REPO_WEIGHTS` | owner names, weights | `owner`, `weight` | Repository config | backend-owned config |
| 15 | `hod-configs.ts` → `PAST_YEAR_CONFIGS` | All past-year views (AY selector) | per-year repos/analytics/health | Year-scoped queries | all GET endpoints with `academicYear` param |
| 16 | `evidenceReviewSlice.ts` (seed + localStorage) | review decisions persistence | `status,note,reviewedBy,reviewDate` | Review decision table | `POST /evidence/{id}/review` |
| 17 | `iqacVerificationSlice.ts` / `verification-data.ts` | IQACObservationsWidget | `EvidenceObservation` fields | IQAC observation service | `GET /dashboard` (→ `observations`) |
| 18 | `evidence-utils.tsx` (jsPDF/SVG fake files) | Preview + download | `dataUrl` | Object storage + `fileUrl` | `GET /evidence/{id}/download` |

---

## 22. Frontend Contract Gaps

1. **No API layer exists** — all 8 views are 100 % mock (`getHODYearData`), so every endpoint in this document is 🔶 INFERRED until frontend wiring happens.
2. **Repository naming inconsistency** — `repositoryOverviewData` uses full names (`"Academic Repository"`, `"Student Dev & Outcomes"`, `"Infrastructure Repository"`) while evidence/gaps/readiness/activities use short names (`"Academic"`, `"Student Dev"`, `"Infrastructure"`). The dashboard's repository completion list (full name) is never matched against the short-name repo keys elsewhere.
3. **Reports buttons are inert** — Generate & Download / Print / Email have no handlers; `recentReports` is mock.
4. **"Load More Activities" is inert** — no pagination wiring; timeline renders all items.
5. **YoY Improvement `+12%` is hardcoded** in `RepositoryReadiness.tsx`.
6. **Analytics sub-charts are component-local arrays** not present in any type file (`facultyQualification`, `studentPerformance`, `researchMetrics`); KPI trends are hardcoded strings.
7. **Evidence preview/download is client-generated** (jsPDF/SVG data URLs) — no real file URL exists in the type; `fileUrl` is an inferred addition.
8. **Cross-module coupling** — `IQACObservationsWidget` depends on the IQAC's Redux store seeded mock data and a **department-name→code heuristic** (`resolveDepartmentCode`) instead of a backend query.
9. **Version format dependency** — UI parses `version` with regex `^v(\d+)\.(\d+)$`; versioning policy (minor vs major on re-upload) is undefined.
10. **Hardcoded "CSE Department"** label in `HODLayout` footer (should come from `user.department`).
11. **Hardcoded "(Current)" marker** on `2025-26` in the AY selector.
12. **No pagination in evidence/approval lists** despite ~171 mock documents (2025-26) — backend pagination will change the client grouping UX unless search/filters are server-side.
13. **`reviewedBy` mock value is a display string** (`"Dr. Suresh Patil (HOD)"`) — backend must return real user names from the JWT.
14. **Pagination shape ambiguity** — the two existing backend docs use slightly different Page shapes (`content,page,size,totalElements,totalPages,last,first` vs `content,totalPages,totalElements,number,size`); this contract standardises on the latter (EO convention) — must be reconciled project-wide.

---

## 23. Business Rules Requiring Confirmation

1. **Approval workflow chain** — frontend toast says HOD-approved evidence is *"ready for IQAC verification"* (🔶 INFERRED next step). Confirm: HOD → IQAC → verified, and who can re-open a decision.
2. **Valid status transitions** — can the HOD reject an already-approved document, or approve after rejecting, etc.? Frontend only disables the button matching the item's *current* status.
3. **Rejection/resubmission cycle** — on reject/request-changes, is the document returned to the coordinator as `pending`? Does a coordinator re-upload reset `version` (minor bump?) and clear the HOD's `reviewNote`?
4. **Gap source** — are gaps auto-derived from completion thresholds, manually curated, or AI-generated? (Mock `buildGaps` derives severity from completion but writes curated text.)
5. **Health score formula** — `health` (87 current year) has no visible formula.
6. **Readiness weights** — `REPO_WEIGHTS` (15/10/15/15/10/10/5/5 + Evidence 10 + Verification 5) are hardcoded; confirm if department-configurable.
7. **AI insights** — server-generated vs static content; refresh cadence.
8. **Report email** — default recipient, channel, and whether generation is async with a download link vs synchronous binary.
9. **Data ownership for analytics/readiness** — department-scoped (this contract assumes yes) vs institution-wide roll-ups.
10. **IQAC observations** — read-only for HOD (assumed; widget has no actions).
11. **Academic years** — static list vs backend-managed academic year table.

---

## 24. Backend Implementation Checklist

### Controllers
- [ ] `HodDashboardController` — `GET /api/v1/head-of-department/dashboard`
- [ ] `HodEvidenceController` — `GET /evidence`, `GET /evidence/{id}`, `POST /evidence/{id}/review`, `POST /evidence/bulk-review`, `GET /evidence/{id}/download`
- [ ] `HodGapController` — `GET /gaps`
- [ ] `HodReadinessController` — `GET /readiness`
- [ ] `HodAnalyticsController` — `GET /analytics`
- [ ] `HodActivityController` — `GET /activities`
- [ ] `HodReportController` — `GET /reports`, `POST /reports/generate`, `POST /reports/{reportId}/email`
- [ ] Swagger `@Tag(name = "HOD - Department Overview")`, `@SecurityRequirement(name = "bearerAuth")` on all

### DTOs
- [ ] `ApiResponse<T>` (reuse existing)
- [ ] `HodDashboardResponseDTO` (+ `EvidenceSummaryDTO`, `RepositoryStatusDTO`, `ReadinessDataDTO`, `AiInsightDTO`, `ActivityItemDTO`, `AccreditationFrameworkDataDTO`, `AccreditationCriterionDTO`, `EvidenceObservationDTO`)
- [ ] `EvidenceItemResponseDTO` (+ `EvidenceVersionDTO`)
- [ ] `EvidenceReviewRequestDTO` / `EvidenceBulkReviewRequestDTO`
- [ ] `GapItemResponseDTO` (+ `GapAccreditationDTO`, `AccreditationImpactDTO`)
- [ ] `HodReadinessResponseDTO` (+ `YearlyTrendDTO`)
- [ ] `HodAnalyticsResponseDTO` (+ `FacultyQualificationDTO`, `StudentPerformanceDTO`, `ResearchMetricDTO`)
- [ ] `HodReportsResponseDTO` (+ `ReportTypeDTO`, `RecentReportDTO`)
- [ ] `ReportGenerateRequestDTO`
- [ ] Bean-validation annotations matching §10 rules

### Services
- [ ] `HodDashboardService` — aggregates overview/readiness/evidence-summary/insights/activities/accreditation/observations for one department + AY
- [ ] `HodEvidenceService` — list (filters/pagination), review decision (status/version/history/audit), bulk approve, download
- [ ] `HodGapService` — list with severity/repository filters
- [ ] `HodReadinessService` — readiness + yearly trends computation
- [ ] `HodAnalyticsService` — KPI + distribution aggregation
- [ ] `HodActivityService` — paginated activity feed
- [ ] `HodReportService` — report generation (pdf/excel/word) + email
- [ ] All services enforce institution + department scoping from the authenticated principal

### Repositories
- [ ] Evidence document repository (query by department, AY, status, repository, section, search)
- [ ] Review decision / version-history repository
- [ ] Gap repository
- [ ] Readiness / trend repository (or aggregation queries)
- [ ] Activity/audit-log repository
- [ ] Observation repository (read-only for HOD)

### Entities
- [ ] `EvidenceDocument` (with `departmentId`, `academicYear`, `repository`, `section`, `documentCategory`, `status`, `version`, `fileUrl`)
- [ ] `EvidenceVersionHistory`
- [ ] `EvidenceReviewDecision` (status, note, reviewedBy, reviewDate)
- [ ] `RepositoryGap`
- [ ] `ReadinessScore` / `YearlyTrend`
- [ ] `ActivityLog`
- [ ] `GeneratedReport`
- [ ] Reuse existing `Department`, `User`, `Institution` entities

### Enums
- [ ] `EvidenceStatus` (PENDING, APPROVED, REJECTED, CHANGES_REQUESTED — emit exact frontend strings)
- [ ] `EvidenceFileType` (PDF, IMAGE, DOC, EXCEL)
- [ ] `RepositoryStatusEnum` (ON_TRACK, AT_RISK, CRITICAL, COMPLETED)
- [ ] `GapSeverity` (CRITICAL, HIGH, MEDIUM, LOW)
- [ ] `ActivityType` (SUBMITTED, UPLOADED, APPROVED, REJECTED, COMMENTED, RETURNED, VERIFIED)
- [ ] `InsightType` (WARNING, CRITICAL, SUCCESS, INFO)
- [ ] `AccreditationFramework` (NAAC, NBA, NIRF)
- [ ] `ReportFormat` (PDF, EXCEL, WORD)

### Database
- [ ] Tables for all entities above with institution/department FK columns (index on `(department_id, academic_year, status)`)
- [ ] Indexes for search: `document_name`, `document_category`, `section`
- [ ] `unique` consideration: evidence identity `(department, academicYear, repository, section, documentCategory, version)`

### Flyway Migrations
- [ ] `V__create_hod_evidence.sql` (evidence, version history, review decision)
- [ ] `V__create_hod_gaps.sql`
- [ ] `V__create_hod_readiness.sql`
- [ ] `V__create_hod_activity_log.sql`
- [ ] `V__create_hod_reports.sql`
- [ ] Seed data matching the mock screens for dev/test environments (optional)

### Security
- [ ] Method-level `@PreAuthorize("hasRole('HEAD_OF_DEPARTMENT')")` (or role guard in security config) on all HOD endpoints
- [ ] Institution + department scope derived from JWT on every query
- [ ] Ownership validation before review/download of any evidence record
- [ ] Never trust client-supplied institution/department ids

### Tests
- [ ] Controller tests for all 13 endpoints (200/400/403/404)
- [ ] Service tests for review decision state machine, version increment, bulk approve
- [ ] Repository tests for filters/search/pagination
- [ ] Security integration tests — HOD cross-department and cross-institution access denied
- [ ] Validation tests (note required for reject/changes; bad action; bad academicYear)

---

## 25. Quality Check

- [x] Every HOD screen identified (8 views)
- [x] Every HOD route identified (`/app/hod-dashboard` + `?view=` variants)
- [x] Every major component traced
- [x] Every relevant types file identified
- [x] Every relevant service file identified (none exist for HOD — documented)
- [x] Every existing API call identified (0 in HOD pages; auth calls documented)
- [x] Every mock data source identified (§21)
- [x] Every user action mapped (search/filter/approve/reject/changes/download/preview/generate/email)
- [x] Every required endpoint documented (13)
- [x] Request DTOs documented
- [x] Response DTOs documented
- [x] Enums documented (exact frontend values)
- [x] Search documented (§13)
- [x] Filters documented (§14)
- [x] Sorting documented (§15)
- [x] Pagination documented (§12)
- [x] File operations documented (§18)
- [x] Dashboard documented (§19)
- [x] Reports/exports documented (§20)
- [x] Institution isolation documented (§7, §17)
- [x] Department isolation documented (§7, §17)
- [x] Entity relationships documented (§16)
- [x] Authentication documented
- [x] Authorization documented
- [x] Frontend/backend gaps documented (§22)
- [x] Business-rule uncertainties documented (§23)
- [x] **No frontend files modified** — analysis-only task

---

## Summary

| Metric | Count |
|--------|-------|
| HOD screens found | **8** (1 route, 8 `?view=` views) |
| Frontend type files found | **4** (`hod-configs.ts`, `auth.types.ts`, `iqac-dashboard/verification-data.ts`, `iqac-dashboard/types.ts`) + 1 store slice type file (`evidenceReviewSlice.ts`) |
| Service/API files found | **0** dedicated to HOD (2 indirect: `auth.service.ts`, `impersonation.service.ts`) |
| Existing API calls found | **0** inside HOD pages (app-wide auth calls only) |
| Required endpoints | **13** |
| Mock data sources | **18** |
| Contract gaps | **14** |
| Business rules requiring confirmation | **11** |

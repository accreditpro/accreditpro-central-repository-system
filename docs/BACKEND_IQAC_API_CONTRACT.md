# IQAC Coordinator — API Contract

> **Analysis-only document.** Reverse-engineered from the existing IQAC Coordinator frontend
> (`frontend/src/pages/iqac-dashboard/**`). The frontend is the source of truth; no frontend
> file was modified to produce this contract.
>
> **Confidence legend**
> - ✅ **CONFIRMED FROM FRONTEND** — field/behaviour read directly from the implementation.
> - 🔶 **INFERRED** — the frontend runs on mock data; the endpoint/DTO shape is proposed to
>   satisfy the frontend's exact expectations. Treat as a contract recommendation.
> - ⚠️ **REQUIRES BUSINESS CONFIRMATION** — the frontend does not define the rule.

---

## 1. Purpose

Define the backend API surface required to make the **IQAC Coordinator** frontend fully
functional. The IQAC is the institution's internal quality-assurance auditor. Two distinct
responsibilities are visible in the frontend:

1. **Read-only institutional monitoring** — readiness, accreditation, gaps, repository health
   across all departments (the IQAC never uploads or approves departmental data).
2. **IQAC-owned workflows** — raising/tracking **Quality Observations**, managing **Quality
   Improvement Initiatives**, maintaining **IQAC Supporting Documents**, and running the
   **Evidence Verification** lifecycle on HOD-approved documents (verify / raise document-level
   observation / confirm resolved observations).

The frontend currently runs **100% on mock data** (`iqac-data.ts`, `verification-data.ts`,
shared `principal-data.ts` / `principal-configs.ts`) plus two persisted Redux slices
(`iqacSlice`, `iqacVerificationSlice`) that act as the "database" for observations, initiatives,
documents and verification decisions. **All endpoints below are 🔶 INFERRED** — there are no
existing IQAC API calls in the frontend to copy.

---

## 2. Frontend Source of Truth

### Route & Layout
| File | Role |
|------|------|
| `frontend/src/layouts/IQACLayout.tsx` | Sidebar layout — 16 nav items in 6 groups; unread badges computed live from Redux selectors (`selectObservations`, `selectVerificationObservations`, `gapStats`, `useVerificationDocuments`) |
| `frontend/src/pages/iqac-dashboard/IQACDashboardPage.tsx` | Single route `/app/iqac-dashboard`, view switched by `?view=` query param; global **Academic Year selector** bound to `uiSlice.selectedAcademicYear` |

### IQAC Pages & Components (16 views)
| File | View id |
|------|---------|
| `components/Dashboard.tsx` | `dashboard` |
| `components/InstitutionReadiness.tsx` | `institution` |
| `components/DepartmentReadiness.tsx` | `departments` |
| `components/RepositoryMonitoring.tsx` | `repository-monitoring` |
| `components/AccreditationReadiness.tsx` | `accreditation` |
| `components/GapAnalysis.tsx` | `gaps` |
| `components/QualityObservations.tsx` | `observations` |
| `components/ContinuousImprovement.tsx` | `improvement` |
| `components/InstitutionalReports.tsx` | `reports` |
| `components/AIInsights.tsx` | `ai-insights` |
| `components/SupportingDocuments.tsx` | `documents` |
| `components/VerificationOverview.tsx` | dashboard sub-widget (evidence verification summary) |
| `components/InstitutionalCharts.tsx` | dashboard sub-widget (recharts trend/pie/bar) |
| `components/verification/VerificationView.tsx` | `verification` |
| `components/verification/PendingVerificationView.tsx` | `pending-verification` |
| `components/verification/VerifiedDocumentsView.tsx` | `verified-documents` |
| `components/verification/VerificationObservationsView.tsx` | `verification-observations` |
| `components/verification/VerificationReportsView.tsx` | `verification-reports` |

### Verification sub-components
`VerificationDocumentTable.tsx`, `VerifyDocumentDialog.tsx`, `RaiseObservationDialog.tsx`,
`DocumentPreviewPanel.tsx`, `VersionHistoryDialog.tsx`, `VerificationScopeBar.tsx`,
`verification-status.tsx`, `verification-utils.ts`, `useVerificationDocuments.ts`,
`verification-report-export.ts`.

### Data / Type / Store files
| File | Role |
|------|------|
| `pages/iqac-dashboard/iqac-data.ts` | IQAC domain constants, seeds, derived readiness datasets, KPI builder |
| `pages/iqac-dashboard/types.ts` | `QualityObservation`, `ImprovementInitiative`, `IQACDocument` + enums |
| `pages/iqac-dashboard/verification-data.ts` | `VerificationDocument`, `EvidenceObservation`, `VerificationSummary` + seed builders |
| `pages/principal-dashboard/principal-data.ts` | **Shared** department × repository matrix, accreditation matrices, gaps, trends (re-exported by `iqac-data.ts`) |
| `pages/principal-dashboard/principal-configs.ts` | **Shared** `kpiData`, `institutionStats`, `naacCriteria`, `nirfParameters` |
| `store/slices/iqacSlice.ts` | Redux CRUD for observations / initiatives / documents (persisted to `localStorage`) |
| `store/slices/iqacVerificationSlice.ts` | Redux state for verify decisions + document observations (persisted to `localStorage`) |
| `store/slices/uiSlice.ts` | Global `selectedAcademicYear` + in-app notifications |

---

## 3. IQAC Screen Inventory

| # | Screen | Route (`/app/iqac-dashboard?view=`) | Main Component | Purpose |
|---|--------|--------------------------------------|----------------|---------|
| 1 | IQAC Dashboard | `dashboard` | `Dashboard.tsx` | KPI cards (10), readiness gauge, department summary, evidence verification overview, charts, alerts |
| 2 | Institution Readiness | `institution` | `InstitutionReadiness.tsx` | Repository-wise + department-wise readiness with expandable repository drill-down |
| 3 | Department Readiness | `departments` | `DepartmentReadiness.tsx` | Dept × repository completion matrix; read-only Drill Down: Department → Repository → Folder → Evidence |
| 4 | Repository Monitoring | `repository-monitoring` | `RepositoryMonitoring.tsx` | Per-repository records/uploads/evidence/approval counts with status filter |
| 5 | Accreditation Readiness | `accreditation` | `AccreditationReadiness.tsx` | NBA / NAAC / NIRF tabs — criterion-wise, department-wise, institution-wise readiness |
| 6 | Gap Analysis | `gaps` | `GapAnalysis.tsx` | Auto-generated gaps by scope tab (repository / evidence / criterion / department / year) |
| 7 | Quality Observations | `observations` | `QualityObservations.tsx` | **CRUD** — raise, filter, view, advance status, change priority, delete observations |
| 8 | Continuous Improvement | `improvement` | `ContinuousImprovement.tsx` | **CRUD** — add initiatives, filter, update status, edit outcome |
| 9 | Institutional Reports | `reports` | `InstitutionalReports.tsx` | 9 report types → **client-side PDF / Excel export** |
| 10 | AI Insights | `ai-insights` | `AIInsights.tsx` | Client-computed recommendations from readiness + observations; "Regenerate" re-derives locally |
| 11 | Supporting Documents | `documents` | `SupportingDocuments.tsx` | **CRUD** — upload, preview, download, version history, new version, folder chips, tags |
| 12 | Repository Verification | `verification` | `VerificationView.tsx` | Hierarchy browser + document table; Verify / Raise Observation on HOD-approved docs |
| 13 | Pending Verification | `pending-verification` | `PendingVerificationView.tsx` | Queue of HOD-approved, not-yet-verified documents (year + dept scope) |
| 14 | Verified Documents | `verified-documents` | `VerifiedDocumentsView.tsx` | IQAC-verified documents (year + dept scope) |
| 15 | Verification Observations | `verification-observations` | `VerificationObservationsView.tsx` | Document-level observations; mark **resolved → verified** |
| 16 | Verification Reports | `verification-reports` | `VerificationReportsView.tsx` | 5 report types → client-side PDF / Excel export + inline preview |

---

## 4. Frontend Type Inventory

> All field names below are **verbatim** from the frontend TypeScript. The backend must use
> camelCase matching these exactly.

### 4.1 IQAC core types (`pages/iqac-dashboard/types.ts`)

| Type | Fields |
|------|--------|
| `QualityObservation` | `id: string`, `title: string`, `department: string`, `repository: string`, `academicYear: string`, `framework: 'NBA'\|'NAAC'\|'NIRF'\|'All'`, `criterion?: string`, `priority: 'low'\|'medium'\|'high'\|'critical'`, `description: string`, `recommendedAction: string`, `dueDate: string` (YYYY-MM-DD), `status: 'open'\|'in-progress'\|'resolved'\|'closed'`, `createdBy: string`, `createdAt: string` (YYYY-MM-DD), `assignedTo?: string`, `resolution?: string`, `resolvedAt?: string` |
| `ObservationInput` | `Omit<QualityObservation, 'id'\|'status'\|'createdBy'\|'createdAt'>` — the create form payload |
| `ImprovementInitiative` | `id: string`, `title: string`, `category: string`, `department: string`, `academicYear: string`, `description: string`, `owner: string`, `startDate: string` (YYYY-MM-DD), `targetDate: string` (YYYY-MM-DD), `status: 'not-started'\|'in-progress'\|'on-track'\|'delayed'\|'completed'`, `outcome?: string` |
| `InitiativeInput` | `Omit<ImprovementInitiative, 'id'>` |
| `IQACDocVersion` | `version: string` (`'v1'`, `'v2'`, `'v1.1'`…), `uploadedBy: string`, `uploadedDate: string`, `note?: string`, `fileSize: string` |
| `IQACDocument` | `id: string`, `folder: string`, `name: string`, `description: string`, `fileType: 'pdf'\|'docx'\|'xlsx'\|'pptx'\|'zip'`, `size: string` (e.g. `'4.2 MB'`), `uploadedBy: string`, `uploadedDate: string`, `tags: string[]`, `versions: IQACDocVersion[]` |
| `IQACDocumentInput` | `Omit<IQACDocument, 'id'\|'versions'\|'uploadedDate'>` |

### 4.2 Verification types (`pages/iqac-dashboard/verification-data.ts`)

| Type | Fields |
|------|--------|
| `VerificationDocument` | `id: string`, `name: string`, `department: string` (code, e.g. `CSE`), `departmentName: string`, `academicYear: string`, `repository: string`, `folder: string`, `category: string`, `faculty?: string`, `student?: string`, `fileType: 'pdf'\|'docx'\|'xlsx'\|'pptx'\|'zip'\|'image'\|'other'`, `size: string`, `uploadedBy: string`, `uploadedAt: string` (YYYY-MM-DD), `lastModified: string`, `version: number`, `frameworks: string[]` (`'NAAC'`, `'NBA'`, `'NIRF'`), `hodStatus: 'pending'\|'approved'\|'rejected'`, `hodApprovedAt?: string`, `iqacStatus: 'not-verified'\|'verified'\|'observation-raised'`, `verifiedBy?: string`, `verifiedAt?: string`, `comments?: string` |
| `EvidenceObservation` | `id: string`, `documentId: string`, `documentName: string`, `department: string`, `repository: string`, `folder: string`, `category: string`, `faculty?: string`, `student?: string`, `title: string`, `priority: ObservationPriority`, `description: string`, `recommendedCorrection: string`, `dueDate: string`, `status: 'open'\|'in-progress'\|'resolved'\|'verified'`, `raisedBy: string`, `raisedAt: string`, `response?: string`, `respondedAt?: string`, `verifiedAt?: string` |
| `VerificationSummary` | `totalDocuments: number`, `pendingHodApproval: number`, `approvedNotVerified: number`, `verified: number`, `observationRaised: number`, `rejected: number`, `criticalObservations: number`, `openObservations: number`, `departmentWise: { department, total, verified, pending }[]`, `repositoryWise: { repository, total, verified, pending }[]` |
| `VerificationEntry` (slice) | `status: IqacVerificationStatus`, `verifiedBy?: string`, `verifiedAt?: string`, `comments?: string` — the **write payload** recorded by the IQAC |
| `VerificationState` (slice) | `verifications: Record<string, VerificationEntry>` (keyed by document id), `observations: EvidenceObservation[]` |

### 4.3 Readiness datasets (`pages/iqac-dashboard/iqac-data.ts`)

| Type | Fields |
|------|--------|
| `InstitutionRepositoryRow` | `repository: string`, `totalRecords: number`, `approvedRecords: number`, `missingRecords: number`, `evidenceCompletion: number`, `readiness: number`, `status: 'ready'\|'attention'\|'critical'` |
| `DepartmentReadinessRow` | `code: string`, `name: string`, `repositoryCompletion: number`, `nba: number`, `naac: number`, `nirf: number`, `status` |
| `RepositoryMonitoringRow` | `repository: string`, `totalRecords: number`, `pendingUploads: number`, `missingEvidence: number`, `pendingHodApproval: number`, `approvedRecords: number`, `completion: number`, `status` |
| `DrillEvidence` | `name: string`, `fileType: string`, `size: string`, `status: 'approved'\|'uploaded'\|'pending'\|'rejected'`, `uploadedBy: string`, `date: string` |
| `DrillFolder` | `folder: string`, `required: number`, `evidence: DrillEvidence[]` |
| `DrillRepository` | `repository: string`, `completion: number`, `folders: DrillFolder[]` |
| `DrillDepartment` | `code: string`, `name: string`, `repositories: DrillRepository[]` |
| `IqaGap` | `id: string`, `scope: 'repository'\|'evidence'\|'criterion'\|'department'\|'year'`, `department?: string`, `repository?: string`, `framework?: 'NBA'\|'NAAC'\|'NIRF'\|'All'`, `criterion?: string`, `current: number`, `target: number`, `priority: 'low'\|'medium'\|'high'\|'critical'`, `suggestedAction: string` |

### 4.4 Shared principal datasets (read by IQAC, `principal-data.ts` / `principal-configs.ts`)

| Type | Fields |
|------|--------|
| `DeptRepoRow` | `repo: string`, `completion: number`, `approved: number`, `pending: number`, `missing: number` |
| `DepartmentRepositoryData` | `code: string`, `name: string`, `readiness: number`, `repositories: DeptRepoRow[]` (8 repos each) |
| `DeptCriterionScore` | `dept: string`, `scores: number[]`, `overall: number` (used for `nbaDeptScores`, `naacDeptScores`, `nirfDeptScores`) |
| `PrincipalGap` | `id`, `department`, `repository`, `framework`, `description`, `current`, `target`, `priority`, `missingData: string[]`, `missingEvidence: string[]`, `pendingApproval: string`, `iqacObservation: string`, `recommendedActions: string[]` |
| `kpiData` (config) | `institutionReadiness`, `naacReadiness`, `nbaReadiness`, `nirfReadiness`, `repositoryCompletion`, `evidenceCompletion`, `verificationStatus`, `pendingApprovals`, `departmentsAtRisk`, `overallHealthScore`, `performanceIndex`, `dataQualityScore` (all numbers) |
| `institutionStats` (config) | `programs`, `departments`, `students`, `faculty`, `researchPublications`, `patents`, `placementRate`, `averagePackage`, `highestPackage`, `recruiters`, `infrastructure: { buildings, labs, library, ict }`, `budget`, `expenditure` |
| `analyticsTrends` | `years: string[]`, `repositoryCompletion: number[]`, `accreditationReadiness: number[]`, `evidenceCompletion: number[]`, `faculty`, `students`, `publications`, `placements`, `passPercentage`, `infrastructure` (arrays, 5 years: 2020-21 → 2024-25) |

### 4.5 Redux state types (`store/slices/iqacSlice.ts`)
`IQACState { observations: QualityObservation[]; initiatives: ImprovementInitiative[]; documents: IQACDocument[] }` — persisted under `localStorage['accreditpro-iqac']`.
`VerificationState` — persisted under `localStorage['accreditpro-iqac-verification']`.

---

## 5. Frontend Service Inventory

**There are ZERO dedicated API services in the IQAC module.** All data is mock + Redux-local. No `@/services/`, `axios`, `fetch`, `useQuery`, or `useMutation` usage exists inside `pages/iqac-dashboard/**`.

| Service | File | Function | HTTP | Existing Endpoint | Used By |
|---------|------|----------|------|-------------------|---------|
| — (none) | — | — | — | — | — |
| Redux `iqacSlice` | `store/slices/iqacSlice.ts` | `addObservation`, `setObservationStatus`, `setObservationPriority`, `deleteObservation`, `addInitiative`, `updateInitiativeStatus`, `updateInitiative`, `addDocument`, `addDocumentVersion` | — | — | QualityObservations, ContinuousImprovement, SupportingDocuments |
| Redux `iqacVerificationSlice` | `store/slices/iqacVerificationSlice.ts` | `verifyDocument`, `raiseObservation`, `updateObservationStatus`, `markObservationVerified` | — | — | Verification views, dialogs |
| Redux `uiSlice` | `store/slices/uiSlice.ts` | `setSelectedAcademicYear`, `addNotification` | — | — | Page header, Verify/Raise dialogs |
| Client export | `components/report-export.ts` | `exportIQACReportToPDF`, `exportIQACReportToExcel` | — | — | InstitutionalReports |
| Client export | `components/verification/verification-report-export.ts` | `exportVerificationReportToPDF`, `exportVerificationReportToExcel` | — | — | VerificationReportsView |
| Client download | `components/verification/verification-utils.ts` | `downloadDocument` (generates a placeholder `.txt` blob) | — | — | Verification tables |

> **Existing backend hooks (for reference, not wired to this frontend):** the backend already
> defines `WorkflowStatus.IQAC_VERIFICATION` (`common/constants/WorkflowStatus.java`),
> `POST /api/v1/workflow/{entityType}/{entityId}/iqac-verify`, and
> `PUT /api/v1/departments/{departmentId}/evidence/{id}/verify` (HOD/IQAC verify-or-reject,
> `DepartmentCoordinatorEvidenceController`). The IQAC contract below aligns its verification
> endpoints with this existing workflow vocabulary where possible.

---

## 6. Global API Specifications

| Item | Value |
|------|-------|
| **Base Endpoint Path** | `/api/v1/iqac` |
| **Swagger Tag** | `IQAC Coordinator` |
| **Authentication** | Bearer JWT (`Authorization: Bearer <token>`) — same auth used by all AccreditPro modules |
| **Role Guard** | `IQAC_COORDINATOR` (backend already has `UserRole.IQAC_COORDINATOR`) |
| **Content-Type** | `application/json`; multipart/form-data for document upload |
| **Date format** | `YYYY-MM-DD` (frontend uses `.slice(0, 10)` of ISO strings everywhere) |
| **DateTime format** | `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'` / ISO-8601 (activity/notification timestamps) |
| **Success response** | `ApiResponse<T>` envelope matching the rest of the app: `{ "success": true, "message": "...", "data": T }` |
| **Error response** | `ApiResponse<T>` with `success: false`, `message`, optional `data` (existing AccreditPro convention) |
| **Pagination** | Spring Page shape `{ content, page, size, totalElements, totalPages, number, ... }` where backend pagination is used (recommended for verification documents only — see §12) |

### Standard Query Parameters for GET (List) Endpoints
| Param | Type | Notes |
|-------|------|-------|
| `academicYear` | string | `'2025-26'` etc. Global selector sends the selected year |
| `department` | string | department code (`CSE`…) or `all` |
| `repository` | string | repository name (`Academic`…) or `all` |
| `framework` | string | `NBA` \| `NAAC` \| `NIRF` \| `All` |
| `search` | string | free-text search |
| `status`, `priority` | string | enum filter values |

---

## 7. Authentication & Authorization

| Concern | Rule |
|---------|------|
| **Authentication** | JWT Bearer token, required on all endpoints |
| **Authorization** | IQAC Coordinator role required. 🔶 INFERRED — HOD/Principal must not access `/api/v1/iqac/**` (backend already models these roles separately) |
| **Institution scope** | The IQAC is an **institution-wide** role — it sees all departments. `institutionId` must be **derived from the authenticated user context**, never trusted from the request body |
| **Department scope** | IQAC has **no single department restriction** — it reads every department's readiness and acts on any HOD-approved evidence document. This is the key difference vs HOD (department-scoped) |
| **Write boundaries (✅ CONFIRMED from UI copy)** | IQAC "never uploads or approves departmental data" and "can only verify or raise observations on HOD-approved documents". Backend **must enforce**: verify/observation actions only when `hodStatus === 'approved'`; the IQAC can never set `hodStatus` |
| **Impersonation** | Frontend disables all write actions when `isImpersonating` (read-only preview). Backend does not need an endpoint-level equivalent (impersonation is a frontend auth concern), but each write API should re-validate role + institution server-side |

---

## 8. API Endpoint Summary

| # | Method | Endpoint | Screen | Action | Auth | Notes |
|---|--------|----------|--------|--------|------|-------|
| 1 | GET | `/api/v1/iqac/dashboard` | dashboard | Load KPIs + verification summary + gaps count | IQAC | aggregation endpoint |
| 2 | GET | `/api/v1/iqac/institution-readiness` | institution | Load repo-wise + dept-wise readiness | IQAC | `academicYear` optional |
| 3 | GET | `/api/v1/iqac/departments` | departments | Dept × repo matrix + drill-down data | IQAC | `academicYear`, `department`, `program`, `search` |
| 4 | GET | `/api/v1/iqac/repository-monitoring` | repository-monitoring | Per-repo operational counts | IQAC | `status` filter |
| 5 | GET | `/api/v1/iqac/accreditation` | accreditation | NBA/NAAC/NIRF scores + criteria | IQAC | framework tab data |
| 6 | GET | `/api/v1/iqac/gaps` | gaps | Auto-generated gap lists | IQAC | `scope` tab param |
| 7 | GET | `/api/v1/iqac/observations` | observations | List quality observations | IQAC | search + filters |
| 8 | POST | `/api/v1/iqac/observations` | observations | Raise observation | IQAC | create |
| 9 | PATCH | `/api/v1/iqac/observations/{id}` | observations | Update status / priority / resolution | IQAC | partial update |
| 10 | DELETE | `/api/v1/iqac/observations/{id}` | observations | Delete observation | IQAC | |
| 11 | GET | `/api/v1/iqac/initiatives` | improvement | List initiatives | IQAC | search + filters |
| 12 | POST | `/api/v1/iqac/initiatives` | improvement | Add initiative | IQAC | create |
| 13 | PATCH | `/api/v1/iqac/initiatives/{id}` | improvement | Update status / outcome / fields | IQAC | partial update |
| 14 | GET | `/api/v1/iqac/documents` | documents | List IQAC documents | IQAC | folder + search |
| 15 | POST | `/api/v1/iqac/documents` | documents | Upload document | IQAC | multipart |
| 16 | POST | `/api/v1/iqac/documents/{id}/versions` | documents | Add new version | IQAC | multipart + note |
| 17 | GET | `/api/v1/iqac/documents/{id}/download` | documents | Download document | IQAC | binary |
| 18 | GET | `/api/v1/iqac/verification/documents` | verification | List verification documents | IQAC | heavy filter set + pagination |
| 19 | POST | `/api/v1/iqac/verification/documents/{id}/verify` | verification / pending | Verify document | IQAC | only if HOD-approved |
| 20 | POST | `/api/v1/iqac/verification/documents/{id}/observations` | verification / pending | Raise document observation | IQAC | only if HOD-approved |
| 21 | PATCH | `/api/v1/iqac/verification/observations/{id}` | verification-observations | Update observation status / response | IQAC | department responds; IQAC may advance |
| 22 | POST | `/api/v1/iqac/verification/observations/{id}/verify` | verification-observations | Mark resolved observation verified | IQAC | only when `status === 'resolved'` |
| 23 | GET | `/api/v1/iqac/verification/summary` | dashboard / verification | Verification KPIs + dept/repo-wise | IQAC | aggregation |
| 24 | GET | `/api/v1/iqac/ai-insights` | ai-insights | Auto-generated recommendations | IQAC | 🔶 could also be client-derived (see §9.24) |
| 25 | GET | `/api/v1/iqac/analytics` | dashboard charts | 5-year trend series | IQAC | |
| 26 | GET | `/api/v1/iqac/reports/export` | reports | **Optional** server-side report export | IQAC | frontend exports client-side today; see §20 |

---

## 9. Detailed API Contracts

### 9.1 GET /api/v1/iqac/dashboard

**Purpose:** Everything `Dashboard.tsx` + `VerificationOverview.tsx` render on the landing view.
**Frontend Screen/Component:** `Dashboard.tsx`, `VerificationOverview.tsx`, `InstitutionalCharts.tsx`.
**Frontend Source:** `iqacKpis`, `departmentReadinessRows`, `departmentRepositories`, `institutionOverall`, `gapStats`, `summarizeVerification(...)`, `analyticsTrends`.
**Authentication/Authorization:** Bearer JWT, IQAC Coordinator.

**Query Parameters:** `academicYear` (optional; 🔶 INFERRED — the header selector changes this, and the year is passed down to re-render).

**Response (200)** — 🔶 INFERRED DTO (fields exactly as read by the UI):
```json
{
  "success": true,
  "message": "IQAC dashboard data",
  "data": {
    "kpis": {
      "repositoryReadiness": 84, "nbaReadiness": 75, "naacReadiness": 82,
      "nirfReadiness": 71, "evidenceCompletion": 76,
      "departmentsReady": 3, "departmentsNeedingAttention": 3, "criticalDepartments": 2,
      "criticalGaps": 2, "pendingHodApprovals": 14, "activeObservations": 7
    },
    "institutionOverall": {
      "repositoryCompletion": 84, "evidenceCompletion": 76,
      "nba": 75, "naac": 82, "nirf": 71
    },
    "departmentReadiness": [
      { "code": "CSE", "name": "Computer Science & Engineering", "repositoryCompletion": 92, "nba": 90, "naac": 91, "nirf": 88, "status": "ready" }
    ],
    "verificationSummary": {
      "totalDocuments": 624, "pendingHodApproval": 250,
      "approvedNotVerified": 235, "verified": 55, "observationRaised": 27,
      "rejected": 128, "criticalObservations": 3, "openObservations": 18,
      "departmentWise": [ { "department": "CSE", "total": 108, "verified": 9, "pending": 28 } ],
      "repositoryWise": [ { "repository": "Academic", "total": 118, "verified": 6, "pending": 32 } ]
    },
    "trends": {
      "years": ["2020-21", "2021-22", "2022-23", "2023-24", "2024-25"],
      "repositoryCompletion": [72, 76, 80, 82, 84],
      "accreditationReadiness": [68, 72, 76, 79, 82],
      "evidenceCompletion": [65, 70, 73, 75, 76]
    }
  }
}
```
> The 10 KPI cards read `iqacKpis.*`; `criticalObs` alerts read observations with `priority === 'critical' && status !== 'closed'`; the department summary reads `departmentReadinessRows` and the per-dept repository breakdown from `departmentRepositories`. Sample numbers above are illustrative of mock values (the real mock generates **624 verification documents** for 2025-26 — 39 folders × 2 evidence items × 8 departments).

**Notes:** `departmentReadiness` rows include `nba/naac/nirf` scores only if the backend aggregates them; alternatively the dashboard can reuse `/accreditation`. 🔶 either acceptable — keep one source of truth.

---

### 9.2 GET /api/v1/iqac/institution-readiness

**Purpose:** `InstitutionReadiness.tsx` — overall strip, expandable department-wise readiness, repository-wise institution summary.
**Frontend Source:** `institutionRepositories`, `institutionOverall`, `departmentReadinessRows`, `departmentRepositories`.

**Query Parameters:** `academicYear` (optional; 🔶 year-adjustment is client-side today via `departmentRepositoriesForYear`).

**Response (200)** — 🔶:
```json
{
  "success": true, "message": "Institution readiness",
  "data": {
    "overall": { "repositoryCompletion": 84, "evidenceCompletion": 76, "nba": 75, "naac": 82, "nirf": 71 },
    "departments": [
      {
        "code": "CSE", "name": "Computer Science & Engineering", "repositoryCompletion": 92, "status": "ready",
        "repositories": [
          { "repo": "Academic", "completion": 95, "approved": 81, "pending": 14, "missing": 5 },
          { "repo": "Faculty", "completion": 88, "approved": 76, "pending": 12, "missing": 12 }
        ]
      }
    ],
    "repositories": [
      { "repository": "Academic", "totalRecords": 2480, "approvedRecords": 2010, "missingRecords": 130,
        "evidenceCompletion": 88, "readiness": 87, "status": "ready" }
    ]
  }
}
```
> UI reads `repo.approved/pending/missing` (percentages), `repo.completion`, plus repository-level counts and `evidenceCompletion`/`readiness`/`status`.

---

### 9.3 GET /api/v1/iqac/departments

**Purpose:** `DepartmentReadiness.tsx` — filterable dept × repository matrix + **read-only drill-down** Department → Repository → Folder → Evidence.
**Frontend Source:** `departmentRepositoriesForYear`, `drillDownData`, `DEPARTMENT_OPTIONS`, `DEPARTMENT_PROGRAMS`, `PROGRAM_OPTIONS`.

**Query Parameters:**
| Param | Type | Values | Behavior |
|-------|------|--------|----------|
| `academicYear` | string | `all` \| `2025-26`… | client matrix is year-adjusted; 🔶 backend should accept and filter/adjust |
| `department` | string | `all` \| `CSE`… | row filter |
| `program` | string | `all` \| `B.Tech` \| `M.Tech` \| `MBA` \| `MCA` | dept-level program filter (client uses `DEPARTMENT_PROGRAMS`) |
| `search` | string | free text | matches `code` or `name` (case-insensitive) |

**Response (200)** — 🔶: same `departments[].repositories[]` shape as §9.2 plus a drill-down block:
```json
{
  "success": true, "message": "Department readiness",
  "data": {
    "matrix": [ { "code": "CSE", "name": "…", "readiness": 92, "status": "ready",
                  "repositories": [ { "repo": "Academic", "completion": 95 } ] } ],
    "drillDown": [
      {
        "code": "CSE", "name": "…",
        "repositories": [
          {
            "repository": "Academic", "completion": 95,
            "folders": [
              {
                "folder": "Academic Calendar", "required": 2,
                "evidence": [
                  { "name": "Approved Academic Calendar 2025-26.pdf", "fileType": "pdf", "size": "4.2 MB",
                    "status": "approved", "uploadedBy": "Dr. Anita Sharma", "date": "2025-01-10" }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```
> Evidence `status` enum: `approved | uploaded | pending | rejected`. 🔶 The drill-down is large (8 depts × 8 repos × folders); recommend lazy-loading per department (`GET /departments/{code}/drilldown`) instead of one payload if size is a concern — the frontend today builds all of it in memory.

---

### 9.4 GET /api/v1/iqac/repository-monitoring

**Purpose:** `RepositoryMonitoring.tsx` table + highlight cards.
**Frontend Source:** `repositoryMonitoringRows`.

**Query Parameters:** `status` (`all | ready | attention | critical` — client filters `statusOf(completion)`).

**Response (200)** — 🔶:
```json
{
  "success": true, "message": "Repository monitoring",
  "data": [
    { "repository": "Academic", "totalRecords": 2480, "pendingUploads": 84, "missingEvidence": 130,
      "pendingHodApproval": 69, "approvedRecords": 2010, "completion": 87, "status": "ready" }
  ]
}
```

---

### 9.5 GET /api/v1/iqac/accreditation

**Purpose:** `AccreditationReadiness.tsx` — NBA / NAAC / NIRF tabs.
**Frontend Source:** `nbaDeptScores`, `naacDeptScores`, `nirfDeptScores`, `NBA_CRITERIA`, `NAAC_CRITERIA`, `NIRF_PARAMETERS`, `NIRF_SHORT`, `naacCriteria`, `nirfParameters`, `iqacKpis`.

**Query Parameters:** `framework` (`nba | naac | nirf`; 🔶 optional — a single payload with all three is equally valid).

**Response (200)** — 🔶:
```json
{
  "success": true, "message": "Accreditation readiness",
  "data": {
    "nba": {
      "overall": 75,
      "criteria": [ { "name": "Vision, Mission & PEOs", "value": 88, "weight": 60 } ],
      "departments": [ { "dept": "CSE", "scores": [90, 92, 88, 91, 89, 87, 86], "overall": 90 } ]
    },
    "naac": {
      "overall": 82,
      "criteria": [ { "id": "1", "name": "Curricular Aspects", "weightage": 150, "completion": 88, "evidence": 85, "status": "in-progress" } ],
      "departments": [ { "dept": "CSE", "scores": [...], "overall": 91 } ]
    },
    "nirf": {
      "overall": 71,
      "parameters": [ { "id": "1", "name": "Teaching, Learning and Resources (TLR)", "weightage": 30, "score": 74 } ],
      "departments": [ { "dept": "CSE", "scores": [...], "overall": 88 } ]
    }
  }
}
```
> Criterion weights per framework are hardcoded in the component (`[60,80,120,120,100,80,40]`, `[150,200,250,100,100,100,100]`, `[30,30,20,10,10]`) — the backend may serve them (recommended) or leave them client-side.

---

### 9.6 GET /api/v1/iqac/gaps

**Purpose:** `GapAnalysis.tsx` — five scope tabs.
**Frontend Source:** `repositoryGaps`, `evidenceGaps`, `criterionGaps`, `departmentGaps`, `yearGaps`, `gapStats`.

**Query Parameters:** `scope` (`repository | evidence | criterion | department | year`; 🔶 optional — client tabs each dataset).

**Response (200)** — 🔶:
```json
{
  "success": true, "message": "Gap analysis",
  "data": {
    "stats": { "critical": 2, "total": 41 },
    "repository": [
      { "id": "gr-CSE-Academic", "scope": "repository", "department": "CSE", "repository": "Academic",
        "current": 78, "target": 85, "priority": "medium",
        "suggestedAction": "Track CSE Academic remaining uploads in the next weekly review." }
    ],
    "evidence": [ ],
    "criterion": [
      { "id": "gc-nba-2", "scope": "criterion", "framework": "NBA", "criterion": "C3 — Course Outcomes & POs",
        "current": 80, "target": 85, "priority": "high", "suggestedAction": "…" }
    ],
    "department": [ { "id": "gd-EEE", "scope": "department", "department": "EEE", "current": 63, "target": 85, "priority": "critical", "suggestedAction": "…" } ],
    "year": [ { "id": "gy-2021-22", "scope": "year", "criterion": "2021-22", "current": 72, "target": 90, "priority": "medium", "suggestedAction": "…" } ]
  }
}
```
> 🔶 The frontend **computes** these gaps client-side with `TARGET = 85` (90 for year scope). Backend should either expose the same computed lists or expose the raw inputs (§9.1/§9.5) so the client formula can run. Prefer server-computed gaps (banner says *"gaps are computed automatically from live repository and accreditation data"*).

---

### 9.7 GET /api/v1/iqac/observations

**Purpose:** `QualityObservations.tsx` list + stats.
**Frontend Source:** Redux `selectObservations` (seeded from `seedObservations`).

**Query Parameters:**
| Param | Values | Behavior |
|-------|--------|----------|
| `search` | free text | matches `title`, `department`, `repository` (case-insensitive) |
| `status` | `open | in-progress | resolved | closed` | exact match |
| `priority` | `low | medium | high | critical` | exact match |
| `department` | `all | CSE…` | exact match on code |
| `framework` | `All | NBA | NAAC | NIRF` | exact match |

**Response (200)** — 🔶 (array of `QualityObservation`, exact field names):
```json
{
  "success": true, "message": "Quality observations",
  "data": [
    {
      "id": "obs-1", "title": "Research Repository readiness below 70%",
      "department": "EEE", "repository": "Research", "academicYear": "2025-26",
      "framework": "NAAC", "criterion": "C3 — Research, Innovations & Extension",
      "priority": "critical", "description": "…", "recommendedAction": "…",
      "dueDate": "2026-02-15", "status": "open",
      "createdBy": "Dr. R. Kumar", "createdAt": "2026-01-05",
      "assignedTo": "Dr. Venkat Raman (EEE)"
    }
  ]
}
```
> The stats strip (Total/Open/In-Progress/Resolved/Closed/Critical-Active) is derived client-side from the returned list — 🔶 returning the full list (or adding a `stats` block) both work; the list must include `status` and `priority` per item.

---

### 9.8 POST /api/v1/iqac/observations

**Purpose:** Raise a quality observation (create dialog).
**Frontend Component:** `QualityObservations.tsx` (form) → `addObservation(input)`.
**Frontend Source:** `ObservationInput` = `{ title, department, repository, academicYear, framework, criterion?, priority, description, recommendedAction, dueDate }`.

**Request Body** — 🔶 (exact form fields):
```json
{
  "title": "Research Repository readiness below 70%",
  "department": "EEE", "repository": "Research", "academicYear": "2025-26",
  "framework": "NAAC", "criterion": "C3 — Research, Innovations & Extension",
  "priority": "critical",
  "description": "…", "recommendedAction": "…", "dueDate": "2026-02-15"
}
```

**Response (201)** — 🔶: the created `QualityObservation` with server-set `id`, `status: 'open'`, `createdBy` (from auth user), `createdAt` (today). Frontend unshifts new observations to the top (`state.observations.unshift(...)`), so sort newest-first.

**Validation (✅ from form):** `title`, `description`, `dueDate` required (toast "Please fill the title, description and due date."). `department`/`repository`/`academicYear`/`framework`/`priority` come from selects with defaults — required. `criterion` optional.

---

### 9.9 PATCH /api/v1/iqac/observations/{id}

**Purpose:** Update status / priority / resolution.
**Frontend Actions → Redux:**
- `setObservationStatus({ id, status, resolution? })` — status change; when set to `resolved` or `closed`, `resolution` and `resolvedAt` (today) are recorded. UI also offers a one-click "advance" (open→in-progress→resolved→closed) and "Close" (→ closed with a canned resolution string).
- `setObservationPriority({ id, priority })` — priority change only.

**Request Body** — 🔶 (partial update; at least one field):
```json
{ "status": "in-progress" }
```
or
```json
{ "status": "closed", "resolution": "Closed by IQAC after department update and HOD re-approval." }
```
or
```json
{ "priority": "high" }
```

**Response (200)** — 🔶: updated `QualityObservation`.
**Validation / Rules:**
- ⚠️ REQUIRES BUSINESS CONFIRMATION: allowed status transitions are not enforced by the frontend (any status selectable from the dropdown; the advance button implies `open → in-progress → resolved → closed`). Backend should decide whether to enforce a state machine (recommended) — mark as ⚠️.
- `resolution`/`resolvedAt` only meaningful for `resolved`/`closed` (✅ from reducer).

---

### 9.10 DELETE /api/v1/iqac/observations/{id}

**Purpose:** Delete an observation (`deleteObservation(id)`).
**Response (204/200):** 🔶 `ApiResponse` success; 404 if not found.

---

### 9.11 GET /api/v1/iqac/initiatives

**Purpose:** `ContinuousImprovement.tsx` list + stats.
**Query Parameters:** `search` (title/category/owner), `status`, `category`, `department` (dept code or `All Departments`).
**Response (200)** — 🔶: array of `ImprovementInitiative` (exact fields from §4.1).
> Stats (Total/Active/Delayed/Completed) derived client-side; `Active` = `in-progress || on-track`.

---

### 9.12 POST /api/v1/iqac/initiatives

**Purpose:** Add initiative (create dialog).
**Request Body** — 🔶 (`InitiativeInput`):
```json
{
  "title": "Outcome-Based Curriculum Revision 2026",
  "category": "Curriculum Revision", "department": "All Departments",
  "academicYear": "2025-26", "description": "…", "owner": "Dean Academics",
  "startDate": "2025-09-01", "targetDate": "2026-06-30",
  "status": "not-started", "outcome": ""
}
```
**Response (201):** 🔶 created `ImprovementInitiative` (server sets `id`). New items unshift to top.
**Categories (✅ from UI):** `Curriculum Revision | Faculty Development | Laboratory Enhancement | Student Skill Development | Research Promotion | Industry Interaction | Infrastructure Improvement`.
**Validation (✅ from form):** `title`, `owner`, `startDate`, `targetDate` required.

---

### 9.13 PATCH /api/v1/iqac/initiatives/{id}

**Purpose:** Update status or outcome (and `title/description/owner` via `updateInitiative`).
**Frontend Actions → Redux:**
- `updateInitiativeStatus({ id, status, outcome? })`
- `updateInitiative({ id, changes: { title?, description?, outcome?, owner? } })` — the Outcome dialog only sends `outcome`.

**Request Body** — 🔶 (partial):
```json
{ "status": "delayed" }
```
```json
{ "outcome": "Curriculum draft approved by BoS for 4 programs." }
```
**Response (200):** 🔶 updated `ImprovementInitiative`.

---

### 9.14 GET /api/v1/iqac/documents

**Purpose:** `SupportingDocuments.tsx` list with folder chips + search.
**Query Parameters:** `folder` (`all | IQAC Annual Reports | AQAR Reports | SSR Supporting Documents | Best Practices | Institutional Distinctiveness | Quality Policies | IQAC Meeting Minutes | Action Taken Reports | Annual Quality Plans | Other Supporting Documents`), `search` (matches `name`, `description`, `tags`).
**Response (200)** — 🔶: array of `IQACDocument` (exact fields from §4.1, including nested `versions`).

---

### 9.15 POST /api/v1/iqac/documents

**Purpose:** Upload a new IQAC supporting document.
**Frontend Form Fields (✅):** `folder` (select from `DOC_FOLDERS`), `name` (text, required), `description`, `fileType` (`pdf | docx | xlsx | pptx | zip`), `size` (free text e.g. `'1.2 MB'`), `tags` (comma-separated string → `string[]`).

**Request** — 🔶 multipart/form-data:
| Part | Type | Required |
|------|------|----------|
| `file` | binary | ✅ (🔶 INFERRED — the frontend records name/size/fileType but does not actually upload a file today; the metadata is manual) |
| `folder` | string | ✅ |
| `name` | string | ✅ (form requires it) |
| `description` | string | optional |
| `fileType` | string | ✅ |
| `tags` | string (comma-separated) | optional |
| `size` | string | optional (auto-detect from file preferred) |

**Response (201)** — 🔶: created `IQACDocument` with `id`, `uploadedBy` (auth user), `uploadedDate` (today), `versions: [ { version: 'v1', uploadedBy, uploadedDate, fileSize, note? } ]`.

---

### 9.16 POST /api/v1/iqac/documents/{id}/versions

**Purpose:** Add a new version (`addDocumentVersion({ id, note? })`).
**Request** — 🔶 multipart with `note` field (frontend sends a canned note "New version uploaded"). Version numbering is a client rule: `v1 → v2`, `v1.1 → v1.2` (never `v2.0`); backend should implement the same or return the new `version` string.
**Response (200):** 🔶 updated `IQACDocument` (new version at index 0, "Latest" badge = `versions[0]`).

---

### 9.17 GET /api/v1/iqac/documents/{id}/download

**Purpose:** Download a document.
**Response:** 🔶 binary file stream with `Content-Disposition: attachment`. Client today generates a placeholder locally (`downloadDocument`/`getDocUrl`); a backend endpoint should serve the real stored file.
**Security:** IQAC role + institution context; ⚠️ confirm whether all institutional users may read these documents.

---

### 9.18 GET /api/v1/iqac/verification/documents

**Purpose:** `VerificationView.tsx` browser (and via `useVerificationDocuments` also pending/verified lists).
**Frontend Source:** `verificationDocumentsForYear(year)`, `useVerificationDocuments` (overlays Redux decisions onto the year's seed docs).

**Query Parameters (✅ — every one is a client filter in `VerificationView`):**
| Param | Values | Notes |
|-------|--------|-------|
| `academicYear` | `2025-26`… or `all` | 'all' merges every year in `VERIFICATION_YEARS` |
| `department` | `all \| CSE…` | |
| `repository` | `all \| Academic…` | |
| `folder` | `all \| <folder>` | options derived from the current selection |
| `faculty` | `all \| <name>` | |
| `student` | `all \| <name>` | |
| `framework` | `All \| NBA \| NAAC \| NIRF` | document belongs to ≥1 framework |
| `iqacStatus` | `all \| not-verified \| verified \| observation-raised` | client param name: `verification` |
| `hodStatus` | `all \| approved \| pending \| rejected` | |
| `search` | free text | table search: name, department, repository, folder, faculty, student |
| `page`, `size` | ints | ✅ table paginates 10/page client-side → backend pagination recommended |
| `sort` | `name\|uploadedAt\|version` + `asc\|desc` | ✅ table sorts on these three keys, default `uploadedAt desc` |

**Response (200)** — 🔶 **paginated** Spring Page of `VerificationDocument` (exact fields from §4.2):
```json
{
  "success": true, "message": "Verification documents",
  "data": {
    "content": [
      {
        "id": "vdoc-2025-26-CSE-Academic-Academic Calendar-0",
        "name": "Approved Academic Calendar 2025-26.pdf",
        "department": "CSE", "departmentName": "Computer Science & Engineering",
        "academicYear": "2025-26", "repository": "Academic", "folder": "Academic Calendar",
        "category": "Academic Calendar", "faculty": "Dr. Anita Sharma",
        "fileType": "pdf", "size": "4.2 MB", "uploadedBy": "Dr. Anita Sharma",
        "uploadedAt": "2025-02-03", "lastModified": "2025-04-02", "version": 1,
        "frameworks": ["NAAC", "NBA"],
        "hodStatus": "approved", "hodApprovedAt": "2025-03-02",
        "iqacStatus": "not-verified"
      }
    ],
    "page": 0, "size": 10, "totalElements": 235, "totalPages": 24
  }
}
```
> **Pagination:** client default `pageSize = 10`, resets to page 1 on search. 🔶 Recommend backend pagination here (only list in the module with real volume).

---

### 9.19 POST /api/v1/iqac/verification/documents/{id}/verify

**Purpose:** Verify an HOD-approved document (`VerifyDocumentDialog` → `verifyDocument({ id, comments, hodApproved })`).
**Request Body** — 🔶:
```json
{ "comments": "Evidence consistent with repository claims." }
```
**Rules (✅ CONFIRMED from slice guard + dialog):**
- **Only allowed when `hodStatus === 'approved'`** — the reducer ignores the action otherwise; backend must enforce the same (`WorkflowStatus.IQAC_VERIFICATION` transition exists in the backend workflow engine).
- Terminal: verified documents show no verify/observation actions (✅ UI).
**Response (200):** 🔶 updated `VerificationDocument` with `iqacStatus: 'verified'`, `verifiedBy` (auth user), `verifiedAt` (today), `comments`.
**Side effect (✅):** a success notification is created (`addNotification`) — 🔶 optional backend notification API (see §23).

---

### 9.20 POST /api/v1/iqac/verification/documents/{id}/observations

**Purpose:** Raise a document-level observation instead of rejecting (`RaiseObservationDialog` → `raiseObservation`).
**Request Body** — 🔶 (exact dialog fields):
```json
{
  "title": "Uploaded copy is missing signature page",
  "priority": "medium",
  "description": "…",
  "recommendedCorrection": "Review completeness and re-upload the corrected document, then notify the HOD for re-approval.",
  "dueDate": "2026-02-10"
}
```
**Response (201):** 🔶 created `EvidenceObservation` (server sets `id`, `documentId`, `documentName`, `department`, `repository`, `folder`, `category`, `faculty`/`student`, `status: 'open'`, `raisedBy` = auth user, `raisedAt` = today) **and** the document's `iqacStatus` becomes `observation-raised` (✅ reducer sets both).
**Rules:** only HOD-approved documents (✅); all five fields required (toast on empty).

---

### 9.21 PATCH /api/v1/iqac/verification/observations/{id}

**Purpose:** Update a verification observation's status and response.
**Frontend Action → Redux:** `updateObservationStatus({ id, status, response? })`.
- ✅ The **department coordinator** responds (the UI copy says "Department coordinator responds — moves an observation forward"; the IQAC view shows "Waiting for department to resolve").
- Statuses: `open | in-progress | resolved | verified`. Setting `resolved` records `respondedAt` (today). `verified` is only reachable via §9.22 (⚠️ verify the state machine server-side).

**Request Body** — 🔶:
```json
{ "status": "resolved", "response": "Department is compiling the corrected evidence." }
```
**Response (200):** 🔶 updated `EvidenceObservation`.
**Authorization note:** ⚠️ REQUIRES BUSINESS CONFIRMATION — the frontend allows the IQAC to move `open → in-progress` (advance buttons only appear on the HOD module, not here), but the workflow copy implies department-owned responses. Confirm who may PATCH status vs. who may only POST a response.

---

### 9.22 POST /api/v1/iqac/verification/observations/{id}/verify

**Purpose:** IQAC confirms a **resolved** observation and flips the document to verified (`markObservationVerified`).
**Rules (✅ CONFIRMED):** only when `status === 'resolved'` — the view blocks with toast *"Observation must be resolved by the department before it can be verified."* Also sets the document `iqacStatus: 'verified'` with comment *"Verified after the raised observation was resolved."* (⚠️ confirm whether to keep the canned comment).
**Request Body:** none (🔶 optional `comments`).
**Response (200):** 🔶 updated `EvidenceObservation` (`status: 'verified'`, `verifiedAt`).

---

### 9.23 GET /api/v1/iqac/verification/summary

**Purpose:** `VerificationOverview.tsx` cards + dept/repo-wise bars; also used by layout badges (`pending-verification`, `verification-observations` counts).
**Frontend Source:** `summarizeVerification(documents, observations)`.
**Query Parameters:** `academicYear` (🔶; default current year).
**Response (200)** — 🔶: `VerificationSummary` shape exactly as §4.2 (`departmentWise`, `repositoryWise`, counts).

---

### 9.24 GET /api/v1/iqac/ai-insights

**Purpose:** `AIInsights.tsx`.
**Frontend Behavior (✅):** insights are **computed client-side** in `buildInsights(observations)` from `institutionRepositories`, `repositoryGaps`, `departmentGaps` and live observations — with `AiInsight` shape `{ id, domain: 'Repository'|'Faculty'|'Research'|'Infrastructure'|'Student'|'Quality', title, description, severity: 'high'|'medium'|'low', department? }`. The "Regenerate" button merely re-derives locally + bumps the timestamp.
**Recommendation:** 🔶 Two options — (a) keep client-side (frontend already derives it, **NO API REQUIRED**), or (b) add `GET /api/v1/iqac/ai-insights` for a future server-generated version. Documented as optional; a backend may skip it.

---

### 9.25 GET /api/v1/iqac/analytics

**Purpose:** `InstitutionalCharts.tsx` trend line chart.
**Frontend Source:** `analyticsTrends` (years + 3 series used: `repositoryCompletion`, `accreditationReadiness`, `evidenceCompletion`).
**Response (200)** — 🔶:
```json
{ "success": true, "message": "Analytics trends",
  "data": { "years": ["2020-21","2021-22","2022-23","2023-24","2024-25"],
            "repositoryCompletion": [72,76,80,82,84],
            "accreditationReadiness": [68,72,76,79,82],
            "evidenceCompletion": [65,70,73,75,76] } }
```

---

### 9.26 GET /api/v1/iqac/reports/export

**Purpose:** **Optional** server-side report export. The frontend already exports PDF/Excel **fully client-side** (`report-export.ts`, `verification-report-export.ts`) using `jsPDF`, `jspdf-autotable`, `XLSX`, `file-saver` — **no backend endpoint is strictly required**.
**If implemented:** `GET /api/v1/iqac/reports/export?type=institution|department|repository|gaps|observations|improvement|nba|naac|nirf&format=pdf|xlsx` (and `.../verification/reports` for the 5 verification report types). See §20.

---

## 10. DTO Definitions

| DTO | Source (frontend type) | Purpose |
|-----|------------------------|---------|
| `ObservationCreateRequest` | `ObservationInput` | POST §9.8 |
| `ObservationUpdateRequest` | `{ status?, priority?, resolution? }` | PATCH §9.9 |
| `InitiativeCreateRequest` | `InitiativeInput` | POST §9.12 |
| `InitiativeUpdateRequest` | `{ status?, outcome?, title?, description?, owner? }` | PATCH §9.13 |
| `DocumentUploadRequest` | `IQACDocumentInput` | POST §9.15 |
| `DocumentVersionRequest` | `{ note? }` + file | POST §9.16 |
| `VerifyDocumentRequest` | `{ comments? }` | POST §9.19 |
| `RaiseVerificationObservationRequest` | `{ title, priority, description, recommendedCorrection, dueDate }` | POST §9.20 |
| `VerificationObservationUpdateRequest` | `{ status?, response? }` | PATCH §9.21 |
| `DashboardResponse` | `iqacKpis + institutionOverall + departmentReadinessRows + VerificationSummary + trends` | GET §9.1 |
| `VerificationDocumentResponse` | `VerificationDocument` | GET §9.18 |
| `EvidenceObservationResponse` | `EvidenceObservation` | §9.20–9.22 |
| All list responses | exact field names from §4 | §9.2–9.7, 9.11, 9.14 |

---

## 11. Enum Definitions

> **Exact frontend values.** Backend may use its own SCREAMING_SNAKE representation internally but must serialize to these values (or provide the documented mapping).

### 11.1 Observation priority (`ObservationPriority`, `types.ts`)
`low | medium | high | critical`

### 11.2 Quality observation status (`ObservationStatus`, `types.ts`)
`open | in-progress | resolved | closed`

### 11.3 Accreditation framework (`AccreditationFramework`, `types.ts`)
`NBA | NAAC | NIRF | All`

### 11.4 Traffic status (`TrafficStatus`, `types.ts`) — readiness thresholds
`ready` (≥85) | `attention` (70–84) | `critical` (<70) — thresholds hardcoded in `statusOf()`.

### 11.5 Initiative status (`InitiativeStatus`, `types.ts`)
`not-started | in-progress | on-track | delayed | completed`

### 11.6 Initiative category (free-form strings from UI; 🔶 suggest backend enum)
`Curriculum Revision | Faculty Development | Laboratory Enhancement | Student Skill Development | Research Promotion | Industry Interaction | Infrastructure Improvement`

### 11.7 HOD approval status (`HodApprovalStatus`, `verification-data.ts`)
`pending | approved | rejected` — **read-only for IQAC** (owned by HOD).

### 11.8 IQAC verification status (`IqacVerificationStatus`, `verification-data.ts`)
`not-verified | verified | observation-raised`

### 11.9 Verification observation status (`EvidenceObservationStatus`, `verification-data.ts`)
`open | in-progress | resolved | verified`

### 11.10 Verification file type (`VerificationFileType`, `verification-data.ts`)
`pdf | docx | xlsx | pptx | zip | image | other`

### 11.11 IQAC document file type (`IQACDocument['fileType']`, `types.ts`)
`pdf | docx | xlsx | pptx | zip`

### 11.12 Gap scope (`IqaGap.scope`, `iqac-data.ts`)
`repository | evidence | criterion | department | year`

### 11.13 Gap priority (`IqaGap.priority`)
`low | medium | high | critical`

### 11.14 Drill-down evidence status (`DrillEvidence.status`, `iqac-data.ts`)
`approved | uploaded | pending | rejected`

### 11.15 AI insight domain (`AiInsight.domain`, `AIInsights.tsx`)
`Repository | Faculty | Research | Infrastructure | Student | Quality`
(Note: the shared principal `AiRecommendation.domain` has a different, wider set — `Repository | NBA | NAAC | NIRF | Faculty | Infrastructure | Student | Research | Placement`. Don't conflate the two.)

### 11.16 AI insight severity (`AiInsight.severity`)
`high | medium | low`

### 11.17 Departments (codes)
`CSE | ECE | EEE | MECH | CIVIL | IT | AIML | DS`

### 11.18 Repositories (names — `REPOSITORY_LIST`)
`Academic | Faculty | Student | Research | Infrastructure | Examination | Alumni | Placement`

### 11.19 Programs (filter values)
`B.Tech | M.Tech | MBA | MCA` (client `PROGRAM_OPTIONS`)

### 11.20 Document folders (`DOC_FOLDERS`)
`IQAC Annual Reports | AQAR Reports | SSR Supporting Documents | Best Practices | Institutional Distinctiveness | Quality Policies | IQAC Meeting Minutes | Action Taken Reports | Annual Quality Plans | Other Supporting Documents`

---

## 12. Pagination

| Screen | Pagination type | Detail |
|--------|-----------------|--------|
| Verification documents (§9.18) | ✅ **Frontend pagination today** → 🔶 backend pagination recommended | `VerificationDocumentTable` paginates `pageSize = 10`, prev/next buttons, `Page x / y` label, resets to page 1 on search. Volume is large (mock: **624 docs/year** — 39 folders × 2 evidence × 8 departments — × 5 years); recommend Spring Page `{ content, page, size, totalElements, totalPages }` |
| All other lists (observations, initiatives, documents, readiness, gaps, accreditation) | ✅ Frontend full-list render (no pagination) | Return full arrays |
| Reports preview | N/A | `VerificationReportsView` slices `rows.slice(0, 50)` client-side |

---

## 13. Search

| Screen | Search fields (✅ from implementation) | API param |
|--------|----------------------------------------|-----------|
| Department Readiness | department `code`, `name` | `search` |
| Quality Observations | `title`, `department`, `repository` | `search` |
| Continuous Improvement | `title`, `category`, `owner` | `search` |
| Institutional Reports | report `name`, `description` (client-side only, static list) | `search` (optional) |
| AI Insights | insight `title`, `description` (client-side) | `search` (optional) |
| Supporting Documents | document `name`, `description`, `tags` | `search` |
| Verification documents | `name`, `department`, `repository`, `folder`, `faculty`, `student` | `search` |
All searches are case-insensitive substring matches (`.toLowerCase().includes()`).

---

## 14. Filters

| Screen | Filter | Type / values | API param |
|--------|--------|---------------|-----------|
| Department Readiness | Academic Year | `all \| 2025-26…` | `academicYear` |
| Department Readiness | Department | `all \| CSE…` | `department` |
| Department Readiness | Program | `all \| B.Tech \| M.Tech \| MBA \| MCA` | `program` |
| Repository Monitoring | Status | `all \| ready \| attention \| critical` | `status` |
| Quality Observations | Status | `all \| open \| in-progress \| resolved \| closed` | `status` |
| Quality Observations | Priority | `all \| low \| medium \| high \| critical` | `priority` |
| Quality Observations | Department | `all \| CSE…` | `department` |
| Quality Observations | Framework | `all \| NBA \| NAAC \| NIRF \| All` | `framework` |
| Continuous Improvement | Status | `all \| InitiativeStatus` | `status` |
| Continuous Improvement | Category | `all \| <7 categories>` | `category` |
| Continuous Improvement | Department | `all \| code \| All Departments` | `department` |
| Supporting Documents | Folder | `all \| DOC_FOLDERS` | `folder` |
| AI Insights | Domain | `all \| Repository \| Faculty \| Research \| Infrastructure \| Student \| Quality` | `domain` (optional) |
| Verification (§9.18) | Year / Dept / Repo / Folder / Faculty / Student / Framework / iqacStatus / hodStatus | as documented in §9.18 | one param each |

---

## 15. Sorting

Only the **verification document table** sorts (✅ `VerificationDocumentTable.tsx`):
- Sortable columns: `name`, `uploadedAt` (the header also shows **Last Modified** bound to the same `uploadedAt` key), `version`.
- Direction toggle: `asc` ↔ `desc`; default `uploadedAt desc`.
- API params: 🔶 `sort=name|uploadedAt|version`, `order=asc|desc` (or Spring `sort=uploadedAt,desc`).
All other tables render in source order; the mock generation sorts some datasets (e.g. gaps) at build time.

---

## 16. Entity & Relationship Requirements

```
Institution (derived from JWT)
   └── IQAC Coordinator (user, IQAC_COORDINATOR role)  ← institution-wide scope
         ├── QualityObservation ──→ Department, Repository, AcademicYear, Framework/Criterion
         ├── ImprovementInitiative ──→ Department (or 'All Departments'), Category, AcademicYear
         ├── IQACDocument ──→ IQACDocVersion[] (1..n), Folder, Tags
         └── Evidence Verification
               ├── VerificationDocument ──→ Department, Repository, Folder, Faculty?/Student?,
               │        AcademicYear, Frameworks[], HOD lifecycle + IQAC lifecycle
               └── EvidenceObservation ──→ VerificationDocument (documentId), Department,
                        Repository, Folder, Priority, DueDate, status lifecycle
Read-only projections (no IQAC ownership):
   DepartmentRepositoryData ──→ Department ──→ 8 Repositories ──→ DeptRepoRow (completion/approved/pending/missing)
   DeptCriterionScore (NBA/NAAC/NIRF) ──→ Department, Framework, Criteria
   PrincipalGap / IqaGap ──→ Department, Repository, Framework/Criterion, AcademicYear
```

| Resource | Owner | Institution rel. | Department rel. | Parent | Children | Referenced by |
|----------|-------|------------------|-----------------|--------|----------|---------------|
| `QualityObservation` | IQAC | institution | department (code) | — | — | Repository, Framework, AY |
| `ImprovementInitiative` | IQAC | institution | department or `'All Departments'` | — | — | Category, AY |
| `IQACDocument` | IQAC | institution | — | — | `IQACDocVersion[]` | Folder, Tags |
| `VerificationDocument` | Department coordinator (upload) → HOD (approve) → IQAC (verify) | institution | department | Department → Repository → Folder | — | Frameworks |
| `EvidenceObservation` | IQAC (raise) / dept (respond) | institution | department | `VerificationDocument` | — | Priority, DueDate |
| Readiness / Accreditation / Gaps | Backoffice/aggregation (shared with Principal) | institution | department | — | — | Principal + IQAC + HOD views |

> **Key integrity rule (✅ CONFIRMED):** a `VerificationDocument` carries **two independent lifecycles** — HOD approval (`pending → approved → rejected`, IQAC read-only) and IQAC verification (`not-verified → verified | observation-raised`). IQAC actions are gated on `hodStatus === 'approved'`. A rejected document is never verifiable.

---

## 17. Institution / Department Data Isolation

| Concern | Rule |
|---------|------|
| **Institution isolation** | IQAC is institution-scoped: `institutionId` from the authenticated user's JWT/context. All queries must filter by institution — the IQAC of Institution A must never see Institution B's observations, documents, or verification queues |
| **Department isolation** | **None for reads** — the IQAC intentionally views all departments (institution-wide auditor). Department-level "isolation" here means: reads return per-department rows keyed by `department` code; the IQAC may **not** mutate departmental data |
| **Write boundaries** | IQAC writes only: observations, initiatives, documents, verification decisions. IQAC can **never** write `hodStatus`, upload/edit evidence documents, or approve records (✅ UI copy: "IQAC does not approve evidence") |
| **Derived context** | Never trust `department`/`institutionId`/`departmentId` from the request body for authorization — derive institution from auth; validate department codes against the institution's department set server-side |

---

## 18. File Upload / Download APIs

| Feature | Endpoint (🔶) | Method | Multipart fields | Response | Notes |
|---------|---------------|--------|------------------|----------|-------|
| Upload IQAC document | `/api/v1/iqac/documents` | POST | `file`, `folder`, `name`, `description?`, `fileType`, `tags?`, `size?` | 201 `IQACDocument` | max size 🔶 (define; suggest 25 MB), allowed types `pdf/docx/xlsx/pptx/zip` (✅ from UI) |
| Add document version | `/api/v1/iqac/documents/{id}/versions` | POST | `file`, `note?` | 200 `IQACDocument` | version numbering rule per §9.16 |
| Download document | `/api/v1/iqac/documents/{id}/download` | GET | — | binary stream | `Content-Disposition: attachment` |
| Download evidence doc | `/api/v1/iqac/verification/documents/{id}/download` | GET | — | binary stream | 🔶 INFERRED — frontend currently generates a placeholder blob client-side (`downloadDocument`); a real backend should serve the stored file |
| Preview evidence doc | (client-side placeholder) | — | — | — | 🔶 optional `GET .../preview` if real file preview is wanted |

**Authorization (✅ CONFIRMED frontend rule, 🔶 backend enforcement):** only **HOD-approved** documents are verifiable; only IQAC can verify. Downloads are available to any IQAC user in the institution. ⚠️ Confirm whether document download should be restricted to IQAC only or shared with other roles.

---

## 19. Dashboard APIs

`GET /api/v1/iqac/dashboard` (see §9.1) is the single aggregation endpoint recommended for `Dashboard.tsx`. It must return:
- KPI values (`iqacKpis.*`) — repository/NAAC/NAAC/NIRF readiness %, evidence completion, departments ready/attention/critical, critical gaps, pending HOD approvals, active observations.
- `institutionOverall` (5 metrics for the gauge + bars).
- Department readiness summary rows (with per-dept top/weakest repository — client derives these from the repo list, so include `repositories[].completion`).
- **Verification summary** (`VerificationOverview` widget) — 🔶 either embed the `VerificationSummary` or let the widget call `GET /api/v1/iqac/verification/summary` (§9.23). Embedding is simpler (one call); separate endpoint is cleaner for the verification sub-views. Document both options.
- **Charts** — trend series from `GET /api/v1/iqac/analytics` (§9.25); observation-status distribution is derived from the observations list (client-side).

---

## 20. Reports / Export APIs

| Screen | Report types (✅) | Export today | Backend needed? |
|--------|-------------------|--------------|-----------------|
| Institutional Reports | `institution, department, repository, gaps, observations, improvement, nba, naac, nirf` | ✅ Client-side PDF (`jsPDF` + `jspdf-autotable`) & Excel (`XLSX` + `file-saver`) | **NO — working client-side**; optional server endpoint §9.26 |
| Verification Reports | `department, repository, observations, completion, summary` | ✅ Client-side PDF/Excel + inline preview | **NO — working client-side** |

**Recommendation:** keep exports client-side (they work and reduce backend load). If server-side export is later required for fidelity/archival, implement `GET /api/v1/iqac/reports/export?type=…&format=…` per §9.26 — the exact column sets are defined in `report-export.ts` / `verification-report-export.ts` (reproduce them server-side verbatim).

---

## 21. Mock Data Replacement Map

| # | Mock source | Variable/function | Used by | Fields | Intended backend source | Proposed API |
|---|-------------|-------------------|---------|--------|------------------------|--------------|
| 1 | `iqac-data.ts` | `IQAC_NAME` | seeds, dialogs | `'Dr. R. Kumar'` | Auth user display name | — (from JWT) |
| 2 | `iqac-data.ts` | `ACADEMIC_YEARS` | year selectors | `['2025-26'…'2021-22']` | Static config / academic calendar service | 🔶 config endpoint or shared constant |
| 3 | `iqac-data.ts` | `REPOSITORY_LIST`, `FRAMEWORK_OPTIONS`, `DEPARTMENT_OPTIONS`, `PROGRAM_OPTIONS` | filters, forms | 8 repos / 4 frameworks / 8 depts / 4 programs | Institution config | 🔶 shared config or hardcode |
| 4 | `iqac-data.ts` | `BASE_RECORDS`, `institutionRepositories`, `institutionOverall` | InstitutionReadiness, Dashboard | record counts, readiness | Repository aggregation service | `GET /institution-readiness`, `GET /dashboard` |
| 5 | `iqac-data.ts` | `departmentReadinessRows`, `departmentReadinessForYear`, `departmentRepositoriesForYear` | Dashboard, InstitutionReadiness, DepartmentReadiness | dept readiness + NBA/NAAC/NIRF | Repository + accreditation aggregation | `GET /departments` |
| 6 | `iqac-data.ts` | `drillDownData` | DepartmentReadiness drill-down | dept → repo → folder → evidence | Evidence repository service | `GET /departments` (or lazy `GET /departments/{code}/drilldown`) |
| 7 | `iqac-data.ts` | `repositoryMonitoringRows` | RepositoryMonitoring | pending uploads/missing evidence/approvals | Repository + workflow aggregation | `GET /repository-monitoring` |
| 8 | `iqac-data.ts` | `seedObservations` | QualityObservations (seeded into Redux) | 8 observations | Observation service | `GET/POST/PATCH/DELETE /observations` |
| 9 | `iqac-data.ts` | `seedInitiatives` | ContinuousImprovement (seeded) | 7 initiatives | Initiative service | `GET/POST/PATCH /initiatives` |
| 10 | `iqac-data.ts` | `seedDocuments` | SupportingDocuments (seeded) | 10 documents + versions | Document storage service | `GET/POST /documents`, `POST /documents/{id}/versions` |
| 11 | `iqac-data.ts` | `DOC_FOLDERS` | document folder chips | 10 folders | Static config | 🔶 config |
| 12 | `iqac-data.ts` | `iqacKpis` | Dashboard | KPI values | Aggregation service | `GET /dashboard` |
| 13 | `verification-data.ts` | `verificationDocuments`, `verificationDocumentsForYear` | all verification views | 624 docs/year (39 folders × 2 evidence × 8 depts) | Evidence document service + HOD/IQAC workflow status | `GET /verification/documents` |
| 14 | `verification-data.ts` | `buildSeedVerificationMap`, `buildSeedObservations` | verification slices | verification entries + observations | Verification service | `POST …/verify`, `POST …/observations`, `PATCH …/observations/{id}`, `POST …/observations/{id}/verify` |
| 15 | `verification-data.ts` | `summarizeVerification` | Dashboard widget + verification views | summary counts | Aggregation service | `GET /verification/summary` |
| 16 | `principal-data.ts` | `departmentRepositories`, `nbaDeptScores`, `naacDeptScores`, `nirfDeptScores`, `principalGaps`, `analyticsTrends`, `aiRecommendations` | shared readiness/accreditation/gaps/charts | matrices, gaps, trends | Shared aggregation (same source as Principal module) | `GET /institution-readiness`, `/accreditation`, `/gaps`, `/analytics` |
| 17 | `principal-configs.ts` | `kpiData`, `institutionStats`, `naacCriteria`, `nirfParameters` | Dashboard, AccreditationReadiness | KPIs, NAAC criteria, NIRF params | Shared config + aggregation | `GET /dashboard`, `/accreditation` |
| 18 | `store/slices/iqacSlice.ts` | localStorage `accreditpro-iqac` | observations/initiatives/documents state | live CRUD | Backend persistence | all observation/initiative/document APIs |

---

## 22. Frontend Contract Gaps

1. **No API calls exist** — every endpoint in §9 is 🔶 INFERRED from UI behaviour; field names are exact but the transport/status codes are proposed.
2. **Mock evidence document download** — `downloadDocument` creates a placeholder text blob with the document JSON rather than the real file; the backend must serve actual stored files (file storage location/size limits ⚠️ undefined).
3. **Manual document metadata** — the upload form takes `name`, `fileType`, `size` as free text; the real file is never uploaded. Backend should prefer deriving name/type/size from the uploaded binary; frontend contract expects them returned in the response.
4. **Client-side report exports** — PDF/Excel generation is fully client-side and works; the `reports/export` endpoint is optional. Don't implement server-side export expecting the frontend to call it — the frontend won't.
5. **Verification document volume** — the mock generates ~858 documents/year × 5 years; a real backend must paginate (§9.18). Frontend paginates client-side at 10/page — align backend `page/size` semantics with the client's 1-based page display (client shows `Page x / y` and `Showing a–b of n`).
6. **`sort` mismatch** — the table's **Last Modified** column header is bound to the `uploadedAt` sort key (a frontend quirk, `SortHeader label="Last Modified" column="uploadedAt"`); there is no `lastModified` sort. Document this so backend sort params match the frontend keys.
7. **Global vs local year selectors** — the page header uses global `uiSlice.selectedAcademicYear`, but `DepartmentReadiness` defaults its own `year` to `'all'` and the verification views default to `'2025-26'` locally. The backend should accept `academicYear` per-endpoint (not rely on a single global).
8. **`department` value in observations/initiatives** — the same field holds a dept code (`CSE`) **or** `'All Departments'` / `'All'`-style values in different places; backend validation must permit both where applicable.
9. **`criterion` free text** — observation `criterion` is a free-text input (e.g. `"C3 — Research, Innovations & Extension"`); no controlled vocabulary is enforced client-side.
10. **Verification observation status ownership** — `updateObservationStatus` (status + response) is called by "the department coordinator" per comments, but the IQAC's `VerificationObservationsView` has no way to PATCH status directly (only Verify after resolved). The HOD module advances statuses on its own copy. Confusing ownership → document ⚠️ (see §23.5).
11. **`verified` reachable two ways** — a document becomes `verified` either via direct Verify (§9.19) or via `markObservationVerified` after a raised observation resolves (§9.22). Backend should treat both as the same terminal state.
12. **Hardcoded display values** — "Updated 5 min ago" (GapAnalysis banner), "Projected Grade A", "Projected Band 101–150", NIRF/NBA stat cards, IQAC name, "(Current)" marker on 2025-26. These are static UI strings, not API data — but flag for future real metrics.
13. **Notifications** — `addNotification` fires on verify/raise/mark-verified with canned messages; the uiSlice notification list is purely client-side. No backend notification API exists; decide in §23.7 whether server-side notifications are needed.
14. **No department-name service** — the HOD widget resolves department names to codes via a client heuristic (`resolveDepartmentCode`); the IQAC module uses `departmentName` on each verification document. Backend should return both `department` (code) and `departmentName` consistently.

---

## 23. Business Rules Requiring Confirmation

1. **Observation status state machine** — is `open → in-progress → resolved → closed` the enforced order? Can statuses skip/jump? Who may set `resolved`/`closed` (IQAC only, or also dept coordinator)?
2. **Who can delete observations** — the IQAC UI allows deleting any observation, including closed ones. Confirm whether delete is permitted after `closed`, and whether audit history is required.
3. **Initiative fields** — can `status` regress (e.g. `completed → in-progress`)? Are `outcome` values required before `completed`?
4. **Document versioning** — is the `v1 → v2 / v1.1 → v1.2` scheme correct, or should it be `1, 2, 3…`? Are old versions retained for download?
5. **Verification observation ownership** — who advances `open → in-progress → resolved`: the department coordinator (per code comments) or the IQAC? The current IQAC view only allows Verify (resolved → verified).
6. **Direct verify vs observation-verify** — should a raised observation be required before verification in any case, or is direct verification always permitted for HOD-approved documents? (Frontend allows both.)
7. **Notifications** — should verify/observation actions create server-side notifications for the HOD / dept coordinator, or is the client-side toast/bell sufficient?
8. **`ObservationInput` defaults** — the create dialog defaults `department: 'CSE'`, `framework: 'NAAC'`, `priority: 'medium'`, `academicYear: '2025-26'`. Confirm these as business defaults or require explicit selection.
9. **Report archival** — are client-side PDF/Excel exports sufficient, or must reports be stored/regenerated server-side (e.g. for NAAC submission records)?
10. **Readiness thresholds** — `ready ≥85 / attention 70–84 / critical <70` and gap `TARGET = 85` (90 for year gaps) are hardcoded; confirm as institutional policy constants served by backend config.
11. **IQAC department scope** — confirmed institution-wide for reads; ⚠️ confirm whether any department-specific IQAC users exist (a future sub-role) that would need `department` scoping on write actions.

---

## 24. Backend Implementation Checklist

### Controllers
- [ ] `IQACDashboardController` — `GET /api/v1/iqac/dashboard` (§9.1)
- [ ] `IQACReadinessController` — `GET /institution-readiness`, `GET /departments`, `GET /repository-monitoring`, `GET /accreditation`, `GET /gaps`, `GET /analytics`
- [ ] `IQACObservationController` — `GET/POST /observations`, `PATCH /observations/{id}`, `DELETE /observations/{id}`
- [ ] `IQACInitiativeController` — `GET/POST /initiatives`, `PATCH /initiatives/{id}`
- [ ] `IQACDocumentController` — `GET/POST /documents`, `POST /documents/{id}/versions`, `GET /documents/{id}/download`
- [ ] `IQACVerificationController` — `GET /verification/documents`, `GET /verification/summary`, `POST /verification/documents/{id}/verify`, `POST /verification/documents/{id}/observations`, `PATCH /verification/observations/{id}`, `POST /verification/observations/{id}/verify`
- [ ] (Optional) `IQACReportController` — `GET /reports/export` (§9.26)
- [ ] Swagger `@Tag("IQAC Coordinator")` + role guard on every endpoint

### DTOs
- [ ] Request DTOs per §10 (exact camelCase field names)
- [ ] Response DTOs mirroring `QualityObservation`, `ImprovementInitiative`, `IQACDocument`, `VerificationDocument`, `EvidenceObservation`, `VerificationSummary` (§4)
- [ ] `ApiResponse<T>` wrapper on all endpoints

### Services
- [ ] Aggregation service for readiness/KPIs/gaps/trends (reuse principal dashboard aggregation where possible — same shared source)
- [ ] Observation service (CRUD + status/priority transitions + resolution timestamps)
- [ ] Initiative service (CRUD + status/outcome updates)
- [ ] Document storage service (upload, versioning, download; enforce allowed types + max size)
- [ ] Verification service (gate on `hodStatus === 'approved'`; verify, raise observation, observation status updates, resolved→verified)
- [ ] Summary/analytics service (`VerificationSummary`, trend series)

### Repositories
- [ ] `QualityObservationRepository` (institution-scoped, filters)
- [ ] `ImprovementInitiativeRepository`
- [ ] `IQACDocumentRepository` + document version table
- [ ] `EvidenceDocumentRepository` (or reuse existing evidence/verification repositories) with dual `hodStatus`/`iqacStatus` queries
- [ ] `VerificationObservationRepository`

### Entities
- [ ] `QualityObservation` (institutionId, departmentCode, repository, academicYear, framework, criterion, priority, description, recommendedAction, dueDate, status, createdBy/At, assignedTo, resolution, resolvedAt)
- [ ] `ImprovementInitiative` (…category, owner, startDate, targetDate, status, outcome)
- [ ] `IQACDocument` + `IQACDocumentVersion` (folder, name, description, fileType, size, tags, uploadedBy/Date, version, note)
- [ ] `EvidenceVerification` / document status join (or extend existing evidence entities with `iqacStatus`)
- [ ] `VerificationObservation` (documentId, title, priority, description, recommendedCorrection, dueDate, status, raisedBy/At, response, respondedAt, verifiedAt)

### Enums
- [ ] `ObservationPriority` (LOW/MEDIUM/HIGH/CRITICAL) → serializes `low|medium|high|critical`
- [ ] `ObservationStatus` (OPEN/IN_PROGRESS/RESOLVED/CLOSED)
- [ ] `InitiativeStatus` (NOT_STARTED/IN_PROGRESS/ON_TRACK/DELAYED/COMPLETED)
- [ ] `HodApprovalStatus` (PENDING/APPROVED/REJECTED)
- [ ] `IqacVerificationStatus` (NOT_VERIFIED/VERIFIED/OBSERVATION_RAISED)
- [ ] `VerificationObservationStatus` (OPEN/IN_PROGRESS/RESOLVED/VERIFIED)
- [ ] `VerificationFileType`, `IQACDocumentFileType`, `AccreditationFramework`, `GapScope`, `GapPriority`, `DrillEvidenceStatus`

### Database
- [ ] Tables for the entities above with `institution_id` FK on every table
- [ ] Unique constraints / indexes: (institution, documentId) for verification state; (institution, id) for observations/initiatives/documents
- [ ] Soft-delete policy for observations (⚠️ confirm) and documents

### Flyway Migrations
- [ ] `V__create_quality_observation.sql`
- [ ] `V__create_improvement_initiative.sql`
- [ ] `V__create_iqac_document.sql` + `V__create_iqac_document_version.sql`
- [ ] `V__create_verification_observation.sql`
- [ ] `V__alter_evidence_document_add_iqac_status.sql` (dual lifecycle)

### Security
- [ ] `IQAC_COORDINATOR` role guard on `/api/v1/iqac/**`
- [ ] Institution derived from JWT on every query
- [ ] Enforce "verify/raise only when `hodStatus == approved`" server-side
- [ ] Enforce "IQAC can never write `hodStatus`" (reject attempts)
- [ ] Document download authorization (IQAC role; ⚠️ confirm scope)

### Tests
- [ ] Controller tests for all 26 endpoints (auth 401/403, success 200/201, not-found 404)
- [ ] Service tests: observation status transitions, initiative updates, document versioning rule (`v1→v2`, `v1.1→v1.2`), verification gating (`hodStatus !== approved` → rejected), resolved→verified only
- [ ] Repository tests: institution-scoped queries, filter combos (department/repository/framework/status/search)
- [ ] Pagination tests for `GET /verification/documents`
- [ ] Integration test: full verification lifecycle (HOD approve → IQAC verify / raise observation → dept resolve → IQAC verify)

---

## 25. Quality Check

- [x] Every IQAC screen identified (16 views)
- [x] Every IQAC route identified (`/app/iqac-dashboard?view=…`)
- [x] Every major component traced (incl. 15 verification sub-components)
- [x] Every relevant types file identified (`types.ts`, `verification-data.ts`, `iqac-data.ts`, shared principal files)
- [x] Every relevant service file identified (0 API services — documented Redux + client-export "services")
- [x] Every existing API call identified (none in IQAC pages)
- [x] Every mock data source identified (18 in replacement map)
- [x] Every user action mapped (create/update/delete observation, initiative, document, version; verify; raise observation; update observation status; mark verified; export; download; search/filter/sort/paginate)
- [x] Every required endpoint documented (26)
- [x] Every request DTO documented
- [x] Every response DTO documented
- [x] Every enum documented (20 groups)
- [x] Search documented (7 screens)
- [x] Filters documented (14 groups)
- [x] Sorting documented (verification table)
- [x] Pagination documented (verification table only)
- [x] File operations documented (upload/version/download/preview)
- [x] Dashboard documented (§19 aggregation recommendation)
- [x] Reports/exports documented (client-side; optional server endpoint)
- [x] Institution isolation documented (§17)
- [x] Department isolation documented (institution-wide read, no dept writes)
- [x] Entity relationships documented (§16)
- [x] Authentication documented (JWT + IQAC_COORDINATOR)
- [x] Authorization documented (role, institution-derived, HOD-approval gate)
- [x] Frontend/backend gaps documented (14 in §22)
- [x] Business-rule uncertainties documented (11 in §23)
- [x] No frontend files modified (analysis-only)

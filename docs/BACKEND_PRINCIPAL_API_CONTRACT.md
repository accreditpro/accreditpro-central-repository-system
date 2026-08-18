# Principal — API Contract

> **Document type:** Backend API contract (analysis-only, reverse-engineered from the existing frontend)
> **Frontend source of truth:** `frontend/src/pages/principal-dashboard/**`, `frontend/src/layouts/PrincipalLayout.tsx`, `frontend/src/App.tsx`
> **Status legend:** ✅ **CONFIRMED FROM FRONTEND** · 🔶 **INFERRED** · ⚠️ **REQUIRES BUSINESS CONFIRMATION**
> **Rule applied:** The frontend is READ-ONLY for this task. No frontend files were modified.

---

## 1. Purpose

This document defines the backend REST API contract required to make the existing **Principal** frontend fully functional.

Like the HOD module, the Principal frontend is currently **100 % mock-data driven** — every one of the 14 Principal views reads from the static datasets in `frontend/src/pages/principal-dashboard/principal-configs.ts` and `frontend/src/pages/principal-dashboard/principal-data.ts` (plus two small client-side generators: `report-export.ts` and the local `DOC_STRUCTURE` map). There are **zero** HTTP/API calls inside the Principal pages today.

The Principal role is an **institution-wide, read-only executive monitor**: it consumes (never edits) aggregated data from all departments. This contract therefore describes a **read-only, institution-scoped aggregation API surface** that the frontend implicitly requires. Every endpoint is marked **🔶 INFERRED** with field names copied **verbatim** from the frontend TypeScript interfaces so the mock consumers can be swapped for real API responses without frontend renames.

---

## 2. Frontend Source of Truth

Files analysed for this contract:

### Routes & Layout
| File | Role |
|------|------|
| `frontend/src/App.tsx` | Route registration: `/app/principal-dashboard`, guarded by `UserRole.PRINCIPAL` |
| `frontend/src/layouts/PrincipalLayout.tsx` | Principal shell: grouped sidebar (14 views in 4 groups), user card, theme/logout |

### Principal Pages & Components
| File | View |
|------|------|
| `frontend/src/pages/principal-dashboard/PrincipalDashboardPage.tsx` | Single route component that switches on `?view=` query param (14 views) |
| `frontend/src/pages/principal-dashboard/principal-configs.ts` | Mock data + TypeScript interfaces (KPIs, department scores, repositories, gaps, criteria, insights, stats, trends) |
| `frontend/src/pages/principal-dashboard/principal-data.ts` | Consolidated institutional data layer: dept×repo matrix, accreditation matrices, principal gaps, performance tables, exam overview, analytics series, AI recommendations |
| `frontend/src/pages/principal-dashboard/components/ExecutiveDashboard.tsx` | View: Executive Dashboard |
| `frontend/src/pages/principal-dashboard/components/DepartmentPerformance.tsx` | View: Department Performance |
| `frontend/src/pages/principal-dashboard/components/RepositoryReadiness.tsx` | View: Repository Readiness (drill-down) |
| `frontend/src/pages/principal-dashboard/components/AccreditationReadiness.tsx` | View: Accreditation Readiness |
| `frontend/src/pages/principal-dashboard/components/GapAnalysis.tsx` | View: Gap Analysis |
| `frontend/src/pages/principal-dashboard/components/AcademicPerformance.tsx` | View: Academic Performance |
| `frontend/src/pages/principal-dashboard/components/FacultyPerformance.tsx` | View: Faculty Performance |
| `frontend/src/pages/principal-dashboard/components/StudentPerformance.tsx` | View: Student Performance |
| `frontend/src/pages/principal-dashboard/components/ResearchInnovation.tsx` | View: Research & Innovation |
| `frontend/src/pages/principal-dashboard/components/InfrastructureReadiness.tsx` | View: Infrastructure Readiness |
| `frontend/src/pages/principal-dashboard/components/ExaminationOverview.tsx` | View: Examination Overview |
| `frontend/src/pages/principal-dashboard/components/InstitutionAnalytics.tsx` | View: Institution Analytics (charts) |
| `frontend/src/pages/principal-dashboard/components/AIRecommendations.tsx` | View: AI Recommendations |
| `frontend/src/pages/principal-dashboard/components/ExecutiveReports.tsx` | View: Reports |
| `frontend/src/pages/principal-dashboard/components/report-export.ts` | **Working client-side report generator** (jsPDF + XLSX + file-saver) |
| `frontend/src/pages/principal-dashboard/components/common.tsx` | Shared UI primitives: `StatCard`, `StatusBadge`, `ReadinessBar`, `ScoreCell`, `FilterBar`, `FilterSelect`, `SearchInput` |

### Orphaned / Unreferenced Components (present in the folder, not mounted by any route)
| File | Contents | Status |
|------|----------|--------|
| `frontend/src/pages/principal-dashboard/components/RepositoryHealth.tsx` | Repository health dashboard using `repositoryStatuses` + a local `evidenceData` block | **Unused** — no imports found anywhere |
| `frontend/src/pages/principal-dashboard/components/InstitutionOverview.tsx` | Institution profile/stats/trends using `institutionStats`, `fiveYearTrends`, `departmentScores` | **Unused** |
| `frontend/src/pages/principal-dashboard/components/ExecutiveModules.tsx` | Large executive module using `approvalItems`, `gapItems`, `naacCriteria`, `nbaCriteria`, `nirfParameters`, `aiInsights`, `activityEvents`, `reportTypes` | **Unused** |
| `frontend/src/pages/principal-dashboard/components/DomainAnalytics.tsx` | Domain analytics switch using `academicPerformance`, `departmentScores`, `fiveYearTrends`, `institutionStats` | **Unused** |

### Types, Store & Shared Hooks
| File | Role |
|------|------|
| `frontend/src/types/auth.types.ts` | `UserRole`, `User`, `ApiResponse<T>` envelope |
| `frontend/src/hooks/useAuth.ts` / `useReadOnly.ts` | Auth context; impersonation read-only flag |

> **No Redux slices are used by the Principal module** (unlike HOD, which used `evidenceReviewSlice`/`iqacVerificationSlice`/`uiSlice`). The Principal has no cross-role shared state and no global academic-year selector — each view keeps its own `year` filter in local state.

---

## 3. Principal Screen Inventory

There is **one route** (`/app/principal-dashboard`) that renders **fourteen views** via the `?view=` query parameter (`PrincipalDashboardPage.tsx`). Default view: `dashboard`.

| # | Screen | Route | Main Component | Purpose |
|---|--------|-------|----------------|---------|
| 1 | Executive Dashboard | `/app/principal-dashboard?view=dashboard` | `ExecutiveDashboard.tsx` | 12 KPI cards, institution readiness gauge, department summary table (readiness + NBA/NAAC/NIRF), critical-gap alert strip |
| 2 | Department Performance | `?view=departments` | `DepartmentPerformance.tsx` | Department filters + KPI row, repository-readiness matrix (dept × repo), selected-dept repository breakdown |
| 3 | Repository Readiness | `?view=repository-health` | `RepositoryReadiness.tsx` | Read-only drill-down: Institution → Department → Repository → Folder/Documents |
| 4 | Accreditation Readiness | `?view=accreditation` | `AccreditationReadiness.tsx` | NBA / NAAC / NIRF tabs: criterion-wise + department-wise readiness matrices |
| 5 | Gap Analysis | `?view=gaps` | `GapAnalysis.tsx` | Current vs target gap table + remediation detail dialog (missing data/evidence, pending approval, IQAC observation, recommended actions) |
| 6 | Academic Performance | `?view=academic` | `AcademicPerformance.tsx` | Dept-wise pass %, backlogs, semester results, course/calendar completion + pass-% trend |
| 7 | Faculty Performance | `?view=faculty` | `FacultyPerformance.tsx` | Faculty strength, PhD %, FDP %, publications, patents, funding + qualification summary |
| 8 | Student Performance | `?view=student` | `StudentPerformance.tsx` | Student strength, pass %, placements, higher studies, internships, projects, awards, certifications |
| 9 | Research & Innovation | `?view=research` | `ResearchInnovation.tsx` | Publications, patents, books, sponsored projects, consultancy, funding + publications trend |
| 10 | Infrastructure Readiness | `?view=infrastructure` | `InfrastructureReadiness.tsx` | Labs/equipment/licenses/ICT/smart classrooms readiness + compliance alerts |
| 11 | Examination Overview | `?view=examination` | `ExaminationOverview.tsx` | Read-only schedules, published results, supplementary exams, backlog statistics |
| 12 | Institution Analytics | `?view=analytics` | `InstitutionAnalytics.tsx` | Six recharts trend charts (repository, accreditation, faculty/student growth, publications, placements, infrastructure) |
| 13 | AI Recommendations | `?view=ai-recommendations` | `AIRecommendations.tsx` | Auto-generated executive insights by domain (9 domains) |
| 14 | Reports | `?view=reports` | `ExecutiveReports.tsx` | Report cards with **working** client-side PDF/Excel export; recent reports list |

**Layout navigation groups (✅ `PrincipalLayout.tsx`):** Executive (`dashboard`), Monitoring (`departments`, `repository-health`, `accreditation`, `gaps`, `analytics`), Performance (`academic`, `faculty`, `student`, `research`, `infrastructure`, `examination`), Intelligence (`ai-recommendations`, `reports`).

**Shared UI across views (✅ `common.tsx`):** `StatCard` (KPI cards), `StatusBadge`/`statusOf` (Ready ≥85 / Needs Attention 70–84 / Critical <70), `ReadinessBar`, `ScoreCell`, `FilterBar`, `FilterSelect`, `SearchInput`. All filtering/searching is **client-side** today.

---

## 4. Frontend Type Inventory

Types live in **`principal-configs.ts`** and **`principal-data.ts`**. Field names are **exact** — backend DTOs must use these camelCase names.

| Type | File | Used By | Fields |
|------|------|---------|--------|
| `DepartmentScore` | `principal-configs.ts` | (orphan `InstitutionOverview`/`DomainAnalytics` only) | `id`, `name`, `code`, `repository`, `evidence`, `verification`, `readiness`, `health: 'excellent' \| 'good' \| 'warning' \| 'critical'` |
| `RepositoryStatus` | `principal-configs.ts` | (orphan `RepositoryHealth` only) | `id`, `name`, `completion`, `evidence`, `pendingReviews`, `pendingVerification`, `qualityScore`, `lastUpdated` |
| `ApprovalItem` | `principal-configs.ts` | (orphan `ExecutiveModules` only) | `id`, `repository`, `submittedBy`, `submittedDate`, `type`, `priority: 'high' \| 'medium' \| 'low'`, `status: 'pending' \| 'in-review'`, `description` |
| `GapItem` | `principal-configs.ts` | (orphan `ExecutiveModules` only) | `id`, `category`, `description`, `currentStatus`, `target`, `impact: 'critical' \| 'high' \| 'medium' \| 'low'`, `priority: number`, `recommendedOwner`, `timeline`, `department?` |
| `FrameworkCriterion` | `principal-configs.ts` | AccreditationReadiness (NAAC), orphan modules | `id`, `name`, `weightage`, `completion`, `evidence`, `status: 'ready' \| 'in-progress' \| 'not-started'` |
| `AIInsight` | `principal-configs.ts` | (orphan `ExecutiveModules` only) | `id`, `type: 'forecast' \| 'risk' \| 'recommendation' \| 'opportunity'`, `title`, `description`, `confidence`, `impact: 'high' \| 'medium' \| 'low'`, `actionable: boolean` |
| `ActivityEvent` | `principal-configs.ts` | (orphan `ExecutiveModules` only) | `id`, `type: 'submitted' \| 'approved' \| 'uploaded' \| 'verified' \| 'gap-closed' \| 'framework-updated' \| 'milestone'`, `title`, `description`, `timestamp`, `actor`, `department?` |
| `StatusLevel` | `principal-data.ts` | common.tsx | `'ready' \| 'attention' \| 'critical'` |
| `DeptRepoRow` | `principal-data.ts` | DepartmentPerformance, RepositoryReadiness | `repo: string`, `completion: number`, `approved: number`, `pending: number`, `missing: number` |
| `DepartmentRepositoryData` | `principal-data.ts` | ExecutiveDashboard, DepartmentPerformance, RepositoryReadiness | `code: string`, `name: string`, `readiness: number`, `repositories: DeptRepoRow[]` |
| `DeptCriterionScore` | `principal-data.ts` | ExecutiveDashboard, AccreditationReadiness, report-export | `dept: string`, `scores: number[]`, `overall: number` |
| `PrincipalGap` | `principal-data.ts` | ExecutiveDashboard, GapAnalysis, report-export | `id`, `department`, `repository`, `framework: 'NAAC' \| 'NBA' \| 'NIRF' \| 'All'`, `description`, `current: number`, `target: number`, `priority: 'critical' \| 'high' \| 'medium' \| 'low'`, `missingData: string[]`, `missingEvidence: string[]`, `pendingApproval: string`, `iqacObservation: string`, `recommendedActions: string[]` |
| `DeptAcademic` | `principal-data.ts` | AcademicPerformance, report-export | `dept`, `passPercentage`, `backlogPercentage`, `semesterResults`, `courseCompletion`, `calendarCompletion` |
| `DeptFaculty` | `principal-data.ts` | FacultyPerformance, report-export | `dept`, `strength`, `phdPercentage`, `fdpParticipation`, `publications`, `patents`, `sponsoredProjects`, `consultancy`, `researchFunding` |
| `DeptStudent` | `principal-data.ts` | StudentPerformance, report-export | `dept`, `strength`, `passPercentage`, `placements`, `higherStudies`, `internships`, `projects`, `publications`, `awards`, `certifications` |
| `DeptResearch` | `principal-data.ts` | ResearchInnovation, report-export | `dept`, `publications`, `patents`, `books`, `sponsoredProjects`, `consultancy`, `projectDevelopment`, `researchFunding` |
| `DeptInfra` | `principal-data.ts` | InfrastructureReadiness, report-export | `dept`, `laboratories`, `equipment`, `softwareLicenses`, `ictFacilities`, `smartClassrooms`, `evidenceCompletion`, `alerts: string[]` |
| `AiRecommendation` | `principal-data.ts` | AIRecommendations | `id`, `domain: 'Repository' \| 'NBA' \| 'NAAC' \| 'NIRF' \| 'Faculty' \| 'Infrastructure' \| 'Student' \| 'Research' \| 'Placement'`, `title`, `description`, `severity: 'high' \| 'medium' \| 'low'`, `department?` |
| `ReportData` | `components/report-export.ts` | ExecutiveReports | `title: string`, `columns: string[]`, `rows: (string \| number)[][]` |

**Plain-object datasets (not typed interfaces but rendered):**
- `kpiData` — 12 institution KPIs (see §9.1)
- `institutionStats` — programs, departments, students, faculty, publications, patents, placementRate, packages, recruiters, infrastructure, budget/expenditure
- `fiveYearTrends` — years + parallel arrays (students, faculty, publications, placements, passPercentage, revenue)
- `naacCriteria` / `nbaCriteria` / `nirfParameters` — framework criterion/parameter lists
- `departmentRepositories` (dept×repo matrix), `principalGaps`, `deptAcademic`, `deptFaculty`, `deptStudent`, `deptResearch` + `researchTotals`, `deptInfra` + `infraAlerts`, `examSchedules`, `publishedResults`, `supplementaryExams`, `backlogStats`, `analyticsTrends`/`analyticsSeries`, `aiRecommendations`, `REPORT_TYPES`
- `academicPerformance` (principal-configs) — richer dept academic detail, used only by orphan `DomainAnalytics`
- `academicYearOptions` = `['2025-26','2024-25','2023-24','2022-23','2021-22']`, `departmentOptions` (all + 8 codes), `programOptions` (all, btech, mtech, mba, mca)
- `DOC_STRUCTURE` (RepositoryReadiness local) — static sample folder→document map per repository (read-only drill-down)
- `recent` reports state (ExecutiveReports local) — recent generated reports
- `REPORT_TYPES` (report-export) — 10 report definitions used by the working export

---

## 5. Frontend Service Inventory

| Service | File | Function | HTTP Method | Existing Endpoint | Used By |
|---------|------|----------|-------------|-------------------|---------|
| — *(none)* | `principal-dashboard/**` | — | — | — | **No service/API layer exists for any Principal view.** All data comes from `principal-configs.ts` / `principal-data.ts` mock objects or local state |
| `auth.service.ts` | `frontend/src/services/auth.service.ts` | login / me | POST / GET | `/api/auth/login`, `/api/auth/me` | Indirect (app-wide `useAuth`; Principal pages only read `user` for the layout card) |
| `impersonation.service.ts` | `frontend/src/services/impersonation.service.ts` | impersonation label map | — | — | Indirect (read-only banner) |

**Existing API calls:** `0` inside Principal pages. The only live calls in the Principal flow are the global auth calls and Super-Admin impersonation.

**Notable:** `dashboard.service.ts` exists in the repo but is **not imported anywhere in `principal-dashboard`** (✅ verified) — do not assume the Principal uses it.

---

## 6. Global API Specifications

**Base Endpoint Path:** `/api/v1/principal` (consistent with the existing `/api/v1/examination-officer` and `/api/v1/head-of-department` role-based convention).

**Swagger Tag:** `Principal - Executive Overview`

**Authentication Header:** `Authorization: Bearer <jwt-token>`

**Role Guard:** `PRINCIPAL`

**Content-Type:** `application/json` for all responses (all endpoints are GET/read-only today).

### Standard Query Parameters for GET (List) Endpoints
| Parameter      | Type    | Required | Default    | Description |
|----------------|---------|----------|------------|-------------|
| `academicYear` | String  | Optional | `"2025-26"` | Filter by academic year (pattern `^\d{4}-\d{2}$`). Every Principal view carries a year selector defaulting to `2025-26` |
| `department`   | String  | Optional | `all`      | Department code filter (`CSE, ECE, EEE, MECH, CIVIL, IT, AIML, DS`) |
| `page`         | Integer | Optional | `0`        | Zero-based page index (no pagination today; see §12) |
| `size`         | Integer | Optional | `20`       | Records per page |

### Standard Response Structure (matches `ApiResponse<T>` in `types/auth.types.ts`)
**1. Single object / aggregate:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { },
  "timestamp": "2026-08-01T12:00:00"
}
```

**2. Paginated list (only if/when pagination is introduced):**
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
  "message": "Unauthorized — Principal role required",
  "data": null,
  "timestamp": "2026-08-01T12:00:00"
}
```

### Conventions
- **Date format:** `YYYY-MM-DD` (e.g. `submittedDate: '2024-03-15'`, exam `start`/`end`, result `published`)
- **DateTime format:** ISO 8601 (`2024-03-15T10:30:00Z`) — `ActivityEvent.timestamp`
- **IDs:** String UUIDs recommended; mock ids are opaque strings (`1`, `g1`, `a1`, `e1`)
- **Enums:** JSON strings using the **exact frontend values** (e.g. `"changes"`, `"attention"`, `"in-progress"`, `"gap-closed"`)

---

## 7. Authentication & Authorization

| Aspect | Contract |
|--------|----------|
| Authentication | Bearer JWT via `Authorization` header (existing AccreditPro auth flow) |
| Authorization | **Role check:** `PRINCIPAL` on every endpoint |
| Institution scope | **Derived from authenticated user context** (`institutionId`) — never from query/body params |
| Data scope | The Principal sees **all departments of their own institution** (institution-wide, department-agnostic). No `departmentId` scoping on the principal's own queries — unlike HOD, the Principal's user is NOT bound to a single department |
| Cross-institution safety | Mandatory: Principal must never see another institution's data. Do not trust client-supplied `institutionId` |
| Read-only enforcement | ✅ CONFIRMED FROM FRONTEND: every view is explicitly labelled read-only (`Lock` icons: "Read-only monitoring — no data entry", "Read-only — no operational controls"). **No create/update/delete endpoints are required for the Principal** |
| Impersonation | Same as HOD: accepts impersonation JWT; read-only is client-side today (🔶 optional backend `readOnly` flag) |

---

## 8. API Endpoint Summary

| # | Method | Endpoint | Screen | Action | Auth | Notes |
|---|--------|----------|--------|--------|------|-------|
| 1 | GET | `/api/v1/principal/dashboard` | Executive Dashboard | Load aggregate (KPIs, dept summary, critical gaps) | PRINCIPAL | 🔶 INFERRED — replaces `kpiData` + `departmentRepositories` + accreditation matrices + `principalGaps` |
| 2 | GET | `/api/v1/principal/departments` | Department Performance | Dept list + repo matrix + breakdown | PRINCIPAL | 🔶 INFERRED — replaces `departmentRepositories`; filters year/dept/program/search |
| 3 | GET | `/api/v1/principal/repository-readiness` | Repository Readiness | Drill-down dept → repo → folder/docs | PRINCIPAL | 🔶 INFERRED — replaces `departmentRepositories` + `DOC_STRUCTURE` |
| 4 | GET | `/api/v1/principal/accreditation` | Accreditation Readiness | NBA/NAAC/NIRF readiness matrices | PRINCIPAL | 🔶 INFERRED — replaces `nbaDeptScores`/`naacDeptScores`/`nirfDeptScores`, criteria, `kpiData` |
| 5 | GET | `/api/v1/principal/gaps` | Gap Analysis | List gaps + detail | PRINCIPAL | 🔶 INFERRED — replaces `principalGaps`; filters year/dept/framework |
| 6 | GET | `/api/v1/principal/academic` | Academic Performance | Dept academic metrics + trend | PRINCIPAL | 🔶 INFERRED — replaces `deptAcademic` + `analyticsTrends` |
| 7 | GET | `/api/v1/principal/faculty` | Faculty Performance | Dept faculty metrics | PRINCIPAL | 🔶 INFERRED — replaces `deptFaculty` |
| 8 | GET | `/api/v1/principal/students` | Student Performance | Dept student metrics | PRINCIPAL | 🔶 INFERRED — replaces `deptStudent` |
| 9 | GET | `/api/v1/principal/research` | Research & Innovation | Dept research metrics + trend | PRINCIPAL | 🔶 INFERRED — replaces `deptResearch` + `researchTotals` + `analyticsTrends` |
| 10 | GET | `/api/v1/principal/infrastructure` | Infrastructure Readiness | Dept infra metrics + alerts | PRINCIPAL | 🔶 INFERRED — replaces `deptInfra` + `infraAlerts` |
| 11 | GET | `/api/v1/principal/examination` | Examination Overview | Schedules/results/supplementary/backlogs | PRINCIPAL | 🔶 INFERRED — replaces `examSchedules`/`publishedResults`/`supplementaryExams`/`backlogStats` |
| 12 | GET | `/api/v1/principal/analytics` | Institution Analytics | Trend series for charts | PRINCIPAL | 🔶 INFERRED — replaces `analyticsSeries` |
| 13 | GET | `/api/v1/principal/ai-recommendations` | AI Recommendations | Insights by domain | PRINCIPAL | 🔶 INFERRED — replaces `aiRecommendations` |
| 14 | GET | `/api/v1/principal/reports` | Reports | Report type list + recent reports | PRINCIPAL | 🔶 INFERRED/OPTIONAL — **export is fully client-side today** (see §16/§20) |

**Not required (frontend-only / static):**
- **Report generation (PDF/Excel)** — ✅ CONFIRMED: fully working **client-side** via `report-export.ts` (jsPDF, XLSX, file-saver). No backend endpoint required unless reports must be server-generated (see §20).
- Filter dropdown options (`academicYearOptions`, `departmentOptions`, `programOptions`) — static config. No API needed.
- Theme toggle, sidebar collapse, view switching — `FRONTEND ONLY — NO API REQUIRED`.
- Approval/review actions — **none exist** for the Principal (read-only role; the `approvalItems` mock lives only in the orphaned `ExecutiveModules.tsx`).

---

## 9. Detailed API Contracts

---

### 9.1 GET /api/v1/principal/dashboard

**Purpose:** Load the Executive Dashboard (12 KPI cards, readiness gauge, department summary table, critical-gap alert strip).

**Frontend Screen:** Executive Dashboard
**Frontend Component:** `ExecutiveDashboard.tsx`
**Frontend Service:** None today — replaces `kpiData`, `institutionStats` (subset), `departmentRepositories`, `nbaDeptScores`/`naacDeptScores`/`nirfDeptScores`, `principalGaps`.

**Authentication:** Bearer JWT
**Authorization:** `PRINCIPAL`; institution-scoped (all departments of the institution)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `academicYear` | String | No | Default `"2025-26"` (the dashboard has no year selector today, but 🔶 recommend supporting it) |

**Response DTO: `PrincipalDashboardResponseDTO`**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "academicYear": "2025-26",
    "kpi": {
      "repositoryCompletion": 84,
      "naacReadiness": 82,
      "nbaReadiness": 75,
      "nirfReadiness": 71,
      "evidenceCompletion": 76,
      "pendingApprovals": 14,
      "departments": 8,
      "programs": 24,
      "faculty": 312,
      "students": 4850,
      "iqacObservations": 5,
      "criticalGaps": 2
    },
    "institutionStats": {
      "programs": 24,
      "departments": 8,
      "students": 4850,
      "faculty": 312,
      "researchPublications": 456,
      "patents": 18,
      "placementRate": 82,
      "averagePackage": "6.8 LPA",
      "highestPackage": "42 LPA",
      "recruiters": 145,
      "infrastructure": { "buildings": 12, "labs": 68, "library": "1.2L books", "ict": "98% coverage" },
      "budget": "₹125 Cr",
      "expenditure": "₹108 Cr"
    },
    "departments": [
      {
        "code": "CSE",
        "name": "Computer Science & Engineering",
        "readiness": 92,
        "nba": 91,
        "naac": 90,
        "nirf": 88
      }
    ],
    "criticalGaps": [
      { "department": "EEE", "repository": "Research", "framework": "NAAC", "priority": "critical" }
    ]
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

**Field mapping (✅ from frontend):**
- KPI cards read: `kpiData.repositoryCompletion`, `kpiData.naacReadiness`, `kpiData.nbaReadiness`, `kpiData.nirfReadiness`, `institutionStats.departments`, `institutionStats.programs`, `institutionStats.faculty`, `institutionStats.students`, `kpiData.evidenceCompletion`, `kpiData.pendingApprovals`, `'5'` (hardcoded IQAC observations), `principalGaps.filter(critical).length`.
- `Approved Evidence` / `Missing Evidence` in the gauge card are **client-derived**: `round(evidenceCompletion * 0.72)` and `100 − that` (⚠️ hardcoded multiplier `0.72` — 🔶 INFERRED backend should return real approved/missing evidence values).
- Department summary table joins `departmentRepositories` (code, name, readiness) with `nbaDeptScores`/`naacDeptScores`/`nirfDeptScores` (overall per dept).
- Critical-gap alert strip lists gaps with `priority === 'critical'`.

**Security / Institution scope:** all data filtered to the authenticated Principal's institution.

---

### 9.2 GET /api/v1/principal/departments

**Purpose:** Department performance view: filter bar, KPI row, repository-readiness matrix (dept × repo), and selected-department repository breakdown.

**Frontend Screen:** Department Performance
**Frontend Component:** `DepartmentPerformance.tsx`
**Frontend Service:** None today — replaces `departmentRepositories`.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `academicYear` | String | No | Default `"2025-26"` (UI year selector) |
| `department` | String | No | Code filter; `all` or `CSE\|ECE\|EEE\|MECH\|CIVIL\|IT\|AIML\|DS` |
| `program` | String | No | `all\|btech\|mtech\|mba\|mca` — ⚠️ **state is set but never applied to filtering today** (contract gap #11) |
| `search` | String | No | Client-side today — matches `name` and `code` |

**Response DTO: `PrincipalDepartmentsResponseDTO`** — `DepartmentRepositoryData[]` exactly as `departmentRepositories`:
```json
{
  "success": true,
  "message": "Departments retrieved successfully",
  "data": [
    {
      "code": "CSE",
      "name": "Computer Science & Engineering",
      "readiness": 92,
      "repositories": [
        { "repo": "Academic", "completion": 95, "approved": 81, "pending": 14, "missing": 5 }
      ]
    }
  ],
  "timestamp": "2026-08-01T12:00:00"
}
```

**Client-derived values (✅):** avg readiness, best/worst department (`readiness` sort), institution-average per repository row (`Σ completion / dept count`).

> **`repositories` matrix** — 8 repositories per department, fixed `REPO_LIST` order: `Academic, Faculty, Student, Research, Infrastructure, Examination, Alumni, Placement`. Each row: `completion`, `approved`, `pending`, `missing` (percentages; note `missing = 100 − completion`).

---

### 9.3 GET /api/v1/principal/repository-readiness

**Purpose:** Read-only Institution → Department → Repository → Folder/Document drill-down.

**Frontend Screen:** Repository Readiness
**Frontend Component:** `RepositoryReadiness.tsx`
**Frontend Service:** None today — replaces `departmentRepositories` + local `DOC_STRUCTURE`.

**Query Parameters:** `academicYear`, `department` (code; defaults show all in the department list).

**Response DTO: `PrincipalRepositoryReadinessResponseDTO`**
```json
{
  "success": true,
  "message": "Repository readiness retrieved successfully",
  "data": {
    "academicYear": "2025-26",
    "institutionCompletion": 78,
    "departments": [
      {
        "code": "CSE",
        "name": "Computer Science & Engineering",
        "readiness": 92,
        "repositories": [
          {
            "repo": "Academic",
            "completion": 95,
            "approved": 81,
            "pending": 14,
            "missing": 5,
            "folders": [
              {
                "folder": "Academic Calendar",
                "documents": [
                  { "name": "Academic_Calendar_2025-26.pdf", "status": "ready" },
                  { "name": "Calendar Report.pdf", "status": "attention" }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

**Notes:**
- `institutionCompletion` = avg of department `readiness` (client-derived today; mock average = `78`).
- ⚠️ `repositories` matrix and per-document `status` values in the sample are **illustrative** — the mock matrix is generated deterministically and real values must come from the backend.
- The `folders`/`documents` drill-down currently comes from a **static local map** (`DOC_STRUCTURE` — sample folder names like `Academic Calendar`, `Curriculum`, `Faculty Profile`, `Publications`, `Patents`, `Laboratories`, `Licenses`, `Results`, `Supplementary`, `Alumni Details`, `Engagement`, `Placements`, `Internships`). The per-document status is **synthetically derived** client-side (`statusOf(78 + ((di*7)%20))`). 🔶 INFERRED: the backend must serve the real folder/document tree + document status. ⚠️ Whether the Principal can actually open/preview/download a document requires business confirmation.
- Stat cards: "Evidence Folders" value `16` is **hardcoded** (contract gap).

---

### 9.4 GET /api/v1/principal/accreditation

**Purpose:** NBA / NAAC / NIRF tabs with criterion-wise institution readiness, department-wise matrices, and framework KPI cards.

**Frontend Screen:** Accreditation Readiness
**Frontend Component:** `AccreditationReadiness.tsx`
**Frontend Service:** None today — replaces `kpiData` (nba/naac/nirf readiness), `naacCriteria`, `nirfParameters`, `nbaDeptScores`/`naacDeptScores`/`nirfDeptScores`, criterion lists.

**Query Parameters:** `academicYear` (optional).

**Response DTO: `PrincipalAccreditationResponseDTO`**
```json
{
  "success": true,
  "message": "Accreditation readiness retrieved successfully",
  "data": {
    "academicYear": "2025-26",
    "nba": {
      "overall": 75,
      "criteria": [
        { "name": "Vision, Mission & PEOs", "weightage": 60 },
        { "name": "Program Curriculum", "weightage": 80 },
        { "name": "Course Outcomes & POs", "weightage": 120 },
        { "name": "Students Performance", "weightage": 120 },
        { "name": "Faculty Contributions", "weightage": 100 },
        { "name": "Facilities & Technical Support", "weightage": 80 },
        { "name": "Academic Support & Governance", "weightage": 40 }
      ],
      "departments": [
        { "dept": "CSE", "scores": [92, 90, 91, 93, 88, 94, 86], "overall": 91 }
      ]
    },
    "naac": {
      "overall": 82,
      "criteria": [
        { "id": "1", "name": "Curricular Aspects", "weightage": 150, "completion": 88, "evidence": 85, "status": "in-progress" }
      ],
      "departments": [
        { "dept": "CSE", "scores": [90, 88, 87, 92, 89, 86, 85], "overall": 88 }
      ]
    },
    "nirf": {
      "overall": 71,
      "parameters": [
        { "id": "1", "name": "Teaching, Learning and Resources (TLR)", "weightage": 30, "score": 74, "status": "in-progress" }
      ],
      "departments": [
        { "dept": "CSE", "scores": [88, 90, 89, 91, 84], "overall": 89 }
      ]
    }
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

**Field mapping (✅ from frontend):**
- NBA criterion order/weights: `[60, 80, 120, 120, 100, 80, 40]`; NAAC: `[150, 200, 250, 100, 100, 100, 100]`; NIRF: `[30, 30, 20, 10, 10]` with short headers `[TLR, RP, GO, OI, PR]`.
- KPI cards with **hardcoded values** (⚠️ require real computation): NBA "Programs Eligible 3 (CSE, ECE, IT)", NAAC "Criteria Ready 1/7", NAAC "Projected Grade A (CGPA 3.25–3.50)", NIRF "Projected Band 101–150", NIRF "Best Category GO 76%", NIRF "Weakest Perception 65%".
- `departments at risk` counts are client-derived (`overall < 70`).
- `naacCriteria` (completion + evidence) is used for the "Institution-wise Criterion Readiness" card — note the **NAAC criterion completion values here are institution-level**, while `naacDeptScores` are department-level; both must be served.

---

### 9.5 GET /api/v1/principal/gaps

**Purpose:** Gap Analysis — current vs target table plus a remediation detail dialog.

**Frontend Screen:** Gap Analysis
**Frontend Component:** `GapAnalysis.tsx`
**Frontend Service:** None today — replaces `principalGaps`.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `academicYear` | String | No | Default `"2025-26"` (UI year selector; the mock gaps are **not** year-keyed — ⚠️ business confirmation needed) |
| `department` | String | No | Code filter; `all` or dept code |
| `framework` | String | No | `all \| NAAC \| NBA \| NIRF` |

**Response DTO: `PrincipalGapResponseDTO`** (paginated `PrincipalGap[]`):
```json
{
  "success": true,
  "message": "Gaps retrieved successfully",
  "data": {
    "content": [
      {
        "id": "g1",
        "department": "EEE",
        "repository": "Research",
        "framework": "NAAC",
        "description": "Research Repository readiness at 62% — below the 85% institutional target.",
        "current": 62,
        "target": 85,
        "priority": "critical",
        "missingData": ["Faculty publication list 2023-24", "Citation data (Scopus/WoS)", "Research funding register"],
        "missingEvidence": ["Journal cover pages", "DOI proofs", "Grant sanction letters"],
        "pendingApproval": "2 project funding approvals pending with HOD",
        "iqacObservation": "Research output metrics understated by ~30% due to missing citations.",
        "recommendedActions": ["Compile publication list from Scopus author profile", "Upload DOI proofs for 18 papers", "Escalate funding approvals to HOD"]
      }
    ],
    "totalPages": 1,
    "totalElements": 7,
    "number": 0,
    "size": 20
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

**Client-derived values (✅):** counts (critical/high/medium/total), gap points = `target − current`, gap badge thresholds (`≥25 red`, `≥15 amber`, else green).

> ⚠️ **Two distinct gap datasets exist in the frontend** (`gapItems` in `principal-configs.ts` used only by the orphan `ExecutiveModules`, and `principalGaps` in `principal-data.ts` used by the live Gap Analysis view). This contract covers the **live** one (`principalGaps`).

---

### 9.6 GET /api/v1/principal/academic

**Purpose:** Academic Performance — department-wise pass %, backlogs, semester results, course/calendar completion + pass-% year trend.

**Frontend Screen:** Academic Performance
**Frontend Component:** `AcademicPerformance.tsx`
**Frontend Service:** None today — replaces `deptAcademic` + `analyticsTrends.passPercentage`.

**Query Parameters:** `academicYear`, `search` (dept code/name — client-side today).

**Response DTO: `PrincipalAcademicResponseDTO`**
```json
{
  "success": true,
  "message": "Academic performance retrieved successfully",
  "data": {
    "academicYear": "2025-26",
    "departments": [
      { "dept": "CSE", "passPercentage": 94, "backlogPercentage": 3, "semesterResults": 96, "courseCompletion": 92, "calendarCompletion": 95 }
    ],
    "passPercentageTrend": {
      "years": ["2020-21", "2021-22", "2022-23", "2023-24", "2024-25"],
      "values": [82, 84, 85, 87, 89]
    },
    "semesterResultsPublishedOnTime": 100
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

> ⚠️ "Semester results published on time: 100%" and the "Semester Results" KPI `100%` are **hardcoded** in the component.

---

### 9.7 GET /api/v1/principal/faculty

**Purpose:** Faculty Performance — department-wise strength, PhD %, FDP %, publications, patents, sponsored projects, consultancy, funding + qualification summary.

**Frontend Screen:** Faculty Performance
**Frontend Component:** `FacultyPerformance.tsx`
**Frontend Service:** None today — replaces `deptFaculty`.

**Query Parameters:** `academicYear`, `search`.

**Response DTO: `PrincipalFacultyResponseDTO`**
```json
{
  "success": true,
  "message": "Faculty performance retrieved successfully",
  "data": {
    "academicYear": "2025-26",
    "departments": [
      { "dept": "CSE", "strength": 52, "phdPercentage": 73, "fdpParticipation": 68, "publications": 98, "patents": 5, "sponsoredProjects": 9, "consultancy": 42, "researchFunding": 85 }
    ],
    "qualificationSummary": [
      { "label": "PhD Holders", "value": 186, "total": 312 },
      { "label": "M.Tech / ME", "value": 104, "total": 312 },
      { "label": "NET / SET Qualified", "value": 142, "total": 312 }
    ],
    "researchFundingTotal": "₹4.2 Cr"
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

> ⚠️ `qualificationSummary` is **hardcoded in the component** (186/312, 104/312, 142/312) and "Research Funding ₹4.2 Cr" is a fixed string. Backend should compute these.

---

### 9.8 GET /api/v1/principal/students

**Purpose:** Student Performance — department-wise strength, pass %, placements, higher studies, internships, projects, publications, awards, certifications.

**Frontend Screen:** Student Performance
**Frontend Component:** `StudentPerformance.tsx`
**Frontend Service:** None today — replaces `deptStudent`.

**Query Parameters:** `academicYear`, `search`.

**Response DTO: `PrincipalStudentResponseDTO`** — `deptStudent[]` verbatim:
```json
{
  "success": true,
  "message": "Student performance retrieved successfully",
  "data": {
    "academicYear": "2025-26",
    "departments": [
      { "dept": "CSE", "strength": 780, "passPercentage": 94, "placements": 95, "higherStudies": 14, "internships": 120, "projects": 45, "publications": 12, "awards": 28, "certifications": 320 }
    ]
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

**Client-derived values (✅):** totals for strength/internships/projects/awards/certifications; averages for pass %/placements/higher studies.

---

### 9.9 GET /api/v1/principal/research

**Purpose:** Research & Innovation — department-wise publications, patents, books, sponsored projects, consultancy, project development, funding + publications trend.

**Frontend Screen:** Research & Innovation
**Frontend Component:** `ResearchInnovation.tsx`
**Frontend Service:** None today — replaces `deptResearch` + `researchTotals` + `analyticsTrends.publications`.

**Query Parameters:** `academicYear`, `search`.

**Response DTO: `PrincipalResearchResponseDTO`**
```json
{
  "success": true,
  "message": "Research output retrieved successfully",
  "data": {
    "academicYear": "2025-26",
    "departments": [
      { "dept": "CSE", "publications": 98, "patents": 5, "books": 3, "sponsoredProjects": 9, "consultancy": 42, "projectDevelopment": 12, "researchFunding": 85 }
    ],
    "totals": { "publications": 456, "patents": 18, "books": 12, "sponsoredProjects": 41, "consultancy": 210, "projectDevelopment": 55, "researchFunding": 448 },
    "publicationsTrend": { "years": ["2020-21", "2021-22", "2022-23", "2023-24", "2024-25"], "values": [180, 220, 310, 380, 456] }
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

> ⚠️ "Research Funding ₹4.2 Cr" KPI is a fixed string. The trend chart normalises publications against a hardcoded `500` max (`value/500*100`).

---

### 9.10 GET /api/v1/principal/infrastructure

**Purpose:** Infrastructure Readiness — department-wise labs, equipment, licenses, ICT, smart classrooms, evidence completion + compliance alerts.

**Frontend Screen:** Infrastructure Readiness
**Frontend Component:** `InfrastructureReadiness.tsx`
**Frontend Service:** None today — replaces `deptInfra` + `infraAlerts`.

**Query Parameters:** `academicYear`, `search`.

**Response DTO: `PrincipalInfrastructureResponseDTO`**
```json
{
  "success": true,
  "message": "Infrastructure readiness retrieved successfully",
  "data": {
    "academicYear": "2025-26",
    "departments": [
      { "dept": "CSE", "laboratories": 92, "equipment": 88, "softwareLicenses": 84, "ictFacilities": 95, "smartClassrooms": 90, "evidenceCompletion": 86, "alerts": ["Software licenses for CAD Lab expire in 60 days"] }
    ],
    "alerts": [
      { "dept": "CSE", "alert": "Software licenses for CAD Lab expire in 60 days" }
    ]
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

**Client-derived values (✅):** per-dimension averages; `alerts` flatten of `deptInfra[].alerts`.

---

### 9.11 GET /api/v1/principal/examination

**Purpose:** Read-only examination overview — schedules, published results, supplementary exams, backlog statistics.

**Frontend Screen:** Examination Overview
**Frontend Component:** `ExaminationOverview.tsx`
**Frontend Service:** None today — replaces `examSchedules`, `publishedResults`, `supplementaryExams`, `backlogStats`.

**Query Parameters:** `academicYear`.

**Response DTO: `PrincipalExaminationResponseDTO`**
```json
{
  "success": true,
  "message": "Examination overview retrieved successfully",
  "data": {
    "academicYear": "2025-26",
    "schedules": [
      { "id": "e1", "exam": "Mid-Semester — Odd Sem 2025-26", "start": "2025-08-18", "end": "2025-08-23", "departments": 8, "status": "Published" }
    ],
    "publishedResults": [
      { "id": "r1", "exam": "End-Semester — Even Sem 2024-25", "published": "2025-06-28", "departments": 8, "passPercentage": 87 }
    ],
    "supplementaryExams": [
      { "id": "s1", "exam": "Supplementary — June 2025", "date": "2025-07-01", "candidates": 320, "passPercentage": 62 }
    ],
    "backlogStats": [
      { "dept": "CSE", "backlogs": 3, "pass": 94 }
    ]
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

**Notes (✅ from frontend):**
- `status` values rendered: `Published`, `Scheduled`, `Planned`.
- "Avg Backlog Rate 10%" KPI is **hardcoded**.
- Read-only (`Lock` icon) — no operational controls for the Principal.

---

### 9.12 GET /api/v1/principal/analytics

**Purpose:** Institution Analytics — six trend charts (recharts) across academic years.

**Frontend Screen:** Institution Analytics
**Frontend Component:** `InstitutionAnalytics.tsx`
**Frontend Service:** None today — replaces `analyticsSeries` (`analyticsTrends`).

**Query Parameters:** `academicYear`, `department` (set but 🔶 not actually applied to the data today — gap #11).

**Response DTO: `PrincipalAnalyticsResponseDTO`** — `analyticsSeries[]` verbatim:
```json
{
  "success": true,
  "message": "Analytics retrieved successfully",
  "data": [
    {
      "year": "2024-25",
      "repositoryCompletion": 84,
      "accreditationReadiness": 82,
      "evidenceCompletion": 76,
      "faculty": 312,
      "students": 4850,
      "publications": 456,
      "placements": 82,
      "infrastructure": 79
    }
  ],
  "timestamp": "2026-08-01T12:00:00"
}
```

**Chart series used (✅):** Repository Completion Trend (`repositoryCompletion`), Accreditation Readiness Trend (`accreditationReadiness` + `evidenceCompletion`), Faculty & Student Growth (`faculty`, `students`), Publications Trend (`publications`), Placement Trend (`placements`), Infrastructure Readiness Growth (`infrastructure`). Years: `2020-21 … 2024-25` (5 years).

---

### 9.13 GET /api/v1/principal/ai-recommendations

**Purpose:** AI Recommendations — automatically generated executive insights by domain.

**Frontend Screen:** AI Recommendations
**Frontend Component:** `AIRecommendations.tsx`
**Frontend Service:** None today — replaces `aiRecommendations` + `domainMeta`.

**Query Parameters:** `domain` (optional; `all` or one of the 9 domains).

**Response DTO: `PrincipalAiRecommendationsResponseDTO`** (paginated `AiRecommendation[]`):
```json
{
  "success": true,
  "message": "AI recommendations retrieved successfully",
  "data": {
    "content": [
      { "id": "a1", "domain": "Repository", "title": "ECE Research Repository lagging", "description": "ECE Department has only 62% Research Repository readiness. 5 records lack supporting evidence.", "severity": "high", "department": "ECE" }
    ],
    "totalPages": 1,
    "totalElements": 10,
    "number": 0,
    "size": 20
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

**Domain enum (✅):** `Repository, NBA, NAAC, NIRF, Faculty, Infrastructure, Student, Research, Placement`.
**Severity enum (✅):** `high, medium, low`.
**Client-derived values (✅):** counts by severity; header badge "Updated 5 min ago" is **hardcoded**.
**⚠️ REQUIRES BUSINESS CONFIRMATION:** server-generated vs curated content, and refresh cadence.

> Note: the **live** AI Recommendations view uses `aiRecommendations` (`principal-data.ts`). The older `aiInsights` dataset (`principal-configs.ts`, type `AIInsight` with `confidence`/`actionable`) is consumed **only by the orphaned `ExecutiveModules.tsx`** — gap #2.

---

### 9.14 GET /api/v1/principal/reports

**Purpose:** Report catalogue + recent reports list. Export itself is **client-side and working** (see §16/§20).

**Frontend Screen:** Reports
**Frontend Component:** `ExecutiveReports.tsx` + `report-export.ts`
**Frontend Service:** None today — replaces `REPORT_TYPES` + local `recent` state.

**Response DTO: `PrincipalReportsResponseDTO`**
```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": {
    "reportTypes": [
      { "id": "institution", "name": "Institution Summary", "description": "Institution-level KPIs and readiness overview" }
    ],
    "recentReports": [
      { "id": "gaps", "name": "Gap Analysis Report", "format": "PDF", "date": "2025-07-28" }
    ]
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

**Report types (✅ `REPORT_TYPES` — 10):** `institution`, `department`, `academic-year`, `repository`, `accreditation`, `gaps`, `faculty`, `student`, `research`, `infrastructure`.
**Formats (✅):** PDF and Excel/XLSX only (buttons per report card).

> The card preview badges ("N columns / M rows") call `buildReportData()` **client-side** — if reports move to the backend, the preview must come from a server preview or the same endpoint.

---

## 10. DTO Definitions

| DTO (proposed) | Request/Response | Source |
|----------------|------------------|--------|
| `PrincipalDashboardResponseDTO` | Response | `kpiData` + `institutionStats` + dept summary + critical gaps |
| `PrincipalDepartmentsResponseDTO` | Response | `DepartmentRepositoryData[]` |
| `PrincipalRepositoryReadinessResponseDTO` | Response | `DepartmentRepositoryData[]` + folder/document tree |
| `PrincipalAccreditationResponseDTO` | Response | NBA/NAAC/NIRF criteria + dept matrices + KPIs |
| `PrincipalGapResponseDTO` | Response | `PrincipalGap[]` (paginated) |
| `PrincipalAcademicResponseDTO` | Response | `DeptAcademic[]` + pass-% trend |
| `PrincipalFacultyResponseDTO` | Response | `DeptFaculty[]` + qualification summary + funding |
| `PrincipalStudentResponseDTO` | Response | `DeptStudent[]` |
| `PrincipalResearchResponseDTO` | Response | `DeptResearch[]` + totals + publications trend |
| `PrincipalInfrastructureResponseDTO` | Response | `DeptInfra[]` + flattened alerts |
| `PrincipalExaminationResponseDTO` | Response | schedules + results + supplementary + backlogs |
| `PrincipalAnalyticsResponseDTO` | Response | `analyticsSeries[]` |
| `PrincipalAiRecommendationsResponseDTO` | Response | `AiRecommendation[]` (paginated) |
| `PrincipalReportsResponseDTO` | Response | `REPORT_TYPES` + recent reports |
| `ApiResponse<T>` | Wrapper | Existing (`frontend/src/types/auth.types.ts`) — `{ success, message, data, timestamp }` |

All response DTOs must serialise with **camelCase** property names identical to the frontend interfaces in §4.

---

## 11. Enum Definitions

**All values are the exact frontend strings. Backend may store/emit them as-is (recommended: Java enum with `@JsonValue` returning these exact values).**

### 11.1 Department health (`DepartmentScore.health`)
`"excellent"` · `"good"` · `"warning"` · `"critical"`

### 11.2 Status level (`StatusLevel` — readiness thresholds)
`"ready"` (≥85) · `"attention"` (70–84) · `"critical"` (<70) — thresholds ✅ from `statusOf()` in `common.tsx`

### 11.3 Criterion/parameter status (`FrameworkCriterion.status`, `nirfParameters[].status`)
`"ready"` · `"in-progress"` · `"not-started"`

### 11.4 Principal gap priority (`PrincipalGap.priority`)
`"critical"` · `"high"` · `"medium"` · `"low"`

### 11.5 Principal gap framework (`PrincipalGap.framework`)
`"NAAC"` · `"NBA"` · `"NIRF"` · `"All"`

### 11.6 AI recommendation domain (`AiRecommendation.domain`)
`"Repository"` · `"NBA"` · `"NAAC"` · `"NIRF"` · `"Faculty"` · `"Infrastructure"` · `"Student"` · `"Research"` · `"Placement"`

### 11.7 AI recommendation severity (`AiRecommendation.severity`)
`"high"` · `"medium"` · `"low"`

### 11.8 (Orphan-only, do not implement unless those components are revived)
- `ApprovalItem.priority`: `"high" | "medium" | "low"`; `ApprovalItem.status`: `"pending" | "in-review"`
- `GapItem.impact`: `"critical" | "high" | "medium" | "low"`
- `AIInsight.type`: `"forecast" | "risk" | "recommendation" | "opportunity"`; `impact`: `"high" | "medium" | "low"`
- `ActivityEvent.type`: `"submitted" | "approved" | "uploaded" | "verified" | "gap-closed" | "framework-updated" | "milestone"`

### 11.9 Departments (codes)
`CSE` · `ECE` · `EEE` · `MECH` · `CIVIL` · `IT` · `AIML` · `DS` (order matters for matrices — ✅ `deptCodes` in `principal-data.ts`)

### 11.10 Repositories (`REPO_LIST` — department drill-down, 8)
`Academic` · `Faculty` · `Student` · `Research` · `Infrastructure` · `Examination` · `Alumni` · `Placement`

### 11.11 Programs (filter option values)
`btech` · `mtech` · `mba` · `mca`

### 11.12 Examination schedule status
`"Published"` · `"Scheduled"` · `"Planned"`

### 11.13 Report formats
`pdf` / `excel` (client export) — backend equivalent: `PDF` / `XLSX`

---

## 12. Pagination

| Screen | Today (✅) | Required backend behavior (🔶) |
|--------|-----------|-------------------------------|
| All 14 views | Render **all** rows; search/filters are **client-side**; **no pagination control exists anywhere** | Optional. If data volumes grow, use the standard `page`/`size`/`content`/`totalElements`/`totalPages`/`number` shape. No "Load More" or pager UI to wire today |
| AI Recommendations | 10 items rendered | Optional pagination 🔶 |

> Because the frontend performs all filtering client-side, any future backend pagination requires the frontend to move search/filters server-side. Recommend supporting `search`/`department`/`framework`/`domain` query params from day one (see §13/§14) to avoid rework.

---

## 13. Search

Frontend search today is **client-side** (`filter()`/`includes()` in each component):

| Screen | Searchable fields (✅ from frontend) | API param |
|--------|--------------------------------------|-----------|
| Department Performance | `name`, `code` (case-insensitive) | `search` |
| Repository Readiness | (none — department selection only) | — |
| Academic / Faculty / Student / Research / Infrastructure Performance | `dept` code | `search` |
| Reports | `name`, `description` | `search` |
| Other views | none | — |

---

## 14. Filters

| Screen | Filter (✅ from frontend) | Parameter | Values | Required |
|--------|---------------------------|-----------|--------|----------|
| All views (local state) | Academic Year | `academicYear` | `2025-26` … `2021-22` (UI default `2025-26`) | No |
| Department Performance | Department | `department` | `all` + 8 codes | No |
| Department Performance | Program | `program` | `all \| btech \| mtech \| mba \| mca` — ⚠️ **state set but never applied** (gap #11) | No |
| Repository Readiness | Department | `department` | `all` + 8 codes | No |
| Gap Analysis | Department | `department` | `all` + 8 codes | No |
| Gap Analysis | Framework | `framework` | `all \| NAAC \| NBA \| NIRF` | No |
| Institution Analytics | Department | `department` | `all` + 8 codes — ⚠️ **set but never applied** (gap #11) | No |
| AI Recommendations | Domain | `domain` | `all` + 9 domains | No |

---

## 15. Sorting

- **Today:** No explicit sorting controls exist in any Principal view. Lists rely on mock-data ordering (department code order, repository order, chronological for events).
- **🔶 INFERRED backend behavior:** optional `sort` query param; no default sort requirements beyond stable ordering. **⚠️ REQUIRES BUSINESS CONFIRMATION** whether sortable columns are desired.

---

## 16. Entity & Relationship Requirements

```
Institution  (Principal's institution — derived from JWT institutionId)
   ├── Department ×8 (CSE, ECE, EEE, MECH, CIVIL, IT, AIML, DS)
   │     ├── Repository ×8 (Academic, Faculty, Student, Research,
   │     │                  Infrastructure, Examination, Alumni, Placement)
   │     │     └── Evidence Folder → Documents  (drill-down, read-only)
   │     ├── Academic metrics (DeptAcademic)
   │     ├── Faculty metrics (DeptFaculty)
   │     ├── Student metrics (DeptStudent)
   │     ├── Research metrics (DeptResearch)
   │     ├── Infrastructure metrics (DeptInfra + alerts)
   │     └── Accreditation scores (DeptCriterionScore per framework)
   ├── Institution KPIs / stats (kpiData, institutionStats)
   ├── Accreditation framework criteria (NAAC/NBA/NIRF)
   ├── Gaps (PrincipalGap) → department + repository + framework
   ├── Examination schedules / results / supplementary / backlogs
   ├── Analytics trend series (year-wise)
   └── AI Recommendations (domain-scoped insights)
```

| Resource | Owner | Institution rel. | Department rel. | Parents | Children | Referenced entities |
|----------|-------|------------------|-----------------|---------|----------|---------------------|
| `PrincipalDashboard` (aggregate) | PRINCIPAL role | derived from JWT | all departments | — | KPIs, dept summary, critical gaps | Department, Repository, Accreditation, Gap |
| `DepartmentRepositoryData` | Department Coordinators | institution | department | Institution | Repository rows | Repository, Evidence |
| `DeptCriterionScore` (per framework) | Derived | institution | department | Department | scores[] | NAAC/NBA/NIRF criteria |
| `PrincipalGap` | Backoffice/IQAC | institution | department | Department, Repository | — | Framework, Document/Evidence |
| `DeptAcademic/Faculty/Student/Research/Infra` | Department repos | institution | department | Department | — | underlying repository data |
| `ExamSchedule`/`PublishedResult`/`SupplementaryExam` | Examination Officer | institution | departments (n) | — | — | Department, AcademicYear |
| `AnalyticsSeries` | Derived | institution | — | — | — | AcademicYear |
| `AiRecommendation` | AI service | institution | department (optional) | — | — | Domain, Department |

**Important relationship notes:**
- The Principal is **not bound to a single department** — the endpoint data must be aggregated across **all departments of the institution** (contrast with HOD, which is department-scoped).
- All performance matrices are **department-wise rows** that the frontend renders as tables — the backend can aggregate from the same department-repository tables the HOD/coordinator roles write to.
- Accreditation matrices (`DeptCriterionScore`) are **derived** from per-department readiness per criterion (mock uses deterministic seeded generation; backend should compute from real data).
- The read-only repository drill-down (`folders`/`documents`) currently shows **static sample structure** (`DOC_STRUCTURE`) — the backend must expose the real evidence folder/document tree per department-repository if the drill-down is to show real data (⚠️ business confirmation: whether the Principal may open documents).

---

## 17. Institution / Department Data Isolation

- ✅ **CONFIRMED:** `User` carries `institutionId`/`institutionName`/`department`/`departmentId`. The platform is multi-institution.
- 🔶 **Required for every Principal endpoint:** data filtered by **institution** derived from the authenticated JWT. The Principal sees **all departments within that institution** — there is no per-department scoping (unlike HOD).
- **Never trust client-supplied `institutionId`/`departmentId`** for authorization.
- The `department` filter query param (used in Department Performance, Gap Analysis, Repository Readiness, Analytics) is a **display filter only** — the backend must still enforce institution scope server-side and treat `department` as a non-authoritative filter.

---

## 18. File Upload / Download APIs

| Aspect | Contract |
|--------|----------|
| Upload | **Not part of the Principal surface.** The Principal is read-only; uploads belong to coordinators/officers. ✅ CONFIRMED — no upload endpoints |
| Download | None today (the repository drill-down shows file *names* only; no download button). 🔶 INFERRED: if the drill-down is extended to open documents, add `GET /api/v1/principal/repository-readiness/documents/{id}/download` — ⚠️ requires business confirmation |
| Report export files | Generated **client-side** (jsPDF/XLSX) — no backend file storage today. See §20 |

---

## 19. Dashboard APIs

**Recommendation (✅ supported by the frontend): a single aggregation endpoint** — `GET /api/v1/principal/dashboard` (see §9.1) — because `ExecutiveDashboard.tsx` renders all 12 KPI cards, the readiness gauge, the department summary and the critical-gap strip from one import block of mock objects.

| Displayed value | Source today (✅) | Backend response field | Calculation / note |
|-----------------|-------------------|------------------------|--------------------|
| Overall Repository Readiness | `kpiData.repositoryCompletion` (84) | `kpi.repositoryCompletion` | aggregation |
| NBA / NAAC / NIRF Readiness | `kpiData.nbaReadiness` (75) / `naacReadiness` (82) / `nirfReadiness` (71) | `kpi.*Readiness` | weighted per framework |
| Total Departments / Programs / Faculty / Students | `institutionStats.*` | `institutionStats.*` | institution config/census |
| Evidence Completion | `kpiData.evidenceCompletion` (76) | `kpi.evidenceCompletion` | aggregation |
| Pending HOD Approvals | `kpiData.pendingApprovals` (14) | `kpi.pendingApprovals` | workflow queue count |
| IQAC Observations | **hardcoded `'5'`** | `kpi.iqacObservations` | ⚠️ real count required |
| Critical Gaps | `principalGaps.filter(critical)` | `criticalGaps` | count + detail |
| Institution Readiness gauge | `kpiData.repositoryCompletion` + derived approved/missing evidence | `kpi.repositoryCompletion` | approved = `round(evidenceCompletion × 0.72)` — ⚠️ hardcoded factor |
| Department Summary table | `departmentRepositories` × accreditation `overall` | `departments[]` | readiness + nba + naac + nirf per dept |

---

## 20. Reports / Export APIs

| Action (✅ from `ExecutiveReports.tsx`) | Backend required? | Contract |
|-----------------------------------------|-------------------|----------|
| Export report to **PDF** | **No — frontend-only today** (✅ working: `exportReportToPDF` → jsPDF + autoTable) | — |
| Export report to **Excel/XLSX** | **No — frontend-only today** (✅ working: `exportReportToExcel` → XLSX + file-saver) | — |
| Report catalogue + recent list | 🔶 INFERRED (optional) | `GET /api/v1/principal/reports` |
| Server-side report generation | 🔶 Optional/⚠️ business decision | `POST /api/v1/principal/reports/generate` (`{reportType, academicYear, format}`) — only if reports must be generated server-side (e.g. from real data with large volumes) |

**Important:** the current export works entirely **client-side using the mock datasets** (`buildReportData()` pulls `kpiData`, `departmentRepositories`, `deptAcademic`, `deptFaculty`, `deptStudent`, `deptResearch`, `deptInfra`, `principalGaps`, accreditation matrices). Once those datasets are backend-served, the same client-side export can keep working from fetched data — **no backend export endpoint is strictly required**. The `academic-year` report rows are generated from hardcoded formulas (`72 + i*3`, `68 + i*3`, `65 + i*2`, `72 + i*2`) — ⚠️ needs real data.

---

## 21. Mock Data Replacement Map

Every Principal mock/static dataset, its consumer, and the backend API that replaces it:

| # | File / Variable | Used By | Key fields | Intended backend source | Proposed API |
|---|-----------------|---------|------------|--------------------------|--------------|
| 1 | `principal-configs.ts` → `kpiData` | ExecutiveDashboard, AccreditationReadiness, report-export | readiness/KPIs (12 keys) | Institution aggregation service | `GET /dashboard`, `GET /accreditation` |
| 2 | `principal-configs.ts` → `institutionStats` | ExecutiveDashboard, orphan InstitutionOverview/DomainAnalytics | programs, departments, students, faculty, packages, infrastructure, budget | Institution profile/census | `GET /dashboard` |
| 3 | `principal-configs.ts` → `departmentScores` | orphan only | dept readiness scores | Dept aggregation | `GET /dashboard` (via dept summary) |
| 4 | `principal-configs.ts` → `repositoryStatuses` | orphan `RepositoryHealth` only | repo completion/quality | Repository health service | — (unused today) |
| 5 | `principal-configs.ts` → `approvalItems` | orphan `ExecutiveModules` only | approval queue | Workflow service | — (unused today) |
| 6 | `principal-configs.ts` → `gapItems` | orphan `ExecutiveModules` only | current/target gaps | Gap service | — (unused today; live view uses `principalGaps`) |
| 7 | `principal-configs.ts` → `naacCriteria` | AccreditationReadiness, orphan ExecutiveModules | criterion completion/evidence | Accreditation service | `GET /accreditation` |
| 8 | `principal-configs.ts` → `nbaCriteria` | orphan only | NBA criterion readiness | Accreditation service | — (unused today) |
| 9 | `principal-configs.ts` → `nirfParameters` | AccreditationReadiness | NIRF parameter scores | Accreditation service | `GET /accreditation` |
| 10 | `principal-configs.ts` → `aiInsights` | orphan `ExecutiveModules` only | AI insights w/ confidence | AI insights service | — (unused today; live view uses `aiRecommendations`) |
| 11 | `principal-configs.ts` → `activityEvents` | orphan `ExecutiveModules` only | activity feed | Activity/audit service | — (unused today) |
| 12 | `principal-configs.ts` → `fiveYearTrends` | orphan InstitutionOverview/DomainAnalytics | year-wise arrays | Trend aggregation | — (unused today; live views use `analyticsTrends`) |
| 13 | `principal-configs.ts` → `academicPerformance` | orphan `DomainAnalytics` only | dept academic detail | Academic aggregation | — (unused today; live view uses `deptAcademic`) |
| 14 | `principal-configs.ts` → `reportTypes` | orphan `ExecutiveModules` only | report catalogue | Reports service | — (unused today; live view uses `REPORT_TYPES`) |
| 15 | `principal-data.ts` → `departmentRepositories` | ExecutiveDashboard, DepartmentPerformance, RepositoryReadiness, report-export | dept × repo matrix | Dept/repository aggregation | `GET /dashboard`, `GET /departments`, `GET /repository-readiness` |
| 16 | `principal-data.ts` → `nbaDeptScores` / `naacDeptScores` / `nirfDeptScores` | ExecutiveDashboard, AccreditationReadiness, report-export | dept × criterion scores | Accreditation computation | `GET /accreditation`, `GET /dashboard` |
| 17 | `principal-data.ts` → `principalGaps` | ExecutiveDashboard, GapAnalysis, report-export | remediation gaps | Gap service | `GET /gaps` |
| 18 | `principal-data.ts` → `deptAcademic` | AcademicPerformance, report-export | academic metrics | Academic aggregation | `GET /academic` |
| 19 | `principal-data.ts` → `deptFaculty` | FacultyPerformance, report-export | faculty metrics | Faculty aggregation | `GET /faculty` |
| 20 | `principal-data.ts` → `deptStudent` | StudentPerformance, report-export | student metrics | Student aggregation | `GET /students` |
| 21 | `principal-data.ts` → `deptResearch` + `researchTotals` | ResearchInnovation, report-export | research metrics | Research aggregation | `GET /research` |
| 22 | `principal-data.ts` → `deptInfra` + `infraAlerts` | InfrastructureReadiness, report-export | infra metrics + alerts | Infrastructure aggregation | `GET /infrastructure` |
| 23 | `principal-data.ts` → `examSchedules` / `publishedResults` / `supplementaryExams` / `backlogStats` | ExaminationOverview | exam overview | Examination service (read-only) | `GET /examination` |
| 24 | `principal-data.ts` → `analyticsTrends` / `analyticsSeries` | InstitutionAnalytics, AcademicPerformance, ResearchInnovation | trend series | Trend aggregation | `GET /analytics` |
| 25 | `principal-data.ts` → `aiRecommendations` + `domainMeta` | AIRecommendations | AI insights by domain | AI recommendations service | `GET /ai-recommendations` |
| 26 | `report-export.ts` → `REPORT_TYPES` + `buildReportData` | ExecutiveReports (working export) | report rows/columns | Backend datasets (once served) | `GET /reports` (optional) |
| 27 | `ExecutiveReports.tsx` → `recent` state | recent reports list | id, name, format, date | Report generation history | `GET /reports` |
| 28 | `RepositoryReadiness.tsx` → `DOC_STRUCTURE` | drill-down folders/documents | folder → doc names | Real evidence tree | `GET /repository-readiness` |
| 29 | `RepositoryHealth.tsx` → local `evidenceData` | orphan only | mandatory/optional evidence | Evidence aggregation | — (unused today) |

---

## 22. Frontend Contract Gaps

1. **No API layer exists** — all 14 views are 100 % mock (`principal-configs.ts` / `principal-data.ts`); every endpoint in this document is 🔶 INFERRED until frontend wiring happens.
2. **Four orphaned components** (`RepositoryHealth`, `InstitutionOverview`, `ExecutiveModules`, `DomainAnalytics`) are not mounted by any route and carry **duplicate/overlapping datasets** (`repositoryStatuses`, `approvalItems`, `gapItems`, `nbaCriteria`, `aiInsights`, `activityEvents`, `reportTypes`, `fiveYearTrends`, `academicPerformance`, `departmentScores`). Do not build APIs for these unless the components are revived.
3. **Duplicate datasets with different shapes:** `aiInsights` (config, `confidence`/`actionable`) vs `aiRecommendations` (data, `domain`/`severity`); `gapItems` (config, `currentStatus` string) vs `principalGaps` (data, `current` number); `departmentScores` vs `departmentRepositories`.
4. **Report export is client-side** (jsPDF/XLSX) and **works today** — but `buildReportData()` hardcodes mock rows; the `academic-year` report uses formula-generated values (`72 + i*3`, …).
5. **Hardcoded display values** across views: IQAC Observations `'5'`, "Semester results published on time: 100%", "Avg Backlog Rate 10%", "Research Funding ₹4.2 Cr", "Evidence Folders 16", NBA "Programs Eligible 3", NAAC "Projected Grade A", NIRF "Projected Band 101–150", "Updated 5 min ago", qualification summary (186/312 etc.), approved-evidence factor `0.72`.
6. **Per-view year state** — there is **no global academic-year selector** (unlike HOD); each view defaults to `2025-26` in local state. Backend must accept `academicYear` per endpoint.
7. **Repository naming inconsistency** — `principal-configs.repositoryStatuses` uses full names (`"Student Development Repository"`) while `principal-data.REPO_LIST` uses short names (`Academic, Faculty, Student, Research, Infrastructure, Examination, Alumni, Placement`).
8. **Unused filter state** — `program` filter in DepartmentPerformance and `department` filter in InstitutionAnalytics are set but never applied to the data.
9. **No pagination** in any view despite potentially large tables (12–80+ rows).
10. **Principal has no write actions** — `approvalItems` (the only approval-ish mock) lives in an orphan component; the read-only lock labels are explicit everywhere.
11. **Drill-down document status is synthetic** — `RepositoryReadiness` derives document status from `statusOf(78 + ((di*7)%20))`; no real per-document status exists.
12. **Dashboard dept summary joins three sources** (`departmentRepositories` + three `*DeptScores` arrays by `code`/`dept` keys) — the backend must return a consistent joined shape to avoid key mismatches.
13. **`kpiData` has 12 keys but only 6 are consumed** (`institutionReadiness`, `verificationStatus`, `departmentsAtRisk`, `overallHealthScore`, `performanceIndex`, `dataQualityScore` are unused) — decide whether to keep them in the contract.
14. **Pagination shape** — same project-wide ambiguity as documented for HOD (`content,page,size,totalElements,totalPages,last,first` vs `content,totalPages,totalElements,number,size`); this contract standardises on the latter.

---

## 23. Business Rules Requiring Confirmation

1. **Read-only confirmation** — the frontend is explicitly read-only (✅); confirm the Principal has **no** write/approval capabilities in the product workflow (no endpoint proposed for them).
2. **Gap ownership & remediation** — who creates/updates/resolves `PrincipalGap` entries (HOD? IQAC? backoffice?), and whether gap data is auto-derived or curated.
3. **AI recommendations** — server-generated vs curated; refresh cadence; the "Updated 5 min ago" badge.
4. **Institution vs department data ownership** — which metrics are institution-owned (e.g. budget, infrastructure totals) vs aggregated from departments.
5. **Report generation** — keep client-side export (recommended) or move to backend `POST /reports/generate`; if backend, define file storage and retention.
6. **Repository drill-down depth** — may the Principal open/download actual evidence documents from the drill-down, or is the folder/document list display-only?
7. **Academic-year handling** — is historical year data available for all views (the mock only varies some series by year), and does the `academicYear` param apply to all 14 endpoints?
8. **KPI formulas** — institutionReadiness, healthScore, performanceIndex, dataQualityScore (currently unused) and the `0.72` approved-evidence factor.
9. **Program-level filtering** — the `program` filter exists in the UI but is inert; confirm whether program-scoped views are intended.
10. **Examination data source** — schedules/results are managed by the Examination Officer module; confirm the Principal reads those records read-only (no duplication).

---

## 24. Backend Implementation Checklist

### Controllers
- [ ] `PrincipalDashboardController` — `GET /api/v1/principal/dashboard`
- [ ] `PrincipalDepartmentController` — `GET /departments`
- [ ] `PrincipalRepositoryReadinessController` — `GET /repository-readiness`
- [ ] `PrincipalAccreditationController` — `GET /accreditation`
- [ ] `PrincipalGapController` — `GET /gaps`
- [ ] `PrincipalPerformanceController` — `GET /academic`, `GET /faculty`, `GET /students`, `GET /research`, `GET /infrastructure`
- [ ] `PrincipalExaminationController` — `GET /examination` (read-only view over EO-managed data)
- [ ] `PrincipalAnalyticsController` — `GET /analytics`
- [ ] `PrincipalAiRecommendationsController` — `GET /ai-recommendations`
- [ ] `PrincipalReportController` — `GET /reports` (optional; exports remain client-side)
- [ ] Swagger `@Tag(name = "Principal - Executive Overview")`, `@SecurityRequirement(name = "bearerAuth")` on all

### DTOs
- [ ] `ApiResponse<T>` (reuse existing)
- [ ] `PrincipalDashboardResponseDTO` (+ `PrincipalKpiDTO`, `InstitutionStatsDTO`, `DepartmentSummaryDTO`, `CriticalGapDTO`)
- [ ] `DepartmentRepositoryDataDTO` (+ `DeptRepoRowDTO`)
- [ ] `PrincipalRepositoryReadinessResponseDTO` (+ `RepositoryFolderDTO`, `RepositoryDocumentDTO`)
- [ ] `PrincipalAccreditationResponseDTO` (+ `FrameworkDataDTO` ×3, `DeptCriterionScoreDTO`, `CriterionDTO`)
- [ ] `PrincipalGapResponseDTO` (paginated `PrincipalGapDTO`)
- [ ] `PrincipalAcademicResponseDTO` / `PrincipalFacultyResponseDTO` / `PrincipalStudentResponseDTO` / `PrincipalResearchResponseDTO` / `PrincipalInfrastructureResponseDTO` (+ their row DTOs, `TrendSeriesDTO`)
- [ ] `PrincipalExaminationResponseDTO` (+ `ExamScheduleDTO`, `PublishedResultDTO`, `SupplementaryExamDTO`, `BacklogStatDTO`)
- [ ] `PrincipalAnalyticsResponseDTO` (`AnalyticsSeriesDTO`)
- [ ] `PrincipalAiRecommendationsResponseDTO` (paginated `AiRecommendationDTO`)
- [ ] `PrincipalReportsResponseDTO` (+ `ReportTypeDTO`, `RecentReportDTO`)

### Services
- [ ] `PrincipalDashboardService` — institution aggregate (KPIs, dept summary joined with accreditation, critical gaps)
- [ ] `PrincipalDepartmentService` — dept list + repo matrix + breakdown, with year/dept filters
- [ ] `PrincipalRepositoryReadinessService` — drill-down tree (dept → repo → folders → docs)
- [ ] `PrincipalAccreditationService` — NBA/NAAC/NIRF criteria + dept matrices computation
- [ ] `PrincipalGapService` — gap list with filters
- [ ] `PrincipalPerformanceService` — academic/faculty/student/research/infrastructure aggregation
- [ ] `PrincipalExaminationService` — read-only projection of EO-managed schedules/results/backlogs
- [ ] `PrincipalAnalyticsService` — trend series computation
- [ ] `PrincipalAiRecommendationsService` — insight generation/retrieval
- [ ] All services enforce institution scope from the authenticated principal

### Repositories
- [ ] Reuse department / repository / evidence / accreditation / gap / examination repositories (read-only queries)
- [ ] Aggregation queries for dept×repo matrix, dept×criterion matrices, trend series, KPI rollups

### Entities
- [ ] **No new principal-owned entities required** — the Principal reads aggregated data. Only add read-projection DTOs. If report history is tracked, add `GeneratedReport` (optional)

### Enums
- [ ] `StatusLevel` (READY, ATTENTION, CRITICAL — emit exact frontend strings)
- [ ] `GapPriority` (CRITICAL, HIGH, MEDIUM, LOW)
- [ ] `AccreditationFramework` (NAAC, NBA, NIRF)
- [ ] `RecommendationDomain` (REPOSITORY, NBA, NAAC, NIRF, FACULTY, INFRASTRUCTURE, STUDENT, RESEARCH, PLACEMENT)
- [ ] `RecommendationSeverity` (HIGH, MEDIUM, LOW)
- [ ] `ExamScheduleStatus` (PUBLISHED, SCHEDULED, PLANNED)

### Database
- [ ] No new tables required if aggregations run over existing department-repository, evidence, gap, and examination tables
- [ ] Indexes on `(institution_id, academic_year)` for aggregation queries if volume requires

### Flyway Migrations
- [ ] None strictly required (read-only module). Only if `GeneratedReport` history is introduced

### Security
- [ ] Method-level `@PreAuthorize("hasRole('PRINCIPAL')")` on all endpoints
- [ ] Institution scope derived from JWT on every query
- [ ] `department` query param treated as non-authoritative filter only
- [ ] Read-only enforcement — no mutation endpoints exposed

### Tests
- [ ] Controller tests for all 14 endpoints (200/401/403)
- [ ] Service tests for aggregations (dept matrix, accreditation matrices, trend series, KPIs)
- [ ] Security integration tests — cross-institution access denied; non-PRINCIPAL roles denied
- [ ] Validation tests (bad academicYear pattern, unknown department code)

---

## 25. Quality Check

- [x] Every Principal screen identified (14 views)
- [x] Every Principal route identified (`/app/principal-dashboard` + `?view=` variants)
- [x] Every major component traced (14 live + 4 orphaned documented)
- [x] Every relevant types file identified (`principal-configs.ts`, `principal-data.ts`, `report-export.ts`, `auth.types.ts`)
- [x] Every relevant service file identified (none exist for Principal — documented)
- [x] Every existing API call identified (0 in Principal pages; auth calls documented)
- [x] Every mock data source identified (§21 — 29 sources)
- [x] Every user action mapped (filter, search, drill-down, view gap detail, export report)
- [x] Every required endpoint documented (14, all read-only)
- [x] Request DTOs documented (none — no request bodies; query params documented)
- [x] Response DTOs documented
- [x] Enums documented (exact frontend values)
- [x] Search documented (§13)
- [x] Filters documented (§14)
- [x] Sorting documented (§15)
- [x] Pagination documented (§12)
- [x] File operations documented (§18 — none required; report exports client-side)
- [x] Dashboard documented (§19)
- [x] Reports/exports documented (§20)
- [x] Institution isolation documented (§7, §17)
- [x] Department isolation documented (§17 — Principal is institution-wide)
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
| Principal screens found | **14** (1 route, 14 `?view=` views) |
| Frontend type files found | **3** (`principal-configs.ts`, `principal-data.ts`, `components/report-export.ts`) + 1 shared (`auth.types.ts`) |
| Service/API files found | **0** dedicated to Principal (2 indirect: `auth.service.ts`, `impersonation.service.ts`) |
| Existing API calls found | **0** inside Principal pages (app-wide auth calls only) |
| Required endpoints | **14** (all read-only) |
| Mock data sources | **29** |
| Contract gaps | **14** |
| Business rules requiring confirmation | **10** |

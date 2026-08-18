# Infrastructure Coordinator — API Contract

> **Document type:** Backend API contract (analysis-only, reverse-engineered from the existing frontend)
> **Role:** INFRASTRUCTURE_COORDINATOR
> **Frontend module analyzed:** `frontend/src/pages/infrastructure-repository/` + shared engine `frontend/src/pages/department-repository/`
> **Status:** All proposed endpoints are 🔶 **INFERRED** — the frontend currently makes **zero** API calls (100% mock data). Field names are copied **verbatim** from the TypeScript interfaces/config files.
> **Confidence legend:** ✅ CONFIRMED FROM FRONTEND · 🔶 INFERRED (reasonable contract proposal) · ⚠️ REQUIRES BUSINESS CONFIRMATION

---

## 1. Purpose

This document defines the backend API contract required to make the existing **Infrastructure Coordinator** frontend fully functional.

The Infrastructure Coordinator is responsible for maintaining **institution-wide infrastructure, green-campus, safety & security, and utilities data** for accreditation (NBA / NAAC / NIRF evidence). The frontend is organized around **four repository modules** — Infrastructure, Green Campus & Sustainability, Safety & Security, and Utilities — each containing **metadata-driven data tabs** (record tables, CSV import, evidence repository), plus a Dashboard, Supporting Documents, Upload History, Verification Status, and Profile views.

**Critical scope difference vs other roles:** the Infrastructure Coordinator manages data at the **institution level** (all buildings, all classrooms, the transport fleet, campus-wide audits, etc.), **not** a single department. However — as documented in §22 — the current frontend reuses several **department-scoped** shared views/components from the Department Coordinator module, so backend design must reconcile both expectations.

The frontend is the source of truth. Every field name below is copied from the actual frontend implementation. No frontend file was modified to produce this document.

---

## 2. Frontend Source of Truth

### Route & Layout

| Item | Value |
|------|-------|
| **Route** | `/app/infrastructure-repository` (index route, no `?view=` param — view switching is internal state) |
| **Route definition** | `frontend/src/App.tsx` |
| **Layout** | `frontend/src/layouts/InfrastructureCoordinatorLayout.tsx` — `Header` + `NotificationPanel` + `ImpersonationBanner`, **no outer sidebar** (page has its own internal sidebar) |
| **Page** | `frontend/src/pages/infrastructure-repository/InfrastructureRepositoryPage.tsx` |
| **Allowed roles** | `UserRole.INFRASTRUCTURE_COORDINATOR`, `UserRole.DEPARTMENT_COORDINATOR` (both are wired to this route today) |

### Infrastructure Coordinator Pages & Components (28 views)

| # | View | Component | Renders via |
|---|------|-----------|-------------|
| 1 | Dashboard | `components/InfrastructureDashboard.tsx` | — |
| 2 | Buildings | `InfrastructureRepositoryPage` → `RepositoryWorkspace` | `DepartmentInfrastructureModule` ⚠️ (see §22 gap #1) |
| 3 | Classrooms | same | `DepartmentInfrastructureModule` |
| 4 | Laboratories | same | `DepartmentInfrastructureModule` |
| 5 | Equipment | same | `DepartmentInfrastructureModule` ⚠️ |
| 6 | Library | same | `DepartmentInfrastructureModule` ⚠️ |
| 7 | ICT Infrastructure | same | `DepartmentInfrastructureModule` ⚠️ |
| 8 | Hostels | same | `DepartmentInfrastructureModule` ⚠️ |
| 9 | Sports Facilities | same | `DepartmentInfrastructureModule` ⚠️ |
| 10 | Seminar Halls | same | `DepartmentInfrastructureModule` ⚠️ |
| 11 | Transport | same | `DepartmentInfrastructureModule` ⚠️ |
| 12 | Green Initiatives | `RepositoryWorkspace` | generic `RepositoryTabContent` (config-driven) |
| 13 | Energy Management | same | `RepositoryTabContent` |
| 14 | Water Management | same | `RepositoryTabContent` |
| 15 | Waste Management | same | `RepositoryTabContent` |
| 16 | Green Audit | same | `RepositoryTabContent` |
| 17 | Fire Safety | same | `RepositoryTabContent` |
| 18 | Security Infrastructure | same | `RepositoryTabContent` |
| 19 | Emergency Preparedness | same | `RepositoryTabContent` |
| 20 | Insurance & Compliance | same | `RepositoryTabContent` |
| 21 | Power Infrastructure | same | `RepositoryTabContent` |
| 22 | Water Supply | same | `RepositoryTabContent` |
| 23 | Internet & Network | same | `RepositoryTabContent` |
| 24 | Utility Assets | same | `RepositoryTabContent` |
| 25 | Supporting Documents | `components/InfrastructureDocumentsView.tsx` | — |
| 26 | Upload History | `department-repository/components/UploadHistoryView.tsx` (shared) | — |
| 27 | Verification Status | `department-repository/components/VerificationStatusView.tsx` (shared) | — |
| 28 | Profile | `department-repository/components/ProfileView.tsx` (shared) | — |

### Shared workspace engine (`department-repository/` — reused by Infrastructure Coordinator)

| File | Role |
|------|------|
| `department-repository/components/RepositoryWorkspace.tsx` | Renders a `RepositoryModuleConfig`; dispatches to dedicated modules (`DepartmentInfrastructureModule` for `id === 'infrastructure'`) or the generic `RepositoryTabContent` |
| `department-repository/components/RepositoryTabContent.tsx` | **Generic config-driven tab**: record table, search, edit dialog, CSV upload dialog, template download (client-generated CSV), evidence repository |
| `department-repository/components/DepartmentInfrastructureModule.tsx` | **Infrastructure-specific module** with hardcoded department-level sections (classrooms, tutorial-rooms, laboratories, staff-rooms, faculty-cabins, hod-cabin, smart-classrooms, ict-classrooms, lab-equipment, software-licenses, dept-assets) — see §22 gap #1 |
| `department-repository/components/UploadHistoryView.tsx` | Upload history table + summary cards + filters |
| `department-repository/components/VerificationStatusView.tsx` | Repository-wise verification progress |
| `department-repository/components/ProfileView.tsx` | Coordinator profile / assignment / readiness |
| `department-repository/components/CSVUploadDialog.tsx` | 6-step CSV import: upload → mapping → validate → preview → evidence → submit |
| `department-repository/repository-configs.ts` | Shared mock data (master data, upload history, evidence docs, repository health) |
| `department-repository/types.ts` | Shared type definitions |

### Config / Data / Type files

| File | Role |
|------|------|
| `infrastructure-repository/infrastructure-configs.ts` | **Primary source of truth** — 4 repository module configs (23 data tabs), field schemas, required evidence, validation rules, template filenames, document categories, summary data, upload history, recent activities, analytics |
| `department-repository/types.ts` | `RepositoryFieldConfig`, `RepositoryTabConfig`, `RepositoryModuleConfig`, `RepositorySummary`, `RepositoryMetrics`, `UploadHistoryRecord`, `EvidenceDocument`, `WorkflowStatus`, etc. |
| `components/shared/EvidenceUploadDialog.tsx` | Shared evidence upload dialog (accepted types, 10 MB limit) |

---

## 3. Infrastructure Coordinator Screen Inventory

| # | Screen | Internal View ID | Main Component | Purpose |
|---|--------|------------------|----------------|---------|
| 1 | Dashboard | `dashboard` | `InfrastructureDashboard` | Score cards, module KPI grids, analytics highlights, pending cards, recent activities |
| 2 | Buildings | `buildings` | `RepositoryWorkspace` + `DepartmentInfrastructureModule` | Building records (10 fields) + evidence |
| 3 | Classrooms | `classrooms` | `RepositoryWorkspace` + `DepartmentInfrastructureModule` | Classroom records + evidence |
| 4 | Laboratories | `laboratories` | `RepositoryWorkspace` + `DepartmentInfrastructureModule` | Laboratory records + evidence |
| 5 | Equipment | `equipment` | `RepositoryWorkspace` + `DepartmentInfrastructureModule` | Equipment records + evidence |
| 6 | Library | `library` | `RepositoryWorkspace` + `DepartmentInfrastructureModule` | Library statistics per academic year |
| 7 | ICT Infrastructure | `ict-infrastructure` | `RepositoryWorkspace` + `DepartmentInfrastructureModule` | ICT inventory per academic year |
| 8 | Hostels | `hostels` | `RepositoryWorkspace` + `DepartmentInfrastructureModule` | Hostel records + evidence |
| 9 | Sports Facilities | `sports-facilities` | `RepositoryWorkspace` + `DepartmentInfrastructureModule` | Sports facility records |
| 10 | Seminar Halls & Auditoriums | `seminar-halls` | `RepositoryWorkspace` + `DepartmentInfrastructureModule` | Hall records |
| 11 | Transport | `transport` | `RepositoryWorkspace` + `DepartmentInfrastructureModule` | Fleet records (fitness/insurance validity) |
| 12 | Green Campus Initiatives | `green-initiatives` | `RepositoryWorkspace` + `RepositoryTabContent` | Initiative records per AY |
| 13 | Energy Management | `energy-management` | `RepositoryWorkspace` + `RepositoryTabContent` | Consumption / solar / DG records per AY |
| 14 | Water Management | `water-management` | `RepositoryWorkspace` + `RepositoryTabContent` | Water source/consumption/RWH records |
| 15 | Waste Management | `waste-management` | `RepositoryWorkspace` + `RepositoryTabContent` | Waste type/disposal records |
| 16 | Green Audit | `green-audit` | `RepositoryWorkspace` + `RepositoryTabContent` | Audit conducted/agency/score records |
| 17 | Fire Safety | `fire-safety` | `RepositoryWorkspace` + `RepositoryTabContent` | Extinguishers/alarm/inspection records |
| 18 | Security Infrastructure | `security-infrastructure` | `RepositoryWorkspace` + `RepositoryTabContent` | CCTV/personnel/entry systems |
| 19 | Emergency Preparedness | `emergency-preparedness` | `RepositoryWorkspace` + `RepositoryTabContent` | Disaster plan/mock drills/first aid |
| 20 | Insurance & Compliance | `insurance-compliance` | `RepositoryWorkspace` + `RepositoryTabContent` | Insurance policies + validity |
| 21 | Power Infrastructure | `power-infrastructure` | `RepositoryWorkspace` + `RepositoryTabContent` | Load/transformer/DG/UPS per AY |
| 22 | Water Supply | `water-supply` | `RepositoryWorkspace` + `RepositoryTabContent` | Sources/capacity per AY |
| 23 | Internet & Network | `internet-network` | `RepositoryWorkspace` + `RepositoryTabContent` | ISP/bandwidth/uptime per AY |
| 24 | Utility Assets | `utility-assets` | `RepositoryWorkspace` + `RepositoryTabContent` | Generator/UPS/transformer assets |
| 25 | Supporting Documents | `supporting-documents` | `InfrastructureDocumentsView` | Category grid + document list + search + upload |
| 26 | Upload History | `upload-history` | `UploadHistoryView` (shared) | CSV upload tracking + workflow status |
| 27 | Verification Status | `verification-status` | `VerificationStatusView` (shared) | Repository-wise verification progress |
| 28 | Profile | `profile` | `ProfileView` (shared) | Coordinator info, department assignment, readiness, permissions |

**Navigation structure** (sidebar groups, `InfrastructureRepositoryPage.tsx`):

- **Infrastructure** (10): buildings, classrooms, laboratories, equipment, library, ict-infrastructure, hostels, sports-facilities, seminar-halls, transport
- **Green Campus & Sustainability** (5): green-initiatives, energy-management, water-management, waste-management, green-audit
- **Safety & Security** (4): fire-safety, security-infrastructure, emergency-preparedness, insurance-compliance
- **Utilities** (4): power-infrastructure, water-supply, internet-network, utility-assets
- **Bottom items** (4): supporting-documents, upload-history, verification-status, profile

---

## 4. Frontend Type Inventory

### 4.1 Shared workspace types (`pages/department-repository/types.ts`)

| Type | Fields | Used By |
|------|--------|---------|
| `RepositoryFieldConfig` | `key: string`; `label: string`; `type: 'text' \| 'number' \| 'date' \| 'select' \| 'boolean'`; `required: boolean`; `csvColumn: string`; `masterDataSource?: 'programs' \| 'departments' \| 'specializations' \| 'academicYears' \| 'regulations' \| 'programOfferings' \| 'platforms'`; `autoPopulate?: boolean`; `selectOptions?: string[]`; `validationRules?: string[]` | Every data tab |
| `RepositoryTabConfig` | `id: string`; `label: string`; `icon: string`; `fields: RepositoryFieldConfig[]`; `requiredEvidence: string[]`; `validationRules: string[]`; `templateFile: string` | `RepositoryWorkspace` / `RepositoryTabContent` / `CSVUploadDialog` |
| `RepositoryModuleConfig` | `id: string`; `label: string`; `description: string`; `icon: string`; `color: string`; `gradient: string`; `tabs: RepositoryTabConfig[]` | `RepositoryWorkspace` |
| `RepositorySummary` | `recordsUploaded: number`; `pendingValidation: number`; `pendingVerification: number`; `verified: number`; `approved: number`; `rejected: number`; `lastUpdated: string` | Dashboard KPI cards, `infrastructureSummaryData` |
| `RepositoryMetrics` | `dataCompleteness: number`; `evidenceCompleteness: number`; `verificationPercent: number`; `readinessScore: number` | Score cards (workspace header, verification status, profile) |
| `UploadHistoryRecord` | `id`; `fileName`; `tab`; `repository`; `uploadedAt`; `recordsCount`; `validRecords`; `invalidRecords`; `status: 'approved' \| 'rejected' \| 'pending' \| 'processing'`; `uploadedBy`; `workflowStatus: WorkflowStatus` | `UploadHistoryView` |
| `EvidenceDocument` | `id`; `name`; `category`; `version`; `uploadedBy`; `uploadedDate`; `status: 'uploaded' \| 'pending' \| 'verified' \| 'rejected'`; `fileType: 'pdf' \| 'docx' \| 'xlsx' \| 'zip' \| 'png' \| 'jpg'`; `size: string` | `RepositoryTabContent` evidence repository, `VerificationStatusView`-adjacent lists |
| `WorkflowStep` | `id`; `label`; `status: 'completed' \| 'current' \| 'pending' \| 'rejected'`; `timestamp?`; `actor?` | workflow stepper |
| `ValidationError` | `row: number`; `column: string`; `value: string`; `message: string`; `severity: 'error' \| 'warning'` | `CSVUploadDialog` / `mockValidationResult` |
| `ValidationResult` | `totalRows`; `validRows`; `invalidRows`; `warnings`; `errors: ValidationError[]` | CSV validation |
| `MasterData` | `programs: string[]`; `departments: string[]`; `specializations: string[]`; `academicYears: string[]`; `regulations: string[]`; `programOfferings: string[]`; `platforms: string[]` | `RepositoryTabContent` field options |
| `ColumnMapping` | `csvColumn`; `mappedField`; `confidence: number`; `status: 'auto' \| 'manual' \| 'unmapped'` | `CSVUploadDialog` mapping step |
| `WorkflowStatus` | `'draft' \| 'submitted' \| 'validated' \| 'evidence_pending' \| 'hod_review' \| 'iqac_verification' \| 'approved' \| 'rejected'` | upload history, workflow stepper |

### 4.2 Infrastructure Coordinator config data (`infrastructure-configs.ts`)

| Export | Type | Notes |
|--------|------|-------|
| `infrastructureCoordinatorContext` | object | `{ name: 'Mr. Rajesh Kumar', role: 'Infrastructure Coordinator', institution: 'Malla Reddy College of Engineering & Technology', department: 'Infrastructure & Facilities' }` — sidebar "Coordinator" card |
| `infrastructureRepositoryConfig` | `RepositoryModuleConfig` | `id: 'infrastructure'`, 10 tabs (buildings → transport) |
| `greenCampusRepositoryConfig` | `RepositoryModuleConfig` | `id: 'green-campus'`, 5 tabs |
| `safetySecurityRepositoryConfig` | `RepositoryModuleConfig` | `id: 'safety-security'`, 4 tabs |
| `utilitiesRepositoryConfig` | `RepositoryModuleConfig` | `id: 'utilities'`, 4 tabs |
| `infrastructureDocumentCategories` | `{ id, label, icon, count }[]` | 7 categories (infra supporting docs) |
| `greenCampusDocumentCategories` | same | 9 categories |
| `safetySecurityDocumentCategories` | same | 9 categories |
| `utilitiesDocumentCategories` | same | 8 categories |
| `infrastructureSummaryData` | `Record<string, RepositorySummary>` | per-tab summaries for all 23 tabs |
| `infrastructureUploadHistory` | `UploadHistoryRecord[]` | 11 records (repos: infrastructure / green-campus / safety-security / utilities) |
| `infrastructureRecentActivities` | `{ id, action, detail, timestamp, type: 'upload' \| 'update' }[]` | 12 records |
| `greenCampusAnalytics` | object | `{ greenInitiativesCount, renewableEnergyPercent, waterConservationTrend[], wasteRecyclingTrend[], carbonReductionInitiatives, greenAuditStatus }` |
| `safetySecurityAnalytics` | object | `{ fireSafetyCompliance, cctvCoverage, emergencyReadiness, safetyInspectionStatus, insuranceExpiryAlerts, mockDrillFrequency }` |
| `utilitiesAnalytics` | object | `{ electricityConsumptionTrend[], internetBandwidthUtilization, waterConsumptionTrend[], utilityAssetHealth, powerBackupReadiness, amcExpiryAlerts }` |

### 4.3 Field schemas per tab (all 23 tabs — exact `csvColumn` / `key` values)

> **These field lists are the request/response DTO field names for each section.** All fields use `camelCase` `key` values; the table header labels are the `csvColumn` values.

**buildings** — `buildingName`, `buildingCode`, `buildingType`, `constructionYear`, `numberOfFloors`, `builtUpArea`, `usage`, `status`, `accessibilityAvailable`, `fireSafetyAvailable`
**classrooms** — `roomNumber`, `building`, `department`, `roomType`, `capacity`, `smartClassroom`, `projectorAvailable`, `internetAvailable`, `airConditioned`, `status`
**laboratories** — `laboratoryName`, `department`, `program`, `laboratoryType`, `area`, `capacity`, `numberOfWorkstations`, `softwareAvailable`, `internetAvailable`, `status`
**equipment** — `equipmentName`, `equipmentCode`, `laboratory`, `manufacturer`, `purchaseDate`, `cost`, `warrantyExpiry` (optional), `workingStatus`, `calibrationRequired`, `calibrationDate` (optional)
**library** — `academicYear`, `books`, `journals`, `eBooks`, `eJournals`, `digitalLibraryAvailable`, `readingCapacity`, `librarySoftware` (optional), `libraryAutomation`, `workingHours`
**ict-infrastructure** — `academicYear`, `desktopComputers`, `laptops`, `servers`, `networkSwitches`, `wifiAccessPoints`, `internetBandwidth`, `licensedSoftware`, `erpAvailable`, `cloudServices`, `backupFacility`
**hostels** — `hostelName`, `hostelType`, `capacity`, `occupied`, `rooms`, `wardens`, `diningFacility`, `wifiAvailable`, `medicalFacility`, `status`
**sports-facilities** — `facilityName`, `indoorOutdoor`, `area`, `capacity`, `equipmentAvailable`, `coachAvailable`, `usage`, `status`
**seminar-halls** — `hallName`, `capacity`, `airConditioned`, `audioSystem`, `projector`, `smartDisplay`, `internet`, `status`
**transport** — `vehicleNumber`, `vehicleType`, `capacity`, `yearOfPurchase`, `route`, `driverName`, `fitnessValidity`, `insuranceValidity`, `status`
**green-initiatives** — `academicYear`, `initiativeName`, `initiativeCategory`, `description` (optional), `startDate`, `status`, `responsibleDepartment`
**energy-management** — `academicYear`, `electricityConsumption`, `solarPowerCapacity` (optional), `renewableEnergyGenerated` (optional), `dgPowerConsumption` (optional)
**water-management** — `academicYear`, `waterSource`, `waterConsumption`, `rainWaterHarvesting`, `stpAvailable` (optional), `recycledWaterUsage` (optional)
**waste-management** — `academicYear`, `wasteType`, `disposalMethod`, `quantity` (optional)
**green-audit** — `academicYear`, `auditConducted`, `auditAgency` (optional), `score` (optional)
**fire-safety** — `building`, `fireExtinguishersCount`, `fireAlarmAvailable`, `fireHydrantAvailable` (optional), `lastInspectionDate`, `nextDueDate`
**security-infrastructure** — `academicYear`, `cctvCameras`, `securityPersonnel`, `entryControlSystem` (optional), `visitorManagementSystem` (optional)
**emergency-preparedness** — `academicYear`, `disasterManagementPlan`, `mockDrillsConducted` (optional), `firstAidKits`, `medicalRoomAvailable`
**insurance-compliance** — `policyName`, `coverage`, `startDate`, `expiryDate`, `status`
**power-infrastructure** — `academicYear`, `connectedLoad`, `transformerCapacity` (optional), `dgSets` (optional), `upsCapacity` (optional), `powerBackupAvailable`
**water-supply** — `academicYear`, `waterSources`, `dailyCapacity`, `storageCapacity` (optional)
**internet-network** — `academicYear`, `ispName`, `bandwidth`, `wifiAccessPoints` (optional), `networkUptime` (optional)
**utility-assets** — `assetName`, `category`, `installationDate` (optional), `amcAvailable` (optional), `operationalStatus`

### 4.4 Evidence upload types (`components/shared/EvidenceUploadDialog.tsx`)

| Type | Fields |
|------|--------|
| `UploadedFile` | `id: string`; `name: string`; `size: number`; `type: string`; `uploadedAt: string`; `dataUrl?: string`; `file?: File` |
| `EvidenceCategory` | `id: string`; `label: string`; `description?: string`; `icon?: ReactNode`; `acceptedTypes?: string[]` |
| `EvidenceUploadResult` | `files: Record<string, UploadedFile[]>` |

Constants: `DEFAULT_ACCEPTED_TYPES = ['.pdf', '.docx', '.zip', '.png', '.jpg', '.jpeg', '.xlsx', '.csv']`, `MAX_FILE_SIZE = 10 * 1024 * 1024` (10 MB).

---

## 5. Frontend Service Inventory

**Result: ZERO service/API files and ZERO existing API calls in the Infrastructure Coordinator module.**

Verified via full-text search of `infrastructure-repository/**` and `department-repository/**` for `api.`, `axios`, `fetch(`, `useQuery`, `useMutation`, and `from '@/services/` — **0 matches**. All data is local mock state or in-memory component state.

| Service | File | Function | HTTP Method | Existing Endpoint | Used By |
|---------|------|----------|-------------|-------------------|---------|
| — | `infrastructure-configs.ts` | static exports | — | — | all 28 views (mock) |
| — | `repository-configs.ts` | static exports | — | — | shared views (mock) |
| `apiService` | `src/services/api.service.ts` | app-wide client | — | used by **other** roles only | not used here |

**Existing backend reference (for alignment, not wired to this frontend):** the backend already ships an `InfrastructureRepositoryController` under `GET/POST/PUT/DELETE /api/v1/department-coordinator/infrastructure-repository/**` (classrooms, tutorial-rooms, laboratories, staff-rooms, faculty-cabins, hod-cabin, smart-classrooms, ict-enabled-classrooms, lab-equipment, software-licenses, department-assets; `.../template` downloads; `.../upload` per section; `/evidence`, `/evidence/{id}/download`, `/bulk-upload`, `/health`, `/dashboard`). That controller is **department-scoped** (`departmentId` + `academicYear` request params) and covers the department-level sections — it is **not** the institution-wide contract required by this frontend (see §22 gap #1).

---

## 6. Global API Specifications

| Item | Value |
|------|-------|
| **Base Endpoint Path** | `/api/v1/infrastructure-coordinator` (🔶 proposed — follows the role-based convention used by `/api/v1/head-of-department`, `/api/v1/principal`, `/api/v1/iqac`; note the existing department-scoped controller lives under `/api/v1/department-coordinator/infrastructure-repository`) |
| **Swagger Tag** | `Infrastructure Coordinator` |
| **Authentication** | Bearer JWT (`Authorization: Bearer <token>`) — same auth used by all AccreditPro modules |
| **Role Guard** | `INFRASTRUCTURE_COORDINATOR` (and `DEPARTMENT_COORDINATOR`, which shares this route today — ✅ confirmed in `App.tsx`). 🔶 Recommend keeping both roles mapped, or clarifying the intended ownership |
| **Content-Type** | `application/json`; `multipart/form-data` for CSV uploads and evidence uploads |
| **Date format** | `YYYY-MM-DD` (config `type: 'date'` fields, template `YYYY-MM-DD` sample) |
| **DateTime format** | `yyyy-MM-dd HH:mm` for `lastUpdated` / `uploadedAt` display strings (`'2025-01-12 16:45'`); ISO-8601 for API wire timestamps 🔶 |
| **Success response** | `ApiResponse<T>` envelope matching the rest of the app: `{ "success": true, "message": "...", "data": T }` |
| **Error response** | `ApiResponse<T>` with `success: false`, `message`, optional `data` (existing AccreditPro convention) |
| **Pagination** | Spring Page shape `{ content, page, size, totalElements, totalPages, number, ... }` — 🔶 recommended for section lists and upload history (frontend tables are small mock arrays today; backend pagination is the AccreditPro convention) |
| **Academic year** | The UI is anchored to a current year (default `'2025-26'`; configs also list `'2024-25' … '2020-21'`). Section list endpoints should accept `academicYear` where the tab schema contains it (see §14) |

### Standard Query Parameters for Section (List) Endpoints

| Param | Type | Notes |
|-------|------|-------|
| `academicYear` | string | `'2025-26'` etc. — tabs whose schema includes `academicYear` (library, ict-infrastructure, all green-campus/safety/utilities tabs) |
| `search` | string | free-text search across all row values (frontend searches `Object.values(row)`) |
| `page` | int | default `0` (Spring Page) 🔶 |
| `size` | int | default `10` 🔶 |
| `sortBy` | string | field `key` 🔶 |
| `sortDirection` | string | `ASC` \| `DESC` 🔶 |

---

## 7. Authentication & Authorization

| Concern | Rule |
|---------|------|
| **Authentication** | JWT Bearer token, required on all endpoints |
| **Authorization** | Infrastructure Coordinator role required. 🔶 INFERRED — the route is also shared with `DEPARTMENT_COORDINATOR` (✅ confirmed in `App.tsx`); confirm whether the department coordinator should see institution-wide infrastructure data or only a scoped view |
| **Institution scope** | This role manages **institution-wide** infrastructure data. `institutionId` must be **derived from the authenticated user context**, never trusted from request bodies. ⚠️ The existing backend controller is department-scoped; the new contract needs an institution-wide scope (no `departmentId` ownership check for most tabs — buildings, library, transport, green campus, safety, utilities are campus-level) |
| **Department scope** | 🔶 Most data tabs are institution-wide. However the shared `ProfileView`, `VerificationStatusView`, `UploadHistoryView` currently render **department-coordinator** data (see §22 gap #2/#3/#4), and the `DepartmentInfrastructureModule` is department-labeled. Backend should decide one scope; 🔶 recommend institution-wide for the 23 data tabs, with the three shared views replaced/scoped by the coordinator's own data |
| **Write boundaries** | The coordinator **uploads data records and evidence** (✅ confirmed: Upload CSV / Add Record / Upload Document buttons). The coordinator **cannot** verify or approve records (workflow statuses `hod_review` / `iqac_verification` are advanced by HOD/IQAC — ✅ confirmed by `workflowStatusLabels` and `WorkflowStatus`). Backend must not allow this role to mutate `workflowStatus` beyond `submitted`/`validated`/`evidence_pending` 🔶 |
| **Impersonation** | Frontend disables all write actions when `isImpersonating` (read-only preview, `useReadOnly()`). Backend re-validates role + institution server-side on each write API |

---

## 8. API Endpoint Summary

All paths under **`/api/v1/infrastructure-coordinator`**. `{tabId}` ∈ the 23 tab ids: `buildings, classrooms, laboratories, equipment, library, ict-infrastructure, hostels, sports-facilities, seminar-halls, transport, green-initiatives, energy-management, water-management, waste-management, green-audit, fire-safety, security-infrastructure, emergency-preparedness, insurance-compliance, power-infrastructure, water-supply, internet-network, utility-assets`.

| # | Method | Endpoint | Screen | Action | Auth | Notes |
|---|--------|----------|--------|--------|------|-------|
| 1 | GET | `/dashboard` | dashboard | Load score cards, module KPIs, analytics, pending counts, recent activities | IC | aggregation endpoint |
| 2 | GET | `/sections/{tabId}` | 23 data tabs | List records for a section | IC | `academicYear`, `search`, pagination; section field set from config |
| 3 | GET | `/sections/{tabId}/{id}` | data tabs | Single record detail | IC | |
| 4 | POST | `/sections/{tabId}` | data tabs | Create record (manual "Add Record") | IC | body per section schema |
| 5 | PUT | `/sections/{tabId}/{id}` | data tabs | Update record (edit dialog) | IC | full or partial update 🔶 |
| 6 | DELETE | `/sections/{tabId}/{id}` | data tabs | Delete record | IC | soft delete 🔶 |
| 7 | GET | `/sections/{tabId}/template` | data tabs | Download CSV template | IC | config references `/templates/...csv`; frontend currently generates CSV client-side (see §22 gap #6) |
| 8 | POST | `/sections/{tabId}/upload` | data tabs | CSV upload + validation preview + save valid rows | IC | multipart; returns validation result + preview rows |
| 9 | GET | `/documents` | supporting-documents | List supporting documents | IC | `category`, `search` |
| 10 | POST | `/documents` | supporting-documents | Upload evidence document | IC | multipart; 10 MB; accepted types |
| 11 | GET | `/documents/{id}/download` | supporting-documents | Download document | IC | binary |
| 12 | DELETE | `/documents/{id}` | supporting-documents | Delete document | IC | 🔶 (frontend shows a More menu; no confirm dialog today) |
| 13 | GET | `/upload-history` | upload-history | Upload history list + summary | IC | `repository`, `status`, `search` filters |
| 14 | GET | `/verification-status` | verification-status | Overall + per-repository verification progress | IC | aggregation |
| 15 | GET | `/profile` | profile | Coordinator profile, assignment scope, readiness | IC | |

**Endpoint count:** 15 endpoint templates — the 8 section endpoints apply per-tab (8 × 23 = 184 tab-specific routes) + 7 shared routes = **191 concrete routes**.

---

## 9. Detailed API Contracts

> Section record endpoints (`2–8`) share one generic contract; the per-section field schemas in §4.3 define the DTO. Detailed contracts are shown for the shared/aggregate endpoints and the generic section pattern.

### 9.1 GET /api/v1/infrastructure-coordinator/dashboard

- **Purpose:** Load the Infrastructure Dashboard (score cards, module KPI grids, analytics highlights, pending cards, recent activities).
- **Frontend Screen:** Dashboard (`InfrastructureDashboard.tsx`)
- **Frontend Data Sources:** `infrastructureSummaryData`, `infrastructureRecentActivities`, `greenCampusAnalytics`, `safetySecurityAnalytics`, `utilitiesAnalytics` (+ hardcoded score/KPI/pending values)
- **Authentication:** Bearer JWT · **Authorization:** Infrastructure Coordinator
- **Query Parameters:** `academicYear` (optional 🔶 — dashboard is currently not year-aware)
- **Response DTO (🔶 INFERRED):**

```json
{
  "success": true,
  "message": "Dashboard retrieved successfully",
  "data": {
    "coordinator": { "name": "Mr. Rajesh Kumar", "role": "Infrastructure Coordinator", "institution": "Malla Reddy College of Engineering & Technology", "department": "Infrastructure & Facilities" },
    "scoreCards": [
      { "label": "Repository Completion", "value": 82 },
      { "label": "Evidence Completion", "value": 68 },
      { "label": "Verification", "value": 75 },
      { "label": "Infrastructure Readiness", "value": 71 }
    ],
    "summary": {
      "totalRecords": 522,
      "totalApproved": 473,
      "dataTabs": 23,
      "evidenceDocuments": 78
    },
    "modules": [
      { "id": "infrastructure", "label": "Infrastructure", "tabs": [
        { "id": "buildings", "label": "Buildings", "value": 12 },
        { "id": "classrooms", "label": "Classrooms", "value": 85 }
      ]},
      { "id": "green-campus", "label": "Green Campus & Sustainability", "tabs": [
        { "id": "green-initiatives", "label": "Green Initiatives", "value": 12 }
      ]},
      { "id": "safety-security", "label": "Safety & Security", "tabs": [
        { "id": "fire-safety", "label": "Fire Safety", "value": 9 }
      ]},
      { "id": "utilities", "label": "Utilities", "tabs": [
        { "id": "power-infrastructure", "label": "Power Infrastructure", "value": 5 }
      ]}
    ],
    "analytics": {
      "greenCampus": { "renewableEnergyPercent": 35, "greenAuditStatus": "Completed", "carbonReductionInitiatives": 8 },
      "safetySecurity": { "fireSafetyCompliance": 92, "cctvCoverage": 156, "insuranceExpiryAlerts": 2 },
      "utilities": { "powerBackupReadiness": 95, "internetBandwidthUtilization": 78, "amcExpiryAlerts": 3 }
    },
    "pending": {
      "pendingReviews": 21,
      "pendingVerification": 50,
      "pendingDocuments": 18
    },
    "recentActivities": [
      { "id": "1", "action": "Building information updated", "detail": "Main Academic Block details updated with new floor plan", "timestamp": "2025-01-12 09:00", "type": "update" }
    ]
  }
}
```

- **Notes:** `totalRecords`/`totalApproved` are client-derived sums of `recordsUploaded`/`approved` across `infrastructureSummaryData`. Score cards, `dataTabs` (23), `evidenceDocuments` (78), and pending cards are **hardcoded** in the frontend today (see §22 gap #5). ✅ The `recentActivities` type is `'upload' | 'update'`.

### 9.2 GET /api/v1/infrastructure-coordinator/sections/{tabId}

- **Purpose:** List records for one data tab (e.g. all buildings, all transport vehicles).
- **Frontend Screen:** 23 data tabs
- **Frontend Component:** `RepositoryTabContent` (generic) or `DepartmentInfrastructureModule` `DataSection` (classrooms/laboratories)
- **Frontend Service:** none (mock `generateMockData` in `RepositoryTabContent`)
- **Authentication / Authorization:** Bearer JWT · Infrastructure Coordinator
- **Path Parameters:** `tabId` — one of the 23 tab ids
- **Query Parameters:** `academicYear` (only where the tab schema has it — see §14), `search`, `page` (default 0), `size` (default 10), `sortBy`, `sortDirection`
- **Response DTO (🔶 INFERRED):**

```json
{
  "success": true,
  "message": "Buildings retrieved successfully",
  "data": {
    "content": [
      { "id": 1, "buildingName": "Main Academic Block", "buildingCode": "BLK-A", "buildingType": "Academic", "constructionYear": 2005, "numberOfFloors": 4, "builtUpArea": 8500, "usage": "Classrooms & Labs", "status": "Active", "accessibilityAvailable": "Yes", "fireSafetyAvailable": "Yes", "academicYear": "2025-26" }
    ],
    "page": 0, "size": 10, "totalElements": 12, "totalPages": 2, "number": 0
  }
}
```

- **Field set:** use the section's `RepositoryFieldConfig[]` from §4.3. `type: 'select'` fields must return one of the section's `selectOptions` values (see §11). `type: 'number'` fields → number. `type: 'date'` → `YYYY-MM-DD`.
- **Pagination:** 🔶 Spring Page shape (see §12). **Search:** free-text across all values (✅ frontend `Object.values(row).some(...)`). **Sorting:** by any field `key`, `ASC`/`DESC` 🔶.
- **Security / Scope:** institution-wide — 🔶 no `departmentId` ownership filter for institution tabs.

### 9.3 GET /api/v1/infrastructure-coordinator/sections/{tabId}/{id}

- **Purpose:** Fetch a single record for the detail dialog.
- **Response:** `data` = single record object (same field set as list items).

### 9.4 POST /api/v1/infrastructure-coordinator/sections/{tabId}

- **Purpose:** Create a record via the "Add Record" manual form (`handleManualSave`) or the generic `RepositoryTabContent` add flow.
- **Request Body (🔶 INFERRED):** the section's field set, e.g.:

```json
{
  "buildingName": "Workshop Block",
  "buildingCode": "BLK-W",
  "buildingType": "Workshop",
  "constructionYear": 2010,
  "numberOfFloors": 1,
  "builtUpArea": 3200,
  "usage": "Mechanical workshop",
  "status": "Active",
  "accessibilityAvailable": "Yes",
  "fireSafetyAvailable": "Partial"
}
```

- **Response:** `201` → `ApiResponse<record>`.
- **Validation:** required fields (config `required: true`), numeric limits, date format, select-option membership; uniqueness rules from each tab's `validationRules` (e.g. `buildingCode`, `equipmentCode`, `vehicleNumber` must be unique). **BACKEND VALIDATION REQUIRED** where the frontend only shows static rule text.

### 9.5 PUT /api/v1/infrastructure-coordinator/sections/{tabId}/{id}

- **Purpose:** Update a record via the edit dialog (`handleSaveEdit`).
- **Request Body:** full record (all fields) 🔶 partial update also acceptable.
- **Response:** `ApiResponse<record>`.

### 9.6 DELETE /api/v1/infrastructure-coordinator/sections/{tabId}/{id}

- **Purpose:** Delete a record (`handleDeleteRow`). 🔶 Soft delete recommended (consistent with the existing department-coordinator controller which soft-deletes).
- **Response:** `ApiResponse<Void>` with success message.

### 9.7 GET /api/v1/infrastructure-coordinator/sections/{tabId}/template

- **Purpose:** Download the CSV import template for a tab.
- **Response:** `text/csv` binary with `Content-Disposition: attachment; filename={tabId}_template.csv`.
- **Header row:** the tab's `csvColumn` values (e.g. `Building Name,Building Code,Building Type,Construction Year,...`). Sample row: master-data first values (e.g. first academic year, first program offering).
- **Notes:** The frontend config references static template files (`/templates/infrastructure_buildings_template.csv`, `green_initiatives_template.csv`, `fire_safety_template.csv`, etc.) that **do not exist** in `public/templates/` (✅ verified — only 26 non-infrastructure templates exist). The frontend currently **generates the template CSV client-side** from the field config (see §22 gap #6), so this endpoint is 🔶 optional — or the backend can simply serve the same generated content.

### 9.8 POST /api/v1/infrastructure-coordinator/sections/{tabId}/upload

- **Purpose:** Upload a CSV for a section, run validation, return preview + per-row errors, then persist valid rows (frontend `CSVUploadDialog`: upload → mapping → validate → preview → evidence → submit; `DepartmentInfrastructureModule` does client-side parse + validate + preview + "Save N Valid Records").
- **Request:** `multipart/form-data` — `file: File` (`.csv`); optionally `academicYear`.
- **Response DTO (🔶 INFERRED):**

```json
{
  "success": true,
  "message": "CSV validated",
  "data": {
    "totalRows": 42,
    "validRows": 40,
    "invalidRows": 2,
    "warnings": 3,
    "errors": [
      { "row": 15, "column": "Credits", "value": "abc", "message": "Expected numeric value", "severity": "error" },
      { "row": 28, "column": "Course Code", "value": "", "message": "Required field is empty", "severity": "error" }
    ],
    "previewRows": [ { "row": 1, "data": { "buildingName": "Main Block", "..." : "..." }, "validationStatus": "valid", "errors": [] } ]
  }
}
```

- **Notes:** The frontend matches CSV headers to fields case-insensitively by `csvColumn`/label and validates required/number/date/select fields client-side before showing a preview dialog. The UI text states *"CSV uploads never save automatically. Review and confirm to save"* — so 🔶 the endpoint can either (a) validate and return preview only, with a follow-up confirm call, or (b) accept a `confirm=true` flag on the second submit. **Business rule requires confirmation** (see §23).

### 9.9 GET /api/v1/infrastructure-coordinator/documents

- **Purpose:** List supporting documents with category filter + search.
- **Frontend Screen:** Supporting Documents (`InfrastructureDocumentsView.tsx`)
- **Frontend Data:** `mockDocuments` (10 records: `id, name, category, uploadedBy, uploadedDate, size, status`), categories from `infrastructureDocumentCategories` (7)
- **Query Parameters:** `category` (category id, optional), `search` (by `name`, ✅ confirmed)
- **Response DTO (🔶 INFERRED):**

```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": {
    "content": [
      { "id": "1", "name": "Campus Master Plan 2024.pdf", "category": "campus-master-plan", "uploadedBy": "Mr. Rajesh Kumar", "uploadedDate": "2025-01-10", "size": "4.2 MB", "status": "verified" }
    ],
    "categories": [ { "id": "campus-master-plan", "label": "Campus Master Plan", "count": 3 } ],
    "page": 0, "size": 10, "totalElements": 10, "totalPages": 1, "number": 0
  }
}
```

- **Document status enum:** `'verified' | 'pending' | 'uploaded' | 'rejected'` (✅ `getStatusColor` in `InfrastructureDocumentsView`).
- **Notes:** Category `count` badges are hardcoded in config (3/8/4/3/12/6/8). The document status is 🔶 advanced by the verification workflow (HOD/IQAC) — the coordinator cannot set `verified`.

### 9.10 POST /api/v1/infrastructure-coordinator/documents

- **Purpose:** Upload evidence documents (via `EvidenceUploadDialog`).
- **Request:** `multipart/form-data` — `files: File[]`; `category: string` (category id); optional `title`.
- **Accepted types:** `.pdf, .docx, .zip, .png, .jpg, .jpeg, .xlsx, .csv` (✅ `DEFAULT_ACCEPTED_TYPES`); **max 10 MB per file** (✅ `MAX_FILE_SIZE = 10MB`).
- **Response:** `201` → `ApiResponse<{ files: Record<string, UploadedFile[]> }>`.
- **Notes:** `EvidenceCategory` accepts `acceptedTypes` per category. The `DepartmentInfrastructureModule` variant allows up to 25 MB and PNG/JPG/DOCX/PDF/XLSX/ZIP (✅ "Supported files up to 25MB each"). 🔶 Backend should support both limits or standardize.

### 9.11 GET /api/v1/infrastructure-coordinator/documents/{id}/download

- **Purpose:** Download a supporting document (✅ eye/download/more icon buttons in document list).
- **Response:** binary stream with correct `Content-Type` + `Content-Disposition: attachment`.

### 9.12 DELETE /api/v1/infrastructure-coordinator/documents/{id}

- **Purpose:** Delete a document. 🔶 INFERRED — the frontend shows a `MoreHorizontal` menu with no wired delete handler today; include only if the menu is meant to delete.

### 9.13 GET /api/v1/infrastructure-coordinator/upload-history

- **Purpose:** Upload history summary + table.
- **Frontend Screen:** Upload History (`UploadHistoryView.tsx` — shared)
- **Frontend Data:** `uploadHistory` from `repository-configs.ts` (⚠️ **department-coordinator** records — see §22 gap #3) and `infrastructureUploadHistory` (11 infrastructure records — defined but unused)
- **Query Parameters:** `repository` (`all` | `academic` | `faculty` | `student` | `research` — ⚠️ filter options are department-repo names; should be extended to `infrastructure` | `green-campus` | `safety-security` | `utilities` 🔶), `status` (`all` | `approved` | `pending` | `rejected`), `search` (by `fileName` or `tab`, ✅ confirmed)
- **Response DTO (🔶 INFERRED):**

```json
{
  "success": true, "message": "Upload history retrieved successfully",
  "data": {
    "summary": { "totalUploads": 11, "approved": 7, "pending": 4, "rejected": 0 },
    "content": [
      { "id": "inf-1", "fileName": "buildings_2024_25.csv", "tab": "Buildings", "repository": "infrastructure", "uploadedAt": "2025-01-12 09:00", "recordsCount": 12, "validRecords": 12, "invalidRecords": 0, "status": "approved", "uploadedBy": "Mr. Rajesh Kumar", "workflowStatus": "approved" }
    ],
    "page": 0, "size": 10, "totalElements": 11, "totalPages": 2, "number": 0
  }
}
```

- **Workflow status labels** (✅ `workflowStatusLabels`): `draft` → Draft, `submitted` → Submitted, `validated` → Validated, `evidence_pending` → Evidence Pending, `hod_review` → Under HOD Review, `iqac_verification` → Under IQAC Verification, `approved` → Approved, `rejected` → Rejected.

### 9.14 GET /api/v1/infrastructure-coordinator/verification-status

- **Purpose:** Overall verification stats + per-repository progress + items requiring attention.
- **Frontend Screen:** Verification Status (`VerificationStatusView.tsx` — shared)
- **Frontend Data:** `allRepositoryConfigs`, `repositoryHealth`, `repositorySummaries` from `repository-configs.ts` (⚠️ department repos — see §22 gap #4)
- **Response DTO (🔶 INFERRED):**

```json
{
  "success": true, "message": "Verification status retrieved successfully",
  "data": {
    "overall": { "totalRecords": 1000, "verified": 850, "approved": 820, "pendingVerification": 120, "rejected": 8 },
    "repositories": [
      { "id": "infrastructure", "label": "Infrastructure Repository", "dataCompleteness": 82, "evidenceCompleteness": 68, "verificationPercent": 75, "readinessScore": 71 },
      { "id": "green-campus", "label": "Green Campus & Sustainability", "dataCompleteness": 76, "evidenceCompleteness": 65, "verificationPercent": 72, "readinessScore": 68 },
      { "id": "safety-security", "label": "Safety & Security", "dataCompleteness": 88, "evidenceCompleteness": 78, "verificationPercent": 82, "readinessScore": 80 },
      { "id": "utilities", "label": "Utilities", "dataCompleteness": 80, "evidenceCompleteness": 70, "verificationPercent": 74, "readinessScore": 72 }
    ],
    "attentionItems": [ { "tabId": "classrooms", "pendingVerification": 8, "rejected": 2 } ]
  }
}
```

- **Notes:** The 4 infrastructure modules already have `repositoryHealth` entries (✅ confirmed: `infrastructure`, `green-campus`, `safety-security`, `utilities`). Overall numbers are sums over per-tab `RepositorySummary` values.

### 9.15 GET /api/v1/infrastructure-coordinator/profile

- **Purpose:** Coordinator profile, assignment scope, repository readiness, permissions.
- **Frontend Screen:** Profile (`ProfileView.tsx` — shared)
- **Frontend Data:** `coordinatorContext`, `departmentInfo`, `repositoryHealth` (⚠️ currently renders **Department Coordinator** "Dr. Anita Sharma / CSE" — see §22 gap #2)
- **Response DTO (🔶 INFERRED):**

```json
{
  "success": true, "message": "Profile retrieved successfully",
  "data": {
    "coordinator": { "name": "Mr. Rajesh Kumar", "role": "Infrastructure Coordinator", "email": "rajesh.kumar@institution.edu", "phone": "+91 98765 43210" },
    "assignment": { "department": "Infrastructure & Facilities", "institution": "Malla Reddy College of Engineering & Technology", "academicYear": "2025-26" },
    "readiness": [
      { "id": "infrastructure", "label": "Infrastructure Repository", "dataCompleteness": 82, "evidenceCompleteness": 68, "verificationPercent": 75, "readinessScore": 71 }
    ],
    "permissions": {
      "allowed": ["Upload Data", "Update Data", "Re-submit Data", "Upload Evidence", "Download Templates", "View Reports"],
      "restricted": ["Verify Records", "Approve Records", "Reject Records", "Modify Master Data", "Create Programs/Departments", "Manage Users"]
    }
  }
}
```

- **Notes:** `overallReadiness` is client-derived (average of `readinessScore` across repos, ✅ `ProfileView`).

---

## 10. DTO Definitions

> The per-section field sets (§4.3) ARE the request/response DTOs for endpoints 2–8. Backend should generate one DTO per section (e.g. `BuildingRequest`/`BuildingResponse`, `ClassroomRequest`/`ClassroomResponse`, … `UtilityAssetRequest`/`UtilityAssetResponse`) following the existing `{Section}Request`/`{Section}Response` naming in the department-coordinator module (e.g. `ClassroomRequest`, `ClassroomResponse`).

### Generic section record envelope (all 23 tabs)

```json
{
  "id": "long (🔶; frontend uses string ids in mock: 'buildings-1', 'csv-inf-...')",
  "<fieldKey>": "per §4.3",
  "academicYear": "2025-26 (only tabs whose schema includes it)",
  "status": "section status enum (§11)"
}
```

### Upload history record (`UploadHistoryRecord`)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | ✅ | |
| `fileName` | string | ✅ | |
| `tab` | string | ✅ | tab label, e.g. `Buildings` |
| `repository` | string | ✅ | `infrastructure` \| `green-campus` \| `safety-security` \| `utilities` |
| `uploadedAt` | string | ✅ | `yyyy-MM-dd HH:mm` display format |
| `recordsCount` | number | ✅ | |
| `validRecords` | number | ✅ | |
| `invalidRecords` | number | ✅ | |
| `status` | enum | ✅ | `approved` \| `rejected` \| `pending` \| `processing` |
| `uploadedBy` | string | ✅ | |
| `workflowStatus` | enum | ✅ | `WorkflowStatus` (§11) |

### Evidence document (`EvidenceDocument` / supporting-document row)

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | |
| `name` | string | file name |
| `category` | string | category id/label |
| `version` | string | e.g. `v1.0` (🔶 versioning for supporting docs is not yet in the coordinator UI) |
| `uploadedBy` | string | |
| `uploadedDate` | string | `YYYY-MM-DD` |
| `status` | enum | `uploaded` \| `pending` \| `verified` \| `rejected` |
| `fileType` | enum | `pdf` \| `docx` \| `xlsx` \| `zip` \| `png` \| `jpg` |
| `size` | string | human-readable, e.g. `4.2 MB` (🔶 backend may also return raw bytes) |

---

## 11. Enum Definitions

### 11.1 Field input type (`RepositoryFieldConfig.type`)
`text` · `number` · `date` · `select` · `boolean` — drives form controls and CSV validation.

### 11.2 Workflow status (`WorkflowStatus`, `department-repository/types.ts`)
`draft` · `submitted` · `validated` · `evidence_pending` · `hod_review` · `iqac_verification` · `approved` · `rejected`
Display labels (✅ `workflowStatusLabels` in `UploadHistoryView`): Draft / Submitted / Validated / Evidence Pending / Under HOD Review / Under IQAC Verification / Approved / Rejected.

### 11.3 Upload record status (`UploadHistoryRecord.status`)
`approved` · `rejected` · `pending` · `processing`

### 11.4 Evidence document status (`EvidenceDocument.status` / supporting docs)
`uploaded` · `pending` · `verified` · `rejected` (✅ colors in `InfrastructureDocumentsView` + `RepositoryTabContent`)

### 11.5 Section-specific `status` enums (✅ exact `selectOptions` from config)

| Tab | Values |
|-----|--------|
| buildings | `Active` · `Under Maintenance` · `Under Construction` · `Decommissioned` |
| classrooms / laboratories / hostels / sports-facilities / seminar-halls | `Active` · `Under Maintenance` · `Inactive` |
| equipment (`workingStatus`) | `Working` · `Not Working` · `Under Repair` · `Condemned` |
| transport | `Active` · `Under Maintenance` · `Inactive` · `Condemned` |
| green-initiatives | `Planned` · `In Progress` · `Completed` |
| insurance-compliance | `Active` · `Expired` |
| utility-assets (`operationalStatus`) | `Active` · `Inactive` |

### 11.6 Yes/No/Partial booleans (config `selectOptions: ['Yes','No']` or `['Yes','No','Partial']`)
Applied to `accessibilityAvailable`, `fireSafetyAvailable`, `smartClassroom`, `projectorAvailable`, `internetAvailable`, `airConditioned`, `softwareAvailable`, `calibrationRequired`, `digitalLibraryAvailable`, `erpAvailable`, `cloudServices`, `backupFacility`, `diningFacility`, `wifiAvailable`, `medicalFacility`, `equipmentAvailable` (Yes/No/Partial), `coachAvailable`, `rainWaterHarvesting`, `stpAvailable`, `fireAlarmAvailable`, `fireHydrantAvailable`, `entryControlSystem`, `visitorManagementSystem`, `disasterManagementPlan`, `medicalRoomAvailable`, `powerBackupAvailable`, `amcAvailable`, `auditConducted`. **Frontend renders these as Yes/No strings, not JSON booleans** — backend 🔶 should accept/store `Yes`/`No`/`Partial` strings to match the frontend.

### 11.7 Other select enums (✅ exact values from config)

| Tab field | Values |
|-----------|--------|
| buildings `buildingType` | `Academic` · `Administrative` · `Hostel` · `Library` · `Workshop` · `Auditorium` · `Sports` · `Other` |
| classrooms `roomType` | `Regular` · `Smart Classroom` · `Tutorial Room` · `Drawing Hall` · `Seminar Room` |
| laboratories `laboratoryType` | `Hardware` · `Software` · `Research` · `Workshop` · `Language` · `Science` |
| hostels `hostelType` | `Boys` · `Girls` · `Staff` |
| sports-facilities `indoorOutdoor` | `Indoor` · `Outdoor` |
| transport `vehicleType` | `Bus` · `Mini Bus` · `Van` · `Car` · `Ambulance` · `Other` |
| library `libraryAutomation` | `Fully Automated` · `Partially Automated` · `Manual` |
| green-initiatives `initiativeCategory` | `Solar` · `Rain Water Harvesting` · `Waste Management` · `Tree Plantation` · `Energy Conservation` · `Water Conservation` · `Plastic Free` · `Carbon Reduction` · `Other` |
| green-initiatives `responsibleDepartment` | `CSE` · `ECE` · `EEE` · `MECH` · `CIVIL` · `IT` · `Administration` · `Maintenance` |
| water-management `waterSource` | `Borewell` · `Municipal` · `Tanker` · `River` · `Rain Water` · `Mixed` |
| waste-management `wasteType` | `Solid` · `Liquid` · `E-Waste` · `Biomedical` · `Hazardous` · `Construction` |
| waste-management `disposalMethod` | `Recycle` · `Vendor` · `Compost` · `Incineration` · `Landfill` · `STP` |
| fire-safety `building` | `Main Block` · `Academic Block A` · `Academic Block B` · `Workshop Block` · `Library Block` · `Admin Block` · `Hostel Block A` · `Hostel Block B` · `Auditorium` |
| water-supply `waterSources` | `Borewell` · `Municipal` · `Tanker` · `Mixed` |
| utility-assets `category` | `Generator` · `UPS` · `Transformer` · `Solar Panel` · `Water Pump` · `STP` · `Other` |
| green-initiatives `academicYear` (and all AY selects) | `2024-25` · `2023-24` · `2022-23` · `2021-22` · `2020-21` (master data adds `2025-26`) |

### 11.8 Repository / tab ids (module + tab)
Modules: `infrastructure`, `green-campus`, `safety-security`, `utilities`. Tab ids: the 23 listed in §8.

### 11.9 Document category ids (supporting documents)
`campus-master-plan`, `building-approval`, `library-reports`, `ict-reports`, `calibration-certificates`, `laboratory-safety`, `amc-documents` (infra, ✅ used in UI). Also defined (⚠️ unused by the documents view — see §22 gap #7): green-campus (9), safety-security (9), utilities (8).

### 11.10 Activity type (`infrastructureRecentActivities`)
`upload` · `update`

---

## 12. Pagination

| Table | Frontend behavior today | Backend requirement |
|-------|-------------------------|---------------------|
| Section record tables (`RepositoryTabContent`) | Client-side render of full mock array (`tableData`), "Showing X of Y records" | 🔶 Backend pagination recommended (Spring Page `{ content, page, size, totalElements, totalPages, number }`) |
| Section tables (`DepartmentInfrastructureModule`) | Client-side array | 🔶 same |
| Upload history | Client-side filter of full array | 🔶 backend pagination with filters |
| Verification status | Derived aggregates | aggregation endpoint, no pagination |
| Supporting documents | Client-side filter of 10 mock docs | 🔶 pagination (small volume) |
| Dashboard | Aggregates | aggregation endpoint |

Use the existing AccreditPro Spring Page shape: `{ content, page, size, totalElements, totalPages, number, ... }`.

---

## 13. Search

| Screen | Search field(s) | Query param | Behavior |
|--------|-----------------|-------------|----------|
| Data tab tables | Free-text across **all row values** (✅ `Object.values(row).some(val => val.toLowerCase().includes(...))`) | `search` | 🔶 backend: substring/contains across text fields, case-insensitive |
| Upload history | `fileName` or `tab` (✅) | `search` | contains, case-insensitive |
| Supporting documents | `name` (✅ `doc.name.toLowerCase().includes(...)`) | `search` | contains, case-insensitive |

---

## 14. Filters

| Screen | Filter | Param | Allowed values | Optional |
|--------|--------|-------|----------------|----------|
| Section lists | Academic Year | `academicYear` | `2025-26`, `2024-25`, … (only tabs whose schema includes `academicYear`) | ✅ |
| Upload history | Repository | `repository` | `all` \| `academic` \| `faculty` \| `student` \| `research` (✅ UI) — 🔶 extend with infrastructure repos | ✅ |
| Upload history | Status | `status` | `all` \| `approved` \| `pending` \| `rejected` (✅ UI) | ✅ |
| Documents | Category | `category` | 7 infra category ids (§11.9) | ✅ |

No other frontend filters exist (no program/department/semester filters in this module).

---

## 15. Sorting

No explicit sort UI exists in the Infrastructure Coordinator frontend. 🔶 Backend default sort per section (e.g. by primary key / name field, `ASC`), with `sortBy`/`sortDirection` query params supported for consistency with the department-coordinator controller convention (which uses `sortBy`/`sortDirection`, default `sortBy=roomNumber`, `ASC`).

---

## 16. Entity & Relationship Requirements

```
Institution
   └── InfrastructureCoordinator (User, role INFRASTRUCTURE_COORDINATOR)
         ├── Infrastructure Repository (institution-wide)     → 10 section entities
         ├── Green Campus & Sustainability Repository          → 5 section entities
         ├── Safety & Security Repository                      → 4 section entities
         ├── Utilities Repository                              → 4 section entities
         ├── InfrastructureDocument (supporting evidence)      → category
         ├── InfrastructureUpload (CSV import log)             → repository + tab + workflowStatus
         └── InfrastructureRecordStatus (workflow)             → draft→…→approved
```

| Resource | Owner | Institution rel. | Department rel. | Parent | Child / referenced entities |
|----------|-------|------------------|-----------------|--------|-----------------------------|
| Buildings / Classrooms / Laboratories / Equipment / Library / ICT / Hostels / Sports / Seminar halls / Transport | Infrastructure Coordinator (creates/edits) | ✅ `institutionId` (derived from auth) | 🔶 **none** — institution-wide | Institution | `Building` referenced by `classrooms.building`, `fire-safety.building` (✅ config: "Building must exist in Buildings repository"); `Laboratory` referenced by `equipment.laboratory` (✅ config) |
| Green Campus sections | IC | ✅ | 🔶 `responsibleDepartment` is a free-form select on initiatives | Institution | Academic year |
| Safety & Security sections | IC | ✅ | 🔶 `building` select on fire-safety references Buildings | Institution | — |
| Utilities sections | IC | ✅ | none | Institution | — |
| InfrastructureDocument | IC (upload) | ✅ | none | Institution / section tab | category id, upload history |
| InfrastructureUpload | IC | ✅ | none | Institution | references repository/tab |

**Cross-references confirmed by config `validationRules`:**
- `classrooms.validationRules`: *"Building must exist in Buildings repository"*, *"Department must exist in master data"* — backend must validate these references.
- `equipment.validationRules`: *"Laboratory must exist in Laboratories repository"* — backend must validate.
- Uniqueness: `buildingCode`, `equipmentCode`, `vehicleNumber` — backend unique constraints.
- Range/bounds rules from config (✅ text, see §23 for backend enforcement decisions): `hostels` occupied ≤ capacity; `water-management` recycled 0–100; `internet-network` uptime 0–100; `fire-safety` next due > last inspection; `insurance-compliance` expiry > start.

---

## 17. Institution / Department Data Isolation

| Concern | Rule |
|---------|------|
| **Institution isolation** | All endpoints must scope queries by `institutionId` **derived from the authenticated user** — never from request body/params. The coordinator must never see another institution's infrastructure data. |
| **Department isolation** | 🔶 This role is institution-wide; most tabs have no department dimension. ⚠️ However, the frontend reuses department-scoped shared views (`UploadHistoryView`, `VerificationStatusView`, `ProfileView`) and the `DepartmentInfrastructureModule` header shows a department label — resolve the scope question before implementation (see §22 gaps #2–#4, §23). |
| **Cross-role access** | `DEPARTMENT_COORDINATOR` is currently allowed on the same route (`App.tsx` ✅). 🔶 If both roles share the module, the department coordinator's view may need department-scoping of sections that carry a department field (`classrooms.department`, `laboratories.department`). **Business rule requires confirmation.** |

---

## 18. File Upload / Download APIs

| Concern | Value |
|---------|-------|
| **CSV template download** | `GET /sections/{tabId}/template` → `text/csv` attachment. Frontend currently generates CSV client-side from field config (template files referenced in config do not exist in `public/templates/` ✅ verified) |
| **CSV data upload** | `POST /sections/{tabId}/upload` — `multipart/form-data`, `.csv`; returns validation preview (`ValidationResult` + per-row status). Frontend: "Upload CSV" button in `RepositoryTabContent` and per-section `CSV` button in `DepartmentInfrastructureModule` |
| **Evidence upload (documents)** | `POST /documents` — `multipart/form-data`; accepted `.pdf .docx .zip .png .jpg .jpeg .xlsx .csv`; **10 MB max** (✅ `EvidenceUploadDialog`); module variant: PNG/JPG/DOCX/PDF/XLSX/ZIP up to **25 MB** |
| **Evidence download** | `GET /documents/{id}/download` — binary |
| **Evidence preview** | Frontend previews images via `dataUrl` (client-side FileReader) — backend should return a URL or the file stream for the preview/eye buttons |
| **File metadata** | `fileName`, `category`, `size` (human-readable string), `uploadedBy`, `uploadedDate`, `status` |
| **Authorization** | All upload/download require IC role + institution scope; `verified` status only set by HOD/IQAC workflow (never by coordinator) |

---

## 19. Dashboard APIs

| Displayed value | Frontend source today | Backend source (🔶) |
|-----------------|------------------------|---------------------|
| Score cards (Repository Completion 82%, Evidence 68%, Verification 75%, Readiness 71%) | hardcoded array | aggregation over `RepositoryMetrics` for the 4 infrastructure modules (✅ `repositoryHealth` has `infrastructure`, `green-campus`, `safety-security`, `utilities`) |
| Total Records / Approved | client sum of `infrastructureSummaryData.recordsUploaded` / `approved` | sum over per-section summaries |
| Data Tabs (23) / Evidence Documents (78) | hardcoded | count of sections / documents |
| Module KPI grids (Infrastructure 9, Green 5, Safety 4, Utilities 4 cards) | hardcoded card arrays | per-tab record counts |
| Analytics highlights (green/safety/utilities) | `greenCampusAnalytics`, `safetySecurityAnalytics`, `utilitiesAnalytics` mock objects | aggregation endpoint per module |
| Pending cards (21 / 50 / 18) | hardcoded | pending counts from summaries (pendingReviews ≈ `pendingValidation`, pendingVerification, pendingDocuments) |
| Recent Activities (top 8) | `infrastructureRecentActivities` (12 mock) | 🔶 audit log / recent upload + update events, type `upload` \| `update` |

A single `GET /dashboard` aggregation endpoint is recommended (endpoint #1) — consistent with the other role contracts.

---

## 20. Reports / Export APIs

- The Infrastructure Coordinator frontend has **no report/export functionality** (no PDF/Excel/CSV export buttons; `report-export.ts` exists only in the Principal and IQAC modules).
- The only "export-like" actions are CSV **template download** (§9.7) — client-generated today — and document **download** (§9.11).
- **No backend report/export endpoint is required** by this frontend.

---

## 21. Mock Data Replacement Map

| # | Mock source | File | Used by | Fields | Intended backend source | Proposed API |
|---|-------------|------|---------|--------|-------------------------|--------------|
| 1 | `infrastructureCoordinatorContext` | `infrastructure-configs.ts` | Sidebar, dashboard | name, role, institution, department | `/profile` (auth context) | GET `/profile` |
| 2 | 23 tab `RepositoryTabConfig`s (fields, requiredEvidence, validationRules, templateFile) | `infrastructure-configs.ts` | All data tabs | see §4.3 | section metadata — 🔶 serve via config or hardcode server-side | — (static config) |
| 3 | `infrastructureSummaryData` (23 `RepositorySummary`) | `infrastructure-configs.ts` | Dashboard, Verification Status | §4.1 | per-section aggregates | GET `/dashboard`, GET `/verification-status` |
| 4 | `infrastructureUploadHistory` (11 records) | `infrastructure-configs.ts` | Upload History (⚠️ **currently unused** — shared view reads department `uploadHistory`) | §10 | upload log table | GET `/upload-history` |
| 5 | `infrastructureRecentActivities` (12) | `infrastructure-configs.ts` | Dashboard | id, action, detail, timestamp, type | activity/audit log | GET `/dashboard` |
| 6 | `greenCampusAnalytics` | `infrastructure-configs.ts` | Dashboard | §4.2 | computed aggregation | GET `/dashboard` |
| 7 | `safetySecurityAnalytics` | `infrastructure-configs.ts` | Dashboard | §4.2 | computed aggregation | GET `/dashboard` |
| 8 | `utilitiesAnalytics` | `infrastructure-configs.ts` | Dashboard | §4.2 | computed aggregation | GET `/dashboard` |
| 9 | `infrastructureDocumentCategories` (7) + `greenCampusDocumentCategories` (9) + `safetySecurityDocumentCategories` (9) + `utilitiesDocumentCategories` (8) | `infrastructure-configs.ts` | Supporting Documents (only infra 7 used) | id, label, icon, count | documents grouped by category | GET `/documents` |
| 10 | `mockDocuments` (10) | `InfrastructureDocumentsView.tsx` | Supporting Documents | id, name, category, uploadedBy, uploadedDate, size, status | document store | GET `/documents`, POST `/documents`, GET `/documents/{id}/download` |
| 11 | `generateMockData` rows | `RepositoryTabContent.tsx` | 13 generic tabs | per-tab fields | section DB tables | GET/POST/PUT/DELETE `/sections/{tabId}` |
| 12 | `sectionStats` + `sectionFields` (11 hardcoded department sections) | `DepartmentInfrastructureModule.tsx` | Infrastructure module (classrooms, laboratories) | §4.2/§11 | ⚠️ mismatched sections (see §22 gap #1) | — |
| 13 | `EvidenceFile` uploads (in-memory, Base64) | `DepartmentInfrastructureModule.tsx` | Infrastructure module | §4.4 + dataUrl | document/evidence store | POST `/documents`, GET `/documents/{id}/download` |
| 14 | `repositoryHealth` (4 infra modules + 6 department repos) | `repository-configs.ts` | Workspace headers, Verification Status, Profile | §4.1 `RepositoryMetrics` | computed readiness | GET `/verification-status`, GET `/dashboard`, GET `/profile` |
| 15 | `uploadHistory` (department, 6 records) | `repository-configs.ts` | Upload History (shared view) ⚠️ | §10 | ⚠️ department data leak — replace with infrastructure log | GET `/upload-history` |
| 16 | `evidenceDocuments` (10) | `repository-configs.ts` | `RepositoryTabContent` evidence repo | §10 `EvidenceDocument` | document store | GET `/documents` |
| 17 | `masterData` | `repository-configs.ts` | Field option dropdowns (`masterDataSource`) | programs, departments, specializations, academicYears, regulations, programOfferings, platforms | master-data tables | 🔶 existing master-data API or section template |
| 18 | `coordinatorContext` + `departmentInfo` | `repository-configs.ts` | Profile (shared view) ⚠️ | department, role, AY, programs, specializations | ⚠️ department coordinator context — should be IC context | GET `/profile` |
| 19 | `workflowSteps` / `mockValidationResult` | `repository-configs.ts` | workflow stepper / CSV validation (shared) | §4.1 | workflow engine + server-side validation | GET `/sections/{tabId}/{id}` (workflow), POST `/sections/{tabId}/upload` |

---

## 22. Frontend Contract Gaps

1. **⚠️ Module/section mismatch (most important).** The 10 "Infrastructure" tabs (buildings, classrooms, … transport) render through `RepositoryWorkspace` → `DepartmentInfrastructureModule`, which renders **hardcoded department-level sections** (`sectionStats`/`sectionFields` for classrooms, tutorial-rooms, laboratories, staff-rooms, faculty-cabins, hod-cabin, smart-classrooms, ict-classrooms, lab-equipment, software-licenses, dept-assets). Only `classrooms` and `laboratories` ids match the config tabs; the other 8 config tabs (`buildings`, `equipment`, `library`, `ict-infrastructure`, `hostels`, `sports-facilities`, `seminar-halls`, `transport`) have **no `sectionFields` entry** and render empty `DataSection`s. The 13 green-campus/safety/utilities tabs render correctly via the generic `RepositoryTabContent`. Backend planning must decide: (a) implement the 23 config-driven sections (what the sidebar promises), or (b) implement the department-section set the module actually renders. 🔶 Recommend (a) + align the frontend later. ⚠️ Do not silently build only the department sections.
2. **⚠️ Profile shows the wrong coordinator.** `ProfileView` renders `departmentInfo.coordinatorName` ('Dr. Anita Sharma'), department `CSE`, and department program offerings — i.e. the **Department Coordinator's** profile, not the Infrastructure Coordinator's ('Mr. Rajesh Kumar', 'Infrastructure & Facilities'). The infrastructure context exists (`infrastructureCoordinatorContext`) but is unused by `ProfileView`.
3. **⚠️ Upload History shows department uploads.** `UploadHistoryView` reads `uploadHistory` from `repository-configs.ts` (department records: faculty/academic/student/research), and its repository filter lists only department repos. `infrastructureUploadHistory` (11 records) is defined but unused. Backend `GET /upload-history` must return infrastructure-scoped records; the UI copy will need a filter update to match.
4. **⚠️ Verification Status shows department repositories.** `VerificationStatusView` iterates `allRepositoryConfigs` (6 department modules) — the 4 infrastructure modules are not shown, though `repositoryHealth` already contains them.
5. **Hardcoded dashboard values.** Score cards (82/68/75/71), `dataTabs: 23`, `evidenceDocuments: 78`, and pending cards (21/50/18) are hardcoded literals in `InfrastructureDashboard.tsx` — no mock object backs them. Backend should derive these; frontend must be updated to consume them.
6. **Template files missing.** Config `templateFile` paths (`/templates/infrastructure_buildings_template.csv`, `green_initiatives_template.csv`, `fire_safety_template.csv`, etc.) do not exist in `public/templates/` (only 26 non-infrastructure templates exist). The frontend works around this by generating the CSV client-side.
7. **Unused document category lists.** `greenCampusDocumentCategories`, `safetySecurityDocumentCategories`, `utilitiesDocumentCategories` are exported but the Supporting Documents view only uses `infrastructureDocumentCategories`.
8. **Inert buttons.** The generic "Add Record" button in `RepositoryTabContent` has no `onClick`; document row "eye/download/more" buttons and `DepartmentInfrastructureModule` row edit/delete buttons are not wired (no handler or placeholder). Upload History `workflowStatus` may show values the coordinator cannot influence.
9. **CSV upload confirmation flow is ambiguous.** `CSVUploadDialog` has a multi-step wizard (upload → mapping → validate → preview → evidence → submit), while `DepartmentInfrastructureModule` shows a preview dialog with "CSV uploads never save automatically. Review and confirm to save." No contract exists for the "submit/confirm" step (validate-only vs validate+save, or two-call flow).
10. **Date/datetime formats mixed.** `lastUpdated`/`uploadedAt` use `'2025-01-12 16:45'`; `uploadedDate` uses `'2025-01-10'`; `fitnessValidity`/`insuranceValidity` are `type: 'date'`. API should standardize (wire ISO, display as-is) without breaking frontend display.
11. **IDs are string in mock, number in backend.** Mock record ids like `'buildings-1'`/`'csv-inf-...'` are strings; the existing backend uses `Long` ids. Contract uses `Long`; frontend must adapt when wired.
12. **Yes/No strings vs booleans.** Select `type: 'select'` with `['Yes','No']` are stored as display strings; `type: 'boolean'` in the shared engine also renders `Yes`/`No` (`RepositoryTabContent`). Backend DTOs should mirror strings (or convert on wire) — do not silently switch to JSON booleans.
13. **`masterDataSource` auto-fill.** `RepositoryTabContent` auto-populates fields like program/department/AY from master data and marks them `autoPopulate` (disabled in edit). Backend must either return resolved master values or accept ids — decision required.
14. **No academic-year selector.** Unlike HOD/Principal, this page has no global AY selector — AY is implied per-record (`'2025-26'` hardcoded in record factories and module headers). The `academicYear` query param is 🔶 optional and only meaningful for AY-scoped tabs.

---

## 23. Business Rules Requiring Confirmation

1. **Scope of the Infrastructure Coordinator** — institution-wide vs department-scoped for the 23 data tabs. The sidebar/config implies institution-wide; the rendered module and shared views imply department scope. ⚠️ Must be resolved before backend design.
2. **Role sharing** — should `DEPARTMENT_COORDINATOR` retain access to `/app/infrastructure-repository` (currently allowed), and should their data be department-scoped?
3. **Record workflow** — the frontend shows workflow statuses (`hod_review`, `iqac_verification`), implying records pass HOD → IQAC review. Does an Infrastructure Coordinator submit records for HOD review, and can they edit/re-submit after submission? Which statuses may this role set?
4. **CSV upload persistence flow** — validate-only preview followed by explicit confirm (two calls), or single validate+save? What happens to invalid rows (rejected entirely vs partial save)?
5. **Delete semantics** — soft delete vs hard delete for section records and documents (existing department controller soft-deletes).
6. **Evidence status lifecycle** — who advances document `status` (`uploaded` → `pending` → `verified`)? The coordinator uploads; verification belongs to HOD/IQAC. Is `under-review` (module variant) a real state?
7. **Versioning** — `EvidenceDocument.version` (`v1.0`) exists in the shared type but no versioning UI in this module; is replacement/revision supported?
8. **Uniqueness enforcement** — `buildingCode`, `equipmentCode`, `vehicleNumber`, `roomNumber` uniqueness rules are config text only; confirm backend constraints.
9. **Cross-reference validation** — classroom→building, equipment→laboratory, fire-safety→building references; enforce as FK or soft reference?
10. **Bounds validation** — hostel `occupied ≤ capacity`; recycled water `0–100`; network uptime `0–100`; fire-safety `nextDueDate > lastInspectionDate`; insurance `expiryDate > startDate`; score positive.
11. **Academic-year semantics** — are AY-scoped tabs (library, ICT, green, safety, utilities) yearly snapshots (replace-on-upload) or cumulative append?
12. **Templates** — serve from backend (generate from field config) or create static files matching the config paths?

---

## 24. Backend Implementation Checklist

### Controllers
- [ ] `InfrastructureCoordinatorController` — `@RequestMapping("/api/v1/infrastructure-coordinator")`, `@Tag(name = "Infrastructure Coordinator")`
- [ ] `GET /dashboard`, `GET /verification-status`, `GET /profile`, `GET /upload-history`
- [ ] Generic section controller: `GET/POST /sections/{tabId}`, `GET/PUT/DELETE /sections/{tabId}/{id}`, `GET /sections/{tabId}/template`, `POST /sections/{tabId}/upload` (23 tab ids validated against an allowed set)
- [ ] Documents controller: `GET/POST /documents`, `GET /documents/{id}/download`, `DELETE /documents/{id}`
- [ ] Reuse existing department-coordinator `InfrastructureRepositoryController` where the department-scoped sections (classrooms, laboratories, etc.) genuinely overlap

### DTOs
- [ ] 23 section request/response DTOs (or one generic `Map`-based DTO validated against tab config — prefer explicit DTOs for integrity)
- [ ] `DashboardResponse`, `VerificationStatusResponse`, `ProfileResponse`, `UploadHistoryResponse`
- [ ] `DocumentResponse`, `DocumentUploadResponse`, `CsvValidationResponse` (+ `ValidationErrorDto`, `PreviewRowDto`)
- [ ] Field names exactly as §4.3 (camelCase), Yes/No strings preserved

### Services
- [ ] `InfrastructureCoordinatorService` — dashboard aggregation, section CRUD (institution-scoped), CSV validation, document management
- [ ] Section metadata registry (field configs, select options, required fields, validation rules) matching §4.3/§11
- [ ] CSV parser + validator mirroring frontend rules (required, numeric, date `YYYY-MM-DD`, select membership, header mapping by label)
- [ ] Readiness/completeness/verification aggregation (`RepositoryMetrics` for the 4 modules)

### Repositories
- [ ] Per-section repositories (or a single generic `InfrastructureRecord` table keyed by `sectionType` 🔶)
- [ ] `InfrastructureDocumentRepository` (category, status, uploader, institution)
- [ ] `InfrastructureUploadRepository` (fileName, tab, repository, counts, workflowStatus)
- [ ] Query scoping by `institutionId` on every repository

### Entities
- [ ] 23 section entities (or generic section entity + JSON/column fields 🔶)
- [ ] `InfrastructureDocument`, `InfrastructureUpload`, workflow status fields
- [ ] Institution + (optional) department relationship columns

### Enums
- [ ] `InfrastructureSectionType` (23 ids), `DocumentStatus` (`uploaded|pending|verified|rejected`), `UploadStatus` (`approved|rejected|pending|processing`)
- [ ] Workflow enum reusing existing `WorkflowStatus` vocabulary (`draft|submitted|validated|evidence_pending|hod_review|iqac_verification|approved|rejected`)
- [ ] Section status enums from §11.5 (Active/Under Maintenance/…)

### Database
- [ ] Schema for section records, documents, upload log
- [ ] Unique constraints (buildingCode, equipmentCode, vehicleNumber, roomNumber)
- [ ] Institution-scoped indexes; AY column where applicable

### Flyway Migrations
- [ ] `V__infrastructure_sections.sql` (or per-section tables)
- [ ] `V__infrastructure_documents.sql`, `V__infrastructure_uploads.sql`

### Security
- [ ] Role guard `INFRASTRUCTURE_COORDINATOR` (+ decide `DEPARTMENT_COORDINATOR`)
- [ ] Institution scope derived from JWT context — never from request params
- [ ] Write-boundary: coordinator cannot set `verified`/`approved`/`hod_review` workflow states

### Tests
- [ ] Controller tests per endpoint group (dashboard, section CRUD, upload, documents)
- [ ] Service tests: CSV validation, aggregation math, scope isolation
- [ ] Security integration tests: cross-institution access denied, role guard
- [ ] Migration tests

---

## 25. Quality Check

- [x] Every Infrastructure Coordinator screen identified (28 views)
- [x] Every route identified (`/app/infrastructure-repository`)
- [x] Every major component traced (page, dashboard, documents view, shared workspace engine)
- [x] Every relevant type/config file identified (`infrastructure-configs.ts`, `department-repository/types.ts`)
- [x] Every service file identified (none — verified 0 API calls)
- [x] Every mock data source identified (§21 — 19 entries)
- [x] Every user action mapped (load, search, filter, add, edit, delete, CSV upload, template download, document upload/download)
- [x] Every required endpoint documented (15 templates / 8×23 section routes + 7 shared)
- [x] Request DTOs documented (§4.3, §10)
- [x] Response DTOs documented (§9)
- [x] Every enum documented (§11)
- [x] Search documented (§13)
- [x] Filters documented (§14)
- [x] Sorting documented (§15)
- [x] Pagination documented (§12)
- [x] File operations documented (§18)
- [x] Dashboard documented (§19)
- [x] Reports/exports documented (§20 — none required)
- [x] Institution isolation documented (§17)
- [x] Department isolation documented (§17)
- [x] Entity relationships documented (§16)
- [x] Authentication documented (§7)
- [x] Authorization documented (§7)
- [x] Frontend/backend gaps documented (§22 — 14 gaps)
- [x] Business-rule uncertainties documented (§23 — 12 items)
- [x] No frontend files modified

---

## Summary

- **Infrastructure Coordinator screens found:** 28 (1 route `/app/infrastructure-repository`, internal view switching)
- **Frontend type/config files found:** 3 primary (`infrastructure-configs.ts`, `department-repository/types.ts`, `EvidenceUploadDialog.tsx` types) + shared `repository-configs.ts`
- **Service/API files found:** 0 dedicated to this role
- **Existing API calls found:** 0 (100% mock data)
- **Required endpoints:** 15 endpoint templates → **191 concrete routes** (8 section endpoints × 23 tabs + 7 shared routes)
- **Mock data sources:** 19 catalogued (§21)
- **Contract gaps:** 14 (§22)
- **Business rules requiring confirmation:** 12 (§23)

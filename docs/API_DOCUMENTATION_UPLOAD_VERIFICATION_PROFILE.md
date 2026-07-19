# AccreditPro - Department Coordinator API (Upload History, Verification & Profile)

> **Generated:** July 15, 2026  
> **Purpose:** Proposed API contracts for the three missing backend modules, reverse-engineered from the frontend UI mock data and type definitions.  
> **Base URL:** `http://localhost:8080`

---

## Table of Contents

1. [Global Wrapper & Pagination](#1-global-wrapper--pagination)
2. [Common Enums](#2-common-enums)
3. [Upload History Repository](#3-upload-history-repository)
4. [Verification Status Repository](#4-verification-status-repository)
5. [Profile & Auth Context](#5-profile--auth-context)
6. [Dashboard](#6-dashboard)

---

## 1. Global Wrapper & Pagination

### 1.1 Standard Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { },
  "timestamp": "2026-07-15T10:30:00"
}
```

### 1.2 Standard Error Response

```json
{
  "success": false,
  "message": "Descriptive error message",
  "data": null,
  "timestamp": "2026-07-15T10:30:00"
}
```

### 1.3 Paginated Data Shape

When `data` is a Spring Page, its structure is:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [ ],
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5,
    "last": false,
    "first": true,
    "empty": false,
    "numberOfElements": 20
  },
  "timestamp": "2026-07-15T10:30:00"
}
```

---

## 2. Common Enums

### 2.1 `WorkflowStatus`

| Value | Description |
|-------|-------------|
| `draft` | Initial draft |
| `submitted` | Submitted for review |
| `validated` | System validated |
| `evidence_pending` | Awaiting evidence |
| `hod_review` | Under HOD review |
| `iqac_verification` | Under IQAC verification |
| `approved` | Final approved |
| `rejected` | Rejected |

### 2.2 `UploadStatus`

| Value | Description |
|-------|-------------|
| `approved` | Upload fully processed and approved |
| `pending` | Awaiting review/processing |
| `rejected` | Upload rejected |
| `processing` | Upload currently being processed |

### 2.3 `RepositoryType`

| Value | Description |
|-------|-------------|
| `academic` | Academic repository |
| `faculty` | Faculty repository |
| `student` | Student repository |
| `research` | Research repository |
| `alumni` | Alumni repository |

### 2.4 `UserRole`

| Value | Description |
|-------|-------------|
| `SUPER_ADMIN` | Super administrator |
| `INSTITUTION_ADMIN` | Institution administrator |
| `IQAC_COORDINATOR` | IQAC coordinator |
| `PRINCIPAL` | Principal |
| `DEPARTMENT_COORDINATOR` | Department coordinator |
| `INFRASTRUCTURE_COORDINATOR` | Infrastructure coordinator |
| `FINANCE_COORDINATOR` | Finance coordinator |
| `TPO_COORDINATOR` | Training & Placement officer |
| `STUDENT_DEVELOPMENT_COORDINATOR` | Student development coordinator |

---

## 3. Upload History Repository

All endpoints are scoped under `/api/v1/departments/{departmentId}/upload-history`.

**Common Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | ID of the department |

---

### 3.1 LIST Upload History

```
GET /api/v1/departments/{departmentId}/upload-history
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | `0` | Zero-based page number |
| `size` | int | No | `20` | Page size |
| `search` | String | No | — | Search by file name or tab name |
| `repository` | String | No | — | Filter by RepositoryType enum value (`academic`, `faculty`, `student`, `research`, `alumni`) |
| `status` | String | No | — | Filter by UploadStatus enum value (`approved`, `pending`, `rejected`, `processing`) |

#### Response: `200 OK`

**Wrapper shape:** Paginated (see §1.3). Each content item is an `UploadHistoryResponse`:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 10,
        "fileName": "faculty_profiles_cse_2025.csv",
        "tab": "Faculty Profiles",
        "repository": "faculty",
        "uploadedAt": "2025-01-11 09:30",
        "recordsCount": 42,
        "validRecords": 42,
        "invalidRecords": 0,
        "status": "approved",
        "uploadedBy": "Dr. Anita Sharma",
        "workflowStatus": "approved",
        "createdAt": "2026-01-10T10:00:00",
        "updatedAt": "2026-01-10T10:00:00"
      },
      {
        "id": 2,
        "departmentId": 10,
        "fileName": "courses_sem1_2025.csv",
        "tab": "Courses",
        "repository": "academic",
        "uploadedAt": "2025-01-12 16:45",
        "recordsCount": 42,
        "validRecords": 40,
        "invalidRecords": 2,
        "status": "approved",
        "uploadedBy": "Dr. Anita Sharma",
        "workflowStatus": "approved",
        "createdAt": "2026-01-10T10:00:00",
        "updatedAt": "2026-01-10T10:00:00"
      },
      {
        "id": 3,
        "departmentId": 10,
        "fileName": "publications_2024_25.csv",
        "tab": "Publications",
        "repository": "research",
        "uploadedAt": "2025-01-12 15:30",
        "recordsCount": 28,
        "validRecords": 27,
        "invalidRecords": 1,
        "status": "pending",
        "uploadedBy": "Dr. Anita Sharma",
        "workflowStatus": "hod_review",
        "createdAt": "2026-01-10T10:00:00",
        "updatedAt": "2026-01-10T10:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 8,
    "totalPages": 1,
    "last": true,
    "first": true
  },
  "timestamp": "2026-07-15T10:30:00"
}
```

#### `UploadHistoryResponse` fields

| Field | Type | Always present | Description |
|-------|------|----------------|-------------|
| `id` | Long (number) | Yes | Primary key |
| `departmentId` | Long (number) | Yes | Owning department ID |
| `fileName` | String | Yes | Uploaded CSV file name |
| `tab` | String | Yes | Target tab / module name (e.g., "Faculty Profiles", "Courses", "Student Profile", "Publications", "Value Added Courses", "Academic Performance", "Curriculum", "MOOCs") |
| `repository` | String (enum) | Yes | RepositoryType: `academic`, `faculty`, `student`, `research`, `alumni` |
| `uploadedAt` | String (datetime) | Yes | ISO `YYYY-MM-DD HH:mm` |
| `recordsCount` | Integer | Yes | Total number of records in the upload |
| `validRecords` | Integer | Yes | Number of valid records after validation |
| `invalidRecords` | Integer | Yes | Number of invalid records after validation |
| `status` | String (enum) | Yes | UploadStatus: `approved`, `pending`, `rejected`, `processing` |
| `uploadedBy` | String | Yes | Display name of the user who uploaded |
| `workflowStatus` | String (enum) | Yes | WorkflowStatus: `draft`, `submitted`, `validated`, `evidence_pending`, `hod_review`, `iqac_verification`, `approved`, `rejected` |
| `createdAt` | String (datetime) | Yes | ISO `YYYY-MM-DDTHH:mm:ss` |
| `updatedAt` | String (datetime) | Yes | ISO `YYYY-MM-DDTHH:mm:ss` |

---

### 3.2 GET Upload Record by ID

```
GET /api/v1/departments/{departmentId}/upload-history/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `id` | Long | Yes | Upload history record ID |

#### Response: `200 OK`

Single `UploadHistoryResponse` object (as in §3.1 `data` field shape).

---

### 3.3 BULK Upload CSV Data

```
POST /api/v1/departments/{departmentId}/upload-history/bulk-upload
```

#### Request (multipart/form-data)

The CSV file is sent as a multipart file upload together with metadata identifying the target repository and tab.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File (multipart) | **Yes** | The CSV file to upload |
| `repository` | String | **Yes** | Target RepositoryType: `academic`, `faculty`, `student`, `research`, `alumni` |
| `tab` | String | **Yes** | Target tab ID (e.g., `curriculum`, `courses`, `faculty-profiles`, `student-profile`, `publications`, etc.) |

#### Response: `201 Created`

```json
{
  "success": true,
  "message": "CSV uploaded and processed successfully",
  "data": {
    "id": 9,
    "departmentId": 10,
    "fileName": "alumni_details_2026.csv",
    "tab": "Alumni Details",
    "repository": "alumni",
    "uploadedAt": "2026-07-15 10:30",
    "recordsCount": 120,
    "validRecords": 118,
    "invalidRecords": 2,
    "status": "processing",
    "uploadedBy": "Dr. Anita Sharma",
    "workflowStatus": "submitted",
    "createdAt": "2026-07-15T10:30:00",
    "updatedAt": "2026-07-15T10:30:00"
  },
  "timestamp": "2026-07-15T10:30:00"
}
```

#### Validation Errors Response: `422 Unprocessable Entity`

```json
{
  "success": false,
  "message": "CSV validation completed with errors",
  "data": {
    "uploadId": 9,
    "totalRows": 120,
    "validRows": 118,
    "invalidRows": 2,
    "warnings": 3,
    "errors": [
      {
        "row": 15,
        "column": "Credits",
        "value": "abc",
        "message": "Expected numeric value for Credits",
        "severity": "error"
      },
      {
        "row": 28,
        "column": "Course Code",
        "value": "",
        "message": "Required field \"Course Code\" is empty",
        "severity": "error"
      },
      {
        "row": 8,
        "column": "Theory Hours",
        "value": "0",
        "message": "Theory Hours is 0 - please verify",
        "severity": "warning"
      },
      {
        "row": 22,
        "column": "Program",
        "value": "B.Sc CSE",
        "message": "Program \"B.Sc CSE\" not found in master data",
        "severity": "error"
      },
      {
        "row": 35,
        "column": "Lab Hours",
        "value": "10",
        "message": "Lab Hours exceeds typical range",
        "severity": "warning"
      }
    ]
  },
  "timestamp": "2026-07-15T10:30:00"
}
```

#### `ValidationError` fields

| Field | Type | Description |
|-------|------|-------------|
| `row` | Integer | Row number in the CSV (1-based) |
| `column` | String | Column name where the error occurred |
| `value` | String | The actual value that failed validation |
| `message` | String | Human-readable error description |
| `severity` | String | `error` (blocks upload approval) or `warning` (informational) |

---

### 3.4 Summary / Dashboard Stats for Upload History

```
GET /api/v1/departments/{departmentId}/upload-history/summary
```

#### Response: `200 OK`

Provides the aggregate counts for the four summary cards shown at the top of the Upload History page.

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "totalUploads": 8,
    "approved": 5,
    "pending": 3,
    "rejected": 0,
    "processing": 0
  },
  "timestamp": "2026-07-15T10:30:00"
}
```

#### `UploadHistorySummary` fields

| Field | Type | Description |
|-------|------|-------------|
| `totalUploads` | Integer | Total number of uploads |
| `approved` | Integer | Number of uploads with status `approved` |
| `pending` | Integer | Number of uploads with status `pending` |
| `rejected` | Integer | Number of uploads with status `rejected` |
| `processing` | Integer | Number of uploads with status `processing` |

---

## 4. Verification Status Repository

All endpoints under `/api/v1/departments/{departmentId}/verification`.

---

### 4.1 GET Verification Summary (Aggregate)

```
GET /api/v1/departments/{departmentId}/verification/summary
```

#### Response: `200 OK`

Returns the five aggregate stat cards plus the per-tab breakdown that powers the verification progress page. The frontend renders:

1. **Overall stat cards** — total records, verified, approved, pending verification, rejected
2. **Repository-wise progress bars** — data completeness, evidence completeness, verification percent, readiness score per repository
3. **Pending items list** — tabs with pending verification or rejected counts

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "overall": {
      "totalRecords": 5976,
      "verified": 5558,
      "approved": 5384,
      "pendingVerification": 196,
      "rejected": 55
    },
    "repositories": [
      {
        "repositoryId": "academic",
        "repositoryLabel": "Academic Repository",
        "dataCompleteness": 86,
        "evidenceCompleteness": 72,
        "verificationPercent": 78,
        "readinessScore": 79
      },
      {
        "repositoryId": "faculty",
        "repositoryLabel": "Faculty Repository",
        "dataCompleteness": 92,
        "evidenceCompleteness": 68,
        "verificationPercent": 85,
        "readinessScore": 82
      },
      {
        "repositoryId": "student",
        "repositoryLabel": "Student Repository",
        "dataCompleteness": 88,
        "evidenceCompleteness": 75,
        "verificationPercent": 70,
        "readinessScore": 78
      },
      {
        "repositoryId": "research",
        "repositoryLabel": "Research Repository",
        "dataCompleteness": 74,
        "evidenceCompleteness": 60,
        "verificationPercent": 65,
        "readinessScore": 66
      },
      {
        "repositoryId": "alumni",
        "repositoryLabel": "Alumni Repository",
        "dataCompleteness": 68,
        "evidenceCompleteness": 55,
        "verificationPercent": 58,
        "readinessScore": 60
      }
    ],
    "tabSummaries": [
      {
        "tabId": "curriculum",
        "tabLabel": "Curriculum",
        "recordsUploaded": 8,
        "pendingValidation": 1,
        "pendingVerification": 2,
        "verified": 4,
        "approved": 4,
        "rejected": 0,
        "lastUpdated": "2025-01-08 10:15"
      },
      {
        "tabId": "courses",
        "tabLabel": "Courses",
        "recordsUploaded": 156,
        "pendingValidation": 5,
        "pendingVerification": 12,
        "verified": 130,
        "approved": 125,
        "rejected": 4,
        "lastUpdated": "2025-01-12 16:45"
      },
      {
        "tabId": "academic-calendar",
        "tabLabel": "Academic Calendar",
        "recordsUploaded": 4,
        "pendingValidation": 0,
        "pendingVerification": 0,
        "verified": 4,
        "approved": 4,
        "rejected": 0,
        "lastUpdated": "2025-01-05 09:00"
      },
      {
        "tabId": "value-added-courses",
        "tabLabel": "Value Added Courses",
        "recordsUploaded": 12,
        "pendingValidation": 2,
        "pendingVerification": 3,
        "verified": 5,
        "approved": 5,
        "rejected": 1,
        "lastUpdated": "2025-01-09 11:20"
      },
      {
        "tabId": "moocs",
        "tabLabel": "MOOCs / SWAYAM / NPTEL",
        "recordsUploaded": 24,
        "pendingValidation": 4,
        "pendingVerification": 6,
        "verified": 10,
        "approved": 10,
        "rejected": 2,
        "lastUpdated": "2025-01-11 13:40"
      },
      {
        "tabId": "supporting-documents",
        "tabLabel": "Supporting Documents",
        "recordsUploaded": 45,
        "pendingValidation": 3,
        "pendingVerification": 8,
        "verified": 28,
        "approved": 25,
        "rejected": 2,
        "lastUpdated": "2025-01-12 15:00"
      },
      {
        "tabId": "faculty-profiles",
        "tabLabel": "Faculty Profile",
        "recordsUploaded": 42,
        "pendingValidation": 0,
        "pendingVerification": 2,
        "verified": 38,
        "approved": 38,
        "rejected": 0,
        "lastUpdated": "2025-01-11 09:30"
      },
      {
        "tabId": "qualifications",
        "tabLabel": "Qualifications",
        "recordsUploaded": 86,
        "pendingValidation": 3,
        "pendingVerification": 5,
        "verified": 72,
        "approved": 70,
        "rejected": 1,
        "lastUpdated": "2025-01-10 14:00"
      },
      {
        "tabId": "employment-info",
        "tabLabel": "Employment Information",
        "recordsUploaded": 42,
        "pendingValidation": 1,
        "pendingVerification": 3,
        "verified": 35,
        "approved": 34,
        "rejected": 0,
        "lastUpdated": "2025-01-11 09:30"
      },
      {
        "tabId": "fdps",
        "tabLabel": "Faculty Development Programs",
        "recordsUploaded": 28,
        "pendingValidation": 1,
        "pendingVerification": 3,
        "verified": 20,
        "approved": 18,
        "rejected": 2,
        "lastUpdated": "2025-01-08 11:45"
      },
      {
        "tabId": "student-profile",
        "tabLabel": "Student Profile",
        "recordsUploaded": 856,
        "pendingValidation": 5,
        "pendingVerification": 12,
        "verified": 820,
        "approved": 815,
        "rejected": 4,
        "lastUpdated": "2025-01-12 08:00"
      },
      {
        "tabId": "admission-info",
        "tabLabel": "Admission Info",
        "recordsUploaded": 240,
        "pendingValidation": 3,
        "pendingVerification": 8,
        "verified": 220,
        "approved": 218,
        "rejected": 2,
        "lastUpdated": "2025-01-11 10:30"
      },
      {
        "tabId": "student-diversity",
        "tabLabel": "Student Diversity",
        "recordsUploaded": 856,
        "pendingValidation": 2,
        "pendingVerification": 6,
        "verified": 830,
        "approved": 825,
        "rejected": 3,
        "lastUpdated": "2025-01-11 14:00"
      },
      {
        "tabId": "academic-performance",
        "tabLabel": "Academic Performance",
        "recordsUploaded": 3200,
        "pendingValidation": 15,
        "pendingVerification": 45,
        "verified": 3000,
        "approved": 2980,
        "rejected": 10,
        "lastUpdated": "2025-01-12 16:00"
      },
      {
        "tabId": "student-progression",
        "tabLabel": "Student Progression",
        "recordsUploaded": 320,
        "pendingValidation": 4,
        "pendingVerification": 10,
        "verified": 280,
        "approved": 275,
        "rejected": 6,
        "lastUpdated": "2025-01-11 15:30"
      },
      {
        "tabId": "scholarship-financial-support",
        "tabLabel": "Scholarship & Financial Support",
        "recordsUploaded": 145,
        "pendingValidation": 3,
        "pendingVerification": 8,
        "verified": 120,
        "approved": 115,
        "rejected": 4,
        "lastUpdated": "2025-01-09 14:30"
      },
      {
        "tabId": "student-achievements",
        "tabLabel": "Student Achievements",
        "recordsUploaded": 68,
        "pendingValidation": 4,
        "pendingVerification": 8,
        "verified": 48,
        "approved": 45,
        "rejected": 3,
        "lastUpdated": "2025-01-10 12:00"
      },
      {
        "tabId": "publications",
        "tabLabel": "Publications",
        "recordsUploaded": 78,
        "pendingValidation": 3,
        "pendingVerification": 8,
        "verified": 58,
        "approved": 55,
        "rejected": 4,
        "lastUpdated": "2025-01-12 15:30"
      },
      {
        "tabId": "patents",
        "tabLabel": "Patents",
        "recordsUploaded": 12,
        "pendingValidation": 1,
        "pendingVerification": 2,
        "verified": 8,
        "approved": 7,
        "rejected": 1,
        "lastUpdated": "2025-01-10 09:00"
      },
      {
        "tabId": "research-grants",
        "tabLabel": "Research Grants",
        "recordsUploaded": 18,
        "pendingValidation": 2,
        "pendingVerification": 3,
        "verified": 10,
        "approved": 10,
        "rejected": 0,
        "lastUpdated": "2025-01-09 11:00"
      },
      {
        "tabId": "sponsored-projects",
        "tabLabel": "Sponsored Projects",
        "recordsUploaded": 11,
        "pendingValidation": 0,
        "pendingVerification": 2,
        "verified": 8,
        "approved": 7,
        "rejected": 1,
        "lastUpdated": "2025-01-07 16:00"
      },
      {
        "tabId": "consultancy-projects",
        "tabLabel": "Consultancy Projects",
        "recordsUploaded": 8,
        "pendingValidation": 1,
        "pendingVerification": 2,
        "verified": 4,
        "approved": 4,
        "rejected": 0,
        "lastUpdated": "2025-01-08 14:00"
      },
      {
        "tabId": "alumni-details",
        "tabLabel": "Alumni Details",
        "recordsUploaded": 420,
        "pendingValidation": 12,
        "pendingVerification": 25,
        "verified": 350,
        "approved": 340,
        "rejected": 8,
        "lastUpdated": "2025-01-12 10:00"
      },
      {
        "tabId": "employment-career",
        "tabLabel": "Employment & Career",
        "recordsUploaded": 380,
        "pendingValidation": 8,
        "pendingVerification": 18,
        "verified": 320,
        "approved": 310,
        "rejected": 5,
        "lastUpdated": "2025-01-11 14:30"
      },
      {
        "tabId": "higher-education",
        "tabLabel": "Higher Education",
        "recordsUploaded": 95,
        "pendingValidation": 3,
        "pendingVerification": 8,
        "verified": 75,
        "approved": 72,
        "rejected": 2,
        "lastUpdated": "2025-01-10 11:00"
      },
      {
        "tabId": "alumni-engagement",
        "tabLabel": "Alumni Engagement",
        "recordsUploaded": 68,
        "pendingValidation": 4,
        "pendingVerification": 6,
        "verified": 50,
        "approved": 48,
        "rejected": 2,
        "lastUpdated": "2025-01-12 09:30"
      },
      {
        "tabId": "alumni-contributions",
        "tabLabel": "Alumni Contributions",
        "recordsUploaded": 45,
        "pendingValidation": 2,
        "pendingVerification": 5,
        "verified": 32,
        "approved": 30,
        "rejected": 1,
        "lastUpdated": "2025-01-11 16:00"
      },
      {
        "tabId": "alumni-mentorship",
        "tabLabel": "Alumni Mentorship",
        "recordsUploaded": 28,
        "pendingValidation": 2,
        "pendingVerification": 4,
        "verified": 18,
        "approved": 16,
        "rejected": 1,
        "lastUpdated": "2025-01-09 13:00"
      },
      {
        "tabId": "alumni-achievements",
        "tabLabel": "Alumni Achievements",
        "recordsUploaded": 52,
        "pendingValidation": 3,
        "pendingVerification": 6,
        "verified": 38,
        "approved": 35,
        "rejected": 2,
        "lastUpdated": "2025-01-10 15:30"
      },
      {
        "tabId": "alumni-chapters",
        "tabLabel": "Alumni Chapters",
        "recordsUploaded": 12,
        "pendingValidation": 1,
        "pendingVerification": 2,
        "verified": 8,
        "approved": 8,
        "rejected": 0,
        "lastUpdated": "2025-01-08 10:00"
      },
      {
        "tabId": "alumni-events",
        "tabLabel": "Alumni Events",
        "recordsUploaded": 24,
        "pendingValidation": 2,
        "pendingVerification": 3,
        "verified": 16,
        "approved": 15,
        "rejected": 1,
        "lastUpdated": "2025-01-11 11:30"
      }
    ],
    "pendingItems": [
      {
        "tabId": "academic-performance",
        "tabLabel": "Academic Performance",
        "pendingVerification": 45,
        "rejected": 10
      },
      {
        "tabId": "alumni-details",
        "tabLabel": "Alumni Details",
        "pendingVerification": 25,
        "rejected": 8
      }
    ]
  },
  "timestamp": "2026-07-15T10:30:00"
}
```

#### `VerificationSummary` — top-level fields

| Field | Type | Description |
|-------|------|-------------|
| `overall` | OverallStats | Aggregate counts across all repository tabs |
| `repositories` | Array of RepositoryMetrics | Per-repository health metrics |
| `tabSummaries` | Array of TabSummary | Per-tab record-level breakdown |
| `pendingItems` | Array of PendingItem | Filtered list of tabs that need attention (pending verification > 0 or rejected > 0) |

#### `OverallStats` fields

| Field | Type | Description |
|-------|------|-------------|
| `totalRecords` | Integer | Sum of `recordsUploaded` across all tabs |
| `verified` | Integer | Sum of `verified` across all tabs |
| `approved` | Integer | Sum of `approved` across all tabs |
| `pendingVerification` | Integer | Sum of `pendingVerification` across all tabs |
| `rejected` | Integer | Sum of `rejected` across all tabs |

#### `RepositoryMetrics` fields

| Field | Type | Description |
|-------|------|-------------|
| `repositoryId` | String | Repository identifier: `academic`, `faculty`, `student`, `research`, `alumni` |
| `repositoryLabel` | String | Human-readable name (e.g., "Academic Repository") |
| `dataCompleteness` | Integer | Percentage (0–100) of data completeness |
| `evidenceCompleteness` | Integer | Percentage (0–100) of evidence completeness |
| `verificationPercent` | Integer | Percentage (0–100) of records verified |
| `readinessScore` | Integer | Composite readiness score (0–100) |

#### `TabSummary` fields

| Field | Type | Description |
|-------|------|-------------|
| `tabId` | String | Tab identifier (e.g., `curriculum`, `courses`, `faculty-profiles`, `student-profile`) |
| `tabLabel` | String | Human-readable tab name (e.g., "Curriculum", "Courses") |
| `recordsUploaded` | Integer | Total records uploaded for this tab |
| `pendingValidation` | Integer | Records awaiting system validation |
| `pendingVerification` | Integer | Records awaiting human verification |
| `verified` | Integer | Records that have been verified |
| `approved` | Integer | Records that have been fully approved |
| `rejected` | Integer | Records that have been rejected |
| `lastUpdated` | String | ISO `YYYY-MM-DD HH:mm` of last update |

#### `PendingItem` fields

| Field | Type | Description |
|-------|------|-------------|
| `tabId` | String | Tab identifier |
| `tabLabel` | String | Human-readable tab name |
| `pendingVerification` | Integer | Records pending verification (only shown if > 0) |
| `rejected` | Integer | Rejected records (only shown if > 0) |

---

### 4.2 GET Dashboard KPIs

```
GET /api/v1/departments/{departmentId}/dashboard/kpis
```

Used by the **Repository Dashboard** page to show 9 KPI cards covering repository completion and pending work.

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": "academic-completion",
      "label": "Academic Repository",
      "value": 78,
      "suffix": "%",
      "icon": "GraduationCap",
      "trend": 5,
      "trendLabel": "vs last month"
    },
    {
      "id": "faculty-completion",
      "label": "Faculty Repository",
      "value": 85,
      "suffix": "%",
      "icon": "Users",
      "trend": 3,
      "trendLabel": "vs last month"
    },
    {
      "id": "student-completion",
      "label": "Student Repository",
      "value": 72,
      "suffix": "%",
      "icon": "BookOpen",
      "trend": 8,
      "trendLabel": "vs last month"
    },
    {
      "id": "research-completion",
      "label": "Research Repository",
      "value": 65,
      "suffix": "%",
      "icon": "FlaskConical",
      "trend": 4,
      "trendLabel": "vs last month"
    },
    {
      "id": "alumni-completion",
      "label": "Alumni Repository",
      "value": 58,
      "suffix": "%",
      "icon": "Users2",
      "trend": 6,
      "trendLabel": "vs last month"
    },
    {
      "id": "pending-reviews",
      "label": "Pending Reviews",
      "value": 14,
      "suffix": null,
      "icon": "Clock",
      "trend": -3,
      "trendLabel": "vs last week"
    },
    {
      "id": "pending-verification",
      "label": "Pending Verification",
      "value": 8,
      "suffix": null,
      "icon": "Shield",
      "trend": -2,
      "trendLabel": "cleared"
    },
    {
      "id": "pending-evidence",
      "label": "Pending Evidence",
      "value": 12,
      "suffix": null,
      "icon": "FileText",
      "trend": -4,
      "trendLabel": "uploaded"
    },
    {
      "id": "readiness",
      "label": "Readiness Score",
      "value": 76,
      "suffix": "%",
      "icon": "Target",
      "trend": 5.3,
      "trendLabel": "improvement"
    }
  ],
  "timestamp": "2026-07-15T10:30:00"
}
```

#### `KpiResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique KPI identifier |
| `label` | String | Display label |
| `value` | Number | Numeric value (can be integer or decimal) |
| `suffix` | String (nullable) | Suffix like `%`, may be null |
| `icon` | String | Icon identifier mapped by the frontend (GraduationCap, Users, BookOpen, FlaskConical, Users2, Clock, Shield, FileText, Target) |
| `trend` | Number | Positive = upward, negative = downward |
| `trendLabel` | String | Context label (e.g., "vs last month", "vs last week", "cleared", "uploaded", "improvement") |

---

## 6. Dashboard

All endpoints under `/api/v1/departments/{departmentId}/dashboard`.

---

### 6.1 GET Dashboard Overview (Full Page)

```
GET /api/v1/departments/{departmentId}/dashboard/overview
```

Returns everything the Repository Dashboard page needs in a single call — KPI cards, department info, per-repository readiness metrics, and recent uploads. The frontend currently imports these from five separate mock data sources (`dashboardKPIs`, `departmentInfo`, `repositoryHealth`, `allRepositoryConfigs`, `uploadHistory`).

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "kpis": [
      {
        "id": "academic-completion",
        "label": "Academic Repository",
        "value": 78,
        "suffix": "%",
        "icon": "GraduationCap",
        "trend": 5,
        "trendLabel": "vs last month"
      },
      {
        "id": "faculty-completion",
        "label": "Faculty Repository",
        "value": 85,
        "suffix": "%",
        "icon": "Users",
        "trend": 3,
        "trendLabel": "vs last month"
      },
      {
        "id": "student-completion",
        "label": "Student Repository",
        "value": 72,
        "suffix": "%",
        "icon": "BookOpen",
        "trend": 8,
        "trendLabel": "vs last month"
      },
      {
        "id": "research-completion",
        "label": "Research Repository",
        "value": 65,
        "suffix": "%",
        "icon": "FlaskConical",
        "trend": 4,
        "trendLabel": "vs last month"
      },
      {
        "id": "alumni-completion",
        "label": "Alumni Repository",
        "value": 58,
        "suffix": "%",
        "icon": "Users2",
        "trend": 6,
        "trendLabel": "vs last month"
      },
      {
        "id": "pending-reviews",
        "label": "Pending Reviews",
        "value": 14,
        "suffix": null,
        "icon": "Clock",
        "trend": -3,
        "trendLabel": "vs last week"
      },
      {
        "id": "pending-verification",
        "label": "Pending Verification",
        "value": 8,
        "suffix": null,
        "icon": "Shield",
        "trend": -2,
        "trendLabel": "cleared"
      },
      {
        "id": "pending-evidence",
        "label": "Pending Evidence",
        "value": 12,
        "suffix": null,
        "icon": "FileText",
        "trend": -4,
        "trendLabel": "uploaded"
      },
      {
        "id": "readiness",
        "label": "Readiness Score",
        "value": 76,
        "suffix": "%",
        "icon": "Target",
        "trend": 5.3,
        "trendLabel": "improvement"
      }
    ],
    "department": {
      "name": "Computer Science & Engineering (CSE)",
      "programOfferingCount": 5,
      "specializations": ["AI", "Data Science", "Cyber Security"],
      "coordinatorName": "Dr. Anita Sharma",
      "academicYear": "2025-26"
    },
    "overallReadiness": 73,
    "repositories": [
      {
        "repositoryId": "academic",
        "label": "Academic Repository",
        "dataCompleteness": 86,
        "evidenceCompleteness": 72,
        "verificationPercent": 78,
        "readinessScore": 79
      },
      {
        "repositoryId": "faculty",
        "label": "Faculty Repository",
        "dataCompleteness": 92,
        "evidenceCompleteness": 68,
        "verificationPercent": 85,
        "readinessScore": 82
      },
      {
        "repositoryId": "student",
        "label": "Student Repository",
        "dataCompleteness": 88,
        "evidenceCompleteness": 75,
        "verificationPercent": 70,
        "readinessScore": 78
      },
      {
        "repositoryId": "research",
        "label": "Research Repository",
        "dataCompleteness": 74,
        "evidenceCompleteness": 60,
        "verificationPercent": 65,
        "readinessScore": 66
      },
      {
        "repositoryId": "alumni",
        "label": "Alumni Repository",
        "dataCompleteness": 68,
        "evidenceCompleteness": 55,
        "verificationPercent": 58,
        "readinessScore": 60
      }
    ],
    "recentUploads": [
      {
        "id": 1,
        "fileName": "faculty_profiles_cse_2025.csv",
        "repository": "faculty",
        "recordsCount": 42,
        "uploadedAt": "2025-01-11 09:30",
        "status": "approved"
      },
      {
        "id": 2,
        "fileName": "courses_sem1_2025.csv",
        "repository": "academic",
        "recordsCount": 42,
        "uploadedAt": "2025-01-12 16:45",
        "status": "approved"
      },
      {
        "id": 3,
        "fileName": "student_enrollment_2025.csv",
        "repository": "student",
        "recordsCount": 240,
        "uploadedAt": "2025-01-12 08:00",
        "status": "approved"
      },
      {
        "id": 4,
        "fileName": "publications_2024_25.csv",
        "repository": "research",
        "recordsCount": 28,
        "uploadedAt": "2025-01-12 15:30",
        "status": "pending"
      },
      {
        "id": 5,
        "fileName": "vac_2025_26.csv",
        "repository": "academic",
        "recordsCount": 12,
        "uploadedAt": "2025-01-09 11:20",
        "status": "approved"
      }
    ]
  },
  "timestamp": "2026-07-15T10:30:00"
}
```

#### `DashboardOverviewResponse` top-level fields

| Field | Type | Description |
|-------|------|-------------|
| `kpis` | Array of KpiItem | 9 KPI cards for the top section |
| `department` | DepartmentInfo | Department context for the info bar |
| `overallReadiness` | Integer | Average readiness score across all repositories (0–100). Frontend calculates this as `round(avg of all readinessScores)` if not provided, but receiving it pre-computed is preferred. |
| `repositories` | Array of RepoMetrics | Per-repository readiness breakdown |
| `recentUploads` | Array of RecentUploadItem | Last 5 uploads (sorted by `uploadedAt` descending) |

#### `KpiItem` fields

| Field | Type | Always present | Description |
|-------|------|----------------|-------------|
| `id` | String | Yes | Unique KPI identifier (e.g., `academic-completion`, `faculty-completion`, `student-completion`, `research-completion`, `alumni-completion`, `pending-reviews`, `pending-verification`, `pending-evidence`, `readiness`) |
| `label` | String | Yes | Display label (e.g., "Academic Repository", "Pending Reviews", "Readiness Score") |
| `value` | Number | Yes | Numeric value (integer or decimal like 5.3) |
| `suffix` | String (nullable) | No | Suffix like `%`; null if not applicable |
| `icon` | String | Yes | Icon identifier: `GraduationCap`, `Users`, `BookOpen`, `FlaskConical`, `Users2`, `Clock`, `Shield`, `FileText`, `Target` |
| `trend` | Number | Yes | Trend direction and magnitude. Positive = improvement (shown green), negative = decline (shown red) |
| `trendLabel` | String | Yes | Contextual label (e.g., `vs last month`, `vs last week`, `cleared`, `uploaded`, `improvement`) |

#### `DepartmentInfo` fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Full department name (e.g., "Computer Science & Engineering (CSE)") |
| `programOfferingCount` | Integer | Number of program offerings (frontend displays "{count} programs") |
| `specializations` | Array of String | Specialization names (frontend joins with `, `) |
| `coordinatorName` | String | Department coordinator display name |
| `academicYear` | String | Active academic year (e.g., `2025-26`) |

#### `RepoMetrics` fields

| Field | Type | Description |
|-------|------|-------------|
| `repositoryId` | String | Repository identifier: `academic`, `faculty`, `student`, `research`, `alumni` |
| `label` | String | Human-readable label (e.g., "Academic Repository") |
| `dataCompleteness` | Integer | Percentage (0–100) |
| `evidenceCompleteness` | Integer | Percentage (0–100) |
| `verificationPercent` | Integer | Percentage (0–100) |
| `readinessScore` | Integer | Composite readiness (0–100) |

#### `RecentUploadItem` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long (number) | Upload record ID |
| `fileName` | String | CSV file name |
| `repository` | String | RepositoryType enum: `academic`, `faculty`, `student`, `research`, `alumni` |
| `recordsCount` | Integer | Number of records in the upload |
| `uploadedAt` | String | ISO `YYYY-MM-DD HH:mm` |
| `status` | String | UploadStatus: `approved`, `pending`, `rejected`, `processing` |

---

### 6.2 GET Dashboard KPIs (Standalone)

```
GET /api/v1/departments/{departmentId}/dashboard/kpis
```

Returns only the 9 KPI card items (same shape as `kpis` array in §6.1). Use this if the rest of the dashboard data is already cached and only the KPI values need refreshing.

#### Response: `200 OK`

Response is an array of `KpiItem` objects with the same shape defined in §6.1.

---

## 5. Profile & Auth Context

### 5.1 GET Current User Profile

```
GET /api/v1/auth/me
```

This endpoint already exists and is used during app initialization. It returns the authenticated user's profile.

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "email": "anita.sharma@institution.edu",
    "firstName": "Anita",
    "lastName": "Sharma",
    "role": "DEPARTMENT_COORDINATOR",
    "institutionId": 1,
    "institutionName": "Sample Institution of Technology",
    "department": "Computer Science & Engineering (CSE)",
    "departmentId": 10
  },
  "timestamp": "2026-07-15T10:30:00"
}
```

#### `UserProfileResponse` fields

| Field | Type | Always present | Description |
|-------|------|----------------|-------------|
| `id` | Long (number) | Yes | User primary key |
| `email` | String | Yes | User's email address |
| `firstName` | String | Yes | First name |
| `lastName` | String | Yes | Last name |
| `role` | String (enum) | Yes | UserRole: `SUPER_ADMIN`, `INSTITUTION_ADMIN`, `IQAC_COORDINATOR`, `PRINCIPAL`, `DEPARTMENT_COORDINATOR`, `INFRASTRUCTURE_COORDINATOR`, `FINANCE_COORDINATOR`, `TPO_COORDINATOR`, `STUDENT_DEVELOPMENT_COORDINATOR` |
| `institutionId` | Long (nullable) | No | Owning institution ID |
| `institutionName` | String (nullable) | No | Institution display name |
| `department` | String (nullable) | No | Department display name |
| `departmentId` | Long (nullable) | No | Department ID (null for non-department roles) |

---

### 5.2 GET Department Coordinator Profile (Extended)

```
GET /api/v1/departments/{departmentId}/profile
```

Returns the coordinator's extended profile with department assignment, program offerings, specializations, permissions, and overall readiness — everything the Profile page needs.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "coordinator": {
      "id": 1,
      "firstName": "Anita",
      "lastName": "Sharma",
      "email": "anita.sharma@institution.edu",
      "phone": "+91 98765 43210",
      "role": "DEPARTMENT_COORDINATOR"
    },
    "department": {
      "id": 10,
      "name": "Computer Science & Engineering (CSE)",
      "programOfferings": [
        "B.Tech CSE AI R22",
        "B.Tech CSE Data Science R22",
        "B.Tech CSE Cyber Security R22",
        "M.Tech CSE AI R22",
        "M.Tech CSE Data Science R20"
      ],
      "specializations": ["AI", "Data Science", "Cyber Security"],
      "academicYear": "2025-26"
    },
    "overallReadiness": 73,
    "permissions": {
      "allowedActions": [
        "Upload Data",
        "Update Data",
        "Re-submit Data",
        "Upload Evidence",
        "Download Templates",
        "View Reports"
      ],
      "restrictedActions": [
        "Verify Records",
        "Approve Records",
        "Reject Records",
        "Modify Master Data",
        "Create Programs/Departments",
        "Manage Users"
      ]
    },
    "repositoryReadiness": [
      {
        "repositoryId": "academic",
        "label": "Academic Repository",
        "readinessScore": 79,
        "dataCompleteness": 86,
        "evidenceCompleteness": 72,
        "verificationPercent": 78
      },
      {
        "repositoryId": "faculty",
        "label": "Faculty Repository",
        "readinessScore": 82,
        "dataCompleteness": 92,
        "evidenceCompleteness": 68,
        "verificationPercent": 85
      },
      {
        "repositoryId": "student",
        "label": "Student Repository",
        "readinessScore": 78,
        "dataCompleteness": 88,
        "evidenceCompleteness": 75,
        "verificationPercent": 70
      },
      {
        "repositoryId": "research",
        "label": "Research Repository",
        "readinessScore": 66,
        "dataCompleteness": 74,
        "evidenceCompleteness": 60,
        "verificationPercent": 65
      },
      {
        "repositoryId": "alumni",
        "label": "Alumni Repository",
        "readinessScore": 60,
        "dataCompleteness": 68,
        "evidenceCompleteness": 55,
        "verificationPercent": 58
      }
    ]
  },
  "timestamp": "2026-07-15T10:30:00"
}
```

#### `CoordinatorProfileResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `coordinator` | CoordinatorInfo | Personal info — name, email, phone, role |
| `department` | DepartmentAssignment | Department context — name, program offerings, specializations, academic year |
| `overallReadiness` | Integer | Average readiness score across all repositories (0–100) |
| `permissions` | PermissionsInfo | Allowed vs restricted actions for the user's role |
| `repositoryReadiness` | Array of RepositoryReadiness | Per-repository readiness breakdown |

#### `CoordinatorInfo` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | User ID |
| `firstName` | String | First name |
| `lastName` | String | Last name |
| `email` | String | Official email |
| `phone` | String (nullable) | Phone number with country code |
| `role` | String (enum) | UserRole enum value |

#### `DepartmentAssignment` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Department ID |
| `name` | String | Full department name |
| `programOfferings` | Array of String | Program offering display names |
| `specializations` | Array of String | Specialization names |
| `academicYear` | String | Current active academic year |

#### `PermissionsInfo` fields

| Field | Type | Description |
|-------|------|-------------|
| `allowedActions` | Array of String | What the user can do (e.g., "Upload Data", "Update Data", "Re-submit Data", "Upload Evidence", "Download Templates", "View Reports") |
| `restrictedActions` | Array of String | What the user cannot do (e.g., "Verify Records", "Approve Records", "Reject Records", "Modify Master Data", "Create Programs/Departments", "Manage Users") |

#### `RepositoryReadiness` fields

| Field | Type | Description |
|-------|------|-------------|
| `repositoryId` | String | Repository identifier |
| `label` | String | Human-readable name |
| `readinessScore` | Integer | Composite readiness (0–100) |
| `dataCompleteness` | Integer | Data completeness % |
| `evidenceCompleteness` | Integer | Evidence completeness % |
| `verificationPercent` | Integer | Verification % |

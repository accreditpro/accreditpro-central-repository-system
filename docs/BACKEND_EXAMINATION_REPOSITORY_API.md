# TASK: Align Spring Boot REST APIs and OpenAPI Documentation with Frontend Examination Repository Config

Please update/create the Spring Boot Controllers, Service Layer, DTO Classes, Entities, and OpenAPI/Swagger Documentation for the **Examination Officer - Examination Repository** module.

The frontend source of truth is `src/pages/examination-repository/examination-configs.ts` and `src/pages/examination-repository/types.ts`. The DTO JSON request/response property names **MUST** match the exact camelCase keys used in the frontend `ModuleConfig.fields[].key` definitions and TypeScript interface properties.

---

## 1. Global API Specifications

- **Base Endpoint Path:** `/api/v1/examination-officer`
- **Swagger Tag:** `EO - Examination Repository`
- **Authentication Header:** `Authorization: Bearer <jwt-token>`
- **Role Guard:** `EXAMINATION_OFFICER`

### Standard Query Parameters for GET (List) Endpoints:
| Parameter      | Type    | Required | Default    | Description                        |
|----------------|---------|----------|------------|------------------------------------|
| `academicYear` | String  | Optional | `"2025-26"`| Filter by academic year            |
| `page`         | Integer | Optional | `0`        | Zero-based page index              |
| `size`         | Integer | Optional | `10`       | Number of records per page         |
| `search`       | String  | Optional | —          | Full-text search across all fields |
| `semester`     | String  | Optional | —          | Filter by semester (1–8)           |
| `program`      | String  | Optional | —          | Filter by program                  |
| `status`       | String  | Optional | —          | Filter by status                   |

### Standard Response Structure

**1. Single Object / Mutation Operations (`ApiResponse<T>`):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-08-01T12:00:00"
}
```

**2. Paginated List Operations (`ApiResponse<Page<T>>`):**
```json
{
  "success": true,
  "message": "Records retrieved successfully",
  "data": {
    "content": [ ... ],
    "totalPages": 5,
    "totalElements": 50,
    "number": 0,
    "size": 10
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

**3. Error Response:**
```json
{
  "success": false,
  "message": "Validation failed: 'academicYear' is required",
  "data": null,
  "timestamp": "2026-08-01T12:00:00"
}
```

---

## 2. Dashboard & Health API

### `GET /api/v1/examination-officer/dashboard`

Provides the read-only overview shown on the **Examination Dashboard** — stats cards, recent activities, upcoming events, and quick link counts.

**Query Parameters:** `academicYear` (String, Optional, default `"2025-26"`)

**Response DTO: `ExaminationDashboardResponseDTO`**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "academicYear": "2025-26",
    "stats": {
      "totalExaminationSchedules": 8,
      "publishedResults": 6,
      "supplementaryExaminations": 3,
      "backlogRecords": 57,
      "activeCirculars": 4
    },
    "recentActivities": [
      {
        "text": "End Semester schedule published for Even Sem 2024-25",
        "time": "2 hours ago",
        "type": "schedule",
        "timestamp": "2026-08-10T10:00:00"
      }
    ],
    "upcomingActivities": [
      {
        "text": "End Semester Examination - Even Sem 2024",
        "date": "Dec 2 - Dec 20, 2024",
        "startDate": "2024-12-02",
        "endDate": "2024-12-20",
        "type": "schedule"
      }
    ]
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

---

## 3. Sub-Module Standard Endpoints

Each of the **5 sub-modules** requires the following endpoints:

| # | Method | Path                                                        | Description             |
|---|--------|-------------------------------------------------------------|-------------------------|
| 1 | GET    | `/api/v1/examination-officer/{module-slug}`                 | List paginated records  |
| 2 | POST   | `/api/v1/examination-officer/{module-slug}`                 | Create a new record     |
| 3 | GET    | `/api/v1/examination-officer/{module-slug}/{id}`            | Get single record by ID |
| 4 | PUT    | `/api/v1/examination-officer/{module-slug}/{id}`            | Update record           |
| 5 | DELETE | `/api/v1/examination-officer/{module-slug}/{id}`            | Delete record           |
| 6 | POST   | `/api/v1/examination-officer/{module-slug}/upload`          | Bulk CSV upload         |
| 7 | GET    | `/api/v1/examination-officer/{module-slug}/export`          | Export as CSV           |

---

## 4. Module 1: Examination Schedules

### Slug: `examination-schedules`

**Module Purpose:** Maintain official examination schedules published by the institution as accreditation evidence. Supports evidence document upload (schedule PDFs).

**Evidence Upload:** Enabled — `schedule-document` section (PDF, DOCX, PNG, JPG/JPEG)

---

### 4.1 DTO Schema: `ExaminationScheduleRequestDTO` / `ExaminationScheduleResponseDTO`

All keys are derived directly from `examinationScheduleConfig.fields[].key` in `examination-configs.ts` and the `ExaminationSchedule` TypeScript interface in `types.ts`.

| Field Key          | Type   | Required | Validation                                              | Source       |
|--------------------|--------|----------|---------------------------------------------------------|--------------|
| `academicYear`     | String | Yes      | Pattern `^\d{4}-\d{2}$`, e.g. `"2024-25"`              | config field |
| `semester`         | String | Yes      | Enum: `"1"`,`"2"`,`"3"`,`"4"`,`"5"`,`"6"`,`"7"`,`"8"` | config field |
| `examinationType`  | String | Yes      | Enum: `"Internal Assessment"`, `"End Semester Examination"`, `"Supplementary Examination"` | config field |
| `program`          | String | Yes      | NotBlank, max 200 chars                                 | config field |
| `department`       | String | No       | max 200 chars                                           | config field |
| `title`            | String | Yes      | NotBlank, max 500 chars                                 | config field |
| `description`      | String | No       | max 2000 chars                                          | config field |
| `startDate`        | Date   | Yes      | ISO `YYYY-MM-DD`, must be before `endDate`              | config field |
| `endDate`          | Date   | Yes      | ISO `YYYY-MM-DD`, must be after `startDate`             | config field |
| `status`           | String | Yes      | Enum: `"Draft"`, `"Published"`, `"Archived"`            | config field |

**Response-Only Fields** (included in `ExaminationScheduleResponseDTO`):

| Field Key             | Type     | Description                           |
|-----------------------|----------|---------------------------------------|
| `id`                  | String   | UUID of the record                    |
| `schedulePdf`         | String   | URL to uploaded schedule PDF          |
| `supportingDocuments` | String[] | List of URLs to supporting docs       |
| `createdAt`           | DateTime | Record creation timestamp             |
| `updatedAt`           | DateTime | Record last-updated timestamp         |
| `evidenceCount`       | Integer  | Total number of evidence files linked |

---

### 4.2 List Schedules — `GET /api/v1/examination-officer/examination-schedules`

**Query Parameters:** Standard list params + `semester`, `program`, `status`, `examinationType`

**Sample Response:**
```json
{
  "success": true,
  "message": "Examination schedules retrieved successfully",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "academicYear": "2024-25",
        "semester": "4",
        "examinationType": "End Semester Examination",
        "program": "B.Tech CSE AI R22",
        "department": "Computer Science",
        "title": "End Semester Examination - Even Sem 2024",
        "description": "Regular end semester exams for even semester",
        "startDate": "2024-12-02",
        "endDate": "2024-12-20",
        "status": "Published",
        "schedulePdf": null,
        "supportingDocuments": [],
        "evidenceCount": 0,
        "createdAt": "2024-11-01T10:00:00",
        "updatedAt": "2024-11-25T12:00:00"
      }
    ],
    "totalPages": 1,
    "totalElements": 4,
    "number": 0,
    "size": 10
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

---

### 4.3 Create Schedule — `POST /api/v1/examination-officer/examination-schedules`

**Request Body (`ExaminationScheduleRequestDTO`):**
```json
{
  "academicYear": "2024-25",
  "semester": "4",
  "examinationType": "End Semester Examination",
  "program": "B.Tech CSE AI R22",
  "department": "Computer Science",
  "title": "End Semester Examination - Even Sem 2024",
  "description": "Regular end semester exams for even semester",
  "startDate": "2024-12-02",
  "endDate": "2024-12-20",
  "status": "Draft"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Examination schedule created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "academicYear": "2024-25",
    "semester": "4",
    "examinationType": "End Semester Examination",
    "program": "B.Tech CSE AI R22",
    "department": "Computer Science",
    "title": "End Semester Examination - Even Sem 2024",
    "description": "Regular end semester exams for even semester",
    "startDate": "2024-12-02",
    "endDate": "2024-12-20",
    "status": "Draft",
    "schedulePdf": null,
    "supportingDocuments": [],
    "evidenceCount": 0,
    "createdAt": "2026-08-01T12:00:00",
    "updatedAt": "2026-08-01T12:00:00"
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

**Validation Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": {
      "academicYear": "Academic year is required",
      "endDate": "End date must be after start date",
      "examinationType": "Must be one of: Internal Assessment, End Semester Examination, Supplementary Examination"
    }
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

---

### 4.4 Update Schedule — `PUT /api/v1/examination-officer/examination-schedules/{id}`

Same request body as Create. Returns the updated `ExaminationScheduleResponseDTO`.

---

### 4.5 Delete Schedule — `DELETE /api/v1/examination-officer/examination-schedules/{id}`

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Examination schedule deleted successfully",
  "data": null,
  "timestamp": "2026-08-01T12:00:00"
}
```

---

### 4.6 CSV Upload — `POST /api/v1/examination-officer/examination-schedules/upload`

**Content-Type:** `multipart/form-data`
- `file` (MultipartFile, Required): CSV file
- `academicYear` (String, Required)

**Expected CSV Columns:**
```
Academic Year,Semester,Examination Type,Program,Title,Start Date,End Date,Status
```

**Optional columns** (may be omitted entirely; blank cells are tolerated): `Department`, `Description`, `Start Time`, `End Time`.

**Row validation rules (per row):**
- `Academic Year` — `YYYY-YY` format; must match the `academicYear` query parameter (blank falls back to it)
- `Semester` — one of `1`–`8`
- `Examination Type` — `Internal Assessment`, `End Semester Examination`, or `Supplementary Examination`
- `Program`, `Title`, `Start Date`, `End Date`, `Status` — required
- `Status` — `Draft`, `Published`, or `Archived`
- `Start Date` / `End Date` — entered as `DD-MM-YYYY` (ISO `YYYY-MM-DD` also accepted); stored as `YYYY-MM-DD`; End Date cannot be before Start Date; when both fall on the same day, End Time must be after Start Time
- Rows that violate a rule are reported individually in `errors` (row number prefixed); the remaining valid rows are still imported
- Rows whose full data matches a record that already exists for the institution (or an earlier row in the same file) are **duplicates**: they are skipped and reported via `duplicatesCount` + `duplicateMessages` instead of being stored again

**Success Response:**
```json
{
  "success": true,
  "message": "CSV uploaded successfully. 4 records imported, 0 failed.",
  "data": {
    "totalRows": 4,
    "importedCount": 4,
    "failedCount": 0,
    "errors": []
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

---

## 5. Module 2: Examination Circulars

### Slug: `examination-circulars`

**Module Purpose:** Maintain all examination-related notifications and circulars. Supports evidence upload (circular PDF).

**Evidence Upload:** Enabled — `circular-pdf` section (PDF only)

---

### 5.1 DTO Schema: `ExaminationCircularRequestDTO` / `ExaminationCircularResponseDTO`

Derived from `examinationCircularsConfig.fields[].key` and `ExaminationCircular` interface.

| Field Key        | Type   | Required | Validation                                                                                       |
|------------------|--------|----------|--------------------------------------------------------------------------------------------------|
| `circularNumber` | String | Yes      | NotBlank, max 100 chars, unique per institution                                                  |
| `circularDate`   | Date   | Yes      | ISO `YYYY-MM-DD`                                                                                 |
| `title`          | String | Yes      | NotBlank, max 500 chars                                                                          |
| `description`    | String | No       | max 2000 chars                                                                                   |
| `category`       | String | Yes      | Enum: `"Examination Notification"`, `"Hall Ticket Notification"`, `"Practical Examination"`, `"Evaluation"`, `"Result Notification"`, `"Supplementary Notification"`, `"General Circular"` |
| `status`         | String | Yes      | Enum: `"Draft"`, `"Published"`, `"Archived"`                                                    |

**Response-Only Fields:**

| Field Key             | Type     | Description                 |
|-----------------------|----------|-----------------------------|
| `id`                  | String   | UUID                        |
| `pdf`                 | String   | URL to uploaded PDF         |
| `supportingDocuments` | String[] | List of additional doc URLs |
| `evidenceCount`       | Integer  | Number of evidence files    |
| `createdAt`           | DateTime | Creation timestamp          |
| `updatedAt`           | DateTime | Last updated timestamp      |

---

### 5.2 Create Circular — `POST /api/v1/examination-officer/examination-circulars`

**Request Body:**
```json
{
  "circularNumber": "EXAM/CIR/2024/001",
  "circularDate": "2024-11-15",
  "title": "End Semester Examination Notification - Even Sem 2024",
  "description": "Official notification regarding the schedule and guidelines",
  "category": "Examination Notification",
  "status": "Published"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Examination circular created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "circularNumber": "EXAM/CIR/2024/001",
    "circularDate": "2024-11-15",
    "title": "End Semester Examination Notification - Even Sem 2024",
    "description": "Official notification regarding the schedule and guidelines",
    "category": "Examination Notification",
    "status": "Published",
    "pdf": null,
    "supportingDocuments": [],
    "evidenceCount": 0,
    "createdAt": "2026-08-01T12:00:00",
    "updatedAt": "2026-08-01T12:00:00"
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

### 5.3 CSV Upload — `POST /api/v1/examination-officer/examination-circulars/upload`

**Content-Type:** `multipart/form-data`
- `file` (MultipartFile, Required): CSV file

**Expected CSV Columns:**
```
Circular Number,Circular Date,Title,Category,Status
```

**Optional columns** (may be omitted entirely; blank cells are tolerated): `Description`.

**Template endpoint:** `GET /api/v1/examination-officer/examination-circulars/template` — downloads a header-only CSV template.

**Row validation rules (per row):**
- `Circular Number` — required; must be unique per institution (duplicates are rejected)
- `Circular Date` — required, entered as `DD-MM-YYYY` (ISO `YYYY-MM-DD` also accepted); stored as `YYYY-MM-DD`
- `Title` — required
- `Category` — `Examination Notification`, `Hall Ticket Notification`, `Practical Examination`, `Evaluation`, `Result Notification`, `Supplementary Notification`, or `General Circular`
- `Status` — `Draft`, `Published`, or `Archived`
- Rows that violate a rule are reported individually in `errors` (row number prefixed); the remaining valid rows are still imported
- Rows whose full data matches a record that already exists for the institution (or an earlier row in the same file) are **duplicates**: they are skipped and reported via `duplicatesCount` + `duplicateMessages` instead of being stored again
- `Circular Number` must be unique per institution — an already-existing number is treated as a duplicate (ignored + reported) rather than a failure

---

## 6. Module 3: Result Publications

### Slug: `result-publications`

**Module Purpose:** Publish institution-level examination results. Upload official result gazettes for accreditation purposes. Supports evidence upload (result gazette + result summary).

**Evidence Upload:** Enabled — two sections:
- `result-gazette` (PDF only)
- `result-summary` (PDF, XLSX, XLS, CSV, PNG, JPG/JPEG)

---

### 6.1 DTO Schema: `ResultPublicationRequestDTO` / `ResultPublicationResponseDTO`

Derived from `resultPublicationsConfig.fields[].key` and `ResultPublication` interface.

| Field Key               | Type    | Required | Validation                                              |
|-------------------------|---------|----------|---------------------------------------------------------|
| `academicYear`          | String  | Yes      | Pattern `^\d{4}-\d{2}$`                                |
| `semester`              | String  | Yes      | Enum: `"1"` to `"8"`                                   |
| `examinationType`       | String  | Yes      | Enum: `"Internal Assessment"`, `"End Semester Examination"`, `"Supplementary Examination"` |
| `program`               | String  | Yes      | NotBlank, max 200 chars                                 |
| `title`                 | String  | Yes      | NotBlank, max 500 chars                                 |
| `publicationDate`       | Date    | Yes      | ISO `YYYY-MM-DD`                                        |
| `totalStudentsAppeared` | Integer | No       | Min 0                                                   |
| `totalStudentsPassed`   | Integer | No       | Min 0, must be <= `totalStudentsAppeared`               |
| `passPercentage`        | Decimal | No       | Min 0.0, Max 100.0. Auto-computed if not provided.      |
| `status`                | String  | Yes      | Enum: `"Draft"`, `"Published"`, `"Archived"`            |

**Response-Only Fields:**

| Field Key             | Type     | Description                         |
|-----------------------|----------|-------------------------------------|
| `id`                  | String   | UUID                                |
| `resultGazette`       | String   | URL to uploaded result gazette PDF  |
| `resultSummary`       | String   | URL to uploaded result summary file |
| `supportingDocuments` | String[] | Additional doc URLs                 |
| `evidenceCount`       | Integer  | Total evidence files linked         |
| `createdAt`           | DateTime | Creation timestamp                  |
| `updatedAt`           | DateTime | Last updated timestamp              |

---

### 6.2 Create Result Publication — `POST /api/v1/examination-officer/result-publications`

**Request Body:**
```json
{
  "academicYear": "2023-24",
  "semester": "4",
  "examinationType": "End Semester Examination",
  "program": "B.Tech CSE AI R22",
  "title": "End Semester Results - Even Sem 2024",
  "publicationDate": "2024-06-15",
  "totalStudentsAppeared": 118,
  "totalStudentsPassed": 100,
  "passPercentage": 84.74,
  "status": "Published"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Result publication created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "academicYear": "2023-24",
    "semester": "4",
    "examinationType": "End Semester Examination",
    "program": "B.Tech CSE AI R22",
    "title": "End Semester Results - Even Sem 2024",
    "publicationDate": "2024-06-15",
    "totalStudentsAppeared": 118,
    "totalStudentsPassed": 100,
    "passPercentage": 84.74,
    "status": "Published",
    "resultGazette": null,
    "resultSummary": null,
    "supportingDocuments": [],
    "evidenceCount": 0,
    "createdAt": "2026-08-01T12:00:00",
    "updatedAt": "2026-08-01T12:00:00"
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

### 6.3 CSV Upload — `POST /api/v1/examination-officer/result-publications/upload`

**Content-Type:** `multipart/form-data`
- `file` (MultipartFile, Required): CSV file
- `academicYear` (String, Required)

**Expected CSV Columns:**
```
Academic Year,Semester,Examination Type,Program,Title,Publication Date,Total Students Appeared,Total Students Passed,Pass Percentage,Status
```

**Template endpoint:** `GET /api/v1/examination-officer/result-publications/template` — downloads a header-only CSV template.

**Row validation rules (per row):**
- `Academic Year` — `YYYY-YY` format; must match the `academicYear` query parameter (blank falls back to it)
- `Semester` — one of `1`–`8`
- `Examination Type` — `Internal Assessment`, `End Semester Examination`, or `Supplementary Examination`
- `Program`, `Title`, `Publication Date`, `Status` — required (`Publication Date` entered as `DD-MM-YYYY`, ISO `YYYY-MM-DD` also accepted; stored as `YYYY-MM-DD`)
- `Status` — `Draft`, `Published`, or `Archived`
- `Total Students Appeared` / `Total Students Passed` — optional non-negative integers; `Passed` cannot exceed `Appeared`
- `Pass Percentage` — optional, between `0.0` and `100.0`; auto-calculated from `Passed / Appeared` when blank
- Rows that violate a rule are reported individually in `errors` (row number prefixed); the remaining valid rows are still imported
- Rows whose full data matches a record that already exists for the institution (or an earlier row in the same file) are **duplicates**: they are skipped and reported via `duplicatesCount` + `duplicateMessages` instead of being stored again

---

## 7. Module 4: Supplementary Examinations

### Slug: `supplementary-examinations`

**Module Purpose:** Maintain supplementary examination information as repository management. Supports evidence upload (notification + schedule).

**Evidence Upload:** Enabled — two sections:
- `notification` (PDF, DOCX, PNG, JPG/JPEG)
- `schedule` (PDF, DOCX, XLSX, XLS)

---

### 7.1 DTO Schema: `SupplementaryExaminationRequestDTO` / `SupplementaryExaminationResponseDTO`

Derived from `supplementaryExaminationsConfig.fields[].key` and `SupplementaryExamination` interface.

| Field Key         | Type   | Required | Validation                                              |
|-------------------|--------|----------|---------------------------------------------------------|
| `academicYear`    | String | Yes      | Pattern `^\d{4}-\d{2}$`                                |
| `semester`        | String | Yes      | Enum: `"1"` to `"8"`                                   |
| `program`         | String | Yes      | NotBlank, max 200 chars                                 |
| `examinationName` | String | Yes      | NotBlank, max 500 chars                                 |
| `startDate`       | Date   | Yes      | ISO `YYYY-MM-DD`, must be before `endDate`              |
| `endDate`         | Date   | Yes      | ISO `YYYY-MM-DD`, must be after `startDate`             |
| `status`          | String | Yes      | Enum: `"Draft"`, `"Published"`, `"Archived"`            |

**Response-Only Fields:**

| Field Key             | Type     | Description                       |
|-----------------------|----------|-----------------------------------|
| `id`                  | String   | UUID                              |
| `notification`        | String   | URL to uploaded notification file |
| `schedule`            | String   | URL to uploaded schedule file     |
| `supportingDocuments` | String[] | Additional doc URLs               |
| `evidenceCount`       | Integer  | Total evidence files              |
| `createdAt`           | DateTime | Creation timestamp                |
| `updatedAt`           | DateTime | Last updated timestamp            |

---

### 7.2 Create Supplementary Examination — `POST /api/v1/examination-officer/supplementary-examinations`

**Request Body:**
```json
{
  "academicYear": "2023-24",
  "semester": "4",
  "program": "B.Tech CSE AI R22",
  "examinationName": "Supplementary Examination - Even Sem 2024",
  "startDate": "2024-07-15",
  "endDate": "2024-07-25",
  "status": "Published"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Supplementary examination created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "academicYear": "2023-24",
    "semester": "4",
    "program": "B.Tech CSE AI R22",
    "examinationName": "Supplementary Examination - Even Sem 2024",
    "startDate": "2024-07-15",
    "endDate": "2024-07-25",
    "status": "Published",
    "notification": null,
    "schedule": null,
    "supportingDocuments": [],
    "evidenceCount": 0,
    "createdAt": "2026-08-01T12:00:00",
    "updatedAt": "2026-08-01T12:00:00"
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

### 7.3 CSV Upload — `POST /api/v1/examination-officer/supplementary-examinations/upload`

**Content-Type:** `multipart/form-data`
- `file` (MultipartFile, Required): CSV file
- `academicYear` (String, Required)

**Expected CSV Columns:**
```
Academic Year,Semester,Program,Start Date,End Date,Total Students Appeared,Total Students Passed
```

**Optional columns (read when present, never required):** `Examination Name`, `Pass Percentage`, `Status`.

**Template endpoint:** `GET /api/v1/examination-officer/supplementary-examinations/template` — downloads a header-only CSV template.

**Row validation rules (per row):**
- `Academic Year` — `YYYY-YY` format; must match the `academicYear` query parameter (blank falls back to it)
- `Semester` — one of `1`–`8`
- `Program` — required
- `Start Date` / `End Date` — required, entered as `DD-MM-YYYY` (ISO `YYYY-MM-DD` also accepted); stored as `YYYY-MM-DD`; `End Date` must be after `Start Date`
- `Total Students Appeared` / `Total Students Passed` — optional non-negative integers; `Passed` cannot exceed `Appeared`
- `Examination Name` — optional, defaults to `Supplementary Examination` when blank
- `Pass Percentage` — optional, between `0.0` and `100.0`; auto-calculated from `Passed / Appeared` when blank
- `Status` — optional, `Draft`, `Published`, or `Archived`; defaults to `Draft` when blank
- Rows that violate a rule are reported individually in `errors` (row number prefixed); the remaining valid rows are still imported
- Rows whose full data matches a record that already exists for the institution (or an earlier row in the same file) are **duplicates**: they are skipped and reported via `duplicatesCount` + `duplicateMessages` instead of being stored again

---

## 8. Module 5: Backlog Repository

### Slug: `backlog-repository`

**Module Purpose:** Maintain institution-level backlog information required for accreditation reports. Includes analytics by subject, department, and semester.

**Evidence Upload:** Not applicable (data-only module)

> **Note:** This module has a dedicated analytics endpoint in addition to standard CRUD. The frontend `BacklogRepository.tsx` renders subject-wise, department-wise, and semester-wise analytics tabs. The backend must expose a dedicated `/analytics` endpoint that returns pre-computed aggregations for all three dimensions.

---

### 8.1 DTO Schema: `BacklogRecordRequestDTO` / `BacklogRecordResponseDTO`

Derived from `backlogRepositoryConfig.fields[].key` and `BacklogRecord` interface.

| Field Key          | Type    | Required | Validation                                              |
|--------------------|---------|----------|---------------------------------------------------------|
| `academicYear`     | String  | Yes      | Pattern `^\d{4}-\d{2}$`                                |
| `semester`         | String  | Yes      | Enum: `"1"` to `"8"`                                   |
| `program`          | String  | Yes      | NotBlank, max 200 chars                                 |
| `department`       | String  | Yes      | NotBlank, max 200 chars                                 |
| `subjectCode`      | String  | Yes      | NotBlank, max 50 chars                                  |
| `subjectName`      | String  | Yes      | NotBlank, max 300 chars                                 |
| `studentsAppeared` | Integer | Yes      | Min 0                                                   |
| `studentsPassed`   | Integer | Yes      | Min 0, must be <= `studentsAppeared`                    |
| `studentsFailed`   | Integer | Yes      | Min 0. Must equal `studentsAppeared - studentsPassed`.  |

**Response-Only Fields:**

| Field Key        | Type    | Description                                                       |
|------------------|---------|-------------------------------------------------------------------|
| `id`             | String  | UUID                                                              |
| `passPercentage` | Decimal | Auto-computed: `(studentsPassed / studentsAppeared) * 100`        |
| `failPercentage` | Decimal | Auto-computed: `(studentsFailed / studentsAppeared) * 100`        |

---

### 8.2 Create Backlog Record — `POST /api/v1/examination-officer/backlog-repository`

**Request Body:**
```json
{
  "academicYear": "2023-24",
  "semester": "4",
  "program": "B.Tech CSE AI R22",
  "department": "Computer Science",
  "subjectCode": "CS401",
  "subjectName": "Machine Learning",
  "studentsAppeared": 28,
  "studentsPassed": 22,
  "studentsFailed": 6
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Backlog record created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "academicYear": "2023-24",
    "semester": "4",
    "program": "B.Tech CSE AI R22",
    "department": "Computer Science",
    "subjectCode": "CS401",
    "subjectName": "Machine Learning",
    "studentsAppeared": 28,
    "studentsPassed": 22,
    "studentsFailed": 6,
    "passPercentage": 78.57,
    "failPercentage": 21.43
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

---

### 8.3 Backlog Analytics — `GET /api/v1/examination-officer/backlog-repository/analytics`

**Query Parameters:** `academicYear` (String, Optional), `semester` (String, Optional), `program` (String, Optional)

**Response DTO: `BacklogAnalyticsResponseDTO`**
```json
{
  "success": true,
  "message": "Backlog analytics retrieved successfully",
  "data": {
    "academicYear": "2023-24",
    "summary": {
      "totalStudentsAppeared": 153,
      "totalStudentsPassed": 116,
      "totalStudentsFailed": 37,
      "overallPassPercentage": 75.82
    },
    "subjectWise": [
      {
        "subjectCode": "CS401",
        "subjectName": "Machine Learning",
        "studentsAppeared": 28,
        "studentsPassed": 22,
        "studentsFailed": 6,
        "passPercentage": 78.57
      }
    ],
    "departmentWise": [
      {
        "department": "Computer Science",
        "studentsAppeared": 133,
        "studentsPassed": 100,
        "studentsFailed": 33,
        "passPercentage": 75.19
      }
    ],
    "semesterWise": [
      {
        "semester": "Sem 4",
        "studentsAppeared": 123,
        "studentsPassed": 98,
        "studentsFailed": 25,
        "passPercentage": 79.67
      }
    ]
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

**Expected CSV Columns for Bulk Upload:**
```
Academic Year,Semester,Program,Department,Subject Code,Subject Name,Students Appeared,Students Passed,Students Failed
```

---

## 9. Evidence Repository APIs

Evidence documents are attached to individual records in specific modules. The following four modules support evidence upload:

| Module Slug                  | Evidence Sections                     |
|------------------------------|---------------------------------------|
| `examination-schedules`      | `schedule-document`                   |
| `examination-circulars`      | `circular-pdf`                        |
| `result-publications`        | `result-gazette`, `result-summary`    |
| `supplementary-examinations` | `notification`, `schedule`            |

---

### 9.1 Upload Evidence Document

**`POST /api/v1/examination-officer/evidence/upload`**

**Query Parameters:**
| Parameter    | Type   | Required | Description         |
|--------------|--------|----------|---------------------|
| `uploadedBy` | String | Yes      | Username or user ID |

**Multipart Form-Data:**
| Field          | Type          | Required | Description                                                   |
|----------------|---------------|----------|---------------------------------------------------------------|
| `file`         | MultipartFile | Yes      | The evidence file to upload                                   |
| `academicYear` | String        | Yes      | Academic year context                                         |
| `moduleId`     | String        | Yes      | e.g. `"examination-schedules"`                                |
| `recordId`     | String        | Yes      | UUID of the parent record                                     |
| `sectionId`    | String        | Yes      | e.g. `"schedule-document"`, `"circular-pdf"`, `"result-gazette"`, `"result-summary"`, `"notification"`, `"schedule"` |
| `recordTitle`  | String        | No       | Human-readable record title for display                       |

**Accepted File Types by Section:**
```
schedule-document  ->  .pdf, .docx, .png, .jpg, .jpeg
circular-pdf       ->  .pdf
result-gazette     ->  .pdf
result-summary     ->  .pdf, .xlsx, .xls, .csv, .png, .jpg, .jpeg
notification       ->  .pdf, .docx, .png, .jpg, .jpeg
schedule           ->  .pdf, .docx, .xlsx, .xls
```

**Max file size:** 25 MB

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Evidence document uploaded successfully",
  "data": {
    "id": "ev-001",
    "name": "exam-schedule-even-2024.pdf",
    "size": 204800,
    "type": "application/pdf",
    "moduleId": "examination-schedules",
    "moduleLabel": "Examination Schedules",
    "recordId": "550e8400-e29b-41d4-a716-446655440001",
    "recordTitle": "End Semester Examination - Even Sem 2024",
    "sectionId": "schedule-document",
    "sectionLabel": "Schedule Document",
    "fileUrl": "https://storage.accreditpro.in/evidence/exam-schedule-even-2024.pdf",
    "uploadedBy": "exam.officer@college.edu",
    "uploadedAt": "2026-08-01T12:00:00",
    "academicYear": "2024-25"
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

---

### 9.2 Get Evidence Documents

**`GET /api/v1/examination-officer/evidence`**

**Query Parameters:**
| Parameter      | Type    | Required | Description                    |
|----------------|---------|----------|--------------------------------|
| `academicYear` | String  | No       | Filter by academic year        |
| `moduleId`     | String  | No       | e.g. `"examination-schedules"` |
| `recordId`     | String  | No       | UUID of the parent record      |
| `sectionId`    | String  | No       | e.g. `"schedule-document"`     |
| `page`         | Integer | No       | Default: `0`                   |
| `size`         | Integer | No       | Default: `20`                  |

**Sample Response:**
```json
{
  "success": true,
  "message": "Evidence documents retrieved successfully",
  "data": {
    "content": [
      {
        "id": "ev-001",
        "name": "exam-schedule-even-2024.pdf",
        "size": 204800,
        "type": "application/pdf",
        "moduleId": "examination-schedules",
        "moduleLabel": "Examination Schedules",
        "recordId": "550e8400-e29b-41d4-a716-446655440001",
        "recordTitle": "End Semester Examination - Even Sem 2024",
        "sectionId": "schedule-document",
        "sectionLabel": "Schedule Document",
        "fileUrl": "https://storage.accreditpro.in/evidence/ev-001.pdf",
        "uploadedBy": "exam.officer@college.edu",
        "uploadedAt": "2026-08-01T12:00:00",
        "academicYear": "2024-25"
      }
    ],
    "totalPages": 1,
    "totalElements": 1,
    "number": 0,
    "size": 20
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

---

### 9.3 Delete Evidence Document

**`DELETE /api/v1/examination-officer/evidence/{id}`**

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Evidence document deleted successfully",
  "data": null,
  "timestamp": "2026-08-01T12:00:00"
}
```

---

## 10. Supporting Documents Repository APIs

The **Supporting Documents** view manages institutional-level policy documents stored in categorized folders. These are standalone documents not linked to individual module records.

**Document Folder Categories** (from `documentFolders` in `examination-configs.ts`):

| Category ID                  | Label                     | Description                                         |
|------------------------------|---------------------------|-----------------------------------------------------|
| `examination-policy`         | Examination Policy        | Institutional examination policies and guidelines   |
| `examination-manual`         | Examination Manual        | Examination conduct manuals and SOPs                |
| `circulars`                  | Circulars                 | All examination circulars and notifications archive |
| `notifications`              | Notifications             | Examination notifications and public notices        |
| `schedules`                  | Schedules                 | Examination schedules and timetables archive        |
| `result-gazettes`            | Result Gazettes           | Published result gazettes and summaries             |
| `university-communications`  | University Communications | Communications from affiliated university           |
| `committee-meeting-minutes`  | Committee Meeting Minutes | Examination committee meeting minutes               |
| `other-supporting-documents` | Other Supporting Documents| Miscellaneous examination-related documents         |

---

### 10.1 Upload Supporting Document

**`POST /api/v1/examination-officer/supporting-documents/upload`**

**Query Parameters:** `uploadedBy` (String, Required)

**Multipart Form-Data:**
| Field          | Type          | Required | Description                                                 |
|----------------|---------------|----------|-------------------------------------------------------------|
| `file`         | MultipartFile | Yes      | The document file                                           |
| `title`        | String        | Yes      | Display title                                               |
| `description`  | String        | No       | Document description                                        |
| `category`     | String        | Yes      | One of the 9 category IDs above                             |
| `academicYear` | String        | Yes      | e.g. `"2024-25"`                                            |
| `tags`         | String        | No       | Comma-separated tags e.g. `"policy,examination,guidelines"` |
| `version`      | String        | No       | Document version e.g. `"2.1"`                               |

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Supporting document uploaded successfully",
  "data": {
    "id": "doc-001",
    "category": "examination-policy",
    "title": "Examination Policy 2024",
    "description": "Comprehensive examination policy document approved by Academic Council",
    "academicYear": "2024-25",
    "tags": ["policy", "examination", "guidelines"],
    "version": "2.1",
    "fileUrl": "https://storage.accreditpro.in/documents/doc-001.pdf",
    "uploadedBy": "exam.officer@college.edu",
    "uploadedAt": "2024-06-01T10:00:00"
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

---

### 10.2 Get Supporting Documents (List / By Category)

**`GET /api/v1/examination-officer/supporting-documents`**

**Query Parameters:**
| Parameter      | Type    | Required | Description                              |
|----------------|---------|----------|------------------------------------------|
| `category`     | String  | No       | One of the 9 category IDs               |
| `academicYear` | String  | No       | Filter by academic year                  |
| `search`       | String  | No       | Search in title, description, tags       |
| `page`         | Integer | No       | Default: `0`                             |
| `size`         | Integer | No       | Default: `20`                            |

---

### 10.3 Get Supporting Document Folders Summary

**`GET /api/v1/examination-officer/supporting-documents/folders`**

Returns a summary of each folder with document count. Used for the folder grid view in the frontend.

**Response DTO: `DocumentFolderSummaryResponseDTO`**
```json
{
  "success": true,
  "message": "Document folders retrieved successfully",
  "data": [
    {
      "id": "examination-policy",
      "category": "examination-policy",
      "label": "Examination Policy",
      "description": "Institutional examination policies and guidelines",
      "documentCount": 3,
      "lastUpdated": "2024-06-01T10:00:00"
    },
    {
      "id": "examination-manual",
      "category": "examination-manual",
      "label": "Examination Manual",
      "description": "Examination conduct manuals and SOPs",
      "documentCount": 2,
      "lastUpdated": "2024-06-15T10:00:00"
    }
  ],
  "timestamp": "2026-08-01T12:00:00"
}
```

---

### 10.4 Delete Supporting Document

**`DELETE /api/v1/examination-officer/supporting-documents/{id}`**

```json
{
  "success": true,
  "message": "Supporting document deleted successfully",
  "data": null,
  "timestamp": "2026-08-01T12:00:00"
}
```

---

## 11. Global Search API

**`GET /api/v1/examination-officer/search`**

Searches across all 5 modules simultaneously. Used by the `GlobalSearch` component.

**Query Parameters:**
| Parameter      | Type    | Required | Description                                                     |
|----------------|---------|----------|-----------------------------------------------------------------|
| `query`        | String  | Yes      | Search keyword                                                  |
| `academicYear` | String  | No       | Filter by academic year                                         |
| `moduleId`     | String  | No       | Restrict to one module slug (e.g. `"examination-schedules"`)    |
| `page`         | Integer | No       | Default: `0`                                                    |
| `size`         | Integer | No       | Default: `50`                                                   |

**Module IDs accepted for `moduleId` filter:**
- `examination-schedules`
- `examination-circulars`
- `result-publications`
- `supplementary-examinations`
- `backlog-repository`

**Response DTO: `GlobalSearchResponseDTO`**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "query": "2024-25",
    "totalResults": 12,
    "results": [
      {
        "moduleId": "examination-schedules",
        "moduleLabel": "Examination Schedules",
        "recordId": "550e8400-e29b-41d4-a716-446655440001",
        "recordTitle": "End Semester Examination - Even Sem 2024",
        "matchedFields": {
          "academicYear": "2024-25",
          "title": "End Semester Examination - Even Sem 2024"
        },
        "status": "Published",
        "academicYear": "2024-25"
      }
    ],
    "moduleCounts": {
      "examination-schedules": 2,
      "examination-circulars": 3,
      "result-publications": 4,
      "supplementary-examinations": 2,
      "backlog-repository": 1
    }
  },
  "timestamp": "2026-08-01T12:00:00"
}
```

---

## 12. Enum Reference Tables

### 12.1 Examination Type
| Frontend Display Value            | Backend Java Enum Constant    |
|-----------------------------------|-------------------------------|
| `"Internal Assessment"`           | `INTERNAL_ASSESSMENT`         |
| `"End Semester Examination"`      | `END_SEMESTER_EXAMINATION`    |
| `"Supplementary Examination"`     | `SUPPLEMENTARY_EXAMINATION`   |

### 12.2 Record Status
| Frontend Display Value | Backend Java Enum Constant |
|------------------------|----------------------------|
| `"Draft"`              | `DRAFT`                    |
| `"Published"`          | `PUBLISHED`                |
| `"Archived"`           | `ARCHIVED`                 |

### 12.3 Circular Category
| Frontend Display Value           | Backend Java Enum Constant   |
|----------------------------------|------------------------------|
| `"Examination Notification"`     | `EXAMINATION_NOTIFICATION`   |
| `"Hall Ticket Notification"`     | `HALL_TICKET_NOTIFICATION`   |
| `"Practical Examination"`        | `PRACTICAL_EXAMINATION`      |
| `"Evaluation"`                   | `EVALUATION`                 |
| `"Result Notification"`          | `RESULT_NOTIFICATION`        |
| `"Supplementary Notification"`   | `SUPPLEMENTARY_NOTIFICATION` |
| `"General Circular"`             | `GENERAL_CIRCULAR`           |

### 12.4 Semester
| Frontend Value | Backend Java Enum Constant |
|----------------|----------------------------|
| `"1"` to `"8"` | `SEM_1` to `SEM_8`         |

### 12.5 Supporting Document Category
| Frontend/API Category ID         | Backend Java Enum Constant       |
|----------------------------------|----------------------------------|
| `"examination-policy"`           | `EXAMINATION_POLICY`             |
| `"examination-manual"`           | `EXAMINATION_MANUAL`             |
| `"circulars"`                    | `CIRCULARS`                      |
| `"notifications"`                | `NOTIFICATIONS`                  |
| `"schedules"`                    | `SCHEDULES`                      |
| `"result-gazettes"`              | `RESULT_GAZETTES`                |
| `"university-communications"`    | `UNIVERSITY_COMMUNICATIONS`      |
| `"committee-meeting-minutes"`    | `COMMITTEE_MEETING_MINUTES`      |
| `"other-supporting-documents"`   | `OTHER_SUPPORTING_DOCUMENTS`     |

---

## 13. Entity Design (JPA)

### 13.1 `ExaminationSchedule` Entity

```java
@Entity
@Table(name = "examination_schedules")
public class ExaminationSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 10)
    private String academicYear;

    @Column(nullable = false, length = 2)
    private String semester;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ExaminationType examinationType;

    @Column(nullable = false, length = 200)
    private String program;

    @Column(length = 200)
    private String department;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecordStatus status;

    @Column(length = 1000)
    private String schedulePdf;

    @ElementCollection
    @CollectionTable(name = "exam_schedule_supporting_docs")
    private List<String> supportingDocuments = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### 13.2 `ExaminationCircular` Entity

```java
@Entity
@Table(name = "examination_circulars")
public class ExaminationCircular {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String circularNumber;

    @Column(nullable = false)
    private LocalDate circularDate;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CircularCategory category;

    @Column(length = 1000)
    private String pdf;

    @ElementCollection
    @CollectionTable(name = "exam_circular_supporting_docs")
    private List<String> supportingDocuments = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecordStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### 13.3 `ResultPublication` Entity

```java
@Entity
@Table(name = "result_publications")
public class ResultPublication {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 10)
    private String academicYear;

    @Column(nullable = false, length = 2)
    private String semester;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ExaminationType examinationType;

    @Column(nullable = false, length = 200)
    private String program;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false)
    private LocalDate publicationDate;

    private Integer totalStudentsAppeared;
    private Integer totalStudentsPassed;

    @Column(precision = 5, scale = 2)
    private BigDecimal passPercentage;

    @Column(length = 1000)
    private String resultGazette;

    @Column(length = 1000)
    private String resultSummary;

    @ElementCollection
    @CollectionTable(name = "result_publication_supporting_docs")
    private List<String> supportingDocuments = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecordStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### 13.4 `SupplementaryExamination` Entity

```java
@Entity
@Table(name = "supplementary_examinations")
public class SupplementaryExamination {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 10)
    private String academicYear;

    @Column(nullable = false, length = 2)
    private String semester;

    @Column(nullable = false, length = 200)
    private String program;

    @Column(nullable = false, length = 500)
    private String examinationName;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(length = 1000)
    private String notification;

    @Column(length = 1000)
    private String schedule;

    @ElementCollection
    @CollectionTable(name = "supplementary_exam_supporting_docs")
    private List<String> supportingDocuments = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecordStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### 13.5 `BacklogRecord` Entity

```java
@Entity
@Table(
    name = "backlog_records",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"academicYear", "semester", "program", "department", "subjectCode"}
    )
)
public class BacklogRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 10)
    private String academicYear;

    @Column(nullable = false, length = 2)
    private String semester;

    @Column(nullable = false, length = 200)
    private String program;

    @Column(nullable = false, length = 200)
    private String department;

    @Column(nullable = false, length = 50)
    private String subjectCode;

    @Column(nullable = false, length = 300)
    private String subjectName;

    @Column(nullable = false)
    private int studentsAppeared;

    @Column(nullable = false)
    private int studentsPassed;

    @Column(nullable = false)
    private int studentsFailed;
}
```

### 13.6 `ExaminationEvidenceFile` Entity

```java
@Entity
@Table(name = "examination_evidence_files")
public class ExaminationEvidenceFile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false)
    private long size;

    @Column(nullable = false, length = 100)
    private String type;         // MIME type

    @Column(nullable = false, length = 50)
    private String moduleId;     // e.g. "examination-schedules"

    @Column(nullable = false, length = 100)
    private String moduleLabel;

    @Column(nullable = false)
    private String recordId;     // FK to parent record UUID

    @Column(length = 500)
    private String recordTitle;  // Display title

    @Column(nullable = false, length = 50)
    private String sectionId;    // e.g. "schedule-document"

    @Column(length = 100)
    private String sectionLabel;

    @Column(nullable = false, length = 1000)
    private String fileUrl;      // Cloud storage URL

    @Column(nullable = false, length = 100)
    private String uploadedBy;

    @CreationTimestamp
    private LocalDateTime uploadedAt;

    @Column(length = 10)
    private String academicYear;
}
```

### 13.7 `SupportingDocument` Entity

```java
@Entity
@Table(name = "supporting_documents")
public class SupportingDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private SupportingDocCategory category;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 10)
    private String academicYear;

    @ElementCollection
    @CollectionTable(name = "supporting_doc_tags")
    private List<String> tags = new ArrayList<>();

    @Column(length = 20)
    private String version;

    @Column(length = 1000)
    private String fileUrl;

    @Column(nullable = false, length = 100)
    private String uploadedBy;

    @CreationTimestamp
    private LocalDateTime uploadedAt;
}
```

---

## 14. Swagger / OpenAPI Annotations Reference

All controllers must use the following OpenAPI annotations:

```java
@Tag(name = "EO - Examination Repository")
@RestController
@RequestMapping("/api/v1/examination-officer")
@SecurityRequirement(name = "bearerAuth")
public class ExaminationScheduleController {

    @Operation(
        summary = "Get paginated list of examination schedules",
        description = "Returns paginated examination schedules filtered by academic year, semester, program, and status"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Schedules retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
        @ApiResponse(responseCode = "403", description = "Forbidden - User does not have EXAMINATION_OFFICER role")
    })
    @GetMapping("/examination-schedules")
    public ResponseEntity<ApiResponse<Page<ExaminationScheduleResponseDTO>>> getSchedules(...) { ... }

    @Operation(summary = "Create a new examination schedule")
    @PostMapping("/examination-schedules")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ApiResponse<ExaminationScheduleResponseDTO>> createSchedule(
        @Valid @RequestBody ExaminationScheduleRequestDTO request
    ) { ... }

    @Operation(summary = "Update an existing examination schedule by ID")
    @PutMapping("/examination-schedules/{id}")
    public ResponseEntity<ApiResponse<ExaminationScheduleResponseDTO>> updateSchedule(
        @PathVariable String id,
        @Valid @RequestBody ExaminationScheduleRequestDTO request
    ) { ... }

    @Operation(summary = "Delete an examination schedule by ID")
    @DeleteMapping("/examination-schedules/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable String id) { ... }

    @Operation(summary = "Bulk import schedules via CSV file upload")
    @PostMapping(value = "/examination-schedules/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CsvUploadResultDTO>> uploadSchedulesCsv(
        @RequestPart("file") MultipartFile file,
        @RequestParam String academicYear
    ) { ... }

    @Operation(summary = "Export schedules as CSV")
    @GetMapping(value = "/examination-schedules/export", produces = "text/csv")
    public ResponseEntity<byte[]> exportSchedulesCsv(...) { ... }
}
```

---

## 15. Service Layer Contracts

### 15.1 `ExaminationScheduleService`
```java
public interface ExaminationScheduleService {
    Page<ExaminationScheduleResponseDTO> getSchedules(ScheduleFilterParams params, Pageable pageable);
    ExaminationScheduleResponseDTO getScheduleById(String id);
    ExaminationScheduleResponseDTO createSchedule(ExaminationScheduleRequestDTO request);
    ExaminationScheduleResponseDTO updateSchedule(String id, ExaminationScheduleRequestDTO request);
    void deleteSchedule(String id);
    CsvUploadResultDTO uploadCsv(MultipartFile file, String academicYear);
    byte[] exportCsv(ScheduleFilterParams params);
}
```

### 15.2 `ExaminationCircularService`
```java
public interface ExaminationCircularService {
    Page<ExaminationCircularResponseDTO> getCirculars(CircularFilterParams params, Pageable pageable);
    ExaminationCircularResponseDTO getCircularById(String id);
    ExaminationCircularResponseDTO createCircular(ExaminationCircularRequestDTO request);
    ExaminationCircularResponseDTO updateCircular(String id, ExaminationCircularRequestDTO request);
    void deleteCircular(String id);
    CsvUploadResultDTO uploadCsv(MultipartFile file);
    byte[] exportCsv(CircularFilterParams params);
}
```

### 15.3 `ResultPublicationService`
```java
public interface ResultPublicationService {
    Page<ResultPublicationResponseDTO> getResults(ResultFilterParams params, Pageable pageable);
    ResultPublicationResponseDTO getResultById(String id);
    ResultPublicationResponseDTO createResult(ResultPublicationRequestDTO request);
    ResultPublicationResponseDTO updateResult(String id, ResultPublicationRequestDTO request);
    void deleteResult(String id);
    CsvUploadResultDTO uploadCsv(MultipartFile file, String academicYear);
    byte[] exportCsv(ResultFilterParams params);
}
```

### 15.4 `SupplementaryExaminationService`
```java
public interface SupplementaryExaminationService {
    Page<SupplementaryExaminationResponseDTO> getExaminations(SupplementaryFilterParams params, Pageable pageable);
    SupplementaryExaminationResponseDTO getExaminationById(String id);
    SupplementaryExaminationResponseDTO createExamination(SupplementaryExaminationRequestDTO request);
    SupplementaryExaminationResponseDTO updateExamination(String id, SupplementaryExaminationRequestDTO request);
    void deleteExamination(String id);
    CsvUploadResultDTO uploadCsv(MultipartFile file, String academicYear);
    byte[] exportCsv(SupplementaryFilterParams params);
}
```

### 15.5 `BacklogRecordService`
```java
public interface BacklogRecordService {
    Page<BacklogRecordResponseDTO> getRecords(BacklogFilterParams params, Pageable pageable);
    BacklogRecordResponseDTO getRecordById(String id);
    BacklogRecordResponseDTO createRecord(BacklogRecordRequestDTO request);
    BacklogRecordResponseDTO updateRecord(String id, BacklogRecordRequestDTO request);
    void deleteRecord(String id);
    BacklogAnalyticsResponseDTO getAnalytics(String academicYear, String semester, String program);
    CsvUploadResultDTO uploadCsv(MultipartFile file, String academicYear);
    byte[] exportCsv(BacklogFilterParams params);
}
```

### 15.6 `ExaminationEvidenceService`
```java
public interface ExaminationEvidenceService {
    ExaminationEvidenceFileResponseDTO uploadEvidence(MultipartFile file, EvidenceUploadRequestDTO params, String uploadedBy);
    Page<ExaminationEvidenceFileResponseDTO> getEvidence(EvidenceFilterParams params, Pageable pageable);
    void deleteEvidence(String id);
}
```

### 15.7 `SupportingDocumentService`
```java
public interface SupportingDocumentService {
    SupportingDocumentResponseDTO uploadDocument(MultipartFile file, SupportingDocUploadRequestDTO params, String uploadedBy);
    Page<SupportingDocumentResponseDTO> getDocuments(SupportingDocFilterParams params, Pageable pageable);
    List<DocumentFolderSummaryResponseDTO> getFoldersSummary();
    void deleteDocument(String id);
}
```

---

## 16. Complete API Route Summary

| Method | Path                                                                    | Description                        |
|--------|-------------------------------------------------------------------------|------------------------------------|
| GET    | `/api/v1/examination-officer/dashboard`                                 | Dashboard stats and activities     |
| GET    | `/api/v1/examination-officer/search`                                    | Global cross-module search         |
| GET    | `/api/v1/examination-officer/examination-schedules`                     | List schedules (paginated)         |
| GET    | `/api/v1/examination-officer/examination-schedules/{id}`                | Get schedule by ID                 |
| POST   | `/api/v1/examination-officer/examination-schedules`                     | Create schedule                    |
| PUT    | `/api/v1/examination-officer/examination-schedules/{id}`                | Update schedule                    |
| DELETE | `/api/v1/examination-officer/examination-schedules/{id}`                | Delete schedule                    |
| POST   | `/api/v1/examination-officer/examination-schedules/upload`              | Bulk CSV import                    |
| GET    | `/api/v1/examination-officer/examination-schedules/export`              | Export CSV                         |
| GET    | `/api/v1/examination-officer/examination-circulars`                     | List circulars (paginated)         |
| GET    | `/api/v1/examination-officer/examination-circulars/{id}`                | Get circular by ID                 |
| POST   | `/api/v1/examination-officer/examination-circulars`                     | Create circular                    |
| PUT    | `/api/v1/examination-officer/examination-circulars/{id}`                | Update circular                    |
| DELETE | `/api/v1/examination-officer/examination-circulars/{id}`                | Delete circular                    |
| POST   | `/api/v1/examination-officer/examination-circulars/upload`              | Bulk CSV import                    |
| GET    | `/api/v1/examination-officer/examination-circulars/template`            | Download CSV template              |
| GET    | `/api/v1/examination-officer/examination-circulars/export`              | Export CSV                         |
| GET    | `/api/v1/examination-officer/result-publications`                       | List result publications (paginated)|
| GET    | `/api/v1/examination-officer/result-publications/{id}`                  | Get result publication by ID       |
| POST   | `/api/v1/examination-officer/result-publications`                       | Create result publication          |
| PUT    | `/api/v1/examination-officer/result-publications/{id}`                  | Update result publication          |
| DELETE | `/api/v1/examination-officer/result-publications/{id}`                  | Delete result publication          |
| POST   | `/api/v1/examination-officer/result-publications/upload`                | Bulk CSV import                    |
| GET    | `/api/v1/examination-officer/result-publications/template`              | Download CSV template              |
| GET    | `/api/v1/examination-officer/result-publications/export`                | Export CSV                         |
| GET    | `/api/v1/examination-officer/supplementary-examinations`                | List supplementary exams (paginated)|
| GET    | `/api/v1/examination-officer/supplementary-examinations/{id}`           | Get supplementary exam by ID       |
| POST   | `/api/v1/examination-officer/supplementary-examinations`                | Create supplementary exam          |
| PUT    | `/api/v1/examination-officer/supplementary-examinations/{id}`           | Update supplementary exam          |
| DELETE | `/api/v1/examination-officer/supplementary-examinations/{id}`           | Delete supplementary exam          |
| POST   | `/api/v1/examination-officer/supplementary-examinations/upload`         | Bulk CSV import                    |
| GET    | `/api/v1/examination-officer/supplementary-examinations/template`       | Download CSV template              |
| GET    | `/api/v1/examination-officer/supplementary-examinations/export`         | Export CSV                         |
| GET    | `/api/v1/examination-officer/backlog-repository`                        | List backlog records (paginated)   |
| GET    | `/api/v1/examination-officer/backlog-repository/{id}`                   | Get backlog record by ID           |
| POST   | `/api/v1/examination-officer/backlog-repository`                        | Create backlog record              |
| PUT    | `/api/v1/examination-officer/backlog-repository/{id}`                   | Update backlog record              |
| DELETE | `/api/v1/examination-officer/backlog-repository/{id}`                   | Delete backlog record              |
| POST   | `/api/v1/examination-officer/backlog-repository/upload`                 | Bulk CSV import                    |
| GET    | `/api/v1/examination-officer/backlog-repository/export`                 | Export CSV                         |
| GET    | `/api/v1/examination-officer/backlog-repository/analytics`              | Backlog analytics (aggregated)     |
| POST   | `/api/v1/examination-officer/evidence/upload`                           | Upload evidence file               |
| GET    | `/api/v1/examination-officer/evidence`                                  | Get evidence files (filtered)      |
| DELETE | `/api/v1/examination-officer/evidence/{id}`                             | Delete evidence file               |
| GET    | `/api/v1/examination-officer/supporting-documents/folders`              | Get folder summaries               |
| GET    | `/api/v1/examination-officer/supporting-documents`                      | Get supporting documents (filtered)|
| POST   | `/api/v1/examination-officer/supporting-documents/upload`               | Upload supporting document         |
| DELETE | `/api/v1/examination-officer/supporting-documents/{id}`                 | Delete supporting document         |

**Total endpoints: 46**

---

## 17. Data Validation Summary

| Validation Rule                                                         | Applies To                                                   |
|-------------------------------------------------------------------------|--------------------------------------------------------------|
| `@NotBlank` on all required String fields                               | All required text fields across all 5 modules                |
| `@NotNull` on all required Date fields                                  | `startDate`, `endDate`, `circularDate`, `publicationDate`    |
| `startDate` must be before `endDate`                                    | `ExaminationSchedule`, `SupplementaryExamination`            |
| `studentsFailed == studentsAppeared - studentsPassed`                   | `BacklogRecord`                                              |
| `studentsPassed <= studentsAppeared`                                    | `BacklogRecord`, `ResultPublication`                         |
| `passPercentage` in range [0.0, 100.0]                                  | `ResultPublication`                                          |
| `academicYear` matches pattern `^\d{4}-\d{2}$`                         | All modules                                                  |
| `semester` must be one of `"1"`,`"2"`,`"3"`,`"4"`,`"5"`,`"6"`,`"7"`,`"8"` | All modules containing `semester` field               |
| `circularNumber` must be unique per institution                         | `ExaminationCircular`                                        |
| File size must not exceed 25 MB                                         | All file upload endpoints                                    |
| File MIME type must match section-specific allowed types                | All evidence upload endpoints                                |

---

## 18. Frontend to Backend Field Mapping Quick Reference

### 18.1 Examination Schedules
| Frontend `field.key` | Backend JSON Key     | DB Column Name          |
|----------------------|----------------------|-------------------------|
| `academicYear`       | `academicYear`       | `academic_year`         |
| `semester`           | `semester`           | `semester`              |
| `examinationType`    | `examinationType`    | `examination_type`      |
| `program`            | `program`            | `program`               |
| `department`         | `department`         | `department`            |
| `title`              | `title`              | `title`                 |
| `description`        | `description`        | `description`           |
| `startDate`          | `startDate`          | `start_date`            |
| `endDate`            | `endDate`            | `end_date`              |
| `status`             | `status`             | `status`                |

### 18.2 Examination Circulars
| Frontend `field.key` | Backend JSON Key     | DB Column Name          |
|----------------------|----------------------|-------------------------|
| `circularNumber`     | `circularNumber`     | `circular_number`       |
| `circularDate`       | `circularDate`       | `circular_date`         |
| `title`              | `title`              | `title`                 |
| `description`        | `description`        | `description`           |
| `category`           | `category`           | `category`              |
| `status`             | `status`             | `status`                |

### 18.3 Result Publications
| Frontend `field.key`    | Backend JSON Key        | DB Column Name               |
|-------------------------|-------------------------|------------------------------|
| `academicYear`          | `academicYear`          | `academic_year`              |
| `semester`              | `semester`              | `semester`                   |
| `examinationType`       | `examinationType`       | `examination_type`           |
| `program`               | `program`               | `program`                    |
| `title`                 | `title`                 | `title`                      |
| `publicationDate`       | `publicationDate`       | `publication_date`           |
| `totalStudentsAppeared` | `totalStudentsAppeared` | `total_students_appeared`    |
| `totalStudentsPassed`   | `totalStudentsPassed`   | `total_students_passed`      |
| `passPercentage`        | `passPercentage`        | `pass_percentage`            |
| `status`                | `status`                | `status`                     |

### 18.4 Supplementary Examinations
| Frontend `field.key` | Backend JSON Key     | DB Column Name          |
|----------------------|----------------------|-------------------------|
| `academicYear`       | `academicYear`       | `academic_year`         |
| `semester`           | `semester`           | `semester`              |
| `program`            | `program`            | `program`               |
| `examinationName`    | `examinationName`    | `examination_name`      |
| `startDate`          | `startDate`          | `start_date`            |
| `endDate`            | `endDate`            | `end_date`              |
| `status`             | `status`             | `status`                |

### 18.5 Backlog Repository
| Frontend `field.key` | Backend JSON Key     | DB Column Name          |
|----------------------|----------------------|-------------------------|
| `academicYear`       | `academicYear`       | `academic_year`         |
| `semester`           | `semester`           | `semester`              |
| `program`            | `program`            | `program`               |
| `department`         | `department`         | `department`            |
| `subjectCode`        | `subjectCode`        | `subject_code`          |
| `subjectName`        | `subjectName`        | `subject_name`          |
| `studentsAppeared`   | `studentsAppeared`   | `students_appeared`     |
| `studentsPassed`     | `studentsPassed`     | `students_passed`       |
| `studentsFailed`     | `studentsFailed`     | `students_failed`       |

---

*Document generated by AccreditPro frontend code analysis — Examination Repository module. Source files analyzed: `examination-configs.ts`, `types.ts`, `evidence-store.tsx`, `ExaminationRepositoryPage.tsx`, `DataTableModule.tsx`, `BacklogRepository.tsx`, `ExaminationEvidenceDialog.tsx`, `ExaminationDocumentsView.tsx`, `GlobalSearch.tsx`, `ExaminationDashboard.tsx`. All DTO keys are derived directly from the frontend source of truth to ensure zero field-name drift between frontend and backend.*

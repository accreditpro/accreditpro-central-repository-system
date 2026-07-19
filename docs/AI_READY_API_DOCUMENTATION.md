# AccreditPro - Department Coordinator API (AI-Ready Documentation)

> **Generated:** July 14, 2026  
> **Purpose:** Machine-parsable, zero-ambiguity reference for every department-coordinator-scoped endpoint.  
> **Base URL:** `http://localhost:8080`

---

## Table of Contents

1. [Global Wrapper & Pagination](#1-global-wrapper--pagination)
2. [Common Enums](#2-common-enums)
3. [Faculty Repository](#3-faculty-repository)
4. [Student Repository](#4-student-repository)
5. [Academic Repository](#5-academic-repository)
6. [Research Repository](#6-research-repository)
7. [Alumni Repository](#7-alumni-repository)
8. [Evidence Documents](#8-evidence-documents)
9. [Workflow](#9-workflow)
10. [Repository Metrics](#10-repository-metrics)

---

## 1. Global Wrapper & Pagination

### 1.1 Standard Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { },
  "timestamp": "2026-07-14T10:30:00"
}
```

### 1.2 Standard Error Response

```json
{
  "success": false,
  "message": "Descriptive error message",
  "data": null,
  "timestamp": "2026-07-14T10:30:00"
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
  "timestamp": "2026-07-14T10:30:00"
}
```

---

## 2. Common Enums

### 2.1 `Gender`

| Value | Description |
|-------|-------------|
| `MALE` | Male |
| `FEMALE` | Female |
| `OTHER` | Other |

### 2.2 `Designation`

| Value | Description |
|-------|-------------|
| `PROFESSOR` | Professor |
| `ASSOCIATE_PROFESSOR` | Associate Professor |
| `ASSISTANT_PROFESSOR` | Assistant Professor |

### 2.3 `FacultyStatus`

| Value | Description |
|-------|-------------|
| `ACTIVE` | Currently employed |
| `RELIEVED` | No longer employed |

### 2.4 `EmploymentType`

| Value | Description |
|-------|-------------|
| `REGULAR` | Regular / Permanent |
| `CONTRACT` | Contract basis |
| `VISITING` | Visiting faculty |
| `ADJUNCT` | Adjunct faculty |

### 2.5 `WorkflowStatus`

| Value | Description |
|-------|-------------|
| `DRAFT` | Initial draft |
| `SUBMITTED` | Submitted for review |
| `VALIDATED` | System validated |
| `EVIDENCE_PENDING` | Awaiting evidence |
| `HOD_REVIEW` | Under HOD review |
| `IQAC_VERIFICATION` | Under IQAC verification |
| `APPROVED` | Final approved |
| `REJECTED` | Rejected |

### 2.6 `RepositoryType`

| Value | Description |
|-------|-------------|
| `ACADEMIC` | Academic repository |
| `FACULTY` | Faculty repository |
| `STUDENT` | Student repository |
| `RESEARCH` | Research repository |
| `ALUMNI` | Alumni repository |

### 2.7 `UserRole`

| Value |
|-------|
| `SUPER_ADMIN` |
| `INSTITUTION_ADMIN` |
| `PRINCIPAL` |
| `IQAC_COORDINATOR` |
| `DEPARTMENT_COORDINATOR` |
| `RESEARCH_COORDINATOR` |
| `PLACEMENT_OFFICER` |
| `EXAMINATION_OFFICER` |
| `COMPLIANCE_OFFICER` |

---

## 3. Faculty Repository

All endpoints are scoped under `/api/v1/departments/{departmentId}/faculty`.

**Common Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | ID of the department |

---

### 3.1 LIST Faculty Profiles

```
GET /api/v1/departments/{departmentId}/faculty
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | `0` | Zero-based page number |
| `size` | int | No | `20` | Page size |
| `search` | String | No | — | Search by faculty name or employee ID |
| `designation` | String | No | — | Filter by Designation enum value |
| `status` | String | No | — | Filter by FacultyStatus enum value |

#### Response: `200 OK`

**Wrapper shape:** Paginated (see §1.3). Each content item is a `FacultyProfileResponse`:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 10,
        "employeeId": "EMP001",
        "facultyName": "Dr. Rajesh Kumar",
        "gender": "MALE",
        "dateOfBirth": "1975-03-15",
        "panNumber": "ABCPK1234A",
        "officialEmail": "rajesh.kumar@institution.edu",
        "personalEmail": "rajesh.k@gmail.com",
        "mobileNumber": "9876543210",
        "designation": "PROFESSOR",
        "status": "ACTIVE",
        "photoUrl": null,
        "workflowStatus": "DRAFT",
        "qualifications": [
          {
            "id": 1,
            "facultyId": 1,
            "qualificationLevel": "PhD",
            "degree": "Ph.D. in Computer Science",
            "specialization": "Artificial Intelligence",
            "university": "IIT Delhi",
            "yearOfPassing": 2005,
            "phdStatus": "Completed",
            "phdAwardedDate": "2005-06-15",
            "createdAt": "2026-01-10T10:00:00"
          }
        ],
        "employment": {
          "id": 1,
          "facultyId": 1,
          "employmentType": "REGULAR",
          "facultyCategory": "Full-Time",
          "dateOfJoiningInstitution": "2010-07-01",
          "dateOfJoiningProfession": "2005-08-15",
          "totalExperienceYears": 18,
          "industryExperienceYears": 2,
          "aicteFacultyId": "AICTE001",
          "updatedAt": "2026-01-10T10:00:00"
        },
        "fdps": [
          {
            "id": 1,
            "facultyId": 1,
            "fdpName": "Machine Learning Workshop",
            "organizingBody": "NPTEL",
            "startDate": "2024-01-10",
            "endDate": "2024-01-15",
            "durationDays": 5,
            "mode": "Online",
            "certificationAvailable": true,
            "certificateUrl": "https://example.com/cert.pdf",
            "createdAt": "2026-01-10T10:00:00"
          }
        ],
        "createdAt": "2026-01-10T10:00:00",
        "updatedAt": "2026-01-10T10:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 50,
    "totalPages": 3,
    "last": false,
    "first": true
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `FacultyProfileResponse` fields

| Field | Type | Always present | Description |
|-------|------|----------------|-------------|
| `id` | Long (number) | Yes | Primary key |
| `departmentId` | Long (number) | Yes | Owning department ID |
| `employeeId` | String | Yes | Unique employee ID |
| `facultyName` | String | Yes | Full name |
| `gender` | String (enum) | No | `MALE`, `FEMALE`, `OTHER` |
| `dateOfBirth` | String (date) | No | ISO `YYYY-MM-DD` |
| `panNumber` | String | No | PAN card number |
| `officialEmail` | String | No | Official email |
| `personalEmail` | String | No | Personal email |
| `mobileNumber` | String | No | Mobile number |
| `designation` | String (enum) | No | `PROFESSOR`, `ASSOCIATE_PROFESSOR`, `ASSISTANT_PROFESSOR` |
| `status` | String (enum) | Yes | `ACTIVE`, `RELIEVED` |
| `photoUrl` | String (nullable) | No | Profile photo URL |
| `workflowStatus` | String (enum) | No | See WorkflowStatus enum |
| `qualifications` | Array of QualificationResponse | Yes | May be empty `[]` |
| `employment` | EmploymentResponse (nullable) | No | May be `null` |
| `fdps` | Array of FdpResponse | Yes | May be empty `[]` |
| `createdAt` | String (datetime) | Yes | ISO `YYYY-MM-DDTHH:mm:ss` |
| `updatedAt` | String (datetime) | Yes | ISO `YYYY-MM-DDTHH:mm:ss` |

---

### 3.2 GET Faculty by ID

```
GET /api/v1/departments/{departmentId}/faculty/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `id` | Long | Yes | Faculty profile ID |

#### Response: `200 OK`

Same shape as a single `FacultyProfileResponse` in §3.1 `data` field.

---

### 3.3 CREATE Faculty Profile

```
POST /api/v1/departments/{departmentId}/faculty
```

#### Request Body (JSON)

```json
{
  "employeeId": "EMP002",
  "facultyName": "Dr. Priya Sharma",
  "gender": "FEMALE",
  "dateOfBirth": "1980-08-22",
  "panNumber": "ABCPR5678B",
  "officialEmail": "priya.sharma@institution.edu",
  "personalEmail": "priya.s@gmail.com",
  "mobileNumber": "9876543211",
  "designation": "ASSOCIATE_PROFESSOR",
  "status": "ACTIVE"
}
```

#### Request Body Fields

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `employeeId` | String | **Yes** | — | `@NotBlank` | Unique employee identifier |
| `facultyName` | String | **Yes** | — | `@NotBlank` | Full name |
| `gender` | String | No | — | — | `MALE`, `FEMALE`, `OTHER` |
| `dateOfBirth` | String (date) | No | — | — | ISO `YYYY-MM-DD` |
| `panNumber` | String | No | — | — | PAN card number |
| `officialEmail` | String | No | — | `@Email` | Official email address |
| `personalEmail` | String | No | — | `@Email` | Personal email |
| `mobileNumber` | String | No | — | — | Mobile phone number |
| `designation` | String | No | — | — | `PROFESSOR`, `ASSOCIATE_PROFESSOR`, `ASSISTANT_PROFESSOR` |
| `status` | String | No | `ACTIVE` | — | `ACTIVE`, `RELIEVED` |

#### Response: `201 Created`

```json
{
  "success": true,
  "message": "Faculty profile created successfully",
  "data": {
    "id": 2,
    "departmentId": 10,
    "employeeId": "EMP002",
    "facultyName": "Dr. Priya Sharma",
    "gender": "FEMALE",
    "dateOfBirth": "1980-08-22",
    "panNumber": "ABCPR5678B",
    "officialEmail": "priya.sharma@institution.edu",
    "personalEmail": "priya.s@gmail.com",
    "mobileNumber": "9876543211",
    "designation": "ASSOCIATE_PROFESSOR",
    "status": "ACTIVE",
    "photoUrl": null,
    "workflowStatus": "DRAFT",
    "qualifications": [],
    "employment": null,
    "fdps": [],
    "createdAt": "2026-07-14T10:30:00",
    "updatedAt": "2026-07-14T10:30:00"
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### Enum Values Allowed

`gender` → `MALE`, `FEMALE`, `OTHER`  
`designation` → `PROFESSOR`, `ASSOCIATE_PROFESSOR`, `ASSISTANT_PROFESSOR`  
`status` → `ACTIVE`, `RELIEVED`

---

### 3.4 UPDATE Faculty Profile

```
PUT /api/v1/departments/{departmentId}/faculty/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `id` | Long | Yes | Faculty profile ID to update |

#### Request Body (JSON) — all fields optional

```json
{
  "facultyName": "Dr. Priya Sharma Updated",
  "gender": "FEMALE",
  "dateOfBirth": "1980-08-22",
  "panNumber": "ABCPR5678B",
  "officialEmail": "priya.sharma.updated@institution.edu",
  "personalEmail": "priya.s.updated@gmail.com",
  "mobileNumber": "9876543211",
  "designation": "PROFESSOR",
  "status": "ACTIVE"
}
```

#### Request Body Fields

Same fields as Create (§3.3). All optional; only supplied fields are updated.

#### Response: `200 OK`

Shape: same as `FacultyProfileResponse` in §3.3 data.

---

### 3.5 DELETE Faculty Profile

```
DELETE /api/v1/departments/{departmentId}/faculty/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `id` | Long | Yes | Faculty profile ID to delete |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Faculty profile deleted successfully",
  "data": null,
  "timestamp": "2026-07-14T10:30:00"
}
```

---

### 3.6 LIST Faculty Qualifications

```
GET /api/v1/departments/{departmentId}/faculty/{facultyId}/qualifications
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `facultyId` | Long | Yes | Faculty ID |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": 1,
      "facultyId": 1,
      "qualificationLevel": "PhD",
      "degree": "Ph.D. in Computer Science",
      "specialization": "Artificial Intelligence",
      "university": "IIT Delhi",
      "yearOfPassing": 2005,
      "phdStatus": "Completed",
      "phdAwardedDate": "2005-06-15",
      "createdAt": "2026-01-10T10:00:00"
    }
  ],
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `QualificationResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `facultyId` | Long | Owning faculty ID |
| `qualificationLevel` | String | e.g. `UG`, `PG`, `PhD`, `Post Doctoral` |
| `degree` | String | Degree name |
| `specialization` | String (nullable) | Specialization area |
| `university` | String (nullable) | University name |
| `yearOfPassing` | Integer (nullable) | Year of passing |
| `phdStatus` | String | `Completed`, `Pursuing`, `Not Applicable` |
| `phdAwardedDate` | String (date, nullable) | ISO `YYYY-MM-DD` |
| `createdAt` | String (datetime) | ISO `YYYY-MM-DDTHH:mm:ss` |

---

### 3.7 ADD Faculty Qualification

```
POST /api/v1/departments/{departmentId}/faculty/{facultyId}/qualifications
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `facultyId` | Long | Yes | Faculty ID |

#### Request Body (JSON)

```json
{
  "qualificationLevel": "PhD",
  "degree": "Ph.D. in Computer Science",
  "specialization": "Artificial Intelligence",
  "university": "IIT Bombay",
  "yearOfPassing": 2010,
  "phdStatus": "Completed",
  "phdAwardedDate": "2010-06-20"
}
```

#### Request Body Fields

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `qualificationLevel` | String | **Yes** | — | `@NotBlank` | Level of qualification |
| `degree` | String | **Yes** | — | `@NotBlank` | Degree name |
| `specialization` | String | No | — | — | Area of specialization |
| `university` | String | No | — | — | University name |
| `yearOfPassing` | Integer | No | — | — | Year of passing |
| `phdStatus` | String | No | `Not Applicable` | — | `Completed`, `Pursuing`, `Not Applicable` |
| `phdAwardedDate` | String (date) | No | — | — | ISO `YYYY-MM-DD` |

#### Response: `201 Created`

Same shape as `QualificationResponse` in §3.6.

---

### 3.8 UPDATE Faculty Qualification

```
PUT /api/v1/departments/{departmentId}/faculty/{facultyId}/qualifications/{qualificationId}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `facultyId` | Long | Yes | Faculty ID |
| `qualificationId` | Long | Yes | Qualification ID to update |

#### Request Body

Same schema as §3.7. All fields optional.

#### Response: `200 OK`

Shape: `QualificationResponse` as in §3.6.

---

### 3.9 DELETE Faculty Qualification

```
DELETE /api/v1/departments/{departmentId}/faculty/{facultyId}/qualifications/{qualificationId}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `facultyId` | Long | Yes | Faculty ID |
| `qualificationId` | Long | Yes | Qualification ID to delete |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Qualification deleted successfully",
  "data": null,
  "timestamp": "2026-07-14T10:30:00"
}
```

---

### 3.10 GET Faculty Employment

```
GET /api/v1/departments/{departmentId}/faculty/{facultyId}/employment
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `facultyId` | Long | Yes | Faculty ID |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "facultyId": 1,
    "employmentType": "REGULAR",
    "facultyCategory": "Full-Time",
    "dateOfJoiningInstitution": "2010-07-01",
    "dateOfJoiningProfession": "2005-08-15",
    "totalExperienceYears": 18,
    "industryExperienceYears": 2,
    "aicteFacultyId": "AICTE001",
    "updatedAt": "2026-01-10T10:00:00"
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `EmploymentResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `facultyId` | Long | Owning faculty ID |
| `employmentType` | String (enum) | `REGULAR`, `CONTRACT`, `VISITING`, `ADJUNCT` |
| `facultyCategory` | String (nullable) | e.g. `Full-Time` |
| `dateOfJoiningInstitution` | String (date) | ISO `YYYY-MM-DD` |
| `dateOfJoiningProfession` | String (date, nullable) | ISO `YYYY-MM-DD` |
| `totalExperienceYears` | Integer | Total years of experience |
| `industryExperienceYears` | Integer | Industry experience years |
| `aicteFacultyId` | String (nullable) | AICTE faculty ID |
| `updatedAt` | String (datetime) | ISO `YYYY-MM-DDTHH:mm:ss` |

---

### 3.11 UPDATE Faculty Employment

```
PUT /api/v1/departments/{departmentId}/faculty/{facultyId}/employment
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `facultyId` | Long | Yes | Faculty ID |

#### Request Body (JSON)

```json
{
  "employmentType": "REGULAR",
  "facultyCategory": "Full-Time",
  "dateOfJoiningInstitution": "2010-07-01",
  "dateOfJoiningProfession": "2005-08-15",
  "totalExperienceYears": 19,
  "industryExperienceYears": 3,
  "aicteFacultyId": "AICTE001"
}
```

#### Request Body Fields

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `employmentType` | String | No | — | — | `REGULAR`, `CONTRACT`, `VISITING`, `ADJUNCT` |
| `facultyCategory` | String | No | — | — | Faculty category |
| `dateOfJoiningInstitution` | String (date) | **Yes** | — | `@NotNull` | ISO `YYYY-MM-DD` |
| `dateOfJoiningProfession` | String (date) | No | — | — | ISO `YYYY-MM-DD` |
| `totalExperienceYears` | Integer | No | `0` | — | Total experience in years |
| `industryExperienceYears` | Integer | No | `0` | — | Industry experience in years |
| `aicteFacultyId` | String | No | — | — | AICTE faculty ID |

#### Response: `200 OK`

Shape: `EmploymentResponse` as in §3.10.

---

### 3.12 LIST Faculty FDPs

```
GET /api/v1/departments/{departmentId}/faculty/{facultyId}/fdps
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `facultyId` | Long | Yes | Faculty ID |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": 1,
      "facultyId": 1,
      "fdpName": "Machine Learning Workshop",
      "organizingBody": "NPTEL",
      "startDate": "2024-01-10",
      "endDate": "2024-01-15",
      "durationDays": 5,
      "mode": "Online",
      "certificationAvailable": true,
      "certificateUrl": "https://example.com/cert.pdf",
      "createdAt": "2026-01-10T10:00:00"
    }
  ],
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `FdpResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `facultyId` | Long | Owning faculty ID |
| `fdpName` | String | FDP / training program name |
| `organizingBody` | String (nullable) | Organizing body |
| `startDate` | String (date) | ISO `YYYY-MM-DD` |
| `endDate` | String (date) | ISO `YYYY-MM-DD` |
| `durationDays` | Integer (nullable) | Duration in days |
| `mode` | String | e.g. `Online`, `Offline` |
| `certificationAvailable` | Boolean | Whether certification was provided |
| `certificateUrl` | String (nullable) | URL to certificate |
| `createdAt` | String (datetime) | ISO `YYYY-MM-DDTHH:mm:ss` |

---

### 3.13 ADD Faculty FDP

```
POST /api/v1/departments/{departmentId}/faculty/{facultyId}/fdps
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `facultyId` | Long | Yes | Faculty ID |

#### Request Body (JSON)

```json
{
  "fdpName": "Deep Learning Bootcamp",
  "organizingBody": "IIT Madras",
  "startDate": "2024-06-01",
  "endDate": "2024-06-10",
  "durationDays": 10,
  "mode": "Offline",
  "certificationAvailable": true,
  "certificateUrl": "https://example.com/cert2.pdf"
}
```

#### Request Body Fields

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `fdpName` | String | **Yes** | — | `@NotBlank` | FDP name |
| `organizingBody` | String | No | — | — | Organizing body |
| `startDate` | String (date) | **Yes** | — | `@NotNull` | ISO `YYYY-MM-DD` |
| `endDate` | String (date) | **Yes** | — | `@NotNull` | ISO `YYYY-MM-DD` |
| `durationDays` | Integer | No | — | — | Duration in days |
| `mode` | String | **Yes** | — | `@NotBlank` | `Online` or `Offline` |
| `certificationAvailable` | Boolean | No | `false` | — | `true` / `false` |
| `certificateUrl` | String | No | — | — | Certificate URL |

#### Response: `201 Created`

Shape: `FdpResponse` as in §3.12.

---

### 3.14 UPDATE Faculty FDP

```
PUT /api/v1/departments/{departmentId}/faculty/{facultyId}/fdps/{fdpId}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `facultyId` | Long | Yes | Faculty ID |
| `fdpId` | Long | Yes | FDP ID to update |

#### Request Body

Same schema as §3.13. All fields optional.

#### Response: `200 OK`

Shape: `FdpResponse`.

---

### 3.15 DELETE Faculty FDP

```
DELETE /api/v1/departments/{departmentId}/faculty/{facultyId}/fdps/{fdpId}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `facultyId` | Long | Yes | Faculty ID |
| `fdpId` | Long | Yes | FDP ID to delete |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "FDP deleted successfully",
  "data": null,
  "timestamp": "2026-07-14T10:30:00"
}
```

---

## 4. Student Repository

All endpoints under `/api/v1/departments/{departmentId}/students`.

---

### 4.1 LIST Student Profiles

```
GET /api/v1/departments/{departmentId}/students
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | `0` | Zero-based page number |
| `size` | int | No | `20` | Page size |
| `search` | String | No | — | Search by student name or roll number |
| `status` | String | No | — | `Active`, `Graduated`, `Discontinued` |

#### Response: `200 OK`

**Paginated** `StudentProfileResponse`:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 10,
        "registrationNumber": "REG2024001",
        "studentId": "STU001",
        "rollNumber": "20CS001",
        "studentName": "Amit Sharma",
        "gender": "Male",
        "dateOfBirth": "2002-05-20",
        "aadhaarNumber": "1234-5678-9012",
        "emailAddress": "amit.sharma@student.edu",
        "mobileNumber": "9876543211",
        "programOfferingId": 5,
        "currentSemester": 6,
        "studentStatus": "Active",
        "photoUrl": null,
        "workflowStatus": "DRAFT",
        "admission": {
          "id": 1,
          "studentId": 1,
          "academicYearId": 1,
          "admissionType": "Convener",
          "admissionCategory": "General",
          "admissionRank": 1500,
          "admissionQuota": "State",
          "stateOfOrigin": "Telangana",
          "country": "India",
          "admissionStatus": "Admitted",
          "createdAt": "2026-01-10T10:00:00"
        },
        "diversity": {
          "id": 1,
          "studentId": 1,
          "socialCategory": "General",
          "economicallyWeakerSection": false,
          "minorityStatus": false,
          "differentlyAbled": false,
          "nationality": "Indian",
          "firstGenerationLearner": false,
          "createdAt": "2026-01-10T10:00:00"
        },
        "progression": {
          "id": 1,
          "studentId": 1,
          "academicYearId": 1,
          "placementStatus": "Placed",
          "higherEducationStatus": "Not Pursuing",
          "competitiveExamQualified": "GATE",
          "entrepreneurshipStatus": "No",
          "internshipCompleted": "Yes",
          "createdAt": "2026-01-10T10:00:00"
        },
        "performances": [
          {
            "id": 1,
            "studentId": 1,
            "academicYearId": 1,
            "semester": 5,
            "sgpa": 8.50,
            "cgpa": 8.20,
            "backlogCount": 0,
            "attendancePercentage": 92.50,
            "graduationStatus": "Continuing",
            "createdAt": "2026-01-10T10:00:00"
          }
        ],
        "scholarships": [
          {
            "id": 1,
            "studentId": 1,
            "scholarshipName": "Merit Scholarship",
            "scholarshipType": "Government",
            "provider": "State Government",
            "amount": 50000.00,
            "academicYearId": 1,
            "feeWaiverStatus": "Full Waiver",
            "disbursementStatus": "Disbursed",
            "createdAt": "2026-01-10T10:00:00"
          }
        ],
        "achievements": [
          {
            "id": 1,
            "studentId": 1,
            "achievementType": "Hackathon",
            "achievementName": "Smart India Hackathon Winner",
            "level": "National",
            "awardPosition": "1st Prize",
            "achievementDate": "2024-03-15",
            "academicYearId": 1,
            "organizingBody": "Government of India",
            "createdAt": "2026-01-10T10:00:00"
          }
        ],
        "createdAt": "2026-01-10T10:00:00",
        "updatedAt": "2026-01-10T10:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5,
    "last": false,
    "first": true
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `StudentProfileResponse` fields

| Field | Type | Always present | Description |
|-------|------|----------------|-------------|
| `id` | Long | Yes | Primary key |
| `departmentId` | Long | Yes | Owning department ID |
| `registrationNumber` | String | Yes | Unique registration number |
| `studentId` | String | Yes | Unique student ID |
| `rollNumber` | String | Yes | Roll number |
| `studentName` | String | Yes | Full name |
| `gender` | String | No | `Male`, `Female`, `Other` |
| `dateOfBirth` | String (date) | No | ISO `YYYY-MM-DD` |
| `aadhaarNumber` | String | No | 12-digit Aadhaar number |
| `emailAddress` | String | No | Email address |
| `mobileNumber` | String | No | Mobile number |
| `programOfferingId` | Long (nullable) | No | FK to program offering |
| `currentSemester` | Integer (nullable) | No | Current semester (1-8) |
| `studentStatus` | String | Yes | `Active`, `Graduated`, `Discontinued` |
| `photoUrl` | String (nullable) | No | Profile photo URL |
| `workflowStatus` | String (enum) | No | WorkflowStatus enum |
| `admission` | AdmissionResponse (nullable) | No | Admission details |
| `diversity` | DiversityResponse (nullable) | No | Diversity details |
| `progression` | ProgressionResponse (nullable) | No | Progression details |
| `performances` | Array of PerformanceResponse | Yes | May be empty |
| `scholarships` | Array of ScholarshipResponse | Yes | May be empty |
| `achievements` | Array of StudentAchievementResponse | Yes | May be empty |
| `createdAt` | String (datetime) | Yes | ISO datetime |
| `updatedAt` | String (datetime) | Yes | ISO datetime |

---

### 4.2 GET Student by ID

```
GET /api/v1/departments/{departmentId}/students/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `id` | Long | Yes | Student profile ID |

#### Response: `200 OK`

Single `StudentProfileResponse` object (as in §4.1 data).

---

### 4.3 CREATE Student Profile

```
POST /api/v1/departments/{departmentId}/students
```

#### Request Body (JSON)

```json
{
  "registrationNumber": "REG2024002",
  "studentId": "STU002",
  "rollNumber": "20CS002",
  "studentName": "Neha Patel",
  "gender": "Female",
  "dateOfBirth": "2001-12-10",
  "aadhaarNumber": "9876-5432-1098",
  "emailAddress": "neha.patel@student.edu",
  "mobileNumber": "9876543222",
  "programOfferingId": 5,
  "currentSemester": 5,
  "studentStatus": "Active"
}
```

#### Request Body Fields

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `registrationNumber` | String | **Yes** | — | `@NotBlank` | Unique registration number |
| `studentId` | String | **Yes** | — | `@NotBlank` | Unique student ID |
| `rollNumber` | String | **Yes** | — | `@NotBlank` | Roll number |
| `studentName` | String | **Yes** | — | `@NotBlank` | Full name |
| `gender` | String | No | — | — | `Male`, `Female`, `Other` |
| `dateOfBirth` | String (date) | No | — | — | ISO `YYYY-MM-DD` |
| `aadhaarNumber` | String | No | — | — | Aadhaar number |
| `emailAddress` | String | No | — | `@Email` | Email address |
| `mobileNumber` | String | No | — | — | Mobile number |
| `programOfferingId` | Long | **Yes** | — | `@NotNull` | FK to program offering |
| `currentSemester` | Integer | No | — | — | 1 to 8 |
| `studentStatus` | String | No | `Active` | — | `Active`, `Graduated`, `Discontinued` |

#### Response: `201 Created`

Shape: `StudentProfileResponse` (with empty nested collections).

---

### 4.4 UPDATE Student Profile

```
PUT /api/v1/departments/{departmentId}/students/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `id` | Long | Yes | Student profile ID |

#### Request Body (JSON) — all fields optional

```json
{
  "studentName": "Neha Patel Updated",
  "gender": "Female",
  "dateOfBirth": "2001-12-10",
  "aadhaarNumber": "9876-5432-1098",
  "emailAddress": "neha.patel.updated@student.edu",
  "mobileNumber": "9876543222",
  "programOfferingId": 6,
  "currentSemester": 6,
  "studentStatus": "Active"
}
```

#### Request Body Fields

Same as Create (§4.3). All optional.

#### Response: `200 OK`

Shape: `StudentProfileResponse`.

---

### 4.5 DELETE Student Profile

```
DELETE /api/v1/departments/{departmentId}/students/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `id` | Long | Yes | Student profile ID |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Student profile deleted successfully",
  "data": null,
  "timestamp": "2026-07-14T10:30:00"
}
```

---

### 4.6 GET Student Admission

```
GET /api/v1/departments/{departmentId}/students/{studentId}/admission
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `studentId` | Long | Yes | Student ID |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "studentId": 1,
    "academicYearId": 1,
    "admissionType": "Convener",
    "admissionCategory": "General",
    "admissionRank": 1500,
    "admissionQuota": "State",
    "stateOfOrigin": "Telangana",
    "country": "India",
    "admissionStatus": "Admitted",
    "createdAt": "2026-01-10T10:00:00"
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `AdmissionResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `studentId` | Long | Owning student ID |
| `academicYearId` | Long (nullable) | FK to academic year |
| `admissionType` | String (nullable) | `Convener`, `Management`, `Lateral Entry`, `NRI`, `Spot` |
| `admissionCategory` | String (nullable) | `General`, `OBC`, `SC`, `ST`, `EWS` |
| `admissionRank` | Integer (nullable) | Admission rank |
| `admissionQuota` | String (nullable) | Admission quota |
| `stateOfOrigin` | String (nullable) | State of origin |
| `country` | String (nullable) | Country |
| `admissionStatus` | String (nullable) | Admission status |
| `createdAt` | String (datetime) | ISO datetime |

---

### 4.7 UPDATE Student Admission

```
PUT /api/v1/departments/{departmentId}/students/{studentId}/admission
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `studentId` | Long | Yes | Student ID |

#### Request Body (JSON)

```json
{
  "academicYearId": 1,
  "admissionType": "Management",
  "admissionCategory": "OBC",
  "admissionRank": 2500,
  "admissionQuota": "Management",
  "stateOfOrigin": "Maharashtra",
  "country": "India",
  "admissionStatus": "Admitted"
}
```

#### Request Body Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `academicYearId` | Long | No | — | FK to academic year |
| `admissionType` | String | No | — | `Convener`, `Management`, `Lateral Entry`, `NRI`, `Spot` |
| `admissionCategory` | String | No | — | `General`, `OBC`, `SC`, `ST`, `EWS` |
| `admissionRank` | Integer | No | — | Admission rank |
| `admissionQuota` | String | No | — | Quota type |
| `stateOfOrigin` | String | No | — | State name |
| `country` | String | No | `India` | Country |
| `admissionStatus` | String | No | `Admitted` | Status |

#### Response: `200 OK`

Shape: `AdmissionResponse`.

---

### 4.8 GET Student Diversity

```
GET /api/v1/departments/{departmentId}/students/{studentId}/diversity
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `studentId` | Long | Yes | Student ID |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "studentId": 1,
    "socialCategory": "General",
    "economicallyWeakerSection": false,
    "minorityStatus": false,
    "differentlyAbled": false,
    "nationality": "Indian",
    "firstGenerationLearner": false,
    "createdAt": "2026-01-10T10:00:00"
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `DiversityResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `studentId` | Long | Owning student ID |
| `socialCategory` | String (nullable) | `General`, `OBC`, `SC`, `ST`, `EWS` |
| `economicallyWeakerSection` | Boolean | `true` / `false` |
| `minorityStatus` | Boolean | `true` / `false` |
| `differentlyAbled` | Boolean | `true` / `false` |
| `nationality` | String (nullable) | Nationality |
| `firstGenerationLearner` | Boolean | `true` / `false` |
| `createdAt` | String (datetime) | ISO datetime |

---

### 4.9 UPDATE Student Diversity

```
PUT /api/v1/departments/{departmentId}/students/{studentId}/diversity
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `studentId` | Long | Yes | Student ID |

#### Request Body (JSON)

```json
{
  "socialCategory": "OBC",
  "economicallyWeakerSection": true,
  "minorityStatus": false,
  "differentlyAbled": false,
  "nationality": "Indian",
  "firstGenerationLearner": true
}
```

#### Request Body Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `socialCategory` | String | No | — | Social category |
| `economicallyWeakerSection` | Boolean | No | `false` | EWS status |
| `minorityStatus` | Boolean | No | `false` | Minority status |
| `differentlyAbled` | Boolean | No | `false` | Disability status |
| `nationality` | String | No | `Indian` | Nationality |
| `firstGenerationLearner` | Boolean | No | `false` | First generation learner |

#### Response: `200 OK`

Shape: `DiversityResponse`.

---

### 4.10 LIST Student Performances

```
GET /api/v1/departments/{departmentId}/students/{studentId}/performance
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `studentId` | Long | Yes | Student ID |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": 1,
      "studentId": 1,
      "academicYearId": 1,
      "semester": 5,
      "sgpa": 8.50,
      "cgpa": 8.20,
      "backlogCount": 0,
      "attendancePercentage": 92.50,
      "graduationStatus": "Continuing",
      "createdAt": "2026-01-10T10:00:00"
    }
  ],
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `PerformanceResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `studentId` | Long | Owning student ID |
| `academicYearId` | Long (nullable) | FK to academic year |
| `semester` | Integer | Semester (1-8) |
| `sgpa` | BigDecimal (nullable) | SGPA (0.00-10.00) |
| `cgpa` | BigDecimal (nullable) | CGPA (0.00-10.00) |
| `backlogCount` | Integer | Number of backlogs |
| `attendancePercentage` | BigDecimal (nullable) | Attendance % (0.00-100.00) |
| `graduationStatus` | String (nullable) | `Graduated`, `Continuing` |
| `createdAt` | String (datetime) | ISO datetime |

---

### 4.11 ADD Student Performance

```
POST /api/v1/departments/{departmentId}/students/{studentId}/performance
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `studentId` | Long | Yes | Student ID |

#### Request Body (JSON)

```json
{
  "academicYearId": 1,
  "semester": 6,
  "sgpa": 9.10,
  "cgpa": 8.45,
  "backlogCount": 0,
  "attendancePercentage": 95.00,
  "graduationStatus": "Continuing"
}
```

#### Request Body Fields

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `academicYearId` | Long | No | — | — | FK to academic year |
| `semester` | Integer | **Yes** | — | `@NotNull`, 1-8 | Semester number |
| `sgpa` | BigDecimal | No | — | 0.00-10.00 | SGPA |
| `cgpa` | BigDecimal | No | — | 0.00-10.00 | CGPA |
| `backlogCount` | Integer | No | `0` | — | Backlog count |
| `attendancePercentage` | BigDecimal | No | — | 0.00-100.00 | Attendance % |
| `graduationStatus` | String | No | — | — | `Graduated`, `Continuing` |

#### Response: `201 Created`

Shape: `PerformanceResponse`.

---

### 4.12 UPDATE Student Performance

```
PUT /api/v1/departments/{departmentId}/students/{studentId}/performance/{performanceId}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `studentId` | Long | Yes | Student ID |
| `performanceId` | Long | Yes | Performance record ID |

#### Request Body

Same schema as §4.11. All fields optional.

#### Response: `200 OK`

Shape: `PerformanceResponse`.

---

### 4.13 GET Student Progression

```
GET /api/v1/departments/{departmentId}/students/{studentId}/progression
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `studentId` | Long | Yes | Student ID |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "studentId": 1,
    "academicYearId": 1,
    "placementStatus": "Placed",
    "higherEducationStatus": "Not Pursuing",
    "competitiveExamQualified": "GATE",
    "entrepreneurshipStatus": "No",
    "internshipCompleted": "Yes",
    "createdAt": "2026-01-10T10:00:00"
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `ProgressionResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `studentId` | Long | Owning student ID |
| `academicYearId` | Long (nullable) | FK to academic year |
| `placementStatus` | String (nullable) | `Placed`, `Not Placed`, `Not Eligible` |
| `higherEducationStatus` | String (nullable) | `Pursuing`, `Not Pursuing` |
| `competitiveExamQualified` | String (nullable) | e.g. `GATE`, `CAT`, `None` |
| `entrepreneurshipStatus` | String (nullable) | `Yes`, `No` |
| `internshipCompleted` | String (nullable) | `Yes`, `No` |
| `createdAt` | String (datetime) | ISO datetime |

---

### 4.14 UPDATE Student Progression

```
PUT /api/v1/departments/{departmentId}/students/{studentId}/progression
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `studentId` | Long | Yes | Student ID |

#### Request Body (JSON)

```json
{
  "academicYearId": 1,
  "placementStatus": "Placed",
  "higherEducationStatus": "Pursuing",
  "competitiveExamQualified": "GATE",
  "entrepreneurshipStatus": "No",
  "internshipCompleted": "Yes"
}
```

#### Request Body Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `academicYearId` | Long | No | FK to academic year |
| `placementStatus` | String | No | Placement status |
| `higherEducationStatus` | String | No | Higher education status |
| `competitiveExamQualified` | String | No | Competitive exam cleared |
| `entrepreneurshipStatus` | String | No | Entrepreneurship status |
| `internshipCompleted` | String | No | Internship status |

#### Response: `200 OK`

Shape: `ProgressionResponse`.

---

### 4.15 LIST Student Scholarships

```
GET /api/v1/departments/{departmentId}/students/{studentId}/scholarships
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `studentId` | Long | Yes | Student ID |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": 1,
      "studentId": 1,
      "scholarshipName": "Merit Scholarship",
      "scholarshipType": "Government",
      "provider": "State Government",
      "amount": 50000.00,
      "academicYearId": 1,
      "feeWaiverStatus": "Full Waiver",
      "disbursementStatus": "Disbursed",
      "createdAt": "2026-01-10T10:00:00"
    }
  ],
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `ScholarshipResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `studentId` | Long | Owning student ID |
| `scholarshipName` | String | Scholarship name |
| `scholarshipType` | String (nullable) | `Government`, `Institutional`, `Private`, `NGO`, `Other` |
| `provider` | String (nullable) | Provider name |
| `amount` | BigDecimal (nullable) | Amount in INR |
| `academicYearId` | Long (nullable) | FK to academic year |
| `feeWaiverStatus` | String (nullable) | `Full Waiver`, `Partial Waiver`, `No Waiver` |
| `disbursementStatus` | String | `Disbursed`, `Pending`, `Rejected` |
| `createdAt` | String (datetime) | ISO datetime |

---

### 4.16 ADD Student Scholarship

```
POST /api/v1/departments/{departmentId}/students/{studentId}/scholarships
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `studentId` | Long | Yes | Student ID |

#### Request Body (JSON)

```json
{
  "scholarshipName": "Merit Scholarship",
  "scholarshipType": "Government",
  "provider": "Central Government",
  "amount": 75000.00,
  "academicYearId": 1,
  "feeWaiverStatus": "Full Waiver",
  "disbursementStatus": "Pending"
}
```

#### Request Body Fields

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `scholarshipName` | String | **Yes** | — | `@NotBlank` | Scholarship name |
| `scholarshipType` | String | No | — | — | `Government`, `Institutional`, `Private`, `NGO`, `Other` |
| `provider` | String | No | — | — | Provider name |
| `amount` | BigDecimal | No | — | min 0.01 | Amount in INR |
| `academicYearId` | Long | No | — | — | FK to academic year |
| `feeWaiverStatus` | String | No | — | — | `Full Waiver`, `Partial Waiver`, `No Waiver` |
| `disbursementStatus` | String | No | `Pending` | — | `Disbursed`, `Pending`, `Rejected` |

#### Response: `201 Created`

Shape: `ScholarshipResponse`.

---

### 4.17 LIST Student Achievements

```
GET /api/v1/departments/{departmentId}/students/{studentId}/achievements
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `studentId` | Long | Yes | Student ID |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": 1,
      "studentId": 1,
      "achievementType": "Hackathon",
      "achievementName": "Smart India Hackathon Winner",
      "level": "National",
      "awardPosition": "1st Prize",
      "achievementDate": "2024-03-15",
      "academicYearId": 1,
      "organizingBody": "Government of India",
      "createdAt": "2026-01-10T10:00:00"
    }
  ],
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `StudentAchievementResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `studentId` | Long | Owning student ID |
| `achievementType` | String (nullable) | `Hackathon`, `Sports`, `Cultural`, `Paper Presentation`, `Project Competition`, `Olympiad`, `Other` |
| `achievementName` | String | Achievement name |
| `level` | String (nullable) | `International`, `National`, `State`, `University`, `College` |
| `awardPosition` | String (nullable) | Award / position |
| `achievementDate` | String (date) | ISO `YYYY-MM-DD` |
| `academicYearId` | Long (nullable) | FK to academic year |
| `organizingBody` | String (nullable) | Organizing body |
| `createdAt` | String (datetime) | ISO datetime |

---

### 4.18 ADD Student Achievement

```
POST /api/v1/departments/{departmentId}/students/{studentId}/achievements
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `studentId` | Long | Yes | Student ID |

#### Request Body (JSON)

```json
{
  "achievementType": "Hackathon",
  "achievementName": "Smart India Hackathon Winner",
  "level": "National",
  "awardPosition": "1st Prize",
  "achievementDate": "2024-03-15",
  "academicYearId": 1,
  "organizingBody": "Government of India"
}
```

#### Request Body Fields

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `achievementType` | String | No | — | — | Type of achievement |
| `achievementName` | String | **Yes** | — | `@NotBlank` | Achievement name |
| `level` | String | No | — | — | `International`, `National`, `State`, `University`, `College` |
| `awardPosition` | String | No | — | — | Award / position |
| `achievementDate` | String (date) | **Yes** | — | `@NotNull` | ISO `YYYY-MM-DD` |
| `academicYearId` | Long | No | — | — | FK to academic year |
| `organizingBody` | String | No | — | — | Organizing body |

#### Response: `201 Created`

Shape: `StudentAchievementResponse`.

---

## 5. Academic Repository

All endpoints under `/api/v1/departments/{departmentId}/academic`.

---

### 5.1 LIST Curricula

```
GET /api/v1/departments/{departmentId}/academic/curricula
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | `0` | Page number |
| `size` | int | No | `20` | Page size |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 10,
        "academicYearId": 1,
        "programOfferingId": 5,
        "totalCredits": 160,
        "openElectives": 4,
        "professionalElectives": 6,
        "valueAddedCourses": 2,
        "internshipIncluded": true,
        "projectIncluded": true,
        "industryCoursesIncluded": false,
        "revisionDate": "2024-06-15",
        "workflowStatus": "DRAFT",
        "createdAt": "2026-01-10T10:00:00",
        "updatedAt": "2026-01-10T10:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 10,
    "totalPages": 1,
    "last": true,
    "first": true
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `CurriculumResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `departmentId` | Long | Owning department ID |
| `academicYearId` | Long (nullable) | FK to academic year |
| `programOfferingId` | Long (nullable) | FK to program offering |
| `totalCredits` | Integer (nullable) | Total credits |
| `openElectives` | Integer (nullable) | Open electives count |
| `professionalElectives` | Integer (nullable) | Professional electives count |
| `valueAddedCourses` | Integer (nullable) | Value added courses count |
| `internshipIncluded` | Boolean (nullable) | Internship included |
| `projectIncluded` | Boolean (nullable) | Project included |
| `industryCoursesIncluded` | Boolean (nullable) | Industry courses included |
| `revisionDate` | String (date, nullable) | ISO `YYYY-MM-DD` |
| `workflowStatus` | String (enum) | WorkflowStatus enum |
| `createdAt` | String (datetime) | ISO datetime |
| `updatedAt` | String (datetime) | ISO datetime |

---

### 5.2 GET Curriculum by ID

```
GET /api/v1/departments/{departmentId}/academic/curricula/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `id` | Long | Yes | Curriculum ID |

#### Response: `200 OK`

Single `CurriculumResponse` object.

---

### 5.3 CREATE Curriculum

```
POST /api/v1/departments/{departmentId}/academic/curricula
```

#### Request Body (JSON)

```json
{
  "academicYearId": 1,
  "programOfferingId": 5,
  "totalCredits": 160,
  "openElectives": 4,
  "professionalElectives": 6,
  "valueAddedCourses": 2,
  "internshipIncluded": true,
  "projectIncluded": true,
  "industryCoursesIncluded": false,
  "revisionDate": "2024-06-15"
}
```

#### Request Body Fields

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `academicYearId` | Long | **Yes** | — | `@NotNull` | FK to academic year |
| `programOfferingId` | Long | **Yes** | — | `@NotNull` | FK to program offering |
| `totalCredits` | Integer | **Yes** | — | `@NotNull`, min 1 | Total credits |
| `openElectives` | Integer | No | `0` | — | Open electives count |
| `professionalElectives` | Integer | No | `0` | — | Professional electives count |
| `valueAddedCourses` | Integer | No | `0` | — | VAC count |
| `internshipIncluded` | Boolean | No | `false` | — | `true` / `false` |
| `projectIncluded` | Boolean | No | `false` | — | `true` / `false` |
| `industryCoursesIncluded` | Boolean | No | `false` | — | `true` / `false` |
| `revisionDate` | String (date) | No | — | — | ISO `YYYY-MM-DD` |

#### Response: `201 Created`

Shape: `CurriculumResponse`.

---

### 5.4 UPDATE Curriculum

```
PUT /api/v1/departments/{departmentId}/academic/curricula/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `id` | Long | Yes | Curriculum ID |

#### Request Body

Same schema as §5.3. All fields optional.

#### Response: `200 OK`

Shape: `CurriculumResponse`.

---

### 5.5 DELETE Curriculum

```
DELETE /api/v1/departments/{departmentId}/academic/curricula/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `id` | Long | Yes | Curriculum ID |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Curriculum deleted successfully",
  "data": null,
  "timestamp": "2026-07-14T10:30:00"
}
```

---

### 5.6 LIST Courses

```
GET /api/v1/departments/{departmentId}/academic/courses
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | `0` | Page number |
| `size` | int | No | `20` | Page size |
| `search` | String | No | — | Search by course name or code |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 10,
        "programOfferingId": 5,
        "courseCode": "CS401",
        "courseName": "Machine Learning",
        "semester": 7,
        "courseType": "Theory",
        "credits": 4,
        "theoryHours": 3,
        "labHours": 2,
        "status": "Active",
        "workflowStatus": "DRAFT",
        "createdAt": "2026-01-10T10:00:00",
        "updatedAt": "2026-01-10T10:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 40,
    "totalPages": 2,
    "last": false,
    "first": true
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `CourseResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `departmentId` | Long | Owning department ID |
| `programOfferingId` | Long (nullable) | FK to program offering |
| `courseCode` | String | Unique course code |
| `courseName` | String | Course name |
| `semester` | Integer (nullable) | Semester (1-8) |
| `courseType` | String (nullable) | `Theory`, `Lab`, `Theory + Lab`, `Project`, `Seminar`, `Internship` |
| `credits` | Integer (nullable) | Credits |
| `theoryHours` | Integer (nullable) | Theory hours per week |
| `labHours` | Integer (nullable) | Lab hours per week |
| `status` | String (nullable) | `Active`, `Inactive`, `Proposed` |
| `workflowStatus` | String (enum) | WorkflowStatus enum |
| `createdAt` | String (datetime) | ISO datetime |
| `updatedAt` | String (datetime) | ISO datetime |

---

### 5.7 GET Course by ID

```
GET /api/v1/departments/{departmentId}/academic/courses/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `id` | Long | Yes | Course ID |

#### Response: `200 OK`

Single `CourseResponse`.

---

### 5.8 CREATE Course

```
POST /api/v1/departments/{departmentId}/academic/courses
```

#### Request Body (JSON)

```json
{
  "programOfferingId": 5,
  "courseCode": "CS402",
  "courseName": "Deep Learning",
  "semester": 8,
  "courseType": "Theory + Lab",
  "credits": 4,
  "theoryHours": 3,
  "labHours": 2,
  "status": "Active"
}
```

#### Request Body Fields

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `programOfferingId` | Long | **Yes** | — | `@NotNull` | FK to program offering |
| `courseCode` | String | **Yes** | — | `@NotBlank` | Unique course code |
| `courseName` | String | **Yes** | — | `@NotBlank` | Course name |
| `semester` | Integer | **Yes** | — | `@NotNull`, 1-8 | Semester number |
| `courseType` | String | **Yes** | — | `@NotBlank` | `Theory`, `Lab`, `Theory + Lab`, `Project`, `Seminar`, `Internship` |
| `credits` | Integer | **Yes** | — | `@NotNull`, min 1 | Credits |
| `theoryHours` | Integer | No | `0` | — | Theory hours |
| `labHours` | Integer | No | `0` | — | Lab hours |
| `status` | String | No | `Active` | — | `Active`, `Inactive`, `Proposed` |

#### Response: `201 Created`

Shape: `CourseResponse`.

---

### 5.9 UPDATE Course

```
PUT /api/v1/departments/{departmentId}/academic/courses/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `id` | Long | Yes | Course ID |

#### Request Body

Same schema as §5.8. All fields optional.

#### Response: `200 OK`

Shape: `CourseResponse`.

---

### 5.10 DELETE Course

```
DELETE /api/v1/departments/{departmentId}/academic/courses/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `id` | Long | Yes | Course ID |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Course deleted successfully",
  "data": null,
  "timestamp": "2026-07-14T10:30:00"
}
```

---

### 5.11 LIST Academic Calendars

```
GET /api/v1/departments/{departmentId}/academic/calendars
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | `0` | Page number |
| `size` | int | No | `20` | Page size |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 10,
        "academicYearId": 1,
        "semester": "I",
        "startDate": "2024-07-15",
        "endDate": "2024-12-15",
        "instructionalDays": 90,
        "midExamDates": "2024-09-15 to 2024-09-20",
        "endExamDates": "2024-12-01 to 2024-12-10",
        "workflowStatus": "DRAFT",
        "createdAt": "2026-01-10T10:00:00",
        "updatedAt": "2026-01-10T10:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 4,
    "totalPages": 1,
    "last": true,
    "first": true
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `AcademicCalendarResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `departmentId` | Long | Owning department ID |
| `academicYearId` | Long (nullable) | FK to academic year |
| `semester` | String (nullable) | `I`, `II`, `Summer` |
| `startDate` | String (date, nullable) | ISO `YYYY-MM-DD` |
| `endDate` | String (date, nullable) | ISO `YYYY-MM-DD` |
| `instructionalDays` | Integer (nullable) | Number of instructional days |
| `midExamDates` | String (nullable) | Mid exam dates description |
| `endExamDates` | String (nullable) | End exam dates description |
| `workflowStatus` | String (enum) | WorkflowStatus enum |
| `createdAt` | String (datetime) | ISO datetime |
| `updatedAt` | String (datetime) | ISO datetime |

---

### 5.12 GET Academic Calendar by ID

```
GET /api/v1/departments/{departmentId}/academic/calendars/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `id` | Long | Yes | Calendar ID |

#### Response: `200 OK`

Single `AcademicCalendarResponse`.

---

### 5.13 CREATE Academic Calendar

```
POST /api/v1/departments/{departmentId}/academic/calendars
```

#### Request Body (JSON)

```json
{
  "academicYearId": 1,
  "semester": "I",
  "startDate": "2024-07-15",
  "endDate": "2024-12-15",
  "instructionalDays": 90,
  "midExamDates": "2024-09-15 to 2024-09-20",
  "endExamDates": "2024-12-01 to 2024-12-10"
}
```

#### Request Body Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `academicYearId` | Long | **Yes** | `@NotNull` | FK to academic year |
| `semester` | String | **Yes** | `@NotBlank` | `I`, `II`, `Summer` |
| `startDate` | String (date) | **Yes** | `@NotNull` | ISO `YYYY-MM-DD` |
| `endDate` | String (date) | **Yes** | `@NotNull` | ISO `YYYY-MM-DD` |
| `instructionalDays` | Integer | No | — | Instructional days count |
| `midExamDates` | String | No | — | Mid exam dates |
| `endExamDates` | String | No | — | End exam dates |

#### Response: `201 Created`

Shape: `AcademicCalendarResponse`.

---

### 5.14 UPDATE Academic Calendar

```
PUT /api/v1/departments/{departmentId}/academic/calendars/{id}
```

Same schema as §5.13. All fields optional.

#### Response: `200 OK`

---

### 5.15 DELETE Academic Calendar

```
DELETE /api/v1/departments/{departmentId}/academic/calendars/{id}
```

#### Response: `200 OK`

---

### 5.16 LIST Value Added Courses

```
GET /api/v1/departments/{departmentId}/academic/value-added-courses
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | `0` | Page number |
| `size` | int | No | `20` | Page size |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 10,
        "courseName": "Python Programming",
        "conductingUnit": "CSE Department",
        "academicYearId": 1,
        "durationHours": 30,
        "studentsEnrolled": 50,
        "certificationProvided": true,
        "workflowStatus": "DRAFT",
        "createdAt": "2026-01-10T10:00:00",
        "updatedAt": "2026-01-10T10:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 5,
    "totalPages": 1,
    "last": true,
    "first": true
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `ValueAddedCourseResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `departmentId` | Long | Owning department ID |
| `courseName` | String | Course name |
| `conductingUnit` | String (nullable) | Conducting unit |
| `academicYearId` | Long (nullable) | FK to academic year |
| `durationHours` | Integer (nullable) | Duration in hours |
| `studentsEnrolled` | Integer | Students enrolled |
| `certificationProvided` | Boolean | Certification provided |
| `workflowStatus` | String (enum) | WorkflowStatus enum |
| `createdAt` | String (datetime) | ISO datetime |
| `updatedAt` | String (datetime) | ISO datetime |

---

### 5.17 GET VAC by ID

```
GET /api/v1/departments/{departmentId}/academic/value-added-courses/{id}
```

Single `ValueAddedCourseResponse`.

---

### 5.18 CREATE Value Added Course

```
POST /api/v1/departments/{departmentId}/academic/value-added-courses
```

#### Request Body (JSON)

```json
{
  "courseName": "Python Programming",
  "conductingUnit": "CSE Department",
  "academicYearId": 1,
  "durationHours": 30,
  "studentsEnrolled": 50,
  "certificationProvided": true
}
```

#### Request Body Fields

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `courseName` | String | **Yes** | — | `@NotBlank` | Course name |
| `conductingUnit` | String | No | — | — | Conducting unit |
| `academicYearId` | Long | **Yes** | — | `@NotNull` | FK to academic year |
| `durationHours` | Integer | No | — | — | Duration in hours |
| `studentsEnrolled` | Integer | No | `0` | — | Students enrolled |
| `certificationProvided` | Boolean | No | `false` | — | `true` / `false` |

#### Response: `201 Created`

Shape: `ValueAddedCourseResponse`.

---

### 5.19 UPDATE Value Added Course

```
PUT /api/v1/departments/{departmentId}/academic/value-added-courses/{id}
```

Same schema as §5.18. All fields optional.

#### Response: `200 OK`

---

### 5.20 DELETE Value Added Course

```
DELETE /api/v1/departments/{departmentId}/academic/value-added-courses/{id}
```

---

### 5.21 LIST MOOCs

```
GET /api/v1/departments/{departmentId}/academic/moocs
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | `0` | Page number |
| `size` | int | No | `20` | Page size |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 10,
        "platformId": 1,
        "courseName": "Introduction to AI",
        "academicYearId": 1,
        "studentsEnrolled": 100,
        "certificationsEarned": 80,
        "workflowStatus": "DRAFT",
        "createdAt": "2026-01-10T10:00:00",
        "updatedAt": "2026-01-10T10:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 3,
    "totalPages": 1,
    "last": true,
    "first": true
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `MoocResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `departmentId` | Long | Owning department ID |
| `platformId` | Long (nullable) | FK to platform (NPTEL, SWAYAM, Coursera) |
| `courseName` | String | Course name |
| `academicYearId` | Long (nullable) | FK to academic year |
| `studentsEnrolled` | Integer | Enrolled students |
| `certificationsEarned` | Integer | Certifications earned |
| `workflowStatus` | String (enum) | WorkflowStatus enum |
| `createdAt` | String (datetime) | ISO datetime |
| `updatedAt` | String (datetime) | ISO datetime |

---

### 5.22 GET MOOC by ID

```
GET /api/v1/departments/{departmentId}/academic/moocs/{id}
```

Single `MoocResponse`.

---

### 5.23 CREATE MOOC

```
POST /api/v1/departments/{departmentId}/academic/moocs
```

#### Request Body (JSON)

```json
{
  "platformId": 1,
  "courseName": "Introduction to AI",
  "academicYearId": 1,
  "studentsEnrolled": 100,
  "certificationsEarned": 80
}
```

#### Request Body Fields

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| `platformId` | Long | **Yes** | — | `@NotNull` | FK to platform |
| `courseName` | String | **Yes** | — | `@NotBlank` | Course name |
| `academicYearId` | Long | **Yes** | — | `@NotNull` | FK to academic year |
| `studentsEnrolled` | Integer | No | `0` | — | Enrolled students |
| `certificationsEarned` | Integer | No | `0` | — | Certifications earned |

#### Response: `201 Created`

Shape: `MoocResponse`.

---

### 5.24 UPDATE MOOC

```
PUT /api/v1/departments/{departmentId}/academic/moocs/{id}
```

Same schema as §5.23. All fields optional.

#### Response: `200 OK`

---

### 5.25 DELETE MOOC

```
DELETE /api/v1/departments/{departmentId}/academic/moocs/{id}
```

---

## 6. Research Repository

All endpoints under `/api/v1/departments/{departmentId}/research`.

---

### 6.1 LIST Publications

```
GET /api/v1/departments/{departmentId}/research/publications
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | `0` | Page number |
| `size` | int | No | `20` | Page size |
| `search` | String | No | — | Search by title |
| `type` | String | No | — | Filter by publication type |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 10,
        "publicationTitle": "Deep Learning for Image Classification",
        "publicationType": "Journal",
        "authors": "Dr. Rajesh Kumar, Dr. Amit Singh",
        "studentAuthors": "Priya Sharma",
        "correspondingAuthor": "Dr. Rajesh Kumar",
        "journalConferenceName": "IEEE Transactions on AI",
        "publisher": "IEEE",
        "issnIsbn": "1234-5678",
        "doi": "10.1109/TAI.2024.001",
        "indexedIn": "SCI, Scopus",
        "impactFactor": 5.500,
        "citationCount": 25,
        "publicationDate": "2024-03-15",
        "academicYear": "2023-24",
        "status": "Published",
        "publicationUrl": "https://doi.org/10.1109/TAI.2024.001",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-01-10T10:00:00",
        "updatedAt": "2026-01-10T10:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 25,
    "totalPages": 2,
    "last": false,
    "first": true
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `PublicationResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `departmentId` | Long | Owning department ID |
| `publicationTitle` | String | Publication title |
| `publicationType` | String (nullable) | `Journal`, `Conference`, `Book Chapter` |
| `authors` | String | Comma-separated authors |
| `studentAuthors` | String (nullable) | Student co-authors |
| `correspondingAuthor` | String (nullable) | Corresponding author |
| `journalConferenceName` | String (nullable) | Journal / conference name |
| `publisher` | String (nullable) | Publisher |
| `issnIsbn` | String (nullable) | ISSN / ISBN |
| `doi` | String (nullable) | Digital Object Identifier |
| `indexedIn` | String (nullable) | Indexing (SCI, Scopus) |
| `impactFactor` | BigDecimal (nullable) | Impact factor |
| `citationCount` | Integer (nullable) | Citation count |
| `publicationDate` | String (date) | ISO `YYYY-MM-DD` |
| `academicYear` | String (nullable) | e.g. `2023-24` |
| `status` | String (nullable) | `Accepted`, `Published` |
| `publicationUrl` | String (nullable) | Publication URL |
| `workflowStatus` | String (enum) | WorkflowStatus enum |
| `createdAt` | String (datetime) | ISO datetime |
| `updatedAt` | String (datetime) | ISO datetime |

---

### 6.2 GET Publication by ID

```
GET /api/v1/departments/{departmentId}/research/publications/{id}
```

Single `PublicationResponse`.

---

### 6.3 CREATE Publication

```
POST /api/v1/departments/{departmentId}/research/publications
```

#### Request Body (JSON)

```json
{
  "publicationTitle": "Deep Learning for Image Classification",
  "publicationType": "Journal",
  "authors": "Dr. Rajesh Kumar, Dr. Amit Singh",
  "studentAuthors": "Priya Sharma",
  "correspondingAuthor": "Dr. Rajesh Kumar",
  "journalConferenceName": "IEEE Transactions on AI",
  "publisher": "IEEE",
  "issnIsbn": "1234-5678",
  "doi": "10.1109/TAI.2024.001",
  "indexedIn": "SCI, Scopus",
  "impactFactor": 5.500,
  "citationCount": 25,
  "publicationDate": "2024-03-15",
  "academicYear": "2023-24",
  "status": "Published",
  "publicationUrl": "https://doi.org/10.1109/TAI.2024.001"
}
```

#### Request Body Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `publicationTitle` | String | **Yes** | `@NotBlank` | Publication title |
| `publicationType` | String | No | — | `Journal`, `Conference`, `Book Chapter` |
| `authors` | String | **Yes** | `@NotBlank` | Comma-separated authors |
| `studentAuthors` | String | No | — | Student co-authors |
| `correspondingAuthor` | String | No | — | Corresponding author |
| `journalConferenceName` | String | No | — | Journal / conference name |
| `publisher` | String | No | — | Publisher |
| `issnIsbn` | String | No | — | ISSN / ISBN |
| `doi` | String | No | — | DOI |
| `indexedIn` | String | No | — | Indexing details |
| `impactFactor` | BigDecimal | No | — | Impact factor |
| `citationCount` | Integer | No | — | Citation count |
| `publicationDate` | String (date) | **Yes** | `@NotNull` | ISO `YYYY-MM-DD` |
| `academicYear` | String | No | — | e.g. `2023-24` |
| `status` | String | No | — | `Accepted`, `Published` |
| `publicationUrl` | String | No | — | Publication URL |

#### Response: `201 Created`

Shape: `PublicationResponse`.

---

### 6.4 UPDATE Publication

```
PUT /api/v1/departments/{departmentId}/research/publications/{id}
```

Same schema as §6.3. All fields optional.

#### Response: `200 OK`

---

### 6.5 DELETE Publication

```
DELETE /api/v1/departments/{departmentId}/research/publications/{id}
```

---

### 6.6 LIST Patents

```
GET /api/v1/departments/{departmentId}/research/patents
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | `0` | Page number |
| `size` | int | No | `20` | Page size |
| `search` | String | No | — | Search by title |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 10,
        "patentTitle": "AI-Based Fraud Detection System",
        "inventors": "Dr. Rajesh Kumar, Dr. Amit Singh",
        "studentInventors": "Priya Sharma",
        "patentNumber": "IN202411001234",
        "applicationNumber": "IN/PCT/2024/001234",
        "country": "India",
        "filingDate": "2024-01-15",
        "publicationDate": "2024-06-15",
        "grantDate": null,
        "patentStatus": "Published",
        "commercialized": "No",
        "revenueGenerated": null,
        "workflowStatus": "APPROVED",
        "createdAt": "2026-01-10T10:00:00",
        "updatedAt": "2026-01-10T10:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 10,
    "totalPages": 1,
    "last": true,
    "first": true
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `PatentResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `departmentId` | Long | Owning department ID |
| `patentTitle` | String | Patent title |
| `inventors` | String | Comma-separated inventors |
| `studentInventors` | String (nullable) | Student inventors |
| `patentNumber` | String (nullable) | Patent number |
| `applicationNumber` | String | Application number |
| `country` | String | Country |
| `filingDate` | String (date) | ISO `YYYY-MM-DD` |
| `publicationDate` | String (date, nullable) | ISO `YYYY-MM-DD` |
| `grantDate` | String (date, nullable) | ISO `YYYY-MM-DD` |
| `patentStatus` | String (nullable) | `Filed`, `Published`, `Granted` |
| `commercialized` | String (nullable) | `Yes`, `No` |
| `revenueGenerated` | BigDecimal (nullable) | Revenue in INR |
| `workflowStatus` | String (enum) | WorkflowStatus enum |
| `createdAt` | String (datetime) | ISO datetime |
| `updatedAt` | String (datetime) | ISO datetime |

---

### 6.7 GET Patent by ID

```
GET /api/v1/departments/{departmentId}/research/patents/{id}
```

Single `PatentResponse`.

---

### 6.8 CREATE Patent

```
POST /api/v1/departments/{departmentId}/research/patents
```

#### Request Body (JSON)

```json
{
  "patentTitle": "AI-Based Fraud Detection System",
  "inventors": "Dr. Rajesh Kumar, Dr. Amit Singh",
  "studentInventors": "Priya Sharma",
  "patentNumber": "IN202411001234",
  "applicationNumber": "IN/PCT/2024/001234",
  "country": "India",
  "filingDate": "2024-01-15",
  "publicationDate": "2024-06-15",
  "grantDate": null,
  "patentStatus": "Published",
  "commercialized": "No",
  "revenueGenerated": null
}
```

#### Request Body Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `patentTitle` | String | **Yes** | `@NotBlank` | Patent title |
| `inventors` | String | **Yes** | `@NotBlank` | Comma-separated inventors |
| `studentInventors` | String | No | — | Student inventors |
| `patentNumber` | String | No | — | Patent number |
| `applicationNumber` | String | **Yes** | `@NotBlank` | Application number |
| `country` | String | **Yes** | `@NotBlank` | Country |
| `filingDate` | String (date) | **Yes** | `@NotNull` | ISO `YYYY-MM-DD` |
| `publicationDate` | String (date) | No | — | ISO `YYYY-MM-DD` |
| `grantDate` | String (date) | No | — | ISO `YYYY-MM-DD` |
| `patentStatus` | String | No | — | `Filed`, `Published`, `Granted` |
| `commercialized` | String | No | — | `Yes`, `No` |
| `revenueGenerated` | BigDecimal | No | — | Revenue in INR |

#### Response: `201 Created`

Shape: `PatentResponse`.

---

### 6.9 UPDATE Patent

```
PUT /api/v1/departments/{departmentId}/research/patents/{id}
```

Same schema as §6.8. All fields optional.

#### Response: `200 OK`

---

### 6.10 DELETE Patent

```
DELETE /api/v1/departments/{departmentId}/research/patents/{id}
```

---

### 6.11 LIST Grants

```
GET /api/v1/departments/{departmentId}/research/grants
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | `0` | Page number |
| `size` | int | No | `20` | Page size |
| `search` | String | No | — | Search by title |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 10,
        "grantTitle": "AI Research Fund",
        "fundingAgency": "DST",
        "principalInvestigator": "Dr. Rajesh Kumar",
        "coInvestigators": "Dr. Amit Singh",
        "grantCategory": "Government",
        "amountSanctioned": 5000000.00,
        "amountReceived": 2500000.00,
        "startDate": "2024-01-01",
        "endDate": "2026-12-31",
        "status": "Ongoing",
        "workflowStatus": "APPROVED",
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
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `GrantResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `departmentId` | Long | Owning department ID |
| `grantTitle` | String | Grant title |
| `fundingAgency` | String | Funding agency name |
| `principalInvestigator` | String | PI name |
| `coInvestigators` | String (nullable) | Co-PI names |
| `grantCategory` | String (nullable) | `Government`, `Industry`, `International` |
| `amountSanctioned` | BigDecimal | Sanctioned amount (INR) |
| `amountReceived` | BigDecimal (nullable) | Received amount (INR) |
| `startDate` | String (date) | ISO `YYYY-MM-DD` |
| `endDate` | String (date, nullable) | ISO `YYYY-MM-DD` |
| `status` | String (nullable) | `Ongoing`, `Completed` |
| `workflowStatus` | String (enum) | WorkflowStatus enum |
| `createdAt` | String (datetime) | ISO datetime |
| `updatedAt` | String (datetime) | ISO datetime |

---

### 6.12 GET Grant by ID

```
GET /api/v1/departments/{departmentId}/research/grants/{id}
```

Single `GrantResponse`.

---

### 6.13 CREATE Grant

```
POST /api/v1/departments/{departmentId}/research/grants
```

#### Request Body (JSON)

```json
{
  "grantTitle": "AI Research Fund",
  "fundingAgency": "DST",
  "principalInvestigator": "Dr. Rajesh Kumar",
  "coInvestigators": "Dr. Amit Singh",
  "grantCategory": "Government",
  "amountSanctioned": 5000000.00,
  "amountReceived": 2500000.00,
  "startDate": "2024-01-01",
  "endDate": "2026-12-31",
  "status": "Ongoing"
}
```

#### Request Body Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `grantTitle` | String | **Yes** | `@NotBlank` | Grant title |
| `fundingAgency` | String | **Yes** | `@NotBlank` | Funding agency |
| `principalInvestigator` | String | **Yes** | `@NotBlank` | PI name |
| `coInvestigators` | String | No | — | Co-PI names |
| `grantCategory` | String | No | — | `Government`, `Industry`, `International` |
| `amountSanctioned` | BigDecimal | **Yes** | `@NotNull`, min 0.01 | Sanctioned amount |
| `amountReceived` | BigDecimal | No | — | Received amount |
| `startDate` | String (date) | **Yes** | `@NotNull` | ISO `YYYY-MM-DD` |
| `endDate` | String (date) | No | — | ISO `YYYY-MM-DD` |
| `status` | String | No | — | `Ongoing`, `Completed` |

#### Response: `201 Created`

Shape: `GrantResponse`.

---

### 6.14 UPDATE Grant

```
PUT /api/v1/departments/{departmentId}/research/grants/{id}
```

Same schema as §6.13. All fields optional.

#### Response: `200 OK`

---

### 6.15 DELETE Grant

```
DELETE /api/v1/departments/{departmentId}/research/grants/{id}
```

---

### 6.16 LIST Sponsored Projects

```
GET /api/v1/departments/{departmentId}/research/sponsored-projects
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | `0` | Page number |
| `size` | int | No | `20` | Page size |
| `search` | String | No | — | Search by title |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 10,
        "projectTitle": "IoT-based Smart Agriculture",
        "sponsorOrganization": "ICAR",
        "principalInvestigator": "Dr. Amit Singh",
        "coInvestigators": "Dr. Rajesh Kumar",
        "projectValue": 2500000.00,
        "startDate": "2024-01-01",
        "endDate": "2025-12-31",
        "projectStatus": "Ongoing",
        "projectOutcome": "Prototype developed",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-01-10T10:00:00",
        "updatedAt": "2026-01-10T10:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 5,
    "totalPages": 1,
    "last": true,
    "first": true
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `SponsoredProjectResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `departmentId` | Long | Owning department ID |
| `projectTitle` | String | Project title |
| `sponsorOrganization` | String | Sponsor name |
| `principalInvestigator` | String | PI name |
| `coInvestigators` | String (nullable) | Co-PI names |
| `projectValue` | BigDecimal | Project value (INR) |
| `startDate` | String (date) | ISO `YYYY-MM-DD` |
| `endDate` | String (date, nullable) | ISO `YYYY-MM-DD` |
| `projectStatus` | String (nullable) | `Ongoing`, `Completed` |
| `projectOutcome` | String (nullable) | Outcome description |
| `workflowStatus` | String (enum) | WorkflowStatus enum |
| `createdAt` | String (datetime) | ISO datetime |
| `updatedAt` | String (datetime) | ISO datetime |

---

### 6.17 GET Sponsored Project by ID

```
GET /api/v1/departments/{departmentId}/research/sponsored-projects/{id}
```

Single `SponsoredProjectResponse`.

---

### 6.18 CREATE Sponsored Project

```
POST /api/v1/departments/{departmentId}/research/sponsored-projects
```

#### Request Body (JSON)

```json
{
  "projectTitle": "IoT-based Smart Agriculture",
  "sponsorOrganization": "ICAR",
  "principalInvestigator": "Dr. Amit Singh",
  "coInvestigators": "Dr. Rajesh Kumar",
  "projectValue": 2500000.00,
  "startDate": "2024-01-01",
  "endDate": "2025-12-31",
  "projectStatus": "Ongoing",
  "projectOutcome": "Prototype developed"
}
```

#### Request Body Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `projectTitle` | String | **Yes** | `@NotBlank` | Project title |
| `sponsorOrganization` | String | **Yes** | `@NotBlank` | Sponsor name |
| `principalInvestigator` | String | **Yes** | `@NotBlank` | PI name |
| `coInvestigators` | String | No | — | Co-PI names |
| `projectValue` | BigDecimal | **Yes** | `@NotNull`, min 0.01 | Project value |
| `startDate` | String (date) | **Yes** | `@NotNull` | ISO `YYYY-MM-DD` |
| `endDate` | String (date) | No | — | ISO `YYYY-MM-DD` |
| `projectStatus` | String | No | — | `Ongoing`, `Completed` |
| `projectOutcome` | String | No | — | Outcome description |

#### Response: `201 Created`

Shape: `SponsoredProjectResponse`.

---

### 6.19 UPDATE Sponsored Project

```
PUT /api/v1/departments/{departmentId}/research/sponsored-projects/{id}
```

Same schema as §6.18. All fields optional.

#### Response: `200 OK`

---

### 6.20 DELETE Sponsored Project

```
DELETE /api/v1/departments/{departmentId}/research/sponsored-projects/{id}
```

---

### 6.21 LIST Consultancy Projects

```
GET /api/v1/departments/{departmentId}/research/consultancy
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | `0` | Page number |
| `size` | int | No | `20` | Page size |
| `search` | String | No | — | Search by title |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 10,
        "consultancyTitle": "Software Development for Banking",
        "clientOrganization": "SBI Bank",
        "facultyLead": "Dr. Rajesh Kumar",
        "teamMembers": "Dr. Amit Singh, Priya Sharma",
        "consultancyValue": 1500000.00,
        "startDate": "2024-01-15",
        "endDate": "2024-06-15",
        "status": "Completed",
        "outcomeSummary": "Successfully delivered",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-01-10T10:00:00",
        "updatedAt": "2026-01-10T10:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 3,
    "totalPages": 1,
    "last": true,
    "first": true
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `ConsultancyResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `departmentId` | Long | Owning department ID |
| `consultancyTitle` | String | Consultancy title |
| `clientOrganization` | String | Client name |
| `facultyLead` | String | Faculty lead |
| `teamMembers` | String (nullable) | Team members |
| `consultancyValue` | BigDecimal | Consultancy value (INR) |
| `startDate` | String (date) | ISO `YYYY-MM-DD` |
| `endDate` | String (date, nullable) | ISO `YYYY-MM-DD` |
| `status` | String (nullable) | `Active`, `Completed` |
| `outcomeSummary` | String (nullable) | Outcome summary |
| `workflowStatus` | String (enum) | WorkflowStatus enum |
| `createdAt` | String (datetime) | ISO datetime |
| `updatedAt` | String (datetime) | ISO datetime |

---

### 6.22 GET Consultancy by ID

```
GET /api/v1/departments/{departmentId}/research/consultancy/{id}
```

Single `ConsultancyResponse`.

---

### 6.23 CREATE Consultancy

```
POST /api/v1/departments/{departmentId}/research/consultancy
```

#### Request Body (JSON)

```json
{
  "consultancyTitle": "Software Development for Banking",
  "clientOrganization": "SBI Bank",
  "facultyLead": "Dr. Rajesh Kumar",
  "teamMembers": "Dr. Amit Singh, Priya Sharma",
  "consultancyValue": 1500000.00,
  "startDate": "2024-01-15",
  "endDate": "2024-06-15",
  "status": "Completed",
  "outcomeSummary": "Successfully delivered"
}
```

#### Request Body Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `consultancyTitle` | String | **Yes** | `@NotBlank` | Consultancy title |
| `clientOrganization` | String | **Yes** | `@NotBlank` | Client name |
| `facultyLead` | String | **Yes** | `@NotBlank` | Faculty lead |
| `teamMembers` | String | No | — | Team member names |
| `consultancyValue` | BigDecimal | **Yes** | `@NotNull`, min 0.01 | Consultancy value (INR) |
| `startDate` | String (date) | **Yes** | `@NotNull` | ISO `YYYY-MM-DD` |
| `endDate` | String (date) | No | — | ISO `YYYY-MM-DD` |
| `status` | String | No | — | `Active`, `Completed` |
| `outcomeSummary` | String | No | — | Outcome summary |

#### Response: `201 Created`

Shape: `ConsultancyResponse`.

---

### 6.24 UPDATE Consultancy

```
PUT /api/v1/departments/{departmentId}/research/consultancy/{id}
```

Same schema as §6.23. All fields optional.

#### Response: `200 OK`

---

### 6.25 DELETE Consultancy

```
DELETE /api/v1/departments/{departmentId}/research/consultancy/{id}
```

---

## 7. Alumni Repository

All endpoints under `/api/v1/departments/{departmentId}/alumni`.

---

### 7.1 LIST Alumni

```
GET /api/v1/departments/{departmentId}/alumni
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | `0` | Page number |
| `size` | int | No | `20` | Page size |
| `search` | String | No | — | Search by name or roll number |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 10,
        "alumniId": "ALM2020001",
        "alumniName": "Rahul Verma",
        "rollNumber": "16CS001",
        "programId": 1,
        "specializationId": 1,
        "graduationYear": "2020",
        "personalEmail": "rahul.verma@gmail.com",
        "mobileNumber": "9876543212",
        "currentCity": "Bangalore",
        "currentCountry": "India",
        "linkedinProfile": "https://linkedin.com/in/rahulverma",
        "alumniStatus": "Active",
        "employments": [
          {
            "id": 1,
            "alumniId": 1,
            "organizationName": "Google",
            "designation": "Software Engineer",
            "industrySector": "IT",
            "employmentType": "Full Time",
            "startDate": "2020-07-01",
            "currentPackageLpa": 18.00,
            "careerLevel": "Mid Level",
            "createdAt": "2026-01-10T10:00:00"
          }
        ],
        "higherEducations": [],
        "engagements": [],
        "contributions": [],
        "mentorships": [],
        "achievements": [],
        "createdAt": "2026-01-10T10:00:00",
        "updatedAt": "2026-01-10T10:00:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 30,
    "totalPages": 2,
    "last": false,
    "first": true
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `AlumniDetailResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `departmentId` | Long | Owning department ID |
| `alumniId` | String | Unique alumni identifier |
| `alumniName` | String | Full name |
| `rollNumber` | String | Roll number during study |
| `programId` | Long (nullable) | FK to program |
| `specializationId` | Long (nullable) | FK to specialization |
| `graduationYear` | String | Graduation year |
| `personalEmail` | String (nullable) | Email |
| `mobileNumber` | String (nullable) | Mobile |
| `currentCity` | String (nullable) | Current city |
| `currentCountry` | String (nullable) | Current country |
| `linkedinProfile` | String (nullable) | LinkedIn URL |
| `alumniStatus` | String | `Active` |
| `employments` | Array of AlumniEmploymentResponse | May be empty |
| `higherEducations` | Array of AlumniHigherEducationResponse | May be empty |
| `engagements` | Array of AlumniEngagementResponse | May be empty |
| `contributions` | Array of AlumniContributionResponse | May be empty |
| `mentorships` | Array of AlumniMentorshipResponse | May be empty |
| `achievements` | Array of AlumniAchievementResponse | May be empty |
| `createdAt` | String (datetime) | ISO datetime |
| `updatedAt` | String (datetime) | ISO datetime |

---

### 7.2 GET Alumni by ID

```
GET /api/v1/departments/{departmentId}/alumni/{id}
```

Single `AlumniDetailResponse`.

---

### 7.3 CREATE Alumni

```
POST /api/v1/departments/{departmentId}/alumni
```

#### Request Body (JSON)

```json
{
  "alumniId": "ALM2020002",
  "alumniName": "Sneha Reddy",
  "rollNumber": "16CS002",
  "programId": 1,
  "specializationId": 1,
  "graduationYear": "2020",
  "personalEmail": "sneha.reddy@gmail.com",
  "mobileNumber": "9876543213",
  "currentCity": "Hyderabad",
  "currentCountry": "India",
  "linkedinProfile": "https://linkedin.com/in/snehareddy",
  "alumniStatus": "Active"
}
```

#### Request Body Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `alumniId` | String | **Yes** | `@NotBlank` | Unique alumni ID |
| `alumniName` | String | **Yes** | `@NotBlank` | Full name |
| `rollNumber` | String | **Yes** | `@NotBlank` | Roll number |
| `programId` | Long | No | — | FK to program |
| `specializationId` | Long | No | — | FK to specialization |
| `graduationYear` | String | **Yes** | `@NotBlank` | e.g. `2020` |
| `personalEmail` | String | No | `@Email` | Email address |
| `mobileNumber` | String | No | — | Mobile number |
| `currentCity` | String | No | — | Current city |
| `currentCountry` | String | No | — | Current country |
| `linkedinProfile` | String | No | — | LinkedIn URL |
| `alumniStatus` | String | No | — | `Active` |

#### Response: `201 Created`

Shape: `AlumniDetailResponse`.

---

### 7.4 UPDATE Alumni

```
PUT /api/v1/departments/{departmentId}/alumni/{id}
```

Same schema as §7.3. All fields optional.

#### Response: `200 OK`

---

### 7.5 DELETE Alumni

```
DELETE /api/v1/departments/{departmentId}/alumni/{id}
```

---

### 7.6 LIST Alumni Employments

```
GET /api/v1/departments/{departmentId}/alumni/{alumniId}/employment
```

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": 1,
      "alumniId": 1,
      "organizationName": "Google",
      "designation": "Software Engineer",
      "industrySector": "IT",
      "employmentType": "Full Time",
      "startDate": "2020-07-01",
      "currentPackageLpa": 18.00,
      "careerLevel": "Mid Level",
      "createdAt": "2026-01-10T10:00:00"
    }
  ],
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `AlumniEmploymentResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `alumniId` | Long | Owning alumni ID |
| `organizationName` | String | Organization name |
| `designation` | String | Job designation |
| `industrySector` | String (nullable) | Industry sector |
| `employmentType` | String (nullable) | `Full Time`, `Part Time`, `Contract`, `Freelance`, `Self-Employed` |
| `startDate` | String (date) | ISO `YYYY-MM-DD` |
| `currentPackageLpa` | BigDecimal (nullable) | Package in LPA |
| `careerLevel` | String (nullable) | `Entry Level`, `Mid Level`, `Senior`, `Lead`, `Manager`, `Director`, `VP`, `CXO`, `Founder` |
| `createdAt` | String (datetime) | ISO datetime |

---

### 7.7 ADD Alumni Employment

```
POST /api/v1/departments/{departmentId}/alumni/{alumniId}/employment
```

#### Request Body (JSON)

```json
{
  "organizationName": "Google",
  "designation": "Software Engineer",
  "industrySector": "IT",
  "employmentType": "Full Time",
  "startDate": "2020-07-01",
  "currentPackageLpa": 18.00,
  "careerLevel": "Mid Level"
}
```

#### Request Body Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `organizationName` | String | **Yes** | `@NotBlank` | Organization name |
| `designation` | String | **Yes** | `@NotBlank` | Job designation |
| `industrySector` | String | No | — | Industry sector |
| `employmentType` | String | No | — | `Full Time`, `Part Time`, `Contract`, `Freelance`, `Self-Employed` |
| `startDate` | String (date) | **Yes** | `@NotNull` | ISO `YYYY-MM-DD` |
| `currentPackageLpa` | BigDecimal | No | — | Package in LPA |
| `careerLevel` | String | No | — | Career level |

#### Response: `201 Created`

Shape: `AlumniEmploymentResponse`.

---

### 7.8 LIST Alumni Higher Educations

```
GET /api/v1/departments/{departmentId}/alumni/{alumniId}/higher-education
```

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": 1,
      "alumniId": 1,
      "institutionName": "IIT Bombay",
      "programName": "M.Tech in AI",
      "country": "India",
      "admissionYear": "2020",
      "completionYear": "2022",
      "status": "Completed",
      "createdAt": "2026-01-10T10:00:00"
    }
  ],
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `AlumniHigherEducationResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `alumniId` | Long | Owning alumni ID |
| `institutionName` | String | Institution name |
| `programName` | String | Program name |
| `country` | String (nullable) | Country |
| `admissionYear` | String (nullable) | Admission year |
| `completionYear` | String (nullable) | Completion year |
| `status` | String (nullable) | `Completed`, `Pursuing` |
| `createdAt` | String (datetime) | ISO datetime |

---

### 7.9 ADD Alumni Higher Education

```
POST /api/v1/departments/{departmentId}/alumni/{alumniId}/higher-education
```

#### Request Body (JSON)

```json
{
  "institutionName": "IIT Bombay",
  "programName": "M.Tech in AI",
  "country": "India",
  "admissionYear": "2020",
  "completionYear": "2022",
  "status": "Completed"
}
```

#### Request Body Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `institutionName` | String | **Yes** | `@NotBlank` | Institution name |
| `programName` | String | **Yes** | `@NotBlank` | Program name |
| `country` | String | No | — | Country |
| `admissionYear` | String | No | — | Admission year |
| `completionYear` | String | No | — | Completion year |
| `status` | String | No | — | `Completed`, `Pursuing` |

#### Response: `201 Created`

Shape: `AlumniHigherEducationResponse`.

---

### 7.10 LIST Alumni Engagements

```
GET /api/v1/departments/{departmentId}/alumni/{alumniId}/engagement
```

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": 1,
      "alumniId": 1,
      "engagementType": "Guest Lecture",
      "activityName": "AI Workshop for Students",
      "activityDate": "2024-03-15",
      "role": "Speaker",
      "contributionHours": 4.0,
      "createdAt": "2026-01-10T10:00:00"
    }
  ],
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `AlumniEngagementResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `alumniId` | Long | Owning alumni ID |
| `engagementType` | String (nullable) | `Guest Lecture`, `Workshop`, `Seminar`, `Networking Event`, `Webinar`, `Panel Discussion`, `Other` |
| `activityName` | String | Activity name |
| `activityDate` | String (date) | ISO `YYYY-MM-DD` |
| `role` | String (nullable) | Role in activity |
| `contributionHours` | BigDecimal (nullable) | Hours contributed |
| `createdAt` | String (datetime) | ISO datetime |

---

### 7.11 ADD Alumni Engagement

```
POST /api/v1/departments/{departmentId}/alumni/{alumniId}/engagement
```

#### Request Body (JSON)

```json
{
  "engagementType": "Guest Lecture",
  "activityName": "AI Workshop for Students",
  "activityDate": "2024-03-15",
  "role": "Speaker",
  "contributionHours": 4.0
}
```

#### Request Body Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `engagementType` | String | No | — | Engagement type |
| `activityName` | String | **Yes** | `@NotBlank` | Activity name |
| `activityDate` | String (date) | **Yes** | `@NotNull` | ISO `YYYY-MM-DD` |
| `role` | String | No | — | Role |
| `contributionHours` | BigDecimal | No | — | Hours contributed |

#### Response: `201 Created`

Shape: `AlumniEngagementResponse`.

---

### 7.12 LIST Alumni Contributions

```
GET /api/v1/departments/{departmentId}/alumni/{alumniId}/contributions
```

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": 1,
      "alumniId": 1,
      "contributionType": "Scholarship",
      "contributionTitle": "Merit Scholarship Fund",
      "contributionValue": 100000.00,
      "contributionDate": "2024-01-15",
      "beneficiaryDepartment": "CSE",
      "createdAt": "2026-01-10T10:00:00"
    }
  ],
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `AlumniContributionResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `alumniId` | Long | Owning alumni ID |
| `contributionType` | String (nullable) | `Scholarship`, `Donation`, `Infrastructure`, `Endowment`, `Other` |
| `contributionTitle` | String | Contribution title |
| `contributionValue` | BigDecimal (nullable) | Value in INR |
| `contributionDate` | String (date) | ISO `YYYY-MM-DD` |
| `beneficiaryDepartment` | String (nullable) | Beneficiary department |
| `createdAt` | String (datetime) | ISO datetime |

---

### 7.13 ADD Alumni Contribution

```
POST /api/v1/departments/{departmentId}/alumni/{alumniId}/contributions
```

#### Request Body (JSON)

```json
{
  "contributionType": "Scholarship",
  "contributionTitle": "Merit Scholarship Fund",
  "contributionValue": 100000.00,
  "contributionDate": "2024-01-15",
  "beneficiaryDepartment": "CSE"
}
```

#### Request Body Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `contributionType` | String | No | — | Contribution type |
| `contributionTitle` | String | **Yes** | `@NotBlank` | Contribution title |
| `contributionValue` | BigDecimal | No | — | Value in INR |
| `contributionDate` | String (date) | **Yes** | `@NotNull` | ISO `YYYY-MM-DD` |
| `beneficiaryDepartment` | String | No | — | Beneficiary department |

#### Response: `201 Created`

Shape: `AlumniContributionResponse`.

---

### 7.14 LIST Alumni Mentorships

```
GET /api/v1/departments/{departmentId}/alumni/{alumniId}/mentorship
```

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": 1,
      "alumniId": 1,
      "mentorshipProgram": "Career Guidance Program",
      "mentorshipType": "Career Guidance",
      "numberOfMentees": 10,
      "startDate": "2024-01-01",
      "endDate": "2024-06-30",
      "createdAt": "2026-01-10T10:00:00"
    }
  ],
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `AlumniMentorshipResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `alumniId` | Long | Owning alumni ID |
| `mentorshipProgram` | String | Program name |
| `mentorshipType` | String (nullable) | `Career Guidance`, `Technical Mentorship`, `Entrepreneurship Mentorship`, `Research Mentorship`, `Other` |
| `numberOfMentees` | Integer (nullable) | Number of mentees |
| `startDate` | String (date) | ISO `YYYY-MM-DD` |
| `endDate` | String (date, nullable) | ISO `YYYY-MM-DD` |
| `createdAt` | String (datetime) | ISO datetime |

---

### 7.15 ADD Alumni Mentorship

```
POST /api/v1/departments/{departmentId}/alumni/{alumniId}/mentorship
```

#### Request Body (JSON)

```json
{
  "mentorshipProgram": "Career Guidance Program",
  "mentorshipType": "Career Guidance",
  "numberOfMentees": 10,
  "startDate": "2024-01-01",
  "endDate": "2024-06-30"
}
```

#### Request Body Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `mentorshipProgram` | String | **Yes** | `@NotBlank` | Mentorship program |
| `mentorshipType` | String | No | — | Type |
| `numberOfMentees` | Integer | No | min 1 | Number of mentees |
| `startDate` | String (date) | **Yes** | `@NotNull` | ISO `YYYY-MM-DD` |
| `endDate` | String (date) | No | — | ISO `YYYY-MM-DD` |

#### Response: `201 Created`

Shape: `AlumniMentorshipResponse`.

---

### 7.16 LIST Alumni Achievements

```
GET /api/v1/departments/{departmentId}/alumni/{alumniId}/achievements
```

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": 1,
      "alumniId": 1,
      "achievementTitle": "Best Employee Award",
      "achievementCategory": "Professional",
      "awardingOrganization": "Google",
      "achievementDate": "2024-03-15",
      "description": "Awarded for outstanding performance",
      "createdAt": "2026-01-10T10:00:00"
    }
  ],
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `AlumniAchievementResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `alumniId` | Long | Owning alumni ID |
| `achievementTitle` | String | Achievement title |
| `achievementCategory` | String (nullable) | `Professional`, `Academic`, `Social`, `Entrepreneurship`, `Research`, `Other` |
| `awardingOrganization` | String (nullable) | Awarding organization |
| `achievementDate` | String (date) | ISO `YYYY-MM-DD` |
| `description` | String (nullable) | Description |
| `createdAt` | String (datetime) | ISO datetime |

---

### 7.17 ADD Alumni Achievement

```
POST /api/v1/departments/{departmentId}/alumni/{alumniId}/achievements
```

#### Request Body (JSON)

```json
{
  "achievementTitle": "Best Employee Award",
  "achievementCategory": "Professional",
  "awardingOrganization": "Google",
  "achievementDate": "2024-03-15",
  "description": "Awarded for outstanding performance"
}
```

#### Request Body Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `achievementTitle` | String | **Yes** | `@NotBlank` | Achievement title |
| `achievementCategory` | String | No | — | `Professional`, `Academic`, `Social`, `Entrepreneurship`, `Research`, `Other` |
| `awardingOrganization` | String | No | — | Awarding organization |
| `achievementDate` | String (date) | **Yes** | `@NotNull` | ISO `YYYY-MM-DD` |
| `description` | String | No | — | Description |

#### Response: `201 Created`

Shape: `AlumniAchievementResponse`.

---

## 8. Evidence Documents

All endpoints under `/api/v1/departments/{departmentId}/evidence`.

---

### 8.1 LIST Evidence Documents

```
GET /api/v1/departments/{departmentId}/evidence
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | `0` | Page number |
| `size` | int | No | `20` | Page size |
| `category` | String | No | — | Filter by category |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 10,
        "name": "NBA Accreditation Certificate",
        "category": "Accreditation",
        "version": "v1.0",
        "filePath": "/uploads/evidence/nba_cert.pdf",
        "fileType": "pdf",
        "fileSize": "2.5MB",
        "uploadedBy": 1,
        "uploadedDate": "2026-01-15",
        "status": "uploaded",
        "rejectionReason": null,
        "createdAt": "2026-01-15T10:30:00",
        "updatedAt": "2026-01-15T10:30:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 15,
    "totalPages": 1,
    "last": true,
    "first": true
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `EvidenceDocumentResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `departmentId` | Long | Owning department ID |
| `name` | String | Document name |
| `category` | String (nullable) | Document category |
| `version` | String (nullable) | Version string |
| `filePath` | String (nullable) | File path |
| `fileType` | String (nullable) | File type extension |
| `fileSize` | String (nullable) | File size |
| `uploadedBy` | Long (nullable) | User ID of uploader |
| `uploadedDate` | String (date, nullable) | ISO `YYYY-MM-DD` |
| `status` | String (nullable) | `uploaded`, `verified`, `rejected` |
| `rejectionReason` | String (nullable) | Rejection reason |
| `createdAt` | String (datetime) | ISO datetime |
| `updatedAt` | String (datetime) | ISO datetime |

---

### 8.2 GET Evidence by ID

```
GET /api/v1/departments/{departmentId}/evidence/{id}
```

Single `EvidenceDocumentResponse`.

---

### 8.3 CREATE (Upload) Evidence Document

```
POST /api/v1/departments/{departmentId}/evidence
```

#### Request Body (JSON)

```json
{
  "name": "NBA Accreditation Certificate",
  "category": "Accreditation",
  "version": "v1.0",
  "filePath": "/uploads/evidence/nba_cert.pdf",
  "fileType": "pdf",
  "fileSize": "2.5MB"
}
```

#### Request Body Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | No | Document name |
| `category` | String | No | Document category |
| `version` | String | No | Version string |
| `filePath` | String | No | File path |
| `fileType` | String | No | `pdf`, `docx`, `xlsx`, `zip`, `png`, `jpg` |
| `fileSize` | String | No | File size |

#### Response: `201 Created`

Shape: `EvidenceDocumentResponse`.

---

### 8.4 UPDATE Evidence Document

```
PUT /api/v1/departments/{departmentId}/evidence/{id}
```

Same schema as §8.3. All fields optional.

#### Response: `200 OK`

---

### 8.5 DELETE Evidence Document

```
DELETE /api/v1/departments/{departmentId}/evidence/{id}
```

---

### 8.6 VERIFY Evidence Document

```
PUT /api/v1/departments/{departmentId}/evidence/{id}/verify
```

#### Request Body (JSON)

```json
{
  "comments": "Document verified successfully",
  "status": "verified"
}
```

#### Request Body Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `comments` | String | No | Verification comments |
| `status` | String | Yes | `verified`, `rejected` |

#### Response: `200 OK`

Shape: `EvidenceDocumentResponse`.

---

## 9. Workflow

All endpoints under `/api/v1/workflow`.

---

### 9.1 SUBMIT for Review

```
POST /api/v1/workflow/{entityType}/{entityId}/submit
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityType` | String | Yes | Entity type e.g. `faculty`, `student`, `publication` |
| `entityId` | Long | Yes | Entity ID |

#### Request Body (Optional)

```json
{
  "comments": "Ready for review"
}
```

#### Request Body Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `comments` | String | No | Review comments |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Submitted for review successfully",
  "data": "submitted",
  "timestamp": "2026-07-14T10:30:00"
}
```

---

### 9.2 VALIDATE (System Validation)

```
POST /api/v1/workflow/{entityType}/{entityId}/validate
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityType` | String | Yes | Entity type |
| `entityId` | Long | Yes | Entity ID |

#### Request Body (optional)

```json
{
  "comments": "System validation passed"
}
```

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Validation completed successfully",
  "data": "validated",
  "timestamp": "2026-07-14T10:30:00"
}
```

---

### 9.3 HOD REVIEW

```
POST /api/v1/workflow/{entityType}/{entityId}/hod-review
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityType` | String | Yes | Entity type |
| `entityId` | Long | Yes | Entity ID |

#### Request Body (optional)

```json
{
  "comments": "Approved by HOD"
}
```

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "HOD review completed",
  "data": "hod_review",
  "timestamp": "2026-07-14T10:30:00"
}
```

---

### 9.4 IQAC VERIFICATION

```
POST /api/v1/workflow/{entityType}/{entityId}/iqac-verify
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityType` | String | Yes | Entity type |
| `entityId` | Long | Yes | Entity ID |

#### Request Body (optional)

```json
{
  "comments": "Verified by IQAC"
}
```

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "IQAC verification completed",
  "data": "iqac_verification",
  "timestamp": "2026-07-14T10:30:00"
}
```

---

### 9.5 APPROVE (Final Approval)

```
POST /api/v1/workflow/{entityType}/{entityId}/approve
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityType` | String | Yes | Entity type |
| `entityId` | Long | Yes | Entity ID |

#### Request Body (optional)

```json
{
  "comments": "Approved"
}
```

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Approved successfully",
  "data": "approved",
  "timestamp": "2026-07-14T10:30:00"
}
```

---

### 9.6 REJECT

```
POST /api/v1/workflow/{entityType}/{entityId}/reject
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityType` | String | Yes | Entity type |
| `entityId` | Long | Yes | Entity ID |

#### Request Body (optional)

```json
{
  "comments": "Missing documentation"
}
```

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Rejected successfully",
  "data": "rejected",
  "timestamp": "2026-07-14T10:30:00"
}
```

---

### 9.7 GET Workflow History

```
GET /api/v1/workflow/{entityType}/{entityId}/history
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityType` | String | Yes | Entity type |
| `entityId` | Long | Yes | Entity ID |

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": 1,
      "entityType": "faculty",
      "entityId": 1,
      "fromStatus": "draft",
      "toStatus": "submitted",
      "actorId": 1,
      "actorRole": "DEPARTMENT_COORDINATOR",
      "comments": "Ready for review",
      "createdAt": "2026-07-14T10:30:00"
    }
  ],
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `WorkflowHistoryResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `entityType` | String | Entity type |
| `entityId` | Long | Entity ID |
| `fromStatus` | String | Previous workflow status |
| `toStatus` | String | New workflow status |
| `actorId` | Long (nullable) | User ID of actor |
| `actorRole` | String (nullable) | Role of actor |
| `comments` | String (nullable) | Comments |
| `createdAt` | String (datetime) | ISO datetime |

---

## 10. Repository Metrics

All endpoints under `/api/v1/departments/{departmentId}/metrics`.

---

### 10.1 GET All Repository Metrics

```
GET /api/v1/departments/{departmentId}/metrics
```

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": 1,
      "departmentId": 10,
      "repositoryType": "academic",
      "dataCompleteness": 85.00,
      "evidenceCompleteness": 72.00,
      "verificationPercent": 78.00,
      "readinessScore": 47.88,
      "lastCalculatedAt": "2026-07-14T10:30:00"
    },
    {
      "id": 2,
      "departmentId": 10,
      "repositoryType": "faculty",
      "dataCompleteness": 92.00,
      "evidenceCompleteness": 68.00,
      "verificationPercent": 85.00,
      "readinessScore": 53.04,
      "lastCalculatedAt": "2026-07-14T10:30:00"
    },
    {
      "id": 3,
      "departmentId": 10,
      "repositoryType": "student",
      "dataCompleteness": 78.00,
      "evidenceCompleteness": 65.00,
      "verificationPercent": 70.00,
      "readinessScore": 42.90,
      "lastCalculatedAt": "2026-07-14T10:30:00"
    },
    {
      "id": 4,
      "departmentId": 10,
      "repositoryType": "research",
      "dataCompleteness": 88.00,
      "evidenceCompleteness": 80.00,
      "verificationPercent": 90.00,
      "readinessScore": 59.40,
      "lastCalculatedAt": "2026-07-14T10:30:00"
    },
    {
      "id": 5,
      "departmentId": 10,
      "repositoryType": "alumni",
      "dataCompleteness": 60.00,
      "evidenceCompleteness": 45.00,
      "verificationPercent": 55.00,
      "readinessScore": 33.00,
      "lastCalculatedAt": "2026-07-14T10:30:00"
    }
  ],
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `RepositoryMetricsResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Primary key |
| `departmentId` | Long | Department ID |
| `repositoryType` | String | RepositoryType enum value (`academic`, `faculty`, `student`, `research`, `alumni`) |
| `dataCompleteness` | BigDecimal | Data completeness percentage |
| `evidenceCompleteness` | BigDecimal | Evidence completeness percentage |
| `verificationPercent` | BigDecimal | Verification percentage |
| `readinessScore` | BigDecimal | Composite readiness score |
| `lastCalculatedAt` | String (datetime) | ISO datetime of last calculation |

---

### 10.2 GET Metrics for Specific Repository

```
GET /api/v1/departments/{departmentId}/metrics/{repository}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `repository` | String | Yes | Repository type: `academic`, `faculty`, `student`, `research`, `alumni` |

#### Response: `200 OK`

Single `RepositoryMetricsResponse` object.

---

### 10.3 GET Dashboard KPIs

```
GET /api/v1/departments/{departmentId}/metrics/kpis
```

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "departmentId": 10,
    "totalFaculty": 45,
    "activeFaculty": 42,
    "totalStudents": 800,
    "activeStudents": 750,
    "totalPublications": 120,
    "totalPatents": 15,
    "totalGrants": 25,
    "totalAlumni": 500,
    "uploadedEvidence": 200,
    "pendingApprovals": 10,
    "overallReadiness": 73.50
  },
  "timestamp": "2026-07-14T10:30:00"
}
```

#### `DashboardKpiResponse` fields

| Field | Type | Description |
|-------|------|-------------|
| `departmentId` | Long | Department ID |
| `totalFaculty` | Long | Total faculty count |
| `activeFaculty` | Long | Active faculty count |
| `totalStudents` | Long | Total student count |
| `activeStudents` | Long | Active student count |
| `totalPublications` | Long | Total publications count |
| `totalPatents` | Long | Total patents count |
| `totalGrants` | Long | Total grants count |
| `totalAlumni` | Long | Total alumni count |
| `uploadedEvidence` | Long | Uploaded evidence count |
| `pendingApprovals` | Long | Pending approval count |
| `overallReadiness` | BigDecimal | Overall readiness score |

---

### 10.4 RECALCULATE Metrics

```
POST /api/v1/departments/{departmentId}/metrics/recalculate
```

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Metrics recalculated successfully",
  "data": [
    {
      "id": 1,
      "departmentId": 10,
      "repositoryType": "academic",
      "dataCompleteness": 87.00,
      "evidenceCompleteness": 73.00,
      "verificationPercent": 80.00,
      "readinessScore": 49.20,
      "lastCalculatedAt": "2026-07-14T11:00:00"
    }
  ],
  "timestamp": "2026-07-14T11:00:00"
}
```

---

## Appendix A: Enum Summaries

| Enum | Values |
|------|--------|
| `Gender` | `MALE`, `FEMALE`, `OTHER` |
| `Designation` | `PROFESSOR`, `ASSOCIATE_PROFESSOR`, `ASSISTANT_PROFESSOR` |
| `FacultyStatus` | `ACTIVE`, `RELIEVED` |
| `EmploymentType` | `REGULAR`, `CONTRACT`, `VISITING`, `ADJUNCT` |
| `WorkflowStatus` | `DRAFT`, `SUBMITTED`, `VALIDATED`, `EVIDENCE_PENDING`, `HOD_REVIEW`, `IQAC_VERIFICATION`, `APPROVED`, `REJECTED` |
| `RepositoryType` | `ACADEMIC`, `FACULTY`, `STUDENT`, `RESEARCH`, `ALUMNI` |

## Appendix B: HTTP Status Codes

| Code | Description |
|------|-------------|
| `200 OK` | Successful retrieval / update / delete |
| `201 Created` | Resource successfully created |
| `400 Bad Request` | Invalid input / validation failure |
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | Insufficient permissions |
| `404 Not Found` | Resource not found |
| `500 Internal Server Error` | Server-side error |

## Appendix C: Date / DateTime Formats

| Format | Example | Used for |
|--------|---------|---------|
| `YYYY-MM-DD` | `2024-01-15` | `dateOfBirth`, `startDate`, `endDate`, `filingDate`, etc. |
| `YYYY-MM-DDTHH:mm:ss` | `2026-07-14T10:30:00` | `createdAt`, `updatedAt`, `timestamp`, `lastCalculatedAt` |

---

> **Document Version:** 2.0 (AI-Ready Format)  
> **Generated:** July 14, 2026  
> **Total Endpoints Documented:** 117  
> **Purpose:** Machine-parsable, zero-ambiguity API reference for Department Coordinator scope.

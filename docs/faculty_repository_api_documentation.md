# Faculty Repository API Documentation

## Overview

This document provides **source-verified** API documentation for the **Faculty Repository** module under the **Department Coordinator** portal. All endpoints, parameters, and field names were extracted directly from `FacultyRepositoryController.java` and the corresponding request/response DTOs.

**Base URL:** `/api/v1/department-coordinator/faculty-repository`

**Authentication:** `Authorization: Bearer <your-jwt-token>`

---

## Common Response Wrapper

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "timestamp": "2026-07-24T10:30:00"
}
```

---

## Paginated Response Format

All list (GET) endpoints return paginated data inside `data`:

```json
{
  "content": [],
  "totalElements": 100,
  "totalPages": 5,
  "currentPage": 0,
  "size": 10
}
```

> **NOTE:** Pagination field is `"size"` (NOT `"pageSize"`). Default page size = **10** (not 20).

---

## 9. IMPORTANT NOTES (Read First!)

1. `academicYear` is **REQUIRED on ALL endpoints** (GET, POST, PUT, DELETE).
2. `departmentId` is always a **query parameter** — never a path variable.
3. `institutionId` is **NOT used** anywhere in faculty repository APIs.
4. Default page size is **10**. Pagination response uses field `"size"` (not `"pageSize"`).
5. **Faculty identifier field varies by section:**
   - Profiles, Qualifications, Employment, Professor of Practice → `empCode`
   - Memberships, FDP, Resource Persons, MOOCs → `employeeId`
6. **PUT paths for Professional Development sections are INCONSISTENT:**
   - FDP Update → `...fdp-participation/{id}` (SINGULAR — no trailing `s`)
   - Resource Person Update → `...faculty-resource-person/{id}` (different prefix)
   - MOOC Update → `...moocs-certification/{id}` (different suffix)
7. **CSV uploads:** `file` and `academicYear` are form parts (`@RequestPart`); `departmentId` is a query param.
8. **Evidence upload** needs query params `departmentId` + `uploadedBy`, plus form parts `file`, `academicYear`, `sectionName`, `recordId`.
9. **There is NO GET by ID** for any section. All reads are paginated list endpoints.

---

## 1. Faculty Profile APIs

### 1.1 Get Faculty Profiles (Paginated)
`GET /api/v1/department-coordinator/faculty-repository/profiles`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `academicYear` | String | YES | — | e.g., `"2025-26"` |
| `departmentId` | Long | YES | — | Department ID |
| `search` | String | No | — | Search by EMP code, name, or email |
| `status` | String | No | — | Filter by status (`Active`, `Relieved`) |
| `page` | Integer | No | `0` | Page number (0-indexed) |
| `size` | Integer | No | `10` | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty profiles retrieved successfully",
  "data": {
    "content": [{
      "id": 1,
      "empCode": "EMP001",
      "name": "Dr. John Doe",
      "pan": "ABCDE1234F",
      "aadhar": "123456789012",
      "gender": "MALE",
      "dob": "1990-01-15",
      "officialEmail": "john.doe@college.edu",
      "personalEmail": "john.personal@gmail.com",
      "mobileNumber": "9876543210",
      "currentDesignation": "Assistant Professor",
      "status": "Active",
      "dateOfLeaving": null,
      "departmentId": 5,
      "academicYear": "2025-26",
      "createdAt": "2026-01-10T10:00:00",
      "updatedAt": "2026-01-10T10:00:00"
    }],
    "totalElements": 1,
    "totalPages": 1,
    "currentPage": 0,
    "size": 10
  }
}
```

---

### 1.2 Create Faculty Profile
`POST /api/v1/department-coordinator/faculty-repository/profiles`

**Query Params:** `academicYear` (required), `departmentId` (required)

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `empCode` | String | YES | Employee code |
| `name` | String | YES | Full name |
| `pan` | String | No | PAN number |
| `aadhar` | String | No | Aadhaar number |
| `gender` | String | No | `MALE`, `FEMALE`, or `OTHER` |
| `dob` | String | No | `YYYY-MM-DD` |
| `officialEmail` | String | No | Official email |
| `personalEmail` | String | No | Personal email |
| `mobileNumber` | String | No | Mobile number |
| `currentDesignation` | String | No | Current designation |
| `status` | String | No | Default: `"Active"` |
| `dateOfLeaving` | String | No | `YYYY-MM-DD` |
| `academicYear` | String | No | Academic year |

```json
{
  "empCode": "EMP001",
  "name": "Dr. John Doe",
  "pan": "ABCDE1234F",
  "aadhar": "123456789012",
  "gender": "MALE",
  "dob": "1990-01-15",
  "officialEmail": "john.doe@college.edu",
  "personalEmail": "john.personal@gmail.com",
  "mobileNumber": "9876543210",
  "currentDesignation": "Assistant Professor",
  "status": "Active",
  "dateOfLeaving": null,
  "academicYear": "2025-26"
}
```

**Response (201 Created):** Returns `FacultyProfileResponse` object in `data`.

---

### 1.3 Update Faculty Profile
`PUT /api/v1/department-coordinator/faculty-repository/profiles/{id}`

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)  
**Request Body:** Same as Create Faculty Profile

---

### 1.4 Delete Faculty Profile
`DELETE /api/v1/department-coordinator/faculty-repository/profiles/{id}`

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)

---

### 1.5 Download Profiles CSV
`GET /api/v1/department-coordinator/faculty-repository/profiles/template`

**Query Params:** `academicYear` (required), `departmentId` (required)  
**Response:** `application/octet-stream` — `faculty_profiles_{academicYear}.csv`  
**Columns:** `EMP Code, Name, PAN, Aadhar, Gender, DOB, Official Email, Personal Email, Mobile Number, Current Designation, Status, Date of Leaving, Academic Year`

---

### 1.6 Upload Profiles CSV
`POST /api/v1/department-coordinator/faculty-repository/profiles/upload-csv`

**Content-Type:** `multipart/form-data`

| Part/Param | Source | Required |
|------------|--------|----------|
| `file` | Form Part | YES |
| `academicYear` | Form Part | YES |
| `departmentId` | Query Param | YES |

**CSV Column Order:** `EMP Code, Name, PAN, Aadhar, Gender, DOB (YYYY-MM-DD), Official Email, Personal Email, Mobile Number, Current Designation, Status, Date of Leaving (YYYY-MM-DD), Academic Year`

**Response (200 OK):**
```json
{
  "success": true,
  "data": { "savedCount": 10, "errors": [], "totalRecords": 10 }
}
```

---

## 2. Faculty Qualifications APIs

### 2.1 Get Qualifications (Paginated)
`GET /api/v1/department-coordinator/faculty-repository/qualifications`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `academicYear` | String | YES | — | Academic year |
| `departmentId` | Long | YES | — | Department ID |
| `empCode` | String | No | — | Filter by employee code |
| `page` | Integer | No | `0` | Page number |
| `size` | Integer | No | `10` | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Qualifications retrieved successfully",
  "data": {
    "content": [{
      "id": 1,
      "empCode": "EMP001",
      "facultyName": "Dr. John Doe",
      "qualificationLevel": "PhD",
      "degree": "Doctor of Philosophy",
      "specialization": "Computer Science",
      "university": "Anna University",
      "yearOfPassing": 2018,
      "phdStatus": "Awarded",
      "phdAwardedDate": "2018-06-15",
      "departmentId": 5,
      "academicYear": "2025-26",
      "createdAt": "2026-01-10T10:00:00",
      "updatedAt": "2026-01-10T10:00:00"
    }],
    "totalElements": 1, "totalPages": 1, "currentPage": 0, "size": 10
  }
}
```

---

### 2.2 Create Qualification
`POST /api/v1/department-coordinator/faculty-repository/qualifications`

**Query Params:** `academicYear` (required), `departmentId` (required)

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `empCode` | String | YES | Employee code |
| `facultyName` | String | YES | Faculty full name |
| `qualificationLevel` | String | YES | e.g., `UG`, `PG`, `PhD` |
| `degree` | String | YES | Degree name |
| `specialization` | String | No | Specialization/branch |
| `university` | String | No | University name |
| `yearOfPassing` | Integer | No | Year of passing |
| `phdStatus` | String | No | `Awarded`, `Pursuing` |
| `phdAwardedDate` | String | No | `YYYY-MM-DD` |
| `academicYear` | String | No | Academic year |

```json
{
  "empCode": "EMP001",
  "facultyName": "Dr. John Doe",
  "qualificationLevel": "PhD",
  "degree": "Doctor of Philosophy",
  "specialization": "Computer Science",
  "university": "Anna University",
  "yearOfPassing": 2018,
  "phdStatus": "Awarded",
  "phdAwardedDate": "2018-06-15",
  "academicYear": "2025-26"
}
```

---

### 2.3 Update Qualification
`PUT /api/v1/department-coordinator/faculty-repository/qualifications/{id}`

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)  
**Request Body:** Same as Create Qualification

---

### 2.4 Delete Qualification
`DELETE /api/v1/department-coordinator/faculty-repository/qualifications/{id}`

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)

---

### 2.5 Download Qualifications CSV
`GET /api/v1/department-coordinator/faculty-repository/qualifications/template`

**Query Params:** `academicYear` (required), `departmentId` (required)  
**Filename:** `qualifications_{academicYear}.csv`  
**Columns:** `EMP Code, Faculty Name, Qualification Level, Degree, Specialization, University, Year of Passing, PhD Status, PhD Awarded Date, Academic Year`

---

### 2.6 Upload Qualifications CSV
`POST /api/v1/department-coordinator/faculty-repository/qualifications/upload-csv`

| Part/Param | Source | Required |
|------------|--------|----------|
| `file` | Form Part | YES |
| `academicYear` | Form Part | YES |
| `departmentId` | Query Param | YES |

**CSV Column Order:** `EMP Code, Faculty Name, Qualification Level, Degree, Specialization, University, Year of Passing, PhD Status, PhD Awarded Date (YYYY-MM-DD), Academic Year`

---

## 3. Faculty Employment Information APIs

### 3.1 Get Employment Info (Paginated)
`GET /api/v1/department-coordinator/faculty-repository/employment`

**Query Parameters:**

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `academicYear` | String | YES | — |
| `departmentId` | Long | YES | — |
| `page` | Integer | No | `0` |
| `size` | Integer | No | `10` |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Employment info retrieved successfully",
  "data": {
    "content": [{
      "id": 1,
      "facultyId": null,
      "empCode": "EMP001",
      "facultyName": "Dr. John Doe",
      "aicteFacultyId": "AICTE-2020-001",
      "employmentType": "Regular",
      "natureOfAssociation": "Permanent",
      "dateOfJoiningInstitution": "2020-06-01",
      "dateOfJoiningDepartment": "2020-06-01",
      "joiningDesignation": "Assistant Professor",
      "totalExperience": 6.5,
      "experienceInCurrentInstitute": 5.0,
      "industryExperience": 1.5,
      "currentDesignationDate": "2020-06-01",
      "departmentId": 5,
      "academicYear": "2025-26",
      "createdAt": "2026-01-10T10:00:00",
      "updatedAt": "2026-01-10T10:00:00"
    }],
    "totalElements": 1, "totalPages": 1, "currentPage": 0, "size": 10
  }
}
```

---

### 3.2 Create Employment Info
`POST /api/v1/department-coordinator/faculty-repository/employment`

**Query Params:** `academicYear` (required), `departmentId` (required)

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `empCode` | String | YES | Employee code |
| `facultyName` | String | YES | Faculty full name |
| `aicteFacultyId` | String | No | AICTE Faculty ID |
| `employmentType` | String | YES | `Regular`, `Contract` |
| `natureOfAssociation` | String | YES | `Permanent`, `Temporary` |
| `dateOfJoiningInstitution` | String | YES | `YYYY-MM-DD` |
| `dateOfJoiningDepartment` | String | No | `YYYY-MM-DD` |
| `joiningDesignation` | String | No | Designation at joining |
| `totalExperience` | Double | No | Total years (default: `0.0`) |
| `experienceInCurrentInstitute` | Double | No | Years in current institute |
| `industryExperience` | Double | No | Industry years |
| `currentDesignationDate` | String | No | `YYYY-MM-DD` |
| `academicYear` | String | No | Academic year |

```json
{
  "empCode": "EMP001",
  "facultyName": "Dr. John Doe",
  "aicteFacultyId": "AICTE-2020-001",
  "employmentType": "Regular",
  "natureOfAssociation": "Permanent",
  "dateOfJoiningInstitution": "2020-06-01",
  "dateOfJoiningDepartment": "2020-06-01",
  "joiningDesignation": "Assistant Professor",
  "totalExperience": 6.5,
  "experienceInCurrentInstitute": 5.0,
  "industryExperience": 1.5,
  "currentDesignationDate": "2020-06-01",
  "academicYear": "2025-26"
}
```

---

### 3.3 Update Employment Info
`PUT /api/v1/department-coordinator/faculty-repository/employment/{id}`

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)  
**Request Body:** Same as Create Employment Info

---

### 3.4 Delete Employment Info
`DELETE /api/v1/department-coordinator/faculty-repository/employment/{id}`

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)

---

### 3.5 Download Employment CSV
`GET /api/v1/department-coordinator/faculty-repository/employment/template`

**Query Params:** `academicYear` (required), `departmentId` (required)  
**Filename:** `employment_info_{academicYear}.csv`  
**Columns:** `EMP Code, Faculty Name, AICTE Faculty ID, Employment Type, Nature of Association, Date of Joining Institution, Date of Joining Department, Joining Designation, Total Experience, Experience in Current Institute, Industry Experience, Current Designation Date, Academic Year`

---

### 3.6 Upload Employment CSV
`POST /api/v1/department-coordinator/faculty-repository/employment/upload-csv`

| Part/Param | Source | Required |
|------------|--------|----------|
| `file` | Form Part | YES |
| `academicYear` | Form Part | YES |
| `departmentId` | Query Param | YES |

**CSV Column Order:** `EMP Code, Faculty Name, AICTE Faculty ID, Employment Type, Nature of Association, Date of Joining Institution (YYYY-MM-DD), Date of Joining Department (YYYY-MM-DD), Joining Designation, Total Experience (Years), Experience in Current Institute (Years), Industry Experience (Years), Current Designation Date (YYYY-MM-DD), Academic Year`

---

## 4. Professor of Practice APIs

> **Route prefix:** `/profession-practice`  
> **Purpose:** Records where a faculty member coordinates with an external professional (PoP person). The PoP person's details use the `pop` field prefix.

### 4.1 Get Professor of Practice Records (Paginated)
`GET /api/v1/department-coordinator/faculty-repository/profession-practice`

**Query Parameters:**

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `academicYear` | String | YES | — |
| `departmentId` | Long | YES | — |
| `page` | Integer | No | `0` |
| `size` | Integer | No | `10` |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Professor of Practice records retrieved successfully",
  "data": {
    "content": [{
      "id": 1,
      "empCode": "EMP001",
      "facultyName": "Dr. John Doe",
      "popPersonName": "Mr. Rajesh Kumar",
      "popDesignation": "Senior Engineer",
      "popOrganization": "Infosys Ltd.",
      "popCourseName": "Cloud Computing",
      "popDuration": "6 months",
      "departmentId": 5,
      "academicYear": "2025-26",
      "createdAt": "2026-01-10T10:00:00",
      "updatedAt": "2026-01-10T10:00:00"
    }],
    "totalElements": 1, "totalPages": 1, "currentPage": 0, "size": 10
  }
}
```

---

### 4.2 Create Professor of Practice Record
`POST /api/v1/department-coordinator/faculty-repository/profession-practice`

**Query Params:** `academicYear` (required), `departmentId` (required)

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `empCode` | String | No | Faculty employee code |
| `facultyName` | String | No | Faculty full name |
| `popPersonName` | String | No | Name of the PoP person |
| `popDesignation` | String | No | Designation of the PoP person |
| `popOrganization` | String | No | Organization of the PoP person |
| `popCourseName` | String | No | Course handled by PoP |
| `popDuration` | String | No | Duration (e.g., `"6 months"`) |
| `academicYear` | String | No | Academic year |

```json
{
  "empCode": "EMP001",
  "facultyName": "Dr. John Doe",
  "popPersonName": "Mr. Rajesh Kumar",
  "popDesignation": "Senior Engineer",
  "popOrganization": "Infosys Ltd.",
  "popCourseName": "Cloud Computing",
  "popDuration": "6 months",
  "academicYear": "2025-26"
}
```

---

### 4.3 Update Professor of Practice Record
`PUT /api/v1/department-coordinator/faculty-repository/profession-practice/{id}`

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)  
**Request Body:** Same as Create

---

### 4.4 Delete Professor of Practice Record
`DELETE /api/v1/department-coordinator/faculty-repository/profession-practice/{id}`

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)

---

### 4.5 Download Professor of Practice CSV
`GET /api/v1/department-coordinator/faculty-repository/profession-practice/template`

**Filename:** `professor_of_practice_{academicYear}.csv`  
**Columns:** `EMP Code, Faculty Name, Person Name, Designation, Organization, Course Name, Duration, Academic Year`

---

### 4.6 Upload Professor of Practice CSV
`POST /api/v1/department-coordinator/faculty-repository/profession-practice/upload-csv`

| Part/Param | Source | Required |
|------------|--------|----------|
| `file` | Form Part | YES |
| `academicYear` | Form Part | YES |
| `departmentId` | Query Param | YES |

**CSV Column Order:** `EMP Code, Faculty Name, Person Name, Designation, Organization, Course Name, Duration, Academic Year`

---

## 5. Professional Development APIs

All professional development endpoints are under: `/professional-development/`

---

### 5.1 Professional Memberships

> **IMPORTANT:** The faculty identifier field here is `employeeId` (NOT `empCode`).

#### 5.1.1 Get Memberships (Paginated)
`GET /api/v1/department-coordinator/faculty-repository/professional-development/memberships`

**Query Parameters:** `academicYear` (required), `departmentId` (required), `page` (default: 0), `size` (default: 10)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Memberships retrieved successfully",
  "data": {
    "content": [{
      "id": 1,
      "employeeId": "EMP001",
      "facultyName": "Dr. John Doe",
      "professionalSocietyName": "IEEE",
      "societyType": "International",
      "membershipNumber": "IEEE-123456",
      "membershipGrade": "Senior Member",
      "positionHeld": "Member",
      "membershipStartDate": "2020-01-01",
      "membershipExpiryDate": "2025-12-31",
      "activeStatus": "Active",
      "remarks": "",
      "status": "Pending",
      "evidenceCount": 0,
      "evidence": [],
      "departmentId": 5,
      "academicYear": "2025-26",
      "createdAt": "2026-01-10T10:00:00",
      "updatedAt": "2026-01-10T10:00:00"
    }],
    "totalElements": 1, "totalPages": 1, "currentPage": 0, "size": 10
  }
}
```

---

#### 5.1.2 Create Membership
`POST /api/v1/department-coordinator/faculty-repository/professional-development/memberships`

**Query Params:** `academicYear` (required), `departmentId` (required)

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | String | YES | EMP code / employee ID |
| `facultyName` | String | YES | Faculty full name |
| `professionalSocietyName` | String | YES | Society name (e.g., IEEE, ACM) |
| `societyType` | String | YES | `International` or `National` |
| `membershipNumber` | String | No | Membership number |
| `membershipGrade` | String | No | Grade/level in society |
| `positionHeld` | String | No | Position held |
| `membershipStartDate` | String | YES | `YYYY-MM-DD` |
| `membershipExpiryDate` | String | No | `YYYY-MM-DD` |
| `activeStatus` | String | YES | `Active` or `Expired` |
| `remarks` | String | No | Additional remarks |
| `academicYear` | String | No | Academic year |

```json
{
  "employeeId": "EMP001",
  "facultyName": "Dr. John Doe",
  "professionalSocietyName": "IEEE",
  "societyType": "International",
  "membershipNumber": "IEEE-123456",
  "membershipGrade": "Senior Member",
  "positionHeld": "Member",
  "membershipStartDate": "2020-01-01",
  "membershipExpiryDate": "2025-12-31",
  "activeStatus": "Active",
  "remarks": "",
  "academicYear": "2025-26"
}
```

---

#### 5.1.3 Update Membership
`PUT /api/v1/department-coordinator/faculty-repository/professional-development/memberships/{id}`

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)  
**Request Body:** Same as Create Membership

---

#### 5.1.4 Delete Membership
`DELETE /api/v1/department-coordinator/faculty-repository/professional-development/memberships/{id}`

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)

---

#### 5.1.5 Upload Memberships CSV
`POST /api/v1/department-coordinator/faculty-repository/professional-development/memberships/upload-csv`

| Part/Param | Source | Required |
|------------|--------|----------|
| `file` | Form Part | YES |
| `academicYear` | Form Part | YES |
| `departmentId` | Query Param | YES |

**CSV Column Order:** `Employee ID, Faculty Name, Professional Society Name, Society Type, Membership Number, Membership Grade, Position Held, Membership Start Date (YYYY-MM-DD), Membership Expiry Date (YYYY-MM-DD), Active Status, Remarks`

---

### 5.2 FDP / STTP Participations

> **IMPORTANT:** The faculty identifier field here is `employeeId` (NOT `empCode`).  
> **PATH NOTE:** GET/POST/DELETE use `fdp-participations` (plural), but PUT and upload-csv use `fdp-participation` (SINGULAR).

#### 5.2.1 Get FDP Participations (Paginated)
`GET /api/v1/department-coordinator/faculty-repository/professional-development/fdp-participations`

**Query Parameters:** `academicYear` (required), `departmentId` (required), `page` (default: 0), `size` (default: 10)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "FDP Participations retrieved successfully",
  "data": {
    "content": [{
      "id": 1,
      "employeeId": "EMP001",
      "facultyName": "Dr. John Doe",
      "programType": "FDP",
      "programTitle": "Advanced Machine Learning",
      "themeArea": "AI",
      "organizedBy": "IIT Madras",
      "externalInternal": "External",
      "mode": "Online",
      "startDate": "2024-05-10",
      "endDate": "2024-05-15",
      "durationDays": 5,
      "location": "Chennai",
      "participationStatus": "Completed",
      "certificateReceived": "Yes",
      "remarks": "",
      "status": "Pending",
      "evidenceCount": 0,
      "evidence": [],
      "departmentId": 5,
      "academicYear": "2025-26",
      "createdAt": "2026-01-10T10:00:00",
      "updatedAt": "2026-01-10T10:00:00"
    }],
    "totalElements": 1, "totalPages": 1, "currentPage": 0, "size": 10
  }
}
```

---

#### 5.2.2 Create FDP Participation
`POST /api/v1/department-coordinator/faculty-repository/professional-development/fdp-participations`

**Query Params:** `academicYear` (required), `departmentId` (required)

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | String | YES | EMP code / employee ID |
| `facultyName` | String | YES | Faculty full name |
| `programType` | String | YES | `FDP`, `STTP`, `Workshop` |
| `programTitle` | String | YES | Title of the program |
| `themeArea` | String | No | Theme or area |
| `organizedBy` | String | YES | Organizing institution |
| `externalInternal` | String | YES | `External` or `Internal` |
| `mode` | String | YES | `Online`, `Offline`, `Hybrid` |
| `startDate` | String | YES | `YYYY-MM-DD` |
| `endDate` | String | No | `YYYY-MM-DD` |
| `durationDays` | Integer | No | Duration in days |
| `location` | String | No | Location/city |
| `participationStatus` | String | YES | `Completed`, `Ongoing` |
| `certificateReceived` | String | No | `Yes` or `No` |
| `remarks` | String | No | Additional remarks |
| `academicYear` | String | No | Academic year |

```json
{
  "employeeId": "EMP001",
  "facultyName": "Dr. John Doe",
  "programType": "FDP",
  "programTitle": "Advanced Machine Learning",
  "themeArea": "AI",
  "organizedBy": "IIT Madras",
  "externalInternal": "External",
  "mode": "Online",
  "startDate": "2024-05-10",
  "endDate": "2024-05-15",
  "durationDays": 5,
  "location": "Chennai",
  "participationStatus": "Completed",
  "certificateReceived": "Yes",
  "remarks": "",
  "academicYear": "2025-26"
}
```

---

#### 5.2.3 Update FDP Participation — SINGULAR PATH!
`PUT /api/v1/department-coordinator/faculty-repository/professional-development/fdp-participation/{id}`

> **Path is `fdp-participation` (SINGULAR), NOT `fdp-participations`.**

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)  
**Request Body:** Same as Create FDP Participation

---

#### 5.2.4 Delete FDP Participation
`DELETE /api/v1/department-coordinator/faculty-repository/professional-development/fdp-participations/{id}`

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)

---

#### 5.2.5 Upload FDP Participations CSV — SINGULAR PATH!
`POST /api/v1/department-coordinator/faculty-repository/professional-development/fdp-participation/upload-csv`

| Part/Param | Source | Required |
|------------|--------|----------|
| `file` | Form Part | YES |
| `academicYear` | Form Part | YES |
| `departmentId` | Query Param | YES |

**CSV Column Order:** `Employee ID, Faculty Name, Program Type, Program Title, Theme Area, Organized By, External/Internal, Mode, Start Date (YYYY-MM-DD), End Date (YYYY-MM-DD), Duration Days, Location, Participation Status, Certificate Received, Remarks`

---

### 5.3 Resource Persons (Faculty as Resource Person)

> **IMPORTANT:** The faculty identifier field here is `employeeId` (NOT `empCode`).  
> **PATH NOTE:** GET/POST/DELETE use `resource-persons`, but PUT and upload-csv use `faculty-resource-person` (different prefix).

#### 5.3.1 Get Resource Person Records (Paginated)
`GET /api/v1/department-coordinator/faculty-repository/professional-development/resource-persons`

**Query Parameters:** `academicYear` (required), `departmentId` (required), `page` (default: 0), `size` (default: 10)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Resource Persons retrieved successfully",
  "data": {
    "content": [{
      "id": 1,
      "employeeId": "EMP001",
      "facultyName": "Dr. John Doe",
      "eventType": "Seminar",
      "eventName": "Tech Innovations 2024",
      "topicDelivered": "AI in Healthcare",
      "organizedBy": "Tech Institute",
      "organization": "Healthcare Corp",
      "location": "Mumbai",
      "mode": "Offline",
      "startDate": "2024-06-20",
      "endDate": "2024-06-21",
      "duration": "2 Days",
      "audienceType": "Students",
      "numberOfParticipants": 150,
      "remarks": null,
      "status": "Pending",
      "evidenceCount": 0,
      "evidence": [],
      "departmentId": 5,
      "academicYear": "2025-26",
      "createdAt": "2026-01-10T10:00:00",
      "updatedAt": "2026-01-10T10:00:00"
    }],
    "totalElements": 1, "totalPages": 1, "currentPage": 0, "size": 10
  }
}
```

---

#### 5.3.2 Create Resource Person Record
`POST /api/v1/department-coordinator/faculty-repository/professional-development/resource-persons`

**Query Params:** `academicYear` (required), `departmentId` (required)

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | String | YES | EMP code / employee ID |
| `facultyName` | String | YES | Faculty full name |
| `eventType` | String | YES | `Seminar`, `Workshop`, `Conference` |
| `eventName` | String | YES | Name of the event |
| `topicDelivered` | String | YES | Topic delivered |
| `organizedBy` | String | YES | Organizing institution |
| `organization` | String | No | Inviting organization |
| `location` | String | No | Location/city |
| `mode` | String | YES | `Online`, `Offline`, `Hybrid` |
| `startDate` | String | YES | `YYYY-MM-DD` |
| `endDate` | String | No | `YYYY-MM-DD` |
| `duration` | String | No | e.g., `"2 Days"` |
| `audienceType` | String | No | `Students`, `Faculty` |
| `numberOfParticipants` | Integer | No | Number of participants |
| `academicYear` | String | No | Academic year |

```json
{
  "employeeId": "EMP001",
  "facultyName": "Dr. John Doe",
  "eventType": "Seminar",
  "eventName": "Tech Innovations 2024",
  "topicDelivered": "AI in Healthcare",
  "organizedBy": "Tech Institute",
  "organization": "Healthcare Corp",
  "location": "Mumbai",
  "mode": "Offline",
  "startDate": "2024-06-20",
  "endDate": "2024-06-21",
  "duration": "2 Days",
  "audienceType": "Students",
  "numberOfParticipants": 150,
  "academicYear": "2025-26"
}
```

---

#### 5.3.3 Update Resource Person Record — DIFFERENT PATH!
`PUT /api/v1/department-coordinator/faculty-repository/professional-development/faculty-resource-person/{id}`

> **Path is `faculty-resource-person`, NOT `resource-persons`.**

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)  
**Request Body:** Same as Create Resource Person Record

---

#### 5.3.4 Delete Resource Person Record
`DELETE /api/v1/department-coordinator/faculty-repository/professional-development/resource-persons/{id}`

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)

---

#### 5.3.5 Upload Resource Persons CSV — DIFFERENT PATH!
`POST /api/v1/department-coordinator/faculty-repository/professional-development/faculty-resource-person/upload-csv`

| Part/Param | Source | Required |
|------------|--------|----------|
| `file` | Form Part | YES |
| `academicYear` | Form Part | YES |
| `departmentId` | Query Param | YES |

**CSV Column Order:** `Employee ID, Faculty Name, Event Type, Event Name, Topic Delivered, Organized By, Organization, Location, Mode, Start Date (YYYY-MM-DD), End Date (YYYY-MM-DD), Duration, Audience Type, Number of Participants`

---

### 5.4 MOOC / Online Certifications

> **IMPORTANT:** The faculty identifier field here is `employeeId` (NOT `empCode`).  
> **PATH NOTE:** GET/POST/DELETE use `moocs`, but PUT and upload-csv use `moocs-certification` (different suffix).

#### 5.4.1 Get MOOC Records (Paginated)
`GET /api/v1/department-coordinator/faculty-repository/professional-development/moocs`

**Query Parameters:** `academicYear` (required), `departmentId` (required), `page` (default: 0), `size` (default: 10)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "MOOCs retrieved successfully",
  "data": {
    "content": [{
      "id": 1,
      "employeeId": "EMP001",
      "facultyName": "Dr. John Doe",
      "platform": "Coursera",
      "courseName": "Deep Learning Specialization",
      "courseCategory": "Technology",
      "conductedBy": "DeepLearning.AI",
      "startDate": "2023-09-01",
      "completionDate": "2023-12-01",
      "durationHours": 40,
      "grade": "A",
      "score": "95%",
      "certificationStatus": "Completed",
      "certificateId": "DL-12345",
      "remarks": null,
      "status": "Pending",
      "evidenceCount": 0,
      "evidence": [],
      "departmentId": 5,
      "academicYear": "2025-26",
      "createdAt": "2026-01-10T10:00:00",
      "updatedAt": "2026-01-10T10:00:00"
    }],
    "totalElements": 1, "totalPages": 1, "currentPage": 0, "size": 10
  }
}
```

---

#### 5.4.2 Create MOOC Record
`POST /api/v1/department-coordinator/faculty-repository/professional-development/moocs`

**Query Params:** `academicYear` (required), `departmentId` (required)

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | String | YES | EMP code / employee ID |
| `facultyName` | String | YES | Faculty full name |
| `platform` | String | YES | `Coursera`, `NPTEL`, `edX`, etc. |
| `courseName` | String | YES | Course name |
| `courseCategory` | String | No | `Technology`, `Management`, etc. |
| `conductedBy` | String | No | Course author/provider |
| `startDate` | String | YES | `YYYY-MM-DD` |
| `completionDate` | String | No | `YYYY-MM-DD` |
| `durationHours` | Integer | No | Duration in hours |
| `grade` | String | No | Grade received |
| `score` | String | No | Score (e.g., `"95%"`) |
| `certificationStatus` | String | YES | `Completed`, `In Progress` |
| `certificateId` | String | No | Certificate ID or code |
| `academicYear` | String | No | Academic year |

```json
{
  "employeeId": "EMP001",
  "facultyName": "Dr. John Doe",
  "platform": "Coursera",
  "courseName": "Deep Learning Specialization",
  "courseCategory": "Technology",
  "conductedBy": "DeepLearning.AI",
  "startDate": "2023-09-01",
  "completionDate": "2023-12-01",
  "durationHours": 40,
  "grade": "A",
  "score": "95%",
  "certificationStatus": "Completed",
  "certificateId": "DL-12345",
  "academicYear": "2025-26"
}
```

---

#### 5.4.3 Update MOOC Record — DIFFERENT PATH!
`PUT /api/v1/department-coordinator/faculty-repository/professional-development/moocs-certification/{id}`

> **Path is `moocs-certification`, NOT `moocs`.**

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)  
**Request Body:** Same as Create MOOC Record

---

#### 5.4.4 Delete MOOC Record
`DELETE /api/v1/department-coordinator/faculty-repository/professional-development/moocs/{id}`

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)

---

#### 5.4.5 Upload MOOC Certifications CSV — DIFFERENT PATH!
`POST /api/v1/department-coordinator/faculty-repository/professional-development/moocs-certification/upload-csv`

| Part/Param | Source | Required |
|------------|--------|----------|
| `file` | Form Part | YES |
| `academicYear` | Form Part | YES |
| `departmentId` | Query Param | YES |

**CSV Column Order:** `Employee ID, Faculty Name, Platform, Course Name, Course Category, Conducted By, Start Date (YYYY-MM-DD), Completion Date (YYYY-MM-DD), Duration Hours, Grade, Score, Certification Status, Certificate ID`

---

### 5.5 Department Organized Programs

#### 5.5.1 Get Dept Organized Programs (Paginated)
`GET /api/v1/department-coordinator/faculty-repository/professional-development/dept-organized`

**Query Parameters:** `academicYear` (required), `departmentId` (required), `page` (default: 0), `size` (default: 10)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Dept Organized FDPs retrieved successfully",
  "data": {
    "content": [{
      "id": 1,
      "programName": "National Conference on Computing",
      "programType": "Conference",
      "theme": "Cloud Computing",
      "organizedBy": "CSE Department",
      "collaboratingOrganization": "Tech Society",
      "startDate": "2024-11-10",
      "endDate": "2024-11-12",
      "duration": "3 Days",
      "chiefGuest": "Dr. Alan Turing",
      "resourcePersons": "Dr. X, Dr. Y",
      "numberOfParticipants": 200,
      "mode": "Hybrid",
      "remarks": "",
      "status": "Pending",
      "evidenceCount": 0,
      "evidence": [],
      "departmentId": 5,
      "academicYear": "2025-26",
      "createdAt": "2026-01-10T10:00:00",
      "updatedAt": "2026-01-10T10:00:00"
    }],
    "totalElements": 1, "totalPages": 1, "currentPage": 0, "size": 10
  }
}
```

---

#### 5.5.2 Create Dept Organized Program
`POST /api/v1/department-coordinator/faculty-repository/professional-development/dept-organized`

**Query Params:** `academicYear` (required), `departmentId` (required)

**Request Body (application/json):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `programName` | String | YES | Program name |
| `programType` | String | YES | `Conference`, `Workshop`, `FDP` |
| `theme` | String | No | Theme of the program |
| `organizedBy` | String | YES | Organizing department/body |
| `collaboratingOrganization` | String | No | Collaborating organization |
| `startDate` | String | YES | `YYYY-MM-DD` |
| `endDate` | String | No | `YYYY-MM-DD` |
| `duration` | String | No | e.g., `"3 Days"` |
| `chiefGuest` | String | No | Name of chief guest |
| `resourcePersons` | String | No | Comma-separated resource persons |
| `numberOfParticipants` | Integer | No | Number of participants |
| `mode` | String | YES | `Online`, `Offline`, `Hybrid` |
| `remarks` | String | No | Additional remarks |
| `academicYear` | String | No | Academic year |

```json
{
  "programName": "National Conference on Computing",
  "programType": "Conference",
  "theme": "Cloud Computing",
  "organizedBy": "CSE Department",
  "collaboratingOrganization": "Tech Society",
  "startDate": "2024-11-10",
  "endDate": "2024-11-12",
  "duration": "3 Days",
  "chiefGuest": "Dr. Alan Turing",
  "resourcePersons": "Dr. X, Dr. Y",
  "numberOfParticipants": 200,
  "mode": "Hybrid",
  "remarks": "",
  "academicYear": "2025-26"
}
```

---

#### 5.5.3 Update Dept Organized Program
`PUT /api/v1/department-coordinator/faculty-repository/professional-development/dept-organized/{id}`

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)  
**Request Body:** Same as Create Dept Organized Program

---

#### 5.5.4 Delete Dept Organized Program
`DELETE /api/v1/department-coordinator/faculty-repository/professional-development/dept-organized/{id}`

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)

---

#### 5.5.5 Upload Dept Organized Programs CSV
`POST /api/v1/department-coordinator/faculty-repository/professional-development/dept-organized/upload-csv`

| Part/Param | Source | Required |
|------------|--------|----------|
| `file` | Form Part | YES |
| `academicYear` | Form Part | YES |
| `departmentId` | Query Param | YES |

**CSV Column Order:** `Program Name, Program Type, Theme, Organized By, Collaborating Organization, Start Date (YYYY-MM-DD), End Date (YYYY-MM-DD), Duration, Chief Guest, Resource Persons, Number of Participants, Mode, Remarks`

---

## 6. Evidence APIs

### 6.1 Upload Evidence Document
`POST /api/v1/department-coordinator/faculty-repository/evidence/upload`

**Content-Type:** `multipart/form-data`

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | YES | The evidence file to upload |
| `academicYear` | String | YES | Academic year |
| `sectionName` | String | YES | Section name (e.g., `memberships`, `fdp-participations`, `moocs`, `resource-persons`, `dept-organized`) |
| `recordId` | Long | YES | ID of the associated record in that section |
| `yearOfStudy` | String | No | Year of study (if applicable) |
| `semester` | String | No | Semester (if applicable) |
| `documentType` | String | No | Document type description |

**Query Parameters (`@RequestParam`):**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | YES | Department ID |
| `uploadedBy` | Long | YES | User ID of the uploader |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Evidence uploaded successfully",
  "data": {
    "id": 1,
    "departmentId": 5,
    "academicYear": "2025-26",
    "yearOfStudy": null,
    "semester": null,
    "sectionName": "memberships",
    "recordId": 10,
    "documentName": "membership_certificate",
    "documentType": "Certificate",
    "fileName": "membership_certificate.pdf",
    "fileSize": 204800,
    "fileType": "application/pdf",
    "uploadedBy": "1",
    "uploadedAt": "2026-07-26T10:30:00",
    "verificationStatus": null,
    "verifiedBy": null,
    "verifiedAt": null,
    "createdAt": "2026-07-26T10:30:00",
    "updatedAt": "2026-07-26T10:30:00"
  }
}
```

---

### 6.2 Get Evidence Documents (Paginated)
`GET /api/v1/department-coordinator/faculty-repository/evidence`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `academicYear` | String | YES | — | Academic year |
| `departmentId` | Long | YES | — | Department ID |
| `empCode` | String | No | — | Filter by employee code |
| `category` | String | No | — | Filter by category/section name |
| `status` | String | No | — | Filter by status |
| `page` | Integer | No | `0` | Page number |
| `size` | Integer | No | `10` | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Evidence retrieved successfully",
  "data": {
    "content": [{
      "id": 1,
      "empCode": "EMP001",
      "facultyName": "Dr. John Doe",
      "name": "membership_certificate",
      "category": "memberships",
      "version": "1.0",
      "uploadedBy": "Admin User",
      "uploadedDate": "2026-07-26",
      "status": "Pending",
      "fileType": "application/pdf",
      "fileSize": "200 KB",
      "remarks": null,
      "departmentId": 5,
      "academicYear": "2025-26",
      "createdAt": "2026-07-26T10:30:00"
    }],
    "totalElements": 1, "totalPages": 1, "currentPage": 0, "size": 10
  }
}
```

---

### 6.3 Delete Evidence Document
`DELETE /api/v1/department-coordinator/faculty-repository/evidence/{id}`

**Path Params:** `id` (Long)  
**Query Params:** `academicYear` (required), `departmentId` (required)

---

## 7. Repository Health Metrics API

### 7.1 Get Health Metrics
`GET /api/v1/department-coordinator/faculty-repository/health`

**Query Parameters:** `academicYear` (required), `departmentId` (required)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Health metrics retrieved successfully",
  "data": {
    "tabId": "faculty-repository",
    "totalRecords": 50,
    "validRecords": 45,
    "invalidRecords": 5,
    "completeness": 90.0,
    "evidenceCount": 30,
    "verifiedCount": 20,
    "pendingCount": 10
  }
}
```

---

## 8. Quick Reference — All Endpoint URLs

### Faculty Profiles
| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/department-coordinator/faculty-repository/profiles` |
| POST | `/api/v1/department-coordinator/faculty-repository/profiles` |
| PUT | `/api/v1/department-coordinator/faculty-repository/profiles/{id}` |
| DELETE | `/api/v1/department-coordinator/faculty-repository/profiles/{id}` |
| GET | `/api/v1/department-coordinator/faculty-repository/profiles/template` |
| POST | `/api/v1/department-coordinator/faculty-repository/profiles/upload-csv` |

### Qualifications
| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/department-coordinator/faculty-repository/qualifications` |
| POST | `/api/v1/department-coordinator/faculty-repository/qualifications` |
| PUT | `/api/v1/department-coordinator/faculty-repository/qualifications/{id}` |
| DELETE | `/api/v1/department-coordinator/faculty-repository/qualifications/{id}` |
| GET | `/api/v1/department-coordinator/faculty-repository/qualifications/template` |
| POST | `/api/v1/department-coordinator/faculty-repository/qualifications/upload-csv` |

### Employment Info
| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/department-coordinator/faculty-repository/employment` |
| POST | `/api/v1/department-coordinator/faculty-repository/employment` |
| PUT | `/api/v1/department-coordinator/faculty-repository/employment/{id}` |
| DELETE | `/api/v1/department-coordinator/faculty-repository/employment/{id}` |
| GET | `/api/v1/department-coordinator/faculty-repository/employment/template` |
| POST | `/api/v1/department-coordinator/faculty-repository/employment/upload-csv` |

### Professor of Practice
| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/department-coordinator/faculty-repository/profession-practice` |
| POST | `/api/v1/department-coordinator/faculty-repository/profession-practice` |
| PUT | `/api/v1/department-coordinator/faculty-repository/profession-practice/{id}` |
| DELETE | `/api/v1/department-coordinator/faculty-repository/profession-practice/{id}` |
| GET | `/api/v1/department-coordinator/faculty-repository/profession-practice/template` |
| POST | `/api/v1/department-coordinator/faculty-repository/profession-practice/upload-csv` |

### Professional Memberships
| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/department-coordinator/faculty-repository/professional-development/memberships` |
| POST | `/api/v1/department-coordinator/faculty-repository/professional-development/memberships` |
| PUT | `/api/v1/department-coordinator/faculty-repository/professional-development/memberships/{id}` |
| DELETE | `/api/v1/department-coordinator/faculty-repository/professional-development/memberships/{id}` |
| POST | `/api/v1/department-coordinator/faculty-repository/professional-development/memberships/upload-csv` |

### FDP / STTP Participations (INCONSISTENT PATHS)
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/v1/department-coordinator/faculty-repository/professional-development/fdp-participations` | Plural |
| POST | `/api/v1/department-coordinator/faculty-repository/professional-development/fdp-participations` | Plural |
| PUT | `/api/v1/department-coordinator/faculty-repository/professional-development/fdp-participation/{id}` | SINGULAR! |
| DELETE | `/api/v1/department-coordinator/faculty-repository/professional-development/fdp-participations/{id}` | Plural |
| POST | `/api/v1/department-coordinator/faculty-repository/professional-development/fdp-participation/upload-csv` | SINGULAR! |

### Resource Persons (INCONSISTENT PATHS)
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/v1/department-coordinator/faculty-repository/professional-development/resource-persons` | |
| POST | `/api/v1/department-coordinator/faculty-repository/professional-development/resource-persons` | |
| PUT | `/api/v1/department-coordinator/faculty-repository/professional-development/faculty-resource-person/{id}` | DIFFERENT PREFIX! |
| DELETE | `/api/v1/department-coordinator/faculty-repository/professional-development/resource-persons/{id}` | |
| POST | `/api/v1/department-coordinator/faculty-repository/professional-development/faculty-resource-person/upload-csv` | DIFFERENT PREFIX! |

### MOOC / Online Certifications (INCONSISTENT PATHS)
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/v1/department-coordinator/faculty-repository/professional-development/moocs` | |
| POST | `/api/v1/department-coordinator/faculty-repository/professional-development/moocs` | |
| PUT | `/api/v1/department-coordinator/faculty-repository/professional-development/moocs-certification/{id}` | DIFFERENT SUFFIX! |
| DELETE | `/api/v1/department-coordinator/faculty-repository/professional-development/moocs/{id}` | |
| POST | `/api/v1/department-coordinator/faculty-repository/professional-development/moocs-certification/upload-csv` | DIFFERENT SUFFIX! |

### Dept Organized Programs
| Method | Endpoint |
|--------|----------|
| GET | `/api/v1/department-coordinator/faculty-repository/professional-development/dept-organized` |
| POST | `/api/v1/department-coordinator/faculty-repository/professional-development/dept-organized` |
| PUT | `/api/v1/department-coordinator/faculty-repository/professional-development/dept-organized/{id}` |
| DELETE | `/api/v1/department-coordinator/faculty-repository/professional-development/dept-organized/{id}` |
| POST | `/api/v1/department-coordinator/faculty-repository/professional-development/dept-organized/upload-csv` |

### Evidence & Health
| Method | Endpoint |
|--------|----------|
| POST | `/api/v1/department-coordinator/faculty-repository/evidence/upload` |
| GET | `/api/v1/department-coordinator/faculty-repository/evidence` |
| DELETE | `/api/v1/department-coordinator/faculty-repository/evidence/{id}` |
| GET | `/api/v1/department-coordinator/faculty-repository/health` |

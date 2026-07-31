# Alumni Repository API Documentation

## Overview

This document provides comprehensive API documentation for the **Alumni Repository** module in the Department Coordinator portal. These APIs facilitate the management of alumni profiles, career tracking (employment & higher education), alumni engagement, financial and non-financial contributions, mentorship programs, achievements, chapters, events, evidence document uploads, bulk operations, and repository health metrics.

**Base URL:** `/api/v1/department-coordinator/alumni-repository`

**Swagger Tag:** `DC - Alumni Repository`

**Authentication:** All APIs require a valid JWT token in the `Authorization` header:
```http
Authorization: Bearer <your-jwt-token>
```

---

## Common Response Format

All standard APIs return responses in the following format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-07-28T14:00:00"
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description here",
  "timestamp": "2026-07-28T14:00:00"
}
```

---

## Paginated Data Response Format

List endpoints returning paginated records use the following structure inside the `data` field:

```json
{
  "content": [ ... ],
  "totalElements": 100,
  "totalPages": 10,
  "currentPage": 0,
  "size": 10,
  "first": true,
  "last": false
}
```

---

## 1. Alumni Details APIs (Step 1)

### 1.1 Get All Alumni Details

Retrieves a paginated list of alumni profile records filtered by department, academic year, and search criteria.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/details`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department identifier |
| `academicYear` | String | Yes | - | Academic year (e.g., "2025-26") |
| `department` | String | No | - | Department code or name |
| `program` | String | No | - | Program name (e.g., "B.Tech", "M.Tech") |
| `graduationYear` | String | No | - | Graduation year (e.g., "2024") |
| `alumniStatus` | String | No | - | Alumni status filter (e.g., "ACTIVE", "INACTIVE") |
| `search` | String | No | - | Search by alumni name, ID, email, or roll number |
| `page` | Integer | No | 0 | Page index (0-indexed) |
| `size` | Integer | No | 10 | Records per page |
| `sortBy` | String | No | createdAt | Sort field |
| `sortDirection` | String | No | DESC | Sort direction (ASC or DESC) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alumni details retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "alumniId": "ALM-2024-001",
        "alumniName": "Rahul Sharma",
        "rollNumber": "2020CSE01",
        "department": "Computer Science & Engineering",
        "program": "B.Tech",
        "specialization": "Data Science",
        "graduationYear": "2024",
        "personalEmail": "rahul.sharma@gmail.com",
        "mobileNumber": "+91 9876543210",
        "currentCity": "Bangalore",
        "currentCountry": "India",
        "linkedinProfile": "https://linkedin.com/in/rahulsharma",
        "alumniStatus": "ACTIVE",
        "workflowStatus": "APPROVED",
        "departmentId": 10,
        "institutionId": 1,
        "academicYear": "2025-26",
        "createdAt": "2026-07-28T10:00:00",
        "updatedAt": "2026-07-28T10:00:00"
      }
    ],
    "totalElements": 45,
    "totalPages": 5,
    "currentPage": 0,
    "size": 10
  }
}
```

---

### 1.2 Get Alumni Details by ID

Retrieves a single alumni record by its unique database ID.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/details/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Alumni record database ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alumni record retrieved successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "alumniName": "Rahul Sharma",
    "rollNumber": "2020CSE01",
    "department": "Computer Science & Engineering",
    "program": "B.Tech",
    "specialization": "Data Science",
    "graduationYear": "2024",
    "personalEmail": "rahul.sharma@gmail.com",
    "mobileNumber": "+91 9876543210",
    "currentCity": "Bangalore",
    "currentCountry": "India",
    "linkedinProfile": "https://linkedin.com/in/rahulsharma",
    "alumniStatus": "ACTIVE",
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "institutionId": 1,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 1.3 Create Alumni Details

Creates a new alumni profile record.

**Endpoint:** `POST /api/v1/department-coordinator/alumni-repository/details`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `institutionId` | Long | No | 1 | Institution ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `alumniId` | String | Yes | Unique Alumni Code / Roll Number |
| `alumniName` | String | Yes | Full Name of the Alumni |
| `rollNumber` | String | Yes | Student Roll Number |
| `department` | String | Yes | Department Name |
| `program` | String | Yes | Degree Program |
| `specialization` | String | No | Branch / Specialization |
| `graduationYear` | String | Yes | Year of Graduation |
| `personalEmail` | String | Yes | Valid email address |
| `mobileNumber` | String | No | Phone number |
| `currentCity` | String | No | Current city of residence |
| `currentCountry` | String | No | Current country of residence |
| `linkedinProfile` | String | No | LinkedIn profile URL |
| `alumniStatus` | String | No | Status (default: "ACTIVE") |

**Request Example:**
```json
{
  "alumniId": "ALM-2024-001",
  "alumniName": "Rahul Sharma",
  "rollNumber": "2020CSE01",
  "department": "Computer Science & Engineering",
  "program": "B.Tech",
  "specialization": "Data Science",
  "graduationYear": "2024",
  "personalEmail": "rahul.sharma@gmail.com",
  "mobileNumber": "+91 9876543210",
  "currentCity": "Bangalore",
  "currentCountry": "India",
  "linkedinProfile": "https://linkedin.com/in/rahulsharma",
  "alumniStatus": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Alumni record created successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "alumniName": "Rahul Sharma",
    "rollNumber": "2020CSE01",
    "department": "Computer Science & Engineering",
    "program": "B.Tech",
    "specialization": "Data Science",
    "graduationYear": "2024",
    "personalEmail": "rahul.sharma@gmail.com",
    "mobileNumber": "+91 9876543210",
    "currentCity": "Bangalore",
    "currentCountry": "India",
    "linkedinProfile": "https://linkedin.com/in/rahulsharma",
    "alumniStatus": "ACTIVE",
    "workflowStatus": "PENDING_VERIFICATION",
    "departmentId": 10,
    "institutionId": 1,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 1.4 Update Alumni Details

Updates an existing alumni profile record.

**Endpoint:** `PUT /api/v1/department-coordinator/alumni-repository/details/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Alumni record database ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:** Same as Create Alumni Details

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alumni record updated successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "alumniName": "Rahul Sharma",
    "rollNumber": "2020CSE01",
    "department": "Computer Science & Engineering",
    "program": "B.Tech",
    "specialization": "AI & ML",
    "graduationYear": "2024",
    "personalEmail": "rahul.sharma@gmail.com",
    "mobileNumber": "+91 9876543210",
    "currentCity": "Hyderabad",
    "currentCountry": "India",
    "linkedinProfile": "https://linkedin.com/in/rahulsharma",
    "alumniStatus": "ACTIVE",
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "institutionId": 1,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T11:30:00"
  }
}
```

---

### 1.5 Delete Alumni Details

Deletes an alumni record.

**Endpoint:** `DELETE /api/v1/department-coordinator/alumni-repository/details/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Alumni record database ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alumni record deleted successfully",
  "data": null
}
```

---

### 1.6 Upload Alumni Details via CSV

Uploads multiple alumni records via a CSV file.

**Endpoint:** `POST /api/v1/department-coordinator/alumni-repository/details/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file containing alumni details |
| `request` | JSON | No | `AlumniTemplateUploadRequest` (`academicYear`, `department`, `replaceExisting`) |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Alumni details uploaded successfully",
  "data": {
    "totalRecords": 50,
    "successCount": 48,
    "failureCount": 2,
    "errors": [
      "Row 12: Duplicate Roll Number 2020CSE12",
      "Row 35: Invalid Email format"
    ]
  }
}
```

---

### 1.7 Download Alumni Details CSV Template

Downloads a standard CSV template for uploading alumni details.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/details/template`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `format` | String | No | csv | File format (`csv`) |

**Response (200 OK):** Binary file download (`Content-Type: text/csv`, `attachment; filename=alumni_details_template.csv`)

---

## 2. Employment & Career APIs (Step 2)

### 2.1 Get All Employment Records

Retrieves a paginated list of employment and placement records.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/employment`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | No | 2025-26 | Academic year |
| `alumniId` | String | No | - | Filter by Alumni ID |
| `industrySector` | String | No | - | Industry sector filter (e.g., "IT", "Finance", "Healthcare") |
| `employmentType` | String | No | - | Type filter (Full-time, Part-time, Entrepreneur) |
| `page` | Integer | No | 0 | Page index (0-indexed) |
| `size` | Integer | No | 10 | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Employment records retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "alumniId": "ALM-2024-001",
        "organizationName": "Google",
        "designation": "Software Engineer",
        "industrySector": "IT / Software",
        "employmentType": "Full-time",
        "startDate": "2024-07-01",
        "currentPackage": 1800000.00,
        "careerLevel": "Entry Level",
        "workflowStatus": "APPROVED",
        "departmentId": 10,
        "academicYear": "2025-26",
        "createdAt": "2026-07-28T10:00:00",
        "updatedAt": "2026-07-28T10:00:00"
      }
    ],
    "totalElements": 30,
    "totalPages": 3,
    "currentPage": 0,
    "size": 10
  }
}
```

---

### 2.2 Get Employment Record by ID

Retrieves a single employment record by its database ID.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/employment/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Employment record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Employment record retrieved successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "organizationName": "Google",
    "designation": "Software Engineer",
    "industrySector": "IT / Software",
    "employmentType": "Full-time",
    "startDate": "2024-07-01",
    "currentPackage": 1800000.00,
    "careerLevel": "Entry Level",
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 2.3 Create Employment Record

Creates a new employment / career record for an alumni.

**Endpoint:** `POST /api/v1/department-coordinator/alumni-repository/employment`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `alumniId` | String | Yes | Alumni ID |
| `organizationName` | String | Yes | Company / Organization Name |
| `designation` | String | Yes | Job Designation |
| `industrySector` | String | Yes | Industry domain |
| `employmentType` | String | No | Full-time / Part-time / Freelance / Entrepreneur |
| `startDate` | Date (YYYY-MM-DD) | Yes | Joining date |
| `currentPackage` | BigDecimal | No | Annual CTC / Salary |
| `careerLevel` | String | No | Entry / Mid / Senior Level |

**Request Example:**
```json
{
  "alumniId": "ALM-2024-001",
  "organizationName": "Google",
  "designation": "Software Engineer",
  "industrySector": "IT / Software",
  "employmentType": "Full-time",
  "startDate": "2024-07-01",
  "currentPackage": 1800000.00,
  "careerLevel": "Entry Level"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Employment record created successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "organizationName": "Google",
    "designation": "Software Engineer",
    "industrySector": "IT / Software",
    "employmentType": "Full-time",
    "startDate": "2024-07-01",
    "currentPackage": 1800000.00,
    "careerLevel": "Entry Level",
    "workflowStatus": "PENDING_VERIFICATION",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 2.4 Update Employment Record

Updates an existing employment record.

**Endpoint:** `PUT /api/v1/department-coordinator/alumni-repository/employment/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Employment record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:** Same as Create Employment Record

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Employment record updated successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "organizationName": "Google",
    "designation": "Senior Software Engineer",
    "industrySector": "IT / Software",
    "employmentType": "Full-time",
    "startDate": "2024-07-01",
    "currentPackage": 2400000.00,
    "careerLevel": "Mid Level",
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T11:45:00"
  }
}
```

---

### 2.5 Delete Employment Record

Deletes an employment record.

**Endpoint:** `DELETE /api/v1/department-coordinator/alumni-repository/employment/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Employment record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Employment record deleted successfully",
  "data": null
}
```

---

### 2.6 Upload Employment Records via CSV

Uploads multiple employment records via CSV file.

**Endpoint:** `POST /api/v1/department-coordinator/alumni-repository/employment/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file with employment records |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Employment CSV processed successfully",
  "data": {
    "message": "Employment CSV processed successfully"
  }
}
```

---

## 3. Higher Education APIs (Step 3)

### 3.1 Get All Higher Education Records

Retrieves a paginated list of alumni pursuing higher education (MS, M.Tech, PhD, MBA, etc.).

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/higher-education`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | No | 2025-26 | Academic year |
| `alumniId` | String | No | - | Filter by Alumni ID |
| `status` | String | No | - | Status filter (e.g., "PURSUING", "COMPLETED") |
| `page` | Integer | No | 0 | Page index (0-indexed) |
| `size` | Integer | No | 10 | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Higher education records retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "alumniId": "ALM-2024-002",
        "institutionName": "Stanford University",
        "programName": "MS in Computer Science",
        "country": "United States",
        "admissionYear": "2024",
        "completionYear": "2026",
        "status": "PURSUING",
        "workflowStatus": "APPROVED",
        "departmentId": 10,
        "academicYear": "2025-26",
        "createdAt": "2026-07-28T10:00:00",
        "updatedAt": "2026-07-28T10:00:00"
      }
    ],
    "totalElements": 15,
    "totalPages": 2,
    "currentPage": 0,
    "size": 10
  }
}
```

---

### 3.2 Get Higher Education Record by ID

Retrieves a single higher education record by ID.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/higher-education/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Higher Education record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Higher education record retrieved successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-002",
    "institutionName": "Stanford University",
    "programName": "MS in Computer Science",
    "country": "United States",
    "admissionYear": "2024",
    "completionYear": "2026",
    "status": "PURSUING",
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 3.3 Create Higher Education Record

Creates a new higher education record.

**Endpoint:** `POST /api/v1/department-coordinator/alumni-repository/higher-education`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `alumniId` | String | Yes | Alumni ID |
| `institutionName` | String | Yes | University / College Name |
| `programName` | String | Yes | Degree / Program Name (e.g., MS, MBA) |
| `country` | String | Yes | Country of study |
| `admissionYear` | String | Yes | Year of admission |
| `completionYear` | String | No | Expected/actual year of completion |
| `status` | String | No | Status (e.g., "PURSUING", "COMPLETED") |

**Request Example:**
```json
{
  "alumniId": "ALM-2024-002",
  "institutionName": "Stanford University",
  "programName": "MS in Computer Science",
  "country": "United States",
  "admissionYear": "2024",
  "completionYear": "2026",
  "status": "PURSUING"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Higher education record created successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-002",
    "institutionName": "Stanford University",
    "programName": "MS in Computer Science",
    "country": "United States",
    "admissionYear": "2024",
    "completionYear": "2026",
    "status": "PURSUING",
    "workflowStatus": "PENDING_VERIFICATION",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 3.4 Update Higher Education Record

Updates an existing higher education record.

**Endpoint:** `PUT /api/v1/department-coordinator/alumni-repository/higher-education/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Higher Education record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:** Same as Create Higher Education Record

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Higher education record updated successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-002",
    "institutionName": "Stanford University",
    "programName": "MS in Computer Science",
    "country": "United States",
    "admissionYear": "2024",
    "completionYear": "2026",
    "status": "COMPLETED",
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T12:00:00"
  }
}
```

---

### 3.5 Delete Higher Education Record

Deletes a higher education record.

**Endpoint:** `DELETE /api/v1/department-coordinator/alumni-repository/higher-education/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Higher Education record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Higher education record deleted successfully",
  "data": null
}
```

---

## 4. Alumni Engagement APIs (Step 4)

### 4.1 Get All Alumni Engagement Records

Retrieves a paginated list of alumni engagement activities (guest lectures, syllabus revision, panel discussions, placement drives, etc.).

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/engagement`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | No | 2025-26 | Academic year |
| `engagementType` | String | No | - | Engagement type filter (Guest Lecture, Advisory Board, Workshop) |
| `page` | Integer | No | 0 | Page index (0-indexed) |
| `size` | Integer | No | 10 | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alumni engagement records retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "alumniId": "ALM-2024-001",
        "engagementType": "Guest Lecture",
        "activityName": "Industry Trends in Cloud Computing",
        "activityDate": "2025-09-15",
        "role": "Keynote Speaker",
        "contributionHours": 3,
        "workflowStatus": "APPROVED",
        "departmentId": 10,
        "academicYear": "2025-26",
        "createdAt": "2026-07-28T10:00:00",
        "updatedAt": "2026-07-28T10:00:00"
      }
    ],
    "totalElements": 20,
    "totalPages": 2,
    "currentPage": 0,
    "size": 10
  }
}
```

---

### 4.2 Get Engagement Record by ID

Retrieves a single engagement record by ID.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/engagement/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Engagement record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Engagement record retrieved successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "engagementType": "Guest Lecture",
    "activityName": "Industry Trends in Cloud Computing",
    "activityDate": "2025-09-15",
    "role": "Keynote Speaker",
    "contributionHours": 3,
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 4.3 Create Alumni Engagement Record

Creates a new alumni engagement record.

**Endpoint:** `POST /api/v1/department-coordinator/alumni-repository/engagement`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `alumniId` | String | Yes | Alumni ID |
| `engagementType` | String | Yes | Type (Guest Lecture / Advisory Board / Workshop / Mock Interview) |
| `activityName` | String | Yes | Name of activity |
| `activityDate` | Date (YYYY-MM-DD) | Yes | Date of activity |
| `role` | String | No | Role performed |
| `contributionHours` | Integer | No | Hours spent (>= 0) |

**Request Example:**
```json
{
  "alumniId": "ALM-2024-001",
  "engagementType": "Guest Lecture",
  "activityName": "Industry Trends in Cloud Computing",
  "activityDate": "2025-09-15",
  "role": "Keynote Speaker",
  "contributionHours": 3
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Engagement record created successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "engagementType": "Guest Lecture",
    "activityName": "Industry Trends in Cloud Computing",
    "activityDate": "2025-09-15",
    "role": "Keynote Speaker",
    "contributionHours": 3,
    "workflowStatus": "PENDING_VERIFICATION",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 4.4 Update Alumni Engagement Record

Updates an existing engagement record.

**Endpoint:** `PUT /api/v1/department-coordinator/alumni-repository/engagement/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Engagement record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:** Same as Create Engagement Record

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Engagement record updated successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "engagementType": "Guest Lecture",
    "activityName": "Advanced Cloud Native Architectures",
    "activityDate": "2025-09-15",
    "role": "Keynote Speaker",
    "contributionHours": 4,
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T12:15:00"
  }
}
```

---

### 4.5 Delete Alumni Engagement Record

Deletes an engagement record.

**Endpoint:** `DELETE /api/v1/department-coordinator/alumni-repository/engagement/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Engagement record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Engagement record deleted successfully",
  "data": null
}
```

---

## 5. Alumni Contributions APIs (Step 5)

### 5.1 Get All Alumni Contributions

Retrieves a paginated list of financial and non-financial contributions by alumni (donations, equipment sponsorship, lab setup, book donations, etc.).

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/contributions`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | No | 2025-26 | Academic year |
| `contributionType` | String | No | - | Contribution type filter (Financial, Equipment, Library Books) |
| `page` | Integer | No | 0 | Page index (0-indexed) |
| `size` | Integer | No | 10 | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alumni contribution records retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "alumniId": "ALM-2024-001",
        "contributionType": "Financial Grant",
        "contributionTitle": "AI Research Lab Sponsorship",
        "contributionValue": 500000.00,
        "contributionDate": "2025-10-10",
        "beneficiaryDepartment": "Computer Science & Engineering",
        "workflowStatus": "APPROVED",
        "departmentId": 10,
        "academicYear": "2025-26",
        "createdAt": "2026-07-28T10:00:00",
        "updatedAt": "2026-07-28T10:00:00"
      }
    ],
    "totalElements": 12,
    "totalPages": 2,
    "currentPage": 0,
    "size": 10
  }
}
```

---

### 5.2 Get Contribution Record by ID

Retrieves a single contribution record by ID.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/contributions/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Contribution record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contribution record retrieved successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "contributionType": "Financial Grant",
    "contributionTitle": "AI Research Lab Sponsorship",
    "contributionValue": 500000.00,
    "contributionDate": "2025-10-10",
    "beneficiaryDepartment": "Computer Science & Engineering",
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 5.3 Create Alumni Contribution Record

Creates a new contribution record.

**Endpoint:** `POST /api/v1/department-coordinator/alumni-repository/contributions`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `alumniId` | String | Yes | Alumni ID |
| `contributionType` | String | Yes | Type (Financial Grant / Equipment / Software License / Books) |
| `contributionTitle` | String | Yes | Title / Purpose of contribution |
| `contributionValue` | BigDecimal | Yes | Financial value in INR (>= 0) |
| `contributionDate` | Date (YYYY-MM-DD) | Yes | Date of contribution |
| `beneficiaryDepartment` | String | No | Target department or lab |

**Request Example:**
```json
{
  "alumniId": "ALM-2024-001",
  "contributionType": "Financial Grant",
  "contributionTitle": "AI Research Lab Sponsorship",
  "contributionValue": 500000.00,
  "contributionDate": "2025-10-10",
  "beneficiaryDepartment": "Computer Science & Engineering"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Contribution record created successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "contributionType": "Financial Grant",
    "contributionTitle": "AI Research Lab Sponsorship",
    "contributionValue": 500000.00,
    "contributionDate": "2025-10-10",
    "beneficiaryDepartment": "Computer Science & Engineering",
    "workflowStatus": "PENDING_VERIFICATION",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 5.4 Update Alumni Contribution Record

Updates an existing contribution record.

**Endpoint:** `PUT /api/v1/department-coordinator/alumni-repository/contributions/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Contribution record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:** Same as Create Contribution Record

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contribution record updated successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "contributionType": "Financial Grant",
    "contributionTitle": "AI Research Lab Sponsorship",
    "contributionValue": 600000.00,
    "contributionDate": "2025-10-10",
    "beneficiaryDepartment": "Computer Science & Engineering",
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T12:30:00"
  }
}
```

---

### 5.5 Delete Alumni Contribution Record

Deletes a contribution record.

**Endpoint:** `DELETE /api/v1/department-coordinator/alumni-repository/contributions/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Contribution record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contribution record deleted successfully",
  "data": null
}
```

---

## 6. Alumni Mentorship APIs (Step 6)

### 6.1 Get All Alumni Mentorship Records

Retrieves a paginated list of student mentorship programs led by alumni.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/mentorship`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | No | 2025-26 | Academic year |
| `page` | Integer | No | 0 | Page index (0-indexed) |
| `size` | Integer | No | 10 | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alumni mentorship records retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "alumniId": "ALM-2024-001",
        "mentorshipProgram": "Career Launchpad 2025",
        "mentorshipType": "One-on-One Career Guidance",
        "numberOfMentees": 5,
        "startDate": "2025-08-01",
        "endDate": "2025-12-31",
        "workflowStatus": "APPROVED",
        "departmentId": 10,
        "academicYear": "2025-26",
        "createdAt": "2026-07-28T10:00:00",
        "updatedAt": "2026-07-28T10:00:00"
      }
    ],
    "totalElements": 10,
    "totalPages": 1,
    "currentPage": 0,
    "size": 10
  }
}
```

---

### 6.2 Get Mentorship Record by ID

Retrieves a single mentorship record by ID.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/mentorship/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Mentorship record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Mentorship record retrieved successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "mentorshipProgram": "Career Launchpad 2025",
    "mentorshipType": "One-on-One Career Guidance",
    "numberOfMentees": 5,
    "startDate": "2025-08-01",
    "endDate": "2025-12-31",
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 6.3 Create Alumni Mentorship Record

Creates a new mentorship program record.

**Endpoint:** `POST /api/v1/department-coordinator/alumni-repository/mentorship`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `alumniId` | String | Yes | Alumni Mentor ID |
| `mentorshipProgram` | String | Yes | Name of Mentorship Program |
| `mentorshipType` | String | Yes | Type (One-on-One / Group / Project Guidance) |
| `numberOfMentees` | Integer | Yes | Number of assigned mentees (>= 1) |
| `startDate` | Date (YYYY-MM-DD) | Yes | Program start date |
| `endDate` | Date (YYYY-MM-DD) | No | Program end date |

**Request Example:**
```json
{
  "alumniId": "ALM-2024-001",
  "mentorshipProgram": "Career Launchpad 2025",
  "mentorshipType": "One-on-One Career Guidance",
  "numberOfMentees": 5,
  "startDate": "2025-08-01",
  "endDate": "2025-12-31"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Mentorship record created successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "mentorshipProgram": "Career Launchpad 2025",
    "mentorshipType": "One-on-One Career Guidance",
    "numberOfMentees": 5,
    "startDate": "2025-08-01",
    "endDate": "2025-12-31",
    "workflowStatus": "PENDING_VERIFICATION",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 6.4 Update Alumni Mentorship Record

Updates an existing mentorship record.

**Endpoint:** `PUT /api/v1/department-coordinator/alumni-repository/mentorship/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Mentorship record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:** Same as Create Mentorship Record

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Mentorship record updated successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "mentorshipProgram": "Career Launchpad 2025",
    "mentorshipType": "One-on-One Career Guidance",
    "numberOfMentees": 8,
    "startDate": "2025-08-01",
    "endDate": "2025-12-31",
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T12:45:00"
  }
}
```

---

### 6.5 Delete Alumni Mentorship Record

Deletes a mentorship record.

**Endpoint:** `DELETE /api/v1/department-coordinator/alumni-repository/mentorship/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Mentorship record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Mentorship record deleted successfully",
  "data": null
}
```

---

## 7. Alumni Achievements APIs (Step 7)

### 7.1 Get All Alumni Achievements

Retrieves a paginated list of notable awards and recognitions received by alumni.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/achievements`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | No | 2025-26 | Academic year |
| `page` | Integer | No | 0 | Page index (0-indexed) |
| `size` | Integer | No | 10 | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alumni achievement records retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "alumniId": "ALM-2024-001",
        "achievementTitle": "Forbes 30 Under 30 Asia",
        "achievementCategory": "Industry Award",
        "awardingOrganization": "Forbes Asia",
        "achievementDate": "2025-05-15",
        "description": "Recognized for innovative enterprise AI solutions",
        "workflowStatus": "APPROVED",
        "departmentId": 10,
        "academicYear": "2025-26",
        "createdAt": "2026-07-28T10:00:00",
        "updatedAt": "2026-07-28T10:00:00"
      }
    ],
    "totalElements": 8,
    "totalPages": 1,
    "currentPage": 0,
    "size": 10
  }
}
```

---

### 7.2 Get Achievement Record by ID

Retrieves a single achievement record by ID.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/achievements/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Achievement record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Achievement record retrieved successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "achievementTitle": "Forbes 30 Under 30 Asia",
    "achievementCategory": "Industry Award",
    "awardingOrganization": "Forbes Asia",
    "achievementDate": "2025-05-15",
    "description": "Recognized for innovative enterprise AI solutions",
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 7.3 Create Alumni Achievement Record

Creates a new alumni achievement record.

**Endpoint:** `POST /api/v1/department-coordinator/alumni-repository/achievements`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `alumniId` | String | Yes | Alumni ID |
| `achievementTitle` | String | Yes | Name / Title of Award |
| `achievementCategory` | String | Yes | Category (Industry Award, Research Patent, Entrepreneurship) |
| `awardingOrganization` | String | Yes | Organization awarding the honor |
| `achievementDate` | Date (YYYY-MM-DD) | Yes | Award date |
| `description` | String | No | Summary / Citation of achievement |

**Request Example:**
```json
{
  "alumniId": "ALM-2024-001",
  "achievementTitle": "Forbes 30 Under 30 Asia",
  "achievementCategory": "Industry Award",
  "awardingOrganization": "Forbes Asia",
  "achievementDate": "2025-05-15",
  "description": "Recognized for innovative enterprise AI solutions"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Achievement record created successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "achievementTitle": "Forbes 30 Under 30 Asia",
    "achievementCategory": "Industry Award",
    "awardingOrganization": "Forbes Asia",
    "achievementDate": "2025-05-15",
    "description": "Recognized for innovative enterprise AI solutions",
    "workflowStatus": "PENDING_VERIFICATION",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 7.4 Update Alumni Achievement Record

Updates an existing achievement record.

**Endpoint:** `PUT /api/v1/department-coordinator/alumni-repository/achievements/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Achievement record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:** Same as Create Achievement Record

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Achievement record updated successfully",
  "data": {
    "id": 1,
    "alumniId": "ALM-2024-001",
    "achievementTitle": "Forbes 30 Under 30 Asia (Enterprise Tech)",
    "achievementCategory": "Industry Award",
    "awardingOrganization": "Forbes Asia",
    "achievementDate": "2025-05-15",
    "description": "Recognized for innovative enterprise AI solutions and open source contributions",
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T13:00:00"
  }
}
```

---

### 7.5 Delete Alumni Achievement Record

Deletes an achievement record.

**Endpoint:** `DELETE /api/v1/department-coordinator/alumni-repository/achievements/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Achievement record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Achievement record deleted successfully",
  "data": null
}
```

---

## 8. Alumni Chapters APIs (Step 8)

### 8.1 Get All Alumni Chapters

Retrieves a paginated list of regional/international alumni chapter networks.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/chapters`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | No | 2025-26 | Academic year |
| `page` | Integer | No | 0 | Page index (0-indexed) |
| `size` | Integer | No | 10 | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alumni chapters retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "chapterName": "North America Bay Area Chapter",
        "chapterType": "International",
        "location": "San Francisco, USA",
        "coordinatorName": "Vikram Sethi",
        "formationDate": "2022-03-15",
        "status": "ACTIVE",
        "workflowStatus": "APPROVED",
        "departmentId": 10,
        "academicYear": "2025-26",
        "createdAt": "2026-07-28T10:00:00",
        "updatedAt": "2026-07-28T10:00:00"
      }
    ],
    "totalElements": 5,
    "totalPages": 1,
    "currentPage": 0,
    "size": 10
  }
}
```

---

### 8.2 Get Chapter Record by ID

Retrieves a single chapter record by ID.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/chapters/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Chapter record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Chapter record retrieved successfully",
  "data": {
    "id": 1,
    "chapterName": "North America Bay Area Chapter",
    "chapterType": "International",
    "location": "San Francisco, USA",
    "coordinatorName": "Vikram Sethi",
    "formationDate": "2022-03-15",
    "status": "ACTIVE",
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 8.3 Create Alumni Chapter Record

Creates a new alumni chapter record.

**Endpoint:** `POST /api/v1/department-coordinator/alumni-repository/chapters`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `chapterName` | String | Yes | Chapter Name |
| `chapterType` | String | Yes | Type (Regional / National / International) |
| `location` | String | Yes | City, Country |
| `coordinatorName` | String | Yes | Lead Coordinator Name |
| `formationDate` | Date (YYYY-MM-DD) | Yes | Date chapter was established |
| `status` | String | No | Chapter status (e.g., "ACTIVE") |

**Request Example:**
```json
{
  "chapterName": "North America Bay Area Chapter",
  "chapterType": "International",
  "location": "San Francisco, USA",
  "coordinatorName": "Vikram Sethi",
  "formationDate": "2022-03-15",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Chapter record created successfully",
  "data": {
    "id": 1,
    "chapterName": "North America Bay Area Chapter",
    "chapterType": "International",
    "location": "San Francisco, USA",
    "coordinatorName": "Vikram Sethi",
    "formationDate": "2022-03-15",
    "status": "ACTIVE",
    "workflowStatus": "PENDING_VERIFICATION",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 8.4 Update Alumni Chapter Record

Updates an existing chapter record.

**Endpoint:** `PUT /api/v1/department-coordinator/alumni-repository/chapters/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Chapter record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:** Same as Create Chapter Record

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Chapter record updated successfully",
  "data": {
    "id": 1,
    "chapterName": "North America Bay Area Chapter",
    "chapterType": "International",
    "location": "San Francisco & Silicon Valley, USA",
    "coordinatorName": "Vikram Sethi",
    "formationDate": "2022-03-15",
    "status": "ACTIVE",
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T13:15:00"
  }
}
```

---

### 8.5 Delete Alumni Chapter Record

Deletes a chapter record.

**Endpoint:** `DELETE /api/v1/department-coordinator/alumni-repository/chapters/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Chapter record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Chapter record deleted successfully",
  "data": null
}
```

---

## 9. Alumni Events APIs (Step 9)

### 9.1 Get All Alumni Events

Retrieves a paginated list of alumni meets, reunions, webinars, and networking events.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/events`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | No | 2025-26 | Academic year |
| `page` | Integer | No | 0 | Page index (0-indexed) |
| `size` | Integer | No | 10 | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alumni events retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "eventName": "Annual Alumni Meet 2025",
        "eventType": "Reunion Meet",
        "eventDate": "2025-12-20",
        "location": "Main Auditorium, Campus",
        "participantsCount": 150,
        "outcomeSummary": "Engaged 150+ alumni and finalized 12 mentorship agreements.",
        "workflowStatus": "APPROVED",
        "departmentId": 10,
        "academicYear": "2025-26",
        "createdAt": "2026-07-28T10:00:00",
        "updatedAt": "2026-07-28T10:00:00"
      }
    ],
    "totalElements": 6,
    "totalPages": 1,
    "currentPage": 0,
    "size": 10
  }
}
```

---

### 9.2 Get Event Record by ID

Retrieves a single event record by ID.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/events/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Event record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Event record retrieved successfully",
  "data": {
    "id": 1,
    "eventName": "Annual Alumni Meet 2025",
    "eventType": "Reunion Meet",
    "eventDate": "2025-12-20",
    "location": "Main Auditorium, Campus",
    "participantsCount": 150,
    "outcomeSummary": "Engaged 150+ alumni and finalized 12 mentorship agreements.",
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 9.3 Create Alumni Event Record

Creates a new alumni event record.

**Endpoint:** `POST /api/v1/department-coordinator/alumni-repository/events`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventName` | String | Yes | Event Title |
| `eventType` | String | Yes | Event Type (Reunion / Webinar / Panel Discussion / Networking) |
| `eventDate` | Date (YYYY-MM-DD) | Yes | Event Date |
| `location` | String | Yes | Venue / Virtual Link |
| `participantsCount` | Integer | Yes | Number of attendees (>= 0) |
| `outcomeSummary` | String | No | Key highlights / Outcomes |

**Request Example:**
```json
{
  "eventName": "Annual Alumni Meet 2025",
  "eventType": "Reunion Meet",
  "eventDate": "2025-12-20",
  "location": "Main Auditorium, Campus",
  "participantsCount": 150,
  "outcomeSummary": "Engaged 150+ alumni and finalized 12 mentorship agreements."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Event record created successfully",
  "data": {
    "id": 1,
    "eventName": "Annual Alumni Meet 2025",
    "eventType": "Reunion Meet",
    "eventDate": "2025-12-20",
    "location": "Main Auditorium, Campus",
    "participantsCount": 150,
    "outcomeSummary": "Engaged 150+ alumni and finalized 12 mentorship agreements.",
    "workflowStatus": "PENDING_VERIFICATION",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T10:00:00"
  }
}
```

---

### 9.4 Update Alumni Event Record

Updates an existing event record.

**Endpoint:** `PUT /api/v1/department-coordinator/alumni-repository/events/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Event record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:** Same as Create Event Record

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Event record updated successfully",
  "data": {
    "id": 1,
    "eventName": "Annual Alumni Meet 2025",
    "eventType": "Reunion Meet",
    "eventDate": "2025-12-20",
    "location": "Main Auditorium, Campus",
    "participantsCount": 175,
    "outcomeSummary": "Engaged 175+ alumni, launched startup incubation fund, and finalized 15 mentorship agreements.",
    "workflowStatus": "APPROVED",
    "departmentId": 10,
    "academicYear": "2025-26",
    "createdAt": "2026-07-28T10:00:00",
    "updatedAt": "2026-07-28T13:30:00"
  }
}
```

---

### 9.5 Delete Alumni Event Record

Deletes an event record.

**Endpoint:** `DELETE /api/v1/department-coordinator/alumni-repository/events/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Event record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Event record deleted successfully",
  "data": null
}
```

---

## 10. Evidence Repository APIs (Step 10)

### 10.1 Upload Evidence Document (Main Endpoint)

Uploads an evidence file (e.g., offer letter, higher education proof, event photo, contribution receipt) associated with a specific section record.

**Endpoint:** `POST /api/v1/department-coordinator/alumni-repository/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `uploadedBy` | Long | Yes | User ID of uploader |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | Multipart file to upload |
| `academicYear` | String | Yes | Academic year |
| `sectionName` | String | Yes | Section identifier (`details`, `employment`, `higher-education`, `engagement`, `contributions`, `mentorship`, `achievements`, `chapters`, `events`) |
| `recordId` | Long | Yes | Associated record database ID |
| `yearOfStudy` | String | No | Optional year filter |
| `semester` | String | No | Optional semester filter |
| `documentType` | String | No | Description of document (e.g., "Offer Letter", "Receipt") |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Evidence uploaded successfully",
  "data": {
    "id": 101,
    "fileName": "offer_letter_ALM001.pdf",
    "fileSize": 524288,
    "fileType": "application/pdf",
    "uploadedBy": "Admin User",
    "uploadedAt": "2026-07-28T10:30:00",
    "verificationStatus": "PENDING",
    "message": "Evidence uploaded successfully"
  }
}
```

---

### 10.2 Upload Evidence Document (Section Endpoint)

Alternative upload endpoint for evidence files under the `/evidence/upload` sub-path.

**Endpoint:** `POST /api/v1/department-coordinator/alumni-repository/evidence/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters & Form Parts:** Same as Section 10.1

**Response (201 Created):** Same as Section 10.1

---

### 10.3 Get Evidence Documents

Retrieves a paginated list of evidence documents uploaded for alumni records.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/evidence`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `sectionName` | String | No | - | Section filter (`details`, `employment`, etc.) |
| `recordId` | Long | No | - | Specific record ID |
| `page` | Integer | No | 0 | Page index (0-indexed) |
| `size` | Integer | No | 50 | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 101,
        "departmentId": 10,
        "academicYear": "2025-26",
        "yearOfStudy": null,
        "semester": null,
        "sectionName": "employment",
        "recordId": 1,
        "documentName": "Offer Letter Google",
        "documentType": "Offer Letter",
        "fileName": "offer_letter_ALM001.pdf",
        "fileSize": 524288,
        "fileType": "application/pdf",
        "uploadedBy": "Admin User",
        "uploadedAt": "2026-07-28T10:30:00",
        "verificationStatus": "VERIFIED",
        "verifiedBy": "Department Coordinator",
        "verifiedAt": "2026-07-28T11:00:00",
        "createdAt": "2026-07-28T10:30:00",
        "updatedAt": "2026-07-28T11:00:00"
      }
    ],
    "totalElements": 25,
    "totalPages": 1,
    "currentPage": 0,
    "size": 50
  }
}
```

---

### 10.4 Delete Evidence Document

Deletes an uploaded evidence document.

**Endpoint:** `DELETE /api/v1/department-coordinator/alumni-repository/evidence/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Evidence document ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Evidence deleted successfully",
  "data": null
}
```

---

## 11. Bulk Operations APIs (Step 11)

### 11.1 Bulk Upload All Alumni Data

Bulk uploads multiple alumni CSV files across all sections in a single request.

**Endpoint:** `POST /api/v1/department-coordinator/alumni-repository/bulk-upload`

**Content-Type:** `multipart/form-data`

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `request` | JSON | Yes | `AlumniBulkUploadRequest` (`academicYear`, `departmentId`, `replaceExisting`) |
| `detailsFile` | File | No | Alumni details CSV |
| `employmentFile` | File | No | Employment records CSV |
| `higherEdFile` | File | No | Higher education CSV |
| `engagementFile` | File | No | Engagement activities CSV |
| `contributionFile` | File | No | Contributions CSV |
| `mentorshipFile` | File | No | Mentorship records CSV |
| `achievementFile` | File | No | Achievements CSV |
| `chapterFile` | File | No | Chapters CSV |
| `eventFile` | File | No | Events CSV |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Bulk upload completed successfully",
  "data": {
    "message": "Bulk upload processed successfully",
    "academicYear": "2025-26",
    "detailsProcessed": 1,
    "status": "completed"
  }
}
```

---

## 12. Repository Analytics & Health APIs (Step 12)

### 12.1 Get Alumni Repository Health Metrics

Retrieves data completeness, evidence attachment rates, verification status percentages, readiness scores, and tab-wise metrics for the alumni repository.

**Endpoint:** `GET /api/v1/department-coordinator/alumni-repository/health`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | No | 2025-26 | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alumni repository health metrics retrieved",
  "data": {
    "academicYear": "2025-26",
    "dataCompleteness": 85,
    "evidenceCompleteness": 78,
    "verificationPercent": 90,
    "readinessScore": 84,
    "tabWiseMetrics": {
      "details": {
        "tabId": "details",
        "tabLabel": "Alumni Profiles",
        "recordsUploaded": 45,
        "pendingValidation": 2,
        "pendingVerification": 5,
        "verified": 38,
        "approved": 38,
        "rejected": 0,
        "lastUpdated": "2026-07-28T13:30:00"
      },
      "employment": {
        "tabId": "employment",
        "tabLabel": "Employment & Placement",
        "recordsUploaded": 30,
        "pendingValidation": 1,
        "pendingVerification": 3,
        "verified": 26,
        "approved": 26,
        "rejected": 0,
        "lastUpdated": "2026-07-28T12:00:00"
      },
      "higherEducation": {
        "tabId": "higherEducation",
        "tabLabel": "Higher Education",
        "recordsUploaded": 15,
        "pendingValidation": 0,
        "pendingVerification": 2,
        "verified": 13,
        "approved": 13,
        "rejected": 0,
        "lastUpdated": "2026-07-28T12:00:00"
      }
    }
  }
}
```

---

## Appendix A: Section Name Reference for Evidence Uploads

| Section Name | Description | Related Module |
|--------------|-------------|----------------|
| `details` | Alumni Personal Profiles | Alumni Details |
| `employment` | Career & Placement Records | Employment & Career |
| `higher-education` | Post-graduate / Higher Studies | Higher Education |
| `engagement` | Guest Lectures & Advisory Meetings | Alumni Engagement |
| `contributions` | Financial & Equipment Donations | Alumni Contributions |
| `mentorship` | Student Mentorship Programs | Alumni Mentorship |
| `achievements` | Awards & Recognitions | Alumni Achievements |
| `chapters` | Regional Alumni Chapters | Alumni Chapters |
| `events` | Reunions & Webinars | Alumni Events |

---

## Appendix B: HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created or uploaded successfully |
| `400 Bad Request` | Invalid input or validation constraint failed |
| `401 Unauthorized` | Missing or expired JWT token |
| `403 Forbidden` | Access denied for current user role |
| `404 Not Found` | Requested resource ID not found |
| `500 Internal Server Error` | Unexpected server error |

---

*Last Updated: July 28, 2026*  
*Version: 1.0*

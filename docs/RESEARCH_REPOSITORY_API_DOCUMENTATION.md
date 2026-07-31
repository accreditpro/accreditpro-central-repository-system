# Research Repository API Documentation

## Overview

This document provides comprehensive API documentation for the **Research Repository** module in the Department Coordinator portal. These APIs facilitate the management of research records including faculty/student publications (journals, conferences, books, chapters, patents), research projects, consultancy projects, supporting documents, and workflow verification processes.

**Base URL:** `/api/v1/research-repository`

**Swagger Tag:** `DC - Research Repository`

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
  "timestamp": "2026-07-31T10:00:00"
}
```

### Paginated Data Response Format

List endpoints returning paginated records use the following structure inside the `data` field:

```json
{
  "content": [ ... ],
  "totalElements": 100,
  "totalPages": 10,
  "currentPage": 0,
  "size": 20,
  "first": true,
  "last": false
}
```

---

## 1. Dashboard APIs

### 1.1 Get Research Repository Dashboard
Retrieves dashboard metrics and summary for the research repository.

**Endpoint:** `GET /api/v1/research-repository/dashboard`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department identifier |
| `academicYear` | String | Yes | Academic year (e.g., "2026-27") |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Dashboard retrieved successfully",
  "data": {
    "totalPublications": 120,
    "totalProjects": 15,
    "totalPatents": 5
  }
}
```

---

### 1.2 Get Repository Metrics
Retrieves detailed metrics for the research repository.

**Endpoint:** `GET /api/v1/research-repository/metrics`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department identifier |
| `academicYear` | String | Yes | Academic year (e.g., "2026-27") |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Metrics retrieved successfully",
  "data": {
    "facultyMetrics": { },
    "studentMetrics": { }
  }
}
```

---

## 2. FACULTY JOURNAL PUBLICATIONS

### 2.1 Get All Faculty Journal Publications
Retrieves a paginated list of faculty journal publications.

**Endpoint:** `GET /api/v1/research-repository/faculty-journal-publications`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `search` | String | No | - | Search term |
| `status` | String | No | - | Status filter |
| `page` | Integer | No | 0 | Page number (0-indexed) |
| `size` | Integer | No | 20 | Page size |
| `sortBy` | String | No | createdAt | Sort field |
| `sortDirection`| String | No | desc | Sort direction (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty journal publications retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 11,
        "academicYear": "2026-27",
        "moduleId": "faculty-journal-publications",
        "recordData": {
          "title": "Example Title"
        },
        "status": "APPROVED",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-07-31T10:00:00",
        "updatedAt": "2026-07-31T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "size": 20
  }
}
```

---

### 2.2 Get Faculty Journal Publication by ID
Retrieves a single faculty journal publication by its database ID.

**Endpoint:** `GET /api/v1/research-repository/faculty-journal-publications/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-journal-publications",
    "recordData": {
      "title": "Example Title"
    },
    "status": "APPROVED",
    "workflowStatus": "APPROVED",
    "createdAt": "2026-07-31T10:00:00",
    "updatedAt": "2026-07-31T10:00:00"
  }
}
```

---

### 2.3 Create Faculty Journal Publication
Creates a new faculty journal publication.

**Endpoint:** `POST /api/v1/research-repository/faculty-journal-publications`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload containing fields specific to `CreatePublicationRequest`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Faculty journal publication created successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-journal-publications",
    "recordData": { }
  }
}
```

---

### 2.4 Update Faculty Journal Publication
Updates an existing faculty journal publication.

**Endpoint:** `PUT /api/v1/research-repository/faculty-journal-publications/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload representing updated fields.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty journal publication updated successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-journal-publications",
    "recordData": { }
  }
}
```

---

### 2.5 Delete Faculty Journal Publication
Deletes a faculty journal publication.

**Endpoint:** `DELETE /api/v1/research-repository/faculty-journal-publications/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty journal publication deleted successfully",
  "data": null
}
```

---

### 2.6 Upload Faculty Journal Publications CSV
Uploads a CSV file containing faculty journal publications. Filters out any exact duplicate data rows automatically.

**Endpoint:** `POST /api/v1/research-repository/faculty-journal-publications/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Faculty journal publications uploaded successfully",
  "data": {
    "uploadId": "UPL-RES-12345",
    "totalRecords": 10,
    "validRecords": 8,
    "invalidRecords": 2,
    "validationErrors": []
  }
}
```

---

### 2.7 Download Faculty Journal Publications CSV Template
Downloads the standard dynamic CSV template containing all required column headers.

**Endpoint:** `GET /api/v1/research-repository/faculty-journal-publications/template`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):** Binary file download (`Content-Type: text/csv`)

---

## 3. FACULTY CONFERENCE PUBLICATIONS

### 3.1 Get All Faculty Conference Publications
Retrieves a paginated list of faculty conference publications.

**Endpoint:** `GET /api/v1/research-repository/faculty-conference-publications`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `search` | String | No | - | Search term |
| `status` | String | No | - | Status filter |
| `page` | Integer | No | 0 | Page number (0-indexed) |
| `size` | Integer | No | 20 | Page size |
| `sortBy` | String | No | createdAt | Sort field |
| `sortDirection`| String | No | desc | Sort direction (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty conference publications retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 11,
        "academicYear": "2026-27",
        "moduleId": "faculty-conference-publications",
        "recordData": {
          "title": "Example Title"
        },
        "status": "APPROVED",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-07-31T10:00:00",
        "updatedAt": "2026-07-31T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "size": 20
  }
}
```

---

### 3.2 Get Faculty Conference Publication by ID
Retrieves a single faculty conference publication by its database ID.

**Endpoint:** `GET /api/v1/research-repository/faculty-conference-publications/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-conference-publications",
    "recordData": {
      "title": "Example Title"
    },
    "status": "APPROVED",
    "workflowStatus": "APPROVED",
    "createdAt": "2026-07-31T10:00:00",
    "updatedAt": "2026-07-31T10:00:00"
  }
}
```

---

### 3.3 Create Faculty Conference Publication
Creates a new faculty conference publication.

**Endpoint:** `POST /api/v1/research-repository/faculty-conference-publications`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload containing fields specific to `CreateConferencePublicationRequest`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Faculty conference publication created successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-conference-publications",
    "recordData": { }
  }
}
```

---

### 3.4 Update Faculty Conference Publication
Updates an existing faculty conference publication.

**Endpoint:** `PUT /api/v1/research-repository/faculty-conference-publications/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload representing updated fields.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty conference publication updated successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-conference-publications",
    "recordData": { }
  }
}
```

---

### 3.5 Delete Faculty Conference Publication
Deletes a faculty conference publication.

**Endpoint:** `DELETE /api/v1/research-repository/faculty-conference-publications/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty conference publication deleted successfully",
  "data": null
}
```

---

### 3.6 Upload Faculty Conference Publications CSV
Uploads a CSV file containing faculty conference publications. Filters out any exact duplicate data rows automatically.

**Endpoint:** `POST /api/v1/research-repository/faculty-conference-publications/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Faculty conference publications uploaded successfully",
  "data": {
    "uploadId": "UPL-RES-12345",
    "totalRecords": 10,
    "validRecords": 8,
    "invalidRecords": 2,
    "validationErrors": []
  }
}
```

---

### 3.7 Download Faculty Conference Publications CSV Template
Downloads the standard dynamic CSV template containing all required column headers.

**Endpoint:** `GET /api/v1/research-repository/faculty-conference-publications/template`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):** Binary file download (`Content-Type: text/csv`)

---

## 4. FACULTY PATENTS

### 4.1 Get All Faculty Patents
Retrieves a paginated list of faculty patents.

**Endpoint:** `GET /api/v1/research-repository/faculty-patents`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `search` | String | No | - | Search term |
| `status` | String | No | - | Status filter |
| `page` | Integer | No | 0 | Page number (0-indexed) |
| `size` | Integer | No | 20 | Page size |
| `sortBy` | String | No | createdAt | Sort field |
| `sortDirection`| String | No | desc | Sort direction (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty patents retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 11,
        "academicYear": "2026-27",
        "moduleId": "faculty-patents",
        "recordData": {
          "title": "Example Title"
        },
        "status": "APPROVED",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-07-31T10:00:00",
        "updatedAt": "2026-07-31T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "size": 20
  }
}
```

---

### 4.2 Get Faculty Patent by ID
Retrieves a single faculty patent by its database ID.

**Endpoint:** `GET /api/v1/research-repository/faculty-patents/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-patents",
    "recordData": {
      "title": "Example Title"
    },
    "status": "APPROVED",
    "workflowStatus": "APPROVED",
    "createdAt": "2026-07-31T10:00:00",
    "updatedAt": "2026-07-31T10:00:00"
  }
}
```

---

### 4.3 Create Faculty Patent
Creates a new faculty patent.

**Endpoint:** `POST /api/v1/research-repository/faculty-patents`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload containing fields specific to `CreatePatentRequest`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Faculty patent created successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-patents",
    "recordData": { }
  }
}
```

---

### 4.4 Update Faculty Patent
Updates an existing faculty patent.

**Endpoint:** `PUT /api/v1/research-repository/faculty-patents/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload representing updated fields.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty patent updated successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-patents",
    "recordData": { }
  }
}
```

---

### 4.5 Delete Faculty Patent
Deletes a faculty patent.

**Endpoint:** `DELETE /api/v1/research-repository/faculty-patents/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty patent deleted successfully",
  "data": null
}
```

---

### 4.6 Upload Faculty Patents CSV
Uploads a CSV file containing faculty patents. Filters out any exact duplicate data rows automatically.

**Endpoint:** `POST /api/v1/research-repository/faculty-patents/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Faculty patents uploaded successfully",
  "data": {
    "uploadId": "UPL-RES-12345",
    "totalRecords": 10,
    "validRecords": 8,
    "invalidRecords": 2,
    "validationErrors": []
  }
}
```

---

### 4.7 Download Faculty Patents CSV Template
Downloads the standard dynamic CSV template containing all required column headers.

**Endpoint:** `GET /api/v1/research-repository/faculty-patents/template`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):** Binary file download (`Content-Type: text/csv`)

---

## 5. FACULTY BOOKS

### 5.1 Get All Faculty Books
Retrieves a paginated list of faculty books.

**Endpoint:** `GET /api/v1/research-repository/faculty-books`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `search` | String | No | - | Search term |
| `status` | String | No | - | Status filter |
| `page` | Integer | No | 0 | Page number (0-indexed) |
| `size` | Integer | No | 20 | Page size |
| `sortBy` | String | No | createdAt | Sort field |
| `sortDirection`| String | No | desc | Sort direction (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty books retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 11,
        "academicYear": "2026-27",
        "moduleId": "faculty-books",
        "recordData": {
          "title": "Example Title"
        },
        "status": "APPROVED",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-07-31T10:00:00",
        "updatedAt": "2026-07-31T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "size": 20
  }
}
```

---

### 5.2 Get Faculty Book by ID
Retrieves a single faculty book by its database ID.

**Endpoint:** `GET /api/v1/research-repository/faculty-books/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-books",
    "recordData": {
      "title": "Example Title"
    },
    "status": "APPROVED",
    "workflowStatus": "APPROVED",
    "createdAt": "2026-07-31T10:00:00",
    "updatedAt": "2026-07-31T10:00:00"
  }
}
```

---

### 5.3 Create Faculty Book
Creates a new faculty book.

**Endpoint:** `POST /api/v1/research-repository/faculty-books`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload containing fields specific to `CreateBookRequest`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Faculty book created successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-books",
    "recordData": { }
  }
}
```

---

### 5.4 Update Faculty Book
Updates an existing faculty book.

**Endpoint:** `PUT /api/v1/research-repository/faculty-books/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload representing updated fields.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty book updated successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-books",
    "recordData": { }
  }
}
```

---

### 5.5 Delete Faculty Book
Deletes a faculty book.

**Endpoint:** `DELETE /api/v1/research-repository/faculty-books/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty book deleted successfully",
  "data": null
}
```

---

### 5.6 Upload Faculty Books CSV
Uploads a CSV file containing faculty books. Filters out any exact duplicate data rows automatically.

**Endpoint:** `POST /api/v1/research-repository/faculty-books/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Faculty books uploaded successfully",
  "data": {
    "uploadId": "UPL-RES-12345",
    "totalRecords": 10,
    "validRecords": 8,
    "invalidRecords": 2,
    "validationErrors": []
  }
}
```

---

### 5.7 Download Faculty Books CSV Template
Downloads the standard dynamic CSV template containing all required column headers.

**Endpoint:** `GET /api/v1/research-repository/faculty-books/template`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):** Binary file download (`Content-Type: text/csv`)

---

## 6. FACULTY BOOK CHAPTERS

### 6.1 Get All Faculty Book Chapters
Retrieves a paginated list of faculty book chapters.

**Endpoint:** `GET /api/v1/research-repository/faculty-book-chapters`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `search` | String | No | - | Search term |
| `status` | String | No | - | Status filter |
| `page` | Integer | No | 0 | Page number (0-indexed) |
| `size` | Integer | No | 20 | Page size |
| `sortBy` | String | No | createdAt | Sort field |
| `sortDirection`| String | No | desc | Sort direction (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty book chapters retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 11,
        "academicYear": "2026-27",
        "moduleId": "faculty-book-chapters",
        "recordData": {
          "title": "Example Title"
        },
        "status": "APPROVED",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-07-31T10:00:00",
        "updatedAt": "2026-07-31T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "size": 20
  }
}
```

---

### 6.2 Get Faculty Book Chapter by ID
Retrieves a single faculty book chapter by its database ID.

**Endpoint:** `GET /api/v1/research-repository/faculty-book-chapters/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-book-chapters",
    "recordData": {
      "title": "Example Title"
    },
    "status": "APPROVED",
    "workflowStatus": "APPROVED",
    "createdAt": "2026-07-31T10:00:00",
    "updatedAt": "2026-07-31T10:00:00"
  }
}
```

---

### 6.3 Create Faculty Book Chapter
Creates a new faculty book chapter.

**Endpoint:** `POST /api/v1/research-repository/faculty-book-chapters`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload containing fields specific to `CreateBookChapterRequest`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Faculty book chapter created successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-book-chapters",
    "recordData": { }
  }
}
```

---

### 6.4 Update Faculty Book Chapter
Updates an existing faculty book chapter.

**Endpoint:** `PUT /api/v1/research-repository/faculty-book-chapters/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload representing updated fields.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty book chapter updated successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-book-chapters",
    "recordData": { }
  }
}
```

---

### 6.5 Delete Faculty Book Chapter
Deletes a faculty book chapter.

**Endpoint:** `DELETE /api/v1/research-repository/faculty-book-chapters/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty book chapter deleted successfully",
  "data": null
}
```

---

### 6.6 Upload Faculty Book Chapters CSV
Uploads a CSV file containing faculty book chapters. Filters out any exact duplicate data rows automatically.

**Endpoint:** `POST /api/v1/research-repository/faculty-book-chapters/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Faculty book chapters uploaded successfully",
  "data": {
    "uploadId": "UPL-RES-12345",
    "totalRecords": 10,
    "validRecords": 8,
    "invalidRecords": 2,
    "validationErrors": []
  }
}
```

---

### 6.7 Download Faculty Book Chapters CSV Template
Downloads the standard dynamic CSV template containing all required column headers.

**Endpoint:** `GET /api/v1/research-repository/faculty-book-chapters/template`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):** Binary file download (`Content-Type: text/csv`)

---

## 7. FACULTY SPONSORED PROJECTS

### 7.1 Get All Faculty Sponsored Projects
Retrieves a paginated list of faculty sponsored projects.

**Endpoint:** `GET /api/v1/research-repository/faculty-sponsored-projects`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `search` | String | No | - | Search term |
| `status` | String | No | - | Status filter |
| `page` | Integer | No | 0 | Page number (0-indexed) |
| `size` | Integer | No | 20 | Page size |
| `sortBy` | String | No | createdAt | Sort field |
| `sortDirection`| String | No | desc | Sort direction (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty sponsored projects retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 11,
        "academicYear": "2026-27",
        "moduleId": "faculty-sponsored-projects",
        "recordData": {
          "title": "Example Title"
        },
        "status": "APPROVED",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-07-31T10:00:00",
        "updatedAt": "2026-07-31T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "size": 20
  }
}
```

---

### 7.2 Get Faculty Sponsored Project by ID
Retrieves a single faculty sponsored project by its database ID.

**Endpoint:** `GET /api/v1/research-repository/faculty-sponsored-projects/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-sponsored-projects",
    "recordData": {
      "title": "Example Title"
    },
    "status": "APPROVED",
    "workflowStatus": "APPROVED",
    "createdAt": "2026-07-31T10:00:00",
    "updatedAt": "2026-07-31T10:00:00"
  }
}
```

---

### 7.3 Create Faculty Sponsored Project
Creates a new faculty sponsored project.

**Endpoint:** `POST /api/v1/research-repository/faculty-sponsored-projects`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload containing fields specific to `CreateSponsoredProjectRequest`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Faculty sponsored project created successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-sponsored-projects",
    "recordData": { }
  }
}
```

---

### 7.4 Update Faculty Sponsored Project
Updates an existing faculty sponsored project.

**Endpoint:** `PUT /api/v1/research-repository/faculty-sponsored-projects/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload representing updated fields.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty sponsored project updated successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-sponsored-projects",
    "recordData": { }
  }
}
```

---

### 7.5 Delete Faculty Sponsored Project
Deletes a faculty sponsored project.

**Endpoint:** `DELETE /api/v1/research-repository/faculty-sponsored-projects/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty sponsored project deleted successfully",
  "data": null
}
```

---

### 7.6 Upload Faculty Sponsored Projects CSV
Uploads a CSV file containing faculty sponsored projects. Filters out any exact duplicate data rows automatically.

**Endpoint:** `POST /api/v1/research-repository/faculty-sponsored-projects/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Faculty sponsored projects uploaded successfully",
  "data": {
    "uploadId": "UPL-RES-12345",
    "totalRecords": 10,
    "validRecords": 8,
    "invalidRecords": 2,
    "validationErrors": []
  }
}
```

---

### 7.7 Download Faculty Sponsored Projects CSV Template
Downloads the standard dynamic CSV template containing all required column headers.

**Endpoint:** `GET /api/v1/research-repository/faculty-sponsored-projects/template`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):** Binary file download (`Content-Type: text/csv`)

---

## 8. FACULTY CONSULTANCY PROJECTS

### 8.1 Get All Faculty Consultancy Projects
Retrieves a paginated list of faculty consultancy projects.

**Endpoint:** `GET /api/v1/research-repository/faculty-consultancy-projects`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `search` | String | No | - | Search term |
| `status` | String | No | - | Status filter |
| `page` | Integer | No | 0 | Page number (0-indexed) |
| `size` | Integer | No | 20 | Page size |
| `sortBy` | String | No | createdAt | Sort field |
| `sortDirection`| String | No | desc | Sort direction (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty consultancy projects retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 11,
        "academicYear": "2026-27",
        "moduleId": "faculty-consultancy-projects",
        "recordData": {
          "title": "Example Title"
        },
        "status": "APPROVED",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-07-31T10:00:00",
        "updatedAt": "2026-07-31T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "size": 20
  }
}
```

---

### 8.2 Get Faculty Consultancy Project by ID
Retrieves a single faculty consultancy project by its database ID.

**Endpoint:** `GET /api/v1/research-repository/faculty-consultancy-projects/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-consultancy-projects",
    "recordData": {
      "title": "Example Title"
    },
    "status": "APPROVED",
    "workflowStatus": "APPROVED",
    "createdAt": "2026-07-31T10:00:00",
    "updatedAt": "2026-07-31T10:00:00"
  }
}
```

---

### 8.3 Create Faculty Consultancy Project
Creates a new faculty consultancy project.

**Endpoint:** `POST /api/v1/research-repository/faculty-consultancy-projects`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload containing fields specific to `CreateConsultancyRequest`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Faculty consultancy project created successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-consultancy-projects",
    "recordData": { }
  }
}
```

---

### 8.4 Update Faculty Consultancy Project
Updates an existing faculty consultancy project.

**Endpoint:** `PUT /api/v1/research-repository/faculty-consultancy-projects/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload representing updated fields.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty consultancy project updated successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-consultancy-projects",
    "recordData": { }
  }
}
```

---

### 8.5 Delete Faculty Consultancy Project
Deletes a faculty consultancy project.

**Endpoint:** `DELETE /api/v1/research-repository/faculty-consultancy-projects/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty consultancy project deleted successfully",
  "data": null
}
```

---

### 8.6 Upload Faculty Consultancy Projects CSV
Uploads a CSV file containing faculty consultancy projects. Filters out any exact duplicate data rows automatically.

**Endpoint:** `POST /api/v1/research-repository/faculty-consultancy-projects/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Faculty consultancy projects uploaded successfully",
  "data": {
    "uploadId": "UPL-RES-12345",
    "totalRecords": 10,
    "validRecords": 8,
    "invalidRecords": 2,
    "validationErrors": []
  }
}
```

---

### 8.7 Download Faculty Consultancy Projects CSV Template
Downloads the standard dynamic CSV template containing all required column headers.

**Endpoint:** `GET /api/v1/research-repository/faculty-consultancy-projects/template`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):** Binary file download (`Content-Type: text/csv`)

---

## 9. FACULTY RESEARCH PROJECTS

### 9.1 Get All Faculty Research Projects
Retrieves a paginated list of faculty research projects.

**Endpoint:** `GET /api/v1/research-repository/faculty-research-projects`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `search` | String | No | - | Search term |
| `status` | String | No | - | Status filter |
| `page` | Integer | No | 0 | Page number (0-indexed) |
| `size` | Integer | No | 20 | Page size |
| `sortBy` | String | No | createdAt | Sort field |
| `sortDirection`| String | No | desc | Sort direction (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty research projects retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 11,
        "academicYear": "2026-27",
        "moduleId": "faculty-research-projects",
        "recordData": {
          "title": "Example Title"
        },
        "status": "APPROVED",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-07-31T10:00:00",
        "updatedAt": "2026-07-31T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "size": 20
  }
}
```

---

### 9.2 Get Faculty Research Project by ID
Retrieves a single faculty research project by its database ID.

**Endpoint:** `GET /api/v1/research-repository/faculty-research-projects/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-research-projects",
    "recordData": {
      "title": "Example Title"
    },
    "status": "APPROVED",
    "workflowStatus": "APPROVED",
    "createdAt": "2026-07-31T10:00:00",
    "updatedAt": "2026-07-31T10:00:00"
  }
}
```

---

### 9.3 Create Faculty Research Project
Creates a new faculty research project.

**Endpoint:** `POST /api/v1/research-repository/faculty-research-projects`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload containing fields specific to `CreateResearchProjectRequest`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Faculty research project created successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-research-projects",
    "recordData": { }
  }
}
```

---

### 9.4 Update Faculty Research Project
Updates an existing faculty research project.

**Endpoint:** `PUT /api/v1/research-repository/faculty-research-projects/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload representing updated fields.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty research project updated successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "faculty-research-projects",
    "recordData": { }
  }
}
```

---

### 9.5 Delete Faculty Research Project
Deletes a faculty research project.

**Endpoint:** `DELETE /api/v1/research-repository/faculty-research-projects/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Faculty research project deleted successfully",
  "data": null
}
```

---

### 9.6 Upload Faculty Research Projects CSV
Uploads a CSV file containing faculty research projects. Filters out any exact duplicate data rows automatically.

**Endpoint:** `POST /api/v1/research-repository/faculty-research-projects/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Faculty research projects uploaded successfully",
  "data": {
    "uploadId": "UPL-RES-12345",
    "totalRecords": 10,
    "validRecords": 8,
    "invalidRecords": 2,
    "validationErrors": []
  }
}
```

---

### 9.7 Download Faculty Research Projects CSV Template
Downloads the standard dynamic CSV template containing all required column headers.

**Endpoint:** `GET /api/v1/research-repository/faculty-research-projects/template`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):** Binary file download (`Content-Type: text/csv`)

---

## 10. STUDENT JOURNAL PUBLICATIONS

### 10.1 Get All Student Journal Publications
Retrieves a paginated list of student journal publications.

**Endpoint:** `GET /api/v1/research-repository/student-journal-publications`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `search` | String | No | - | Search term |
| `status` | String | No | - | Status filter |
| `page` | Integer | No | 0 | Page number (0-indexed) |
| `size` | Integer | No | 20 | Page size |
| `sortBy` | String | No | createdAt | Sort field |
| `sortDirection`| String | No | desc | Sort direction (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student journal publications retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 11,
        "academicYear": "2026-27",
        "moduleId": "student-journal-publications",
        "recordData": {
          "title": "Example Title"
        },
        "status": "APPROVED",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-07-31T10:00:00",
        "updatedAt": "2026-07-31T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "size": 20
  }
}
```

---

### 10.2 Get Student Journal Publication by ID
Retrieves a single student journal publication by its database ID.

**Endpoint:** `GET /api/v1/research-repository/student-journal-publications/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-journal-publications",
    "recordData": {
      "title": "Example Title"
    },
    "status": "APPROVED",
    "workflowStatus": "APPROVED",
    "createdAt": "2026-07-31T10:00:00",
    "updatedAt": "2026-07-31T10:00:00"
  }
}
```

---

### 10.3 Create Student Journal Publication
Creates a new student journal publication.

**Endpoint:** `POST /api/v1/research-repository/student-journal-publications`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload containing fields specific to `CreateStudentPublicationRequest`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student journal publication created successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-journal-publications",
    "recordData": { }
  }
}
```

---

### 10.4 Update Student Journal Publication
Updates an existing student journal publication.

**Endpoint:** `PUT /api/v1/research-repository/student-journal-publications/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload representing updated fields.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student journal publication updated successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-journal-publications",
    "recordData": { }
  }
}
```

---

### 10.5 Delete Student Journal Publication
Deletes a student journal publication.

**Endpoint:** `DELETE /api/v1/research-repository/student-journal-publications/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student journal publication deleted successfully",
  "data": null
}
```

---

### 10.6 Upload Student Journal Publications CSV
Uploads a CSV file containing student journal publications. Filters out any exact duplicate data rows automatically.

**Endpoint:** `POST /api/v1/research-repository/student-journal-publications/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student journal publications uploaded successfully",
  "data": {
    "uploadId": "UPL-RES-12345",
    "totalRecords": 10,
    "validRecords": 8,
    "invalidRecords": 2,
    "validationErrors": []
  }
}
```

---

### 10.7 Download Student Journal Publications CSV Template
Downloads the standard dynamic CSV template containing all required column headers.

**Endpoint:** `GET /api/v1/research-repository/student-journal-publications/template`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):** Binary file download (`Content-Type: text/csv`)

---

## 11. STUDENT CONFERENCE PUBLICATIONS

### 11.1 Get All Student Conference Publications
Retrieves a paginated list of student conference publications.

**Endpoint:** `GET /api/v1/research-repository/student-conference-publications`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `search` | String | No | - | Search term |
| `status` | String | No | - | Status filter |
| `page` | Integer | No | 0 | Page number (0-indexed) |
| `size` | Integer | No | 20 | Page size |
| `sortBy` | String | No | createdAt | Sort field |
| `sortDirection`| String | No | desc | Sort direction (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student conference publications retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 11,
        "academicYear": "2026-27",
        "moduleId": "student-conference-publications",
        "recordData": {
          "title": "Example Title"
        },
        "status": "APPROVED",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-07-31T10:00:00",
        "updatedAt": "2026-07-31T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "size": 20
  }
}
```

---

### 11.2 Get Student Conference Publication by ID
Retrieves a single student conference publication by its database ID.

**Endpoint:** `GET /api/v1/research-repository/student-conference-publications/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-conference-publications",
    "recordData": {
      "title": "Example Title"
    },
    "status": "APPROVED",
    "workflowStatus": "APPROVED",
    "createdAt": "2026-07-31T10:00:00",
    "updatedAt": "2026-07-31T10:00:00"
  }
}
```

---

### 11.3 Create Student Conference Publication
Creates a new student conference publication.

**Endpoint:** `POST /api/v1/research-repository/student-conference-publications`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload containing fields specific to `CreateStudentConferencePublicationRequest`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student conference publication created successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-conference-publications",
    "recordData": { }
  }
}
```

---

### 11.4 Update Student Conference Publication
Updates an existing student conference publication.

**Endpoint:** `PUT /api/v1/research-repository/student-conference-publications/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload representing updated fields.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student conference publication updated successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-conference-publications",
    "recordData": { }
  }
}
```

---

### 11.5 Delete Student Conference Publication
Deletes a student conference publication.

**Endpoint:** `DELETE /api/v1/research-repository/student-conference-publications/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student conference publication deleted successfully",
  "data": null
}
```

---

### 11.6 Upload Student Conference Publications CSV
Uploads a CSV file containing student conference publications. Filters out any exact duplicate data rows automatically.

**Endpoint:** `POST /api/v1/research-repository/student-conference-publications/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student conference publications uploaded successfully",
  "data": {
    "uploadId": "UPL-RES-12345",
    "totalRecords": 10,
    "validRecords": 8,
    "invalidRecords": 2,
    "validationErrors": []
  }
}
```

---

### 11.7 Download Student Conference Publications CSV Template
Downloads the standard dynamic CSV template containing all required column headers.

**Endpoint:** `GET /api/v1/research-repository/student-conference-publications/template`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):** Binary file download (`Content-Type: text/csv`)

---

## 12. STUDENT PATENTS

### 12.1 Get All Student Patents
Retrieves a paginated list of student patents.

**Endpoint:** `GET /api/v1/research-repository/student-patents`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `search` | String | No | - | Search term |
| `status` | String | No | - | Status filter |
| `page` | Integer | No | 0 | Page number (0-indexed) |
| `size` | Integer | No | 20 | Page size |
| `sortBy` | String | No | createdAt | Sort field |
| `sortDirection`| String | No | desc | Sort direction (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student patents retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 11,
        "academicYear": "2026-27",
        "moduleId": "student-patents",
        "recordData": {
          "title": "Example Title"
        },
        "status": "APPROVED",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-07-31T10:00:00",
        "updatedAt": "2026-07-31T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "size": 20
  }
}
```

---

### 12.2 Get Student Patent by ID
Retrieves a single student patent by its database ID.

**Endpoint:** `GET /api/v1/research-repository/student-patents/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-patents",
    "recordData": {
      "title": "Example Title"
    },
    "status": "APPROVED",
    "workflowStatus": "APPROVED",
    "createdAt": "2026-07-31T10:00:00",
    "updatedAt": "2026-07-31T10:00:00"
  }
}
```

---

### 12.3 Create Student Patent
Creates a new student patent.

**Endpoint:** `POST /api/v1/research-repository/student-patents`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload containing fields specific to `CreateStudentPatentRequest`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student patent created successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-patents",
    "recordData": { }
  }
}
```

---

### 12.4 Update Student Patent
Updates an existing student patent.

**Endpoint:** `PUT /api/v1/research-repository/student-patents/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload representing updated fields.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student patent updated successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-patents",
    "recordData": { }
  }
}
```

---

### 12.5 Delete Student Patent
Deletes a student patent.

**Endpoint:** `DELETE /api/v1/research-repository/student-patents/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student patent deleted successfully",
  "data": null
}
```

---

### 12.6 Upload Student Patents CSV
Uploads a CSV file containing student patents. Filters out any exact duplicate data rows automatically.

**Endpoint:** `POST /api/v1/research-repository/student-patents/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student patents uploaded successfully",
  "data": {
    "uploadId": "UPL-RES-12345",
    "totalRecords": 10,
    "validRecords": 8,
    "invalidRecords": 2,
    "validationErrors": []
  }
}
```

---

### 12.7 Download Student Patents CSV Template
Downloads the standard dynamic CSV template containing all required column headers.

**Endpoint:** `GET /api/v1/research-repository/student-patents/template`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):** Binary file download (`Content-Type: text/csv`)

---

## 13. STUDENT BOOKS

### 13.1 Get All Student Books
Retrieves a paginated list of student books.

**Endpoint:** `GET /api/v1/research-repository/student-books`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `search` | String | No | - | Search term |
| `status` | String | No | - | Status filter |
| `page` | Integer | No | 0 | Page number (0-indexed) |
| `size` | Integer | No | 20 | Page size |
| `sortBy` | String | No | createdAt | Sort field |
| `sortDirection`| String | No | desc | Sort direction (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student books retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 11,
        "academicYear": "2026-27",
        "moduleId": "student-books",
        "recordData": {
          "title": "Example Title"
        },
        "status": "APPROVED",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-07-31T10:00:00",
        "updatedAt": "2026-07-31T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "size": 20
  }
}
```

---

### 13.2 Get Student Book by ID
Retrieves a single student book by its database ID.

**Endpoint:** `GET /api/v1/research-repository/student-books/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-books",
    "recordData": {
      "title": "Example Title"
    },
    "status": "APPROVED",
    "workflowStatus": "APPROVED",
    "createdAt": "2026-07-31T10:00:00",
    "updatedAt": "2026-07-31T10:00:00"
  }
}
```

---

### 13.3 Create Student Book
Creates a new student book.

**Endpoint:** `POST /api/v1/research-repository/student-books`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload containing fields specific to `CreateStudentBookRequest`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student book created successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-books",
    "recordData": { }
  }
}
```

---

### 13.4 Update Student Book
Updates an existing student book.

**Endpoint:** `PUT /api/v1/research-repository/student-books/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload representing updated fields.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student book updated successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-books",
    "recordData": { }
  }
}
```

---

### 13.5 Delete Student Book
Deletes a student book.

**Endpoint:** `DELETE /api/v1/research-repository/student-books/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student book deleted successfully",
  "data": null
}
```

---

### 13.6 Upload Student Books CSV
Uploads a CSV file containing student books. Filters out any exact duplicate data rows automatically.

**Endpoint:** `POST /api/v1/research-repository/student-books/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student books uploaded successfully",
  "data": {
    "uploadId": "UPL-RES-12345",
    "totalRecords": 10,
    "validRecords": 8,
    "invalidRecords": 2,
    "validationErrors": []
  }
}
```

---

### 13.7 Download Student Books CSV Template
Downloads the standard dynamic CSV template containing all required column headers.

**Endpoint:** `GET /api/v1/research-repository/student-books/template`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):** Binary file download (`Content-Type: text/csv`)

---

## 14. STUDENT BOOK CHAPTERS

### 14.1 Get All Student Book Chapters
Retrieves a paginated list of student book chapters.

**Endpoint:** `GET /api/v1/research-repository/student-book-chapters`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `search` | String | No | - | Search term |
| `status` | String | No | - | Status filter |
| `page` | Integer | No | 0 | Page number (0-indexed) |
| `size` | Integer | No | 20 | Page size |
| `sortBy` | String | No | createdAt | Sort field |
| `sortDirection`| String | No | desc | Sort direction (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student book chapters retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 11,
        "academicYear": "2026-27",
        "moduleId": "student-book-chapters",
        "recordData": {
          "title": "Example Title"
        },
        "status": "APPROVED",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-07-31T10:00:00",
        "updatedAt": "2026-07-31T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "size": 20
  }
}
```

---

### 14.2 Get Student Book Chapter by ID
Retrieves a single student book chapter by its database ID.

**Endpoint:** `GET /api/v1/research-repository/student-book-chapters/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-book-chapters",
    "recordData": {
      "title": "Example Title"
    },
    "status": "APPROVED",
    "workflowStatus": "APPROVED",
    "createdAt": "2026-07-31T10:00:00",
    "updatedAt": "2026-07-31T10:00:00"
  }
}
```

---

### 14.3 Create Student Book Chapter
Creates a new student book chapter.

**Endpoint:** `POST /api/v1/research-repository/student-book-chapters`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload containing fields specific to `CreateStudentBookChapterRequest`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student book chapter created successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-book-chapters",
    "recordData": { }
  }
}
```

---

### 14.4 Update Student Book Chapter
Updates an existing student book chapter.

**Endpoint:** `PUT /api/v1/research-repository/student-book-chapters/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload representing updated fields.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student book chapter updated successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-book-chapters",
    "recordData": { }
  }
}
```

---

### 14.5 Delete Student Book Chapter
Deletes a student book chapter.

**Endpoint:** `DELETE /api/v1/research-repository/student-book-chapters/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student book chapter deleted successfully",
  "data": null
}
```

---

### 14.6 Upload Student Book Chapters CSV
Uploads a CSV file containing student book chapters. Filters out any exact duplicate data rows automatically.

**Endpoint:** `POST /api/v1/research-repository/student-book-chapters/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student book chapters uploaded successfully",
  "data": {
    "uploadId": "UPL-RES-12345",
    "totalRecords": 10,
    "validRecords": 8,
    "invalidRecords": 2,
    "validationErrors": []
  }
}
```

---

### 14.7 Download Student Book Chapters CSV Template
Downloads the standard dynamic CSV template containing all required column headers.

**Endpoint:** `GET /api/v1/research-repository/student-book-chapters/template`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):** Binary file download (`Content-Type: text/csv`)

---

## 15. STUDENT RESEARCH PROJECTS

### 15.1 Get All Student Research Projects
Retrieves a paginated list of student research projects.

**Endpoint:** `GET /api/v1/research-repository/student-research-projects`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `search` | String | No | - | Search term |
| `status` | String | No | - | Status filter |
| `page` | Integer | No | 0 | Page number (0-indexed) |
| `size` | Integer | No | 20 | Page size |
| `sortBy` | String | No | createdAt | Sort field |
| `sortDirection`| String | No | desc | Sort direction (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student research projects retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 11,
        "academicYear": "2026-27",
        "moduleId": "student-research-projects",
        "recordData": {
          "title": "Example Title"
        },
        "status": "APPROVED",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-07-31T10:00:00",
        "updatedAt": "2026-07-31T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "size": 20
  }
}
```

---

### 15.2 Get Student Research Project by ID
Retrieves a single student research project by its database ID.

**Endpoint:** `GET /api/v1/research-repository/student-research-projects/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-research-projects",
    "recordData": {
      "title": "Example Title"
    },
    "status": "APPROVED",
    "workflowStatus": "APPROVED",
    "createdAt": "2026-07-31T10:00:00",
    "updatedAt": "2026-07-31T10:00:00"
  }
}
```

---

### 15.3 Create Student Research Project
Creates a new student research project.

**Endpoint:** `POST /api/v1/research-repository/student-research-projects`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload containing fields specific to `CreateStudentResearchProjectRequest`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student research project created successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-research-projects",
    "recordData": { }
  }
}
```

---

### 15.4 Update Student Research Project
Updates an existing student research project.

**Endpoint:** `PUT /api/v1/research-repository/student-research-projects/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload representing updated fields.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student research project updated successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "student-research-projects",
    "recordData": { }
  }
}
```

---

### 15.5 Delete Student Research Project
Deletes a student research project.

**Endpoint:** `DELETE /api/v1/research-repository/student-research-projects/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Student research project deleted successfully",
  "data": null
}
```

---

### 15.6 Upload Student Research Projects CSV
Uploads a CSV file containing student research projects. Filters out any exact duplicate data rows automatically.

**Endpoint:** `POST /api/v1/research-repository/student-research-projects/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student research projects uploaded successfully",
  "data": {
    "uploadId": "UPL-RES-12345",
    "totalRecords": 10,
    "validRecords": 8,
    "invalidRecords": 2,
    "validationErrors": []
  }
}
```

---

### 15.7 Download Student Research Projects CSV Template
Downloads the standard dynamic CSV template containing all required column headers.

**Endpoint:** `GET /api/v1/research-repository/student-research-projects/template`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):** Binary file download (`Content-Type: text/csv`)

---

## 16. DEPARTMENT PROJECT DEVELOPMENT

### 16.1 Get All Department Project Development
Retrieves a paginated list of department projects.

**Endpoint:** `GET /api/v1/research-repository/department-project-development`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `academicYear` | String | Yes | - | Academic year |
| `search` | String | No | - | Search term |
| `status` | String | No | - | Status filter |
| `page` | Integer | No | 0 | Page number (0-indexed) |
| `size` | Integer | No | 20 | Page size |
| `sortBy` | String | No | createdAt | Sort field |
| `sortDirection`| String | No | desc | Sort direction (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Department projects retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 11,
        "academicYear": "2026-27",
        "moduleId": "department-project-development",
        "recordData": {
          "title": "Example Title"
        },
        "status": "APPROVED",
        "workflowStatus": "APPROVED",
        "createdAt": "2026-07-31T10:00:00",
        "updatedAt": "2026-07-31T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "size": 20
  }
}
```

---

### 16.2 Get Department Project by ID
Retrieves a single department project by its database ID.

**Endpoint:** `GET /api/v1/research-repository/department-project-development/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "department-project-development",
    "recordData": {
      "title": "Example Title"
    },
    "status": "APPROVED",
    "workflowStatus": "APPROVED",
    "createdAt": "2026-07-31T10:00:00",
    "updatedAt": "2026-07-31T10:00:00"
  }
}
```

---

### 16.3 Create Department Project
Creates a new department project.

**Endpoint:** `POST /api/v1/research-repository/department-project-development`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload containing fields specific to `CreateDepartmentProjectRequest`.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Department project created successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "department-project-development",
    "recordData": { }
  }
}
```

---

### 16.4 Update Department Project
Updates an existing department project.

**Endpoint:** `PUT /api/v1/research-repository/department-project-development/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Request Body:**

Accepts a JSON payload representing updated fields.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Department project updated successfully",
  "data": {
    "id": 1,
    "departmentId": 11,
    "academicYear": "2026-27",
    "moduleId": "department-project-development",
    "recordData": { }
  }
}
```

---

### 16.5 Delete Department Project
Deletes a department project.

**Endpoint:** `DELETE /api/v1/research-repository/department-project-development/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Record ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Department project deleted successfully",
  "data": null
}
```

---

### 16.6 Upload Department Projects CSV
Uploads a CSV file containing department projects. Filters out any exact duplicate data rows automatically.

**Endpoint:** `POST /api/v1/research-repository/department-project-development/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | CSV file |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Department projects uploaded successfully",
  "data": {
    "uploadId": "UPL-RES-12345",
    "totalRecords": 10,
    "validRecords": 8,
    "invalidRecords": 2,
    "validationErrors": []
  }
}
```

---

### 16.7 Download Department Projects CSV Template
Downloads the standard dynamic CSV template containing all required column headers.

**Endpoint:** `GET /api/v1/research-repository/department-project-development/template`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):** Binary file download (`Content-Type: text/csv`)

---

## 17. SUPPORTING DOCUMENTS

### 17.1 Get All Supporting Documents
Retrieves a paginated list of supporting documents.

**Endpoint:** `GET /api/v1/research-repository/supporting-documents`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `departmentId` | Long | Yes | - | Department ID |
| `category` | String | No | - | Category filter |
| `moduleId` | String | No | - | Module ID filter |
| `page` | Integer | No | 0 | Page index (0-indexed) |
| `size` | Integer | No | 20 | Page size |
| `sortBy` | String | No | uploadedAt | Sort field |
| `sortDirection`| String | No | desc | Sort direction (asc/desc) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Supporting documents retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "fileName": "document.pdf",
        "category": "Research",
        "moduleId": "faculty-journal-publications"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "currentPage": 0,
    "size": 20
  }
}
```

---

### 17.2 Upload Supporting Document
Uploads a supporting document for a specific research record.

**Endpoint:** `POST /api/v1/research-repository/supporting-documents/upload`

**Content-Type:** `multipart/form-data`

**Form Parts (`@RequestPart`):**

| Part Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `request` | JSON | Yes | `SupportingDocumentUploadRequest` (contains `moduleRecordId`, `category`, `moduleId`) |
| `file` | File | Yes | Document file |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Supporting document uploaded successfully",
  "data": {
    "id": 1,
    "fileName": "document.pdf"
  }
}
```

---

### 17.3 Download Supporting Document
Downloads a supporting document by ID.

**Endpoint:** `GET /api/v1/research-repository/supporting-documents/{id}/download`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Document ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):** Binary file download.

---

### 17.4 Delete Supporting Document
Deletes a supporting document.

**Endpoint:** `DELETE /api/v1/research-repository/supporting-documents/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Document ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `academicYear` | String | Yes | Academic year |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Supporting document deleted successfully",
  "data": null
}
```

---

## 18. WORKFLOW & VERIFICATION APIs

### 18.1 Submit Record for Verification
Submits a research record for HOD verification.

**Endpoint:** `POST /api/v1/research-repository/{module}/workflow/submit`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `module` | String | Module ID (e.g., `faculty-journal-publications`) |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recordId` | Long | Yes | Record ID |
| `departmentId` | Long | Yes | Department ID |
| `comments` | String | No | Submission comments |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Record submitted for verification",
  "data": {
    "status": "PENDING_VERIFICATION"
  }
}
```

---

### 18.2 HOD Verify Record
HOD verifies or rejects a research record.

**Endpoint:** `POST /api/v1/research-repository/{module}/workflow/verify`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `module` | String | Module ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recordId` | Long | Yes | Record ID |
| `departmentId` | Long | Yes | Department ID |
| `action` | String | Yes | Verification action (e.g., VERIFY, REJECT) |
| `comments` | String | No | Verification comments |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Record verified successfully",
  "data": {
    "status": "APPROVED"
  }
}
```

---

### 18.3 Get Workflow History
Retrieves the workflow history for a research record.

**Endpoint:** `GET /api/v1/research-repository/{module}/workflow/{recordId}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `module` | String | Module ID |
| `recordId` | Long | Record ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Workflow history retrieved successfully",
  "data": {
    "history": [
      {
        "status": "PENDING_VERIFICATION",
        "actionBy": "User Name",
        "timestamp": "2026-07-31T10:00:00"
      }
    ]
  }
}
```

---
*Last Updated: July 31, 2026*  
*Version: 1.0*

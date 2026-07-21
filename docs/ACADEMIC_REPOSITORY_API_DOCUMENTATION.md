# Academic Repository API Documentation

## Overview

This document provides comprehensive API documentation for the **Academic Repository** module in the Department Coordinator portal. These APIs manage academic calendar events, timetables, courses, add-on programs, value-added courses, evidence documents, and dashboard metrics.

**Base URL:** `/api/v1/academic-repository`

**Authentication:** All APIs require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Common Response Format

All APIs return responses in the following format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-07-17T10:30:00"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description here",
  "timestamp": "2026-07-17T10:30:00"
}
```

---

## Common Query Parameters

Most list endpoints share these common query parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `academicYear` | String | Yes | - | Academic year (e.g., "2025-2026") |
| `departmentId` | Long | Yes | - | Department identifier |
| `year` | String | No | - | Year of study (e.g., "1", "2", "3", "4") |
| `semester` | String | No | - | Semester (e.g., "1", "2") |
| `page` | Integer | No | 0 | Page number (0-indexed) |
| `size` | Integer | No | 50 | Page size |

---

## Paginated Response Format

List endpoints return paginated results in this format:

```json
{
  "content": [ ... ],
  "totalElements": 100,
  "totalPages": 5,
  "currentPage": 0,
  "size": 50
}
```

---

## 1. Academic Calendar APIs

### 1.1 Get Calendar Events

Retrieves a paginated list of calendar events.

**Endpoint:** `GET /api/v1/academic-repository/academic-calendar`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `academicYear` | String | Yes | - | Academic year |
| `departmentId` | Long | Yes | - | Department ID |
| `year` | String | No | - | Year of study |
| `semester` | String | No | - | Semester |
| `search` | String | No | - | Search by description |
| `month` | String | No | - | Month filter |
| `status` | String | No | - | Status filter (upcoming/ongoing/completed) |
| `page` | Integer | No | 0 | Page number |
| `size` | Integer | No | 50 | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 101,
        "academicYear": "2025-2026",
        "yearOfStudy": "2",
        "semester": "1",
        "description": "Mid Semester Examinations",
        "startDate": "2025-09-15",
        "endDate": "2025-09-22",
        "duration": 8,
        "createdAt": "2025-08-01T10:00:00",
        "updatedAt": "2025-08-01T10:00:00"
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

### 1.2 Create Calendar Event

Creates a new calendar event.

**Endpoint:** `POST /api/v1/academic-repository/academic-calendar`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `academicYear` | String | Yes | Academic year |
| `yearOfStudy` | String | Yes | Year of study |
| `semester` | String | Yes | Semester |
| `description` | String | Yes | Event description |
| `startDate` | Date (YYYY-MM-DD) | Yes | Event start date |
| `endDate` | Date (YYYY-MM-DD) | Yes | Event end date |

**Request Example:**
```json
{
  "academicYear": "2025-2026",
  "yearOfStudy": "2",
  "semester": "1",
  "description": "Mid Semester Examinations",
  "startDate": "2025-09-15",
  "endDate": "2025-09-22"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": 1,
    "departmentId": 101,
    "academicYear": "2025-2026",
    "yearOfStudy": "2",
    "semester": "1",
    "description": "Mid Semester Examinations",
    "startDate": "2025-09-15",
    "endDate": "2025-09-22",
    "duration": 8,
    "createdAt": "2025-08-01T10:00:00",
    "updatedAt": "2025-08-01T10:00:00"
  }
}
```

---

### 1.3 Update Calendar Event

Updates an existing calendar event.

**Endpoint:** `PUT /api/v1/academic-repository/academic-calendar/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Calendar event ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Request Body:** Same as Create Calendar Event

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": {
    "id": 1,
    "departmentId": 101,
    "academicYear": "2025-2026",
    "yearOfStudy": "2",
    "semester": "1",
    "description": "Mid Semester Examinations (Updated)",
    "startDate": "2025-09-16",
    "endDate": "2025-09-23",
    "duration": 8,
    "createdAt": "2025-08-01T10:00:00",
    "updatedAt": "2025-08-02T14:30:00"
  }
}
```

---

### 1.4 Delete Calendar Event

Soft deletes a calendar event.

**Endpoint:** `DELETE /api/v1/academic-repository/academic-calendar/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Calendar event ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Event deleted successfully",
  "data": null
}
```

---

### 1.5 Bulk Save Calendar Events

Creates multiple calendar events at once.

**Endpoint:** `POST /api/v1/academic-repository/academic-calendar/bulk`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `academicYear` | String | Yes | Academic year |
| `yearOfStudy` | String | Yes | Year of study |
| `semester` | String | Yes | Semester |
| `events` | Array | Yes | Array of calendar event objects |

**Request Example:**
```json
{
  "academicYear": "2025-2026",
  "yearOfStudy": "2",
  "semester": "1",
  "events": [
    {
      "description": "Mid Semester Exams",
      "startDate": "2025-09-15",
      "endDate": "2025-09-22"
    },
    {
      "description": "Semester End Exams",
      "startDate": "2025-12-01",
      "endDate": "2025-12-15"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "saved": 2,
    "failed": 0
  }
}
```

---

### 1.6 Upload Calendar CSV

Uploads calendar events via CSV file.

**Endpoint:** `POST /api/v1/academic-repository/academic-calendar/upload-csv`

**Content-Type:** `multipart/form-data`

**Request Parts:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | CSV file with calendar events |
| `academicYear` | String | Yes | Academic year |
| `yearOfStudy` | String | Yes | Year of study |
| `semester` | String | Yes | Semester |
| `departmentId` | Long | Yes | Department ID (query param) |

**CSV File Format:**
```csv
description,startDate,endDate
Mid Semester Exams,2025-09-15,2025-09-22
Semester End Exams,2025-12-01,2025-12-15
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "uploadId": "csv-1692000000000",
    "totalRecords": 10,
    "validRecords": 8,
    "invalidRecords": 2
  }
}
```

---

## 2. Timetable APIs

### 2.1 Get Timetable Entries

Retrieves a paginated list of timetable entries.

**Endpoint:** `GET /api/v1/academic-repository/timetable`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `academicYear` | String | Yes | - | Academic year |
| `departmentId` | Long | Yes | - | Department ID |
| `year` | String | No | - | Year of study |
| `semester` | String | No | - | Semester |
| `section` | String | No | - | Section (A/B/C/D) |
| `page` | Integer | No | 0 | Page number |
| `size` | Integer | No | 100 | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 101,
        "academicYear": "2025-2026",
        "yearOfStudy": "2",
        "semester": "1",
        "section": "A",
        "period": 1,
        "day": "Monday",
        "timeFrom": "09:00:00",
        "timeTo": "09:50:00",
        "courseCode": "CS201",
        "classInCharge": "Dr. Smith",
        "wef": "2025-08-01",
        "createdAt": "2025-08-01T10:00:00",
        "updatedAt": "2025-08-01T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 1,
    "currentPage": 0,
    "size": 100
  }
}
```

---

### 2.2 Get Timetable Grid

Retrieves timetable in grid format (days as rows, periods as columns).

**Endpoint:** `GET /api/v1/academic-repository/timetable/grid`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `academicYear` | String | Yes | Academic year |
| `departmentId` | Long | Yes | Department ID |
| `yearOfStudy` | String | Yes | Year of study |
| `semester` | String | Yes | Semester |
| `section` | String | Yes | Section (A/B/C/D) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "Monday": {
      "1": {
        "courseCode": "CS201",
        "courseName": "Data Structures",
        "faculty": "Dr. Smith",
        "timeFrom": "09:00",
        "timeTo": "09:50"
      },
      "2": {
        "courseCode": "CS202",
        "courseName": "Algorithms",
        "faculty": "Dr. Johnson",
        "timeFrom": "10:00",
        "timeTo": "10:50"
      }
    },
    "Tuesday": {
      "1": {
        "courseCode": "CS203",
        "courseName": "Database Systems",
        "faculty": "Dr. Williams",
        "timeFrom": "09:00",
        "timeTo": "09:50"
      }
    }
  }
}
```

---

### 2.3 Create Timetable Entry

Creates a new timetable entry.

**Endpoint:** `POST /api/v1/academic-repository/timetable`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `academicYear` | String | Yes | Academic year |
| `yearOfStudy` | String | Yes | Year of study |
| `semester` | String | Yes | Semester |
| `section` | String | Yes | Section (A/B/C/D) |
| `period` | Integer | Yes | Period number |
| `day` | String | Yes | Day of week |
| `timeFrom` | String | No | Start time (HH:mm) |
| `timeTo` | String | No | End time (HH:mm) |
| `courseCode` | String | Yes | Course code |
| `classInCharge` | String | Yes | Faculty name |
| `wef` | Date | No | With effect from date |

**Request Example:**
```json
{
  "academicYear": "2025-2026",
  "yearOfStudy": "2",
  "semester": "1",
  "section": "A",
  "period": 1,
  "day": "Monday",
  "timeFrom": "09:00",
  "timeTo": "09:50",
  "courseCode": "CS201",
  "classInCharge": "Dr. Smith",
  "wef": "2025-08-01"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Timetable entry created successfully",
  "data": {
    "id": 1,
    "departmentId": 101,
    "academicYear": "2025-2026",
    "yearOfStudy": "2",
    "semester": "1",
    "section": "A",
    "period": 1,
    "day": "Monday",
    "timeFrom": "09:00:00",
    "timeTo": "09:50:00",
    "courseCode": "CS201",
    "classInCharge": "Dr. Smith",
    "wef": "2025-08-01",
    "createdAt": "2025-08-01T10:00:00",
    "updatedAt": "2025-08-01T10:00:00"
  }
}
```

---

### 2.4 Update Timetable Entry

Updates an existing timetable entry.

**Endpoint:** `PUT /api/v1/academic-repository/timetable/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Timetable entry ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Request Body:** Same as Create Timetable Entry

**Response (200 OK):** Same as Create response

---

### 2.5 Delete Timetable Entry

Soft deletes a timetable entry.

**Endpoint:** `DELETE /api/v1/academic-repository/timetable/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Timetable entry ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Timetable entry deleted successfully",
  "data": null
}
```

---

### 2.6 Bulk Save Timetable

Creates multiple timetable entries at once.

**Endpoint:** `POST /api/v1/academic-repository/timetable/bulk`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `academicYear` | String | Yes | Academic year |
| `yearOfStudy` | String | Yes | Year of study |
| `semester` | String | Yes | Semester |
| `section` | String | Yes | Section |
| `entries` | Array | Yes | Array of timetable entry objects |

**Request Example:**
```json
{
  "academicYear": "2025-2026",
  "yearOfStudy": "2",
  "semester": "1",
  "section": "A",
  "entries": [
    {
      "period": 1,
      "day": "Monday",
      "courseCode": "CS201",
      "classInCharge": "Dr. Smith",
      "timeFrom": "09:00",
      "timeTo": "09:50"
    },
    {
      "period": 2,
      "day": "Monday",
      "courseCode": "CS202",
      "classInCharge": "Dr. Johnson",
      "timeFrom": "10:00",
      "timeTo": "10:50"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "saved": 2,
    "failed": 0
  }
}
```

---

### 2.7 Upload Timetable CSV

Uploads timetable entries via CSV file.

**Endpoint:** `POST /api/v1/academic-repository/timetable/upload-csv`

**Content-Type:** `multipart/form-data`

**Request Parts:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | CSV file with timetable entries |
| `academicYear` | String | Yes | Academic year |
| `yearOfStudy` | String | Yes | Year of study |
| `semester` | String | Yes | Semester |
| `section` | String | Yes | Section |
| `departmentId` | Long | Yes | Department ID (query param) |

**CSV File Format:**
```csv
period,day,timeFrom,timeTo,courseCode,classInCharge
1,Monday,09:00,09:50,CS201,Dr. Smith
2,Monday,10:00,10:50,CS202,Dr. Johnson
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "uploadId": "csv-1692000000000",
    "totalRecords": 30,
    "validRecords": 28,
    "invalidRecords": 2
  }
}
```

---

## 3. Courses APIs

### 3.1 Get Courses

Retrieves a paginated list of courses.

**Endpoint:** `GET /api/v1/academic-repository/courses`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `academicYear` | String | Yes | - | Academic year |
| `departmentId` | Long | Yes | - | Department ID |
| `year` | String | No | - | Year of study |
| `semester` | String | No | - | Semester |
| `courseType` | String | No | - | Course type filter |
| `status` | String | No | - | Status filter |
| `search` | String | No | - | Search by courseCode or courseName |
| `page` | Integer | No | 0 | Page number |
| `size` | Integer | No | 50 | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 101,
        "academicYear": "2025-2026",
        "yearOfStudy": "2",
        "semester": "1",
        "courseCode": "CS201",
        "courseName": "Data Structures",
        "facultyName": "Dr. Smith",
        "courseType": "Theory",
        "lectureHours": 3.0,
        "theoryHours": 0.0,
        "practicalHours": 0.0,
        "teamWorkHours": 0.0,
        "selfLearningHours": 1.0,
        "ciHours": 3.0,
        "piHours": 1.0,
        "totalHours": 4.0,
        "credits": 4,
        "status": "Active",
        "validationStatus": "Validated",
        "createdAt": "2025-08-01T10:00:00",
        "updatedAt": "2025-08-01T10:00:00"
      }
    ],
    "totalElements": 40,
    "totalPages": 1,
    "currentPage": 0,
    "size": 50
  }
}
```

---

### 3.2 Get Course by ID

Retrieves a single course by its ID.

**Endpoint:** `GET /api/v1/academic-repository/courses/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Course ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "departmentId": 101,
    "academicYear": "2025-2026",
    "yearOfStudy": "2",
    "semester": "1",
    "courseCode": "CS201",
    "courseName": "Data Structures",
    "facultyName": "Dr. Smith",
    "courseType": "Theory",
    "lectureHours": 3.0,
    "theoryHours": 0.0,
    "practicalHours": 0.0,
    "teamWorkHours": 0.0,
    "selfLearningHours": 1.0,
    "ciHours": 3.0,
    "piHours": 1.0,
    "totalHours": 4.0,
    "credits": 4,
    "status": "Active",
    "validationStatus": "Validated",
    "createdAt": "2025-08-01T10:00:00",
    "updatedAt": "2025-08-01T10:00:00"
  }
}
```

---

### 3.3 Create Course

Creates a new course record.

**Endpoint:** `POST /api/v1/academic-repository/courses`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Request Body:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `academicYear` | String | Yes | - | Academic year |
| `yearOfStudy` | String | Yes | - | Year of study |
| `semester` | String | Yes | - | Semester |
| `courseCode` | String | Yes | - | Course code |
| `courseName` | String | Yes | - | Course name |
| `facultyName` | String | No | - | Faculty name |
| `courseType` | String | No | - | Course type (Theory/Lab/Elective) |
| `lectureHours` | Double | No | 0.0 | Lecture hours per week |
| `theoryHours` | Double | No | 0.0 | Theory/tutorial hours |
| `practicalHours` | Double | No | 0.0 | Practical/lab hours |
| `teamWorkHours` | Double | No | 0.0 | Team work hours |
| `selfLearningHours` | Double | No | 0.0 | Self learning hours |
| `status` | String | No | "Active" | Course status |

**Request Example:**
```json
{
  "academicYear": "2025-2026",
  "yearOfStudy": "2",
  "semester": "1",
  "courseCode": "CS201",
  "courseName": "Data Structures",
  "facultyName": "Dr. Smith",
  "courseType": "Theory",
  "lectureHours": 3.0,
  "theoryHours": 0.0,
  "practicalHours": 0.0,
  "teamWorkHours": 0.0,
  "selfLearningHours": 1.0,
  "status": "Active"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "id": 1,
    "departmentId": 101,
    "academicYear": "2025-2026",
    "yearOfStudy": "2",
    "semester": "1",
    "courseCode": "CS201",
    "courseName": "Data Structures",
    "facultyName": "Dr. Smith",
    "courseType": "Theory",
    "lectureHours": 3.0,
    "theoryHours": 0.0,
    "practicalHours": 0.0,
    "teamWorkHours": 0.0,
    "selfLearningHours": 1.0,
    "ciHours": 3.0,
    "piHours": 1.0,
    "totalHours": 4.0,
    "credits": 4,
    "status": "Active",
    "validationStatus": "Pending",
    "createdAt": "2025-08-01T10:00:00",
    "updatedAt": "2025-08-01T10:00:00"
  }
}
```

---

### 3.4 Update Course

Updates an existing course record.

**Endpoint:** `PUT /api/v1/academic-repository/courses/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Course ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Request Body:** Same as Create Course

**Response (200 OK):** Same as Create response

---

### 3.5 Delete Course

Soft deletes a course record.

**Endpoint:** `DELETE /api/v1/academic-repository/courses/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Course ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Course deleted successfully",
  "data": null
}
```

---

### 3.6 Bulk Save Courses

Creates multiple courses at once.

**Endpoint:** `POST /api/v1/academic-repository/courses/bulk`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `academicYear` | String | Yes | Academic year |
| `yearOfStudy` | String | Yes | Year of study |
| `semester` | String | Yes | Semester |
| `courses` | Array | Yes | Array of course objects |

**Request Example:**
```json
{
  "academicYear": "2025-2026",
  "yearOfStudy": "2",
  "semester": "1",
  "courses": [
    {
      "courseCode": "CS201",
      "courseName": "Data Structures",
      "facultyName": "Dr. Smith",
      "courseType": "Theory",
      "lectureHours": 3.0
    },
    {
      "courseCode": "CS202",
      "courseName": "Algorithms",
      "facultyName": "Dr. Johnson",
      "courseType": "Theory",
      "lectureHours": 3.0
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "message": "Courses saved successfully",
    "totalSaved": 2,
    "totalCredits": 8,
    "totalHours": 8.0
  }
}
```

---

### 3.7 Get Course Statistics

Retrieves statistics for courses in a specific semester.

**Endpoint:** `GET /api/v1/academic-repository/courses/stats`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `academicYear` | String | Yes | Academic year |
| `departmentId` | Long | Yes | Department ID |
| `yearOfStudy` | String | Yes | Year of study |
| `semester` | String | Yes | Semester |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "totalCourses": 12,
    "totalCredits": 48,
    "totalContactHours": 56.0,
    "theoryCourses": 8,
    "labCourses": 4
  }
}
```

---

### 3.8 Upload Courses CSV

Uploads courses via CSV file.

**Endpoint:** `POST /api/v1/academic-repository/courses/upload-csv`

**Content-Type:** `multipart/form-data`

**Request Parts:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | CSV file with courses |
| `academicYear` | String | Yes | Academic year |
| `yearOfStudy` | String | Yes | Year of study |
| `semester` | String | Yes | Semester |
| `departmentId` | Long | Yes | Department ID (query param) |

**CSV File Format:**
```csv
courseCode,courseName,facultyName,courseType,lectureHours,practicalHours
CS201,Data Structures,Dr. Smith,Theory,3.0,0.0
CS202,Algorithms,Dr. Johnson,Theory,3.0,0.0
CS203,Programming Lab,Dr. Williams,Lab,0.0,3.0
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "uploadId": "csv-1692000000000",
    "totalRecords": 12,
    "validRecords": 10,
    "invalidRecords": 2
  }
}
```

---

## 4. Add-on Programs APIs

### 4.1 Get Add-on Programs

Retrieves a paginated list of add-on certification programs.

**Endpoint:** `GET /api/v1/academic-repository/addon-programs`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `academicYear` | String | Yes | - | Academic year |
| `departmentId` | Long | Yes | - | Department ID |
| `year` | String | No | - | Year of study |
| `semester` | String | No | - | Semester |
| `certificationProvided` | String | No | - | Certification provided filter |
| `search` | String | No | - | Search by topic or coordinator |
| `page` | Integer | No | 0 | Page number |
| `size` | Integer | No | 50 | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 101,
        "academicYear": "2025-2026",
        "yearOfStudy": "2",
        "semester": "1",
        "topic": "Python for Data Science",
        "fromDate": "2025-08-15",
        "toDate": "2025-09-15",
        "timeFrom": "16:00:00",
        "timeTo": "18:00:00",
        "coordinator": "Dr. Smith",
        "duration": "4 weeks",
        "studentsEnrolled": 45,
        "studentsParticipated": 42,
        "certificationProvided": true,
        "certificatesIssued": 40,
        "createdAt": "2025-08-01T10:00:00",
        "updatedAt": "2025-08-01T10:00:00"
      }
    ],
    "totalElements": 15,
    "totalPages": 1,
    "currentPage": 0,
    "size": 50
  }
}
```

---

### 4.2 Create Add-on Program

Creates a new add-on certification program.

**Endpoint:** `POST /api/v1/academic-repository/addon-programs`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `academicYear` | String | Yes | Academic year |
| `yearOfStudy` | String | Yes | Year of study |
| `semester` | String | Yes | Semester |
| `topic` | String | Yes | Program topic |
| `fromDate` | Date (YYYY-MM-DD) | Yes | Start date |
| `toDate` | Date (YYYY-MM-DD) | Yes | End date |
| `timeFrom` | String | No | Start time (HH:mm) |
| `timeTo` | String | No | End time (HH:mm) |
| `coordinator` | String | Yes | Program coordinator |
| `duration` | String | No | Duration description |
| `studentsEnrolled` | Integer | No | Number of enrolled students |
| `studentsParticipated` | Integer | No | Number of participating students |
| `certificationProvided` | Boolean | No | Whether certification is provided |
| `certificatesIssued` | Integer | No | Number of certificates issued |

**Request Example:**
```json
{
  "academicYear": "2025-2026",
  "yearOfStudy": "2",
  "semester": "1",
  "topic": "Python for Data Science",
  "fromDate": "2025-08-15",
  "toDate": "2025-09-15",
  "timeFrom": "16:00",
  "timeTo": "18:00",
  "coordinator": "Dr. Smith",
  "duration": "4 weeks",
  "studentsEnrolled": 45,
  "studentsParticipated": 42,
  "certificationProvided": true,
  "certificatesIssued": 40
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Add-on Program created successfully",
  "data": {
    "id": 1,
    "departmentId": 101,
    "academicYear": "2025-2026",
    "yearOfStudy": "2",
    "semester": "1",
    "topic": "Python for Data Science",
    "fromDate": "2025-08-15",
    "toDate": "2025-09-15",
    "timeFrom": "16:00:00",
    "timeTo": "18:00:00",
    "coordinator": "Dr. Smith",
    "duration": "4 weeks",
    "studentsEnrolled": 45,
    "studentsParticipated": 42,
    "certificationProvided": true,
    "certificatesIssued": 40,
    "createdAt": "2025-08-01T10:00:00",
    "updatedAt": "2025-08-01T10:00:00"
  }
}
```

---

### 4.3 Update Add-on Program

Updates an existing add-on program.

**Endpoint:** `PUT /api/v1/academic-repository/addon-programs/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Add-on program ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Request Body:** Same as Create Add-on Program

**Response (200 OK):** Same as Create response

---

### 4.4 Delete Add-on Program

Soft deletes an add-on program.

**Endpoint:** `DELETE /api/v1/academic-repository/addon-programs/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Add-on program ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Add-on Program deleted successfully",
  "data": null
}
```

---

### 4.5 Bulk Save Add-on Programs

Creates multiple add-on programs at once.

**Endpoint:** `POST /api/v1/academic-repository/addon-programs/bulk`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `academicYear` | String | Yes | Academic year |
| `yearOfStudy` | String | Yes | Year of study |
| `semester` | String | Yes | Semester |
| `programs` | Array | Yes | Array of add-on program objects |

**Request Example:**
```json
{
  "academicYear": "2025-2026",
  "yearOfStudy": "2",
  "semester": "1",
  "programs": [
    {
      "topic": "Python for Data Science",
      "fromDate": "2025-08-15",
      "toDate": "2025-09-15",
      "coordinator": "Dr. Smith",
      "studentsEnrolled": 45
    },
    {
      "topic": "Machine Learning Basics",
      "fromDate": "2025-09-20",
      "toDate": "2025-10-20",
      "coordinator": "Dr. Johnson",
      "studentsEnrolled": 35
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "saved": 2,
    "failed": 0
  }
}
```

---

### 4.6 Upload Add-on Programs CSV

Uploads add-on programs via CSV file.

**Endpoint:** `POST /api/v1/academic-repository/addon-programs/upload-csv`

**Content-Type:** `multipart/form-data`

**Request Parts:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | CSV file with add-on programs |
| `academicYear` | String | Yes | Academic year |
| `yearOfStudy` | String | Yes | Year of study |
| `semester` | String | Yes | Semester |
| `departmentId` | Long | Yes | Department ID (query param) |

**CSV File Format:**
```csv
topic,fromDate,toDate,coordinator,duration,studentsEnrolled,certificationProvided
Python for Data Science,2025-08-15,2025-09-15,Dr. Smith,4 weeks,45,true
Machine Learning Basics,2025-09-20,2025-10-20,Dr. Johnson,4 weeks,35,true
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "uploadId": "csv-1692000000000",
    "totalRecords": 8,
    "validRecords": 7,
    "invalidRecords": 1
  }
}
```

---

## 5. Value Added Courses APIs

### 5.1 Get Value Added Courses

Retrieves a paginated list of value added courses.

**Endpoint:** `GET /api/v1/academic-repository/value-added-courses`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `academicYear` | String | Yes | - | Academic year |
| `departmentId` | Long | Yes | - | Department ID |
| `year` | String | No | - | Year of study |
| `semester` | String | No | - | Semester |
| `certificationProvided` | String | No | - | Certification provided filter |
| `search` | String | No | - | Search by courseName or courseInstructor |
| `page` | Integer | No | 0 | Page number |
| `size` | Integer | No | 50 | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 101,
        "academicYear": "2025-2026",
        "yearOfStudy": "2",
        "semester": "1",
        "courseName": "Cloud Computing",
        "fromDate": "2025-08-10",
        "toDate": "2025-10-10",
        "timeFrom": "15:00:00",
        "timeTo": "17:00:00",
        "courseInstructor": "Dr. Williams",
        "duration": "8 weeks",
        "studentsEnrolled": 50,
        "studentsParticipated": 48,
        "certificationProvided": true,
        "certificatesIssued": 45,
        "createdAt": "2025-08-01T10:00:00",
        "updatedAt": "2025-08-01T10:00:00"
      }
    ],
    "totalElements": 10,
    "totalPages": 1,
    "currentPage": 0,
    "size": 50
  }
}
```

---

### 5.2 Create Value Added Course

Creates a new value added course.

**Endpoint:** `POST /api/v1/academic-repository/value-added-courses`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `academicYear` | String | Yes | Academic year |
| `yearOfStudy` | String | Yes | Year of study |
| `semester` | String | Yes | Semester |
| `courseName` | String | Yes | Course name |
| `fromDate` | Date (YYYY-MM-DD) | No | Start date |
| `toDate` | Date (YYYY-MM-DD) | No | End date |
| `timeFrom` | String | No | Start time (HH:mm) |
| `timeTo` | String | No | End time (HH:mm) |
| `courseInstructor` | String | Yes | Course instructor |
| `duration` | String | No | Duration description |
| `studentsEnrolled` | Integer | No | Number of enrolled students |
| `studentsParticipated` | Integer | No | Number of participating students |
| `certificationProvided` | Boolean | No | Whether certification is provided |
| `certificatesIssued` | Integer | No | Number of certificates issued |

**Request Example:**
```json
{
  "academicYear": "2025-2026",
  "yearOfStudy": "2",
  "semester": "1",
  "courseName": "Cloud Computing",
  "fromDate": "2025-08-10",
  "toDate": "2025-10-10",
  "timeFrom": "15:00",
  "timeTo": "17:00",
  "courseInstructor": "Dr. Williams",
  "duration": "8 weeks",
  "studentsEnrolled": 50,
  "studentsParticipated": 48,
  "certificationProvided": true,
  "certificatesIssued": 45
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Value Added Course created successfully",
  "data": {
    "id": 1,
    "departmentId": 101,
    "academicYear": "2025-2026",
    "yearOfStudy": "2",
    "semester": "1",
    "courseName": "Cloud Computing",
    "fromDate": "2025-08-10",
    "toDate": "2025-10-10",
    "timeFrom": "15:00:00",
    "timeTo": "17:00:00",
    "courseInstructor": "Dr. Williams",
    "duration": "8 weeks",
    "studentsEnrolled": 50,
    "studentsParticipated": 48,
    "certificationProvided": true,
    "certificatesIssued": 45,
    "createdAt": "2025-08-01T10:00:00",
    "updatedAt": "2025-08-01T10:00:00"
  }
}
```

---

### 5.3 Update Value Added Course

Updates an existing value added course.

**Endpoint:** `PUT /api/v1/academic-repository/value-added-courses/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Value added course ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Request Body:** Same as Create Value Added Course

**Response (200 OK):** Same as Create response

---

### 5.4 Delete Value Added Course

Soft deletes a value added course.

**Endpoint:** `DELETE /api/v1/academic-repository/value-added-courses/{id}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Value added course ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Value Added Course deleted successfully",
  "data": null
}
```

---

### 5.5 Bulk Save Value Added Courses

Creates multiple value added courses at once.

**Endpoint:** `POST /api/v1/academic-repository/value-added-courses/bulk`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `academicYear` | String | Yes | Academic year |
| `yearOfStudy` | String | Yes | Year of study |
| `semester` | String | Yes | Semester |
| `courses` | Array | Yes | Array of value added course objects |

**Request Example:**
```json
{
  "academicYear": "2025-2026",
  "yearOfStudy": "2",
  "semester": "1",
  "courses": [
    {
      "courseName": "Cloud Computing",
      "courseInstructor": "Dr. Williams",
      "studentsEnrolled": 50
    },
    {
      "courseName": "DevOps Fundamentals",
      "courseInstructor": "Dr. Brown",
      "studentsEnrolled": 40
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "saved": 2,
    "failed": 0
  }
}
```

---

### 5.6 Upload Value Added Courses CSV

Uploads value added courses via CSV file.

**Endpoint:** `POST /api/v1/academic-repository/value-added-courses/upload-csv`

**Content-Type:** `multipart/form-data`

**Request Parts:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | CSV file with value added courses |
| `academicYear` | String | Yes | Academic year |
| `yearOfStudy` | String | Yes | Year of study |
| `semester` | String | Yes | Semester |
| `departmentId` | Long | Yes | Department ID (query param) |

**CSV File Format:**
```csv
courseName,fromDate,toDate,courseInstructor,duration,studentsEnrolled,certificationProvided
Cloud Computing,2025-08-10,2025-10-10,Dr. Williams,8 weeks,50,true
DevOps Fundamentals,2025-08-15,2025-10-15,Dr. Brown,8 weeks,40,true
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "uploadId": "csv-1692000000000",
    "totalRecords": 6,
    "validRecords": 5,
    "invalidRecords": 1
  }
}
```

---

## 6. Evidence/Document APIs

### 6.1 Get Evidence Documents

Retrieves a paginated list of evidence documents.

**Endpoint:** `GET /api/v1/academic-repository/evidence`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `academicYear` | String | Yes | - | Academic year |
| `departmentId` | Long | Yes | - | Department ID |
| `year` | String | No | - | Year of study |
| `semester` | String | No | - | Semester |
| `sectionName` | String | No | - | Section name |
| `recordId` | Long | No | - | Record ID |
| `status` | String | No | - | Status filter |
| `page` | Integer | No | 0 | Page number |
| `size` | Integer | No | 50 | Page size |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "departmentId": 101,
        "academicYear": "2025-2026",
        "yearOfStudy": "2",
        "semester": "1",
        "sectionName": "courses",
        "recordId": 1,
        "documentName": "Course syllabus",
        "documentType": "pdf",
        "fileName": "CS201_syllabus.pdf",
        "fileSize": 1024000,
        "fileType": "application/pdf",
        "uploadedBy": "user123",
        "uploadedAt": "2025-08-01T10:00:00",
        "verificationStatus": "Pending",
        "verifiedBy": null,
        "verifiedAt": null,
        "createdAt": "2025-08-01T10:00:00",
        "updatedAt": "2025-08-01T10:00:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 1,
    "currentPage": 0,
    "size": 50
  }
}
```

---

### 6.2 Upload Evidence Document

Uploads an evidence file.

**Endpoint:** `POST /api/v1/academic-repository/evidence/upload`

**Content-Type:** `multipart/form-data`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |
| `uploadedBy` | Long | Yes | User ID of uploader |

**Request Parts:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Evidence file |
| `academicYear` | String | Yes | Academic year |
| `yearOfStudy` | String | No | Year of study |
| `semester` | String | No | Semester |
| `sectionName` | String | Yes | Section name (e.g., "courses", "timetable") |
| `recordId` | Long | Yes | Record ID to attach evidence |
| `documentType` | String | No | Document type (pdf, image, etc.) |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "fileName": "CS201_syllabus.pdf",
    "fileSize": 1024000,
    "fileType": "application/pdf",
    "uploadedBy": "user123",
    "uploadedAt": "2025-08-01T10:00:00",
    "verificationStatus": "Pending",
    "message": "Evidence uploaded successfully"
  }
}
```

---

### 6.3 Download Evidence Document

Returns download URL for an evidence document.

**Endpoint:** `GET /api/v1/academic-repository/evidence/{id}/download`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Evidence document ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "downloadUrl": "/evidence/1/download"
  }
}
```

---

### 6.4 Delete Evidence Document

Soft deletes an evidence document.

**Endpoint:** `DELETE /api/v1/academic-repository/evidence/{id}`

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
  "message": "Evidence document deleted successfully",
  "data": null
}
```

---

### 6.5 Verify Evidence Document

Verifies or rejects an evidence document.

**Endpoint:** `PUT /api/v1/academic-repository/evidence/{id}/verify`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Long | Evidence document ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `departmentId` | Long | Yes | Department ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `verificationStatus` | String | Yes | "Verified" or "Rejected" |
| `remarks` | String | No | Remarks for verification/rejection |

**Request Example:**
```json
{
  "verificationStatus": "Verified",
  "remarks": "Document is valid and meets requirements"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Evidence document verified successfully",
  "data": null
}
```

---

## 7. Dashboard APIs

### 7.1 Get Repository Summary

Retrieves repository summary with KPIs and section-wise metrics.

**Endpoint:** `GET /api/v1/academic-repository/dashboard/summary`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `academicYear` | String | Yes | Academic year |
| `departmentId` | Long | Yes | Department ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "academicYear": "2025-2026",
    "departmentId": 101,
    "dataCompleteness": 78,
    "evidenceScore": 65,
    "verificationScore": 82,
    "readinessScore": 75,
    "sections": [
      {
        "id": "courses",
        "label": "Courses",
        "totalRecords": 45,
        "completionPercent": 90,
        "verificationStatus": "Verified",
        "lastUpdated": "2025-08-15",
        "trend": 5
      },
      {
        "id": "timetable",
        "label": "Timetable",
        "totalRecords": 120,
        "completionPercent": 85,
        "verificationStatus": "Pending",
        "lastUpdated": "2025-08-10",
        "trend": 3
      },
      {
        "id": "calendar",
        "label": "Academic Calendar",
        "totalRecords": 15,
        "completionPercent": 100,
        "verificationStatus": "Verified",
        "lastUpdated": "2025-08-12",
        "trend": 0
      }
    ]
  }
}
```

---

### 7.2 Get Section Metrics

Retrieves detailed metrics for a specific section.

**Endpoint:** `GET /api/v1/academic-repository/dashboard/section-metrics/{sectionId}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `sectionId` | String | Section ID (e.g., "courses", "timetable", "calendar") |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `academicYear` | String | Yes | Academic year |
| `departmentId` | Long | Yes | Department ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "sectionId": "courses",
    "recordsUploaded": 45,
    "pendingValidation": 5,
    "pendingVerification": 8,
    "verified": 30,
    "approved": 28,
    "rejected": 2,
    "lastUpdated": "2025-08-15T14:30:00"
  }
}
```

---

## Appendix A: Section IDs Reference

| Section ID | Label |
|------------|-------|
| `courses` | Courses |
| `timetable` | Timetable |
| `calendar` | Academic Calendar |
| `addon-programs` | Add-on Programs |
| `value-added-courses` | Value Added Courses |
| `evidence` | Evidence Documents |

---

## Appendix B: Common Enum Values

### Year of Study
- `1` - First Year
- `2` - Second Year
- `3` - Third Year
- `4` - Fourth Year

### Semester
- `1` - Semester 1
- `2` - Semester 2

### Day (Timetable)
- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday

### Course Type
- Theory
- Lab
- Elective
- Core

### Verification Status
- Pending
- Verified
- Rejected

### Calendar Event Status
- upcoming
- ongoing
- completed

---

## Appendix C: Error Codes

| HTTP Status | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing JWT token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource does not exist |
| 500 | Internal Server Error |

---

## Appendix D: Date and Time Formats

| Format | Example | Description |
|--------|---------|-------------|
| Date | `2025-08-15` | ISO 8601 date format |
| Time | `16:00:00` | 24-hour time format |
| DateTime | `2025-08-15T10:30:00` | ISO 8601 datetime format |

---

*Last Updated: July 17, 2026*
*Version: 1.0*

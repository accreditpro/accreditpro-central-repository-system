# TASK: Align Spring Boot REST APIs and OpenAPI Documentation with Frontend Research Repository Config

Please update/create the Spring Boot Controllers, Service Layer, DTO Classes, Entities, and OpenAPI/Swagger Documentation for the **Department Coordinator - Research Repository** module.

The frontend source of truth is `src/pages/department-repository/repository-configs.ts` (`researchRepositoryConfig`). The DTO JSON request/response property names MUST match the exact camelCase keys derived from the CSV column headers.

---

## 1. Global API Specifications

- **Base Endpoint Path:** `/api/v1/department-coordinator/research`
- **Swagger Tag:** `DC - Research Repository`
- **Authentication Header:** `Authorization: Bearer <jwt-token>`
- **Standard Query Parameters for GET (List) Endpoints:**
  - `departmentId` (Long, Required)
  - `academicYear` (String, Optional, default: `"2025-26"`)
  - `page` (Integer, Optional, default: `0`)
  - `size` (Integer, Optional, default: `10`)
  - `search` (String, Optional)

### Standard Response Structure:
1. **Single Object / Mutation Operations (`ApiResponse<T>`)**:
   ```json
   {
     "success": true,
     "message": "Operation completed successfully",
     "data": { ... },
     "timestamp": "2026-08-01T12:00:00"
   }
   ```
2. **Paginated List Operations (`ApiResponse<Page<T>>`)**:
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

---

## 2. Health & Readiness Score API

### `GET /api/v1/department-coordinator/research/health`
- **Query Parameters:** `departmentId` (Long, Required), `academicYear` (String, Optional, default `"2025-26"`)
- **Response Schema:**
  ```json
  {
    "success": true,
    "message": "Research repository health metrics retrieved successfully",
    "data": {
      "academicYear": "2025-26",
      "dataCompleteness": 74,
      "evidenceCompleteness": 60,
      "verificationPercent": 65,
      "readinessScore": 66,
      "tabWiseMetrics": {
        "faculty-journal-publications": {
          "tabId": "faculty-journal-publications",
          "tabLabel": "Faculty Journal Publications",
          "recordsUploaded": 45,
          "pendingValidation": 2,
          "pendingVerification": 3,
          "verified": 40,
          "approved": 40,
          "rejected": 0,
          "lastUpdated": "2026-08-01T10:00:00"
        }
      }
    }
  }
  ```

---

## 3. Sub-Module Standard Endpoints & DTO Schemas

Each of the 15 sub-modules requires 5 standard endpoints:
1. `GET /api/v1/department-coordinator/research/{module-slug}` (List paginated)
2. `POST /api/v1/department-coordinator/research/{module-slug}` (Create record)
3. `PUT /api/v1/department-coordinator/research/{module-slug}/{id}` (Update record)
4. `DELETE /api/v1/department-coordinator/research/{module-slug}/{id}` (Delete record)
5. `POST /api/v1/department-coordinator/research/{module-slug}/upload` (Multipart CSV upload)

---

### DTO Schemas (Exact CamelCase Keys):

#### 3.1 Faculty Journal Publications (`/faculty-journal-publications`)
- `publicationId` (String, Required)
- `facultyId` (String, Required)
- `facultyName` (String, Required)
- `department` (String, Required)
- `titleOfPaper` (String, Required)
- `journalName` (String, Required)
- `publisher` (String, Optional)
- `issn` (String, Optional)
- `doi` (String, Optional)
- `volume` (String, Optional)
- `issue` (String, Optional)
- `pageNumbers` (String, Optional)
- `publicationDate` (Date `YYYY-MM-DD`, Required)
- `publicationYear` (Number, Required)
- `academicYear` (String, Required)
- `scopusIndexed` (String `"Yes"/"No"`, Optional)
- `sciIndexed` (String `"Yes"/"No"`, Optional)
- `wosIndexed` (String `"Yes"/"No"`, Optional)

#### 3.2 Faculty Conference Publications (`/faculty-conference-publications`)
- `publicationId` (String, Required)
- `facultyId` (String, Required)
- `facultyName` (String, Required)
- `paperTitle` (String, Required)
- `conferenceName` (String, Required)
- `organizer` (String, Optional)
- `conferenceType` (String `"National"/"International"`, Required)
- `venue` (String, Optional)
- `startDate` (Date `YYYY-MM-DD`, Required)
- `endDate` (Date `YYYY-MM-DD`, Optional)
- `publisher` (String, Optional)
- `isbn` (String, Optional)
- `doi` (String, Optional)
- `proceedingsPublished` (String `"Yes"/"No"`, Optional)
- `academicYear` (String, Required)

#### 3.3 Faculty Patents (`/faculty-patents`)
- `patentTitle` (String, Required)
- `facultyName` (String, Required)
- `coInventors` (String, Optional)
- `patentType` (String `"Utility"/"Design"/"Plant"`, Required)
- `patentNumber` (String, Optional)
- `applicationNumber` (String, Required)
- `country` (String, Required)
- `filingDate` (Date `YYYY-MM-DD`, Required)
- `publicationDate` (Date `YYYY-MM-DD`, Optional)
- `grantDate` (Date `YYYY-MM-DD`, Optional)
- `status` (String `"Filed"/"Published"/"Granted"`, Required)
- `commercialized` (String `"Yes"/"No"`, Optional)
- `academicYear` (String, Required)

#### 3.4 Faculty Books (`/faculty-books`)
- `bookTitle` (String, Required)
- `facultyName` (String, Required)
- `publisher` (String, Required)
- `isbn` (String, Required)
- `edition` (String, Optional)
- `publicationDate` (Date `YYYY-MM-DD`, Required)
- `academicYear` (String, Required)
- `bookType` (String `"Textbook"/"Reference Book"/"Authored Book"/"Edited Volume"/"Conference Proceedings"`, Required)
- `numberOfChapters` (Number, Optional)

#### 3.5 Faculty Book Chapters (`/faculty-book-chapters`)
- `chapterTitle` (String, Required)
- `bookTitle` (String, Required)
- `facultyName` (String, Required)
- `publisher` (String, Required)
- `isbn` (String, Required)
- `chapterNumber` (String, Optional)
- `pages` (String, Optional)
- `publicationDate` (Date `YYYY-MM-DD`, Required)
- `academicYear` (String, Required)

#### 3.6 Faculty Sponsored Projects (`/faculty-sponsored-projects`)
- `projectTitle` (String, Required)
- `principalInvestigator` (String, Required)
- `coInvestigator` (String, Optional)
- `fundingAgency` (String, Required)
- `grantNumber` (String, Required)
- `sanctionedAmount` (Number, Required)
- `startDate` (Date `YYYY-MM-DD`, Required)
- `durationMonths` (Number, Required)
- `status` (String `"Ongoing"/"Completed"/"Sanctioned"`, Required)
- `academicYear` (String, Required)

#### 3.7 Faculty Consultancy Projects (`/faculty-consultancy-projects`)
- `projectTitle` (String, Required)
- `consultantName` (String, Required)
- `clientOrganization` (String, Required)
- `amountSanctioned` (Number, Required)
- `startDate` (Date `YYYY-MM-DD`, Required)
- `status` (String `"Ongoing"/"Completed"`, Required)
- `academicYear` (String, Required)

#### 3.8 Faculty Research Projects (`/faculty-research-projects`)
- `projectTitle` (String, Required)
- `leadResearcher` (String, Required)
- `researchArea` (String, Required)
- `fundingType` (String `"Seed Money"/"Institutional"/"Internal"`, Required)
- `sanctionedAmount` (Number, Required)
- `startDate` (Date `YYYY-MM-DD`, Required)
- `status` (String `"Proposed"/"Ongoing"/"Completed"`, Required)
- `academicYear` (String, Required)

#### 3.9 Student Journal Publications (`/student-journal-publications`)
- `paperTitle` (String, Required)
- `studentName` (String, Required)
- `rollNumber` (String, Required)
- `mentorName` (String, Required)
- `journalName` (String, Required)
- `publisher` (String, Optional)
- `issn` (String, Optional)
- `doi` (String, Optional)
- `publicationDate` (Date `YYYY-MM-DD`, Required)
- `academicYear` (String, Required)

#### 3.10 Student Conference Publications (`/student-conference-publications`)
- `paperTitle` (String, Required)
- `studentName` (String, Required)
- `rollNumber` (String, Required)
- `conferenceName` (String, Required)
- `organizer` (String, Optional)
- `conferenceType` (String `"National"/"International"`, Required)
- `startDate` (Date `YYYY-MM-DD`, Required)
- `academicYear` (String, Required)

#### 3.11 Student Patents (`/student-patents`)
- `patentTitle` (String, Required)
- `studentName` (String, Required)
- `rollNumber` (String, Required)
- `facultyGuide` (String, Required)
- `applicationNumber` (String, Required)
- `filingDate` (Date `YYYY-MM-DD`, Required)
- `status` (String `"Filed"/"Published"/"Granted"`, Required)
- `academicYear` (String, Required)

#### 3.12 Student Books (`/student-books`)
- `bookTitle` (String, Required)
- `studentName` (String, Required)
- `rollNumber` (String, Required)
- `publisher` (String, Required)
- `isbn` (String, Required)
- `publicationDate` (Date `YYYY-MM-DD`, Required)
- `academicYear` (String, Required)

#### 3.13 Student Book Chapters (`/student-book-chapters`)
- `chapterTitle` (String, Required)
- `bookTitle` (String, Required)
- `studentName` (String, Required)
- `rollNumber` (String, Required)
- `publisher` (String, Required)
- `isbn` (String, Required)
- `publicationDate` (Date `YYYY-MM-DD`, Required)
- `academicYear` (String, Required)

#### 3.14 Student Research Projects (`/student-research-projects`)
- `projectTitle` (String, Required)
- `studentName` (String, Required)
- `rollNumber` (String, Required)
- `guideName` (String, Required)
- `projectDomain` (String, Required)
- `startDate` (Date `YYYY-MM-DD`, Required)
- `status` (String `"Ongoing"/"Completed"`, Required)
- `academicYear` (String, Required)

#### 3.15 Department Project Development (`/department-project-development`)
- `projectTitle` (String, Required)
- `projectLead` (String, Required)
- `teamMembers` (String, Optional)
- `category` (String `"Hardware"/"Software"/"IoT"/"AI-ML"/"Other"`, Required)
- `fundingSource` (String, Optional)
- `budget` (Number, Optional)
- `startDate` (Date `YYYY-MM-DD`, Required)
- `status` (String `"Ideation"/"In-Development"/"Prototype"/"Completed"`, Required)
- `academicYear` (String, Required)

---

## 4. Evidence Repository APIs

### 4.1 Upload Evidence Document
`POST /api/v1/department-coordinator/research/evidence/upload`
- **Query Parameters:** `departmentId` (Long, Required), `uploadedBy` (String, Required)
- **Multipart Form-Data:**
  - `file` (MultipartFile, Required)
  - `academicYear` (String, Required)
  - `sectionName` (String, Required, e.g. `"faculty-journal-publications"`)
  - `recordId` (Long/String, Required)
  - `documentType` (String, Required)

### 4.2 Get Evidence Documents
`GET /api/v1/department-coordinator/research/evidence`
- **Query Parameters:** `departmentId` (Long, Required), `academicYear` (String, Required), `sectionName` (String, Optional), `recordId` (Long/String, Optional), `page` (Integer), `size` (Integer)

### 4.3 Delete Evidence Document
`DELETE /api/v1/department-coordinator/research/evidence/{id}`
- **Query Parameters:** `departmentId` (Long, Required)

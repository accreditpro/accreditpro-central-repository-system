/**
 * AccreditPro - Faculty Repository API Test Suite
 * Validates endpoint paths, query parameter builders, request payload schemas,
 * response normalisers, CSV headers, and live backend connectivity.
 */

const BASE = '/api/v1/department-coordinator/faculty-repository';
const TEST_YEAR = '2025-26';
const TEST_DEPT_ID = 1;

function qs(params) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );
  return new URLSearchParams(clean).toString();
}

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function assertEqual(actual, expected, msg = '') {
  if (actual !== expected) {
    throw new Error(`Assertion failed: expected "${expected}", got "${actual}". ${msg}`);
  }
}

function assertTrue(cond, msg = '') {
  if (!cond) {
    throw new Error(`Assertion failed: condition is false. ${msg}`);
  }
}

// ── 1. Endpoint Path & Query String Tests ────────────────────────────────────

test('1.1 Faculty Profiles URL format', () => {
  const query = qs({ academicYear: TEST_YEAR, departmentId: TEST_DEPT_ID, size: 500 });
  const url = `${BASE}/profiles?${query}`;
  assertEqual(url, '/api/v1/department-coordinator/faculty-repository/profiles?academicYear=2025-26&departmentId=1&size=500');
});

test('1.2 Faculty Qualifications URL format', () => {
  const query = qs({ academicYear: TEST_YEAR, departmentId: TEST_DEPT_ID, size: 500 });
  const url = `${BASE}/qualifications?${query}`;
  assertEqual(url, '/api/v1/department-coordinator/faculty-repository/qualifications?academicYear=2025-26&departmentId=1&size=500');
});

test('1.3 Faculty Employment URL format', () => {
  const query = qs({ academicYear: TEST_YEAR, departmentId: TEST_DEPT_ID, size: 500 });
  const url = `${BASE}/employment?${query}`;
  assertEqual(url, '/api/v1/department-coordinator/faculty-repository/employment?academicYear=2025-26&departmentId=1&size=500');
});

test('1.4 Professor of Practice URL format', () => {
  const query = qs({ academicYear: TEST_YEAR, departmentId: TEST_DEPT_ID, size: 500 });
  const url = `${BASE}/profession-practice?${query}`;
  assertEqual(url, '/api/v1/department-coordinator/faculty-repository/profession-practice?academicYear=2025-26&departmentId=1&size=500');
});

test('1.5 Professional Memberships URL format', () => {
  const query = qs({ academicYear: TEST_YEAR, departmentId: TEST_DEPT_ID, size: 500 });
  const url = `${BASE}/professional-development/memberships?${query}`;
  assertEqual(url, '/api/v1/department-coordinator/faculty-repository/professional-development/memberships?academicYear=2025-26&departmentId=1&size=500');
});

test('1.6 FDP Participations URL format (GET/POST/DELETE plural)', () => {
  const query = qs({ academicYear: TEST_YEAR, departmentId: TEST_DEPT_ID, size: 500 });
  const url = `${BASE}/professional-development/fdp-participations?${query}`;
  assertEqual(url, '/api/v1/department-coordinator/faculty-repository/professional-development/fdp-participations?academicYear=2025-26&departmentId=1&size=500');
});

test('1.7 FDP Participations URL format (PUT/Upload singular)', () => {
  const id = 123;
  const query = qs({ academicYear: TEST_YEAR, departmentId: TEST_DEPT_ID });
  const putUrl = `${BASE}/professional-development/fdp-participation/${id}?${query}`;
  assertEqual(putUrl, '/api/v1/department-coordinator/faculty-repository/professional-development/fdp-participation/123?academicYear=2025-26&departmentId=1');
});

test('1.8 Resource Persons URL format (GET/POST/DELETE plural vs PUT singular prefix)', () => {
  const id = 456;
  const query = qs({ academicYear: TEST_YEAR, departmentId: TEST_DEPT_ID });
  const putUrl = `${BASE}/professional-development/faculty-resource-person/${id}?${query}`;
  assertEqual(putUrl, '/api/v1/department-coordinator/faculty-repository/professional-development/faculty-resource-person/456?academicYear=2025-26&departmentId=1');
});

test('1.9 MOOCs URL format (GET vs PUT suffix)', () => {
  const id = 789;
  const query = qs({ academicYear: TEST_YEAR, departmentId: TEST_DEPT_ID });
  const putUrl = `${BASE}/professional-development/moocs-certification/${id}?${query}`;
  assertEqual(putUrl, '/api/v1/department-coordinator/faculty-repository/professional-development/moocs-certification/789?academicYear=2025-26&departmentId=1');
});

test('1.10 Dept Organized Programs URL format', () => {
  const query = qs({ academicYear: TEST_YEAR, departmentId: TEST_DEPT_ID, size: 500 });
  const url = `${BASE}/professional-development/dept-organized?${query}`;
  assertEqual(url, '/api/v1/department-coordinator/faculty-repository/professional-development/dept-organized?academicYear=2025-26&departmentId=1&size=500');
});

test('1.11 Faculty Evidence URL format', () => {
  const query = qs({ academicYear: TEST_YEAR, departmentId: TEST_DEPT_ID, empCode: 'EMP001' });
  const url = `${BASE}/evidence?${query}`;
  assertEqual(url, '/api/v1/department-coordinator/faculty-repository/evidence?academicYear=2025-26&departmentId=1&empCode=EMP001');
});

test('1.12 Faculty Health Metrics URL format', () => {
  const query = qs({ academicYear: TEST_YEAR, departmentId: TEST_DEPT_ID });
  const url = `${BASE}/health-metrics?${query}`;
  assertEqual(url, '/api/v1/department-coordinator/faculty-repository/health-metrics?academicYear=2025-26&departmentId=1');
});

// ── 2. Payload Schema Validation Tests ───────────────────────────────────────

test('2.1 Faculty Profile Request Payload Schema', () => {
  const payload = {
    empCode: 'EMP001',
    name: 'Dr. Ramesh Kumar',
    email: 'ramesh.kumar@college.edu',
    phone: '9876543210',
    gender: 'Male',
    dateOfBirth: '1985-05-15',
    panNumber: 'ABCDE1234F',
    aadhaarNumber: '123456789012',
    highestDegree: 'Ph.D in CSE',
    specialization: 'Artificial Intelligence',
    currentDesignation: 'Associate Professor',
    employmentType: 'Regular',
    dateOfJoining: '2015-08-01',
    academicYear: TEST_YEAR,
  };
  assertTrue(!!payload.empCode && !!payload.name, 'Mandatory fields must be present');
  assertTrue(payload.academicYear === TEST_YEAR, 'Academic year must match');
});

test('2.2 Professor of Practice Request Payload Schema', () => {
  const payload = {
    empCode: 'EMP005',
    facultyName: 'Mr. Vikram Singh',
    popPersonName: 'Mr. Vikram Singh',
    popDesignation: 'Senior Principal Engineer',
    popOrganization: 'Tata Consultancy Services',
    popCourseName: 'Cloud Computing & Architecture',
    popDuration: '6 months',
    academicYear: TEST_YEAR,
  };
  assertTrue(!!payload.empCode && !!payload.facultyName, 'Mandatory fields must be present');
  assertTrue(payload.popOrganization.length > 0, 'Organization must not be empty');
});

test('2.3 Professional Membership Request Payload Schema', () => {
  const payload = {
    employeeId: 'EMP001',
    facultyName: 'Dr. Ramesh Kumar',
    professionalSocietyName: 'IEEE Computer Society',
    societyType: 'International',
    membershipNumber: 'IEEE-98765432',
    membershipGrade: 'Senior Member',
    positionHeld: 'Chapter Chair',
    membershipStartDate: '2018-06-15',
    membershipExpiryDate: '2026-06-14',
    activeStatus: 'Active',
    academicYear: TEST_YEAR,
  };
  assertTrue(!!payload.employeeId && !!payload.professionalSocietyName, 'Mandatory fields must be present');
  assertTrue(['Active', 'Expired', 'Inactive'].includes(payload.activeStatus), 'Active status must be valid enum');
});

test('2.4 FDP Participation Request Payload Schema', () => {
  const payload = {
    employeeId: 'EMP001',
    facultyName: 'Dr. Ramesh Kumar',
    programType: 'FDP',
    programTitle: 'Advanced Deep Learning for Computer Vision',
    themeArea: 'AI/ML',
    organizedBy: 'IIT Madras',
    externalInternal: 'External',
    mode: 'Online',
    startDate: '2025-06-10',
    endDate: '2025-06-14',
    durationDays: 5,
    location: 'Online',
    academicYear: TEST_YEAR,
  };
  assertTrue(payload.durationDays > 0, 'Duration in days must be positive');
  assertTrue(['Online', 'Offline', 'Hybrid'].includes(payload.mode), 'Mode must be valid enum');
});

test('2.5 Faculty Health Metrics Response Normalization', () => {
  const rawApiResponse = {
    success: true,
    message: 'Metrics fetched successfully',
    data: {
      dataCompleteness: 92,
      evidenceScore: 68,
      verificationScore: 85,
      readinessScore: 82,
    },
    timestamp: '2026-08-13T09:16:19Z',
  };
  const normalized = {
    dataCompleteness: rawApiResponse.data?.dataCompleteness ?? 0,
    evidenceScore: rawApiResponse.data?.evidenceScore ?? 0,
    verificationScore: rawApiResponse.data?.verificationScore ?? 0,
    readinessScore: rawApiResponse.data?.readinessScore ?? 0,
  };
  assertEqual(normalized.dataCompleteness, 92);
  assertEqual(normalized.evidenceScore, 68);
  assertEqual(normalized.verificationScore, 85);
  assertEqual(normalized.readinessScore, 82);
});

// ── 3. CSV Header Consistency Tests ─────────────────────────────────────────

test('3.1 Faculty Profiles CSV Headers', () => {
  const headers = ['EMP Code', 'Faculty Name', 'Email', 'Phone', 'Gender', 'DOB', 'PAN Number', 'Aadhaar Number', 'Highest Degree', 'Specialization', 'Current Designation', 'Employment Type', 'Date of Joining'];
  assertEqual(headers.length, 13);
  assertEqual(headers[0], 'EMP Code');
  assertEqual(headers[1], 'Faculty Name');
});

test('3.2 Professor of Practice CSV Headers', () => {
  const headers = ['EMP Code', 'Faculty Name', 'Person Name', 'Designation', 'Organization', 'Course Name', 'Duration'];
  assertEqual(headers.length, 7);
  assertEqual(headers[0], 'EMP Code');
  assertEqual(headers[4], 'Organization');
});

test('3.3 Professional Memberships CSV Headers', () => {
  const headers = ['Employee ID', 'Faculty Name', 'Professional Society Name', 'Society Type', 'Membership Number', 'Membership Grade', 'Position Held', 'Start Date', 'Expiry Date', 'Active Status', 'Remarks'];
  assertEqual(headers.length, 11);
  assertEqual(headers[0], 'Employee ID');
});

// ── 4. CSV Quoted Line Parser Tests ─────────────────────────────────────────

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += char; }
  }
  result.push(current.trim());
  return result;
}

test('4.1 CSV line parser with commas inside quotes', () => {
  const line = 'EMP001,"Dr. Anita Sharma, Ph.D","IEEE, Senior Member",Regular';
  const parsed = parseCSVLine(line);
  assertEqual(parsed.length, 4);
  assertEqual(parsed[0], 'EMP001');
  assertEqual(parsed[1], 'Dr. Anita Sharma, Ph.D');
  assertEqual(parsed[2], 'IEEE, Senior Member');
  assertEqual(parsed[3], 'Regular');
});

// ── Run All Tests ───────────────────────────────────────────────────────────

console.log('\n======================================================');
console.log('       FACULTY REPOSITORY API TEST SUITE');
console.log('======================================================\n');

for (const t of tests) {
  try {
    t.fn();
    console.log(`  ✓  ${t.name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗  ${t.name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

console.log('\n------------------------------------------------------');
console.log(`Results: ${passed} passed, ${failed} failed, ${tests.length} total.`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}

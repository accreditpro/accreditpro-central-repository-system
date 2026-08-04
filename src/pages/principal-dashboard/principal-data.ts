// Principal Module — Consolidated institutional data layer.
// The Principal consumes (never edits) data from every department repository
// and presents it as executive dashboards. All matrices below are derived
// deterministically from the base department scores so every view stays
// internally consistent.

export { kpiData, institutionStats, naacCriteria, nirfParameters } from './principal-configs';

export type StatusLevel = 'ready' | 'attention' | 'critical';

export const departmentOptions = [{ value: 'all', label: 'All Departments' }]
  .concat(['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIML', 'DS'].map((c) => ({ value: c, label: c })));

export const academicYearOptions = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'].map((y) => ({
  value: y,
  label: y,
}));

export const programOptions = [
  { value: 'all', label: 'All Programs' },
  { value: 'btech', label: 'B.Tech' },
  { value: 'mtech', label: 'M.Tech' },
  { value: 'mba', label: 'MBA' },
  { value: 'mca', label: 'MCA' },
];

// Deterministic pseudo-random helper so generated values are stable per render.
function seeded(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));

// ---------------------------------------------------------------------------
// Department × Repository matrix — every department, every repository with
// completion / approved / pending / missing breakdowns.
// ---------------------------------------------------------------------------

export const REPO_LIST = [
  'Academic',
  'Faculty',
  'Student',
  'Research',
  'Infrastructure',
  'Examination',
  'Alumni',
  'Placement',
];

export interface DeptRepoRow {
  repo: string;
  completion: number;
  approved: number;
  pending: number;
  missing: number;
}

export interface DepartmentRepositoryData {
  code: string;
  name: string;
  readiness: number;
  repositories: DeptRepoRow[];
}

export const departmentRepositories: DepartmentRepositoryData[] = [
  { code: 'CSE', name: 'Computer Science & Engineering', readiness: 92 },
  { code: 'ECE', name: 'Electronics & Communication', readiness: 80 },
  { code: 'EEE', name: 'Electrical & Electronics', readiness: 63 },
  { code: 'MECH', name: 'Mechanical Engineering', readiness: 85 },
  { code: 'CIVIL', name: 'Civil Engineering', readiness: 68 },
  { code: 'IT', name: 'Information Technology', readiness: 88 },
  { code: 'AIML', name: 'Artificial Intelligence & ML', readiness: 75 },
  { code: 'DS', name: 'Data Science', readiness: 71 },
].map((dept, di) => ({
  ...dept,
  repositories: REPO_LIST.map((repo, ri) => {
    const variance = Math.round((seeded(di * 8 + ri) - 0.5) * 20);
    const completion = clamp(dept.readiness + variance, 35, 99);
    const approved = clamp(Math.round(completion * (0.62 + seeded(di * 31 + ri) * 0.2)));
    const pending = clamp(completion - approved);
    const missing = 100 - completion;
    return { repo, completion, approved, pending, missing };
  }),
}));

// ---------------------------------------------------------------------------
// Accreditation readiness — department-wise × criterion-wise for NBA / NAAC /
// NIRF, with a weighted overall per department.
// ---------------------------------------------------------------------------

export interface DeptCriterionScore {
  dept: string;
  scores: number[];
  overall: number;
}

export const NBA_CRITERIA = [
  'Vision, Mission & PEOs',
  'Program Curriculum',
  'Course Outcomes & POs',
  'Students Performance',
  'Faculty Contributions',
  'Facilities & Technical Support',
  'Academic Support & Governance',
];
export const NAAC_CRITERIA = [
  'Curricular Aspects',
  'Teaching-Learning & Evaluation',
  'Research, Innovations & Extension',
  'Infrastructure & Learning Resources',
  'Student Support & Progression',
  'Governance, Leadership & Management',
  'Institutional Values & Best Practices',
];
export const NIRF_PARAMETERS = [
  'Teaching, Learning and Resources (TLR)',
  'Research and Professional Practice (RP)',
  'Graduation Outcomes (GO)',
  'Outreach and Inclusivity (OI)',
  'Perception (PR)',
];

// Short labels used for NIRF matrix column headers (instead of C1..C5).
export const NIRF_SHORT = ['TLR', 'RP', 'GO', 'OI', 'PR'];

const deptCodes = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIML', 'DS'];

function buildDeptMatrix(
  count: number,
  key: (dept: string, idx: number) => number,
  weight: number[]
): DeptCriterionScore[] {
  return deptCodes.map((dept, di) => {
    const scores = Array.from({ length: count }, (_, ci) =>
      clamp(key(dept, ci) + Math.round((seeded(di * count + ci) - 0.5) * 12), 40, 99)
    );
    const totalW = weight.reduce((a, b) => a + b, 0);
    const overall = clamp(scores.reduce((a, s, i) => a + s * weight[i], 0) / totalW);
    return { dept, scores, overall };
  });
}

const baseDeptReadiness: Record<string, number> = {
  CSE: 92, ECE: 80, EEE: 63, MECH: 85, CIVIL: 68, IT: 88, AIML: 75, DS: 71,
};

export const nbaDeptScores: DeptCriterionScore[] = buildDeptMatrix(
  NBA_CRITERIA.length,
  (d) => baseDeptReadiness[d],
  [60, 80, 120, 120, 100, 80, 40]
);
export const naacDeptScores: DeptCriterionScore[] = buildDeptMatrix(
  NAAC_CRITERIA.length,
  (d) => baseDeptReadiness[d],
  [150, 200, 250, 100, 100, 100, 100]
);
export const nirfDeptScores: DeptCriterionScore[] = buildDeptMatrix(
  NIRF_PARAMETERS.length,
  (d) => baseDeptReadiness[d],
  [30, 30, 20, 10, 10]
);

// ---------------------------------------------------------------------------
// Gap analysis — current vs target, with full remediation detail per gap.
// ---------------------------------------------------------------------------

export interface PrincipalGap {
  id: string;
  department: string;
  repository: string;
  framework: 'NAAC' | 'NBA' | 'NIRF' | 'All';
  description: string;
  current: number;
  target: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  missingData: string[];
  missingEvidence: string[];
  pendingApproval: string;
  iqacObservation: string;
  recommendedActions: string[];
}

export const principalGaps: PrincipalGap[] = [
  {
    id: 'g1', department: 'EEE', repository: 'Research', framework: 'NAAC',
    description: 'Research Repository readiness at 62% — below the 85% institutional target.',
    current: 62, target: 85, priority: 'critical',
    missingData: ['Faculty publication list 2023-24', 'Citation data (Scopus/WoS)', 'Research funding register'],
    missingEvidence: ['Journal cover pages', 'DOI proofs', 'Grant sanction letters'],
    pendingApproval: '2 project funding approvals pending with HOD',
    iqacObservation: 'Research output metrics understated by ~30% due to missing citations.',
    recommendedActions: ['Compile publication list from Scopus author profile', 'Upload DOI proofs for 18 papers', 'Escalate funding approvals to HOD'],
  },
  {
    id: 'g2', department: 'CIVIL', repository: 'Research', framework: 'NBA',
    description: 'Civil Engineering requires 12 additional Scopus-indexed publications to achieve target readiness.',
    current: 68, target: 85, priority: 'high',
    missingData: ['Scopus author IDs', 'Year-wise publication register'],
    missingEvidence: ['Indexing proofs', 'Acceptance letters'],
    pendingApproval: 'Research Committee quarterly report pending IQAC sign-off',
    iqacObservation: 'Publication output is 1.8/faculty vs 3.0 benchmark.',
    recommendedActions: ['Identify faculty with near-complete manuscripts', 'Fund open-access APC for 6 papers', 'Track Scopus uploads monthly'],
  },
  {
    id: 'g3', department: 'MECH', repository: 'Faculty', framework: 'All',
    description: 'Mechanical Department has low FDP participation (41%) compared to institutional average (58%).',
    current: 41, target: 80, priority: 'high',
    missingData: ['FDP attendance register 2025', 'Training calendars'],
    missingEvidence: ['FDP certificates for 14 faculty', 'Event reports'],
    pendingApproval: '3 FDP nominations pending Dean approval',
    iqacObservation: 'FDP participation gap affects NAAC Criterion 3.5 and NBA Criterion 5.',
    recommendedActions: ['Schedule 4 FDP programs in emerging technologies', 'Mandate 1 FDP per faculty per year', 'Track completion in faculty repository'],
  },
  {
    id: 'g4', department: 'CSE', repository: 'Infrastructure', framework: 'NAAC',
    description: 'Software licenses for CAD Lab will expire within 60 days.',
    current: 55, target: 100, priority: 'high',
    missingData: ['License renewal quotes', 'Asset register update'],
    missingEvidence: ['Expired license proofs', 'Vendor quotes'],
    pendingApproval: 'Renewal PO awaiting Finance approval',
    iqacObservation: 'Expired licenses invalidate NAAC Criterion 4.2 ICT claims.',
    recommendedActions: ['Raise renewal request this week', 'Add reminders for all 2026 expiries', 'Backup license server logs'],
  },
  {
    id: 'g5', department: 'DS', repository: 'Student', framework: 'All',
    description: 'Internship completion percentage (58%) is below the institutional target (80%).',
    current: 58, target: 80, priority: 'medium',
    missingData: ['Internship offer letters register', 'Student placement coordinator logs'],
    missingEvidence: ['Internship completion certificates for 90 students', 'Company verification letters'],
    pendingApproval: 'TPO internship list pending review',
    iqacObservation: 'Experiential learning metrics understate progression outcomes.',
    recommendedActions: ['Coordinate with TPO for certificate collection', 'Add internship tracking to student repository', 'Follow up with 12 pending companies'],
  },
  {
    id: 'g6', department: 'CIVIL', repository: 'Placement', framework: 'NIRF',
    description: 'Placement rate at 54% — the lowest among departments, dragging NIRF GO score.',
    current: 54, target: 75, priority: 'critical',
    missingData: ['Selection lists 2024-25', 'Offer letter summaries'],
    missingEvidence: ['Appointment letters', 'Recruiter feedback forms'],
    pendingApproval: 'Placement report pending TPO sign-off',
    iqacObservation: 'Low placement rate impacts NIRF Graduation Outcomes (20% weight).',
    recommendedActions: ['Run 4 additional campus drives', 'Skill-gap bootcamps for final year', 'Engage alumni network for referrals'],
  },
  {
    id: 'g7', department: 'IT', repository: 'Academic', framework: 'NAAC',
    description: 'Academic Calendar Report for 2025-26 not uploaded by coordinator.',
    current: 70, target: 100, priority: 'low',
    missingData: ['Approved academic calendar', 'Semester-wise planner'],
    missingEvidence: ['Calendar approval letter', 'BoS minutes'],
    pendingApproval: 'Calendar awaiting HOD approval',
    iqacObservation: 'Calendar evidence feeds NAAC Criterion 1.2 documentation.',
    recommendedActions: ['Upload approved calendar', 'Attach BoS minutes', 'Notify coordinator'],
  },
];

// ---------------------------------------------------------------------------
// Performance pages — department-wise metrics.
// ---------------------------------------------------------------------------

export interface DeptAcademic {
  dept: string; passPercentage: number; backlogPercentage: number;
  semesterResults: number; courseCompletion: number; calendarCompletion: number;
}
export const deptAcademic: DeptAcademic[] = [
  { dept: 'CSE', passPercentage: 94, backlogPercentage: 3, semesterResults: 96, courseCompletion: 92, calendarCompletion: 95 },
  { dept: 'ECE', passPercentage: 89, backlogPercentage: 8, semesterResults: 90, courseCompletion: 85, calendarCompletion: 88 },
  { dept: 'EEE', passPercentage: 82, backlogPercentage: 15, semesterResults: 84, courseCompletion: 78, calendarCompletion: 80 },
  { dept: 'MECH', passPercentage: 87, backlogPercentage: 10, semesterResults: 88, courseCompletion: 86, calendarCompletion: 85 },
  { dept: 'CIVIL', passPercentage: 84, backlogPercentage: 12, semesterResults: 86, courseCompletion: 80, calendarCompletion: 82 },
  { dept: 'IT', passPercentage: 92, backlogPercentage: 5, semesterResults: 93, courseCompletion: 90, calendarCompletion: 92 },
  { dept: 'AIML', passPercentage: 88, backlogPercentage: 9, semesterResults: 89, courseCompletion: 87, calendarCompletion: 86 },
  { dept: 'DS', passPercentage: 81, backlogPercentage: 18, semesterResults: 83, courseCompletion: 79, calendarCompletion: 81 },
];

export interface DeptFaculty {
  dept: string; strength: number; phdPercentage: number; fdpParticipation: number;
  publications: number; patents: number; sponsoredProjects: number; consultancy: number; researchFunding: number;
}
export const deptFaculty: DeptFaculty[] = [
  { dept: 'CSE', strength: 52, phdPercentage: 73, fdpParticipation: 68, publications: 98, patents: 5, sponsoredProjects: 9, consultancy: 42, researchFunding: 85 },
  { dept: 'ECE', strength: 45, phdPercentage: 62, fdpParticipation: 61, publications: 72, patents: 4, sponsoredProjects: 7, consultancy: 35, researchFunding: 70 },
  { dept: 'EEE', strength: 38, phdPercentage: 53, fdpParticipation: 44, publications: 45, patents: 1, sponsoredProjects: 4, consultancy: 18, researchFunding: 45 },
  { dept: 'MECH', strength: 42, phdPercentage: 60, fdpParticipation: 41, publications: 58, patents: 3, sponsoredProjects: 6, consultancy: 28, researchFunding: 60 },
  { dept: 'CIVIL', strength: 35, phdPercentage: 51, fdpParticipation: 46, publications: 38, patents: 1, sponsoredProjects: 3, consultancy: 22, researchFunding: 38 },
  { dept: 'IT', strength: 40, phdPercentage: 65, fdpParticipation: 66, publications: 65, patents: 2, sponsoredProjects: 5, consultancy: 30, researchFunding: 62 },
  { dept: 'AIML', strength: 32, phdPercentage: 56, fdpParticipation: 58, publications: 48, patents: 1, sponsoredProjects: 4, consultancy: 20, researchFunding: 48 },
  { dept: 'DS', strength: 28, phdPercentage: 46, fdpParticipation: 52, publications: 32, patents: 1, sponsoredProjects: 3, consultancy: 15, researchFunding: 40 },
];

export interface DeptStudent {
  dept: string; strength: number; passPercentage: number; placements: number; higherStudies: number;
  internships: number; projects: number; publications: number; awards: number; certifications: number;
}
export const deptStudent: DeptStudent[] = [
  { dept: 'CSE', strength: 780, passPercentage: 94, placements: 95, higherStudies: 14, internships: 120, projects: 45, publications: 12, awards: 28, certifications: 320 },
  { dept: 'ECE', strength: 720, passPercentage: 89, placements: 84, higherStudies: 12, internships: 85, projects: 38, publications: 8, awards: 18, certifications: 240 },
  { dept: 'EEE', strength: 640, passPercentage: 82, placements: 72, higherStudies: 8, internships: 60, projects: 25, publications: 4, awards: 10, certifications: 150 },
  { dept: 'MECH', strength: 700, passPercentage: 87, placements: 78, higherStudies: 9, internships: 70, projects: 30, publications: 5, awards: 14, certifications: 170 },
  { dept: 'CIVIL', strength: 590, passPercentage: 84, placements: 54, higherStudies: 10, internships: 40, projects: 22, publications: 3, awards: 8, certifications: 120 },
  { dept: 'IT', strength: 650, passPercentage: 92, placements: 92, higherStudies: 13, internships: 110, projects: 42, publications: 10, awards: 22, certifications: 280 },
  { dept: 'AIML', strength: 520, passPercentage: 88, placements: 88, higherStudies: 15, internships: 95, projects: 35, publications: 9, awards: 16, certifications: 210 },
  { dept: 'DS', strength: 460, passPercentage: 81, placements: 82, higherStudies: 12, internships: 80, projects: 28, publications: 6, awards: 9, certifications: 180 },
];

export interface DeptResearch {
  dept: string; publications: number; patents: number; books: number; sponsoredProjects: number;
  consultancy: number; projectDevelopment: number; researchFunding: number;
}
export const deptResearch: DeptResearch[] = [
  { dept: 'CSE', publications: 98, patents: 5, books: 3, sponsoredProjects: 9, consultancy: 42, projectDevelopment: 12, researchFunding: 85 },
  { dept: 'ECE', publications: 72, patents: 4, books: 2, sponsoredProjects: 7, consultancy: 35, projectDevelopment: 9, researchFunding: 70 },
  { dept: 'EEE', publications: 45, patents: 1, books: 1, sponsoredProjects: 4, consultancy: 18, projectDevelopment: 5, researchFunding: 45 },
  { dept: 'MECH', publications: 58, patents: 3, books: 2, sponsoredProjects: 6, consultancy: 28, projectDevelopment: 8, researchFunding: 60 },
  { dept: 'CIVIL', publications: 38, patents: 1, books: 1, sponsoredProjects: 3, consultancy: 22, projectDevelopment: 4, researchFunding: 38 },
  { dept: 'IT', publications: 65, patents: 2, books: 2, sponsoredProjects: 5, consultancy: 30, projectDevelopment: 7, researchFunding: 62 },
  { dept: 'AIML', publications: 48, patents: 1, books: 1, sponsoredProjects: 4, consultancy: 20, projectDevelopment: 6, researchFunding: 48 },
  { dept: 'DS', publications: 32, patents: 1, books: 0, sponsoredProjects: 3, consultancy: 15, projectDevelopment: 4, researchFunding: 40 },
];

export const researchTotals = {
  publications: deptResearch.reduce((a, d) => a + d.publications, 0),
  patents: deptResearch.reduce((a, d) => a + d.patents, 0),
  books: deptResearch.reduce((a, d) => a + d.books, 0),
  sponsoredProjects: deptResearch.reduce((a, d) => a + d.sponsoredProjects, 0),
  consultancy: deptResearch.reduce((a, d) => a + d.consultancy, 0),
  projectDevelopment: deptResearch.reduce((a, d) => a + d.projectDevelopment, 0),
  researchFunding: deptResearch.reduce((a, d) => a + d.researchFunding, 0),
};

// ---------------------------------------------------------------------------
// Infrastructure readiness — department-wise with compliance alerts.
// ---------------------------------------------------------------------------

export interface DeptInfra {
  dept: string; laboratories: number; equipment: number; softwareLicenses: number;
  ictFacilities: number; smartClassrooms: number; evidenceCompletion: number; alerts: string[];
}
export const deptInfra: DeptInfra[] = [
  { dept: 'CSE', laboratories: 92, equipment: 88, softwareLicenses: 84, ictFacilities: 95, smartClassrooms: 90, evidenceCompletion: 86, alerts: ['Software licenses for CAD Lab expire in 60 days'] },
  { dept: 'ECE', laboratories: 86, equipment: 82, softwareLicenses: 78, ictFacilities: 90, smartClassrooms: 84, evidenceCompletion: 80, alerts: ['Equipment invoices missing for 2 labs'] },
  { dept: 'EEE', laboratories: 74, equipment: 70, softwareLicenses: 66, ictFacilities: 78, smartClassrooms: 68, evidenceCompletion: 72, alerts: ['Expired license proofs for 5 packages', 'Missing invoices for 3 laboratories'] },
  { dept: 'MECH', laboratories: 84, equipment: 80, softwareLicenses: 74, ictFacilities: 82, smartClassrooms: 76, evidenceCompletion: 78, alerts: ['Geo-tagged photos missing for machine shop'] },
  { dept: 'CIVIL', laboratories: 76, equipment: 72, softwareLicenses: 68, ictFacilities: 74, smartClassrooms: 64, evidenceCompletion: 70, alerts: ['Missing geo-tagged photos for 3 labs', 'Equipment invoices missing'] },
  { dept: 'IT', laboratories: 90, equipment: 86, softwareLicenses: 82, ictFacilities: 93, smartClassrooms: 88, evidenceCompletion: 84, alerts: [] },
  { dept: 'AIML', laboratories: 82, equipment: 78, softwareLicenses: 72, ictFacilities: 86, smartClassrooms: 80, evidenceCompletion: 76, alerts: ['GPU cluster invoice pending upload'] },
  { dept: 'DS', laboratories: 78, equipment: 74, softwareLicenses: 70, ictFacilities: 80, smartClassrooms: 72, evidenceCompletion: 74, alerts: ['License renewal for analytics suite overdue'] },
];

export const infraAlerts = deptInfra.flatMap((d) => d.alerts.map((a) => ({ dept: d.dept, alert: a })));

// ---------------------------------------------------------------------------
// Examination overview — read-only schedules, results, supplementary & backlogs.
// ---------------------------------------------------------------------------

export const examSchedules = [
  { id: 'e1', exam: 'Mid-Semester — Odd Sem 2025-26', start: '2025-08-18', end: '2025-08-23', departments: 8, status: 'Published' },
  { id: 'e2', exam: 'End-Semester — Odd Sem 2025-26', start: '2025-11-24', end: '2025-12-06', departments: 8, status: 'Scheduled' },
  { id: 'e3', exam: 'Mid-Semester — Even Sem 2025-26', start: '2026-02-09', end: '2026-02-14', departments: 8, status: 'Planned' },
  { id: 'e4', exam: 'End-Semester — Even Sem 2025-26', start: '2026-05-18', end: '2026-05-30', departments: 8, status: 'Planned' },
];

export const publishedResults = [
  { id: 'r1', exam: 'End-Semester — Even Sem 2024-25', published: '2025-06-28', departments: 8, passPercentage: 87 },
  { id: 'r2', exam: 'Supplementary — June 2025', published: '2025-07-15', departments: 6, passPercentage: 62 },
  { id: 'r3', exam: 'Mid-Semester — Odd Sem 2025-26', published: '2025-09-05', departments: 8, passPercentage: 84 },
];

export const supplementaryExams = [
  { id: 's1', exam: 'Supplementary — June 2025', date: '2025-07-01', candidates: 320, passPercentage: 62 },
  { id: 's2', exam: 'Supplementary — December 2025', date: '2025-12-20', candidates: 410, passPercentage: 58 },
  { id: 's3', exam: 'Supplementary — February 2026', date: '2026-02-25', candidates: 380, passPercentage: 65 },
];

export const backlogStats = deptAcademic.map((d) => ({ dept: d.dept, backlogs: d.backlogPercentage, pass: d.passPercentage }));

// ---------------------------------------------------------------------------
// Institution analytics — trend series for graphical dashboards.
// ---------------------------------------------------------------------------

export const analyticsTrends = {
  years: ['2020-21', '2021-22', '2022-23', '2023-24', '2024-25'],
  repositoryCompletion: [72, 76, 80, 82, 84],
  accreditationReadiness: [68, 72, 76, 79, 82],
  evidenceCompletion: [65, 70, 73, 75, 76],
  faculty: [245, 260, 278, 295, 312],
  students: [3200, 3600, 4100, 4500, 4850],
  publications: [180, 220, 310, 380, 456],
  placements: [72, 74, 78, 80, 82],
  passPercentage: [82, 84, 85, 87, 89],
  infrastructure: [58, 64, 70, 75, 79],
};

export const analyticsSeries = analyticsTrends.years.map((year, i) => ({
  year,
  repositoryCompletion: analyticsTrends.repositoryCompletion[i],
  accreditationReadiness: analyticsTrends.accreditationReadiness[i],
  evidenceCompletion: analyticsTrends.evidenceCompletion[i],
  faculty: analyticsTrends.faculty[i],
  students: analyticsTrends.students[i],
  publications: analyticsTrends.publications[i],
  placements: analyticsTrends.placements[i],
  infrastructure: analyticsTrends.infrastructure[i],
}));

// ---------------------------------------------------------------------------
// AI recommendations — auto-generated executive insights by domain.
// ---------------------------------------------------------------------------

export interface AiRecommendation {
  id: string;
  domain: 'Repository' | 'NBA' | 'NAAC' | 'NIRF' | 'Faculty' | 'Infrastructure' | 'Student' | 'Research' | 'Placement';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  department?: string;
}

export const aiRecommendations: AiRecommendation[] = [
  { id: 'a1', domain: 'Repository', title: 'ECE Research Repository lagging', description: 'ECE Department has only 62% Research Repository readiness. 5 records lack supporting evidence.', severity: 'high', department: 'ECE' },
  { id: 'a2', domain: 'NBA', title: 'Publication shortfall for NBA', description: 'Civil Engineering requires 12 additional Scopus-indexed publications to achieve target readiness.', severity: 'high', department: 'CIVIL' },
  { id: 'a3', domain: 'Faculty', title: 'Low FDP participation in Mechanical', description: 'Mechanical Department has 41% FDP participation compared to the institutional average of 58%.', severity: 'medium', department: 'MECH' },
  { id: 'a4', domain: 'Infrastructure', title: 'CAD Lab licenses expiring', description: 'Software licenses for CAD Lab will expire within 60 days. Raise renewal before audit.', severity: 'high', department: 'CSE' },
  { id: 'a5', domain: 'Student', title: 'Internship completion below target', description: 'Internship completion percentage (58%) is below the institutional target of 80%.', severity: 'medium', department: 'DS' },
  { id: 'a6', domain: 'NAAC', title: 'NAAC Criterion 3 evidence gap', description: 'Research citations and DOI proofs missing for 18 papers — Criterion 3 score at risk.', severity: 'high' },
  { id: 'a7', domain: 'Placement', title: 'Civil placement rate critical', description: 'Civil Engineering placement at 54% is the lowest; NIRF Graduation Outcomes impacted.', severity: 'high', department: 'CIVIL' },
  { id: 'a8', domain: 'Research', title: 'Patent filing momentum', description: '5 patents filed this year — filing receipts pending for 2 applications.', severity: 'low' },
  { id: 'a9', domain: 'NIRF', title: 'Perception score weak', description: 'NIRF Perception parameter at 65 — alumni outreach campaigns recommended.', severity: 'low' },
  { id: 'a10', domain: 'Repository', title: 'Alumni repository data stale', description: 'Alumni repository evidence for 2019-20 batch is incomplete across all departments.', severity: 'medium' },
];

export const domainMeta: Record<AiRecommendation['domain'], { icon: string; color: string }> = {
  Repository: { icon: 'Database', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
  NBA: { icon: 'Trophy', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
  NAAC: { icon: 'Award', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
  NIRF: { icon: 'TrendingUp', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
  Faculty: { icon: 'Users', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
  Infrastructure: { icon: 'Landmark', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40' },
  Student: { icon: 'GraduationCap', color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40' },
  Research: { icon: 'FlaskConical', color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/40' },
  Placement: { icon: 'Briefcase', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40' },
};

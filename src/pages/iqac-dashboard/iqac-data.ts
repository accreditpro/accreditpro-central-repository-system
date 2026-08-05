// ---------------------------------------------------------------------------
// IQAC Coordinator — consolidated institutional monitoring data layer.
//
// The IQAC NEVER uploads or approves departmental data. Everything here is a
// read-only projection of repository / accreditation data (reused from the
// principal module) plus IQAC-owned artifacts: quality observations, quality
// initiatives and supporting documents (seeds — the live copies live in the
// iqacSlice Redux store so they can be created / updated by the coordinator).
// ---------------------------------------------------------------------------

import {
  kpiData,
  institutionStats,
  departmentRepositories,
  nbaDeptScores,
  naacDeptScores,
  nirfDeptScores,
  NBA_CRITERIA,
  NAAC_CRITERIA,
  NIRF_PARAMETERS,
  NIRF_SHORT,
  principalGaps,
  aiRecommendations,
  analyticsTrends,
  naacCriteria,
  nirfParameters,
} from '../principal-dashboard/principal-data';
import type {
  QualityObservation,
  ImprovementInitiative,
  IQACDocument,
  ObservationPriority,
  TrafficStatus,
} from './types';

// ---------------------------------------------------------------------------
// Domain constants
// ---------------------------------------------------------------------------

export const IQAC_NAME = 'Dr. R. Kumar';

export const ACADEMIC_YEARS = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22'];

export const REPOSITORY_LIST = [
  'Academic',
  'Faculty',
  'Student',
  'Research',
  'Infrastructure',
  'Examination',
  'Alumni',
  'Placement',
];

export const FRAMEWORK_OPTIONS: { value: string; label: string }[] = [
  { value: 'NBA', label: 'NBA' },
  { value: 'NAAC', label: 'NAAC' },
  { value: 'NIRF', label: 'NIRF' },
  { value: 'All', label: 'All Frameworks' },
];

export const DEPARTMENT_OPTIONS = [
  { value: 'all', label: 'All Departments' },
  ...departmentRepositories.map((d) => ({ value: d.code, label: d.code })),
];

export const YEAR_OPTIONS = ACADEMIC_YEARS.map((y) => ({ value: y, label: y }));

export const PROGRAM_OPTIONS = [
  { value: 'all', label: 'All Programs' },
  { value: 'B.Tech', label: 'B.Tech' },
  { value: 'M.Tech', label: 'M.Tech' },
  { value: 'MBA', label: 'MBA' },
  { value: 'MCA', label: 'MCA' },
];

// ---------------------------------------------------------------------------
// Deterministic pseudo-random helper (stable across renders)
// ---------------------------------------------------------------------------

function seeded(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));

export function statusOf(score: number): TrafficStatus {
  if (score >= 85) return 'ready';
  if (score >= 70) return 'attention';
  return 'critical';
}

// ---------------------------------------------------------------------------
// Institution readiness — repository-wise (aggregated across departments)
// ---------------------------------------------------------------------------

const BASE_RECORDS: Record<string, number> = {
  Academic: 2480,
  Faculty: 465,
  Student: 5320,
  Research: 690,
  Infrastructure: 335,
  Examination: 390,
  Alumni: 4380,
  Placement: 860,
};

export interface InstitutionRepositoryRow {
  repository: string;
  totalRecords: number;
  approvedRecords: number;
  missingRecords: number;
  evidenceCompletion: number;
  readiness: number;
  status: TrafficStatus;
}

function repoAvg(key: 'completion' | 'approved' | 'pending' | 'missing', repo: string): number {
  const depts = departmentRepositories.filter((d) => d.repositories.some((r) => r.repo === repo));
  if (depts.length === 0) return 0;
  return Math.round(
    depts.reduce((a, d) => a + (d.repositories.find((r) => r.repo === repo)?.[key] ?? 0), 0) /
      depts.length
  );
}

export const institutionRepositories: InstitutionRepositoryRow[] = REPOSITORY_LIST.map((repo) => {
  const totalRecords = BASE_RECORDS[repo] ?? 500;
  const approvedAvg = repoAvg('approved', repo);
  const missingAvg = repoAvg('missing', repo);
  const readiness = repoAvg('completion', repo);
  return {
    repository: repo,
    totalRecords,
    approvedRecords: Math.round((totalRecords * approvedAvg) / 100),
    missingRecords: Math.round((totalRecords * missingAvg) / 100),
    evidenceCompletion: clamp(approvedAvg + 8),
    readiness,
    status: statusOf(readiness),
  };
});

export const institutionOverall = {
  repositoryCompletion: kpiData.repositoryCompletion,
  evidenceCompletion: kpiData.evidenceCompletion,
  nba: kpiData.nbaReadiness,
  naac: kpiData.naacReadiness,
  nirf: kpiData.nirfReadiness,
};

// ---------------------------------------------------------------------------
// Department readiness — with accreditation scores & overall traffic light
// ---------------------------------------------------------------------------

export interface DepartmentReadinessRow {
  code: string;
  name: string;
  repositoryCompletion: number;
  nba: number;
  naac: number;
  nirf: number;
  status: TrafficStatus;
}

export const departmentReadinessRows: DepartmentReadinessRow[] = departmentRepositories.map((d) => ({
  code: d.code,
  name: d.name,
  repositoryCompletion: d.readiness,
  nba: nbaDeptScores.find((x) => x.dept === d.code)?.overall ?? 0,
  naac: naacDeptScores.find((x) => x.dept === d.code)?.overall ?? 0,
  nirf: nirfDeptScores.find((x) => x.dept === d.code)?.overall ?? 0,
  status: statusOf(d.readiness),
}));

// Year-adjusted department × repository matrix — used by the Department
// Readiness repository columns so the Academic Year filter changes the data.
// The current year (2025-26) returns the canonical base values.
export function departmentRepositoriesForYear(year: string) {
  const yearIdx = ACADEMIC_YEARS.indexOf(year);
  if (yearIdx <= 0) return departmentRepositories;
  return departmentRepositories.map((dept, di) => {
    const delta = Math.round((seeded(di * 57 + yearIdx * 7) - 0.5) * 10);
    const readiness = clamp(dept.readiness + delta, 40, 99);
    return {
      ...dept,
      readiness,
      repositories: dept.repositories.map((r, ri) => {
        const d = Math.round((seeded(di * 57 + ri * 13 + yearIdx * 11) - 0.5) * 12);
        const completion = clamp(r.completion + d, 35, 99);
        const approved = clamp(Math.round(completion * (r.approved / Math.max(1, r.completion))), 10, 99);
        return {
          ...r,
          completion,
          approved,
          pending: clamp(completion - approved),
          missing: 100 - completion,
        };
      }),
    };
  });
}

// Programs offered per department (used by the Department Readiness filter).
export const DEPARTMENT_PROGRAMS: Record<string, string[]> = {
  CSE: ['B.Tech', 'M.Tech', 'MCA'],
  ECE: ['B.Tech', 'M.Tech'],
  EEE: ['B.Tech'],
  MECH: ['B.Tech', 'M.Tech'],
  CIVIL: ['B.Tech', 'M.Tech'],
  IT: ['B.Tech', 'MCA'],
  AIML: ['B.Tech'],
  DS: ['B.Tech', 'M.Tech', 'MBA'],
};

// Year-adjusted department readiness — deterministic per academic year so the
// year filter on the Department Readiness page genuinely changes the data.
// The current year (2025-26) returns the canonical base values.
export function departmentReadinessForYear(year: string): DepartmentReadinessRow[] {
  const yearIdx = ACADEMIC_YEARS.indexOf(year);
  if (yearIdx <= 0) return departmentReadinessRows;
  return departmentReadinessRows.map((d, di) => {
    const delta = Math.round((seeded(di * 37 + yearIdx * 11) - 0.5) * 10);
    const repositoryCompletion = clamp(d.repositoryCompletion + delta, 40, 99);
    return { ...d, repositoryCompletion, status: statusOf(repositoryCompletion) };
  });
}

// ---------------------------------------------------------------------------
// Repository monitoring — per repository operational metrics
// ---------------------------------------------------------------------------

export interface RepositoryMonitoringRow {
  repository: string;
  totalRecords: number;
  pendingUploads: number;
  missingEvidence: number;
  pendingHodApproval: number;
  approvedRecords: number;
  completion: number;
  status: TrafficStatus;
}

export const repositoryMonitoringRows: RepositoryMonitoringRow[] = REPOSITORY_LIST.map((repo) => {
  const totalRecords = BASE_RECORDS[repo] ?? 500;
  const completion = repoAvg('completion', repo);
  const approved = repoAvg('approved', repo);
  const pending = repoAvg('pending', repo);
  const missing = 100 - completion;
  const pendingUploads = Math.round((totalRecords * pending * 0.55) / 100);
  const pendingHodApproval = Math.round((totalRecords * pending * 0.45) / 100);
  return {
    repository: repo,
    totalRecords,
    pendingUploads,
    missingEvidence: Math.round((totalRecords * missing) / 100),
    pendingHodApproval,
    approvedRecords: Math.round((totalRecords * approved) / 100),
    completion,
    status: statusOf(completion),
  };
});

// ---------------------------------------------------------------------------
// Read-only drill-down: Department → Repository → Folder → Evidence
// ---------------------------------------------------------------------------

export interface DrillEvidence {
  name: string;
  fileType: string;
  size: string;
  status: 'approved' | 'uploaded' | 'pending' | 'rejected';
  uploadedBy: string;
  date: string;
}

export interface DrillFolder {
  folder: string;
  required: number;
  evidence: DrillEvidence[];
}

export interface DrillRepository {
  repository: string;
  completion: number;
  folders: DrillFolder[];
}

export interface DrillDepartment {
  code: string;
  name: string;
  repositories: DrillRepository[];
}

const FOLDER_MAP: Record<string, string[]> = {
  Academic: ['Academic Calendar', 'Timetables', 'Curriculum & Syllabi', 'Course Outcomes', 'Regulations'],
  Faculty: ['Faculty Profiles', 'Appointments', 'FDP Participation', 'Publications', 'Achievements'],
  Student: ['Enrollment', 'Results & Progression', 'Certifications', 'Placements', 'Internships'],
  Research: ['Publications', 'Patents', 'Sponsored Projects', 'Funding', 'Consultancy'],
  Infrastructure: ['Laboratories', 'Equipment', 'Software Licenses', 'ICT Facilities', 'Smart Classrooms'],
  Examination: ['Exam Schedules', 'Published Results', 'Supplementary Exams', 'Backlog Analysis', 'Fees & Records'],
  Alumni: ['Alumni Directory', 'Alumni Activities', 'Donations & Endowments', 'Alumni Achievements'],
  Placement: ['Offer Letters', 'Recruiters', 'Internships', 'MOUs', 'Training Programs'],
};

const EVIDENCE_NAMES: Record<string, string[]> = {
  'Academic Calendar': ['Approved Academic Calendar 2025-26.pdf', 'Holiday List 2025-26.pdf'],
  Timetables: ['Semester Timetable Odd Sem.pdf', 'Examination Timetable.pdf'],
  'Curriculum & Syllabi': ['Curriculum R22.pdf', 'BoS Approved Syllabus.pdf'],
  'Course Outcomes': ['CO-PO Mapping Report.xlsx', 'Course Outcome Attainment.pdf'],
  Regulations: ['Academic Regulations R22.pdf', 'Examination Rules.pdf'],
  'Faculty Profiles': ['Faculty Profile Database.xlsx', 'Faculty Bio-data.pdf'],
  Appointments: ['Appointment Orders.zip', 'Joining Reports.zip'],
  'FDP Participation': ['FDP Attendance Register.xlsx', 'FDP Certificates.zip'],
  Publications: ['Publication List 2024-25.xlsx', 'Scopus Indexed Papers.zip'],
  Achievements: ['Faculty Awards 2024-25.pdf', 'Best Teacher Nominations.xlsx'],
  Enrollment: ['Student Enrolment Register.xlsx', 'Sanctioned Intake AICTE.pdf'],
  'Results & Progression': ['Semester Results Summary.xlsx', 'Progression Report.pdf'],
  Certifications: ['MOOC Certificates.zip', 'Skill Certification List.xlsx'],
  Placements: ['Placement Offer Summary.xlsx', 'Placement Statistics 2024-25.pdf'],
  Internships: ['Internship Completion List.xlsx', 'Internship Certificates.zip'],
  Patents: ['Patent Filed List.xlsx', 'Patent Filing Receipts.zip'],
  'Sponsored Projects': ['Sponsored Project List.xlsx', 'Grant Sanction Letters.zip'],
  Funding: ['Research Funding Register.xlsx', 'Funding Utilization.pdf'],
  Consultancy: ['Consultancy Projects.xlsx', 'Consultancy Agreements.zip'],
  Laboratories: ['Lab Inventory.xlsx', 'Lab Utilization Report.pdf'],
  Equipment: ['Equipment Register.xlsx', 'Equipment Invoices.zip'],
  'Software Licenses': ['Software License List.xlsx', 'License Renewal Notices.pdf'],
  'ICT Facilities': ['ICT Infrastructure Report.pdf', 'Network Uptime Report.xlsx'],
  'Smart Classrooms': ['Smart Classroom List.xlsx', 'Smart Classroom Geo-tags.zip'],
  'Exam Schedules': ['Mid-Sem Schedule.pdf', 'End-Sem Schedule.pdf'],
  'Published Results': ['End-Sem Results 2024-25.pdf', 'Supplementary Results.pdf'],
  'Supplementary Exams': ['Supplementary Register.xlsx', 'Supplementary Notifications.pdf'],
  'Backlog Analysis': ['Backlog Analysis Report.xlsx', 'Remedial Classes Register.pdf'],
  'Fees & Records': ['Exam Fee Register.xlsx', 'Confidential Records Log.pdf'],
  'Alumni Directory': ['Alumni Directory.xlsx', 'Alumni Batch Contacts.pdf'],
  'Alumni Activities': ['Alumni Meet 2024 Photos.zip', 'Guest Lecture Report.pdf'],
  'Donations & Endowments': ['Donation Register.xlsx', 'Endowment Utilization.pdf'],
  'Alumni Achievements': ['Alumni Success Stories.pdf', 'Alumni Entrepreneurs List.xlsx'],
  'Offer Letters': ['Offer Letter Summary.xlsx', 'Offer Letters 2024-25.zip'],
  Recruiters: ['Recruiter List.xlsx', 'MoU with Recruiters.pdf'],
  MOUs: ['Industry MOUs 2024-25.pdf', 'MoU Signing Photos.zip'],
  'Training Programs': ['Training Calendar.pdf', 'Training Attendance.xlsx'],
};

function buildDrillData(): DrillDepartment[] {
  return departmentRepositories.map((dept, di) => ({
    code: dept.code,
    name: dept.name,
    repositories: REPOSITORY_LIST.map((repo, ri) => {
      const completion = dept.repositories.find((r) => r.repo === repo)?.completion ?? 50;
      const folders = (FOLDER_MAP[repo] ?? ['Documents']).map((folder, fi) => {
        const folderReadiness = clamp(completion + Math.round((seeded(di * 91 + ri * 13 + fi) - 0.5) * 18), 20, 99);
        const names = EVIDENCE_NAMES[folder] ?? [`${folder} Evidence.pdf`, `${folder} Register.xlsx`];
        const evidence: DrillEvidence[] = names.map((name, ei) => {
          const roll = seeded(di * 131 + ri * 17 + fi * 7 + ei);
          const status =
            roll < folderReadiness / 100
              ? 'approved'
              : roll < (folderReadiness + 8) / 100
                ? 'uploaded'
                : roll < (folderReadiness + 14) / 100
                  ? 'pending'
                  : 'rejected';
          return {
            name,
            fileType: name.endsWith('.pdf') ? 'pdf' : name.endsWith('.zip') ? 'zip' : 'excel',
            size: `${(1 + Math.round(roll * 9)).toFixed(1)} MB`,
            status,
            uploadedBy: di % 2 === 0 ? 'Dr. Anita Sharma' : 'Dr. Rajesh Kumar',
            date: `2025-0${1 + (ei % 4)}-${10 + (fi % 15)}`,
          };
        });
        return { folder, required: names.length, evidence };
      });
      return { repository: repo, completion, folders };
    }),
  }));
}

export const drillDownData: DrillDepartment[] = buildDrillData();

// ---------------------------------------------------------------------------
// Auto-generated gap analysis (computed from repository & accreditation data —
// never hand-maintained by the IQAC).
// ---------------------------------------------------------------------------

export interface IqaGap {
  id: string;
  scope: 'repository' | 'evidence' | 'criterion' | 'department' | 'year';
  department?: string;
  repository?: string;
  framework?: 'NBA' | 'NAAC' | 'NIRF' | 'All';
  criterion?: string;
  current: number;
  target: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction: string;
}

function gapPriority(gap: number): IqaGap['priority'] {
  if (gap >= 25) return 'critical';
  if (gap >= 15) return 'high';
  if (gap >= 8) return 'medium';
  return 'low';
}

const TARGET = 85;

function buildRepositoryGaps(): IqaGap[] {
  const out: IqaGap[] = [];
  for (const dept of departmentRepositories) {
    for (const repo of dept.repositories) {
      if (repo.completion < TARGET) {
        const gap = TARGET - repo.completion;
        out.push({
          id: `gr-${dept.code}-${repo.repo}`,
          scope: 'repository',
          department: dept.code,
          repository: repo.repo,
          current: repo.completion,
          target: TARGET,
          priority: gapPriority(gap),
          suggestedAction:
            gap >= 25
              ? `Escalate ${dept.code} ${repo.repo} Repository to the HOD with a 2-week completion plan.`
              : gap >= 15
                ? `Ask the ${dept.code} coordinator to upload the missing ${repo.repo} records & evidence.`
                : `Track ${dept.code} ${repo.repo} remaining uploads in the next weekly review.`,
        });
      }
    }
  }
  return out.sort((a, b) => b.current - a.current);
}

function buildEvidenceGaps(): IqaGap[] {
  const out: IqaGap[] = [];
  for (const dept of departmentRepositories) {
    for (const repo of dept.repositories) {
      const missing = repo.missing;
      if (missing >= 10) {
        out.push({
          id: `ge-${dept.code}-${repo.repo}`,
          scope: 'evidence',
          department: dept.code,
          repository: repo.repo,
          current: 100 - missing,
          target: TARGET,
          priority: gapPriority(missing),
          suggestedAction:
            missing >= 25
              ? `Issue an observation: mandatory ${repo.repo} evidence missing for ${dept.code}.`
              : `Follow up on ${missing}% missing ${repo.repo} evidence with the department coordinator.`,
        });
      }
    }
  }
  return out.sort((a, b) => a.current - b.current);
}

function avgCriterion(matrix: { scores: number[] }[], index: number): number {
  return Math.round(matrix.reduce((a, d) => a + d.scores[index], 0) / matrix.length);
}

function buildCriterionGaps(): IqaGap[] {
  const out: IqaGap[] = [];
  NBA_CRITERIA.forEach((name, ci) => {
    const current = avgCriterion(nbaDeptScores, ci);
    if (current < TARGET) {
      out.push({
        id: `gc-nba-${ci}`,
        scope: 'criterion',
        framework: 'NBA',
        criterion: `C${ci + 1} — ${name}`,
        current,
        target: TARGET,
        priority: gapPriority(TARGET - current),
        suggestedAction: `Strengthen NBA ${name} documentation across departments before the accreditation window.`,
      });
    }
  });
  NAAC_CRITERIA.forEach((name, ci) => {
    const current = avgCriterion(naacDeptScores, ci);
    if (current < TARGET) {
      out.push({
        id: `gc-naac-${ci}`,
        scope: 'criterion',
        framework: 'NAAC',
        criterion: `C${ci + 1} — ${name}`,
        current,
        target: TARGET,
        priority: gapPriority(TARGET - current),
        suggestedAction: `Prioritize NAAC ${name} evidence collection — it has the largest readiness gap.`,
      });
    }
  });
  NIRF_PARAMETERS.forEach((name, ci) => {
    const current = avgCriterion(nirfDeptScores, ci);
    if (current < TARGET) {
      out.push({
        id: `gc-nirf-${ci}`,
        scope: 'criterion',
        framework: 'NIRF',
        criterion: name,
        current,
        target: TARGET,
        priority: gapPriority(TARGET - current),
        suggestedAction: `Improve NIRF ${name} data submission quality before the NIRF window closes.`,
      });
    }
  });
  return out.sort((a, b) => a.current - b.current);
}

function buildDepartmentGaps(): IqaGap[] {
  return departmentReadinessRows
    .filter((d) => d.repositoryCompletion < TARGET)
    .map((d): IqaGap => ({
      id: `gd-${d.code}`,
      scope: 'department',
      department: d.code,
      current: d.repositoryCompletion,
      target: TARGET,
      priority: gapPriority(TARGET - d.repositoryCompletion),
      suggestedAction:
        d.repositoryCompletion < 70
          ? `Schedule an IQAC review meeting with the ${d.code} department.`
          : `Track ${d.code} readiness weekly and close the remaining repository gaps.`,
    }))
    .sort((a, b) => a.current - b.current);
}

function buildYearGaps(): IqaGap[] {
  const years = analyticsTrends.years;
  const series = analyticsTrends.repositoryCompletion;
  return years.map((year, i): IqaGap => {
    const current = series[i];
    return {
      id: `gy-${year}`,
      scope: 'year',
      criterion: year,
      current,
      target: 90,
      priority: gapPriority(90 - current),
      suggestedAction:
        current < 75
          ? 'Retrospective documentation drive required for this academic year.'
          : 'Maintain current momentum and complete remaining evidence for this year.',
    };
  });
}

export const repositoryGaps = buildRepositoryGaps();
export const evidenceGaps = buildEvidenceGaps();
export const criterionGaps = buildCriterionGaps();
export const departmentGaps = buildDepartmentGaps();
export const yearGaps = buildYearGaps();

export const gapStats = {
  critical: [...repositoryGaps, ...evidenceGaps, ...criterionGaps, ...departmentGaps].filter(
    (g) => g.priority === 'critical'
  ).length,
  total: [...repositoryGaps, ...evidenceGaps, ...criterionGaps, ...departmentGaps].length,
};

// ---------------------------------------------------------------------------
// Seed quality observations (live copies live in the iqacSlice store)
// ---------------------------------------------------------------------------

export const seedObservations: QualityObservation[] = [
  {
    id: 'obs-1',
    title: 'Research Repository readiness below 70%',
    department: 'EEE',
    repository: 'Research',
    academicYear: '2025-26',
    framework: 'NAAC',
    criterion: 'C3 — Research, Innovations & Extension',
    priority: 'critical',
    description:
      'Research Repository readiness is 62% — faculty publication lists, citation data and funding registers are incomplete.',
    recommendedAction:
      'Compile the publication list from Scopus author profiles and upload DOI proofs for 18 papers.',
    dueDate: '2026-02-15',
    status: 'open',
    createdBy: IQAC_NAME,
    createdAt: '2026-01-05',
    assignedTo: 'Dr. Venkat Raman (EEE)',
  },
  {
    id: 'obs-2',
    title: 'Civil Engineering requires additional Scopus-indexed publications',
    department: 'CIVIL',
    repository: 'Research',
    academicYear: '2025-26',
    framework: 'NBA',
    criterion: 'C4 — Students Performance',
    priority: 'high',
    description:
      'Publication output is 1.8 papers/faculty against a 3.0 benchmark; 12 more Scopus-indexed papers needed for NBA readiness.',
    recommendedAction:
      'Identify faculty with near-complete manuscripts, fund open-access APC for 6 papers, and track Scopus uploads monthly.',
    dueDate: '2026-03-31',
    status: 'in-progress',
    createdBy: IQAC_NAME,
    createdAt: '2025-12-12',
    assignedTo: 'Dr. Karthik Raja (CIVIL)',
  },
  {
    id: 'obs-3',
    title: 'Low FDP participation in Mechanical Engineering',
    department: 'MECH',
    repository: 'Faculty',
    academicYear: '2025-26',
    framework: 'All',
    criterion: 'NBA C5 / NAAC C3.5',
    priority: 'high',
    description:
      'FDP participation is 41% against the institutional average of 58%, affecting NAAC Criterion 3.5 and NBA Criterion 5.',
    recommendedAction:
      'Schedule 4 FDP programs in emerging technologies and mandate one FDP per faculty per year.',
    dueDate: '2026-02-28',
    status: 'open',
    createdBy: IQAC_NAME,
    createdAt: '2026-01-08',
    assignedTo: 'Dr. Arun Prakash (MECH)',
  },
  {
    id: 'obs-4',
    title: 'Software licenses in CAD Laboratory expiring soon',
    department: 'CSE',
    repository: 'Infrastructure',
    academicYear: '2025-26',
    framework: 'NAAC',
    criterion: 'C4 — Infrastructure & Learning Resources',
    priority: 'high',
    description:
      'Software licenses for the CAD Lab expire within 60 days; expired licenses invalidate NAAC Criterion 4.2 ICT claims.',
    recommendedAction: 'Raise the renewal request this week and add reminders for all 2026 expiries.',
    dueDate: '2026-02-01',
    status: 'in-progress',
    createdBy: IQAC_NAME,
    createdAt: '2025-12-20',
    assignedTo: 'Mr. Rajesh Kumar (Infrastructure)',
  },
  {
    id: 'obs-5',
    title: 'Internship completion below institutional target',
    department: 'DS',
    repository: 'Student',
    academicYear: '2025-26',
    framework: 'All',
    criterion: 'Student Support & Progression',
    priority: 'medium',
    description:
      'Internship completion is 58% against the institutional target of 80%. Experiential learning metrics are understated.',
    recommendedAction:
      'Coordinate with the TPO for certificate collection and follow up with 12 pending companies.',
    dueDate: '2026-03-15',
    status: 'open',
    createdBy: IQAC_NAME,
    createdAt: '2026-01-10',
    assignedTo: 'TPO Cell',
  },
  {
    id: 'obs-6',
    title: 'Academic Calendar Report not uploaded for IT department',
    department: 'IT',
    repository: 'Academic',
    academicYear: '2024-25',
    framework: 'NAAC',
    criterion: 'C1 — Curricular Aspects',
    priority: 'low',
    description:
      'The approved 2024-25 academic calendar and BoS minutes are missing from the Academic Repository.',
    recommendedAction: 'Upload the approved calendar with BoS minutes attached.',
    dueDate: '2025-12-30',
    status: 'resolved',
    createdBy: IQAC_NAME,
    createdAt: '2025-11-15',
    assignedTo: 'Dr. Priya Sharma (IT)',
    resolution: 'Calendar and BoS minutes uploaded and verified on 2025-12-28.',
    resolvedAt: '2025-12-28',
  },
  {
    id: 'obs-7',
    title: 'Placement rate below NIRF Graduation Outcomes threshold',
    department: 'CIVIL',
    repository: 'Placement',
    academicYear: '2024-25',
    framework: 'NIRF',
    criterion: 'Graduation Outcomes',
    priority: 'critical',
    description:
      'Placement rate is 54% — the lowest among departments, dragging the NIRF Graduation Outcomes score (20% weight).',
    recommendedAction:
      'Run 4 additional campus drives, organize skill-gap bootcamps for final year, and engage the alumni network.',
    dueDate: '2026-01-31',
    status: 'closed',
    createdBy: IQAC_NAME,
    createdAt: '2025-10-20',
    assignedTo: 'TPO Cell',
    resolution:
      'Placement drive completed — placement rate improved to 61%. Observation closed after HOD re-approval.',
    resolvedAt: '2026-01-20',
  },
  {
    id: 'obs-8',
    title: 'NAAC Criterion 3 evidence gaps across departments',
    department: 'All Departments',
    repository: 'Research',
    academicYear: '2025-26',
    framework: 'NAAC',
    criterion: 'C3 — Research, Innovations & Extension',
    priority: 'high',
    description:
      'Research citations and DOI proofs are missing for 18 papers across departments, putting Criterion 3 at risk.',
    recommendedAction:
      'Run a citation proof collection drive with all research coordinators before the SSR submission window.',
    dueDate: '2026-04-15',
    status: 'in-progress',
    createdBy: IQAC_NAME,
    createdAt: '2026-01-02',
    assignedTo: 'Research Coordinators',
  },
];

// ---------------------------------------------------------------------------
// Seed quality improvement initiatives
// ---------------------------------------------------------------------------

export const seedInitiatives: ImprovementInitiative[] = [
  {
    id: 'init-1',
    title: 'Outcome-Based Curriculum Revision 2026',
    category: 'Curriculum Revision',
    department: 'All Departments',
    academicYear: '2025-26',
    description:
      'Revise UG curricula to strengthen CO-PO mapping and align with the new AICTE model curriculum.',
    owner: 'Dean Academics',
    startDate: '2025-09-01',
    targetDate: '2026-06-30',
    status: 'in-progress',
    outcome: 'Curriculum draft approved by BoS for 4 programs.',
  },
  {
    id: 'init-2',
    title: 'Faculty Development Program Series — AI & ML',
    category: 'Faculty Development',
    department: 'MECH',
    academicYear: '2025-26',
    description:
      'Conduct 4 FDP programs in emerging technologies to lift MECH FDP participation from 41% to the 80% target.',
    owner: 'Dr. Arun Prakash',
    startDate: '2025-10-01',
    targetDate: '2026-04-30',
    status: 'on-track',
    outcome: '2 FDP programs completed with 120 faculty attendances.',
  },
  {
    id: 'init-3',
    title: 'Advanced Materials Laboratory Enhancement',
    category: 'Laboratory Enhancement',
    department: 'CIVIL',
    academicYear: '2025-26',
    description:
      'Procure materials testing equipment and digitize lab inventory for NAAC Criterion 4 evidence.',
    owner: 'Infrastructure Cell',
    startDate: '2025-11-15',
    targetDate: '2026-03-31',
    status: 'delayed',
    outcome: 'Equipment procurement order placed; installation pending.',
  },
  {
    id: 'init-4',
    title: 'Student Skill Development Bootcamps',
    category: 'Student Skill Development',
    department: 'CIVIL',
    academicYear: '2025-26',
    description:
      'Skill-gap bootcamps for final year students to improve placement outcomes beyond 61%.',
    owner: 'TPO Cell',
    startDate: '2026-01-05',
    targetDate: '2026-04-15',
    status: 'in-progress',
    outcome: 'Bootcamps covering aptitude, coding and soft skills for 240 students.',
  },
  {
    id: 'init-5',
    title: 'Scopus Indexed Publication Incentive Scheme',
    category: 'Research Promotion',
    department: 'All Departments',
    academicYear: '2025-26',
    description:
      'Incentivize faculty publications in Scopus-indexed journals to close the NBA research output gap.',
    owner: 'Research Committee',
    startDate: '2025-09-15',
    targetDate: '2026-05-31',
    status: 'on-track',
    outcome: 'Publication incentive policy approved; 14 papers submitted under the scheme.',
  },
  {
    id: 'init-6',
    title: 'Industry-Academia MoU Expansion Drive',
    category: 'Industry Interaction',
    department: 'All Departments',
    academicYear: '2025-26',
    description:
      'Sign 10 new industry MoUs covering internships, guest lectures and sponsored labs.',
    owner: 'Placement & Training Cell',
    startDate: '2025-12-01',
    targetDate: '2026-06-15',
    status: 'not-started',
  },
  {
    id: 'init-7',
    title: 'Smart Classroom ICT Upgrade',
    category: 'Infrastructure Improvement',
    department: 'CSE',
    academicYear: '2024-25',
    description:
      'Upgrade 12 classrooms with interactive panels and lecture capture for NAAC Criterion 4 claims.',
    owner: 'Infrastructure Cell',
    startDate: '2025-04-01',
    targetDate: '2025-12-31',
    status: 'completed',
    outcome: '12 classrooms upgraded; ICT utilization report published.',
  },
];

// ---------------------------------------------------------------------------
// Supporting documents — IQAC institutional document folders
// ---------------------------------------------------------------------------

export const DOC_FOLDERS = [
  'IQAC Annual Reports',
  'AQAR Reports',
  'SSR Supporting Documents',
  'Best Practices',
  'Institutional Distinctiveness',
  'Quality Policies',
  'IQAC Meeting Minutes',
  'Action Taken Reports',
  'Annual Quality Plans',
  'Other Supporting Documents',
];

export const seedDocuments: IQACDocument[] = [
  {
    id: 'iqac-doc-1',
    folder: 'IQAC Annual Reports',
    name: 'IQAC Annual Report 2024-25.pdf',
    description: 'Annual internal quality assurance report for 2024-25.',
    fileType: 'pdf',
    size: '4.2 MB',
    uploadedBy: IQAC_NAME,
    uploadedDate: '2025-08-12',
    tags: ['annual', 'report', '2024-25'],
    versions: [
      { version: 'v1', uploadedBy: IQAC_NAME, uploadedDate: '2025-08-12', note: 'Initial upload', fileSize: '4.2 MB' },
      { version: 'v2', uploadedBy: IQAC_NAME, uploadedDate: '2025-09-01', note: 'Post-peer-review revision', fileSize: '4.6 MB' },
    ],
  },
  {
    id: 'iqac-doc-2',
    folder: 'AQAR Reports',
    name: 'AQAR 2024-25.xlsx',
    description: 'Annual Quality Assurance Report data workbook for NAAC.',
    fileType: 'xlsx',
    size: '1.8 MB',
    uploadedBy: IQAC_NAME,
    uploadedDate: '2025-10-05',
    tags: ['aqar', 'naac', 'data'],
    versions: [{ version: 'v1', uploadedBy: IQAC_NAME, uploadedDate: '2025-10-05', fileSize: '1.8 MB' }],
  },
  {
    id: 'iqac-doc-3',
    folder: 'SSR Supporting Documents',
    name: 'SSR Evidence Index.xlsx',
    description: 'Master index mapping SSR claims to repository evidence.',
    fileType: 'xlsx',
    size: '2.4 MB',
    uploadedBy: IQAC_NAME,
    uploadedDate: '2025-11-18',
    tags: ['ssr', 'evidence', 'index'],
    versions: [
      { version: 'v1', uploadedBy: IQAC_NAME, uploadedDate: '2025-11-18', fileSize: '2.4 MB' },
      { version: 'v2', uploadedBy: IQAC_NAME, uploadedDate: '2026-01-12', note: 'Criterion 3 rows added', fileSize: '2.7 MB' },
    ],
  },
  {
    id: 'iqac-doc-4',
    folder: 'Best Practices',
    name: 'Best Practices Handbook.pdf',
    description: 'Compendium of institutional best practices for NAAC Criterion 7.',
    fileType: 'pdf',
    size: '3.1 MB',
    uploadedBy: IQAC_NAME,
    uploadedDate: '2025-12-20',
    tags: ['best-practices', 'naac'],
    versions: [{ version: 'v1', uploadedBy: IQAC_NAME, uploadedDate: '2025-12-20', fileSize: '3.1 MB' }],
  },
  {
    id: 'iqac-doc-5',
    folder: 'Institutional Distinctiveness',
    name: 'Institutional Distinctiveness Statement.pdf',
    description: 'Statement of institutional distinctiveness for the SSR.',
    fileType: 'pdf',
    size: '1.2 MB',
    uploadedBy: IQAC_NAME,
    uploadedDate: '2026-01-08',
    tags: ['distinctiveness', 'ssr'],
    versions: [{ version: 'v1', uploadedBy: IQAC_NAME, uploadedDate: '2026-01-08', fileSize: '1.2 MB' }],
  },
  {
    id: 'iqac-doc-6',
    folder: 'Quality Policies',
    name: 'Quality Assurance Policy.pdf',
    description: 'Institutional quality assurance and continuous improvement policy.',
    fileType: 'pdf',
    size: '980 KB',
    uploadedBy: 'Principal',
    uploadedDate: '2025-07-15',
    tags: ['policy', 'quality'],
    versions: [{ version: 'v1', uploadedBy: 'Principal', uploadedDate: '2025-07-15', fileSize: '980 KB' }],
  },
  {
    id: 'iqac-doc-7',
    folder: 'IQAC Meeting Minutes',
    name: 'IQAC Meeting Minutes — Q3 2025.pdf',
    description: 'Minutes of the quarterly IQAC committee meeting.',
    fileType: 'pdf',
    size: '720 KB',
    uploadedBy: IQAC_NAME,
    uploadedDate: '2025-12-22',
    tags: ['minutes', 'meeting', 'q3'],
    versions: [{ version: 'v1', uploadedBy: IQAC_NAME, uploadedDate: '2025-12-22', fileSize: '720 KB' }],
  },
  {
    id: 'iqac-doc-8',
    folder: 'Action Taken Reports',
    name: 'Action Taken Report 2024-25.xlsx',
    description: 'Consolidated action taken report on previous AQAR recommendations.',
    fileType: 'xlsx',
    size: '1.5 MB',
    uploadedBy: IQAC_NAME,
    uploadedDate: '2025-10-30',
    tags: ['atr', 'action', 'report'],
    versions: [{ version: 'v1', uploadedBy: IQAC_NAME, uploadedDate: '2025-10-30', fileSize: '1.5 MB' }],
  },
  {
    id: 'iqac-doc-9',
    folder: 'Annual Quality Plans',
    name: 'Annual Quality Plan 2025-26.pdf',
    description: 'Institutional quality plan with milestones for the year.',
    fileType: 'pdf',
    size: '2.9 MB',
    uploadedBy: IQAC_NAME,
    uploadedDate: '2025-08-01',
    tags: ['plan', 'quality', '2025-26'],
    versions: [
      { version: 'v1', uploadedBy: IQAC_NAME, uploadedDate: '2025-08-01', fileSize: '2.9 MB' },
      { version: 'v2', uploadedBy: IQAC_NAME, uploadedDate: '2025-11-20', note: 'Mid-year revision', fileSize: '3.2 MB' },
    ],
  },
  {
    id: 'iqac-doc-10',
    folder: 'Other Supporting Documents',
    name: 'Faculty Feedback Analysis 2024-25.pdf',
    description: 'Analysis of student feedback on courses and faculty.',
    fileType: 'pdf',
    size: '2.1 MB',
    uploadedBy: IQAC_NAME,
    uploadedDate: '2025-12-05',
    tags: ['feedback', 'analysis'],
    versions: [{ version: 'v1', uploadedBy: IQAC_NAME, uploadedDate: '2025-12-05', fileSize: '2.1 MB' }],
  },
];

// ---------------------------------------------------------------------------
// Derived KPIs used by the Dashboard
// ---------------------------------------------------------------------------

export const iqacKpis = {
  repositoryReadiness: kpiData.repositoryCompletion,
  nbaReadiness: kpiData.nbaReadiness,
  naacReadiness: kpiData.naacReadiness,
  nirfReadiness: kpiData.nirfReadiness,
  evidenceCompletion: kpiData.evidenceCompletion,
  departmentsReady: departmentReadinessRows.filter((d) => d.status === 'ready').length,
  departmentsNeedingAttention: departmentReadinessRows.filter((d) => d.status === 'attention').length,
  criticalDepartments: departmentReadinessRows.filter((d) => d.status === 'critical').length,
  criticalGaps: gapStats.critical,
  pendingHodApprovals: kpiData.pendingApprovals,
  activeObservations: seedObservations.filter((o) => o.status !== 'closed').length,
};

// ---------------------------------------------------------------------------
// Re-exports kept for consumers of this module
// ---------------------------------------------------------------------------

export {
  kpiData,
  institutionStats,
  nbaDeptScores,
  naacDeptScores,
  nirfDeptScores,
  NBA_CRITERIA,
  NAAC_CRITERIA,
  NIRF_PARAMETERS,
  NIRF_SHORT,
  principalGaps,
  aiRecommendations,
  analyticsTrends,
  naacCriteria,
  nirfParameters,
  departmentRepositories,
};

export type { QualityObservation, ImprovementInitiative, IQACDocument, ObservationPriority };

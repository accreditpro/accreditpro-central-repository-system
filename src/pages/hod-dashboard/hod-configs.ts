export interface RepositoryStatus {
  id: string;
  name: string;
  owner: string;
  completion: number;
  evidence: number;
  verification: number;
  pendingTasks: number;
  status: 'on-track' | 'at-risk' | 'critical' | 'completed';
}

export interface EvidenceVersion {
  version: string;
  date: string;
  actor: string;
  note: string;
}

export interface EvidenceItem {
  id: string;
  repository: string;
  section: string;
  uploadedBy: string;
  documentName: string;
  documentCategory: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes-requested';
  fileType: 'pdf' | 'image' | 'doc' | 'excel';
  fileSize: string;
  version: string;
  reviewNote?: string;
  reviewedBy?: string;
  reviewDate?: string;
  history: EvidenceVersion[];
}

export interface AccreditationImpact {
  criterion: string;
  impact: string;
}

export interface GapAccreditation {
  naac: AccreditationImpact;
  nba: AccreditationImpact;
  nirf: AccreditationImpact;
}

export interface GapItem {
  id: string;
  category: string;
  description: string;
  repository: string;
  /** Evidence section the gap belongs to (matches the Evidence Review / Approval Queue structure). */
  section: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  recommendation: string;
  accreditation: GapAccreditation;
}

export interface ActivityItem {
  id: string;
  type: 'submitted' | 'uploaded' | 'approved' | 'rejected' | 'commented' | 'returned' | 'verified';
  description: string;
  user: string;
  timestamp: string;
  repository: string;
}

export interface ReadinessData {
  repository: string;
  weight: number;
  dataCompletion: number;
  evidenceCompletion: number;
  verification: number;
  approval: number;
}

export interface AnalyticsData {
  facultyCount: number;
  students: number;
  research: number;
  placements: number;
  passPercentage: number;
  publications: number;
  patents: number;
  projects: number;
}

export interface YearlyTrend {
  year: string;
  academic: number;
  faculty: number;
  student: number;
  research: number;
  alumni: number;
}

export interface AiInsight {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'critical' | 'success' | 'info';
}

export interface AccreditationCriterion {
  name: string;
  /** Weight of this criterion within the framework (NAAC weightage / NBA weightage / NIRF parameter weight). */
  weightage: number;
  /** Department-level completion of data & evidence for this criterion (0–100). */
  completion: number;
  status: 'ready' | 'in-progress' | 'not-started';
}

export interface AccreditationFrameworkData {
  id: 'naac' | 'nba' | 'nirf';
  name: string;
  /** Overall readiness % for the framework, derived from repository completion. */
  readiness: number;
  status: 'ready' | 'in-progress' | 'not-started';
  criteria: AccreditationCriterion[];
}

// ---------------------------------------------------------------------------
// Academic year support
// ---------------------------------------------------------------------------

export const ACADEMIC_YEARS = [
  '2025-26',
  '2024-25',
  '2023-24',
  '2022-23',
  '2021-22',
  '2020-21',
  '2019-20',
];

export interface HODYearData {
  repositoryOverview: RepositoryStatus[];
  readiness: ReadinessData[];
  evidence: EvidenceItem[];
  gaps: GapItem[];
  analytics: AnalyticsData;
  activities: ActivityItem[];
  insights: AiInsight[];
  health: number;
  /** NAAC / NBA / NIRF readiness, derived from the repository data above. */
  accreditation: AccreditationFrameworkData[];
}

const REPO_OWNERS: Record<string, string> = {
  Academic: 'Dr. Priya Sharma',
  Course: 'Prof. Meena Gupta',
  Faculty: 'Prof. Rajesh Kumar',
  Student: 'Ms. Kavitha Nair',
  Research: 'Dr. Amit Patel',
  'Student Dev': 'Ms. Kavitha Nair',
  Infrastructure: 'Mr. Arun Verma',
  Alumni: 'Mr. Vikram Singh',
};

const REPO_WEIGHTS: Record<string, number> = {
  Academic: 15,
  Course: 10,
  Faculty: 15,
  Student: 15,
  Research: 10,
  'Student Dev': 10,
  Infrastructure: 5,
  Alumni: 5,
};

// Maps each repository to the NAAC / NBA / NIRF criteria its evidence primarily
// supports, so gaps can be matched to the accreditation frameworks they impact.
const REPO_ACCREDITATION: Record<string, GapAccreditation> = {
  Academic: {
    naac: { criterion: 'NAAC Criterion 1 — Curricular Aspects', impact: 'Academic planning documents & curriculum evidence feed Criterion 1 (Curriculum Planning and Implementation).' },
    nba: { criterion: 'NBA Criterion 2 — Program Curriculum and Teaching-Learning Processes', impact: 'Curriculum structure, BoS minutes and academic calendars evidence curriculum design and its implementation.' },
    nirf: { criterion: 'NIRF — Teaching, Learning & Resources (TLR)', impact: 'Curriculum breadth and academic resources contribute to the TLR parameter.' },
  },
  Course: {
    naac: { criterion: 'NAAC Criterion 2 — Teaching, Learning and Evaluation', impact: 'Course files, COs, CO-PO mapping and attainment reports evidence the teaching-learning-evaluation cycle.' },
    nba: { criterion: 'NBA Criterion 3 — Course Outcomes (COs) and Program Outcomes (POs)', impact: 'CO-PO/PSO mapping, assessment blueprints and attainment drive the CO-PO attainment score.' },
    nirf: { criterion: 'NIRF — Graduation Outcomes (GO)', impact: 'Course-level attainment and assessment quality roll up into the GO parameter.' },
  },
  Faculty: {
    naac: { criterion: 'NAAC Criterion 3 — Research, Innovations and Extension', impact: 'Faculty profile, qualifications and professional development feed faculty research capability metrics.' },
    nba: { criterion: 'NBA Criterion 5 — Faculty Information and Contributions', impact: 'Faculty qualifications, experience and development records evidence faculty contribution in the SAR.' },
    nirf: { criterion: 'NIRF — Teaching, Learning & Resources (TLR)', impact: 'Faculty-student ratio and faculty quality metrics feed the TLR parameter.' },
  },
  Student: {
    naac: { criterion: 'NAAC Criterion 2 — Teaching, Learning and Evaluation', impact: 'Student records, admission and diversity data evidence learning outcomes and student-centric practices.' },
    nba: { criterion: 'NBA Criterion 4 — Students\' Performance', impact: 'Student profiles, admissions and results evidence cohort performance and progression.' },
    nirf: { criterion: 'NIRF — Graduation Outcomes (GO)', impact: 'Student progression and academic performance contribute to the GO parameter.' },
  },
  Research: {
    naac: { criterion: 'NAAC Criterion 3 — Research, Innovations and Extension', impact: 'Publications, patents and sponsored projects evidence research output and innovation metrics.' },
    nba: { criterion: 'NBA Criterion 5 — Faculty Information and Contributions', impact: 'Research output and projects evidence faculty contribution beyond teaching.' },
    nirf: { criterion: 'NIRF — Research and Professional Practice (RP)', impact: 'Publication, citation and patent metrics feed the RP parameter (30% weight).' },
  },
  'Student Dev': {
    naac: { criterion: 'NAAC Criterion 5 — Student Support and Progression', impact: 'Placements, higher studies, internships and co-curricular outcomes evidence student progression.' },
    nba: { criterion: 'NBA Criterion 9 — Student Support Systems', impact: 'Placement, internship and mentoring support evidence student support systems in the SAR.' },
    nirf: { criterion: 'NIRF — Outreach and Inclusivity (OI)', impact: 'Student development outcomes and inclusiveness feed the OI parameter.' },
  },
  Infrastructure: {
    naac: { criterion: 'NAAC Criterion 4 — Infrastructure and Learning Resources', impact: 'Classrooms, labs, equipment and ICT evidence infrastructure adequacy and utilisation.' },
    nba: { criterion: 'NBA Criterion 6 — Facilities and Technical Support', impact: 'Laboratories, equipment and technical support evidence programme facilities in the SAR.' },
    nirf: { criterion: 'NIRF — Teaching, Learning & Resources (TLR)', impact: 'Infrastructure and learning resources feed the TLR parameter.' },
  },
  Alumni: {
    naac: { criterion: 'NAAC Criterion 5 — Student Support and Progression', impact: 'Alumni engagement, mentorship and contributions evidence alumni support and progression.' },
    nba: { criterion: 'NBA Criterion 9 — Student Support Systems', impact: 'Alumni mentorship and engagement evidence programme-level support systems.' },
    nirf: { criterion: 'NIRF — Outreach and Inclusivity (OI)', impact: 'Alumni outcomes and outreach feed the OI parameter.' },
  },
};

// Shared default for repositories without an explicit accreditation mapping.
const DEFAULT_ACCREDITATION: GapAccreditation = {
  naac: { criterion: 'NAAC — Relevant Criterion', impact: 'Evidence gaps may affect the corresponding NAAC criterion score.' },
  nba: { criterion: 'NBA — Relevant Criterion', impact: 'Evidence gaps may affect the corresponding NBA criterion score.' },
  nirf: { criterion: 'NIRF — Relevant Parameter', impact: 'Evidence gaps may affect the corresponding NIRF parameter score.' },
};

// ---------------------------------------------------------------------------
// Current year (2025-26) data
// ---------------------------------------------------------------------------

export const repositoryOverviewData: RepositoryStatus[] = [
  { id: '1', name: 'Academic Repository', owner: 'Dr. Priya Sharma', completion: 92, evidence: 88, verification: 85, pendingTasks: 4, status: 'on-track' },
  { id: '2', name: 'Course Repository', owner: 'Prof. Meena Gupta', completion: 78, evidence: 70, verification: 66, pendingTasks: 9, status: 'at-risk' },
  { id: '3', name: 'Faculty Repository', owner: 'Prof. Rajesh Kumar', completion: 88, evidence: 82, verification: 78, pendingTasks: 7, status: 'on-track' },
  { id: '4', name: 'Student Repository', owner: 'Ms. Kavitha Nair', completion: 95, evidence: 91, verification: 89, pendingTasks: 2, status: 'completed' },
  { id: '5', name: 'Research Repository', owner: 'Dr. Amit Patel', completion: 72, evidence: 65, verification: 60, pendingTasks: 12, status: 'at-risk' },
  { id: '6', name: 'Student Dev & Outcomes', owner: 'Ms. Kavitha Nair', completion: 81, evidence: 74, verification: 70, pendingTasks: 8, status: 'on-track' },
  { id: '7', name: 'Infrastructure Repository', owner: 'Mr. Arun Verma', completion: 69, evidence: 60, verification: 55, pendingTasks: 11, status: 'at-risk' },
  { id: '8', name: 'Alumni Repository', owner: 'Mr. Vikram Singh', completion: 61, evidence: 55, verification: 48, pendingTasks: 15, status: 'critical' },
];

// ---------------------------------------------------------------------------
// Evidence documents — organized by repository → section/category
// Mirrors the sections the Department Coordinator uploads evidence for
// (Academic Calendar, Value Added Courses, Add-on Programs, Timetable, ...)
// ---------------------------------------------------------------------------

export const HOD_NAME = 'Dr. Suresh Patil (HOD)';

const COORDINATOR_NAME = 'Dr. Anita Sharma';

interface EvidenceDocTemplate {
  category: string;
  fileType: EvidenceItem['fileType'];
  fileSize: string;
  fileName: (short: string) => string;
}

interface EvidenceSectionTemplate {
  section: string;
  docs: EvidenceDocTemplate[];
}

interface EvidenceRepoTemplate {
  repository: string;
  sections: EvidenceSectionTemplate[];
}

const EVIDENCE_STRUCTURE: EvidenceRepoTemplate[] = [
  {
    repository: 'Academic',
    sections: [
      {
        section: 'Academic Calendar',
        docs: [
          { category: 'Department Academic Calendar PDF', fileType: 'pdf', fileSize: '1.2 MB', fileName: (y) => `Academic_Calendar_${y}.pdf` },
          { category: 'Academic Calendar Report', fileType: 'pdf', fileSize: '640 KB', fileName: (y) => `Academic_Calendar_Report_${y}.pdf` },
          { category: 'NBA Evidence', fileType: 'pdf', fileSize: '2.1 MB', fileName: (y) => `NBA_Evidence_${y}.pdf` },
          { category: 'NAAC Evidence', fileType: 'pdf', fileSize: '1.8 MB', fileName: (y) => `NAAC_Evidence_${y}.pdf` },
          { category: 'Department Academic Planner', fileType: 'doc', fileSize: '980 KB', fileName: (y) => `Academic_Planner_${y}.docx` },
        ],
      },
      {
        section: 'Value Added Courses',
        docs: [
          { category: 'Course Brochure', fileType: 'pdf', fileSize: '890 KB', fileName: (y) => `VAC_Brochure_${y}.pdf` },
          { category: 'Attendance Records', fileType: 'excel', fileSize: '1.4 MB', fileName: (y) => `VAC_Attendance_${y}.xlsx` },
          { category: 'Certificates', fileType: 'image', fileSize: '3.2 MB', fileName: (y) => `VAC_Certificates_${y}.jpg` },
          { category: 'Completion Report', fileType: 'pdf', fileSize: '760 KB', fileName: (y) => `VAC_Completion_Report_${y}.pdf` },
        ],
      },
      {
        section: 'Add-on Programs',
        docs: [
          { category: 'Program Brochure', fileType: 'pdf', fileSize: '920 KB', fileName: (y) => `Addon_Brochure_${y}.pdf` },
          { category: 'Attendance Sheets', fileType: 'excel', fileSize: '1.1 MB', fileName: (y) => `Addon_Attendance_${y}.xlsx` },
          { category: 'Certificates', fileType: 'image', fileSize: '2.8 MB', fileName: (y) => `Addon_Certificates_${y}.jpg` },
          { category: 'Feedback Forms', fileType: 'pdf', fileSize: '540 KB', fileName: (y) => `Addon_Feedback_${y}.pdf` },
        ],
      },
      {
        section: 'Academic Timetable',
        docs: [
          { category: 'Timetable PDF', fileType: 'pdf', fileSize: '1.6 MB', fileName: (y) => `Timetable_${y}.pdf` },
          { category: 'Faculty Workload Statement', fileType: 'excel', fileSize: '720 KB', fileName: (y) => `Faculty_Workload_${y}.xlsx` },
          { category: 'Room Allocation', fileType: 'excel', fileSize: '480 KB', fileName: (y) => `Room_Allocation_${y}.xlsx` },
        ],
      },
    ],
  },
  {
    repository: 'Faculty',
    sections: [
      {
        section: 'Faculty Profile',
        docs: [
          { category: 'Appointment Order', fileType: 'pdf', fileSize: '2.4 MB', fileName: (y) => `Appointment_Orders_${y}.pdf` },
          { category: 'PAN Card', fileType: 'image', fileSize: '1.9 MB', fileName: (y) => `PAN_Cards_${y}.jpg` },
          { category: 'Aadhaar', fileType: 'image', fileSize: '2.2 MB', fileName: (y) => `Aadhaar_${y}.jpg` },
        ],
      },
      {
        section: 'Qualification',
        docs: [
          { category: 'Degree Certificate', fileType: 'pdf', fileSize: '3.1 MB', fileName: (y) => `Degree_Certificates_${y}.pdf` },
          { category: 'PhD Certificate', fileType: 'pdf', fileSize: '1.5 MB', fileName: (y) => `PhD_Certificates_${y}.pdf` },
          { category: 'Transcripts', fileType: 'pdf', fileSize: '2.7 MB', fileName: (y) => `Transcripts_${y}.pdf` },
        ],
      },
      {
        section: 'Employment Information',
        docs: [
          { category: 'Appointment Order', fileType: 'pdf', fileSize: '2.4 MB', fileName: (y) => `Employment_Appointments_${y}.pdf` },
          { category: 'Joining Report', fileType: 'pdf', fileSize: '1.1 MB', fileName: (y) => `Joining_Reports_${y}.pdf` },
          { category: 'Experience Certificates', fileType: 'pdf', fileSize: '2.9 MB', fileName: (y) => `Experience_Certificates_${y}.pdf` },
          { category: 'AICTE Records', fileType: 'excel', fileSize: '860 KB', fileName: (y) => `AICTE_Records_${y}.xlsx` },
        ],
      },
      {
        section: 'Professor of Practice',
        docs: [
          { category: 'MoU with Organization', fileType: 'pdf', fileSize: '1.3 MB', fileName: (y) => `PoP_MoU_${y}.pdf` },
          { category: 'Appointment Letter', fileType: 'pdf', fileSize: '980 KB', fileName: (y) => `PoP_Appointment_${y}.pdf` },
          { category: 'Course Completion Report', fileType: 'pdf', fileSize: '710 KB', fileName: (y) => `PoP_Completion_${y}.pdf` },
        ],
      },
    ],
  },
  {
    repository: 'Student',
    sections: [
      {
        section: 'Student Profile',
        docs: [
          { category: 'Admission Register', fileType: 'excel', fileSize: '4.2 MB', fileName: (y) => `Admission_Register_${y}.xlsx` },
          { category: 'Student Records', fileType: 'excel', fileSize: '5.6 MB', fileName: (y) => `Student_Records_${y}.xlsx` },
          { category: 'Admission Form', fileType: 'image', fileSize: '3.8 MB', fileName: (y) => `Admission_Forms_${y}.jpg` },
          { category: 'SSC Certificate', fileType: 'image', fileSize: '4.4 MB', fileName: (y) => `SSC_Certificates_${y}.jpg` },
          { category: 'Aadhaar Card', fileType: 'image', fileSize: '4.1 MB', fileName: (y) => `Student_Aadhaar_${y}.jpg` },
        ],
      },
      {
        section: 'Admission Info',
        docs: [
          { category: 'Admission Register', fileType: 'excel', fileSize: '2.8 MB', fileName: (y) => `Admission_Info_Register_${y}.xlsx` },
          { category: 'Admission Records', fileType: 'excel', fileSize: '3.3 MB', fileName: (y) => `Admission_Records_${y}.xlsx` },
          { category: 'Passport/Visa', fileType: 'image', fileSize: '1.7 MB', fileName: (y) => `Passport_Visa_${y}.jpg` },
        ],
      },
      {
        section: 'Student Diversity',
        docs: [
          { category: 'Admission Records', fileType: 'excel', fileSize: '3.1 MB', fileName: (y) => `Diversity_Admission_${y}.xlsx` },
          { category: 'Student Records', fileType: 'excel', fileSize: '3.9 MB', fileName: (y) => `Diversity_Student_Records_${y}.xlsx` },
          { category: 'Medical Certificate', fileType: 'image', fileSize: '2.3 MB', fileName: (y) => `Medical_Certificates_${y}.jpg` },
          { category: 'Passport', fileType: 'image', fileSize: '1.5 MB', fileName: (y) => `Diversity_Passports_${y}.jpg` },
          { category: 'Self Declaration', fileType: 'pdf', fileSize: '1.2 MB', fileName: (y) => `Self_Declarations_${y}.pdf` },
        ],
      },
      {
        section: 'MOOC / Online Certifications',
        docs: [
          { category: 'Course Certificate', fileType: 'image', fileSize: '2.6 MB', fileName: (y) => `MOOC_Certificates_${y}.jpg` },
          { category: 'Score Card', fileType: 'excel', fileSize: '940 KB', fileName: (y) => `MOOC_Scores_${y}.xlsx` },
          { category: 'Platform Transcript', fileType: 'pdf', fileSize: '1.9 MB', fileName: (y) => `MOOC_Transcripts_${y}.pdf` },
        ],
      },
      {
        section: 'Scholarship & Freeship',
        docs: [
          { category: 'Scholarship/Freeship Letter', fileType: 'pdf', fileSize: '2.1 MB', fileName: (y) => `Scholarship_Letters_${y}.pdf` },
          { category: 'Disbursement Proof', fileType: 'pdf', fileSize: '1.4 MB', fileName: (y) => `Disbursement_Proof_${y}.pdf` },
          { category: 'Fee Receipt', fileType: 'image', fileSize: '2.0 MB', fileName: (y) => `Fee_Receipts_${y}.jpg` },
          { category: 'Sanction Order', fileType: 'pdf', fileSize: '1.1 MB', fileName: (y) => `Sanction_Orders_${y}.pdf` },
        ],
      },
    ],
  },
  {
    repository: 'Research',
    sections: [
      {
        section: 'Faculty Journal Publications',
        docs: [
          { category: 'Published Journal Paper (PDF)', fileType: 'pdf', fileSize: '3.4 MB', fileName: (y) => `Journal_Papers_${y}.pdf` },
          { category: 'Acceptance Letter', fileType: 'pdf', fileSize: '680 KB', fileName: (y) => `Journal_Acceptance_${y}.pdf` },
          { category: 'DOI Proof', fileType: 'pdf', fileSize: '420 KB', fileName: (y) => `DOI_Proof_${y}.pdf` },
          { category: 'Journal Cover Page', fileType: 'image', fileSize: '1.3 MB', fileName: (y) => `Journal_Covers_${y}.jpg` },
          { category: 'Indexing Proof', fileType: 'pdf', fileSize: '580 KB', fileName: (y) => `Indexing_Proof_${y}.pdf` },
        ],
      },
      {
        section: 'Faculty Conference Publications',
        docs: [
          { category: 'Conference Paper', fileType: 'pdf', fileSize: '2.5 MB', fileName: (y) => `Conference_Papers_${y}.pdf` },
          { category: 'Acceptance Letter', fileType: 'pdf', fileSize: '590 KB', fileName: (y) => `Conference_Acceptance_${y}.pdf` },
          { category: 'Conference Brochure', fileType: 'pdf', fileSize: '1.8 MB', fileName: (y) => `Conference_Brochure_${y}.pdf` },
          { category: 'Conference Certificate', fileType: 'image', fileSize: '1.6 MB', fileName: (y) => `Conference_Certificates_${y}.jpg` },
        ],
      },
      {
        section: 'Faculty Patents',
        docs: [
          { category: 'Patent Application', fileType: 'pdf', fileSize: '2.2 MB', fileName: (y) => `Patent_Applications_${y}.pdf` },
          { category: 'Filing Receipt', fileType: 'pdf', fileSize: '460 KB', fileName: (y) => `Patent_Filing_Receipts_${y}.pdf` },
          { category: 'Patent Publication', fileType: 'pdf', fileSize: '1.9 MB', fileName: (y) => `Patent_Publications_${y}.pdf` },
          { category: 'Grant Certificate', fileType: 'pdf', fileSize: '1.0 MB', fileName: (y) => `Patent_Grant_${y}.pdf` },
        ],
      },
      {
        section: 'Faculty Sponsored Projects',
        docs: [
          { category: 'Sanction Letter', fileType: 'pdf', fileSize: '1.4 MB', fileName: (y) => `Sanction_Letter_${y}.pdf` },
          { category: 'Project Proposal', fileType: 'pdf', fileSize: '3.6 MB', fileName: (y) => `Project_Proposal_${y}.pdf` },
          { category: 'Funding Approval', fileType: 'pdf', fileSize: '820 KB', fileName: (y) => `Funding_Approval_${y}.pdf` },
          { category: 'Agreement', fileType: 'pdf', fileSize: '1.7 MB', fileName: (y) => `Project_Agreement_${y}.pdf` },
          { category: 'Utilization Certificate', fileType: 'pdf', fileSize: '540 KB', fileName: (y) => `Utilization_Certificate_${y}.pdf` },
        ],
      },
      {
        section: 'Student Journal Publications',
        docs: [
          { category: 'Published Paper', fileType: 'pdf', fileSize: '2.3 MB', fileName: (y) => `Student_Journal_Papers_${y}.pdf` },
          { category: 'Acceptance Letter', fileType: 'pdf', fileSize: '610 KB', fileName: (y) => `Student_Journal_Acceptance_${y}.pdf` },
          { category: 'DOI Proof', fileType: 'pdf', fileSize: '400 KB', fileName: (y) => `Student_DOI_Proof_${y}.pdf` },
          { category: 'Journal Cover Page', fileType: 'image', fileSize: '1.2 MB', fileName: (y) => `Student_Journal_Covers_${y}.jpg` },
        ],
      },
    ],
  },
  {
    repository: 'Course',
    sections: [
      {
        section: 'Course File',
        docs: [
          { category: 'Course File (Syllabus)', fileType: 'pdf', fileSize: '3.8 MB', fileName: (y) => `Course_Files_${y}.pdf` },
          { category: 'Course File Report', fileType: 'pdf', fileSize: '1.5 MB', fileName: (y) => `Course_File_Report_${y}.pdf` },
        ],
      },
      {
        section: 'Course Outcomes',
        docs: [
          { category: 'Course Outcomes (COs)', fileType: 'excel', fileSize: '620 KB', fileName: (y) => `COs_${y}.xlsx` },
          { category: 'CO-PO Mapping', fileType: 'excel', fileSize: '740 KB', fileName: (y) => `COPO_Mapping_${y}.xlsx` },
          { category: 'CO-PSO Mapping', fileType: 'excel', fileSize: '680 KB', fileName: (y) => `COPSO_Mapping_${y}.xlsx` },
        ],
      },
      {
        section: 'Assessment Blueprint',
        docs: [
          { category: 'Assessment Blueprint', fileType: 'pdf', fileSize: '1.1 MB', fileName: (y) => `Assessment_Blueprint_${y}.pdf` },
          { category: 'Question Papers', fileType: 'pdf', fileSize: '2.6 MB', fileName: (y) => `Question_Papers_${y}.pdf` },
          { category: 'Marks Register', fileType: 'excel', fileSize: '1.8 MB', fileName: (y) => `Marks_Register_${y}.xlsx` },
        ],
      },
      {
        section: 'Attainment',
        docs: [
          { category: 'CO Attainment Report', fileType: 'pdf', fileSize: '980 KB', fileName: (y) => `CO_Attainment_${y}.pdf` },
          { category: 'PO Attainment Report', fileType: 'pdf', fileSize: '1.2 MB', fileName: (y) => `PO_Attainment_${y}.pdf` },
        ],
      },
    ],
  },
  {
    repository: 'Student Dev',
    sections: [
      {
        section: 'Academic Projects',
        docs: [
          { category: 'Project Proposal', fileType: 'pdf', fileSize: '2.2 MB', fileName: (y) => `Project_Proposals_${y}.pdf` },
          { category: 'Project Approval Letter', fileType: 'pdf', fileSize: '520 KB', fileName: (y) => `Project_Approvals_${y}.pdf` },
          { category: 'Final Report', fileType: 'pdf', fileSize: '4.1 MB', fileName: (y) => `Project_Final_Reports_${y}.pdf` },
          { category: 'Completion Certificate', fileType: 'image', fileSize: '1.7 MB', fileName: (y) => `Project_Completion_${y}.jpg` },
        ],
      },
      {
        section: 'Internships',
        docs: [
          { category: 'Offer Letter', fileType: 'pdf', fileSize: '1.3 MB', fileName: (y) => `Internship_Offers_${y}.pdf` },
          { category: 'Internship Completion Certificate', fileType: 'pdf', fileSize: '890 KB', fileName: (y) => `Internship_Certificates_${y}.pdf` },
          { category: 'Internship Report', fileType: 'pdf', fileSize: '2.8 MB', fileName: (y) => `Internship_Reports_${y}.pdf` },
        ],
      },
      {
        section: 'Placements',
        docs: [
          { category: 'Placement Drive Circular', fileType: 'pdf', fileSize: '640 KB', fileName: (y) => `Placement_Circulars_${y}.pdf` },
          { category: 'Selection List', fileType: 'excel', fileSize: '980 KB', fileName: (y) => `Selection_Lists_${y}.xlsx` },
          { category: 'Offer Letter', fileType: 'pdf', fileSize: '1.6 MB', fileName: (y) => `Placement_Offers_${y}.pdf` },
          { category: 'Appointment Letter', fileType: 'pdf', fileSize: '1.4 MB', fileName: (y) => `Placement_Appointments_${y}.pdf` },
        ],
      },
      {
        section: 'Higher Studies',
        docs: [
          { category: 'Admission Letter', fileType: 'pdf', fileSize: '1.1 MB', fileName: (y) => `HigherStudies_Admission_${y}.pdf` },
          { category: 'University Acceptance Letter', fileType: 'pdf', fileSize: '780 KB', fileName: (y) => `HigherStudies_Acceptance_${y}.pdf` },
          { category: 'Enrollment Certificate', fileType: 'image', fileSize: '1.2 MB', fileName: (y) => `HigherStudies_Enrollment_${y}.jpg` },
        ],
      },
      {
        section: 'Entrepreneurship',
        docs: [
          { category: 'Startup Registration Certificate', fileType: 'pdf', fileSize: '1.0 MB', fileName: (y) => `Startup_Registration_${y}.pdf` },
          { category: 'Incubation Letter', fileType: 'pdf', fileSize: '710 KB', fileName: (y) => `Incubation_Letters_${y}.pdf` },
          { category: 'Funding Letter', fileType: 'pdf', fileSize: '660 KB', fileName: (y) => `Funding_Letters_${y}.pdf` },
        ],
      },
      {
        section: 'Professional Memberships',
        docs: [
          { category: 'Membership Certificate', fileType: 'image', fileSize: '1.5 MB', fileName: (y) => `Membership_Certificates_${y}.jpg` },
          { category: 'Membership Card', fileType: 'image', fileSize: '920 KB', fileName: (y) => `Membership_Cards_${y}.jpg` },
          { category: 'Membership Renewal Proof', fileType: 'pdf', fileSize: '480 KB', fileName: (y) => `Membership_Renewals_${y}.pdf` },
        ],
      },
      {
        section: 'Student Chapters',
        docs: [
          { category: 'Chapter Approval Letter', fileType: 'pdf', fileSize: '590 KB', fileName: (y) => `Chapter_Approvals_${y}.pdf` },
          { category: 'Chapter Registration Certificate', fileType: 'pdf', fileSize: '830 KB', fileName: (y) => `Chapter_Registrations_${y}.pdf` },
          { category: 'Annual Activity Report', fileType: 'pdf', fileSize: '2.4 MB', fileName: (y) => `Chapter_Activity_Reports_${y}.pdf` },
        ],
      },
      {
        section: 'Student Clubs',
        docs: [
          { category: 'Club Constitution', fileType: 'pdf', fileSize: '560 KB', fileName: (y) => `Club_Constitutions_${y}.pdf` },
          { category: 'Approval Letter', fileType: 'pdf', fileSize: '510 KB', fileName: (y) => `Club_Approvals_${y}.pdf` },
          { category: 'Activity Calendar', fileType: 'excel', fileSize: '430 KB', fileName: (y) => `Club_Calendars_${y}.xlsx` },
        ],
      },
      {
        section: 'Professional Events',
        docs: [
          { category: 'Circular', fileType: 'pdf', fileSize: '470 KB', fileName: (y) => `Event_Circulars_${y}.pdf` },
          { category: 'Brochure', fileType: 'pdf', fileSize: '1.9 MB', fileName: (y) => `Event_Brochures_${y}.pdf` },
          { category: 'Participation Certificate', fileType: 'image', fileSize: '2.3 MB', fileName: (y) => `Event_Participation_${y}.jpg` },
          { category: 'Event Report', fileType: 'pdf', fileSize: '1.6 MB', fileName: (y) => `Event_Reports_${y}.pdf` },
        ],
      },
      {
        section: 'Competitions & Hackathons',
        docs: [
          { category: 'Competition Notification', fileType: 'pdf', fileSize: '420 KB', fileName: (y) => `Competition_Notifications_${y}.pdf` },
          { category: 'Participation Certificate', fileType: 'image', fileSize: '2.0 MB', fileName: (y) => `Competition_Participation_${y}.jpg` },
          { category: 'Winner Certificate', fileType: 'image', fileSize: '1.8 MB', fileName: (y) => `Competition_Winners_${y}.jpg` },
        ],
      },
      {
        section: 'MOOCs / SWAYAM / NPTEL',
        docs: [
          { category: 'Completion Certificate', fileType: 'image', fileSize: '2.5 MB', fileName: (y) => `MOOC_Completion_${y}.jpg` },
          { category: 'Score Card', fileType: 'excel', fileSize: '860 KB', fileName: (y) => `MOOC_Scores_${y}.xlsx` },
          { category: 'Transcript', fileType: 'pdf', fileSize: '1.4 MB', fileName: (y) => `MOOC_Transcripts_${y}.pdf` },
        ],
      },
      {
        section: 'Workshops & Guest Lectures',
        docs: [
          { category: 'Approval Letter', fileType: 'pdf', fileSize: '560 KB', fileName: (y) => `Workshop_Approvals_${y}.pdf` },
          { category: 'Brochure', fileType: 'pdf', fileSize: '1.7 MB', fileName: (y) => `Workshop_Brochures_${y}.pdf` },
          { category: 'Attendance', fileType: 'excel', fileSize: '1.3 MB', fileName: (y) => `Workshop_Attendance_${y}.xlsx` },
          { category: 'Event Report', fileType: 'pdf', fileSize: '1.4 MB', fileName: (y) => `Workshop_Reports_${y}.pdf` },
        ],
      },
      {
        section: 'Industrial Visits',
        docs: [
          { category: 'Approval Letter', fileType: 'pdf', fileSize: '530 KB', fileName: (y) => `IndustrialVisit_Approvals_${y}.pdf` },
          { category: 'Company Permission Letter', fileType: 'pdf', fileSize: '610 KB', fileName: (y) => `IndustrialVisit_Permissions_${y}.pdf` },
          { category: 'Visit Report', fileType: 'pdf', fileSize: '2.1 MB', fileName: (y) => `IndustrialVisit_Reports_${y}.pdf` },
        ],
      },
      {
        section: 'NSS Activities',
        docs: [
          { category: 'Approval Letter', fileType: 'pdf', fileSize: '490 KB', fileName: (y) => `NSS_Approvals_${y}.pdf` },
          { category: 'Activity Report', fileType: 'pdf', fileSize: '1.9 MB', fileName: (y) => `NSS_Reports_${y}.pdf` },
          { category: 'Geo-tagged Photos', fileType: 'image', fileSize: '3.4 MB', fileName: (y) => `NSS_Photos_${y}.jpg` },
        ],
      },
      {
        section: 'NCC Activities',
        docs: [
          { category: 'Camp Order', fileType: 'pdf', fileSize: '460 KB', fileName: (y) => `NCC_Camp_Orders_${y}.pdf` },
          { category: 'Camp Certificate', fileType: 'image', fileSize: '1.6 MB', fileName: (y) => `NCC_Camp_Certificates_${y}.jpg` },
          { category: 'Activity Report', fileType: 'pdf', fileSize: '1.8 MB', fileName: (y) => `NCC_Reports_${y}.pdf` },
        ],
      },
    ],
  },
  {
    repository: 'Infrastructure',
    sections: [
      {
        section: 'Classrooms',
        docs: [
          { category: 'Classroom Photographs', fileType: 'image', fileSize: '4.2 MB', fileName: (y) => `Classroom_Photos_${y}.jpg` },
        ],
      },
      {
        section: 'Tutorial Rooms',
        docs: [
          { category: 'Geo-tagged Photos', fileType: 'image', fileSize: '3.8 MB', fileName: (y) => `TutorialRoom_Photos_${y}.jpg` },
        ],
      },
      {
        section: 'Laboratories',
        docs: [
          { category: 'Laboratory Layouts', fileType: 'pdf', fileSize: '2.5 MB', fileName: (y) => `Lab_Layouts_${y}.pdf` },
        ],
      },
      {
        section: 'Staff Rooms',
        docs: [
          { category: 'Geo-tagged Photos', fileType: 'image', fileSize: '3.1 MB', fileName: (y) => `StaffRoom_Photos_${y}.jpg` },
        ],
      },
      {
        section: 'Faculty Cabins',
        docs: [
          { category: 'Geo-tagged Photos', fileType: 'image', fileSize: '3.5 MB', fileName: (y) => `FacultyCabin_Photos_${y}.jpg` },
        ],
      },
      {
        section: 'HOD Cabin',
        docs: [
          { category: 'Geo-tagged Photos', fileType: 'image', fileSize: '2.9 MB', fileName: (y) => `HODCabin_Photos_${y}.jpg` },
        ],
      },
      {
        section: 'Smart Classrooms',
        docs: [
          { category: 'Installation Reports', fileType: 'pdf', fileSize: '1.7 MB', fileName: (y) => `SmartClassroom_Installations_${y}.pdf` },
        ],
      },
      {
        section: 'ICT Enabled Classrooms',
        docs: [
          { category: 'Installation Reports', fileType: 'pdf', fileSize: '1.8 MB', fileName: (y) => `ICTClassroom_Installations_${y}.pdf` },
        ],
      },
      {
        section: 'Lab Equipment',
        docs: [
          { category: 'Equipment Invoices', fileType: 'pdf', fileSize: '3.9 MB', fileName: (y) => `Equipment_Invoices_${y}.pdf` },
        ],
      },
      {
        section: 'Software & Licenses',
        docs: [
          { category: 'Software Licenses', fileType: 'excel', fileSize: '1.2 MB', fileName: (y) => `Software_Licenses_${y}.xlsx` },
        ],
      },
      {
        section: 'Department Assets',
        docs: [
          { category: 'Asset Verification', fileType: 'excel', fileSize: '1.5 MB', fileName: (y) => `Asset_Verification_${y}.xlsx` },
        ],
      },
    ],
  },
  {
    repository: 'Alumni',
    sections: [
      {
        section: 'Alumni Details',
        docs: [
          { category: 'Graduation Register', fileType: 'excel', fileSize: '3.2 MB', fileName: (y) => `Graduation_Register_${y}.xlsx` },
          { category: 'Alumni Registration Form', fileType: 'excel', fileSize: '2.4 MB', fileName: (y) => `Alumni_Registration_${y}.xlsx` },
          { category: 'Identity Verification', fileType: 'image', fileSize: '2.7 MB', fileName: (y) => `Alumni_Identity_${y}.jpg` },
        ],
      },
      {
        section: 'Employment & Career',
        docs: [
          { category: 'Employment Letter', fileType: 'pdf', fileSize: '1.3 MB', fileName: (y) => `Alumni_Employment_${y}.pdf` },
          { category: 'LinkedIn Profile', fileType: 'pdf', fileSize: '580 KB', fileName: (y) => `Alumni_LinkedIn_${y}.pdf` },
          { category: 'Employer Verification', fileType: 'pdf', fileSize: '690 KB', fileName: (y) => `Alumni_Employer_Verification_${y}.pdf` },
        ],
      },
      {
        section: 'Higher Education',
        docs: [
          { category: 'Admission Letter', fileType: 'pdf', fileSize: '1.0 MB', fileName: (y) => `Alumni_HigherEd_Admission_${y}.pdf` },
          { category: 'Degree Certificate', fileType: 'image', fileSize: '1.9 MB', fileName: (y) => `Alumni_HigherEd_Degree_${y}.jpg` },
          { category: 'Student ID Card', fileType: 'image', fileSize: '1.1 MB', fileName: (y) => `Alumni_HigherEd_ID_${y}.jpg` },
        ],
      },
      {
        section: 'Alumni Engagement',
        docs: [
          { category: 'Invitation', fileType: 'pdf', fileSize: '540 KB', fileName: (y) => `Alumni_Invitations_${y}.pdf` },
          { category: 'Attendance', fileType: 'excel', fileSize: '820 KB', fileName: (y) => `Alumni_Attendance_${y}.xlsx` },
          { category: 'Photographs', fileType: 'image', fileSize: '3.6 MB', fileName: (y) => `Alumni_Photos_${y}.jpg` },
          { category: 'Feedback', fileType: 'excel', fileSize: '640 KB', fileName: (y) => `Alumni_Feedback_${y}.xlsx` },
        ],
      },
      {
        section: 'Alumni Contributions',
        docs: [
          { category: 'Donation Receipt', fileType: 'pdf', fileSize: '720 KB', fileName: (y) => `Donation_Receipts_${y}.pdf` },
          { category: 'Acknowledgement Letter', fileType: 'pdf', fileSize: '510 KB', fileName: (y) => `Donation_Acknowledgements_${y}.pdf` },
          { category: 'Photographs', fileType: 'image', fileSize: '2.2 MB', fileName: (y) => `Contribution_Photos_${y}.jpg` },
        ],
      },
      {
        section: 'Alumni Mentorship',
        docs: [
          { category: 'Mentorship Plan', fileType: 'pdf', fileSize: '1.2 MB', fileName: (y) => `Mentorship_Plans_${y}.pdf` },
          { category: 'Attendance', fileType: 'excel', fileSize: '760 KB', fileName: (y) => `Mentorship_Attendance_${y}.xlsx` },
          { category: 'Feedback', fileType: 'excel', fileSize: '590 KB', fileName: (y) => `Mentorship_Feedback_${y}.xlsx` },
          { category: 'Completion Report', fileType: 'pdf', fileSize: '1.5 MB', fileName: (y) => `Mentorship_Completion_${y}.pdf` },
        ],
      },
      {
        section: 'Alumni Achievements',
        docs: [
          { category: 'Award Certificate', fileType: 'image', fileSize: '1.8 MB', fileName: (y) => `Alumni_Awards_${y}.jpg` },
          { category: 'News Article', fileType: 'pdf', fileSize: '1.4 MB', fileName: (y) => `Alumni_News_${y}.pdf` },
          { category: 'Photographs', fileType: 'image', fileSize: '2.6 MB', fileName: (y) => `Achievement_Photos_${y}.jpg` },
        ],
      },
      {
        section: 'Alumni Chapters',
        docs: [
          { category: 'Chapter Registration', fileType: 'pdf', fileSize: '780 KB', fileName: (y) => `Alumni_Chapter_Registration_${y}.pdf` },
          { category: 'Meeting Minutes', fileType: 'pdf', fileSize: '1.3 MB', fileName: (y) => `Alumni_Chapter_Minutes_${y}.pdf` },
          { category: 'Photographs', fileType: 'image', fileSize: '2.0 MB', fileName: (y) => `Alumni_Chapter_Photos_${y}.jpg` },
        ],
      },
      {
        section: 'Alumni Events',
        docs: [
          { category: 'Event Brochure', fileType: 'pdf', fileSize: '1.6 MB', fileName: (y) => `Alumni_Event_Brochures_${y}.pdf` },
          { category: 'Attendance', fileType: 'excel', fileSize: '980 KB', fileName: (y) => `Alumni_Event_Attendance_${y}.xlsx` },
          { category: 'Photographs', fileType: 'image', fileSize: '3.3 MB', fileName: (y) => `Alumni_Event_Photos_${y}.jpg` },
          { category: 'Event Report', fileType: 'pdf', fileSize: '1.7 MB', fileName: (y) => `Alumni_Event_Reports_${y}.pdf` },
        ],
      },
    ],
  },
];

// Status mix for the current academic year (2025-26), keyed by section name.
const CURRENT_YEAR_STATUS: Record<string, EvidenceItem['status'][]> = {
  'Academic Calendar': ['approved', 'approved', 'pending', 'rejected', 'changes-requested'],
  'Value Added Courses': ['pending', 'pending', 'approved', 'approved'],
  'Add-on Programs': ['pending', 'pending', 'pending', 'approved'],
  'Academic Timetable': ['approved', 'pending', 'pending'],
  'Faculty Profile': ['approved', 'approved', 'pending'],
  'Qualification': ['pending', 'pending', 'approved'],
  'Employment Information': ['approved', 'approved', 'pending', 'changes-requested'],
  'Professor of Practice': ['pending', 'pending', 'pending'],
  'Student Profile': ['approved', 'approved', 'approved', 'pending', 'pending'],
  'Admission Info': ['approved', 'pending', 'pending'],
  'Student Diversity': ['approved', 'pending', 'pending', 'pending', 'approved'],
  'MOOC / Online Certifications': ['pending', 'approved', 'changes-requested'],
  'Scholarship & Freeship': ['approved', 'approved', 'pending', 'pending'],
  'Faculty Journal Publications': ['pending', 'pending', 'approved', 'approved', 'pending'],
  'Faculty Conference Publications': ['approved', 'approved', 'pending', 'pending'],
  'Faculty Patents': ['approved', 'pending', 'pending', 'changes-requested'],
  'Faculty Sponsored Projects': ['pending', 'pending', 'pending', 'pending', 'approved'],
  'Student Journal Publications': ['approved', 'pending', 'pending', 'pending'],
  // Course
  'Course File': ['pending', 'approved'],
  'Course Outcomes': ['pending', 'pending', 'approved'],
  'Assessment Blueprint': ['approved', 'pending', 'changes-requested'],
  'Attainment': ['pending', 'approved'],
  // Student Dev & Outcomes
  'Academic Projects': ['pending', 'approved', 'pending', 'approved'],
  'Internships': ['pending', 'pending', 'approved'],
  'Placements': ['approved', 'pending', 'pending', 'approved'],
  'Higher Studies': ['approved', 'pending', 'pending'],
  'Entrepreneurship': ['pending', 'approved', 'changes-requested'],
  'Professional Memberships': ['approved', 'pending', 'pending'],
  'Student Chapters': ['pending', 'pending', 'approved'],
  'Student Clubs': ['pending', 'approved', 'pending'],
  'Professional Events': ['pending', 'pending', 'approved', 'approved'],
  'Competitions & Hackathons': ['pending', 'approved', 'changes-requested'],
  'MOOCs / SWAYAM / NPTEL': ['approved', 'pending', 'pending'],
  'Workshops & Guest Lectures': ['pending', 'pending', 'pending', 'approved'],
  'Industrial Visits': ['approved', 'pending', 'pending'],
  'NSS Activities': ['pending', 'approved', 'changes-requested'],
  'NCC Activities': ['pending', 'pending', 'approved'],
  // Infrastructure
  'Classrooms': ['approved'],
  'Tutorial Rooms': ['pending'],
  'Laboratories': ['approved'],
  'Staff Rooms': ['pending'],
  'Faculty Cabins': ['pending'],
  'HOD Cabin': ['approved'],
  'Smart Classrooms': ['pending'],
  'ICT Enabled Classrooms': ['approved'],
  'Lab Equipment': ['pending'],
  'Software & Licenses': ['pending'],
  'Department Assets': ['pending'],
  // Alumni
  'Alumni Details': ['pending', 'approved', 'pending'],
  'Employment & Career': ['pending', 'pending', 'approved'],
  'Higher Education': ['approved', 'pending', 'pending'],
  'Alumni Engagement': ['pending', 'approved', 'pending', 'pending'],
  'Alumni Contributions': ['approved', 'pending', 'pending'],
  'Alumni Mentorship': ['pending', 'pending', 'approved', 'changes-requested'],
  'Alumni Achievements': ['approved', 'pending', 'pending'],
  'Alumni Chapters': ['pending', 'approved', 'pending'],
  'Alumni Events': ['pending', 'pending', 'approved', 'approved'],
};

// Pre-filled HOD review comments for documents that were rejected / sent back.
const REVIEW_NOTES: Record<string, { note: string; date: string }> = {
  'NAAC Evidence': { note: 'Document is dated 2023 — please upload the current NAAC evidence for the selected academic year.', date: '2025-01-10' },
  'Department Academic Planner': { note: 'Planner is missing semester-break details. Please update and resubmit.', date: '2025-01-09' },
  'AICTE Records': { note: 'Faculty IDs are missing for 4 members. Cross-check with the AICTE portal.', date: '2025-01-11' },
  'Platform Transcript': { note: 'Transcripts are incomplete — only 60% of enrolled students are covered.', date: '2025-01-08' },
  'Grant Certificate': { note: 'Grant certificate belongs to a different inventor. Please verify and re-upload.', date: '2025-01-07' },
  'Assessment Blueprint': { note: 'Blueprint does not map assessment questions to COs. Please add the mapping table.', date: '2025-01-12' },
  'Funding Letter': { note: 'Sanction amount differs from the MOU. Please upload the revised letter.', date: '2025-01-10' },
  'Winner Certificate': { note: 'Certificate is not legible — please upload a higher resolution scan.', date: '2025-01-11' },
  'Mentorship Plan': { note: 'Mentee list does not match the student register. Please verify and resubmit.', date: '2025-01-08' },
};

export const evidenceData: EvidenceItem[] = buildEvidence('2025-26');

const acc = (repo: string): GapAccreditation => REPO_ACCREDITATION[repo] ?? DEFAULT_ACCREDITATION;

// Builds accreditation impact for a gap, inheriting the repository-level criterion
// names and overriding the impact text where the gap is more specific.
const gapAcc = (repo: string, naac?: string, nba?: string, nirf?: string): GapAccreditation => ({
  naac: { ...acc(repo).naac, impact: naac ?? acc(repo).naac.impact },
  nba: { ...acc(repo).nba, impact: nba ?? acc(repo).nba.impact },
  nirf: { ...acc(repo).nirf, impact: nirf ?? acc(repo).nirf.impact },
});

// Identified gaps are organized by the same 8 repositories (and their evidence
// sections) as the Evidence Review and Approval Queue.
export const gapAnalysisData: GapItem[] = [
  // ---- Academic Repository ----
  { id: '1', category: 'Curriculum Revision', description: 'BoS minutes for 2024 curriculum revision not uploaded', repository: 'Academic', section: 'Academic Calendar', severity: 'medium', impact: 'BoS minutes missing — curriculum revision process lacks approval evidence', recommendation: 'Upload BoS meeting minutes and approval letters', accreditation: gapAcc('Academic', 'BoS minutes evidence NAAC Criterion 1.1 (Curriculum Design & Development) approvals.', 'Curriculum revision evidence is assessed in NBA Criterion 2 (Program Curriculum) SAR.', 'Curriculum quality contributes to NIRF TLR — missing approvals weaken the evidence trail.') },
  { id: '2', category: 'Academic Calendar', description: 'Academic Calendar Report for 2025-26 not uploaded', repository: 'Academic', section: 'Academic Calendar', severity: 'low', impact: 'Calendar report missing — semester planning evidence incomplete', recommendation: 'Upload the approved Academic Calendar Report', accreditation: gapAcc('Academic', 'Calendar planning evidence feeds NAAC Criterion 1.2 (Academic Flexibility) documentation.', 'Calendar adherence is reviewed under NBA Criterion 2 (Teaching-Learning Processes).', 'Semester scheduling supports NIRF TLR metric verification.') },
  { id: '3', category: 'Supporting Documents', description: '8 documents have expired validity', repository: 'Academic', section: 'Value Added Courses', severity: 'medium', impact: '8 evidence documents have expired validity — repositories hold invalid evidence', recommendation: 'Renew expired documents and re-upload', accreditation: gapAcc('Academic', 'Invalid evidence weakens NAAC criterion scores wherever the document is cited (e.g. C1, C4).', 'Expired documents weaken NBA SAR evidence verification across several criteria.', 'Stale evidence undermines NIRF TLR/RP claims during data verification.') },
  // ---- Course Repository ----
  { id: '4', category: 'CO-PO Mapping', description: 'CO-PO mapping pending for 6 courses', repository: 'Course', section: 'Course Outcomes', severity: 'high', impact: 'CO-PO mapping incomplete for 6 courses — attainment cannot be computed', recommendation: 'Complete CO-PO mapping for pending courses', accreditation: gapAcc('Course', 'Incomplete CO-PO mapping weakens NAAC Criterion 2.2 (Learning Outcomes) evidence.', 'CO-PO mapping is the core of NBA Criterion 3 (COs and POs) — gap directly affects it.', 'Outcome-based teaching feeds NIRF GO — incomplete mapping lowers the outcome score.') },
  { id: '5', category: 'Assessment Blueprint', description: 'Assessment blueprints missing for 5 courses', repository: 'Course', section: 'Assessment Blueprint', severity: 'medium', impact: 'Blueprints missing — question-paper & CO coverage cannot be verified', recommendation: 'Prepare assessment blueprints for the 5 pending courses', accreditation: gapAcc('Course', 'Assessment design evidence feeds NAAC Criterion 2.3 (Teacher Profile & Quality) assessment metrics.', 'Blueprint-to-CO coverage is verified under NBA Criterion 3 (CO-PO attainment).', 'Assessment quality contributes to NIRF GO outcome measurement.') },
  // ---- Faculty Repository ----
  { id: '6', category: 'Faculty Qualifications', description: 'PhD certificates missing for 6 faculty members', repository: 'Faculty', section: 'Qualification', severity: 'medium', impact: 'Qualification evidence incomplete — PhD claims unverified for 6 faculty', recommendation: 'Collect and upload PhD certificates', accreditation: gapAcc('Faculty', 'Faculty qualification evidence feeds NAAC Criterion 2.3 (Teacher Profile & Quality).', 'Faculty qualification data is verified under NBA Criterion 5 (Faculty Information).', 'Faculty quality metrics feed NIRF TLR (Faculty-student ratio & qualifications).') },
  { id: '7', category: 'Professional Development', description: 'FDP/STTP participation evidence incomplete for 12 faculty', repository: 'Faculty', section: 'Professor of Practice', severity: 'low', impact: 'Faculty development evidence incomplete — development metrics understated', recommendation: 'Collect FDP/STTP certificates from faculty', accreditation: gapAcc('Faculty', 'Faculty development evidence feeds NAAC Criterion 3.5 (Faculty Development Activities).', 'Development activities are reported under NBA Criterion 5 (Faculty Contributions).', 'Faculty development supports NIRF TLR teaching-quality metrics.') },
  // ---- Student Repository ----
  { id: '8', category: 'Student Results', description: 'Semester 6 results for 2023-24 batch not uploaded', repository: 'Student', section: 'Student Profile', severity: 'high', impact: 'Result data gap blocks pass-percentage & progression calculations for 2023-24 cohort', recommendation: 'Coordinate with Exam section for results', accreditation: gapAcc('Student', 'Result gaps affect NAAC Criterion 2.2 (Student Performance & Learning Outcomes) and pass percentage.', 'Pass percentage is central to NBA Criterion 4 (Students\' Performance) — gap directly lowers it.', 'Graduation & pass rates feed NIRF GO (20%) — missing results understate the outcome score.') },
  { id: '9', category: 'MOOC Certifications', description: 'MOOC certificates only 40% uploaded', repository: 'Student', section: 'MOOC / Online Certifications', severity: 'high', impact: 'MOOC repository 40% complete — online-learning & capacity-building metrics understated', recommendation: 'Collect MOOC certificates from faculty and students', accreditation: gapAcc('Student', 'MOOC/capacity-building evidence feeds NAAC Criterion 2.5 (ICT & Online Learning).', 'Faculty/student development evidence contributes to NBA Criterion 5 & 9 verification.', 'Online-learning and faculty development feed NIRF TLR & GO metrics.') },
  // ---- Research Repository ----
  { id: '10', category: 'Faculty Publications', description: '15 faculty members have no publications in last 2 years', repository: 'Research', section: 'Faculty Journal Publications', severity: 'critical', impact: '15 of 45 faculty have no indexed publication since 2023 — depresses research output & citation metrics', recommendation: 'Encourage faculty to publish in indexed journals', accreditation: gapAcc('Research', 'Low publication output depresses NAAC Criterion 3.4 (Research Publications & Citations) score.', 'Weak publication record lowers NBA Criterion 5 (Faculty Contributions — Publications) score.', 'Publications & citations feed NIRF RP (30%) — low output directly reduces the research score.') },
  { id: '11', category: 'Research Evidence', description: 'Grant sanction letters missing for 3 funded projects', repository: 'Research', section: 'Faculty Sponsored Projects', severity: 'high', impact: '3 sponsored projects lack sanction letters — evidence incomplete for research funding claims', recommendation: 'Request PIs to upload sanction letters', accreditation: gapAcc('Research', 'Missing sanction letters weaken NAAC Criterion 3.2 (Research Funding & Support) evidence.', 'Sponsored project evidence gaps affect NBA Criterion 5 (Sponsored Research) verification.', 'Sponsored research metrics feed NIRF RP — missing evidence lowers the claimable score.') },
  { id: '12', category: 'Patent Evidence', description: 'Patent filing receipts missing for 2 applications', repository: 'Research', section: 'Faculty Patents', severity: 'low', impact: 'Patent evidence incomplete — filing claims cannot be verified', recommendation: 'Collect filing receipts from inventors', accreditation: gapAcc('Research', 'Patent evidence feeds NAAC Criterion 3.4 (Research Publications & Citations — IP).', 'Patents are verified under NBA Criterion 5 (Faculty Contributions).', 'Patents & IP feed NIRF RP metrics.') },
  // ---- Student Dev & Outcomes Repository ----
  { id: '13', category: 'Placement Data', description: 'Placement records incomplete for 2022-23 batch', repository: 'Student Dev', section: 'Placements', severity: 'medium', impact: 'Placement records for 2022-23 batch incomplete — understates placement & higher-studies outcomes', recommendation: 'Verify with TPO office for complete data', accreditation: gapAcc('Student Dev', 'Placement evidence feeds NAAC Criterion 5.1 (Student Progression — Placement) score.', 'Placement outcomes are assessed in NBA Criterion 9 (Student Support Systems) evidence.', 'Placements & progression feed NIRF GO — incomplete data reduces the measured outcome.') },
  { id: '14', category: 'Internship Evidence', description: 'Internship completion certificates missing for 30% of students', repository: 'Student Dev', section: 'Internships', severity: 'medium', impact: 'Internship certificates missing — experiential learning metrics understated', recommendation: 'Collect internship completion certificates', accreditation: gapAcc('Student Dev', 'Internship evidence feeds NAAC Criterion 5.1 (Student Progression — Experiential Learning).', 'Internship support is assessed under NBA Criterion 9 (Student Support Systems).', 'Internships & placements feed NIRF GO outcome metrics.') },
  // ---- Infrastructure Repository ----
  { id: '15', category: 'Lab Equipment', description: 'Equipment invoices missing for 3 laboratories', repository: 'Infrastructure', section: 'Lab Equipment', severity: 'medium', impact: 'Equipment evidence incomplete — lab infrastructure claims unverifiable', recommendation: 'Collect and upload equipment invoices', accreditation: gapAcc('Infrastructure', 'Equipment evidence feeds NAAC Criterion 4.1 (Physical Facilities) verification.', 'Laboratory equipment is verified under NBA Criterion 6 (Facilities & Technical Support).', 'Lab infrastructure supports NIRF TLR resource metrics.') },
  { id: '16', category: 'Software Licenses', description: 'Software license proof expired for 5 packages', repository: 'Infrastructure', section: 'Software & Licenses', severity: 'low', impact: 'License evidence expired — software availability claims invalid', recommendation: 'Renew and re-upload software licenses', accreditation: gapAcc('Infrastructure', 'ICT resource evidence feeds NAAC Criterion 4.2 (Library & ICT Facilities).', 'Software availability is checked under NBA Criterion 6 (Facilities).', 'ICT resources feed NIRF TLR metrics.') },
  // ---- Alumni Repository ----
  { id: '17', category: 'Alumni Data', description: 'Alumni tracking data missing for 2019-20 batch', repository: 'Alumni', section: 'Alumni Details', severity: 'low', impact: 'Alumni database incomplete for 2019-20 batch — weakens engagement & alumni metrics', recommendation: 'Conduct alumni survey for missing batch', accreditation: gapAcc('Alumni', 'Alumni engagement evidence feeds NAAC Criterion 5.1 (Alumni Contribution & Engagement).', 'Alumni outcomes contribute to NBA Criterion 9 (Student Support Systems) evidence.', 'Alumni engagement feeds NIRF OI — incomplete data understates outreach metrics.') },
  { id: '18', category: 'Alumni Engagement', description: 'Alumni engagement evidence sparse — only 2 events documented', repository: 'Alumni', section: 'Alumni Engagement', severity: 'low', impact: 'Alumni engagement under-documented — contribution & outreach metrics weak', recommendation: 'Document alumni events and contributions', accreditation: gapAcc('Alumni', 'Alumni activity evidence feeds NAAC Criterion 5.1 (Alumni Contribution).', 'Alumni engagement is reported under NBA Criterion 9.', 'Alumni outreach feeds NIRF OI metrics.') },
];

export const readinessData: ReadinessData[] = [
  { repository: 'Academic', weight: 15, dataCompletion: 92, evidenceCompletion: 88, verification: 85, approval: 80 },
  { repository: 'Course', weight: 10, dataCompletion: 78, evidenceCompletion: 70, verification: 66, approval: 60 },
  { repository: 'Faculty', weight: 15, dataCompletion: 88, evidenceCompletion: 82, verification: 78, approval: 75 },
  { repository: 'Student', weight: 15, dataCompletion: 95, evidenceCompletion: 91, verification: 89, approval: 87 },
  { repository: 'Research', weight: 10, dataCompletion: 72, evidenceCompletion: 65, verification: 60, approval: 55 },
  { repository: 'Student Dev', weight: 10, dataCompletion: 81, evidenceCompletion: 74, verification: 70, approval: 65 },
  { repository: 'Infrastructure', weight: 5, dataCompletion: 69, evidenceCompletion: 60, verification: 55, approval: 48 },
  { repository: 'Alumni', weight: 5, dataCompletion: 61, evidenceCompletion: 55, verification: 48, approval: 42 },
  { repository: 'Evidence', weight: 10, dataCompletion: 82, evidenceCompletion: 78, verification: 74, approval: 70 },
  { repository: 'Verification', weight: 5, dataCompletion: 78, evidenceCompletion: 74, verification: 70, approval: 66 },
];

export const analyticsData: AnalyticsData = {
  facultyCount: 45,
  students: 720,
  research: 38,
  placements: 85,
  passPercentage: 92.5,
  publications: 127,
  patents: 8,
  projects: 15,
};

export const yearlyTrends: YearlyTrend[] = [
  { year: '2019-20', academic: 50, faculty: 45, student: 55, research: 30, alumni: 18 },
  { year: '2020-21', academic: 58, faculty: 52, student: 62, research: 38, alumni: 24 },
  { year: '2021-22', academic: 65, faculty: 60, student: 70, research: 45, alumni: 30 },
  { year: '2022-23', academic: 72, faculty: 68, student: 78, research: 52, alumni: 38 },
  { year: '2023-24', academic: 80, faculty: 75, student: 85, research: 60, alumni: 45 },
  { year: '2024-25', academic: 87, faculty: 83, student: 90, research: 68, alumni: 55 },
  { year: '2025-26', academic: 92, faculty: 88, student: 95, research: 72, alumni: 61 },
];

export const activityTimelineData: ActivityItem[] = [
  { id: '1', type: 'submitted', description: 'Value Added Courses data submitted for review', user: 'Dr. Priya Sharma', timestamp: '2024-12-15T10:30:00Z', repository: 'Academic' },
  { id: '2', type: 'approved', description: 'Student Results 2024 approved by HOD', user: 'Dr. Suresh Patil (HOD)', timestamp: '2024-12-15T09:15:00Z', repository: 'Student' },
  { id: '3', type: 'uploaded', description: 'Research grant sanction letter uploaded', user: 'Dr. Amit Patel', timestamp: '2024-12-14T16:45:00Z', repository: 'Research' },
  { id: '4', type: 'rejected', description: 'MOOC completion report rejected - incomplete data', user: 'Dr. Suresh Patil (HOD)', timestamp: '2024-12-14T14:20:00Z', repository: 'Academic' },
  { id: '5', type: 'commented', description: 'Review comment added on faculty FDP certificates', user: 'Dr. Suresh Patil (HOD)', timestamp: '2024-12-14T11:00:00Z', repository: 'Faculty' },
  { id: '6', type: 'returned', description: 'Alumni engagement data returned for corrections', user: 'Dr. Suresh Patil (HOD)', timestamp: '2024-12-13T15:30:00Z', repository: 'Alumni' },
  { id: '7', type: 'verified', description: 'Faculty publications data verified', user: 'Dr. Suresh Patil (HOD)', timestamp: '2024-12-13T10:00:00Z', repository: 'Faculty' },
  { id: '8', type: 'submitted', description: 'Patent filing certificates submitted', user: 'Dr. Amit Patel', timestamp: '2024-12-12T14:00:00Z', repository: 'Research' },
  { id: '9', type: 'approved', description: 'Curriculum revision documents approved', user: 'Dr. Suresh Patil (HOD)', timestamp: '2024-12-12T09:30:00Z', repository: 'Academic' },
  { id: '10', type: 'uploaded', description: 'Placement data for 2024 batch uploaded', user: 'Mr. Vikram Singh', timestamp: '2024-12-11T16:00:00Z', repository: 'Alumni' },
];

export const aiInsights: AiInsight[] = [
  { id: '1', title: 'Missing Evidence Alert', description: 'Research Repository has 12 records without supporting evidence. This may affect NAAC Criterion 3 score.', type: 'warning' },
  { id: '2', title: 'Completion Prediction', description: 'At current pace, full repository completion expected by March 2025. Accelerate Research & Alumni sections.', type: 'info' },
  { id: '3', title: 'Faculty Publication Gap', description: '33% of faculty have zero publications in indexed journals. Target: minimum 1 publication per faculty per year.', type: 'critical' },
  { id: '4', title: 'Department Benchmark', description: 'Your department ranks 3rd out of 8 departments in overall repository readiness. Top department: Electronics at 94%.', type: 'success' },
  { id: '5', title: 'Readiness Forecast', description: 'Based on current trends, department readiness will reach 90% by February 2025 if current submission rate continues.', type: 'info' },
];

export const reportTypes = [
  { id: '1', name: 'Department Repository Report', description: 'Complete overview of all repository data with completion metrics', icon: 'FileText' },
  { id: '2', name: 'Evidence Report', description: 'Status of all uploaded evidence documents with approval status', icon: 'FileCheck' },
  { id: '3', name: 'Pending Tasks Report', description: 'All pending reviews, approvals, and corrections needed', icon: 'Clock' },
  { id: '4', name: 'Gap Analysis Report', description: 'Identified gaps in repository data with recommendations', icon: 'AlertTriangle' },
  { id: '5', name: 'Repository Health Report', description: 'Overall health metrics including data quality and completeness', icon: 'Activity' },
  { id: '6', name: 'Five Year Summary', description: 'Comprehensive five-year trend analysis for all repositories', icon: 'TrendingUp' },
];

// ---------------------------------------------------------------------------
// Past year data builders
// ---------------------------------------------------------------------------

interface RepoYearConfig {
  completion: number;
  evidence: number;
  verification: number;
  pendingTasks: number;
  status: RepositoryStatus['status'];
}

interface PastYearConfig {
  repos: Record<string, RepoYearConfig>;
  analytics: AnalyticsData;
  health: number;
  benchmarkRank: number;
  forecast: number;
}

const PAST_YEAR_CONFIGS: Record<string, PastYearConfig> = {
  '2024-25': {
    repos: {
      Academic: { completion: 87, evidence: 82, verification: 78, pendingTasks: 6, status: 'on-track' },
      Course: { completion: 72, evidence: 64, verification: 60, pendingTasks: 11, status: 'at-risk' },
      Faculty: { completion: 83, evidence: 78, verification: 74, pendingTasks: 8, status: 'on-track' },
      Student: { completion: 90, evidence: 86, verification: 83, pendingTasks: 4, status: 'on-track' },
      Research: { completion: 68, evidence: 60, verification: 55, pendingTasks: 14, status: 'at-risk' },
      'Student Dev': { completion: 75, evidence: 68, verification: 64, pendingTasks: 10, status: 'on-track' },
      Infrastructure: { completion: 63, evidence: 55, verification: 50, pendingTasks: 13, status: 'at-risk' },
      Alumni: { completion: 55, evidence: 48, verification: 42, pendingTasks: 18, status: 'critical' },
    },
    analytics: { facultyCount: 44, students: 690, research: 34, placements: 82, passPercentage: 91.2, publications: 105, patents: 6, projects: 12 },
    health: 84,
    benchmarkRank: 3,
    forecast: 88,
  },
  '2023-24': {
    repos: {
      Academic: { completion: 80, evidence: 75, verification: 71, pendingTasks: 9, status: 'on-track' },
      Course: { completion: 65, evidence: 57, verification: 53, pendingTasks: 13, status: 'at-risk' },
      Faculty: { completion: 75, evidence: 70, verification: 66, pendingTasks: 10, status: 'on-track' },
      Student: { completion: 85, evidence: 80, verification: 76, pendingTasks: 6, status: 'on-track' },
      Research: { completion: 60, evidence: 53, verification: 48, pendingTasks: 16, status: 'at-risk' },
      'Student Dev': { completion: 68, evidence: 61, verification: 57, pendingTasks: 12, status: 'at-risk' },
      Infrastructure: { completion: 57, evidence: 49, verification: 44, pendingTasks: 15, status: 'at-risk' },
      Alumni: { completion: 45, evidence: 39, verification: 34, pendingTasks: 20, status: 'critical' },
    },
    analytics: { facultyCount: 43, students: 655, research: 29, placements: 78, passPercentage: 89.4, publications: 88, patents: 5, projects: 10 },
    health: 81,
    benchmarkRank: 4,
    forecast: 85,
  },
  '2022-23': {
    repos: {
      Academic: { completion: 72, evidence: 67, verification: 63, pendingTasks: 12, status: 'at-risk' },
      Course: { completion: 58, evidence: 50, verification: 46, pendingTasks: 15, status: 'at-risk' },
      Faculty: { completion: 68, evidence: 63, verification: 59, pendingTasks: 13, status: 'at-risk' },
      Student: { completion: 78, evidence: 73, verification: 69, pendingTasks: 9, status: 'on-track' },
      Research: { completion: 52, evidence: 45, verification: 40, pendingTasks: 18, status: 'critical' },
      'Student Dev': { completion: 61, evidence: 54, verification: 50, pendingTasks: 14, status: 'at-risk' },
      Infrastructure: { completion: 50, evidence: 42, verification: 38, pendingTasks: 17, status: 'critical' },
      Alumni: { completion: 38, evidence: 32, verification: 27, pendingTasks: 22, status: 'critical' },
    },
    analytics: { facultyCount: 42, students: 610, research: 24, placements: 74, passPercentage: 87.8, publications: 72, patents: 4, projects: 8 },
    health: 78,
    benchmarkRank: 5,
    forecast: 80,
  },
  '2021-22': {
    repos: {
      Academic: { completion: 65, evidence: 60, verification: 56, pendingTasks: 14, status: 'at-risk' },
      Course: { completion: 52, evidence: 44, verification: 40, pendingTasks: 17, status: 'at-risk' },
      Faculty: { completion: 60, evidence: 55, verification: 51, pendingTasks: 15, status: 'at-risk' },
      Student: { completion: 70, evidence: 65, verification: 61, pendingTasks: 12, status: 'at-risk' },
      Research: { completion: 45, evidence: 38, verification: 33, pendingTasks: 20, status: 'critical' },
      'Student Dev': { completion: 54, evidence: 47, verification: 43, pendingTasks: 16, status: 'at-risk' },
      Infrastructure: { completion: 43, evidence: 36, verification: 32, pendingTasks: 19, status: 'critical' },
      Alumni: { completion: 30, evidence: 24, verification: 20, pendingTasks: 24, status: 'critical' },
    },
    analytics: { facultyCount: 40, students: 565, research: 19, placements: 70, passPercentage: 85.9, publications: 58, patents: 3, projects: 6 },
    health: 74,
    benchmarkRank: 6,
    forecast: 76,
  },
  '2020-21': {
    repos: {
      Academic: { completion: 58, evidence: 53, verification: 49, pendingTasks: 16, status: 'at-risk' },
      Course: { completion: 45, evidence: 38, verification: 34, pendingTasks: 19, status: 'at-risk' },
      Faculty: { completion: 52, evidence: 47, verification: 43, pendingTasks: 17, status: 'at-risk' },
      Student: { completion: 62, evidence: 57, verification: 53, pendingTasks: 15, status: 'at-risk' },
      Research: { completion: 38, evidence: 31, verification: 27, pendingTasks: 21, status: 'critical' },
      'Student Dev': { completion: 47, evidence: 40, verification: 36, pendingTasks: 18, status: 'at-risk' },
      Infrastructure: { completion: 37, evidence: 30, verification: 26, pendingTasks: 20, status: 'critical' },
      Alumni: { completion: 24, evidence: 19, verification: 15, pendingTasks: 25, status: 'critical' },
    },
    analytics: { facultyCount: 39, students: 520, research: 15, placements: 65, passPercentage: 84.1, publications: 44, patents: 2, projects: 4 },
    health: 70,
    benchmarkRank: 7,
    forecast: 72,
  },
  '2019-20': {
    repos: {
      Academic: { completion: 50, evidence: 45, verification: 41, pendingTasks: 18, status: 'at-risk' },
      Course: { completion: 38, evidence: 31, verification: 27, pendingTasks: 21, status: 'critical' },
      Faculty: { completion: 45, evidence: 40, verification: 36, pendingTasks: 19, status: 'at-risk' },
      Student: { completion: 55, evidence: 50, verification: 46, pendingTasks: 17, status: 'at-risk' },
      Research: { completion: 30, evidence: 24, verification: 20, pendingTasks: 22, status: 'critical' },
      'Student Dev': { completion: 40, evidence: 33, verification: 29, pendingTasks: 20, status: 'critical' },
      Infrastructure: { completion: 30, evidence: 24, verification: 20, pendingTasks: 22, status: 'critical' },
      Alumni: { completion: 18, evidence: 13, verification: 10, pendingTasks: 26, status: 'critical' },
    },
    analytics: { facultyCount: 38, students: 480, research: 11, placements: 60, passPercentage: 82.3, publications: 32, patents: 1, projects: 3 },
    health: 66,
    benchmarkRank: 8,
    forecast: 68,
  },
};



const ACTIVITY_TEMPLATES: { type: ActivityItem['type']; description: (short: string) => string; user: string; repository: string }[] = [
  { type: 'submitted', description: (y) => `Value Added Courses data submitted for review (${y})`, user: 'Dr. Priya Sharma', repository: 'Academic' },
  { type: 'approved', description: (y) => `Student results ${y} approved by HOD`, user: 'Dr. Suresh Patil (HOD)', repository: 'Student' },
  { type: 'uploaded', description: (y) => `Research grant sanction letter uploaded (${y})`, user: 'Dr. Amit Patel', repository: 'Research' },
  { type: 'verified', description: (y) => `Faculty publications data verified (${y})`, user: 'Dr. Suresh Patil (HOD)', repository: 'Faculty' },
  { type: 'returned', description: (y) => `Alumni engagement data returned for corrections (${y})`, user: 'Dr. Suresh Patil (HOD)', repository: 'Alumni' },
  { type: 'rejected', description: (y) => `MOOC completion report rejected - incomplete data (${y})`, user: 'Dr. Suresh Patil (HOD)', repository: 'Academic' },
];

const severityOf = (completion: number): GapItem['severity'] =>
  completion < 60 ? 'critical' : completion < 75 ? 'high' : completion < 85 ? 'medium' : 'low';

function buildReadiness(repos: RepositoryStatus[]): ReadinessData[] {
  const rows = repos.map((r) => ({
    repository: r.name,
    weight: REPO_WEIGHTS[r.name] ?? 5,
    dataCompletion: r.completion,
    evidenceCompletion: r.evidence,
    verification: r.verification,
    approval: Math.max(0, r.verification - 5),
  }));
  const avg = (fn: (r: RepositoryStatus) => number) => Math.round(repos.reduce((sum, r) => sum + fn(r), 0) / Math.max(repos.length, 1));
  rows.push(
    {
      repository: 'Evidence',
      weight: 10,
      dataCompletion: avg((r) => r.completion),
      evidenceCompletion: avg((r) => r.evidence),
      verification: avg((r) => r.verification),
      approval: Math.max(0, avg((r) => r.verification) - 5),
    },
    {
      repository: 'Verification',
      weight: 5,
      dataCompletion: avg((r) => r.evidence),
      evidenceCompletion: avg((r) => r.verification),
      verification: Math.max(0, avg((r) => r.verification) - 4),
      approval: Math.max(0, avg((r) => r.verification) - 9),
    }
  );
  return rows;
}

function buildEvidence(year: string): EvidenceItem[] {
  const short = year.slice(0, 4);
  const yearIdx = ACADEMIC_YEARS.indexOf(year);
  const pastPool: EvidenceItem['status'][] = ['approved', 'approved', 'pending', 'approved', 'changes-requested', 'pending'];
  const items: EvidenceItem[] = [];
  let n = 0;

  for (const repo of EVIDENCE_STRUCTURE) {
    for (const sec of repo.sections) {
      const statuses =
        yearIdx === 0
          ? CURRENT_YEAR_STATUS[sec.section] ?? sec.docs.map(() => 'pending' as const)
          : sec.docs.map((_, i) => pastPool[(yearIdx * 31 + i * 7 + sec.section.length) % pastPool.length]);

      sec.docs.forEach((doc, i) => {
        n += 1;
        const status = statuses[i] ?? 'pending';
        const day = String((n % 28) + 1).padStart(2, '0');
        const reviewed = status !== 'pending';
        const review = REVIEW_NOTES[doc.category];
        items.push({
          id: `${year}-e${n}`,
          repository: repo.repository,
          section: sec.section,
          uploadedBy: COORDINATOR_NAME,
          documentName: doc.fileName(short),
          documentCategory: doc.category,
          uploadDate: `${short}-12-${day}`,
          status,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          version: 'v1.0',
          reviewNote: reviewed ? (review?.note ?? 'Reviewed by HOD — please see the comments.') : undefined,
          reviewedBy: reviewed ? HOD_NAME : undefined,
          reviewDate: reviewed ? (review?.date ?? `${short}-12-15`) : undefined,
          history: [
            { version: 'v1.0', date: `${short}-12-${day}`, actor: COORDINATOR_NAME, note: 'Original upload by Department Coordinator' },
            ...(reviewed
              ? [{
                  version: 'v1.0',
                  date: review?.date ?? `${short}-12-15`,
                  actor: HOD_NAME,
                  note: status === 'approved' ? 'Approved by HOD' : status === 'rejected' ? 'Rejected by HOD' : 'Changes requested by HOD',
                }]
              : []),
          ],
        });
      });
    }
  }
  return items;
}

function buildGaps(year: string, repos: RepositoryStatus[]): GapItem[] {
  const shortYear = year.slice(0, 4);
  const severityOfRepo = (name: string) => severityOf(repos.find((r) => r.name === name)?.completion ?? 0);
  // One gap per repository — aligned with the 8 repositories shown in Evidence
  // Review and the Approval Queue.
  return [
    { id: `${year}-g1`, category: 'Curriculum Revision', description: `BoS minutes for the ${year} curriculum revision not uploaded`, repository: 'Academic', section: 'Academic Calendar', severity: severityOfRepo('Academic'), impact: `Curriculum revision evidence incomplete for ${shortYear}`, recommendation: 'Upload BoS meeting minutes and approval letters', accreditation: gapAcc('Academic', `BoS minutes evidence NAAC Criterion 1.1 (Curriculum Design) for ${shortYear}.`, `Curriculum evidence is assessed in NBA Criterion 2 for ${shortYear}.`, `Curriculum quality feeds NIRF TLR for ${shortYear}.`) },
    { id: `${year}-g2`, category: 'CO-PO Mapping', description: `CO-PO mapping incomplete for courses in ${year}`, repository: 'Course', section: 'Course Outcomes', severity: severityOfRepo('Course'), impact: `CO-PO mapping gaps — attainment cannot be computed for ${shortYear}`, recommendation: 'Complete CO-PO mapping for pending courses', accreditation: gapAcc('Course', `Incomplete CO-PO mapping weakens NAAC Criterion 2.2 for ${shortYear}.`, `CO-PO mapping is core to NBA Criterion 3 for ${shortYear}.`, `Outcome-based teaching feeds NIRF GO for ${shortYear}.`) },
    { id: `${year}-g3`, category: 'Faculty Qualifications', description: `Qualification evidence incomplete for faculty in ${year}`, repository: 'Faculty', section: 'Qualification', severity: severityOfRepo('Faculty'), impact: `Faculty qualification claims unverified for ${shortYear}`, recommendation: 'Collect and upload degree/PhD certificates', accreditation: gapAcc('Faculty', `Faculty qualification evidence feeds NAAC Criterion 2.3 for ${shortYear}.`, `Faculty data is verified under NBA Criterion 5 for ${shortYear}.`, `Faculty quality feeds NIRF TLR for ${shortYear}.`) },
    { id: `${year}-g4`, category: 'Student Results', description: `Semester results for the ${year} batch not fully uploaded`, repository: 'Student', section: 'Student Profile', severity: severityOfRepo('Student'), impact: `Result data gaps block pass-percentage calculations for ${shortYear}`, recommendation: 'Coordinate with Exam section for results', accreditation: gapAcc('Student', `Result gaps affect NAAC Criterion 2.2 (Student Performance) for ${shortYear}.`, `Pass percentage is central to NBA Criterion 4 for ${shortYear}.`, `Graduation & pass rates feed NIRF GO (20%) for ${shortYear}.`) },
    { id: `${year}-g5`, category: 'Faculty Publications', description: `Publication output low among faculty in ${year}`, repository: 'Research', section: 'Faculty Journal Publications', severity: severityOfRepo('Research'), impact: `Research output & citation metrics understated for ${shortYear}`, recommendation: 'Encourage faculty to publish in indexed journals', accreditation: gapAcc('Research', `Publication output feeds NAAC Criterion 3.4 for ${shortYear}.`, `Publication record lowers NBA Criterion 5 for ${shortYear}.`, `Publications feed NIRF RP (30%) for ${shortYear}.`) },
    { id: `${year}-g6`, category: 'Placement Data', description: `Placement records incomplete for the ${year} batch`, repository: 'Student Dev', section: 'Placements', severity: severityOfRepo('Student Dev'), impact: `Placement records incomplete for ${shortYear} — understates progression outcomes`, recommendation: 'Verify with TPO office for complete data', accreditation: gapAcc('Student Dev', `Placement evidence feeds NAAC Criterion 5.1 for ${shortYear}.`, `Placement outcomes assessed in NBA Criterion 9 for ${shortYear}.`, `Placements feed NIRF GO — incomplete data reduces the score for ${shortYear}.`) },
    { id: `${year}-g7`, category: 'Infrastructure Evidence', description: `Infrastructure evidence incomplete for ${year}`, repository: 'Infrastructure', section: 'Lab Equipment', severity: severityOfRepo('Infrastructure'), impact: `Infrastructure claims unverifiable for ${shortYear}`, recommendation: 'Upload equipment invoices and geo-tagged photos', accreditation: gapAcc('Infrastructure', `Infrastructure evidence feeds NAAC Criterion 4 for ${shortYear}.`, `Facilities verified under NBA Criterion 6 for ${shortYear}.`, `Infrastructure feeds NIRF TLR for ${shortYear}.`) },
    { id: `${year}-g8`, category: 'Alumni Data', description: `Alumni tracking data missing for the ${year} batch`, repository: 'Alumni', section: 'Alumni Details', severity: severityOfRepo('Alumni'), impact: `Alumni database incomplete for ${shortYear} — weakens engagement metrics`, recommendation: 'Conduct alumni survey for missing batch', accreditation: gapAcc('Alumni', `Alumni engagement evidence feeds NAAC Criterion 5.1 for ${shortYear}.`, `Alumni outcomes contribute to NBA Criterion 9 for ${shortYear}.`, `Alumni engagement feeds NIRF OI for ${shortYear}.`) },
  ];
}

function buildActivities(year: string): ActivityItem[] {
  const start = parseInt(year.slice(0, 4), 10);
  return ACTIVITY_TEMPLATES.map((tpl, i) => ({
    id: `${year}-act${i + 1}`,
    type: tpl.type,
    description: tpl.description(year.slice(0, 4)),
    user: tpl.user,
    timestamp: `${start}-12-${String(10 + i).padStart(2, '0')}T${String(9 + i).padStart(2, '0')}:30:00Z`,
    repository: tpl.repository,
  }));
}

function buildInsights(year: string, repos: RepositoryStatus[], cfg: PastYearConfig): AiInsight[] {
  const start = parseInt(year.slice(0, 4), 10);
  const worst = [...repos].sort((a, b) => a.completion - b.completion)[0];
  return [
    { id: `${year}-i1`, title: 'Completion Prediction', description: `At current pace, full repository completion for ${year} expected by March ${start + 1}. Accelerate Research & Alumni sections.`, type: 'info' },
    { id: `${year}-i2`, title: 'Missing Evidence Alert', description: `${worst.name} Repository has ${worst.pendingTasks} records without supporting evidence for ${year}. This may affect NAAC Criterion 3 score.`, type: 'warning' },
    { id: `${year}-i3`, title: 'Department Benchmark', description: `For ${year}, your department ranks #${cfg.benchmarkRank} of 8 departments in overall repository readiness. Top department: Electronics at 94%.`, type: 'success' },
    { id: `${year}-i4`, title: 'Readiness Forecast', description: `Based on current trends, department readiness for ${year} will reach ${cfg.forecast}% by February ${start + 1} if the current submission rate continues.`, type: 'info' },
  ];
}

// ---------------------------------------------------------------------------
// Accreditation readiness — maps each repository to the NAAC / NBA / NIRF
// criteria its data primarily supports, then derives a weighted readiness per
// framework so the numbers always stay consistent with the repository cards.
// ---------------------------------------------------------------------------

const ACCREDITATION_MATRIX: Record<'naac' | 'nba' | 'nirf', { name: string; weightage: number; repos: string[] }[]> = {
  naac: [
    { name: 'Curricular Aspects', weightage: 150, repos: ['Academic'] },
    { name: 'Teaching-Learning & Evaluation', weightage: 200, repos: ['Course', 'Student'] },
    { name: 'Research, Innovations & Extension', weightage: 250, repos: ['Faculty', 'Research'] },
    { name: 'Infrastructure & Learning Resources', weightage: 100, repos: ['Infrastructure'] },
    { name: 'Student Support & Progression', weightage: 100, repos: ['Student Dev', 'Alumni'] },
    { name: 'Governance, Leadership & Management', weightage: 100, repos: ['Academic', 'Faculty'] },
    { name: 'Institutional Values & Best Practices', weightage: 100, repos: ['Student Dev', 'Infrastructure'] },
  ],
  nba: [
    { name: 'Vision, Mission & PEOs', weightage: 60, repos: ['Academic'] },
    { name: 'Program Curriculum & Teaching-Learning', weightage: 80, repos: ['Academic', 'Course'] },
    { name: 'Course Outcomes & Program Outcomes', weightage: 120, repos: ['Course'] },
    { name: 'Students Performance', weightage: 120, repos: ['Student'] },
    { name: 'Faculty Information & Contributions', weightage: 100, repos: ['Faculty', 'Research'] },
    { name: 'Facilities & Technical Support', weightage: 80, repos: ['Infrastructure'] },
    { name: 'Academic Support & Governance', weightage: 40, repos: ['Academic', 'Student Dev'] },
  ],
  nirf: [
    { name: 'Teaching, Learning & Resources (TLR)', weightage: 30, repos: ['Academic', 'Faculty', 'Infrastructure'] },
    { name: 'Research & Professional Practice (RP)', weightage: 30, repos: ['Research'] },
    { name: 'Graduation Outcomes (GO)', weightage: 20, repos: ['Course', 'Student'] },
    { name: 'Outreach & Inclusivity (OI)', weightage: 10, repos: ['Student Dev', 'Alumni'] },
    { name: 'Perception (PR)', weightage: 10, repos: ['Academic', 'Student Dev'] },
  ],
};

const FRAMEWORK_NAMES: Record<AccreditationFrameworkData['id'], string> = {
  naac: 'NAAC',
  nba: 'NBA',
  nirf: 'NIRF',
};

function buildAccreditation(repos: RepositoryStatus[]): AccreditationFrameworkData[] {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  // First match wins — keep repo ordering stable (e.g. 'Student' must resolve to
  // 'Student Repository' before 'Student Dev & Outcomes' is ever considered).
  const findRepo = (key: string) =>
    repos.find((r) => r.name === key || r.name.startsWith(key) || r.name.includes(key));
  const repoCompletion = (key: string) => findRepo(key)?.completion ?? 65;
  const avg = (vals: number[]) => Math.round(vals.reduce((a, b) => a + b, 0) / Math.max(vals.length, 1));

  return (Object.keys(ACCREDITATION_MATRIX) as AccreditationFrameworkData['id'][]).map((id) => {
    const criteria: AccreditationCriterion[] = ACCREDITATION_MATRIX[id].map((c) => {
      const completion = avg(c.repos.map(repoCompletion));
      return {
        name: c.name,
        weightage: c.weightage,
        completion,
        status: completion >= 85 ? ('ready' as const) : completion >= 60 ? ('in-progress' as const) : ('not-started' as const),
      };
    });
    const totalWeight = criteria.reduce((a, c) => a + c.weightage, 0);
    const readiness = clamp(criteria.reduce((a, c) => a + c.completion * c.weightage, 0) / totalWeight);
    return {
      id,
      name: FRAMEWORK_NAMES[id],
      readiness,
      status: readiness >= 85 ? ('ready' as const) : readiness >= 60 ? ('in-progress' as const) : ('not-started' as const),
      criteria,
    };
  });
}

function buildYearData(year: string, cfg: PastYearConfig): HODYearData {
  const repos: RepositoryStatus[] = Object.entries(cfg.repos).map(([name, c], i) => ({
    id: String(i + 1),
    name,
    owner: REPO_OWNERS[name] ?? 'Coordinator',
    completion: c.completion,
    evidence: c.evidence,
    verification: c.verification,
    pendingTasks: c.pendingTasks,
    status: c.status,
  }));
  return {
    repositoryOverview: repos,
    readiness: buildReadiness(repos),
    evidence: buildEvidence(year),
    gaps: buildGaps(year, repos),
    analytics: cfg.analytics,
    activities: buildActivities(year),
    insights: buildInsights(year, repos, cfg),
    health: cfg.health,
    accreditation: buildAccreditation(repos),
  };
}

export const hodYearData: Record<string, HODYearData> = {
  '2025-26': {
    repositoryOverview: repositoryOverviewData,
    readiness: readinessData,
    evidence: evidenceData,
    gaps: gapAnalysisData,
    analytics: analyticsData,
    activities: activityTimelineData,
    insights: aiInsights,
    health: 87,
    accreditation: buildAccreditation(repositoryOverviewData),
  },
  ...Object.fromEntries(
    Object.keys(PAST_YEAR_CONFIGS).map((year) => [year, buildYearData(year, PAST_YEAR_CONFIGS[year])])
  ),
};

export const getHODYearData = (year: string): HODYearData => hodYearData[year] ?? hodYearData['2025-26'];

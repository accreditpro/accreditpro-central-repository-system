export type CommitteeCategory =
  | 'Academic Governance'
  | 'Quality Assurance'
  | 'Examination'
  | 'Research & Innovation'
  | 'Industry & Placement'
  | 'Student Development';

export type CommitteeStatus = 'active' | 'inactive';

export type MemberType = 'Internal' | 'External';

export type DocumentStatus = 'not_uploaded' | 'uploaded' | 'under_review' | 'approved';

export interface CommitteeDocument {
  id: string;
  name: string;
  mandatory: boolean;
  status: DocumentStatus;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  versions: DocumentVersion[];
}

export interface DocumentVersion {
  id: string;
  version: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface CommitteeMember {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  committeeRole: string;
  memberType: MemberType;
  email: string;
  mobile: string;
}

export interface Committee {
  id: string;
  name: string;
  category: CommitteeCategory;
  description: string;
  academicYear: string;
  effectiveFrom: string;
  effectiveTo: string;
  status: CommitteeStatus;
  preset: boolean;
  members: CommitteeMember[];
  documents: CommitteeDocument[];
  createdAt: string;
  createdBy: string;
  modifiedAt?: string;
  modifiedBy?: string;
}

export interface CommitteeAuditEntry {
  id: string;
  committeeId: string;
  action: string;
  performedBy: string;
  performedAt: string;
  details: string;
}

export const COMMITTEE_ROLES = [
  'Chairman',
  'Chairperson',
  'Convener',
  'Coordinator',
  'Member',
  'Member Secretary',
  'External Expert',
  'Industry Expert',
  'Alumni Representative',
  'University Nominee',
  'AICTE Nominee',
  'Student Representative',
  'Special Invitee',
] as const;

export const COMMITTEE_CATEGORIES: { value: CommitteeCategory; label: string }[] = [
  { value: 'Academic Governance', label: 'Academic Governance' },
  { value: 'Quality Assurance', label: 'Quality Assurance' },
  { value: 'Examination', label: 'Examination' },
  { value: 'Research & Innovation', label: 'Research & Innovation' },
  { value: 'Industry & Placement', label: 'Industry & Placement' },
  { value: 'Student Development', label: 'Student Development' },
];

export const PREDEFINED_COMMITTEES = [
  {
    name: 'Governing Body',
    category: 'Academic Governance' as CommitteeCategory,
    description:
      'The Governing Body is the highest decision-making body of the institution responsible for overall governance, strategic direction, and policy formulation.',
  },
  {
    name: 'Academic Council',
    category: 'Academic Governance' as CommitteeCategory,
    description:
      'The Academic Council is the principal academic body responsible for maintaining academic standards, curriculum design, and academic regulations.',
  },
  {
    name: 'Board of Studies (BoS)',
    category: 'Academic Governance' as CommitteeCategory,
    description:
      'Board of Studies reviews and recommends curriculum, syllabi, and academic policies for each program offered by the institution.',
  },
  {
    name: 'Program Assessment Committee',
    category: 'Academic Governance' as CommitteeCategory,
    description:
      'Program Assessment Committee oversees the evaluation of program outcomes, student performance assessment, and continuous improvement of academic programs.',
  },
  {
    name: 'Department Academic Committee',
    category: 'Academic Governance' as CommitteeCategory,
    description:
      'Department Academic Committee oversees academic activities, course delivery, and academic performance within the department.',
  },
  {
    name: 'Department Advisory Committee',
    category: 'Academic Governance' as CommitteeCategory,
    description:
      'Department Advisory Committee provides strategic guidance to the department on academic and industry-related matters.',
  },
  {
    name: 'IQAC Committee',
    category: 'Quality Assurance' as CommitteeCategory,
    description:
      'Internal Quality Assurance Cell ensures continuous improvement of academic and administrative performance through quality benchmarks.',
  },
  {
    name: 'Examination Committee',
    category: 'Examination' as CommitteeCategory,
    description:
      'Examination Committee oversees the conduct of examinations, evaluation processes, and result declaration.',
  },
  {
    name: 'Research & Development Committee',
    category: 'Research & Innovation' as CommitteeCategory,
    description:
      'Research & Development Committee promotes research culture, reviews research proposals, and monitors research output.',
  },
  {
    name: 'Innovation & IPR Committee',
    category: 'Research & Innovation' as CommitteeCategory,
    description:
      'Innovation & IPR Committee fosters innovation, manages intellectual property rights, and promotes patent filings.',
  },
  {
    name: 'Industry Interaction Committee',
    category: 'Industry & Placement' as CommitteeCategory,
    description:
      'Industry Interaction Committee bridges academia and industry through collaborations, guest lectures, and industrial visits.',
  },
  {
    name: 'Training & Placement Committee',
    category: 'Industry & Placement' as CommitteeCategory,
    description:
      'Training & Placement Committee manages student training, career development, and placement activities.',
  },
  {
    name: 'Alumni Association Committee',
    category: 'Student Development' as CommitteeCategory,
    description:
      'Alumni Association Committee engages alumni for institutional development, mentorship, and networking.',
  },
  {
    name: 'Library Committee',
    category: 'Student Development' as CommitteeCategory,
    description:
      'Library Committee oversees library resources, digital repositories, and reading culture enhancement.',
  },
  {
    name: 'Anti-Ragging Committee',
    category: 'Student Development' as CommitteeCategory,
    description:
      'Anti-Ragging Committee prevents and addresses ragging incidents on campus as per regulatory guidelines.',
  },
  {
    name: 'Internal Complaints Committee (ICC/POSH)',
    category: 'Student Development' as CommitteeCategory,
    description:
      'Internal Complaints Committee addresses complaints related to sexual harassment and ensures a safe campus environment.',
  },
  {
    name: 'Grievance Redressal Committee',
    category: 'Student Development' as CommitteeCategory,
    description:
      'Grievance Redressal Committee addresses student and staff grievances and ensures timely resolution.',
  },
  {
    name: 'Green Campus Committee',
    category: 'Student Development' as CommitteeCategory,
    description:
      'Green Campus Committee promotes environmental sustainability, green initiatives, and eco-friendly practices.',
  },
  {
    name: 'Entrepreneurship Development Cell',
    category: 'Student Development' as CommitteeCategory,
    description:
      'Entrepreneurship Development Cell fosters entrepreneurial mindset and supports startup initiatives.',
  },
  {
    name: 'NSS Committee',
    category: 'Student Development' as CommitteeCategory,
    description:
      'National Service Scheme Committee coordinates community service activities and social outreach programs.',
  },
  {
    name: 'NCC Committee',
    category: 'Student Development' as CommitteeCategory,
    description:
      'National Cadet Corps Committee manages NCC training, camps, and related activities.',
  },
];

export const CSV_TEMPLATE_HEADERS = [
  'Employee ID',
  'Employee Name',
  'Designation',
  'Department',
  'Committee Role',
  'Member Type',
  'Email',
  'Mobile',
];

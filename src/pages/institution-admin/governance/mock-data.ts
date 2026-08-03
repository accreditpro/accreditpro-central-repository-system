import { Committee, CommitteeMember, PREDEFINED_COMMITTEES } from './types';

const defaultMembers: CommitteeMember[] = [
  {
    id: 'mem-1',
    employeeId: 'EMP001',
    employeeName: 'Dr. S. Ganesh Vaidyanathan',
    designation: 'Principal',
    department: 'Administration',
    committeeRole: 'Chairman',
    memberType: 'Internal',
    email: 'principal@svce.ac.in',
    mobile: '+91-9876543210',
  },
  {
    id: 'mem-2',
    employeeId: 'EMP002',
    employeeName: 'Dr. R. Kumar',
    designation: 'IQAC Coordinator',
    department: 'Administration',
    committeeRole: 'Convener',
    memberType: 'Internal',
    email: 'iqac@svce.ac.in',
    mobile: '+91-9876543211',
  },
  {
    id: 'mem-3',
    employeeId: 'EMP003',
    employeeName: 'Dr. Rajesh Kumar',
    designation: 'Professor',
    department: 'CSE',
    committeeRole: 'Member',
    memberType: 'Internal',
    email: 'rajesh.k@svce.ac.in',
    mobile: '+91-9876543212',
  },
  {
    id: 'mem-4',
    employeeId: 'EMP004',
    employeeName: 'Dr. Priya Sharma',
    designation: 'Professor',
    department: 'IT',
    committeeRole: 'Member',
    memberType: 'Internal',
    email: 'priya.s@svce.ac.in',
    mobile: '+91-9876543213',
  },
  {
    id: 'mem-5',
    employeeId: '',
    employeeName: 'Mr. Ravi Kumar',
    designation: 'CEO XYZ Pvt Ltd',
    department: 'External',
    committeeRole: 'Industry Expert',
    memberType: 'External',
    email: 'ravi@xyz.com',
    mobile: '+91-9876543214',
  },
];

const advisoryMembers: CommitteeMember[] = [
  {
    id: 'mem-adv-1',
    employeeId: 'EMP005',
    employeeName: 'Dr. K. Srinivasan',
    designation: 'Senior Professor',
    department: 'CSE',
    committeeRole: 'Chairman',
    memberType: 'Internal',
    email: 'srinivasan.k@svce.ac.in',
    mobile: '+91-9876543230',
  },
  {
    id: 'mem-adv-2',
    employeeId: 'EMP006',
    employeeName: 'Dr. N. Vijayalakshmi',
    designation: 'Professor',
    department: 'ECE',
    committeeRole: 'Member',
    memberType: 'Internal',
    email: 'vijayalakshmi.n@svce.ac.in',
    mobile: '+91-9876543231',
  },
  {
    id: 'mem-adv-3',
    employeeId: '',
    employeeName: 'Mr. Anand Raj',
    designation: 'Director, TechCorp',
    department: 'External',
    committeeRole: 'Industry Expert',
    memberType: 'External',
    email: 'anand@techcorp.com',
    mobile: '+91-9876543232',
  },
];

const iqacMembers: CommitteeMember[] = [
  {
    id: 'mem-iqac-1',
    employeeId: 'EMP002',
    employeeName: 'Dr. R. Kumar',
    designation: 'IQAC Coordinator',
    department: 'Administration',
    committeeRole: 'Chairperson',
    memberType: 'Internal',
    email: 'iqac@svce.ac.in',
    mobile: '+91-9876543211',
  },
  {
    id: 'mem-iqac-2',
    employeeId: 'EMP001',
    employeeName: 'Dr. S. Ganesh Vaidyanathan',
    designation: 'Principal',
    department: 'Administration',
    committeeRole: 'Member',
    memberType: 'Internal',
    email: 'principal@svce.ac.in',
    mobile: '+91-9876543210',
  },
  {
    id: 'mem-iqac-3',
    employeeId: 'EMP003',
    employeeName: 'Dr. Rajesh Kumar',
    designation: 'Professor',
    department: 'CSE',
    committeeRole: 'Member',
    memberType: 'Internal',
    email: 'rajesh.k@svce.ac.in',
    mobile: '+91-9876543212',
  },
];

const examMembers: CommitteeMember[] = [
  {
    id: 'mem-exam-1',
    employeeId: 'EMP012',
    employeeName: 'Dr. Anitha Kumari',
    designation: 'Examination Officer',
    department: 'Examination',
    committeeRole: 'Convener',
    memberType: 'Internal',
    email: 'anitha.k@svce.ac.in',
    mobile: '+91-9876543221',
  },
  {
    id: 'mem-exam-2',
    employeeId: 'EMP001',
    employeeName: 'Dr. S. Ganesh Vaidyanathan',
    designation: 'Principal',
    department: 'Administration',
    committeeRole: 'Chairman',
    memberType: 'Internal',
    email: 'principal@svce.ac.in',
    mobile: '+91-9876543210',
  },
];

function createCommittee(
  index: number,
  status: CommitteeStatus,
  members: CommitteeMember[],
  preset: boolean
): Committee {
  const predefined = PREDEFINED_COMMITTEES[index];
  const isActive = status === 'active';
  return {
    id: `committee-${index + 1}`,
    name: predefined.name,
    category: predefined.category,
    description: predefined.description,
    academicYear: '2025-26',
    effectiveFrom: isActive ? '2025-06-01' : '2024-06-01',
    effectiveTo: isActive ? '2026-05-31' : '2025-05-31',
    status,
    preset,
    members,
    documents: [
      {
        id: `doc-constitution-${index + 1}`,
        name: 'Committee Constitution / Office Order',
        mandatory: true,
        status: isActive ? 'uploaded' : 'not_uploaded',
        fileName: isActive
          ? `constitution_${predefined.name.toLowerCase().replace(/\s+/g, '_')}.pdf`
          : undefined,
        fileSize: isActive ? 2048 : undefined,
        fileType: isActive ? 'pdf' : undefined,
        uploadedBy: isActive ? 'Admin' : undefined,
        uploadedAt: isActive ? '15-Jan-2026' : undefined,
        versions: isActive
          ? [
              {
                id: `v1-constitution-${index + 1}`,
                version: 1,
                fileName: `constitution_${predefined.name.toLowerCase().replace(/\s+/g, '_')}.pdf`,
                fileSize: 2048,
                fileType: 'pdf',
                uploadedBy: 'Admin',
                uploadedAt: '15-Jan-2026',
              },
            ]
          : [],
      },
      {
        id: `doc-approval-${index + 1}`,
        name: 'Committee Approval Order',
        mandatory: true,
        status: isActive ? 'approved' : 'not_uploaded',
        fileName: isActive
          ? `approval_order_${predefined.name.toLowerCase().replace(/\s+/g, '_')}.pdf`
          : undefined,
        fileSize: isActive ? 1500 : undefined,
        fileType: isActive ? 'pdf' : undefined,
        uploadedBy: isActive ? 'Admin' : undefined,
        uploadedAt: isActive ? '15-Jan-2026' : undefined,
        versions: isActive
          ? [
              {
                id: `v1-approval-${index + 1}`,
                version: 1,
                fileName: `approval_order_${predefined.name.toLowerCase().replace(/\s+/g, '_')}.pdf`,
                fileSize: 1500,
                fileType: 'pdf',
                uploadedBy: 'Admin',
                uploadedAt: '15-Jan-2026',
              },
            ]
          : [],
      },
      {
        id: `doc-member-list-${index + 1}`,
        name: 'Committee Member List',
        mandatory: false,
        status: members.length > 0 ? 'uploaded' : 'not_uploaded',
        fileName:
          members.length > 0
            ? `member_list_${predefined.name.toLowerCase().replace(/\s+/g, '_')}.pdf`
            : undefined,
        fileSize: members.length > 0 ? 1000 : undefined,
        fileType: members.length > 0 ? 'pdf' : undefined,
        uploadedBy: members.length > 0 ? 'Admin' : undefined,
        uploadedAt: members.length > 0 ? '20-Jan-2026' : undefined,
        versions:
          members.length > 0
            ? [
                {
                  id: `v1-memberlist-${index + 1}`,
                  version: 1,
                  fileName: `member_list_${predefined.name.toLowerCase().replace(/\s+/g, '_')}.pdf`,
                  fileSize: 1000,
                  fileType: 'pdf',
                  uploadedBy: 'Admin',
                  uploadedAt: '20-Jan-2026',
                },
              ]
            : [],
      },
      {
        id: `doc-nomination-${index + 1}`,
        name: 'Government / University Nomination Letter',
        mandatory: false,
        status: 'not_uploaded',
        versions: [],
      },
    ],
    createdAt: isActive ? '2025-06-01' : '2024-06-01',
    createdBy: 'Institution Admin',
    modifiedAt: isActive ? '2026-01-15' : undefined,
    modifiedBy: isActive ? 'Institution Admin' : undefined,
  };
}

type CommitteeStatus = 'active' | 'inactive';

export const mockCommittees: Committee[] = [
  // Academic Governance
  createCommittee(0, 'active', defaultMembers, true), // Governing Body
  createCommittee(1, 'active', defaultMembers, true), // Academic Council
  createCommittee(2, 'inactive', [], true), // Board of Studies
  createCommittee(3, 'active', defaultMembers, true), // Program Assessment Committee
  createCommittee(4, 'active', iqacMembers, true), // Department Academic Committee
  createCommittee(5, 'active', advisoryMembers, true), // Department Advisory Committee
  // Quality Assurance
  createCommittee(6, 'active', iqacMembers, true), // IQAC Committee
  // Examination
  createCommittee(7, 'active', examMembers, true), // Examination Committee
  // Research & Innovation
  createCommittee(8, 'inactive', [], true), // Research & Development Committee
  createCommittee(9, 'active', [], true), // Innovation & IPR Committee
  // Industry & Placement
  createCommittee(10, 'active', [], true), // Industry Interaction Committee
  createCommittee(11, 'active', [], true), // Training & Placement Committee
  // Student Development
  createCommittee(12, 'active', [], true), // Alumni Association Committee
  createCommittee(13, 'inactive', [], true), // Library Committee
  createCommittee(14, 'active', [], true), // Anti-Ragging Committee
  createCommittee(15, 'active', [], true), // Internal Complaints Committee
  createCommittee(16, 'active', [], true), // Grievance Redressal Committee
  createCommittee(17, 'inactive', [], true), // Green Campus Committee
  createCommittee(18, 'inactive', [], true), // Entrepreneurship Development Cell
  createCommittee(19, 'active', [], true), // NSS Committee
  createCommittee(20, 'active', [], true), // NCC Committee
];

export const auditTrail = [
  {
    id: 'audit-1',
    committeeId: 'committee-1',
    action: 'Committee Created',
    performedBy: 'Institution Admin',
    performedAt: '2025-06-01 10:00',
    details: 'Governing Body committee created and configured',
  },
  {
    id: 'audit-2',
    committeeId: 'committee-1',
    action: 'Members Added',
    performedBy: 'Institution Admin',
    performedAt: '2025-06-01 11:30',
    details: '5 members added to Governing Body committee',
  },
  {
    id: 'audit-3',
    committeeId: 'committee-8',
    action: 'Committee Activated',
    performedBy: 'Institution Admin',
    performedAt: '2025-06-02 09:00',
    details: 'Examination Committee activated for academic year 2025-26',
  },
  {
    id: 'audit-4',
    committeeId: 'committee-3',
    action: 'Committee Deactivated',
    performedBy: 'Institution Admin',
    performedAt: '2025-05-30 14:00',
    details: 'Board of Studies deactivated for academic year 2025-26',
  },
  {
    id: 'audit-5',
    committeeId: 'committee-8',
    action: 'Document Uploaded',
    performedBy: 'Institution Admin',
    performedAt: '2025-06-02 09:30',
    details: 'Constitution document uploaded for Examination Committee',
  },
];

export const academicYearOptions = ['2025-26', '2024-25', '2023-24', '2022-23'];

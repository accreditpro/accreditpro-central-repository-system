export interface MissionVision {
  mission: string;
  vision: string;
  coreValues: string[];
  qualityPolicy: string;
  motto: string;
}

export interface InstitutionProfile {
  name: string;
  code: string;
  category: string;
  website: string;
  email: string;
  phone: string;
  logo: string;
  aicteCode: string;
  aisheCode: string;
  ugcCode: string;
  yearOfEstablishment: string;
  typeOfInstitution: string;
  ownershipStatus: string;
  affiliatedUniversity: string;
  affiliatedUniversityAddress: string;
  missionVision: MissionVision;
  address: {
    line1: string;
    line2: string;
    landmark: string;
    city: string;
    state: string;
    district: string;
    pincode: string;
    ruralUrbanStatus: string;
    geoLatitude: string;
    geoLongitude: string;
  };
  contact: {
    principalName: string;
    principalEmail: string;
    principalMobile: string;
    iqacName: string;
    iqacEmail: string;
    iqacMobile: string;
  };
  naac: {
    accreditationStatus: string;
    grade: string;
    cgpa: string;
    cycle: string;
    validFrom: string;
    validUpto: string;
    certificateNumber: string;
  };
  nba: {
    accreditationStatus: string;
    programsAccredited: string;
    validFrom: string;
    validUpto: string;
    tier: string;
  };
  nirf: {
    participationStatus: string;
    rank: string;
    year: string;
    category: string;
    score: string;
  };
  autonomous: {
    status: string;
    grantedBy: string;
    grantedDate: string;
    validUpto: string;
    orderNumber: string;
  };
  ugcRecognition: {
    recognitionStatus: string;
    section2f: string;
    section12b: string;
    recognitionDate: string;
    letterNumber: string;
  };
  aicteApprovals: {
    approvalStatus: string;
    applicationId: string;
    approvalYear: string;
    eoa: string;
    permanentId: string;
  };
}

export interface Program {
  id: string;
  programCode: string;
  name: string;
  level: 'UG' | 'PG' | 'Doctoral';
  duration: number;
  status: 'active' | 'inactive';
  enabled: boolean;
  isCustom: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  program: string;
  programId: string;
  coordinator: string;
  repositoryCompletion: number;
  establishedYear?: number;
  status: 'active' | 'inactive';
  enabled: boolean;
}

export interface Specialization {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  status: 'active' | 'inactive';
  enabled: boolean;
}

export interface AcademicYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

export interface AcademicRegulation {
  id: string;
  regulationCode: string;
  regulationName: string;
  program: string;
  programId: string;
  academicYearIntroduced: string;
  effectiveFromBatch: string;
  effectiveToBatch: string;
  duration: number;
  status: 'active' | 'inactive';
  creditStructure: {
    totalCredits: number;
    coreCredits: number;
    professionalElectiveCredits: number;
    openElectiveCredits: number;
    laboratoryCredits: number;
    projectCredits: number;
    internshipCredits: number;
  };
  evaluationScheme: {
    internalMarks: number;
    externalMarks: number;
    passingMarks: number;
    gradingSystem: string;
    cgpaScale: number;
  };
  internshipRequirements: {
    internshipMandatory: boolean;
    internshipDuration: string;
    industryTrainingMandatory: boolean;
  };
  projectRequirements: {
    miniProjectMandatory: boolean;
    majorProjectMandatory: boolean;
    capstoneProjectMandatory: boolean;
  };
  approvals: {
    approvedBy: string;
    approvalDate: string;
    bosApproval: string;
    academicCouncilApproval: string;
  };
  documents: string[];
}

export interface ProgramOffering {
  id: string;
  academicYear: string;
  academicYearId: string;
  program: string;
  programId: string;
  department: string;
  departmentId: string;
  specialization: string;
  specializationId: string;
  regulation: string;
  regulationId: string;
  duration: number;
  status: 'active' | 'inactive';
  generatedName: string;
}

export interface ProgramIntake {
  id: string;
  academicYear: string;
  academicYearId: string;
  programOffering: string;
  programOfferingId: string;
  sanctionedIntake: number;
  admittedIntake: number;
  lateralEntryIntake: number;
  vacantSeats: number;
  approvalAuthority: string;
  status: 'active' | 'inactive';
  documents: string[];
}

export interface InstitutionUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'blocked' | 'pending';
  lastLogin: string;
}

export interface RoleInfo {
  name: string;
  usersAssigned: number;
  permissions: string[];
}

export interface RepositoryMetric {
  name: string;
  dataCompleteness: number;
  evidenceCompleteness: number;
  verificationScore: number;
  readinessScore: number;
}

export interface DepartmentReadiness {
  department: string;
  academic: number;
  faculty: number;
  student: number;
  research: number;
  evidence: number;
  overall: number;
}

export interface ActivityLog {
  id: string;
  user: string;
  role: string;
  action: string;
  module: string;
  date: string;
  time: string;
}
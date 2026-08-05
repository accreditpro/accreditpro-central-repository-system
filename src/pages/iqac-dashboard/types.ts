// ---------------------------------------------------------------------------
// IQAC Coordinator — shared type definitions
// The IQAC acts as an institutional auditor: it never owns departmental data,
// it monitors readiness and raises quality observations instead.
// ---------------------------------------------------------------------------

export type ObservationPriority = 'low' | 'medium' | 'high' | 'critical';
export type ObservationStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type AccreditationFramework = 'NBA' | 'NAAC' | 'NIRF' | 'All';
export type TrafficStatus = 'ready' | 'attention' | 'critical';

export interface QualityObservation {
  id: string;
  title: string;
  department: string;
  repository: string;
  academicYear: string;
  framework: AccreditationFramework;
  criterion?: string;
  priority: ObservationPriority;
  description: string;
  recommendedAction: string;
  dueDate: string;
  status: ObservationStatus;
  createdBy: string;
  createdAt: string;
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: string;
}

export type ObservationInput = Omit<
  QualityObservation,
  'id' | 'status' | 'createdBy' | 'createdAt'
>;

export type InitiativeStatus = 'not-started' | 'in-progress' | 'on-track' | 'delayed' | 'completed';

export interface ImprovementInitiative {
  id: string;
  title: string;
  category: string;
  department: string;
  academicYear: string;
  description: string;
  owner: string;
  startDate: string;
  targetDate: string;
  status: InitiativeStatus;
  outcome?: string;
}

export type InitiativeInput = Omit<ImprovementInitiative, 'id'>;

export interface IQACDocVersion {
  version: string;
  uploadedBy: string;
  uploadedDate: string;
  note?: string;
  fileSize: string;
}

export interface IQACDocument {
  id: string;
  folder: string;
  name: string;
  description: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'zip';
  size: string;
  uploadedBy: string;
  uploadedDate: string;
  tags: string[];
  versions: IQACDocVersion[];
}

export type IQACDocumentInput = Omit<IQACDocument, 'id' | 'versions' | 'uploadedDate'>;

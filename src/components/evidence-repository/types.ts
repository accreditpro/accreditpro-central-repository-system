// Generic Evidence Repository Engine - Types & Interfaces
// This module is metadata-driven and reusable across all repositories in AccreditPro

export type DocumentStatus =
  | 'not_uploaded'
  | 'uploaded'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'not_applicable';

export interface DocumentVersion {
  id: string;
  version: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  status: DocumentStatus;
  comments?: string;
  versionNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface EvidenceDocument {
  id: string;
  name: string;
  description?: string;
  mandatory: boolean;
  status: DocumentStatus;
  currentVersion?: number;
  versions: DocumentVersion[];
  frameworks: string[];
  uploadedOn?: string;
  uploadedBy?: string;
  lastModified?: string;
  expiryDate?: string;
  tags?: string[];
}

export interface EvidenceFolder {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  documents: EvidenceDocument[];
  order: number;
  visibility?: FolderVisibilityRule;
}

export interface FolderVisibilityRule {
  field: string;
  value: string | boolean;
  operator?: 'equals' | 'not_equals' | 'contains';
}

export interface FolderMetrics {
  totalDocuments: number;
  requiredDocuments: number;
  uploadedDocuments: number;
  approvedDocuments: number;
  pendingDocuments: number;
  rejectedDocuments: number;
  expiredDocuments: number;
  completionPercentage: number;
}

export interface SectionMetrics {
  totalFolders: number;
  totalMandatoryDocuments: number;
  totalUploaded: number;
  totalPending: number;
  overallCompletion: number;
}

export interface RepositorySection {
  id: string;
  name: string;
  description?: string;
  folders: EvidenceFolder[];
  icon?: string;
}

export interface RepositoryConfig {
  id: string;
  name: string;
  description?: string;
  sections: RepositorySection[];
  institutionConfig?: InstitutionConfig;
}

export interface InstitutionConfig {
  naacAccredited: boolean;
  nbaAccredited: boolean;
  autonomous: boolean;
  institutionType: 'Engineering' | 'Pharmacy' | 'Architecture' | 'Management' | 'Arts' | 'Science' | 'Multi-Disciplinary';
  nirfParticipant: boolean;
  isoAccredited: boolean;
}

export type FilterType = 'all' | 'mandatory' | 'optional' | 'uploaded' | 'pending' | 'approved' | 'rejected' | 'expired';

export interface NotificationItem {
  id: string;
  type: 'missing' | 'rejected' | 'pending_review' | 'expiring' | 'recently_updated';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  documentId?: string;
  folderId?: string;
}

// Utility functions
export function calculateFolderMetrics(folder: EvidenceFolder): FolderMetrics {
  const documents = folder.documents;
  const requiredDocuments = documents.filter(d => d.mandatory).length;
  const uploadedDocuments = documents.filter(d => d.status !== 'not_uploaded' && d.status !== 'not_applicable').length;
  const approvedDocuments = documents.filter(d => d.status === 'approved').length;
  const pendingDocuments = documents.filter(d => d.mandatory && (d.status === 'not_uploaded')).length;
  const rejectedDocuments = documents.filter(d => d.status === 'rejected').length;
  const expiredDocuments = documents.filter(d => d.status === 'expired').length;

  const mandatoryUploaded = documents.filter(d => d.mandatory && d.status !== 'not_uploaded' && d.status !== 'not_applicable').length;
  const completionPercentage = requiredDocuments > 0 ? Math.round((mandatoryUploaded / requiredDocuments) * 100) : 100;

  return {
    totalDocuments: documents.length,
    requiredDocuments,
    uploadedDocuments,
    approvedDocuments,
    pendingDocuments,
    rejectedDocuments,
    expiredDocuments,
    completionPercentage,
  };
}

export function calculateSectionMetrics(section: RepositorySection, institutionConfig?: InstitutionConfig): SectionMetrics {
  const visibleFolders = section.folders.filter(f => isFolderVisible(f, institutionConfig));
  let totalMandatory = 0;
  let totalUploaded = 0;

  visibleFolders.forEach(folder => {
    const mandatoryDocs = folder.documents.filter(d => d.mandatory);
    totalMandatory += mandatoryDocs.length;
    totalUploaded += mandatoryDocs.filter(d => d.status !== 'not_uploaded' && d.status !== 'not_applicable').length;
  });

  return {
    totalFolders: visibleFolders.length,
    totalMandatoryDocuments: totalMandatory,
    totalUploaded,
    totalPending: totalMandatory - totalUploaded,
    overallCompletion: totalMandatory > 0 ? Math.round((totalUploaded / totalMandatory) * 100) : 100,
  };
}

export function isFolderVisible(folder: EvidenceFolder, config?: InstitutionConfig): boolean {
  if (!folder.visibility || !config) return true;

  const { field, value, operator = 'equals' } = folder.visibility;
  const configValue = (config as Record<string, unknown>)[field];

  switch (operator) {
    case 'equals':
      return configValue === value;
    case 'not_equals':
      return configValue !== value;
    case 'contains':
      return typeof configValue === 'string' && configValue.includes(value as string);
    default:
      return true;
  }
}

export function getStatusColor(status: DocumentStatus): string {
  switch (status) {
    case 'not_uploaded': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    case 'uploaded': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'submitted': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
    case 'under_review': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    case 'expired': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    case 'not_applicable': return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export function getStatusLabel(status: DocumentStatus): string {
  switch (status) {
    case 'not_uploaded': return 'Not Uploaded';
    case 'uploaded': return 'Uploaded';
    case 'submitted': return 'Submitted';
    case 'under_review': return 'Under Review';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    case 'expired': return 'Expired';
    case 'not_applicable': return 'N/A';
    default: return 'Unknown';
  }
}

export function getCompletionColor(percentage: number): string {
  if (percentage >= 100) return 'text-emerald-600 dark:text-emerald-400';
  if (percentage >= 75) return 'text-amber-600 dark:text-amber-400';
  if (percentage >= 50) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

export function getCompletionBadgeColor(percentage: number): string {
  if (percentage >= 100) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
  if (percentage >= 75) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  if (percentage >= 50) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
}

export function getCompletionStatusText(percentage: number): string {
  if (percentage >= 100) return 'Complete';
  if (percentage >= 75) return 'In Progress';
  if (percentage >= 50) return 'Needs Attention';
  return 'Critical';
}

export function getCompletionEmoji(percentage: number): string {
  if (percentage >= 100) return '🟢';
  if (percentage >= 75) return '🟡';
  if (percentage >= 50) return '🟠';
  return '🔴';
}
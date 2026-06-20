export type TemplateCategory =
  | 'Academic'
  | 'Faculty'
  | 'Student'
  | 'Research'
  | 'Infrastructure'
  | 'Finance'
  | 'Placement'
  | 'Compliance'
  | 'Alumni'
  | 'Extension'
  | 'Governance';

export type TemplateStatus = 'active' | 'inactive' | 'draft';

export type TemplateFileType = 'csv' | 'xlsx';

export interface TemplateVersion {
  version: string;
  uploadedBy: string;
  uploadedDate: string;
  fileSize: string;
  fileType: TemplateFileType;
  notes: string;
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  version: string;
  uploadedBy: string;
  uploadedDate: string;
  status: TemplateStatus;
  fileType: TemplateFileType;
  fileSize: string;
  description: string;
  downloads: number;
  versionHistory: TemplateVersion[];
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'Academic',
  'Faculty',
  'Student',
  'Research',
  'Infrastructure',
  'Finance',
  'Placement',
  'Compliance',
  'Alumni',
  'Extension',
  'Governance',
];
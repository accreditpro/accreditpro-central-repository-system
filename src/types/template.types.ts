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

/**
 * API enum mapping — send to API in UPPER_CASE, display in Title Case.
 * The backend uses: ACADEMIC, FACULTY, STUDENT, RESEARCH, INFRASTRUCTURE,
 * FINANCE, PLACEMENT, COMPLIANCE, ALUMNI, EXTENSION, GOVERNANCE
 */
export type TemplateCategoryApi = Uppercase<TemplateCategory>;

/** API returns ACTIVE | INACTIVE */
export type TemplateStatus = 'ACTIVE' | 'INACTIVE';

/** API returns CSV | XLSX */
export type TemplateFileType = 'CSV' | 'XLSX';

export interface TemplateVersion {
  version: string;
  uploadedBy: string;
  uploadedDate: string;
  fileSize: string;
  fileType: TemplateFileType;
  notes: string;
}

export interface Template {
  id: number;
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

/**
 * Request body for the `request` field in the upload multipart form.
 * POST /api/admin/templates/upload
 */
export interface TemplateUploadRequest {
  name: string;
  category: TemplateCategoryApi;
  description: string;
  uploadedByUserId: number;
}

/**
 * Request body for the `request` field in the replace template multipart form.
 * POST /api/admin/templates/{id}/replace
 */
export interface TemplateReplaceRequest {
  notes: string;
  uploadedByUserId: number;
}

/**
 * Helper: convert a TitleCase TemplateCategory to the API's UPPER_CASE format.
 */
export function categoryToApi(category: TemplateCategory): TemplateCategoryApi {
  return category.toUpperCase() as TemplateCategoryApi;
}

/**
 * Helper: convert an API UPPER_CASE category back to Title Case for display.
 */
export function categoryFromApi(value: string): TemplateCategory {
  // e.g. 'ACADEMIC' → 'Academic', 'FACULTY' → 'Faculty'
  const lower = value.toLowerCase();
  return (lower.charAt(0).toUpperCase() + lower.slice(1)) as TemplateCategory;
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

/** Map TemplateCategory → TemplateCategoryApi */
export const CATEGORY_TO_API: Record<TemplateCategory, TemplateCategoryApi> = {
  Academic: 'ACADEMIC',
  Faculty: 'FACULTY',
  Student: 'STUDENT',
  Research: 'RESEARCH',
  Infrastructure: 'INFRASTRUCTURE',
  Finance: 'FINANCE',
  Placement: 'PLACEMENT',
  Compliance: 'COMPLIANCE',
  Alumni: 'ALUMNI',
  Extension: 'EXTENSION',
  Governance: 'GOVERNANCE',
};

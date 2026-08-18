// ============================================================
// Config-driven CSV upload definitions for the Examination
// Repository modules. Each descriptor drives the shared
// CsvUploadDialog: which columns are expected, how each row is
// validated (mirroring the backend upload rules exactly), and
// how in-file duplicates are surfaced.
// ============================================================

export type CsvFieldType = 'text' | 'date' | 'time' | 'select' | 'textarea';

export interface CsvFieldSpec {
  /** Canonical CSV header name (matched case-insensitively, like the backend). */
  header: string;
  required: boolean;
  type: CsvFieldType;
  /** Valid option values (matched case-insensitively, like the backend). */
  options?: readonly string[];
}

export interface CsvRowValidationContext {
  academicYear: string;
  programOptions: string[];
  departmentOptions: string[];
}

export type CsvRowValidator = (
  values: Record<string, string>,
  rowNumber: number,
  ctx: CsvRowValidationContext,
  push: (column: string, message: string, severity?: 'error' | 'warning') => void
) => void;

export interface CsvModuleConfig {
  /** Module slug used for the upload endpoint. */
  moduleId: string;
  /** Expected columns in preview-table order. */
  fields: CsvFieldSpec[];
  /** Rules shown on the upload screen. */
  validationNotes: string[];
  validateRow: CsvRowValidator;
  /** When set, in-file duplicates are detected using this key. */
  duplicateKey?: (values: Record<string, string>) => string | null;
  duplicateSeverity?: 'error' | 'warning';
  duplicateMessage?: (prevRow: number) => string;
  /** Column the duplicate error/warning is attached to. Defaults to 'Program'. */
  duplicateColumn?: string;
}

// ============================================================
// Shared validation helpers (mirror ExaminationCsvUtil)
// ============================================================

export function isBlank(value: string | undefined): boolean {
  return value == null || value.trim() === '';
}

/**
 * Validate a date cell. Accepts DD-MM-YYYY (the primary CSV upload format)
 * and ISO YYYY-MM-DD (so exported files re-import verbatim) — mirroring the
 * backend ExaminationCsvUtil.parseDate.
 */
export function isValidDate(value: string): boolean {
  const trimmed = value.trim();
  // DD-MM-YYYY
  const dmy = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmy) {
    const [, dd, mm, yyyy] = dmy;
    const time = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
    return !Number.isNaN(time.getTime()) && time.toISOString().slice(0, 10) === `${yyyy}-${mm}-${dd}`;
  }
  // ISO YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;
  const time = new Date(`${trimmed}T00:00:00Z`);
  return !Number.isNaN(time.getTime()) && time.toISOString().slice(0, 10) === trimmed;
}

/** Normalize a date value to ISO YYYY-MM-DD for chronological comparison. */
function toIsoDate(value: string): string {
  const dmy = value.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return dmy ? `${dmy[3]}-${dmy[2]}-${dmy[1]}` : value.trim();
}

/** Case-insensitive option match mirroring the backend enum resolvers. */
function isValidOption(value: string, options: readonly string[]): boolean {
  const normalized = value.trim().toLowerCase();
  return options.some((opt) => opt.trim().toLowerCase() === normalized);
}

/** Normalize a time value (HH:mm or HH:mm:ss) to seconds for safe comparison. */
function toSeconds(value: string): number {
  const parts = value.split(':').map((p) => Number(p));
  return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
}

type PushFn = Parameters<CsvRowValidator>[3];

function requireValue(values: Record<string, string>, header: string, push: PushFn): void {
  if (isBlank(values[header])) push(header, `'${header}' is required`);
}

function requireOption(
  values: Record<string, string>,
  header: string,
  options: readonly string[],
  push: PushFn
): void {
  if (isBlank(values[header])) {
    push(header, `'${header}' is required`);
  } else if (!isValidOption(values[header]!, options)) {
    push(header, `'${values[header]}' is invalid. Must be one of: ${options.join(', ')}`);
  }
}

function requireDate(values: Record<string, string>, header: string, push: PushFn): void {
  if (isBlank(values[header])) {
    push(header, `'${header}' is required`);
  } else if (!isValidDate(values[header]!)) {
    push(header, `'${values[header]}' must be a valid date (DD-MM-YYYY or YYYY-MM-DD)`);
  }
}

function optionalTime(values: Record<string, string>, header: string, push: PushFn): void {
  if (!isBlank(values[header]) && !/^\d{2}:\d{2}(:\d{2})?$/.test(values[header]!.trim())) {
    push(header, `'${values[header]}' must be a valid time (HH:mm or HH:mm:ss)`);
  }
}

function optionalInteger(values: Record<string, string>, header: string, push: PushFn): void {
  if (isBlank(values[header])) return;
  const trimmed = values[header]!.trim();
  if (!/^\d+$/.test(trimmed)) {
    push(header, `'${values[header]}' must be a valid non-negative integer`);
  }
}



function optionalPercentage(values: Record<string, string>, header: string, push: PushFn): void {
  if (isBlank(values[header])) return;
  const trimmed = values[header]!.trim();
  const num = Number(trimmed);
  if (!/^\d*\.?\d+$/.test(trimmed) || num < 0 || num > 100) {
    push(header, `'${values[header]}' must be a number between 0.0 and 100.0`);
  }
}

export const EXAMINATION_TYPES = [
  'Internal Assessment',
  'End Semester Examination',
  'Supplementary Examination',
] as const;

export const STATUS_OPTIONS = ['Draft', 'Published', 'Archived'] as const;

const RESULT_CSV_NOTES = [
  'Required columns: Academic Year, Semester, Examination Type, Program, Title, Publication Date, Status',
  'Academic Year must be in YYYY-YY format and match the selected academic year (blank falls back to the selected year)',
  'Semester must be one of 1–8',
  'Examination Type must be one of: Internal Assessment, End Semester Examination, Supplementary Examination',
  'Status must be one of: Draft, Published, Archived',
  'Publication Date must be a valid date — enter as DD-MM-YYYY (e.g. 15-07-2025); ISO YYYY-MM-DD is also accepted',
  'Total Students Appeared / Total Students Passed (optional) must be non-negative whole numbers',
  'Total Students Passed cannot exceed Total Students Appeared',
  'Pass Percentage (optional) must be between 0.0 and 100.0 — left blank it is auto-calculated',
  'Rows identical to an existing record (or repeated within the file) are treated as duplicates — the upload skips and reports them',
];

const SUPPLEMENTARY_CSV_NOTES = [
  'Required columns: Academic Year, Semester, Program, Start Date, End Date, Total Students Appeared, Total Students Passed',
  'Academic Year must be in YYYY-YY format and match the selected academic year (blank falls back to the selected year)',
  'Semester must be one of 1–8',
  'Program must match a program configured for your institution',
  'Dates must be entered as DD-MM-YYYY (e.g. 15-07-2025); ISO YYYY-MM-DD is also accepted',
  'Start Date / End Date must be valid dates and End Date must be after Start Date',
  'Total Students Appeared / Total Students Passed (optional) must be non-negative whole numbers — may be left blank',
  'Total Students Passed cannot exceed Total Students Appeared',
  'Examination Name (optional) — defaults to “Supplementary Examination” when blank',
  'Pass Percentage (optional) must be between 0.0 and 100.0 — left blank it is auto-calculated',
  'Status (optional) must be one of: Draft, Published, Archived — defaults to Draft when blank',
  'Rows identical to an existing record (or repeated within the file) are treated as duplicates — the upload skips and reports them',
];

export const CIRCULAR_CATEGORIES = [
  'Examination Notification',
  'Hall Ticket Notification',
  'Practical Examination',
  'Evaluation',
  'Result Notification',
  'Supplementary Notification',
  'General Circular',
] as const;

const ACADEMIC_YEAR_PATTERN = /^\d{4}-\d{2}$/;

// ============================================================
// Module 1: Examination Schedules
// ============================================================

export const scheduleCsvConfig: CsvModuleConfig = {
  moduleId: 'examination-schedules',
  fields: [
    { header: 'Academic Year', required: true, type: 'text' },
    { header: 'Semester', required: true, type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    { header: 'Examination Type', required: true, type: 'select', options: EXAMINATION_TYPES },
    { header: 'Program', required: true, type: 'text' },
    { header: 'Title', required: true, type: 'text' },
    { header: 'Start Date', required: true, type: 'date' },
    { header: 'End Date', required: true, type: 'date' },
    { header: 'Status', required: true, type: 'select', options: STATUS_OPTIONS },
    { header: 'Department', required: false, type: 'text' },
    { header: 'Description', required: false, type: 'textarea' },
    { header: 'Start Time', required: false, type: 'time' },
    { header: 'End Time', required: false, type: 'time' },
  ],
  validationNotes: [
    'Required columns: Academic Year, Semester, Examination Type, Program, Title, Start Date, End Date, Status',
    'Academic Year must be in YYYY-YY format and match the selected academic year (blank falls back to the selected year)',
    'Semester must be one of 1–8',
    'Examination Type must be one of: Internal Assessment, End Semester Examination, Supplementary Examination',
    'Status must be one of: Draft, Published, Archived',
    'Dates must be entered as DD-MM-YYYY (e.g. 15-07-2025); ISO YYYY-MM-DD is also accepted',
    'Start Date / End Date must be valid dates and End Date cannot be before Start Date',
    'When the exam starts and ends on the same day, End Time must be after Start Time',
    'Times (optional) must be HH:mm or HH:mm:ss',
    'Rows identical to an existing record (or repeated within the file) are treated as duplicates — the upload skips and reports them',
  ],
  validateRow: (values, _rowNumber, ctx, push) => {
    const v = values;

    // Academic Year: blank falls back to the selected year; must match it.
    const academicYearValue = isBlank(v['Academic Year']) ? ctx.academicYear : v['Academic Year']!;
    if (!ACADEMIC_YEAR_PATTERN.test(academicYearValue)) {
      push('Academic Year', `'${academicYearValue}' must be in YYYY-YY format, e.g. 2024-25`);
    } else if (academicYearValue !== ctx.academicYear) {
      push('Academic Year', `'${academicYearValue}' does not match the selected academic year '${ctx.academicYear}'`);
    }

    // Semester
    if (isBlank(v['Semester'])) {
      push('Semester', `'Semester' is required`);
    } else if (!/^[1-8]$/.test(v['Semester']!.trim())) {
      push('Semester', `'${v['Semester']}' must be one of: 1, 2, 3, 4, 5, 6, 7, 8`);
    }

    // Examination Type
    requireOption(v, 'Examination Type', EXAMINATION_TYPES, push);

    // Program (required; warn when not configured for the institution)
    if (isBlank(v['Program'])) {
      push('Program', `'Program' is required`);
    } else if (
      ctx.programOptions.length > 0 &&
      !ctx.programOptions.some((p) => p.trim().toLowerCase() === v['Program']!.trim().toLowerCase())
    ) {
      push('Program', `'${v['Program']}' is not configured for your institution`, 'warning');
    }

    // Title (required)
    requireValue(v, 'Title', push);

    // Department (optional — warn when not configured)
    if (
      !isBlank(v['Department']) &&
      ctx.departmentOptions.length > 0 &&
      !ctx.departmentOptions.some((d) => d.trim().toLowerCase() === v['Department']!.trim().toLowerCase())
    ) {
      push('Department', `'${v['Department']}' is not configured for your institution`, 'warning');
    }

    // Dates
    requireDate(v, 'Start Date', push);
    requireDate(v, 'End Date', push);

    // Times (optional)
    optionalTime(v, 'Start Time', push);
    optionalTime(v, 'End Time', push);

    // Period relationship (dates normalized to ISO for chronological comparison)
    const startDate = toIsoDate(v['Start Date'] || '');
    const endDate = toIsoDate(v['End Date'] || '');
    if (isValidDate(startDate) && isValidDate(endDate) && endDate < startDate) {
      push('End Date', 'End Date cannot be before Start Date');
    }
    const startTime = v['Start Time']?.trim() || '';
    const endTime = v['End Time']?.trim() || '';
    if (startDate === endDate && startDate && startTime && endTime && toSeconds(startTime) >= toSeconds(endTime)) {
      push('End Time', 'End Time must be after Start Time on the same day');
    }

    // Status
    requireOption(v, 'Status', STATUS_OPTIONS, push);
  },
  duplicateKey: (values) => {
    const startDate = toIsoDate(values['Start Date'] || '');
    if (!startDate || isBlank(values['Program'])) return null;
    return `${values['Program']!.trim().toLowerCase()}|${values['Title']!.trim().toLowerCase()}|${startDate}`;
  },
  duplicateSeverity: 'warning',
  duplicateMessage: (prevRow) => `Duplicate within file: same record appears at row ${prevRow}`,
  duplicateColumn: 'Program',
};

// ============================================================
// Module 2: Examination Circulars
// ============================================================

export const circularCsvConfig: CsvModuleConfig = {
  moduleId: 'examination-circulars',
  fields: [
    { header: 'Circular Number', required: true, type: 'text' },
    { header: 'Circular Date', required: true, type: 'date' },
    { header: 'Title', required: true, type: 'text' },
    { header: 'Category', required: true, type: 'select', options: CIRCULAR_CATEGORIES },
    { header: 'Status', required: true, type: 'select', options: STATUS_OPTIONS },
    { header: 'Description', required: false, type: 'textarea' },
  ],
  validationNotes: [
    'Required columns: Circular Number, Circular Date, Title, Category, Status',
    'Circular Date must be a valid date — enter as DD-MM-YYYY (e.g. 15-07-2025); ISO YYYY-MM-DD is also accepted',
    'Category must be one of: Examination Notification, Hall Ticket Notification, Practical Examination, Evaluation, Result Notification, Supplementary Notification, General Circular',
    'Status must be one of: Draft, Published, Archived',
    'Circular Number must be unique per institution — duplicates are ignored by the upload and reported',
    'Description (optional)',
  ],
  validateRow: (values, _rowNumber, _ctx, push) => {
    // Circular Number (required, unique — enforced as an in-file duplicate error)
    requireValue(values, 'Circular Number', push);
    // Circular Date
    requireDate(values, 'Circular Date', push);
    // Title
    requireValue(values, 'Title', push);
    // Category
    requireOption(values, 'Category', CIRCULAR_CATEGORIES, push);
    // Status
    requireOption(values, 'Status', STATUS_OPTIONS, push);
  },
  duplicateKey: (values) => (isBlank(values['Circular Number']) ? null : values['Circular Number']!.trim()),
  // In-file duplicates are warnings (not blocking errors) — the backend
  // skips and reports them as "duplicates found and ignored".
  duplicateSeverity: 'warning',
  duplicateMessage: (prevRow) => `Duplicate Circular Number within file: already present at row ${prevRow}`,
  duplicateColumn: 'Circular Number',
};

// ============================================================
// Module 4: Supplementary Examinations
// ============================================================

export const supplementaryExaminationCsvConfig: CsvModuleConfig = {
  moduleId: 'supplementary-examinations',
  fields: [
    { header: 'Academic Year', required: true, type: 'text' },
    { header: 'Semester', required: true, type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    { header: 'Program', required: true, type: 'text' },
    { header: 'Start Date', required: true, type: 'date' },
    { header: 'End Date', required: true, type: 'date' },
    { header: 'Total Students Appeared', required: true, type: 'text' },
    { header: 'Total Students Passed', required: true, type: 'text' },
    { header: 'Examination Name', required: false, type: 'text' },
    { header: 'Pass Percentage', required: false, type: 'text' },
    { header: 'Status', required: false, type: 'select', options: STATUS_OPTIONS },
  ],
  validationNotes: SUPPLEMENTARY_CSV_NOTES,
  validateRow: (values, _rowNumber, ctx, push) => {
    const v = values;

    // Academic Year: blank falls back to the selected year; must match it.
    const academicYearValue = isBlank(v['Academic Year']) ? ctx.academicYear : v['Academic Year']!;
    if (!ACADEMIC_YEAR_PATTERN.test(academicYearValue)) {
      push('Academic Year', `'${academicYearValue}' must be in YYYY-YY format, e.g. 2024-25`);
    } else if (academicYearValue !== ctx.academicYear) {
      push('Academic Year', `'${academicYearValue}' does not match the selected academic year '${ctx.academicYear}'`);
    }

    // Semester
    if (isBlank(v['Semester'])) {
      push('Semester', `'Semester' is required`);
    } else if (!/^[1-8]$/.test(v['Semester']!.trim())) {
      push('Semester', `'${v['Semester']}' must be one of: 1, 2, 3, 4, 5, 6, 7, 8`);
    }

    // Program (required; warn when not configured for the institution)
    if (isBlank(v['Program'])) {
      push('Program', `'Program' is required`);
    } else if (
      ctx.programOptions.length > 0 &&
      !ctx.programOptions.some((p) => p.trim().toLowerCase() === v['Program']!.trim().toLowerCase())
    ) {
      push('Program', `'${v['Program']}' is not configured for your institution`, 'warning');
    }

    // Dates
    requireDate(v, 'Start Date', push);
    requireDate(v, 'End Date', push);

    // Period relationship (End Date must be strictly after Start Date — the
    // same-day case is rejected too, mirroring the backend's isAfter check).
    // Dates are normalized to ISO for chronological comparison.
    const startDate = toIsoDate(v['Start Date'] || '');
    const endDate = toIsoDate(v['End Date'] || '');
    if (isValidDate(startDate) && isValidDate(endDate) && endDate <= startDate) {
      push('End Date', 'End Date must be after Start Date');
    }

    // Counts (optional non-negative integers — blank cells are tolerated,
    // mirroring the backend parseInteger)
    optionalInteger(v, 'Total Students Appeared', push);
    optionalInteger(v, 'Total Students Passed', push);

    // Passed must not exceed appeared
    if (
      !isBlank(v['Total Students Appeared']) &&
      !isBlank(v['Total Students Passed']) &&
      Number(v['Total Students Passed']) > Number(v['Total Students Appeared'])
    ) {
      push('Total Students Passed', 'Total Students Passed cannot exceed Total Students Appeared');
    }

    // Pass Percentage (optional, 0-100; auto-calculated when blank)
    optionalPercentage(v, 'Pass Percentage', push);

    // Examination Name (optional)
    // Status (optional select)
    if (!isBlank(v['Status'])) {
      requireOption(v, 'Status', STATUS_OPTIONS, push);
    }
  },
  duplicateKey: (values) => {
    const startDate = toIsoDate(values['Start Date'] || '');
    if (!startDate || isBlank(values['Program'])) return null;
    return `${values['Program']!.trim().toLowerCase()}|${values['Examination Name']?.trim().toLowerCase() || 'supplementary examination'}|${startDate}`;
  },
  duplicateSeverity: 'warning',
  duplicateMessage: (prevRow) => `Duplicate within file: same record appears at row ${prevRow}`,
  duplicateColumn: 'Program',
};

// ============================================================
// Module 3: Result Publications
// ============================================================

export const resultPublicationCsvConfig: CsvModuleConfig = {
  moduleId: 'result-publications',
  fields: [
    { header: 'Academic Year', required: true, type: 'text' },
    { header: 'Semester', required: true, type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
    { header: 'Examination Type', required: true, type: 'select', options: EXAMINATION_TYPES },
    { header: 'Program', required: true, type: 'text' },
    { header: 'Title', required: true, type: 'text' },
    { header: 'Publication Date', required: true, type: 'date' },
    { header: 'Total Students Appeared', required: false, type: 'text' },
    { header: 'Total Students Passed', required: false, type: 'text' },
    { header: 'Pass Percentage', required: false, type: 'text' },
    { header: 'Status', required: true, type: 'select', options: STATUS_OPTIONS },
  ],
  validationNotes: RESULT_CSV_NOTES,
  validateRow: (values, _rowNumber, ctx, push) => {
    const v = values;

    // Academic Year: blank falls back to the selected year; must match it.
    const academicYearValue = isBlank(v['Academic Year']) ? ctx.academicYear : v['Academic Year']!;
    if (!ACADEMIC_YEAR_PATTERN.test(academicYearValue)) {
      push('Academic Year', `'${academicYearValue}' must be in YYYY-YY format, e.g. 2024-25`);
    } else if (academicYearValue !== ctx.academicYear) {
      push('Academic Year', `'${academicYearValue}' does not match the selected academic year '${ctx.academicYear}'`);
    }

    // Semester
    if (isBlank(v['Semester'])) {
      push('Semester', `'Semester' is required`);
    } else if (!/^[1-8]$/.test(v['Semester']!.trim())) {
      push('Semester', `'${v['Semester']}' must be one of: 1, 2, 3, 4, 5, 6, 7, 8`);
    }

    // Examination Type
    requireOption(v, 'Examination Type', EXAMINATION_TYPES, push);

    // Program (required; warn when not configured for the institution)
    if (isBlank(v['Program'])) {
      push('Program', `'Program' is required`);
    } else if (
      ctx.programOptions.length > 0 &&
      !ctx.programOptions.some((p) => p.trim().toLowerCase() === v['Program']!.trim().toLowerCase())
    ) {
      push('Program', `'${v['Program']}' is not configured for your institution`, 'warning');
    }

    // Title (required)
    requireValue(v, 'Title', push);

    // Publication Date
    requireDate(v, 'Publication Date', push);

    // Counts (optional non-negative integers)
    optionalInteger(v, 'Total Students Appeared', push);
    optionalInteger(v, 'Total Students Passed', push);

    // Passed must not exceed appeared
    if (
      !isBlank(v['Total Students Appeared']) &&
      !isBlank(v['Total Students Passed']) &&
      Number(v['Total Students Passed']) > Number(v['Total Students Appeared'])
    ) {
      push('Total Students Passed', 'Total Students Passed cannot exceed Total Students Appeared');
    }

    // Pass Percentage (optional, 0-100; auto-calculated when blank)
    optionalPercentage(v, 'Pass Percentage', push);

    // Status
    requireOption(v, 'Status', STATUS_OPTIONS, push);
  },
  duplicateKey: (values) => {
    const publicationDate = toIsoDate(values['Publication Date'] || '');
    if (!publicationDate || isBlank(values['Program'])) return null;
    return `${values['Program']!.trim().toLowerCase()}|${values['Title']!.trim().toLowerCase()}|${publicationDate}`;
  },
  duplicateSeverity: 'warning',
  duplicateMessage: (prevRow) => `Duplicate within file: same record appears at row ${prevRow}`,
  duplicateColumn: 'Program',
};

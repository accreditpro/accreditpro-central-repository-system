// ==============================
// Examination Module Types
// ==============================

/**
 * Status workflow shared across all modules.
 * Values are the backend display values (RecordStatus enum).
 */
export type RecordStatus = 'Draft' | 'Published' | 'Archived';

// ==============================
// Field Configuration for Dynamic Forms
// ==============================

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'time' | 'select' | 'textarea' | 'file';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  /**
   * Field is displayed with its current value but cannot be edited
   * (e.g. Academic Year on examination schedules).
   */
  readOnly?: boolean;
  /**
   * When set, the field's value is derived automatically (first key = numerator,
   * second key = denominator) using `numerator / denominator * 100` whenever one
   * of the source fields changes. The field is rendered read-only. e.g.
   * passPercentage from totalStudentsPassed / totalStudentsAppeared.
   */
  autoCalculateFrom?: [string, string];
  /**
   * Helper text shown under a read-only field. Defaults to the academic-year
   * hint when omitted.
   */
  readOnlyHint?: string;
  /**
   * Shorter label used for the table column header when the full label is too
   * long (e.g. "Total Students Appeared" → "Appeared").
   */
  tableLabel?: string;
  /**
   * Renders a 0–100 percentage value in the list as a small color-coded
   * progress bar (green ≥ 75, amber ≥ 50, red < 50). Used for numeric
   * percentage fields such as passPercentage.
   */
  progress?: boolean;
  /**
   * Autofetches the option list from the institution's reference data so the
   * user picks a real entity (enables backend reference resolution). Falls
   * back to a free-text input when the list is unavailable.
   */
  autofetch?: 'programs' | 'departments';
}

// ==============================
// Module Configuration
// ==============================

export interface ModuleConfig {
  id: string;
  label: string;
  icon: string;
  description: string;
  fields: FieldConfig[];
  /**
   * Optional ordered list of field keys to render as table columns. When
   * omitted the table falls back to the first {@link fields} entries.
   * Date fields with a matching "*Time" sibling field render the time
   * below the date (e.g. startDate + startTime).
   */
  tableFields?: string[];
}

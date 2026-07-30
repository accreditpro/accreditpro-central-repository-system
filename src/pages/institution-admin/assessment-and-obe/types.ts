// ============================================================
// ASSESSMENT & OBE CONFIGURATION TYPES
// ============================================================
// Institution Admin configures institution-wide OBE methodologies.
// These settings serve as defaults consumed by all departments.

// ─── Course Type ───────────────────────────────────────────
export const COURSE_TYPES = [
  'Theory',
  'Laboratory',
  'Mini Project',
  'Major Project',
  'Seminar',
  'Internship',
  'Skill Course',
  'Project Based Course',
  'Open Elective',
  'Mandatory Course',
] as const;

export type CourseType = (typeof COURSE_TYPES)[number];

// ─── 1. Gap Analysis Strategy ──────────────────────────────
export type GapAnalysisTiming = 'before-semester' | 'after-semester' | 'after-program';

// ─── 2. Attainment Level ───────────────────────────────────
export interface AttainmentLevel {
  id: string;
  level: number;
  minPercentage: number;
  label?: string;
}

// ─── 3. CO-PO / CO-PSO Attainment Calculation Methods ──────
export type COPOAttainmentMethod = 'average-mapping' | 'weighted-average' | 'highest-mapping';

// ─── 5. CO–Question Mapping Strategies ─────────────────────
export type COQuestionMappingStrategy = 'one-to-one' | 'one-to-many' | 'section-wise';

// ─── 6. CIE / SEE Components ───────────────────────────────
export interface CIEComponent {
  id: string;
  name: string;
  maxMarks: number;
  include: boolean;
}

export interface SEEComponent {
  id: string;
  name: string;
  maxMarks: number;
}

// ─── 7. CO Attainment Scheme (per course type) ─────────────
export interface COAttainmentScheme {
  internalCalcMethod: 'average-cie-i-ii' | 'best-of-cie-i-ii' | 'average-best-two' | 'custom-formula';
  targetThreshold: number;
  attainmentLevels: AttainmentLevel[];
  finalCOFormula: {
    internalWeightage: number;   // e.g. 30
    seeWeightage: number;        // e.g. 70
  };
}

// ─── 8. Assessment Scheme Config (per course type) ─────────
export interface AssessmentSchemeConfig {
  courseType: CourseType;
  // Overall Weightage
  cieWeightage: number;
  seeWeightage: number;
  maxMarks: number;
  passingMarks: number;
  // Internal Assessment Calculation
  internalCalcMethod: 'average-cie-i-ii' | 'best-of-cie-i-ii' | 'average-best-two' | 'custom-formula';
  // CIE Components
  cieComponents: CIEComponent[];
  // SEE Components
  seeComponents: SEEComponent[];
  // CO Attainment config
  coAttainment: COAttainmentScheme;
}

// ─── 9. Year Level (row in the table) ──────────────────────
export interface YearLevel {
  id: string;
  yearLabel: string;        // "First Year", "Second Year", ...
  admissionBatch: string;   // "2025-2029"
  regulation: string;       // "R23"
  assessmentSchemeId: string; // references an assessment scheme
  // Per-course-type config (keyed by course type)
  schemes: AssessmentSchemeConfig[];
}

// ─── 10. Academic Year ─────────────────────────────────────
export interface AcademicYear {
  id: string;
  label: string;             // "2025-26"
  displayLabel: string;      // "2025-2026"
  status: 'active' | 'upcoming' | 'completed';
  yearLevels: YearLevel[];
}

// ─── 11. Master OBE Configuration ──────────────────────────
export interface OBEConfiguration {
  gapAnalysis: {
    beforeSemester: boolean;
    afterSemester: boolean;
    afterProgram: boolean;
  };
  academicYears: AcademicYear[];
  coPOAttainmentMethod: COPOAttainmentMethod;
  coQuestionMappingStrategy: COQuestionMappingStrategy;
}

// ─── Sidebar Views ─────────────────────────────────────────
export type OBESidebarView =
  | 'gap-analysis'
  | 'co-attainment'
  | 'co-po-attainment'
  | 'co-question-mapping';

// ─── Validation Errors ─────────────────────────────────────
export interface OBEValidationErrors {
  gapAnalysis?: string;
  coPOAttainmentMethod?: string;
  coQuestionMappingStrategy?: string;
}

// ─── Default Attainment Levels ─────────────────────────────
export const DEFAULT_ATTAINMENT_LEVELS: AttainmentLevel[] = [
  { id: 'al-3', level: 3, minPercentage: 60, label: 'High' },
  { id: 'al-2', level: 2, minPercentage: 50, label: 'Medium' },
  { id: 'al-1', level: 1, minPercentage: 40, label: 'Low' },
  { id: 'al-0', level: 0, minPercentage: 0, label: 'Not Attained' },
];

// ─── Gap Analysis Strategy Descriptions ────────────────────
export interface GapAnalysisStrategyInfo {
  timing: GapAnalysisTiming;
  title: string;
  description: string;
  usedIn: string[];
}

export const GAP_ANALYSIS_STRATEGIES: GapAnalysisStrategyInfo[] = [
  {
    timing: 'before-semester',
    title: 'Before Academic Year / Semester Begins',
    description:
      'Perform Gap Analysis before the commencement of the semester using the previous batch\'s attainment data. This helps departments identify weak COs and POs and prepare improvement activities before teaching begins.',
    usedIn: ['Department Planning', 'Course Planning', 'Action Plan Generation'],
  },
  {
    timing: 'after-semester',
    title: 'After Academic Year / Semester Ends',
    description:
      'Perform Gap Analysis after the completion of the semester to compare expected and actual attainment values and generate recommendations for the next batch.',
    usedIn: ['Continuous Improvement Process', 'Department Analysis', 'NBA Documentation'],
  },
  {
    timing: 'after-program',
    title: 'After Program Completion',
    description:
      'Perform program-level Gap Analysis after students complete the entire program to evaluate overall PO and PSO attainment.',
    usedIn: ['Program Assessment', 'Graduate Outcome Analysis', 'NBA Program Reports'],
  },
];

// ─── CO Attainment Method Descriptions (for reference) ─────
export interface MethodInfo {
  value: string;
  title: string;
  description: string;
  recommended?: boolean;
}

export const COPO_ATTAINMENT_METHODS: MethodInfo[] = [
  {
    value: 'average-mapping',
    title: 'Average CO–PO Mapping Values',
    description:
      'Calculates PO/PSO attainment as the average of CO attainment values weighted by their mapping strength.',
    recommended: true,
  },
  {
    value: 'weighted-average',
    title: 'Weighted Average CO–PO Mapping',
    description:
      'Uses a weighted average formula where COs with higher mapping levels contribute proportionally more.',
  },
  {
    value: 'highest-mapping',
    title: 'Highest CO Mapping Value',
    description:
      'Uses the highest CO attainment value among all COs mapped to a given PO/PSO.',
  },
];

export const CO_QUESTION_MAPPING_STRATEGIES: MethodInfo[] = [
  {
    value: 'one-to-one',
    title: 'One Question → One CO',
    description: 'Each question contributes to only one Course Outcome.',
    recommended: true,
  },
  {
    value: 'one-to-many',
    title: 'One Question → Multiple COs',
    description: 'A single question may contribute to multiple Course Outcomes.',
  },
  {
    value: 'section-wise',
    title: 'Section-wise CO Mapping',
    description: 'Entire sections of the question paper are mapped to Course Outcomes.',
  },
];

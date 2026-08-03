import {
  OBEConfiguration,
  DEFAULT_ATTAINMENT_LEVELS,
  AcademicYear,
  AssessmentSchemeConfig,
  CIEComponent,
  SEEComponent,
  COURSE_TYPES,
} from './types';

// ============================================================
// HELPER: Create a default AssessmentSchemeConfig for any type
// ============================================================
function defaultScheme(courseType: string): AssessmentSchemeConfig {
  const isTheory = courseType === 'Theory';
  const isLab = courseType === 'Laboratory';
  const isMiniProject = courseType === 'Mini Project';
  const isMajorProject = courseType === 'Major Project';

  let cieWeightage = 30;
  let seeWeightage = 70;
  let maxMarks = 100;
  let passingMarks = 40;
  let cieComponents: CIEComponent[] = [];
  let seeComponents: SEEComponent[] = [];

  if (isTheory) {
    cieComponents = [
      { id: 'cie-dt', name: 'Descriptive Test', maxMarks: 25, include: true },
      { id: 'cie-asgn', name: 'Assignment', maxMarks: 5, include: true },
      { id: 'cie-quiz', name: 'Quiz', maxMarks: 0, include: false },
      { id: 'cie-sem', name: 'Seminar', maxMarks: 0, include: false },
      { id: 'cie-pres', name: 'Presentation', maxMarks: 0, include: false },
    ];
    seeComponents = [
      { id: 'see-theory', name: 'Theory Examination', maxMarks: 70 },
    ];
  } else if (isLab) {
    cieComponents = [
      { id: 'cie-exp-perf', name: 'Experiment Performance', maxMarks: 10, include: true },
      { id: 'cie-obs', name: 'Observation', maxMarks: 5, include: true },
      { id: 'cie-record', name: 'Record', maxMarks: 5, include: true },
      { id: 'cie-attend', name: 'Attendance', maxMarks: 5, include: true },
      { id: 'cie-viva', name: 'Viva', maxMarks: 5, include: true },
    ];
    seeComponents = [
      { id: 'see-practical', name: 'Practical Examination', maxMarks: 50 },
      { id: 'see-ext-viva', name: 'External Viva', maxMarks: 20 },
    ];
    maxMarks = 30;
  } else if (isMiniProject) {
    cieWeightage = 100;
    seeWeightage = 0;
    cieComponents = [
      { id: 'cie-review1', name: 'Review-I', maxMarks: 20, include: true },
      { id: 'cie-review2', name: 'Review-II', maxMarks: 20, include: true },
      { id: 'cie-report', name: 'Report', maxMarks: 20, include: true },
      { id: 'cie-pres', name: 'Presentation', maxMarks: 20, include: true },
      { id: 'cie-viva', name: 'Viva', maxMarks: 20, include: true },
    ];
    seeComponents = [];
    maxMarks = 100;
    passingMarks = 50;
  } else if (isMajorProject) {
    cieWeightage = 60;
    seeWeightage = 40;
    cieComponents = [
      { id: 'cie-review1', name: 'Review-I', maxMarks: 20, include: true },
      { id: 'cie-review2', name: 'Review-II', maxMarks: 20, include: true },
      { id: 'cie-review3', name: 'Review-III', maxMarks: 20, include: true },
      { id: 'cie-diss', name: 'Dissertation', maxMarks: 20, include: true },
      { id: 'cie-demo', name: 'Demo', maxMarks: 10, include: true },
      { id: 'cie-viva', name: 'Viva', maxMarks: 10, include: true },
    ];
    seeComponents = [
      { id: 'see-ext-eval', name: 'External Evaluation', maxMarks: 40 },
    ];
    maxMarks = 100;
    passingMarks = 50;
  } else {
    // Default for Seminar, Internship, etc.
    cieComponents = [
      { id: 'cie-default', name: 'Internal Assessment', maxMarks: maxMarks, include: true },
    ];
    seeComponents = [];
  }

  return {
    courseType: courseType as any,
    cieWeightage,
    seeWeightage,
    maxMarks,
    passingMarks,
    internalCalcMethod: 'average-cie-i-ii',
    cieComponents,
    seeComponents,
    coAttainment: {
      internalCalcMethod: 'average-cie-i-ii',
      targetThreshold: 60,
      attainmentLevels: DEFAULT_ATTAINMENT_LEVELS.map((l) => ({ ...l })),
      finalCOFormula: {
        internalWeightage: cieWeightage,
        seeWeightage: seeWeightage,
      },
    },
  };
}

// ============================================================
// DEFAULT ACADEMIC YEAR DATA
// ============================================================
const yearLabels = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
const batchYears = [
  { batch: '2025-2029', regulation: 'R23', scheme: 'Autonomous 30:70' },
  { batch: '2024-2028', regulation: 'R22', scheme: 'Autonomous 30:70' },
  { batch: '2023-2027', regulation: 'R20', scheme: 'Autonomous 30:70' },
  { batch: '2022-2026', regulation: 'R18', scheme: 'JNTUH R18 25:75' },
];

const defaultYearLevels = yearLabels.map((label, i) => ({
  id: `yl-${i + 1}`,
  yearLabel: label,
  admissionBatch: batchYears[i].batch,
  regulation: batchYears[i].regulation,
  assessmentSchemeId: batchYears[i].scheme,
  schemes: COURSE_TYPES.map((ct) => defaultScheme(ct)),
}));

export const sampleAcademicYears: AcademicYear[] = [
  {
    id: 'ay-1',
    label: '2025-26',
    displayLabel: '2025-2026',
    status: 'active',
    yearLevels: defaultYearLevels.map((yl) => ({
      ...yl,
      schemes: yl.schemes.map((s) => ({ ...s })),
    })),
  },
  {
    id: 'ay-2',
    label: '2026-27',
    displayLabel: '2026-2027',
    status: 'upcoming',
    yearLevels: defaultYearLevels.map((yl, i) => ({
      id: `yl-${i + 10}`,
      yearLabel: yl.yearLabel,
      admissionBatch: `${2026 + i}-${2030 + i}`,
      regulation: i === 0 ? 'R24' : i === 1 ? 'R23' : i === 2 ? 'R22' : 'R20',
      assessmentSchemeId: 'Autonomous 30:70',
      schemes: COURSE_TYPES.map((ct) => defaultScheme(ct)),
    })),
  },
];

// ============================================================
// DEFAULT OBE CONFIGURATION
// ============================================================
export const defaultOBEConfig: OBEConfiguration = {
  gapAnalysis: {
    beforeSemester: true,
    afterSemester: true,
    afterProgram: false,
  },
  academicYears: sampleAcademicYears.map((ay) => ({
    ...ay,
    yearLevels: ay.yearLevels.map((yl) => ({
      ...yl,
      schemes: yl.schemes.map((s) => ({ ...s })),
    })),
  })),
  coPOAttainmentMethod: 'average-mapping',
  coQuestionMappingStrategy: 'one-to-one',
};

// ─── Available regulations and scheme options ──────────────
export const REGULATION_OPTIONS = ['R24', 'R23', 'R22', 'R20', 'R18', 'R16'];
export const SCHEME_OPTIONS = ['Autonomous 30:70', 'JNTUH R18 25:75', 'Autonomous 40:60', 'JNTUH R16 70:30'];

// Course Repository Type Definitions
// Outcome Based Education (OBE) Workflow

export type BloomsTaxonomyLevel =
  'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';

export const BLOOMS_TAXONOMY_LEVELS: BloomsTaxonomyLevel[] = [
  'Remember',
  'Understand',
  'Apply',
  'Analyze',
  'Evaluate',
  'Create',
];

export interface CourseOutcome {
  id: string;
  code: string; // CO1, CO2, etc.
  description: string;
  bloomsLevel: BloomsTaxonomyLevel;
  unit?: string;
}

export interface CourseDetails {
  courseCode: string;
  courseName: string;
  facultyName: string;
  department: string;
  program: string;
  regulation: string;
  semester: string;
  year: string;
  credits: number;
  lectureHours: number;
  tutorialHours: number;
  practicalHours: number;
  ciHours: number; // Lecture + Tutorial
  piHours: number; // Practical
  teamWorkHours: number;
  selfLearningHours: number;
  totalHours: number;
}

export interface CourseFileData {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  courseObjectives: string[];
  units: CourseUnit[];
  topics: string[];
  textBooks: Book[];
  referenceBooks: Book[];
  preRequisites: string[];
}

export interface CourseUnit {
  id: string;
  title: string;
  topics: string[];
  hours: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  edition?: string;
  publisher?: string;
}

export interface AICourseAnalysis {
  confidenceScore: number;
  extractedUnits: CourseUnit[];
  extractedObjectives: string[];
  extractedBooks: Book[];
  extractedReferences: Book[];
  extractedPrerequisites: string[];
  suggestedCOs: CourseOutcome[];
  analysisDate: string;
}

// PO (Program Outcome) definitions - NBA standard 11 POs (as per NBA 2024 Manual)
export interface PO {
  id: string;
  code: string; // PO1 - PO11
  shortName: string;
  description: string;
}

export const NBA_POS: PO[] = [
  {
    id: 'po1',
    code: 'PO1',
    shortName: 'Engineering Knowledge',
    description:
      'Apply knowledge of mathematics, natural sciences, engineering fundamentals, and an engineering specialization to develop solutions for complex engineering problems.',
  },
  {
    id: 'po2',
    code: 'PO2',
    shortName: 'Problem Analysis',
    description:
      'Identify, formulate, review research literature, and analyze complex engineering problems using first principles of mathematics, natural sciences, and engineering sciences.',
  },
  {
    id: 'po3',
    code: 'PO3',
    shortName: 'Design/Development of Solutions',
    description:
      'Design creative solutions for complex engineering problems and develop systems, components, or processes that meet specified needs while considering health, safety, culture, society, and sustainability.',
  },
  {
    id: 'po4',
    code: 'PO4',
    shortName: 'Conduct Investigations of Complex Problems',
    description:
      'Conduct investigations using research methods including experiments, data analysis, interpretation, and synthesis to reach valid conclusions.',
  },
  {
    id: 'po5',
    code: 'PO5',
    shortName: 'Engineering Tool Usage',
    description:
      'Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools for modeling, prediction, and engineering activities while understanding their limitations.',
  },
  {
    id: 'po6',
    code: 'PO6',
    shortName: 'The Engineer and the World',
    description:
      'Analyze and evaluate sustainable development impacts, societal, health, safety, legal, cultural, and environmental responsibilities in engineering practice, and make informed judgments.',
  },
  {
    id: 'po7',
    code: 'PO7',
    shortName: 'Ethics',
    description:
      'Apply ethical principles and commit to professional ethics, responsibilities, inclusivity, diversity, equity, and norms of engineering practice.',
  },
  {
    id: 'po8',
    code: 'PO8',
    shortName: 'Individual and Collaborative Team Work',
    description:
      'Function effectively as an individual and as a member or leader in diverse and multidisciplinary teams.',
  },
  {
    id: 'po9',
    code: 'PO9',
    shortName: 'Communication',
    description:
      'Communicate effectively with engineering communities and society through reports, presentations, documentation, and clear technical discussions.',
  },
  {
    id: 'po10',
    code: 'PO10',
    shortName: 'Project Management and Finance',
    description:
      'Apply engineering and management principles to manage projects effectively while considering financial and economic aspects as an individual and team member.',
  },
  {
    id: 'po11',
    code: 'PO11',
    shortName: 'Life-long Learning',
    description:
      'Recognize the need for and engage in independent, lifelong learning to adapt to technological and societal changes.',
  },
];

// PSO (Program Specific Outcome)
export interface PSO {
  id: string;
  code: string; // PSO1, PSO2
  description: string;
}

export const NBA_PSOS: PSO[] = [
  {
    id: 'pso1',
    code: 'PSO1',
    description:
      'Apply computing and domain knowledge to solve real-world problems using appropriate tools and techniques',
  },
  {
    id: 'pso2',
    code: 'PSO2',
    description:
      'Design and develop innovative solutions, products, and services using cutting-edge technologies',
  },
];

export type MappingLevel = 0 | 1 | 2 | 3;

export interface COPOMapping {
  coId: string;
  poId: string;
  level: MappingLevel;
  justification: string;
}

export interface COPSOMapping {
  coId: string;
  psoId: string;
  level: MappingLevel;
  justification: string;
}

export interface COPOMatrix {
  mappings: COPOMapping[];
  coverageAnalysis: POCoverage[];
}

export interface POCoverage {
  poId: string;
  poCode: string;
  coveragePercentage: number;
  mappedCOs: string[];
  avgLevel: number;
}

export interface GapAnalysis {
  weakPOs: POAnalysis[];
  missingPOs: POAnalysis[];
  lowBloomDistribution: string[];
  weakSustainability: boolean;
  weakTeamwork: boolean;
  weakEthics: boolean;
  weakModernTools: boolean;
  recommendations: ActivityRecommendation[];
}

export interface POAnalysis {
  poCode: string;
  poDescription: string;
  reason: string;
  recommendation: string;
  expectedImprovement: string;
}

export interface ActivityRecommendation {
  id: string;
  activityType:
    | 'Seminar'
    | 'Workshop'
    | 'Hands-on Session'
    | 'Assignment'
    | 'Mini Project'
    | 'Case Study'
    | 'Guest Lecture'
    | 'Industry Visit';
  title: string;
  description: string;
  duration: string;
  mappedPO: string;
  mappedCO: string;
  evidenceRequired: string;
  expectedBloomLevel: BloomsTaxonomyLevel;
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
}

export interface RevisedMapping {
  previousMapping: COPOMapping[];
  newMapping: COPOMapping[];
  previousCoverage: POCoverage[];
  newCoverage: POCoverage[];
  improvementPercentage: number;
  updatedCOs: CourseOutcome[];
  differences: MappingDifference[];
}

export interface MappingDifference {
  coCode: string;
  poCode: string;
  previousLevel: MappingLevel;
  newLevel: MappingLevel;
}

export interface AssessmentBlueprint {
  id: string;
  assessments: Assessment[];
}

export interface Assessment {
  id: string;
  name: string;
  weightage: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: string;
  questionNumber: string;
  mappedCO: string;
  maxMarks: number;
  bloomsLevel?: BloomsTaxonomyLevel;
}

export interface MarksUpload {
  assessmentId: string;
  assessmentName: string;
  studentMarks: StudentMarks[];
  uploadedAt: string;
  threshold: number;
  attainmentTarget: number;
  calculationMethod: 'average' | 'percentage_above_threshold';
}

export interface StudentMarks {
  rollNumber: string;
  studentName: string;
  marks: Record<string, number>; // questionId -> marks
  totalMarks: number;
}

export interface COAttainment {
  coCode: string;
  averageMarks: number;
  threshold: number;
  attainment: number;
  target: number;
  status: 'achieved' | 'not_achieved' | 'partially';
}

export interface POAttainment {
  poCode: string;
  attainment: number;
  contribution: number;
  target: number;
  status: 'achieved' | 'not_achieved' | 'partially';
}

export interface AttainmentResult {
  coAttainments: COAttainment[];
  poAttainments: POAttainment[];
  psoAttainments: POAttainment[];
}

export type WorkflowStepId =
  | 'course-details'
  | 'upload-course-file'
  | 'ai-course-analysis'
  | 'course-outcomes'
  | 'co-po-mapping'
  | 'gap-analysis'
  | 'revised-co-po-mapping'
  | 'co-pso-mapping'
  | 'assessment-blueprint'
  | 'marks-upload'
  | 'attainment'
  | 'reports';

export interface WorkflowStepInfo {
  id: WorkflowStepId;
  label: string;
  stepNumber: number;
  icon: string;
  status: 'completed' | 'current' | 'pending' | 'locked';
}

export const WORKFLOW_STEPS: WorkflowStepInfo[] = [
  {
    id: 'course-details',
    label: 'Course Details',
    stepNumber: 1,
    icon: 'FileText',
    status: 'pending',
  },
  {
    id: 'upload-course-file',
    label: 'Upload Course File',
    stepNumber: 2,
    icon: 'Upload',
    status: 'pending',
  },
  {
    id: 'ai-course-analysis',
    label: 'AI Course Analysis',
    stepNumber: 3,
    icon: 'Brain',
    status: 'pending',
  },
  {
    id: 'course-outcomes',
    label: 'Course Outcomes',
    stepNumber: 4,
    icon: 'Target',
    status: 'pending',
  },
  {
    id: 'co-po-mapping',
    label: 'CO-PO Mapping',
    stepNumber: 5,
    icon: 'GitBranch',
    status: 'pending',
  },
  { id: 'gap-analysis', label: 'Gap Analysis', stepNumber: 6, icon: 'Search', status: 'pending' },
  {
    id: 'revised-co-po-mapping',
    label: 'Revised CO-PO',
    stepNumber: 7,
    icon: 'RefreshCw',
    status: 'pending',
  },
  {
    id: 'co-pso-mapping',
    label: 'CO-PSO Mapping',
    stepNumber: 8,
    icon: 'GitFork',
    status: 'pending',
  },
  {
    id: 'assessment-blueprint',
    label: 'Assessment Blueprint',
    stepNumber: 9,
    icon: 'ClipboardList',
    status: 'pending',
  },
  {
    id: 'marks-upload',
    label: 'Marks Upload',
    stepNumber: 10,
    icon: 'FileSpreadsheet',
    status: 'pending',
  },
  { id: 'attainment', label: 'Attainment', stepNumber: 11, icon: 'BarChart3', status: 'pending' },
  { id: 'reports', label: 'Reports', stepNumber: 12, icon: 'FileText', status: 'pending' },
];

// Full Course state used across the workflow
export interface CourseState {
  id: string;
  details: CourseDetails;
  courseFile: CourseFileData | null;
  aiAnalysis: AICourseAnalysis | null;
  courseOutcomes: CourseOutcome[];
  coPoMapping: COPOMapping[];
  poCoverage: POCoverage[];
  gapAnalysis: GapAnalysis | null;
  revisedMapping: RevisedMapping | null;
  coPsoMapping: COPSOMapping[];
  psoCoverage: POCoverage[];
  assessmentBlueprint: AssessmentBlueprint | null;
  marksUploads: MarksUpload[];
  attainmentResult: AttainmentResult | null;
  currentStep: WorkflowStepId;
  completionPercentages: Record<WorkflowStepId, number>;
}

export interface CourseSummary {
  id: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  semester: string;
  credits: number;
  ci: number;
  pi: number;
  tw: number;
  sl: number;
  totalHours: number;
  status: 'draft' | 'in_progress' | 'completed';
  progress: number;
  courseFileUploaded: boolean;
  cosGenerated: boolean;
  coPoMapped: boolean;
  coPsoMapped: boolean;
  marksUploaded: boolean;
  coAttainmentCalculated: boolean;
  poAttainmentCalculated: boolean;
  nbaReady: boolean;
}

export interface DashboardMetrics {
  totalCourses: number;
  coursesWithFile: number;
  coursesWithCOs: number;
  coursesWithCOPOMapping: number;
  coursesWithCOPSOMapping: number;
  coursesWithMarks: number;
  coursesWithCOAttainment: number;
  coursesWithPOAttainment: number;
  nbaReadyCourses: number;
  courseCompletion: number;
  departmentReadiness: number;
  evidenceCompletion: number;
  attainmentStatus: number;
}

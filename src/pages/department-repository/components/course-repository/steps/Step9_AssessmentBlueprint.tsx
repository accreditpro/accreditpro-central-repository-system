import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AssessmentBlueprint,
  Assessment,
  AssessmentQuestion,
  CourseOutcome,
  CourseType,
  CourseDetails,
  LabComponent,
  BloomsTaxonomyLevel,
  BLOOMS_TAXONOMY_LEVELS,
  QuestionType,
  QUESTION_TYPES,
  ASSESSMENT_TYPES,
} from '../types';
import { parseCSVLine } from '../utils/csv';
import { cn } from '@/lib/utils';
import {
  ClipboardList,
  Plus,
  Save,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Upload,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  FileDown,
  X,
  AlertTriangle,
  ListChecks,
  Book,
  Beaker,
  FlaskConical,
  Layers,
  Tag,
  Weight,
  ScrollText,
  Sigma,
  Divide,
  Calculator,
  Info,
} from 'lucide-react';

interface Step9Props {
  outcomes: CourseOutcome[];
  data: AssessmentBlueprint | null;
  onUpdate: (data: AssessmentBlueprint) => void;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  completionPercentage: number;
  courseDetails?: CourseDetails;
}

// ============================================================
// COURSE TYPE META
// ============================================================

const COURSE_TYPE_META: Record<CourseType, { icon: React.ReactNode; label: string; description: string; color: string }> = {
  Theory: {
    icon: <Book className="h-4 w-4" />,
    label: 'Theory Course',
    description: 'Lecture-based course with two CIAs (Mid + Assignment) and semester-end examination',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  Lab: {
    icon: <Beaker className="h-4 w-4" />,
    label: 'Lab Course',
    description: 'Practical lab sessions with day-to-day work, practical exams, and viva components',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
  Project: {
    icon: <FlaskConical className="h-4 w-4" />,
    label: 'Project Course',
    description: 'Project-based course with reviews, demonstration, presentation, and report submission',
    color: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  },
};

const ASSESSMENT_TYPE_META: Record<string, { color: string; shortLabel: string }> = {
  'Continuous Internal Assessment (CIA)': { color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20', shortLabel: 'CIA' },
  'Semester End Examination (SEE)': { color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', shortLabel: 'SEE' },
  'Quiz': { color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', shortLabel: 'Quiz' },
  'Assignment': { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', shortLabel: 'Asgn' },
  'Lab Practical': { color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', shortLabel: 'Lab' },
  'Project Review': { color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20', shortLabel: 'Review' },
  'Viva Voce': { color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', shortLabel: 'Viva' },
  'Presentation': { color: 'bg-pink-500/10 text-pink-600 border-pink-500/20', shortLabel: 'Pres' },
  'Report': { color: 'bg-slate-500/10 text-slate-600 border-slate-500/20', shortLabel: 'Rpt' },
  'Seminar': { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', shortLabel: 'Sem' },
  'Workshop': { color: 'bg-violet-500/10 text-violet-600 border-violet-500/20', shortLabel: 'WS' },
  'Case Study': { color: 'bg-red-500/10 text-red-600 border-red-500/20', shortLabel: 'CS' },
};

// ============================================================
// DEFAULT TEMPLATES BY COURSE TYPE
// ============================================================

interface DefaultAssessmentTemplate {
  name: string;
  assessmentType: string;
  defaultMarks: number;
  weightage: number;
  compositeGroupId?: string;
  compositeCalculation?: 'average' | 'sum';
  components?: { name: string; marks: number }[];
}

/**
 * Theory assessments use the CIA model:
 * - CIA1 (Mid Exam 1 + Assignment) and CIA2 (Mid Exam 2 + Assignment) are grouped under 'cia'
 * - Their scores are AVERAGED to compute the final CIA contribution
 * - The effective CIA weightage = average of the two CIAs' weightages
 * - SEE completes the rest to 100%
 */
const THEORY_DEFAULT_ASSESSMENTS: DefaultAssessmentTemplate[] = [
  {
    name: 'CIA 1 (Mid Exam 1 + Assignment)',
    assessmentType: 'Continuous Internal Assessment (CIA)',
    defaultMarks: 30,
    weightage: 25,
    compositeGroupId: 'cia',
    compositeCalculation: 'average',
    components: [
      { name: 'Mid Exam 1', marks: 25 },
      { name: 'Assignment', marks: 5 },
    ],
  },
  {
    name: 'CIA 2 (Mid Exam 2 + Assignment)',
    assessmentType: 'Continuous Internal Assessment (CIA)',
    defaultMarks: 30,
    weightage: 25,
    compositeGroupId: 'cia',
    compositeCalculation: 'average',
    components: [
      { name: 'Mid Exam 2', marks: 25 },
      { name: 'Assignment', marks: 5 },
    ],
  },
  { name: 'Semester End Examination', assessmentType: 'Semester End Examination (SEE)', defaultMarks: 70, weightage: 75 },
];

const LAB_DEFAULT_ASSESSMENTS: DefaultAssessmentTemplate[] = [
  {
    name: 'Mid 1',
    assessmentType: 'Continuous Internal Assessment (CIA)',
    defaultMarks: 30,
    weightage: 30,
    components: [
      { name: 'Day-to-Day Work', marks: 15 },
      { name: 'Practical Exam', marks: 12 },
      { name: 'Viva', marks: 3 },
    ],
  },
  {
    name: 'Mid 2',
    assessmentType: 'Continuous Internal Assessment (CIA)',
    defaultMarks: 30,
    weightage: 30,
    components: [
      { name: 'Day-to-Day Work', marks: 15 },
      { name: 'Practical Exam', marks: 12 },
      { name: 'Viva', marks: 3 },
    ],
  },
  { name: 'Semester End Examination', assessmentType: 'Semester End Examination (SEE)', defaultMarks: 70, weightage: 40 },
];

const PROJECT_DEFAULT_ASSESSMENTS: DefaultAssessmentTemplate[] = [
  { name: 'Review 1', assessmentType: 'Project Review', defaultMarks: 0, weightage: 0 },
  { name: 'Review 2', assessmentType: 'Project Review', defaultMarks: 0, weightage: 0 },
  { name: 'Demonstration', assessmentType: 'Presentation', defaultMarks: 0, weightage: 0 },
  { name: 'Presentation', assessmentType: 'Presentation', defaultMarks: 0, weightage: 0 },
  { name: 'Viva', assessmentType: 'Viva Voce', defaultMarks: 0, weightage: 0 },
  { name: 'Report', assessmentType: 'Report', defaultMarks: 0, weightage: 0 },
];

const ADDITIONAL_ASSESSMENT_TYPES = [
  'Quiz',
  'Seminar',
  'Workshop',
  'Case Study',
  'Presentation',
  'Open Book Test',
  'Industry Assignment',
] as const;

// ============================================================
// COMPOSITE GROUP CALCULATION ENGINE
// ============================================================

interface CompositeGroupResult {
  groupId: string;
  members: Assessment[];
  calculation: 'average' | 'sum';
  effectiveWeightage: number;
  effectiveMarks: number;
  displayLabel: string;
}

/**
 * Analyzes all assessments and computes composite group contributions.
 * For assessments with the same compositeGroupId and 'average' calculation,
 * the effective weightage is the AVERAGE of their individual weightages (not the sum).
 */
function computeCompositeGroups(assessments: Assessment[]): {
  groups: CompositeGroupResult[];
  /** Map of assessmentId -> effective contribution weightage */
  effectiveContributions: Map<string, number>;
  /** Total effective weightage across all assessments */
  totalEffectiveWeightage: number;
} {
  const groupsMap = new Map<string, Assessment[]>();
  const calcMap = new Map<string, 'average' | 'sum'>();
  const effectiveContributions = new Map<string, number>();

  // Group assessments by compositeGroupId
  for (const a of assessments) {
    if (a.compositeGroupId) {
      const existing = groupsMap.get(a.compositeGroupId) || [];
      existing.push(a);
      groupsMap.set(a.compositeGroupId, existing);
      calcMap.set(a.compositeGroupId, a.compositeCalculation || 'average');
    }
  }

  // Compute effective contributions for each group
  const groups: CompositeGroupResult[] = [];
  const processedIds = new Set<string>();

  for (const [groupId, members] of groupsMap.entries()) {
    if (members.length === 0) continue;
    const calc = calcMap.get(groupId) || 'average';

    let effectiveWeightage: number;
    let effectiveMarks: number;

    if (calc === 'average') {
      // Average of all members' weightages
      const totalWeightage = members.reduce((s, m) => s + m.weightage, 0);
      const avgWeightage = totalWeightage / members.length;
      effectiveWeightage = Math.round(avgWeightage);

      // Average of all members' marks
      const totalMarks = members.reduce((s, m) => s + m.defaultMarks, 0);
      const avgMarks = totalMarks / members.length;
      effectiveMarks = Math.round(avgMarks);
    } else {
      // Sum
      effectiveWeightage = members.reduce((s, m) => s + m.weightage, 0);
      effectiveMarks = members.reduce((s, m) => s + m.defaultMarks, 0);
    }

    // Each member gets the effective weightage
    for (const m of members) {
      effectiveContributions.set(m.id, effectiveWeightage);
      processedIds.add(m.id);
    }

    groups.push({
      groupId,
      members,
      calculation: calc,
      effectiveWeightage,
      effectiveMarks,
      displayLabel: calc === 'average' ? `Average of ${members.length} assessments` : `Sum of ${members.length} assessments`,
    });
  }

  // Non-grouped assessments have their own weightage as effective contribution
  for (const a of assessments) {
    if (!processedIds.has(a.id)) {
      effectiveContributions.set(a.id, a.weightage);
    }
  }

  // Total effective weightage — count each composite group once, not per-member
  let totalEffectiveWeightage = 0;
  const processedWeightageIds = new Set<string>();
  for (const group of groups) {
    totalEffectiveWeightage += group.effectiveWeightage;
    for (const m of group.members) {
      processedWeightageIds.add(m.id);
    }
  }
  for (const [id, eff] of effectiveContributions.entries()) {
    if (!processedWeightageIds.has(id)) {
      totalEffectiveWeightage += eff;
    }
  }

  // Compute total effective marks (accounting for composite group averaging)
  let totalEffectiveMarks = 0;
  const effectiveMarksMap = new Map<string, number>();
  const processedMarksIds = new Set<string>();
  // Groups count once (not per-member), using the group's effective marks
  for (const group of groups) {
    totalEffectiveMarks += group.effectiveMarks;
    for (const m of group.members) {
      effectiveMarksMap.set(m.id, group.effectiveMarks);
      processedMarksIds.add(m.id);
    }
  }
  // Standalone assessments count individually
  for (const a of assessments) {
    if (!processedMarksIds.has(a.id)) {
      effectiveMarksMap.set(a.id, a.defaultMarks);
      totalEffectiveMarks += a.defaultMarks;
    }
  }

  return { groups, effectiveContributions, totalEffectiveWeightage, totalEffectiveMarks, effectiveMarksMap };
}

// ============================================================
// CSV PARSING
// ============================================================

// ============================================================
// ENHANCED CSV FORMAT (Mid Exam / Assignment / SEE Template)
// ============================================================

/**
 * All assessments (CIA components, SEE, etc.) use an enhanced column format:
 * Section, Parent Question, Question No, Question Category, Attempt Rule,
 * Question Text (Optional), CO Mapping, Bloom Level, Maximum Marks, Display Order
 */
const MID_EXAM_CSV_HEADERS = 'Section,Parent Question,Question No,Question Category,Attempt Rule,Question Text (Optional),CO Mapping,Bloom Level,Maximum Marks,Display Order';

/** Generate a blank CSV template (headers only) for mid-exam / assignment format */
function generateMidExamCSVTemplate(): string {
  return MID_EXAM_CSV_HEADERS + '\n';
}

/** Generate a CSV with existing questions in the enhanced format */
function generateMidExamCSV(questions: AssessmentQuestion[]): string {
  const rows = questions.map((q) => {
    const section = q.section || '';
    const parentQ = q.parentQuestion || '';
    const qNo = q.questionNumber || '';
    const category = q.questionType || '';
    const attemptRule = q.attemptRule || '';
    const qText = q.question || '';
    const escapedQText = qText.includes(',') || qText.includes('"')
      ? `"${qText.replace(/"/g, '""')}"`
      : qText;
    const coMapping = q.mappedCO || '';
    const bloomLevel = q.bloomsLevel || '';
    const maxMarks = q.maxMarks || 0;
    const displayOrder = q.displayOrder || '';
    return `${section},${parentQ},${qNo},${category},${attemptRule},${escapedQText},${coMapping},${bloomLevel},${maxMarks},${displayOrder}`;
  });
  return [MID_EXAM_CSV_HEADERS, ...rows].join('\n');
}

interface MidExamCSVRow {
  section: string;
  parentQuestion: string;
  questionNumber: string;
  questionCategory: string;
  attemptRule: string;
  questionText: string;
  mappedCO: string;
  bloomsLevel: string;
  maxMarks: number;
  displayOrder: string;
}

/** Parse an enhanced-format CSV (mid exam / assignment style) */
function parseMidExamCSV(text: string, validCOs: string[]): { questions: MidExamCSVRow[]; errors: string[] } {
  const errors: string[] = [];
  const rows: MidExamCSVRow[] = [];
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length < 2) {
    return { questions: [], errors: ['CSV file is empty or has no data rows'] };
  }

  const headers = parseCSVLine(lines[0]);
  const sectionIdx = headers.findIndex((h) => h.toLowerCase().includes('section'));
  const parentQIdx = headers.findIndex((h) => h.toLowerCase().includes('parent question'));
  const qNoIdx = headers.findIndex((h) => h.toLowerCase().includes('question no'));
  const categoryIdx = headers.findIndex((h) => h.toLowerCase().includes('question category'));
  const attemptIdx = headers.findIndex((h) => h.toLowerCase().includes('attempt rule'));
  const qTextIdx = headers.findIndex((h) => h.toLowerCase().includes('question text'));
  const coIdx = headers.findIndex((h) => h.toLowerCase().includes('co mapping'));
  const bloomIdx = headers.findIndex((h) => h.toLowerCase().includes('bloom level'));
  const marksIdx = headers.findIndex((h) => h.toLowerCase().includes('maximum marks'));
  const orderIdx = headers.findIndex((h) => h.toLowerCase().includes('display order'));

  if (qNoIdx === -1) errors.push('Missing "Question No" column');
  if (marksIdx === -1) errors.push('Missing "Maximum Marks" column');
  if (coIdx === -1) errors.push('Missing "CO Mapping" column');
  if (bloomIdx === -1) errors.push('Missing "Bloom Level" column');

  if (errors.length > 0) return { questions: [], errors };

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < Math.max(qNoIdx, marksIdx, coIdx, bloomIdx) + 1) continue;

    const questionNumber = (cols[qNoIdx] || '').trim();
    if (!questionNumber) continue;

    const section = sectionIdx >= 0 ? (cols[sectionIdx] || '').trim() : '';
    const parentQuestion = parentQIdx >= 0 ? (cols[parentQIdx] || '').trim() : '';
    const categoryRaw = categoryIdx >= 0 ? (cols[categoryIdx] || '').trim() : '';
    const attemptRule = attemptIdx >= 0 ? (cols[attemptIdx] || '').trim() : '';
    const questionText = qTextIdx >= 0 ? (cols[qTextIdx] || '').trim() : '';
    const coRaw = (cols[coIdx] || '').trim();
    const bloomRaw = bloomIdx >= 0 ? (cols[bloomIdx] || '').trim() : '';
    const marksRaw = (cols[marksIdx] || '').trim();
    const displayOrder = orderIdx >= 0 ? (cols[orderIdx] || '').trim() : '';

    const maxMarks = parseFloat(marksRaw);
    if (isNaN(maxMarks) || marksRaw === '' || maxMarks <= 0) {
      errors.push(`Row ${i} (Q${questionNumber}): Marks not entered or invalid (must be > 0)`);
      continue;
    }

    const mappedCO = coRaw.toUpperCase().trim();
    if (!mappedCO) {
      errors.push(`Row ${i} (Q${questionNumber}): No CO mapping`);
      continue;
    }
    if (validCOs.length > 0 && !validCOs.includes(mappedCO)) {
      errors.push(`Row ${i} (Q${questionNumber}): CO "${mappedCO}" not found in approved Course Outcomes. Valid COs: ${validCOs.join(', ')}`);
    }

    // Validate attempt rule
    const normalizedAttempt = attemptRule.charAt(0).toUpperCase() + attemptRule.slice(1).toLowerCase();
    if (attemptRule && !['Mandatory', 'Optional'].includes(normalizedAttempt)) {
      errors.push(`Row ${i} (Q${questionNumber}): Invalid Attempt Rule "${attemptRule}". Valid: Mandatory, Optional`);
    }

    // Validate Question Category
    const normalizedCategory = categoryRaw.charAt(0).toUpperCase() + categoryRaw.slice(1).toLowerCase();
    const validCategory = QUESTION_TYPES.find((t) => t.toLowerCase() === categoryRaw.toLowerCase());
    if (categoryRaw && !validCategory) {
      errors.push(`Row ${i} (Q${questionNumber}): Invalid Question Category "${categoryRaw}". Valid: ${QUESTION_TYPES.join(', ')}`);
    }

    // Validate Bloom's Level (accept both word form and L1-L6)
    const lNumberMatch = bloomRaw.match(/^L([1-6])$/i);
    let bloomsLevel: string;
    if (lNumberMatch) {
      const levelNum = parseInt(lNumberMatch[1]);
      const bloomMap: Record<number, BloomsTaxonomyLevel> = {
        1: 'Remember',
        2: 'Understand',
        3: 'Apply',
        4: 'Analyze',
        5: 'Evaluate',
        6: 'Create',
      };
      bloomsLevel = bloomMap[levelNum] || bloomRaw;
    } else {
      bloomsLevel = bloomRaw.charAt(0).toUpperCase() + bloomRaw.slice(1).toLowerCase();
    }

    if (!BLOOMS_TAXONOMY_LEVELS.includes(bloomsLevel as BloomsTaxonomyLevel)) {
      errors.push(`Row ${i} (Q${questionNumber}): Invalid Bloom's level "${bloomRaw}". Valid: ${BLOOMS_TAXONOMY_LEVELS.join(', ')} or L1-L6`);
      continue;
    }

    rows.push({
      section,
      parentQuestion,
      questionNumber,
      questionCategory: validCategory || (categoryRaw ? categoryRaw : 'Descriptive'),
      attemptRule: normalizedAttempt,
      questionText,
      mappedCO,
      bloomsLevel,
      maxMarks,
      displayOrder,
    });
  }

  return { questions: rows, errors };
}

// ============================================================
// HELPER: Create default assessment from template
// ============================================================

function createAssessmentFromTemplate(template: DefaultAssessmentTemplate): Assessment {
  const components = template.components
    ? template.components.map((c, i) => ({
        id: `comp-${Date.now()}-${i}`,
        name: c.name,
        marks: c.marks,
      }))
    : undefined;

  return {
    id: `assess-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name: template.name,
    assessmentType: template.assessmentType,
    defaultMarks: template.defaultMarks,
    weightage: template.weightage,
    questions: [],
    components,
    compositeGroupId: template.compositeGroupId,
    compositeCalculation: template.compositeCalculation,
  };
}

// ============================================================
// CHOICE-AWARE MARKS CALCULATION
// ============================================================

/**
 * Calculates the effective total marks for a set of questions.
 *
 * Rules:
 * - Mandatory questions (or unmarked) → each counted individually
 * - Optional questions → each questionNumber is counted only ONCE
 *   (if the same questionNumber appears multiple times as Optional,
 *    only the highest-marked occurrence is counted)
 *
 * Example:
 *   B1(a) (Optional, 5), B1(b) (Optional, 5)
 *   → Both counted since they have unique question numbers: 5 + 5 = 10
 *
 *   B2 (Mandatory, 10)
 *   → Counted individually: 10
 *
 *   Overall = 10 + 10 = 20
 */
function calculateEffectiveTotalMarks(questions: AssessmentQuestion[]): number {
  // For optional questions, deduplicate by questionNumber — keep the best (max) mark per number
  const optionalQMaxMarks = new Map<string, number>();
  let mandatoryMarks = 0;

  for (const q of questions) {
    if (q.attemptRule === 'Optional') {
      // For optional questions, deduplicate by questionNumber
      // Keep track of the max mark for each optional question number
      const currentMax = optionalQMaxMarks.get(q.questionNumber) || 0;
      if (q.maxMarks > currentMax) {
        optionalQMaxMarks.set(q.questionNumber, q.maxMarks);
      }
    } else {
      // Mandatory or unmarked questions count individually
      mandatoryMarks += q.maxMarks;
    }
  }

  // Add the best mark for each unique optional question number
  for (const [, maxMark] of optionalQMaxMarks.entries()) {
    mandatoryMarks += maxMark;
  }

  return mandatoryMarks;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Step9_AssessmentBlueprint({
  outcomes,
  data,
  onUpdate,
  onSave,
  onNext,
  onPrev,
  completionPercentage,
  courseDetails,
}: Step9Props) {
  // Auto-detect course type from course details — no user selection
  const activeCourseType: CourseType = courseDetails?.courseType || 'Theory';
  const courseMeta = COURSE_TYPE_META[activeCourseType];

  const [expandedAssessments, setExpandedAssessments] = useState<Set<string>>(new Set());
  const [csvImportErrors, setCsvImportErrors] = useState<Map<string, string[]>>(new Map());
  const [csvImportSuccess, setCsvImportSuccess] = useState<string | null>(null);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const hasInitialized = useRef(false);

  const getTemplatesForType = useCallback((type: CourseType): DefaultAssessmentTemplate[] => {
    switch (type) {
      case 'Lab': return LAB_DEFAULT_ASSESSMENTS;
      case 'Project': return PROJECT_DEFAULT_ASSESSMENTS;
      default: return THEORY_DEFAULT_ASSESSMENTS;
    }
  }, []);

  const blueprint = useMemo(() => {
    if (data && data.assessments.length > 0) {
      hasInitialized.current = true;
      return data;
    }
    return { id: 'bp-init', assessments: [] };
  }, [data]);

  // Initialize assessments only when creating a brand-new blueprint (no existing data)
  useEffect(() => {
    if (!hasInitialized.current && (!data || data.assessments.length === 0)) {
      const templates = getTemplatesForType(activeCourseType);
      const assessments = templates.map((t) => createAssessmentFromTemplate(t));
      onUpdate({ id: `bp-${Date.now()}`, assessments });
      setExpandedAssessments(new Set(assessments.map((a) => a.id)));
      hasInitialized.current = true;
    }
  }, [activeCourseType, getTemplatesForType]);

  // Validate CO codes from approved outcomes
  const validCOs = useMemo(() => outcomes.map((o) => o.code), [outcomes]);

  // ============================================================
  // COMPOSITE GROUP COMPUTATION
  // ============================================================

  const compositeAnalysis = useMemo(() => {
    return computeCompositeGroups(blueprint.assessments);
  }, [blueprint.assessments]);

  // ============================================================
  // COMPLETION VALIDATION (with composite group awareness)
  // ============================================================

  const validation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const { groups, effectiveContributions, totalEffectiveWeightage } = compositeAnalysis;

    // 1. Check effective total weightage = 100%
    if (totalEffectiveWeightage !== 100) {
      errors.push(`Total effective weightage is ${totalEffectiveWeightage}% — must equal 100%`);
    }

    // 2. For each composite group (e.g., CIA), add informational breakdown as warnings
    for (const group of groups) {
      if (group.calculation === 'average' && group.members.length > 1) {
        const weightagesStr = group.members.map((m) => `${m.name}: ${m.weightage}%`).join(' + ');
        warnings.push(
          `"${group.groupId.toUpperCase()}" group: ${weightagesStr} → Average = ${group.effectiveWeightage}% (effective contribution)`
        );
      }
      if (group.calculation === 'average' && group.members.length < 2) {
        errors.push(`"${group.groupId.toUpperCase()}" composite group needs at least 2 assessments for averaging`);
      }
    }

    // 3. Each assessment needs questions
    for (const assessment of blueprint.assessments) {
      // Check assessment-level questions
      if (assessment.questions.length === 0 && (!assessment.components || assessment.components.length === 0)) {
        errors.push(`"${assessment.name}" has no questions configured`);
      }

      const totalQMarks = calculateEffectiveTotalMarks(assessment.questions);
      if (assessment.questions.length > 0 && totalQMarks !== assessment.defaultMarks) {
        errors.push(`"${assessment.name}": Total effective question marks (${totalQMarks}) ≠ assessment marks (${assessment.defaultMarks})`);
      }

      for (const q of assessment.questions) {
        if (!q.mappedCO || !validCOs.includes(q.mappedCO)) {
          errors.push(`"${assessment.name}" Q${q.questionNumber}: Missing or invalid CO mapping`);
        }
        if (!q.bloomsLevel) {
          errors.push(`"${assessment.name}" Q${q.questionNumber}: Missing Bloom's Taxonomy level`);
        }
      }

      // Check component-level questions
      if (assessment.components && assessment.components.length > 0) {
        for (const comp of assessment.components) {
          const compQuestions = comp.questions || [];
          if (compQuestions.length === 0) {
            errors.push(`"${assessment.name} → ${comp.name}" has no questions configured`);
          }
          const compTotalQMarks = calculateEffectiveTotalMarks(compQuestions);
          if (compQuestions.length > 0 && compTotalQMarks !== comp.marks) {
            errors.push(`"${assessment.name} → ${comp.name}": Total effective question marks (${compTotalQMarks}) ≠ component marks (${comp.marks})`);
          }
          for (const q of compQuestions) {
            if (!q.mappedCO || !validCOs.includes(q.mappedCO)) {
              errors.push(`"${assessment.name} → ${comp.name}" Q${q.questionNumber}: Missing or invalid CO mapping`);
            }
            if (!q.bloomsLevel) {
              errors.push(`"${assessment.name} → ${comp.name}" Q${q.questionNumber}: Missing Bloom's Taxonomy level`);
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      totalWeightage: blueprint.assessments.reduce((s, a) => s + a.weightage, 0),
      totalEffectiveWeightage,
      compositeGroups: groups,
      effectiveContributions,
      assessmentsWithQuestions: blueprint.assessments.filter((a) => a.questions.length > 0).length,
    };
  }, [blueprint, validCOs, compositeAnalysis]);

  // ============================================================
  // ASSESSMENT CRUD
  // ============================================================

  const toggleExpand = (id: string) => {
    setExpandedAssessments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateAssessment = (assessmentId: string, updates: Partial<Assessment>) => {
    onUpdate({
      ...blueprint,
      assessments: blueprint.assessments.map((a) =>
        a.id === assessmentId ? { ...a, ...updates } : a
      ),
    });
  };

  const removeAssessment = (assessmentId: string) => {
    onUpdate({
      ...blueprint,
      assessments: blueprint.assessments.filter((a) => a.id !== assessmentId),
    });
  };

  const moveAssessment = (index: number, direction: 'up' | 'down') => {
    const newAssessments = [...blueprint.assessments];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newAssessments.length) return;
    [newAssessments[index], newAssessments[targetIndex]] = [newAssessments[targetIndex], newAssessments[index]];
    onUpdate({ ...blueprint, assessments: newAssessments });
  };

  const addAdditionalAssessment = (typeName: string) => {
    const exists = blueprint.assessments.find((a) => a.name === typeName);
    if (exists) return;
    const newAssessment: Assessment = {
      id: `assess-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: typeName,
      assessmentType: 'Continuous Internal Assessment (CIA)',
      defaultMarks: 10,
      weightage: 5,
      questions: [],
    };
    onUpdate({
      ...blueprint,
      assessments: [...blueprint.assessments, newAssessment],
    });
    setExpandedAssessments((prev) => new Set(prev).add(newAssessment.id));
  };

  // ============================================================
  // QUESTION CRUD
  // ============================================================

  const addQuestion = (assessmentId: string) => {
    const assessment = blueprint.assessments.find((a) => a.id === assessmentId);
    if (!assessment) return;
    const nextQNo = assessment.questions.length + 1;
    const newQuestion: AssessmentQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      questionNumber: `Q${nextQNo}`,
      question: '',
      questionType: 'Descriptive',
      maxMarks: assessment.defaultMarks > 0 ? Math.min(5, assessment.defaultMarks) : 5,
      mappedCO: validCOs[0] || 'CO1',
      bloomsLevel: 'Remember',
    };
    updateAssessment(assessmentId, {
      questions: [...assessment.questions, newQuestion],
    });
  };

  const updateQuestion = (assessmentId: string, questionId: string, updates: Partial<AssessmentQuestion>) => {
    const assessment = blueprint.assessments.find((a) => a.id === assessmentId);
    if (!assessment) return;
    updateAssessment(assessmentId, {
      questions: assessment.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const removeQuestion = (assessmentId: string, questionId: string) => {
    const assessment = blueprint.assessments.find((a) => a.id === assessmentId);
    if (!assessment) return;
    updateAssessment(assessmentId, {
      questions: assessment.questions.filter((q) => q.id !== questionId),
    });
  };

  // ============================================================
  // LAB COMPONENT CRUD
  // ============================================================

  const addComponent = (assessmentId: string) => {
    const assessment = blueprint.assessments.find((a) => a.id === assessmentId);
    if (!assessment) return;
    const components = assessment.components || [];
    const newComp: LabComponent = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: 'New Component',
      marks: 0,
    };
    updateAssessment(assessmentId, {
      components: [...components, newComp],
    });
  };

  const updateComponent = (assessmentId: string, componentId: string, updates: Partial<LabComponent>) => {
    const assessment = blueprint.assessments.find((a) => a.id === assessmentId);
    if (!assessment) return;
    const components = assessment.components || [];
    updateAssessment(assessmentId, {
      components: components.map((c) =>
        c.id === componentId ? { ...c, ...updates } : c
      ),
    });
  };

  const removeComponent = (assessmentId: string, componentId: string) => {
    const assessment = blueprint.assessments.find((a) => a.id === assessmentId);
    if (!assessment) return;
    const components = assessment.components || [];
    updateAssessment(assessmentId, {
      components: components.filter((c) => c.id !== componentId),
    });
  };

  // ============================================================
  // COMPONENT QUESTION CRUD
  // ============================================================

  const addComponentQuestion = (assessmentId: string, componentId: string) => {
    const assessment = blueprint.assessments.find((a) => a.id === assessmentId);
    if (!assessment) return;
    const comp = assessment.components?.find((c) => c.id === componentId);
    if (!comp) return;
    const compQuestions = comp.questions || [];
    const nextQNo = compQuestions.length + 1;
    const newQuestion: AssessmentQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      questionNumber: `Q${nextQNo}`,
      question: '',
      questionType: 'Descriptive',
      maxMarks: comp.marks > 0 ? Math.min(5, comp.marks) : 5,
      mappedCO: validCOs[0] || 'CO1',
      bloomsLevel: 'Remember',
    };
    updateComponent(assessmentId, componentId, {
      questions: [...compQuestions, newQuestion],
    });
  };

  const updateComponentQuestion = (
    assessmentId: string,
    componentId: string,
    questionId: string,
    updates: Partial<AssessmentQuestion>
  ) => {
    const assessment = blueprint.assessments.find((a) => a.id === assessmentId);
    if (!assessment) return;
    const comp = assessment.components?.find((c) => c.id === componentId);
    if (!comp) return;
    const compQuestions = comp.questions || [];
    updateComponent(assessmentId, componentId, {
      questions: compQuestions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const removeComponentQuestion = (assessmentId: string, componentId: string, questionId: string) => {
    const assessment = blueprint.assessments.find((a) => a.id === assessmentId);
    if (!assessment) return;
    const comp = assessment.components?.find((c) => c.id === componentId);
    if (!comp) return;
    const compQuestions = comp.questions || [];
    updateComponent(assessmentId, componentId, {
      questions: compQuestions.filter((q) => q.id !== questionId),
    });
  };

  // ============================================================
  // CSV HANDLERS
  // ============================================================

  const componentFileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // ============================================================
  // DOWNLOAD TEMPLATE HANDLER
  // ============================================================

  const handleDownloadAssessmentTemplate = useCallback(
    (assessmentId: string) => {
      const assessment = blueprint.assessments.find((a) => a.id === assessmentId);
      if (!assessment) return;
      const csv = generateMidExamCSVTemplate();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_${assessment.name.replace(/\s+/g, '_')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [blueprint.assessments]
  );

  const handleDownloadCSV = useCallback(
    (assessmentId: string) => {
      const assessment = blueprint.assessments.find((a) => a.id === assessmentId);
      if (!assessment) return;
      // Use the enhanced CSV format (with Section, Parent Question, Attempt Rule) for all assessments
      const csv = generateMidExamCSV(assessment.questions);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questions_${assessment.name.replace(/\s+/g, '_')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [blueprint.assessments]
  );

  const handleDownloadComponentTemplate = useCallback(
    (assessmentId: string, componentId: string) => {
      const assessment = blueprint.assessments.find((a) => a.id === assessmentId);
      if (!assessment) return;
      const comp = assessment.components?.find((c) => c.id === componentId);
      if (!comp) return;
      const csv = generateMidExamCSVTemplate();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_${comp.name.replace(/\s+/g, '_')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [blueprint.assessments]
  );

  const handleDownloadComponentCSV = useCallback(
    (assessmentId: string, componentId: string) => {
      const assessment = blueprint.assessments.find((a) => a.id === assessmentId);
      if (!assessment) return;
      const comp = assessment.components?.find((c) => c.id === componentId);
      if (!comp) return;
      const csv = generateMidExamCSV(comp.questions || []);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questions_${comp.name.replace(/\s+/g, '_')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [blueprint.assessments]
  );

  const handleUploadComponentCSV = useCallback(
    (assessmentId: string, componentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setCsvImportErrors(new Map());
      setCsvImportSuccess(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const { questions: importedQs, errors: parseErrors } = parseMidExamCSV(text, validCOs);

        const assessment = blueprint.assessments.find((a) => a.id === assessmentId);
        if (!assessment) return;
        const comp = assessment.components?.find((c) => c.id === componentId);
        if (!comp) return;

        if (parseErrors.length > 0) {
          setCsvImportErrors((prev) => new Map(prev).set(`${assessmentId}-${componentId}`, parseErrors));
        }

        if (importedQs.length === 0) return;

        if (parseErrors.length > 0) return;

        // Normalize L1-L6 bloom levels to word form
        const bloomMap: Record<string, BloomsTaxonomyLevel> = {
          'L1': 'Remember', 'L2': 'Understand', 'L3': 'Apply',
          'L4': 'Analyze', 'L5': 'Evaluate', 'L6': 'Create',
        };

        const newQuestions: AssessmentQuestion[] = importedQs.map((r, idx) => ({
          id: `q-csv-${Date.now()}-${idx}`,
          questionNumber: r.questionNumber,
          question: r.questionText,
          questionType: (r.questionCategory as QuestionType) || 'Descriptive',
          maxMarks: r.maxMarks,
          mappedCO: r.mappedCO,
          bloomsLevel: (bloomMap[r.bloomsLevel.toUpperCase()] || r.bloomsLevel) as BloomsTaxonomyLevel,
          section: r.section || undefined,
          parentQuestion: r.parentQuestion || undefined,
          attemptRule: (r.attemptRule as 'Mandatory' | 'Optional') || undefined,
          displayOrder: r.displayOrder ? parseInt(r.displayOrder) : undefined,
        }));

        // Compute the effective total marks from all questions (existing + new)
        const allCompQuestions = [...(comp.questions || []), ...newQuestions];
        const effectiveCompTotal = calculateEffectiveTotalMarks(allCompQuestions);

        // Auto-update component marks and parent assessment defaultMarks based on CSV data
        const updatedComponents = (assessment.components || []).map((c) =>
          c.id === componentId
            ? { ...c, questions: allCompQuestions, marks: effectiveCompTotal }
            : c
        );
        const newDefaultMarks = updatedComponents.reduce((s, c) => s + c.marks, 0);

        onUpdate({
          ...blueprint,
          assessments: blueprint.assessments.map((a) =>
            a.id === assessmentId
              ? { ...a, defaultMarks: newDefaultMarks, components: updatedComponents }
              : a
          ),
        });

        const marksNote = effectiveCompTotal !== comp.marks
          ? ` (marks auto-adjusted: ${comp.marks} -> ${effectiveCompTotal})`
          : '';
        setCsvImportSuccess(
          `\u2705 Imported ${newQuestions.length} questions into "${comp.name}"${marksNote}`
        );

        const inputEl = componentFileInputRefs.current.get(`${assessmentId}-${componentId}`);
        if (inputEl) {
          inputEl.value = '';
        }
      };

      reader.onerror = () => {
        setCsvImportErrors((prev) =>
          new Map(prev).set(`${assessmentId}-${componentId}`, ['Failed to read the CSV file'])
        );
      };

      reader.readAsText(file);
    },
    [blueprint.assessments, validCOs]
  );

  const handleUploadCSV = useCallback(
    (assessmentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setCsvImportErrors(new Map());
      setCsvImportSuccess(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        // Use the enhanced CSV parser (with Section, Parent Question, Attempt Rule) for all assessments
        const { questions: importedQs, errors: parseErrors } = parseMidExamCSV(text, validCOs);

        const assessment = blueprint.assessments.find((a) => a.id === assessmentId);
        if (!assessment) return;

        if (parseErrors.length > 0) {
          setCsvImportErrors((prev) => new Map(prev).set(assessmentId, parseErrors));
        }

        if (importedQs.length === 0) return;

        if (parseErrors.length > 0) return;

        // Normalize L1-L6 bloom levels to word form
        const bloomMap: Record<string, BloomsTaxonomyLevel> = {
          'L1': 'Remember', 'L2': 'Understand', 'L3': 'Apply',
          'L4': 'Analyze', 'L5': 'Evaluate', 'L6': 'Create',
        };

        const newQuestions: AssessmentQuestion[] = importedQs.map((r, idx) => ({
          id: `q-csv-${Date.now()}-${idx}`,
          questionNumber: r.questionNumber,
          question: r.questionText,
          questionType: (r.questionCategory as QuestionType) || 'Descriptive',
          maxMarks: r.maxMarks,
          mappedCO: r.mappedCO,
          bloomsLevel: (bloomMap[r.bloomsLevel.toUpperCase()] || r.bloomsLevel) as BloomsTaxonomyLevel,
          section: r.section || undefined,
          parentQuestion: r.parentQuestion || undefined,
          attemptRule: (r.attemptRule as 'Mandatory' | 'Optional') || undefined,
          displayOrder: r.displayOrder ? parseInt(r.displayOrder) : undefined,
        }));

        // Compute the effective total marks (existing + new) and auto-update defaultMarks
        const allAssessmentQuestions = [...assessment.questions, ...newQuestions];
        const effectiveTotal = calculateEffectiveTotalMarks(allAssessmentQuestions);

        onUpdate({
          ...blueprint,
          assessments: blueprint.assessments.map((a) =>
            a.id === assessmentId
              ? { ...a, questions: allAssessmentQuestions, defaultMarks: effectiveTotal }
              : a
          ),
        });

        const marksNote = effectiveTotal !== assessment.defaultMarks
          ? ` (marks auto-adjusted: ${assessment.defaultMarks} -> ${effectiveTotal})`
          : '';
        setCsvImportSuccess(
          `\u2705 Imported ${newQuestions.length} questions into "${assessment.name}"${marksNote}`
        );

        if (fileInputRefs.current.get(assessmentId)) {
          fileInputRefs.current.get(assessmentId)!.value = '';
        }
      };

      reader.onerror = () => {
        setCsvImportErrors((prev) =>
          new Map(prev).set(assessmentId, ['Failed to read the CSV file'])
        );
      };

      reader.readAsText(file);
    },
    [blueprint.assessments, validCOs]
  );

  const setFileInputRef = useCallback((assessmentId: string, el: HTMLInputElement | null) => {
    if (el) {
      fileInputRefs.current.set(assessmentId, el);
    } else {
      fileInputRefs.current.delete(assessmentId);
    }
  }, []);

  const setComponentFileInputRef = useCallback((key: string, el: HTMLInputElement | null) => {
    if (el) {
      componentFileInputRefs.current.set(key, el);
    } else {
      componentFileInputRefs.current.delete(key);
    }
  }, []);

  // ============================================================
  // ASSESSMENT STATUS & HELPERS
  // ============================================================

  /** Count total questions across an assessment (top-level + components) */
  const getAssessmentTotalQuestionCount = useCallback((assessment: Assessment): number => {
    const topLevel = assessment.questions?.length || 0;
    const componentLevel = (assessment.components || []).reduce(
      (sum, comp) => sum + (comp.questions?.length || 0), 0
    );
    return topLevel + componentLevel;
  }, []);

  /** Check if an assessment has any questions (top-level or in components) */
  const doesAssessmentHaveQuestions = useCallback((assessment: Assessment): boolean => {
    if (assessment.questions && assessment.questions.length > 0) return true;
    return (assessment.components || []).some((comp) => (comp.questions?.length || 0) > 0);
  }, []);

  const getAssessmentStatus = useCallback((assessment: Assessment): 'complete' | 'pending' | 'error' => {
    const hasTopLevelQuestions = assessment.questions.length > 0;
    const hasComponentQuestions = (assessment.components || []).some((c) => (c.questions?.length || 0) > 0);

    if (!hasTopLevelQuestions && !hasComponentQuestions) return 'pending';

    // Check top-level questions if any
    if (hasTopLevelQuestions) {
      const totalQMarks = calculateEffectiveTotalMarks(assessment.questions);
      if (totalQMarks !== assessment.defaultMarks) return 'error';
      const allMapped = assessment.questions.every((q) => q.mappedCO && validCOs.includes(q.mappedCO));
      const allBloom = assessment.questions.every((q) => q.bloomsLevel);
      if (!allMapped || !allBloom) return 'error';
    }

    // Check component-level questions if any
    if (hasComponentQuestions) {
      for (const comp of assessment.components || []) {
        const compQuestions = comp.questions || [];
        if (compQuestions.length > 0) {
          const compTotalQMarks = calculateEffectiveTotalMarks(compQuestions);
          if (compTotalQMarks !== comp.marks) return 'error';
          const allMapped = compQuestions.every((q) => q.mappedCO && validCOs.includes(q.mappedCO));
          const allBloom = compQuestions.every((q) => q.bloomsLevel);
          if (!allMapped || !allBloom) return 'error';
        }
      }
    }

    return 'complete';
  }, [validCOs]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-indigo-600" />
            Assessment Blueprint
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Define how the course is assessed — supports composite groups (e.g., CIA averaged), SEE, and additional assessments
          </p>
        </div>
        <div className="flex items-center gap-3">
          {validation.valid && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Ready for Marks Upload
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">{completionPercentage}% Complete</Badge>
        </div>
      </div>
      <Separator />

      {/* ===== COURSE TYPE SECTION ===== */}
      <Card className="border-border/50 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-stretch">
            <div className="flex items-center gap-3 px-4 py-3 min-w-0 flex-1">
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
                activeCourseType === 'Theory' && 'bg-blue-500/15 text-blue-600',
                activeCourseType === 'Lab' && 'bg-purple-500/15 text-purple-600',
                activeCourseType === 'Project' && 'bg-teal-500/15 text-teal-600',
              )}>
                {courseMeta.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{courseMeta.label}</span>
                  <Badge variant="outline" className={cn('text-[9px]', courseMeta.color)}>
                    {activeCourseType}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {courseMeta.description}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 px-5 py-3 bg-muted/20 border-l border-border/30 shrink-0">
              <div className="text-center">
                <p className="text-lg font-bold text-indigo-600">{blueprint.assessments.length}</p>
                <p className="text-[9px] text-muted-foreground">Assessments</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-600">
                  {blueprint.assessments.filter((a) => doesAssessmentHaveQuestions(a)).length}
                </p>
                <p className="text-[9px] text-muted-foreground">Configured</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center">
                <p className={cn(
                  'text-lg font-bold',
                  validation.totalEffectiveWeightage === 100 ? 'text-emerald-600' : 'text-amber-600'
                )}>
                  {validation.totalEffectiveWeightage}%
                </p>
                <p className="text-[9px] text-muted-foreground">Effective</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== COMPOSITE GROUP BREAKDOWN (e.g., CIA Calculation) ===== */}
      {validation.compositeGroups.length > 0 && (
        <Card className="border-border/50 border-indigo-500/20 bg-gradient-to-r from-indigo-500/[0.03] to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <Sigma className="h-3.5 w-3.5 text-indigo-600" />
              Composite Group Score Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {validation.compositeGroups.map((group) => (
              <div key={group.groupId} className="rounded-lg border border-border/50 bg-background/80 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[9px] uppercase">
                    {group.groupId} Group
                  </Badge>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[8px]">
                    <Divide className="h-2.5 w-2.5 mr-0.5" />
                    {group.calculation === 'average' ? 'Averaged' : 'Summed'}
                  </Badge>
                </div>

                {/* Members list */}
                <div className="space-y-1.5 ml-1">
                  {group.members.map((m, idx) => (
                    <div key={m.id} className="flex items-center gap-2 text-[10px]">
                      <span className="text-muted-foreground w-4">{idx + 1}.</span>
                      <span className="font-medium flex-1">{m.name}</span>
                      <span className="text-muted-foreground">{m.defaultMarks} marks</span>
                      <span className="font-semibold text-indigo-600">{m.weightage}%</span>
                      {idx < group.members.length - 1 && (
                        <span className="text-[9px] text-muted-foreground mx-1">+</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Calculation formula */}
                <div className="mt-2 pt-2 border-t border-border/30 flex items-center gap-2 text-[10px]">
                  <Calculator className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {group.calculation === 'average' ? (
                      <>Effective = avg({group.members.map((m) => `${m.weightage}%`).join(', ')}) = <strong className="text-indigo-600">{group.effectiveWeightage}%</strong></>
                    ) : (
                      <>Effective = sum({group.members.map((m) => `${m.weightage}%`).join(', ')}) = <strong className="text-indigo-600">{group.effectiveWeightage}%</strong></>
                    )}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[200px] text-[10px]">
                        {group.calculation === 'average'
                          ? 'The effective contribution is the average of all assessments in this group, not the sum.'
                          : 'The effective contribution is the sum of all assessments in this group.'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Effective marks */}
                <div className="mt-1 text-[9px] text-muted-foreground">
                  Effective marks: <strong>{group.effectiveMarks}</strong> (average of {group.members.map((m) => m.defaultMarks).join(', ')})
                </div>
              </div>
            ))}

            {/* Total effective weightage breakdown */}
            <div className="flex items-center justify-between px-1 pt-1">
              <span className="text-[9px] text-muted-foreground">
                SEE + Additional assessments must complete to 100%
              </span>
              <span className={cn(
                'text-[10px] font-bold',
                validation.totalEffectiveWeightage === 100 ? 'text-emerald-600' : 'text-amber-600'
              )}>
                = {validation.totalEffectiveWeightage}% / 100%
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== ASSESSMENT LIST ===== */}
      {blueprint.assessments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border/50">
          <ClipboardList className="h-14 w-14 text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-muted-foreground">No assessments defined</p>
          <p className="text-xs text-muted-foreground mt-1">The course type will automatically load the default assessment template</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {blueprint.assessments.map((assessment, index) => {
              const isExpanded = expandedAssessments.has(assessment.id);
              const status = getAssessmentStatus(assessment);
              const totalQMarks = calculateEffectiveTotalMarks(assessment.questions);
              const compTotal = (assessment.components || []).reduce((s, c) => s + c.marks, 0);
              const typeMeta = ASSESSMENT_TYPE_META[assessment.assessmentType || ''] || { color: 'bg-gray-500/10 text-gray-600 border-gray-500/20', shortLabel: 'NA' };
              const effectiveContrib = validation.effectiveContributions.get(assessment.id);
              const hasComposite = !!assessment.compositeGroupId;
              const isEffectiveDifferent = effectiveContrib !== undefined && effectiveContrib !== assessment.weightage;

              return (
                <motion.div
                  key={assessment.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={cn(
                      'border-border/50 overflow-hidden transition-all',
                      isExpanded && 'ring-1 ring-indigo-500/20',
                      status === 'complete' && 'border-emerald-500/30',
                      status === 'error' && 'border-amber-500/30',
                      hasComposite && 'border-l-2 border-l-indigo-400/40'
                    )}
                  >
                    {/* Assessment Header */}
                    <div
                      className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => toggleExpand(assessment.id)}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0 text-muted-foreground"
                        onClick={(e) => { e.stopPropagation(); moveAssessment(index, 'up'); }}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0 text-muted-foreground"
                        onClick={(e) => { e.stopPropagation(); moveAssessment(index, 'down'); }}
                        disabled={index === blueprint.assessments.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>

                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        {/* Composite group badge */}
                        {hasComposite && (
                          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[7px] px-1 py-0">
                            {assessment.compositeGroupId?.toUpperCase()}
                          </Badge>
                        )}
                        <Badge variant="outline" className={cn('text-[8px] px-1.5 py-0', typeMeta.color)}>
                          {typeMeta.shortLabel}
                        </Badge>
                        <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                        <span className="text-sm font-semibold truncate">{assessment.name}</span>
                        {status === 'complete' && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[8px]">
                            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                            Complete
                          </Badge>
                        )}
                        {status === 'pending' && (
                          <Badge variant="outline" className="text-[8px] text-muted-foreground">
                            No questions
                          </Badge>
                        )}
                        {status === 'error' && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[8px]">
                            <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                            Needs review
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                        <span className="hidden sm:inline">{getAssessmentTotalQuestionCount(assessment)} Qs</span>
                        <span className="hidden sm:inline">|</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-help">
                                {assessment.defaultMarks} marks
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="text-[9px]">
                              {isEffectiveDifferent
                                ? `Individual: ${assessment.weightage}% → Effective: ${effectiveContrib}% (averaged in group)`
                                : `Contributes ${assessment.weightage}% to final grade`}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {isEffectiveDifferent ? (
                          <span className="font-semibold text-amber-500">
                            {effectiveContrib}% eff.
                          </span>
                        ) : (
                          <span className="font-semibold text-indigo-600">{assessment.weightage}%</span>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive shrink-0"
                        onClick={(e) => { e.stopPropagation(); removeAssessment(assessment.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>

                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Separator />
                          <CardContent className="p-4 space-y-4">
                            {/* Composite Group Info Banner */}
                            {hasComposite && (
                              <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/20 p-2">
                                <div className="flex items-center gap-2 text-[10px] text-indigo-700 dark:text-indigo-400">
                                  <Sigma className="h-3 w-3 shrink-0" />
                                  <span>
                                    Part of <strong>{assessment.compositeGroupId?.toUpperCase()}</strong> composite group —
                                    effective contribution: <strong>{validation.effectiveContributions.get(assessment.id) || assessment.weightage}%</strong>
                                    {' '}({assessment.compositeCalculation === 'average' ? 'averaged' : 'summed'} with other group members)
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Row 1: Assessment Name + Type */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                                  <ScrollText className="h-3 w-3" />
                                  Assessment Name
                                </Label>
                                <Input
                                  value={assessment.name}
                                  onChange={(e) => updateAssessment(assessment.id, { name: e.target.value })}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  Assessment Type
                                </Label>
                                <Select
                                  value={assessment.assessmentType || ''}
                                  onValueChange={(v) => updateAssessment(assessment.id, { assessmentType: v })}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select type..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ASSESSMENT_TYPES.map((type) => {
                                      const meta = ASSESSMENT_TYPE_META[type] || {};
                                      return (
                                        <SelectItem key={type} value={type} className="text-xs">
                                          <span className="flex items-center gap-2">
                                            <Badge variant="outline" className={cn('text-[8px] px-1', meta.color || '')}>
                                              {meta.shortLabel || type}
                                            </Badge>
                                            {type}
                                          </span>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Row 2: Marks + Weightage */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                                  <Weight className="h-3 w-3" />
                                  Maximum Marks
                                </Label>
                                <Input
                                  type="number"
                                  value={assessment.defaultMarks}
                                  onChange={(e) => updateAssessment(assessment.id, { defaultMarks: parseInt(e.target.value) || 0 })}
                                  className="h-8 text-xs"
                                  min={0}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                                  <Layers className="h-3 w-3" />
                                  Weightage (%)
                                </Label>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    value={assessment.weightage}
                                    onChange={(e) => updateAssessment(assessment.id, { weightage: parseInt(e.target.value) || 0 })}
                                    className={cn(
                                      'h-8 text-xs pr-8',
                                      isEffectiveDifferent && 'border-amber-400/50'
                                    )}
                                    min={0}
                                    max={100}
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                                </div>
                                {isEffectiveDifferent && (
                                  <p className="text-[8px] text-amber-600 mt-0.5">
                                    Effective contribution: {effectiveContrib}% (averaged within composite group)
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Composite group config (for assessments that have it) */}
                            {hasComposite && (
                              <div className="flex items-center gap-2 text-[9px] text-muted-foreground bg-muted/10 rounded p-2">
                                <Info className="h-3 w-3 shrink-0" />
                                <span>
                                  Composite group: <strong>{assessment.compositeGroupId}</strong> · Calculation: <strong>{assessment.compositeCalculation}</strong>
                                </span>
                              </div>
                            )}

                            {/* Components Section — Each component has its own question management */}
                            {(activeCourseType === 'Lab' || (activeCourseType === 'Theory' && assessment.components && assessment.components.length > 0)) && assessment.components !== undefined && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5">
                                    <ListChecks className="h-3 w-3" />
                                    Assessment Components
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      'text-[10px] font-medium',
                                      compTotal === assessment.defaultMarks ? 'text-emerald-600' : 'text-amber-600'
                                    )}>
                                      Total: {compTotal} / {assessment.defaultMarks}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-[10px] gap-1"
                                      onClick={() => addComponent(assessment.id)}
                                    >
                                      <Plus className="h-3 w-3" />
                                      Add Component
                                    </Button>
                                  </div>
                                </div>

                                {/* Per-Component Question Sections */}
                                <div className="space-y-4">
                                  {assessment.components.map((comp) => {
                                    const compQuestions = comp.questions || [];                                     const compTotalQMarks = calculateEffectiveTotalMarks(compQuestions);
                                    const compFileInputKey = `${assessment.id}-${comp.id}`;

                                    return (
                                      <Card key={comp.id} className="border-border/40 overflow-hidden">
                                        <CardContent className="p-3 space-y-3">
                                          {/* Component Header */}
                                          <div className="flex items-center gap-2">
                                            <Input
                                              value={comp.name}
                                              onChange={(e) => updateComponent(assessment.id, comp.id, { name: e.target.value })}
                                              className="h-7 text-[10px] flex-1 font-semibold"
                                              placeholder="Component name"
                                            />
                                            <div className="flex items-center gap-1">
                                              <Input
                                                type="number"
                                                value={comp.marks}
                                                onChange={(e) => updateComponent(assessment.id, comp.id, { marks: parseInt(e.target.value) || 0 })}
                                                className="h-7 text-[10px] w-16 text-center font-bold"
                                                placeholder="Marks"
                                                min={0}
                                              />
                                              <span className="text-[10px] text-muted-foreground">marks</span>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7 text-destructive shrink-0"
                                              onClick={() => removeComponent(assessment.id, comp.id)}
                                            >
                                              <X className="h-3 w-3" />
                                            </Button>
                                          </div>

                                          {/* Component Questions Management */}
                                          <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                              <Label className="text-[9px] font-medium text-muted-foreground flex items-center gap-1">
                                                <ClipboardList className="h-3 w-3" />
                                                Questions for {comp.name}
                                                <Badge variant="secondary" className="text-[7px] ml-1 px-1">
                                                  {compQuestions.length} configured
                                                </Badge>
                                                {compQuestions.length > 0 && (
                                                  <span className={cn(
                                                    'text-[9px]',
                                                    compTotalQMarks === comp.marks ? 'text-emerald-600' : 'text-amber-600'
                                                  )}>
                                                    (Total: {compTotalQMarks}/{comp.marks})
                                                  </span>
                                                )}
                                              </Label>
                                              <div className="flex items-center gap-1">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-6 text-[9px] gap-1 px-1.5"
                                                  onClick={() => handleDownloadComponentTemplate(assessment.id, comp.id)}
                                                >
                                                  <FileDown className="h-2.5 w-2.5" />
                                                  Template
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-6 text-[9px] gap-1 px-1.5"
                                                  onClick={() => handleDownloadComponentCSV(assessment.id, comp.id)}
                                                  disabled={compQuestions.length === 0}
                                                >
                                                  <FileDown className="h-2.5 w-2.5" />
                                                  CSV
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="h-6 text-[9px] gap-1 px-1.5"
                                                  onClick={() => componentFileInputRefs.current.get(compFileInputKey)?.click()}
                                                >
                                                  <Upload className="h-2.5 w-2.5" />
                                                  Upload
                                                </Button>
                                                <input
                                                  ref={(el) => setComponentFileInputRef(compFileInputKey, el)}
                                                  type="file"
                                                  accept=".csv"
                                                  className="hidden"
                                                  onChange={(e) => handleUploadComponentCSV(assessment.id, comp.id, e)}
                                                />
                                                <Button
                                                  variant="default"
                                                  size="sm"
                                                  className="h-6 text-[9px] gap-1 px-1.5"
                                                  onClick={() => addComponentQuestion(assessment.id, comp.id)}
                                                >
                                                  <Plus className="h-2.5 w-2.5" />
                                                  Add
                                                </Button>
                                              </div>
                                            </div>

                                            {/* Component CSV Import Errors */}
                                            {csvImportErrors.get(compFileInputKey)?.length > 0 && (
                                              <div className="rounded border border-red-500/30 bg-red-500/5 p-1.5 space-y-0.5">
                                                <div className="flex items-center gap-1">
                                                  <AlertCircle className="h-2.5 w-2.5 text-red-600 shrink-0" />
                                                  <p className="text-[8px] font-semibold text-red-700 dark:text-red-400">Import Errors</p>
                                                </div>
                                                {csvImportErrors.get(compFileInputKey)?.map((err, idx) => (
                                                  <p key={idx} className="text-[7px] text-red-600/80 ml-4">• {err}</p>
                                                ))}
                                              </div>
                                            )}

                                            {/* Component Questions Table */}
                                            {compQuestions.length > 0 ? (
                                              <div className="rounded border overflow-hidden">
                                                <ScrollArea className="max-w-full">
                                                  <table className="w-full text-[9px]">
                                                    <thead>
                                                      <tr className="bg-muted/30">
                                                        <th className="text-left p-1 font-semibold w-12">Q. No</th>
                                                        <th className="text-left p-1 font-semibold min-w-[120px]">Question</th>
                                                        <th className="text-left p-1 font-semibold w-20">Type</th>
                                                        <th className="text-center p-1 font-semibold w-10">Marks</th>
                                                        <th className="text-center p-1 font-semibold w-10">CO</th>
                                                        <th className="text-center p-1 font-semibold w-[60px]">Bloom</th>
                                                        <th className="text-center p-1 font-semibold w-[50px]">Section</th>
                                                        <th className="text-center p-1 font-semibold w-[50px]">Parent Q</th>
                                                        <th className="text-center p-1 font-semibold w-[50px]">Rule</th>
                                                        <th className="text-center p-1 font-semibold w-[50px]">Order</th>
                                                        <th className="text-right p-1 font-semibold w-8"></th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {compQuestions.map((q) => (
                                                        <tr key={q.id} className="border-t border-border/30 hover:bg-muted/5">
                                                          <td className="p-0.5">
                                                            <Input
                                                              value={q.questionNumber}
                                                              onChange={(e) => updateComponentQuestion(assessment.id, comp.id, q.id, { questionNumber: e.target.value })}
                                                              className="h-6 text-[9px] font-mono"
                                                            />
                                                          </td>
                                                          <td className="p-0.5">
                                                            <Input
                                                              value={q.question}
                                                              onChange={(e) => updateComponentQuestion(assessment.id, comp.id, q.id, { question: e.target.value })}
                                                              className="h-6 text-[9px]"
                                                              placeholder="Question text"
                                                            />
                                                          </td>
                                                          <td className="p-0.5">
                                                            <Select
                                                              value={q.questionType}
                                                              onValueChange={(v: QuestionType) => updateComponentQuestion(assessment.id, comp.id, q.id, { questionType: v })}
                                                            >
                                                              <SelectTrigger className="h-6 text-[9px]">
                                                                <SelectValue />
                                                              </SelectTrigger>
                                                              <SelectContent>
                                                                {QUESTION_TYPES.map((t) => (
                                                                  <SelectItem key={t} value={t} className="text-[9px]">{t}</SelectItem>
                                                                ))}
                                                              </SelectContent>
                                                            </Select>
                                                          </td>
                                                          <td className="p-0.5">
                                                            <Input
                                                              type="number"
                                                              value={q.maxMarks}
                                                              onChange={(e) => updateComponentQuestion(assessment.id, comp.id, q.id, { maxMarks: parseInt(e.target.value) || 0 })}
                                                              className="h-6 text-[9px] text-center w-full"
                                                              min={0}
                                                            />
                                                          </td>
                                                          <td className="p-0.5">
                                                            <Select
                                                              value={q.mappedCO}
                                                              onValueChange={(v) => updateComponentQuestion(assessment.id, comp.id, q.id, { mappedCO: v })}
                                                            >
                                                              <SelectTrigger className="h-6 text-[9px]">
                                                                <SelectValue />
                                                              </SelectTrigger>
                                                              <SelectContent>
                                                                {validCOs.length > 0 ? (
                                                                  validCOs.map((co) => (
                                                                    <SelectItem key={co} value={co} className="text-[9px]">{co}</SelectItem>
                                                                  ))
                                                                ) : (
                                                                  <SelectItem value="CO1" className="text-[9px]">CO1</SelectItem>
                                                                )}
                                                              </SelectContent>
                                                            </Select>
                                                          </td>
                                                          <td className="p-0.5">
                                                            <Select
                                                              value={q.bloomsLevel}
                                                              onValueChange={(v: BloomsTaxonomyLevel) => updateComponentQuestion(assessment.id, comp.id, q.id, { bloomsLevel: v })}
                                                            >
                                                              <SelectTrigger className="h-6 text-[9px]">
                                                                <SelectValue />
                                                              </SelectTrigger>
                                                              <SelectContent>
                                                                {BLOOMS_TAXONOMY_LEVELS.map((bl) => (
                                                                  <SelectItem key={bl} value={bl} className="text-[9px]">{bl}</SelectItem>
                                                                ))}
                                                              </SelectContent>
                                                            </Select>
                                                          </td>
                                                          <td className="p-0.5">
                                                            <Input
                                                              value={q.section || ''}
                                                              onChange={(e) => updateComponentQuestion(assessment.id, comp.id, q.id, { section: e.target.value })}
                                                              className="h-6 text-[9px] text-center"
                                                              placeholder="A"
                                                              maxLength={1}
                                                            />
                                                          </td>
                                                          <td className="p-0.5">
                                                            <Input
                                                              value={q.parentQuestion || ''}
                                                              onChange={(e) => updateComponentQuestion(assessment.id, comp.id, q.id, { parentQuestion: e.target.value })}
                                                              className="h-6 text-[9px] text-center"
                                                              placeholder="Q11"
                                                            />
                                                          </td>
                                                          <td className="p-0.5">
                                                            <Select
                                                              value={q.attemptRule || ''}                                                               onValueChange={(v) => updateComponentQuestion(assessment.id, comp.id, q.id, { attemptRule: v as 'Mandatory' | 'Optional' })}
                                                            >
                                                              <SelectTrigger className="h-6 text-[9px]">
                                                                <SelectValue />
                                                              </SelectTrigger>
                                                              <SelectContent>                                                                 <SelectItem value="Mandatory" className="text-[9px]">Mandatory</SelectItem>
                                                                 <SelectItem value="Optional" className="text-[9px]">Optional</SelectItem>
                                                              </SelectContent>
                                                            </Select>
                                                          </td>
                                                          <td className="p-0.5">
                                                            <Input
                                                              type="number"
                                                              value={q.displayOrder || ''}
                                                              onChange={(e) => updateComponentQuestion(assessment.id, comp.id, q.id, { displayOrder: parseInt(e.target.value) || undefined })}
                                                              className="h-6 text-[9px] text-center"
                                                              min={1}
                                                            />
                                                          </td>
                                                          <td className="p-0.5 text-right">
                                                            <Button
                                                              variant="ghost"
                                                              size="icon"
                                                              className="h-6 w-6 text-destructive"
                                                              onClick={() => removeComponentQuestion(assessment.id, comp.id, q.id)}
                                                            >
                                                              <Trash2 className="h-2.5 w-2.5" />
                                                            </Button>
                                                          </td>
                                                        </tr>
                                                      ))}
                                                    </tbody>
                                                  </table>
                                                </ScrollArea>
                                              </div>
                                            ) : (
                                              <div className="text-center py-4 rounded border border-dashed border-border/30 bg-muted/5">
                                                <p className="text-[9px] text-muted-foreground">
                                                  No questions for {comp.name}. Click "Add" or "Upload" to configure.
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}

                                  {assessment.components.length === 0 && (
                                    <p className="text-[9px] text-muted-foreground text-center py-2">
                                      No components defined. Click "Add Component" to add assessment components.
                                    </p>
                                  )}
                                </div>
                              </div>                              )}

                             {/* Questions Section — only shown for assessments without components (e.g. SEE) */}
                             {(!assessment.components || assessment.components.length === 0) && (
                               <>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5">
                                  <ClipboardList className="h-3 w-3" />
                                  Questions
                                  <Badge variant="secondary" className="text-[8px] ml-1">
                                    {getAssessmentTotalQuestionCount(assessment)} configured
                                  </Badge>
                                  {doesAssessmentHaveQuestions(assessment) && (
                                    <span className={cn(
                                      'text-[10px] font-medium',
                                      totalQMarks === assessment.defaultMarks ? 'text-emerald-600' : 'text-amber-600'
                                    )}>
                                      (Total: {totalQMarks}/{assessment.defaultMarks} marks)
                                    </span>
                                  )}
                                </Label>
                                <div className="flex items-center gap-1.5">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] gap-1"
                                    onClick={() => handleDownloadAssessmentTemplate(assessment.id)}
                                  >
                                    <FileDown className="h-3 w-3" />
                                    Template
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] gap-1"
                                    onClick={() => handleDownloadCSV(assessment.id)}
                                    disabled={assessment.questions.length === 0}
                                  >
                                    <FileDown className="h-3 w-3" />
                                    Download CSV
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-[10px] gap-1"
                                    onClick={() => fileInputRefs.current.get(assessment.id)?.click()}
                                  >
                                    <Upload className="h-3 w-3" />
                                    Upload CSV
                                  </Button>
                                  <input
                                    ref={(el) => setFileInputRef(assessment.id, el)}
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={(e) => handleUploadCSV(assessment.id, e)}
                                  />
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="h-7 text-[10px] gap-1"
                                    onClick={() => addQuestion(assessment.id)}
                                  >
                                    <Plus className="h-3 w-3" />
                                    Add Question
                                  </Button>
                                </div>
                              </div>

                              {/* CSV Import Errors */}
                              {csvImportErrors.get(assessment.id)?.length > 0 && (
                                <Card className="border-red-500/30 bg-red-500/5">
                                  <CardContent className="p-2 space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <AlertCircle className="h-3 w-3 text-red-600 shrink-0" />
                                      <p className="text-[9px] font-semibold text-red-700 dark:text-red-400">CSV Import Errors</p>
                                    </div>
                                    {csvImportErrors.get(assessment.id)?.map((err, idx) => (
                                      <p key={idx} className="text-[8px] text-red-600/80 ml-5">• {err}</p>
                                    ))}
                                  </CardContent>
                                </Card>
                              )}

                              {/* Questions Table */}
                              {doesAssessmentHaveQuestions(assessment) ? (
                                <div className="rounded-lg border overflow-hidden">
                                  <ScrollArea className="max-w-full">
                                    <table className="w-full text-[10px]">
                                      <thead>
                                        <tr className="bg-muted/30">
                                          <th className="text-left p-1.5 font-semibold w-14">Q. No</th>
                                          <th className="text-left p-1.5 font-semibold min-w-[150px]">Question</th>
                                          <th className="text-left p-1.5 font-semibold w-24">Type</th>
                                          <th className="text-center p-1.5 font-semibold w-14">Marks</th>
                                          <th className="text-center p-1.5 font-semibold w-12">CO</th>
                                          <th className="text-center p-1.5 font-semibold w-20">Bloom Level</th>
                                          <th className="text-right p-1.5 font-semibold w-10">Action</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {assessment.questions.map((q) => (
                                          <tr key={q.id} className="border-t border-border/30 hover:bg-muted/5">
                                            <td className="p-1">
                                              <Input
                                                value={q.questionNumber}
                                                onChange={(e) => updateQuestion(assessment.id, q.id, { questionNumber: e.target.value })}
                                                className="h-7 text-[10px] font-mono"
                                              />
                                            </td>
                                            <td className="p-1">
                                              <Input
                                                value={q.question}
                                                onChange={(e) => updateQuestion(assessment.id, q.id, { question: e.target.value })}
                                                className="h-7 text-[10px]"
                                                placeholder="Enter question text"
                                              />
                                            </td>
                                            <td className="p-1">
                                              <Select
                                                value={q.questionType}
                                                onValueChange={(v: QuestionType) => updateQuestion(assessment.id, q.id, { questionType: v })}
                                              >
                                                <SelectTrigger className="h-7 text-[10px]">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {QUESTION_TYPES.map((t) => (
                                                    <SelectItem key={t} value={t} className="text-[10px]">{t}</SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </td>
                                            <td className="p-1">
                                              <Input
                                                type="number"
                                                value={q.maxMarks}
                                                onChange={(e) => updateQuestion(assessment.id, q.id, { maxMarks: parseInt(e.target.value) || 0 })}
                                                className="h-7 text-[10px] text-center"
                                                min={0}
                                              />
                                            </td>
                                            <td className="p-1">
                                              <Select
                                                value={q.mappedCO}
                                                onValueChange={(v) => updateQuestion(assessment.id, q.id, { mappedCO: v })}
                                              >
                                                <SelectTrigger className="h-7 text-[10px]">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {validCOs.length > 0 ? (
                                                    validCOs.map((co) => (
                                                      <SelectItem key={co} value={co} className="text-[10px]">{co}</SelectItem>
                                                    ))
                                                  ) : (
                                                    <SelectItem value="CO1" className="text-[10px]">CO1</SelectItem>
                                                  )}
                                                </SelectContent>
                                              </Select>
                                            </td>
                                            <td className="p-1">
                                              <Select
                                                value={q.bloomsLevel}
                                                onValueChange={(v: BloomsTaxonomyLevel) => updateQuestion(assessment.id, q.id, { bloomsLevel: v })}
                                              >
                                                <SelectTrigger className="h-7 text-[10px]">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {BLOOMS_TAXONOMY_LEVELS.map((bl) => (
                                                    <SelectItem key={bl} value={bl} className="text-[10px]">{bl}</SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </td>
                                            <td className="p-1 text-right">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive"
                                                onClick={() => removeQuestion(assessment.id, q.id)}
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </ScrollArea>
                                </div>
                              ) : (
                                <div className="text-center py-6 rounded-lg border border-dashed border-border/30 bg-muted/5">
                                  <p className="text-[10px] text-muted-foreground">No questions configured yet</p>
                                  <p className="text-[9px] text-muted-foreground mt-0.5">
                                    Click "Template" to download a blank CSV, "Upload CSV" to import, or "Add Question" to add manually
                                  </p>
                                </div>
                              )}
                            </div>
                            </>
                          )}
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ===== ADD ADDITIONAL ASSESSMENT TYPE ===== */}
      {blueprint.assessments.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Select value="" onValueChange={(v) => v && addAdditionalAssessment(v)}>
            <SelectTrigger className="h-8 text-xs w-[220px]">
              <SelectValue placeholder="+ Add additional assessment..." />
            </SelectTrigger>
            <SelectContent>
              {ADDITIONAL_ASSESSMENT_TYPES.map((type) => {
                const exists = blueprint.assessments.find((a) => a.name === type);
                return (
                  <SelectItem
                    key={type}
                    value={type}
                    className="text-xs"
                    disabled={!!exists}
                  >
                    {type} {exists ? '(already added)' : ''}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-[9px] text-muted-foreground">
            Add optional assessments like Quiz, Seminar, Case Study, etc.
          </p>
        </div>
      )}

      {/* ===== CSV IMPORT SUCCESS ===== */}
      <AnimatePresence>
        {csvImportSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400">{csvImportSuccess}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-auto"
                  onClick={() => setCsvImportSuccess(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== ASSESSMENT SUMMARY TABLE ===== */}
      {blueprint.assessments.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <ListChecks className="h-3.5 w-3.5 text-indigo-600" />
              Assessment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="text-[10px] font-semibold">#</TableHead>
                  <TableHead className="text-[10px] font-semibold">Assessment</TableHead>
                  <TableHead className="text-[10px] font-semibold">Type</TableHead>
                  <TableHead className="text-[10px] font-semibold text-center">Marks</TableHead>
                  <TableHead className="text-[10px] font-semibold text-center">Weightage</TableHead>
                  <TableHead className="text-[10px] font-semibold text-center">Effective</TableHead>
                  <TableHead className="text-[10px] font-semibold text-center">Questions</TableHead>
                  <TableHead className="text-[10px] font-semibold text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blueprint.assessments.map((assessment, idx) => {
                  const status = getAssessmentStatus(assessment);
                  const totalQMarks = calculateEffectiveTotalMarks(assessment.questions);
                  const typeMeta = ASSESSMENT_TYPE_META[assessment.assessmentType || ''] || { color: 'bg-gray-500/10 text-gray-600', shortLabel: '-' };
                  const effectiveContrib = validation.effectiveContributions.get(assessment.id);
                  const isEffectiveDifferent = effectiveContrib !== undefined && effectiveContrib !== assessment.weightage;
                  return (
                    <TableRow key={assessment.id} className="hover:bg-muted/10">
                      <TableCell className="text-[10px] text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="text-[10px] font-medium flex items-center gap-1">
                        {assessment.compositeGroupId && (
                          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[7px] px-1 py-0 mr-1">
                            {assessment.compositeGroupId.toUpperCase()}
                          </Badge>
                        )}
                        {assessment.name}
                      </TableCell>
                      <TableCell className="text-[10px]">
                        <Badge variant="outline" className={cn('text-[8px] px-1', typeMeta.color)}>
                          {typeMeta.shortLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] text-center">{assessment.defaultMarks}</TableCell>
                      <TableCell className="text-[10px] text-center font-semibold text-indigo-600">
                        {assessment.weightage}%
                      </TableCell>
                      <TableCell className="text-[10px] text-center">
                        {effectiveContrib !== undefined ? (
                          <span className={cn(
                            'font-bold',
                            isEffectiveDifferent ? 'text-amber-500' : 'text-emerald-600'
                          )}>
                            {effectiveContrib}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                        {isEffectiveDifferent && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-2.5 w-2.5 text-amber-500 inline ml-0.5 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="text-[8px]">
                                Averaged from composite group
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </TableCell>
                      <TableCell className="text-[10px] text-center">
                        {doesAssessmentHaveQuestions(assessment) ? (
                          <span className="font-medium">{getAssessmentTotalQuestionCount(assessment)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                        {assessment.questions.length > 0 && totalQMarks !== assessment.defaultMarks && (
                          <span className="text-[8px] text-amber-500 ml-1">
                            ({totalQMarks}/{assessment.defaultMarks})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {status === 'complete' ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[8px]">
                            ✅ Complete
                          </Badge>
                        ) : status === 'error' ? (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[8px]">
                            ⏳ Needs Review
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[8px] text-muted-foreground">
                            ⏳ Pending
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Summary Row */}
                <TableRow className="bg-muted/20 border-t-2 border-border/50">
                  <TableCell colSpan={3} className="text-[10px] font-semibold">Total</TableCell>
                  <TableCell className="text-[10px] text-center font-semibold">
                    <span className="text-indigo-600">{compositeAnalysis.totalEffectiveMarks}</span>
                    <span className="text-[9px] text-muted-foreground ml-1">
                      (eff.)
                    </span>
                  </TableCell>
                  <TableCell className="text-[10px] text-center font-bold text-muted-foreground">
                    {validation.totalWeightage}%
                  </TableCell>
                  <TableCell className="text-[10px] text-center font-bold text-indigo-600">
                    {validation.totalEffectiveWeightage}%
                    {validation.totalEffectiveWeightage !== 100 && (
                      <span className="text-amber-500 ml-1">(Target: 100%)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-[10px] text-center font-semibold">
                    {blueprint.assessments.reduce((s, a) => s + a.questions.length, 0)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ===== COMPOSITE GROUP INFO WARNINGS ===== */}
      {validation.warnings && validation.warnings.length > 0 && (
        <Card className="border-indigo-500/30 bg-indigo-500/5">
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-indigo-600 shrink-0" />
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                Group Calculation Summary
              </p>
            </div>
            <div className="space-y-0.5">
              {validation.warnings.map((warn, idx) => (
                <p key={idx} className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 ml-6">
                  • {warn}
                </p>
              ))}
              <p className="text-[9px] text-indigo-500/60 ml-6 mt-1">
                These are informational — the effective weightages account for the averaging within composite groups.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== VALIDATION ERRORS ===== */}
      {!validation.valid && blueprint.assessments.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Blueprint Incomplete — {validation.errors.length} issue(s)
              </p>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-0.5">
              {validation.errors.map((err, idx) => (
                <p key={idx} className="text-[10px] text-amber-600/80 dark:text-amber-400/80 ml-6">
                  • {err}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===== COMPLETION RULES ===== */}
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground mb-2">💡 Completion Rules</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                <div className="text-[9px] text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                  Effective weightages must total <strong>100%</strong>
                </div>
                <div className="text-[9px] text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                  Each assessment needs <strong>at least one question</strong>
                </div>
                <div className="text-[9px] text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                  Composite groups (e.g., CIA) use <strong>average</strong> of members
                </div>
                <div className="text-[9px] text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                  Every question needs a <strong>Bloom's level</strong> and <strong>CO</strong>
                </div>
                <div className="text-[9px] text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                  Total question marks must equal <strong>assessment marks</strong>
                </div>
                <div className="text-[9px] text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                  Additional assessments must not cause total to <strong>exceed 100%</strong>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== NAVIGATION ===== */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onPrev} className="gap-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous: CO-PSO Mapping
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSave} className="gap-2">
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={onNext}
            className={cn(
              'gap-2',
              validation.valid
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700'
                : 'bg-muted-foreground/50 cursor-not-allowed'
            )}
            disabled={!validation.valid}
          >
            Next: Marks Upload
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

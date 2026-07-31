import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AttainmentResult,
  CourseOutcome,
  MarksUpload as MarksUploadType,
  AssessmentBlueprint,
  COPOMapping,
  COPSOMapping,
  NBA_POS,
  NBA_PSOS,
  COAttainment,
  POAttainment,
} from '../types';
import { cn } from '@/lib/utils';
import { Fragment } from 'react';
import {
  BarChart3,
  Target,
  GitBranch,
  GitFork,
  Save,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Loader2,
  Sparkles,
  Info,
  Users,
  Calculator,
  AlertTriangle,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface Step11Props {
  outcomes: CourseOutcome[];
  marks: MarksUploadType[];
  blueprint: AssessmentBlueprint | null;
  coPoMappings: COPOMapping[];
  coPsoMappings: COPSOMapping[];
  data: AttainmentResult | null;
  onUpdate: (data: AttainmentResult) => void;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  completionPercentage: number;
}

// ============================================================
// ATTAINMENT CALCULATION ENGINE
// ============================================================

interface COAssessmentContribution {
  assessmentName: string;
  weightage: number;
  averagePercentage: number;
  studentsAboveThreshold: number;
  totalStudents: number;
  maxMarks: number;
  averageMarks: number;
}

interface CODetailResult {
  coCode: string;
  coDescription: string;
  overallAveragePercentage: number;
  threshold: number;
  attainment: number;
  target: number;
  status: 'achieved' | 'not_achieved' | 'partially';
  totalStudents: number;
  studentsAboveThreshold: number;
  assessmentContributions: COAssessmentContribution[];
}

/**
 * Compute detailed CO attainment from actual marks data.
 */
function computeCOAttainmentDetail(
  outcomes: CourseOutcome[],
  marksList: MarksUploadType[],
  blueprint: AssessmentBlueprint
): CODetailResult[] {
  const assessments = blueprint.assessments;

  return outcomes.map(co => {
    const coCode = co.code;
    const contributions: COAssessmentContribution[] = [];
    let weightedSum = 0;
    let totalWeightUsed = 0;

    for (const assessment of assessments) {
      const upload = marksList.find(m => m.assessmentId === assessment.id);
      if (!upload || upload.studentMarks.length === 0) continue;

      // Find questions in this assessment mapped to this CO
      const coQuestions = assessment.questions.filter(q => q.mappedCO === coCode);
      if (coQuestions.length === 0) continue;

      const maxMarksForCO = coQuestions.reduce((s, q) => s + q.maxMarks, 0);
      if (maxMarksForCO === 0) continue;

      // For each student, compute % marks for CO-mapped questions
      const studentPercentages: number[] = [];
      for (const student of upload.studentMarks) {
        let studentMarksSum = 0;
        for (const q of coQuestions) {
          studentMarksSum += student.marks[q.id] || 0;
        }
        const pct = (studentMarksSum / maxMarksForCO) * 100;
        studentPercentages.push(pct);
      }

      const avgPct = studentPercentages.reduce((s, p) => s + p, 0) / studentPercentages.length;
      const avgMarks =
        studentPercentages.reduce((s, p) => s + (p * maxMarksForCO) / 100, 0) /
        studentPercentages.length;
      const studentsAbove = studentPercentages.filter(p => p >= upload.threshold).length;

      contributions.push({
        assessmentName: assessment.name,
        weightage: assessment.weightage,
        averagePercentage: Math.round(avgPct * 10) / 10,
        studentsAboveThreshold: studentsAbove,
        totalStudents: studentPercentages.length,
        maxMarks: maxMarksForCO,
        averageMarks: Math.round(avgMarks * 100) / 100,
      });

      weightedSum += avgPct * assessment.weightage;
      totalWeightUsed += assessment.weightage;
    }

    // Overall attainment
    const overallAvgPct =
      totalWeightUsed > 0 ? Math.round((weightedSum / totalWeightUsed) * 10) / 10 : 0;

    // Use the highest threshold from assessments that assess this CO
    const thresholds = contributions.map(c => {
      const upload = marksList.find(m => m.assessmentName === c.assessmentName);
      return upload?.threshold ?? 60;
    });
    const effectiveThreshold = thresholds.length > 0 ? Math.max(...thresholds) : 60;

    // Use the highest target from assessments
    const targets = contributions.map(c => {
      const upload = marksList.find(m => m.assessmentName === c.assessmentName);
      return upload?.attainmentTarget ?? 70;
    });
    const effectiveTarget = targets.length > 0 ? Math.max(...targets) : 70;

    // Determine status
    let status: 'achieved' | 'not_achieved' | 'partially';
    if (overallAvgPct >= effectiveTarget) {
      status = 'achieved';
    } else if (overallAvgPct >= effectiveTarget * 0.7) {
      status = 'partially';
    } else {
      status = 'not_achieved';
    }

    const totalStudents = Math.max(...contributions.map(c => c.totalStudents), 0);
    const studentsAboveThreshold = contributions.reduce((s, c) => s + c.studentsAboveThreshold, 0);

    return {
      coCode,
      coDescription: co.description,
      overallAveragePercentage: overallAvgPct,
      threshold: effectiveThreshold,
      attainment: overallAvgPct,
      target: effectiveTarget,
      status,
      totalStudents,
      studentsAboveThreshold,
      assessmentContributions: contributions,
    };
  });
}

/**
 * Compute PO attainment from CO attainment + CO-PO mappings (level-weighted).
 */
function computePOAttainmentFromCO(
  coDetails: CODetailResult[],
  coPoMappings: COPOMapping[],
  outcomes: CourseOutcome[]
): POAttainment[] {
  return NBA_POS.map(po => {
    // Find all COs mapped to this PO with their mapping levels
    const mappings = coPoMappings.filter(m => m.poId === po.id && m.level > 0);
    if (mappings.length === 0) {
      return {
        poCode: po.code,
        attainment: 0,
        contribution: 0,
        target: 60,
        status: 'not_achieved' as const,
      };
    }

    // Level-weighted average of CO attainments
    let weightedSum = 0;
    let totalLevels = 0;

    for (const mapping of mappings) {
      const coDetail = coDetails.find(
        c => c.coCode === outcomes.find(o => o.id === mapping.coId)?.code
      );
      if (coDetail) {
        weightedSum += coDetail.attainment * mapping.level;
        totalLevels += mapping.level;
      }
    }

    const attainment = totalLevels > 0 ? Math.round((weightedSum / totalLevels) * 10) / 10 : 0;

    let status: 'achieved' | 'not_achieved' | 'partially';
    if (attainment >= 60) status = 'achieved';
    else if (attainment >= 40) status = 'partially';
    else status = 'not_achieved';

    return {
      poCode: po.code,
      attainment: Math.min(100, attainment),
      contribution: mappings.length,
      target: 60,
      status,
    };
  });
}

/**
 * Compute PSO attainment similarly.
 */
function computePSOAttainmentFromCO(
  coDetails: CODetailResult[],
  coPsoMappings: COPSOMapping[],
  outcomes: CourseOutcome[]
): POAttainment[] {
  return NBA_PSOS.map(pso => {
    const mappings = coPsoMappings.filter(m => m.psoId === pso.id && m.level > 0);
    if (mappings.length === 0) {
      return {
        poCode: pso.code,
        attainment: 0,
        contribution: 0,
        target: 60,
        status: 'not_achieved' as const,
      };
    }

    let weightedSum = 0;
    let totalLevels = 0;

    for (const mapping of mappings) {
      const coDetail = coDetails.find(
        c => c.coCode === outcomes.find(o => o.id === mapping.coId)?.code
      );
      if (coDetail) {
        weightedSum += coDetail.attainment * mapping.level;
        totalLevels += mapping.level;
      }
    }

    const attainment = totalLevels > 0 ? Math.round((weightedSum / totalLevels) * 10) / 10 : 0;

    let status: 'achieved' | 'not_achieved' | 'partially';
    if (attainment >= 60) status = 'achieved';
    else if (attainment >= 40) status = 'partially';
    else status = 'not_achieved';

    return {
      poCode: pso.code,
      attainment: Math.min(100, attainment),
      contribution: mappings.length,
      target: 60,
      status,
    };
  });
}

/**
 * Master function: compute all attainment results from actual data.
 */
function computeAllAttainment(
  outcomes: CourseOutcome[],
  marksList: MarksUploadType[],
  blueprint: AssessmentBlueprint | null,
  coPoMappings: COPOMapping[],
  coPsoMappings: COPSOMapping[]
): AttainmentResult {
  if (!blueprint || outcomes.length === 0 || marksList.length === 0) {
    return { coAttainments: [], poAttainments: [], psoAttainments: [] };
  }

  // 1. Compute detailed CO attainment
  const coDetails = computeCOAttainmentDetail(outcomes, marksList, blueprint);

  // 2. Convert to COAttainment[] for the result
  const coAttainments: COAttainment[] = coDetails.map(d => ({
    coCode: d.coCode,
    averageMarks: d.overallAveragePercentage,
    threshold: d.threshold,
    attainment: d.attainment,
    target: d.target,
    status: d.status,
  }));

  // 3. PO Attainment
  const poAttainments = computePOAttainmentFromCO(coDetails, coPoMappings, outcomes);

  // 4. PSO Attainment
  const psoAttainments = computePSOAttainmentFromCO(coDetails, coPsoMappings, outcomes);

  return { coAttainments, poAttainments, psoAttainments };
}

// ============================================================
// UI COMPONENT
// ============================================================

export default function Step11_AttainmentDashboard({
  outcomes,
  marks,
  blueprint,
  coPoMappings,
  coPsoMappings,
  data,
  onUpdate,
  onSave,
  onNext,
  onPrev,
  completionPercentage,
}: Step11Props) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('co');
  const [expandedCO, setExpandedCO] = useState<string | null>(null);

  const hasMarks = marks.length > 0;
  const hasBlueprint = !!blueprint;

  // Compute detailed CO data for the expanded view
  const coDetails = useMemo(() => {
    if (!blueprint || outcomes.length === 0 || marks.length === 0) return [];
    return computeCOAttainmentDetail(outcomes, marks, blueprint);
  }, [outcomes, marks, blueprint]);

  // Per-student CO attainment data
  const studentCOData = useMemo(() => {
    if (!blueprint || outcomes.length === 0 || marks.length === 0) return [];
    const assessments = blueprint.assessments;
    const studentMap = new Map<string, Record<string, { obtained: number; max: number }>>();

    for (const assessment of assessments) {
      const upload = marks.find(m => m.assessmentId === assessment.id);
      if (!upload) continue;

      for (const student of upload.studentMarks) {
        if (!studentMap.has(student.rollNumber)) {
          studentMap.set(student.rollNumber, {});
        }
        const coData = studentMap.get(student.rollNumber)!;

        for (const co of outcomes) {
          const coQuestions = assessment.questions.filter(q => q.mappedCO === co.code);
          if (coQuestions.length === 0) continue;

          let obtained = 0;
          let maxM = 0;
          for (const q of coQuestions) {
            obtained += student.marks[q.id] || 0;
            maxM += q.maxMarks;
          }

          if (!coData[co.code]) {
            coData[co.code] = { obtained: 0, max: 0 };
          }
          coData[co.code].obtained += obtained;
          coData[co.code].max += maxM;
        }
      }
    }

    return Array.from(studentMap.entries()).map(([rollNumber, coMarks]) => ({
      rollNumber,
      coPercentages: outcomes.map(co => {
        const d = coMarks[co.code];
        const pct = d && d.max > 0 ? Math.round((d.obtained / d.max) * 100) : 0;
        return { coCode: co.code, percentage: pct, obtained: d?.obtained ?? 0, max: d?.max ?? 0 };
      }),
    }));
  }, [outcomes, marks, blueprint]);

  const handleCalculate = useCallback(() => {
    setIsCalculating(true);
    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      const result = computeAllAttainment(outcomes, marks, blueprint, coPoMappings, coPsoMappings);
      onUpdate(result);
      setIsCalculating(false);
    }, 300);
  }, [outcomes, marks, blueprint, coPoMappings, coPsoMappings, onUpdate]);

  // Summary stats
  const coAchieved = data?.coAttainments.filter(a => a.status === 'achieved').length ?? 0;
  const coPartial = data?.coAttainments.filter(a => a.status === 'partially').length ?? 0;
  const coNotAchieved = data?.coAttainments.filter(a => a.status === 'not_achieved').length ?? 0;
  const poAchieved = data?.poAttainments.filter(a => a.status === 'achieved').length ?? 0;
  const psoAchieved = data?.psoAttainments.filter(a => a.status === 'achieved').length ?? 0;

  // Ready state
  const readyToCalculate = hasMarks && hasBlueprint && outcomes.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Attainment Dashboard
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            CO, PO, and PSO attainment calculated from uploaded marks using the assessment blueprint
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {completionPercentage}% Complete
        </Badge>
      </div>
      <Separator />

      {/* ===== No data state ===== */}
      {!data && !readyToCalculate && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
              Insufficient Data for Calculation
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {!hasBlueprint
                ? 'Complete the Assessment Blueprint (Step 9) first.'
                : outcomes.length === 0
                  ? 'Define Course Outcomes (Step 4) first.'
                  : 'Upload student marks in Step 10 before calculating attainment.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ===== Ready but not calculated ===== */}
      {!data && readyToCalculate && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-indigo-500/20">
            <CardContent className="p-8 text-center">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-10 w-10 text-indigo-600" />
              </div>
              <p className="text-lg font-semibold mb-1">Ready for Attainment Calculation</p>
              <p className="text-xs text-muted-foreground mb-2 max-w-md mx-auto">
                {marks.length} assessment(s) with marks uploaded · {outcomes.length} COs defined
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {marks.map(m => (
                  <Badge key={m.assessmentId} variant="outline" className="text-[9px]">
                    {m.assessmentName} ({m.studentMarks.length} students)
                  </Badge>
                ))}
              </div>
              <Button
                onClick={handleCalculate}
                disabled={isCalculating}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
                size="lg"
              >
                {isCalculating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Calculator className="h-4 w-4" />
                )}
                {isCalculating ? 'Calculating...' : 'Calculate Attainment'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ===== Results view ===== */}
      {data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/10">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-4 w-4 text-emerald-600" />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    CO Attainment
                  </p>
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  {coAchieved}/{data.coAttainments.length}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {coAchieved > 0
                    ? `${Math.round((coAchieved / data.coAttainments.length) * 100)}% Achieved`
                    : 'No COs achieved'}
                </p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-sky-500/10">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <GitBranch className="h-4 w-4 text-blue-600" />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    PO Attainment
                  </p>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {poAchieved}/{data.poAttainments.length}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {poAchieved > 0
                    ? `${Math.round((poAchieved / data.poAttainments.length) * 100)}% Achieved`
                    : 'No POs achieved'}
                </p>
              </CardContent>
            </Card>
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-violet-500/10">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <GitFork className="h-4 w-4 text-purple-600" />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    PSO Attainment
                  </p>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {psoAchieved}/{data.psoAttainments.length}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {psoAchieved > 0
                    ? `${Math.round((psoAchieved / data.psoAttainments.length) * 100)}% Achieved`
                    : 'No PSOs achieved'}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/10">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Overall Status
                  </p>
                </div>
                <p className="text-2xl font-bold text-amber-600">
                  {coAchieved + poAchieved + psoAchieved}/
                  {data.coAttainments.length +
                    data.poAttainments.length +
                    data.psoAttainments.length}
                </p>
                <Progress
                  value={
                    ((coAchieved + poAchieved + psoAchieved) /
                      Math.max(
                        data.coAttainments.length +
                          data.poAttainments.length +
                          data.psoAttainments.length,
                        1
                      )) *
                    100
                  }
                  className="h-1.5 mt-1"
                />
              </CardContent>
            </Card>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] text-muted-foreground">Achieved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-[9px] text-muted-foreground">Partially Achieved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="text-[9px] text-muted-foreground">Not Achieved</span>
            </div>
          </div>

          {/* ===== Tabs ===== */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="co" className="text-xs gap-1.5">
                <Target className="h-3.5 w-3.5" />
                CO Attainment
              </TabsTrigger>
              <TabsTrigger value="po" className="text-xs gap-1.5">
                <GitBranch className="h-3.5 w-3.5" />
                PO Attainment
              </TabsTrigger>
              <TabsTrigger value="pso" className="text-xs gap-1.5">
                <GitFork className="h-3.5 w-3.5" />
                PSO Attainment
              </TabsTrigger>
              <TabsTrigger value="students" className="text-xs gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Per Student
              </TabsTrigger>
            </TabsList>

            {/* ===== CO Attainment Tab ===== */}
            <TabsContent value="co">
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-emerald-600" />
                    Course Outcome Attainment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[500px]">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="bg-muted/30 sticky top-0 z-10">
                          <th className="text-left p-2.5 font-semibold w-[60px]">CO</th>
                          <th className="text-left p-2.5 font-semibold">Description</th>
                          <th className="text-center p-2.5 font-semibold w-[70px]">Avg %</th>
                          <th className="text-center p-2.5 font-semibold w-[60px]">Target</th>
                          <th className="text-center p-2.5 font-semibold w-[60px]">Status</th>
                          <th className="text-left p-2.5 font-semibold min-w-[120px]">Progress</th>
                          <th className="text-center p-2.5 font-semibold w-[40px]"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.coAttainments.map(co => {
                          const detail = coDetails.find(d => d.coCode === co.coCode);
                          const isExpanded = expandedCO === co.coCode;
                          return (
                            <Fragment key={co.coCode}>
                              <tr
                                className={cn(
                                  'border-t border-border/40 hover:bg-muted/10 cursor-pointer transition-colors',
                                  isExpanded && 'bg-muted/20'
                                )}
                                onClick={() => setExpandedCO(isExpanded ? null : co.coCode)}
                              >
                                <td className="p-2.5 font-semibold font-mono">{co.coCode}</td>
                                <td className="p-2.5 text-muted-foreground max-w-[200px] truncate">
                                  {outcomes.find(o => o.code === co.coCode)?.description || ''}
                                </td>
                                <td className="p-2.5 text-center font-bold">{co.attainment}%</td>
                                <td className="p-2.5 text-center">{co.target}%</td>
                                <td className="p-2.5 text-center">
                                  <StatusBadge status={co.status} />
                                </td>
                                <td className="p-2.5">
                                  <div className="flex items-center gap-2">
                                    <Progress
                                      value={co.attainment}
                                      className={cn(
                                        'h-2 flex-1',
                                        co.status === 'achieved' && 'bg-emerald-500/20',
                                        co.status === 'partially' && 'bg-amber-500/20',
                                        co.status === 'not_achieved' && 'bg-red-500/20'
                                      )}
                                    />
                                    <span className="text-[9px] font-semibold w-8">
                                      {co.attainment}%
                                    </span>
                                  </div>
                                </td>
                                <td className="p-2.5 text-center">
                                  <Button variant="ghost" size="icon" className="h-5 w-5">
                                    <Eye className="h-3 w-3 text-muted-foreground" />
                                  </Button>
                                </td>
                              </tr>

                              {/* Expanded detail row */}
                              {isExpanded && detail && (
                                <tr key={`${co.coCode}-detail`}>
                                  <td colSpan={7} className="p-0 bg-muted/10">
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      className="p-4 space-y-3 border-b border-border/40"
                                    >
                                      <p className="text-[10px] font-semibold text-muted-foreground">
                                        Assessment-wise Contribution
                                      </p>
                                      {detail.assessmentContributions.length === 0 ? (
                                        <p className="text-[9px] text-muted-foreground italic">
                                          No assessments mapped to this CO
                                        </p>
                                      ) : (
                                        <div className="space-y-2">
                                          {detail.assessmentContributions.map(ac => (
                                            <div
                                              key={ac.assessmentName}
                                              className="flex items-center gap-3 p-2 rounded-lg bg-card border border-border/30"
                                            >
                                              <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-medium">
                                                  {ac.assessmentName}
                                                </p>
                                                <p className="text-[8px] text-muted-foreground">
                                                  Weightage: {ac.weightage}% · Max marks:{' '}
                                                  {ac.maxMarks}
                                                </p>
                                              </div>
                                              <div className="text-center">
                                                <p className="text-xs font-bold">
                                                  {ac.averagePercentage}%
                                                </p>
                                                <p className="text-[8px] text-muted-foreground">
                                                  Avg
                                                </p>
                                              </div>
                                              <div className="text-center">
                                                <p className="text-xs font-bold text-emerald-600">
                                                  {ac.studentsAboveThreshold}/{ac.totalStudents}
                                                </p>
                                                <p className="text-[8px] text-muted-foreground">
                                                  ≥ Threshold
                                                </p>
                                              </div>
                                              <Progress
                                                value={ac.averagePercentage}
                                                className="h-2 w-20"
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      <div className="flex items-center gap-4 pt-1 text-[9px] text-muted-foreground">
                                        <span>Threshold: {detail.threshold}%</span>
                                        <span>Target: {detail.target}%</span>
                                        <span>
                                          Students above threshold: {detail.studentsAboveThreshold}/
                                          {detail.totalStudents}
                                        </span>
                                      </div>
                                    </motion.div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== PO Attainment Tab ===== */}
            <TabsContent value="po">
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center gap-2">
                    <GitBranch className="h-3.5 w-3.5 text-blue-600" />
                    Program Outcome Attainment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="text-left p-2.5 font-semibold w-[55px]">PO</th>
                        <th className="text-left p-2.5 font-semibold">Description</th>
                        <th className="text-center p-2.5 font-semibold w-[70px]">COs Mapped</th>
                        <th className="text-center p-2.5 font-semibold w-[70px]">Attainment</th>
                        <th className="text-center p-2.5 font-semibold w-[60px]">Target</th>
                        <th className="text-center p-2.5 font-semibold w-[70px]">Status</th>
                        <th className="text-left p-2.5 font-semibold min-w-[100px]">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.poAttainments.map((po, idx) => (
                        <tr key={po.poCode} className="border-t border-border/40 hover:bg-muted/10">
                          <td className="p-2.5 font-semibold font-mono">{po.poCode}</td>
                          <td className="p-2.5 text-muted-foreground max-w-[250px] truncate">
                            {NBA_POS[idx]?.shortName || po.poCode}
                          </td>
                          <td className="p-2.5 text-center">{po.contribution} COs</td>
                          <td className="p-2.5 text-center font-bold">{po.attainment}%</td>
                          <td className="p-2.5 text-center">{po.target}%</td>
                          <td className="p-2.5 text-center">
                            <StatusBadge status={po.status} />
                          </td>
                          <td className="p-2.5">
                            <Progress value={po.attainment} className="h-2" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== PSO Attainment Tab ===== */}
            <TabsContent value="pso">
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center gap-2">
                    <GitFork className="h-3.5 w-3.5 text-purple-600" />
                    Program Specific Outcome Attainment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="text-left p-2.5 font-semibold w-[60px]">PSO</th>
                        <th className="text-left p-2.5 font-semibold">Description</th>
                        <th className="text-center p-2.5 font-semibold w-[70px]">COs Mapped</th>
                        <th className="text-center p-2.5 font-semibold w-[70px]">Attainment</th>
                        <th className="text-center p-2.5 font-semibold w-[60px]">Target</th>
                        <th className="text-center p-2.5 font-semibold w-[70px]">Status</th>
                        <th className="text-left p-2.5 font-semibold min-w-[100px]">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.psoAttainments.map((pso, idx) => (
                        <tr
                          key={pso.poCode}
                          className="border-t border-border/40 hover:bg-muted/10"
                        >
                          <td className="p-2.5 font-semibold font-mono">{pso.poCode}</td>
                          <td className="p-2.5 text-muted-foreground max-w-[250px] truncate">
                            {NBA_PSOS[idx]?.description || pso.poCode}
                          </td>
                          <td className="p-2.5 text-center">{pso.contribution} COs</td>
                          <td className="p-2.5 text-center font-bold">{pso.attainment}%</td>
                          <td className="p-2.5 text-center">{pso.target}%</td>
                          <td className="p-2.5 text-center">
                            <StatusBadge status={pso.status} />
                          </td>
                          <td className="p-2.5">
                            <Progress value={pso.attainment} className="h-2" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== Per-Student Tab ===== */}
            <TabsContent value="students">
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-indigo-600" />
                    Per-Student CO Attainment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[500px]">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="bg-muted/30 sticky top-0 z-10">
                          <th className="text-left p-2 font-semibold">#</th>
                          <th className="text-left p-2 font-semibold">Roll Number</th>
                          {outcomes.map(co => (
                            <th key={co.id} className="text-center p-2 font-semibold min-w-[55px]">
                              {co.code}
                            </th>
                          ))}
                          <th className="text-center p-2 font-semibold min-w-[55px]">Overall</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentCOData.map((student, idx) => {
                          const overallPct =
                            outcomes.length > 0
                              ? Math.round(
                                  student.coPercentages.reduce((s, c) => s + c.percentage, 0) /
                                    outcomes.length
                                )
                              : 0;
                          return (
                            <tr
                              key={student.rollNumber}
                              className="border-t border-border/30 hover:bg-muted/10"
                            >
                              <td className="p-2 text-muted-foreground">{idx + 1}</td>
                              <td className="p-2 font-mono font-medium">{student.rollNumber}</td>
                              {student.coPercentages.map(cp => (
                                <td key={cp.coCode} className="p-2 text-center">
                                  <span
                                    className={cn(
                                      'font-semibold',
                                      cp.percentage >= 60 && 'text-emerald-600',
                                      cp.percentage >= 40 && cp.percentage < 60 && 'text-amber-600',
                                      cp.percentage < 40 && 'text-red-600'
                                    )}
                                  >
                                    {cp.percentage}%
                                  </span>
                                </td>
                              ))}
                              <td className="p-2 text-center font-bold">{overallPct}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}

      {/* ===== Info Card ===== */}
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground">
                📊 How Attainment is Calculated
              </p>
              <div className="text-[9px] text-muted-foreground mt-1 space-y-0.5">
                <p>
                  <strong>CO Attainment:</strong> For each Course Outcome, the system finds all
                  questions mapped to it across all assessments. Student marks are aggregated,
                  weighted by assessment weightage, and compared against the threshold & target
                  configured during marks upload.
                </p>
                <p>
                  <strong>PO/PSO Attainment:</strong> Derived from CO attainment using the CO-PO and
                  CO-PSO mapping levels as weights. Higher mapping levels contribute more to the
                  outcome attainment score.
                </p>
                <p className="text-[8px] text-muted-foreground/60 mt-1">
                  Target: 70% = Achieved · 49-69% = Partially · Below 49% = Not Achieved
                  (configurable per assessment)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== Actions ===== */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onPrev} className="gap-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous: Marks Upload
        </Button>
        <div className="flex items-center gap-2">
          {data && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCalculate}
              className="gap-2"
              disabled={isCalculating}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isCalculating && 'animate-spin')} />
              Recalculate
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onSave} className="gap-2" disabled={!data}>
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={onNext}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700"
          >
            Next: Reports
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ===== Helper Components =====

function StatusBadge({ status }: { status: 'achieved' | 'not_achieved' | 'partially' }) {
  if (status === 'achieved') {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 text-[9px] gap-1 border-emerald-500/20">
        <CheckCircle2 className="h-2.5 w-2.5" />
        Achieved
      </Badge>
    );
  }
  if (status === 'partially') {
    return (
      <Badge className="bg-amber-500/10 text-amber-600 text-[9px] gap-1 border-amber-500/20">
        <TrendingUp className="h-2.5 w-2.5" />
        Partial
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-500/10 text-red-600 text-[9px] gap-1 border-red-500/20">
      <XCircle className="h-2.5 w-2.5" />
      Not Achieved
    </Badge>
  );
}

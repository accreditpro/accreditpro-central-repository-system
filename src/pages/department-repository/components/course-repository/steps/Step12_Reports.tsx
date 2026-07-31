import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  CourseState,
  NBA_POS,
  NBA_PSOS,
  BLOOMS_TAXONOMY_LEVELS,
} from '../types';
import { cn } from '@/lib/utils';
import {
  FileText,
  Download,
  Printer,
  Save,
  ArrowLeft,
  CheckCircle2,
  Award,
  Target,
  GitBranch,
  GitFork,
  Search,
  ClipboardList,
  BarChart3,
  BookOpen,
  Eye,
  AlertCircle,
} from 'lucide-react';

interface Step12Props {
  state: CourseState;
  onSave: () => void;
  onPrev: () => void;
  completionPercentage: number;
}

// ============================================================
// REPORT GENERATORS
// ============================================================

/** Fallback attainment level calculation (mirrors OBE config defaults: L3≥70, L2≥60, L1≥50, L0<50) */
function getDefaultAttainmentLevel(percentage: number): number {
  if (percentage >= 70) return 3;
  if (percentage >= 60) return 2;
  if (percentage >= 50) return 1;
  return 0;
}

/** Trigger a CSV file download */
function downloadCSV(filename: string, rows: string[]) {
  const csv = rows.join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---- 1. Course File Report ----
function generateCourseFileReport(state: CourseState): { rows: string[]; filename: string } {
  const d = state.details;
  const rows: string[] = [];

  rows.push('"Course File Report"');
  rows.push(`"Generated","${new Date().toLocaleDateString()}"`);
  rows.push('');
  rows.push('"Course Information"');
  rows.push(`"Course Code","${d.courseCode}"`);
  rows.push(`"Course Name","${d.courseName}"`);
  rows.push(`"Faculty","${d.facultyName}"`);
  rows.push(`"Department","${d.department}"`);
  rows.push(`"Program","${d.program}"`);
  rows.push(`"Regulation","${d.regulation}"`);
  rows.push(`"Semester","${d.semester}"`);
  rows.push(`"Year","${d.year}"`);
  rows.push(`"Credits",${d.credits}`);
  rows.push(`"CI Hours",${d.ciHours}`);
  rows.push(`"PI Hours",${d.piHours}`);
  rows.push(`"Total Hours",${d.totalHours}`);

  if (state.courseFile) {
    rows.push('');
    rows.push('"Course Objectives"');
    state.courseFile.courseObjectives.forEach((obj, i) => {
      rows.push(`"Objective ${i + 1}","${obj}"`);
    });

    rows.push('');
    rows.push('"Units"');
    rows.push('"Unit","Title","Topics","Hours"');
    state.courseFile.units.forEach((u) => {
      rows.push(`"${u.id}","${u.title}","${u.topics.join('; ')}",${u.hours}`);
    });

    rows.push('');
    rows.push('"Textbooks"');
    rows.push('"Title","Author","Edition","Publisher"');
    state.courseFile.textBooks.forEach((b) => {
      rows.push(`"${b.title}","${b.author}","${b.edition || ''}","${b.publisher || ''}"`);
    });

    rows.push('');
    rows.push('"Reference Books"');
    rows.push('"Title","Author","Edition","Publisher"');
    state.courseFile.referenceBooks.forEach((b) => {
      rows.push(`"${b.title}","${b.author}","${b.edition || ''}","${b.publisher || ''}"`);
    });
  }

  return { rows, filename: `course_file_${d.courseCode}_${d.semester.replace(' ', '')}.csv` };
}

// ---- 2. Course Outcomes Report ----
function generateCOReport(state: CourseState): { rows: string[]; filename: string } {
  const rows: string[] = [];
  rows.push('"Course Outcomes Report"');
  rows.push(`"Course Code","${state.details.courseCode}","Course Name","${state.details.courseName}"`);
  rows.push('');
  rows.push('"CO Code","Description","Bloom\'s Taxonomy Level"');
  state.courseOutcomes.forEach((co) => {
    rows.push(`"${co.code}","${co.description}","${co.bloomsLevel}"`);
  });
  return { rows, filename: `course_outcomes_${state.details.courseCode}.csv` };
}

// ---- 3. Bloom's Distribution Report ----
function generateBloomReport(state: CourseState): { rows: string[]; filename: string } {
  const distribution = BLOOMS_TAXONOMY_LEVELS.map((level) => ({
    level,
    count: state.courseOutcomes.filter((co) => co.bloomsLevel === level).length,
  }));

  const rows: string[] = [];
  rows.push('"Bloom\'s Taxonomy Distribution Report"');
  rows.push(`"Course Code","${state.details.courseCode}"`);
  rows.push('');
  rows.push('"Bloom\'s Level","Count","Percentage"');
  const total = state.courseOutcomes.length || 1;
  distribution.forEach((d) => {
    const pct = Math.round((d.count / total) * 100);
    rows.push(`"${d.level}",${d.count},${pct}%`);
  });
  return { rows, filename: `bloom_distribution_${state.details.courseCode}.csv` };
}

// ---- 4. CO-PO Matrix Report ----
function generateCOPOMatrixReport(state: CourseState): { rows: string[]; filename: string } {
  const rows: string[] = [];
  rows.push('"CO-PO Articulation Matrix Report"');
  rows.push(`"Course Code","${state.details.courseCode}","Course Name","${state.details.courseName}"`);
  rows.push('');

  // Header row: CO | PO1 ... PO11
  const header = ['"CO Code"', ...NBA_POS.map((po) => `"${po.code}"`)];
  rows.push(header.join(','));

  // Data rows
  state.courseOutcomes.forEach((co) => {
    const row: string[] = [`"${co.code}"`];
    NBA_POS.forEach((po) => {
      const mapping = state.coPoMapping.find((m) => m.coId === co.id && m.poId === po.id);
      row.push(mapping ? mapping.level.toString() : '-');
    });
    rows.push(row.join(','));
  });

  // Justification rows
  rows.push('');
  rows.push('"Justifications"');
  rows.push('"CO","PO","Level","Justification"');
  state.coPoMapping.forEach((m) => {
    const co = state.courseOutcomes.find((c) => c.id === m.coId);
    const po = NBA_POS.find((p) => p.id === m.poId);
    rows.push(`"${co?.code || m.coId}","${po?.code || m.poId}",${m.level},"${m.justification}"`);
  });

  // Coverage analysis
  if (state.poCoverage.length > 0) {
    rows.push('');
    rows.push('"Coverage Analysis"');
    rows.push('"PO","Coverage %","Avg Level","Mapped COs"');
    state.poCoverage.forEach((pc) => {
      rows.push(`"${pc.poCode}",${pc.coveragePercentage}%,${pc.avgLevel},"${pc.mappedCOs.join(', ')}"`);
    });
  }

  return { rows, filename: `co_po_matrix_${state.details.courseCode}.csv` };
}

// ---- 5. CO-PSO Matrix Report ----
function generateCOPSOMatrixReport(state: CourseState): { rows: string[]; filename: string } {
  const rows: string[] = [];
  rows.push('"CO-PSO Articulation Matrix Report"');
  rows.push(`"Course Code","${state.details.courseCode}","Course Name","${state.details.courseName}"`);
  rows.push('');

  const header = ['"CO Code"', ...NBA_PSOS.map((pso) => `"${pso.code}"`)];
  rows.push(header.join(','));

  state.courseOutcomes.forEach((co) => {
    const row: string[] = [`"${co.code}"`];
    NBA_PSOS.forEach((pso) => {
      const mapping = state.coPsoMapping.find((m) => m.coId === co.id && m.psoId === pso.id);
      row.push(mapping ? mapping.level.toString() : '-');
    });
    rows.push(row.join(','));
  });

  rows.push('');
  rows.push('"Justifications"');
  rows.push('"CO","PSO","Level","Justification"');
  state.coPsoMapping.forEach((m) => {
    const co = state.courseOutcomes.find((c) => c.id === m.coId);
    const pso = NBA_PSOS.find((p) => p.id === m.psoId);
    rows.push(`"${co?.code || m.coId}","${pso?.code || m.psoId}",${m.level},"${m.justification}"`);
  });

  return { rows, filename: `co_pso_matrix_${state.details.courseCode}.csv` };
}

// ---- 6. Gap Analysis Report ----
function generateGapAnalysisReport(state: CourseState): { rows: string[]; filename: string } {
  const rows: string[] = [];
  rows.push('"Gap Analysis Report"');
  rows.push(`"Course Code","${state.details.courseCode}"`);
  rows.push('');

  const gap = state.gapAnalysis;
  if (!gap) {
    rows.push('"No gap analysis data available"');
    return { rows, filename: `gap_analysis_${state.details.courseCode}.csv` };
  }

  if (gap.weakPOs.length > 0) {
    rows.push('"Weak POs"');
    rows.push('"PO","Reason","Recommendation","Expected Improvement"');
    gap.weakPOs.forEach((w) => {
      rows.push(`"${w.poCode}","${w.reason}","${w.recommendation}","${w.expectedImprovement}"`);
    });
  }

  if (gap.missingPOs.length > 0) {
    rows.push('');
    rows.push('"Missing POs"');
    rows.push('"PO","Reason","Recommendation","Expected Improvement"');
    gap.missingPOs.forEach((m) => {
      rows.push(`"${m.poCode}","${m.reason}","${m.recommendation}","${m.expectedImprovement}"`);
    });
  }

  if (gap.recommendations.length > 0) {
    rows.push('');
    rows.push('"Activity Recommendations"');
    rows.push('"Type","Title","Description","Duration","Mapped PO","Mapped CO"');
    gap.recommendations.forEach((r) => {
      rows.push(`"${r.activityType}","${r.title}","${r.description}","${r.duration}","${r.mappedPO}","${r.mappedCO}"`);
    });
  }

  return { rows, filename: `gap_analysis_${state.details.courseCode}.csv` };
}

// ---- 7. Assessment Blueprint Report ----
function generateBlueprintReport(state: CourseState): { rows: string[]; filename: string } {
  const rows: string[] = [];
  rows.push('"Assessment Blueprint Report"');
  rows.push(`"Course Code","${state.details.courseCode}","Course Name","${state.details.courseName}"`);
  rows.push('');

  if (!state.assessmentBlueprint) {
    rows.push('"No assessment blueprint data available"');
    return { rows, filename: `assessment_blueprint_${state.details.courseCode}.csv` };
  }

  state.assessmentBlueprint.assessments.forEach((assessment) => {
    rows.push(`"Assessment: ${assessment.name}","Weightage: ${assessment.weightage}%"`);
    rows.push('"Q. No","Mapped CO","Max Marks"');
    assessment.questions.forEach((q) => {
      rows.push(`"${q.questionNumber}","${q.mappedCO}",${q.maxMarks}`);
    });
    const total = assessment.questions.reduce((s, q) => s + q.maxMarks, 0);
    rows.push(`"Total","",${total}`);
    rows.push('');
  });

  return { rows, filename: `assessment_blueprint_${state.details.courseCode}.csv` };
}

// ---- 8. CO Attainment Report ----
function generateCOAttainmentReport(state: CourseState): { rows: string[]; filename: string } {
  const rows: string[] = [];
  rows.push('"CO Attainment Report"');
  rows.push(`"Course Code","${state.details.courseCode}","Course Name","${state.details.courseName}"`);
  rows.push('');

  if (!state.attainmentResult) {
    rows.push('"No attainment data available"');
    return { rows, filename: `co_attainment_${state.details.courseCode}.csv` };
  }

  rows.push('"CO Code","Average Marks","Threshold","Attainment %","Target %","Level","Status"');
  state.attainmentResult.coAttainments.forEach((co) => {
    const level = co.attainmentLevel ?? getDefaultAttainmentLevel(co.attainment);
    rows.push(`"${co.coCode}",${co.averageMarks},${co.threshold},${co.attainment},${co.target},${level},"${co.status}"`);
  });

  // Per-assessment contribution
  rows.push('');
  rows.push('"Per-Assessment Contribution"');
  if (state.assessmentBlueprint && state.marksUploads.length > 0) {
    rows.push('"CO","Assessment","Avg %","Students Above Threshold"');
    for (const co of state.courseOutcomes) {
      for (const assessment of state.assessmentBlueprint.assessments) {
        const upload = state.marksUploads.find((m) => m.assessmentId === assessment.id);
        if (!upload || upload.studentMarks.length === 0) continue;

        const coQuestions = assessment.questions.filter((q) => q.mappedCO === co.code);
        if (coQuestions.length === 0) continue;

        const maxForCO = coQuestions.reduce((s, q) => s + q.maxMarks, 0);
        if (maxForCO === 0) continue;

        let totalPct = 0;
        let aboveThreshold = 0;
        for (const student of upload.studentMarks) {
          let studentSum = 0;
          for (const q of coQuestions) {
            studentSum += student.marks[q.id] || 0;
          }
          const pct = (studentSum / maxForCO) * 100;
          totalPct += pct;
          if (pct >= (upload.threshold || 60)) aboveThreshold++;
        }
        const avgPct = Math.round((totalPct / upload.studentMarks.length) * 10) / 10;
        rows.push(`"${co.code}","${assessment.name}",${avgPct}%,${aboveThreshold}/${upload.studentMarks.length}`);
      }
    }
  }

  return { rows, filename: `co_attainment_${state.details.courseCode}.csv` };
}

// ---- 9. PO Attainment Report ----
function generatePOAttainmentReport(state: CourseState): { rows: string[]; filename: string } {
  const rows: string[] = [];
  rows.push('"PO Attainment Report"');
  rows.push(`"Course Code","${state.details.courseCode}"`);
  rows.push('');

  if (!state.attainmentResult) {
    rows.push('"No attainment data available"');
    return { rows, filename: `po_attainment_${state.details.courseCode}.csv` };
  }

  rows.push('"PO Code","Description","COs Mapped","Attainment %","Target %","Level","Status"');
  state.attainmentResult.poAttainments.forEach((po, idx) => {
    const level = po.attainmentLevel ?? getDefaultAttainmentLevel(po.attainment);
    rows.push(`"${po.poCode}","${NBA_POS[idx]?.shortName || ''}",${po.contribution},${po.attainment},${po.target},${level},"${po.status}"`);
  });

  return { rows, filename: `po_attainment_${state.details.courseCode}.csv` };
}

// ---- 10. PSO Attainment Report ----
function generatePSOAttainmentReport(state: CourseState): { rows: string[]; filename: string } {
  const rows: string[] = [];
  rows.push('"PSO Attainment Report"');
  rows.push(`"Course Code","${state.details.courseCode}"`);
  rows.push('');

  if (!state.attainmentResult) {
    rows.push('"No attainment data available"');
    return { rows, filename: `pso_attainment_${state.details.courseCode}.csv` };
  }

  rows.push('"PSO Code","Description","COs Mapped","Attainment %","Target %","Level","Status"');
  state.attainmentResult.psoAttainments.forEach((pso, idx) => {
    const level = pso.attainmentLevel ?? getDefaultAttainmentLevel(pso.attainment);
    rows.push(`"${pso.poCode}","${NBA_PSOS[idx]?.description || ''}",${pso.contribution},${pso.attainment},${pso.target},${level},"${pso.status}"`);
  });

  return { rows, filename: `pso_attainment_${state.details.courseCode}.csv` };
}

// ---- 11. NBA Consolidated Report ----
function generateNBAReport(state: CourseState): { rows: string[]; filename: string } {
  const rows: string[] = [];
  const d = state.details;

  // Header
  rows.push('"NBA ACCREDITATION COURSE REPORT"');
  rows.push(`"Generated","${new Date().toLocaleDateString()}"`);
  rows.push('');
  rows.push('"=== SECTION 1: COURSE INFORMATION ==="');
  rows.push('"Course Code","Course Name","Faculty","Department","Program","Regulation","Semester","Credits"');
  rows.push(`"${d.courseCode}","${d.courseName}","${d.facultyName}","${d.department}","${d.program}","${d.regulation}","${d.semester}",${d.credits}`);
  rows.push('');

  // COs
  rows.push('"=== SECTION 2: COURSE OUTCOMES ==="');
  rows.push('"CO","Description","Bloom\'s Level"');
  state.courseOutcomes.forEach((co) => {
    rows.push(`"${co.code}","${co.description}","${co.bloomsLevel}"`);
  });
  rows.push('');

  // CO-PO Matrix
  rows.push('"=== SECTION 3: CO-PO ARTICULATION MATRIX ==="');
  const coPoHeader = ['"CO"', ...NBA_POS.map((p) => `"${p.code}"`)];
  rows.push(coPoHeader.join(','));
  state.courseOutcomes.forEach((co) => {
    const row = [`"${co.code}"`];
    NBA_POS.forEach((po) => {
      const m = state.coPoMapping.find((x) => x.coId === co.id && x.poId === po.id);
      row.push(m ? m.level.toString() : '0');
    });
    rows.push(row.join(','));
  });
  rows.push('');

  // CO-PSO Matrix
  rows.push('"=== SECTION 4: CO-PSO ARTICULATION MATRIX ==="');
  const coPsoHeader = ['"CO"', ...NBA_PSOS.map((p) => `"${p.code}"`)];
  rows.push(coPsoHeader.join(','));
  state.courseOutcomes.forEach((co) => {
    const row = [`"${co.code}"`];
    NBA_PSOS.forEach((pso) => {
      const m = state.coPsoMapping.find((x) => x.coId === co.id && x.psoId === pso.id);
      row.push(m ? m.level.toString() : '0');
    });
    rows.push(row.join(','));
  });
  rows.push('');

  // Assessment Blueprint
  if (state.assessmentBlueprint) {
    rows.push('"=== SECTION 5: ASSESSMENT BLUEPRINT ==="');
    for (const a of state.assessmentBlueprint.assessments) {
      rows.push(`"Assessment: ${a.name}","Weightage: ${a.weightage}%"`);
      rows.push('"Q. No","CO","Max Marks"');
      a.questions.forEach((q) => rows.push(`"${q.questionNumber}","${q.mappedCO}",${q.maxMarks}`));
      rows.push('');
    }
  }

  // Attainment
  if (state.attainmentResult) {
    rows.push('"=== SECTION 6: ATTAINMENT ==="');
    rows.push('"CO Attainment"');
    rows.push('"CO","Attainment %","Target","Level","Status"');
    state.attainmentResult.coAttainments.forEach((c) => {
      const level = c.attainmentLevel ?? getDefaultAttainmentLevel(c.attainment);
      rows.push(`"${c.coCode}",${c.attainment},${c.target},${level},"${c.status}"`);
    });
    rows.push('');
    rows.push('"PO Attainment"');
    rows.push('"PO","Attainment %","COs Mapped","Level","Status"');
    state.attainmentResult.poAttainments.forEach((p, i) => {
      const level = p.attainmentLevel ?? getDefaultAttainmentLevel(p.attainment);
      rows.push(`"${p.poCode}",${p.attainment},${p.contribution},${level},"${p.status}"`);
    });
    rows.push('');
    rows.push('"PSO Attainment"');
    rows.push('"PSO","Attainment %","COs Mapped","Level","Status"');
    state.attainmentResult.psoAttainments.forEach((p) => {
      const level = p.attainmentLevel ?? getDefaultAttainmentLevel(p.attainment);
      rows.push(`"${p.poCode}",${p.attainment},${p.contribution},${level},"${p.status}"`);
    });
  }

  return { rows, filename: `nba_course_report_${d.courseCode}_${d.semester.replace(' ', '')}.csv` };
}

// ============================================================
// COMPONENT
// ============================================================

interface ReportCard {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  available: boolean;
  generate: () => { rows: string[]; filename: string } | null;
}

export default function Step12_Reports({ state, onSave, onPrev, completionPercentage }: Step12Props) {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<string | null>(null);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const d = state.details;
  const hasAttainment = !!state.attainmentResult;
  const hasBlueprint = !!state.assessmentBlueprint;
  const hasGap = !!state.gapAnalysis;
  const hasCourseFile = !!state.courseFile;
  const hasCOs = state.courseOutcomes.length > 0;
  const hasCOPOMapping = state.coPoMapping.length > 0;
  const hasCOPSOMapping = state.coPsoMapping.length > 0;

  const reports: ReportCard[] = useMemo(() => [
    {
      id: 'course-file', title: 'Course File', icon: BookOpen,
      description: 'Course details, objectives, units, textbooks & references',
      color: 'from-blue-500 to-blue-600', available: hasCourseFile,
      generate: () => generateCourseFileReport(state),
    },
    {
      id: 'course-outcomes', title: 'Course Outcomes', icon: Target,
      description: 'List of COs with Bloom\'s Taxonomy levels',
      color: 'from-emerald-500 to-emerald-600', available: hasCOs,
      generate: () => generateCOReport(state),
    },
    {
      id: 'bloom-mapping', title: 'Bloom\'s Distribution', icon: BarChart3,
      description: 'Distribution of Bloom\'s Taxonomy across COs',
      color: 'from-teal-500 to-teal-600', available: hasCOs,
      generate: () => generateBloomReport(state),
    },
    {
      id: 'co-po-matrix', title: 'CO-PO Matrix', icon: GitBranch,
      description: 'CO-PO articulation matrix with justifications & coverage',
      color: 'from-indigo-500 to-indigo-600', available: hasCOPOMapping,
      generate: () => generateCOPOMatrixReport(state),
    },
    {
      id: 'co-pso-matrix', title: 'CO-PSO Matrix', icon: GitFork,
      description: 'CO-PSO articulation matrix with justifications',
      color: 'from-purple-500 to-purple-600', available: hasCOPSOMapping,
      generate: () => generateCOPSOMatrixReport(state),
    },
    {
      id: 'gap-analysis', title: 'Gap Analysis', icon: Search,
      description: 'PO gap analysis with recommendations & activities',
      color: 'from-amber-500 to-amber-600', available: hasGap,
      generate: () => generateGapAnalysisReport(state),
    },
    {
      id: 'assessment-blueprint', title: 'Assessment Blueprint', icon: ClipboardList,
      description: 'Assessment structure with question-CO mappings & weightages',
      color: 'from-rose-500 to-rose-600', available: hasBlueprint,
      generate: () => generateBlueprintReport(state),
    },
    {
      id: 'co-attainment', title: 'CO Attainment', icon: BarChart3,
      description: 'Course Outcome attainment with per-assessment breakdown',
      color: 'from-emerald-500 to-emerald-600', available: hasAttainment,
      generate: () => generateCOAttainmentReport(state),
    },
    {
      id: 'po-attainment', title: 'PO Attainment', icon: GitBranch,
      description: 'Program Outcome attainment derived from CO data',
      color: 'from-blue-500 to-blue-600', available: hasAttainment,
      generate: () => generatePOAttainmentReport(state),
    },
    {
      id: 'pso-attainment', title: 'PSO Attainment', icon: GitFork,
      description: 'Program Specific Outcome attainment',
      color: 'from-purple-500 to-purple-600', available: hasAttainment,
      generate: () => generatePSOAttainmentReport(state),
    },
    {
      id: 'nba-course', title: 'NBA Course Report', icon: Award,
      description: 'Complete NBA-ready consolidated report (all sections)',
      color: 'from-red-500 to-red-600', available: true,
      generate: () => generateNBAReport(state),
    },
  ], [state, hasCourseFile, hasCOs, hasCOPOMapping, hasCOPSOMapping, hasGap, hasBlueprint, hasAttainment]);

  const handleDownload = useCallback((reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report || !report.available) return;

    setGenerating(reportId);
    setTimeout(() => {
      const result = report.generate?.();
      if (result) {
        downloadCSV(result.filename, result.rows);
        setDownloadMsg(`✅ ${report.title} downloaded`);
        setTimeout(() => setDownloadMsg(null), 3000);
      }
      setGenerating(null);
    }, 200);
  }, [reports]);

  const handlePreview = useCallback((reportId: string) => {
    setPreviewReport(previewReport === reportId ? null : reportId);
  }, [previewReport]);

  // Get preview rows for the selected report
  const previewRows = useMemo(() => {
    if (!previewReport) return null;
    const report = reports.find((r) => r.id === previewReport);
    if (!report || !report.available) return null;
    const result = report.generate?.();
    return result?.rows.slice(0, 50) ?? null; // Limit preview to 50 lines
  }, [previewReport, reports]);

  const completedCount = reports.filter((r) => r.available).length;
  const totalReports = reports.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Reports
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generate NBA-ready reports from course data, mappings, and attainment results
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{completionPercentage}% Complete</Badge>
          <Badge className="bg-indigo-500/10 text-indigo-600 text-[10px]">
            {completedCount}/{totalReports} Reports Ready
          </Badge>
        </div>
      </div>
      <Separator />

      {/* Download status */}
      <AnimatePresence>
        {downloadMsg && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-3 flex items-center gap-2 text-xs text-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                {downloadMsg}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <Card className="border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium text-muted-foreground">Report Readiness</span>
            <span className="text-[10px] font-bold">{Math.round((completedCount / totalReports) * 100)}%</span>
          </div>
          <Progress value={(completedCount / totalReports) * 100} className="h-1.5" />
        </CardContent>
      </Card>

      {/* Report Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {reports.map((report) => {
          const Icon = report.icon;
          const isGenerating = generating === report.id;
          const isPreviewOpen = previewReport === report.id;

          return (
            <div key={report.id}>
              <button
                onClick={() => handlePreview(report.id)}
                disabled={!report.available}
                className={cn(
                  'w-full relative p-4 rounded-xl border text-left transition-all',
                  report.available
                    ? (isPreviewOpen
                      ? 'border-indigo-500/30 bg-indigo-500/5 ring-2 ring-indigo-500/20'
                      : 'border-border/50 hover:border-indigo-500/30 hover:bg-indigo-500/5 cursor-pointer')
                    : 'border-dashed border-border/30 bg-muted/10 cursor-not-allowed opacity-60',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0',
                    report.color
                  )}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold">{report.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{report.description}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] gap-1 text-indigo-600"
                    disabled={!report.available}
                    onClick={(e) => { e.stopPropagation(); handleDownload(report.id); }}
                  >
                    {isGenerating ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <Download className="h-3 w-3" />
                    )}
                    CSV
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn('h-7 text-[10px] gap-1', isPreviewOpen ? 'text-indigo-600' : 'text-muted-foreground')}
                    onClick={(e) => { e.stopPropagation(); handlePreview(report.id); }}
                    disabled={!report.available}
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] gap-1 text-purple-600"
                    onClick={(e) => { e.stopPropagation(); window.print(); }}
                    disabled={!report.available}
                  >
                    <Printer className="h-3 w-3" />
                    Print
                  </Button>
                </div>

                {!report.available && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/50 backdrop-blur-[1px]">
                    <p className="text-[9px] text-muted-foreground font-medium">Complete previous steps</p>
                  </div>
                )}
              </button>

              {/* Preview Panel */}
              <AnimatePresence>
                {isPreviewOpen && previewRows && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Card className="border-t-0 border-indigo-500/20 rounded-t-none bg-muted/5">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-semibold text-muted-foreground">
                            Preview — {report.title}
                          </p>
                          <Badge variant="outline" className="text-[8px]">
                            {previewRows.length} lines
                          </Badge>
                        </div>
                        <ScrollArea className="max-h-[300px] rounded border border-border/30 bg-card">
                          <pre className="text-[9px] p-2 font-mono leading-relaxed whitespace-pre-wrap">
                            {previewRows.join('\n')}
                          </pre>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* NBA Highlight Banner */}
      <Card className="border-red-500/30 bg-gradient-to-r from-red-500/5 to-rose-500/5">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">NBA Course Report (Complete)</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Consolidated report with all 6 sections: Course Info, COs, CO-PO Matrix, CO-PSO Matrix,
                Assessment Blueprint, and Attainment
              </p>
            </div>
          </div>
          <Button
            className="gap-2 bg-gradient-to-r from-red-600 to-rose-600"
            size="sm"
            onClick={() => handleDownload('nba-course')}
            disabled={generating === 'nba-course'}
          >
            {generating === 'nba-course' ? (
              <span className="animate-pulse">...</span>
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download NBA Report
          </Button>
        </CardContent>
      </Card>

      {/* Course Overview Summary */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
            Course Summary — {d.courseName || 'Unnamed Course'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <SummaryItem label="Code" value={d.courseCode || '—'} color="text-indigo-600" />
            <SummaryItem label="Faculty" value={d.facultyName || '—'} color="text-emerald-600" />
            <SummaryItem label="Program" value={d.program || '—'} color="text-blue-600" />
            <SummaryItem label="Semester" value={d.semester || '—'} color="text-amber-600" />
            <SummaryItem label="Credits" value={String(d.credits || '—')} color="text-purple-600" />
            <SummaryItem label="COs" value={String(state.courseOutcomes.length)} color="text-emerald-600" />
            <SummaryItem label="Assessments" value={String(state.assessmentBlueprint?.assessments.length || 0)} color="text-rose-600" />
          </div>

          <Separator className="my-3" />

          {/* Data Availability Checklist */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <ChecklistItem label="Course Details" done={!!d.courseCode} />
            <ChecklistItem label="Course File" done={hasCourseFile} />
            <ChecklistItem label="Course Outcomes" done={hasCOs} />
            <ChecklistItem label="CO-PO Mapping" done={hasCOPOMapping} />
            <ChecklistItem label="CO-PSO Mapping" done={hasCOPSOMapping} />
            <ChecklistItem label="Gap Analysis" done={hasGap} />
            <ChecklistItem label="Assessment Blueprint" done={hasBlueprint} />
            <ChecklistItem label="Marks Uploaded" done={state.marksUploads.length > 0} />
            <ChecklistItem label="CO Attainment" done={hasAttainment} />
            <ChecklistItem label="PO Attainment" done={hasAttainment} />
            <ChecklistItem label="PSO Attainment" done={hasAttainment} />
            <ChecklistItem label="NBA Ready" done={completedCount >= 8} />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onPrev} className="gap-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous: Attainment Dashboard
        </Button>
        <Button variant="outline" size="sm" onClick={onSave} className="gap-2">
          <Save className="h-3.5 w-3.5" />
          Save Draft
        </Button>
      </div>
    </div>
  );
}

// ===== Helper Sub-Components =====

function SummaryItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center p-2 rounded-lg border border-border/30 bg-card/50">
      <p className="text-[18px] font-bold mb-0.5"><span className={color}>{value}</span></p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 px-2 py-1 rounded text-[9px]',
      done ? 'bg-emerald-500/5' : 'bg-muted/20'
    )}>
      {done ? (
        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
      ) : (
        <AlertCircle className="h-3 w-3 text-muted-foreground/50 shrink-0" />
      )}
      <span className={done ? 'text-emerald-700 font-medium' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}

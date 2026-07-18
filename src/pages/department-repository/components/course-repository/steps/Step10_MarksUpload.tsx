import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AssessmentBlueprint, MarksUpload as MarksUploadType, StudentMarks, CourseDetails } from '../types';
import { parseCSVLine } from '../utils/csv';
import { cn } from '@/lib/utils';
import {
  FileSpreadsheet,
  Upload,
  Save,
  ArrowRight,
  ArrowLeft,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Settings,
  AlertCircle,
  FileDown,
  Eye,
  Calculator,
  Trash2,
  ListChecks,
  RefreshCw,
} from 'lucide-react';

interface Step10Props {
  blueprint: AssessmentBlueprint | null;
  data: MarksUploadType[];
  courseDetails: CourseDetails;
  academicYear: string;
  onUpdate: (data: MarksUploadType[]) => void;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  completionPercentage: number;
}

interface ImportResult {
  students: StudentMarks[];
  errors: string[];
  warnings: string[];
}

/**
 * Parse a marks CSV for a specific assessment.
 * Expected format:
 *   Roll Number, Student Name, <question1>, <question2>, ..., Total Marks
 */
function parseMarksCSV(
  text: string,
  assessmentQuestions: { id: string; questionNumber: string; maxMarks: number }[]
): ImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const students: StudentMarks[] = [];

  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length < 2) {
    return { students: [], errors: ['CSV file is empty or has no data rows'], warnings: [] };
  }

  const headers = parseCSVLine(lines[0]);
  const rollIdx = headers.findIndex((h) => h.toLowerCase().includes('roll number') || h.toLowerCase().includes('rollno'));
  const nameIdx = headers.findIndex((h) => h.toLowerCase().includes('student name') || h.toLowerCase().includes('name'));

  if (rollIdx === -1) errors.push('Missing "Roll Number" column');
  if (nameIdx === -1) errors.push('Missing "Student Name" column');
  if (errors.length > 0) return { students: [], errors, warnings };

  // Map headers to question IDs from the blueprint
  const questionColMap: { colIdx: number; questionId: string; questionNumber: string; maxMarks: number }[] = [];
  for (const q of assessmentQuestions) {
    // Look for the question number in headers (e.g., "Q1", "O1", "A1")
    const colIdx = headers.findIndex(
      (h) => h.trim().toLowerCase() === q.questionNumber.toLowerCase()
    );
    if (colIdx >= 0) {
      questionColMap.push({ colIdx, questionId: q.id, questionNumber: q.questionNumber, maxMarks: q.maxMarks });
    }
  }

  if (questionColMap.length === 0) {
    errors.push(
      `No question columns found in CSV. Expected columns: ${assessmentQuestions.map((q) => q.questionNumber).join(', ')}`
    );
    return { students: [], errors, warnings };
  }

  // Parse each student row
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 3) continue;

    const rollNumber = (cols[rollIdx] || '').trim();
    const studentName = (cols[nameIdx] || '').trim();

    if (!rollNumber) {
      warnings.push(`Row ${i + 1}: Skipped — missing Roll Number`);
      continue;
    }

    const marks: Record<string, number> = {};
    let totalMarks = 0;
    let rowHasError = false;

    for (const qMap of questionColMap) {
      const rawValue = (cols[qMap.colIdx] || '').trim();
      const mark = parseFloat(rawValue);

      if (isNaN(mark) || rawValue === '') {
        warnings.push(`Row ${i + 1} (${rollNumber}): Missing/invalid mark for ${qMap.questionNumber} — treated as 0`);
        marks[qMap.questionId] = 0;
      } else if (mark < 0) {
        warnings.push(`Row ${i + 1} (${rollNumber}): Negative mark for ${qMap.questionNumber} — treated as 0`);
        marks[qMap.questionId] = 0;
      } else if (mark > qMap.maxMarks) {
        warnings.push(
          `Row ${i + 1} (${rollNumber}): Mark ${mark} for ${qMap.questionNumber} exceeds max ${qMap.maxMarks} — capped`
        );
        marks[qMap.questionId] = qMap.maxMarks;
        totalMarks += qMap.maxMarks;
      } else {
        marks[qMap.questionId] = Math.round(mark * 100) / 100; // Round to 2 decimals
        totalMarks += mark;
      }
    }

    totalMarks = Math.round(totalMarks * 100) / 100;

    students.push({
      rollNumber,
      studentName: studentName || rollNumber,
      marks,
      totalMarks,
    });
  }

  if (students.length === 0) {
    errors.push('No valid student records could be parsed from the CSV');
  }

  return { students, errors, warnings };
}

// Mid-semester assessment names that use the fixed CSV format
const MID_SEM_NAMES = ['Mid Semester 1', 'Mid Semester 2'];

export default function Step10_MarksUpload({ blueprint, data, courseDetails, academicYear, onUpdate, onSave, onNext, onPrev, completionPercentage }: Step10Props) {
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [previewData, setPreviewData] = useState<StudentMarks[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(60);
  const [attainmentTarget, setAttainmentTarget] = useState(70);
  const [calcMethod, setCalcMethod] = useState<'average' | 'percentage_above_threshold'>('average');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const assessments = blueprint?.assessments || [];
  const hasBlueprint = !!blueprint;

  // Get the selected assessment's questions
  const selectedAssessmentData = assessments.find((a) => a.id === selectedAssessment);
  const assessmentQuestions = selectedAssessmentData?.questions || [];
  const maxMark = assessmentQuestions.reduce((s, q) => s + q.maxMarks, 0);
  const isMidSem = selectedAssessmentData ? MID_SEM_NAMES.includes(selectedAssessmentData.name) : false;

  // ---- Download CSV Template (Standard / Non-Mid-Sem) ----
  const handleDownloadTemplate = useCallback(() => {
    if (!selectedAssessmentData || assessmentQuestions.length === 0) return;

    const questionCols = assessmentQuestions.map((q) => q.questionNumber);
    const header = `Roll Number,Student Name,${questionCols.join(',')}`;

    const sampleMarks = assessmentQuestions.map(() => '0');
    const sampleRow = `2201CS01,Aarav Sharma,${sampleMarks.join(',')}`;

    const csv = [header, sampleRow].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = selectedAssessmentData.name.replace(/\s+/g, '_');
    a.download = `marks_template_${safeName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedAssessmentData, assessmentQuestions]);

  // ---- Download Mid-Semester CSV Template (Fixed Format with Metadata) ----
  const handleDownloadMidSemTemplate = useCallback(() => {
    if (!selectedAssessmentData || assessmentQuestions.length === 0) return;

    const examName = selectedAssessmentData.name;
    const cols = [
      'Department',
      'Faculty Name',
      'Academic Year',
      'Branch',
      'Section',
      'Course Name',
      'Exam',
      'Year',
      'Semester',
      'Hall Ticket Number',
      'Q1',
      'Q2',
      'Q3',
      'Q4',
      'Objective Marks',
      'Assignment Marks',
    ];

    const header = cols.join(',');
    const sampleRow = [
      courseDetails.department || 'Your Department',
      courseDetails.facultyName || 'Faculty Name',
      academicYear,
      courseDetails.program || 'Branch',
      'Section A',
      courseDetails.courseName || 'Course Name',
      examName,
      courseDetails.year || 'Year',
      courseDetails.semester || 'Semester',
      '2201CS01',
      '0', '0', '0', '0',
      '0',
      '0',
    ].join(',');

    const csv = [header, sampleRow].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = selectedAssessmentData.name.replace(/\s+/g, '_');
    a.download = `marks_${safeName}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedAssessmentData, assessmentQuestions, courseDetails, academicYear]);

  // ---- Parse Mid-Semester CSV (Fixed Format with Metadata) ----
  const parseMidSemMarksCSV = useCallback(
    (text: string): ImportResult => {
      const errors: string[] = [];
      const warnings: string[] = [];
      const students: StudentMarks[] = [];

      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) {
        return { students: [], errors: ['CSV file is empty or has no data rows'], warnings: [] };
      }

      const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());

      // Required column indices
      const hallTicketIdx = headers.findIndex(
        (h) => h.includes('hall ticket') || h.includes('hallticket') || h.includes('roll number')
      );
      const q1Idx = headers.findIndex((h) => h === 'q1');
      const q2Idx = headers.findIndex((h) => h === 'q2');
      const q3Idx = headers.findIndex((h) => h === 'q3');
      const q4Idx = headers.findIndex((h) => h === 'q4');
      const objIdx = headers.findIndex((h) => h.includes('objective'));
      const assignIdx = headers.findIndex((h) => h.includes('assignment'));

      if (hallTicketIdx === -1) errors.push('Missing "Hall Ticket Number" column');
      if (q1Idx === -1) errors.push('Missing "Q1" column');
      if (objIdx === -1) errors.push('Missing "Objective Marks" column');
      if (assignIdx === -1) errors.push('Missing "Assignment Marks" column');

      if (errors.length > 0) return { students: [], errors, warnings };

      // Map blueprint questions by their questionNumber
      const q1 = assessmentQuestions.find((q) => q.questionNumber === 'Q1');
      const q2 = assessmentQuestions.find((q) => q.questionNumber === 'Q2');
      const q3 = assessmentQuestions.find((q) => q.questionNumber === 'Q3');
      const q4 = assessmentQuestions.find((q) => q.questionNumber === 'Q4');
      const objectiveQs = assessmentQuestions.filter((q) => q.questionNumber.startsWith('O'));
      const assignmentQ = assessmentQuestions.find((q) => q.questionNumber === 'A1');

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 5) continue;

        const hallTicket = (cols[hallTicketIdx] || '').trim();
        if (!hallTicket) {
          warnings.push(`Row ${i + 1}: Skipped — missing Hall Ticket Number`);
          continue;
        }

        const marks: Record<string, number> = {};
        let totalMarks = 0;

        // Helper to extract a mark with validation
        const extractMark = (idx: number, label: string, max: number): number => {
          if (idx < 0 || idx >= cols.length) return 0;
          const raw = cols[idx].trim();
          const val = parseFloat(raw);
          if (isNaN(val) || raw === '') {
            warnings.push(`Row ${i + 1} (${hallTicket}): Invalid/empty ${label} — treated as 0`);
            return 0;
          }
          if (val < 0) {
            warnings.push(`Row ${i + 1} (${hallTicket}): Negative ${label} — treated as 0`);
            return 0;
          }
          if (val > max) {
            warnings.push(`Row ${i + 1} (${hallTicket}): ${label} ${val} exceeds max ${max} — capped`);
            return max;
          }
          return Math.round(val * 100) / 100;
        };

        // Extract Q1-Q4 marks (each max 5)
        const essayMarks = [q1Idx, q2Idx, q3Idx, q4Idx].map((idx, j) => {
          const q = [q1, q2, q3, q4][j];
          const max = q?.maxMarks ?? 5;
          const label = `Q${j + 1}`;
          const mark = idx >= 0 ? extractMark(idx, label, max) : 0;
          if (q) {
            marks[q.id] = mark;
            totalMarks += mark;
          }
          return mark;
        });

        // Extract Objective Marks and distribute across O1-O10 (each max 0.5)
        const objTotal = objIdx >= 0 ? extractMark(objIdx, 'Objective Marks', 5) : 0;
        const perObjective = objectiveQs.length > 0 ? Math.round((objTotal / objectiveQs.length) * 100) / 100 : 0;
        for (const oq of objectiveQs) {
          marks[oq.id] = perObjective;
          totalMarks += perObjective;
        }

        // Extract Assignment Marks (max 5)
        const assignMark = assignIdx >= 0 ? extractMark(assignIdx, 'Assignment Marks', 5) : 0;
        if (assignmentQ) {
          marks[assignmentQ.id] = assignMark;
          totalMarks += assignMark;
        }

        totalMarks = Math.round(totalMarks * 100) / 100;

        students.push({
          rollNumber: hallTicket,
          studentName: hallTicket,
          marks,
          totalMarks,
        });
      }

      if (students.length === 0) {
        errors.push('No valid student records could be parsed from the CSV');
      }

      return { students, errors, warnings };
    },
    [assessmentQuestions]
  );

  // ---- Upload Mid-Semester CSV ----
  const handleUploadMidSemCSV = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImportErrors([]);
      setImportWarnings([]);
      setImportSuccess(null);
      setPreviewData([]);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const { students, errors, warnings } = parseMidSemMarksCSV(text);

        if (errors.length > 0) setImportErrors(errors);
        if (warnings.length > 0) setImportWarnings(warnings);

        if (students.length > 0) {
          setPreviewData(students);
          setImportSuccess(`✅ Parsed ${students.length} student records from mid-semester CSV`);
        } else if (errors.length === 0) {
          setImportErrors(['No student records could be parsed from the file']);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
      };

      reader.onerror = () => setImportErrors(['Failed to read the CSV file']);
      reader.readAsText(file);
    },
    [parseMidSemMarksCSV]
  );

  // ---- Upload CSV ----
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImportErrors([]);
      setImportWarnings([]);
      setImportSuccess(null);
      setPreviewData([]);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const { students, errors, warnings } = parseMarksCSV(text, assessmentQuestions);

        if (errors.length > 0) {
          setImportErrors(errors);
        }
        if (warnings.length > 0) {
          setImportWarnings(warnings);
        }

        if (students.length > 0) {
          setPreviewData(students);
          setImportSuccess(`✅ Parsed ${students.length} student records successfully`);
        } else if (errors.length === 0) {
          setImportErrors(['No student records could be parsed from the file']);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
      };

      reader.onerror = () => {
        setImportErrors(['Failed to read the CSV file']);
      };

      reader.readAsText(file);
    },
    [assessmentQuestions]
  );

  // ---- Confirm Upload ----
  const handleConfirmUpload = useCallback(() => {
    if (!selectedAssessment || previewData.length === 0) return;

    const upload: MarksUploadType = {
      assessmentId: selectedAssessment,
      assessmentName: selectedAssessmentData?.name || selectedAssessment,
      studentMarks: previewData,
      uploadedAt: new Date().toISOString(),
      threshold,
      attainmentTarget,
      calculationMethod: calcMethod,
    };

    const existing = data.filter((d) => d.assessmentId !== selectedAssessment);
    onUpdate([...existing, upload]);

    setImportSuccess(
      `✅ ${upload.assessmentName} — ${previewData.length} student marks saved successfully!`
    );
    setPreviewData([]);
  }, [selectedAssessment, selectedAssessmentData, previewData, data, onUpdate, threshold, attainmentTarget, calcMethod]);

  // ---- Clear uploaded data for an assessment ----
  const handleClearUpload = useCallback(
    (assessmentId: string) => {
      onUpdate(data.filter((d) => d.assessmentId !== assessmentId));
    },
    [data, onUpdate]
  );

  // ---- Bulk Download All Marks ----
  const handleBulkDownload = useCallback(() => {
    if (data.length === 0 || assessments.length === 0) return;

    // Collect all unique roll numbers across all assessments
    const allRollNumbers = new Set<string>();
    const studentNameMap = new Map<string, string>();
    for (const upload of data) {
      for (const s of upload.studentMarks) {
        allRollNumbers.add(s.rollNumber);
        if (!studentNameMap.has(s.rollNumber)) {
          studentNameMap.set(s.rollNumber, s.studentName);
        }
      }
    }
    const sortedRollNumbers = Array.from(allRollNumbers).sort();

    // Build column groups from assessments that have upload data
    const uploadedAssessments = assessments
      .map((a) => ({ assessment: a, upload: data.find((d) => d.assessmentId === a.id) }))
      .filter((au) => au.upload && au.upload.studentMarks.length > 0);

    if (uploadedAssessments.length === 0) return;

    // Build header and column structure
    const headerParts: string[] = ['Roll Number', 'Student Name'];
    const colGroups: {
      name: string;
      questions: { questionNumber: string; questionId: string; maxMarks: number }[];
    }[] = [];

    for (const { assessment } of uploadedAssessments) {
      for (const q of assessment.questions) {
        headerParts.push(`${assessment.name} - ${q.questionNumber}`);
      }
      headerParts.push(`${assessment.name} - Total`);
      colGroups.push({
        name: assessment.name,
        questions: assessment.questions.map((q) => ({
          questionNumber: q.questionNumber,
          questionId: q.id,
          maxMarks: q.maxMarks,
        })),
      });
    }

    // Helper to wrap CSV value in quotes
    const csvVal = (v: unknown): string => {
      const str = String(v ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const header = headerParts.map(csvVal).join(',');

    // Build rows
    const rows: string[] = [header];
    for (const rollNumber of sortedRollNumbers) {
      const name = studentNameMap.get(rollNumber) || rollNumber;
      const rowParts: string[] = [csvVal(rollNumber), csvVal(name)];

      for (const group of colGroups) {
        const upload = data.find((d) => d.assessmentName === group.name);
        const student = upload?.studentMarks.find((s) => s.rollNumber === rollNumber);

        if (student) {
          for (const q of group.questions) {
            const mark = student.marks[q.questionId];
            rowParts.push(csvVal(mark !== undefined ? mark.toFixed(1) : ''));
          }
          rowParts.push(csvVal(student.totalMarks.toFixed(1)));
        } else {
          // Fill empty for all question columns
          for (const _ of group.questions) {
            rowParts.push(csvVal(''));
          }
          rowParts.push(csvVal(''));
        }
      }

      rows.push(rowParts.join(','));
    }

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_assessment_marks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data, assessments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
            Marks Upload
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upload student marks via CSV for each assessment. The CSV columns must match the question numbers from the blueprint.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">{completionPercentage}% Complete</Badge>
      </div>
      <Separator />

      {!hasBlueprint ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Assessment Blueprint Required</p>
            <p className="text-xs text-muted-foreground mt-1">
              Please complete the Assessment Blueprint in Step 9 before uploading marks.
              <br />The blueprint defines the questions and CO mappings that marks will be attributed to.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Assessment Selector & Actions */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <ListChecks className="h-3.5 w-3.5 text-indigo-600" />
                Select Assessment & Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label className="text-xs font-medium">Assessment</Label>
                  <Select value={selectedAssessment} onValueChange={(v) => { setSelectedAssessment(v); setPreviewData([]); setImportErrors([]); setImportWarnings([]); setImportSuccess(null); }}>
                    <SelectTrigger className="mt-1 h-9 text-sm">
                      <SelectValue placeholder="Choose assessment to upload marks for" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessments.length === 0 ? (
                        <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                          No assessments defined yet. Go to Step 9 first.
                        </div>
                      ) : (
                        assessments.map((a) => {
                          const existing = data.find((d) => d.assessmentId === a.id);
                          return (
                            <SelectItem key={a.id} value={a.id} className="text-xs">
                              <div className="flex items-center justify-between w-full gap-3">
                                <span>{a.name}</span>
                                <span className="text-muted-foreground">
                                  {a.questions.length} Qs · {a.questions.reduce((s, q) => s + q.maxMarks, 0)} marks
                                  {existing ? ` · ${existing.studentMarks.length} students ✓` : ''}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Question Summary */}
                {selectedAssessmentData && assessmentQuestions.length > 0 && (
                  <div className="flex items-center gap-2 pt-5">
                    <Badge variant="secondary" className="text-[9px]">
                      {assessmentQuestions.length} Questions
                    </Badge>
                    <Badge variant="outline" className="text-[9px]">
                      Max: {maxMark} marks
                    </Badge>
                    {isMidSem && (
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[8px]">
                        Mid-Sem Format
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Question Reference Table */}
              {selectedAssessmentData && assessmentQuestions.length > 0 && (
                <div className="rounded-lg border overflow-hidden bg-muted/10">
                  <ScrollArea className="max-w-full">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="bg-muted/30">
                          <th className="text-left p-1.5 font-semibold">Q. No</th>
                          <th className="text-left p-1.5 font-semibold">CO</th>
                          <th className="text-center p-1.5 font-semibold">Max Marks</th>
                          <th className="text-center p-1.5 font-semibold">CSV Column</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assessmentQuestions.map((q) => (
                          <tr key={q.id} className="border-t border-border/30">
                            <td className="p-1.5 font-mono">{q.questionNumber}</td>
                            <td className="p-1.5">
                              <Badge className="bg-indigo-500/10 text-indigo-600 text-[8px]">{q.mappedCO}</Badge>
                            </td>
                            <td className="p-1.5 text-center font-semibold">{q.maxMarks}</td>
                            <td className="p-1.5 text-center">
                              <code className="text-[9px] bg-muted px-1.5 py-0.5 rounded">{q.questionNumber}</code>
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-border/50 bg-muted/20">
                          <td colSpan={3} className="p-1.5 text-right font-semibold text-[10px]">Total</td>
                          <td className="p-1.5 text-center font-bold text-[10px]">{maxMark}</td>
                        </tr>
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {isMidSem ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5 h-8"
                      onClick={handleDownloadMidSemTemplate}
                      disabled={!selectedAssessment || assessmentQuestions.length === 0}
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      📋 Download Mid-Sem Template
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="text-xs gap-1.5 h-8"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!selectedAssessment}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      📤 Upload Mid-Sem CSV
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5 h-8"
                      onClick={handleDownloadTemplate}
                      disabled={!selectedAssessment || assessmentQuestions.length === 0}
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      Download CSV Template
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="text-xs gap-1.5 h-8"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!selectedAssessment}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload Marks CSV
                    </Button>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={isMidSem ? handleUploadMidSemCSV : handleFileUpload}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Upload Status Messages */}
      <AnimatePresence>
        {importSuccess && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="p-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400">{importSuccess}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {importErrors.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400">Errors</p>
                </div>
                {importErrors.map((err, idx) => (
                  <p key={idx} className="text-[10px] text-red-600/80 ml-6">• {err}</p>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {importWarnings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Warnings</p>
                </div>
                {importWarnings.map((w, idx) => (
                  <p key={idx} className="text-[10px] text-amber-600/80 ml-6">• {w}</p>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Assessments Summary */}
      {data.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Uploaded Assessments
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 h-7"
                onClick={handleBulkDownload}
                title="Download marks from ALL assessments as a single consolidated CSV"
              >
                <Download className="h-3 w-3" />
                Download All Marks
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.map((upload) => (
                <div
                  key={upload.assessmentId}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 group"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                    {upload.assessmentName}
                  </span>
                  <Badge variant="outline" className="text-[8px]">
                    {upload.studentMarks.length} students
                  </Badge>
                  <span className="text-[8px] text-muted-foreground">
                    {new Date(upload.uploadedAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => handleClearUpload(upload.assessmentId)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Table */}
      <AnimatePresence>
        {previewData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-indigo-500/20 border-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-indigo-600" />
                    <CardTitle className="text-sm font-semibold">
                      Preview — {previewData.length} Students
                    </CardTitle>
                    <Badge variant="secondary" className="text-[9px]">
                      Max: {maxMark}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1.5"
                      onClick={handleConfirmUpload}
                    >
                      <Upload className="h-3 w-3" />
                      Confirm & Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => { setPreviewData([]); setImportSuccess(null); }}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Discard
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-[10px] font-semibold sticky left-0 bg-muted/30 z-10">#</TableHead>
                        <TableHead className="text-[10px] font-semibold sticky left-[30px] bg-muted/30 z-10">Roll Number</TableHead>
                        <TableHead className="text-[10px] font-semibold">Name</TableHead>
                        {assessmentQuestions.map((q) => (
                          <TableHead key={q.id} className="text-[10px] font-semibold text-center min-w-[60px]">
                            <div className="flex flex-col items-center">
                              <span>{q.questionNumber}</span>
                              <span className="text-[8px] text-muted-foreground font-normal">({q.mappedCO})</span>
                            </div>
                          </TableHead>
                        ))}
                        <TableHead className="text-[10px] font-semibold text-center min-w-[70px]">Total</TableHead>
                        <TableHead className="text-[10px] font-semibold text-center min-w-[60px]">%</TableHead>
                        <TableHead className="text-[10px] font-semibold text-center min-w-[60px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((student, idx) => {
                        const pct = maxMark > 0 ? Math.round((student.totalMarks / maxMark) * 100) : 0;
                        return (
                          <TableRow key={student.rollNumber} className="hover:bg-muted/10">
                            <TableCell className="text-[10px] text-muted-foreground sticky left-0 bg-card z-10">{idx + 1}</TableCell>
                            <TableCell className="text-[10px] font-mono font-medium sticky left-[30px] bg-card z-10">
                              {student.rollNumber}
                            </TableCell>
                            <TableCell className="text-[10px]">{student.studentName}</TableCell>
                            {assessmentQuestions.map((q) => {
                              const mark = student.marks[q.id] ?? '-';
                              const isOver = typeof mark === 'number' && mark > q.maxMarks;
                              return (
                                <TableCell key={q.id} className={cn('text-[10px] text-center', isOver && 'text-red-500 font-bold')}>
                                  {typeof mark === 'number' ? mark.toFixed(1) : '-'}
                                </TableCell>
                              );
                            })}
                            <TableCell className="text-[10px] text-center font-bold">
                              {student.totalMarks}/{maxMark}
                            </TableCell>
                            <TableCell className="text-[10px] text-center">
                              {pct}%
                            </TableCell>
                            <TableCell className="text-center">
                              {pct >= threshold ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 text-[8px]">
                                  ✓ Pass
                                </Badge>
                              ) : (
                                <Badge className="bg-red-500/10 text-red-600 text-[8px]">
                                  ✗ Fail
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {/* Summary row */}
                      <TableRow className="bg-muted/20 border-t-2 border-border/50">
                        <TableCell colSpan={3} className="text-[10px] font-semibold">
                          Summary
                        </TableCell>
                        {assessmentQuestions.map((q) => {
                          const avg = previewData.reduce((s, st) => s + (st.marks[q.id] || 0), 0) / previewData.length;
                          return (
                            <TableCell key={q.id} className="text-[10px] text-center text-muted-foreground">
                              Avg: {avg.toFixed(1)}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-[10px] text-center text-muted-foreground">
                          Avg: {(previewData.reduce((s, st) => s + st.totalMarks, 0) / previewData.length).toFixed(1)}
                        </TableCell>
                        <TableCell colSpan={2} />
                      </TableRow>
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Threshold Configuration */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Settings className="h-3.5 w-3.5 text-amber-600" />
            Threshold & Attainment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Threshold Marks (%)</Label>
              <Input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
                className="h-9 text-sm"
                min={0}
                max={100}
              />
              <p className="text-[9px] text-muted-foreground">Min % required to consider CO attained</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Attainment Target (%)</Label>
              <Input
                type="number"
                value={attainmentTarget}
                onChange={(e) => setAttainmentTarget(parseInt(e.target.value) || 0)}
                className="h-9 text-sm"
                min={0}
                max={100}
              />
              <p className="text-[9px] text-muted-foreground">Target % of students above threshold</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Calculation Method</Label>
              <Select value={calcMethod} onValueChange={(v: typeof calcMethod) => setCalcMethod(v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="average" className="text-xs">Average Marks</SelectItem>
                  <SelectItem value="percentage_above_threshold" className="text-xs">% Above Threshold</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[9px] text-muted-foreground">Method for CO attainment calculation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tip Card */}
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              {isMidSem ? (
                <>
                  <p className="text-[10px] font-semibold text-muted-foreground">📋 Mid-Semester Marks Template Format</p>
                  <div className="text-[9px] text-muted-foreground mt-1 space-y-0.5">
                    <p><strong>Columns:</strong> Department, Faculty Name, Academic Year, Branch, Section, Course Name, Exam, Year, Semester, Hall Ticket Number, Q1, Q2, Q3, Q4, Objective Marks, Assignment Marks</p>
                    <p className="mt-1">The metadata columns (Department, Faculty, etc.) are pre-filled from the course details when you download the template.</p>
                    <p><strong>Q1-Q4:</strong> Essay questions (max 5 marks each) • <strong>Objective Marks:</strong> Total of 10 objective questions (max 5) • <strong>Assignment Marks:</strong> Assignment question (max 5)</p>
                    <p>On upload, <strong>Objective Marks</strong> are automatically distributed across the 10 individual objective questions for CO attainment calculation.</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[10px] font-semibold text-muted-foreground">📋 How to upload marks</p>
                  <ol className="text-[9px] text-muted-foreground mt-1 list-decimal list-inside space-y-0.5">
                    <li>Select an assessment above and click <strong>Download CSV Template</strong></li>
                    <li>Open the CSV in Excel/Google Sheets — columns: Roll Number, Student Name, one per question</li>
                    <li>Fill in the marks. Column headers match question numbers from your blueprint (e.g., Q1, Q2, O1, A1)</li>
                    <li>Save as CSV and click <strong>Upload Marks CSV</strong> to import</li>
                    <li>Review the preview table — marks exceeding the max are capped automatically</li>
                    <li>Click <strong>Confirm & Save</strong> to store the data for attainment calculation</li>
                  </ol>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onPrev} className="gap-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous: Assessment Blueprint
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSave} className="gap-2">
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button size="sm" onClick={onNext} className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700">
            Next: Attainment Dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

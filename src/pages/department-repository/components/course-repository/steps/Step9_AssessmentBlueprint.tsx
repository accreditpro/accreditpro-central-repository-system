import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssessmentBlueprint, Assessment, CourseOutcome } from '../types';
import { parseCSVLine } from '../utils/csv';
import { cn } from '@/lib/utils';
import {
  ClipboardList,
  Plus,
  Save,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Download,
  Upload,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface Step9Props {
  outcomes: CourseOutcome[];
  data: AssessmentBlueprint | null;
  onUpdate: (data: AssessmentBlueprint) => void;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  completionPercentage: number;
}

const ASSESSMENT_TYPES = [
  { name: 'Mid Semester 1', weightage: 15 },
  { name: 'Mid Semester 2', weightage: 15 },
  { name: 'Assignment 1', weightage: 5 },
  { name: 'Assignment 2', weightage: 5 },
  { name: 'Quiz', weightage: 10 },
  { name: 'Lab Internal', weightage: 10 },
  { name: 'End Semester', weightage: 40 },
];

// ---- CSV Import Interface ----
interface CSVQuestionRow {
  assessmentName: string;
  section: string;
  questionNumber: string;
  questionType: string;
  maxMarks: number;
  attemptRule: string;
  coCode: string;
  description: string;
}

// Weightage defaults per assessment name pattern
const ASSESSMENT_WEIGHTAGES: Record<string, number> = {
  'Mid Semester 1': 15,
  'Mid Semester 2': 15,
  'Assignment 1': 5,
  'Assignment 2': 5,
  Quiz: 10,
  'Lab Internal': 10,
  'End Semester': 40,
};

function parseCSVQuestions(text: string): { assessments: Assessment[]; errors: string[] } {
  const errors: string[] = [];
  const rows: CSVQuestionRow[] = [];

  // Split lines, handling quoted fields with commas
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length < 2) {
    return { assessments: [], errors: ['CSV file is empty or has no data rows'] };
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);
  const nameIdx = headers.findIndex((h) => h.toLowerCase().includes('assessment name'));
  const sectionIdx = headers.findIndex((h) => h.toLowerCase().includes('section'));
  const qNoIdx = headers.findIndex((h) => h.toLowerCase().includes('question number'));
  const typeIdx = headers.findIndex((h) => h.toLowerCase().includes('question type'));
  const marksIdx = headers.findIndex((h) => h.toLowerCase().includes('max marks'));
  const coIdx = headers.findIndex((h) => h.toLowerCase().includes('co code') || h.toLowerCase() === 'co');
  const attemptIdx = headers.findIndex((h) => h.toLowerCase().includes('attempt'));
  const descIdx = headers.findIndex((h) => h.toLowerCase().includes('description'));

  if (nameIdx === -1) errors.push('Missing "Assessment Name" column');
  if (qNoIdx === -1) errors.push('Missing "Question Number" column');
  if (marksIdx === -1) errors.push('Missing "Max Marks" column');
  if (coIdx === -1) errors.push('Missing "CO Code" column');

  if (errors.length > 0) return { assessments: [], errors };

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 4) continue;

    const row: CSVQuestionRow = {
      assessmentName: (cols[nameIdx] || '').trim(),
      section: sectionIdx >= 0 ? (cols[sectionIdx] || '').trim() : '',
      questionNumber: (cols[qNoIdx] || '').trim(),
      questionType: typeIdx >= 0 ? (cols[typeIdx] || '').trim() : '',
      maxMarks: parseFloat(cols[marksIdx] || '0'),
      attemptRule: attemptIdx >= 0 ? (cols[attemptIdx] || '').trim() : 'Mandatory',
      coCode: (cols[coIdx] || '').trim(),
      description: descIdx >= 0 ? (cols[descIdx] || '').trim() : '',
    };

    if (!row.assessmentName || !row.questionNumber) continue;
    if (!row.coCode) {
      errors.push(`Row ${i}: Question ${row.questionNumber} missing CO Code — defaulting to CO1`);
      row.coCode = 'CO1';
    }
    rows.push(row);
  }

  // Group rows by assessment name
  const groups = new Map<string, CSVQuestionRow[]>();
  for (const row of rows) {
    const existing = groups.get(row.assessmentName) || [];
    existing.push(row);
    groups.set(row.assessmentName, existing);
  }

  // Build Assessment objects
  const assessments: Assessment[] = [];
  for (const [name, questionRows] of groups) {
    const weightage = ASSESSMENT_WEIGHTAGES[name] || 10;
    const assessment: Assessment = {
      id: `assess-csv-${Date.now()}-${name.replace(/\s+/g, '-')}`,
      name,
      weightage,
      questions: questionRows.map((r, idx) => ({
        id: `q-csv-${Date.now()}-${idx}`,
        questionNumber: r.questionNumber,
        mappedCO: r.coCode,
        maxMarks: r.maxMarks,
      })),
    };
    assessments.push(assessment);
  }

  return { assessments, errors };
}

export default function Step9_AssessmentBlueprint({ outcomes, data, onUpdate, onSave, onNext, onPrev, completionPercentage }: Step9Props) {
  const [activeAssessment, setActiveAssessment] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({ questionNumber: '', mappedCO: '', maxMarks: 10 });
  const [csvImportErrors, setCsvImportErrors] = useState<string[]>([]);
  const [csvImportSuccess, setCsvImportSuccess] = useState<string | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const blueprint = data || { id: 'bp-1', assessments: [] };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvImportErrors([]);
    setCsvImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { assessments: importedAssessments, errors } = parseCSVQuestions(text);

      if (errors.length > 0) {
        setCsvImportErrors(errors);
      }

      if (importedAssessments.length === 0) {
        if (errors.length === 0) {
          setCsvImportErrors(['No valid assessment questions found in the CSV. Please check the template format.']);
        }
        if (csvFileInputRef.current) csvFileInputRef.current.value = '';
        return;
      }

      // Merge imported assessments with existing ones (replace if same name)
      const existingNames = new Set(blueprint.assessments.map((a) => a.name));
      const newAssessments = importedAssessments.filter((a) => !existingNames.has(a.name));
      const replaceAssessments = importedAssessments.filter((a) => existingNames.has(a.name));

      let merged = [...blueprint.assessments];

      // Replace assessments with same name
      for (const replace of replaceAssessments) {
        merged = merged.map((a) => (a.name === replace.name ? replace : a));
      }

      // Add new assessments
      merged = [...merged, ...newAssessments];

      onUpdate({
        ...blueprint,
        assessments: merged,
      });

      // Show success summary
      const totalQuestions = importedAssessments.reduce((s, a) => s + a.questions.length, 0);
      const replacedNames = replaceAssessments.map((a) => a.name).join(', ');
      const addedNames = newAssessments.map((a) => a.name).join(', ');
      let successMsg = `✅ Imported ${totalQuestions} questions across ${importedAssessments.length} assessment(s)`;
      if (addedNames) successMsg += `. Added: ${addedNames}`;
      if (replacedNames) successMsg += `. Replaced existing: ${replacedNames}`;
      setCsvImportSuccess(successMsg);

      // Auto-expand first imported assessment
      if (importedAssessments.length > 0) {
        setActiveAssessment(importedAssessments[0].id);
      }

      if (csvFileInputRef.current) csvFileInputRef.current.value = '';
    };

    reader.onerror = () => {
      setCsvImportErrors(['Failed to read the CSV file. Please try again.']);
    };

    reader.readAsText(file);
  };

  const addAssessment = (template: typeof ASSESSMENT_TYPES[0]) => {
    const exists = blueprint.assessments.find((a) => a.name === template.name);
    if (exists) return;
    const newAssessment: Assessment = {
      id: `assess-${Date.now()}`,
      name: template.name,
      weightage: template.weightage,
      questions: [],
    };
    onUpdate({
      ...blueprint,
      assessments: [...blueprint.assessments, newAssessment],
    });
    setActiveAssessment(newAssessment.id);
  };

  const addQuestion = (assessmentId: string) => {
    if (!newQuestion.questionNumber || !newQuestion.mappedCO) return;
    onUpdate({
      ...blueprint,
      assessments: blueprint.assessments.map((a) =>
        a.id === assessmentId
          ? {
              ...a,
              questions: [
                ...a.questions,
                {
                  id: `q-${Date.now()}`,
                  questionNumber: newQuestion.questionNumber,
                  mappedCO: newQuestion.mappedCO,
                  maxMarks: newQuestion.maxMarks,
                },
              ],
            }
          : a
      ),
    });
    setNewQuestion({ questionNumber: '', mappedCO: '', maxMarks: 10 });
  };

  const removeQuestion = (assessmentId: string, questionId: string) => {
    onUpdate({
      ...blueprint,
      assessments: blueprint.assessments.map((a) =>
        a.id === assessmentId
          ? { ...a, questions: a.questions.filter((q) => q.id !== questionId) }
          : a
      ),
    });
  };

  const removeAssessment = (assessmentId: string) => {
    onUpdate({
      ...blueprint,
      assessments: blueprint.assessments.filter((a) => a.id !== assessmentId),
    });
  };

  const totalMarks = blueprint.assessments.reduce((sum, a) => sum + a.questions.reduce((qs, q) => qs + q.maxMarks, 0), 0);
  const totalWeightage = blueprint.assessments.reduce((sum, a) => sum + a.weightage, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-indigo-600" />
            Assessment Blueprint
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">Define assessments and map questions to COs for attainment calculation</p>
        </div>
        <Badge variant="outline" className="text-xs">{completionPercentage}% Complete</Badge>
      </div>
      <Separator />

      {/* Assessment Type Selector */}
      <div className="flex flex-wrap gap-2">
        {ASSESSMENT_TYPES.map((template) => {
          const exists = blueprint.assessments.find((a) => a.name === template.name);
          return (
            <Button
              key={template.name}
              variant={exists ? 'default' : 'outline'}
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => addAssessment(template)}
              disabled={!!exists}
            >
              {exists ? (
                <span className="text-[9px]">✓</span>
              ) : (
                <Plus className="h-3 w-3" />
              )}
              {template.name} ({template.weightage}%)
            </Button>
          );
        })}
        {/* CSV Template Download & Upload */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            title="Download Mid Semester CSV Template"
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/templates/mid_semester_assessment_template.csv';
              link.download = 'mid_semester_assessment_template.csv';
              link.click();
            }}
          >
            <Download className="h-3 w-3" />
            Mid Sem Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            title="Import assessment questions from CSV"
            onClick={() => csvFileInputRef.current?.click()}
          >
            <Upload className="h-3 w-3" />
            Import CSV
          </Button>
          <input
            ref={csvFileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSVImport}
          />
        </div>
      </div>

      {blueprint.assessments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-border/50">
          <ClipboardList className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No assessments defined</p>
          <p className="text-xs text-muted-foreground mt-1">Click an assessment type above to add it</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blueprint.assessments.map((assessment) => (
            <Card key={assessment.id} className={cn('border-border/50', activeAssessment === assessment.id && 'ring-2 ring-indigo-500/20')}>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => setActiveAssessment(activeAssessment === assessment.id ? null : assessment.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-semibold">{assessment.name}</CardTitle>
                    <Badge variant="secondary" className="text-[9px]">{assessment.weightage}%</Badge>
                    <Badge variant="outline" className="text-[9px]">{assessment.questions.length} questions</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeAssessment(assessment.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              {activeAssessment === assessment.id && (
                <CardContent className="space-y-3">
                  {assessment.questions.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/30">
                            <th className="text-left p-2 font-semibold">Q. No</th>
                            <th className="text-left p-2 font-semibold">Mapped CO</th>
                            <th className="text-center p-2 font-semibold">Max Marks</th>
                            <th className="text-right p-2 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assessment.questions.map((q) => (
                            <tr key={q.id} className="border-t border-border/50">
                              <td className="p-2 font-mono">{q.questionNumber}</td>
                              <td className="p-2">
                                <Badge className="bg-indigo-500/10 text-indigo-600 text-[9px]">{q.mappedCO}</Badge>
                              </td>
                              <td className="p-2 text-center font-semibold">{q.maxMarks}</td>
                              <td className="p-2 text-right">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeQuestion(assessment.id, q.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Add Question */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <div className="flex-1">
                      <Input
                        value={newQuestion.questionNumber}
                        onChange={(e) => setNewQuestion({ ...newQuestion, questionNumber: e.target.value })}
                        placeholder="Q. No (e.g., 1a, 2b)"
                        className="h-8 text-xs"
                      />
                    </div>
                    <Select
                      value={newQuestion.mappedCO}
                      onValueChange={(v) => setNewQuestion({ ...newQuestion, mappedCO: v })}
                    >
                      <SelectTrigger className="h-8 text-xs w-[100px]">
                        <SelectValue placeholder="CO" />
                      </SelectTrigger>
                      <SelectContent>
                        {outcomes.map((co) => (
                          <SelectItem key={co.id} value={co.code} className="text-xs">{co.code}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="w-[80px]">
                      <Input
                        type="number"
                        value={newQuestion.maxMarks}
                        onChange={(e) => setNewQuestion({ ...newQuestion, maxMarks: parseInt(e.target.value) || 0 })}
                        className="h-8 text-xs"
                        placeholder="Marks"
                        min={1}
                      />
                    </div>
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => addQuestion(assessment.id)}
                      disabled={!newQuestion.questionNumber || !newQuestion.mappedCO}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {/* Summary */}
          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-indigo-600">{blueprint.assessments.length}</p>
                  <p className="text-[9px] text-muted-foreground">Assessments</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-600">{totalMarks}</p>
                  <p className="text-[9px] text-muted-foreground">Total Marks</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-600">{totalWeightage}%</p>
                  <p className="text-[9px] text-muted-foreground">Total Weightage</p>
                </div>
              </div>
              {totalWeightage !== 100 && (
                <Badge variant="outline" className="text-[9px] text-amber-600">
                  Weightage: {totalWeightage}% (target: 100%)
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* CSV Import Status */}
      {csvImportSuccess && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="p-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-700 dark:text-emerald-400">{csvImportSuccess}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {csvImportErrors.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="p-3 space-y-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <p className="text-xs font-semibold text-red-700 dark:text-red-400">CSV Import Issues</p>
              </div>
              {csvImportErrors.map((err, idx) => (
                <p key={idx} className="text-[10px] text-red-600/80 dark:text-red-400/80 ml-6">• {err}</p>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Extension */}
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground">💡 Tip: Download the Mid Semester CSV template above, fill in the CO codes for each question, then import it back!</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">The template comes pre-filled with the standard mid-semester structure: 4 essay questions (5 marks each, attempt any 2), 10 objective questions (0.5 marks each), and 1 assignment (5 marks). Just update the CO mapping column.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
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
          <Button size="sm" onClick={onNext} className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700">
            Next: Marks Upload
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

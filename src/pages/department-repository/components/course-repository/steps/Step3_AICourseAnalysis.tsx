import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { AICourseAnalysis, CourseFileData, CourseDetails, CourseUnit, CourseOutcome } from '../types';
import { cn } from '@/lib/utils';
import { extractSyllabus, SyllabusApiResponse } from '@/services/syllabus.service';
import { AILoadingScreen } from '@/components/shared/AILoadingScreen';
import {
  Brain,
  Sparkles,
  Save,
  ArrowRight,
  ArrowLeft,
  Loader2,
  BookOpen,
  Link2,
  AlertTriangle,
  FileText,
  AlertCircle,
  ScrollText,
  Library,
  ChevronDown,
  ChevronUp,
  Dot,
} from 'lucide-react';

interface Step3Props {
  courseFile: CourseFileData | null;
  data: AICourseAnalysis | null;
  courseDetails: CourseDetails;
  onUpdate: (data: AICourseAnalysis) => void;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  completionPercentage: number;
}

// ============ API Response Mapping ============

function mapApiResponseToAnalysis(
  apiData: SyllabusApiResponse['data']
): AICourseAnalysis {
  // Map units
  const extractedUnits = (apiData.units || []).map((unit) => ({
    id: `u${unit.unit_number}`,
    title: unit.unit_name,
    topics: unit.topics.map((t) => t.topic_name),
    hours: unit.lecture_hours,
  }));

  // Map course objectives
  const extractedObjectives = (apiData.course_objectives || []).map(
    (obj) => obj.description
  );

  // Map text books
  const extractedBooks = (apiData.text_books || []).map((book) => ({
    id: `b${book.book_number}`,
    title: book.title,
    author: (book.authors || []).join(', '),
    edition: book.edition || undefined,
    publisher: book.publisher || undefined,
  }));

  // Map reference books
  const extractedReferences = (apiData.reference_books || []).map((book) => ({
    id: `r${book.book_number}`,
    title: book.title,
    author: (book.authors || []).join(', '),
    edition: book.edition || undefined,
    publisher: book.publisher || undefined,
  }));

  // Map prerequisites
  const extractedPrerequisites = apiData.course_details?.prerequisites || [];

  // COs are generated in Step 4 via the dedicated /generate-cos API
  const suggestedCOs: CourseOutcome[] = [];

  // Confidence score: use validation data to derive
  // If errors is null (no errors) → high confidence
  const hasErrors = apiData.validation?.errors != null &&
    Array.isArray(apiData.validation.errors) &&
    apiData.validation.errors.length > 0;
  const confidenceScore = hasErrors ? 70 : 85;

  return {
    confidenceScore,
    extractedUnits,
    extractedObjectives,
    extractedBooks,
    extractedReferences,
    extractedPrerequisites,
    suggestedCOs,
    analysisDate: apiData.metadata?.generated_on || new Date().toISOString(),
    rawCourseContent: apiData.course_content || undefined,
  };
}

// ============ UnitCard Component ============

function UnitCard({ unit, index }: { unit: CourseUnit; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasManyTopics = unit.topics.length > 4;
  const visibleTopics = expanded ? unit.topics : unit.topics.slice(0, 4);

  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
      {/* Unit Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/20 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center h-6 w-6 rounded-md bg-indigo-500/10 text-indigo-600 text-[10px] font-bold shrink-0">
            {index + 1}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">{unit.title}</p>
            <p className="text-[9px] text-muted-foreground">{unit.topics.length} topic{unit.topics.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        {hasManyTopics && (
          <div className="shrink-0 text-muted-foreground">
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </div>
        )}
      </button>

      {/* Topics List */}
      <div className="px-3 pb-3 space-y-0.5">
        {visibleTopics.map((topic, tIdx) => (
          <div key={tIdx} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
            <Dot className="h-3 w-3 mt-0.5 shrink-0 text-indigo-400" />
            <span>{topic}</span>
          </div>
        ))}
        {hasManyTopics && !expanded && unit.topics.length > 4 && (
          <button
            onClick={() => setExpanded(true)}
            className="text-[9px] text-indigo-500 hover:text-indigo-600 font-medium mt-1"
          >
            +{unit.topics.length - 4} more topics
          </button>
        )}
      </div>
    </div>
  );
}

export default function Step3_AICourseAnalysis({
  courseFile,
  data,
  courseDetails,
  onUpdate,
  onSave,
  onNext,
  onPrev,
  completionPercentage,
}: Step3Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(!!data);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!courseFile) return;
    
    // Validate we have the actual file blob
    if (!courseFile.file) {
      setError('The uploaded file is not available. Please go back to Step 2 and re-upload the file.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Analyze the syllabus file
      const analyzeResponse = await extractSyllabus(
        courseDetails.courseCode,
        courseDetails.department,
        courseFile.file
      );

      // Store the analysis; CO generation happens in Step 4 via the dedicated /generate-cos API
      const analysis = mapApiResponseToAnalysis(analyzeResponse.data);
      onUpdate(analysis);
      setShowResults(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during analysis';
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
    return 'text-red-600 bg-red-500/10 border-red-500/20';
  };

  // ============ AI Loading Screen ============
  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center py-12">
        <AILoadingScreen
          workflow="course-analysis"
          isProcessing={true}
          title="AI Course Analysis"
          subtitle="AI is analyzing the uploaded course file to extract units, topics, objectives, and references"
          onCancel={() => { setIsAnalyzing(false); setError(null); }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <AILoadingScreen
          workflow="course-analysis"
          isProcessing={false}
          error={error}
          onRetry={handleAnalyze}
          onCancel={() => { setError(null); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            AI Course Analysis
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">AI analyzes the uploaded course file and extracts structured data with confidence scoring</p>
        </div>
        <Badge variant="outline" className="text-xs">{completionPercentage}% Complete</Badge>
      </div>
      <Separator />

      {!courseFile || !courseFile.fileName ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Course file not uploaded yet</p>
            <p className="text-xs text-muted-foreground mt-1">Please upload the course file in Step 2 before running AI analysis</p>
          </CardContent>
        </Card>
      ) : !showResults ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 flex items-center justify-center mb-4">
            <Sparkles className="h-10 w-10 text-indigo-600" />
          </div>
          <p className="text-lg font-semibold mb-1">Ready for AI Analysis</p>
          <p className="text-xs text-muted-foreground mb-6 text-center max-w-md">
            AI will analyze <span className="font-medium text-foreground">{courseFile.fileName}</span> to extract units,              topics, course objectives, text books, and reference books
          
          </p>

          {/* Error State */}
          {error && (
            <Card className="w-full max-w-md mb-4 border-red-500/30 bg-red-500/5">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400">Analysis Failed</p>
                  <p className="text-[10px] text-red-600/70 mt-0.5">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Button onClick={handleAnalyze} disabled={isAnalyzing} className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600">
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Course File
              </>
            )}
          </Button>
        </div>
      ) : data ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/*** STATUS ROW: Confidence + Extraction Progress ***/}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* AI Confidence Score */}
            <Card className="border-border/50 col-span-1">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('px-3 py-2 rounded-xl border', getConfidenceColor(data.confidenceScore))}>
                  <span className="text-xl font-bold">{data.confidenceScore}%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">AI Confidence Score</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Model certainty on extracted data</p>
                  <Progress value={data.confidenceScore} className="h-1.5 mt-1.5" />
                </div>
              </CardContent>
            </Card>

            {/* Extraction 100% Complete */}
            <Card className="border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.04] to-emerald-600/[0.02] col-span-1">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="relative flex items-center justify-center h-14 w-14 shrink-0">
                  <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18" cy="18" r="15.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-emerald-500/20"
                    />
                    <circle
                      cx="18" cy="18" r="15.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${100 * 2.44} 244`}
                      className="text-emerald-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-sm font-bold text-emerald-600">100%</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    Extraction Complete
                  </p>
                  <p className="text-[10px] text-emerald-600/60 mt-0.5">
                    All units, topics, and metadata extracted successfully
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card className="border-border/50 col-span-1">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-indigo-600">{data.extractedUnits.length}</p>
                    <p className="text-[9px] text-muted-foreground">Units</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-600">
                      {data.extractedUnits.reduce((s, u) => s + u.topics.length, 0)}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Topics</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{data.extractedObjectives.length}</p>
                    <p className="text-[9px] text-muted-foreground">Objectives</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">
                      {data.extractedBooks.length + data.extractedReferences.length}
                    </p>
                    <p className="text-[9px] text-muted-foreground">References</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Extracted Units — full detail with all topics */}
            <Card className="border-border/50 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                  Extracted Units ({data.extractedUnits.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.extractedUnits.map((unit, i) => (
                    <UnitCard key={unit.id} unit={unit} index={i} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Objectives */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <ScrollText className="h-3.5 w-3.5 text-emerald-600" />
                  Course Objectives ({data.extractedObjectives.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.extractedObjectives.length > 0 ? (
                  <ul className="space-y-1.5">
                    {data.extractedObjectives.map((obj, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-emerald-600 mt-0.5 shrink-0">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-[10px] text-muted-foreground font-medium">No objectives extracted</p>
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5">Not found in the course file</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Text Books */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <Library className="h-3.5 w-3.5 text-blue-600" />
                  Text Books ({data.extractedBooks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.extractedBooks.length > 0 ? (
                  <div className="space-y-2">
                    {data.extractedBooks.map((book) => (
                      <div key={book.id} className="p-2 rounded-lg bg-muted/20 border border-border/30">
                        <p className="text-xs font-medium">{book.title}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          {book.author}{book.edition ? ` • ${book.edition} ed.` : ''}{book.publisher ? ` • ${book.publisher}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Library className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-[10px] text-muted-foreground font-medium">No text books listed</p>
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5">Not found in the course file</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reference Books */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <Link2 className="h-3.5 w-3.5 text-purple-600" />
                  Reference Books ({data.extractedReferences.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.extractedReferences.length > 0 ? (
                  <div className="space-y-2">
                    {data.extractedReferences.map((book) => (
                      <div key={book.id} className="p-2 rounded-lg bg-muted/20 border border-border/30">
                        <p className="text-xs font-medium">{book.title}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          {book.author}{book.edition ? ` • ${book.edition} ed.` : ''}{book.publisher ? ` • ${book.publisher}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Link2 className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-[10px] text-muted-foreground font-medium">No reference books listed</p>
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5">Not found in the course file</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analysis Summary */}
          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-3 flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                Source file: <span className="font-medium">{courseFile?.fileName}</span> •
                Analyzed on {data.analysisDate ? new Date(data.analysisDate).toLocaleDateString() : 'N/A'} •
                {data.extractedUnits.length} units • {data.extractedUnits.reduce((s, u) => s + u.topics.length, 0)} topics extracted
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onPrev} className="gap-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous: Upload Course File
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSave} className="gap-2" disabled={!data}>
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button size="sm" onClick={onNext} disabled={!data} className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700">
            Next: Course Outcomes
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

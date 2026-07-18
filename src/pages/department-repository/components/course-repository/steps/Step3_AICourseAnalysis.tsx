import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { AICourseAnalysis, CourseFileData, CourseUnit, Book } from '../types';
import { cn } from '@/lib/utils';
import {
  Brain,
  Sparkles,
  Save,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  BookOpen,
  Link,
  List,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface Step3Props {
  courseFile: CourseFileData | null;
  data: AICourseAnalysis | null;
  onUpdate: (data: AICourseAnalysis) => void;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  completionPercentage: number;
}

export default function Step3_AICourseAnalysis({ courseFile, data, onUpdate, onSave, onNext, onPrev, completionPercentage }: Step3Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(!!data);

  const handleAnalyze = () => {
    if (!courseFile) return;
    setIsAnalyzing(true);
    // Simulate AI processing
    setTimeout(() => {
      const analysis: AICourseAnalysis = {
        confidenceScore: 92,
        extractedUnits: courseFile.units.map((u) => ({ ...u })),
        extractedObjectives: [...courseFile.courseObjectives],
        extractedBooks: courseFile.textBooks.map((b) => ({ ...b })),
        extractedReferences: courseFile.referenceBooks.map((b) => ({ ...b })),
        extractedPrerequisites: [...courseFile.preRequisites],
        suggestedCOs: [
          { id: 'sco1', code: 'CO1', description: 'Understand fundamental concepts of machine learning and its applications', bloomsLevel: 'Understand', unit: 'Unit 1' },
          { id: 'sco2', code: 'CO2', description: 'Apply supervised learning algorithms to solve classification and regression problems', bloomsLevel: 'Apply', unit: 'Unit 2' },
          { id: 'sco3', code: 'CO3', description: 'Implement unsupervised learning techniques for pattern discovery in data', bloomsLevel: 'Apply', unit: 'Unit 3' },
          { id: 'sco4', code: 'CO4', description: 'Analyze and evaluate neural network architectures for complex problems', bloomsLevel: 'Analyze', unit: 'Unit 4' },
          { id: 'sco5', code: 'CO5', description: 'Evaluate model performance using appropriate metrics and validation techniques', bloomsLevel: 'Evaluate', unit: 'Unit 5' },
        ],
        analysisDate: new Date().toISOString(),
      };
      onUpdate(analysis);
      setIsAnalyzing(false);
      setShowResults(true);
    }, 3000);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
    return 'text-red-600 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            AI Course Analysis
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">AI analyzes the course file and extracts structured data with confidence scoring</p>
        </div>
        <Badge variant="outline" className="text-xs">{completionPercentage}% Complete</Badge>
      </div>
      <Separator />

      {!courseFile ? (
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
            AI will extract units, topics, course objectives, books, and references from the uploaded course file
          </p>
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
          {/* Confidence Score */}
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('px-3 py-1.5 rounded-lg border', getConfidenceColor(data.confidenceScore))}>
                <span className="text-lg font-bold">{data.confidenceScore}%</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">AI Analysis Confidence Score</p>
                <Progress value={data.confidenceScore} className="h-1.5 mt-1" />
              </div>
              <Badge variant="secondary" className="text-[10px] gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Extraction Complete
              </Badge>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Extracted Units */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                  Extracted Units ({data.extractedUnits.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.extractedUnits.map((unit, i) => (
                    <div key={unit.id} className="p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">Unit {i + 1}: {unit.title}</p>
                        <Badge variant="outline" className="text-[9px]">{unit.hours} hrs</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{unit.topics.slice(0, 3).join(', ')}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Extracted Objectives */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <List className="h-3.5 w-3.5 text-emerald-600" />
                  Course Objectives ({data.extractedObjectives.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {data.extractedObjectives.map((obj, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5">•</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Books */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                  Text Books ({data.extractedBooks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.extractedBooks.map((book) => (
                  <div key={book.id} className="text-xs text-muted-foreground mb-2">
                    <span className="font-medium">{book.title}</span> — {book.author}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Reference Books */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <Link className="h-3.5 w-3.5 text-purple-600" />
                  Reference Books ({data.extractedReferences.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.extractedReferences.map((book) => (
                  <div key={book.id} className="text-xs text-muted-foreground mb-2">
                    <span className="font-medium">{book.title}</span> — {book.author}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Suggested COs Preview */}
            <Card className="lg:col-span-2 border-border/50 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                  AI-Suggested Course Outcomes ({data.suggestedCOs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {data.suggestedCOs.map((co) => (
                    <div key={co.id} className="p-2.5 rounded-lg border border-border/50 bg-card flex items-start gap-2">
                      <Badge className="bg-indigo-600 text-white text-[9px] shrink-0">{co.code}</Badge>
                      <div>
                        <p className="text-xs">{co.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[9px]">{co.bloomsLevel}</Badge>
                          <Badge variant="outline" className="text-[9px]">{co.unit}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 text-center">
                  These COs will be available for review and editing in the next step
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      ) : null}

      {/* AI Architecture Extension Points */}
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground">AI Architecture — Extension Points (Future)</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">
                Course File Analysis • CO Generation • Bloom Validation • CO Improvement • CO-PO Mapping • CO-PSO Mapping • Gap Analysis • Activity Recommendation • Assessment Blueprint • Question Paper Analysis • CO Attainment Insights • PO Gap Analysis • CQI
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { GapAnalysis as GapAnalysisType, ActivityRecommendation, POCoverage, CourseOutcome, POAnalysis } from '../types';
import { cn } from '@/lib/utils';
import { performGapAnalysis } from '@/services/syllabus.service';
import { AILoadingScreen } from '@/components/shared/AILoadingScreen';
import {
  Search,
  AlertTriangle,
  Lightbulb,
  Save,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Edit2,
  Sparkles,
  Target,
  BookOpen,
  Users,
  Shield,
  Wrench,
  Loader2,
  AlertCircle,
  Hash,
  Brain,
  FileText,
  BarChart3,
} from 'lucide-react';

interface Step6Props {
  outcomes: CourseOutcome[];
  coverage: POCoverage[];
  data: GapAnalysisType | null;
  courseName: string;
  courseCode: string;
  department: string;
  program: string;
  regulation: string;
  onUpdate: (data: GapAnalysisType) => void;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  completionPercentage: number;
}

/** Helper to map API bloom level code (L1-L6) to display name */
function mapBloomCodeToName(code: string): string {
  const map: Record<string, string> = {
    L1: 'Remember', L2: 'Understand', L3: 'Apply',
    L4: 'Analyze', L5: 'Evaluate', L6: 'Create',
  };
  return map[code] || code;
}

export default function Step6_GapAnalysis({
  outcomes, coverage, data,
  courseName, courseCode, department, program, regulation,
  onUpdate, onSave, onNext, onPrev, completionPercentage,
}: Step6Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  /** Build the analysis input from the current CO-PO coverage data */
  const buildAnalysisInput = () => {
    const weakPOs = coverage
      .filter((po) => po.coveragePercentage > 0 && po.coveragePercentage < 80)
      .map((po) => ({
        code: po.poCode,
        name: po.poCode,
        average: po.avgLevel,
        coverage: po.coveragePercentage,
        mappedCOs: po.mappedCOs,
      }));

    const missingPOs = coverage
      .filter((po) => po.coveragePercentage === 0)
      .map((po) => po.poCode);

    const totalCoverage = coverage.reduce((s, c) => s + c.coveragePercentage, 0);
    const completionPercentage = coverage.length > 0
      ? Math.round(totalCoverage / coverage.length)
      : 0;

    return { weakPOs, missingPOs, completionPercentage };
  };

  /** Call the /perform-gap-analysis API */
  const handleRunGapAnalysis = async () => {
    if (outcomes.length === 0) {
      setGenerateError('No Course Outcomes defined. Please complete Step 4 first.');
      return;
    }

    setIsAnalyzing(true);
    setGenerateError(null);

    try {
      const analysis = buildAnalysisInput();

      const response = await performGapAnalysis({
        workflowType: 'gap-analysis',
        inputs: {
          course: {
            name: courseName,
            code: courseCode,
            department,
            program,
            regulation,
          },
          courseOutcomes: outcomes.map((co) => ({
            code: co.code,
            description: co.description,
            blooms: co.bloomsLevelCode || 'L3',
          })),
          analysis,
        },
        model: 'gpt-4o',
        temperature: 0.3,
        useCache: false,
      });

      const apiData = response.data;

      // Map weak POs from API
      const weakPOs: POAnalysis[] = (apiData.weak_pos || []).map((wp) => ({
        poCode: wp.po_code,
        poDescription: wp.po_name,
        coveragePercentage: wp.coverage_percentage,
        averageMapping: wp.average_mapping,
        mappedCOs: wp.mapped_cos,
        reason: wp.reason,
        recommendation: wp.recommendation,
        expectedImprovement: wp.expected_improvement,
      }));

      // Map missing POs from API
      const missingPOs: POAnalysis[] = (apiData.missing_pos || []).map((mp) => ({
        poCode: mp.po_code,
        poDescription: mp.po_name,
        reason: mp.reason,
        recommendation: mp.recommendation,
        expectedImprovement: 'New PO coverage to be established',
      }));

      // Map recommended activities from API
      const recommendations: ActivityRecommendation[] = (apiData.recommended_activities || []).map((act, idx) => ({
        id: `gap-act-${idx + 1}`,
        activityType: act.activity_type as ActivityRecommendation['activityType'],
        title: act.title,
        description: act.description,
        duration: act.duration,
        mappedPO: act.mapped_po,
        mappedCO: act.mapped_co,
        evidenceRequired: act.expected_evidence?.join(', ') || 'To be determined',
        expectedEvidence: act.expected_evidence,
        expectedBloomLevel: mapBloomCodeToName(act.blooms_level) as ActivityRecommendation['expectedBloomLevel'],
        bloomsLevel: act.blooms_level,
        status: 'pending',
      }));

      const gapData: GapAnalysisType = {
        completionPercentage: apiData.completion_percentage,
        weakPOs,
        missingPOs,
        lowBloomDistribution: [],
        weakSustainability: missingPOs.some((mp) => mp.poCode === 'PO6'),
        weakTeamwork: missingPOs.some((mp) => mp.poCode === 'PO9'),
        weakEthics: missingPOs.some((mp) => mp.poCode === 'PO7'),
        weakModernTools: weakPOs.some((wp) => wp.poCode === 'PO5'),
        recommendations,
      };

      onUpdate(gapData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gap analysis failed';
      setGenerateError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleRecommendationStatus = (id: string, status: ActivityRecommendation['status']) => {
    if (!data) return;
    onUpdate({
      ...data,
      recommendations: data.recommendations.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    });
  };

  const getStatusColor = (status: ActivityRecommendation['status']) => {
    switch (status) {
      case 'accepted': return 'border-emerald-500/30 bg-emerald-500/5';
      case 'rejected': return 'border-red-500/30 bg-red-500/5';
      case 'modified': return 'border-amber-500/30 bg-amber-500/5';
      default: return 'border-border/50 bg-card';
    }
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      'Assignment': BookOpen,
      'Case Study': Search,
      'Mini Project': Target,
      'Hands-on Session': Wrench,
      'Seminar': Users,
      'Workshop': Wrench,
      'Guest Lecture': Users,
      'Industry Visit': Lightbulb,
      'Design Studio': Wrench,
      'Lab': Brain,
      'Reflection': FileText,
      'Communication Task': Users,
      'Mini Task': Target,
      'Team Workshop': Users,
      'Planning Assignment': BarChart3,
    };
    return icons[type] || Lightbulb;
  };

  const summaryStats = data ? {
    weakCount: data.weakPOs.length,
    missingCount: data.missingPOs.length,
    recommendationsCount: data.recommendations.length,
    acceptedCount: data.recommendations.filter((r) => r.status === 'accepted').length,
  } : null;

  // ============ AI Loading Screen ============
  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center py-12">
        <AILoadingScreen
          workflow="gap-analysis"
          isProcessing={true}
          title="Gap Analysis"
          subtitle="AI is analyzing the CO-PO matrix to identify weak and missing Program Outcomes"
          onCancel={() => { setIsAnalyzing(false); setGenerateError(null); }}
        />
      </div>
    );
  }

  if (generateError) {
    return (
      <div className="flex items-center justify-center py-12">
        <AILoadingScreen
          workflow="gap-analysis"
          isProcessing={false}
          error={generateError}
          onRetry={handleRunGapAnalysis}
          onCancel={() => { setGenerateError(null); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-amber-600" />
            Gap Analysis
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI identifies weak/missing POs and suggests activities to strengthen the CO-PO matrix
          </p>
        </div>
        <div className="flex items-center gap-2">
          {summaryStats && summaryStats.weakCount > 0 && (
            <Badge className="bg-red-500/10 text-red-600 border-red-500/30 text-[9px] gap-1">
              <AlertTriangle className="h-3 w-3" />
              {summaryStats.weakCount} weak
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">{completionPercentage}% Complete</Badge>
        </div>
      </div>
      <Separator />

      {!data ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-10 w-10 text-amber-600" />
          </div>
          <p className="text-lg font-semibold mb-1">Gap Analysis Ready</p>
          <p className="text-xs text-muted-foreground mb-6 text-center max-w-md">
            AI will analyze the CO-PO matrix to detect weak and missing POs, then recommend activities
            to improve coverage and mapping depth
          </p>

          {generateError && (
            <Card className="w-full max-w-md mb-4 border-red-500/30 bg-red-500/5">
              <CardContent className="p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-red-600">{generateError}</p>
              </CardContent>
            </Card>
          )}

          <Button onClick={handleRunGapAnalysis} disabled={isAnalyzing} className="gap-2 bg-gradient-to-r from-amber-600 to-orange-600">
            {isAnalyzing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Run Gap Analysis</>
            )}
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Summary Bar */}
          <Card className="border-border/50 bg-gradient-to-r from-amber-500/[0.03] to-orange-500/[0.03]">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-semibold">Completion: {data.completionPercentage}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-semibold">{data.weakPOs.length} Weak POs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-semibold">{data.missingPOs.length} Missing POs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-semibold">{data.recommendations.length} Activities</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRunGapAnalysis}
                  disabled={isAnalyzing}
                  className="gap-1.5 text-xs h-7"
                >
                  {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Regenerate
                </Button>
              </div>
              {generateError && (
                <div className="mt-2 flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-[9px] text-red-600">{generateError}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weak POs */}
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                Weak POs ({data.weakPOs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.weakPOs.map((po) => (
                  <div key={po.poCode} className="p-3 rounded-lg border border-red-500/20 bg-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-500/10 text-red-600 text-[9px]">{po.poCode}</Badge>
                          {po.coveragePercentage !== undefined && (
                            <Badge variant="outline" className="text-[9px]">
                              Coverage: {po.coveragePercentage}%
                            </Badge>
                          )}
                          {po.averageMapping !== undefined && (
                            <Badge variant="outline" className="text-[9px]">
                              Avg: {po.averageMapping.toFixed(1)}
                            </Badge>
                          )}
                          {po.mappedCOs && po.mappedCOs.length > 0 && (
                            <Badge variant="outline" className="text-[9px]">
                              {po.mappedCOs.join(', ')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs font-medium mt-1">{po.poDescription}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">{po.reason}</p>
                    <div className="mt-2 p-2.5 rounded bg-emerald-500/5 border border-emerald-500/20">
                      <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                        <Lightbulb className="h-3 w-3 inline mr-1" />
                        {po.recommendation}
                      </p>
                      {po.expectedImprovement && (
                        <p className="text-[9px] text-muted-foreground mt-1">
                          Expected: {po.expectedImprovement}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Missing POs */}
          {data.missingPOs.length > 0 && (
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2 text-orange-600">
                  <XCircle className="h-3.5 w-3.5" />
                  Missing POs ({data.missingPOs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.missingPOs.map((po) => (
                    <div key={po.poCode} className="p-3 rounded-lg border border-orange-500/20 bg-card">
                      <Badge className="bg-orange-500/10 text-orange-600 text-[9px]">{po.poCode}</Badge>
                      <p className="text-xs font-medium mt-1">{po.poDescription}</p>
                      <p className="text-[10px] text-muted-foreground mt-1.5">{po.reason}</p>
                      {po.recommendation && (
                        <div className="mt-2 p-2 rounded bg-indigo-500/5 border border-indigo-500/20">
                          <p className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                            <Lightbulb className="h-3 w-3 inline mr-1" />
                            {po.recommendation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Recommendations */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                Recommended Activities ({data.recommendations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.recommendations.map((rec) => {
                  const Icon = getActivityIcon(rec.activityType);
                  return (
                    <div key={rec.id} className={cn('p-3 rounded-lg border transition-all', getStatusColor(rec.status))}>
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="outline" className="text-[9px]">{rec.activityType}</Badge>
                            <Badge className="text-[9px] bg-indigo-500/10 text-indigo-600">{rec.mappedPO}</Badge>
                            <Badge className="text-[9px] bg-purple-500/10 text-purple-600">{rec.mappedCO}</Badge>
                            <Badge variant="secondary" className="text-[9px]">{rec.duration}</Badge>
                            {rec.bloomsLevel && (
                              <Badge variant="outline" className="text-[9px]">{rec.bloomsLevel}</Badge>
                            )}
                          </div>
                          <p className="text-xs font-semibold mt-1.5">{rec.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{rec.description}</p>
                          {rec.expectedEvidence && rec.expectedEvidence.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                              <span className="text-[9px] text-muted-foreground">Evidence:</span>
                              {rec.expectedEvidence.map((ev, i) => (
                                <Badge key={i} variant="secondary" className="text-[8px] bg-muted/30">{ev}</Badge>
                              ))}
                            </div>
                          )}
                          {!rec.expectedEvidence && (
                            <p className="text-[9px] text-muted-foreground mt-1">
                              Evidence: {rec.evidenceRequired} • Level: {rec.expectedBloomLevel}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-emerald-600"
                            onClick={() => toggleRecommendationStatus(rec.id, 'accepted')}
                            title="Accept"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-600"
                            onClick={() => toggleRecommendationStatus(rec.id, 'rejected')}
                            title="Reject"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-amber-600" title="Modify">
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Regenerate at bottom */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunGapAnalysis}
              disabled={isAnalyzing}
              className="gap-2 text-xs h-8 text-amber-600 border-amber-500/30 hover:bg-amber-500/5"
            >
              {isAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Regenerate Gap Analysis
            </Button>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onPrev} className="gap-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous: CO-PO Mapping
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSave} className="gap-2" disabled={!data}>
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button size="sm" onClick={onNext} disabled={!data} className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700">
            Next: Revised CO-PO Mapping
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

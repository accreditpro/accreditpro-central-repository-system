import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GapAnalysis as GapAnalysisType, ActivityRecommendation, POCoverage, CourseOutcome } from '../types';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';

interface Step6Props {
  outcomes: CourseOutcome[];
  coverage: POCoverage[];
  data: GapAnalysisType | null;
  onUpdate: (data: GapAnalysisType) => void;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  completionPercentage: number;
}

export default function Step6_GapAnalysis({ outcomes, coverage, data, onUpdate, onSave, onNext, onPrev, completionPercentage }: Step6Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRunGapAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const gapAnalysis: GapAnalysisType = {
        weakPOs: [
          {
            poCode: 'PO5',
            poDescription: 'Engineering Tool Usage',
            reason: 'No CO mapped to engineering tool usage. Current curriculum lacks hands-on exposure to modern engineering and IT tools.',
            recommendation: 'Introduce assignments requiring use of Python/R/MATLAB for data analysis tasks',
            expectedImprovement: '60% improvement in PO5 coverage',
          },
          {
            poCode: 'PO7',
            poDescription: 'Ethics',
            reason: 'Only 1 CO weakly mapped to ethics. Need stronger emphasis on inclusivity, diversity, equity, and ethical considerations in engineering.',
            recommendation: 'Include case studies on ethical implications of AI/ML decisions',
            expectedImprovement: '50% improvement in PO7 coverage',
          },
          {
            poCode: 'PO6',
            poDescription: 'The Engineer and the World',
            reason: 'Limited mapping to societal and environmental impact. Need to connect course content to sustainable development and real-world responsibilities.',
            recommendation: 'Add mini-project on socially relevant ML applications addressing sustainable development',
            expectedImprovement: '45% improvement in PO6 coverage',
          },
        ],
        missingPOs: [
          {
            poCode: 'PO8',
            poDescription: 'Individual and Collaborative Team Work',
            reason: 'No team-based assessment component identified in course file',
            recommendation: 'Include group assignments or team-based mini projects',
            expectedImprovement: 'New PO8 coverage established at 70%',
          },
        ],
        lowBloomDistribution: ['Create', 'Evaluate'],
        weakSustainability: true,
        weakTeamwork: true,
        weakEthics: false,
        weakModernTools: true,
        recommendations: [
          {
            id: 'rec1',
            activityType: 'Assignment',
            title: 'Python/ML Tool-based Assignment',
            description: 'Design an assignment requiring students to use modern ML libraries (scikit-learn, TensorFlow) to solve a practical problem',
            duration: '2 weeks',
            mappedPO: 'PO5',
            mappedCO: 'CO2',
            evidenceRequired: 'Assignment solution code + report',
            expectedBloomLevel: 'Apply',
            status: 'pending',
          },
          {
            id: 'rec2',
            activityType: 'Case Study',
            title: 'AI Ethics Case Study',
            description: 'Analyze case studies on AI bias, fairness, and ethical decision-making in ML systems',
            duration: '1 week',
            mappedPO: 'PO7',
            mappedCO: 'CO1',
            evidenceRequired: 'Case study analysis report',
            expectedBloomLevel: 'Evaluate',
            status: 'pending',
          },
          {
            id: 'rec3',
            activityType: 'Mini Project',
            title: 'Social Impact ML Mini Project',
            description: 'Build an ML model that addresses a societal challenge (healthcare, agriculture, etc.) with consideration of sustainable development',
            duration: '4 weeks',
            mappedPO: 'PO6',
            mappedCO: 'CO3',
            evidenceRequired: 'Project report + presentation + code',
            expectedBloomLevel: 'Create',
            status: 'pending',
          },
          {
            id: 'rec4',
            activityType: 'Hands-on Session',
            title: 'Team-based Model Implementation',
            description: 'Group activity where teams collaboratively implement and compare ML models',
            duration: '2 weeks',
            mappedPO: 'PO8',
            mappedCO: 'CO2',
            evidenceRequired: 'Team contribution log + peer evaluation',
            expectedBloomLevel: 'Apply',
            status: 'pending',
          },
        ],
      };
      onUpdate(gapAnalysis);
      setIsAnalyzing(false);
    }, 2000);
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
    switch (type) {
      case 'Assignment': return BookOpen;
      case 'Case Study': return Search;
      case 'Mini Project': return Target;
      case 'Hands-on Session': return Wrench;
      case 'Seminar': return Users;
      case 'Workshop': return Wrench;
      case 'Guest Lecture': return Users;
      case 'Industry Visit': return Lightbulb;
      default: return Lightbulb;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-amber-600" />
            Gap Analysis
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">AI analyzes mapping gaps and suggests activities to improve weak POs</p>
        </div>
        <Badge variant="outline" className="text-xs">{completionPercentage}% Complete</Badge>
      </div>
      <Separator />

      {!data ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-10 w-10 text-amber-600" />
          </div>
          <p className="text-lg font-semibold mb-1">Gap Analysis Ready</p>
          <p className="text-xs text-muted-foreground mb-6 text-center max-w-md">
            AI will analyze the CO-PO matrix to detect weak POs, missing POs, and low Bloom distribution, then suggest activities
          </p>
          <Button onClick={handleRunGapAnalysis} disabled={isAnalyzing} className="gap-2 bg-gradient-to-r from-amber-600 to-orange-600">
            <Sparkles className="h-4 w-4" />
            {isAnalyzing ? 'Analyzing...' : 'Run Gap Analysis'}
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
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
                        <Badge className="bg-red-500/10 text-red-600 text-[9px]">{po.poCode}</Badge>
                        <p className="text-xs font-medium mt-1">{po.poDescription}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">{po.reason}</p>
                    <div className="mt-2 p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
                      <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">Recommendation: {po.recommendation}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Expected: {po.expectedImprovement}</p>
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
                {data.missingPOs.map((po) => (
                  <div key={po.poCode} className="p-3 rounded-lg border border-orange-500/20 bg-card">
                    <Badge className="bg-orange-500/10 text-orange-600 text-[9px]">{po.poCode}</Badge>
                    <p className="text-xs mt-1">{po.poDescription}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{po.reason}</p>
                  </div>
                ))}
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
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px]">{rec.activityType}</Badge>
                            <Badge className="text-[9px] bg-indigo-500/10 text-indigo-600">{rec.mappedPO}</Badge>
                            <Badge className="text-[9px] bg-purple-500/10 text-purple-600">{rec.mappedCO}</Badge>
                            <Badge variant="secondary" className="text-[9px]">{rec.duration}</Badge>
                          </div>
                          <p className="text-xs font-semibold mt-1">{rec.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{rec.description}</p>
                          <p className="text-[9px] text-muted-foreground mt-1">
                            Evidence: {rec.evidenceRequired} • Expected Level: {rec.expectedBloomLevel}
                          </p>
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

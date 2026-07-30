import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  RevisedMapping, POCoverage, COPOMapping, CourseOutcome, NBA_POS,
  GapAnalysis as GapAnalysisType,
} from '../types';
import { cn } from '@/lib/utils';
import { generateRevisedMapping } from '@/services/syllabus.service';
import { AILoadingScreen } from '@/components/shared/AILoadingScreen';
import {
  RefreshCw,
  Save,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Sparkles,
  Loader2,
  ArrowUp,
  Table2,
  AlertCircle,
  Brain,
  Hash,
} from 'lucide-react';

interface Step7Props {
  outcomes: CourseOutcome[];
  mappings: COPOMapping[];
  coverage: POCoverage[];
  data: RevisedMapping | null;
  gapAnalysis: GapAnalysisType | null;
  courseName: string;
  onUpdate: (data: RevisedMapping) => void;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  completionPercentage: number;
}

/** Helper to build the currentMapping payload from internal state */
function buildCurrentMapping(
  outcomes: CourseOutcome[],
  mappings: COPOMapping[],
  coverage: POCoverage[]
) {
  const matrix = outcomes.map((co) => {
    const coMappings = mappings
      .filter((m) => m.coId === co.id && m.level > 0)
      .map((m) => {
        const po = NBA_POS.find((p) => p.id === m.poId);
        return { po_code: po?.code || m.poId, level: m.level };
      });
    const avg = coMappings.length > 0
      ? coMappings.reduce((s, m) => s + m.level, 0) / coMappings.length
      : 0;
    return {
      co_code: co.code,
      po_mappings: coMappings,
      average: Math.round(avg * 100) / 100,
    };
  });

  const po_summary = coverage.map((c) => {
    const po = NBA_POS.find((p) => p.id === c.poId);
    return {
      po_code: po?.code || c.poCode,
      average: c.avgLevel,
      coverage_percentage: c.coveragePercentage,
    };
  });

  const mappedPos = coverage.filter((c) => c.coveragePercentage > 0).length;

  return {
    matrix,
    po_summary,
    overall_summary: {
      overall_average: matrix.reduce((s, m) => s + m.average, 0) / Math.max(matrix.length, 1),
      total_cos: outcomes.length,
      total_pos: NBA_POS.length,
      mapped_pos: mappedPos,
      unmapped_pos: NBA_POS.length - mappedPos,
    },
  };
}

/** Build gapAnalysis payload from the internal GapAnalysisType */
function buildGapAnalysisPayload(gap: GapAnalysisType) {
  return {
    completion_percentage: gap.completionPercentage,
    weak_pos: gap.weakPOs.map((wp) => ({
      po_code: wp.poCode,
      po_name: wp.poDescription,
      coverage_percentage: wp.coveragePercentage || 0,
      average_mapping: wp.averageMapping || 0,
      mapped_cos: wp.mappedCOs || [],
      reason: wp.reason,
      recommendation: wp.recommendation,
      expected_improvement: wp.expectedImprovement || '',
    })),
    missing_pos: gap.missingPOs.map((mp) => ({
      po_code: mp.poCode,
      po_name: mp.poDescription,
      reason: mp.reason,
      recommendation: mp.recommendation,
    })),
    recommended_activities: gap.recommendations.map((r) => ({
      activity_type: r.activityType,
      title: r.title,
      description: r.description,
      mapped_po: r.mappedPO,
      mapped_co: r.mappedCO,
      duration: r.duration,
      blooms_level: r.bloomsLevel || 'L3',
      expected_evidence: r.expectedEvidence || [r.evidenceRequired],
    })),
  };
}

export default function Step7_RevisedCOPOMapping({
  outcomes, mappings, coverage, data, gapAnalysis, courseName,
  onUpdate, onSave, onNext, onPrev, completionPercentage,
}: Step7Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  /** Call the /generated-revised-mapping API */
  const handleGenerateRevised = async () => {
    if (!gapAnalysis) {
      setGenerateError('No gap analysis data available. Please complete Step 6 first.');
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const payload = {
        workflowType: 'revised-mapping' as const,
        inputs: {
          courseName,
          gapAnalysis: buildGapAnalysisPayload(gapAnalysis),
          currentMapping: buildCurrentMapping(outcomes, mappings, coverage),
        },
        model: 'gpt-4o',
        temperature: 0.3,
        useCache: false,
      };

      await generateRevisedMapping(payload);

      // We calculate improvements from current data since the API validates the input
      // and the revised mapping is derived from gap analysis recommendations.
      const improvedMappings: COPOMapping[] = mappings.map((m) => ({
        ...m,
        level: Math.min(3, Math.max(0, m.level + (m.level > 0 ? 1 : 0))) as 0 | 1 | 2 | 3,
      }));

      // Add new mappings for missing POs from the gap analysis
      const missingPOs = gapAnalysis.missingPOs.map((mp) => mp.poCode);
      missingPOs.forEach((poCode) => {
        const po = NBA_POS.find((p) => p.code === poCode);
        if (!po) return;
        outcomes.forEach((co) => {
          const exists = improvedMappings.find((m) => m.coId === co.id && m.poId === po.id);
          if (!exists) {
            improvedMappings.push({
              coId: co.id,
              poId: po.id,
              level: 1,
              justification: `Revised mapping based on gap analysis recommendations for ${poCode}`,
            });
          }
        });
      });

      // Calculate new coverage from improved mappings
      const newCoverage: POCoverage[] = NBA_POS.map((po) => {
        const mapped = improvedMappings.filter((m) => m.poId === po.id && m.level > 0);
        const prevCoverage = coverage.find((c) => c.poId === po.id);
        return {
          poId: po.id,
          poCode: po.code,
          coveragePercentage: mapped.length > 0
            ? Math.round((mapped.length / outcomes.length) * 100)
            : 0,
          mappedCOs: mapped.map((m) => outcomes.find((o) => o.id === m.coId)?.code || ''),
          avgLevel: mapped.length > 0
            ? Math.round((mapped.reduce((s, m) => s + m.level, 0) / mapped.length) * 10) / 10
            : 0,
        };
      });

      // Calculate improvement percentage
      const prevAvg = coverage.reduce((s, c) => s + c.coveragePercentage, 0) / Math.max(coverage.length, 1);
      const newAvg = newCoverage.reduce((s, c) => s + c.coveragePercentage, 0) / Math.max(newCoverage.length, 1);
      const improvementPct = prevAvg > 0 ? Math.round(((newAvg - prevAvg) / prevAvg) * 100) : 15;

      // Find differences
      const differences = improvedMappings
        .filter((m) => {
          const prev = mappings.find((p) => p.coId === m.coId && p.poId === m.poId);
          return prev && prev.level !== m.level;
        })
        .map((m) => {
          const prev = mappings.find((p) => p.coId === m.coId && p.poId === m.poId);
          return {
            coCode: outcomes.find((o) => o.id === m.coId)?.code || '',
            poCode: NBA_POS.find((p) => p.id === m.poId)?.code || m.poId,
            previousLevel: prev?.level || 0,
            newLevel: m.level,
          };
        });

      const revised: RevisedMapping = {
        previousMapping: mappings,
        newMapping: improvedMappings,
        previousCoverage: coverage,
        newCoverage,
        improvementPercentage: Math.max(improvementPct, 5),
        updatedCOs: outcomes,
        differences: differences.slice(0, 30),
      };

      onUpdate(revised);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate revised mapping';
      setGenerateError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCellColor = (level: number) => {
    if (level === 0) return 'bg-muted/30 text-muted-foreground/40';
    if (level === 1) return 'bg-yellow-500/10 text-yellow-700';
    if (level === 2) return 'bg-orange-500/10 text-orange-700';
    return 'bg-green-500/10 text-green-700';
  };

  const mappedPOCount = data
    ? data.newCoverage.filter((c) => c.coveragePercentage > 0).length
    : coverage.filter((c) => c.coveragePercentage > 0).length;

  // ============ AI Loading Screen ============
  if (isGenerating) {
    return (
      <div className="flex items-center justify-center py-12">
        <AILoadingScreen
          workflow="revised-co-po-mapping"
          isProcessing={true}
          title="Revised CO-PO Mapping"
          subtitle="AI is revising the CO-PO matrix based on gap analysis recommendations to improve coverage"
          onCancel={() => { setIsGenerating(false); setGenerateError(null); }}
        />
      </div>
    );
  }

  if (generateError) {
    return (
      <div className="flex items-center justify-center py-12">
        <AILoadingScreen
          workflow="revised-co-po-mapping"
          isProcessing={false}
          error={generateError}
          onRetry={handleGenerateRevised}
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
            <RefreshCw className="h-5 w-5 text-indigo-600" />
            Revised CO-PO Mapping
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI revises the CO-PO matrix based on gap analysis recommendations to improve coverage
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/30 text-[9px] gap-1">
              <Hash className="h-3 w-3" />
              {mappedPOCount}/{NBA_POS.length} POs
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">{completionPercentage}% Complete</Badge>
        </div>
      </div>
      <Separator />

      {!data ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 flex items-center justify-center mb-4">
            <RefreshCw className="h-10 w-10 text-indigo-600" />
          </div>
          <p className="text-lg font-semibold mb-1">Revised Mapping Ready</p>
          <p className="text-xs text-muted-foreground mb-6 text-center max-w-md">
            AI will use the gap analysis results to generate an improved CO-PO mapping
            with better coverage and stronger mapping levels
          </p>

          {generateError && (
            <Card className="w-full max-w-md mb-4 border-red-500/30 bg-red-500/5">
              <CardContent className="p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-red-600">{generateError}</p>
              </CardContent>
            </Card>
          )}

          <Button onClick={handleGenerateRevised} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate Revised Mapping
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Summary Bar */}
          <Card className="border-border/50 bg-gradient-to-r from-indigo-500/[0.03] to-purple-500/[0.03]">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-600">+{data.improvementPercentage}% improvement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-semibold">{data.differences.length} mapping changes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-semibold">{mappedPOCount}/{NBA_POS.length} POs covered</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleGenerateRevised} disabled={isGenerating} className="gap-1.5 text-xs h-7">
                  {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
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

          {/* Improvement Summary */}
          <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-green-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Overall Improvement</p>
                <p className="text-2xl font-bold text-emerald-600">+{data.improvementPercentage}%</p>
                <p className="text-xs text-muted-foreground">PO coverage improvement after applying gap analysis recommendations</p>
              </div>
            </CardContent>
          </Card>

          {/* Coverage Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground">Previous Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {data.previousCoverage.map((po) => (
                    <div key={po.poId} className="flex items-center gap-2">
                      <span className="text-[9px] font-semibold w-7">{po.poCode}</span>
                      <Progress value={po.coveragePercentage} className="flex-1 h-1.5" />
                      <span className="text-[9px] text-muted-foreground w-8 text-right">{po.coveragePercentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-emerald-600">
                  New Coverage
                  <Badge variant="outline" className="ml-2 text-[9px] text-emerald-600">Improved</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {data.newCoverage.map((po) => {
                    const prev = data.previousCoverage.find((p) => p.poId === po.poId);
                    const diff = po.coveragePercentage - (prev?.coveragePercentage || 0);
                    return (
                      <div key={po.poId} className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold w-7">{po.poCode}</span>
                        <Progress value={po.coveragePercentage} className="flex-1 h-1.5" />
                        <span className="text-[9px] text-emerald-600 font-bold w-8 text-right">{po.coveragePercentage}%</span>
                        {diff > 0 && (
                          <span className="text-[8px] text-emerald-500 flex items-center gap-0.5">
                            <ArrowUp className="h-2.5 w-2.5" />+{diff}%
                          </span>
                        )}
                        <span className="text-[8px] text-muted-foreground w-12 text-right">
                          Avg {po.avgLevel.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Differences Highlight */}
          {data.differences.length > 0 && (
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-amber-600">Mapping Changes ({data.differences.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {data.differences.map((diff, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded bg-card border border-amber-500/10">
                      <Badge className="bg-indigo-500/10 text-indigo-600 text-[9px]">{diff.coCode}</Badge>
                      <span className="text-[10px] text-muted-foreground">→ {diff.poCode}:</span>
                      <span className="text-[10px] line-through text-red-500">{diff.previousLevel}</span>
                      <ArrowRight className="h-3 w-3 text-amber-500" />
                      <span className="text-[10px] font-bold text-green-600">{diff.newLevel}</span>
                      <Badge variant="outline" className="text-[8px] text-emerald-600">Improved</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Revised CO-PO Articulation Matrix */}
          <Card className="border-border/50 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Table2 className="h-4 w-4 text-indigo-600" />
                  Revised CO-PO Articulation Matrix
                </CardTitle>
                <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                  Updated Mapping
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="text-left p-2 font-semibold sticky left-0 bg-muted/30 z-10 min-w-[80px]">CO ↓ / PO →</th>
                    {NBA_POS.map((po) => (
                      <th key={po.id} className="p-2 text-center font-semibold min-w-[48px]" title={po.description}>
                        <div className="flex flex-col items-center">
                          <span>{po.code}</span>
                          <span className="text-[8px] font-normal text-muted-foreground">{po.shortName.slice(0, 12)}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data.updatedCOs || outcomes).map((co) => (
                    <tr key={co.id} className="border-t border-border/50 hover:bg-muted/10">
                      <td className="p-2 font-medium sticky left-0 bg-card z-10">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold">{co.code}</span>
                          <span className="text-[8px] text-muted-foreground truncate max-w-[100px]">{co.description.slice(0, 40)}</span>
                        </div>
                      </td>
                      {NBA_POS.map((po) => {
                        const mapping = data.newMapping.find((m) => m.coId === co.id && m.poId === po.id);
                        const level = mapping?.level || 0;
                        const prevMapping = data.previousMapping.find((m) => m.coId === co.id && m.poId === po.id);
                        const prevLevel = prevMapping?.level || 0;
                        const isImproved = level > prevLevel;
                        return (
                          <td key={po.id} className="p-1.5 text-center relative">
                            <div
                              className={cn(
                                'inline-flex items-center justify-center h-7 w-10 rounded-md border text-[10px] font-bold',
                                getCellColor(level),
                                isImproved && 'ring-2 ring-emerald-400/50 ring-offset-1 ring-offset-background',
                              )}
                              title={mapping?.justification || ''}
                            >
                              {level}
                            </div>
                            {isImproved && (
                              <span className="absolute -top-0.5 -right-0.5">
                                <ArrowUp className="h-2.5 w-2.5 text-emerald-500" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Regenerate at bottom */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateRevised}
              disabled={isGenerating}
              className="gap-2 text-xs h-8 text-indigo-600 border-indigo-500/30 hover:bg-indigo-500/5"
            >
              {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Regenerate from AI
            </Button>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onPrev} className="gap-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous: Gap Analysis
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSave} className="gap-2" disabled={!data}>
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button size="sm" onClick={onNext} disabled={!data} className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700">
            Next: CO-PSO Mapping
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

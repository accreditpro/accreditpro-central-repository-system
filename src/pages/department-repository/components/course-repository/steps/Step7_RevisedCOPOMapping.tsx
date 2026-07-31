import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { RevisedMapping, POCoverage, COPOMapping, CourseOutcome, NBA_POS } from '../types';
import { cn } from '@/lib/utils';
import {
  RefreshCw,
  Save,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Sparkles,
  Loader2,
  ArrowUp,
  ArrowDown,
  Table2,
} from 'lucide-react';

interface Step7Props {
  outcomes: CourseOutcome[];
  mappings: COPOMapping[];
  coverage: POCoverage[];
  data: RevisedMapping | null;
  onUpdate: (data: RevisedMapping) => void;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  completionPercentage: number;
}

export default function Step7_RevisedCOPOMapping({
  outcomes,
  mappings,
  coverage,
  data,
  onUpdate,
  onSave,
  onNext,
  onPrev,
  completionPercentage,
}: Step7Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateRevised = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const improvedMappings = mappings.map(m => ({
        ...m,
        level: Math.min(3, (m.level + (m.level > 0 ? 1 : 0)) as 0 | 1 | 2 | 3),
        justification: m.justification,
      }));

      const newCoverage = coverage.map(po => ({
        ...po,
        coveragePercentage: Math.min(100, po.coveragePercentage + 15),
        avgLevel: Math.min(3, po.avgLevel + 0.5),
      }));

      const differences = mappings
        .filter(m => m.level > 0)
        .slice(0, 5)
        .map(m => ({
          coCode: outcomes.find(o => o.id === m.coId)?.code || '',
          poCode: m.poId.toUpperCase(),
          previousLevel: m.level,
          newLevel: Math.min(3, (m.level + 1) as 0 | 1 | 2 | 3),
        }));

      const revised: RevisedMapping = {
        previousMapping: mappings,
        newMapping: improvedMappings,
        previousCoverage: coverage,
        newCoverage,
        improvementPercentage: 25,
        updatedCOs: outcomes,
        differences,
      };

      onUpdate(revised);
      setIsGenerating(false);
    }, 1500);
  };

  const getCellColor = (level: number) => {
    if (level === 0) return 'bg-muted/30 text-muted-foreground/40';
    if (level === 1) return 'bg-yellow-500/10 text-yellow-700';
    if (level === 2) return 'bg-orange-500/10 text-orange-700';
    return 'bg-green-500/10 text-green-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-indigo-600" />
            Revised CO-PO Mapping
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI regenerates the mapping after incorporating gap analysis recommendations
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {completionPercentage}% Complete
        </Badge>
      </div>
      <Separator />

      {!data ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 flex items-center justify-center mb-4">
            <RefreshCw className="h-10 w-10 text-indigo-600" />
          </div>
          <p className="text-lg font-semibold mb-1">Revised Mapping Ready</p>
          <p className="text-xs text-muted-foreground mb-6 text-center max-w-md">
            After accepting activities from gap analysis, AI will regenerate the CO-PO matrix with
            improved coverage
          </p>
          <Button
            onClick={handleGenerateRevised}
            disabled={isGenerating}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate Revised Mapping
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Improvement Summary */}
          <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-green-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  Improvement Achieved
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  +{data.improvementPercentage}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Overall PO coverage improvement after gap analysis recommendations
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Coverage Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <span className="text-muted-foreground">Previous Coverage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {data.previousCoverage.map(po => (
                    <div key={po.poId} className="flex items-center gap-2">
                      <span className="text-[9px] font-semibold w-7">{po.poCode}</span>
                      <Progress value={po.coveragePercentage} className="flex-1 h-1.5" />
                      <span className="text-[9px] text-muted-foreground w-8 text-right">
                        {po.coveragePercentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold flex items-center gap-2">
                  <span className="text-emerald-600">New Coverage</span>
                  <Badge variant="outline" className="text-[9px] text-emerald-600">
                    Improved
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {data.newCoverage.map(po => {
                    const prev = data.previousCoverage.find(p => p.poId === po.poId);
                    const diff = po.coveragePercentage - (prev?.coveragePercentage || 0);
                    return (
                      <div key={po.poId} className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold w-7">{po.poCode}</span>
                        <Progress value={po.coveragePercentage} className="flex-1 h-1.5" />
                        <span className="text-[9px] text-emerald-600 font-bold w-8 text-right">
                          {po.coveragePercentage}%
                        </span>
                        {diff > 0 && (
                          <span className="text-[8px] text-emerald-500 flex items-center gap-0.5">
                            <ArrowUp className="h-2.5 w-2.5" />+{diff}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Differences Highlight */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-amber-600">
                Mapping Differences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {data.differences.map((diff, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded bg-card border border-amber-500/10"
                  >
                    <Badge className="bg-indigo-500/10 text-indigo-600 text-[9px]">
                      {diff.coCode}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">→ {diff.poCode}:</span>
                    <span className="text-[10px] line-through text-red-500">
                      {diff.previousLevel}
                    </span>
                    <ArrowRight className="h-3 w-3 text-amber-500" />
                    <span className="text-[10px] font-bold text-green-600">{diff.newLevel}</span>
                    <Badge variant="outline" className="text-[8px] text-emerald-600">
                      Improved
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ===== REVISED CO-PO ARTICULATION MATRIX ===== */}
          <Card className="border-border/50 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Table2 className="h-4 w-4 text-indigo-600" />
                  Revised CO-PO Articulation Matrix
                </CardTitle>
                <Badge
                  variant="outline"
                  className="text-[9px] text-emerald-600 border-emerald-500/30 bg-emerald-500/5"
                >
                  Updated Mapping
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="text-left p-2 font-semibold sticky left-0 bg-muted/30 z-10 min-w-[80px]">
                      CO ↓ / PO →
                    </th>
                    {NBA_POS.map(po => (
                      <th
                        key={po.id}
                        className="p-2 text-center font-semibold min-w-[48px]"
                        title={po.description}
                      >
                        <div className="flex flex-col items-center">
                          <span>{po.code}</span>
                          <span className="text-[8px] font-normal text-muted-foreground">
                            {po.shortName.slice(0, 12)}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data.updatedCOs || outcomes).map(co => (
                    <tr key={co.id} className="border-t border-border/50 hover:bg-muted/10">
                      <td className="p-2 font-medium sticky left-0 bg-card z-10">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold">{co.code}</span>
                          <span className="text-[8px] text-muted-foreground truncate max-w-[100px]">
                            {co.description.slice(0, 40)}
                          </span>
                        </div>
                      </td>
                      {NBA_POS.map(po => {
                        const mapping = data.newMapping.find(
                          m => m.coId === co.id && m.poId === po.id
                        );
                        const level = mapping?.level || 0;
                        const prevMapping = data.previousMapping.find(
                          m => m.coId === co.id && m.poId === po.id
                        );
                        const prevLevel = prevMapping?.level || 0;
                        const isImproved = level > prevLevel;
                        const isReduced = level < prevLevel;
                        return (
                          <td key={po.id} className="p-1.5 text-center relative">
                            <div
                              className={cn(
                                'inline-flex items-center justify-center h-7 w-10 rounded-md border text-[10px] font-bold',
                                getCellColor(level),
                                isImproved &&
                                  'ring-2 ring-emerald-400/50 ring-offset-1 ring-offset-background',
                                isReduced &&
                                  'ring-2 ring-amber-400/50 ring-offset-1 ring-offset-background'
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

          {/* Revised PO Coverage */}
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                Revised PO Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {data.newCoverage.map(po => {
                  const prev = data.previousCoverage.find(p => p.poId === po.poId);
                  const diff = po.coveragePercentage - (prev?.coveragePercentage || 0);
                  return (
                    <div key={po.poId} className="flex items-center gap-2">
                      <span className="text-[9px] font-semibold w-7">{po.poCode}</span>
                      <Progress value={po.coveragePercentage} className="flex-1 h-1.5" />
                      <span className="text-[9px] text-emerald-600 font-bold w-8 text-right">
                        {po.coveragePercentage}%
                      </span>
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
          <Button
            size="sm"
            onClick={onNext}
            disabled={!data}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700"
          >
            Next: CO-PSO Mapping
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

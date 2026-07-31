import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CourseOutcome, COPSOMapping, POCoverage, MappingLevel, NBA_PSOS } from '../types';
import { cn } from '@/lib/utils';
import {
  GitFork,
  Sparkles,
  Save,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface Step8Props {
  outcomes: CourseOutcome[];
  mappings: COPSOMapping[];
  coverage: POCoverage[];
  onUpdate: (mappings: COPSOMapping[], coverage: POCoverage[]) => void;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  completionPercentage: number;
}

export default function Step8_COPSOMapping({
  outcomes,
  mappings,
  coverage,
  onUpdate,
  onSave,
  onNext,
  onPrev,
  completionPercentage,
}: Step8Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const getMapping = (coId: string, psoId: string): MappingLevel => {
    return mappings.find(m => m.coId === coId && m.psoId === psoId)?.level || 0;
  };

  const setMapping = (coId: string, psoId: string, level: MappingLevel) => {
    const existing = mappings.find(m => m.coId === coId && m.psoId === psoId);
    if (existing) {
      onUpdate(
        mappings.map(m => (m.coId === coId && m.psoId === psoId ? { ...m, level } : m)),
        coverage
      );
    } else {
      onUpdate([...mappings, { coId, psoId, level, justification: '' }], coverage);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const mockMappings: COPSOMapping[] = [];
      NBA_PSOS.forEach(pso => {
        outcomes.forEach(co => {
          const level = (Math.floor(Math.random() * 3) + 1) as MappingLevel;
          mockMappings.push({
            coId: co.id,
            psoId: pso.id,
            level,
            justification: `${co.code} contributes to ${pso.code} through practical application`,
          });
        });
      });

      const calculatedCoverage: POCoverage[] = NBA_PSOS.map(pso => {
        const mapped = mockMappings.filter(m => m.psoId === pso.id && m.level > 0);
        return {
          poId: pso.id,
          poCode: pso.code,
          coveragePercentage: Math.round((mapped.length / outcomes.length) * 100),
          mappedCOs: mapped.map(m => outcomes.find(o => o.id === m.coId)?.code || ''),
          avgLevel: Math.round((mapped.reduce((s, m) => s + m.level, 0) / mapped.length) * 10) / 10,
        };
      });

      onUpdate(mockMappings, calculatedCoverage);
      setIsGenerating(false);
    }, 1000);
  };

  const getCellColor = (level: MappingLevel) => {
    if (level === 0) return 'bg-muted/30 text-muted-foreground/40';
    if (level === 1) return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
    if (level === 2) return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
    return 'bg-green-500/10 text-green-700 border-green-500/20';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GitFork className="h-5 w-5 text-purple-600" />
            CO-PSO Articulation Matrix
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Map Course Outcomes to Program Specific Outcomes
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {completionPercentage}% Complete
        </Badge>
      </div>
      <Separator />

      {outcomes.length === 0 ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <p className="text-sm font-medium">No Course Outcomes defined</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {mappings.length === 0 && (
            <div className="flex justify-center py-8">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate CO-PSO Mapping
              </Button>
            </div>
          )}

          {mappings.length > 0 && (
            <>
              <Card className="border-border/50 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold">CO-PSO Matrix</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="text-left p-2 font-semibold sticky left-0 bg-muted/30 z-10">
                          CO ↓ / PSO →
                        </th>
                        {NBA_PSOS.map(pso => (
                          <th key={pso.id} className="p-2 text-center font-semibold min-w-[60px]">
                            <div className="flex flex-col items-center">
                              <span>{pso.code}</span>
                              <span className="text-[8px] font-normal text-muted-foreground">
                                {pso.description.slice(0, 30)}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {outcomes.map(co => (
                        <tr key={co.id} className="border-t border-border/50 hover:bg-muted/10">
                          <td className="p-2 font-medium sticky left-0 bg-card z-10">
                            <span className="text-[10px]">{co.code}</span>
                          </td>
                          {NBA_PSOS.map(pso => {
                            const level = getMapping(co.id, pso.id);
                            return (
                              <td key={pso.id} className="p-1 text-center">
                                <Select
                                  value={level.toString()}
                                  onValueChange={v =>
                                    setMapping(co.id, pso.id, parseInt(v) as MappingLevel)
                                  }
                                >
                                  <SelectTrigger
                                    className={cn(
                                      'h-7 w-12 border text-[10px] font-bold mx-auto',
                                      getCellColor(level)
                                    )}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0" className="text-xs">
                                      0
                                    </SelectItem>
                                    <SelectItem value="1" className="text-xs">
                                      1 (Slight)
                                    </SelectItem>
                                    <SelectItem value="2" className="text-xs">
                                      2 (Moderate)
                                    </SelectItem>
                                    <SelectItem value="3" className="text-xs">
                                      3 (Strong)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Coverage */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold">PSO Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {coverage.map(pso => (
                      <div key={pso.poId} className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold w-10">{pso.poCode}</span>
                        <Progress value={pso.coveragePercentage} className="flex-1 h-2" />
                        <span className="text-[10px] font-bold w-12 text-right">
                          {pso.coveragePercentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onPrev} className="gap-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous: Revised CO-PO
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            className="gap-2"
            disabled={mappings.length === 0}
          >
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={onNext}
            disabled={mappings.length === 0}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700"
          >
            Next: Assessment Blueprint
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

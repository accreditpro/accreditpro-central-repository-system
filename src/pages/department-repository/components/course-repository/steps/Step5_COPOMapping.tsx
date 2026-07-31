import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CourseOutcome, COPOMapping, POCoverage, MappingLevel, NBA_POS } from '../types';
import { cn } from '@/lib/utils';
import {
  GitBranch,
  Sparkles,
  Save,
  ArrowRight,
  ArrowLeft,
  Info,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface Step5Props {
  outcomes: CourseOutcome[];
  mappings: COPOMapping[];
  coverage: POCoverage[];
  onUpdate: (mappings: COPOMapping[], coverage: POCoverage[]) => void;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  completionPercentage: number;
}

export default function Step5_COPOMapping({
  outcomes,
  mappings,
  coverage,
  onUpdate,
  onSave,
  onNext,
  onPrev,
  completionPercentage,
}: Step5Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ coId: string; poId: string } | null>(null);
  const [justificationInput, setJustificationInput] = useState('');

  const getMapping = (coId: string, poId: string): MappingLevel => {
    return mappings.find(m => m.coId === coId && m.poId === poId)?.level || 0;
  };

  const getJustification = (coId: string, poId: string): string => {
    return mappings.find(m => m.coId === coId && m.poId === poId)?.justification || '';
  };

  const setMapping = (coId: string, poId: string, level: MappingLevel) => {
    const existing = mappings.find(m => m.coId === coId && m.poId === poId);
    if (existing) {
      onUpdate(
        mappings.map(m =>
          m.coId === coId && m.poId === poId ? { ...m, level, justification: m.justification } : m
        ),
        coverage
      );
    } else {
      onUpdate(
        [
          ...mappings,
          {
            coId,
            poId,
            level,
            justification: `AI-generated mapping for ${outcomes.find(o => o.id === coId)?.code} → ${NBA_POS.find(p => p.id === poId)?.code}`,
          },
        ],
        coverage
      );
    }
  };

  const handleGenerateMapping = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const mockMappings: COPOMapping[] = [];
      const pos = NBA_POS.slice(0, 8);
      outcomes.forEach(co => {
        pos.forEach((po, idx) => {
          const level = (idx < 5 ? Math.floor(Math.random() * 3) + 1 : 0) as MappingLevel;
          if (level > 0) {
            mockMappings.push({
              coId: co.id,
              poId: po.id,
              level,
              justification: `${co.code} contributes to ${po.code} through ${co.description.toLowerCase().slice(0, 50)}...`,
            });
          }
        });
      });

      const calculatedCoverage: POCoverage[] = NBA_POS.map(po => {
        const mapped = mockMappings.filter(m => m.poId === po.id && m.level > 0);
        return {
          poId: po.id,
          poCode: po.code,
          coveragePercentage:
            mapped.length > 0 ? Math.round((mapped.length / outcomes.length) * 100) : 0,
          mappedCOs: mapped.map(m => outcomes.find(o => o.id === m.coId)?.code || ''),
          avgLevel:
            mapped.length > 0
              ? Math.round((mapped.reduce((s, m) => s + m.level, 0) / mapped.length) * 10) / 10
              : 0,
        };
      });

      onUpdate(mockMappings, calculatedCoverage);
      setIsGenerating(false);
    }, 1500);
  };

  const getCellColor = (level: MappingLevel) => {
    if (level === 0) return 'bg-muted/30 text-muted-foreground/40';
    if (level === 1) return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
    if (level === 2) return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
    return 'bg-green-500/10 text-green-700 border-green-500/20';
  };

  const getCoverageColor = (pct: number) => {
    if (pct >= 60) return 'text-emerald-600';
    if (pct >= 30) return 'text-amber-600';
    return 'text-red-600';
  };

  const activePOs = NBA_POS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-indigo-600" />
            CO-PO Articulation Matrix
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Map Course Outcomes to Program Outcomes (0-3 scale) with justifications
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
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              No Course Outcomes defined
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Please define Course Outcomes in Step 4 before creating mappings
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Generate Button */}
          {mappings.length === 0 && (
            <div className="flex justify-center py-8">
              <Button
                onClick={handleGenerateMapping}
                disabled={isGenerating}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate CO-PO Mapping
              </Button>
            </div>
          )}

          {mappings.length > 0 && (
            <>
              {/* Matrix Table */}
              <Card className="border-border/50 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold">CO-PO Matrix</CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="text-left p-2 font-semibold sticky left-0 bg-muted/30 z-10 min-w-[80px]">
                          CO ↓ / PO →
                        </th>
                        {activePOs.map(po => (
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
                      {outcomes.map(co => (
                        <tr key={co.id} className="border-t border-border/50 hover:bg-muted/10">
                          <td className="p-2 font-medium sticky left-0 bg-card z-10">
                            <span className="text-[10px]">{co.code}</span>
                          </td>
                          {activePOs.map(po => {
                            const level = getMapping(co.id, po.id);
                            return (
                              <td key={po.id} className="p-1 text-center">
                                <Select
                                  value={level.toString()}
                                  onValueChange={v => {
                                    setMapping(co.id, po.id, parseInt(v) as MappingLevel);
                                    setSelectedCell({ coId: co.id, poId: po.id });
                                  }}
                                >
                                  <SelectTrigger
                                    className={cn(
                                      'h-7 w-10 border text-[10px] font-bold',
                                      getCellColor(level)
                                    )}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="min-w-[130px]">
                                    <SelectItem value="0" className="text-xs">
                                      0 — No Mapping
                                    </SelectItem>
                                    <SelectItem value="1" className="text-xs">
                                      1 — Slight (Low)
                                    </SelectItem>
                                    <SelectItem value="2" className="text-xs">
                                      2 — Moderate (Medium)
                                    </SelectItem>
                                    <SelectItem value="3" className="text-xs">
                                      3 — Strong (High)
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

              {/* Justification Dialog */}
              <Dialog
                open={!!selectedCell}
                onOpenChange={o => {
                  if (!o) {
                    setSelectedCell(null);
                    setJustificationInput('');
                  }
                }}
              >
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-sm">Mapping Justification</DialogTitle>
                  </DialogHeader>
                  {selectedCell && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-600 text-white text-[10px]">
                          {outcomes.find(o => o.id === selectedCell.coId)?.code}
                        </Badge>
                        <span className="text-xs text-muted-foreground">→</span>
                        <Badge variant="outline" className="text-[10px]">
                          {NBA_POS.find(p => p.id === selectedCell.poId)?.code}
                        </Badge>
                        <Badge
                          className={cn(
                            'text-[10px]',
                            getCellColor(getMapping(selectedCell.coId, selectedCell.poId))
                          )}
                        >
                          Level {getMapping(selectedCell.coId, selectedCell.poId)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getJustification(selectedCell.coId, selectedCell.poId) ||
                          'No justification provided.'}
                      </p>
                      <Separator />
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Edit Justification</label>
                        <textarea
                          value={justificationInput}
                          onChange={e => setJustificationInput(e.target.value)}
                          className="w-full min-h-[80px] px-3 py-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          rows={3}
                          placeholder="Explain why this CO maps to this PO..."
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => {
                            setSelectedCell(null);
                            setJustificationInput('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => {
                            if (justificationInput.trim() && selectedCell) {
                              onUpdate(
                                mappings.map(m =>
                                  m.coId === selectedCell.coId && m.poId === selectedCell.poId
                                    ? { ...m, justification: justificationInput.trim() }
                                    : m
                                ),
                                coverage
                              );
                            }
                            setSelectedCell(null);
                            setJustificationInput('');
                          }}
                          disabled={!justificationInput.trim()}
                        >
                          Save Justification
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Coverage Analysis */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold">PO Coverage Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {coverage.map(po => (
                      <div key={po.poId} className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold w-8">{po.poCode}</span>
                        <Progress value={po.coveragePercentage} className="flex-1 h-2" />
                        <span
                          className={cn(
                            'text-[10px] font-bold w-12 text-right',
                            getCoverageColor(po.coveragePercentage)
                          )}
                        >
                          {po.coveragePercentage}%
                        </span>
                        <span className="text-[9px] text-muted-foreground w-16 text-right">
                          Avg: {po.avgLevel}
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
          Previous: Course Outcomes
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
            Next: Gap Analysis
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

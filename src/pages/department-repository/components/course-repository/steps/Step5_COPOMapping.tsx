import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CourseOutcome, COPOMapping, POCoverage, MappingLevel, NBA_POS } from '../types';
import { cn } from '@/lib/utils';
import { generateCOPOMapping, COPOMappingItem, COPOMappingCourseOutcome } from '@/services/syllabus.service';
import { AILoadingScreen } from '@/components/shared/AILoadingScreen';
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
  AlertCircle,
  Target,
  Hash,
  Brain,
} from 'lucide-react';

interface Step5Props {
  outcomes: CourseOutcome[];
  mappings: COPOMapping[];
  coverage: POCoverage[];
  courseName: string;
  courseContent: string;
  onUpdate: (mappings: COPOMapping[], coverage: POCoverage[]) => void;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  completionPercentage: number;
}

/** Helper to find a CO id from its code */
function findCOId(outcomes: CourseOutcome[], code: string): string | undefined {
  return outcomes.find((o) => o.code === code)?.id;
}

export default function Step5_COPOMapping({
  outcomes, mappings, coverage, courseName, courseContent,
  onUpdate, onSave, onNext, onPrev, completionPercentage,
}: Step5Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ coId: string; poId: string } | null>(null);
  const [justificationInput, setJustificationInput] = useState('');

  const getMapping = (coId: string, poId: string): MappingLevel => {
    return mappings.find((m) => m.coId === coId && m.poId === poId)?.level || 0;
  };

  const getJustification = (coId: string, poId: string): string => {
    return mappings.find((m) => m.coId === coId && m.poId === poId)?.justification || '';
  };

  const setMapping = (coId: string, poId: string, level: MappingLevel) => {
    const existing = mappings.find((m) => m.coId === coId && m.poId === poId);
    if (existing) {
      onUpdate(
        mappings.map((m) => (m.coId === coId && m.poId === poId ? { ...m, level, justification: m.justification } : m)),
        coverage
      );
    } else {
      onUpdate(
        [...mappings, { coId, poId, level, justification: `Mapped ${outcomes.find(o => o.id === coId)?.code} → ${NBA_POS.find(p => p.id === poId)?.code}` }],
        coverage
      );
    }
  };

  /** Helper: convert Roman numeral number to Roman string */
  const toRoman = (n: number): string => {
    const map: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII' };
    return map[n] || String(n);
  };

  /** Build COPOMappingCourseOutcome[] from the CourseOutcome[] for the API */
  const buildCourseOutcomesForAPI = (): COPOMappingCourseOutcome[] => {
    return outcomes.map((co) => {
      // Construct mapped_units as display strings (e.g., "Unit I", "Unit II")
      const mappedUnits: string[] = co.mappedUnits && co.mappedUnits.length > 0
        ? co.mappedUnits.map((u) => `Unit ${toRoman(u)}`)
        : co.unit
          ? [co.unit]
          : [];

      // Build blooms_taxonomy_level like "Apply (L3)"
      const bloomsTaxonomyLevel = co.bloomsLevelCode
        ? `${co.bloomsLevel} (${co.bloomsLevelCode})`
        : co.bloomsLevel;

      // mapped_topics is derived from the CourseOutcome's mappedTopics (populated in Step4 from extracted unit topics)
      const mappedTopics: string[] = co.mappedTopics || [];

      return {
        co_code: co.code,
        course_outcome_description: co.description,
        blooms_taxonomy_level: bloomsTaxonomyLevel,
        mapped_units: mappedUnits,
        mapped_topics: mappedTopics,
      };
    });
  };

  /** Call the /generate-co-po API to map COs to POs */
  const handleGenerateMapping = async () => {
    if (!courseContent || !courseName) {
      setGenerateError('Course content is missing. Please complete Step 3 (AI Course Analysis) first.');
      return;
    }
    if (outcomes.length === 0) {
      setGenerateError('No Course Outcomes defined. Please complete Step 4 first.');
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const courseOutcomesForAPI = buildCourseOutcomesForAPI();
      const response = await generateCOPOMapping(courseName, courseContent, courseOutcomesForAPI);
      const matrix = response.data.co_po_mapping.matrix;
      const poSummary = response.data.co_po_mapping.po_summary;
      const overall = response.data.co_po_mapping.overall_summary;

      if (!matrix || matrix.length === 0) {
        setGenerateError('AI returned no CO-PO mappings. Please try again.');
        setIsGenerating(false);
        return;
      }

      // Map API response to COPOMapping[] using actual outcome IDs
      const newMappings: COPOMapping[] = [];
      matrix.forEach((item: COPOMappingItem) => {
        const coId = findCOId(outcomes, item.co_code);
        if (!coId) return; // skip if CO not found
        item.po_mappings.forEach((pm) => {
          const po = NBA_POS.find((p) => p.code === pm.po_code);
          if (!po) return;
          if (pm.level > 0) {
            newMappings.push({
              coId,
              poId: po.id,
              level: pm.level as MappingLevel,
              justification: `${item.co_code} contributes to ${pm.po_code} (Level ${pm.level}) — AI-generated mapping`,
            });
          }
        });
      });

      // Build POCoverage[] from the API's po_summary
      const newCoverage: POCoverage[] = NBA_POS.map((po) => {
        const summary = poSummary.find((s) => s.po_code === po.code);
        const mapped = newMappings.filter((m) => m.poId === po.id && m.level > 0);
        return {
          poId: po.id,
          poCode: po.code,
          coveragePercentage: summary ? summary.coverage_percentage : 0,
          mappedCOs: mapped.map((m) => outcomes.find((o) => o.id === m.coId)?.code || ''),
          avgLevel: summary ? summary.average : 0,
        };
      });

      onUpdate(newMappings, newCoverage);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate CO-PO mapping';
      setGenerateError(message);
    } finally {
      setIsGenerating(false);
    }
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

  // Count mapped POs from the matrix
  const mappedPOCount = coverage.filter((c) => c.coveragePercentage > 0).length;
  const overallAvg = mappings.length > 0
    ? (mappings.reduce((s, m) => s + m.level, 0) / mappings.length).toFixed(2)
    : '0.00';

  // ============ AI Loading Screen ============
  if (isGenerating) {
    return (
      <div className="flex items-center justify-center py-12">
        <AILoadingScreen
          workflow="co-po-mapping"
          isProcessing={true}
          title="CO-PO Articulation Mapping"
          subtitle="AI is mapping Course Outcomes to Program Outcomes using the articulation matrix"
          onCancel={() => { setIsGenerating(false); setGenerateError(null); }}
        />
      </div>
    );
  }

  if (generateError) {
    return (
      <div className="flex items-center justify-center py-12">
        <AILoadingScreen
          workflow="co-po-mapping"
          isProcessing={false}
          error={generateError}
          onRetry={handleGenerateMapping}
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
            <GitBranch className="h-5 w-5 text-indigo-600" />
            CO-PO Articulation Matrix
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Map Course Outcomes to Program Outcomes (0–3 scale) — AI-generated, then review &amp; edit
          </p>
        </div>
        <div className="flex items-center gap-2">
          {mappings.length > 0 && (
            <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/30 text-[9px] gap-1">
              <Hash className="h-3 w-3" />
              {mappedPOCount}/{activePOs.length} POs mapped
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">{completionPercentage}% Complete</Badge>
        </div>
      </div>
      <Separator />

      {outcomes.length === 0 ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">No Course Outcomes defined</p>
            <p className="text-xs text-muted-foreground mt-1">Please define Course Outcomes in Step 4 before creating mappings</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Generate Card — shown when no mappings exist yet */}
          {mappings.length === 0 && (
            <Card className="border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <GitBranch className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Generate CO-PO Mapping with AI</p>
                      <p className="text-xs text-muted-foreground">
                        The AI will analyze your COs and course content to suggest mapping levels (0–3)
                        between each Course Outcome and Program Outcome
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleGenerateMapping}
                    disabled={isGenerating}
                    className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
                  >
                    {isGenerating ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Mapping...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Generate Mapping</>
                    )}
                  </Button>
                </div>

                {generateError && (
                  <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-red-600">{generateError}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {mappings.length > 0 && (
            <>
              {/* Overall Summary Bar */}
              <Card className="border-border/50 bg-gradient-to-r from-indigo-500/[0.03] to-purple-500/[0.03]">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-indigo-600" />
                        <span className="text-xs font-semibold">{outcomes.length} COs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-semibold">{mappedPOCount}/{activePOs.length} POs mapped</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-semibold">Avg Level: {overallAvg}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateMapping}
                      disabled={isGenerating}
                      className="gap-1.5 text-xs h-7"
                    >
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

              {/* Matrix Table */}
              <Card className="border-border/50 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold flex items-center gap-2">
                    <GitBranch className="h-3.5 w-3.5 text-indigo-600" />
                    CO-PO Articulation Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="text-left p-2 font-semibold sticky left-0 bg-muted/30 z-10 min-w-[80px]">
                          CO ↓ / PO →
                        </th>
                        {activePOs.map((po) => (
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
                      {outcomes.map((co) => (
                        <tr key={co.id} className="border-t border-border/50 hover:bg-muted/50">
                          <td className="p-2 font-medium sticky left-0 bg-card z-10">
                            <span className="text-[10px]">{co.code}</span>
                          </td>
                          {activePOs.map((po) => {
                            const level = getMapping(co.id, po.id);
                            return (
                              <td key={po.id} className="p-1 text-center">
                                <Select
                                  value={level.toString()}
                                  onValueChange={(v) => {
                                    setMapping(co.id, po.id, parseInt(v) as MappingLevel);
                                    setSelectedCell({ coId: co.id, poId: po.id });
                                  }}
                                >
                                  <SelectTrigger className={cn('h-7 w-10 border text-[10px] font-bold', getCellColor(level))}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="min-w-[130px]">
                                    <SelectItem value="0" className="text-xs">0 — No Mapping</SelectItem>
                                    <SelectItem value="1" className="text-xs">1 — Slight (Low)</SelectItem>
                                    <SelectItem value="2" className="text-xs">2 — Moderate (Medium)</SelectItem>
                                    <SelectItem value="3" className="text-xs">3 — Strong (High)</SelectItem>
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
              <Dialog open={!!selectedCell} onOpenChange={(o) => { if (!o) { setSelectedCell(null); setJustificationInput(''); } }}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-sm">Mapping Justification</DialogTitle>
                  </DialogHeader>
                  {selectedCell && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-600 text-white text-[10px]">
                          {outcomes.find((o) => o.id === selectedCell.coId)?.code}
                        </Badge>
                        <span className="text-xs text-muted-foreground">→</span>
                        <Badge variant="outline" className="text-[10px]">
                          {NBA_POS.find((p) => p.id === selectedCell.poId)?.code}
                        </Badge>
                        <Badge className={cn('text-[10px]', getCellColor(getMapping(selectedCell.coId, selectedCell.poId)))}>
                          Level {getMapping(selectedCell.coId, selectedCell.poId)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getJustification(selectedCell.coId, selectedCell.poId) || 'No justification provided.'}
                      </p>
                      <Separator />
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Edit Justification</label>
                        <textarea
                          value={justificationInput}
                          onChange={(e) => setJustificationInput(e.target.value)}
                          className="w-full min-h-[80px] px-3 py-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          rows={3}
                          placeholder="Explain why this CO maps to this PO..."
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => { setSelectedCell(null); setJustificationInput(''); }}>
                          Cancel
                        </Button>
                        <Button size="sm" className="text-xs h-8" onClick={() => {
                          if (justificationInput.trim() && selectedCell) {
                            onUpdate(
                              mappings.map((m) =>
                                m.coId === selectedCell.coId && m.poId === selectedCell.poId
                                  ? { ...m, justification: justificationInput.trim() }
                                  : m
                              ),
                              coverage
                            );
                          }
                          setSelectedCell(null);
                          setJustificationInput('');
                        }} disabled={!justificationInput.trim()}>
                          Save Justification
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* PO Coverage Analysis */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold">PO Coverage Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {coverage.map((po) => (
                      <div key={po.poId} className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold w-8">{po.poCode}</span>
                        <Progress value={po.coveragePercentage} className="flex-1 h-2" />
                        <span className={cn('text-[10px] font-bold w-12 text-right', getCoverageColor(po.coveragePercentage))}>
                          {po.coveragePercentage}%
                        </span>
                        <span className="text-[9px] text-muted-foreground w-16 text-right">
                          Avg: {po.avgLevel.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Regenerate button at bottom for convenience */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateMapping}
                  disabled={isGenerating}
                  className="gap-2 text-xs h-8 text-indigo-600 border-indigo-500/30 hover:bg-indigo-500/5"
                >
                  {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  Regenerate from AI
                </Button>
              </div>
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
          <Button variant="outline" size="sm" onClick={onSave} className="gap-2" disabled={mappings.length === 0}>
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button size="sm" onClick={onNext} disabled={mappings.length === 0} className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700">
            Next: Gap Analysis
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

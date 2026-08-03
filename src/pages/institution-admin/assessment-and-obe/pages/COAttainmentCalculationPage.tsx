import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Plus,
  Save,
  CheckCircle2,
  Settings2,
  Calendar,
  GraduationCap,
  Trash2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { OBEConfiguration, AcademicYear, YearLevel } from '../types';
import { REGULATION_OPTIONS, SCHEME_OPTIONS } from '../mock-data';
import { AssessmentSchemePanel } from '../components/AssessmentSchemePanel';

interface Props {
  config: OBEConfiguration;
  onUpdate: (config: OBEConfiguration) => void;
}

// ─── Course type icons (for table) ─────────────────────────
const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  active: { color: 'text-emerald-600', label: 'Active' },
  upcoming: { color: 'text-amber-600', label: 'Upcoming' },
  completed: { color: 'text-muted-foreground', label: 'Completed' },
};

export const COAttainmentCalculationPage = ({ config, onUpdate }: Props) => {
  const [localYears, setLocalYears] = useState<AcademicYear[]>(
    () => config.academicYears.map((ay) => deepCloneYear(ay))
  );
  const [expandedYearId, setExpandedYearId] = useState<string | null>(null);
  const [expandedYearLevelId, setExpandedYearLevelId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // ─── Year Management ─────────────────────────────────────
  const addAcademicYear = useCallback(() => {
    const nextNum = localYears.length + 1;
    const startYear = 2025 + nextNum - 1;
    const endYear = startYear + 1;
    const label = `${startYear}-${endYear}`;
    const displayLabel = `${startYear}-${endYear + 1}`;

    const ts = Date.now();
    const newYear: AcademicYear = {
      id: `ay-${ts}`,
      label,
      displayLabel,
      status: 'upcoming',
      yearLevels: [
        { id: `yl-${ts}-1`, yearLabel: 'First Year', admissionBatch: '', regulation: '', assessmentSchemeId: '', schemes: [] },
        { id: `yl-${ts}-2`, yearLabel: 'Second Year', admissionBatch: '', regulation: '', assessmentSchemeId: '', schemes: [] },
        { id: `yl-${ts}-3`, yearLabel: 'Third Year', admissionBatch: '', regulation: '', assessmentSchemeId: '', schemes: [] },
        { id: `yl-${ts}-4`, yearLabel: 'Fourth Year', admissionBatch: '', regulation: '', assessmentSchemeId: '', schemes: [] },
      ],
    };

    setLocalYears((prev) => [...prev, newYear]);
    setHasChanges(true);
    setIsSaved(false);
  }, [localYears.length]);

  const removeAcademicYear = useCallback((yearId: string) => {
    setLocalYears((prev) => prev.filter((y) => y.id !== yearId));
    setHasChanges(true);
    if (expandedYearId === yearId) {
      setExpandedYearId(null);
      setExpandedYearLevelId(null);
    }
  }, [expandedYearId]);

  // ─── Year Level Updates ──────────────────────────────────
  const updateYearLevel = useCallback(
    (yearIndex: number, levelIndex: number, updates: Partial<YearLevel>) => {
      setLocalYears((prev) => {
        const next = [...prev];
        const levels = [...next[yearIndex].yearLevels];
        levels[levelIndex] = { ...levels[levelIndex], ...updates };
        next[yearIndex] = { ...next[yearIndex], yearLevels: levels };
        return next;
      });
      setHasChanges(true);
      setIsSaved(false);
    },
    []
  );

  // ─── Save Scheme Panel Changes ───────────────────────────
  const handleSchemeSave = useCallback(
    (yearIndex: number, levelIndex: number, schemes: any[]) => {
      setLocalYears((prev) => {
        const next = [...prev];
        const levels = [...next[yearIndex].yearLevels];
        levels[levelIndex] = { ...levels[levelIndex], schemes };
        next[yearIndex] = { ...next[yearIndex], yearLevels: levels };
        return next;
      });
      setHasChanges(true);
      setIsSaved(false);
    },
    []
  );

  // ─── Save All ────────────────────────────────────────────
  const handleSaveAll = useCallback(() => {
    // Validate
    let hasError = false;
    localYears.forEach((year) => {
      year.yearLevels.forEach((yl) => {
        if (!yl.admissionBatch || !yl.regulation || !yl.assessmentSchemeId) {
          hasError = true;
        }
      });
    });

    if (hasError) {
      toast.error('Some year levels are incomplete', {
        description: 'Please fill in Admission Batch, Regulation, and Assessment Scheme for all rows.',
      });
      return;
    }

    onUpdate({ ...config, academicYears: localYears });
    setHasChanges(false);
    setIsSaved(true);
    toast.success('Academic year configuration saved');
    setTimeout(() => setIsSaved(false), 3000);
  }, [config, localYears, onUpdate]);

  // ─── Toggle expand ───────────────────────────────────────
  const toggleExpand = (yearId: string, yearLevelId: string) => {
    if (expandedYearId === yearId && expandedYearLevelId === yearLevelId) {
      setExpandedYearId(null);
      setExpandedYearLevelId(null);
    } else {
      setExpandedYearId(yearId);
      setExpandedYearLevelId(yearLevelId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Academic Year & Assessment Scheme Configuration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Map academic years to student batches, regulations, and assessment schemes.
            Configure CO attainment calculation per course type.
          </p>
        </div>
        <Button onClick={addAcademicYear} className="gap-1.5 h-9 text-xs shrink-0">
          <Plus className="h-4 w-4" />
          New Academic Year
        </Button>
      </div>

      {/* Academic Year Cards */}
      <div className="space-y-4">
        {localYears.map((year, yearIdx) => (
          <Card key={year.id} className={cn('border-border/50 overflow-hidden')}>
            {/* Year Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/10 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold">{year.displayLabel}</h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[9px] px-1.5 py-0 h-4',
                        year.status === 'active'
                          ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/5'
                          : year.status === 'upcoming'
                          ? 'border-amber-500/30 text-amber-600 bg-amber-500/5'
                          : 'border-muted-foreground/30 text-muted-foreground'
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full mr-1', STATUS_CONFIG[year.status]?.color)} />
                      {STATUS_CONFIG[year.status]?.label}
                    </Badge>
                  </div>
                  <p className="text-[9px] text-muted-foreground">
                    {year.yearLevels.length} year levels · Click Configure to set assessment schemes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-red-500"
                  onClick={() => removeAcademicYear(year.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Year Levels Table */}
            <div className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10">
                    <TableHead className="text-[10px] font-semibold h-8 w-28">Year</TableHead>
                    <TableHead className="text-[10px] font-semibold h-8">Admission Batch</TableHead>
                    <TableHead className="text-[10px] font-semibold h-8 w-28">Regulation</TableHead>
                    <TableHead className="text-[10px] font-semibold h-8">Assessment Scheme</TableHead>
                    <TableHead className="text-[10px] font-semibold h-8 w-24 text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {year.yearLevels.map((yl, levelIdx) => {
                    const isExpanded = expandedYearId === year.id && expandedYearLevelId === yl.id;
                    return (
                      <TableRow key={yl.id} className={cn(isExpanded && 'bg-primary/[0.02]')}>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs font-medium">{yl.yearLabel}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <Input
                            value={yl.admissionBatch}
                            onChange={(e) => updateYearLevel(yearIdx, levelIdx, { admissionBatch: e.target.value })}
                            placeholder="e.g. 2025-2029"
                            className="h-7 text-xs max-w-[140px]"
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <Select
                            value={yl.regulation}
                            onValueChange={(v) => updateYearLevel(yearIdx, levelIdx, { regulation: v })}
                          >
                            <SelectTrigger className="h-7 text-xs max-w-[90px]">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {REGULATION_OPTIONS.map((r) => (
                                <SelectItem key={r} value={r} className="text-xs">
                                  {r}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-2">
                          <Select
                            value={yl.assessmentSchemeId}
                            onValueChange={(v) => updateYearLevel(yearIdx, levelIdx, { assessmentSchemeId: v })}
                          >
                            <SelectTrigger className="h-7 text-xs max-w-[190px]">
                              <SelectValue placeholder="Select scheme" />
                            </SelectTrigger>
                            <SelectContent>
                              {SCHEME_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          <Button
                            variant={isExpanded ? 'default' : 'outline'}
                            size="sm"
                            className={cn(
                              'h-7 text-[10px] gap-1',
                              isExpanded && 'bg-primary text-primary-foreground'
                            )}
                            onClick={() => toggleExpand(year.id, yl.id)}
                          >
                            <Settings2 className="h-3 w-3" />
                            {isExpanded ? 'Close' : 'Configure'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Expanded Configure Panel */}
            <AnimatePresence>
              {expandedYearId === year.id && (() => {
                const yl = year.yearLevels.find((l) => l.id === expandedYearLevelId);
                if (!yl) return null;
                const levelIdx = year.yearLevels.findIndex((l) => l.id === expandedYearLevelId);
                return (
                  <AssessmentSchemePanel
                    key={`${yl.id}-${yl.schemes.length}`}
                    yearLabel={year.displayLabel}
                    yearLevelLabel={yl.yearLabel}
                    assessmentSchemeLabel={yl.assessmentSchemeId || undefined}
                    schemes={yl.schemes.length > 0 ? yl.schemes : []}
                    onSave={(schemes) => handleSchemeSave(yearIdx, levelIdx, schemes)}
                    onClose={() => { setExpandedYearId(null); setExpandedYearLevelId(null); }}
                  />
                );
              })()}
            </AnimatePresence>
          </Card>
        ))}
      </div>

      {/* ─── Save Bar ─── */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/50 -mx-4 md:-mx-6 px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-5 gap-1 border-muted-foreground/20">
              <Calendar className="h-2.5 w-2.5" />
              {localYears.length} Academic Year{localYears.length > 1 ? 's' : ''}
            </Badge>
            {isSaved && (
              <Badge className="text-[9px] px-2 py-0 h-5 gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3" />
                Saved
              </Badge>
            )}
            {!hasChanges && !isSaved && (
              <span className="text-[9px] text-muted-foreground">No unsaved changes</span>
            )}
          </div>
          <Button
            onClick={handleSaveAll}
            disabled={!hasChanges}
            className="gap-2 h-9 text-xs"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Deep clone helper ─────────────────────────────────────
function deepCloneYear(year: AcademicYear): AcademicYear {
  return {
    ...year,
    yearLevels: year.yearLevels.map((yl) => ({
      ...yl,
      schemes: yl.schemes.map((s) => ({
        ...s,
        cieComponents: s.cieComponents?.map((c) => ({ ...c })) ?? [],
        seeComponents: s.seeComponents?.map((c) => ({ ...c })) ?? [],
        coAttainment: s.coAttainment
          ? {
              ...s.coAttainment,
              attainmentLevels: s.coAttainment.attainmentLevels?.map((l) => ({ ...l })) ?? [],
              finalCOFormula: { ...s.coAttainment.finalCOFormula },
            }
          : undefined,
      })),
    })),
  };
}

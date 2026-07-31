import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Beaker,
  FolderKanban,
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  Wrench,
  Blocks,
  BookMarked,
  ClipboardCheck,
  Save,
  Plus,
  Trash2,
  Settings2,
  Target,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  COURSE_TYPES,
  AssessmentSchemeConfig,
  COAttainmentScheme,
  CIEComponent,
  DEFAULT_ATTAINMENT_LEVELS,
} from '../types';

// ─── Course Type Icons ─────────────────────────────────────
const COURSE_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Theory: BookOpen,
  Laboratory: Beaker,
  'Mini Project': FolderKanban,
  'Major Project': LayoutDashboard,
  Seminar: GraduationCap,
  Internship: Briefcase,
  'Skill Course': Wrench,
  'Project Based Course': Blocks,
  'Open Elective': BookMarked,
  'Mandatory Course': ClipboardCheck,
};

// ─── Internal Calculation Methods ──────────────────────────
const INTERNAL_CALC_METHODS = [
  { value: 'average-cie-i-ii', label: 'Average of CIE-I & CIE-II' },
  { value: 'best-of-cie-i-ii', label: 'Best of CIE-I & CIE-II' },
  { value: 'average-best-two', label: 'Average of Best Two' },
  { value: 'custom-formula', label: 'Custom Formula' },
];

const CO_ATTAINMENT_CALC_METHODS = [
  { value: 'average-cie-i-ii', label: 'Average (CIE-I, CIE-II)' },
  { value: 'best-of-cie-i-ii', label: 'Best of CIE-I & CIE-II' },
  { value: 'average-best-two', label: 'Average of Best Two' },
  { value: 'custom-formula', label: 'Custom Formula' },
];

// ─── Props ─────────────────────────────────────────────────
interface Props {
  yearLabel: string;
  yearLevelLabel: string;
  assessmentSchemeLabel?: string;
  schemes: AssessmentSchemeConfig[];
  onSave: (schemes: AssessmentSchemeConfig[]) => void;
  onClose: () => void;
}// ─── Initialize default schemes ────────────────────────────
function createDefaultSchemes(): AssessmentSchemeConfig[] {
  return COURSE_TYPES.map((ct) => {
    const isTheory = ct === 'Theory';
    const isLab = ct === 'Laboratory';

    return {
      courseType: ct as any,
      cieWeightage: isLab ? 30 : isTheory ? 30 : 100,
      seeWeightage: isLab ? 70 : isTheory ? 70 : 0,
      maxMarks: 100,
      passingMarks: 40,
      internalCalcMethod: 'average-cie-i-ii',
      cieComponents: [
        { id: `${ct}-cie-1`, name: 'CIE-I', maxMarks: 30, include: true },
        { id: `${ct}-cie-2`, name: 'CIE-II', maxMarks: 30, include: true },
        { id: `${ct}-cie-3`, name: 'Assignment', maxMarks: 10, include: true },
      ],
      seeComponents: [],
      coAttainment: {
        internalCalcMethod: 'average-cie-i-ii',
        targetThreshold: 60,
        attainmentLevels: DEFAULT_ATTAINMENT_LEVELS.map((l) => ({ ...l })),
        finalCOFormula: {
          internalWeightage: isLab ? 30 : isTheory ? 30 : 100,
          seeWeightage: isLab ? 70 : isTheory ? 70 : 0,
        },
      },
    };
  });
}

// ─── Component ─────────────────────────────────────────────
export const AssessmentSchemePanel = ({ yearLabel, yearLevelLabel, assessmentSchemeLabel, schemes, onSave, onClose }: Props) => {
  const [localSchemes, setLocalSchemes] = useState<AssessmentSchemeConfig[]>(
    () => schemes.length > 0 ? schemes.map((s) => deepCloneScheme(s)) : []
  );
  const [needsInit, setNeedsInit] = useState(schemes.length === 0);
  const [selectedCourseType, setSelectedCourseType] = useState<string>(COURSE_TYPES[0]);
  const [activeTab, setActiveTab] = useState<'scheme' | 'co-attainment'>('scheme');
  const [saved, setSaved] = useState(false);

  const activeScheme = localSchemes.find((s) => s.courseType === selectedCourseType) ?? localSchemes[0];
  const activeIndex = localSchemes.findIndex((s) => s.courseType === selectedCourseType);

  const updateScheme = useCallback(
    (updates: Partial<AssessmentSchemeConfig>) => {
      setLocalSchemes((prev) => {
        const next = [...prev];
        if (activeIndex >= 0) {
          next[activeIndex] = { ...next[activeIndex], ...updates };
        }
        return next;
      });
      setSaved(false);
    },
    [activeIndex]
  );

  const updateCOAttainment = useCallback(
    (updates: Partial<COAttainmentScheme>) => {
      if (activeIndex < 0) return;
      setLocalSchemes((prev) => {
        const next = [...prev];
        next[activeIndex] = {
          ...next[activeIndex],
          coAttainment: { ...next[activeIndex].coAttainment, ...updates },
        };
        return next;
      });
      setSaved(false);
    },
    [activeIndex]
  );

  const updateCIEComponent = (compId: string, updates: Partial<CIEComponent>) => {
    updateScheme({
      cieComponents: activeScheme.cieComponents.map((c) =>
        c.id === compId ? { ...c, ...updates } : c
      ),
    });
  };

  const initializeSchemes = () => {
    const defaults = createDefaultSchemes();
    setLocalSchemes(defaults.map((s) => deepCloneScheme(s)));
    setNeedsInit(false);
    setSaved(false);
  };

  const handleSave = () => {
    onSave(localSchemes);
    setSaved(true);
    toast.success(`Assessment scheme saved for ${yearLevelLabel}`);
    setTimeout(() => setSaved(false), 2000);
  };

  // ─── Render Scheme Tab ───────────────────────────────────
  const renderSchemeTab = () => {
    if (!activeScheme) return null;
    const s = activeScheme;

    return (
      <div className="space-y-5">
        {/* Overall Weightage */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <h4 className="text-xs font-semibold mb-3">Overall Weightage</h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="text-[10px] text-muted-foreground">CIE Weightage (%)</Label>
                <Input
                  type="number"
                  value={s.cieWeightage}
                  onChange={(e) => updateScheme({ cieWeightage: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                  className="h-8 text-xs mt-1"
                  min={0}
                  max={100}
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">SEE Weightage (%)</Label>
                <Input
                  type="number"
                  value={s.seeWeightage}
                  onChange={(e) => updateScheme({ seeWeightage: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                  className="h-8 text-xs mt-1"
                  min={0}
                  max={100}
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Maximum Marks</Label>
                <Input
                  type="number"
                  value={s.maxMarks}
                  onChange={(e) => updateScheme({ maxMarks: parseInt(e.target.value) || 0 })}
                  className="h-8 text-xs mt-1"
                  min={0}
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Passing Marks</Label>
                <Input
                  type="number"
                  value={s.passingMarks}
                  onChange={(e) => updateScheme({ passingMarks: parseInt(e.target.value) || 0 })}
                  className="h-8 text-xs mt-1"
                  min={0}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Internal Assessment Calculation */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <h4 className="text-xs font-semibold mb-3">Internal Assessment Calculation</h4>
            <div className="space-y-2">
              {INTERNAL_CALC_METHODS.map((method) => {
                const isSelected = s.internalCalcMethod === method.value;
                return (
                  <label
                    key={method.value}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors',
                      isSelected
                        ? 'border-primary/40 bg-primary/[0.03]'
                        : 'border-border/50 hover:bg-muted/50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                        isSelected ? 'border-primary' : 'border-muted-foreground/30'
                      )}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <span className="text-xs">{method.label}</span>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* CIE Components */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <h4 className="text-xs font-semibold mb-3">CIE Components</h4>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="text-[10px] font-semibold h-7">Component</TableHead>
                    <TableHead className="text-[10px] font-semibold h-7 w-28">Max Marks</TableHead>
                    <TableHead className="text-[10px] font-semibold h-7 w-20 text-center">Include</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {s.cieComponents.map((comp) => (
                    <TableRow key={comp.id} className="group">
                      <TableCell className="py-1.5">
                        <span className="text-xs">{comp.name}</span>
                      </TableCell>
                      <TableCell className="py-1.5">
                        <Input
                          type="number"
                          value={comp.maxMarks}
                          onChange={(e) =>
                            updateCIEComponent(comp.id, { maxMarks: parseInt(e.target.value) || 0 })
                          }
                          className="h-7 text-xs w-20"
                          min={0}
                        />
                      </TableCell>
                      <TableCell className="py-1.5 text-center">
                        <Switch
                          checked={comp.include}
                          onCheckedChange={(checked) => updateCIEComponent(comp.id, { include: checked })}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* SEE Components */}
        {s.seeComponents.length > 0 && (
          <Card className="border-border/50">
            <CardContent className="p-4">
              <h4 className="text-xs font-semibold mb-3">Semester End Examination</h4>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="text-[10px] font-semibold h-7">Component</TableHead>
                      <TableHead className="text-[10px] font-semibold h-7 w-28">Max Marks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {s.seeComponents.map((comp) => (
                      <TableRow key={comp.id}>
                        <TableCell className="py-1.5">
                          <span className="text-xs">{comp.name}</span>
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Input
                            type="number"
                            value={comp.maxMarks}
                            onChange={(e) =>
                              updateScheme({
                                seeComponents: s.seeComponents.map((sc) =>
                                  sc.id === comp.id
                                    ? { ...sc, maxMarks: parseInt(e.target.value) || 0 }
                                    : sc
                                ),
                              })
                            }
                            className="h-7 text-xs w-20"
                            min={0}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // ─── Render CO Attainment Tab ────────────────────────────
  const renderCOAttainmentTab = () => {
    if (!activeScheme) return null;
    const ca = activeScheme.coAttainment;

    // Attainment level management
    const handleLevelChange = (levelId: string, field: 'minPercentage' | 'label', value: string) => {
      const num = parseInt(value) || 0;
      updateCOAttainment({
        attainmentLevels: ca.attainmentLevels.map((l) =>
          l.id === levelId
            ? { ...l, [field]: field === 'minPercentage' ? Math.max(0, Math.min(100, num)) : value }
            : l
        ),
      });
    };

    const addLevel = () => {
      const lowest = ca.attainmentLevels.reduce((min, l) => Math.min(min, l.minPercentage), 100);
      const newId = `al-${Date.now()}`;
      const newLevel = Math.max(...ca.attainmentLevels.map((l) => l.level)) + 1;
      updateCOAttainment({
        attainmentLevels: [
          ...ca.attainmentLevels,
          { id: newId, level: newLevel, minPercentage: Math.max(0, lowest - 10), label: `Level ${newLevel}` },
        ],
      });
    };

    const removeLevel = (levelId: string) => {
      if (ca.attainmentLevels.length <= 1) return;
      updateCOAttainment({
        attainmentLevels: ca.attainmentLevels.filter((l) => l.id !== levelId),
      });
    };

    return (
      <div className="space-y-5">
        {/* Internal Assessment Calculation */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <h4 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
              Internal Assessment Calculation
            </h4>
            <div className="space-y-2">
              {CO_ATTAINMENT_CALC_METHODS.map((method) => {
                const isSelected = ca.internalCalcMethod === method.value;
                return (
                  <label
                    key={method.value}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors',
                      isSelected
                        ? 'border-primary/40 bg-primary/[0.03]'
                        : 'border-border/50 hover:bg-muted/50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                        isSelected ? 'border-primary' : 'border-muted-foreground/30'
                      )}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <span className="text-xs">{method.label}</span>
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Target Threshold */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                  Target Threshold (%)
                </Label>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  The minimum percentage students must achieve for the CO to be considered attained
                </p>
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  value={ca.targetThreshold}
                  onChange={(e) =>
                    updateCOAttainment({ targetThreshold: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })
                  }
                  className="h-9 text-sm text-center font-semibold"
                  min={0}
                  max={100}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attainment Levels */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                Attainment Levels
              </h4>
              <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={addLevel}>
                <Plus className="h-3 w-3" />
                Add Level
              </Button>
            </div>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="text-[10px] font-semibold h-7 w-16">Level</TableHead>
                    <TableHead className="text-[10px] font-semibold h-7">Label</TableHead>
                    <TableHead className="text-[10px] font-semibold h-7 w-28">Min %</TableHead>
                    <TableHead className="text-[10px] font-semibold h-7 w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...ca.attainmentLevels]
                    .sort((a, b) => b.minPercentage - a.minPercentage)
                    .map((level) => (
                      <TableRow key={level.id} className="group">
                        <TableCell className="py-1">
                          <span className="text-xs font-mono font-medium">L{level.level}</span>
                        </TableCell>
                        <TableCell className="py-1">
                          <Input
                            value={level.label || ''}
                            onChange={(e) => handleLevelChange(level.id, 'label', e.target.value)}
                            className="h-7 text-xs"
                            placeholder="Label"
                          />
                        </TableCell>
                        <TableCell className="py-1">
                          <Input
                            type="number"
                            value={level.minPercentage}
                            onChange={(e) => handleLevelChange(level.id, 'minPercentage', e.target.value)}
                            className="h-7 text-xs"
                            min={0}
                            max={100}
                          />
                        </TableCell>
                        <TableCell className="py-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100"
                            onClick={() => removeLevel(level.id)}
                            disabled={ca.attainmentLevels.length <= 1}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Final CO Formula */}
        <Card className="border-border/50 bg-gradient-to-r from-primary/[0.02] to-transparent">
          <CardContent className="p-4">
            <h4 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5 text-primary" />
              Final CO Formula
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-[10px] text-muted-foreground">Internal Attainment (%)</Label>
                <Input
                  type="number"
                  value={ca.finalCOFormula.internalWeightage}
                  onChange={(e) =>
                    updateCOAttainment({
                      finalCOFormula: {
                        ...ca.finalCOFormula,
                        internalWeightage: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                      },
                    })
                  }
                  className="h-8 text-xs mt-1 text-center font-semibold"
                  min={0}
                  max={100}
                />
              </div>
              <div className="pt-5 text-lg font-bold text-muted-foreground">+</div>
              <div className="flex-1">
                <Label className="text-[10px] text-muted-foreground">SEE Attainment (%)</Label>
                <Input
                  type="number"
                  value={ca.finalCOFormula.seeWeightage}
                  onChange={(e) =>
                    updateCOAttainment({
                      finalCOFormula: {
                        ...ca.finalCOFormula,
                        seeWeightage: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                      },
                    })
                  }
                  className="h-8 text-xs mt-1 text-center font-semibold"
                  min={0}
                  max={100}
                />
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground mt-2 text-center">
              Final CO Attainment = (Internal Attainment × {ca.finalCOFormula.internalWeightage}%) + (SEE Attainment × {ca.finalCOFormula.seeWeightage}%)
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="border border-primary/20 rounded-xl bg-gradient-to-b from-primary/[0.02] to-background mt-2">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-xs font-semibold">
              {assessmentSchemeLabel ? `${assessmentSchemeLabel} · ` : ''}{yearLabel} - {yearLevelLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <Badge className="text-[9px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Saved
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="flex h-[500px]">
          {/* Course Type Navigation */}
          <div className="w-44 shrink-0 border-r border-border/50 overflow-y-auto p-2 space-y-0.5">
            {COURSE_TYPES.map((ct) => {
              const Icon = COURSE_TYPE_ICONS[ct] || BookOpen;
              const isSelected = selectedCourseType === ct;
              return (
                <button
                  key={ct}
                  onClick={() => setSelectedCourseType(ct)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all text-xs',
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{ct}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {needsInit ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Settings2 className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">No Schemes Configured</h3>
                <p className="text-[10px] text-muted-foreground max-w-[280px] mb-5">
                  This year level has no assessment schemes yet. Initialize with default values to get started.
                </p>
                <Button onClick={initializeSchemes} size="sm" className="gap-1.5 h-8">
                  <Plus className="h-3.5 w-3.5" />
                  Initialize with Defaults
                </Button>
              </div>
            ) : (
              <>
                {/* Tab Bar */}
                <div className="flex border-b border-border/50 px-4 shrink-0">
                  <button
                    onClick={() => setActiveTab('scheme')}
                    className={cn(
                      'px-4 py-2 text-xs font-medium border-b-2 transition-all -mb-[1px]',
                      activeTab === 'scheme'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Assessment Scheme
                  </button>
                  <button
                    onClick={() => setActiveTab('co-attainment')}
                    className={cn(
                      'px-4 py-2 text-xs font-medium border-b-2 transition-all -mb-[1px]',
                      activeTab === 'co-attainment'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    CO Attainment
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${selectedCourseType}-${activeTab}`}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      {/* Course Type Badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          {(() => {
                            const CourseIcon = COURSE_TYPE_ICONS[selectedCourseType] || BookOpen;
                            return <CourseIcon className="h-4 w-4" />;
                          })()}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold">{selectedCourseType}</h3>
                          <p className="text-[9px] text-muted-foreground">
                            {activeTab === 'scheme' ? 'Assessment scheme configuration' : 'CO attainment configuration'}
                            {' · '}{yearLabel} - {yearLevelLabel}
                          </p>
                        </div>
                      </div>

                      {activeTab === 'scheme' ? renderSchemeTab() : renderCOAttainmentTab()}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bottom Save Bar */}
                <div className="border-t border-border/50 px-4 py-2.5 flex items-center justify-between shrink-0 bg-background/95">
                  <p className="text-[9px] text-muted-foreground">
                    Changes apply to <span className="font-medium text-foreground">{selectedCourseType}</span> courses
                  </p>
                  <Button onClick={handleSave} size="sm" className="h-8 text-xs gap-1.5">
                    <Save className="h-3.5 w-3.5" />
                    Save
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Deep clone helper ─────────────────────────────────────
function deepCloneScheme(s: AssessmentSchemeConfig): AssessmentSchemeConfig {
  return {
    ...s,
    cieComponents: s.cieComponents.map((c) => ({ ...c })),
    seeComponents: s.seeComponents.map((c) => ({ ...c })),
    coAttainment: {
      ...s.coAttainment,
      attainmentLevels: s.coAttainment.attainmentLevels.map((l) => ({ ...l })),
      finalCOFormula: { ...s.coAttainment.finalCOFormula },
    },
  };
}

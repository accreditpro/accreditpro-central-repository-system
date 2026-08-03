import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AILoadingScreen } from '@/components/shared/AILoadingScreen';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CourseOutcome, BloomsTaxonomyLevel, BLOOMS_TAXONOMY_LEVELS, AICourseAnalysis } from '../types';
import { cn } from '@/lib/utils';
import { generateCourseOutcomes, GenerateCOResult } from '@/services/syllabus.service';
import {
  Target,
  Sparkles,
  Save,
  ArrowRight,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Lightbulb,
  CheckCircle2,
  Loader2,
  Brain,
  AlertCircle,
  Check,
  X,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Hash,
  Info,
} from 'lucide-react';

interface Step4Props {
  outcomes: CourseOutcome[];
  aiAnalysis: AICourseAnalysis | null;
  courseName: string;
  onUpdate: (outcomes: CourseOutcome[]) => void;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  completionPercentage: number;
}

/** Map Bloom's level code (L1-L6) to the display-level name */
function mapBloomsLevelCodeToName(code: string): BloomsTaxonomyLevel {
  const map: Record<string, BloomsTaxonomyLevel> = {
    L1: 'Remember',
    L2: 'Understand',
    L3: 'Apply',
    L4: 'Analyze',
    L5: 'Evaluate',
    L6: 'Create',
  };
  return map[code] || 'Understand';
}

/** Bloom's level code display colours */
const BLOOMS_CODE_COLORS: Record<string, string> = {
  L1: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  L2: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  L3: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  L4: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  L5: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  L6: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

/** Confidence score colour */
function getConfidenceColor(score?: number): string {
  if (!score) return 'bg-gray-500/10 text-gray-600';
  if (score >= 85) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  if (score >= 70) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  return 'bg-red-500/10 text-red-600 border-red-500/20';
}

/** Confidence badge — displays score with colour coding */
function ConfidenceBadge({ score }: { score?: number }) {
  if (score === undefined || score === null) return null;
  return (
    <Badge
      variant="outline"
      className={cn('text-[9px] border gap-1', getConfidenceColor(score))}
      title="AI Confidence Score"
    >
      <Brain className="h-2.5 w-2.5" />
      {score}%
    </Badge>
  );
}

/** Status badge for PENDING_REVIEW / APPROVED / REJECTED */
function StatusBadge({ status }: { status?: CourseOutcome['status'] }) {
  if (!status || status === 'REJECTED') return null;
  const styles: Record<string, string> = {
    PENDING_REVIEW: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    APPROVED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  };
  const icons: Record<string, React.ReactNode> = {
    PENDING_REVIEW: <Eye className="h-2.5 w-2.5" />,
    APPROVED: <Check className="h-2.5 w-2.5" />,
  };
  return (
    <Badge variant="outline" className={cn('text-[9px] border gap-1', styles[status] || '')}>
      {icons[status]}
      {status === 'PENDING_REVIEW' ? 'Pending Review' : status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

export default function Step4_CourseOutcomes({
  outcomes, aiAnalysis, courseName,
  onUpdate, onSave, onNext, onPrev, completionPercentage,
}: Step4Props) {
  const [editingCO, setEditingCO] = useState<CourseOutcome | null>(null);
  const [newCO, setNewCO] = useState<Partial<CourseOutcome>>({ description: '', bloomsLevel: 'Remember' as BloomsTaxonomyLevel, unit: '' });
  const [showCOForm, setShowCOForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const canAddMore = outcomes.length < 6;
  const courseContent = aiAnalysis?.rawCourseContent;

  const nextCOCode = () => {
    const nums = outcomes.map((co) => parseInt(co.code.replace('CO', ''), 10)).filter((n) => !isNaN(n));
    return `CO${(nums.length > 0 ? Math.max(...nums) : 0) + 1}`;
  };

  const handleAddCO = () => {
    if (!newCO.description?.trim()) return;

    if (editingCO) {
      // Preserve all existing metadata when editing (even for approved COs)
      const updated: CourseOutcome = {
        ...editingCO,
        description: newCO.description.trim(),
        bloomsLevel: (newCO.bloomsLevel || 'Remember') as BloomsTaxonomyLevel,
        unit: newCO.unit,
        facultyModified: true,
      };
      onUpdate(outcomes.map((o) => (o.id === editingCO.id ? updated : o)));
      setSavedMessage(`CO ${editingCO.code} updated ✓`);
    } else {
      const co: CourseOutcome = {
        id: `co-${Date.now()}`,
        code: nextCOCode(),
        description: newCO.description.trim(),
        bloomsLevel: (newCO.bloomsLevel || 'Remember') as BloomsTaxonomyLevel,
        unit: newCO.unit,
      };
      onUpdate([...outcomes, co]);
      setSavedMessage(`CO ${co.code} added ✓`);
    }
    setTimeout(() => setSavedMessage(null), 3000);
    setNewCO({ description: '', bloomsLevel: 'Remember', unit: '' });
    setEditingCO(null);
    setShowCOForm(false);
  };

  const handleEdit = (co: CourseOutcome) => {
    setEditingCO(co);
    setNewCO({ description: co.description, bloomsLevel: co.bloomsLevel, unit: co.unit });
    setShowCOForm(true);
  };

  const handleDelete = (id: string) => {
    const deleted = outcomes.find((o) => o.id === id);
    onUpdate(outcomes.filter((o) => o.id !== id));
    if (deleted) {
      setSavedMessage(`CO ${deleted.code} deleted ✓`);
      setTimeout(() => setSavedMessage(null), 3000);
    }
  };

  /** Call the /generate-cos API to generate AI-suggested Course Outcomes */
  const handleGenerateFromAI = async () => {
    if (!courseContent || !courseName) {
      setGenerateError('Course content or course name is missing. Please complete the AI analysis in Step 3 first.');
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const coResponse = await generateCourseOutcomes(courseName, courseContent);
      const generatedCOs = coResponse.data.ai_suggested_course_outcomes;

      if (!generatedCOs || generatedCOs.length === 0) {
        setGenerateError('AI returned no course outcomes. Please try again.');
        setIsGenerating(false);
        return;
      }

      // Map API response to CourseOutcome[], preserving all rich metadata
      const mapped: CourseOutcome[] = generatedCOs.map((co: GenerateCOResult, idx: number) => {
        // Derive mapped topics from the AI analysis's extracted units
        const mappedTopicsForCO = co.mapped_units && co.mapped_units.length > 0 && aiAnalysis?.extractedUnits
          ? (() => {
              const topics: string[] = [];
              co.mapped_units.forEach((unitNum) => {
                const unitIdx = unitNum - 1; // Unit numbers are 1-based
                const unit = aiAnalysis.extractedUnits[unitIdx];
                if (unit?.topics) {
                  topics.push(...unit.topics);
                }
              });
              return [...new Set(topics)]; // Deduplicate across units
            })()
          : [];

        return {
          id: `co-${Date.now()}-${co.co_code || `CO${idx + 1}`}`,
          code: co.co_code || `CO${idx + 1}`,
          description: co.description || '',
          bloomsLevel: mapBloomsLevelCodeToName(co.blooms_level_code),
          unit: co.mapped_units?.map((u) => `Unit ${u}`).join(', ') || `Unit ${idx + 1}`,
          bloomsLevelCode: co.blooms_level_code,
          mappedUnits: co.mapped_units,
          mappedTopics: mappedTopicsForCO,
          status: co.status,
          aiGenerated: co.ai_generated,
          approved: co.approved,
          facultyModified: co.faculty_modified,
          confidenceScore: co.confidence_score,
        };
      });

      onUpdate(mapped);
      setSavedMessage(`${mapped.length} AI-generated COs loaded ✓`);
      setTimeout(() => setSavedMessage(null), 4000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate course outcomes';
      setGenerateError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  /** Approve a single CO — marks it as APPROVED */
  const handleApproveCO = (id: string) => {
    const co = outcomes.find((o) => o.id === id);
    onUpdate(
      outcomes.map((o) =>
        o.id === id
          ? { ...o, status: 'APPROVED' as const, approved: true }
          : o
      )
    );
    if (co) {
      setSavedMessage(`CO ${co.code} approved ✓`);
      setTimeout(() => setSavedMessage(null), 3000);
    }
  };

  /** Reject a single CO — removes it from the list */
  const handleRejectCO = (id: string) => {
    const co = outcomes.find((o) => o.id === id);
    onUpdate(outcomes.filter((o) => o.id !== id));
    if (co) {
      setSavedMessage(`CO ${co.code} rejected ✗`);
      setTimeout(() => setSavedMessage(null), 3000);
    }
  };

  const displayOutcomes = outcomes.map((co, idx) => ({ ...co, displayCode: co.code || `CO${idx + 1}` }));

  /** Count of PENDING_REVIEW COs */
  const pendingCount = outcomes.filter((co) => co.status === 'PENDING_REVIEW').length;
  const allApproved = outcomes.length > 0 && outcomes.every((co) => co.status === 'APPROVED');

  const getBloomsBadge = (level: BloomsTaxonomyLevel) => {
    const colors: Record<string, string> = {
      Remember: 'bg-blue-500/10 text-blue-600',
      Understand: 'bg-teal-500/10 text-teal-600',
      Apply: 'bg-emerald-500/10 text-emerald-600',
      Analyze: 'bg-amber-500/10 text-amber-600',
      Evaluate: 'bg-orange-500/10 text-orange-600',
      Create: 'bg-purple-500/10 text-purple-600',
    };
    return colors[level] || 'bg-gray-500/10 text-gray-600';
  };

  // ============ AI Loading Screen ============
  if (isGenerating) {
    return (
      <div className="flex items-center justify-center py-12">
        <AILoadingScreen
          workflow="course-outcomes"
          isProcessing={true}
          title="Generating Course Outcomes"
          subtitle="AI is creating measurable Course Outcomes aligned with the syllabus and Bloom's Taxonomy"
          onCancel={() => { setIsGenerating(false); setGenerateError(null); }}
        />
      </div>
    );
  }

  if (generateError) {
    return (
      <div className="flex items-center justify-center py-12">
        <AILoadingScreen
          workflow="course-outcomes"
          isProcessing={false}
          error={generateError}
          onRetry={handleGenerateFromAI}
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
            <Target className="h-5 w-5 text-emerald-600" />
            Course Outcomes
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Define 5–6 Course Outcomes — generate via AI, then review, edit, or add your own
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[9px] gap-1">
              <Eye className="h-3 w-3" />
              {pendingCount} pending
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">{outcomes.length}/6 COs</Badge>
          <Badge variant="outline" className="text-xs">{completionPercentage}%</Badge>
        </div>
      </div>
      <Separator />

      {/* AI Generate Card — shown when no outcomes exist yet AND course content is available */}
      {outcomes.length === 0 && courseContent ? (
        <Card className="border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Generate Course Outcomes with AI</p>
                  <p className="text-xs text-muted-foreground">
                    The AI will analyze the course content and suggest up to 6 COs with Bloom's levels,
                    confidence scores, and mapped units
                  </p>
                </div>
              </div>
              <Button
                onClick={handleGenerateFromAI}
                disabled={isGenerating}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                {isGenerating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Generate COs</>
                )}
              </Button>
            </div>

            {/* Error message */}
            {generateError && (
              <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-red-600">{generateError}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : outcomes.length === 0 && !courseContent ? (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Course analysis required first</p>
              <p className="text-xs text-amber-600/70">
                Please complete Step 3 (AI Course Analysis) first so we have the course content to generate outcomes
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Empty State (no COs and no AI content yet) */}
      {displayOutcomes.length === 0 && !courseContent && (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-border/50">
          <Target className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No Course Outcomes defined</p>
          <p className="text-xs text-muted-foreground mt-1">Generate from AI or add manually (5–6 COs recommended)</p>
        </div>
      )}

      {/* CO List */}
      {displayOutcomes.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {displayOutcomes.map((co) => (
              <motion.div
                key={co.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-all group',
                  co.status === 'PENDING_REVIEW'
                    ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/[0.04] to-transparent'
                    : co.status === 'APPROVED'
                      ? 'border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.04] to-transparent'
                      : 'border-border/50 bg-card hover:bg-muted/20'
                )}
              >
                {/* CO Code Badge */}
                <div className="flex items-center justify-center h-8 w-10 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-xs font-bold shrink-0">
                  {co.displayCode}
                </div>

                {/* CO Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{co.description}</p>

                  {/* Tags Row */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {/* Bloom's Level */}
                    <Badge className={cn('text-[9px]', getBloomsBadge(co.bloomsLevel))} variant="secondary">
                      {co.bloomsLevel}
                    </Badge>

                    {/* Bloom's Level Code (e.g., L3) */}
                    {co.bloomsLevelCode && (
                      <Badge variant="outline" className={cn('text-[9px] border', BLOOMS_CODE_COLORS[co.bloomsLevelCode] || '')}>
                        {co.bloomsLevelCode}
                      </Badge>
                    )}

                    {/* Unit */}
                    {co.unit && (
                      <Badge variant="outline" className="text-[9px] flex items-center gap-1">
                        <Hash className="h-2.5 w-2.5" />
                        {co.unit}
                      </Badge>
                    )}

                    {/* Mapped Units from API (rich display) */}
                    {co.mappedUnits && co.mappedUnits.length > 0 && !co.unit && (
                      <Badge variant="outline" className="text-[9px] flex items-center gap-1">
                        <Hash className="h-2.5 w-2.5" />
                        Units {co.mappedUnits.join(', ')}
                      </Badge>
                    )}

                    {/* AI Confidence Score */}
                    <ConfidenceBadge score={co.confidenceScore} />

                    {/* Status Badge */}
                    <StatusBadge status={co.status} />

                    {/* AI Generated Indicator */}
                    {co.aiGenerated && (
                      <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[9px] gap-1">
                        <Sparkles className="h-2.5 w-2.5" />
                        AI
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {/* PENDING_REVIEW actions: Approve / Reject */}
                  {co.status === 'PENDING_REVIEW' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                        onClick={() => handleApproveCO(co.id)}
                        title="Approve CO"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => handleRejectCO(co.id)}
                        title="Reject CO"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </>
                  )}

                  {/* Edit / Delete — always visible */}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-500/10" onClick={() => handleEdit(co)} title="Edit CO">
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(co.id)} title="Delete CO">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Pending Review Reminder (informational only — no Accept All) */}
          {pendingCount > 0 && (
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                      {pendingCount} CO{pendingCount > 1 ? 's' : ''} pending review
                    </p>
                    <p className="text-[10px] text-amber-600/60">
                      Review each CO individually — approve (👍) or reject (👎). You can also edit descriptions or add your own.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Approved Indicator */}
          {allApproved && outcomes.length >= 3 && (
            <div className="flex items-center justify-center gap-2 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600">All COs reviewed and approved</span>
            </div>
          )}

          {/* Success Toast */}
          <AnimatePresence>
            {savedMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-600">{savedMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* AI Insights Summary Card */}
      {outcomes.length > 0 && outcomes.some((co) => co.aiGenerated) && (
        <Card className="border-indigo-500/20 bg-gradient-to-r from-indigo-500/[0.03] to-purple-500/[0.03]">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400">
                  AI-Generated Course Outcomes
                </p>
                <p className="text-[9px] text-indigo-500/70 mt-0.5">
                  {outcomes.filter((co) => co.aiGenerated).length} of {outcomes.length} COs were AI-generated.
                  {pendingCount > 0
                    ? ` ${pendingCount} ${pendingCount === 1 ? 'is' : 'are'} pending review — review each, edit if needed, or add your own.`
                    : ' All COs have been reviewed and approved.'}{' '}
                  You can edit descriptions, adjust Bloom's levels, change mapped units, or add new COs manually.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit CO Dialog */}
      <Dialog open={showCOForm} onOpenChange={(open) => { if (!open) { setShowCOForm(false); setEditingCO(null); }}}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingCO ? (
                <><Edit2 className="h-4 w-4 text-indigo-600" /> Edit {editingCO.code}</>
              ) : (
                <><Plus className="h-4 w-4 text-indigo-600" /> Add New CO ({nextCOCode()})</>
              )}
            </DialogTitle>
            <DialogDescription>
              {editingCO
                ? 'Update the description, Bloom\'s level, or mapped unit for this course outcome.'
                : 'Fill in the details for the new course outcome.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                CO Description <span className="text-destructive">*</span>
              </Label>
              <textarea
                value={newCO.description}
                onChange={(e) => setNewCO({ ...newCO, description: e.target.value })}
                placeholder="Describe the course outcome..."
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                rows={3}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Bloom's Level</Label>
                <Select
                  value={newCO.bloomsLevel}
                  onValueChange={(v) => setNewCO({ ...newCO, bloomsLevel: v as BloomsTaxonomyLevel })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOMS_TAXONOMY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level} className="text-xs">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-3.5 w-3.5" />
                          {level}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Unit</Label>
                <Input
                  value={newCO.unit || ''}
                  onChange={(e) => setNewCO({ ...newCO, unit: e.target.value })}
                  placeholder="e.g., Unit 1"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
            <Button variant="outline" size="sm" className="text-xs h-9" onClick={() => { setShowCOForm(false); setEditingCO(null); setNewCO({ description: '', bloomsLevel: 'Remember', unit: '' }); }}>
              Cancel
            </Button>
            <Button size="sm" className="text-xs h-9 gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700" onClick={handleAddCO} disabled={!newCO.description?.trim()}>
              {editingCO ? (
                <><Save className="h-3.5 w-3.5" /> Update CO</>
              ) : (
                <><Plus className="h-3.5 w-3.5" /> Add CO</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add CO Button */}
      {!showCOForm && outcomes.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 gap-1.5 w-full"
          onClick={() => setShowCOForm(true)}
          disabled={!canAddMore}
        >
          <Plus className="h-3.5 w-3.5" />
          {canAddMore
            ? `Add CO${outcomes.length + 1} (${6 - outcomes.length} remaining)`
            : 'Maximum 6 COs reached'}
        </Button>
      )}
      {!showCOForm && outcomes.length === 0 && !courseContent && (
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 gap-1.5 w-full"
          onClick={() => setShowCOForm(true)}
          disabled={!canAddMore}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Manual CO
        </Button>
      )}

      {/* Regenerate Button (only shown when COs exist and courseContent is available) */}
      {outcomes.length > 0 && courseContent && (
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 gap-1.5 w-full text-indigo-600 border-indigo-500/30 hover:bg-indigo-500/5"
          onClick={handleGenerateFromAI}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Regenerating...</>
          ) : (
            <><Sparkles className="h-3.5 w-3.5" /> Regenerate COs from AI</>
          )}
        </Button>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onPrev} className="gap-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous: AI Course Analysis
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSave} className="gap-2" disabled={outcomes.length === 0}>
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button size="sm" onClick={onNext} disabled={outcomes.length < 3} className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700">
            Next: CO-PO Mapping
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

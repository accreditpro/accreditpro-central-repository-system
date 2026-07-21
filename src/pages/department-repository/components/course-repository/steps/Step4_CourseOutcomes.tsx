import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CourseOutcome, BloomsTaxonomyLevel, BLOOMS_TAXONOMY_LEVELS, AICourseAnalysis } from '../types';
import { cn } from '@/lib/utils';
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
  RefreshCw,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface Step4Props {
  outcomes: CourseOutcome[];
  aiAnalysis: AICourseAnalysis | null;
  onUpdate: (outcomes: CourseOutcome[]) => void;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  completionPercentage: number;
}

export default function Step4_CourseOutcomes({ outcomes, aiAnalysis, onUpdate, onSave, onNext, onPrev, completionPercentage }: Step4Props) {
  const [editingCO, setEditingCO] = useState<CourseOutcome | null>(null);
  const [newCO, setNewCO] = useState<Partial<CourseOutcome>>({ description: '', bloomsLevel: 'Remember' as BloomsTaxonomyLevel, unit: '' });
  const [showCOForm, setShowCOForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAccepted, setShowAccepted] = useState(false);

  const canAddMore = outcomes.length < 6;

  const nextCOCode = () => {
    const nums = outcomes.map((co) => parseInt(co.code.replace('CO', ''), 10)).filter((n) => !isNaN(n));
    return `CO${(nums.length > 0 ? Math.max(...nums) : 0) + 1}`;
  };

  const handleAddCO = () => {
    if (!newCO.description?.trim()) return;
    const co: CourseOutcome = {
      id: `co-${Date.now()}`,
      code: editingCO ? editingCO.code : nextCOCode(),
      description: newCO.description.trim(),
      bloomsLevel: (newCO.bloomsLevel || 'Remember') as BloomsTaxonomyLevel,
      unit: newCO.unit,
    };
    if (editingCO) {
      onUpdate(outcomes.map((o) => (o.id === editingCO.id ? co : o)));
    } else {
      onUpdate([...outcomes, co]);
    }
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
    onUpdate(outcomes.filter((o) => o.id !== id));
  };

  const handleGenerateFromAI = () => {
    if (!aiAnalysis?.suggestedCOs) return;
    setIsGenerating(true);
    setTimeout(() => {
      onUpdate(aiAnalysis.suggestedCOs.map((co) => ({ ...co, id: `co-${Date.now()}-${co.code}` })));
      setIsGenerating(false);
    }, 1000);
  };

  const handleAcceptAll = () => {
    setShowAccepted(true);
    setTimeout(() => setShowAccepted(false), 3000);
  };

  const displayOutcomes = outcomes.map((co, idx) => ({ ...co, displayCode: co.code || `CO${idx + 1}` }));

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            Course Outcomes
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">Define 5-6 Course Outcomes mapped to Bloom's Taxonomy levels</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{outcomes.length}/6 COs</Badge>
          <Badge variant="outline" className="text-xs">{completionPercentage}%</Badge>
        </div>
      </div>
      <Separator />

      {/* AI Generate Button */}
      {aiAnalysis && outcomes.length === 0 && (
        <Card className="border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm font-semibold">AI-Generated COs Available</p>
                <p className="text-xs text-muted-foreground">{aiAnalysis.suggestedCOs.length} COs generated from course analysis</p>
              </div>
            </div>
            <Button onClick={handleGenerateFromAI} disabled={isGenerating} className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate COs
            </Button>
          </CardContent>
        </Card>
      )}

      {/* CO List */}
      {displayOutcomes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-border/50">
          <Target className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No Course Outcomes defined</p>
          <p className="text-xs text-muted-foreground mt-1">Generate from AI or add manually (5-6 COs recommended)</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayOutcomes.map((co) => (
            <motion.div
              key={co.id}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/20 transition-colors group"
            >
              <div className="flex items-center justify-center h-8 w-10 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-xs font-bold shrink-0">
                {co.displayCode}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{co.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={cn('text-[9px]', getBloomsBadge(co.bloomsLevel))} variant="secondary">
                    {co.bloomsLevel}
                  </Badge>
                  {co.unit && (
                    <Badge variant="outline" className="text-[9px]">{co.unit}</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(co)}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(co.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Accept All */}
      {displayOutcomes.length >= 5 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAcceptAll}
          className="gap-2 w-full text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/5"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Accept All COs
        </Button>
      )}

      {/* Add CO Form */}
      {showCOForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-lg border border-indigo-500/20 bg-indigo-500/5 space-y-3"
        >
          <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
            {editingCO ? `Edit ${editingCO.code}` : `Add New CO (${nextCOCode()})`}
          </p>
          <div className="space-y-2">
            <Label className="text-xs">CO Description *</Label>
            <textarea
              value={newCO.description}
              onChange={(e) => setNewCO({ ...newCO, description: e.target.value })}
              placeholder="Describe the course outcome..."
              className="w-full min-h-[60px] px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Bloom's Level</Label>
              <Select
                value={newCO.bloomsLevel}
                onValueChange={(v) => setNewCO({ ...newCO, bloomsLevel: v as BloomsTaxonomyLevel })}
              >
                <SelectTrigger className="mt-1 h-9 text-sm">
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
            <div>
              <Label className="text-xs">Unit</Label>
              <Input
                value={newCO.unit || ''}
                onChange={(e) => setNewCO({ ...newCO, unit: e.target.value })}
                placeholder="e.g., Unit 1"
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" className="text-xs h-8" onClick={handleAddCO} disabled={!newCO.description?.trim()}>
              {editingCO ? 'Update CO' : 'Add CO'}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => { setShowCOForm(false); setEditingCO(null); }}>
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Add CO Button */}
      {!showCOForm && (
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

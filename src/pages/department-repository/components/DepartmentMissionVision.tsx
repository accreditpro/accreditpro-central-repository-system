import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Target,
  Eye,
  Heart,
  Save,
  Edit2,
  Plus,
  X,
  Sparkles,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { missionVisionService } from '@/services/mission-vision.service';

interface DepartmentMissionVisionData {
  mission: string[];
  vision: string;
  coreValues: string[];
  qualityPolicy: string;
  programEducationalObjectives: string[];
  programSpecificOutcomes: string[];
  departmentStrengths: string[];
}

const EMPTY_DATA: DepartmentMissionVisionData = {
  mission: [],
  vision: '',
  coreValues: [],
  qualityPolicy: '',
  programEducationalObjectives: [],
  programSpecificOutcomes: [],
  departmentStrengths: [],
};

interface DepartmentMissionVisionProps {
  academicYear: string;
  departmentId: number;
}

/**
 * Dedicated inline input component for adding items to array fields
 * (mission statements, core values, PEOs, PSOs, department strengths).
 * Replaces the native prompt() dialog with a polished inline UX.
 */
function AddItemInput({
  onAdd,
  onCancel,
  placeholder,
}: {
  onAdd: (value: string) => void;
  onCancel: () => void;
  placeholder: string;
}) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAdd = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-dashed border-primary/30"
    >
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 h-8 text-sm"
      />
      <Button
        size="sm"
        className="h-8 text-xs gap-1 shrink-0"
        onClick={handleAdd}
        disabled={!value.trim()}
      >
        <Plus className="h-3 w-3" />
        Add
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs shrink-0 text-muted-foreground"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </motion.div>
  );
}

export const DepartmentMissionVision = ({ academicYear, departmentId }: DepartmentMissionVisionProps) => {
  const [data, setData] = useState<DepartmentMissionVisionData>(EMPTY_DATA);
  const [originalData, setOriginalData] = useState<DepartmentMissionVisionData | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingField, setAddingField] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await missionVisionService.getMissionVision({
        academicYear,
        departmentId,
      });
      const mapped: DepartmentMissionVisionData = {
        vision: result.vision || '',
        mission: result.mission || [],
        coreValues: result.coreValues || [],
        qualityPolicy: result.qualityPolicy || '',
        programEducationalObjectives: result.peos || [],
        programSpecificOutcomes: result.psos || [],
        departmentStrengths: result.departmentStrengths || [],
      };
      setData(mapped);
      setOriginalData(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load mission & vision data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [academicYear, departmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await missionVisionService.updateMissionVision(departmentId, {
        academicYear,
        department: '',
        vision: data.vision,
        mission: data.mission,
        coreValues: data.coreValues,
        peos: data.programEducationalObjectives,
        pos: [],
        psos: data.programSpecificOutcomes,
        qualityPolicy: data.qualityPolicy,
        departmentStrengths: data.departmentStrengths,
        motto: '',
      });
      const mapped: DepartmentMissionVisionData = {
        vision: updated.vision || '',
        mission: updated.mission || [],
        coreValues: updated.coreValues || [],
        qualityPolicy: updated.qualityPolicy || '',
        programEducationalObjectives: updated.peos || [],
        programSpecificOutcomes: updated.psos || [],
        departmentStrengths: updated.departmentStrengths || [],
      };
      setData(mapped);
      setOriginalData(mapped);
      setEditing(false);
      toast.success('Department Mission & Vision updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save mission & vision data';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const removeItem = (field: keyof Pick<DepartmentMissionVisionData, 'mission' | 'coreValues' | 'programEducationalObjectives' | 'programSpecificOutcomes' | 'departmentStrengths'>, index: number) => {
    setData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // ── Loading State ──

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ── Error State ──

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Department Mission & Vision</h1>
            <p className="text-muted-foreground">Academic Year: {academicYear}</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load data</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchData}>
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ── Empty State ──

  if (!data.vision && data.mission.length === 0 && !editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Department Mission & Vision</h1>
            <p className="text-muted-foreground">Academic Year: {academicYear}</p>
          </div>
          <Button onClick={() => setEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Define Now
          </Button>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No Mission & Vision Defined Yet</h3>
            <p className="text-sm text-muted-foreground/70 mt-1 mb-4 max-w-md">
              Define your department's mission, vision, core values, and objectives to get started with accreditation readiness.
            </p>
            <Button onClick={() => setEditing(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Define Department Mission & Vision
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasChanges = JSON.stringify(data) !== JSON.stringify(originalData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Department Mission & Vision</h1>
          <p className="text-muted-foreground">
            Academic Year: <span className="font-medium">{academicYear}</span>
            {editing && (
              <Badge variant="secondary" className="ml-2 text-[10px] bg-amber-500/10 text-amber-600">Editing</Badge>
            )}
            {hasChanges && !editing && (
              <Badge variant="secondary" className="ml-2 text-[10px] bg-blue-500/10 text-blue-600">Unsaved changes</Badge>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => { setEditing(false); if (originalData) setData({ ...originalData }); }} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !hasChanges}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Vision Statement */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-primary" />
              Vision Statement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <Textarea
                value={data.vision}
                onChange={(e) => setData((prev) => ({ ...prev, vision: e.target.value }))}
                className="min-h-[100px] text-sm"
                placeholder="Enter the department's vision statement..."
              />
            ) : (
              <p className="text-sm leading-relaxed text-foreground/90 italic">
                {data.vision || <span className="text-muted-foreground italic">No vision statement defined yet.</span>}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Mission Statements */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Mission Statements
              </CardTitle>
              {editing && (
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAddingField('mission')}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Mission
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.mission.map((missionItem, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  {editing ? (
                    <div className="flex-1 flex items-start gap-2">
                      <Textarea
                        value={missionItem}
                        onChange={(e) => {
                          const updated = [...data.mission];
                          updated[index] = e.target.value;
                          setData((prev) => ({ ...prev, mission: updated }));
                        }}
                        className="flex-1 text-sm min-h-[60px]"
                        placeholder="Enter a mission statement..."
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => removeItem('mission', index)}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-foreground/90">{missionItem}</p>
                  )}
                </div>
              ))}
              {!editing && data.mission.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No mission statements defined yet.</p>
              )}
              {editing && data.mission.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-4">No mission statements yet. Click "Add Mission" to create one.</p>
              )}
              <AnimatePresence mode="wait">
                {addingField === 'mission' && editing && (
                  <AddItemInput
                  onAdd={(value) => {
                    setData((prev) => ({ ...prev, mission: [...prev.mission, value] }));
                    setAddingField(null);
                  }}
                  onCancel={() => setAddingField(null)}
                  placeholder="Enter a mission statement..."
                />
              )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Core Values */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-primary" />
              Core Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.coreValues.map((value, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {value}
                  {editing && (
                    <button
                      className="ml-2 hover:text-destructive"
                      onClick={() => removeItem('coreValues', index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {editing && (
                <Button variant="outline" size="sm" className="h-8" onClick={() => setAddingField('coreValues')}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Value
                </Button>
              )}
              <AnimatePresence mode="wait">
                {addingField === 'coreValues' && editing && (
                  <AddItemInput
                  onAdd={(value) => {
                    setData((prev) => ({ ...prev, coreValues: [...prev.coreValues, value] }));
                    setAddingField(null);
                  }}
                  onCancel={() => setAddingField(null)}
                  placeholder="Enter a core value..."
                />
              )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Program Educational Objectives */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Program Educational Objectives (PEOs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.programEducationalObjectives.map((peo, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                  {editing ? (
                    <div className="flex-1 flex items-start gap-2">
                      <Input
                        value={peo}
                        onChange={(e) => {
                          const updated = [...data.programEducationalObjectives];
                          updated[index] = e.target.value;
                          setData((prev) => ({ ...prev, programEducationalObjectives: updated }));
                        }}
                        className="flex-1 text-sm"
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeItem('programEducationalObjectives', index)}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{peo}</p>
                  )}
                </div>
              ))}
              {editing && (
                <Button variant="outline" size="sm" onClick={() => setAddingField('programEducationalObjectives')}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add PEO
                </Button>
              )}
              <AnimatePresence mode="wait">
                {addingField === 'programEducationalObjectives' && editing && (
                  <AddItemInput
                  onAdd={(value) => {
                    setData((prev) => ({ ...prev, programEducationalObjectives: [...prev.programEducationalObjectives, value] }));
                    setAddingField(null);
                  }}
                  onCancel={() => setAddingField(null)}
                  placeholder="Enter a Program Educational Objective..."
                />
              )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Program Specific Outcomes */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              Program Specific Outcomes (PSOs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.programSpecificOutcomes.map((pso, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                  {editing ? (
                    <div className="flex-1 flex items-start gap-2">
                      <Input
                        value={pso}
                        onChange={(e) => {
                          const updated = [...data.programSpecificOutcomes];
                          updated[index] = e.target.value;
                          setData((prev) => ({ ...prev, programSpecificOutcomes: updated }));
                        }}
                        className="flex-1 text-sm"
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeItem('programSpecificOutcomes', index)}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{pso}</p>
                  )}
                </div>
              ))}
              {editing && (
                <Button variant="outline" size="sm" onClick={() => setAddingField('programSpecificOutcomes')}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add PSO
                </Button>
              )}
              <AnimatePresence mode="wait">
                {addingField === 'programSpecificOutcomes' && editing && (
                  <AddItemInput
                  onAdd={(value) => {
                    setData((prev) => ({ ...prev, programSpecificOutcomes: [...prev.programSpecificOutcomes, value] }));
                    setAddingField(null);
                  }}
                  onCancel={() => setAddingField(null)}
                  placeholder="Enter a Program Specific Outcome..."
                />
              )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quality Policy & Department Strengths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Quality Policy</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <Textarea
                  value={data.qualityPolicy}
                  onChange={(e) => setData((prev) => ({ ...prev, qualityPolicy: e.target.value }))}
                  className="min-h-[120px] text-sm"
                  placeholder="Enter the department quality policy..."
                />
              ) : (
                <p className="text-sm leading-relaxed text-foreground/90">
                {data.qualityPolicy || <span className="text-muted-foreground italic">No quality policy defined yet.</span>}
              </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Department Strengths</CardTitle>
                {editing && (
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAddingField('departmentStrengths')}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.departmentStrengths.map((strength, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    {editing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={strength}
                          onChange={(e) => {
                            const updated = [...data.departmentStrengths];
                            updated[index] = e.target.value;
                            setData((prev) => ({ ...prev, departmentStrengths: updated }));
                          }}
                          className="flex-1 h-8 text-sm"
                        />
                        <button className="text-muted-foreground hover:text-destructive" onClick={() => removeItem('departmentStrengths', index)}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm">{strength}</span>
                    )}
                  </div>
                ))}
                <AnimatePresence mode="wait">
                  {addingField === 'departmentStrengths' && editing && (
                    <AddItemInput
                    onAdd={(value) => {
                      setData((prev) => ({ ...prev, departmentStrengths: [...prev.departmentStrengths, value] }));
                      setAddingField(null);
                    }}
                    onCancel={() => setAddingField(null)}
                    placeholder="Enter a department strength..."
                  />
                )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { missionVisionService } from '@/services/mission-vision.service';
import type { MissionVisionData } from '@/types/mission-vision.types';

interface DepartmentMissionVisionProps {
  academicYear?: string;
  departmentId?: number;
}

const emptyMissionVisionData: MissionVisionData = {
  academicYear: '2025-26',
  department: '',
  vision: '',
  mission: [],
  coreValues: [],
  peos: [],
  pos: [],
  psos: [],
  qualityPolicy: '',
  departmentStrengths: [],
  motto: '',
};

export const DepartmentMissionVision = ({
  academicYear = '2025-26',
  departmentId = 1,
}: DepartmentMissionVisionProps) => {
  const [data, setData] = useState<MissionVisionData | null>(null);
  const [editData, setEditData] = useState<MissionVisionData>(emptyMissionVisionData);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCoreValue, setNewCoreValue] = useState('');

  // Fetch Mission & Vision from live API
  useEffect(() => {
    let isMounted = true;
    const fetchMissionVision = async () => {
      setLoading(true);
      try {
        const res = await missionVisionService.getMissionVision({
          academicYear,
          departmentId,
        });
        if (isMounted && res) {
          // Normalize response fields if any alias exists
          const raw = res as unknown as Record<string, unknown>;
          const normalized: MissionVisionData = {
            academicYear: res.academicYear || academicYear,
            department: res.department || '',
            vision: res.vision || '',
            mission: Array.isArray(res.mission) ? res.mission : (typeof raw.mission === 'string' && raw.mission ? [raw.mission as string] : []),
            coreValues: Array.isArray(res.coreValues) ? res.coreValues : [],
            peos: Array.isArray(res.peos) ? res.peos : (Array.isArray(raw.programEducationalObjectives) ? (raw.programEducationalObjectives as string[]) : []),
            pos: Array.isArray(res.pos) ? res.pos : [],
            psos: Array.isArray(res.psos) ? res.psos : (Array.isArray(raw.programSpecificOutcomes) ? (raw.programSpecificOutcomes as string[]) : []),
            qualityPolicy: res.qualityPolicy || '',
            departmentStrengths: Array.isArray(res.departmentStrengths) ? res.departmentStrengths : [],
            motto: res.motto || '',
          };
          setData(normalized);
          setEditData(normalized);
        }
      } catch (err: unknown) {
        console.warn('Failed to load Mission & Vision data:', err);
        if (isMounted) {
          setData(emptyMissionVisionData);
          setEditData(emptyMissionVisionData);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMissionVision();
    return () => {
      isMounted = false;
    };
  }, [academicYear, departmentId]);

  const handleStartEdit = () => {
    if (data) {
      setEditData(JSON.parse(JSON.stringify(data)));
    } else {
      setEditData({ ...emptyMissionVisionData, academicYear });
    }
    setNewCoreValue('');
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setNewCoreValue('');
    if (data) {
      setEditData(JSON.parse(JSON.stringify(data)));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: MissionVisionData = {
        ...editData,
        academicYear,
        // Filter out empty rows from arrays
        mission: editData.mission.filter((m) => m.trim().length > 0),
        coreValues: editData.coreValues.filter((c) => c.trim().length > 0),
        peos: editData.peos.filter((p) => p.trim().length > 0),
        psos: editData.psos.filter((p) => p.trim().length > 0),
        departmentStrengths: editData.departmentStrengths.filter((s) => s.trim().length > 0),
      };

      await missionVisionService.updateMissionVision(departmentId, payload);
      setData(payload);
      setEditData(payload);
      setEditing(false);
      setNewCoreValue('');
      toast.success('Department Mission & Vision updated successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update Mission & Vision';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Add Item to Array without browser prompt()
  const addMission = () => {
    setEditData((prev) => ({
      ...prev,
      mission: [...prev.mission, ''],
    }));
  };

  const removeMission = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      mission: prev.mission.filter((_, i) => i !== index),
    }));
  };

  const handleAddCoreValue = () => {
    if (newCoreValue.trim()) {
      setEditData((prev) => ({
        ...prev,
        coreValues: [...prev.coreValues, newCoreValue.trim()],
      }));
      setNewCoreValue('');
    }
  };

  const removeCoreValue = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      coreValues: prev.coreValues.filter((_, i) => i !== index),
    }));
  };

  const addPeo = () => {
    const nextNumber = editData.peos.length + 1;
    setEditData((prev) => ({
      ...prev,
      peos: [...prev.peos, `PEO${nextNumber}: `],
    }));
  };

  const removePeo = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      peos: prev.peos.filter((_, i) => i !== index),
    }));
  };

  const addPso = () => {
    const nextNumber = editData.psos.length + 1;
    setEditData((prev) => ({
      ...prev,
      psos: [...prev.psos, `PSO${nextNumber}: `],
    }));
  };

  const removePso = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      psos: prev.psos.filter((_, i) => i !== index),
    }));
  };

  const addStrength = () => {
    setEditData((prev) => ({
      ...prev,
      departmentStrengths: [...prev.departmentStrengths, ''],
    }));
  };

  const removeStrength = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      departmentStrengths: prev.departmentStrengths.filter((_, i) => i !== index),
    }));
  };

  // Render Skeletons during live API fetch
  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>

        {/* Vision Skeleton */}
        <Card className="border-primary/20">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        {/* Mission Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </CardContent>
        </Card>

        {/* Core Values Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-32 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="h-8 w-36 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentData = editing ? editData : (data || emptyMissionVisionData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Department Mission & Vision</h1>
          <p className="text-muted-foreground">
            Define and manage the department's mission, vision, and objectives ({academicYear})
          </p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
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
            <Button onClick={handleStartEdit}>
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
                value={currentData.vision}
                onChange={(e) => setEditData((prev) => ({ ...prev, vision: e.target.value }))}
                className="min-h-[100px] text-sm"
                placeholder="Enter the department's vision statement..."
              />
            ) : (
              <p className="text-sm leading-relaxed text-foreground/90 italic">
                {currentData.vision || <span className="text-muted-foreground not-italic">No vision statement defined yet.</span>}
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
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addMission}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Mission
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentData.mission.map((missionItem, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  {editing ? (
                    <div className="flex-1 flex items-start gap-2">
                      <Textarea
                        value={missionItem}
                        onChange={(e) => {
                          const updated = [...editData.mission];
                          updated[index] = e.target.value;
                          setEditData((prev) => ({ ...prev, mission: updated }));
                        }}
                        className="flex-1 text-sm min-h-[60px]"
                        placeholder="Enter a mission statement..."
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeMission(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-foreground/90">{missionItem}</p>
                  )}
                </div>
              ))}
              {!editing && currentData.mission.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No mission statements defined yet.</p>
              )}
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
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {currentData.coreValues.map((value, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary border border-primary/20 inline-flex items-center gap-1.5"
                  >
                    {value}
                    {editing && (
                      <button
                        type="button"
                        className="hover:text-destructive focus:outline-none"
                        onClick={() => removeCoreValue(index)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {!editing && currentData.coreValues.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No core values defined yet.</p>
                )}
              </div>

              {/* Clean Inline Input for Adding Core Values (No browser prompt) */}
              {editing && (
                <div className="flex items-center gap-2 pt-2 max-w-sm">
                  <Input
                    value={newCoreValue}
                    onChange={(e) => setNewCoreValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCoreValue();
                      }
                    }}
                    placeholder="Type new core value and press Enter..."
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs shrink-0"
                    onClick={handleAddCoreValue}
                    disabled={!newCoreValue.trim()}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Value
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Program Educational Objectives */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                Program Educational Objectives (PEOs)
              </CardTitle>
              {editing && (
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addPeo}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add PEO
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentData.peos.map((peo, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                  {editing ? (
                    <div className="flex-1 flex items-start gap-2">
                      <Input
                        value={peo}
                        onChange={(e) => {
                          const updated = [...editData.peos];
                          updated[index] = e.target.value;
                          setEditData((prev) => ({ ...prev, peos: updated }));
                        }}
                        className="flex-1 text-sm"
                        placeholder="e.g. PEO1: Graduates will have successful careers..."
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removePeo(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{peo}</p>
                  )}
                </div>
              ))}
              {!editing && currentData.peos.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No PEOs defined yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Program Specific Outcomes */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Program Specific Outcomes (PSOs)
              </CardTitle>
              {editing && (
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addPso}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add PSO
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentData.psos.map((pso, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                  {editing ? (
                    <div className="flex-1 flex items-start gap-2">
                      <Input
                        value={pso}
                        onChange={(e) => {
                          const updated = [...editData.psos];
                          updated[index] = e.target.value;
                          setEditData((prev) => ({ ...prev, psos: updated }));
                        }}
                        className="flex-1 text-sm"
                        placeholder="e.g. PSO1: Ability to design and develop software solutions..."
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removePso(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{pso}</p>
                  )}
                </div>
              ))}
              {!editing && currentData.psos.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No PSOs defined yet.</p>
              )}
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
                  value={currentData.qualityPolicy}
                  onChange={(e) => setEditData((prev) => ({ ...prev, qualityPolicy: e.target.value }))}
                  className="min-h-[120px] text-sm"
                  placeholder="Enter the department quality policy..."
                />
              ) : (
                <p className="text-sm leading-relaxed text-foreground/90">
                  {currentData.qualityPolicy || <span className="text-muted-foreground italic">No quality policy defined yet.</span>}
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
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addStrength}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentData.departmentStrengths.map((strength, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    {editing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={strength}
                          onChange={(e) => {
                            const updated = [...editData.departmentStrengths];
                            updated[index] = e.target.value;
                            setEditData((prev) => ({ ...prev, departmentStrengths: updated }));
                          }}
                          className="flex-1 h-8 text-sm"
                          placeholder="e.g. NBA Accredited Program (Tier-I)"
                        />
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-destructive focus:outline-none"
                          onClick={() => removeStrength(index)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm">{strength}</span>
                    )}
                  </div>
                ))}
                {!editing && currentData.departmentStrengths.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No department strengths defined yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
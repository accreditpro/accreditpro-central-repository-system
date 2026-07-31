import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CourseDetails as CourseDetailsType, WorkflowStepId } from '../types';
import {
  Save,
  ArrowRight,
  Calculator,
  BookOpen,
  Building2,
  GraduationCap,
  FileText,
  Clock,
  Users,
  Lock,
} from 'lucide-react';

interface Step1Props {
  data: CourseDetailsType;
  onUpdate: (data: CourseDetailsType) => void;
  onSave: () => void;
  onNext: () => void;
  completionPercentage: number;
  isExistingCourse?: boolean;
}

const DEPARTMENTS = ['Computer Science & Engineering', 'Electronics & Communication', 'Electrical & Electronics', 'Mechanical Engineering', 'Civil Engineering'];
const PROGRAMS = ['B.Tech', 'M.Tech', 'Ph.D'];
const REGULATIONS = ['R22', 'R20', 'R18'];
const YEARS = ['I Year', 'II Year', 'III Year', 'IV Year'];
const SEMESTERS = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
const FACULTY = ['Dr. Anita Sharma', 'Dr. Rajesh Kumar', 'Dr. Priya Sharma', 'Dr. Sunita Patel', 'Dr. Amit Verma'];

export default function Step1_CourseDetails({ data, onUpdate, onSave, onNext, completionPercentage, isExistingCourse }: Step1Props) {
  const [formData, setFormData] = useState(data);
  const [saved, setSaved] = useState(false);

  const updateField = (field: keyof CourseDetailsType, value: string | number) => {
    const updated = { ...formData, [field]: value };
    // Auto-calculate CI, PI, Total Hours, Credits
    const lec = typeof updated.lectureHours === 'string' ? parseFloat(updated.lectureHours) || 0 : updated.lectureHours;
    const tut = typeof updated.tutorialHours === 'string' ? parseFloat(updated.tutorialHours) || 0 : updated.tutorialHours;
    const prac = typeof updated.practicalHours === 'string' ? parseFloat(updated.practicalHours) || 0 : updated.practicalHours;
    const tw = typeof updated.teamWorkHours === 'string' ? parseFloat(updated.teamWorkHours) || 0 : updated.teamWorkHours;
    const sl = typeof updated.selfLearningHours === 'string' ? parseFloat(updated.selfLearningHours) || 0 : updated.selfLearningHours;

    updated.ciHours = lec + tut;
    updated.piHours = prac;
    updated.totalHours = updated.ciHours + updated.piHours + tw + sl;
    updated.credits = Math.round(updated.totalHours / 30);

    setFormData(updated);
    onUpdate(updated);
  };

  const handleSave = () => {
    onUpdate(formData);
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const isValid = formData.courseCode && formData.courseName && formData.facultyName && formData.semester && formData.credits > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            Course Details
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">Enter the basic course information and credit hours</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {completionPercentage}% Complete
        </Badge>
      </div>
      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Course Code *</Label>
                  <Input
                    value={formData.courseCode}
                    onChange={(e) => updateField('courseCode', e.target.value)}
                    placeholder="e.g., CS501"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Course Name *</Label>
                  <Input
                    value={formData.courseName}
                    onChange={(e) => updateField('courseName', e.target.value)}
                    placeholder="e.g., Machine Learning"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Faculty *</Label>
                  <Select
                    value={formData.facultyName}
                    onValueChange={(v) => updateField('facultyName', v)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {FACULTY.map((f) => (
                        <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    Department *
                    {isExistingCourse && <Lock className="h-3 w-3 text-muted-foreground/60" />}
                  </Label>
                  {isExistingCourse ? (
                    <Input
                      value={formData.department}
                      disabled
                      className="h-9 text-sm font-medium bg-muted/30 text-indigo-700 dark:text-indigo-400"
                    />
                  ) : (
                    <Select
                      value={formData.department}
                      onValueChange={(v) => updateField('department', v)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    Program *
                    {isExistingCourse && <Lock className="h-3 w-3 text-muted-foreground/60" />}
                  </Label>
                  {isExistingCourse ? (
                    <Input
                      value={formData.program}
                      disabled
                      className="h-9 text-sm font-medium bg-muted/30 text-indigo-700 dark:text-indigo-400"
                    />
                  ) : (
                    <Select
                      value={formData.program}
                      onValueChange={(v) => updateField('program', v)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROGRAMS.map((p) => (
                          <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    Regulation *
                    {isExistingCourse && <Lock className="h-3 w-3 text-muted-foreground/60" />}
                  </Label>
                  {isExistingCourse ? (
                    <Input
                      value={formData.regulation}
                      disabled
                      className="h-9 text-sm font-medium bg-muted/30 text-indigo-700 dark:text-indigo-400"
                    />
                  ) : (
                    <Select
                      value={formData.regulation}
                      onValueChange={(v) => updateField('regulation', v)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select regulation" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGULATIONS.map((r) => (
                          <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    Year *
                    {isExistingCourse && <Lock className="h-3 w-3 text-muted-foreground/60" />}
                  </Label>
                  {isExistingCourse ? (
                    <Input
                      value={formData.year}
                      disabled
                      className="h-9 text-sm font-medium bg-muted/30 text-indigo-700 dark:text-indigo-400"
                    />
                  ) : (
                    <Select
                      value={formData.year}
                      onValueChange={(v) => updateField('year', v)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS.map((y) => (
                          <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    Semester *
                    {isExistingCourse && <Lock className="h-3 w-3 text-muted-foreground/60" />}
                  </Label>
                  {isExistingCourse ? (
                    <Input
                      value={formData.semester}
                      disabled
                      className="h-9 text-sm font-medium bg-muted/30 text-indigo-700 dark:text-indigo-400"
                    />
                  ) : (
                    <Select
                      value={formData.semester}
                      onValueChange={(v) => updateField('semester', v)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEMESTERS.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Hours Card */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calculator className="h-4 w-4 text-emerald-600" />
                Credit Hour Distribution (NBA Format)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Lecture Hours (L)</Label>
                  <Input
                    type="number"
                    value={formData.lectureHours || ''}
                    onChange={(e) => updateField('lectureHours', e.target.value ? parseFloat(e.target.value) : 0)}
                    className="h-9 text-sm"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Tutorial Hours (T)</Label>
                  <Input
                    type="number"
                    value={formData.tutorialHours || ''}
                    onChange={(e) => updateField('tutorialHours', e.target.value ? parseFloat(e.target.value) : 0)}
                    className="h-9 text-sm"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Practical Hours (P)</Label>
                  <Input
                    type="number"
                    value={formData.practicalHours || ''}
                    onChange={(e) => updateField('practicalHours', e.target.value ? parseFloat(e.target.value) : 0)}
                    className="h-9 text-sm"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Team Work (TW)</Label>
                  <Input
                    type="number"
                    value={formData.teamWorkHours || ''}
                    onChange={(e) => updateField('teamWorkHours', e.target.value ? parseFloat(e.target.value) : 0)}
                    className="h-9 text-sm"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Self Learning (SL)</Label>
                  <Input
                    type="number"
                    value={formData.selfLearningHours || ''}
                    onChange={(e) => updateField('selfLearningHours', e.target.value ? parseFloat(e.target.value) : 0)}
                    className="h-9 text-sm"
                    min={0}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Calculated Summary */}
        <div className="space-y-4">
          <Card className="border-border/50 bg-gradient-to-br from-indigo-500/5 to-indigo-600/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calculator className="h-4 w-4 text-indigo-600" />
                Calculated Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'CI Hours (L + T)', value: formData.ciHours, color: 'text-blue-600', bg: 'bg-blue-500/10' },
                { label: 'PI Hours (P)', value: formData.piHours, color: 'text-purple-600', bg: 'bg-purple-500/10' },
                { label: 'Team Work (TW)', value: formData.teamWorkHours, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                { label: 'Self Learning (SL)', value: formData.selfLearningHours, color: 'text-amber-600', bg: 'bg-amber-500/10' },
              ].map((item) => (
                <div key={item.label} className={`p-3 rounded-lg ${item.bg}`}>
                  <p className="text-[10px] font-medium text-muted-foreground">{item.label}</p>
                  <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
              <Separator />
              <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500/10 to-indigo-600/10">
                <p className="text-[10px] font-medium text-muted-foreground">Total Hours</p>
                <p className="text-lg font-bold text-indigo-600">{formData.totalHours}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-600/10">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-medium text-muted-foreground">Calculated Credits</p>
                  <Badge className="bg-indigo-600 text-white text-xs font-bold">{formData.credits}</Badge>
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">Total Hours / 30 (rounded)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave} className="gap-2">
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-emerald-600 font-medium"
            >
              ✓ Saved
            </motion.span>
          )}
        </div>
        <Button
          size="sm"
          onClick={onNext}
          disabled={!isValid}
          className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700"
        >
          Next: Upload Course File
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

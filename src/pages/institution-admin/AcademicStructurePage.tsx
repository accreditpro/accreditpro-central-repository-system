import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  GraduationCap,
  Building2,
  Layers,
  Calendar,
  Plus,
  Search,
  BookOpen,
  Combine,
  Users,
  BarChart3,
  FileText,
  TrendingUp,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Briefcase,
  ClipboardCheck,
  Shield,
  Upload,
  UploadCloud,
  Info,
  Check,
  X,
  Image,
  Download,
  AlertCircle,
  File,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { institutionAdminService } from '@/services/institution-admin.service';
import { AcademicStructureSummary } from '@/types/institution-admin.types';
import {
  masterPrograms,
  departments,
  specializations,
  academicYears,
  academicRegulations,
  programOfferings,
  programIntakes,
} from './mock-data';
import {
  Program,
  Department,
  Specialization,
  AcademicYear,
  AcademicRegulation,
  ProgramOffering,
  ProgramIntake,
} from './types';

// Dashboard Tab
const DashboardTab = () => {
  const [summary, setSummary] = useState<AcademicStructureSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    institutionAdminService
      .getAcademicStructureSummary()
      .then((data) => setSummary(data))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  const activePrograms = summary?.programs ?? masterPrograms.filter((p) => p.status === 'active').length;
  const activeDepts = summary?.departments ?? departments.filter((d) => d.status === 'active').length;
  const activeSpecs = summary?.specializations ?? specializations.filter((s) => s.status === 'active').length;
  const activeRegulations = summary?.regulations ?? academicRegulations.filter((r) => r.status === 'active').length;
  const activeOfferings = summary?.programOfferings ?? programOfferings.filter((o) => o.status === 'active').length;
  const totalIntake = summary?.totalIntakeCurrentYear ?? programIntakes
    .filter((i) => i.academicYear === '2025-26')
    .reduce((sum, i) => sum + i.sanctionedIntake, 0);
  const totalAcademicYears = summary?.academicYears ?? academicYears.length;

  const cards = [
    { label: 'Academic Years', value: totalAcademicYears, icon: Calendar, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Programs', value: activePrograms, icon: GraduationCap, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Departments', value: activeDepts, icon: Building2, color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30' },
    { label: 'Specializations', value: activeSpecs, icon: Layers, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Regulations', value: activeRegulations, icon: BookOpen, color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30' },
    { label: 'Program Offerings', value: activeOfferings, icon: Combine, color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
    { label: 'Total Intake (2025-26)', value: totalIntake, icon: Users, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
  ];

  // Program Distribution
  const programDist = summary?.programDistribution?.length
    ? summary.programDistribution.map((p) => ({
        name: p.programName || p.name || 'Program',
        departments: p.departmentCount ?? p.departments ?? 0,
      }))
    : masterPrograms
        .filter((p) => p.status === 'active')
        .map((p) => ({
          name: p.name,
          departments: departments.filter((d) => d.program === p.name && d.status === 'active').length,
        }));

  // Department / Intake Distribution
  const deptDist = summary?.intakeTrend?.length
    ? summary.intakeTrend.map((d) => ({
        name: d.departmentName || d.name || 'Department',
        offerings: d.offeringCount ?? d.offerings ?? d.count ?? 0,
      }))
    : departments
        .filter((d) => d.status === 'active')
        .map((d) => ({
          name: d.code,
          offerings: programOfferings.filter((o) => o.departmentId === d.id).length,
        }));

  const maxDepts = Math.max(...programDist.map((p) => p.departments), 1);
  const maxOfferings = Math.max(...deptDist.map((d) => d.offerings), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {cards.map((card) => (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className={`inline-flex p-2 rounded-lg ${card.color} mb-2`}>
                <card.icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold">{loading ? '...' : card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Program Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {programDist.map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(p.departments / maxDepts) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">{p.departments} depts</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Intake Trend (2025-26)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deptDist.filter((d) => d.offerings >= 0).map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{d.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(d.offerings / maxOfferings) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12">{d.offerings} offerings</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Academic Years Tab
const AcademicYearsTab = () => {
  const [years, setYears] = useState<AcademicYear[]>(academicYears);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [deletingYear, setDeletingYear] = useState<AcademicYear | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Add/Edit form state
  const [formYear, setFormYear] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formInstitutionType, setFormInstitutionType] = useState('');

  const fetchYears = useCallback(async () => {
    setLoading(true);
    try {
      const data = await institutionAdminService.getAcademicYears();
      if (Array.isArray(data)) {
        const mapped: AcademicYear[] = data.map((item) => ({
          id: String(item.id),
          year: item.year,
          startDate: item.startDate ? item.startDate.split('T')[0] : '',
          endDate: item.endDate ? item.endDate.split('T')[0] : '',
          institutionType: item.institutionType || 'Autonomous',
          status: item.isCurrent || item.status === 'ACTIVE' ? 'active' : 'inactive',
        }));
        setYears(mapped);
      }
    } catch {
      // Fallback to local mock list if offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchYears();
  }, [fetchYears]);

  // Check if an academic year has associated persisted data
  const hasPersistedData = (yearId: string): boolean => {
    const associatedOfferings = programOfferings.filter((o) => o.academicYearId === yearId);
    const associatedIntakes = programIntakes.filter((i) => i.academicYearId === yearId);
    const associatedRegulations = academicRegulations.filter((r) => r.academicYearIntroduced === years.find((y) => y.id === yearId)?.year);
    return associatedOfferings.length > 0 || associatedIntakes.length > 0 || associatedRegulations.length > 0;
  };

  // Reset add form
  const resetAddForm = () => {
    setFormYear('');
    setFormStartDate('');
    setFormEndDate('');
    setFormInstitutionType('');
  };

  // Handle add
  const handleAdd = async () => {
    if (!formYear.trim() || !formStartDate || !formEndDate || !formInstitutionType) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await institutionAdminService.createAcademicYear({
        year: formYear.trim(),
        startDate: formStartDate,
        endDate: formEndDate,
        institutionType: formInstitutionType,
        status: 'INACTIVE',
      });
      toast.success('Academic year added successfully');
      setShowAddDialog(false);
      resetAddForm();
      fetchYears();
    } catch {
      toast.error('Failed to add academic year');
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit dialog
  const openEdit = (year: AcademicYear) => {
    setEditingYear(year);
    setFormYear(year.year);
    setFormStartDate(year.startDate);
    setFormEndDate(year.endDate);
    setFormInstitutionType(year.institutionType);
    setShowEditDialog(true);
  };

  // Handle edit
  const handleEdit = async () => {
    if (!editingYear || !formYear.trim() || !formStartDate || !formEndDate || !formInstitutionType) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const yearIdNum = Number(editingYear.id);
      if (!isNaN(yearIdNum)) {
        await institutionAdminService.updateAcademicYear(yearIdNum, {
          year: formYear.trim(),
          startDate: formStartDate,
          endDate: formEndDate,
          institutionType: formInstitutionType,
          status: editingYear.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        });
      }
      toast.success('Academic year updated successfully');
      setShowEditDialog(false);
      setEditingYear(null);
      resetAddForm();
      fetchYears();
    } catch {
      toast.error('Failed to update academic year');
    } finally {
      setSubmitting(false);
    }
  };

  // Open delete confirmation
  const openDelete = (year: AcademicYear) => {
    setDeletingYear(year);
    setShowDeleteDialog(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingYear) return;
    if (hasPersistedData(deletingYear.id)) {
      toast.error('Cannot delete: this academic year has associated data (program offerings, intakes, or regulations)');
      setShowDeleteDialog(false);
      setDeletingYear(null);
      return;
    }
    setSubmitting(true);
    try {
      const idNum = Number(deletingYear.id);
      if (!isNaN(idNum)) {
        await institutionAdminService.deleteAcademicYear(idNum);
      }
      toast.success('Academic year deleted successfully');
      setShowDeleteDialog(false);
      setDeletingYear(null);
      fetchYears();
    } catch {
      toast.error('Failed to delete academic year');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle activate
  const handleActivate = async (year: AcademicYear) => {
    const idNum = Number(year.id);
    if (isNaN(idNum)) return;
    setSubmitting(true);
    try {
      await institutionAdminService.activateAcademicYear(idNum);
      toast.success(`Academic year ${year.year} activated as current`);
      fetchYears();
    } catch {
      toast.error('Failed to activate academic year');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Academic Years</h3>
          <p className="text-xs text-muted-foreground">Manage academic years. Cannot delete if associated data exists (offerings, intakes, regulations).</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetAddForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Academic Year
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Academic Year</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Academic Year *</Label>
                <Input
                  placeholder="e.g., 2026-27"
                  value={formYear}
                  onChange={(e) => setFormYear(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Institution Type *</Label>
                <Select value={formInstitutionType} onValueChange={setFormInstitutionType}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Autonomous" className="text-xs">Autonomous</SelectItem>
                    <SelectItem value="Affiliated" className="text-xs">Affiliated</SelectItem>
                    <SelectItem value="University" className="text-xs">University</SelectItem>
                    <SelectItem value="Deemed to be University" className="text-xs">Deemed to be University</SelectItem>
                    <SelectItem value="Government" className="text-xs">Government</SelectItem>
                    <SelectItem value="Private" className="text-xs">Private</SelectItem>
                    <SelectItem value="Aided" className="text-xs">Aided</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowAddDialog(false); resetAddForm(); }}>Cancel</Button>
              <Button onClick={handleAdd} disabled={submitting}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {loading ? (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground text-sm">
              Loading academic years...
            </CardContent>
          </Card>
        ) : years.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No academic years found. Click "Add Academic Year" above to create one.
            </CardContent>
          </Card>
        ) : (
          years.map((year) => {
          const isCurrent = year.status === 'active';
          const persisted = hasPersistedData(year.id);
          return (
            <Card key={year.id} className={isCurrent ? 'border-primary/50 bg-primary/5' : ''}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${isCurrent ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Calendar className={`h-4 w-4 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{year.year}</p>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-violet-500/30 text-violet-600 dark:text-violet-400 bg-violet-500/5">
                        {year.institutionType}
                      </Badge>
                      {isCurrent ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] px-1.5 py-0">
                          Current
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-5 text-[10px] px-2 py-0 border-dashed hover:border-primary hover:text-primary"
                          onClick={() => handleActivate(year)}
                          disabled={submitting}
                        >
                          Set as Current
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {year.startDate ? new Date(year.startDate).toLocaleDateString() : ''} - {year.endDate ? new Date(year.endDate).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(year)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${persisted ? 'text-muted-foreground/40 cursor-not-allowed' : 'text-destructive hover:text-destructive'}`}
                    disabled={persisted || submitting}
                    onClick={() => !persisted && openDelete(year)}
                    title={persisted ? 'Cannot delete: has associated data' : 'Delete academic year'}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { setShowEditDialog(open); if (!open) { setEditingYear(null); resetAddForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Academic Year</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Academic Year *</Label>
              <Input
                placeholder="e.g., 2026-27"
                value={formYear}
                onChange={(e) => setFormYear(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
              />
            </div>              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Institution Type *</Label>
                <Select value={formInstitutionType} onValueChange={setFormInstitutionType}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Autonomous" className="text-xs">Autonomous</SelectItem>
                    <SelectItem value="Affiliated" className="text-xs">Affiliated</SelectItem>
                    <SelectItem value="University" className="text-xs">University</SelectItem>
                    <SelectItem value="Deemed to be University" className="text-xs">Deemed to be University</SelectItem>
                    <SelectItem value="Government" className="text-xs">Government</SelectItem>
                    <SelectItem value="Private" className="text-xs">Private</SelectItem>
                    <SelectItem value="Aided" className="text-xs">Aided</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingYear(null); resetAddForm(); }}>Cancel</Button>
              <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => { setShowDeleteDialog(open); if (!open) setDeletingYear(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Academic Year</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            Are you sure you want to delete <strong>{deletingYear?.year}</strong>?
            {deletingYear && hasPersistedData(deletingYear.id) && (
              <span className="block mt-2 text-destructive">
                This academic year has associated data (program offerings, intakes, or regulations) and cannot be deleted.
              </span>
            )}
            {deletingYear && !hasPersistedData(deletingYear.id) && (
              <span className="block mt-2">This action cannot be undone.</span>
            )}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setDeletingYear(null); }}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletingYear ? hasPersistedData(deletingYear.id) : true}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Programs Tab
const ProgramsTab = () => {
  const [programs, setPrograms] = useState<Program[]>(masterPrograms);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Add Custom Program Form State
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formLevel, setFormLevel] = useState('');
  const [formDuration, setFormDuration] = useState('3');
  const [formStatus, setFormStatus] = useState('active');

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await institutionAdminService.getPrograms();
      if (Array.isArray(data)) {
        const mapped: Program[] = data.map((item) => ({
          id: String(item.id),
          programCode: item.code,
          name: item.name,
          level: item.level,
          duration: item.durationYears ?? 3,
          status: item.status === 'ACTIVE' ? 'active' : 'inactive',
          enabled: item.status === 'ACTIVE',
          isCustom: item.isCustom ?? false,
        }));
        setPrograms(mapped);
      }
    } catch {
      // Fallback to local masterPrograms if offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const resetForm = () => {
    setFormCode('');
    setFormName('');
    setFormLevel('');
    setFormDuration('3');
    setFormStatus('active');
  };

  const handleAddProgram = async () => {
    if (!formCode.trim() || !formName.trim() || !formLevel) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await institutionAdminService.createProgram({
        programCode: formCode.trim(),
        code: formCode.trim(),
        name: formName.trim(),
        level: formLevel,
        duration: Number(formDuration) || 3,
        durationYears: Number(formDuration) || 3,
        isCustom: true,
        status: formStatus === 'active' ? 'ACTIVE' : 'INACTIVE',
      });
      toast.success('Custom program added successfully');
      setShowAddDialog(false);
      resetForm();
      fetchPrograms();
    } catch {
      toast.error('Failed to add program');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleProgram = async (id: string) => {
    const idNum = Number(id);
    if (!isNaN(idNum)) {
      try {
        await institutionAdminService.toggleProgram(idNum);
        toast.success('Program status updated');
        fetchPrograms();
      } catch {
        toast.error('Failed to update program status');
      }
    } else {
      setPrograms((prev) =>
        prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled, status: p.enabled ? 'inactive' : 'active' } : p))
      );
      toast.success('Program status updated');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Programs</h3>
        <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Program
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Program</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Program Code *</Label>
                <Input
                  placeholder="e.g., BSC"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Program Name *</Label>
                <Input
                  placeholder="e.g., B.Sc"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Program Level *</Label>
                <Select value={formLevel} onValueChange={setFormLevel}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UG">UG</SelectItem>
                    <SelectItem value="PG">PG</SelectItem>
                    <SelectItem value="Doctoral">Doctoral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (Years) *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 3"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleAddProgram} disabled={submitting}>Add Program</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Program Code</th>
              <th className="text-left py-3 px-4 font-medium">Program Name</th>
              <th className="text-left py-3 px-4 font-medium">Level</th>
              <th className="text-center py-3 px-4 font-medium">Duration</th>
              <th className="text-center py-3 px-4 font-medium">Status</th>
              <th className="text-center py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-muted-foreground">Loading programs...</td>
              </tr>
            ) : programs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">No programs found. Click "Add Custom Program" above to create one.</td>
              </tr>
            ) : programs.map((program) => (
              <tr key={program.id} className="border-t hover:bg-muted/50">
                <td className="py-3 px-4 font-mono text-xs">{program.programCode}</td>
                <td className="py-3 px-4 font-medium">
                  {program.name}
                  {program.isCustom && <Badge variant="outline" className="ml-2 text-xs">Custom</Badge>}
                </td>
                <td className="py-3 px-4">
                  <Badge variant="secondary">{program.level}</Badge>
                </td>
                <td className="py-3 px-4 text-center">{program.duration} Years</td>
                <td className="py-3 px-4 text-center">
                  <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                    {program.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-center">
                  <Switch checked={program.enabled} onCheckedChange={() => toggleProgram(program.id)} className="scale-75" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Departments Tab
const DepartmentsTab = () => {
  const [depts, setDepts] = useState<Department[]>(departments);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formProgramId, setFormProgramId] = useState('');
  const [formEstYear, setFormEstYear] = useState('');
  const [formStatus, setFormStatus] = useState('active');

  const fetchDepts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await institutionAdminService.getDepartments();
      if (Array.isArray(data)) {
        const mapped: Department[] = data.map((item) => ({
          id: String(item.id),
          code: item.code,
          name: item.name,
          program: item.programName || 'Engineering',
          programId: item.programId ? String(item.programId) : undefined,
          establishedYear: item.establishedYear,
          status: item.status === 'ACTIVE' ? 'active' : 'inactive',
          enabled: item.status === 'ACTIVE',
          isCustom: item.isCustom ?? false,
        }));
        setDepts(mapped);
      }
    } catch {
      // Fallback to local departments array if offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepts();
  }, [fetchDepts]);

  const filtered = depts.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormCode('');
    setFormName('');
    setFormProgramId('');
    setFormEstYear('');
    setFormStatus('active');
  };

  const handleAddDepartment = async () => {
    if (!formCode.trim() || !formName.trim()) {
      toast.error('Please fill in required fields');
      return;
    }
    setSubmitting(true);
    try {
      await institutionAdminService.createDepartment({
        code: formCode.trim(),
        name: formName.trim(),
        programId: formProgramId ? Number(formProgramId) : undefined,
        establishedYear: formEstYear ? Number(formEstYear) : undefined,
        status: formStatus === 'active' ? 'ACTIVE' : 'INACTIVE',
      });
      toast.success('Custom department added successfully');
      setShowAddDialog(false);
      resetForm();
      fetchDepts();
    } catch {
      toast.error('Failed to add department');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDept = async (id: string) => {
    const idNum = Number(id);
    if (!isNaN(idNum)) {
      try {
        await institutionAdminService.toggleDepartment(idNum);
        toast.success('Department status updated');
        fetchDepts();
      } catch {
        toast.error('Failed to update department status');
      }
    } else {
      setDepts((prev) =>
        prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled, status: d.enabled ? 'inactive' : 'active' } : d))
      );
      toast.success('Department status updated');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Department Code *</Label>
                <Input
                  placeholder="e.g., AERO"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Department Name *</Label>
                <Input
                  placeholder="e.g., Aerospace Engineering"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Program</Label>
                <Select value={formProgramId} onValueChange={setFormProgramId}>
                  <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                  <SelectContent>
                    {masterPrograms.filter((p) => p.status === 'active').map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Established Year</Label>
                <Input
                  type="number"
                  placeholder="e.g., 2020"
                  value={formEstYear}
                  onChange={(e) => setFormEstYear(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleAddDepartment} disabled={submitting}>Add Department</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Code</th>
              <th className="text-left py-3 px-4 font-medium">Department Name</th>
              <th className="text-left py-3 px-4 font-medium">Program</th>
              <th className="text-center py-3 px-4 font-medium">Est. Year</th>
              <th className="text-center py-3 px-4 font-medium">Status</th>
              <th className="text-center py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-muted-foreground">Loading departments...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">No departments found. Click "Add Custom Department" above to create one.</td>
              </tr>
            ) : filtered.map((dept) => (
              <tr key={dept.id} className="border-t hover:bg-muted/50">
                <td className="py-3 px-4 font-mono text-xs">{dept.code}</td>
                <td className="py-3 px-4 font-medium">{dept.name}</td>
                <td className="py-3 px-4">{dept.program}</td>
                <td className="py-3 px-4 text-center">{dept.establishedYear || '-'}</td>
                <td className="py-3 px-4 text-center">
                  <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>
                    {dept.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-center">
                  <Switch checked={dept.enabled} onCheckedChange={() => toggleDept(dept.id)} className="scale-75" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Specializations Tab
const SpecializationsTab = () => {
  const [specs, setSpecs] = useState<Specialization[]>(specializations);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDeptId, setFormDeptId] = useState('');
  const [formStatus, setFormStatus] = useState('active');

  const fetchSpecs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await institutionAdminService.getSpecializations();
      if (Array.isArray(data)) {
        const mapped: Specialization[] = data.map((item) => ({
          id: String(item.id),
          name: item.name,
          departmentId: String(item.departmentId),
          departmentName: item.departmentName || 'Department',
          status: item.status === 'ACTIVE' ? 'active' : 'inactive',
          enabled: item.status === 'ACTIVE',
        }));
        setSpecs(mapped);
      }
    } catch {
      // Fallback to local specializations array if offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecs();
  }, [fetchSpecs]);

  const grouped = specs.reduce<Record<string, Specialization[]>>((acc, s) => {
    const deptName = s.departmentName || 'Department';
    if (!acc[deptName]) acc[deptName] = [];
    acc[deptName].push(s);
    return acc;
  }, {});

  const resetForm = () => {
    setFormName('');
    setFormDeptId('');
    setFormStatus('active');
  };

  const handleAddSpec = async () => {
    if (!formName.trim() || !formDeptId) {
      toast.error('Please fill in required fields');
      return;
    }
    setSubmitting(true);
    try {
      await institutionAdminService.createSpecialization({
        name: formName.trim(),
        departmentId: Number(formDeptId),
        status: formStatus === 'active' ? 'ACTIVE' : 'INACTIVE',
      });
      toast.success('Specialization added successfully');
      setShowAddDialog(false);
      resetForm();
      fetchSpecs();
    } catch {
      toast.error('Failed to add specialization');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSpec = async (id: string) => {
    const idNum = Number(id);
    if (!isNaN(idNum)) {
      try {
        await institutionAdminService.toggleSpecialization(idNum);
        toast.success('Specialization status updated');
        fetchSpecs();
      } catch {
        toast.error('Failed to update specialization status');
      }
    } else {
      setSpecs((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled, status: s.enabled ? 'inactive' : 'active' } : s)));
      toast.success('Specialization updated');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Department Specializations</h3>
        <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Specialization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Specialization</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Specialization Name *</Label>
                <Input
                  placeholder="e.g., Machine Learning"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select value={formDeptId} onValueChange={setFormDeptId}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.filter((d) => d.status === 'active').map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.code} - {d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleAddSpec} disabled={submitting}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground text-sm">
              Loading specializations...
            </CardContent>
          </Card>
        ) : Object.keys(grouped).length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No specializations found. Click "Add Specialization" above to create one.
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([dept, items]) => (
            <Card key={dept}>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  {dept}
                  <Badge variant="outline" className="ml-2 text-xs">{items.length} specializations</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {items.map((spec) => (
                    <div key={spec.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{spec.name}</span>
                        <Badge variant={spec.status === 'active' ? 'default' : 'secondary'} className="text-xs scale-90">
                          {spec.status}
                        </Badge>
                      </div>
                      <Switch checked={spec.enabled} onCheckedChange={() => toggleSpec(spec.id)} className="scale-75" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================
// ACADEMIC REGULATIONS - MULTI-STEP FORM WIZARD
// ============================================================

const emptyRegulationForm = (): AcademicRegulation => ({
  id: `REG-${String(Date.now()).slice(-3)}`,
  regulationCode: '',
  regulationName: '',
  program: '',
  programId: '',
  academicYearIntroduced: '',
  effectiveFromBatch: '',
  effectiveToBatch: '',
  duration: 4,
  status: 'active',
  creditStructure: {
    totalCredits: 160,
    coreCredits: 0,
    professionalElectiveCredits: 0,
    openElectiveCredits: 0,
    laboratoryCredits: 0,
    projectCredits: 0,
    internshipCredits: 0,
  },
  evaluationScheme: {
    internalMarks: 40,
    externalMarks: 60,
    passingMarks: 50,
    gradingSystem: 'CGPA Based',
    cgpaScale: 10,
    maxPercentage: 100,
  },
  internshipRequirements: {
    internshipMandatory: true,
    internshipDuration: '8 weeks',
    industryTrainingMandatory: false,
  },
  projectRequirements: {
    miniProjectMandatory: true,
    majorProjectMandatory: true,
    capstoneProjectMandatory: false,
  },
  approvals: {
    approvedBy: '',
    approvalDate: '',
    bosApproval: '',
    academicCouncilApproval: '',
  },
  documents: [],
});

const REGULATION_STEPS = [
  { id: 'basic-info', label: 'Basic Information', icon: BookOpen, description: 'Regulation code, name, program & duration' },
  { id: 'credit-structure', label: 'Credit Structure', icon: Layers, description: 'Total, core, elective & lab credits' },
  { id: 'evaluation', label: 'Evaluation Scheme', icon: ClipboardCheck, description: 'Marks distribution & grading system' },
  { id: 'internship', label: 'Internship Requirements', icon: Briefcase, description: 'Internship mandatory, duration & training' },
  { id: 'project', label: 'Project Requirements', icon: GraduationCap, description: 'Mini, major & capstone projects' },
  { id: 'approvals', label: 'Approvals', icon: Shield, description: 'Approving bodies & reference numbers' },
  { id: 'documents', label: 'Documents', icon: FileText, description: 'Upload evidence & supporting docs' },
];

const AcademicRegulationsTab = () => {
  const [regs, setRegs] = useState<AcademicRegulation[]>(academicRegulations);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewReg, setViewReg] = useState<AcademicRegulation | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<AcademicRegulation>(emptyRegulationForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; type: string; size: number }>>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const fetchRegulations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await institutionAdminService.getRegulations();
      if (Array.isArray(data)) {
        const mapped: AcademicRegulation[] = data.map((item) => ({
          id: String(item.id),
          regulationCode: item.regulationCode || `REG-${item.id}`,
          regulationName: item.regulationName || `Regulation ${item.id}`,
          program: item.programName || 'Engineering',
          programId: String(item.programId),
          academicYearIntroduced: item.academicYearIntroduced || '2024-25',
          effectiveFromBatch: item.effectiveFromBatch || '2024',
          effectiveToBatch: item.effectiveToBatch || '2028',
          duration: item.duration || 4,
          status: item.status === 'ACTIVE' ? 'active' : 'inactive',
          creditStructure: {
            totalCredits: item.totalCredits || 160,
            coreCredits: item.coreCredits || 80,
            professionalElectiveCredits: item.professionalElectiveCredits || 24,
            openElectiveCredits: item.openElectiveCredits || 12,
            laboratoryCredits: item.laboratoryCredits || 20,
            projectCredits: item.projectCredits || 16,
            internshipCredits: item.internshipCredits || 8,
          },
          evaluationScheme: {
            internalMarks: item.internalMarks || 40,
            externalMarks: item.externalMarks || 60,
            passingMarks: item.passingMarks || 50,
            gradingSystem: item.gradingSystem || 'CGPA Based',
            cgpaScale: item.cgpaScale || 10,
            maxPercentage: 100,
          },
          internshipRequirements: {
            internshipMandatory: item.internshipMandatory ?? true,
            internshipDuration: item.internshipDuration || '8 weeks',
            industryTrainingMandatory: item.industryTrainingMandatory ?? false,
          },
          projectRequirements: {
            miniProjectMandatory: item.miniProjectMandatory ?? true,
            majorProjectMandatory: item.majorProjectMandatory ?? true,
            capstoneProjectMandatory: false,
          },
          approvals: {
            approvedBy: 'Academic Council',
            approvalDate: '2024-06-15',
            bosApproval: 'BOS-2024-01',
            academicCouncilApproval: 'AC-2024-05',
          },
          documents: [],
        }));
        setRegs(mapped);
      }
    } catch {
      // Fallback to local academicRegulations array if offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegulations();
  }, [fetchRegulations]);

  const ACCEPTED_FILE_TYPES = '.doc,.docx,.pdf,.png,.jpg,.jpeg,.gif,.svg,.xlsx,.xls,.ppt,.pptx,.txt,.zip';
  const ACCEPTED_MIME_TYPES = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
  ];

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf')) return BookOpen;
    if (type.includes('word') || type.includes('document')) return FileText;
    if (type.includes('spreadsheet') || type.includes('excel')) return File;
    if (type.includes('presentation') || type.includes('powerpoint')) return File;
    return File;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isValidFile = (file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedExts = ACCEPTED_FILE_TYPES.split(',');
    return acceptedExts.includes(ext) || ACCEPTED_MIME_TYPES.includes(file.type);
  };

  const handleFileDrop = (files: FileList) => {
    const newFiles: Array<{ name: string; type: string; size: number }> = [];
    let hasInvalid = false;

    Array.from(files).forEach((file) => {
      if (isValidFile(file) && !form.documents.includes(file.name)) {
        newFiles.push({ name: file.name, type: file.type, size: file.size });
      } else if (!isValidFile(file)) {
        hasInvalid = true;
      }
    });

    if (hasInvalid) {
      toast.error('Some files were skipped due to unsupported format');
    }

    if (newFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setForm((prev) => ({
        ...prev,
        documents: [...prev.documents, ...newFiles.map((f) => f.name)],
      }));
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d !== fileName),
    }));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (dragCounterRef.current === 1) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setDragActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileDrop(e.dataTransfer.files);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleFileBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileDrop(e.target.files);
    }
    e.target.value = '';
  };

  // Check if a regulation code or name already exists (excluding the current editing record)
  const checkDuplicate = (): string | null => {
    const code = form.regulationCode.trim().toLowerCase();
    const name = form.regulationName.trim().toLowerCase();
    if (!code && !name) return null;
    const duplicate = regs.find((r) => {
      if (editingId && r.id === editingId) return false; // skip current record when editing
      const rCode = r.regulationCode.toLowerCase();
      const rName = r.regulationName.toLowerCase();
      return rCode === code || rName === name;
    });
    if (duplicate) {
      if (duplicate.regulationCode.toLowerCase() === code) return 'regulationCode';
      if (duplicate.regulationName.toLowerCase() === name) return 'regulationName';
    }
    return null;
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    const e: Record<string, string> = {};
    switch (step) {
      case 0: // Basic Info
        if (!form.regulationCode.trim()) e.regulationCode = 'Required';
        else {
          const dupField = checkDuplicate();
          if (dupField === 'regulationCode') e.regulationCode = `Regulation code "${form.regulationCode}" already exists`;
          if (dupField === 'regulationName') e.regulationName = `Regulation name "${form.regulationName}" already exists`;
        }
        if (!form.regulationName.trim()) e.regulationName = 'Required';
        else {
          const dupField = checkDuplicate();
          if (dupField === 'regulationName') e.regulationName = `Regulation name "${form.regulationName}" already exists`;
        }
        if (!form.programId) e.programId = 'Required';
        if (!form.academicYearIntroduced) e.academicYearIntroduced = 'Required';
        if (!form.effectiveFromBatch.trim()) e.effectiveFromBatch = 'Required';
        if (!form.duration) e.duration = 'Required';
        break;
      case 1: // Credit Structure
        if (!form.creditStructure.totalCredits) e.totalCredits = 'Required';
        break;
      case 2: // Evaluation Scheme
        if (!form.evaluationScheme.internalMarks) e.internalMarks = 'Required';
        if (!form.evaluationScheme.externalMarks) e.externalMarks = 'Required';
        if (!form.evaluationScheme.passingMarks) e.passingMarks = 'Required';
        if (!form.evaluationScheme.gradingSystem.trim()) e.gradingSystem = 'Required';
        break;
      case 3: // Internship (no required fields - defaults exist)
        break;
      case 4: // Project (no required fields - defaults exist)
        break;
      case 5: // Approvals
        if (!form.approvals.approvedBy.trim()) e.approvedBy = 'Required';
        if (!form.approvals.approvalDate) e.approvalDate = 'Required';
        if (!form.approvals.bosApproval.trim()) e.bosApproval = 'Required';
        if (!form.approvals.academicCouncilApproval.trim()) e.academicCouncilApproval = 'Required';
        break;
      case 6: // Documents (no required fields)
        break;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Update nested field helper
  const updateField = (section: string, field: string, value: any) => {
    setForm((prev) => {
      if (section === 'root') {
        return { ...prev, [field]: value };
      }
      return {
        ...prev,
        [section]: { ...(prev as any)[section], [field]: value },
      };
    });
    // Clear error for the field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, REGULATION_STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const openAddDialog = () => {
    setForm(emptyRegulationForm());
    setEditingId(null);
    setCurrentStep(0);
    setErrors({});
    setUploadedFiles([]);
    setShowAddDialog(true);
  };

  const openEditDialog = (reg: AcademicRegulation) => {
    setForm(JSON.parse(JSON.stringify(reg)));
    setEditingId(reg.id);
    setCurrentStep(0);
    setErrors({});
    // Restore uploaded files from existing documents
    setUploadedFiles(reg.documents.map((d) => ({ name: d, type: 'application/octet-stream', size: 0 })));
    setShowAddDialog(true);
  };

  const handleSave = () => {
    // Validate all steps before saving
    for (let i = 0; i < REGULATION_STEPS.length; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        toast.error(`Please fix errors in ${REGULATION_STEPS[i].label}`);
        return;
      }
    }

    const payload = {
      regulationCode: form.regulationCode,
      regulationName: form.regulationName,
      programId: Number(form.programId) || 1,
      academicYearIntroduced: form.academicYearIntroduced,
      effectiveFromBatch: form.effectiveFromBatch,
      effectiveToBatch: form.effectiveToBatch,
      duration: form.duration,
      status: (form.status === 'active' ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
      totalCredits: form.creditStructure.totalCredits,
      coreCredits: form.creditStructure.coreCredits,
      professionalElectiveCredits: form.creditStructure.professionalElectiveCredits,
      openElectiveCredits: form.creditStructure.openElectiveCredits,
      laboratoryCredits: form.creditStructure.laboratoryCredits,
      projectCredits: form.creditStructure.projectCredits,
      internshipCredits: form.creditStructure.internshipCredits,
      internalMarks: form.evaluationScheme.internalMarks,
      externalMarks: form.evaluationScheme.externalMarks,
      passingMarks: form.evaluationScheme.passingMarks,
      gradingSystem: form.evaluationScheme.gradingSystem,
      cgpaScale: form.evaluationScheme.cgpaScale,
      internshipMandatory: form.internshipRequirements.internshipMandatory,
      internshipDuration: form.internshipRequirements.internshipDuration,
      industryTrainingMandatory: form.internshipRequirements.industryTrainingMandatory,
      miniProjectMandatory: form.projectRequirements.miniProjectMandatory,
      majorProjectMandatory: form.projectRequirements.majorProjectMandatory,
    };

    setSubmitting(true);
    const savePromise = editingId && !isNaN(Number(editingId))
      ? institutionAdminService.updateRegulation(Number(editingId), payload)
      : institutionAdminService.createRegulation(payload);

    savePromise
      .then(() => {
        toast.success(editingId ? 'Regulation updated successfully' : 'Regulation added successfully');
        setShowAddDialog(false);
        setEditingId(null);
        fetchRegulations();
      })
      .catch(() => {
        toast.error('Failed to save regulation');
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleDelete = async (id: string) => {
    const idNum = Number(id);
    if (!isNaN(idNum)) {
      try {
        await institutionAdminService.deleteRegulation(idNum);
        toast.success('Regulation deleted successfully');
        fetchRegulations();
      } catch {
        toast.error('Failed to delete regulation');
      }
    } else {
      setRegs((prev) => prev.filter((r) => r.id !== id));
      toast.success('Regulation deleted');
    }
    setDeleteConfirm(null);
  };


  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Regulation Code <span className="text-red-500">*</span></Label>
                <Input
                  value={form.regulationCode}
                  onChange={(e) => updateField('root', 'regulationCode', e.target.value)}
                  className={`h-9 text-sm ${errors.regulationCode ? 'border-red-500' : ''}`}
                  placeholder="e.g., R24"
                />
                {errors.regulationCode && <p className="text-[10px] text-red-500">{errors.regulationCode}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Regulation Name <span className="text-red-500">*</span></Label>
                <Input
                  value={form.regulationName}
                  onChange={(e) => updateField('root', 'regulationName', e.target.value)}
                  className={`h-9 text-sm ${errors.regulationName ? 'border-red-500' : ''}`}
                  placeholder="e.g., Regulation 2024"
                />
                {errors.regulationName && <p className="text-[10px] text-red-500">{errors.regulationName}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Program <span className="text-red-500">*</span></Label>
                <Select
                  value={form.programId}
                  onValueChange={(v) => updateField('root', 'programId', v)}
                >
                  <SelectTrigger className={`h-9 text-sm ${errors.programId ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {masterPrograms.filter((p) => p.status === 'active').map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.programId && <p className="text-[10px] text-red-500">{errors.programId}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Academic Year Introduced <span className="text-red-500">*</span></Label>
                <Select
                  value={form.academicYearIntroduced}
                  onValueChange={(v) => updateField('root', 'academicYearIntroduced', v)}
                >
                  <SelectTrigger className={`h-9 text-sm ${errors.academicYearIntroduced ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((y) => (
                      <SelectItem key={y.id} value={y.year} className="text-xs">{y.year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.academicYearIntroduced && <p className="text-[10px] text-red-500">{errors.academicYearIntroduced}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Effective From Batch <span className="text-red-500">*</span></Label>
                <Input
                  value={form.effectiveFromBatch}
                  onChange={(e) => updateField('root', 'effectiveFromBatch', e.target.value)}
                  className={`h-9 text-sm ${errors.effectiveFromBatch ? 'border-red-500' : ''}`}
                  placeholder="e.g., 2024"
                />
                {errors.effectiveFromBatch && <p className="text-[10px] text-red-500">{errors.effectiveFromBatch}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Effective To Batch</Label>
                <Input
                  value={form.effectiveToBatch}
                  onChange={(e) => updateField('root', 'effectiveToBatch', e.target.value)}
                  className="h-9 text-sm"
                  placeholder="e.g., 2027"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Duration (Years) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={form.duration}
                  onChange={(e) => updateField('root', 'duration', parseInt(e.target.value) || 0)}
                  className={`h-9 text-sm ${errors.duration ? 'border-red-500' : ''}`}
                  min={1}
                  max={8}
                />
                {errors.duration && <p className="text-[10px] text-red-500">{errors.duration}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v: 'active' | 'inactive') => updateField('root', 'status', v)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active" className="text-xs">Active</SelectItem>
                    <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 1: // Credit Structure
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Total Credits <span className="text-red-500">*</span></Label>
                <Input type="number" value={form.creditStructure.totalCredits}
                  onChange={(e) => updateField('creditStructure', 'totalCredits', parseInt(e.target.value) || 0)}
                  className={`h-9 text-sm ${errors.totalCredits ? 'border-red-500' : ''}`} />
                {errors.totalCredits && <p className="text-[10px] text-red-500">{errors.totalCredits}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Core Credits</Label>
                <Input type="number" value={form.creditStructure.coreCredits}
                  onChange={(e) => updateField('creditStructure', 'coreCredits', parseInt(e.target.value) || 0)}
                  className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Professional Elective Credits</Label>
                <Input type="number" value={form.creditStructure.professionalElectiveCredits}
                  onChange={(e) => updateField('creditStructure', 'professionalElectiveCredits', parseInt(e.target.value) || 0)}
                  className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Open Elective Credits</Label>
                <Input type="number" value={form.creditStructure.openElectiveCredits}
                  onChange={(e) => updateField('creditStructure', 'openElectiveCredits', parseInt(e.target.value) || 0)}
                  className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Laboratory Credits</Label>
                <Input type="number" value={form.creditStructure.laboratoryCredits}
                  onChange={(e) => updateField('creditStructure', 'laboratoryCredits', parseInt(e.target.value) || 0)}
                  className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Project Credits</Label>
                <Input type="number" value={form.creditStructure.projectCredits}
                  onChange={(e) => updateField('creditStructure', 'projectCredits', parseInt(e.target.value) || 0)}
                  className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Internship Credits</Label>
                <Input type="number" value={form.creditStructure.internshipCredits}
                  onChange={(e) => updateField('creditStructure', 'internshipCredits', parseInt(e.target.value) || 0)}
                  className="h-9 text-sm" />
              </div>
            </div>
            {/* Credit breakdown summary */}
            <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Sum of sub-credits:</span>
                <span className="font-semibold text-indigo-600">
                  {form.creditStructure.coreCredits +
                    form.creditStructure.professionalElectiveCredits +
                    form.creditStructure.openElectiveCredits +
                    form.creditStructure.laboratoryCredits +
                    form.creditStructure.projectCredits +
                    form.creditStructure.internshipCredits}
                </span>
              </div>
            </div>
          </div>
        );

      case 2: // Evaluation Scheme
        const isCGPA = form.evaluationScheme.gradingSystem === 'CGPA Based';
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Internal Marks <span className="text-red-500">*</span></Label>
                <Input type="number" value={form.evaluationScheme.internalMarks}
                  onChange={(e) => updateField('evaluationScheme', 'internalMarks', parseInt(e.target.value) || 0)}
                  className={`h-9 text-sm ${errors.internalMarks ? 'border-red-500' : ''}`} />
                {errors.internalMarks && <p className="text-[10px] text-red-500">{errors.internalMarks}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">External Marks <span className="text-red-500">*</span></Label>
                <Input type="number" value={form.evaluationScheme.externalMarks}
                  onChange={(e) => updateField('evaluationScheme', 'externalMarks', parseInt(e.target.value) || 0)}
                  className={`h-9 text-sm ${errors.externalMarks ? 'border-red-500' : ''}`} />
                {errors.externalMarks && <p className="text-[10px] text-red-500">{errors.externalMarks}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Passing Marks (%) <span className="text-red-500">*</span></Label>
                <Input type="number" value={form.evaluationScheme.passingMarks}
                  onChange={(e) => updateField('evaluationScheme', 'passingMarks', parseInt(e.target.value) || 0)}
                  className={`h-9 text-sm ${errors.passingMarks ? 'border-red-500' : ''}`} />
                {errors.passingMarks && <p className="text-[10px] text-red-500">{errors.passingMarks}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Grading System <span className="text-red-500">*</span></Label>
                <Select
                  value={form.evaluationScheme.gradingSystem}
                  onValueChange={(v) => updateField('evaluationScheme', 'gradingSystem', v)}
                >
                  <SelectTrigger className={`h-9 text-sm ${errors.gradingSystem ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select grading system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CGPA Based" className="text-xs">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-3.5 w-3.5" />
                        CGPA Based
                      </div>
                    </SelectItem>
                    <SelectItem value="Percentage Based" className="text-xs">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-3.5 w-3.5" />
                        Percentage Based
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.gradingSystem && <p className="text-[10px] text-red-500">{errors.gradingSystem}</p>}
              </div>
              {isCGPA ? (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">CGPA Scale</Label>
                  <div className="relative">
                    <Input type="number" value={form.evaluationScheme.cgpaScale}
                      onChange={(e) => updateField('evaluationScheme', 'cgpaScale', parseInt(e.target.value) || 0)}
                      className="h-9 text-sm pr-8" min={0} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
                      CGPA
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground">Maximum CGPA value for the grading scale</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Max Percentage</Label>
                  <div className="relative">
                    <Input type="number" value={form.evaluationScheme.maxPercentage}
                      onChange={(e) => updateField('evaluationScheme', 'maxPercentage', parseInt(e.target.value) || 0)}
                      className="h-9 text-sm pr-8" min={0} max={100} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
                      %
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground">Maximum percentage (typically 100)</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3: // Internship Requirements
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label className="text-xs font-medium">Internship Mandatory</Label>
                    <p className="text-[10px] text-muted-foreground">Is internship required for graduation?</p>
                  </div>
                  <Switch
                    checked={form.internshipRequirements.internshipMandatory}
                    onCheckedChange={(v) => updateField('internshipRequirements', 'internshipMandatory', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Internship Duration</Label>
                  <Select
                    value={form.internshipRequirements.internshipDuration}
                    onValueChange={(v) => updateField('internshipRequirements', 'internshipDuration', v)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4 weeks" className="text-xs">4 Weeks</SelectItem>
                      <SelectItem value="6 weeks" className="text-xs">6 Weeks</SelectItem>
                      <SelectItem value="8 weeks" className="text-xs">8 Weeks</SelectItem>
                      <SelectItem value="12 weeks" className="text-xs">12 Weeks</SelectItem>
                      <SelectItem value="6 months" className="text-xs">6 Months</SelectItem>
                      <SelectItem value="1 year" className="text-xs">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <Label className="text-xs font-medium">Industry Training Mandatory</Label>
                    <p className="text-[10px] text-muted-foreground">Is industry training required?</p>
                  </div>
                  <Switch
                    checked={form.internshipRequirements.industryTrainingMandatory}
                    onCheckedChange={(v) => updateField('internshipRequirements', 'industryTrainingMandatory', v)}
                  />
                </div>
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400">Internship Credits</p>
                      <p className="text-[9px] text-amber-600/70 dark:text-amber-500/70">
                        Internship credits ({form.creditStructure.internshipCredits}) are set in the Credit Structure step.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Project Requirements
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label className="text-xs font-medium">Mini Project Mandatory</Label>
                  <p className="text-[10px] text-muted-foreground">Students must complete a mini project</p>
                </div>
                <Switch
                  checked={form.projectRequirements.miniProjectMandatory}
                  onCheckedChange={(v) => updateField('projectRequirements', 'miniProjectMandatory', v)}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label className="text-xs font-medium">Major Project Mandatory</Label>
                  <p className="text-[10px] text-muted-foreground">Students must complete a major/final year project</p>
                </div>
                <Switch
                  checked={form.projectRequirements.majorProjectMandatory}
                  onCheckedChange={(v) => updateField('projectRequirements', 'majorProjectMandatory', v)}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label className="text-xs font-medium">Capstone Project Mandatory</Label>
                  <p className="text-[10px] text-muted-foreground">Students must complete a capstone project</p>
                </div>
                <Switch
                  checked={form.projectRequirements.capstoneProjectMandatory}
                  onCheckedChange={(v) => updateField('projectRequirements', 'capstoneProjectMandatory', v)}
                />
              </div>
            </div>
            <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-medium text-indigo-700 dark:text-indigo-400">Project Credits</p>
                  <p className="text-[9px] text-indigo-600/70 dark:text-indigo-500/70">
                    Project credits ({form.creditStructure.projectCredits}) are configured in the Credit Structure step.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Approvals
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Approved By <span className="text-red-500">*</span></Label>
                <Select
                  value={form.approvals.approvedBy}
                  onValueChange={(v) => updateField('approvals', 'approvedBy', v)}
                >
                  <SelectTrigger className={`h-9 text-sm ${errors.approvedBy ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select approving body" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic Council" className="text-xs">Academic Council</SelectItem>
                    <SelectItem value="Board of Studies" className="text-xs">Board of Studies</SelectItem>
                    <SelectItem value="Governing Body" className="text-xs">Governing Body</SelectItem>
                    <SelectItem value="University" className="text-xs">University</SelectItem>
                    <SelectItem value="IQAC" className="text-xs">IQAC</SelectItem>
                  </SelectContent>
                </Select>
                {errors.approvedBy && <p className="text-[10px] text-red-500">{errors.approvedBy}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Approval Date <span className="text-red-500">*</span></Label>
                <DatePicker
                  value={form.approvals.approvalDate}
                  onChange={(date) => updateField('approvals', 'approvalDate', date)}
                  placeholder="Select approval date"
                  className={`h-9 text-sm w-full ${errors.approvalDate ? 'border-red-500' : ''}`}
                />
                {errors.approvalDate && <p className="text-[10px] text-red-500">{errors.approvalDate}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">BoS Approval Reference <span className="text-red-500">*</span></Label>
                <Input
                  value={form.approvals.bosApproval}
                  onChange={(e) => updateField('approvals', 'bosApproval', e.target.value)}
                  className={`h-9 text-sm ${errors.bosApproval ? 'border-red-500' : ''}`}
                  placeholder="e.g., BoS/2024/02"
                />
                {errors.bosApproval && <p className="text-[10px] text-red-500">{errors.bosApproval}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Academic Council Reference <span className="text-red-500">*</span></Label>
                <Input
                  value={form.approvals.academicCouncilApproval}
                  onChange={(e) => updateField('approvals', 'academicCouncilApproval', e.target.value)}
                  className={`h-9 text-sm ${errors.academicCouncilApproval ? 'border-red-500' : ''}`}
                  placeholder="e.g., AC/2024/03"
                />
                {errors.academicCouncilApproval && <p className="text-[10px] text-red-500">{errors.academicCouncilApproval}</p>}
              </div>
            </div>
          </div>
        );

      case 6: // Documents / Evidence - Drag & Drop Upload
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Supporting Documents & Evidence</Label>
              <p className="text-[10px] text-muted-foreground">
                Upload regulation documents, BoS Minutes, Academic Council approvals, and other supporting evidence.
              </p>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={handleKeyDown}
              role="button"
              tabIndex={0}
              aria-label="Upload supporting documents. Click or drag and drop files here."
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer outline-none
                ${dragActive
                  ? 'border-primary bg-primary/5 scale-[1.01] shadow-lg ring-2 ring-primary/20'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary/40'
                }
                ${form.documents.length > 0 ? 'py-6' : 'py-12'}
                px-6`}
            >
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_FILE_TYPES}
                onChange={handleFileBrowse}
                className="hidden"
              />

              {/* Upload icon & text */}
              <div className={`flex flex-col items-center gap-2 transition-all ${form.documents.length > 0 ? 'scale-90' : ''}`}>
                <div className={`p-3 rounded-full transition-all duration-200
                  ${dragActive
                    ? 'bg-primary/20 text-primary scale-110'
                    : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {dragActive ? (
                    <UploadCloud className="h-8 w-8" />
                  ) : (
                    <Upload className="h-8 w-8" />
                  )}
                </div>
                <div className="text-center">
                  {dragActive ? (
                    <p className="text-sm font-semibold text-primary">Drop files here</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium">
                        <span className="text-primary">Click to browse</span> or drag & drop
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        DOC, DOCX, PDF, PNG, JPG, JPEG, GIF, SVG, XLSX, PPT, TXT, ZIP
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">
                    Uploaded Documents ({uploadedFiles.length})
                  </Label>
                  <span className="text-[10px] text-muted-foreground">
                    {formatFileSize(uploadedFiles.reduce((sum, f) => sum + f.size, 0))} total
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {uploadedFiles.map((file) => {
                    const FileIcon = getFileIcon(file.type);
                    const ext = file.name.split('.').pop()?.toUpperCase() || '';
                    return (
                      <div
                        key={file.name}
                        className="group flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:shadow-sm transition-all"
                      >
                        {/* File type icon with extension badge */}
                        <div className="relative">
                          <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                            <FileIcon className="h-4 w-4" />
                          </div>
                          <span className="absolute -bottom-1.5 -right-1.5 text-[7px] font-bold bg-primary/10 text-primary px-1 py-0 rounded">
                            {ext}
                          </span>
                        </div>

                        {/* File details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{file.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {file.size > 0 ? formatFileSize(file.size) : 'Document'}
                          </p>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveFile(file.name); }}
                          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                          title="Remove file"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state hint */}
            {uploadedFiles.length === 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400">Supported Formats</p>
                  <p className="text-[9px] text-amber-600/70 dark:text-amber-500/70 mt-0.5">
                    Upload documents such as Regulation Book (PDF/DOCX), Academic Council Approval, 
                    Board of Studies Minutes, Credit Structure Document, and other supporting evidence.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Academic Regulations</h3>
        <Button size="sm" onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Regulation
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Code</th>
              <th className="text-left py-3 px-4 font-medium">Name</th>
              <th className="text-left py-3 px-4 font-medium">Program</th>
              <th className="text-center py-3 px-4 font-medium">Batch</th>
              <th className="text-center py-3 px-4 font-medium">Credits</th>
              <th className="text-center py-3 px-4 font-medium">Status</th>
              <th className="text-center py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-muted-foreground">Loading regulations...</td>
              </tr>
            ) : regs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">No regulations found. Click "Add Regulation" above to create one.</td>
              </tr>
            ) : regs.map((reg) => (
              <tr key={reg.id} className="border-t hover:bg-muted/50">
                <td className="py-3 px-4 font-mono font-semibold">{reg.regulationCode}</td>
                <td className="py-3 px-4">{reg.regulationName}</td>
                <td className="py-3 px-4">{reg.program}</td>
                <td className="py-3 px-4 text-center text-xs">{reg.effectiveFromBatch} - {reg.effectiveToBatch}</td>
                <td className="py-3 px-4 text-center">{reg.creditStructure.totalCredits}</td>
                <td className="py-3 px-4 text-center">
                  <Badge variant={reg.status === 'active' ? 'default' : 'secondary'}>{reg.status}</Badge>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewReg(reg)} title="View details">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600" onClick={() => openEditDialog(reg)} title="Edit regulation">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleteConfirm(reg.id)} title="Delete regulation">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Delete Regulation</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete this regulation? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Multi-Step Add/Edit Wizard Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) setEditingId(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader className="pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base">
                {editingId ? `Edit Regulation: ${form.regulationCode || form.regulationName || 'New'}` : 'Add Academic Regulation'}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center gap-1 px-1 py-3 overflow-x-auto">
            {REGULATION_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = currentStep === idx;
              const isCompleted = idx < currentStep;
              return (
                <button
                  key={step.id}
                  onClick={() => { if (idx < currentStep || validateStep(currentStep)) setCurrentStep(idx); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all
                    ${isActive
                      ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                      : isCompleted
                        ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30'
                        : 'text-muted-foreground/50'
                    }`}
                >
                  <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold
                    ${isActive ? 'bg-primary text-primary-foreground' : isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground/50'}`}
                  >
                    {isCompleted ? <Check className="h-3 w-3" /> : idx + 1}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* Current Step Title & Description */}
          <div className="px-1">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = REGULATION_STEPS[currentStep].icon;
                return <Icon className="h-4 w-4 text-primary" />;
              })()}
              <div>
                <h4 className="text-sm font-semibold">{REGULATION_STEPS[currentStep].label}</h4>
                <p className="text-[10px] text-muted-foreground">{REGULATION_STEPS[currentStep].description}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Scrollable form content */}
          <div className="overflow-y-auto px-1" style={{ maxHeight: '50vh' }}>
            {renderStepContent()}
          </div>

          <Separator />

          {/* Navigation Footer */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setShowAddDialog(false); setEditingId(null); }}>
                Cancel
              </Button>
              {currentStep === REGULATION_STEPS.length - 1 ? (
                <Button size="sm" className="h-8 text-xs gap-1" onClick={handleSave}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {editingId ? 'Update Regulation' : 'Create Regulation'}
                </Button>
              ) : (
                <Button size="sm" className="h-8 text-xs gap-1" onClick={handleNext}>
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Regulation Dialog */}
      <Dialog open={!!viewReg} onOpenChange={() => setViewReg(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewReg?.regulationCode} - {viewReg?.regulationName}</DialogTitle>
          </DialogHeader>
          {viewReg && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label className="text-xs text-muted-foreground">Program</Label><p className="text-sm font-medium">{viewReg.program}</p></div>
                <div><Label className="text-xs text-muted-foreground">Duration</Label><p className="text-sm font-medium">{viewReg.duration} Years</p></div>
                <div><Label className="text-xs text-muted-foreground">Effective Batch</Label><p className="text-sm font-medium">{viewReg.effectiveFromBatch} - {viewReg.effectiveToBatch}</p></div>
                <div><Label className="text-xs text-muted-foreground">Status</Label><Badge variant={viewReg.status === 'active' ? 'default' : 'secondary'}>{viewReg.status}</Badge></div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Credit Structure</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Total Credits</p><p className="text-lg font-bold">{viewReg.creditStructure.totalCredits}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Core</p><p className="text-lg font-bold">{viewReg.creditStructure.coreCredits}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Prof. Elective</p><p className="text-lg font-bold">{viewReg.creditStructure.professionalElectiveCredits}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Open Elective</p><p className="text-lg font-bold">{viewReg.creditStructure.openElectiveCredits}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Laboratory</p><p className="text-lg font-bold">{viewReg.creditStructure.laboratoryCredits}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Project</p><p className="text-lg font-bold">{viewReg.creditStructure.projectCredits}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Internship</p><p className="text-lg font-bold">{viewReg.creditStructure.internshipCredits}</p></div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Evaluation Scheme</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Internal</p><p className="text-lg font-bold">{viewReg.evaluationScheme.internalMarks}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">External</p><p className="text-lg font-bold">{viewReg.evaluationScheme.externalMarks}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Passing</p><p className="text-lg font-bold">{viewReg.evaluationScheme.passingMarks}%</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Grading</p><p className="text-sm font-bold">{viewReg.evaluationScheme.gradingSystem}</p></div>
                  {viewReg.evaluationScheme.gradingSystem === 'CGPA Based' ? (
                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">CGPA Scale</p><p className="text-lg font-bold">{viewReg.evaluationScheme.cgpaScale}</p></div>
                  ) : (
                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Max Percentage</p><p className="text-lg font-bold">{viewReg.evaluationScheme.maxPercentage}%</p></div>
                  )}
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Internship Requirements</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Internship Mandatory</span><Badge variant={viewReg.internshipRequirements.internshipMandatory ? 'default' : 'secondary'}>{viewReg.internshipRequirements.internshipMandatory ? 'Yes' : 'No'}</Badge></div>
                    {viewReg.internshipRequirements.internshipDuration && <div className="flex justify-between text-sm"><span>Duration</span><span className="font-medium">{viewReg.internshipRequirements.internshipDuration}</span></div>}
                    <div className="flex justify-between text-sm"><span>Industry Training</span><Badge variant={viewReg.internshipRequirements.industryTrainingMandatory ? 'default' : 'secondary'}>{viewReg.internshipRequirements.industryTrainingMandatory ? 'Yes' : 'No'}</Badge></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3">Project Requirements</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Mini Project</span><Badge variant={viewReg.projectRequirements.miniProjectMandatory ? 'default' : 'secondary'}>{viewReg.projectRequirements.miniProjectMandatory ? 'Yes' : 'No'}</Badge></div>
                    <div className="flex justify-between text-sm"><span>Major Project</span><Badge variant={viewReg.projectRequirements.majorProjectMandatory ? 'default' : 'secondary'}>{viewReg.projectRequirements.majorProjectMandatory ? 'Yes' : 'No'}</Badge></div>
                    <div className="flex justify-between text-sm"><span>Capstone Project</span><Badge variant={viewReg.projectRequirements.capstoneProjectMandatory ? 'default' : 'secondary'}>{viewReg.projectRequirements.capstoneProjectMandatory ? 'Yes' : 'No'}</Badge></div>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Approvals</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Approved By</Label><p className="text-sm font-medium">{viewReg.approvals.approvedBy}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Approval Date</Label><p className="text-sm font-medium">{viewReg.approvals.approvalDate}</p></div>
                  <div><Label className="text-xs text-muted-foreground">BoS Approval</Label><p className="text-sm font-medium">{viewReg.approvals.bosApproval}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Academic Council</Label><p className="text-sm font-medium">{viewReg.approvals.academicCouncilApproval}</p></div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Documents</h4>
                <div className="flex flex-wrap gap-2">
                  {viewReg.documents.map((doc) => (
                    <Badge key={doc} variant="outline" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================================
// PROGRAM OFFERINGS TAB
// ============================================================

/** Generate the offering name: Program + Department + Specialization + Academic Year + Regulation */
const generateOfferingName = (
  programName: string,
  deptCode: string,
  specName: string,
  acYear: string,
  regCode: string
): string => {
  const parts = [programName, deptCode];
  if (specName && specName !== 'None') parts.push(getShortSpecName(specName));
  parts.push(acYear, regCode);
  return parts.join(' ');
};

/** Shorten specialization names for display */
function getShortSpecName(name: string): string {
  const map: Record<string, string> = {
    'Artificial Intelligence': 'AI',
    'Data Science': 'DS',
    'Cyber Security': 'CS',
    'Internet of Things': 'IoT',
    'Cloud Computing': 'CC',
    'Machine Learning': 'ML',
    'VLSI': 'VLSI',
    'Embedded Systems': 'ES',
    'Communication Systems': 'CS',
    'Robotics': 'Robotics',
    'Thermal Engineering': 'Thermal',
  };
  return map[name] || name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4);
}

const ProgramOfferingsTab = () => {
  const [offerings, setOfferings] = useState<ProgramOffering[]>(programOfferings);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterYear, setFilterYear] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);

  // Form state for add/edit
  const [offeringForm, setOfferingForm] = useState({
    academicYearId: '',
    programId: '',
    departmentId: '',
    specializationId: '',
    regulationId: '',
    duration: 4,
  });
  const [editingOfferingId, setEditingOfferingId] = useState<string | null>(null);
  const [deleteConfirmOffering, setDeleteConfirmOffering] = useState<string | null>(null);
  const [viewOffering, setViewOffering] = useState<ProgramOffering | null>(null);

  const fetchOfferings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await institutionAdminService.getProgramOfferings();
      if (Array.isArray(data)) {
        const mapped: ProgramOffering[] = data.map((item) => ({
          id: String(item.id),
          academicYear: item.academicYear || item.academicYearName || '2024-25',
          academicYearId: item.academicYearId ? String(item.academicYearId) : '',
          program: item.program || item.programName || 'Engineering',
          programId: item.programId ? String(item.programId) : '',
          department: item.department || item.departmentCode || item.departmentName || 'CSE',
          departmentId: item.departmentId ? String(item.departmentId) : '',
          specialization: item.specialization || item.specializationName || '',
          specializationId: item.specializationId ? String(item.specializationId) : undefined,
          regulation: item.regulation || item.regulationCode || item.regulationName || 'R24',
          regulationId: item.regulationId ? String(item.regulationId) : '',
          duration: item.durationYears || item.duration || 4,
          status: item.status === 'ACTIVE' ? 'active' : 'inactive',
          generatedName: item.generatedName || item.offeringName || `${item.program || 'Program'} ${item.department || ''} ${item.specialization ? item.specialization + ' ' : ''}${item.academicYear || ''}`,
        }));
        setOfferings(mapped);
      }
    } catch {
      // Fallback to local programOfferings array if offline
    } finally {
      setLoading(false);
    }
  }, []);

  const [liveYears, setLiveYears] = useState<Array<{ id: string; year: string }>>([]);
  const [livePrograms, setLivePrograms] = useState<Array<{ id: string; name: string }>>([]);
  const [liveDepts, setLiveDepts] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [liveSpecs, setLiveSpecs] = useState<Array<{ id: string; name: string }>>([]);
  const [liveRegs, setLiveRegs] = useState<Array<{ id: string; regulationCode: string; regulationName: string }>>([]);

  const fetchMasterData = useCallback(async () => {
    try {
      const [yrs, progs, depts, spcs, regs] = await Promise.all([
        institutionAdminService.getAcademicYears().catch(() => []),
        institutionAdminService.getPrograms().catch(() => []),
        institutionAdminService.getDepartments().catch(() => []),
        institutionAdminService.getSpecializations().catch(() => []),
        institutionAdminService.getRegulations().catch(() => []),
      ]);
      if (Array.isArray(yrs) && yrs.length > 0) setLiveYears(yrs.map(y => ({ id: String(y.id), year: y.year })));
      if (Array.isArray(progs) && progs.length > 0) setLivePrograms(progs.map(p => ({ id: String(p.id), name: p.name })));
      if (Array.isArray(depts) && depts.length > 0) setLiveDepts(depts.map(d => ({ id: String(d.id), code: d.code, name: d.name })));
      if (Array.isArray(spcs) && spcs.length > 0) setLiveSpecs(spcs.map(s => ({ id: String(s.id), name: s.name })));
      if (Array.isArray(regs) && regs.length > 0) setLiveRegs(regs.map(r => ({ id: String(r.id), regulationCode: r.regulationCode, regulationName: r.regulationName })));
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchOfferings();
    fetchMasterData();
  }, [fetchOfferings, fetchMasterData]);

  const filtered = filterYear === 'all'
    ? offerings
    : offerings.filter((o) => o.academicYear === filterYear);

  // Resolve IDs to display names for the generated name preview
  const yearsList = liveYears.length > 0 ? liveYears : academicYears;
  const programsList = livePrograms.length > 0 ? livePrograms : masterPrograms;
  const deptsList = liveDepts.length > 0 ? liveDepts : departments;
  const specsList = liveSpecs.length > 0 ? liveSpecs : specializations;
  const regsList = liveRegs.length > 0 ? liveRegs : academicRegulations;

  const selectedYear = yearsList.find((y) => y.id === offeringForm.academicYearId);
  const selectedProgram = programsList.find((p) => p.id === offeringForm.programId);
  const selectedDept = deptsList.find((d) => d.id === offeringForm.departmentId);
  const selectedSpec = specsList.find((s) => s.id === offeringForm.specializationId);
  const selectedReg = regsList.find((r) => r.id === offeringForm.regulationId);

  const previewName = generateOfferingName(
    selectedProgram?.name || '',
    selectedDept?.code || '',
    selectedSpec?.name || '',
    selectedYear?.year || '',
    selectedReg?.regulationCode || ''
  );

  const openAddDialog = () => {
    setOfferingForm({ academicYearId: '', programId: '', departmentId: '', specializationId: '', regulationId: '', duration: 4 });
    setEditingOfferingId(null);
    setShowAddDialog(true);
  };

  const openEditDialog = (offering: ProgramOffering) => {
    setOfferingForm({
      academicYearId: offering.academicYearId,
      programId: offering.programId,
      departmentId: offering.departmentId,
      specializationId: offering.specializationId || '',
      regulationId: offering.regulationId,
      duration: offering.duration,
    });
    setEditingOfferingId(offering.id);
    setShowAddDialog(true);
  };

  const handleSaveOffering = async () => {
    const { academicYearId, programId, departmentId, specializationId, regulationId, duration } = offeringForm;
    if (!academicYearId || !programId || !departmentId || !regulationId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await institutionAdminService.createProgramOffering({
        academicYearId: Number(academicYearId),
        programId: Number(programId),
        departmentId: Number(departmentId),
        specializationId: specializationId ? Number(specializationId) : undefined,
        regulationId: Number(regulationId),
        duration: Number(duration) || 4,
        status: 'ACTIVE',
      });
      toast.success(editingOfferingId ? 'Offering updated' : 'Offering created successfully');
      setShowAddDialog(false);
      setEditingOfferingId(null);
      fetchOfferings();
    } catch {
      toast.error('Failed to save program offering');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOffering = async (id: string) => {
    const idNum = Number(id);
    if (!isNaN(idNum)) {
      try {
        await institutionAdminService.deleteProgramOffering(idNum);
        toast.success('Offering deleted successfully');
        fetchOfferings();
      } catch {
        toast.error('Failed to delete offering');
      }
    } else {
      setOfferings((prev) => prev.filter((o) => o.id !== id));
      toast.success('Offering deleted');
    }
    setDeleteConfirmOffering(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Program Offerings</h3>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-36 h-8">
              <SelectValue placeholder="Filter year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {yearsList.map((y) => (
                <SelectItem key={y.id} value={y.year}>{y.year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Create Offering
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Generated name format: Program + Department + Specialization + Academic Year + Regulation
      </p>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Generated Name</th>
              <th className="text-left py-3 px-4 font-medium">Academic Year</th>
              <th className="text-left py-3 px-4 font-medium">Program</th>
              <th className="text-left py-3 px-4 font-medium">Department</th>
              <th className="text-left py-3 px-4 font-medium">Specialization</th>
              <th className="text-left py-3 px-4 font-medium">Regulation</th>
              <th className="text-center py-3 px-4 font-medium">Duration</th>
              <th className="text-center py-3 px-4 font-medium">Status</th>
              <th className="text-center py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-xs text-muted-foreground">
                  No program offerings found
                </td>
              </tr>
            ) : (
              filtered.map((offering) => (
                <tr key={offering.id} className="border-t hover:bg-muted/50">
                  <td className="py-3 px-4 font-semibold text-primary">{offering.generatedName}</td>
                  <td className="py-3 px-4">{offering.academicYear}</td>
                  <td className="py-3 px-4">{offering.program}</td>
                  <td className="py-3 px-4">{offering.department}</td>
                  <td className="py-3 px-4">{offering.specialization || '-'}</td>
                  <td className="py-3 px-4 font-mono text-xs">{offering.regulation}</td>
                  <td className="py-3 px-4 text-center">{offering.duration}Y</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={offering.status === 'active' ? 'default' : 'secondary'}>{offering.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewOffering(offering)} title="View details">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600" onClick={() => openEditDialog(offering)} title="Edit offering">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleteConfirmOffering(offering.id)} title="Delete offering">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Offering Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) setEditingOfferingId(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{editingOfferingId ? 'Edit Program Offering' : 'Create Program Offering'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Academic Year *</Label>
                <Select
                  value={offeringForm.academicYearId}
                  onValueChange={(v) => setOfferingForm((f) => ({ ...f, academicYearId: v }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearsList.map((y) => (
                      <SelectItem key={y.id} value={y.id} className="text-xs">{y.year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Program *</Label>
                <Select
                  value={offeringForm.programId}
                  onValueChange={(v) => setOfferingForm((f) => ({ ...f, programId: v }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {programsList.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Department *</Label>
                <Select
                  value={offeringForm.departmentId}
                  onValueChange={(v) => setOfferingForm((f) => ({ ...f, departmentId: v }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {deptsList.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="text-xs">{d.code} - {d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Specialization</Label>
                <Select
                  value={offeringForm.specializationId}
                  onValueChange={(v) => setOfferingForm((f) => ({ ...f, specializationId: v }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {specsList.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Regulation *</Label>
                <Select
                  value={offeringForm.regulationId}
                  onValueChange={(v) => setOfferingForm((f) => ({ ...f, regulationId: v }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {regsList.map((r) => (
                      <SelectItem key={r.id} value={r.id} className="text-xs">{r.regulationCode} - {r.regulationName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Duration (Years) *</Label>
                <Input type="number" value={offeringForm.duration}
                  onChange={(e) => setOfferingForm((f) => ({ ...f, duration: parseInt(e.target.value) || 0 }))}
                  className="h-9 text-sm" min={1} max={8} />
              </div>
            </div>

            {/* Generated Name Preview */}
            {previewName && (
              <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
                <div className="flex items-center gap-2">
                  <Combine className="h-4 w-4 text-indigo-500 shrink-0" />
                  <div>
                    <p className="text-[10px] font-medium text-indigo-700 dark:text-indigo-400">Generated Name Preview</p>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-300">{previewName}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setShowAddDialog(false); setEditingOfferingId(null); }}>Cancel</Button>
            <Button size="sm" className="h-8 text-xs" onClick={handleSaveOffering}>
              {editingOfferingId ? 'Update Offering' : 'Create Offering'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Offering Dialog */}
      <Dialog open={!!viewOffering} onOpenChange={() => setViewOffering(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">{viewOffering?.generatedName}</DialogTitle>
          </DialogHeader>
          {viewOffering && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Program</p>
                  <p className="text-sm font-semibold">{viewOffering.program}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Academic Year</p>
                  <p className="text-sm font-semibold">{viewOffering.academicYear}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Department</p>
                  <p className="text-sm font-semibold">{viewOffering.department}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Specialization</p>
                  <p className="text-sm font-semibold">{viewOffering.specialization || '-'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Regulation</p>
                  <p className="text-sm font-semibold">{viewOffering.regulation}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Duration</p>
                  <p className="text-sm font-semibold">{viewOffering.duration} Years</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Status</p>
                  <Badge variant={viewOffering.status === 'active' ? 'default' : 'secondary'}>{viewOffering.status}</Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmOffering} onOpenChange={() => setDeleteConfirmOffering(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Delete Program Offering</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete this program offering? Associated intake records may be affected.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmOffering(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => deleteConfirmOffering && handleDeleteOffering(deleteConfirmOffering)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================================
// PROGRAM INTAKE TAB
// ============================================================

const ProgramIntakeTab = () => {
  const [intakes, setIntakes] = useState<ProgramIntake[]>(programIntakes);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterYear, setFilterYear] = useState<string>('all');
  const [editingIntakeId, setEditingIntakeId] = useState<string | null>(null);
  const [deleteConfirmIntake, setDeleteConfirmIntake] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state for add/edit intake
  const [intakeForm, setIntakeForm] = useState({
    academicYearId: '',
    programOfferingId: '',
    sanctionedIntake: 0,
    admittedIntake: 0,
    lateralEntryIntake: 0,
    approvalAuthority: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [uploadedIntakeFiles, setUploadedIntakeFiles] = useState<Array<{ name: string; type: string; size: number }>>([]);
  const [dragActiveIntake, setDragActiveIntake] = useState(false);
  const intakeFileInputRef = useRef<HTMLInputElement>(null);
  const intakeDragCounterRef = useRef(0);

  const fetchIntakes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await institutionAdminService.getProgramIntakes();
      if (Array.isArray(data)) {
        const mapped: ProgramIntake[] = data.map((item) => ({
          id: String(item.id),
          academicYear: item.academicYear || item.academicYearName || '2024-25',
          academicYearId: item.academicYearId ? String(item.academicYearId) : '',
          programOffering: item.programOffering || item.programOfferingName || `Offering ${item.programOfferingId}`,
          programOfferingId: item.programOfferingId ? String(item.programOfferingId) : '',
          sanctionedIntake: item.sanctionedIntake || 0,
          admittedIntake: item.admittedIntake || 0,
          lateralEntryIntake: item.lateralEntryIntake || 0,
          vacantSeats: item.vacantSeats ?? Math.max(0, (item.sanctionedIntake || 0) - (item.admittedIntake || 0) - (item.lateralEntryIntake || 0)),
          approvalAuthority: item.approvalAuthority || 'AICTE / UGC',
          status: item.status === 'ACTIVE' ? 'active' : 'inactive',
          documents: [],
        }));
        setIntakes(mapped);
      }
    } catch {
      // Fallback to local programIntakes array if offline
    } finally {
      setLoading(false);
    }
  }, []);

  const [liveYears, setLiveYears] = useState<Array<{ id: string; year: string }>>([]);
  const [liveOfferings, setLiveOfferings] = useState<Array<{ id: string; generatedName: string }>>([]);

  const fetchIntakeMasterData = useCallback(async () => {
    try {
      const [yrs, offs] = await Promise.all([
        institutionAdminService.getAcademicYears().catch(() => []),
        institutionAdminService.getProgramOfferings().catch(() => []),
      ]);
      if (Array.isArray(yrs) && yrs.length > 0) setLiveYears(yrs.map(y => ({ id: String(y.id), year: y.year })));
      if (Array.isArray(offs) && offs.length > 0) {
        setLiveOfferings(offs.map(o => ({
          id: String(o.id),
          generatedName: o.generatedName || o.offeringName || `${o.program || o.programName || 'Program'} ${o.department || o.departmentCode || ''} ${o.specialization ? o.specialization + ' ' : ''}${o.academicYear || o.academicYearName || ''} ${o.regulation || ''}`.trim(),
        })));
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchIntakes();
    fetchIntakeMasterData();
  }, [fetchIntakes, fetchIntakeMasterData]);

  const INTAKE_ACCEPTED_FILE_TYPES = '.doc,.docx,.pdf,.png,.jpg,.jpeg,.gif,.svg,.xlsx,.xls,.ppt,.pptx,.txt,.zip';
  const INTAKE_ACCEPTED_MIME_TYPES = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
  ];

  const getIntakeFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf')) return BookOpen;
    if (type.includes('word') || type.includes('document')) return FileText;
    if (type.includes('spreadsheet') || type.includes('excel')) return File;
    if (type.includes('presentation') || type.includes('powerpoint')) return File;
    return File;
  };

  const formatIntakeFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isValidIntakeFile = (file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedExts = INTAKE_ACCEPTED_FILE_TYPES.split(',');
    return acceptedExts.includes(ext) || INTAKE_ACCEPTED_MIME_TYPES.includes(file.type);
  };

  const handleIntakeFileDrop = (files: FileList) => {
    const newFiles: Array<{ name: string; type: string; size: number }> = [];
    let hasInvalid = false;
    setUploadedIntakeFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      Array.from(files).forEach((file) => {
        if (isValidIntakeFile(file) && !existingNames.has(file.name)) {
          existingNames.add(file.name);
          newFiles.push({ name: file.name, type: file.type, size: file.size });
        } else if (!isValidIntakeFile(file)) {
          hasInvalid = true;
        }
      });
      return [...prev, ...newFiles];
    });
    if (hasInvalid) {
      toast.error('Some files were skipped due to unsupported format');
    }
  };

  const handleRemoveIntakeFile = (fileName: string) => {
    setUploadedIntakeFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const handleIntakeDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    intakeDragCounterRef.current++;
    if (intakeDragCounterRef.current === 1) setDragActiveIntake(true);
  };

  const handleIntakeDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    intakeDragCounterRef.current--;
    if (intakeDragCounterRef.current === 0) setDragActiveIntake(false);
  };

  const handleIntakeDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleIntakeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    intakeDragCounterRef.current = 0;
    setDragActiveIntake(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleIntakeFileDrop(e.dataTransfer.files);
    }
  };

  const handleIntakeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      intakeFileInputRef.current?.click();
    }
  };

  const handleIntakeFileBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleIntakeFileDrop(e.target.files);
    }
    e.target.value = '';
  };

  const filtered = filterYear === 'all'
    ? intakes
    : intakes.filter((i) => i.academicYear === filterYear);

  const totalSanctioned = filtered.reduce((s, i) => s + i.sanctionedIntake, 0);
  const totalAdmitted = filtered.reduce((s, i) => s + i.admittedIntake, 0);
  const totalVacant = filtered.reduce((s, i) => s + i.vacantSeats, 0);

  const vacantSeats = Math.max(0, (intakeForm.sanctionedIntake || 0) - (intakeForm.admittedIntake || 0) - (intakeForm.lateralEntryIntake || 0));

  const openAddIntakeDialog = () => {
    fetchIntakeMasterData();
    setIntakeForm({ academicYearId: '', programOfferingId: '', sanctionedIntake: 0, admittedIntake: 0, lateralEntryIntake: 0, approvalAuthority: '', status: 'active' });
    setEditingIntakeId(null);
    setUploadedIntakeFiles([]);
    setShowAddDialog(true);
  };

  const openEditIntakeDialog = (intake: ProgramIntake) => {
    fetchIntakeMasterData();
    setIntakeForm({
      academicYearId: intake.academicYearId,
      programOfferingId: intake.programOfferingId,
      sanctionedIntake: intake.sanctionedIntake,
      admittedIntake: intake.admittedIntake,
      lateralEntryIntake: intake.lateralEntryIntake,
      approvalAuthority: intake.approvalAuthority,
      status: intake.status,
    });
    setEditingIntakeId(intake.id);
    setUploadedIntakeFiles(intake.documents.map((d) => ({ name: d, type: 'application/octet-stream', size: 0 })));
    setShowAddDialog(true);
  };

  const handleSaveIntake = async () => {
    const { academicYearId, programOfferingId, sanctionedIntake, admittedIntake, lateralEntryIntake, approvalAuthority, status } = intakeForm;
    if (!academicYearId || !programOfferingId || !sanctionedIntake) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await institutionAdminService.createProgramIntake({
        academicYearId: Number(academicYearId),
        programOfferingId: Number(programOfferingId),
        sanctionedIntake: Number(sanctionedIntake),
        admittedIntake: Number(admittedIntake) || 0,
        lateralEntryIntake: Number(lateralEntryIntake) || 0,
        approvalAuthority: approvalAuthority || 'AICTE',
        status: status === 'active' ? 'ACTIVE' : 'INACTIVE',
      });
      toast.success(editingIntakeId ? 'Intake record updated' : 'Intake record added successfully');
      setShowAddDialog(false);
      setEditingIntakeId(null);
      fetchIntakes();
    } catch {
      toast.error('Failed to save intake record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIntake = async (id: string) => {
    const idNum = Number(id);
    if (!isNaN(idNum)) {
      try {
        await institutionAdminService.deleteProgramIntake(idNum);
        toast.success('Intake record deleted successfully');
        fetchIntakes();
      } catch {
        toast.error('Failed to delete intake record');
      }
    } else {
      setIntakes((prev) => prev.filter((i) => i.id !== id));
      toast.success('Intake record deleted');
    }
    setDeleteConfirmIntake(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Program Intake</h3>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-36 h-8">
              <SelectValue placeholder="Filter year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {(liveYears.length > 0 ? liveYears : academicYears).map((y) => (
                <SelectItem key={y.id} value={y.year}>{y.year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={openAddIntakeDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Intake
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Sanctioned</p>
            <p className="text-xl font-bold text-blue-600">{totalSanctioned}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Admitted</p>
            <p className="text-xl font-bold text-green-600">{totalAdmitted}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Vacant</p>
            <p className="text-xl font-bold text-amber-600">{totalVacant}</p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Program Offering</th>
              <th className="text-left py-3 px-4 font-medium">Academic Year</th>
              <th className="text-center py-3 px-4 font-medium">Sanctioned</th>
              <th className="text-center py-3 px-4 font-medium">Admitted</th>
              <th className="text-center py-3 px-4 font-medium">Lateral</th>
              <th className="text-center py-3 px-4 font-medium">Vacant</th>
              <th className="text-left py-3 px-4 font-medium">Authority</th>
              <th className="text-center py-3 px-4 font-medium">Status</th>
              <th className="text-center py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-xs text-muted-foreground">
                  No intake records found
                </td>
              </tr>
            ) : (
              filtered.map((intake) => (
                <tr key={intake.id} className="border-t hover:bg-muted/50">
                  <td className="py-3 px-4 font-semibold text-primary">{intake.programOffering}</td>
                  <td className="py-3 px-4">{intake.academicYear}</td>
                  <td className="py-3 px-4 text-center font-medium">{intake.sanctionedIntake}</td>
                  <td className="py-3 px-4 text-center">{intake.admittedIntake}</td>
                  <td className="py-3 px-4 text-center">{intake.lateralEntryIntake || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={intake.vacantSeats === 0 ? 'default' : 'secondary'} className={intake.vacantSeats === 0 ? 'bg-green-100 text-green-700' : ''}>
                      {intake.vacantSeats}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">{intake.approvalAuthority}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={intake.status === 'active' ? 'default' : 'secondary'}>{intake.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600" onClick={() => openEditIntakeDialog(intake)} title="Edit intake">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleteConfirmIntake(intake.id)} title="Delete intake">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmIntake} onOpenChange={() => setDeleteConfirmIntake(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Delete Intake Record</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">Are you sure you want to delete this intake record?</p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmIntake(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => deleteConfirmIntake && handleDeleteIntake(deleteConfirmIntake)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Intake Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) setEditingIntakeId(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{editingIntakeId ? 'Edit Program Intake' : 'Add Program Intake'}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground mb-2">
            Vacant Seats = Sanctioned Intake - Admitted Intake - Lateral Entry
          </p>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Academic Year *</Label>
              <Select
                value={intakeForm.academicYearId}
                onValueChange={(v) => setIntakeForm((f) => ({ ...f, academicYearId: v }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {(liveYears.length > 0 ? liveYears : academicYears).map((y) => (
                    <SelectItem key={y.id} value={y.id} className="text-xs">{y.year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Program Offering *</Label>
              <Select
                value={intakeForm.programOfferingId}
                onValueChange={(v) => setIntakeForm((f) => ({ ...f, programOfferingId: v }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {(liveOfferings.length > 0 ? liveOfferings : programOfferings).map((o) => (
                    <SelectItem key={o.id} value={o.id} className="text-xs">{o.generatedName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Sanctioned Intake *</Label>
                <Input type="number" value={intakeForm.sanctionedIntake || ''}
                  onChange={(e) => setIntakeForm((f) => ({ ...f, sanctionedIntake: parseInt(e.target.value) || 0 }))}
                  className="h-9 text-sm" placeholder="e.g., 120" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Admitted Intake</Label>
                <Input type="number" value={intakeForm.admittedIntake || ''}
                  onChange={(e) => setIntakeForm((f) => ({ ...f, admittedIntake: parseInt(e.target.value) || 0 }))}
                  className="h-9 text-sm" placeholder="e.g., 118" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Lateral Entry Intake</Label>
                <Input type="number" value={intakeForm.lateralEntryIntake || ''}
                  onChange={(e) => setIntakeForm((f) => ({ ...f, lateralEntryIntake: parseInt(e.target.value) || 0 }))}
                  className="h-9 text-sm" placeholder="e.g., 12" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Vacant Seats (Auto calc)</Label>
                <Input disabled value={vacantSeats} className="h-9 text-sm bg-muted" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Approval Authority</Label>
              <Select value={intakeForm.approvalAuthority} onValueChange={(v) => setIntakeForm((f) => ({ ...f, approvalAuthority: v }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select authority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AICTE" className="text-xs">AICTE</SelectItem>
                  <SelectItem value="UGC" className="text-xs">UGC</SelectItem>
                  <SelectItem value="NBA" className="text-xs">NBA</SelectItem>
                  <SelectItem value="NAAC" className="text-xs">NAAC</SelectItem>
                  <SelectItem value="University" className="text-xs">University</SelectItem>
                  <SelectItem value="Government" className="text-xs">Government</SelectItem>
                  <SelectItem value="Affiliating University" className="text-xs">Affiliating University</SelectItem>
                  <SelectItem value="NCTE" className="text-xs">NCTE</SelectItem>
                  <SelectItem value="BCI" className="text-xs">BCI</SelectItem>
                  <SelectItem value="PCI" className="text-xs">PCI</SelectItem>
                  <SelectItem value="Other" className="text-xs">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Status</Label>
              <Select value={intakeForm.status} onValueChange={(v: 'active' | 'inactive') => setIntakeForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" className="text-xs">Active</SelectItem>
                  <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Documents Upload */}
            <Separator className="my-2" />
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                Supporting Documents
                {uploadedIntakeFiles.length > 0 && (
                  <Badge variant="secondary" className="ml-auto text-[9px] px-1.5 py-0">
                    {uploadedIntakeFiles.length} file{uploadedIntakeFiles.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </Label>
              {/* Drop Zone */}
              <div
                role="button"
                tabIndex={0}
                onDragEnter={handleIntakeDragEnter}
                onDragLeave={handleIntakeDragLeave}
                onDragOver={handleIntakeDragOver}
                onDrop={handleIntakeDrop}
                onClick={() => intakeFileInputRef.current?.click()}
                onKeyDown={handleIntakeKeyDown}
                aria-label="Upload supporting documents"
                className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  dragActiveIntake
                    ? 'border-indigo-500 bg-indigo-500/5 scale-[1.01] shadow-lg shadow-indigo-500/10'
                    : 'border-border/60 hover:border-indigo-400/50 hover:bg-muted/50'
                }`}
              >
                <input
                  ref={intakeFileInputRef}
                  type="file"
                  multiple
                  accept={INTAKE_ACCEPTED_FILE_TYPES}
                  onChange={handleIntakeFileBrowse}
                  className="hidden"
                />
                <UploadCloud className={`h-7 w-7 mx-auto mb-1.5 transition-colors duration-200 ${
                  dragActiveIntake ? 'text-indigo-500' : 'text-muted-foreground/60'
                }`} />
                <p className={`text-xs font-medium transition-colors duration-200 ${
                  dragActiveIntake ? 'text-indigo-600' : 'text-muted-foreground'
                }`}>
                  {dragActiveIntake ? 'Drop files here' : 'Drag & drop files here, or click to browse'}
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                  Supported: PDF, DOCX, Images, Excel, PPT, TXT, ZIP
                </p>
              </div>
              {/* Uploaded Files List */}
              {uploadedIntakeFiles.length > 0 && (
                <div className="space-y-1.5 mt-1.5">
                  <p className="text-[9px] font-medium text-muted-foreground">UPLOADED FILES</p>
                  {uploadedIntakeFiles.map((file, idx) => {
                    const FileIcon = getIntakeFileIcon(file.type);
                    return (
                      <div
                        key={`${file.name}-${idx}`}
                        className="group flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium truncate">{file.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[8px] px-1 py-0 leading-none">
                              {file.type.split('/').pop()?.toUpperCase() || file.name.split('.').pop()?.toUpperCase()}
                            </Badge>
                            <span className="text-[9px] text-muted-foreground">{formatIntakeFileSize(file.size)}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); handleRemoveIntakeFile(file.name); }}
                        >
                          <X className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Vacant seats info card */}
            <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Calculated Vacant Seats:</span>
                <span className="font-semibold text-indigo-600">{vacantSeats}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setShowAddDialog(false); setEditingIntakeId(null); }}>Cancel</Button>
            <Button size="sm" className="h-8 text-xs" onClick={handleSaveIntake}>
              {editingIntakeId ? 'Update Intake' : 'Add Intake'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="text-xs text-muted-foreground">
        <strong>Documents:</strong> AICTE Approval Letter, University Approval, Seat Matrix
      </div>
    </div>
  );
};

// Main Academic Structure Page
export const AcademicStructurePage = () => {
  const location = useLocation();
  const path = location.pathname;

  const getActiveTab = () => {
    if (path.includes('academic-years')) return 'academic-years';
    if (path.includes('programs')) return 'programs';
    if (path.includes('departments')) return 'departments';
    if (path.includes('specializations')) return 'specializations';
    if (path.includes('regulations')) return 'regulations';
    if (path.includes('offerings')) return 'offerings';
    if (path.includes('intake')) return 'intake';
    return 'dashboard';
  };

  const navigate = useNavigate();
  const activeTab = getActiveTab();

  const handleTabChange = (value: string) => {
    if (value === 'dashboard') {
      navigate('/app/academic-structure');
    } else {
      navigate(`/app/academic-structure/${value}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Structure</h1>
        <p className="text-muted-foreground">
          Configure the academic hierarchy: Academic Year → Program → Department → Specialization → Regulation → Program Offering → Program Intake
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl flex-wrap gap-0.5">
          <TabsTrigger value="dashboard" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <BarChart3 className="h-3.5 w-3.5" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="academic-years" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <Calendar className="h-3.5 w-3.5" />
            Academic Years
          </TabsTrigger>
          <TabsTrigger value="programs" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <GraduationCap className="h-3.5 w-3.5" />
            Programs
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <Building2 className="h-3.5 w-3.5" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="specializations" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <Layers className="h-3.5 w-3.5" />
            Specializations
          </TabsTrigger>
          <TabsTrigger value="regulations" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <BookOpen className="h-3.5 w-3.5" />
            Regulations
          </TabsTrigger>
          <TabsTrigger value="offerings" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <Combine className="h-3.5 w-3.5" />
            Program Offerings
          </TabsTrigger>
          <TabsTrigger value="intake" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <Users className="h-3.5 w-3.5" />
            Program Intake
          </TabsTrigger>
        </TabsList>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-6"
        >
          <TabsContent value="dashboard" className="mt-0"><DashboardTab /></TabsContent>
          <TabsContent value="academic-years" className="mt-0"><AcademicYearsTab /></TabsContent>
          <TabsContent value="programs" className="mt-0"><ProgramsTab /></TabsContent>
          <TabsContent value="departments" className="mt-0"><DepartmentsTab /></TabsContent>
          <TabsContent value="specializations" className="mt-0"><SpecializationsTab /></TabsContent>
          <TabsContent value="regulations" className="mt-0"><AcademicRegulationsTab /></TabsContent>
          <TabsContent value="offerings" className="mt-0"><ProgramOfferingsTab /></TabsContent>
          <TabsContent value="intake" className="mt-0"><ProgramIntakeTab /></TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
};
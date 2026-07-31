import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  institutionAdminService,
  AcademicYearApiResponse,
  CreateAcademicYearRequest,
  ProgramApiResponse,
  CreateProgramRequest,
  DepartmentApiResponse,
  CreateDepartmentRequest,
  SpecializationApiResponse,
  CreateSpecializationRequest,
  RegulationApiResponse,
  CreateRegulationRequest,
  ProgramOfferingApiResponse,
  CreateProgramOfferingRequest,
  CreateProgramOfferingResponse,
  ProgramIntakeApiResponse,
  CreateProgramIntakeRequest,
  CreateProgramIntakeResponse,
} from '@/services/institution-admin.service';
import { AcademicStructureSummary } from '@/types/institution-admin.types';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { isAuthenticated } = useAuth();

  const {
    data: summary,
    isLoading,
    error,
    refetch,
  } = useQuery<AcademicStructureSummary>({
    queryKey: ['academicStructureSummary'],
    queryFn: () => institutionAdminService.getAcademicStructureSummary(),
    enabled: isAuthenticated,
  });

  const cards = summary
    ? [
        {
          label: 'Academic Years',
          value: summary.academicYears,
          icon: Calendar,
          color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
        },
        {
          label: 'Programs',
          value: summary.programs,
          icon: GraduationCap,
          color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
        },
        {
          label: 'Departments',
          value: summary.departments,
          icon: Building2,
          color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30',
        },
        {
          label: 'Specializations',
          value: summary.specializations,
          icon: Layers,
          color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
        },
        {
          label: 'Regulations',
          value: summary.regulations,
          icon: BookOpen,
          color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30',
        },
        {
          label: 'Program Offering',
          value: summary.programOfferings,
          icon: Combine,
          color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30',
        },
        {
          label: 'Total Intake (Current Year)',
          value: summary.totalIntakeCurrentYear,
          icon: Users,
          color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[...Array(7)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <Skeleton className="h-8 w-8 mx-auto rounded-lg mb-2" />
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">Failed to load academic summary.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {cards.map(card => (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className={`inline-flex p-2 rounded-lg ${card.color} mb-2`}>
                <card.icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
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
              {summary?.programDistribution.map(p => (
                <div key={p.programName} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{p.programName}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(p.departmentCount / (summary.departments || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">
                      {p.departmentCount} depts
                    </span>
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
              Intake Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary?.intakeTrend && summary.intakeTrend.length > 0 ? (
                summary.intakeTrend.map(t => (
                  <div key={t.year} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t.year}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${(t.count / (summary.totalIntakeCurrentYear || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12">{t.count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No intake trend data available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Academic Years Tab
const AcademicYearsTab = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);

  // ── Form state ──
  const [formYear, setFormYear] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('INACTIVE');

  // ── Query: fetch all academic years ──
  const {
    data: apiYears,
    isLoading,
    error,
    refetch,
  } = useQuery<AcademicYearApiResponse[]>({
    queryKey: ['academicYears'],
    queryFn: () => institutionAdminService.getAcademicYears(),
    enabled: isAuthenticated,
  });

  // Map API response to the local AcademicYear shape
  const years: AcademicYear[] = (apiYears ?? []).map(y => ({
    id: String(y.id),
    year: y.year,
    startDate: y.startDate,
    endDate: y.endDate,
    status: y.status === 'ACTIVE' ? 'active' : 'inactive',
  }));

  // ── Mutation: activate academic year ──
  const activateMutation = useMutation({
    mutationFn: (id: number) => institutionAdminService.activateAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
      toast.success('Active academic year updated');
    },
    onError: () => {
      toast.error('Failed to activate academic year');
    },
  });

  // ── Mutation: create academic year ──
  const createMutation = useMutation({
    mutationFn: (data: CreateAcademicYearRequest) =>
      institutionAdminService.createAcademicYear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
      setShowAddDialog(false);
      // Reset form
      setFormYear('');
      setFormStartDate('');
      setFormEndDate('');
      setFormStatus('INACTIVE');
      toast.success('Academic year added');
    },
    onError: () => {
      toast.error('Failed to add academic year');
    },
  });

  // ── Mutation: delete academic year ──
  const deleteMutation = useMutation({
    mutationFn: (id: number) => institutionAdminService.deleteAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
      toast.success('Academic year deleted');
    },
    onError: () => {
      toast.error('Failed to delete academic year');
    },
  });

  const handleSetActive = (id: string) => {
    const year = apiYears?.find(y => String(y.id) === id);
    if (year) {
      activateMutation.mutate(year.id);
    }
  };

  const handleDelete = (id: string) => {
    const year = apiYears?.find(y => String(y.id) === id);
    if (year) {
      deleteMutation.mutate(year.id);
    }
  };

  const handleCreate = () => {
    if (!formYear || !formStartDate || !formEndDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate({
      year: formYear,
      startDate: formStartDate,
      endDate: formEndDate,
      status: formStatus,
    });
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid gap-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">Failed to load academic years.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Academic Years</h3>
          <p className="text-xs text-muted-foreground">
            Only one academic year can be active at a time. Cannot delete if repository data exists.
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
                  onChange={e => setFormYear(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={e => setFormStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={e => setFormEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formStatus}
                  onValueChange={(v: 'ACTIVE' | 'INACTIVE') => setFormStatus(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setFormYear('');
                  setFormStartDate('');
                  setFormEndDate('');
                  setFormStatus('INACTIVE');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding…' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {years.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No academic years found. Click "Add Academic Year" to create one.
            </CardContent>
          </Card>
        ) : (
          years.map(year => (
            <Card
              key={year.id}
              className={year.status === 'active' ? 'border-primary/50 bg-primary/5' : ''}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      year.status === 'active' ? 'bg-primary/10' : 'bg-muted'
                    }`}
                  >
                    <Calendar
                      className={`h-4 w-4 ${
                        year.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{year.year}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(year.startDate).toLocaleDateString()} —{' '}
                      {new Date(year.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Academic Year</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete <strong>{year.year}</strong>? This action
                          cannot be undone. Years with existing repository data cannot be deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(year.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {year.status === 'active' ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetActive(year.id)}
                      disabled={activateMutation.isPending}
                    >
                      {activateMutation.isPending ? 'Activating…' : 'Set Active'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// Programs Tab
const ProgramsTab = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);

  // ── Form state ──
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formLevel, setFormLevel] = useState<'UG' | 'PG' | 'Doctoral'>('UG');
  const [formDuration, setFormDuration] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // ── Query: fetch all programs ──
  const {
    data: apiPrograms,
    isLoading,
    error,
    refetch,
  } = useQuery<ProgramApiResponse[]>({
    queryKey: ['programs'],
    queryFn: () => institutionAdminService.getPrograms(),
    enabled: isAuthenticated,
  });

  // Map API response to the local Program shape
  const programs: Program[] = (apiPrograms ?? []).map(p => ({
    id: String(p.id),
    programCode: p.programCode,
    name: p.name,
    level: p.level,
    duration: p.durationYears,
    status: p.status === 'ACTIVE' ? 'active' : 'inactive',
    enabled: p.status === 'ACTIVE',
    isCustom: p.isCustom,
  }));

  // ── Mutation: toggle program status ──
  const toggleMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: number; newStatus: string }) =>
      institutionAdminService.toggleProgramStatus(id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Program status updated');
    },
    onError: () => {
      toast.error('Failed to update program status');
    },
  });

  // ── Mutation: create program ──
  const createMutation = useMutation({
    mutationFn: (data: CreateProgramRequest) => institutionAdminService.createProgram(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setShowAddDialog(false);
      resetForm();
      toast.success('Custom program added');
    },
    onError: () => {
      toast.error('Failed to add program');
    },
  });

  // ── Mutation: delete program ──
  const deleteMutation = useMutation({
    mutationFn: (id: number) => institutionAdminService.deleteProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Program deleted');
    },
    onError: () => {
      toast.error('Failed to delete program');
    },
  });

  const resetForm = () => {
    setFormCode('');
    setFormName('');
    setFormLevel('UG');
    setFormDuration('');
    setFormStatus('ACTIVE');
  };

  const handleToggle = (id: string) => {
    const apiProgram = apiPrograms?.find(p => String(p.id) === id);
    if (apiProgram) {
      const newStatus = apiProgram.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      toggleMutation.mutate({ id: apiProgram.id, newStatus });
    }
  };

  const handleCreate = () => {
    if (!formCode || !formName || !formDuration) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate({
      programCode: formCode,
      name: formName,
      level: formLevel,
      duration: Number(formDuration),
      isCustom: true,
      status: formStatus,
    });
  };

  const handleDelete = (id: string) => {
    const apiProgram = apiPrograms?.find(p => String(p.id) === id);
    if (apiProgram) {
      deleteMutation.mutate(apiProgram.id);
    }
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="rounded-lg border">
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-6 w-10" />
                <Skeleton className="h-6 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">Failed to load programs.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Programs</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
                  onChange={e => setFormCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Program Name *</Label>
                <Input
                  placeholder="e.g., B.Sc"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Program Level *</Label>
                <Select
                  value={formLevel}
                  onValueChange={(v: 'UG' | 'PG' | 'Doctoral') => setFormLevel(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
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
                  placeholder="e.g., 4"
                  value={formDuration}
                  onChange={e => setFormDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formStatus}
                  onValueChange={(v: 'ACTIVE' | 'INACTIVE') => setFormStatus(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding…' : 'Add Program'}
              </Button>
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
            {programs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No programs found. Click "Add Custom Program" to create one.
                </td>
              </tr>
            ) : (
              programs.map(program => (
                <tr key={program.id} className="border-t hover:bg-muted/30">
                  <td className="py-3 px-4 font-mono text-xs">{program.programCode}</td>
                  <td className="py-3 px-4 font-medium">
                    {program.name}
                    {program.isCustom && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Custom
                      </Badge>
                    )}
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
                    <div className="flex items-center justify-center gap-1">
                      <Switch
                        checked={program.enabled}
                        onCheckedChange={() => handleToggle(program.id)}
                        disabled={toggleMutation.isPending}
                        className="scale-75"
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Program</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete <strong>{program.name}</strong>? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(program.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Departments Tab
const DepartmentsTab = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // ── Form state ──
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formProgramId, setFormProgramId] = useState('');
  const [formEstYear, setFormEstYear] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // ── Query: fetch all departments ──
  const {
    data: apiDepartments,
    isLoading,
    error,
    refetch,
  } = useQuery<DepartmentApiResponse[]>({
    queryKey: ['departments'],
    queryFn: () => institutionAdminService.getDepartments(),
    enabled: isAuthenticated,
  });

  // ── Query: fetch programs for dropdown ──
  const { data: apiProgramsForDept } = useQuery<ProgramApiResponse[]>({
    queryKey: ['programs'],
    queryFn: () => institutionAdminService.getPrograms(),
    enabled: showAddDialog,
  });

  // Map API response to local Department shape
  const depts: Department[] = (apiDepartments ?? []).map(d => ({
    id: String(d.id),
    name: d.name,
    code: d.code,
    program: d.program,
    programId: String(d.programId),
    coordinator: d.coordinator ?? '',
    repositoryCompletion: d.repositoryCompletion ?? 0,
    establishedYear: d.establishedYear ?? undefined,
    status: d.status === 'ACTIVE' ? 'active' : 'inactive',
    enabled: d.status === 'ACTIVE',
  }));

  // Search filter
  const filtered = depts.filter(
    d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
  );

  // ── Mutation: toggle department status ──
  const toggleMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: number; newStatus: string }) =>
      institutionAdminService.toggleDepartmentStatus(id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department status updated');
    },
    onError: () => {
      toast.error('Failed to update department status');
    },
  });

  // ── Mutation: create department ──
  const createMutation = useMutation({
    mutationFn: (data: CreateDepartmentRequest) => institutionAdminService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setShowAddDialog(false);
      resetForm();
      toast.success('Department added');
    },
    onError: () => {
      toast.error('Failed to add department');
    },
  });

  // ── Mutation: delete department ──
  const deleteMutation = useMutation({
    mutationFn: (id: number) => institutionAdminService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted');
    },
    onError: () => {
      toast.error('Failed to delete department');
    },
  });

  const resetForm = () => {
    setFormName('');
    setFormCode('');
    setFormProgramId('');
    setFormEstYear('');
    setFormStatus('ACTIVE');
  };

  const handleToggle = (id: string) => {
    const apiDept = apiDepartments?.find(d => String(d.id) === id);
    if (apiDept) {
      const newStatus = apiDept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      toggleMutation.mutate({ id: apiDept.id, newStatus });
    }
  };

  const handleCreate = () => {
    if (!formCode || !formName || !formProgramId) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate({
      name: formName,
      code: formCode,
      programId: Number(formProgramId),
      establishedYear: formEstYear ? Number(formEstYear) : undefined,
      status: formStatus,
    });
  };

  const handleDelete = (id: string) => {
    const apiDept = apiDepartments?.find(d => String(d.id) === id);
    if (apiDept) {
      deleteMutation.mutate(apiDept.id);
    }
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-9 w-60" />
          <Skeleton className="h-9 w-44" />
        </div>
        <div className="rounded-lg border">
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12 ml-auto" />
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-6 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">Failed to load departments.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
                  onChange={e => setFormCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Department Name *</Label>
                <Input
                  placeholder="e.g., Aerospace Engineering"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Program *</Label>
                <Select value={formProgramId} onValueChange={setFormProgramId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {(apiProgramsForDept ?? [])
                      .filter(p => p.status === 'ACTIVE')
                      .map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
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
                  onChange={e => setFormEstYear(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formStatus}
                  onValueChange={(v: 'ACTIVE' | 'INACTIVE') => setFormStatus(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding…' : 'Add Department'}
              </Button>
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  {search
                    ? 'No departments match your search.'
                    : 'No departments found. Click "Add Custom Department" to create one.'}
                </td>
              </tr>
            ) : (
              filtered.map(dept => (
                <tr key={dept.id} className="border-t hover:bg-muted/30">
                  <td className="py-3 px-4 font-mono text-xs">{dept.code}</td>
                  <td className="py-3 px-4 font-medium">{dept.name}</td>
                  <td className="py-3 px-4">{dept.program}</td>
                  <td className="py-3 px-4 text-center">{dept.establishedYear || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>
                      {dept.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Switch
                        checked={dept.enabled}
                        onCheckedChange={() => handleToggle(dept.id)}
                        disabled={toggleMutation.isPending}
                        className="scale-75"
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Department</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete <strong>{dept.name}</strong>? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(dept.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Specializations Tab
const SpecializationsTab = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);

  // ── Form state ──
  const [formName, setFormName] = useState('');
  const [formDeptId, setFormDeptId] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // ── Query: fetch all specializations ──
  const {
    data: apiSpecs,
    isLoading,
    error,
    refetch,
  } = useQuery<SpecializationApiResponse[]>({
    queryKey: ['specializations'],
    queryFn: () => institutionAdminService.getSpecializations(),
    enabled: isAuthenticated,
  });

  // ── Query: fetch departments for dropdown ──
  const { data: apiDeptsForSpec } = useQuery<DepartmentApiResponse[]>({
    queryKey: ['departments'],
    queryFn: () => institutionAdminService.getDepartments(),
    enabled: showAddDialog,
  });

  // Map API response to local Specialization shape
  const specs: Specialization[] = (apiSpecs ?? []).map(s => ({
    id: String(s.id),
    name: s.name,
    departmentId: String(s.departmentId),
    departmentName: s.departmentName,
    status: s.status === 'ACTIVE' ? 'active' : 'inactive',
    enabled: s.status === 'ACTIVE',
  }));

  // Group by department name
  const grouped = specs.reduce<Record<string, Specialization[]>>((acc, s) => {
    if (!acc[s.departmentName]) acc[s.departmentName] = [];
    acc[s.departmentName].push(s);
    return acc;
  }, {});

  // ── Mutation: toggle status ──
  const toggleMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: number; newStatus: string }) =>
      institutionAdminService.toggleSpecializationStatus(id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specializations'] });
      toast.success('Specialization status updated');
    },
    onError: () => {
      toast.error('Failed to update specialization');
    },
  });

  // ── Mutation: create specialization ──
  const createMutation = useMutation({
    mutationFn: (data: CreateSpecializationRequest) =>
      institutionAdminService.createSpecialization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specializations'] });
      setShowAddDialog(false);
      resetForm();
      toast.success('Specialization added');
    },
    onError: () => {
      toast.error('Failed to add specialization');
    },
  });

  // ── Mutation: delete specialization ──
  const deleteMutation = useMutation({
    mutationFn: (id: number) => institutionAdminService.deleteSpecialization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specializations'] });
      toast.success('Specialization deleted');
    },
    onError: () => {
      toast.error('Failed to delete specialization');
    },
  });

  const resetForm = () => {
    setFormName('');
    setFormDeptId('');
    setFormStatus('ACTIVE');
  };

  const handleToggle = (id: string) => {
    const apiSpec = apiSpecs?.find(s => String(s.id) === id);
    if (apiSpec) {
      const newStatus = apiSpec.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      toggleMutation.mutate({ id: apiSpec.id, newStatus });
    }
  };

  const handleCreate = () => {
    if (!formName || !formDeptId) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate({
      name: formName,
      departmentId: Number(formDeptId),
      status: formStatus,
    });
  };

  const handleDelete = (id: string) => {
    const apiSpec = apiSpecs?.find(s => String(s.id) === id);
    if (apiSpec) {
      deleteMutation.mutate(apiSpec.id);
    }
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid gap-4">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardHeader className="py-3 px-4">
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(j => (
                    <Skeleton key={j} className="h-10 rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">Failed to load specializations.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Department Specializations</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
                  onChange={e => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select value={formDeptId} onValueChange={setFormDeptId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {(apiDeptsForSpec ?? [])
                      .filter(d => d.status === 'ACTIVE')
                      .map(d => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.code} — {d.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formStatus}
                  onValueChange={(v: 'ACTIVE' | 'INACTIVE') => setFormStatus(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding…' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {Object.keys(grouped).length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No specializations found. Click "Add Specialization" to create one.
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([dept, items]) => (
            <Card key={dept}>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  {dept}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {items.length} specializations
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {items.map(spec => (
                    <div
                      key={spec.id}
                      className="flex items-center justify-between p-2 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{spec.name}</span>
                        <Badge
                          variant={spec.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs scale-90"
                        >
                          {spec.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={spec.enabled}
                          onCheckedChange={() => handleToggle(spec.id)}
                          disabled={toggleMutation.isPending}
                          className="scale-75"
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Specialization</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete <strong>{spec.name}</strong>? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(spec.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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

// Academic Regulations Tab
const AcademicRegulationsTab = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewReg, setViewReg] = useState<RegulationApiResponse | null>(null);

  // ── Form state ──
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formProgramId, setFormProgramId] = useState('');
  const [formAcademicYearIntroduced, setFormAcademicYearIntroduced] = useState('');
  const [formEffFromBatch, setFormEffFromBatch] = useState('');
  const [formEffToBatch, setFormEffToBatch] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formTotalCredits, setFormTotalCredits] = useState('');
  const [formCoreCredits, setFormCoreCredits] = useState('');
  const [formProfElectiveCredits, setFormProfElectiveCredits] = useState('');
  const [formOpenElectiveCredits, setFormOpenElectiveCredits] = useState('');
  const [formLabCredits, setFormLabCredits] = useState('');
  const [formProjectCredits, setFormProjectCredits] = useState('');
  const [formInternshipCredits, setFormInternshipCredits] = useState('');
  const [formInternalMarks, setFormInternalMarks] = useState('');
  const [formExternalMarks, setFormExternalMarks] = useState('');
  const [formPassingMarks, setFormPassingMarks] = useState('');
  const [formGradingSystem, setFormGradingSystem] = useState('');
  const [formCgpaScale, setFormCgpaScale] = useState('');
  const [formInternshipMandatory, setFormInternshipMandatory] = useState(false);
  const [formInternshipDuration, setFormInternshipDuration] = useState('');
  const [formIndustryTraining, setFormIndustryTraining] = useState(false);
  const [formMiniProject, setFormMiniProject] = useState(false);
  const [formMajorProject, setFormMajorProject] = useState(false);
  const [formCapstoneProject, setFormCapstoneProject] = useState(false);
  const [formApprovedBy, setFormApprovedBy] = useState('');
  const [formApprovalDate, setFormApprovalDate] = useState('');
  const [formBosApproval, setFormBosApproval] = useState('');
  const [formAcademicCouncilApproval, setFormAcademicCouncilApproval] = useState('');
  const [formDocuments, setFormDocuments] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // ── Query: fetch all regulations ──
  const {
    data: apiRegulations,
    isLoading,
    error,
    refetch,
  } = useQuery<RegulationApiResponse[]>({
    queryKey: ['regulations'],
    queryFn: () => institutionAdminService.getRegulations(),
    enabled: isAuthenticated,
  });

  // ── Query: fetch programs for dropdown ──
  const { data: apiProgramsForReg } = useQuery<ProgramApiResponse[]>({
    queryKey: ['programs'],
    queryFn: () => institutionAdminService.getPrograms(),
    enabled: showAddDialog,
  });

  // ── Query: fetch academic years for dropdown ──
  const { data: apiAcademicYearsForReg } = useQuery<AcademicYearApiResponse[]>({
    queryKey: ['academicYears'],
    queryFn: () => institutionAdminService.getAcademicYears(),
    enabled: showAddDialog,
  });

  // ── Mutation: toggle regulation status ──
  const toggleMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: number; newStatus: string }) =>
      institutionAdminService.toggleRegulationStatus(id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulations'] });
      toast.success('Regulation status updated');
    },
    onError: () => {
      toast.error('Failed to update regulation status');
    },
  });

  // ── Mutation: create regulation ──
  const createMutation = useMutation({
    mutationFn: (data: CreateRegulationRequest) => institutionAdminService.createRegulation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulations'] });
      setShowAddDialog(false);
      resetForm();
      toast.success('Regulation added successfully');
    },
    onError: () => {
      toast.error('Failed to add regulation');
    },
  });

  const resetForm = () => {
    setFormCode('');
    setFormName('');
    setFormProgramId('');
    setFormAcademicYearIntroduced('');
    setFormEffFromBatch('');
    setFormEffToBatch('');
    setFormDuration('');
    setFormTotalCredits('');
    setFormCoreCredits('');
    setFormProfElectiveCredits('');
    setFormOpenElectiveCredits('');
    setFormLabCredits('');
    setFormProjectCredits('');
    setFormInternshipCredits('');
    setFormInternalMarks('');
    setFormExternalMarks('');
    setFormPassingMarks('');
    setFormGradingSystem('');
    setFormCgpaScale('');
    setFormInternshipMandatory(false);
    setFormInternshipDuration('');
    setFormIndustryTraining(false);
    setFormMiniProject(false);
    setFormMajorProject(false);
    setFormCapstoneProject(false);
    setFormApprovedBy('');
    setFormApprovalDate('');
    setFormBosApproval('');
    setFormAcademicCouncilApproval('');
    setFormDocuments('');
    setFormStatus('ACTIVE');
  };

  const handleToggle = (id: string) => {
    const apiReg = apiRegulations?.find(r => String(r.id) === id);
    if (apiReg) {
      const newStatus = apiReg.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      toggleMutation.mutate({ id: apiReg.id, newStatus });
    }
  };

  const handleCreate = () => {
    if (
      !formCode ||
      !formName ||
      !formProgramId ||
      !formAcademicYearIntroduced ||
      !formEffFromBatch ||
      !formDuration
    ) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate({
      regulationCode: formCode,
      regulationName: formName,
      programId: Number(formProgramId),
      academicYearIntroduced: formAcademicYearIntroduced,
      effectiveFromBatch: formEffFromBatch,
      effectiveToBatch: formEffToBatch,
      duration: Number(formDuration),
      totalCredits: formTotalCredits ? Number(formTotalCredits) : 0,
      coreCredits: formCoreCredits ? Number(formCoreCredits) : 0,
      professionalElectiveCredits: formProfElectiveCredits ? Number(formProfElectiveCredits) : 0,
      openElectiveCredits: formOpenElectiveCredits ? Number(formOpenElectiveCredits) : 0,
      laboratoryCredits: formLabCredits ? Number(formLabCredits) : 0,
      projectCredits: formProjectCredits ? Number(formProjectCredits) : 0,
      internshipCredits: formInternshipCredits ? Number(formInternshipCredits) : 0,
      internalMarks: formInternalMarks ? Number(formInternalMarks) : 0,
      externalMarks: formExternalMarks ? Number(formExternalMarks) : 0,
      passingMarks: formPassingMarks ? Number(formPassingMarks) : 0,
      gradingSystem: formGradingSystem || '',
      cgpaScale: formCgpaScale ? Number(formCgpaScale) : 0,
      internshipMandatory: formInternshipMandatory,
      internshipDuration: formInternshipDuration || '',
      industryTrainingMandatory: formIndustryTraining,
      miniProjectMandatory: formMiniProject,
      majorProjectMandatory: formMajorProject,
      capstoneProjectMandatory: formCapstoneProject,
      approvedBy: formApprovedBy || '',
      approvalDate: formApprovalDate || '',
      bosApproval: formBosApproval || '',
      academicCouncilApproval: formAcademicCouncilApproval || '',
      documents: formDocuments || '',
      status: formStatus,
    });
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="rounded-lg border">
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12 ml-auto" />
                <Skeleton className="h-5 w-14" />
                <Skeleton className="h-6 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">Failed to load regulations.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const activePrograms = (apiProgramsForReg ?? []).filter(p => p.status === 'ACTIVE');
  const activeAcademicYears = apiAcademicYearsForReg ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Academic Regulations</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Regulation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Academic Regulation</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div>
                <h4 className="text-sm font-semibold mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Regulation Code *</Label>
                    <Input
                      placeholder="e.g., R24"
                      value={formCode}
                      onChange={e => setFormCode(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Regulation Name *</Label>
                    <Input
                      placeholder="e.g., Regulation 2024"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Program *</Label>
                    <Select value={formProgramId} onValueChange={setFormProgramId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {activePrograms.map(p => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Academic Year Introduced *</Label>
                    <Select
                      value={formAcademicYearIntroduced}
                      onValueChange={setFormAcademicYearIntroduced}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeAcademicYears.map(y => (
                          <SelectItem key={y.id} value={y.year}>
                            {y.year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Effective From Batch *</Label>
                    <Input
                      placeholder="e.g., 2024"
                      value={formEffFromBatch}
                      onChange={e => setFormEffFromBatch(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Effective To Batch</Label>
                    <Input
                      placeholder="e.g., 2027"
                      value={formEffToBatch}
                      onChange={e => setFormEffToBatch(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (Years) *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 4"
                      value={formDuration}
                      onChange={e => setFormDuration(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formStatus}
                      onValueChange={(v: 'ACTIVE' | 'INACTIVE') => setFormStatus(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Credit Structure</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Total Credits</Label>
                    <Input
                      type="number"
                      value={formTotalCredits}
                      onChange={e => setFormTotalCredits(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Core Credits</Label>
                    <Input
                      type="number"
                      value={formCoreCredits}
                      onChange={e => setFormCoreCredits(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Professional Elective Credits</Label>
                    <Input
                      type="number"
                      value={formProfElectiveCredits}
                      onChange={e => setFormProfElectiveCredits(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Open Elective Credits</Label>
                    <Input
                      type="number"
                      value={formOpenElectiveCredits}
                      onChange={e => setFormOpenElectiveCredits(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Laboratory Credits</Label>
                    <Input
                      type="number"
                      value={formLabCredits}
                      onChange={e => setFormLabCredits(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Project Credits</Label>
                    <Input
                      type="number"
                      value={formProjectCredits}
                      onChange={e => setFormProjectCredits(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Internship Credits</Label>
                    <Input
                      type="number"
                      value={formInternshipCredits}
                      onChange={e => setFormInternshipCredits(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Evaluation Scheme</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Internal Marks</Label>
                    <Input
                      type="number"
                      value={formInternalMarks}
                      onChange={e => setFormInternalMarks(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>External Marks</Label>
                    <Input
                      type="number"
                      value={formExternalMarks}
                      onChange={e => setFormExternalMarks(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Passing Marks</Label>
                    <Input
                      type="number"
                      value={formPassingMarks}
                      onChange={e => setFormPassingMarks(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grading System</Label>
                    <Input
                      placeholder="e.g., CGPA Based"
                      value={formGradingSystem}
                      onChange={e => setFormGradingSystem(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CGPA Scale</Label>
                    <Input
                      type="number"
                      value={formCgpaScale}
                      onChange={e => setFormCgpaScale(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Mandatory Requirements</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex items-center justify-between p-2 rounded-lg border">
                    <Label className="text-xs">Internship Mandatory</Label>
                    <Switch
                      checked={formInternshipMandatory}
                      onCheckedChange={setFormInternshipMandatory}
                      className="scale-75"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg border">
                    <Label className="text-xs">Industry Training</Label>
                    <Switch
                      checked={formIndustryTraining}
                      onCheckedChange={setFormIndustryTraining}
                      className="scale-75"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg border">
                    <Label className="text-xs">Mini Project</Label>
                    <Switch
                      checked={formMiniProject}
                      onCheckedChange={setFormMiniProject}
                      className="scale-75"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg border">
                    <Label className="text-xs">Major Project</Label>
                    <Switch
                      checked={formMajorProject}
                      onCheckedChange={setFormMajorProject}
                      className="scale-75"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg border">
                    <Label className="text-xs">Capstone Project</Label>
                    <Switch
                      checked={formCapstoneProject}
                      onCheckedChange={setFormCapstoneProject}
                      className="scale-75"
                    />
                  </div>
                </div>
                {formInternshipMandatory && (
                  <div className="mt-3">
                    <Label>Internship Duration</Label>
                    <Input
                      placeholder="e.g., 8 weeks"
                      value={formInternshipDuration}
                      onChange={e => setFormInternshipDuration(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Approvals</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Approved By</Label>
                    <Input
                      placeholder="e.g., Academic Council"
                      value={formApprovedBy}
                      onChange={e => setFormApprovedBy(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Approval Date</Label>
                    <Input
                      type="date"
                      value={formApprovalDate}
                      onChange={e => setFormApprovalDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>BoS Approval</Label>
                    <Input
                      placeholder="e.g., Approved - BoS/2024/02"
                      value={formBosApproval}
                      onChange={e => setFormBosApproval(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Academic Council Approval</Label>
                    <Input
                      placeholder="e.g., Approved - AC/2024/03"
                      value={formAcademicCouncilApproval}
                      onChange={e => setFormAcademicCouncilApproval(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Documents</h4>
                <div className="space-y-2">
                  <Label>Document References</Label>
                  <Input
                    placeholder="Comma-separated document names"
                    value={formDocuments}
                    onChange={e => setFormDocuments(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter comma-separated document names
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding…' : 'Add Regulation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            {!apiRegulations || apiRegulations.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                  No regulations found. Click "Add Regulation" to create one.
                </td>
              </tr>
            ) : (
              apiRegulations.map(reg => (
                <tr key={reg.id} className="border-t hover:bg-muted/30">
                  <td className="py-3 px-4 font-mono font-semibold">{reg.regulationCode}</td>
                  <td className="py-3 px-4">{reg.regulationName}</td>
                  <td className="py-3 px-4">{reg.programName}</td>
                  <td className="py-3 px-4 text-center text-xs">
                    {reg.effectiveFromBatch}
                    {reg.effectiveToBatch ? ` - ${reg.effectiveToBatch}` : ''}
                  </td>
                  <td className="py-3 px-4 text-center">{reg.totalCredits}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={reg.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {reg.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Switch
                        checked={reg.status === 'ACTIVE'}
                        onCheckedChange={() => handleToggle(String(reg.id))}
                        disabled={toggleMutation.isPending}
                        className="scale-75"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setViewReg(reg)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Regulation Dialog */}
      <Dialog open={!!viewReg} onOpenChange={() => setViewReg(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewReg?.regulationCode} - {viewReg?.regulationName}
            </DialogTitle>
          </DialogHeader>
          {viewReg && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Program</Label>
                  <p className="text-sm font-medium">{viewReg.programName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Duration</Label>
                  <p className="text-sm font-medium">{viewReg.duration} Years</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Effective Batch</Label>
                  <p className="text-sm font-medium">
                    {viewReg.effectiveFromBatch}
                    {viewReg.effectiveToBatch ? ` - ${viewReg.effectiveToBatch}` : ''}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge variant={viewReg.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {viewReg.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Credit Structure</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Total Credits</p>
                    <p className="text-lg font-bold">{viewReg.totalCredits}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Core</p>
                    <p className="text-lg font-bold">{viewReg.coreCredits}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Prof. Elective</p>
                    <p className="text-lg font-bold">{viewReg.professionalElectiveCredits}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Open Elective</p>
                    <p className="text-lg font-bold">{viewReg.openElectiveCredits}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Laboratory</p>
                    <p className="text-lg font-bold">{viewReg.laboratoryCredits}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Project</p>
                    <p className="text-lg font-bold">{viewReg.projectCredits}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Internship</p>
                    <p className="text-lg font-bold">{viewReg.internshipCredits}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Evaluation Scheme</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Internal</p>
                    <p className="text-lg font-bold">{viewReg.internalMarks}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">External</p>
                    <p className="text-lg font-bold">{viewReg.externalMarks}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Passing</p>
                    <p className="text-lg font-bold">{viewReg.passingMarks}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Grading</p>
                    <p className="text-sm font-bold">{viewReg.gradingSystem}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">CGPA Scale</p>
                    <p className="text-lg font-bold">{viewReg.cgpaScale}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Internship Requirements</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Internship Mandatory</span>
                      <Badge variant={viewReg.internshipMandatory ? 'default' : 'secondary'}>
                        {viewReg.internshipMandatory ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    {viewReg.internshipDuration && (
                      <div className="flex justify-between text-sm">
                        <span>Duration</span>
                        <span className="font-medium">{viewReg.internshipDuration}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Industry Training</span>
                      <Badge variant={viewReg.industryTrainingMandatory ? 'default' : 'secondary'}>
                        {viewReg.industryTrainingMandatory ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3">Project Requirements</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Mini Project</span>
                      <Badge variant={viewReg.miniProjectMandatory ? 'default' : 'secondary'}>
                        {viewReg.miniProjectMandatory ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Major Project</span>
                      <Badge variant={viewReg.majorProjectMandatory ? 'default' : 'secondary'}>
                        {viewReg.majorProjectMandatory ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Capstone Project</span>
                      <Badge variant={viewReg.capstoneProjectMandatory ? 'default' : 'secondary'}>
                        {viewReg.capstoneProjectMandatory ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Approvals</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Approved By</Label>
                    <p className="text-sm font-medium">{viewReg.approvedBy || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Approval Date</Label>
                    <p className="text-sm font-medium">{viewReg.approvalDate || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">BoS Approval</Label>
                    <p className="text-sm font-medium">{viewReg.bosApproval || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Academic Council</Label>
                    <p className="text-sm font-medium">{viewReg.academicCouncilApproval || '-'}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Documents</h4>
                <div className="flex flex-wrap gap-2">
                  {viewReg.documents ? (
                    viewReg.documents.split(',').map((doc, i) => (
                      <Badge key={i} variant="outline" className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {doc.trim()}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No documents attached</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Program Offerings Tab
const ProgramOfferingsTab = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterYearId, setFilterYearId] = useState<string>('all');

  // ── Form state ──
  const [formAcademicYearId, setFormAcademicYearId] = useState('');
  const [formProgramId, setFormProgramId] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState('');
  const [formSpecializationId, setFormSpecializationId] = useState('');
  const [formRegulationId, setFormRegulationId] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formGeneratedName, setFormGeneratedName] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // ── Determine the academicYearId to pass as a query param ──
  const filterAcademicYearId = filterYearId === 'all' ? undefined : Number(filterYearId);

  // ── Query: fetch all program offerings ──
  const {
    data: apiOfferings,
    isLoading,
    error,
    refetch,
  } = useQuery<ProgramOfferingApiResponse[]>({
    queryKey: ['programOfferings', filterAcademicYearId],
    queryFn: () =>
      institutionAdminService.getProgramOfferings({
        academicYearId: filterAcademicYearId,
      }),
    enabled: isAuthenticated,
  });

  // ── Queries for dropdown data (only when dialog is open) ──
  const { data: apiYearsForOffering } = useQuery<AcademicYearApiResponse[]>({
    queryKey: ['academicYears'],
    queryFn: () => institutionAdminService.getAcademicYears(),
    enabled: showAddDialog,
  });

  const { data: apiProgramsForOffering } = useQuery<ProgramApiResponse[]>({
    queryKey: ['programs'],
    queryFn: () => institutionAdminService.getPrograms(),
    enabled: showAddDialog,
  });

  const { data: apiDeptsForOffering } = useQuery<DepartmentApiResponse[]>({
    queryKey: ['departments'],
    queryFn: () => institutionAdminService.getDepartments(),
    enabled: showAddDialog,
  });

  const { data: apiSpecsForOffering } = useQuery<SpecializationApiResponse[]>({
    queryKey: ['specializations'],
    queryFn: () => institutionAdminService.getSpecializations(),
    enabled: showAddDialog,
  });

  const { data: apiRegsForOffering } = useQuery<RegulationApiResponse[]>({
    queryKey: ['regulations'],
    queryFn: () => institutionAdminService.getRegulations(),
    enabled: showAddDialog,
  });

  // ── Mutation: create program offering ──
  const createMutation = useMutation({
    mutationFn: (data: CreateProgramOfferingRequest) =>
      institutionAdminService.createProgramOffering(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programOfferings'] });
      setShowAddDialog(false);
      resetForm();
      toast.success('Program offering created successfully');
    },
    onError: () => {
      toast.error('Failed to create program offering');
    },
  });

  // ── Mutation: delete program offering ──
  const deleteMutation = useMutation({
    mutationFn: (id: number) => institutionAdminService.deleteProgramOffering(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programOfferings'] });
      toast.success('Program offering deleted');
    },
    onError: () => {
      toast.error('Failed to delete program offering');
    },
  });

  const resetForm = () => {
    setFormAcademicYearId('');
    setFormProgramId('');
    setFormDepartmentId('');
    setFormSpecializationId('');
    setFormRegulationId('');
    setFormDuration('');
    setFormGeneratedName('');
    setFormStatus('ACTIVE');
  };

  const handleCreate = () => {
    if (
      !formAcademicYearId ||
      !formProgramId ||
      !formDepartmentId ||
      !formRegulationId ||
      !formDuration
    ) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate({
      academicYearId: Number(formAcademicYearId),
      programId: Number(formProgramId),
      departmentId: Number(formDepartmentId),
      specializationId: formSpecializationId ? Number(formSpecializationId) : 0,
      regulationId: Number(formRegulationId),
      duration: Number(formDuration),
      generatedName: formGeneratedName || autoName,
      status: formStatus,
    });
  };

  const handleDelete = (id: string) => {
    const offering = apiOfferings?.find(o => String(o.id) === id);
    if (offering) {
      deleteMutation.mutate(offering.id);
    }
  };

  // Auto-generate name when program, department, specialization, and regulation are selected
  const selectedProgram = apiProgramsForOffering?.find(p => String(p.id) === formProgramId);
  const selectedDept = apiDeptsForOffering?.find(d => String(d.id) === formDepartmentId);
  const selectedSpec = apiSpecsForOffering?.find(s => String(s.id) === formSpecializationId);
  const selectedReg = apiRegsForOffering?.find(r => String(r.id) === formRegulationId);
  const autoName = [
    selectedProgram?.name,
    selectedDept?.code,
    selectedSpec?.name,
    selectedReg?.regulationCode,
  ]
    .filter(Boolean)
    .join(' ');

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="rounded-lg border">
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-8 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">Failed to load program offerings.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Program Offerings</h3>
          <Select value={filterYearId} onValueChange={setFilterYearId}>
            <SelectTrigger className="w-36 h-8">
              <SelectValue placeholder="Filter year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {(apiYearsForOffering ?? []).map(y => (
                <SelectItem key={y.id} value={String(y.id)}>
                  {y.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Offering
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Program Offering</DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground mb-4">
              A Program Offering combines: Program + Department + Specialization + Regulation
            </p>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Academic Year *</Label>
                <Select value={formAcademicYearId} onValueChange={setFormAcademicYearId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {(apiYearsForOffering ?? []).map(y => (
                      <SelectItem key={y.id} value={String(y.id)}>
                        {y.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Program *</Label>
                <Select value={formProgramId} onValueChange={setFormProgramId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {(apiProgramsForOffering ?? [])
                      .filter(p => p.status === 'ACTIVE')
                      .map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select value={formDepartmentId} onValueChange={setFormDepartmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {(apiDeptsForOffering ?? [])
                      .filter(d => d.status === 'ACTIVE')
                      .map(d => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.code} - {d.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Select value={formSpecializationId} onValueChange={setFormSpecializationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {(apiSpecsForOffering ?? [])
                      .filter(s => s.status === 'ACTIVE')
                      .map(s => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Regulation *</Label>
                <Select value={formRegulationId} onValueChange={setFormRegulationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {(apiRegsForOffering ?? [])
                      .filter(r => r.status === 'ACTIVE')
                      .map(r => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.regulationCode} - {r.regulationName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (Years) *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 4"
                  value={formDuration}
                  onChange={e => setFormDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Generated Name</Label>
                <Input
                  placeholder="Auto-generated or specify manually"
                  value={formGeneratedName || autoName}
                  onChange={e => setFormGeneratedName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Auto-generated: <strong>{autoName}</strong>
                </p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formStatus}
                  onValueChange={(v: 'ACTIVE' | 'INACTIVE') => setFormStatus(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <p className="text-xs text-muted-foreground">
        No duplicate program offerings allowed. Only active masters can be selected.
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
            {!apiOfferings || apiOfferings.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-muted-foreground">
                  No program offerings found. Click "Create Offering" to create one.
                </td>
              </tr>
            ) : (
              apiOfferings.map(offering => {
                const academicYear = apiYearsForOffering?.find(
                  y => y.id === offering.academicYearId
                );
                return (
                  <tr key={offering.id} className="border-t hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold text-primary">
                      {offering.generatedName}
                    </td>
                    <td className="py-3 px-4">{academicYear?.year ?? offering.academicYearId}</td>
                    <td className="py-3 px-4">{offering.program}</td>
                    <td className="py-3 px-4">{offering.department}</td>
                    <td className="py-3 px-4">{offering.specialization || '-'}</td>
                    <td className="py-3 px-4 font-mono text-xs">{offering.regulation}</td>
                    <td className="py-3 px-4 text-center">{offering.durationYears}Y</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={offering.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {offering.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Program Offering</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete{' '}
                              <strong>{offering.generatedName}</strong>? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(String(offering.id))}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}; // Program Intake Tab
const ProgramIntakeTab = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterYearId, setFilterYearId] = useState<string>('all');

  // ── Form state ──
  const [formAcademicYearId, setFormAcademicYearId] = useState('');
  const [formProgramOfferingId, setFormProgramOfferingId] = useState('');
  const [formSanctionedIntake, setFormSanctionedIntake] = useState('');
  const [formAdmittedIntake, setFormAdmittedIntake] = useState('');
  const [formLateralEntryIntake, setFormLateralEntryIntake] = useState('');
  const [formApprovalAuthority, setFormApprovalAuthority] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // ── Determine the academicYearId to pass as a query param ──
  const filterAcademicYearId = filterYearId === 'all' ? undefined : Number(filterYearId);

  // ── Query: fetch all program intakes ──
  const {
    data: apiIntakes,
    isLoading,
    error,
    refetch,
  } = useQuery<ProgramIntakeApiResponse[]>({
    queryKey: ['programIntakes', filterAcademicYearId],
    queryFn: () =>
      institutionAdminService.getProgramIntakes({
        academicYearId: filterAcademicYearId,
      }),
    enabled: isAuthenticated,
  });

  // ── Queries for dropdown data (only when dialog is open) ──
  const { data: apiYearsForIntake } = useQuery<AcademicYearApiResponse[]>({
    queryKey: ['academicYears'],
    queryFn: () => institutionAdminService.getAcademicYears(),
    enabled: showAddDialog,
  });

  const { data: apiOfferingsForIntake } = useQuery<ProgramOfferingApiResponse[]>({
    queryKey: ['programOfferings'],
    queryFn: () => institutionAdminService.getProgramOfferings(),
    enabled: showAddDialog,
  });

  // Compute auto vacant seats
  const computedVacantSeats = Math.max(
    0,
    (Number(formSanctionedIntake) || 0) - (Number(formAdmittedIntake) || 0)
  );

  // ── Mutation: create program intake ──
  const createMutation = useMutation({
    mutationFn: (data: CreateProgramIntakeRequest) =>
      institutionAdminService.createProgramIntake(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programIntakes'] });
      setShowAddDialog(false);
      resetForm();
      toast.success('Program intake created successfully');
    },
    onError: () => {
      toast.error('Failed to create program intake');
    },
  });

  // ── Mutation: delete program intake ──
  const deleteMutation = useMutation({
    mutationFn: (id: number) => institutionAdminService.deleteProgramIntake(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programIntakes'] });
      toast.success('Program intake deleted');
    },
    onError: () => {
      toast.error('Failed to delete program intake');
    },
  });

  const resetForm = () => {
    setFormAcademicYearId('');
    setFormProgramOfferingId('');
    setFormSanctionedIntake('');
    setFormAdmittedIntake('');
    setFormLateralEntryIntake('');
    setFormApprovalAuthority('');
    setFormStatus('ACTIVE');
  };

  const handleCreate = () => {
    if (
      !formAcademicYearId ||
      !formProgramOfferingId ||
      !formSanctionedIntake ||
      !formAdmittedIntake
    ) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate({
      academicYearId: Number(formAcademicYearId),
      programOfferingId: Number(formProgramOfferingId),
      sanctionedIntake: Number(formSanctionedIntake),
      admittedIntake: Number(formAdmittedIntake),
      lateralEntryIntake: formLateralEntryIntake ? Number(formLateralEntryIntake) : 0,
      approvalAuthority: formApprovalAuthority || '',
      status: formStatus,
    });
  };

  const handleDelete = (id: string) => {
    const intake = apiIntakes?.find(i => String(i.id) === id);
    if (intake) {
      deleteMutation.mutate(intake.id);
    }
  };

  // ── Summary totals ──
  const totalSanctioned = (apiIntakes ?? []).reduce((s, i) => s + i.sanctionedIntake, 0);
  const totalAdmitted = (apiIntakes ?? []).reduce((s, i) => s + i.admittedIntake, 0);
  const totalVacant = (apiIntakes ?? []).reduce((s, i) => s + i.vacantSeats, 0);

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <div className="rounded-lg border">
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-8 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">Failed to load program intakes.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Program Intake</h3>
          <Select value={filterYearId} onValueChange={setFilterYearId}>
            <SelectTrigger className="w-36 h-8">
              <SelectValue placeholder="Filter year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {(apiYearsForIntake ?? []).map(y => (
                <SelectItem key={y.id} value={String(y.id)}>
                  {y.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Intake
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Program Intake</DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground mb-2">
              Vacant Seats = Sanctioned Intake - Admitted Intake
            </p>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Academic Year *</Label>
                <Select value={formAcademicYearId} onValueChange={setFormAcademicYearId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {(apiYearsForIntake ?? []).map(y => (
                      <SelectItem key={y.id} value={String(y.id)}>
                        {y.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Program Offering *</Label>
                <Select value={formProgramOfferingId} onValueChange={setFormProgramOfferingId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {(apiOfferingsForIntake ?? [])
                      .filter(o => o.status === 'ACTIVE')
                      .map(o => (
                        <SelectItem key={o.id} value={String(o.id)}>
                          {o.generatedName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Sanctioned Intake *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 120"
                    value={formSanctionedIntake}
                    onChange={e => setFormSanctionedIntake(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Admitted Intake *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 118"
                    value={formAdmittedIntake}
                    onChange={e => setFormAdmittedIntake(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lateral Entry Intake</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 12"
                    value={formLateralEntryIntake}
                    onChange={e => setFormLateralEntryIntake(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vacant Seats (Auto)</Label>
                  <Input disabled value={computedVacantSeats} className="bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Approval Authority</Label>
                <Input
                  placeholder="e.g., AICTE"
                  value={formApprovalAuthority}
                  onChange={e => setFormApprovalAuthority(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formStatus}
                  onValueChange={(v: 'ACTIVE' | 'INACTIVE') => setFormStatus(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding…' : 'Add Intake'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            {!apiIntakes || apiIntakes.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-muted-foreground">
                  No program intakes found. Click "Add Intake" to create one.
                </td>
              </tr>
            ) : (
              apiIntakes.map(intake => {
                const offering = apiOfferingsForIntake?.find(
                  o => o.id === intake.programOfferingId
                );
                const academicYear = apiYearsForIntake?.find(y => y.id === intake.academicYearId);
                return (
                  <tr key={intake.id} className="border-t hover:bg-muted/30">
                    <td className="py-3 px-4 font-semibold">
                      {offering?.generatedName ?? intake.programOfferingId}
                    </td>
                    <td className="py-3 px-4">{academicYear?.year ?? intake.academicYearId}</td>
                    <td className="py-3 px-4 text-center font-medium">{intake.sanctionedIntake}</td>
                    <td className="py-3 px-4 text-center">{intake.admittedIntake}</td>
                    <td className="py-3 px-4 text-center">{intake.lateralEntryIntake || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={intake.vacantSeats === 0 ? 'default' : 'secondary'}
                        className={intake.vacantSeats === 0 ? 'bg-green-100 text-green-700' : ''}
                      >
                        {intake.vacantSeats}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{intake.approvalAuthority || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={intake.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {intake.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Program Intake</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this intake record? This action cannot
                              be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(String(intake.id))}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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
          Configure the academic hierarchy: Academic Year → Program → Department → Specialization →
          Regulation → Program Offering → Program Intake
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl flex-wrap gap-0.5">
          <TabsTrigger
            value="dashboard"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="academic-years"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg"
          >
            <Calendar className="h-3.5 w-3.5" />
            Academic Years
          </TabsTrigger>
          <TabsTrigger
            value="programs"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Programs
          </TabsTrigger>
          <TabsTrigger
            value="departments"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg"
          >
            <Building2 className="h-3.5 w-3.5" />
            Departments
          </TabsTrigger>
          <TabsTrigger
            value="specializations"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg"
          >
            <Layers className="h-3.5 w-3.5" />
            Specializations
          </TabsTrigger>
          <TabsTrigger
            value="regulations"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Regulations
          </TabsTrigger>
          <TabsTrigger
            value="offerings"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg"
          >
            <Combine className="h-3.5 w-3.5" />
            Program Offerings
          </TabsTrigger>
          <TabsTrigger
            value="intake"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg"
          >
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
          <TabsContent value="dashboard" className="mt-0">
            <DashboardTab />
          </TabsContent>
          <TabsContent value="academic-years" className="mt-0">
            <AcademicYearsTab />
          </TabsContent>
          <TabsContent value="programs" className="mt-0">
            <ProgramsTab />
          </TabsContent>
          <TabsContent value="departments" className="mt-0">
            <DepartmentsTab />
          </TabsContent>
          <TabsContent value="specializations" className="mt-0">
            <SpecializationsTab />
          </TabsContent>
          <TabsContent value="regulations" className="mt-0">
            <AcademicRegulationsTab />
          </TabsContent>
          <TabsContent value="offerings" className="mt-0">
            <ProgramOfferingsTab />
          </TabsContent>
          <TabsContent value="intake" className="mt-0">
            <ProgramIntakeTab />
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
};

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  TrendingUp,
  Plus,
  BookOpen,
  Users,
  FlaskConical,
  Landmark,
  GraduationCap,
  Briefcase,
  Wrench,
  CalendarDays,
  User,
  Target,
  PlayCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import {
  addInitiative,
  selectInitiatives,
  updateInitiative,
  updateInitiativeStatus,
} from '@/store/slices/iqacSlice';
import { ACADEMIC_YEARS, DEPARTMENT_OPTIONS } from '../iqac-data';
import type { ImprovementInitiative, InitiativeInput, InitiativeStatus } from '../types';
import { FilterBar, FilterSelect, SearchInput, StatCard } from './common';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  'Curriculum Revision',
  'Faculty Development',
  'Laboratory Enhancement',
  'Student Skill Development',
  'Research Promotion',
  'Industry Interaction',
  'Infrastructure Improvement',
];

const STATUS_META: Record<InitiativeStatus, { label: string; badge: string; icon: React.ElementType }> = {
  'not-started': { label: 'Not Started', badge: 'bg-slate-500/10 text-slate-600 border-slate-500/20', icon: Clock },
  'in-progress': { label: 'In Progress', badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: PlayCircle },
  'on-track': { label: 'On Track', badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: TrendingUp },
  delayed: { label: 'Delayed', badge: 'bg-red-500/10 text-red-600 border-red-500/20', icon: AlertTriangle },
  completed: { label: 'Completed', badge: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: CheckCircle2 },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Curriculum Revision': BookOpen,
  'Faculty Development': Users,
  'Laboratory Enhancement': Wrench,
  'Student Skill Development': GraduationCap,
  'Research Promotion': FlaskConical,
  'Industry Interaction': Briefcase,
  'Infrastructure Improvement': Landmark,
};

const DEFAULT_FORM: InitiativeInput = {
  title: '',
  category: CATEGORIES[0],
  department: 'All Departments',
  academicYear: '2025-26',
  description: '',
  owner: '',
  startDate: '',
  targetDate: '',
  status: 'not-started',
  outcome: '',
};

export function ContinuousImprovement() {
  const dispatch = useAppDispatch();
  const { isImpersonating } = useAuth();
  const initiatives = useAppSelector(selectInitiatives);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<InitiativeInput>(DEFAULT_FORM);
  const [editing, setEditing] = useState<ImprovementInitiative | null>(null);
  const [editOutcome, setEditOutcome] = useState('');

  const stats = useMemo(
    () => ({
      total: initiatives.length,
      inProgress: initiatives.filter((i) => i.status === 'in-progress' || i.status === 'on-track').length,
      delayed: initiatives.filter((i) => i.status === 'delayed').length,
      completed: initiatives.filter((i) => i.status === 'completed').length,
    }),
    [initiatives]
  );

  const filtered = useMemo(
    () =>
      initiatives.filter((i) => {
        const matchesSearch =
          !search ||
          i.title.toLowerCase().includes(search.toLowerCase()) ||
          i.category.toLowerCase().includes(search.toLowerCase()) ||
          i.owner.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter;
        const matchesDept = deptFilter === 'all' || i.department === deptFilter;
        return matchesSearch && matchesStatus && matchesCategory && matchesDept;
      }),
    [initiatives, search, statusFilter, categoryFilter, deptFilter]
  );

  const submit = () => {
    if (!form.title.trim() || !form.owner.trim() || !form.startDate || !form.targetDate) {
      toast.error('Please fill the title, owner, start date and target date.');
      return;
    }
    dispatch(addInitiative(form));
    toast.success('Quality initiative added to the tracker.');
    setCreateOpen(false);
    setForm(DEFAULT_FORM);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Continuous Improvement
          </h2>
          <p className="text-xs text-muted-foreground">
            Track institutional quality initiatives — curriculum, faculty, labs, research, industry & infrastructure.
          </p>
        </div>
        {isImpersonating ? (
          <Badge
            variant="outline"
            className="gap-1 border-amber-300/50 text-[10px] font-medium text-amber-700 dark:text-amber-400"
          >
            <Eye className="h-3 w-3" /> Read-only preview
          </Badge>
        ) : (
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Add Initiative
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={TrendingUp} label="Total Initiatives" value={`${stats.total}`} tone="text-primary" iconBg="bg-primary/10" />
        <StatCard icon={PlayCircle} label="Active" value={`${stats.inProgress}`} tone="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950/40" />
        <StatCard icon={AlertTriangle} label="Delayed" value={`${stats.delayed}`} tone="text-red-600" iconBg="bg-red-50 dark:bg-red-950/40" />
        <StatCard icon={CheckCircle2} label="Completed" value={`${stats.completed}`} tone="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950/40" />
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <FilterBar>
            <SearchInput value={search} onChange={setSearch} placeholder="Search initiatives…" className="w-56" />
            <FilterSelect value={statusFilter} onValueChange={setStatusFilter} options={[{ value: 'all', label: 'All Statuses' }, ...Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label }))]} placeholder="Status" />
            <FilterSelect value={categoryFilter} onValueChange={setCategoryFilter} options={[{ value: 'all', label: 'All Categories' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]} placeholder="Category" />
            <FilterSelect value={deptFilter} onValueChange={setDeptFilter} options={[{ value: 'all', label: 'All Departments' }, ...DEPARTMENT_OPTIONS.filter((d) => d.value !== 'all'), { value: 'All Departments', label: 'Institution-wide' }]} placeholder="Department" />
            <span className="ml-auto text-[11px] text-muted-foreground">{filtered.length} initiatives</span>
          </FilterBar>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map((init) => {
          const Icon = CATEGORY_ICONS[init.category] ?? TrendingUp;
          const meta = STATUS_META[init.status];
          const StatusIcon = meta.icon;
          return (
            <Card key={init.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="p-2.5 rounded-lg bg-primary/5 shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{init.title}</p>
                      <Badge variant="outline" className={cn('text-[9px] gap-1', meta.badge)}>
                        <StatusIcon className="h-3 w-3" /> {meta.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <Badge variant="secondary" className="text-[9px]">{init.category}</Badge>
                      <Badge variant="secondary" className="text-[9px]">{init.department}</Badge>
                      <Badge variant="secondary" className="text-[9px]">{init.academicYear}</Badge>
                    </div>
                  </div>
                  {isImpersonating ? (
                    <Badge variant="outline" className={cn('text-[9px] gap-1', meta.badge)}>
                      <StatusIcon className="h-3 w-3" /> {meta.label}
                    </Badge>
                  ) : (
                    <Select
                      value={init.status}
                      onValueChange={(v) => {
                        dispatch(updateInitiativeStatus({ id: init.id, status: v as InitiativeStatus }));
                        toast.success(`Initiative marked ${STATUS_META[v as InitiativeStatus].label}.`);
                      }}
                    >
                      <SelectTrigger className="h-7 w-[120px] text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_META).map(([value, m]) => (
                          <SelectItem key={value} value={value} className="text-xs">{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mt-3">{init.description}</p>

                <div className="grid grid-cols-2 gap-3 mt-3 text-[11px]">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-3 w-3" /> <span className="font-medium text-foreground">{init.owner}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="h-3 w-3" /> {init.startDate} → {init.targetDate}
                  </div>
                </div>

                {init.outcome && (
                  <div className="mt-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2.5">
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                      <Target className="h-3 w-3" /> Outcome
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{init.outcome}</p>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-end gap-2">
                  {!isImpersonating && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] gap-1"
                      onClick={() => {
                        setEditing(init);
                        setEditOutcome(init.outcome ?? '');
                      }}
                    >
                      <Target className="h-3 w-3" /> Update Outcome
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="xl:col-span-2">
            <CardContent className="p-8 text-center text-muted-foreground text-xs">
              No initiatives match the current filters.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Add Quality Initiative
            </DialogTitle>
            <DialogDescription>
              Record an institutional continuous improvement initiative with an owner and target date.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Outcome-Based Curriculum Revision 2026" className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Department *</Label>
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Departments" className="text-xs">Institution-wide</SelectItem>
                  {DEPARTMENT_OPTIONS.filter((d) => d.value !== 'all').map((d) => (
                    <SelectItem key={d.value} value={d.value} className="text-xs">{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Academic Year *</Label>
              <Select value={form.academicYear} onValueChange={(v) => setForm({ ...form, academicYear: v })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACADEMIC_YEARS.map((y) => (
                    <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Owner *</Label>
              <Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="e.g. Dean Academics" className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Start Date *</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Target Date *</Label>
              <Input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className="h-9 text-xs" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Description *</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the initiative…" className="text-xs min-h-[70px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submit}>Add Initiative</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Outcome edit dialog */}
      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Update Outcome</DialogTitle>
            <DialogDescription>{editing?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label className="text-xs">Outcome</Label>
            <Textarea
              value={editOutcome}
              onChange={(e) => setEditOutcome(e.target.value)}
              placeholder="Describe the achieved outcome or current progress…"
              className="text-xs min-h-[90px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button
              size="sm"
              onClick={() => {
                if (editing) {
                  dispatch(updateInitiative({ id: editing.id, changes: { outcome: editOutcome } }));
                  toast.success('Outcome updated.');
                  setEditing(null);
                }
              }}
            >
              Save Outcome
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

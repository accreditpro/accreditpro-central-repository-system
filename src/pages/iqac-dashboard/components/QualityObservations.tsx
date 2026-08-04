import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  MessageSquareWarning,
  Plus,
  Eye,
  Trash2,
  Workflow,
  CalendarDays,
  Building2,
  Database,
  Target,
  User,
  CheckCircle2,
  RotateCcw,
  PlayCircle,
  XCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  addObservation,
  deleteObservation,
  selectObservations,
  setObservationPriority,
  setObservationStatus,
} from '@/store/slices/iqacSlice';
import {
  ACADEMIC_YEARS,
  DEPARTMENT_OPTIONS,
  FRAMEWORK_OPTIONS,
  REPOSITORY_LIST,
} from '../iqac-data';
import type {
  AccreditationFramework,
  ObservationInput,
  ObservationPriority,
  ObservationStatus,
  QualityObservation,
} from '../types';
import {
  FilterBar,
  FilterSelect,
  ObsStatusBadge,
  OBS_STATUS_META,
  PRIORITY_META,
  PriorityBadge,
  SearchInput,
  StatCard,
} from './common';
import { cn } from '@/lib/utils';

const PRIORITY_OPTIONS: { value: ObservationPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const STATUS_OPTIONS: { value: ObservationStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const WORKFLOW_STEPS = [
  { label: 'IQAC Observation', icon: MessageSquareWarning },
  { label: 'Department Coordinator', icon: Building2 },
  { label: 'Update Repository', icon: Database },
  { label: 'HOD Approval', icon: Target },
  { label: 'Observation Closed', icon: CheckCircle2 },
];

const DEFAULT_FORM: ObservationInput = {
  title: '',
  department: 'CSE',
  repository: 'Academic',
  academicYear: '2025-26',
  framework: 'NAAC',
  criterion: '',
  priority: 'medium',
  description: '',
  recommendedAction: '',
  dueDate: '',
};

export function QualityObservations() {
  const dispatch = useAppDispatch();
  const observations = useAppSelector(selectObservations);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [frameworkFilter, setFrameworkFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<ObservationInput>(DEFAULT_FORM);
  const [viewObs, setViewObs] = useState<QualityObservation | null>(null);

  const stats = useMemo(() => {
    const active = observations.filter((o) => o.status !== 'closed');
    return {
      total: observations.length,
      open: observations.filter((o) => o.status === 'open').length,
      inProgress: observations.filter((o) => o.status === 'in-progress').length,
      resolved: observations.filter((o) => o.status === 'resolved').length,
      closed: observations.filter((o) => o.status === 'closed').length,
      critical: active.filter((o) => o.priority === 'critical').length,
    };
  }, [observations]);

  const filtered = useMemo(
    () =>
      observations.filter((o) => {
        const matchesSearch =
          !search ||
          o.title.toLowerCase().includes(search.toLowerCase()) ||
          o.department.toLowerCase().includes(search.toLowerCase()) ||
          o.repository.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || o.priority === priorityFilter;
        const matchesDept = deptFilter === 'all' || o.department === deptFilter;
        const matchesFramework = frameworkFilter === 'all' || o.framework === frameworkFilter;
        return matchesSearch && matchesStatus && matchesPriority && matchesDept && matchesFramework;
      }),
    [observations, search, statusFilter, priorityFilter, deptFilter, frameworkFilter]
  );

  const submit = () => {
    if (!form.title.trim() || !form.description.trim() || !form.dueDate) {
      toast.error('Please fill the title, description and due date.');
      return;
    }
    dispatch(addObservation({ ...form }));
    toast.success('Quality observation raised and assigned to the department.');
    setCreateOpen(false);
    setForm(DEFAULT_FORM);
  };

  const changeStatus = (obs: QualityObservation, status: ObservationStatus) => {
    dispatch(setObservationStatus({ id: obs.id, status }));
    const label = OBS_STATUS_META[status].label;
    toast.success(`Observation marked as ${label}.`);
  };

  const changePriority = (obs: QualityObservation, priority: ObservationPriority) => {
    dispatch(setObservationPriority({ id: obs.id, priority }));
    toast.success(`Priority updated to ${PRIORITY_META[priority].label}.`);
  };

  const closeObservation = (obs: QualityObservation) => {
    dispatch(
      setObservationStatus({
        id: obs.id,
        status: 'closed',
        resolution: 'Closed by IQAC after department update and HOD re-approval.',
      })
    );
    toast.success('Observation closed. Workflow complete.');
  };

  const remove = (id: string) => {
    dispatch(deleteObservation(id));
    toast.success('Observation deleted.');
  };

  const nextStatus = (obs: QualityObservation): ObservationStatus => {
    if (obs.status === 'open') return 'in-progress';
    if (obs.status === 'in-progress') return 'resolved';
    return 'closed';
  };

  return (
    <div className="space-y-6">
      {/* Header + create */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <MessageSquareWarning className="h-4 w-4 text-primary" />
            Quality Observations
          </h2>
          <p className="text-xs text-muted-foreground">
            IQAC does not approve evidence — it raises observations and tracks them to closure.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Raise Observation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard icon={MessageSquareWarning} label="Total" value={`${stats.total}`} tone="text-primary" iconBg="bg-primary/10" />
        <StatCard icon={MessageSquareWarning} label="Open" value={`${stats.open}`} tone="text-red-600" iconBg="bg-red-50 dark:bg-red-950/40" />
        <StatCard icon={RotateCcw} label="In Progress" value={`${stats.inProgress}`} tone="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950/40" />
        <StatCard icon={PlayCircle} label="Resolved" value={`${stats.resolved}`} tone="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950/40" />
        <StatCard icon={CheckCircle2} label="Closed" value={`${stats.closed}`} tone="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950/40" />
        <StatCard icon={XCircle} label="Critical Active" value={`${stats.critical}`} tone="text-red-600" iconBg="bg-red-50 dark:bg-red-950/40" />
      </div>

      {/* Workflow */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Workflow className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold">Observation Workflow</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border bg-muted/30 px-2.5 py-1.5">
                  <step.icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-medium">{step.label}</span>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
            <span className="ml-auto text-[10px] text-muted-foreground">
              {observations.length} observation{observations.length !== 1 ? 's' : ''} tracked by IQAC
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <FilterBar>
            <SearchInput value={search} onChange={setSearch} placeholder="Search observations…" className="w-56" />
            <FilterSelect value={statusFilter} onValueChange={setStatusFilter} options={[{ value: 'all', label: 'All Statuses' }, ...STATUS_OPTIONS]} placeholder="Status" />
            <FilterSelect value={priorityFilter} onValueChange={setPriorityFilter} options={[{ value: 'all', label: 'All Priorities' }, ...PRIORITY_OPTIONS]} placeholder="Priority" />
            <FilterSelect value={deptFilter} onValueChange={setDeptFilter} options={DEPARTMENT_OPTIONS} placeholder="Department" />
            <FilterSelect value={frameworkFilter} onValueChange={setFrameworkFilter} options={[{ value: 'all', label: 'All Frameworks' }, ...FRAMEWORK_OPTIONS]} placeholder="Framework" />
            <span className="ml-auto text-[11px] text-muted-foreground">{filtered.length} observation{filtered.length !== 1 ? 's' : ''}</span>
          </FilterBar>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs min-w-[860px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Observation</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Department</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Repository</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Framework</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Priority</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Due Date</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((obs) => (
                  <motion.tr
                    key={obs.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                  >
                    <td className="p-3">
                      <button className="text-left" onClick={() => setViewObs(obs)}>
                        <p className="font-semibold hover:text-primary transition-colors">{obs.title}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                          <CalendarDays className="h-3 w-3" /> {obs.academicYear}
                          {obs.criterion && <span>· {obs.criterion}</span>}
                        </p>
                      </button>
                    </td>
                    <td className="p-3 text-center">{obs.department}</td>
                    <td className="p-3 text-center text-muted-foreground">{obs.repository}</td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className="text-[9px]">{obs.framework}</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Select value={obs.priority} onValueChange={(v) => changePriority(obs, v as ObservationPriority)}>
                        <SelectTrigger className="h-6 w-[90px] text-[10px] border-0 bg-transparent hover:bg-muted/40">
                          <PriorityBadge priority={obs.priority} />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((p) => (
                            <SelectItem key={p.value} value={p.value} className="text-xs">
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-center">
                      <Select value={obs.status} onValueChange={(v) => changeStatus(obs, v as ObservationStatus)}>
                        <SelectTrigger className="h-6 w-[110px] text-[10px] border-0 bg-transparent hover:bg-muted/40">
                          <ObsStatusBadge status={obs.status} />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value} className="text-xs">
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-center">
                      <span className={cn('font-medium', obs.dueDate < new Date().toISOString().slice(0, 10) && obs.status !== 'closed' && obs.status !== 'resolved' ? 'text-red-600' : '')}>
                        {obs.dueDate}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewObs(obs)} title="View details">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {obs.status !== 'closed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] gap-1"
                            onClick={() => changeStatus(obs, nextStatus(obs))}
                            title={`Advance to ${OBS_STATUS_META[nextStatus(obs)].label}`}
                          >
                            {obs.status === 'in-progress' ? (
                              <CheckCircle2 className="h-3 w-3 text-blue-500" />
                            ) : (
                              <PlayCircle className="h-3 w-3 text-amber-500" />
                            )}
                            {nextStatus(obs) === 'closed' ? 'Close' : OBS_STATUS_META[nextStatus(obs)].label}
                          </Button>
                        )}
                        {obs.status === 'resolved' && (
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => closeObservation(obs)}>
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Close
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-600" onClick={() => remove(obs.id)} title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground text-xs">
                    No observations match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquareWarning className="h-4 w-4 text-primary" />
              Raise Quality Observation
            </DialogTitle>
            <DialogDescription>
              IQAC raises observations and assigns them to departments. The department coordinator updates the repository, the HOD re-approves, and the observation closes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Observation Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Research Repository readiness below 70%" className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Department *</Label>
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENT_OPTIONS.filter((d) => d.value !== 'all').map((d) => (
                    <SelectItem key={d.value} value={d.value} className="text-xs">{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Repository *</Label>
              <Select value={form.repository} onValueChange={(v) => setForm({ ...form, repository: v })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REPOSITORY_LIST.map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
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
              <Label className="text-xs">Accreditation Framework *</Label>
              <Select value={form.framework} onValueChange={(v) => setForm({ ...form, framework: v as AccreditationFramework })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FRAMEWORK_OPTIONS.map((f) => (
                    <SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Criterion (optional)</Label>
              <Input value={form.criterion ?? ''} onChange={(e) => setForm({ ...form, criterion: e.target.value })} placeholder="e.g. C3 — Research, Innovations & Extension" className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Priority *</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as ObservationPriority })}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Due Date *</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="h-9 text-xs" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Description *</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the quality gap in detail…" className="text-xs min-h-[70px]" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Recommended Action *</Label>
              <Textarea value={form.recommendedAction} onChange={(e) => setForm({ ...form, recommendedAction: e.target.value })} placeholder="What should the department do to close this observation?" className="text-xs min-h-[60px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submit}>Raise Observation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View details dialog */}
      <Dialog open={viewObs !== null} onOpenChange={(o) => !o && setViewObs(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">{viewObs?.title}</DialogTitle>
          </DialogHeader>
          {viewObs && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[9px] gap-1"><Building2 className="h-3 w-3" /> {viewObs.department}</Badge>
                <Badge variant="outline" className="text-[9px] gap-1"><Database className="h-3 w-3" /> {viewObs.repository}</Badge>
                <Badge variant="outline" className="text-[9px]">{viewObs.framework}{viewObs.criterion ? ` · ${viewObs.criterion}` : ''}</Badge>
                <PriorityBadge priority={viewObs.priority} />
                <ObsStatusBadge status={viewObs.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Academic Year</p>
                  <p className="font-medium">{viewObs.academicYear}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Due Date</p>
                  <p className="font-medium">{viewObs.dueDate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Raised By</p>
                  <p className="font-medium">{viewObs.createdBy} · {viewObs.createdAt}</p>
                </div>
                {viewObs.assignedTo && (
                  <div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" /> Assigned To</p>
                    <p className="font-medium">{viewObs.assignedTo}</p>
                  </div>
                )}
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                <p className="text-xs leading-relaxed">{viewObs.description}</p>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">Recommended Action</p>
                <p className="text-xs leading-relaxed">{viewObs.recommendedAction}</p>
              </div>
              {viewObs.resolution && (
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Resolution{viewObs.resolvedAt ? ` · ${viewObs.resolvedAt}` : ''}</p>
                  <p className="text-xs leading-relaxed">{viewObs.resolution}</p>
                </div>
              )}
            </div>
          )}
          {viewObs && viewObs.status !== 'closed' && (
            <DialogFooter>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  closeObservation(viewObs);
                  setViewObs(null);
                }}
              >
                <CheckCircle2 className="h-4 w-4" /> Close Observation
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

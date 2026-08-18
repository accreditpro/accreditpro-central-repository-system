import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { EvidencePreviewDialog, EvidencePreviewData } from '@/components/shared/EvidencePreviewDialog';
import { useAppDispatch } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';
import { hodService } from '@/services/hod.service';
import { EvidenceItem } from '../hod-configs';
import {
  STATUS_META,
  REPO_ICONS,
  REPO_ACCENT,
  getFileIcon,
  formatDate,
  downloadItem,
  buildPreviewData,
  buildRepoGroups,
  RepoGroup,
} from './evidence-utils';
import { cn } from '@/lib/utils';
import { useReadOnly } from '@/hooks/useReadOnly';
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Download,
  Filter,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Clock,
  CheckCheck,
  ShieldCheck,
  AlertTriangle,
  MessageSquareWarning,
  Loader2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Pending Approvals — every section & category that is awaiting the HOD's
// decision. Approving / rejecting here is persisted through the backend
// evidence review API, so all views agree.
// ---------------------------------------------------------------------------

export function ApprovalQueue({ academicYear }: { academicYear: string }) {
  const isReadOnly = useReadOnly();
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [repositoryFilter, setRepositoryFilter] = useState<string>('all');
  // Pending-only by default — the queue is for approvals that need action.
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [collapsedRepos, setCollapsedRepos] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [previewData, setPreviewData] = useState<EvidencePreviewData | null>(null);
  const [action, setAction] = useState<{ type: 'approve' | 'reject' | 'changes'; item: EvidenceItem } | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCollapsedRepos(new Set());
    setCollapsedSections(new Set());
    setPreviewData(null);
    setAction(null);
    hodService
      .getEvidence({ academicYear, page: 0, size: 200, sortBy: 'uploadDate', sortDirection: 'DESC' })
      .then((data) => {
        if (!cancelled) setItems(data.content as EvidenceItem[]);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load the approval queue. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [academicYear]);

  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !q ||
        item.documentName.toLowerCase().includes(q) ||
        item.documentCategory.toLowerCase().includes(q) ||
        item.section.toLowerCase().includes(q) ||
        item.repository.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesRepo = repositoryFilter === 'all' || item.repository === repositoryFilter;
      return matchesSearch && matchesStatus && matchesRepo;
    });
  }, [items, searchTerm, statusFilter, repositoryFilter]);

  const repoGroups = useMemo<RepoGroup[]>(() => buildRepoGroups(filteredItems), [filteredItems]);

  const counts = useMemo(() => {
    const c = { total: items.length, pending: 0, approved: 0, rejected: 0, changes: 0 };
    items.forEach((i) => {
      if (i.status === 'pending') c.pending += 1;
      else if (i.status === 'approved') c.approved += 1;
      else if (i.status === 'rejected') c.rejected += 1;
      else c.changes += 1;
    });
    return c;
  }, [items]);

  const toggleRepo = (repo: string) => {
    setCollapsedRepos((prev) => {
      const next = new Set(prev);
      if (next.has(repo)) next.delete(repo);
      else next.add(repo);
      return next;
    });
  };

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // -------------------------------------------------------------------------
  // Decisions — persisted through the backend evidence review API
  // -------------------------------------------------------------------------
  const applyAction = async () => {
    if (!action) return;
    const { type, item } = action;
    if (type !== 'approve' && !note.trim()) {
      toast.error('Please add a reason before submitting');
      return;
    }
    const nextStatus = type === 'approve' ? 'approved' : type === 'reject' ? 'rejected' : 'changes-requested';
    setSubmitting(true);
    try {
      const updated = await hodService.reviewEvidence(item.id, { action: nextStatus, note: note.trim() || undefined });
      setItems((prev) => prev.map((it) => (it.id === item.id ? (updated as unknown as EvidenceItem) : it)));
      toast.success(
        type === 'approve'
          ? `"${item.documentName}" approved`
          : type === 'reject'
            ? `"${item.documentName}" rejected`
            : `Changes requested for "${item.documentName}"`
      );
      dispatch(
        addNotification({
          title: type === 'approve' ? 'Evidence approved by HOD' : 'Evidence returned by HOD',
          message:
            type === 'approve'
              ? `"${item.documentName}" (${item.repository}) is HOD-approved — ready for IQAC verification.`
              : `"${item.documentName}" (${item.repository}) was ${type === 'reject' ? 'rejected' : 'sent back for changes'}.`,
          type: type === 'approve' ? 'success' : 'warning',
          read: false,
        })
      );
      setAction(null);
      setNote('');
    } catch {
      toast.error('Failed to save the review decision. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const approveSection = async (repository: string, section: string) => {
    const pending = items.filter(
      (i) => i.repository === repository && i.section === section && i.status === 'pending'
    );
    if (pending.length === 0) return;
    setSubmitting(true);
    try {
      const ids = pending.map((i) => Number(i.id)).filter((n) => !Number.isNaN(n));
      const updated = await hodService.bulkReviewEvidence({ evidenceIds: ids, action: 'approved' });
      const updatedById = new Map(updated.map((u) => [u.id, u as unknown as EvidenceItem]));
      setItems((prev) => prev.map((it) => updatedById.get(it.id) ?? it));
      toast.success(`Approved ${updated.length} document(s) in ${section}`);
    } catch {
      toast.error('Failed to approve the documents. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = async (item: EvidenceItem) => {
    setPreviewData(await buildPreviewData(item));
  };

  const actionMeta = {
    approve: { title: 'Approve Document', icon: <CheckCircle2 className="h-4 w-4 text-green-600" />, buttonClass: 'bg-green-600 hover:bg-green-700 text-white', buttonLabel: 'Approve' },
    reject: { title: 'Reject Document', icon: <XCircle className="h-4 w-4 text-red-600" />, buttonClass: 'bg-red-600 hover:bg-red-700 text-white', buttonLabel: 'Reject' },
    changes: { title: 'Request Changes', icon: <RotateCcw className="h-4 w-4 text-purple-600" />, buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white', buttonLabel: 'Request Changes' },
  };

  const summaryCards = [
    { label: 'Pending Approvals', value: counts.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { label: 'Approved', value: counts.approved, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-500/10' },
    { label: 'Changes Requested', value: counts.changes, icon: RotateCcw, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { label: 'Rejected', value: counts.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border shadow-sm">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-2.5">
                  <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', stat.bg)}>
                    <Icon className={cn('h-4 w-4', stat.color)} />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className={cn('text-xl font-bold leading-tight', stat.color)}>{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents, categories, repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="changes-requested">Changes Requested</SelectItem>
                </SelectContent>
              </Select>
              <Select value={repositoryFilter} onValueChange={setRepositoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Repository" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Repositories</SelectItem>
                  {repoGroups.map((g) => (
                    <SelectItem key={g.repository} value={g.repository}>{g.repository}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading approval queue...
        </div>
      )}

      {/* Pending approvals grouped by section & category */}
      {!loading && (
        <div className="space-y-4">
          {repoGroups.length === 0 && (
            <Card>
              <CardContent className="p-10 text-center">
                <CheckCheck className="h-10 w-10 mx-auto text-emerald-500/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  {statusFilter === 'pending' ? 'No pending approvals — you are all caught up!' : 'No documents match your filters'}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {statusFilter === 'pending' ? 'Everything has been reviewed and approved.' : 'Try clearing the search or filters.'}
                </p>
              </CardContent>
            </Card>
          )}

          {repoGroups.map((group) => {
            const isCollapsed = collapsedRepos.has(group.repository);
            const pendingCount = group.sections.reduce(
              (sum, s) => sum + s.items.filter((i) => i.status === 'pending').length,
              0
            );
            const Icon = REPO_ICONS[group.repository] || FolderOpen;
            const accent = REPO_ACCENT[group.repository] || 'text-primary bg-primary/10 border-primary/30';

            return (
              <Card key={group.repository} className="border shadow-sm overflow-hidden">
                {/* Repository header */}
                <button
                  onClick={() => toggleRepo(group.repository)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors"
                >
                  <div className={cn('h-10 w-10 rounded-xl border flex items-center justify-center shrink-0', accent)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold">{group.repository} Repository</h3>
                      <Badge variant="outline" className="text-[9px]">
                        {group.sections.length} section{group.sections.length !== 1 ? 's' : ''}
                      </Badge>
                      {pendingCount > 0 && (
                        <Badge variant="secondary" className="text-[9px] bg-amber-500/10 text-amber-600">
                          <Clock className="h-2.5 w-2.5 mr-1" /> {pendingCount} pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-semibold text-muted-foreground">{group.total} docs</span>
                    {isCollapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border/50"
                    >
                      <div className="divide-y divide-border/50">
                        {group.sections.map((section) => {
                          const secKey = `${group.repository}::${section.section}`;
                          const secCollapsed = collapsedSections.has(secKey);
                          const secPending = section.items.filter((i) => i.status === 'pending').length;
                          return (
                            <div key={secKey} className="bg-muted/20">
                              {/* Section header */}
                              <div className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/40 transition-colors">
                                <button
                                  onClick={() => toggleSection(secKey)}
                                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                                >
                                  {secCollapsed ? (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                                  )}
                                  <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <span className="text-xs font-semibold">{section.section}</span>
                                </button>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {secPending > 0 && !isReadOnly && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 text-[10px] gap-1 border-green-500/40 text-green-700 hover:bg-green-500/10"
                                      onClick={() => approveSection(group.repository, section.section)}
                                      disabled={submitting}
                                      title="Approve all pending documents in this section"
                                    >
                                      <CheckCheck className="h-3 w-3" /> Approve all ({secPending})
                                    </Button>
                                  )}
                                  <Badge variant="outline" className="text-[9px]">{section.items.length} docs</Badge>
                                </div>
                              </div>

                              <AnimatePresence initial={false}>
                                {!secCollapsed && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                  >
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="border-t border-border/50 bg-muted/30">
                                            <th className="text-left p-2.5 pl-10 font-medium text-[10px] uppercase tracking-wider text-muted-foreground">Evidence Category</th>
                                            <th className="text-left p-2.5 font-medium text-[10px] uppercase tracking-wider text-muted-foreground">File</th>
                                            <th className="text-left p-2.5 font-medium text-[10px] uppercase tracking-wider text-muted-foreground">Uploaded By</th>
                                            <th className="text-left p-2.5 font-medium text-[10px] uppercase tracking-wider text-muted-foreground">Date</th>
                                            <th className="text-left p-2.5 font-medium text-[10px] uppercase tracking-wider text-muted-foreground">Status</th>
                                            <th className="text-right p-2.5 font-medium text-[10px] uppercase tracking-wider text-muted-foreground">Actions</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {section.items.map((item) => (
                                            <tr key={item.id} className="border-t border-border/40 hover:bg-muted/40 transition-colors">
                                              <td className="p-2.5 pl-10">
                                                <div className="flex items-start gap-2">
                                                  <span className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', STATUS_META[item.status].dot)} />
                                                  <div>
                                                    <p className="text-xs font-semibold leading-snug">{item.documentCategory}</p>
                                                    {item.reviewNote && (
                                                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-start gap-1 max-w-[280px]">
                                                        <MessageSquareWarning className="h-3 w-3 shrink-0 mt-px text-purple-500" />
                                                        <span className="line-clamp-1">{item.reviewNote}</span>
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              </td>
                                              <td className="p-2.5">
                                                <div className="flex items-center gap-1.5">
                                                  {getFileIcon(item)}
                                                  <div>
                                                    <p className="text-xs font-medium">{item.documentName}</p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                      {item.fileSize} • {item.version}
                                                    </p>
                                                  </div>
                                                </div>
                                              </td>
                                              <td className="p-2.5 text-xs text-muted-foreground whitespace-nowrap">{item.uploadedBy}</td>
                                              <td className="p-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatDate(item.uploadDate)}</td>
                                              <td className="p-2.5">
                                                <Badge className={cn('text-[10px]', STATUS_META[item.status].badge)}>
                                                  {STATUS_META[item.status].label}
                                                </Badge>
                                              </td>
                                              <td className="p-2.5">
                                                <div className="flex items-center justify-end gap-0.5">
                                                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Preview" onClick={() => handlePreview(item)}>
                                                    <Eye className="h-3.5 w-3.5" />
                                                  </Button>
                                                  {!isReadOnly && (
                                                    <>
                                                      <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                                        title="Approve"
                                                        disabled={item.status === 'approved' || submitting}
                                                        onClick={() => { setNote(''); setAction({ type: 'approve', item }); }}
                                                      >
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                      </Button>
                                                      <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                                                        title="Reject"
                                                        disabled={item.status === 'rejected' || submitting}
                                                        onClick={() => { setNote(''); setAction({ type: 'reject', item }); }}
                                                      >
                                                        <XCircle className="h-3.5 w-3.5" />
                                                      </Button>
                                                      <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-purple-600 hover:text-purple-700 hover:bg-purple-500/10"
                                                        title="Request Changes"
                                                        disabled={item.status === 'changes-requested' || submitting}
                                                        onClick={() => { setNote(''); setAction({ type: 'changes', item }); }}
                                                      >
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                      </Button>
                                                    </>
                                                  )}
                                                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Download" onClick={() => downloadItem(item)}>
                                                    <Download className="h-3.5 w-3.5" />
                                                  </Button>
                                                </div>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview dialog */}
      <EvidencePreviewDialog
        evidence={previewData}
        open={previewData !== null}
        onOpenChange={(open) => !open && setPreviewData(null)}
      />

      {/* Approve / Reject / Request Changes dialog */}
      <Dialog open={action !== null} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {action && actionMeta[action.type].icon}
              {action && actionMeta[action.type].title}
            </DialogTitle>
            <DialogDescription>
              {action && (
                <>
                  <span className="font-medium text-foreground">{action.item.documentCategory}</span> — {action.item.documentName}
                  <span className="block text-xs text-muted-foreground mt-1">
                    {action.item.repository} Repository • {action.item.section} • Uploaded by {action.item.uploadedBy} on {formatDate(action.item.uploadDate)}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {action?.type === 'approve' && (
              <div className="flex items-start gap-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                <ShieldCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-green-700 dark:text-green-400">
                  Approving this document confirms it is valid evidence. It will be marked as <b>Approved</b> and the review is complete.
                </p>
              </div>
            )}
            {action?.type === 'reject' && (
              <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-400">
                  Rejecting sends the document back to the coordinator. A reason is <b>required</b> so they can fix the issue.
                </p>
              </div>
            )}
            {action?.type === 'changes' && (
              <div className="flex items-start gap-2 rounded-lg bg-purple-500/10 border border-purple-500/20 p-3">
                <MessageSquareWarning className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <p className="text-xs text-purple-700 dark:text-purple-400">
                  Request changes to send the document back with specific feedback. A note is <b>required</b>.
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium mb-1.5">
                {action?.type === 'approve' ? 'Review note (optional)' : 'Reason / feedback'}
                {action?.type !== 'approve' && <span className="text-red-500"> *</span>}
              </p>
              <Textarea
                placeholder={
                  action?.type === 'approve'
                    ? 'Add an optional note for the coordinator...'
                    : action?.type === 'reject'
                      ? 'Why is this document being rejected?'
                      : 'Describe the changes the coordinator needs to make...'
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                autoFocus
              />
            </div>
            {action && action.item.reviewNote && action.item.status !== 'pending' && (
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Previous review comment</p>
                <p className="text-[11px] text-muted-foreground">{action.item.reviewNote}</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            {action && (
              <Button className={actionMeta[action.type].buttonClass} onClick={applyAction} disabled={submitting}>
                {submitting ? 'Saving...' : actionMeta[action.type].buttonLabel}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

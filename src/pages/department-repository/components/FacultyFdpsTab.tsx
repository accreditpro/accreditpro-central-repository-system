import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { facultyService } from '@/services/faculty.service';
import { FacultyProfileResponse, FdpResponse, CreateFdpRequest } from '@/types/faculty.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Download,
  RefreshCw,
  AlertCircle,
  Presentation,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Constants ──

const MODE_OPTIONS = ['Online', 'Offline'];

// ── Empty FDP form ──

const emptyFdpForm = (): CreateFdpRequest => ({
  fdpName: '',
  organizingBody: undefined,
  startDate: '',
  endDate: '',
  durationDays: undefined,
  mode: '',
  certificationAvailable: false,
  certificateUrl: undefined,
});

type FdpForm = CreateFdpRequest;

export const FacultyFdpsTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  // ── Faculty selector state ──
  const [facultyList, setFacultyList] = useState<FacultyProfileResponse[]>([]);
  const [facultyLoading, setFacultyLoading] = useState(true);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  const [selectedFacultyName, setSelectedFacultyName] = useState('');

  // ── FDPs data state ──
  const [fdps, setFdps] = useState<FdpResponse[]>([]);
  const [fdpsLoading, setFdpsLoading] = useState(false);
  const [fdpsError, setFdpsError] = useState<string | null>(null);

  // ── Search & filter ──
  const [searchQuery, setSearchQuery] = useState('');

  // ── Dialogs ──
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFdp, setSelectedFdp] = useState<FdpResponse | null>(null);

  // ── Form state ──
  const [formData, setFormData] = useState<FdpForm>(emptyFdpForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch faculty list (for the selector) ──

  const fetchFacultyList = useCallback(async () => {
    if (!departmentId) return;
    setFacultyLoading(true);
    try {
      const result = await facultyService.listProfiles(departmentId, { size: 200 });
      setFacultyList(result.content);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load faculty list';
      toast.error(msg);
    } finally {
      setFacultyLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchFacultyList();
  }, [fetchFacultyList]);

  // ── Fetch FDPs when faculty changes ──

  const fetchFdps = useCallback(
    async (facultyId: number) => {
      if (!departmentId || !facultyId) return;
      setFdpsLoading(true);
      setFdpsError(null);
      try {
        const result = await facultyService.listFdps(departmentId, facultyId);
        setFdps(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load FDPs';
        setFdpsError(msg);
        toast.error(msg);
      } finally {
        setFdpsLoading(false);
      }
    },
    [departmentId]
  );

  const handleFacultyChange = (facultyIdStr: string) => {
    const fid = parseInt(facultyIdStr, 10);
    setSelectedFacultyId(fid);
    const faculty = facultyList.find(f => f.id === fid);
    setSelectedFacultyName(faculty?.facultyName || '');
    setSearchQuery('');
    fetchFdps(fid);
  };

  // ── Search handler (client-side filter) ──

  const filteredFdps = fdps.filter(fdp => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      fdp.fdpName.toLowerCase().includes(q) ||
      (fdp.organizingBody || '').toLowerCase().includes(q) ||
      fdp.mode.toLowerCase().includes(q) ||
      String(fdp.durationDays || '').includes(q) ||
      fdp.startDate.includes(q) ||
      fdp.endDate.includes(q) ||
      (fdp.certificationAvailable ? 'yes' : 'no').includes(q)
    );
  });

  // ── Create handlers ──

  const openCreateDialog = () => {
    setFormData(emptyFdpForm());
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!departmentId || !selectedFacultyId) return;
    if (!formData.fdpName || !formData.startDate || !formData.endDate || !formData.mode) {
      toast.error('FDP Name, Start Date, End Date, and Mode are required');
      return;
    }
    setSaving(true);
    try {
      await facultyService.addFdp(departmentId, selectedFacultyId, formData);
      toast.success('FDP added successfully');
      setCreateDialogOpen(false);
      fetchFdps(selectedFacultyId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add FDP';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit handlers ──

  const openEditDialog = (fdp: FdpResponse) => {
    setSelectedFdp(fdp);
    setFormData({
      fdpName: fdp.fdpName,
      organizingBody: fdp.organizingBody ?? undefined,
      startDate: fdp.startDate,
      endDate: fdp.endDate,
      durationDays: fdp.durationDays ?? undefined,
      mode: fdp.mode,
      certificationAvailable: fdp.certificationAvailable,
      certificateUrl: fdp.certificateUrl ?? undefined,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!departmentId || !selectedFacultyId || !selectedFdp) return;
    setSaving(true);
    try {
      await facultyService.updateFdp(departmentId, selectedFacultyId, selectedFdp.id, formData);
      toast.success('FDP updated successfully');
      setEditDialogOpen(false);
      setSelectedFdp(null);
      fetchFdps(selectedFacultyId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update FDP';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete handlers ──

  const openDeleteDialog = (fdp: FdpResponse) => {
    setSelectedFdp(fdp);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!departmentId || !selectedFacultyId || !selectedFdp) return;
    setDeleting(true);
    try {
      await facultyService.deleteFdp(departmentId, selectedFacultyId, selectedFdp.id);
      toast.success('FDP deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedFdp(null);
      fetchFdps(selectedFacultyId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete FDP';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ── Download Template ──

  const handleDownloadTemplate = () => {
    const headers = [
      'FDP Name',
      'Organizing Body',
      'Start Date',
      'End Date',
      'Duration Days',
      'Mode',
      'Certification Available',
    ];

    const sampleRow = [
      'AI/ML in Education',
      'AICTE',
      '2025-01-06',
      '2025-01-10',
      '5',
      'Online',
      'Yes',
    ];

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'faculty_fdps_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── Format helpers ──

  const formatBoolean = (val: boolean | null | undefined): string => {
    if (val === true) return 'Yes';
    if (val === false) return 'No';
    return '-';
  };

  // ── Render ──

  if (!departmentId) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <p className="text-sm font-medium">Department ID not available</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your user account is not associated with a department. Contact your administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* ── Faculty Selector Card ── */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Faculty Development Programs</CardTitle>
            {selectedFacultyId && (
              <Badge variant="outline" className="text-[10px]">
                {fdpsLoading ? '...' : `${fdps.length} records`}
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            Select a faculty member to view, add, or manage their FDPs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px] flex-1 max-w-sm">
              <Presentation className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Select
                value={selectedFacultyId ? String(selectedFacultyId) : ''}
                onValueChange={handleFacultyChange}
              >
                <SelectTrigger className="h-9 text-xs pl-8">
                  <SelectValue
                    placeholder={facultyLoading ? 'Loading faculty...' : 'Select a faculty member'}
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[240px]">
                  {facultyList.map(f => (
                    <SelectItem key={f.id} value={String(f.id)} className="text-xs">
                      {f.employeeId} — {f.facultyName}
                    </SelectItem>
                  ))}
                  {facultyList.length === 0 && !facultyLoading && (
                    <div className="px-2 py-4 text-xs text-center text-muted-foreground">
                      No faculty profiles found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedFacultyId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => fetchFdps(selectedFacultyId)}
                disabled={fdpsLoading}
                title="Refresh"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', fdpsLoading && 'animate-spin')} />
              </Button>
            )}
          </div>

          {selectedFacultyName && (
            <div className="mt-2 flex items-center gap-1.5">
              <Badge variant="secondary" className="text-[10px] bg-indigo-500/10 text-indigo-600">
                {selectedFacultyName}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFacultyId ? (
        <>
          {/* ── Actions Card ── */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="text-xs h-8" onClick={openCreateDialog}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add FDP
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Download Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  disabled
                  title="Upload CSV API not available yet"
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── FDPs Data Table ── */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold">FDP Records</CardTitle>
                  <CardDescription className="text-xs">
                    {fdpsLoading
                      ? 'Loading FDP records...'
                      : `Showing ${filteredFdps.length} of ${fdps.length} records`}
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    className="h-8 text-xs pl-8"
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-[10px] font-semibold w-8 text-center">#</TableHead>
                      <TableHead className="text-[10px] font-semibold">FDP Name</TableHead>
                      <TableHead className="text-[10px] font-semibold">Organizing Body</TableHead>
                      <TableHead className="text-[10px] font-semibold">Start Date</TableHead>
                      <TableHead className="text-[10px] font-semibold">End Date</TableHead>
                      <TableHead className="text-[10px] font-semibold">Duration Days</TableHead>
                      <TableHead className="text-[10px] font-semibold">Mode</TableHead>
                      <TableHead className="text-[10px] font-semibold">Certification</TableHead>
                      <TableHead className="text-[10px] font-semibold text-center w-16">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Loading skeleton */}
                    {fdpsLoading &&
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={`skel-${i}`}>
                          <TableCell className="text-center">
                            <Skeleton className="h-4 w-4 mx-auto" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-14" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12 mx-auto" />
                          </TableCell>
                        </TableRow>
                      ))}

                    {/* Error state */}
                    {!fdpsLoading && fdpsError && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-destructive">
                            <AlertCircle className="h-8 w-8" />
                            <p className="text-xs font-medium">{fdpsError}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => selectedFacultyId && fetchFdps(selectedFacultyId)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" /> Retry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Empty state */}
                    {!fdpsLoading && !fdpsError && fdps.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Presentation className="h-8 w-8 opacity-40" />
                            <p className="text-xs">No FDPs found for this faculty member.</p>
                            <Button size="sm" className="text-xs" onClick={openCreateDialog}>
                              <Plus className="h-3.5 w-3.5 mr-1" /> Add First FDP
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* No search results */}
                    {!fdpsLoading && !fdpsError && fdps.length > 0 && filteredFdps.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Search className="h-8 w-8 opacity-40" />
                            <p className="text-xs">No FDPs match your search.</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => setSearchQuery('')}
                            >
                              Clear Search
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Data rows */}
                    {!fdpsLoading &&
                      !fdpsError &&
                      filteredFdps.map((fdp, index) => (
                        <TableRow key={fdp.id} className="hover:bg-muted/20">
                          <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-xs p-1.5 font-medium">{fdp.fdpName}</TableCell>
                          <TableCell className="text-[10px] p-1.5">
                            {fdp.organizingBody || '-'}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5">{fdp.startDate}</TableCell>
                          <TableCell className="text-[10px] p-1.5">{fdp.endDate}</TableCell>
                          <TableCell className="text-[10px] p-1.5 font-mono">
                            {fdp.durationDays ?? '-'}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5">
                            <Badge variant="outline" className="text-[9px] font-normal">
                              {fdp.mode}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5">
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-[9px]',
                                fdp.certificationAvailable
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : 'bg-gray-500/10 text-gray-600'
                              )}
                            >
                              {formatBoolean(fdp.certificationAvailable)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center p-1.5">
                            <div className="flex items-center justify-center gap-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => openEditDialog(fdp)}
                                title="Edit"
                              >
                                <Pencil className="h-3 w-3 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() => openDeleteDialog(fdp)}
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Presentation className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium">Select a faculty member</p>
              <p className="text-xs text-muted-foreground">
                Choose a faculty member from the dropdown above to view their FDPs
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* CREATE DIALOG */}
      {/* ════════════════════════════════════════════════ */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Add FDP Record</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new Faculty Development Program record for{' '}
              <strong>{selectedFacultyName}</strong>. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">FDP Name *</Label>
              <Input
                className="h-9 text-xs"
                placeholder="e.g. AI/ML in Education"
                value={formData.fdpName}
                onChange={e => setFormData(prev => ({ ...prev, fdpName: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Organizing Body</Label>
              <Input
                className="h-9 text-xs"
                placeholder="e.g. AICTE"
                value={formData.organizingBody || ''}
                onChange={e => setFormData(prev => ({ ...prev, organizingBody: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Start Date *</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">End Date *</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Duration Days</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  placeholder="e.g. 5"
                  value={formData.durationDays ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      durationDays: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Mode *</Label>
                <Select
                  value={formData.mode}
                  onValueChange={v => setFormData(prev => ({ ...prev, mode: v }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODE_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Certification Available</Label>
              <Select
                value={formData.certificationAvailable ? 'true' : 'false'}
                onValueChange={v =>
                  setFormData(prev => ({ ...prev, certificationAvailable: v === 'true' }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true" className="text-xs">
                    Yes
                  </SelectItem>
                  <SelectItem value="false" className="text-xs">
                    No
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={handleCreate}
              disabled={
                saving ||
                !formData.fdpName ||
                !formData.startDate ||
                !formData.endDate ||
                !formData.mode
              }
            >
              {saving ? 'Adding...' : 'Add FDP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════ */}
      {/* EDIT DIALOG */}
      {/* ════════════════════════════════════════════════ */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Edit FDP Record</DialogTitle>
            <DialogDescription className="text-xs">
              Update FDP details for <strong>{selectedFacultyName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">FDP Name</Label>
              <Input
                className="h-9 text-xs"
                value={formData.fdpName}
                onChange={e => setFormData(prev => ({ ...prev, fdpName: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Organizing Body</Label>
              <Input
                className="h-9 text-xs"
                value={formData.organizingBody || ''}
                onChange={e => setFormData(prev => ({ ...prev, organizingBody: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Start Date</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">End Date</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Duration Days</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  value={formData.durationDays ?? ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      durationDays: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Mode</Label>
                <Select
                  value={formData.mode}
                  onValueChange={v => setFormData(prev => ({ ...prev, mode: v }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODE_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">Certification Available</Label>
              <Select
                value={formData.certificationAvailable ? 'true' : 'false'}
                onValueChange={v =>
                  setFormData(prev => ({ ...prev, certificationAvailable: v === 'true' }))
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true" className="text-xs">
                    Yes
                  </SelectItem>
                  <SelectItem value="false" className="text-xs">
                    No
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" className="text-xs" onClick={handleUpdate} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ════════════════════════════════════════════════ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Delete FDP Record</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete <strong>{selectedFdp?.fdpName}</strong>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

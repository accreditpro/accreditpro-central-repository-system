import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { facultyService } from '@/services/faculty.service';
import {
  FacultyProfileResponse,
  QualificationResponse,
  CreateQualificationRequest,
} from '@/types/faculty.types';
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
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Enum mapping helpers ──

const QUALIFICATION_LEVEL_OPTIONS = ['UG', 'PG', 'PhD', 'Post Doctoral'];
const PHD_STATUS_OPTIONS = ['Completed', 'Pursuing', 'Not Applicable'];

// ── Empty qualification form ──

const emptyQualificationForm = (): CreateQualificationRequest => ({
  qualificationLevel: '',
  degree: '',
  specialization: undefined,
  university: undefined,
  yearOfPassing: undefined,
  phdStatus: 'Not Applicable',
  phdAwardedDate: undefined,
});

type QualificationForm = CreateQualificationRequest;

export const FacultyQualificationsTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  // ── Faculty selector state ──
  const [facultyList, setFacultyList] = useState<FacultyProfileResponse[]>([]);
  const [facultyLoading, setFacultyLoading] = useState(true);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  const [selectedFacultyName, setSelectedFacultyName] = useState('');

  // ── Qualifications data state ──
  const [qualifications, setQualifications] = useState<QualificationResponse[]>([]);
  const [qualLoading, setQualLoading] = useState(false);
  const [qualError, setQualError] = useState<string | null>(null);

  // ── Search & filter ──
  const [searchQuery, setSearchQuery] = useState('');

  // ── Dialogs ──
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState<QualificationResponse | null>(null);

  // ── Form state ──
  const [formData, setFormData] = useState<QualificationForm>(emptyQualificationForm());
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

  // ── Fetch qualifications when faculty changes ──

  const fetchQualifications = useCallback(async (facultyId: number) => {
    if (!departmentId || !facultyId) return;
    setQualLoading(true);
    setQualError(null);
    try {
      const result = await facultyService.listQualifications(departmentId, facultyId);
      setQualifications(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load qualifications';
      setQualError(msg);
      toast.error(msg);
    } finally {
      setQualLoading(false);
    }
  }, [departmentId]);

  const handleFacultyChange = (facultyIdStr: string) => {
    const fid = parseInt(facultyIdStr, 10);
    setSelectedFacultyId(fid);
    const faculty = facultyList.find(f => f.id === fid);
    setSelectedFacultyName(faculty?.facultyName || '');
    setSearchQuery('');
    fetchQualifications(fid);
  };

  // ── Search handler (client-side filter) ──

  const filteredQualifications = qualifications.filter(q => {
    if (!searchQuery) return true;
    const qLower = searchQuery.toLowerCase();
    return (
      q.degree.toLowerCase().includes(qLower) ||
      (q.qualificationLevel || '').toLowerCase().includes(qLower) ||
      (q.specialization || '').toLowerCase().includes(qLower) ||
      (q.university || '').toLowerCase().includes(qLower) ||
      String(q.yearOfPassing || '').includes(qLower)
    );
  });

  // ── Create handlers ──

  const openCreateDialog = () => {
    setFormData(emptyQualificationForm());
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!departmentId || !selectedFacultyId) return;
    if (!formData.qualificationLevel || !formData.degree) {
      toast.error('Qualification Level and Degree are required');
      return;
    }
    setSaving(true);
    try {
      const payload: CreateQualificationRequest = {
        qualificationLevel: formData.qualificationLevel,
        degree: formData.degree,
        specialization: formData.specialization || undefined,
        university: formData.university || undefined,
        yearOfPassing: formData.yearOfPassing || undefined,
        phdStatus: formData.phdStatus || 'Not Applicable',
        phdAwardedDate: formData.phdAwardedDate || undefined,
      };
      await facultyService.addQualification(departmentId, selectedFacultyId, payload);
      toast.success('Qualification added successfully');
      setCreateDialogOpen(false);
      fetchQualifications(selectedFacultyId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add qualification';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Edit handlers ──

  const openEditDialog = (qualification: QualificationResponse) => {
    setSelectedQualification(qualification);
    setFormData({
      qualificationLevel: qualification.qualificationLevel,
      degree: qualification.degree,
      specialization: qualification.specialization ?? undefined,
      university: qualification.university ?? undefined,
      yearOfPassing: qualification.yearOfPassing ?? undefined,
      phdStatus: qualification.phdStatus,
      phdAwardedDate: qualification.phdAwardedDate ?? undefined,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!departmentId || !selectedFacultyId || !selectedQualification) return;
    setSaving(true);
    try {
      const payload: Partial<CreateQualificationRequest> = {
        qualificationLevel: formData.qualificationLevel || undefined,
        degree: formData.degree || undefined,
        specialization: formData.specialization || undefined,
        university: formData.university || undefined,
        yearOfPassing: formData.yearOfPassing || undefined,
        phdStatus: formData.phdStatus || undefined,
        phdAwardedDate: formData.phdAwardedDate || undefined,
      };
      await facultyService.updateQualification(
        departmentId,
        selectedFacultyId,
        selectedQualification.id,
        payload
      );
      toast.success('Qualification updated successfully');
      setEditDialogOpen(false);
      setSelectedQualification(null);
      fetchQualifications(selectedFacultyId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update qualification';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete handlers ──

  const openDeleteDialog = (qualification: QualificationResponse) => {
    setSelectedQualification(qualification);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!departmentId || !selectedFacultyId || !selectedQualification) return;
    setDeleting(true);
    try {
      await facultyService.deleteQualification(departmentId, selectedFacultyId, selectedQualification.id);
      toast.success('Qualification deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedQualification(null);
      fetchQualifications(selectedFacultyId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete qualification';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // ── Download Template ──

  const handleDownloadTemplate = () => {
    const headers = [
      'Qualification Level',
      'Degree',
      'Specialization',
      'University',
      'Year of Passing',
      'PhD Status',
      'PhD Awarded Date',
    ];

    const sampleRow = [
      'PhD',
      'Ph.D. in Computer Science',
      'Artificial Intelligence',
      'IIT Madras',
      '2010',
      'Completed',
      '2010-06-20',
    ];

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'faculty_qualifications_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── Helpers ──

  const getPhdStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-600';
      case 'Pursuing': return 'bg-blue-500/10 text-blue-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
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
            <CardTitle className="text-sm font-semibold">Faculty Qualifications</CardTitle>
            <Badge variant="outline" className="text-[10px]">
              {selectedFacultyId ? `${qualifications.length} records` : 'Select a faculty'}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Select a faculty member to view, add, or manage their qualifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px] flex-1 max-w-sm">
              <GraduationCap className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Select
                value={selectedFacultyId ? String(selectedFacultyId) : ''}
                onValueChange={handleFacultyChange}
              >
                <SelectTrigger className="h-9 text-xs pl-8">
                  <SelectValue placeholder={facultyLoading ? 'Loading faculty...' : 'Select a faculty member'} />
                </SelectTrigger>
                <SelectContent className="max-h-[240px]">
                  {facultyList.map((f) => (
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
              <>
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    className="h-9 text-xs pl-8"
                    placeholder="Search qualifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="sm" className="text-xs h-8" onClick={openCreateDialog}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Qualification
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleDownloadTemplate}>
                  <Download className="h-3.5 w-3.5 mr-1" /> Download Template
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => fetchQualifications(selectedFacultyId)}
                  disabled={qualLoading}
                >
                  <RefreshCw className={cn('h-3.5 w-3.5', qualLoading && 'animate-spin')} />
                </Button>
              </>
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

      {/* ── Qualifications Table ── */}
      {selectedFacultyId ? (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Qualifications Records</CardTitle>
            <CardDescription className="text-xs">
              {qualLoading
                ? 'Loading qualifications...'
                : `Showing ${filteredQualifications.length} of ${qualifications.length} records`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-[10px] font-semibold w-8 text-center">#</TableHead>
                    <TableHead className="text-[10px] font-semibold">Qualification Level</TableHead>
                    <TableHead className="text-[10px] font-semibold">Degree</TableHead>
                    <TableHead className="text-[10px] font-semibold">Specialization</TableHead>
                    <TableHead className="text-[10px] font-semibold">University</TableHead>
                    <TableHead className="text-[10px] font-semibold">Year of Passing</TableHead>
                    <TableHead className="text-[10px] font-semibold">PhD Status</TableHead>
                    <TableHead className="text-[10px] font-semibold">PhD Awarded Date</TableHead>
                    <TableHead className="text-[10px] font-semibold text-center w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Loading skeleton */}
                  {qualLoading && (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={`skel-${i}`}>
                        <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                      </TableRow>
                    ))
                  )}

                  {/* Error state */}
                  {!qualLoading && qualError && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-destructive">
                          <AlertCircle className="h-8 w-8" />
                          <p className="text-xs font-medium">{qualError}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => selectedFacultyId && fetchQualifications(selectedFacultyId)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" /> Retry
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Empty state */}
                  {!qualLoading && !qualError && qualifications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <GraduationCap className="h-8 w-8 opacity-40" />
                          <p className="text-xs">No qualifications found for this faculty member.</p>
                          <Button size="sm" className="text-xs" onClick={openCreateDialog}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add First Qualification
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* No search results */}
                  {!qualLoading && !qualError && qualifications.length > 0 && filteredQualifications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Search className="h-8 w-8 opacity-40" />
                          <p className="text-xs">No qualifications match your search.</p>
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
                  {!qualLoading && !qualError && filteredQualifications.map((q, index) => (
                    <TableRow key={q.id} className="hover:bg-muted/20">
                      <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5">
                        <Badge variant="outline" className="text-[9px] font-normal">
                          {q.qualificationLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs p-1.5 font-medium">{q.degree}</TableCell>
                      <TableCell className="text-[10px] p-1.5">{q.specialization || '-'}</TableCell>
                      <TableCell className="text-[10px] p-1.5">{q.university || '-'}</TableCell>
                      <TableCell className="text-[10px] p-1.5">{q.yearOfPassing ?? '-'}</TableCell>
                      <TableCell className="text-[10px] p-1.5">
                        <Badge
                          variant="secondary"
                          className={cn('text-[9px]', getPhdStatusBadgeStyle(q.phdStatus))}
                        >
                          {q.phdStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5">{q.phdAwardedDate || '-'}</TableCell>
                      <TableCell className="text-center p-1.5">
                        <div className="flex items-center justify-center gap-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => openEditDialog(q)}
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => openDeleteDialog(q)}
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
      ) : (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium">Select a faculty member</p>
              <p className="text-xs text-muted-foreground">
                Choose a faculty member from the dropdown above to view their qualifications
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
            <DialogTitle className="text-sm">Add Qualification</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new qualification record for <strong>{selectedFacultyName}</strong>.
              Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Qualification Level *</Label>
                <Select
                  value={formData.qualificationLevel}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, qualificationLevel: v }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUALIFICATION_LEVEL_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Degree *</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. Ph.D. in Computer Science"
                  value={formData.degree}
                  onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Specialization</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. Artificial Intelligence"
                  value={formData.specialization || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">University</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. IIT Madras"
                  value={formData.university || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Year of Passing</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  placeholder="e.g. 2010"
                  value={formData.yearOfPassing ?? ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    yearOfPassing: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">PhD Status</Label>
                <Select
                  value={formData.phdStatus || 'Not Applicable'}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, phdStatus: v }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PHD_STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">PhD Awarded Date</Label>
              <Input
                className="h-9 text-xs"
                type="date"
                value={formData.phdAwardedDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phdAwardedDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={handleCreate}
              disabled={saving || !formData.qualificationLevel || !formData.degree}
            >
              {saving ? 'Adding...' : 'Add Qualification'}
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
            <DialogTitle className="text-sm">Edit Qualification</DialogTitle>
            <DialogDescription className="text-xs">
              Update qualification details for <strong>{selectedFacultyName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Qualification Level</Label>
                <Select
                  value={formData.qualificationLevel}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, qualificationLevel: v }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUALIFICATION_LEVEL_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Degree</Label>
                <Input
                  className="h-9 text-xs"
                  value={formData.degree}
                  onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Specialization</Label>
                <Input
                  className="h-9 text-xs"
                  value={formData.specialization || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">University</Label>
                <Input
                  className="h-9 text-xs"
                  value={formData.university || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Year of Passing</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  value={formData.yearOfPassing ?? ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    yearOfPassing: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">PhD Status</Label>
                <Select
                  value={formData.phdStatus || 'Not Applicable'}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, phdStatus: v }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PHD_STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">PhD Awarded Date</Label>
              <Input
                className="h-9 text-xs"
                type="date"
                value={formData.phdAwardedDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phdAwardedDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setEditDialogOpen(false)}>
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
            <DialogTitle className="text-sm">Delete Qualification</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete <strong>{selectedQualification?.degree}</strong>
              {' '}({selectedQualification?.qualificationLevel})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setDeleteDialogOpen(false)}>
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

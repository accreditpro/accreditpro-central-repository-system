import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { facultyService } from '@/services/faculty.service';
import {
  FacultyProfileResponse,
  EmploymentResponse,
  UpdateEmploymentRequest,
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
  Download,
  RefreshCw,
  AlertCircle,
  Briefcase,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Enum mapping helpers (API values ↔ Display values) ──

const EMPLOYMENT_TYPE_OPTIONS = ['Regular', 'Contract', 'Visiting', 'Adjunct'];
const FACULTY_CATEGORY_OPTIONS = ['Full-Time', 'Part-Time'];

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  REGULAR: 'Regular',
  CONTRACT: 'Contract',
  VISITING: 'Visiting',
  ADJUNCT: 'Adjunct',
};

const REVERSE_EMPLOYMENT_TYPE: Record<string, string> = {
  Regular: 'REGULAR',
  Contract: 'CONTRACT',
  Visiting: 'VISITING',
  Adjunct: 'ADJUNCT',
};

// ── Empty employment form ──

const emptyEmploymentForm = (): UpdateEmploymentRequest => ({
  employmentType: undefined,
  facultyCategory: undefined,
  dateOfJoiningInstitution: '',
  dateOfJoiningProfession: undefined,
  totalExperienceYears: undefined,
  industryExperienceYears: undefined,
  aicteFacultyId: undefined,
});

type EmploymentForm = UpdateEmploymentRequest;

export const FacultyEmploymentTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  // ── Faculty selector state ──
  const [facultyList, setFacultyList] = useState<FacultyProfileResponse[]>([]);
  const [facultyLoading, setFacultyLoading] = useState(true);
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | null>(null);
  const [selectedFacultyName, setSelectedFacultyName] = useState('');

  // ── Employment data state (single record per faculty) ──
  const [employment, setEmployment] = useState<EmploymentResponse | null>(null);
  const [empLoading, setEmpLoading] = useState(false);
  const [empError, setEmpError] = useState<string | null>(null);

  // ── Search & filter ──
  const [searchQuery, setSearchQuery] = useState('');

  // ── Dialogs ──
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // true = editing existing, false = adding new

  // ── Form state ──
  const [formData, setFormData] = useState<EmploymentForm>(emptyEmploymentForm());
  const [saving, setSaving] = useState(false);

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

  // ── Fetch employment when faculty changes ──

  const fetchEmployment = useCallback(async (facultyId: number) => {
    if (!departmentId || !facultyId) return;
    setEmpLoading(true);
    setEmpError(null);
    setEmployment(null);
    try {
      const result = await facultyService.getEmployment(departmentId, facultyId);
      setEmployment(result);
    } catch (err: unknown) {
      // 404 means no employment record yet — that's okay
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
        setEmployment(null);
      } else {
        setEmpError(msg || 'Failed to load employment information');
        toast.error(msg || 'Failed to load employment information');
      }
    } finally {
      setEmpLoading(false);
    }
  }, [departmentId]);

  const handleFacultyChange = (facultyIdStr: string) => {
    const fid = parseInt(facultyIdStr, 10);
    setSelectedFacultyId(fid);
    const faculty = facultyList.find(f => f.id === fid);
    setSelectedFacultyName(faculty?.facultyName || '');
    setSearchQuery('');
    fetchEmployment(fid);
  };

  // ── Search handler (client-side filter) ──

  const employmentMatchesSearch = (emp: EmploymentResponse, query: string): boolean => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (emp.employmentType || '').toLowerCase().includes(q) ||
      (emp.facultyCategory || '').toLowerCase().includes(q) ||
      String(emp.totalExperienceYears).includes(q) ||
      String(emp.industryExperienceYears).includes(q) ||
      (emp.aicteFacultyId || '').toLowerCase().includes(q) ||
      emp.dateOfJoiningInstitution.includes(q) ||
      (emp.dateOfJoiningProfession || '').includes(q)
    );
  };

  const filteredEmployment = employment && employmentMatchesSearch(employment, searchQuery)
    ? employment
    : searchQuery && employment ? null : employment;

  // ── Open form dialog (Add or Edit) ──

  const openAddDialog = () => {
    setIsEditing(false);
    setFormData(emptyEmploymentForm());
    setFormDialogOpen(true);
  };

  const openEditDialog = () => {
    if (!employment) return;
    setIsEditing(true);
    const displayType = employment.employmentType
      ? (EMPLOYMENT_TYPE_MAP[employment.employmentType] || employment.employmentType)
      : '';
    setFormData({
      employmentType: displayType || undefined,
      facultyCategory: employment.facultyCategory ?? undefined,
      dateOfJoiningInstitution: employment.dateOfJoiningInstitution || '',
      dateOfJoiningProfession: employment.dateOfJoiningProfession ?? undefined,
      totalExperienceYears: employment.totalExperienceYears ?? undefined,
      industryExperienceYears: employment.industryExperienceYears ?? undefined,
      aicteFacultyId: employment.aicteFacultyId ?? undefined,
    });
    setFormDialogOpen(true);
  };

  // ── Save handler (Create or Update via PUT) ──

  const handleSave = async () => {
    if (!departmentId || !selectedFacultyId) return;
    if (!formData.dateOfJoiningInstitution) {
      toast.error('Date of Joining Institution is required');
      return;
    }
    setSaving(true);
    try {
      const payload: UpdateEmploymentRequest = {
        employmentType: formData.employmentType
          ? REVERSE_EMPLOYMENT_TYPE[formData.employmentType] || formData.employmentType
          : undefined,
        facultyCategory: formData.facultyCategory || undefined,
        dateOfJoiningInstitution: formData.dateOfJoiningInstitution,
        dateOfJoiningProfession: formData.dateOfJoiningProfession || undefined,
        totalExperienceYears: formData.totalExperienceYears ?? undefined,
        industryExperienceYears: formData.industryExperienceYears ?? undefined,
        aicteFacultyId: formData.aicteFacultyId || undefined,
      };
      const result = await facultyService.updateEmployment(departmentId, selectedFacultyId, payload);
      setEmployment(result);
      toast.success(isEditing ? 'Employment information updated successfully' : 'Employment information added successfully');
      setFormDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save employment information';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Download Template ──

  const handleDownloadTemplate = () => {
    const headers = [
      'Employment Type',
      'Faculty Category',
      'Date of Joining Institution',
      'Date of Joining Profession',
      'Total Experience (Years)',
      'Industry Experience (Years)',
      'AICTE Faculty ID',
    ];

    const sampleRow = [
      'Regular',
      'Full-Time',
      '2010-07-01',
      '2005-08-15',
      '18',
      '2',
      'AICTE-001',
    ];

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'faculty_employment_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── Format helpers ──

  const formatEmploymentType = (val: string | null | undefined): string =>
    val ? (EMPLOYMENT_TYPE_MAP[val] || val) : '-';

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
      {/* ── Faculty Selector & Actions Card ── */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Employment Information</CardTitle>
            {selectedFacultyId && (
              <Badge variant="outline" className="text-[10px]">
                {empLoading ? 'Loading...' : employment ? '1 record' : 'No record'}
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            Select a faculty member to view or manage their employment information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px] flex-1 max-w-sm">
              <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
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
                    placeholder="Search fields..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {employment ? (
                  <Button size="sm" className="text-xs h-8" onClick={openEditDialog}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit Record
                  </Button>
                ) : (
                  <Button size="sm" className="text-xs h-8" onClick={openAddDialog}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Record
                  </Button>
                )}
                <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleDownloadTemplate}>
                  <Download className="h-3.5 w-3.5 mr-1" /> Download Template
                </Button>
                {employment && (
                  <Button variant="outline" size="sm" className="text-xs h-8" disabled title="Delete API not available yet">
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                )}
                <Button variant="outline" size="sm" className="text-xs h-8" disabled title="Upload CSV API not available yet">
                  <Upload className="h-3.5 w-3.5 mr-1" /> Upload CSV
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => selectedFacultyId && fetchEmployment(selectedFacultyId)}
                  disabled={empLoading}
                >
                  <RefreshCw className={cn('h-3.5 w-3.5', empLoading && 'animate-spin')} />
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

      {/* ── Employment Data Table ── */}
      {selectedFacultyId ? (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Employment Records</CardTitle>
            <CardDescription className="text-xs">
              {empLoading
                ? 'Loading employment information...'
                : employment
                  ? 'Showing 1 record'
                  : 'No employment record found'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-[10px] font-semibold">Employment Type</TableHead>
                    <TableHead className="text-[10px] font-semibold">Faculty Category</TableHead>
                    <TableHead className="text-[10px] font-semibold">Date of Joining Institution</TableHead>
                    <TableHead className="text-[10px] font-semibold">Date of Joining Profession</TableHead>
                    <TableHead className="text-[10px] font-semibold">Total Experience (Years)</TableHead>
                    <TableHead className="text-[10px] font-semibold">Industry Experience (Years)</TableHead>
                    <TableHead className="text-[10px] font-semibold">AICTE Faculty ID</TableHead>
                    <TableHead className="text-[10px] font-semibold text-center w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Loading skeleton */}
                  {empLoading && (
                    <TableRow>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <TableCell key={i} className="text-center">
                          <Skeleton className="h-4 w-full mx-auto" />
                        </TableCell>
                      ))}
                    </TableRow>
                  )}

                  {/* Error state */}
                  {!empLoading && empError && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-destructive">
                          <AlertCircle className="h-8 w-8" />
                          <p className="text-xs font-medium">{empError}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => selectedFacultyId && fetchEmployment(selectedFacultyId)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" /> Retry
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Empty state — no employment record */}
                  {!empLoading && !empError && !employment && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Briefcase className="h-8 w-8 opacity-40" />
                          <p className="text-xs">No employment record found for this faculty member.</p>
                          <Button size="sm" className="text-xs" onClick={openAddDialog}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Employment Record
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* No search match */}
                  {!empLoading && !empError && employment && !filteredEmployment && searchQuery && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Search className="h-8 w-8 opacity-40" />
                          <p className="text-xs">No fields match your search.</p>
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => setSearchQuery('')}>
                            Clear Search
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Data row (single record per faculty) */}
                  {!empLoading && !empError && filteredEmployment && (
                    <TableRow className="hover:bg-muted/20">
                      <TableCell className="text-[10px] p-1.5">
                        <Badge variant="outline" className="text-[9px] font-normal">
                          {formatEmploymentType(filteredEmployment.employmentType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5">
                        {filteredEmployment.facultyCategory || '-'}
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5">
                        {filteredEmployment.dateOfJoiningInstitution || '-'}
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5">
                        {filteredEmployment.dateOfJoiningProfession || '-'}
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5 font-mono">
                        {filteredEmployment.totalExperienceYears ?? '-'}
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5 font-mono">
                        {filteredEmployment.industryExperienceYears ?? '-'}
                      </TableCell>
                      <TableCell className="text-[10px] p-1.5 font-mono">
                        {filteredEmployment.aicteFacultyId || '-'}
                      </TableCell>
                      <TableCell className="text-center p-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={openEditDialog}
                          title="Edit"
                        >
                          <Pencil className="h-3 w-3 text-blue-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Briefcase className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium">Select a faculty member</p>
              <p className="text-xs text-muted-foreground">
                Choose a faculty member from the dropdown above to view their employment information
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* ADD / EDIT FORM DIALOG (PUT endpoint handles both) */}
      {/* ════════════════════════════════════════════════ */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {isEditing ? 'Edit Employment Information' : 'Add Employment Record'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isEditing
                ? `Update employment details for ${selectedFacultyName}.`
                : `Add employment record for ${selectedFacultyName}. Fields marked with * are required.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Employment Type</Label>
                <Select
                  value={formData.employmentType || ''}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, employmentType: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPE_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Faculty Category</Label>
                <Select
                  value={formData.facultyCategory || ''}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, facultyCategory: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {FACULTY_CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Date of Joining Institution *</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.dateOfJoiningInstitution}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfJoiningInstitution: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Date of Joining Profession</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.dateOfJoiningProfession || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfJoiningProfession: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Total Experience (Years)</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  placeholder="e.g. 18"
                  value={formData.totalExperienceYears ?? ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    totalExperienceYears: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Industry Experience (Years)</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  placeholder="e.g. 2"
                  value={formData.industryExperienceYears ?? ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    industryExperienceYears: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  }))}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs font-medium">AICTE Faculty ID</Label>
              <Input
                className="h-9 text-xs"
                placeholder="e.g. AICTE-001"
                value={formData.aicteFacultyId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, aicteFacultyId: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setFormDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={handleSave}
              disabled={saving || !formData.dateOfJoiningInstitution}
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

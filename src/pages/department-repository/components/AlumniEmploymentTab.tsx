import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { alumniService } from '@/services/alumni.service';
import {
  AlumniDetailResponse,
  AlumniEmploymentResponse,
  CreateAlumniEmploymentRequest,
} from '@/types/alumni.types';
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
  Download,
  RefreshCw,
  AlertCircle,
  Briefcase,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const EMPLOYMENT_TYPE_OPTIONS = [
  'Full Time',
  'Part Time',
  'Contract',
  'Freelance',
  'Self-Employed',
];
const INDUSTRY_SECTOR_OPTIONS = [
  'IT/Software',
  'Manufacturing',
  'Banking & Finance',
  'Consulting',
  'Healthcare',
  'E-commerce',
  'Automotive',
  'Telecom',
  'FMCG',
  'Energy',
  'Education',
  'Government/PSU',
  'Startup',
  'Other',
];
const CAREER_LEVEL_OPTIONS = [
  'Entry Level',
  'Mid Level',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'VP',
  'CXO',
  'Founder',
];

const emptyEmploymentForm = (): CreateAlumniEmploymentRequest => ({
  organizationName: '',
  designation: '',
  industrySector: undefined,
  employmentType: undefined,
  startDate: '',
  currentPackageLpa: undefined,
  careerLevel: undefined,
});

type EmploymentForm = CreateAlumniEmploymentRequest;

export const AlumniEmploymentTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  const [alumniList, setAlumniList] = useState<AlumniDetailResponse[]>([]);
  const [selectedAlumniId, setSelectedAlumniId] = useState<number | null>(null);
  const [alumniLoading, setAlumniLoading] = useState(false);

  const [employments, setEmployments] = useState<AlumniEmploymentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<EmploymentForm>(emptyEmploymentForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!departmentId) return;
    setAlumniLoading(true);
    alumniService
      .listAlumni(departmentId, { size: 500 })
      .then(result => {
        setAlumniList(result.content);
        if (result.content.length === 1) setSelectedAlumniId(result.content[0].id);
      })
      .catch((err: unknown) =>
        toast.error(err instanceof Error ? err.message : 'Failed to load alumni')
      )
      .finally(() => setAlumniLoading(false));
  }, [departmentId]);

  const fetchEmployments = useCallback(
    async (alumniId: number) => {
      if (!departmentId) return;
      setLoading(true);
      setError(null);
      try {
        const result = await alumniService.listEmployments(departmentId, alumniId);
        setEmployments(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load employments';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [departmentId]
  );

  useEffect(() => {
    if (selectedAlumniId) fetchEmployments(selectedAlumniId);
  }, [selectedAlumniId, fetchEmployments]);

  const employmentMatchesSearch = (e: AlumniEmploymentResponse, q: string): boolean => {
    const lq = q.toLowerCase();
    return (
      e.organizationName.toLowerCase().includes(lq) ||
      e.designation.toLowerCase().includes(lq) ||
      (e.industrySector?.toLowerCase().includes(lq) ?? false) ||
      (e.employmentType?.toLowerCase().includes(lq) ?? false) ||
      String(e.currentPackageLpa ?? '').includes(lq) ||
      (e.careerLevel?.toLowerCase().includes(lq) ?? false)
    );
  };

  const filteredEmployments = searchQuery
    ? employments.filter(e => employmentMatchesSearch(e, searchQuery))
    : employments;

  const openCreateDialog = () => {
    setFormData(emptyEmploymentForm());
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!departmentId || !selectedAlumniId) return;
    if (!formData.organizationName || !formData.designation || !formData.startDate) {
      toast.error('Organization Name, Designation, and Start Date are required');
      return;
    }
    setSaving(true);
    try {
      await alumniService.addEmployment(departmentId, selectedAlumniId, formData);
      toast.success('Employment record added successfully');
      setCreateDialogOpen(false);
      fetchEmployments(selectedAlumniId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add employment');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'Alumni ID',
      'Organization Name',
      'Designation',
      'Industry Sector',
      'Employment Type',
      'Start Date',
      'Current Package (LPA)',
      'Career Level',
    ];
    const sampleRow = [
      'ALM2020001',
      'Google',
      'Software Engineer',
      'IT/Software',
      'Full Time',
      '2020-07-01',
      '18.00',
      'Mid Level',
    ];
    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'alumni_employment_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!departmentId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <p className="text-sm font-medium">Department ID not available</p>
          <p className="text-xs text-muted-foreground mt-1">Contact your administrator.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Select Alumni</CardTitle>
        </CardHeader>
        <CardContent>
          {alumniLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={selectedAlumniId ? String(selectedAlumniId) : ''}
              onValueChange={v => {
                setSelectedAlumniId(Number(v));
                setSearchQuery('');
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Choose an alumni..." />
              </SelectTrigger>
              <SelectContent>
                {alumniList.map(a => (
                  <SelectItem key={a.id} value={String(a.id)} className="text-xs">
                    {a.alumniName} ({a.alumniId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {!selectedAlumniId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-muted-foreground">No alumni selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Choose an alumni to view their employment records.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Employment & Career</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {employments.length} record{employments.length !== 1 ? 's' : ''}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => selectedAlumniId && fetchEmployments(selectedAlumniId)}
                    disabled={loading}
                  >
                    <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="text-xs h-8" onClick={openCreateDialog}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Employment
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

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold">Employment Records</CardTitle>
                  <CardDescription className="text-xs">
                    {loading
                      ? 'Loading...'
                      : `${filteredEmployments.length} of ${employments.length} records`}
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    className="h-8 text-xs pl-8 pr-8"
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setSearchQuery('')}
                    >
                      <span className="text-[10px]">✕</span>
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="table-fixed w-full min-w-[900px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-[10px] font-semibold w-8 text-center">#</TableHead>
                      <TableHead className="text-[10px] font-semibold w-28">Organization</TableHead>
                      <TableHead className="text-[10px] font-semibold w-20">Designation</TableHead>
                      <TableHead className="text-[10px] font-semibold w-18">Sector</TableHead>
                      <TableHead className="text-[10px] font-semibold w-14">Type</TableHead>
                      <TableHead className="text-[10px] font-semibold w-14">Start</TableHead>
                      <TableHead className="text-[10px] font-semibold w-14">Package</TableHead>
                      <TableHead className="text-[10px] font-semibold w-14">Level</TableHead>
                      <TableHead className="text-[10px] font-semibold text-center w-16">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading &&
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={`skel-${i}`}>
                          {Array.from({ length: 9 }).map((__, j) => (
                            <TableCell key={j} className={j === 0 ? 'text-center' : ''}>
                              <Skeleton className={`h-4 ${j === 0 ? 'w-4 mx-auto' : 'w-full'}`} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    {!loading && error && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-destructive">
                            <AlertCircle className="h-8 w-8" />
                            <p className="text-xs font-medium">{error}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => selectedAlumniId && fetchEmployments(selectedAlumniId)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" /> Retry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && !error && filteredEmployments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Briefcase className="h-8 w-8 opacity-40" />
                            <p className="text-xs">
                              {searchQuery
                                ? 'No records match your search.'
                                : 'No employment records found.'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading &&
                      !error &&
                      filteredEmployments.map((emp, index) => (
                        <TableRow key={emp.id} className="hover:bg-muted/20">
                          <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5 font-medium">
                            {emp.organizationName}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5">{emp.designation}</TableCell>
                          <TableCell className="text-[10px] p-1.5">
                            <Badge variant="outline" className="text-[9px]">
                              {emp.industrySector || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5">
                            {emp.employmentType || '-'}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5 font-mono">
                            {emp.startDate}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5 font-mono">
                            {emp.currentPackageLpa
                              ? `${emp.currentPackageLpa.toFixed(1)} LPA`
                              : '-'}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5">
                            <Badge variant="secondary" className="text-[9px]">
                              {emp.careerLevel || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center p-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-40 cursor-not-allowed"
                              disabled
                              title="Update API not available yet"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">Add Employment Record</DialogTitle>
            <DialogDescription className="text-xs">
              Required fields marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Organization Name *</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. Google"
                  value={formData.organizationName}
                  onChange={e => setFormData(p => ({ ...p, organizationName: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Designation *</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. Software Engineer"
                  value={formData.designation}
                  onChange={e => setFormData(p => ({ ...p, designation: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Industry Sector</Label>
                <Select
                  value={formData.industrySector || ''}
                  onValueChange={v => setFormData(p => ({ ...p, industrySector: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_SECTOR_OPTIONS.map(o => (
                      <SelectItem key={o} value={o} className="text-xs">
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Employment Type</Label>
                <Select
                  value={formData.employmentType || ''}
                  onValueChange={v => setFormData(p => ({ ...p, employmentType: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPE_OPTIONS.map(o => (
                      <SelectItem key={o} value={o} className="text-xs">
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Start Date *</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Package (LPA)</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 18.00"
                  value={formData.currentPackageLpa ?? ''}
                  onChange={e =>
                    setFormData(p => ({
                      ...p,
                      currentPackageLpa: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Career Level</Label>
                <Select
                  value={formData.careerLevel || ''}
                  onValueChange={v => setFormData(p => ({ ...p, careerLevel: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAREER_LEVEL_OPTIONS.map(o => (
                      <SelectItem key={o} value={o} className="text-xs">
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                saving || !formData.organizationName || !formData.designation || !formData.startDate
              }
            >
              {saving ? 'Adding...' : 'Add Employment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

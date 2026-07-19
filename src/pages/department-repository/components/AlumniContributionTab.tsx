import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { alumniService } from '@/services/alumni.service';
import { AlumniDetailResponse, AlumniContributionResponse, CreateAlumniContributionRequest } from '@/types/alumni.types';
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
  Heart,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CONTRIBUTION_TYPE_OPTIONS = ['Scholarship', 'Donation', 'Infrastructure', 'Endowment', 'Other'];
const DEPARTMENT_OPTIONS = ['CSE', 'ECE', 'EEE', 'MECH', 'Civil', 'Institution-wide'];

const formatAmount = (value: number | null | undefined): string => {
  if (value == null) return '-';
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const emptyForm = (): CreateAlumniContributionRequest => ({
  contributionType: undefined,
  contributionTitle: '',
  contributionValue: 0,
  contributionDate: '',
  beneficiaryDepartment: undefined,
});

type FormData = CreateAlumniContributionRequest;

export const AlumniContributionTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  const [alumniList, setAlumniList] = useState<AlumniDetailResponse[]>([]);
  const [selectedAlumniId, setSelectedAlumniId] = useState<number | null>(null);
  const [alumniLoading, setAlumniLoading] = useState(false);

  const [records, setRecords] = useState<AlumniContributionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!departmentId) return;
    setAlumniLoading(true);
    alumniService.listAlumni(departmentId, { size: 500 })
      .then((result) => {
        setAlumniList(result.content);
        if (result.content.length === 1) setSelectedAlumniId(result.content[0].id);
      })
      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : 'Failed to load alumni'))
      .finally(() => setAlumniLoading(false));
  }, [departmentId]);

  const fetchRecords = useCallback(async (alumniId: number) => {
    if (!departmentId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await alumniService.listContributions(departmentId, alumniId);
      setRecords(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load contribution records';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  }, [departmentId]);

  useEffect(() => {
    if (selectedAlumniId) fetchRecords(selectedAlumniId);
  }, [selectedAlumniId, fetchRecords]);

  const matchesSearch = (r: AlumniContributionResponse, q: string): boolean => {
    const lq = q.toLowerCase();
    return (
      r.contributionTitle.toLowerCase().includes(lq) ||
      (r.contributionType?.toLowerCase().includes(lq) ?? false) ||
      (r.beneficiaryDepartment?.toLowerCase().includes(lq) ?? false) ||
      String(r.contributionValue ?? '').includes(lq)
    );
  };

  const filteredRecords = searchQuery
    ? records.filter((r) => matchesSearch(r, searchQuery))
    : records;

  const openCreateDialog = () => { setFormData(emptyForm()); setCreateDialogOpen(true); };

  const handleCreate = async () => {
    if (!departmentId || !selectedAlumniId) return;
    if (!formData.contributionTitle || !formData.contributionDate || !formData.contributionValue) {
      toast.error('Contribution Title, Value, and Date are required');
      return;
    }
    if (formData.contributionValue <= 0) {
      toast.error('Contribution Value must be greater than 0');
      return;
    }
    setSaving(true);
    try {
      await alumniService.addContribution(departmentId, selectedAlumniId, formData);
      toast.success('Contribution record added successfully');
      setCreateDialogOpen(false);
      fetchRecords(selectedAlumniId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add contribution record');
    } finally { setSaving(false); }
  };

  const handleDownloadTemplate = () => {
    const headers = ['Alumni ID', 'Contribution Type', 'Contribution Title', 'Contribution Value (₹)', 'Contribution Date', 'Beneficiary Department'];
    const sampleRow = ['ALM2020001', 'Scholarship', 'Merit Scholarship Fund', '100000.00', '2024-01-15', 'CSE'];
    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'alumni_contributions_template.csv';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!departmentId) {
    return (
      <Card><CardContent className="py-12 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <p className="text-sm font-medium">Department ID not available</p>
        <p className="text-xs text-muted-foreground mt-1">Contact your administrator.</p>
      </CardContent></Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Select Alumni</CardTitle>
        </CardHeader>
        <CardContent>
          {alumniLoading ? <Skeleton className="h-9 w-full" /> : (
            <Select value={selectedAlumniId ? String(selectedAlumniId) : ''}
              onValueChange={(v) => { setSelectedAlumniId(Number(v)); setSearchQuery(''); }}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Choose an alumni..." /></SelectTrigger>
              <SelectContent>
                {alumniList.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)} className="text-xs">{a.alumniName} ({a.alumniId})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {!selectedAlumniId ? (
        <Card><CardContent className="py-12 text-center">
          <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-muted-foreground">No alumni selected</p>
          <p className="text-xs text-muted-foreground mt-1">Choose an alumni to view their contribution records.</p>
        </CardContent></Card>
      ) : (
        <>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Alumni Contributions</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{records.length} record{records.length !== 1 ? 's' : ''}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => selectedAlumniId && fetchRecords(selectedAlumniId)} disabled={loading}>
                    <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="text-xs h-8" onClick={openCreateDialog}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Contribution
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleDownloadTemplate}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Download Template
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8" disabled title="Upload CSV API not available yet">
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold">Contribution Records</CardTitle>
                  <CardDescription className="text-xs">
                    {loading ? 'Loading...' : `${filteredRecords.length} of ${records.length} records`}
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input className="h-8 text-xs pl-8 pr-8" placeholder="Search records..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} />
                  {searchQuery && (
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setSearchQuery('')}><span className="text-[10px]">✕</span></button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="table-fixed w-full min-w-[800px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-[10px] font-semibold w-8 text-center">#</TableHead>
                      <TableHead className="text-[10px] font-semibold w-18">Type</TableHead>
                      <TableHead className="text-[10px] font-semibold w-28">Title</TableHead>
                      <TableHead className="text-[10px] font-semibold w-20">Value</TableHead>
                      <TableHead className="text-[10px] font-semibold w-14">Date</TableHead>
                      <TableHead className="text-[10px] font-semibold w-18">Department</TableHead>
                      <TableHead className="text-[10px] font-semibold text-center w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={`skel-${i}`}>
                        {Array.from({ length: 7 }).map((__, j) => (
                          <TableCell key={j} className={j === 0 ? 'text-center' : ''}>
                            <Skeleton className={`h-4 ${j === 0 ? 'w-4 mx-auto' : 'w-full'}`} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {!loading && error && (
                      <TableRow><TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-destructive">
                          <AlertCircle className="h-8 w-8" /><p className="text-xs font-medium">{error}</p>
                          <Button variant="outline" size="sm" className="text-xs"
                            onClick={() => selectedAlumniId && fetchRecords(selectedAlumniId)}>
                            <RefreshCw className="h-3 w-3 mr-1" /> Retry</Button>
                        </div>
                      </TableCell></TableRow>
                    )}
                    {!loading && !error && filteredRecords.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Heart className="h-8 w-8 opacity-40" />
                          <p className="text-xs">{searchQuery ? 'No records match your search.' : 'No contribution records found.'}</p>
                        </div>
                      </TableCell></TableRow>
                    )}
                    {!loading && !error && filteredRecords.map((rec, index) => (
                      <TableRow key={rec.id} className="hover:bg-muted/20">
                        <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">{index + 1}</TableCell>
                        <TableCell className="text-[10px] p-1.5">
                          <Badge variant="outline" className="text-[9px]">{rec.contributionType || '-'}</Badge>
                        </TableCell>
                        <TableCell className="text-[10px] p-1.5 font-medium">{rec.contributionTitle}</TableCell>
                        <TableCell className="text-[10px] p-1.5 font-mono">{formatAmount(rec.contributionValue)}</TableCell>
                        <TableCell className="text-[10px] p-1.5 font-mono">{rec.contributionDate}</TableCell>
                        <TableCell className="text-[10px] p-1.5">{rec.beneficiaryDepartment || '-'}</TableCell>
                        <TableCell className="text-center p-1.5">
                          <Button variant="ghost" size="icon" className="h-5 w-5 opacity-40 cursor-not-allowed" disabled title="Update API not available yet">
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
            <DialogTitle className="text-sm">Add Contribution Record</DialogTitle>
            <DialogDescription className="text-xs">Required fields marked with *.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Contribution Type</Label>
                <Select value={formData.contributionType || ''}
                  onValueChange={(v) => setFormData(p => ({ ...p, contributionType: v || undefined }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {CONTRIBUTION_TYPE_OPTIONS.map((o) => (<SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Contribution Title *</Label>
                <Input className="h-9 text-xs" placeholder="e.g. Merit Scholarship Fund" value={formData.contributionTitle}
                  onChange={(e) => setFormData(p => ({ ...p, contributionTitle: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Contribution Value (₹) *</Label>
                <Input className="h-9 text-xs" type="number" step="0.01" min="0.01" placeholder="e.g. 100000.00"
                  value={formData.contributionValue || ''}
                  onChange={(e) => setFormData(p => ({ ...p, contributionValue: e.target.value ? Number(e.target.value) : 0 }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Contribution Date *</Label>
                <Input className="h-9 text-xs" type="date" value={formData.contributionDate}
                  onChange={(e) => setFormData(p => ({ ...p, contributionDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Beneficiary Department</Label>
                <Select value={formData.beneficiaryDepartment || ''}
                  onValueChange={(v) => setFormData(p => ({ ...p, beneficiaryDepartment: v || undefined }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENT_OPTIONS.map((o) => (<SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button size="sm" className="text-xs" onClick={handleCreate}
              disabled={saving || !formData.contributionTitle || !formData.contributionDate || !formData.contributionValue || formData.contributionValue <= 0}>
              {saving ? 'Adding...' : 'Add Contribution'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

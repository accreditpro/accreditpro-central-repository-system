import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { alumniService } from '@/services/alumni.service';
import {
  AlumniDetailResponse,
  AlumniMentorshipResponse,
  CreateAlumniMentorshipRequest,
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
  UsersRound,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const MENTORSHIP_TYPE_OPTIONS = [
  'Career Guidance',
  'Technical Mentorship',
  'Entrepreneurship Mentorship',
  'Research Mentorship',
  'Other',
];

const emptyForm = (): CreateAlumniMentorshipRequest => ({
  mentorshipProgram: '',
  mentorshipType: undefined,
  numberOfMentees: undefined,
  startDate: '',
  endDate: undefined,
});

type FormData = CreateAlumniMentorshipRequest;

export const AlumniMentorshipTab = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId ?? 0;

  const [alumniList, setAlumniList] = useState<AlumniDetailResponse[]>([]);
  const [selectedAlumniId, setSelectedAlumniId] = useState<number | null>(null);
  const [alumniLoading, setAlumniLoading] = useState(false);

  const [records, setRecords] = useState<AlumniMentorshipResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm());
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

  const fetchRecords = useCallback(
    async (alumniId: number) => {
      if (!departmentId) return;
      setLoading(true);
      setError(null);
      try {
        const result = await alumniService.listMentorships(departmentId, alumniId);
        setRecords(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load mentorship records';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [departmentId]
  );

  useEffect(() => {
    if (selectedAlumniId) fetchRecords(selectedAlumniId);
  }, [selectedAlumniId, fetchRecords]);

  const matchesSearch = (r: AlumniMentorshipResponse, q: string): boolean => {
    const lq = q.toLowerCase();
    return (
      r.mentorshipProgram.toLowerCase().includes(lq) ||
      (r.mentorshipType?.toLowerCase().includes(lq) ?? false) ||
      String(r.numberOfMentees ?? '').includes(lq)
    );
  };

  const filteredRecords = searchQuery
    ? records.filter(r => matchesSearch(r, searchQuery))
    : records;

  const openCreateDialog = () => {
    setFormData(emptyForm());
    setCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!departmentId || !selectedAlumniId) return;
    if (!formData.mentorshipProgram || !formData.startDate) {
      toast.error('Mentorship Program and Start Date are required');
      return;
    }
    if (formData.numberOfMentees != null && formData.numberOfMentees < 1) {
      toast.error('Number of mentees must be at least 1');
      return;
    }
    setSaving(true);
    try {
      await alumniService.addMentorship(departmentId, selectedAlumniId, formData);
      toast.success('Mentorship record added successfully');
      setCreateDialogOpen(false);
      fetchRecords(selectedAlumniId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add mentorship record');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'Alumni ID',
      'Mentorship Program',
      'Mentorship Type',
      'Number of Mentees',
      'Start Date',
      'End Date',
    ];
    const sampleRow = [
      'ALM2020001',
      'Career Guidance Program',
      'Career Guidance',
      '10',
      '2024-01-01',
      '2024-06-30',
    ];
    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'alumni_mentorship_template.csv';
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
            <UsersRound className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-muted-foreground">No alumni selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Choose an alumni to view their mentorship records.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Alumni Mentorship</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {records.length} record{records.length !== 1 ? 's' : ''}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => selectedAlumniId && fetchRecords(selectedAlumniId)}
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
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Mentorship
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
                  <CardTitle className="text-sm font-semibold">Mentorship Records</CardTitle>
                  <CardDescription className="text-xs">
                    {loading
                      ? 'Loading...'
                      : `${filteredRecords.length} of ${records.length} records`}
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
                <Table className="table-fixed w-full min-w-[800px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-[10px] font-semibold w-8 text-center">#</TableHead>
                      <TableHead className="text-[10px] font-semibold w-28">Program</TableHead>
                      <TableHead className="text-[10px] font-semibold w-22">Type</TableHead>
                      <TableHead className="text-[10px] font-semibold w-14">Mentees</TableHead>
                      <TableHead className="text-[10px] font-semibold w-14">Start</TableHead>
                      <TableHead className="text-[10px] font-semibold w-14">End</TableHead>
                      <TableHead className="text-[10px] font-semibold text-center w-16">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading &&
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={`skel-${i}`}>
                          {Array.from({ length: 7 }).map((__, j) => (
                            <TableCell key={j} className={j === 0 ? 'text-center' : ''}>
                              <Skeleton className={`h-4 ${j === 0 ? 'w-4 mx-auto' : 'w-full'}`} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    {!loading && error && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-destructive">
                            <AlertCircle className="h-8 w-8" />
                            <p className="text-xs font-medium">{error}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => selectedAlumniId && fetchRecords(selectedAlumniId)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" /> Retry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && !error && filteredRecords.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <UsersRound className="h-8 w-8 opacity-40" />
                            <p className="text-xs">
                              {searchQuery
                                ? 'No records match your search.'
                                : 'No mentorship records found.'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading &&
                      !error &&
                      filteredRecords.map((rec, index) => (
                        <TableRow key={rec.id} className="hover:bg-muted/20">
                          <TableCell className="text-[10px] text-center text-muted-foreground font-mono p-1.5">
                            {index + 1}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5 font-medium">
                            {rec.mentorshipProgram}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5">
                            {rec.mentorshipType ? (
                              <Badge variant="outline" className="text-[9px]">
                                {rec.mentorshipType}
                              </Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5 font-mono">
                            {rec.numberOfMentees != null ? rec.numberOfMentees : '-'}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5 font-mono">
                            {rec.startDate}
                          </TableCell>
                          <TableCell className="text-[10px] p-1.5 font-mono">
                            {rec.endDate || '-'}
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
            <DialogTitle className="text-sm">Add Mentorship Record</DialogTitle>
            <DialogDescription className="text-xs">
              Required fields marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Mentorship Program *</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="e.g. Career Guidance Program"
                  value={formData.mentorshipProgram}
                  onChange={e => setFormData(p => ({ ...p, mentorshipProgram: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Mentorship Type</Label>
                <Select
                  value={formData.mentorshipType || ''}
                  onValueChange={v => setFormData(p => ({ ...p, mentorshipType: v || undefined }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MENTORSHIP_TYPE_OPTIONS.map(o => (
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
                <Label className="text-xs font-medium">Number of Mentees</Label>
                <Input
                  className="h-9 text-xs"
                  type="number"
                  min="1"
                  placeholder="e.g. 10"
                  value={formData.numberOfMentees ?? ''}
                  onChange={e =>
                    setFormData(p => ({
                      ...p,
                      numberOfMentees: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">Start Date *</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">End Date</Label>
                <Input
                  className="h-9 text-xs"
                  type="date"
                  value={formData.endDate ?? ''}
                  onChange={e => setFormData(p => ({ ...p, endDate: e.target.value || undefined }))}
                />
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
                saving ||
                !formData.mentorshipProgram ||
                !formData.startDate ||
                (formData.numberOfMentees != null && formData.numberOfMentees < 1)
              }
            >
              {saving ? 'Adding...' : 'Add Mentorship'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

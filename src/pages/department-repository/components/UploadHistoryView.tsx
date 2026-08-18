import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { uploadHistory } from '../repository-configs';
import {
  infrastructureRepositoryService,
  UploadHistoryData,
  UploadHistoryItem,
} from '@/services/infrastructure-repository.service';
import {
  Search,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  FileSpreadsheet,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

const workflowStatusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-500/10 text-gray-600' },
  submitted: { label: 'Submitted', color: 'bg-blue-500/10 text-blue-600' },
  validated: { label: 'Validated', color: 'bg-indigo-500/10 text-indigo-600' },
  evidence_pending: { label: 'Evidence Pending', color: 'bg-amber-500/10 text-amber-600' },
  hod_review: { label: 'Under HOD Review', color: 'bg-orange-500/10 text-orange-600' },
  iqac_verification: { label: 'Under IQAC Verification', color: 'bg-purple-500/10 text-purple-600' },
  approved: { label: 'Approved', color: 'bg-emerald-500/10 text-emerald-600' },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-600' },
};

interface UploadHistoryViewProps {
  /** When true, the view reads the Infrastructure Coordinator backend instead of mock data. */
  liveMode?: boolean;
}

const PAGE_SIZE = 10;

export const UploadHistoryView = ({ liveMode }: UploadHistoryViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [repoFilter, setRepoFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // ---- live (backend) state ----
  const [liveData, setLiveData] = useState<UploadHistoryData | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [livePage, setLivePage] = useState(0);
  const livePageRef = useRef(0);
  const searchTimer = useRef<number | undefined>(undefined);

  const fetchHistory = useCallback(async (search?: string, page?: number) => {
    if (!liveMode) return;
    const targetPage = page ?? livePageRef.current;
    setLiveLoading(true);
    setLiveError(null);
    try {
      const res = await infrastructureRepositoryService.getUploadHistory({
        repository: repoFilter === 'all' ? undefined : repoFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
        page: targetPage,
        size: PAGE_SIZE,
      });
      setLiveData(res);
      setLivePage(targetPage);
      livePageRef.current = targetPage;
    } catch (e) {
      setLiveError(e instanceof Error ? e.message : 'Failed to load upload history');
    } finally {
      setLiveLoading(false);
    }
  }, [liveMode, repoFilter, statusFilter]);

  useEffect(() => {
    if (!liveMode) return;
    livePageRef.current = 0;
    fetchHistory('', 0);
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [liveMode, repoFilter, statusFilter, fetchHistory]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (!liveMode) return;
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      livePageRef.current = 0;
      fetchHistory(value, 0);
    }, 400);
  };

  const liveRecords = liveData?.content || [];

  const filteredHistory = liveMode
    ? liveRecords
    : uploadHistory.filter(record => {
        const matchesSearch = record.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.tab.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRepo = repoFilter === 'all' || record.repository === repoFilter;
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        return matchesSearch && matchesRepo && matchesStatus;
      });

  const summary = liveMode
    ? {
        totalUploads: liveData?.summary?.totalUploads ?? 0,
        approved: liveData?.summary?.approved ?? 0,
        pending: liveData?.summary?.pending ?? 0,
        rejected: liveData?.summary?.rejected ?? 0,
      }
    : {
        totalUploads: uploadHistory.length,
        approved: uploadHistory.filter(u => u.status === 'approved').length,
        pending: uploadHistory.filter(u => u.status === 'pending').length,
        rejected: uploadHistory.filter(u => u.status === 'rejected').length,
      };

  const renderRow = (record: UploadHistoryItem) => {
    const wfStatus = workflowStatusLabels[record.workflowStatus] || workflowStatusLabels.draft;
    return (
      <TableRow key={record.id} className="hover:bg-muted/50">
        <TableCell>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="text-xs font-medium truncate max-w-[180px]">{record.fileName}</span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="text-[9px] capitalize">{record.repository}</Badge>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">{record.tab}</TableCell>
        <TableCell className="text-xs text-muted-foreground">{record.uploadedAt}</TableCell>
        <TableCell className="text-xs font-medium">{record.recordsCount}</TableCell>
        <TableCell className="text-xs">
          <span className="text-emerald-600">{record.validRecords}</span>
          {' / '}
          <span className="text-red-600">{record.invalidRecords}</span>
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className={cn('text-[9px]', wfStatus.color)}>
            {wfStatus.label}
          </Badge>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold tracking-tight">Upload History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track all CSV uploads and their processing status
        </p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Uploads', value: summary.totalUploads, icon: Upload, color: 'text-indigo-600 bg-indigo-500/10' },
          { label: 'Approved', value: summary.approved, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10' },
          { label: 'Pending', value: summary.pending, icon: Clock, color: 'text-amber-600 bg-amber-500/10' },
          { label: 'Rejected', value: summary.rejected, icon: XCircle, color: 'text-red-600 bg-red-500/10' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className={cn('text-xl font-bold mt-1', stat.color.split(' ')[0])}>{stat.value}</p>
                  </div>
                  <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', stat.color.split(' ')[1])}>
                    <Icon className={cn('h-4 w-4', stat.color.split(' ')[0])} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {liveMode && liveError && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-600">{liveError}</p>
        </div>
      )}

      {/* Upload History Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">All Uploads</CardTitle>
          <CardDescription className="text-xs">Complete history of CSV data uploads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search uploads..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <Select value={repoFilter} onValueChange={setRepoFilter}>
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <Filter className="h-3 w-3 mr-1.5" />
                <SelectValue placeholder="Repository" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Repositories</SelectItem>
                {liveMode ? (
                  <>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="green-campus">Green Campus</SelectItem>
                    <SelectItem value="safety-security">Safety & Security</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {liveMode && liveLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Loading upload history...</span>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px]">File Name</TableHead>
                    <TableHead className="text-[10px]">Repository</TableHead>
                    <TableHead className="text-[10px]">Tab</TableHead>
                    <TableHead className="text-[10px]">Uploaded</TableHead>
                    <TableHead className="text-[10px]">Records</TableHead>
                    <TableHead className="text-[10px]">Valid / Invalid</TableHead>
                    <TableHead className="text-[10px]">Workflow Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <FileSpreadsheet className="h-8 w-8 mx-auto opacity-40 mb-2" />
                        <p className="text-xs">No uploads found.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHistory.map(renderRow)
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {liveMode && (liveData?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between pt-3">
              <p className="text-[10px] text-muted-foreground">
                Page {livePage + 1} of {liveData?.totalPages ?? 1} • {liveData?.totalElements ?? 0} uploads
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline" size="icon" className="h-6 w-6"
                  disabled={livePage === 0}
                  onClick={() => fetchHistory(searchQuery || undefined, livePageRef.current - 1)}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline" size="icon" className="h-6 w-6"
                  disabled={livePage >= (liveData?.totalPages ?? 1) - 1}
                  onClick={() => fetchHistory(searchQuery || undefined, livePageRef.current + 1)}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

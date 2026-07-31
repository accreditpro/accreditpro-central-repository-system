import { useState } from 'react';
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
import { cn } from '@/lib/utils';
import { uploadHistory } from '../repository-configs';
import {
  Search,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';

const workflowStatusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-500/10 text-gray-600' },
  submitted: { label: 'Submitted', color: 'bg-blue-500/10 text-blue-600' },
  validated: { label: 'Validated', color: 'bg-indigo-500/10 text-indigo-600' },
  evidence_pending: { label: 'Evidence Pending', color: 'bg-amber-500/10 text-amber-600' },
  hod_review: { label: 'Under HOD Review', color: 'bg-orange-500/10 text-orange-600' },
  iqac_verification: {
    label: 'Under IQAC Verification',
    color: 'bg-purple-500/10 text-purple-600',
  },
  approved: { label: 'Approved', color: 'bg-emerald-500/10 text-emerald-600' },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-600' },
};

export const UploadHistoryView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [repoFilter, setRepoFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredHistory = uploadHistory.filter(record => {
    const matchesSearch =
      record.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.tab.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRepo = repoFilter === 'all' || record.repository === repoFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesRepo && matchesStatus;
  });

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
          {
            label: 'Total Uploads',
            value: uploadHistory.length,
            icon: Upload,
            color: 'text-indigo-600 bg-indigo-500/10',
          },
          {
            label: 'Approved',
            value: uploadHistory.filter(u => u.status === 'approved').length,
            icon: CheckCircle2,
            color: 'text-emerald-600 bg-emerald-500/10',
          },
          {
            label: 'Pending',
            value: uploadHistory.filter(u => u.status === 'pending').length,
            icon: Clock,
            color: 'text-amber-600 bg-amber-500/10',
          },
          {
            label: 'Rejected',
            value: uploadHistory.filter(u => u.status === 'rejected').length,
            icon: XCircle,
            color: 'text-red-600 bg-red-500/10',
          },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className={cn('text-xl font-bold mt-1', stat.color.split(' ')[0])}>
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'h-9 w-9 rounded-xl flex items-center justify-center',
                      stat.color.split(' ')[1]
                    )}
                  >
                    <Icon className={cn('h-4 w-4', stat.color.split(' ')[0])} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upload History Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">All Uploads</CardTitle>
          <CardDescription className="text-xs">
            Complete history of CSV data uploads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search uploads..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
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
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="research">Research</SelectItem>
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
                {filteredHistory.map(record => {
                  const wfStatus =
                    workflowStatusLabels[record.workflowStatus] || workflowStatusLabels.draft;
                  return (
                    <TableRow key={record.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span className="text-xs font-medium truncate max-w-[180px]">
                            {record.fileName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] capitalize">
                          {record.repository}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{record.tab}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {record.uploadedAt}
                      </TableCell>
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
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

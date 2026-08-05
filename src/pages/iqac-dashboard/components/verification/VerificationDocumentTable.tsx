import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  Eye,
  Download,
  History,
  ShieldCheck,
  MessageSquareWarning,
  Lock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import type { VerificationDocument } from '../../verification-data';
import { HodStatusBadge, IqacStatusBadge } from './verification-status';

export type VerificationTableMode = 'full' | 'pending' | 'verified';

interface VerificationDocumentTableProps {
  documents: VerificationDocument[];
  mode?: VerificationTableMode;
  readOnly?: boolean; // true during impersonation preview
  onPreview: (doc: VerificationDocument) => void;
  onVerify: (doc: VerificationDocument) => void;
  onRaiseObservation: (doc: VerificationDocument) => void;
  onDownload: (doc: VerificationDocument) => void;
  onHistory: (doc: VerificationDocument) => void;
  pageSize?: number;
}

export function VerificationDocumentTable({
  documents,
  mode = 'full',
  readOnly = false,
  onPreview,
  onVerify,
  onRaiseObservation,
  onDownload,
  onHistory,
  pageSize = 10,
}: VerificationDocumentTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'uploadedAt' | 'version'>('uploadedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let list = documents;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.department.toLowerCase().includes(q) ||
          d.repository.toLowerCase().includes(q) ||
          d.folder.toLowerCase().includes(q) ||
          (d.faculty ?? '').toLowerCase().includes(q) ||
          (d.student ?? '').toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = typeof av === 'number' ? (av as number) - (bv as number) : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [documents, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageDocs = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: 'name' | 'uploadedAt' | 'version') => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortHeader = ({ label, column }: { label: string; column: 'name' | 'uploadedAt' | 'version' }) => (
    <button className="inline-flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort(column)}>
      {label}
      <ArrowUpDown className={cn('h-3 w-3', sortKey === column ? 'text-primary' : 'text-muted-foreground/40')} />
    </button>
  );

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search documents, departments, repositories…"
          className="h-8 pl-8 text-xs"
        />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/50">
              <TableHead className="text-xs font-semibold min-w-[220px]">
                <SortHeader label="Document Name" column="name" />
              </TableHead>
              {mode === 'full' && (
                <>
                  <TableHead className="text-xs font-semibold">Repository</TableHead>
                  <TableHead className="text-xs font-semibold">Department</TableHead>
                  <TableHead className="text-xs font-semibold">Academic Year</TableHead>
                </>
              )}
              {mode !== 'full' && <TableHead className="text-xs font-semibold">Repository / Folder</TableHead>}
              <TableHead className="text-xs font-semibold">Uploaded By</TableHead>
              <TableHead className="text-xs font-semibold">
                <SortHeader label="Upload Date" column="uploadedAt" />
              </TableHead>
              {mode === 'full' && <TableHead className="text-xs font-semibold text-center">HOD Approval</TableHead>}
              <TableHead className="text-xs font-semibold text-center">IQAC Verification</TableHead>
              {mode === 'full' && (
                <TableHead className="text-xs font-semibold">
                  <SortHeader label="Last Modified" column="uploadedAt" />
                </TableHead>
              )}
              <TableHead className="text-xs font-semibold text-center">
                <SortHeader label="Version" column="version" />
              </TableHead>
              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageDocs.length === 0 && (
              <TableRow>
                <TableCell colSpan={mode === 'full' ? 11 : 7} className="py-12 text-center text-sm text-muted-foreground">
                  No documents match the current filters.
                </TableCell>
              </TableRow>
            )}
            {pageDocs.map((doc) => {
              // Verified is terminal per the lifecycle — no verify / observation actions on it.
              const canVerify = doc.hodStatus === 'approved' && !readOnly && doc.iqacStatus !== 'verified';
              return (
                <TableRow key={doc.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <button
                          className="text-sm font-medium hover:text-primary hover:underline text-left truncate max-w-[240px]"
                          onClick={() => onPreview(doc)}
                        >
                          {doc.name}
                        </button>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[240px]">
                          {doc.faculty ? `${doc.faculty}` : doc.student ? `${doc.student}` : doc.category}
                          {' · '}{doc.size}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  {mode === 'full' && (
                    <>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-medium">{doc.repository}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{doc.department}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{doc.academicYear}</TableCell>
                    </>
                  )}
                  {mode !== 'full' && (
                    <TableCell className="text-xs">
                      <p className="font-medium">{doc.repository}</p>
                      <p className="text-[10px] text-muted-foreground">{doc.folder}</p>
                    </TableCell>
                  )}
                  <TableCell className="text-xs whitespace-nowrap">{doc.uploadedBy}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{doc.uploadedAt}</TableCell>
                  {mode === 'full' && (
                    <TableCell className="text-center">
                      <HodStatusBadge status={doc.hodStatus} />
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    <IqacStatusBadge status={doc.iqacStatus} />
                    {doc.iqacStatus === 'verified' && doc.verifiedAt && (
                      <p className="text-[9px] text-muted-foreground mt-0.5">{doc.verifiedBy} · {doc.verifiedAt}</p>
                    )}
                  </TableCell>
                  {mode === 'full' && <TableCell className="text-xs whitespace-nowrap">{doc.lastModified}</TableCell>}
                  <TableCell className="text-center text-xs">v{doc.version}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-0.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Preview" onClick={() => onPreview(doc)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Download" onClick={() => onDownload(doc)}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="View History" onClick={() => onHistory(doc)}>
                        <History className="h-3.5 w-3.5" />
                      </Button>
                      {mode === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px] gap-1 ml-1"
                            disabled={!canVerify}
                            title={doc.hodStatus !== 'approved' ? 'Waiting for HOD Approval' : 'Verify document'}
                            onClick={() => onVerify(doc)}
                          >
                            {doc.hodStatus !== 'approved' ? <Lock className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                            Verify
                          </Button>
                        </>
                      )}
                      {mode !== 'pending' && canVerify && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] gap-1 text-blue-600 border-blue-500/30 hover:bg-blue-500/10 ml-1"
                          onClick={() => onVerify(doc)}
                        >
                          <ShieldCheck className="h-3 w-3" />
                          Verify
                        </Button>
                      )}
                      {canVerify && !readOnly && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] gap-1 text-orange-600 border-orange-500/30 hover:bg-orange-500/10"
                          onClick={() => onRaiseObservation(doc)}
                        >
                          <MessageSquareWarning className="h-3 w-3" />
                          Raise Observation
                        </Button>
                      )}
                      {doc.hodStatus !== 'approved' && (
                        <span className="text-[9px] text-muted-foreground italic ml-1">Waiting for HOD Approval</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </span>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-[70px] text-center">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

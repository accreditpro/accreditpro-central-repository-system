import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { evidenceService } from '@/services/evidence.service';
import { useAuth } from '@/hooks/useAuth';
import { EvidenceDocumentResponse } from '@/types/evidence.types';
import { toast } from 'sonner';
import {
  Search,
  Upload,
  Eye,
  Download,
  Replace,
  FileText,
  Filter,
  Loader2,
  Trash2,
  ShieldCheck,
} from 'lucide-react';

// ── Helper: map API doc to UI shape ──
function mapApiDoc(doc: EvidenceDocumentResponse) {
  return {
    id: String(doc.id),
    name: doc.name,
    category: doc.category,
    version: doc.version,
    uploadedBy: `User #${doc.uploadedBy}`,
    uploadedDate: doc.uploadedDate,
    status: doc.status === 'uploaded' ? ('pending' as const) : doc.status,
    fileType: 'pdf' as const,
    size: doc.fileSize,
  };
}

// ── Field definition for the upload/replace form ──
const FILE_TYPE_OPTIONS = ['pdf', 'docx', 'xlsx', 'zip', 'png', 'jpg'] as const;

interface FormState {
  name: string;
  category: string;
  version: string;
  filePath: string;
  fileType: string;
  fileSize: string;
}

const emptyForm: FormState = {
  name: '',
  category: '',
  version: 'v1.0',
  filePath: '',
  fileType: 'pdf',
  fileSize: '',
};

// ═══════════════════════════════════════════════════════════════
// DocumentsView
// ═══════════════════════════════════════════════════════════════

export const DocumentsView = () => {
  const { user } = useAuth();
  const departmentId = user?.departmentId;
  const queryClient = useQueryClient();

  // ── Filters ──
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // ── Dialog states ──
  const [viewDoc, setViewDoc] = useState<EvidenceDocumentResponse | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [replaceDoc, setReplaceDoc] = useState<EvidenceDocumentResponse | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<EvidenceDocumentResponse | null>(null);
  const [verifyDoc, setVerifyDoc] = useState<EvidenceDocumentResponse | null>(null);

  // ── Form state for upload/replace ──
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // ── Verify dialog state ──
  const [verifyStatus, setVerifyStatus] = useState<'verified' | 'rejected'>('verified');
  const [verifyComments, setVerifyComments] = useState('');

  // ── LIST: Section 8.1 ──
  const {
    data: evidencePage,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['evidence', departmentId, categoryFilter],
    queryFn: () =>
      evidenceService.listEvidence(departmentId!, {
        page: 0,
        size: 200,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      }),
    enabled: !!departmentId,
  });

  const rawDocs: EvidenceDocumentResponse[] = evidencePage?.content ?? [];

  const categories = useMemo(() => {
    const cats = new Set<string>();
    rawDocs.forEach((d) => cats.add(d.category));
    return [...cats];
  }, [rawDocs]);

  const filteredDocs = useMemo(() => {
    return rawDocs.filter((doc) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        doc.name.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' || doc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rawDocs, searchQuery, statusFilter]);

  // ── Summary card stats ──
  const totalDocs = rawDocs.length;
  const verifiedCount = rawDocs.filter((d) => d.status === 'verified').length;
  const pendingCount = rawDocs.filter(
    (d) => d.status === 'uploaded' || d.status === 'pending'
  ).length;
  const rejectedCount = rawDocs.filter((d) => d.status === 'rejected').length;

  const summaryCards = [
    { label: 'Total Documents', value: totalDocs, color: 'text-indigo-600 bg-indigo-500/10' },
    { label: 'Verified', value: verifiedCount, color: 'text-emerald-600 bg-emerald-500/10' },
    { label: 'Pending', value: pendingCount, color: 'text-amber-600 bg-amber-500/10' },
    { label: 'Rejected', value: rejectedCount, color: 'text-red-600 bg-red-500/10' },
  ];

  // ── Form helpers ──
  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    if (!form.name.trim()) errors.name = 'Document name is required';
    if (!form.category.trim()) errors.category = 'Category is required';
    if (!form.version.trim()) errors.version = 'Version is required';
    if (!form.filePath.trim()) errors.filePath = 'File path is required';
    if (!form.fileSize.trim()) errors.fileSize = 'File size is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setForm(emptyForm);
    setFormErrors({});
  };

  // ═══════════════════════════════════════════════════════════
  // Section 8.2 — GET Evidence by ID (View)
  // ═══════════════════════════════════════════════════════════
  const {
    data: viewDetail,
    isFetching: viewLoading,
  } = useQuery({
    queryKey: ['evidence', departmentId, 'detail', viewDoc?.id],
    queryFn: () => evidenceService.getEvidence(departmentId!, viewDoc!.id),
    enabled: !!departmentId && !!viewDoc,
  });

  // ═══════════════════════════════════════════════════════════
  // Section 8.3 — CREATE Evidence (Upload)
  // ═══════════════════════════════════════════════════════════
  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      category: string;
      version: string;
      filePath: string;
      fileType: string;
      fileSize: string;
    }) => evidenceService.createEvidence(departmentId!, data),
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      setUploadOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['evidence', departmentId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to upload document');
    },
  });

  // ═══════════════════════════════════════════════════════════
  // Section 8.4 — UPDATE Evidence (Replace)
  // ═══════════════════════════════════════════════════════════
  const updateMutation = useMutation({
    mutationFn: (data: {
      id: number;
      payload: {
        name?: string;
        category?: string;
        version?: string;
        filePath?: string;
        fileType?: string;
        fileSize?: string;
      };
    }) => evidenceService.updateEvidence(departmentId!, data.id, data.payload),
    onSuccess: () => {
      toast.success('Document updated successfully');
      setReplaceDoc(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['evidence', departmentId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update document');
    },
  });

  // ═══════════════════════════════════════════════════════════
  // Section 8.5 — DELETE Evidence
  // ═══════════════════════════════════════════════════════════
  const deleteMutation = useMutation({
    mutationFn: (id: number) => evidenceService.deleteEvidence(departmentId!, id),
    onSuccess: () => {
      toast.success('Document deleted successfully');
      setDeleteDoc(null);
      queryClient.invalidateQueries({ queryKey: ['evidence', departmentId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete document');
    },
  });

  // ═══════════════════════════════════════════════════════════
  // Section 8.6 — VERIFY Evidence
  // ═══════════════════════════════════════════════════════════
  const verifyMutation = useMutation({
    mutationFn: (data: {
      id: number;
      status: 'verified' | 'rejected';
      comments?: string;
    }) => evidenceService.verifyEvidence(departmentId!, data.id, {
      status: data.status,
      comments: data.comments || undefined,
    }),
    onSuccess: (_data, variables) => {
      toast.success(`Document ${variables.status === 'verified' ? 'verified' : 'rejected'} successfully`);
      setVerifyDoc(null);
      setVerifyStatus('verified');
      setVerifyComments('');
      queryClient.invalidateQueries({ queryKey: ['evidence', departmentId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to verify document');
    },
  });

  // ═══════════════════════════════════════════════════════════
  // Upload / Replace form submission
  // ═══════════════════════════════════════════════════════════
  const handleUploadSubmit = () => {
    if (!validateForm()) return;
    createMutation.mutate({
      name: form.name,
      category: form.category,
      version: form.version,
      filePath: form.filePath,
      fileType: form.fileType,
      fileSize: form.fileSize,
    });
  };

  const handleReplaceSubmit = () => {
    if (!validateForm() || !replaceDoc) return;
    updateMutation.mutate({
      id: replaceDoc.id,
      payload: {
        name: form.name,
        category: form.category,
        version: form.version,
        filePath: form.filePath,
        fileType: form.fileType,
        fileSize: form.fileSize,
      },
    });
  };

  const openReplaceDialog = (doc: EvidenceDocumentResponse) => {
    setReplaceDoc(doc);
    setForm({
      name: doc.name,
      category: doc.category,
      version: doc.version,
      filePath: doc.filePath,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
    });
    setFormErrors({});
  };

  // ═══════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════

  const renderFormFields = () => (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="doc-name" className="text-xs">Document Name</Label>
        <Input
          id="doc-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="h-8 text-xs"
          placeholder="e.g. Curriculum Structure R22.pdf"
        />
        {formErrors.name && <p className="text-[10px] text-destructive">{formErrors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="doc-category" className="text-xs">Category</Label>
        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
          <SelectTrigger id="doc-category" className="h-8 text-xs">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.length > 0 ? (
              categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))
            ) : (
              <SelectItem value="General">General</SelectItem>
            )}
          </SelectContent>
        </Select>
        {formErrors.category && <p className="text-[10px] text-destructive">{formErrors.category}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="doc-version" className="text-xs">Version</Label>
          <Input
            id="doc-version"
            value={form.version}
            onChange={(e) => setForm({ ...form, version: e.target.value })}
            className="h-8 text-xs"
            placeholder="v1.0"
          />
          {formErrors.version && <p className="text-[10px] text-destructive">{formErrors.version}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doc-filetype" className="text-xs">File Type</Label>
          <Select value={form.fileType} onValueChange={(v) => setForm({ ...form, fileType: v })}>
            <SelectTrigger id="doc-filetype" className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILE_TYPE_OPTIONS.map((ft) => (
                <SelectItem key={ft} value={ft}>{ft.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="doc-path" className="text-xs">File Path / URL</Label>
        <Input
          id="doc-path"
          value={form.filePath}
          onChange={(e) => setForm({ ...form, filePath: e.target.value })}
          className="h-8 text-xs"
          placeholder="/uploads/documents/filename.pdf"
        />
        {formErrors.filePath && <p className="text-[10px] text-destructive">{formErrors.filePath}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="doc-size" className="text-xs">File Size</Label>
        <Input
          id="doc-size"
          value={form.fileSize}
          onChange={(e) => setForm({ ...form, fileSize: e.target.value })}
          className="h-8 text-xs"
          placeholder="e.g. 2.4 MB"
        />
        {formErrors.fileSize && <p className="text-[10px] text-destructive">{formErrors.fileSize}</p>}
      </div>
    </>
  );

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold tracking-tight">Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage all evidence and supporting documents across repositories
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className={cn('text-xl font-bold mt-1', stat.color.split(' ')[0])}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Actions */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">Document Repository</CardTitle>
              <CardDescription className="text-xs">All evidence documents for your department</CardDescription>
            </div>
            <Button size="sm" className="text-xs h-8" onClick={() => { resetForm(); setUploadOpen(true); }}>
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search & Filters row — exact original placement */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <Filter className="h-3 w-3 mr-1.5" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="uploaded">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[10px]">Document Name</TableHead>
                  <TableHead className="text-[10px]">Category</TableHead>
                  <TableHead className="text-[10px]">Version</TableHead>
                  <TableHead className="text-[10px]">Uploaded Date</TableHead>
                  <TableHead className="text-[10px]">Uploaded By</TableHead>
                  <TableHead className="text-[10px]">Status</TableHead>
                  <TableHead className="text-[10px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs">Loading documents...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <span className="text-xs text-destructive">
                        Failed to load documents. Please try again later.
                      </span>
                    </TableCell>
                  </TableRow>
                ) : filteredDocs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <span className="text-xs text-muted-foreground">
                        {searchQuery || statusFilter !== 'all'
                          ? 'No documents match your search or filter criteria.'
                          : 'No documents found. Upload your first document to get started.'}
                      </span>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocs.map((doc) => {
                    const mapped = mapApiDoc(doc);
                    return (
                      <TableRow key={doc.id} className="hover:bg-muted/20">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <div>
                              <span className="text-xs font-medium block truncate max-w-[200px]">{mapped.name}</span>
                              <span className="text-[10px] text-muted-foreground">{mapped.size}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[9px]">{mapped.category}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{mapped.version}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{mapped.uploadedDate}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{mapped.uploadedBy}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn('text-[9px]',
                            mapped.status === 'verified' && 'bg-emerald-500/10 text-emerald-600',
                            mapped.status === 'pending' && 'bg-amber-500/10 text-amber-600',
                            mapped.status === 'rejected' && 'bg-red-500/10 text-red-600',
                            mapped.status === 'uploaded' && 'bg-blue-500/10 text-blue-600',
                          )}>
                            {mapped.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            {/* Section 8.2: View */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setViewDoc(doc)}
                              title="View details"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>

                            {/* Download (no dedicated API endpoint — uses file path) */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                if (doc.filePath) {
                                  window.open(doc.filePath, '_blank');
                                } else {
                                  toast.error('No file path available for download');
                                }
                              }}
                              title="Download"
                            >
                              <Download className="h-3 w-3" />
                            </Button>

                            {/* Section 8.4: Replace */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => openReplaceDialog(doc)}
                              title="Replace document"
                            >
                              <Replace className="h-3 w-3" />
                            </Button>

                            {/* Section 8.6: Verify (only for uploaded/pending docs) */}
                            {(doc.status === 'uploaded' || doc.status === 'pending') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-amber-600 hover:text-amber-700"
                                onClick={() => { setVerifyDoc(doc); setVerifyStatus('verified'); setVerifyComments(''); }}
                                title="Verify / Reject"
                              >
                                <ShieldCheck className="h-3 w-3" />
                              </Button>
                            )}

                            {/* Section 8.5: Delete */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => setDeleteDoc(doc)}
                              title="Delete document"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════ */}
      {/* Section 8.2 — View Detail Dialog       */}
      {/* ═══════════════════════════════════════ */}
      <Dialog open={!!viewDoc} onOpenChange={(open) => { if (!open) setViewDoc(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Document Details</DialogTitle>
            <DialogDescription className="text-xs">Full metadata for the selected evidence document.</DialogDescription>
          </DialogHeader>

          {viewLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : viewDetail ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <span className="text-muted-foreground font-medium">ID</span>
                <span className="col-span-2">{viewDetail.id}</span>

                <span className="text-muted-foreground font-medium">Name</span>
                <span className="col-span-2 font-medium">{viewDetail.name}</span>

                <span className="text-muted-foreground font-medium">Category</span>
                <span className="col-span-2"><Badge variant="outline" className="text-[9px]">{viewDetail.category}</Badge></span>

                <span className="text-muted-foreground font-medium">Version</span>
                <span className="col-span-2">{viewDetail.version}</span>

                <span className="text-muted-foreground font-medium">File Type</span>
                <span className="col-span-2 uppercase">{viewDetail.fileType}</span>

                <span className="text-muted-foreground font-medium">File Size</span>
                <span className="col-span-2">{viewDetail.fileSize}</span>

                <span className="text-muted-foreground font-medium">File Path</span>
                <span className="col-span-2 text-[10px] truncate" title={viewDetail.filePath}>{viewDetail.filePath}</span>

                <span className="text-muted-foreground font-medium">Status</span>
                <span className="col-span-2">
                  <Badge variant="secondary" className={cn('text-[9px]',
                    viewDetail.status === 'verified' && 'bg-emerald-500/10 text-emerald-600',
                    viewDetail.status === 'uploaded' && 'bg-amber-500/10 text-amber-600',
                    viewDetail.status === 'rejected' && 'bg-red-500/10 text-red-600',
                  )}>
                    {viewDetail.status}
                  </Badge>
                </span>

                <span className="text-muted-foreground font-medium">Uploaded By</span>
                <span className="col-span-2">User #{viewDetail.uploadedBy}</span>

                <span className="text-muted-foreground font-medium">Uploaded Date</span>
                <span className="col-span-2">{viewDetail.uploadedDate}</span>

                {viewDetail.rejectionReason && (
                  <>
                    <span className="text-muted-foreground font-medium text-destructive">Rejection Reason</span>
                    <span className="col-span-2 text-destructive">{viewDetail.rejectionReason}</span>
                  </>
                )}

                <span className="text-muted-foreground font-medium">Created</span>
                <span className="col-span-2 text-[10px]">{viewDetail.createdAt}</span>

                <span className="text-muted-foreground font-medium">Updated</span>
                <span className="col-span-2 text-[10px]">{viewDetail.updatedAt}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-4 text-center">Unable to load document details.</p>
          )}

          <DialogFooter>
            <Button size="sm" className="text-xs h-8" onClick={() => setViewDoc(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════ */}
      {/* Section 8.3 — Upload Dialog            */}
      {/* ═══════════════════════════════════════ */}
      <Dialog open={uploadOpen} onOpenChange={(open) => { if (!open) { setUploadOpen(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Upload Document</DialogTitle>
            <DialogDescription className="text-xs">
              Fill in the metadata for the new evidence document.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {renderFormFields()}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => { setUploadOpen(false); resetForm(); }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs h-8"
              onClick={handleUploadSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Uploading...</>
              ) : (
                'Upload'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════ */}
      {/* Section 8.4 — Replace (Update) Dialog  */}
      {/* ═══════════════════════════════════════ */}
      <Dialog open={!!replaceDoc} onOpenChange={(open) => { if (!open) { setReplaceDoc(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Replace Document</DialogTitle>
            <DialogDescription className="text-xs">
              Update the metadata for this evidence document.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {renderFormFields()}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => { setReplaceDoc(null); resetForm(); }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-xs h-8"
              onClick={handleReplaceSubmit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Updating...</>
              ) : (
                'Update'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════ */}
      {/* Section 8.5 — Delete Confirmation      */}
      {/* ═══════════════════════════════════════ */}
      <AlertDialog open={!!deleteDoc} onOpenChange={(open) => { if (!open) setDeleteDoc(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">Delete Document</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete <strong>{deleteDoc?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8" onClick={() => setDeleteDoc(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-xs h-8 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                if (deleteDoc) deleteMutation.mutate(deleteDoc.id);
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Deleting...</>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ═══════════════════════════════════════ */}
      {/* Section 8.6 — Verify / Reject Dialog   */}
      {/* ═══════════════════════════════════════ */}
      <Dialog open={!!verifyDoc} onOpenChange={(open) => { if (!open) { setVerifyDoc(null); setVerifyComments(''); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Verify Document</DialogTitle>
            <DialogDescription className="text-xs">
              Review and verify or reject <strong>{verifyDoc?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="verify-status" className="text-xs">Decision</Label>
              <Select value={verifyStatus} onValueChange={(v) => setVerifyStatus(v as 'verified' | 'rejected')}>
                <SelectTrigger id="verify-status" className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">
                    <span className="text-emerald-600">✓ Verified</span>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <span className="text-red-600">✗ Rejected</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="verify-comments" className="text-xs">
                Comments {verifyStatus === 'rejected' && <span className="text-destructive">(required for rejection)</span>}
              </Label>
              <Textarea
                id="verify-comments"
                value={verifyComments}
                onChange={(e) => setVerifyComments(e.target.value)}
                className="text-xs min-h-[60px]"
                placeholder="Add any remarks or reason for rejection..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => { setVerifyDoc(null); setVerifyComments(''); }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className={cn(
                'text-xs h-8',
                verifyStatus === 'verified'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700'
              )}
              onClick={() => {
                if (!verifyDoc) return;
                if (verifyStatus === 'rejected' && !verifyComments.trim()) {
                  toast.error('Please provide a reason for rejection');
                  return;
                }
                verifyMutation.mutate({
                  id: verifyDoc.id,
                  status: verifyStatus,
                  comments: verifyComments.trim() || undefined,
                });
              }}
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? (
                <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing...</>
              ) : (
                verifyStatus === 'verified' ? 'Verify' : 'Reject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

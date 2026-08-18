import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Upload,
  Download,
  Trash2,
  FileText,
  FolderOpen,
  ArrowLeft,
  Calendar,
  User,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { financeDocumentCategories } from '../finance-configs';
import { EvidenceUploadDialog, EvidenceCategory } from '@/components/shared/EvidenceUploadDialog';
import { useReadOnly } from '@/hooks/useReadOnly';
import {
  financeRepositoryService,
  FinanceDocumentRecord,
} from '@/services/finance-repository.service';

const uploadCategories: EvidenceCategory[] = financeDocumentCategories.map((c) => ({
  id: c.id,
  label: c.label,
  description: `Upload financial evidence documents for ${c.label.toLowerCase()}`,
  icon: <FileText className="h-4 w-4 text-primary" />,
}));

interface Document {
  id: number;
  name: string;
  type: string;
  uploadedBy: string;
  uploadDate: string;
  size: string;
  status: string;
}

export function FinanceDocumentsView() {
  const isReadOnly = useReadOnly();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<EvidenceCategory | null>(null);

  // ---- live (backend) state ----
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchTimer = useRef<number | undefined>(undefined);

  const toDocument = (doc: FinanceDocumentRecord): Document => ({
    id: Number(doc.id),
    name: doc.title || doc.name,
    type: doc.type || 'PDF',
    uploadedBy: doc.uploadedBy || '—',
    uploadDate: doc.uploadDate || '',
    size: doc.size || '—',
    status: doc.status || 'Pending',
  });

  const fetchDocuments = useCallback(async (search?: string, category?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await financeRepositoryService.getDocuments({
        category: category || undefined,
        search: search || undefined,
        page: 0,
        size: 100,
      });
      setDocuments((res.content || []).map(toDocument));
      setCategoryCounts(Object.fromEntries((res.categories || []).map((c) => [c.id, Number(c.count)])));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments('', selectedCategory);
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [fetchDocuments, selectedCategory]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => fetchDocuments(value, selectedCategory), 400);
  };

  const handleUpload = async (files: File[], category: string) => {
    setError(null);
    try {
      await financeRepositoryService.uploadDocuments(files, category);
      fetchDocuments(searchQuery, selectedCategory);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to upload documents');
      // Rethrow so the EvidenceUploadDialog (which awaits onSave) stays open
      // instead of closing on a failed upload.
      throw e;
    }
  };

  /** Dialog saves files keyed by category id; upload each category's files with its own category param. */
  const handleDialogSave = async (result: { files: Record<string, { file?: File }[]> }) => {
    const entries = Object.entries(result.files || {});
    for (const [category, uploaded] of entries) {
      const files = (uploaded || []).map((u) => u.file).filter((f): f is File => !!f);
      if (files.length === 0) continue;
      // handleUpload rethrows on failure; the dialog only closes when all
      // category uploads succeed.
      await handleUpload(files, category);
    }
    setUploadDialogOpen(false);
  };

  const handleDownload = (doc: Document) => {
    financeRepositoryService.downloadDocument(doc.id, doc.name).catch(() => undefined);
  };

  const handleDelete = async (doc: Document) => {
    try {
      await financeRepositoryService.deleteDocument(doc.id);
      fetchDocuments(searchQuery, selectedCategory);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete document');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Under Review': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Supporting Documents</h3>
            <p className="text-sm text-muted-foreground">Manage financial documents organized by category</p>
          </div>
          {!isReadOnly && (
            <Button size="sm" className="gap-2" onClick={() => { setUploadTarget(null); setUploadDialogOpen(true); }}>
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {financeDocumentCategories.map((category) => {
            const count = categoryCounts[category.id] ?? category.count;
            return (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                onClick={() => setSelectedCategory(category.id)}
                onDoubleClick={() => {
                  if (isReadOnly) return;
                  setUploadTarget(uploadCategories.find((c) => c.id === category.id) || null);
                  setUploadDialogOpen(true);
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{category.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{count} documents</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Evidence Upload Dialog */}
        <EvidenceUploadDialog
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          title={uploadTarget?.label || 'Finance Supporting Documents'}
          subtitle={
            uploadTarget
              ? `Upload supporting documents for ${uploadTarget.label.toLowerCase()}`
              : 'Upload financial supporting documents across all categories'
          }
          categories={uploadTarget ? [uploadTarget] : uploadCategories}
          onSave={handleDialogSave}
        />
      </div>
    );
  }

  const categoryLabel = financeDocumentCategories.find(c => c.id === selectedCategory)?.label || '';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h3 className="text-lg font-semibold">{categoryLabel}</h3>
          <p className="text-xs text-muted-foreground">{documents.length} documents</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        {!isReadOnly && (
          <Button size="sm" className="gap-2" onClick={() => { setUploadTarget(uploadCategories.find((c) => c.id === selectedCategory) || null); setUploadDialogOpen(true); }}>
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No documents found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        {doc.uploadedBy}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {doc.uploadDate}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{doc.size}</TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${getStatusColor(doc.status)}`}>{doc.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(doc)}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        {!isReadOnly && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(doc)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Evidence Upload Dialog */}
      <EvidenceUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        title={uploadTarget?.label || 'Finance Supporting Documents'}
        subtitle={
          uploadTarget
            ? `Upload supporting documents for ${uploadTarget.label.toLowerCase()}`
            : 'Upload financial supporting documents across all categories'
        }
        categories={uploadTarget ? [uploadTarget] : uploadCategories}
        onSave={handleDialogSave}
      />
    </div>
  );
}

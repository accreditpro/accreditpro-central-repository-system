import { useState, useCallback, useEffect } from 'react';
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
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { tpoDocumentCategories } from '../tpo-configs';
import {
  EvidenceUploadDialog,
  EvidenceCategory,
  EvidenceUploadResult,
} from '@/components/shared/EvidenceUploadDialog';
import { tpoRepositoryService, TpoDocumentRecord } from '@/services/tpo.service';

interface DocumentsViewProps {
  departmentId: number;
  academicYear: string;
}

const uploadCategories: EvidenceCategory[] = tpoDocumentCategories.map((c) => ({
  id: c.id,
  label: c.label,
  description: `Upload placement & training evidence documents for ${c.label.toLowerCase()}`,
  icon: <FileText className="h-4 w-4 text-primary" />,
}));

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TPODocumentsView({ departmentId, academicYear }: DocumentsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<EvidenceCategory | null>(null);
  const [documents, setDocuments] = useState<TpoDocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadDocuments = useCallback(() => {
    setLoading(true);
    setError(null);
    tpoRepositoryService
      .getDocuments({
        departmentId,
        academicYear,
        sectionName: 'documents',
        page: 0,
        size: 500,
      })
      .then((page) => setDocuments(page.content ?? []))
      .catch(() => setError('Failed to load supporting documents. Please try again.'))
      .finally(() => setLoading(false));
  }, [departmentId, academicYear]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Real per-category counts from the documents that actually exist.
  const categoryCounts = useCallback(
    (categoryId: string) =>
      documents.filter((doc) => doc.documentType === categoryId).length,
    [documents]
  );

  const currentDocs = selectedCategory
    ? documents.filter((doc) => doc.documentType === selectedCategory)
    : [];
  const filteredDocs = currentDocs.filter((doc) =>
    doc.documentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (doc: TpoDocumentRecord) => {
    try {
      await tpoRepositoryService.downloadDocument(doc.id, departmentId, doc.documentName);
    } catch {
      setError('Download failed. Please try again.');
    }
  };

  const handleDelete = async (doc: TpoDocumentRecord) => {
    if (!window.confirm(`Delete "${doc.documentName}"? This cannot be undone.`)) return;
    setDeletingId(doc.id);
    setError(null);
    try {
      await tpoRepositoryService.deleteDocument(doc.id, departmentId);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch {
      setError('Delete failed. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUploadSave = async (result: EvidenceUploadResult) => {
    const filesByCategory = result.files;
    const entries = Object.entries(filesByCategory).filter(
      ([, files]) => files.length > 0
    );
    for (const [categoryId, files] of entries) {
      for (const file of files) {
        if (!file.file) continue;
        await tpoRepositoryService.uploadDocument(file.file, {
          departmentId,
          academicYear,
          sectionName: 'documents',
          documentType: categoryId,
        });
      }
    }
    loadDocuments();
  };

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading supporting documents...
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Supporting Documents</h3>
            <p className="text-sm text-muted-foreground">
              Manage placement and training documents organized by category · Academic Year {academicYear}
            </p>
          </div>
          <Button size="sm" className="gap-2" onClick={() => { setUploadTarget(null); setUploadDialogOpen(true); }}>
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tpoDocumentCategories.map((category) => {
            const count = categoryCounts(category.id);
            return (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                onClick={() => setSelectedCategory(category.id)}
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
          title={uploadTarget?.label || 'TPO Supporting Documents'}
          subtitle={
            uploadTarget
              ? `Upload supporting documents for ${uploadTarget.label.toLowerCase()}`
              : 'Upload placement & training supporting documents across all categories'
          }
          categories={uploadTarget ? [uploadTarget] : uploadCategories}
          onSave={handleUploadSave}
        />
      </div>
    );
  }

  const categoryLabel = tpoDocumentCategories.find((c) => c.id === selectedCategory)?.label || '';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h3 className="text-lg font-semibold">{categoryLabel}</h3>
          <p className="text-xs text-muted-foreground">{filteredDocs.length} documents</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button size="sm" className="gap-2" onClick={() => { setUploadTarget(uploadCategories.find((c) => c.id === selectedCategory) || null); setUploadDialogOpen(true); }}>
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocs.length === 0 ? (
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
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{doc.documentName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{doc.documentType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-IN') : '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatFileSize(doc.size)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleDownload(doc)}
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(doc)}
                          disabled={deletingId === doc.id}
                          title="Delete"
                        >
                          {deletingId === doc.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
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
        title={uploadTarget?.label || 'TPO Supporting Documents'}
        subtitle={
          uploadTarget
            ? `Upload supporting documents for ${uploadTarget.label.toLowerCase()}`
            : 'Upload placement & training supporting documents across all categories'
        }
        categories={uploadTarget ? [uploadTarget] : uploadCategories}
        onSave={handleUploadSave}
      />
    </div>
  );
}

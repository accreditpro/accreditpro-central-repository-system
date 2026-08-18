import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Map,
  FileCheck,
  Flame,
  BookOpen,
  Monitor,
  Leaf,
  Zap,
  Droplets,
  Award,
  ShieldCheck,
  FileText,
  Shield,
  Search,
  Upload,
  Download,
  Trash2,
  FolderOpen,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { infrastructureDocumentCategories } from '../infrastructure-configs';
import { EvidenceUploadDialog, EvidenceCategory } from '@/components/shared/EvidenceUploadDialog';
import { useReadOnly } from '@/hooks/useReadOnly';
import {
  infrastructureRepositoryService,
  DocumentRecord,
} from '@/services/infrastructure-repository.service';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Map, FileCheck, Flame, BookOpen, Monitor, Leaf, Zap, Droplets, Award, ShieldCheck, FileText, Shield,
};

const uploadCategories: EvidenceCategory[] = infrastructureDocumentCategories.map((c) => ({
  id: c.id,
  label: c.label,
  description: `Upload evidence documents for ${c.label.toLowerCase()}`,
  icon: (() => {
    const IconComponent = iconMap[c.icon] || FileText;
    return <IconComponent className="h-4 w-4 text-primary" />;
  })(),
}));

export const InfrastructureDocumentsView = () => {
  const isReadOnly = useReadOnly();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<EvidenceCategory | null>(null);

  // ---- live (backend) state ----
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const searchTimer = useRef<number | undefined>(undefined);

  const fetchDocuments = useCallback(async (search?: string, category?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await infrastructureRepositoryService.getDocuments({
        category: category || undefined,
        search: search || undefined,
        page: 0,
        size: 100,
      });
      setDocuments(res.content || []);
      setCategoryCounts(Object.fromEntries((res.categories || []).map(c => [c.id, c.count])));
      setTotalElements(res.totalElements || 0);
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

  const handleUpload = async (files: File[], category: string, title?: string, version?: string) => {
    setError(null);
    try {
      await infrastructureRepositoryService.uploadDocuments(files, category, title, version);
      fetchDocuments(searchQuery, selectedCategory);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to upload documents');
    }
  };

  /** Dialog saves files keyed by category id; upload each category's files with its own category param. */
  const handleDialogSave = async (result: { files: Record<string, { file?: File }[]> }) => {
    const entries = Object.entries(result.files || {});
    let uploadedAny = false;
    for (const [category, uploaded] of entries) {
      const files = (uploaded || []).map(u => u.file).filter((f): f is File => !!f);
      if (files.length === 0) continue;
      await handleUpload(files, category);
      uploadedAny = true;
    }
    if (uploadedAny) setUploadDialogOpen(false);
  };

  const handleDownload = (doc: DocumentRecord) => {
    infrastructureRepositoryService.downloadDocument(doc.id, doc.name).catch(() => undefined);
  };

  const handleDelete = async (doc: DocumentRecord) => {
    try {
      await infrastructureRepositoryService.deleteDocument(doc.id);
      fetchDocuments(searchQuery, selectedCategory);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete document');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
      case 'uploaded': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Supporting Documents</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage infrastructure supporting documents and evidence</p>
        </div>
        {!isReadOnly && (
          <Button className="gap-2" onClick={() => { setUploadTarget(null); setUploadDialogOpen(true); }}>
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

      {/* Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {infrastructureDocumentCategories.map((category, index) => {
          const IconComponent = iconMap[category.icon] || FileText;
          const isSelected = selectedCategory === category.id;
          const count = categoryCounts[category.id] ?? category.count;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card
                className={`border shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-primary border-primary' : ''
                }`}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                onDoubleClick={() => {
                  if (isReadOnly) return;
                  setUploadTarget(uploadCategories.find((c) => c.id === category.id) || null);
                  setUploadDialogOpen(true);
                }}
              >
                <CardContent className="p-3 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 rounded-lg bg-muted">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-xs font-medium leading-tight">{category.label}</p>
                  <Badge variant="secondary" className="mt-1.5 text-[10px]">{count} files</Badge>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Documents List */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            {selectedCategory
              ? infrastructureDocumentCategories.find(c => c.id === selectedCategory)?.label
              : 'All Documents'
            }
            <Badge variant="secondary" className="ml-2">{loading ? '...' : documents.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading documents...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
                    <FileText className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title || doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(doc.uploadedBy || '—')} • {(doc.uploadedDate || '—')} • {doc.size || '—'}
                      {doc.version ? ` • v${doc.version}` : ''}
                    </p>
                  </div>
                  <Badge className={`text-[10px] ${getStatusColor(doc.status || 'uploaded')}`}>
                    {doc.status || 'uploaded'}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(doc)}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    {!isReadOnly && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => handleDelete(doc)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evidence Upload Dialog */}
      <EvidenceUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        title={uploadTarget?.label || 'Infrastructure Supporting Documents'}
        subtitle={
          uploadTarget
            ? `Upload supporting documents for ${uploadTarget.label.toLowerCase()}`
            : 'Upload supporting documents across all infrastructure categories'
        }
        categories={uploadTarget ? [uploadTarget] : uploadCategories}
        onSave={handleDialogSave}
      />
    </div>
  );
};

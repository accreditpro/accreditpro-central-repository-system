import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Search,
  FileText,
  FileImage,
  File,
  Download,
  Upload,
  Eye,
  Trash2,
  FolderOpen,
  FolderClosed,
  CheckCircle2,
  Paperclip,
  Heart,
  Shield,
  Trophy,
  Music,
  HandHeart,
  Users,
  Layers,
  BookMarked,
  Award,
  Medal,
  Calendar,
  AlertCircle,
  ImageIcon,
  FileArchive,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import {
  TPOEvidence,
  TPOEvidenceSectionConfig,
  UploadedFile,
} from '@/pages/tpo-repository/components/TPOEvidenceDialog';
import { ImageZoomViewer } from '@/components/shared/ImageZoomViewer';
import { EvidenceUploadDialog, EvidenceCategory } from '@/components/shared/EvidenceUploadDialog';

const uploadCategories: EvidenceCategory[] = [
  { id: 'nss', label: 'NSS Activities', icon: <Heart className="h-4 w-4 text-primary" /> },
  { id: 'ncc', label: 'NCC Activities', icon: <Shield className="h-4 w-4 text-primary" /> },
  { id: 'sports', label: 'Sports Activities', icon: <Trophy className="h-4 w-4 text-primary" /> },
  { id: 'cultural', label: 'Cultural Activities', icon: <Music className="h-4 w-4 text-primary" /> },
  { id: 'events', label: 'Events', icon: <Calendar className="h-4 w-4 text-primary" /> },
  { id: 'achievements', label: 'Student Achievements', icon: <Award className="h-4 w-4 text-primary" /> },
  { id: 'extension', label: 'Extension Activities', icon: <HandHeart className="h-4 w-4 text-primary" /> },
  { id: 'outreach', label: 'Community Outreach', icon: <Users className="h-4 w-4 text-primary" /> },
  { id: 'clubs', label: 'Clubs & Societies', icon: <Layers className="h-4 w-4 text-primary" /> },
  { id: 'chapters', label: 'Student Chapters', icon: <BookMarked className="h-4 w-4 text-primary" /> },
];

// ============================================================
// TYPES
// ============================================================

interface FlattenedDocument {
  id: string;
  sectionId: string;
  sectionLabel: string;
  recordId: string;
  recordName: string;
  categoryId: string;
  categoryLabel: string;
  file: UploadedFile;
}

interface SectionFolder {
  id: string;
  label: string;
  count: number;
  size: number;
  categories: number;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

interface StudentDevelopmentDocumentsViewProps {
  evidenceData: Record<string, Record<string, TPOEvidence | null>>;
  sectionEvidenceConfigs: Record<string, TPOEvidenceSectionConfig[]>;
  sectionLabels: Record<string, string>;
  onRemoveEvidenceFile?: (
    sectionId: string,
    recordId: string,
    sectionConfigId: string,
    fileId: string
  ) => void;
}

// ============================================================
// HELPERS
// ============================================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <FileImage className="h-4 w-4 text-pink-500" />;
  if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  if (type.includes('word') || type.includes('docx')) return <FileText className="h-4 w-4 text-blue-500" />;
  if (type.includes('sheet') || type.includes('xlsx') || type.includes('csv')) return <FileArchive className="h-4 w-4 text-emerald-500" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

function getSectionMeta(sectionId: string): { icon: React.ReactNode; color: string; bg: string } {
  const meta: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    nss:                    { icon: <Heart className="h-5 w-5" />, color: 'text-rose-600', bg: 'bg-rose-500/10' },
    ncc:                    { icon: <Shield className="h-5 w-5" />, color: 'text-orange-600', bg: 'bg-orange-500/10' },
    'sports-activities':    { icon: <Trophy className="h-5 w-5" />, color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
    'cultural-activities':  { icon: <Music className="h-5 w-5" />, color: 'text-pink-600', bg: 'bg-pink-500/10' },
    events:                 { icon: <Calendar className="h-5 w-5" />, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    'student-achievements': { icon: <Award className="h-5 w-5" />, color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
    'extension-activities': { icon: <HandHeart className="h-5 w-5" />, color: 'text-teal-600', bg: 'bg-teal-500/10' },
    'community-outreach':   { icon: <Users className="h-5 w-5" />, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    clubs:                  { icon: <Layers className="h-5 w-5" />, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    'student-chapters':     { icon: <BookMarked className="h-5 w-5" />, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    'student-awards':       { icon: <Medal className="h-5 w-5" />, color: 'text-amber-600', bg: 'bg-amber-500/10' },
  };
  return meta[sectionId] || { icon: <FolderClosed className="h-5 w-5" />, color: 'text-muted-foreground', bg: 'bg-muted' };
}

// ============================================================
// COMPONENT
// ============================================================

export function StudentDevelopmentDocumentsView({
  evidenceData,
  sectionEvidenceConfigs,
  sectionLabels,
  onRemoveEvidenceFile,
}: StudentDevelopmentDocumentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Flatten all evidence data into a list of documents
  const allDocuments = useMemo(() => {
    const docs: FlattenedDocument[] = [];
    const sectionIds = Object.keys(evidenceData);

    for (const sectionId of sectionIds) {
      const recordMap = evidenceData[sectionId];
      if (!recordMap) continue;
      const configs = sectionEvidenceConfigs[sectionId] || [];
      const configMap = new Map(configs.map((c) => [c.id, c.label]));

      for (const [recordId, evidence] of Object.entries(recordMap)) {
        if (!evidence) continue;
        const sectionName = sectionLabels[sectionId] || sectionId;

        for (const [categoryId, files] of Object.entries(evidence.sections)) {
          const categoryLabel = configMap.get(categoryId) || categoryId;

          for (const file of files) {
            docs.push({
              id: `${sectionId}-${recordId}-${categoryId}-${file.id}`,
              sectionId,
              sectionLabel: sectionName,
              recordId,
              recordName: sectionName,
              categoryId,
              categoryLabel,
              file,
            });
          }
        }
      }
    }

    return docs;
  }, [evidenceData, sectionEvidenceConfigs, sectionLabels]);

  // Build section folders from the flattened documents
  const folders = useMemo(() => {
    const map = new Map<string, SectionFolder>();

    for (const doc of allDocuments) {
      const existing = map.get(doc.sectionId);
      const meta = getSectionMeta(doc.sectionId);

      if (existing) {
        existing.count++;
        existing.size += doc.file.size;
      } else {
        map.set(doc.sectionId, {
          id: doc.sectionId,
          label: sectionLabels[doc.sectionId] || doc.sectionId,
          count: 1,
          size: doc.file.size,
          categories: 0,
          color: meta.color,
          bgColor: meta.bg,
          icon: meta.icon,
        });
      }
    }

    // Calculate unique categories per section
    for (const sectionId of map.keys()) {
      const cats = new Set(
        allDocuments.filter((d) => d.sectionId === sectionId).map((d) => d.categoryId)
      );
      const folder = map.get(sectionId)!;
      folder.categories = cats.size;
    }

    return Array.from(map.values());
  }, [allDocuments, sectionLabels]);

  // Filtered folders (in folder view) or filtered documents (in section view)
  const filteredFolders = useMemo(() => {
    if (!searchQuery) return folders;
    const q = searchQuery.toLowerCase();
    return folders.filter((f) => f.label.toLowerCase().includes(q));
  }, [folders, searchQuery]);

  const sectionDocuments = useMemo(() => {
    if (!selectedSection) return [];
    let docs = allDocuments.filter((d) => d.sectionId === selectedSection);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.file.name.toLowerCase().includes(q) ||
          d.categoryLabel.toLowerCase().includes(q)
      );
    }
    return docs;
  }, [allDocuments, selectedSection, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const totalFiles = allDocuments.length;
    const totalSections = new Set(allDocuments.map((d) => d.sectionId)).size;
    const totalCategories = new Set(allDocuments.map((d) => d.categoryId)).size;
    const totalSize = allDocuments.reduce((sum, d) => sum + d.file.size, 0);
    return { totalFiles, totalSections, totalCategories, totalSize };
  }, [allDocuments]);

  const handleRemove = useCallback(
    (doc: FlattenedDocument) => {
      onRemoveEvidenceFile?.(doc.sectionId, doc.recordId, doc.categoryId, doc.file.id);
      setSuccessMsg(`Removed "${doc.file.name}" from ${doc.sectionLabel}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    [onRemoveEvidenceFile]
  );

  const handleDownload = useCallback((file: UploadedFile) => {
    if (file.dataUrl) {
      const a = document.createElement('a');
      a.href = file.dataUrl;
      a.download = file.name;
      a.click();
    } else {
      setSuccessMsg('Download not available for this file');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  }, []);

  const handlePreview = useCallback((file: UploadedFile) => {
    // Show images and PDFs inline in the dialog
    if (file.dataUrl && (file.type.startsWith('image/') || file.type.includes('pdf'))) {
      setPreviewFile(file);
    } else if (file.dataUrl) {
      window.open(file.dataUrl, '_blank');
    } else {
      setSuccessMsg('Preview not available for this file');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  }, []);

  // ============================================================
  // RENDER: Folder Grid View
  // ============================================================

  const renderFolderGrid = () => (
    <>
      {/* Folder Grid */}
      {filteredFolders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground font-medium">
            {searchQuery ? 'No sections match your search' : 'No documents uploaded yet'}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            {searchQuery
              ? 'Try a different search term'
              : 'Upload documents to any section using the document upload dialog.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFolders.map((folder, idx) => (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              onClick={() => {
                setSelectedSection(folder.id);
                setSearchQuery('');
              }}
              className="group cursor-pointer"
            >
              <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-10 w-10 rounded-lg ${folder.bgColor} flex items-center justify-center ${folder.color}`}>
                      {folder.icon}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary/60 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  <h4 className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors">
                    {folder.label}
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="font-medium">{folder.count}</span>
                      <span className="text-[10px]">document{folder.count !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="text-[10px]">•</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{folder.categories}</span>
                      <span className="text-[10px]">categor{folder.categories !== 1 ? 'ies' : 'y'}</span>
                    </div>
                  </div>

                  {/* Mini file summary */}
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <div className="flex flex-wrap gap-1">
                      {folder.size > 0 && (
                        <span className="text-[9px] text-muted-foreground">
                          Total: {formatFileSize(folder.size)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );

  // ============================================================
  // RENDER: Section Document View
  // ============================================================

  const selectedFolderMeta = selectedSection ? folders.find((f) => f.id === selectedSection) : null;

  const renderSectionDocuments = () => (
    <>
      {/* Breadcrumb / Back */}
      <div className="flex items-center gap-2 mb-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => {
            setSelectedSection(null);
            setSearchQuery('');
          }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Sections
        </Button>
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <span className="text-sm font-semibold">{selectedFolderMeta?.label || selectedSection}</span>
        <Badge variant="secondary" className="text-[9px]">
          {sectionDocuments.length} document{sectionDocuments.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Section summary bar */}
      {selectedFolderMeta && (
        <div className="flex items-center gap-3 px-3 py-2 bg-muted/10 rounded-lg border border-border/50">
          <div className={`h-8 w-8 rounded-lg ${selectedFolderMeta.bgColor} flex items-center justify-center ${selectedFolderMeta.color}`}>
            {selectedFolderMeta.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{selectedFolderMeta.label}</p>
            <p className="text-[10px] text-muted-foreground">
              {selectedFolderMeta.count} files • {selectedFolderMeta.categories} categor{selectedFolderMeta.categories !== 1 ? 'ies' : 'y'} • {formatFileSize(selectedFolderMeta.size)} total
            </p>
          </div>
        </div>
      )}

      {/* Document List */}
      {sectionDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground font-medium">
            {searchQuery ? 'No documents match your search' : 'No documents in this section'}
          </p>
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 py-2.5 w-8">#</th>
                    <th className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 py-2.5">Evidence Type</th>
                    <th className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 py-2.5">File Name</th>
                    <th className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 py-2.5">Size</th>
                    <th className="text-right text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {sectionDocuments.map((doc, idx) => (
                      <motion.tr
                        key={doc.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-b border-border/30 group hover:bg-muted/50 transition-colors"
                      >
                        <td className="text-[10px] text-muted-foreground px-3 py-2.5 align-middle">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2.5 align-middle">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[9px] font-medium px-1.5 py-0">
                              {doc.categoryLabel}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 align-middle">
                          <div className="flex items-center gap-2">
                            {getFileIcon(doc.file.type)}
                            <div className="min-w-0">
                              <p className="text-[11px] font-medium truncate max-w-[300px]">
                                {doc.file.name}
                              </p>
                              <p className="text-[9px] text-muted-foreground">
                                {doc.file.uploadedAt
                                  ? new Date(doc.file.uploadedAt).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : 'Unknown date'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 align-middle">
                          <span className="text-[10px] text-muted-foreground">
                            {formatFileSize(doc.file.size)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 align-middle text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            {/* Preview */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handlePreview(doc.file)}
                              title={doc.file.type.startsWith('image/') ? 'Preview' : 'Open'}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {/* Download */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleDownload(doc.file)}
                              title="Download"
                            >
                              <Download className="h-3.5 w-3.5 text-blue-500" />
                            </Button>
                            {/* Remove */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleRemove(doc)}
                              title="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {selectedSection && selectedFolderMeta
              ? selectedFolderMeta.label
              : 'Supporting Documents'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedSection
              ? `Documents uploaded in ${selectedFolderMeta?.label || selectedSection}`
              : 'Browse documents by section folder'
            }
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Stats Cards (only show in folder view) */}
      {!selectedSection && (
        <div className="grid grid-cols-4 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Paperclip className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-primary">{stats.totalFiles}</p>
                <p className="text-[10px] text-muted-foreground">Total Files</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <FolderOpen className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-indigo-600">{stats.totalSections}</p>
                <p className="text-[10px] text-muted-foreground">Sections</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-amber-600">{stats.totalCategories}</p>
                <p className="text-[10px] text-muted-foreground">Categories</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <FileArchive className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-600">
                  {stats.totalSize > 1024 * 1024
                    ? `${(stats.totalSize / (1024 * 1024)).toFixed(1)} MB`
                    : stats.totalSize > 1024
                    ? `${(stats.totalSize / 1024).toFixed(1)} KB`
                    : `${stats.totalSize} B`}
                </p>
                <p className="text-[10px] text-muted-foreground">Total Size</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Message */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-emerald-700">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={selectedSection
            ? `Search files in ${selectedFolderMeta?.label || 'this section'}...`
            : 'Search sections...'
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-xs"
        />
      </div>

      {/* Empty state when no docs at all */}
      {allDocuments.length === 0 && !selectedSection && (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Paperclip className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h4 className="text-base font-semibold text-muted-foreground mb-1">No documents uploaded yet</h4>
            <p className="text-xs text-muted-foreground max-w-md">
              Upload documents to any section (NSS, NCC, Clubs, Events, etc.) using the document upload dialog.
              They will appear here in the consolidated view.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Content: Folder Grid or Section Documents */}
      {allDocuments.length > 0 && !selectedSection && renderFolderGrid()}
      {selectedSection && renderSectionDocuments()}

      {/* Evidence Upload Dialog */}
      <EvidenceUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        title="Student Development Supporting Documents"
        subtitle="Upload student development & outcomes evidence documents across all categories"
        categories={uploadCategories}
      />

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className="px-5 pt-4 pb-2 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              {previewFile && (
                <>
                  {previewFile.type.startsWith('image/') ? (
                    <ImageIcon className="h-5 w-5 text-pink-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-blue-500" />
                  )}
                  {previewFile.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {previewFile && `${formatFileSize(previewFile.size)} • ${previewFile.type}`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 px-5 pb-5">
            {previewFile?.type.startsWith('image/') && previewFile.dataUrl ? (
              <ImageZoomViewer
                src={previewFile.dataUrl}
                alt={previewFile.name}
                className="min-h-[350px] max-h-[65vh]"
                showControls
                showFitButton
              />
            ) : previewFile?.type.includes('pdf') && previewFile.dataUrl ? (
              <div className="flex items-center justify-center bg-muted/30 rounded-xl overflow-hidden min-h-[350px] max-h-[65vh]">
                <embed
                  src={previewFile.dataUrl}
                  type="application/pdf"
                  className="w-full h-[65vh] rounded-sm"
                  title={previewFile.name}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center bg-muted/30 rounded-xl overflow-hidden min-h-[350px] max-h-[65vh]">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <FileText className="h-16 w-16" />
                  <p className="text-sm">Preview not available for this file type</p>
                  {previewFile?.dataUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(previewFile.dataUrl, '_blank')}
                    >
                      Open in new tab
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
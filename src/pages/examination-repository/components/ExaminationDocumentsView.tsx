import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Search, FileText, Download, Eye, FolderOpen,
  ArrowLeft, Clock, Calendar, FileEdit, BadgeCheck, Repeat,
  Trash2, FileImage, File,
} from 'lucide-react';
import { EvidencePreviewDialog, EvidencePreviewData } from '@/components/shared/EvidencePreviewDialog';
import { useEvidenceStore, ExaminationEvidenceFile } from '../evidence-store';
import { cn } from '@/lib/utils';

// Module folder definitions
const MODULE_FOLDERS = [
  {
    moduleId: 'examination-schedules',
    label: 'Examination Schedules',
    description: 'Uploaded schedule documents and evidence',
    icon: <Calendar className="h-5 w-5 text-blue-600" />,
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    borderClass: 'border-blue-200/60 dark:border-blue-800/40',
  },
  {
    moduleId: 'examination-circulars',
    label: 'Examination Circulars',
    description: 'Uploaded circular PDFs and notifications',
    icon: <FileEdit className="h-5 w-5 text-amber-600" />,
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderClass: 'border-amber-200/60 dark:border-amber-800/40',
  },
  {
    moduleId: 'result-publications',
    label: 'Result Publications',
    description: 'Uploaded result gazettes and summaries',
    icon: <BadgeCheck className="h-5 w-5 text-emerald-600" />,
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderClass: 'border-emerald-200/60 dark:border-emerald-800/40',
  },
  {
    moduleId: 'supplementary-examinations',
    label: 'Supplementary Examinations',
    description: 'Uploaded supplementary exam notifications and schedules',
    icon: <Repeat className="h-5 w-5 text-purple-600" />,
    bgClass: 'bg-purple-50 dark:bg-purple-950/30',
    borderClass: 'border-purple-200/60 dark:border-purple-800/40',
  },
];

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <FileImage className="h-4 w-4 text-pink-500" />;
  if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  if (type.includes('word') || type.includes('docx')) return <FileText className="h-4 w-4 text-blue-500" />;
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv'))
    return <FileText className="h-4 w-4 text-emerald-500" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExt(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// ============================================================
// EVIDENCE FILE CARD — always shows preview, download, delete
// ============================================================

interface EvidenceFileCardProps {
  file: ExaminationEvidenceFile;
  onRemove: (id: string) => void;
  onPreview: (file: ExaminationEvidenceFile) => void;
}

function EvidenceFileCard({ file, onRemove, onPreview }: EvidenceFileCardProps) {
  const isImage = file.type.startsWith('image/');

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6, scale: 0.95 }}
      layout
      className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 hover:shadow-sm hover:border-primary/30 transition-all"
    >
      {/* Thumbnail / Icon */}
      <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
        {isImage && file.dataUrl ? (
          <img src={file.dataUrl} alt={file.name} className="h-full w-full object-cover" />
        ) : (
          getFileIcon(file.type)
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
          <span>{formatFileSize(file.size)}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {file.recordTitle}
          </span>
        </div>
      </div>

      {/* Actions — always visible */}
      <div className="flex items-center gap-1 shrink-0">
        {file.dataUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPreview(file)}
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            const link = document.createElement('a');
            if (file.dataUrl) {
              link.href = file.dataUrl;
              link.download = file.name;
              link.click();
            }
          }}
          title="Download"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onRemove(file.id)}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================

export function ExaminationDocumentsView({ academicYear }: { academicYear: string }) {
  const { evidenceFiles, removeEvidence } = useEvidenceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState('all');
  const [previewData, setPreviewData] = useState<EvidencePreviewData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePreview = (file: ExaminationEvidenceFile) => {
    const ext = getFileExt(file.name);
    setPreviewData({
      id: file.id,
      fileName: file.name,
      fileType: ext,
      fileSize: formatFileSize(file.size),
      dataUrl: file.dataUrl || '',
      uploadedAt: new Date(file.recordedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      category: file.moduleLabel,
    });
    setPreviewOpen(true);
  };

  // Build folder stats from evidence files
  const folderStats = useMemo(() => {
    return MODULE_FOLDERS.map((folder) => {
      const files = evidenceFiles.filter((f) => f.moduleId === folder.moduleId);
      return {
        ...folder,
        fileCount: files.length,
        recordCount: new Set(files.map((f) => f.recordTitle)).size,
        files,
      };
    }).filter((f) => f.fileCount > 0 || !searchQuery);
  }, [evidenceFiles, searchQuery]);

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return folderStats;
    const q = searchQuery.toLowerCase();
    return folderStats.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.files.some((file) => file.name.toLowerCase().includes(q) || file.recordTitle.toLowerCase().includes(q))
    );
  }, [folderStats, searchQuery]);

  // Files for the selected folder
  const selectedFolderFiles = useMemo(() => {
    if (!selectedModuleId) return [];
    let files = evidenceFiles.filter((f) => f.moduleId === selectedModuleId);
    if (yearFilter !== 'all') {
      files = files.filter((f) => f.recordedAt.startsWith(yearFilter));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      files = files.filter(
        (f) => f.name.toLowerCase().includes(q) || f.recordTitle.toLowerCase().includes(q)
      );
    }
    return files;
  }, [selectedModuleId, evidenceFiles, yearFilter, searchQuery]);

  const selectedFolder = MODULE_FOLDERS.find((f) => f.moduleId === selectedModuleId);

  const years = useMemo(() => {
    const yrSet = new Set<string>();
    evidenceFiles.forEach((f) => yrSet.add(f.recordedAt.slice(0, 4)));
    return Array.from(yrSet).sort().reverse();
  }, [evidenceFiles]);

  const totalEvidenceFiles = evidenceFiles.length;

  // Single return with conditional content + always-rendered preview dialog
  return (
    <>
      {!selectedFolder ? (
        /* === FOLDER GRID VIEW === */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Supporting Documents</h2>
              <p className="text-muted-foreground">
                {totalEvidenceFiles > 0
                  ? `${totalEvidenceFiles} evidence file${totalEvidenceFiles !== 1 ? 's' : ''} uploaded`
                  : 'Upload evidence from Examination Schedules, Circulars, Results, or Supplementary modules'}
              </p>
            </div>
          </div>

          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search folders or files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFolders.map((folder) => (
              <Card
                key={folder.moduleId}
                className={cn(
                  'hover:shadow-md transition-all duration-200 cursor-pointer group hover:-translate-y-0.5',
                  folder.borderClass
                )}
                onClick={() => {
                  setSelectedModuleId(folder.moduleId);
                  setSearchQuery('');
                }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'h-12 w-12 shrink-0 rounded-xl flex items-center justify-center',
                      folder.bgClass
                    )}>
                      {folder.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold truncate">{folder.label}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{folder.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge variant="secondary" className="text-[10px]">
                          {folder.fileCount} file{folder.fileCount !== 1 ? 's' : ''}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {folder.recordCount} record{folder.recordCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1">
                      View &rarr;
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFolders.length === 0 && (
            <div className="text-center py-16">
              <FolderOpen className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No evidence uploaded yet</h3>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-md mx-auto">
                Upload supporting documents from any examination module — schedules, circulars, results, or supplementary exams — and they will appear here.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* === FOLDER DETAIL VIEW === */
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => {
                setSelectedModuleId(null);
                setSearchQuery('');
                setYearFilter('all');
              }}
            >
              <ArrowLeft className="h-4 w-4" /> Back to Folders
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', selectedFolder.bgClass)}>
                {selectedFolder.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold">{selectedFolder.label}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedFolderFiles.length} evidence file{selectedFolderFiles.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files or record titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {years.length > 0 && (
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-36 h-9 text-xs">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Badge variant="secondary" className="text-[10px]">
              {selectedFolderFiles.length} file{selectedFolderFiles.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {selectedFolderFiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No evidence files found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Upload evidence from the {selectedFolder.label} module to see it here
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {selectedFolderFiles.map((file) => (
                  <EvidenceFileCard
                    key={file.id}
                    file={file}
                    onRemove={removeEvidence}
                    onPreview={handlePreview}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Evidence Preview Dialog — ALWAYS rendered at the top level */}
      <EvidencePreviewDialog
        evidence={previewData}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  );
}

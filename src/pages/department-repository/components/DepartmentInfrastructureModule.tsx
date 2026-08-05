import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { RepositoryModuleConfig } from '../types';
import { repositoryHealth, departmentInfo } from '../repository-configs';
import { getModuleTabActiveClasses } from './module-tab-styles';
import { EvidencePreviewDialog } from '@/components/shared/EvidencePreviewDialog';
import type { EvidencePreviewData } from '@/components/shared/EvidencePreviewDialog';
import {
  LayoutDashboard,
  School,
  Presentation,
  FlaskConical,
  Users,
  UserCircle,
  User,
  Monitor,
  Wifi,
  Wrench,
  Package,
  Archive,
  FileText,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Eye,
  DownloadCloud,
  Upload,
  Plus,
  Search,
  Trash2,
  Edit2,
  Download,
  Activity,
  BarChart3,
  TrendingUp,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface DepartmentInfrastructureModuleProps {
  config: RepositoryModuleConfig;
  academicYear?: string;
}

// ===== INTERFACES =====
interface InfrastructureStats {
  total: number;
  active: number;
  maintenance: number;
}

interface UploadPreviewRow {
  id: string;
  data: Record<string, string>;
  validationStatus: 'valid' | 'invalid' | 'pending';
  errors: string[];
}

interface UploadStats {
  total: number;
  valid: number;
  invalid: number;
}

interface EvidenceFile {
  id: string;
  sectionId: string;
  recordId: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'png' | 'jpg' | 'xlsx' | 'zip';
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  category: string;
  status: 'uploaded' | 'under-review' | 'approved';
  dataUrl: string; // Base64 data for preview
}

// Map section IDs to Supporting Document categories
const sectionCategoryMap: Record<string, string> = {
  classrooms: 'Classroom Photographs',
  'tutorial-rooms': 'Geo-tagged Photos',
  laboratories: 'Laboratory Layouts',
  'staff-rooms': 'Geo-tagged Photos',
  'faculty-cabins': 'Geo-tagged Photos',
  'hod-cabin': 'Geo-tagged Photos',
  'smart-classrooms': 'Installation Reports',
  'ict-classrooms': 'Installation Reports',
  'lab-equipment': 'Equipment Invoices',
  'software-licenses': 'Software Licenses',
  'dept-assets': 'Asset Verification',
};

// ===== MOCK DATA FACTORIES =====
const generateMockStats = (total: number, activePct: number): InfrastructureStats => ({
  total,
  active: Math.round(total * activePct),
  maintenance: total - Math.round(total * activePct),
});

const sectionStats: Record<string, InfrastructureStats> = {
  classrooms: generateMockStats(18, 0.85),
  'tutorial-rooms': generateMockStats(6, 0.9),
  laboratories: generateMockStats(12, 0.88),
  'staff-rooms': generateMockStats(4, 0.95),
  'faculty-cabins': generateMockStats(24, 0.92),
  'hod-cabin': generateMockStats(1, 1),
  'smart-classrooms': generateMockStats(8, 0.88),
  'ict-classrooms': generateMockStats(10, 0.9),
  'lab-equipment': generateMockStats(186, 0.82),
  'software-licenses': generateMockStats(32, 0.84),
  'dept-assets': generateMockStats(45, 0.87),
};

// ===== SECTION ICONS =====
const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  classrooms: School,
  'tutorial-rooms': Presentation,
  laboratories: FlaskConical,
  'staff-rooms': Users,
  'faculty-cabins': UserCircle,
  'hod-cabin': User,
  'smart-classrooms': Monitor,
  'ict-classrooms': Wifi,
  'lab-equipment': Wrench,
  'software-licenses': Package,
  'dept-assets': Archive,
  'supporting-documents': FileText,
};

const sectionColors: Record<string, string> = {
  classrooms: 'text-blue-600',
  'tutorial-rooms': 'text-cyan-600',
  laboratories: 'text-purple-600',
  'staff-rooms': 'text-emerald-600',
  'faculty-cabins': 'text-indigo-600',
  'hod-cabin': 'text-rose-600',
  'smart-classrooms': 'text-sky-600',
  'ict-classrooms': 'text-teal-600',
  'lab-equipment': 'text-orange-600',
  'software-licenses': 'text-violet-600',
  'dept-assets': 'text-amber-600',
};

// ===== CSV UTILITY =====
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ===== EVIDENCE COMPONENT (with file upload) =====
interface EvidenceSectionProps {
  sectionId: string;
  recordId: string;
  evidenceList: EvidenceFile[];
  onUploadEvidence: (sectionId: string, recordId: string, files: File[]) => void;
  onDeleteEvidence: (sectionId: string, recordId: string, evidenceId: string) => void;
}

const EvidenceSection = ({ sectionId, recordId, evidenceList, onUploadEvidence, onDeleteEvidence }: EvidenceSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewEvidence, setPreviewEvidence] = useState<EvidenceFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredEvidence = evidenceList.filter((d) =>
    searchQuery
      ? d.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const processFiles = (files: File[]) => {
    if (files.length > 0) {
      setUploading(true);
      // Small delay to show upload state
      setTimeout(() => {
        onUploadEvidence(sectionId, recordId, files);
        setUploading(false);
      }, 300);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Capture file references synchronously before any async boundary
      const fileArray = Array.from(files);
      processFiles(fileArray);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    // Capture file references synchronously within the event handler
    const fileArray = Array.from(e.dataTransfer.files);
    if (fileArray.length > 0) {
      processFiles(fileArray);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFileTypeColor = (ext: string) => {
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    if (ext === 'pdf') return 'bg-red-500/10 text-red-600 border-red-500/20';
    if (['doc', 'docx'].includes(ext)) return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
    if (['xls', 'xlsx'].includes(ext)) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    if (ext === 'zip') return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  const acceptedFormats = [
    { ext: 'PNG', color: 'bg-blue-500/10 text-blue-600' },
    { ext: 'JPG', color: 'bg-cyan-500/10 text-cyan-600' },
    { ext: 'DOCX', color: 'bg-indigo-500/10 text-indigo-600' },
    { ext: 'PDF', color: 'bg-red-500/10 text-red-600' },
    { ext: 'XLSX', color: 'bg-emerald-500/10 text-emerald-600' },
    { ext: 'ZIP', color: 'bg-amber-500/10 text-amber-600' },
  ];

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold">Evidence Repository</h3>
          <Badge variant="secondary" className="text-[10px]">{evidenceList.length} files</Badge>
        </div>
      </div>
      <Separator />

      {/* Drag & Drop Zone — Primary Upload Method */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.docx,.pdf,.xlsx,.zip"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={cn(
          'relative overflow-hidden p-8 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center group',
          isDragOver
            ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10 scale-[1.01]'
            : 'border-border/40 hover:border-indigo-400/40 hover:bg-indigo-500/[0.02] hover:shadow-md',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        {/* Animated background glow on drag */}
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none"
          />
        )}

        {/* Drag Over State — Full Overlay */}
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-indigo-500/5 backdrop-blur-[2px] z-10"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                <Upload className="h-8 w-8 text-indigo-600 relative animate-bounce" />
              </div>
              <p className="text-sm font-bold text-indigo-600">Drop files here</p>
              <p className="text-[10px] text-indigo-500/70">Release to upload</p>
            </div>
          </motion.div>
        )}

        {/* Default State */}
        <div className={cn('transition-all', isDragOver && 'opacity-20')}>
          {/* Upload icon with decorative circle */}
          <div className="relative mx-auto mb-4 w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors" />
            <div className="absolute inset-2 rounded-full bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />
            <Upload className="absolute inset-0 m-auto h-7 w-7 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
          </div>

          <p className="text-sm font-semibold text-foreground/80">
            <span className="text-indigo-600 hover:text-indigo-700 cursor-pointer underline decoration-indigo-300/50 underline-offset-2">
              Click to upload
            </span>
            {' '}or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 mb-4">
            Supported files up to 25MB each
          </p>

          {/* Format badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {acceptedFormats.map((fmt) => (
              <span
                key={fmt.ext}
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-[9px] font-semibold border',
                  fmt.color,
                  'border-current/20',
                )}
              >
                {fmt.ext}
              </span>
            ))}
          </div>
        </div>

        {/* Uploading overlay */}
        {uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-2xl"
          >
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-indigo-600">Uploading files...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Evidence File Cards */}
      <div className="space-y-3">
        {/* Search — only show when there are files */}
        {evidenceList.length > 1 && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search evidence documents..."
              className="h-8 text-xs pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {filteredEvidence.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-8 text-center rounded-xl border border-dashed border-border/20 bg-muted/20"
          >
            <FileText className="h-10 w-10 text-muted-foreground/15 mb-3" />
            <p className="text-xs text-muted-foreground font-medium">No evidence uploaded yet</p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
              Drop your files in the zone above to get started
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredEvidence.map((ev, idx) => {
              const ext = ev.fileType;
              const isImage = ext === 'png' || ext === 'jpg';
              const typeColor = getFileTypeColor(ext);

              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group relative flex items-start gap-3 p-3.5 rounded-xl border border-border/40 bg-card hover:border-indigo-500/30 hover:bg-indigo-500/[0.02] hover:shadow-sm transition-all"
                >
                  {/* File type thumbnail */}
                  <div className={cn(
                    'shrink-0 w-14 h-14 rounded-xl border flex items-center justify-center overflow-hidden',
                    typeColor
                  )}>
                    {isImage && ev.dataUrl ? (
                      <img src={ev.dataUrl} alt={ev.fileName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileText className="h-5 w-5" />
                        <span className="text-[7px] font-bold uppercase mt-0.5 leading-none">{ext}</span>
                      </div>
                    )}
                  </div>

                  {/* File metadata */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate max-w-[180px]" title={ev.fileName}>
                      {ev.fileName}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded font-semibold border',
                        typeColor
                      )}>
                        .{ext}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{ev.fileSize}</span>
                      <span className="text-[9px] text-muted-foreground">•</span>
                      <span className="text-[9px] text-muted-foreground">{formatDate(ev.uploadedAt)}</span>
                      <Badge variant="secondary" className={cn('text-[8px] py-0',
                        ev.status === 'approved' && 'bg-emerald-500/10 text-emerald-600',
                        ev.status === 'under-review' && 'bg-amber-500/10 text-amber-600',
                        ev.status === 'uploaded' && 'bg-blue-500/10 text-blue-600',
                      )}>
                        {ev.status}
                      </Badge>
                    </div>
                    <p className="text-[9px] text-muted-foreground/70 mt-0.5">Uploaded by {ev.uploadedBy}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0">
                    {isImage && ev.dataUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg hover:bg-blue-500/10"
                        onClick={() => setPreviewEvidence(ev)}
                        title="Preview"
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg hover:bg-emerald-500/10"
                      title="Download"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = ev.dataUrl;
                        link.download = ev.fileName;
                        link.click();
                      }}
                    >
                      <DownloadCloud className="h-3.5 w-3.5 text-emerald-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg hover:bg-red-500/10"
                      onClick={() => onDeleteEvidence(sectionId, recordId, ev.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Evidence Preview Dialog — Reusable, supports images + PDFs */}
      <EvidencePreviewDialog
        evidence={previewEvidence ? ({
          id: previewEvidence.id,
          fileName: previewEvidence.fileName,
          fileType: previewEvidence.fileType,
          fileSize: previewEvidence.fileSize,
          dataUrl: previewEvidence.dataUrl,
          uploadedAt: previewEvidence.uploadedAt,
          uploadedBy: previewEvidence.uploadedBy,
          status: previewEvidence.status,
          category: previewEvidence.category,
        } as EvidencePreviewData) : null}
        open={!!previewEvidence}
        onOpenChange={(o) => { if (!o) setPreviewEvidence(null); }}
      />
    </div>
  );
};

// ===== GENERIC INFRASTRUCTURE SECTION =====
interface DataSectionProps {
  sectionId: string;
  title: string;
  fields: { key: string; label: string; type: string }[];
  addLabel: string;
  stats?: InfrastructureStats;
  evidenceMap: Record<string, EvidenceFile[]>;
  onUploadEvidence: (sectionId: string, recordId: string, files: File[]) => void;
  onDeleteEvidence: (sectionId: string, recordId: string, evidenceId: string) => void;
}

const DataSection = ({ sectionId, title, fields, addLabel, stats, evidenceMap, onUploadEvidence, onDeleteEvidence }: DataSectionProps) => {
  const [records, setRecords] = useState<any[]>(() =>
    Array.from({ length: Math.max(1, Math.floor((stats?.total || 5) / 3)) }, (_, i) => ({
      id: `${sectionId}-${i + 1}`,
      ...Object.fromEntries(fields.map((f) => [f.key, `Sample ${f.label} ${i + 1}`])),
      academicYear: '2025-26',
      status: i % 5 === 0 ? 'Under Maintenance' : 'Available',
    }))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // CSV Upload State
  const [uploadPreview, setUploadPreview] = useState<UploadPreviewRow[]>([]);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const filteredRecords = records.filter((r) =>
    searchQuery
      ? Object.values(r).some((v) => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  const Icon = sectionIcons[sectionId] || FileText;

  // ===== TEMPLATE DOWNLOAD =====
  const handleDownloadTemplate = useCallback(() => {
    const headers = fields.map(f => f.label).join(',');
    const sampleRow = fields.map(f => {
      if (f.type === 'number') return '0';
      if (f.type === 'date') return 'YYYY-MM-DD';
      if (f.type === 'select') return 'Option 1';
      return `Sample ${f.label}`;
    }).join(',');
    const csvContent = `${headers}\n${sampleRow}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sectionId}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [fields, sectionId]);

  // ===== CSV UPLOAD =====
  const handleCSVUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) return;

      const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
      const csvFields = fields.map(f => f.label);

      // Build a header-to-field mapping
      const headerMap: number[] = [];
      headers.forEach((h, idx) => {
        const fieldIndex = csvFields.findIndex(f => f.toLowerCase() === h.toLowerCase());
        headerMap.push(fieldIndex >= 0 ? fieldIndex : -1);
      });

      const previewRows: UploadPreviewRow[] = [];
      let validCount = 0;
      let invalidCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, '').trim());
        const row: Record<string, string> = {};
        const rowErrors: string[] = [];

        // Map values to fields
        headerMap.forEach((fieldIdx, colIdx) => {
          if (fieldIdx >= 0) {
            row[fields[fieldIdx].key] = values[colIdx] || '';
          }
        });

        // Validate each field
        fields.forEach((field) => {
          const val = row[field.key]?.trim() || '';
          if (!val) {
            rowErrors.push(`"${field.label}" is required`);
          }
          if (field.type === 'number' && val && isNaN(Number(val))) {
            rowErrors.push(`"${field.label}" must be a number`);
          }
          if (field.type === 'date' && val && !/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            rowErrors.push(`"${field.label}" must be YYYY-MM-DD format`);
          }
        });

        const isValid = rowErrors.length === 0;
        if (isValid) validCount++;
        else invalidCount++;

        previewRows.push({
          id: `upload-${i}`,
          data: row,
          validationStatus: isValid ? 'valid' : 'invalid',
          errors: rowErrors,
        });
      }

      setUploadPreview(previewRows);
      setUploadStats({ total: previewRows.length, valid: validCount, invalid: invalidCount });
      setShowPreviewDialog(true);

      // Reset the file input so the same file can be re-uploaded
      if (csvInputRef.current) csvInputRef.current.value = '';
    };
    reader.readAsText(file);
  }, [fields]);

  // ===== SAVE VALID RECORDS FROM CSV PREVIEW =====
  const handleSaveCSVUpload = useCallback(() => {
    const validRecords = uploadPreview
      .filter(r => r.validationStatus === 'valid')
      .map((r, idx) => ({
        id: `csv-${sectionId}-${Date.now()}-${idx}`,
        ...r.data,
        academicYear: '2025-26',
        status: 'Available',
      }));

    if (validRecords.length > 0) {
      setRecords(prev => [...prev, ...validRecords]);
    }
    setShowPreviewDialog(false);
    setUploadPreview([]);
    setUploadStats(null);
  }, [uploadPreview, sectionId]);

  // ===== CANCEL CSV UPLOAD =====
  const handleCancelUpload = useCallback(() => {
    setShowPreviewDialog(false);
    setUploadPreview([]);
    setUploadStats(null);
  }, []);

  // ===== MANUAL ADD RECORD =====
  const handleManualSave = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const newRecord: any = { id: `manual-${Date.now()}`, academicYear: '2025-26', status: 'Available' };
    fields.forEach(f => {
      newRecord[f.key] = (formData.get(f.key) as string) || '';
    });
    setRecords(prev => [...prev, newRecord]);
    setShowAddDialog(false);
  }, [fields]);

  return (
    <div className="space-y-4">
      {/* ===== SECTION HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', sectionColors[sectionId] || 'text-foreground')} />
          <h3 className="text-sm font-semibold">{title}</h3>
          <Badge variant="secondary" className="text-[10px]">{records.length} records</Badge>
          {stats && (
            <Badge variant="outline" className={cn('text-[9px]', stats.active === stats.total ? 'text-emerald-600 border-emerald-500/30' : 'text-amber-600 border-amber-500/30')}>
              {stats.active}/{stats.total} Active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Template Download */}
          <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5" onClick={handleDownloadTemplate}>
            <Download className="h-3.5 w-3.5" /> Template
          </Button>

          {/* CSV Upload - hidden input + trigger button */}
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSVUpload}
          />
          <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5" onClick={() => csvInputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" /> CSV
          </Button>

          {/* Manual Add */}
          <Button size="sm" className="text-xs h-8 gap-1.5" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-3.5 w-3.5" /> {addLabel}
          </Button>
        </div>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder={`Search ${title.toLowerCase()}...`}
          className="h-8 text-xs pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ===== DATA TABLE ===== */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-[10px] font-semibold">#</TableHead>
              {fields.slice(0, 5).map((f) => (
                <TableHead key={f.key} className="text-[10px] font-semibold">{f.label}</TableHead>
              ))}
              <TableHead className="text-[10px] font-semibold w-[90px]">Status</TableHead>
              <TableHead className="text-[10px] font-semibold text-right w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={fields.slice(0, 5).length + 3} className="text-center py-8 text-xs text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Icon className="h-8 w-8 text-muted-foreground/30" />
                    <p>No {title.toLowerCase()} found. Upload a CSV or add manually.</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5" onClick={() => csvInputRef.current?.click()}>
                        <Upload className="h-3 w-3" /> Upload CSV
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5" onClick={() => setShowAddDialog(true)}>
                        <Plus className="h-3 w-3" /> Add Manually
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record, idx) => (
                <TableRow key={record.id} className="hover:bg-muted/50">
                  <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                  {fields.slice(0, 5).map((f) => (
                    <TableCell key={f.key} className="text-xs font-medium truncate max-w-[150px]">
                      {record[f.key]}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Badge variant="outline" className={cn('text-[9px]',
                      record.status === 'Available' && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
                      record.status === 'Under Maintenance' && 'bg-amber-500/10 text-amber-600 border-amber-500/30',
                      record.status === 'Active' && 'bg-blue-500/10 text-blue-600 border-blue-500/30',
                    )}>{record.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedRecord(record)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ===== CSV UPLOAD PREVIEW DIALOG ===== */}
      <Dialog open={showPreviewDialog} onOpenChange={(open) => { if (!open) handleCancelUpload(); }}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              CSV Preview — {title}
            </DialogTitle>
          </DialogHeader>

          {/* Upload Stats */}
          {uploadStats && (
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-lg font-bold">{uploadStats.total}</p>
                <p className="text-[9px] text-muted-foreground">Total Rows</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/5 text-center">
                <p className="text-lg font-bold text-emerald-600">{uploadStats.valid}</p>
                <p className="text-[9px] text-muted-foreground">Valid</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/5 text-center">
                <p className="text-lg font-bold text-red-600">{uploadStats.invalid}</p>
                <p className="text-[9px] text-muted-foreground">Invalid</p>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {uploadStats && uploadStats.invalid > 0 && (
            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 max-h-[120px] overflow-y-auto">
              <p className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Validation Errors:
              </p>
              {uploadPreview.filter(r => r.validationStatus === 'invalid').map((r, i) => (
                <div key={i} className="flex items-start gap-2 mb-1">
                  <X className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-red-600">
                    Row {uploadPreview.indexOf(r) + 1}: {r.errors?.join('; ')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Preview Table */}
          <div className="flex-1 overflow-auto min-h-[200px] rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 sticky top-0">
                  <TableHead className="text-[10px] font-semibold w-8">#</TableHead>
                  {fields.map(f => (
                    <TableHead key={f.key} className="text-[10px] font-semibold">{f.label}</TableHead>
                  ))}
                  <TableHead className="text-[10px] font-semibold w-16 text-center">Valid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadPreview.map((row, idx) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'hover:bg-muted/50',
                      row.validationStatus === 'invalid' && 'bg-red-500/5'
                    )}
                  >
                    <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                    {fields.map(f => (
                      <TableCell key={f.key} className="text-xs truncate max-w-[120px]">
                        {row.data[f.key] || <span className="text-red-400 italic">(empty)</span>}
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      {row.validationStatus === 'valid' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500 mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <p className="text-[10px] text-muted-foreground">
              CSV uploads never save automatically. Review and confirm to save.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleCancelUpload}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs h-8 gap-1.5"
                onClick={handleSaveCSVUpload}
                disabled={!uploadStats || uploadStats.valid === 0}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Save {uploadStats?.valid || 0} Valid Records
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== RECORD DETAIL DIALOG ===== */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => { if (!open) setSelectedRecord(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Icon className={cn('h-4 w-4', sectionColors[sectionId] || 'text-indigo-600')} />
              {selectedRecord && fields[0] ? selectedRecord[fields[0].key] : title} — Details
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {fields.map((f) => (
                  <div key={f.key} className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">{f.label}</Label>
                    <p className="text-xs font-medium">{selectedRecord[f.key] || '-'}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <EvidenceSection
                sectionId={sectionId}
                recordId={selectedRecord.id}
                evidenceList={evidenceMap[selectedRecord.id] || []}
                onUploadEvidence={onUploadEvidence}
                onDeleteEvidence={onDeleteEvidence}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== MANUAL ADD DIALOG ===== */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleManualSave}>
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-600" />
                Add New {title}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
              {fields.map((f) => (
                <div key={f.key} className={cn('space-y-1', f.type === 'textarea' && 'col-span-2')}>
                  <Label className="text-xs">{f.label}</Label>
                  {f.type === 'select' ? (
                    <Select name={f.key}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder={`Select ${f.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes" className="text-xs">Yes</SelectItem>
                        <SelectItem value="no" className="text-xs">No</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : f.type === 'number' ? (
                    <Input name={f.key} type="number" className="h-8 text-xs" placeholder={`Enter ${f.label}`} />
                  ) : f.type === 'date' ? (
                    <Input name={f.key} type="date" className="h-8 text-xs" />
                  ) : (
                    <Input name={f.key} className="h-8 text-xs" placeholder={`Enter ${f.label}`} required />
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" className="text-xs h-8" type="button" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button size="sm" className="text-xs h-8" type="submit">
                <Plus className="h-3.5 w-3.5 mr-1" /> Save Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ===== SECTION FIELD DEFINITIONS (Full Spec) =====
const sectionFields: Record<string, { key: string; label: string; type: string }[]> = {
  classrooms: [
    { key: 'roomNumber', label: 'Room Number', type: 'text' },
    { key: 'roomName', label: 'Room Name', type: 'text' },
    { key: 'block', label: 'Block', type: 'text' },
    { key: 'floor', label: 'Floor', type: 'text' },
    { key: 'capacity', label: 'Capacity', type: 'number' },
    { key: 'area', label: 'Area (Sq.ft)', type: 'number' },
    { key: 'academicYear', label: 'Academic Year', type: 'text' },
    { key: 'status', label: 'Current Status', type: 'text' },
    { key: 'remarks', label: 'Remarks', type: 'text' },
  ],
  'tutorial-rooms': [
    { key: 'roomNumber', label: 'Room Number', type: 'text' },
    { key: 'block', label: 'Block', type: 'text' },
    { key: 'floor', label: 'Floor', type: 'text' },
    { key: 'capacity', label: 'Capacity', type: 'number' },
    { key: 'area', label: 'Area (Sq.ft)', type: 'number' },
    { key: 'academicYear', label: 'Academic Year', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
  ],
  laboratories: [
    { key: 'labName', label: 'Laboratory Name', type: 'text' },
    { key: 'labCode', label: 'Laboratory Code', type: 'text' },
    { key: 'block', label: 'Block', type: 'text' },
    { key: 'floor', label: 'Floor', type: 'text' },
    { key: 'area', label: 'Area (Sq.ft)', type: 'number' },
    { key: 'capacity', label: 'Capacity', type: 'number' },
    { key: 'labType', label: 'Laboratory Type', type: 'select' },
    { key: 'academicYear', label: 'Academic Year', type: 'text' },
    { key: 'incharge', label: 'Lab In-charge', type: 'text' },
    { key: 'technician', label: 'Technician', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
  ],
  'staff-rooms': [
    { key: 'roomNumber', label: 'Room Number', type: 'text' },
    { key: 'capacity', label: 'Capacity', type: 'number' },
    { key: 'area', label: 'Area (Sq.ft)', type: 'number' },
    { key: 'block', label: 'Block', type: 'text' },
    { key: 'floor', label: 'Floor', type: 'text' },
    { key: 'academicYear', label: 'Academic Year', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
  ],
  'faculty-cabins': [
    { key: 'facultyName', label: 'Faculty Name', type: 'text' },
    { key: 'employeeId', label: 'Employee ID', type: 'text' },
    { key: 'cabinNumber', label: 'Cabin Number', type: 'text' },
    { key: 'block', label: 'Block', type: 'text' },
    { key: 'floor', label: 'Floor', type: 'text' },
    { key: 'academicYear', label: 'Academic Year', type: 'text' },
  ],
  'hod-cabin': [
    { key: 'cabinNumber', label: 'Cabin Number', type: 'text' },
    { key: 'area', label: 'Area (Sq.ft)', type: 'number' },
    { key: 'block', label: 'Block', type: 'text' },
    { key: 'floor', label: 'Floor', type: 'text' },
    { key: 'academicYear', label: 'Academic Year', type: 'text' },
  ],
  'smart-classrooms': [
    { key: 'classroom', label: 'Classroom', type: 'text' },
    { key: 'smartBoard', label: 'Smart Board/Interactive Display', type: 'select' },
    { key: 'projector', label: 'Projector Available', type: 'select' },
    { key: 'audioSystem', label: 'Audio System', type: 'select' },
    { key: 'camera', label: 'Camera', type: 'select' },
    { key: 'internet', label: 'Internet Connectivity', type: 'select' },
    { key: 'recordingFacility', label: 'Recording Facility', type: 'select' },
    { key: 'status', label: 'Status', type: 'text' },
  ],
  'ict-classrooms': [
    { key: 'classroom', label: 'Classroom', type: 'text' },
    { key: 'desktop', label: 'Desktop Available', type: 'select' },
    { key: 'laptopDock', label: 'Laptop Dock', type: 'select' },
    { key: 'lcdProjector', label: 'LCD Projector', type: 'select' },
    { key: 'wifi', label: 'Wi-Fi', type: 'select' },
    { key: 'lan', label: 'LAN', type: 'select' },
    { key: 'smartPodium', label: 'Smart Podium', type: 'select' },
    { key: 'internetSpeed', label: 'Internet Speed (Mbps)', type: 'number' },
    { key: 'status', label: 'Status', type: 'text' },
  ],
  'lab-equipment': [
    { key: 'laboratory', label: 'Laboratory', type: 'text' },
    { key: 'equipmentName', label: 'Equipment Name', type: 'text' },
    { key: 'category', label: 'Equipment Category', type: 'select' },
    { key: 'manufacturer', label: 'Manufacturer', type: 'text' },
    { key: 'model', label: 'Model', type: 'text' },
    { key: 'serialNumber', label: 'Serial Number', type: 'text' },
    { key: 'assetNumber', label: 'Asset Number', type: 'text' },
    { key: 'quantity', label: 'Quantity', type: 'number' },
    { key: 'purchaseDate', label: 'Purchase Date', type: 'date' },
    { key: 'warrantyExpiry', label: 'Warranty Expiry', type: 'date' },
    { key: 'cost', label: 'Cost (INR)', type: 'number' },
    { key: 'fundingSource', label: 'Funding Source', type: 'text' },
    { key: 'supplier', label: 'Supplier', type: 'text' },
    { key: 'workingStatus', label: 'Working Status', type: 'select' },
    { key: 'calibrationRequired', label: 'Calibration Required', type: 'select' },
    { key: 'calibrationDate', label: 'Calibration Date', type: 'date' },
    { key: 'amcAvailable', label: 'AMC Available', type: 'select' },
    { key: 'academicYear', label: 'Academic Year', type: 'text' },
  ],
  'software-licenses': [
    { key: 'softwareName', label: 'Software Name', type: 'text' },
    { key: 'version', label: 'Version', type: 'text' },
    { key: 'vendor', label: 'Vendor', type: 'text' },
    { key: 'licenseType', label: 'License Type', type: 'select' },
    { key: 'licenseKey', label: 'License Key (Masked)', type: 'text' },
    { key: 'numLicenses', label: 'No. of Licenses', type: 'number' },
    { key: 'installedSystems', label: 'Installed Systems', type: 'text' },
    { key: 'purchaseDate', label: 'Purchase Date', type: 'date' },
    { key: 'expiryDate', label: 'Expiry Date', type: 'date' },
    { key: 'cost', label: 'Cost (INR)', type: 'number' },
    { key: 'laboratory', label: 'Laboratory', type: 'text' },
    { key: 'academicYear', label: 'Academic Year', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
  ],
  'dept-assets': [
    { key: 'assetName', label: 'Asset Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'select' },
    { key: 'assetNumber', label: 'Asset Number', type: 'text' },
    { key: 'manufacturer', label: 'Manufacturer', type: 'text' },
    { key: 'model', label: 'Model', type: 'text' },
    { key: 'quantity', label: 'Quantity', type: 'number' },
    { key: 'purchaseDate', label: 'Purchase Date', type: 'date' },
    { key: 'cost', label: 'Cost (INR)', type: 'number' },
    { key: 'fundingSource', label: 'Funding Source', type: 'text' },
    { key: 'location', label: 'Current Location', type: 'text' },
    { key: 'workingStatus', label: 'Working Status', type: 'select' },
    { key: 'academicYear', label: 'Academic Year', type: 'text' },
  ],
};

export const DepartmentInfrastructureModule = ({ config, academicYear }: DepartmentInfrastructureModuleProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  void academicYear;
  const activeClasses = getModuleTabActiveClasses(config.id);
  const metrics = repositoryHealth[config.id] || { dataCompleteness: 76, evidenceCompleteness: 68, verificationPercent: 72, readinessScore: 71 };

  // ===== SHARED EVIDENCE STATE =====
  // Structure: { [sectionId]: { [recordId]: EvidenceFile[] } }
  const [sectionEvidence, setSectionEvidence] = useState<Record<string, Record<string, EvidenceFile[]>>>({});

  const handleUploadEvidence = useCallback((secId: string, recordId: string, files: File[]) => {
    files.forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const sizeKB = Math.round(file.size / 1024);
        const newEvidence: EvidenceFile = {
          id: `ev-${secId}-${recordId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sectionId: secId,
          recordId,
          fileName: file.name,
          fileType: ext as EvidenceFile['fileType'],
          fileSize: sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: 'Dr. Anita Sharma',
          category: sectionCategoryMap[secId] || 'Other',
          status: 'uploaded',
          dataUrl,
        };
        setSectionEvidence((prev) => ({
          ...prev,
          [secId]: {
            ...(prev[secId] || {}),
            [recordId]: [...(prev[secId]?.[recordId] || []), newEvidence],
          },
        }));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleDeleteEvidence = useCallback((secId: string, recordId: string, evidenceId: string) => {
    setSectionEvidence((prev) => {
      const recordEvidence = prev[secId]?.[recordId]?.filter((ev) => ev.id !== evidenceId) || [];
      return {
        ...prev,
        [secId]: { ...(prev[secId] || {}), [recordId]: recordEvidence },
      };
    });
  }, []);

  // Gather all evidence for supporting docs
  const allEvidence = Object.values(sectionEvidence).flatMap((secMap) =>
    Object.values(secMap).flat()
  );

  const moduleScores = [
    { label: 'Data Completeness', value: metrics.dataCompleteness, color: 'text-amber-600 bg-amber-500/10' },
    { label: 'Evidence Score', value: metrics.evidenceCompleteness, color: 'text-orange-600 bg-orange-500/10' },
    { label: 'Verification Score', value: metrics.verificationPercent, color: 'text-emerald-600 bg-emerald-500/10' },
    { label: 'Readiness Score', value: metrics.readinessScore, color: 'text-blue-600 bg-blue-500/10' },
  ];

  // ===== DASHBOARD =====
  const renderDashboard = () => {
    const totalRecords = Object.values(sectionStats).reduce((sum, s) => sum + s.total, 0);
    const totalActive = Object.values(sectionStats).reduce((sum, s) => sum + s.active, 0);
    const completionPct = Math.round((Object.values(sectionStats).filter(s => s.active === s.total).length / Object.keys(sectionStats).length) * 100);

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Classrooms', value: sectionStats.classrooms.total, icon: School },
            { label: 'Tutorial Rooms', value: sectionStats['tutorial-rooms'].total, icon: Presentation },
            { label: 'Laboratories', value: sectionStats.laboratories.total, icon: FlaskConical },
            { label: 'Staff Rooms', value: sectionStats['staff-rooms'].total, icon: Users },
            { label: 'Faculty Cabins', value: sectionStats['faculty-cabins'].total, icon: UserCircle },
            { label: 'Smart Classrooms', value: sectionStats['smart-classrooms'].total, icon: Monitor },
            { label: 'ICT Classrooms', value: sectionStats['ict-classrooms'].total, icon: Wifi },
            { label: 'Lab Equipment', value: sectionStats['lab-equipment'].total, icon: Wrench },
            { label: 'Licensed Software', value: sectionStats['software-licenses'].total, icon: Package },
            { label: 'Department Assets', value: sectionStats['dept-assets'].total, icon: Archive },
            { label: 'Evidence Completion', value: `${completionPct}%`, icon: CheckCircle2 },
            { label: 'Active Facilities', value: `${Math.round((totalActive / totalRecords) * 100)}%`, icon: TrendingUp },
          ].slice(0, 6).map((kpi) => (
            <Card key={kpi.label} className="hover:shadow-md transition-shadow border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <kpi.icon className="h-5 w-5 text-amber-600" />
                  <Badge variant="secondary" className="text-[9px]">
                    <Activity className="h-3 w-3 mr-1" />
                    AY 2025-26
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-amber-600" />
                Infrastructure Summary
              </CardTitle>
              <CardDescription>Total Records: {totalRecords} | Active: {totalActive}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-2">
                <div className="space-y-3">
                  {Object.entries(sectionStats).map(([key, stats]) => {
                    const Icon = sectionIcons[key] || FileText;
                    const color = sectionColors[key] || 'text-muted-foreground';
                    const activePct = Math.round((stats.active / stats.total) * 100);
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                          <Icon className={cn('h-4 w-4', color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium capitalize truncate">
                              {key.replace('-', ' ')}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {stats.active}/{stats.total}
                            </span>
                          </div>
                          <Progress value={activePct} className="h-1.5" />
                        </div>
                        <span className={cn('text-xs font-semibold w-8 text-right', activePct >= 90 ? 'text-emerald-600' : activePct >= 75 ? 'text-blue-600' : 'text-amber-600')}>
                          {activePct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                Infrastructure Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Equipment Count', value: sectionStats['lab-equipment'].total, sub: `${Math.round(sectionStats['lab-equipment'].active / sectionStats['lab-equipment'].total * 100)}% Working` },
                  { label: 'Software Licenses', value: sectionStats['software-licenses'].total, sub: `${Math.round((sectionStats['software-licenses'].total * 0.2))} Expiring Soon` },
                  { label: 'Assets Under AMC', value: Math.round(sectionStats['dept-assets'].total * 0.35), sub: `${Math.round(sectionStats['dept-assets'].total * 0.15)} Without AMC` },
                  { label: 'Equipment Due for Calibration', value: Math.round(sectionStats['lab-equipment'].total * 0.18), sub: `${Math.round(sectionStats['lab-equipment'].total * 0.12)} Calibrated` },
                  { label: 'Infrastructure Evidence', value: `${completionPct}%`, sub: 'Completion Rate' },
                  { label: 'Missing Evidence', value: `${100 - completionPct}%`, sub: 'Requires Attention' },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-lg border border-border/50">
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quick Access</CardTitle>
            <CardDescription>Navigate to infrastructure sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {config.tabs.filter(t => t.id !== 'dashboard' && t.id !== 'supporting-documents').map((tab) => {
                const Icon = sectionIcons[tab.id] || FileText;
                const color = sectionColors[tab.id] || 'text-muted-foreground';
                const s = sectionStats[tab.id];
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-center"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Icon className={cn('h-4 w-4', color)} />
                    </div>
                    <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
                    {s && <span className="text-[9px] text-muted-foreground">{s.total} records</span>}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ===== SUPPORTING DOCUMENTS (dynamic from evidence uploads) =====
  const renderSupportingDocs = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Build categories dynamically from actual uploaded evidence
    const categoryMap = new Map<string, EvidenceFile[]>();
    allEvidence.forEach((ev) => {
      const cat = ev.category;
      if (!categoryMap.has(cat)) categoryMap.set(cat, []);
      categoryMap.get(cat)!.push(ev);
    });

    // Ensure all default categories appear even if empty
    const defaultCategories = [
      { name: 'Classroom Photographs', icon: School },
      { name: 'Laboratory Layouts', icon: FlaskConical },
      { name: 'Equipment Invoices', icon: Wrench },
      { name: 'Software Licenses', icon: Package },
      { name: 'Asset Verification', icon: Archive },
      { name: 'Geo-tagged Photos', icon: MapPin },
      { name: 'Installation Reports', icon: Wifi },
      { name: 'AMC Agreements', icon: FileText },
      { name: 'Calibration Certificates', icon: CheckCircle2 },
    ];

    const categories = defaultCategories.map((cat) => ({
      ...cat,
      count: categoryMap.get(cat.name)?.length || 0,
    }));

    const totalDocs = allEvidence.length;

    const filteredCategories = categories.filter((cat) =>
      searchQuery
        ? cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

    const selectedCatFiles = selectedCategory
      ? categoryMap.get(selectedCategory) || []
      : [];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Supporting Documents Repository</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Evidence uploaded from all infrastructure sections appears here organized by category</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-[10px]">
            <FileText className="h-3.5 w-3.5 mr-1" /> {categories.length} Categories
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            <Eye className="h-3.5 w-3.5 mr-1" /> {totalDocs} Documents
          </Badge>
        </div>

        <div className="relative max-w-sm">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search document categories..." className="h-8 text-xs pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {/* Category Grid */}
        {!selectedCategory ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => cat.count > 0 && setSelectedCategory(cat.name)}
                className={cn(
                  'text-left p-4 rounded-xl border border-border/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group',
                  cat.count === 0 && 'opacity-50 cursor-default'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <cat.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">{cat.name}</span>
                  </div>
                  <Badge variant="secondary" className={cn('text-[9px]', cat.count > 0 && 'bg-amber-500/10 text-amber-600')}>
                    {cat.count}
                  </Badge>
                </div>
                {cat.count > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {categoryMap.get(cat.name)?.slice(0, 3).map((ev) => (
                      <span key={ev.id} className="text-[8px] px-1.5 py-0.5 rounded bg-muted truncate max-w-[100px]">
                        {ev.fileName}
                      </span>
                    ))}
                    {(categoryMap.get(cat.name)?.length || 0) > 3 && (
                      <span className="text-[8px] text-muted-foreground">+{categoryMap.get(cat.name)!.length - 3} more</span>
                    )}
                  </div>
                ) : (
                  <p className="text-[9px] text-muted-foreground mt-2">No documents uploaded yet</p>
                )}
              </button>
            ))}
          </div>
        ) : (
          /* Category Detail View */
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setSelectedCategory(null)}>
                ← Back to Categories
              </Button>
              <Badge variant="secondary" className="text-[10px]">{selectedCategory}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedCatFiles.map((ev) => {
                const isImage = ev.fileType === 'png' || ev.fileType === 'jpg';
                return (
                  <div key={ev.id} className="p-3 rounded-lg border border-border/50 hover:border-indigo-500/30 transition-all group">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {isImage && ev.dataUrl ? (
                          <img src={ev.dataUrl} alt={ev.fileName} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" title={ev.fileName}>{ev.fileName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-muted-foreground uppercase">{ev.fileType}</span>
                          <span className="text-[9px] text-muted-foreground">{ev.fileSize}</span>
                          <Badge variant="secondary" className={cn('text-[8px]',
                            ev.status === 'approved' && 'bg-emerald-500/10 text-emerald-600',
                            ev.status === 'under-review' && 'bg-amber-500/10 text-amber-600',
                            ev.status === 'uploaded' && 'bg-blue-500/10 text-blue-600',
                          )}>{ev.status}</Badge>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{ev.uploadedAt} • {ev.uploadedBy}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const tabIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    'dashboard': LayoutDashboard,
    ...sectionIcons,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{config.label}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
          </div>
          <Badge variant="secondary" className="text-[10px] w-fit">
            <Building2 className="h-3 w-3 mr-1" />
            {departmentInfo.department} • AY 2025-26
          </Badge>
        </div>
        {/* Score Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {moduleScores.map((metric) => (
            <div key={metric.label} className="p-3 rounded-xl border border-border/50 bg-card">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{metric.label}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-xl font-bold', metric.color.split(' ')[0])}>{metric.value}%</span>
                <Progress value={metric.value} className="h-1.5 flex-1" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl flex-wrap gap-0.5">
          {config.tabs.map((tab) => {
            const Icon = tabIcons[tab.id] || FileText;
            const isActive = activeTab === tab.id;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all',
                  isActive && activeClasses.ring,
                  !isActive && activeClasses.hover
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', isActive && activeClasses.icon)} />
                <span className="hidden md:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {config.tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            {tab.id === 'dashboard' ? (
              renderDashboard()
            ) : tab.id === 'supporting-documents' ? (
              renderSupportingDocs()
            ) : (
              <DataSection
                sectionId={tab.id}
                title={tab.label}
                fields={sectionFields[tab.id] || []}
                addLabel={`Add ${tab.label.replace(/s$/, '')}`}
                stats={sectionStats[tab.id]}
                evidenceMap={sectionEvidence[tab.id] || {}}
                onUploadEvidence={handleUploadEvidence}
                onDeleteEvidence={handleDeleteEvidence}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

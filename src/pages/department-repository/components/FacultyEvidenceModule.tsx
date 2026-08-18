import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  ArrowLeft,
  FolderOpen,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Eye,
  Download,
  Trash2,
  Replace,
  History,
  Filter,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { EvidencePreviewDialog } from '@/components/shared/EvidencePreviewDialog';
import type { EvidencePreviewData } from '@/components/shared/EvidencePreviewDialog';
import {
  getFacultyEvidenceSummary,
  getFacultyEvidenceDocuments,
  uploadFacultyEvidenceDocument,
  deleteFacultyEvidenceDocumentVersion,
  downloadFacultyEvidenceDocumentVersion,
  getFacultyEvidenceDocumentBlob,
  getFacultyEvidenceActivity,
} from '@/services/faculty-repository.service';
import { toast } from 'sonner';

// ============================================================
// TYPES
// ============================================================

type DocumentStatus = 'not_uploaded' | 'uploaded' | 'under_review' | 'approved' | 'rejected';

interface DocumentVersion {
  id: string | number;
  version: number;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  status: DocumentStatus;
  url?: string;
}

interface EvidenceDocumentItem {
  id: string;
  name: string;
  mandatory: boolean;
  status: DocumentStatus;
  currentVersion?: number;
  versions: DocumentVersion[];
  uploadedOn?: string;
  uploadedBy?: string;
  conditionalField?: string;
  conditionalValue?: string;
  referenceNote?: string;
}

interface EvidenceFolderItem {
  id: string;
  name: string;
  description: string;
  documents: EvidenceDocumentItem[];
  conditionalField?: string;
  conditionalValue?: string;
}

interface FacultyMember {
  id: string | number;
  empCode: string;
  name: string;
  designation: string;
  department: string;
  facultyType: 'Regular' | 'Contract' | 'Visiting' | 'Professor of Practice';
  hasPhD: boolean;
  hasPromotion: boolean;
  completionPercentage: number;
  mandatoryDocs: number;
  uploadedDocs: number;
  pendingDocs: number;
}

interface FacultyEvidenceModuleProps {
  department: string;
  academicYear: string;
  departmentId?: number;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function normalizeDocumentStatus(status?: string): DocumentStatus {
  if (!status) return 'not_uploaded';
  const s = String(status).toLowerCase().trim();
  if (s === 'uploaded') return 'uploaded';
  if (s === 'under_review' || s === 'under review' || s === 'in_review') return 'under_review';
  if (s === 'approved' || s === 'verified' || s === 'validated') return 'approved';
  if (s === 'rejected') return 'rejected';
  if (s === 'not_uploaded' || s === 'pending') return 'not_uploaded';
  return 'uploaded';
}

function formatFileType(fileType?: string): string {
  if (!fileType) return 'PDF';
  const s = fileType.toLowerCase();
  if (s.includes('pdf')) return 'PDF';
  if (s.includes('png')) return 'PNG';
  if (s.includes('jpg') || s.includes('jpeg')) return 'JPG';
  if (s.includes('word') || s.includes('docx') || s.includes('doc')) return 'DOCX';
  if (s.includes('sheet') || s.includes('xlsx') || s.includes('xls')) return 'XLSX';
  return fileType.replace(/^[a-z]+\//i, '').toUpperCase();
}

function formatFileSize(bytes?: number | string): string {
  if (!bytes) return '1.2 MB';
  const num = Number(bytes);
  if (isNaN(num)) return String(bytes);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getStatusColor(status?: string): string {
  const s = normalizeDocumentStatus(status);
  switch (s) {
    case 'not_uploaded': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    case 'uploaded': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'under_review': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getStatusLabel(status?: string): string {
  const s = normalizeDocumentStatus(status);
  switch (s) {
    case 'not_uploaded': return 'Not Uploaded';
    case 'uploaded': return 'Uploaded';
    case 'under_review': return 'Under Review';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    default: return 'Not Uploaded';
  }
}

function getCompletionColor(pct: number): string {
  if (pct >= 100) return 'text-emerald-600 dark:text-emerald-400';
  if (pct >= 75) return 'text-amber-600 dark:text-amber-400';
  if (pct >= 50) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

function generateFolders(faculty: FacultyMember, uploadedEvidences: any[] = []): EvidenceFolderItem[] {
  // Find uploaded doc by docCode or docType or name
  const findEvidence = (docId: string, docName: string) => {
    return uploadedEvidences.find((e) =>
      e.documentCode?.toLowerCase() === docId.toLowerCase() ||
      e.documentType?.toLowerCase() === docName.toLowerCase() ||
      e.documentName?.toLowerCase() === docName.toLowerCase() ||
      e.fileName?.toLowerCase().includes(docName.toLowerCase())
    );
  };

  const mapDocItem = (
    id: string,
    name: string,
    mandatory: boolean,
    conditionalField?: string,
    conditionalValue?: string,
    referenceNote?: string
  ): EvidenceDocumentItem => {
    const ev = findEvidence(id, name);
    const hasUpload = !!ev && (normalizeDocumentStatus(ev.status) !== 'not_uploaded' || (Array.isArray(ev.versions) && ev.versions.length > 0));
    const latestVer = Array.isArray(ev?.versions) && ev.versions.length > 0 ? ev.versions[0] : null;

    const versions: DocumentVersion[] = Array.isArray(ev?.versions) && ev.versions.length > 0
      ? ev.versions.map((v: any) => ({
          id: v.versionId || v.id,
          version: v.versionNumber || v.version || 1,
          fileName: v.fileName || `${id}.pdf`,
          fileSize: formatFileSize(v.fileSize),
          fileType: formatFileType(v.fileType),
          uploadedBy: v.uploadedBy || faculty.name,
          uploadedAt: formatDate(v.uploadedAt),
          status: normalizeDocumentStatus(v.status),
          url: v.downloadUrl || v.url,
        }))
      : hasUpload
      ? [{
          id: ev.id || ev.documentId || `v-${id}`,
          version: ev.currentVersion || ev.version || 1,
          fileName: ev.fileName || `${id}.pdf`,
          fileSize: formatFileSize(ev.fileSize),
          fileType: formatFileType(ev.fileType),
          uploadedBy: ev.uploadedByName || ev.uploadedBy || faculty.name,
          uploadedAt: formatDate(ev.uploadedAt || ev.createdDate),
          status: normalizeDocumentStatus(ev.status),
          url: ev.fileUrl || ev.url,
        }]
      : [];

    const docStatus: DocumentStatus = hasUpload
      ? normalizeDocumentStatus(ev.status || latestVer?.status)
      : 'not_uploaded';

    return {
      id,
      name,
      mandatory,
      status: docStatus,
      currentVersion: hasUpload ? (ev.currentVersion || latestVer?.versionNumber || ev.version || 1) : undefined,
      versions,
      uploadedOn: hasUpload ? (latestVer?.uploadedAt ? formatDate(latestVer.uploadedAt) : formatDate(ev.uploadedAt || ev.createdDate)) : undefined,
      uploadedBy: hasUpload ? (latestVer?.uploadedBy || ev.uploadedBy || ev.uploadedByName || faculty.name) : undefined,
      conditionalField,
      conditionalValue,
      referenceNote,
    };
  };

  const folders: EvidenceFolderItem[] = [
    {
      id: 'faculty-profile',
      name: 'Faculty Profile',
      description: 'Personal identification and appointment documents',
      documents: [
        mapDocItem('fp-photo', 'Passport Size Photograph', false),
        mapDocItem('fp-aadhaar', 'Aadhaar Card', false),
        mapDocItem('fp-pan', 'PAN Card', false),
        mapDocItem('fp-appointment', 'Appointment Order', true),
        mapDocItem('fp-joining', 'Joining Report', true),
        mapDocItem('fp-resume', 'Resume / CV', true),
        mapDocItem('fp-id-card', 'Employee ID Card', false),
      ],
    },
    {
      id: 'qualifications',
      name: 'Qualifications',
      description: 'Academic degree certificates and transcripts',
      documents: [
        mapDocItem('q-degree', 'Degree Certificate', true),
        mapDocItem('q-marks', 'Consolidated Marks Memo', true),
        mapDocItem('q-phd', 'PhD Certificate', true, 'hasPhD', 'true'),
        mapDocItem('q-provisional', 'Provisional Certificate', false),
        mapDocItem('q-equivalence', 'Equivalence Certificate', false),
      ],
    },
    {
      id: 'employment-info',
      name: 'Employment Information',
      description: 'Employment orders, promotions, and experience documents',
      documents: [
        mapDocItem('ei-appointment', 'Appointment Order', true, undefined, undefined, 'Available from Profile'),
        mapDocItem('ei-promotion', 'Promotion Order', true, 'hasPromotion', 'true'),
        mapDocItem('ei-increment', 'Increment Order', false),
        mapDocItem('ei-relieving', 'Relieving Order', false),
        mapDocItem('ei-pay-revision', 'Pay Revision Order', false),
        mapDocItem('ei-experience', 'Experience Certificates', false),
      ],
    },
  ];

  if (faculty.facultyType === 'Professor of Practice') {
    folders.push({
      id: 'professor-of-practice',
      name: 'Professor of Practice',
      description: 'Industry experience and practice-related documents',
      conditionalField: 'facultyType',
      conditionalValue: 'Professor of Practice',
      documents: [
        mapDocItem('pop-appointment', 'Appointment Order', true),
        mapDocItem('pop-industry-exp', 'Industry Experience Certificate', true),
        mapDocItem('pop-resume', 'Resume', true),
        mapDocItem('pop-recommendation', 'Industry Recommendation Letter', false),
        mapDocItem('pop-contract', 'Contract / Agreement', false),
        mapDocItem('pop-aicte', 'AICTE Approval', false),
        mapDocItem('pop-geotagged', 'Geo-tagged Photographs', true),
        mapDocItem('pop-registered-students', 'Registered Students List', true),
        mapDocItem('pop-attended-students', 'Attended Students List', true),
        mapDocItem('pop-session-report', 'Session Completion Report', false),
        mapDocItem('pop-feedback', 'Student Feedback', false),
        mapDocItem('pop-appreciation', 'Certificate of Appreciation', false),
      ],
    });
  }

  return folders;
}

function calculateFolderCompletion(folder: EvidenceFolderItem, faculty: FacultyMember): { mandatory: number; uploaded: number; percentage: number } {
  const applicableDocs = folder.documents.filter(doc => {
    if (doc.conditionalField === 'hasPhD' && !faculty.hasPhD) return false;
    if (doc.conditionalField === 'hasPromotion' && !faculty.hasPromotion) return false;
    return true;
  });
  const mandatory = applicableDocs.filter(d => d.mandatory).length;
  const uploaded = applicableDocs.filter(d => d.mandatory && d.status !== 'not_uploaded').length;
  return { mandatory, uploaded, percentage: mandatory > 0 ? Math.round((uploaded / mandatory) * 100) : 100 };
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function FacultyEvidenceModule({ department, academicYear, departmentId: propDeptId }: FacultyEvidenceModuleProps) {
  const { user } = useAuth();
  const departmentId = propDeptId ?? user?.departmentId ?? 0;
  const currentUserId = user?.id || 1;

  const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<EvidenceFolderItem | null>(null);
  const [facultyEvidences, setFacultyEvidences] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<EvidenceDocumentItem | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewEvidence, setPreviewEvidence] = useState<EvidencePreviewData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // ── Preview Document ───────────────────────────────────────────────────────
  const handlePreviewDocument = async (doc: EvidenceDocumentItem) => {
    const version = doc.versions[0];
    if (!version) {
      toast.error('No document uploaded to preview');
      return;
    }
    setPreviewLoading(true);
    try {
      const blob = await getFacultyEvidenceDocumentBlob(version.id);
      const dataUrl = URL.createObjectURL(blob);
      setPreviewEvidence({
        id: String(version.id),
        fileName: version.fileName,
        fileType: version.fileType.toLowerCase(),
        fileSize: version.fileSize,
        dataUrl,
        uploadedAt: version.uploadedAt,
        uploadedBy: version.uploadedBy,
        status: doc.status,
        category: selectedFolder?.name || 'Faculty Evidence',
      });
      setPreviewOpen(true);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load document preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  // ── Fetch Faculty List via Evidence Summary API ───────────────────────────
  const fetchFaculty = useCallback(async () => {
    if (!departmentId) return;
    setLoading(true);
    try {
      const res = await getFacultyEvidenceSummary(academicYear, departmentId);
      const items: any[] = res?.data ?? res?.content ?? res ?? [];

      const mapped: FacultyMember[] = items.map((r: any, idx: number) => {
        const designation = r.designation || r.currentDesignation || 'Faculty Member';
        const isPoP = designation.toLowerCase().includes('practice') || r.facultyType === 'Professor of Practice';
        const hasPhD = !!r.hasPhD;
        const hasPromotion = r.hasPromotion !== undefined ? !!r.hasPromotion : true;
        const mandatoryCount = Number(r.mandatoryDocsCount ?? (isPoP ? 14 : (hasPhD ? 10 : 8)));
        const uploadedCount = Number(r.uploadedDocsCount ?? 0);
        const pendingCount = Number(r.pendingDocsCount ?? Math.max(0, mandatoryCount - uploadedCount));
        const pct = Number(r.completionPercentage ?? (mandatoryCount > 0 ? Math.round((uploadedCount / mandatoryCount) * 100) : 0));

        return {
          id: r.facultyId || r.id || `faculty-${idx + 1}`,
          empCode: r.facultyId || r.empCode || `EMP${String(idx + 1).padStart(3, '0')}`,
          name: r.facultyName || r.name || 'Faculty',
          designation,
          department: r.departmentName || department,
          facultyType: r.facultyType || (isPoP ? 'Professor of Practice' : 'Regular'),
          hasPhD,
          hasPromotion,
          completionPercentage: pct,
          mandatoryDocs: mandatoryCount,
          uploadedDocs: uploadedCount,
          pendingDocs: pendingCount,
        };
      });

      setFacultyList(mapped);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to load faculty evidence summary');
    } finally {
      setLoading(false);
    }
  }, [academicYear, departmentId, department]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  // ── Fetch Evidence for Selected Faculty ───────────────────────────────────
  const fetchEvidenceForFaculty = useCallback(async (faculty: FacultyMember) => {
    if (!departmentId) return;
    try {
      const facultyKey = String(faculty.empCode || faculty.id);
      const res = await getFacultyEvidenceDocuments(facultyKey, academicYear, departmentId);
      const items: any[] = res?.data ?? res?.content ?? res ?? [];
      setFacultyEvidences(Array.isArray(items) ? items : []);
    } catch {
      setFacultyEvidences([]);
    }
  }, [academicYear, departmentId]);

  const handleSelectFaculty = (faculty: FacultyMember) => {
    setSelectedFaculty(faculty);
    setSelectedFolder(null);
    setSearchQuery('');
    setStatusFilter('all');
    fetchEvidenceForFaculty(faculty);
  };

  // ── Upload Document ───────────────────────────────────────────────────────
  const handleUploadSubmit = async () => {
    if (!selectedUploadFile || !selectedDocument || !selectedFaculty || !departmentId) return;
    setUploading(true);
    try {
      const facultyKey = String(selectedFaculty.empCode || selectedFaculty.id);
      await uploadFacultyEvidenceDocument(facultyKey, selectedUploadFile, {
        categoryId: selectedFolder?.id || 'faculty-profile',
        documentCode: selectedDocument.id,
        documentName: selectedDocument.name,
        departmentId,
        academicYear,
        uploadedBy: user?.name || 'Department Coordinator',
      });

      toast.success(`${selectedDocument.name} uploaded successfully`);
      setUploadDialogOpen(false);
      setSelectedUploadFile(null);
      fetchEvidenceForFaculty(selectedFaculty);
      fetchFaculty();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // ── Delete Document ───────────────────────────────────────────────────────
  const handleDeleteDocument = async (doc: EvidenceDocumentItem) => {
    const version = doc.versions[0];
    if (!version) return;
    setDeleting(true);
    try {
      await deleteFacultyEvidenceDocumentVersion(version.id);
      toast.success('Document deleted successfully');
      if (selectedFaculty) {
        fetchEvidenceForFaculty(selectedFaculty);
        fetchFaculty();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  // ── Faculty list filtering ────────────────────────────────────────────────
  const filteredFaculty = useMemo(() => {
    let list = facultyList;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q) || f.empCode.toLowerCase().includes(q) || f.designation.toLowerCase().includes(q));
    }
    if (typeFilter !== 'all') {
      if (typeFilter === 'complete') list = list.filter(f => f.completionPercentage === 100);
      else if (typeFilter === 'in-progress') list = list.filter(f => f.completionPercentage > 0 && f.completionPercentage < 100);
      else if (typeFilter === 'critical') list = list.filter(f => f.completionPercentage < 50);
    }
    return list;
  }, [facultyList, searchQuery, typeFilter]);

  // ── Summary metrics ───────────────────────────────────────────────────────
  const summaryMetrics = useMemo(() => {
    const totalCategories = 4;
    const totalFacultyCount = facultyList.length;
    const totalMandatory = facultyList.reduce((sum, f) => sum + f.mandatoryDocs, 0);
    const totalUploaded = facultyList.reduce((sum, f) => sum + f.uploadedDocs, 0);
    const totalPending = facultyList.reduce((sum, f) => sum + f.pendingDocs, 0);
    const avgCompletion = totalFacultyCount > 0
      ? Math.round(facultyList.reduce((sum, f) => sum + f.completionPercentage, 0) / totalFacultyCount)
      : 0;
    return { totalCategories, totalFacultyCount, totalMandatory, totalUploaded, totalPending, avgCompletion };
  }, [facultyList]);

  // ============================================================
  // RENDER: Document Detail View (inside a folder)
  // ============================================================
  if (selectedFaculty && selectedFolder) {
    const liveFolders = generateFolders(selectedFaculty, facultyEvidences);
    const currentFolder = liveFolders.find(f => f.id === selectedFolder.id) || selectedFolder;

    const applicableDocs = currentFolder.documents.filter(doc => {
      if (doc.conditionalField === 'hasPhD' && !selectedFaculty.hasPhD) return false;
      if (doc.conditionalField === 'hasPromotion' && !selectedFaculty.hasPromotion) return false;
      return true;
    });

    const filteredDocs = applicableDocs.filter(doc => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'mandatory') return doc.mandatory;
      if (statusFilter === 'optional') return !doc.mandatory;
      if (statusFilter === 'uploaded') return doc.status !== 'not_uploaded';
      if (statusFilter === 'pending') return doc.status === 'not_uploaded' && doc.mandatory;
      if (statusFilter === 'approved') return doc.status === 'approved';
      if (statusFilter === 'rejected') return doc.status === 'rejected';
      return true;
    });

    const folderMetrics = calculateFolderCompletion(currentFolder, selectedFaculty);

    return (
      <div className="space-y-4 w-full min-w-0 max-w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedFolder(null); }} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Evidence Repository
          </Button>
          <span className="text-muted-foreground">/ {selectedFaculty.name} / {currentFolder.name}</span>
        </div>

        {/* Folder Header */}
        <Card className="w-full min-w-0 max-w-full">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{currentFolder.name}</h2>
                  <p className="text-sm text-muted-foreground">{currentFolder.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-lg font-bold">{folderMetrics.mandatory}</p>
                  <p className="text-xs text-muted-foreground">Required</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-center">
                  <p className="text-lg font-bold">{folderMetrics.uploaded}</p>
                  <p className="text-xs text-muted-foreground">Uploaded</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-center">
                  <p className={cn('text-lg font-bold', getCompletionColor(folderMetrics.percentage))}>{folderMetrics.percentage}%</p>
                  <p className="text-xs text-muted-foreground">Completion</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground mr-1" />
            {[
              { label: 'All', value: 'all' },
              { label: 'Mandatory', value: 'mandatory' },
              { label: 'Optional', value: 'optional' },
              { label: 'Uploaded', value: 'uploaded' },
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
            ].map(f => (
              <Button key={f.value} variant={statusFilter === f.value ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setStatusFilter(f.value)}>
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Document Table */}
        <Card className="border-border/50 w-full min-w-0 max-w-full overflow-hidden shadow-sm">
          <CardContent className="p-0 w-full min-w-0 max-w-full overflow-hidden">
            <div className="w-full table-scroll-container max-h-[520px]">
              <table className="w-full text-xs text-left min-w-[950px] border-collapse">
                <thead className="sticky top-0 z-20 bg-muted/80 backdrop-blur border-b border-border/60">
                  <tr>
                    <th className="p-3 font-semibold text-center w-10 sticky left-0 bg-muted/95 backdrop-blur z-30 shadow-[1px_0_0_0_hsl(var(--border))]">#</th>
                    <th className="p-3 font-semibold whitespace-nowrap">Document Name</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-24">Type</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-28">Status</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-28">Uploaded On</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-28">Uploaded By</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-16 text-center">Version</th>
                    <th className="p-3 font-semibold text-right whitespace-nowrap w-44 sticky right-0 bg-muted/95 backdrop-blur z-30 shadow-[-1px_0_0_0_hsl(var(--border))]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredDocs.map((doc, idx) => (
                    <tr key={doc.id} className={cn('hover:bg-muted/40 transition-colors', doc.referenceNote && 'bg-muted/20')}>
                      <td className="p-3 text-muted-foreground text-center font-mono sticky left-0 bg-background/95 backdrop-blur z-10 shadow-[1px_0_0_0_hsl(var(--border))]">{idx + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="font-medium text-sm">{doc.name}</p>
                            {doc.mandatory ? (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 mt-0.5">Mandatory</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-0.5">Optional</Badge>
                            )}
                            {doc.referenceNote && (
                              <p className="text-xs text-muted-foreground mt-0.5 italic">{doc.referenceNote}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {doc.versions.length > 0 ? (
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5">{doc.versions[0]?.fileType || 'PDF'}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <Badge className={cn('text-[10px] px-2 py-0.5', getStatusColor(doc.status))}>{getStatusLabel(doc.status)}</Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{doc.uploadedOn || '—'}</td>
                      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{doc.uploadedBy || '—'}</td>
                      <td className="p-3 text-center text-xs whitespace-nowrap">{doc.currentVersion ? `v${doc.currentVersion}` : '—'}</td>
                      <td className="p-3 text-right sticky right-0 bg-background/95 backdrop-blur z-10 shadow-[-1px_0_0_0_hsl(var(--border))]">
                        <div className="flex items-center justify-end gap-1">
                          <TooltipProvider>
                            {doc.status === 'not_uploaded' && !doc.referenceNote ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedDocument(doc); setSelectedUploadFile(null); setUploadDialogOpen(true); }}>
                                    <Upload className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Upload Document</TooltipContent>
                              </Tooltip>
                            ) : doc.referenceNote ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Document</TooltipContent>
                              </Tooltip>
                            ) : (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                                      disabled={previewLoading}
                                      onClick={() => handlePreviewDocument(doc)}
                                    >
                                      {previewLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Preview Document</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedDocument(doc); setSelectedUploadFile(null); setUploadDialogOpen(true); }}>
                                      <Replace className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Replace</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteDocument(doc)} disabled={deleting}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedDocument(doc); setVersionDialogOpen(true); }}>
                                      <History className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Version History</TooltipContent>
                                </Tooltip>
                              </>
                            )}
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedDocument?.status === 'not_uploaded' ? 'Upload' : 'Replace'} Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Document: <strong className="text-foreground">{selectedDocument?.name}</strong>
              </p>
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                  dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                )}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files?.[0]) setSelectedUploadFile(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  className="hidden"
                  onChange={(e) => setSelectedUploadFile(e.target.files?.[0] || null)}
                />
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Drag & drop your file here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                {selectedUploadFile && (
                  <div className="mt-3 p-2 rounded bg-emerald-50 dark:bg-emerald-900/20 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    Selected: {selectedUploadFile.name} ({(selectedUploadFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge variant="outline" className="text-[10px]">PDF</Badge>
                  <Badge variant="outline" className="text-[10px]">JPG</Badge>
                  <Badge variant="outline" className="text-[10px]">PNG</Badge>
                  <Badge variant="outline" className="text-[10px]">DOCX</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Maximum size: 25 MB</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUploadSubmit} disabled={!selectedUploadFile || uploading}>
                {uploading ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Uploading...</> : 'Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Version History Dialog */}
        <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Version History — {selectedDocument?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {selectedDocument?.versions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No versions available</p>
              ) : (
                selectedDocument?.versions.map((ver) => (
                  <div key={ver.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        v{ver.version}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{ver.fileName}</p>
                        <p className="text-xs text-muted-foreground">{ver.uploadedBy} • {ver.uploadedAt} • {ver.fileSize}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className={cn('text-[10px]', getStatusColor(ver.status))}>{getStatusLabel(ver.status)}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="Preview"
                        onClick={async () => {
                          try {
                            const blob = await getFacultyEvidenceDocumentBlob(ver.id);
                            const dataUrl = URL.createObjectURL(blob);
                            setPreviewEvidence({
                              id: String(ver.id),
                              fileName: ver.fileName,
                              fileType: ver.fileType.toLowerCase(),
                              fileSize: ver.fileSize,
                              dataUrl,
                              uploadedAt: ver.uploadedAt,
                              uploadedBy: ver.uploadedBy,
                              status: ver.status,
                              category: selectedFolder?.name || 'Faculty Evidence',
                            });
                            setPreviewOpen(true);
                          } catch (e: any) {
                            toast.error(e?.message || 'Failed to load preview');
                          }
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="Download"
                        onClick={() => downloadFacultyEvidenceDocumentVersion(ver.id, ver.fileName)}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Evidence Preview Dialog */}
        <EvidencePreviewDialog
          evidence={previewEvidence}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      </div>
    );
  }

  // ============================================================
  // RENDER: Evidence Repository Dashboard (folder view for selected faculty)
  // ============================================================
  if (selectedFaculty) {
    const folders = generateFolders(selectedFaculty, facultyEvidences);
    const totalMandatory = folders.reduce((sum, f) => sum + calculateFolderCompletion(f, selectedFaculty).mandatory, 0);
    const totalUploaded = folders.reduce((sum, f) => sum + calculateFolderCompletion(f, selectedFaculty).uploaded, 0);
    const totalPending = totalMandatory - totalUploaded;
    const overallCompletion = totalMandatory > 0 ? Math.round((totalUploaded / totalMandatory) * 100) : 100;

    return (
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedFaculty(null); setSearchQuery(''); setStatusFilter('all'); }} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Faculty List
          </Button>
          <span className="text-muted-foreground">/ {selectedFaculty.name}</span>
        </div>

        {/* Faculty Info Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{selectedFaculty.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedFaculty.designation} • {selectedFaculty.department}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] font-mono">{selectedFaculty.empCode}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{selectedFaculty.facultyType}</Badge>
                    {selectedFaculty.hasPhD && <Badge className="text-[10px] bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">PhD</Badge>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Evidence Repository</p>
                <p className="text-xs text-muted-foreground mt-0.5">Single source of truth for all faculty documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total Categories', value: folders.length, icon: FolderOpen, color: 'text-indigo-600 bg-indigo-500/10' },
            { label: 'Mandatory Documents', value: totalMandatory, icon: FileText, color: 'text-violet-600 bg-violet-500/10' },
            { label: 'Uploaded', value: totalUploaded, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10' },
            { label: 'Pending', value: totalPending, icon: Clock, color: 'text-amber-600 bg-amber-500/10' },
            { label: 'Completion', value: `${overallCompletion}%`, icon: Upload, color: getCompletionColor(overallCompletion).replace('dark:', '') + ' bg-primary/10' },
          ].map((card) => (
            <Card key={card.label}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', card.color.split(' ')[1])}>
                    <card.icon className={cn('h-4 w-4', card.color.split(' ')[0])} />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{card.value}</p>
                    <p className="text-[10px] text-muted-foreground">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground italic">
          * Only mandatory documents contribute to the completion percentage.
        </p>

        {/* 3 Core Section Folders (+ PoP if applicable) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map(folder => {
            const metrics = calculateFolderCompletion(folder, selectedFaculty);
            const totalDocs = folder.documents.filter(d => {
              if (d.conditionalField === 'hasPhD' && !selectedFaculty.hasPhD) return false;
              if (d.conditionalField === 'hasPromotion' && !selectedFaculty.hasPromotion) return false;
              return true;
            }).length;
            const uploadedDocs = folder.documents.filter(d => {
              if (d.conditionalField === 'hasPhD' && !selectedFaculty.hasPhD) return false;
              if (d.conditionalField === 'hasPromotion' && !selectedFaculty.hasPromotion) return false;
              return d.status !== 'not_uploaded';
            }).length;
            const pendingDocs = metrics.mandatory - metrics.uploaded;

            return (
              <motion.div
                key={folder.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="cursor-pointer hover:shadow-md transition-shadow h-full border-border/60" onClick={() => { setSelectedFolder(folder); setSearchQuery(''); setStatusFilter('all'); }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <Badge className={cn('text-[10px]', metrics.percentage >= 100 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : metrics.percentage >= 75 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300')}>
                        {metrics.percentage}%
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{folder.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{folder.description}</p>
                    <Progress value={metrics.percentage} className="h-1.5 mb-3" />
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-sm font-bold">{totalDocs}</p>
                        <p className="text-[10px] text-muted-foreground">Total</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-600">{uploadedDocs}</p>
                        <p className="text-[10px] text-muted-foreground">Uploaded</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-amber-600">{pendingDocs}</p>
                        <p className="text-[10px] text-muted-foreground">Pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Approval Workflow */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Document Approval Workflow</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              {['Draft', 'Uploaded', 'HOD Verification', 'IQAC Verification', 'Approved'].map((step, idx) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={cn('px-2.5 py-1 rounded-full font-medium', idx === 4 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-muted text-muted-foreground')}>
                    {step}
                  </div>
                  {idx < 4 && <span className="text-muted-foreground">→</span>}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Approved documents are available for NAAC, NBA, NIRF, and AICTE submissions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================
  // RENDER: Faculty List View (initial view)
  // ============================================================
  return (
    <div className="space-y-4 w-full min-w-0 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Faculty Evidence Repository</h2>
          <p className="text-sm text-muted-foreground">
            Single source of truth for all faculty-related evidence used across NAAC SSR, NBA SAR, AICTE Compliance, NIRF, and Faculty Audits.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchFaculty} disabled={loading} className="gap-1 text-xs">
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {/* Summary Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Faculty', value: summaryMetrics.totalFacultyCount, icon: Users, color: 'text-indigo-600 bg-indigo-500/10' },
          { label: 'Total Categories', value: summaryMetrics.totalCategories, icon: FolderOpen, color: 'text-violet-600 bg-violet-500/10' },
          { label: 'Total Uploaded', value: summaryMetrics.totalUploaded, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10' },
          { label: 'Total Pending', value: summaryMetrics.totalPending, icon: AlertTriangle, color: 'text-amber-600 bg-amber-500/10' },
          { label: 'Avg. Completion', value: `${summaryMetrics.avgCompletion}%`, icon: Upload, color: 'text-blue-600 bg-blue-500/10' },
        ].map((card) => (
          <Card key={card.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', card.color.split(' ')[1])}>
                  <card.icon className={cn('h-4 w-4', card.color.split(' ')[0])} />
                </div>
                <div>
                  <p className="text-lg font-bold">{loading ? '...' : card.value}</p>
                  <p className="text-[10px] text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search faculty by name, EMP code, or designation..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Faculty</SelectItem>
            <SelectItem value="complete">Complete (100%)</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="critical">Critical (&lt;50%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Faculty List Table */}
      <Card className="border-border/50 w-full min-w-0 max-w-full overflow-hidden shadow-sm">
        <CardContent className="p-0 w-full min-w-0 max-w-full overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <h3 className="text-base font-medium text-muted-foreground">No faculty found</h3>
              <p className="text-xs text-muted-foreground/70 mt-1">Make sure faculty profiles exist for {academicYear}</p>
            </div>
          ) : (
            <div className="w-full table-scroll-container max-h-[520px]">
              <table className="w-full text-xs text-left min-w-[1050px] border-collapse">
                <thead className="sticky top-0 z-20 bg-muted/80 backdrop-blur border-b border-border/60">
                  <tr>
                    <th className="p-3 font-semibold text-center w-10 sticky left-0 bg-muted/95 backdrop-blur z-30 shadow-[1px_0_0_0_hsl(var(--border))]">#</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-28">EMP Code</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-48">Faculty Name</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-40">Designation</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-28">Type</th>
                    <th className="p-3 font-semibold whitespace-nowrap text-center w-24">Mandatory</th>
                    <th className="p-3 font-semibold whitespace-nowrap text-center w-24">Uploaded</th>
                    <th className="p-3 font-semibold whitespace-nowrap text-center w-24">Pending</th>
                    <th className="p-3 font-semibold whitespace-nowrap w-36">Completion</th>
                    <th className="p-3 font-semibold text-right whitespace-nowrap w-24 sticky right-0 bg-muted/95 backdrop-blur z-30 shadow-[-1px_0_0_0_hsl(var(--border))]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredFaculty.map((faculty, idx) => (
                    <tr key={faculty.id} className="hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => handleSelectFaculty(faculty)}>
                      <td className="p-3 text-muted-foreground text-center font-mono sticky left-0 bg-background/95 backdrop-blur z-10 shadow-[1px_0_0_0_hsl(var(--border))]">{idx + 1}</td>
                      <td className="p-3 font-mono text-xs font-medium whitespace-nowrap">{faculty.empCode}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sm">{faculty.name}</span>
                          {faculty.hasPhD && <Badge className="text-[9px] px-1 py-0 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">PhD</Badge>}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">{faculty.designation}</td>
                      <td className="p-3 whitespace-nowrap">
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5">{faculty.facultyType}</Badge>
                      </td>
                      <td className="p-3 text-center font-medium whitespace-nowrap">{faculty.mandatoryDocs}</td>
                      <td className="p-3 text-center font-medium text-emerald-600 whitespace-nowrap">{faculty.uploadedDocs}</td>
                      <td className="p-3 text-center font-medium text-amber-600 whitespace-nowrap">{faculty.pendingDocs}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Progress value={faculty.completionPercentage} className="h-2 flex-1" />
                          <span className={cn('text-xs font-bold', getCompletionColor(faculty.completionPercentage))}>{faculty.completionPercentage}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-right sticky right-0 bg-background/95 backdrop-blur z-10 shadow-[-1px_0_0_0_hsl(var(--border))]">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evidence Preview Dialog */}
      <EvidencePreviewDialog
        evidence={previewEvidence}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
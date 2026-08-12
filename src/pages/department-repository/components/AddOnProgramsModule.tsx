import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useReadOnly } from '@/hooks/useReadOnly';
import { academicRepositoryService } from '@/services/academic-repository.service';
import {
  Award,
  Download,
  Upload,
  Plus,
  Save,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  X,
  Eye,
  DownloadCloud,
  RefreshCw,
  Building2,
  CalendarDays,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

function cleanYear(y: string): string {
  const s = (y || '').trim().toLowerCase();
  if (s.includes('1') || s.includes('1st') || s.includes('i year') || s === 'i') return '1';
  if (s.includes('2') || s.includes('2nd') || s.includes('ii year') || s === 'ii') return '2';
  if (s.includes('3') || s.includes('3rd') || s.includes('iii year') || s === 'iii') return '3';
  if (s.includes('4') || s.includes('4th') || s.includes('iv year') || s === 'iv') return '4';
  return s;
}

function cleanSem(s: string): string {
  const str = (s || '').trim().toLowerCase();
  const match = str.match(/\d+/);
  return match ? match[0] : str;
}

function formatTimeTo24h(timeStr: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const parts = trimmed.split(':');
    const h = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const s = (parts[2] || '00').padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2].padStart(2, '0');
    const second = (match[3] || '00').padStart(2, '0');
    const period = match[4].toUpperCase();
    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return `${String(hour).padStart(2, '0')}:${minute}:${second}`;
  }
  return trimmed;
}

function formatDateToISO(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parts = trimmed.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return trimmed;
}

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

interface AddOnProgramRecord {
  id: string;
  department: string;
  year: string;
  semester: string;
  topic: string;
  fromDate: string;
  toDate: string;
  timeFrom: string;
  timeTo: string;
  coordinator: string;
  duration: string;
  studentsEnrolled: string;
  studentsParticipated: string;
  certificationProvided: 'Yes' | 'No';
  certificatesIssued: string;
  validationStatus?: 'valid' | 'invalid';
  errors?: string[];
}

interface ProgramEvidenceItem {
  id?: number | string;
  status: 'not-uploaded' | 'uploaded';
  fileName?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  fileSize?: number;
  fileType?: string;
  verificationStatus?: string;
  fileUrl?: string;
}

interface ProgramEvidenceMap {
  geoTaggedPhotos: ProgramEvidenceItem;
  registeredStudentsList: ProgramEvidenceItem;
  attendedStudentsList: ProgramEvidenceItem;
}

interface AddOnProgramsModuleProps {
  department: string;
  academicYear: string;
  departmentId?: number;
}

const YEARS_OF_STUDY = ['I Year', 'II Year', 'III Year', 'IV Year'];
const SEMESTERS_MAP: Record<string, string[]> = {
  'I Year': ['Semester 1', 'Semester 2'],
  'II Year': ['Semester 3', 'Semester 4'],
  'III Year': ['Semester 5', 'Semester 6'],
  'IV Year': ['Semester 7', 'Semester 8'],
};

// Evidence types for per-program documents
type EvidenceDocType = 'geoTaggedPhotos' | 'registeredStudentsList' | 'attendedStudentsList';

const DOC_TYPE_TO_SERVER_NAME: Record<EvidenceDocType, string> = {
  geoTaggedPhotos: 'Geo-tagged Photos of Session',
  registeredStudentsList: 'Registered Students List',
  attendedStudentsList: 'Attended Students List',
};

function mapServerDocTypeToFrontendKey(serverDocType?: string): EvidenceDocType | null {
  if (!serverDocType) return null;
  const lower = serverDocType.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (lower.includes('geotagged') || lower.includes('photo') || lower.includes('session')) return 'geoTaggedPhotos';
  if (lower.includes('registered') || lower.includes('enroll')) return 'registeredStudentsList';
  if (lower.includes('attended') || lower.includes('attend')) return 'attendedStudentsList';
  return null;
}

export const AddOnProgramsModule = ({ department, academicYear, departmentId = 1 }: AddOnProgramsModuleProps) => {
  const { user } = useAuth();
  const { isReadOnly } = useReadOnly();
  const [selectedYear, setSelectedYear] = useState('III Year');
  const [selectedSemester, setSelectedSemester] = useState('Semester 5');
  const [programs, setPrograms] = useState<AddOnProgramRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCertification, setFilterCertification] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AddOnProgramRecord | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<AddOnProgramRecord[]>([]);
  const [uploadStats, setUploadStats] = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Per-program evidence state
  const [programEvidenceMap, setProgramEvidenceMap] = useState<Record<string, ProgramEvidenceMap>>({});
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    programId: string;
    docType: EvidenceDocType;
    fileName: string;
    fileUrl?: string;
    fileType?: string;
    fileSize?: string;
    uploadedAt?: string;
  } | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | number | null>(null);
  const [uploadDialog, setUploadDialog] = useState<{ open: boolean; programId: string; docType: EvidenceDocType } | null>(null);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [downloadingEvidenceId, setDownloadingEvidenceId] = useState<string | number | null>(null);
  const [deleteTargetEvidence, setDeleteTargetEvidence] = useState<{
    evidenceId: number | string;
    programId: string;
    programName: string;
    docType: EvidenceDocType;
    fileName: string;
  } | null>(null);
  const [isDeletingEvidence, setIsDeletingEvidence] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dropZoneInputRef = useRef<HTMLInputElement>(null);

  // Fetch Add-on Programs via API
  const fetchPrograms = useCallback(async () => {
    if (!academicYear) return;
    setLoading(true);
    try {
      const res = await academicRepositoryService.getAddOnPrograms(
        academicYear,
        departmentId || 1
      );

      let rawList: any[] = [];
      if (Array.isArray(res)) {
        rawList = res;
      } else if (res && Array.isArray(res.content)) {
        rawList = res.content;
      } else if (res && Array.isArray(res.data)) {
        rawList = res.data;
      } else if (res && res.data && Array.isArray(res.data.content)) {
        rawList = res.data.content;
      }

      const mapped: AddOnProgramRecord[] = rawList.map((item: any) => ({
        id: String(item.id || `prog-${Date.now()}`),
        department: department,
        year: item.yearOfStudy || item.year || selectedYear,
        semester: item.semester || selectedSemester,
        topic: item.topic || '',
        fromDate: item.fromDate || '',
        toDate: item.toDate || '',
        timeFrom: item.timeFrom || '',
        timeTo: item.timeTo || '',
        coordinator: item.coordinator || '',
        duration: item.duration || '',
        studentsEnrolled: String(item.studentsEnrolled ?? 0),
        studentsParticipated: String(item.studentsParticipated ?? 0),
        certificationProvided: item.certificationProvided === true || item.certificationProvided === 'Yes' ? 'Yes' : 'No',
        certificatesIssued: String(item.certificatesIssued ?? 0),
      }));

      setPrograms(mapped);
    } catch (err: any) {
      console.error('Failed to fetch add-on programs:', err);
    } finally {
      setLoading(false);
    }
  }, [academicYear, departmentId, department, selectedYear, selectedSemester]);

  // Fetch Evidence Documents from live API
  const fetchEvidence = useCallback(async () => {
    if (!departmentId || !academicYear) return;
    setEvidenceLoading(true);
    try {
      const res = await academicRepositoryService.getEvidenceDocuments(academicYear, departmentId, {
        sectionName: 'add-on-programs',
        size: 1000,
      });

      let items: any[] = [];
      if (Array.isArray(res)) {
        items = res;
      } else if (res && Array.isArray(res.content)) {
        items = res.content;
      } else if (res && res.data && Array.isArray(res.data.content)) {
        items = res.data.content;
      } else if (res && res.data && Array.isArray(res.data)) {
        items = res.data;
      }

      const newMap: Record<string, ProgramEvidenceMap> = {};

      items.forEach((item: any) => {
        const programId = item.recordId != null ? String(item.recordId) : '';
        if (!programId) return;

        const docKey = mapServerDocTypeToFrontendKey(item.documentType || item.documentName);
        if (!docKey) return;

        if (!newMap[programId]) {
          newMap[programId] = {
            geoTaggedPhotos: { status: 'not-uploaded' },
            registeredStudentsList: { status: 'not-uploaded' },
            attendedStudentsList: { status: 'not-uploaded' },
          };
        }

        const uploadedDate = item.uploadedAt || item.createdAt;
        const formattedDate = uploadedDate
          ? new Date(uploadedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : '';

        newMap[programId][docKey] = {
          id: item.id,
          status: 'uploaded',
          fileName: item.fileName || item.documentName || `${DOC_TYPE_TO_SERVER_NAME[docKey]}.pdf`,
          uploadedAt: formattedDate,
          uploadedBy: item.uploadedBy || '',
          fileSize: item.fileSize,
          fileType: item.fileType || item.fileName?.split('.').pop() || 'pdf',
          verificationStatus: item.verificationStatus || 'PENDING',
          fileUrl: item.fileUrl || item.downloadUrl,
        };
      });

      setProgramEvidenceMap(newMap);
    } catch (err: any) {
      console.warn('Failed to fetch add-on programs evidence:', err);
    } finally {
      setEvidenceLoading(false);
    }
  }, [academicYear, departmentId]);

  useEffect(() => {
    fetchPrograms();
    fetchEvidence();
  }, [fetchPrograms, fetchEvidence]);

  // New program form state
  const [newProgram, setNewProgram] = useState({
    topic: '',
    fromDate: '',
    toDate: '',
    timeFrom: '',
    timeTo: '',
    coordinator: '',
    duration: '',
    studentsEnrolled: '',
    studentsParticipated: '',
    certificationProvided: 'Yes' as 'Yes' | 'No',
    certificatesIssued: '',
  });

  // Update semester when year changes
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const semesters = SEMESTERS_MAP[year];
    if (semesters && semesters.length > 0) {
      setSelectedSemester(semesters[0]);
    }
  };

  // Filtered programs for selected year/semester
  const filteredPrograms = useMemo(() => {
    let filtered = programs.filter(
      (p) => p.year === selectedYear && p.semester === selectedSemester
    );

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.topic.toLowerCase().includes(q) ||
          p.coordinator.toLowerCase().includes(q)
      );
    }

    if (filterCertification && filterCertification !== 'all') {
      filtered = filtered.filter((p) => p.certificationProvided === filterCertification);
    }

    return filtered;
  }, [programs, selectedYear, selectedSemester, searchQuery, filterCertification]);

  // Allowed file types per evidence document type
  const getAllowedTypes = useCallback((docType: EvidenceDocType) => {
    if (docType === 'geoTaggedPhotos') {
      return {
        extensions: ['.pdf', '.png', '.jpg', '.jpeg', '.heic', '.webp'],
        mimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/heic', 'image/webp'],
        label: 'PDF, PNG, JPG, JPEG, HEIC, WebP',
      };
    }
    // For registered/attended students lists
    return {
      extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv'],
      mimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
      ],
      label: 'PDF, Word (.doc, .docx), Excel (.xls, .xlsx), CSV',
    };
  }, []);

  const validateFile = useCallback((file: File, docType: EvidenceDocType): string | null => {
    const allowed = getAllowedTypes(docType);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowed.extensions.includes(ext)) {
      return `Invalid file type "${ext}". Allowed: ${allowed.label}`;
    }
    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return 'File size exceeds 10 MB limit.';
    }
    return null;
  }, [getAllowedTypes]);

  // Evidence handlers for per-program documents
  const handleUploadEvidence = useCallback((programId: string, docType: EvidenceDocType) => {
    setUploadDialog({ open: true, programId, docType });
    setUploadError(null);
    setSelectedFile(null);
    setDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    setUploadError(null);

    const file = e.dataTransfer.files?.[0];
    if (!file || !uploadDialog) return;

    const error = validateFile(file, uploadDialog.docType);
    if (error) {
      setUploadError(error);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  }, [uploadDialog, validateFile]);

  const handleDropZoneFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadDialog) return;
    setUploadError(null);

    const error = validateFile(file, uploadDialog.docType);
    if (error) {
      setUploadError(error);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  }, [uploadDialog, validateFile]);

  // Upload Evidence Document to backend
  const handleConfirmUpload = useCallback(async () => {
    if (!selectedFile || !uploadDialog) return;

    const { programId, docType } = uploadDialog;
    setIsUploadingEvidence(true);
    setUploadError(null);

    try {
      const serverDocTypeName = DOC_TYPE_TO_SERVER_NAME[docType];

      await academicRepositoryService.uploadEvidenceDocument(
        departmentId || 1,
        user?.id || 1,
        selectedFile,
        {
          academicYear,
          yearOfStudy: selectedYear,
          semester: selectedSemester,
          sectionName: 'add-on-programs',
          recordId: Number(programId),
          documentType: serverDocTypeName,
        }
      );

      await fetchEvidence();
      setUploadDialog(null);
      setSelectedFile(null);
      setUploadError(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to upload evidence document:', err);
      setUploadError(err?.response?.data?.message || err?.message || 'Failed to upload evidence document');
    } finally {
      setIsUploadingEvidence(false);
    }
  }, [selectedFile, uploadDialog, departmentId, user?.id, academicYear, selectedYear, selectedSemester, fetchEvidence]);

  // Preview Evidence Document (fetches blob from API)
  const handlePreviewEvidence = useCallback(async (programId: string, docType: EvidenceDocType) => {
    const ev = programEvidenceMap[programId]?.[docType];
    if (!ev || ev.status !== 'uploaded' || !ev.fileName) return;

    const ext = ev.fileName.split('.').pop()?.toLowerCase() || ev.fileType?.toLowerCase() || 'pdf';
    const fileSizeStr = ev.fileSize ? `${Math.round(ev.fileSize / 1024)} KB` : undefined;

    let url = ev.fileUrl;
    if (!url && ev.id) {
      setPreviewLoadingId(ev.id);
      try {
        const blob = await academicRepositoryService.getEvidenceBlob(ev.id);
        const mimeType = ext === 'pdf'
          ? 'application/pdf'
          : ext === 'png'
          ? 'image/png'
          : ext === 'jpg' || ext === 'jpeg'
          ? 'image/jpeg'
          : blob.type;
        const typedBlob = new Blob([blob], { type: mimeType || 'application/octet-stream' });
        url = URL.createObjectURL(typedBlob);

        setProgramEvidenceMap((prev) => ({
          ...prev,
          [programId]: {
            ...prev[programId],
            [docType]: {
              ...prev[programId]?.[docType],
              fileUrl: url,
            },
          },
        }));
      } catch (err: any) {
        console.warn('Could not fetch blob for preview:', err);
      } finally {
        setPreviewLoadingId(null);
      }
    }

    setPreviewDialog({
      open: true,
      programId,
      docType,
      fileName: ev.fileName,
      fileUrl: url,
      fileType: ext,
      fileSize: fileSizeStr,
      uploadedAt: ev.uploadedAt,
    });
  }, [programEvidenceMap]);

  // Download Evidence Document from backend
  const handleDownloadEvidence = useCallback(async (programId: string, docType: EvidenceDocType) => {
    const ev = programEvidenceMap[programId]?.[docType];
    if (!ev || ev.status !== 'uploaded') return;

    const fileName = ev.fileName || `${DOC_TYPE_TO_SERVER_NAME[docType]}.pdf`;

    if (ev.id) {
      setDownloadingEvidenceId(ev.id);
      try {
        await academicRepositoryService.downloadEvidenceDocument(ev.id, fileName);
      } catch (err: any) {
        console.error('Download evidence failed:', err);
        if (ev.fileUrl) {
          window.open(ev.fileUrl, '_blank');
        } else {
          alert('Failed to download document');
        }
      } finally {
        setDownloadingEvidenceId(null);
      }
    } else if (ev.fileUrl) {
      window.open(ev.fileUrl, '_blank');
    }
  }, [programEvidenceMap]);

  // Delete Evidence Handlers
  const handleDeleteEvidenceClick = useCallback((program: AddOnProgramRecord, docType: EvidenceDocType) => {
    const ev = programEvidenceMap[program.id]?.[docType];
    if (ev && ev.status === 'uploaded' && ev.id) {
      setDeleteTargetEvidence({
        evidenceId: ev.id,
        programId: program.id,
        programName: program.topic,
        docType,
        fileName: ev.fileName || DOC_TYPE_TO_SERVER_NAME[docType],
      });
    }
  }, [programEvidenceMap]);

  const handleConfirmDeleteEvidence = useCallback(async () => {
    if (!deleteTargetEvidence) return;
    setIsDeletingEvidence(true);
    try {
      await academicRepositoryService.deleteEvidenceDocument(
        deleteTargetEvidence.evidenceId,
        departmentId || 1
      );
      await fetchEvidence();
      setDeleteTargetEvidence(null);
    } catch (err: any) {
      console.error('Failed to delete evidence document:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to delete evidence document');
    } finally {
      setIsDeletingEvidence(false);
    }
  }, [deleteTargetEvidence, departmentId, fetchEvidence]);

  const [selectedCsvFile, setSelectedCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // Download CSV Template
  const handleDownloadTemplate = useCallback(() => {
    const currentPrograms = programs.filter(
      (p) => p.year === selectedYear && p.semester === selectedSemester
    );
    const headers = 'Topic,From Date,To Date,Time From,Time To,Coordinator,Duration,Students Enrolled,Students Participated,Certification Provided,Certificates Issued';

    let csvRows: string[] = [];
    if (currentPrograms.length > 0) {
      csvRows = currentPrograms.map((p) => {
        const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
        return [
          escape(p.topic),
          escape(p.fromDate),
          escape(p.toDate),
          escape(p.timeFrom),
          escape(p.timeTo),
          escape(p.coordinator),
          escape(p.duration),
          p.studentsEnrolled || '0',
          p.studentsParticipated || '0',
          p.certificationProvided,
          p.certificatesIssued || '0',
        ].join(',');
      });
    } else {
      csvRows.push('"Python for Data Science","2026-01-15","2026-01-20","09:00","12:00","Dr. Anita Sharma","30 Hours",120,115,Yes,110');
      csvRows.push('"AWS Cloud Practitioner","2026-02-01","2026-02-10","14:00","17:00","Mr. Anil Reddy","40 Hours",80,75,Yes,70');
    }

    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `addon_programs_${academicYear}_${selectedYear.replace(/\s+/g, '_')}_${selectedSemester.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [programs, selectedYear, selectedSemester, academicYear]);

  // Upload CSV
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setSelectedCsvFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((line) => line.trim());
        if (lines.length < 2) return;

        const headers = parseCSVLine(lines[0]);

        const parsed: AddOnProgramRecord[] = [];
        let validCount = 0;
        let invalidCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h.trim()] = values[idx]?.trim() || '';
          });

          const getField = (...keys: string[]) => {
            for (const key of keys) {
              for (const [k, v] of Object.entries(row)) {
                if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === key.toLowerCase().replace(/[^a-z0-9]/g, '')) {
                  return v;
                }
              }
            }
            return '';
          };

          const topic = getField('Topic', 'Program Name', 'Course Name', 'ProgramTopic');
          const fromDate = getField('From Date', 'FromDate', 'Start Date', 'StartDate');
          const toDate = getField('To Date', 'ToDate', 'End Date', 'EndDate');
          const timeFrom = getField('Time From', 'TimeFrom', 'StartTime');
          const timeTo = getField('Time To', 'TimeTo', 'EndTime');
          const coordinator = getField('Coordinator', 'Instructor', 'Faculty', 'Program Coordinator');
          const duration = getField('Duration', 'Hours');
          const studentsEnrolled = getField('Students Enrolled', 'Enrolled', 'StudentsEnrolled') || '0';
          const studentsParticipated = getField('Students Participated', 'Participated', 'StudentsParticipated') || '0';
          const certRaw = getField('Certification Provided', 'Certification', 'Cert');
          const certificationProvided: 'Yes' | 'No' = certRaw.toLowerCase() === 'yes' || certRaw.toLowerCase() === 'true' ? 'Yes' : 'No';
          const certificatesIssued = getField('Certificates Issued', 'Issued', 'CertificatesIssued') || '0';
          const yearVal = getField('Year', 'Year of Study', 'YearOfStudy') || selectedYear;
          const semVal = getField('Semester', 'Sem') || selectedSemester;

          const errors: string[] = [];

          if (!topic) errors.push('Topic is mandatory');
          if (!fromDate) errors.push('From Date is mandatory');
          if (!toDate) errors.push('To Date is mandatory');
          if (!coordinator) errors.push('Coordinator is mandatory');

          const programRecord: AddOnProgramRecord = {
            id: `upload-${Date.now()}-${i}`,
            department,
            year: yearVal,
            semester: semVal,
            topic,
            fromDate,
            toDate,
            timeFrom,
            timeTo,
            coordinator,
            duration,
            studentsEnrolled,
            studentsParticipated,
            certificationProvided,
            certificatesIssued,
            validationStatus: errors.length > 0 ? 'invalid' : 'valid',
            errors: errors.length > 0 ? errors : undefined,
          };

          if (errors.length > 0) {
            invalidCount++;
          } else {
            validCount++;
          }

          parsed.push(programRecord);
        }

        setUploadPreview(parsed);
        setUploadStats({ total: parsed.length, valid: validCount, invalid: invalidCount });
        setShowUploadDialog(true);
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [department, selectedYear, selectedSemester]
  );

  // Import uploaded programs via live API
  const handleImportUploaded = useCallback(async () => {
    const validPrograms = uploadPreview.filter((p) => p.validationStatus === 'valid');
    if (validPrograms.length === 0) return;

    setIsImporting(true);
    try {
      const targetYear = validPrograms[0]?.year || selectedYear;
      const targetSem = validPrograms[0]?.semester || selectedSemester;

      const programsPayload = validPrograms.map((p) => ({
        academicYear,
        yearOfStudy: p.year || targetYear,
        semester: p.semester || targetSem,
        topic: p.topic,
        coordinator: p.coordinator,
        fromDate: formatDateToISO(p.fromDate) || undefined,
        toDate: formatDateToISO(p.toDate) || undefined,
        timeFrom: formatTimeTo24h(p.timeFrom) || undefined,
        timeTo: formatTimeTo24h(p.timeTo) || undefined,
        duration: p.duration || undefined,
        studentsEnrolled: p.studentsEnrolled ? parseInt(p.studentsEnrolled) : 0,
        studentsParticipated: p.studentsParticipated ? parseInt(p.studentsParticipated) : 0,
        certificationProvided: p.certificationProvided === 'Yes',
        certificatesIssued: p.certificatesIssued ? parseInt(p.certificatesIssued) : 0,
      }));

      await academicRepositoryService.bulkSaveAddOnPrograms(departmentId || 1, {
        academicYear,
        yearOfStudy: targetYear,
        semester: targetSem,
        programs: programsPayload,
      });

      if (targetYear && YEARS_OF_STUDY.includes(targetYear)) {
        setSelectedYear(targetYear);
      }
      if (targetSem) {
        setSelectedSemester(targetSem);
      }

      await fetchPrograms();
      setShowUploadDialog(false);
      setUploadPreview([]);
      setUploadStats(null);
      setSelectedCsvFile(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to import add-on programs:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to import add-on programs');
    } finally {
      setIsImporting(false);
    }
  }, [uploadPreview, academicYear, departmentId, selectedYear, selectedSemester, fetchPrograms]);

  const [submitting, setSubmitting] = useState(false);
  const [deleteTargetProgram, setDeleteTargetProgram] = useState<AddOnProgramRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add/Edit program handlers via live API
  const handleAddProgram = useCallback(async () => {
    if (!newProgram.topic || !newProgram.coordinator) return;

    setSubmitting(true);
    try {
      const payload = {
        academicYear,
        yearOfStudy: selectedYear,
        semester: selectedSemester,
        topic: newProgram.topic,
        coordinator: newProgram.coordinator,
        fromDate: formatDateToISO(newProgram.fromDate) || undefined,
        toDate: formatDateToISO(newProgram.toDate) || undefined,
        timeFrom: formatTimeTo24h(newProgram.timeFrom) || undefined,
        timeTo: formatTimeTo24h(newProgram.timeTo) || undefined,
        duration: newProgram.duration || undefined,
        studentsEnrolled: newProgram.studentsEnrolled ? parseInt(newProgram.studentsEnrolled) : 0,
        studentsParticipated: newProgram.studentsParticipated ? parseInt(newProgram.studentsParticipated) : 0,
        certificationProvided: newProgram.certificationProvided === 'Yes',
        certificatesIssued: newProgram.certificatesIssued ? parseInt(newProgram.certificatesIssued) : 0,
      };

      if (editingProgram && editingProgram.id) {
        await academicRepositoryService.updateAddOnProgram(editingProgram.id, departmentId || 1, payload);
      } else {
        await academicRepositoryService.createAddOnProgram(departmentId || 1, payload);
      }

      await fetchPrograms();
      setNewProgram({
        topic: '',
        fromDate: '',
        toDate: '',
        timeFrom: '',
        timeTo: '',
        coordinator: '',
        duration: '',
        studentsEnrolled: '',
        studentsParticipated: '',
        certificationProvided: 'Yes',
        certificatesIssued: '',
      });
      setShowAddDialog(false);
      setEditingProgram(null);
    } catch (err: any) {
      console.error('Failed to save add-on program:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to save add-on program');
    } finally {
      setSubmitting(false);
    }
  }, [newProgram, editingProgram, departmentId, academicYear, selectedYear, selectedSemester, fetchPrograms]);

  // Edit program
  const handleEditProgram = useCallback((program: AddOnProgramRecord) => {
    setEditingProgram(program);
    setNewProgram({
      topic: program.topic,
      fromDate: program.fromDate,
      toDate: program.toDate,
      timeFrom: program.timeFrom,
      timeTo: program.timeTo,
      coordinator: program.coordinator,
      duration: program.duration,
      studentsEnrolled: program.studentsEnrolled,
      studentsParticipated: program.studentsParticipated,
      certificationProvided: program.certificationProvided,
      certificatesIssued: program.certificatesIssued,
    });
    setShowAddDialog(true);
  }, []);

  // Delete program
  const handleDeleteProgram = useCallback((program: AddOnProgramRecord) => {
    setDeleteTargetProgram(program);
  }, []);

  // Confirm delete handler via live API
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTargetProgram) return;
    setIsDeleting(true);
    try {
      await academicRepositoryService.deleteAddOnProgram(deleteTargetProgram.id, departmentId || 1);
      await fetchPrograms();
      setDeleteTargetProgram(null);
    } catch (err: any) {
      console.error('Failed to delete add-on program:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to delete add-on program');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTargetProgram, departmentId, fetchPrograms]);

  // Save Programs
  const handleSavePrograms = useCallback(async () => {
    setIsBulkSaving(true);
    try {
      const forCurrentYearSem = programs.filter(
        (p) => p.year === selectedYear && p.semester === selectedSemester
      );
      const programsPayload = forCurrentYearSem.map((p) => ({
        academicYear,
        yearOfStudy: selectedYear,
        semester: selectedSemester,
        topic: p.topic,
        coordinator: p.coordinator,
        fromDate: formatDateToISO(p.fromDate) || undefined,
        toDate: formatDateToISO(p.toDate) || undefined,
        timeFrom: formatTimeTo24h(p.timeFrom) || undefined,
        timeTo: formatTimeTo24h(p.timeTo) || undefined,
        duration: p.duration || undefined,
        studentsEnrolled: p.studentsEnrolled ? parseInt(p.studentsEnrolled) : 0,
        studentsParticipated: p.studentsParticipated ? parseInt(p.studentsParticipated) : 0,
        certificationProvided: p.certificationProvided === 'Yes',
        certificatesIssued: p.certificatesIssued ? parseInt(p.certificatesIssued) : 0,
      }));

      await academicRepositoryService.bulkSaveAddOnPrograms(departmentId || 1, {
        academicYear,
        yearOfStudy: selectedYear,
        semester: selectedSemester,
        programs: programsPayload,
      });

      await fetchPrograms();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to bulk save add-on programs:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to save add-on programs');
    } finally {
      setIsBulkSaving(false);
    }
  }, [programs, selectedYear, selectedSemester, academicYear, departmentId, fetchPrograms]);

  const totalProgramsForYearSem = programs.filter(
    (p) => p.year === selectedYear && p.semester === selectedSemester
  ).length;

  const availableSemesters = SEMESTERS_MAP[selectedYear] || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Add-on Programs</h2>
              <p className="text-xs text-muted-foreground">
                Manage add-on programs for each year and semester — upload via CSV or add manually
              </p>
            </div>
          </div>
        </div>

        {/* Context Selector Cards - Student Repository Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-blue-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Department</span>
            </div>
            <p className="text-sm font-semibold text-white truncate">{department}</p>
          </div>
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-4 w-4 text-purple-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Academic Year</span>
            </div>
            <p className="text-sm font-semibold text-purple-300 truncate">{academicYear}</p>
          </div>
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Year</span>
            </div>
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="h-7 border-0 bg-transparent p-0 text-sm font-semibold text-emerald-300 shadow-none focus:ring-0 [&>svg]:text-slate-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS_OF_STUDY.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative p-4 rounded-xl border border-border/60 bg-gradient-to-br from-slate-900/80 to-slate-800/80 dark:from-slate-800/60 dark:to-slate-900/60 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Semester</span>
            </div>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="h-7 border-0 bg-transparent p-0 text-sm font-semibold text-amber-300 shadow-none focus:ring-0 [&>svg]:text-slate-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableSemesters.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
              <Download className="h-3.5 w-3.5" />
              Download CSV Template
            </Button>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-3.5 w-3.5" />
                Upload CSV
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setEditingProgram(null); setNewProgram({ topic: '', fromDate: '', toDate: '', timeFrom: '', timeTo: '', coordinator: '', duration: '', studentsEnrolled: '', studentsParticipated: '', certificationProvided: 'Yes', certificatesIssued: '' }); setShowAddDialog(true); }} className="gap-2">
              <Plus className="h-3.5 w-3.5" />
              Add Program
            </Button>
            <div className="ml-auto">
              <Button
                size="sm"
                onClick={handleSavePrograms}
                disabled={totalProgramsForYearSem === 0 || isBulkSaving}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
              >
                {isBulkSaving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save Programs
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Success Message */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-700">Programs Saved Successfully</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Total Programs: {totalProgramsForYearSem} • {selectedYear} / {selectedSemester}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by topic or coordinator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={filterCertification} onValueChange={setFilterCertification}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-2" />
            <SelectValue placeholder="Certification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            <SelectItem value="Yes">Certified</SelectItem>
            <SelectItem value="No">Non-Certified</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">
          {filteredPrograms.length} Programs
        </Badge>
      </div>

      {/* Programs Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            Add-on Programs — {selectedYear} / {selectedSemester}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-500 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">Loading add-on programs...</p>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Award className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No programs added yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a CSV or add programs manually for {selectedYear} / {selectedSemester}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table className="min-w-[1100px]">
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-semibold w-8 sticky left-0 bg-muted/30 z-10">#</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">Topic</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">From Date</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">To Date</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">Time</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">Coordinator</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Duration</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Enrolled</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Participated</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Cert.</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Issued</TableHead>
                    <TableHead className="text-xs font-semibold text-right whitespace-nowrap sticky right-0 bg-muted/30 z-10">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrograms.map((program, idx) => (
                    <TableRow key={program.id} className="hover:bg-muted/50">
                      <TableCell className="text-xs text-muted-foreground sticky left-0 bg-background z-10">{idx + 1}</TableCell>
                      <TableCell className="text-xs font-medium whitespace-nowrap">{program.topic}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{program.fromDate}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{program.toDate}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{program.timeFrom} - {program.timeTo}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{program.coordinator}</TableCell>
                      <TableCell className="text-xs text-center whitespace-nowrap">{program.duration}</TableCell>
                      <TableCell className="text-xs text-center font-medium whitespace-nowrap">{program.studentsEnrolled}</TableCell>
                      <TableCell className="text-xs text-center font-medium whitespace-nowrap">{program.studentsParticipated}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <Badge variant="outline" className={cn('text-[10px]',
                          program.certificationProvided === 'Yes' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                        )}>
                          {program.certificationProvided}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-center font-semibold whitespace-nowrap">{program.certificatesIssued}</TableCell>
                      <TableCell className="text-right sticky right-0 bg-background z-10">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditProgram(program)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteProgram(program)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Program Evidence Section */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              Program Evidence — {selectedYear} / {selectedSemester}
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">{filteredPrograms.length} programs</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Upload evidence documents for each program: Geo-tagged Photos, Registered Students List, Attended Students List
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredPrograms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">No programs to show evidence for. Add programs first.</p>
            </div>
          ) : (
            filteredPrograms.map((program) => {
              const programEvidence = programEvidenceMap[program.id] || {
                geoTaggedPhotos: { status: 'not-uploaded' },
                registeredStudentsList: { status: 'not-uploaded' },
                attendedStudentsList: { status: 'not-uploaded' },
              };
              const evidenceItems = [
                { key: 'geoTaggedPhotos' as const, label: 'Geo-tagged Photos of Session', icon: '📸', data: programEvidence.geoTaggedPhotos },
                { key: 'registeredStudentsList' as const, label: 'Registered Students List', icon: '📋', data: programEvidence.registeredStudentsList },
                { key: 'attendedStudentsList' as const, label: 'Attended Students List', icon: '✅', data: programEvidence.attendedStudentsList },
              ];
              return (
                <div key={program.id} className="rounded-lg border border-border/60 overflow-hidden">
                  {/* Program Header */}
                  <div className="bg-muted/30 px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-semibold">{program.topic}</span>
                      <Badge variant="outline" className="text-[9px] ml-1">
                        {program.fromDate} — {program.toDate}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {evidenceItems.filter((ei) => ei.data.status === 'uploaded').length === 3 ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px]">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> All Uploaded
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px]">
                          {evidenceItems.filter((ei) => ei.data.status === 'uploaded').length}/3 Uploaded
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* Evidence Documents */}
                  <div className="divide-y divide-border/40">
                    {evidenceItems.map((item) => (
                      <div key={item.key} className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-sm">{item.icon}</span>
                          <div>
                            <p className="text-xs font-medium">{item.label}</p>
                            {item.data.status === 'uploaded' && item.data.fileName ? (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {item.data.fileName} • Uploaded {item.data.uploadedAt || ''}
                              </p>
                            ) : (
                              <p className="text-[10px] text-muted-foreground mt-0.5">Not uploaded yet</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {item.data.status === 'uploaded' ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[10px] gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                                disabled={previewLoadingId === item.data.id}
                                onClick={() => handlePreviewEvidence(program.id, item.key)}
                              >
                                {previewLoadingId === item.data.id
                                  ? <RefreshCw className="h-3 w-3 animate-spin" />
                                  : <Eye className="h-3 w-3" />}
                                {previewLoadingId === item.data.id ? 'Loading...' : 'Preview'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[10px] gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                disabled={downloadingEvidenceId === item.data.id}
                                onClick={() => handleDownloadEvidence(program.id, item.key)}
                              >
                                {downloadingEvidenceId === item.data.id
                                  ? <RefreshCw className="h-3 w-3 animate-spin" />
                                  : <DownloadCloud className="h-3 w-3" />}
                                {downloadingEvidenceId === item.data.id ? 'Downloading...' : 'Download'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[10px] gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
                                onClick={() => handleUploadEvidence(program.id, item.key)}
                              >
                                <RefreshCw className="h-3 w-3" /> Re-upload
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[10px] gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleDeleteEvidenceClick(program, item.key)}
                              >
                                <Trash2 className="h-3 w-3" /> Delete
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              className="h-7 px-3 text-[10px] gap-1 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleUploadEvidence(program.id, item.key)}
                            >
                              <Upload className="h-3 w-3" /> Upload
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Future Integration Info */}
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Future Integration</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Program Brochure PDF',
              'Attendance Sheets',
              'Excel Export',
              'NAAC Evidence (1.3.2)',
              'Certificate Templates',
              'Feedback Forms',
            ].map((item) => (
              <Badge key={item} variant="outline" className="text-[10px] bg-background">
                {item}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Program Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setEditingProgram(null); } }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="shrink-0 pb-2">
            <DialogTitle className="text-base">{editingProgram ? 'Edit Program' : 'Add Program'}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 py-2 min-h-0">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Department</Label>
                <p className="text-sm font-medium mt-1">{department}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Academic Year</Label>
                <p className="text-sm font-medium mt-1">{academicYear}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Year</Label>
                <p className="text-sm font-medium mt-1">{selectedYear}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Semester</Label>
                <p className="text-sm font-medium mt-1">{selectedSemester}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Topic *</Label>
                <Input
                  value={newProgram.topic}
                  onChange={(e) => setNewProgram({ ...newProgram, topic: e.target.value })}
                  placeholder="e.g., Python for Data Science"
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">From Date *</Label>
                  <div className="mt-1">
                    <DatePicker
                      value={newProgram.fromDate}
                      onChange={(v) => setNewProgram({ ...newProgram, fromDate: v })}
                      placeholder="Select start date"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">To Date *</Label>
                  <div className="mt-1">
                    <DatePicker
                      value={newProgram.toDate}
                      onChange={(v) => setNewProgram({ ...newProgram, toDate: v })}
                      placeholder="Select end date"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Time From</Label>
                  <div className="mt-1">
                    <TimePicker
                      value={newProgram.timeFrom}
                      onChange={(v) => setNewProgram({ ...newProgram, timeFrom: v })}
                      placeholder="Start time"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Time To</Label>
                  <div className="mt-1">
                    <TimePicker
                      value={newProgram.timeTo}
                      onChange={(v) => setNewProgram({ ...newProgram, timeTo: v })}
                      placeholder="End time"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Coordinator *</Label>
                  <Input
                    value={newProgram.coordinator}
                    onChange={(e) => setNewProgram({ ...newProgram, coordinator: e.target.value })}
                    placeholder="e.g., Dr. Anita Sharma"
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Duration</Label>
                  <Input
                    value={newProgram.duration}
                    onChange={(e) => setNewProgram({ ...newProgram, duration: e.target.value })}
                    placeholder="e.g., 30 Hours"
                    className="mt-1 h-9 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Students Enrolled</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newProgram.studentsEnrolled}
                    onChange={(e) => setNewProgram({ ...newProgram, studentsEnrolled: e.target.value })}
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Students Participated</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newProgram.studentsParticipated}
                    onChange={(e) => setNewProgram({ ...newProgram, studentsParticipated: e.target.value })}
                    className="mt-1 h-9 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Certification Provided</Label>
                  <Select value={newProgram.certificationProvided} onValueChange={(v) => setNewProgram({ ...newProgram, certificationProvided: v as 'Yes' | 'No' })}>
                    <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Certificates Issued</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newProgram.certificatesIssued}
                    onChange={(e) => setNewProgram({ ...newProgram, certificatesIssued: e.target.value })}
                    className="mt-1 h-9 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 pt-3 border-t mt-2">
            <Button variant="outline" size="sm" onClick={() => { setShowAddDialog(false); setEditingProgram(null); }} disabled={submitting}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddProgram}
              disabled={submitting || !newProgram.topic || !newProgram.fromDate || !newProgram.toDate || !newProgram.coordinator}
            >
              {submitting ? 'Saving...' : editingProgram ? 'Update Program' : 'Add Program'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Preview Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-5xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="shrink-0 pb-2">
            <DialogTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4" />
              CSV Upload Preview
            </DialogTitle>
          </DialogHeader>
          {uploadStats && (
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              {/* Upload Stats */}
              <div className="flex items-center gap-4 shrink-0">
                <Card className="flex-1 border-border/50">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg font-bold">{uploadStats.total}</p>
                    <p className="text-[10px] text-muted-foreground">Records Found</p>
                  </CardContent>
                </Card>
                <Card className="flex-1 border-green-500/30 bg-green-500/5">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg font-bold text-green-600">{uploadStats.valid}</p>
                    <p className="text-[10px] text-green-600">Valid</p>
                  </CardContent>
                </Card>
                <Card className="flex-1 border-red-500/30 bg-red-500/5">
                  <CardContent className="p-3 text-center">
                    <p className="text-lg font-bold text-red-600">{uploadStats.invalid}</p>
                    <p className="text-[10px] text-red-600">Invalid</p>
                  </CardContent>
                </Card>
              </div>

              {uploadStats.valid > 0 && uploadStats.invalid === 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <p className="text-xs text-green-700 font-medium">CSV Uploaded Successfully — All records are valid</p>
                </div>
              )}

              {/* Preview Table */}
              <div className="flex-1 overflow-x-auto overflow-y-auto border rounded-lg min-h-0 max-h-[45vh]">
                <Table className="min-w-[850px]">
                  <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 shadow-sm">
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-semibold w-8">#</TableHead>
                      <TableHead className="text-xs font-semibold whitespace-nowrap">Topic</TableHead>
                      <TableHead className="text-xs font-semibold whitespace-nowrap">From</TableHead>
                      <TableHead className="text-xs font-semibold whitespace-nowrap">To</TableHead>
                      <TableHead className="text-xs font-semibold whitespace-nowrap">Coordinator</TableHead>
                      <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Duration</TableHead>
                      <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Enrolled</TableHead>
                      <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Cert.</TableHead>
                      <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Valid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadPreview.map((program, idx) => (
                      <TableRow
                        key={program.id}
                        className={cn(
                          program.validationStatus === 'invalid' && 'bg-red-500/5 border-l-2 border-l-red-500'
                        )}
                      >
                        <TableCell className="text-xs">{idx + 1}</TableCell>
                        <TableCell className="text-xs font-medium max-w-[150px] truncate">{program.topic}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{program.fromDate}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{program.toDate}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{program.coordinator}</TableCell>
                        <TableCell className="text-xs text-center whitespace-nowrap">{program.duration}</TableCell>
                        <TableCell className="text-xs text-center whitespace-nowrap">{program.studentsEnrolled}</TableCell>
                        <TableCell className="text-xs text-center whitespace-nowrap">{program.certificationProvided}</TableCell>
                        <TableCell className="text-center">
                          {program.validationStatus === 'valid' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <div className="flex items-center gap-1 justify-center">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-[9px] text-red-600 max-w-[120px] truncate" title={program.errors?.join(', ')}>
                                {program.errors?.[0]}
                              </span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Validation Errors Summary */}
              {uploadStats.invalid > 0 && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 shrink-0">
                  <p className="text-xs font-semibold text-red-700 mb-2">Validation Errors</p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {uploadPreview
                      .filter((p) => p.validationStatus === 'invalid')
                      .map((p, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <X className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                          <p className="text-[11px] text-red-600">
                            Row {uploadPreview.indexOf(p) + 1}: {p.errors?.join('; ')}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="mt-4 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setShowUploadDialog(false)} disabled={isImporting}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleImportUploaded}
              disabled={!uploadStats || uploadStats.valid === 0 || isImporting}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${uploadStats?.valid || 0} Valid Records`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evidence Upload Dialog with Drag & Drop */}
      {uploadDialog && (
        <Dialog open={uploadDialog.open} onOpenChange={(open) => { if (!open) { setUploadDialog(null); setSelectedFile(null); setUploadError(null); } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">
                Upload Evidence Document
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {uploadDialog.docType === 'geoTaggedPhotos' && 'Geo-tagged Photos of Session'}
                {uploadDialog.docType === 'registeredStudentsList' && 'Registered Students List'}
                {uploadDialog.docType === 'attendedStudentsList' && 'Attended Students List'}
              </p>
            </DialogHeader>
            <div className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => dropZoneInputRef.current?.click()}
                className={cn(
                  'relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200',
                  dragOver
                    ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                    : 'border-border/60 hover:border-emerald-400 hover:bg-muted/50',
                  selectedFile && !uploadError && 'border-emerald-500/50 bg-emerald-50/30'
                )}
              >
                {selectedFile && !uploadError ? (
                  <>
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-emerald-700">{selectedFile.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Ready to upload
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px] text-muted-foreground h-6"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    >
                      Change file
                    </Button>
                  </>
                ) : (
                  <>
                    <div className={cn(
                      'h-12 w-12 rounded-full flex items-center justify-center transition-colors',
                      dragOver ? 'bg-emerald-100' : 'bg-muted/50'
                    )}>
                      <Upload className={cn('h-6 w-6', dragOver ? 'text-emerald-600' : 'text-muted-foreground')} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {dragOver ? 'Drop file here' : 'Drag & drop your file here'}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        or click to browse files
                      </p>
                    </div>
                  </>
                )}
                <input
                  ref={dropZoneInputRef}
                  type="file"
                  accept={getAllowedTypes(uploadDialog.docType).extensions.join(',')}
                  onChange={handleDropZoneFileChange}
                  className="hidden"
                />
              </div>

              {/* Allowed File Types Info */}
              <div className="rounded-lg bg-muted/30 border border-border/40 p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Accepted File Types
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {getAllowedTypes(uploadDialog.docType).extensions.map((ext) => (
                    <Badge key={ext} variant="outline" className="text-[9px] font-mono bg-background">
                      {ext}
                    </Badge>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Maximum file size: 10 MB</p>
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-red-700">Invalid File</p>
                    <p className="text-[10px] text-red-600 mt-0.5">{uploadError}</p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => { setUploadDialog(null); setSelectedFile(null); setUploadError(null); }}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!selectedFile || !!uploadError || isUploadingEvidence}
                onClick={handleConfirmUpload}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                {isUploadingEvidence ? (
                  <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="h-3.5 w-3.5" /> Upload File</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Evidence Preview Dialog */}
      {previewDialog && (
        <Dialog open={previewDialog.open} onOpenChange={(open) => { if (!open) setPreviewDialog(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Document Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Render actual file preview */}
              {previewDialog.fileUrl ? (
                previewDialog.fileType === 'pdf' ? (
                  <iframe
                    src={previewDialog.fileUrl}
                    className="w-full rounded-lg border"
                    style={{ height: '480px' }}
                    title={previewDialog.fileName}
                  />
                ) : (['png', 'jpg', 'jpeg', 'webp', 'heic'].includes(previewDialog.fileType || '')) ? (
                  <img
                    src={previewDialog.fileUrl}
                    alt={previewDialog.fileName}
                    className="w-full rounded-lg border object-contain max-h-[480px]"
                  />
                ) : (
                  <div className="rounded-lg border p-6 bg-muted/20 flex flex-col items-center justify-center gap-3">
                    <FileText className="h-12 w-12 text-emerald-600/60" />
                    <p className="text-sm font-medium">{previewDialog.fileName}</p>
                    <p className="text-xs text-muted-foreground">Preview not available. Download to view.</p>
                  </div>
                )
              ) : (
                <div className="rounded-lg border p-6 bg-muted/20 flex flex-col items-center justify-center gap-3">
                  <FileText className="h-12 w-12 text-emerald-600/60" />
                  <p className="text-sm font-medium">{previewDialog.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {previewDialog.docType === 'geoTaggedPhotos' && 'Geo-tagged Photos of Session'}
                    {previewDialog.docType === 'registeredStudentsList' && 'Registered Students List'}
                    {previewDialog.docType === 'attendedStudentsList' && 'Attended Students List'}
                  </p>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    Uploaded Successfully
                  </Badge>
                </div>
              )}
              {/* File info row */}
              {(previewDialog.fileSize || previewDialog.uploadedAt) && (
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  {previewDialog.fileSize && <span>Size: {previewDialog.fileSize}</span>}
                  {previewDialog.uploadedAt && <span>Uploaded: {previewDialog.uploadedAt}</span>}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewDialog(null)}>
                  Close
                </Button>
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                  handleDownloadEvidence(previewDialog.programId, previewDialog.docType);
                }}>
                  <DownloadCloud className="h-3.5 w-3.5" /> Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Evidence Confirmation Dialog */}
      <AlertDialog open={!!deleteTargetEvidence} onOpenChange={(open) => !open && setDeleteTargetEvidence(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 mt-0.5">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="space-y-1">
                <AlertDialogTitle className="text-base font-semibold">
                  Delete Evidence Document
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground">
                  Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteTargetEvidence?.fileName}"</span> from <span className="font-semibold text-foreground">{deleteTargetEvidence?.programName}</span>? This cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel disabled={isDeletingEvidence} onClick={() => setDeleteTargetEvidence(null)}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeletingEvidence}
              onClick={handleConfirmDeleteEvidence}
              className="bg-red-600 hover:bg-red-700 text-white font-medium gap-2"
            >
              {isDeletingEvidence ? (
                <><Trash2 className="h-3.5 w-3.5 animate-spin" /> Deleting...</>
              ) : (
                'Delete Document'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTargetProgram} onOpenChange={(open) => !open && setDeleteTargetProgram(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 mt-0.5">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="space-y-1">
                <AlertDialogTitle className="text-base font-semibold">
                  Delete Add-on Program
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground">
                  Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteTargetProgram?.topic}"</span>? This program will be permanently removed.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel disabled={isDeleting} onClick={() => setDeleteTargetProgram(null)}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-medium gap-2"
            >
              {isDeleting ? (
                <>
                  <Trash2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Program'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
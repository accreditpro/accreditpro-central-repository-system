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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { ScrollArea } from '@/components/ui/scroll-area';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useReadOnly } from '@/hooks/useReadOnly';
import { academicRepositoryService } from '@/services/academic-repository.service';
import {
  BookOpen,
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
} from 'lucide-react';

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

interface ValueAddedCourseRecord {
  id: string;
  department: string;
  year: string;
  semester: string;
  courseName: string;
  fromDate: string;
  toDate: string;
  timeFrom: string;
  timeTo: string;
  courseInstructor: string;
  duration: string;
  studentsEnrolled: string;
  studentsParticipated: string;
  certificationProvided: 'Yes' | 'No';
  certificatesIssued: string;
  validationStatus?: 'valid' | 'invalid';
  errors?: string[];
}

interface CourseEvidenceItem {
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

interface CourseEvidenceMap {
  geoTaggedPhotos: CourseEvidenceItem;
  registeredStudentsList: CourseEvidenceItem;
  attendedStudentsList: CourseEvidenceItem;
}

interface ValueAddedCoursesModuleProps {
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

// Evidence types for per-course documents
type EvidenceDocType = 'geoTaggedPhotos' | 'registeredStudentsList' | 'attendedStudentsList';

const DOC_TYPE_TO_SERVER_NAME: Record<EvidenceDocType, string> = {
  geoTaggedPhotos: 'Geo-tagged Photos of Session',
  registeredStudentsList: 'Registered Students List',
  attendedStudentsList: 'Attended Students List',
};

function mapServerDocTypeToFrontendKey(docType: string): EvidenceDocType | null {
  if (!docType) return null;
  const lower = docType.toLowerCase().replace(/[-_\s]/g, '');
  if (lower.includes('photo') || lower.includes('geotag')) return 'geoTaggedPhotos';
  if (lower.includes('register') || lower.includes('enroll')) return 'registeredStudentsList';
  if (lower.includes('attend')) return 'attendedStudentsList';
  return null;
}

function cleanYear(y: string): string {
  let str = (y || '').toLowerCase().trim();
  str = str.replace(/\b1st\b|\bfirst\b|\bi\b/g, 'i');
  str = str.replace(/\b2nd\b|\bsecond\b|\bii\b/g, 'ii');
  str = str.replace(/\b3rd\b|\bthird\b|\biii\b/g, 'iii');
  str = str.replace(/\b4th\b|\bfourth\b|\biv\b/g, 'iv');
  str = str.replace(/\s+year/g, '').trim();
  return str;
}

function cleanSem(s: string): string {
  let str = (s || '').toLowerCase().trim();
  str = str.replace(/\b(viii|8th|8)\b/g, '8');
  str = str.replace(/\b(vii|7th|7)\b/g, '7');
  str = str.replace(/\b(vi|6th|6)\b/g, '6');
  str = str.replace(/\b(v|5th|5)\b/g, '5');
  str = str.replace(/\b(iv|4th|4)\b/g, '4');
  str = str.replace(/\b(iii|3rd|3)\b/g, '3');
  str = str.replace(/\b(ii|2nd|2)\b/g, '2');
  str = str.replace(/\b(i|1st|1)\b/g, '1');
  str = str.replace(/^(semester|sem)\s*/i, '').trim();
  return str;
}

export const ValueAddedCoursesModule = ({
  department,
  academicYear,
  departmentId = 1,
}: ValueAddedCoursesModuleProps) => {
  const { user } = useAuth();
  const isReadOnly = useReadOnly();

  const [selectedYear, setSelectedYear] = useState('III Year');
  const [selectedSemester, setSelectedSemester] = useState('Semester 5');
  const [courses, setCourses] = useState<ValueAddedCourseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCertification, setFilterCertification] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ValueAddedCourseRecord | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<ValueAddedCourseRecord[]>([]);
  const [uploadStats, setUploadStats] = useState<{ total: number; valid: number; invalid: number } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Per-course evidence state
  const [courseEvidenceMap, setCourseEvidenceMap] = useState<Record<string, CourseEvidenceMap>>({});
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    courseId: string;
    docType: EvidenceDocType;
    fileName: string;
    fileUrl?: string;
    fileType?: string;
    fileSize?: string;
    uploadedAt?: string;
  } | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | number | null>(null);
  const [uploadEvidenceDialog, setUploadEvidenceDialog] = useState<{ open: boolean; courseId: string; docType: EvidenceDocType } | null>(null);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [downloadingEvidenceId, setDownloadingEvidenceId] = useState<string | number | null>(null);
  const [deleteTargetEvidence, setDeleteTargetEvidence] = useState<{
    evidenceId: number | string;
    courseId: string;
    courseName: string;
    docType: EvidenceDocType;
    fileName: string;
  } | null>(null);
  const [isDeletingEvidence, setIsDeletingEvidence] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dropZoneInputRef = useRef<HTMLInputElement>(null);

  // New course form state
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    fromDate: '',
    toDate: '',
    timeFrom: '',
    timeTo: '',
    courseInstructor: '',
    duration: '',
    studentsEnrolled: '',
    studentsParticipated: '',
    certificationProvided: 'Yes' as 'Yes' | 'No',
    certificatesIssued: '',
  });

  // Fetch Value Added Courses from live API
  const fetchCourses = useCallback(async () => {
    if (!departmentId || !academicYear) return;
    setLoading(true);
    try {
      const res = await academicRepositoryService.getValueAddedCourses(academicYear, departmentId);
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

      const mapped: ValueAddedCourseRecord[] = items.map((item: any) => ({
        id: String(item.id),
        department: item.department || department,
        year: item.yearOfStudy || item.year || selectedYear,
        semester: item.semester || selectedSemester,
        courseName: item.courseName || '',
        fromDate: item.fromDate || '',
        toDate: item.toDate || '',
        timeFrom: typeof item.timeFrom === 'string' ? item.timeFrom : (item.timeFrom ? `${String(item.timeFrom.hour).padStart(2, '0')}:${String(item.timeFrom.minute).padStart(2, '0')}` : ''),
        timeTo: typeof item.timeTo === 'string' ? item.timeTo : (item.timeTo ? `${String(item.timeTo.hour).padStart(2, '0')}:${String(item.timeTo.minute).padStart(2, '0')}` : ''),
        courseInstructor: item.courseInstructor || '',
        duration: item.duration || '',
        studentsEnrolled: item.studentsEnrolled != null ? String(item.studentsEnrolled) : '0',
        studentsParticipated: item.studentsParticipated != null ? String(item.studentsParticipated) : '0',
        certificationProvided: (item.certificationProvided === true || item.certificationProvided === 'Yes') ? 'Yes' : 'No',
        certificatesIssued: item.certificatesIssued != null ? String(item.certificatesIssued) : '0',
      }));
      setCourses(mapped);
    } catch (err: any) {
      console.error('Failed to fetch value added courses:', err);
      setCourses([]);
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
        sectionName: 'value-added-courses',
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

      const newMap: Record<string, CourseEvidenceMap> = {};

      items.forEach((item: any) => {
        const courseId = item.recordId != null ? String(item.recordId) : '';
        if (!courseId) return;

        const docKey = mapServerDocTypeToFrontendKey(item.documentType || item.documentName);
        if (!docKey) return;

        if (!newMap[courseId]) {
          newMap[courseId] = {
            geoTaggedPhotos: { status: 'not-uploaded' },
            registeredStudentsList: { status: 'not-uploaded' },
            attendedStudentsList: { status: 'not-uploaded' },
          };
        }

        const uploadedDate = item.uploadedAt || item.createdAt;
        const formattedDate = uploadedDate
          ? new Date(uploadedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : '';

        newMap[courseId][docKey] = {
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

      setCourseEvidenceMap(newMap);
    } catch (err: any) {
      console.warn('Failed to fetch value added courses evidence:', err);
    } finally {
      setEvidenceLoading(false);
    }
  }, [academicYear, departmentId]);

  useEffect(() => {
    fetchCourses();
    fetchEvidence();
  }, [fetchCourses, fetchEvidence]);

  // Update semester when year changes
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const semesters = SEMESTERS_MAP[year];
    if (semesters && semesters.length > 0) {
      setSelectedSemester(semesters[0]);
    }
  };

  // Filtered courses for selected year/semester
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(
      (c) => cleanYear(c.year) === cleanYear(selectedYear) && cleanSem(c.semester) === cleanSem(selectedSemester)
    );

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.courseName.toLowerCase().includes(q) ||
          c.courseInstructor.toLowerCase().includes(q)
      );
    }

    if (filterCertification && filterCertification !== 'all') {
      filtered = filtered.filter((c) => c.certificationProvided === filterCertification);
    }

    return filtered;
  }, [courses, selectedYear, selectedSemester, searchQuery, filterCertification]);

  // Allowed file types per evidence document type
  const getAllowedTypes = useCallback((docType: EvidenceDocType) => {
    if (docType === 'geoTaggedPhotos') {
      return {
        extensions: ['.pdf', '.png', '.jpg', '.jpeg', '.heic', '.webp'],
        mimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/heic', 'image/webp'],
        label: 'PDF, PNG, JPG, JPEG, HEIC, WebP',
      };
    }
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
    if (file.size > 10 * 1024 * 1024) {
      return 'File size exceeds 10 MB limit.';
    }
    return null;
  }, [getAllowedTypes]);

  // Evidence handlers for per-course documents
  const handleUploadEvidence = useCallback((courseId: string, docType: EvidenceDocType) => {
    setUploadEvidenceDialog({ open: true, courseId, docType });
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
    if (!file || !uploadEvidenceDialog) return;

    const error = validateFile(file, uploadEvidenceDialog.docType);
    if (error) {
      setUploadError(error);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  }, [uploadEvidenceDialog, validateFile]);

  const handleDropZoneFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadEvidenceDialog) return;
    setUploadError(null);

    const error = validateFile(file, uploadEvidenceDialog.docType);
    if (error) {
      setUploadError(error);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  }, [uploadEvidenceDialog, validateFile]);

  // Upload Evidence Document to backend
  const handleConfirmUpload = useCallback(async () => {
    if (!selectedFile || !uploadEvidenceDialog) return;

    const { courseId, docType } = uploadEvidenceDialog;
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
          sectionName: 'value-added-courses',
          recordId: Number(courseId),
          documentType: serverDocTypeName,
        }
      );

      await fetchEvidence();
      setUploadEvidenceDialog(null);
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
  }, [selectedFile, uploadEvidenceDialog, departmentId, user?.id, academicYear, selectedYear, selectedSemester, fetchEvidence]);

  // Preview Evidence Document
  const handlePreviewEvidence = useCallback(async (courseId: string, docType: EvidenceDocType) => {
    const ev = courseEvidenceMap[courseId]?.[docType];
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

        setCourseEvidenceMap((prev) => ({
          ...prev,
          [courseId]: {
            ...prev[courseId],
            [docType]: {
              ...prev[courseId]?.[docType],
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
      courseId,
      docType,
      fileName: ev.fileName,
      fileUrl: url,
      fileType: ext,
      fileSize: fileSizeStr,
      uploadedAt: ev.uploadedAt,
    });
  }, [courseEvidenceMap]);

  // Download Evidence Document from backend
  const handleDownloadEvidence = useCallback(async (courseId: string, docType: EvidenceDocType) => {
    const ev = courseEvidenceMap[courseId]?.[docType];
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
  }, [courseEvidenceMap]);

  // Delete Evidence Handlers
  const handleDeleteEvidenceClick = useCallback((course: ValueAddedCourseRecord, docType: EvidenceDocType) => {
    const ev = courseEvidenceMap[course.id]?.[docType];
    if (ev && ev.status === 'uploaded' && ev.id) {
      setDeleteTargetEvidence({
        evidenceId: ev.id,
        courseId: course.id,
        courseName: course.courseName,
        docType,
        fileName: ev.fileName || DOC_TYPE_TO_SERVER_NAME[docType],
      });
    }
  }, [courseEvidenceMap]);

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

  // CSV Upload handler
  const handleCSVUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) return;

      const records: ValueAddedCourseRecord[] = [];
      let valid = 0;
      let invalid = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        const errors: string[] = [];

        if (!cols[0]?.trim()) errors.push('Course Name is required');
        if (!cols[1]?.trim()) errors.push('From Date is required');
        if (!cols[5]?.trim()) errors.push('Course Instructor is required');

        const record: ValueAddedCourseRecord = {
          id: `csv-${Date.now()}-${i}`,
          department,
          year: selectedYear,
          semester: selectedSemester,
          courseName: cols[0]?.trim() || '',
          fromDate: cols[1]?.trim() || '',
          toDate: cols[2]?.trim() || '',
          timeFrom: cols[3]?.trim() || '',
          timeTo: cols[4]?.trim() || '',
          courseInstructor: cols[5]?.trim() || '',
          duration: cols[6]?.trim() || '',
          studentsEnrolled: cols[7]?.trim() || '0',
          studentsParticipated: cols[8]?.trim() || '0',
          certificationProvided: (cols[9]?.trim()?.toLowerCase() === 'yes' ? 'Yes' : 'No') as 'Yes' | 'No',
          certificatesIssued: cols[10]?.trim() || '0',
          validationStatus: errors.length > 0 ? 'invalid' : 'valid',
          errors: errors.length > 0 ? errors : undefined,
        };

        if (errors.length > 0) invalid++;
        else valid++;
        records.push(record);
      }

      setUploadPreview(records);
      setUploadStats({ total: records.length, valid, invalid });
      setShowUploadDialog(true);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [department, selectedYear, selectedSemester]);

  const handleImportUploaded = useCallback(async () => {
    const validRecords = uploadPreview.filter((r) => r.validationStatus === 'valid');
    if (validRecords.length === 0) return;

    setIsImporting(true);
    try {
      const coursesPayload = validRecords.map((r) => ({
        academicYear,
        yearOfStudy: selectedYear,
        semester: selectedSemester,
        courseName: r.courseName,
        courseInstructor: r.courseInstructor,
        fromDate: formatDateToISO(r.fromDate) || undefined,
        toDate: formatDateToISO(r.toDate) || undefined,
        timeFrom: formatTimeTo24h(r.timeFrom) || undefined,
        timeTo: formatTimeTo24h(r.timeTo) || undefined,
        duration: r.duration || undefined,
        studentsEnrolled: r.studentsEnrolled ? parseInt(r.studentsEnrolled) : 0,
        studentsParticipated: r.studentsParticipated ? parseInt(r.studentsParticipated) : 0,
        certificationProvided: r.certificationProvided === 'Yes',
        certificatesIssued: r.certificatesIssued ? parseInt(r.certificatesIssued) : 0,
      }));

      await academicRepositoryService.bulkSaveValueAddedCourses(departmentId, {
        academicYear,
        yearOfStudy: selectedYear,
        semester: selectedSemester,
        courses: coursesPayload,
      });

      await fetchCourses();
      setShowUploadDialog(false);
      setUploadPreview([]);
      setUploadStats(null);
      setSelectedCsvFile(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      console.error('Failed to import CSV value added courses:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to import courses from CSV');
    } finally {
      setIsImporting(false);
    }
  }, [uploadPreview, departmentId, academicYear, selectedYear, selectedSemester, fetchCourses]);

  const [submitting, setSubmitting] = useState(false);
  const [deleteTargetCourse, setDeleteTargetCourse] = useState<ValueAddedCourseRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add/Edit course handlers via live API
  const handleAddCourse = useCallback(async () => {
    if (!newCourse.courseName || !newCourse.courseInstructor) return;

    setSubmitting(true);
    try {
      const payload = {
        academicYear,
        yearOfStudy: selectedYear,
        semester: selectedSemester,
        courseName: newCourse.courseName,
        courseInstructor: newCourse.courseInstructor,
        fromDate: formatDateToISO(newCourse.fromDate) || undefined,
        toDate: formatDateToISO(newCourse.toDate) || undefined,
        timeFrom: formatTimeTo24h(newCourse.timeFrom) || undefined,
        timeTo: formatTimeTo24h(newCourse.timeTo) || undefined,
        duration: newCourse.duration || undefined,
        studentsEnrolled: newCourse.studentsEnrolled ? parseInt(newCourse.studentsEnrolled) : 0,
        studentsParticipated: newCourse.studentsParticipated ? parseInt(newCourse.studentsParticipated) : 0,
        certificationProvided: newCourse.certificationProvided === 'Yes',
        certificatesIssued: newCourse.certificatesIssued ? parseInt(newCourse.certificatesIssued) : 0,
      };

      if (editingCourse && editingCourse.id) {
        await academicRepositoryService.updateValueAddedCourse(editingCourse.id, departmentId, payload);
      } else {
        await academicRepositoryService.createValueAddedCourse(departmentId, payload);
      }

      await fetchCourses();
      setNewCourse({
        courseName: '',
        fromDate: '',
        toDate: '',
        timeFrom: '',
        timeTo: '',
        courseInstructor: '',
        duration: '',
        studentsEnrolled: '',
        studentsParticipated: '',
        certificationProvided: 'Yes',
        certificatesIssued: '',
      });
      setShowAddDialog(false);
      setEditingCourse(null);
    } catch (err: any) {
      console.error('Failed to save value added course:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to save value added course');
    } finally {
      setSubmitting(false);
    }
  }, [newCourse, editingCourse, departmentId, academicYear, selectedYear, selectedSemester, fetchCourses]);

  const handleEditCourse = useCallback((course: ValueAddedCourseRecord) => {
    setEditingCourse(course);
    setNewCourse({
      courseName: course.courseName,
      fromDate: course.fromDate,
      toDate: course.toDate,
      timeFrom: course.timeFrom,
      timeTo: course.timeTo,
      courseInstructor: course.courseInstructor,
      duration: course.duration,
      studentsEnrolled: course.studentsEnrolled,
      studentsParticipated: course.studentsParticipated,
      certificationProvided: course.certificationProvided,
      certificatesIssued: course.certificatesIssued,
    });
    setShowAddDialog(true);
  }, []);

  // Confirm delete handler via live API
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTargetCourse) return;
    setIsDeleting(true);
    try {
      await academicRepositoryService.deleteValueAddedCourse(deleteTargetCourse.id, departmentId);
      await fetchCourses();
      setDeleteTargetCourse(null);
    } catch (err: any) {
      console.error('Failed to delete value added course:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to delete value added course');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTargetCourse, departmentId, fetchCourses]);

  const handleSave = useCallback(async () => {
    setIsBulkSaving(true);
    try {
      const forCurrentYearSem = courses.filter(
        (c) => c.year === selectedYear && c.semester === selectedSemester
      );
      const coursesPayload = forCurrentYearSem.map((r) => ({
        academicYear,
        yearOfStudy: selectedYear,
        semester: selectedSemester,
        courseName: r.courseName,
        courseInstructor: r.courseInstructor,
        fromDate: formatDateToISO(r.fromDate) || undefined,
        toDate: formatDateToISO(r.toDate) || undefined,
        timeFrom: formatTimeTo24h(r.timeFrom) || undefined,
        timeTo: formatTimeTo24h(r.timeTo) || undefined,
        duration: r.duration || undefined,
        studentsEnrolled: r.studentsEnrolled ? parseInt(r.studentsEnrolled) : 0,
        studentsParticipated: r.studentsParticipated ? parseInt(r.studentsParticipated) : 0,
        certificationProvided: r.certificationProvided === 'Yes',
        certificatesIssued: r.certificatesIssued ? parseInt(r.certificatesIssued) : 0,
      }));

      await academicRepositoryService.bulkSaveValueAddedCourses(departmentId, {
        academicYear,
        yearOfStudy: selectedYear,
        semester: selectedSemester,
        courses: coursesPayload,
      });

      await fetchCourses();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      console.error('Failed to bulk save courses:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to save courses');
    } finally {
      setIsBulkSaving(false);
    }
  }, [courses, selectedYear, selectedSemester, academicYear, departmentId, fetchCourses]);

  const handleDownloadTemplate = useCallback(() => {
    const currentCourses = courses.filter(
      (c) => c.year === selectedYear && c.semester === selectedSemester
    );
    const headers = 'Course Name,From Date,To Date,Time From,Time To,Course Instructor,Duration,Students Enrolled,Students Participated,Certification Provided,Certificates Issued';
    
    let csvRows: string[] = [];
    if (currentCourses.length > 0) {
      csvRows = currentCourses.map((c) => {
        const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
        return [
          escape(c.courseName),
          escape(c.fromDate),
          escape(c.toDate),
          escape(c.timeFrom),
          escape(c.timeTo),
          escape(c.courseInstructor),
          escape(c.duration),
          c.studentsEnrolled || '0',
          c.studentsParticipated || '0',
          c.certificationProvided,
          c.certificatesIssued || '0',
        ].join(',');
      });
    } else {
      csvRows.push('"Python for Data Science","2025-08-01","2025-08-15","10:00","12:00","Dr. Smith","30 hrs",45,42,Yes,42');
    }

    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `value_added_courses_${academicYear}_${selectedYear.replace(/\s+/g, '_')}_${selectedSemester.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [courses, selectedYear, selectedSemester, academicYear]);

  const totalCoursesForYearSem = courses.filter(
    (c) => c.year === selectedYear && c.semester === selectedSemester
  ).length;

  const availableSemesters = SEMESTERS_MAP[selectedYear] || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Value Added Courses</h2>
              <p className="text-xs text-muted-foreground">
                Manage value added courses for each year and semester — upload via CSV or add manually
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
                onChange={handleCSVUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-3.5 w-3.5" />
                Upload CSV
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setEditingCourse(null); setNewCourse({ courseName: '', fromDate: '', toDate: '', timeFrom: '', timeTo: '', courseInstructor: '', duration: '', studentsEnrolled: '', studentsParticipated: '', certificationProvided: 'Yes', certificatesIssued: '' }); setShowAddDialog(true); }} className="gap-2">
              <Plus className="h-3.5 w-3.5" />
              Add Course
            </Button>
            <div className="ml-auto">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={totalCoursesForYearSem === 0}
                className="gap-2 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800"
              >
                <Save className="h-3.5 w-3.5" />
                Save Courses
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
                  <p className="text-sm font-semibold text-green-700">Courses Saved Successfully</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Total Courses: {totalCoursesForYearSem} &bull; {selectedYear} / {selectedSemester}
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
            placeholder="Search by course name or instructor..."
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
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="Yes">Certified</SelectItem>
            <SelectItem value="No">Non-Certified</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">
          {filteredCourses.length} Courses
        </Badge>
      </div>

      {/* Courses Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-600" />
            Value Added Courses — {selectedYear} / {selectedSemester}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table className="min-w-[1100px]">
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-semibold w-8 sticky left-0 bg-muted/30 z-10">#</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">Course Name</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">Instructor</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">From Date</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">To Date</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">Duration</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Enrolled</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Participated</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Cert.</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Issued</TableHead>
                    <TableHead className="text-xs font-semibold text-right whitespace-nowrap sticky right-0 bg-muted/30 z-10">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No courses added yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a CSV or add courses manually for {selectedYear} / {selectedSemester}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table className="min-w-[1100px]">
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-semibold w-8 sticky left-0 bg-muted/30 z-10">#</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">Course Name</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">Instructor</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">From Date</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">To Date</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">Duration</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Enrolled</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Participated</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Cert.</TableHead>
                    <TableHead className="text-xs font-semibold text-center whitespace-nowrap">Issued</TableHead>
                    <TableHead className="text-xs font-semibold text-right whitespace-nowrap sticky right-0 bg-muted/30 z-10">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course, idx) => (
                    <TableRow key={course.id} className="hover:bg-muted/50">
                      <TableCell className="text-xs text-muted-foreground sticky left-0 bg-background z-10">{idx + 1}</TableCell>
                      <TableCell className="text-xs font-medium whitespace-nowrap">{course.courseName}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{course.courseInstructor}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{course.fromDate}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{course.toDate}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{course.duration || '-'}</TableCell>
                      <TableCell className="text-xs text-center whitespace-nowrap">{course.studentsEnrolled}</TableCell>
                      <TableCell className="text-xs text-center whitespace-nowrap">{course.studentsParticipated}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <Badge variant={course.certificationProvided === 'Yes' ? 'default' : 'secondary'} className="text-[9px] h-4">
                          {course.certificationProvided}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-center whitespace-nowrap font-semibold">{course.certificatesIssued || '-'}</TableCell>
                      <TableCell className="text-right sticky right-0 bg-background z-10">
                        <div className="flex items-center justify-end gap-1">
                          {isReadOnly ? (
                            <span className="text-[10px] text-muted-foreground italic">Read-only</span>
                          ) : (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditCourse(course)}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteTargetCourse(course)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
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

      {/* Per-Course Evidence Section — Inline Row Style like Add-on Programs */}
      {filteredCourses.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-600" />
                Course Evidence — {selectedYear} / {selectedSemester}
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">{filteredCourses.length} courses</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Upload evidence documents for each course: Geo-tagged Photos, Registered Students List, Attended Students List
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredCourses.map((course) => {
              const courseEvidence = courseEvidenceMap[course.id] || {
                geoTaggedPhotos: { status: 'not-uploaded' },
                registeredStudentsList: { status: 'not-uploaded' },
                attendedStudentsList: { status: 'not-uploaded' },
              };
              const evidenceItems = [
                { key: 'geoTaggedPhotos' as const, label: 'Geo-tagged Photos of Session', icon: '📸', data: courseEvidence.geoTaggedPhotos },
                { key: 'registeredStudentsList' as const, label: 'Registered Students List', icon: '📋', data: courseEvidence.registeredStudentsList },
                { key: 'attendedStudentsList' as const, label: 'Attended Students List', icon: '✅', data: courseEvidence.attendedStudentsList },
              ];
              return (
                <div key={course.id} className="rounded-lg border border-border/60 overflow-hidden">
                  {/* Course Header */}
                  <div className="bg-muted/30 px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-violet-600" />
                      <span className="text-xs font-semibold">{course.courseName}</span>
                      <Badge variant="outline" className="text-[9px] ml-1">
                        {course.fromDate} — {course.toDate}
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
                                disabled={previewLoadingId === item.data.id}
                                className="h-7 px-2 text-[10px] gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => handlePreviewEvidence(course.id, item.key)}
                              >
                                {previewLoadingId === item.data.id ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                                Preview
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={downloadingEvidenceId === item.data.id}
                                className="h-7 px-2 text-[10px] gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                onClick={() => handleDownloadEvidence(course.id, item.key)}
                              >
                                {downloadingEvidenceId === item.data.id ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <DownloadCloud className="h-3 w-3" />
                                )}
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[10px] gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
                                onClick={() => handleUploadEvidence(course.id, item.key)}
                              >
                                <RefreshCw className="h-3 w-3" /> Re-upload
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[10px] gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleDeleteEvidenceClick(course, item.key)}
                              >
                                <Trash2 className="h-3 w-3" /> Delete
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              className="h-7 px-3 text-[10px] gap-1 bg-violet-600 hover:bg-violet-700"
                              onClick={() => handleUploadEvidence(course.id, item.key)}
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
            })}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Course Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setEditingCourse(null); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              {editingCourse ? 'Edit Value Added Course' : 'Add New Value Added Course'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-3">
            <div className="col-span-2">
              <Label className="text-xs">Course Name *</Label>
              <Input
                value={newCourse.courseName}
                onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                placeholder="e.g., Python for Data Science"
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">From Date</Label>
              <div className="mt-1">
                <DatePicker
                  value={newCourse.fromDate}
                  onChange={(val) => setNewCourse({ ...newCourse, fromDate: val })}
                  placeholder="Select start date"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">To Date</Label>
              <div className="mt-1">
                <DatePicker
                  value={newCourse.toDate}
                  onChange={(val) => setNewCourse({ ...newCourse, toDate: val })}
                  placeholder="Select end date"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Time From</Label>
              <div className="mt-1">
                <TimePicker
                  value={newCourse.timeFrom}
                  onChange={(val) => setNewCourse({ ...newCourse, timeFrom: val })}
                  placeholder="Start time"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Time To</Label>
              <div className="mt-1">
                <TimePicker
                  value={newCourse.timeTo}
                  onChange={(val) => setNewCourse({ ...newCourse, timeTo: val })}
                  placeholder="End time"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Course Instructor *</Label>
              <Input
                value={newCourse.courseInstructor}
                onChange={(e) => setNewCourse({ ...newCourse, courseInstructor: e.target.value })}
                placeholder="e.g., Dr. Smith"
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Duration</Label>
              <Input
                value={newCourse.duration}
                onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                placeholder="e.g., 30 hrs"
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Students Enrolled</Label>
              <Input
                type="number"
                value={newCourse.studentsEnrolled}
                onChange={(e) => setNewCourse({ ...newCourse, studentsEnrolled: e.target.value })}
                placeholder="0"
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Students Participated</Label>
              <Input
                type="number"
                value={newCourse.studentsParticipated}
                onChange={(e) => setNewCourse({ ...newCourse, studentsParticipated: e.target.value })}
                placeholder="0"
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Certification Provided</Label>
              <Select
                value={newCourse.certificationProvided}
                onValueChange={(val) => setNewCourse({ ...newCourse, certificationProvided: val as 'Yes' | 'No' })}
              >
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes" className="text-xs">Yes</SelectItem>
                  <SelectItem value="No" className="text-xs">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Certificates Issued</Label>
              <Input
                type="number"
                value={newCourse.certificatesIssued}
                onChange={(e) => setNewCourse({ ...newCourse, certificatesIssued: e.target.value })}
                placeholder="0"
                className="mt-1 h-8 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowAddDialog(false); setEditingCourse(null); }} disabled={submitting}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddCourse} disabled={submitting || !newCourse.courseName || !newCourse.courseInstructor}>
              {submitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Add Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Upload Preview Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="shrink-0 pb-2">
            <DialogTitle className="text-sm font-semibold">CSV Upload Preview</DialogTitle>
          </DialogHeader>
          {uploadStats && (
            <div className="flex items-center gap-4 mb-3 shrink-0">
              <Badge variant="outline" className="text-xs">Total: {uploadStats.total}</Badge>
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Valid: {uploadStats.valid}
              </Badge>
              {uploadStats.invalid > 0 && (
                <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/20">
                  Invalid: {uploadStats.invalid}
                </Badge>
              )}
            </div>
          )}
          <div className="flex-1 overflow-x-auto overflow-y-auto border rounded-md min-h-0 max-h-[55vh]">
            <Table className="min-w-[850px]">
              <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 shadow-sm">
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[10px] w-12 whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-[10px] whitespace-nowrap">Course Name</TableHead>
                  <TableHead className="text-[10px] whitespace-nowrap">Instructor</TableHead>
                  <TableHead className="text-[10px] whitespace-nowrap">From</TableHead>
                  <TableHead className="text-[10px] whitespace-nowrap">To</TableHead>
                  <TableHead className="text-[10px] whitespace-nowrap">Enrolled</TableHead>
                  <TableHead className="text-[10px] whitespace-nowrap">Cert.</TableHead>
                  <TableHead className="text-[10px] whitespace-nowrap">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadPreview.map((row) => (
                  <TableRow key={row.id} className={row.validationStatus === 'invalid' ? 'bg-red-50/50' : ''}>
                    <TableCell>
                      {row.validationStatus === 'valid' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-[11px] font-medium whitespace-nowrap">{row.courseName}</TableCell>
                    <TableCell className="text-[11px] whitespace-nowrap">{row.courseInstructor}</TableCell>
                    <TableCell className="text-[11px] whitespace-nowrap">{row.fromDate}</TableCell>
                    <TableCell className="text-[11px] whitespace-nowrap">{row.toDate}</TableCell>
                    <TableCell className="text-[11px] whitespace-nowrap">{row.studentsEnrolled}</TableCell>
                    <TableCell className="text-[11px] whitespace-nowrap">{row.certificationProvided}</TableCell>
                    <TableCell className="text-[11px] text-red-600 whitespace-nowrap">{row.errors?.join(', ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter className="mt-4 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setShowUploadDialog(false)} disabled={isImporting}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleImportUploaded}
              disabled={!uploadStats || uploadStats.valid === 0 || isImporting}
              className="gap-1.5"
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
      {uploadEvidenceDialog && (
        <Dialog open={uploadEvidenceDialog.open} onOpenChange={(open) => { if (!open) { setUploadEvidenceDialog(null); setSelectedFile(null); setUploadError(null); } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">
                Upload Evidence Document
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {uploadEvidenceDialog.docType === 'geoTaggedPhotos' && 'Geo-tagged Photos of Session'}
                {uploadEvidenceDialog.docType === 'registeredStudentsList' && 'Registered Students List'}
                {uploadEvidenceDialog.docType === 'attendedStudentsList' && 'Attended Students List'}
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
                    ? 'border-violet-500 bg-violet-50/50 scale-[1.01]'
                    : 'border-border/60 hover:border-violet-400 hover:bg-muted/50',
                  selectedFile && !uploadError && 'border-violet-500/50 bg-violet-50/30'
                )}
              >
                {selectedFile && !uploadError ? (
                  <>
                    <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-violet-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-violet-700">{selectedFile.name}</p>
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
                      dragOver ? 'bg-violet-100' : 'bg-muted/50'
                    )}>
                      <Upload className={cn('h-6 w-6', dragOver ? 'text-violet-600' : 'text-muted-foreground')} />
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
                  accept={getAllowedTypes(uploadEvidenceDialog.docType).extensions.join(',')}
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
                  {getAllowedTypes(uploadEvidenceDialog.docType).extensions.map((ext) => (
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
              <Button
                variant="outline"
                size="sm"
                disabled={isUploadingEvidence}
                onClick={() => { setUploadEvidenceDialog(null); setSelectedFile(null); setUploadError(null); }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!selectedFile || !!uploadError || isUploadingEvidence}
                onClick={handleConfirmUpload}
                className="gap-1.5 bg-violet-600 hover:bg-violet-700"
              >
                {isUploadingEvidence ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    Upload File
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Evidence Preview Dialog */}
      {previewDialog && (
        <Dialog open={previewDialog.open} onOpenChange={(open) => { if (!open) setPreviewDialog(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Document Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg border p-6 bg-muted/20 flex flex-col items-center justify-center gap-3">
                {previewDialog.fileUrl && (previewDialog.fileType === 'png' || previewDialog.fileType === 'jpg' || previewDialog.fileType === 'jpeg' || previewDialog.fileType === 'webp') ? (
                  <img
                    src={previewDialog.fileUrl}
                    alt={previewDialog.fileName}
                    className="max-h-60 max-w-full rounded object-contain border"
                  />
                ) : previewDialog.fileUrl && previewDialog.fileType === 'pdf' ? (
                  <iframe
                    src={previewDialog.fileUrl}
                    title={previewDialog.fileName}
                    className="w-full h-72 rounded border bg-white"
                  />
                ) : (
                  <FileText className="h-12 w-12 text-violet-600/60" />
                )}
                <p className="text-sm font-medium text-center">{previewDialog.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {previewDialog.docType === 'geoTaggedPhotos' && 'Geo-tagged Photos of Session'}
                  {previewDialog.docType === 'registeredStudentsList' && 'Registered Students List'}
                  {previewDialog.docType === 'attendedStudentsList' && 'Attended Students List'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-600 border-violet-500/20">
                    Uploaded Successfully
                  </Badge>
                  {previewDialog.fileSize && (
                    <Badge variant="outline" className="text-[10px]">
                      {previewDialog.fileSize}
                    </Badge>
                  )}
                  {previewDialog.uploadedAt && (
                    <span className="text-[11px] text-muted-foreground">
                      • {previewDialog.uploadedAt}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewDialog(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 bg-violet-600 hover:bg-violet-700"
                  onClick={() => {
                    handleDownloadEvidence(previewDialog.courseId, previewDialog.docType);
                    setPreviewDialog(null);
                  }}
                >
                  <DownloadCloud className="h-3.5 w-3.5" /> Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Evidence Confirmation Alert Dialog */}
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
                  Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteTargetEvidence?.fileName}"</span> for course <span className="font-semibold text-foreground">"{deleteTargetEvidence?.courseName}"</span>? This action cannot be undone.
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
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Document
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Course Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTargetCourse} onOpenChange={(open) => !open && setDeleteTargetCourse(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 mt-0.5">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="space-y-1">
                <AlertDialogTitle className="text-base font-semibold">
                  Delete Value Added Course
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground">
                  Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteTargetCourse?.courseName}"</span>? This course will be permanently removed.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel disabled={isDeleting} onClick={() => setDeleteTargetCourse(null)}>
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
                'Delete Course'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
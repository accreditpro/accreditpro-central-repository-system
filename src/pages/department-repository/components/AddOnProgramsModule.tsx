import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { cn } from '@/lib/utils';
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
  FileText,
  X,
  Eye,
  DownloadCloud,
  RefreshCw,
  Building2,
  CalendarDays,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { academicRepositoryService, ApiAddOnProgram } from '@/services/academic-repository.service';
import { apiService } from '@/services/api.service';

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
  status: 'not-uploaded' | 'uploaded';
  fileName?: string;
  uploadedAt?: string;
}

interface ProgramEvidenceMap {
  geoTaggedPhotos: ProgramEvidenceItem;
  registeredStudentsList: ProgramEvidenceItem;
  attendedStudentsList: ProgramEvidenceItem;
}

interface AddOnProgramsModuleProps {
  department: string;
  academicYear: string;
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

const mapYearOfStudyToLabel = (y: string) => {
  if (y === '1') return 'I Year';
  if (y === '2') return 'II Year';
  if (y === '3') return 'III Year';
  if (y === '4') return 'IV Year';
  return 'III Year';
};

const mapLabelToYearOfStudy = (y: string) => {
  if (y === 'I Year') return '1';
  if (y === 'II Year') return '2';
  if (y === 'III Year') return '3';
  if (y === 'IV Year') return '4';
  return '3';
};

const mapSemesterToLabel = (s: string) => {
  return `Semester ${s}`;
};

const mapLabelToSemester = (s: string) => {
  return s.replace('Semester ', '');
};

export const AddOnProgramsModule = ({ department, academicYear }: AddOnProgramsModuleProps) => {
  const { user } = useAuth();
  const departmentId = user?.departmentId || 101;
  const [selectedYear, setSelectedYear] = useState('III Year');
  const [selectedSemester, setSelectedSemester] = useState('Semester 5');
  const [programs, setPrograms] = useState<AddOnProgramRecord[]>([]);
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
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; programId: string; docType: EvidenceDocType; fileName: string } | null>(null);
  const [uploadDialog, setUploadDialog] = useState<{ open: boolean; programId: string; docType: EvidenceDocType } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dropZoneInputRef = useRef<HTMLInputElement>(null);

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

  const loadPrograms = useCallback(async () => {
    try {
      const res = await academicRepositoryService.getAddOnPrograms(academicYear, departmentId);
      if (res?.content) {
        const mappedPrograms: AddOnProgramRecord[] = res.content.map((item: any) => ({
          id: String(item.id),
          department,
          year: mapYearOfStudyToLabel(item.yearOfStudy),
          semester: mapSemesterToLabel(item.semester),
          topic: item.topic || '',
          fromDate: item.fromDate || '',
          toDate: item.toDate || '',
          timeFrom: item.timeFrom || '',
          timeTo: item.timeTo || '',
          coordinator: item.coordinator || '',
          duration: item.duration || '',
          studentsEnrolled: item.studentsEnrolled?.toString() || '0',
          studentsParticipated: item.studentsParticipated?.toString() || '0',
          certificationProvided: (item.certificationProvided ? 'Yes' : 'No') as 'Yes' | 'No',
          certificatesIssued: item.certificatesIssued?.toString() || '0',
        }));
        setPrograms(mappedPrograms);
      }
    } catch (err) {
      console.error('Failed to load add on programs:', err);
    }
  }, [academicYear, departmentId, department]);

  const loadEvidence = useCallback(async () => {
    try {
      const res = await academicRepositoryService.getEvidenceDocuments(academicYear, departmentId, {
        sectionName: 'addon-programs',
      });
      if (res?.content) {
        const newMap: Record<string, Record<EvidenceDocType, any>> = {};
        const sortedContent = [...res.content].sort((a: any, b: any) => a.id - b.id);
        sortedContent.forEach((ev: any) => {
          const cId = String(ev.recordId);
          if (!newMap[cId]) {
            newMap[cId] = {
              geoTaggedPhotos: { status: 'not-uploaded' },
              registeredStudentsList: { status: 'not-uploaded' },
              attendedStudentsList: { status: 'not-uploaded' },
            };
          }
          if (ev.documentType) {
            newMap[cId][ev.documentType as EvidenceDocType] = {
              status: 'uploaded',
              fileName: ev.fileName,
              uploadedAt: ev.uploadedAt,
              id: ev.id,
            };
          }
        });
        setProgramEvidenceMap(newMap);
      }
    } catch (err) {
      console.error('Failed to load evidence documents:', err);
    }
  }, [academicYear, departmentId]);

  useEffect(() => {
    loadPrograms();
    loadEvidence();
  }, [loadPrograms, loadEvidence]);

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

  const handleConfirmUpload = useCallback(async () => {
    if (!selectedFile || !uploadDialog) return;

    const { programId, docType } = uploadDialog;

    try {
      const payload = {
        academicYear,
        yearOfStudy: mapLabelToYearOfStudy(selectedYear),
        semester: mapLabelToSemester(selectedSemester),
        sectionName: 'addon-programs',
        recordId: programId,
        documentType: docType
      };
      
      await academicRepositoryService.uploadEvidenceDocument(departmentId, 1, selectedFile, payload);
      await loadEvidence();
      
      setUploadDialog(null);
      setSelectedFile(null);
      setUploadError(null);
    } catch (err) {
      console.error('Failed to upload evidence:', err);
      setUploadError('Failed to upload evidence');
    }
  }, [selectedFile, uploadDialog, academicYear, selectedYear, selectedSemester, departmentId, loadEvidence]);

  const handlePreviewEvidence = useCallback((programId: string, docType: EvidenceDocType) => {
    const ev = programEvidenceMap[programId]?.[docType];
    if (ev?.status === 'uploaded' && ev.fileName) {
      setPreviewDialog({ open: true, programId, docType, fileName: ev.fileName });
    }
  }, [programEvidenceMap]);

  const handleDownloadEvidence = useCallback(async (programId: string, docType: EvidenceDocType) => {
    const ev = programEvidenceMap[programId]?.[docType];
    if (ev?.status === 'uploaded' && ev.id) {
      try {
        const res = await academicRepositoryService.downloadEvidenceDocument(ev.id);
        if (res?.downloadUrl) {
          await apiService.download(res.downloadUrl, ev.fileName || 'document');
        }
      } catch (err) {
        console.error('Failed to download evidence:', err);
      }
    }
  }, [programEvidenceMap]);

  // Download CSV Template
  const handleDownloadTemplate = useCallback(() => {
    const header = 'Department,Year,Semester,Topic,From Date,To Date,Time From,Time To,Coordinator,Duration,Students Enrolled,Students Participated,Certification Provided,Certificates Issued';
    let rows: string[] = [];
    if (filteredPrograms && filteredPrograms.length > 0) {
      rows = filteredPrograms.map(p => `"${department}","${p.year}","${p.semester}","${p.topic}","${p.fromDate}","${p.toDate}","${p.timeFrom}","${p.timeTo}","${p.coordinator}","${p.duration}","${p.studentsEnrolled}","${p.studentsParticipated}","${p.certificationProvided}","${p.certificatesIssued}"`);
    } else {
      rows = [
        `"${department}","${selectedYear}","${selectedSemester}","Python for Data Science","2025-01-15","2025-01-20","09:00","12:00","Dr. Anita Sharma","30 Hours","120","115","Yes","110"`
      ];
    }
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `addon_programs_${selectedYear.replace(' ', '_')}_${selectedSemester.replace(' ', '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [department, selectedYear, selectedSemester, filteredPrograms]);

  // Upload CSV
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((line) => line.trim());
        const headers = parseCSVLine(lines[0]);

        const parsed: AddOnProgramRecord[] = [];
        let validCount = 0;
        let invalidCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h] = values[idx] || '';
          });

          const errors: string[] = [];

          // Validation
          if (row['Department'] && row['Department'] !== department) {
            errors.push(`Department "${row['Department']}" does not match "${department}"`);
          }
          if (!row['Topic']) {
            errors.push('Topic is mandatory');
          }
          if (!row['From Date']) {
            errors.push('From Date is mandatory');
          }
          if (!row['To Date']) {
            errors.push('To Date is mandatory');
          }
          if (!row['Coordinator']) {
            errors.push('Coordinator is mandatory');
          }
          if (row['Certification Provided'] && !['Yes', 'No'].includes(row['Certification Provided'])) {
            errors.push('Certification Provided must be Yes or No');
          }

          const yearVal = row['Year'] || selectedYear;
          const semVal = row['Semester'] || selectedSemester;
          if (!YEARS_OF_STUDY.includes(yearVal)) {
            errors.push(`Year "${yearVal}" is not valid`);
          }

          const programRecord: AddOnProgramRecord = {
            id: `upload-${i}`,
            department: row['Department'] || department,
            year: yearVal,
            semester: semVal,
            topic: row['Topic'] || '',
            fromDate: row['From Date'] || '',
            toDate: row['To Date'] || '',
            timeFrom: row['Time From'] || '',
            timeTo: row['Time To'] || '',
            coordinator: row['Coordinator'] || '',
            duration: row['Duration'] || '',
            studentsEnrolled: row['Students Enrolled'] || '0',
            studentsParticipated: row['Students Participated'] || '0',
            certificationProvided: (row['Certification Provided'] === 'Yes' ? 'Yes' : 'No'),
            certificatesIssued: row['Certificates Issued'] || '0',
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

  // Import uploaded programs (only valid ones)
  const handleImportUploaded = useCallback(async () => {
    const validRecords = uploadPreview.filter((p) => p.validationStatus === 'valid');
    
    if (validRecords.length > 0) {
      const programsByGroup: Record<string, typeof validRecords> = {};
      validRecords.forEach(c => {
        const year = c.year || selectedYear;
        const semester = c.semester || selectedSemester;
        const key = `${year}|${semester}`;
        if (!programsByGroup[key]) programsByGroup[key] = [];
        programsByGroup[key].push(c);
      });

      try {
        for (const [key, groupPrograms] of Object.entries(programsByGroup)) {
          const [year, semester] = key.split('|');
          const payload = {
            academicYear,
            yearOfStudy: mapLabelToYearOfStudy(year),
            semester: mapLabelToSemester(semester),
            programs: groupPrograms.map(c => ({
              topic: c.topic,
              fromDate: c.fromDate,
              toDate: c.toDate,
              timeFrom: c.timeFrom,
              timeTo: c.timeTo,
              coordinator: c.coordinator,
              duration: c.duration,
              studentsEnrolled: parseInt(c.studentsEnrolled) || 0,
              studentsParticipated: parseInt(c.studentsParticipated) || 0,
              certificationProvided: c.certificationProvided === 'Yes',
              certificatesIssued: parseInt(c.certificatesIssued) || 0
            }))
          };
          await academicRepositoryService.bulkSaveAddOnPrograms(departmentId, payload);
        }
        await loadPrograms();

        const firstProgram = validRecords[0];
        if (firstProgram.year && YEARS_OF_STUDY.includes(firstProgram.year)) {
          setSelectedYear(firstProgram.year);
        }
        const semOptions = SEMESTERS_MAP[firstProgram.year || selectedYear] || [];
        if (firstProgram.semester && semOptions.includes(firstProgram.semester)) {
          setSelectedSemester(firstProgram.semester);
        }
      } catch (err) {
        console.error('Failed to bulk save imported add on programs:', err);
      }
    }

    setShowUploadDialog(false);
    setUploadPreview([]);
    setUploadStats(null);
  }, [uploadPreview, academicYear, departmentId, loadPrograms, selectedYear, selectedSemester]);

  // Add program manually
  const handleAddProgram = useCallback(async () => {
    if (!newProgram.topic || !newProgram.fromDate || !newProgram.toDate || !newProgram.coordinator) return;

    try {
      const programData: ApiAddOnProgram = {
        academicYear,
        yearOfStudy: mapLabelToYearOfStudy(selectedYear),
        semester: mapLabelToSemester(selectedSemester),
        topic: newProgram.topic,
        fromDate: newProgram.fromDate,
        toDate: newProgram.toDate,
        timeFrom: newProgram.timeFrom,
        timeTo: newProgram.timeTo,
        coordinator: newProgram.coordinator,
        duration: newProgram.duration,
        studentsEnrolled: parseInt(newProgram.studentsEnrolled) || 0,
        studentsParticipated: parseInt(newProgram.studentsParticipated) || 0,
        certificationProvided: newProgram.certificationProvided === 'Yes',
        certificatesIssued: parseInt(newProgram.certificatesIssued) || 0
      };

      if (editingProgram && !editingProgram.id.toString().startsWith('program-') && !editingProgram.id.toString().startsWith('upload-')) {
        await academicRepositoryService.updateAddOnProgram(editingProgram.id, departmentId, programData);
      } else if (!editingProgram) {
        await academicRepositoryService.createAddOnProgram(departmentId, programData);
      } else {
        // Local only fallback
        const program: AddOnProgramRecord = {
          id: editingProgram.id,
          department,
          year: selectedYear,
          semester: selectedSemester,
          ...newProgram,
        };
        setPrograms((prev) => prev.map((p) => (p.id === editingProgram.id ? program : p)));
      }

      await loadPrograms();

      setNewProgram({ topic: '', fromDate: '', toDate: '', timeFrom: '', timeTo: '', coordinator: '', duration: '', studentsEnrolled: '', studentsParticipated: '', certificationProvided: 'Yes', certificatesIssued: '' });
      setShowAddDialog(false);
      setEditingProgram(null);
    } catch (err) {
      console.error('Failed to save program:', err);
    }
  }, [newProgram, department, selectedYear, selectedSemester, editingProgram, academicYear, departmentId, loadPrograms]);

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
  const handleDeleteProgram = useCallback(async (id: string) => {
    if (!id.startsWith('program-') && !id.startsWith('upload-')) {
      try {
        await academicRepositoryService.deleteAddOnProgram(id, departmentId);
        await loadPrograms();
      } catch (err) {
        console.error('Failed to delete program:', err);
      }
    } else {
      setPrograms((prev) => prev.filter((p) => p.id !== id));
    }
  }, [departmentId, loadPrograms]);

  // Save Programs
  const handleSavePrograms = useCallback(async () => {
    const yearSemPrograms = programs.filter(
      (p) => p.year === selectedYear && p.semester === selectedSemester
    );
    
    const unsavedPrograms = yearSemPrograms.filter(p => p.id.startsWith('program-') || p.id.startsWith('upload-'));
    
    if (unsavedPrograms.length > 0) {
      try {
        const payload = {
          academicYear,
          yearOfStudy: mapLabelToYearOfStudy(selectedYear),
          semester: mapLabelToSemester(selectedSemester),
          programs: unsavedPrograms.map(p => ({
            topic: p.topic,
            fromDate: p.fromDate,
            toDate: p.toDate,
            timeFrom: p.timeFrom,
            timeTo: p.timeTo,
            coordinator: p.coordinator,
            duration: p.duration,
            studentsEnrolled: parseInt(p.studentsEnrolled) || 0,
            studentsParticipated: parseInt(p.studentsParticipated) || 0,
            certificationProvided: p.certificationProvided === 'Yes',
            certificatesIssued: parseInt(p.certificatesIssued) || 0
          }))
        };
        await academicRepositoryService.bulkSaveAddOnPrograms(departmentId, payload);
        await loadPrograms();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } catch (err) {
        console.error('Bulk save failed:', err);
      }
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  }, [programs, selectedYear, selectedSemester, academicYear, departmentId, loadPrograms]);

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
                disabled={totalProgramsForYearSem === 0}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
              >
                <Save className="h-3.5 w-3.5" />
                Save Programs
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
          {filteredPrograms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Award className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No programs added yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a CSV or add programs manually for {selectedYear} / {selectedSemester}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table className="min-w-[1200px]">
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
                    <TableRow key={program.id} className="hover:bg-muted/20">
                      <TableCell className="text-xs text-muted-foreground sticky left-0 bg-background z-10">{idx + 1}</TableCell>
                      <TableCell className="text-sm font-medium whitespace-nowrap">{program.topic}</TableCell>
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
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteProgram(program.id)}>
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
                      <div key={item.key} className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/10 transition-colors">
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
                                onClick={() => handlePreviewEvidence(program.id, item.key)}
                              >
                                <Eye className="h-3 w-3" /> Preview
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[10px] gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                onClick={() => handleDownloadEvidence(program.id, item.key)}
                              >
                                <DownloadCloud className="h-3 w-3" /> Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-[10px] gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
                                onClick={() => handleUploadEvidence(program.id, item.key)}
                              >
                                <RefreshCw className="h-3 w-3" /> Re-upload
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">{editingProgram ? 'Edit Program' : 'Add Program'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
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
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowAddDialog(false); setEditingProgram(null); }}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddProgram}
              disabled={!newProgram.topic || !newProgram.fromDate || !newProgram.toDate || !newProgram.coordinator}
            >
              {editingProgram ? 'Update Program' : 'Add Program'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Preview Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4" />
              CSV Upload Preview
            </DialogTitle>
          </DialogHeader>
          {uploadStats && (
            <div className="space-y-4">
              {/* Upload Stats */}
              <div className="flex items-center gap-4">
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
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">CSV Uploaded Successfully — All records are valid</p>
                </div>
              )}

              {/* Preview Table */}
              <ScrollArea className="max-h-[400px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-semibold w-8">#</TableHead>
                      <TableHead className="text-xs font-semibold">Topic</TableHead>
                      <TableHead className="text-xs font-semibold">From</TableHead>
                      <TableHead className="text-xs font-semibold">To</TableHead>
                      <TableHead className="text-xs font-semibold">Coordinator</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Duration</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Enrolled</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Cert.</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Valid</TableHead>
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
                        <TableCell className="text-xs">{program.fromDate}</TableCell>
                        <TableCell className="text-xs">{program.toDate}</TableCell>
                        <TableCell className="text-xs">{program.coordinator}</TableCell>
                        <TableCell className="text-xs text-center">{program.duration}</TableCell>
                        <TableCell className="text-xs text-center">{program.studentsEnrolled}</TableCell>
                        <TableCell className="text-xs text-center">{program.certificationProvided}</TableCell>
                        <TableCell className="text-center">
                          {program.validationStatus === 'valid' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <div className="flex items-center gap-1 justify-center">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-[9px] text-red-600 max-w-[200px] truncate" title={program.errors?.join(', ')}>
                                {program.errors?.[0]}
                              </span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              {/* Validation Errors Summary */}
              {uploadStats.invalid > 0 && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="text-xs font-semibold text-red-700 mb-2">Validation Errors</p>
                  <div className="space-y-1 max-h-[150px] overflow-y-auto pr-2">
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
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleImportUploaded}
              disabled={!uploadStats || uploadStats.valid === 0}
            >
              Import {uploadStats?.valid || 0} Valid Records
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
                    : 'border-border/60 hover:border-emerald-400 hover:bg-muted/30',
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
                disabled={!selectedFile || !!uploadError}
                onClick={handleConfirmUpload}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                <Upload className="h-3.5 w-3.5" /> Upload File
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
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewDialog(null)}>
                  Close
                </Button>
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                  handleDownloadEvidence(previewDialog.programId, previewDialog.docType);
                  setPreviewDialog(null);
                }}>
                  <DownloadCloud className="h-3.5 w-3.5" /> Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
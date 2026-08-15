import React, { useState, useEffect, useRef, useMemo } from 'react';
import { EvidenceUploadDialog } from './EvidenceUploadDialog';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  Search,
  Plus,
  Upload,
  Download,
  Globe,
  FileText,
  Eye,
  DownloadCloud,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Filter,
  ChevronLeft,
  ChevronRight,
  History,
  Replace,
  RefreshCw,
} from 'lucide-react';
import {
  getStudentMOOCs,
  createStudentMOOC,
  updateStudentMOOC,
  deleteStudentMOOC,
  uploadStudentMOOCsCSV,
  downloadStudentMOOCsTemplate,
  getStudentEvidence,
  uploadStudentEvidence,
  downloadStudentEvidence,
  deleteStudentEvidence,
  StudentMOOCRecord,
  StudentEvidenceDocument,
} from '@/services/student-repository.service';
import { studentRepositoryConfig } from '../repository-configs';
import { CSVUploadDialog } from './CSVUploadDialog';

interface StudentMOOCModuleProps {
  department?: string;
  departmentId?: number;
  academicYear: string;
}

const PLATFORMS = [
  'NPTEL',
  'SWAYAM',
  'SWAYAM Plus',
  'Coursera',
  'edX',
  'Udemy',
  'Microsoft Learn',
  'AWS Academy',
  'Google Cloud Skills Boost',
  'Oracle University',
  'Cisco Networking Academy',
  'Other',
];

const CERTIFICATION_STATUSES = ['Certified', 'In Progress', 'Not Certified'];

const MOOC_EVIDENCE = ['MOOC Certificate', 'Completion Certificate', 'Grade Card', 'Course Enrollment Proof'];

const EMPTY_RECORD: StudentMOOCRecord = {
  registrationNumber: '',
  studentName: '',
  platform: 'NPTEL',
  courseName: '',
  courseCategory: '',
  conductedBy: '',
  startDate: '',
  completionDate: '',
  durationHours: undefined,
  grade: '',
  score: '',
  certificationStatus: 'Certified',
  certificateId: '',
  academicYear: '2025-26',
  remarks: '',
};

export function StudentMOOCModule({
  department,
  departmentId,
  academicYear,
}: StudentMOOCModuleProps) {
  const { user } = useAuth();
  const effectiveDeptId = departmentId || user?.departmentId || 4;
  const effectiveInstId = user?.institutionId || 1;
  const effectiveDepartment = department || user?.department || 'Artificial intelligence & Machine Learning';

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const evidenceFileInputRef = useRef<HTMLInputElement>(null);

  // State
  const tabConfig = studentRepositoryConfig.tabs.find((t) => t.id === 'mooc-online-certifications');
  const [records, setRecords] = useState<StudentMOOCRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);
  const [showCSVDialog, setShowCSVDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StudentMOOCRecord | null>(null);
  const [formData, setFormData] = useState<StudentMOOCRecord>({ ...EMPTY_RECORD, academicYear });
  const [saving, setSaving] = useState(false);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<StudentMOOCRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Evidence state
  const [evidenceList, setEvidenceList] = useState<StudentEvidenceDocument[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);

  // ── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchMOOCs = async () => {
    setLoading(true);
    try {
      const res = await getStudentMOOCs(academicYear, effectiveDeptId, {
        platform: filterPlatform !== 'all' ? filterPlatform : undefined,
        certificationStatus: filterStatus !== 'all' ? filterStatus : undefined,
      });
      const data = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.content)
        ? res.content
        : Array.isArray(res?.data?.content)
        ? res.data.content
        : [];
      setRecords(data);
    } catch (err: any) {
      console.warn('Could not fetch student MOOCs:', err?.message || err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidence = async () => {
    setEvidenceLoading(true);
    try {
      const res = await getStudentEvidence('mooc-online-certifications', academicYear, effectiveDeptId);
      const data = Array.isArray(res)
        ? res
        : Array.isArray(res?.data?.documents)
        ? res.data.documents
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.documents)
        ? res.documents
        : Array.isArray(res?.content)
        ? res.content
        : [];
      setEvidenceList(data);
    } catch (err) {
      console.warn('Could not fetch MOOC evidence:', err);
      setEvidenceList([]);
    } finally {
      setEvidenceLoading(false);
    }
  };

  useEffect(() => {
    fetchMOOCs();
    fetchEvidence();
  }, [academicYear, effectiveDeptId, filterPlatform, filterStatus]);

  // ── Status Badge ────────────────────────────────────────────────────────────
  const getStatusBadge = (status?: string) => {
    const s = status || 'Approved';
    const variants: Record<string, { color: string; icon: React.ReactNode }> = {
      Approved: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="h-3 w-3" /> },
      Uploaded: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Clock className="h-3 w-3" /> },
      Draft: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', icon: <AlertCircle className="h-3 w-3" /> },
      Rejected: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-3 w-3" /> },
    };
    const variant = variants[s] || variants['Approved'];
    return (
      <Badge className={`${variant.color} flex items-center gap-1 text-[10px] font-medium px-2 py-0.5`}>
        {variant.icon}
        {s}
      </Badge>
    );
  };

  // ── Search & Filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return records.filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        m.studentName?.toLowerCase().includes(q) ||
        m.courseName?.toLowerCase().includes(q) ||
        m.platform?.toLowerCase().includes(q) ||
        m.registrationNumber?.toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'all' || m.certificationStatus === filterStatus || m.status === filterStatus;
      const matchesPlatform = filterPlatform === 'all' || m.platform === filterPlatform;
      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [records, searchQuery, filterStatus, filterPlatform]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ── Add / Edit ─────────────────────────────────────────────────────────────
  const handleEdit = (record: StudentMOOCRecord) => {
    setEditingRecord(record);
    setFormData({ ...record });
    setShowAddDialog(true);
  };

  const handleSave = async () => {
    if (!formData.registrationNumber || !formData.studentName || !formData.platform || !formData.courseName || !formData.certificationStatus) {
      toast({ title: 'Validation Error', description: 'Registration Number, Student Name, Platform, Course Name, and Certification Status are required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        registrationNumber: formData.registrationNumber.trim(),
        studentName: formData.studentName.trim(),
        platform: formData.platform.trim(),
        courseName: formData.courseName.trim(),
        certificationStatus: formData.certificationStatus.trim(),
        courseCategory: formData.courseCategory?.trim() || undefined,
        conductedBy: formData.conductedBy?.trim() || undefined,
        grade: formData.grade?.trim() || undefined,
        score: formData.score?.trim() || undefined,
        certificateId: formData.certificateId?.trim() || undefined,
        remarks: formData.remarks?.trim() || undefined,
        startDate: formData.startDate?.trim() || undefined,
        completionDate: formData.completionDate?.trim() || undefined,
        durationHours: formData.durationHours ? Number(formData.durationHours) : undefined,
        department: effectiveDepartment,
        academicYear,
      };

      if (editingRecord && editingRecord.id) {
        await updateStudentMOOC(editingRecord.id, academicYear, effectiveDeptId, payload, effectiveInstId);
        toast({ title: 'Success', description: 'MOOC record updated successfully.' });
      } else {
        await createStudentMOOC(academicYear, effectiveDeptId, payload, effectiveInstId);
        toast({ title: 'Success', description: 'MOOC record created successfully.' });
      }
      setShowAddDialog(false);
      setEditingRecord(null);
      setFormData({ ...EMPTY_RECORD, academicYear });
      fetchMOOCs();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to save MOOC record.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteClick = (record: StudentMOOCRecord) => {
    setDeleteConfirmRecord(record);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmRecord || !deleteConfirmRecord.id) return;
    setDeleting(true);
    try {
      await deleteStudentMOOC(deleteConfirmRecord.id, academicYear, effectiveDeptId);
      toast({ title: 'Deleted', description: 'MOOC record removed successfully.' });
      setDeleteConfirmRecord(null);
      fetchMOOCs();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to delete MOOC record.', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  // ── CSV Download ───────────────────────────────────────────────────────────
  const handleDownloadTemplate = async () => {
    try {
      const res = await downloadStudentMOOCsTemplate(effectiveDeptId, academicYear);
      if (typeof res === 'string' && res.length > 0) {
        const blob = new Blob([res], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `student_moocs_template_${academicYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }
    } catch (err) {
      console.warn('API template download fallback to local generation', err);
    }

    const headers = [
      'Registration Number',
      'Student Name',
      'Platform',
      'Course Name',
      'Course Category',
      'Conducted By',
      'Start Date',
      'Completion Date',
      'Duration (Hours)',
      'Grade',
      'Score',
      'Certification Status',
      'Certificate ID',
      'Academic Year',
      'Remarks',
    ];
    const sample = [
      'REG2025001',
      'Rahul Verma',
      'NPTEL',
      'Deep Learning',
      'AI/ML',
      'IIT Madras',
      '2025-01-15',
      '2025-04-10',
      '60',
      'Elite + Gold',
      '92%',
      'Certified',
      'NPTEL-DL-2025-001',
      '2025-26',
      'Completed with distinction',
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), sample.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `student_moocs_template_${academicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── CSV Upload ─────────────────────────────────────────────────────────────
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      await uploadStudentMOOCsCSV(effectiveDeptId, file, academicYear);
      toast({ title: 'Success', description: 'Student MOOCs CSV uploaded successfully.' });
      setShowCSVDialog(false);
      fetchMOOCs();
    } catch (err: any) {
      toast({ title: 'Upload Failed', description: err?.message || 'Failed to upload CSV.', variant: 'destructive' });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Evidence Handlers ───────────────────────────────────────────────────────
  const handleEvidenceUpload = async (file: File, category: string) => {
    toast({ title: 'Uploading Evidence', description: `Uploading ${file.name}...` });
    await uploadStudentEvidence(effectiveDeptId, academicYear, file, 'mooc-online-certifications', category, effectiveDepartment, `${category} for MOOC`);
    toast({ title: 'Success', description: 'Evidence document uploaded successfully.' });
    fetchEvidence();
  };

  const handleDownloadEvidence = async (doc: StudentEvidenceDocument) => {
    try {
      if (doc.id) {
        await downloadStudentEvidence(doc.id, academicYear, effectiveDeptId);
      }
      toast({ title: 'Downloading', description: `Downloading ${doc.name}...` });
    } catch (err) {
      toast({ title: 'Notice', description: `Downloading ${doc.name}...` });
    }
  };

  const handleDeleteEvidence = async (doc: StudentEvidenceDocument) => {
    try {
      if (doc.id) {
        await deleteStudentEvidence(doc.id, academicYear, effectiveDeptId);
      }
      setEvidenceList((prev) => prev.filter((d) => d.id !== doc.id));
      toast({ title: 'Deleted', description: 'Evidence document removed.' });
    } catch (err) {
      setEvidenceList((prev) => prev.filter((d) => d.id !== doc.id));
      toast({ title: 'Deleted', description: 'Evidence document removed.' });
    }
  };

  return (
    <div className="space-y-4 w-full min-w-0 max-w-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">MOOC / Online Certifications</h3>
            <p className="text-sm text-muted-foreground">
              Track student MOOCs, online certifications, and professional development courses
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
              <span className="text-muted-foreground">Department:</span>{' '}
              <span className="font-medium">{effectiveDepartment}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
              <span className="text-muted-foreground">Academic Year:</span>{' '}
              <span className="font-medium">{academicYear}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student, course, or platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {CERTIFICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={fetchMOOCs} disabled={loading} className="h-9 gap-1 text-xs">
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} /> Refresh
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowCSVDialog(true)}>
            <Upload className="h-3.5 w-3.5 mr-1" /> CSV Upload
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadTemplate}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingRecord(null);
              setFormData({ ...EMPTY_RECORD, academicYear });
              setShowAddDialog(true);
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Record
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto table-scroll-container max-h-[520px]">
            <table className="w-full text-xs min-w-[1350px]">
              <thead className="sticky top-0 z-20 bg-muted/80 backdrop-blur border-b border-border/60">
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium sticky left-0 bg-muted/95 backdrop-blur z-30 shadow-[1px_0_0_0_hsl(var(--border))]">Reg No</th>
                  <th className="text-left p-3 font-medium">Student Name</th>
                  <th className="text-left p-3 font-medium">Platform</th>
                  <th className="text-left p-3 font-medium">Course Name</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Completion</th>
                  <th className="text-left p-3 font-medium">Hours</th>
                  <th className="text-left p-3 font-medium">Grade</th>
                  <th className="text-left p-3 font-medium">Score</th>
                  <th className="text-left p-3 font-medium">Cert Status</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Evidence</th>
                  <th className="text-right p-3 font-medium sticky right-0 bg-muted/95 backdrop-blur z-30 shadow-[-1px_0_0_0_hsl(var(--border))]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={13} className="p-3">
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-8 text-muted-foreground">
                      <Globe className="h-8 w-8 mx-auto opacity-40 mb-2" />
                      <p className="text-sm">No MOOC / certification records found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-mono text-[10px] sticky left-0 bg-background/95 backdrop-blur z-10 shadow-[1px_0_0_0_hsl(var(--border))]">{row.registrationNumber}</td>
                      <td className="p-3 font-medium whitespace-nowrap">{row.studentName}</td>
                      <td className="p-3 whitespace-nowrap">
                        <Badge variant="outline" className="text-[10px] flex items-center gap-1 w-fit">
                          <Globe className="h-3 w-3" /> {row.platform}
                        </Badge>
                      </td>
                      <td className="p-3 max-w-[200px] truncate" title={row.courseName}>{row.courseName}</td>
                      <td className="p-3 whitespace-nowrap">{row.courseCategory || '-'}</td>
                      <td className="p-3 text-[10px] whitespace-nowrap">{row.completionDate || '-'}</td>
                      <td className="p-3 text-center">{row.durationHours || '-'}</td>
                      <td className="p-3 whitespace-nowrap">
                        <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          {row.grade || '-'}
                        </Badge>
                      </td>
                      <td className="p-3 whitespace-nowrap">{row.score || '-'}</td>
                      <td className="p-3 whitespace-nowrap">
                        <Badge variant={row.certificationStatus === 'Certified' ? 'default' : 'secondary'} className="text-[10px]">
                          {row.certificationStatus}
                        </Badge>
                      </td>
                      <td className="p-3 whitespace-nowrap">{getStatusBadge(row.status)}</td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[10px]"
                          onClick={() => {
                            setShowEvidenceDialog(true);
                          }}
                        >
                          <FileText className="h-3 w-3 mr-1" /> {evidenceList.length}
                        </Button>
                      </td>
                      <td className="p-3 text-right sticky right-0 bg-background/95 backdrop-blur z-10 shadow-[-1px_0_0_0_hsl(var(--border))]">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEdit(row)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteClick(row)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Showing {paginatedData.length} of {filtered.length} records</p>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-xs px-2">Page {currentPage} of {totalPages || 1}</span>
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* ── Evidence Upload Dialog ── */}
      <EvidenceUploadDialog
        open={showEvidenceDialog}
        onClose={() => setShowEvidenceDialog(false)}
        categories={MOOC_EVIDENCE}
        sectionLabel="MOOC / Online Certifications"
        onUpload={handleEvidenceUpload}
      />

      {/* Add / Edit Record Dialog */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingRecord(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{editingRecord ? 'Edit MOOC / Certification Record' : 'Add New MOOC / Certification Record'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs">Student Registration Number *</Label>
              <Input
                className="h-9 text-sm"
                placeholder="e.g., CS2022001"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Student Name *</Label>
              <Input
                className="h-9 text-sm"
                placeholder="Student name"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Platform *</Label>
              <Select
                value={formData.platform}
                onValueChange={(val) => setFormData({ ...formData, platform: val })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Course Name *</Label>
              <Input
                className="h-9 text-sm"
                placeholder="Course name"
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Course Category</Label>
              <Input
                className="h-9 text-sm"
                placeholder="e.g., AI/ML, Cloud Computing"
                value={formData.courseCategory || ''}
                onChange={(e) => setFormData({ ...formData, courseCategory: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Conducted By</Label>
              <Input
                className="h-9 text-sm"
                placeholder="e.g., IIT Madras"
                value={formData.conductedBy || ''}
                onChange={(e) => setFormData({ ...formData, conductedBy: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                className="h-9 text-sm"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Completion Date</Label>
              <Input
                type="date"
                className="h-9 text-sm"
                value={formData.completionDate || ''}
                onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Duration (Hours)</Label>
              <Input
                type="number"
                className="h-9 text-sm"
                placeholder="0"
                value={formData.durationHours ?? ''}
                onChange={(e) => setFormData({ ...formData, durationHours: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Grade</Label>
              <Input
                className="h-9 text-sm"
                placeholder="e.g., Elite + Gold"
                value={formData.grade || ''}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Score</Label>
              <Input
                className="h-9 text-sm"
                placeholder="e.g., 92%"
                value={formData.score || ''}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Certification Status *</Label>
              <Select
                value={formData.certificationStatus}
                onValueChange={(val) => setFormData({ ...formData, certificationStatus: val })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {CERTIFICATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Certificate ID</Label>
              <Input
                className="h-9 text-sm"
                placeholder="Certificate ID"
                value={formData.certificateId || ''}
                onChange={(e) => setFormData({ ...formData, certificateId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Academic Year *</Label>
              <Input
                className="h-9 text-sm"
                value={formData.academicYear || academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-xs">Remarks</Label>
              <Input
                className="h-9 text-sm"
                placeholder="Optional remarks"
                value={formData.remarks || ''}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setEditingRecord(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingRecord ? 'Update Record' : 'Save Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 6-Step CSV Upload Dialog ── */}
      {tabConfig && (
        <CSVUploadDialog
          open={showCSVDialog}
          onClose={() => setShowCSVDialog(false)}
          tabConfig={tabConfig}
          existingData={records as any}
          onUploadFile={async (file) => {
            await uploadStudentMOOCsCSV(effectiveDeptId, file, academicYear, effectiveInstId);
            await fetchMOOCs();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmRecord}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmRecord(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete the MOOC record for{' '}
            <span className="font-semibold text-foreground">
              {deleteConfirmRecord?.studentName} - {deleteConfirmRecord?.courseName}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmRecord(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

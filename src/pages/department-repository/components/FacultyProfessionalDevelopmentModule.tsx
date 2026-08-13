import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { getModuleTabActiveClasses } from './module-tab-styles';
import { EvidenceUploadDialog, EvidenceCategory } from '@/components/shared/EvidenceUploadDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Plus,
  Upload,
  Download,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Award,
  Users,
  Globe,
  BookOpen,
  Building2,
  FolderOpen,
  BarChart3,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  History,
  RefreshCw,
  Loader2,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  getMemberships,
  createMembership,
  updateMembership,
  deleteMembership,
  uploadMembershipsCSV,
  getFDPParticipations,
  createFDPParticipation,
  updateFDPParticipation,
  deleteFDPParticipation,
  uploadFDPParticipationsCSV,
  getResourcePersons,
  createResourcePerson,
  updateResourcePerson,
  deleteResourcePerson,
  uploadResourcePersonsCSV,
  getMOOCs,
  createMOOC,
  updateMOOC,
  deleteMOOC,
  uploadMOOCsCSV,
  getDeptOrganizedPrograms,
  createDeptOrganizedProgram,
  updateDeptOrganizedProgram,
  deleteDeptOrganizedProgram,
} from '@/services/faculty-repository.service';
import { toast } from 'sonner';

// ── Types ────────────────────────────────────────────────────────────────────

interface EvidenceItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedDate: string;
  status: string;
  version: string;
}

interface ProfessionalMembership {
  id: string | number;
  employeeId: string;
  facultyName: string;
  professionalSocietyName: string;
  societyType: string;
  membershipNumber: string;
  membershipGrade: string;
  positionHeld: string;
  membershipStartDate: string;
  membershipExpiryDate: string;
  activeStatus: string;
  remarks: string;
  status: string;
  evidence: EvidenceItem[];
}

interface FDPParticipation {
  id: string | number;
  employeeId: string;
  facultyName: string;
  programType: string;
  programTitle: string;
  themeArea: string;
  organizedBy: string;
  externalInternal: string;
  mode: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  location: string;
  academicYear: string;
  participationStatus: string;
  certificateReceived: string;
  remarks: string;
  status: string;
  evidence: EvidenceItem[];
}

interface ResourcePerson {
  id: string | number;
  employeeId: string;
  facultyName: string;
  eventType: string;
  eventName: string;
  topicDelivered: string;
  organizedBy: string;
  organization: string;
  location: string;
  mode: string;
  startDate: string;
  endDate: string;
  duration: string;
  audienceType: string;
  numberOfParticipants: number;
  academicYear: string;
  status: string;
  evidence: EvidenceItem[];
}

interface MOOCCertification {
  id: string | number;
  employeeId: string;
  facultyName: string;
  platform: string;
  courseName: string;
  courseCategory: string;
  conductedBy: string;
  startDate: string;
  completionDate: string;
  durationHours: number;
  grade: string;
  score: string;
  certificationStatus: string;
  certificateId: string;
  academicYear: string;
  status: string;
  evidence: EvidenceItem[];
}

interface DeptOrganizedFDP {
  id: string | number;
  programName: string;
  programType: string;
  theme: string;
  organizedBy: string;
  collaboratingOrganization: string;
  startDate: string;
  endDate: string;
  duration: string;
  chiefGuest: string;
  resourcePersons: string;
  numberOfParticipants: number;
  mode: string;
  academicYear: string;
  remarks: string;
  status: string;
  evidence: EvidenceItem[];
}

type SubTab = 'dashboard' | 'memberships' | 'fdp-participation' | 'resource-person' | 'moocs' | 'dept-organized' | 'supporting-docs';

interface FacultyProfessionalDevelopmentModuleProps {
  department: string;
  academicYear: string;
  departmentId?: number;
}

const facultyUploadCategories: EvidenceCategory[] = [
  { id: 'fdp', label: 'FDP Approval Letters', icon: <FileText className="h-4 w-4 text-primary" /> },
  { id: 'brochures', label: 'Event Brochures', icon: <FileText className="h-4 w-4 text-primary" /> },
  { id: 'attendance', label: 'Attendance Registers', icon: <Users className="h-4 w-4 text-primary" /> },
  { id: 'participants', label: 'Participant Lists', icon: <Users className="h-4 w-4 text-primary" /> },
  { id: 'feedback', label: 'Feedback Summaries', icon: <FileText className="h-4 w-4 text-primary" /> },
  { id: 'reports', label: 'Event Reports', icon: <FileText className="h-4 w-4 text-primary" /> },
  { id: 'photos', label: 'Geo-tagged Photographs', icon: <FileText className="h-4 w-4 text-primary" /> },
  { id: 'certificates', label: 'Certificates Issued', icon: <Award className="h-4 w-4 text-primary" /> },
  { id: 'circulars', label: 'Circulars & Notifications', icon: <FileText className="h-4 w-4 text-primary" /> },
];

export const FacultyProfessionalDevelopmentModule = ({
  department,
  academicYear,
  departmentId: propDeptId,
}: FacultyProfessionalDevelopmentModuleProps) => {
  const { user } = useAuth();
  const departmentId = propDeptId ?? user?.departmentId ?? 0;

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('dashboard');
  const activeClasses = getModuleTabActiveClasses('faculty');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Data lists
  const [memberships, setMemberships] = useState<ProfessionalMembership[]>([]);
  const [fdps, setFdps] = useState<FDPParticipation[]>([]);
  const [resourcePersons, setResourcePersons] = useState<ResourcePerson[]>([]);
  const [moocs, setMoocs] = useState<MOOCCertification[]>([]);
  const [deptOrganized, setDeptOrganized] = useState<DeptOrganizedFDP[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Dialogs
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string | number; title: string } | null>(null);

  const [showCSVDialog, setShowCSVDialog] = useState(false);
  const [selectedCSVFile, setSelectedCSVFile] = useState<File | null>(null);

  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | number | null>(null);
  const [showFacultyUpload, setShowFacultyUpload] = useState(false);

  // Generic form state for modals
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  // ── Fetch All Data ────────────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    if (!departmentId) return;
    setLoading(true);
    try {
      const [resM, resF, resR, resMooc, resDept] = await Promise.allSettled([
        getMemberships(academicYear, departmentId),
        getFDPParticipations(academicYear, departmentId),
        getResourcePersons(academicYear, departmentId),
        getMOOCs(academicYear, departmentId),
        getDeptOrganizedPrograms(academicYear, departmentId),
      ]);

      if (resM.status === 'fulfilled') {
        const items = resM.value?.data?.content ?? resM.value?.content ?? resM.value?.data ?? resM.value ?? [];
        setMemberships(Array.isArray(items) ? items.map((m: any) => ({ ...m, evidence: m.evidence || [] })) : []);
      }
      if (resF.status === 'fulfilled') {
        const items = resF.value?.data?.content ?? resF.value?.content ?? resF.value?.data ?? resF.value ?? [];
        setFdps(Array.isArray(items) ? items.map((f: any) => ({ ...f, evidence: f.evidence || [] })) : []);
      }
      if (resR.status === 'fulfilled') {
        const items = resR.value?.data?.content ?? resR.value?.content ?? resR.value?.data ?? resR.value ?? [];
        setResourcePersons(Array.isArray(items) ? items.map((r: any) => ({ ...r, evidence: r.evidence || [] })) : []);
      }
      if (resMooc.status === 'fulfilled') {
        const items = resMooc.value?.data?.content ?? resMooc.value?.content ?? resMooc.value?.data ?? resMooc.value ?? [];
        setMoocs(Array.isArray(items) ? items.map((o: any) => ({ ...o, evidence: o.evidence || [] })) : []);
      }
      if (resDept.status === 'fulfilled') {
        const items = resDept.value?.data?.content ?? resDept.value?.content ?? resDept.value?.data ?? resDept.value ?? [];
        setDeptOrganized(Array.isArray(items) ? items.map((d: any) => ({ ...d, evidence: d.evidence || [] })) : []);
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to load professional development data');
    } finally {
      setLoading(false);
    }
  }, [academicYear, departmentId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Status badge formatter
  const getStatusBadge = (status: string) => {
    const s = status || 'Approved';
    const variants: Record<string, { color: string; icon: React.ReactNode }> = {
      'Approved': { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="h-3 w-3" /> },
      'Uploaded': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Clock className="h-3 w-3" /> },
      'Draft': { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', icon: <AlertCircle className="h-3 w-3" /> },
      'Rejected': { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-3 w-3" /> },
      'Submitted': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock className="h-3 w-3" /> },
    };
    const variant = variants[s] || variants['Draft'];
    return (
      <Badge className={`${variant.color} flex items-center gap-1 text-[10px] font-medium px-2 py-0.5`}>
        {variant.icon}
        {s}
      </Badge>
    );
  };

  // ── Open Add Modal ────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormValues({});
    setShowAddDialog(true);
  };

  // ── Open Edit Modal ───────────────────────────────────────────────────────
  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormValues({ ...item });
    setShowAddDialog(true);
  };

  // ── Save (Create / Update) ────────────────────────────────────────────────
  const handleSaveForm = async () => {
    if (!departmentId) return;
    setSaving(true);
    try {
      const payload = { ...formValues, academicYear };
      if (activeSubTab === 'memberships') {
        if (editingItem?.id) await updateMembership(editingItem.id, academicYear, departmentId, payload);
        else await createMembership(academicYear, departmentId, payload);
      } else if (activeSubTab === 'fdp-participation') {
        if (editingItem?.id) await updateFDPParticipation(editingItem.id, academicYear, departmentId, payload);
        else await createFDPParticipation(academicYear, departmentId, payload);
      } else if (activeSubTab === 'resource-person') {
        if (editingItem?.id) await updateResourcePerson(editingItem.id, academicYear, departmentId, payload);
        else await createResourcePerson(academicYear, departmentId, payload);
      } else if (activeSubTab === 'moocs') {
        if (editingItem?.id) await updateMOOC(editingItem.id, academicYear, departmentId, payload);
        else await createMOOC(academicYear, departmentId, payload);
      } else if (activeSubTab === 'dept-organized') {
        if (editingItem?.id) await updateDeptOrganizedProgram(editingItem.id, academicYear, departmentId, payload);
        else await createDeptOrganizedProgram(academicYear, departmentId, payload);
      }
      toast.success(editingItem ? 'Record updated successfully' : 'Record added successfully');
      setShowAddDialog(false);
      setEditingItem(null);
      setFormValues({});
      fetchAllData();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteClick = (id: string | number, title: string) => {
    setDeleteTarget({ id, title });
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !departmentId) return;
    setDeleting(true);
    try {
      if (activeSubTab === 'memberships') await deleteMembership(deleteTarget.id, academicYear, departmentId);
      else if (activeSubTab === 'fdp-participation') await deleteFDPParticipation(deleteTarget.id, academicYear, departmentId);
      else if (activeSubTab === 'resource-person') await deleteResourcePerson(deleteTarget.id, academicYear, departmentId);
      else if (activeSubTab === 'moocs') await deleteMOOC(deleteTarget.id, academicYear, departmentId);
      else if (activeSubTab === 'dept-organized') await deleteDeptOrganizedProgram(deleteTarget.id, academicYear, departmentId);

      toast.success('Record deleted successfully');
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      fetchAllData();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  // ── CSV Upload ────────────────────────────────────────────────────────────
  const handleCSVUpload = async () => {
    if (!selectedCSVFile || !departmentId) return;
    setUploading(true);
    try {
      if (activeSubTab === 'memberships') await uploadMembershipsCSV(departmentId, selectedCSVFile, academicYear);
      else if (activeSubTab === 'fdp-participation') await uploadFDPParticipationsCSV(departmentId, selectedCSVFile, academicYear);
      else if (activeSubTab === 'resource-person') await uploadResourcePersonsCSV(departmentId, selectedCSVFile, academicYear);
      else if (activeSubTab === 'moocs') await uploadMOOCsCSV(departmentId, selectedCSVFile, academicYear);

      toast.success('CSV uploaded successfully');
      setShowCSVDialog(false);
      setSelectedCSVFile(null);
      fetchAllData();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  // ── Template Download ─────────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    let headers: string[] = [];
    let sample: string[] = [];
    let filename = `template_${activeSubTab}_${academicYear}.csv`;

    if (activeSubTab === 'memberships') {
      headers = ['Employee ID', 'Faculty Name', 'Professional Society Name', 'Society Type', 'Membership Number', 'Membership Grade', 'Position Held', 'Start Date', 'Expiry Date', 'Active Status', 'Remarks'];
      sample = ['CSE001', 'Dr. Ramesh Kumar', 'IEEE', 'International', 'IEEE-98765432', 'Senior Member', 'Chapter Chair', '2018-06-15', '2026-06-14', 'Active', ''];
    } else if (activeSubTab === 'fdp-participation') {
      headers = ['Employee ID', 'Faculty Name', 'Program Type', 'Program Title', 'Theme Area', 'Organized By', 'External/Internal', 'Mode', 'Start Date', 'End Date', 'Duration Days', 'Location', 'Participation Status', 'Certificate Received'];
      sample = ['CSE001', 'Dr. Ramesh Kumar', 'FDP', 'Machine Learning for Engineering', 'AI/ML', 'IIT Madras', 'External', 'Online', '2025-06-10', '2025-06-14', '5', 'Online', 'Completed', 'Yes'];
    } else if (activeSubTab === 'resource-person') {
      headers = ['Employee ID', 'Faculty Name', 'Event Type', 'Event Name', 'Topic Delivered', 'Organized By', 'Organization', 'Location', 'Mode', 'Start Date', 'End Date', 'Duration', 'Audience Type', 'Number of Participants'];
      sample = ['CSE001', 'Dr. Ramesh Kumar', 'FDP', 'AI in Healthcare', 'Deep Learning for Medical Imaging', 'VIT University', 'VIT Vellore', 'Vellore', 'Offline', '2025-05-10', '2025-05-10', '3 Hours', 'Faculty', '45'];
    } else if (activeSubTab === 'moocs') {
      headers = ['Employee ID', 'Faculty Name', 'Platform', 'Course Name', 'Course Category', 'Conducted By', 'Start Date', 'Completion Date', 'Duration Hours', 'Grade', 'Score', 'Certification Status', 'Certificate ID'];
      sample = ['CSE001', 'Dr. Ramesh Kumar', 'NPTEL', 'Deep Learning', 'AI/ML', 'IIT Madras', '2025-01-15', '2025-04-10', '60', 'Elite + Gold', '92%', 'Certified', 'NPTEL-DL-2025-001'];
    }

    const csv = [headers.join(','), sample.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render Dashboard ──────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Professional Memberships', value: memberships.length, icon: Award, color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30' },
          { label: 'FDP / STTP Participations', value: fdps.length, icon: BookOpen, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Faculty as Resource Person', value: resourcePersons.length, icon: Users, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'MOOCs Completed', value: moocs.length, icon: Globe, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Dept FDPs Organized', value: deptOrganized.length, icon: Building2, color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30' },
          { label: 'Total Activities', value: memberships.length + fdps.length + resourcePersons.length + moocs.length + deptOrganized.length, icon: BarChart3, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
          { label: 'Verified Records', value: memberships.length + fdps.length, icon: CheckCircle2, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30' },
          { label: 'Pending Review', value: 0, icon: Clock, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${kpi.color}`}>
                  <kpi.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '...' : kpi.value}</p>
                  <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Professional Memberships', count: memberships.length, pct: memberships.length ? 100 : 0 },
            { label: 'FDP / STTP Participation', count: fdps.length, pct: fdps.length ? 100 : 0 },
            { label: 'Faculty as Resource Person', count: resourcePersons.length, pct: resourcePersons.length ? 100 : 0 },
            { label: 'MOOCs / Online Certifications', count: moocs.length, pct: moocs.length ? 100 : 0 },
            { label: 'Department Organized FDP/STTP', count: deptOrganized.length, pct: deptOrganized.length ? 100 : 0 },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.count} records</span>
              </div>
              <Progress value={item.pct} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  // ── Render Memberships ────────────────────────────────────────────────────
  const renderMemberships = () => {
    const filtered = memberships.filter((m) => {
      const matchSearch = !searchQuery || m.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) || m.professionalSocietyName.toLowerCase().includes(searchQuery.toLowerCase()) || m.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'all' || m.status === filterStatus;
      return matchSearch && matchStatus;
    });

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search memberships..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Uploaded">Uploaded</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowCSVDialog(true)}>
              <Upload className="h-3.5 w-3.5 mr-1" /> CSV Upload
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownloadTemplate}>
              <Download className="h-3.5 w-3.5 mr-1" /> Template
            </Button>
            <Button size="sm" onClick={handleOpenAdd}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Record
            </Button>
          </div>
        </div>

        <Card className="border-border/50 w-full min-w-0 max-w-full overflow-hidden shadow-sm">
          <CardContent className="p-0 w-full min-w-0 max-w-full overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                <Award className="h-10 w-10 mx-auto mb-2 opacity-30" />
                No membership records found for {academicYear}
              </div>
            ) : (
              <div className="w-full table-scroll-container max-h-[520px]">
                <table className="w-full text-xs text-left min-w-[1350px] border-collapse">
                  <thead className="sticky top-0 z-20 bg-muted/80 backdrop-blur border-b border-border/60">
                    <tr>
                      <th className="p-3 font-semibold whitespace-nowrap w-28 sticky left-0 bg-muted/95 backdrop-blur z-30 shadow-[1px_0_0_0_hsl(var(--border))]">Employee ID</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-44">Faculty Name</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-48">Society Name</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Type</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-36">Membership #</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Grade</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-32">Position</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Start Date</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Expiry</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-24">Active</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Status</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-24 text-center">Evidence</th>
                      <th className="p-3 font-semibold text-right whitespace-nowrap w-24 sticky right-0 bg-muted/95 backdrop-blur z-30 shadow-[-1px_0_0_0_hsl(var(--border))]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filtered.map((row) => (
                      <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                        <td className="p-3 font-mono sticky left-0 bg-background/95 backdrop-blur z-10 shadow-[1px_0_0_0_hsl(var(--border))]">{row.employeeId}</td>
                        <td className="p-3 font-medium whitespace-nowrap">{row.facultyName}</td>
                        <td className="p-3 whitespace-nowrap">{row.professionalSocietyName}</td>
                        <td className="p-3 whitespace-nowrap"><Badge variant="outline" className="text-[10px] px-2 py-0.5">{row.societyType}</Badge></td>
                        <td className="p-3 font-mono text-[11px] whitespace-nowrap">{row.membershipNumber}</td>
                        <td className="p-3 whitespace-nowrap">{row.membershipGrade || '-'}</td>
                        <td className="p-3 whitespace-nowrap">{row.positionHeld || '-'}</td>
                        <td className="p-3 whitespace-nowrap">{row.membershipStartDate}</td>
                        <td className="p-3 whitespace-nowrap">{row.membershipExpiryDate || '-'}</td>
                        <td className="p-3 whitespace-nowrap"><Badge variant={row.activeStatus === 'Active' ? 'default' : 'secondary'} className="text-[10px] px-2 py-0.5">{row.activeStatus}</Badge></td>
                        <td className="p-3 whitespace-nowrap">{getStatusBadge(row.status)}</td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2" onClick={() => { setSelectedRecordId(row.id); setShowEvidenceDialog(true); }}>
                            <FileText className="h-3 w-3 mr-1" /> {row.evidence?.length || 0}
                          </Button>
                        </td>
                        <td className="p-3 text-right sticky right-0 bg-background/95 backdrop-blur z-10 shadow-[-1px_0_0_0_hsl(var(--border))]">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleOpenEdit(row)}><Edit2 className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(row.id, `${row.facultyName} - ${row.professionalSocietyName}`)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ── Render FDP Participation ──────────────────────────────────────────────
  const renderFDPParticipation = () => {
    const filtered = fdps.filter((m) => {
      const matchSearch = !searchQuery || m.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) || m.programTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'all' || m.status === filterStatus;
      return matchSearch && matchStatus;
    });

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search FDP/STTP..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Uploaded">Uploaded</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowCSVDialog(true)}>
              <Upload className="h-3.5 w-3.5 mr-1" /> CSV Upload
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownloadTemplate}>
              <Download className="h-3.5 w-3.5 mr-1" /> Template
            </Button>
            <Button size="sm" onClick={handleOpenAdd}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Record
            </Button>
          </div>
        </div>

        <Card className="border-border/50 w-full min-w-0 max-w-full overflow-hidden shadow-sm">
          <CardContent className="p-0 w-full min-w-0 max-w-full overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
                No FDP/STTP participation records found for {academicYear}
              </div>
            ) : (
              <div className="w-full table-scroll-container max-h-[520px]">
                <table className="w-full text-xs text-left min-w-[1450px] border-collapse">
                  <thead className="sticky top-0 z-20 bg-muted/80 backdrop-blur border-b border-border/60">
                    <tr>
                      <th className="p-3 font-semibold whitespace-nowrap w-28 sticky left-0 bg-muted/95 backdrop-blur z-30 shadow-[1px_0_0_0_hsl(var(--border))]">Emp ID</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-44">Faculty Name</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-24">Type</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-64">Program Title</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-36">Theme</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-44">Organized By</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-24">Ext/Int</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-24">Mode</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Start</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">End</th>
                      <th className="p-3 font-semibold whitespace-nowrap text-center w-20">Days</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Status</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-24 text-center">Evidence</th>
                      <th className="p-3 font-semibold text-right whitespace-nowrap w-24 sticky right-0 bg-muted/95 backdrop-blur z-30 shadow-[-1px_0_0_0_hsl(var(--border))]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filtered.map((row) => (
                      <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                        <td className="p-3 font-mono sticky left-0 bg-background/95 backdrop-blur z-10 shadow-[1px_0_0_0_hsl(var(--border))]">{row.employeeId}</td>
                        <td className="p-3 font-medium whitespace-nowrap">{row.facultyName}</td>
                        <td className="p-3 whitespace-nowrap"><Badge variant="outline" className="text-[10px] px-2 py-0.5">{row.programType}</Badge></td>
                        <td className="p-3 font-medium whitespace-nowrap">{row.programTitle}</td>
                        <td className="p-3 whitespace-nowrap">{row.themeArea}</td>
                        <td className="p-3 whitespace-nowrap">{row.organizedBy}</td>
                        <td className="p-3 whitespace-nowrap">{row.externalInternal}</td>
                        <td className="p-3 whitespace-nowrap">{row.mode}</td>
                        <td className="p-3 whitespace-nowrap">{row.startDate}</td>
                        <td className="p-3 whitespace-nowrap">{row.endDate}</td>
                        <td className="p-3 text-center whitespace-nowrap font-medium">{row.durationDays}</td>
                        <td className="p-3 whitespace-nowrap">{getStatusBadge(row.status)}</td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2" onClick={() => { setSelectedRecordId(row.id); setShowEvidenceDialog(true); }}>
                            <FileText className="h-3 w-3 mr-1" /> {row.evidence?.length || 0}
                          </Button>
                        </td>
                        <td className="p-3 text-right sticky right-0 bg-background/95 backdrop-blur z-10 shadow-[-1px_0_0_0_hsl(var(--border))]">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleOpenEdit(row)}><Edit2 className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(row.id, `${row.facultyName} - ${row.programTitle}`)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ── Render Resource Person ────────────────────────────────────────────────
  const renderResourcePerson = () => {
    const filtered = resourcePersons.filter((m) => {
      const matchSearch = !searchQuery || m.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) || m.eventName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'all' || m.status === filterStatus;
      return matchSearch && matchStatus;
    });

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search resource person records..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Uploaded">Uploaded</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowCSVDialog(true)}>
              <Upload className="h-3.5 w-3.5 mr-1" /> CSV Upload
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownloadTemplate}>
              <Download className="h-3.5 w-3.5 mr-1" /> Template
            </Button>
            <Button size="sm" onClick={handleOpenAdd}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Record
            </Button>
          </div>
        </div>

        <Card className="border-border/50 w-full min-w-0 max-w-full overflow-hidden shadow-sm">
          <CardContent className="p-0 w-full min-w-0 max-w-full overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                No resource person records found for {academicYear}
              </div>
            ) : (
              <div className="w-full table-scroll-container max-h-[520px]">
                <table className="w-full text-xs text-left min-w-[1400px] border-collapse">
                  <thead className="sticky top-0 z-20 bg-muted/80 backdrop-blur border-b border-border/60">
                    <tr>
                      <th className="p-3 font-semibold whitespace-nowrap w-28 sticky left-0 bg-muted/95 backdrop-blur z-30 shadow-[1px_0_0_0_hsl(var(--border))]">Emp ID</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-44">Faculty Name</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Event Type</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-48">Event Name</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-48">Topic</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-44">Organized By</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-24">Mode</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Date</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Duration</th>
                      <th className="p-3 font-semibold whitespace-nowrap text-center w-28">Participants</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Status</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-24 text-center">Evidence</th>
                      <th className="p-3 font-semibold text-right whitespace-nowrap w-24 sticky right-0 bg-muted/95 backdrop-blur z-30 shadow-[-1px_0_0_0_hsl(var(--border))]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filtered.map((row) => (
                      <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                        <td className="p-3 font-mono sticky left-0 bg-background/95 backdrop-blur z-10 shadow-[1px_0_0_0_hsl(var(--border))]">{row.employeeId}</td>
                        <td className="p-3 font-medium whitespace-nowrap">{row.facultyName}</td>
                        <td className="p-3 whitespace-nowrap"><Badge variant="outline" className="text-[10px] px-2 py-0.5">{row.eventType}</Badge></td>
                        <td className="p-3 font-medium whitespace-nowrap">{row.eventName}</td>
                        <td className="p-3 whitespace-nowrap">{row.topicDelivered}</td>
                        <td className="p-3 whitespace-nowrap">{row.organizedBy}</td>
                        <td className="p-3 whitespace-nowrap">{row.mode}</td>
                        <td className="p-3 whitespace-nowrap">{row.startDate}</td>
                        <td className="p-3 whitespace-nowrap">{row.duration}</td>
                        <td className="p-3 text-center whitespace-nowrap">{row.numberOfParticipants}</td>
                        <td className="p-3 whitespace-nowrap">{getStatusBadge(row.status)}</td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2" onClick={() => { setSelectedRecordId(row.id); setShowEvidenceDialog(true); }}>
                            <FileText className="h-3 w-3 mr-1" /> {row.evidence?.length || 0}
                          </Button>
                        </td>
                        <td className="p-3 text-right sticky right-0 bg-background/95 backdrop-blur z-10 shadow-[-1px_0_0_0_hsl(var(--border))]">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleOpenEdit(row)}><Edit2 className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(row.id, `${row.facultyName} - ${row.eventName}`)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ── Render MOOCs ──────────────────────────────────────────────────────────
  const renderMOOCs = () => {
    const filtered = moocs.filter((m) => {
      const matchSearch = !searchQuery || m.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) || m.courseName.toLowerCase().includes(searchQuery.toLowerCase()) || m.platform.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'all' || m.status === filterStatus;
      return matchSearch && matchStatus;
    });

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search MOOCs / certifications..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Uploaded">Uploaded</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowCSVDialog(true)}>
              <Upload className="h-3.5 w-3.5 mr-1" /> CSV Upload
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownloadTemplate}>
              <Download className="h-3.5 w-3.5 mr-1" /> Template
            </Button>
            <Button size="sm" onClick={handleOpenAdd}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Record
            </Button>
          </div>
        </div>

        <Card className="border-border/50 w-full min-w-0 max-w-full overflow-hidden shadow-sm">
          <CardContent className="p-0 w-full min-w-0 max-w-full overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                <Globe className="h-10 w-10 mx-auto mb-2 opacity-30" />
                No MOOC certifications found for {academicYear}
              </div>
            ) : (
              <div className="w-full table-scroll-container max-h-[520px]">
                <table className="w-full text-xs text-left min-w-[1350px] border-collapse">
                  <thead className="sticky top-0 z-20 bg-muted/80 backdrop-blur border-b border-border/60">
                    <tr>
                      <th className="p-3 font-semibold whitespace-nowrap w-28 sticky left-0 bg-muted/95 backdrop-blur z-30 shadow-[1px_0_0_0_hsl(var(--border))]">Emp ID</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-44">Faculty Name</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Platform</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-48">Course Name</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-36">Category</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-44">Conducted By</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Start</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Completion</th>
                      <th className="p-3 font-semibold whitespace-nowrap text-center w-20">Hours</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Status</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-24 text-center">Evidence</th>
                      <th className="p-3 font-semibold text-right whitespace-nowrap w-24 sticky right-0 bg-muted/95 backdrop-blur z-30 shadow-[-1px_0_0_0_hsl(var(--border))]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filtered.map((row) => (
                      <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                        <td className="p-3 font-mono sticky left-0 bg-background/95 backdrop-blur z-10 shadow-[1px_0_0_0_hsl(var(--border))]">{row.employeeId}</td>
                        <td className="p-3 font-medium whitespace-nowrap">{row.facultyName}</td>
                        <td className="p-3 whitespace-nowrap"><Badge variant="outline" className="text-[10px] px-2 py-0.5">{row.platform}</Badge></td>
                        <td className="p-3 font-medium whitespace-nowrap">{row.courseName}</td>
                        <td className="p-3 whitespace-nowrap">{row.courseCategory}</td>
                        <td className="p-3 whitespace-nowrap">{row.conductedBy}</td>
                        <td className="p-3 whitespace-nowrap">{row.startDate}</td>
                        <td className="p-3 whitespace-nowrap">{row.completionDate}</td>
                        <td className="p-3 text-center whitespace-nowrap font-medium">{row.durationHours}</td>
                        <td className="p-3 whitespace-nowrap">{getStatusBadge(row.status)}</td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2" onClick={() => { setSelectedRecordId(row.id); setShowEvidenceDialog(true); }}>
                            <FileText className="h-3 w-3 mr-1" /> {row.evidence?.length || 0}
                          </Button>
                        </td>
                        <td className="p-3 text-right sticky right-0 bg-background/95 backdrop-blur z-10 shadow-[-1px_0_0_0_hsl(var(--border))]">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleOpenEdit(row)}><Edit2 className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(row.id, `${row.facultyName} - ${row.courseName}`)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ── Render Dept Organized ─────────────────────────────────────────────────
  const renderDeptOrganized = () => {
    const filtered = deptOrganized.filter((m) => {
      const matchSearch = !searchQuery || m.programName.toLowerCase().includes(searchQuery.toLowerCase()) || m.theme.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'all' || m.status === filterStatus;
      return matchSearch && matchStatus;
    });

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search department organized programs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Uploaded">Uploaded</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleOpenAdd}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Record
            </Button>
          </div>
        </div>

        <Card className="border-border/50 w-full min-w-0 max-w-full overflow-hidden shadow-sm">
          <CardContent className="p-0 w-full min-w-0 max-w-full overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                No department organized programs found for {academicYear}
              </div>
            ) : (
              <div className="w-full table-scroll-container max-h-[520px]">
                <table className="w-full text-xs text-left min-w-[1450px] border-collapse">
                  <thead className="sticky top-0 z-20 bg-muted/80 backdrop-blur border-b border-border/60">
                    <tr>
                      <th className="p-3 font-semibold whitespace-nowrap w-48 sticky left-0 bg-muted/95 backdrop-blur z-30 shadow-[1px_0_0_0_hsl(var(--border))]">Program Name</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Type</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-36">Theme</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-44">Collaborator</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Start</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">End</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Duration</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-36">Chief Guest</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-44">Resource Persons</th>
                      <th className="p-3 font-semibold whitespace-nowrap text-center w-24">Participants</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-24">Mode</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-28">Status</th>
                      <th className="p-3 font-semibold whitespace-nowrap w-24 text-center">Evidence</th>
                      <th className="p-3 font-semibold text-right whitespace-nowrap w-24 sticky right-0 bg-muted/95 backdrop-blur z-30 shadow-[-1px_0_0_0_hsl(var(--border))]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filtered.map((row) => (
                      <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                        <td className="p-3 font-medium whitespace-nowrap sticky left-0 bg-background/95 backdrop-blur z-10 shadow-[1px_0_0_0_hsl(var(--border))]">{row.programName}</td>
                        <td className="p-3 whitespace-nowrap"><Badge variant="outline" className="text-[10px] px-2 py-0.5">{row.programType}</Badge></td>
                        <td className="p-3 whitespace-nowrap">{row.theme}</td>
                        <td className="p-3 whitespace-nowrap">{row.collaboratingOrganization || '-'}</td>
                        <td className="p-3 whitespace-nowrap">{row.startDate}</td>
                        <td className="p-3 whitespace-nowrap">{row.endDate}</td>
                        <td className="p-3 whitespace-nowrap">{row.duration}</td>
                        <td className="p-3 whitespace-nowrap">{row.chiefGuest || '-'}</td>
                        <td className="p-3 whitespace-nowrap">{row.resourcePersons || '-'}</td>
                        <td className="p-3 text-center whitespace-nowrap font-medium">{row.numberOfParticipants}</td>
                        <td className="p-3 whitespace-nowrap">{row.mode}</td>
                        <td className="p-3 whitespace-nowrap">{getStatusBadge(row.status)}</td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2" onClick={() => { setSelectedRecordId(row.id); setShowEvidenceDialog(true); }}>
                            <FileText className="h-3 w-3 mr-1" /> {row.evidence?.length || 0}
                          </Button>
                        </td>
                        <td className="p-3 text-right sticky right-0 bg-background/95 backdrop-blur z-10 shadow-[-1px_0_0_0_hsl(var(--border))]">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleOpenEdit(row)}><Edit2 className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteClick(row.id, row.programName)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // ── Render Supporting Docs ────────────────────────────────────────────────
  const renderSupportingDocs = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Supporting Documents</h3>
        <Button size="sm" onClick={() => setShowFacultyUpload(true)}>
          <Upload className="h-3.5 w-3.5 mr-1" /> Upload Document
        </Button>
      </div>

      <EvidenceUploadDialog
        open={showFacultyUpload}
        onClose={() => setShowFacultyUpload(false)}
        title="Faculty Professional Development Documents"
        subtitle="Upload FDP & professional development evidence documents"
        categories={facultyUploadCategories}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: 'FDP Approval Letters', count: 3, icon: FileText },
          { name: 'Event Brochures', count: 5, icon: FileText },
          { name: 'Attendance Registers', count: 4, icon: FileText },
          { name: 'Participant Lists', count: 6, icon: Users },
          { name: 'Feedback Summaries', count: 3, icon: FileText },
          { name: 'Event Reports', count: 4, icon: FileText },
          { name: 'Geo-tagged Photographs', count: 12, icon: FileText },
          { name: 'Certificates Issued', count: 8, icon: Award },
          { name: 'Circulars & Notifications', count: 5, icon: FileText },
        ].map((doc) => (
          <Card key={doc.name} className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <doc.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">{doc.name}</p>
                  <p className="text-[10px] text-muted-foreground">{doc.count} documents</p>
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 w-full min-w-0 max-w-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Faculty Professional Development</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Maintain all faculty professional development activities for {academicYear}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
              <span className="text-muted-foreground">Department:</span>{' '}
              <span className="font-medium">{department}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
              <span className="text-muted-foreground">Academic Year:</span>{' '}
              <span className="font-medium">{academicYear}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchAllData} disabled={loading} className="gap-1 text-xs">
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} /> Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Sub-tabs Navigation */}
      <Tabs value={activeSubTab} onValueChange={(v) => { setActiveSubTab(v as SubTab); setSearchQuery(''); setFilterStatus('all'); setCurrentPage(1); }} className="w-full min-w-0 max-w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl flex-wrap gap-0.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'memberships', label: 'Professional Memberships', icon: Award },
            { id: 'fdp-participation', label: 'FDP / STTP Participation', icon: BookOpen },
            { id: 'resource-person', label: 'Faculty as Resource Person', icon: Users },
            { id: 'moocs', label: 'MOOCs / Online Certifications', icon: Globe },
            { id: 'dept-organized', label: 'Dept Organized FDP/STTP', icon: Building2 },
            { id: 'supporting-docs', label: 'Supporting Documents', icon: FolderOpen },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
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
                <tab.icon className={cn('h-3.5 w-3.5', isActive && activeClasses.icon)} />
                <span className="hidden lg:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">{renderDashboard()}</TabsContent>
        <TabsContent value="memberships" className="mt-4">{renderMemberships()}</TabsContent>
        <TabsContent value="fdp-participation" className="mt-4">{renderFDPParticipation()}</TabsContent>
        <TabsContent value="resource-person" className="mt-4">{renderResourcePerson()}</TabsContent>
        <TabsContent value="moocs" className="mt-4">{renderMOOCs()}</TabsContent>
        <TabsContent value="dept-organized" className="mt-4">{renderDeptOrganized()}</TabsContent>
        <TabsContent value="supporting-docs" className="mt-4">{renderSupportingDocs()}</TabsContent>
      </Tabs>

      {/* ── Add / Edit Modal ── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editingItem ? 'Edit Record' : 'Add New Record'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {activeSubTab === 'memberships' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Employee ID *</Label>
                  <Input className="h-9 text-sm" placeholder="e.g., CSE001" value={formValues.employeeId || ''} onChange={(e) => setFormValues({ ...formValues, employeeId: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Faculty Name *</Label>
                  <Input className="h-9 text-sm" placeholder="Faculty name" value={formValues.facultyName || ''} onChange={(e) => setFormValues({ ...formValues, facultyName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Professional Society *</Label>
                  <Input className="h-9 text-sm" placeholder="e.g., IEEE, ACM" value={formValues.professionalSocietyName || ''} onChange={(e) => setFormValues({ ...formValues, professionalSocietyName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Society Type *</Label>
                  <Select value={formValues.societyType || ''} onValueChange={(v) => setFormValues({ ...formValues, societyType: v })}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent><SelectItem value="National">National</SelectItem><SelectItem value="International">International</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Membership Number *</Label>
                  <Input className="h-9 text-sm" placeholder="Membership #" value={formValues.membershipNumber || ''} onChange={(e) => setFormValues({ ...formValues, membershipNumber: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Membership Grade</Label>
                  <Input className="h-9 text-sm" placeholder="e.g., Senior Member" value={formValues.membershipGrade || ''} onChange={(e) => setFormValues({ ...formValues, membershipGrade: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Position Held</Label>
                  <Input className="h-9 text-sm" placeholder="e.g., Chapter Chair" value={formValues.positionHeld || ''} onChange={(e) => setFormValues({ ...formValues, positionHeld: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Start Date *</Label>
                  <Input type="date" className="h-9 text-sm" value={formValues.membershipStartDate || ''} onChange={(e) => setFormValues({ ...formValues, membershipStartDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Expiry Date</Label>
                  <Input type="date" className="h-9 text-sm" value={formValues.membershipExpiryDate || ''} onChange={(e) => setFormValues({ ...formValues, membershipExpiryDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Active Status *</Label>
                  <Select value={formValues.activeStatus || 'Active'} onValueChange={(v) => setFormValues({ ...formValues, activeStatus: v })}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Expired">Expired</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-xs">Remarks</Label>
                  <Input className="h-9 text-sm" placeholder="Optional remarks" value={formValues.remarks || ''} onChange={(e) => setFormValues({ ...formValues, remarks: e.target.value })} />
                </div>
              </div>
            )}

            {activeSubTab === 'fdp-participation' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Employee ID *</Label>
                  <Input className="h-9 text-sm" placeholder="e.g., CSE001" value={formValues.employeeId || ''} onChange={(e) => setFormValues({ ...formValues, employeeId: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Faculty Name *</Label>
                  <Input className="h-9 text-sm" placeholder="Faculty name" value={formValues.facultyName || ''} onChange={(e) => setFormValues({ ...formValues, facultyName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Program Type *</Label>
                  <Select value={formValues.programType || ''} onValueChange={(v) => setFormValues({ ...formValues, programType: v })}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="FDP">FDP</SelectItem><SelectItem value="STTP">STTP</SelectItem><SelectItem value="Workshop">Workshop</SelectItem><SelectItem value="Seminar">Seminar</SelectItem><SelectItem value="Conference">Conference</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Program Title *</Label>
                  <Input className="h-9 text-sm" placeholder="Program title" value={formValues.programTitle || ''} onChange={(e) => setFormValues({ ...formValues, programTitle: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Theme / Area</Label>
                  <Input className="h-9 text-sm" placeholder="e.g., AI/ML" value={formValues.themeArea || ''} onChange={(e) => setFormValues({ ...formValues, themeArea: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Organized By *</Label>
                  <Input className="h-9 text-sm" placeholder="Organization" value={formValues.organizedBy || ''} onChange={(e) => setFormValues({ ...formValues, organizedBy: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">External / Internal *</Label>
                  <Select value={formValues.externalInternal || ''} onValueChange={(v) => setFormValues({ ...formValues, externalInternal: v })}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="External">External</SelectItem><SelectItem value="Internal">Internal</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Mode *</Label>
                  <Select value={formValues.mode || ''} onValueChange={(v) => setFormValues({ ...formValues, mode: v })}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Online">Online</SelectItem><SelectItem value="Offline">Offline</SelectItem><SelectItem value="Hybrid">Hybrid</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Start Date *</Label>
                  <Input type="date" className="h-9 text-sm" value={formValues.startDate || ''} onChange={(e) => setFormValues({ ...formValues, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">End Date *</Label>
                  <Input type="date" className="h-9 text-sm" value={formValues.endDate || ''} onChange={(e) => setFormValues({ ...formValues, endDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Duration (Days)</Label>
                  <Input type="number" className="h-9 text-sm" placeholder="5" value={formValues.durationDays || ''} onChange={(e) => setFormValues({ ...formValues, durationDays: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Location</Label>
                  <Input className="h-9 text-sm" placeholder="Location" value={formValues.location || ''} onChange={(e) => setFormValues({ ...formValues, location: e.target.value })} />
                </div>
              </div>
            )}

            {activeSubTab === 'resource-person' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Employee ID *</Label>
                  <Input className="h-9 text-sm" placeholder="e.g., CSE001" value={formValues.employeeId || ''} onChange={(e) => setFormValues({ ...formValues, employeeId: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Faculty Name *</Label>
                  <Input className="h-9 text-sm" placeholder="Faculty name" value={formValues.facultyName || ''} onChange={(e) => setFormValues({ ...formValues, facultyName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Event Type *</Label>
                  <Select value={formValues.eventType || ''} onValueChange={(v) => setFormValues({ ...formValues, eventType: v })}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="FDP">FDP</SelectItem><SelectItem value="STTP">STTP</SelectItem><SelectItem value="Workshop">Workshop</SelectItem><SelectItem value="Seminar">Seminar</SelectItem><SelectItem value="Conference">Conference</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Event Name *</Label>
                  <Input className="h-9 text-sm" placeholder="Event name" value={formValues.eventName || ''} onChange={(e) => setFormValues({ ...formValues, eventName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Topic Delivered *</Label>
                  <Input className="h-9 text-sm" placeholder="Topic" value={formValues.topicDelivered || ''} onChange={(e) => setFormValues({ ...formValues, topicDelivered: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Organized By *</Label>
                  <Input className="h-9 text-sm" placeholder="Organization" value={formValues.organizedBy || ''} onChange={(e) => setFormValues({ ...formValues, organizedBy: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Start Date *</Label>
                  <Input type="date" className="h-9 text-sm" value={formValues.startDate || ''} onChange={(e) => setFormValues({ ...formValues, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Duration</Label>
                  <Input className="h-9 text-sm" placeholder="e.g., 3 Hours" value={formValues.duration || ''} onChange={(e) => setFormValues({ ...formValues, duration: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Number of Participants</Label>
                  <Input type="number" className="h-9 text-sm" placeholder="0" value={formValues.numberOfParticipants || ''} onChange={(e) => setFormValues({ ...formValues, numberOfParticipants: Number(e.target.value) })} />
                </div>
              </div>
            )}

            {activeSubTab === 'moocs' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Employee ID *</Label>
                  <Input className="h-9 text-sm" placeholder="e.g., CSE001" value={formValues.employeeId || ''} onChange={(e) => setFormValues({ ...formValues, employeeId: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Faculty Name *</Label>
                  <Input className="h-9 text-sm" placeholder="Faculty name" value={formValues.facultyName || ''} onChange={(e) => setFormValues({ ...formValues, facultyName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Platform *</Label>
                  <Select value={formValues.platform || ''} onValueChange={(v) => setFormValues({ ...formValues, platform: v })}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['NPTEL', 'SWAYAM', 'Coursera', 'edX', 'Udemy'].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Course Name *</Label>
                  <Input className="h-9 text-sm" placeholder="Course name" value={formValues.courseName || ''} onChange={(e) => setFormValues({ ...formValues, courseName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Course Category</Label>
                  <Input className="h-9 text-sm" placeholder="e.g., AI/ML" value={formValues.courseCategory || ''} onChange={(e) => setFormValues({ ...formValues, courseCategory: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Conducted By</Label>
                  <Input className="h-9 text-sm" placeholder="e.g., IIT Madras" value={formValues.conductedBy || ''} onChange={(e) => setFormValues({ ...formValues, conductedBy: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Start Date</Label>
                  <Input type="date" className="h-9 text-sm" value={formValues.startDate || ''} onChange={(e) => setFormValues({ ...formValues, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Completion Date</Label>
                  <Input type="date" className="h-9 text-sm" value={formValues.completionDate || ''} onChange={(e) => setFormValues({ ...formValues, completionDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Duration (Hours)</Label>
                  <Input type="number" className="h-9 text-sm" placeholder="0" value={formValues.durationHours || ''} onChange={(e) => setFormValues({ ...formValues, durationHours: Number(e.target.value) })} />
                </div>
              </div>
            )}

            {activeSubTab === 'dept-organized' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-xs">Program Name *</Label>
                  <Input className="h-9 text-sm" placeholder="Program name" value={formValues.programName || ''} onChange={(e) => setFormValues({ ...formValues, programName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Program Type *</Label>
                  <Select value={formValues.programType || ''} onValueChange={(v) => setFormValues({ ...formValues, programType: v })}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="FDP">FDP</SelectItem><SelectItem value="STTP">STTP</SelectItem><SelectItem value="Workshop">Workshop</SelectItem><SelectItem value="Seminar">Seminar</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Theme *</Label>
                  <Input className="h-9 text-sm" placeholder="Theme" value={formValues.theme || ''} onChange={(e) => setFormValues({ ...formValues, theme: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Collaborating Organization</Label>
                  <Input className="h-9 text-sm" placeholder="Organization" value={formValues.collaboratingOrganization || ''} onChange={(e) => setFormValues({ ...formValues, collaboratingOrganization: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Start Date *</Label>
                  <Input type="date" className="h-9 text-sm" value={formValues.startDate || ''} onChange={(e) => setFormValues({ ...formValues, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">End Date *</Label>
                  <Input type="date" className="h-9 text-sm" value={formValues.endDate || ''} onChange={(e) => setFormValues({ ...formValues, endDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Duration</Label>
                  <Input className="h-9 text-sm" placeholder="e.g., 5 Days" value={formValues.duration || ''} onChange={(e) => setFormValues({ ...formValues, duration: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Number of Participants</Label>
                  <Input type="number" className="h-9 text-sm" placeholder="0" value={formValues.numberOfParticipants || ''} onChange={(e) => setFormValues({ ...formValues, numberOfParticipants: Number(e.target.value) })} />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveForm} disabled={saving}>
              {saving ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Saving...</> : (editingItem ? 'Update' : 'Save Record')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => { if (!open) { setShowDeleteDialog(false); setDeleteTarget(null); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />Delete Record
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowDeleteDialog(false); setDeleteTarget(null); }}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Deleting...</> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── CSV Upload Dialog ── */}
      <Dialog open={showCSVDialog} onOpenChange={setShowCSVDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">CSV Upload — {activeSubTab.replace('-', ' ').toUpperCase()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" onClick={handleDownloadTemplate}>
                <Download className="h-3.5 w-3.5 mr-1" /> Download Template
              </Button>
              <span className="text-xs text-muted-foreground">Download the CSV template first</span>
            </div>
            <Separator />
            <div className="border rounded-lg p-6 border-dashed border-border/80 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Select CSV File</p>
              <input
                type="file"
                accept=".csv"
                className="mt-3 text-xs text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                onChange={(e) => setSelectedCSVFile(e.target.files?.[0] || null)}
              />
              {selectedCSVFile && (
                <p className="text-xs text-emerald-600 mt-2 font-medium">Selected: {selectedCSVFile.name}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowCSVDialog(false); setSelectedCSVFile(null); }}>Cancel</Button>
            <Button size="sm" onClick={handleCSVUpload} disabled={!selectedCSVFile || uploading}>
              {uploading ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Uploading...</> : 'Upload CSV'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Evidence List Dialog ── */}
      <Dialog open={showEvidenceDialog} onOpenChange={setShowEvidenceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">Supporting Documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 border-dashed border-border/80 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Drag & drop files here</p>
              <p className="text-xs text-muted-foreground mt-1">Supported: PDF, JPG, PNG, DOCX (Max 25 MB)</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowFacultyUpload(true)}>Browse Files</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowEvidenceDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
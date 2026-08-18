import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  Image,
  File,
  FileType,
  GripVertical,
  X,
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

// ============================================================
// TYPES
// ============================================================

type DocumentStatus = 'not_uploaded' | 'uploaded' | 'under_review' | 'approved' | 'rejected';

interface DocumentVersion {
  id: string;
  version: number;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  status: DocumentStatus;
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
  id: string;
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

// ============================================================
// MOCK DATA
// ============================================================

const mockFaculty: FacultyMember[] = [
  { id: '1', empCode: 'EMP001', name: 'Dr. Ramesh Kumar', designation: 'Assistant Professor', department: 'Computer Science & Engineering', facultyType: 'Regular', hasPhD: true, hasPromotion: true, completionPercentage: 75, mandatoryDocs: 12, uploadedDocs: 9, pendingDocs: 3 },
  { id: '2', empCode: 'EMP002', name: 'Dr. Priya Sharma', designation: 'Associate Professor', department: 'Computer Science & Engineering', facultyType: 'Regular', hasPhD: true, hasPromotion: false, completionPercentage: 100, mandatoryDocs: 10, uploadedDocs: 10, pendingDocs: 0 },
  { id: '3', empCode: 'EMP003', name: 'Mr. Suresh Reddy', designation: 'Assistant Professor', department: 'Computer Science & Engineering', facultyType: 'Regular', hasPhD: false, hasPromotion: false, completionPercentage: 60, mandatoryDocs: 8, uploadedDocs: 5, pendingDocs: 3 },
  { id: '4', empCode: 'EMP004', name: 'Dr. Anita Desai', designation: 'Professor', department: 'Computer Science & Engineering', facultyType: 'Regular', hasPhD: true, hasPromotion: true, completionPercentage: 90, mandatoryDocs: 12, uploadedDocs: 11, pendingDocs: 1 },
  { id: '5', empCode: 'EMP005', name: 'Mr. Vikram Patel', designation: 'Professor of Practice', department: 'Computer Science & Engineering', facultyType: 'Professor of Practice', hasPhD: false, hasPromotion: false, completionPercentage: 50, mandatoryDocs: 14, uploadedDocs: 7, pendingDocs: 7 },
  { id: '6', empCode: 'EMP006', name: 'Dr. Meena Iyer', designation: 'Associate Professor', department: 'Computer Science & Engineering', facultyType: 'Regular', hasPhD: true, hasPromotion: true, completionPercentage: 85, mandatoryDocs: 12, uploadedDocs: 10, pendingDocs: 2 },
];

function generateFolders(faculty: FacultyMember): EvidenceFolderItem[] {
  const folders: EvidenceFolderItem[] = [
    {
      id: 'faculty-profile',
      name: 'Faculty Profile',
      description: 'Personal identification and appointment documents',
      documents: [
        { id: 'fp-photo', name: 'Passport Size Photograph', mandatory: false, status: 'uploaded', currentVersion: 1, versions: [{ id: 'v1', version: 1, fileName: 'photo.jpg', fileSize: '250 KB', fileType: 'jpg', uploadedBy: faculty.name, uploadedAt: '10-Jan-2026', status: 'uploaded' }], uploadedOn: '10-Jan-2026', uploadedBy: faculty.name },
        { id: 'fp-aadhaar', name: 'Aadhaar Card', mandatory: false, status: 'uploaded', currentVersion: 1, versions: [{ id: 'v1', version: 1, fileName: 'aadhaar.pdf', fileSize: '1.2 MB', fileType: 'pdf', uploadedBy: faculty.name, uploadedAt: '10-Jan-2026', status: 'uploaded' }], uploadedOn: '10-Jan-2026', uploadedBy: faculty.name },
        { id: 'fp-pan', name: 'PAN Card', mandatory: false, status: 'uploaded', currentVersion: 1, versions: [{ id: 'v1', version: 1, fileName: 'pan_card.pdf', fileSize: '800 KB', fileType: 'pdf', uploadedBy: faculty.name, uploadedAt: '10-Jan-2026', status: 'uploaded' }], uploadedOn: '10-Jan-2026', uploadedBy: faculty.name },
        { id: 'fp-appointment', name: 'Appointment Order', mandatory: true, status: 'approved', currentVersion: 2, versions: [{ id: 'v1', version: 1, fileName: 'appointment_v1.pdf', fileSize: '1.5 MB', fileType: 'pdf', uploadedBy: 'Admin', uploadedAt: '05-Jan-2026', status: 'approved' }, { id: 'v2', version: 2, fileName: 'appointment_v2.pdf', fileSize: '1.6 MB', fileType: 'pdf', uploadedBy: 'Admin', uploadedAt: '15-Jan-2026', status: 'approved' }], uploadedOn: '15-Jan-2026', uploadedBy: 'Admin' },
        { id: 'fp-joining', name: 'Joining Report', mandatory: true, status: 'approved', currentVersion: 1, versions: [{ id: 'v1', version: 1, fileName: 'joining_report.pdf', fileSize: '900 KB', fileType: 'pdf', uploadedBy: 'Admin', uploadedAt: '05-Jan-2026', status: 'approved' }], uploadedOn: '05-Jan-2026', uploadedBy: 'Admin' },
        { id: 'fp-resume', name: 'Resume / CV', mandatory: true, status: faculty.completionPercentage >= 75 ? 'uploaded' : 'not_uploaded', currentVersion: faculty.completionPercentage >= 75 ? 1 : undefined, versions: faculty.completionPercentage >= 75 ? [{ id: 'v1', version: 1, fileName: 'resume.pdf', fileSize: '2.1 MB', fileType: 'pdf', uploadedBy: faculty.name, uploadedAt: '12-Jan-2026', status: 'uploaded' }] : [], uploadedOn: faculty.completionPercentage >= 75 ? '12-Jan-2026' : undefined, uploadedBy: faculty.completionPercentage >= 75 ? faculty.name : undefined },
        { id: 'fp-id-card', name: 'Employee ID Card', mandatory: false, status: 'not_uploaded', versions: [] },
      ],
    },
    {
      id: 'qualifications',
      name: 'Qualifications',
      description: 'Academic degree certificates and transcripts',
      documents: [
        { id: 'q-degree', name: 'Degree Certificate', mandatory: true, status: 'approved', currentVersion: 1, versions: [{ id: 'v1', version: 1, fileName: 'degree_certificate.pdf', fileSize: '3.2 MB', fileType: 'pdf', uploadedBy: faculty.name, uploadedAt: '08-Jan-2026', status: 'approved' }], uploadedOn: '08-Jan-2026', uploadedBy: faculty.name },
        { id: 'q-marks', name: 'Consolidated Marks Memo', mandatory: true, status: 'uploaded', currentVersion: 1, versions: [{ id: 'v1', version: 1, fileName: 'marks_memo.pdf', fileSize: '2.8 MB', fileType: 'pdf', uploadedBy: faculty.name, uploadedAt: '08-Jan-2026', status: 'uploaded' }], uploadedOn: '08-Jan-2026', uploadedBy: faculty.name },
        { id: 'q-phd', name: 'PhD Certificate', mandatory: true, status: faculty.hasPhD ? 'approved' : 'not_uploaded', currentVersion: faculty.hasPhD ? 1 : undefined, versions: faculty.hasPhD ? [{ id: 'v1', version: 1, fileName: 'phd_certificate.pdf', fileSize: '1.8 MB', fileType: 'pdf', uploadedBy: faculty.name, uploadedAt: '08-Jan-2026', status: 'approved' }] : [], uploadedOn: faculty.hasPhD ? '08-Jan-2026' : undefined, uploadedBy: faculty.hasPhD ? faculty.name : undefined, conditionalField: 'hasPhD', conditionalValue: 'true' },
        { id: 'q-provisional', name: 'Provisional Certificate', mandatory: false, status: 'uploaded', currentVersion: 1, versions: [{ id: 'v1', version: 1, fileName: 'provisional.pdf', fileSize: '1.1 MB', fileType: 'pdf', uploadedBy: faculty.name, uploadedAt: '09-Jan-2026', status: 'uploaded' }], uploadedOn: '09-Jan-2026', uploadedBy: faculty.name },
        { id: 'q-equivalence', name: 'Equivalence Certificate', mandatory: false, status: 'not_uploaded', versions: [] },
      ],
    },
    {
      id: 'employment-info',
      name: 'Employment Information',
      description: 'Employment orders, promotions, and experience documents',
      documents: [
        { id: 'ei-appointment', name: 'Appointment Order', mandatory: true, status: 'approved', currentVersion: 1, versions: [], referenceNote: 'Already available in Faculty Profile', uploadedOn: '15-Jan-2026', uploadedBy: 'Admin' },
        { id: 'ei-promotion', name: 'Promotion Order', mandatory: true, status: faculty.hasPromotion ? 'uploaded' : 'not_uploaded', currentVersion: faculty.hasPromotion ? 1 : undefined, versions: faculty.hasPromotion ? [{ id: 'v1', version: 1, fileName: 'promotion_order.pdf', fileSize: '1.3 MB', fileType: 'pdf', uploadedBy: 'Admin', uploadedAt: '20-Jan-2026', status: 'uploaded' }] : [], uploadedOn: faculty.hasPromotion ? '20-Jan-2026' : undefined, uploadedBy: faculty.hasPromotion ? 'Admin' : undefined, conditionalField: 'hasPromotion', conditionalValue: 'true' },
        { id: 'ei-increment', name: 'Increment Order', mandatory: false, status: 'not_uploaded', versions: [] },
        { id: 'ei-relieving', name: 'Relieving Order', mandatory: false, status: 'not_uploaded', versions: [] },
        { id: 'ei-pay-revision', name: 'Pay Revision Order', mandatory: false, status: 'not_uploaded', versions: [] },
        { id: 'ei-experience', name: 'Experience Certificates', mandatory: false, status: faculty.completionPercentage >= 85 ? 'uploaded' : 'not_uploaded', currentVersion: faculty.completionPercentage >= 85 ? 1 : undefined, versions: faculty.completionPercentage >= 85 ? [{ id: 'v1', version: 1, fileName: 'experience_cert.pdf', fileSize: '950 KB', fileType: 'pdf', uploadedBy: faculty.name, uploadedAt: '22-Jan-2026', status: 'uploaded' }] : [], uploadedOn: faculty.completionPercentage >= 85 ? '22-Jan-2026' : undefined, uploadedBy: faculty.completionPercentage >= 85 ? faculty.name : undefined },
      ],
    },
  ];

  // Only add Professor of Practice folder if faculty type matches
  if (faculty.facultyType === 'Professor of Practice') {
    folders.push({
      id: 'professor-of-practice',
      name: 'Professor of Practice',
      description: 'Industry experience and practice-related documents',
      conditionalField: 'facultyType',
      conditionalValue: 'Professor of Practice',
      documents: [
        { id: 'pop-appointment', name: 'Appointment Order', mandatory: true, status: 'uploaded', currentVersion: 1, versions: [{ id: 'v1', version: 1, fileName: 'pop_appointment.pdf', fileSize: '1.4 MB', fileType: 'pdf', uploadedBy: 'Admin', uploadedAt: '10-Jan-2026', status: 'uploaded' }], uploadedOn: '10-Jan-2026', uploadedBy: 'Admin' },
        { id: 'pop-industry-exp', name: 'Industry Experience Certificate', mandatory: true, status: 'uploaded', currentVersion: 1, versions: [{ id: 'v1', version: 1, fileName: 'industry_exp.pdf', fileSize: '1.8 MB', fileType: 'pdf', uploadedBy: faculty.name, uploadedAt: '10-Jan-2026', status: 'uploaded' }], uploadedOn: '10-Jan-2026', uploadedBy: faculty.name },
        { id: 'pop-resume', name: 'Resume', mandatory: true, status: 'not_uploaded', versions: [] },
        { id: 'pop-recommendation', name: 'Industry Recommendation Letter', mandatory: false, status: 'not_uploaded', versions: [] },
        { id: 'pop-contract', name: 'Contract / Agreement', mandatory: false, status: 'not_uploaded', versions: [] },
        { id: 'pop-aicte', name: 'AICTE Approval', mandatory: false, status: 'not_uploaded', versions: [] },
        { id: 'pop-geotagged', name: 'Geo-tagged Photographs', mandatory: true, status: 'uploaded', currentVersion: 1, versions: [{ id: 'v1', version: 1, fileName: 'geotagged_photos.zip', fileSize: '5.2 MB', fileType: 'zip', uploadedBy: faculty.name, uploadedAt: '12-Jan-2026', status: 'uploaded' }], uploadedOn: '12-Jan-2026', uploadedBy: faculty.name },
        { id: 'pop-registered-students', name: 'Registered Students List', mandatory: true, status: 'not_uploaded', versions: [] },
        { id: 'pop-attended-students', name: 'Attended Students List', mandatory: true, status: 'not_uploaded', versions: [] },
        { id: 'pop-session-report', name: 'Session Completion Report', mandatory: false, status: 'not_uploaded', versions: [] },
        { id: 'pop-feedback', name: 'Student Feedback', mandatory: false, status: 'not_uploaded', versions: [] },
        { id: 'pop-appreciation', name: 'Certificate of Appreciation', mandatory: false, status: 'not_uploaded', versions: [] },
      ],
    });
  }

  return folders;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getStatusColor(status: DocumentStatus): string {
  switch (status) {
    case 'not_uploaded': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    case 'uploaded': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'under_review': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getStatusLabel(status: DocumentStatus): string {
  switch (status) {
    case 'not_uploaded': return 'Not Uploaded';
    case 'uploaded': return 'Uploaded';
    case 'under_review': return 'Under Review';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    default: return 'Unknown';
  }
}

function getCompletionColor(pct: number): string {
  if (pct >= 100) return 'text-emerald-600 dark:text-emerald-400';
  if (pct >= 75) return 'text-amber-600 dark:text-amber-400';
  if (pct >= 50) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
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
// COMPONENT PROPS
// ============================================================

interface FacultyEvidenceModuleProps {
  department: string;
  academicYear: string;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function FacultyEvidenceModule({ department }: FacultyEvidenceModuleProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<EvidenceFolderItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<EvidenceDocumentItem | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Faculty list filtering
  const filteredFaculty = useMemo(() => {
    let list = mockFaculty;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q) || f.empCode.toLowerCase().includes(q) || f.designation.toLowerCase().includes(q));
    }
    return list;
  }, [searchQuery]);

  // Summary metrics
  const summaryMetrics = useMemo(() => {
    const totalCategories = 4;
    const totalMandatory = mockFaculty.reduce((sum, f) => sum + f.mandatoryDocs, 0);
    const totalUploaded = mockFaculty.reduce((sum, f) => sum + f.uploadedDocs, 0);
    const totalPending = mockFaculty.reduce((sum, f) => sum + f.pendingDocs, 0);
    const avgCompletion = Math.round(mockFaculty.reduce((sum, f) => sum + f.completionPercentage, 0) / mockFaculty.length);
    return { totalCategories, totalMandatory, totalUploaded, totalPending, avgCompletion };
  }, []);

  // ============================================================
  // RENDER: Document Detail View (inside a folder)
  // ============================================================
  if (selectedFaculty && selectedFolder) {
    const applicableDocs = selectedFolder.documents.filter(doc => {
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

    const folderMetrics = calculateFolderCompletion(selectedFolder, selectedFaculty);

    return (
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedFolder(null); }} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Evidence Repository
          </Button>
          <span className="text-muted-foreground">/ {selectedFaculty.name} / {selectedFolder.name}</span>
        </div>

        {/* Folder Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{selectedFolder.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedFolder.description}</p>
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
              { label: 'Rejected', value: 'rejected' },
            ].map(f => (
              <Button key={f.value} variant={statusFilter === f.value ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setStatusFilter(f.value)}>
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Document Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Document Name</TableHead>
                    <TableHead className="w-24">Type</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                    <TableHead className="w-28">Uploaded On</TableHead>
                    <TableHead className="w-28">Uploaded By</TableHead>
                    <TableHead className="w-16 text-center">Version</TableHead>
                    <TableHead className="w-48 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.map((doc, idx) => (
                    <TableRow key={doc.id} className={doc.referenceNote ? 'bg-muted/30' : ''}>
                      <TableCell className="text-muted-foreground text-xs">{idx + 1}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        {doc.versions.length > 0 ? (
                          <Badge variant="outline" className="text-[10px]">{doc.versions[doc.versions.length - 1]?.fileType.toUpperCase()}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-[10px]', getStatusColor(doc.status))}>{getStatusLabel(doc.status)}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{doc.uploadedOn || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{doc.uploadedBy || '—'}</TableCell>
                      <TableCell className="text-center text-xs">{doc.currentVersion || '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <TooltipProvider>
                            {doc.status === 'not_uploaded' && !doc.referenceNote ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedDocument(doc); setUploadDialogOpen(true); }}>
                                    <Upload className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Upload</TooltipContent>
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
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Preview</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <Download className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Download</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedDocument(doc); setUploadDialogOpen(true); }}>
                                      <Replace className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Replace</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                {selectedDocument?.name}
              </p>
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                  dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                )}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Drag & drop your file here</p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
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
              <Button onClick={() => setUploadDialogOpen(false)}>Upload</Button>
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
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ============================================================
  // RENDER: Evidence Repository Dashboard (folder view for selected faculty)
  // ============================================================
  if (selectedFaculty) {
    const folders = generateFolders(selectedFaculty);
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
                    <Badge variant="outline" className="text-[10px]">{selectedFaculty.empCode}</Badge>
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

        {/* Note about completion */}
        <p className="text-xs text-muted-foreground italic">
          * Only mandatory documents contribute to the completion percentage.
        </p>

        {/* Folder Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <Card className="cursor-pointer hover:shadow-md transition-shadow h-full" onClick={() => { setSelectedFolder(folder); setSearchQuery(''); setStatusFilter('all'); }}>
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

        {/* Approval Workflow Info */}
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

        {/* Activity Log Placeholder */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-2">
              {[
                { action: 'Uploaded Resume / CV', by: selectedFaculty.name, date: '12-Jan-2026', version: 'v1' },
                { action: 'Approved Appointment Order', by: 'HOD', date: '15-Jan-2026', version: 'v2' },
                { action: 'Uploaded Degree Certificate', by: selectedFaculty.name, date: '08-Jan-2026', version: 'v1' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-xs">{activity.action}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{activity.by}</span>
                    <span>{activity.date}</span>
                    <Badge variant="outline" className="text-[9px] px-1">{activity.version}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================
  // RENDER: Faculty List View (initial view)
  // ============================================================
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold">Faculty Evidence Repository</h2>
        <p className="text-sm text-muted-foreground">
          Single source of truth for all faculty-related evidence used across NAAC SSR, NBA SAR, AICTE Compliance, NIRF, and Faculty Audits.
        </p>
      </div>

      {/* Summary Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Faculty', value: mockFaculty.length, icon: Users, color: 'text-indigo-600 bg-indigo-500/10' },
          { label: 'Total Categories', value: summaryMetrics.totalCategories, icon: FolderOpen, color: 'text-violet-600 bg-violet-500/10' },
          { label: 'Avg. Uploaded', value: summaryMetrics.totalUploaded, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10' },
          { label: 'Avg. Pending', value: summaryMetrics.totalPending, icon: AlertTriangle, color: 'text-amber-600 bg-amber-500/10' },
          { label: 'Avg. Completion', value: `${summaryMetrics.avgCompletion}%`, icon: Upload, color: 'text-blue-600 bg-blue-500/10' },
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

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search faculty by name, EMP code, or designation..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select defaultValue="all">
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
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>EMP Code</TableHead>
                  <TableHead>Faculty Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Mandatory</TableHead>
                  <TableHead className="text-center">Uploaded</TableHead>
                  <TableHead className="text-center">Pending</TableHead>
                  <TableHead className="w-36">Completion</TableHead>
                  <TableHead className="w-24 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaculty.map((faculty, idx) => (
                  <TableRow key={faculty.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedFaculty(faculty); setSearchQuery(''); }}>
                    <TableCell className="text-muted-foreground text-xs">{idx + 1}</TableCell>
                    <TableCell className="font-mono text-xs">{faculty.empCode}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{faculty.name}</p>
                        {faculty.hasPhD && <Badge className="text-[9px] px-1 py-0 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">PhD</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{faculty.designation}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{faculty.facultyType}</Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium">{faculty.mandatoryDocs}</TableCell>
                    <TableCell className="text-center text-sm font-medium text-emerald-600">{faculty.uploadedDocs}</TableCell>
                    <TableCell className="text-center text-sm font-medium text-amber-600">{faculty.pendingDocs}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={faculty.completionPercentage} className="h-2 flex-1" />
                        <span className={cn('text-xs font-bold', getCompletionColor(faculty.completionPercentage))}>{faculty.completionPercentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredFaculty.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <h3 className="text-lg font-medium text-muted-foreground">No faculty found</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
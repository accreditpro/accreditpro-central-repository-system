import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';

interface StudentMOOCModuleProps {
  department: string;
  academicYear: string;
}

interface MOOCCertification {
  id: string;
  registrationNumber: string;
  studentName: string;
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
  remarks: string;
  status: string;
  evidence: EvidenceItem[];
}

interface EvidenceItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedDate: string;
  status: string;
  version: string;
}

const mockMOOCs: MOOCCertification[] = [
  {
    id: '1', registrationNumber: 'CS2022001', studentName: 'Rahul Verma', platform: 'NPTEL', courseName: 'Deep Learning', courseCategory: 'AI/ML', conductedBy: 'IIT Madras',
    startDate: '2025-01-15', completionDate: '2025-04-10', durationHours: 60, grade: 'Elite + Gold', score: '92%', certificationStatus: 'Certified', certificateId: 'NPTEL-DL-2025-001', academicYear: '2025-26', remarks: '', status: 'Approved',
    evidence: [{ id: 'e1', name: 'NPTEL Deep Learning Certificate.pdf', type: 'pdf', size: '1.5 MB', uploadedDate: '2025-04-15', status: 'Verified', version: 'v1.0' }]
  },
  {
    id: '2', registrationNumber: 'CS2022002', studentName: 'Priya Sharma', platform: 'Coursera', courseName: 'Google Cloud Professional Architect', courseCategory: 'Cloud Computing', conductedBy: 'Google',
    startDate: '2025-02-01', completionDate: '2025-05-30', durationHours: 80, grade: 'Pass', score: '88%', certificationStatus: 'Certified', certificateId: 'GCPA-2025-XYZ', academicYear: '2025-26', remarks: '', status: 'Approved',
    evidence: []
  },
  {
    id: '3', registrationNumber: 'CS2022003', studentName: 'Suresh Reddy', platform: 'SWAYAM', courseName: 'Cyber Security', courseCategory: 'Security', conductedBy: 'IIT Kanpur',
    startDate: '2025-03-01', completionDate: '2025-06-15', durationHours: 45, grade: 'Elite', score: '85%', certificationStatus: 'Certified', certificateId: 'SWAYAM-CS-2025', academicYear: '2025-26', remarks: '', status: 'Uploaded',
    evidence: []
  },
  {
    id: '4', registrationNumber: 'CS2022004', studentName: 'Anita Desai', platform: 'edX', courseName: 'Data Science with Python', courseCategory: 'Data Science', conductedBy: 'MIT',
    startDate: '2025-04-01', completionDate: '2025-07-20', durationHours: 50, grade: 'Verified', score: '90%', certificationStatus: 'Certified', certificateId: 'EDX-DS-2025', academicYear: '2025-26', remarks: '', status: 'Approved',
    evidence: []
  },
  {
    id: '5', registrationNumber: 'CS2022005', studentName: 'Arjun Nair', platform: 'Microsoft Learn', courseName: 'Azure AI Fundamentals', courseCategory: 'AI/ML', conductedBy: 'Microsoft',
    startDate: '2025-05-01', completionDate: '2025-06-20', durationHours: 30, grade: 'Pass', score: '91%', certificationStatus: 'Certified', certificateId: 'MS-AI-2025-001', academicYear: '2025-26', remarks: '', status: 'Approved',
    evidence: [{ id: 'e2', name: 'Azure AI Certificate.pdf', type: 'pdf', size: '1.2 MB', uploadedDate: '2025-06-25', status: 'Verified', version: 'v1.0' }]
  },
  {
    id: '6', registrationNumber: 'CS2022006', studentName: 'Kavya Reddy', platform: 'AWS Academy', courseName: 'AWS Cloud Practitioner', courseCategory: 'Cloud Computing', conductedBy: 'Amazon',
    startDate: '2025-06-01', completionDate: '2025-07-30', durationHours: 40, grade: 'Pass', score: '95%', certificationStatus: 'Certified', certificateId: 'AWS-CP-2025-002', academicYear: '2025-26', remarks: 'Completed with distinction', status: 'Approved',
    evidence: []
  },
];

export function StudentMOOCModule({ department, academicYear }: StudentMOOCModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);
  const [showCSVDialog, setShowCSVDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: React.ReactNode }> = {
      'Approved': { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="h-3 w-3" /> },
      'Uploaded': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Clock className="h-3 w-3" /> },
      'Draft': { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', icon: <AlertCircle className="h-3 w-3" /> },
      'Rejected': { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-3 w-3" /> },
    };
    const variant = variants[status] || variants['Draft'];
    return (
      <Badge className={`${variant.color} flex items-center gap-1 text-[10px] font-medium px-2 py-0.5`}>
        {variant.icon}
        {status}
      </Badge>
    );
  };

  const filtered = mockMOOCs.filter(m => {
    const matchesSearch = searchQuery === '' ||
      m.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
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
              <span className="font-medium">{department}</span>
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
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student, course, or platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Uploaded">Uploaded</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowCSVDialog(true)}>
            <Upload className="h-3.5 w-3.5 mr-1" /> CSV Upload
          </Button>
          <Button size="sm" variant="outline">
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Record
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Reg No</th>
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
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-8 text-muted-foreground">
                      <Globe className="h-8 w-8 mx-auto opacity-40 mb-2" />
                      <p className="text-sm">No MOOC / certification records found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-[10px]">{row.registrationNumber}</td>
                      <td className="p-3 font-medium">{row.studentName}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] flex items-center gap-1 w-fit">
                          <Globe className="h-3 w-3" /> {row.platform}
                        </Badge>
                      </td>
                      <td className="p-3 max-w-[180px] truncate" title={row.courseName}>{row.courseName}</td>
                      <td className="p-3">{row.courseCategory || '-'}</td>
                      <td className="p-3 text-[10px]">{row.completionDate || '-'}</td>
                      <td className="p-3">{row.durationHours || '-'}</td>
                      <td className="p-3">
                        <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          {row.grade || '-'}
                        </Badge>
                      </td>
                      <td className="p-3">{row.score || '-'}</td>
                      <td className="p-3">
                        <Badge variant={row.certificationStatus === 'Certified' ? 'default' : 'secondary'} className="text-[10px]">
                          {row.certificationStatus}
                        </Badge>
                      </td>
                      <td className="p-3">{getStatusBadge(row.status)}</td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[10px]"
                          onClick={() => { setSelectedRecord(row.id); setShowEvidenceDialog(true); }}
                        >
                          <FileText className="h-3 w-3 mr-1" /> {row.evidence.length}
                        </Button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit2 className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive"><Trash2 className="h-3 w-3" /></Button>
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
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-xs px-2">Page {currentPage} of {totalPages || 1}</span>
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Evidence Dialog */}
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
              <Button size="sm" variant="outline" className="mt-3">Browse Files</Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">Uploaded Documents</h4>
              {selectedRecord && (
                <div className="space-y-2">
                  {(mockMOOCs.find(m => m.id === selectedRecord)?.evidence.length ?? 0) > 0 ? (
                    mockMOOCs.find(m => m.id === selectedRecord)?.evidence.map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-xs font-medium">{ev.name}</p>
                            <p className="text-[10px] text-muted-foreground">{ev.size} • Uploaded {ev.uploadedDate} • {ev.version}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px]">{ev.status}</Badge>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Eye className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><DownloadCloud className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Replace className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><History className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">No documents uploaded yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEvidenceDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Record Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Add New MOOC / Certification Record</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs">Student Registration Number *</Label>
              <Input className="h-9 text-sm" placeholder="e.g., CS2022001" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Student Name *</Label>
              <Input className="h-9 text-sm" placeholder="Student name" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Platform *</Label>
              <Select>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {['NPTEL', 'SWAYAM', 'SWAYAM Plus', 'Coursera', 'edX', 'Udemy', 'Microsoft Learn', 'AWS Academy', 'Google Cloud Skills Boost', 'Oracle University', 'Cisco Networking Academy', 'Other'].map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Course Name *</Label>
              <Input className="h-9 text-sm" placeholder="Course name" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Course Category</Label>
              <Input className="h-9 text-sm" placeholder="e.g., AI/ML, Cloud Computing" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Conducted By</Label>
              <Input className="h-9 text-sm" placeholder="e.g., IIT Madras" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Start Date</Label>
              <Input type="date" className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Completion Date</Label>
              <Input type="date" className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Duration (Hours)</Label>
              <Input type="number" className="h-9 text-sm" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Grade</Label>
              <Input className="h-9 text-sm" placeholder="e.g., Elite + Gold" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Score</Label>
              <Input className="h-9 text-sm" placeholder="e.g., 92%" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Certification Status *</Label>
              <Select>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Certified">Certified</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Not Certified">Not Certified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Certificate ID</Label>
              <Input className="h-9 text-sm" placeholder="Certificate ID" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Academic Year *</Label>
              <Select>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {['2023-24', '2024-25', '2025-26', '2026-27'].map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-xs">Remarks</Label>
              <Input className="h-9 text-sm" placeholder="Optional remarks" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowAddDialog(false)}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Upload Dialog */}
      <Dialog open={showCSVDialog} onOpenChange={setShowCSVDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">CSV Upload</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline">
                <Download className="h-3.5 w-3.5 mr-1" /> Download Template
              </Button>
              <span className="text-xs text-muted-foreground">Download the CSV template first</span>
            </div>
            <Separator />
            <div className="border rounded-lg p-6 border-dashed border-border/80 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Upload CSV File</p>
              <p className="text-xs text-muted-foreground mt-1">Drag & drop or click to browse</p>
              <Button size="sm" variant="outline" className="mt-3">Browse Files</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCSVDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowCSVDialog(false)}>Upload & Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';

interface FacultyProfessionalDevelopmentModuleProps {
  department: string;
  academicYear: string;
}

// ============ DATA DEFINITIONS ============

interface ProfessionalMembership {
  id: string;
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
  id: string;
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
  id: string;
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
  id: string;
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
  id: string;
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

interface EvidenceItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedDate: string;
  status: string;
  version: string;
}

type SubTab = 'dashboard' | 'memberships' | 'fdp-participation' | 'resource-person' | 'moocs' | 'dept-organized' | 'supporting-docs';

// ============ MOCK DATA ============

const mockMemberships: ProfessionalMembership[] = [
  { id: '1', employeeId: 'CSE001', facultyName: 'Dr. Ramesh Kumar', professionalSocietyName: 'IEEE', societyType: 'International', membershipNumber: 'IEEE-98765432', membershipGrade: 'Senior Member', positionHeld: 'Chapter Chair', membershipStartDate: '2018-06-15', membershipExpiryDate: '2026-06-14', activeStatus: 'Active', remarks: '', status: 'Approved', evidence: [{ id: 'e1', name: 'IEEE Membership Certificate.pdf', type: 'pdf', size: '1.2 MB', uploadedDate: '2025-01-05', status: 'Verified', version: 'v1.0' }] },
  { id: '2', employeeId: 'CSE002', facultyName: 'Dr. Priya Sharma', professionalSocietyName: 'ACM', societyType: 'International', membershipNumber: 'ACM-1234567', membershipGrade: 'Professional Member', positionHeld: '', membershipStartDate: '2020-01-10', membershipExpiryDate: '2026-01-09', activeStatus: 'Active', remarks: '', status: 'Approved', evidence: [] },
  { id: '3', employeeId: 'CSE003', facultyName: 'Dr. Suresh Reddy', professionalSocietyName: 'CSI', societyType: 'National', membershipNumber: 'CSI-45678', membershipGrade: 'Life Member', positionHeld: 'Secretary', membershipStartDate: '2015-03-20', membershipExpiryDate: 'Lifetime', activeStatus: 'Active', remarks: 'Life membership', status: 'Approved', evidence: [{ id: 'e2', name: 'CSI Life Membership.pdf', type: 'pdf', size: '0.8 MB', uploadedDate: '2025-01-03', status: 'Verified', version: 'v1.0' }] },
  { id: '4', employeeId: 'CSE004', facultyName: 'Dr. Anita Desai', professionalSocietyName: 'ISTE', societyType: 'National', membershipNumber: 'ISTE-LM-9876', membershipGrade: 'Life Member', positionHeld: '', membershipStartDate: '2019-07-01', membershipExpiryDate: 'Lifetime', activeStatus: 'Active', remarks: '', status: 'Uploaded', evidence: [] },
];

const mockFDPParticipations: FDPParticipation[] = [
  { id: '1', employeeId: 'CSE001', facultyName: 'Dr. Ramesh Kumar', programType: 'FDP', programTitle: 'Machine Learning for Engineering Applications', themeArea: 'AI/ML', organizedBy: 'IIT Madras', externalInternal: 'External', mode: 'Online', startDate: '2025-06-10', endDate: '2025-06-14', durationDays: 5, location: 'Online', academicYear: '2025-26', participationStatus: 'Completed', certificateReceived: 'Yes', remarks: '', status: 'Approved', evidence: [{ id: 'e3', name: 'FDP Certificate - ML.pdf', type: 'pdf', size: '0.9 MB', uploadedDate: '2025-06-20', status: 'Verified', version: 'v1.0' }] },
  { id: '2', employeeId: 'CSE002', facultyName: 'Dr. Priya Sharma', programType: 'STTP', programTitle: 'Blockchain Technology and Applications', themeArea: 'Blockchain', organizedBy: 'NIT Warangal', externalInternal: 'External', mode: 'Hybrid', startDate: '2025-07-01', endDate: '2025-07-07', durationDays: 7, location: 'NIT Warangal', academicYear: '2025-26', participationStatus: 'Completed', certificateReceived: 'Yes', remarks: '', status: 'Approved', evidence: [] },
  { id: '3', employeeId: 'CSE003', facultyName: 'Dr. Suresh Reddy', programType: 'FDP', programTitle: 'Python for Data Science', themeArea: 'Data Science', organizedBy: 'JNTUH', externalInternal: 'External', mode: 'Offline', startDate: '2025-08-15', endDate: '2025-08-19', durationDays: 5, location: 'JNTUH Campus', academicYear: '2025-26', participationStatus: 'Completed', certificateReceived: 'Yes', remarks: '', status: 'Uploaded', evidence: [] },
  { id: '4', employeeId: 'CSE005', facultyName: 'Dr. Venkat Rao', programType: 'FDP', programTitle: 'Cyber Security Essentials', themeArea: 'Cyber Security', organizedBy: 'CDAC Hyderabad', externalInternal: 'External', mode: 'Online', startDate: '2025-09-01', endDate: '2025-09-05', durationDays: 5, location: 'Online', academicYear: '2025-26', participationStatus: 'Registered', certificateReceived: 'No', remarks: 'Upcoming', status: 'Draft', evidence: [] },
];

const mockResourcePersons: ResourcePerson[] = [
  { id: '1', employeeId: 'CSE001', facultyName: 'Dr. Ramesh Kumar', eventType: 'FDP', eventName: 'AI in Healthcare', topicDelivered: 'Deep Learning for Medical Imaging', organizedBy: 'VIT University', organization: 'VIT Vellore', location: 'Vellore', mode: 'Offline', startDate: '2025-05-10', endDate: '2025-05-10', duration: '3 Hours', audienceType: 'Faculty', numberOfParticipants: 45, academicYear: '2025-26', status: 'Approved', evidence: [{ id: 'e4', name: 'Appreciation Certificate.pdf', type: 'pdf', size: '1.1 MB', uploadedDate: '2025-05-15', status: 'Verified', version: 'v1.0' }] },
  { id: '2', employeeId: 'CSE002', facultyName: 'Dr. Priya Sharma', eventType: 'Workshop', eventName: 'Women in Tech Summit', topicDelivered: 'Cloud Computing Fundamentals', organizedBy: 'Google Developer Group', organization: 'GDG Hyderabad', location: 'Hyderabad', mode: 'Offline', startDate: '2025-04-22', endDate: '2025-04-22', duration: '2 Hours', audienceType: 'Students & Faculty', numberOfParticipants: 120, academicYear: '2025-26', status: 'Approved', evidence: [] },
  { id: '3', employeeId: 'CSE003', facultyName: 'Dr. Suresh Reddy', eventType: 'Conference', eventName: 'ICACC 2025', topicDelivered: 'IoT Security Challenges', organizedBy: 'IEEE Hyderabad Section', organization: 'IEEE', location: 'Hyderabad', mode: 'Hybrid', startDate: '2025-03-15', endDate: '2025-03-15', duration: '1 Hour', audienceType: 'Researchers', numberOfParticipants: 200, academicYear: '2025-26', status: 'Uploaded', evidence: [] },
];

const mockMOOCs: MOOCCertification[] = [
  { id: '1', employeeId: 'CSE001', facultyName: 'Dr. Ramesh Kumar', platform: 'NPTEL', courseName: 'Deep Learning', courseCategory: 'AI/ML', conductedBy: 'IIT Madras', startDate: '2025-01-15', completionDate: '2025-04-10', durationHours: 60, grade: 'Elite + Gold', score: '92%', certificationStatus: 'Certified', certificateId: 'NPTEL-DL-2025-001', academicYear: '2025-26', status: 'Approved', evidence: [{ id: 'e5', name: 'NPTEL Deep Learning Certificate.pdf', type: 'pdf', size: '1.5 MB', uploadedDate: '2025-04-15', status: 'Verified', version: 'v1.0' }] },
  { id: '2', employeeId: 'CSE002', facultyName: 'Dr. Priya Sharma', platform: 'Coursera', courseName: 'Google Cloud Professional Architect', courseCategory: 'Cloud Computing', conductedBy: 'Google', startDate: '2025-02-01', completionDate: '2025-05-30', durationHours: 80, grade: 'Pass', score: '88%', certificationStatus: 'Certified', certificateId: 'GCPA-2025-XYZ', academicYear: '2025-26', status: 'Approved', evidence: [] },
  { id: '3', employeeId: 'CSE003', facultyName: 'Dr. Suresh Reddy', platform: 'SWAYAM', courseName: 'Cyber Security', courseCategory: 'Security', conductedBy: 'IIT Kanpur', startDate: '2025-03-01', completionDate: '2025-06-15', durationHours: 45, grade: 'Elite', score: '85%', certificationStatus: 'Certified', certificateId: 'SWAYAM-CS-2025', academicYear: '2025-26', status: 'Uploaded', evidence: [] },
  { id: '4', employeeId: 'CSE004', facultyName: 'Dr. Anita Desai', platform: 'edX', courseName: 'Data Science with Python', courseCategory: 'Data Science', conductedBy: 'MIT', startDate: '2025-04-01', completionDate: '2025-07-20', durationHours: 50, grade: 'Verified', score: '90%', certificationStatus: 'Certified', certificateId: 'EDX-DS-2025', academicYear: '2025-26', status: 'Approved', evidence: [] },
];

const mockDeptOrganized: DeptOrganizedFDP[] = [
  { id: '1', programName: 'FDP on Artificial Intelligence & Machine Learning', programType: 'FDP', theme: 'AI/ML', organizedBy: 'Department of CSE', collaboratingOrganization: 'NVIDIA', startDate: '2025-06-20', endDate: '2025-06-24', duration: '5 Days', chiefGuest: 'Dr. Andrew Ng', resourcePersons: 'Dr. Ramesh Kumar, Dr. Priya Sharma, Industry Expert from NVIDIA', numberOfParticipants: 65, mode: 'Hybrid', academicYear: '2025-26', remarks: 'Funded by AICTE', status: 'Approved', evidence: [{ id: 'e6', name: 'FDP Approval Letter.pdf', type: 'pdf', size: '0.7 MB', uploadedDate: '2025-06-01', status: 'Verified', version: 'v1.0' }, { id: 'e7', name: 'Event Brochure.pdf', type: 'pdf', size: '2.1 MB', uploadedDate: '2025-06-18', status: 'Verified', version: 'v1.0' }] },
  { id: '2', programName: 'STTP on Cloud Computing & DevOps', programType: 'STTP', theme: 'Cloud Computing', organizedBy: 'Department of CSE', collaboratingOrganization: 'AWS', startDate: '2025-08-10', endDate: '2025-08-16', duration: '7 Days', chiefGuest: 'VP Engineering, AWS India', resourcePersons: 'Dr. Suresh Reddy, AWS Certified Trainers', numberOfParticipants: 50, mode: 'Offline', academicYear: '2025-26', remarks: '', status: 'Uploaded', evidence: [] },
];

// ============ COMPONENT ============

export const FacultyProfessionalDevelopmentModule = ({ department, academicYear }: FacultyProfessionalDevelopmentModuleProps) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEvidenceDialog, setShowEvidenceDialog] = useState(false);
  const [showCSVDialog, setShowCSVDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Analytics data
  const analyticsData = {
    totalMemberships: mockMemberships.length,
    totalFDPs: mockFDPParticipations.length,
    totalResourcePerson: mockResourcePersons.length,
    totalMOOCs: mockMOOCs.length,
    totalDeptOrganized: mockDeptOrganized.length,
    completionPercentage: 78,
    pendingEvidence: 5,
    approvedRecords: 12,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: React.ReactNode }> = {
      'Approved': { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle2 className="h-3 w-3" /> },
      'Uploaded': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Clock className="h-3 w-3" /> },
      'Draft': { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', icon: <AlertCircle className="h-3 w-3" /> },
      'Rejected': { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-3 w-3" /> },
      'Submitted': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock className="h-3 w-3" /> },
      'HOD Review': { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: <Clock className="h-3 w-3" /> },
      'IQAC Review': { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: <Clock className="h-3 w-3" /> },
    };
    const variant = variants[status] || variants['Draft'];
    return (
      <Badge className={`${variant.color} flex items-center gap-1 text-[10px] font-medium px-2 py-0.5`}>
        {variant.icon}
        {status}
      </Badge>
    );
  };

  // ============ DASHBOARD VIEW ============
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Professional Memberships', value: analyticsData.totalMemberships, icon: Award, color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30' },
          { label: 'FDP / STTP Participations', value: analyticsData.totalFDPs, icon: BookOpen, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Faculty as Resource Person', value: analyticsData.totalResourcePerson, icon: Users, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'MOOCs Completed', value: analyticsData.totalMOOCs, icon: Globe, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Dept FDPs Organized', value: analyticsData.totalDeptOrganized, icon: Building2, color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30' },
          { label: 'Completion %', value: `${analyticsData.completionPercentage}%`, icon: BarChart3, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
          { label: 'Pending Evidence', value: analyticsData.pendingEvidence, icon: FileText, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
          { label: 'Approved Records', value: analyticsData.approvedRecords, icon: CheckCircle2, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30' },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${kpi.color}`}>
                  <kpi.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion Progress */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Module Completion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Professional Memberships', value: 85 },
            { label: 'FDP / STTP Participation', value: 75 },
            { label: 'Faculty as Resource Person', value: 70 },
            { label: 'MOOCs / Online Certifications', value: 90 },
            { label: 'Department Organized FDP/STTP', value: 65 },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.value}%</span>
              </div>
              <Progress value={item.value} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'Dr. Ramesh Kumar uploaded NPTEL Deep Learning Certificate', time: '2 hours ago', type: 'upload' },
              { action: 'FDP on AI/ML approved by IQAC', time: '5 hours ago', type: 'approved' },
              { action: 'Dr. Priya Sharma added Coursera certification', time: '1 day ago', type: 'add' },
              { action: 'STTP on Cloud Computing submitted for HOD review', time: '2 days ago', type: 'submit' },
              { action: 'Dr. Suresh Reddy membership renewed for CSI', time: '3 days ago', type: 'update' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-foreground">{activity.action}</p>
                  <p className="text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============ PROFESSIONAL MEMBERSHIPS VIEW ============
  const renderMemberships = () => {
    const filtered = mockMemberships.filter(m => {
      const matchesSearch = searchQuery === '' || m.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) || m.professionalSocietyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search memberships..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
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

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Employee ID</th>
                    <th className="text-left p-3 font-medium">Faculty Name</th>
                    <th className="text-left p-3 font-medium">Society Name</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Membership #</th>
                    <th className="text-left p-3 font-medium">Grade</th>
                    <th className="text-left p-3 font-medium">Position</th>
                    <th className="text-left p-3 font-medium">Start Date</th>
                    <th className="text-left p-3 font-medium">Expiry</th>
                    <th className="text-left p-3 font-medium">Active</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Evidence</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono">{row.employeeId}</td>
                      <td className="p-3 font-medium">{row.facultyName}</td>
                      <td className="p-3">{row.professionalSocietyName}</td>
                      <td className="p-3"><Badge variant="outline" className="text-[10px]">{row.societyType}</Badge></td>
                      <td className="p-3 font-mono text-[10px]">{row.membershipNumber}</td>
                      <td className="p-3">{row.membershipGrade}</td>
                      <td className="p-3">{row.positionHeld || '-'}</td>
                      <td className="p-3">{row.membershipStartDate}</td>
                      <td className="p-3">{row.membershipExpiryDate}</td>
                      <td className="p-3"><Badge variant={row.activeStatus === 'Active' ? 'default' : 'secondary'} className="text-[10px]">{row.activeStatus}</Badge></td>
                      <td className="p-3">{getStatusBadge(row.status)}</td>
                      <td className="p-3">
                        <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => { setSelectedRecord(row.id); setShowEvidenceDialog(true); }}>
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {mockMemberships.length} records</p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft className="h-3 w-3" /></Button>
            <span className="text-xs px-2">Page {currentPage}</span>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setCurrentPage(p => p + 1)}><ChevronRight className="h-3 w-3" /></Button>
          </div>
        </div>
      </div>
    );
  };

  // ============ FDP PARTICIPATION VIEW ============
  const renderFDPParticipation = () => {
    const filtered = mockFDPParticipations.filter(m => {
      const matchesSearch = searchQuery === '' || m.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) || m.programTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
      return matchesSearch && matchesStatus;
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
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Status" />
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
            <Button size="sm" variant="outline">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Record
            </Button>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Emp ID</th>
                    <th className="text-left p-3 font-medium">Faculty Name</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Program Title</th>
                    <th className="text-left p-3 font-medium">Theme</th>
                    <th className="text-left p-3 font-medium">Organized By</th>
                    <th className="text-left p-3 font-medium">Ext/Int</th>
                    <th className="text-left p-3 font-medium">Mode</th>
                    <th className="text-left p-3 font-medium">Start</th>
                    <th className="text-left p-3 font-medium">End</th>
                    <th className="text-left p-3 font-medium">Days</th>
                    <th className="text-left p-3 font-medium">Participation</th>
                    <th className="text-left p-3 font-medium">Certificate</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Evidence</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono">{row.employeeId}</td>
                      <td className="p-3 font-medium">{row.facultyName}</td>
                      <td className="p-3"><Badge variant="outline" className="text-[10px]">{row.programType}</Badge></td>
                      <td className="p-3 max-w-[200px] truncate">{row.programTitle}</td>
                      <td className="p-3">{row.themeArea}</td>
                      <td className="p-3">{row.organizedBy}</td>
                      <td className="p-3">{row.externalInternal}</td>
                      <td className="p-3">{row.mode}</td>
                      <td className="p-3">{row.startDate}</td>
                      <td className="p-3">{row.endDate}</td>
                      <td className="p-3">{row.durationDays}</td>
                      <td className="p-3"><Badge variant={row.participationStatus === 'Completed' ? 'default' : 'secondary'} className="text-[10px]">{row.participationStatus}</Badge></td>
                      <td className="p-3">{row.certificateReceived}</td>
                      <td className="p-3">{getStatusBadge(row.status)}</td>
                      <td className="p-3">
                        <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => { setSelectedRecord(row.id); setShowEvidenceDialog(true); }}>
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {mockFDPParticipations.length} records</p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft className="h-3 w-3" /></Button>
            <span className="text-xs px-2">Page {currentPage}</span>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setCurrentPage(p => p + 1)}><ChevronRight className="h-3 w-3" /></Button>
          </div>
        </div>
      </div>
    );
  };

  // ============ RESOURCE PERSON VIEW ============
  const renderResourcePerson = () => {
    const filtered = mockResourcePersons.filter(m => {
      const matchesSearch = searchQuery === '' || m.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) || m.eventName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
      return matchesSearch && matchesStatus;
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
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Status" />
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
            <Button size="sm" variant="outline">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Record
            </Button>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Emp ID</th>
                    <th className="text-left p-3 font-medium">Faculty Name</th>
                    <th className="text-left p-3 font-medium">Event Type</th>
                    <th className="text-left p-3 font-medium">Event Name</th>
                    <th className="text-left p-3 font-medium">Topic Delivered</th>
                    <th className="text-left p-3 font-medium">Organized By</th>
                    <th className="text-left p-3 font-medium">Location</th>
                    <th className="text-left p-3 font-medium">Mode</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Duration</th>
                    <th className="text-left p-3 font-medium">Audience</th>
                    <th className="text-left p-3 font-medium">Participants</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Evidence</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono">{row.employeeId}</td>
                      <td className="p-3 font-medium">{row.facultyName}</td>
                      <td className="p-3"><Badge variant="outline" className="text-[10px]">{row.eventType}</Badge></td>
                      <td className="p-3 max-w-[180px] truncate">{row.eventName}</td>
                      <td className="p-3 max-w-[180px] truncate">{row.topicDelivered}</td>
                      <td className="p-3">{row.organizedBy}</td>
                      <td className="p-3">{row.location}</td>
                      <td className="p-3">{row.mode}</td>
                      <td className="p-3">{row.startDate}</td>
                      <td className="p-3">{row.duration}</td>
                      <td className="p-3">{row.audienceType}</td>
                      <td className="p-3">{row.numberOfParticipants}</td>
                      <td className="p-3">{getStatusBadge(row.status)}</td>
                      <td className="p-3">
                        <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => { setSelectedRecord(row.id); setShowEvidenceDialog(true); }}>
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {mockResourcePersons.length} records</p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft className="h-3 w-3" /></Button>
            <span className="text-xs px-2">Page {currentPage}</span>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setCurrentPage(p => p + 1)}><ChevronRight className="h-3 w-3" /></Button>
          </div>
        </div>
      </div>
    );
  };

  // ============ MOOCS VIEW ============
  const renderMOOCs = () => {
    const filtered = mockMOOCs.filter(m => {
      const matchesSearch = searchQuery === '' || m.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) || m.courseName.toLowerCase().includes(searchQuery.toLowerCase()) || m.platform.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
      return matchesSearch && matchesStatus;
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
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Status" />
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
            <Button size="sm" variant="outline">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Record
            </Button>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Emp ID</th>
                    <th className="text-left p-3 font-medium">Faculty Name</th>
                    <th className="text-left p-3 font-medium">Platform</th>
                    <th className="text-left p-3 font-medium">Course Name</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-left p-3 font-medium">Conducted By</th>
                    <th className="text-left p-3 font-medium">Start</th>
                    <th className="text-left p-3 font-medium">Completion</th>
                    <th className="text-left p-3 font-medium">Hours</th>
                    <th className="text-left p-3 font-medium">Grade</th>
                    <th className="text-left p-3 font-medium">Score</th>
                    <th className="text-left p-3 font-medium">Cert Status</th>
                    <th className="text-left p-3 font-medium">Cert ID</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Evidence</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono">{row.employeeId}</td>
                      <td className="p-3 font-medium">{row.facultyName}</td>
                      <td className="p-3"><Badge variant="outline" className="text-[10px]">{row.platform}</Badge></td>
                      <td className="p-3 max-w-[180px] truncate">{row.courseName}</td>
                      <td className="p-3">{row.courseCategory}</td>
                      <td className="p-3">{row.conductedBy}</td>
                      <td className="p-3">{row.startDate}</td>
                      <td className="p-3">{row.completionDate}</td>
                      <td className="p-3">{row.durationHours}</td>
                      <td className="p-3"><Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{row.grade}</Badge></td>
                      <td className="p-3">{row.score}</td>
                      <td className="p-3"><Badge variant={row.certificationStatus === 'Certified' ? 'default' : 'secondary'} className="text-[10px]">{row.certificationStatus}</Badge></td>
                      <td className="p-3 font-mono text-[10px]">{row.certificateId}</td>
                      <td className="p-3">{getStatusBadge(row.status)}</td>
                      <td className="p-3">
                        <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => { setSelectedRecord(row.id); setShowEvidenceDialog(true); }}>
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {mockMOOCs.length} records</p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft className="h-3 w-3" /></Button>
            <span className="text-xs px-2">Page {currentPage}</span>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setCurrentPage(p => p + 1)}><ChevronRight className="h-3 w-3" /></Button>
          </div>
        </div>
      </div>
    );
  };

  // ============ DEPT ORGANIZED FDP VIEW ============
  const renderDeptOrganized = () => {
    const filtered = mockDeptOrganized.filter(m => {
      const matchesSearch = searchQuery === '' || m.programName.toLowerCase().includes(searchQuery.toLowerCase()) || m.theme.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
      return matchesSearch && matchesStatus;
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
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Status" />
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
            <Button size="sm" variant="outline">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Record
            </Button>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Program Name</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Theme</th>
                    <th className="text-left p-3 font-medium">Collaborator</th>
                    <th className="text-left p-3 font-medium">Start</th>
                    <th className="text-left p-3 font-medium">End</th>
                    <th className="text-left p-3 font-medium">Duration</th>
                    <th className="text-left p-3 font-medium">Chief Guest</th>
                    <th className="text-left p-3 font-medium">Resource Persons</th>
                    <th className="text-left p-3 font-medium">Participants</th>
                    <th className="text-left p-3 font-medium">Mode</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Evidence</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium max-w-[200px] truncate">{row.programName}</td>
                      <td className="p-3"><Badge variant="outline" className="text-[10px]">{row.programType}</Badge></td>
                      <td className="p-3">{row.theme}</td>
                      <td className="p-3">{row.collaboratingOrganization}</td>
                      <td className="p-3">{row.startDate}</td>
                      <td className="p-3">{row.endDate}</td>
                      <td className="p-3">{row.duration}</td>
                      <td className="p-3 max-w-[120px] truncate">{row.chiefGuest}</td>
                      <td className="p-3 max-w-[150px] truncate">{row.resourcePersons}</td>
                      <td className="p-3">{row.numberOfParticipants}</td>
                      <td className="p-3">{row.mode}</td>
                      <td className="p-3">{getStatusBadge(row.status)}</td>
                      <td className="p-3">
                        <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => { setSelectedRecord(row.id); setShowEvidenceDialog(true); }}>
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {mockDeptOrganized.length} records</p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft className="h-3 w-3" /></Button>
            <span className="text-xs px-2">Page {currentPage}</span>
            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setCurrentPage(p => p + 1)}><ChevronRight className="h-3 w-3" /></Button>
          </div>
        </div>
      </div>
    );
  };

  // ============ SUPPORTING DOCUMENTS VIEW ============
  const renderSupportingDocs = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Supporting Documents</h3>
        <Button size="sm">
          <Upload className="h-3.5 w-3.5 mr-1" /> Upload Document
        </Button>
      </div>

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

  // ============ MAIN RENDER ============
  return (
    <div className="space-y-5">
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
          </div>
        </div>
      </motion.div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={(v) => { setActiveSubTab(v as SubTab); setSearchQuery(''); setFilterStatus('all'); setCurrentPage(1); }}>
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl flex-wrap gap-0.5">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'memberships', label: 'Professional Memberships', icon: Award },
            { id: 'fdp-participation', label: 'FDP / STTP Participation', icon: BookOpen },
            { id: 'resource-person', label: 'Faculty as Resource Person', icon: Users },
            { id: 'moocs', label: 'MOOCs / Online Certifications', icon: Globe },
            { id: 'dept-organized', label: 'Dept Organized FDP/STTP', icon: Building2 },
            { id: 'supporting-docs', label: 'Supporting Documents', icon: FolderOpen },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">{renderDashboard()}</TabsContent>
        <TabsContent value="memberships" className="mt-4">{renderMemberships()}</TabsContent>
        <TabsContent value="fdp-participation" className="mt-4">{renderFDPParticipation()}</TabsContent>
        <TabsContent value="resource-person" className="mt-4">{renderResourcePerson()}</TabsContent>
        <TabsContent value="moocs" className="mt-4">{renderMOOCs()}</TabsContent>
        <TabsContent value="dept-organized" className="mt-4">{renderDeptOrganized()}</TabsContent>
        <TabsContent value="supporting-docs" className="mt-4">{renderSupportingDocs()}</TabsContent>
      </Tabs>

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
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-xs font-medium">Certificate.pdf</p>
                        <p className="text-[10px] text-muted-foreground">1.2 MB • Uploaded Jan 5, 2025 • v1.0</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px]">Verified</Badge>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Eye className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Download className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><RefreshCw className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><History className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
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
            <DialogTitle className="text-base">Add New Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {activeSubTab === 'memberships' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">Employee ID *</Label><Input className="h-9 text-sm" placeholder="e.g., CSE001" /></div>
                <div className="space-y-2"><Label className="text-xs">Faculty Name *</Label><Input className="h-9 text-sm" placeholder="Faculty name" /></div>
                <div className="space-y-2"><Label className="text-xs">Professional Society *</Label><Input className="h-9 text-sm" placeholder="e.g., IEEE, ACM" /></div>
                <div className="space-y-2">
                  <Label className="text-xs">Society Type *</Label>
                  <Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent><SelectItem value="National">National</SelectItem><SelectItem value="International">International</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">Membership Number *</Label><Input className="h-9 text-sm" placeholder="Membership #" /></div>
                <div className="space-y-2"><Label className="text-xs">Membership Grade</Label><Input className="h-9 text-sm" placeholder="e.g., Senior Member" /></div>
                <div className="space-y-2"><Label className="text-xs">Position Held</Label><Input className="h-9 text-sm" placeholder="e.g., Chapter Chair" /></div>
                <div className="space-y-2"><Label className="text-xs">Start Date *</Label><Input type="date" className="h-9 text-sm" /></div>
                <div className="space-y-2"><Label className="text-xs">Expiry Date</Label><Input type="date" className="h-9 text-sm" /></div>
                <div className="space-y-2">
                  <Label className="text-xs">Active Status *</Label>
                  <Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Expired">Expired</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2"><Label className="text-xs">Remarks</Label><Input className="h-9 text-sm" placeholder="Optional remarks" /></div>
              </div>
            )}
            {activeSubTab === 'fdp-participation' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">Employee ID *</Label><Input className="h-9 text-sm" placeholder="e.g., CSE001" /></div>
                <div className="space-y-2"><Label className="text-xs">Faculty Name *</Label><Input className="h-9 text-sm" placeholder="Faculty name" /></div>
                <div className="space-y-2">
                  <Label className="text-xs">Program Type *</Label>
                  <Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="FDP">FDP</SelectItem><SelectItem value="STTP">STTP</SelectItem><SelectItem value="Workshop">Workshop</SelectItem><SelectItem value="Seminar">Seminar</SelectItem><SelectItem value="Conference">Conference</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">Program Title *</Label><Input className="h-9 text-sm" placeholder="Program title" /></div>
                <div className="space-y-2"><Label className="text-xs">Theme / Area</Label><Input className="h-9 text-sm" placeholder="e.g., AI/ML" /></div>
                <div className="space-y-2"><Label className="text-xs">Organized By *</Label><Input className="h-9 text-sm" placeholder="Organization" /></div>
                <div className="space-y-2">
                  <Label className="text-xs">External / Internal *</Label>
                  <Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="External">External</SelectItem><SelectItem value="Internal">Internal</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Mode *</Label>
                  <Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Online">Online</SelectItem><SelectItem value="Offline">Offline</SelectItem><SelectItem value="Hybrid">Hybrid</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">Start Date *</Label><Input type="date" className="h-9 text-sm" /></div>
                <div className="space-y-2"><Label className="text-xs">End Date *</Label><Input type="date" className="h-9 text-sm" /></div>
                <div className="space-y-2"><Label className="text-xs">Duration (Days)</Label><Input type="number" className="h-9 text-sm" placeholder="5" /></div>
                <div className="space-y-2"><Label className="text-xs">Location</Label><Input className="h-9 text-sm" placeholder="Location" /></div>
                <div className="space-y-2">
                  <Label className="text-xs">Participation Status</Label>
                  <Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Completed">Completed</SelectItem><SelectItem value="Registered">Registered</SelectItem><SelectItem value="In Progress">In Progress</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Certificate Received</Label>
                  <Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {activeSubTab === 'resource-person' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">Employee ID *</Label><Input className="h-9 text-sm" placeholder="e.g., CSE001" /></div>
                <div className="space-y-2"><Label className="text-xs">Faculty Name *</Label><Input className="h-9 text-sm" placeholder="Faculty name" /></div>
                <div className="space-y-2">
                  <Label className="text-xs">Event Type *</Label>
                  <Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="FDP">FDP</SelectItem><SelectItem value="STTP">STTP</SelectItem><SelectItem value="Workshop">Workshop</SelectItem><SelectItem value="Seminar">Seminar</SelectItem><SelectItem value="Conference">Conference</SelectItem><SelectItem value="Guest Lecture">Guest Lecture</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">Event Name *</Label><Input className="h-9 text-sm" placeholder="Event name" /></div>
                <div className="space-y-2"><Label className="text-xs">Topic Delivered *</Label><Input className="h-9 text-sm" placeholder="Topic" /></div>
                <div className="space-y-2"><Label className="text-xs">Organized By *</Label><Input className="h-9 text-sm" placeholder="Organization" /></div>
                <div className="space-y-2"><Label className="text-xs">Organization</Label><Input className="h-9 text-sm" placeholder="Organization name" /></div>
                <div className="space-y-2"><Label className="text-xs">Location</Label><Input className="h-9 text-sm" placeholder="Location" /></div>
                <div className="space-y-2">
                  <Label className="text-xs">Mode</Label>
                  <Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Online">Online</SelectItem><SelectItem value="Offline">Offline</SelectItem><SelectItem value="Hybrid">Hybrid</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">Start Date *</Label><Input type="date" className="h-9 text-sm" /></div>
                <div className="space-y-2"><Label className="text-xs">End Date</Label><Input type="date" className="h-9 text-sm" /></div>
                <div className="space-y-2"><Label className="text-xs">Duration</Label><Input className="h-9 text-sm" placeholder="e.g., 3 Hours" /></div>
                <div className="space-y-2"><Label className="text-xs">Audience Type</Label><Input className="h-9 text-sm" placeholder="e.g., Faculty, Students" /></div>
                <div className="space-y-2"><Label className="text-xs">Number of Participants</Label><Input type="number" className="h-9 text-sm" placeholder="0" /></div>
              </div>
            )}
            {activeSubTab === 'moocs' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-xs">Employee ID *</Label><Input className="h-9 text-sm" placeholder="e.g., CSE001" /></div>
                <div className="space-y-2"><Label className="text-xs">Faculty Name *</Label><Input className="h-9 text-sm" placeholder="Faculty name" /></div>
                <div className="space-y-2">
                  <Label className="text-xs">Platform *</Label>
                  <Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['NPTEL', 'SWAYAM', 'SWAYAM Plus', 'Coursera', 'edX', 'Udemy', 'Microsoft Learn', 'AWS Academy', 'Google Cloud Skills Boost', 'Oracle University', 'Cisco Networking Academy'].map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">Course Name *</Label><Input className="h-9 text-sm" placeholder="Course name" /></div>
                <div className="space-y-2"><Label className="text-xs">Course Category</Label><Input className="h-9 text-sm" placeholder="e.g., AI/ML" /></div>
                <div className="space-y-2"><Label className="text-xs">Conducted By</Label><Input className="h-9 text-sm" placeholder="e.g., IIT Madras" /></div>
                <div className="space-y-2"><Label className="text-xs">Start Date</Label><Input type="date" className="h-9 text-sm" /></div>
                <div className="space-y-2"><Label className="text-xs">Completion Date</Label><Input type="date" className="h-9 text-sm" /></div>
                <div className="space-y-2"><Label className="text-xs">Duration (Hours)</Label><Input type="number" className="h-9 text-sm" placeholder="0" /></div>
                <div className="space-y-2"><Label className="text-xs">Grade</Label><Input className="h-9 text-sm" placeholder="e.g., Elite + Gold" /></div>
                <div className="space-y-2"><Label className="text-xs">Score</Label><Input className="h-9 text-sm" placeholder="e.g., 92%" /></div>
                <div className="space-y-2">
                  <Label className="text-xs">Certification Status</Label>
                  <Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Certified">Certified</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Not Certified">Not Certified</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">Certificate ID</Label><Input className="h-9 text-sm" placeholder="Certificate ID" /></div>
              </div>
            )}
            {activeSubTab === 'dept-organized' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2"><Label className="text-xs">Program Name *</Label><Input className="h-9 text-sm" placeholder="Program name" /></div>
                <div className="space-y-2">
                  <Label className="text-xs">Program Type *</Label>
                  <Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="FDP">FDP</SelectItem><SelectItem value="STTP">STTP</SelectItem><SelectItem value="Workshop">Workshop</SelectItem><SelectItem value="Seminar">Seminar</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">Theme *</Label><Input className="h-9 text-sm" placeholder="Theme" /></div>
                <div className="space-y-2"><Label className="text-xs">Collaborating Organization</Label><Input className="h-9 text-sm" placeholder="Organization" /></div>
                <div className="space-y-2"><Label className="text-xs">Start Date *</Label><Input type="date" className="h-9 text-sm" /></div>
                <div className="space-y-2"><Label className="text-xs">End Date *</Label><Input type="date" className="h-9 text-sm" /></div>
                <div className="space-y-2"><Label className="text-xs">Duration</Label><Input className="h-9 text-sm" placeholder="e.g., 5 Days" /></div>
                <div className="space-y-2"><Label className="text-xs">Chief Guest</Label><Input className="h-9 text-sm" placeholder="Chief guest" /></div>
                <div className="col-span-2 space-y-2"><Label className="text-xs">Resource Persons</Label><Input className="h-9 text-sm" placeholder="Comma-separated names" /></div>
                <div className="space-y-2"><Label className="text-xs">Number of Participants</Label><Input type="number" className="h-9 text-sm" placeholder="0" /></div>
                <div className="space-y-2">
                  <Label className="text-xs">Mode</Label>
                  <Select><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Online">Online</SelectItem><SelectItem value="Offline">Offline</SelectItem><SelectItem value="Hybrid">Hybrid</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2"><Label className="text-xs">Remarks</Label><Input className="h-9 text-sm" placeholder="Optional remarks" /></div>
              </div>
            )}
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
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> CSV will not be saved immediately. You will be able to preview, validate, and edit records before saving.
              </p>
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
};
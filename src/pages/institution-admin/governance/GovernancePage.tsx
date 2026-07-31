import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building2,
  Users,
  UserPlus,
  UserMinus,
  FileText,
  Download,
  Upload,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  Clock,
  Shield,
  ChevronRight,
  Calendar,
  Ban,
  Check,
  Copy,
  Save,
  Play,
  RefreshCw,
  History,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Committee,
  CommitteeMember,
  CommitteeCategory,
  CommitteeStatus,
  COMMITTEE_ROLES,
  COMMITTEE_CATEGORIES,
  PREDEFINED_COMMITTEES,
  CSV_TEMPLATE_HEADERS,
} from './types';
import { mockCommittees, academicYearOptions, auditTrail } from './mock-data';

// ====================== COMMITTEE DASHBOARD ======================
const CommitteeDashboard = ({ committees }: { committees: Committee[] }) => {
  const total = committees.length;
  const active = committees.filter((c) => c.status === 'active').length;
  const inactive = committees.filter((c) => c.status === 'inactive').length;
  const totalMembers = committees.reduce((sum, c) => sum + c.members.length, 0);
  const withoutMembers = committees.filter((c) => c.members.length === 0).length;

  const cards = [
    {
      label: 'Total Committees',
      value: total,
      icon: Building2,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-900',
    },
    {
      label: 'Active Committees',
      value: active,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-900',
    },
    {
      label: 'Inactive Committees',
      value: inactive,
      icon: XCircle,
      color: 'text-gray-600',
      bg: 'bg-gray-100 dark:bg-gray-900/30',
      border: 'border-gray-200 dark:border-gray-900',
    },
    {
      label: 'Total Members',
      value: totalMembers,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      border: 'border-purple-200 dark:border-purple-900',
    },
    {
      label: 'Committees Without Members',
      value: withoutMembers,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      border: 'border-amber-200 dark:border-amber-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className={cn('border-l-4', card.border, 'hover:shadow-md transition-all duration-200')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                  <div className={cn('p-2 rounded-lg', card.bg)}>
                    <Icon className={cn('h-5 w-5', card.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

// ====================== COMMITTEE LIST ======================
const categoryColors: Record<string, string> = {
  'Academic Governance': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Quality Assurance': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Examination': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Research & Innovation': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Industry & Placement': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'Student Development': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

interface CommitteeListProps {
  committees: Committee[];
  onSelect: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (committee: Committee) => void;
  search: string;
  categoryFilter: string;
  statusFilter: string;
  yearFilter: string;
  onSearchChange: (v: string) => void;
  onCategoryFilterChange: (v: string) => void;
  onStatusFilterChange: (v: string) => void;
  onYearFilterChange: (v: string) => void;
}

const CommitteeList = ({
  committees,
  onSelect,
  onToggleStatus,
  onEdit,
  search,
  categoryFilter,
  statusFilter,
  yearFilter,
  onSearchChange,
  onCategoryFilterChange,
  onStatusFilterChange,
  onYearFilterChange,
}: CommitteeListProps) => {
  const filtered = committees.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesYear = yearFilter === 'all' || c.academicYear === yearFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesYear;
  });

  const memberCompletion = (committee: Committee) => {
    if (committee.members.length === 0) return 0;
    const keyRoles = ['Chairman', 'Chairperson', 'Convener', 'Coordinator', 'Member Secretary'];
    const filledKeyRoles = keyRoles.filter((role) => committee.members.some((m) => m.committeeRole === role)).length;
    const keyRoleScore = Math.min(50, (filledKeyRoles / 3) * 50);
    const memberScore = Math.min(50, (committee.members.length / 5) * 50);
    return Math.round(keyRoleScore + memberScore);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Committee List
            </CardTitle>
            <CardDescription>{filtered.length} committees configured</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by committee name..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {COMMITTEE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={onYearFilterChange}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {academicYearOptions.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Committee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((committee, idx) => {
            const memberCount = committee.members.length;
            const completion = memberCompletion(committee);

            return (
              <motion.div
                key={committee.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                <Card
                  className={cn(
                    'cursor-pointer transition-all duration-200 hover:shadow-md border-2 hover:border-primary/50 hover:shadow-primary/5',
                    committee.status === 'active'
                      ? 'border-green-200 dark:border-green-900/50'
                      : 'border-gray-200 dark:border-gray-800'
                  )}
                  onClick={() => onSelect(committee.id)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold truncate">{committee.name}</h3>
                          {!committee.preset && (
                            <Badge variant="outline" className="text-[10px] px-1">Custom</Badge>
                          )}
                        </div>
                        <p className={cn(
                          'text-[10px] font-medium mt-1 px-2 py-0.5 rounded-full inline-block',
                          categoryColors[committee.category] || ''
                        )}>
                          {committee.category}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => onEdit(committee)}>
                            <Edit2 className="h-3.5 w-3.5 mr-2" />Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {committee.status === 'active' ? (
                            <DropdownMenuItem onClick={() => onToggleStatus(committee.id)} className="text-amber-600">
                              <Ban className="h-3.5 w-3.5 mr-2" />Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => onToggleStatus(committee.id)} className="text-green-600">
                              <Play className="h-3.5 w-3.5 mr-2" />Activate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                      {committee.description}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{committee.academicYear}</span>
                      </div>
                      <Badge
                        variant={committee.status === 'active' ? 'default' : 'secondary'}
                        className={cn(
                          'text-[10px]',
                          committee.status === 'active' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        )}
                      >
                        {committee.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium">{memberCount} Members</span>
                      </div>
                    </div>

                    {/* Setup Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Setup</span>
                        <span className="font-medium">{completion}%</span>
                      </div>
                      <Progress value={completion} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No committees found matching your filters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ====================== ADD/EDIT COMMITTEE DIALOG ======================
interface CommitteeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (committee: Partial<Committee>) => void;
  editCommittee?: Committee | null;
}

const CommitteeFormDialog = ({ open, onClose, onSave, editCommittee }: CommitteeFormDialogProps) => {
  const [name, setName] = useState(editCommittee?.name || '');
  const [category, setCategory] = useState<CommitteeCategory | ''>(editCommittee?.category || '');
  const [description, setDescription] = useState(editCommittee?.description || '');
  const [academicYear, setAcademicYear] = useState(editCommittee?.academicYear || '2025-26');
  const [effectiveFrom, setEffectiveFrom] = useState(editCommittee?.effectiveFrom || '');
  const [effectiveTo, setEffectiveTo] = useState(editCommittee?.effectiveTo || '');

  useEffect(() => {
    if (editCommittee) {
      setName(editCommittee.name);
      setCategory(editCommittee.category);
      setDescription(editCommittee.description);
      setAcademicYear(editCommittee.academicYear);
      setEffectiveFrom(editCommittee.effectiveFrom);
      setEffectiveTo(editCommittee.effectiveTo);
    } else {
      setName('');
      setCategory('');
      setDescription('');
      setAcademicYear('2025-26');
      setEffectiveFrom('');
      setEffectiveTo('');
    }
  }, [editCommittee, open]);

  const handleSave = () => {
    if (!name || !category || !academicYear) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave({
      name,
      category: category as CommitteeCategory,
      description,
      academicYear,
      effectiveFrom,
      effectiveTo,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editCommittee ? 'Edit Committee' : 'Add New Committee'}</DialogTitle>
          <DialogDescription>
            {editCommittee ? 'Update committee configuration details' : 'Configure a new committee for the institution'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Committee Name <span className="text-red-500">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter committee name" />
          </div>

          <div className="space-y-2">
            <Label>Category <span className="text-red-500">*</span></Label>
            <Select value={category} onValueChange={(v) => setCategory(v as CommitteeCategory)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {COMMITTEE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the committee's purpose and scope"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Academic Year <span className="text-red-500">*</span></Label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
              <SelectContent>
                {academicYearOptions.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Effective From</Label>
              <Input type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Effective To</Label>
              <Input type="date" value={effectiveTo} onChange={(e) => setEffectiveTo(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {editCommittee ? 'Update' : 'Create'} Committee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ====================== COMMITTEE MEMBERS SECTION ======================
interface MemberManagementProps {
  committee: Committee;
  onAddMember: (member: CommitteeMember) => void;
  onRemoveMember: (memberId: string) => void;
  onUpdateMember: (member: CommitteeMember) => void;
  onBulkUpload: (members: CommitteeMember[]) => void;
}

const MemberManagement = ({
  committee,
  onAddMember,
  onRemoveMember,
  onUpdateMember,
  onBulkUpload,
}: MemberManagementProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [searchMember, setSearchMember] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [csvPreview, setCsvPreview] = useState<CommitteeMember[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMemberDetail, setShowMemberDetail] = useState<CommitteeMember | null>(null);

  const filteredMembers = committee.members.filter((m) => {
    const matchesSearch = m.employeeName.toLowerCase().includes(searchMember.toLowerCase()) || m.employeeId.toLowerCase().includes(searchMember.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.committeeRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDownloadTemplate = () => {
    const csvContent = CSV_TEMPLATE_HEADERS.join(',') + '\n' + 'EMP001,Dr. Ramesh Kumar,Principal,Administration,Chairman,Internal,ramesh@college.edu,9876543210';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `committee_members_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const parseCSV = useCallback((text: string): { members: CommitteeMember[]; errors: string[] } => {
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l);
    const errors: string[] = [];
    const members: CommitteeMember[] = [];

    if (lines.length < 2) {
      errors.push('CSV file is empty or has only headers');
      return { members, errors };
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const expectedHeaders = CSV_TEMPLATE_HEADERS;
    const headerValid = expectedHeaders.every((h, i) => headers[i] === h);

    if (!headerValid) {
      errors.push(`Invalid CSV format. Expected headers: ${expectedHeaders.join(', ')}`);
      return { members, errors };
    }

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      const employeeId = cols[0] || '';
      const employeeName = cols[1] || '';
      const designation = cols[2] || '';
      const department = cols[3] || '';
      const committeeRole = cols[4] || '';
      const memberTypeRaw = cols[5] || '';
      const email = cols[6] || '';
      const mobile = cols[7] || '';

      const memberType = memberTypeRaw === 'External' ? 'External' : 'Internal';
      const rowErrors: string[] = [];

      if (memberType === 'Internal' && !employeeId) {
        rowErrors.push('Employee ID is required for internal members');
      }
      if (!employeeName) rowErrors.push('Employee Name is required');
      if (!committeeRole) rowErrors.push('Committee Role is required');
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        rowErrors.push('Invalid email format');
      }
      if (mobile && !/^[\+]?[\d\-\(\)\s]{8,15}$/.test(mobile)) {
        rowErrors.push('Invalid mobile number format');
      }

      const duplicate = committee.members.find((m) => m.employeeId === employeeId && m.employeeName === employeeName);
      if (duplicate) {
        rowErrors.push('Duplicate member already exists in this committee');
      }

      if (rowErrors.length > 0) {
        errors.push(`Row ${i}: ${rowErrors.join('; ')}`);
      }

      members.push({
        id: `new-${Date.now()}-${i}`,
        employeeId,
        employeeName,
        designation,
        department,
        committeeRole,
        memberType,
        email,
        mobile,
      });
    }

    return { members, errors };
  }, [committee.members]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { members, errors } = parseCSV(text);
      setCsvPreview(members);
      setCsvErrors(errors);
      if (members.length > 0) {
        setShowBulkUpload(true);
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [parseCSV]);

  const handleConfirmBulkUpload = () => {
    const validMembers = csvPreview.filter((m) => {
      const existing = committee.members.find(
        (em) => em.employeeId === m.employeeId && em.employeeName === m.employeeName
      );
      return !existing;
    });
    onBulkUpload(validMembers);
    setShowBulkUpload(false);
    setCsvPreview([]);
    setCsvErrors([]);
    toast.success(`${validMembers.length} members added successfully`);
  };

  const handleExportMembers = () => {
    const headers = CSV_TEMPLATE_HEADERS;
    const rows = committee.members.map((m) =>
      [m.employeeId, m.employeeName, m.designation, m.department, m.committeeRole, m.memberType, m.email, m.mobile].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${committee.name.toLowerCase().replace(/\s+/g, '_')}_members.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Member list exported');
  };

  const MemberForm = ({
    member,
    onSave,
    onCancel,
  }: {
    member?: CommitteeMember | null;
    onSave: (m: CommitteeMember) => void;
    onCancel: () => void;
  }) => {
    const [employeeId, setEmpId] = useState(member?.employeeId || '');
    const [employeeName, setEmpName] = useState(member?.employeeName || '');
    const [designation, setDesignation] = useState(member?.designation || '');
    const [department, setDepartment] = useState(member?.department || '');
    const [committeeRole, setRole] = useState(member?.committeeRole || '');
    const [memberType, setMemberType] = useState<'Internal' | 'External'>(member?.memberType || 'Internal');
    const [email, setEmail] = useState(member?.email || '');
    const [mobile, setMobile] = useState(member?.mobile || '');

    const handleSubmit = () => {
      if (!employeeName) {
        toast.error('Employee Name is required');
        return;
      }
      if (!committeeRole) {
        toast.error('Committee Role is required');
        return;
      }
      onSave({
        id: member?.id || `new-${Date.now()}`,
        employeeId,
        employeeName,
        designation,
        department,
        committeeRole,
        memberType,
        email,
        mobile,
      });
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Employee ID</Label>
            <Input value={employeeId} onChange={(e) => setEmpId(e.target.value)} placeholder="EMP001" />
          </div>
          <div className="space-y-2">
            <Label>Employee Name <span className="text-red-500">*</span></Label>
            <Input value={employeeName} onChange={(e) => setEmpName(e.target.value)} placeholder="Dr. John Doe" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Designation</Label>
            <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Professor" />
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="CSE" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Committee Role <span className="text-red-500">*</span></Label>
            <Select value={committeeRole} onValueChange={setRole}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                {COMMITTEE_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Member Type</Label>
            <Select value={memberType} onValueChange={(v) => setMemberType(v as 'Internal' | 'External')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Internal">Internal</SelectItem>
                <SelectItem value="External">External</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@college.edu" />
          </div>
          <div className="space-y-2">
            <Label>Mobile</Label>
            <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91-9876543210" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit}>
            <Save className="h-4 w-4 mr-2" />
            {member ? 'Update' : 'Add'} Member
          </Button>
        </DialogFooter>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Committee Members
          </h3>
          <p className="text-xs text-muted-foreground">{committee.members.length} members assigned</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Template
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Upload CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={handleExportMembers}>
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>
          <Button size="sm" onClick={() => { setEditingMember(null); setShowAddDialog(true); }}>
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {COMMITTEE_ROLES.map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Members Table */}
      {committee.members.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Employee ID</TableHead>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Designation</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Department</TableHead>
                <TableHead className="text-xs">Role</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Type</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/50">
                  <TableCell className="text-xs font-mono">{member.employeeId || '-'}</TableCell>
                  <TableCell className="text-xs font-medium">{member.employeeName}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell text-muted-foreground">{member.designation}</TableCell>
                  <TableCell className="text-xs hidden lg:table-cell text-muted-foreground">{member.department}</TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {member.committeeRole}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs hidden sm:table-cell">
                    <Badge
                      variant={member.memberType === 'Internal' ? 'secondary' : 'outline'}
                      className="text-[10px]"
                    >
                      {member.memberType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setShowMemberDetail(member)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => { setEditingMember(member); setShowAddDialog(true); }}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        onClick={() => {
                          onRemoveMember(member.id);
                          toast.success(`${member.employeeName} removed`);
                        }}
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg">
          <Users className="h-10 w-10 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">No members assigned yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add members manually or upload via CSV</p>
        </div>
      )}

      {/* Member Detail Dialog */}
      <Dialog open={!!showMemberDetail} onOpenChange={() => setShowMemberDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          {showMemberDetail && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {showMemberDetail.employeeName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{showMemberDetail.employeeName}</p>
                  <p className="text-xs text-muted-foreground">{showMemberDetail.designation}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{showMemberDetail.employeeId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Committee Role</p>
                  <Badge variant="outline" className="text-xs">{showMemberDetail.committeeRole}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Member Type</p>
                  <p className="font-medium">{showMemberDetail.memberType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium">{showMemberDetail.department || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{showMemberDetail.email || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Mobile</p>
                  <p className="font-medium">{showMemberDetail.mobile || 'N/A'}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMemberDetail(null)}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
            <DialogDescription>
              {editingMember ? 'Update member details' : 'Add a new member to this committee'}
            </DialogDescription>
          </DialogHeader>
          <MemberForm
            member={editingMember}
            onSave={(m) => {
              if (editingMember) {
                onUpdateMember(m);
              } else {
                onAddMember(m);
              }
              setShowAddDialog(false);
              setEditingMember(null);
            }}
            onCancel={() => { setShowAddDialog(false); setEditingMember(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Preview Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CSV Upload Preview</DialogTitle>
            <DialogDescription>
              Review the parsed data before saving. {csvPreview.length} records found.
            </DialogDescription>
          </DialogHeader>

          {csvErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-3 space-y-1">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Validation Errors ({csvErrors.length})
              </p>
              {csvErrors.map((err, idx) => (
                <p key={idx} className="text-xs text-red-600 dark:text-red-400">{err}</p>
              ))}
            </div>
          )}

          {csvPreview.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {CSV_TEMPLATE_HEADERS.map((h) => (
                      <TableHead key={h} className="text-xs">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvPreview.map((member, idx) => {
                    const isDuplicate = committee.members.some(
                      (m) => m.employeeId === member.employeeId && m.employeeName === member.employeeName
                    );
                    return (
                      <TableRow key={idx} className={isDuplicate ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                        <TableCell className="text-xs">{member.employeeId || '-'}</TableCell>
                        <TableCell className="text-xs">{member.employeeName}</TableCell>
                        <TableCell className="text-xs">{member.designation}</TableCell>
                        <TableCell className="text-xs">{member.department}</TableCell>
                        <TableCell className="text-xs">{member.committeeRole}</TableCell>
                        <TableCell className="text-xs">{member.memberType}</TableCell>
                        <TableCell className="text-xs">{member.email}</TableCell>
                        <TableCell className="text-xs">{member.mobile}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkUpload(false)}>Cancel</Button>
            <Button onClick={handleConfirmBulkUpload} disabled={csvPreview.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              Save {csvPreview.length - (csvPreview.filter((m) => committee.members.some((em) => em.employeeId === m.employeeId && em.employeeName === m.employeeName)).length)} Members
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ====================== COMMITTEE DOCUMENTS ======================
interface DocumentManagementProps {
  committee: Committee;
  onUploadDocument: (docId: string) => void;
  onDeleteDocument: (docId: string) => void;
}

const DocumentManagement = ({ committee, onUploadDocument, onDeleteDocument }: DocumentManagementProps) => {
  const mandatoryDocs = committee.documents.filter((d) => d.mandatory);
  const uploadedMandatory = mandatoryDocs.filter((d) => d.status !== 'not_uploaded');
  const completionPercent = mandatoryDocs.length > 0 ? Math.round((uploadedMandatory.length / mandatoryDocs.length) * 100) : 0;

  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    not_uploaded: { label: 'Not Uploaded', color: 'text-gray-500', dot: 'bg-gray-400' },
    uploaded: { label: 'Uploaded', color: 'text-blue-600', dot: 'bg-blue-500' },
    under_review: { label: 'Under Review', color: 'text-amber-600', dot: 'bg-amber-500' },
    approved: { label: 'Approved', color: 'text-green-600', dot: 'bg-green-500' },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Constitution Documents
          </h3>
          <p className="text-xs text-muted-foreground">
            {uploadedMandatory.length}/{mandatoryDocs.length} mandatory documents uploaded
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Document Completion</span>
          <span className="font-medium">{completionPercent}%</span>
        </div>
        <Progress value={completionPercent} className="h-2" />
      </div>

      <div className="space-y-2">
        {committee.documents.map((doc) => {
          const config = statusConfig[doc.status] || statusConfig.not_uploaded;
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium truncate">{doc.name}</p>
                          {doc.mandatory && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 text-red-500 border-red-200 dark:border-red-900">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn('flex items-center gap-1 text-[10px]', config.color)}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
                            {config.label}
                          </span>
                          {doc.status !== 'not_uploaded' && doc.fileName && (
                            <>
                              <span className="text-[10px] text-muted-foreground">•</span>
                              <span className="text-[10px] text-muted-foreground">{doc.fileName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {doc.status === 'not_uploaded' ? (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onUploadDocument(doc.id)}>
                          <Upload className="h-3 w-3 mr-1" />
                          Upload
                        </Button>
                      ) : (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600"
                            onClick={() => onDeleteDocument(doc.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {doc.versions.length > 1 && (
                    <div className="mt-2 pt-2 border-t flex items-center gap-2 text-[10px] text-muted-foreground">
                      <History className="h-3 w-3" />
                      <span>{doc.versions.length} versions</span>
                      <span>•</span>
                      <span>Latest: v{doc.versions.length}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ====================== AUDIT TRAIL ======================
const AuditTrailSection = ({ committeeId }: { committeeId: string }) => {
  const logs = auditTrail.filter((a) => a.committeeId === committeeId);

  if (logs.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        Audit Trail
      </h3>
      <div className="space-y-1">
        {logs.map((log: any) => (
          <div key={log.id} className="flex items-start gap-2 text-xs py-1.5 border-b last:border-0">
            <div className="h-2 w-2 mt-1 rounded-full bg-primary/40 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{log.action}</p>
              <p className="text-muted-foreground">{log.details}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-muted-foreground">{log.performedAt}</p>
              <p className="text-muted-foreground">{log.performedBy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ====================== MAIN GOVERNANCE PAGE ======================
export const GovernancePage = () => {
  const [committees, setCommittees] = useState<Committee[]>(mockCommittees);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<Committee | null>(null);

  const selectedCommittee = committees.find((c) => c.id === selectedCommitteeId);

  const handleToggleStatus = (id: string) => {
    setCommittees((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newStatus: CommitteeStatus = c.status === 'active' ? 'inactive' : 'active';
        toast.success(`${c.name} ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        return {
          ...c,
          status: newStatus,
          modifiedAt: new Date().toISOString(),
          modifiedBy: 'Institution Admin',
        };
      })
    );
  };

  const handleEditCommittee = (committee: Committee) => {
    setEditingCommittee(committee);
    setShowAddDialog(true);
  };

  const handleSaveCommittee = (data: Partial<Committee>) => {
    if (editingCommittee) {
      setCommittees((prev) =>
        prev.map((c) =>
          c.id === editingCommittee.id
            ? { ...c, ...data, modifiedAt: new Date().toISOString(), modifiedBy: 'Institution Admin' }
            : c
        )
      );
      toast.success('Committee updated successfully');
    } else {
      const newCommittee: Committee = {
        id: `committee-custom-${Date.now()}`,
        name: data.name || '',
        category: data.category || 'Academic Governance',
        description: data.description || '',
        academicYear: data.academicYear || '2025-26',
        effectiveFrom: data.effectiveFrom || '',
        effectiveTo: data.effectiveTo || '',
        status: 'active',
        preset: false,
        members: [],          documents: [
            { id: `doc-constitution-${Date.now()}`, name: 'Committee Constitution / Office Order', mandatory: true, status: 'not_uploaded', versions: [] },
            { id: `doc-approval-${Date.now()}`, name: 'Committee Approval Order', mandatory: true, status: 'not_uploaded', versions: [] },
            { id: `doc-memberlist-${Date.now()}`, name: 'Committee Member List', mandatory: false, status: 'not_uploaded', versions: [] },
            { id: `doc-nomination-${Date.now()}`, name: 'Government / University Nomination Letter', mandatory: false, status: 'not_uploaded', versions: [] },
          ],
        createdAt: new Date().toISOString(),
        createdBy: 'Institution Admin',
      };
      setCommittees((prev) => [...prev, newCommittee]);
      toast.success('Committee created successfully');
    }
    setShowAddDialog(false);
    setEditingCommittee(null);
  };

  const handleAddMember = (member: CommitteeMember) => {
    if (!selectedCommittee) return;
    setCommittees((prev) =>
      prev.map((c) =>
        c.id === selectedCommittee.id
          ? { ...c, members: [...c.members, member], modifiedAt: new Date().toISOString(), modifiedBy: 'Institution Admin' }
          : c
      )
    );
    toast.success(`${member.employeeName} added to committee`);
  };

  const handleRemoveMember = (memberId: string) => {
    if (!selectedCommittee) return;
    setCommittees((prev) =>
      prev.map((c) =>
        c.id === selectedCommittee.id
          ? { ...c, members: c.members.filter((m) => m.id !== memberId) }
          : c
      )
    );
  };

  const handleUpdateMember = (member: CommitteeMember) => {
    if (!selectedCommittee) return;
    setCommittees((prev) =>
      prev.map((c) =>
        c.id === selectedCommittee.id
          ? { ...c, members: c.members.map((m) => (m.id === member.id ? member : m)) }
          : c
      )
    );
    toast.success('Member updated successfully');
  };

  const handleBulkUpload = (members: CommitteeMember[]) => {
    if (!selectedCommittee) return;
    setCommittees((prev) =>
      prev.map((c) =>
        c.id === selectedCommittee.id
          ? { ...c, members: [...c.members, ...members], modifiedAt: new Date().toISOString(), modifiedBy: 'Institution Admin' }
          : c
      )
    );
  };

  const handleUploadDocument = (docId: string) => {
    if (!selectedCommittee) return;
    // Simulate document upload
    setCommittees((prev) =>
      prev.map((c) =>
        c.id === selectedCommittee.id
          ? {
              ...c,
              documents: c.documents.map((d) =>
                d.id === docId
                  ? {
                      ...d,
                      status: 'uploaded' as const,
                      fileName: `document_${Date.now()}.pdf`,
                      fileSize: 1024,
                      fileType: 'pdf',
                      uploadedBy: 'Institution Admin',
                      uploadedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                      versions: [...d.versions, { id: `v${d.versions.length + 1}`, version: d.versions.length + 1, fileName: `document_${Date.now()}.pdf`, fileSize: 1024, fileType: 'pdf', uploadedBy: 'Institution Admin', uploadedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }],
                    }
                  : d
              ),
            }
          : c
      )
    );
    toast.success('Document uploaded successfully');
  };

  const handleDeleteDocument = (docId: string) => {
    if (!selectedCommittee) return;
    setCommittees((prev) =>
      prev.map((c) =>
        c.id === selectedCommittee.id
          ? {
              ...c,
              documents: c.documents.map((d) =>
                d.id === docId
                  ? { ...d, status: 'not_uploaded' as const, fileName: undefined, fileSize: undefined, fileType: undefined, uploadedBy: undefined, uploadedAt: undefined }
                  : d
              ),
            }
          : c
      )
    );
    toast.success('Document removed');
  };

  if (selectedCommittee && selectedCommitteeId) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCommitteeId(null)}
              className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
              Back to Committees
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{selectedCommittee.name}</h1>
            <p className="text-muted-foreground">{selectedCommittee.category} Committee</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              className={cn(
                'text-xs',
                selectedCommittee.status === 'active'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : ''
              )}
              variant={selectedCommittee.status === 'active' ? 'default' : 'secondary'}
            >
              {selectedCommittee.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => handleEditCommittee(selectedCommittee)}>
              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          </div>
        </div>

        {/* Committee Description */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {selectedCommittee.academicYear}
              </span>
              <span className="text-muted-foreground">|</span>
              <span>Effective: {selectedCommittee.effectiveFrom || 'N/A'} to {selectedCommittee.effectiveTo || 'N/A'}</span>
              <span className="text-muted-foreground">|</span>
              <span>Created by {selectedCommittee.createdBy}</span>
              {selectedCommittee.createdAt && (
                <>
                  <span className="text-muted-foreground">|</span>
                  <span>on {selectedCommittee.createdAt}</span>
                </>
              )}
            </div>
            <p className="text-sm mt-2">{selectedCommittee.description}</p>
          </CardContent>
        </Card>

        {/* Members */}
        <Card>
          <CardContent className="p-4">
            <MemberManagement
              committee={selectedCommittee}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              onUpdateMember={handleUpdateMember}
              onBulkUpload={handleBulkUpload}
            />
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardContent className="p-4">
            <DocumentManagement
              committee={selectedCommittee}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          </CardContent>
        </Card>

        {/* Audit Trail */}
        <Card>
          <CardContent className="p-4">
            <AuditTrailSection committeeId={selectedCommittee.id} />
            {selectedCommittee.documents.some((d) => d.versions.length > 0) && (
              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Last modified{selectedCommittee.modifiedAt ? ` on ${selectedCommittee.modifiedAt}` : ''}
                  {selectedCommittee.modifiedBy ? ` by ${selectedCommittee.modifiedBy}` : ''}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Committee Dialog */}
        <CommitteeFormDialog
          open={showAddDialog}
          onClose={() => { setShowAddDialog(false); setEditingCommittee(null); }}
          onSave={handleSaveCommittee}
          editCommittee={editingCommittee}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Governance & Committees</h1>
          <p className="text-muted-foreground">
            Configure statutory, academic, administrative, and quality-related committees
          </p>
        </div>
        <Button onClick={() => { setEditingCommittee(null); setShowAddDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Committee
        </Button>
      </div>

      {/* Committee Dashboard */}
      <CommitteeDashboard committees={committees} />

      {/* Committee List */}
      <CommitteeList
        committees={committees}
        onSelect={setSelectedCommitteeId}
        onToggleStatus={handleToggleStatus}
        onEdit={handleEditCommittee}
        search={search}
        categoryFilter={categoryFilter}
        statusFilter={statusFilter}
        yearFilter={yearFilter}
        onSearchChange={setSearch}
        onCategoryFilterChange={setCategoryFilter}
        onStatusFilterChange={setStatusFilter}
        onYearFilterChange={setYearFilter}
      />

      {/* Add/Edit Committee Dialog */}
      <CommitteeFormDialog
        open={showAddDialog}
        onClose={() => { setShowAddDialog(false); setEditingCommittee(null); }}
        onSave={handleSaveCommittee}
        editCommittee={editingCommittee}
      />
    </div>
  );
};

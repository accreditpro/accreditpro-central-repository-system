import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit2,
  KeyRound,
  UserCheck,
  UserX,
  Ban,
  Unlock,
  ChevronRight,
  ChevronLeft,
  Check,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { institutionUsers } from './mock-data';
import { InstitutionUser } from './types';
import { institutionAdminService } from '@/services/institution-admin.service';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  blocked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const roleOptions = [
  'IQAC Coordinator',
  'Department Coordinator',
  'Research Coordinator',
  'Placement Officer',
  'Examination Officer',
  'Compliance Officer',
];

const departmentOptions = ['CSE', 'IT', 'AI&ML', 'AI&DS', 'ECE', 'EEE', 'MECH', 'CIVIL'];

// Create User Wizard
const CreateUserWizard = ({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [departmentsList, setDepartmentsList] = useState<Array<{ id: number; name: string; code: string }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: '',
    departmentId: '',
  });

  // State to hold real credentials returned from backend API
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    temporaryPassword: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      institutionAdminService.getDepartments()
        .then((depts) => {
          if (Array.isArray(depts)) {
            setDepartmentsList(depts.map((d) => ({ id: Number(d.id), name: d.name, code: d.code })));
          }
        })
        .catch(() => {});
    }
  }, [open]);

  const steps = [
    { num: 1, title: 'Basic Details' },
    { num: 2, title: 'Role Selection' },
    { num: 3, title: 'Department' },
    { num: 4, title: 'Review & Submit' },
  ];

  const mapRoleToEnum = (roleName: string): any => {
    switch (roleName) {
      case 'IQAC Coordinator': return 'IQAC_COORDINATOR';
      case 'Department Coordinator':
      case 'Dept. Coordinator': return 'DEPARTMENT_COORDINATOR';
      case 'Research Coordinator': return 'RESEARCH_COORDINATOR';
      case 'Placement Officer': return 'PLACEMENT_OFFICER';
      case 'Examination Officer': return 'EXAMINATION_OFFICER';
      case 'Compliance Officer': return 'COMPLIANCE_OFFICER';
      case 'Institution Admin': return 'INSTITUTION_ADMIN';
      case 'Principal': return 'PRINCIPAL';
      case 'HOD': return 'HOD';
      default: return 'DEPARTMENT_COORDINATOR';
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return Boolean(formData.name && formData.email && formData.mobile);
      case 2: return Boolean(formData.role);
      case 3: return formData.role !== 'Department Coordinator' || Boolean(formData.departmentId);
      default: return true;
    }
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const res = await institutionAdminService.createUser({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        role: mapRoleToEnum(formData.role),
        departmentId: formData.departmentId ? Number(formData.departmentId) : undefined,
        autoGeneratePassword: true,
      });

      const tempPass = res?.temporaryPassword || (res as any)?.data?.temporaryPassword || 'Temp@123456';
      setCreatedCredentials({
        name: res?.name || formData.name,
        email: res?.email || formData.email,
        temporaryPassword: tempPass,
      });
      toast.success(`User ${formData.name} created successfully`);
      onSuccess();
    } catch {
      toast.error('Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseWizard = () => {
    setStep(1);
    setFormData({ name: '', email: '', mobile: '', role: '', departmentId: '' });
    setCreatedCredentials(null);
    onClose();
  };

  const selectedDepartment = departmentsList.find((d) => String(d.id) === formData.departmentId);

  return (
    <Dialog open={open} onOpenChange={handleCloseWizard}>
      <DialogContent className="max-w-lg">
        {createdCredentials ? (
          // Success Credentials Screen (Data from backend response ONLY)
          <div className="space-y-4 py-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5 text-green-500" />
                User Created Successfully!
              </DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground">
              Please share these system-generated temporary credentials with <span className="font-semibold text-foreground">{createdCredentials.name}</span>.
            </p>
            <Card className="bg-muted/50 border-green-500/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Email / Username</p>
                    <p className="font-mono text-sm font-medium">{createdCredentials.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.email);
                      toast.success('Copied email');
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Temporary Password (from Backend)</p>
                    <p className="font-mono text-sm font-bold text-primary">{createdCredentials.temporaryPassword}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.temporaryPassword);
                      toast.success('Copied temporary password');
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            <p className="text-xs text-amber-600">⚠️ User will be required to change password on first login</p>
            <DialogFooter>
              <Button onClick={handleCloseWizard} className="w-full">Done</Button>
            </DialogFooter>
          </div>
        ) : (
          // Multi-step Wizard
          <>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>

            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-4">
              {steps.map((s, idx) => (
                <div key={s.num} className="flex items-center">
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    step > s.num ? 'bg-green-500 text-white' : step === s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step > s.num ? <Check className="h-3.5 w-3.5" /> : s.num}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-1 ${step > s.num ? 'bg-green-500' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-center mb-4">{steps[step - 1].title}</p>

            {/* Step Content */}
            <div className="min-h-[200px]">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Dr. John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john.doe@svce.ac.in" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile *</Label>
                    <Input value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} placeholder="+91-9876543210" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  {roleOptions.map((role) => (
                    <div
                      key={role}
                      onClick={() => setFormData({ ...formData, role })}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.role === role ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{role}</span>
                        {formData.role === role && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  {formData.role === 'Department Coordinator' ? (
                    <>
                      <p className="text-sm text-muted-foreground">Assign a department for this coordinator</p>
                      <div className="space-y-2">
                        <Label>Department *</Label>
                        <Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}>
                          <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                          <SelectContent>
                            {(departmentsList.length > 0
                              ? departmentsList
                              : departmentOptions.map((d, i) => ({ id: i + 1, name: d, code: d }))
                            ).map((d) => (
                              <SelectItem key={d.id} value={String(d.id)}>{d.code ? `${d.code} - ${d.name}` : d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground">Department assignment is only required for Department Coordinators</p>
                      <p className="text-xs text-muted-foreground mt-1">Click Next to continue</p>
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">Review user details before creating</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1.5 border-b">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b">
                      <span className="text-muted-foreground">Mobile</span>
                      <span className="font-medium">{formData.mobile}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b">
                      <span className="text-muted-foreground">Role</span>
                      <span className="font-medium">{formData.role}</span>
                    </div>
                    {selectedDepartment && (
                      <div className="flex justify-between py-1.5 border-b">
                        <span className="text-muted-foreground">Department</span>
                        <span className="font-medium">{selectedDepartment.code || selectedDepartment.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between">
              <div>
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)} disabled={submitting}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCloseWizard} disabled={submitting}>Cancel</Button>
                {step < 4 ? (
                  <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleCreate} disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create User'}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const UserManagementPage = () => {
  const [users, setUsers] = useState<InstitutionUser[]>(institutionUsers);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  const mapRoleToEnum = (r: string): string | undefined => {
    switch (r) {
      case 'Institution Admin': return 'INSTITUTION_ADMIN';
      case 'IQAC Coordinator': return 'IQAC_COORDINATOR';
      case 'Department Coordinator':
      case 'Dept. Coordinator': return 'DEPARTMENT_COORDINATOR';
      case 'Research Coordinator': return 'RESEARCH_COORDINATOR';
      case 'Placement Officer': return 'PLACEMENT_OFFICER';
      case 'Examination Officer': return 'EXAMINATION_OFFICER';
      default: return undefined;
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const roleParam = roleFilter !== 'all' ? mapRoleToEnum(roleFilter) : undefined;
      const statusParam = statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined;
      const searchParam = search.trim() ? search.trim() : undefined;

      const res = await institutionAdminService.getUsers({
        page: 1,
        pageSize: 100,
        search: searchParam,
        role: roleParam,
        status: statusParam,
      });

      const rawList = Array.isArray(res)
        ? res
        : (Array.isArray((res as any)?.content)
            ? (res as any).content
            : (Array.isArray((res as any)?.data)
                ? (res as any).data
                : (Array.isArray((res as any)?.data?.content)
                    ? (res as any).data.content
                    : [])));

      if (Array.isArray(rawList)) {
        const mapped: InstitutionUser[] = rawList.map((u: any) => ({
          id: String(u.id),
          name: u.name || (u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.firstName || (u.email ? u.email.split('@')[0] : 'User')),
          email: u.email || '',
          mobile: u.mobile || '-',
          role: u.roleDisplayName || (u.role ? u.role.replace(/_/g, ' ') : 'User'),
          department: u.department || u.departmentName || '-',
          status: (u.status ? u.status.toLowerCase() : 'inactive') as 'active' | 'inactive' | 'blocked' | 'pending',
          lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never',
        }));
        setUsers(mapped);
      }
    } catch {
      // Fallback to local state if offline
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesRole = roleFilter === 'all' || u.role.toLowerCase().includes(roleFilter.toLowerCase()) || (roleFilter === 'Dept. Coordinator' && u.role.toLowerCase().includes('department'));
    return matchesSearch && matchesStatus && matchesRole;
  });

  const [viewingUser, setViewingUser] = useState<InstitutionUser | null>(null);
  const [editingUser, setEditingUser] = useState<InstitutionUser | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', mobile: '', role: '', departmentId: '' });
  const [updating, setUpdating] = useState(false);
  const [departmentsList, setDepartmentsList] = useState<Array<{ id: number; name: string; code: string }>>([]);

  useEffect(() => {
    institutionAdminService.getDepartments()
      .then((depts) => {
        if (Array.isArray(depts)) {
          setDepartmentsList(depts.map((d) => ({ id: Number(d.id), name: d.name, code: d.code })));
        }
      })
      .catch(() => {});
  }, []);

  const handleAction = async (userId: string, action: string) => {
    const idNum = Number(userId);
    if (!isNaN(idNum)) {
      try {
        let newStatus: any = null;
        if (action === 'activate' || action === 'unblock') newStatus = 'ACTIVE';
        else if (action === 'deactivate') newStatus = 'INACTIVE';
        else if (action === 'block') newStatus = 'BLOCKED';

        if (newStatus) {
          await institutionAdminService.updateUserStatus(idNum, { status: newStatus });
          toast.success(`User status updated to ${newStatus.toLowerCase()}`);
          fetchUsers();
        }
      } catch {
        toast.error(`Failed to ${action} user`);
      }
    } else {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          switch (action) {
            case 'activate': return { ...u, status: 'active' as const };
            case 'deactivate': return { ...u, status: 'inactive' as const };
            case 'block': return { ...u, status: 'blocked' as const };
            case 'unblock': return { ...u, status: 'active' as const };
            default: return u;
          }
        })
      );
      toast.success(`User ${action}d successfully`);
    }
  };

  const handleResetPassword = async (user: InstitutionUser) => {
    const idNum = Number(user.id);
    if (!isNaN(idNum)) {
      try {
        await institutionAdminService.resetUserPassword(idNum);
        toast.success(`Password reset trigger sent for ${user.email}`);
      } catch {
        toast.error(`Failed to reset password for ${user.name}`);
      }
    } else {
      toast.success(`Password reset link sent to ${user.email}`);
    }
  };

  const openEditDialog = (user: InstitutionUser) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      mobile: user.mobile === '-' ? '' : user.mobile,
      role: user.role,
      departmentId: '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    const idNum = Number(editingUser.id);
    setUpdating(true);
    try {
      const nameParts = editForm.name.trim().split(' ');
      const firstName = nameParts[0] || editForm.name;
      const lastName = nameParts.slice(1).join(' ') || '';

      if (!isNaN(idNum)) {
        await institutionAdminService.updateUser(idNum, {
          name: editForm.name,
          firstName: firstName,
          lastName: lastName,
          email: editForm.email,
          mobile: editForm.mobile,
          role: mapRoleToEnum(editForm.role) as any,
          departmentId: editForm.departmentId ? Number(editForm.departmentId) : undefined,
        });
        toast.success('User updated successfully');
        setEditingUser(null);
        fetchUsers();
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, name: editForm.name, email: editForm.email, mobile: editForm.mobile, role: editForm.role } : u))
        );
        toast.success('User updated');
        setEditingUser(null);
      }
    } catch {
      toast.error('Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <Button onClick={() => setShowCreateWizard(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Institution Admin">Institution Admin</SelectItem>
                <SelectItem value="IQAC Coordinator">IQAC Coordinator</SelectItem>
                <SelectItem value="Department Coordinator">Dept. Coordinator</SelectItem>
                <SelectItem value="Research Coordinator">Research Coordinator</SelectItem>
                <SelectItem value="Placement Officer">Placement Officer</SelectItem>
                <SelectItem value="Examination Officer">Examination Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Mobile</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Department</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Last Login</th>
                  <th className="text-center py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-muted-foreground">
                      Loading users...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="border-t hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{user.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{user.mobile}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">{user.role}</Badge>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">{user.department}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={`text-xs ${statusColors[user.status]}`}>{user.status}</Badge>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell text-xs text-muted-foreground">{user.lastLogin}</td>
                      <td className="py-3 px-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingUser(user)}>
                              <Eye className="h-3.5 w-3.5 mr-2" />View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit2 className="h-3.5 w-3.5 mr-2" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                              <KeyRound className="h-3.5 w-3.5 mr-2" />Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status !== 'active' && (
                              <DropdownMenuItem onClick={() => handleAction(user.id, 'activate')}>
                                <UserCheck className="h-3.5 w-3.5 mr-2" />Activate
                              </DropdownMenuItem>
                            )}
                            {user.status === 'active' && (
                              <DropdownMenuItem onClick={() => handleAction(user.id, 'deactivate')}>
                                <UserX className="h-3.5 w-3.5 mr-2" />Deactivate
                              </DropdownMenuItem>
                            )}
                            {user.status !== 'blocked' && (
                              <DropdownMenuItem onClick={() => handleAction(user.id, 'block')} className="text-red-600">
                                <Ban className="h-3.5 w-3.5 mr-2" />Block
                              </DropdownMenuItem>
                            )}
                            {user.status === 'blocked' && (
                              <DropdownMenuItem onClick={() => handleAction(user.id, 'unblock')}>
                                <Unlock className="h-3.5 w-3.5 mr-2" />Unblock
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-3 py-2 text-sm">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{viewingUser.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{viewingUser.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Mobile</span>
                <span className="font-medium">{viewingUser.mobile}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium">{viewingUser.role}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">{viewingUser.department}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Status</span>
                <Badge className={`text-xs ${statusColors[viewingUser.status]}`}>{viewingUser.status}</Badge>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Last Login</span>
                <span className="text-xs">{viewingUser.lastLogin}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingUser(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Mobile</Label>
              <Input value={editForm.mobile} onChange={(e) => setEditForm((f) => ({ ...f, mobile: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editForm.role === 'Department Coordinator' && (
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={editForm.departmentId} onValueChange={(v) => setEditForm((f) => ({ ...f, departmentId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {(departmentsList.length > 0
                      ? departmentsList
                      : departmentOptions.map((d, i) => ({ id: i + 1, name: d, code: d }))
                    ).map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.code ? `${d.code} - ${d.name}` : d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} disabled={updating}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updating}>{updating ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateUserWizard open={showCreateWizard} onClose={() => setShowCreateWizard(false)} onSuccess={fetchUsers} />
    </div>
  );
};
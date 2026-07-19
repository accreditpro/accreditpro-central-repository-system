import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
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
  CheckCircle,
  Copy,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { institutionAdminService } from '@/services/institution-admin.service';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import { PaginationConfig } from '@/types/institution.types';
import {
  UserApiResponse,
  UserRoleEnum,
  UserStatusEnum,
  DepartmentApiResponse,
  UpdateUserRequest,
  CreateUserResponse,
} from '@/types/institution-admin.types';

// ── Constants ──────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INACTIVE: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  BLOCKED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const roleOptions: { label: string; value: UserRoleEnum }[] = [
  { label: 'IQAC Coordinator', value: 'IQAC_COORDINATOR' },
  { label: 'Department Coordinator', value: 'DEPARTMENT_COORDINATOR' },
  { label: 'Research Coordinator', value: 'RESEARCH_COORDINATOR' },
  { label: 'Placement Officer', value: 'PLACEMENT_OFFICER' },
  { label: 'Examination Officer', value: 'EXAMINATION_OFFICER' },
  { label: 'Compliance Officer', value: 'COMPILANCE_OFFICER' },
];

const roleFilterOptions: { label: string; value: string }[] = [
  { label: 'Institution Admin', value: 'INSTITUTION_ADMIN' },
  { label: 'IQAC Coordinator', value: 'IQAC_COORDINATOR' },
  { label: 'Department Coordinator', value: 'DEPARTMENT_COORDINATOR' },
  { label: 'Research Coordinator', value: 'RESEARCH_COORDINATOR' },
  { label: 'Placement Officer', value: 'PLACEMENT_OFFICER' },
  { label: 'Examination Officer', value: 'EXAMINATION_OFFICER' },
  { label: 'Principal', value: 'PRINCIPAL' },
];

const statusFilterOptions: { label: string; value: string }[] = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Blocked', value: 'BLOCKED' },
];

// ── Create User Wizard ─────────────────────────────────────────────────

const CreateUserWizard = ({
  open,
  onClose,
  departments,
}: {
  open: boolean;
  onClose: () => void;
  departments: DepartmentApiResponse[];
}) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [createdUser, setCreatedUser] = useState<CreateUserResponse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: '' as UserRoleEnum | '',
    departmentId: undefined as number | undefined,
  });

  const createUserMutation = useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      mobile: string;
      role: UserRoleEnum;
      departmentId?: number;
      autoGeneratePassword: boolean;
    }) => institutionAdminService.createUser(data),
    onSuccess: (response) => {
      setCreatedUser(response);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Reset wizard state but keep dialog open to show UserCreatedDialog
      setStep(1);
      setFormData({ name: '', email: '', mobile: '', role: '', departmentId: undefined });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create user');
    },
  });

  const handleCloseCreatedUserDialog = () => {
    setCreatedUser(null);
    onClose();
  };

  const steps = [
    { num: 1, title: 'Basic Details' },
    { num: 2, title: 'Role Selection' },
    { num: 3, title: 'Department' },
    { num: 4, title: 'Review' },
  ];

  const canProceed = () => {
    switch (step) {
      case 1: return !!(formData.name && formData.email && formData.mobile);
      case 2: return !!formData.role;
      case 3: return formData.role !== 'DEPARTMENT_COORDINATOR' || formData.departmentId !== undefined;
      default: return true;
    }
  };

  const handleClose = () => {
    onClose();
    setStep(1);
    setFormData({ name: '', email: '', mobile: '', role: '', departmentId: undefined });
  };

  const handleCreate = () => {
    createUserMutation.mutate({
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      role: formData.role as UserRoleEnum,
      departmentId: formData.departmentId,
      autoGeneratePassword: true,
    });
  };

  const selectedRoleLabel = roleOptions.find((r) => r.value === formData.role)?.label || formData.role;

  // ── If user was created successfully, show the credentials dialog ──
  if (createdUser) {
    return (
      <UserCreatedDialog
        user={createdUser}
        onClose={handleCloseCreatedUserDialog}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-4">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                  step > s.num
                    ? 'bg-green-500 text-white'
                    : step === s.num
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > s.num ? <Check className="h-3.5 w-3.5" /> : s.num}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${step > s.num ? 'bg-green-500' : 'bg-muted'}`} />
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
                <Label>Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@svce.ac.in"
                />
              </div>
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="+91-9876543210"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {roleOptions.map((role) => (
                <div
                  key={role.value}
                  onClick={() => setFormData({ ...formData, role: role.value })}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.role === role.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{role.label}</span>
                    {formData.role === role.value && <Check className="h-4 w-4 text-primary" />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {formData.role === 'DEPARTMENT_COORDINATOR' ? (
                <>
                  <p className="text-sm text-muted-foreground">Assign a department for this coordinator</p>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select
                      value={formData.departmentId ? String(formData.departmentId) : ''}
                      onValueChange={(v) => setFormData({ ...formData, departmentId: Number(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Department assignment is only required for Department Coordinators
                  </p>
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
                  <span className="font-medium">{selectedRoleLabel}</span>
                </div>
                {formData.departmentId !== undefined && (
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium">
                      {departments.find((d) => d.id === formData.departmentId)?.name || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── User Created Dialog (shows real temporary password from API) ────

const UserCreatedDialog = ({
  user,
  onClose,
}: {
  user: CreateUserResponse;
  onClose: () => void;
}) => {
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(user.temporaryPassword);
    setCopiedPassword(true);
    toast.success('Password copied to clipboard');
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(user.email);
    setCopiedEmail(true);
    toast.success('Email copied to clipboard');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-xl text-center">User Created Successfully</DialogTitle>
            <DialogDescription className="text-center">
              User <span className="font-semibold text-foreground">{user.name}</span> has been created.
              Share the credentials below for their first-time login.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email</Label>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <span className="font-mono text-sm">{user.email}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={handleCopyEmail}
              >
                {copiedEmail ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Temporary Password */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Temporary Password
            </Label>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50">
              <span className="font-mono text-sm font-bold tracking-wide">
                {user.temporaryPassword}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={handleCopyPassword}
              >
                {copiedPassword ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                Password change required
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                The user will be prompted to change this temporary password on their first login.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            <Check className="h-4 w-4 mr-2" />
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── View User Dialog ───────────────────────────────────────────────────

const ViewUserDialog = ({
  userId,
  open,
  onClose,
}: {
  userId: number | null;
  open: boolean;
  onClose: () => void;
}) => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => institutionAdminService.getUserById(userId!),
    enabled: open && userId !== null,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>View detailed information about this user</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
            <p className="text-sm text-muted-foreground">Failed to load user details</p>
          </div>
        ) : user ? (
          <div className="space-y-3 py-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium">
                {user.firstName} {user.lastName}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Mobile</span>
              <span className="text-sm font-medium">{user.mobile}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Role</span>
              <Badge variant="outline" className="text-xs">
                {user.roleDisplayName}
              </Badge>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Department</span>
              <span className="text-sm font-medium">{user.department || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className={`text-xs ${statusColors[user.status] || ''}`}>
                {user.status}
              </Badge>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-muted-foreground">Last Login</span>
              <span className="text-sm font-medium">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'}
              </span>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Edit User Dialog ───────────────────────────────────────────────────

const EditUserDialog = ({
  user,
  open,
  onClose,
  departments,
}: {
  user: UserApiResponse | null;
  open: boolean;
  onClose: () => void;
  departments: DepartmentApiResponse[];
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    role: '' as UserRoleEnum | '',
    departmentId: undefined as number | undefined,
  });

  useEffect(() => {
    if (user) {
      // Infer departmentId from the user's department name if possible
      const matchedDept = user.department
        ? departments.find(
            (d) => d.name.toLowerCase() === user.department!.toLowerCase()
          )
        : undefined;

      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        role: user.role as UserRoleEnum,
        departmentId: matchedDept?.id,
      });
    }
  }, [user, departments]);

  const updateMutation = useMutation({
    mutationFn: (data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      mobile?: string;
      role?: UserRoleEnum;
      departmentId?: number;
    }) => institutionAdminService.updateUser(user!.id, data),
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update user');
    },
  });

  const handleSave = () => {
    const payload: UpdateUserRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobile: formData.mobile,
      role: formData.role as UserRoleEnum | undefined,
    };
    if (formData.departmentId !== undefined) {
      payload.departmentId = formData.departmentId;
    }
    updateMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user details including role and department</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Mobile</Label>
            <Input
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
          </div>

          <Separator className="my-2" />

          {/* Role selector — same options as the create wizard */}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(v) =>
                setFormData({ ...formData, role: v as UserRoleEnum, departmentId: undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department selector — shown only for DEPARTMENT_COORDINATOR */}
          {formData.role === 'DEPARTMENT_COORDINATOR' && (
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={formData.departmentId ? String(formData.departmentId) : ''}
                onValueChange={(v) => setFormData({ ...formData, departmentId: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────

export const UserManagementPage = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Filter & pagination state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Dialog state
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [viewUserId, setViewUserId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserApiResponse | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Debounce search input — waits 400ms before firing the API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch departments for the create wizard's department dropdown
  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: () => institutionAdminService.getDepartments(),
    enabled: isAuthenticated,
  });

  // Query params sent to the backend
  const queryParams = {
    page,
    pageSize,
    search: debouncedSearch || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  };

  // ── Fetch users with pagination, search, and filters ──
  const {
    data: paginatedData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => institutionAdminService.getUsers(queryParams),
    enabled: isAuthenticated,
  });

  const users = paginatedData?.data ?? [];
  const pagination: PaginationConfig = paginatedData
    ? {
        page: paginatedData.page,
        pageSize: paginatedData.pageSize,
        total: paginatedData.total,
        totalPages: paginatedData.totalPages,
      }
    : { page: 1, pageSize: 20, total: 0, totalPages: 1 };

  // ── Mutations ──────────────────────────────────────────────────────

  const resetPasswordMutation = useMutation({
    mutationFn: (userId: number) => institutionAdminService.resetUserPassword(userId),
    onSuccess: () => toast.success('Password reset successfully'),
    onError: (err: Error) => toast.error(err.message || 'Failed to reset password'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: UserStatusEnum }) =>
      institutionAdminService.updateUserStatus(userId, { status }),
    onSuccess: () => {
      toast.success('User status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update user status'),
  });

  // ── Action Handlers ─────────────────────────────────────────────────

  const handleView = useCallback((userId: number) => {
    setViewUserId(userId);
    setIsViewOpen(true);
  }, []);

  const handleEdit = useCallback((user: UserApiResponse) => {
    setEditUser(user);
    setIsEditOpen(true);
  }, []);

  const handleResetPassword = useCallback(
    (userId: number) => {
      resetPasswordMutation.mutate(userId);
    },
    [resetPasswordMutation],
  );

  const handleStatusChange = useCallback(
    (userId: number, newStatus: UserStatusEnum) => {
      statusMutation.mutate({ userId, status: newStatus });
    },
    [statusMutation],
  );

  // ── Loading State ───────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-[150px]" />
              <Skeleton className="h-10 w-[200px]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <th key={i} className="py-3 px-4">
                        <Skeleton className="h-4 w-20" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, rowIdx) => (
                    <tr key={rowIdx} className="border-t">
                      {Array.from({ length: 8 }).map((_, colIdx) => (
                        <td key={colIdx} className="py-3 px-4">
                          <Skeleton className="h-4 w-full max-w-[100px]" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error State ─────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Failed to load users</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              We couldn&apos;t fetch the users list. Please check your connection and try again.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
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
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusFilterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roleFilterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
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
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
                        <p className="text-sm text-muted-foreground">No users found</p>
                        {(debouncedSearch || statusFilter !== 'all' || roleFilter !== 'all') && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Try adjusting your search or filters
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user, idx) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-t hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                        {user.mobile}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {user.roleDisplayName}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">{user.department || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={`text-xs ${statusColors[user.status] || ''}`}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell text-xs text-muted-foreground">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              disabled={isFetching}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(user.id)}>
                              <Eye className="h-3.5 w-3.5 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Edit2 className="h-3.5 w-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                              <KeyRound className="h-3.5 w-3.5 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status !== 'ACTIVE' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                              >
                                <UserCheck className="h-3.5 w-3.5 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {user.status === 'ACTIVE' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, 'INACTIVE')}
                              >
                                <UserX className="h-3.5 w-3.5 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            )}
                            {user.status !== 'BLOCKED' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, 'BLOCKED')}
                                className="text-red-600"
                              >
                                <Ban className="h-3.5 w-3.5 mr-2" />
                                Block
                              </DropdownMenuItem>
                            )}
                            {user.status === 'BLOCKED' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                              >
                                <Unlock className="h-3.5 w-3.5 mr-2" />
                                Unblock
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.total > 0 && (
        <DataTablePagination
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          pageSizeOptions={[10, 20, 30, 50]}
        />
      )}

      {/* Dialogs */}
      <CreateUserWizard
        open={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        departments={departmentsQuery.data ?? []}
      />
      <ViewUserDialog
        userId={viewUserId}
        open={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setViewUserId(null);
        }}
      />
      <EditUserDialog
        user={editUser}
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditUser(null);
        }}
        departments={departmentsQuery.data ?? []}
      />
    </div>
  );
};

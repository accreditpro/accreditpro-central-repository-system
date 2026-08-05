import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DataTable,
  SortState,
  ColumnDef,
} from '@/components/shared/DataTable';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import { PaginationConfig } from '@/types/institution.types';
import { userService } from '@/services/user.service';
import {
  PlatformUser,
  PlatformUserCreateInput,
  PlatformUserStats,
  PlatformUserStatus,
} from '@/types/platform-user.types';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  ShieldCheck,
  Search,
  MoreHorizontal,
  Eye,
  Edit2,
  KeyRound,
  Ban,
  Unlock,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building2,
  Mail,
  Phone,
  CalendarClock,
} from 'lucide-react';

const statusColors: Record<PlatformUserStatus, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  blocked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const statusLabel: Record<PlatformUserStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  blocked: 'Blocked',
  pending: 'Pending',
};

// ---------------------------------------------------------------------------
// Role options — platform (AccreditPro staff) vs college (institution) roles.
// ---------------------------------------------------------------------------

const PLATFORM_ROLE_OPTIONS: { key: string; label: string; description: string }[] = [
  { key: 'SUPER_ADMIN', label: 'Super Admin', description: 'Full access to AccreditPro platform administration' },
];

const COLLEGE_ROLE_OPTIONS: { key: string; label: string; description: string }[] = [
  { key: 'INSTITUTION_ADMIN', label: 'Institution Admin', description: 'Full control over the institution workspace' },
  { key: 'IQAC_COORDINATOR', label: 'IQAC Coordinator', description: 'Oversees quality, verification and accreditation' },
  { key: 'PRINCIPAL', label: 'Principal', description: 'Institutional leadership and oversight' },
  { key: 'DEPARTMENT_COORDINATOR', label: 'Department Coordinator', description: 'Owns department repository and data' },
  { key: 'RESEARCH_COORDINATOR', label: 'Research Coordinator', description: 'Research repository and publications' },
  { key: 'PLACEMENT_OFFICER', label: 'Placement Officer', description: 'Placements, training and recruiters' },
  { key: 'EXAMINATION_OFFICER', label: 'Examination Officer', description: 'Examinations and results' },
  { key: 'COMPLIANCE_OFFICER', label: 'Compliance Officer', description: 'Compliance repository and audits' },
];

const ALL_ROLE_OPTIONS = [...PLATFORM_ROLE_OPTIONS, ...COLLEGE_ROLE_OPTIONS];

const DEPARTMENT_OPTIONS = ['CSE', 'IT', 'AI&ML', 'AI&DS', 'ECE', 'EEE', 'MECH', 'CIVIL'];

const getInitials = (name: string) =>
  name
    .replace(/^Dr\.?\s+|^Mr\.?\s+|^Ms\.?\s+|^Mrs\.?\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'U';

const avatarUrl = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(getInitials(name))}&background=3b82f6&color=fff&size=64&bold=true`;

// ============================================================================
// Shared credential review block
// ============================================================================

const CredentialsCard = ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => (
  <Card className="bg-muted/50">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Username</p>
          <p className="font-mono text-sm font-medium">{username}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            navigator.clipboard.writeText(username);
            toast.success('Copied');
          }}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Temporary Password</p>
          <p className="font-mono text-sm font-medium">{password}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            navigator.clipboard.writeText(password);
            toast.success('Copied');
          }}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

const BasicDetailsFields = ({
  form,
  onChange,
  emailPlaceholder,
}: {
  form: { name: string; email: string; mobile: string };
  onChange: (patch: Partial<typeof form>) => void;
  emailPlaceholder: string;
}) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Full Name</Label>
      <Input
        value={form.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Dr. John Doe"
      />
    </div>
    <div className="space-y-2">
      <Label>Email</Label>
      <Input
        type="email"
        value={form.email}
        onChange={(e) => onChange({ email: e.target.value })}
        placeholder={emailPlaceholder}
      />
    </div>
    <div className="space-y-2">
      <Label>Mobile</Label>
      <Input
        value={form.mobile}
        onChange={(e) => onChange({ mobile: e.target.value })}
        placeholder="+91-9876543210"
      />
    </div>
  </div>
);

const RolePicker = ({
  options,
  selected,
  onSelect,
}: {
  options: { key: string; label: string; description: string }[];
  selected: string;
  onSelect: (key: string) => void;
}) => (
  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
    {options.map((role) => (
      <div
        key={role.key}
        onClick={() => onSelect(role.key)}
        className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
          selected === role.key ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{role.label}</p>
            <p className="text-[10px] text-muted-foreground">{role.description}</p>
          </div>
          {selected === role.key && <Check className="h-4 w-4 text-primary" />}
        </div>
      </div>
    ))}
  </div>
);

const StepIndicator = ({ step, steps }: { step: number; steps: { num: number; title: string }[] }) => (
  <>
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
  </>
);

// ============================================================================
// Create Platform (AccreditPro) User Wizard
// ============================================================================

interface CreatePlatformUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreatePlatformUserDialog = ({ open, onClose, onCreated }: CreatePlatformUserDialogProps) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    roleKey: 'SUPER_ADMIN',
  });

  const generatedUsername = form.email.split('@')[0] || 'user';

  useEffect(() => {
    if (open) {
      setStep(1);
      setForm({ name: '', email: '', mobile: '', roleKey: 'SUPER_ADMIN' });
      // Stable per dialog session — must not change between renders.
      setGeneratedPassword(`Temp@${Math.random().toString(36).slice(2, 8)}`);
    }
  }, [open]);

  const selectedRole = PLATFORM_ROLE_OPTIONS.find((r) => r.key === form.roleKey);

  const canProceed = () => {
    if (step === 1) return form.name.trim() && form.email.trim() && form.mobile.trim();
    if (step === 2) return !!form.roleKey;
    return true;
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const input: PlatformUserCreateInput = {
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        role: selectedRole?.label ?? 'Super Admin',
        roleKey: form.roleKey,
        institutionId: '',
        institution: 'AccreditPro Platform',
        department: '-',
      };
      await userService.createUser(input, { username: generatedUsername, password: generatedPassword });
      toast.success(`${input.name} added as an AccreditPro user`);
      onCreated();
      onClose();
    } catch {
      toast.error('Failed to create platform user');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Basic Details' },
    { num: 2, title: 'Platform Role' },
    { num: 3, title: 'Review' },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-violet-500" />
            Create AccreditPro User
          </DialogTitle>
          <DialogDescription>
            Create a platform staff user (e.g. Super Admin) for the AccreditPro platform
          </DialogDescription>
        </DialogHeader>

        <StepIndicator step={step} steps={steps} />

        {/* Step Content */}
        <div className="min-h-[210px]">
          {step === 1 && (
            <BasicDetailsFields
              form={form}
              onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
              emailPlaceholder="john.doe@accreditpro.com"
            />
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Platform users get access to the AccreditPro admin console.
              </p>
              <RolePicker
                options={PLATFORM_ROLE_OPTIONS}
                selected={form.roleKey}
                onSelect={(roleKey) => setForm((prev) => ({ ...prev, roleKey }))}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">Review the user details before creating</p>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Name', value: form.name },
                  { label: 'Email', value: form.email },
                  { label: 'Mobile', value: form.mobile },
                  { label: 'Role', value: selectedRole?.label ?? '-' },
                  { label: 'Account Type', value: 'AccreditPro Platform' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between py-1.5 border-b last:border-0">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-right">{row.value}</span>
                  </div>
                ))}
              </div>

              <CredentialsCard username={generatedUsername} password={generatedPassword} />
              <p className="text-xs text-amber-600">⚠️ User will be required to change password on first login</p>
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
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Platform User'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// Create College User Wizard
// ============================================================================

interface CreateCollegeUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateCollegeUserDialog = ({ open, onClose, onCreated }: CreateCollegeUserDialogProps) => {
  const [step, setStep] = useState(1);
  const [institutions, setInstitutions] = useState<{ id: string; name: string; code: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    roleKey: '',
    institutionId: '',
    department: '',
  });

  const generatedUsername = form.email.split('@')[0] || 'user';

  useEffect(() => {
    if (open) {
      setStep(1);
      setForm({ name: '', email: '', mobile: '', roleKey: '', institutionId: '', department: '' });
      // Stable per dialog session — must not change between renders.
      setGeneratedPassword(`Temp@${Math.random().toString(36).slice(2, 8)}`);
      userService.getInstitutionsForPicker().then(setInstitutions).catch(() => setInstitutions([]));
    }
  }, [open]);

  const selectedRole = COLLEGE_ROLE_OPTIONS.find((r) => r.key === form.roleKey);
  const selectedInstitution = institutions.find((i) => i.id === form.institutionId);

  const canProceed = () => {
    if (step === 1) return form.name.trim() && form.email.trim() && form.mobile.trim();
    if (step === 2) return !!form.roleKey && !!form.institutionId && (form.roleKey !== 'DEPARTMENT_COORDINATOR' || !!form.department);
    return true;
  };

  const handleCreate = async () => {
    if (!selectedInstitution) return;
    setSubmitting(true);
    try {
      const input: PlatformUserCreateInput = {
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        role: selectedRole?.label ?? 'Institution Admin',
        roleKey: form.roleKey,
        institutionId: selectedInstitution.id,
        institution: selectedInstitution.name,
        department: form.roleKey === 'DEPARTMENT_COORDINATOR' ? form.department : '-',
      };
      await userService.createUser(input, { username: generatedUsername, password: generatedPassword });
      toast.success(`${input.name} added to ${selectedInstitution.name}`);
      onCreated();
      onClose();
    } catch {
      toast.error('Failed to create college user');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Basic Details' },
    { num: 2, title: 'Institution & Role' },
    { num: 3, title: 'Review' },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Create College User
          </DialogTitle>
          <DialogDescription>
            Create a user for an institution with the relevant role
          </DialogDescription>
        </DialogHeader>

        <StepIndicator step={step} steps={steps} />

        {/* Step Content */}
        <div className="min-h-[210px]">
          {step === 1 && (
            <BasicDetailsFields
              form={form}
              onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
              emailPlaceholder="john.doe@svce.ac.in"
            />
          )}

          {step === 2 && (
            <div className="space-y-5">
              {/* Institution */}
              <div className="space-y-2">
                <Label>Institution</Label>
                <Select
                  value={form.institutionId}
                  onValueChange={(v) => setForm({ ...form, institutionId: v })}
                >
                  <SelectTrigger>
                    <Building2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {institutions.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id} className="text-xs">
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label>Role</Label>
                <RolePicker
                  options={COLLEGE_ROLE_OPTIONS}
                  selected={form.roleKey}
                  onSelect={(roleKey) => setForm({ ...form, roleKey, department: '' })}
                />
              </div>

              {/* Department (only for dept coordinators) */}
              {form.roleKey === 'DEPARTMENT_COORDINATOR' && (
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={form.department}
                    onValueChange={(v) => setForm({ ...form, department: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENT_OPTIONS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">Review the user details before creating</p>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Name', value: form.name },
                  { label: 'Email', value: form.email },
                  { label: 'Mobile', value: form.mobile },
                  { label: 'Role', value: selectedRole?.label ?? '-' },
                  { label: 'Institution', value: selectedInstitution?.name ?? '-' },
                  ...(form.roleKey === 'DEPARTMENT_COORDINATOR' ? [{ label: 'Department', value: form.department }] : []),
                ].map((row) => (
                  <div key={row.label} className="flex justify-between py-1.5 border-b last:border-0">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-right">{row.value}</span>
                  </div>
                ))}
              </div>

              <CredentialsCard username={generatedUsername} password={generatedPassword} />
              <p className="text-xs text-amber-600">⚠️ User will be required to change password on first login</p>
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
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create College User'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// View User Dialog
// ============================================================================

const ViewUserDialog = ({ user, onClose }: { user: PlatformUser | null; onClose: () => void }) => {
  if (!user) return null;
  const isPlatformUser = !user.institutionId;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Profile and account information</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 pb-4 border-b">
          <Avatar className="h-14 w-14">
            <AvatarImage src={avatarUrl(user.name)} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-base font-semibold truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px]">{user.role}</Badge>
              <Badge variant="secondary" className="text-[10px]">
                {isPlatformUser ? 'AccreditPro' : 'College'}
              </Badge>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[user.status]}`}>
                {statusLabel[user.status]}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2 text-sm">
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{isPlatformUser ? 'Account' : 'Institution'}</p>
              <p className="font-medium">{user.institution}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="font-medium">{user.department || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Mobile</p>
              <p className="font-medium">{user.mobile || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Last Login</p>
              <p className="font-medium">{user.lastLogin}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="font-medium">{user.createdAt}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// Reset Password Dialog
// ============================================================================

const ResetPasswordDialog = ({ user, onClose }: { user: PlatformUser | null; onClose: () => void }) => {
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      setSending(false);
      setPassword(`Temp@${Math.random().toString(36).slice(2, 8)}`);
    }
  }, [user]);

  if (!user) return null;

  const handleReset = async () => {
    setSending(true);
    try {
      await userService.resetPassword(user.id, password);
      toast.success(`Temporary password issued for ${user.name}`);
      onClose();
    } catch {
      toast.error('Failed to reset password');
      setSending(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Issue a temporary password for <strong>{user.name}</strong> ({user.email})
          </DialogDescription>
        </DialogHeader>

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1.5">Temporary Password</p>
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-sm font-medium break-all">{password}</p>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => { navigator.clipboard.writeText(password); toast.success('Copied'); }}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
        <p className="text-xs text-amber-600">⚠️ The user will be required to change this password on next login.</p>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleReset} disabled={sending}>
            {sending ? 'Issuing...' : 'Issue Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// Users Page
// ============================================================================

interface UsersFilters {
  search: string;
  userType: 'all' | 'platform' | 'college';
  institutionId: string;
  role: string;
  status: string;
}

const defaultFilters: UsersFilters = {
  search: '',
  userType: 'all',
  institutionId: 'all',
  role: 'all',
  status: 'all',
};

export const UsersPage = () => {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [stats, setStats] = useState<PlatformUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UsersFilters>(defaultFilters);
  const [sort, setSort] = useState<SortState | null>(null);
  const [pagination, setPagination] = useState<PaginationConfig>({ page: 1, pageSize: 10, total: 0 });

  const [showPlatformDialog, setShowPlatformDialog] = useState(false);
  const [showCollegeDialog, setShowCollegeDialog] = useState(false);
  const [viewUser, setViewUser] = useState<PlatformUser | null>(null);
  const [resetUser, setResetUser] = useState<PlatformUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: filters.search || undefined,
        type: filters.userType === 'all' ? undefined : filters.userType,
        institutionId: filters.institutionId,
        role: filters.role,
        status: filters.status,
        sortBy: sort?.key,
        sortDirection: sort?.direction,
      });
      setUsers(response.data);
      setPagination((prev) => ({ ...prev, total: response.pagination.total }));
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters, sort]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    userService.getUserStats().then(setStats).catch(() => setStats(null));
    userService
      .getInstitutionsForPicker()
      .then((list) => setInstitutions(list.map((i) => ({ id: i.id, name: i.name }))))
      .catch(() => setInstitutions([]));
  }, []);

  const refreshStats = useCallback(() => {
    userService.getUserStats().then(setStats).catch(() => setStats(null));
  }, []);

  const updateFilter = (key: keyof UsersFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (nextSort: SortState) => {
    setSort(nextSort);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleUserCreated = useCallback(() => {
    fetchUsers();
    refreshStats();
  }, [fetchUsers, refreshStats]);

  const handleStatusChange = async (user: PlatformUser, status: PlatformUserStatus) => {
    await userService.updateUserStatus(user.id, status);
    toast.success(`${user.name} ${status === 'active' ? 'activated' : status === 'inactive' ? 'deactivated' : status === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
    fetchUsers();
    refreshStats();
  };

  const statCards = [
    { label: 'AccreditPro Users', value: stats?.platform ?? 0, icon: ShieldCheck, color: 'text-violet-600 bg-violet-500/10' },
    { label: 'College Users', value: stats?.college ?? 0, icon: Building2, color: 'text-primary bg-primary/10' },
    { label: 'Active', value: stats?.active ?? 0, icon: UserCheck, color: 'text-green-600 bg-green-500/10' },
    { label: 'Pending Invitations', value: stats?.pending ?? 0, icon: UserPlus, color: 'text-amber-600 bg-amber-500/10' },
  ];

  const columns: ColumnDef<PlatformUser>[] = [
    {
      id: 'user',
      header: 'User',
      accessorKey: 'name',
      sortable: true,
      className: 'min-w-[240px]',
      cell: (user) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={avatarUrl(user.name)} alt={user.name} />
            <AvatarFallback className="text-[10px]">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'institution',
      header: 'Institution',
      accessorKey: 'institution',
      className: 'hidden md:table-cell min-w-[200px] max-w-[260px]',
      cell: (user) => (
        <div className="min-w-0">
          <p className="text-xs font-medium truncate">{user.institution}</p>
          {user.roleKey === 'SUPER_ADMIN' ? (
            <Badge variant="outline" className="text-[9px] mt-0.5">Platform</Badge>
          ) : (
            <p className="text-[10px] text-muted-foreground mt-0.5">{user.institutionId.replace('inst-', '')}</p>
          )}
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      accessorKey: 'role',
      className: 'min-w-[150px]',
      cell: (user) => (
        <Badge variant="outline" className="text-[10px] font-medium">{user.role}</Badge>
      ),
    },
    {
      id: 'department',
      header: 'Department',
      accessorKey: 'department',
      className: 'hidden lg:table-cell',
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      className: 'w-[110px]',
      cell: (user) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[user.status]}`}>
          {statusLabel[user.status]}
        </span>
      ),
    },
    {
      id: 'lastLogin',
      header: 'Last Login',
      accessorKey: 'lastLogin',
      sortable: true,
      className: 'hidden xl:table-cell whitespace-nowrap',
      cell: (user) => <span className="text-xs text-muted-foreground">{user.lastLogin}</span>,
    },
    {
      id: 'actions',
      header: '',
      className: 'w-[60px] text-right',
      cell: (user) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => setViewUser(user)}>
                <Eye className="h-3.5 w-3.5" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => setResetUser(user)}>
                <KeyRound className="h-3.5 w-3.5" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.status !== 'active' && (
                <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => handleStatusChange(user, 'active')}>
                  <UserCheck className="h-3.5 w-3.5" />
                  Activate
                </DropdownMenuItem>
              )}
              {user.status === 'active' && (
                <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => handleStatusChange(user, 'inactive')}>
                  <UserX className="h-3.5 w-3.5" />
                  Deactivate
                </DropdownMenuItem>
              )}
              {user.status !== 'blocked' && (
                <DropdownMenuItem className="text-xs gap-2 cursor-pointer text-red-600 focus:text-red-600" onClick={() => handleStatusChange(user, 'blocked')}>
                  <Ban className="h-3.5 w-3.5" />
                  Block
                </DropdownMenuItem>
              )}
              {user.status === 'blocked' && (
                <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => handleStatusChange(user, 'active')}>
                  <Unlock className="h-3.5 w-3.5" />
                  Unblock
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage AccreditPro platform users and college users
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-9" onClick={fetchUsers}>
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 h-9 border-violet-500/40 text-violet-600 hover:bg-violet-500/10 dark:text-violet-400"
            onClick={() => setShowPlatformDialog(true)}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            AccreditPro User
          </Button>
          <Button size="sm" className="gap-2 h-9" onClick={() => setShowCollegeDialog(true)}>
            <UserPlus className="h-3.5 w-3.5" />
            College User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-tight">{card.value}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={filters.userType} onValueChange={(v) => updateFilter('userType', v)}>
              <SelectTrigger className="w-full lg:w-[180px] h-9">
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Users</SelectItem>
                <SelectItem value="platform" className="text-xs">AccreditPro Users</SelectItem>
                <SelectItem value="college" className="text-xs">College Users</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.institutionId} onValueChange={(v) => updateFilter('institutionId', v)} disabled={filters.userType === 'platform'}>
              <SelectTrigger className="w-full lg:w-[240px] h-9">
                <Building2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="All Institutions" />
              </SelectTrigger>
              <SelectContent className="max-h-[240px]">
                <SelectItem value="all" className="text-xs">All Institutions</SelectItem>
                {institutions.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id} className="text-xs">{inst.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.role} onValueChange={(v) => updateFilter('role', v)}>
              <SelectTrigger className="w-full lg:w-[190px] h-9">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Roles</SelectItem>
                {ALL_ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role.key} value={role.label} className="text-xs">{role.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(v) => updateFilter('status', v)}>
              <SelectTrigger className="w-full lg:w-[150px] h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Status</SelectItem>
                <SelectItem value="active" className="text-xs">Active</SelectItem>
                <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                <SelectItem value="inactive" className="text-xs">Inactive</SelectItem>
                <SelectItem value="blocked" className="text-xs">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            sort={sort}
            onSort={handleSort}
            rowKey={(user) => user.id}
            emptyTitle="No users found"
            emptyDescription="Try adjusting your search or filters."
          />
          <div className="px-4 border-t">
            <DataTablePagination
              pagination={pagination}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              onPageSizeChange={(pageSize) => setPagination((prev) => ({ ...prev, pageSize, page: 1 }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreatePlatformUserDialog
        open={showPlatformDialog}
        onClose={() => setShowPlatformDialog(false)}
        onCreated={handleUserCreated}
      />
      <CreateCollegeUserDialog
        open={showCollegeDialog}
        onClose={() => setShowCollegeDialog(false)}
        onCreated={handleUserCreated}
      />
      <ViewUserDialog user={viewUser} onClose={() => setViewUser(null)} />
      <ResetPasswordDialog user={resetUser} onClose={() => setResetUser(null)} />
    </motion.div>
  );
};

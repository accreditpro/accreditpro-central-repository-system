import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService } from '@/services/admin.service';
import type { CreateInstitutionResponse } from '@/types/institution.types';
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Calendar,
  UserCog,
  Shield,
  User,
  Mail,
  Users,
  BookOpen,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { Separator as SeparatorPrimitive } from '@/components/ui/separator';

type LoadState = 'loading' | 'success' | 'error';

const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="space-y-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium">{value || '—'}</p>
  </div>
);

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  } catch {
    // Clipboard API not available
  }
};

/** Render a user card with copyable credentials */
const UserCard = ({
  role,
  icon,
  iconColor,
  user,
}: {
  role: string;
  icon: React.ReactNode;
  iconColor: string;
  user: CreateInstitutionResponse['adminUser'];
}) => (
  <Card className="overflow-hidden transition-shadow hover:shadow-md">
    <CardContent className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`rounded-lg p-2.5 ${iconColor}`}>{icon}</div>
        <div>
          <p className="text-sm font-semibold">{user.name}</p>
          <Badge variant="outline" className="text-[10px] mt-0.5">
            {user.role}
          </Badge>
        </div>
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-foreground truncate">{user.email}</span>
          <button
            type="button"
            onClick={() => copyToClipboard(user.email)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors ml-auto"
            title="Copy email"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
        {user.temporaryPassword && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
              Temp PW:
            </span>
            <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">
              {user.temporaryPassword}
            </code>
            <button
              type="button"
              onClick={() => copyToClipboard(user.temporaryPassword!)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              title="Copy password"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
        )}
        {user.requiresPasswordChange && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Password change required on first login
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

export const InstitutionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>('loading');
  const [response, setResponse] = useState<CreateInstitutionResponse | null>(null);

  useEffect(() => {
    if (!id) {
      setState('error');
      return;
    }
    setState('loading');
    adminService
      .getInstitutionById(Number(id))
      .then(data => {
        setResponse(data);
        setState('success');
      })
      .catch(() => {
        setState('error');
      });
  }, [id]);

  if (state === 'loading') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (state === 'error' || !response) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h2 className="text-lg font-semibold">Institution not found</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          The institution you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
        </p>
        <Button variant="outline" onClick={() => navigate('/admin/institutions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Institutions
        </Button>
      </div>
    );
  }

  const rawInst = (response as any).institution || response;
  const institution = {
    id: rawInst.id,
    name: rawInst.name || rawInst.basicInfo?.name || '',
    code: rawInst.code || rawInst.basicInfo?.code || '',
    category: rawInst.category || rawInst.basicInfo?.category || 'Engineering',
    state: rawInst.state || rawInst.address?.state || '',
    city: rawInst.city || rawInst.address?.city || rawInst.address?.district || rawInst.district || '',
    addressLine1: rawInst.addressLine1 || rawInst.address?.addressLine1 || '',
    addressLine2: rawInst.addressLine2 || rawInst.address?.addressLine2 || '',
    pincode: rawInst.pincode || rawInst.address?.pincode || '',
    email: rawInst.email || rawInst.basicInfo?.email || '',
    phone: rawInst.phone || rawInst.basicInfo?.phone || '',
    website: rawInst.website || rawInst.basicInfo?.website || '',
    logoUrl: rawInst.logoUrl || rawInst.logo || rawInst.basicInfo?.logo || '',
    status: rawInst.status || 'ACTIVE',
    usersCount: (response as any).usersCreated ?? rawInst.usersCount ?? 0,
    repositoryCompletion: rawInst.repositoryCompletion ?? 0,
    documentsUploaded: rawInst.documentsUploaded ?? 0,
    createdAt: rawInst.createdAt || new Date().toISOString(),
  };

  const rawAdmin = (response as any).adminUser || (response as any).admin || rawInst.admin || {};
  const adminUser = {
    name: rawAdmin.name || 'Admin',
    email: rawAdmin.email || '',
    mobile: rawAdmin.mobile || '',
    role: rawAdmin.role || 'INSTITUTION_ADMIN',
    temporaryPassword: rawAdmin.temporaryPassword,
    requiresPasswordChange: rawAdmin.requiresPasswordChange ?? false,
  };

  const rawIqac = (response as any).iqacUser || {};
  const iqacUser = {
    name: rawIqac.name || adminUser.name,
    email: rawIqac.email || adminUser.email,
    mobile: rawIqac.mobile || adminUser.mobile,
    role: rawIqac.role || 'IQAC_COORDINATOR',
    temporaryPassword: rawIqac.temporaryPassword,
    requiresPasswordChange: rawIqac.requiresPasswordChange ?? false,
  };

  const rawPrincipal = (response as any).principalUser || {};
  const principalUser = {
    name: rawPrincipal.name || adminUser.name,
    email: rawPrincipal.email || adminUser.email,
    mobile: rawPrincipal.mobile || adminUser.mobile,
    role: rawPrincipal.role || 'PRINCIPAL',
    temporaryPassword: rawPrincipal.temporaryPassword,
    requiresPasswordChange: rawPrincipal.requiresPasswordChange ?? false,
  };

  const academicEntities = (response as any).academicEntities || {
    academicYears: [],
    programs: [],
    departments: [],
  };

  const statusConfig: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
  > = {
    active: { label: 'Active', variant: 'default' },
    ACTIVE: { label: 'Active', variant: 'default' },
    inactive: { label: 'Inactive', variant: 'secondary' },
    INACTIVE: { label: 'Inactive', variant: 'secondary' },
    pending: { label: 'Pending', variant: 'outline' },
    PENDING: { label: 'Pending', variant: 'outline' },
    suspended: { label: 'Suspended', variant: 'destructive' },
    SUSPENDED: { label: 'Suspended', variant: 'destructive' },
  };
  const statusInfo = statusConfig[institution.status] || {
    label: institution.status,
    variant: 'outline' as const,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 mt-1"
          onClick={() => navigate('/admin/institutions')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-border/50 flex items-center justify-center shrink-0">
                {institution.logoUrl ? (
                  <img
                    src={institution.logoUrl}
                    alt={institution.name}
                    className="h-10 w-10 object-cover"
                  />
                ) : (
                  <Building2 className="h-5 w-5 text-primary/60" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight truncate">{institution.name}</h1>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">
                    {institution.code}
                  </code>
                  <span>·</span>
                  <span>{institution.category}</span>
                </div>
              </div>
            </div>
            <Badge variant={statusInfo.variant} className="text-[10px] font-medium shrink-0">
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-8 text-xs shrink-0"
          onClick={() => navigate(`/admin/institutions/${id}/edit`)}
        >
          Edit
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2.5">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Users Created</p>
              <p className="text-lg font-bold">{response.usersCreated}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2.5">
              <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Programs</p>
              <p className="text-lg font-bold">{academicEntities.programsCreated}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2.5">
              <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Departments</p>
              <p className="text-lg font-bold">{academicEntities.departmentsCreated}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-violet-500/10 p-2.5">
              <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Academic Years</p>
              <p className="text-lg font-bold">{academicEntities.academicYearsCreated}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Institution Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" />
            Institution Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Field label="Institution Name" value={institution.name} />
            <Field label="Institution Code" value={institution.code} />
            <Field label="Category" value={institution.category} />
            <Field label="Email" value={institution.email} />
            <Field label="Phone" value={institution.phone} />
            <Field label="Website" value={institution.website} />
            <Field label="Address Line 1" value={institution.addressLine1} />
            <Field label="Address Line 2" value={institution.addressLine2} />
            <Field label="City" value={institution.city} />
            <Field label="State" value={institution.state} />
            <Field label="Pincode" value={institution.pincode} />
            <Field label="Status" value={statusInfo.label} />
            <Field label="Established Year" value={institution.establishedYear} />
            <Field
              label="Created At"
              value={new Date(institution.createdAt).toLocaleDateString()}
            />
            <Field
              label="Updated At"
              value={new Date(institution.updatedAt).toLocaleDateString()}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Section */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Users ({response.usersCreated})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UserCard
            role="Institution Admin"
            icon={<UserCog className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
            iconColor="bg-blue-500/10"
            user={adminUser}
          />
          <UserCard
            role="IQAC Coordinator"
            icon={<Shield className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />}
            iconColor="bg-cyan-500/10"
            user={iqacUser}
          />
          <UserCard
            role="Principal"
            icon={<User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
            iconColor="bg-indigo-500/10"
            user={principalUser}
          />
        </div>
      </div>

      {/* Academic Entities Summary */}
      <Card className="bg-muted/30">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Programs</p>
                <p className="text-sm font-bold">{academicEntities.programsCreated}</p>
              </div>
            </div>
            <SeparatorPrimitive orientation="vertical" className="h-10" />
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Departments</p>
                <p className="text-sm font-bold">{academicEntities.departmentsCreated}</p>
              </div>
            </div>
            <SeparatorPrimitive orientation="vertical" className="h-10" />
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-violet-500/10 p-2">
                <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Academic Years</p>
                <p className="text-sm font-bold">{academicEntities.academicYearsCreated}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

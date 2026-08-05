import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Institution } from '@/types/institution.types';
import { InstitutionLogo } from './InstitutionLogo';
import { StatusBadge } from './StatusBadge';
import {
  Mail,
  Phone,
  Globe,
  Users,
  FileText,
  Calendar,
  Award,
  Clock,
  MapPin,
  Pencil,
  Activity,
  Hash,
  Building2,
  UserCog,
  Home,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstitutionDetailsDialogProps {
  institution: Institution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (institution: Institution) => void;
  onImpersonate?: (institution: Institution) => void;
}

const formatDate = (iso?: string) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted">
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <div className="text-sm text-foreground truncate">{value}</div>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border bg-card p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">{icon}{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    </section>
  );
}

export function InstitutionDetailsDialog({
  institution,
  open,
  onOpenChange,
  onEdit,
  onImpersonate,
}: InstitutionDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        {institution ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-1">Institution Details</DialogTitle>
              <DialogDescription>
                Detailed information about this institution
              </DialogDescription>
            </DialogHeader>

            {/* Header */}
            <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
              <InstitutionLogo name={institution.name} logo={institution.logo} size="xl" />
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold leading-tight truncate">{institution.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <StatusBadge status={institution.status} />
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {institution.category}
                  </Badge>
                  <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
                    {institution.code}
                  </code>
                </div>
              </div>
            </div>

            {/* Basic Information (matches the Add Institution form) */}
            <Section icon={<Building2 className="h-4 w-4 text-blue-500" />} title="Basic Information">
              <DetailRow
                icon={<Hash className="h-3.5 w-3.5" />}
                label="Institution Code"
                value={
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{institution.code}</code>
                }
              />
              <DetailRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={institution.email || '-'} />
              <DetailRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={institution.phone || '-'} />
              <DetailRow
                icon={<Globe className="h-3.5 w-3.5" />}
                label="Website"
                value={
                  institution.website ? (
                    <a
                      href={institution.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline truncate block max-w-[220px]"
                    >
                      {institution.website.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    '-'
                  )
                }
              />
            </Section>

            {/* Address (matches the Add Institution form) */}
            <Section icon={<MapPin className="h-4 w-4 text-emerald-500" />} title="Address">
              <DetailRow
                icon={<Home className="h-3.5 w-3.5" />}
                label="Address Line 1"
                value={institution.addressLine1 || '-'}
              />
              <DetailRow label="Address Line 2" icon={<Home className="h-3.5 w-3.5" />} value={institution.addressLine2 || '-'} />
              <DetailRow label="State" icon={<MapPin className="h-3.5 w-3.5" />} value={institution.state || '-'} />
              <DetailRow
                label="District"
                icon={<MapPin className="h-3.5 w-3.5" />}
                value={institution.district || institution.city || '-'}
              />
              <DetailRow label="Pincode" icon={<Hash className="h-3.5 w-3.5" />} value={institution.pincode || '-'} />
            </Section>

            {/* Administrator (matches the Add Institution form) */}
            <Section icon={<UserCog className="h-4 w-4 text-red-500" />} title="Administrator">
              <DetailRow
                icon={<UserCog className="h-3.5 w-3.5" />}
                label="Full Name"
                value={institution.admin?.name || '-'}
              />
              <DetailRow
                icon={<Mail className="h-3.5 w-3.5" />}
                label="Email"
                value={institution.admin?.email || '-'}
              />
              <DetailRow
                icon={<Phone className="h-3.5 w-3.5" />}
                label="Mobile"
                value={institution.admin?.mobile || '-'}
              />
              <DetailRow
                label="Password"
                icon={<Award className="h-3.5 w-3.5" />}
                value="Auto-generated (shown after creation)"
              />
            </Section>

            {/* Platform details */}
            <Section icon={<Activity className="h-4 w-4 text-purple-500" />} title="Platform Details">
              <DetailRow icon={<Calendar className="h-3.5 w-3.5" />} label="Established" value={String(institution.establishedYear)} />
              <DetailRow icon={<Award className="h-3.5 w-3.5" />} label="Accreditation" value={institution.accreditationStatus} />
              <DetailRow icon={<Users className="h-3.5 w-3.5" />} label="Users" value={institution.usersCount.toLocaleString()} />
              <DetailRow
                icon={<FileText className="h-3.5 w-3.5" />}
                label="Documents Uploaded"
                value={institution.documentsUploaded.toLocaleString()}
              />
              <DetailRow
                icon={<Activity className="h-3.5 w-3.5" />}
                label="Repository Completion"
                value={
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <Progress
                      value={institution.repositoryCompletion}
                      className={cn(
                        'h-1.5 flex-1',
                        institution.repositoryCompletion < 50 && '[&>div]:bg-red-500',
                        institution.repositoryCompletion >= 50 && institution.repositoryCompletion < 75 && '[&>div]:bg-amber-500',
                        institution.repositoryCompletion >= 75 && '[&>div]:bg-emerald-500'
                      )}
                    />
                    <span className="text-[10px] font-medium">{institution.repositoryCompletion}%</span>
                  </div>
                }
              />
              <DetailRow icon={<Clock className="h-3.5 w-3.5" />} label="Last Active" value={institution.lastActive} />
              <DetailRow icon={<Calendar className="h-3.5 w-3.5" />} label="Created" value={formatDate(institution.createdAt)} />
              <DetailRow icon={<Calendar className="h-3.5 w-3.5" />} label="Last Updated" value={formatDate(institution.updatedAt)} />
            </Section>

            <DialogFooter className="sm:justify-between">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <div className="flex items-center gap-2">
                {institution.status === 'active' && onImpersonate && (
                  <Button
                    variant="outline"
                    className="gap-1.5 border-amber-300/50 text-amber-700 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400"
                    onClick={() => {
                      onOpenChange(false);
                      onImpersonate(institution);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Impersonate
                  </Button>
                )}
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(institution);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

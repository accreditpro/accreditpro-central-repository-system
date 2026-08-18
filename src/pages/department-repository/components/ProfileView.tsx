import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { coordinatorContext, departmentInfo, repositoryHealth } from '../repository-configs';
import { Progress } from '@/components/ui/progress';
import {
  infrastructureRepositoryService,
  ProfileData,
} from '@/services/infrastructure-repository.service';
import {
  User,
  Building2,
  GraduationCap,
  Calendar,
  Shield,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface ProfileViewProps {
  /** When true, the view reads the Infrastructure Coordinator backend instead of mock data. */
  liveMode?: boolean;
}

export const ProfileView = ({ liveMode }: ProfileViewProps) => {
  const [liveData, setLiveData] = useState<ProfileData | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  useEffect(() => {
    if (!liveMode) return;
    let cancelled = false;
    setLiveLoading(true);
    setLiveError(null);
    infrastructureRepositoryService.getProfile()
      .then(data => { if (!cancelled) setLiveData(data); })
      .catch(e => { if (!cancelled) setLiveError(e instanceof Error ? e.message : 'Failed to load profile'); })
      .finally(() => { if (!cancelled) setLiveLoading(false); });
    return () => { cancelled = true; };
  }, [liveMode]);

  if (liveMode && liveLoading && !liveData) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading profile...</span>
      </div>
    );
  }

  const coordinator = liveData?.coordinator;
  const assignment = liveData?.assignment;
  const readiness = liveData?.readiness?.length ? liveData.readiness : Object.entries(repositoryHealth).map(([key, metrics]) => ({ id: key, label: key, ...metrics }));
  const permissions = liveData?.permissions;

  const overallReadiness = readiness.length
    ? Math.round(readiness.reduce((sum, m) => sum + m.readinessScore, 0) / readiness.length)
    : 0;

  const displayName = coordinator?.name || departmentInfo.coordinatorName;
  const displayRole = coordinator?.role
    ? coordinator.role.replace(/_/g, ' ')
    : 'Department Coordinator';
  const displayEmail = coordinator?.email || 'anita.sharma@institution.edu';
  const displayPhone = coordinator?.phone || '+91 98765 43210';
  const displayDepartment = assignment?.department || departmentInfo.department;
  const displayInstitution = assignment?.institution || 'Institution';
  const displayAcademicYear = assignment?.academicYear || departmentInfo.academicYear;
  const allowedActions = permissions?.allowed || ['Upload Data', 'Update Data', 'Re-submit Data', 'Upload Evidence', 'Download Templates', 'View Reports'];
  const restrictedActions = permissions?.restricted || ['Verify Records', 'Approve Records', 'Reject Records', 'Modify Master Data', 'Create Programs/Departments', 'Manage Users'];

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {liveMode ? 'Coordinator profile and assignment details' : 'Department Coordinator profile and assignment details'}
        </p>
      </motion.div>

      {liveMode && liveError && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-600">{liveError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Coordinator Profile */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Coordinator Information</CardTitle>
            <CardDescription className="text-xs">Your profile and role details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold">{displayName}</h3>
                <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 mt-1">
                  {displayRole}
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Email</p>
                  <p className="text-xs font-medium">{displayEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Phone</p>
                  <p className="text-xs font-medium">{displayPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Role</p>
                  <p className="text-xs font-medium">{displayRole}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Assignment */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              {liveMode ? 'Assignment' : 'Department Assignment'}
            </CardTitle>
            <CardDescription className="text-xs">Your assigned scope</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Department</p>
                  <p className="text-xs font-medium">{displayDepartment}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Institution</p>
                  <p className="text-xs font-medium">{displayInstitution}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Academic Year</p>
                  <p className="text-xs font-medium">{displayAcademicYear}</p>
                </div>
              </div>
              {!liveMode && (
                <>
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Program Offerings</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {departmentInfo.programOfferings.map(po => (
                          <Badge key={po} variant="outline" className="text-[9px]">{po}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Specializations</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {departmentInfo.specializations.map(sp => (
                          <Badge key={sp} variant="outline" className="text-[9px]">{sp}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Repository Readiness */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Repository Readiness Overview</CardTitle>
              <CardDescription className="text-xs">Your overall accreditation readiness</CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              Overall: {overallReadiness}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {readiness.map((metrics) => (
              <div key={metrics.id} className="p-3 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold capitalize">{metrics.label.replace(/-/g, ' ')} Repository</span>
                  <span className="text-xs font-bold text-primary">{metrics.readinessScore}%</span>
                </div>
                <Progress value={metrics.readinessScore} className="h-2" />
                <p className="text-[9px] text-muted-foreground mt-1.5">
                  Data: {metrics.dataCompleteness}% • Evidence: {metrics.evidenceCompleteness}% • Verification: {metrics.verificationPercent}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Permissions & Access</CardTitle>
          <CardDescription className="text-xs">What you can and cannot do</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-emerald-600">✓ Allowed Actions</p>
              <ul className="space-y-1">
                {allowedActions.map(action => (
                  <li key={action} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-600">✗ Restricted Actions</p>
              <ul className="space-y-1">
                {restrictedActions.map(action => (
                  <li key={action} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

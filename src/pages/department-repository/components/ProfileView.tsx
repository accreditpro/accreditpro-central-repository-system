import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { coordinatorContext, departmentInfo, repositoryHealth } from '../repository-configs';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Building2,
  GraduationCap,
  Calendar,
  Shield,
  Mail,
  Phone,
} from 'lucide-react';

export const ProfileView = () => {
  const overallReadiness = Math.round(
    Object.values(repositoryHealth).reduce((sum, m) => sum + m.readinessScore, 0) /
    Object.values(repositoryHealth).length
  );

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Department Coordinator profile and assignment details
        </p>
      </motion.div>

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
                <h3 className="text-base font-semibold">{departmentInfo.coordinatorName}</h3>
                <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 mt-1">
                  Department Coordinator
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Email</p>
                  <p className="text-xs font-medium">anita.sharma@institution.edu</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Phone</p>
                  <p className="text-xs font-medium">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Role</p>
                  <p className="text-xs font-medium">{coordinatorContext.role.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Assignment */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Department Assignment</CardTitle>
            <CardDescription className="text-xs">Your assigned department and scope</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Department</p>
                  <p className="text-xs font-medium">{departmentInfo.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Academic Year</p>
                  <p className="text-xs font-medium">{departmentInfo.academicYear}</p>
                </div>
              </div>
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
              <CardDescription className="text-xs">Your department's overall accreditation readiness</CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              Overall: {overallReadiness}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(repositoryHealth).map(([key, metrics]) => (
              <div key={key} className="p-3 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold capitalize">{key} Repository</span>
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
          <CardDescription className="text-xs">What you can and cannot do as Department Coordinator</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-emerald-600">✓ Allowed Actions</p>
              <ul className="space-y-1">
                {['Upload Data', 'Update Data', 'Re-submit Data', 'Upload Evidence', 'Download Templates', 'View Reports'].map(action => (
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
                {['Verify Records', 'Approve Records', 'Reject Records', 'Modify Master Data', 'Create Programs/Departments', 'Manage Users'].map(action => (
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
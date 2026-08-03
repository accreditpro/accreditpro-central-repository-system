import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  School,
  FlaskConical,
  Wrench,
  BookOpen,
  Monitor,
  Home,
  Trophy,
  Bus,
  Leaf,
  Zap,
  Droplets,
  Trash2,
  ClipboardCheck,
  Flame,
  Camera,
  AlertTriangle,
  ShieldCheck,
  Settings,
  Wifi,
  Package,
  Clock,
  FileText,
  ArrowUpRight,
  Upload,
  RefreshCw,
} from 'lucide-react';
import {
  infrastructureSummaryData,
  infrastructureRecentActivities,
  greenCampusAnalytics,
  safetySecurityAnalytics,
  utilitiesAnalytics,
} from '../infrastructure-configs';

interface InfrastructureDashboardProps {
  onNavigate: (tabId: string) => void;
}

const scoreCards = [
  {
    label: 'Repository Completion',
    value: 82,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    label: 'Evidence Completion',
    value: 68,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    label: 'Verification',
    value: 75,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
  },
  {
    label: 'Infrastructure Readiness',
    value: 71,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
  },
];

const infraKpiCards = [
  {
    id: 'buildings',
    label: 'Buildings',
    value: 12,
    icon: Building2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    id: 'classrooms',
    label: 'Classrooms',
    value: 85,
    icon: School,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    id: 'laboratories',
    label: 'Laboratories',
    value: 42,
    icon: FlaskConical,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
  },
  {
    id: 'equipment',
    label: 'Equipment',
    value: 320,
    icon: Wrench,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
  {
    id: 'library',
    label: 'Library',
    value: 5,
    icon: BookOpen,
    color: 'text-pink-600',
    bg: 'bg-pink-50 dark:bg-pink-950/30',
  },
  {
    id: 'ict-infrastructure',
    label: 'ICT Infrastructure',
    value: 5,
    icon: Monitor,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
  },
  {
    id: 'hostels',
    label: 'Hostels',
    value: 8,
    icon: Home,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
  },
  {
    id: 'sports-facilities',
    label: 'Sports Facilities',
    value: 15,
    icon: Trophy,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
  },
  {
    id: 'transport',
    label: 'Transport',
    value: 22,
    icon: Bus,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
];

const greenCampusCards = [
  {
    id: 'green-initiatives',
    label: 'Green Initiatives',
    value: 12,
    icon: Leaf,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
  },
  {
    id: 'energy-management',
    label: 'Energy Management',
    value: 5,
    icon: Zap,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
  },
  {
    id: 'water-management',
    label: 'Water Management',
    value: 5,
    icon: Droplets,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    id: 'waste-management',
    label: 'Waste Management',
    value: 8,
    icon: Trash2,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
  {
    id: 'green-audit',
    label: 'Green Audit',
    value: 3,
    icon: ClipboardCheck,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
];

const safetySecurityCards = [
  {
    id: 'fire-safety',
    label: 'Fire Safety',
    value: 9,
    icon: Flame,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
  {
    id: 'security-infrastructure',
    label: 'Security Infrastructure',
    value: 5,
    icon: Camera,
    color: 'text-slate-600',
    bg: 'bg-slate-50 dark:bg-slate-950/30',
  },
  {
    id: 'emergency-preparedness',
    label: 'Emergency Preparedness',
    value: 4,
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    id: 'insurance-compliance',
    label: 'Insurance & Compliance',
    value: 6,
    icon: ShieldCheck,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
  },
];

const utilitiesCards = [
  {
    id: 'power-infrastructure',
    label: 'Power Infrastructure',
    value: 5,
    icon: Zap,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    id: 'water-supply',
    label: 'Water Supply',
    value: 5,
    icon: Droplets,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
  },
  {
    id: 'internet-network',
    label: 'Internet & Network',
    value: 5,
    icon: Wifi,
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
  },
  {
    id: 'utility-assets',
    label: 'Utility Assets',
    value: 18,
    icon: Package,
    color: 'text-teal-600',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
  },
];

const pendingCards = [
  {
    label: 'Pending Reviews',
    value: 21,
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    label: 'Pending Verification',
    value: 50,
    icon: ShieldCheck,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
  {
    label: 'Pending Documents',
    value: 18,
    icon: FileText,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
];

const ModuleKPIGrid = ({
  title,
  cards,
  onNavigate,
  color,
  icon: Icon,
}: {
  title: string;
  cards: typeof infraKpiCards;
  onNavigate: (id: string) => void;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`h-4 w-4 ${color}`} />
      <h3 className="text-sm font-semibold">{title}</h3>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 }}
        >
          <Card
            className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => onNavigate(card.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-md ${card.bg}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);

export const InfrastructureDashboard = ({ onNavigate }: InfrastructureDashboardProps) => {
  const totalRecords = Object.values(infrastructureSummaryData).reduce(
    (sum, s) => sum + s.recordsUploaded,
    0
  );
  const totalApproved = Object.values(infrastructureSummaryData).reduce(
    (sum, s) => sum + s.approved,
    0
  );

  return (
    <div className="space-y-6">
      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scoreCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`${card.bgColor} border-0 shadow-sm`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <Badge variant="secondary" className="text-xs">
                    {card.value}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className={`text-3xl font-bold ${card.color}`}>{card.value}%</div>
                  <Progress value={card.value} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {totalRecords}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Records</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{totalApproved}</p>
            <p className="text-xs text-muted-foreground mt-1">Approved</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">23</p>
            <p className="text-xs text-muted-foreground mt-1">Data Tabs</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">78</p>
            <p className="text-xs text-muted-foreground mt-1">Evidence Documents</p>
          </CardContent>
        </Card>
      </div>

      {/* Module KPI Sections */}
      <ModuleKPIGrid
        title="Infrastructure"
        cards={infraKpiCards}
        onNavigate={onNavigate}
        color="text-emerald-600"
        icon={Building2}
      />
      <ModuleKPIGrid
        title="Green Campus & Sustainability"
        cards={greenCampusCards}
        onNavigate={onNavigate}
        color="text-green-600"
        icon={Leaf}
      />
      <ModuleKPIGrid
        title="Safety & Security"
        cards={safetySecurityCards}
        onNavigate={onNavigate}
        color="text-red-600"
        icon={ShieldCheck}
      />
      <ModuleKPIGrid
        title="Utilities"
        cards={utilitiesCards}
        onNavigate={onNavigate}
        color="text-amber-600"
        icon={Settings}
      />

      {/* Analytics Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Green Campus Analytics */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-600" />
              Green Campus Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Renewable Energy</span>
              <Badge variant="secondary" className="text-xs">
                {greenCampusAnalytics.renewableEnergyPercent}%
              </Badge>
            </div>
            <Progress value={greenCampusAnalytics.renewableEnergyPercent} className="h-1.5" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Green Audit</span>
              <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {greenCampusAnalytics.greenAuditStatus}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Carbon Reduction</span>
              <span className="text-xs font-medium">
                {greenCampusAnalytics.carbonReductionInitiatives} initiatives
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Safety & Security Analytics */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-red-600" />
              Safety & Security Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Fire Safety Compliance</span>
              <Badge variant="secondary" className="text-xs">
                {safetySecurityAnalytics.fireSafetyCompliance}%
              </Badge>
            </div>
            <Progress value={safetySecurityAnalytics.fireSafetyCompliance} className="h-1.5" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">CCTV Cameras</span>
              <span className="text-xs font-medium">{safetySecurityAnalytics.cctvCoverage}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Insurance Expiry Alerts</span>
              <Badge className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {safetySecurityAnalytics.insuranceExpiryAlerts}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Utilities Analytics */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4 text-amber-600" />
              Utilities Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Power Backup Readiness</span>
              <Badge variant="secondary" className="text-xs">
                {utilitiesAnalytics.powerBackupReadiness}%
              </Badge>
            </div>
            <Progress value={utilitiesAnalytics.powerBackupReadiness} className="h-1.5" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Internet Bandwidth</span>
              <span className="text-xs font-medium">
                {utilitiesAnalytics.internetBandwidthUtilization}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">AMC Expiry Alerts</span>
              <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {utilitiesAnalytics.amcExpiryAlerts}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pendingCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activities */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {infrastructureRecentActivities.slice(0, 8).map(activity => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`p-2 rounded-lg ${
                    activity.type === 'upload'
                      ? 'bg-blue-50 dark:bg-blue-950/30'
                      : activity.type === 'evidence'
                        ? 'bg-purple-50 dark:bg-purple-950/30'
                        : 'bg-emerald-50 dark:bg-emerald-950/30'
                  }`}
                >
                  {activity.type === 'upload' ? (
                    <Upload className="h-4 w-4 text-blue-600" />
                  ) : activity.type === 'evidence' ? (
                    <FileText className="h-4 w-4 text-purple-600" />
                  ) : (
                    <RefreshCw className="h-4 w-4 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.timestamp}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

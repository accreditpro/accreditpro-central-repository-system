import { useState, useEffect } from 'react';
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
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  infrastructureRepositoryService,
  DashboardData,
} from '@/services/infrastructure-repository.service';
import { cn } from '@/lib/utils';

interface InfrastructureDashboardProps {
  onNavigate: (tabId: string) => void;
}

const moduleMeta: Record<string, { title: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  infrastructure: { title: 'Infrastructure', color: 'text-emerald-600', icon: Building2 },
  'green-campus': { title: 'Green Campus & Sustainability', color: 'text-green-600', icon: Leaf },
  'safety-security': { title: 'Safety & Security', color: 'text-red-600', icon: ShieldCheck },
  utilities: { title: 'Utilities', color: 'text-amber-600', icon: Settings },
};

const tabIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  buildings: Building2,
  classrooms: School,
  laboratories: FlaskConical,
  equipment: Wrench,
  library: BookOpen,
  'ict-infrastructure': Monitor,
  hostels: Home,
  'sports-facilities': Trophy,
  'seminar-halls': FlaskConical,
  transport: Bus,
  'green-initiatives': Leaf,
  'energy-management': Zap,
  'water-management': Droplets,
  'waste-management': Trash2,
  'green-audit': ClipboardCheck,
  'fire-safety': Flame,
  'security-infrastructure': Camera,
  'emergency-preparedness': AlertTriangle,
  'insurance-compliance': ShieldCheck,
  'power-infrastructure': Zap,
  'water-supply': Droplets,
  'internet-network': Wifi,
  'utility-assets': Package,
};

const cardColors = [
  { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  { color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  { color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950/30' },
  { color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
  { color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  { color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
  { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
  { color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
  { color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/30' },
  { color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
];

const ModuleKPIGrid = ({ title, cards, onNavigate, color, icon: Icon }: {
  title: string;
  cards: { id: string; label: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }[];
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

const defaultScoreCards = [
  { label: 'Repository Completion', value: 0, color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { label: 'Evidence Completion', value: 0, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  { label: 'Verification', value: 0, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
  { label: 'Infrastructure Readiness', value: 0, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
];

export const InfrastructureDashboard = ({ onNavigate }: InfrastructureDashboardProps) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    infrastructureRepositoryService.getDashboard()
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load dashboard'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading dashboard...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center gap-2 py-20">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const scoreCards = data?.scoreCards?.length
    ? data.scoreCards.map((card, i) => ({ ...card, ...defaultScoreCards[i % defaultScoreCards.length] }))
    : defaultScoreCards;

  const summary = data?.summary
    ? data.summary
    : { totalRecords: 0, totalApproved: 0, dataTabs: 23, evidenceDocuments: 0 };

  const moduleGrids = (data?.modules || []).map((module, moduleIndex) => {
    const meta = moduleMeta[module.id] || moduleMeta.infrastructure;
    return (
      <ModuleKPIGrid
        key={module.id}
        title={module.label || meta.title}
        cards={(module.tabs || []).map((tab, i) => {
          const TabIcon = tabIconMap[tab.id] || FileText;
          const palette = cardColors[(moduleIndex + i) % cardColors.length];
          return {
            id: tab.id,
            label: tab.label,
            value: Number(tab.value || 0),
            icon: TabIcon,
            color: palette.color,
            bg: palette.bg,
          };
        })}
        onNavigate={onNavigate}
        color={meta.color}
        icon={meta.icon}
      />
    );
  });

  const analytics = data?.analytics || {
    greenCampus: { renewableEnergyPercent: 0, greenAuditStatus: 'Pending', carbonReductionInitiatives: 0 },
    safetySecurity: { fireSafetyCompliance: 0, cctvCoverage: 0, insuranceExpiryAlerts: 0 },
    utilities: { powerBackupReadiness: 0, internetBandwidthUtilization: 0, amcExpiryAlerts: 0 },
  };

  const pending = data?.pending
    ? [
        { label: 'Pending Reviews', value: data.pending.pendingReviews, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
        { label: 'Pending Verification', value: data.pending.pendingVerification, icon: ShieldCheck, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
        { label: 'Pending Documents', value: data.pending.pendingDocuments, icon: FileText, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
      ]
    : [
        { label: 'Pending Reviews', value: 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
        { label: 'Pending Verification', value: 0, icon: ShieldCheck, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
        { label: 'Pending Documents', value: 0, icon: FileText, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
      ];

  const recentActivities = data?.recentActivities || [];

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
                  <Badge variant="secondary" className="text-xs">{card.value}%</Badge>
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
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{summary.totalRecords}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Records</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{summary.totalApproved}</p>
            <p className="text-xs text-muted-foreground mt-1">Approved</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{summary.dataTabs}</p>
            <p className="text-xs text-muted-foreground mt-1">Data Tabs</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{summary.evidenceDocuments}</p>
            <p className="text-xs text-muted-foreground mt-1">Evidence Documents</p>
          </CardContent>
        </Card>
      </div>

      {/* Module KPI Sections */}
      {moduleGrids.length > 0 ? moduleGrids : (
        <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <p className="text-xs">No repository data available yet. Upload CSV data to populate the dashboard.</p>
        </div>
      )}

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
              <Badge variant="secondary" className="text-xs">{analytics.greenCampus.renewableEnergyPercent}%</Badge>
            </div>
            <Progress value={analytics.greenCampus.renewableEnergyPercent} className="h-1.5" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Green Audit</span>
              <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{analytics.greenCampus.greenAuditStatus}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Carbon Reduction</span>
              <span className="text-xs font-medium">{analytics.greenCampus.carbonReductionInitiatives} initiatives</span>
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
              <Badge variant="secondary" className="text-xs">{analytics.safetySecurity.fireSafetyCompliance}%</Badge>
            </div>
            <Progress value={analytics.safetySecurity.fireSafetyCompliance} className="h-1.5" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">CCTV Cameras</span>
              <span className="text-xs font-medium">{analytics.safetySecurity.cctvCoverage}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Insurance Expiry Alerts</span>
              <Badge className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{analytics.safetySecurity.insuranceExpiryAlerts}</Badge>
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
              <Badge variant="secondary" className="text-xs">{analytics.utilities.powerBackupReadiness}%</Badge>
            </div>
            <Progress value={analytics.utilities.powerBackupReadiness} className="h-1.5" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Internet Bandwidth</span>
              <span className="text-xs font-medium">{analytics.utilities.internetBandwidthUtilization}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">AMC Expiry Alerts</span>
              <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{analytics.utilities.amcExpiryAlerts}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pending.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn('p-3 rounded-xl', card.bg)}>
                  <card.icon className={cn('h-5 w-5', card.color)} />
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
            {recentActivities.slice(0, 8).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'upload' ? 'bg-blue-50 dark:bg-blue-950/30' :
                  activity.type === 'evidence' ? 'bg-purple-50 dark:bg-purple-950/30' :
                  'bg-emerald-50 dark:bg-emerald-950/30'
                }`}>
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
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.timestamp}</span>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <RefreshCw className="h-8 w-8 mx-auto opacity-40 mb-2" />
                <p className="text-xs">No recent activity yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

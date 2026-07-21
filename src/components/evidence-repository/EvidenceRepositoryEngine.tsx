import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  FolderOpen,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Filter,
  Building2,
  GraduationCap,
} from 'lucide-react';
import {
  RepositorySection,
  EvidenceFolder,
  InstitutionConfig,
  FilterType,
  NotificationItem,
  calculateFolderMetrics,
  calculateSectionMetrics,
  isFolderVisible,
  getCompletionEmoji,
} from './types';
import { FolderCard } from './FolderCard';
import { DocumentTable } from './DocumentTable';

interface EvidenceRepositoryEngineProps {
  section: RepositorySection;
  institutionConfig?: InstitutionConfig;
  notifications?: NotificationItem[];
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
  sections?: RepositorySection[];
}

export function EvidenceRepositoryEngine({
  section,
  institutionConfig,
  activeSection,
  onSectionChange,
  sections,
}: EvidenceRepositoryEngineProps) {
  const [selectedFolder, setSelectedFolder] = useState<EvidenceFolder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const visibleFolders = useMemo(
    () => section.folders.filter(f => isFolderVisible(f, institutionConfig)),
    [section.folders, institutionConfig]
  );

  const sectionMetrics = useMemo(
    () => calculateSectionMetrics(section, institutionConfig),
    [section, institutionConfig]
  );

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return visibleFolders;
    const query = searchQuery.toLowerCase();
    return visibleFolders.filter(
      f =>
        f.name.toLowerCase().includes(query) ||
        f.documents.some(d => d.name.toLowerCase().includes(query)) ||
        f.documents.some(d => d.frameworks.some(fw => fw.toLowerCase().includes(query)))
    );
  }, [visibleFolders, searchQuery]);

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Mandatory', value: 'mandatory' },
    { label: 'Optional', value: 'optional' },
    { label: 'Uploaded', value: 'uploaded' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Expired', value: 'expired' },
  ];

  const sectionIcons: Record<string, React.ElementType> = {
    'institution-information': Building2,
    'academic-structure': GraduationCap,
  };

  if (selectedFolder) {
    return (
      <div className="space-y-4">
        {/* Breadcrumb / Back */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFolder(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {section.name}
          </Button>
        </div>

        {/* Folder Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{selectedFolder.name}</h2>
                  {selectedFolder.description && (
                    <p className="text-sm text-muted-foreground">{selectedFolder.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-lg font-bold">{calculateFolderMetrics(selectedFolder).requiredDocuments}</p>
                  <p className="text-xs text-muted-foreground">Required</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-center">
                  <p className="text-lg font-bold">{calculateFolderMetrics(selectedFolder).uploadedDocuments}</p>
                  <p className="text-xs text-muted-foreground">Uploaded</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{calculateFolderMetrics(selectedFolder).completionPercentage}%</p>
                  <p className="text-xs text-muted-foreground">Completion</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground mr-1" />
            {filters.map(f => (
              <Button
                key={f.value}
                variant={activeFilter === f.value ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setActiveFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Document Table */}
        <DocumentTable
          folder={selectedFolder}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Tabs - Sub-menu for Institution Information / Academic Structure */}
      {sections && sections.length > 1 && onSectionChange && (
        <Tabs value={activeSection} onValueChange={onSectionChange}>
          <TabsList>
            {sections.map(s => {
              const Icon = sectionIcons[s.id] || FileText;
              const metrics = calculateSectionMetrics(s, institutionConfig);
              return (
                <TabsTrigger key={s.id} value={s.id} className="gap-2">
                  <Icon className="h-4 w-4" />
                  {s.name}
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">
                    {metrics.overallCompletion}%
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      )}

      {/* Section Summary Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{section.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Manage and track all supporting documents
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  <span className={sectionMetrics.overallCompletion >= 100 ? 'text-emerald-600 dark:text-emerald-400' : sectionMetrics.overallCompletion >= 75 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}>
                    {sectionMetrics.overallCompletion}%
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">Overall Completion</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-1.5">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-bold">{sectionMetrics.totalFolders}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Folders</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-bold">{sectionMetrics.totalMandatoryDocuments}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Mandatory</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1.5">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-bold">{sectionMetrics.totalUploaded}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Uploaded</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-bold">{sectionMetrics.totalPending}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search folders, documents, or frameworks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{sectionMetrics.totalUploaded} uploaded</span>
          <AlertTriangle className="h-4 w-4 text-amber-500 ml-2" />
          <span>{sectionMetrics.totalPending} pending</span>
        </div>
      </div>

      {/* Folder Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFolders.map(folder => {
          const metrics = calculateFolderMetrics(folder);
          return (
            <FolderCard
              key={folder.id}
              folder={folder}
              metrics={metrics}
              onClick={() => setSelectedFolder(folder)}
            />
          );
        })}
      </div>

      {filteredFolders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <h3 className="text-lg font-medium text-muted-foreground">No folders found</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {searchQuery ? 'Try a different search term' : 'No folders are configured for this section'}
          </p>
        </div>
      )}

      {/* Completion Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
        <span className="flex items-center gap-1">{getCompletionEmoji(100)} Complete (100%)</span>
        <span className="flex items-center gap-1">{getCompletionEmoji(80)} In Progress (75-99%)</span>
        <span className="flex items-center gap-1">{getCompletionEmoji(60)} Needs Attention (50-74%)</span>
        <span className="flex items-center gap-1">{getCompletionEmoji(30)} Critical (&lt;50%)</span>
      </div>
    </div>
  );
}
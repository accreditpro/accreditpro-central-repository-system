import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  FolderOpen,
  FileText,
  Upload,
  CheckCircle2,
  ArrowLeft,
  Building2,
  GraduationCap,
  FolderClosed,
  AlertCircle,
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

  const filterOptions: { label: string; value: FilterType }[] = [
    { label: 'All Documents', value: 'all' },
    { label: 'Mandatory Only', value: 'mandatory' },
    { label: 'Optional Only', value: 'optional' },
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
        <div className="flex items-center justify-between px-4 py-3 bg-muted/10 rounded-lg border border-border/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shrink-0">
              <FolderOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate">{selectedFolder.name}</h2>
              {selectedFolder.description && (
                <p className="text-[10px] text-muted-foreground truncate">{selectedFolder.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs shrink-0">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Req:</span>
              <span className="font-semibold">{calculateFolderMetrics(selectedFolder).requiredDocuments}</span>
            </div>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Up:</span>
              <span className="font-semibold">{calculateFolderMetrics(selectedFolder).uploadedDocuments}</span>
            </div>
            <Separator orientation="vertical" className="h-5" />
            <span className={cn(
              'text-sm font-bold',
              calculateFolderMetrics(selectedFolder).completionPercentage >= 100 ? 'text-emerald-600' :
              calculateFolderMetrics(selectedFolder).completionPercentage >= 75 ? 'text-amber-600' : 'text-red-600'
            )}>
              {calculateFolderMetrics(selectedFolder).completionPercentage}%
            </span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterType)}>
            <SelectTrigger className="h-9 text-xs w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((f) => (
                <SelectItem key={f.value} value={f.value} className="text-xs">
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {/* Section Summary Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/10 rounded-lg border border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <FolderClosed className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">{section.name}</h2>
            <p className="text-[10px] text-muted-foreground">
              {sectionMetrics.totalFolders} folders · {sectionMetrics.totalMandatoryDocuments} mandatory · {sectionMetrics.totalUploaded} uploaded
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>{sectionMetrics.totalUploaded} uploaded</span>
          </div>
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            <span>{sectionMetrics.totalPending} pending</span>
          </div>
          <Separator orientation="vertical" className="h-5" />
          <div className="text-right">
            <span className={cn(
              'text-sm font-bold',
              sectionMetrics.overallCompletion >= 100 ? 'text-emerald-600' : sectionMetrics.overallCompletion >= 75 ? 'text-amber-600' : 'text-red-600'
            )}>
              {sectionMetrics.overallCompletion}%
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search folders or documents..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
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


    </div>
  );
}
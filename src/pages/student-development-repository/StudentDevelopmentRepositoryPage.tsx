import { useState, useMemo, cloneElement, isValidElement } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LayoutDashboard,
  Heart,
  Shield,
  Trophy,
  Music,
  HandHeart,
  Users,
  Layers,
  BookMarked,
  Award,
  Medal,
  Calendar,
  FileText,
  Search,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReadOnly } from '@/hooks/useReadOnly';
import { studentDevTabConfigs } from './student-development-configs';
import { StudentDevelopmentDashboard } from './components/StudentDevelopmentDashboard';
import { StudentDevelopmentDocumentsView } from './components/StudentDevelopmentDocumentsView';
import { TPOSectionView } from '@/pages/tpo-repository/components/TPOSectionView';
import { TPOEvidence, TPOEvidenceSectionConfig } from '@/pages/tpo-repository/components/TPOEvidenceDialog';
import {
  NSS_EVIDENCE_SECTIONS,
  NCC_EVIDENCE_SECTIONS,
  SPORTS_EVIDENCE_SECTIONS,
  CULTURAL_EVIDENCE_SECTIONS,
  EVENTS_EVIDENCE_SECTIONS,
  STUDENT_ACHIEVEMENTS_EVIDENCE_SECTIONS,
  EXTENSION_ACTIVITIES_EVIDENCE_SECTIONS,
  COMMUNITY_OUTREACH_EVIDENCE_SECTIONS,
  CLUBS_EVIDENCE_SECTIONS,
  STUDENT_CHAPTERS_EVIDENCE_SECTIONS,
  STUDENT_AWARDS_EVIDENCE_SECTIONS,
} from '@/pages/tpo-repository/components/TPOEvidenceDialog';

type ViewType = 'dashboard' | 'documents' | string;

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'nss', label: 'NSS', icon: <Heart className="h-4 w-4" /> },
  { id: 'ncc', label: 'NCC', icon: <Shield className="h-4 w-4" /> },
  { id: 'sports-activities', label: 'Sports Activities', icon: <Trophy className="h-4 w-4" /> },
  { id: 'cultural-activities', label: 'Cultural Activities', icon: <Music className="h-4 w-4" /> },
  { id: 'extension-activities', label: 'Extension Activities', icon: <HandHeart className="h-4 w-4" /> },
  { id: 'community-outreach', label: 'Community Outreach', icon: <Users className="h-4 w-4" /> },
  { id: 'clubs', label: 'Clubs & Societies', icon: <Layers className="h-4 w-4" /> },
  { id: 'student-chapters', label: 'Student Chapters', icon: <BookMarked className="h-4 w-4" /> },
  { id: 'student-achievements', label: 'Student Achievements', icon: <Award className="h-4 w-4" /> },
  { id: 'student-awards', label: 'Student Awards', icon: <Medal className="h-4 w-4" /> },
  { id: 'events', label: 'Events', icon: <Calendar className="h-4 w-4" /> },
  { id: 'documents', label: 'Supporting Documents', icon: <FileText className="h-4 w-4" /> },
];

export default function StudentDevelopmentRepositoryPage() {
  const isReadOnly = useReadOnly();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, string | number> | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [tableData, setTableData] = useState<Record<string, Record<string, string | number>[]>>(() => {
    const initial: Record<string, Record<string, string | number>[]> = {};
    studentDevTabConfigs.forEach(tab => {
      initial[tab.id] = [...tab.sampleData];
    });
    return initial;
  });

  const activeTabConfig = useMemo(() => {
    return studentDevTabConfigs.find(t => t.id === activeView);
  }, [activeView]);

  const currentData = useMemo(() => {
    if (!activeTabConfig) return [];
    const data = tableData[activeView] || [];
    if (!searchQuery) return data;
    return data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [activeTabConfig, tableData, activeView, searchQuery]);

  const handleAddNew = () => {
    if (!activeTabConfig) return;
    const emptyRow: Record<string, string | number> = {};
    activeTabConfig.fields.forEach(f => { emptyRow[f.key] = ''; });
    setEditingRow(emptyRow);
    setIsNewRecord(true);
    setEditDialogOpen(true);
  };

  const handleEdit = (row: Record<string, string | number>) => {
    setEditingRow({ ...row });
    setIsNewRecord(false);
    setEditDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    setTableData(prev => ({
      ...prev,
      [activeView]: prev[activeView].filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    if (!editingRow) return;
    setTableData(prev => {
      const updated = { ...prev };
      if (isNewRecord) {
        updated[activeView] = [...(updated[activeView] || []), editingRow];
      } else {
        const idx = updated[activeView].findIndex(r =>
          Object.keys(r).every(k => r[k] === tableData[activeView].find(orig => orig === r)?.[k])
        );
        if (idx >= 0) {
          updated[activeView] = [...updated[activeView]];
          updated[activeView][idx] = editingRow;
        }
      }
      return updated;
    });
    setEditDialogOpen(false);
    setEditingRow(null);
  };

  const handleDataChange = (data: Record<string, string | number>[]) => {
    setTableData(prev => ({ ...prev, [activeView]: data }));
  };

  // ============ Evidence State Management ============
  const [evidenceData, setEvidenceData] = useState<
    Record<string, Record<string, TPOEvidence | null>>
  >({});

  const handleRecordEvidenceChange = (sectionId: string) => (recordId: string, evidence: TPOEvidence | null) => {
    setEvidenceData(prev => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [recordId]: evidence,
      },
    }));
  };

  /**
   * Maps section IDs to their evidence section configs for use in the
   * consolidated Supporting Documents view.
   */
  const evidenceSectionConfigMap: Record<string, TPOEvidenceSectionConfig[]> = {
    nss: NSS_EVIDENCE_SECTIONS,
    ncc: NCC_EVIDENCE_SECTIONS,
    'sports-activities': SPORTS_EVIDENCE_SECTIONS,
    'cultural-activities': CULTURAL_EVIDENCE_SECTIONS,
    events: EVENTS_EVIDENCE_SECTIONS,
    'student-achievements': STUDENT_ACHIEVEMENTS_EVIDENCE_SECTIONS,
    'extension-activities': EXTENSION_ACTIVITIES_EVIDENCE_SECTIONS,
    'community-outreach': COMMUNITY_OUTREACH_EVIDENCE_SECTIONS,
    clubs: CLUBS_EVIDENCE_SECTIONS,
    'student-chapters': STUDENT_CHAPTERS_EVIDENCE_SECTIONS,
    'student-awards': STUDENT_AWARDS_EVIDENCE_SECTIONS,
  };

  /**
   * Maps section IDs to their human-readable labels.
   */
  const sectionLabelMap: Record<string, string> = Object.fromEntries(
    studentDevTabConfigs.map(t => [t.id, t.label])
  );

  const renderContent = () => {
    if (activeView === 'dashboard') return <StudentDevelopmentDashboard />;
    if (activeView === 'documents') {
      return (
        <StudentDevelopmentDocumentsView
          evidenceData={evidenceData}
          sectionEvidenceConfigs={evidenceSectionConfigMap}
          sectionLabels={sectionLabelMap}
          onRemoveEvidenceFile={(sectionId, recordId, sectionConfigId, fileId) => {
            const sectionEvidence = evidenceData[sectionId];
            if (!sectionEvidence || !sectionEvidence[recordId]) return;
            const evidence = sectionEvidence[recordId];
            const updatedSections = { ...evidence!.sections };
            const files = updatedSections[sectionConfigId]?.filter(f => f.id !== fileId) || [];
            updatedSections[sectionConfigId] = files;
            const updatedEvidence: TPOEvidence = {
              recordId,
              sections: updatedSections,
            };
            setEvidenceData(prev => ({
              ...prev,
              [sectionId]: {
                ...(prev[sectionId] || {}),
                [recordId]: updatedEvidence,
              },
            }));
          }}
        />
      );
    }

    if (!activeTabConfig) return null;

    if (activeView === 'nss' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          initialData={tableData['nss'] || []}
          onDataChange={handleDataChange}
          getRecordTitle={(row) => String(row.nssUnitNumber || 'NSS Unit')}
          getRecordId={(_, index) => `nss-${index}`}
          evidenceSectionConfigs={NSS_EVIDENCE_SECTIONS}
          initialEvidenceMap={evidenceData['nss']}
          onRecordEvidenceChange={handleRecordEvidenceChange('nss')}
        />
      );
    }

    if (activeView === 'ncc' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          initialData={tableData['ncc'] || []}
          onDataChange={handleDataChange}
          getRecordTitle={(row) => String(row.nccUnit || 'NCC Unit')}
          getRecordId={(_, index) => `ncc-${index}`}
          evidenceSectionConfigs={NCC_EVIDENCE_SECTIONS}
          initialEvidenceMap={evidenceData['ncc']}
          onRecordEvidenceChange={handleRecordEvidenceChange('ncc')}
        />
      );
    }

    if (activeView === 'sports-activities' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          initialData={tableData['sports-activities'] || []}
          onDataChange={handleDataChange}
          getRecordTitle={(row) => String(row.event || row.sport || 'Sports Event')}
          getRecordId={(_, index) => `sports-${index}`}
          evidenceSectionConfigs={SPORTS_EVIDENCE_SECTIONS}
          initialEvidenceMap={evidenceData['sports-activities']}
          onRecordEvidenceChange={handleRecordEvidenceChange('sports-activities')}
        />
      );
    }

    if (activeView === 'cultural-activities' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          initialData={tableData['cultural-activities'] || []}
          onDataChange={handleDataChange}
          getRecordTitle={(row) => String(row.eventName || 'Cultural Event')}
          getRecordId={(_, index) => `cultural-${index}`}
          evidenceSectionConfigs={CULTURAL_EVIDENCE_SECTIONS}
          initialEvidenceMap={evidenceData['cultural-activities']}
          onRecordEvidenceChange={handleRecordEvidenceChange('cultural-activities')}
        />
      );
    }

    if (activeView === 'events' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          initialData={tableData['events'] || []}
          onDataChange={handleDataChange}
          getRecordTitle={(row) => String(row.eventName || 'Event')}
          getRecordId={(_, index) => `events-${index}`}
          evidenceSectionConfigs={EVENTS_EVIDENCE_SECTIONS}
          initialEvidenceMap={evidenceData['events']}
          onRecordEvidenceChange={handleRecordEvidenceChange('events')}
        />
      );
    }

    if (activeView === 'student-achievements' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          initialData={tableData['student-achievements'] || []}
          onDataChange={handleDataChange}
          getRecordTitle={(row) => String(row.studentName || row.achievement || 'Achievement')}
          getRecordId={(_, index) => `achievement-${index}`}
          evidenceSectionConfigs={STUDENT_ACHIEVEMENTS_EVIDENCE_SECTIONS}
          initialEvidenceMap={evidenceData['student-achievements']}
          onRecordEvidenceChange={handleRecordEvidenceChange('student-achievements')}
        />
      );
    }

    if (activeView === 'extension-activities' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          initialData={tableData['extension-activities'] || []}
          onDataChange={handleDataChange}
          getRecordTitle={(row) => String(row.activity || 'Extension Activity')}
          getRecordId={(_, index) => `extension-${index}`}
          evidenceSectionConfigs={EXTENSION_ACTIVITIES_EVIDENCE_SECTIONS}
          initialEvidenceMap={evidenceData['extension-activities']}
          onRecordEvidenceChange={handleRecordEvidenceChange('extension-activities')}
        />
      );
    }

    if (activeView === 'community-outreach' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          initialData={tableData['community-outreach'] || []}
          onDataChange={handleDataChange}
          getRecordTitle={(row) => String(row.programName || 'Outreach Program')}
          getRecordId={(_, index) => `outreach-${index}`}
          evidenceSectionConfigs={COMMUNITY_OUTREACH_EVIDENCE_SECTIONS}
          initialEvidenceMap={evidenceData['community-outreach']}
          onRecordEvidenceChange={handleRecordEvidenceChange('community-outreach')}
        />
      );
    }

    if (activeView === 'clubs' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          initialData={tableData['clubs'] || []}
          onDataChange={handleDataChange}
          getRecordTitle={(row) => String(row.clubName || 'Club/Society')}
          getRecordId={(_, index) => `club-${index}`}
          evidenceSectionConfigs={CLUBS_EVIDENCE_SECTIONS}
          initialEvidenceMap={evidenceData['clubs']}
          onRecordEvidenceChange={handleRecordEvidenceChange('clubs')}
        />
      );
    }

    if (activeView === 'student-chapters' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          initialData={tableData['student-chapters'] || []}
          onDataChange={handleDataChange}
          getRecordTitle={(row) => String(row.chapterName || 'Student Chapter')}
          getRecordId={(_, index) => `chapter-${index}`}
          evidenceSectionConfigs={STUDENT_CHAPTERS_EVIDENCE_SECTIONS}
          initialEvidenceMap={evidenceData['student-chapters']}
          onRecordEvidenceChange={handleRecordEvidenceChange('student-chapters')}
        />
      );
    }

    if (activeView === 'student-awards' && activeTabConfig) {
      return (
        <TPOSectionView
          tabConfig={activeTabConfig}
          initialData={tableData['student-awards'] || []}
          onDataChange={handleDataChange}
          getRecordTitle={(row) => String(row.awardName || row.recipientName || 'Award')}
          getRecordId={(_, index) => `award-${index}`}
          evidenceSectionConfigs={STUDENT_AWARDS_EVIDENCE_SECTIONS}
          initialEvidenceMap={evidenceData['student-awards']}
          onRecordEvidenceChange={handleRecordEvidenceChange('student-awards')}
        />
      );
    }

    // All other tabs use the generic table view (unchanged)

    const visibleFields = activeTabConfig.fields.slice(0, 7);

    return (
      <div className="space-y-4">
        {/* Tab Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{activeTabConfig.label}</h3>
            <p className="text-sm text-muted-foreground">{activeTabConfig.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            {!isReadOnly && (
              <>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  CSV Upload
                </Button>
                <Button size="sm" className="gap-2" onClick={handleAddNew}>
                  <Plus className="h-4 w-4" />
                  Add Record
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTabConfig.label.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{activeTabConfig.label} Records</CardTitle>
              <Badge variant="secondary">{currentData.length} records</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {visibleFields.map(field => (
                      <TableHead key={field.key} className="whitespace-nowrap text-xs">
                        {field.label}
                      </TableHead>
                    ))}
                    <TableHead className="text-right text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={visibleFields.length + 1} className="text-center py-8 text-muted-foreground">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentData.map((row, idx) => (
                      <TableRow key={idx}>
                        {visibleFields.map(field => (
                          <TableCell key={field.key} className="text-sm whitespace-nowrap max-w-[200px] truncate">
                            {field.type === 'currency'
                              ? `₹${Number(row[field.key]).toLocaleString('en-IN')}`
                              : field.type === 'percentage'
                              ? `${row[field.key]}%`
                              : String(row[field.key] || '-')}
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isReadOnly ? (
                              <span className="text-[10px] text-muted-foreground italic">Read-only</span>
                            ) : (
                              <>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(row)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(idx)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit/Add Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isNewRecord ? 'Add New Record' : 'Edit Record'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {activeTabConfig.fields.map(field => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {field.label}
                    {field.required && <span className="text-destructive ml-0.5">*</span>}
                  </Label>
                  {field.type === 'select' ? (
                    <Select
                      value={String(editingRow?.[field.key] || '')}
                      onValueChange={(val) => setEditingRow(prev => prev ? { ...prev, [field.key]: val } : null)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={field.type === 'number' || field.type === 'currency' || field.type === 'percentage' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                      value={String(editingRow?.[field.key] || '')}
                      onChange={(e) => setEditingRow(prev => prev ? { ...prev, [field.key]: field.type === 'number' || field.type === 'currency' || field.type === 'percentage' ? Number(e.target.value) : e.target.value } : null)}
                      placeholder={field.placeholder || `Enter ${field.label}`}
                      className="h-9"
                    />
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{isNewRecord ? 'Add Record' : 'Save Changes'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className={`border-r bg-card transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-14' : 'w-64'}`}>
        <div className="flex items-center justify-between p-3 border-b">
          {!sidebarCollapsed && <span className="text-sm font-semibold text-primary">Student Development</span>}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-2 h-9 rounded-lg transition-all',
                  sidebarCollapsed && 'px-2 justify-center',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                )}
                onClick={() => { setActiveView(item.id); setSearchQuery(''); }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {isActive && isValidElement(item.icon)
                  ? cloneElement(item.icon, { className: 'h-4 w-4 text-primary' })
                  : item.icon}
                {!sidebarCollapsed && <span className="text-sm truncate">{item.label}</span>}
              </Button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </main>
    </div>
  );
}
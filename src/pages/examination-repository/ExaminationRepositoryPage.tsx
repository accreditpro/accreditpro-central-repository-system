import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
  Calendar,
  ClipboardList,
  FileEdit,
  BookOpen,
  Users,
  BarChart3,
  GraduationCap,
  AlertTriangle,
  Trophy,
  Target,
  PieChart,
  LayoutDashboard,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Download,
  Upload,
  Edit,
  Trash2,
  Bookmark,
} from 'lucide-react';
import { examTabConfigs, ExamTabConfig } from './examination-configs';
import { ExaminationDashboard } from './components/ExaminationDashboard';
import { ExaminationDocumentsView } from './components/ExaminationDocumentsView';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar,
  ClipboardList,
  FileEdit,
  BookOpen,
  Users,
  BarChart3,
  GraduationCap,
  AlertTriangle,
  Trophy,
  Target,
  PieChart,
};

type ViewType = 'dashboard' | 'repository' | 'documents' | 'mission-vision';

export function ExaminationRepositoryPage() {
  const [activeTab, setActiveTab] = useState<string>(examTabConfigs[0].id);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, string | number> | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [tableData, setTableData] = useState<Record<string, Record<string, string | number>[]>>(
    () => {
      const initial: Record<string, Record<string, string | number>[]> = {};
      examTabConfigs.forEach(tab => {
        initial[tab.id] = [...tab.sampleData];
      });
      return initial;
    }
  );

  const activeTabConfig = examTabConfigs.find(t => t.id === activeTab);
  const currentData = tableData[activeTab] || [];

  const filteredData = currentData.filter(row =>
    Object.values(row).some(val => String(val).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (row: Record<string, string | number>, index: number) => {
    setEditingRow({ ...row });
    setEditingIndex(index);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingRow && editingIndex >= 0) {
      setTableData(prev => {
        const updated = { ...prev };
        const rows = [...(updated[activeTab] || [])];
        rows[editingIndex] = editingRow;
        updated[activeTab] = rows;
        return updated;
      });
    }
    setEditDialogOpen(false);
    setEditingRow(null);
    setEditingIndex(-1);
  };

  const handleDelete = (index: number) => {
    setTableData(prev => {
      const updated = { ...prev };
      const rows = [...(updated[activeTab] || [])];
      rows.splice(index, 1);
      updated[activeTab] = rows;
      return updated;
    });
  };

  const handleAddNew = () => {
    if (!activeTabConfig) return;
    const newRow: Record<string, string | number> = {};
    activeTabConfig.fields.forEach(field => {
      newRow[field.key] = '';
    });
    setEditingRow(newRow);
    setEditingIndex(-1);
    setEditDialogOpen(true);
  };

  const handleSaveNew = () => {
    if (editingRow && editingIndex === -1) {
      setTableData(prev => {
        const updated = { ...prev };
        const rows = [...(updated[activeTab] || [])];
        rows.push(editingRow);
        updated[activeTab] = rows;
        return updated;
      });
    }
    setEditDialogOpen(false);
    setEditingRow(null);
    setEditingIndex(-1);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' as ViewType },
    {
      id: 'mission-vision',
      label: 'Mission & Vision',
      icon: Bookmark,
      view: 'mission-vision' as ViewType,
    },
    ...examTabConfigs.map(tab => ({
      id: tab.id,
      label: tab.label,
      icon: iconMap[tab.icon] || FileText,
      view: 'repository' as ViewType,
    })),
    {
      id: 'documents',
      label: 'Supporting Documents',
      icon: FileText,
      view: 'documents' as ViewType,
    },
  ];

  const handleSidebarClick = (item: (typeof sidebarItems)[0]) => {
    if (item.view === 'dashboard' || item.view === 'documents' || item.view === 'mission-vision') {
      setActiveView(item.view);
    } else {
      setActiveView('repository');
      setActiveTab(item.id);
    }
  };

  const renderMissionVision = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Examination Cell - Mission & Vision</h2>
        <p className="text-muted-foreground">Guiding principles of the Examination Cell</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg border bg-card">
          <h3 className="text-lg font-semibold mb-3 text-primary">Vision</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To establish a transparent, efficient, and technology-driven examination system that
            ensures fair evaluation, timely results, and continuous improvement in academic
            standards aligned with national accreditation frameworks.
          </p>
        </div>
        <div className="p-6 rounded-lg border bg-card">
          <h3 className="text-lg font-semibold mb-3 text-primary">Mission</h3>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside leading-relaxed">
            <li>Conduct examinations with utmost integrity and confidentiality</li>
            <li>Ensure timely publication of results with accuracy</li>
            <li>Maintain comprehensive examination records for accreditation readiness</li>
            <li>Implement outcome-based assessment aligned with CO-PO mapping</li>
            <li>Provide data-driven insights for continuous academic improvement</li>
          </ul>
        </div>
      </div>
      <div className="p-6 rounded-lg border bg-card">
        <h3 className="text-lg font-semibold mb-3 text-primary">Core Objectives</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-md bg-muted/50">
            <h4 className="font-medium text-sm mb-1">Academic Integrity</h4>
            <p className="text-xs text-muted-foreground">
              Zero tolerance for malpractice with robust invigilation and monitoring
            </p>
          </div>
          <div className="p-4 rounded-md bg-muted/50">
            <h4 className="font-medium text-sm mb-1">Timely Results</h4>
            <p className="text-xs text-muted-foreground">
              Results published within 15 days of exam completion
            </p>
          </div>
          <div className="p-4 rounded-md bg-muted/50">
            <h4 className="font-medium text-sm mb-1">OBE Alignment</h4>
            <p className="text-xs text-muted-foreground">
              All assessments mapped to Course Outcomes for attainment calculation
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeView === 'dashboard') return <ExaminationDashboard />;
    if (activeView === 'documents') return <ExaminationDocumentsView />;
    if (activeView === 'mission-vision') return renderMissionVision();

    if (!activeTabConfig) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{activeTabConfig.label}</h2>
            <p className="text-sm text-muted-foreground">{activeTabConfig.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Upload className="h-3.5 w-3.5" />
              Import CSV
            </Button>
            <Button size="sm" className="gap-1" onClick={handleAddNew}>
              <Plus className="h-3.5 w-3.5" />
              Add Record
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Badge variant="secondary">{filteredData.length} records</Badge>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  {activeTabConfig.fields.slice(0, 8).map(field => (
                    <TableHead key={field.key} className="whitespace-nowrap text-xs">
                      {field.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={Math.min(activeTabConfig.fields.length, 8) + 1}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((row, idx) => (
                    <TableRow key={idx}>
                      {activeTabConfig.fields.slice(0, 8).map(field => (
                        <TableCell
                          key={field.key}
                          className="text-xs whitespace-nowrap max-w-[200px] truncate"
                        >
                          {field.type === 'percentage'
                            ? `${row[field.key]}%`
                            : field.type === 'currency'
                              ? `₹${Number(row[field.key]).toLocaleString()}`
                              : String(row[field.key] || '-')}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleEdit(row, idx)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDelete(idx)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div
        className={`border-r bg-card transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? 'w-14' : 'w-64'
        }`}
      >
        <div className="p-3 flex items-center justify-between border-b">
          {!sidebarCollapsed && (
            <span className="text-sm font-semibold truncate">Exam Repository</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {sidebarItems.map(item => {
              const isActive =
                (item.view === 'dashboard' && activeView === 'dashboard') ||
                (item.view === 'documents' && activeView === 'documents') ||
                (item.view === 'mission-vision' && activeView === 'mission-vision') ||
                (item.view === 'repository' &&
                  activeView === 'repository' &&
                  activeTab === item.id);

              const Icon = item.icon;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={`w-full justify-start gap-2 h-9 text-xs ${
                    sidebarCollapsed ? 'px-2 justify-center' : ''
                  }`}
                  onClick={() => handleSidebarClick(item)}
                  title={item.label}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">{renderContent()}</div>

      {/* Edit/Add Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndex === -1 ? 'Add New Record' : 'Edit Record'} - {activeTabConfig?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {activeTabConfig?.fields.map(field => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs">
                  {field.label}
                  {field.required && <span className="text-destructive ml-0.5">*</span>}
                </Label>
                {field.type === 'select' ? (
                  <Select
                    value={String(editingRow?.[field.key] || '')}
                    onValueChange={val =>
                      setEditingRow(prev => (prev ? { ...prev, [field.key]: val } : prev))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map(opt => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={
                      field.type === 'number' ||
                      field.type === 'currency' ||
                      field.type === 'percentage'
                        ? 'number'
                        : field.type === 'date'
                          ? 'date'
                          : 'text'
                    }
                    value={String(editingRow?.[field.key] || '')}
                    onChange={e =>
                      setEditingRow(prev =>
                        prev
                          ? {
                              ...prev,
                              [field.key]:
                                field.type === 'number' ||
                                field.type === 'currency' ||
                                field.type === 'percentage'
                                  ? Number(e.target.value)
                                  : e.target.value,
                            }
                          : prev
                      )
                    }
                    placeholder={field.placeholder || field.label}
                    className="h-8 text-xs"
                  />
                )}
              </div>
            ))}
          </div>
          <Separator />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={editingIndex === -1 ? handleSaveNew : handleSaveEdit}>
              {editingIndex === -1 ? 'Add Record' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

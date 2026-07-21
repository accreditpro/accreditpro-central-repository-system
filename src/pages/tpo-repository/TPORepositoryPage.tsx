import { useState, useMemo } from 'react';
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
  Building2,
  Briefcase,
  UserCheck,
  BookOpen,
  Rocket,
  Presentation,
  BarChart3,
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
import { tpoTabConfigs } from './tpo-configs';
import { TPODashboard } from './components/TPODashboard';
import { TPODocumentsView } from './components/TPODocumentsView';

type ViewType = 'dashboard' | 'documents' | string;

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'recruiters', label: 'Recruiters', icon: <Building2 className="h-4 w-4" /> },
  { id: 'placement-offers', label: 'Placement Offers', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'internships', label: 'Internships', icon: <UserCheck className="h-4 w-4" /> },
  { id: 'higher-education', label: 'Higher Education', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'entrepreneurship-startups', label: 'Entrepreneurship & Startups', icon: <Rocket className="h-4 w-4" /> },
  { id: 'training-activities', label: 'Training Activities', icon: <Presentation className="h-4 w-4" /> },
  { id: 'placement-statistics', label: 'Placement Statistics', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'documents', label: 'Supporting Documents', icon: <FileText className="h-4 w-4" /> },
];

export default function TPORepositoryPage() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, string | number> | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [tableData, setTableData] = useState<Record<string, Record<string, string | number>[]>>(() => {
    const initial: Record<string, Record<string, string | number>[]> = {};
    tpoTabConfigs.forEach(tab => {
      initial[tab.id] = [...tab.sampleData];
    });
    return initial;
  });

  const activeTabConfig = useMemo(() => {
    return tpoTabConfigs.find(t => t.id === activeView);
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

  const renderContent = () => {
    if (activeView === 'dashboard') return <TPODashboard />;
    if (activeView === 'documents') return <TPODocumentsView />;

    if (!activeTabConfig) return null;

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
              <Upload className="h-4 w-4" />
              CSV Upload
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="gap-2" onClick={handleAddNew}>
              <Plus className="h-4 w-4" />
              Add Record
            </Button>
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
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(row)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(idx)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
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
      <aside className={`border-r bg-card transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-14' : 'w-60'}`}>
        <div className="flex items-center justify-between p-3 border-b">
          {!sidebarCollapsed && <span className="text-sm font-semibold text-primary">TPO Repository</span>}
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
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-2 h-9 ${sidebarCollapsed ? 'px-2 justify-center' : ''} ${activeView === item.id ? 'bg-primary/10 text-primary font-medium' : ''}`}
              onClick={() => { setActiveView(item.id); setSearchQuery(''); }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!sidebarCollapsed && <span className="text-sm truncate">{item.label}</span>}
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </main>
    </div>
  );
}
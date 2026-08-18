import { useState, useMemo, useCallback, useEffect, useRef, cloneElement, isValidElement } from 'react';
import { cn } from '@/lib/utils';
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
  PieChart,
  TrendingUp,
  Receipt,
  FlaskConical,
  GraduationCap,
  Heart,
  FileCheck,
  Landmark,
  FileText,
  Search,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { financeTabConfigs } from './finance-configs';
import { FinanceDashboard } from './components/FinanceDashboard';
import { FinanceDocumentsView } from './components/FinanceDocumentsView';
import { FinanceCsvUploadDialog } from './components/FinanceCsvUploadDialog';
import { useReadOnly } from '@/hooks/useReadOnly';
import {
  financeRepositoryService,
  FinanceSectionRecord,
} from '@/services/finance-repository.service';

type ViewType = 'dashboard' | 'documents' | string;

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'budget-allocation', label: 'Budget Allocation', icon: <PieChart className="h-4 w-4" /> },
  { id: 'income-revenue', label: 'Income & Revenue', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'expenditure', label: 'Expenditure', icon: <Receipt className="h-4 w-4" /> },
  { id: 'research-funding', label: 'Research Funding', icon: <FlaskConical className="h-4 w-4" /> },
  { id: 'scholarships', label: 'Scholarships', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'endowments-donations', label: 'Endowments & Donations', icon: <Heart className="h-4 w-4" /> },
  { id: 'audit-reports', label: 'Audit Reports', icon: <FileCheck className="h-4 w-4" /> },
  { id: 'financial-assets', label: 'Financial Assets', icon: <Landmark className="h-4 w-4" /> },
  { id: 'documents', label: 'Supporting Documents', icon: <FileText className="h-4 w-4" /> },
];

const PAGE_SIZE = 10;

export default function FinanceRepositoryPage() {
  const isReadOnly = useReadOnly();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, string | number> | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);

  // ---- live (backend) state ----
  const [records, setRecords] = useState<FinanceSectionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // Debounced value actually sent to the server; searchQuery is the live input.
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimer = useRef<number | undefined>(undefined);

  const activeTabConfig = useMemo(() => {
    return financeTabConfigs.find(t => t.id === activeView);
  }, [activeView]);

  const fetchRecords = useCallback(async (tabId: string, query: string, pageNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await financeRepositoryService.getSectionRecords(tabId, {
        search: query || undefined,
        page: pageNumber,
        size: PAGE_SIZE,
      });
      setRecords(res.content || []);
      setTotalElements(res.totalElements || 0);
      setTotalPages(res.totalPages || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load records');
      setRecords([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch whenever the active tab, debounced search or page changes.
  useEffect(() => {
    if (!activeTabConfig) return;
    fetchRecords(activeTabConfig.id, debouncedSearch, page);
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [activeTabConfig, debouncedSearch, page, fetchRecords]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setDebouncedSearch(value);
      setPage(0);
    }, 400);
  };

  const handleAddNew = () => {
    if (!activeTabConfig) return;
    const emptyRow: Record<string, string | number> = {};
    activeTabConfig.fields.forEach(f => { emptyRow[f.key] = ''; });
    setEditingRow(emptyRow);
    setIsNewRecord(true);
    setEditDialogOpen(true);
  };

  const handleEdit = (row: FinanceSectionRecord) => {
    const editable: Record<string, string | number> = { id: Number(row.id) };
    activeTabConfig?.fields.forEach(f => {
      const value = row[f.key];
      editable[f.key] = typeof value === 'number' ? value : String(value ?? '');
    });
    setEditingRow(editable);
    setIsNewRecord(false);
    setEditDialogOpen(true);
  };

  const handleDelete = async (row: FinanceSectionRecord) => {
    if (!activeTabConfig) return;
    setError(null);
    try {
      await financeRepositoryService.deleteSectionRecord(activeTabConfig.id, Number(row.id));
      // If the page becomes empty, step back one page (the fetch effect re-runs
      // on the page change); otherwise refetch the current page directly.
      const remaining = records.length - 1;
      if (remaining === 0 && page > 0) {
        setPage(page - 1);
      } else {
        fetchRecords(activeTabConfig.id, debouncedSearch, page);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete record');
    }
  };

  const handleSave = async () => {
    if (!editingRow || !activeTabConfig) return;
    setSaving(true);
    setError(null);
    try {
      // Send only the tab's fields; id / workflowStatus are server-controlled.
      // On edit, a cleared field is sent as null so the backend removes it.
      const payload: Record<string, string | number | null> = {};
      activeTabConfig.fields.forEach(f => {
        const value = editingRow[f.key];
        if (value === undefined) return;
        if (value === '') {
          if (!isNewRecord) payload[f.key] = null;
        } else {
          payload[f.key] = value;
        }
      });
      if (isNewRecord) {
        await financeRepositoryService.createSectionRecord(activeTabConfig.id, payload);
      } else {
        await financeRepositoryService.updateSectionRecord(activeTabConfig.id, Number(editingRow.id), payload);
      }
      setEditDialogOpen(false);
      setEditingRow(null);
      fetchRecords(activeTabConfig.id, searchQuery, page);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  const handleExportTemplate = () => {
    if (!activeTabConfig) return;
    financeRepositoryService.downloadSectionTemplate(activeTabConfig.id).catch(() => {
      setError('Failed to download CSV template');
    });
  };

  const renderContent = () => {
    if (activeView === 'dashboard') return <FinanceDashboard />;
    if (activeView === 'documents') return <FinanceDocumentsView />;

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
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportTemplate}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            {!isReadOnly && (
              <>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setCsvDialogOpen(true)}>
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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Data Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{activeTabConfig.label} Records</CardTitle>
              <Badge variant="secondary">{loading ? '...' : totalElements} records</Badge>
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={visibleFields.length + 1} className="text-center py-8 text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Loading records...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={visibleFields.length + 1} className="text-center py-8 text-muted-foreground">
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((row) => (
                      <TableRow key={row.id}>
                        {visibleFields.map(field => (
                          <TableCell key={field.key} className="text-sm whitespace-nowrap max-w-[200px] truncate">
                            {field.type === 'currency'
                              ? `₹${Number(row[field.key]).toLocaleString('en-IN')}`
                              : field.type === 'percentage'
                              ? `${row[field.key]}%`
                              : String(row[field.key] ?? '-')}
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
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(row)}>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-xs text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={page === 0 || loading}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={page >= totalPages - 1 || loading}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
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
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : isNewRecord ? 'Add Record' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* CSV Upload Dialog */}
        {activeTabConfig && (
          <FinanceCsvUploadDialog
            open={csvDialogOpen}
            onClose={() => setCsvDialogOpen(false)}
            tabConfig={activeTabConfig}
            onUploadComplete={() => {
              setPage(0);
              fetchRecords(activeTabConfig.id, searchQuery, 0);
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className={`border-r bg-card transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-14' : 'w-60'}`}>
        <div className="flex items-center justify-between p-3 border-b">
          {!sidebarCollapsed && <span className="text-sm font-semibold text-primary">Finance Repository</span>}
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
                onClick={() => { setActiveView(item.id); setSearchQuery(''); setDebouncedSearch(''); setPage(0); }}
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

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useReadOnly } from '@/hooks/useReadOnly';
import { RepositoryTabConfig, FieldConfig } from '../types';
import {
  getResearchModuleRecords,
  createResearchModuleRecord,
  updateResearchModuleRecord,
  deleteResearchModuleRecord,
  uploadResearchModuleCsv,
} from '@/services/research-repository.service';
import {
  getStudentDevRecords,
  createStudentDevRecord,
  updateStudentDevRecord,
  deleteStudentDevRecord,
  uploadStudentDevCsv,
} from '@/services/student-dev-outcomes.service';
import { masterData, coordinatorContext } from '../repository-configs';
import { CSVUploadDialog } from './CSVUploadDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Download,
  Upload,
  FileText,
  Eye,
  DownloadCloud,
  Pencil,
  Trash2,
  Plus,
  Search,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RepositoryTabContentProps {
  tabConfig: RepositoryTabConfig;
  repositoryId?: string;
  academicYear?: string;
  departmentId?: number;
  departmentName?: string;
}

export const RepositoryTabContent = ({
  tabConfig,
  repositoryId = 'research',
  academicYear = '2025-26',
  departmentId: propDeptId,
  departmentName = 'CSE',
}: RepositoryTabContentProps) => {
  const { user } = useAuth();
  const isReadOnly = useReadOnly();
  const effectiveDeptId = propDeptId || user?.departmentId || 4;

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCsvUploadDialog, setShowCsvUploadDialog] = useState(false);

  // Form states
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  // Evidence list for bottom card (genuine empty state)
  const [evidenceList, setEvidenceList] = useState<any[]>([]);

  // Initialize empty form data from tabConfig.fields
  const getEmptyFormData = useCallback(() => {
    const initial: Record<string, any> = {
      workflowStatus: 'draft',
    };
    tabConfig.fields.forEach((field) => {
      if (field.masterDataSource === 'academicYears' || field.key === 'academicYear') {
        initial[field.key] = academicYear;
      } else if (field.masterDataSource === 'departments') {
        initial[field.key] = departmentName || coordinatorContext.department;
      } else if (field.selectOptions && field.selectOptions.length > 0) {
        initial[field.key] = field.selectOptions[0];
      } else if (field.type === 'date') {
        initial[field.key] = new Date().toISOString().split('T')[0];
      } else if (field.type === 'boolean') {
        initial[field.key] = 'No';
      } else {
        initial[field.key] = '';
      }
    });
    return initial;
  }, [tabConfig.fields, academicYear, departmentName]);

  const isStudentDev = repositoryId === 'student-dev-outcomes';
  const apiFetchRecords = isStudentDev ? getStudentDevRecords : getResearchModuleRecords;
  const apiCreateRecord = isStudentDev ? createStudentDevRecord : createResearchModuleRecord;
  const apiUpdateRecord = isStudentDev ? updateStudentDevRecord : updateResearchModuleRecord;
  const apiDeleteRecord = isStudentDev ? deleteStudentDevRecord : deleteResearchModuleRecord;
  const apiUploadCsv = isStudentDev ? uploadStudentDevCsv : uploadResearchModuleCsv;

  // Fetch records from backend
  const fetchRecords = useCallback(async () => {
    if (!effectiveDeptId) return;
    setLoading(true);
    try {
      const res = await apiFetchRecords(
        tabConfig.id,
        academicYear,
        effectiveDeptId,
        { search: searchQuery || undefined }
      );
      const items = res?.data?.content || res?.content || res?.data || res || [];
      if (Array.isArray(items)) {
        const normalized = items.map((it: any) => {
          const raw = it.recordData || it;
          const rawStatus = it.workflowStatus || raw.workflowStatus || it.status || raw.status || raw['Status'] || 'draft';
          const statusVal = String(rawStatus).toLowerCase();
          const mapped: Record<string, any> = {
            id: it.id ?? raw.id,
            status: statusVal,
            workflowStatus: rawStatus,
            academicYear: it.academicYear || raw.academicYear || academicYear,
            departmentId: it.departmentId || raw.departmentId || effectiveDeptId,
          };
          tabConfig.fields.forEach((field) => {
            mapped[field.key] = raw[field.key] ?? raw[field.csvColumn] ?? '';
          });
          return mapped;
        });
        setRecords(normalized);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.warn(`Error fetching ${tabConfig.label} records:`, err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [apiFetchRecords, tabConfig.id, tabConfig.label, tabConfig.fields, academicYear, effectiveDeptId, searchQuery]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Search filter
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase();
    return records.filter((r) =>
      Object.values(r).some((val) =>
        String(val || '').toLowerCase().includes(q)
      )
    );
  }, [records, searchQuery]);

  // Create record
  const handleOpenAdd = () => {
    setFormData(getEmptyFormData());
    setShowAddDialog(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const field of tabConfig.fields) {
      if (field.required && (!formData[field.key] || String(formData[field.key]).trim() === '')) {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const statusVal = formData.workflowStatus || 'draft';
      const payload: Record<string, any> = {
        ...formData,
        departmentId: effectiveDeptId,
        academicYear: formData.academicYear || academicYear,
        workflowStatus: statusVal,
        status: statusVal,
      };
      // Convert number fields
      tabConfig.fields.forEach((f) => {
        if (f.type === 'number' && payload[f.key]) {
          payload[f.key] = Number(payload[f.key]);
        }
      });

      await apiCreateRecord(tabConfig.id, academicYear, effectiveDeptId, payload);
      toast.success(`${tabConfig.label} record created successfully`);
      setShowAddDialog(false);
      fetchRecords();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create record';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit record
  const handleOpenEdit = (rec: any) => {
    setSelectedRecord(rec);
    const formValues: Record<string, any> = {};
    tabConfig.fields.forEach((field) => {
      formValues[field.key] = rec[field.key] ?? '';
    });
    formValues.workflowStatus = rec.workflowStatus || rec.status || 'draft';
    setFormData(formValues);
    setShowEditDialog(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord?.id) {
      toast.error('Record ID missing for update');
      return;
    }
    for (const field of tabConfig.fields) {
      if (field.required && (!formData[field.key] || String(formData[field.key]).trim() === '')) {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const statusVal = formData.workflowStatus || 'draft';
      const payload: Record<string, any> = {
        ...formData,
        departmentId: effectiveDeptId,
        academicYear: formData.academicYear || academicYear,
        workflowStatus: statusVal,
        status: statusVal,
      };
      tabConfig.fields.forEach((f) => {
        if (f.type === 'number' && payload[f.key]) {
          payload[f.key] = Number(payload[f.key]);
        }
      });

      await apiUpdateRecord(
        tabConfig.id,
        selectedRecord.id,
        academicYear,
        effectiveDeptId,
        payload
      );
      toast.success(`${tabConfig.label} record updated successfully`);
      setShowEditDialog(false);
      setSelectedRecord(null);
      fetchRecords();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update record';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete record
  const handleOpenDelete = (rec: any) => {
    setSelectedRecord(rec);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedRecord?.id) return;
    setSubmitting(true);
    try {
      await apiDeleteRecord(
        tabConfig.id,
        selectedRecord.id,
        academicYear,
        effectiveDeptId
      );
      toast.success(`${tabConfig.label} record deleted successfully`);
      setShowDeleteDialog(false);
      setSelectedRecord(null);
      fetchRecords();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete record';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Download CSV template
  const handleDownloadTemplate = () => {
    const headers = tabConfig.fields.map((f) => f.csvColumn);
    const sampleRow = tabConfig.fields.map((f) => {
      if (f.masterDataSource === 'academicYears' || f.key === 'academicYear') return academicYear;
      if (f.masterDataSource === 'departments') return departmentName;
      if (f.selectOptions && f.selectOptions.length > 0) return f.selectOptions[0];
      if (f.type === 'date') return new Date().toISOString().split('T')[0];
      if (f.type === 'number') return '10';
      if (f.type === 'boolean') return 'Yes';
      return `Sample ${f.label}`;
    });

    const csvContent = `\ufeff${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tabConfig.id}_template_${academicYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Render input for a single field
  const renderFieldControl = (field: FieldConfig) => {
    const value = formData[field.key] ?? '';

    if (field.masterDataSource) {
      const options = (masterData[field.masterDataSource as keyof typeof masterData] as string[]) || [];
      return (
        <Select
          value={value}
          onValueChange={(val) => setFormData((prev) => ({ ...prev, [field.key]: val }))}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder={`Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.selectOptions && field.selectOptions.length > 0) {
      return (
        <Select
          value={value}
          onValueChange={(val) => setFormData((prev) => ({ ...prev, [field.key]: val }))}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder={`Select ${field.label}`} />
          </SelectTrigger>
          <SelectContent>
            {field.selectOptions.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === 'boolean') {
      return (
        <Select
          value={value || 'No'}
          onValueChange={(val) => setFormData((prev) => ({ ...prev, [field.key]: val }))}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes" className="text-xs">Yes</SelectItem>
            <SelectItem value="No" className="text-xs">No</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (field.type === 'date') {
      return (
        <Input
          type="date"
          value={value}
          onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
          required={field.required}
          className="h-9 text-xs"
        />
      );
    }

    if (field.type === 'number') {
      return (
        <Input
          type="number"
          placeholder={`Enter ${field.label}`}
          value={value}
          onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
          required={field.required}
          className="h-9 text-xs"
        />
      );
    }

    return (
      <Input
        placeholder={`Enter ${field.label}`}
        value={value}
        onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
        required={field.required}
        className="h-9 text-xs"
      />
    );
  };

  const minTableWidth = Math.max(1400, (tabConfig.fields.length + 3) * 150);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* ── Actions Card ── */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Actions</CardTitle>
            <Badge variant="outline" className="text-[10px]">
              {records.length} records
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={handleDownloadTemplate}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Download Template
            </Button>
            {!isReadOnly && tabConfig.fields.length > 0 && (
              <>
                <Button
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setShowCsvUploadDialog(true)}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={handleOpenAdd}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Record
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Data Table Card ── */}
      {tabConfig.fields.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold">{tabConfig.label} Data</CardTitle>
                <CardDescription className="text-xs">
                  Showing {filteredRecords.length} of {records.length} records
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Horizontal Scroll Table Container */}
            <div className="overflow-x-auto w-full border-t">
              <Table style={{ minWidth: `${minTableWidth}px` }}>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-12 text-center text-[11px] font-semibold">#</TableHead>
                    {tabConfig.fields.map((field) => (
                      <TableHead key={field.key} className="text-[11px] font-semibold min-w-[120px]">
                        {field.csvColumn}
                        {field.required && <span className="text-red-500 ml-0.5">*</span>}
                      </TableHead>
                    ))}
                    <TableHead className="w-24 text-[11px] font-semibold">Status</TableHead>
                    <TableHead className="w-24 text-right text-[11px] font-semibold sticky right-0 bg-muted/30">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={idx}>
                        {Array.from({ length: tabConfig.fields.length + 3 }).map((_, cIdx) => (
                          <TableCell key={cIdx} className="p-3">
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={tabConfig.fields.length + 3}
                        className="h-36 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <FileText className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm font-medium">No records found for this academic year</p>
                          <p className="text-xs text-muted-foreground/70">
                            Click &quot;Add Record&quot; or &quot;Upload CSV&quot; to add {tabConfig.label.toLowerCase()}.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((row, index) => (
                      <TableRow key={row.id || index} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="text-center text-xs font-mono text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        {tabConfig.fields.map((field) => {
                          const val = row[field.key];
                          return (
                            <TableCell key={field.key} className="text-xs max-w-xs truncate" title={String(val ?? '')}>
                              {field.type === 'boolean' ? (
                                <span className={val === 'Yes' ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}>
                                  {val || 'No'}
                                </span>
                              ) : (
                                String(val || '—')
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-xs">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-[9px] capitalize',
                              (row.status === 'verified' || row.status === 'approved' || row.status === 'granted') &&
                                'bg-emerald-500/10 text-emerald-600',
                              (row.status === 'pending' || row.status === 'submitted' || row.status === 'hod_review' || row.status === 'iqac_verification') &&
                                'bg-amber-500/10 text-amber-600',
                              row.status === 'rejected' && 'bg-red-500/10 text-red-600',
                              (row.status === 'draft' || row.status === 'uploaded' || row.status === 'filed') &&
                                'bg-blue-500/10 text-blue-600'
                            )}
                          >
                            {row.status ? row.status.replace(/_/g, ' ') : 'draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right sticky right-0 bg-card">
                          <div className="flex items-center justify-end gap-1">
                            {!isReadOnly && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                  onClick={() => handleOpenEdit(row)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                  onClick={() => handleOpenDelete(row)}
                                >
                                  <Trash2 className="h-3 w-3" />
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
      )}

      {/* ── Evidence Repository (Bottom Table) ── */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Evidence Repository</CardTitle>
              <CardDescription className="text-xs">
                Supporting documents for {tabConfig.label}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {evidenceList.length} documents
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {tabConfig.requiredEvidence && tabConfig.requiredEvidence.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="text-[10px] text-muted-foreground mr-1">Required:</span>
              {tabConfig.requiredEvidence.map((ev) => (
                <Badge key={ev} variant="outline" className="text-[9px] px-1.5 py-0">
                  {ev}
                </Badge>
              ))}
            </div>
          )}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[10px]">Document</TableHead>
                  <TableHead className="text-[10px]">Category</TableHead>
                  <TableHead className="text-[10px]">Version</TableHead>
                  <TableHead className="text-[10px]">Uploaded By</TableHead>
                  <TableHead className="text-[10px]">Date</TableHead>
                  <TableHead className="text-[10px]">Status</TableHead>
                  <TableHead className="text-[10px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evidenceList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <FileText className="h-6 w-6 text-muted-foreground/30" />
                        <p className="text-xs font-medium">No supporting documents uploaded</p>
                        <p className="text-[10px] text-muted-foreground/60">
                          Uploaded evidence files for this section will appear here.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  evidenceList.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs font-medium truncate max-w-[180px]">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px]">{doc.category}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{doc.version}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{doc.uploadedBy}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{doc.uploadedDate}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[9px]">{doc.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-6 w-6"><Eye className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6"><DownloadCloud className="h-3 w-3" /></Button>
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

      {/* ── Add Record Dialog ── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base">Add {tabConfig.label} Record</DialogTitle>
            <DialogDescription className="text-xs">
              Fill in the record details below. Fields marked with <span className="text-red-500">*</span> are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 py-2 overflow-y-auto pr-1 flex-1">
              {tabConfig.fields.map((field) => (
                <div
                  key={field.key}
                  className={cn(
                    'space-y-1.5',
                    (field.key.includes('Title') ||
                      field.key.includes('description') ||
                      field.key.includes('Name') && !field.key.includes('faculty') && !field.key.includes('student')) &&
                      'md:col-span-2'
                  )}
                >
                  <Label className="text-xs font-semibold">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {renderFieldControl(field)}
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Workflow Status</Label>
                <Select
                  value={formData.workflowStatus || 'draft'}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, workflowStatus: val }))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="validated">Validated</SelectItem>
                    <SelectItem value="hod_review">HOD Review</SelectItem>
                    <SelectItem value="iqac_verification">IQAC Verification</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 mt-4 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                Save Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Record Dialog ── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base">Edit {tabConfig.label} Record</DialogTitle>
            <DialogDescription className="text-xs">
              Modify the record details below. Fields marked with <span className="text-red-500">*</span> are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="flex flex-col flex-1 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 py-2 overflow-y-auto pr-1 flex-1">
              {tabConfig.fields.map((field) => (
                <div
                  key={field.key}
                  className={cn(
                    'space-y-1.5',
                    (field.key.includes('Title') ||
                      field.key.includes('description') ||
                      field.key.includes('Name') && !field.key.includes('faculty') && !field.key.includes('student')) &&
                      'md:col-span-2'
                  )}
                >
                  <Label className="text-xs font-semibold">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {renderFieldControl(field)}
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Workflow Status</Label>
                <Select
                  value={formData.workflowStatus || 'draft'}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, workflowStatus: val }))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="validated">Validated</SelectItem>
                    <SelectItem value="hod_review">HOD Review</SelectItem>
                    <SelectItem value="iqac_verification">IQAC Verification</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 mt-4 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                Update Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Delete {tabConfig.label} Record</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete this record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="p-3 rounded-lg bg-muted/40 border text-xs space-y-1">
              <p className="font-semibold text-foreground">
                {selectedRecord.title ||
                  selectedRecord.paperTitle ||
                  selectedRecord.patentTitle ||
                  selectedRecord.bookTitle ||
                  selectedRecord.chapterTitle ||
                  selectedRecord.projectTitle ||
                  selectedRecord.projectName ||
                  selectedRecord.consultancyTitle ||
                  'Selected Record'}
              </p>
              <p className="text-muted-foreground">
                {selectedRecord.facultyName || selectedRecord.studentName || selectedRecord.principalInvestigator || ''}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" disabled={submitting} onClick={handleDelete}>
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 6-Step CSV Upload Dialog ── */}
      {showCsvUploadDialog && (
        <CSVUploadDialog
          open={showCsvUploadDialog}
          onClose={() => setShowCsvUploadDialog(false)}
          tabConfig={tabConfig}
          existingData={records}
          onUploadFile={async (file) => {
            await apiUploadCsv(
              tabConfig.id,
              academicYear,
              effectiveDeptId,
              file
            );
            toast.success('CSV uploaded and processed successfully');
            fetchRecords();
          }}
          onUploadComplete={() => {
            fetchRecords();
            setShowCsvUploadDialog(false);
          }}
        />
      )}
    </motion.div>
  );
};
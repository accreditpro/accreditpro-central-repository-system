import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useReadOnly } from '@/hooks/useReadOnly';
import { tpoTabConfigs } from '../tpo-configs';
import { TPOEvidenceDialog, TPOEvidence, EvidenceBadge, RECRUITER_EVIDENCE_SECTIONS } from './TPOEvidenceDialog';
import { TpoCsvUploadDialog } from './TpoCsvUploadDialog';
import { tpoRepositoryService } from '@/services/tpo.service';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  Paperclip,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

type RecruiterRow = Record<string, string | number>;

// ============================================================
// PROPS
// ============================================================

interface RecruitersViewProps {
  departmentId: number;
  academicYear: string;
}

const PAGE_SIZE = 10;

// ============================================================
// RECRUITERS VIEW
// ============================================================

export function RecruitersView({ departmentId, academicYear }: RecruitersViewProps) {
  const isReadOnly = useReadOnly();
  const [records, setRecords] = useState<RecruiterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sectionStats, setSectionStats] = useState<{ total: number; withDocs: number; totalFiles: number }>({
    total: 0,
    withDocs: 0,
    totalFiles: 0,
  });
  const [evidenceMap, setEvidenceMap] = useState<Record<string, TPOEvidence | null>>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<RecruiterRow | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState<{ id: number; name: string } | null>(null);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const searchTimer = useRef<number | null>(null);

  const recruitersTab = tpoTabConfigs.find((t) => t.id === 'recruiters');
  const fields = recruitersTab?.fields || [];

  // Visible fields in the table (show key fields)
  const visibleFields = fields.slice(0, 6);

  const flatten = useCallback((row: { id: number; recordData?: Record<string, unknown> }): RecruiterRow => {
    const flat: RecruiterRow = { id: row.id };
    Object.entries(row.recordData || {}).forEach(([key, value]) => {
      flat[key] = typeof value === 'number' ? value : String(value ?? '');
    });
    return flat;
  }, []);

  const fetchRecords = useCallback(
    async (query: string, targetPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await tpoRepositoryService.getSectionRecords('recruiters', {
          departmentId,
          academicYear,
          search: query || undefined,
          page: targetPage,
          size: PAGE_SIZE,
        });
        setRecords(res.content.map(flatten));
        setTotalElements(res.totalElements || 0);
        setTotalPages(res.totalPages || 0);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load recruiters');
        setRecords([]);
        setTotalElements(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [departmentId, academicYear, flatten]
  );

  const fetchStats = useCallback(async () => {
    try {
      const res = await tpoRepositoryService.getSectionStats('recruiters', departmentId, academicYear);
      const get = (key: string) => res.cards.find((c) => c.key === key)?.value ?? 0;
      setSectionStats({ total: get('totalRecords'), withDocs: get('withDocuments'), totalFiles: get('totalFiles') });
    } catch {
      // stats are supplementary
    }
  }, [departmentId, academicYear]);

  const fetchEvidence = useCallback(async () => {
    try {
      const res = await tpoRepositoryService.getDocuments({
        departmentId,
        academicYear,
        sectionName: 'recruiters',
        page: 0,
        size: 500,
      });
      const map: Record<string, TPOEvidence | null> = {};
      res.content.forEach((doc) => {
        const key = String(doc.recordId ?? '');
        if (!key) return;
        const existing = map[key] || { recordId: key, sections: {} };
        const type = doc.documentType || 'documents';
        existing.sections[type] = [
          ...(existing.sections[type] || []),
          { id: String(doc.id), name: doc.documentName, size: doc.size || 0, type: 'application/octet-stream', uploadedAt: doc.uploadedAt || '' },
        ];
        map[key] = existing;
      });
      setEvidenceMap(map);
    } catch {
      // evidence badges are supplementary
    }
  }, [departmentId, academicYear]);

  useEffect(() => {
    fetchRecords(debouncedSearch, page);
    fetchStats();
    fetchEvidence();
  }, [fetchRecords, fetchStats, fetchEvidence, debouncedSearch, page]);

  useEffect(() => {
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setDebouncedSearch(value);
      setPage(0);
    }, 400);
  };

  const filteredRecords = useMemo(() => {
    if (!debouncedSearch) return records;
    const q = debouncedSearch.toLowerCase();
    return records.filter((r) =>
      Object.entries(r).some(([key, val]) => key !== 'id' && String(val).toLowerCase().includes(q))
    );
  }, [records, debouncedSearch]);

  // ============ CRUD Handlers ============

  const handleAddNew = () => {
    const emptyRow: RecruiterRow = {};
    fields.forEach((f) => {
      emptyRow[f.key] = '';
    });
    setEditingRow(emptyRow);
    setEditingId(null);
    setIsNewRecord(true);
    setEditDialogOpen(true);
  };

  const handleEdit = (row: RecruiterRow) => {
    setEditingRow({ ...row });
    setEditingId(Number(row.id));
    setIsNewRecord(false);
    setEditDialogOpen(true);
  };

  const handleDelete = async (row: RecruiterRow) => {
    setError(null);
    try {
      await tpoRepositoryService.deleteSectionRecord('recruiters', Number(row.id), departmentId, academicYear);
      const remaining = records.length - 1;
      if (remaining === 0 && page > 0) {
        setPage(page - 1);
      } else {
        fetchRecords(debouncedSearch, page);
      }
      fetchStats();
      setSuccessMsg('Recruiter removed successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete recruiter');
    }
  };

  const handleSave = async () => {
    if (!editingRow) return;
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, string | number | null> = {};
      fields.forEach((f) => {
        const value = editingRow[f.key];
        if (value === undefined) return;
        if (value === '') {
          if (!isNewRecord) payload[f.key] = null;
        } else {
          payload[f.key] = value;
        }
      });
      if (isNewRecord) {
        await tpoRepositoryService.createSectionRecord('recruiters', payload, departmentId, academicYear);
      } else if (editingId !== null) {
        await tpoRepositoryService.updateSectionRecord('recruiters', editingId, payload, departmentId, academicYear);
      }
      setEditDialogOpen(false);
      setEditingRow(null);
      setEditingId(null);
      fetchRecords(debouncedSearch, page);
      fetchStats();
      setSuccessMsg(isNewRecord ? 'Recruiter added successfully' : 'Recruiter updated successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save recruiter');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    tpoRepositoryService
      .exportSectionCsv('recruiters', departmentId, academicYear, debouncedSearch || undefined)
      .catch(() => setError('Failed to export CSV'));
  };

  // ============ Evidence Handlers ============

  const handleOpenEvidence = (row: RecruiterRow) => {
    setSelectedRecruiter({ id: Number(row.id), name: String(row.companyName || 'Unknown') });
    setEvidenceDialogOpen(true);
  };

  const handleEvidenceChange = (recruiterId: string, evidence: TPOEvidence) => {
    setEvidenceMap((prev) => ({ ...prev, [recruiterId]: evidence }));
    fetchStats();
  };

  // ============ Render ============

  const formatCellValue = (field: typeof fields[0], value: string | number): string => {
    if (value === '' || value === undefined || value === null) return '-';
    if (field.type === 'currency') {
      return `₹${Number(value).toLocaleString('en-IN')}`;
    }
    return String(value);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" />
            Recruiters
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage registered recruiters, company partnerships, and supporting documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          {!isReadOnly && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setCsvDialogOpen(true)}
              >
                <Upload className="h-4 w-4" />
                CSV Upload
              </Button>
              <Button size="sm" className="gap-2" onClick={handleAddNew}>
                <Plus className="h-4 w-4" />
                Add Recruiter
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-indigo-600">{sectionStats.total}</p>
              <p className="text-[10px] text-muted-foreground">Total Recruiters</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FileCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-600">{sectionStats.withDocs}</p>
              <p className="text-[10px] text-muted-foreground">With Documents</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Paperclip className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-amber-600">{sectionStats.totalFiles}</p>
              <p className="text-[10px] text-muted-foreground">Total Files</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">
                {RECRUITER_EVIDENCE_SECTIONS.length}
              </p>
              <p className="text-[10px] text-muted-foreground">Document Sections</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-emerald-700">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search recruiters..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Recruiters Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Registered Recruiters
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {loading ? '...' : totalElements} recruiter{totalElements !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading recruiters...</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No recruiters found</p>
              {!isReadOnly && (
                <p className="text-xs text-muted-foreground mt-1">
                  Click "Add Recruiter" to register a new company
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-8">#</TableHead>
                    {visibleFields.map((field) => (
                      <TableHead key={field.key} className="whitespace-nowrap text-xs">
                        {field.label}
                      </TableHead>
                    ))}
                    <TableHead className="text-xs text-center">Documents</TableHead>
                    <TableHead className="text-right text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((row, idx) => {
                    const evidence = evidenceMap[String(row.id)] || null;
                    return (
                      <TableRow key={row.id} className="group">
                        <TableCell className="text-xs text-muted-foreground">{page * PAGE_SIZE + idx + 1}</TableCell>
                        {visibleFields.map((field) => (
                          <TableCell
                            key={field.key}
                            className="text-sm whitespace-nowrap max-w-[200px] truncate"
                          >
                            {field.key === 'logo' && String(row[field.key] || '') ? (
                              <img
                                src={String(row[field.key])}
                                alt="Logo"
                                className="h-6 w-6 rounded object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : field.type === 'currency' ? (
                              <span className="font-medium text-emerald-600">
                                ₹{Number(row[field.key]).toLocaleString('en-IN')}
                              </span>
                            ) : (
                              String(row[field.key] || '-')
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <button onClick={() => handleOpenEvidence(row)} className="inline-flex items-center gap-1">
                            <EvidenceBadge evidence={evidence} />
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isReadOnly ? (
                              <span className="text-[10px] text-muted-foreground italic">Read-only</span>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleOpenEvidence(row)}
                                  title="Upload Documents"
                                >
                                  <Upload className="h-3.5 w-3.5 text-amber-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleEdit(row)}
                                  title="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => handleDelete(row)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {totalPages > 1 && (
          <CardContent className="p-3 pt-0">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={page === 0 || loading}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={page >= totalPages - 1 || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Evidence Section Breakdown */}
      {Object.values(evidenceMap).some((e) => e && Object.values(e.sections).some((f) => f.length > 0)) && (
        <Card className="border-border/50 bg-gradient-to-r from-indigo-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-indigo-600" />
              Document Overview by Section
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {RECRUITER_EVIDENCE_SECTIONS.map((section) => {
                const totalInSection = Object.values(evidenceMap).reduce((sum, e) => {
                  if (!e) return sum;
                  return sum + (e.sections[section.id]?.length || 0);
                }, 0);
                const recruitersWithDocs = Object.values(evidenceMap).filter(
                  (e) => e && (e.sections[section.id]?.length || 0) > 0
                ).length;

                return (
                  <div
                    key={section.id}
                    className="rounded-lg border border-border/50 bg-background/80 p-2.5"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {section.icon}
                      <span className="text-[10px] font-medium truncate">{section.label}</span>
                    </div>
                    <p className="text-lg font-bold text-indigo-600">{totalInSection}</p>
                    <p className="text-[9px] text-muted-foreground">
                      {recruitersWithDocs} recruiter{recruitersWithDocs !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit/Add Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNewRecord ? 'Register New Recruiter' : 'Edit Recruiter Details'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs font-medium">
                  {field.label}
                  {field.required && <span className="text-destructive ml-0.5">*</span>}
                </Label>
                {field.type === 'select' ? (
                  <Select
                    value={String(editingRow?.[field.key] || '')}
                    onValueChange={(val) =>
                      setEditingRow((prev) => (prev ? { ...prev, [field.key]: val } : null))
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={
                      field.type === 'number' || field.type === 'currency' || field.type === 'percentage'
                        ? 'number'
                        : field.type === 'date'
                        ? 'date'
                        : 'text'
                    }
                    value={String(editingRow?.[field.key] || '')}
                    onChange={(e) =>
                      setEditingRow((prev) =>
                        prev
                          ? {
                              ...prev,
                              [field.key]:
                                field.type === 'number' || field.type === 'currency' || field.type === 'percentage'
                                  ? Number(e.target.value)
                                  : e.target.value,
                            }
                          : null
                      )
                    }
                    placeholder={field.placeholder || `Enter ${field.label}`}
                    className="h-9"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : isNewRecord ? 'Add Recruiter' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Upload Dialog */}
      <TpoCsvUploadDialog
        open={csvDialogOpen}
        onClose={() => setCsvDialogOpen(false)}
        sectionId="recruiters"
        sectionLabel="Recruiters"
        departmentId={departmentId}
        academicYear={academicYear}
        onImported={() => {
          fetchRecords(debouncedSearch, page);
          fetchStats();
        }}
      />

      {/* Evidence Upload Dialog */}
      {selectedRecruiter && (
        <TPOEvidenceDialog
          recordId={selectedRecruiter.id}
          recordName={selectedRecruiter.name}
          sectionTitle="Supporting Documents"
          open={evidenceDialogOpen}
          onClose={() => {
            setEvidenceDialogOpen(false);
            setSelectedRecruiter(null);
          }}
          onEvidenceChange={handleEvidenceChange}
          sectionConfigs={RECRUITER_EVIDENCE_SECTIONS}
          departmentId={departmentId}
          academicYear={academicYear}
          sectionName="recruiters"
        />
      )}
    </div>
  );
}

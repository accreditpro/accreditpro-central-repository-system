import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import { useReadOnly } from '@/hooks/useReadOnly';
import { tpoTabConfigs } from '../tpo-configs';
import { TPOEvidenceDialog, TPOEvidence, EvidenceBadge, RECRUITER_EVIDENCE_SECTIONS } from './TPOEvidenceDialog';
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
  Globe,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Users,
  FileCheck,
  Eye,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

type RecruiterRow = Record<string, string | number>;

interface RecruiterWithEvidence {
  data: RecruiterRow;
  evidence: TPOEvidence | null;
}

// ============================================================
// PROPS
// ============================================================

interface RecruitersViewProps {
  initialData: RecruiterRow[];
  onDataChange: (data: RecruiterRow[]) => void;
}



// ============================================================
// RECRUITERS VIEW
// ============================================================

export function RecruitersView({ initialData, onDataChange }: RecruitersViewProps) {
  const isReadOnly = useReadOnly();
  const [records, setRecords] = useState<RecruiterWithEvidence[]>(() =>
    initialData.map((d) => ({ data: d, evidence: null }))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<RecruiterRow | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [expandedRecruiter, setExpandedRecruiter] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const recruitersTab = tpoTabConfigs.find((t) => t.id === 'recruiters');
  const fields = recruitersTab?.fields || [];

  // Visible fields in the table (show key fields)
  const visibleFields = fields.slice(0, 6);

  // Filtered records
  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    const q = searchQuery.toLowerCase();
    return records.filter((r) =>
      Object.values(r.data).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [records, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = records.length;
    const withDocs = records.filter(
      (r) => r.evidence && Object.values(r.evidence.sections).some((f) => f.length > 0)
    ).length;
    const totalFiles = records.reduce((sum, r) => {
      if (!r.evidence) return sum;
      return sum + Object.values(r.evidence.sections).reduce((s, f) => s + f.length, 0);
    }, 0);
    return { total, withDocs, totalFiles };
  }, [records]);

  // ============ CRUD Handlers ============

  const handleAddNew = () => {
    const emptyRow: RecruiterRow = {};
    fields.forEach((f) => {
      emptyRow[f.key] = '';
    });
    setEditingRow(emptyRow);
    setIsNewRecord(true);
    setEditDialogOpen(true);
  };

  const handleEdit = (row: RecruiterRow, index: number) => {
    setEditingRow({ ...row });
    setEditingIndex(index);
    setIsNewRecord(false);
    setEditDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    const newRecords = records.filter((_, i) => i !== index);
    setRecords(newRecords);
    onDataChange(newRecords.map((r) => r.data));
    setSuccessMsg('Recruiter removed successfully');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSave = () => {
    if (!editingRow) return;
    let newRecords: RecruiterWithEvidence[];
    if (isNewRecord) {
      newRecords = [...records, { data: editingRow, evidence: null }];
    } else if (editingIndex !== null && editingIndex >= 0 && editingIndex < records.length) {
      newRecords = records.map((r, i) =>
        i === editingIndex ? { ...r, data: editingRow } : r
      );
    } else {
      return;
    }
    setRecords(newRecords);
    onDataChange(newRecords.map((r) => r.data));
    setEditDialogOpen(false);
    setEditingRow(null);
    setEditingIndex(null);
    setSuccessMsg(isNewRecord ? 'Recruiter added successfully' : 'Recruiter updated successfully');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ============ Evidence Handlers ============

  const handleOpenEvidence = (recruiter: RecruiterRow, index: number) => {
    const companyName = String(recruiter.companyName || 'Unknown');
    setSelectedRecruiter({ id: `recruiter-${index}`, name: companyName });
    setEvidenceDialogOpen(true);
  };

  const handleEvidenceChange = (recruiterId: string, evidence: TPOEvidence) => {
    const idx = parseInt(recruiterId.replace('recruiter-', ''));
    if (isNaN(idx) || idx >= records.length) return;
    setRecords((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, evidence } : r))
    );
  };

  const handleExport = () => {
    const headers = fields.map((f) => f.label).join(',');
    const rows = records.map((r) =>
      fields.map((f) => String(r.data[f.key] || '')).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruiters_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============ Render ============

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
            <Button size="sm" className="gap-2" onClick={handleAddNew}>
              <Plus className="h-4 w-4" />
              Add Recruiter
            </Button>
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
              <p className="text-lg font-bold text-indigo-600">{stats.total}</p>
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
              <p className="text-lg font-bold text-emerald-600">{stats.withDocs}</p>
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
              <p className="text-lg font-bold text-amber-600">{stats.totalFiles}</p>
              <p className="text-[10px] text-muted-foreground">Total Files</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Eye className="h-4 w-4 text-blue-600" />
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search recruiters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
              {filteredRecords.length} recruiter{filteredRecords.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No recruiters added yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click "Add Recruiter" to register a new company
              </p>
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
                  {filteredRecords.map((record, idx) => {
                    const row = record.data;
                    const evidence = record.evidence;
                    const isExpanded = expandedRecruiter === `recruiter-${idx}`;

                    return (
                      <TableRow key={idx} className="group">
                        <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
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
                          <button
                            onClick={() => handleOpenEvidence(row, idx)}
                            className="inline-flex items-center gap-1"
                          >
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
                                  onClick={() => handleOpenEvidence(row, records.indexOf(record))}
                                  title="Upload Documents"
                                >
                                  <Upload className="h-3.5 w-3.5 text-amber-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleEdit(row, records.indexOf(record))}
                                  title="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => handleDelete(records.indexOf(record))}
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
      </Card>

      {/* Evidence Section Breakdown */}
      {records.some((r) => r.evidence) && (
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
                const totalInSection = records.reduce((sum, r) => {
                  if (!r.evidence) return sum;
                  return sum + (r.evidence.sections[section.id]?.length || 0);
                }, 0);
                const recruitersWithDocs = records.filter(
                  (r) =>
                    r.evidence && (r.evidence.sections[section.id]?.length || 0) > 0
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
            <Button onClick={handleSave}>
              {isNewRecord ? 'Add Recruiter' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        />
      )}
    </div>
  );
}

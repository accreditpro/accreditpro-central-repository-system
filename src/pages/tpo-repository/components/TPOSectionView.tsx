import { useState, useMemo } from 'react';
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
import { TPOTabConfig } from '../tpo-configs';
import { TPOEvidenceDialog, TPOEvidence, EvidenceBadge, TPOEvidenceSectionConfig } from './TPOEvidenceDialog';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  FileText,
  CheckCircle2,
  Building2,
  Paperclip,
  FileCheck,
  Eye,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

type DataRow = Record<string, string | number>;

interface RowWithEvidence {
  data: DataRow;
  evidence: TPOEvidence | null;
}

// ============================================================
// PROPS
// ============================================================

interface TPOSectionViewProps {
  tabConfig: TPOTabConfig;
  initialData: DataRow[];
  onDataChange: (data: DataRow[]) => void;
  getRecordTitle: (row: DataRow) => string;
  getRecordId: (row: DataRow, index: number) => string;
  getIcon?: (row: DataRow) => React.ReactNode;
  evidenceSectionConfigs?: TPOEvidenceSectionConfig[];
  statsConfig?: {
    icon: React.ReactNode;
    label: string;
    color: string;
    bgClass: string;
    getValue: (stats: { total: number; withDocs: number; totalFiles: number }) => string | number;
  }[];
  /** Initial evidence for each record, keyed by getRecordId(row, index) */
  initialEvidenceMap?: Record<string, TPOEvidence | null>;
  /** Called whenever a record's evidence is added/updated/removed */
  onRecordEvidenceChange?: (recordId: string, evidence: TPOEvidence | null) => void;
}

// ============================================================
// SECTION VIEW COMPONENT
// ============================================================

export function TPOSectionView({
  tabConfig,
  initialData,
  onDataChange,
  getRecordTitle,
  getRecordId,
  getIcon,
  statsConfig,
  evidenceSectionConfigs,
  initialEvidenceMap,
  onRecordEvidenceChange,
}: TPOSectionViewProps) {
  const [records, setRecords] = useState<RowWithEvidence[]>(() =>
    initialData.map((d, i) => {
      const id = getRecordId(d, i);
      return { data: d, evidence: initialEvidenceMap?.[id] || null };
    })
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<DataRow | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fields = tabConfig.fields;
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

  // Default stats if not provided
  const defaultStats = [
    {
      icon: <Building2 className="h-4 w-4" />,
      label: `Total ${tabConfig.label}`,
      color: 'text-indigo-600',
      bgClass: 'bg-indigo-500/10',
      getValue: (s: typeof stats) => s.total,
    },
    {
      icon: <FileCheck className="h-4 w-4" />,
      label: 'With Documents',
      color: 'text-emerald-600',
      bgClass: 'bg-emerald-500/10',
      getValue: (s: typeof stats) => s.withDocs,
    },
    {
      icon: <Paperclip className="h-4 w-4" />,
      label: 'Total Files',
      color: 'text-amber-600',
      bgClass: 'bg-amber-500/10',
      getValue: (s: typeof stats) => s.totalFiles,
    },
  ];

  const displayStats = statsConfig || defaultStats;

  // ============ CRUD Handlers ============

  const handleAddNew = () => {
    const emptyRow: DataRow = {};
    fields.forEach((f) => {
      emptyRow[f.key] = '';
    });
    setEditingRow(emptyRow);
    setIsNewRecord(true);
    setEditDialogOpen(true);
  };

  const handleEdit = (row: DataRow, index: number) => {
    setEditingRow({ ...row });
    setEditingIndex(index);
    setIsNewRecord(false);
    setEditDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    const newRecords = records.filter((_, i) => i !== index);
    setRecords(newRecords);
    onDataChange(newRecords.map((r) => r.data));
    setSuccessMsg('Record removed successfully');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSave = () => {
    if (!editingRow) return;
    let newRecords: RowWithEvidence[];
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
    setSuccessMsg(isNewRecord ? 'Record added successfully' : 'Record updated successfully');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ============ Evidence Handlers ============

  const handleOpenEvidence = (record: DataRow, index: number) => {
    const name = getRecordTitle(record);
    const id = getRecordId(record, index);
    setSelectedRecord({ id, name });
    setEvidenceDialogOpen(true);
  };

  const handleEvidenceChange = (recordId: string, evidence: TPOEvidence) => {
    const idx = records.findIndex((_, i) => getRecordId(records[i].data, i) === recordId);
    if (idx === -1 || idx >= records.length) return;
    setRecords((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, evidence } : r))
    );
    onRecordEvidenceChange?.(recordId, evidence);
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
    a.download = `${tabConfig.id}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============ Render ============

  const formatCellValue = (field: typeof fields[0], value: string | number): string => {
    if (value === '' || value === undefined || value === null) return '-';
    if (field.type === 'currency') {
      return `₹${Number(value).toLocaleString('en-IN')}`;
    }
    if (field.type === 'percentage') {
      return `${value}%`;
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
            {tabConfig.label}
          </h3>
          <p className="text-sm text-muted-foreground">{tabConfig.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm" className="gap-2" onClick={handleAddNew}>
            <Plus className="h-4 w-4" />
            Add Record
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {displayStats.map((stat, idx) => (
          <Card key={idx} className="border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`h-8 w-8 rounded-lg ${stat.bgClass} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className={`text-lg font-bold ${stat.color}`}>
                  {stat.getValue(stats)}
                </p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
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
          placeholder={`Search ${tabConfig.label.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Data Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              {tabConfig.label} Records
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No records added yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click "Add Record" to add a new entry
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

                    return (
                      <TableRow key={idx} className="group">
                        <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                        {visibleFields.map((field) => (
                          <TableCell
                            key={field.key}
                            className="text-sm whitespace-nowrap max-w-[200px] truncate"
                          >
                        {getIcon ? (
                          <span className="flex items-center gap-2">
                            {getIcon(row)}
                            {formatCellValue(field, row[field.key])}
                          </span>
                        ) : (
                          formatCellValue(field, row[field.key])
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleOpenEvidence(row, idx)}
                              title="Upload Documents"
                            >
                              <Upload className="h-3.5 w-3.5 text-amber-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEdit(row, idx)}
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleDelete(idx)}
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
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

      {/* Edit/Add Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNewRecord ? `Add New ${tabConfig.label.slice(0, -1)}` : 'Edit Record'}
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
              {isNewRecord ? `Add ${tabConfig.label.slice(0, -1)}` : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evidence Upload Dialog */}
      {selectedRecord && (
        <TPOEvidenceDialog
          recordId={selectedRecord.id}
          recordName={selectedRecord.name}
          sectionTitle={`Supporting Documents — ${tabConfig.label}`}
          open={evidenceDialogOpen}
          onClose={() => {
            setEvidenceDialogOpen(false);
            setSelectedRecord(null);
          }}
          onEvidenceChange={handleEvidenceChange}
          sectionConfigs={evidenceSectionConfigs}
          initialEvidence={records.find((r, i) => getRecordId(r.data, i) === selectedRecord.id)?.evidence || null}
        />
      )}
    </div>
  );
}

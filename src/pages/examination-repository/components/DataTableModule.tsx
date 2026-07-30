import { useState, useMemo } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  FileUp,
  Eye,
  ArrowUpDown,
} from 'lucide-react';
import { ModuleConfig } from '../types';
import { cn } from '@/lib/utils';

interface DataTableModuleProps {
  config: ModuleConfig;
}

export function DataTableModule({ config }: DataTableModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, string | number> | null>(null);
  const [viewingRow, setViewingRow] = useState<Record<string, string | number> | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [tableData, setTableData] = useState<Record<string, string | number>[]>(() => [...config.sampleData]);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchQuery) return tableData;
    const q = searchQuery.toLowerCase();
    return tableData.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [tableData, searchQuery]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = String(a[sortField] || '');
      const bVal = String(b[sortField] || '');
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortField, sortDir]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / perPage);
  const paginatedData = sortedData.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleAddNew = () => {
    const emptyRow: Record<string, string | number> = {};
    config.fields.forEach((f) => {
      emptyRow[f.key] = f.type === 'number' ? 0 : '';
    });
    setEditingRow(emptyRow);
    setIsNewRecord(true);
    setEditDialogOpen(true);
  };

  const handleEdit = (row: Record<string, string | number>) => {
    setEditingRow({ ...row });
    setIsNewRecord(false);
    setEditDialogOpen(true);
  };

  const handleView = (row: Record<string, string | number>) => {
    setViewingRow(row);
    setViewDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    setTableData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!editingRow) return;
    setTableData((prev) => {
      if (isNewRecord) {
        return [...prev, editingRow];
      }
      return prev.map((row) => {
        const isMatch = Object.keys(row).every(
          (k) => row[k] === tableData[prev.indexOf(row)]?.[k]
        );
        return isMatch && prev.indexOf(row) === prev.indexOf(row) ? editingRow : row;
      });
    });
    setEditDialogOpen(false);
    setEditingRow(null);
  };

  const handleExportCSV = () => {
    const headers = config.fields.map((f) => f.label).join(',');
    const rows = sortedData
      .map((row) => config.fields.map((f) => `"${row[f.key] ?? ''}"`).join(','))
      .join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.id}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'published') return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-[10px]">Published</Badge>;
    if (s === 'draft') return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px]">Draft</Badge>;
    if (s === 'archived') return <Badge variant="secondary" className="text-[10px]">Archived</Badge>;
    return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
  };

  // Fields visible in table (max 6)
  const visibleFields = config.fields.slice(0, 6);

  // Form fields (exclude file type and status for form - status is auto-managed)
  const formFields = config.fields.filter((f) => f.type !== 'file');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{config.label}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
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
          placeholder={`Search ${config.label.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-9"
        />
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{config.label} Records</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{sortedData.length} records</Badge>
              {config.id === 'backlog-repository' && (
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <Upload className="h-3 w-3" />
                  CSV Upload
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleFields.map((field) => (
                    <TableHead
                      key={field.key}
                      className="whitespace-nowrap text-xs cursor-pointer hover:text-foreground"
                      onClick={() => handleSort(field.key)}
                    >
                      <div className="flex items-center gap-1">
                        {field.label}
                        {sortField === field.key && (
                          <ArrowUpDown className={cn(
                            'h-3 w-3',
                            sortDir === 'asc' ? 'rotate-0' : 'rotate-180'
                          )} />
                        )}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleFields.length + 1}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/50">
                      {visibleFields.map((field) => (
                        <TableCell
                          key={field.key}
                          className="text-sm whitespace-nowrap max-w-[200px] truncate"
                        >
                          {field.key === 'status' ? (
                            getStatusBadge(String(row[field.key] || ''))
                          ) : field.type === 'textarea' ? (
                            <span className="text-xs text-muted-foreground truncate block max-w-[180px]">
                              {String(row[field.key] || '-')}
                            </span>
                          ) : (
                            String(row[field.key] || '-')
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleView(row)}
                            title="View details"
                          >
                            <Eye className="h-3.5 w-3.5" />
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
                            onClick={() => handleDelete(idx + (currentPage - 1) * perPage)}
                            title="Delete"
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
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">
                Showing {(currentPage - 1) * perPage + 1} to{' '}
                {Math.min(currentPage * perPage, sortedData.length)} of{' '}
                {sortedData.length} records
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 w-7 text-xs p-0"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{config.label} Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {config.fields.map((field) => (
              <div key={field.key} className="flex items-start gap-3">
                <span className="text-xs font-medium text-muted-foreground w-36 shrink-0">
                  {field.label}
                </span>
                <span className="text-sm">
                  {field.key === 'status'
                    ? getStatusBadge(String(viewingRow?.[field.key] || ''))
                    : field.type === 'textarea'
                    ? String(viewingRow?.[field.key] || '-')
                    : String(viewingRow?.[field.key] || '-')}
                </span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Add Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNewRecord ? `New ${config.label}` : `Edit ${config.label}`}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {formFields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs font-medium">
                  {field.label}
                  {field.required && <span className="text-destructive ml-0.5">*</span>}
                </Label>
                {field.type === 'select' ? (
                  <Select
                    value={String(editingRow?.[field.key] || '')}
                    onValueChange={(val) =>
                      setEditingRow((prev) =>
                        prev ? { ...prev, [field.key]: val } : null
                      )
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
                ) : field.type === 'textarea' ? (
                  <Textarea
                    value={String(editingRow?.[field.key] || '')}
                    onChange={(e) =>
                      setEditingRow((prev) =>
                        prev ? { ...prev, [field.key]: e.target.value } : null
                      )
                    }
                    placeholder={field.placeholder || `Enter ${field.label}`}
                    className="min-h-[80px] text-sm"
                  />
                ) : (
                  <Input
                    type={
                      field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'
                    }
                    value={String(editingRow?.[field.key] || '')}
                    onChange={(e) =>
                      setEditingRow((prev) =>
                        prev
                          ? {
                              ...prev,
                              [field.key]:
                                field.type === 'number'
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
            {/* File upload fields */}
            {config.fields
              .filter((f) => f.type === 'file')
              .map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs font-medium">{field.label}</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1 text-xs h-9 w-full">
                      <FileUp className="h-3.5 w-3.5" />
                      Upload {field.label}
                    </Button>
                  </div>
                </div>
              ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isNewRecord ? 'Add Record' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

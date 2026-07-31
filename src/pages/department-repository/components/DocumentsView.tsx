import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { evidenceDocuments } from '../repository-configs';
import { Search, Upload, Eye, Download, Replace, FileText, Filter } from 'lucide-react';

export const DocumentsView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const categories = [...new Set(evidenceDocuments.map(d => d.category))];

  const filteredDocs = evidenceDocuments.filter(doc => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold tracking-tight">Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage all evidence and supporting documents across repositories
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Documents',
            value: evidenceDocuments.length,
            color: 'text-indigo-600 bg-indigo-500/10',
          },
          {
            label: 'Verified',
            value: evidenceDocuments.filter(d => d.status === 'verified').length,
            color: 'text-emerald-600 bg-emerald-500/10',
          },
          {
            label: 'Pending',
            value: evidenceDocuments.filter(d => d.status === 'pending').length,
            color: 'text-amber-600 bg-amber-500/10',
          },
          {
            label: 'Rejected',
            value: evidenceDocuments.filter(d => d.status === 'rejected').length,
            color: 'text-red-600 bg-red-500/10',
          },
        ].map(stat => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
              <p className={cn('text-xl font-bold mt-1', stat.color.split(' ')[0])}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Actions */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">Document Repository</CardTitle>
              <CardDescription className="text-xs">
                All evidence documents for your department
              </CardDescription>
            </div>
            <Button size="sm" className="text-xs h-8">
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <Filter className="h-3 w-3 mr-1.5" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[10px]">Document Name</TableHead>
                  <TableHead className="text-[10px]">Category</TableHead>
                  <TableHead className="text-[10px]">Version</TableHead>
                  <TableHead className="text-[10px]">Uploaded Date</TableHead>
                  <TableHead className="text-[10px]">Uploaded By</TableHead>
                  <TableHead className="text-[10px]">Status</TableHead>
                  <TableHead className="text-[10px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map(doc => (
                  <TableRow key={doc.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div>
                          <span className="text-xs font-medium block truncate max-w-[200px]">
                            {doc.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{doc.size}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px]">
                        {doc.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{doc.version}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {doc.uploadedDate}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {doc.uploadedBy}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-[9px]',
                          doc.status === 'verified' && 'bg-emerald-500/10 text-emerald-600',
                          doc.status === 'pending' && 'bg-amber-500/10 text-amber-600',
                          doc.status === 'rejected' && 'bg-red-500/10 text-red-600',
                          doc.status === 'uploaded' && 'bg-blue-500/10 text-blue-600'
                        )}
                      >
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Replace className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

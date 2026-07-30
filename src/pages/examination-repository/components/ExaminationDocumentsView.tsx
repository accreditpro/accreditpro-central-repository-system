import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Search, Upload, FileText, Download, Eye, FolderOpen,
  ArrowLeft, Clock, Tag, FileUp, Filter,
} from 'lucide-react';
import { documentFolders } from '../examination-configs';

export function ExaminationDocumentsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState('all');

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return documentFolders;
    const q = searchQuery.toLowerCase();
    return documentFolders.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.documents.some((d) => d.title.toLowerCase().includes(q) || d.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [searchQuery]);

  const filteredDocuments = useMemo(() => {
    if (!selectedFolder) return [];
    let docs = selectedFolder.documents;
    if (yearFilter !== 'all') docs = docs.filter((d) => d.academicYear === yearFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter((d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.tags.some((t) => t.toLowerCase().includes(q)));
    }
    return docs;
  }, [selectedFolder, searchQuery, yearFilter]);

  const totalDocuments = documentFolders.reduce((sum, f) => sum + f.documentCount, 0);

  const years = useMemo(() => {
    const yrSet = new Set();
    documentFolders.forEach((f) => f.documents.forEach((d) => yrSet.add(d.academicYear)));
    return Array.from(yrSet).sort();
  }, []);

  if (selectedFolder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => { setSelectedFolder(null); setSearchQuery(''); }}>
            <ArrowLeft className="h-4 w-4" /> Back to Folders
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{selectedFolder.label}</h2>
              <p className="text-sm text-muted-foreground">{selectedFolder.description}</p>
            </div>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4" /> Upload Document
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search within folder..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="Academic Year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((y) => <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Badge variant="secondary">{filteredDocuments.length} documents</Badge>
        </div>
        <div className="space-y-3">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No documents found</p>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-sm transition-shadow group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium truncate">{doc.title}</h4>
                          <Badge variant="secondary" className="text-[10px] shrink-0">v{doc.version}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{doc.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {doc.uploadedAt}</span>
                          <span>{doc.academicYear}</span>
                          <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {doc.tags.slice(0, 3).join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Supporting Documents</h2>
          <p className="text-muted-foreground">{totalDocuments} documents across {documentFolders.length} categories</p>
        </div>
        <Button className="gap-2" onClick={() => setUploadDialogOpen(true)}><Upload className="h-4 w-4" /> Upload Document</Button>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search folders or documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Filter className="h-3 w-3" /> {filteredFolders.length} folders
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFolders.map((folder) => (
          <Card key={folder.id} className="hover:shadow-md transition-all duration-200 cursor-pointer group hover:border-primary/30 hover:-translate-y-0.5" onClick={() => setSelectedFolder(folder)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FolderOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold truncate">{folder.label}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{folder.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px]">{folder.documentCount} document{folder.documentCount !== 1 ? 's' : ''}</Badge>
                <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">View all &rarr;</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredFolders.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No folders found matching your search</p>
        </div>
      )}
    </div>
  );
}

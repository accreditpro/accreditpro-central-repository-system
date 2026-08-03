import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Upload, RefreshCw, Download, History, FileText, AlertCircle } from 'lucide-react';
import {
  EvidenceFolder,
  EvidenceDocument,
  FilterType,
  getStatusColor,
  getStatusLabel,
} from './types';
import { UploadDialog } from './UploadDialog';
import { PreviewDrawer } from './PreviewDrawer';
import { VersionHistoryDialog } from './VersionHistoryDialog';

interface DocumentTableProps {
  folder: EvidenceFolder;
  searchQuery: string;
  activeFilter: FilterType;
}

export function DocumentTable({ folder, searchQuery, activeFilter }: DocumentTableProps) {
  const [uploadDoc, setUploadDoc] = useState<EvidenceDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<EvidenceDocument | null>(null);
  const [versionDoc, setVersionDoc] = useState<EvidenceDocument | null>(null);

  const filteredDocuments = useMemo(() => {
    let docs = folder.documents;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter(
        d =>
          d.name.toLowerCase().includes(query) ||
          d.frameworks.some(fw => fw.toLowerCase().includes(query))
      );
    }

    // Apply filter
    switch (activeFilter) {
      case 'mandatory':
        docs = docs.filter(d => d.mandatory);
        break;
      case 'optional':
        docs = docs.filter(d => !d.mandatory);
        break;
      case 'uploaded':
        docs = docs.filter(
          d => d.status === 'uploaded' || d.status === 'submitted' || d.status === 'approved'
        );
        break;
      case 'pending':
        docs = docs.filter(d => d.status === 'not_uploaded');
        break;
      case 'approved':
        docs = docs.filter(d => d.status === 'approved');
        break;
      case 'rejected':
        docs = docs.filter(d => d.status === 'rejected');
        break;
      case 'expired':
        docs = docs.filter(d => d.status === 'expired');
        break;
      default:
        break;
    }

    return docs;
  }, [folder.documents, searchQuery, activeFilter]);

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Document Name</TableHead>
              <TableHead className="w-[90px] text-center">Mandatory</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[110px]">Uploaded On</TableHead>
              <TableHead className="w-[70px] text-center">Version</TableHead>
              <TableHead className="w-[180px]">Framework</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No documents found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map(doc => (
                <TableRow key={doc.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                            {doc.description}
                          </p>
                        )}
                      </div>
                      {doc.mandatory && doc.status === 'not_uploaded' && (
                        <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${doc.mandatory ? 'border-red-200 text-red-600 dark:border-red-800 dark:text-red-400' : 'border-gray-200 text-gray-500'}`}
                    >
                      {doc.mandatory ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${getStatusColor(doc.status)}`}>
                      {getStatusLabel(doc.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {doc.uploadedOn || '—'}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {doc.currentVersion ? `V${doc.currentVersion}` : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {doc.frameworks.map(fw => (
                        <Badge key={fw} variant="secondary" className="text-[9px] px-1.5 py-0">
                          {fw}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      {doc.status === 'not_uploaded' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => setUploadDoc(doc)}
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Upload
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setPreviewDoc(doc)}
                            title="Preview"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Download">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setUploadDoc(doc)}
                            title="Replace"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setVersionDoc(doc)}
                            title="Version History"
                          >
                            <History className="h-3.5 w-3.5" />
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

      {/* Upload Dialog */}
      <UploadDialog document={uploadDoc} open={!!uploadDoc} onClose={() => setUploadDoc(null)} />

      {/* Preview Drawer */}
      <PreviewDrawer
        document={previewDoc}
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      {/* Version History Dialog */}
      <VersionHistoryDialog
        document={versionDoc}
        open={!!versionDoc}
        onClose={() => setVersionDoc(null)}
      />
    </>
  );
}

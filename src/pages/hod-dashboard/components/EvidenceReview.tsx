import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Download,
  History,
  FileText,
  Image,
  FileSpreadsheet,
  Filter,
} from 'lucide-react';
import { evidenceData, EvidenceItem } from '../hod-configs';

export function EvidenceReview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [repositoryFilter, setRepositoryFilter] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<EvidenceItem | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [reviewNote, setReviewNote] = useState('');

  const filteredData = evidenceData.filter(item => {
    const matchesSearch =
      item.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.section.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesRepo = repositoryFilter === 'all' || item.repository === repositoryFilter;
    return matchesSearch && matchesStatus && matchesRepo;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Rejected
          </Badge>
        );
      case 'changes-requested':
        return (
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            Changes Requested
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'image':
        return <Image className="h-4 w-4 text-blue-500" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleAction = (action: string, item: EvidenceItem) => {
    if (action === 'preview') {
      setSelectedDocument(item);
      setShowViewer(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents, sections, or uploaded by..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="changes-requested">Changes Requested</SelectItem>
                </SelectContent>
              </Select>
              <Select value={repositoryFilter} onValueChange={setRepositoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Repository" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Repositories</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Alumni">Alumni</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Evidence Documents</CardTitle>
            <Badge variant="outline">{filteredData.length} documents</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Document</th>
                  <th className="text-left p-3 font-medium">Repository</th>
                  <th className="text-left p-3 font-medium">Section</th>
                  <th className="text-left p-3 font-medium">Uploaded By</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => (
                  <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getFileIcon(item.fileType)}
                        <span className="font-medium truncate max-w-[200px]">
                          {item.documentName}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{item.repository}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">{item.section}</td>
                    <td className="p-3 text-muted-foreground">{item.uploadedBy}</td>
                    <td className="p-3 text-muted-foreground text-xs">{item.documentCategory}</td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(item.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">{getStatusBadge(item.status)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleAction('preview', item)}
                          title="Preview"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {item.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-green-600 hover:text-green-700"
                              title="Approve"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-600 hover:text-red-700"
                              title="Reject"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-purple-600 hover:text-purple-700"
                              title="Request Changes"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Download">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Version History"
                        >
                          <History className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Document Viewer Dialog */}
      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && getFileIcon(selectedDocument.fileType)}
              {selectedDocument?.documentName}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Preview Area */}
            <div className="lg:col-span-2 bg-muted/30 rounded-lg p-6 min-h-[400px] flex items-center justify-center border">
              <div className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Document Preview</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedDocument?.documentName}
                </p>
              </div>
            </div>
            {/* Details Panel */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Document Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Repository</span>
                    <span>{selectedDocument?.repository}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Section</span>
                    <span>{selectedDocument?.section}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uploaded By</span>
                    <span>{selectedDocument?.uploadedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span>
                      {selectedDocument &&
                        new Date(selectedDocument.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    {selectedDocument && getStatusBadge(selectedDocument.status)}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Review Notes</h4>
                <Textarea
                  placeholder="Add review notes..."
                  value={reviewNote}
                  onChange={e => setReviewNote(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Version History</h4>
                <div className="space-y-2">
                  <div className="text-xs p-2 bg-muted/50 rounded">
                    <p className="font-medium">v1.0 - Original Upload</p>
                    <p className="text-muted-foreground">
                      {selectedDocument &&
                        new Date(selectedDocument.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowViewer(false)}>
              Close
            </Button>
            {selectedDocument?.status === 'pending' && (
              <>
                <Button variant="destructive" size="sm">
                  Reject
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm">
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

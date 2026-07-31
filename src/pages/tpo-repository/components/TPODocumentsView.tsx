import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Search,
  Upload,
  Download,
  Eye,
  FileText,
  FolderOpen,
  ArrowLeft,
  Calendar,
  User,
} from 'lucide-react';
import { tpoDocumentCategories } from '../tpo-configs';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadDate: string;
  size: string;
  status: 'Verified' | 'Pending' | 'Under Review';
}

const sampleDocuments: Record<string, Document[]> = {
  'placement-reports': [
    {
      id: '1',
      name: 'Annual_Placement_Report_2023-24.pdf',
      type: 'PDF',
      uploadedBy: 'Vikram Mehta',
      uploadDate: '2024-06-30',
      size: '4.8 MB',
      status: 'Verified',
    },
    {
      id: '2',
      name: 'Placement_Statistics_Summary_2023-24.xlsx',
      type: 'Excel',
      uploadedBy: 'TPO Office',
      uploadDate: '2024-07-15',
      size: '1.2 MB',
      status: 'Verified',
    },
    {
      id: '3',
      name: 'Department_Wise_Placement_2023-24.pdf',
      type: 'PDF',
      uploadedBy: 'Vikram Mehta',
      uploadDate: '2024-07-01',
      size: '2.5 MB',
      status: 'Verified',
    },
  ],
  'mou-agreements': [
    {
      id: '1',
      name: 'MoU_TCS_Campus_Recruitment_2024.pdf',
      type: 'PDF',
      uploadedBy: 'TPO Office',
      uploadDate: '2024-03-15',
      size: '1.8 MB',
      status: 'Verified',
    },
    {
      id: '2',
      name: 'MoU_Infosys_InStep_Program.pdf',
      type: 'PDF',
      uploadedBy: 'TPO Office',
      uploadDate: '2024-04-01',
      size: '2.1 MB',
      status: 'Verified',
    },
    {
      id: '3',
      name: 'Agreement_Deloitte_Hiring_2024.pdf',
      type: 'PDF',
      uploadedBy: 'Vikram Mehta',
      uploadDate: '2024-05-20',
      size: '1.5 MB',
      status: 'Under Review',
    },
  ],
  'offer-letters': [
    {
      id: '1',
      name: 'Offer_Google_DivyaSharma_CS.pdf',
      type: 'PDF',
      uploadedBy: 'Student',
      uploadDate: '2024-10-10',
      size: '890 KB',
      status: 'Verified',
    },
    {
      id: '2',
      name: 'Offer_Deloitte_MeeraPatel_EC.pdf',
      type: 'PDF',
      uploadedBy: 'Student',
      uploadDate: '2024-11-25',
      size: '750 KB',
      status: 'Verified',
    },
  ],
};

export function TPODocumentsView() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentDocs = selectedCategory ? sampleDocuments[selectedCategory] || [] : [];
  const filteredDocs = currentDocs.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Under Review':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return '';
    }
  };

  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Supporting Documents</h3>
            <p className="text-sm text-muted-foreground">
              Manage placement and training documents organized by category
            </p>
          </div>
          <Button size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tpoDocumentCategories.map(category => (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{category.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{category.count} documents</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const categoryLabel = tpoDocumentCategories.find(c => c.id === selectedCategory)?.label || '';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedCategory(null);
            setSearchQuery('');
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h3 className="text-lg font-semibold">{categoryLabel}</h3>
          <p className="text-xs text-muted-foreground">{filteredDocs.length} documents</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No documents found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {doc.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        {doc.uploadedBy}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {doc.uploadDate}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{doc.size}</TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

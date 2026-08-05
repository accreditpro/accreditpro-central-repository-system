import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Map,
  FileCheck,
  Flame,
  BookOpen,
  Monitor,
  Leaf,
  Zap,
  Droplets,
  Award,
  ShieldCheck,
  FileText,
  Shield,
  Search,
  Upload,
  Download,
  Eye,
  MoreHorizontal,
  FolderOpen,
} from 'lucide-react';
import { infrastructureDocumentCategories } from '../infrastructure-configs';
import { EvidenceUploadDialog, EvidenceCategory } from '@/components/shared/EvidenceUploadDialog';
import { useReadOnly } from '@/hooks/useReadOnly';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Map, FileCheck, Flame, BookOpen, Monitor, Leaf, Zap, Droplets, Award, ShieldCheck, FileText, Shield,
};

const uploadCategories: EvidenceCategory[] = infrastructureDocumentCategories.map((c) => ({
  id: c.id,
  label: c.label,
  description: `Upload evidence documents for ${c.label.toLowerCase()}`,
  icon: (() => {
    const IconComponent = iconMap[c.icon] || FileText;
    return <IconComponent className="h-4 w-4 text-primary" />;
  })(),
}));

const mockDocuments = [
  { id: '1', name: 'Campus Master Plan 2024.pdf', category: 'campus-master-plan', uploadedBy: 'Mr. Rajesh Kumar', uploadedDate: '2025-01-10', size: '4.2 MB', status: 'verified' as const },
  { id: '2', name: 'Building A - Occupancy Certificate.pdf', category: 'building-approval', uploadedBy: 'Mr. Rajesh Kumar', uploadedDate: '2025-01-09', size: '1.8 MB', status: 'verified' as const },
  { id: '3', name: 'Fire Safety Certificate - Block A.pdf', category: 'fire-safety', uploadedBy: 'Mr. Rajesh Kumar', uploadedDate: '2025-01-08', size: '2.1 MB', status: 'verified' as const },
  { id: '4', name: 'Library Annual Report 2024-25.pdf', category: 'library-reports', uploadedBy: 'Mr. Rajesh Kumar', uploadedDate: '2025-01-07', size: '3.5 MB', status: 'pending' as const },
  { id: '5', name: 'Network Diagram 2025.pdf', category: 'ict-reports', uploadedBy: 'Mr. Rajesh Kumar', uploadedDate: '2025-01-06', size: '1.2 MB', status: 'verified' as const },
  { id: '6', name: 'Green Audit Report 2024.pdf', category: 'green-audit', uploadedBy: 'Mr. Rajesh Kumar', uploadedDate: '2025-01-05', size: '5.8 MB', status: 'pending' as const },
  { id: '7', name: 'Energy Audit Report 2024.pdf', category: 'energy-audit', uploadedBy: 'Mr. Rajesh Kumar', uploadedDate: '2025-01-04', size: '4.1 MB', status: 'uploaded' as const },
  { id: '8', name: 'Calibration Certificate - Physics Lab.pdf', category: 'calibration-certificates', uploadedBy: 'Mr. Rajesh Kumar', uploadedDate: '2025-01-03', size: '0.8 MB', status: 'verified' as const },
  { id: '9', name: 'Lab Safety Certificate - Chemistry.pdf', category: 'laboratory-safety', uploadedBy: 'Mr. Rajesh Kumar', uploadedDate: '2025-01-02', size: '1.1 MB', status: 'verified' as const },
  { id: '10', name: 'AMC - Server Room Equipment.pdf', category: 'amc-documents', uploadedBy: 'Mr. Rajesh Kumar', uploadedDate: '2025-01-01', size: '0.9 MB', status: 'pending' as const },
];

export const InfrastructureDocumentsView = () => {
  const isReadOnly = useReadOnly();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<EvidenceCategory | null>(null);

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
      case 'uploaded': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Supporting Documents</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage infrastructure supporting documents and evidence</p>
        </div>
        {!isReadOnly && (
          <Button className="gap-2" onClick={() => { setUploadTarget(null); setUploadDialogOpen(true); }}>
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        )}
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {infrastructureDocumentCategories.map((category, index) => {
          const IconComponent = iconMap[category.icon] || FileText;
          const isSelected = selectedCategory === category.id;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card
                className={`border shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-primary border-primary' : ''
                }`}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                onDoubleClick={() => {
                  if (isReadOnly) return;
                  setUploadTarget(uploadCategories.find((c) => c.id === category.id) || null);
                  setUploadDialogOpen(true);
                }}
              >
                <CardContent className="p-3 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 rounded-lg bg-muted">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-xs font-medium leading-tight">{category.label}</p>
                  <Badge variant="secondary" className="mt-1.5 text-[10px]">{category.count} files</Badge>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Documents List */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            {selectedCategory
              ? infrastructureDocumentCategories.find(c => c.id === selectedCategory)?.label
              : 'All Documents'
            }
            <Badge variant="secondary" className="ml-2">{filteredDocuments.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
                  <FileText className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.uploadedBy} • {doc.uploadedDate} • {doc.size}
                  </p>
                </div>
                <Badge className={`text-[10px] ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </Badge>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredDocuments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No documents found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Evidence Upload Dialog */}
      <EvidenceUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        title={uploadTarget?.label || 'Infrastructure Supporting Documents'}
        subtitle={
          uploadTarget
            ? `Upload supporting documents for ${uploadTarget.label.toLowerCase()}`
            : 'Upload supporting documents across all infrastructure categories'
        }
        categories={uploadTarget ? [uploadTarget] : uploadCategories}
      />
    </div>
  );
};
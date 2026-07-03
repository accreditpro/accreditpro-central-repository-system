import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload, FolderOpen, FileText } from 'lucide-react';
import { studentDevDocumentCategories } from '../student-development-configs';

export function StudentDevelopmentDocumentsView() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = studentDevDocumentCategories.filter((cat) =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDocuments = studentDevDocumentCategories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Supporting Documents</h3>
          <p className="text-sm text-muted-foreground">
            Manage evidence documents, certificates, and reports for student development activities
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="text-sm py-1 px-3">
          <FolderOpen className="h-4 w-4 mr-1.5" />
          {filteredCategories.length} Categories
        </Badge>
        <Badge variant="outline" className="text-sm py-1 px-3">
          <FileText className="h-4 w-4 mr-1.5" />
          {totalDocuments} Total Documents
        </Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search document categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Document Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer group">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                  {category.label}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FolderOpen className="h-3.5 w-3.5" />
                <span>{category.count} documents available</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
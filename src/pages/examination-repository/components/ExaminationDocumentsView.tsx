import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Upload, FileText, Download, Eye } from 'lucide-react';
import { examDocumentCategories } from '../examination-configs';

export function ExaminationDocumentsView() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = examDocumentCategories.filter(cat =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDocuments = examDocumentCategories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Supporting Documents</h2>
          <p className="text-muted-foreground">
            {totalDocuments} documents across {examDocumentCategories.length} categories
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search document categories..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map(category => (
          <Card
            key={category.id}
            className="hover:shadow-md transition-shadow cursor-pointer group"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  {category.label}
                </span>
                <Badge variant="secondary">{category.count}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <Eye className="h-3 w-3" />
                  View
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <Download className="h-3 w-3" />
                  Download
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <Upload className="h-3 w-3" />
                  Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No categories found matching &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  );
}

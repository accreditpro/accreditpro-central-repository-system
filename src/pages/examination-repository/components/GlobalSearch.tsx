import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Calendar,
  FileEdit,
  BadgeCheck,
  Repeat,
  AlertTriangle,
  FileText,
  Sparkles,
  Clock,
} from 'lucide-react';
import { allModuleConfigs } from '../examination-configs';

// Collect all records from all module configs
const allRecords = allModuleConfigs.flatMap((config) =>
  config.sampleData.map((record) => ({
    moduleId: config.id,
    moduleLabel: config.label,
    moduleIcon: config.icon,
    record,
  }))
);

const moduleIconMap: Record<string, React.ElementType> = {
  'examination-schedules': Calendar,
  'examination-circulars': FileEdit,
  'result-publications': BadgeCheck,
  'supplementary-examinations': Repeat,
  'backlog-repository': AlertTriangle,
  documents: FileText,
};

const filters = [
  { label: 'All Modules', value: 'all' },
  ...allModuleConfigs.map((c) => ({ label: c.label, value: c.id })),
  { label: 'Supporting Documents', value: 'documents' },
];

export function GlobalSearch({ academicYear }: { academicYear: string }) {
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const results = query
    ? allRecords.filter((item) => {
        if (moduleFilter !== 'all' && item.moduleId !== moduleFilter) return false;
        return Object.values(item.record).some((val) =>
          String(val).toLowerCase().includes(query.toLowerCase())
        );
      })
    : [];

  const getIcon = (moduleId: string) => {
    const Icon = moduleIconMap[moduleId] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Global Search</h2>
        <p className="text-muted-foreground">
          Search across all examination modules and supporting documents
        </p>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-primary/0 border-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search schedules, circulars, results, documents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-12 text-base"
                autoFocus
              />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-44 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filters.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {query && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">
              Found <strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for{' '}
              <strong className="text-foreground">"{query}"</strong>
              {moduleFilter !== 'all' && (
                <span>
                  {' '}in <Badge variant="secondary">{filters.find((f) => f.value === moduleFilter)?.label}</Badge>
                </span>
              )}
            </p>
          </div>

          {results.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Try different keywords or select a different module
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {results.slice(0, 50).map((item, idx) => {
                const firstField = Object.entries(item.record).find(
                  ([key, val]) =>
                    String(val).toLowerCase().includes(query.toLowerCase()) && key !== 'status'
                );
                return (
                  <Card key={idx} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          {getIcon(item.moduleId)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {item.record.title || item.record.examinationName || item.record.circularNumber || item.record.subjectName || Object.values(item.record).find((v) => typeof v === 'string' && v.length > 10) || 'Record'}
                            </p>
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              {item.moduleLabel}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {Object.entries(item.record)
                              .filter(([key]) => key !== 'id' && key !== 'status')
                              .slice(0, 4)
                              .map(([key, val]) => (
                                <span key={key} className="truncate max-w-[150px]">
                                  {String(val)}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {results.length > 50 && (
                <p className="text-center text-xs text-muted-foreground pt-2">
                  Showing 50 of {results.length} results. Refine your search for more specific results.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">Search Across All Modules</h3>
          <p className="text-sm text-muted-foreground/70 mt-1 max-w-md mx-auto">
            Type a keyword above to search across examination schedules, circulars, result publications,
            supplementary examinations, backlog records, and supporting documents.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Badge variant="outline" className="cursor-pointer" onClick={() => setQuery('2024-25')}>
              <Calendar className="h-3 w-3 mr-1" />
              2024-25
            </Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => setQuery('Published')}>
              <BadgeCheck className="h-3 w-3 mr-1" />
              Published
            </Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => setQuery('B.Tech')}>
              <FileText className="h-3 w-3 mr-1" />
              B.Tech
            </Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => setQuery('Supplementary')}>
              <Repeat className="h-3 w-3 mr-1" />
              Supplementary
            </Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => setQuery('Circular')}>
              <FileEdit className="h-3 w-3 mr-1" />
              Circular
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

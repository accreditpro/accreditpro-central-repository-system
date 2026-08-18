import { useState, useEffect, useMemo, useRef } from 'react';
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
  Sparkles,
  Loader2,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { allModuleConfigs } from '../examination-configs';
import { examinationRepositoryService, GlobalSearchResult } from '@/services/examination-repository.service';

const moduleIconMap: Record<string, React.ElementType> = {
  'examination-schedules': Calendar,
  'examination-circulars': FileEdit,
  'result-publications': BadgeCheck,
  'supplementary-examinations': Repeat,
  'backlog-repository': AlertTriangle,
};

// The backend global search covers the five record modules. Supporting
// documents are not searched server-side, so no documents filter is offered.
const filters = [
  { label: 'All Modules', value: 'all' },
  ...allModuleConfigs.map((c) => ({ label: c.label, value: c.id })),
];

const SUGGESTIONS = [
  { label: '2024-25', icon: Calendar },
  { label: 'Published', icon: BadgeCheck },
  { label: 'B.Tech', icon: FileText },
  { label: 'Supplementary', icon: Repeat },
  { label: 'Circular', icon: FileEdit },
];

export function GlobalSearch({ academicYear }: { academicYear: string }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [moduleCounts, setModuleCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 500);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setTotalResults(0);
      setModuleCounts({});
      setSearched(false);
      setLoadError(null);
      return;
    }
    const seq = ++requestSeq.current;
    setLoading(true);
    setLoadError(null);
    setSearched(true);
    examinationRepositoryService
      .globalSearch({
        query: debouncedQuery,
        academicYear,
        moduleId: moduleFilter !== 'all' ? moduleFilter : undefined,
        page: 0,
        size: 50,
      })
      .then((data) => {
        if (seq !== requestSeq.current) return;
        setResults(data.results);
        setTotalResults(data.totalResults);
        setModuleCounts(data.moduleCounts);
      })
      .catch((err) => {
        if (seq !== requestSeq.current) return;
        const msg = err instanceof Error ? err.message : 'Search failed';
        setLoadError(msg);
        setResults([]);
        setTotalResults(0);
        toast.error(msg);
      })
      .finally(() => {
        if (seq === requestSeq.current) setLoading(false);
      });
  }, [debouncedQuery, moduleFilter, academicYear]);

  const getIcon = (moduleId: string) => {
    const Icon = moduleIconMap[moduleId] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const matchedSnippet = (r: GlobalSearchResult) => {
    return Object.entries(r.matchedFields || {})
      .slice(0, 4)
      .map(([key, val]) => (
        <span key={key} className="truncate max-w-[150px]">
          {String(val ?? '')}
        </span>
      ));
  };

  const displayTitle = (r: GlobalSearchResult) => r.recordTitle || 'Record';

  const moduleLabel = (id: string) =>
    filters.find((f) => f.value === id)?.label || id;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Global Search</h2>
        <p className="text-muted-foreground">
          Search across all examination modules
        </p>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-primary/0 border-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search schedules, circulars, results, supplementary exams, backlog..."
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

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!loading && searched && loadError && (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-destructive">{loadError}</p>
          </CardContent>
        </Card>
      )}

      {!loading && searched && !loadError && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">
                Found <strong>{totalResults}</strong> result{totalResults !== 1 ? 's' : ''} for{' '}
                <strong className="text-foreground">"{debouncedQuery}"</strong>
                {moduleFilter !== 'all' && (
                  <span>
                    {' '}in <Badge variant="secondary">{moduleLabel(moduleFilter)}</Badge>
                  </span>
                )}
              </p>
            </div>
            {moduleFilter === 'all' && Object.keys(moduleCounts).length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {Object.entries(moduleCounts)
                  .filter(([, count]) => count > 0)
                  .map(([id, count]) => (
                    <Badge key={id} variant="outline" className="text-[10px] gap-1">
                      {getIcon(id)}
                      {moduleLabel(id)}: {count}
                    </Badge>
                  ))}
              </div>
            )}
          </div>

          {totalResults === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No results found for "{debouncedQuery}"</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Try different keywords or select a different module
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {results.map((item, idx) => (
                <Card key={`${item.moduleId}-${item.recordId}-${idx}`} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        {getIcon(item.moduleId)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{displayTitle(item)}</p>
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            {item.moduleLabel || moduleLabel(item.moduleId)}
                          </Badge>
                          {item.status && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] shrink-0 ${
                                item.status === 'Published'
                                  ? 'text-emerald-600 border-emerald-200'
                                  : item.status === 'Draft'
                                  ? 'text-amber-600 border-amber-200'
                                  : ''
                              }`}
                            >
                              {item.status}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          {matchedSnippet(item)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {totalResults > results.length && (
                <p className="text-center text-xs text-muted-foreground pt-2">
                  Showing {results.length} of {totalResults} results. Refine your search for more specific results.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {!searched && !loading && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">Search Across All Modules</h3>
          <p className="text-sm text-muted-foreground/70 mt-1 max-w-md mx-auto">
            Type a keyword above to search across examination schedules, circulars, result publications,
            supplementary examinations, and backlog records.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {SUGGESTIONS.map((s) => (
              <Badge key={s.label} variant="outline" className="cursor-pointer" onClick={() => setQuery(s.label)}>
                <s.icon className="h-3 w-3 mr-1" />
                {s.label}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

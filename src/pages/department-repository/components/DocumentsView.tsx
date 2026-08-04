import { useMemo, useState } from 'react';
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
import { evidenceDocuments, coordinatorContext } from '../repository-configs';
import { useAppSelector } from '@/store';
import { evidenceReviewKey, selectReviews } from '@/store/slices/evidenceReviewSlice';
import { EvidenceUploadDialog, EvidenceCategory } from '@/components/shared/EvidenceUploadDialog';
import {
  Search,
  Upload,
  Eye,
  Download,
  Replace,
  FileText,
  Filter,
  BookOpen,
  GraduationCap,
  Users,
  FlaskConical,
  HeartHandshake,
  Award,
  ShieldCheck,
  MessageSquareWarning,
} from 'lucide-react';

const uploadCategories: EvidenceCategory[] = [
  { id: 'curriculum', label: 'Curriculum & Courses', icon: <BookOpen className="h-4 w-4 text-primary" /> },
  { id: 'faculty', label: 'Faculty Profiles', icon: <Users className="h-4 w-4 text-primary" /> },
  { id: 'students', label: 'Student Records', icon: <GraduationCap className="h-4 w-4 text-primary" /> },
  { id: 'research', label: 'Research & Publications', icon: <FlaskConical className="h-4 w-4 text-primary" /> },
  { id: 'student-development', label: 'Student Development & Outcomes', icon: <HeartHandshake className="h-4 w-4 text-primary" /> },
  { id: 'other', label: 'Other Documents', icon: <FileText className="h-4 w-4 text-primary" /> },
];

// Maps each coordinator document category to the matching HOD evidence category,
// so the coordinator can see the HOD's review decision (and comments) per document.
const HOD_MATCH: Record<string, { repository: string; section: string; category: string }> = {
  'Academic Calendar': { repository: 'Academic', section: 'Academic Calendar', category: 'Department Academic Calendar PDF' },
  'Value Added Courses': { repository: 'Academic', section: 'Value Added Courses', category: 'Certificates' },
  'Add-on Programs': { repository: 'Academic', section: 'Add-on Programs', category: 'Program Brochure' },
  'Academic Timetable': { repository: 'Academic', section: 'Academic Timetable', category: 'Timetable PDF' },
  'Faculty Profiles': { repository: 'Faculty', section: 'Faculty Profile', category: 'Appointment Order' },
  'Publications': { repository: 'Research', section: 'Faculty Journal Publications', category: 'Published Journal Paper (PDF)' },
  'Curriculum': { repository: 'Course', section: 'Course File', category: 'Course File (Syllabus)' },
  'Courses': { repository: 'Course', section: 'Course Outcomes', category: 'Course Outcomes (COs)' },
};

const REVIEW_META: Record<string, { label: string; badge: string }> = {
  pending: { label: 'Awaiting Review', badge: 'bg-amber-500/10 text-amber-600' },
  approved: { label: 'Approved', badge: 'bg-emerald-500/10 text-emerald-600' },
  rejected: { label: 'Rejected', badge: 'bg-red-500/10 text-red-600' },
  'changes-requested': { label: 'Changes Requested', badge: 'bg-purple-500/10 text-purple-600' },
};

export const DocumentsView = () => {
  const reviews = useAppSelector(selectReviews);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reviewFilter, setReviewFilter] = useState<string>('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<EvidenceCategory | null>(null);
  const year = coordinatorContext.academicYear;

  const categories = [...new Set(evidenceDocuments.map(d => d.category))];

  // Priority used when falling back to a section-level decision.
  const reviewRank: Record<string, number> = { approved: 1, pending: 2, 'changes-requested': 3, rejected: 4 };

  const getDocReview = (category: string) => {
    const match = HOD_MATCH[category];
    if (!match) return null;
    const exact = reviews[evidenceReviewKey(year, match.repository, match.section, match.category)];
    if (exact) return exact;
    // Fallback: surface the most actionable HOD decision anywhere in the section.
    const prefix = `${year}::${match.repository}::${match.section}::`;
    const sectionEntries = Object.entries(reviews)
      .filter(([key]) => key.startsWith(prefix))
      .map(([, entry]) => entry);
    if (sectionEntries.length === 0) return null;
    return [...sectionEntries].sort((a, b) => reviewRank[b.status] - reviewRank[a.status])[0] ?? null;
  };

  // Evidence the HOD has sent back with feedback (rejected / changes requested).
  const actionItems = useMemo(() => {
    const prefix = `${year}::`;
    const items: { repository: string; section: string; category: string; status: string; note?: string }[] = [];
    for (const [key, entry] of Object.entries(reviews)) {
      if (!key.startsWith(prefix)) continue;
      if (entry.status !== 'rejected' && entry.status !== 'changes-requested') continue;
      const [, repository, section, category] = key.split('::');
      items.push({ repository, section, category, status: entry.status, note: entry.note });
    }
    return items;
  }, [reviews, year]);

  const filteredDocs = evidenceDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const review = getDocReview(doc.category);
    // Only documents tracked in HOD review participate in the review filter.
    const matchesReview = reviewFilter === 'all' || (review !== null && review.status === reviewFilter);
    return matchesSearch && matchesCategory && matchesStatus && matchesReview;
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
          { label: 'Total Documents', value: evidenceDocuments.length, color: 'text-indigo-600 bg-indigo-500/10' },
          { label: 'Verified', value: evidenceDocuments.filter(d => d.status === 'verified').length, color: 'text-emerald-600 bg-emerald-500/10' },
          { label: 'Pending', value: evidenceDocuments.filter(d => d.status === 'pending').length, color: 'text-amber-600 bg-amber-500/10' },
          { label: 'Rejected', value: evidenceDocuments.filter(d => d.status === 'rejected').length, color: 'text-red-600 bg-red-500/10' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className={cn('text-xl font-bold mt-1', stat.color.split(' ')[0])}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* HOD feedback banner */}
      {actionItems.length > 0 && (
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              <MessageSquareWarning className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                {actionItems.length} document{actionItems.length !== 1 ? 's' : ''} returned by HOD with feedback
              </p>
              <div className="mt-2 space-y-1.5">
                {actionItems.slice(0, 4).map((item) => (
                  <div key={`${item.section}::${item.category}`} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                    <Badge className={cn('text-[9px] shrink-0 mt-px', REVIEW_META[item.status]?.badge)}>
                      {REVIEW_META[item.status]?.label}
                    </Badge>
                    <span className="font-medium text-foreground">{item.repository} • {item.section} — {item.category}</span>
                    {item.note && <span className="truncate">“{item.note}”</span>}
                  </div>
                ))}
                {actionItems.length > 4 && (
                  <p className="text-[10px] text-muted-foreground">+{actionItems.length - 4} more…</p>
                )}
              </div>
            </div>
            <ShieldCheck className="h-4 w-4 text-purple-400 shrink-0 mt-1" />
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">Document Repository</CardTitle>
              <CardDescription className="text-xs">All evidence documents for your department</CardDescription>
            </div>
            <Button size="sm" className="text-xs h-8" onClick={() => { setUploadTarget(null); setUploadDialogOpen(true); }}>
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
            <Select value={reviewFilter} onValueChange={setReviewFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <ShieldCheck className="h-3 w-3 mr-1.5 text-purple-500" />
                <SelectValue placeholder="HOD Review" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All HOD Reviews</SelectItem>
                <SelectItem value="pending">Awaiting Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="changes-requested">Changes Requested</SelectItem>
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
                  <TableHead className="text-[10px]">HOD Review</TableHead>
                  <TableHead className="text-[10px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div>
                          <span className="text-xs font-medium block truncate max-w-[200px]">{doc.name}</span>
                          <span className="text-[10px] text-muted-foreground">{doc.size}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[9px]">{doc.category}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{doc.version}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{doc.uploadedDate}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{doc.uploadedBy}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn('text-[9px]',
                        doc.status === 'verified' && 'bg-emerald-500/10 text-emerald-600',
                        doc.status === 'pending' && 'bg-amber-500/10 text-amber-600',
                        doc.status === 'rejected' && 'bg-red-500/10 text-red-600',
                        doc.status === 'uploaded' && 'bg-blue-500/10 text-blue-600',
                      )}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const review = getDocReview(doc.category);
                        if (!review) {
                          return <span className="text-[10px] text-muted-foreground">—</span>;
                        }
                        const meta = REVIEW_META[review.status];
                        return (
                          <div
                            className="max-w-[180px]"
                            title={review.note ? `HOD: ${meta?.label}${review.reviewedBy ? ` by ${review.reviewedBy}` : ''}${review.reviewDate ? ` on ${review.reviewDate}` : ''}${review.note ? ` — ${review.note}` : ''}` : undefined}
                          >
                            <Badge className={cn('text-[9px]', meta?.badge)}>
                              {meta?.label}
                            </Badge>
                            {review.note && (
                              <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">{review.note}</p>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Eye className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Download className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Replace className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Upload Dialog */}
      <EvidenceUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        title={uploadTarget?.label || 'Department Supporting Documents'}
        subtitle={
          uploadTarget
            ? `Upload supporting documents for ${uploadTarget.label.toLowerCase()}`
            : 'Upload evidence & supporting documents across all department repositories'
        }
        categories={uploadTarget ? [uploadTarget] : uploadCategories}
      />
    </div>
  );
};
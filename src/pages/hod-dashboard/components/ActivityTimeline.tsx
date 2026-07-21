import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  CheckCircle2,
  XCircle,
  Upload,
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  Send,
  Filter,
} from 'lucide-react';
import { activityTimelineData } from '../hod-configs';

export function ActivityTimeline() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [repositoryFilter, setRepositoryFilter] = useState<string>('all');

  const filteredData = activityTimelineData.filter((item) => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesRepo = repositoryFilter === 'all' || item.repository === repositoryFilter;
    return matchesSearch && matchesType && matchesRepo;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submitted': return <Send className="h-4 w-4 text-blue-500" />;
      case 'uploaded': return <Upload className="h-4 w-4 text-purple-500" />;
      case 'approved': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'commented': return <MessageSquare className="h-4 w-4 text-amber-500" />;
      case 'returned': return <RotateCcw className="h-4 w-4 text-orange-500" />;
      case 'verified': return <ShieldCheck className="h-4 w-4 text-teal-500" />;
      default: return <Send className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'submitted': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'uploaded': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'commented': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'returned': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'verified': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="commented">Commented</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
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

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Activity Timeline</CardTitle>
            <Badge variant="outline">{filteredData.length} activities</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-4">
              {filteredData.map((activity) => (
                <div key={activity.id} className="relative flex items-start gap-4 pl-2">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-border">
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-medium">{activity.user}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={`text-xs ${getActivityColor(activity.type)}`}>
                            {activity.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{activity.repository}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredData.length > 0 && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm">Load More Activities</Button>
            </div>
          )}

          {filteredData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No activities found matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
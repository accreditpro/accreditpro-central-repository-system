import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Database,
  FolderCheck,
  Search,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileWarning,
} from 'lucide-react';
import { repositoryStatuses } from '../principal-configs';

const evidenceData = {
  mandatory: { total: 248, uploaded: 212, percentage: 85 },
  optional: { total: 156, uploaded: 98, percentage: 63 },
  missing: 36,
  expired: 8,
  pendingUploads: 24,
  pendingVerification: 18,
  repositoryWise: [
    { name: 'Academic', mandatory: 92, optional: 78, total: 88 },
    { name: 'Faculty', mandatory: 85, optional: 65, total: 78 },
    { name: 'Student', mandatory: 94, optional: 82, total: 90 },
    { name: 'Research', mandatory: 78, optional: 55, total: 70 },
    { name: 'Alumni', mandatory: 72, optional: 48, total: 63 },
    { name: 'Infrastructure', mandatory: 91, optional: 80, total: 87 },
    { name: 'Examination', mandatory: 96, optional: 88, total: 93 },
    { name: 'Financial', mandatory: 88, optional: 72, total: 82 },
    { name: 'Placement', mandatory: 82, optional: 60, total: 74 },
    { name: 'Compliance', mandatory: 95, optional: 85, total: 91 },
    { name: 'Student Dev.', mandatory: 76, optional: 52, total: 67 },
  ],
};

export function RepositoryHealth() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('repositories');

  const filteredRepos = repositoryStatuses.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="repositories" className="gap-2">
            <Database className="h-3.5 w-3.5" />
            Repository Health
          </TabsTrigger>
          <TabsTrigger value="evidence" className="gap-2">
            <FolderCheck className="h-3.5 w-3.5" />
            Evidence Readiness
          </TabsTrigger>
        </TabsList>

        <TabsContent value="repositories" className="mt-4 space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Repository Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map((repo) => (
              <Card key={repo.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{repo.name}</CardTitle>
                    <Badge variant="outline" className={`text-[10px] ${getQualityColor(repo.qualityScore)}`}>
                      Q: {repo.qualityScore}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">{repo.completion}%</span>
                    </div>
                    <Progress value={repo.completion} className="h-1.5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Evidence</span>
                      <span className="font-medium">{repo.evidence}%</span>
                    </div>
                    <Progress value={repo.evidence} className="h-1.5" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="text-center p-1.5 rounded bg-muted/50">
                      <p className="text-sm font-bold">{repo.pendingReviews}</p>
                      <p className="text-[9px] text-muted-foreground">Pending Reviews</p>
                    </div>
                    <div className="text-center p-1.5 rounded bg-muted/50">
                      <p className="text-sm font-bold">{repo.pendingVerification}</p>
                      <p className="text-[9px] text-muted-foreground">Pending Verification</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1">
                    <Clock className="h-3 w-3" />
                    Last updated: {repo.lastUpdated}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evidence" className="mt-4 space-y-4">
          {/* Evidence Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold">{evidenceData.mandatory.uploaded}/{evidenceData.mandatory.total}</p>
                <p className="text-[10px] text-muted-foreground">Mandatory Docs</p>
                <Progress value={evidenceData.mandatory.percentage} className="h-1 mt-1" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <FolderCheck className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold">{evidenceData.optional.uploaded}/{evidenceData.optional.total}</p>
                <p className="text-[10px] text-muted-foreground">Optional Docs</p>
                <Progress value={evidenceData.optional.percentage} className="h-1 mt-1" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <AlertCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-red-600">{evidenceData.missing}</p>
                <p className="text-[10px] text-muted-foreground">Missing Evidence</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <FileWarning className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-orange-600">{evidenceData.expired}</p>
                <p className="text-[10px] text-muted-foreground">Expired Evidence</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Clock className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-yellow-600">{evidenceData.pendingUploads}</p>
                <p className="text-[10px] text-muted-foreground">Pending Uploads</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Database className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-purple-600">{evidenceData.pendingVerification}</p>
                <p className="text-[10px] text-muted-foreground">Pending Verification</p>
              </CardContent>
            </Card>
          </div>

          {/* Repository-wise Evidence Completion */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Repository-wise Evidence Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Repository</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Mandatory</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Optional</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Overall</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground w-32">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidenceData.repositoryWise.map((repo) => (
                      <tr key={repo.name} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 px-3 font-medium">{repo.name}</td>
                        <td className="text-center py-2 px-3">
                          <span className={repo.mandatory >= 90 ? 'text-green-600' : repo.mandatory >= 75 ? 'text-yellow-600' : 'text-red-600'}>
                            {repo.mandatory}%
                          </span>
                        </td>
                        <td className="text-center py-2 px-3">
                          <span className={repo.optional >= 75 ? 'text-green-600' : repo.optional >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                            {repo.optional}%
                          </span>
                        </td>
                        <td className="text-center py-2 px-3 font-semibold">{repo.total}%</td>
                        <td className="py-2 px-3">
                          <Progress value={repo.total} className="h-2" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MessageSquare,
  Send,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { approvalQueueData, ApprovalItem } from '../hod-configs';

export function ApprovalQueue() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<string>('');
  const [comment, setComment] = useState('');

  const filteredData = approvalQueueData.filter((item) => {
    return item.repository.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getValidationBadge = (status: string) => {
    switch (status) {
      case 'valid': return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Valid</Badge>;
      case 'partial': return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Partial</Badge>;
      case 'invalid': return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Invalid</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium': return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">Medium</Badge>;
      case 'low': return <Badge variant="outline" className="text-xs">Low</Badge>;
      default: return <Badge variant="outline" className="text-xs">{priority}</Badge>;
    }
  };

  const handleAction = (action: string, item: ApprovalItem) => {
    setSelectedItem(item);
    setActionType(action);
    setShowActionDialog(true);
    setComment('');
  };

  const getActionTitle = () => {
    switch (actionType) {
      case 'approve': return 'Approve Submission';
      case 'reject': return 'Reject Submission';
      case 'return': return 'Return for Correction';
      case 'comment': return 'Add Comment';
      case 'forward': return 'Forward to IQAC';
      default: return 'Action';
    }
  };

  const pendingCount = approvalQueueData.length;
  const highPriority = approvalQueueData.filter(i => i.priority === 'high').length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Approvals</p>
              <p className="text-xl font-bold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">High Priority</p>
              <p className="text-xl font-bold">{highPriority}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Approved Today</p>
              <p className="text-xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Send className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Forwarded to IQAC</p>
              <p className="text-xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by repository, section, or submitted by..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Approval Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Pending Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Repository</th>
                  <th className="text-left p-3 font-medium">Section</th>
                  <th className="text-left p-3 font-medium">Submitted By</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Evidence</th>
                  <th className="text-left p-3 font-medium">Validation</th>
                  <th className="text-left p-3 font-medium">Priority</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <Badge variant="outline">{item.repository}</Badge>
                    </td>
                    <td className="p-3 font-medium">{item.section}</td>
                    <td className="p-3 text-muted-foreground">{item.submittedBy}</td>
                    <td className="p-3 text-muted-foreground">{new Date(item.submissionDate).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className="text-sm">{item.evidenceCount} files</span>
                    </td>
                    <td className="p-3">{getValidationBadge(item.validationStatus)}</td>
                    <td className="p-3">{getPriorityBadge(item.priority)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700" onClick={() => handleAction('approve', item)} title="Approve">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700" onClick={() => handleAction('reject', item)} title="Reject">
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600 hover:text-amber-700" onClick={() => handleAction('return', item)} title="Return for Correction">
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleAction('comment', item)} title="Comment">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:text-blue-700" onClick={() => handleAction('forward', item)} title="Forward to IQAC">
                          <Send className="h-3.5 w-3.5" />
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

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem && (
              <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                <p><span className="text-muted-foreground">Repository:</span> {selectedItem.repository}</p>
                <p><span className="text-muted-foreground">Section:</span> {selectedItem.section}</p>
                <p><span className="text-muted-foreground">Submitted By:</span> {selectedItem.submittedBy}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {actionType === 'comment' ? 'Comment' : 'Remarks'}
              </label>
              <Textarea
                placeholder={actionType === 'reject' ? 'Reason for rejection...' : actionType === 'return' ? 'What needs to be corrected...' : 'Add your comments...'}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>Cancel</Button>
            <Button
              className={
                actionType === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' :
                actionType === 'reject' ? 'bg-red-600 hover:bg-red-700 text-white' :
                actionType === 'forward' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                ''
              }
              onClick={() => setShowActionDialog(false)}
            >
              {actionType === 'approve' ? 'Approve' :
               actionType === 'reject' ? 'Reject' :
               actionType === 'return' ? 'Return' :
               actionType === 'forward' ? 'Forward to IQAC' :
               'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
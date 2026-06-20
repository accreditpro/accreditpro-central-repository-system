import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit2,
  KeyRound,
  UserCheck,
  UserX,
  Ban,
  Unlock,
  ChevronRight,
  ChevronLeft,
  Check,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { institutionUsers } from './mock-data';
import { InstitutionUser } from './types';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  blocked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const roleOptions = [
  'IQAC Coordinator',
  'Department Coordinator',
  'Research Coordinator',
  'Placement Officer',
  'Examination Officer',
  'Compliance Officer',
];

const departmentOptions = ['CSE', 'IT', 'AI&ML', 'AI&DS', 'ECE', 'EEE', 'MECH', 'CIVIL'];

// Create User Wizard
const CreateUserWizard = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: '',
    department: '',
  });

  const generatedUsername = formData.email.split('@')[0] || 'user';
  const generatedPassword = 'Temp@' + Math.random().toString(36).slice(2, 8);

  const steps = [
    { num: 1, title: 'Basic Details' },
    { num: 2, title: 'Role Selection' },
    { num: 3, title: 'Department' },
    { num: 4, title: 'Credentials' },
    { num: 5, title: 'Review' },
  ];

  const canProceed = () => {
    switch (step) {
      case 1: return formData.name && formData.email && formData.mobile;
      case 2: return formData.role;
      case 3: return formData.role !== 'Department Coordinator' || formData.department;
      default: return true;
    }
  };

  const handleCreate = () => {
    toast.success(`User ${formData.name} created successfully`);
    onClose();
    setStep(1);
    setFormData({ name: '', email: '', mobile: '', role: '', department: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-4">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                step > s.num ? 'bg-green-500 text-white' : step === s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s.num ? <Check className="h-3.5 w-3.5" /> : s.num}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${step > s.num ? 'bg-green-500' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm font-medium text-center mb-4">{steps[step - 1].title}</p>

        {/* Step Content */}
        <div className="min-h-[200px]">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Dr. John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john.doe@svce.ac.in" />
              </div>
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} placeholder="+91-9876543210" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {roleOptions.map((role) => (
                <div
                  key={role}
                  onClick={() => setFormData({ ...formData, role })}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.role === role ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{role}</span>
                    {formData.role === role && <Check className="h-4 w-4 text-primary" />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {formData.role === 'Department Coordinator' ? (
                <>
                  <p className="text-sm text-muted-foreground">Assign a department for this coordinator</p>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">Department assignment is only required for Department Coordinators</p>
                  <p className="text-xs text-muted-foreground mt-1">Click Next to continue</p>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">System generated credentials for the new user</p>
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Username</p>
                      <p className="font-mono text-sm font-medium">{generatedUsername}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(generatedUsername); toast.success('Copied'); }}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Temporary Password</p>
                      <p className="font-mono text-sm font-medium">{generatedPassword}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(generatedPassword); toast.success('Copied'); }}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <p className="text-xs text-amber-600">⚠️ User will be required to change password on first login</p>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">Review user details before creating</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Mobile</span>
                  <span className="font-medium">{formData.mobile}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium">{formData.role}</span>
                </div>
                {formData.department && (
                  <div className="flex justify-between py-1.5 border-b">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium">{formData.department}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Username</span>
                  <span className="font-mono font-medium">{generatedUsername}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            {step < 5 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleCreate}>Create User</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const UserManagementPage = () => {
  const [users, setUsers] = useState<InstitutionUser[]>(institutionUsers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleAction = (userId: string, action: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        switch (action) {
          case 'activate': return { ...u, status: 'active' as const };
          case 'deactivate': return { ...u, status: 'inactive' as const };
          case 'block': return { ...u, status: 'blocked' as const };
          case 'unblock': return { ...u, status: 'active' as const };
          default: return u;
        }
      })
    );
    toast.success(`User ${action}d successfully`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <Button onClick={() => setShowCreateWizard(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Institution Admin">Institution Admin</SelectItem>
                <SelectItem value="IQAC Coordinator">IQAC Coordinator</SelectItem>
                <SelectItem value="Department Coordinator">Dept. Coordinator</SelectItem>
                <SelectItem value="Research Coordinator">Research Coordinator</SelectItem>
                <SelectItem value="Placement Officer">Placement Officer</SelectItem>
                <SelectItem value="Examination Officer">Examination Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Mobile</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Department</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Last Login</th>
                  <th className="text-center py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{user.mobile}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">{user.role}</Badge>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">{user.department}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={`text-xs ${statusColors[user.status]}`}>{user.status}</Badge>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-xs text-muted-foreground">{user.lastLogin}</td>
                    <td className="py-3 px-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="h-3.5 w-3.5 mr-2" />View</DropdownMenuItem>
                          <DropdownMenuItem><Edit2 className="h-3.5 w-3.5 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem><KeyRound className="h-3.5 w-3.5 mr-2" />Reset Password</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status !== 'active' && (
                            <DropdownMenuItem onClick={() => handleAction(user.id, 'activate')}>
                              <UserCheck className="h-3.5 w-3.5 mr-2" />Activate
                            </DropdownMenuItem>
                          )}
                          {user.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleAction(user.id, 'deactivate')}>
                              <UserX className="h-3.5 w-3.5 mr-2" />Deactivate
                            </DropdownMenuItem>
                          )}
                          {user.status !== 'blocked' && (
                            <DropdownMenuItem onClick={() => handleAction(user.id, 'block')} className="text-red-600">
                              <Ban className="h-3.5 w-3.5 mr-2" />Block
                            </DropdownMenuItem>
                          )}
                          {user.status === 'blocked' && (
                            <DropdownMenuItem onClick={() => handleAction(user.id, 'unblock')}>
                              <Unlock className="h-3.5 w-3.5 mr-2" />Unblock
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateUserWizard open={showCreateWizard} onClose={() => setShowCreateWizard(false)} />
    </div>
  );
};
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  GraduationCap,
  Building2,
  Layers,
  Calendar,
  Plus,
  Search,
  BookOpen,
  Combine,
  Users,
  BarChart3,
  FileText,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  masterPrograms,
  departments,
  specializations,
  academicYears,
  academicRegulations,
  programOfferings,
  programIntakes,
} from './mock-data';
import {
  Program,
  Department,
  Specialization,
  AcademicYear,
  AcademicRegulation,
  ProgramOffering,
  ProgramIntake,
} from './types';

// Dashboard Tab
const DashboardTab = () => {
  const activePrograms = masterPrograms.filter((p) => p.status === 'active').length;
  const activeDepts = departments.filter((d) => d.status === 'active').length;
  const activeSpecs = specializations.filter((s) => s.status === 'active').length;
  const activeRegulations = academicRegulations.filter((r) => r.status === 'active').length;
  const activeOfferings = programOfferings.filter((o) => o.status === 'active').length;
  const totalIntake = programIntakes
    .filter((i) => i.academicYear === '2025-26')
    .reduce((sum, i) => sum + i.sanctionedIntake, 0);

  const cards = [
    { label: 'Academic Years', value: academicYears.length, icon: Calendar, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Programs', value: activePrograms, icon: GraduationCap, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Departments', value: activeDepts, icon: Building2, color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30' },
    { label: 'Specializations', value: activeSpecs, icon: Layers, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Regulations', value: activeRegulations, icon: BookOpen, color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30' },
    { label: 'Program Offerings', value: activeOfferings, icon: Combine, color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
    { label: 'Total Intake (2025-26)', value: totalIntake, icon: Users, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
  ];

  // Program Distribution
  const programDist = masterPrograms
    .filter((p) => p.status === 'active')
    .map((p) => ({
      name: p.name,
      departments: departments.filter((d) => d.program === p.name && d.status === 'active').length,
    }));

  // Department Distribution
  const deptDist = departments
    .filter((d) => d.status === 'active')
    .map((d) => ({
      name: d.code,
      offerings: programOfferings.filter((o) => o.departmentId === d.id).length,
    }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {cards.map((card) => (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className={`inline-flex p-2 rounded-lg ${card.color} mb-2`}>
                <card.icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Program Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {programDist.map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(p.departments / 12) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">{p.departments} depts</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Intake Trend (2025-26)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deptDist.filter((d) => d.offerings > 0).map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{d.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(d.offerings / 8) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12">{d.offerings} offerings</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Academic Years Tab
const AcademicYearsTab = () => {
  const [years, setYears] = useState<AcademicYear[]>(academicYears);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const setActive = (id: string) => {
    setYears((prev) =>
      prev.map((y) => ({ ...y, status: y.id === id ? 'active' : 'inactive' }))
    );
    toast.success('Active academic year updated');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Academic Years</h3>
          <p className="text-xs text-muted-foreground">Only one academic year can be active at a time. Cannot delete if repository data exists.</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Academic Year
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Academic Year</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Input placeholder="e.g., 2026-27" />
              </div>
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="inactive">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowAddDialog(false); toast.success('Academic year added'); }}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {years.map((year) => (
          <Card key={year.id} className={year.status === 'active' ? 'border-primary/50 bg-primary/5' : ''}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${year.status === 'active' ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Calendar className={`h-4 w-4 ${year.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-semibold">{year.year}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(year.startDate).toLocaleDateString()} - {new Date(year.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {year.status === 'active' ? (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setActive(year.id)}>
                    Set Active
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Programs Tab
const ProgramsTab = () => {
  const [programs, setPrograms] = useState<Program[]>(masterPrograms);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const toggleProgram = (id: string) => {
    setPrograms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled, status: p.enabled ? 'inactive' : 'active' } : p))
    );
    toast.success('Program status updated');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Programs</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Program
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Program</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Program Code *</Label>
                <Input placeholder="e.g., BSC" />
              </div>
              <div className="space-y-2">
                <Label>Program Name *</Label>
                <Input placeholder="e.g., B.Sc" />
              </div>
              <div className="space-y-2">
                <Label>Program Level *</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UG">UG</SelectItem>
                    <SelectItem value="PG">PG</SelectItem>
                    <SelectItem value="Doctoral">Doctoral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (Years) *</Label>
                <Input type="number" placeholder="e.g., 3" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowAddDialog(false); toast.success('Custom program added'); }}>Add Program</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Program Code</th>
              <th className="text-left py-3 px-4 font-medium">Program Name</th>
              <th className="text-left py-3 px-4 font-medium">Level</th>
              <th className="text-center py-3 px-4 font-medium">Duration</th>
              <th className="text-center py-3 px-4 font-medium">Status</th>
              <th className="text-center py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((program) => (
              <tr key={program.id} className="border-t hover:bg-muted/30">
                <td className="py-3 px-4 font-mono text-xs">{program.programCode}</td>
                <td className="py-3 px-4 font-medium">
                  {program.name}
                  {program.isCustom && <Badge variant="outline" className="ml-2 text-xs">Custom</Badge>}
                </td>
                <td className="py-3 px-4">
                  <Badge variant="secondary">{program.level}</Badge>
                </td>
                <td className="py-3 px-4 text-center">{program.duration} Years</td>
                <td className="py-3 px-4 text-center">
                  <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                    {program.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-center">
                  <Switch checked={program.enabled} onCheckedChange={() => toggleProgram(program.id)} className="scale-75" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Departments Tab
const DepartmentsTab = () => {
  const [depts, setDepts] = useState<Department[]>(departments);
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filtered = depts.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const toggleDept = (id: string) => {
    setDepts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled, status: d.enabled ? 'inactive' : 'active' } : d))
    );
    toast.success('Department status updated');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Department Code *</Label>
                <Input placeholder="e.g., AERO" />
              </div>
              <div className="space-y-2">
                <Label>Department Name *</Label>
                <Input placeholder="e.g., Aerospace Engineering" />
              </div>
              <div className="space-y-2">
                <Label>Program *</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                  <SelectContent>
                    {masterPrograms.filter((p) => p.status === 'active').map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Established Year</Label>
                <Input type="number" placeholder="e.g., 2020" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowAddDialog(false); toast.success('Department added'); }}>Add Department</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Code</th>
              <th className="text-left py-3 px-4 font-medium">Department Name</th>
              <th className="text-left py-3 px-4 font-medium">Program</th>
              <th className="text-center py-3 px-4 font-medium">Est. Year</th>
              <th className="text-center py-3 px-4 font-medium">Status</th>
              <th className="text-center py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((dept) => (
              <tr key={dept.id} className="border-t hover:bg-muted/30">
                <td className="py-3 px-4 font-mono text-xs">{dept.code}</td>
                <td className="py-3 px-4 font-medium">{dept.name}</td>
                <td className="py-3 px-4">{dept.program}</td>
                <td className="py-3 px-4 text-center">{dept.establishedYear || '-'}</td>
                <td className="py-3 px-4 text-center">
                  <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>
                    {dept.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-center">
                  <Switch checked={dept.enabled} onCheckedChange={() => toggleDept(dept.id)} className="scale-75" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Specializations Tab
const SpecializationsTab = () => {
  const [specs, setSpecs] = useState<Specialization[]>(specializations);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const grouped = specs.reduce<Record<string, Specialization[]>>((acc, s) => {
    if (!acc[s.departmentName]) acc[s.departmentName] = [];
    acc[s.departmentName].push(s);
    return acc;
  }, {});

  const toggleSpec = (id: string) => {
    setSpecs((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled, status: s.enabled ? 'inactive' : 'active' } : s)));
    toast.success('Specialization updated');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Department Specializations</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Specialization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Specialization</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Specialization Name *</Label>
                <Input placeholder="e.g., Machine Learning" />
              </div>
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.filter((d) => d.status === 'active').map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.code} - {d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowAddDialog(false); toast.success('Specialization added'); }}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([dept, items]) => (
          <Card key={dept}>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                {dept}
                <Badge variant="outline" className="ml-2 text-xs">{items.length} specializations</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {items.map((spec) => (
                  <div key={spec.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{spec.name}</span>
                      <Badge variant={spec.status === 'active' ? 'default' : 'secondary'} className="text-xs scale-90">
                        {spec.status}
                      </Badge>
                    </div>
                    <Switch checked={spec.enabled} onCheckedChange={() => toggleSpec(spec.id)} className="scale-75" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Academic Regulations Tab
const AcademicRegulationsTab = () => {
  const [regs] = useState<AcademicRegulation[]>(academicRegulations);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewReg, setViewReg] = useState<AcademicRegulation | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Academic Regulations</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Regulation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Academic Regulation</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div>
                <h4 className="text-sm font-semibold mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Regulation Code *</Label>
                    <Input placeholder="e.g., R24" />
                  </div>
                  <div className="space-y-2">
                    <Label>Regulation Name *</Label>
                    <Input placeholder="e.g., Regulation 2024" />
                  </div>
                  <div className="space-y-2">
                    <Label>Program *</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {masterPrograms.filter((p) => p.status === 'active').map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Academic Year Introduced *</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {academicYears.map((y) => (
                          <SelectItem key={y.id} value={y.year}>{y.year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Effective From Batch *</Label>
                    <Input placeholder="e.g., 2024" />
                  </div>
                  <div className="space-y-2">
                    <Label>Effective To Batch</Label>
                    <Input placeholder="e.g., 2027" />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration *</Label>
                    <Input type="number" placeholder="e.g., 4" />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select defaultValue="active">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Credit Structure</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Total Credits</Label><Input type="number" /></div>
                  <div className="space-y-2"><Label>Core Credits</Label><Input type="number" /></div>
                  <div className="space-y-2"><Label>Professional Elective Credits</Label><Input type="number" /></div>
                  <div className="space-y-2"><Label>Open Elective Credits</Label><Input type="number" /></div>
                  <div className="space-y-2"><Label>Laboratory Credits</Label><Input type="number" /></div>
                  <div className="space-y-2"><Label>Project Credits</Label><Input type="number" /></div>
                  <div className="space-y-2"><Label>Internship Credits</Label><Input type="number" /></div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Evaluation Scheme</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Internal Marks</Label><Input type="number" /></div>
                  <div className="space-y-2"><Label>External Marks</Label><Input type="number" /></div>
                  <div className="space-y-2"><Label>Passing Marks</Label><Input type="number" /></div>
                  <div className="space-y-2"><Label>Grading System</Label><Input placeholder="e.g., CGPA Based" /></div>
                  <div className="space-y-2"><Label>CGPA Scale</Label><Input type="number" /></div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowAddDialog(false); toast.success('Regulation added'); }}>Add Regulation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Code</th>
              <th className="text-left py-3 px-4 font-medium">Name</th>
              <th className="text-left py-3 px-4 font-medium">Program</th>
              <th className="text-center py-3 px-4 font-medium">Batch</th>
              <th className="text-center py-3 px-4 font-medium">Credits</th>
              <th className="text-center py-3 px-4 font-medium">Status</th>
              <th className="text-center py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {regs.map((reg) => (
              <tr key={reg.id} className="border-t hover:bg-muted/30">
                <td className="py-3 px-4 font-mono font-semibold">{reg.regulationCode}</td>
                <td className="py-3 px-4">{reg.regulationName}</td>
                <td className="py-3 px-4">{reg.program}</td>
                <td className="py-3 px-4 text-center text-xs">{reg.effectiveFromBatch} - {reg.effectiveToBatch}</td>
                <td className="py-3 px-4 text-center">{reg.creditStructure.totalCredits}</td>
                <td className="py-3 px-4 text-center">
                  <Badge variant={reg.status === 'active' ? 'default' : 'secondary'}>{reg.status}</Badge>
                </td>
                <td className="py-3 px-4 text-center">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewReg(reg)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Regulation Dialog */}
      <Dialog open={!!viewReg} onOpenChange={() => setViewReg(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewReg?.regulationCode} - {viewReg?.regulationName}</DialogTitle>
          </DialogHeader>
          {viewReg && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label className="text-xs text-muted-foreground">Program</Label><p className="text-sm font-medium">{viewReg.program}</p></div>
                <div><Label className="text-xs text-muted-foreground">Duration</Label><p className="text-sm font-medium">{viewReg.duration} Years</p></div>
                <div><Label className="text-xs text-muted-foreground">Effective Batch</Label><p className="text-sm font-medium">{viewReg.effectiveFromBatch} - {viewReg.effectiveToBatch}</p></div>
                <div><Label className="text-xs text-muted-foreground">Status</Label><Badge variant={viewReg.status === 'active' ? 'default' : 'secondary'}>{viewReg.status}</Badge></div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Credit Structure</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Total Credits</p><p className="text-lg font-bold">{viewReg.creditStructure.totalCredits}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Core</p><p className="text-lg font-bold">{viewReg.creditStructure.coreCredits}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Prof. Elective</p><p className="text-lg font-bold">{viewReg.creditStructure.professionalElectiveCredits}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Open Elective</p><p className="text-lg font-bold">{viewReg.creditStructure.openElectiveCredits}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Laboratory</p><p className="text-lg font-bold">{viewReg.creditStructure.laboratoryCredits}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Project</p><p className="text-lg font-bold">{viewReg.creditStructure.projectCredits}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Internship</p><p className="text-lg font-bold">{viewReg.creditStructure.internshipCredits}</p></div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Evaluation Scheme</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Internal</p><p className="text-lg font-bold">{viewReg.evaluationScheme.internalMarks}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">External</p><p className="text-lg font-bold">{viewReg.evaluationScheme.externalMarks}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Passing</p><p className="text-lg font-bold">{viewReg.evaluationScheme.passingMarks}%</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Grading</p><p className="text-sm font-bold">{viewReg.evaluationScheme.gradingSystem}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">CGPA Scale</p><p className="text-lg font-bold">{viewReg.evaluationScheme.cgpaScale}</p></div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Internship Requirements</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Internship Mandatory</span><Badge variant={viewReg.internshipRequirements.internshipMandatory ? 'default' : 'secondary'}>{viewReg.internshipRequirements.internshipMandatory ? 'Yes' : 'No'}</Badge></div>
                    {viewReg.internshipRequirements.internshipDuration && <div className="flex justify-between text-sm"><span>Duration</span><span className="font-medium">{viewReg.internshipRequirements.internshipDuration}</span></div>}
                    <div className="flex justify-between text-sm"><span>Industry Training</span><Badge variant={viewReg.internshipRequirements.industryTrainingMandatory ? 'default' : 'secondary'}>{viewReg.internshipRequirements.industryTrainingMandatory ? 'Yes' : 'No'}</Badge></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3">Project Requirements</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Mini Project</span><Badge variant={viewReg.projectRequirements.miniProjectMandatory ? 'default' : 'secondary'}>{viewReg.projectRequirements.miniProjectMandatory ? 'Yes' : 'No'}</Badge></div>
                    <div className="flex justify-between text-sm"><span>Major Project</span><Badge variant={viewReg.projectRequirements.majorProjectMandatory ? 'default' : 'secondary'}>{viewReg.projectRequirements.majorProjectMandatory ? 'Yes' : 'No'}</Badge></div>
                    <div className="flex justify-between text-sm"><span>Capstone Project</span><Badge variant={viewReg.projectRequirements.capstoneProjectMandatory ? 'default' : 'secondary'}>{viewReg.projectRequirements.capstoneProjectMandatory ? 'Yes' : 'No'}</Badge></div>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Approvals</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Approved By</Label><p className="text-sm font-medium">{viewReg.approvals.approvedBy}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Approval Date</Label><p className="text-sm font-medium">{viewReg.approvals.approvalDate}</p></div>
                  <div><Label className="text-xs text-muted-foreground">BoS Approval</Label><p className="text-sm font-medium">{viewReg.approvals.bosApproval}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Academic Council</Label><p className="text-sm font-medium">{viewReg.approvals.academicCouncilApproval}</p></div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Documents</h4>
                <div className="flex flex-wrap gap-2">
                  {viewReg.documents.map((doc) => (
                    <Badge key={doc} variant="outline" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Program Offerings Tab
const ProgramOfferingsTab = () => {
  const [offerings] = useState<ProgramOffering[]>(programOfferings);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterYear, setFilterYear] = useState<string>('all');

  const filtered = filterYear === 'all'
    ? offerings
    : offerings.filter((o) => o.academicYear === filterYear);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Program Offerings</h3>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-36 h-8">
              <SelectValue placeholder="Filter year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {academicYears.map((y) => (
                <SelectItem key={y.id} value={y.year}>{y.year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Offering
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Program Offering</DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground mb-4">
              A Program Offering combines: Program + Department + Specialization + Regulation
            </p>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Academic Year *</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {academicYears.map((y) => (
                      <SelectItem key={y.id} value={y.id}>{y.year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Program *</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {masterPrograms.filter((p) => p.status === 'active').map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {departments.filter((d) => d.status === 'active').map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.code} - {d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select (optional)" /></SelectTrigger>
                  <SelectContent>
                    {specializations.filter((s) => s.status === 'active').map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Regulation *</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {academicRegulations.filter((r) => r.status === 'active').map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.regulationCode} - {r.regulationName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (Years) *</Label>
                <Input type="number" placeholder="e.g., 4" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowAddDialog(false); toast.success('Program offering created'); }}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <p className="text-xs text-muted-foreground">
        No duplicate program offerings allowed. Only active masters can be selected.
      </p>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Generated Name</th>
              <th className="text-left py-3 px-4 font-medium">Academic Year</th>
              <th className="text-left py-3 px-4 font-medium">Program</th>
              <th className="text-left py-3 px-4 font-medium">Department</th>
              <th className="text-left py-3 px-4 font-medium">Specialization</th>
              <th className="text-left py-3 px-4 font-medium">Regulation</th>
              <th className="text-center py-3 px-4 font-medium">Duration</th>
              <th className="text-center py-3 px-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((offering) => (
              <tr key={offering.id} className="border-t hover:bg-muted/30">
                <td className="py-3 px-4 font-semibold text-primary">{offering.generatedName}</td>
                <td className="py-3 px-4">{offering.academicYear}</td>
                <td className="py-3 px-4">{offering.program}</td>
                <td className="py-3 px-4">{offering.department}</td>
                <td className="py-3 px-4">{offering.specialization}</td>
                <td className="py-3 px-4 font-mono text-xs">{offering.regulation}</td>
                <td className="py-3 px-4 text-center">{offering.duration}Y</td>
                <td className="py-3 px-4 text-center">
                  <Badge variant={offering.status === 'active' ? 'default' : 'secondary'}>{offering.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Program Intake Tab
const ProgramIntakeTab = () => {
  const [intakes] = useState<ProgramIntake[]>(programIntakes);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterYear, setFilterYear] = useState<string>('all');

  const filtered = filterYear === 'all'
    ? intakes
    : intakes.filter((i) => i.academicYear === filterYear);

  const totalSanctioned = filtered.reduce((s, i) => s + i.sanctionedIntake, 0);
  const totalAdmitted = filtered.reduce((s, i) => s + i.admittedIntake, 0);
  const totalVacant = filtered.reduce((s, i) => s + i.vacantSeats, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Program Intake</h3>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-36 h-8">
              <SelectValue placeholder="Filter year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {academicYears.map((y) => (
                <SelectItem key={y.id} value={y.year}>{y.year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Intake
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Program Intake</DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground mb-2">
              Vacant Seats = Sanctioned Intake - Admitted Intake
            </p>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Academic Year *</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {academicYears.map((y) => (
                      <SelectItem key={y.id} value={y.id}>{y.year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Program Offering *</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {programOfferings.filter((o) => o.status === 'active').map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.generatedName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Sanctioned Intake *</Label>
                  <Input type="number" placeholder="e.g., 120" />
                </div>
                <div className="space-y-2">
                  <Label>Admitted Intake *</Label>
                  <Input type="number" placeholder="e.g., 118" />
                </div>
                <div className="space-y-2">
                  <Label>Lateral Entry Intake</Label>
                  <Input type="number" placeholder="e.g., 12" />
                </div>
                <div className="space-y-2">
                  <Label>Vacant Seats (Auto)</Label>
                  <Input disabled placeholder="Auto calculated" className="bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Approval Authority</Label>
                <Input placeholder="e.g., AICTE" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowAddDialog(false); toast.success('Intake record added'); }}>Add Intake</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Sanctioned</p>
            <p className="text-xl font-bold text-blue-600">{totalSanctioned}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Admitted</p>
            <p className="text-xl font-bold text-green-600">{totalAdmitted}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Vacant</p>
            <p className="text-xl font-bold text-amber-600">{totalVacant}</p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Program Offering</th>
              <th className="text-left py-3 px-4 font-medium">Academic Year</th>
              <th className="text-center py-3 px-4 font-medium">Sanctioned</th>
              <th className="text-center py-3 px-4 font-medium">Admitted</th>
              <th className="text-center py-3 px-4 font-medium">Lateral</th>
              <th className="text-center py-3 px-4 font-medium">Vacant</th>
              <th className="text-left py-3 px-4 font-medium">Authority</th>
              <th className="text-center py-3 px-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((intake) => (
              <tr key={intake.id} className="border-t hover:bg-muted/30">
                <td className="py-3 px-4 font-semibold">{intake.programOffering}</td>
                <td className="py-3 px-4">{intake.academicYear}</td>
                <td className="py-3 px-4 text-center font-medium">{intake.sanctionedIntake}</td>
                <td className="py-3 px-4 text-center">{intake.admittedIntake}</td>
                <td className="py-3 px-4 text-center">{intake.lateralEntryIntake || '-'}</td>
                <td className="py-3 px-4 text-center">
                  <Badge variant={intake.vacantSeats === 0 ? 'default' : 'secondary'} className={intake.vacantSeats === 0 ? 'bg-green-100 text-green-700' : ''}>
                    {intake.vacantSeats}
                  </Badge>
                </td>
                <td className="py-3 px-4">{intake.approvalAuthority}</td>
                <td className="py-3 px-4 text-center">
                  <Badge variant={intake.status === 'active' ? 'default' : 'secondary'}>{intake.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground">
        <strong>Documents:</strong> AICTE Approval Letter, University Approval, Seat Matrix
      </div>
    </div>
  );
};

// Main Academic Structure Page
export const AcademicStructurePage = () => {
  const location = useLocation();
  const path = location.pathname;

  const getActiveTab = () => {
    if (path.includes('academic-years')) return 'academic-years';
    if (path.includes('programs')) return 'programs';
    if (path.includes('departments')) return 'departments';
    if (path.includes('specializations')) return 'specializations';
    if (path.includes('regulations')) return 'regulations';
    if (path.includes('offerings')) return 'offerings';
    if (path.includes('intake')) return 'intake';
    return 'dashboard';
  };

  const navigate = useNavigate();
  const activeTab = getActiveTab();

  const handleTabChange = (value: string) => {
    if (value === 'dashboard') {
      navigate('/app/academic-structure');
    } else {
      navigate(`/app/academic-structure/${value}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Structure</h1>
        <p className="text-muted-foreground">
          Configure the academic hierarchy: Academic Year → Program → Department → Specialization → Regulation → Program Offering → Program Intake
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl flex-wrap gap-0.5">
          <TabsTrigger value="dashboard" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <BarChart3 className="h-3.5 w-3.5" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="academic-years" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <Calendar className="h-3.5 w-3.5" />
            Academic Years
          </TabsTrigger>
          <TabsTrigger value="programs" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <GraduationCap className="h-3.5 w-3.5" />
            Programs
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <Building2 className="h-3.5 w-3.5" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="specializations" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <Layers className="h-3.5 w-3.5" />
            Specializations
          </TabsTrigger>
          <TabsTrigger value="regulations" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <BookOpen className="h-3.5 w-3.5" />
            Regulations
          </TabsTrigger>
          <TabsTrigger value="offerings" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <Combine className="h-3.5 w-3.5" />
            Program Offerings
          </TabsTrigger>
          <TabsTrigger value="intake" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
            <Users className="h-3.5 w-3.5" />
            Program Intake
          </TabsTrigger>
        </TabsList>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-6"
        >
          <TabsContent value="dashboard" className="mt-0"><DashboardTab /></TabsContent>
          <TabsContent value="academic-years" className="mt-0"><AcademicYearsTab /></TabsContent>
          <TabsContent value="programs" className="mt-0"><ProgramsTab /></TabsContent>
          <TabsContent value="departments" className="mt-0"><DepartmentsTab /></TabsContent>
          <TabsContent value="specializations" className="mt-0"><SpecializationsTab /></TabsContent>
          <TabsContent value="regulations" className="mt-0"><AcademicRegulationsTab /></TabsContent>
          <TabsContent value="offerings" className="mt-0"><ProgramOfferingsTab /></TabsContent>
          <TabsContent value="intake" className="mt-0"><ProgramIntakeTab /></TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
};
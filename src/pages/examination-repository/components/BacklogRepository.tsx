import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Upload,
  Download,
  Plus,
  Pencil,
  Trash2,
  BarChart3,
  PieChart,
  BookOpen,
  Users,
  AlertTriangle,
  FileUp,
  Eye,
} from 'lucide-react';

interface BacklogRecord {
  id: string;
  academicYear: string;
  semester: string;
  program: string;
  department: string;
  subjectCode: string;
  subjectName: string;
  studentsAppeared: number;
  studentsPassed: number;
  studentsFailed: number;
}

const sampleData: BacklogRecord[] = [
  { id: '1', academicYear: '2023-24', semester: '4', program: 'B.Tech CSE AI R22', department: 'Computer Science', subjectCode: 'CS401', subjectName: 'Machine Learning', studentsAppeared: 28, studentsPassed: 22, studentsFailed: 6 },
  { id: '2', academicYear: '2023-24', semester: '4', program: 'B.Tech CSE AI R22', department: 'Computer Science', subjectCode: 'CS402', subjectName: 'Database Systems', studentsAppeared: 35, studentsPassed: 28, studentsFailed: 7 },
  { id: '3', academicYear: '2023-24', semester: '4', program: 'B.Tech CSE AI R22', department: 'Computer Science', subjectCode: 'CS403', subjectName: 'Computer Networks', studentsAppeared: 25, studentsPassed: 20, studentsFailed: 5 },
  { id: '4', academicYear: '2023-24', semester: '3', program: 'B.Tech CSE AI R22', department: 'Computer Science', subjectCode: 'CS301', subjectName: 'Data Structures', studentsAppeared: 30, studentsPassed: 18, studentsFailed: 12 },
  { id: '5', academicYear: '2024-25', semester: '4', program: 'B.Tech CSE AI R22', department: 'Computer Science', subjectCode: 'CS404', subjectName: 'Software Engineering', studentsAppeared: 15, studentsPassed: 12, studentsFailed: 3 },
  { id: '6', academicYear: '2023-24', semester: '4', program: 'B.Tech ECE VLSI R22', department: 'Electronics', subjectCode: 'EC401', subjectName: 'VLSI Design', studentsAppeared: 20, studentsPassed: 16, studentsFailed: 4 },
];

const textFields = [
  { key: 'academicYear', label: 'Academic Year', type: 'text', placeholder: 'e.g. 2024-25' },
  { key: 'semester', label: 'Semester', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
  { key: 'program', label: 'Program', type: 'text', placeholder: 'e.g. B.Tech CSE AI R22' },
  { key: 'department', label: 'Department', type: 'text', placeholder: 'e.g. Computer Science' },
  { key: 'subjectCode', label: 'Subject Code', type: 'text', placeholder: 'e.g. CS401' },
  { key: 'subjectName', label: 'Subject Name', type: 'text', placeholder: 'e.g. Machine Learning' },
  { key: 'studentsAppeared', label: 'Students Appeared', type: 'number' },
  { key: 'studentsPassed', label: 'Students Passed', type: 'number' },
  { key: 'studentsFailed', label: 'Students Failed', type: 'number' },
];

export function BacklogRepository() {
  const [activeTab, setActiveTab] = useState('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<BacklogRecord[]>(sampleData);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BacklogRecord | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    const q = searchQuery.toLowerCase();
    return records.filter((r) =>
      Object.values(r).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [records, searchQuery]);

  // Analytics data
  const analytics = useMemo(() => {
    const totalAppeared = records.reduce((s, r) => s + r.studentsAppeared, 0);
    const totalPassed = records.reduce((s, r) => s + r.studentsPassed, 0);
    const totalFailed = records.reduce((s, r) => s + r.studentsFailed, 0);

    // Subject-wise
    const subjectWise = records.map((r) => ({
      subject: r.subjectName,
      code: r.subjectCode,
      appeared: r.studentsAppeared,
      passed: r.studentsPassed,
      failed: r.studentsFailed,
      passRate: r.studentsAppeared > 0 ? Math.round((r.studentsPassed / r.studentsAppeared) * 100) : 0,
    }));

    // Department-wise
    const deptMap = new Map<string, { appeared: number; passed: number; failed: number }>();
    records.forEach((r) => {
      const curr = deptMap.get(r.department) || { appeared: 0, passed: 0, failed: 0 };
      curr.appeared += r.studentsAppeared;
      curr.passed += r.studentsPassed;
      curr.failed += r.studentsFailed;
      deptMap.set(r.department, curr);
    });
    const departmentWise = Array.from(deptMap.entries()).map(([dept, data]) => ({
      department: dept,
      ...data,
      passRate: data.appeared > 0 ? Math.round((data.passed / data.appeared) * 100) : 0,
    }));

    // Semester-wise
    const semMap = new Map<string, { appeared: number; passed: number; failed: number }>();
    records.forEach((r) => {
      const key = `Sem ${r.semester}`;
      const curr = semMap.get(key) || { appeared: 0, passed: 0, failed: 0 };
      curr.appeared += r.studentsAppeared;
      curr.passed += r.studentsPassed;
      curr.failed += r.studentsFailed;
      semMap.set(key, curr);
    });
    const semesterWise = Array.from(semMap.entries()).map(([sem, data]) => ({
      semester: sem,
      ...data,
      passRate: data.appeared > 0 ? Math.round((data.passed / data.appeared) * 100) : 0,
    }));

    return { totalAppeared, totalPassed, totalFailed, subjectWise, departmentWise, semesterWise };
  }, [records]);

  const handleExportCSV = () => {
    const headers = 'Academic Year,Semester,Program,Department,Subject Code,Subject Name,Students Appeared,Students Passed,Students Failed';
    const rows = records
      .map((r) =>
        `"${r.academicYear}","${r.semester}","${r.program}","${r.department}","${r.subjectCode}","${r.subjectName}",${r.studentsAppeared},${r.studentsPassed},${r.studentsFailed}`
      )
      .join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backlog-repository-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddNew = () => {
    setEditingRecord({
      id: '',
      academicYear: '',
      semester: '1',
      program: '',
      department: '',
      subjectCode: '',
      subjectName: '',
      studentsAppeared: 0,
      studentsPassed: 0,
      studentsFailed: 0,
    });
    setIsNewRecord(true);
    setEditDialogOpen(true);
  };

  const handleEdit = (record: BacklogRecord) => {
    setEditingRecord({ ...record });
    setIsNewRecord(false);
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingRecord) return;
    if (isNewRecord) {
      setRecords((prev) => [...prev, { ...editingRecord, id: crypto.randomUUID() }]);
    } else {
      setRecords((prev) => prev.map((r) => (r.id === editingRecord.id ? editingRecord : r)));
    }
    setEditDialogOpen(false);
    setEditingRecord(null);
  };

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const renderRecords = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Backlog Records</h3>
          <p className="text-sm text-muted-foreground">
            Institution-level backlog data for accreditation reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <FileUp className="h-4 w-4" />
            Upload CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm" className="gap-2" onClick={handleAddNew}>
            <Plus className="h-4 w-4" />
            Add Record
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search backlog records..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Backlog Records</CardTitle>
            <Badge variant="secondary">{filteredRecords.length} records</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs whitespace-nowrap">Academic Year</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Sem</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Program</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Department</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Subject Code</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Subject Name</TableHead>
                  <TableHead className="text-xs whitespace-nowrap text-right">Appeared</TableHead>
                  <TableHead className="text-xs whitespace-nowrap text-right">Passed</TableHead>
                  <TableHead className="text-xs whitespace-nowrap text-right">Failed</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm whitespace-nowrap">{record.academicYear}</TableCell>
                      <TableCell className="text-sm">{record.semester}</TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate">{record.program}</TableCell>
                      <TableCell className="text-sm">{record.department}</TableCell>
                      <TableCell className="text-sm font-mono">{record.subjectCode}</TableCell>
                      <TableCell className="text-sm max-w-[150px] truncate">{record.subjectName}</TableCell>
                      <TableCell className="text-sm text-right">{record.studentsAppeared}</TableCell>
                      <TableCell className="text-sm text-right text-emerald-600 font-medium">{record.studentsPassed}</TableCell>
                      <TableCell className="text-sm text-right text-red-600 font-medium">{record.studentsFailed}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(record)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(record.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Backlog Analytics</h3>
        <p className="text-sm text-muted-foreground">
          Overview of backlog data by subject, department, and semester
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalAppeared}</p>
                <p className="text-xs text-muted-foreground">Total Students Appeared</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <BookOpen className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalPassed}</p>
                <p className="text-xs text-muted-foreground">Total Students Passed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalFailed}</p>
                <p className="text-xs text-muted-foreground">Total Students Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-wise */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Subject-wise Backlogs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.subjectWise.map((s) => (
                <div key={s.code} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{s.subject}</p>
                    <p className="text-[10px] text-muted-foreground">{s.code}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <span className="text-muted-foreground">A: {s.appeared}</span>
                    <span className="text-emerald-600 font-medium">P: {s.passed}</span>
                    <span className="text-red-600 font-medium">F: {s.failed}</span>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        s.passRate >= 75
                          ? 'bg-green-100 text-green-700'
                          : s.passRate >= 50
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {s.passRate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department-wise */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Department-wise Backlogs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.departmentWise.map((d) => (
                <div key={d.department} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{d.department}</p>
                    <p className="text-[10px] text-muted-foreground">{d.appeared} total students</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-600">{d.passed} passed</span>
                    <span className="text-red-600">{d.failed} failed</span>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        d.passRate >= 75
                          ? 'bg-green-100 text-green-700'
                          : d.passRate >= 50
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {d.passRate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Semester-wise */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Semester-wise Backlogs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.semesterWise.map((s) => (
                <div key={s.semester} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{s.semester}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">{s.appeared} appeared</span>
                    <span className="text-emerald-600">{s.passed} passed</span>
                    <span className="text-red-600">{s.failed} failed</span>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        s.passRate >= 75
                          ? 'bg-green-100 text-green-700'
                          : s.passRate >= 50
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {s.passRate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="records" className="gap-2">
            <Table className="h-4 w-4" />
            Records
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics Dashboard
          </TabsTrigger>
        </TabsList>
        <TabsContent value="records" className="mt-6">
          {renderRecords()}
        </TabsContent>
        <TabsContent value="dashboard" className="mt-6">
          {renderDashboard()}
        </TabsContent>
      </Tabs>

      {/* Edit/Add Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNewRecord ? 'Add Backlog Record' : 'Edit Backlog Record'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {textFields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs font-medium">{field.label}</Label>
                {field.type === 'select' ? (
                  <Select
                    value={String(editingRecord?.[field.key as keyof BacklogRecord] || '')}
                    onValueChange={(val) =>
                      setEditingRecord((prev) =>
                        prev ? { ...prev, [field.key]: val } : null
                      )
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={String(editingRecord?.[field.key as keyof BacklogRecord] || '')}
                    onChange={(e) =>
                      setEditingRecord((prev) =>
                        prev
                          ? {
                              ...prev,
                              [field.key]:
                                field.type === 'number'
                                  ? Number(e.target.value)
                                  : e.target.value,
                            }
                          : null
                      )
                    }
                    placeholder={field.placeholder}
                    className="h-9"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isNewRecord ? 'Add Record' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DataModule } from './types';
import { facultyRecords, studentRecords, researchRecords, academicRecords } from './mock-data';
import {
  Search,
  Download,
  Filter,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  Users,
  BookOpen,
  FlaskConical,
  GraduationCap,
} from 'lucide-react';

interface DataModuleViewProps {
  module: DataModule;
}

const moduleConfig = {
  academic: { title: 'Academic Data', description: 'Curriculum, examinations, placements, and quality records', icon: GraduationCap, color: 'text-violet-500' },
  faculty: { title: 'Faculty Data', description: 'Faculty profiles, qualifications, and publications', icon: Users, color: 'text-indigo-500' },
  student: { title: 'Student Data', description: 'Student enrollment, performance, and progression', icon: BookOpen, color: 'text-emerald-500' },
  research: { title: 'Research Data', description: 'Publications, patents, and research projects', icon: FlaskConical, color: 'text-pink-500' },
};

export const DataModuleView = ({ module }: DataModuleViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const config = moduleConfig[module];
  const Icon = config.icon;

  const renderAcademicTable = () => {
    const filtered = academicRecords.filter(r =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead>Completion</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((record) => (
            <TableRow key={record.id} className="hover:bg-muted/30">
              <TableCell className="font-medium text-sm">{record.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[11px]">{record.category}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{record.academicYear}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Progress value={record.completionPercentage} className="h-2 flex-1" />
                  <span className="text-[11px] font-medium w-8">{record.completionPercentage}%</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-[10px]',
                    record.status === 'completed' && 'bg-emerald-500/10 text-emerald-600',
                    record.status === 'in_progress' && 'bg-blue-500/10 text-blue-600',
                    record.status === 'pending' && 'bg-amber-500/10 text-amber-600',
                  )}
                >
                  {record.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3.5 w-3.5" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderFacultyTable = () => {
    const filtered = facultyRecords.filter(r =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Publications</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((record) => (
            <TableRow key={record.id} className="hover:bg-muted/30">
              <TableCell className="font-medium text-sm">{record.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{record.designation}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{record.specialization}</TableCell>
              <TableCell className="text-sm">{record.experience} yrs</TableCell>
              <TableCell className="text-sm font-medium">{record.publications}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-[10px]',
                    record.status === 'active' && 'bg-emerald-500/10 text-emerald-600',
                    record.status === 'on_leave' && 'bg-amber-500/10 text-amber-600',
                    record.status === 'retired' && 'bg-gray-500/10 text-gray-600',
                  )}
                >
                  {record.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3.5 w-3.5" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderStudentTable = () => {
    const filtered = studentRecords.filter(r =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Roll Number</TableHead>
            <TableHead>Program</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>CGPA</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((record) => (
            <TableRow key={record.id} className="hover:bg-muted/30">
              <TableCell className="font-medium text-sm">{record.name}</TableCell>
              <TableCell className="text-sm font-mono text-muted-foreground">{record.rollNumber}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{record.program}</TableCell>
              <TableCell className="text-sm">{record.year}</TableCell>
              <TableCell>
                <span className={cn('text-sm font-medium', record.cgpa >= 9 ? 'text-emerald-600' : record.cgpa >= 8 ? 'text-blue-600' : 'text-foreground')}>
                  {record.cgpa}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-[10px]',
                    record.status === 'active' && 'bg-emerald-500/10 text-emerald-600',
                    record.status === 'graduated' && 'bg-blue-500/10 text-blue-600',
                    record.status === 'dropped' && 'bg-red-500/10 text-red-600',
                  )}
                >
                  {record.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3.5 w-3.5" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderResearchTable = () => {
    const filtered = researchRecords.filter(r =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.authors.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[250px]">Title</TableHead>
            <TableHead>Authors</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Impact Factor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((record) => (
            <TableRow key={record.id} className="hover:bg-muted/30">
              <TableCell className="font-medium text-sm max-w-[300px] truncate">{record.title}</TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">{record.authors}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">{record.type.replace('_', ' ')}</Badge>
              </TableCell>
              <TableCell className="text-sm">{record.year}</TableCell>
              <TableCell className="text-sm font-medium">{record.impactFactor > 0 ? record.impactFactor : '-'}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-[10px]',
                    record.status === 'published' && 'bg-emerald-500/10 text-emerald-600',
                    record.status === 'accepted' && 'bg-blue-500/10 text-blue-600',
                    record.status === 'under_review' && 'bg-amber-500/10 text-amber-600',
                  )}
                >
                  {record.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3.5 w-3.5" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderTable = () => {
    switch (module) {
      case 'academic': return renderAcademicTable();
      case 'faculty': return renderFacultyTable();
      case 'student': return renderStudentTable();
      case 'research': return renderResearchTable();
    }
  };

  const getRecordCount = () => {
    switch (module) {
      case 'academic': return academicRecords.length;
      case 'faculty': return facultyRecords.length;
      case 'student': return studentRecords.length;
      case 'research': return researchRecords.length;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5')}>
                <Icon className={cn('h-5 w-5', config.color)} />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">{config.title}</CardTitle>
                <CardDescription className="text-xs">{config.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">{getRecordCount()} records</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${config.title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 text-xs">
                <Filter className="h-3.5 w-3.5 mr-1.5" /> Filter
              </Button>
              <Button variant="outline" size="sm" className="h-9 text-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" /> Export
              </Button>
              <Button size="sm" className="h-9 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Record
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-x-auto">
            {renderTable()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
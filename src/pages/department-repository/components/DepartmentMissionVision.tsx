import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Target,
  Eye,
  Heart,
  Save,
  Edit2,
  Plus,
  X,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface DepartmentMissionVisionData {
  mission: string[];
  vision: string;
  coreValues: string[];
  qualityPolicy: string;
  programEducationalObjectives: string[];
  programSpecificOutcomes: string[];
  departmentStrengths: string[];
}

const initialData: DepartmentMissionVisionData = {
  mission: [
    'To impart quality education in Computer Science and Engineering through innovative teaching-learning practices, to foster research and development, and to produce industry-ready professionals with strong ethical values who contribute to technological advancement and societal well-being.',
    'To produce globally competent computer science professionals with strong problem-solving skills, ethical values, and a commitment to lifelong learning through a blend of theoretical knowledge and practical exposure.',
    'To nurture research and innovation culture among students and faculty, fostering collaboration with industry and academia to address emerging technological challenges.',
  ],
  vision: 'To be a center of excellence in Computer Science and Engineering education and research, recognized nationally and internationally for producing competent professionals who drive innovation and contribute to sustainable development of the society.',
  coreValues: [
    'Academic Excellence',
    'Innovation & Research',
    'Industry Readiness',
    'Ethical Practices',
    'Teamwork & Collaboration',
    'Lifelong Learning',
    'Social Responsibility',
  ],
  qualityPolicy: 'The Department of Computer Science and Engineering is committed to providing quality education through competent faculty, modern laboratories, industry-relevant curriculum, and continuous improvement in teaching-learning processes. We aim to develop technically competent, ethically strong, and socially responsible engineers.',
  programEducationalObjectives: [
    'PEO1: Graduates will have successful careers in industry, academia, or entrepreneurship in the field of Computer Science and Engineering.',
    'PEO2: Graduates will demonstrate the ability to analyze, design, and develop computing solutions for real-world problems.',
    'PEO3: Graduates will exhibit professional ethics, effective communication, and leadership skills in multidisciplinary teams.',
    'PEO4: Graduates will engage in lifelong learning and adapt to emerging technologies and evolving industry needs.',
  ],
  programSpecificOutcomes: [
    'PSO1: Ability to design and develop software solutions using modern programming languages, frameworks, and tools.',
    'PSO2: Ability to apply knowledge of algorithms, data structures, and system design to solve complex computing problems.',
    'PSO3: Ability to work with emerging technologies including AI/ML, Cloud Computing, Cyber Security, and IoT.',
  ],
  departmentStrengths: [
    'NBA Accredited Program (Tier-I)',
    'State-of-the-art Computing Labs',
    'Strong Industry Partnerships',
    'Active Research Groups in AI/ML, Cyber Security',
    'High Placement Record (95%+)',
    'MoUs with 25+ Companies',
    'Student Innovation Hub',
  ],
};

export const DepartmentMissionVision = () => {
  const [data, setData] = useState<DepartmentMissionVisionData>(initialData);
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    setEditing(false);
    toast.success('Department Mission & Vision updated successfully');
  };

  const addItem = (field: keyof Pick<DepartmentMissionVisionData, 'mission' | 'coreValues' | 'programEducationalObjectives' | 'programSpecificOutcomes' | 'departmentStrengths'>) => {
    const label = field === 'mission' ? 'mission statement' : field === 'coreValues' ? 'core value' : field === 'programEducationalObjectives' ? 'PEO' : field === 'programSpecificOutcomes' ? 'PSO' : 'strength';
    const newValue = prompt(`Enter a new ${label}:`);
    if (newValue?.trim()) {
      setData((prev) => ({
        ...prev,
        [field]: [...prev[field], newValue.trim()],
      }));
    }
  };

  const removeItem = (field: keyof Pick<DepartmentMissionVisionData, 'mission' | 'coreValues' | 'programEducationalObjectives' | 'programSpecificOutcomes' | 'departmentStrengths'>, index: number) => {
    setData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Department Mission & Vision</h1>
          <p className="text-muted-foreground">Define and manage the department's mission, vision, and objectives</p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Vision Statement */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-primary" />
              Vision Statement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <Textarea
                value={data.vision}
                onChange={(e) => setData((prev) => ({ ...prev, vision: e.target.value }))}
                className="min-h-[100px] text-sm"
                placeholder="Enter the department's vision statement..."
              />
            ) : (
              <p className="text-sm leading-relaxed text-foreground/90 italic">{data.vision}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Mission Statements */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Mission Statements
              </CardTitle>
              {editing && (
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addItem('mission')}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Mission
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.mission.map((missionItem, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  {editing ? (
                    <div className="flex-1 flex items-start gap-2">
                      <Textarea
                        value={missionItem}
                        onChange={(e) => {
                          const updated = [...data.mission];
                          updated[index] = e.target.value;
                          setData((prev) => ({ ...prev, mission: updated }));
                        }}
                        className="flex-1 text-sm min-h-[60px]"
                        placeholder="Enter a mission statement..."
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => removeItem('mission', index)}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-foreground/90">{missionItem}</p>
                  )}
                </div>
              ))}
              {!editing && data.mission.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No mission statements defined yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Core Values */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-primary" />
              Core Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.coreValues.map((value, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {value}
                  {editing && (
                    <button
                      className="ml-2 hover:text-destructive"
                      onClick={() => removeItem('coreValues', index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {editing && (
                <Button variant="outline" size="sm" className="h-8" onClick={() => addItem('coreValues')}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Value
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Program Educational Objectives */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Program Educational Objectives (PEOs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.programEducationalObjectives.map((peo, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                  {editing ? (
                    <div className="flex-1 flex items-start gap-2">
                      <Input
                        value={peo}
                        onChange={(e) => {
                          const updated = [...data.programEducationalObjectives];
                          updated[index] = e.target.value;
                          setData((prev) => ({ ...prev, programEducationalObjectives: updated }));
                        }}
                        className="flex-1 text-sm"
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeItem('programEducationalObjectives', index)}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{peo}</p>
                  )}
                </div>
              ))}
              {editing && (
                <Button variant="outline" size="sm" onClick={() => addItem('programEducationalObjectives')}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add PEO
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Program Specific Outcomes */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              Program Specific Outcomes (PSOs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.programSpecificOutcomes.map((pso, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                  {editing ? (
                    <div className="flex-1 flex items-start gap-2">
                      <Input
                        value={pso}
                        onChange={(e) => {
                          const updated = [...data.programSpecificOutcomes];
                          updated[index] = e.target.value;
                          setData((prev) => ({ ...prev, programSpecificOutcomes: updated }));
                        }}
                        className="flex-1 text-sm"
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeItem('programSpecificOutcomes', index)}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{pso}</p>
                  )}
                </div>
              ))}
              {editing && (
                <Button variant="outline" size="sm" onClick={() => addItem('programSpecificOutcomes')}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add PSO
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quality Policy & Department Strengths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Quality Policy</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <Textarea
                  value={data.qualityPolicy}
                  onChange={(e) => setData((prev) => ({ ...prev, qualityPolicy: e.target.value }))}
                  className="min-h-[120px] text-sm"
                  placeholder="Enter the department quality policy..."
                />
              ) : (
                <p className="text-sm leading-relaxed text-foreground/90">{data.qualityPolicy}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Department Strengths</CardTitle>
                {editing && (
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addItem('departmentStrengths')}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.departmentStrengths.map((strength, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    {editing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={strength}
                          onChange={(e) => {
                            const updated = [...data.departmentStrengths];
                            updated[index] = e.target.value;
                            setData((prev) => ({ ...prev, departmentStrengths: updated }));
                          }}
                          className="flex-1 h-8 text-sm"
                        />
                        <button className="text-muted-foreground hover:text-destructive" onClick={() => removeItem('departmentStrengths', index)}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm">{strength}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
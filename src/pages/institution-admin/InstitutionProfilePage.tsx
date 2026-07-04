import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  MapPin,
  Save,
  Edit2,
  Upload,
  Award,
  Shield,
  TrendingUp,
  Landmark,
  GraduationCap,
  FileCheck,
  Target,
  Eye,
  Heart,
  Plus,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { institutionProfile } from './mock-data';
import { InstitutionProfile } from './types';

const institutionTypeOptions = [
  'University',
  'Autonomous',
  'Deemed University',
  'Affiliated',
  'Government Aided',
];

const ownershipStatusOptions = [
  'Central Government',
  'Trust',
  'State Government',
  'Society',
  'Government Aided',
  'Section 25 Company',
  'Self Financing',
  'Any other Please specify',
];

const ruralUrbanOptions = ['Rural', 'Urban', 'Semi-Urban'];

export const InstitutionProfilePage = () => {
  const [profile, setProfile] = useState<InstitutionProfile>(institutionProfile);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const handleSave = () => {
    setEditing(false);
    toast.success('Institution profile updated successfully');
  };

  const Field = ({
    label,
    value,
    field,
    section,
  }: {
    label: string;
    value: string;
    field: string;
    section?: string;
  }) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {editing ? (
        <Input
          value={value}
          onChange={(e) => {
            if (section) {
              setProfile((prev) => ({
                ...prev,
                [section]: { ...(prev as Record<string, unknown>)[section] as Record<string, unknown>, [field]: e.target.value },
              }));
            } else {
              setProfile((prev) => ({ ...prev, [field]: e.target.value }));
            }
          }}
          className="h-9"
        />
      ) : (
        <p className="text-sm font-medium py-1.5">{value || '-'}</p>
      )}
    </div>
  );

  const SelectField = ({
    label,
    value,
    field,
    options,
    section,
  }: {
    label: string;
    value: string;
    field: string;
    options: string[];
    section?: string;
  }) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {editing ? (
        <Select
          value={value}
          onValueChange={(val) => {
            if (section) {
              setProfile((prev) => ({
                ...prev,
                [section]: { ...(prev as Record<string, unknown>)[section] as Record<string, unknown>, [field]: val },
              }));
            } else {
              setProfile((prev) => ({ ...prev, [field]: val }));
            }
          }}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <p className="text-sm font-medium py-1.5">{value || '-'}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Institution Profile</h1>
          <p className="text-muted-foreground">Manage your institution details and accreditation information</p>
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
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl flex-wrap gap-0.5">
            <TabsTrigger value="basic" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <Building2 className="h-3.5 w-3.5" />
              Basic Information
            </TabsTrigger>
            <TabsTrigger value="mission-vision" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <Target className="h-3.5 w-3.5" />
              Mission & Vision
            </TabsTrigger>
            <TabsTrigger value="address" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <MapPin className="h-3.5 w-3.5" />
              Address
            </TabsTrigger>
            <TabsTrigger value="naac" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <Award className="h-3.5 w-3.5" />
              NAAC
            </TabsTrigger>
            <TabsTrigger value="nba" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <Shield className="h-3.5 w-3.5" />
              NBA
            </TabsTrigger>
            <TabsTrigger value="nirf" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <TrendingUp className="h-3.5 w-3.5" />
              NIRF
            </TabsTrigger>
            <TabsTrigger value="autonomous" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <Landmark className="h-3.5 w-3.5" />
              Autonomous
            </TabsTrigger>
            <TabsTrigger value="ugc" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <GraduationCap className="h-3.5 w-3.5" />
              UGC Recognition
            </TabsTrigger>
            <TabsTrigger value="aicte" className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg">
              <FileCheck className="h-3.5 w-3.5" />
              AICTE Approvals
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Institution Name" value={profile.name} field="name" />
                  <Field label="Institution Code" value={profile.code} field="code" />
                  <Field label="AICTE Code" value={profile.aicteCode} field="aicteCode" />
                  <Field label="AISHE Code" value={profile.aisheCode} field="aisheCode" />
                  <Field label="UGC Code" value={profile.ugcCode} field="ugcCode" />
                  <Field label="Year of Establishment" value={profile.yearOfEstablishment} field="yearOfEstablishment" />
                  <SelectField
                    label="Type of Institution"
                    value={profile.typeOfInstitution}
                    field="typeOfInstitution"
                    options={institutionTypeOptions}
                  />
                  <SelectField
                    label="Ownership Status"
                    value={profile.ownershipStatus}
                    field="ownershipStatus"
                    options={ownershipStatusOptions}
                  />
                  <Field label="Category" value={profile.category} field="category" />
                  <Field label="Website" value={profile.website} field="website" />
                  <Field label="Email" value={profile.email} field="email" />
                  <Field label="Phone" value={profile.phone} field="phone" />
                  <Field label="Affiliated University" value={profile.affiliatedUniversity} field="affiliatedUniversity" />
                  <div className="md:col-span-2">
                    <Field label="Address of Affiliated University" value={profile.affiliatedUniversityAddress} field="affiliatedUniversityAddress" />
                  </div>
                </div>
                {editing && (
                  <div className="mt-4">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Update Logo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mission & Vision */}
          <TabsContent value="mission-vision" className="mt-4">
            <div className="space-y-6">
              {/* Vision */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Eye className="h-5 w-5 text-primary" />
                    Vision Statement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <Textarea
                      value={profile.missionVision.vision}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          missionVision: { ...prev.missionVision, vision: e.target.value },
                        }))
                      }
                      className="min-h-[120px] text-sm"
                      placeholder="Enter the institution's vision statement..."
                    />
                  ) : (
                    <p className="text-sm leading-relaxed text-foreground/90">{profile.missionVision.vision || '-'}</p>
                  )}
                </CardContent>
              </Card>

              {/* Mission */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-primary" />
                    Mission Statement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <Textarea
                      value={profile.missionVision.mission}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          missionVision: { ...prev.missionVision, mission: e.target.value },
                        }))
                      }
                      className="min-h-[120px] text-sm"
                      placeholder="Enter the institution's mission statement..."
                    />
                  ) : (
                    <p className="text-sm leading-relaxed text-foreground/90">{profile.missionVision.mission || '-'}</p>
                  )}
                </CardContent>
              </Card>

              {/* Core Values */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="h-5 w-5 text-primary" />
                    Core Values
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.missionVision.coreValues.map((value, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {value}
                        {editing && (
                          <button
                            className="ml-2 hover:text-destructive"
                            onClick={() => {
                              setProfile((prev) => ({
                                ...prev,
                                missionVision: {
                                  ...prev.missionVision,
                                  coreValues: prev.missionVision.coreValues.filter((_, i) => i !== index),
                                },
                              }));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {editing && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                          const newValue = prompt('Enter a new core value:');
                          if (newValue?.trim()) {
                            setProfile((prev) => ({
                              ...prev,
                              missionVision: {
                                ...prev.missionVision,
                                coreValues: [...prev.missionVision.coreValues, newValue.trim()],
                              },
                            }));
                          }
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Value
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quality Policy & Motto */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      Quality Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editing ? (
                      <Textarea
                        value={profile.missionVision.qualityPolicy}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            missionVision: { ...prev.missionVision, qualityPolicy: e.target.value },
                          }))
                        }
                        className="min-h-[100px] text-sm"
                        placeholder="Enter the quality policy..."
                      />
                    ) : (
                      <p className="text-sm leading-relaxed text-foreground/90">{profile.missionVision.qualityPolicy || '-'}</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      Motto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editing ? (
                      <Input
                        value={profile.missionVision.motto}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            missionVision: { ...prev.missionVision, motto: e.target.value },
                          }))
                        }
                        placeholder="Enter the institution's motto..."
                      />
                    ) : (
                      <p className="text-lg font-semibold italic text-primary">{profile.missionVision.motto || '-'}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Address */}
          <TabsContent value="address" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="md:col-span-2 lg:col-span-3">
                    <Field label="Address Line 1" value={profile.address.line1} field="line1" section="address" />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <Field label="Address Line 2" value={profile.address.line2} field="line2" section="address" />
                  </div>
                  <Field label="Landmark" value={profile.address.landmark} field="landmark" section="address" />
                  <Field label="City" value={profile.address.city} field="city" section="address" />
                  <Field label="District" value={profile.address.district} field="district" section="address" />
                  <Field label="State" value={profile.address.state} field="state" section="address" />
                  <Field label="Pincode" value={profile.address.pincode} field="pincode" section="address" />
                  <SelectField
                    label="Rural / Urban Status"
                    value={profile.address.ruralUrbanStatus}
                    field="ruralUrbanStatus"
                    options={ruralUrbanOptions}
                    section="address"
                  />
                  <Field label="Geo Latitude" value={profile.address.geoLatitude} field="geoLatitude" section="address" />
                  <Field label="Geo Longitude" value={profile.address.geoLongitude} field="geoLongitude" section="address" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NAAC */}
          <TabsContent value="naac" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5 text-primary" />
                    NAAC Accreditation
                  </CardTitle>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                    {profile.naac.accreditationStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Accreditation Status" value={profile.naac.accreditationStatus} field="accreditationStatus" section="naac" />
                  <Field label="Grade" value={profile.naac.grade} field="grade" section="naac" />
                  <Field label="CGPA" value={profile.naac.cgpa} field="cgpa" section="naac" />
                  <Field label="Cycle" value={profile.naac.cycle} field="cycle" section="naac" />
                  <Field label="Valid From" value={profile.naac.validFrom} field="validFrom" section="naac" />
                  <Field label="Valid Upto" value={profile.naac.validUpto} field="validUpto" section="naac" />
                  <Field label="Certificate Number" value={profile.naac.certificateNumber} field="certificateNumber" section="naac" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NBA */}
          <TabsContent value="nba" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-5 w-5 text-primary" />
                    NBA Accreditation
                  </CardTitle>
                  <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600">
                    {profile.nba.tier}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Accreditation Status" value={profile.nba.accreditationStatus} field="accreditationStatus" section="nba" />
                  <div className="md:col-span-2">
                    <Field label="Programs Accredited" value={profile.nba.programsAccredited} field="programsAccredited" section="nba" />
                  </div>
                  <Field label="Valid From" value={profile.nba.validFrom} field="validFrom" section="nba" />
                  <Field label="Valid Upto" value={profile.nba.validUpto} field="validUpto" section="nba" />
                  <Field label="Tier" value={profile.nba.tier} field="tier" section="nba" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NIRF */}
          <TabsContent value="nirf" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    NIRF Ranking
                  </CardTitle>
                  <Badge variant="secondary" className="bg-violet-500/10 text-violet-600">
                    Rank #{profile.nirf.rank}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Participation Status" value={profile.nirf.participationStatus} field="participationStatus" section="nirf" />
                  <Field label="Rank" value={profile.nirf.rank} field="rank" section="nirf" />
                  <Field label="Year" value={profile.nirf.year} field="year" section="nirf" />
                  <Field label="Category" value={profile.nirf.category} field="category" section="nirf" />
                  <Field label="Score" value={profile.nirf.score} field="score" section="nirf" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Autonomous */}
          <TabsContent value="autonomous" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Landmark className="h-5 w-5 text-primary" />
                    Autonomous Status
                  </CardTitle>
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                    {profile.autonomous.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Status" value={profile.autonomous.status} field="status" section="autonomous" />
                  <Field label="Granted By" value={profile.autonomous.grantedBy} field="grantedBy" section="autonomous" />
                  <Field label="Granted Date" value={profile.autonomous.grantedDate} field="grantedDate" section="autonomous" />
                  <Field label="Valid Upto" value={profile.autonomous.validUpto} field="validUpto" section="autonomous" />
                  <Field label="Order Number" value={profile.autonomous.orderNumber} field="orderNumber" section="autonomous" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* UGC Recognition */}
          <TabsContent value="ugc" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    UGC Recognition
                  </CardTitle>
                  <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-600">
                    {profile.ugcRecognition.recognitionStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Recognition Status" value={profile.ugcRecognition.recognitionStatus} field="recognitionStatus" section="ugcRecognition" />
                  <Field label="Section 2(f)" value={profile.ugcRecognition.section2f} field="section2f" section="ugcRecognition" />
                  <Field label="Section 12(B)" value={profile.ugcRecognition.section12b} field="section12b" section="ugcRecognition" />
                  <Field label="Recognition Date" value={profile.ugcRecognition.recognitionDate} field="recognitionDate" section="ugcRecognition" />
                  <Field label="Letter Number" value={profile.ugcRecognition.letterNumber} field="letterNumber" section="ugcRecognition" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AICTE Approvals */}
          <TabsContent value="aicte" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileCheck className="h-5 w-5 text-primary" />
                    AICTE Approvals
                  </CardTitle>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                    {profile.aicteApprovals.approvalStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Approval Status" value={profile.aicteApprovals.approvalStatus} field="approvalStatus" section="aicteApprovals" />
                  <Field label="Application ID" value={profile.aicteApprovals.applicationId} field="applicationId" section="aicteApprovals" />
                  <Field label="Approval Year" value={profile.aicteApprovals.approvalYear} field="approvalYear" section="aicteApprovals" />
                  <Field label="EOA" value={profile.aicteApprovals.eoa} field="eoa" section="aicteApprovals" />
                  <Field label="Permanent ID" value={profile.aicteApprovals.permanentId} field="permanentId" section="aicteApprovals" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { RouteLoadingSpinner } from '@/components/shared/RouteLoadingSpinner';
import { InstitutionProfile } from './types';
import { institutionAdminService } from '@/services/institution-admin.service';

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

// ── Stable sub-components (defined OUTSIDE main component to prevent focus loss) ──

interface FieldProps {
  label: string;
  value: string;
  field: string;
  section?: string;
  editing: boolean;
  onFieldChange: (section: string | undefined, field: string, value: string) => void;
}

const Field = ({
  label,
  value,
  field,
  section,
  editing,
  onFieldChange,
}: FieldProps) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {editing ? (
      <Input
        value={value}
        onChange={(e) => onFieldChange(section, field, e.target.value)}
        className="h-9"
      />
    ) : (
      <p className="text-sm font-medium py-1.5">{value || '-'}</p>
    )}
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  field: string;
  options: string[];
  section?: string;
  editing: boolean;
  onFieldChange: (section: string | undefined, field: string, value: string) => void;
}

const SelectField = ({
  label,
  value,
  field,
  options,
  section,
  editing,
  onFieldChange,
}: SelectFieldProps) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {editing ? (
      <Select
        value={value}
        onValueChange={(val) => onFieldChange(section, field, val)}
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

type ProfileState = 'loading' | 'success' | 'error';

export const InstitutionProfilePage = () => {
  const [state, setState] = useState<ProfileState>('loading');
  const [profile, setProfile] = useState<InstitutionProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    setState('loading');
    setErrorMessage('');

    try {
      const data = await institutionAdminService.getProfile();
      setProfile(data);
      setState('success');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to load institution profile';
      setErrorMessage(message);
      setState('error');
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFieldChange = useCallback(
    (section: string | undefined, field: string, value: string) => {
      setProfile((prev) => {
        if (!prev) return prev;
        if (section) {
          return {
            ...prev,
            [section]: {
              ...((prev as unknown as Record<string, unknown>)[section] as Record<string, unknown>),
              [field]: value,
            },
          } as InstitutionProfile;
        }
        return { ...prev, [field]: value };
      });
    },
    []
  );

  const handleSave = async () => {
    if (!profile || isSaving) return;
    setIsSaving(true);

    try {
      if (activeTab === 'basic') {
        const { address, contact, naac, nba, nirf, autonomous, ugcRecognition, aicteApprovals, logo, ...basicFields } = profile;
        const result = await institutionAdminService.updateBasicInfo(basicFields);
        toast.success('Basic information updated successfully', {
          description: result.updatedAt
            ? `Last updated: ${new Date(result.updatedAt).toLocaleString()}`
            : undefined,
        });
      } else if (activeTab === 'address') {
        const result = await institutionAdminService.updateAddress(profile.address);
        toast.success('Address updated successfully', {
          description: result.updatedAt
            ? `Last updated: ${new Date(result.updatedAt).toLocaleString()}`
            : undefined,
        });
      } else if (activeTab === 'naac') {
        const result = await institutionAdminService.updateNaac(profile.naac);
        toast.success('NAAC data updated successfully', {
          description: result.updatedAt
            ? `Last updated: ${new Date(result.updatedAt).toLocaleString()}`
            : undefined,
        });
      } else if (activeTab === 'nba') {
        const result = await institutionAdminService.updateNba(profile.nba);
        toast.success('NBA data updated successfully', {
          description: result.updatedAt
            ? `Last updated: ${new Date(result.updatedAt).toLocaleString()}`
            : undefined,
        });
      } else if (activeTab === 'nirf') {
        const result = await institutionAdminService.updateNirf(profile.nirf);
        toast.success('NIRF data updated successfully', {
          description: result.updatedAt
            ? `Last updated: ${new Date(result.updatedAt).toLocaleString()}`
            : undefined,
        });
      } else if (activeTab === 'autonomous') {
        const result = await institutionAdminService.updateAutonomous(profile.autonomous);
        toast.success('Autonomous data updated successfully', {
          description: result.updatedAt
            ? `Last updated: ${new Date(result.updatedAt).toLocaleString()}`
            : undefined,
        });
      } else if (activeTab === 'ugc') {
        const result = await institutionAdminService.updateUgc(profile.ugcRecognition);
        toast.success('UGC recognition data updated successfully', {
          description: result.updatedAt
            ? `Last updated: ${new Date(result.updatedAt).toLocaleString()}`
            : undefined,
        });
      } else if (activeTab === 'aicte') {
        const result = await institutionAdminService.updateAicte(profile.aicteApprovals);
        toast.success('AICTE approval data updated successfully', {
          description: result.updatedAt
            ? `Last updated: ${new Date(result.updatedAt).toLocaleString()}`
            : undefined,
        });
      }

      setEditing(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to save changes';
      toast.error('Failed to save', { description: message });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Loading state ──
  if (state === 'loading' || !profile) {
    return <RouteLoadingSpinner message="Loading institution profile…" />;
  }

  // ── Error state ──
  if (state === 'error') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Institution Profile</h1>
          <p className="text-muted-foreground">Manage your institution details and accreditation information</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Failed to load profile</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              {errorMessage || "We couldn't fetch your institution profile. Please check your connection and try again."}
            </p>
            <Button variant="outline" onClick={fetchProfile}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }



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
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving…' : 'Save Changes'}
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
                  <Field label="Institution Name" value={profile.name} field="name" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Institution Code" value={profile.code} field="code" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="AICTE Code" value={profile.aicteCode} field="aicteCode" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="AISHE Code" value={profile.aisheCode} field="aisheCode" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="UGC Code" value={profile.ugcCode} field="ugcCode" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Year of Establishment" value={profile.yearOfEstablishment} field="yearOfEstablishment" editing={editing} onFieldChange={handleFieldChange} />
                  <SelectField
                    label="Type of Institution"
                    value={profile.typeOfInstitution}
                    field="typeOfInstitution"
                    options={institutionTypeOptions}
                    editing={editing}
                    onFieldChange={handleFieldChange}
                  />
                  <SelectField
                    label="Ownership Status"
                    value={profile.ownershipStatus}
                    field="ownershipStatus"
                    options={ownershipStatusOptions}
                    editing={editing}
                    onFieldChange={handleFieldChange}
                  />
                  <Field label="Category" value={profile.category} field="category" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Website" value={profile.website} field="website" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Email" value={profile.email} field="email" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Phone" value={profile.phone} field="phone" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Affiliated University" value={profile.affiliatedUniversity} field="affiliatedUniversity" editing={editing} onFieldChange={handleFieldChange} />
                  <div className="md:col-span-2">
                    <Field label="Address of Affiliated University" value={profile.affiliatedUniversityAddress} field="affiliatedUniversityAddress" editing={editing} onFieldChange={handleFieldChange} />
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
                    <Field label="Address Line 1" value={profile.address.line1} field="line1" section="address" editing={editing} onFieldChange={handleFieldChange} />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <Field label="Address Line 2" value={profile.address.line2} field="line2" section="address" editing={editing} onFieldChange={handleFieldChange} />
                  </div>
                  <Field label="Landmark" value={profile.address.landmark} field="landmark" section="address" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="City" value={profile.address.city} field="city" section="address" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="District" value={profile.address.district} field="district" section="address" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="State" value={profile.address.state} field="state" section="address" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Pincode" value={profile.address.pincode} field="pincode" section="address" editing={editing} onFieldChange={handleFieldChange} />
                  <SelectField
                    label="Rural / Urban Status"
                    value={profile.address.ruralUrbanStatus}
                    field="ruralUrbanStatus"
                    options={ruralUrbanOptions}
                    section="address"
                    editing={editing}
                    onFieldChange={handleFieldChange}
                  />
                  <Field label="Geo Latitude" value={profile.address.geoLatitude} field="geoLatitude" section="address" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Geo Longitude" value={profile.address.geoLongitude} field="geoLongitude" section="address" editing={editing} onFieldChange={handleFieldChange} />
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
                  <Field label="Accreditation Status" value={profile.naac.accreditationStatus} field="accreditationStatus" section="naac" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Grade" value={profile.naac.grade} field="grade" section="naac" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="CGPA" value={profile.naac.cgpa} field="cgpa" section="naac" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Cycle" value={profile.naac.cycle} field="cycle" section="naac" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Valid From" value={profile.naac.validFrom} field="validFrom" section="naac" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Valid Upto" value={profile.naac.validUpto} field="validUpto" section="naac" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Certificate Number" value={profile.naac.certificateNumber} field="certificateNumber" section="naac" editing={editing} onFieldChange={handleFieldChange} />
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
                  <Field label="Accreditation Status" value={profile.nba.accreditationStatus} field="accreditationStatus" section="nba" editing={editing} onFieldChange={handleFieldChange} />
                  <div className="md:col-span-2">
                    <Field label="Programs Accredited" value={profile.nba.programsAccredited} field="programsAccredited" section="nba" editing={editing} onFieldChange={handleFieldChange} />
                  </div>
                  <Field label="Valid From" value={profile.nba.validFrom} field="validFrom" section="nba" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Valid Upto" value={profile.nba.validUpto} field="validUpto" section="nba" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Tier" value={profile.nba.tier} field="tier" section="nba" editing={editing} onFieldChange={handleFieldChange} />
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
                  <Field label="Participation Status" value={profile.nirf.participationStatus} field="participationStatus" section="nirf" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Rank" value={profile.nirf.rank} field="rank" section="nirf" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Year" value={profile.nirf.year} field="year" section="nirf" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Category" value={profile.nirf.category} field="category" section="nirf" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Score" value={profile.nirf.score} field="score" section="nirf" editing={editing} onFieldChange={handleFieldChange} />
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
                  <Field label="Status" value={profile.autonomous.status} field="status" section="autonomous" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Granted By" value={profile.autonomous.grantedBy} field="grantedBy" section="autonomous" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Granted Date" value={profile.autonomous.grantedDate} field="grantedDate" section="autonomous" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Valid Upto" value={profile.autonomous.validUpto} field="validUpto" section="autonomous" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Order Number" value={profile.autonomous.orderNumber} field="orderNumber" section="autonomous" editing={editing} onFieldChange={handleFieldChange} />
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
                  <Field label="Recognition Status" value={profile.ugcRecognition.recognitionStatus} field="recognitionStatus" section="ugcRecognition" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Section 2(f)" value={profile.ugcRecognition.section2f} field="section2f" section="ugcRecognition" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Section 12(B)" value={profile.ugcRecognition.section12b} field="section12b" section="ugcRecognition" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Recognition Date" value={profile.ugcRecognition.recognitionDate} field="recognitionDate" section="ugcRecognition" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Letter Number" value={profile.ugcRecognition.letterNumber} field="letterNumber" section="ugcRecognition" editing={editing} onFieldChange={handleFieldChange} />
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
                  <Field label="Approval Status" value={profile.aicteApprovals.approvalStatus} field="approvalStatus" section="aicteApprovals" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Application ID" value={profile.aicteApprovals.applicationId} field="applicationId" section="aicteApprovals" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Approval Year" value={profile.aicteApprovals.approvalYear} field="approvalYear" section="aicteApprovals" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="EOA" value={profile.aicteApprovals.eoa} field="eoa" section="aicteApprovals" editing={editing} onFieldChange={handleFieldChange} />
                  <Field label="Permanent ID" value={profile.aicteApprovals.permanentId} field="permanentId" section="aicteApprovals" editing={editing} onFieldChange={handleFieldChange} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};
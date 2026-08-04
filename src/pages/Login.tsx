import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserRole } from '@/types/auth.types';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

type LoginState = 'idle' | 'loading' | 'success' | 'error';

const getRoleBasedRedirect = (role: UserRole): string => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return '/admin/dashboard';
    case UserRole.DEPARTMENT_COORDINATOR:
      return '/app/department-repository';
    case UserRole.INFRASTRUCTURE_COORDINATOR:
      return '/app/infrastructure-repository';
    case UserRole.FINANCE_COORDINATOR:
      return '/app/finance-repository';
    case UserRole.TPO_COORDINATOR:
      return '/app/tpo-repository';
    case UserRole.STUDENT_DEVELOPMENT_COORDINATOR:
      return '/app/student-development-repository';
    case UserRole.EXAMINATION_OFFICER:
      return '/app/examination-repository';
    case UserRole.HEAD_OF_DEPARTMENT:
      return '/app/hod-dashboard';
    case UserRole.PRINCIPAL:
      return '/app/principal-dashboard';
    case UserRole.IQAC_COORDINATOR:
      return '/app/iqac-dashboard';
    case UserRole.INSTITUTION_ADMIN:
      return '/app/dashboard';
    default:
      return '/app/dashboard';
  }
};

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, resetError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    resetError();
    setLoginState('loading');
    try {
      // RHF + zodResolver can widen the submitted value type; normalize to the
      // LoginCredentials shape before handing it to the auth service.
      const response = await login({ email: data.email ?? '', password: data.password ?? '' });
      if (rememberMe) {
        localStorage.setItem('accreditpro-remember', data.email);
      } else {
        localStorage.removeItem('accreditpro-remember');
      }
      setLoginState('success');
      setSuccessMessage(`Welcome back, ${response.user.firstName}!`);
      // Brief delay to show success state before redirect
      setTimeout(() => {
        const redirectPath = getRoleBasedRedirect(response.user.role);
        navigate(redirectPath, { replace: true });
      }, 800);
    } catch {
      setLoginState('error');
    }
  };

  const fillDemoCredentials = (email: string) => {
    setValue('email', email);
    setValue('password', 'admin123');
  };

  const demoAccounts = [
    { label: 'Super Admin', email: 'superadmin@accreditpro.com', role: 'Platform Admin' },
    { label: 'Institution Admin', email: 'institution@accreditpro.com', role: 'University Admin' },
    { label: 'IQAC Coordinator', email: 'iqac@accreditpro.com', role: 'Quality Assurance' },
    { label: 'Principal', email: 'principal@accreditpro.com', role: 'Academic Head' },
    { label: 'Dept. Coordinator', email: 'department@accreditpro.com', role: 'Department Lead' },
    { label: 'Infra. Coordinator', email: 'infrastructure@accreditpro.com', role: 'Infrastructure' },
    { label: 'Finance Coordinator', email: 'finance@accreditpro.com', role: 'Finance' },
    { label: 'TPO Coordinator', email: 'tpo@accreditpro.com', role: 'Placements' },
    { label: 'Student Dev. Coordinator', email: 'studentdev@accreditpro.com', role: 'Student Activities' },
    { label: 'Examination Officer', email: 'examination@accreditpro.com', role: 'Examinations' },
    { label: 'Head of Department', email: 'hod@accreditpro.com', role: 'Department Quality' },
  ];

  return (
    <div className="w-full">
      {/* Logo & Brand - Mobile */}
      <div className="flex items-center gap-3 mb-8 lg:hidden">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight">AccreditPro</span>
          <p className="text-xs text-muted-foreground">Institutional Excellence Platform</p>
        </div>
      </div>

      <Card className="border-0 shadow-none lg:border lg:shadow-xl lg:shadow-black/5">
        <CardHeader className="space-y-2 px-0 lg:px-8 lg:pt-8">
          <CardTitle className="text-2xl font-bold tracking-tight">Sign in to your account</CardTitle>
          <CardDescription className="text-base">
            Enter your credentials to access the accreditation platform
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 lg:px-8 lg:pb-8">
          {/* Success State */}
          {loginState === 'success' && (
            <Alert className="mb-5 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300 font-medium">
                {successMessage} Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {loginState === 'error' && error && (
            <Alert variant="destructive" className="mb-5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@institution.edu"
                autoComplete="email"
                {...register('email')}
                className={`h-11 transition-all ${errors.email ? 'border-destructive ring-1 ring-destructive/20' : 'focus:ring-2 focus:ring-primary/20'}`}
                disabled={isLoading || loginState === 'success'}
              />
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors hover:underline"
                  onClick={() => {
                    /* Forgot password flow placeholder */
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register('password')}
                  className={`h-11 pr-10 transition-all ${errors.password ? 'border-destructive ring-1 ring-destructive/20' : 'focus:ring-2 focus:ring-primary/20'}`}
                  disabled={isLoading || loginState === 'success'}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                disabled={isLoading || loginState === 'success'}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal text-muted-foreground cursor-pointer select-none"
              >
                Remember me for 30 days
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
              disabled={isLoading || loginState === 'success'}
            >
              {loginState === 'loading' || isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : loginState === 'success' ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Signed in successfully
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-medium">Demo Accounts</span>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDemoCredentials(account.email)}
                disabled={isLoading || loginState === 'success'}
                className="w-full flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-2.5 text-left transition-all hover:bg-muted/50 hover:border-border hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {account.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{account.role}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono bg-background px-2 py-0.5 rounded border">
                  admin123
                </span>
              </button>
            ))}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <button type="button" className="text-primary hover:underline font-medium">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-primary hover:underline font-medium">
              Privacy Policy
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
import { Outlet } from 'react-router-dom';
import { Shield, CheckCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const features = [
  'NAAC & NBA Accreditation Management',
  'Automated Document Collection & Organization',
  'Real-time Progress Tracking & Analytics',
  'Multi-institution Support & Collaboration',
];

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Premium Branding (Stripe/Linear inspired) */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary/90 to-slate-900" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 -left-20 h-80 w-80 rounded-full bg-primary/30 blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 h-64 w-64 rounded-full bg-blue-500/20 blur-[80px]" />
        <div className="absolute top-2/3 left-1/3 h-48 w-48 rounded-full bg-violet-500/15 blur-[60px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full px-12 py-10">
          {/* Top - Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">AccreditPro</span>
          </div>

          {/* Center - Value Proposition */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white leading-tight mb-3">
                Streamline Your
                <br />
                Accreditation Journey
              </h2>
              <p className="text-base text-white/60 max-w-sm leading-relaxed">
                The modern platform for higher education institutions to manage accreditation processes with confidence and clarity.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <span className="text-sm text-white/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom - Stats */}
          <div className="flex gap-8">
            <div>
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-xs text-white/50 font-medium">Institutions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">50K+</p>
              <p className="text-xs text-white/50 font-medium">Documents</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="text-xs text-white/50 font-medium">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex w-full lg:w-[55%] flex-col">
        <div className="flex justify-end p-5">
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-[420px]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
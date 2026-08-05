import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { ImpersonationBanner } from '@/components/shared/ImpersonationBanner';

export function TPOCoordinatorLayout() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Impersonation banner (read-only preview by a Super Admin) */}
      <ImpersonationBanner />
      <Header />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

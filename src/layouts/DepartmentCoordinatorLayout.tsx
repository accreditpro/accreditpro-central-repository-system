import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { NotificationPanel } from '@/components/layout/NotificationPanel';
import { ImpersonationBanner } from '@/components/shared/ImpersonationBanner';
import { motion } from 'framer-motion';

export const DepartmentCoordinatorLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Impersonation banner (read-only preview by a Super Admin) */}
      <ImpersonationBanner />

      {/* Main Content - No outer sidebar */}
      <div className="flex flex-col min-h-screen w-full min-w-0 max-w-full overflow-hidden">
        <Header onMobileMenuOpen={() => {}} hideMobileMenuButton />
        <main className="flex-1 w-full min-w-0 max-w-full overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full w-full min-w-0 max-w-full overflow-hidden"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Notification Panel */}
      <NotificationPanel />
    </div>
  );
};

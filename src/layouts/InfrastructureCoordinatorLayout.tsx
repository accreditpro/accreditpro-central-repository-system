import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { NotificationPanel } from '@/components/layout/NotificationPanel';
import { motion } from 'framer-motion';

export const InfrastructureCoordinatorLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content - No outer sidebar */}
      <div className="flex flex-col min-h-screen">
        <Header onMobileMenuOpen={() => {}} hideMobileMenuButton />
        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full"
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
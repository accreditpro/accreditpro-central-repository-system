import { Outlet } from 'react-router-dom';
import { NotificationPanel } from '@/components/layout/NotificationPanel';
import { motion } from 'framer-motion';

export const InfrastructureCoordinatorLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="h-full"
        >
          <Outlet />
        </motion.div>
      </main>
      <NotificationPanel />
    </div>
  );
};
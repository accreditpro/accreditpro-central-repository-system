// src/layouts/FinanceCoordinatorLayout.tsx
import { Outlet } from 'react-router-dom';
import { NotificationPanel } from '@/components/layout/NotificationPanel';

export function FinanceCoordinatorLayout() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <NotificationPanel />
    </div>
  );
}
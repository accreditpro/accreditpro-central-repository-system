import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';

export function ExaminationOfficerLayout() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

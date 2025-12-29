import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/sonner';
export default function App() {
  return (
    <AppLayout container contentClassName="relative min-h-screen">
      <Outlet />
      <Toaster richColors closeButton position="top-right" />
    </AppLayout>
  );
}
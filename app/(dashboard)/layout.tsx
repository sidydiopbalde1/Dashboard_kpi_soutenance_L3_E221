// app/(dashboard)/layout.tsx
'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
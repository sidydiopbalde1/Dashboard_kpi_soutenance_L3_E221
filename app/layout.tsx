// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dashboard KPI - Ligne d\'Embouteillage',
  description: 'Suivi en temps réel des indicateurs de performance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
          <AuthProvider>
            {children}
          </AuthProvider>
      </body>
    </html>
  );
}
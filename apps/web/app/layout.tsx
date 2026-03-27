import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import QueryProvider from '@/lib/query-provider';
import Header from '@/components/layout/header';
import DemoSwitcher from '@/components/demo-switcher';
import DemoBanner from '@/components/demo-banner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BookIt - Online Booking System',
  description: 'Book appointments with top-rated service providers in your area.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <DemoBanner />
          <Header />
          <main>{children}</main>
          <DemoSwitcher />
        </QueryProvider>
      </body>
    </html>
  );
}

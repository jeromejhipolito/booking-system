'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../stores/auth-store';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();

  if (isHydrated && !isAuthenticated) {
    router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}

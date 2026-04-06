'use client';

import { usePathname } from 'next/navigation';
import { useSidebarLayout } from '@/components/layout/SidebarLayoutContext';
import { MedicalDisclaimer } from '@/components/trust/MedicalDisclaimer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebarLayout();

  const isAuthPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname?.startsWith("/auth/") ||
    pathname === "/onboarding" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/unsubscribed";
  
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[100dvh] min-h-screen bg-canvas">
      <main
        className={`min-h-[100dvh] min-h-screen pt-[var(--app-mobile-header-offset)] pb-[var(--app-mobile-tabbar-offset)] transition-[margin] duration-300 ease-in-out lg:pb-0 lg:pt-0 ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="pt-4 pb-4 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] md:pt-6 md:pb-6 md:pl-[max(1.5rem,env(safe-area-inset-left,0px))] md:pr-[max(1.5rem,env(safe-area-inset-right,0px))] lg:p-8">
          {children}
          <footer className="mt-10 max-w-3xl border-t border-stone-200/80 pt-5 lg:mt-14" aria-label="Health notice">
            <MedicalDisclaimer />
          </footer>
        </div>
      </main>
    </div>
  );
}

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
        <div className="pt-3 pb-3 pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] sm:pt-4 sm:pb-4 sm:pl-[max(1rem,env(safe-area-inset-left,0px))] sm:pr-[max(1rem,env(safe-area-inset-right,0px))] md:pt-6 md:pb-6 md:pl-[max(1.25rem,env(safe-area-inset-left,0px))] md:pr-[max(1.25rem,env(safe-area-inset-right,0px))] lg:p-8">
          {children}
          <footer className="mt-8 max-w-3xl border-t border-stone-200/80 pt-4 text-sm lg:mt-14 lg:pt-5 lg:text-base" aria-label="Health notice">
            <MedicalDisclaimer />
          </footer>
        </div>
      </main>
    </div>
  );
}

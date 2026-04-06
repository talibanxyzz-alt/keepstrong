'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import {
  Home,
  Dumbbell,
  TrendingUp,
  Camera,
  Settings,
  Calendar,
  Award,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Clock,
  Utensils,
  LayoutGrid,
  MoreHorizontal,
  Ruler,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useNotificationCounts } from '@/hooks/useNotificationCounts';
import { useActiveWorkoutSession } from '@/hooks/useActiveWorkoutSession';
import { useSidebarLayout } from '@/components/layout/SidebarLayoutContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  exact?: boolean;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'today',
    title: 'Today',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: Home, exact: true },
      { href: '/dashboard/protein', label: 'Protein', icon: Utensils },
    ],
  },
  {
    id: 'training',
    title: 'Training',
    items: [
      { href: '/workouts', label: 'Workouts', icon: Dumbbell },
      { href: '/workouts/programs', label: 'Programs', icon: LayoutGrid },
      { href: '/workouts/history', label: 'History', icon: Clock },
    ],
  },
  {
    id: 'track',
    title: 'Track',
    items: [
      { href: '/progress', label: 'Progress', icon: TrendingUp, exact: true },
      { href: '/progress/measurements', label: 'Measurements', icon: Ruler },
      { href: '/photos', label: 'Photos', icon: Camera },
      { href: '/dose-calendar', label: 'Dose calendar', icon: Calendar },
    ],
  },
  {
    id: 'you',
    title: 'You',
    items: [
      { href: '/achievements', label: 'Achievements', icon: Award },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

/** Routes covered by the bottom bar “More” tab (not in the four primary tabs). */
const MORE_TAB_ROUTES = [
  '/workouts/programs',
  '/workouts/history',
  '/workouts/active',
  '/progress/measurements',
  '/photos',
  '/dose-calendar',
  '/achievements',
  '/settings',
  '/pricing',
] as const;

function isItemActive(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function isMoreTabRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return MORE_TAB_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

const MOBILE_TAB_ITEMS: NavItem[] = [
  NAV_GROUPS[0].items[0],
  NAV_GROUPS[0].items[1],
  NAV_GROUPS[1].items[0],
  NAV_GROUPS[2].items[0],
];

/** Matches warm sidebar / drawer surface so focus rings don’t look “cut off.” */
const focusRingWarm =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f2ee]';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, setIsCollapsed } = useSidebarLayout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const notifications = useNotificationCounts();
  const hasLiveWorkout = useActiveWorkoutSession(pathname ?? null);

  const navItemsWithBadges = useMemo(() => {
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.map((item) =>
        item.href === '/achievements' && notifications.achievements > 0
          ? { ...item, badge: notifications.achievements }
          : item
      ),
    }));
  }, [notifications.achievements]);

  const isAuthPage =
    pathname === '/' ||
    pathname === '/auth/login' ||
    pathname === '/auth/signup' ||
    pathname?.startsWith('/auth/') ||
    pathname === '/onboarding' ||
    pathname === '/terms' ||
    pathname === '/privacy' ||
    pathname === '/unsubscribed';

  const moreTabActive = isMoreTabRoute(pathname ?? null) || isMobileMenuOpen;

  const loadUserProfile = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || '');
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthPage) {
      void loadUserProfile();
    }
  }, [isAuthPage, loadUserProfile]);

  useEffect(() => {
    if (isAuthPage) setIsMobileMenuOpen(false);
  }, [isAuthPage, pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isAuthPage) return;

    function handleKey(e: KeyboardEvent) {
      if (!e.metaKey && !e.ctrlKey) return;

      const routes: Record<string, string> = {
        '1': '/dashboard',
        '2': '/dashboard/protein',
        '3': '/workouts',
        '4': '/progress',
        '5': '/dose-calendar',
      };

      if (routes[e.key]) {
        e.preventDefault();
        router.push(routes[e.key]);
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [router, isAuthPage]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  }

  function renderNavLink(
    item: NavItem,
    opts?: { onNavigate?: () => void; compact?: boolean }
  ) {
    const compact = opts?.compact ?? isCollapsed;
    const Icon = item.icon;
    const isActive = isItemActive(pathname, item);
    const showLive = item.href === '/workouts' && hasLiveWorkout;

    return (
      <Link
        href={item.href}
        onClick={opts?.onNavigate}
        aria-current={isActive ? 'page' : undefined}
        className={`
          group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium
          motion-safe:transition-[background-color,color,box-shadow] motion-safe:duration-200 motion-reduce:transition-none
          ${
            isActive
              ? 'bg-stone-100/95 text-primary ring-1 ring-inset ring-primary/20 shadow-none'
              : 'text-stone-600 ring-1 ring-transparent hover:bg-stone-100/80 hover:text-stone-900'
          }
          ${compact ? 'justify-center px-2' : ''}
          ${focusRingWarm}
        `}
        title={compact ? (showLive ? `${item.label} — session in progress` : item.label) : showLive ? 'Session in progress' : undefined}
      >
        {isActive && (
          <span
            className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary motion-safe:transition-transform"
            aria-hidden
          />
        )}

        <span
          className={`
            relative flex flex-shrink-0 rounded-xl motion-safe:transition-colors motion-safe:duration-200
            ${compact ? 'p-1' : 'p-1.5'}
            ${
              isActive
                ? 'bg-white text-primary ring-1 ring-stone-200/90'
                : 'bg-stone-100/90 text-stone-600 group-hover:bg-stone-200/70 group-hover:text-stone-800'
            }
          `}
        >
          <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
          {showLive && (
            <span
              className="absolute -right-1 -top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full border-2 border-[#f4f2ee] bg-success shadow-sm motion-safe:animate-pulse motion-reduce:animate-none"
              title="Active workout"
              aria-hidden
            />
          )}
        </span>

        {!compact && (
          <>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-danger px-1.5 text-xs font-bold text-white shadow-sm">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </>
        )}
        {compact && item.badge && item.badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-0.5 text-[10px] font-bold text-white shadow-sm">
            {item.badge > 9 ? '9+' : item.badge}
          </span>
        )}
        {compact && (
          <span className="pointer-events-none absolute left-full z-[60] ml-2 whitespace-nowrap rounded-lg bg-stone-800 px-2.5 py-1.5 text-xs text-stone-50 opacity-0 shadow-lg motion-safe:transition-opacity group-hover:opacity-100">
            {item.label}
            {showLive ? ' · Live' : ''}
            {item.badge && item.badge > 0 ? ` (${item.badge})` : ''}
          </span>
        )}
      </Link>
    );
  }

  function QuickLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium">
        <Link
          href="/pricing"
          onClick={onNavigate}
          className={`text-stone-500 transition-colors hover:text-primary ${focusRingWarm} rounded px-0.5`}
        >
          Plan & billing
        </Link>
        <Link
          href="/privacy"
          onClick={onNavigate}
          className={`text-stone-500 transition-colors hover:text-primary ${focusRingWarm} rounded px-0.5`}
        >
          Privacy
        </Link>
      </div>
    );
  }

  if (isAuthPage) {
    return null;
  }

  return (
    <>
      {/* Mobile header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-stone-200/90 bg-[#faf9f7]/95 pt-[env(safe-area-inset-top,0px)] shadow-sm backdrop-blur-md lg:hidden">
        <div className="flex h-14 min-h-[3.5rem] items-center justify-between gap-3 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))]">
        <Link
          href="/dashboard"
          className={`group flex min-w-0 items-center gap-2.5 rounded-xl py-1 pr-2 ${focusRingWarm}`}
        >
          <div className="rounded-xl p-0.5 ring-2 ring-stone-200/90 transition-shadow group-hover:ring-stone-300/90">
            <Logo
              size={38}
              showText={false}
              iconShellClassName="rounded-xl bg-white shadow-sm ring-1 ring-stone-200/80"
            />
          </div>
          <div className="min-w-0 leading-tight">
            <span className="block truncate text-base font-semibold tracking-tight text-stone-900">KeepStrong</span>
            <span className="block truncate text-[11px] font-medium text-stone-500">Muscle on GLP-1</span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((o) => !o)}
          className={`rounded-xl p-2.5 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 ${focusRingWarm}`}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden motion-safe:transition-[visibility] motion-safe:duration-300 ${
          isMobileMenuOpen ? 'visible' : 'invisible motion-safe:delay-300'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-charcoal/45 backdrop-blur-[3px] motion-safe:transition-opacity motion-safe:duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu overlay"
        />
        <div
          id="mobile-nav-drawer"
          className={`absolute bottom-0 left-0 top-[var(--app-mobile-header-offset)] flex w-[min(100%,21rem)] flex-col border-r border-stone-200/90 bg-[#f4f2ee] pl-[env(safe-area-inset-left,0px)] shadow-[8px_0_32px_-12px_rgba(28,25,23,0.06)] motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="shrink-0 border-b border-stone-200/80 bg-stone-100/90 px-5 py-4">
            <p className="text-sm font-semibold text-stone-800">Menu</p>
          </div>

          <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 pb-6">
            <div className="space-y-6">
              {navItemsWithBadges.map((group) => (
                <div key={group.id}>
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <p className="shrink-0 text-left text-xs font-semibold text-stone-500">{group.title}</p>
                    <span className="h-px min-w-0 flex-1 bg-gradient-to-r from-stone-200/90 to-transparent" aria-hidden />
                  </div>
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        {renderNavLink(item, {
                          onNavigate: () => setIsMobileMenuOpen(false),
                          compact: false,
                        })}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-auto border-t border-stone-200/80 pt-5">
              <QuickLinks onNavigate={() => setIsMobileMenuOpen(false)} />
              <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm">
                <Link
                  href="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 transition-colors hover:bg-stone-50/90 ${focusRingWarm}`}
                >
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-stone-700 text-sm font-semibold text-white shadow-inner ring-2 ring-stone-200/80"
                    aria-hidden
                  >
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-900">{userName}</p>
                    <p className="truncate text-xs text-stone-500">{userEmail}</p>
                  </div>
                </Link>
                <div className="h-px bg-stone-100" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className={`flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-stone-600 transition-colors hover:bg-red-50/80 hover:text-danger ${focusRingWarm}`}
                >
                  <LogOut className="h-4 w-4 shrink-0 opacity-80" />
                  Sign out
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar — hover expands when collapsed; leaving collapses (lg+ only; aside is hidden on small screens). */}
      <aside
        className={`
          relative isolate hidden h-screen w-64 flex-col border-r border-stone-200/90 bg-[#f4f2ee]
          shadow-[4px_0_24px_-12px_rgba(28,25,23,0.06)]
          motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-in-out
          lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:flex
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <div
          className={`relative z-10 flex border-b border-stone-200/80 bg-[#faf9f7]/95 backdrop-blur-sm ${
            isCollapsed ? 'min-h-[4.75rem] flex-col items-center justify-center gap-2 py-3' : 'min-h-[4.25rem] flex-row items-center gap-2 px-4 py-3'
          }`}
        >
          <Link
            href="/dashboard"
            className={`flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-lg ${isCollapsed ? 'justify-center' : ''} ${focusRingWarm}`}
          >
            <Logo
              size={isCollapsed ? 40 : 36}
              showText={false}
              iconShellClassName="rounded-xl bg-white shadow-sm ring-1 ring-stone-200/80"
            />
            {!isCollapsed && (
              <div className="min-w-0 leading-tight">
                <span className="block truncate text-base font-semibold tracking-tight text-stone-900">KeepStrong</span>
                <span className="block truncate text-[10px] font-medium text-stone-500">Muscle on GLP-1</span>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`shrink-0 rounded-xl border border-stone-200/90 bg-white p-2 text-stone-600 transition-colors hover:border-stone-300/90 hover:bg-stone-100 hover:text-stone-900 ${focusRingWarm}`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <nav className="relative z-10 flex min-h-0 flex-1 flex-col space-y-6 overflow-y-auto overflow-x-hidden p-3">
          {navItemsWithBadges.map((group) => (
            <div key={group.id}>
              {!isCollapsed && (
                <div className="mb-2 flex items-center gap-2 px-1">
                  <p className="shrink-0 text-left text-xs font-semibold text-stone-500">{group.title}</p>
                  <span className="h-px min-w-0 flex-1 bg-gradient-to-r from-stone-200/90 to-transparent" aria-hidden />
                </div>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.href}>{renderNavLink(item)}</li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="relative z-10 border-t border-stone-200/80 bg-[#faf9f7]/90 p-3 backdrop-blur-sm">
          {!isCollapsed && (
            <>
              <p className="mb-2 px-1 text-[10px] leading-relaxed text-stone-500">
                <span className="font-medium text-stone-600">Keyboard</span> — ⌘ or Ctrl +{' '}
                <kbd className="rounded border border-stone-200 bg-stone-100 px-1 py-0.5 font-mono text-[9px] text-stone-800">1</kbd>
                {'–'}
                <kbd className="rounded border border-stone-200 bg-stone-100 px-1 py-0.5 font-mono text-[9px] text-stone-800">5</kbd>
                <span className="text-stone-400"> · dashboard · dose</span>
              </p>
              <div className="mb-2 px-1">
                <QuickLinks />
              </div>
              <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm">
                <Link
                  href="/settings"
                  className={`flex items-center gap-3 p-2.5 transition-colors hover:bg-stone-50/90 ${focusRingWarm}`}
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-stone-700 text-sm font-semibold text-white shadow-inner ring-2 ring-stone-200/80"
                    aria-hidden
                  >
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-900">{userName}</p>
                    <p className="truncate text-xs text-stone-500">{userEmail}</p>
                  </div>
                </Link>
                <div className="h-px bg-stone-100" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-stone-600 transition-colors hover:bg-red-50/80 hover:text-danger ${focusRingWarm}`}
                >
                  <LogOut className="h-4 w-4 shrink-0 opacity-80" />
                  Sign out
                </button>
              </div>
            </>
          )}
          {isCollapsed && (
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/settings"
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-stone-700 text-sm font-semibold text-white shadow-inner ring-2 ring-stone-200/80 motion-safe:transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100 ${focusRingWarm}`}
                title={`${userName} — Settings`}
              >
                {userName.charAt(0).toUpperCase()}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className={`rounded-xl border border-danger/25 bg-white p-2 text-danger transition-colors hover:bg-danger-muted ${focusRingWarm}`}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav
        className="fixed bottom-2 z-40 rounded-2xl border border-stone-200/90 bg-[#faf9f7]/95 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-1.5 shadow-[0_8px_28px_-8px_rgba(28,25,23,0.08)] backdrop-blur-md lg:hidden left-[max(0.75rem,env(safe-area-inset-left,0px))] right-[max(0.75rem,env(safe-area-inset-right,0px))] md:left-1/2 md:right-auto md:w-[min(26rem,calc(100vw-1.5rem-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px)))] md:-translate-x-1/2"
        aria-label="Primary"
      >
        <ul className="flex min-h-[3.25rem] items-stretch justify-between gap-0.5 px-1 sm:gap-1 sm:px-2 md:px-2.5">
          {MOBILE_TAB_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(pathname, item);
            const isWorkouts = item.href === '/workouts';
            return (
              <li key={item.href} className="min-w-0 flex-1">
                <Link
                  href={item.href}
                  className={`
                    relative flex min-h-[2.75rem] flex-col items-center justify-center gap-0.5 rounded-xl py-2 motion-safe:transition-colors motion-safe:duration-200
                    ${isActive ? 'text-primary' : 'text-stone-600 hover:bg-stone-100/90'}
                    ${focusRingWarm}
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="relative">
                    <span
                      className={`flex rounded-lg p-1 motion-safe:transition-all ${
                        isActive ? 'bg-primary/12 text-primary shadow-sm' : 'text-stone-600'
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.25px]' : ''}`} />
                    </span>
                    {isWorkouts && hasLiveWorkout && (
                      <span
                        className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-[#faf9f7] bg-success motion-safe:animate-pulse motion-reduce:animate-none"
                        aria-hidden
                      />
                    )}
                  </span>
                  <span
                    className={`max-w-full truncate px-0.5 text-[10px] ${isActive ? 'font-semibold' : 'font-medium text-stone-600'}`}
                  >
                    {item.label === 'Dose calendar' ? 'Dose' : item.label.split(' ')[0]}
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`
                flex min-h-[2.75rem] w-full flex-col items-center justify-center gap-0.5 rounded-xl py-2 motion-safe:transition-colors motion-safe:duration-200
                ${moreTabActive ? 'text-primary' : 'text-stone-600 hover:bg-stone-100/90'}
                ${focusRingWarm}
              `}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-drawer"
            >
              <span
                className={`flex rounded-lg p-1 motion-safe:transition-all ${
                  moreTabActive ? 'bg-primary/12 text-primary shadow-sm' : ''
                }`}
              >
                <MoreHorizontal className={`h-6 w-6 ${moreTabActive ? 'stroke-[2.25px]' : ''}`} />
              </span>
              <span
                className={`text-[10px] ${moreTabActive ? 'font-semibold' : 'font-medium text-stone-600'}`}
              >
                More
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

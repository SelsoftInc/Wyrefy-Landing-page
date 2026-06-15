"use client";

import type { LucideIcon } from "lucide-react";
import { LogOut, Loader2, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/src/components/ui/brand-logo";
import { UserProfileMenu } from "@/src/components/user/user-profile-menu";
import { logout } from "@/src/features/auth/api";
import { FloatingDock } from "@/src/components/ui/floating-dock";
import { SmoothScroll } from "@/src/components/ui/SmoothScroll";

export type NavItem = {
  label: string;
  href: string;
  Icon: LucideIcon;
};

export function DashboardShell({ nav, homeHref, children }: Readonly<{ nav: NavItem[]; homeHref: string; children: ReactNode }>) {
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isProjectDetailRoute = /^\/(individual|organization)\/projects\/[^/]+$/.test(pathname);
  const scrolledClass = "bg-[var(--card)]/90 backdrop-blur-md border-b border-[var(--border)]/15 shadow-xl shadow-black/5 dark:shadow-black/25";
  const unscrolledClass = "bg-white/40 dark:bg-black/15 border-b border-transparent shadow-none";

  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;
    let lastScrolled = false;

    const handleScroll = (e: Event) => {
      const scrollTop = (e.currentTarget as HTMLElement).scrollTop;
      const nowScrolled = scrollTop > 10;

      // Header: direct DOM class swap — zero React re-renders
      if (nowScrolled !== lastScrolled && headerRef.current) {
        lastScrolled = nowScrolled;
        if (nowScrolled) {
          headerRef.current.classList.remove(...unscrolledClass.split(" "));
          headerRef.current.classList.add(...scrolledClass.split(" "));
        } else {
          headerRef.current.classList.remove(...scrolledClass.split(" "));
          headerRef.current.classList.add(...unscrolledClass.split(" "));
        }
      }

      // Content: disable pointer events during scroll via direct DOM — zero React re-renders
      if (contentRef.current) {
        contentRef.current.style.pointerEvents = "none";
      }
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.pointerEvents = "";
        }
      }, 150);
    };

    const container = document.getElementById("main-scroll-container");
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  async function onLogout() {
    setIsLoggingOut(true);
    await logout().catch(() => null);
    replace("/login");
  }

  // Construct dock items from nav
  const dockItems = nav.map(({ label, href, Icon }) => ({
    title: label,
    icon: <Icon className="h-full w-full" />,
    href,
  }));

  return (
    <main className="blue-atmosphere page-motion h-screen w-full text-[var(--foreground)] overflow-hidden flex justify-center">
      <div 
        className="relative w-full h-full flex flex-row overflow-hidden bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--background)]"
      >
        {/* Header - uses ref so scroll state changes bypass React re-render */}
        <header
          ref={headerRef}
          className={`absolute top-0 left-0 right-0 z-40 flex h-24 shrink-0 items-center justify-between transition-[background-color,border-color,box-shadow] duration-300 px-8 md:px-16 lg:px-[5vw] xl:px-[8vw] 2xl:px-[12vw] rounded-bl-2xl rounded-br-2xl [transform:translateZ(0)] ${unscrolledClass}`}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex size-10 lg:hidden items-center justify-center rounded-xl bg-[var(--surface)] hover:bg-[var(--surface)]/80 text-[var(--foreground)] border border-[var(--border)] transition-all active:scale-95 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <Link href={homeHref} className="flex items-center gap-2 group ml-2">
              <BrandLogo className="size-12 shrink-0 transition-transform group-hover:scale-110" />
              <span className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400 transition-opacity group-hover:opacity-80 inline-block px-1.5 pb-2">Wyrefy</span>
            </Link>
          </div>
          
          {/* User Profile Menu */}
          <UserProfileMenu />
        </header>

        {/* Sidebar */}
        <aside 
          className="hidden h-full flex-col p-6 pt-28 lg:flex bg-transparent relative z-30 w-20 items-center px-2 cursor-default justify-center"
        >
          {/* Middle Navigation with Vertical FloatingDock */}
          <nav className="flex-1 flex flex-col justify-center items-center w-full">
            <FloatingDock items={dockItems} />
          </nav>
          
          <div className="mt-auto pt-6 w-full px-1">
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onLogout(); }} 
              disabled={isLoggingOut}
              data-tooltip="Log out"
              className="group flex items-center justify-center gap-3 rounded-full border border-slate-300 dark:border-white/10 bg-transparent font-medium transition-all duration-300 ease-out hover:scale-[1.03] active:scale-[0.98] size-12 mx-auto px-0 hover:border-slate-500/40 dark:hover:border-white/20 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
            >
              {isLoggingOut ? (
                <Loader2 size={18} className="animate-spin text-red-500 shrink-0" />
              ) : (
                <LogOut size={18} className="transition-transform duration-300 group-hover:scale-110" />
              )}
            </button>
          </div>
        </aside>

        {isProjectDetailRoute ? (
          <div className="relative z-10 min-w-0 flex-1 overflow-hidden flex flex-col h-full bg-transparent pt-24">
            <div className="flex-1 min-h-0 flex flex-col">
              {children}
            </div>
          </div>
        ) : (
          <SmoothScroll 
            root={false}
            id="main-scroll-container"
            className="relative z-10 min-w-0 flex-1 overflow-x-hidden custom-scrollbar flex flex-col h-full bg-transparent overflow-y-auto"
          >
            <div ref={contentRef} className="relative flex-1 px-8 pb-6 pt-28 md:px-16 lg:px-[5vw] xl:px-[8vw] 2xl:px-[12vw] md:pb-8 md:pt-32 flex flex-col gap-6 min-h-0">
              {/* Dynamic Local Section Title */}
              {nav.some((item) => item.href === pathname) && (
                <div className="flex flex-col shrink-0">
                  <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                    {nav.find((item) => item.href === pathname)?.label}
                  </h1>
                  <div className="h-1 w-12 bg-blue-500 rounded-full mt-2.5" />
                </div>
              )}
              
              <div className="flex-1 min-h-0 flex flex-col">
                {children}
              </div>
            </div>
          </SmoothScroll>
        )}
      </div>
 
      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden animate-in fade-in duration-200">
          {/* Glassmorphic Backdrop */}
          <button 
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-[#0a192f]/55 border-none w-full h-full cursor-default"
          />
          
          {/* Drawer Content */}
          <aside className="absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] flex flex-col border-r border-[var(--border)] bg-[var(--card)] p-6 shadow-xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-8 w-full px-2">
              <Link 
                href={homeHref} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-2xl font-semibold tracking-tight"
              >
                <BrandLogo className="size-10 shrink-0" />
                <span>Wyrefy</span>
              </Link>
              <button 
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="size-8 flex items-center justify-center rounded-xl bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20 text-[var(--foreground)] transition-all cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X size={18} />
              </button>
            </div>
            
            <nav className="flex-1 space-y-2 w-full">
              {nav.map(({ label, href, Icon }) => {
                const active = pathname === href;
                return (
                  <Link 
                    key={href} 
                    href={href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 w-full text-sm font-medium transition-colors duration-150 group
                      ${active 
                        ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] text-white shadow-lg shadow-[var(--accent)]/20" 
                        : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)] hover:translate-x-1"
                      }`}
                  >
                    <Icon size={20} strokeWidth={active ? 3 : 2.5} className="shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </nav>
            
            <div className="mt-auto pt-6 w-full">
              <button 
                type="button"
                onClick={() => { setIsMobileMenuOpen(false); onLogout(); }} 
                disabled={isLoggingOut}
                className={`group flex items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] font-medium transition-colors duration-150 hover:border-red-500/50 hover:bg-red-500/5 hover:text-red-500 w-full px-5 py-3.5 text-sm
                  ${isLoggingOut ? "opacity-50 pointer-events-none" : ""}`}
              >
                {isLoggingOut ? (
                  <Loader2 size={18} className="animate-spin text-red-500 shrink-0" />
                ) : (
                  <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
                )}
                <span>
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

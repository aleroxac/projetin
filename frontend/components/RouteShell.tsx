"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { AppShellProvider, useAppShell } from "@/components/AppShellContext";

function ShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { headerAction, setHeaderAction } = useAppShell();
  const [authChecked, setAuthChecked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");

  const routeMeta = useMemo(() => {
    if (pathname === "/dashboard") {
      return {
        activeNav: "Dashboard",
        title: "Daily Overview",
        subtitle: "Today",
      };
    }
    if (pathname === "/assessments") {
      return {
        activeNav: "Assessments",
        title: "Assessments",
        subtitle: "Body composition and health metrics",
      };
    }
    if (pathname === "/projects") {
      return {
        activeNav: "Projects",
        title: "Projects",
        subtitle: "Structure your planning flow",
      };
    }
    if (pathname === "/nutrition") {
      return {
        activeNav: "Nutrition",
        title: "Nutrition",
        subtitle: "AI-powered macro estimation",
      };
    }
    return null;
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (!e.matches) setSidebarOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!routeMeta) {
      setAuthChecked(true);
      return;
    }

    const hasUser = Boolean(localStorage.getItem("projetin:user:id"));
    if (!hasUser) {
      router.replace("/");
      return;
    }

    setUserName(localStorage.getItem("projetin:user:name") ?? "");
    setAuthChecked(true);
  }, [routeMeta, router]);

  useEffect(() => {
    if (pathname !== "/dashboard") {
      setHeaderAction(null);
    }
  }, [pathname, setHeaderAction]);

  // Close sidebar on navigation on mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname, isMobile]);

  if (!routeMeta) {
    return <>{children}</>;
  }

  if (!authChecked) {
    return null;
  }

  return (
    <div
      className="h-screen overflow-hidden"
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "15.7rem 1fr",
        gridTemplateRows: isMobile ? "3.86rem 1fr" : "3.86rem 1fr 2.86rem",
      }}
    >
      {/* Backdrop overlay when mobile sidebar is open */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeNav={routeMeta.activeNav}
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Header
        onAddWidget={pathname === "/dashboard" ? headerAction ?? undefined : undefined}
        title={routeMeta.title}
        subtitle={routeMeta.subtitle}
        isMobile={isMobile}
        userName={userName}
      />

      <main
        className="overflow-y-auto"
        style={{
          gridRow: "2",
          gridColumn: isMobile ? "1" : "2",
          background: "var(--bg)",
          padding: isMobile ? "1rem" : "1.25rem 1.5rem",
          paddingBottom: isMobile ? "calc(3.75rem + env(safe-area-inset-bottom, 0px) + 1rem)" : undefined,
        }}
      >
        {children}
      </main>

      {isMobile && (
        <BottomNav
          activeNav={routeMeta.activeNav}
          onProfileClick={() => setSidebarOpen(true)}
        />
      )}

      {!isMobile && <Footer />}
    </div>
  );
}

export default function RouteShell({ children }: { children: ReactNode }) {
  return (
    <AppShellProvider>
      <ShellFrame>{children}</ShellFrame>
    </AppShellProvider>
  );
}

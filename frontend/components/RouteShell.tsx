"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AppShellProvider, useAppShell } from "@/components/AppShellContext";

function ShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { headerAction, setHeaderAction } = useAppShell();
  const [authChecked, setAuthChecked] = useState(false);

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
    if (!routeMeta) {
      setAuthChecked(true);
      return;
    }

    const hasUser = Boolean(localStorage.getItem("projetin:user:id"));
    if (!hasUser) {
      router.replace("/");
      return;
    }

    setAuthChecked(true);
  }, [routeMeta, router]);

  useEffect(() => {
    if (pathname !== "/dashboard") {
      setHeaderAction(null);
    }
  }, [pathname, setHeaderAction]);

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
        gridTemplateColumns: "15.7rem 1fr",
        gridTemplateRows: "3.86rem 1fr 2.86rem",
      }}
    >
      <Sidebar activeNav={routeMeta.activeNav} />
      <Header
        onAddWidget={pathname === "/dashboard" ? headerAction ?? undefined : undefined}
        title={routeMeta.title}
        subtitle={routeMeta.subtitle}
      />

      <main
        className="overflow-y-auto p-5 px-6"
        style={{ gridRow: "2", gridColumn: "2", background: "var(--bg)" }}
      >
        {children}
      </main>

      <Footer />
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

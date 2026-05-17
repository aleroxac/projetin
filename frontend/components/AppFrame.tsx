"use client";

import { ReactNode, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface AppFrameProps {
  activeNav: string;
  children: ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  onAddWidget?: () => void;
}

export default function AppFrame({
  activeNav,
  children,
  headerTitle,
  headerSubtitle,
  onAddWidget,
}: AppFrameProps) {
  const [auxNav, setAuxNav] = useState(activeNav);

  return (
    <div
      className="h-screen overflow-hidden"
      style={{
        display: "grid",
        gridTemplateColumns: "15.7rem 1fr",
        gridTemplateRows: "3.86rem 1fr 2.86rem",
      }}
    >
      <Sidebar activeNav={auxNav} onNavChange={setAuxNav} />
      <Header
        onAddWidget={onAddWidget}
        title={headerTitle}
        subtitle={headerSubtitle}
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

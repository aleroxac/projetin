"use client";

import AppFrame from "@/components/AppFrame";
import ProjectsView from "@/components/ProjectsView";

export default function ProjectsPage() {
  return (
    <AppFrame
      activeNav="Projects"
      headerTitle="Projects"
      headerSubtitle="Structure your planning flow"
    >
      <ProjectsView />
    </AppFrame>
  );
}

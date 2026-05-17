"use client";

import AppFrame from "@/components/AppFrame";
import AssessmentsView from "@/components/AssessmentsView";

export default function AssessmentsPage() {
  return (
    <AppFrame
      activeNav="Assessments"
      headerTitle="Assessments"
      headerSubtitle="Body composition and health metrics"
    >
      <AssessmentsView />
    </AppFrame>
  );
}

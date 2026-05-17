"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const Onboarding = dynamic(() => import("@/components/Onboarding"), { ssr: false });

export default function OnboardingPage() {
  return (
    <Suspense>
      <Onboarding />
    </Suspense>
  );
}

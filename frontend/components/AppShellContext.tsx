"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type HeaderAction = (() => void) | null;

interface AppShellContextValue {
  headerAction: HeaderAction;
  setHeaderAction: (action: HeaderAction) => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [headerAction, setHeaderAction] = useState<HeaderAction>(null);

  const value = useMemo(
    () => ({ headerAction, setHeaderAction }),
    [headerAction]
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShell must be used within AppShellProvider");
  }
  return context;
}

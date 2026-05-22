import { createContext, useContext, useState, ReactNode } from "react";

export type Tab = "translate" | "editor" | "history";

export const tabs: { id: Tab; icon: string; label: string }[] = [
  { id: "translate", icon: "⠿", label: "점역기" },
  { id: "editor", icon: "⠶", label: "편집기" },
  { id: "history", icon: "⠒", label: "히스토리" },
];

interface TabContextType {
  tab: Tab;
  setTab: (tab: Tab) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function TabProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<Tab>("translate");

  return <TabContext.Provider value={{ tab, setTab }}>{children}</TabContext.Provider>;
}

export function useTab() {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error("useTab must be used within a TabProvider");
  }
  return context;
}

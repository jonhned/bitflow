"use client";

import { useState, type ReactNode } from "react";

type Tab = "instructions" | "editor" | "result";

interface ChallengeTabsProps {
  instructions: ReactNode;
  editor: ReactNode;
  result: ReactNode;
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "instructions", label: "Reto", icon: "📋" },
  { id: "editor", label: "Código", icon: "💻" },
  { id: "result", label: "Resultado", icon: "👁" },
];

export function ChallengeTabs({
  instructions,
  editor,
  result,
  activeTab: controlledTab,
  onTabChange,
}: ChallengeTabsProps) {
  const [internalTab, setInternalTab] = useState<Tab>("instructions");
  const activeTab = controlledTab ?? internalTab;

  const handleTabChange = (tab: Tab) => {
    if (onTabChange) onTabChange(tab);
    else setInternalTab(tab);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border bg-surface">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${
              activeTab === tab.id
                ? "text-neon border-b-2 border-neon bg-surface-alt"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "instructions" && (
          <div className="h-full overflow-y-auto p-4">{instructions}</div>
        )}
        {activeTab === "editor" && <div className="h-full">{editor}</div>}
        {activeTab === "result" && <div className="h-full">{result}</div>}
      </div>
    </div>
  );
}
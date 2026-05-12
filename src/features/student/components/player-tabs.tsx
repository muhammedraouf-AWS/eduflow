"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import { ChapterNotes } from "@/features/student/components/chapter-notes";
import { ChapterResources } from "@/features/student/components/chapter-resources";
import type { PlayerAttachment } from "@/features/student/queries/player";

interface PlayerTabsProps {
  chapterId: string;
  courseSlug: string;
  note: string | null;
  attachments: PlayerAttachment[];
  isEnrolled: boolean;
}

type TabId = "notes" | "resources";

export function PlayerTabs({
  chapterId,
  courseSlug,
  note,
  attachments,
  isEnrolled,
}: PlayerTabsProps) {
  const tabs: { id: TabId; label: string }[] = [
    ...(isEnrolled ? [{ id: "notes" as TabId, label: "Notes" }] : []),
    ...(attachments.length > 0 ? [{ id: "resources" as TabId, label: "Resources" }] : []),
  ];

  const [activeTab, setActiveTab] = useState<TabId>(tabs[0]?.id ?? "notes");

  // Reset to first tab when chapter changes
  useEffect(() => {
    if (tabs[0]) setActiveTab(tabs[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  if (tabs.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 pb-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "notes" && isEnrolled && (
        <ChapterNotes chapterId={chapterId} courseSlug={courseSlug} initialNote={note} />
      )}
      {activeTab === "resources" && (
        <ChapterResources attachments={attachments} />
      )}
    </div>
  );
}

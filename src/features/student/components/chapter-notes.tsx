"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { upsertNoteAction } from "@/features/student/actions/note";

interface ChapterNotesProps {
  chapterId: string;
  courseSlug: string;
  initialNote: string | null;
}

export function ChapterNotes({ chapterId, courseSlug, initialNote }: ChapterNotesProps) {
  const [text, setText] = useState(initialNote ?? "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    (body: string) => {
      startTransition(async () => {
        setSaveStatus("saving");
        await upsertNoteAction(chapterId, courseSlug, body);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      });
    },
    [chapterId, courseSlug],
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(val), 1500);
  };

  // Reset note when chapter changes
  useEffect(() => {
    setText(initialNote ?? "");
    setSaveStatus("idle");
  }, [chapterId, initialNote]);

  // Flush pending save on unmount
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Add a note for this chapter…"
        rows={6}
        className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex h-5 items-center gap-1.5 text-xs text-muted-foreground">
        {saveStatus === "saving" && (
          <>
            <Loader2 className="size-3 animate-spin" />
            <span>Saving…</span>
          </>
        )}
        {saveStatus === "saved" && (
          <>
            <CheckCircle2 className="size-3 text-emerald-500" />
            <span>Saved</span>
          </>
        )}
      </div>
    </div>
  );
}

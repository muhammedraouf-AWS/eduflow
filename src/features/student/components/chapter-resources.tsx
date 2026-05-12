import { Download, FileText } from "lucide-react";

import type { PlayerAttachment } from "@/features/student/queries/player";

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ChapterResourcesProps {
  attachments: PlayerAttachment[];
}

export function ChapterResources({ attachments }: ChapterResourcesProps) {
  if (attachments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No downloadable resources for this course.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {attachments.map((file) => (
        <li key={file.id}>
          <a
            href={`/api/attachments/${file.id}`}
            className="group flex items-center gap-3 rounded-md border bg-card p-3 text-sm transition-colors hover:bg-muted"
          >
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate font-medium">{file.name}</span>
            {file.fileSize && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatBytes(file.fileSize)}
              </span>
            )}
            <Download className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        </li>
      ))}
    </ul>
  );
}

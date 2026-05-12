"use client";

import { useRef, useState, useTransition } from "react";
import { Paperclip, Trash2, Upload, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { saveAttachmentAction, deleteAttachmentAction } from "@/features/instructor/actions/attachment";
import type { AttachmentForList } from "@/features/instructor/queries/attachments";

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentsManagerProps {
  courseId: string;
  initialAttachments: AttachmentForList[];
}

export function AttachmentsManager({ courseId, initialAttachments }: AttachmentsManagerProps) {
  const [attachments, setAttachments] = useState<AttachmentForList[]>(initialAttachments);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get signed upload payload
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, type: "attachment" }),
      });
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const { signature, timestamp, folder, apiKey, cloudName } =
        (await signRes.json()) as {
          signature: string;
          timestamp: number;
          folder: string;
          apiKey: string;
          cloudName: string;
        };

      // 2. Upload directly to Cloudinary (resource_type=raw for all file types)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        };
        xhr.onload = async () => {
          if (xhr.status < 200 || xhr.status >= 300) {
            reject(new Error("Upload failed"));
            return;
          }
          const data = JSON.parse(xhr.responseText) as {
            secure_url: string;
            original_filename: string;
            bytes: number;
            format: string;
          };

          // 3. Save to DB
          startTransition(async () => {
            const mimeType = file.type || null;
            const result = await saveAttachmentAction(
              courseId,
              file.name,
              data.secure_url,
              data.bytes ?? null,
              mimeType,
            );
            if ("error" in result) {
              toast.error(result.error);
            } else {
              setAttachments((prev) => [
                ...prev,
                {
                  id: result.attachmentId,
                  name: file.name,
                  url: data.secure_url,
                  fileSize: data.bytes ?? null,
                  mimeType,
                  createdAt: new Date(),
                },
              ]);
              toast.success("Resource uploaded");
            }
          });
          resolve();
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }

  function handleDelete(attachmentId: string) {
    startTransition(async () => {
      const result = await deleteAttachmentAction(attachmentId, courseId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
        toast.success("Resource removed");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Upload button */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading || isPending}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isPending}
          className="gap-2"
        >
          <Upload className="size-4" />
          {isUploading ? "Uploading…" : "Upload resource"}
        </Button>
        <p className="text-xs text-muted-foreground">PDF, ZIP, DOCX, MP4, and more</p>
      </div>

      {/* Progress bar */}
      {isUploading && uploadProgress !== null && (
        <div className="space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
        </div>
      )}

      {/* Attachment list */}
      {attachments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed p-6 text-center">
          <Paperclip className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No resources yet. Upload files for students to download.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {attachments.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2 text-sm"
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-medium">{file.name}</span>
              {file.fileSize && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatBytes(file.fileSize)}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(file.id)}
                disabled={isPending}
                className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive disabled:opacity-50"
                aria-label="Remove resource"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

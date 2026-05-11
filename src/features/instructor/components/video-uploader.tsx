"use client";

import { useRef, useState } from "react";
import { Loader2, Trash2, Upload, Video } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { updateChapterAction } from "@/features/instructor/actions/chapter";

const MAX_SIZE_MB = 500;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface VideoUploaderProps {
  courseId: string;
  chapterId: string;
  currentVideoUrl: string | null;
  currentDuration: number | null;
}

export function VideoUploader({
  courseId,
  chapterId,
  currentVideoUrl,
  currentDuration,
}: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentVideoUrl);
  const [duration, setDuration] = useState<number | null>(currentDuration);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`Video must be smaller than ${MAX_SIZE_MB} MB`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // 1. Get signature from server
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, chapterId, type: "video" }),
      });
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const { signature, timestamp, folder, apiKey, cloudName } = await signRes.json();

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      });

      const uploadResult = await new Promise<{ secure_url: string; duration: number }>(
        (resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error("Upload failed"));
            }
          };
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
          xhr.send(formData);
        },
      );

      const videoDuration = Math.round(uploadResult.duration ?? 0);

      // 3. Save to database
      const saveResult = await updateChapterAction(chapterId, courseId, {
        videoUrl: uploadResult.secure_url,
        videoDuration,
      });

      if ("error" in saveResult) throw new Error(saveResult.error);

      setPreview(uploadResult.secure_url);
      setDuration(videoDuration);
      toast.success("Video uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    const result = await updateChapterAction(chapterId, courseId, {
      videoUrl: null,
      videoDuration: null,
    });

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    setPreview(null);
    setDuration(null);
    toast.success("Video removed");
  }

  function formatDuration(secs: number) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="space-y-2">
          <video
            src={preview}
            controls
            className="w-full rounded-lg border bg-black"
            style={{ maxHeight: "280px" }}
          />
          {duration !== null && (
            <p className="text-xs text-muted-foreground">Duration: {formatDuration(duration)}</p>
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="size-3.5" />
              Replace video
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={handleRemove}
              disabled={uploading}
            >
              <Trash2 className="size-3.5" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="size-8 animate-spin" />
              <span className="text-sm">Uploading… {progress}%</span>
              <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <Video className="size-8" />
              <span className="text-sm font-medium">Click to upload video</span>
              <span className="text-xs">MP4, MOV, WebM — up to {MAX_SIZE_MB} MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

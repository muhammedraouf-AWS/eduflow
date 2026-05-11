"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { updateCourseAction } from "@/features/instructor/actions/course";

interface CloudinarySignPayload {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

interface ThumbnailUploaderProps {
  courseId: string;
  currentUrl: string | null;
}

export function ThumbnailUploader({ courseId, currentUrl }: ThumbnailUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }

    setUploading(true);

    try {
      // 1. Get signed upload payload from our API
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const { signature, timestamp, folder, apiKey, cloudName } =
        (await signRes.json()) as CloudinarySignPayload;

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData },
      );
      if (!uploadRes.ok) throw new Error("Cloudinary upload failed");
      const data = (await uploadRes.json()) as CloudinaryUploadResult;

      // 3. Save the URL to the database
      const saveResult = await updateCourseAction(courseId, {
        thumbnailUrl: data.secure_url,
      });
      if ("error" in saveResult) throw new Error(saveResult.error);

      setPreview(data.secure_url);
      toast.success("Thumbnail updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    const result = await updateCourseAction(courseId, { thumbnailUrl: null });
    if ("error" in result) {
      toast.error(result.error);
    } else {
      setPreview(null);
      toast.success("Thumbnail removed");
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-xl border bg-muted">
        {preview ? (
          <Image
            src={preview}
            alt="Course thumbnail"
            fill
            sizes="(max-width: 640px) 100vw, 384px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImagePlus className="size-8 opacity-40" />
            <span className="text-xs">No thumbnail</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-3.5" />
          {preview ? "Change image" : "Upload image"}
        </Button>

        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={uploading}
            onClick={handleRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
            Remove
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Recommended: 1280×720 px (16:9). JPG or PNG, max 5 MB.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

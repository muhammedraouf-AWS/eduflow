"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Camera, Loader2, Trash2, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { removeAvatarAction, updateAvatarAction } from "@/features/instructor/actions/settings";

interface CloudinarySignPayload {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
}

interface CloudinaryUploadResult {
  secure_url: string;
}

interface AvatarUploaderProps {
  currentUrl: string | null;
  userImage: string | null;
  name: string | null;
}

export function AvatarUploader({ currentUrl, userImage, name }: AvatarUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl);

  // Resolved display: custom upload → OAuth photo → null (shows initials)
  const displaySrc = preview ?? userImage;
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

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
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "avatar" }),
      });
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const { signature, timestamp, folder, apiKey, cloudName } =
        (await signRes.json()) as CloudinarySignPayload;

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

      const result = await updateAvatarAction(data.secure_url);
      if ("error" in result) throw new Error(String(result.error));

      setPreview(data.secure_url);
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    const result = await removeAvatarAction();
    if ("error" in result) {
      toast.error(String(result.error));
    } else {
      setPreview(null);
      toast.success("Avatar removed");
    }
  }

  return (
    <div className="flex items-center gap-5">
      {/* Avatar circle */}
      <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted">
        {displaySrc ? (
          <Image src={displaySrc} alt="Avatar" fill sizes="96px" className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            {name ? (
              <span className="text-2xl font-semibold text-muted-foreground">{initials}</span>
            ) : (
              <UserCircle2 className="size-10 text-muted-foreground/40" />
            )}
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="size-3.5" />
            {preview ? "Change photo" : "Upload photo"}
          </Button>

          {/* Only show Remove when a custom upload exists — not for OAuth fallback */}
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
        <p className="text-xs text-muted-foreground">JPG or PNG, max 5 MB. Square crop recommended.</p>
      </div>

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

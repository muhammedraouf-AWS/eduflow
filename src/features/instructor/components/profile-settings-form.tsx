"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/features/instructor/actions/settings";
import { updateProfileSchema } from "@/features/instructor/validations/settings";
import type { UpdateProfileInput } from "@/features/instructor/validations/settings";
import type { ProfileSettings } from "@/features/instructor/queries/settings";

interface ProfileSettingsFormProps {
  data: ProfileSettings;
}

export function ProfileSettingsForm({ data }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: data.user.name ?? "",
      headline: data.profile.headline ?? "",
      bio: data.profile.bio ?? "",
      website: data.profile.website ?? "",
      twitter: data.profile.twitter ?? "",
      linkedin: data.profile.linkedin ?? "",
    },
  });

  async function onSubmit(values: UpdateProfileInput) {
    setIsSubmitting(true);
    const result = await updateProfileAction(values);
    setIsSubmitting(false);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Profile saved");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Display name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Display name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Your full name"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      {/* Headline */}
      <div className="space-y-1.5">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          placeholder="e.g. Senior React Developer &amp; Educator"
          maxLength={120}
          aria-invalid={!!errors.headline}
          {...register("headline")}
        />
        <p className="text-xs text-muted-foreground">
          Short tagline shown on your courses and the instructor page. Max 120 characters.
        </p>
        {errors.headline && <p className="text-sm text-destructive">{errors.headline.message}</p>}
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell students about your background, expertise, and teaching style…"
          rows={5}
          maxLength={2000}
          aria-invalid={!!errors.bio}
          {...register("bio")}
        />
        <p className="text-xs text-muted-foreground">Max 2000 characters.</p>
        {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
      </div>

      {/* Social links */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Social links</h3>

        <div className="space-y-1.5">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://yoursite.com"
            aria-invalid={!!errors.website}
            {...register("website")}
          />
          {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="twitter">Twitter / X</Label>
          <div className="flex items-center rounded-md border focus-within:ring-2 focus-within:ring-ring">
            <span className="border-r bg-muted px-3 py-2 text-sm text-muted-foreground rounded-l-md select-none">
              x.com/
            </span>
            <Input
              id="twitter"
              placeholder="username"
              className="border-0 shadow-none focus-visible:ring-0"
              maxLength={50}
              aria-invalid={!!errors.twitter}
              {...register("twitter")}
            />
          </div>
          {errors.twitter && <p className="text-sm text-destructive">{errors.twitter.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            aria-invalid={!!errors.linkedin}
            {...register("linkedin")}
          />
          {errors.linkedin && <p className="text-sm text-destructive">{errors.linkedin.message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
        {!isDirty && (
          <p className="text-xs text-muted-foreground">No unsaved changes</p>
        )}
      </div>
    </form>
  );
}

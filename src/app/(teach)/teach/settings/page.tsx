import { notFound } from "next/navigation";

import { requireAuth } from "@/lib/session";
import { getInstructorProfileSettings } from "@/features/instructor/queries/settings";
import { AvatarUploader } from "@/features/instructor/components/avatar-uploader";
import { ProfileSettingsForm } from "@/features/instructor/components/profile-settings-form";

export const metadata = { title: "Profile Settings — EduFlow" };

export default async function SettingsPage() {
  const user = await requireAuth();
  const data = await getInstructorProfileSettings(user.id);
  if (!data) notFound();

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          This is your public instructor profile visible to students on your course pages.
        </p>
      </div>

      {/* Avatar */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold">Photo</h2>
        <AvatarUploader
          currentUrl={data.profile.avatarUrl}
          userImage={data.user.image}
          name={data.user.name}
        />
      </section>

      {/* Profile form */}
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold">Public profile</h2>
        <ProfileSettingsForm data={data} />
      </section>

      {/* Read-only account info */}
      <section className="rounded-xl border bg-card p-6 space-y-3">
        <h2 className="text-base font-semibold">Account</h2>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Email address</p>
          <p className="text-sm font-medium">{data.user.email}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Email cannot be changed here. Contact support if you need to update it.
        </p>
      </section>
    </div>
  );
}

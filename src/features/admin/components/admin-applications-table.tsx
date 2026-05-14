"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  approveApplicationAction,
  rejectApplicationAction,
} from "@/features/admin/actions/applications";
import type { AdminApplication } from "@/features/admin/queries/applications";

function Avatar({ name, image }: { name?: string | null; image?: string | null }) {
  return (
    <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
      {image ? (
        <Image src={image} alt={name ?? ""} fill sizes="36px" className="object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center text-xs font-semibold text-muted-foreground">
          {name?.charAt(0).toUpperCase() ?? "?"}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") return <Badge className="text-[11px]">Approved</Badge>;
  if (status === "REJECTED")
    return <Badge variant="destructive" className="text-[11px]">Rejected</Badge>;
  return <Badge variant="outline" className="text-[11px] border-amber-400 text-amber-600">Pending</Badge>;
}

function ApplicationRow({ app }: { app: AdminApplication }) {
  const [pending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [expanded, setExpanded] = useState(false);

  function handleApprove() {
    startTransition(async () => {
      const res = await approveApplicationAction(app.id);
      if ("error" in res) toast.error(res.error);
      else toast.success("Application approved — user is now an instructor.");
    });
  }

  function handleReject() {
    startTransition(async () => {
      const res = await rejectApplicationAction(app.id, reason);
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Application rejected.");
        setShowReject(false);
      }
    });
  }

  return (
    <div className="border-b last:border-0">
      <div className="flex items-start gap-4 px-5 py-4">
        {/* Applicant */}
        <Avatar name={app.user.name} image={app.user.image} />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-sm font-medium">{app.user.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{app.user.email}</p>
            </div>
            <StatusBadge status={app.status} />
            <span className="text-xs text-muted-foreground">
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(new Date(app.createdAt))}
            </span>
          </div>

          {/* Topics summary always visible */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Topics</p>
            <p className="text-sm">{app.topics}</p>
          </div>

          {/* Expandable full answers */}
          {expanded && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Motivation</p>
                <p className="text-sm whitespace-pre-wrap">{app.motivation}</p>
              </div>
              {app.experience && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Experience</p>
                  <p className="text-sm whitespace-pre-wrap">{app.experience}</p>
                </div>
              )}
              {app.rejectionReason && (
                <div>
                  <p className="text-xs font-medium text-destructive uppercase tracking-wide mb-1">Rejection reason</p>
                  <p className="text-sm text-muted-foreground">{app.rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-primary hover:underline"
          >
            {expanded ? "Show less" : "Read full application"}
          </button>

          {/* Reject form */}
          {showReject && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <p className="text-xs font-medium">Reason for rejection (shown to applicant)</p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="e.g. Application too brief. Please reapply with more detail about your experience."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" disabled={pending} onClick={handleReject}>
                  Confirm Reject
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReject(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Action buttons for pending */}
          {app.status === "PENDING" && !showReject && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-8 gap-1.5"
                disabled={pending}
                onClick={handleApprove}
              >
                <CheckCircle className="size-3.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-destructive hover:text-destructive"
                disabled={pending}
                onClick={() => setShowReject(true)}
              >
                <XCircle className="size-3.5" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AdminApplicationsTableProps {
  applications: AdminApplication[];
}

export function AdminApplicationsTable({ applications }: AdminApplicationsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {applications.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">No applications found.</p>
      )}
      {applications.map((app) => (
        <ApplicationRow key={app.id} app={app} />
      ))}
    </div>
  );
}

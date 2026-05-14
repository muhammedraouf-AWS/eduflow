"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SessionRefresher({ newRole }: { newRole: string }) {
  const { update } = useSession();
  const router = useRouter();

  useEffect(() => {
    update({ user: { role: newRole } }).then(() => {
      router.refresh();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

import type { Role } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: Role;
  }
}

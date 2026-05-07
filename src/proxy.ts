import { NextResponse } from "next/server";

import { auth } from "@/auth";

// Next.js 16 renamed middleware.ts → proxy.ts. Proxy runs on Node.js by
// default, so we can import `auth` from @/auth (which uses Prisma) directly.
export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/teach") ||
    pathname.startsWith("/admin");

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (isProtected && !isLoggedIn) {
    const next = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${next}`, req.nextUrl),
    );
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

import type { NextRequest } from "next/server";

import { handlers } from "@/auth";

// next-auth@beta.31 types declare handlers as (req) => Response, but the
// runtime also accepts a second context arg for Next.js 15+ async params.
// Cast to the broader signature to keep both TS and runtime happy.
type Handler = (
  req: NextRequest,
  ctx: { params: Record<string, string | string[]> },
) => Promise<Response>;

const get = handlers.GET as unknown as Handler;
const post = handlers.POST as unknown as Handler;

export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> },
) {
  return get(request, { params: await context.params });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> },
) {
  return post(request, { params: await context.params });
}

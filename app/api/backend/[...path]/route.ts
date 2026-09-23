import { NextRequest } from "next/server";
import { handleBackend } from "@/src/server/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleBackend(request, (await context.params).path);
}
export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE };

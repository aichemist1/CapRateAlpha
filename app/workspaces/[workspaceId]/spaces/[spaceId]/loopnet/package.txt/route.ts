import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { buildLoopnetPackageText, getLoopnetExportSummary } from "@/lib/loopnet";
import { requireWorkspaceAccess } from "@/lib/workspaces";

type LoopnetPackageRouteProps = {
  params: Promise<{
    workspaceId: string;
    spaceId: string;
  }>;
};

export async function GET(_request: Request, { params }: LoopnetPackageRouteProps) {
  const user = await requireUser();
  const { workspaceId, spaceId } = await params;
  await requireWorkspaceAccess(user, workspaceId);

  const summary = await getLoopnetExportSummary(workspaceId, spaceId);
  const body = buildLoopnetPackageText(summary);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="loopnet-package.txt"',
      "Cache-Control": "no-store"
    }
  });
}

import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type WorkspaceContext = {
  id: string;
  name: string;
  slug: string;
  defaultSpaceId: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function buildWorkspaceContext(name: string): WorkspaceContext {
  const slug = slugify(name) || "workspace";

  return {
    id: `ws-${slug}`,
    name,
    slug,
    defaultSpaceId: "space-001"
  };
}

export async function requireWorkspaceAccess(
  user: AuthUser,
  workspaceId: string
): Promise<WorkspaceContext> {
  if (!workspaceId) {
    redirect("/onboarding");
  }

  const admin = createSupabaseAdminClient();

  if (admin) {
    const { data: appUser } = await admin
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (appUser) {
      const { data: membership } = await admin
        .from("memberships")
        .select("workspace_id, workspaces(name, slug)")
        .eq("user_id", appUser.id)
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (membership && membership.workspaces) {
        const workspaceInfo = Array.isArray(membership.workspaces)
          ? membership.workspaces[0]
          : membership.workspaces;

        return {
          id: workspaceId,
          name: workspaceInfo?.name ?? "Workspace",
          slug: workspaceInfo?.slug ?? workspaceId.replace(/^ws-/, ""),
          defaultSpaceId: "space-001"
        };
      }
    }
  }

  return {
    id: workspaceId,
    name: "Workspace",
    slug: workspaceId.replace(/^ws-/, ""),
    defaultSpaceId: "space-001"
  };
}

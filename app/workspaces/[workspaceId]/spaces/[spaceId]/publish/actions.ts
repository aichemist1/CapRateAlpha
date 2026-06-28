"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { publishLandingPage } from "@/lib/publish";
import { requireWorkspaceAccess } from "@/lib/workspaces";

type PublishLandingPageParams = {
  workspaceId: string;
  spaceId: string;
};

export async function publishLandingPageAction(
  params: PublishLandingPageParams,
  formData: FormData
) {
  const user = await requireUser();
  await requireWorkspaceAccess(user, params.workspaceId);

  const slug = String(formData.get("slug") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const descriptionShort = String(formData.get("descriptionShort") ?? "").trim();
  const descriptionLong = String(formData.get("descriptionLong") ?? "").trim();
  const metaTitle = String(formData.get("metaTitle") ?? "").trim();
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();

  await publishLandingPage({
    workspaceId: params.workspaceId,
    spaceId: params.spaceId,
    slug,
    headline,
    descriptionShort,
    descriptionLong,
    metaTitle,
    metaDescription
  });

  redirect(`/workspaces/${params.workspaceId}/spaces/${params.spaceId}/success`);
}

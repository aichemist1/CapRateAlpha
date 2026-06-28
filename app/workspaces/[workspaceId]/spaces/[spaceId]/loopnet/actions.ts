"use server";

import { redirect } from "next/navigation";
import { uploadSpaceFloorplan, uploadSpacePhoto } from "@/lib/assets";
import { requireUser } from "@/lib/auth";
import { updateLoopnetExport } from "@/lib/loopnet";
import { requireWorkspaceAccess } from "@/lib/workspaces";

type LoopnetActionParams = {
  workspaceId: string;
  spaceId: string;
};

export async function saveLoopnetReadyAction(
  params: LoopnetActionParams,
  formData: FormData
) {
  const user = await requireUser();
  await requireWorkspaceAccess(user, params.workspaceId);

  const descriptionLoopnet = String(formData.get("descriptionLoopnet") ?? "").trim();

  await updateLoopnetExport({
    workspaceId: params.workspaceId,
    spaceId: params.spaceId,
    descriptionLoopnet,
    status: "ready"
  });

  redirect(
    `/workspaces/${params.workspaceId}/spaces/${params.spaceId}/loopnet?message=${encodeURIComponent("LoopNet package saved.")}`
  );
}

export async function markLoopnetExportedAction(
  params: LoopnetActionParams,
  formData: FormData
) {
  const user = await requireUser();
  await requireWorkspaceAccess(user, params.workspaceId);

  const descriptionLoopnet = String(formData.get("descriptionLoopnet") ?? "").trim();

  await updateLoopnetExport({
    workspaceId: params.workspaceId,
    spaceId: params.spaceId,
    descriptionLoopnet,
    status: "exported"
  });

  redirect(
    `/workspaces/${params.workspaceId}/spaces/${params.spaceId}/loopnet?message=${encodeURIComponent("Marked as exported to LoopNet.")}`
  );
}

export async function uploadLoopnetPhotoAction(
  params: LoopnetActionParams,
  formData: FormData
) {
  const user = await requireUser();
  await requireWorkspaceAccess(user, params.workspaceId);

  const file = formData.get("photo");

  if (!(file instanceof File)) {
    redirect(
      `/workspaces/${params.workspaceId}/spaces/${params.spaceId}/loopnet?message=${encodeURIComponent("Select a photo before uploading.")}`
    );
  }

  try {
    const result = await uploadSpacePhoto({
      workspaceId: params.workspaceId,
      spaceId: params.spaceId,
      file
    });

    redirect(
      `/workspaces/${params.workspaceId}/spaces/${params.spaceId}/loopnet?message=${encodeURIComponent(result.message)}`
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Photo upload could not be completed.";

    redirect(
      `/workspaces/${params.workspaceId}/spaces/${params.spaceId}/loopnet?message=${encodeURIComponent(message)}`
    );
  }
}

export async function uploadLoopnetFloorplanAction(
  params: LoopnetActionParams,
  formData: FormData
) {
  const user = await requireUser();
  await requireWorkspaceAccess(user, params.workspaceId);

  const file = formData.get("floorplan");

  if (!(file instanceof File)) {
    redirect(
      `/workspaces/${params.workspaceId}/spaces/${params.spaceId}/loopnet?message=${encodeURIComponent("Select a floorplan before uploading.")}`
    );
  }

  try {
    const result = await uploadSpaceFloorplan({
      workspaceId: params.workspaceId,
      spaceId: params.spaceId,
      file
    });

    redirect(
      `/workspaces/${params.workspaceId}/spaces/${params.spaceId}/loopnet?message=${encodeURIComponent(result.message)}`
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Floorplan upload could not be completed.";

    redirect(
      `/workspaces/${params.workspaceId}/spaces/${params.spaceId}/loopnet?message=${encodeURIComponent(message)}`
    );
  }
}

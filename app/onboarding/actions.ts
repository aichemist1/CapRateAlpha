"use server";

import { redirect } from "next/navigation";
import { uploadSpaceFloorplan, uploadSpacePhoto } from "@/lib/assets";
import { requireUser } from "@/lib/auth";
import { bootstrapWorkspaceData } from "@/lib/bootstrap";
import { deleteWorkspaceSpace } from "@/lib/bootstrap";
import { requireWorkspaceAccess } from "@/lib/workspaces";

export async function bootstrapWorkspaceAction(formData: FormData) {
  const user = await requireUser();

  const workspaceId = String(formData.get("workspaceId") ?? "").trim();
  const spaceId = String(formData.get("spaceId") ?? "").trim();
  const workspaceName = String(formData.get("workspaceName") ?? "").trim();
  const propertyName = String(formData.get("propertyName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const suiteIdentifier = String(formData.get("suiteIdentifier") ?? "").trim();
  const squareFeet = Number(formData.get("squareFeet") ?? 0);
  const askingRentAmount = Number(formData.get("askingRentAmount") ?? 0);
  const rentType = String(formData.get("rentType") ?? "unknown");
  const useType = String(formData.get("useType") ?? "").trim();
  const highlights = String(formData.get("highlights") ?? "").trim();

  const result = await bootstrapWorkspaceData(user, {
    workspaceId: workspaceId || undefined,
    spaceId: spaceId || undefined,
    workspaceName: workspaceName || "New Workspace",
    propertyName: propertyName || "Untitled Property",
    address,
    suiteIdentifier: suiteIdentifier || "Suite 1",
    squareFeet,
    askingRentAmount,
    rentType,
    useType: useType || "Retail",
    highlights: highlights || "Vacancy details coming soon."
  });

  redirect(
    `/onboarding?step=review&workspaceId=${result.workspaceId}&spaceId=${result.spaceId}`
  );
}

export async function deleteSpaceAction(formData: FormData) {
  const user = await requireUser();
  const workspaceId = String(formData.get("workspaceId") ?? "").trim();
  const spaceId = String(formData.get("spaceId") ?? "").trim();

  const result = await deleteWorkspaceSpace(user, { workspaceId, spaceId });
  redirect(result.redirectTo);
}

export async function uploadOnboardingPhotoAction(formData: FormData) {
  const user = await requireUser();
  const workspaceId = String(formData.get("workspaceId") ?? "").trim();
  const spaceId = String(formData.get("spaceId") ?? "").trim();
  await requireWorkspaceAccess(user, workspaceId);

  const file = formData.get("photo");

  if (!(file instanceof File)) {
    redirect(
      `/onboarding?step=details&workspaceId=${workspaceId}&spaceId=${spaceId}&message=${encodeURIComponent("Select a photo before uploading.")}`
    );
  }

  try {
    const result = await uploadSpacePhoto({
      workspaceId,
      spaceId,
      file
    });
    return redirect(
      `/onboarding?step=details&workspaceId=${workspaceId}&spaceId=${spaceId}&message=${encodeURIComponent(result.message)}`
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : "Photo upload could not be completed.";

    redirect(
      `/onboarding?step=details&workspaceId=${workspaceId}&spaceId=${spaceId}&message=${encodeURIComponent(message)}`
    );
  }
}

export async function uploadOnboardingFloorplanAction(formData: FormData) {
  const user = await requireUser();
  const workspaceId = String(formData.get("workspaceId") ?? "").trim();
  const spaceId = String(formData.get("spaceId") ?? "").trim();
  await requireWorkspaceAccess(user, workspaceId);

  const file = formData.get("floorplan");

  if (!(file instanceof File)) {
    redirect(
      `/onboarding?step=details&workspaceId=${workspaceId}&spaceId=${spaceId}&message=${encodeURIComponent("Select a floorplan before uploading.")}`
    );
  }

  try {
    const result = await uploadSpaceFloorplan({
      workspaceId,
      spaceId,
      file
    });
    return redirect(
      `/onboarding?step=details&workspaceId=${workspaceId}&spaceId=${spaceId}&message=${encodeURIComponent(result.message)}`
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : "Floorplan upload could not be completed.";

    redirect(
      `/onboarding?step=details&workspaceId=${workspaceId}&spaceId=${spaceId}&message=${encodeURIComponent(message)}`
    );
  }
}

function isRedirectError(error: unknown) {
  return (
    error instanceof Error &&
    "digest" in error &&
    typeof (error as Error & { digest?: unknown }).digest === "string" &&
    (error as Error & { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

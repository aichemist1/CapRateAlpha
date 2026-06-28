import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const PHOTO_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "assets";
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_FLOORPLAN_BYTES = 15 * 1024 * 1024;

export type SpacePhotoAsset = {
  id: string;
  label: string;
  previewUrl: string;
};

export type SpaceFloorplanAsset = {
  id: string;
  label: string;
  downloadUrl: string;
  mimeType: string;
};

export async function getSpacePhotoAssets(
  workspaceId: string,
  spaceId: string
): Promise<SpacePhotoAsset[]> {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return [];
  }

  const { data: assets, error } = await admin
    .from("assets")
    .select("id, storage_path, label")
    .eq("workspace_id", workspaceId)
    .eq("space_id", spaceId)
    .eq("asset_type", "photo")
    .order("created_at", { ascending: false });

  if (error || !assets?.length) {
    return [];
  }

  const photos = await Promise.all(
    assets.map(async (asset) => {
      const { data: signed } = await admin.storage
        .from(PHOTO_BUCKET)
        .createSignedUrl(asset.storage_path, 60 * 60);

      return {
        id: asset.id,
        label: asset.label || "Property photo",
        previewUrl: signed?.signedUrl ?? ""
      };
    })
  );

  return photos.filter((photo) => Boolean(photo.previewUrl));
}

export async function uploadSpacePhoto(input: {
  workspaceId: string;
  spaceId: string;
  file: File;
}) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return {
      persisted: false,
      message: "Supabase storage is not configured yet."
    };
  }

  if (!input.file || input.file.size === 0) {
    throw new Error("Select an image file to upload.");
  }

  if (!input.file.type.startsWith("image/")) {
    throw new Error("Only image uploads are supported.");
  }

  if (input.file.size > MAX_PHOTO_BYTES) {
    throw new Error("Image file must be 10 MB or smaller.");
  }

  const { data: listings } = await admin
    .from("listings")
    .select("id")
    .eq("workspace_id", input.workspaceId)
    .eq("space_id", input.spaceId)
    .order("created_at", { ascending: false })
    .limit(1);

  const extension = inferExtension(input.file);
  const safeName = sanitizeFilename(input.file.name.replace(/\.[^.]+$/, ""));
  const storagePath = `workspaces/${input.workspaceId}/spaces/${input.spaceId}/${Date.now()}-${safeName}.${extension}`;
  const bytes = Buffer.from(await input.file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from(PHOTO_BUCKET)
    .upload(storagePath, bytes, {
      contentType: input.file.type,
      upsert: false
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: assetError } = await admin.from("assets").insert({
    workspace_id: input.workspaceId,
    space_id: input.spaceId,
    listing_id: listings?.[0]?.id ?? null,
    asset_type: "photo",
    source_type: "uploaded",
    storage_path: storagePath,
    mime_type: input.file.type,
    file_size_bytes: input.file.size,
    label: input.file.name
  });

  if (assetError) {
    throw new Error(assetError.message);
  }

  return {
    persisted: true,
    message: "Photo uploaded."
  };
}

export async function getSpaceFloorplanAssets(
  workspaceId: string,
  spaceId: string
): Promise<SpaceFloorplanAsset[]> {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return [];
  }

  const { data: assets, error } = await admin
    .from("assets")
    .select("id, storage_path, label, mime_type")
    .eq("workspace_id", workspaceId)
    .eq("space_id", spaceId)
    .eq("asset_type", "floorplan")
    .order("created_at", { ascending: false });

  if (error || !assets?.length) {
    return [];
  }

  const floorplans = await Promise.all(
    assets.map(async (asset) => {
      const { data: signed } = await admin.storage
        .from(PHOTO_BUCKET)
        .createSignedUrl(asset.storage_path, 60 * 60);

      return {
        id: asset.id,
        label: asset.label || "Floorplan",
        downloadUrl: signed?.signedUrl ?? "",
        mimeType: asset.mime_type || "application/octet-stream"
      };
    })
  );

  return floorplans.filter((asset) => Boolean(asset.downloadUrl));
}

export async function uploadSpaceFloorplan(input: {
  workspaceId: string;
  spaceId: string;
  file: File;
}) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return {
      persisted: false,
      message: "Supabase storage is not configured yet."
    };
  }

  if (!input.file || input.file.size === 0) {
    throw new Error("Select a floorplan file to upload.");
  }

  const isPdf = input.file.type === "application/pdf";
  const isImage = input.file.type.startsWith("image/");

  if (!isPdf && !isImage) {
    throw new Error("Only PDF or image floorplans are supported.");
  }

  if (input.file.size > MAX_FLOORPLAN_BYTES) {
    throw new Error("Floorplan file must be 15 MB or smaller.");
  }

  const { data: listings } = await admin
    .from("listings")
    .select("id")
    .eq("workspace_id", input.workspaceId)
    .eq("space_id", input.spaceId)
    .order("created_at", { ascending: false })
    .limit(1);

  const extension = inferExtension(input.file);
  const safeName = sanitizeFilename(input.file.name.replace(/\.[^.]+$/, ""));
  const storagePath = `workspaces/${input.workspaceId}/spaces/${input.spaceId}/${Date.now()}-${safeName}.${extension}`;
  const bytes = Buffer.from(await input.file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from(PHOTO_BUCKET)
    .upload(storagePath, bytes, {
      contentType: input.file.type,
      upsert: false
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: assetError } = await admin.from("assets").insert({
    workspace_id: input.workspaceId,
    space_id: input.spaceId,
    listing_id: listings?.[0]?.id ?? null,
    asset_type: "floorplan",
    source_type: "uploaded",
    storage_path: storagePath,
    mime_type: input.file.type,
    file_size_bytes: input.file.size,
    label: input.file.name
  });

  if (assetError) {
    throw new Error(assetError.message);
  }

  return {
    persisted: true,
    message: "Floorplan uploaded."
  };
}

function sanitizeFilename(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "photo";
}

function inferExtension(file: File) {
  const fromType = file.type.split("/")[1]?.toLowerCase();

  if (fromType === "jpeg") {
    return "jpg";
  }

  if (fromType) {
    return fromType;
  }

  const fromName = file.name.split(".").pop()?.toLowerCase();
  return fromName || "jpg";
}

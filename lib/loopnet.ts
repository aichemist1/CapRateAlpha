import { sampleSpace } from "@/lib/mvp-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type LoopnetExportSummary = {
  propertyName: string;
  address: string;
  suite: string;
  squareFeet: number;
  rent: string;
  useType: string;
  headline: string;
  descriptionLoopnet: string;
  status: "draft" | "ready" | "exported";
  publicUrl: string;
  flyerDownloadPath: string;
  imageCount: number;
  persisted: boolean;
};

type UpdateLoopnetExportInput = {
  workspaceId: string;
  spaceId: string;
  descriptionLoopnet: string;
  status: "ready" | "exported";
};

export async function getLoopnetExportSummary(
  workspaceId: string,
  spaceId: string
): Promise<LoopnetExportSummary> {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return buildFallbackSummary(false);
  }

  const { data, error } = await admin
    .from("spaces")
    .select(
      `
        suite_identifier,
        square_feet,
        use_type,
        asking_rent_amount,
        rent_type,
        properties (
          name,
          street_1,
          city,
          state,
          postal_code
        ),
        listings (
          id,
          headline,
          description_loopnet,
          loopnet_export_status
        ),
        landing_pages (
          slug,
          canonical_url
        ),
        assets (
          id,
          asset_type
        )
      `
    )
    .eq("workspace_id", workspaceId)
    .eq("id", spaceId)
    .maybeSingle();

  if (error || !data) {
    return buildFallbackSummary(false);
  }

  const property = Array.isArray(data.properties) ? data.properties[0] : data.properties;
  const listing = Array.isArray(data.listings) ? data.listings[0] : data.listings;
  const landingPage = Array.isArray(data.landing_pages)
    ? data.landing_pages[0]
    : data.landing_pages;
  const assets = Array.isArray(data.assets) ? data.assets : [];
  const slug = landingPage?.slug ?? sampleSpace.slug;

  return {
    propertyName: property?.name ?? sampleSpace.propertyName,
    address:
      [property?.street_1, property?.city, property?.state, property?.postal_code]
        .filter(Boolean)
        .join(", ") || sampleSpace.address,
    suite: data.suite_identifier ?? sampleSpace.suite,
    squareFeet: data.square_feet ?? sampleSpace.squareFeet,
    rent: formatRent(data.asking_rent_amount ?? null, data.rent_type ?? null),
    useType: data.use_type ?? sampleSpace.useType,
    headline: listing?.headline ?? `${property?.name ?? "Retail Space"} ${data.suite_identifier ?? ""}`.trim(),
    descriptionLoopnet:
      listing?.description_loopnet ??
      `${sampleSpace.squareFeet} SF retail opportunity with details available on request.`,
    status: (listing?.loopnet_export_status ?? "draft") as LoopnetExportSummary["status"],
    publicUrl: landingPage?.canonical_url ?? `https://spaces.capratealpha.com/${slug}`,
    flyerDownloadPath: `/flyers/${slug}.pdf`,
    imageCount: assets.filter((asset) => asset.asset_type === "photo").length,
    persisted: true
  };
}

export async function updateLoopnetExport(input: UpdateLoopnetExportInput) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return { persisted: false };
  }

  const { data: listings, error } = await admin
    .from("listings")
    .select("id")
    .eq("workspace_id", input.workspaceId)
    .eq("space_id", input.spaceId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !listings || listings.length === 0) {
    throw new Error(error?.message ?? "Listing not found for LoopNet export.");
  }

  const { error: updateError } = await admin
    .from("listings")
    .update({
      description_loopnet: input.descriptionLoopnet,
      loopnet_export_status: input.status
    })
    .eq("id", listings[0].id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return { persisted: true };
}

export function buildLoopnetPackageText(summary: LoopnetExportSummary) {
  return [
    "CAPRATEALPHA LOOPNET EXPORT PACKAGE",
    "",
    `Property: ${summary.propertyName}`,
    `Address: ${summary.address}`,
    `Suite: ${summary.suite}`,
    `Square Feet: ${summary.squareFeet}`,
    `Rent: ${summary.rent}`,
    `Use Type: ${summary.useType}`,
    `Headline: ${summary.headline}`,
    "",
    "LoopNet Description:",
    summary.descriptionLoopnet,
    "",
    `Public URL: ${summary.publicUrl}`,
    `Flyer PDF: ${summary.flyerDownloadPath}`,
    `Photo Count Available: ${summary.imageCount}`,
    "",
    "Checklist:",
    "- Paste headline",
    "- Paste LoopNet description",
    "- Upload flyer PDF if helpful",
    "- Upload photos if available",
    "- Publish listing in LoopNet"
  ].join("\n");
}

function buildFallbackSummary(persisted: boolean): LoopnetExportSummary {
  return {
    propertyName: sampleSpace.propertyName,
    address: sampleSpace.address,
    suite: sampleSpace.suite,
    squareFeet: sampleSpace.squareFeet,
    rent: sampleSpace.rent,
    useType: sampleSpace.useType,
    headline: "Retail Space For Lease - Plano, TX",
    descriptionLoopnet:
      "1,500 SF retail opportunity in Plano with strong co-tenancy, immediate availability, and clear frontage for tenant visibility.",
    status: "ready",
    publicUrl: sampleSpace.canonicalUrl,
    flyerDownloadPath: `/flyers/${sampleSpace.slug}.pdf`,
    imageCount: 0,
    persisted
  };
}

function formatRent(amount: number | null, rentType: string | null) {
  if (!amount) {
    return "Rent guidance pending";
  }

  const typeLabel =
    rentType === "nnn"
      ? "NNN"
      : rentType === "gross"
        ? "Gross"
        : rentType === "modified_gross"
          ? "Modified Gross"
          : "Rent";

  return `$${Number(amount).toFixed(0)}/SF ${typeLabel}`;
}

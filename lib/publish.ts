import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { readinessItems, sampleSpace } from "@/lib/mvp-data";
import {
  sendLeadNotificationEmail,
  sendPublishConfirmationEmail
} from "@/lib/notifications";

export type PublishSummary = {
  propertyName: string;
  address: string;
  suite: string;
  squareFeet: number;
  rent: string;
  useType: string;
  slug: string;
  canonicalUrl: string;
  headline: string;
  descriptionShort: string;
  descriptionLong: string;
  metaTitle: string;
  metaDescription: string;
  status: "draft" | "live" | "expired";
};

export type PublicLandingPageData = {
  propertyName: string;
  address: string;
  suite: string;
  squareFeet: number;
  rent: string;
  useType: string;
  highlights: string;
  headline: string;
  descriptionShort: string;
  descriptionLong: string;
  photos: Array<{
    id: string;
    url: string;
    label: string;
  }>;
  slug: string;
  canonicalUrl: string;
  status: "draft" | "live" | "expired";
  isKnown: boolean;
};

export type ReadinessSummaryItem = {
  label: string;
  complete: boolean;
  note: string;
};

type PublishActionInput = {
  workspaceId: string;
  spaceId: string;
  slug: string;
  headline: string;
  descriptionShort: string;
  descriptionLong: string;
  metaTitle: string;
  metaDescription: string;
};

type CreateLeadInput = {
  slug: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  message: string;
};

export async function getPublishSummary(workspaceId: string, spaceId: string) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return {
      summary: {
        propertyName: sampleSpace.propertyName,
        address: sampleSpace.address,
        suite: sampleSpace.suite,
        squareFeet: sampleSpace.squareFeet,
        rent: sampleSpace.rent,
        useType: sampleSpace.useType,
        slug: sampleSpace.slug,
        canonicalUrl: sampleSpace.canonicalUrl,
        headline: "Retail Space For Lease - Plano, TX",
        descriptionShort: "1,500 SF retail suite for lease in Plano with strong co-tenancy.",
        descriptionLong:
          "Preston Oaks offers 1,500 square feet of prime retail space in a high-traffic Plano corridor. Asking $20/SF NNN with immediate availability.",
        metaTitle: "Retail Space For Lease - Plano, TX",
        metaDescription:
          "1,500 SF retail suite for lease in Plano with strong co-tenancy.",
        status: "draft" as const
      },
      readiness: [...readinessItems] as ReadonlyArray<ReadinessSummaryItem>,
      persisted: false
    };
  }

  const { data, error } = await admin
    .from("spaces")
    .select(
      `
        id,
        name,
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
          description_short,
          description_long
        ),
        landing_pages (
          slug,
          canonical_url,
          meta_title,
          meta_description,
          status
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
    return {
      summary: {
        propertyName: sampleSpace.propertyName,
        address: sampleSpace.address,
        suite: sampleSpace.suite,
        squareFeet: sampleSpace.squareFeet,
        rent: sampleSpace.rent,
        useType: sampleSpace.useType,
        slug: sampleSpace.slug,
        canonicalUrl: sampleSpace.canonicalUrl,
        headline: "Retail Space For Lease - Plano, TX",
        descriptionShort: "1,500 SF retail suite for lease in Plano with strong co-tenancy.",
        descriptionLong:
          "Preston Oaks offers 1,500 square feet of prime retail space in a high-traffic Plano corridor. Asking $20/SF NNN with immediate availability.",
        metaTitle: "Retail Space For Lease - Plano, TX",
        metaDescription:
          "1,500 SF retail suite for lease in Plano with strong co-tenancy.",
        status: "draft" as const
      },
      readiness: [...readinessItems] as ReadonlyArray<ReadinessSummaryItem>,
      persisted: false
    };
  }

  const property = Array.isArray(data.properties) ? data.properties[0] : data.properties;
  const listing = Array.isArray(data.listings) ? data.listings[0] : data.listings;
  const landingPage = Array.isArray(data.landing_pages)
    ? data.landing_pages[0]
    : data.landing_pages;
  const assets = Array.isArray(data.assets) ? data.assets : [];

  const address = [property?.street_1, property?.city, property?.state, property?.postal_code]
    .filter(Boolean)
    .join(", ");

  const summary: PublishSummary = {
    propertyName: property?.name ?? data.name,
    address: address || sampleSpace.address,
    suite: data.suite_identifier,
    squareFeet: data.square_feet,
    rent: formatRent(data.asking_rent_amount, data.rent_type),
    useType: data.use_type,
    slug: landingPage?.slug ?? sampleSpace.slug,
    canonicalUrl: landingPage?.canonical_url ?? sampleSpace.canonicalUrl,
    headline: listing?.headline ?? `${property?.name ?? "Retail Space"} ${data.suite_identifier}`,
    descriptionShort:
      listing?.description_short ?? "Retail vacancy details available on request.",
    descriptionLong:
      listing?.description_long ?? "Retail vacancy details available on request.",
    metaTitle:
      landingPage?.meta_title ?? `${property?.name ?? "Retail Space"} ${data.suite_identifier} For Lease`,
    metaDescription:
      landingPage?.meta_description ??
      listing?.description_long ??
      "Retail vacancy details available on request.",
    status: (landingPage?.status ?? "draft") as PublishSummary["status"]
  };

  const readiness: ReadonlyArray<ReadinessSummaryItem> = [
    {
      label: "Vacancy details complete",
      complete: Boolean(
        data.square_feet &&
          data.use_type &&
          data.asking_rent_amount &&
          property?.street_1 &&
          property?.city
      ),
      note: "Address, suite, square footage, use type, and rent data are ready."
    },
    {
      label: "Listing copy attached",
      complete: Boolean(listing?.id && listing?.description_long),
      note: "Long-form listing copy is attached to the landing page source record."
    },
    {
      label: "Presentable marketing asset available",
      complete: assets.some(
        (asset) => asset.asset_type === "photo" || asset.asset_type === "flyer_pdf"
      ),
      note: "At least one property photo or generated flyer exists for publishing."
    },
    {
      label: "Public page can go live",
      complete: summary.status === "live",
      note:
        summary.status === "live"
          ? "This page is already live."
          : "Finalize slug and publish to create the public URL."
    }
  ];

  return {
    summary,
    readiness,
    persisted: true
  };
}

export async function publishLandingPage(input: PublishActionInput) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return {
      canonicalUrl: `https://spaces.capratealpha.com/${normalizeSlug(input.slug)}`,
      persisted: false
    };
  }

  const { data: landingPages, error: landingPageError } = await admin
    .from("landing_pages")
    .select("id, current_listing_id, published_at, spaces(suite_identifier, properties(name))")
    .eq("workspace_id", input.workspaceId)
    .eq("space_id", input.spaceId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (landingPageError || !landingPages || landingPages.length === 0) {
    throw new Error(
      landingPageError?.message ?? "Landing page not found for this space."
    );
  }

  const landingPage = landingPages[0];
  const slug = normalizeSlug(input.slug) || sampleSpace.slug;
  const canonicalUrl = `https://spaces.capratealpha.com/${slug}`;

  const { error: updateError } = await admin
    .from("landing_pages")
    .update({
      slug,
      canonical_url: canonicalUrl,
      meta_title: input.metaTitle,
      meta_description: input.metaDescription,
      status: "live",
      published_at: landingPage.published_at ?? new Date().toISOString()
    })
    .eq("id", landingPage.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (landingPage.current_listing_id) {
    const { error: listingUpdateError } = await admin
      .from("listings")
      .update({
        headline: input.headline,
        description_short: input.descriptionShort,
        description_long: input.descriptionLong,
        description_loopnet: input.descriptionLong,
        loopnet_export_status: "ready"
      })
      .eq("id", landingPage.current_listing_id);

    if (listingUpdateError) {
      throw new Error(listingUpdateError.message);
    }
  }

  const { data: memberships } = await admin
    .from("memberships")
    .select("users(email)")
    .eq("workspace_id", input.workspaceId)
    .eq("role", "owner");

  const ownerEmails = (memberships ?? [])
    .map((membership) => {
      const userData = Array.isArray(membership.users)
        ? membership.users[0]
        : membership.users;

      return userData?.email ?? null;
    })
    .filter((email): email is string => Boolean(email));

  const space = Array.isArray(landingPage.spaces)
    ? landingPage.spaces[0]
    : landingPage.spaces;
  const property = Array.isArray(space?.properties)
    ? space?.properties[0]
    : space?.properties;

  await sendPublishConfirmationEmail({
    ownerEmails,
    propertyName: property?.name ?? "Retail Space",
    suite: space?.suite_identifier ?? "",
    publicUrl: canonicalUrl,
    flyerUrl: `https://spaces.capratealpha.com/flyers/${slug}.pdf`
  });

  return {
    canonicalUrl,
    persisted: true
  };
}

export async function getPublicLandingPageBySlug(slug: string) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return {
      data: {
        propertyName: sampleSpace.propertyName,
        address: sampleSpace.address,
        suite: sampleSpace.suite,
        squareFeet: sampleSpace.squareFeet,
        rent: sampleSpace.rent,
        useType: sampleSpace.useType,
        highlights: sampleSpace.highlights,
        headline: `${sampleSpace.propertyName} ${sampleSpace.suite}`,
        descriptionShort: `${sampleSpace.squareFeet} SF ${sampleSpace.useType} retail space for lease.`,
        descriptionLong:
          "Preston Oaks offers 1,500 square feet of prime QSR and service retail space in a high-traffic Plano corridor. Asking $20/SF NNN with immediate availability.",
        photos: [],
        slug: sampleSpace.slug,
        canonicalUrl: sampleSpace.canonicalUrl,
        status: slug === sampleSpace.slug ? ("live" as const) : ("expired" as const),
        isKnown: slug === sampleSpace.slug
      },
      persisted: false
    };
  }

  const { data, error } = await admin
    .from("landing_pages")
    .select(
      `
        slug,
        canonical_url,
        status,
        spaces (
          suite_identifier,
          square_feet,
          use_type,
          asking_rent_amount,
          rent_type,
          highlights,
          properties (
            name,
            street_1,
            city,
            state,
            postal_code
          ),
          assets (
            id,
            asset_type,
            storage_path,
            label
          )
        ),
        listings:current_listing_id (
          headline,
          description_short,
          description_long
        )
      `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return {
      data: {
        propertyName: sampleSpace.propertyName,
        address: sampleSpace.address,
        suite: sampleSpace.suite,
        squareFeet: sampleSpace.squareFeet,
        rent: sampleSpace.rent,
        useType: sampleSpace.useType,
        highlights: sampleSpace.highlights,
        headline: `${sampleSpace.propertyName} ${sampleSpace.suite}`,
        descriptionShort: `${sampleSpace.squareFeet} SF ${sampleSpace.useType} retail space for lease.`,
        descriptionLong:
          "This retail space is no longer available.",
        photos: [],
        slug,
        canonicalUrl: `https://spaces.capratealpha.com/${slug}`,
        status: "expired" as const,
        isKnown: false
      },
      persisted: false
    };
  }

  const space = Array.isArray(data.spaces) ? data.spaces[0] : data.spaces;
  const property = Array.isArray(space?.properties)
    ? space?.properties[0]
    : space?.properties;
  const listing = Array.isArray(data.listings) ? data.listings[0] : data.listings;
  const assets = Array.isArray(space?.assets) ? space.assets : [];

  const address = [property?.street_1, property?.city, property?.state, property?.postal_code]
    .filter(Boolean)
    .join(", ");
  const photos = await Promise.all(
    assets
      .filter((asset) => asset.asset_type === "photo" && asset.storage_path)
      .slice(0, 6)
      .map(async (asset) => {
        const { data: signed } = await admin.storage
          .from(process.env.SUPABASE_STORAGE_BUCKET || "assets")
          .createSignedUrl(asset.storage_path, 60 * 60);

        return {
          id: asset.id,
          url: signed?.signedUrl ?? "",
          label: asset.label ?? "Property photo"
        };
      })
  );

  const landingPage: PublicLandingPageData = {
    propertyName: property?.name ?? "Retail Space",
    address: address || sampleSpace.address,
    suite: space?.suite_identifier ?? "Suite",
    squareFeet: space?.square_feet ?? sampleSpace.squareFeet,
    rent: formatRent(space?.asking_rent_amount ?? null, space?.rent_type ?? null),
    useType: space?.use_type ?? sampleSpace.useType,
    highlights: space?.highlights ?? sampleSpace.highlights,
    headline: listing?.headline ?? `${property?.name ?? "Retail Space"} ${space?.suite_identifier ?? ""}`.trim(),
    descriptionShort:
      listing?.description_short ??
      `${space?.square_feet ?? sampleSpace.squareFeet} SF retail space for lease.`,
    descriptionLong:
      toTenantFacingCopy(
        listing?.description_long ??
          space?.highlights ??
          "Retail vacancy details available on request."
      ),
    photos: photos.filter((photo) => Boolean(photo.url)),
    slug: data.slug,
    canonicalUrl: data.canonical_url,
    status: data.status as PublicLandingPageData["status"],
    isKnown: true
  };

  return {
    data: landingPage,
    persisted: true
  };
}

export async function createLeadFromPublicSlug(input: CreateLeadInput) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return {
      persisted: false
    };
  }

  const { data: landingPage, error: landingPageError } = await admin
    .from("landing_pages")
    .select(
      `
        id,
        workspace_id,
        space_id,
        status,
        canonical_url,
        spaces (
          suite_identifier,
          properties (
            name
          )
        )
      `
    )
    .eq("slug", input.slug)
    .maybeSingle();

  if (landingPageError || !landingPage) {
    throw new Error(
      landingPageError?.message ?? "Landing page not found for this inquiry."
    );
  }

  if (landingPage.status !== "live") {
    throw new Error("This landing page is not accepting inquiries.");
  }

  const { error: leadError } = await admin.from("leads").insert({
    workspace_id: landingPage.workspace_id,
    space_id: landingPage.space_id,
    landing_page_id: landingPage.id,
    source: "landing_page",
    stage: "new",
    contact_name: input.contactName,
    contact_email: input.contactEmail,
    contact_phone: input.contactPhone || null,
    message: input.message,
    follow_up_date: null
  });

  if (leadError) {
    throw new Error(leadError.message);
  }

  const { data: memberships } = await admin
    .from("memberships")
    .select("users(email)")
    .eq("workspace_id", landingPage.workspace_id)
    .eq("role", "owner");

  const ownerEmails = (memberships ?? [])
    .map((membership) => {
      const userData = Array.isArray(membership.users)
        ? membership.users[0]
        : membership.users;

      return userData?.email ?? null;
    })
    .filter((email): email is string => Boolean(email));

  const space = Array.isArray(landingPage.spaces)
    ? landingPage.spaces[0]
    : landingPage.spaces;
  const property = Array.isArray(space?.properties)
    ? space?.properties[0]
    : space?.properties;

  await sendLeadNotificationEmail({
    ownerEmails,
    propertyName: property?.name ?? "Retail Space",
    suite: space?.suite_identifier ?? "",
    publicUrl: landingPage.canonical_url ?? `https://spaces.capratealpha.com/${input.slug}`,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    message: input.message
  });

  return {
    persisted: true
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

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toTenantFacingCopy(value: string) {
  return value.replace("positioned for owner-led marketing", "available for immediate tenancy");
}

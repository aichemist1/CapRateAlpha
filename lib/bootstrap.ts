import type { AuthUser } from "@/lib/auth";
import { generateListingCopy } from "@/lib/listing-copy";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildWorkspaceContext } from "@/lib/workspaces";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type BootstrapInput = {
  workspaceId?: string;
  spaceId?: string;
  workspaceName: string;
  propertyName: string;
  address: string;
  suiteIdentifier: string;
  squareFeet: number;
  askingRentAmount: number;
  rentType: string;
  useType: string;
  highlights: string;
};

export async function bootstrapWorkspaceData(
  user: AuthUser,
  input: BootstrapInput
) {
  const admin = createSupabaseAdminClient();
  const fallbackContext = buildWorkspaceContext(input.workspaceName || "New Workspace");

  if (!admin) {
    return {
      workspaceId: fallbackContext.id,
      spaceId: fallbackContext.defaultSpaceId,
      persisted: false
    };
  }

  const [street_1 = "", city = "", state = "", postal_code = ""] = input.address
    .split(",")
    .map((part) => part.trim());

  const workspaceSlugBase = slugify(input.workspaceName || "workspace") || "workspace";
  const workspaceSlug = `${workspaceSlugBase}-${user.id.slice(0, 8)}`;
  const spaceSlugBase =
    slugify(`${city || "space"} ${input.propertyName} ${input.suiteIdentifier}`) ||
    "space";
  const copy = await generateListingCopy({
    propertyName: input.propertyName,
    address: input.address,
    suiteIdentifier: input.suiteIdentifier,
    squareFeet: input.squareFeet,
    askingRentAmount: input.askingRentAmount,
    rentType: input.rentType,
    useType: input.useType,
    highlights: input.highlights
  });

  const appUser = await upsertAppUser(admin, user);
  const targetWorkspaceId =
    input.workspaceId || (await getExistingOwnerWorkspaceId(admin, appUser.id));

  if (input.spaceId && targetWorkspaceId) {
    const existingDraft = await getExistingSpaceDraft(
      admin,
      targetWorkspaceId,
      input.spaceId
    );

    if (!existingDraft) {
      throw new Error("Selected space could not be loaded.");
    }

    const workspaceId = existingDraft.workspaceId;
    const propertyId = existingDraft.propertyId;
    const spaceId = existingDraft.spaceId;
    const listingId = existingDraft.listingId;
    const landingPageId = existingDraft.landingPageId;
    const canonicalUrl = `https://spaces.capratealpha.com/${spaceSlugBase}`;

    const { error: workspaceError } = await admin
      .from("workspaces")
      .update({
        name: input.workspaceName || "New Workspace",
        slug: workspaceSlug
      })
      .eq("id", workspaceId);

    if (workspaceError) {
      throw new Error(workspaceError.message);
    }

    const { error: propertyError } = await admin
      .from("properties")
      .update({
        name: input.propertyName,
        street_1,
        street_2: "",
        city,
        state,
        postal_code,
        country: "US",
        highlights: input.highlights
      })
      .eq("id", propertyId);

    if (propertyError) {
      throw new Error(propertyError.message);
    }

    const { error: spaceError } = await admin
      .from("spaces")
      .update({
        name: `${input.propertyName} ${input.suiteIdentifier}`.trim(),
        suite_identifier: input.suiteIdentifier,
        square_feet: input.squareFeet,
        use_type: input.useType,
        asking_rent_amount: input.askingRentAmount,
        rent_type: input.rentType,
        rent_notes: "",
        highlights: input.highlights
      })
      .eq("id", spaceId);

    if (spaceError) {
      throw new Error(spaceError.message);
    }

    const { error: listingError } = await admin
      .from("listings")
      .update({
        status: "draft",
        loopnet_export_status: "draft",
        headline: copy.headline,
        description_long: copy.descriptionLong,
        description_short: copy.descriptionShort,
        description_loopnet: copy.descriptionLoopnet,
        generated_copy_version: existingDraft.generatedCopyVersion + 1
      })
      .eq("id", listingId);

    if (listingError) {
      throw new Error(listingError.message);
    }

    const { error: landingPageError } = await admin
      .from("landing_pages")
      .update({
        current_listing_id: listingId,
        status: "draft",
        slug: spaceSlugBase,
        canonical_url: canonicalUrl,
        published_at: null,
        last_unpublished_at: new Date().toISOString(),
        meta_title: copy.headline,
        meta_description: copy.descriptionShort
      })
      .eq("id", landingPageId);

    if (landingPageError) {
      throw new Error(landingPageError.message);
    }

    return {
      workspaceId,
      spaceId,
      persisted: true
    };
  }

  if (targetWorkspaceId) {
    const { data: workspaceInfo, error: workspaceLookupError } = await admin
      .from("workspaces")
      .select("id")
      .eq("id", targetWorkspaceId)
      .maybeSingle();

    if (workspaceLookupError || !workspaceInfo) {
      throw new Error(workspaceLookupError?.message ?? "Workspace not found.");
    }

    const { data: property, error: propertyError } = await admin
      .from("properties")
      .insert({
        workspace_id: targetWorkspaceId,
        name: input.propertyName,
        street_1,
        street_2: "",
        city,
        state,
        postal_code,
        country: "US",
        highlights: input.highlights
      })
      .select("id")
      .single();

    if (propertyError || !property) {
      throw new Error(propertyError?.message ?? "Failed to create property.");
    }

    const { data: space, error: spaceError } = await admin
      .from("spaces")
      .insert({
        workspace_id: targetWorkspaceId,
        property_id: property.id,
        name: `${input.propertyName} ${input.suiteIdentifier}`.trim(),
        suite_identifier: input.suiteIdentifier,
        status: "draft",
        square_feet: input.squareFeet,
        use_type: input.useType,
        asking_rent_amount: input.askingRentAmount,
        rent_type: input.rentType,
        rent_notes: "",
        highlights: input.highlights
      })
      .select("id")
      .single();

    if (spaceError || !space) {
      throw new Error(spaceError?.message ?? "Failed to create space.");
    }

    const { data: listing, error: listingError } = await admin
      .from("listings")
      .insert({
        workspace_id: targetWorkspaceId,
        space_id: space.id,
        status: "draft",
        loopnet_export_status: "draft",
        headline: copy.headline,
        description_long: copy.descriptionLong,
        description_short: copy.descriptionShort,
        description_loopnet: copy.descriptionLoopnet,
        generated_copy_version: 1
      })
      .select("id")
      .single();

    if (listingError || !listing) {
      throw new Error(listingError?.message ?? "Failed to create listing.");
    }

    const canonicalUrl = `https://spaces.capratealpha.com/${spaceSlugBase}`;
    const { error: landingPageError } = await admin.from("landing_pages").insert({
      workspace_id: targetWorkspaceId,
      space_id: space.id,
      current_listing_id: listing.id,
      status: "draft",
      slug: spaceSlugBase,
      canonical_url: canonicalUrl,
      meta_title: copy.headline,
      meta_description: copy.descriptionShort
    });

    if (landingPageError) {
      throw new Error(landingPageError.message);
    }

    return {
      workspaceId: targetWorkspaceId,
      spaceId: space.id,
      persisted: true
    };
  }

  const { data: workspace, error: workspaceError } = await admin
    .from("workspaces")
    .insert({
      name: input.workspaceName || "New Workspace",
      slug: workspaceSlug
    })
    .select("id")
    .single();

  if (workspaceError || !workspace) {
    throw new Error(workspaceError?.message ?? "Failed to create workspace.");
  }

  const { error: membershipError } = await admin.from("memberships").insert({
    user_id: appUser.id,
    workspace_id: workspace.id,
    role: "owner"
  });

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const { data: property, error: propertyError } = await admin
    .from("properties")
    .insert({
      workspace_id: workspace.id,
      name: input.propertyName,
      street_1,
      street_2: "",
      city,
      state,
      postal_code,
      country: "US",
      highlights: input.highlights
    })
    .select("id")
    .single();

  if (propertyError || !property) {
    throw new Error(propertyError?.message ?? "Failed to create property.");
  }

  const { data: space, error: spaceError } = await admin
    .from("spaces")
    .insert({
      workspace_id: workspace.id,
      property_id: property.id,
      name: `${input.propertyName} ${input.suiteIdentifier}`.trim(),
      suite_identifier: input.suiteIdentifier,
      status: "draft",
      square_feet: input.squareFeet,
      use_type: input.useType,
      asking_rent_amount: input.askingRentAmount,
      rent_type: input.rentType,
      rent_notes: "",
      highlights: input.highlights
    })
    .select("id")
    .single();

  if (spaceError || !space) {
    throw new Error(spaceError?.message ?? "Failed to create space.");
  }

  const { data: listing, error: listingError } = await admin
    .from("listings")
    .insert({
      workspace_id: workspace.id,
      space_id: space.id,
      status: "draft",
      loopnet_export_status: "draft",
      headline: copy.headline,
      description_long: copy.descriptionLong,
      description_short: copy.descriptionShort,
      description_loopnet: copy.descriptionLoopnet,
      generated_copy_version: 1
    })
    .select("id")
    .single();

  if (listingError || !listing) {
    throw new Error(listingError?.message ?? "Failed to create listing.");
  }

  const canonicalUrl = `https://spaces.capratealpha.com/${spaceSlugBase}`;
  const { error: landingPageError } = await admin.from("landing_pages").insert({
    workspace_id: workspace.id,
    space_id: space.id,
    current_listing_id: listing.id,
    status: "draft",
    slug: spaceSlugBase,
    canonical_url: canonicalUrl,
    meta_title: copy.headline,
    meta_description: copy.descriptionShort
  });

  if (landingPageError) {
    throw new Error(landingPageError.message);
  }

  return {
    workspaceId: workspace.id,
    spaceId: space.id,
    persisted: true
  };
}

export async function deleteWorkspaceSpace(
  user: AuthUser,
  input: { workspaceId: string; spaceId: string }
) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return {
      redirectTo: "/onboarding"
    };
  }

  const appUser = await upsertAppUser(admin, user);
  const workspaceId =
    input.workspaceId || (await getExistingOwnerWorkspaceId(admin, appUser.id));

  if (!workspaceId || !input.spaceId) {
    return {
      redirectTo: "/onboarding"
    };
  }

  const { data: membership } = await admin
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", appUser.id)
    .eq("workspace_id", workspaceId)
    .eq("role", "owner")
    .maybeSingle();

  if (!membership?.workspace_id) {
    throw new Error("Workspace access denied.");
  }

  const { data: spaces } = await admin
    .from("spaces")
    .select("id, property_id")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const currentSpaces = spaces ?? [];
  const currentSpace = currentSpaces.find((space) => space.id === input.spaceId);

  if (!currentSpace) {
    return {
      redirectTo: `/onboarding?workspaceId=${workspaceId}`
    };
  }

  if (currentSpaces.length <= 1) {
    return {
      redirectTo: `/onboarding?workspaceId=${workspaceId}&spaceId=${input.spaceId}`
    };
  }

  await admin.from("leads").delete().eq("workspace_id", workspaceId).eq("space_id", input.spaceId);
  await admin.from("assets").delete().eq("workspace_id", workspaceId).eq("space_id", input.spaceId);
  await admin
    .from("landing_pages")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("space_id", input.spaceId);
  await admin.from("listings").delete().eq("workspace_id", workspaceId).eq("space_id", input.spaceId);

  const { error: spaceDeleteError } = await admin
    .from("spaces")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", input.spaceId);

  if (spaceDeleteError) {
    throw new Error(spaceDeleteError.message);
  }

  if (currentSpace.property_id) {
    await admin.from("properties").delete().eq("workspace_id", workspaceId).eq("id", currentSpace.property_id);
  }

  const fallbackSpace = currentSpaces.find((space) => space.id !== input.spaceId);

  return {
    redirectTo: fallbackSpace
      ? `/onboarding?workspaceId=${workspaceId}&spaceId=${fallbackSpace.id}`
      : `/onboarding?workspaceId=${workspaceId}&new=1`
  };
}

async function upsertAppUser(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  user: AuthUser
) {
  const { data: appUser, error: userError } = await admin
    .from("users")
    .upsert(
      {
        auth_user_id: user.id,
        email: user.email ?? null
      },
      {
        onConflict: "auth_user_id"
      }
    )
    .select("id")
    .single();

  if (userError || !appUser) {
    throw new Error(userError?.message ?? "Failed to create app user.");
  }

  return appUser;
}

async function getExistingOwnerWorkspaceId(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  appUserId: string
) {
  const { data: membership } = await admin
    .from("memberships")
    .select("workspace_id")
    .eq("user_id", appUserId)
    .eq("role", "owner")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!membership?.workspace_id) {
    return null;
  }

  return membership.workspace_id;
}

async function getExistingSpaceDraft(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  workspaceId: string,
  spaceId: string
) {

  const { data: space } = await admin
    .from("spaces")
    .select(
      `
        id,
        property_id,
        listings (
          id,
          generated_copy_version
        ),
        landing_pages (
          id
        )
      `
    )
    .eq("workspace_id", workspaceId)
    .eq("id", spaceId)
    .maybeSingle();

  if (!space?.id || !space.property_id) {
    return null;
  }

  const listing = Array.isArray(space.listings) ? space.listings[0] : space.listings;
  const landingPage = Array.isArray(space.landing_pages)
    ? space.landing_pages[0]
    : space.landing_pages;

  if (!listing?.id || !landingPage?.id) {
    return null;
  }

  return {
    workspaceId,
    propertyId: space.property_id,
    spaceId: space.id,
    listingId: listing.id,
    landingPageId: landingPage.id,
    generatedCopyVersion: listing.generated_copy_version ?? 1
  };
}

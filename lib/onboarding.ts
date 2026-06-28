import type { AuthUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type OnboardingDraft = {
  workspaceId: string;
  spaceId: string;
  workspaceName: string;
  propertyName: string;
  address: string;
  suiteIdentifier: string;
  squareFeet: number;
  askingRentAmount: number;
  rentType: string;
  useType: string;
  highlights: string;
  headline: string;
  descriptionShort: string;
  descriptionLong: string;
  canonicalUrl: string;
  slug: string;
  persisted: boolean;
  spaces: Array<{
    id: string;
    name: string;
    suiteIdentifier: string;
    squareFeet: number;
    status: "draft" | "live" | "expired";
    stateLabel: string;
    stateTone: "review" | "ready" | "published";
  }>;
};

type SpaceStateTone = "review" | "ready" | "published";

type GetOnboardingDraftOptions = {
  workspaceId?: string;
  spaceId?: string;
  isNewSpace?: boolean;
};

export async function getOnboardingDraft(
  user: AuthUser,
  options: GetOnboardingDraftOptions = {}
): Promise<OnboardingDraft> {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return buildFallbackDraft();
  }

  const { data: appUser } = await admin
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!appUser) {
    return buildFallbackDraft();
  }

  const membershipQuery = admin
    .from("memberships")
    .select("workspace_id, workspaces(name)")
    .eq("user_id", appUser.id)
    .eq("role", "owner");

  const { data: membership } = options.workspaceId
    ? await membershipQuery.eq("workspace_id", options.workspaceId).maybeSingle()
    : await membershipQuery.order("created_at", { ascending: false }).limit(1).maybeSingle();

  if (!membership?.workspace_id) {
    return buildFallbackDraft();
  }

  const { data: spaces } = await admin
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
        highlights,
        properties (
          name,
          street_1,
          city,
          state,
          postal_code
        ),
        listings (
          headline,
          description_short,
          description_long
        ),
        landing_pages (
          slug,
          canonical_url,
          status
        )
      `
    )
    .eq("workspace_id", membership.workspace_id)
    .order("created_at", { ascending: false });

  const spaceList = (spaces ?? []).map((space) => {
    const landingPage = Array.isArray(space.landing_pages)
      ? space.landing_pages[0]
      : space.landing_pages;
    const listing = Array.isArray(space.listings) ? space.listings[0] : space.listings;
    const stateTone: SpaceStateTone =
      landingPage?.status === "live"
        ? "published"
        : listing?.description_long
          ? "ready"
          : "review";
    const stateLabel =
      stateTone === "published"
        ? "Published"
        : stateTone === "ready"
          ? "Ready to publish"
          : "In review";

    return {
      id: space.id,
      name: space.name ?? space.suite_identifier ?? "Untitled space",
      suiteIdentifier: space.suite_identifier ?? "Suite",
      squareFeet: space.square_feet ?? 0,
      status: (landingPage?.status ?? "draft") as "draft" | "live" | "expired",
      stateLabel,
      stateTone
    };
  });

  const selectedSpace =
    options.isNewSpace
      ? null
      : (spaces ?? []).find((space) => space.id === options.spaceId) ?? (spaces?.[0] ?? null);

  const workspaceInfo = Array.isArray(membership.workspaces)
    ? membership.workspaces[0]
    : membership.workspaces;

  if (!selectedSpace) {
    return {
      workspaceId: membership.workspace_id,
      spaceId: "",
      workspaceName: workspaceInfo?.name ?? "New Workspace",
      propertyName: "",
      address: "",
      suiteIdentifier: "",
      squareFeet: 1500,
      askingRentAmount: 20,
      rentType: "nnn",
      useType: "Retail",
      highlights: "",
      headline: "Retail Space For Lease",
      descriptionShort: "Shareable listing copy will appear here after setup.",
      descriptionLong: "Shareable listing copy will appear here after setup.",
      canonicalUrl: "",
      slug: "",
      persisted: true,
      spaces: spaceList
    };
  }
  const property = Array.isArray(selectedSpace.properties)
    ? selectedSpace.properties[0]
    : selectedSpace.properties;
  const listing = Array.isArray(selectedSpace.listings)
    ? selectedSpace.listings[0]
    : selectedSpace.listings;
  const landingPage = Array.isArray(selectedSpace.landing_pages)
    ? selectedSpace.landing_pages[0]
    : selectedSpace.landing_pages;

  return {
    workspaceId: membership.workspace_id,
    spaceId: selectedSpace.id,
    workspaceName: workspaceInfo?.name ?? "New Workspace",
    propertyName: property?.name ?? "Untitled Property",
    address: [property?.street_1, property?.city, property?.state, property?.postal_code]
      .filter(Boolean)
      .join(", "),
    suiteIdentifier: selectedSpace.suite_identifier ?? "Suite 1",
    squareFeet: selectedSpace.square_feet ?? 1500,
    askingRentAmount: Number(selectedSpace.asking_rent_amount ?? 20),
    rentType: selectedSpace.rent_type ?? "nnn",
    useType: selectedSpace.use_type ?? "Retail",
    highlights: selectedSpace.highlights ?? "Vacancy details coming soon.",
    headline: listing?.headline ?? "Retail Space For Lease",
    descriptionShort:
      listing?.description_short ?? "Shareable listing copy will appear here after setup.",
    descriptionLong:
      listing?.description_long ?? "Shareable listing copy will appear here after setup.",
    canonicalUrl:
      landingPage?.canonical_url ?? "https://spaces.capratealpha.com/plano-preston-oaks-suite-120",
    slug: landingPage?.slug ?? "plano-preston-oaks-suite-120",
    persisted: true
    ,
    spaces: spaceList
  };
}

function buildFallbackDraft(): OnboardingDraft {
  return {
    workspaceId: "ws-preston-oaks-ownership",
    spaceId: "space-001",
    workspaceName: "Preston Oaks Ownership",
    propertyName: "Preston Oaks",
    address: "6201 W Park Blvd, Plano, TX 75093",
    suiteIdentifier: "Suite 120",
    squareFeet: 1500,
    askingRentAmount: 20,
    rentType: "nnn",
    useType: "QSR / service retail",
    highlights:
      "High-traffic neighborhood center with strong co-tenancy and easy ingress.",
    headline: "Suite 120 retail space for lease at Preston Oaks",
    descriptionShort:
      "1,500 SF QSR / service retail suite for lease at Preston Oaks with $20/SF NNN.",
    descriptionLong:
      "Preston Oaks offers 1,500 square feet of prime QSR and service retail space in a high-traffic Plano corridor. Asking $20/SF NNN with immediate availability and strong co-tenancy.",
    canonicalUrl: "https://spaces.capratealpha.com/plano-preston-oaks-suite-120",
    slug: "plano-preston-oaks-suite-120",
    persisted: false,
    spaces: [
      {
        id: "space-001",
        name: "Preston Oaks Suite 120",
        suiteIdentifier: "Suite 120",
        squareFeet: 1500,
        status: "draft",
        stateLabel: "Ready to publish",
        stateTone: "ready"
      }
    ]
  };
}

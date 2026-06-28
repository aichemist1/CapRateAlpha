import { notFound } from "next/navigation";
import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from "pdf-lib";
import { sampleSpace } from "@/lib/mvp-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type FlyerData = {
  propertyName: string;
  address: string;
  suite: string;
  squareFeet: number;
  rent: string;
  useType: string;
  highlights: string;
  description: string;
  slug: string;
  status: "draft" | "live" | "expired";
};

export async function getFlyerDataBySpace(workspaceId: string, spaceId: string) {
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
        highlights: "High-traffic neighborhood center with strong co-tenancy.",
        description: "Broker-grade flyer preview for retail vacancy marketing.",
        slug: sampleSpace.slug,
        status: "live" as const
      },
      persisted: false
    };
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
        highlights,
        properties (
          name,
          street_1,
          city,
          state,
          postal_code
        ),
        listings (
          description_long
        ),
        landing_pages (
          slug,
          status
        )
      `
    )
    .eq("workspace_id", workspaceId)
    .eq("id", spaceId)
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
        highlights: "Retail vacancy details pending.",
        description: "Retail vacancy details pending.",
        slug: sampleSpace.slug,
        status: "draft" as const
      },
      persisted: false
    };
  }

  const property = Array.isArray(data.properties) ? data.properties[0] : data.properties;
  const listing = Array.isArray(data.listings) ? data.listings[0] : data.listings;
  const landingPage = Array.isArray(data.landing_pages)
    ? data.landing_pages[0]
    : data.landing_pages;

  return {
    data: {
      propertyName: property?.name ?? "Retail Space",
      address: [property?.street_1, property?.city, property?.state, property?.postal_code]
        .filter(Boolean)
        .join(", "),
      suite: data.suite_identifier,
      squareFeet: data.square_feet,
      rent: formatRent(data.asking_rent_amount, data.rent_type),
      useType: data.use_type,
      highlights: data.highlights,
      description: listing?.description_long ?? data.highlights,
      slug: landingPage?.slug ?? sampleSpace.slug,
      status: (landingPage?.status ?? "draft") as FlyerData["status"]
    },
    persisted: true
  };
}

export async function getFlyerDataBySlug(slug: string) {
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
        highlights: "High-traffic neighborhood center with strong co-tenancy.",
        description: "Broker-grade flyer preview for retail vacancy marketing.",
        slug: sampleSpace.slug,
        status: slug === sampleSpace.slug ? ("live" as const) : ("expired" as const)
      },
      persisted: false
    };
  }

  const { data, error } = await admin
    .from("landing_pages")
    .select(
      `
        slug,
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
          )
        ),
        listings:current_listing_id (
          description_long
        )
      `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const space = Array.isArray(data.spaces) ? data.spaces[0] : data.spaces;
  const property = Array.isArray(space?.properties)
    ? space?.properties[0]
    : space?.properties;
  const listing = Array.isArray(data.listings) ? data.listings[0] : data.listings;

  return {
    data: {
      propertyName: property?.name ?? "Retail Space",
      address: [property?.street_1, property?.city, property?.state, property?.postal_code]
        .filter(Boolean)
        .join(", "),
      suite: space?.suite_identifier ?? "Suite",
      squareFeet: space?.square_feet ?? sampleSpace.squareFeet,
      rent: formatRent(space?.asking_rent_amount ?? null, space?.rent_type ?? null),
      useType: space?.use_type ?? sampleSpace.useType,
      highlights: space?.highlights ?? "Retail vacancy details available.",
      description: listing?.description_long ?? space?.highlights ?? "Retail vacancy details available.",
      slug: data.slug,
      status: data.status as FlyerData["status"]
    },
    persisted: true
  };
}

export async function ensureFlyerAssetForSpace(workspaceId: string, spaceId: string) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return {
      downloadPath: `/flyers/${sampleSpace.slug}.pdf`,
      persisted: false
    };
  }

  const { data: landingPages } = await admin
    .from("landing_pages")
    .select("slug, current_listing_id")
    .eq("workspace_id", workspaceId)
    .eq("space_id", spaceId)
    .order("created_at", { ascending: false })
    .limit(1);

  const landingPage = landingPages?.[0];
  const slug = landingPage?.slug ?? sampleSpace.slug;
  const listingId = landingPage?.current_listing_id ?? null;
  const downloadPath = `/flyers/${slug}.pdf`;

  const { data: existing } = await admin
    .from("assets")
    .select("id, storage_path")
    .eq("workspace_id", workspaceId)
    .eq("space_id", spaceId)
    .eq("asset_type", "flyer_pdf")
    .eq("source_type", "generated")
    .limit(1);

  if (!existing || existing.length === 0) {
    await admin.from("assets").insert({
      workspace_id: workspaceId,
      space_id: spaceId,
      listing_id: listingId,
      asset_type: "flyer_pdf",
      source_type: "generated",
      storage_path: downloadPath,
      mime_type: "application/pdf",
      file_size_bytes: 0,
      label: "Generated Flyer"
    });
  }

  return {
    downloadPath,
    persisted: true
  };
}

export async function generateFlyerPdf(data: FlyerData) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const width = page.getWidth();
  const height = page.getHeight();
  const margin = 44;
  const dark = rgb(0.12, 0.11, 0.09);
  const muted = rgb(0.38, 0.34, 0.3);
  const brand = rgb(0.6, 0.26, 0.15);
  const soft = rgb(0.96, 0.92, 0.86);
  const white = rgb(1, 1, 1);

  const headingFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: white
  });

  page.drawRectangle({
    x: margin,
    y: height - 170,
    width: width - margin * 2,
    height: 126,
    color: soft,
    borderColor: rgb(0.88, 0.82, 0.75),
    borderWidth: 1
  });

  page.drawText("RETAIL SPACE FOR LEASE", {
    x: margin,
    y: height - 54,
    size: 12,
    font: headingFont,
    color: brand
  });

  page.drawText(`${data.propertyName} ${data.suite}`.trim(), {
    x: margin,
    y: height - 88,
    size: 28,
    font: headingFont,
    color: dark
  });

  page.drawText(data.address, {
    x: margin,
    y: height - 112,
    size: 11,
    font: bodyFont,
    color: muted
  });

  drawFactCard(page, {
    x: margin,
    y: height - 214,
    width: 156,
    title: "Square Feet",
    value: `${data.squareFeet} SF`,
    headingFont,
    bodyFont,
    dark,
    muted
  });

  drawFactCard(page, {
    x: margin + 172,
    y: height - 214,
    width: 156,
    title: "Rent",
    value: data.rent,
    headingFont,
    bodyFont,
    dark,
    muted
  });

  drawFactCard(page, {
    x: margin + 344,
    y: height - 214,
    width: 180,
    title: "Use Type",
    value: data.useType,
    headingFont,
    bodyFont,
    dark,
    muted
  });

  page.drawText("Highlights", {
    x: margin,
    y: height - 280,
    size: 15,
    font: headingFont,
    color: dark
  });

  drawParagraph(page, {
    text: data.highlights,
    x: margin,
    y: height - 300,
    maxWidth: width - margin * 2,
    lineHeight: 16,
    size: 11,
    font: bodyFont,
    color: muted
  });

  page.drawText("Description", {
    x: margin,
    y: height - 398,
    size: 15,
    font: headingFont,
    color: dark
  });

  drawParagraph(page, {
    text: data.description,
    x: margin,
    y: height - 418,
    maxWidth: width - margin * 2,
    lineHeight: 16,
    size: 11,
    font: bodyFont,
    color: muted
  });

  page.drawRectangle({
    x: margin,
    y: 48,
    width: width - margin * 2,
    height: 1,
    color: rgb(0.88, 0.84, 0.78)
  });

  page.drawText("Powered by CapRateAlpha", {
    x: margin,
    y: 28,
    size: 10,
    font: bodyFont,
    color: muted
  });

  const bytes = await pdf.save();
  return bytes;
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

function drawFactCard(
  page: PDFPage,
  {
    x,
    y,
    width,
    title,
    value,
    headingFont,
    bodyFont,
    dark,
    muted
  }: {
    x: number;
    y: number;
    width: number;
    title: string;
    value: string;
    headingFont: PDFFont;
    bodyFont: PDFFont;
    dark: ReturnType<typeof rgb>;
    muted: ReturnType<typeof rgb>;
  }
) {
  page.drawRectangle({
    x,
    y,
    width,
    height: 70,
    color: rgb(0.985, 0.98, 0.965),
    borderColor: rgb(0.88, 0.84, 0.78),
    borderWidth: 1
  });

  page.drawText(title.toUpperCase(), {
    x: x + 14,
    y: y + 46,
    size: 9,
    font: headingFont,
    color: muted
  });

  page.drawText(value, {
    x: x + 14,
    y: y + 20,
    size: 16,
    font: headingFont,
    color: dark
  });
}

function drawParagraph(
  page: PDFPage,
  {
    text,
    x,
    y,
    maxWidth,
    lineHeight,
    size,
    font,
    color
  }: {
    text: string;
    x: number;
    y: number;
    maxWidth: number;
    lineHeight: number;
    size: number;
    font: PDFFont;
    color: ReturnType<typeof rgb>;
  }
) {
  const words = text.split(/\s+/);
  let line = "";
  let offsetY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, size);

    if (width > maxWidth && line) {
      page.drawText(line, {
        x,
        y: offsetY,
        size,
        font,
        color
      });
      line = word;
      offsetY -= lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    page.drawText(line, {
      x,
      y: offsetY,
      size,
      font,
      color
    });
  }
}

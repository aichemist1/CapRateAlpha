import { NextResponse } from "next/server";
import { generateFlyerPdf, getFlyerDataBySlug } from "@/lib/flyer";

type FlyerRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: FlyerRouteProps) {
  const { slug } = await params;
  const normalizedSlug = slug.replace(/\.pdf$/i, "");
  const { data } = await getFlyerDataBySlug(normalizedSlug);

  if (data.status !== "live") {
    return new NextResponse("Flyer unavailable", { status: 404 });
  }

  const bytes = await generateFlyerPdf(data);

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${normalizedSlug}.pdf"`,
      "Cache-Control": "no-store"
    }
  });
}

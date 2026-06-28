import type { Metadata } from "next";
import { submitPublicLeadAction } from "@/app/spaces/[slug]/actions";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { getPublicLandingPageBySlug } from "@/lib/publish";

type PublicSpacePageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    message?: string;
  }>;
};

export async function generateMetadata({
  params
}: PublicSpacePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getPublicLandingPageBySlug(slug);

  return {
    title:
      data.status === "live"
        ? `${data.headline} | CapRateAlpha`
        : "Space no longer available | CapRateAlpha",
    description:
      data.status === "live"
        ? data.descriptionShort
        : "This retail space is no longer available.",
    alternates: {
      canonical: data.canonicalUrl
    },
    robots: data.status === "live" ? "index, follow" : "noindex, follow"
  };
}

export default async function PublicSpacePage({
  params,
  searchParams
}: PublicSpacePageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const { data, persisted } = await getPublicLandingPageBySlug(slug);
  const isLive = data.status === "live";
  const message = resolvedSearchParams?.message;
  const submitAction = submitPublicLeadAction.bind(null, slug);

  return (
    <main>
      <SiteHeader />
      <section className="shell-section">
        <div className="page-shell two-col">
          <div className="stack">
            <div className="eyebrow">Retail Space For Lease</div>
            <h1 className="section-title">
              {isLive ? `${data.propertyName} ${data.suite}` : "Space no longer available"}
            </h1>
            {isLive ? <p className="property-address">{data.address}</p> : null}
            <p className="lede">
              {isLive
                ? data.headline
                : "This space is no longer available. The link is still active for anyone returning from an earlier share."}
            </p>
            {isLive ? (
              <>
                <div className="fact-strip">
                  <div className="fact-strip-item">
                    <span className="fact-strip-label">Size</span>
                    <strong className="fact-strip-value">{data.squareFeet} SF</strong>
                  </div>
                  <div className="fact-strip-item">
                    <span className="fact-strip-label">Rent</span>
                    <strong className="fact-strip-value">{data.rent}</strong>
                  </div>
                  <div className="fact-strip-item">
                    <span className="fact-strip-label">Use</span>
                    <strong className="fact-strip-value">{data.useType}</strong>
                  </div>
                </div>
                <div className="public-photo-stack">
                  <div className="public-photo-hero">
                    <img
                      alt={data.photos[0]?.label ?? `${data.propertyName} ${data.suite}`}
                      className="public-photo-image"
                      src={data.photos[0]?.url ?? "/sample-retail-property.svg"}
                    />
                  </div>
                  {data.photos.length > 1 ? (
                    <div className="public-photo-grid">
                      {data.photos.slice(1, 5).map((photo) => (
                        <div className="public-photo-tile" key={photo.id}>
                          <img alt={photo.label} className="public-photo-image" src={photo.url} />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="listing-highlight">
                  <span className="listing-highlight-label">Property highlights</span>
                  <p className="listing-highlight-copy">{data.highlights}</p>
                </div>
                <p className="body-copy" style={{ marginBottom: 0 }}>
                  {data.descriptionLong}
                </p>
              </>
            ) : null}
            <p className="body-copy">Powered by CapRateAlpha</p>
            {isLive ? (
              <div className="button-row">
                <Link className="button button-secondary" href={`/flyers/${data.slug}.pdf`}>
                  Download Flyer
                </Link>
              </div>
            ) : null}
            {!persisted ? (
              <p className="footer-note">
                Showing fallback public page behavior until Supabase env and schema
                are configured.
              </p>
            ) : null}
            {message ? (
              <div className="card panel">
                <strong>Status</strong>
                <p className="muted" style={{ marginBottom: 0 }}>
                  {message}
                </p>
              </div>
            ) : null}
          </div>
          <div className="card panel">
            {isLive ? (
              <div className="stack">
                <div>
                  <strong>Request leasing details</strong>
                  <p className="muted" style={{ marginBottom: 0 }}>
                    Ask for leasing details, availability, or next steps for this space.
                  </p>
                </div>
                <form action={submitAction} className="form-grid">
                  <div className="field">
                    <label htmlFor="lead-name">Name</label>
                    <input
                      id="lead-name"
                      name="contactName"
                      type="text"
                      placeholder="Prospect or tenant rep"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="lead-email">Email</label>
                    <input
                      id="lead-email"
                      name="contactEmail"
                      type="email"
                      placeholder="rep@example.com"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="lead-phone">Phone</label>
                    <input
                      id="lead-phone"
                      name="contactPhone"
                      type="tel"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="lead-message">Message</label>
                    <textarea
                      id="lead-message"
                      name="message"
                      placeholder="Tell the owner what type of space you need."
                    />
                  </div>
                  <button className="button button-primary" type="submit">
                    Submit Inquiry
                  </button>
                </form>
              </div>
            ) : (
              <div className="stack">
                <strong>This listing has expired.</strong>
                <p className="muted">
                  The link remains available for reference, but inquiries are no longer being accepted for this space.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

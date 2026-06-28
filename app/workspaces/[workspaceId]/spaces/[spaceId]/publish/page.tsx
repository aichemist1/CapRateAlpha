import { publishLandingPageAction } from "@/app/workspaces/[workspaceId]/spaces/[spaceId]/publish/actions";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/lib/auth";
import { getPublishSummary } from "@/lib/publish";
import { requireWorkspaceAccess } from "@/lib/workspaces";

type PublishPageProps = {
  params: Promise<{
    workspaceId: string;
    spaceId: string;
  }>;
};

export default async function PublishPage({ params }: PublishPageProps) {
  const user = await requireUser();
  const { workspaceId, spaceId } = await params;
  await requireWorkspaceAccess(user, workspaceId);
  const { summary, persisted } = await getPublishSummary(
    workspaceId,
    spaceId
  );
  const publishAction = publishLandingPageAction.bind(null, {
    workspaceId,
    spaceId
  });

  return (
    <main>
      <SiteHeader />
      <section className="shell-section">
        <div className="page-shell publish-shell">
          <form action={publishAction} className="card workbench-panel summary-card">
            <div className="workbench-head workbench-head-compact">
              <div className="eyebrow">Publish Review</div>
              <h1 className="section-title workspace-title">Prepare the live page.</h1>
              <p className="body-copy">
                Finalize listing language and public metadata before publishing.
              </p>
            </div>
            <div className="summary-meta property-brief">
              <span>{summary.propertyName}</span>
              <span>{summary.address}</span>
              <span>{summary.suite}</span>
              <span>{summary.squareFeet} SF</span>
              <span>{summary.rent}</span>
              <span>{summary.useType}</span>
            </div>
            <div className="section-rule" />
            <div className="publish-grid">
              <div className="form-section">
                <div className="form-section-title">Listing presentation</div>
                <div className="field">
                  <label htmlFor="headline">Page headline</label>
                  <input
                    defaultValue={summary.headline}
                    id="headline"
                    name="headline"
                    type="text"
                  />
                </div>
                <div className="field">
                  <label htmlFor="description-short">Overview copy</label>
                  <textarea
                    defaultValue={summary.descriptionShort}
                    id="description-short"
                    name="descriptionShort"
                  />
                </div>
                <div className="field">
                  <label htmlFor="description-long">Full description</label>
                  <textarea
                    defaultValue={summary.descriptionLong}
                    id="description-long"
                    name="descriptionLong"
                    style={{ minHeight: 132 }}
                  />
                </div>
              </div>
              <div className="form-section">
                <div className="form-section-title">Public page</div>
                <div className="field">
                  <label htmlFor="slug">Page address</label>
                  <input defaultValue={summary.slug} id="slug" name="slug" type="text" />
                  <span className="field-note">
                    This becomes the last part of the public page URL.
                  </span>
                </div>
                <div className="field">
                  <label htmlFor="meta-title">Search title</label>
                  <input
                    defaultValue={summary.metaTitle}
                    id="meta-title"
                    name="metaTitle"
                    type="text"
                  />
                </div>
                <div className="field">
                  <label htmlFor="meta-description">Search description</label>
                  <textarea
                    defaultValue={summary.metaDescription}
                    id="meta-description"
                    name="metaDescription"
                  />
                </div>
              </div>
            </div>
            <div className="button-row">
              <button className="button button-primary" type="submit">
                Publish Page
              </button>
              <Link
                className="button button-secondary"
                href={`/onboarding?step=review&workspaceId=${workspaceId}&spaceId=${spaceId}`}
              >
                Back
              </Link>
            </div>
            <div className="callout-inline">
              <span className="callout-label">Public URL</span>
              <span className="footer-note">{summary.canonicalUrl}</span>
            </div>
            {!persisted ? (
              <span className="footer-note">
                Showing fallback data until Supabase is configured.
              </span>
            ) : null}
          </form>
        </div>
      </section>
    </main>
  );
}

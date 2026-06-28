import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/lib/auth";
import { ensureFlyerAssetForSpace } from "@/lib/flyer";
import { getPublishSummary } from "@/lib/publish";
import { requireWorkspaceAccess } from "@/lib/workspaces";

type PublishSuccessPageProps = {
  params: Promise<{
    workspaceId: string;
    spaceId: string;
  }>;
};

export default async function PublishSuccessPage({
  params
}: PublishSuccessPageProps) {
  const user = await requireUser();
  const { workspaceId, spaceId } = await params;
  await requireWorkspaceAccess(user, workspaceId);
  const { summary } = await getPublishSummary(workspaceId, spaceId);
  const flyerAsset = await ensureFlyerAssetForSpace(workspaceId, spaceId);

  return (
    <main>
      <SiteHeader />
      <section className="shell-section">
        <div className="page-shell stack success-shell" style={{ gap: 24 }}>
          <div className="success-banner stack">
            <div className="eyebrow">Your Space Is Live</div>
            <h1 className="section-title workspace-title">You now have something real to share.</h1>
            <p className="body-copy">
              The landing page and flyer are ready for immediate outreach. Use this
              screen as the owner handoff moment.
            </p>
            <div className="summary-meta property-brief">
              <span>{summary.propertyName}</span>
              <span>{summary.suite}</span>
              <span>{summary.squareFeet} SF</span>
              <span>{summary.rent}</span>
            </div>
          </div>

          <div className="card panel">
            <div className="stack">
              <div className="form-section-title">Public URL</div>
              <Link className="success-link" href={`/spaces/${summary.slug}`}>
                {summary.canonicalUrl}
              </Link>
              <div className="button-row">
                <CopyButton label="Copy URL" value={summary.canonicalUrl} />
                <Link className="button button-primary" href={`/spaces/${summary.slug}`}>
                  Open Public Page
                </Link>
                <Link className="button button-secondary" href={flyerAsset.downloadPath}>
                  Download Flyer
                </Link>
                <Link
                  className="button button-secondary"
                  href={`/workspaces/${workspaceId}/spaces/${spaceId}/loopnet`}
                >
                  Open LoopNet Export
                </Link>
              </div>
            </div>
          </div>

          <div className="card panel panel-muted">
            <strong>Next best step</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              Share the public page with a tenant rep first, then use the flyer and
              LoopNet package where broader distribution helps.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

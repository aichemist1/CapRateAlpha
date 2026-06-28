import Link from "next/link";
import {
  markLoopnetExportedAction,
  saveLoopnetReadyAction,
  uploadLoopnetFloorplanAction,
  uploadLoopnetPhotoAction
} from "@/app/workspaces/[workspaceId]/spaces/[spaceId]/loopnet/actions";
import { CopyButton } from "@/components/copy-button";
import { FloorplanGallery } from "@/components/floorplan-gallery";
import { PhotoGallery } from "@/components/photo-gallery";
import { SiteHeader } from "@/components/site-header";
import { getSpaceFloorplanAssets, getSpacePhotoAssets } from "@/lib/assets";
import { requireUser } from "@/lib/auth";
import { getLoopnetExportSummary } from "@/lib/loopnet";
import { requireWorkspaceAccess } from "@/lib/workspaces";

type LoopnetPageProps = {
  params: Promise<{
    workspaceId: string;
    spaceId: string;
  }>;
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function LoopnetPage({
  params,
  searchParams
}: LoopnetPageProps) {
  const user = await requireUser();
  const { workspaceId, spaceId } = await params;
  const resolvedSearchParams = await searchParams;
  await requireWorkspaceAccess(user, workspaceId);
  const summary = await getLoopnetExportSummary(workspaceId, spaceId);
  const photos = await getSpacePhotoAssets(workspaceId, spaceId);
  const floorplans = await getSpaceFloorplanAssets(workspaceId, spaceId);
  const saveAction = saveLoopnetReadyAction.bind(null, { workspaceId, spaceId });
  const exportAction = markLoopnetExportedAction.bind(null, { workspaceId, spaceId });
  const uploadAction = uploadLoopnetPhotoAction.bind(null, { workspaceId, spaceId });
  const uploadFloorplanAction = uploadLoopnetFloorplanAction.bind(null, {
    workspaceId,
    spaceId
  });

  return (
    <main>
      <SiteHeader />
      <section className="shell-section">
        <div className="page-shell two-col">
          <div className="stack">
            <div className="eyebrow">LoopNet Export</div>
            <h1 className="section-title">Prepare the manual listing package.</h1>
            <p className="body-copy">
              Use this page to finalize listing copy, supporting media, and the
              package you will upload to LoopNet.
            </p>
            {resolvedSearchParams?.message ? (
              <div className="card panel">
                <strong>Status</strong>
                <p className="muted" style={{ marginBottom: 0 }}>
                  {resolvedSearchParams.message}
                </p>
              </div>
            ) : null}
            <div className="card panel">
              <div className="stack">
                <strong>Supporting media</strong>
                <span className="muted">
                  Add property photos and one floorplan to strengthen the listing package
                  without turning this workflow into a document library.
                </span>
                <form action={uploadAction} className="stack" style={{ gap: 10 }}>
                  <div className="field">
                    <label htmlFor="photo">Property photo</label>
                    <input accept="image/*" id="photo" name="photo" type="file" />
                  </div>
                  <div className="button-row">
                    <button className="button button-secondary" type="submit">
                      Upload Photo
                    </button>
                  </div>
                </form>
                <PhotoGallery photos={photos} />
                <div className="section-rule" />
                <form action={uploadFloorplanAction} className="stack" style={{ gap: 10 }}>
                  <div className="field">
                    <label htmlFor="floorplan">Floorplan</label>
                    <input
                      accept="application/pdf,image/*"
                      id="floorplan"
                      name="floorplan"
                      type="file"
                    />
                  </div>
                  <div className="button-row">
                    <button className="button button-secondary" type="submit">
                      Upload Floorplan
                    </button>
                  </div>
                </form>
                <FloorplanGallery floorplans={floorplans} />
              </div>
            </div>
          </div>

          <div className="stack">
            <form action={saveAction} className="card summary-card">
              <strong>{summary.propertyName}</strong>
              <div className="muted">{summary.address}</div>
              <div className="summary-meta">
                <span>{summary.suite}</span>
                <span>{summary.squareFeet} SF</span>
                <span>{summary.rent}</span>
                <span>{summary.useType}</span>
              </div>
              <div className="field">
                <label htmlFor="loopnet-headline">Listing headline</label>
                <input
                  defaultValue={summary.headline}
                  id="loopnet-headline"
                  type="text"
                  readOnly
                />
              </div>
              <div className="button-row button-row-compact">
                <CopyButton iconOnly label="Copy headline" value={summary.headline} />
                <CopyButton iconOnly label="Copy public URL" value={summary.publicUrl} />
              </div>
              <div className="field">
                <label htmlFor="loopnet-description">LoopNet description</label>
                <textarea
                  defaultValue={summary.descriptionLoopnet}
                  id="loopnet-description"
                  name="descriptionLoopnet"
                  style={{ minHeight: 180 }}
                />
              </div>
              <div className="button-row button-row-compact">
                <CopyButton
                  iconOnly
                  label="Copy description"
                  value={summary.descriptionLoopnet}
                />
              </div>
              <div className="stack" style={{ gap: 10 }}>
                <strong>Package downloads</strong>
                <div className="button-row">
                  <Link className="button button-secondary" href={summary.flyerDownloadPath}>
                    Download Flyer
                  </Link>
                  <Link
                    className="button button-secondary"
                    href={`/workspaces/${workspaceId}/spaces/${spaceId}/loopnet/package.txt`}
                  >
                    Download Package
                  </Link>
                </div>
                <span className="footer-note">
                  Public page: {summary.publicUrl}
                </span>
              </div>
              <div className="button-row">
                <button className="button button-secondary" type="submit">
                  Save As Ready
                </button>
                <button className="button button-primary" formAction={exportAction} type="submit">
                  Mark Exported
                </button>
              </div>
              {!summary.persisted ? (
                <span className="footer-note">
                  Showing fallback data until Supabase env and schema are configured.
                </span>
              ) : null}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

import {
  bootstrapWorkspaceAction,
  deleteSpaceAction,
  uploadOnboardingFloorplanAction,
  uploadOnboardingPhotoAction
} from "@/app/onboarding/actions";
import { FlyerPreview } from "@/components/flyer-preview";
import { SiteHeader } from "@/components/site-header";
import { getSpaceFloorplanAssets, getSpacePhotoAssets } from "@/lib/assets";
import { requireUser } from "@/lib/auth";
import { getOnboardingDraft } from "@/lib/onboarding";
import Link from "next/link";

type OnboardingPageProps = {
  searchParams?: Promise<{
    message?: string;
    new?: string;
    step?: string;
    workspaceId?: string;
    spaceId?: string;
  }>;
};

export default async function OnboardingPage({
  searchParams
}: OnboardingPageProps) {
  const user = await requireUser();
  const resolvedSearchParams = await searchParams;
  const draft = await getOnboardingDraft(user, {
    workspaceId: resolvedSearchParams?.workspaceId,
    spaceId: resolvedSearchParams?.spaceId,
    isNewSpace: resolvedSearchParams?.new === "1"
  });
  const photos = draft.spaceId
    ? await getSpacePhotoAssets(draft.workspaceId, draft.spaceId)
    : [];
  const floorplans = draft.spaceId
    ? await getSpaceFloorplanAssets(draft.workspaceId, draft.spaceId)
    : [];
  const step = resolvedSearchParams?.step === "review" ? "review" : "details";
  const activeSpaceKey = draft.spaceId || "new-space";
  const canDeleteSpace = draft.spaces.length > 1 && Boolean(draft.spaceId);
  const publishHref = draft.spaceId
    ? `/workspaces/${draft.workspaceId}/spaces/${draft.spaceId}/publish`
    : "/onboarding";

  return (
    <main>
      <SiteHeader />
      <section className="shell-section">
        <div className="page-shell stack workspace-shell">
          <div className="workspace-grid">
            <div className="workspace-main">
              <div className="card workbench-panel" key={`${activeSpaceKey}-${step}`}>
                <div className="stack">
                {step === "details" ? (
                  <>
                    <div className="workbench-head">
                      <div className="eyebrow">Property Details</div>
                      <h1 className="section-title workspace-title">Enter property details.</h1>
                      <p className="body-copy">
                        Choose an existing space or add a new one. Listing copy,
                        flyer output, and the public page are generated from this
                        information.
                      </p>
                    </div>
                    {resolvedSearchParams?.message ? (
                      <div className="card panel">
                        <strong>Status</strong>
                        <p className="muted" style={{ marginBottom: 0 }}>
                          {resolvedSearchParams.message}
                        </p>
                      </div>
                    ) : null}
                    <form action={bootstrapWorkspaceAction} className="form-grid enterprise-form">
                      <input name="workspaceId" type="hidden" value={draft.workspaceId} />
                      <input name="spaceId" type="hidden" value={draft.spaceId} />
                      <div className="form-section">
                        <div className="form-section-title">Property</div>
                        <input name="workspaceName" type="hidden" value={draft.workspaceName} />
                        <div className="field">
                          <label htmlFor="property">Property name</label>
                          <input
                            defaultValue={draft.propertyName}
                            id="property"
                            name="propertyName"
                            type="text"
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="address">Address</label>
                          <input
                            defaultValue={draft.address}
                            id="address"
                            name="address"
                            required
                            type="text"
                          />
                        </div>
                        <div className="two-col form-split">
                          <div className="field">
                            <label htmlFor="suite">Suite</label>
                            <input
                              defaultValue={draft.suiteIdentifier}
                              id="suite"
                              name="suiteIdentifier"
                              type="text"
                            />
                          </div>
                          <div className="field">
                            <label htmlFor="sf">Square feet</label>
                            <input
                              defaultValue={draft.squareFeet}
                              id="sf"
                              name="squareFeet"
                              type="number"
                            />
                          </div>
                        </div>
                        <div className="two-col form-split">
                          <div className="field">
                            <label htmlFor="rent">Asking rent</label>
                            <input
                              defaultValue={draft.askingRentAmount}
                              id="rent"
                              name="askingRentAmount"
                              type="number"
                            />
                          </div>
                          <div className="field">
                            <label htmlFor="rent-type">Rent type</label>
                            <select defaultValue={draft.rentType} id="rent-type" name="rentType">
                              <option value="gross">Gross</option>
                              <option value="nnn">NNN</option>
                              <option value="modified_gross">Modified Gross</option>
                              <option value="unknown">Unknown</option>
                            </select>
                          </div>
                        </div>
                        <div className="field">
                          <label htmlFor="use-type">Use type</label>
                          <input
                            defaultValue={draft.useType}
                            id="use-type"
                            name="useType"
                            type="text"
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="highlights">Highlights</label>
                          <textarea
                            defaultValue={draft.highlights}
                            id="highlights"
                            name="highlights"
                          />
                        </div>
                        {draft.spaceId ? (
                          <div className="media-action-strip">
                            <form action={uploadOnboardingPhotoAction} className="media-action-card">
                              <input name="workspaceId" type="hidden" value={draft.workspaceId} />
                              <input name="spaceId" type="hidden" value={draft.spaceId} />
                              <label className="media-action-head" htmlFor="photo">
                                <span className="media-action-icon" aria-hidden="true">
                                  <svg className="icon-copy" viewBox="0 0 16 16">
                                    <path
                                      d="M3 4.5h10v7H3zM5 3h6M5.5 8.5l1.4-1.4 1.6 1.9 1.4-1.2 1.6 2.2"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.2"
                                    />
                                    <circle cx="6" cy="6.5" r=".8" fill="currentColor" />
                                  </svg>
                                </span>
                                <span>Upload photos</span>
                              </label>
                              <input accept="image/*" id="photo" name="photo" type="file" />
                              <div className="media-action-meta">
                                <span className="footer-note">{photos.length} uploaded</span>
                                <button className="button button-secondary" type="submit">
                                  Add Photos
                                </button>
                              </div>
                            </form>
                            <form action={uploadOnboardingFloorplanAction} className="media-action-card">
                              <input name="workspaceId" type="hidden" value={draft.workspaceId} />
                              <input name="spaceId" type="hidden" value={draft.spaceId} />
                              <label className="media-action-head" htmlFor="floorplan">
                                <span className="media-action-icon" aria-hidden="true">
                                  <svg className="icon-copy" viewBox="0 0 16 16">
                                    <path
                                      d="M4 2.5h5l3 3v8H4zM9 2.5v3h3M6 8h4M6 10.5h4"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.2"
                                    />
                                  </svg>
                                </span>
                                <span>Upload floorplan</span>
                              </label>
                              <input
                                accept="application/pdf,image/*"
                                id="floorplan"
                                name="floorplan"
                                type="file"
                              />
                              <div className="media-action-meta">
                                <span className="footer-note">{floorplans.length} uploaded</span>
                                <button className="button button-secondary" type="submit">
                                  Add Floorplan
                                </button>
                              </div>
                            </form>
                          </div>
                        ) : null}
                      </div>
                      <div className="button-row">
                        <button className="button button-primary" type="submit">
                          Continue To Review
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="workbench-head workbench-head-compact">
                      <div className="eyebrow">Marketing Review</div>
                      <h1 className="section-title workspace-title">Review your marketing package.</h1>
                      <p className="body-copy">
                        Confirm the listing presentation and shareable page before
                        moving live.
                      </p>
                    </div>
                    <div className="summary-card summary-compact property-brief">
                      <strong>{draft.propertyName}</strong>
                      <div className="muted">{draft.address}</div>
                      <div className="summary-meta">
                        <span>{draft.suiteIdentifier}</span>
                        <span>{draft.squareFeet} SF</span>
                        <span>${draft.askingRentAmount}/SF</span>
                        <span>{draft.useType}</span>
                      </div>
                    </div>
                    <div className="review-list">
                      <div className="review-row">
                        <strong>Listing title</strong>
                        <span className="muted">{draft.headline}</span>
                      </div>
                      <div className="review-row">
                        <strong>Overview copy</strong>
                        <span className="muted">{draft.descriptionShort}</span>
                      </div>
                      <div className="review-row">
                        <strong>Full description</strong>
                        <span className="muted">{draft.descriptionLong}</span>
                      </div>
                      <div className="review-row">
                        <strong>Shareable page</strong>
                        <span className="muted">{draft.canonicalUrl}</span>
                      </div>
                    </div>
                    <div className="button-row">
                      <Link
                        className="button button-secondary"
                        href={`/onboarding?step=details&workspaceId=${draft.workspaceId}&spaceId=${draft.spaceId}`}
                      >
                        Back
                      </Link>
                      <Link className="button button-primary" href={publishHref}>
                        Continue To Publish
                      </Link>
                    </div>
                  </>
                )}
                </div>
              </div>
            </div>

            <aside className="workspace-rail">
              <div className="card workbench-panel">
                <div className="stack">
                  <div className="space-section-head">
                    <div className="eyebrow">Your Spaces</div>
                    <div className="space-section-actions">
                      <Link
                        aria-label="Add new space"
                        className="icon-button"
                        href={`/onboarding?step=details&workspaceId=${draft.workspaceId}&new=1`}
                        title="Add new space"
                      >
                        <svg className="icon-copy" viewBox="0 0 16 16">
                          <path
                            d="M8 3v10M3 8h10"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth="1.6"
                          />
                        </svg>
                      </Link>
                      {canDeleteSpace ? (
                        <form action={deleteSpaceAction}>
                          <input name="workspaceId" type="hidden" value={draft.workspaceId} />
                          <input name="spaceId" type="hidden" value={draft.spaceId} />
                          <button
                            aria-label="Delete selected space"
                            className="icon-button"
                            title="Delete selected space"
                            type="submit"
                          >
                            <svg className="icon-copy" viewBox="0 0 16 16">
                              <path
                                d="M5.5 5.5v6M8 5.5v6M10.5 5.5v6M3.5 4h9M6 2.5h4M4.5 4l.5 8h6l.5-8"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.2"
                              />
                            </svg>
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-list">
                    {draft.spaces.map((space) => {
                      const isActive = space.id === draft.spaceId;

                      return (
                        <Link
                          className={`space-list-item${isActive ? " is-active" : ""}`}
                          href={`/onboarding?step=${step}&workspaceId=${draft.workspaceId}&spaceId=${space.id}`}
                          key={space.id}
                        >
                          <div className="space-list-row">
                            <strong>{space.name}</strong>
                            <span className={`space-state-badge is-${space.stateTone}`}>
                              {space.stateLabel}
                            </span>
                          </div>
                          <span className="muted">
                            {space.suiteIdentifier} · {space.squareFeet} SF
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="card workbench-panel" key={`preview-${activeSpaceKey}`}>
                <div className="stack">
                  <div className="eyebrow">Preview</div>
                  <h2 className="rail-title">
                    {step === "review" ? "Flyer draft" : "Marketing preview"}
                  </h2>
                  <FlyerPreview
                    headline={draft.headline}
                    isEmpty={!draft.propertyName || !draft.suiteIdentifier}
                    propertyName={draft.propertyName}
                    suite={draft.suiteIdentifier}
                    squareFeet={draft.squareFeet}
                    description={draft.descriptionShort}
                  />
                  {!draft.persisted ? (
                    <p className="footer-note" style={{ margin: 0 }}>
                      Showing fallback preview until Supabase is configured.
                    </p>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

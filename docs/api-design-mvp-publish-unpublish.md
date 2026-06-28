# CapRateAlpha MVP Publish / Unpublish API Design

## 1. Purpose

This document defines the MVP API design for landing page publishing and unpublishing.

It follows:

- [adr-mvp-auth-and-workspace-model.md](/Users/dev/Documents/CapRateAlpha/docs/adr-mvp-auth-and-workspace-model.md)
- [adr-mvp-landing-page-publishing-and-domain.md](/Users/dev/Documents/CapRateAlpha/docs/adr-mvp-landing-page-publishing-and-domain.md)
- [schema-draft-mvp.md](/Users/dev/Documents/CapRateAlpha/docs/schema-draft-mvp.md)

The goal is to define concrete API behavior for:

- creating or updating the landing page record
- publishing a landing page
- expiring a landing page
- previewing readiness before publish

## 2. Design Principles

- all internal endpoints are workspace-scoped and require auth
- client input must never decide tenancy
- publishing is a state transition, not an ad hoc write
- unpublishing means expiring, not deleting
- validation should be explicit so owners understand why a page is not ready

## 3. Scope

This document covers:

- internal authenticated endpoints for landing page management
- state transitions for `draft`, `live`, and `expired`
- publish readiness validation
- response shapes needed by UI

This document does not cover:

- public lead submission API
- full listing CRUD API
- custom domain support
- search or sitemap APIs

## 4. Auth And Workspace Rules

All internal endpoints require:

- authenticated user
- resolved active workspace
- verified membership in that workspace

The server must derive `workspace_id` from the authenticated session and route context, not from arbitrary client-provided tenancy values.

## 5. Recommended Endpoint Set

MVP should expose:

- `GET /api/workspaces/:workspaceId/spaces/:spaceId/landing-page`
- `PUT /api/workspaces/:workspaceId/spaces/:spaceId/landing-page`
- `GET /api/workspaces/:workspaceId/spaces/:spaceId/landing-page/readiness`
- `POST /api/workspaces/:workspaceId/spaces/:spaceId/landing-page/publish`
- `POST /api/workspaces/:workspaceId/spaces/:spaceId/landing-page/expire`

## 6. Endpoint Details

### Preview decision

For MVP, the landing page readiness screen should show a structured summary card derived from existing landing page, listing, and space data.

MVP does not require a dedicated rendered landing-page preview endpoint.

Why:

- keeps the API lighter
- avoids duplicating public-page rendering concerns inside the onboarding flow
- is sufficient for the readiness and publish moment in MVP

## 6.1 Get landing page

### Endpoint

`GET /api/workspaces/:workspaceId/spaces/:spaceId/landing-page`

### Purpose

- returns the current landing page record for a space

### Auth

- requires workspace membership

### Response shape

```json
{
  "landingPage": {
    "id": "uuid",
    "spaceId": "uuid",
    "currentListingId": "uuid",
    "status": "draft",
    "slug": "plano-preston-oaks-suite-120",
    "canonicalUrl": "https://spaces.capratealpha.com/plano-preston-oaks-suite-120",
    "publishedAt": null,
    "lastUnpublishedAt": null,
    "metaTitle": "Retail Space For Lease - Plano, TX",
    "metaDescription": "1,500 SF retail suite for lease in Plano."
  }
}
```

### Notes

- if no landing page exists yet, return `404` or a null payload depending on implementation preference
- I recommend returning `404` plus a clear machine-readable code

## 6.2 Create or update landing page draft

### Endpoint

`PUT /api/workspaces/:workspaceId/spaces/:spaceId/landing-page`

### Purpose

- creates the landing page record if missing
- updates the draft metadata and listing linkage if it exists

### Auth

- requires workspace membership

### Request shape

```json
{
  "currentListingId": "uuid",
  "slug": "plano-preston-oaks-suite-120",
  "metaTitle": "Retail Space For Lease - Plano, TX",
  "metaDescription": "1,500 SF retail suite for lease in Plano."
}
```

### Server rules

- verify the space belongs to the workspace
- verify the listing belongs to the same workspace and same space
- generate or normalize slug if omitted or invalid
- do not allow this endpoint to silently publish the page
- resulting status remains `draft` unless already `live` and the update is explicitly allowed by product policy

### Recommended MVP behavior

If a page is already `live`, allow safe metadata/content updates without forcing unpublish.

That means:

- `status` stays `live`
- canonical URL remains stable unless slug is intentionally changed

### Response shape

```json
{
  "landingPage": {
    "id": "uuid",
    "status": "draft",
    "slug": "plano-preston-oaks-suite-120",
    "canonicalUrl": "https://spaces.capratealpha.com/plano-preston-oaks-suite-120"
  }
}
```

## 6.3 Get publish readiness

### Endpoint

`GET /api/workspaces/:workspaceId/spaces/:spaceId/landing-page/readiness`

### Purpose

- tells the UI whether the page is ready to publish
- returns actionable validation gaps

### Auth

- requires workspace membership

### Response shape

```json
{
  "ready": false,
  "checks": {
    "spaceExists": true,
    "listingAttached": true,
    "requiredFieldsComplete": false,
    "presentableAssetAvailable": true
  },
  "blockingIssues": [
    {
      "code": "MISSING_RENT_DATA",
      "message": "Add asking rent details before publishing."
    }
  ]
}
```

### Required readiness checks

- space exists in workspace
- current listing exists and belongs to the space
- required vacancy fields are present
- at least one presentable asset exists or can be generated
- no conflicting active landing page exists for the space

## 6.4 Publish landing page

### Endpoint

`POST /api/workspaces/:workspaceId/spaces/:spaceId/landing-page/publish`

### Purpose

- transitions a landing page to `live`

### Auth

- requires workspace membership

### Request shape

```json
{
  "currentListingId": "uuid"
}
```

### Server behavior

1. resolve workspace and space
2. load or create draft landing page record
3. verify readiness checks
4. ensure slug and canonical URL are finalized
5. set `status = live`
6. set `published_at` if not already set
7. persist changes
8. trigger confirmation email with canonical URL

### Important rule

Publishing should be idempotent enough for UI retry.

If the page is already `live`, return success with the existing canonical record instead of erroring unless the request conflicts materially.

### Response shape

```json
{
  "landingPage": {
    "id": "uuid",
    "status": "live",
    "slug": "plano-preston-oaks-suite-120",
    "canonicalUrl": "https://spaces.capratealpha.com/plano-preston-oaks-suite-120",
    "publishedAt": "2026-06-27T20:00:00Z"
  },
  "nextActions": [
    "share_with_tenant_rep",
    "download_flyer",
    "publish_to_loopnet"
  ]
}
```

### Failure cases

- `400` invalid request shape
- `403` user not authorized for workspace
- `404` space or listing not found in workspace
- `409` readiness failure or conflicting active page state

### Readiness failure response example

```json
{
  "error": {
    "code": "LANDING_PAGE_NOT_READY",
    "message": "Landing page cannot be published yet.",
    "blockingIssues": [
      {
        "code": "MISSING_LISTING",
        "message": "Attach a listing before publishing."
      }
    ]
  }
}
```

## 6.5 Expire landing page

### Endpoint

`POST /api/workspaces/:workspaceId/spaces/:spaceId/landing-page/expire`

### Purpose

- transitions a landing page from `live` or `draft` to `expired`

### Auth

- requires workspace membership

### Request shape

```json
{}
```

### Server behavior

1. resolve landing page for the space
2. set `status = expired`
3. set `last_unpublished_at` to current timestamp
4. preserve slug and canonical URL record
5. disable future lead capture through public behavior

### Response shape

```json
{
  "landingPage": {
    "id": "uuid",
    "status": "expired",
    "slug": "plano-preston-oaks-suite-120",
    "canonicalUrl": "https://spaces.capratealpha.com/plano-preston-oaks-suite-120",
    "lastUnpublishedAt": "2026-06-27T21:00:00Z"
  }
}
```

### Notes

- this endpoint should not delete records
- expired pages stay publicly reachable with branded unavailable experience

## 7. State Transition Rules

Allowed transitions:

- `draft -> live`
- `draft -> expired`
- `live -> expired`
- `live -> live` via safe update
- `expired -> live` only if re-publish is intentionally supported by implementation

Disallowed transitions:

- deleting the record through publish API
- multiple non-expired pages for one space

### Recommended MVP simplification

Allow `expired -> live` by reusing the same record if that keeps implementation simpler.

This is acceptable as long as:

- the one-non-expired-page rule is preserved
- canonical URL remains stable unless explicitly changed

## 8. Canonical URL And Slug Rules

- slug must be unique across all landing pages
- canonical URL is derived from the product-owned hostname plus slug
- slug should be generated server-side if not supplied
- slug collisions should resolve with deterministic suffixing

### Important API rule

The client may suggest a slug, but the server owns the final slug decision.

## 9. Validation Rules

At minimum, publish validation should require:

- property and space address data present enough for public display
- square footage present
- use type present
- rent data present enough for listing credibility
- listing copy present
- at least one usable image or generated asset available

### Suggested machine-readable validation codes

- `MISSING_SPACE`
- `MISSING_LISTING`
- `MISSING_ADDRESS`
- `MISSING_SQUARE_FEET`
- `MISSING_USE_TYPE`
- `MISSING_RENT_DATA`
- `MISSING_MARKETING_ASSET`
- `CONFLICTING_ACTIVE_PAGE`

## 10. Side Effects

Publishing should trigger:

- landing page status update
- confirmation email send
- availability for sitemap inclusion

Expiring should trigger:

- landing page status update
- removal from sitemap eligibility
- public lead capture disablement

MVP does not require:

- event bus complexity
- full audit timeline
- notification center entry generation

## 11. Error Handling Principles

- validation errors must be user-actionable
- auth failures must not leak workspace data
- state conflicts should return structured error codes
- repeated publish clicks should not create duplicate live pages

## 12. Recommended Next Step

This API design should unblock:

- route implementation
- service-layer methods
- onboarding publish flow UI
- confirmation email trigger implementation

After this, the next strongest artifact is the Day 1 onboarding wireframe brief.

# ADR: MVP Landing Page Publishing And Domain Model

## 1. Status

Accepted for MVP planning.

## 2. Decision

For MVP, CapRateAlpha landing pages will use:

- one public landing page per active space
- a CapRateAlpha-managed subdomain only
- a simple publish lifecycle driven by `landing_pages.status`
- deterministic slug-based URLs
- automatic index/noindex behavior based on landing page status

The recommended implementation is:

- each `Space` may have only one non-expired `LandingPage`
- landing pages publish to a CapRateAlpha-owned domain pattern
- `draft`, `live`, and `expired` states control public availability and indexing
- lead capture always routes to the owning workspace through the landing page record

## 3. Context

The MVP depends on public vacancy landing pages as the first tenant-facing discovery surface.

These pages are not just a UI detail. They are:

- the primary tenant access point in MVP
- the destination URL for owner sharing
- the page linked in outreach and future SEO content
- the source of inbound lead capture

The MVP intentionally does not include:

- a tenant-facing marketplace
- custom domains
- multiple concurrently live marketing pages per space
- complex publishing workflows

So the landing page model needs to be:

- simple
- shareable
- crawlable
- operationally predictable

## 4. Decision Drivers

This decision is driven by the need to:

- keep publishing simple for the first owner session
- support crawlable public inventory
- avoid domain-management complexity in MVP
- reduce ambiguity around what is live versus draft
- make lead routing deterministic

## 5. Options Considered

### Option A: Custom domains in MVP

Rejected.

Why:

- too much operational and product complexity for first release
- adds DNS, verification, SSL, and support burden
- unnecessary to prove the core product loop

### Option B: Multiple landing pages per space for different campaigns

Rejected for MVP.

Why:

- overcomplicates the publishing model
- creates ambiguity around canonical URL and lead routing
- not required for the first proof of value

### Option C: One landing page per space on a CapRateAlpha-managed domain

Chosen.

Why:

- matches MVP scope
- simple to explain to users
- clean SEO and canonical URL behavior
- easy to connect to onboarding and sharing workflows

## 6. Domain Strategy

MVP landing pages will live on a CapRateAlpha-managed domain only.

### Decision

Use a CapRateAlpha-controlled URL structure such as:

- `https://spaces.capratealpha.com/{slug}`

or an equivalent product-owned subdomain pattern.

The exact hostname can be finalized during implementation, but it must remain:

- CapRateAlpha-controlled
- consistent across all customers
- compatible with public indexing

### Why this is the MVP choice

- no customer DNS setup required
- no certificate management per customer
- simpler support model
- simpler publishing pipeline

### Explicitly out of scope

- customer custom domains
- branded subdomains per workspace
- per-workspace domain configuration UI

## 7. URL Strategy

Landing pages will use deterministic slug-based URLs.

### Decision

Each landing page must have:

- a stable `slug`
- a public `canonical_url`

### Slug rules

- generate from human-readable vacancy context
- prefer city + property + suite style structure
- append a short unique suffix when needed to avoid collisions
- keep slugs stable after publication unless there is a strong product reason to change them

Example shape:

- `plano-preston-oaks-suite-120`

### Canonical URL rule

- each live landing page has exactly one canonical public URL
- all sharing, indexing, and confirmation emails should use the canonical URL

## 8. Publishing Lifecycle

Landing page lifecycle is controlled by `landing_pages.status`.

### Allowed statuses

- `draft`
- `live`
- `expired`

### Draft

Behavior:

- page is not publicly indexed
- owner may preview internally
- page is not considered the active public marketing URL

### Live

Behavior:

- page is publicly accessible
- page is indexable
- page is the canonical URL for the space
- lead capture is enabled
- `published_at` must be set when the page first becomes live

### Expired

Behavior:

- page is no longer active for marketing
- page should become `noindex`
- page remains publicly reachable with a branded "space no longer available" experience
- lead capture should be disabled

## 9. Publish / Unpublish Rules

### Publish rules

A landing page may move from `draft` to `live` only when:

- the space exists and belongs to the workspace
- the current listing exists and belongs to the same space
- required vacancy fields are complete enough for public display
- at least one presentable marketing asset exists or can be rendered during publish

### Unpublish rules

For MVP, unpublishing should set the page to `expired`, not delete it.

Why:

- preserves the record
- preserves lead attribution
- keeps status-driven SEO behavior simple

### Re-publish behavior

If a space returns to market later:

- the existing landing page record may be re-used if product behavior remains simple, or
- a fresh landing page may be created if needed by implementation

However, MVP application behavior should still preserve the rule:

- only one non-expired landing page may exist per space

## 10. Database Enforcement

The product rule is:

- one active landing page per space

This should be enforced at the database layer using a partial unique index:

- unique on `landing_pages.space_id` where `status != 'expired'`

Why:

- prevents accidental double-publishing
- keeps canonical URL behavior clean
- avoids cleanup pain after data already exists

## 11. SEO And Indexing Rules

MVP landing pages are intended to be publicly discoverable.

### Indexing behavior

- `draft` -> `noindex`
- `live` -> `index`
- `expired` -> `noindex`

### Canonical behavior

- live pages must emit canonical URL metadata
- only one live page per space prevents canonical ambiguity

### Sitemap behavior

- live pages should be included in sitemap generation
- draft and expired pages should not be included

## 12. Public Access Rules

Landing pages are publicly accessible without authentication when `status = live`.

### Internal ownership rules still apply

- each landing page belongs to a workspace
- internal edits require authenticated workspace membership
- public reads do not bypass internal ownership for write operations

### Expired page behavior

MVP will return a branded "space no longer available" page for expired landing pages.

Why:

- preserves credibility when an old shared URL is visited
- keeps the canonical URL path stable for possible future re-listing
- avoids unnecessary 404 behavior for intentionally retired pages
- better communicates intentional state change to users and search systems

Implementation requirements:

- expired pages are not indexable
- expired pages do not collect new leads

## 13. Lead Routing Rules

All lead capture from a landing page must route through the landing page record.

### Decision

When a public inquiry form is submitted:

- the system resolves the landing page
- the system derives the `workspace_id` and `space_id` from that page
- the system creates the lead under the owning workspace
- the system attaches the lead to the landing page and space
- the system sends the owner confirmation notification

### Why this matters

- avoids trusting client-submitted tenancy values
- keeps lead ownership deterministic
- ensures reporting can attribute leads to the correct public page

## 14. Onboarding Implications

This decision supports the Day 1 user flow:

1. owner completes vacancy setup
2. system generates landing page content
3. owner publishes the page
4. system sets `status = live`
5. system stamps `published_at`
6. system sends the `Your space is live` confirmation email with canonical URL

This is one of the most important product moments in MVP.

## 15. Consequences

### Positive consequences

- simple public publishing model
- clear canonical URL behavior
- straightforward lead routing
- SEO behavior tied to a small status model
- no custom domain complexity in MVP

### Negative consequences

- no brand-level white-label domains in MVP
- no campaign-level multiple public pages per space
- some future publishing flexibility is intentionally deferred

These are acceptable MVP tradeoffs.

## 16. Deferred Decisions

The following are intentionally not resolved here:

- custom domain support
- branded subdomains per workspace
- A/B testing multiple public landing pages for one space
- redirect behavior for expired pages
- advanced SEO strategy beyond the current status model
- landing page version history beyond current listing linkage

These should be handled only if real MVP usage justifies them.

## 17. Follow-On Documents Unblocked By This ADR

This ADR should unblock:

- migration-oriented schema spec for `landing_pages`
- publish/unpublish API design
- onboarding wireframes for the publish moment
- confirmation email content implementation

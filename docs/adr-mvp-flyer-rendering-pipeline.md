# ADR: MVP Flyer Rendering Pipeline

## 1. Status

Accepted for MVP planning.

## 2. Decision

For MVP, CapRateAlpha will generate flyers using:

- one structured one-page flyer template
- HTML/CSS-based rendering
- PDF generation via headless Chromium / Playwright or equivalent browser renderer
- generated flyer storage as an `Asset` record
- synchronous generation in the primary user flow, with async fallback if performance proves unacceptable

The recommended implementation is:

- store flyer templates as product-owned HTML/CSS templates
- populate templates from structured `Space`, `Listing`, and `Asset` data
- render the template to PDF using a browser-grade renderer
- save the output as a generated `flyer_pdf` asset tied to the workspace and space

## 3. Context

The flyer is one of the two core MVP proof points, alongside the public landing page.

If the flyer looks weak, generic, or brittle, the product promise fails even if the rest of the workflow works.

MVP intentionally does not include:

- multiple flyer templates
- brochure generation
- social card families
- external design-editor customization
- complex asset-composition tooling

So the rendering pipeline must optimize for:

- high visual quality
- predictable output
- simple engineering shape
- support for one excellent template

## 4. Decision Drivers

This decision is driven by the need to:

- produce broker-grade flyer quality
- keep template control inside the product
- reuse structured listing and space data
- avoid vendor dependency for a core MVP artifact
- keep first-session generation fast enough to support onboarding

## 5. Options Considered

### Option A: Third-party design SaaS API first

Examples:

- Canva API
- Bannerbear
- Adobe Express API

Rejected for MVP core rendering.

Why:

- less control over deterministic layout behavior
- external dependency on a critical artifact
- harder to tightly couple to structured product data and future landing-page design language
- unnecessary complexity for one fixed MVP template

### Option B: Custom HTML/CSS template rendered to PDF with browser engine

Chosen.

Why:

- strong control over layout and typography
- naturally compatible with landing-page rendering patterns
- simple data binding model
- lower long-term marginal cost
- one good template can be built and iterated quickly

### Option C: Programmatic PDF drawing library first

Examples:

- PDFKit-style direct drawing
- low-level canvas/PDF composition

Rejected.

Why:

- slower to iterate visually
- worse ergonomics for design collaboration
- makes high-fidelity layout tuning more cumbersome

## 6. Template Strategy

MVP will ship with one flyer template only.

### Decision

The flyer will be:

- one page
- portrait-oriented
- institutionally styled
- driven by structured vacancy data

### Why one template only

- quality matters more than template breadth in MVP
- reduces design and QA surface area
- simplifies rendering logic
- supports the core product test without distraction

### Out of scope

- template chooser
- multiple flyer visual themes
- customer-level design customization
- brochure and social derivatives

## 7. Rendering Architecture

### Input data

The flyer should render from:

- `Property` data
- `Space` data
- `Listing` marketing copy
- selected image assets

### Rendering flow

1. load structured space and listing data
2. resolve selected assets
3. bind data into the flyer HTML template
4. render in a browser-grade engine
5. export PDF
6. persist PDF as a generated asset
7. return the asset reference to the application

### Output

- one PDF file stored as an `Asset`
- `asset_type = flyer_pdf`
- `source_type = generated`

## 8. Sync vs Async Generation

### MVP decision

Start with synchronous generation in the core flow.

Why:

- simplest implementation path
- best fit for first-session momentum
- easier product experience if flyer is immediately available after generation

### Fallback path

If real render times are too slow or operationally noisy, move generation behind a background job while preserving the same asset model.

### Practical threshold

If generation commonly exceeds a few seconds in real use, async generation should be considered.

The ADR does not require premature background-job complexity before that evidence exists.

## 9. Asset Storage Model

Generated flyers must be stored as assets in the product data model.

### Required asset linkage

- `workspace_id`
- `space_id`
- optional `listing_id`
- `asset_type = flyer_pdf`
- `source_type = generated`

### Why store generated flyers as assets

- makes download and re-use straightforward
- supports linking flyer download from landing pages
- keeps future regeneration and versioning options open

### Regeneration behavior

If an owner updates listing copy, space details, or selected images after a flyer has already been generated, MVP should allow flyer regeneration.

Regeneration should:

- create a new generated flyer asset record
- supersede the previously used flyer in product behavior
- avoid mutating the old asset in place

## 10. Data And Layout Rules

MVP template behavior should be deterministic.

### Required layout assumptions

- fixed one-page layout
- limited photo count
- predictable text areas for headline, summary, highlights, and property facts

### Content rules

- long text should be constrained or truncated by template logic where needed
- flyer should degrade gracefully when photo count is low
- required structured fields should be validated before generation

### Design rule

The renderer should not be responsible for "creative" layout decisions at runtime.

Design decisions belong in the template, not in AI or render-time heuristics.

## 11. Quality Standard

The flyer must meet the MVP quality bar defined in the broader product documents.

### MVP standard

The output should:

- look credible next to broker-produced leasing flyers
- print cleanly as a PDF
- remain readable on desktop and mobile PDF viewers
- stay visually stable across normal content variation

### Non-goal

MVP is not trying to support every possible vacancy shape beautifully.

It is trying to make the most common small-bay retail vacancy look professional and shareable.

## 12. Failure Handling

If flyer generation fails:

- the system should not silently swallow the error
- the user should receive a clear retry path
- the failed artifact should not be treated as a completed generated asset

For MVP, explicit retry behavior is enough.

Do not build complex render-queue observability tooling before real need emerges.

## 13. Consequences

### Positive consequences

- high control over output quality
- simple data binding model
- strong compatibility with one-template MVP strategy
- easier evolution toward future landing-page and brochure reuse

### Negative consequences

- browser-based rendering must be operationally stable
- some manual QA will still be needed during template tuning
- custom layout flexibility is intentionally limited

These are acceptable tradeoffs for MVP.

## 14. Deferred Decisions

The following are intentionally not resolved here:

- multiple flyer templates
- brochure rendering
- social asset rendering
- customer-facing template editing
- flyer version history UX
- async render queue architecture beyond fallback planning

These should be revisited only if MVP usage proves they are needed.

## 15. Follow-On Work Unblocked By This ADR

This ADR should unblock:

- implementation of the flyer template
- asset-generation API design
- download flow design
- landing-page brochure / flyer link behavior
- Day 1 onboarding flow polish around immediate flyer generation

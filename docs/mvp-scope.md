# CapRateAlpha MVP Scope

## 1. Purpose

This document defines the true MVP for CapRateAlpha.

It is intentionally narrower than the full product spec in [project-spec.md](/Users/dev/Documents/CapRateAlpha/docs/project-spec.md).

The goal of MVP is not to build the full landlord leasing operating system. The goal is to prove one core product truth:

"Can a retail owner go from vacant space to something professional and shareable in under 20 minutes?"

If the answer is yes, and owners actually use the output, then the product has earned the right to add deeper CRM, analytics, campaign, and data features later.

## 2. MVP Success Criteria

MVP is successful if a first-time owner can:

- sign up
- add one property and one vacant suite
- generate professional listing copy
- generate one broker-grade flyer
- publish one public vacancy landing page
- receive at least one lead through that page
- export a clean LoopNet-ready listing package

All of this should be achievable in a first session.

After that first session, the same workspace must also support adding and managing additional vacant suites without forcing a second account or overwriting the first space.

## 3. Core User and Use Case

### Primary user

An owner-operator or small portfolio landlord with a small-bay retail vacancy that is not getting enough brokerage attention.

### Immediate use case

"I have a vacant retail suite and I need something professional I can share today."

This is not a CRM-heavy user.

This user does not need:

- complex campaign management
- deep tenant intelligence
- multi-contact relationship mapping
- elaborate reporting

This user needs:

- speed
- credibility
- a public page
- a clean flyer
- a simple way to catch inbound interest

## 4. MVP Product Question

The MVP should answer one question for one owner:

"Can I market this vacant retail space myself, quickly, in a way that looks credible enough to compete with broker-produced materials?"

## 5. In Scope

## 5.1 Authentication and Workspace

Support:

- user signup and login
- one workspace per customer account
- multiple spaces within that workspace
- invitation-free single-workspace setup for MVP
- one owner/admin role for initial release

Why:

- required to create a real SaaS product
- enough structure for future expansion
- avoids over-designing permissions before usage is known

## 5.2 Property and Vacancy Setup

Support:

- property name
- address
- suite identifier
- square footage
- rent or pricing guidance
- use type
- basic highlights
- photo upload
- simple `Manage Spaces` list for switching between existing spaces in the workspace
- `Add New Space` flow that creates a new vacancy record instead of overwriting the most recent one

Why:

- this is the minimum structured input needed to generate credible marketing output
- small landlords and owner-operators often have more than one suite to market, even in MVP

## 5.3 AI Listing Copy Generation

Support:

- long-form listing description
- short-form listing summary
- LoopNet-style copy variant

Why:

- speeds up the most intimidating part of self-marketing
- directly reinforces the "looks like a brokerage team made it" promise

## 5.4 One Flyer Template, Done Well

Support:

- one institutional-quality one-page flyer template
- PDF export
- variable content handling for photos, highlights, and suite facts

Why:

- one excellent asset is more valuable than six mediocre ones
- this is the highest-leverage proof of product quality

MVP should not include:

- brochure template
- multiple social-card formats
- email teaser image system
- template library

## 5.5 Public Vacancy Landing Page

Support:

- one public page per active vacancy
- clean shareable URL
- SEO-ready structure
- lead capture form
- brochure / flyer download
- visible `Powered by CapRateAlpha` attribution

Landing page requirements:

- server-rendered or prerendered for crawlability
- unique title and meta description
- canonical URL
- XML sitemap inclusion
- status-driven index/noindex behavior

Entity requirements:

- `status`: `draft`, `live`, `expired`
- `published_at`
- `slug`
- `canonical_url`

Why:

- this is the tenant-facing access point in MVP
- this creates public inventory from day one
- this is the simplest valid answer to tenant discovery without building a marketplace

MVP domain decision:

- landing pages in MVP will live on a CapRateAlpha-managed subdomain only
- custom domains are explicitly out of scope for MVP

## 5.6 Basic Lead Capture and Lead List

Support:

- inbound inquiry form on public landing page
- automatic lead creation
- lead list view
- lead stage
- one notes field
- follow-up date
- email notification to owner when a lead is submitted

Why:

- owners need proof that inquiries do not disappear
- this is the minimum viable "pipeline"

MVP should not include:

- activity timeline
- multi-contact per lead
- contact deduplication
- evented stage history
- task engine
- notification center
- activity threading

## 5.7 Guided LoopNet Export

Support:

- required field checklist
- generated listing copy
- downloadable flyer asset
- downloadable image bundle
- simple status marker such as `draft`, `ready`, `exported`

Why:

- owners need to publish where tenants already search
- manual export is good enough for MVP if the workflow feels guided

## 5.8 First-Session Onboarding Flow

Support:

- signup
- workspace creation
- guided vacancy setup wizard
- simple in-workspace `Manage Spaces` view
- ability to add another vacancy after the first one is published
- autosave
- publish flow for first landing page
- confirmation email after publication with the public URL

Why:

- time-to-value is the whole product test

Confirmation email should include:

- the public vacancy URL
- one suggested next action such as sharing with a tenant rep or posting to LoopNet
- a prompt to download the flyer if the user has not done so yet

## 6. Explicitly Out of Scope

The following items belong to post-MVP unless direct user evidence proves otherwise:

- multi-user workspace roles beyond a basic owner/admin
- broker guest access
- deep CRM workflows
- deduplication
- stage event history
- task and reminder systems
- notification center
- campaign tracking
- outbound prospecting tools
- tenant fit scoring
- tenant category recommendations
- advanced analytics dashboard
- social card variants
- brochure template
- email teaser graphics
- direct listing syndication
- custom domains
- premium market data integrations

## 7. Suggested MVP Data Model

MVP should aim for a small working model, not the full V1 entity graph.

Recommended core entities:

- User
  Structural note: include a stable auth-provider user id and keep user records separate from workspace membership assumptions.
- Workspace
  Structural note: make `workspace_id` the tenant boundary from day one and require it on all business data.
- Property
  Structural note: store normalized address fields instead of a single freeform blob where possible.
- Space
  Structural note: include `property_id`, status, suite identifier, square footage, and use type as typed fields from day one.
- Listing
  Structural note: treat this as the structured marketing source record for a space, with generated copy stored separately from raw vacancy facts.
- LandingPage
  Structural note: include `workspace_id`, `space_id`, `current_listing_id`, `status`, `published_at`, `slug`, and `canonical_url` from day one.
- Lead
  Structural note: include `workspace_id`, `space_id`, `landing_page_id`, `source`, `stage`, and `follow_up_date` as typed fields even if the UI stays simple.
- Asset
  Structural note: distinguish generated assets from uploaded assets so rendering workflows can expand cleanly later.

Optional lightweight support entities if needed:

- Invitation
- Upload

Principle:

Keep the schema simple enough to move quickly, but not so sloppy that future expansion becomes a migration disaster.

## 8. MVP UX Standard

The MVP should feel:

- fast
- clear
- professional
- focused

It should not feel:

- enterprise
- over-configured
- CRM-heavy
- template-bloated

## 9. MVP Quality Bar

The MVP wins or loses on only three product moments:

1. the owner can enter vacancy data quickly
2. the flyer looks broker-grade
3. the public landing page feels credible and shareable

If these three moments are weak, deeper product functionality will not save the experience.

## 10. MVP Metrics

Track only the metrics that prove the core loop:

- time from signup to published vacancy page
- percentage of users who publish a page in first session
- flyer generation rate
- lead submission rate from public pages
- LoopNet export completion rate

Secondary metrics:

- number of returning owners
- number of published vacancies per workspace

## 11. Build Order Recommendation

Recommended implementation order:

1. auth and workspace setup
2. property and vacancy form
3. AI copy generation
4. flyer template rendering
5. public landing page publishing
6. lead capture and email notification
7. LoopNet export workflow
8. onboarding polish and confirmation email

## 12. MVP Exit Criteria

The product has earned expansion into V1 features when:

- at least 10 real owners have used it
- owners consistently publish pages and download flyers
- at least some owners receive real inbound inquiries
- users explicitly ask for deeper follow-up or CRM functionality
- the team has evidence of which missing features actually block usage

## 13. Relationship To Full Spec

The full product vision remains in [project-spec.md](/Users/dev/Documents/CapRateAlpha/docs/project-spec.md).

This MVP scope should be treated as the actual first build target.

When there is a conflict between the broader spec and this MVP document for early implementation priority, this document should win.

The broader spec should be treated as the V1 to V2 roadmap, not as the literal first sprint scope.

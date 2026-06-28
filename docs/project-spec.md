# CapRateAlpha Project Spec

## 1. Executive Summary

CapRateAlpha is a leasing and marketing platform for retail property owners who want broker-grade vacancy marketing without depending on full-service leasing brokers for every space.

The product should help owners:

- market vacant retail suites professionally
- publish listings to major channels
- generate marketing collateral and social assets
- capture and manage tenant leads
- run outbound prospecting and follow-up
- move smaller or lower-priority vacancies faster

The most realistic wedge is not "replace your broker." The wedge is:

- help owners market spaces between broker engagements
- help owners handle smaller vacancies brokers deprioritize
- help owners run a more disciplined process before, alongside, or between brokerage relationships

## 2. Problem Statement

Retail owners with vacancy often face three weak options:

- pay a large commission to a brokerage team
- self-market using generic tools and inconsistent materials
- wait passively for inbound demand

Large firms like CBRE, JLL, Cushman & Wakefield, and Matthews win because they combine:

- property positioning
- strong listing distribution
- polished brochures and digital collateral
- tenant targeting and outreach
- market research
- relentless pipeline follow-up

CapRateAlpha exists to package the repeatable parts of that workflow into software.

## 3. Product Vision

Give commercial retail owners a software operating system for leasing that makes them look and act more like an institutional landlord marketing team.

## 4. Positioning

### Core Positioning

"AI leasing and marketing software for retail landlords that helps fill vacancy faster with broker-grade marketing and workflow."

### Positioning To Avoid

- "fire your broker"
- "replace brokerage relationships entirely"
- "guaranteed tenants"

### Better Positioning Language

- "market vacant space faster"
- "run a professional leasing process in-house"
- "support the spaces your broker does not prioritize"
- "improve owner-side execution between broker relationships"

### Homepage Messaging Recommendation

Recommended hero headline:

"Fill your retail vacancies faster. With marketing that looks like it came from a brokerage team."

Recommended subheadline:

"For the spaces your broker doesn't prioritize, CapRateAlpha gives you professional leasing collateral, a tenant pipeline, and a workflow to move them yourself."

Recommended ROI support line:

"A single filled vacancy on a 5-year lease typically saves $10,000 to $20,000 in leasing commission. CapRateAlpha pays for itself the first time it works."

Recommended market-truth support line:

"The tenants expanding fastest right now, including QSR concepts, boutique fitness, wellness services, and food-and-beverage operators, are actively looking for small-bay space in suburban corridors. CapRateAlpha helps you find them before your broker does."

## 5. ICP and Segments

### Primary ICP

Small to mid-sized retail owners and operators with:

- 3 to 50 retail assets
- recurring small-bay vacancy
- limited in-house leasing operations
- willingness to self-manage some leasing workflow

### Secondary ICP

- family offices with neighborhood centers
- asset managers with scattered vacancies
- property management firms supporting landlord leasing
- in-house leasing teams needing lighter-weight tools

### Deprioritized For V1

- institutional owners demanding enterprise data integrations on day one
- brokers as the first core buyer
- office and industrial as primary property types

## 6. Core Jobs To Be Done

Owners need to:

- create a complete retail vacancy listing quickly
- package the space in a professional way
- distribute the opportunity to the market
- identify target tenant categories
- collect and manage inbound and outbound leads
- follow up until the lead converts or is lost
- measure what marketing and outreach actually worked

## 7. Product Principles

- owner-first UX, not broker-jargon-first UX
- broker-grade output quality
- speed from vacancy to market
- structured data before AI embellishment
- CRM discipline is mandatory, not optional
- V1 should be useful without proprietary enterprise market data

## 8. Non-Goals For V1

- full broker replacement
- full lease drafting or legal negotiation workflows
- national marketplace network effects from day one
- direct API syndication to every listing portal
- enterprise-grade market intelligence suite
- full outbound email sync and deliverability platform

## 9. What Large Brokerage Firms Actually Do

Public materials from CBRE, Matthews, JLL, and LoopNet suggest that effective landlord leasing teams combine:

- asset positioning and narrative development
- flyer, brochure, and media package creation
- portal listing distribution
- tenant and broker target lists
- direct outreach by email and phone
- local market and tenant movement intelligence
- active CRM and follow-up management

### Implication For CapRateAlpha

The product must be more than listing software. It should combine:

- vacancy data management
- marketing asset generation
- listing export and publishing workflows
- lead and activity CRM
- lightweight tenant-fit intelligence

## 10. Product Scope

### 10.1 Property and Space Management

Support:

- property profile
- suite profile
- availability status
- square footage and divisible ranges
- base rent, NNN, CAM, TI notes, and deal terms
- allowed / prohibited uses
- frontage, signage, access, parking, visibility
- anchor and co-tenancy context
- traffic counts and trade area notes
- photos, plans, maps, and documents

### 10.2 Listing Creation

Support:

- structured listing form
- generated long and short listing descriptions
- channel-specific variants
- media package assembly
- listing quality checklist before export

### 10.3 Marketing Collateral

Support:

- flyer PDF
- brochure PDF
- social cards in multiple aspect ratios
- email teaser graphics
- branded landing page per vacancy

### 10.4 Public Vacancy Landing Pages

Every active vacancy should generate a public-facing landing page that acts as the tenant access point in V1.

These pages should be:

- publicly accessible
- indexable by search engines
- built on clean, structured URLs
- easy to share by owners, brokers, and tenant reps
- optimized for local and long-tail search discovery

Each page should include:

- property name
- full address
- suite availability details
- square footage
- rent or pricing guidance when available
- use type / ideal tenant categories
- highlights, photos, plans, and brochure download
- lead capture / inquiry form

Each page should also include structured SEO markup and metadata where possible, including:

- address
- square footage
- use type
- asking rent or rent guidance
- landlord / contact information
- canonical page metadata

SEO implementation requirements for V1:

- server-rendered or prerendered HTML for crawlability
- unique title tags and meta descriptions per vacancy
- canonical URLs per vacancy page
- inclusion in XML sitemap generation
- index / noindex controls based on vacancy status
- clean slug structure such as `/spaces/city/property-name-suite-id`

V1 tenant discovery should rely on these pages being:

- discoverable via Google and other search engines
- shareable in email signatures and outreach
- linked from owner websites and social posts
- used as the destination URL for listing promotion and digital marketing

Default page chrome should include visible `Powered by CapRateAlpha` attribution.

Premium plans may remove this attribution through white-label configuration.

Lead routing from these pages should work as follows:

- each inquiry form submission automatically creates or updates a Lead record in the workspace CRM
- the submission is attached to the relevant Space, Listing, and LandingPage
- the workspace owner or assigned leasing manager receives an email notification
- the new inquiry appears in the CRM activity timeline and dashboard metrics
- the system creates a follow-up task if no owner response is logged within the configured SLA window

### 10.5 Lead and CRM

Support:

- inbound lead capture
- outbound prospect logging
- contact management
- company and brand records
- tasks, reminders, notes, and activity feed
- stage-based pipeline tracking

### 10.6 Publishing Workflows

Support:

- export package for LoopNet and similar portals
- per-channel status tracking
- listing completeness validation
- owner checklist for manual posting

### 10.7 Analytics

Support:

- listing readiness
- marketing asset generation
- channel publication status
- inquiry volume
- qualification rate
- stage conversion
- time to lease

## 11. V1 Product Wedge

The strongest V1 wedge is:

"software for landlord-side execution on small and mid-sized retail vacancies that need better marketing and follow-up than owners can do manually, but do not justify full brokerage attention."

This wedge is attractive because it:

- avoids direct confrontation with trusted broker relationships
- serves a frequent operational pain
- creates fast ROI through vacancy reduction
- allows the product to coexist with brokers instead of threatening them

## 11.1 V1 Tenant Discovery Answer

V1 does not need a full tenant-facing marketplace to support tenant discovery.

The minimum viable answer is:

- every vacancy gets a public, SEO-indexed landing page
- that page becomes the canonical tenant-facing URL for the space
- owners and tenant reps can share that URL directly
- search engines can crawl growing inventory over time

This gives CapRateAlpha crawlable public inventory from day one, without the complexity of building a multi-listing marketplace in MVP.

## 12. AI Strategy

## 12.1 Problem

The original spec listed AI features without grounding them in available data. That is too vague. AI usefulness here depends on what inputs the system truly has.

## 12.2 V1 AI Principle

V1 AI should rely primarily on:

- owner-provided structured property data
- owner-provided lead and activity data
- public place and category metadata
- deterministic rules and heuristics

V1 AI should not depend on expensive proprietary CRE data licensing.

## 12.3 V1 AI Features That Are Realistic

- listing copy generation from structured vacancy inputs
- channel-specific rewrite for flyer, LoopNet-style description, social post, and email teaser
- collateral headline generation
- lead note summarization
- next-best action suggestions based on CRM stage and inactivity
- tenant category suggestions based on rules plus public business metadata
- simple lead scoring based on fit criteria

## 12.4 V1 Features That Should Not Be Overpromised

- exact tenant expansion prediction
- high-confidence brand recommendation without paid market data
- true market-demand forecasting
- deep lease comp intelligence

## 12.5 Data Source Decision

### Recommended V1 Approach

Use a layered data strategy:

- first-party data: property, suite, listing, lead, and activity data entered by users
- public enrichment: Google Places style business categories, census demographics, OpenStreetMap / geospatial data, traffic or mobility data where available through affordable APIs
- rule engine: retail use compatibility, square footage fit, rent fit, and market fit scoring
- optional future premium layer: third-party CRE / trade area data for higher-priced plans

### Recommended Architectural Decision

Do not make CoStar-class licensing a prerequisite for MVP.

Instead:

- ship V1 with heuristics and public data
- reserve premium market intelligence for a later paid tier
- design the matching engine so external data providers can be added later without rewriting the product

## 12.6 Matching Logic For V1

V1 "tenant fit" should mean:

- size range compatibility
- use compatibility
- rent band compatibility
- trade area category fit
- proximity to complementary co-tenants
- owner-selected target tenant categories

This is a recommendation engine, not a predictive model.

## 13. Marketing Collateral Rendering Architecture

## 13.1 Problem

Generating broker-grade PDFs and image assets requires a real rendering pipeline, not just text generation.

## 13.2 Recommended V1 Decision

Use a custom template system built on structured HTML/CSS rendering, with server-side export to PDF and image formats.

### Recommended stack shape

- structured design templates stored as JSON + HTML/CSS
- server-side rendering to HTML
- PDF generation via Chromium / Playwright or equivalent HTML-to-PDF renderer
- image generation for social sizes via screenshot/render pipeline
- AI used only for copy and optional layout suggestions, not for final document rendering

## 13.3 Why This Is The Best V1 Choice

- more control over brand consistency
- no dependency on third-party design SaaS limitations
- easier to version templates
- easier to generate landing pages and PDFs from the same underlying layout system
- lower marginal cost at scale

## 13.4 When To Use External Design APIs

Third-party template APIs like Canva, Bannerbear, or Adobe Express are reasonable later if:

- users demand ad-hoc customization beyond template bounds
- internal rendering quality is not sufficient
- marketing teams need manual last-mile editing

But they should not be the core V1 architecture.

## 13.5 V1 Template Set

Start with:

- one-page flyer
- two-page brochure
- Instagram square card
- vertical story card
- LinkedIn landscape card
- email teaser image

## 13.6 Template Design Process

Before renderer engineering begins, the team should finalize 2 to 3 complete visual template systems covering the V1 asset set.

Each template system should include:

- one-page flyer
- two-page brochure
- square social card
- vertical social card
- landing page visual treatment

### Template ownership

- Product founder: approves market positioning and content structure
- Design lead or contracted brand designer: creates visual templates
- Engineering lead: validates renderability and implementation constraints
- Pilot landlord reviewers: validate that materials feel credible in-market

### Approval process

1. create low-fidelity content wireframes
2. create 2 to 3 polished design directions
3. review against reference examples from major brokerage materials
4. test with at least 2 target users or landlord operators
5. lock the first template set before renderer implementation

### Institutional quality definition

Templates should be considered acceptable only if they meet all of the following:

- visually comparable to CBRE / JLL style leasing collateral in hierarchy and polish
- readable when printed and when viewed on mobile
- consistent across flyer, brochure, landing page, and social variants
- render cleanly with variable content lengths and image counts
- approved by the founder and at least 2 external target users as market-credible

## 14. CRM and Data Model Expansion

## 14.1 Problem

The original entity list was too thin for a usable leasing CRM.

## 14.2 Required CRM Capabilities For V1

- multi-contact per company and per lead
- activity timeline
- note logging
- task and reminder system
- stage history
- deduplication for contact and company records
- ownership assignment
- source attribution
- inbound form capture
- simple notification system

## 14.3 Expanded Core Entities

- Workspace
- User
- Membership
- Property
- Space
- Listing
- ListingChannel
- ListingPublication
- MarketingTemplate
- MarketingAsset
- LandingPage
- Company
- Contact
- Lead
- LeadContact
- Requirement
- Activity
- ActivityThread
- Task
- Notification
- Campaign
- CampaignAsset
- Inquiry
- Tour
- Proposal
- LeaseOutcome
- Tag
- Attachment

### LandingPage modeling decision

For V1, a `LandingPage` should be scoped primarily to a `Space` and generated from the current active `Listing`.

The intended model is:

- one active `LandingPage` per `Space`
- the `LandingPage` renders the current active `Listing` content for that `Space`
- past marketing versions live in `Listing` history rather than as multiple concurrently live landing pages

The `LandingPage` entity should include at minimum:

- `space_id`
- `current_listing_id`
- `status` with values `draft`, `live`, `expired`
- `published_at`
- `slug`
- `canonical_url`

`status` should control search indexability automatically so that:

- `draft` pages are `noindex`
- `live` pages are `index`
- `expired` pages are `noindex` or redirected according to future SEO policy

## 14.4 Important Modeling Rules

- a lead may reference multiple contacts
- a company may own many contacts
- a space may have many leads over time
- all meaningful user actions should create activity records
- stage changes must be evented, not overwritten silently
- dedupe should key off email, phone, and company-domain heuristics

## 14.5 CRM Scope Boundary For V1

V1 should not attempt to become Salesforce.

It should be a purpose-built leasing CRM with:

- excellent vacancy-centric workflow
- visible activity history
- clear reminders
- clean reporting inputs

## 15. Auth and Multi-Tenant Architecture

## 15.1 Problem

A shared SaaS product with owners and team members needs workspace tenancy from day one.

## 15.2 Required V1 Model

Use a workspace-based multi-tenant architecture:

- each landlord account belongs to a workspace
- users can belong to one or more workspaces
- properties, spaces, leads, assets, and campaigns are scoped to a workspace
- permissions are role-based within each workspace

## 15.3 Suggested Roles

- workspace owner
- admin
- leasing manager
- marketing contributor
- read-only analyst

## 15.4 Architectural Requirement

Every core table should include workspace scoping from day one. Retrofitting tenancy later is high-risk and should be avoided.

## 15.5 Future Sharing Model

Design for future guest access such as:

- broker collaborator
- outside marketing vendor
- ownership-report viewer

but do not fully build external collaboration in V1.

## 16. Listing Distribution and LoopNet Workflow

## 16.1 Problem

"Manual publishing workflow" is too vague to ship.

## 16.2 V1 Definition

V1 should explicitly support "guided manual publication."

That means the product generates:

- channel-ready listing text
- image and brochure asset bundle
- field-by-field export checklist
- publication status tracking

## 16.3 LoopNet Workflow In Product Terms

For each vacancy, the user should be able to:

1. choose `Publish to LoopNet`
2. see required fields and missing data
3. generate a LoopNet-ready description variant
4. download optimized media assets
5. copy structured facts from a clean export screen
6. mark the listing as `Submitted`, `Live`, `Needs Update`, or `Expired`

## 16.4 Output Formats

V1 outputs should include:

- copyable listing description
- downloadable image bundle
- brochure PDF
- CSV or structured field export where helpful
- internal publication checklist

## 16.5 UX Goal

The owner should feel guided through portal posting, not abandoned with raw data.

## 17. Recommended Architecture Direction

This spec is product-first, but the following decisions should be assumed:

- multi-tenant SaaS architecture from day one
- API-backed backend with workspace-scoped data model
- object storage for media and generated assets
- background jobs for rendering, AI generation, and notifications
- event logging for CRM timeline and analytics
- rendering service for PDFs and social image assets

## 18. V1 Feature Set

### Must Have

- workspace auth and role-based membership
- property and vacancy setup
- structured listing form
- media upload and asset library
- AI-assisted listing copy generation
- flyer and social-card generation
- public SEO-indexed vacancy landing page with clean shareable URL
- lead capture forms
- vacancy-centric CRM with activity timeline and tasks
- guided LoopNet-style manual publication workflow
- basic analytics dashboard

### Should Have

- tenant category recommendation engine
- simple fit scoring for leads
- campaign tracking
- notification center
- broker-shareable read-only vacancy links

### Nice To Have

- direct portal integrations
- paid third-party market data integrations
- email inbox sync
- bulk outreach tooling
- tenant-facing marketplace

## 19. Acquisition Strategy

## 19.1 Problem

The original spec did not explain how landlords discover the product.

## 19.2 Recommended Initial GTM

Start with a wedge around educational and pain-based acquisition:

- SEO content for "how to lease retail space without a broker"
- SEO content for "retail vacancy marketing checklist"
- case-study style content around filling small-bay vacancy
- outbound prospecting to family offices, strip center owners, and local operators
- presence in ICSC-adjacent communities and industry channels

### ICSC strategy

ICSC should be treated as a Year 1 GTM priority, not a future nice-to-have.

The initial ICSC engagement model should include:

- attending key national and local ICSC events
- building relationships with retail owners and leasing teams in those communities
- lightweight founder-led content and community participation before sponsorship spend
- evaluating speaking, partnership, or sponsorship opportunities only after early customer validation

This channel requires explicit founder time allocation because it is one of the highest-signal places to reach the target customer base.

## 19.3 Partnership Opportunities

Explore later:

- property management software ecosystems
- local CRE associations
- marketing agencies serving retail landlords
- broker teams using the product for smaller assignments

## 19.4 GTM Hypothesis

The initial buyer is likely an owner-operator or asset manager who feels underserved on smaller vacancies, not an enterprise innovation team.

## 20. Pricing Strategy

## 20.1 Problem

Pricing shapes ICP and product packaging, so it must be addressed early.

## 20.2 Recommended V1 Pricing Direction

Use SaaS subscription pricing based on active vacancies or asset count, not commission or success fees.

### Recommended packaging shape

- Starter: $99/month for 1 to 3 active vacancies
- Growth: $299/month for up to 15 active vacancies with team access
- Premium: $599/month for larger portfolios, advanced analytics, and premium data features

### Pricing hypothesis implications

- `Starter` should be self-serve with lightweight onboarding and guided setup
- `Growth` can justify assisted onboarding and a 30-minute kickoff call
- `Premium` can support higher-touch implementation, premium support, and future data upsells

### ROI anchor for sales and positioning

CapRateAlpha should be sold against the cost of vacancy and the cost of traditional leasing commissions.

Illustrative example:

- filling a 1,500 sqft suite at $20/sqft on a 5-year lease can represent $150,000 in base rent value
- even modest leasing commissions on that deal can easily exceed many years of CapRateAlpha subscription cost

The sales motion should emphasize that the product can pay for itself by improving marketing and execution on a single filled vacancy.

## 20.3 Why This Pricing Fits

- aligns with vacancy pain
- easy to understand
- preserves software positioning instead of broker positioning
- supports both small owners and mid-sized portfolios

## 20.4 Pricing To Avoid Initially

- percentage-of-lease or commission-like pricing
- per-email pricing complexity
- per-seat-only pricing with no vacancy component

## 20.5 Pricing Validation Plan

Before launch, pricing should be tested through:

- founder-led customer discovery conversations
- landing page willingness-to-pay tests
- pilot customer interviews around vacancy ROI
- packaging tests for self-serve versus assisted onboarding

## 21. Network Effects and Compounding Value

## 21.1 Problem

The base SaaS model has weak network effects if every landlord operates independently.

## 21.2 V1 Reality

V1 does not need strong network effects to be valuable.

It can still win as workflow software.

However, public vacancy landing pages should be treated as the first compounding discovery layer.

As more owners publish active vacancies, CapRateAlpha builds:

- more indexable listing pages
- more long-tail search entry points
- more shareable tenant-facing URLs
- a stronger foundation for a future search or marketplace layer

## 21.3 Future Compounding Mechanisms

Potential future layers:

- shared anonymized tenant requirement intelligence
- tenant-facing search surface
- broker collaborator directory
- brand / tenant demand heatmaps across aggregated platform activity
- cross-owner benchmarking on inquiry and conversion rates

## 21.4 Strategic Recommendation

Do not force a marketplace into MVP. Design data models so aggregated intelligence can become a moat later.

## 22. Success Metrics

### Business Metrics

- reduction in days vacant
- qualified leads per vacancy
- time from vacancy creation to first published listing
- cost of leasing workflow versus traditional alternatives
- conversion from inquiry to tour
- conversion from tour to proposal

### Product Metrics

- percentage of vacancies with complete listing profile
- number of generated assets per vacancy
- percentage of vacancies published within 48 hours
- CRM task completion rate
- weekly active workspaces with active vacancies
- percentage of leads with logged follow-up within SLA

## 23. Day 1 Onboarding Journey

The first-session experience should get a new owner from signup to a shareable vacancy page in roughly 20 minutes.

### Day 1 success outcome

By the end of the first session, the owner should have:

- created a workspace
- added one property and one vacancy
- uploaded basic media
- generated listing copy
- generated at least one flyer or social asset
- published a public vacancy landing page

Within the same workspace, the owner should also be able to return later, see previously created spaces, and add another vacancy without opening a second account or overwriting the first one.

### Recommended Day 1 flow

1. user signs up and creates workspace
2. onboarding asks whether they are adding a single vacancy or a portfolio
3. guided wizard collects property address, suite details, square footage, use type, and rent guidance
4. user uploads photos and optional brochure inputs
5. system generates listing copy draft and landing page preview
6. user reviews required fields and completes missing items
7. system publishes public vacancy page with shareable URL
8. user downloads flyer or social card and sees `Publish to LoopNet` next step
9. system sends a `Your space is live` confirmation email with the public URL and sharing suggestions

### Onboarding UX requirements

- progress-based wizard, not a blank dashboard first
- visible checklist for `Complete listing`, `Publish page`, and `Export marketing`
- sample content guidance for owners unfamiliar with leasing terminology
- autosave and resume later support
- clear time-to-value messaging during the flow
- simple `Manage Spaces` view after first setup so an owner can switch between existing spaces and start `Add New Space`

## 24. Risks and Decision Log

### Key Risks

- public-data-based tenant matching may feel weak if oversold
- poor CRM adoption destroys analytics quality
- collateral quality must feel institutional or the value proposition collapses
- manual publishing UX may feel clunky if not carefully designed

### Decisions To Resolve Before Architecture Starts

- Data vendors for V1 enrichment and V2 premium data
  Decision owner: Founder / product lead
  Target date: July 5, 2026
- Final rendering stack implementation and deployment model
  Decision owner: Engineering lead
  Target date: July 5, 2026
- Auth vendor and workspace permission model
  Decision owner: Engineering lead
  Target date: July 3, 2026
- Notification channels for V1: email only or email plus SMS
  Decision owner: Founder / product lead
  Target date: July 8, 2026
- Landing page domain strategy: CapRateAlpha subdomain or custom domain support
  Decision owner: Founder / product lead
  Target date: July 8, 2026
- Initial template design direction approval
  Decision owner: Founder + design lead
  Target date: July 10, 2026

## 25. Recommended Next Documents

The next useful files should be:

- system architecture decision record
- detailed data model and schema draft
- user stories and acceptance criteria
- GTM memo and pricing memo
- wireframes for vacancy editor, CRM timeline, and publication workflow

## 26. Source Links

- [LoopNet homepage](https://www.loopnet.com/)
- [LoopNet: How to Find Office Tenants](https://www.loopnet.com/cre-explained/investing/how-to-find-office-tenants/)
- [LoopNet: How to Find Industrial Tenants](https://www.loopnet.com/cre-explained/investing/how-to-find-industrial-tenants/)
- [Matthews Leasing Services](https://www.matthews.com/services/leasing)
- [Matthews Tenant Representation](https://www.matthews.com/services/leasing/tenant-representation/)
- [CBRE Landlord Leasing](https://www.cbre.com/services/manage-properties-and-portfolios/landlord-leasing)
- [CBRE Calibre Creative Group](https://www.cbre.com/services/manage-properties-and-portfolios/landlord-leasing/calibre-creative-group)
- [JLL](https://www.jll.com/)

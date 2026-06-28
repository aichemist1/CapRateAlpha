# CapRateAlpha Day 1 Onboarding Wireframe Brief

## 1. Purpose

This document defines the wireframe brief for the MVP Day 1 onboarding experience.

It follows:

- [mvp-scope.md](/Users/dev/Documents/CapRateAlpha/docs/mvp-scope.md)
- [homepage-copy.md](/Users/dev/Documents/CapRateAlpha/docs/homepage-copy.md)
- [api-design-mvp-publish-unpublish.md](/Users/dev/Documents/CapRateAlpha/docs/api-design-mvp-publish-unpublish.md)
- [adr-mvp-flyer-rendering-pipeline.md](/Users/dev/Documents/CapRateAlpha/docs/adr-mvp-flyer-rendering-pipeline.md)

The goal is to define the first-session UX that gets a new owner from signup to:

- a published landing page
- a generated flyer
- a clear next action

## 2. Core Product Promise

The onboarding flow should make the product promise feel real within one session:

"Fill your retail vacancies faster. With marketing that looks like it came from a brokerage team."

The user should feel:

- this is faster than doing it manually
- this looks more professional than what they would make themselves
- they have something real to share before they leave the session

## 3. Primary User

The Day 1 flow is for:

- an owner-operator or small portfolio landlord
- with one real retail vacancy
- who wants something professional they can share immediately

This user is:

- not technical
- not CRM-oriented
- time-sensitive
- skeptical until they see a tangible output

## 4. Day 1 Success Outcome

By the end of the first session, the user should have:

- created an account and workspace
- entered one property and one space
- generated listing copy
- generated one flyer
- published one landing page
- received a `Your space is live` email with the public URL

After the first session, the same workspace should also make it easy to add a second space and switch between spaces without creating a new account or losing the first one.

## 5. UX Principles

- start with action, not setup overhead
- use a guided wizard, not a blank dashboard
- show progress clearly
- keep users moving toward the first public output
- favor confidence-building language over real-estate jargon overload
- expose only the fields needed for the first publish

## 6. Recommended Screen Flow

The recommended Day 1 flow is:

1. hero CTA -> signup
2. account creation
3. workspace naming
4. vacancy setup wizard
5. media upload
6. copy generation and review
7. flyer generation and preview
8. landing page readiness / publish
9. success state with sharing next actions
10. post-publish return path into `Manage Spaces` for adding the next vacancy

## 7. Screen Briefs

## 7.1 Signup Screen

### Goal

- convert homepage intent into a working account with minimal friction

### Primary content

- short headline reinforcing fast value
- email and password or magic link entry
- simple trust note about getting a vacancy live quickly

### Primary CTA

- `Publish Your Vacancy`

### UX notes

- do not overload with feature tour content
- keep this page tightly tied to the homepage promise

## 7.2 Workspace Creation Screen

### Goal

- create the workspace with minimal setup burden

### Fields

- workspace / company name

### Supporting copy

- explain that this is where their property and marketing materials will live

### UX notes

- this should feel like a short step, not a configuration page

## 7.3 Vacancy Setup Wizard

### Goal

- capture the minimum structured information needed to generate credible output
- support both first-space setup and later `Add New Space` behavior inside the same workspace

### Recommended step grouping

- Property
- Space
- Pricing and use
- Highlights

### Required fields

- property name
- address
- suite identifier
- square footage

### Workspace behavior note

- the onboarding experience may begin with a blank first-space state
- once at least one space exists, the UI should expose a simple `Manage Spaces` list or rail
- that list should let the owner switch to an existing space or start `Add New Space`
- `Add New Space` must create a new space record, not overwrite the most recently edited one
- use type
- asking rent amount
- rent type
- basic highlights

### UX notes

- use clear section labels and plain-language field help
- autosave after each step
- show progress indicator at the top
- allow back navigation without losing work

## 7.4 Media Upload Screen

### Goal

- collect enough visual material to make the flyer and landing page feel credible

### Required inputs

- at least one photo

### Optional inputs

- additional photos
- floorplan if available

### UX notes

- emphasize that one good photo is enough to continue
- do not force perfect completeness
- preview uploaded assets immediately

## 7.5 Copy Generation And Review Screen

### Goal

- turn structured vacancy inputs into professional marketing copy

### UI components

- long-form description
- short-form summary
- LoopNet-style description
- regenerate / edit controls

### UX notes

- show that the system did work on the user's behalf
- allow light editing without overwhelming the user
- make the copy feel like an upgrade, not just auto-filled text

## 7.6 Flyer Generation And Preview Screen

### Goal

- deliver the first emotionally meaningful output

### UI components

- one-page flyer preview
- download CTA
- lightweight loading state while rendering

### UX notes

- this is a high-trust moment
- the preview should look polished and calm, not technical
- if generation takes a moment, explain that professional marketing material is being prepared

## 7.7 Landing Page Readiness Screen

### Goal

- show whether the page is ready to publish
- surface any missing blocking items clearly

### UI components

- checklist of publish requirements
- blocking issue messages if incomplete
- landing page preview summary
- publish CTA

### UX notes

- use the readiness API directly to drive the checklist
- blocking messages must be actionable, not generic
- users should feel guided, not judged

## 7.8 Publish Confirmation Screen

### Goal

- make the publish moment feel real and rewarding

### UI components

- success headline
- public URL
- copy link CTA
- open page CTA
- download flyer CTA
- next-step suggestions

### Suggested next actions

- share with a tenant rep
- post to LoopNet
- download the flyer

### UX notes

- this is the emotional payoff of the flow
- the user should leave feeling they have a real marketing asset, not a saved draft

## 8. Required Global UI Elements

Across the Day 1 flow, include:

- progress bar or stepper
- autosave status
- persistent primary CTA
- clear back / next navigation
- help text for unfamiliar commercial leasing terms

## 9. Loading And Empty States

### Loading states needed

- copy generation
- flyer rendering
- publish action

### Empty states needed

- no uploaded photos yet
- no flyer generated yet
- landing page not ready yet

### UX rule

Every loading state should explain what the system is doing in plain language.

## 10. Error States

### Must-handle errors

- signup failure
- autosave failure
- flyer generation failure
- publish readiness validation failure
- publish request failure

### UX rule

Errors should always offer:

- a clear explanation
- a retry path
- a way to continue without losing work

## 11. Mobile Considerations

The Day 1 flow should work on mobile, even if desktop is the primary authoring experience.

### Mobile priorities

- readable forms
- stable stepper navigation
- flyer preview that can be zoomed or opened separately
- flyer preview should open in a new tab or dedicated PDF viewer component rather than relying on cramped inline PDF rendering
- easy copy-link behavior after publish

## 12. Tone And Messaging

The flow should borrow directly from the approved homepage message.

### Use language like

- professional leasing collateral
- publish your vacancy
- your space is live
- ready to share

### Avoid language like

- enterprise setup
- campaign orchestration
- deal pipeline optimization

## 13. Deliverables For Design

The wireframe package should include:

- low-fidelity flow for all Day 1 screens
- one higher-fidelity version of the flyer generation moment
- one higher-fidelity version of the publish success state
- annotations for validations, autosave, and loading states

## 14. Open Questions For Wireframing

These do not block the brief, but design should decide:

- whether workspace creation is its own screen or embedded into signup
- whether copy generation and flyer generation live on one combined screen or two
- whether landing page preview appears before or after flyer preview

Highest-priority design decision:

- whether copy generation and flyer generation live on one screen or two should be resolved early, because it most directly affects perceived speed and momentum in the Day 1 flow

## 15. Recommended Next Step

This wireframe brief should unblock:

- low-fidelity onboarding wireframes
- UX copy for Day 1 flow
- implementation planning for onboarding screens

After this, the next sensible step is an implementation backlog or first sprint breakdown.

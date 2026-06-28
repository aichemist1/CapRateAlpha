# ADR: MVP Auth And Workspace Model

## 1. Status

Accepted for MVP planning.

## 2. Decision

For MVP, CapRateAlpha will use:

- a third-party hosted authentication provider
- a workspace-scoped multi-tenant data model
- simple role-based access control at the workspace level
- one primary role in the initial shipped product: `owner`

The recommended implementation is:

- use Supabase Auth for user authentication
- model tenancy with first-class `Workspace` and `Membership` records
- require `workspace_id` on all business-domain records
- enforce authorization in both application logic and database query boundaries

## 3. Context

CapRateAlpha is an MVP SaaS product, not a single-tenant internal tool.

Even the lean MVP requires:

- signup and login
- persistent ownership of properties, spaces, listings, assets, and leads
- public landing pages tied to the correct owner workspace
- future support for invitations, broker collaboration, and multi-user teams

At the same time, the MVP scope intentionally avoids:

- complex permission matrices
- record-level ACL customization
- external collaborator sharing
- multi-workspace UX complexity for end users

The design goal is to choose an auth and tenancy model that is:

- fast to implement
- secure enough for a commercial SaaS product
- easy to reason about in code
- expandable without major rework

## 4. Decision Drivers

The decision is driven by the following needs:

- MVP must ship quickly
- tenant boundaries must be correct from day one
- onboarding should be simple for a single owner account
- future expansion to team members should not require schema replacement
- auth should not become a custom infrastructure project

## 5. Options Considered

### Option A: Build custom auth in-house

Rejected.

Why:

- too much security and operational risk for MVP
- slows product work
- unnecessary when mature providers already solve this well

### Option B: Use Clerk or Auth0 with application-managed tenancy

Reasonable, but not the recommended MVP path.

Why not first choice:

- excellent products, but more application-side assembly for the rest of the stack
- may be better fits if identity product depth becomes a core need later

### Option C: Use Supabase Auth with application-managed workspace tenancy

Chosen.

Why:

- fast developer setup
- strong support for email/password and magic link flows
- works well with a Postgres-backed product model
- keeps auth and core application data in a stack that is simple for MVP teams to reason about
- good fit for workspace-scoped SaaS patterns

## 6. Chosen Auth Vendor

CapRateAlpha MVP will use Supabase Auth.

### Why Supabase Auth fits MVP

- supports standard SaaS signup/login needs
- reduces implementation time versus custom auth
- allows future addition of OAuth providers if needed
- integrates naturally with a Postgres-centric schema
- keeps the team focused on product behavior instead of auth plumbing

### MVP auth methods

Support:

- email and password
- magic link sign-in if desired during implementation

Do not require for MVP:

- SSO
- SCIM
- enterprise identity federation
- social login breadth beyond what materially helps onboarding

## 7. Workspace Tenancy Model

CapRateAlpha will use a workspace-based tenant model from day one.

### Core rules

- each customer account creates one `Workspace` during onboarding
- the initial signed-up user becomes the `owner` of that workspace
- one workspace may contain multiple properties and multiple spaces in MVP
- all business records belong to exactly one workspace
- all non-public application reads and writes must be scoped by `workspace_id`

### Required core records

- `User`
- `Workspace`
- `Membership`

### Record relationships

- one `User` may belong to one or more workspaces in the future
- one `Workspace` may have one or more users in the future
- one `Workspace` may have many spaces in MVP
- MVP UX will expose only the single-workspace path

`Single-workspace path` does not mean `single-space path`.

For MVP, the application should assume:

- one owner works inside one workspace
- that workspace may contain multiple spaces over time
- owner UX must allow selecting an existing space and adding a new space without creating a second workspace

### Why use Membership even though MVP has one role

Because it prevents a future schema rewrite.

Even if the first release only uses `owner`, `Membership` gives us:

- clean separation between identity and tenancy
- future invitation support
- future role support
- future broker / guest collaboration support

## 8. MVP Role Model

MVP shipped behavior will support one role:

- `owner`

The schema may allow future roles, but the application should not expose them yet.

### Owner permissions in MVP

An `owner` can:

- create and update the workspace
- create and manage properties, spaces, listings, landing pages, assets, and leads within the workspace
- publish and unpublish landing pages
- receive lead notifications
- view all workspace data

### Future roles intentionally deferred

- `admin`
- `leasing_manager`
- `marketing_contributor`
- `read_only`
- broker guest / collaborator roles

These roles belong to post-MVP once actual team behavior is observed.

## 9. Authorization Enforcement Model

Authorization should be enforced in two places:

- application layer
- data access layer

### Application-layer rules

- every authenticated request resolves the current user and active workspace
- all business queries must explicitly scope to that workspace
- all mutations must verify the acting user has membership in that workspace

### Data access rules

- every business table includes `workspace_id` unless the record is globally public and read-only
- repository or query helpers must require workspace scoping parameters
- no unscoped list queries should exist for business data

### Public landing page exception

Public landing pages are accessible without authentication.

However:

- each public page still belongs to a workspace internally
- leads submitted through public pages must be created under the correct workspace
- internal management of that landing page remains workspace-scoped

## 10. Schema Requirements

The following records must be modeled carefully from day one.

### User

Must include:

- auth-provider user id
- email
- created timestamps

Principle:

- do not make `User` itself the tenant boundary

### Workspace

Must include:

- name
- created timestamps

Principle:

- workspace is the tenant boundary

### Membership

Must include:

- `user_id`
- `workspace_id`
- `role`
- created timestamps

Principle:

- even if only one role is used at launch, membership should be explicit

### Business entities

At minimum, these must include `workspace_id`:

- `Property`
- `Space`
- `Listing`
- `LandingPage`
- `Lead`
- `Asset`

## 11. Onboarding Implications

This decision shapes the MVP onboarding flow as follows:

1. user signs up through Supabase Auth
2. application creates a new workspace
3. application creates a membership linking the user to that workspace as `owner`
4. application routes the user into vacancy setup inside that workspace

MVP does not need:

- invitation acceptance during onboarding
- workspace switching UI
- multiple roles selection

## 12. Security And Operational Implications

### Benefits

- avoids building custom auth
- gives clear tenant boundaries
- keeps future collaboration paths open
- reduces odds of accidental cross-customer data leakage

### Risks

- careless query code could still bypass workspace scoping if helpers are weak
- future multi-workspace support will require UX design, even if schema already supports it
- provider lock-in exists at the auth layer, though this is acceptable for MVP

### Mitigations

- centralize workspace-scoped query helpers
- require `workspace_id` in all business-service access patterns
- test for cross-workspace isolation explicitly

## 13. Consequences

### Positive consequences

- unblocks schema design
- unblocks onboarding flow
- unblocks lead ownership and landing-page ownership modeling
- keeps MVP simpler than a full permission system

### Negative consequences

- some future permission flexibility is deferred
- membership model may feel slightly heavier than the first shipped UI needs

This tradeoff is acceptable because the schema discipline is worth it.

## 14. Deferred Decisions

The following are intentionally not resolved in this ADR:

- post-MVP roles and permission matrix
- broker collaborator access model
- invitation UX and email flows
- workspace switching UX
- row-level security implementation details
- enterprise SSO or advanced identity features

These should be handled in later ADRs only when they become implementation-relevant.

## 15. Implementation Guidance For MVP

If there is pressure to simplify further, do not remove:

- `Workspace`
- `Membership`
- `workspace_id` on business tables

If there is pressure to add more now, do not add:

- fine-grained ACLs
- object-level sharing permissions
- multi-role admin tooling

The right MVP balance is:

- simple product behavior
- disciplined tenant model

## 16. Follow-On Documents Unblocked By This ADR

This ADR should unblock:

- MVP schema draft
- onboarding flow wireframes
- landing page ownership model
- lead routing implementation design

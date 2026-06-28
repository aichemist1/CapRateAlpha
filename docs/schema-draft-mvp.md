# CapRateAlpha MVP Schema Draft

## 1. Purpose

This document defines the recommended MVP data model for CapRateAlpha.

It follows:

- [mvp-scope.md](/Users/dev/Documents/CapRateAlpha/docs/mvp-scope.md)
- [adr-mvp-auth-and-workspace-model.md](/Users/dev/Documents/CapRateAlpha/docs/adr-mvp-auth-and-workspace-model.md)

This is a schema draft, not a final migration spec.

The goal is to make the first implementation:

- small enough to ship quickly
- structured enough to avoid rework
- aligned with the MVP product loop

## 2. Design Principles

- `workspace_id` is the tenant boundary for all business data
- keep the number of tables low, but not so low that future expansion becomes painful
- prefer typed columns for important workflow state over loose JSON blobs
- store generated output separately from raw source inputs when it affects future editing
- optimize for the first owner journey: property -> space -> listing -> flyer -> landing page -> lead

## 3. Core Tables

Recommended MVP tables:

- `users`
- `workspaces`
- `memberships`
- `properties`
- `spaces`
- `listings`
- `landing_pages`
- `assets`
- `leads`

Optional support tables if implementation benefits from separation:

- `uploads`
- `audit_events`

## 4. Table Drafts

## 4.1 users

Purpose:

- stores application-level user identity mapped to the auth provider

Required fields:

- `id`
- `auth_user_id`
- `email`
- `full_name`
- `created_at`
- `updated_at`

Constraints:

- `auth_user_id` unique
- `email` unique

Notes:

- `auth_user_id` should map to the Supabase Auth user id
- `full_name` can be nullable for MVP if onboarding does not require it

## 4.2 workspaces

Purpose:

- tenant boundary for all business records

Required fields:

- `id`
- `name`
- `slug`
- `created_at`
- `updated_at`

Constraints:

- `slug` unique

Notes:

- `slug` may be used in internal URLs or future workspace settings
- keep this table simple for MVP

## 4.3 memberships

Purpose:

- links users to workspaces and stores workspace-scoped role

Required fields:

- `id`
- `user_id`
- `workspace_id`
- `role`
- `created_at`
- `updated_at`

Constraints:

- unique on (`user_id`, `workspace_id`)

Enum:

- `role`: `owner`

Notes:

- only `owner` is used in MVP UI
- keep role as an enum or constrained text to avoid freeform drift

## 4.4 properties

Purpose:

- represents a retail property or center

Required fields:

- `id`
- `workspace_id`
- `name`
- `street_1`
- `street_2`
- `city`
- `state`
- `postal_code`
- `country`
- `latitude`
- `longitude`
- `created_at`
- `updated_at`

Optional fields:

- `property_type`
- `highlights`

Constraints:

- foreign key `workspace_id` -> `workspaces.id`

Notes:

- use normalized address fields, not a single freeform address blob
- `highlights` can be text for MVP

## 4.5 spaces

Purpose:

- represents an individual rentable suite or unit within a property

Required fields:

- `id`
- `workspace_id`
- `property_id`
- `name`
- `suite_identifier`
- `status`
- `square_feet`
- `use_type`
- `asking_rent_amount`
- `rent_type`
- `rent_notes`
- `highlights`
- `created_at`
- `updated_at`

Optional fields:

- `availability_date`
- `is_divisible`

Enum:

- `status`: `draft`, `active`, `leased`, `archived`
- `rent_type`: `gross`, `nnn`, `modified_gross`, `unknown`

Constraints:

- foreign key `workspace_id` -> `workspaces.id`
- foreign key `property_id` -> `properties.id`

Notes:

- `name` can default to a human-readable label if `suite_identifier` is sparse
- `square_feet` should be numeric, not text
- `use_type` should be constrained text or enum-friendly from day one
- rent should be structured for copy generation, not stored only as a freeform string

## 4.6 listings

Purpose:

- stores the structured marketing record for a space

Required fields:

- `id`
- `workspace_id`
- `space_id`
- `status`
- `loopnet_export_status`
- `headline`
- `description_long`
- `description_short`
- `description_loopnet`
- `generated_copy_version`
- `created_at`
- `updated_at`

Optional fields:

- `publication_notes`

Enum:

- `status`: `draft`, `ready`, `archived`
- `loopnet_export_status`: `draft`, `ready`, `exported`

Constraints:

- foreign key `workspace_id` -> `workspaces.id`
- foreign key `space_id` -> `spaces.id`

Notes:

- treat the listing as the editable marketing source record
- store generated copy outputs in typed columns for now instead of a separate copy table
- only one active working listing per space should be assumed in MVP application behavior, even if not hard-enforced immediately
- `loopnet_export_status` is the lightweight MVP state field for guided manual export workflow

## 4.7 landing_pages

Purpose:

- stores the public vacancy page tied to a space and powered by the current listing

Required fields:

- `id`
- `workspace_id`
- `space_id`
- `current_listing_id`
- `status`
- `slug`
- `canonical_url`
- `published_at`
- `last_unpublished_at`
- `created_at`
- `updated_at`

Optional fields:

- `meta_title`
- `meta_description`

Enum:

- `status`: `draft`, `live`, `expired`

Constraints:

- foreign key `workspace_id` -> `workspaces.id`
- foreign key `space_id` -> `spaces.id`
- foreign key `current_listing_id` -> `listings.id`
- unique on `slug`
- partial unique index on active `space_id` so only one non-expired landing page can exist per space

Notes:

- `status` drives search indexing behavior
- `published_at` should be set only when the page becomes live
- this table represents one active page per space in MVP, not campaign history
- enforce the one-active-page-per-space rule at the database layer

## 4.8 assets

Purpose:

- stores both uploaded media and generated marketing assets

Required fields:

- `id`
- `workspace_id`
- `space_id`
- `asset_type`
- `source_type`
- `storage_path`
- `mime_type`
- `file_size_bytes`
- `created_at`
- `updated_at`

Optional fields:

- `listing_id`
- `width`
- `height`
- `label`

Enum:

- `asset_type`: `photo`, `flyer_pdf`, `brochure_pdf`, `floorplan`, `logo`, `generated_image`, `other`
- `source_type`: `uploaded`, `generated`

Constraints:

- foreign key `workspace_id` -> `workspaces.id`
- foreign key `space_id` -> `spaces.id`
- foreign key `listing_id` -> `listings.id`

Notes:

- `listing_id` may be nullable for general uploaded property images if needed
- keep distinction between uploaded and generated assets from day one
- MVP likely only uses photos and one generated flyer PDF, but the schema should not require a redesign to add more asset types

## 4.9 leads

Purpose:

- stores inbound inquiry records from public landing pages

Required fields:

- `id`
- `workspace_id`
- `space_id`
- `landing_page_id`
- `source`
- `stage`
- `contact_name`
- `contact_email`
- `message`
- `follow_up_date`
- `submitted_at`
- `created_at`
- `updated_at`

Optional fields:

- `contact_phone`
- `company_name`
- `owner_notes`

Enum:

- `source`: `landing_page`, `manual`
- `stage`: `new`, `contacted`, `qualified`, `lost`

Constraints:

- foreign key `workspace_id` -> `workspaces.id`
- foreign key `space_id` -> `spaces.id`
- foreign key `landing_page_id` -> `landing_pages.id`

Notes:

- keep leads intentionally simple in MVP
- `owner_notes` is enough instead of a separate notes table
- `submitted_at` captures the actual inquiry event time even if record creation pipelines change later

## 5. Relationship Summary

- one `user` can have many `memberships`
- one `workspace` can have many `memberships`
- one `workspace` can have many `properties`
- one `property` can have many `spaces`
- one `space` can have many `listings` over time
- one `space` has one active `landing_page` in MVP
- one `space` can have many `assets`
- one `space` can have many `leads`
- one `landing_page` can have many `leads`

## 6. Recommended Enums

Keep enums narrow in MVP.

### memberships.role

- `owner`

### spaces.status

- `draft`
- `active`
- `leased`
- `archived`

### listings.status

- `draft`
- `ready`
- `archived`

### listings.loopnet_export_status

- `draft`
- `ready`
- `exported`

### landing_pages.status

- `draft`
- `live`
- `expired`

### leads.source

- `landing_page`
- `manual`

### leads.stage

- `new`
- `contacted`
- `qualified`
- `lost`

### assets.source_type

- `uploaded`
- `generated`

### spaces.rent_type

- `gross`
- `nnn`
- `modified_gross`
- `unknown`

## 7. Cross-Table Rules

- every business table must include `workspace_id`
- application writes must validate that parent records belong to the same workspace
- public landing page reads are the only business-data reads that should not require auth
- `landing_pages.status` should drive index/noindex behavior
- a lead created from a landing page must inherit the workspace from that page, not from client input

## 8. Things Intentionally Not Modeled Yet

These are intentionally deferred from MVP schema:

- contacts table
- companies table
- activity timeline
- task table
- notification table
- campaign table
- publication tracking table
- deduplication infrastructure
- multi-contact lead relationships

If these become necessary, they should be added after real usage evidence, not preemptively.

## 9. Suggested Indexes

At minimum:

- unique index on `users.auth_user_id`
- unique index on `users.email`
- unique index on `workspaces.slug`
- unique index on `memberships (user_id, workspace_id)`
- index on `properties.workspace_id`
- index on `spaces.workspace_id`
- index on `spaces.property_id`
- index on `listings.workspace_id`
- index on `listings.space_id`
- unique index on `landing_pages.slug`
- partial unique index on `landing_pages.space_id` where status != 'expired'
- index on `leads.workspace_id`
- index on `leads.space_id`
- index on `leads.landing_page_id`
- index on `leads.stage`

## 10. Implementation Notes

- use UUIDs for primary keys
- add `created_at` and `updated_at` to every table
- prefer nullable columns over premature support tables when the feature is not yet real
- keep public URL generation deterministic and slug-based
- avoid polymorphic ownership patterns in MVP

## 11. Open Questions For Migration Draft

These do not block the schema draft, but should be decided when writing actual migrations:

- whether `full_name` belongs on `users` or a separate profile table
- whether `property_type` and `use_type` should be enums or constrained text initially
- whether `storage_path` alone is enough or if signed/public URL metadata should also be stored
- whether `listing_id` on `assets` should be nullable or a join table should be introduced later

## 12. Recommended Next Step

The next artifact after this schema draft should be:

- a migration-oriented schema spec, or
- the ADR for landing page publishing and domain strategy

If the team wants to start implementation immediately, this document is detailed enough to draft initial migrations and ORM models.

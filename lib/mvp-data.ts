export const homepageMetrics = [
  {
    value: "$10k-$20k",
    label: "Typical commission savings on one filled 5-year vacancy"
  },
  {
    value: "<20 min",
    label: "Target time from signup to shareable marketing output"
  },
  {
    value: "1 URL",
    label: "Canonical public page for tenants, reps, and owner outreach"
  }
] as const;

export const readinessItems = [
  {
    label: "Vacancy details complete",
    complete: true,
    note: "Address, suite, square footage, use type, and rent data are ready."
  },
  {
    label: "Listing copy attached",
    complete: true,
    note: "Long-form, short-form, and LoopNet-ready copy are generated."
  },
  {
    label: "Presentable marketing asset available",
    complete: true,
    note: "A one-page flyer is ready to download and share."
  },
  {
    label: "Public page can go live",
    complete: false,
    note: "Pick a final slug and publish to create the shareable URL."
  }
] as const;

export const sampleSpace = {
  propertyName: "Preston Oaks",
  address: "6201 W Park Blvd, Plano, TX 75093",
  suite: "Suite 120",
  squareFeet: 1500,
  rent: "$20/SF NNN",
  useType: "QSR / service retail",
  highlights: "High-traffic neighborhood center with strong co-tenancy and easy ingress.",
  slug: "plano-preston-oaks-suite-120",
  canonicalUrl: "https://spaces.capratealpha.com/plano-preston-oaks-suite-120"
} as const;

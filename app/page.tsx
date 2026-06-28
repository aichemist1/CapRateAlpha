import { CommissionCalculator } from "@/components/commission-calculator";
import { SiteHeader } from "@/components/site-header";
import { homepageMetrics } from "@/lib/mvp-data";

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <section className="hero hero-surface">
        <div className="page-shell hero-grid hero-grid-marketing">
          <div className="stack hero-copy" style={{ gap: 22 }}>
            <div className="eyebrow">Broker-Grade Leasing For Owners</div>
            <h1 className="hero-title marketing-hero-title">
              Fill your retail vacancies faster. With marketing that looks like it
              came from a brokerage team.
            </h1>
            <p className="lede">
              For the spaces your broker doesn&apos;t prioritize, CapRateAlpha
              gives you professional leasing collateral, a tenant pipeline, and a
              workflow to move them yourself.
            </p>
            <p className="body-copy">
              A single filled vacancy on a 5-year lease typically saves $10,000 to
              $20,000 in leasing commission. CapRateAlpha pays for itself the
              first time it works.
            </p>
            <div className="market-note">
              <span className="market-note-label">Leasing demand we track</span>
              <p className="market-note-copy">
                QSR, boutique fitness, wellness services, and food-and-beverage
                operators are among the most active small-bay tenants in suburban
                corridors.
              </p>
            </div>
            <div className="hero-proof-grid">
              <div className="hero-proof-card">
                <strong>Broker-grade flyer</strong>
                <p className="hero-proof-copy">
                  Generate polished leasing collateral an owner can share the same day.
                </p>
              </div>
              <div className="hero-proof-card">
                <strong>Public vacancy page</strong>
                <p className="hero-proof-copy">
                  Publish a live page with clean URL, lead capture, and search visibility.
                </p>
              </div>
              <div className="hero-proof-card">
                <strong>LoopNet-ready export</strong>
                <p className="hero-proof-copy">
                  Package your copy and assets for the channels owners already rely on.
                </p>
              </div>
            </div>
          </div>
          <div className="card hero-art hero-art-marketing">
            <img
              alt="Sample CapRateAlpha retail flyer"
              className="hero-static-image"
              src="/sample-flyer.svg"
            />
          </div>
        </div>
      </section>

      <section className="shell-section">
        <div className="page-shell homepage-value-grid">
          <CommissionCalculator />
          <div className="stack homepage-proof-strip" style={{ gap: 16 }}>
            <div className="eyebrow">Why owners care</div>
            <div className="card-grid columns-3">
              {homepageMetrics.map((metric) => (
                <div className="card metric" key={metric.label}>
                  <div className="metric-value">{metric.value}</div>
                  <div className="metric-label">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

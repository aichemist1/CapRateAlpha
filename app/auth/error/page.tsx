import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function AuthErrorPage() {
  return (
    <main>
      <SiteHeader />
      <section className="shell-section">
        <div className="page-shell">
          <div className="card panel stack">
            <div className="eyebrow">Auth Error</div>
            <h1 className="section-title">We couldn&apos;t finish sign in.</h1>
            <p className="body-copy">
              Try again from the signup screen. If the issue persists, check the
              Supabase redirect settings and local environment values.
            </p>
            <div className="button-row">
              <Link className="button button-primary" href="/signup">
                Back To Signup
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

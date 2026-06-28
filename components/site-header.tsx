import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="site-header">
      <div className="page-shell site-header-inner">
        <Link className="logo" href="/">
          CapRateAlpha
        </Link>
        {user ? (
          <nav className="site-nav" aria-label="Primary">
            <Link className="site-nav-link" href="/onboarding">
              Manage Spaces
            </Link>
            <Link className="site-nav-link" href="/account">
              Account
            </Link>
          </nav>
        ) : (
          <nav className="site-nav" aria-label="Primary">
            <Link className="site-nav-link" href="/spaces/plano-preston-oaks-suite-120">
              View Sample Vacancy Page
            </Link>
            <Link className="site-nav-link is-accent" href="/signup">
              Publish Your Vacancy
            </Link>
            <Link className="site-nav-link is-quiet" href="/login">
              Sign In
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

import { signInAction } from "@/app/signup/actions";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/onboarding");
  }

  const resolvedSearchParams = await searchParams;
  const message = resolvedSearchParams?.message;

  return (
    <main>
      <SiteHeader />
      <section className="shell-section">
        <div className="page-shell two-col">
          <div className="stack">
            <div className="eyebrow">Owner Sign In</div>
            <h1 className="section-title workspace-title">Return to your spaces.</h1>
            <p className="lede">
              Sign in to manage live vacancies, update listing materials, and keep
              your public pages current.
            </p>
            <div className="signup-proof stack">
              <div className="signup-proof-item">
                <strong>Workspace access</strong>
                <span className="muted">Manage vacancy pages, flyers, and LoopNet-ready packages in one place.</span>
              </div>
            </div>
            {message ? (
              <div className="card panel">
                <strong>Status</strong>
                <p className="muted" style={{ marginBottom: 0 }}>
                  {message}
                </p>
              </div>
            ) : null}
          </div>
          <div className="card panel">
            <div className="form-grid">
              <form action={signInAction} className="form-grid">
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" placeholder="owner@center.com" />
                </div>
                <div className="field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                  />
                </div>
                <div className="button-row">
                  <button className="button button-primary" type="submit">
                    Sign In
                  </button>
                </div>
              </form>
              <p className="footer-note">
                Need an account? <Link href="/signup">Create one here</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

import { signInAction, signUpAction } from "@/app/signup/actions";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

type SignupPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
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
            <div className="eyebrow">Day 1 Start</div>
            <h1 className="section-title">Publish your vacancy today.</h1>
            <p className="lede">
              Create your account, name your workspace, and move straight into the
              vacancy setup flow.
            </p>
            <p className="body-copy">
              The goal of the first session is simple: get one broker-grade flyer
              and one live public landing page out into the world.
            </p>
            <div className="signup-proof stack">
              <div className="signup-proof-item">
                <strong>What you leave with</strong>
                <span className="muted">A live vacancy page, a clean flyer, and a LoopNet-ready package.</span>
              </div>
              <div className="signup-proof-item">
                <strong>Why owners use it</strong>
                <span className="muted">Move faster on the spaces a brokerage team may not prioritize.</span>
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
              <form action={signUpAction} className="form-grid">
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
                    placeholder="Create a password"
                  />
                </div>
                <div className="button-row">
                  <button className="button button-primary" type="submit">
                    Create Account
                  </button>
                  <button className="button button-secondary" formAction={signInAction} type="submit">
                    Sign In
                  </button>
                </div>
              </form>
              <p className="footer-note">
                Already have an account? <a href="/login">Sign in here</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

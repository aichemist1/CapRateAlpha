import Link from "next/link";
import { signOutAction } from "@/app/signup/actions";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <main>
      <SiteHeader />
      <section className="shell-section">
        <div className="page-shell account-shell">
          <div className="card workbench-panel stack">
            <div className="workbench-head workbench-head-compact">
              <div className="eyebrow">Account</div>
              <h1 className="section-title workspace-title">Manage your account.</h1>
              <p className="body-copy">
                Review your signed-in session and move back into the owner workspace.
              </p>
            </div>
            <div className="summary-card summary-compact property-brief">
              <strong>{user.email ?? "Signed-in owner"}</strong>
              <span className="muted">Primary login for this workspace session</span>
            </div>
            <div className="button-row">
              <Link className="button button-primary" href="/onboarding">
                Open Workspace
              </Link>
              <form action={signOutAction}>
                <button className="button button-secondary" type="submit">
                  Log Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

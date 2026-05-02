import Link from "next/link";

import { Header } from "../components/Header";

export default function AdminPage() {
  return (
    <>
      <Header />
      <main className="shell not-found">
        <div>
          <p className="eyebrow">Owner controls</p>
          <h1>Coming next</h1>
          <p>Hide and delete controls will connect here once the backend API is implemented.</p>
          <div className="hero-actions">
            <Link className="button primary" href="/">
              Back to Wall of Shame
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

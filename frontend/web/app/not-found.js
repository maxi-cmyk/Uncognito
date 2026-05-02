import Link from "next/link";

import { Header } from "./components/Header";

export default function NotFoundPage() {
  return (
    <>
      <Header />
      <main className="shell not-found">
        <div>
          <p className="eyebrow">Not public</p>
          <h1>Roast missing</h1>
          <p>This roast does not exist, is hidden, or has been deleted.</p>
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

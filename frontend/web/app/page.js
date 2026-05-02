import Link from "next/link";

import { Header } from "./components/Header";
import { formatRoastTime, getPublicRoasts } from "./lib/roasts";

export default async function HomePage() {
  const roasts = await getPublicRoasts();
  const featured = roasts[0];

  return (
    <>
      <Header />
      <main>
        <section className="hero shell">
          <div className="hero-copy">
            <p className="eyebrow">Opt-in accountability chaos</p>
            <h1>Wall of Shame</h1>
            <p>
              Uncognito catches consenting procrastination screenshots, turns them into a
              roast, and gives the audience a share-ready receipt.
            </p>
            <div className="hero-actions">
              <Link
                className="button primary"
                href={featured ? `/roast/${featured.id}` : "#"}
              >
                Latest roast
              </Link>
              <a
                className="button"
                href="https://www.linkedin.com/"
                rel="noreferrer"
                target="_blank"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {featured ? (
            <Link className="feature-roast" href={`/roast/${featured.id}`}>
              <img className="feature-image" src={featured.imageUrl} alt="" />
              <div className="feature-body">
                <span className="label">{featured.sourceHost}</span>
                <p className="caption">{featured.caption}</p>
                <p className="meta">{formatRoastTime(featured.createdAt)}</p>
              </div>
            </Link>
          ) : (
            <div className="empty">No roasts yet.</div>
          )}
        </section>

        <section className="shell">
          <div className="section-head">
            <div>
              <p className="eyebrow">Public captures</p>
              <h2>Latest receipts</h2>
            </div>
          </div>

          {roasts.length ? (
            <div className="grid">
              {roasts.map((roast) => (
                <Link className="roast-card" href={`/roast/${roast.id}`} key={roast.id}>
                  <img className="roast-image" src={roast.imageUrl} alt="" />
                  <div className="card-body">
                    <span className="label">{roast.sourceHost}</span>
                    <h3>{roast.caption}</h3>
                    <p className="meta">{formatRoastTime(roast.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty">A roast will appear here after the first upload.</div>
          )}
        </section>
      </main>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";

import { Header } from "../../components/Header";
import { formatRoastTime, getPublicRoasts, getRoast } from "../../lib/roasts";

export function generateStaticParams() {
  return getPublicRoasts().map((roast) => ({ id: roast.id }));
}

export function generateMetadata({ params }) {
  const roast = getRoast(params.id);

  if (!roast) {
    return {
      title: "Roast not found | Uncognito",
    };
  }

  return {
    title: `${roast.caption} | Uncognito`,
    description: roast.caption,
    openGraph: {
      title: "Uncognito caught a roast",
      description: roast.caption,
      images: [roast.imageUrl],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: "Uncognito caught a roast",
      description: roast.caption,
      images: [roast.imageUrl],
    },
  };
}

export default function RoastDetailPage({ params }) {
  const roast = getRoast(params.id);

  if (!roast) {
    notFound();
  }

  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    `/roast/${roast.id}`,
  )}`;

  return (
    <>
      <Header />
      <main className="shell detail">
        <Link className="button" href="/">
          Back to wall
        </Link>
        <article className="detail-card">
          <img className="roast-image" src={roast.imageUrl} alt="" />
          <div className="detail-body">
            <span className="label">{roast.sourceHost}</span>
            <p className="caption">{roast.caption}</p>
            <p className="meta">{formatRoastTime(roast.createdAt)}</p>
            <div className="share-row">
              <a className="button primary" href={linkedInShareUrl} rel="noreferrer" target="_blank">
                LinkedIn share link
              </a>
              <Link className="button" href="/">
                Wall of Shame
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";

import { Header } from "../../components/Header";
import { CopyButton } from "../../components/CopyButton";
import { formatRoastTime, getRoast } from "../../lib/roasts";
import { getPublicAppUrl } from "../../lib/url";

export async function generateMetadata({ params }) {
  const roast = await getRoast(params.id);

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

export default async function RoastDetailPage({ params }) {
  const roast = await getRoast(params.id);

  if (!roast) {
    notFound();
  }

  const baseUrl = getPublicAppUrl();
  const publicUrl = `${baseUrl}/roast/${roast.id}`;

  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    publicUrl,
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
              <a
                className="button primary"
                href={linkedInShareUrl}
                rel="noreferrer"
                target="_blank"
              >
                Share on LinkedIn
              </a>
              <CopyButton url={publicUrl} />
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

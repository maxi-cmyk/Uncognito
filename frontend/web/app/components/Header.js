import Link from "next/link";

export function Header() {
  return (
    <header className="topbar shell">
      <Link className="brand" href="/">
        <span className="brand-mark">U</span>
        <span>Uncognito</span>
      </Link>
      <nav className="nav" aria-label="Primary">
        <Link href="/">Wall of Shame</Link>
        <Link href="/admin">Owner controls</Link>
      </nav>
    </header>
  );
}

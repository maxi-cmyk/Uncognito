import Link from "next/link";

export function Header() {
  return (
    <header className="topbar shell">
      <Link className="brand" href="/">
        <span>Uncognito</span>
      </Link>
      <nav className="nav" aria-label="Primary">
        <Link href="/">Wall of Shame</Link>
        <Link className="nav-icon" href="/admin" aria-label="Owner controls">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            
          </svg>
        </Link>
      </nav>
    </header>
  );
}

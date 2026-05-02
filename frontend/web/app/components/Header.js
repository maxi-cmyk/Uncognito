import Link from "next/link";

export function Header() {
  return (
    <header className="topbar shell">
      <Link className="brand" href="/">
        <span>Uncognito</span>
      </Link>
      <nav className="nav" aria-label="Primary">
        <Link className="nav-icon" href="/admin" aria-label="Owner controls">
          <img src="/gear.png" alt="Settings" width="18" height="18" />
        </Link>
      </nav>
    </header>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";

import { Header } from "../components/Header";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [roasts, setRoasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRoasts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/roasts", {
        headers: { "x-admin-token": token },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load roasts.");
        setRoasts([]);
        return;
      }

      setRoasts(data.roasts || []);
      setError("");
    } catch (err) {
      setError("Network error. Is the server running?");
      setRoasts([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchRoasts();
  }, [token]);

  const handleHide = async (id) => {
    const res = await fetch(`/api/roasts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token,
      },
      body: JSON.stringify({ action: "hide" }),
    });

    if (res.ok) {
      fetchRoasts();
    } else {
      const data = await res.json();
      setError(data.message || "Failed to hide roast.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this roast?")) return;

    const res = await fetch(`/api/roasts/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": token },
    });

    if (res.ok) {
      fetchRoasts();
    } else {
      const data = await res.json();
      setError(data.message || "Failed to delete roast.");
    }
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case "public":
        return "badge public";
      case "hidden":
        return "badge hidden";
      case "deleted":
        return "badge deleted";
      case "processing":
        return "badge processing";
      case "failed":
        return "badge failed";
      default:
        return "badge";
    }
  };

  return (
    <>
      <Header />
      <main className="shell admin">
        <div className="admin-head">
          <div>
            <p className="eyebrow">Owner controls</p>
            <h1>Admin dashboard</h1>
            <p>Hide or delete roasts. Requires a valid admin token.</p>
          </div>
        </div>

        <div className="token-field">
          <label htmlFor="adminToken">Admin token</label>
          <div className="token-row">
            <input
              id="adminToken"
              type="password"
              placeholder="Enter ADMIN_TOKEN..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchRoasts()}
            />
            <button className="button primary" onClick={fetchRoasts} disabled={loading}>
              {loading ? "Loading..." : "Load roasts"}
            </button>
          </div>
        </div>

        {error && <p className="admin-error">{error}</p>}

        {roasts.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Caption</th>
                <th>Source</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roasts.map((roast) => (
                <tr key={roast.id}>
                  <td className="mono">
                    <a href={`/roast/${roast.id}`} target="_blank" rel="noreferrer">
                      {roast.id}
                    </a>
                  </td>
                  <td>
                    <span className={statusBadgeClass(roast.status)}>{roast.status}</span>
                  </td>
                  <td className="caption-cell">{roast.caption}</td>
                  <td>{roast.sourceHost || "—"}</td>
                  <td className="nowrap">{formatDate(roast.createdAt)}</td>
                  <td>
                    <div className="action-row">
                      {roast.status === "public" && (
                        <button className="button small" onClick={() => handleHide(roast.id)}>
                          Hide
                        </button>
                      )}
                      {roast.status !== "deleted" && (
                        <button
                          className="button small danger"
                          onClick={() => handleDelete(roast.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !error && roasts.length === 0 && token && (
          <p className="empty">No roasts found.</p>
        )}
      </main>
    </>
  );
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

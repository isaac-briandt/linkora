"use client";

import { FormEvent, useState } from "react";

export default function InviteUserForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The invitation could not be sent.");
      setMessage(result.message);
      setEmail("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The invitation could not be sent.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card mt-8 p-6">
      <h2 className="text-xl font-bold">Invite a seller</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        Send an invitation link. The recipient will choose their own password before accessing Connectora.
      </p>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="input flex-1"
          type="email"
          autoComplete="email"
          required
          placeholder="seller@example.com"
          aria-label="Seller email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button className="btn-primary shrink-0" disabled={loading}>
          {loading ? "Sending…" : "Send invitation"}
        </button>
      </form>
      {message && <p role="status" className="mt-3 text-sm text-emerald-700">{message}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}
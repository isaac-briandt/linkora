"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export default function SetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    window.location.assign("/dashboard");
  }

  return (
    <main className="min-h-screen grid place-items-center bg-[#f8f8f4] p-5">
      <div className="card w-full max-w-md p-8">
        <Link href="/" className="text-xl font-black text-ink-950">Connectora</Link>
        <p className="mt-8 text-sm font-bold uppercase tracking-wider text-coral-600">Invitation accepted</p>
        <h1 className="mt-2 text-3xl font-black">Choose your password</h1>
        <p className="mt-2 text-slate-600">Set a password to finish creating your Connectora account.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" className="input" type="password" minLength={8} autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="confirm-password">Confirm password</label>
            <input id="confirm-password" className="input" type="password" minLength={8} autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </div>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Saving…" : "Set password and continue"}
          </button>
        </form>
        <p className="mt-5 text-xs leading-5 text-slate-500">Use at least 8 characters.</p>
      </div>
    </main>
  );
}
"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await createClient().auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) setError(error.message);
    else setDone(true);
    setLoading(false);
  }
  if (done)
    return (
      <main className="min-h-screen grid place-items-center p-5">
        <div className="card max-w-md p-8 text-center">
          <h1 className="text-2xl font-black">Check your email</h1>
          <p className="mt-3 text-slate-600">
            Confirm your account, then log in to create your profile.
          </p>
          <Link href="/login" className="btn-primary mt-6">
            Go to login
          </Link>
        </div>
      </main>
    );
  return (
    <main className="min-h-screen grid place-items-center p-5">
      <div className="card w-full max-w-md p-8">
        <Link href="/" className="text-xl font-black">
          linkora
        </Link>
        <h1 className="mt-8 text-3xl font-black">Create your identity</h1>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input
              className="input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link className="font-semibold text-coral-600" href="/login">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

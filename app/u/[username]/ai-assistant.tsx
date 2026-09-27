"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
export default function AIAssistant({ username }: { username: string }) {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [loading, setLoading] = useState(false);
  async function ask() {
    if (!q.trim()) return;
    setLoading(true);
    setA("");
    const r = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "profile_assistant",
        username,
        question: q,
      }),
    });
    const d = await r.json();
    setA(r.ok ? d.answer : d.error || "Unable to answer right now.");
    setLoading(false);
  }
  return (
    <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-left">
      <div className="flex items-center gap-2 font-bold">
        <Sparkles size={17} className="text-coral-600" /> Ask Connectora AI
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Ask about this public profile.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ask();
          }}
          placeholder="What does this person do?"
        />
        <button
          onClick={ask}
          disabled={loading || !q.trim()}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? "…" : "Ask"}
        </button>
      </div>
      {a && (
        <div className="mt-4 rounded-xl bg-white p-4 text-sm leading-6 text-slate-700">
          {a}
        </div>
      )}
    </div>
  );
}

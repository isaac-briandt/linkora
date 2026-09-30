"use client";
import { createClient } from "@/lib/supabase/browser";

export default function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <button
      className={`btn-secondary gap-2 ${className}`}
      onClick={async () => {
        await createClient().auth.signOut();
        window.location.href = "/";
      }}
    >
      <LogOutIcon /> Log out
    </button>
  );
}
function LogOutIcon() {
  return <span aria-hidden>↪</span>;
}

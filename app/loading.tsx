export default function Loading() {
  return (
    <main
      className="grid min-h-screen place-items-center bg-slate-50 p-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 shadow-sm">
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-coral-200 border-t-coral-600"
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-slate-700">
          Loading…
        </span>
      </div>
    </main>
  );
}

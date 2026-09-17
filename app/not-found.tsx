import Link from "next/link";
export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center p-5 text-center">
      <div>
        <h1 className="text-6xl font-black">404</h1>
        <p className="mt-3 text-slate-600">
          That digital profile doesn't exist.
        </p>
        <Link className="btn-primary mt-6" href="/">
          Go home
        </Link>
      </div>
    </main>
  );
}

import Link from "next/link";

export default function Register() {
  return (
    <main className="min-h-screen grid place-items-center bg-[#f8f8f4] p-5">
      <div className="card w-full max-w-lg p-8 text-center">
        <Link href="/" className="text-xl font-black text-ink-950">
          Connectora
        </Link>
        <p className="mt-8 text-sm font-bold uppercase tracking-wider text-coral-600">
          Membership by request
        </p>
        <h1 className="mt-2 text-3xl font-black">Let’s get you connected.</h1>
        <p className="mt-3 leading-7 text-slate-600">
          Connectora accounts are currently created by invitation. Contact us
          for a digital card or to ask about becoming a digital card seller.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/contact" className="btn-primary">
            Contact Connectora
          </Link>
          <Link href="/login" className="btn-secondary">
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </main>
  );
}

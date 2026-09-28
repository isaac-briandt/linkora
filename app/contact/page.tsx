import Link from "next/link";
import { ArrowLeft, CreditCard, Store } from "lucide-react";

const contactEmail = "info@connectora.io";

function enquiryLink(subject: string, request: string) {
  const body = `Hello Connectora,\n\n${request}\n\nName:\nPhone (optional):\n`;
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function Contact() {
  return (
    <main className="min-h-screen bg-[#f8f8f4] py-12 sm:py-20">
      <div className="container-page max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-coral-700">
          <ArrowLeft size={16} /> Back to Connectora
        </Link>
        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-wider text-coral-600">Get started</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">How would you like to connect?</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Tell us what you need. We’ll help you get a digital card or discuss access to sell Connectora cards.
          </p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <section className="card p-6">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-coral-50 text-coral-700">
              <CreditCard size={23} />
            </div>
            <h2 className="mt-5 text-xl font-black">I want a digital card</h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
              Request a card for your personal or professional profile.
            </p>
            <a href={enquiryLink("Digital card request", "I’m interested in getting a Connectora digital card.")} className="btn-primary mt-5 inline-flex">
              Request a card
            </a>
          </section>
          <section className="card p-6">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-coral-50 text-coral-700">
              <Store size={23} />
            </div>
            <h2 className="mt-5 text-xl font-black">I want to sell cards</h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
              Ask about becoming a seller and getting a platform account.
            </p>
            <a href={enquiryLink("Card seller enquiry", "I’m interested in becoming a Connectora card seller and would like to learn about platform access.")} className="btn-secondary mt-5 inline-flex">
              Ask about selling
            </a>
          </section>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Your email app will open a pre-addressed message to{" "}
          <a className="font-semibold text-coral-700" href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </div>
    </main>
  );
}
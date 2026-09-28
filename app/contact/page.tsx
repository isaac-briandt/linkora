import Link from "next/link";
import { ArrowLeft, CreditCard, MessageCircle, Store } from "lucide-react";

const contactEmail = "info@connectora.io";
const whatsappNumber = "233505489884";

function enquiryLink(subject: string, request: string) {
  const body = `Hello Connectora,\n\n${request}\n\nName:\nPhone (optional):\n`;
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function Contact() {
  return (
    <main className="min-h-screen bg-[#f8f8f4] py-12 sm:py-20">
      <div className="container-page max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-coral-700"
        >
          <ArrowLeft size={16} /> Back to Connectora
        </Link>
        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-wider text-coral-600">
            Get started
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            How would you like to connect?
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Choose a digital card or a seller account. Reach out with your
            selection and we’ll help you get started.
          </p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <section className="card p-6">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-coral-50 text-coral-700">
              <CreditCard size={23} />
            </div>
            <h2 className="mt-5 text-xl font-black">Digital card</h2>
            <p className="mt-2 text-3xl font-black text-coral-700">$26</p>
            <p className="text-sm font-semibold text-slate-500">one-time</p>
            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
              Your digital card includes a dashboard to track engagement
              analytics.
            </p>
            <a
              href={enquiryLink(
                "Digital card request",
                "I’m interested in the $26 Connectora digital card, including its engagement analytics dashboard.",
              )}
              className="btn-primary mt-5 inline-flex"
            >
              Request a card
            </a>
          </section>
          <section className="card p-6">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-coral-50 text-coral-700">
              <Store size={23} />
            </div>
            <h2 className="mt-5 text-xl font-black">Seller account</h2>
            <p className="mt-2 text-3xl font-black text-coral-700">$35</p>
            <p className="text-sm font-semibold text-slate-500">per month</p>
            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
              Get platform account access to sell Connectora digital cards.
            </p>
            <a
              href={enquiryLink(
                "Seller account enquiry",
                "I’m interested in the Connectora seller account at $30 per month, to access the platform and sell digital cards.",
              )}
              className="btn-secondary mt-5 inline-flex"
            >
              Ask about a seller account
            </a>
          </section>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Your email app will open a pre-addressed message to{" "}
          <a
            className="font-semibold text-coral-700"
            href={`mailto:${contactEmail}`}
          >
            {contactEmail}
          </a>
          .
        </p>
        <div className="mt-5 text-center">
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <MessageCircle size={17} /> Chat with us on WhatsApp
          </a>
          <p className="mt-2 text-xs text-slate-500">+233 50 548 9884</p>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  Eye,
  LockKeyhole,
  Link2,
  Menu,
  QrCode,
  Sparkles,
  ShieldCheck,
  Users,
  Wifi,
} from "lucide-react";
import BrandMark from "@/components/brand-mark";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://connectora.io";

export const metadata: Metadata = {
  title: "Digital Business Cards, NFC & QR Profiles",
  description:
    "Create one digital business card for your profile, links and contact details. Share it in person or online with a Connectora URL, QR code or NFC card.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Digital Business Cards, NFC & QR Profiles | Connectora",
    description:
      "Bring your digital identity together in one shareable profile. Connectora digital business cards work with QR codes and NFC cards.",
    url: "/",
    images: [
      {
        url: "/brand/connectora%20hero%20img.png",
        width: 1774,
        height: 888,
        alt: "People sharing a Connectora digital business card",
      },
    ],
  },
  twitter: {
    title: "Digital Business Cards, NFC & QR Profiles | Connectora",
    description:
      "One shareable digital identity for people and teams, ready for a URL, QR code or NFC card.",
    images: ["/brand/connectora%20hero%20img.png"],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Connectora",
  url: siteUrl,
  logo: new URL("/brand/connectora-icon.png", siteUrl).toString(),
  email: "info@connectora.io",
  description:
    "Connectora brings digital profiles, links and contact details together in shareable digital business cards for people and teams.",
};

const profileLinks = [
  { label: "Book a conversation", note: "Calendly", accent: "bg-coral-500" },
  { label: "Latest work", note: "Portfolio", accent: "bg-ink-700" },
  { label: "Follow along", note: "Instagram", accent: "bg-sky-500" },
];

const features = [
  {
    icon: Link2,
    title: "One shareable profile",
    text: "Bring your links, contact details, social channels and best work into one page.",
  },
  {
    icon: Wifi,
    title: "NFC and QR cards",
    text: "Turn a tap or scan into a conversation, a follow, a booking or a profile view.",
  },
  {
    icon: BarChart3,
    title: "Useful analytics",
    text: "See what gets opened, when people connect and which links earn attention.",
  },
  {
    icon: Building2,
    title: "Built for teams",
    text: "Create profiles for your people, issue cards and keep every identity on brand.",
  },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#f8f8f4] text-ink-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <nav className="border-b border-ink-900/10 bg-[#f8f8f4]/90 backdrop-blur">
        <div className="container-page flex h-[76px] items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <BrandMark />
            <span className="text-xl font-black tracking-[-0.04em]">
              Connectora
            </span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-semibold text-ink-700 md:flex">
            <a href="#features" className="transition hover:text-coral-600">
              Analytics
            </a>
            <a href="#audiences" className="transition hover:text-coral-600">
              Who it’s for
            </a>
            <a href="#trust" className="transition hover:text-coral-600">
              Businesses
            </a>
            <a href="#how-it-works" className="transition hover:text-coral-600">
              How it works
            </a>
            <a href="#privacy" className="transition hover:text-coral-600">
              Privacy
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden px-3 py-2 text-sm font-bold text-ink-800 sm:inline-flex"
            >
              Log in
            </Link>
            <Link href="/contact" className="btn-primary px-4 py-2.5 text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative border-b border-ink-900/10">
        <div className="container-page grid min-h-[650px] gap-14 py-16 md:grid-cols-[1.02fr_.98fr] md:items-center md:py-24">
          <div className="relative z-10">
            <p className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-coral-600">
              <Sparkles size={16} /> Your digital front door
            </p>
            <h1 className="max-w-3xl font-serif text-6xl font-black leading-[.98] tracking-[-0.065em] text-ink-950 sm:text-7xl lg:text-[5.2rem]">
              <span className="block">One digital</span>
              <span className="block">business card.</span>
              <span className="block text-coral-600">Every connection.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-ink-700 sm:text-xl">
              Bring your profile, links and contact details together in one
              digital business card. Share it online or in person with a URL, QR
              code or NFC card.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/contact" className="btn-primary gap-2 px-5 py-3.5">
                Get a digital card <ArrowRight size={18} />
              </Link>
              <Link
                href="#audiences"
                className="btn-secondary gap-2 border-ink-900/20 bg-transparent px-5 py-3.5"
              >
                Explore who it’s for <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-ink-600">
              {["NFC and QR ready", "Made for people and teams"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check size={15} className="text-coral-600" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <ProfilePreview />
        </div>
        <div className="pointer-events-none absolute -right-28 top-20 h-72 w-72 rounded-full bg-coral-200/60 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-40 -translate-x-1/2 bg-coral-500" />
      </section>

      <section
        id="trust"
        className="border-b border-ink-900/10 bg-white py-16 sm:py-20"
      >
        <div className="container-page grid gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div className="relative aspect-[1.64/1] overflow-hidden rounded-[1.75rem] bg-ink-950 shadow-[0_24px_60px_rgba(11,31,51,.18)]">
            <Image
              src="/brand/business-cards-customers.png"
              alt="Connectora-branded business cards for DSTRKT24, alafeair, and MAD SKYZ Bar & Lounge"
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-coral-600">
              Made for the real world
            </p>
            <h2 className="mt-3 max-w-xl font-serif text-4xl font-black leading-tight tracking-[-0.04em] text-ink-950 sm:text-5xl">
              From personal brands to established businesses.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink-600">
              From personal brands to local businesses, Connectora helps turn
              introductions into lasting digital connections. Give your team
              one simple way to share who they are.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Businesses", icon: Building2 },
                { label: "Professionals", icon: Users },
                { label: "Entrepreneurs", icon: Wifi },
                { label: "Everyone", icon: QrCode },
              ].map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-ink-900/10 bg-[#f8f8f4] px-2 py-3 text-center"
                >
                  <Icon size={22} className="text-ink-950" />
                  <span className="text-xs font-bold text-ink-700">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="#teams"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-coral-600 transition hover:text-coral-700"
            >
              Explore team experiences <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-b border-ink-900/10 bg-ink-950 py-20 text-white sm:py-24"
      >
        <div className="container-page">
          <div className="grid gap-12 md:grid-cols-[.75fr_1.25fr] md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-coral-300">
                From profile to presence
              </p>
              <h2 className="mt-4 max-w-md font-serif text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
                How your digital business card works.
              </h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-white/65">
              Create your page once, then put it everywhere: in your bio, email
              signature, QR code, NFC card, event badge or storefront.
            </p>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
            <Step
              number="01"
              title="Build your page"
              text="Add your links, social profiles, contact details and a look that feels like you."
            />
            <Step
              number="02"
              title="Share one link"
              text="Use your Connectora URL anywhere, or connect it to an NFC card and QR code."
            />
            <Step
              number="03"
              title="Keep the connection"
              text="Let people save your contact, follow your work, book time or explore more."
            />
          </div>
          <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/20">
            <video
              className="aspect-video w-full"
              controls
              preload="metadata"
              playsInline
              aria-label="How Connectora unifies digital identity"
            >
              <source
                src="/brand/How_Connectora_Unifies_Digital_Identity.mp4"
                type="video/mp4"
              />
              Your browser does not support the video element.
            </video>
          </div>
        </div>
      </section>

      <section
        id="audiences"
        className="border-b border-ink-900/10 py-20 sm:py-24"
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-coral-600">
              One platform, two ways to connect
            </p>
            <h2 className="mt-3 font-serif text-4xl font-black leading-tight tracking-[-0.04em] text-ink-950 sm:text-5xl">
              Digital business cards for your next introduction and your whole
              team.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="card p-7 sm:p-9">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-coral-50 text-coral-700">
                <Users size={23} />
              </div>
              <p className="mt-6 text-sm font-bold uppercase tracking-wider text-coral-600">
                For individuals
              </p>
              <h3 className="mt-2 text-2xl font-black text-ink-950">
                Create a digital identity that travels with you.
              </h3>
              <p className="mt-3 leading-7 text-ink-600">
                Bring your professional profile, social links and contact
                details together, then share one URL, QR code or NFC card.
              </p>
              <ul className="mt-5 space-y-2 text-sm font-medium text-ink-700">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-coral-600" /> One profile for
                  your links and work
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-coral-600" /> Contact saves
                  and engagement analytics
                </li>
              </ul>
              <Link
                href="/contact"
                className="btn-primary mt-7 inline-flex items-center gap-2"
              >
                Get your digital card <ArrowRight size={17} />
              </Link>
            </article>
            <article className="card !bg-ink-950 p-7 text-white sm:p-9">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-coral-300">
                <Building2 size={23} />
              </div>
              <p className="mt-6 text-sm font-bold uppercase tracking-wider text-coral-300">
                For organizations
              </p>
              <h3 className="mt-2 text-2xl font-black">
                Manage identities and experiences at scale.
              </h3>
              <p className="mt-3 leading-7 text-white/70">
                Give teams and communities branded profiles, connected cards and
                practical tools for events, attendance and digital menus.
              </p>
              <ul className="mt-5 space-y-2 text-sm font-medium text-white/85">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-coral-300" /> Manage people
                  and issue connected cards
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-coral-300" /> Support events,
                  check-ins and menus
                </li>
              </ul>
              <Link
                href="/contact"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-ink-950 transition hover:bg-coral-50"
              >
                Talk about your team <ArrowRight size={17} />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="border-b border-ink-900/10 bg-[#f0eee8] py-20 sm:py-24"
      >
        <div className="container-page">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-coral-600">
                Beyond the business card
              </p>
              <h2 className="mt-3 max-w-2xl font-serif text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
                See what happens after the share.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-600">
                A paper card can’t show what people do next. Connectora
                analytics help you follow profile views, link clicks, contact
                saves and card taps.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-bold text-coral-600"
            >
              Ask about analytics <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-ink-900/10 bg-white p-5"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-coral-100 text-coral-700">
                  <Icon size={21} />
                </div>
                <h3 className="mt-5 text-lg font-black tracking-[-0.02em]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-ink-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="privacy"
        className="border-b border-ink-900/10 bg-white py-20 sm:py-24"
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-coral-50 text-coral-700">
              <ShieldCheck size={28} />
            </div>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-coral-600">
              Your information matters
            </p>
            <h2 className="mt-3 font-serif text-4xl font-black leading-tight tracking-[-0.04em] text-ink-950 sm:text-5xl">
              Share confidently. Stay in control.
            </h2>
            <p className="mt-5 text-lg leading-8 text-ink-600">
              Your digital card is made to be shared, but you choose what goes
              on it. We use sign-in controls and database access rules to help
              protect account and workspace tools.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-ink-900/10 bg-[#f8f8f4] p-6">
              <div className="flex items-center gap-3">
                <Eye className="shrink-0 text-coral-700" size={21} />
                <h3 className="font-black text-ink-950">
                  You choose what to share
                </h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-600">
                Public profile details can be seen by people who visit your
                profile. Only add information you’re comfortable sharing; keep
                passwords and sensitive personal data off your card.
              </p>
            </div>
            <div className="rounded-2xl border border-ink-900/10 bg-[#f8f8f4] p-6">
              <div className="flex items-center gap-3">
                <LockKeyhole className="shrink-0 text-coral-700" size={21} />
                <h3 className="font-black text-ink-950">
                  Workspace tools require sign-in
                </h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-600">
                Account and organization tools are for signed-in users, with
                database rules that limit who can manage workspace information.
              </p>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-ink-600">
            Have a privacy or security question?{" "}
            <Link
              href="/contact"
              className="font-bold text-coral-700 hover:underline"
            >
              Talk to us
            </Link>
            .
          </p>
        </div>
      </section>

      <section
        id="teams"
        className="border-b border-ink-900/10 bg-coral-500 py-20 text-white sm:py-24"
      >
        <div className="container-page grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">
              One platform. Multiple experiences.
            </p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
              More than profiles—built around real connections.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/80">
              Connect people with branded profiles and cards, support event
              check-ins and attendance, publish digital menus, and understand
              engagement—all from one workspace.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 py-3.5 font-bold text-white transition hover:bg-ink-800"
          >
            Talk to us about teams <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="bg-[#f8f8f4] py-8">
        <div className="container-page flex flex-col gap-5 text-sm text-ink-600">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-black text-ink-950"
            >
              <BrandMark /> Connectora
            </Link>
            <p>One identity. Every connection.</p>
            <div className="flex gap-4 font-semibold">
              <Link href="/login">Log in</Link>
              <Link href="/contact">Contact us</Link>
            </div>
          </div>
          <div className="flex flex-col sm:gap-4 border-t border-ink-900/10 pt-4 sm:flex-row sm:items-center justify-center">
            <p>© 2026 Connectora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ProfilePreview() {
  return (
    <div className="relative mx-auto w-full max-w-[560px] pb-[300px] md:mr-0">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-ink-900/10 bg-white p-2 shadow-[0_28px_70px_rgba(11,31,51,.18)] sm:rounded-[2rem] sm:p-3">
        <Image
          src="/brand/connectora%20hero%20img.png"
          alt="People sharing a Connectora digital business card at a networking event"
          width={1774}
          height={888}
          priority
          sizes="(max-width: 768px) 100vw, 560px"
          className="aspect-[1.8/1] w-full rounded-[1.25rem] object-cover sm:rounded-[1.5rem]"
        />
        <div className="absolute bottom-5 left-5 rounded-xl bg-ink-950/90 px-3 py-2 text-xs font-bold text-white shadow-lg backdrop-blur">
          <Wifi size={14} className="mr-2 inline text-coral-300" /> Tap to
          connect
        </div>
      </div>
      <div className="absolute bottom-0 right-1 z-10 w-[min(82%,340px)] rounded-[1.75rem] border border-ink-900/10 bg-white p-2.5 shadow-[0_28px_70px_rgba(11,31,51,.24)] sm:right-4 sm:p-3">
        <div className="overflow-hidden rounded-[1.25rem] bg-[#f0e5dc]">
          <div className="h-16 bg-[linear-gradient(120deg,#f3a58e,#f9d8c8_48%,#cad9d0)]" />
          <div className="relative px-4 pb-4 text-center">
            <div className="mx-auto -mt-8 grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-ink-950 text-xl font-serif font-black text-white">
              A
            </div>
            <p className="mt-2 text-lg font-black tracking-[-0.03em]">
              Amina Osei
            </p>
            <p className="mt-0.5 text-xs text-ink-600">
              Product designer · Accra
            </p>
            <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-ink-600">
              Designing thoughtful digital products and sharing what I learn.
            </p>
            <div className="mt-3 space-y-1.5">
              {profileLinks.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-xs font-bold shadow-sm"
                >
                  <span>{item.label}</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-ink-500">
                    <i className={`h-1.5 w-1.5 rounded-full ${item.accent}`} />
                    {item.note}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-center gap-4 text-ink-500">
              <QrCode size={15} />
              <Users size={15} />
              <Menu size={15} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-ink-950 p-7">
      <p className="text-sm font-bold text-coral-300">{number}</p>
      <h3 className="mt-12 text-xl font-black">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
    </div>
  );
}

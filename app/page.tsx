import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  ExternalLink,
  Link2,
  Menu,
  QrCode,
  Sparkles,
  Users,
  Wifi,
} from "lucide-react";
import BrandMark from "@/components/brand-mark";

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
              Features
            </a>
            <a href="#teams" className="transition hover:text-coral-600">
              For teams
            </a>
            <a href="#how-it-works" className="transition hover:text-coral-600">
              How it works
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden px-3 py-2 text-sm font-bold text-ink-800 sm:inline-flex"
            >
              Log in
            </Link>
            <Link href="/register" className="btn-primary px-4 py-2.5 text-sm">
              Create your Connectora
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
            <h1 className="max-w-3xl font-serif text-6xl font-black leading-[.94] tracking-[-0.065em] text-ink-950 sm:text-7xl lg:text-[6.8rem]">
              Everything you are,{" "}
              <span className="text-coral-600">in one place.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-ink-700 sm:text-xl">
              Connectora gives you one beautiful, shareable profile for your
              links, contact details, work and real-world connections.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn-primary gap-2 px-5 py-3.5">
                Start for free <ArrowRight size={18} />
              </Link>
              <Link
                href="/people"
                className="btn-secondary gap-2 border-ink-900/20 bg-transparent px-5 py-3.5"
              >
                See the experience <ExternalLink size={16} />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-ink-600">
              {[
                "No design skills needed",
                "NFC and QR ready",
                "Made for people and teams",
              ].map((item) => (
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
                Share less. Connect more.
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
        </div>
      </section>

      <section
        id="features"
        className="border-b border-ink-900/10 py-20 sm:py-24"
      >
        <div className="container-page">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-coral-600">
                A better link in bio
              </p>
              <h2 className="mt-3 max-w-2xl font-serif text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
                The simple front door for your digital life.
              </h2>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-bold text-coral-600"
            >
              Explore Connectora <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title}>
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
        id="teams"
        className="border-b border-ink-900/10 bg-coral-500 py-20 text-white sm:py-24"
      >
        <div className="container-page grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">
              For organizations
            </p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
              Give every person a profile worth sharing.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/80">
              Manage people, cards, events, attendance and digital menus from
              one calm workspace.
            </p>
          </div>
          <Link
            href="/organizations/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 py-3.5 font-bold text-white transition hover:bg-ink-800"
          >
            Build a team workspace <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="bg-[#f8f8f4] py-8">
        <div className="container-page flex flex-col gap-4 text-sm text-ink-600 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-black text-ink-950"
          >
            <BrandMark /> Connectora
          </Link>
          <p>One identity. Every connection.</p>
          <div className="flex gap-4 font-semibold">
            <Link href="/login">Log in</Link>
            <Link href="/register">Get started</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ProfilePreview() {
  return (
    <div className="relative mx-auto w-full max-w-[430px] md:mr-2">
      <div className="absolute -left-8 top-20 hidden -rotate-6 rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-xs font-bold text-ink-700 shadow-xl sm:block">
        Tap to connect <Wifi size={14} className="ml-2 inline text-coral-600" />
      </div>
      <div className="relative rounded-[2rem] border border-ink-900/10 bg-white p-3 shadow-[0_28px_70px_rgba(11,31,51,.16)]">
        <div className="overflow-hidden rounded-[1.5rem] bg-[#f0e5dc]">
          <div className="h-28 bg-[linear-gradient(120deg,#f3a58e,#f9d8c8_48%,#cad9d0)]" />
          <div className="relative px-6 pb-7 text-center">
            <div className="mx-auto -mt-10 grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-ink-950 text-2xl font-serif font-black text-white">
              A
            </div>
            <p className="mt-3 text-xl font-black tracking-[-0.03em]">
              Amina Osei
            </p>
            <p className="mt-1 text-sm text-ink-600">
              Product designer · Accra
            </p>
            <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-ink-600">
              Designing thoughtful digital products and sharing what I learn
              along the way.
            </p>
            <div className="mt-5 space-y-2.5">
              {profileLinks.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-left text-sm font-bold shadow-sm"
                >
                  <span>{item.label}</span>
                  <span className="flex items-center gap-2 text-xs font-medium text-ink-500">
                    <i className={`h-2 w-2 rounded-full ${item.accent}`} />
                    {item.note}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-center gap-4 text-ink-500">
              <QrCode size={17} />
              <Users size={17} />
              <Menu size={17} />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -right-5 hidden rounded-xl bg-ink-950 px-4 py-3 text-xs font-bold text-white shadow-xl sm:block">
        <BarChart3 size={14} className="mr-2 inline text-coral-300" /> 1,248
        profile views
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

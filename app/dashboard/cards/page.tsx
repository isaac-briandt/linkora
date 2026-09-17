import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import CardsClient from "@/app/experiences/cards/cards-client";

export default function CardsPage() {
  return <main className="min-h-screen py-10"><div className="container-page"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-coral-600"><ArrowLeft size={15} /> Dashboard</Link><div className="mt-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-coral-50 p-3 text-coral-700"><CreditCard /></div><div><p className="text-sm font-bold text-coral-600">CARDS</p><h1 className="text-3xl font-black">NFC & QR cards</h1></div></div><p className="mt-2 text-slate-500">Register physical cards, share their QR codes, and change each card’s destination whenever you need to.</p></div><CardsClient /></div></main>;
}

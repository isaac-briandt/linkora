import "./globals.css";
import type { Metadata } from "next";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_APP_URL || "https://connectora.io",
);

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Digital Business Cards, NFC & QR Identity | Connectora",
    template: "%s | Connectora",
  },
  description:
    "Create a digital business card that brings your profile, links and contact details together. Share it anywhere with one URL, QR code or NFC card.",
  applicationName: "Connectora",
  openGraph: {
    type: "website",
    siteName: "Connectora",
    locale: "en",
    title: "Digital Business Cards, NFC & QR Identity | Connectora",
    description:
      "One shareable digital identity for people and teams. Bring profiles, links and contact details together with NFC and QR sharing.",
    images: [
      {
        url: "/brand/connectora%20hero%20img.png",
        width: 1774,
        height: 888,
        alt: "Connectora digital identity and NFC card sharing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Business Cards, NFC & QR Identity | Connectora",
    description:
      "One shareable digital identity for people and teams, ready to share with a URL, QR code or NFC card.",
    images: ["/brand/connectora%20hero%20img.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/brand/connectora-icon.png", type: "image/png" },
    ],
    shortcut: ["/icon.svg"],
    apple: [
      {
        url: "/brand/connectora-icon.png",
        type: "image/png",
        sizes: "1254x1254",
      },
    ],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

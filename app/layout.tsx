import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Connectora — Digital identity, NFC & engagement",
  description:
    "Connectora connects people, organizations and physical spaces through digital identity, NFC, QR and smart experiences.",
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

import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata={title:"Linkora — Digital identity, NFC & engagement",description:"Linkora connects people, organizations and physical spaces through digital identity, NFC, QR and smart experiences."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

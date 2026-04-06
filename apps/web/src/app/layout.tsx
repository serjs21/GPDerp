import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_JP } from "next/font/google"; 
import "./globals.css";
import "@/axios.setup";
import { LayoutProvider } from "./providers/LayoutProviders";
import { AuthenticationProvider } from "./providers/AuthenticationProvider";
import { QueryProvider } from "./providers/QueryProvider";
import { HtmlLoader } from "@/components/Loaders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",  subsets: ["latin"],
});

// Traditional Japanese Serif Font
const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["300", "500", "700"],
});

export const metadata: Metadata = {
  title: "GPDerp",
  description: "AI, but useless",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID;
  
  return (
    <html lang="en">
      <body className={`${notoSerifJP.variable} ${geistSans.variable} ${geistMono.variable} sumie-layout`}>
        <HtmlLoader />
        <AuthenticationProvider>
          <QueryProvider>
            <LayoutProvider googleClientId={googleClientId}>{children}</LayoutProvider>
          </QueryProvider>
        </AuthenticationProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import localFont from "next/font/local";
import {
  Bangers,
  Geist,
  Geist_Mono,
  Noto_Serif_JP,
  Patrick_Hand,
  Press_Start_2P,
  Zen_Kurenaido,
} from "next/font/google";
import "@/theme/globals.css";
import "magic.css/dist/magic.min.css";
import "@/theme/themes/tokyo-dusk.css";
import "@/theme/themes/sumie.css";
import "@/theme/themes/night-sky.css";
import "@/theme/antd-overrides.css";
import "@/axios.setup";
import { LayoutProvider } from "./providers/LayoutProviders";
import { AuthenticationProvider } from "./providers/AuthenticationProvider";
import { QueryProvider } from "./providers/QueryProvider";
import { HtmlLoader } from "@/components/Loaders";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { CelestialThemeProvider } from "./providers/CelestialThemeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { getSsrThemeSettings } from "@/hooks/useTheme.server";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";

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

// Handwritten brush script for lantern haiku text
const zenKurenaido = Zen_Kurenaido({
  variable: "--font-zen-kurenaido",
  subsets: ["latin"],
  weight: "400",
});

// Marker-style handwriting for the postcard message side
const patrickHand = Patrick_Hand({
  variable: "--font-postcard-hand",
  subsets: ["latin"],
  weight: "400",
});

const pressStart2P = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Comic-style font for burst labels
const bangers = Bangers({
  variable: "--font-comic-label",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/** Street graffiti display (Flacucho — Gonzalo Gallardo, free for commercial use). */
const flacucho = localFont({
  src: "../fonts/flacucho/Flacucho-Regular.otf",
  variable: "--font-flacucho",
  display: "swap",
  weight: "400",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RootLayout");
  return {
    title: "GPDerp!",
    description: t("description"),
    manifest: "/site.webmanifest",
    icons: {
      icon: [
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: "/icons/apple-touch-icon.png",
    },
    themeColor: "#bc002d",
    appleWebApp: {
      capable: true,
      title: "GPDerp",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { initialTheme, initialLocale, initialCelestialSlot } = await getSsrThemeSettings();
  const messages = await getMessages({ locale: initialLocale });
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID;
  
  return (
    <html lang={initialLocale} data-theme={initialTheme} className={`${notoSerifJP.variable} ${zenKurenaido.variable} ${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} ${bangers.variable} ${flacucho.variable} ${patrickHand.variable}`}>
      <body>
        <AntdRegistry>
          <HtmlLoader />
          <NextIntlClientProvider locale={initialLocale} messages={messages}>
            <ThemeProvider initialTheme={initialTheme}>
              <AuthenticationProvider>
                <CelestialThemeProvider initialSlot={initialCelestialSlot}>
                  <QueryProvider>
                    <LayoutProvider googleClientId={googleClientId}>
                      {children}
                    </LayoutProvider>
                  </QueryProvider>
                </CelestialThemeProvider>
              </AuthenticationProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
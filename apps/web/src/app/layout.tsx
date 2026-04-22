import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_JP } from "next/font/google"; 
import "./globals.css";
import "./themes/tokyo-dusk.css";
import "./themes/sumie.css";
import "./themes/night-sky.css";
import "./antd-overrides.css";
import "@/axios.setup";
import { LayoutProvider } from "./providers/LayoutProviders";
import { AuthenticationProvider } from "./providers/AuthenticationProvider";
import { QueryProvider } from "./providers/QueryProvider";
import { HtmlLoader } from "@/components/Loaders";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { getSsrThemeSettings } from "@/hooks/useTheme.server";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { initialTheme, initialLocale } = await getSsrThemeSettings();
  const messages = await getMessages({ locale: initialLocale });
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID;
  
  return (
    <html lang={initialLocale} data-theme={initialTheme}>
      <body className={`${notoSerifJP.variable} ${geistSans.variable} ${geistMono.variable}`}>
        <AntdRegistry>
          <HtmlLoader />
          <NextIntlClientProvider locale={initialLocale} messages={messages}>
            <ThemeProvider initialTheme={initialTheme}>
              <AuthenticationProvider>
                <QueryProvider>
                  <LayoutProvider googleClientId={googleClientId}>{children}</LayoutProvider>
                </QueryProvider>
              </AuthenticationProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
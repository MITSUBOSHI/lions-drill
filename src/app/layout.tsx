import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Oswald, Saira } from "next/font/google";
import Provider from "./provider";
import AppBreadcrumb from "@/components/common/Breadcrumb";
import { TEAM } from "@/config/team";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: "700",
  display: "swap",
  variable: "--font-oswald",
});

// 0 がドット無しのブロック体（背番号向け、チームにより使用）
const saira = Saira({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
  variable: "--font-saira",
});

const basePath = process.env.CAPACITOR === "true" ? "" : TEAM.basePath;
// metadataBase はオリジンのみにする。basePath は Next が自動付与するため、
// siteUrl(basePath 込み)をそのまま渡すと OG 画像 URL で basePath が二重になる。
const siteOrigin = new URL(TEAM.siteUrl).origin;

// OG/Twitter 画像は app/opengraph-image.png のファイル規約に委譲する。
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: TEAM.name,
    template: `%s | ${TEAM.name}`,
  },
  description: TEAM.siteDescription,
  icons: "/favicon.ico",
  keywords: [...TEAM.keywords],
  openGraph: {
    type: "website",
    siteName: TEAM.name,
    locale: "ja_JP",
    title: TEAM.name,
    description: TEAM.siteDescription,
  },
  twitter: {
    card: "summary",
    title: TEAM.name,
    description: TEAM.siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${oswald.variable} ${saira.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta
          name="google-site-verification"
          content={TEAM.analytics.googleSiteVerification}
        />
        <link rel="manifest" href={`${basePath}/manifest.json`} />
        <link
          rel="apple-touch-icon"
          href={`${basePath}/icons/apple-touch-icon.png`}
        />
        <meta name="theme-color" content={TEAM.colors.themeColor} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: TEAM.name,
              url: TEAM.siteUrl,
              description: TEAM.siteDescription,
            }),
          }}
        />
      </head>
      <GoogleAnalytics gaId={TEAM.analytics.gaId} />
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('${basePath}/sw.js');
                });
              }
            `,
          }}
        />
        <Provider>
          <AppBreadcrumb />
          {children}
          <footer className="py-4 px-6 text-center flex flex-col items-center gap-1">
            <p className="text-xs text-[var(--text-secondary)]">
              {TEAM.disclaimer}
            </p>
            <a
              href="https://buymeacoffee.com/MITSUBOSHI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--text-secondary)] hover:underline"
            >
              ☕ 開発者を応援する
            </a>
          </footer>
        </Provider>
      </body>
    </html>
  );
}

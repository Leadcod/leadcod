import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo, Nunito, Poppins, Montserrat } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Leadcod",
  description: "Leadcod is a platform for creating and managing forms",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <head>
        <meta
          name="shopify-api-key"
          content={process.env.NEXT_PUBLIC_SHOPIFY_API_KEY}
        />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" />
        <script src="https://cdn.shopify.com/shopifycloud/polaris.js" />
      </head>
      <NextIntlClientProvider>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} ${nunito.variable} ${poppins.variable} ${montserrat.variable} antialiased`}
      >
        <s-app-nav>
          <s-link href="/form-builder">Form Builder</s-link>
        </s-app-nav>
        {children}
      </body>
      </NextIntlClientProvider> 
    </html>
  );
}

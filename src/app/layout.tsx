import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/ui/ServiceWorkerRegistration";
import { Onboarding } from "@/components/ui/Onboarding";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BitFlow - Aprende a Programar",
  description:
    "Plataforma educativa gamificada para aprender programación. Desarrolla habilidades con retos interactivos, XP y rachas diarias.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BitFlow",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "BitFlow",
    title: "BitFlow - Aprende a Programar",
    description:
      "Plataforma educativa gamificada para aprender programación.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <AuthProvider>
          <ServiceWorkerRegistration />
          <Onboarding />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
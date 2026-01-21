import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/providers/QueryProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Elite Brokerage - Professional Real Estate & Business Brokering",
  description: "Your trusted partner in real estate and business brokering services.",
};

export default async function RootLayout({
  children, params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Await params if you are on a version of Next.js that requires it
  const { locale } = await params;
  const messages = await getMessages();

  return (
    // Added suppressHydrationWarning here
    <html lang={locale} suppressHydrationWarning>
      <head />
      {/* Added suppressHydrationWarning to body as well */}
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              {/* Ensure this component is NOT 'async' if it uses hooks */}
              <Navbar />
              <main className="flex-1">
                <QueryProvider>{children}</QueryProvider>
              </main>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
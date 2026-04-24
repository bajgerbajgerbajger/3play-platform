import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "3Play - Stream Movies & TV Series",
  description: "Experience 3Play: Stream your favorite movies and TV series. Unlimited entertainment, anytime, anywhere.",
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`dark ${sans.variable}`} suppressHydrationWarning>
      <body className="bg-zinc-950 text-zinc-100" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#18181b',
                border: '1px solid #27272a',
                color: '#fafafa',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

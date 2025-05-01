import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { LenisProvider } from "@/components/lenis-provider";
import ModeToggle from "@/components/mode-toggle";
import ClientLayout from "@/components/client-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LOL Marketplace",
  description: "Mua bán tài khoản Liên Minh Huyền Thoại uy tín, an toàn",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen flex flex-col scrollbar-none`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <LenisProvider>
              <ClientLayout>{children}</ClientLayout>
            </LenisProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

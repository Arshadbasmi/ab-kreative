import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AB Kreative — Lead Generation Platform",
  description:
    "Income-generating leads across design, fitout, finance, logistics, and UAE approvals. Worldwide coverage.",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "AB Kreative — Lead Generation Platform",
    description:
      "Income-generating leads across design, fitout, finance, logistics, and UAE approvals. Worldwide coverage.",
    siteName: "AB Kreative",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AB Kreative — Lead Generation Platform",
    description:
      "Income-generating leads across design, fitout, finance, logistics, and UAE approvals.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
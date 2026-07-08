import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

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
        className="antialiased bg-background text-foreground"
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

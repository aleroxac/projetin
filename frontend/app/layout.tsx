import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { Toaster } from "sonner";
import RouteShell from "@/components/RouteShell";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "ProjetIn",
  description: "Personal fitness dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body className="font-sans">
        <RouteShell>{children}</RouteShell>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--bg3)",
              border: "0.5px solid var(--border2)",
              color: "var(--text2)",
              fontSize: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}

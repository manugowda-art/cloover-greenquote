import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cloover - GreenQuote",
  description: "Solar financing pre-qualification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen">
        <div className="mx-auto max-w-5xl px-6 py-10">
          {children}
        </div>
      </body>
    </html>
  );
}
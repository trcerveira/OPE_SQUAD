import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

// Fonte principal OPB_CREW
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "OPB Crew — One Person Business",
  description: "AI Operating System para Solopreneurs. Sem terminal. Só resultados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt">
        <body className={`${spaceGrotesk.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

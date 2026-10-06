import type { Metadata } from "next";
import { Chakra_Petch, IBM_Plex_Sans_Condensed, Lexend_Deca } from "next/font/google";
import FloatingCS from "@/components/FloatingCS";
import "./globals.css";

const ibmPlexSansCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans-condensed",
});

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lexend-deca",
});

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-chakra-petch",
});

export const metadata: Metadata = {
  title: "KAKAA.JOKI | Platform Jasa Joki Game",
  description: "Jasa joki game cepat, aman, dan profesional.",
  icons: {
    icon: [
      {
        url: "/home/logoicon.png",
        sizes: "256x256",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/home/logoicon.png",
        sizes: "256x256",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${ibmPlexSansCondensed.variable} ${lexendDeca.variable} ${chakraPetch.variable}`}>
        {children}
        <FloatingCS />
      </body>
    </html>
  );
}
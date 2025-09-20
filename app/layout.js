import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import "./globals.css";

import AiAssistant from "@/components/ai-chatbot/AiAssistant";
import CurrentReservationPopup from "@/components/reservation/CurrentReservationPopup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cycle Chain",
  description: "Find & ride e-bikes. Shop accessories.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-background to-surface`}
      >
        <Providers>
          <Navbar />
          <CurrentReservationPopup />
          {children}
          <AiAssistant />
        </Providers>
      </body>
    </html>
  );
}

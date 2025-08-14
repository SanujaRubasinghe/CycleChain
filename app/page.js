// app/layout.js
"use client";

import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isOwnerPath = pathname.startsWith("/owner");

  return (
    <html lang="en">
      <body>
        {!isOwnerPath && <Navbar />}
        {children}
        <Hero/>
      </body>
    </html>
  );
}

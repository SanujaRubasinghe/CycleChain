// app/layout.js
"use client";

import Hero from "@/components/Hero";
import { usePathname } from "next/navigation";

export default function Home() {
  const pathname = usePathname();
  const isOwnerPath = pathname.startsWith("/owner");

  return (
    <div>
      <Hero/>
    </div>
  );
}

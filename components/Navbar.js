"use client";

import { assets } from "@/public/assets/assets";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const menuLinks = [
  { name: "Home", path: "/" },
  { name: "Cars", path: "/cars" },
  { name: "My Bookings", path: "/my-bookings" },
];

function Navbar({ setShowLogin }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isHome = pathname === "/";

  return (
    <div
      className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 
      text-gray-600 border-b border-borderColor relative transition-all 
      ${isHome ? "bg-light" : ""}`}
    >
      {/* Logo */}
      <Link href="/">
        <Image src={assets.logo1} alt="logo" className="h-8 w-auto" />
      </Link>

      {/* Menu Links */}
      <div
        className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16
        max-sm:border-t border-borderColor right-0 flex flex-col sm:flex-row
        items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 transition-all
        duration-300 z-50 ${isHome ? "bg-light" : "bg-white"} 
        ${open ? "max-sm:translate-x-0" : "max-sm:translate-x-full"}`}
      >
        {menuLinks.map((link, index) => (
          <Link key={index} href={link.path}>
            {link.name}
          </Link>
        ))}

        {/* Search Bar */}
        <div
          className="hidden lg:flex items-center text-sm gap-2 border
          border-borderColor rounded-full px-3 max-w-56"
        >
          <input
            type="text"
            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
            placeholder="Search Products"
          />
          <Image src={assets.search_icon} alt="search" />
        </div>

        {/* Action Buttons */}
        <div className="flex max-sm:flex-col items-start sm:items-center gap-6">
          <button
            onClick={() => router.push("/owner")}
            className="cursor-pointer"
          >
            Dashboard
          </button>
          <button
            onClick={() => setShowLogin(true)}
            className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg"
          >
            Login
          </button>
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="sm:hidden cursor-pointer"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Image
          src={open ? assets.close_icon : assets.menu_icon}
          alt="menu"
        />
      </button>
    </div>
  );
}

export default Navbar;

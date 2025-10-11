"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession(); // get session

  return (
    <nav className="w-full py-4 px-6 flex justify-between items-center bg-white backdrop-blur-sm z-50 relative">
      {/* Logo */}
      <Link href="/" className="text-xl font-bold text-green-600 flex items-center">
        CycleChain
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        <div className="flex space-x-6">
          <Link href="/" className="text-gray-600 hover:text-green-600 transition">Home</Link>
          <Link href="/bikes" className="text-gray-600 hover:text-green-600 transition">Bikes</Link>
          <Link href="/about" className="text-gray-600 hover:text-green-600 transition">About</Link>
          <Link href="/feedback" className="text-gray-600 hover:text-green-600 transition">Feedback</Link>
          <Link href="/store" className="text-gray-600 hover:text-green-600 transition">Store</Link>
          <Link href="/nft-store" className="text-gray-600 hover:text-green-600 transition">NFT Store</Link>
        </div>
        
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        
        <div className="flex space-x-4 items-center">
          {session ? (
            // User is logged in
            <>
              <Link href="/profile">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                  {session.user.name || "Profile"}
                </button>
              </Link>
              <Link href="/my-nfts" className="px-4 py-2 text-gray-600 hover:text-green-600 transition font-medium">
                My NFTs
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 text-gray-600 hover:text-green-600 transition font-medium"
              >
                Log out
              </button>
            </>
          ) : (
            // User not logged in
            <>
              <Link href="/login">
                <button className="px-4 py-2 text-gray-600 hover:text-green-600 transition font-medium">
                  Log in
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                  Sign up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu button */}
      <button 
        className="md:hidden flex flex-col space-y-1.5 z-50"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`w-6 h-0.5 bg-gray-800 transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`w-6 h-0.5 bg-gray-800 transition-opacity ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
        <span className={`w-6 h-0.5 bg-gray-800 transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
      </button>

      {/* Mobile Navigation */}
      <div className={`md:hidden fixed top-0 left-0 w-full h-screen bg-white z-40 flex flex-col items-center justify-center space-y-8 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <Link href="/" className="text-xl text-gray-800 hover:text-green-600 transition" onClick={() => setIsMenuOpen(false)}>Home</Link>
        <Link href="/bikes" className="text-xl text-gray-800 hover:text-green-600 transition" onClick={() => setIsMenuOpen(false)}>Bikes</Link>
        <Link href="/about" className="text-xl text-gray-800 hover:text-green-600 transition" onClick={() => setIsMenuOpen(false)}>About</Link>
        <Link href="/feedback" className="text-xl text-gray-800 hover:text-green-600 transition" onClick={() => setIsMenuOpen(false)}>Feedback</Link>
        <Link href="/store" className="text-xl text-gray-800 hover:text-green-600 transition" onClick={() => setIsMenuOpen(false)}>Store</Link>
        <Link href="/nft-store" className="text-xl text-gray-800 hover:text-green-600 transition" onClick={() => setIsMenuOpen(false)}>NFT Store</Link>
        
        <div className="w-px h-8 bg-gray-300 my-4"></div>
        
        <div className="flex flex-col space-y-4 items-center">
          {session ? (
            <>
              <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-lg">
                  {session.user.name || "Profile"}
                </button>
              </Link>
              <Link href="/my-nfts" onClick={() => setIsMenuOpen(false)} className="px-6 py-3 text-gray-800 hover:text-green-600 transition font-medium text-lg">
                My NFTs
              </Link>
              <button
                onClick={() => { setIsMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                className="px-6 py-3 text-gray-800 hover:text-green-600 transition font-medium text-lg"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <button className="px-6 py-3 text-gray-800 hover:text-green-600 transition font-medium text-lg">
                  Log in
                </button>
              </Link>
              <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-lg">
                  Sign up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

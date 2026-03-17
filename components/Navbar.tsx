'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md fixed w-full z-10 top-0">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold hover:text-purple-300 transition">
          NFT Marketplace
        </Link>

        {/* Links */}
        <ul className="flex gap-6 items-center">
          <li><Link href="/" className="hover:text-purple-300 transition">Home</Link></li>
          <li><Link href="/ranking" className="hover:text-purple-300 transition">Ranking</Link></li>
          <li><Link href="/search" className="hover:text-purple-300 transition">Search</Link></li>
          <li><Link href="/profile" className="hover:text-purple-300 transition">Profile</Link></li>
          <li><Link href="/more" className="hover:text-purple-300 transition">More</Link></li>
        </ul>
      </div>
    </nav>
  );
}
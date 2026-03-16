'use client';

import Navbar from "@/components/Navbar";
import WalletConnect from "@/components/WalletConnect";
import ProductCard from '@/components/ProductCard';

export default function Home() {
  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white py-24 px-6 text-center overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight">
            NFT Marketplace
          </h1>

          <p className="text-xl md:text-3xl font-medium mb-8 text-purple-200">
            Discover, Collect & Own Phygital Masterpieces
          </p>

          <p className="text-lg mb-10 text-gray-300 max-w-3xl mx-auto">
            Connect your wallet, explore exclusive drops, request orders, and experience the future of digital-physical hybrid collectibles.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => {
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-10 py-5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xl shadow-xl transform hover:scale-105 transition"
            >
              Explore Collection
            </button>
            <div className="inline-block">
              <WalletConnect />
            </div>
          </div>
        </div>
      </section>

      {/* Optional blue banner - remove if you want */}
      <main className="p-10 bg-blue-500 text-white text-2xl text-center">
        Web3 Capstone Template Working
      </main>

      {/* Product Gallery */}
      <div id="products" className="container mx-auto p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">Our Collection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <ProductCard 
            name="Vintage Sneakers" 
            price={89.99} 
            image="https://images.unsplash.com/photo-1542291026-7eec264c27ff" 
          />
          <ProductCard 
            name="Classic Watch" 
            price={149.50} 
            image="https://images.unsplash.com/photo-1524592094714-0f25c5025c32" 
          />
          <ProductCard 
            name="Leather Jacket" 
            price={199.99} 
            image="https://images.unsplash.com/photo-1551028719-00167b16eac5" 
          />
          <ProductCard 
            name="Wireless Headphones" 
            price={79.99} 
            image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e" 
          />
          <ProductCard 
            name="Designer Sunglasses" 
            price={129.99} 
            image="https://images.unsplash.com/photo-1511499767150-a48a237f0083" 
          />
          <ProductCard 
            name="Running Shoes" 
            price={109.99} 
            image="https://images.unsplash.com/photo-1542291026-7eec264c27ff" 
          />
        </div>
      </div>
    </>
  );
}
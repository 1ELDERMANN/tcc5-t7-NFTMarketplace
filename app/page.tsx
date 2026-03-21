'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import WalletConnect from "@/components/WalletConnect";
import ProductCard from '@/components/ProductCard';
import { ethers } from 'ethers';

// Marketplace contract address - Checksum fix included
const MARKETPLACE_ADDR = '0x3D7B9023E15693d14F5F5386F0CE466e56D25559'.toLowerCase();

// Marketplace ABI
const marketplaceABI = [
  {"type":"constructor","inputs":[{"name":"_productNFT","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"compareListings","inputs":[{"name":"tokenId","type":"uint256"}],"outputs":[{"name":"activeListings","type":"tuple[]","components":[{"name":"listingId","type":"uint256"},{"name":"tokenId","type":"uint256"},{"name":"seller","type":"address"},{"name":"price","type":"uint256"},{"name":"quantity","type":"uint256"},{"name":"active","type":"bool"}]}],"stateMutability":"view"},
  {"type":"function","name":"deactivateListing","inputs":[{"name":"listingId","type":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"getAllActiveListings","inputs":[],"outputs":[{"type":"tuple[]","components":[{"name":"listingId","type":"uint256"},{"name":"tokenId","type":"uint256"},{"name":"seller","type":"address"},{"name":"price","type":"uint256"},{"name":"quantity","type":"uint256"},{"name":"active","type":"bool"}]}],"stateMutability":"view"},
  {"type":"function","name":"getListing","inputs":[{"name":"listingId","type":"uint256"}],"outputs":[{"type":"tuple","components":[{"name":"listingId","type":"uint256"},{"name":"tokenId","type":"uint256"},{"name":"seller","type":"address"},{"name":"price","type":"uint256"},{"name":"quantity","type":"uint256"},{"name":"active","type":"bool"}]}],"stateMutability":"view"},
  {"type":"function","name":"listProduct","inputs":[{"name":"tokenId","type":"uint256"},{"name":"price","type":"uint256"},{"name":"quantity","type":"uint256"}],"outputs":[{"type":"uint256"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"owner","inputs":[],"outputs":[{"type":"address"}],"stateMutability":"view"},
  {"type":"function","name":"paused","inputs":[],"outputs":[{"type":"bool"}],"stateMutability":"view"},
  {"type":"function","name":"totalListings","inputs":[],"outputs":[{"type":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"withdrawFees","inputs":[],"outputs":[],"stateMutability":"nonpayable"} ] as const;

type RawListing = {
  listingId: bigint;
  tokenId: bigint;
  seller: string;
  price: bigint;
  quantity: bigint;
  active: boolean;
};

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const rpcEndpoints = [
        'https://ethereum-sepolia-rpc.publicnode.com',
        'https://1rpc.io/sepolia',
        'https://rpc.ankr.com/eth_sepolia'
      ];

      for (const url of rpcEndpoints) {
        try {
          console.log(`Attempting connection to: ${url}`);
          const provider = new ethers.JsonRpcProvider(url);
          
          // 1. SAFETY CHECK: Verify if code actually exists at this address
          const code = await provider.getCode(MARKETPLACE_ADDR);
          if (code === '0x' || code === '0x0') {
            console.error("No contract code found at this address. You might be on the wrong network (e.g., calling Sepolia address on Mainnet).");
            setError("Contract not found at this address. Please verify your deployment.");
            setLoading(false);
            return; 
          }

          const marketplace = new ethers.Contract(MARKETPLACE_ADDR, marketplaceABI, provider);

          // 2. Fetch data
          const activeListings = await marketplace.getAllActiveListings();

          const formatted = activeListings.map((listing: RawListing, index: number) => ({
            id: index,
            name: `Product #${listing.tokenId.toString()}`,
            price: Number(ethers.formatEther(listing.price)),
            image: 'https://picsum.photos/200' 
          }));

          setProducts(formatted);
          setError(null);
          setLoading(false);
          return; // Exit loop on success
        } catch (err: any) {
          console.warn(`Provider ${url} failed to fetch data:`, err.message);
          // Continue to next RPC in list
        }
      }
      
      setError('Could not fetch products. Contract might be empty or network is unreachable.');
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Navbar />

      <section className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white py-24 px-6 text-center overflow-hidden">
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
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
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

      <main className="p-10 bg-blue-500 text-white text-2xl text-center">
        Web3 Capstone Template Working
      </main>

      <div id="products" className="container mx-auto p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">Our Collection</h2>

        {loading ? (
          <p className="text-center text-xl text-gray-400">Loading real products from blockchain...</p>
        ) : error ? (
          <div className="text-center">
             <p className="text-xl text-red-500 mb-2">{error}</p>
             <p className="text-sm text-gray-500">Check browser console (F12) for technical details.</p>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-xl text-gray-400">No active products listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
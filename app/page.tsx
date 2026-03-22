'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import WalletConnect from "@/components/WalletConnect";
import ProductCard from '@/components/ProductCard';
import { ethers } from 'ethers';

// --- UPDATED ADDRESSES FROM THE TEAM LEADER'S JSON ---
const PRODUCT_NFT_ADDR = '0x390Ced1a254F953F4FCA40AB6c8cD335b873898'.toLowerCase();
const MARKETPLACE_ADDR = '0x3D7B9023E15693D14F5F5386F0CE466E56D25559'.toLowerCase();

const marketplaceABI = [
  {
    "name": "getAllProducts", // Updated name
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{
      "components": [
        {"name": "tokenId", "type": "uint256"},
        {"name": "seller", "type": "address"},
        {"name": "price", "type": "uint256"},
        {"name": "quantity", "type": "uint256"},
        {"name": "active", "type": "bool"}
      ],
      "type": "tuple[]"
    }]
  }
] as const;

const productNFTABI = [
  {
    "name": "getProductDetails", // Updated name
    "type": "function",
    "inputs": [{"name": "tokenId", "type": "uint256"}], // Check if it's _tokenId or tokenId
    "outputs": [
      {"name": "name", "type": "string"},
      {"name": "category", "type": "string"},
      {"name": "tokenURI", "type": "string"}
    ],
    "stateMutability": "view"
  }
] as const;

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMarket = async () => {
    try {
      setLoading(true);
      // Fallback to a public RPC so data shows even if MetaMask isn't connected
      const provider = window.ethereum 
        ? new ethers.BrowserProvider(window.ethereum) 
        : new ethers.JsonRpcProvider("https://rpc.ankr.com/eth_sepolia");
        
      // --- CHECK: Ensure Contract Exists ---
      const code = await provider.getCode(MARKETPLACE_ADDR);
      if (code === "0x") {
        console.error("No contract found at MARKETPLACE_ADDR. Check your Network!");
        setLoading(false);
        return;
      }

      const market = new ethers.Contract(MARKETPLACE_ADDR, marketplaceABI, provider);
      const nft = new ethers.Contract(PRODUCT_NFT_ADDR, productNFTABI, provider);

      // Call the updated function name
      const allListings = await market.getAllProducts();

      const detailedProducts = await Promise.all(allListings.map(async (item: any) => {
        // Skip inactive items
        if (!item.active) return null;

        try {
           const meta = await nft.getProductDetails(item.tokenId);
           return {
             id: item.tokenId.toString(),
             name: meta.name,
             price: ethers.formatEther(item.price),
             image: meta.tokenURI || `https://picsum.photos/seed/${item.tokenId}/400/300`
           };
        } catch (e) {
           console.error(`Error fetching meta for token ${item.tokenId}`, e);
           return null;
        }
      }));

      setProducts(detailedProducts.filter(p => p !== null));
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMarket(); }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-blue-500/30">
      <Navbar />
      
      {/* HERO SECTION INTACT */}
      <section className="relative py-32 px-6 text-center bg-black border-b border-gray-900 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-7xl md:text-[9rem] font-black mb-8 tracking-tighter uppercase italic leading-none">
            The <span className="text-blue-500">Market</span>
          </h1>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <WalletConnect />
            <button onClick={fetchMarket} className="px-8 py-4 border border-gray-800 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              Refresh Data
            </button>
          </div>
        </div>
      </section>

      <main className="container mx-auto py-24 px-6">
        {loading ? (
          <div className="text-center py-20 animate-pulse text-blue-500 font-mono text-[10px] uppercase tracking-[0.5em]">Syncing Marketplace...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-40 bg-gray-900/10 rounded-[60px] border border-dashed border-gray-800">
            <p className="text-gray-600 text-2xl italic">Marketplace is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {products.map((p) => (
              <ProductCard key={p.id} name={p.name} price={p.price} image={p.image} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
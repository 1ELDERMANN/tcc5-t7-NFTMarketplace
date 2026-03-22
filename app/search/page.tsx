'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ProductCard from '@/components/ProductCard'; 

// Marketplace contract address - FIXED: Added .toLowerCase()
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
  {"type":"function","name":"withdrawFees","inputs":[],"outputs":[],"stateMutability":"nonpayable"} 
] as const;

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      // List of RPCs to try in case one fails
      const rpcEndpoints = [
        'https://sepolia.infura.io/v3/bc6d6342457a42818161eb4554c27826',
        'https://ethereum-sepolia-rpc.publicnode.com',
        'https://1rpc.io/sepolia'
      ];

      for (const url of rpcEndpoints) {
        try {
          const provider = new ethers.JsonRpcProvider(url);
          
          // Check if contract exists at this address
          const code = await provider.getCode(MARKETPLACE_ADDR);
          if (code === '0x' || code === '0x0') continue; // Try next RPC

          const marketplace = new ethers.Contract(MARKETPLACE_ADDR, marketplaceABI, provider);
          const activeListings = await marketplace.getAllActiveListings();

          const formatted = activeListings.map((listing: any, index: number) => ({
            id: index,
            name: `Product #${listing.tokenId.toString()}`,
            price: Number(ethers.formatEther(listing.price)),
            image: 'https://picsum.photos/200', 
            tokenId: listing.tokenId.toString(),
            quantity: listing.quantity.toString(),
          }));

          setProducts(formatted);
          setFilteredProducts(formatted);
          setError(null);
          setLoading(false);
          return; // Success! Exit the loop.
        } catch (err: any) {
          console.warn(`RPC ${url} failed, trying next...`);
        }
      }

      setError('Contract not found or network error. Verify address and network.');
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Filter logic
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(term) ||
      product.tokenId.toLowerCase().includes(term)
    );

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-12">Search Products</h1>

      <div className="max-w-xl mx-auto mb-12">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or token ID..."
          className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-lg"
        />
      </div>

      {loading ? (
        <p className="text-center text-xl text-gray-400">Loading real products from blockchain...</p>
      ) : error ? (
        <div className="text-center">
            <p className="text-xl text-red-500 mb-2">{error}</p>
            <p className="text-sm text-gray-500 italic">Address: {MARKETPLACE_ADDR}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center text-xl text-gray-400">
          {searchTerm ? 'No matching products found' : 'No active products listed yet'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
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
  );
}
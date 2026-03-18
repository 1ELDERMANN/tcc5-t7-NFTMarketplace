'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';

const dummyProducts = [
  { name: 'Vintage Sneakers', price: 89.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' },
  { name: 'Classic Watch', price: 149.50, image: 'https://images.unsplash.com/photo-1524592094714-0f25c5025c32' },
  { name: 'Leather Jacket', price: 199.99, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5' },
  { name: 'Wireless Headphones', price: 79.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' },
  { name: 'Designer Sunglasses', price: 129.99, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083' },
  { name: 'Running Shoes', price: 109.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' },
];

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = dummyProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Search Products</h1>
      <input 
        type="text" 
        placeholder="Type product name (e.g. sneakers, watch)..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full max-w-md mx-auto block p-3 mb-8 bg-gray-800 rounded border border-gray-600 focus:border-purple-500 focus:outline-none text-white"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {filteredProducts.map(product => (
          <ProductCard key={product.name} name={product.name} price={product.price} image={product.image} />
        ))}
        {filteredProducts.length === 0 && <p className="text-center text-gray-400 col-span-full">No products found.</p>}
      </div>
    </div>
  );
}
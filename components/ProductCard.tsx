'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

type Product = {
  name: string;
  price: number;
  image: string;
};

export default function ProductCard({ name, price, image }: Product) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [receipt, setReceipt] = useState('');

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleConfirmOrder = () => {
    const fakeHash = '0x' + Math.random().toString(36).substring(2, 15) + '...';

    setReceipt(`
      Receipt
      ──────────────────────────────
      Product: ${name}
      Quantity: ${quantity}
      Price: $${price.toFixed(2)}
      Note: ${note || 'No note provided'}
      Receipt Hash: ${fakeHash}
      Verified on Chain ✅
      Thank you for your purchase!
    `);

    setTimeout(() => setReceipt(''), 8000);
    closeModal();
  };

  return (
    <>
      {/* Receipt Toast */}
      {receipt && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white text-black p-6 rounded-2xl shadow-2xl border border-gray-400 font-mono text-sm w-96 z-50">
          <div className="text-center font-bold text-xl mb-3 tracking-widest text-green-600">
            RECEIPT
          </div>
          <div className="whitespace-pre-line leading-relaxed border-t border-b border-gray-300 py-3 text-xs">
            {receipt}
          </div>
          <div className="text-center text-[10px] text-gray-500 mt-3">
            NFT Marketplace • Thank You!
          </div>
        </div>
      )}

      {/* Card with hover effects */}
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
        <div className="overflow-hidden">
          <Image
            src={image}
            alt={name}
            width={400}
            height={300}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">{name}</h3>
          <p className="text-green-400 font-bold mt-1">${price.toFixed(2)}</p>
          <button 
            onClick={openModal}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition-colors"
          >
            Request Order
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div 
            className="bg-gray-800 p-6 rounded-lg shadow-2xl max-w-md w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-white mb-4">Request Order: {name}</h2>

            <div className="mb-4">
              <p className="text-green-400 font-bold mb-1">Price: ${price.toFixed(2)}</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-1">Quantity</label>
              <input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-1">Note / Special Instructions</label>
              <textarea 
                value={note} 
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 h-20 resize-none"
                placeholder="Any special requests..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmOrder}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
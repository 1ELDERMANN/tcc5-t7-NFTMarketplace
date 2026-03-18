'use client';

import { useState } from 'react';
import { ethers } from 'ethers';

export default function AdminUpload() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Connecting wallet...');

    if (!window.ethereum) {
      setMessage('MetaMask not found! Install it to continue.');
      setLoading(false);
      return;
    }

    try {
      // Connect MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      // Leader's Marketplace contract address (from contractAddresses.json)
      const marketplaceAddress = '0x3D7B9023E15693d14F5F5386F0CE466e56D25559';

      // PASTE THE FULL ABI ARRAY HERE
      // 1. Open /contracts/src/abis/Marketplace.json
      // 2. Copy the entire array (from [ to ])
      // 3. Paste it below (replace the [] completely)
      const marketplaceABI = [
  {"type":"constructor","inputs":[{"name":"_productNFT","type":"address","internalType":"address"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"compareListings","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"activeListings","type":"tuple[]","internalType":"struct Marketplace.Listing[]","components":[{"name":"listingId","type":"uint256","internalType":"uint256"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"seller","type":"address","internalType":"address payable"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"quantity","type":"uint256","internalType":"uint256"},{"name":"active","type":"bool","internalType":"bool"}]}],"stateMutability":"view"},
  {"type":"function","name":"deactivateListing","inputs":[{"name":"listingId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"disputeOrder","inputs":[{"name":"orderId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"getAllActiveListings","inputs":[],"outputs":[{"name":"","type":"tuple[]","internalType":"struct Marketplace.Listing[]","components":[{"name":"listingId","type":"uint256","internalType":"uint256"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"seller","type":"address","internalType":"address payable"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"quantity","type":"uint256","internalType":"uint256"},{"name":"active","type":"bool","internalType":"bool"}]}],"stateMutability":"view"},
  {"type":"function","name":"getBuyerOrders","inputs":[{"name":"buyer","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"tuple[]","internalType":"struct Marketplace.Order[]","components":[{"name":"orderId","type":"uint256","internalType":"uint256"},{"name":"listingId","type":"uint256","internalType":"uint256"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"buyer","type":"address","internalType":"address"},{"name":"seller","type":"address","internalType":"address"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"quantity","type":"uint256","internalType":"uint256"},{"name":"timestamp","type":"uint256","internalType":"uint256"},{"name":"receiptHash","type":"bytes32","internalType":"bytes32"},{"name":"receiptURI","type":"string","internalType":"string"},{"name":"status","type":"uint8","internalType":"enum Marketplace.OrderStatus"}]}],"stateMutability":"view"},
  {"type":"function","name":"getListing","inputs":[{"name":"listingId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"tuple","internalType":"struct Marketplace.Listing","components":[{"name":"listingId","type":"uint256","internalType":"uint256"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"seller","type":"address","internalType":"address payable"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"quantity","type":"uint256","internalType":"uint256"},{"name":"active","type":"bool","internalType":"bool"}]}],"stateMutability":"view"},
  {"type":"function","name":"getOrder","inputs":[{"name":"orderId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"tuple","internalType":"struct Marketplace.Order","components":[{"name":"orderId","type":"uint256","internalType":"uint256"},{"name":"listingId","type":"uint256","internalType":"uint256"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"buyer","type":"address","internalType":"address"},{"name":"seller","type":"address","internalType":"address"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"quantity","type":"uint256","internalType":"uint256"},{"name":"timestamp","type":"uint256","internalType":"uint256"},{"name":"receiptHash","type":"bytes32","internalType":"bytes32"},{"name":"receiptURI","type":"string","internalType":"string"},{"name":"status","type":"uint8","internalType":"enum Marketplace.OrderStatus"}]}],"stateMutability":"view"},
  {"type":"function","name":"getReceiptURI","inputs":[{"name":"orderId","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"string","internalType":"string"}],"stateMutability":"view"},
  {"type":"function","name":"getSellerListings","inputs":[{"name":"seller","type":"address","internalType":"address"}],"outputs":[{"name":"","type":"tuple[]","internalType":"struct Marketplace.Listing[]","components":[{"name":"listingId","type":"uint256","internalType":"uint256"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"seller","type":"address","internalType":"address payable"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"quantity","type":"uint256","internalType":"uint256"},{"name":"active","type":"bool","internalType":"bool"}]}],"stateMutability":"view"},
  {"type":"function","name":"listProduct","inputs":[{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"quantity","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"nonpayable"},
  {"type":"function","name":"listings","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"listingId","type":"uint256","internalType":"uint256"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"seller","type":"address","internalType":"address payable"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"quantity","type":"uint256","internalType":"uint256"},{"name":"active","type":"bool","internalType":"bool"}],"stateMutability":"view"},
  {"type":"function","name":"orders","inputs":[{"name":"","type":"uint256","internalType":"uint256"}],"outputs":[{"name":"orderId","type":"uint256","internalType":"uint256"},{"name":"listingId","type":"uint256","internalType":"uint256"},{"name":"tokenId","type":"uint256","internalType":"uint256"},{"name":"buyer","type":"address","internalType":"address"},{"name":"seller","type":"address","internalType":"address"},{"name":"price","type":"uint256","internalType":"uint256"},{"name":"quantity","type":"uint256","internalType":"uint256"},{"name":"timestamp","type":"uint256","internalType":"uint256"},{"name":"receiptHash","type":"bytes32","internalType":"bytes32"},{"name":"receiptURI","type":"string","internalType":"string"},{"name":"status","type":"uint8","internalType":"enum Marketplace.OrderStatus"}],"stateMutability":"view"},
  {"type":"function","name":"owner","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},
  {"type":"function","name":"paused","inputs":[],"outputs":[{"name":"","type":"bool","internalType":"bool"}],"stateMutability":"view"},
  {"type":"function","name":"placeOrder","inputs":[{"name":"listingId","type":"uint256","internalType":"uint256"},{"name":"quantity","type":"uint256","internalType":"uint256"},{"name":"receiptHash","type":"bytes32","internalType":"bytes32"},{"name":"receiptURI","type":"string","internalType":"string"}],"outputs":[],"stateMutability":"payable"},
  {"type":"function","name":"platformFee","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"productNFT","inputs":[],"outputs":[{"name":"","type":"address","internalType":"contract ProductNFT"}],"stateMutability":"view"},
  {"type":"function","name":"receiptHashToOrder","inputs":[{"name":"","type":"bytes32","internalType":"bytes32"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"refundOrder","inputs":[{"name":"orderId","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"renounceOwnership","inputs":[],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"setPaused","inputs":[{"name":"_paused","type":"bool","internalType":"bool"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"setPlatformFee","inputs":[{"name":"newFee","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"totalListings","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"totalOrders","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"transferOwnership","inputs":[{"name":"newOwner","type":"address","internalType":"address"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"updateListing","inputs":[{"name":"listingId","type":"uint256","internalType":"uint256"},{"name":"newPrice","type":"uint256","internalType":"uint256"},{"name":"newQuantity","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"verifyReceipt","inputs":[{"name":"receiptHash","type":"bytes32","internalType":"bytes32"}],"outputs":[{"name":"valid","type":"bool","internalType":"bool"},{"name":"orderId","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},
  {"type":"function","name":"withdrawFees","inputs":[],"outputs":[],"stateMutability":"nonpayable"}
] as const; // 'as const' helps TypeScript

      const marketplace = new ethers.Contract(marketplaceAddress, marketplaceABI, signer);

      // REAL CONTRACT CALL — replace 'listProduct' with the actual function name from the ABI
      // Open Marketplace.json → search for "name": "..." that takes 3 parameters (string name, uint256 price, string image)
      // Common names: listProduct, mintAndList, createListing, requestOrder, addItem
      // Example (change the function name and parameters to match):
      // const tx = await marketplace.listProduct(name, ethers.parseEther(price), image);
      // await tx.wait();

      // For now — placeholder (uncomment when you know the real function)
      // const tx = await marketplace.listProduct(name, ethers.parseEther(price), image);
      // await tx.wait();

      setMessage('Wallet connected! Ready for real upload (uncomment the tx line when ready)');
      console.log('Wallet connected. Ready to call contract with:', { name, price, image });

      setName('');
      setPrice('');
      setImage('');
    } catch (err: any) {
      setMessage('Error: ' + (err.message || 'Something went wrong'));
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Admin - Upload New Product</h1>

      <form onSubmit={handleUpload} className="max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-xl">
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            placeholder="e.g. EmizyNFT #001"
            required
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Price (ETH)</label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            placeholder="e.g. 0.05"
            required
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 mb-1">Image URL / IPFS</label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            placeholder="e.g. ipfs://Qm... or https://..."
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-3 rounded font-medium transition ${
            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Connecting...' : 'Upload Product'}
        </button>
      </form>

      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white p-4 rounded shadow-lg text-center font-medium z-50">
          {message}
        </div>
      )}
    </div>
  );
}
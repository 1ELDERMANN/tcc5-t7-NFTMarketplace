'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Marketplace contract address - FIXED: Added .toLowerCase() to bypass checksum validation
const MARKETPLACE_ADDR = '0x3D7B9023E15693d14F5F5386F0CE466e56D25559'.toLowerCase();
console.log('Current address being used:', MARKETPLACE_ADDR);

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

export default function Admin() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [tokenId, setTokenId] = useState('1');      
  const [quantity, setQuantity] = useState('1');    
  const [message, setMessage] = useState('');
  const [account, setAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        setSigner(signer);
        setMessage('Wallet connected! Ready for real upload');
      } catch (err: any) {
        setMessage('Failed to connect wallet: ' + err.message);
      }
    } else {
      setMessage('MetaMask not detected. Please install it.');
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      connectWallet();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signer) {
      setMessage('Wallet not connected');
      return;
    }

    try {
      setMessage('Preparing transaction...');

      // FIXED: Removed the extra JsonRpcProvider. 
      // When writing to the blockchain (listing a product), we use the signer directly.
      const marketplace = new ethers.Contract(
        MARKETPLACE_ADDR,
        marketplaceABI,
        signer
      );

      setMessage('Waiting for MetaMask signature...');

      // Convert values to BigInt correctly for Ethers v6
      const tx = await marketplace.listProduct(
        BigInt(tokenId),                    
        ethers.parseEther(price),   
        BigInt(quantity)                    
      );

      setMessage('Transaction sent! Waiting for confirmation...');
      await tx.wait();

      setMessage(`Success! Product listed. Tx hash: ${tx.hash}`);
    } catch (err: any) {
      console.error('Tx error:', err);
      // Enhanced error reporting
      const errorMsg = err.reason || err.message || 'Unknown error';
      setMessage('Failed: ' + errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-12">Admin - Upload Product</h1>

      {!account ? (
        <div className="text-center">
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-medium"
          >
            Connect MetaMask
          </button>
        </div>
      ) : (
        <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-xl shadow-lg">
          <p className="text-green-400 text-center mb-6">
            Wallet connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>

          {message && (
            <div className={`text-center mb-6 p-4 rounded text-sm break-words ${message.includes('Success') ? 'bg-green-900' : 'bg-blue-900/50 border border-blue-500'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Product Name (Display only)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. EmizyNFT #001"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Token ID</label>
                <input
                  type="number"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Price (ETH)</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.05"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Image URL (Display only)</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-transform hover:scale-[1.02]"
            >
              Upload Product
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
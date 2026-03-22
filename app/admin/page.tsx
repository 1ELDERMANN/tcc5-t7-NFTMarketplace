'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import Navbar from "@/components/Navbar";

// --- CONTRACT CONSTANTS ---
const PRODUCT_NFT_ADDR = "0x390Ced1a254F953F4FCA40AB6c8cD335b873898";
const MARKETPLACE_ADDR = "0x3D7B9023E15693D14F5F5386F0CE466e56D25559";

const productNFTABI = [
  {"type":"function","name":"mintProduct","inputs":[{"name":"name","type":"string"},{"name":"category","type":"string"},{"name":"tokenURI","type":"string"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"setApprovalForAll","inputs":[{"name":"operator","type":"address"},{"name":"approved","type":"bool"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"approveSeller","inputs":[{"name":"seller","type":"address"}],"outputs":[],"stateMutability":"nonpayable"},
  {"type":"function","name":"owner","inputs":[],"outputs":[{"type":"address"}],"stateMutability":"view"},
  {"type":"function","name":"approvedSellers","inputs":[{"name":"","type":"address"}],"outputs":[{"type":"bool"}],"stateMutability":"view"}
] as const;

const marketplaceABI = [
  {"type":"function","name":"listProduct","inputs":[{"name":"tokenId","type":"uint256"},{"name":"price","type":"uint256"},{"name":"quantity","type":"uint256"}],"outputs":[{"type":"uint256"}],"stateMutability":"nonpayable"}
] as const;

export default function Admin() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [price, setPrice] = useState('0.01');
  const [quantity, setQuantity] = useState('1');
  const [targetSeller, setTargetSeller] = useState('');
  const [message, setMessage] = useState('');
  const [signer, setSigner] = useState<any>(null);
  const [account, setAccount] = useState('');

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const s = await provider.getSigner();
        const addr = await s.getAddress();
        setSigner(s);
        setAccount(addr);
        setTargetSeller(addr);
        setMessage(`Connected: ${addr.slice(0,6)}...`);
      } catch (err: any) {
        setMessage("Connection failed.");
      }
    } else {
      setMessage("Install MetaMask");
    }
  };

  const handleApproveSeller = async () => {
    if (!signer) return setMessage("Connect wallet first!");
    try {
      setMessage("Verifying Owner...");
      const productNFT = new ethers.Contract(PRODUCT_NFT_ADDR, productNFTABI, signer);
      const ownerAddress = await productNFT.owner();
      
      if (account.toLowerCase() !== ownerAddress.toLowerCase()) {
        throw new Error("Only the Contract Owner can approve sellers.");
      }

      const tx = await productNFT.approveSeller(targetSeller);
      setMessage("Transaction pending...");
      await tx.wait();
      setMessage("✅ Seller Approved Successfully!");
    } catch (err: any) {
      setMessage("ERROR: " + (err.reason || err.message));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) return setMessage('Connect Wallet First');

    try {
      const productNFT = new ethers.Contract(PRODUCT_NFT_ADDR, productNFTABI, signer);
      const marketplace = new ethers.Contract(MARKETPLACE_ADDR, marketplaceABI, signer);

      setMessage('Checking Authorization...');
      const isApproved = await productNFT.approvedSellers(account);
      const ownerAddress = await productNFT.owner();
      
      if (account.toLowerCase() !== ownerAddress.toLowerCase() && !isApproved) {
        throw new Error("Not Authorized to mint.");
      }

      setMessage('Step 1/3: Minting NFT...');
      const mintTx = await productNFT.mintProduct(name, category, imageURL);
      const mintReceipt = await mintTx.wait();
      
      const eventLog = mintReceipt.logs.find((log: any) => log.topics.length >= 2);
      const tokenIdHex = eventLog.topics[1]; 
      const displayId = BigInt(tokenIdHex).toString();
      
      setMessage(`Step 2/3: Approving Marketplace for ID #${displayId}...`);
      const approveTx = await productNFT.setApprovalForAll(MARKETPLACE_ADDR, true);
      await approveTx.wait();

      setMessage(`Step 3/3: Listing ID #${displayId} for ${price} ETH...`);
      const listTx = await marketplace.listProduct(BigInt(tokenIdHex), ethers.parseEther(price), BigInt(quantity));
      await listTx.wait();

      setMessage(`🔥 SUCCESS! Product #${displayId} is now live.`);
      setName(''); setCategory(''); setImageURL('');
    } catch (err: any) {
      setMessage('ERROR: ' + (err.reason || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-full max-w-md bg-black border border-gray-800 p-8 rounded-[40px] shadow-2xl">
          <h1 className="text-3xl font-black mb-8 text-center text-blue-500 uppercase italic">Admin Panel</h1>
          
          {message && (
            <div className={`mb-6 p-4 rounded-2xl text-[10px] font-mono border ${message.includes('ERROR') ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-blue-500/10 border-blue-500 text-blue-400'} break-all`}>
              {message}
            </div>
          )}

          {!account ? (
            <button onClick={connectWallet} className="w-full mb-6 bg-blue-600 py-4 rounded-2xl font-bold uppercase hover:bg-blue-700 transition-all">Connect Wallet</button>
          ) : (
            <div className="mb-8 p-4 bg-gray-900 rounded-2xl border border-gray-800">
               <p className="text-[10px] uppercase text-gray-500 font-bold mb-2">Owner Action: Grant Seller Access</p>
               <div className="flex gap-2">
                 <input className="flex-1 p-2 bg-black rounded-lg border border-gray-800 text-[10px] font-mono outline-none" placeholder="Address" value={targetSeller} onChange={e => setTargetSeller(e.target.value)} />
                 <button onClick={handleApproveSeller} className="bg-blue-600 px-4 rounded-lg text-[10px] font-bold uppercase hover:bg-blue-700 transition-all">Grant</button>
               </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="w-full p-4 bg-gray-900 rounded-2xl border border-gray-800 outline-none focus:border-blue-500" placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} required />
            <input className="w-full p-4 bg-gray-900 rounded-2xl border border-gray-800 outline-none focus:border-blue-500" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} required />
            <input className="w-full p-4 bg-gray-900 rounded-2xl border border-gray-800 outline-none focus:border-blue-500" placeholder="Image URL" value={imageURL} onChange={e => setImageURL(e.target.value)} required />
            <div className="flex gap-4">
               <input className="flex-[2] p-4 bg-gray-900 rounded-2xl border border-gray-800 text-blue-400 font-bold outline-none" value={price} onChange={e => setPrice(e.target.value)} required />
               <input className="flex-1 p-4 bg-gray-900 rounded-2xl border border-gray-800 text-center outline-none" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required />
            </div>
            <button type="submit" disabled={!account} className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-3xl font-black text-lg mt-4 transition-all uppercase tracking-widest disabled:opacity-50">Deploy Product</button>
          </form>
        </div>
      </div>
    </div>
  );
}
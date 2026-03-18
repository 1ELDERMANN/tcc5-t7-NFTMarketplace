import { ethers } from 'ethers';

// Your leader's contract addresses (from contractAddresses.json)
export const PRODUCT_NFT_ADDRESS = '0x390Ced1a254F953F4FCA40AB6c8cD335b873898';
export const MARKETPLACE_ADDRESS = '0x3D7B9023E15693d14F5F5386F0CE466e56D25559';

// Network (Sepolia testnet)
export const CHAIN_ID = 11155111;
export const RPC_URL = 'https://rpc.sepolia.org'; // free public RPC

// Get provider (read-only for now)
export const getProvider = () => {
  return new ethers.JsonRpcProvider(RPC_URL);
};

// Get contract instances (use in pages/components)
export const getProductNFT = (signerOrProvider?: ethers.Signer | ethers.Provider) => {
  const provider = signerOrProvider || getProvider();
  const abi = require('../contracts/src/abis/ProductNFT.json'); // adjust path if needed
  return new ethers.Contract(PRODUCT_NFT_ADDRESS, abi, provider);
};

export const getMarketplace = (signerOrProvider?: ethers.Signer | ethers.Provider) => {
  const provider = signerOrProvider || getProvider();
  const abi = require('../contracts/src/abis/Marketplace.json'); // adjust path if needed
  return new ethers.Contract(MARKETPLACE_ADDRESS, abi, provider);
};

// Helper to connect wallet (MetaMask)
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not found');
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

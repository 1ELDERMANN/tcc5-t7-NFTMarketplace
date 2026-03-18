"use client";

import { useState } from "react";
import { connectWallet } from "@/lib/web3";

export default function WalletConnect() {
  const [address, setAddress] = useState("");

  const handleConnect = async () => {
    const { address } = await connectWallet();
    setAddress(address);
  };

  const handleDisconnect = () => {
    setAddress("");
  };

  return (
    <>
      {address ? (
        <button
          onClick={handleDisconnect}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
        >
          Connected as {address}
        </button>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
      )}
    </>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export default function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState('');

  const disconnect = () => {
    setAccount(null);
    setError('');
    if (onDisconnect) onDisconnect();
  };

  const connect = async () => {
    // Cast window to any to avoid "ethereum does not exist" errors
    const { ethereum } = window as any;

    if (ethereum) {
      try {
        const provider = new ethers.BrowserProvider(ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setAccount(address);
        setError('');

        if (onConnect) onConnect(address);
      } catch (err: any) {
        setError(err.code === 4001 ? 'Connection rejected.' : 'Error connecting.');
      }
    } else {
      setError('Please install MetaMask.');
    }
  };

  useEffect(() => {
    const { ethereum } = window as any;

    if (ethereum) {
      // Check if already authorized
      ethereum.request({ method: 'eth_accounts' })
        .then((accounts: any) => {
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            if (onConnect) onConnect(accounts[0]);
          }
        });

      const handleAccountsChanged = (accounts: any) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnect();
        }
      };

      ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        // Use the same cast here to avoid the removeListener error
        (window as any).ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  return (
    <div className="flex flex-col items-center">
      {account ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 bg-gray-800 border border-green-500/40 px-4 py-2 rounded-full shadow-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 font-mono text-sm">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </div>
          
          <button
            onClick={disconnect}
            className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-red-400 transition-colors font-bold mt-1"
          >
            [ Disconnect ]
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all active:scale-95"
        >
          Connect Wallet
        </button>
      )}
      
      {error && <p className="text-red-400 text-[10px] mt-2 italic">{error}</p>}
    </div>
  );
}
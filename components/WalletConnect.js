"use client";
import { useState, useEffect } from "react";

export default function WalletConnect({ onWalletConnected, children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex
  const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

  useEffect(() => {
    // Set client-side flag
    setIsClient(true);
    
    // Only run on client-side
    if (typeof window !== 'undefined') {
      checkConnection();
      
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      }
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        setChainId(chainId);
        setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID);
        
        if (onWalletConnected) {
          onWalletConnected(accounts[0], chainId);
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAccount("");
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
      if (onWalletConnected) {
        onWalletConnected(accounts[0], chainId);
      }
    }
  };

  const handleChainChanged = (chainId) => {
    setChainId(chainId);
    setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID);
    window.location.reload(); // Recommended by MetaMask
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      setAccount(accounts[0]);
      setIsConnected(true);
      setChainId(chainId);
      setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID);
      
      if (onWalletConnected) {
        onWalletConnected(accounts[0], chainId);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToSepolia = async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Test Network',
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'SEP',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.infura.io/v3/', 'https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding Sepolia network:", addError);
        }
      }
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <p className="text-gray-600">Loading wallet connection...</p>
      </div>
    );
  }

  if (typeof window === 'undefined' || !window.ethereum) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-bold text-red-800 mb-2">⚠️ MetaMask Required</h3>
        <p className="text-red-700 mb-4">
          Please install MetaMask to interact with the blockchain features.
        </p>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Install MetaMask
        </a>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-bold text-blue-800 mb-2">🔗 Connect Your Wallet</h3>
        <p className="text-blue-700 mb-4">
          Connect your MetaMask wallet to mint NFTs and interact with the blockchain.
        </p>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isConnecting ? "Connecting..." : "Connect MetaMask"}
        </button>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-bold text-yellow-800 mb-2">🔄 Wrong Network</h3>
        <p className="text-yellow-700 mb-4">
          Please switch to Sepolia testnet to use this application.
        </p>
        <div className="flex gap-2">
          <button
            onClick={switchToSepolia}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          >
            Switch to Sepolia
          </button>
          <div className="text-sm text-yellow-600 flex items-center">
            Current: {parseInt(chainId, 16)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-green-800">✅ Wallet Connected</h3>
            <p className="text-green-700 text-sm">
              Account: {formatAddress(account)} | Network: Sepolia
            </p>
          </div>
          <div className="text-green-600">
            🟢 Ready to mint
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

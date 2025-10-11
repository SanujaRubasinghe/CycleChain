"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function NFTSection() {
  const [nfts, setNfts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNFTData();
  }, []);

  const fetchNFTData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/nfts?limit=6');
      if (response.ok) {
        const data = await response.json();
        setNfts(data.data.nfts);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching NFT data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your NFT collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* NFT Stats */}
      {stats && stats.totalNFTs > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">NFT Collection Overview</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-800 mb-1">{stats.totalNFTs}</div>
              <div className="text-blue-600 text-sm font-medium">Total NFTs</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-800 mb-1">
                {formatCurrency(stats.totalValue)}
              </div>
              <div className="text-green-600 text-sm font-medium">Total Value</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-800 mb-1">
                {formatCurrency(stats.averagePrice)}
              </div>
              <div className="text-purple-600 text-sm font-medium">Avg. Price</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-800 mb-1">
                {stats.bikeModels?.length || 0}
              </div>
              <div className="text-orange-600 text-sm font-medium">Models</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent NFTs */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Recent NFTs</h2>
          <Link 
            href="/my-nfts"
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            View All →
          </Link>
        </div>

        {nfts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">🏆</span>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No NFTs Yet</h3>
            <p className="text-gray-500 mb-6">Start building your collection today!</p>
            <Link 
              href="/nft-store"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Browse NFT Store
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.map((nft) => (
              <Link 
                key={nft.tokenId}
                href={`/nft-display/${nft.tokenId}`}
                className="block bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🚲</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{nft.bikeData.name}</h4>
                    <p className="text-sm text-gray-600">#{nft.tokenId}</p>
                    <p className="text-sm font-medium text-green-600">
                      {formatCurrency(nft.purchasePrice)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Minted: {formatDate(nft.mintedAt)}
                </div>
              </Link>
            ))}
          </div>
        )}

        {nfts.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <Link 
                href="/my-nfts"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                View Full Collection →
              </Link>
              <Link 
                href="/nft-store"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Buy More NFTs
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

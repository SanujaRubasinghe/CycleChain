"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DemoNFTViewer from "@/components/nft/DemoNFTViewer";
import { PriceDisplay, formatUSD } from "@/utils/currency";

export default function MyNFTsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [sortBy, setSortBy] = useState('mintedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const isLoggedIn = !!session;
  const user = session?.user;

  useEffect(() => {
   
    if (session) {
      fetchNFTs();
    }
  }, [session, currentPage, sortBy, sortOrder]);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/nfts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNfts(data.data.nfts);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏆 My NFT Collection
          </h1>
          <p className="text-xl text-gray-600">
            Your blockchain-verified e-bike ownership certificates
          </p>
        </div>

        {/* Stats */}
        {stats && stats.totalNFTs > 0 && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total NFTs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalNFTs}</p>
                </div>
                <div className="text-3xl">🏆</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Value</p>
                  <PriceDisplay usdAmount={stats.totalValue} className="text-left" showEth={false} />
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Average Price</p>
                  <PriceDisplay usdAmount={stats.averagePrice} className="text-left" showEth={false} />
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Models</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.bikeModels?.length || 0}</p>
                </div>
                <div className="text-3xl">🚲</div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        {nfts.length > 0 && (
          <div className="flex flex-wrap items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="mintedAt">Mint Date</option>
                <option value="purchasePrice">Price</option>
                <option value="bikeData.name">Bike Model</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
            <Link
              href="/nft-store"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buy More NFTs
            </Link>
          </div>
        )}

        {/* NFT Grid */}
        {nfts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-4xl">🏆</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No NFTs Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't minted any e-bike NFTs yet. Start building your collection today!
            </p>
            <div className="space-y-4">
              <Link
                href="/nft-store"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Browse E-Bikes
              </Link>
              <div>
                <Link
                  href="/demo"
                  className="inline-block text-blue-600 hover:text-blue-700 font-medium"
                >
                  Try Demo Minting →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {nfts.map((nft) => (
                <div key={nft.tokenId} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-64">
                    <DemoNFTViewer 
                      bikeModel={nft.bikeData.name}
                      serialNumber={nft.serialNumber}
                      ownerAddress={nft.ownerAddress}
                      showMetadata={false}
                    />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{nft.bikeData.name}</h3>
                    <p className="text-gray-600 mb-4">#{nft.tokenId} • {nft.serialNumber}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <PriceDisplay usdAmount={nft.purchasePrice} className="text-left" showEth={false} />
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Owned
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Minted:</span>
                        <span>{formatDate(nft.mintedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Network:</span>
                        <span className="capitalize">{nft.network}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="text-green-600 font-medium">✅ Active</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link
                        href={`/nft-display/${nft.tokenId}`}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm text-center"
                      >
                        View 3D Model
                      </Link>
                      <a
                        href={nft.openSeaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm text-center"
                      >
                        OpenSea
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

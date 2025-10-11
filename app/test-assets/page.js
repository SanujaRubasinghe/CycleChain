"use client";
import { getImageUrl, getModelUrl } from "@/config/nft-assets";
import DemoNFTViewer from "@/components/nft/DemoNFTViewer";

export default function TestAssetsPage() {
  const bikeModels = ['CycleChain Pro', 'CycleChain Urban', 'CycleChain Sport', 'CycleChain Eco'];
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Local Assets Test</h1>
        
        {/* Asset URLs Test */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Asset URLs</h2>
          
          <div className="space-y-2 text-sm">
            <p><strong>3D Model:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{getModelUrl()}</code></p>
            {bikeModels.map(model => (
              <p key={model}>
                <strong>{model}:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{getImageUrl(model)}</code>
              </p>
            ))}
          </div>
        </div>

        {/* Image Test */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Bike Images Test</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bikeModels.map(model => (
              <div key={model} className="text-center">
                <img 
                  src={getImageUrl(model)} 
                  alt={model}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden w-full h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                  <span className="text-gray-500">Image not found</span>
                </div>
                <p className="text-sm font-medium">{model}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3D Model Test */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">3D Model Test</h2>
          
          <DemoNFTViewer 
            bikeModel="CycleChain Pro"
            serialNumber="TEST-001"
            ownerAddress="0xtest...test"
            showMetadata={true}
          />
        </div>
      </div>
    </div>
  );
}

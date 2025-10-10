"use client";
import { useState } from "react";

export default function DatabaseDebugPage() {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-db');
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testNFTCreation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-db', { method: 'POST' });
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testNFTAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/nfts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId: "debug-" + Date.now(),
          contractAddress: "0x1234567890123456789012345678901234567890",
          transactionHash: "0xdebug" + Date.now(),
          blockNumber: 12345,
          ownerAddress: "0xdebug",
          bikeData: {
            id: 1,
            name: "Debug Bike",
            model: "Debug Model",
            price: 1500,
            description: "Debug bike for testing",
            specs: {
              range: "60km",
              topSpeed: "30km/h",
              battery: "48V",
              weight: "22kg",
              motor: "350W",
              charging: "3-5 hours"
            },
            features: ["Debug Feature"],
            category: "electric"
          },
          serialNumber: "DEBUG-" + Date.now(),
          purchasePrice: 1500,
          metadataUri: "data:application/json;base64,eyJ0ZXN0IjoidGVzdCJ9",
          imageUrl: "/debug-image.jpg",
          animationUrl: "/debug-model.glb",
          network: 'sepolia'
        })
      });
      
      const result = await response.json();
      setTestResult({
        ...result,
        status: response.status,
        statusText: response.statusText
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Database Debug Page</h1>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Database Tests</h2>
          
          <div className="space-y-4">
            <button
              onClick={testConnection}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 mr-4"
            >
              {loading ? "Testing..." : "Test DB Connection"}
            </button>
            
            <button
              onClick={testNFTCreation}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 mr-4"
            >
              {loading ? "Testing..." : "Test NFT Creation (Direct)"}
            </button>
            
            <button
              onClick={testNFTAPI}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Testing..." : "Test NFT API Endpoint"}
            </button>
          </div>
        </div>

        {testResult && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Result</h3>
            
            <div className={`p-4 rounded-lg ${
              testResult.success 
                ? "bg-green-50 border border-green-200" 
                : "bg-red-50 border border-red-200"
            }`}>
              <div className={`font-semibold mb-2 ${
                testResult.success ? "text-green-800" : "text-red-800"
              }`}>
                {testResult.success ? "✅ Success" : "❌ Failed"}
              </div>
              
              <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

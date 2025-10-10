"use client";
import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";
import { getModelUrl } from "@/config/nft-assets";

// Fallback 3D bike representation
function FallbackBike() {
  return (
    <group position={[0, -1, 0]} scale={0.8}>
      {/* Simple bike representation using basic shapes */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.1, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.8, -0.5, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.8, -0.5, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.3, 0.6, 0.1]} />
        <meshStandardMaterial color="#4A90E2" />
      </mesh>
    </group>
  );
}

// Load GLB model from local assets
function BikeModel({ url, onLoad, onError }) {
  const [useFallback, setUseFallback] = useState(false);
  
  // Try to load the GLB model
  let scene = null;
  try {
    const gltf = useGLTF(url);
    scene = gltf.scene;
  } catch (error) {
    console.error("Error loading GLB model:", error);
    if (onError) onError(error);
    setUseFallback(true);
  }
  
  useEffect(() => {
    if (scene) {
      // Optimize the model for better performance
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Call onLoad when model is ready
      if (onLoad) onLoad();
    }
  }, [scene, onLoad]);

  // Use fallback if GLB failed to load
  if (useFallback || !scene) {
    return <FallbackBike />;
  }

  return <primitive object={scene} scale={0.8} position={[0, -1, 0]} />;
}

export default function DemoNFTViewer({ 
  bikeModel = "CycleChain Pro", 
  serialNumber = "CC-2024-001",
  ownerAddress = "0x1234...5678",
  showMetadata = true 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [modelError, setModelError] = useState(false);

  // Use local model URL from config
  const modelUrl = getModelUrl();
  
  console.log("Loading 3D model from:", modelUrl);

  useEffect(() => {
    // Reduced loading time since we're using local assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleModelLoad = () => {
    setIsLoading(false);
  };

  const handleModelError = (error) => {
    console.error("Model loading error:", error);
    setModelError(true);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your NFT...</p>
        </div>
      </div>
    );
  }

  if (modelError) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gradient-to-b from-blue-50 to-white rounded-lg">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg mx-auto flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white font-bold text-4xl">🚲</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{bikeModel}</h3>
          <p className="text-gray-600 text-sm mb-2">3D Model Preview</p>
          <p className="text-gray-500 text-xs">Model loading temporarily unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 3D Model Viewer */}
      <div className="w-full h-[500px] bg-gradient-to-b from-blue-50 to-white rounded-lg overflow-hidden shadow-lg">
        <Canvas 
          camera={{ position: [3, 2, 5], fov: 50 }}
          shadows
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          
          {/* Environment */}
          <Environment preset="studio" />
          
          {/* 3D Model */}
          <BikeModel 
            url={modelUrl}
            onLoad={handleModelLoad}
            onError={handleModelError}
          />
          
          {/* Ground shadow */}
          <ContactShadows 
            position={[0, -1.4, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={1.5} 
            far={4.5} 
          />
          
          {/* Controls */}
          <OrbitControls 
            autoRotate 
            autoRotateSpeed={1}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minDistance={2}
            maxDistance={8}
          />
        </Canvas>
      </div>

      {/* NFT Metadata */}
      {showMetadata && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">🏆 Ownership Certificate</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Bike Model</span>
                <p className="font-semibold">{bikeModel}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Serial Number</span>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{serialNumber}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Owner Address</span>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{ownerAddress}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Mint Date</span>
                <p className="font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Blockchain</span>
                <p className="font-semibold">Ethereum</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Token Standard</span>
                <p className="font-semibold">ERC-721</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 text-sm">
              ✅ This NFT proves your ownership of the e-bike and can be used for warranty claims, 
              resale verification, and accessing exclusive CycleChain services.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

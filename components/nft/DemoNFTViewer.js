"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";
import { getModelUrl } from "@/config/nft-assets";

// Global model cache to avoid loading the same model multiple times
let globalModelCache = null;
let globalModelLoading = false;
let globalModelCallbacks = [];

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

// Global model loader to share GLB between multiple components
function loadGlobalModel() {
  return new Promise((resolve, reject) => {
    if (globalModelCache) {
      resolve(globalModelCache);
      return;
    }

    if (globalModelLoading) {
      globalModelCallbacks.push({ resolve, reject });
      return;
    }

    globalModelLoading = true;
    const modelUrl = getModelUrl();

    try {
      // Use useGLTF to load the model (this will be called from a component context)
      const gltfLoader = () => {
        try {
          const gltf = useGLTF(modelUrl);
          if (gltf && gltf.scene) {
            globalModelCache = gltf.scene.clone();
            globalModelLoading = false;

            // Resolve all waiting callbacks
            globalModelCallbacks.forEach(callback => callback.resolve(globalModelCache));
            globalModelCallbacks = [];

            return globalModelCache;
          }
        } catch (error) {
          globalModelLoading = false;
          globalModelCallbacks.forEach(callback => callback.reject(error));
          globalModelCallbacks = [];
          throw error;
        }
      };

      // This is a bit of a hack - we need to use the hook in a component context
      // For now, let's use a simpler approach with direct fetch
      fetch(modelUrl)
        .then(response => {
          if (!response.ok) throw new Error(`Failed to load model: ${response.status}`);
          return response.blob();
        })
        .then(() => {
          // For now, just resolve with null - the actual loading will happen in the component
          resolve(null);
        })
        .catch(reject);

    } catch (error) {
      globalModelLoading = false;
      reject(error);
    }
  });
}

// Spinning bike model component with gradient background
function SpinningBikeModel({ previewMode = false }) {
  const meshRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);

  // Slow rotation animation
  useFrame((state, delta) => {
    if (meshRef.current && (previewMode || modelLoaded)) {
      meshRef.current.rotation.y += delta * 0.5; // Slow rotation
    }
  });

  useEffect(() => {
    // Try to load the model
    const modelUrl = getModelUrl();

    try {
      const gltf = useGLTF(modelUrl);
      if (gltf && gltf.scene) {
        // Clone the scene to avoid sharing instances
        const clonedScene = gltf.scene.clone();

        // Optimize the model
        clonedScene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Ensure materials are properly configured
            if (child.material) {
              child.material.needsUpdate = true;
            }
          }
        });

        if (meshRef.current) {
          // Clear existing children
          while (meshRef.current.children.length > 0) {
            meshRef.current.remove(meshRef.current.children[0]);
          }
          // Add the cloned model
          meshRef.current.add(clonedScene);
        }

        setModelLoaded(true);
      }
    } catch (error) {
      console.error("Error loading GLB model:", error);
      setModelError(true);
    }
  }, []);

  if (modelError) {
    return <FallbackBike />;
  }

  return (
    <group ref={meshRef} position={[0, -3, 0]} scale={1.5}>
      {/* Placeholder until model loads */}
      {!modelLoaded && <FallbackBike />}
    </group>
  );
}

// Error boundary component for GLB loading
function ModelErrorBoundary({ children, onError }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Set up global error handler for GLB loading issues
    const handleError = (event) => {
      if (event.error && event.error.message && event.error.message.includes('GLB')) {
        console.error("GLB loading error caught by boundary:", event.error);
        setHasError(true);
        if (onError) onError(event.error);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onError]);

  if (hasError) {
    return <FallbackBike />;
  }

  return children;
}

export default function DemoNFTViewer({ 
  bikeModel = "CycleChain Pro", 
  serialNumber = "CC-2024-001",
  ownerAddress = "0x1234...5678",
  showMetadata = true,
  previewMode = false
}) {
  // In preview mode, we don't need the complex preloading logic
  // The SpinningBikeModel handles everything internally
  if (previewMode) {
    return (
      <div className="w-full">
        {/* 3D Model Viewer */}
        <div className="w-full h-64 bg-gradient-to-br from-white to-blue-100 rounded-lg overflow-hidden shadow-lg relative">
          {/* Gradient overlay for better visual appeal */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none z-10" />
          
          <Canvas
            camera={{ position: [3, 2, 5], fov: 50 }}
            shadows
            gl={{ antialias: false, alpha: true }}
            dpr={1}
          >
            {/* Enhanced Lighting Setup */}
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            <directionalLight
              position={[-10, -10, -10]}
              intensity={0.5}
              color="#4A90E2"
            />
            <pointLight position={[0, 10, 0]} intensity={0.8} color="#FF6B6B" />

            {/* Environment for better reflections */}
            <Environment preset="studio" />

            {/* Spinning Bike Model */}
            <Suspense fallback={<FallbackBike />}>
              <ModelErrorBoundary>
                <SpinningBikeModel previewMode={true} />
              </ModelErrorBoundary>
            </Suspense>

            {/* Enhanced ground shadow */}
            <ContactShadows
              position={[0, -1.4, 0]}
              opacity={0.6}
              scale={12}
              blur={2}
              far={6}
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

  // Full mode with all features (legacy behavior) - now simplified
  return (
    <div className="w-full">
      {/* 3D Model Viewer */}
      <div className="w-full h-[500px] bg-gradient-to-br from-white to-blue-100 rounded-lg overflow-hidden shadow-lg relative">
        {/* Gradient overlay for better visual appeal */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none z-10" />
        
        <Canvas
          camera={{ position: [3, 2, 5], fov: 50 }}
          shadows
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          {/* Enhanced Lighting Setup */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <directionalLight
            position={[-10, -10, -10]}
            intensity={0.5}
            color="#4A90E2"
          />
          <pointLight position={[0, 10, 0]} intensity={0.8} color="#FF6B6B" />

          {/* Environment for better reflections */}
          <Environment preset="studio" />

          {/* Spinning Bike Model */}
          <Suspense fallback={<FallbackBike />}>
            <ModelErrorBoundary>
              <SpinningBikeModel previewMode={false} />
            </ModelErrorBoundary>
          </Suspense>

          {/* Enhanced ground shadow */}
          <ContactShadows
            position={[0, -1.4, 0]}
            opacity={0.6}
            scale={12}
            blur={2}
            far={6}
          />

          {/* OrbitControls for full mode */}
          <OrbitControls
            autoRotate={false}
            enablePan={true}
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

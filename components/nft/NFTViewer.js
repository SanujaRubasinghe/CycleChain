"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

// Load GLB model from IPFS
function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} />;
}

export default function NFTViewer({ contractAddress, abi, tokenId }) {
  const [modelUrl, setModelUrl] = useState(null);

  useEffect(() => {
    const loadNFT = async () => {
      if (!window.ethereum) return;

      // Connect to provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);

      // Get token URI from contract
      let tokenURI = await contract.tokenURI(tokenId);

      // Handle ipfs:// links
      if (tokenURI.startsWith("ipfs://")) {
        tokenURI = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
      }

      // Fetch metadata JSON
      const metadata = await fetch(tokenURI).then((res) => res.json());

      // Pick animation_url (3D model)
      let glbUrl = metadata.animation_url || metadata.image;
      if (glbUrl.startsWith("ipfs://")) {
        glbUrl = glbUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
      }

      setModelUrl(glbUrl);
    };

    loadNFT();
  }, [contractAddress, abi, tokenId]);

  if (!modelUrl) {
    return <p className="text-center mt-4">Loading NFT...</p>;
  }

  return (
    <div className="w-full h-[500px]">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Model url={modelUrl} />
        <OrbitControls autoRotate autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
}

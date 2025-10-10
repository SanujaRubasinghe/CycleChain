require("dotenv").config({ path: "../.env.local" });
const { NFTStorage, File } = require("nft.storage");
const fs = require("fs");
const path = require("path");

async function main() {
  const client = new NFTStorage({ token: process.env.NFT_STORAGE_KEY });

  const imagePath = path.join(__dirname, "../assets/preview.jpg");
  const modelPath = path.join(__dirname, "../assets/model.glb");

  const image = new File([fs.readFileSync(imagePath)], "preview.jpg", { type: "image/jpeg" });
  const model = new File([fs.readFileSync(modelPath)], "model.glb", { type: "model/gltf-binary" });

  const metadata = await client.store({
    name: "Bike Model X",
    description: "Proof of ownership for Bike Model X",
    image,
    animation_url: model,
    attributes: [
      { trait_type: "Serial Number", value: "SN12345678" },
      { trait_type: "Purchase Date", value: new Date().toISOString().split("T")[0] }
    ]
  });

  // metadata.url is usually ipfs://bafy.../metadata.json
  console.log("IPFS metadata URI:", metadata.url);
}
main();

import { NextResponse } from "next/server";
import { ethers } from "ethers";
import contractAbi from "@/abi/BikeOwnershipNFT.json"; 

export async function POST(request) {
  try {
    const { customerWallet, metadataUri } = await request.json();

    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractAbi.abi,
      wallet
    );

    const tx = await contract.issueBikeNFT(customerWallet, metadataUri);
    await tx.wait();

    return NextResponse.json({
      success: true,
      txHash: tx.hash,
      metadataUri
    });
  } catch (err) {
    console.error("Minting failed:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

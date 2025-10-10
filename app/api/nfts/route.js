import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import NFT from "@/models/NFT";
import User from "@/models/User";

// GET - Fetch user's NFTs
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const sortBy = searchParams.get('sortBy') || 'mintedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get user's NFTs
    const nfts = await NFT.find({ 
      ownerEmail: session.user.email,
      status: 'minted',
      isActive: true 
    })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

    // Get total count for pagination
    const totalNFTs = await NFT.countDocuments({ 
      ownerEmail: session.user.email,
      status: 'minted',
      isActive: true 
    });

    // Get user stats
    const stats = await NFT.getUserStats(session.user.email);

    return NextResponse.json({
      success: true,
      data: {
        nfts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalNFTs / limit),
          totalNFTs,
          hasNextPage: page < Math.ceil(totalNFTs / limit),
          hasPrevPage: page > 1
        },
        stats: stats[0] || {
          totalNFTs: 0,
          totalValue: 0,
          averagePrice: 0,
          bikeModels: []
        }
      }
    });

  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return NextResponse.json(
      { error: "Failed to fetch NFTs" },
      { status: 500 }
    );
  }
}

// POST - Create new NFT record after minting
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const nftData = await request.json();

    // Validate required fields
    const requiredFields = ['tokenId', 'contractAddress', 'transactionHash', 'blockNumber', 'ownerAddress', 'bikeData', 'serialNumber', 'purchasePrice'];
    
    for (const field of requiredFields) {
      if (!nftData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create NFT record
    const nft = new NFT({
      ...nftData,
      ownerEmail: session.user.email,
      name: `${nftData.bikeData.name} #${nftData.serialNumber}`,
      description: `Ownership certificate for ${nftData.bikeData.name} - ${nftData.bikeData.description}`,
      attributes: [
        { trait_type: "Model", value: nftData.bikeData.name },
        { trait_type: "Serial Number", value: nftData.serialNumber },
        { trait_type: "Price", value: `$${nftData.purchasePrice}` },
        { trait_type: "Range", value: nftData.bikeData.specs.range },
        { trait_type: "Top Speed", value: nftData.bikeData.specs.topSpeed },
        { trait_type: "Battery", value: nftData.bikeData.specs.battery },
        { trait_type: "Weight", value: nftData.bikeData.specs.weight },
        { trait_type: "Motor", value: nftData.bikeData.specs.motor },
        { trait_type: "Charging Time", value: nftData.bikeData.specs.charging },
        { trait_type: "Purchase Date", value: new Date().toISOString().split('T')[0] },
        { trait_type: "Owner", value: nftData.ownerAddress },
        { trait_type: "Blockchain", value: "Ethereum" },
        { trait_type: "Network", value: nftData.network || "sepolia" }
      ]
    });

    await nft.save();

    // Update user's NFT profile stats
    const user = await User.findOne({ email: session.user.email });
    if (user) {
      await user.updateNFTStats(nftData);
    }

    return NextResponse.json({
      success: true,
      data: nft,
      message: "NFT record created successfully"
    });

  } catch (error) {
    console.error("Error creating NFT record:", error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "NFT with this token ID or transaction hash already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create NFT record" },
      { status: 500 }
    );
  }
}

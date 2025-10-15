import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import NFT from "@/models/NFT";

// GET - Fetch specific NFT by token ID
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { tokenId } = params;

    const nft = await NFT.findOne({ 
      tokenId,
      ownerEmail: session.user.email,
      status: 'minted',
      isActive: true 
    });

    if (!nft) {
      return NextResponse.json(
        { error: "NFT not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await nft.incrementViewCount();

    return NextResponse.json({
      success: true,
      data: nft
    });

  } catch (error) {
    console.error("Error fetching NFT:", error);
    return NextResponse.json(
      { error: "Failed to fetch NFT" },
      { status: 500 }
    );
  }
}

// PUT - Update NFT data
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { tokenId } = params;
    const updateData = await request.json();

    // Only allow updating certain fields
    const allowedUpdates = ['shippingInfo', 'preferences'];
    const updates = {};

    for (const key of allowedUpdates) {
      if (updateData[key]) {
        updates[key] = updateData[key];
      }
    }

    const nft = await NFT.findOneAndUpdate(
      { 
        tokenId,
        ownerEmail: session.user.email,
        status: 'minted',
        isActive: true 
      },
      updates,
      { new: true }
    );

    if (!nft) {
      return NextResponse.json(
        { error: "NFT not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: nft,
      message: "NFT updated successfully"
    });

  } catch (error) {
    console.error("Error updating NFT:", error);
    return NextResponse.json(
      { error: "Failed to update NFT" },
      { status: 500 }
    );
  }
}

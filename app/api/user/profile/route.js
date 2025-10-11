import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import NFT from "@/models/NFT";

// GET - Fetch user profile with NFT data
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user data
    const user = await User.findOne({ email: session.user.email }).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get NFT statistics
    const nftStats = await NFT.getUserStats(session.user.email);
    const recentNFTs = await NFT.find({ 
      ownerEmail: session.user.email,
      status: 'minted',
      isActive: true 
    })
    .sort({ mintedAt: -1 })
    .limit(5)
    .select('tokenId serialNumber bikeData.name bikeData.model purchasePrice mintedAt imageUrl');

    // Get bike model distribution
    const modelDistribution = await NFT.aggregate([
      { 
        $match: { 
          ownerEmail: session.user.email, 
          status: 'minted', 
          isActive: true 
        } 
      },
      {
        $group: {
          _id: '$bikeData.model',
          count: { $sum: 1 },
          totalValue: { $sum: '$purchasePrice' },
          avgPrice: { $avg: '$purchasePrice' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Monthly minting activity (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyActivity = await NFT.aggregate([
      {
        $match: {
          ownerEmail: session.user.email,
          status: 'minted',
          isActive: true,
          mintedAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$mintedAt' },
            month: { $month: '$mintedAt' }
          },
          count: { $sum: 1 },
          totalSpent: { $sum: '$purchasePrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        user,
        nftStats: nftStats[0] || {
          totalNFTs: 0,
          totalValue: 0,
          averagePrice: 0,
          bikeModels: []
        },
        recentNFTs,
        modelDistribution,
        monthlyActivity
      }
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const updateData = await request.json();

    // Only allow updating certain fields
    const allowedUpdates = [
      'username', 
      'walletAddress', 
      'defaultShipping', 
      'preferences',
      'nftProfile.preferredPaymentMethod'
    ];

    const updates = {};

    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        if (key.includes('.')) {
          // Handle nested fields
          const [parent, child] = key.split('.');
          if (!updates[parent]) updates[parent] = {};
          updates[parent][child] = updateData[key];
        } else {
          updates[key] = updateData[key];
        }
      }
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error("Error updating user profile:", error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import NFT from "@/models/NFT";
import User from "@/models/User";

export async function GET() {
  try {
    // Test database connection
    await connectDB();
    
    // Test NFT model
    const nftCount = await NFT.countDocuments();
    
    // Test User model
    const userCount = await User.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        nftCount,
        userCount,
        mongoUri: process.env.MONGODB_URI ? "Set" : "Not set"
      }
    });
    
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      mongoUri: process.env.MONGODB_URI ? "Set" : "Not set"
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    await connectDB();
    
    // Test creating a sample NFT record
    const testNFT = new NFT({
      tokenId: "test-" + Date.now(),
      contractAddress: "0x1234567890123456789012345678901234567890",
      transactionHash: "0xtest" + Date.now(),
      blockNumber: 12345,
      ownerAddress: "0xtest",
      ownerEmail: "test@example.com",
      bikeData: {
        id: 1,
        name: "Test Bike",
        model: "Test Model",
        price: 1000,
        description: "Test Description",
        specs: {
          range: "50km",
          topSpeed: "25km/h",
          battery: "48V",
          weight: "25kg",
          motor: "250W",
          charging: "4-6 hours"
        },
        features: ["Test Feature"],
        category: "electric"
      },
      serialNumber: "TEST-" + Date.now(),
      purchasePrice: 1000
    });
    
    await testNFT.save();
    
    return NextResponse.json({
      success: true,
      message: "Test NFT created successfully",
      data: testNFT
    });
    
  } catch (error) {
    console.error("Test NFT creation error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

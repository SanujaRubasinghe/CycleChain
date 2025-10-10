import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// One-time migration to add cards field to existing users
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Initialize cards array if it doesn't exist
    if (!user.cards || !Array.isArray(user.cards)) {
      console.log("User before migration - has cards field:", !!user.cards);
      
      // Use direct MongoDB update to ensure field is added
      const updatedUser = await User.findByIdAndUpdate(
        session.user.id,
        { $set: { cards: [] } },
        { new: true, runValidators: true }
      );
      
      console.log("Cards field added to user:", session.user.id);
      console.log("Updated user has cards:", !!updatedUser.cards, "Length:", updatedUser.cards?.length);
      
      return NextResponse.json({ 
        message: "Cards field initialized successfully",
        success: true,
        hadCards: false,
        cardsNow: updatedUser.cards?.length || 0
      });
    }

    return NextResponse.json({ 
      message: "Cards field already exists",
      success: true,
      cardCount: user.cards.length
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ 
      message: error.message || "Migration failed",
      success: false 
    }, { status: 500 });
  }
}

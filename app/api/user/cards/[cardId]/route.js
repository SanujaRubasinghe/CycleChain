import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// DELETE a card
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = params;

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const cardIndex = user.cards.findIndex((card) => card._id.toString() === cardId);
  if (cardIndex === -1) {
    return NextResponse.json({ message: "Card not found" }, { status: 404 });
  }

  const wasDefault = user.cards[cardIndex].isDefault;
  user.cards.splice(cardIndex, 1);

  // If deleted card was default and there are other cards, make the first one default
  if (wasDefault && user.cards.length > 0) {
    user.cards[0].isDefault = true;
  }

  await user.save();

  return NextResponse.json({ message: "Card deleted successfully" });
}

// PATCH - Update card (mainly for setting default)
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = params;
  const { isDefault } = await req.json().catch(() => ({}));

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const card = user.cards.find((card) => card._id.toString() === cardId);
  if (!card) {
    return NextResponse.json({ message: "Card not found" }, { status: 404 });
  }

  // If setting as default, unset all other cards
  if (isDefault) {
    user.cards.forEach((c) => {
      c.isDefault = false;
    });
    card.isDefault = true;
  }

  await user.save();

  return NextResponse.json({ message: "Card updated successfully" });
}

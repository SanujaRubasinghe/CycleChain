import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// Luhn algorithm for card number validation
function validateCardNumberLuhn(cardNumber) {
  const cleaned = cardNumber.replace(/\s/g, "");
  if (!/^\d+$/.test(cleaned)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

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

// PUT - Update full card details
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = params;
  const body = await req.json().catch(() => ({}));
  const { cardholderName, cardNumber, expiryMonth, expiryYear, cvv, isDefault } = body;

  // Validation
  if (!cardholderName || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }

  // Validate card number (13-19 digits)
  const cleanCardNumber = cardNumber.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(cleanCardNumber)) {
    return NextResponse.json({ message: "Card number must be between 13 and 19 digits" }, { status: 400 });
  }

  // Validate card number using Luhn algorithm
  if (!validateCardNumberLuhn(cleanCardNumber)) {
    return NextResponse.json({ message: "Invalid card number (failed checksum validation)" }, { status: 400 });
  }

  // Validate expiry
  if (!/^\d{2}$/.test(expiryMonth) || !/^\d{4}$/.test(expiryYear)) {
    return NextResponse.json({ message: "Invalid expiry date format (use MM and YYYY)" }, { status: 400 });
  }

  const month = parseInt(expiryMonth);
  const year = parseInt(expiryYear);
  if (month < 1 || month > 12) {
    return NextResponse.json({ message: "Month must be between 01 and 12" }, { status: 400 });
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return NextResponse.json({ message: "Card has expired" }, { status: 400 });
  }

  // Check if year is too far in the future (more than 20 years)
  if (year > currentYear + 20) {
    return NextResponse.json({ message: "Invalid expiry year (too far in future)" }, { status: 400 });
  }

  // Validate CVV (3 digits only)
  if (!/^\d{3}$/.test(cvv)) {
    return NextResponse.json({ message: "CVV must be exactly 3 digits" }, { status: 400 });
  }

  await dbConnect();

  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const card = user.cards.find((card) => card._id.toString() === cardId);
  if (!card) {
    return NextResponse.json({ message: "Card not found" }, { status: 404 });
  }

  // Update card details
  card.cardholderName = cardholderName;
  card.cardNumber = cleanCardNumber;
  card.expiryMonth = expiryMonth;
  card.expiryYear = expiryYear;
  card.cvv = cvv;

  // Handle default status
  if (isDefault) {
    user.cards.forEach((c) => {
      c.isDefault = false;
    });
    card.isDefault = true;
  }

  await user.save();

  return NextResponse.json({ message: "Card updated successfully", card: {
    _id: card._id,
    cardholderName: card.cardholderName,
    cardNumber: "**** **** **** " + card.cardNumber.slice(-4),
    expiryMonth: card.expiryMonth,
    expiryYear: card.expiryYear,
    isDefault: card.isDefault,
  } });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
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

// GET all cards for the logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id).select("cards").lean();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return empty array if cards field doesn't exist
    if (!user.cards || !Array.isArray(user.cards)) {
      console.log("No cards field found for user:", session.user.id);
      return NextResponse.json([]);
    }

    console.log("Found", user.cards.length, "cards for user:", session.user.id);

    // Mask card numbers for security (show only last 4 digits)
    const maskedCards = user.cards.map((card) => ({
      _id: card._id,
      cardholderName: card.cardholderName,
      cardNumber: `**** **** **** ${card.cardNumber.slice(-4)}`,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      isDefault: card.isDefault,
      createdAt: card.createdAt,
    }));

    console.log("Returning masked cards:", maskedCards.length);
    return NextResponse.json(maskedCards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json({ message: error.message || "Failed to fetch cards" }, { status: 500 });
  }
}

// POST - Add a new card
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { cardholderName, cardNumber, expiryMonth, expiryYear, cvv, isDefault } = await req.json().catch(() => ({}));

  // Validation
  if (!cardholderName || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
    return NextResponse.json({ message: "All card fields are required" }, { status: 400 });
  }

  // Basic card number validation (remove spaces and check if it's numeric)
  const cleanCardNumber = cardNumber.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(cleanCardNumber)) {
    return NextResponse.json({ message: "Card number must be between 13 and 19 digits" }, { status: 400 });
  }

  // Validate card number using Luhn algorithm
  if (!validateCardNumberLuhn(cleanCardNumber)) {
    return NextResponse.json({ message: "Invalid card number (failed checksum validation)" }, { status: 400 });
  }

  // Validate expiry - be flexible with input format
  const cleanMonth = String(expiryMonth).trim().padStart(2, '0');
  const cleanYear = String(expiryYear).trim();
  
  if (!/^\d{1,2}$/.test(expiryMonth)) {
    return NextResponse.json({ message: "Invalid expiry month format (use MM)" }, { status: 400 });
  }
  
  if (!/^\d{4}$/.test(cleanYear)) {
    return NextResponse.json({ message: "Invalid expiry year format (use YYYY)" }, { status: 400 });
  }

  const month = parseInt(cleanMonth);
  if (month < 1 || month > 12) {
    return NextResponse.json({ message: "Month must be between 01 and 12" }, { status: 400 });
  }
  
  // Check if card is not expired
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const cardYear = parseInt(cleanYear);
  
  if (cardYear < currentYear || (cardYear === currentYear && month < currentMonth)) {
    return NextResponse.json({ message: "Card has expired" }, { status: 400 });
  }

  // Check if year is too far in the future (more than 20 years)
  if (cardYear > currentYear + 20) {
    return NextResponse.json({ message: "Invalid expiry year (too far in future)" }, { status: 400 });
  }

  // Validate CVV (3 digits only)
  if (!/^\d{3}$/.test(cvv)) {
    return NextResponse.json({ message: "CVV must be exactly 3 digits" }, { status: 400 });
  }

  await dbConnect();

  let user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Initialize cards array if it doesn't exist (for existing users)
  if (!user.cards || !Array.isArray(user.cards)) {
    console.log("Initializing cards array for user:", session.user.id);
    // Use direct MongoDB update
    user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { cards: [] } },
      { new: true }
    );
    console.log("Cards field initialized. Has cards:", !!user.cards);
  }

  // If this is set as default, unset other default cards
  if (isDefault) {
    user.cards.forEach((card) => {
      card.isDefault = false;
    });
  }

  // If this is the first card, make it default
  const makeDefault = isDefault || user.cards.length === 0;

  // Add the new card with cleaned data
  user.cards.push({
    cardholderName: cardholderName.trim(),
    cardNumber: cleanCardNumber,
    expiryMonth: cleanMonth,
    expiryYear: cleanYear,
    cvv,
    isDefault: makeDefault,
  });

  console.log("Saving user with cards:", user.cards.length);
  await user.save();
  console.log("User saved successfully. Total cards:", user.cards.length);

  return NextResponse.json({ 
    message: "Card added successfully",
    cardCount: user.cards.length 
  }, { status: 201 });
  } catch (error) {
    console.error("Error adding card:", error);
    return NextResponse.json({ message: error.message || "Failed to add card" }, { status: 500 });
  }
}

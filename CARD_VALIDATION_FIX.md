# Card Validation Fix

## Issue
Users were getting "Invalid expiry date format" error when trying to add cards.

## Root Cause
The API validation was too strict, requiring exactly 2 digits for month and 4 digits for year without any flexibility for input variations.

## Changes Made

### 1. API Validation (`app/api/user/cards/route.js`)
**Improvements:**
- ✅ Made month validation flexible (accepts 1 or 2 digits, pads with leading zero)
- ✅ Improved year validation with better error messages
- ✅ Added expiration date check (rejects expired cards)
- ✅ Cleans and normalizes input before saving
- ✅ Better error messages for debugging

**New Validation Logic:**
```javascript
// Accepts "1" or "01" for January
const cleanMonth = String(expiryMonth).trim().padStart(2, '0');

// Validates 4-digit year
const cleanYear = String(expiryYear).trim();

// Checks if card is expired
if (cardYear < currentYear || (cardYear === currentYear && month < currentMonth)) {
  return NextResponse.json({ message: "Card has expired" }, { status: 400 });
}
```

### 2. Frontend Form (`app/(user-management)/profile/page.js`)
**Improvements:**
- ✅ Added input validation to only allow numeric characters
- ✅ Enforced max lengths (2 for month, 4 for year, 4 for CVV)
- ✅ Added client-side validation before API call
- ✅ Better user feedback with specific error messages

**Input Validation:**
```javascript
// Only allows digits in month, year, and CVV fields
if (name === 'expiryMonth' || name === 'expiryYear' || name === 'cvv') {
  if (value && !/^\d*$/.test(value)) {
    return; // Prevents non-numeric input
  }
}
```

**Client-Side Checks:**
- Cardholder name is not empty
- Card number is at least 13 digits
- Expiry month is provided
- Expiry year is exactly 4 digits
- CVV is at least 3 digits

## Testing Guide

### Valid Test Cases:
1. **Standard Format:**
   - Month: `12`
   - Year: `2025`
   - Expected: ✅ Success

2. **Single Digit Month:**
   - Month: `5` (May)
   - Year: `2026`
   - Expected: ✅ Success (auto-padded to `05`)

3. **Future Date:**
   - Month: `01`
   - Year: `2030`
   - Expected: ✅ Success

### Invalid Test Cases:
1. **Expired Card:**
   - Month: `01`
   - Year: `2020`
   - Expected: ❌ "Card has expired"

2. **Invalid Month:**
   - Month: `13`
   - Year: `2025`
   - Expected: ❌ "Invalid expiry month (must be 1-12)"

3. **Invalid Year Format:**
   - Month: `12`
   - Year: `25` (2-digit year)
   - Expected: ❌ "Please enter expiry year (YYYY)"

4. **Short CVV:**
   - CVV: `12`
   - Expected: ❌ "Please enter valid CVV (3-4 digits)"

## Example Valid Card Data

```json
{
  "cardholderName": "John Doe",
  "cardNumber": "4111111111111111",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "cvv": "123",
  "isDefault": false
}
```

## Benefits
1. ✅ More user-friendly (accepts various input formats)
2. ✅ Better error messages (tells user exactly what's wrong)
3. ✅ Prevents expired cards from being added
4. ✅ Client-side validation reduces unnecessary API calls
5. ✅ Input restrictions prevent invalid characters

# Card Display Debugging Guide

## Issue
Cards are being added successfully but not displaying in the UI.

## Fixes Applied

### 1. API GET Endpoint (`/api/user/cards`)
- ✅ Added try-catch error handling
- ✅ Returns empty array `[]` if cards field doesn't exist
- ✅ Handles cases where user.cards is undefined or not an array
- ✅ Added console logging for debugging

### 2. Frontend loadCards Function
- ✅ Added detailed error logging
- ✅ Sets cards to empty array on error
- ✅ Logs loaded cards data to console
- ✅ Shows error status and details

### 3. UI Improvements
- ✅ Added card count display: "X card(s) saved"
- ✅ This helps verify if cards are loaded in state

## How to Debug

### Step 1: Check Browser Console
After adding a card, open browser DevTools (F12) and check the Console tab for:

```
Loaded cards: [{...}]  // Should show array of cards
```

If you see errors, they will indicate the problem.

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Add a card
3. Look for these requests:
   - `POST /api/user/cards` → Should return 201 with success message
   - `GET /api/user/cards` → Should return 200 with array of cards

### Step 3: Check Card Count
The UI now shows "X card(s) saved" under the "Payment Cards" heading.
- If it shows "0 card(s) saved" after adding → cards not loading
- If it shows "1 card(s) saved" but no card displays → rendering issue

### Step 4: Check MongoDB
If cards aren't persisting, check your database:

```javascript
// In MongoDB shell or Compass
db.users.findOne({ email: "your@email.com" }, { cards: 1 })
```

Should show:
```json
{
  "cards": [
    {
      "cardholderName": "John Doe",
      "cardNumber": "4111111111111111",
      "expiryMonth": "12",
      "expiryYear": "2025",
      ...
    }
  ]
}
```

## Common Issues & Solutions

### Issue 1: Cards field doesn't exist in database
**Symptom:** GET returns empty array even after adding card  
**Solution:** Already fixed - API now initializes cards array if missing

### Issue 2: Session/Auth issue
**Symptom:** 401 Unauthorized errors  
**Solution:** Make sure you're logged in and session is valid

### Issue 3: MongoDB connection issue
**Symptom:** 500 errors in API calls  
**Solution:** Check if MongoDB is running and connection string is correct

### Issue 4: Cards state not updating
**Symptom:** Card count stays at 0  
**Solution:** Check console for "Loaded cards:" log - if missing, loadCards() isn't being called

## Testing Steps

1. **Clear browser cache** and reload page
2. **Login** to your account
3. **Go to Profile** → Click "Payment Cards" tab
4. **Check card count** - should show "0 card(s) saved"
5. **Click "Add Card"** button
6. **Fill in card details:**
   - Name: John Doe
   - Number: 4111111111111111
   - Month: 12
   - Year: 2025
   - CVV: 123
7. **Click "Add Card"** button
8. **Check console** for "Loaded cards:" message
9. **Check card count** - should now show "1 card(s) saved"
10. **Verify card displays** with masked number

## Expected Console Output

```
Loaded cards: []  // Initial load
Card added successfully!  // After adding
Loaded cards: [
  {
    _id: "...",
    cardholderName: "John Doe",
    cardNumber: "**** **** **** 1111",
    expiryMonth: "12",
    expiryYear: "2025",
    isDefault: true,
    createdAt: "..."
  }
]
```

## If Still Not Working

1. Check the browser console for specific error messages
2. Check the terminal/server logs for API errors
3. Verify MongoDB is running: `mongod --version`
4. Check if the User model has the cards field defined
5. Try refreshing the page after adding a card
6. Try logging out and back in

## Quick Fix Commands

```bash
# Restart Next.js dev server
npm run dev

# Check MongoDB status
mongod --version

# Clear Next.js cache
rm -rf .next
npm run dev
```

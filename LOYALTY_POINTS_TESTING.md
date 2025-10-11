# Loyalty Points Testing Guide

## Issue: Points Not Displaying

You mentioned that the ride history shows 20 points earned but the total loyalty points don't display.

## Debugging Steps

### 1. Check Browser Console
Open the browser console (F12) and navigate to the Loyalty tab. Look for these console logs:

```
Points response status: 200
Points data received: { loyaltyPoints: XX }
Rides response status: 200
Rides data received: [...]
```

### 2. Check Server Console
In your terminal where the Next.js dev server is running, look for:

```
Fetching loyalty points for user: [user-id]
User loyalty points: XX
```

### 3. Verify Database
Check if the `loyaltyPoints` field exists in your user document:

**Option A: Using MongoDB Compass or Shell**
```javascript
db.users.findOne({ _id: ObjectId("your-user-id") })
```

Look for the `loyaltyPoints` field. If it doesn't exist, the field needs to be initialized.

**Option B: Check via API**
Navigate to: `http://localhost:3000/api/user`
The response should include: `"loyaltyPoints": XX`

## Common Issues & Solutions

### Issue 1: Field Doesn't Exist in Database
**Symptom:** API returns `loyaltyPoints: 0` even after completing rides

**Solution:** The field needs to be added to existing users. Run this migration:

1. Create a migration script or manually update users:
```javascript
// In MongoDB shell or Compass
db.users.updateMany(
  { loyaltyPoints: { $exists: false } },
  { $set: { loyaltyPoints: 0 } }
)
```

2. Or restart the server to ensure the schema is updated

### Issue 2: Points Not Being Awarded
**Symptom:** Rides complete but points don't increase

**Check:**
1. Verify the ride end endpoint is being called
2. Check server logs for errors in `/api/reservation/end/[id]`
3. Ensure the User model import is correct in the endpoint

### Issue 3: Session Not Loading
**Symptom:** Page shows loading spinner indefinitely

**Solution:**
- Ensure you're logged in
- Check if NextAuth session is working: `console.log(session)` in the component
- Verify the session provider wraps the component

### Issue 4: API Returns 401 Unauthorized
**Symptom:** Console shows 401 error for `/api/user/loyalty`

**Solution:**
- User is not authenticated
- Session has expired - try logging out and back in
- Check NextAuth configuration

## Manual Testing Checklist

1. **Login** to your account
2. **Navigate** to Profile → Loyalty Points tab
3. **Check** the debug yellow box shows:
   - Points State = [some number]
   - Session = Loaded
4. **Check** browser console for API responses
5. **Complete a ride** (if possible)
6. **Refresh** the loyalty page
7. **Verify** points increased by the distance traveled

## Quick Fix: Initialize Points Manually

If you need to test immediately, you can manually set points via MongoDB:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { loyaltyPoints: 50 } }
)
```

Then refresh the loyalty page.

## API Test Commands

Test the loyalty API directly using curl or Postman:

```bash
# Get loyalty points (must be authenticated)
curl http://localhost:3000/api/user/loyalty \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Get user profile (includes loyaltyPoints)
curl http://localhost:3000/api/user \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## Expected Behavior

1. **After completing a 20km ride:**
   - User should earn 20 loyalty points
   - Profile Quick Stats should show: ⭐ 20
   - Loyalty tab should show: "20" in large green text
   - Ride history should show: "+20 pts"

2. **Progress bars should update:**
   - 20% Discount: 40% filled (20/50 points)
   - Free Weekend Ride: 20% filled (20/100 points)

## Debug Output

The yellow debug box shows:
- **Points State**: The current value in React state
- **Session**: Whether NextAuth session is loaded

If Points State = 0 but you've completed rides:
1. Check if API is returning correct data (browser console)
2. Check if database has the points (MongoDB)
3. Check if the ride end endpoint is awarding points (server logs)

## Next Steps

1. Open the Loyalty tab
2. Check the debug yellow box
3. Open browser console (F12)
4. Share the console output with me
5. Check server terminal for any errors

This will help identify exactly where the issue is occurring.

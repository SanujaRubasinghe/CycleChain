# Start MongoDB

## Quick Fix

Your app needs MongoDB running. Choose one option:

### Option 1: Start Local MongoDB (if installed)

```powershell
# Check if MongoDB is installed
mongod --version

# If installed, start it:
mongod --dbpath="C:\data\db"
```

### Option 2: Use MongoDB Atlas (Cloud - Recommended)

1. **Go to**: https://www.mongodb.com/cloud/atlas/register
2. **Create free account** (M0 Free tier)
3. **Create a cluster** (takes 3-5 minutes)
4. **Get connection string**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/cycle-chain`)
5. **Update `.env.local`**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cycle-chain?retryWrites=true&w=majority
   ```

### Option 3: Install MongoDB Locally

**Download**: https://www.mongodb.com/try/download/community

**After installation**:
```powershell
# Create data directory
mkdir C:\data\db

# Start MongoDB
mongod --dbpath="C:\data\db"
```

---

## Current Status

Your `.env.local` is configured with:
```
MONGODB_URI=mongodb://localhost:27017/cycle-chain
```

This expects MongoDB running locally on port 27017.

---

## Test Connection

After starting MongoDB, restart your dev server:

```bash
npm run dev
```

If you see no MongoDB errors, you're good to go!

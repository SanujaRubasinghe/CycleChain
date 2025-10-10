# PowerShell script to create .env.local file
# Run this script: .\create-env.ps1

$envContent = @"
# MetaMask Crypto Payment Configuration
# Replace with your actual wallet address to receive payments
NEXT_PUBLIC_RECEIVER_WALLET=0x

# Stripe Configuration (if using card payments)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=

# MongoDB
MONGODB_URI=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
"@

$envPath = Join-Path $PSScriptRoot ".env.local"

if (Test-Path $envPath) {
    Write-Host "⚠️  .env.local already exists!" -ForegroundColor Yellow
    $response = Read-Host "Do you want to overwrite it? (y/N)"
    if ($response -ne "y") {
        Write-Host "❌ Cancelled" -ForegroundColor Red
        exit
    }
}

$envContent | Out-File -FilePath $envPath -Encoding UTF8
Write-Host "✅ Created .env.local successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open .env.local and add your MetaMask wallet address"
Write-Host "2. Restart your dev server (npm run dev)"
Write-Host "3. Test crypto payment with Sepolia testnet"
Write-Host ""
Write-Host "📖 See METAMASK_SETUP.md for detailed instructions"

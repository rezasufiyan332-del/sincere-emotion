# Run this script in PowerShell to authenticate with GitHub
# You'll get a code to enter at https://github.com/login/device

Write-Host "Starting GitHub authentication..."
Write-Host ""
Write-Host "Steps:"
Write-Host "1. A code will appear below"
Write-Host "2. Open https://github.com/login/device in your browser"
Write-Host "3. Enter the code"
Write-Host "4. Click Continue and Authorize"
Write-Host ""

gh auth login -h github.com -p https -w

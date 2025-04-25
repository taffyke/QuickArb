$host.UI.RawUI.WindowTitle = "ArbitrageScanner Development Server"
Set-Location $PSScriptRoot

Write-Host "`n==============================================" -ForegroundColor Cyan
Write-Host "  ARBITRAGE SCANNER DEV SERVER" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "`nServer starting on:" -ForegroundColor Yellow
Write-Host "http://localhost:3000" -ForegroundColor Blue -BackgroundColor White
Write-Host "`nNews page with TradingView widget:" -ForegroundColor Yellow
Write-Host "http://localhost:3000/news" -ForegroundColor Blue -BackgroundColor White
Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Yellow

npm run dev:fixed 
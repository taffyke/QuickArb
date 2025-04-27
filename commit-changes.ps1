Write-Host "Committing and pushing changes to GitHub..."
git add .
git commit -m "Update app for Netlify deployment"
git push origin main
Write-Host "Done!" 
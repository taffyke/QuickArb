Write-Host "Committing and pushing changes to GitHub..."
git add vite.config.ts
git commit -m "Update Vite config to use port 8081"
git push origin master
Write-Host "Done!" 
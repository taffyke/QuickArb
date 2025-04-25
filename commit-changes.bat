@echo off
echo Committing and pushing changes to GitHub...
git add .
git commit -m "Update Vite config to use port 8081"
git push origin master
echo Done!
pause 
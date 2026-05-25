rm -f mybot.zip
rm -rf .git
git init
git config --global user.name "Shadow1529"
git config --global user.email "Shadow1529@users.noreply.github.com"
echo "node_modules/" > .gitignore
git add .
git commit -m "clean push"
git branch -M main
git remote add origin https://Shadow1529:$GITHUB_TOKEN@github.com/Shadow1529/HostTheCuteBot.git
git push -f origin main

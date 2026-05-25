git config --global user.name "Shadow1529"
git config --global user.email "Shadow1529@users.noreply.github.com"
git init
git add .
git commit -m "push"
git branch -M main
git remote remove origin 2>/dev/null
git remote add origin https://Shadow1529:$GITHUB_TOKEN@github.com/Shadow1529/HostTheCuteBot.git
git push -f -u origin main

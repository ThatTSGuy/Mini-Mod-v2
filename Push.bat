@echo off

git add .

set /p comment="Commit Comment: "
git commit -am %comment%

git push origin main

git push heroku main

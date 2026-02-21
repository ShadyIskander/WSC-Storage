# How to get this on GitHub (via Terminal)

Follow these exact steps to push your code to your GitHub account using the terminal in VS Code.

## 1. Create the Repo on GitHub
First, go to your [GitHub account](https://github.com) and create a new repository. 
- Give it a name like `wsc-storage`.
- Keep it public or private (doesn't matter).
- **Do not** initialize it with a README or License yet.
- Once created, copy the URL they give you (the one ending in `.git`).

## 2. Initialize and Push (Terminal Steps)
Open your terminal in VS Code (`Ctrl + ~`) and run these commands one by one:

```bash
# 1. Start git in your folder
git init

# 2. Track all files (your .gitignore will keep .env safe)
git add .

# 3. Save your changes locally
git commit -m "my first commit"

# 4. Point your computer to your GitHub repo
# Replace <URL> with the one you copied from GitHub
git remote add origin <URL>
git remote add origin <https://github.com/ShadyIskander/WSC-Storage.git>

# 5. Send it to GitHub
git push -u origin main
```

## After that...
Next time you make changes, you only need to run:
1. `git add .`
2. `git commit -m "updated stuff"`
3. `git push`

## What about Vercel?
Once your code is on GitHub, you can just go to Vercel, import that Repo, and follow the same steps as before (don't forget to add your `.env` keys to the Vercel dashboard).

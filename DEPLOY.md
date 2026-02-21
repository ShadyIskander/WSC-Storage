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
git remote add origin https://github.com/ShadyIskander/WSC-Storage.git

# 5. Send it to GitHub
git push -u origin main
```

## 3. Connecting to Vercel
Once your code is on GitHub, follow this to go live:
1. Go to [Vercel](https://vercel.com) and sign in.
2. Click **Add New** -> **Project**.
3. Import your `wsc-storage` repo.

## 4. Setting your Keys on Vercel (Crucial!)
Vercel needs your Supabase keys to talk to the database. 
1. While setting up the project (or in **Settings -> Environment Variables** after), look for the "Environment Variables" section.
2. Add the first one:
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: (Paste your Supabase URL here)
3. Click **Add**.
4. Add the second one:
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: (Paste your Supabase Anon Key here)
5. Click **Add**.
6. Hit **Deploy**.

***

## Subsequent Updates
When you make changes later and want to push them to GitHub:
1. `git add .` (Gather all changes)
2. `git commit -m "Describe your change"` (Save them with a note)
3. `git push` (Send them to GitHub)

Vercel will see the push and update your website automatically.

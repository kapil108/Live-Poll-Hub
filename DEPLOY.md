# Deployment Guide 🚀

Follow these steps to deploy your Live Poll Hub.

## Phase 1: GitHub (Source Code)
1.  **Create a Repository**: Go to GitHub and create a new repository (e.g., `live-poll-hub`).
2.  **Push Code**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/live-poll-hub.git
    git push -u origin main
    ```

## Phase 2: Railway (Backend)
1.  Go to [Railway.app](https://railway.app/).
2.  Click **"New Project"** -> **"Deploy from GitHub repo"**.
3.  Select your `live-poll-hub` repository.
4.  **Important**: Click "Add Variables" or Settings.
5.  **Root Directory**: Change this to `/server`.
    *   *Why?* The backend code lives in the `server` folder.
6.  Click **Deploy**.
7.  Once deployed, go to **Settings** -> **Domains**.
8.  Copy the **generated domain** (e.g., `web-production-1234.up.railway.app`).
    *   *Save this URL! You need it for the frontend.*

## Phase 3: Vercel (Frontend)
1.  Go to [Vercel.com](https://vercel.com/).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `live-poll-hub` repository.
4.  **Environment Variables**:
    *   Click the configured arrow to expand.
    *   **Name**: `VITE_BACKEND_URL`
    *   **Value**: `https://web-production-1234.up.railway.app` (The URL you copied from Railway).
    *   *Note: Make sure to include `https://` and NO trailing slash.*
5.  Click **Deploy**.

## Success! 🎉
Your app is now live. Open the Vercel URL to start creating polls!

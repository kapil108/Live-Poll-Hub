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

## Phase 2: Render (Backend)
1.  Go to [dashboard.render.com](https://dashboard.render.com/).
2.  Click **"New +"** -> **"Web Service"**.
3.  Connect your `live-poll-hub` repository.
4.  **Configure Settings**:
    *   **Root Directory**: `server`  (Important!)
    *   **Runtime**: Node
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Region**: Select one close to you (e.g., Singapore/Ohio).
    *   **Free Instance Type**: Select "Free".
5.  Click **Create Web Service**.
6.  Wait for deployment to finish.
7.  **Copy the Application URL** (top left, e.g., `https://live-poll-hub.onrender.com`).
    *   *Save this URL! You need it for the frontend.*

## Phase 3: Vercel (Frontend)
1.  Go to [Vercel.com](https://vercel.com/).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `live-poll-hub` repository.
4.  **Environment Variables**:
    *   Click the configured arrow to expand.
    *   **Name**: `VITE_BACKEND_URL`
    *   **Value**: `https://live-poll-hub.onrender.com` (Your Render URL).
    *   *Note: Make sure to include `https://` and NO trailing slash.*
5.  Click **Deploy**.

## Success! 🎉
Your app is now live. Open the Vercel URL to start creating polls!

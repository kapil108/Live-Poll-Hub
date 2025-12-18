# Live Poll Hub 🎓📊

A real-time, interactive polling application built for classrooms and workshops. Engage your audience instantly with live feedback.

![Project Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Features

-   **Real-time Interaction**: Instant updates using Socket.io.
-   **Teacher Dashboard**: Create polls, manage questions, and view live analytics.
-   **Student View**: Join with a code, no account needed, and participate instantly.
-   **Live Results**: Dynamic charts and progress bars showing class performance.
-   **Chat System**: Built-in messaging for Q&A during polls.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI
-   **Backend**: Node.js, Express, Socket.io
-   **Deployment**: Vercel (Frontend), Railway (Backend)

## 🚀 Getting Started

### Prerequisites
-   Node.js (v16+)
-   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/live-poll-hub.git
    cd live-poll-hub
    ```

2.  **Install Dependencies**
    ```bash
    # Install Frontend dependencies
    npm install

    # Install Backend dependencies
    cd server
    npm install
    ```

3.  **Run Locally**
    You need two terminals:

    *Terminal 1 (Backend)*:
    ```bash
    cd server
    npm start
    ```

    *Terminal 2 (Frontend)*:
    ```bash
    npm run dev
    ```

4.  **Access App**: Open `http://localhost:8080` (or the port shown in terminal).

## 🌍 Deployment

### Backend (Railway)
1.  Connect your repo to Railway.
2.  Set Root Directory to `/server`.
3.  Deploy.

### Frontend (Vercel)
1.  Connect your repo to Vercel.
2.  Add Environment Variable: `VITE_BACKEND_URL` = `https://your-railway-app-url.up.railway.app`
3.  Deploy.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
*Built with ❤️ for better learning experiences.*

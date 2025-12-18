import { io } from "socket.io-client";

// URL of your Node.js backend
// Ensure this matches where your backend is running
const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const socket = io(URL, {
    autoConnect: true,
});

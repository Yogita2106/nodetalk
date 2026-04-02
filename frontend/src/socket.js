import { io } from "socket.io-client";

// Direct backend URL for socket connection
const socket = io("https://chatapp-2csn.onrender.com");

export default socket;
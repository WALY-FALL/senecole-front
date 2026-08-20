import { io } from "socket.io-client";

const socket = io("https://senecole-back.onrender.com", {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export default socket;
/*import { io } from "socket.io-client";


const socket = io("http://localhost:8989");


export default socket;*/
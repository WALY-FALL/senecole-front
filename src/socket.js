import { io } from "socket.io-client";


const socket = io("http://localhost:8989");


export default socket;
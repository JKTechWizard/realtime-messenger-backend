import http from "http";
import app from "./app";


// import { initSocket } from "./sockets/chat.socket";
import { connectDB } from "./config/db.config";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// initSocket(server);

 connectDB();


server.listen(PORT, () => {
 console.log(`Server running on ${PORT}`);
});
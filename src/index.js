import connectedDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";
import { initializeSocket } from "./socket.js";

dotenv.config({ path: "./.env" });

connectedDB()
.then((msg) => {
    console.log("Connected successfully");
    const server = app.listen(process.env.PORT, () => {
        console.log(`App is listening on port http://localhost:${process.env.PORT} `);
    });

    // Initialize socket.io with the created server
    try {
        initializeSocket(server);
        console.log('Socket.IO initialized');
    } catch (err) {
        console.warn('Socket initialization failed:', err.message);
    }
})
.catch((err) => {
    console.log(`Failed to connect with DB `, err);
});
import connectedDB from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js";
import {OTHER_PORT} from "./constants.js";

dotenv.config({ path: "./.env" });

app.get("/",(req, res)=>{
res.send("Heyyy")
})

connectedDB()
.then((msg)=>{
    console.log(typeof app)
    console.log("Connected successfully");
    app.listen(`process.env.PORT ||${OTHER_PORT}`,()=>{
        console.log(`App is listening on port http://localhost:${process.env.PORT} `);
    })
})
.catch((err)=>{
    console.log(`Failed to connect with DB `, err);
    
})
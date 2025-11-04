import connectedDB from "./db/index.js";
import dotenv from "dotenv";
import {app} from "./app.js";

dotenv.config({ path: "./.env" });

connectedDB()
.then((msg)=>{

    console.log("Connected successfully");
    app.listen(process.env.PORT,()=>{
        console.log(`App is listening on port http://localhost:${process.env.PORT} `);
    })
})
.catch((err)=>{
    console.log(`Failed to connect with DB `, err);
    
})
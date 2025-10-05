import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();


//middlewares + configurations 
app.use(express.static("public"));
app.use(express.json({limit:"32kb"}));
app.use(express.urlencoded({extended: true , limmit :"32kb"}));

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials:true
}));
app.use(cookieParser());


//export
export  default app;
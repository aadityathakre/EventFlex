import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//middlewares + configurations
app.use(express.static("public"));
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());

//registration and login route
import userRoutes from "./routes/user.routes.js";
app.use("/api/v1/users", userRoutes); 

//gig route
import gigRoutes from "./routes/gig.routes.js";
app.use("/api/v1/gigs", gigRoutes);

// auth route
import authRoutes from "./routes/auth.route.js";
app.use("/api/v1/auth", authRoutes);

//export
export {app};

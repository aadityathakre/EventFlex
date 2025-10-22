import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { sanitizeInput, rateLimit } from "./middlewares/sanitize.middleware.js";

const app = express();

//middlewares + configurations
app.use(express.static("public"));
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Security middlewares
app.use(sanitizeInput);
app.use(rateLimit(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

//registration and login route
import userRoutes from "./routes/user.routes.js";
app.use("/api/v1/users", userRoutes);

// users auth route
import authRoutes from "./routes/users.auth.routes.js";
app.use("/api/v1/auth/users", authRoutes);

//gig route
import gigRoutes from "./routes/gig.routes.js";
app.use("/api/v1/gigs", gigRoutes);

//organizer route
import orgRoutes from "./routes/organizer.routes.js";
app.use("/api/v1/organizer", orgRoutes);

//host route
import hostRoutes from "./routes/host.routes.js";
app.use("/api/v1/host", hostRoutes);

// admin auth route
import adminAuthRoutes from "./routes/admin.auth.routes.js";
app.use("/api/v1/auth/admin", adminAuthRoutes);

//admin router
import adminRoutes from "./routes/admin.routes.js";
app.use("/api/v1/admin", adminRoutes);



// Error handling middleware (must be last)
import { errorHandler, notFound } from "./middlewares/errorHandler.middleware.js";

// 404 handler for undefined routes
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use(errorHandler);

//export
export { app };

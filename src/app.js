import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { sanitizeInput, rateLimit } from "./middlewares/sanitize.middleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//middlewares + configurations
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true, // allow same-origin or configured origin
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

// Serve frontend build (single-server setup)
const frontendDistPath = path.join(__dirname, "../frontend/dist");

// Serve static assets from frontend build if present
app.use(express.static(frontendDistPath));

// Set up EJS view engine for server-side rendering of dynamic pages
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// Example server-rendered route (EJS) - appears under /ejs/*
app.get('/ejs/info', (req, res) => {
  // Provide a small list of API routes and actions that can be triggered from the server-rendered page
  const actions = [
    { label: 'List Users (JSON)', href: '/api/v1/users' },
    { label: 'Gig Dashboard (API)', href: '/api/v1/gigs/dashboard' },
    { label: 'Organizer Pools (API)', href: '/api/v1/organizer/pools' },
  ];

  res.render('info', { title: 'EventFlex - Server Rendered', actions });
});

// SPA fallback: send index.html for non-API routes
app.get(/^(?!\/api\/).*/, (req, res, next) => {
  const indexHtmlPath = path.join(frontendDistPath, "index.html");
  res.sendFile(indexHtmlPath, (err) => {
    if (err) next();
  });
});

// 404 handler for undefined routes (kept after SPA fallback)
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use(errorHandler);

//export
export { app };

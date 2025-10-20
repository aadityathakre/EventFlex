import express from "express";
import { loginUser, refreshAccessToken , logoutUser} from "../controllers/users.auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
const router = express.Router();


router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", verifyToken, logoutUser);

export default router ;
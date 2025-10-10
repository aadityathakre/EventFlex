import express from "express";
import { refreshAccessToken , logoutUser} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { loginUser } from "../controllers/loginUser.controller.js";
const router = express.Router();


router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", verifyToken, logoutUser);

export default router;
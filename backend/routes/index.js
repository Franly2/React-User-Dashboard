import express from "express";
import { getAllUser, register, login, logout } from "../controller/users.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { refreshToken } from "../controller/RefreshToken.js";
const router = express.Router();

router.get("/users", verifyToken, getAllUser);
router.post("/users", register);
router.post("/login", login);
router.get("/token", refreshToken);
router.delete("/logout", logout);

export default router;

import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/register-user").post(upload.fields(
    [
        { name: "avatarUrl", maxCount: 1 }, { name: "coverImageUrl", maxCount: 1 }
    ]
), registerUser);

export default router;



import { Router } from "express";
import { chnageCurrentUserPassword, getCurrentUserProfile, refreshedToken, registerUser, updateAvatarUrl, userLoggedIn, userLoggedOut } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register-user").post(upload.fields(
    [
        { name: "avatarUrl", maxCount: 1 }, { name: "coverImageUrl", maxCount: 1 }
    ]
), registerUser);

router.route("/login-user").post(userLoggedIn);

// secured routes

router.route("/logged-out").post(verifyJWT, userLoggedOut);

// refresh token route can be added here in the future when implementing refresh tokens for better security and user experience

router.route("/refresh-token").post(refreshedToken); // Placeholder for refresh token route, can be implemented in the future when implementing refresh tokens for better security and user experience

//password change route can be added here in the future when implementing password change functionality for users to update their passwords securely
router.route("/change-password").patch(verifyJWT, chnageCurrentUserPassword);

router.route("/current-user").get(verifyJWT, getCurrentUserProfile); // Placeholder for getting current user profile route, can be implemented in the future to allow users to view their profile information securely

router.route("/update-avatar").patch(verifyJWT, upload.single("avatarUrl"), updateAvatarUrl); // Placeholder for updating user avatar route, can be implemented in the future to allow users to update their profile picture securely

export default router;



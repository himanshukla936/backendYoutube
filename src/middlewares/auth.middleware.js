import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
// Middleware to verify the JWT token sent in the request headers or cookies, and attach the user data to the request object if the token is valid, 
// res is set to _ because it is not used in this middleware and to avoid linting errors about unused variables
const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = req.cookies?.accessToken || (authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

        if (!token) {
            throw new ApiError(401, "Unauthorized: No token provided");
        }

        const decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const userData = await User.findById(decoded._id).select("-password -refreshToken");

        if (!userData) {
            throw new ApiError(401, "Unauthorized: User not found");
        }

        req.user = userData;
        next();

    } catch (error) {
        throw new ApiError(401, "Unauthorized: Invalid token");
    }
});

export default verifyJWT;
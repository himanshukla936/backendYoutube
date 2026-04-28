import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js"
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import uploadToCloudinary from "../utils/cloudinary.js";
import sendEmail from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
    const { userName, email, fullName, password } = req.body;

    if ([userName, email, fullName, password].some(field => !field)) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { userName }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }

    const avatarLocalUrl = req.files?.avatarUrl?.[0]?.path;
    const coverImageLocalUrl = req.files?.coverImageUrl?.[0]?.path;

    if (!avatarLocalUrl) {
        throw new ApiError(400, "Profile picture is required");
    }

    const avatarUrl = await uploadToCloudinary(avatarLocalUrl, "profilePictures");
    const coverImageUrl = coverImageLocalUrl ? await uploadToCloudinary(coverImageLocalUrl, "coverImages") : "";

    const newUser = new User({
        userName: userName.toLowerCase(),
        email: email,
        fullName: fullName,
        password: password,
        avatarUrl: avatarUrl,
        coverImageUrl: coverImageUrl
    });

    const savedUser = await newUser.save();

    if (!savedUser) {
        throw new ApiError(500, "Failed to register user");
    }

    await sendEmail(
        newUser.email,
        "Welcome to Our App 🎉",
        `Hello ${newUser.userName}, your account has been created successfully!`
    );

    return new ApiResponse(
        201,
        "User registered successfully",
        {
            userId: newUser._id,
            userName: newUser.userName,
            email: newUser.email,
            fullName: newUser.fullName,
            avatarUrl: newUser.avatarUrl,
            coverImageUrl: newUser.coverImageUrl
        }
    ).send(res);

});

const userLoggedIn = asyncHandler(async (req, res) => {
    const { email, userName, password } = req.body;

    if (!email && !userName) {
        throw new ApiError(400, "Email or username are required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const user = await User.findOne({
        $or: [{ email }, { userName: userName?.toLowerCase() }]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const loggingInUser = await User.findById(user._id).select("-password -refreshToken");

    const cookieOptions = {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        secure: true, // Ensure the cookie is only sent over HTTPS
    }

    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.cookie("accessToken", accessToken, cookieOptions);

    return new ApiResponse(
        200,
        "User logged in successfully",
        { user: loggingInUser, refreshToken, accessToken }
    ).send(res);
});

const userLoggedOut = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    return new ApiResponse(
        200,
        "User logged out successfully"
    ).send(res);
});

const refreshedToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
        throw new ApiError(400, "Refresh token is required");
    }

    const decoded = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    }

    res.cookie("refreshToken", newRefreshToken, cookieOptions);
    res.cookie("accessToken", newAccessToken, cookieOptions);

    return new ApiResponse(
        200,
        "Token refreshed successfully",
        { accessToken: newAccessToken, refreshToken: newRefreshToken }
    ).send(res);
});

const chnageCurrentUserPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current password and new password are required");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
        throw new ApiError(401, "Invalid current password");
    }

    user.password = newPassword;
    await user.save();

    return new ApiResponse(
        200,
        "Password changed successfully"
    ).send(res);
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
    return new ApiResponse(
        200,
        "User profile retrieved successfully",
        req.user
    ).send(res);
});

const updateAvatarUrl = asyncHandler(async (req, res) => {
    const avatarLocalUrl = req.file?.path;
    
    if (!avatarLocalUrl) {
        throw new ApiError(400, "Profile picture is required");
    }

    const avatarUrl = await uploadToCloudinary(avatarLocalUrl, "profilePictures");

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.avatarUrl = avatarUrl;
    await user.save();

    return new ApiResponse(
        200,
        "Profile picture updated successfully",
        { avatarUrl }
    ).send(res);
});


export { registerUser, userLoggedIn, userLoggedOut, refreshedToken, chnageCurrentUserPassword, getCurrentUserProfile, updateAvatarUrl };
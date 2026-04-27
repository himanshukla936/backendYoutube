import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js"
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import uploadToCloudinary from "../utils/cloudinary.js";

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

export { registerUser };
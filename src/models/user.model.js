import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true, // Make the username field required
        unique: true, // Ensure that each username is unique in the database
        lowercase: true, // Convert the username to lowercase before saving to ensure case-insensitive uniqueness
        trim: true, // Remove leading and trailing whitespace
        index: true, // Add an index for faster queries on username
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatarUrl: {
        type: String,
        required: true,
    },
    coverImageUrl: {
        type: String
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId, // Store the ObjectId of the video
            ref: "Video", // Reference to the Video model
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String,
    },
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

userSchema.pre("save", async function (next) { // Hash the password before saving the user document to the database
    if (!this.isModified("password")) { // Only hash the password if it has been modified (or is new)
        return next();
    }
    try {
        this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
        return next(error);
    }
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) { // Compare the provided password with the hashed password in the database
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function () { // Generate an access token that includes the user's _id, userName, email, and fullName in the payload, and sign it with the ACCESS_TOKEN_SECRET environment variable, with an expiration time defined by ACCESS_TOKEN_EXPIRES_IN environment variable
    return jwt.sign(
        {
            _id: this._id,
            userName: this.userName,
            email: this.email,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
        }
    )
};

userSchema.methods.generateRefreshToken = function () { // Generate a refresh token that includes only the user's _id in the payload, and sign it with the REFRESH_TOKEN_SECRET environment variable, with an expiration time defined by REFRESH_TOKEN_EXPIRES_IN environment variable
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
        }
    )
};

const User = mongoose.model("User", userSchema);

export default User;

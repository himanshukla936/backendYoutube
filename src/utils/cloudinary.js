import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath, folderName) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folderName, // Optional: specify a folder in Cloudinary
            resource_type: "auto", // Automatically detect the resource type (image, video, etc.)
        });
        fs.unlinkSync(filePath); // Remove the file from the local filesystem after uploading
        return result.secure_url; // Return the secure URL of the uploaded image
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
};

export default uploadToCloudinary;

import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String,
        required: true,
    },
    thumbnailUrl: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, // Store the ObjectId of the user
        ref: "User", // Reference to the User model
        required: true,
    },
}, {
    timestamps: true,    
})

videoSchema.plugin(mongooseAggregatePaginate); // Add the pagination plugin to the video schema

const Video = mongoose.model("Video", videoSchema);

export default Video;
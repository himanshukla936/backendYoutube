import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId, // Store the ObjectId of the user who owns the subscription
        ref: "User", // Reference to the User model
        required: true,
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId, // Store the ObjectId of the channel that the user is subscribed to
        ref: "User", // Reference to the User model
        required: true,
    }
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
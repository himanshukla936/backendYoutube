import Express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = Express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN, // Allow requests from this origin
        credentials: true, // Allow cookies to be sent in cross-origin requests
    }
));

app.use(Express.json({
    limit: "16kb" // Limit the size of incoming JSON payloads to 16KB
}));

app.use(Express.urlencoded({
    extended: true, // Use the qs library for parsing URL-encoded data with rich objects and arrays support example nested objects 
    limit: "16kb" // Limit the size of incoming URL-encoded payloads to 16KB
}));

app.use(Express.static("public")); // Serve static files from the "public" directory

app.use(cookieParser()); // Middleware to parse cookies from incoming requests 


//router import 

import userRoute from "./routes/user.route.js";

app.use("/api/v1/users", userRoute);

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        statusCode: err.statusCode || 500,
        success: false,
        message: err.message
    });
});

export default app;
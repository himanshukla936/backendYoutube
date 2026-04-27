class ApiResponse {
    constructor(statusCode, message, data = null) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode >= 200 && statusCode < 300; // Determine success based on status code
    }

    send(res) {
        res.status(this.statusCode).json({
            message: this.message,
            data: this.data,
            success: this.success
        });
    }
}

export default ApiResponse;
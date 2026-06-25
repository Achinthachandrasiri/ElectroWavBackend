const handleErrors = (error) => {
    let response = {
        success: false,
        message: 'An unexpected error occurred',
        statusCode: 500
    };

    // Preserve service layer validation errors if present
    if (error.errors) {
        response.errors = error.errors;
    }

    // Preserve custom error messages
    if (error.message) {
        response.message = error.message;
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        response = {
            success: false,
            message: 'Validation error',
            errors: messages,
            statusCode: 400
        };
    }
    // Duplicate key error (unique fields)
    else if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        response = {
            success: false,
            message: `${field} already exists`,
            field: field,
            statusCode: 409
        };
    }
    // Custom error with status code
    else if (error.statusCode) {
        response = {
            success: false,
            message: error.message,
            statusCode: error.statusCode,
            ...(error.errors && { errors: error.errors }) // keep errors if any
        };
    }
    // Unsupported Media Type Error
    else if (error.name === 'UnsupportedMediaTypeError') {
        response = {
            success: false,
            message: 'Unsupported media type',
            statusCode: 415
        };
    }
    // Business Logic Error
    else if (error.name === 'BusinessLogicError') {
        response = {
            success: false,
            message: error.message,
            statusCode: 422
        };
    }
    // CORS Policy Violation
    else if (error.message === 'CORS error') {
        response = {
            success: false,
            message: 'CORS policy violation',
            statusCode: 403
        };
    }
    // Request Timed Out
    else if (error.code === 'ETIMEDOUT') {
        response = {
            success: false,
            message: 'Request timed out',
            statusCode: 408
        };
    }
    // Rate Limit Exceeded
    else if (error.message && error.message.includes('Rate limit exceeded')) {
        response = {
            success: false,
            message: 'Rate limit exceeded. Please try again later.',
            statusCode: 429
        };
    }
    // Database Connection Error
    else if (error.name === 'MongoNetworkError') {
        response = {
            success: false,
            message: 'Database connection error',
            statusCode: 503
        };
    }

    return response;
};

const createError = (message, statusCode, errors = null) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    if (errors) error.errors = errors; 
    return error;
};

const AppError = (message, statusCode = 500, errors = null) => {
    return {
        name: 'AppError',
        message,
        statusCode,
        ...(errors && { errors })
    };
};

const errorTypes = {
    badRequest: (message = 'Bad request', errors = null) => createError(message, 400, errors),
    unauthorized: (message = 'Unauthorized') => createError(message, 401),
    forbidden: (message = 'Forbidden') => createError(message, 403),
    notFound: (message = 'Not found') => createError(message, 404),
    conflict: (message = 'Conflict') => createError(message, 409),
    serverError: (message = 'Internal server error') => createError(message, 500)
};

module.exports = { handleErrors, errorTypes, AppError };

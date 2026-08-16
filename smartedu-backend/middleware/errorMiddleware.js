function errorHandler(err, req, res, next) {
    // Always log the full error server-side for debugging
    console.error('❌ Unhandled error:', err);

    const statusCode = err.statusCode || err.status || 500;

    // In production, hide internal error details from the client
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction && statusCode === 500
        ? 'Internal Server Error'
        : (err.message || 'Internal Server Error');

    res.status(statusCode).json({
        success: false,
        message: message
    });
}

module.exports = {
    errorHandler
};

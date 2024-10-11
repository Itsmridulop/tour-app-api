module.exports = (error, req, res, next) => {
    if(error.name === 'TokenExpiredError') res.status(401).json({
        status: 'failed',
        message: 'your session is expired'
    })
    res.status(error.statusCode || 500).json({
        status: error.status || 'ERROR',
        message: error.message || 'Internal server error'
    })
}
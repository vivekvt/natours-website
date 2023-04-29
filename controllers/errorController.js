const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path} : ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
    const message = `Duplicate Field value: ${value[0]}. Please use another value!`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token. Please login again.', 401)

const handleJWTExpiredError = () => new AppError('Your token has expired. Please login again.', 401)

const sendErrorDev = (err, req, res) => {
    // API ERROR
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            errorName: err.name,
            errorCode: err.code,
            message: err.message,
            stack: err.stack
        });
    }

    // Render Website
    console.error('Error Ocurred ', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message
    });

}


const sendErrorProd = (err, req, res) => {
    //A API ERROR
    if (req.originalUrl.startsWith('/api')) {
        // Operational error trusted error send to client,
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        // Programing error unknown error dont't leak to client,
        console.error('Error Ocurred ', err);
        return res.status(500).json({
            status: 'error',
            message: 'Somethinng went wrong!',
        });

    }

    //B Rendered Website
    // Operational error trusted error send to client,
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        });
    }
    // Programing error unknown error dont't leak to client,
    console.error('Error Ocurred ', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: 'Please try again later'
    });



}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {

        // let error = {...err }; not working

        if (err.name === 'CastError') err = handleCastErrorDB(err);
        if (err.code === 11000) err = handleDuplicateFieldsDB(err);
        if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
        if (err.name === 'JsonWebTokenError') err = handleJWTError();
        if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

        // let error = {...err };
        // if (err.name === 'CastError') {
        //     console.log('CastError')
        //     error = handleCastErrorDB(error);
        // }
        // if (err.code === 11000) {
        //     console.log('CastError')
        //     error = handleDuplicateFieldsDB(err);
        // }

        sendErrorProd(err, req, res);
    }

}
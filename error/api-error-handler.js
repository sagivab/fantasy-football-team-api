const ApiError = require('./api-error');

const apiErrorHandler = (err, req, res, next) => {
    console.log(err);

    if(err instanceof ApiError) {
        return res.status(err.code).json({ error: err.message });
    }

    return res.status(500).json('Something went wrong');
};


module.exports = apiErrorHandler;
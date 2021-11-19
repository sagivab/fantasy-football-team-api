const ApiError = require('../error/api-error');

const validateDto = (schema, part) => {
    return async (req, res, next) => {  
        try {
            const validateInput = await schema.validate(req[part]);
            req[part] = validateInput;
            return next();
        } catch(error) {
            console.log(error);
            return next(ApiError.badRequest(error.message));
        }
    }
};

module.exports = validateDto;
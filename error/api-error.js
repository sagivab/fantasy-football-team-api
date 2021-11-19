class ApiError {
    constructor(code = 500, message = 'Something went wrong') {
        this.message = message;
        this.code = code;
    }

    static badRequest(msg) {
        return new ApiError(400, msg);
    }

    static unauthenticated(msg = 'User must be signed in') {
        return new ApiError(401, msg);
    }

    static unauthorized(msg = 'User doesn\'t have permission') {
        return new ApiError(403, msg);
    }

    static notFound(msg = 'Server couldn\'t find requested data') {
        return new ApiError(404, msg);
    }

    static hasConflict(msg = 'Conflict in DB') {
        return new ApiError(409, msg);
    }
}

module.exports = ApiError;
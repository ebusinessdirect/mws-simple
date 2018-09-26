module.exports = class ServerError extends Error {
    constructor(message, code, body) {
        super(message);
        if (Error.captureStackTrace) Error.captureStackTrace(this, ServerError);
        this.code = code;
        this.body = body;
    }
};

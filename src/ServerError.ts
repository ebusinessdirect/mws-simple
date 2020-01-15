export default class ServerError extends Error {
    code = 0;

    body = '';

    constructor(message: string, code: number, body: string) {
        super(message);
        if (Error.captureStackTrace) Error.captureStackTrace(this, ServerError);
        this.code = code;
        this.body = body;
    }
}

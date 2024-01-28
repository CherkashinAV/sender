export type ApiErrorCode = 'NOT_IMPLEMENTED';

export class ApiError extends Error {
    code: ApiErrorCode;
    status: number;

    constructor(code: ApiErrorCode, status: number, message: string = '') {
        super(message);
        this.code = code;
        this.status = status;
    }
}

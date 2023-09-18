class ErrorWithToast extends Error {
    name: string="UnknownError";
    toast: string="알 수 없는 에러가 발생했습니다.";
    constructor(message: string) {
        super(message);
    }
    setToast(toast:string):ErrorWithToast{
        this.toast = toast;
        return this;
    }
}

const generateGenericError = (name: string) => {
    return class extends ErrorWithToast {
        constructor(message: string) {
            super(message);
            this.name = name;
        }
    };
}


export class NotFoundError extends ErrorWithToast {
    missing: string;
    constructor(message: string, missing: string) {
        super(message);
        this.name = 'NotFoundError';
        this.missing = missing;
    }
}

export const UserAuthorizationError = generateGenericError('UserAuthorizationError');

export const StoreAuthorizationError = generateGenericError('StoreAuthorizationError');

export const NoAuthorizationInHeaderError = generateGenericError('NoAuthorizationInHeaderError');

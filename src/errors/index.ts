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


export class NotFoundError extends ErrorWithToast {
    missing: string;
    constructor(message: string, missing: string) {
        super(message);
        this.name = 'NotFoundError';
        this.missing = missing;
    }
}

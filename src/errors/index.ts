export class NotFoundError extends Error {
    toast: string;
    constructor(message: string, missing: string) {
        super(message);
        this.name = 'NotFoundError';
        this.toast = `${missing}을(를) 찾을 수 없습니다.`;
    }
}

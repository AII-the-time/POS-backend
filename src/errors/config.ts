import * as E from "@errors";
const ErrorConfig: {error:new (message:string,...any:any) => E.ErrorWithToast, code: number, toast: (error: any) => string}[]
= [
    {
        error:E.NotFoundError,
        code: 404,
        toast: (error:E.NotFoundError) => `${error.missing}을(를) 찾을 수 없습니다.`
    },
    {
        error:E.UserAuthorizationError,
        code: 401,
        toast: (error: E.ErrorWithToast) => `다시 로그인 해주세요.`
    },
    {
        error:E.StoreAuthorizationError,
        code: 401,
        toast: (error: E.ErrorWithToast) => `가게 접근 권한이 없습니다.`
    },
    {
        error:E.NoAuthorizationInHeaderError,
        code: 400,
        toast: (error: E.ErrorWithToast) => `인증 정보가 없습니다.`
    }
]
export default ErrorConfig;

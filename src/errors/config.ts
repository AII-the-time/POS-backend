import * as E from "@errors";
export type ErrorConfigType = {
    error:new (message:string,...any:any) => E.ErrorWithToast,
    code: number,
    toast: (error: any) => string,
    describtion:string
}[];
const ErrorConfig: ErrorConfigType
= [
    {
        describtion: '요청은 성공했으나, 응답을 제공할 데이터가 없습니다.',
        error:E.NotFoundError,
        code: 404,
        toast: (error:E.NotFoundError) => `${error.missing}을(를) 찾을 수 없습니다.`
    },
    {
        describtion: '토큰이 만료되었습니다.',
        error:E.UserAuthorizationError,
        code: 401,
        toast: (error: E.ErrorWithToast) => `다시 로그인 해주세요.`
    },
    {
        describtion: '사용자가 소유한 가게가 아닙니다.',
        error:E.StoreAuthorizationError,
        code: 401,
        toast: (error: E.ErrorWithToast) => `가게 접근 권한이 없습니다.`
    },
    {
        describtion: '헤더에 인증 정보가 없습니다.',
        error:E.NoAuthorizationInHeaderError,
        code: 400,
        toast: (error: E.ErrorWithToast) => `인증 정보가 없습니다.`
    }
]
export default ErrorConfig;

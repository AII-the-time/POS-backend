import * as E from '@errors';
export type ErrorConfigType = {
  error: new (message: string, ...any: any) => E.ErrorWithToast;
  code: number;
  toast: (error: any) => string;
  describtion: string;
}[];
const ErrorConfig: ErrorConfigType = [
  {
    describtion: '요청이 잘못되었습니다.',
    error: E.ValidationError,
    code: 400,
    toast: (error: E.ErrorWithToast) => `누락된 정보가 있습니다.`,
  },
  {
    describtion: '요청은 성공했으나, 응답을 제공할 데이터가 없습니다.',
    error: E.NotFoundError,
    code: 404,
    toast: (error: E.NotFoundError) =>
      `${error.missing}을(를) 찾을 수 없습니다.`,
  },
  {
    describtion: '토큰이 만료되었거나, 유효하지 않습니다.',
    error: E.UserAuthorizationError,
    code: 401,
    toast: (error: E.ErrorWithToast) => `다시 로그인 해주세요.`,
  },
  {
    describtion: '사용자가 소유한 가게가 아닙니다.',
    error: E.StoreAuthorizationError,
    code: 401,
    toast: (error: E.ErrorWithToast) => `가게 접근 권한이 없습니다.`,
  },
  {
    describtion: '헤더에 인증 정보가 없습니다.',
    error: E.NoAuthorizationInHeaderError,
    code: 400,
    toast: (error: E.ErrorWithToast) => `인증 정보가 없습니다.`,
  },
  {
    describtion: '입력된 값이 양식에 맞지 않습니다.',
    error: E.NotCorrectTypeError,
    code: 400,
    toast: (error: E.NotCorrectTypeError) =>
      `입력된 ${error.unCorrect}이(가) 양식과 맞지 않습니다.`,
  },
  {
    describtion: '이미 등록된 값이 있습니다.',
    error: E.ExistError,
    code: 409,
    toast: (error: E.ExistError) => `입력된 ${error.exist}가 이미 존재합니다.`,
  },
  {
    describtion: '잔액이 부족합니다.',
    error: E.NotEnoughError,
    code: 403,
    toast: (error: E.ErrorWithToast) => `잔액이 부족합니다.`,
  },
  {
    describtion: '토큰이 유효하지 않습니다.',
    error: E.UncorrectTokenError,
    code: 403,
    toast: (error: E.ErrorWithToast) => '토큰이 유효하지 않습니다.',
  },
  {
    describtion: '이미 결제된 주문입니다.',
    error: E.AlreadyPaidError,
    code: 403,
    toast: (error: E.ErrorWithToast) => '이미 결제된 주문입니다.',
  }
];
export default ErrorConfig;

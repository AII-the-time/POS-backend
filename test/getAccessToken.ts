import {  LoginToken } from '@utils/jwt';
const userId = Number(process.argv[2]);
console.log(new LoginToken(userId).signAccessToken());

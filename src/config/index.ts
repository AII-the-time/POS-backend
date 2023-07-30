import { config } from 'dotenv';
export const initEnvFromDotEnv = (): void => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    config();
}

interface Config {
    port: number;
    jwtSecretKey: string;
    salt: string;
}

export default {
    port: parseInt(process.env.NODE_ENV == 'test' ? '3001' : process.env.PORT || '3000'),
    jwtSecretKey: process.env.JWT_SECRET_KEY || 'secretKey',
    salt: process.env.SALT || 'salt'
} as Config;

import { config } from 'dotenv';
export const initEnvFromDotEnv = (): void => {
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    config();
}

interface IConfig {
    port: number;
}

export default {
    port: parseInt(process.env.PORT || '3000')
} as IConfig;

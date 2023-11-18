import { config } from 'dotenv';

class Config{
    static instance: Config|null=null;
    constructor() {}

    static of(): Config {
        if (!Config.instance) {
            config();
            process.env.NODE_ENV = process.env.NODE_ENV || 'development';
            Config.instance = new Config();
        }
        return Config.instance;
    }

    config() {
        return {
            port: parseInt(process.env.NODE_ENV == 'test' ? '3001' : process.env.PORT || '3000'),
            jwtSecretKey: process.env.JWT_SECRET_KEY || 'secretKey',
            salt: process.env.SALT || 'salt',
            sentryDSN: process.env.SENTRY_DSN || '',
            nodeEnv: process.env.NODE_ENV,
            NCP_SENS_SECRET: process.env.NCP_SENS_SECRET || '',
            NCP_SENS_ACCESS: process.env.NCP_SENS_ACCESS || '',
            NCP_SENS_MY_NUMBER: process.env.NCP_SENS_MY_NUMBER || '',
            NCP_SENS_ID: process.env.NCP_SENS_ID || '',
            ODCLOUD_API_KEY: process.env.ODCLOUD_API_KEY || '',
        } as const;
    }

}

export default Config.of().config();

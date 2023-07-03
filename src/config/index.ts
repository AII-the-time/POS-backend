import { config } from 'dotenv';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
config();

export default {
    port: process.env.PORT || 3000
}
import jwt from 'jsonwebtoken';
import config from '../config';
import crypto from 'crypto';

export class tokenForCertificatePhone{
    phone: string;
    encryptedCertificationCode: string;

    constructor(phone: string, certificationCode: string){
        this.phone = phone;
        this.encryptedCertificationCode = this.encryptCertificationCode(phone,certificationCode);
    }

    private encryptCertificationCode(phone:string,certificationCode: string): string {
        const hash = crypto.createHash('sha512');
        hash.update(`${phone}${certificationCode}${config.salt}`);
        return hash.digest('hex');
    }

    sign(): string{
        return jwt.sign({ ... this }, config.jwtSecretKey, { expiresIn: '3m' });
    }

    public static verify(token: string, phone: string, certificationCode: string): boolean{
        try{
            const decoded = jwt.verify(token, config.jwtSecretKey) as tokenForCertificatePhone;
            const hash = crypto.createHash('sha512');
            hash.update(`${phone}${certificationCode}${config.salt}`);
            const encryptedCertificationCode = hash.digest('hex');
            if(decoded.encryptedCertificationCode == encryptedCertificationCode){
                return true;
            }
            else{
                return false;
            }
        }
        catch(err){
            //TODO: 에러 타입마다 다른 처리
            return false;
        }
    }
}

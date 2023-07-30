export interface requestPhone{
    "phone": string;
}

export interface responsePhone{
    "tokenForCertificatePhone": string;
}

export interface requestCertificatePhone{
    "phone": string;
    "certificationCode": string;
    "phoneCertificationToken": string;
}

export interface responseCertificatePhone{
    "certificatedPhoneToken": string;
}

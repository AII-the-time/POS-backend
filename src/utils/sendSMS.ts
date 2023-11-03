import CryptoJS from "crypto-js";
import axios from "axios";
import config from "@config";

export default async (phoneNumber: string, type: string, message: string) => {
  const date = Date.now().toString();

  const uri = config.NCP_SENS_ID;
  const secretKey = config.NCP_SENS_SECRET;
  const accessKey = config.NCP_SENS_ACCESS;
  const my_number = config.NCP_SENS_MY_NUMBER;
  const method = 'POST';
  const space = " ";
  const newLine = "\n";
  const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
  const url2 = `/sms/v2/services/${uri}/messages`;

  const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
  hmac.update(method);
  hmac.update(space);
  hmac.update(url2);
  hmac.update(newLine);
  hmac.update(date);
  hmac.update(newLine);
  hmac.update(accessKey);
  const hash = hmac.finalize();
  const signature = hash.toString(CryptoJS.enc.Base64);

  const smsRes = await axios({
    method: method,
    url: url,
    headers: {
      "Contenc-type": "application/json; charset=utf-8",
      "x-ncp-iam-access-key": accessKey,
      "x-ncp-apigw-timestamp": date,
      "x-ncp-apigw-signature-v2": signature,
    },
    data: {
      type: type,
      countryCode: "82",
      from: my_number,
      content: message,
      messages: [{ to: `${phoneNumber}` }],
    },
  });
  return smsRes.data;
}

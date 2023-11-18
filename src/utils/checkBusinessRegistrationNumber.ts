import axios from 'axios';
import config from '@config';

export default async (businessRegistrationNumber: string): Promise<boolean> => {
    const { data } = await axios.post(
        `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${config.ODCLOUD_API_KEY}`,
        {
            b_no: [businessRegistrationNumber],
        }
    )
    return data.data[0].b_stt_cd !== '';
}

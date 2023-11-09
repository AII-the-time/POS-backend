import { LoginToken } from '@utils/jwt';

type KeyOfType<Type, ValueType> = keyof {
    [Key in keyof Type as Type[Key] extends ValueType ? Key : never]: any;
};

class Values {
    private static instance: Values | null = null;
    private constructor() { }
    public static getInstance(): Values {
        if (this.instance === null) {
            this.instance = new Values();
        }
        return this.instance;
    }
    private accessToken = new LoginToken(1).signAccessToken();
    public userHeader = {
        authorization: this.accessToken,
    };
    public storeHeader = {
        authorization: this.accessToken,
        storeid: 1,
    };
    //stocks
    public waterId: number = 1;
    public coffeeBeanId: number = 2;
    public milkId: number = 3;
    public grapefruitId: number = 0;
    public sugarId: number = 0;
    public grapefruitJuiceId: number = 0;

    //categories
    public coffeeCategoryId: number = 1;
    public adeCategoryId: number = 0;

    //options
    public iceOptionId: number = 1;
    public hotOptionId: number = 2;
    public bean1OptionId: number = 3;
    public bean2OptionId: number = 4;
    public shotPlusOptionId: number = 5;
    public shotMinusOptionId: number = 6;

    //menus
    public americanoId: number = 1;
    public latteId: number = 2;
    public grapefruitAdeId: number = 0;

    //orders
    public firstPreorderId: number = 0;
    public secondPreorderId: number = 0;
    public firstOrderId: number = 0;
    public secondOrderId: number = 0;

    setValues(name: KeyOfType<Values, number>, value: number) {
        this[name] = value;
    }
}

export default Values.getInstance();

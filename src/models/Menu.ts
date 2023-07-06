export default class Menu{
    constructor(name: string, price: number){
        this.name = name;
        this.price = price;
    }
    name: string;
    price: number;

    public getName(): string{
        return this.name;
    }

    public getPrice(): number{
        return this.price;
    }
    
}

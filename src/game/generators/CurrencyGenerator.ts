import {CheckActiveEffect} from "@/game/utensil";
export class CurrencyGenerator {
    private G: any;
    private _sum: bigint = 0n;
    private _addMultiples = {
        default: 100n,
    }
    private _cutMultiples = {
        default: 10000n
    }
    // 计算扣款优惠时的分子，如 G.gold.``getCutMultiple() 为 1000n , 则优惠金额为 (10000000n / 10000n) / 1000n = 100%
    // 通过其他途径 增大 G.gold.getCutMultiple() 的返回值，则可以提高扣款优惠，如 (10000000n / 10500n) / 1000n = 95.2%
    GOLD_CUT_MULTIPLE_NUMERATOR = 10000000n
    name: string = '';

    constructor(option) {
        this.G = option.G;
        this.name = option.name;
        this._sum = option?.sum ?? 0n;

        this.LOAD_SAVE()
    }

    get sum() {
        return this._sum;
    }

    // @CheckActiveEffect('currencyChange')
    changeSum(value: bigint) {
        if (value > 0n) {
            let multiple = this.getAddMultiple()
            this._sum += value * BigInt(multiple) / 100n;
        } else if (value < 0n) {
            let multiple = this.getCutMultiple()
            this._sum += value * BigInt(multiple) / 10000n;
        }
    }

    getAddMultiple() {
        return Object.values(this._addMultiples).reduce((a, b) => {
            return a + b;
        })
    }

    getCutMultiple() {
        return Object.values(this._cutMultiples).reduce((a, b) => {
            return a + b;
        })
    }

    isEnough(value: bigint) {
        return this._sum * (this.GOLD_CUT_MULTIPLE_NUMERATOR / this.getCutMultiple()) / 1000n >= value
    }

    addMultiples({name, value}: { name: any, value: bigint }) {
        return this._addMultiples[name] = value;
    }

    cutMultiples({name, value}: { name: any, value: bigint }) {
        return this._cutMultiples[name] = value;
    }

    SAVE_IN_STORAGE() {
        const {name, _sum, _addMultiples, _cutMultiples} = this;
        const add = {}
        const cut = {}
        Object.keys(_addMultiples).forEach(key => {
            add[key] = _addMultiples[key].toString();
        });
        Object.keys(_cutMultiples).forEach(key => {
            cut[key] = _cutMultiples[key].toString();
        });
        const saveInfo = {
            name,
            sum: _sum.toString(),
            addMultiples: add,
            cutMultiples: cut,
        }
        localStorage.setItem(`sg_lsg_c_${name}`, JSON.stringify(saveInfo));
    }

    private LOAD_SAVE() {
        const saveInfo = localStorage.getItem(`sg_lsg_c_${this.name}`);
        if (!saveInfo) return;
        const {sum, addMultiples, cutMultiples} = JSON.parse(saveInfo);
        this._sum = BigInt(sum);
        this._addMultiples = {};
        this._cutMultiples = {};
        Object.keys(addMultiples).forEach(key => {
            this._addMultiples[key] = BigInt(addMultiples[key]);
        });
        Object.keys(cutMultiples).forEach(key => {
            this._cutMultiples[key] = BigInt(cutMultiples[key]);
        });
    }
}

import {SKILL_BOOK} from '@/game/units/skill';
import {JSON_with_bigInt} from '@/game/utensil';
import type {G} from "@/game/gameGenerator";
import type {SKILL, HeroInterface} from '@/game/game.d.ts';

const MSG_TYPE = {
    addGold: {
        color: 'rgb(172,172,12)',
        fontSize: 24,
        duration: 2000
    },
    attack: {
        color: 'rgb(255, 0, 0)',
        fontSize: 16,
        duration: 1500
    },
    normal: {
        color: 'rgb(0, 0, 0)',
        fontSize: 16,
        duration: 1500
    },

}
const checkActiveSkill = (item: SKILL, type: string, level: number) => {
    if (item.type === type && item.unlockLevel <= level) return item;
};


export class HGenerator {
    G: G;
    originInfo = {
        cost: 1n,
        atk: 0n,
        spd: 999999, // ms
    }

    name: string


    intro: string


    skills: SKILL[] = []


    atk_increment
    spd_increment

    activeTimes: number = 0


    atk


    spd


    atk_level = 1


    spd_level = 1


    atk_timer: any = null
    active: boolean

    incrementChange


    constructor(option: HeroInterface) {
        const {G, name, incrementChange} = option;
        this.name = name;
        this.intro = option.intro;
        this.incrementChange = incrementChange
        this.G = G;
        this.GET_SAVE_FILE(option);
        // this.CALC_DPS();

        this.originInfo.atk = option.atk
        this.originInfo.spd = option.spd
        this.originInfo.cost = option.cost

    }


    get level() {
        return this.atk_level + this.spd_level
    }

    get cost() {
        let sum = 0n
        let n = BigInt(this.level)
        for (let i = 0n; i < n; i++) {
            sum += i * this.originInfo.cost + (i ** 3n / (i + n))
        }
        return this.originInfo.cost + sum
    }

    get realCost() {
        return this.cost * (this.G.goldCoin.GOLD_CUT_MULTIPLE_NUMERATOR / this.G.goldCoin.getCutMultiple()) / 1000n
    }

    get originCost() {
        return this.cost
    }

    /**
     * 保存游戏
     * 获取所有关键数据，json化，保存到localStorage
     * @constructor
     */
    SAVE_IN_STORAGE() {
        const data = {
            name: this.name,
            intro: this.intro,
            atk: this.atk,
            spd: this.spd,
            active: this.active,
            atk_level: this.atk_level,
            spd_level: this.spd_level,
            activeTimes: this.activeTimes,
            lastAtkTimer: this.lastAtkTimer,
            skillId: this.skills.map(item => item.id)
        };
        localStorage.setItem(`${this.name}`, JSON_with_bigInt(data));

    }

    /**
     * 初始化英雄
     * 如果有本地数据，则获取本地数据，如果没有本地数据，则使用初始化信息
     * @param option
     * @constructor
     */
    GET_SAVE_FILE(option: HeroInterface) {
        let data: string | null = localStorage.getItem(`${this.name}`);
        if (data) {
            data = JSON.parse(data);
            // @ts-ignore
            data.skills = [];
            // @ts-ignore
            data.skillId.forEach(id => {
                // @ts-ignore
                data.skills.push(SKILL_BOOK[id](this.G));
            });
            this.INIT(Object.assign(option, data));
        } else {
            this.INIT(option);
        }
    }

    /**
     * 初始化数据，可能是保存的数据，也可以是新角色新数据
     * @param data
     * @constructor
     */
    INIT(data: any) {
        const {
            name, intro, atk, spd, unlockCost, skills, atk_increment, spd_increment,
            atk_level, spd_level, atk_timer, active, activeTimes, lastAtkTimer
        } = data;
        this.name = name;
        this.intro = intro;
        this.atk = BigInt(atk);
        this.spd = spd;
        this.skills = skills ?? [];
        this.activeTimes = activeTimes ?? 0
        this.atk_increment = atk_increment
        this.spd_increment = spd_increment

        this.atk_level = atk_level ?? 1;
        this.spd_level = spd_level ?? 1;
        this.atk_timer = atk_timer ?? null;

        this.lastAtkTimer = lastAtkTimer

        this.active = active ?? false;
        this.incrementChange?.()
    }

    RELOAD() {
        this.atk = this.originInfo.atk
        this.spd = this.originInfo.spd
        this.active = false
        clearTimeout(this.atk_timer)
        this.atk_level = 1;
        this.spd_level = 1;

        // 重置完后立即保存一次数据
        this.SAVE_IN_STORAGE()
    }

    SEND_MSG(msg: string, type: 'addGold' | 'attack' | 'normal' | {
        color: string,
        fontSize: number,
        duration?: number
    } = 'normal', options: {
        color?: string, fontSize?: number, duration?: number
    } = {}) {
        if (this.G.closeMSG) return;
        if (!this.G.textAnimation) return
        let opt = null
        if (typeof type === 'string') {
            opt = MSG_TYPE[type]
        } else {
            opt = type
        }
        opt.color = options.color ?? opt.color
        opt.fontSize = options.fontSize ?? opt.fontSize
        opt.duration = options.duration ?? opt.duration
        this.G.textAnimation.drawFloatingText(msg, opt)
    }

    isEnoughGoldCoin(withoutCost: boolean) {
        const isReject = !withoutCost && !this.G.goldCoin.isEnough(this.realCost)
        if (isReject) {
            console.log('金币不足')
            // TODO: 需要弹出提醒金币不够
            return false
        }
        return true
    }

    getCurrentSPDIncrement(level?: number): number {
        let l = level ?? this.spd_level;
        return this.spd_increment(l)
    }

    getCurrentATKIncrement(level?: number): bigint {
        let l = level ?? this.atk_level;
        return this.atk_increment(l)
    }

    /**
     * 设置金币，
     * 接受一个bigint类型的数字，正数为增加，负数为减少
     * 会触发该士兵的 before_append_gold 和 before_invest_gold技能，技能结果将直接加到num上
     * @param num
     * @constructor
     */
    SET_GOLD(num: bigint) {
        let res: bigint = 0n;
        if (num > 0n) {
            this.skills.forEach(item => {
                res += checkActiveSkill(item, 'before_append_gold', this.level)?.effect(this, {gold: num}) ?? 0n;
            });
        } else if (num < 0n) {
            this.skills.forEach(item => {
                res += checkActiveSkill(item, 'before_invest_gold', this.level)?.effect(this, {gold: num}) ?? 0n;
            });
        }
        let n = num + res;
        this.G.goldCoin.changeSum(n);
    }

    /**
     * 升级攻击力
     * 如果有withOutCost， 则不需要扣除金币，但是依旧会提高单位升级时所需花费
     * @param withoutCost
     * @param withoutLevelUp
     * @constructor
     */
    UPGRADE_ATK = ({withoutCost, withoutLevelUp} = {withoutCost: false, withoutLevelUp: false}) => {
        if (!this.active) {
            throw new Error('no active ,cannot UPGRADE !');
            return;
        }
        // 检查金币是否足够
        if (!this.isEnoughGoldCoin(withoutCost)) return
        // 如果不是免费升级，则扣除金币
        if (!withoutCost) this.SET_GOLD(this.realCost * -1n);
        this.atk_level += withoutLevelUp ? 0 : 1;
        let n = this.getCurrentATKIncrement();
        this.skills.forEach((item) => {
            n += checkActiveSkill(item, 'before_upgrade_atk', this.level)?.effect(this) ?? 0n;
        });
        // 升级攻击力前 查看有什么遗物需要触发
        Object.values(this.G.memento_list.before_upgrade_atk).filter(item => item.num > 0).forEach(memento => {
            n += memento.effect({S: this, G: this.G});
        });
        this.atk += n;
        if (this.atk_level === 50) {
            this.atk = this.atk * 2n; // 攻击力升级到50级时，当前攻击力翻倍
        }
        if (this.atk_level === 100) {
            this.atk = this.atk * 2n; // 攻击力升级到100级时，当前攻击力翻 2 倍
        }
        this.skills.forEach((item) => {
            checkActiveSkill(item, 'after_upgrade_atk', this.level)?.effect(this);
        });
        this.skills.forEach((item) => {
            checkActiveSkill(item, 'after_upgrade', this.level)?.effect(this);
        });
        this.G.SAVE_IMMEDIATELY()
    };

    /**
     * 升级攻击速度
     * 如果有withOutCost， 则不需要扣除金币，但是依旧会提高单位升级时所需花费
     * @param withoutCost
     * @constructor
     */
    UPGRADE_SPD = ({withoutCost, withoutLevelUp} = {withoutCost: false, withoutLevelUp: false}) => {
        if (!this.active) {
            throw new Error('not active ,cannot UPGRADE !');
            return;
        }
        if (!this.isEnoughGoldCoin(withoutCost)) return
        if (!withoutCost) this.SET_GOLD(this.realCost * -1n); // 扣钱
        this.spd_level += withoutLevelUp ? 0 : 1;
        let n = this.getCurrentSPDIncrement(); // 查看这次要减少多少攻击间隔
        this.skills.forEach((item) => { // 升级攻击间隔前看有什么技能需要触发
            n += checkActiveSkill(item, 'before_upgrade_spd', this.level)?.effect(this) ?? 0;
        });
        // 升级攻击间隔前 查看有什么遗物需要触发
        Object.values(this.G.memento_list.before_upgrade_spd).filter(item => item.num > 0).forEach(memento => {
            n += memento.effect({S: this, G: this.G});
        });
        // 看降低后的攻击间隔是否小于 最小允许的攻击间隔，如果小于，则最低给与 允许的最小 的攻击间隔
        const res = this.spd - n;
        let maxSpd = 220;
        // 查看有没有攻击间隔相关遗物，如果有，则提高最大攻击间隔
        maxSpd += this.G.memento_list?.swift_gloves.effect({S: this, G: this.G}) ?? 0
        this.spd = res < maxSpd ? maxSpd : res;


        // 精修攻击速度，打出去的伤害怎么的也会变高吧？
        // 攻速50后，每次升级提升对应攻击增长0.1的攻击力,这种增加不会触发升级攻击力相关技能
        if (this.spd_level > 50) {
            let n = this.getCurrentATKIncrement(this.spd_level);
            n = n / 10n;
            this.atk += n;
        } else if (this.spd_level > 100) {
            // 超过100级攻速后，每次提升的攻击量提高到 0.5
            let n = this.getCurrentATKIncrement(this.spd_level);
            n = n / 5n;
            this.atk += n;
        }
        this.skills.forEach((item) => {
            checkActiveSkill(item, 'after_upgrade', this.level)?.effect(this);
        });
        this.G.SAVE_IMMEDIATELY()

    };

    ATK_IMMEDIATELY() {
        let res = this.atk;
        Object.values(this.G.memento_list.before_atk).filter(item => item.num > 0).forEach(item => {
            res += item.effect(this);
        })
        this.skills.forEach((item) => {
            // 检查攻击前触发的技能，并执行技能效果，将技能结果加到攻击力上
            res += checkActiveSkill(item, 'before_atk', this.level)?.effect(this) ?? 0n;
        });
        this.G.target().changeHp(res * -1n);

        // // 攻击后获取金币
        // this.SET_GOLD(res);
        // 攻击后由boss爆金币， 技能额外金币由 after_atk 触发

        // 显示攻击信息
        this.SEND_MSG(res, 'attack')
        // 攻击后触发的技能（效果）
        this.skills.forEach((item) => {
            // if (item.type === '' && item.unlockLevel <= this.level()) res += item.effect()
            checkActiveSkill(item, 'after_atk', this.level)?.effect(this, {
                atkRes: res
            })
        });
    }

    /**
     * 自动攻击逻辑：记录第一次攻击（购买）时的时间戳，（lastAtkTimer 0 => timestamp)
     * 每次 requestAnimationFrame 时，调用所有 hero 的atk， 在 atk 中判断，
     * (timestamp - lastAtkTimer) / this.spd = n  >= 1 时， 则调用立即攻击 n 次， 且 lastAtkTimer = lastAtkTimer + n * this.spd
     * @private
     */
    lastAtkTimer = 0 // 需要被存储
    ATK(timestamp: number) {
        if (!this.lastAtkTimer) {
            this.lastAtkTimer = timestamp;
            this.ATK_IMMEDIATELY()
            return;
        }
        let n = Math.floor((timestamp - this.lastAtkTimer) / this.spd);
        if (n >= 1) {
            for (let i = 0; i < n; i++) {
                this.ATK_IMMEDIATELY()
            }
            this.lastAtkTimer = this.lastAtkTimer + n * this.spd;
        }
    }

    UNLOCK() {
        if (!this.G.goldCoin.isEnough(this.realCost)) {
            // TODO: 需要弹出提醒金币不够
            return false;
        }
        this.SET_GOLD(this.realCost * -1n);
        this.activeTimes += 1;
        this.active = true;
        this.incrementChange?.()
        // this.ATK(0);
        this.ATK_IMMEDIATELY()
    }

}


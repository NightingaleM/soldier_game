import {SKILL_BOOK} from '@/game/units/skill';
import {JSON_with_bigInt} from '@/game/utensil';
import {SKILL, SoldierInterface} from '@/game/game.d.ts';

const CostSequenceGenerator = (initialValue) => {
    return function () {
        let sum = 0n;
        let n = BigInt(this.level())
        for (let i = 0n; i < n; i++) {
            sum += i * initialValue + (i ** 3n / (i + n))
        }
        return initialValue + sum;
    };
};


const checkActiveSkill = (item: SKILL, type: string, level: number) => {
    if (item.type === type && item.unlockLevel <= level) return item;
};


export class SoldierGenerator {
    // 全局游戏实例
    G;
    unlockCost: bigint;
    active: boolean = false;
    name;
    intro;
    atk;
    spd;
    skills: SKILL[] = [];
    // 攻击增长量，是个数组，不同阶段有不同的增长率
    atk_increment;
    // 速度增长量，如攻击力增长
    spd_increment;
    atk_level = 1;
    spd_level = 1;
    // 攻击间隔计时器
    atk_timer: any = null;
    // 伤害缓存（用于计算DPS）
    finally_dmg_list: { t: number, dmg: bigint }[] = [];
    // DPS
    DPS: bigint = 0n;
    // 花费，根据 unlockCost 和 等级计算。
    cost: any;

    msgRef: any = null;
    activeTimes: number = 0;

    constructor(option: SoldierInterface) {
        const {G, name} = option;
        this.name = name;
        this.G = G;
        this.GET_SAVE_FILE(option);
        this.cost = CostSequenceGenerator(this.unlockCost);
        this.CALC_DPS();
        setTimeout(() => {
            this.msgRef = document.querySelector(`#${this.name} .msg-box`)
            if (this.msgRef) {
                this.msgRef.addEventListener('animationend', event => {
                    this.msgRef.removeChild(event.target);
                })
            }
        }, 1000)
    }

    /**
     * 保存游戏
     * 获取所有关键数据，json化，保存到localStorage
     * @constructor
     */
    SAVE_IN_STORAGE() {
        const {
            name, intro, atk, spd, unlockCost, skills,
            atk_level, spd_level, active, activeTimes
        } = this;
        const data = {
            name, intro, atk, spd, unlockCost, active, atk_level,
            spd_level, activeTimes, skillId: skills.map(item => item.id)
        };
        localStorage.setItem(`${name}`, JSON_with_bigInt(data));

    }

    /**
     * 初始化英雄
     * 如果有本地数据，则获取本地数据，如果没有本地数据，则使用初始化信息
     * @param option
     * @constructor
     */
    GET_SAVE_FILE(option) {
        let data: string | object = localStorage.getItem(`${this.name}`);
        if (data && typeof data === 'string') {
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
    INIT(data: object) {
        const {
            name, intro, atk, spd, unlockCost, skills, atk_increment, spd_increment,
            atk_level, spd_level, atk_timer, active
        } = data;
        this.name = name;
        this.intro = intro;
        this.atk = BigInt(atk);
        this.spd = spd;
        this.skills = skills ?? [];
        this.atk_increment = atk_increment
        this.spd_increment = spd_increment;
        this.unlockCost = BigInt(unlockCost);

        this.atk_level = atk_level ?? 1;
        this.spd_level = spd_level ?? 1;
        this.atk_timer = atk_timer ?? null;

        this.active = active ?? false;
    }


    /**
     * 计算离线收益
     * 至少离线30秒才计算离线收益
     * 离线收益有最长离线收益时间，可以有不同的途径来提高这个离线收益时间
     * @constructor
     */
    CALC_OFFLINE_INCOME() {
        if (!this.G.time) return;
        if (!this.active) return;
        let time = new Date().getTime();
        let gap = time - this.G.time;
        gap = gap > this.G.offline_income.getMaxTime() ? this.G.offline_income.getMaxTime() : gap;
        if (gap > (30 * 1000)) { // 离线至少30秒才开始计算离线收益
            const {spd} = this;
            let times = Math.ceil((gap / spd) * this.G.offline_income.getOfflineIncome()); // 离线收益需要乘以一个系数，TODO：后续提供提高离线收益途径
            console.log(`${this.name} - 计算离线收益中…… - 离线时长 ${gap / (1000 * 60)}分钟 - 预计可攻击${times}次`);
            while (times) {
                this.ATK_IMMEDIATELY();
                times--;
            }
        }
    }


    level() {
        return this.spd_level + this.atk_level;
    }

    // 真实的花费
    realCost() {
        return this.cost() * (this.G.goldCoin.GOLD_CUT_MULTIPLE_NUMERATOR / this.G.goldCoin.getCutMultiple()) / 1000n
    }

    UNLOCK() {
        if (!this.G.goldCoin.isEnough(this.cost())) {
            // TODO: 需要弹出提醒金币不够
            return false;
        }
        this.SET_GOLD(this.cost() * -1n);
        this.activeTimes += 1;
        this.ATK();
    }


    ATK() {
        this.active = true;
        this.ATK_NEXT();
    }

    ATK_IMMEDIATELY() {
        let res = this.atk;
        Object.values(this.G.memento_list.before_atk).filter(item => item.num > 0).forEach(item => {
            res += item.effect(this);
        })
        this.skills.forEach((item) => {
            // 检查攻击前触发的技能，并执行技能效果，将技能结果加到攻击力上
            res += checkActiveSkill(item, 'before_atk', this.level())?.effect(this) ?? 0n;
        });
        this.SET_FinallyDmg(res);
        this.G.target().changeHp(res * -1n);

        // // 攻击后获取金币
        // this.SET_GOLD(res);
        // 攻击后由boss爆金币， 技能额外金币由 after_atk 触发

        // 显示攻击信息
        this.SEND_MSG(res)
        // 攻击后触发的技能（效果）
        this.skills.forEach((item) => {
            // if (item.type === '' && item.unlockLevel <= this.level()) res += item.effect()
            checkActiveSkill(item, 'after_atk', this.level())?.effect(this, {
                atkRes: res
            })
        });
    }

    ATK_NEXT() {
        this.atk_timer = setTimeout(() => {
            this.ATK_IMMEDIATELY();
            this.ATK_NEXT();
        }, this.spd);
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
                res += checkActiveSkill(item, 'before_append_gold', this.level())?.effect(this, {gold: num}) ?? 0n;
            });
        } else if (num < 0n) {
            this.skills.forEach(item => {
                res += checkActiveSkill(item, 'before_invest_gold', this.level())?.effect(this, {gold: num}) ?? 0n;
            });
        }
        let n = num + res;
        this.G.goldCoin.changeSum(n);
    }

    SET_FinallyDmg(number: bigint) {
        let T = new Date().getTime();
        this.finally_dmg_list.push({t: T, dmg: number});
        let l = this.finally_dmg_list.length;
        for (let i = l - 1; i >= 0; i--) {
            const {t, dmg} = this.finally_dmg_list[i];
            if (T - t > 10000) {
                this.finally_dmg_list.splice(0, i + 1);
                break;
            }
        }

    }

    getCurrentSPDIncrement(level?: number): number {
        let l = level ?? this.spd_level;
        return this.spd_increment(l)
    }

    getCurrentATKIncrement(level?: number): bigint {
        let l = level ?? this.atk_level;
        return this.atk_increment(l)
    }

    isEnoughGoldCoin(withoutCost: boolean) {
        const isReject = !withoutCost && !this.G.goldCoin.isEnough(this.cost())
        if (isReject) {
            console.log('金币不足')
            // TODO: 需要弹出提醒金币不够
            return false
        }
        return true
    }

    /**
     * 升级攻击力
     * 如果有withOutCost， 则不需要扣除金币，但是依旧会提高单位升级时所需花费
     * @param withoutCost
     * @param withoutLevelUp
     * @constructor
     */
    UPGRADE_ATK = ({
                       withoutCost, withoutLevelUp
                   } = {
        withoutCost: false, withoutLevelUp: false
    }) => {
        if (!this.active) {
            throw new Error('no active ,cannot UPGRADE !');
            return;
        }
        // 检查金币是否足够
        if (!this.isEnoughGoldCoin(withoutCost)) return
        // 如果不是免费升级，则扣除金币
        if (!withoutCost) this.SET_GOLD(this.cost() * -1n);
        this.atk_level += withoutLevelUp ? 0 : 1;
        let n = this.getCurrentATKIncrement();
        this.skills.forEach((item) => {
            n += checkActiveSkill(item, 'before_upgrade_atk', this.level())?.effect(this) ?? 0n;
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
            checkActiveSkill(item, 'after_upgrade_atk', this.level())?.effect(this);
        });
        this.skills.forEach((item) => {
            checkActiveSkill(item, 'after_upgrade', this.level())?.effect(this);
        });
    };

    /**
     * 升级攻击速度
     * 如果有withOutCost， 则不需要扣除金币，但是依旧会提高单位升级时所需花费
     * @param withoutCost
     * @constructor
     */
    UPGRADE_SPD = ({
                       withoutCost, withoutLevelUp
                   } = {
        withoutCost: false, withoutLevelUp: false
    }) => {
        if (!this.active) {
            throw new Error('not active ,cannot UPGRADE !');
            return;
        }
        if (!this.isEnoughGoldCoin(withoutCost)) return
        if (!withoutCost) this.SET_GOLD(this.cost() * -1n); // 扣钱
        this.spd_level += withoutLevelUp ? 0 : 1;
        let n = this.getCurrentSPDIncrement(); // 查看这次要减少多少攻击间隔
        this.skills.forEach((item) => { // 升级攻击间隔前看有什么技能需要触发
            n += checkActiveSkill(item, 'before_upgrade_spd', this.level())?.effect(this) ?? 0;
        });
        // 升级攻击间隔前 查看有什么遗物需要触发
        Object.values(this.G.memento_list.before_upgrade_spd).filter(item => item.num > 0).forEach(memento => {
            n += memento.effect({S: this, G: this.G});
        });
        // 看降低后的攻击间隔是否小于 最小允许的攻击间隔，如果小于，则最低给与 允许的最小 的攻击间隔
        const res = this.spd - n;
        let maxSpd = 220;
        // 查看有没有攻击间隔相关遗物，如果有，则提高最大攻击间隔
        maxSpd += this.G.memento_list.swift_gloves.effect({S: this, G: this.G});
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
            checkActiveSkill(item, 'after_upgrade', this.level())?.effect(this);
        });
    };


    CALC_DPS() {
        setInterval(() => {
            const l = this.finally_dmg_list.length;
            const sum = this.finally_dmg_list.reduce((pre, cur, i) => pre + cur.dmg, 0n);
            this.DPS = sum / 10n;
        }, 1000);
    }

    SEND_MSG(msg: string) {
        if (this.G.closeMSG) return;
        if (!this.msgRef) return;
        const p = document.createElement('p');
        p.innerText = msg;
        p.classList.add('msg');
        this.msgRef.appendChild(p);
    }
}



import type {SKILL, SoldierGenerator} from '@/game/generators/SoldierGenerator';
import type {G} from '@/game/gameGenerator';
import {createProbabilityFunction} from '@/game/utensil';

const randomWithAgl = (restrain: number, promote: number, min: number, max: number, norm: number): boolean => {
    const r = Math.random() * 100;
    const short = (promote - restrain) / 16;
    norm += short;
    norm = norm > max ? max : norm;
    norm = norm < min ? min : norm;
    return r < norm;
};

const getRandomArbitrary = (min: number = 0, max: number = 1): bigint => {
    return BigInt(Math.ceil(Math.random() * (max - min) + min));
};

type SKILL_FN = {
    (n: number): SKILL
}
export const SKILL_BOOK: {
    [propName: string]: any
} = {
    exAtk: (G: G) => {
        return {
            id: 'exAtk',
            unlockLevel: 10,
            name: '额外攻击',
            intro: '升级攻击时额外获得0.6~1.6倍攻击。',
            type: 'before_upgrade_atk',
            effect: (S: SoldierGenerator) => {
                const atk = getRandomArbitrary(6, 16) * S.getCurrentATKIncrement() / 10n
                S.SEND_MSG(`+额外攻击：${atk}`);
                return atk
            }
        };
    },
    teachOtherAtk: (G: G) => {
        return {
            id: 'teachOtherAtk',
            unlockLevel: 50,
            name: '老师傅的教导',
            intro: '每次升级攻击，给其他已雇佣士兵额外增长老司机总攻击的百分之一。',
            type: 'after_upgrade_atk',
            effect: (S: SoldierGenerator) => {
                G.getActiveSoldier().forEach(item => {
                    const atk = S.atk / 100n;
                    item.atk += atk
                    item.SEND_MSG(`+老师傅的教导：${atk}`)
                });
            }
        };
    },
    allWordAtk: (G: G) => {
        return {
            id: 'allWordAtk',
            unlockLevel: 10,
            name: '领导全世界的一击',
            intro: '每次攻击有概率集合所有单位攻击进行全力一击。攻击等级越高概率越大，攻击速度等级越高概率越小。',
            type: 'before_atk',
            effect: (S: SoldierGenerator) => {
                let a = randomWithAgl(S.spd_level, S.atk_level, 1, 15, 3);
                if (a) {
                    return G.getActiveSoldier().reduce((pr, item) => {
                        return pr + item.atk;
                    }, 0n);
                }
                return 0n;

            }
        };
    },
    ferment: (G: G) => {
        return {
            id: 'ferment',
            unlockLevel: 5,
            name: '酝酿',
            intro: '攻击完一次后，需要回味和学习。每次攻击有概率增加5%攻击力，同时增加5%的攻击间隔',
            // TODO: 攻击间隔越长，触发概率越大，攻击间隔超过 100s后，无限接近 90%概率
            type: 'before_atk',
            effect: (S: SoldierGenerator) => {
                const fn = createProbabilityFunction({
                    probability: {
                        default: 0.3, max: 0.9, min: 0.1
                    },
                    reference: {
                        default: 5000, max: 100000, min: 500
                    },
                })
                if (Math.random() > fn(S.spd)) {
                    const atk = (S.atk * 5n / 100n);
                    const spd = parseInt(`${S.spd * 5 / 100}`);
                    S.atk += atk
                    S.spd += spd
                    S.SEND_MSG(`攻击里+${atk} \n 攻击间隔+${spd}`)
                }
            }
        };
    },
    fakeDJ: (G: G) => {
        return {
            id: 'fakeDJ',
            unlockLevel: 5,
            name: '打碟咯',
            intro: '带节奏，隔不久就要带次节奏，一天天叭叭哒哒的。每次攻击，额外造成 攻击力 * 攻击间隔的伤害。',
            type: 'before_atk',
            effect: (S: SoldierGenerator) => {
                const atk = S.atk * BigInt(S.spd) / 1000n;
                S.SEND_MSG(`打碟咯：${atk}`);
                return atk
            }
        };
    },
    equalityWord: (G: G) => {
        return {
            id: 'equalityWord',
            unlockLevel: 26,
            name: '共同成长',
            intro: '领袖带领队员们一起成长。每次攻击将几率扣除 1/激活英雄数量 的总金币，将所有已激活英雄的某个属性提升一级。',
            // DOC: 如果攻击等级越高，则升级攻击等级，反之亦然。
            // 若攻击等级和攻速等级相等，则触发概率降低，但若触发，则同时升级攻击等级和攻速等级
            // 该技能触发的升级可以正常触发各自英雄升级时触发的技能，同时也会提高主动升级时的花费
            type: 'after_atk',
            effect: (S: SoldierGenerator) => {
                if (Math.random() < 0.2 && Math.random() > 0.8) { // 4%
                    let s = G.getActiveSoldier();
                    G.goldCoin.changeSum(G.goldCoin.sum * (BigInt(s.length) - 1n) / BigInt(s.length))
                    let {atk_level, spd_level} = S;
                    if (atk_level === spd_level && Math.random() < 0.4) {  // 1.6%
                        s.forEach(item => {
                            item.UPGRADE_ATK({
                                withoutCost: true,
                                withoutLevel: true
                            });
                            item.UPGRADE_SPD({
                                withoutCost: true,
                                withoutLevel: true
                            });
                        });
                    } else {
                        let type = atk_level > spd_level ? 'ATK' : 'SPD';
                        s.forEach(item => {
                            item[`UPGRADE_${type}`](true);
                        });

                    }
                }
            }
        };
    },
    commonProsperity: (G: G) => {
        return {
            id: 'commonProsperity',
            unlockLevel: 10,
            name: '共同富裕',
            intro: '领袖带领队员们一同富裕。提升 攻击力等级相关的金币获取效率，降低攻速等级相关的金币花费',
            type: 'after_upgrade',
            effect: (S: SoldierGenerator) => {
                G.gold.addMultiples['commonProsperity'] = BigInt(S.atk_level);
                G.gold.cutMultiples['commonProsperity'] = BigInt(S.spd_level);
            }
        };
    },
};

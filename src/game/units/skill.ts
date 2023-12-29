import type { SKILL, HeroGenerator } from '@/game/generators/HeroGenerator';
import type { G } from '@/game/gameGenerator';
import { createProbabilityFunction, random, randomWithAgl } from '@/game/utensil';


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
            effect: (S: HeroGenerator) => {
                const atk = random(6, 16) * S.getCurrentATKIncrement() / 10n
                S.SEND_MSG(`+额外攻击：${atk}`);
                return atk
            }
        };
    },
    teachOtherAtk: (G: G) => {
        return {
            id: 'teachOtherAtk',
            unlockLevel: 20,
            name: '老师傅的教导',
            intro: '每次升级攻击，给其他已雇佣士兵额外增长老司机总攻击的百分之一。',
            type: 'after_upgrade_atk',
            effect: (S: HeroGenerator) => {
                G.getActiveHero().forEach(item => {
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
            effect: (S: HeroGenerator) => {
                let a = randomWithAgl(S.spd_level, S.atk_level, 1, 15, 3);
                if (a) {
                    return G.getActiveHero().reduce((pr, item) => {
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
            intro: '攻击完一次后，需要回味和学习。每次攻击有概率增加2%攻击力，同时增加2%的攻击间隔',
            // TODO: 攻击间隔越长，触发概率越大，攻击间隔超过 100s后，无限接近 90%概率
            type: 'before_atk',
            effect: (S: HeroGenerator) => {
                const fn = createProbabilityFunction({
                    probability: {
                        default: 0.3, max: 0.9, min: 0.1
                    },
                    reference: {
                        default: 5000, max: 100000, min: 500
                    },
                })
                if (Math.random() > fn(S.spd)) {
                    const atk = (S.atk * 2n / 100n);
                    const spd = parseInt(`${S.spd * 2 / 100}`);
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
            effect: (S: HeroGenerator) => {
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
            intro: `领袖带领队员们一起成长。每次攻击将几率扣除 1/激活英雄数量 的总金币，将所有已激活英雄的某个属性提升一级。`,
            // DOC: 如果攻击等级越高，则升级攻击等级，反之亦然。
            // 若攻击等级和攻速等级相等，则触发概率降低，但若触发，则同时升级攻击等级和攻速等级
            // 该技能触发的升级可以正常触发各自英雄升级时触发的技能，同时也会提高主动升级时的花费
            type: 'after_atk',
            effect: (S: HeroGenerator) => {
                if (Math.random() < 0.2 && Math.random() > 0.8) { // 4%
                    let s = G.getActiveHero();
                    G.goldCoin.changeSum(G.goldCoin.sum * (BigInt(s.length) - 1n) / BigInt(s.length))
                    let { atk_level, spd_level } = S;
                    if (atk_level === spd_level && Math.random() < 0.4) {  // 1.6%
                        s.forEach(item => {
                            item.UPGRADE_ATK({
                                withoutCost: true,
                                withoutLevelUp: true
                            });
                            item.UPGRADE_SPD({
                                withoutCost: true,
                                withoutLevelUp: true
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
            effect: (S: HeroGenerator) => {
                G.goldCoin.addMultiples({ name: 'commonProsperity', value: BigInt(S.atk_level) })
                G.goldCoin.cutMultiples({ name: 'commonProsperity', value: BigInt(S.spd_level) })
            }
        };
    },
    // 小红包
    smallRedPacket: (G: G) => {
        return {
            id: 'smallRedPacket',
            unlockLevel: 2,
            name: '小红包',
            intro: '每挂机一分钟有机会偶遇一名已经激活得英雄，获得见面红包，金额为英雄的攻击力。',
            type: 'global',
            effect: ({ skill, G, S }) => {
                const fn = () => {
                    G.timers[`${S.name}_${skill.id}`] = setTimeout(() => {
                        if (Math.random() < 0.7) {
                            const s = G.getActiveHero().filter(item => item.name !== S.name);
                            const index = Math.floor(Math.random() * s.length);
                            const atk = s[index].atk;
                            G.goldCoin.changeSum(atk);
                            S.SEND_MSG(`+小红包：${atk}`);
                        }
                        fn();
                    }, 60 * 1000)
                }
                fn()
            }
        }
    },
    // 新年红包
    newYearRedPacket: (G: G) => {
        return {
            id: 'newYearRedPacket',
            unlockLevel: 2,
            name: '新年红包',
            intro: '每挂机5分钟，获取新年红包，金额为所有等级比自己高得英雄攻击力的总和。',
            type: 'global',
            effect: ({ skill, G, S }) => {
                const fn = () => {
                    G.timers[`${S.name}_${skill.id}`] = setTimeout(() => {
                        const sum = G.getActiveHero()
                            .filter(item => (item.name !== S.name && item.level() > S.level()))
                            .reduce((pr, item) => {
                                return pr + item.atk;
                            }, 0n)
                        G.goldCoin.changeSum(sum);
                        S.SEND_MSG(`+新年红包：${sum}`);
                        fn();
                    }, 5 * 60 * 1000)
                }
                fn()
            }
        }
    },
    // 好狗
    strongDog: (G: G) => {
        return {
            id: 'strongDog',
            unlockLevel: 2,
            name: "好狗",
            intro: "好强的狗！每次攻击额外造成额外伤害。",
            type: "before_atk",
            effect: (S) => {
                const atk = S.atk * BigInt((S.level() / 50))
                S.SEND_MSG(`好狗！：${atk}`)
                return atk
            }
        }
    },
    // 乖狗
    goodDog: (G: G) => {
        return {
            id: 'goodDog',
            unlockLevel: 2,
            name: "乖狗",
            intro: "乖狗狗，每次攻击获得额外金币。",
            type: "after_atk",
            effect: (S, { atkRes }) => {
                const gold = atkRes * BigInt((S.level() / 150))
                S.SEND_MSG(`+乖狗：${gold}`)
                G.goldCoin.changeSum(gold)
            }
        }
    },
    superFast: (G: G) => {
        return {
            id: 'superFast',
            unlockLevel: 2,
            name: "攻速超快",
            intro: "每次攻速额外降低0.02s的攻击间隔。",
            type: "before_upgrade_spd",
            effect: (S) => {
                return 20
            }
        }
    },
    ascendantCombo: (G: G) => {
        return {
            id: 'superFast',
            unlockLevel: 2,
            name: "攻击强化",
            intro: "每次攻击都能提高攻击等级相关的攻击力。",
            type: "after_atk",
            effect: (S, { atkRes }) => {
                S.atk += BigInt(S.atk_level)
            }
        }
    },
};

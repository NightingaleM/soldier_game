import { HeroGenerator } from '@/game/generators/HeroGenerator';
import { SKILL_BOOK } from '@/game/units/skill';
import { G } from '@/game/gameGenerator';
import { createBigInt as BG, spdSequenceGenerator, atkSequenceGenerator } from '@/game/utensil';


// 小孩
export const child = (REF_G: G) => (new HeroGenerator({
    G: REF_G,
    unlockCost: 1n,
    name: '小孩',
    intro: '小孩，活力旺盛的小孩,可以成长的小孩',
    atk: 1n,
    atk_increment: atkSequenceGenerator(1n),
    spd: 5000,
    spd_increment: spdSequenceGenerator(50),
    skills: [SKILL_BOOK['smallRedPacket'](REF_G), SKILL_BOOK['newYearRedPacket'](REF_G)],
    incrementChange() {
        // 修改 atk\spd 的成长函数，在 UNLOCK、INIT 阶段调用
        const activeTimes = this.activeTimes
        this.atk_increment = atkSequenceGenerator(activeTimes || 1n)
    }
}));

export const luckBoy = (REF_G: G) => (new HeroGenerator({
    G: REF_G,
    unlockCost: 999n,
    name: '普通的男人',
    intro: '普通，但是幸运的男人。',
    atk: 111n,
    atk_increment: atkSequenceGenerator(122n),
    spd: 5000,
    spd_increment: spdSequenceGenerator(30),
    skills: [SKILL_BOOK['exAtk'](REF_G)]
}));


export const luckGirl = (REF_G: G) => (new HeroGenerator({
    G: REF_G,
    unlockCost: BG([1, 3]),
    name: '普通的女人',
    intro: '普通，但是幸运的女人。',
    atk: 99n,
    atk_increment: atkSequenceGenerator(103n),
    spd: 2500,
    spd_increment: spdSequenceGenerator(40),
    skills: [SKILL_BOOK['allWordAtk'](REF_G)]
}));

export const Dog = (REF_G: G) => (new HeroGenerator({
    G: REF_G,
    unlockCost: BG([3, 4]),
    name: '中华田园犬',
    intro: '忠实可靠。',
    atk: BG([5, 3]),
    atk_increment: atkSequenceGenerator(5333n),
    spd: 5000,
    spd_increment: spdSequenceGenerator(30),
    skills: [SKILL_BOOK['goodDog'](REF_G), SKILL_BOOK['strongDog'](REF_G)]
}));

export const Cat = (REF_G: G) => (new HeroGenerator({
    G: REF_G,
    unlockCost: BG([1, 5]),
    name: '狸花猫',
    intro: '又野又强。',
    atk: BG([1, 4]),
    atk_increment: atkSequenceGenerator(12222n),
    spd: 2500,
    spd_increment: spdSequenceGenerator(60),
    skills: [SKILL_BOOK['superFast'](REF_G), SKILL_BOOK['ascendantCombo'](REF_G)]
}));


export const oldTeacher = (REF_G: G) => (new HeroGenerator({
    G: REF_G,
    unlockCost: BG([76, 5]),
    name: '老师傅',
    intro: '知识丰富的老司机，成长到一定阶段愿意向其他士兵倾囊相授。',
    atk: BG([6, 5]),
    atk_increment: atkSequenceGenerator(BG([655, 3])),
    spd: 4000,
    spd_increment: spdSequenceGenerator(40),
    skills: [SKILL_BOOK['teachOtherAtk'](REF_G)]
}));


export const fakerJD = (REF_G: G) => (new HeroGenerator({
    G: REF_G,
    unlockCost: BG([9, 7]),
    name: 'DJ',
    intro: '天天打碟，烦不烦啊？',
    atk: BG([1, 6]),
    atk_increment: atkSequenceGenerator(BG([111, 4])),
    spd: 2000,
    spd_increment: spdSequenceGenerator(40),
    skills: [SKILL_BOOK['ferment'](REF_G), SKILL_BOOK['fakeDJ'](REF_G)]
}));

export const chief = (REF_G: G) => (new HeroGenerator({
    G: REF_G,
    unlockCost: BG([1, 15]),
    name: '领袖',
    intro: '带我们一起走向胜利。',
    atk: BG([5, 14]),
    atk_increment: atkSequenceGenerator(BG([7, 14])),
    spd: 10000,
    spd_increment: spdSequenceGenerator(40),
    skills: [SKILL_BOOK['equalityWord'](REF_G), SKILL_BOOK['commonProsperity'](REF_G)]
}));

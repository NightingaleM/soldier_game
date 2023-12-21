import {SoldierGenerator} from '@/game/generators/SoldierGenerator';
import {SKILL_BOOK} from '@/game/units/skill';
import {G} from '@/game/gameGenerator';
import {createBigInt as BG} from '@/game/utensil';


const spdSequenceGenerator = (initialValue) => {
    let sequence = [initialValue];
    return function (level) {
        if (level <= sequence.length) {
            return sequence[level - 1];
        }
        for (let i = sequence.length + 1; i <= level; i++) {
            sequence.push(sequence[i - 2] * (1 - 0.01 * (i - 1)));
        }
        return sequence[level - 1];
    };
};

const atkSequenceGenerator = (initialValue: bigint) => {
    let sequence = [initialValue]
    return function (level) {
        if (level <= sequence.length) {
            return sequence[level - 1];
        }
        for (let i = sequence.length + 1; i <= level; i++) {
            sequence.push(
                ((sequence[i - 3] || initialValue)
                    +
                    sequence[i - 2]) / 2n
                +
                BigInt(Math.ceil(Number(initialValue) * (i / 27)))
            );
        }
        // 暂时抑制攻击增长
        // const ex = 1n + BigInt(Math.floor(level / 50));
        return sequence[level - 1]
    }
}


// 小孩
// 获取小孩的历史数据，为了实现每次重生小孩攻击力增长系数的增加
let childSaveData = localStorage.getItem('小孩');
let childAtkIncrement = atkSequenceGenerator(1n)
let childActiveTimes = 0
if (childSaveData) {
    const {activeTimes} = JSON.parse(childSaveData);
    childActiveTimes = activeTimes
    childAtkIncrement = atkSequenceGenerator(childActiveTimes ? BigInt(childActiveTimes) : 1n)
}
export const child = (REF_G: G) => (new SoldierGenerator({
    G: REF_G,
    unlockCost: 1n,
    name: '小孩',
    intro: '小孩，活力旺盛的小孩,可以成长的小孩',
    atk: childActiveTimes ? BigInt(childActiveTimes) : 1n,
    atk_increment: childAtkIncrement,
    spd: 5000,
    spd_increment: spdSequenceGenerator(50),
    // TODO: atk_increment 根据激活次数来提高基础值，如，第二次重生，则基础值为2。
    skills: [SKILL_BOOK['smallRedPacket'](REF_G), SKILL_BOOK['newYearRedPacket'](REF_G)]
}));

export const luckBoy = (REF_G: G) => (new SoldierGenerator({
    G: REF_G,
    unlockCost: 100n,
    name: '普通的男人',
    intro: '普通，但是幸运的男人。',
    atk: 10n,
    atk_increment: atkSequenceGenerator(10n),
    spd: 5000,
    spd_increment: spdSequenceGenerator(30),
    skills: [SKILL_BOOK['exAtk'](REF_G)]
}));


export const luckGirl = (REF_G: G) => (new SoldierGenerator({
    G: REF_G,
    unlockCost: 100n,
    name: '普通的女人',
    intro: '普通，但是幸运的女人。',
    atk: 5n,
    atk_increment: atkSequenceGenerator(8n),
    spd: 2500,
    spd_increment: spdSequenceGenerator(40),
    skills: [SKILL_BOOK['allWordAtk'](REF_G)]
}));


export const oldTeacher = (REF_G: G) => (new SoldierGenerator({
    G: REF_G,
    unlockCost: BG([1, 4]),
    name: '老师傅',
    intro: '知识丰富的老司机，成长到一定阶段愿意向其他士兵倾囊相授。',
    atk: BG([1, 3]),
    atk_increment: atkSequenceGenerator(999n),
    spd: 2000,
    spd_increment: spdSequenceGenerator(40),
    skills: [SKILL_BOOK['teachOtherAtk'](REF_G)]
}));


export const fakerJD = (REF_G: G) => (new SoldierGenerator({
    G: REF_G,
    unlockCost: BG([1, 6]),
    name: 'DJ',
    intro: '天天打碟，烦不烦啊？',
    atk: BG([3, 3]),
    atk_increment: atkSequenceGenerator(1989n),
    spd: 2000,
    spd_increment: spdSequenceGenerator(40),
    skills: [SKILL_BOOK['ferment'](REF_G), SKILL_BOOK['fakeDJ'](REF_G)]
}));

export const chief = (REF_G: G) => (new SoldierGenerator({
    G: REF_G,
    unlockCost: BG([1,12]),
    name: '领袖',
    intro: '带我们一起走向胜利。',
    atk: BG([5, 11]),
    atk_increment: atkSequenceGenerator(BG([7, 11])),
    spd: 10000,
    spd_increment: spdSequenceGenerator(40),
    skills: [SKILL_BOOK['equalityWord'](REF_G), SKILL_BOOK['commonProsperity'](REF_G)]
}));

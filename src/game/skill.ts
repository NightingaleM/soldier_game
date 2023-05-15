import type {SKILL, SoldierGenerator} from '@/game/soldierGenerator';
import type {G} from '@/game/gameGenerator';


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
      type: 'before_upload_atk',
      effect: (S: SoldierGenerator) => {
        return getRandomArbitrary(0.6, 2) * S.getCurrentATKIncrement();

      }
    };
  },
  teachOtherAtk: (G: G) => {
    return {
      id: 'teachOtherAtk',
      unlockLevel: 50,
      name: '老师傅的教导',
      intro: '每次升级攻击，给其他已雇佣士兵额外增长老司机总攻击的百分之一。',
      type: 'after_upload_atk',
      effect: (S: SoldierGenerator) => {
        G.getActiveSoldier().forEach(item => {
          item.atk += S.atk / 100n;
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
      type: 'before_atk',
      effect: (S: SoldierGenerator) => {
        if (Math.random() > 0.5) {
          S.atk += (S.atk * 5n / 100n);
          S.spd += parseInt(`${S.spd * 5 / 100}`);
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
        return S.atk * BigInt(S.spd) / 1000n;
      }
    };
  }
};

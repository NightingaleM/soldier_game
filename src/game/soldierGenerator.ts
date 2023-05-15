// export interface AtkIncrementFn {
//     (level: number): number;
// }
//
// export interface IntervalIncrementFn {
//     (level: number): number
// }

import {SKILL_BOOK} from '@/game/skill';
import {JSON_with_bigInt} from '@/game/unit';

export interface SKILL {
  id: string,
  unlockLevel: number,
  name: string,
  intro: string,
  type: 'before_atk' | 'before_upload_atk' | 'before_upload_spd' | 'after_upload_atk',
  effect: any
}

export interface GoldTargetInterface {
  sum: bigint,
  addMultiple: bigint
  cutMultiple: bigint
}

export interface SoldierInterface {
  G: object, // 全局游戏实例
  name: string, // 名称
  intro: string, // 简介
  atk: bigint, // 当前攻击力
  atk_increment: any, // 攻击力增长，是个数组，不同阶段有不同的增长率
  spd: number, // 攻击频率，单位为毫秒
  spd_increment: any, // 速度增长，如攻击力增长
  cost: bigint, // 花费，购买时需要的金币，同时也是升级时所需花费，会逐步增长
  skills?: SKILL[] // 技能李彪
  GoldTarget: GoldTargetInterface // 全局的金币对象
}


const checkActiveSkill = (item: SKILL, type: string, level: number) => {

  if (item.type === type && item.unlockLevel <= level) return item;
};

const COST_INCREMENT_RATIO = 1.2



export class SoldierGenerator {
  G; // 全局游戏实例
  active: boolean = false;
  name;
  intro;
  atk;
  spd;
  skills: SKILL[] = [];
  atk_increment;
  spd_increment;
  atk_level = 1;
  spd_level = 1;
  atk_timer: any = null;
  TARGET: any;
  GoldTarget: GoldTargetInterface;
  finally_dmg_list: { t: number, dmg: bigint }[] = [];
  ms: bigint = 0n;
  cost: bigint;

  constructor(option: SoldierInterface) {
    const {GoldTarget, G, name} = option;
    this.name = name;
    this.G = G;
    this.GoldTarget = GoldTarget;
    this.GET_SAVE_FILE(option);

    this.CALC_DPS();
  }

  SAVE_IN_STORAGE() {
    const {
      name, intro, atk, spd, cost, skills, atk_increment, spd_increment,
      atk_level, spd_level, active
    } = this;
    const data = {
      name, intro, atk, spd, cost, active, atk_level, spd_level,
      atk_increment, spd_increment, skillId: skills.map(item => item.id)
    };
    localStorage.setItem(`${name}`, JSON_with_bigInt(data));

  }

  GET_SAVE_FILE(option) {
    let data: string | object = localStorage.getItem(`${this.name}`);
    if (data && typeof data === 'string') {
      data = JSON.parse(data);
      data.skills = [];
      data.skillId.forEach(id => {
        data.skills.push(SKILL_BOOK[id](this.G));
      });
      this.INIT(data);
    } else {
      this.INIT(option);
    }
  }

  INIT(data: object) {
    const {
      name, intro, atk, spd, cost, skills, atk_increment, spd_increment,
      atk_level, spd_level, atk_timer, active
    } = data;
    this.name = name;
    this.intro = intro;
    this.atk = BigInt(atk);
    this.spd = spd;
    this.skills = skills ?? [];
    this.atk_increment = atk_increment.map(item => BigInt(item));
    this.spd_increment = spd_increment;
    this.cost = BigInt(cost);

    this.atk_level = atk_level ?? 1;
    this.spd_level = spd_level ?? 1;
    this.atk_timer = atk_timer ?? null;

    this.active = active ?? false;
    if (active) {
      this.ATK(this.G.boss_list[this.G.currentBossIndex]);
    }
  }

  level() {
    return this.spd_level + this.atk_level;
  }

  ATK(target: any) {
    this.active = true;
    this.TARGET = target;
    this.ATK_NEXT();
  }

  ATK_NEXT() {
    this.atk_timer = setTimeout(() => {
      let res = this.atk;
      this.skills.forEach((item) => {
        // if (item.type === '' && item.unlockLevel <= this.level()) res += item.effect()
        res += checkActiveSkill(item, 'before_atk', this.level())?.effect(this) ?? 0n;
      });
      this.SET_FinallyDmg(res);
      // @ts-ignore
      this.TARGET.hp -= res;
      // 攻击后获取金币
      this.SET_GOLD(res);

      // 攻击后触发的技能（效果）
      this.skills.forEach((item) => {
        // if (item.type === '' && item.unlockLevel <= this.level()) res += item.effect()
        res += checkActiveSkill(item, 'after_atk', this.level())?.effect(this) ?? 0n;
      });
      this.ATK_NEXT();
    }, this.spd);
  }

  SET_GOLD(num: bigint) {
    const n = num > 0n ? num * (this.GoldTarget.addMultiple / 100n)
      : num * (this.GoldTarget.cutMultiple / 100n);
    this.GoldTarget.sum += n;
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
    return l > 50 ? l > 100 ? this[`spd_increment`][2] : this[`spd_increment`][1] : this[`spd_increment`][0];
  }

  getCurrentATKIncrement(level?: number): bigint {
    let l = level ?? this.atk_level;
    return l > 50 ? l > 100 ? this[`atk_increment`][2] : this[`atk_increment`][1] : this[`atk_increment`][0];
  }

  UPGRADE_ATK = () => {
    if (!this.active) {
      throw new Error('no active ,cannot UPGRADE !');
      return;
    }
    if ((this.GoldTarget.sum * this.GoldTarget.cutMultiple / 100n) < this.cost) {
      // TODO: 需要弹出提醒金币不够
      return;
    }
    this.SET_GOLD(this.cost * -1n);
    this.cost = this.cost * BigInt(`${1000 + this.level()}`) / 1000n;
    let n = this.getCurrentATKIncrement();
    this.skills.forEach((item) => {
      // if (item.type === 'before_upload_atk' && item.unlockLevel <= this.level()) n += item.effect(n)
      n += checkActiveSkill(item, 'before_upload_atk', this.level())?.effect(this) ?? 0n;
    });
    this.atk += n;
    this.atk_level += 1;
    if (this.atk_level === 50) {
      this.atk = this.atk * 2n; // 攻击力升级到50级时，当前攻击力翻倍
    }
    if (this.atk_level === 100) {
      this.atk = this.atk * 5n; // 攻击力升级到100级时，当前攻击力翻 5 倍
    }
    this.skills.forEach((item) => {
      // if (item.type === 'after_upload_atk' && item.unlockLevel <= this.level()) item.effect(this)
      checkActiveSkill(item, 'after_upload_atk', this.level())?.effect(this);
    });

  };

  UPGRADE_SPD = () => {
    if (!this.active) {
      throw new Error('no active ,cannot UPGRADE !');
      return;
    }
    if ((this.GoldTarget.sum * this.GoldTarget.cutMultiple / 100n) < this.cost) {
      // TODO: 需要弹出提醒金币不够
      return;
    }
    this.SET_GOLD(this.cost * -1n); // 扣钱
    this.cost = this.cost * BigInt(`${1000 + this.level()}`) / 1000n; // 涨价
    let n = this.getCurrentSPDIncrement(); // 查看这次要减少多少攻击间隔
    this.skills.forEach((item) => { // 升级攻击间隔前看有什么技能需要触发
      // if (item.type === 'before_upload_spd' && item.unlockLevel <= this.level()) n += item.effect(n)
      n += checkActiveSkill(item, 'before_upload_spd', this.level())?.effect(this) ?? 0;
    });
    // 看降低后的攻击间隔是否小于 20ms，如果小于，则最低给与 20ms 的攻击间隔
    const res = this.spd - n;
    this.spd = res < 20 ? 20 : res;
    this.spd_level += 1;
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
  };

  CALC_DPS() {
    setInterval(() => {
      const l = this.finally_dmg_list.length;
      const sum = this.finally_dmg_list.reduce((pre, cur, i) => pre + cur.dmg, 0n);
      this.ms = sum / 10n;
    }, 1000);
  }

}



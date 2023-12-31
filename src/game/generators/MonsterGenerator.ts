export class MonsterGenerator {
  G;
  deadTimes: number = 0;
  private _hp: bigint;
  originHp: bigint;
  aliveEffect: any;
  afterAttack: any;
  beforeAttack: any;
  beforeSetGold: any;
  afterDead: any;
  intro: string;
  name: string;
  img: string;
  images: string[];

  aliveEffectTimer: any;

  constructor(option) {
    const {
      name,
      hp,
      beforeAttack,
      afterAttack,
      afterDead,
      beforeSetGold,
      intro,
      G,
      aliveEffect,
      img,
      images,
    } = option;
    this.G = G;
    this.name = name;
    this._hp = hp;
    this.originHp = hp;
    this.intro = intro;
    this.beforeAttack = beforeAttack;
    this.beforeSetGold = beforeSetGold;
    this.afterAttack = afterAttack;
    this.afterDead = afterDead;
    this.aliveEffect = aliveEffect;
    this.LOAD_SAVE();
  }

  get hp() {
    return this._hp;
  }

  changeHp(atkRes) {
    let { finalDamage } = this.beforeAttack?.(this, this.G, { atkRes }) ?? {
      finalDamage: atkRes,
    };
    finalDamage = finalDamage === null ? atkRes : finalDamage;
    this._hp = this._hp + finalDamage;
    this.setGold(finalDamage);
    this.afterAttack?.(this, this.G, { atkRes });
    if (this._hp <= 0) {
      // 击杀了怪物
      this.deadTimes++;
      this.afterDead?.(this, { atkRes });

      clearTimeout(this.aliveEffectTimer);

      this.G.nextTarget();
    }
  }

  setGold(finalDamage) {
    const { goldValue } = this.beforeSetGold?.(finalDamage);
    this.G.goldCoin.changeSum(goldValue);
  }

  SAVE_IN_STORAGE() {
    const { name, deadTimes, _hp, originHp } = this;
    const saveInfo = {
      name,
      deadTimes: deadTimes.toString(),
      _hp: _hp.toString(),
      originHp: originHp.toString(),
    };
    localStorage.setItem(`sg_lsg_m_${name}`, JSON.stringify(saveInfo));
  }

  private LOAD_SAVE() {
    const saveInfo = localStorage.getItem(`sg_lsg_m_${this.name}`);
    if (!saveInfo) return;
    const { name, deadTimes, _hp, originHp } = JSON.parse(saveInfo);
    this.name = name;
    this.deadTimes = deadTimes;
    this._hp = BigInt(_hp);
    this.originHp = BigInt(originHp);
  }

  RELOAD() {
    this._hp = this.originHp;
    // 重置完后立即保存一次数据
    this.SAVE_IN_STORAGE();
  }
}

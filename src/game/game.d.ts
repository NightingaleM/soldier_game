export interface SKILL {
  id: string,
  unlockLevel: number,
  name: string,
  intro: string,
  type: 'before_atk' | 'before_upgrade_atk' | 'before_upgrade_spd' | 'after_upgrade_atk',
  effect: any
}

export interface GoldTargetInterface {
  sum: bigint,
  getAddMultiple: () => bigint
  getCutMultiple: () => bigint
  addMultiples: {[prop: string]: bigint}
  cutMultiples: {[prop: string]: bigint}
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


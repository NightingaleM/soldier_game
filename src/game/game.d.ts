import type { G } from "@/game/gameGenerator";
export interface SKILL {
  id: string,
  unlockLevel: number,
  name: string,
  intro: string,
  type: 'before_atk' | 'before_upgrade_atk' | 'before_upgrade_spd' | 'after_upgrade_atk',
  effect: any
}


export interface HeroInterface {
  G: G, // 全局游戏实例
  name: string, // 名称
  intro: string, // 简介
  atk: bigint, // 当前攻击力
  atk_increment: any, // 攻击力增长，是个数组，不同阶段有不同的增长率
  spd: number, // 攻击频率，单位为毫秒
  spd_increment: any, // 速度增长，如攻击力增长
  cost: bigint, // 解锁时所需要的花费
  skills?: SKILL[] // 技能列表
  incrementChange?  // 修改 atk\spd 的成长函数，在 UNLOCK、INIT 阶段调用
}


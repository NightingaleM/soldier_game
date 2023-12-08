export class BossGenerator {
    G;
    hp: bigint
    afterAttack: any
    beforeAttack: any
    afterDead: any

    constructor(option) {
        const {
            hp, beforeAttack, afterAttack, afterDead,
        } = option;
        this.hp = hp;
        this.beforeAttack = beforeAttack;
        this.afterAttack = afterAttack;
        this.afterDead = afterDead;

    }

    getBosses() {
    }
}
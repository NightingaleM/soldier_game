<script setup lang="ts">
import {RouterLink, RouterView} from 'vue-router';
import HelloWorld from './components/HelloWorld.vue';
</script>

<template>
  SNOOPY


</template>
<script setup lang="ts">
import {G} from '@/game/gameGenerator';
import {getCurrentInstance, reactive, ref} from 'vue';
import {GOLD_CUT_MULTIPLE_NUMERATOR, SoldierGenerator} from '@/game/soldierGenerator';

const internalInstance = getCurrentInstance();
// 操作数据后更新视图


const g = reactive(new G());
g.SET_REF_SELF(g);

const unlockSoldier = (soldier: SoldierGenerator) => {
  g.unlockSoldier(soldier);
};

const toUploadAtk = (item: any) => {
  item.UPGRADE_ATK();
  internalInstance?.ctx?.$forceUpdate();
};

const toUploadSpd = (item: any) => {
  item.UPGRADE_SPD();
  internalInstance?.ctx?.$forceUpdate();
};

</script>
<style scoped lang="less">
ul {
  li {
    background-color: var(--paper-deep-yellow);
    color: #000;
    padding: 1rem;
  }

  li.active {
    background-color: var(--paper-yellow);
  }
}
</style>

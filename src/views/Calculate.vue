<template>

  <div class="head">
    <h4 class="gold">{{ g.goldCoin.sum.toLocaleString() }}</h4>
    <!--    <span>x {{ g.gold.getAddMultiple() }}%</span>    -->
    <div class="boss-box">
      <h4>{{ g.target().hp.toLocaleString() }}</h4>
      <div class="boss-img">
<!--        <p class="name">{{g.target().name}}</p>-->
        <img src="/image/boss/dummy_1.png" alt="" @click="childAtk">
<!--        <p class="intro">{{g.target().intro}}</p>-->
      </div>
    </div>
  </div>

  <div class="content">
    <div v-if="currentContentType === 'hero-box'" class="hero-box">
      <ul>
        <li v-for="(item,key) in g.s_list"
            :class="[{unlock: item.active},{showing: currentShowingHeroName === item.name}]"
            @click="setCurrentShowingHeroName(item.name)"
            :id="item.name"
        >
          <div class="infos">
            <img src="" alt="">
            <div class="info-box">

              <h4>{{ item.name }} <span class="level">{{ item.level() }}级</span></h4>
              <p class="attr">攻击力：{{ item.atk.toLocaleString() }}</p>
              <p class="attr">攻击间隔：{{ (item.spd / 1000).toFixed(3) }}s</p>
              <div class="msg-box"></div>
              <button class="unlock" v-if="!item.active" @click.stop="unlockHero(item)">{{
                  item.cost().toLocaleString()
                }} - 解锁
              </button>
            </div>

          </div>
          <div class="option-skill-box">
            <template v-if="item.active">
              <div class="attr-option" @click.stop="toUploadAtk(item)">
                <p>
                  <span>Lv: {{ item.atk_level }}</span>
                  <span>升级攻击力 + {{ item.getCurrentATKIncrement().toLocaleString() }} </span>
                </p>
                <div class="cost">
                  升级花费：{{ item.realCost().toLocaleString() }}
                  <span>{{ item.cost().toLocaleString() }}</span>
                </div>
              </div>
              <div class="attr-option" @click.stop="toUploadSpd(item)">
                <p>
                  <span>Lv: {{ item.spd_level }}</span>
                  <span>升级攻击间隔 - {{ (item.getCurrentSPDIncrement() / 1000).toFixed(5) }} s</span>
                </p>
                <div class="cost">
                  升级花费：{{ item.realCost().toLocaleString() }}
                  <span>{{ item.cost().toLocaleString() }}</span>
                </div>
              </div>
            </template>
            <div v-for="skill in item.skills" :key="skill.name"
                 :class="['skill',{unlock: item.level() >= skill.unlockLevel}]">
              <p>{{ skill.name }} <span class="unlock-level"
                                        v-if="item.level() < skill.unlockLevel">{{ skill.unlockLevel }}级解锁</span>
              </p>
              <p>{{ skill.intro }}</p>
            </div>
          </div>

        </li>
      </ul>
    </div>

    <div v-if="currentContentType === 'memento-box'" class="memento-box">
      <ul>
        <li v-for="(item,index) in mementoList">
          <!--          <img src="" alt="">-->
          <div>
            <p>{{ item.name }} * {{ item.num }}</p>
            <p>{{ item.intro }}</p>
          </div>
        </li>
      </ul>
    </div>

    <div v-if="currentContentType === 'setting-box'" class="setting-box">
      SETTING
    </div>


  </div>


  <div class="foot">
    <ul>
      <li @click="setCurrentContentType('hero-box')"><span>士兵</span></li>
      <li @click="setCurrentContentType('memento-box')"><span>遗物</span></li>
      <li @click="setCurrentContentType('setting-box')"><span>设置</span></li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import {G} from '@/game/gameGenerator';
import {computed, getCurrentInstance, onMounted, reactive, ref} from 'vue';
import {HeroGenerator} from '@/game/generators/HeroGenerator';

const internalInstance = getCurrentInstance();

const g = reactive(new G());
const currentShowingHeroName = ref('');
const currentContentType = ref('hero-box');

g.SET_REF_SELF(g);
const unlockHero = (hero: HeroGenerator) => {
  g.unlockHero(hero);

};
const toUploadAtk = (item: any) => {
  item.UPGRADE_ATK();
  internalInstance?.ctx?.$forceUpdate();

};
const toUploadSpd = (item: any) => {
  item.UPGRADE_SPD();
  internalInstance?.ctx?.$forceUpdate();
};
const setCurrentShowingHeroName = (name) => {
  if (currentShowingHeroName.value === name) {
    currentShowingHeroName.value = '';
    return;
  }
  currentShowingHeroName.value = name;
};
const childAtk = () => {
  g.s_list['child'].ATK_IMMEDIATELY();
};
const mementoList = computed(() => {
  return Object.values(g.memento_list_unique).filter(item => item.num > 0);
});
const setCurrentContentType = (name) => {
  currentContentType.value = name;
};

</script>
<style scoped lang="less">
.head {
  position: sticky;
  top: 0;
  z-index: 2;
  //background-color: var(--color-background);
  height: 40rem;

  .gold {
    color: gold;
    text-shadow: 0.1rem 0.03rem #4f3917;
    text-align: center;
    font-size: 4.8rem;
    font-weight: bolder;
  }

  div.boss-box {
    h4 {
      color: #ff1515;
      text-shadow: 0.3px 0.2px #6e5932;
      text-align: center;
      font-size: 4.8rem;
      font-weight: bolder;
    }

    .boss-img {
      text-align: center;

      img {
        display: inline-block;
        height: 20rem;
        background-color: #38bd68;
        border-radius: .3rem;
      }
    }
  }
}

div.content {

  height: calc(100vh - 40rem - 10rem);
  overflow-y: auto;

  div.hero-box {
    ul {
      li {
        background-color: rgba(0, 0, 0, 0.2);
        opacity: 0.9;
        color: rgba(0, 0, 0, 0.8);
        //background-color: var(--paper-yellow);
        border: 1px solid var(--paper-dark);
        padding: 1rem;
        margin-bottom: 1rem;

        .infos {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          position: relative;

          img {
            width: 10rem;
            height: 10rem;
            margin-right: 2rem;
            background-color: #00bd7e;
          }

          .info-box {
            flex: 1;

            .attr {
              font-size: 12px;
            }

            button {
              right: 0;
              top: 50%;
              transform: translateY(-50%);
              position: absolute;
              outline: none;
              border: none;
              padding: .3rem 1rem;
              background-color: var(--paper-yellow);
            }

            .msg-box {
              position: absolute;
              width: 1rem;
              height: 100%;
              //border: 1px solid red;
              right: 25%;
              top: 0;
            }
          }
        }

        .option-skill-box {
          margin-top: .5rem;
          max-height: 0;
          transition: max-height 0.3s;
          overflow: hidden;

          .attr-option {
            //display: flex;
            //justify-content: space-between;
            //align-items: center;
            border: 1px dashed rgba(0,0,0,0.3);
            padding: 1rem 2rem;
            margin-bottom: 1rem;

            p {
              margin: 0;
              display: flex;

              span:first-child {
                margin-right: 3rem;
              }
            }

            .cost {
              span {
                text-decoration: line-through;
                font-size: 1.2rem;
              }
            }
          }

          .skill {
            opacity: 0.5;
            border-bottom: 1px dashed var(--paper-dark);

            &:last-child {
              border-bottom: none;
            }
          }

          .skill.unlock {
            opacity: 1
          }
        }
      }

      li.unlock {
        opacity: 1;
        background-color: transparent;
        color: #000;

        //background-color: var(--paper-yellow);
      }

      li.showing {
        .option-skill-box {
          max-height: 50rem;
        }
      }
    }
  }

  div.memento-box {
    ul {
      display: grid;
      grid-template-columns: repeat(3, 1fr);

      li {
        padding: .5rem;

        border: 1px dashed var(--paper-dark);

        div {
          color: #181818;
        }
      }
    }
  }

}

.foot {
  position: fixed;
  bottom: 0;
  left: 0;
  background-color: var(--paper-yellow);
  width: 100%;
  height: 10rem;

  ul {
    height: 100%;
    display: flex;
    align-items: stretch;
    justify-content: center;

    li {
      flex: 1;

      background-color: var(--paper-yellow);
      border-top: 1px solid var(--paper-dark);
      border-right: 1px solid var(--paper-dark);
      border-bottom: 1px solid var(--paper-dark);
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;

      span {
        //padding: 2rem;
        font-size: 2.6rem;
        color: #000;
      }

      &:last-child {
        border-right: none;
      }
    }
  }
}
</style>
<style>
.msg {
  animation: msgAnimation 1s ease;
  position: absolute;
  width: max-content;
  text-align: center;
  left: 50%;
  transform: translate(-50%, 100%);
  /*display: flex;*/
  /*flex-direction: column;*/
  /*align-items: center;*/
  /*justify-content: center;*/
  /*text-align: center;*/
  /*top: 50%;*/
  /*left: 50%;*/
  /*transform: translate(-50%, -50%);*/
}

@keyframes msgAnimation {
  0% {
    opacity: 1;
    transform: translate(-50%, 100%);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, 0%);
  }
}

</style>

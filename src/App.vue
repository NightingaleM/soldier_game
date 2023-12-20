<script setup lang="ts">
import { onMounted } from 'vue';
import {RouterLink, RouterView} from 'vue-router';
import {versionCompare} from './units'
import axios from 'axios'


// TODO: 获取版本号获取更新
onMounted(async ()=>{
  // const latestVersion = await axios('/vapi')
  // console.log(latestVersion.data)

})
</script>

<template>

  <header>
<!--    <RouterLink to="/calculateTest">calculateTest</RouterLink>-->
  </header>
  <div class="main">
    <RouterView/>
  </div>
</template>

<style scoped>

</style>

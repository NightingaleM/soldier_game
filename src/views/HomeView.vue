<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'

const reloadAll = () =>{
  localStorage.clear()
  location.reload()
}
</script>

<template>
  <main>
    <RouterLink to="/calculateTest">calculateTest</RouterLink>
    <button @click="reloadAll">重置所有内容</button>
    <!--    <TheWelcome />-->
  </main>
</template>

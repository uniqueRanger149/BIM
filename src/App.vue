<template>
  <div class="app" :class="{ 'dark-mode': isDark }">
    <Loader />
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Loader from './components/Loader.vue'

const isDark = ref(false)

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
</script>

<style>
.app {
  transition: background-color 0.3s ease;
}
</style>

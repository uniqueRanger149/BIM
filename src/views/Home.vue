<template>
  <div>
    <Navbar @toggle-theme="toggleTheme" :is-dark="isDark" />
    <Hero />
    <Gallery :show-view-all="true" />
    <Statistics />
    <Articles :show-view-all="true" />
    <Testimonials />
    <Certificates />
    <ContactForm />
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '../components/Navbar.vue'
import Hero from '../components/Hero.vue'
import Gallery from '../components/Gallery.vue'
import Statistics from '../components/Statistics.vue'
import Articles from '../components/Articles.vue'
import Testimonials from '../components/Testimonials.vue'
import Certificates from '../components/Certificates.vue'
import ContactForm from '../components/ContactForm.vue'
import Footer from '../components/Footer.vue'

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark-mode', isDark.value)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  isDark.value = savedTheme === 'dark'
  if (isDark.value) {
    document.documentElement.classList.add('dark-mode')
  }
})
</script>

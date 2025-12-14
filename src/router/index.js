import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import GalleryArchive from '../views/GalleryArchive.vue'
import ArticlesArchive from '../views/ArticlesArchive.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/gallery',
    name: 'GalleryArchive',
    component: GalleryArchive
  },
  {
    path: '/articles',
    name: 'ArticlesArchive',
    component: ArticlesArchive
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

export default router

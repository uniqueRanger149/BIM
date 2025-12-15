<template>
  <div class="admin-layout">
    <button class="hamburger-menu" @click="sidebarOpen = !sidebarOpen" :class="{ active: sidebarOpen }">
      <span></span>
      <span></span>
      <span></span>
    </button>
    
    <aside class="admin-sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <h2>🎛️ مدیریت</h2>
        <button class="close-sidebar" @click="sidebarOpen = false">✕</button>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin/dashboard" class="nav-item" :class="{ active: isActive('dashboard') }" @click="closeSidebar">
          📊 داشبورد
        </router-link>
        <router-link to="/admin/articles" class="nav-item" :class="{ active: isActive('articles') }" @click="closeSidebar">
          📝 مقالات
        </router-link>
        <router-link to="/admin/gallery" class="nav-item" :class="{ active: isActive('gallery') }" @click="closeSidebar">
          🎨 گالری
        </router-link>
        <router-link to="/admin/testimonials" class="nav-item" :class="{ active: isActive('testimonials') }" @click="closeSidebar">
          ⭐ نظرات
        </router-link>
        <router-link to="/admin/contacts" class="nav-item" :class="{ active: isActive('contacts') }" @click="closeSidebar">
          📧 پیام‌ها
        </router-link>
        <router-link to="/admin/sliders" class="nav-item" :class="{ active: isActive('sliders') }" @click="closeSidebar">
          🎬 اسلایدرها
        </router-link>
        <router-link to="/admin/certificates" class="nav-item" :class="{ active: isActive('certificates') }" @click="closeSidebar">
          📜 گواهینامه‌ها
        </router-link>
        <router-link to="/admin/services" class="nav-item" :class="{ active: isActive('services') }" @click="closeSidebar">
          🎯 خدمات
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-button">
          🚪 خروج
        </button>
      </div>
    </aside>

    <main class="admin-main">
      <header class="admin-header">
        <h1>{{ pageTitle }}</h1>
        <div class="admin-user">
          <span>{{ currentUser?.full_name || 'ادمین' }}</span>
          <button @click="handleLogout" class="user-logout">خروج</button>
        </div>
      </header>
      <div class="admin-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const currentUser = ref(null)
const sidebarOpen = ref(false)

const pageTitle = computed(() => {
  const titles = {
    'AdminDashboard': '📊 داشبورد',
    'AdminArticles': '📝 مقالات',
    'AdminGallery': '🎨 گالری',
    'AdminTestimonials': '⭐ نظرات',
    'AdminContacts': '📧 پیام‌های تماس',
    'AdminSliders': '🎬 اسلایدرها',
    'AdminCertificates': '📜 گواهینامه‌ها و استانداردها'
  }
  return titles[route.name] || 'پنل مدیریت'
})

const isActive = (page) => {
  return route.path.includes(page)
}

const handleLogout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  router.push('/admin/login')
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

onMounted(() => {
  const user = localStorage.getItem('admin_user')
  if (user) {
    currentUser.value = JSON.parse(user)
  }
})
</script>

<style scoped>
.hamburger-menu {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  flex-direction: column;
  gap: 0.4rem;
}

.hamburger-menu span {
  width: 24px;
  height: 3px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger-menu.active span:nth-child(1) {
  transform: rotate(45deg) translate(8px, 8px);
}

.hamburger-menu.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-menu.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

.close-sidebar {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  margin-right: auto;
}

.admin-layout {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.admin-sidebar {
  width: 250px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  color: white;
  overflow-y: auto;
  box-shadow: 4px 0 20px rgba(102, 126, 234, 0.3);
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  font-size: 1.5rem;
  margin: 0;
}

.sidebar-nav {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
}

.nav-item {
  padding: 0.875rem 1.5rem;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  font-size: 0.95rem;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding-right: 2rem;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-left-color: white;
  box-shadow: inset -4px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.logout-button {
  width: 100%;
  padding: 0.75rem;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.logout-button:hover {
  background: #c53030;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #e2e8f0;
}

.admin-header h1 {
  margin: 0;
  font-size: 1.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: #2d3748;
  font-weight: 500;
}

.user-logout {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}

.user-logout:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 87, 108, 0.4);
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.admin-content::-webkit-scrollbar {
  width: 8px;
}

.admin-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

.admin-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

.admin-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

@media (max-width: 768px) {
  .hamburger-menu {
    display: flex;
  }

  .admin-layout {
    flex-direction: column;
  }

  .admin-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 80%;
    max-width: 280px;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
  }

  .admin-sidebar.open {
    transform: translateX(0);
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .close-sidebar {
    display: block;
  }

  .sidebar-nav {
    flex-direction: column;
    overflow-x: visible;
    padding: 0.5rem 0;
  }

  .nav-item {
    border-left: 4px solid transparent;
    border-bottom: none;
    padding: 0.875rem 1.5rem;
    white-space: normal;
  }

  .nav-item.active {
    border-left: 4px solid white;
    border-bottom: none;
    box-shadow: inset -4px 0 8px rgba(0, 0, 0, 0.1);
  }

  .admin-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
    padding-right: 1.5rem;
  }

  .admin-header h1 {
    font-size: 1.25rem;
  }

  .admin-user {
    width: 100%;
    justify-content: space-between;
  }

  .admin-content {
    padding: 1rem;
  }

  /* Overlay for sidebar */
  .admin-sidebar::before {
    content: '';
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  .admin-sidebar.open::before {
    opacity: 1;
    pointer-events: all;
  }
}

@media (max-width: 480px) {
  .hamburger-menu {
    top: 0.5rem;
    left: 0.5rem;
  }

  .admin-header {
    padding: 1rem 1.5rem 1rem 4rem;
  }

  .admin-header h1 {
    font-size: 1rem;
  }

  .admin-user {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .user-logout {
    width: 100%;
    text-align: center;
  }

  .admin-content {
    padding: 0.5rem;
  }

  .nav-item {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }

  .sidebar-header h2 {
    font-size: 1.25rem;
  }
}
</style>

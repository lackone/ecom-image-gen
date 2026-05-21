import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Generate from '../pages/Generate.vue'
import History from '../pages/History.vue'
import Settings from '../pages/Settings.vue'
import Editor from '../pages/Editor.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/generate', name: 'Generate', component: Generate },
  { path: '/history', name: 'History', component: History },
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/editor/:recordId', name: 'Editor', component: Editor },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

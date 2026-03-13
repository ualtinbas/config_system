import { createRouter,
  createWebHistory,
  RouteRecordRaw,
  RouteLocationNormalized,
  NavigationGuardNext } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { auth } from '../firebase'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  if (to.path === '/login' && auth.currentUser) {
    next('/')
    return;
  }

  if (to.matched.some((record: RouteRecordRaw) => record.meta?.requiresAuth) && !auth.currentUser) {
    next('/login')
    return;
  }

  next();
})

export default router

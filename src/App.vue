<template>
  <LoginPanel v-if="!isLoggedIn" @logged-in="handleLoggedIn" />

  <div v-else class="min-h-screen pb-32">
    <header class="sticky top-0 z-50 bg-[#f8fafc]/90 p-6 backdrop-blur-md">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">庫存銷售系統</h1>
          <p class="mt-1 text-xs font-bold tracking-widest text-gray-400">先進先出庫存管理</p>
        </div>
        <button class="rounded-md bg-white px-4 py-3 text-sm font-extrabold text-rose-600 shadow-sm ring-1 ring-rose-100" type="button" @click="handleLogout">
          登出
        </button>
      </div>
    </header>

    <nav class="mx-6 mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex-1 rounded-md py-3 text-sm font-bold transition-all"
        :class="activeTab === tab.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
        type="button"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </nav>

    <main class="px-6">
      <div v-if="initializingProducts" class="rounded-lg bg-white p-6 text-center text-sm font-bold text-gray-400">
        商品載入中...
      </div>
      <component :is="activeComponent" v-else @auth-error="handleAuthError" />
    </main>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, onMounted, ref } from 'vue'
import { clearStoredSession, getStoredSession, isAuthError, logout } from './api'
import { useInventoryStore } from './stores/inventory'
import LoginPanel from './components/LoginPanel.vue'

const SalesView = defineAsyncComponent(() => import('./components/SalesView.vue'))
const InventoryView = defineAsyncComponent(() => import('./components/InventoryView.vue'))
const ProductsView = defineAsyncComponent(() => import('./components/ProductsView.vue'))

const store = useInventoryStore()
const isLoggedIn = ref(Boolean(getStoredSession()))
const activeTab = ref('sales')
const initializingProducts = ref(false)

const tabs = [
  { key: 'sales', label: '銷售列表' },
  { key: 'inventory', label: '庫存紀錄' },
  { key: 'products', label: '商品列表' }
]

const componentMap = {
  sales: SalesView,
  inventory: InventoryView,
  products: ProductsView
}

const activeComponent = computed(() => componentMap[activeTab.value])

async function loadProductsAfterLogin() {
  initializingProducts.value = true
  try {
    await store.loadProducts()
  } catch (error) {
    if (isAuthError(error)) {
      handleAuthError(error.message)
      return
    }

    alert(error.message || '商品載入失敗')
  } finally {
    initializingProducts.value = false
  }
}

async function handleLoggedIn() {
  isLoggedIn.value = true
  activeTab.value = 'sales'
  await loadProductsAfterLogin()
}

async function handleLogout() {
  try {
    await logout()
  } catch (error) {
    alert(error.message || '登出失敗')
  } finally {
    store.reset()
    isLoggedIn.value = false
    activeTab.value = 'sales'
  }
}

async function handleAuthError(message) {
  clearStoredSession()
  store.reset()
  isLoggedIn.value = false
  activeTab.value = 'sales'
  await nextTick()
  alert(message || '登入狀態已失效，請重新登入')
}

onMounted(() => {
  if (isLoggedIn.value) {
    loadProductsAfterLogin()
  }
})
</script>

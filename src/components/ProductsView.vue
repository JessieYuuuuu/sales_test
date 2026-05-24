<template>
  <section class="space-y-6">
    <div class="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
      <h2 class="mb-5 text-xl font-extrabold text-gray-900">新增商品</h2>
      <input v-model="newItemName" class="input-field mb-4" placeholder="商品名稱" type="text" @keyup.enter="addProduct">
      <button class="btn-primary bg-purple-600 shadow-purple-100" type="button" @click="addProduct">新增商品</button>
    </div>

    <div class="flex items-center justify-between">
      <h3 class="px-2 text-xs font-black tracking-widest text-gray-400">商品列表</h3>
      <button class="rounded-md px-3 py-2 text-sm font-bold text-purple-700 hover:bg-purple-50" type="button" @click="fetchProducts(true)">
        重新整理
      </button>
    </div>

    <div v-if="loading" class="rounded-lg bg-white p-6 text-center text-sm font-bold text-gray-400">載入中...</div>
    <div v-else-if="!store.products.length" class="rounded-lg bg-white p-6 text-center text-sm font-bold text-gray-400">
      尚無商品
    </div>

    <div v-else class="grid grid-cols-2 gap-3">
      <div v-for="product in store.products" :key="product[0]" class="rounded-lg border border-gray-100 bg-white p-3 text-center text-sm font-extrabold text-gray-700 shadow-sm">
        {{ product[0] }}
      </div>
    </div>

    <div class="rounded-lg border border-rose-100 bg-rose-50 p-6">
      <h3 class="mb-3 font-extrabold text-rose-900">危險操作</h3>
      <button class="w-full rounded-md border border-rose-200 bg-white py-3 font-bold text-rose-600 active:bg-rose-100" type="button" @click="clearAllData">
        清除全部資料
      </button>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { isAuthError } from '../api'
import { useInventoryStore } from '../stores/inventory'

const emit = defineEmits(['auth-error'])
const store = useInventoryStore()

const loading = ref(false)
const newItemName = ref('')

function handleError(error) {
  if (isAuthError(error)) {
    emit('auth-error', error.message)
    return
  }

  alert(error.message || '操作失敗')
}

async function fetchProducts(force = false) {
  loading.value = true
  try {
    await store.loadProducts(force)
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

async function addProduct() {
  const name = newItemName.value.trim()
  if (!name) return

  loading.value = true
  try {
    await store.addProduct(name)
    newItemName.value = ''
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

async function clearAllData() {
  if (!confirm('確定要清除全部資料？')) return

  loading.value = true
  try {
    await store.clearAll()
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchProducts())
</script>

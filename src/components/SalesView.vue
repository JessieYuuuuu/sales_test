<template>
  <section class="space-y-6">
    <div class="rounded-lg border border-emerald-100 bg-white p-6 shadow-sm">
      <h2 class="mb-5 text-xl font-extrabold text-emerald-700">新增銷售</h2>
      <div class="space-y-4">
        <select v-model="form.name" class="input-field" :disabled="!store.products.length">
          <option v-if="!store.products.length" value="">請先新增商品</option>
          <option v-for="product in store.products" :key="product[0]" :value="product[0]">
            {{ product[0] }}
          </option>
        </select>
        <div class="flex gap-4">
          <input v-model="form.revenue" class="input-field font-bold text-emerald-600" placeholder="銷售收入" type="number">
          <input v-model="form.qty" class="input-field" min="1" placeholder="數量" type="number">
        </div>
        <button class="btn-primary bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700" type="button" @click="submitSale">
          送出銷售
        </button>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="px-2 text-xs font-black tracking-widest text-gray-400">銷售紀錄</h3>
        <button class="rounded-md px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50" type="button" @click="fetchSales(true)">
          重新整理
        </button>
      </div>

      <div v-if="loading" class="rounded-lg bg-white p-6 text-center text-sm font-bold text-gray-400">載入中...</div>
      <div v-else-if="!store.sales.length" class="rounded-lg bg-white p-6 text-center text-sm font-bold text-gray-400">
        尚無銷售紀錄
      </div>

      <div
        v-for="sale in reversedSales"
        v-else
        :key="sale[0]"
        class="rounded-lg border p-5 shadow-sm transition-colors"
        :class="saleRowClass(sale[8] || 'Pending')"
      >
        <div class="mb-3 flex items-start justify-between gap-3">
          <div class="min-w-0 text-lg font-black text-gray-900">
            {{ sale[2] }} <span class="text-emerald-500">x {{ safeNum(sale[3]) }}</span>
          </div>
          <select
            class="rounded-md px-2 py-1 text-xs font-black ring-1 transition-colors"
            :class="saleStatusClass(sale[8] || 'Pending')"
            :value="sale[8] || 'Pending'"
            @change="updateSaleStatus(sale[0], $event.target.value)"
          >
            <option v-for="status in statuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
          <div>
            <div class="text-xs font-bold text-gray-400">單件毛利</div>
            <div class="text-lg font-black" :class="profitClass(safeNum(sale[6]))">${{ safeNum(sale[6]).toFixed(1) }}</div>
          </div>
          <div class="text-right">
            <div class="text-xs font-bold text-gray-400">總毛利</div>
            <div class="text-2xl font-black" :class="profitClass(safeNum(sale[7]), true)">${{ safeNum(sale[7]).toFixed(0) }}</div>
          </div>
        </div>
        <div class="mt-2 flex items-center justify-between text-xs font-bold tracking-widest text-gray-300">
          <span>銷售收入：${{ safeNum(sale[5]) }}</span>
          <span>訂單編號：{{ sale[0] }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { isAuthError } from '../api'
import { useInventoryStore } from '../stores/inventory'

const emit = defineEmits(['auth-error'])
const store = useInventoryStore()

const loading = ref(false)
const form = reactive({
  name: '',
  revenue: '',
  qty: '1'
})
const statuses = [
  { value: 'Pending', label: '待處理' },
  { value: 'Completed', label: '已完成' },
  { value: 'Cancelled', label: '已取消' },
  { value: 'Refunded', label: '已退款' }
]

const reversedSales = computed(() => [...store.sales].reverse())
const productNames = computed(() => store.products.map((product) => product[0]).filter(Boolean))

watch(productNames, (names) => {
  if (!names.length) {
    form.name = ''
    return
  }

  if (!names.includes(form.name)) {
    form.name = names[0]
  }
}, { immediate: true })

function safeNum(value) {
  const numberValue = parseFloat(value)
  return Number.isNaN(numberValue) ? 0 : numberValue
}

function profitClass(value, strong = false) {
  if (value >= 0) return strong ? 'text-emerald-600' : 'text-emerald-500'
  return 'text-rose-500'
}

function saleRowClass(status) {
  const classes = {
    Pending: 'border-amber-200 bg-amber-50/70',
    Completed: 'border-emerald-200 bg-emerald-50/70',
    Cancelled: 'border-rose-200 bg-rose-50/70',
    Refunded: 'border-sky-200 bg-sky-50/70'
  }

  return classes[status] || 'border-gray-100 bg-white'
}

function saleStatusClass(status) {
  const classes = {
    Pending: 'bg-amber-100 text-amber-800 ring-amber-200',
    Completed: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    Cancelled: 'bg-rose-100 text-rose-800 ring-rose-200',
    Refunded: 'bg-sky-100 text-sky-800 ring-sky-200'
  }

  return classes[status] || 'bg-gray-100 text-gray-700 ring-gray-200'
}

function handleError(error) {
  if (isAuthError(error)) {
    emit('auth-error', error.message)
    return
  }

  alert(error.message || '操作失敗')
}

async function fetchSales(force = false) {
  loading.value = true
  try {
    await store.loadSales(force)
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

async function submitSale() {
  if (!form.name || !form.revenue || !form.qty) {
    alert('請選擇商品並填寫收入與數量')
    return
  }

  loading.value = true
  try {
    await store.createSale({
      name: form.name,
      revenue: form.revenue,
      qty: form.qty
    })
    form.revenue = ''
    form.qty = '1'
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

async function updateSaleStatus(orderId, status) {
  loading.value = true
  try {
    await store.updateStatus({ orderId, status })
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchSales())
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
      <h2 class="mb-5 text-xl font-extrabold text-gray-900">新增庫存</h2>
      <div class="space-y-4">
        <select v-model="form.name" class="input-field" :disabled="!store.products.length">
          <option v-if="!store.products.length" value="">請先新增商品</option>
          <option v-for="product in store.products" :key="product[0]" :value="product[0]">
            {{ product[0] }}
          </option>
        </select>
        <div class="flex gap-4">
          <input v-model="form.totalCost" class="input-field" placeholder="總成本" type="number">
          <input v-model="form.qty" class="input-field" min="1" placeholder="數量" type="number">
        </div>
        <button class="btn-primary" type="button" @click="submitInbound">送出入庫</button>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="px-2 text-xs font-black tracking-widest text-gray-400">庫存批次</h3>
        <button class="rounded-md px-3 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50" type="button" @click="fetchInventory(true)">
          重新整理
        </button>
      </div>

      <div v-if="loading" class="rounded-lg bg-white p-6 text-center text-sm font-bold text-gray-400">載入中...</div>
      <div v-else-if="!groupedInventory.length" class="rounded-lg bg-white p-6 text-center text-sm font-bold text-gray-400">
        尚無庫存紀錄
      </div>

      <div v-for="item in groupedInventory" v-else :key="item.name" class="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-between border-b border-gray-100 pb-2">
          <div class="text-xl font-black text-gray-900">{{ item.name }}</div>
          <div class="text-right">
            <span class="text-2xl font-black text-indigo-600">{{ item.totalQty }}</span>
            <span class="text-xs font-black text-indigo-300"> 件</span>
          </div>
        </div>
        <div class="space-y-2">
          <div v-for="(batch, index) in item.batches" :key="`${item.name}-${index}`" class="flex items-center justify-between py-1 text-sm">
            <span class="font-bold text-gray-400">
              批次 {{ index + 1 }}
              <span class="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">單位成本 ${{ batch.unitCost.toFixed(1) }}</span>
            </span>
            <span class="font-black text-gray-700">{{ batch.qty }} 件</span>
          </div>
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
  totalCost: '',
  qty: ''
})
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

const groupedInventory = computed(() => {
  const grouped = {}

  store.inventory.forEach((row) => {
    const name = row[0]
    const unitCost = safeNum(row[1])
    const qty = safeNum(row[2])

    if (qty <= 0) return
    if (!grouped[name]) grouped[name] = []
    grouped[name].push({ unitCost, qty })
  })

  return Object.entries(grouped).map(([name, batches]) => ({
    name,
    batches,
    totalQty: batches.reduce((total, batch) => total + batch.qty, 0)
  }))
})

function safeNum(value) {
  const numberValue = parseFloat(value)
  return Number.isNaN(numberValue) ? 0 : numberValue
}

function handleError(error) {
  if (isAuthError(error)) {
    emit('auth-error', error.message)
    return
  }

  alert(error.message || '操作失敗')
}

async function fetchInventory(force = false) {
  loading.value = true
  try {
    await store.loadInventory(force)
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

async function submitInbound() {
  if (!form.name || !form.totalCost || !form.qty) {
    alert('請選擇商品並填寫總成本與數量')
    return
  }

  loading.value = true
  try {
    await store.inbound({
      name: form.name,
      totalCost: form.totalCost,
      qty: form.qty
    })
    form.totalCost = ''
    form.qty = ''
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchInventory())
</script>

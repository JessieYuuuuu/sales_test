<template>
  <main class="flex min-h-screen items-center justify-center px-6">
    <form class="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm" @submit.prevent="submit">
      <div class="mb-6">
        <h1 class="text-2xl font-extrabold text-gray-900">庫存銷售系統</h1>
        <p class="mt-1 text-sm font-semibold text-gray-400">請輸入密碼登入</p>
      </div>

      <label class="mb-2 block text-xs font-black tracking-widest text-gray-400" for="password">
        密碼
      </label>
      <input id="password" v-model="password" autocomplete="current-password" class="input-field" placeholder="請輸入登入密碼" type="password">

      <p v-if="errorMessage" class="mt-3 text-sm font-bold text-rose-600">{{ errorMessage }}</p>

      <button class="btn-primary mt-6" :disabled="loading" type="submit">
        {{ loading ? '登入中...' : '登入' }}
      </button>
    </form>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { login } from '../api'

const emit = defineEmits(['logged-in'])

const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function submit() {
  const key = password.value.trim()
  if (!key) {
    errorMessage.value = '請輸入密碼'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await login(key)
    password.value = ''
    emit('logged-in')
  } catch (error) {
    errorMessage.value = error.message || '登入失敗'
  } finally {
    loading.value = false
  }
}
</script>

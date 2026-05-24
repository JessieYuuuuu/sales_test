import { defineStore } from 'pinia'
import { postWithSession } from '../api'

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    products: [],
    inventory: [],
    sales: [],
    loaded: {
      products: false,
      inventory: false,
      sales: false
    }
  }),
  actions: {
    reset() {
      this.products = []
      this.inventory = []
      this.sales = []
      this.loaded = {
        products: false,
        inventory: false,
        sales: false
      }
    },
    async loadProducts(force = false) {
      if (this.loaded.products && !force) return this.products

      const data = await postWithSession('getProducts')
      this.products = data.products || []
      this.loaded.products = true
      return this.products
    },
    async loadInventory(force = false) {
      if (this.loaded.inventory && !force) return this.inventory

      const data = await postWithSession('getInventory')
      this.inventory = data.inventory || []
      this.loaded.inventory = true
      return this.inventory
    },
    async loadSales(force = false) {
      if (this.loaded.sales && !force) return this.sales

      const data = await postWithSession('getSales')
      this.sales = data.sales || []
      this.loaded.sales = true
      return this.sales
    },
    async addProduct(name) {
      const data = await postWithSession('addProduct', { name })
      this.products = data.products || []
      this.loaded.products = true
      return this.products
    },
    async inbound(payload) {
      const data = await postWithSession('inbound', payload)
      this.inventory = data.inventory || []
      this.loaded.inventory = true
      return this.inventory
    },
    async createSale(payload) {
      const data = await postWithSession('sales', payload)
      this.inventory = data.inventory || []
      this.sales = data.sales || []
      this.loaded.inventory = true
      this.loaded.sales = true
      return data
    },
    async updateStatus(payload) {
      const data = await postWithSession('updateStatus', payload)
      this.sales = data.sales || []
      this.loaded.sales = true
      return this.sales
    },
    async clearAll() {
      const data = await postWithSession('clearAll')
      this.products = data.products || []
      this.inventory = data.inventory || []
      this.sales = data.sales || []
      this.loaded.products = true
      this.loaded.inventory = true
      this.loaded.sales = true
      return data
    }
  }
})

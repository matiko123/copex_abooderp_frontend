import axios from 'axios'
import { ABS_MEDIA_API_URL_2 } from  '@/config/config.js'


const ordersUrl = () => `${ABS_MEDIA_API_URL_2}/orders`

export const orderService = {
  list(params = {}) {
    return axios.get(ordersUrl(), { params })
  },
  get(id: number) {
    return axios.get(`${ordersUrl()}/${id}`)
  },
  create(payload: any) {
    return axios.post(ordersUrl(), payload)
  },
  update(id: number, payload: any) {
    return axios.put(`${ordersUrl()}/${id}`, payload)
  },
  remove(id: number) {
    return axios.delete(`${ordersUrl()}/${id}`)
  },
  listItems(orderId: number) {
    return axios.get(`${ordersUrl()}/${orderId}/items`)
  },
  
  // Fetch order types from backend
  getOrderTypes() {
    return axios.get(`${ABS_MEDIA_API_URL_2}/orders/order-types`)
  },
  
  // Fetch order statuses from backend
  getOrderStatuses() {
    return axios.get(`${ABS_MEDIA_API_URL_2}/orders/order-statuses`)
  }
}

export default orderService
